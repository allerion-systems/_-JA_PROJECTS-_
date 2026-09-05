import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { spaced, rafterLen, SHED_DOOR, SHED_WIN, type ShedParams } from "@/bim";

/* ------------------------------------------------------------------------
   Parametric 3D shed. Feet are world units. Length runs along X, width
   along Z, door wall faces +Z. The stud counts and rafter spacing come
   from the same bim.ts helpers the estimate uses, so what you see is what
   the sheet prices. Renderer/camera/controls build once; the parametric
   group is rebuilt and disposed on every change (ScreenScene pattern).
   ---------------------------------------------------------------------- */

const NAVY = 0x142f63;   // --marine
const GOLD = 0xfac400;   // --safety-hi

type Core = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  group: THREE.Group | null;
  bg: THREE.Texture;
  raf: number;
  ro: ResizeObserver;
  fitted: boolean;
};

function makeSky(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 16; c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#a9c4e2");
  grad.addColorStop(0.55, "#d9e4ef");
  grad.addColorStop(1, "#eef0e6");
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function disposeGroup(group: THREE.Group) {
  group.traverse(o => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach(m => m.dispose());
    else if (mat) (mat as THREE.Material).dispose();
  });
}

const FLOOR_TOP = 0.95; // skid 0.3 + 2×8 joist 0.62 + deck

function buildWorld(p: ShedParams): THREE.Group {
  const group = new THREE.Group();
  const L = p.lengthFt, W = p.widthFt, H = p.wallHFt;
  const halfL = L / 2, halfW = W / 2;
  const rise = halfW * (p.pitch / 12);
  const rafter = rafterLen(halfW, p.pitch);
  const slope = Math.atan2(rise, halfW);

  // ---- materials -------------------------------------------------------
  const wood = new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 0.85 });
  const woodPT = new THREE.MeshStandardMaterial({ color: 0x9d7844, roughness: 0.9 });
  const osb = new THREE.MeshStandardMaterial({ color: 0xb98d4f, roughness: 0.92 });
  const skin = new THREE.MeshStandardMaterial({
    color: p.siding === "vinyl" ? 0xe8e4da : 0xdfe3e8, roughness: 0.8,
  });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x565c66, roughness: 0.75, metalness: 0.15, side: THREE.DoubleSide });
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.5, metalness: 0.3 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xaecbe0, roughness: 0.15, metalness: 0.55 });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00 });
  const gravelMat = new THREE.MeshStandardMaterial({ color: 0xa9a598, roughness: 1 });

  const M = new THREE.Matrix4();

  // ---- gravel pad + skids + floor -------------------------------------
  const pad = new THREE.Mesh(new THREE.BoxGeometry(L + 4, 0.18, W + 4), gravelMat);
  pad.position.y = 0.09;
  pad.receiveShadow = true;
  group.add(pad);

  const skidGeo = new THREE.BoxGeometry(L + 0.8, 0.3, 0.3);
  const skids = new THREE.InstancedMesh(skidGeo, woodPT, 3);
  [-halfW + 0.5, 0, halfW - 0.5].forEach((z, i) => {
    M.makeTranslation(0, 0.18 + 0.15, z);
    skids.setMatrixAt(i, M);
  });
  skids.instanceMatrix.needsUpdate = true;
  skids.castShadow = true;
  group.add(skids);

  // floor band (rim + joists read as one band) + OSB deck
  const band = new THREE.Mesh(new THREE.BoxGeometry(L, 0.62, W), woodPT);
  band.position.y = 0.33 + 0.31;
  band.castShadow = true;
  group.add(band);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(L, 0.06, W), osb);
  deck.position.y = FLOOR_TOP - 0.03;
  group.add(deck);

  // ---- walls -----------------------------------------------------------
  const t = 0.29; // 2×4 wall thickness
  const y0 = FLOOR_TOP;

  // Three skinned walls: back (−Z), and both... no — back + right end solid,
  // left end (−X) is the framing cutaway, front (+Z) carries the openings.
  const wall = (w: number, x: number, z: number, rotY: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, t), skin);
    m.position.set(x, y0 + H / 2, z);
    m.rotation.y = rotY;
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };
  wall(L, 0, -halfW + t / 2, 0);            // back
  wall(W, halfL - t / 2, 0, Math.PI / 2);   // right end

  // Front wall (+Z): skin panel plus door/window cutout shapes sitting proud.
  wall(L, 0, halfW - t / 2, 0);
  const doorGeo = new THREE.BoxGeometry(SHED_DOOR.w, SHED_DOOR.h, 0.12);
  for (let d = 0; d < p.doors; d++) {
    const x = p.doors === 1 ? -L * 0.18 : (d === 0 ? -L * 0.28 : L * 0.05);
    const door = new THREE.Mesh(doorGeo, navyMat);
    door.position.set(x, y0 + SHED_DOOR.h / 2, halfW + 0.06);
    door.castShadow = true;
    group.add(door);
    // gold latch dot
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), goldMat);
    dot.position.set(x + SHED_DOOR.w / 2 - 0.35, y0 + SHED_DOOR.h * 0.48, halfW + 0.14);
    group.add(dot);
  }
  const winGeo = new THREE.BoxGeometry(SHED_WIN.w, SHED_WIN.h, 0.1);
  for (let w = 0; w < p.windows; w++) {
    const x = w === 0 ? L * 0.3 : L * 0.08 + (p.doors === 2 ? L * 0.22 : 0);
    const win = new THREE.Mesh(winGeo, glassMat);
    win.position.set(Math.min(x, halfL - SHED_WIN.w / 2 - 0.4), y0 + 3.4 + SHED_WIN.h / 2 - 1.4, halfW + 0.05);
    group.add(win);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(SHED_WIN.w + 0.3, SHED_WIN.h + 0.3, 0.06), skin);
    trim.position.copy(win.position);
    trim.position.z = halfW + 0.02;
    group.add(trim);
  }

  // Left end (−X): the cutaway — open stud framing, same 16" o.c. count
  // the estimate prices.
  const nStuds = spaced(W, 16);
  const studGeo = new THREE.BoxGeometry(0.12, H - 0.36, 0.29);
  const studs = new THREE.InstancedMesh(studGeo, wood, nStuds);
  for (let i = 0; i < nStuds; i++) {
    const z = -halfW + Math.min((i * 16) / 12, W);
    M.makeTranslation(-halfL + 0.15, y0 + H / 2, Math.min(z, halfW) - 0);
    studs.setMatrixAt(i, M);
  }
  studs.instanceMatrix.needsUpdate = true;
  studs.castShadow = true;
  group.add(studs);
  // plates: one bottom, two top
  const plateGeo = new THREE.BoxGeometry(0.29, 0.12, W);
  [y0 + 0.06, y0 + H - 0.18, y0 + H - 0.06].forEach(y => {
    const pl = new THREE.Mesh(plateGeo, wood);
    pl.position.set(-halfL + 0.15, y, 0);
    group.add(pl);
  });

  // ---- gable triangles -------------------------------------------------
  const tri = new THREE.Shape();
  tri.moveTo(-halfW, 0); tri.lineTo(halfW, 0); tri.lineTo(0, rise); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: t, bevelEnabled: false });
  // rotated +90° about Y: shape x → world −z, extrude depth → world +x
  [halfL - t, -halfL].forEach(x => {
    const gable = new THREE.Mesh(triGeo, skin);
    gable.rotation.y = Math.PI / 2;
    gable.position.set(x, y0 + H, 0);
    gable.castShadow = true;
    group.add(gable);
  });

  // ---- roof planes + ridge --------------------------------------------
  const roofL = L + 1; // rake overhang
  const planeGeo = new THREE.BoxGeometry(roofL, 0.09, rafter);
  const ridgeY = y0 + H + rise;
  const mk = (sideZ: 1 | -1) => {
    const m = new THREE.Mesh(planeGeo, roofMat);
    m.rotation.x = sideZ * slope;
    // center of plane sits halfway down the slope from the ridge
    const half = rafter / 2;
    m.position.set(0, ridgeY - Math.sin(slope) * half + 0.06, sideZ * Math.cos(slope) * half);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };
  mk(1); mk(-1);
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(roofL + 0.1, 0.14, 0.3), navyMat);
  ridge.position.set(0, ridgeY + 0.1, 0);
  ridge.castShadow = true;
  group.add(ridge);

  // gold drip-edge line along both eaves — the brand accent
  const eaveGeo = new THREE.BoxGeometry(roofL, 0.07, 0.07);
  [1, -1].forEach(s => {
    const e = new THREE.Mesh(eaveGeo, goldMat);
    e.position.set(0, ridgeY - Math.sin(slope) * rafter + 0.05, s * Math.cos(slope) * rafter);
    group.add(e);
  });

  // ---- sun -------------------------------------------------------------
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.3);
  sun.position.set(L * 0.5 + 14, 26 + rise * 2, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = Math.max(L, W) + 12;
  sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
  sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 200;
  sun.shadow.bias = -0.0004;
  group.add(sun);
  group.add(sun.target);

  return group;
}

export default function ShedScene(p: ShedParams) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<Core | null>(null);

  React.useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // DPR capped at 2
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = makeSky();
    scene.background = bg;
    scene.fog = new THREE.Fog(0xd9e4ef, 160, 900);

    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x9aa384, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    scene.add(new THREE.AmbientLight(0xe8eef8, 0.8));
    scene.add(new THREE.HemisphereLight(0xd2ddec, 0x8b8a78, 0.55));

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 2000);
    camera.position.set(20, 11, 24);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.5; // never under the ground
    controls.minDistance = 8;
    controls.maxDistance = 140;

    const core: Core = { renderer, scene, camera, controls, group: null, bg, raf: 0, ro: null as unknown as ResizeObserver, fitted: false };

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    core.ro = ro;

    const loop = () => {
      core.raf = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();
    coreRef.current = core;

    return () => {
      cancelAnimationFrame(core.raf);
      ro.disconnect();
      controls.dispose();
      if (core.group) { scene.remove(core.group); disposeGroup(core.group); core.group = null; }
      scene.remove(ground);
      groundGeo.dispose();
      groundMat.dispose();
      bg.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      coreRef.current = null;
    };
  }, []);

  const { widthFt, lengthFt, wallHFt, pitch, doors, windows, siding } = p;
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const group = buildWorld({ widthFt, lengthFt, wallHFt, pitch, doors, windows, siding });
    core.scene.add(group);
    core.group = group;

    const peak = wallHFt + (widthFt / 2) * (pitch / 12);
    core.controls.target.set(0, FLOOR_TOP + peak * 0.45, 0);
    core.controls.maxDistance = Math.max(70, lengthFt * 4);
    if (!core.fitted) {
      const d = Math.max(18, lengthFt * 1.15 + widthFt * 0.6);
      core.camera.position.set(d * 0.85, peak * 0.9 + 6, d);
      core.fitted = true;
    }
    core.controls.update();
  }, [widthFt, lengthFt, wallHFt, pitch, doors, windows, siding]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full touch-none"
      role="img"
      aria-label={`3D preview — ${widthFt}×${lengthFt} shed, ${wallHFt} ft walls, ${pitch}:12 gable, ${doors} door(s), ${windows} window(s), ${siding === "vinyl" ? "vinyl siding" : "housewrap only"}`}
    />
  );
}
