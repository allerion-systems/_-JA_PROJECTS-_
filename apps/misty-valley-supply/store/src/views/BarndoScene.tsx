import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { barndoGeometry, type BarndoParams } from "@/bimBarndo";
import { exportGroupAsGlb } from "@/exportModel";

/* ------------------------------------------------------------------------
   Parametric 3D barndominium. Feet are world units. Length runs along X,
   gable span along Z; the living quarters hold the −X end, the shop the
   +X end, and the porch bays run along the +Z eave near the quarters.
   Renderer/camera/lights build once; the parametric group is rebuilt and
   disposed on every change (ShedScene pattern). Canvas textures only —
   nothing fetched. Camera fly tweens collapse to snaps under
   prefers-reduced-motion. wallColor / roofColor are cosmetic-only props —
   never priced.
   ---------------------------------------------------------------------- */

const NAVY = 0x142f63;   // --marine
const GOLD = 0xfac400;   // --safety-hi
const TRIM = 0xf4f2ea;

export type BarndoSceneProps = BarndoParams & {
  /** Cosmetic only — chosen at order, never priced. CSS hex like "#b98d68". */
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

// ---- tiny canvas textures (generated, never fetched — CSP-safe) ----------

function shade(hex: string, f: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

/** shade() but returned as #rrggbb, so the result can be re-shaded. */
function shadeHex(hex: string, f: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  const to2 = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to2(ch(n >> 16))}${to2(ch((n >> 8) & 255))}${to2(ch(n & 255))}`;
}

/** Vertical rib stripes for steel panels — one rib per texture repeat. */
function makeRibTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 8;
  const g = c.getContext("2d")!;
  g.fillStyle = shade(color, 1);
  g.fillRect(0, 0, 64, 8);
  g.fillStyle = shade(color, 1.35);
  g.fillRect(0, 0, 5, 8);          // rib highlight
  g.fillStyle = shade(color, 0.6);
  g.fillRect(5, 0, 3, 8);          // rib shadow
  g.fillStyle = shade(color, 0.9);
  g.fillRect(34, 0, 2, 8);         // minor stiffening rib
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Horizontal lap-siding suggestion for the quarters end. */
function makeLapTexture(color: string, wallHFt: number): THREE.CanvasTexture {
  const courses = Math.max(10, Math.round(wallHFt * 2)); // ~6-in exposure
  const c = document.createElement("canvas");
  c.width = 8; c.height = 512;
  const g = c.getContext("2d")!;
  const ch = 512 / courses;
  for (let i = 0; i < courses; i++) {
    const y = i * ch;
    const grad = g.createLinearGradient(0, y, 0, y + ch);
    grad.addColorStop(0, shade(color, 1.08));
    grad.addColorStop(0.8, shade(color, 0.97));
    grad.addColorStop(1, shade(color, 0.8));
    g.fillStyle = grad;
    g.fillRect(0, y, 8, ch);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Horizontal slat lines suggesting a sectional roll-up door. */
function makeRollupTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 8; c.height = 256;
  const g = c.getContext("2d")!;
  const slats = 12;
  const sh = 256 / slats;
  for (let i = 0; i < slats; i++) {
    const y = i * sh;
    const grad = g.createLinearGradient(0, y, 0, y + sh);
    grad.addColorStop(0, "#d8dade");
    grad.addColorStop(0.75, "#c2c5ca");
    grad.addColorStop(1, "#8f939a");
    g.fillStyle = grad;
    g.fillRect(0, y, 8, sh);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft radial contact shadow under the building. */
function makeShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, "rgba(20,24,18,0.5)");
  grad.addColorStop(0.65, "rgba(20,24,18,0.25)");
  grad.addColorStop(1, "rgba(20,24,18,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
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

/** Bounds of the building itself — meshes flagged noFit (ground dressing) are skipped. */
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

const SLAB_TOP = 0.35;  // finished-slab surface
const PITCH = 3;        // steel-building 3:12 gable
const WAINSCOT_H = 3;   // cosmetic band height

function buildWorld(p: BarndoSceneProps): THREE.Group {
  const group = new THREE.Group();
  const g = barndoGeometry(p);
  const L = g.lengthFt, W = g.widthFt, H = g.eaveFt, qD = g.qDepth;
  const halfL = L / 2, halfW = W / 2;
  const rise = halfW * (PITCH / 12);
  const rafter = Math.sqrt(halfW * halfW + rise * rise) + 1; // 1-ft overhang
  const slope = Math.atan2(rise, halfW);
  const wallHex = p.wallColor ?? "#e8e4da";
  const roofHex = p.roofColor ?? "#3a3d42";
  const quartersHex = shadeHex(wallHex, 1.14); // lighter tone marks the quarters end
  const y0 = SLAB_TOP;
  const t = 0.35; // steel wall thickness (girts + panel)

  // ---- materials -------------------------------------------------------
  const ribbedMat = (lenFt: number) => {
    const tex = makeRibTexture(wallHex);
    tex.repeat.set(Math.max(4, Math.round(lenFt / 0.75)), 1); // rib every ~9 in
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.55, envMapIntensity: 0.8 });
  };
  const lapMat = () =>
    new THREE.MeshStandardMaterial({ map: makeLapTexture(quartersHex, H), roughness: 0.75 });
  const lapPlain = new THREE.MeshStandardMaterial({ color: new THREE.Color(quartersHex), roughness: 0.75 });
  const wainscotMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shade(wallHex, 0.62)), roughness: 0.45, metalness: 0.5, envMapIntensity: 0.8,
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: TRIM, roughness: 0.6 });
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.5, metalness: 0.3 });
  // transmission-look glass: opacity + low roughness + env reflection
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbcd6e6, roughness: 0.05, metalness: 0,
    transparent: true, opacity: 0.55, envMapIntensity: 1,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00, envMapIntensity: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.5, metalness: 0.4 });
  const steelPost = new THREE.MeshStandardMaterial({ color: 0x565c66, roughness: 0.4, metalness: 0.6, envMapIntensity: 0.8 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xb9b7ae, roughness: 0.95 });

  // ---- ground dressing (excluded from camera fit) ----------------------
  const grass = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(L, W) * 1.6 + 14, 48),
    new THREE.MeshStandardMaterial({ color: 0x7fa065, roughness: 1 }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = 0.015;
  grass.receiveShadow = true;
  grass.userData.noFit = true;
  group.add(grass);

  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(L + 14, W + 20),
    new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, opacity: 0.85 }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.03;
  contact.userData.noFit = true;
  group.add(contact);

  // ---- slab ------------------------------------------------------------
  const slab = new THREE.Mesh(new THREE.BoxGeometry(L + 1.5, SLAB_TOP, W + 1.5), concrete);
  slab.position.y = SLAB_TOP / 2;
  slab.receiveShadow = true;
  group.add(slab);
  // porch/entry apron out the front
  const apron = new THREE.Mesh(new THREE.BoxGeometry(Math.max(qD, 12), 0.22, 9.5), concrete);
  apron.position.set(-halfL + Math.max(qD, 12) / 2, 0.11, halfW + 4.75);
  apron.receiveShadow = true;
  group.add(apron);

  // ---- walls -----------------------------------------------------------
  const wall = (mat: THREE.Material, w: number, x: number, z: number, rotY: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, H, t), mat);
    m.position.set(x, y0 + H / 2, z);
    m.rotation.y = rotY;
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
    return m;
  };
  // back (−Z): full-length ribbed steel
  wall(ribbedMat(L), L, 0, -halfW + t / 2, 0);
  // front (+Z): quarters segment reads as lap siding, shop segment as steel
  wall(lapMat(), qD, -halfL + qD / 2, halfW - t / 2, 0);
  wall(ribbedMat(L - qD), L - qD, -halfL + qD + (L - qD) / 2, halfW - t / 2, 0);
  // quarters gable end (−X): lap siding; shop gable end (+X): ribbed steel
  wall(lapMat(), W, -halfL + t / 2, 0, Math.PI / 2);
  wall(ribbedMat(W), W, halfL - t / 2, 0, Math.PI / 2);

  // cosmetic wainscot band around the steel-clad walls
  const wains = (w: number, x: number, z: number, rotY: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, WAINSCOT_H, t + 0.08), wainscotMat);
    m.position.set(x, y0 + WAINSCOT_H / 2, z);
    m.rotation.y = rotY;
    m.castShadow = true;
    group.add(m);
  };
  wains(L, 0, -halfW + t / 2, 0);
  wains(L - qD, -halfL + qD + (L - qD) / 2, halfW - t / 2, 0);
  wains(W, halfL - t / 2, 0, Math.PI / 2);

  // corner trim
  const M = new THREE.Matrix4();
  const cornerGeo = new THREE.BoxGeometry(0.45, H, 0.45);
  const corners = new THREE.InstancedMesh(cornerGeo, trimMat, 4);
  [[halfL - 0.22, halfW - 0.22], [halfL - 0.22, -halfW + 0.22],
   [-halfL + 0.22, -halfW + 0.22], [-halfL + 0.22, halfW - 0.22]].forEach(([x, z], i) => {
    M.makeTranslation(x, y0 + H / 2, z);
    corners.setMatrixAt(i, M);
  });
  corners.instanceMatrix.needsUpdate = true;
  corners.castShadow = true;
  group.add(corners);

  // ---- quarters windows + person door ----------------------------------
  const WIN = { w: 3, h: 4 };
  /** Window unit built facing +Z at (x, sillY, z), then yawed. */
  const addWindow = (x: number, z: number, rotY: number) => {
    const u = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(WIN.w + 0.4, WIN.h + 0.4, 0.16), trimMat);
    frame.castShadow = true;
    u.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(WIN.w - 0.15, WIN.h - 0.15, 0.12), glassMat);
    glass.position.z = 0.04;
    u.add(glass);
    const mv = new THREE.Mesh(new THREE.BoxGeometry(0.08, WIN.h - 0.1, 0.05), trimMat);
    mv.position.z = 0.11;
    u.add(mv);
    const mh = new THREE.Mesh(new THREE.BoxGeometry(WIN.w - 0.1, 0.08, 0.05), trimMat);
    mh.position.z = 0.11;
    u.add(mh);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(WIN.w + 0.55, 0.12, 0.26), trimMat);
    sill.position.set(0, -WIN.h / 2 - 0.24, 0.02);
    u.add(sill);
    u.position.set(x, y0 + 3.2 + WIN.h / 2, z);
    u.rotation.y = rotY;
    group.add(u);
  };
  // split the 2–6 windows between the quarters gable end and its front wall
  const endCount = Math.min(2, p.quartersWindows);
  const frontCount = p.quartersWindows - endCount;
  for (let i = 0; i < endCount; i++) {
    const zPos = endCount === 1 ? halfW * 0.35 : (i === 0 ? -halfW * 0.42 : halfW * 0.42);
    addWindow(-halfL - 0.06, zPos, -Math.PI / 2);
  }
  for (let i = 0; i < frontCount; i++) {
    const x = -halfL + qD * ((i + 1) / (frontCount + 1));
    addWindow(x, halfW + 0.06, 0);
  }

  // person door on the quarters gable end, near the front corner
  {
    const DOOR = { w: 3, h: 6.83 };
    const dz = -halfW * 0.15;
    const caseFrame = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w + 0.5, DOOR.h + 0.35, 0.1), trimMat);
    caseFrame.rotation.y = -Math.PI / 2;
    caseFrame.position.set(-halfL - 0.03, y0 + (DOOR.h + 0.15) / 2, dz);
    caseFrame.castShadow = true;
    group.add(caseFrame);
    const door = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w, DOOR.h, 0.12), navyMat);
    door.rotation.y = -Math.PI / 2;
    door.position.set(-halfL - 0.1, y0 + DOOR.h / 2, dz);
    door.castShadow = true;
    group.add(door);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), goldMat);
    knob.position.set(-halfL - 0.18, y0 + DOOR.h * 0.48, dz - DOOR.w / 2 + 0.3);
    group.add(knob);
  }

  // ---- shop roll-up door on the +X gable end ---------------------------
  {
    const rw = Math.min(14, W - 10);
    const rh = H - 2.5;
    const rollTex = makeRollupTexture();
    const rollMat = new THREE.MeshStandardMaterial({ map: rollTex, roughness: 0.45, metalness: 0.5 });
    const jamb = new THREE.Mesh(new THREE.BoxGeometry(rw + 0.8, rh + 0.5, 0.12), trimMat);
    jamb.rotation.y = Math.PI / 2;
    jamb.position.set(halfL + 0.02, y0 + (rh + 0.25) / 2, 0);
    jamb.castShadow = true;
    group.add(jamb);
    const roll = new THREE.Mesh(new THREE.BoxGeometry(rw, rh, 0.14), rollMat);
    roll.rotation.y = Math.PI / 2;
    roll.position.set(halfL + 0.08, y0 + rh / 2, 0);
    roll.castShadow = true;
    group.add(roll);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(rw, 0.28, 0.1), darkMat);
    bar.rotation.y = Math.PI / 2;
    bar.position.set(halfL + 0.16, y0 + 0.5, 0);
    group.add(bar);
  }

  // ---- gable triangles -------------------------------------------------
  const tri = new THREE.Shape();
  tri.moveTo(-halfW, 0); tri.lineTo(halfW, 0); tri.lineTo(0, rise); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: t, bevelEnabled: false });
  // shop end: ribbed steel — ExtrudeGeometry UVs are in shape units, so one
  // repeat per 0.75 ft gives the same ~9-in rib rhythm as the walls
  const shopTriTex = makeRibTexture(wallHex);
  shopTriTex.repeat.set(1 / 0.75, 1);
  const shopTri = new THREE.Mesh(triGeo, new THREE.MeshStandardMaterial({
    map: shopTriTex, roughness: 0.55, metalness: 0.35,
  }));
  shopTri.rotation.y = Math.PI / 2;
  shopTri.position.set(halfL - t, y0 + H, 0);
  shopTri.castShadow = true;
  group.add(shopTri);
  // quarters end: plain lap tone
  const qTri = new THREE.Mesh(triGeo.clone(), lapPlain);
  qTri.rotation.y = Math.PI / 2;
  qTri.position.set(-halfL, y0 + H, 0);
  qTri.castShadow = true;
  group.add(qTri);

  // ---- roof planes + ridge + fascia ------------------------------------
  const roofL = L + 1.6; // rake overhang
  const roofTex = () => {
    const tex = makeRibTexture(roofHex);
    tex.repeat.set(Math.max(8, Math.round(roofL / 0.75)), 1);
    return tex;
  };
  const ridgeY = y0 + H + rise;
  const slopeMid = (s: 1 | -1) => {
    const half = rafter / 2;
    return new THREE.Vector3(0, ridgeY - Math.sin(slope) * half + 0.06, s * Math.cos(slope) * half);
  };
  ([1, -1] as const).forEach(sideZ => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(roofL, 0.12, rafter),
      new THREE.MeshStandardMaterial({ map: roofTex(), roughness: 0.35, metalness: 0.65, envMapIntensity: 0.8 }),
    );
    m.rotation.x = sideZ * slope;
    m.position.copy(slopeMid(sideZ));
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);

    const eaveY = ridgeY - Math.sin(slope) * rafter;
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(roofL, 0.5, 0.14), trimMat);
    fascia.position.set(0, eaveY - 0.16, sideZ * (Math.cos(slope) * rafter));
    fascia.castShadow = true;
    group.add(fascia);

    // gold drip-edge line — the brand accent
    const e = new THREE.Mesh(new THREE.BoxGeometry(roofL, 0.07, 0.07), goldMat);
    e.position.set(0, eaveY + 0.08, sideZ * Math.cos(slope) * rafter);
    group.add(e);
  });

  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(roofL + 0.1, 0.16, 0.5),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(shade(roofHex, 0.8)), roughness: 0.45, metalness: 0.6, envMapIntensity: 0.8 }),
  );
  ridge.position.set(0, ridgeY + 0.12, 0);
  ridge.castShadow = true;
  group.add(ridge);

  // ---- porch bays: eave-side roof extension on posts, quarters end -----
  if (p.porchBays > 0) {
    const pLen = Math.min(p.porchBays * 12, L);
    const pDepth = 8;
    const pSlope = Math.atan2(2, pDepth);
    const pRun = Math.sqrt(pDepth * pDepth + 4) + 0.5;
    const highY = y0 + H - 0.35;             // tucks under the shell eave
    const px0 = -halfL;                      // bays start at the quarters end
    const pTex = makeRibTexture(roofHex);
    pTex.repeat.set(Math.max(6, Math.round(pLen / 0.75)), 1);
    const pRoof = new THREE.Mesh(
      new THREE.BoxGeometry(pLen, 0.11, pRun),
      new THREE.MeshStandardMaterial({ map: pTex, roughness: 0.35, metalness: 0.65, envMapIntensity: 0.8 }),
    );
    pRoof.rotation.x = pSlope;
    pRoof.position.set(px0 + pLen / 2, highY - 1 + 0.06, halfW + (Math.cos(pSlope) * pRun) / 2 - 0.2);
    pRoof.castShadow = true;
    group.add(pRoof);
    // fascia along the porch eave
    const lowY = highY - 2;
    const pFascia = new THREE.Mesh(new THREE.BoxGeometry(pLen, 0.4, 0.12), trimMat);
    pFascia.position.set(px0 + pLen / 2, lowY - 0.1, halfW + Math.cos(pSlope) * pRun - 0.25);
    pFascia.castShadow = true;
    group.add(pFascia);
    // steel posts at each bay line (bays + 1)
    const postH = lowY - 0.35 - 0.1;
    const postGeo = new THREE.BoxGeometry(0.35, postH, 0.35);
    const posts = new THREE.InstancedMesh(postGeo, steelPost, p.porchBays + 1);
    for (let i = 0; i <= p.porchBays; i++) {
      const x = Math.min(px0 + i * 12, px0 + pLen);
      M.makeTranslation(x, 0.1 + postH / 2, halfW + pDepth - 0.4);
      posts.setMatrixAt(i, M);
    }
    posts.instanceMatrix.needsUpdate = true;
    posts.castShadow = true;
    group.add(posts);
    // porch slab
    const pSlab = new THREE.Mesh(new THREE.BoxGeometry(pLen, 0.24, pDepth), concrete);
    pSlab.position.set(px0 + pLen / 2, 0.12, halfW + pDepth / 2);
    pSlab.receiveShadow = true;
    group.add(pSlab);
  }

  // NOTE: the sun lives in the one-time scene setup, not this disposable
  // group — rebuilding here must never orphan a 2048px shadow map.
  return group;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export default function BarndoScene(p: BarndoSceneProps) {
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
    // CAD-grade output: filmic tone curve + sRGB (r152+ default, asserted here)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = makeSky();
    scene.background = bg;
    scene.fog = new THREE.Fog(0xd9e4ef, 200, 1100);

    // real specular for steel panels: PMREM room environment, built once —
    // OUTSIDE the disposable group, so option clicks never touch it
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.55;

    const groundGeo = new THREE.PlaneGeometry(2400, 2400);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x98a37f, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const ambient = new THREE.AmbientLight(0xe8eef8, 0.8);
    const hemi = new THREE.HemisphereLight(0xd2ddec, 0x8b8a78, 0.55);
    scene.add(ambient, hemi);

    // sun + its one shadow map are created once; the rebuild effect only
    // repositions it and resizes the shadow camera to the new footprint
    const sun = new THREE.DirectionalLight(0xfff2dc, 2.3);
    sun.position.set(30, 44, 28);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 300;
    sun.shadow.bias = -0.0004;
    scene.add(sun, sun.target);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 2400);
    camera.position.set(40, 20, 48);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.5; // never under the ground
    controls.minDistance = 12;
    controls.maxDistance = 260;

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

    const core: Core = {
      renderer, scene, camera, controls, sun, group: null, bg, raf: 0,
      ro: null as unknown as ResizeObserver, fitR: 0, fitC: new THREE.Vector3(),
      fly: null, reduced,
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
      scene.remove(ground);
      groundGeo.dispose();
      groundMat.dispose();
      scene.environment = null;
      envRT.dispose();
      bg.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
      coreRef.current = null;
    };
  }, []);

  const { size, quartersFraction, porchBays, quartersWindows, bathrooms, wallColor, roofColor } = p;
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    const first = !core.group;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const group = buildWorld(p);
    core.scene.add(group);
    core.group = group;

    // the persistent sun follows the footprint; its one shadow map re-covers it
    const g = barndoGeometry(p);
    core.sun.position.set(g.lengthFt * 0.55 + 16, 34 + g.eaveFt, 26);
    const s = Math.max(g.lengthFt, g.widthFt) + 20;
    const sc = core.sun.shadow.camera;
    sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s;
    sc.updateProjectionMatrix();

    core.controls.maxDistance = Math.max(140, g.lengthFt * 4);
    // re-fit on every rebuild: snap on first build, glide after option clicks
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, quartersFraction, porchBays, quartersWindows, bathrooms, wallColor, roofColor]);

  const flyTo = (preset: "front" | "corner" | "quarters") => {
    const core = coreRef.current;
    if (!core) return;
    const g = barndoGeometry(p);
    const peak = g.eaveFt + (g.widthFt / 2) * (PITCH / 12);
    const tgt = new THREE.Vector3(0, SLAB_TOP + peak * 0.4, 0);
    let pos: THREE.Vector3;
    if (preset === "front") {
      pos = new THREE.Vector3(0, SLAB_TOP + g.eaveFt * 0.55 + 3,
        Math.max(30, g.lengthFt * 0.95 + g.widthFt * 0.5 + 10));
    } else if (preset === "corner") {
      const d = Math.max(34, g.lengthFt * 1.05 + g.widthFt * 0.55);
      pos = new THREE.Vector3(d * 0.85, peak * 0.85 + 8, d);
    } else {
      // the quarters end (−X): windows, person door, porch in frame
      const d = Math.max(34, g.widthFt * 1.5 + 14);
      pos = new THREE.Vector3(-g.lengthFt / 2 - d, SLAB_TOP + g.eaveFt * 0.6 + 4, d * 0.5);
      tgt.set(-g.lengthFt * 0.25, SLAB_TOP + g.eaveFt * 0.45, 0);
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
        aria-label={`3D preview — ${size.replace("x", "×")} barndominium, ${quartersFraction === 0.25 ? "quarter" : "half"} living quarters, ${porchBays} porch bay(s), ${quartersWindows} windows, ${bathrooms} bath(s)`}
      />
      <div className="absolute left-2 top-2 flex gap-1.5">
        <button type="button" className={btnCls} onClick={() => flyTo("front")}>Front</button>
        <button type="button" className={btnCls} onClick={() => flyTo("corner")}>Corner</button>
        <button type="button" className={btnCls} onClick={() => flyTo("quarters")}>Quarters</button>
      </div>
      <div className="absolute bottom-2 right-2">
        <button
          type="button"
          className={btnCls}
          title="Download .glb — opens in Omniverse, Blender, SketchUp, Revit"
          onClick={() => { const g = coreRef.current?.group; if (g) exportGroupAsGlb(g, "mvs-barndo.glb"); }}
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
