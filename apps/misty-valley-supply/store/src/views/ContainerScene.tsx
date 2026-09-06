import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CONTAINER_DIMS, containerDerived, type ContainerParams } from "@/bimContainer";
import { DIMS_NAME, formatFeet, makeDimensions } from "@/dimensions";
import { exportGroupAsGlb } from "@/exportModel";

/* ------------------------------------------------------------------------
   Parametric 3D container. Feet are world units. Length runs along X,
   width along Z; cargo doors at +X. The near long wall (+Z) is rendered
   semi-transparent — a CUTAWAY so the interior footprint reads: white
   partitions per layout, liner over the insulated bays, floor tone,
   window/man-door kits in the far wall, mini-split when hvac. Renderer,
   lights, camera and controls build once; the parametric group is rebuilt
   and disposed on every change (ShedScene pattern). containerColor is a
   cosmetic-only prop — never priced.
   ---------------------------------------------------------------------- */

const NAVY = 0x142f63;   // --marine
const GOLD = 0xfac400;   // --safety-hi

export type ContainerSceneProps = ContainerParams & {
  /** Cosmetic only — chosen at order, never priced. CSS hex like "#8a97a8". */
  containerColor?: string;
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

/** Vertical corrugation: one trapezoid rib per repeat, uniform top to bottom. */
function makeCorrugationTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 8;
  const g = c.getContext("2d")!;
  g.fillStyle = shade(color, 1);          // flat pan
  g.fillRect(0, 0, 64, 8);
  g.fillStyle = shade(color, 0.72);       // rising slope in shadow
  g.fillRect(8, 0, 10, 8);
  g.fillStyle = shade(color, 1.22);       // rib crest catches light
  g.fillRect(18, 0, 14, 8);
  g.fillStyle = shade(color, 0.86);       // falling slope
  g.fillRect(32, 0, 10, 8);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Soft radial contact shadow under the box. */
function makeShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128; c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64);
  grad.addColorStop(0, "rgba(20,24,18,0.55)");
  grad.addColorStop(0.65, "rgba(20,24,18,0.28)");
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

/** Bounds of the box itself — meshes flagged noFit (ground dressing) are skipped. */
function focusBox(group: THREE.Group): THREE.Box3 {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();
  group.traverse(o => {
    if (o.userData.noFit) return;
    if ((o as THREE.Mesh).isMesh) box.expandByObject(o);
  });
  return box;
}

/** Re-fit the camera to the current bounding sphere, preserving orbit direction. */
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

const BASE_Y = 0.5;      // top of the gravel blocks — the container floor line
const WIN = { w: 3, h: 3, sill: 3.4 };   // 36 × 36 kit
const DOOR = { w: 3, h: 6.7 };           // 36-in man-door

function buildWorld(p: ContainerSceneProps): THREE.Group {
  const group = new THREE.Group();
  const dims = CONTAINER_DIMS[p.size];
  const d = containerDerived(p);
  // Wb = one box's width; W = the combined mated footprint (count boxes).
  const L = dims.lengthFt, Wb = dims.widthFt, W = dims.widthFt * p.count, H = dims.heightFt;
  const halfL = L / 2, halfW = W / 2;
  const hex = p.containerColor ?? "#8a97a8";
  const y0 = BASE_Y;
  const t = 0.12; // steel wall thickness (visual)

  // ---- materials -------------------------------------------------------
  const corrLong = makeCorrugationTexture(hex);
  corrLong.repeat.set(Math.max(8, Math.round(L / 0.9)), 1);   // rib every ~11 in
  const corrEnd = makeCorrugationTexture(hex);
  corrEnd.repeat.set(Math.max(6, Math.round(W / 0.9)), 1);
  const corrNear = makeCorrugationTexture(hex);
  corrNear.repeat.set(Math.max(8, Math.round(L / 0.9)), 1);

  const steel = new THREE.MeshStandardMaterial({ map: corrLong, roughness: 0.45, metalness: 0.55, envMapIntensity: 0.8 });
  const steelEnd = new THREE.MeshStandardMaterial({ map: corrEnd, roughness: 0.45, metalness: 0.55, envMapIntensity: 0.8 });
  // the CUTAWAY: near long wall reads as ghosted steel
  const steelGhost = new THREE.MeshStandardMaterial({
    map: corrNear, roughness: 0.55, metalness: 0.35,
    transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide,
  });
  const roofGhost = new THREE.MeshStandardMaterial({
    color: new THREE.Color(shade(hex, 0.9)), roughness: 0.6, metalness: 0.3,
    transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide,
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(shade(hex, 0.62)), roughness: 0.45, metalness: 0.55, envMapIntensity: 0.8 });
  const linerMat = new THREE.MeshStandardMaterial({ color: 0xf3f2ee, roughness: 0.85 });
  const partMat = new THREE.MeshStandardMaterial({ color: 0xfafaf7, roughness: 0.8 });
  const plyMat = new THREE.MeshStandardMaterial({ color: 0x6e5636, roughness: 0.95 });
  const lvpMat = new THREE.MeshStandardMaterial({ color: 0xcdb894, roughness: 0.7 });
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.5, metalness: 0.3 });
  // transmission-look glass: opacity + low roughness + env reflection
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbcd6e6, roughness: 0.05, metalness: 0,
    transparent: true, opacity: 0.55, envMapIntensity: 1,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00, envMapIntensity: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.5, metalness: 0.4 });
  const whiteBoxMat = new THREE.MeshStandardMaterial({ color: 0xeef0f2, roughness: 0.4 });
  const gravelMat = new THREE.MeshStandardMaterial({ color: 0xa9a598, roughness: 1 });

  const M = new THREE.Matrix4();

  // ---- grass disc + contact shadow + gravel pad ------------------------
  const grass = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(L, W) * 1.6 + 10, 48),
    new THREE.MeshStandardMaterial({ color: 0x7fa065, roughness: 1 }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = 0.015;
  grass.receiveShadow = true;
  grass.userData.noFit = true;
  group.add(grass);

  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(L + 9, W + 9),
    new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, opacity: 0.85 }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.03;
  contact.userData.noFit = true;
  group.add(contact);

  const pad = new THREE.Mesh(new THREE.BoxGeometry(L + 4, 0.18, W + 4), gravelMat);
  pad.position.y = 0.09;
  pad.receiveShadow = true;
  group.add(pad);

  // ---- base frame + corner castings ------------------------------------
  const rail = new THREE.Mesh(new THREE.BoxGeometry(L, BASE_Y - 0.18, W), frameMat);
  rail.position.y = 0.18 + (BASE_Y - 0.18) / 2;
  rail.castShadow = true;
  group.add(rail);

  const castGeo = new THREE.BoxGeometry(0.55, 0.5, 0.55);
  const casts = new THREE.InstancedMesh(castGeo, darkMat, 8);
  let ci = 0;
  [y0 + 0.1, y0 + H - 0.25].forEach(y => {
    [[halfL - 0.28, halfW - 0.28], [halfL - 0.28, -halfW + 0.28],
     [-halfL + 0.28, -halfW + 0.28], [-halfL + 0.28, halfW - 0.28]].forEach(([x, z]) => {
      M.makeTranslation(x, y, z);
      casts.setMatrixAt(ci++, M);
    });
  });
  casts.instanceMatrix.needsUpdate = true;
  casts.castShadow = true;
  group.add(casts);

  // top + bottom side rails
  const railGeo = new THREE.BoxGeometry(L, 0.22, 0.22);
  ([[y0 + 0.05, halfW], [y0 + 0.05, -halfW], [y0 + H - 0.11, halfW], [y0 + H - 0.11, -halfW]] as const)
    .forEach(([y, z]) => {
      const r = new THREE.Mesh(railGeo, frameMat);
      r.position.set(0, y, z);
      group.add(r);
    });

  // ---- shell -----------------------------------------------------------
  // Far long wall (−Z) — solid, carries the openings.
  const far = new THREE.Mesh(new THREE.BoxGeometry(L, H, t), steel);
  far.position.set(0, y0 + H / 2, -halfW + t / 2);
  far.castShadow = true;
  far.receiveShadow = true;
  group.add(far);

  // Near long wall (+Z) — the cutaway, ghosted so the footprint reads.
  const near = new THREE.Mesh(new THREE.PlaneGeometry(L, H), steelGhost);
  near.rotation.y = Math.PI;
  near.position.set(0, y0 + H / 2, halfW - t / 2);
  near.userData.noShadow = true;
  group.add(near);

  // Closed end (−X).
  const endWall = new THREE.Mesh(new THREE.BoxGeometry(W, H, t), steelEnd);
  endWall.rotation.y = Math.PI / 2;
  endWall.position.set(-halfL + t / 2, y0 + H / 2, 0);
  endWall.castShadow = true;
  group.add(endWall);

  // Cargo doors (+X) — two leaves per box, lock rods, gold handle dot.
  for (let b = 0; b < p.count; b++) {
    const zc = -halfW + Wb * (b + 0.5);
    [-1, 1].forEach(s => {
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.16, H - 0.3, Wb / 2 - 0.12), steelEnd);
      leaf.position.set(halfL - 0.08, y0 + H / 2, zc + s * (Wb / 4));
      leaf.castShadow = true;
      group.add(leaf);
      [0.3, 0.7].forEach(f => {
        const rod = new THREE.Mesh(new THREE.BoxGeometry(0.1, H - 0.5, 0.1), darkMat);
        rod.position.set(halfL + 0.04, y0 + H / 2, zc + s * ((Wb / 2) * f));
        group.add(rod);
      });
    });
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), goldMat);
    handle.position.set(halfL + 0.1, y0 + H * 0.42, zc + Wb * 0.18);
    group.add(handle);
  }

  // Mated seams — shared steel walls with the pass-through cut visible.
  const seamMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(shade(hex, 0.95)), roughness: 0.55, metalness: 0.35 });
  for (let b = 1; b < p.count; b++) {
    const z = -halfW + Wb * b;
    const gw = 3.2, g0 = -1.6;                       // pass-through near mid-length
    const lenA = g0 - (-halfL + t);
    const segA = new THREE.Mesh(new THREE.BoxGeometry(lenA, H - 0.3, 0.14), seamMat);
    segA.position.set(-halfL + t + lenA / 2, y0 + (H - 0.3) / 2 + 0.06, z);
    segA.castShadow = true;
    group.add(segA);
    const lenB = halfL - 0.3 - (g0 + gw);
    const segB = new THREE.Mesh(new THREE.BoxGeometry(lenB, H - 0.3, 0.14), seamMat);
    segB.position.set(g0 + gw + lenB / 2, y0 + (H - 0.3) / 2 + 0.06, z);
    segB.castShadow = true;
    group.add(segB);
    const header = new THREE.Mesh(new THREE.BoxGeometry(gw, H - 0.3 - DOOR.h, 0.14), seamMat);
    header.position.set(g0 + gw / 2, y0 + DOOR.h + (H - 0.3 - DOOR.h) / 2, z);
    group.add(header);
    // seam rail on the roof line so the two boxes read as two boxes
    const seamRail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.22, 0.22), frameMat);
    seamRail.position.set(0, y0 + H - 0.11, z);
    group.add(seamRail);
  }

  // Roof — translucent so the plan reads from above too.
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(L, W), roofGhost);
  roof.rotation.x = -Math.PI / 2;
  roof.position.set(0, y0 + H - 0.06, 0);
  roof.userData.noShadow = true;
  group.add(roof);

  // ---- interior floor: LVP over the insulated run, marine ply elsewhere -
  const insLen = Math.min(d.insulatedBays * 8, L);          // insulated from the −X end
  const insEnd = -halfL + insLen;
  if (p.floor && insLen > 0) {
    const lvp = new THREE.Mesh(new THREE.BoxGeometry(insLen - 0.1, 0.08, W - 2 * t), lvpMat);
    lvp.position.set(-halfL + insLen / 2, y0 + 0.04, 0);
    lvp.receiveShadow = true;
    group.add(lvp);
  }
  const plyLen = p.floor ? L - insLen : L;
  if (plyLen > 0.2) {
    const ply = new THREE.Mesh(new THREE.BoxGeometry(plyLen - 0.1, 0.07, W - 2 * t), plyMat);
    ply.position.set(halfL - plyLen / 2, y0 + 0.035, 0);
    ply.receiveShadow = true;
    group.add(ply);
  }

  // ---- insulation liner: white panels along the insulated bays ---------
  if (insLen > 0) {
    const liner = new THREE.Mesh(new THREE.BoxGeometry(insLen, H - 0.5, 0.08), linerMat);
    liner.position.set(-halfL + insLen / 2, y0 + (H - 0.5) / 2 + 0.1, -halfW + t + 0.06);
    liner.receiveShadow = true;
    group.add(liner);
    const linerEnd = new THREE.Mesh(new THREE.BoxGeometry(0.08, H - 0.5, W - 0.6), linerMat);
    linerEnd.position.set(-halfL + t + 0.06, y0 + (H - 0.5) / 2 + 0.1, 0);
    group.add(linerEnd);
  }

  // ---- partitions per layout — white walls with a doorway gap ----------
  const partitionXs: number[] = [];
  if (p.layout === "split") partitionXs.push(insEnd);
  else if (p.layout === "office") partitionXs.push(-halfL + Math.min(10, L * 0.4));
  else if (p.layout === "str") {
    const x1 = -halfL + L * 0.35;
    partitionXs.push(x1, x1 + (p.size === "20" ? 4 : 5));
  }
  const gapW = 2.8, gapZ0 = halfW - 0.4 - gapW; // doorway near the cutaway side
  partitionXs.forEach(x => {
    const segA = new THREE.Mesh(new THREE.BoxGeometry(0.25, H - 0.4, gapZ0 + halfW - t), partMat);
    segA.position.set(x, y0 + (H - 0.4) / 2 + 0.08, (-halfW + t + gapZ0) / 2);
    segA.castShadow = true;
    group.add(segA);
    const segB = new THREE.Mesh(new THREE.BoxGeometry(0.25, H - 0.4, 0.4), partMat);
    segB.position.set(x, y0 + (H - 0.4) / 2 + 0.08, halfW - 0.2 - t);
    group.add(segB);
    const header = new THREE.Mesh(new THREE.BoxGeometry(0.25, H - 0.4 - DOOR.h, gapW), partMat);
    header.position.set(x, y0 + DOOR.h + (H - 0.4 - DOOR.h) / 2, gapZ0 + gapW / 2);
    group.add(header);
  });

  // ---- windows in the far wall — welded frame + glass ------------------
  const winXs = [0.22, 0.5, 0.74].slice(0, p.windows).map(f => -halfL + L * f);
  winXs.forEach(x => {
    const cy = y0 + WIN.sill + WIN.h / 2;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(WIN.w + 0.35, WIN.h + 0.35, 0.3), whiteBoxMat);
    frame.position.set(x, cy, -halfW + t);
    group.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(WIN.w - 0.1, WIN.h - 0.1, 0.34), glassMat);
    glass.position.set(x, cy, -halfW + t);
    group.add(glass);
  });

  // ---- man-doors in the far wall — 36-in steel, navy slab --------------
  const doorXs = [0.88, 0.62].slice(0, p.manDoors).map(f => -halfL + L * f);
  doorXs.forEach(x => {
    const caseF = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w + 0.4, DOOR.h + 0.25, 0.28), whiteBoxMat);
    caseF.position.set(x, y0 + (DOOR.h + 0.12) / 2, -halfW + t);
    group.add(caseF);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(DOOR.w, DOOR.h, 0.32), navyMat);
    slab.position.set(x, y0 + DOOR.h / 2, -halfW + t);
    group.add(slab);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), goldMat);
    knob.position.set(x + DOOR.w / 2 - 0.3, y0 + DOOR.h * 0.48, -halfW + t + 0.22);
    group.add(knob);
  });

  // ---- mini-split head high on the far wall when hvac ------------------
  if (d.hvac) {
    const head = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.95, 0.7), whiteBoxMat);
    head.position.set(-halfL + 2.2, y0 + H - 1.3, -halfW + t + 0.45);
    head.castShadow = true;
    group.add(head);
    const vent = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.16, 0.1), darkMat);
    vent.position.set(-halfL + 2.2, y0 + H - 1.62, -halfW + t + 0.82);
    group.add(vent);
  }

  // ---- electrical: gray panel on the closed end wall -------------------
  if (d.electrical) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.4, 1.3), new THREE.MeshStandardMaterial({ color: 0xb7bcc2, roughness: 0.4, metalness: 0.5 }));
    panel.position.set(-halfL + t + 0.24, y0 + H * 0.5, halfW - 2);
    group.add(panel);
  }

  // ---- lean-to: 8-ft metal shed roof on PT posts off the near long wall -
  if (p.leanTo) {
    const depth = 8, over = 1;
    const ptMat = new THREE.MeshStandardMaterial({ color: 0x9d7844, roughness: 0.9 });
    const attachY = y0 + H - 0.2;
    const eaveY = y0 + 6.4;
    const slopeLT = Math.atan2(attachY - eaveY, depth);
    const run = depth + over;
    const hyp = run / Math.cos(slopeLT);
    const rib = makeCorrugationTexture("#3a3d42");
    rib.repeat.set(Math.max(8, Math.round((L + 1) / 0.75)), 1);
    const ltRoof = new THREE.Mesh(new THREE.BoxGeometry(L + 1, 0.09, hyp),
      new THREE.MeshStandardMaterial({ map: rib, roughness: 0.45, metalness: 0.55 }));
    ltRoof.rotation.x = slopeLT;
    ltRoof.position.set(0, (attachY + (attachY - Math.tan(slopeLT) * run)) / 2, halfW + run / 2);
    ltRoof.castShadow = true;
    group.add(ltRoof);
    // posts every ≤ 8 ft under the outer beam
    const nP = Math.ceil(L / 8) + 1;
    const postH = eaveY - 0.6 - 0.18;
    const postGeo = new THREE.BoxGeometry(0.3, postH, 0.3);
    const posts = new THREE.InstancedMesh(postGeo, ptMat, nP);
    for (let i = 0; i < nP; i++) {
      M.makeTranslation(-halfL + (i * L) / (nP - 1), 0.18 + postH / 2, halfW + depth);
      posts.setMatrixAt(i, M);
    }
    posts.instanceMatrix.needsUpdate = true;
    posts.castShadow = true;
    group.add(posts);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(L + 0.5, 0.6, 0.25), ptMat);
    beam.position.set(0, eaveY - 0.5, halfW + depth);
    beam.castShadow = true;
    group.add(beam);
    // mid purlin under the panel run
    const purlin = new THREE.Mesh(new THREE.BoxGeometry(L + 0.5, 0.2, 0.25), ptMat);
    purlin.rotation.x = slopeLT;
    purlin.position.set(0, attachY - Math.tan(slopeLT) * (depth / 2) - 0.16, halfW + depth / 2);
    group.add(purlin);
  }

  // ---- dimension callouts — length across the front, width up the side --
  // Part of the disposable group; visibility is re-applied after rebuilds.
  const dimY = 0.05;
  const dimF = halfW + (p.leanTo ? 10.6 : 2.4); // clear of the 8-ft lean-to
  group.add(makeDimensions([
    { from: [-halfL, dimY, dimF], to: [halfL, dimY, dimF], label: formatFeet(L) },
    { from: [halfL + 2.4, dimY, -halfW], to: [halfL + 2.4, dimY, halfW], label: formatFeet(W) },
  ]));

  // NOTE: the sun lives in the one-time scene setup, not this disposable
  // group — rebuilding here must never orphan a 2048px shadow map.
  return group;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export default function ContainerScene(p: ContainerSceneProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<Core | null>(null);
  const [hint, setHint] = React.useState(true);
  const [showDims, setShowDims] = React.useState(true); // dimension callouts, default on
  const showDimsRef = React.useRef(true);
  showDimsRef.current = showDims;

  React.useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    // CAD-grade output: filmic tone curve + sRGB (r152+ default, asserted here)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
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
    scene.fog = new THREE.Fog(0xd9e4ef, 160, 900);

    // real specular for corten steel: PMREM room environment, built once —
    // OUTSIDE the disposable group, so option clicks never touch it
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.55;

    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
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
    sun.position.set(20, 30, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 200;
    sun.shadow.bias = -0.0004;
    scene.add(sun, sun.target);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 2000);
    camera.position.set(20, 11, 24);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.5; // never under the ground
    controls.minDistance = 6;
    controls.maxDistance = 160;

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

    const core: Core = { renderer, scene, camera, controls, sun, group: null, bg, raf: 0, ro: null as unknown as ResizeObserver, fitR: 0, fitC: new THREE.Vector3(), fly: null };

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

  const { size, count, layout, windows, manDoors, electrical, hvac, floor, leanTo, containerColor } = p;
  const dims = CONTAINER_DIMS[size];
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    const first = !core.group;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const group = buildWorld(p);
    core.scene.add(group);
    core.group = group;

    // dimension callouts are rebuilt with the group — re-apply the toggle
    const dg = group.getObjectByName(DIMS_NAME);
    if (dg) dg.visible = showDimsRef.current;

    // the persistent sun follows the footprint; its one shadow map re-covers it
    core.sun.position.set(dims.lengthFt * 0.5 + 14, 26, 20);
    const s = Math.max(dims.lengthFt, dims.widthFt * count + (leanTo ? 9 : 0)) + 12;
    const sc = core.sun.shadow.camera;
    sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s;
    sc.updateProjectionMatrix();

    core.controls.maxDistance = Math.max(70, dims.lengthFt * 4);
    // re-fit on every rebuild: snap on first build, glide after option clicks
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
  }, [size, count, layout, windows, manDoors, electrical, hvac, floor, leanTo, containerColor]);

  // the Dims chip toggles the callout group without a rebuild
  React.useEffect(() => {
    const dg = coreRef.current?.group?.getObjectByName(DIMS_NAME);
    if (dg) dg.visible = showDims;
  }, [showDims]);

  const flyTo = (preset: "front" | "inside" | "corner") => {
    const core = coreRef.current;
    if (!core) return;
    const { lengthFt: L, heightFt: H } = dims;
    const W = dims.widthFt * count;
    const tgt = new THREE.Vector3(0, BASE_Y + H * 0.42, 0);
    let pos: THREE.Vector3;
    if (preset === "front") {
      pos = new THREE.Vector3(0, BASE_Y + H * 0.55, Math.max(16, L * 0.85 + 8));
    } else if (preset === "inside") {
      // hover just outside the ghosted wall, looking through the cutaway
      pos = new THREE.Vector3(-L * 0.08, BASE_Y + H * 0.62, W * 1.3 + 4);
      tgt.set(-L * 0.12, BASE_Y + H * 0.35, -W * 0.2);
    } else {
      const dd = Math.max(16, L * 0.95 + W * 0.6);
      pos = new THREE.Vector3(dd * 0.8, H + 8, dd);
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
        aria-label={`3D cutaway — ${count > 1 ? `${count} × ` : ""}${dims.label} container, ${layout} layout, ${windows} window(s), ${manDoors} man-door(s)${hvac ? ", mini-split" : ""}${floor ? ", finished floor" : ""}${leanTo ? ", lean-to" : ""}`}
      />
      <div className="absolute left-2 top-2 flex gap-1.5">
        <button type="button" className={btnCls} onClick={() => flyTo("front")}>Front</button>
        <button type="button" className={btnCls} onClick={() => flyTo("inside")}>Inside</button>
        <button type="button" className={btnCls} onClick={() => flyTo("corner")}>Corner</button>
        <button type="button" aria-pressed={showDims}
          className={btnCls + (showDims ? " ring-1 ring-[hsl(var(--safety-hi))]" : " opacity-70")}
          onClick={() => setShowDims(v => !v)}>
          Dims
        </button>
      </div>
      <div className="absolute bottom-2 right-2">
        <button
          type="button"
          className={btnCls}
          title="Download .glb — opens in Omniverse, Blender, SketchUp, Revit"
          onClick={() => { const g = coreRef.current?.group; if (g) exportGroupAsGlb(g, "mvs-container.glb"); }}
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
