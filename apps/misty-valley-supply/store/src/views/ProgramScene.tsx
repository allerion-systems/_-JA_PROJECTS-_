import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  MODULE_GSF, MODULE_L_FT, MODULE_W_FT, program, programStories, type ProgramParams,
} from "@/programMath";
import { exportGroupAsGlb } from "@/exportModel";
import {
  applyAnisotropy, contactShadow, disposeObject, enhanceRenderer, fitShadowCamera,
  makeComposer, makeGrassDisc, makeGroundPlane, makeSky, sharedRoughnessMap,
  tuneSunShadow, type ComposerRig,
} from "@/sceneQuality";

/* ------------------------------------------------------------------------
   Modular massing study — NOT architecture. Stacked 14×62 module boxes
   with slight reveals so the modular grain reads, a window band per
   story, ground plane and an entry canopy block. Clean monochrome-plus-
   glass. Same lifecycle discipline as ShedScene: renderer/camera/lights
   build once, the parametric group is rebuilt and disposed on every
   change, camera re-fits via frameTo, wheel/touch never trap the page,
   and camera tweens snap under prefers-reduced-motion.
   ---------------------------------------------------------------------- */

const GOLD = 0xfac400;      // --safety-hi, the one brand accent
const STORY_H = 11;         // floor-to-floor, ft
const PLINTH_H = 0.6;
const GAP = 0.5;            // reveal between module boxes
const PITCH_X = MODULE_W_FT + GAP;
const CORRIDOR = 6;         // gap between double-loaded rows

const reducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Fly = {
  fromPos: THREE.Vector3; toPos: THREE.Vector3;
  fromTgt: THREE.Vector3; toTgt: THREE.Vector3;
  start: number; dur: number;
};

type Core = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  sun: THREE.DirectionalLight;
  group: THREE.Group | null;
  bg: THREE.Texture;
  raf: number;
  ro: ResizeObserver;
  fitR: number;
  fitC: THREE.Vector3;
  fly: Fly | null;
  post: ComposerRig | null;
};

/** Window band: glass with a mullion rhythm; repeats along the facade. */
function makeGlassTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 32;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 32);
  grad.addColorStop(0, "#4a6a88");
  grad.addColorStop(1, "#2c4560");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 32);
  g.fillStyle = "#1d2f42";
  g.fillRect(0, 0, 3, 32);       // mullion
  g.fillRect(31, 0, 2, 32);      // minor mullion
  g.fillStyle = "#e8edf2";
  g.fillRect(0, 0, 64, 2);       // head trim
  g.fillRect(0, 30, 64, 2);      // sill
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

/** Apparatus-bay doors for the emergency type. */
function makeBayDoorTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c7c9cc";
  g.fillRect(0, 0, 64, 64);
  g.fillStyle = "#8fa7ba";
  g.fillRect(8, 12, 48, 52);     // the door
  g.fillStyle = "#75909f";
  for (let y = 20; y < 64; y += 10) g.fillRect(8, y, 48, 2); // panel lines
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function disposeGroup(group: THREE.Group) {
  group.traverse(o => {
    const light = o as THREE.DirectionalLight;
    if (light.isLight) {
      if (light.shadow?.map) { light.shadow.map.dispose(); light.shadow.map = null; }
      light.dispose();
      return;
    }
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    const one = (m: THREE.Material) => {
      const map = (m as THREE.MeshStandardMaterial).map;
      if (map) map.dispose();
      m.dispose();
    };
    if (Array.isArray(mat)) mat.forEach(one);
    else if (mat) one(mat as THREE.Material);
  });
}

function focusBox(group: THREE.Group): THREE.Box3 {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();
  group.traverse(o => {
    if (o.userData.noFit) return;
    if ((o as THREE.Mesh).isMesh) box.expandByObject(o);
  });
  return box;
}

function frameTo(core: Core, dur: number) {
  if (!(core.fitR > 0)) return;
  const cam = core.camera, ctl = core.controls;
  const vFov = THREE.MathUtils.degToRad(cam.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(cam.aspect, 0.3));
  let dist = (core.fitR * 1.1) / Math.sin(Math.min(vFov, hFov) / 2);
  dist = Math.min(Math.max(dist, ctl.minDistance), ctl.maxDistance);
  const dir = cam.position.clone().sub(ctl.target);
  if (dir.lengthSq() < 1e-4) dir.set(0.8, 0.5, 1);
  dir.normalize();
  const pos = core.fitC.clone().addScaledVector(dir, dist);
  if (dur <= 0 || reducedMotion()) {
    cam.position.copy(pos);
    ctl.target.copy(core.fitC);
    ctl.update();
  } else {
    core.fly = {
      fromPos: cam.position.clone(), toPos: pos,
      fromTgt: ctl.target.clone(), toTgt: core.fitC.clone(),
      start: performance.now(), dur,
    };
  }
}

/* ---- massing layout: exact module placements per story/row -------------- */

type Extent = { story: number; row: number; n: number; xStart: number; z: number };

function layout(p: ProgramParams): { extents: Extent[]; rows: number; fullW: number } {
  const { modules } = program(p);
  const stories = programStories(p);
  const perStory = Math.ceil(modules / stories);
  const rows = perStory > 12 ? 2 : 1;
  const perRow = Math.ceil(perStory / rows);
  const fullW = perRow * PITCH_X - GAP;
  const rowZ = (r: number) => (rows === 1 ? 0 : (r === 0 ? 1 : -1) * (MODULE_L_FT + CORRIDOR) / 2);
  const extents: Extent[] = [];
  let remaining = modules;
  for (let s = 0; s < stories; s++) {
    let inStory = Math.min(perStory, remaining);
    remaining -= inStory;
    for (let r = 0; r < rows && inStory > 0; r++) {
      const n = Math.min(perRow, inStory);
      inStory -= n;
      extents.push({ story: s, row: r, n, xStart: -fullW / 2, z: rowZ(r) });
    }
  }
  return { extents, rows, fullW };
}

function buildWorld(p: ProgramParams): THREE.Group {
  const group = new THREE.Group();
  const isEms = p.type === "emergency";
  const { extents, fullW } = layout(p);
  const stories = programStories(p);

  // ---- materials: monochrome plus glass --------------------------------
  const rough = sharedRoughnessMap(); // module-cached — never disposed here
  const skin = new THREE.MeshStandardMaterial({ color: 0xe3e4e6, roughness: 0.88, roughnessMap: rough });
  const skinAlt = new THREE.MeshStandardMaterial({ color: 0xd6d8db, roughness: 0.88, roughnessMap: rough });
  const parapetMat = new THREE.MeshStandardMaterial({ color: 0xb9bcc1, roughness: 0.8 });
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x9fa2a6, roughness: 0.95 });
  const glassTex = makeGlassTexture();
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.45, metalness: 0.5, envMapIntensity: 0.8 });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00, envMapIntensity: 0.8 });
  const plazaMat = new THREE.MeshStandardMaterial({ color: 0xbfc1c2, roughness: 1 });
  const doorGlass = new THREE.MeshStandardMaterial({ color: 0x28405a, roughness: 0.1, metalness: 0.5, envMapIntensity: 0.9 });

  const M = new THREE.Matrix4();
  const y0 = PLINTH_H;

  // footprint of everything placed, for ground dressing
  const depth = extents.some(e => e.row === 1) || isEms
    ? MODULE_L_FT * 2 + CORRIDOR : MODULE_L_FT;

  // ---- ground: grass disc, plaza pad, contact shadow -------------------
  group.add(makeGrassDisc(Math.max(fullW, depth) * 1.5 + 60, "#86a06a"));

  const plaza = new THREE.Mesh(new THREE.BoxGeometry(fullW + 40, 0.16, depth + 46), plazaMat);
  plaza.position.y = 0.08;
  plaza.receiveShadow = true;
  plaza.userData.noFit = true;
  group.add(plaza);

  group.add(contactShadow(fullW + 34, depth + 34, { opacity: 0.8, y: 0.34 }));

  const addParapet = (w: number, x: number, yTop: number, z: number, d: number) => {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.7, 0.5, d + 0.7), parapetMat);
    cap.position.set(x, yTop + 0.25, z);
    cap.castShadow = true;
    group.add(cap);
  };

  const addBand = (w: number, x: number, y: number, z: number) => {
    const tex = glassTex.clone();
    tex.needsUpdate = true;
    tex.repeat.set(Math.max(2, Math.round(w / 4)), 1); // a mullion every ~4 ft
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(w, 3.4, 0.14),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.15, metalness: 0.35, envMapIntensity: 0.9 }),
    );
    band.position.set(x, y, z);
    group.add(band);
  };

  if (!isEms) {
    // ---- generic stacked bar(s): one InstancedMesh of module boxes ------
    const total = extents.reduce((s, e) => s + e.n, 0);
    const boxGeo = new THREE.BoxGeometry(MODULE_W_FT - GAP, STORY_H - 0.35, MODULE_L_FT - GAP);
    const boxes = new THREE.InstancedMesh(boxGeo, skin, total);
    let i = 0;
    for (const e of extents) {
      for (let k = 0; k < e.n; k++) {
        M.makeTranslation(e.xStart + PITCH_X * k + MODULE_W_FT / 2, y0 + e.story * STORY_H + STORY_H / 2, e.z);
        boxes.setMatrixAt(i++, M);
      }
    }
    boxes.instanceMatrix.needsUpdate = true;
    boxes.castShadow = true;
    boxes.receiveShadow = true;
    group.add(boxes);

    // plinth under each row's ground-story extent
    for (const e of extents.filter(x => x.story === 0)) {
      const w = e.n * PITCH_X - GAP;
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, PLINTH_H, MODULE_L_FT + 1.2), plinthMat);
      plinth.position.set(e.xStart + w / 2, PLINTH_H / 2, e.z);
      group.add(plinth);
    }

    // window band per story on each row's outer facade(s)
    const rows = extents.some(e => e.row === 1) ? 2 : 1;
    for (const e of extents) {
      const w = e.n * PITCH_X - GAP - 1;
      const x = e.xStart + (e.n * PITCH_X - GAP) / 2;
      const y = y0 + e.story * STORY_H + STORY_H * 0.55;
      const front = e.z + MODULE_L_FT / 2 + 0.09;
      const back = e.z - MODULE_L_FT / 2 - 0.09;
      if (rows === 1) { addBand(w, x, y, front); addBand(w, x, y, back); }
      else if (e.row === 0) addBand(w, x, y, front);
      else addBand(w, x, y, back);
    }

    // parapet over the top-most extent of each row
    const byRow = new Map<number, Extent>();
    for (const e of extents) {
      const cur = byRow.get(e.row);
      if (!cur || e.story > cur.story) byRow.set(e.row, e);
    }
    for (const e of byRow.values()) {
      const w = e.n * PITCH_X - GAP;
      addParapet(w, e.xStart + w / 2, y0 + (e.story + 1) * STORY_H, e.z, MODULE_L_FT);
    }

    // ---- entry canopy block + glazed entry at the front, center --------
    const frontZ = (extents.some(e => e.row === 1) ? (MODULE_L_FT + CORRIDOR) / 2 : 0) + MODULE_L_FT / 2;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(26, 0.8, 11), canopyMat);
    canopy.position.set(0, y0 + STORY_H - 1.2, frontZ + 5);
    canopy.castShadow = true;
    group.add(canopy);
    [-10, 10].forEach(cx => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, y0 + STORY_H - 1.2, 10), canopyMat);
      col.position.set(cx, (y0 + STORY_H - 1.2) / 2, frontZ + 8.5);
      col.castShadow = true;
      group.add(col);
    });
    const entry = new THREE.Mesh(new THREE.BoxGeometry(14, STORY_H - 2.6, 0.4), doorGlass);
    entry.position.set(0, y0 + (STORY_H - 2.6) / 2, frontZ + 0.12);
    group.add(entry);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(26, 0.28, 11.2), goldMat);
    strip.position.set(0, y0 + STORY_H - 0.72, frontZ + 5);
    group.add(strip);
  } else {
    // ---- emergency: taller apparatus bays up front, quarters behind ----
    const bays = p.bays;
    const bayH = 16;
    const bayW = bays * PITCH_X - GAP;
    const bayZ = (MODULE_L_FT + CORRIDOR) / 2;
    const bayGeo = new THREE.BoxGeometry(MODULE_W_FT - GAP, bayH, MODULE_L_FT - GAP);
    const bayBoxes = new THREE.InstancedMesh(bayGeo, skinAlt, bays);
    for (let k = 0; k < bays; k++) {
      M.makeTranslation(-bayW / 2 + PITCH_X * k + MODULE_W_FT / 2, y0 + bayH / 2, bayZ);
      bayBoxes.setMatrixAt(k, M);
    }
    bayBoxes.instanceMatrix.needsUpdate = true;
    bayBoxes.castShadow = true;
    bayBoxes.receiveShadow = true;
    group.add(bayBoxes);
    addParapet(bayW, 0, y0 + bayH, bayZ, MODULE_L_FT);

    // apparatus doors across the bay front
    const doorTex = makeBayDoorTexture();
    doorTex.repeat.set(bays, 1);
    const doors = new THREE.Mesh(
      new THREE.BoxGeometry(bayW - 0.8, bayH * 0.72, 0.14),
      new THREE.MeshStandardMaterial({ map: doorTex, roughness: 0.6, metalness: 0.25 }),
    );
    doors.position.set(0, y0 + bayH * 0.38, bayZ + MODULE_L_FT / 2 + 0.09);
    group.add(doors);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(bayW, 0.3, 0.3), goldMat);
    strip.position.set(0, y0 + bayH * 0.76, bayZ + MODULE_L_FT / 2 + 0.12);
    group.add(strip);

    // quarters: standard modules in a row behind the bays
    const qn = Math.max(1, Math.ceil(p.quartersGsf / MODULE_GSF));
    const qW = qn * PITCH_X - GAP;
    const qZ = -bayZ;
    const qGeo = new THREE.BoxGeometry(MODULE_W_FT - GAP, STORY_H - 0.35, MODULE_L_FT - GAP);
    const qBoxes = new THREE.InstancedMesh(qGeo, skin, qn);
    for (let k = 0; k < qn; k++) {
      M.makeTranslation(-qW / 2 + PITCH_X * k + MODULE_W_FT / 2, y0 + STORY_H / 2, qZ);
      qBoxes.setMatrixAt(k, M);
    }
    qBoxes.instanceMatrix.needsUpdate = true;
    qBoxes.castShadow = true;
    qBoxes.receiveShadow = true;
    group.add(qBoxes);
    addParapet(qW, 0, y0 + STORY_H, qZ, MODULE_L_FT);
    addBand(qW - 1, 0, y0 + STORY_H * 0.55, qZ - MODULE_L_FT / 2 - 0.09);

    // shared plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(bayW, qW) + 1.2, PLINTH_H, MODULE_L_FT * 2 + CORRIDOR + 1.2), plinthMat);
    plinth.position.set(0, PLINTH_H / 2, 0);
    group.add(plinth);
  }

  void stories; // stories drive layout(); referenced for clarity
  return group;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export type ProgramSceneProps = { params: ProgramParams };

export default function ProgramScene({ params }: ProgramSceneProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<Core | null>(null);
  const [hint, setHint] = React.useState(true);

  React.useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    // CAD-grade output: ACES filmic + sRGB + PCF-soft shadows (shared helper)
    enhanceRenderer(renderer, 1.05);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = makeSky();
    scene.background = bg;
    scene.fog = new THREE.Fog(0xdde5ee, 400, 2400);

    // real specular for the glass bands: PMREM room environment, built once —
    // OUTSIDE the disposable group, so option clicks never touch it
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.22; // specular sheen only — the sun models the form

    // soft-edged textured ground that melts into the horizon haze
    const ground = makeGroundPlane({ radius: 2300, base: "#93a07c", horizon: "#e7e9e2" });
    scene.add(ground);

    // lights live here, once — never inside the disposable group
    const ambient = new THREE.AmbientLight(0xe8eef8, 0.4);
    const hemi = new THREE.HemisphereLight(0xd2ddec, 0x8b8a78, 0.45);
    scene.add(ambient, hemi);

    const sun = new THREE.DirectionalLight(0xfff2dc, 2.8);
    sun.position.set(-80, 120, 40);
    sun.castShadow = true;
    tuneSunShadow(sun); // 2048 desktop / 1024 coarse + tuned bias
    scene.add(sun, sun.target);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 5000);
    camera.position.set(120, 70, 150);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.5;
    controls.minDistance = 30;
    controls.maxDistance = 900;

    // never trap the page: Ctrl/Cmd wheel zooms, one finger scrolls past,
    // two fingers orbit + pinch (ShedScene's touch rules)
    controls.enableZoom = false;
    controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };
    renderer.domElement.style.touchAction = "pan-y";
    const onWheel = (e: WheelEvent) => { controls.enableZoom = e.ctrlKey || e.metaKey; };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") controls.enableZoom = true;
      setHint(false);
    };
    el.addEventListener("wheel", onWheel, { capture: true, passive: true });
    el.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });

    // optional SSAO composer — desktop only; mobile keeps plain render
    const post = makeComposer(renderer, scene, camera);

    const core: Core = { renderer, scene, camera, controls, sun, group: null, bg, raf: 0, ro: null as unknown as ResizeObserver, fitR: 0, fitC: new THREE.Vector3(), fly: null, post };

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      post?.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameTo(core, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    core.ro = ro;

    const loop = () => {
      core.raf = requestAnimationFrame(loop);
      if (core.fly) {
        const f = core.fly;
        const t = Math.min(1, (performance.now() - f.start) / f.dur);
        const e = smooth(t);
        camera.position.lerpVectors(f.fromPos, f.toPos, e);
        controls.target.lerpVectors(f.fromTgt, f.toTgt, e);
        if (t >= 1) core.fly = null;
      }
      controls.update();
      if (core.post) core.post.composer.render();
      else renderer.render(scene, camera);
    };
    loop();
    coreRef.current = core;

    return () => {
      cancelAnimationFrame(core.raf);
      ro.disconnect();
      el.removeEventListener("wheel", onWheel, { capture: true });
      el.removeEventListener("pointerdown", onPointerDown, { capture: true });
      controls.dispose();
      if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; }
      sun.dispose();
      ambient.dispose();
      hemi.dispose();
      if (core.group) { scene.remove(core.group); disposeGroup(core.group); core.group = null; }
      scene.remove(ground);
      disposeObject(ground);
      post?.dispose();
      scene.environment = null;
      envRT.dispose();
      bg.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      coreRef.current = null;
    };
  }, []);

  const key = JSON.stringify(params);
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    const first = !core.group;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const group = buildWorld(params);
    core.scene.add(group);
    core.group = group;

    // the persistent sun re-covers the new footprint with its one shadow map
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    // sun rides high left so the cast shadow spills visibly to the right
    core.sun.position.set(-(sphere.radius * 0.9 + 40), sphere.radius + 80, sphere.radius * 0.35 + 20);
    fitShadowCamera(core.sun, group, 1.3);
    applyAnisotropy(core.renderer, group); // crisp textures at grazing angles

    core.controls.maxDistance = Math.max(300, sphere.radius * 6);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const flyTo = (preset: "street" | "aerial") => {
    const core = coreRef.current;
    if (!core || !(core.fitR > 0)) return;
    const r = core.fitR, c = core.fitC;
    const tgt = preset === "street"
      ? new THREE.Vector3(c.x, Math.min(c.y, 24), c.z)
      : c.clone();
    const pos = preset === "street"
      ? new THREE.Vector3(c.x + r * 0.55, 6, c.z + r * 1.75)
      : new THREE.Vector3(c.x + r * 1.1, r * 2.1, c.z + r * 1.35);
    if (reducedMotion()) {
      core.camera.position.copy(pos);
      core.controls.target.copy(tgt);
      core.controls.update();
      return;
    }
    core.fly = {
      fromPos: core.camera.position.clone(), toPos: pos,
      fromTgt: core.controls.target.clone(), toTgt: tgt,
      start: performance.now(), dur: 650,
    };
  };

  const { modules, craneWeeks } = program(params);
  const stories = programStories(params);
  const btnCls = "rounded-[5px] border border-white/25 bg-[hsl(var(--marine))]/80 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-[hsl(var(--marine))]";
  return (
    <div className="relative h-full w-full">
      <div
        ref={mountRef}
        className="h-full w-full"
        role="img"
        aria-label={`Massing study — ${params.type}, ${stories} ${stories === 1 ? "story" : "stories"}, ${modules} modules, about ${craneWeeks} crane-set ${craneWeeks === 1 ? "week" : "weeks"}`}
      />
      <div className="absolute left-2 top-2 flex gap-1.5">
        <button type="button" className={btnCls} onClick={() => flyTo("street")}>Street</button>
        <button type="button" className={btnCls} onClick={() => flyTo("aerial")}>Aerial</button>
      </div>
      <div className="absolute bottom-2 right-2">
        <button
          type="button"
          className={btnCls}
          title="Download .glb — opens in Omniverse, Blender, SketchUp, Revit"
          onClick={() => { const g = coreRef.current?.group; if (g) exportGroupAsGlb(g, "mvs-program.glb"); }}
        >
          3D file
        </button>
      </div>
      <div className="pointer-events-none absolute right-2 top-2 rounded-[4px] bg-[hsl(var(--marine))]/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/85 backdrop-blur-sm">
        Massing study — not architecture
      </div>
      <div
        aria-hidden
        className={"pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[hsl(var(--marine))]/70 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm transition-opacity duration-700 " + (hint ? "opacity-100" : "opacity-0")}
      >
        Drag to spin · two fingers to zoom
      </div>
    </div>
  );
}
