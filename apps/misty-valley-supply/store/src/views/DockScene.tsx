import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { DockParams } from "@/bimDock";

/* ------------------------------------------------------------------------
   Parametric 3D floating dock in a stylized Nolin cove. Feet are world
   units; water sits at y = 0. The shoreline bank rises on −X, the dock
   runs out over the water along +X, and the gangway spans the fluctuation
   zone between them. Renderer/camera/lights/water/bank build once; the
   parametric dock group is rebuilt and disposed on every change
   (ShedScene pattern). The dock floats — a tiny sine bob on the float
   group, suppressed under prefers-reduced-motion, as is the water ripple.
   Canvas textures only — nothing fetched.
   ---------------------------------------------------------------------- */

const WATER_LEVEL = 0;
const FLOAT_H = 1.5;        // foam-filled float height; rides half-sunk
const FRAME_H = 0.4;        // galvanized channel frame on the floats
const DECK_T = 0.15;
const DECK_TOP = FLOAT_H / 2 + FRAME_H + DECK_T; // 1.30 ft freeboard to deck
const DOCK_X0 = 14;         // where the first walkway section starts

const GALV = 0x8a9096;      // hot-dip galvanized steel
const ALUM = 0xc9ced4;      // welded aluminum gangway
const FLOAT_BLK = 0x24272b; // polyethylene float tubs
const BUMP = 0x33373b;      // vinyl P-profile bumper
const CLEAT = 0x6f767d;

export type DockSceneProps = DockParams;

type Rect = { cx: number; cz: number; lx: number; lz: number };

/** Section footprints per params — the same layout logic the takeoff prices. */
function layout(p: DockSceneProps) {
  const walk: Rect[] = [];
  for (let i = 0; i < p.walkwayFt / 10; i++)
    walk.push({ cx: DOCK_X0 + i * 10 + 5, cz: 0, lx: 10, lz: 4 });
  const xEnd = DOCK_X0 + p.walkwayFt;
  if (p.shape === "L") {
    walk.push({ cx: xEnd - 2, cz: 7, lx: 4, lz: 10 });
    walk.push({ cx: xEnd - 2, cz: 17, lx: 4, lz: 10 });
  } else if (p.shape === "T") {
    for (const cz of [-10, 0, 10]) walk.push({ cx: xEnd + 2, cz, lx: 4, lz: 10 });
  }
  const plats: Rect[] = [];
  const nP = p.platform === "none" ? 0 : p.platform === "8x10" ? 1 : 2;
  for (let i = 0; i < nP; i++) plats.push({ cx: xEnd - 5 - 10 * i, cz: -6, lx: 10, lz: 8 });
  return { walk, plats, xEnd, all: [...walk, ...plats] };
}

/** Is this point on some section's deck? Used to skip interior edges. */
const onDeck = (x: number, z: number, all: Rect[]) =>
  all.some(r => Math.abs(x - r.cx) < r.lx / 2 - 0.01 && Math.abs(z - r.cz) < r.lz / 2 - 0.01);

// ---- tiny canvas textures (generated, never fetched — CSP-safe) ----------

function makeSky(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 16; c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#9fc0dc");
  grad.addColorStop(0.55, "#d3e2ea");
  grad.addColorStop(1, "#e7ecdf");
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Deck planks: stripes across the direction of travel. `vertical` puts the
    plank joints along canvas x (for runs whose long axis maps to u). */
function makePlankTexture(base: string, gap: string, vertical: boolean): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = base;
  g.fillRect(0, 0, 256, 256);
  const n = 20; // ~0.5-ft boards on a 10-ft section
  for (let i = 0; i < n; i++) {
    const t = (i * 256) / n;
    g.fillStyle = gap;
    if (vertical) g.fillRect(t, 0, 2, 256); else g.fillRect(0, t, 256, 2);
    // subtle per-board tone shift
    g.fillStyle = i % 3 === 0 ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)";
    if (vertical) g.fillRect(t + 2, 0, 256 / n - 2, 256); else g.fillRect(0, t + 2, 256, 256 / n - 2);
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

function focusBox(group: THREE.Group): THREE.Box3 {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();
  group.traverse(o => {
    if (o.userData.noFit) return;
    if ((o as THREE.Mesh).isMesh) box.expandByObject(o);
  });
  return box;
}

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
  group: THREE.Group | null;   // disposable dock + gangway
  bob: THREE.Group | null;     // the floating part inside `group`
  water: THREE.Mesh;
  waterBase: Float32Array;
  bg: THREE.Texture;
  raf: number;
  ro: ResizeObserver;
  fitR: number;
  fitC: THREE.Vector3;
  fly: Fly | null;
  reduced: boolean;
};

/** Re-fit the camera to the dock's bounding sphere, azimuth preserved. */
function frameTo(core: Core, dur: number) {
  if (!(core.fitR > 0)) return;
  const cam = core.camera, ctl = core.controls;
  const vFov = THREE.MathUtils.degToRad(cam.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(cam.aspect, 0.3));
  let dist = (core.fitR * 1.15) / Math.sin(Math.min(vFov, hFov) / 2);
  dist = Math.min(Math.max(dist, ctl.minDistance), ctl.maxDistance);
  const dir = cam.position.clone().sub(ctl.target);
  if (dir.lengthSq() < 1e-4) dir.set(-0.7, 0.5, 1);
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

// ---- the parametric dock (disposable group) ------------------------------

function buildDock(p: DockSceneProps): { group: THREE.Group; bob: THREE.Group } {
  const group = new THREE.Group();
  const bob = new THREE.Group(); // everything that floats — bobs as one raft
  group.add(bob);
  const { walk, plats, xEnd, all } = layout(p);

  const galvMat = new THREE.MeshStandardMaterial({ color: GALV, roughness: 0.55, metalness: 0.6 });
  const floatMat = new THREE.MeshStandardMaterial({ color: FLOAT_BLK, roughness: 0.9 });
  const bumpMat = new THREE.MeshStandardMaterial({ color: BUMP, roughness: 0.85 });
  const cleatMat = new THREE.MeshStandardMaterial({ color: CLEAT, roughness: 0.4, metalness: 0.8 });
  const alumMat = new THREE.MeshStandardMaterial({ color: ALUM, roughness: 0.4, metalness: 0.7 });

  const wood = p.decking === "wood";
  const base = wood ? "#b08a55" : "#7a736b";
  const gap = wood ? "#8a683c" : "#5c5650";
  const deckU = new THREE.MeshStandardMaterial({ map: makePlankTexture(base, gap, true), roughness: wood ? 0.85 : 0.6 });
  const deckV = new THREE.MeshStandardMaterial({ map: makePlankTexture(base, gap, false), roughness: wood ? 0.85 : 0.6 });

  // ---- sections: floats at the waterline, frame, deck boards -------------
  for (const r of all) {
    // float tubs — a grid of foam-filled polyethylene boxes, half submerged
    const nx = r.lx > 6 ? 2 : 1, nz = r.lz > 6 ? 2 : 1;
    for (let ix = 0; ix < nx; ix++) for (let iz = 0; iz < nz; iz++) {
      const f = new THREE.Mesh(
        new THREE.BoxGeometry(r.lx / nx - 0.7, FLOAT_H, r.lz / nz - 0.7), floatMat);
      f.position.set(
        r.cx - r.lx / 2 + (ix + 0.5) * (r.lx / nx),
        WATER_LEVEL,
        r.cz - r.lz / 2 + (iz + 0.5) * (r.lz / nz));
      bob.add(f);
    }
    // galvanized channel frame
    const fr = new THREE.Mesh(new THREE.BoxGeometry(r.lx - 0.06, FRAME_H, r.lz - 0.06), galvMat);
    fr.position.set(r.cx, FLOAT_H / 2 + FRAME_H / 2, r.cz);
    fr.castShadow = true;
    bob.add(fr);
    // deck — planks run across the long axis; small seam between sections
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(r.lx - 0.04, DECK_T, r.lz - 0.04),
      r.lx >= r.lz ? deckU : deckV);
    deck.position.set(r.cx, DECK_TOP - DECK_T / 2, r.cz);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bob.add(deck);
  }

  // ---- moorable-edge hardware: bumper strips + cleats --------------------
  // One pass over every section edge; interior edges (deck on the far side)
  // get neither — same "every edge a hull can reach" idea the takeoff uses.
  const cleatGeoH = new THREE.BoxGeometry(0.85, 0.16, 0.2);  // horn
  const cleatGeoB = new THREE.BoxGeometry(0.18, 0.3, 0.18);  // riser
  for (const r of all) {
    const edges: { x: number; z: number; len: number; alongX: boolean; nx: number; nz: number }[] = [
      { x: r.cx, z: r.cz - r.lz / 2, len: r.lx, alongX: true, nx: 0, nz: -1 },
      { x: r.cx, z: r.cz + r.lz / 2, len: r.lx, alongX: true, nx: 0, nz: 1 },
      { x: r.cx - r.lx / 2, z: r.cz, len: r.lz, alongX: false, nx: -1, nz: 0 },
      { x: r.cx + r.lx / 2, z: r.cz, len: r.lz, alongX: false, nx: 1, nz: 0 },
    ];
    for (const e of edges) {
      if (onDeck(e.x + e.nx * 0.6, e.z + e.nz * 0.6, all)) continue; // interior joint
      // bumper — vinyl P-profile proud of the frame, just under the deck
      const b = new THREE.Mesh(new THREE.BoxGeometry(
        e.alongX ? e.len - 0.25 : 0.16, 0.3, e.alongX ? 0.16 : e.len - 0.25), bumpMat);
      b.position.set(e.x + e.nx * 0.1, DECK_TOP - 0.28, e.z + e.nz * 0.1);
      bob.add(b);
      // one cleat per 10 ft of edge — at each 10-ft segment's midpoint
      for (let s = 0; s < Math.round(e.len / 10) || (s === 0 && e.len <= 6); s++) {
        const off = e.len <= 6 ? 0 : -e.len / 2 + 10 * s + 5;
        const cx = e.x + (e.alongX ? off : -e.nx * 0.35);
        const cz = e.z + (e.alongX ? -e.nz * 0.35 : off);
        const riser = new THREE.Mesh(cleatGeoB, cleatMat);
        riser.position.set(cx, DECK_TOP + 0.12, cz);
        bob.add(riser);
        const horn = new THREE.Mesh(cleatGeoH, cleatMat);
        horn.position.set(cx, DECK_TOP + 0.26, cz);
        horn.rotation.y = e.alongX ? 0 : Math.PI / 2;
        bob.add(horn);
      }
    }
  }

  // ---- swim ladder (flip-up, deployed) -----------------------------------
  if (p.ladder) {
    // outer edge of the platform when there is one, else the far end
    let ax: number, az: number, dir: THREE.Vector2;
    if (plats.length > 0) { ax = plats[0].cx; az = plats[0].cz - plats[0].lz / 2; dir = new THREE.Vector2(0, -1); }
    else if (p.shape === "L") { ax = xEnd - 2; az = 22; dir = new THREE.Vector2(0, 1); }
    else if (p.shape === "T") { ax = xEnd + 4; az = 0; dir = new THREE.Vector2(1, 0); }
    else { ax = xEnd; az = 0; dir = new THREE.Vector2(1, 0); }
    const lad = new THREE.Group();
    const railGeo = new THREE.BoxGeometry(0.09, 3, 0.09);
    [-0.65, 0.65].forEach(s => {
      const rail = new THREE.Mesh(railGeo, alumMat);
      rail.position.set(dir.y * s, DECK_TOP + 0.3 - 1.5, dir.x * s);
      lad.add(rail);
    });
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(
        dir.x !== 0 ? 0.1 : 1.3, 0.08, dir.x !== 0 ? 1.3 : 0.1), alumMat);
      step.position.set(0, DECK_TOP - 0.3 - i * 0.65, 0);
      lad.add(step);
    }
    lad.position.set(ax + dir.x * 0.25, 0, az + dir.y * 0.25);
    bob.add(lad);
  }

  // ---- gangway — shore to first section, across the fluctuation zone -----
  if (p.gangway) {
    const shore = new THREE.Vector3(-6, 2.5, 0);
    const dock = new THREE.Vector3(DOCK_X0, DECK_TOP + 0.06, 0);
    const span = Math.hypot(dock.x - shore.x, dock.y - shore.y);
    const gw = new THREE.Group();
    // side channels + deck + kickplates
    [-1.5, 1.5].forEach(z => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(span, 0.38, 0.14), alumMat);
      rail.position.set(0, 0.1, z);
      rail.castShadow = true;
      gw.add(rail);
      const top = new THREE.Mesh(new THREE.BoxGeometry(span, 0.09, 0.09), alumMat);
      top.position.set(0, 1.55, z);
      gw.add(top);
      for (let i = 0; i <= 5; i++) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 0.08), alumMat);
        post.position.set(-span / 2 + (i * span) / 5, 0.85, z);
        gw.add(post);
      }
    });
    const tread = new THREE.Mesh(new THREE.BoxGeometry(span, 0.08, 3), alumMat);
    tread.position.set(0, 0, 0);
    tread.castShadow = true;
    gw.add(tread);
    gw.position.set((shore.x + dock.x) / 2, (shore.y + dock.y) / 2, 0);
    gw.rotation.z = Math.atan2(dock.y - shore.y, dock.x - shore.x);
    group.add(gw); // rolls on the dock end — anchored to shore, not bobbing
    // concrete abutment pad on the bank
    const pad = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.5, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xb9b6ad, roughness: 0.95 }));
    pad.position.set(-7, 1.7, 0);
    pad.castShadow = true;
    group.add(pad);
  }

  return { group, bob };
}

// ---- the static cove (built once) ----------------------------------------

function buildCove(scene: THREE.Scene): { water: THREE.Mesh; waterBase: Float32Array; statics: THREE.Group } {
  const statics = new THREE.Group();

  // sloping bank — Kentucky grass over the fluctuation zone
  const bank = new THREE.Mesh(new THREE.BoxGeometry(36, 2.4, 220),
    new THREE.MeshStandardMaterial({ color: 0x87a161, roughness: 1 }));
  bank.position.set(-11, 1.05, 0);
  bank.rotation.z = Math.atan2(-6.5, 30);
  bank.receiveShadow = true;
  statics.add(bank);
  // exposed limestone band at the waterline — the Corps drawdown scar
  const lime = new THREE.Mesh(new THREE.BoxGeometry(7, 1.6, 220),
    new THREE.MeshStandardMaterial({ color: 0xc2bba7, roughness: 0.95 }));
  lime.position.set(2.4, -0.15, 0);
  lime.rotation.z = Math.atan2(-6.5, 30);
  statics.add(lime);
  // a few limestone boulders half in the water
  const rockMat = new THREE.MeshStandardMaterial({ color: 0xb3ac98, roughness: 0.9, flatShading: true });
  [[4.5, 8], [5.5, -12], [3.5, 26], [6, -30], [4, 44]].forEach(([x, z], i) => {
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1 + (i % 3) * 0.5, 0), rockMat);
    rock.position.set(x, 0.1, z);
    rock.rotation.set(i, i * 2, i * 0.7);
    rock.castShadow = true;
    statics.add(rock);
  });
  // treeline up the bank
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4a33, roughness: 1 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3e5c38, roughness: 1, flatShading: true });
  [[-22, -18, 1.15], [-19, 14, 0.9], [-24, 34, 1.3], [-21, -40, 1.05], [-25, 4, 1.2]].forEach(([x, z, s]) => {
    const yTop = 5.5 - ((x + 26) * 6.5) / 30;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * s, 0.5 * s, 4 * s, 6), trunkMat);
    trunk.position.set(x, yTop + 2 * s, z);
    statics.add(trunk);
    const canopy = new THREE.Mesh(new THREE.IcosahedronGeometry(3.4 * s, 1), leafMat);
    canopy.position.set(x, yTop + 5.4 * s, z);
    canopy.castShadow = true;
    statics.add(canopy);
  });
  scene.add(statics);

  // the water — green-blue plane with a vertex-sine ripple (cheap)
  const waterGeo = new THREE.PlaneGeometry(460, 460, 78, 78);
  const water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({
    color: 0x2f6d68, transparent: true, opacity: 0.93, roughness: 0.28, metalness: 0.08,
  }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(80, WATER_LEVEL, 0);
  water.receiveShadow = true;
  scene.add(water);
  const waterBase = new Float32Array(waterGeo.attributes.position.array);
  return { water, waterBase, statics };
}

/** Displace the water plane's local z (world y) with three cheap sines. */
function rippleWater(core: Core, t: number) {
  const attr = (core.water.geometry as THREE.PlaneGeometry).attributes.position;
  const arr = attr.array as Float32Array;
  const base = core.waterBase;
  for (let i = 0; i < arr.length; i += 3) {
    const x = base[i], y = base[i + 1];
    arr[i + 2] = 0.085 * Math.sin(x * 0.22 + t * 1.05)
      + 0.055 * Math.sin(y * 0.35 - t * 0.8)
      + 0.04 * Math.sin((x + y) * 0.13 + t * 0.45);
  }
  attr.needsUpdate = true;
  core.water.geometry.computeVertexNormals();
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export default function DockScene(p: DockSceneProps) {
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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = makeSky();
    scene.background = bg;
    scene.fog = new THREE.Fog(0xd3e2e2, 180, 900);

    const ambient = new THREE.AmbientLight(0xe6eef6, 0.75);
    const hemi = new THREE.HemisphereLight(0xcfdeea, 0x4e6a60, 0.6);
    scene.add(ambient, hemi);

    // sun + its one shadow map are created once; rebuilds only reposition it
    const sun = new THREE.DirectionalLight(0xfff0d8, 2.2);
    sun.position.set(30, 34, 26);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 250;
    sun.shadow.bias = -0.0004;
    scene.add(sun, sun.target);

    const { water, waterBase, statics } = buildCove(scene);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 2000);
    camera.position.set(-10, 12, 34);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.53; // never under the lake
    controls.minDistance = 6;
    controls.maxDistance = 170;

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

    const core: Core = {
      renderer, scene, camera, controls, sun, group: null, bob: null,
      water, waterBase, bg, raf: 0, ro: null as unknown as ResizeObserver,
      fitR: 0, fitC: new THREE.Vector3(), fly: null, reduced,
    };

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameTo(core, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    core.ro = ro;

    if (reduced) rippleWater(core, 0); // one static, gentle wave state

    const loop = () => {
      core.raf = requestAnimationFrame(loop);
      const t = performance.now() / 1000;
      if (!core.reduced) {
        rippleWater(core, t);
        if (core.bob) { // the raft rides the same water — tiny and slow
          core.bob.position.y = Math.sin(t * 0.9) * 0.055;
          core.bob.rotation.z = Math.sin(t * 0.7 + 1) * 0.004;
          core.bob.rotation.x = Math.sin(t * 0.55) * 0.005;
        }
      }
      if (core.fly) {
        const f = core.fly;
        const k = Math.min(1, (performance.now() - f.start) / f.dur);
        const e = smooth(k);
        camera.position.lerpVectors(f.fromPos, f.toPos, e);
        controls.target.lerpVectors(f.fromTgt, f.toTgt, e);
        if (k >= 1) core.fly = null;
      }
      controls.update();
      renderer.render(scene, camera);
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
      scene.remove(statics);
      disposeGroup(statics);
      scene.remove(water);
      water.geometry.dispose();
      (water.material as THREE.Material).dispose();
      bg.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      coreRef.current = null;
    };
  }, []);

  const { shape, walkwayFt, platform, gangway, decking, ladder } = p;
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    const first = !core.group;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const { group, bob } = buildDock(p);
    core.scene.add(group);
    core.group = group;
    core.bob = bob;

    // the persistent sun follows the dock; its one shadow map re-covers it
    const { xEnd } = layout(p);
    core.sun.position.set(xEnd * 0.5 + 20, 34, 26);
    const s = xEnd + 30;
    const sc = core.sun.shadow.camera;
    sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s;
    sc.updateProjectionMatrix();

    core.controls.maxDistance = Math.max(120, xEnd * 3);
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
  }, [shape, walkwayFt, platform, gangway, decking, ladder]);

  const flyTo = (preset: "shore" | "above" | "waterline") => {
    const core = coreRef.current;
    if (!core) return;
    const xEnd = DOCK_X0 + walkwayFt + (shape === "T" ? 4 : 0);
    const mid = (DOCK_X0 + xEnd) / 2;
    let pos: THREE.Vector3, tgt: THREE.Vector3;
    if (preset === "shore") {
      pos = new THREE.Vector3(-14, 7.5, 18 + walkwayFt * 0.25);
      tgt = new THREE.Vector3(mid, DECK_TOP, shape === "L" ? 5 : 0);
    } else if (preset === "above") {
      pos = new THREE.Vector3(mid - 1, Math.max(48, walkwayFt * 1.6), shape === "L" ? 8 : 1);
      tgt = new THREE.Vector3(mid, 0, shape === "L" ? 7 : 0);
    } else {
      pos = new THREE.Vector3(xEnd + 20, 2.1, -22 - walkwayFt * 0.2);
      tgt = new THREE.Vector3(mid, DECK_TOP - 0.2, 0);
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
        aria-label={`3D preview — ${shape} floating dock, ${walkwayFt} ft walkway, ${platform === "none" ? "no platform" : platform === "8x10" ? "8×10 platform" : "double platform"}, ${decking} decking${gangway ? ", gangway" : ""}${ladder ? ", swim ladder" : ""}`}
      />
      <div className="absolute left-2 top-2 flex gap-1.5">
        <button type="button" className={btnCls} onClick={() => flyTo("shore")}>Shore</button>
        <button type="button" className={btnCls} onClick={() => flyTo("above")}>Above</button>
        <button type="button" className={btnCls} onClick={() => flyTo("waterline")}>Water-level</button>
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
