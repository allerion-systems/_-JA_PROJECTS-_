import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { exportGroupAsGlb } from "@/exportModel";
import {
  applyAnisotropy, contactShadow, enhanceRenderer, fitShadowCamera, makeComposer,
  makeSky, sharedRoughnessMap, tuneSunShadow, type ComposerRig,
} from "@/sceneQuality";

/* ------------------------------------------------------------------------
   Parametric 3D roof-screen scene. Feet are world units. The screen runs
   along the X axis, centered at the origin; the RTUs sit behind it (-Z) and
   the camera starts in front (+Z). Renderer, camera and controls are built
   once; the parametric geometry (deck, RTUs, posts, rails, ribs, sun) is
   rebuilt — and the old copy disposed — whenever the configuration changes.
   ---------------------------------------------------------------------- */

export type ScreenSceneProps = {
  lf: number;        // screen length, linear feet
  heightFt: number;  // screen height above deck
  bayFt: number;     // post spacing
  frameOnly: boolean;
  gauge: number;     // 26 / 29 / 22(perf) / 0 when frame only
};

const RIB_MODULE = 7.2 / 12; // 7.2-inch panel module, in feet

// Brand colors (from the CSS tokens, pre-converted to hex)
const NAVY = 0x142f63;       // --marine  221 74% 24%
const GOLD = 0xfac400;       // --safety-hi 47 100% 49%

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
  fitR: number;            // bounding-sphere radius of the current screen
  fitC: THREE.Vector3;     // …and its center
  fly: Fly | null;
  post: ComposerRig | null;
};

const smooth = (x: number) => x * x * (3 - 2 * x);

function disposeGroup(group: THREE.Group) {
  group.traverse(o => {
    // belt-and-braces: lights never live in this group any more, but if one
    // sneaks back in, free its shadow map instead of orphaning it on the GPU
    const light = o as THREE.DirectionalLight;
    if (light.isLight) {
      if (light.shadow?.map) { light.shadow.map.dispose(); light.shadow.map = null; }
      light.dispose();
      return;
    }
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = (mesh as THREE.Mesh).material;
    const one = (m: THREE.Material) => {
      const map = (m as THREE.MeshStandardMaterial).map;
      if (map) map.dispose(); // the contact-shadow canvas texture lives here
      m.dispose();
    };
    if (Array.isArray(mat)) mat.forEach(one);
    else if (mat) one(mat as THREE.Material);
  });
}

/** Bounds of the screen + RTUs — meshes flagged noFit (rooftop backdrop) are skipped. */
function focusBox(group: THREE.Group): THREE.Box3 {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();
  group.traverse(o => {
    if (o.userData.noFit) return;
    if ((o as THREE.Mesh).isMesh) box.expandByObject(o);
  });
  return box;
}

/**
 * Re-fit the camera to the current bounding sphere: distance derived from
 * fov/aspect, orbit azimuth + elevation preserved. dur 0 snaps, else tweens.
 */
function frameTo(core: Core, dur: number) {
  if (!(core.fitR > 0)) return;
  const cam = core.camera, ctl = core.controls;
  const vFov = THREE.MathUtils.degToRad(cam.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(cam.aspect, 0.3));
  let dist = (core.fitR * 1.12) / Math.sin(Math.min(vFov, hFov) / 2);
  dist = Math.min(Math.max(dist, ctl.minDistance), ctl.maxDistance);
  const dir = cam.position.clone().sub(ctl.target);
  if (dir.lengthSq() < 1e-4) dir.set(0.8, 0.45, 1);
  dir.normalize();
  const pos = core.fitC.clone().addScaledVector(dir, dist);
  if (dur <= 0) {
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

/** Build every parametric part of the scene into one disposable group. */
function buildWorld({ lf, heightFt, bayFt, frameOnly, gauge }: ScreenSceneProps): THREE.Group {
  const group = new THREE.Group();
  const L = Math.max(lf, 4);
  const h = Math.max(heightFt, 2);
  const bay = Math.min(Math.max(bayFt, 2), 12);
  const half = L / 2;

  // ---- materials -------------------------------------------------------
  const rough = sharedRoughnessMap(); // module-cached — never disposed here
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, metalness: 0.55, roughness: 0.42, envMapIntensity: 1.0 });
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xc7ccd2, metalness: 0.78, roughness: 0.34, side: THREE.DoubleSide, envMapIntensity: 1.0, roughnessMap: rough,
  });
  const ribMat = new THREE.MeshStandardMaterial({
    color: gauge === 29 ? 0xd9dde1 : 0xd2d7dc, metalness: 0.8, roughness: 0.3, envMapIntensity: 1.0,
  });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xbfc2c6, roughness: 0.96, metalness: 0.04, roughnessMap: rough });
  const parapetMat = new THREE.MeshStandardMaterial({ color: 0xb0b3b8, roughness: 0.92 });
  const rtuMat = new THREE.MeshStandardMaterial({ color: 0x9ba1a8, roughness: 0.7, metalness: 0.3 });
  const rtuTrimMat = new THREE.MeshStandardMaterial({ color: 0x83898f, roughness: 0.6, metalness: 0.35 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00,
  });

  // ---- rooftop deck ----------------------------------------------------
  const deckW = L + 40;
  const deckD = 70;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(deckW, 1, deckD), deckMat);
  deck.position.set(0, -0.5, -14); // top of deck at y = 0
  deck.receiveShadow = true;
  deck.userData.noFit = true; // rooftop backdrop — excluded from camera fit
  group.add(deck);

  // the building the roof sits on, so the deck never reads as a floating slab
  const bldgMat = new THREE.MeshStandardMaterial({ color: 0xa8a5a0, roughness: 0.9 });
  const bldg = new THREE.Mesh(new THREE.BoxGeometry(deckW - 1.5, 30, deckD - 1.5), bldgMat);
  bldg.position.set(0, -16, -14);
  bldg.userData.noFit = true;
  group.add(bldg);

  // subtle parapet curb along the screen line (front edge of the deck field)
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(deckW, 1.4, 0.9), parapetMat);
  parapet.position.set(0, 0.7, 3.2);
  parapet.castShadow = true;
  parapet.receiveShadow = true;
  parapet.userData.noFit = true;
  group.add(parapet);

  // ---- RTU boxes behind the screen ------------------------------------
  const rtu = (w: number, hh: number, d: number, x: number, z: number) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), rtuMat);
    box.position.set(x, hh / 2, z);
    box.castShadow = true;
    box.receiveShadow = true;
    group.add(box);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, 0.5, d * 0.55), rtuTrimMat);
    cap.position.set(x, hh + 0.25, z);
    cap.castShadow = true;
    group.add(cap);
  };
  const rtuH = Math.max(3, h * 0.85);
  rtu(Math.min(16, L * 0.6), rtuH, 9, -L * 0.16, -9);
  if (L >= 24) rtu(Math.min(12, L * 0.4), rtuH * 0.8, 7, L * 0.2, -11);

  // soft contact shadow across the screen line + RTU field — fake AO on deck
  const cs = contactShadow(L + 10, 26, { opacity: 0.5, y: 0.12 });
  cs.position.z = -7;
  group.add(cs);

  // ---- posts (instanced) ----------------------------------------------
  const nPosts = Math.max(2, Math.ceil(L / bay) + 1);
  const postGeo = new THREE.BoxGeometry(0.38, h, 0.38);
  const posts = new THREE.InstancedMesh(postGeo, navyMat, nPosts);
  const M = new THREE.Matrix4();
  for (let i = 0; i < nPosts; i++) {
    const x = -half + Math.min(i * bay, L);
    M.makeTranslation(x, h / 2, 0);
    posts.setMatrixAt(i, M);
  }
  posts.instanceMatrix.needsUpdate = true;
  posts.castShadow = true;
  group.add(posts);

  // base plates
  const baseGeo = new THREE.BoxGeometry(1.0, 0.12, 1.0);
  const bases = new THREE.InstancedMesh(baseGeo, navyMat, nPosts);
  for (let i = 0; i < nPosts; i++) {
    const x = -half + Math.min(i * bay, L);
    M.makeTranslation(x, 0.06, 0);
    bases.setMatrixAt(i, M);
  }
  bases.instanceMatrix.needsUpdate = true;
  group.add(bases);

  // gold grid-bubble markers at post tops
  const dotGeo = new THREE.SphereGeometry(0.16, 12, 10);
  const dots = new THREE.InstancedMesh(dotGeo, goldMat, nPosts);
  for (let i = 0; i < nPosts; i++) {
    const x = -half + Math.min(i * bay, L);
    M.makeTranslation(x, h + 0.28, 0);
    dots.setMatrixAt(i, M);
  }
  dots.instanceMatrix.needsUpdate = true;
  group.add(dots);

  // ---- top / bottom rails ---------------------------------------------
  const railGeo = new THREE.BoxGeometry(L + 0.4, 0.26, 0.3);
  const topRail = new THREE.Mesh(railGeo, navyMat);
  topRail.position.set(0, h - 0.13, 0);
  topRail.castShadow = true;
  group.add(topRail);
  const botRail = new THREE.Mesh(railGeo.clone(), navyMat);
  botRail.position.set(0, 0.45, 0);
  botRail.castShadow = true;
  group.add(botRail);

  // ---- panel field: backing sheet + instanced vertical ribs -----------
  if (!frameOnly) {
    const fieldH = Math.max(h - 0.8, 1);
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(L, fieldH, 0.05), panelMat);
    sheet.position.set(0, 0.3 + fieldH / 2, 0.26);
    sheet.castShadow = true;
    sheet.receiveShadow = true;
    group.add(sheet);

    const nRibs = Math.max(1, Math.floor(L / RIB_MODULE));
    const ribDepth = gauge === 29 ? 0.1 : 0.125; // 1-1/2 in rib, thinner gauge reads flatter
    const ribGeo = new THREE.BoxGeometry(0.15, fieldH - 0.1, ribDepth);
    const ribs = new THREE.InstancedMesh(ribGeo, ribMat, nRibs);
    const x0 = -half + RIB_MODULE / 2 + (L - nRibs * RIB_MODULE) / 2;
    for (let i = 0; i < nRibs; i++) {
      M.makeTranslation(x0 + i * RIB_MODULE, 0.3 + fieldH / 2, 0.26 + 0.03 + ribDepth / 2);
      ribs.setMatrixAt(i, M);
    }
    ribs.instanceMatrix.needsUpdate = true;
    ribs.castShadow = true;
    group.add(ribs);
  }

  // NOTE: the sun lives in the one-time scene setup, not this disposable
  // group — rebuilding here must never orphan a 2048px shadow map.
  return group;
}

export default function ScreenScene(props: ScreenSceneProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<Core | null>(null);
  const [hint, setHint] = React.useState(true); // fades after first interaction

  // ---- one-time renderer / camera / controls setup ---------------------
  React.useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    // CAD-grade output: ACES filmic + sRGB + PCF-soft shadows (shared helper)
    enhanceRenderer(renderer, 1.12);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = makeSky({ top: "#88aed4", mid: "#c4d5e6", haze: "#eef1ee", horizon: "#eceada" });
    scene.background = bg;
    scene.fog = new THREE.Fog(0xdbe4ee, 220, 1400);

    // real specular for the galvanized panel field: PMREM room environment,
    // built once — OUTSIDE the disposable group, so option clicks never
    // touch it
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.28; // specular sheen only — the sun models the form

    // distant ground so the horizon reads as street level, not empty sky
    const groundGeo = new THREE.PlaneGeometry(4000, 4000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xcfccc4, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -31;
    scene.add(ground);

    const ambient = new THREE.AmbientLight(0xe8eef8, 0.45);
    const fill = new THREE.HemisphereLight(0xcfdcee, 0x8e8b84, 0.5);
    scene.add(ambient, fill);

    // sun + its one shadow map are created once; the rebuild effect only
    // repositions it and resizes the shadow camera to the new footprint
    const sun = new THREE.DirectionalLight(0xfff4e0, 2.9);
    sun.position.set(-30, 50, 34);
    sun.castShadow = true;
    tuneSunShadow(sun); // 2048 desktop / 1024 coarse + tuned bias
    scene.add(sun, sun.target); // target defaults to origin

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 4000);
    camera.position.set(30, 14, 46);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.45;   // never under the deck
    controls.minDistance = 10;
    controls.maxDistance = 320;

    // Never trap the page: wheel zoom only while Ctrl/Cmd is held, one
    // finger scrolls past the canvas, two fingers orbit + pinch-zoom.
    controls.enableZoom = false;
    controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE }; // ONE: null == no one-finger gesture
    renderer.domElement.style.touchAction = "pan-y"; // OrbitControls sets "none"
    const onWheel = (e: WheelEvent) => { controls.enableZoom = e.ctrlKey || e.metaKey; };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") controls.enableZoom = true; // two-finger pinch dolly
      setHint(false);
    };
    el.addEventListener("wheel", onWheel, { capture: true, passive: true });
    el.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });

    // optional SSAO composer — desktop only; mobile keeps plain render
    const post = makeComposer(renderer, scene, camera);

    const core: Core = { renderer, scene, camera, controls, sun, group: null, bg, raf: 0, ro: null as unknown as ResizeObserver, fitR: 0, fitC: new THREE.Vector3(), fly: null, post };

    const resize = () => {
      const w = el.clientWidth || 1;
      const hh = el.clientHeight || 1;
      renderer.setSize(w, hh, false);
      post?.setSize(w, hh);
      camera.aspect = w / hh;
      camera.updateProjectionMatrix();
      frameTo(core, 0); // keep the screen framed when the container reflows
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
      fill.dispose();
      if (core.group) {
        scene.remove(core.group);
        disposeGroup(core.group);
        core.group = null;
      }
      scene.remove(ground);
      groundGeo.dispose();
      groundMat.dispose();
      post?.dispose();
      scene.environment = null;
      envRT.dispose();
      bg.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      coreRef.current = null;
    };
  }, []);

  // ---- rebuild the parametric world when the configuration changes -----
  const { lf, heightFt, bayFt, frameOnly, gauge } = props;
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;

    const first = !core.group;
    if (core.group) {
      core.scene.remove(core.group);
      disposeGroup(core.group);
    }
    const group = buildWorld({ lf, heightFt, bayFt, frameOnly, gauge });
    core.scene.add(group);
    core.group = group;

    const L = Math.max(lf, 4);
    const h = Math.max(heightFt, 2);
    // the persistent sun follows the configuration; its one shadow map is
    // re-fitted to the model (wide pad: the noFit parapet also casts)
    // sun high front-left: the panel field stays lit, shadows rake right
    core.sun.position.set(-(L * 0.35 + 20), Math.max(40, h * 4 + 30), 34);
    fitShadowCamera(core.sun, group, 2.3);
    applyAnisotropy(core.renderer, group); // crisp textures at grazing angles

    core.controls.minDistance = Math.max(8, h * 1.5);
    core.controls.maxDistance = Math.max(90, L * 1.7);

    // re-fit on every rebuild: snap on first build, glide after option clicks
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
  }, [lf, heightFt, bayFt, frameOnly, gauge]);

  const btnCls = "rounded-[5px] border border-white/25 bg-[hsl(var(--marine))]/80 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-[hsl(var(--marine))]";
  return (
    <div className="relative h-full w-full">
      <div
        ref={mountRef}
        className="h-full w-full"
        role="img"
        aria-label={`3D preview — ${lf} LF roof screen, ${heightFt} ft high, posts every ${bayFt} ft, ${frameOnly ? "frame only" : `${gauge} gauge panel`}`}
      />
      <div className="absolute left-2 top-2 flex max-w-[54%] flex-wrap gap-1.5">
        <button
          type="button"
          className={btnCls}
          title="Download .glb — opens in Omniverse, Blender, SketchUp, Revit"
          onClick={() => { const g = coreRef.current?.group; if (g) exportGroupAsGlb(g, "mvs-screen.glb"); }}
        >
          3D file
        </button>
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
