import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { WAREHOUSE_SHELLS, OFFICE, type WarehouseParams } from "@/bimWarehouse";
import { exportGroupAsGlb } from "@/exportModel";
import {
  applyAnisotropy, contactShadow, disposeObject, enhanceRenderer, fitShadowCamera,
  makeComposer, makeGrassTexture, makeGroundPlane, makeRibTexture, makeSky,
  sharedRoughnessMap, tuneSunShadow, type ComposerRig,
} from "@/sceneQuality";

/* ------------------------------------------------------------------------
   Parametric 3D warehouse shell. Feet are world units. Length runs along
   X, width along Z. The dock wall faces +Z and sits on a dock-height
   foundation strip; the drive-in door is on the +X end wall with a
   concrete ramp; the 20×20 office corner shows through a semi-transparent
   window band on the −Z wall. A simple semi trailer (boxes only) parks at
   the first dock when dockDoors > 0.

   Renderer/camera/lights build once; the parametric group is rebuilt and
   disposed on every change; frameTo re-fits preserving orbit (ShedScene /
   DockScene pattern). Canvas textures only — nothing fetched. wallColor /
   roofColor are cosmetic-only props — never priced. prefers-reduced-motion
   snaps camera moves instead of tweening.
   ---------------------------------------------------------------------- */

const PAD_H = 4;             // dock-height foundation — floor at truck-bed level
const EAVE = 16;
const PITCH = 1;             // low-pitch gable, rise:12
const NAVY = 0x142f63;       // --marine
const GOLD = 0xfac400;       // --safety-hi

export type WarehouseSceneProps = WarehouseParams & {
  /** Cosmetic only — chosen at order, never priced. CSS hex like "#dfe3e6". */
  wallColor?: string;
  roofColor?: string;
};

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
  reduced: boolean;
  post: ComposerRig | null;
};

// ---- tiny canvas textures (generated, never fetched — CSP-safe) ----------

function shade(hex: string, f: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

/** Horizontal slat lines for sectional dock-door panels. */
function makePanelTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 8; c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = shade(color, 1);
  g.fillRect(0, 0, 8, 64);
  for (let y = 0; y < 64; y += 13) {
    g.fillStyle = shade(color, 0.7);
    g.fillRect(0, y, 8, 2);
    g.fillStyle = shade(color, 1.15);
    g.fillRect(0, y + 2, 8, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function disposeGroup(group: THREE.Group) {
  group.traverse(o => {
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

/** Bounds of the building itself — meshes flagged noFit (ground dressing,
    trailer, apron) are skipped so the shell stays framed. */
function focusBox(group: THREE.Group): THREE.Box3 {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();
  group.traverse(o => {
    if (o.userData.noFit) return;
    if ((o as THREE.Mesh).isMesh) box.expandByObject(o);
  });
  return box;
}

/** Re-fit the camera to the current bounding sphere, orbit preserved. */
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
  if (dur <= 0 || core.reduced) {
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

// ---- the parametric building (disposable group) --------------------------

function buildWorld(p: WarehouseSceneProps): THREE.Group {
  const group = new THREE.Group();
  const shell = WAREHOUSE_SHELLS[p.size];
  const L = shell.lengthFt, W = shell.widthFt, H = EAVE;
  const halfL = L / 2, halfW = W / 2;
  const rise = halfW * (PITCH / 12);
  const rafter = halfW * Math.sqrt(1 + (PITCH / 12) ** 2) + 0.6; // + eave lip
  const slope = Math.atan2(rise, halfW);
  const y0 = PAD_H;                    // floor / wall base at dock height
  const wallHex = p.wallColor ?? "#dfe3e6";
  const roofHex = p.roofColor ?? "#b9bec4";

  // ---- materials --------------------------------------------------------
  const t = 0.5; // panel + girt depth
  const rough = sharedRoughnessMap(); // module-cached — never disposed here
  const ribWall = (runFt: number) => {
    const tex = makeRibTexture(wallHex);
    tex.repeat.set(Math.max(4, Math.round(runFt)), 1); // major rib per ft
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.55, envMapIntensity: 1.0, roughnessMap: rough });
  };
  const roofTex = makeRibTexture(roofHex);
  roofTex.repeat.set(Math.round(L), 1);
  const roofMat = new THREE.MeshStandardMaterial({ map: roofTex, roughness: 0.35, metalness: 0.65, envMapIntensity: 1.0, roughnessMap: rough });
  const trimMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.5, metalness: 0.3 });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00 });
  const concMat = new THREE.MeshStandardMaterial({ color: 0xb9b6ad, roughness: 0.95 });
  const asphMat = new THREE.MeshStandardMaterial({ color: 0x55575a, roughness: 1 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x9fc4dd, roughness: 0.06, metalness: 0,
    transparent: true, opacity: 0.32, depthWrite: false, envMapIntensity: 1,
  });
  const doorMat = new THREE.MeshStandardMaterial({ map: makePanelTexture("#eef0f2"), roughness: 0.6, metalness: 0.3, envMapIntensity: 0.8 });
  const rollMat = new THREE.MeshStandardMaterial({ map: makePanelTexture("#c8ccd0"), roughness: 0.45, metalness: 0.6, envMapIntensity: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x24262a, roughness: 0.9 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.85 });

  // ---- ground dressing: grass disc + contact shadow ---------------------
  const grassR = Math.max(L, W) * 1.6 + 40;
  const grass = new THREE.Mesh(
    new THREE.CircleGeometry(grassR, 48),
    new THREE.MeshStandardMaterial({ map: makeGrassTexture("#7fa065", Math.max(2, grassR / 14)), roughness: 1 }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = 0.015;
  grass.receiveShadow = true;
  grass.userData.noFit = true;
  group.add(grass);

  group.add(contactShadow(L + 24, W + 24, { opacity: 0.8 }));

  // asphalt truck apron along the dock wall
  const apron = new THREE.Mesh(new THREE.BoxGeometry(L + 20, 0.14, 70), asphMat);
  apron.position.set(0, 0.08, halfW + 35);
  apron.receiveShadow = true;
  apron.userData.noFit = true;
  group.add(apron);

  // ---- dock-height foundation strip / stem walls ------------------------
  // The whole slab rides at truck-bed height; the exposed concrete face on
  // the dock side is the loading-dock wall the bumpers bolt to.
  const pad = new THREE.Mesh(new THREE.BoxGeometry(L + 1, PAD_H, W + 1), concMat);
  pad.position.y = PAD_H / 2;
  pad.castShadow = true;
  pad.receiveShadow = true;
  group.add(pad);

  // ---- walls ------------------------------------------------------------
  const wall = (mat: THREE.Material, w: number, h: number, x: number, y: number, z: number, rotY: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), mat);
    m.position.set(x, y, z);
    m.rotation.y = rotY;
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  // dock wall (+Z) and both end walls: full-height ribbed panels
  wall(ribWall(L), L, H, 0, y0 + H / 2, halfW - t / 2, 0);
  wall(ribWall(W), W, H, -halfL + t / 2, y0 + H / 2, 0, Math.PI / 2);
  wall(ribWall(W), W, H, halfL - t / 2, y0 + H / 2, 0, Math.PI / 2);
  // near wall (−Z): ribbed wainscot, semi-transparent window band (the
  // office corner reads through it), ribbed panel above
  wall(ribWall(L), L, 3, 0, y0 + 1.5, -halfW + t / 2, 0);
  const band = wall(glassMat, L - 1, 7, 0, y0 + 3 + 3.5, -halfW + t / 2, 0);
  band.castShadow = false;
  wall(ribWall(L), L, H - 10, 0, y0 + 10 + (H - 10) / 2, -halfW + t / 2, 0);
  // band mullions
  const mull = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 7, t + 0.05), trimMat, 9);
  const M = new THREE.Matrix4();
  for (let i = 0; i < 9; i++) {
    M.makeTranslation(-halfL + ((i + 1) * L) / 10, y0 + 6.5, -halfW + t / 2);
    mull.setMatrixAt(i, M);
  }
  mull.instanceMatrix.needsUpdate = true;
  group.add(mull);

  // corner + base trim in navy, gold eave line — the brand accents
  const cornerGeo = new THREE.BoxGeometry(0.7, H, 0.7);
  [[halfL - 0.35, halfW - 0.35], [halfL - 0.35, -halfW + 0.35],
   [-halfL + 0.35, -halfW + 0.35], [-halfL + 0.35, halfW - 0.35]].forEach(([x, z]) => {
    const c = new THREE.Mesh(cornerGeo, trimMat);
    c.position.set(x, y0 + H / 2, z);
    c.castShadow = true;
    group.add(c);
  });
  [1, -1].forEach(s => {
    const eave = new THREE.Mesh(new THREE.BoxGeometry(L + 0.6, 0.5, 0.6), trimMat);
    eave.position.set(0, y0 + H + 0.1, s * halfW);
    group.add(eave);
    const gold = new THREE.Mesh(new THREE.BoxGeometry(L + 0.6, 0.12, 0.12), goldMat);
    gold.position.set(0, y0 + H - 0.4, s * (halfW + 0.1));
    group.add(gold);
  });

  // ---- gable ends + roof planes -----------------------------------------
  const tri = new THREE.Shape();
  tri.moveTo(-halfW, 0); tri.lineTo(halfW, 0); tri.lineTo(0, rise); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: t, bevelEnabled: false });
  [halfL - t, -halfL].forEach(x => {
    const gable = new THREE.Mesh(triGeo, ribWall(W));
    gable.rotation.y = Math.PI / 2;
    gable.position.set(x, y0 + H, 0);
    gable.castShadow = true;
    group.add(gable);
  });
  const ridgeY = y0 + H + rise;
  const planeGeo = new THREE.BoxGeometry(L + 1, 0.14, rafter);
  ([1, -1] as const).forEach(sideZ => {
    const m = new THREE.Mesh(planeGeo, roofMat);
    m.rotation.x = sideZ * slope;
    const half = rafter / 2;
    m.position.set(0, ridgeY - Math.sin(slope) * half + 0.07, sideZ * Math.cos(slope) * half);
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  });
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(L + 1.1, 0.18, 0.9), trimMat);
  ridge.position.set(0, ridgeY + 0.14, 0);
  group.add(ridge);

  // ---- dock doors along the +Z eave wall --------------------------------
  // Recessed 9×10 openings: navy surround proud of the wall, sectional
  // panel set back inside it, bumper blocks on the pad face below, dock
  // number over each position.
  const dockXs: number[] = [];
  for (let d = 0; d < p.dockDoors; d++) {
    const x = -halfL + 14 + d * 13;
    dockXs.push(x);
    const zFace = halfW;
    const surround = new THREE.Mesh(new THREE.BoxGeometry(10.4, 11, 0.8), trimMat);
    surround.position.set(x, y0 + 5.4, zFace - 0.15);
    surround.castShadow = true;
    group.add(surround);
    const door = new THREE.Mesh(new THREE.BoxGeometry(9, 10, 0.2), doorMat);
    door.position.set(x, y0 + 5, zFace + 0.16); // inside the proud surround → reads recessed
    group.add(door);
    // laminated bumper blocks at truck-bed height on the foundation face
    [-3.6, 3.6].forEach(dx => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 0.7), darkMat);
      b.position.set(x + dx, PAD_H - 0.9, zFace + 0.7);
      group.add(b);
    });
    // edge-of-dock leveler lip
    const lip = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x8a9096, metalness: 0.7, roughness: 0.5 }));
    lip.position.set(x, PAD_H - 0.15, zFace + 0.55);
    group.add(lip);
    // gold dock-number plate
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 0.12), goldMat);
    plate.position.set(x, y0 + 11.8, zFace + 0.35);
    group.add(plate);
  }

  // ---- drive-in roll-ups on the +X end wall + concrete ramp -------------
  for (let d = 0; d < p.driveInDoors; d++) {
    const z = p.driveInDoors === 1 ? 8 : d === 0 ? 2 : 16;
    const xFace = halfL;
    const surround = new THREE.Mesh(new THREE.BoxGeometry(0.8, 15, 13.4), trimMat);
    surround.position.set(xFace - 0.15, y0 + 7.4, z);
    surround.castShadow = true;
    group.add(surround);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.2, 14, 12), rollMat);
    door.position.set(xFace + 0.16, y0 + 7, z);
    group.add(door);
    // roll drum above the opening
    const drum = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 12.6), darkMat);
    drum.position.set(xFace + 0.7, y0 + 14.6, z);
    group.add(drum);
    // grade-to-floor concrete ramp
    const wedge = new THREE.Shape();
    wedge.moveTo(0, 0); wedge.lineTo(0, PAD_H); wedge.lineTo(26, 0); wedge.closePath();
    const ramp = new THREE.Mesh(new THREE.ExtrudeGeometry(wedge, { depth: 13, bevelEnabled: false }), concMat);
    // shape x → world +x (slope runs away from the wall), depth spans z
    ramp.position.set(xFace + 0.4, 0.02, z - 6.5);
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    ramp.userData.noFit = true;
    group.add(ramp);
  }

  // ---- 20×20 office corner (interior block, +X/−Z corner) ---------------
  // Reads through the −Z window band; same buildout the takeoff prices.
  if (p.officeCorner) {
    const s = OFFICE.sideFt, oh = OFFICE.wallHFt;
    const cx = halfL - t - s / 2, cz = -halfW + t + s / 2;
    const block = new THREE.Mesh(new THREE.BoxGeometry(s, oh, s), whiteMat);
    block.position.set(cx, y0 + oh / 2, cz);
    block.castShadow = true;
    group.add(block);
    // flat cap (the drywall lid) + navy base strip
    const cap = new THREE.Mesh(new THREE.BoxGeometry(s + 0.4, 0.3, s + 0.4), trimMat);
    cap.position.set(cx, y0 + oh + 0.15, cz);
    group.add(cap);
    // two 3×4 windows on the warehouse-facing wall (+Z face of the block)
    [-4.5, 4.5].forEach(dx => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.2), glassMat);
      win.position.set(cx + dx, y0 + 5, cz + s / 2 + 0.06);
      group.add(win);
    });
    // 36-in entry door on the −X face of the block
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.2, 6.8, 3), trimMat);
    door.position.set(cx - s / 2 - 0.06, y0 + 3.4, cz + 2);
    group.add(door);
  }

  // ---- semi trailer suggestion at the first dock (simple boxes) ---------
  if (p.dockDoors > 0) {
    const trailer = new THREE.Group();
    const tx = dockXs[0];
    const bedY = PAD_H;               // trailer bed at dock-floor height
    // box van: 8 wide × 9 tall × 42 long, backed to the dock face
    const van = new THREE.Mesh(new THREE.BoxGeometry(8, 9, 42), whiteMat);
    van.position.set(tx, bedY + 4.5, halfW + 1.2 + 21);
    van.castShadow = true;
    trailer.add(van);
    // rear-door frame stripe + underride bar
    const bar = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.4, 0.3), darkMat);
    bar.position.set(tx, bedY - 1.2, halfW + 1.3);
    trailer.add(bar);
    // tandem bogie + landing gear (boxes)
    [[halfW + 34, 3.4], [halfW + 37.5, 3.4], [halfW + 14, 2.6]].forEach(([z, h], i) => {
      const wb = new THREE.Mesh(new THREE.BoxGeometry(i === 2 ? 0.8 : 7.6, h, i === 2 ? 0.8 : 3), darkMat);
      wb.position.set(tx, (i === 2 ? h / 2 + 0.4 : 1.7), z);
      wb.castShadow = true;
      trailer.add(wb);
    });
    // tractor suggestion: cab + hood boxes at the nose
    const cab = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 6), new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.4, metalness: 0.4 }));
    cab.position.set(tx, 4.2, halfW + 46.5);
    cab.castShadow = true;
    trailer.add(cab);
    const hood = new THREE.Mesh(new THREE.BoxGeometry(6.6, 3.6, 5), new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.4, metalness: 0.4 }));
    hood.position.set(tx, 2.5, halfW + 52);
    trailer.add(hood);
    trailer.traverse(o => { o.userData.noFit = true; }); // shell stays framed
    group.add(trailer);
  }

  // NOTE: the sun lives in the one-time scene setup, not this disposable
  // group — rebuilding here must never orphan a 2048px shadow map.
  return group;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export default function WarehouseScene(p: WarehouseSceneProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<Core | null>(null);
  const [hint, setHint] = React.useState(true);

  React.useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const reduced = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    // CAD-grade output: ACES filmic + sRGB + PCF-soft shadows (shared helper)
    enhanceRenderer(renderer, 1.1);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = makeSky();
    scene.background = bg;
    scene.fog = new THREE.Fog(0xd9e4ef, 320, 1400);

    // real specular for PBR panels + window band: PMREM room environment,
    // built once — OUTSIDE the disposable group, so option clicks never
    // touch it
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.55;

    // soft-edged textured ground that melts into the horizon haze
    const ground = makeGroundPlane({ radius: 1400, base: "#8a9a6e", horizon: "#e2e6d8" });
    scene.add(ground);

    const ambient = new THREE.AmbientLight(0xe8eef8, 0.8);
    const hemi = new THREE.HemisphereLight(0xd2ddec, 0x8b8a78, 0.55);
    scene.add(ambient, hemi);

    // sun + its one shadow map are created once; the rebuild effect only
    // repositions it and resizes the shadow camera to the footprint
    const sun = new THREE.DirectionalLight(0xfff2dc, 2.3);
    sun.position.set(60, 80, 60);
    sun.castShadow = true;
    tuneSunShadow(sun); // 2048 desktop / 1024 coarse + tuned bias
    scene.add(sun, sun.target);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 3000);
    camera.position.set(90, 45, 110);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.5; // never under the ground
    controls.minDistance = 20;
    controls.maxDistance = 460;

    // Never trap the page: wheel zoom only while Ctrl/Cmd is held, one
    // finger scrolls past the canvas, two fingers orbit + pinch-zoom.
    controls.enableZoom = false;
    controls.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE }; // ONE: null == no one-finger gesture
    renderer.domElement.style.touchAction = "pan-y"; // OrbitControls sets "none"
    const onWheel = (e: WheelEvent) => { controls.enableZoom = e.ctrlKey || e.metaKey; };
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") controls.enableZoom = true;
      setHint(false);
    };
    el.addEventListener("wheel", onWheel, { capture: true, passive: true });
    el.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });

    // optional SSAO composer — desktop only; mobile keeps plain render
    const post = makeComposer(renderer, scene, camera);

    const core: Core = {
      renderer, scene, camera, controls, sun, group: null, bg, raf: 0,
      ro: null as unknown as ResizeObserver, fitR: 0, fitC: new THREE.Vector3(),
      fly: null, reduced, post,
    };

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
        const k = Math.min(1, (performance.now() - f.start) / f.dur);
        const e = smooth(k);
        camera.position.lerpVectors(f.fromPos, f.toPos, e);
        controls.target.lerpVectors(f.fromTgt, f.toTgt, e);
        if (k >= 1) core.fly = null;
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

  const { size, dockDoors, driveInDoors, insulated, officeCorner, wallColor, roofColor } = p;
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    const first = !core.group;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const group = buildWorld(p);
    core.scene.add(group);
    core.group = group;

    const shell = WAREHOUSE_SHELLS[size];
    // the persistent sun follows the footprint; its one shadow map is
    // re-fitted tight to the new model bounds
    core.sun.position.set(shell.lengthFt * 0.5 + 30, 85, 60);
    // generous pad: the parked trailer + ramps are noFit but still cast
    fitShadowCamera(core.sun, group, 1.9);
    applyAnisotropy(core.renderer, group); // crisp textures at grazing angles

    // re-fit on every rebuild: snap on first build, glide after option clicks
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
  }, [size, dockDoors, driveInDoors, insulated, officeCorner, wallColor, roofColor]);

  const flyTo = (preset: "front" | "dock" | "corner") => {
    const core = coreRef.current;
    if (!core) return;
    const shell = WAREHOUSE_SHELLS[size];
    const L = shell.lengthFt, W = shell.widthFt;
    const midY = PAD_H + EAVE * 0.55;
    let pos: THREE.Vector3, tgt: THREE.Vector3;
    if (preset === "front") {
      // the +X end wall — drive-in door and ramp
      pos = new THREE.Vector3(L * 0.5 + 78, 22, W * 0.5 + 18);
      tgt = new THREE.Vector3(L * 0.35, midY, 0);
    } else if (preset === "dock") {
      // down the +Z eave wall — docks, bumpers, trailer
      pos = new THREE.Vector3(-L * 0.28, 18, W * 0.5 + 95);
      tgt = new THREE.Vector3(0, PAD_H + 7, W * 0.5);
    } else {
      const d = Math.max(120, L * 1.05);
      pos = new THREE.Vector3(d * 0.8, PAD_H + EAVE + 34, d * 0.75);
      tgt = new THREE.Vector3(0, midY, 0);
    }
    if (core.reduced) {
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

  const btnCls = "rounded-[5px] border border-white/25 bg-[hsl(var(--marine))]/80 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-[hsl(var(--marine))]";
  return (
    <div className="relative h-full w-full">
      <div
        ref={mountRef}
        className="h-full w-full"
        role="img"
        aria-label={`3D preview — 50×100 warehouse shell, ${dockDoors} dock door(s), ${driveInDoors} drive-in door(s)${insulated ? ", insulated" : ""}${officeCorner ? ", office corner" : ""}`}
      />
      <div className="absolute left-2 top-2 flex gap-1.5">
        <button type="button" className={btnCls} onClick={() => flyTo("front")}>Front</button>
        <button type="button" className={btnCls} onClick={() => flyTo("dock")}>Dock side</button>
        <button type="button" className={btnCls} onClick={() => flyTo("corner")}>Corner</button>
      </div>
      <div className="absolute bottom-2 right-2">
        <button
          type="button"
          className={btnCls}
          title="Download .glb — opens in Omniverse, Blender, SketchUp, Revit"
          onClick={() => { const g = coreRef.current?.group; if (g) exportGroupAsGlb(g, "mvs-warehouse.glb"); }}
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
