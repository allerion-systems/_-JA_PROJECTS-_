import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  GARAGE_DOOR_SIZES, garageGeometry,
  type GarageDoor, type GarageParams, type GarageWall,
} from "@/bimGarage";
import { DIMS_NAME, formatFeet, makeDimensions } from "@/dimensions";
import { exportGroupAsGlb } from "@/exportModel";
import {
  applyAnisotropy, contactShadow, disposeObject, enhanceRenderer, fitShadowCamera,
  makeComposer, makeGrassDisc, makeGroundPlane, makeRibTexture,
  makeSky, sharedRoughnessMap, tuneSunShadow, type ComposerRig,
} from "@/sceneQuality";

/* ------------------------------------------------------------------------
   Parametric 3D metal garage / carport. Feet are world units. Length runs
   along X (front end at +X), width along Z (left side at +Z as a buyer
   facing the front sees it). Renderer/camera/lights build once; the
   parametric group is rebuilt and disposed on every change (ShedScene
   pattern). Canvas textures only — nothing fetched. All three industry
   roof profiles render distinctly: rounded-eave regular (low arch,
   horizontal panels), boxed-eave A-frame (horizontal panels, boxed
   fascia), vertical A-frame (eave-to-ridge ribs + ridge cap). Enclosure,
   doors, windows, lean-tos and the chosen roof/trim/side colors all
   render from the same GarageParams the takeoff prices.
   ---------------------------------------------------------------------- */

const GOLD = 0xfac400;   // --safety-hi
const NAVY = 0x142f63;   // --marine

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

/** Transposed rib texture: HORIZONTAL panel courses — one major rib per
    repeat along V. The regular/boxed-eave "panels run the length" look. */
function makeHRibTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 32; c.height = 256;
  const g = c.getContext("2d")!;
  const px = (f: number) => f * 4;
  g.fillStyle = shade(color, 1);
  g.fillRect(0, 0, 32, 256);
  const pan = g.createLinearGradient(0, px(8), 0, px(64));
  pan.addColorStop(0, shade(color, 0.94));
  pan.addColorStop(0.5, shade(color, 1.03));
  pan.addColorStop(1, shade(color, 0.97));
  g.fillStyle = pan;
  g.fillRect(0, px(8), 32, 256 - px(8));
  const rib = g.createLinearGradient(0, 0, 0, px(8));
  rib.addColorStop(0, shade(color, 1.38));
  rib.addColorStop(0.6, shade(color, 1.2));
  rib.addColorStop(0.62, shade(color, 0.58));
  rib.addColorStop(1, shade(color, 0.82));
  g.fillStyle = rib;
  g.fillRect(0, 0, 32, px(8));
  g.fillStyle = shade(color, 1.12);
  g.fillRect(0, px(34), 32, 3);
  g.fillStyle = shade(color, 0.86);
  g.fillRect(0, px(34) + 3, 32, 3);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Horizontal slat lines suggesting a curtain-style roll-up door. */
function makeRollupTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 8; c.height = 256;
  const g = c.getContext("2d")!;
  const slats = 14;
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

/** Bounds of the building itself — meshes flagged noFit are skipped. */
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

const T = 0.22; // wall panel thickness

function buildWorld(p: GarageParams): THREE.Group {
  const group = new THREE.Group();
  const g = garageGeometry(p);
  const L = g.lengthFt, W = g.widthFt, H = g.legFt;
  const halfL = L / 2, halfW = W / 2;
  const aFrame = p.roofStyle !== "regular";
  const rise = halfW * ((aFrame ? 3 : 2) / 12);
  const slope = Math.atan2(rise, halfW);
  const rafter = Math.sqrt(halfW * halfW + rise * rise) + (aFrame ? 0.7 : 0.15);
  const roofHex = p.roofColor ?? "#3a3d42";
  const trimHex = p.trimColor ?? "#f2f0e9";
  const sideHex = p.sideColor ?? "#b9bec4";
  const vertical = p.roofStyle === "vertical";

  // anchor surface: slab (concrete), mat (asphalt), or bare ground
  const slabH = p.anchors === "concrete" ? 0.32 : p.anchors === "asphalt" ? 0.16 : 0.04;
  const y0 = slabH; // top of the pad = bottom of the legs

  // ---- materials ---------------------------------------------------------
  const rough = sharedRoughnessMap(); // module-cached — never disposed here
  const galv = new THREE.MeshStandardMaterial({ color: 0x9aa1a8, roughness: 0.38, metalness: 0.72, envMapIntensity: 0.9 });
  const trimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(trimHex), roughness: 0.5, metalness: 0.35, envMapIntensity: 0.7 });
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.5, metalness: 0.3 });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00, envMapIntensity: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbcd6e6, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.55, envMapIntensity: 1,
  });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xb9b7ae, roughness: 0.95 });
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x33353a, roughness: 0.98 });

  /** Wall-panel material: rib orientation follows the roof tier — vertical
      builds sheet the walls vertically, regular/boxed-eave horizontally. */
  const panelMat = (runFt: number, hFt: number) => {
    if (vertical) {
      const tex = makeRibTexture(sideHex);
      tex.repeat.set(Math.max(4, Math.round(runFt / 0.75)), 1);
      return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.55, envMapIntensity: 1.0, roughnessMap: rough });
    }
    const tex = makeHRibTexture(sideHex);
    tex.repeat.set(1, Math.max(3, Math.round(hFt / 0.75)));
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.55, envMapIntensity: 1.0, roughnessMap: rough });
  };
  /** Roof-plane material: vertical style ribs run eave-to-ridge (vary along
      the length axis U); regular/boxed ribs run the length (vary along V). */
  const roofMat = (roofL: number) => {
    if (vertical) {
      const tex = makeRibTexture(roofHex);
      tex.repeat.set(Math.max(8, Math.round(roofL / 0.75)), 1);
      return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.65, envMapIntensity: 1.0, roughnessMap: rough });
    }
    const tex = makeHRibTexture(roofHex);
    tex.repeat.set(1, Math.max(3, Math.round(rafter / 0.75)));
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.65, envMapIntensity: 1.0, roughnessMap: rough });
  };

  // ---- ground dressing (excluded from camera fit) ------------------------
  group.add(makeGrassDisc(Math.max(L, W) * 1.5 + 14));
  group.add(contactShadow(L + 16, W + 22));

  // ---- anchor surface ----------------------------------------------------
  if (p.anchors === "concrete") {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(L + 2, slabH, W + 2), concrete);
    slab.position.y = slabH / 2;
    slab.receiveShadow = true;
    group.add(slab);
  } else if (p.anchors === "asphalt") {
    const mat = new THREE.Mesh(new THREE.BoxGeometry(L + 4, slabH, W + 5), asphalt);
    mat.position.y = slabH / 2;
    mat.receiveShadow = true;
    group.add(mat);
  }

  // ---- frame: legs, base rails, eave rails — always built, visible when
  //      a side is open ----------------------------------------------------
  const M = new THREE.Matrix4();
  const legGeo = new THREE.BoxGeometry(0.21, H, 0.21);
  const legZ = halfW - 0.32;
  const legMesh = new THREE.InstancedMesh(legGeo, galv, 2 * (g.bays + 1));
  let li = 0;
  for (let i = 0; i <= g.bays; i++) {
    const x = -halfL + (L * i) / g.bays;
    for (const s of [1, -1] as const) {
      M.makeTranslation(x, y0 + H / 2, s * legZ);
      legMesh.setMatrixAt(li++, M);
    }
  }
  legMesh.instanceMatrix.needsUpdate = true;
  legMesh.castShadow = true;
  group.add(legMesh);
  // base + eave rails along both sides
  for (const s of [1, -1] as const) {
    const base = new THREE.Mesh(new THREE.BoxGeometry(L, 0.18, 0.24), galv);
    base.position.set(0, y0 + 0.09, s * legZ);
    base.castShadow = true;
    group.add(base);
    const eave = new THREE.Mesh(new THREE.BoxGeometry(L, 0.2, 0.24), galv);
    eave.position.set(0, y0 + H - 0.1, s * legZ);
    eave.castShadow = true;
    group.add(eave);
  }
  // rebar pins visible at legs on bare ground
  if (p.anchors === "ground") {
    const pinGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 6);
    const pins = new THREE.InstancedMesh(pinGeo, new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 0.8, metalness: 0.4 }), 2 * (g.bays + 1));
    let pi = 0;
    for (let i = 0; i <= g.bays; i++) {
      const x = -halfL + (L * i) / g.bays;
      for (const s of [1, -1] as const) {
        M.makeTranslation(x + 0.28, y0 + 0.22, s * (legZ + 0.28));
        pins.setMatrixAt(pi++, M);
      }
    }
    pins.instanceMatrix.needsUpdate = true;
    group.add(pins);
  }

  // ---- roof --------------------------------------------------------------
  const roofL = L + (aFrame ? 1.0 : 0.2);
  const ridgeY = y0 + H + rise;
  const slopeMid = (s: 1 | -1) => {
    const half = rafter / 2;
    return new THREE.Vector3(0, ridgeY - Math.sin(slope) * half + 0.05, s * Math.cos(slope) * half);
  };
  ([1, -1] as const).forEach(sideZ => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(roofL, 0.11, rafter), roofMat(roofL));
    m.rotation.x = sideZ * slope;
    m.position.copy(slopeMid(sideZ));
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);

    const eaveY = ridgeY - Math.sin(slope) * rafter;
    const eaveZ = sideZ * Math.cos(slope) * rafter;
    if (p.roofStyle === "regular") {
      // rounded eave: quarter-round cap curling from the roof edge down
      const capR = 0.85;
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(capR, capR, roofL, 14, 1, false, sideZ === 1 ? 0 : Math.PI, Math.PI / 2),
        roofMat(roofL),
      );
      cap.rotation.z = Math.PI / 2;
      cap.position.set(0, eaveY - capR + 0.12, eaveZ - sideZ * 0.1);
      cap.castShadow = true;
      group.add(cap);
    } else {
      // boxed eave / vertical: squared fascia box in trim color
      const fascia = new THREE.Mesh(new THREE.BoxGeometry(roofL, 0.55, 0.16), trimMat);
      fascia.position.set(0, eaveY - 0.14, eaveZ);
      fascia.castShadow = true;
      group.add(fascia);
      // gold drip-edge accent
      const e = new THREE.Mesh(new THREE.BoxGeometry(roofL, 0.06, 0.06), goldMat);
      e.position.set(0, eaveY + 0.1, eaveZ);
      group.add(e);
    }
  });
  if (vertical) {
    // the vertical roof's signature ridge cap, in trim color
    const cap = new THREE.Mesh(new THREE.BoxGeometry(roofL + 0.15, 0.18, 0.9), trimMat);
    cap.position.set(0, ridgeY + 0.14, 0);
    cap.castShadow = true;
    group.add(cap);
    // rake trim down both end slopes
    ([1, -1] as const).forEach(endX => {
      ([1, -1] as const).forEach(sideZ => {
        const rk = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, rafter), trimMat);
        rk.rotation.x = sideZ * slope;
        const mid = slopeMid(sideZ);
        rk.position.set(endX * (roofL / 2), mid.y + 0.1, mid.z);
        group.add(rk);
      });
    });
  } else if (aFrame) {
    const ridge = new THREE.Mesh(
      new THREE.BoxGeometry(roofL, 0.14, 0.4),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(shade(roofHex, 0.8)), roughness: 0.45, metalness: 0.6 }),
    );
    ridge.position.set(0, ridgeY + 0.1, 0);
    ridge.castShadow = true;
    group.add(ridge);
  }

  // ---- side walls (left = +Z, right = −Z, facing the front) --------------
  const sideWall = (sideZ: 1 | -1, state: GarageParams["leftSide"]) => {
    if (state === "open") return;
    const h = state === "full" ? H : Math.min(3, H - 1.5);
    const m = new THREE.Mesh(new THREE.BoxGeometry(L, h, T), panelMat(L, h));
    // panels hang from the eave — full reaches grade, partial stays open below
    m.position.set(0, y0 + H - h / 2, sideZ * (halfW - T / 2));
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);
  };
  sideWall(1, p.leftSide);
  sideWall(-1, p.rightSide);

  // ---- end walls + gables (front = +X, back = −X) ------------------------
  const tri = new THREE.Shape();
  tri.moveTo(-halfW, 0); tri.lineTo(halfW, 0); tri.lineTo(0, rise); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: T, bevelEnabled: false });
  const endWall = (endX: 1 | -1, state: GarageParams["frontEnd"]) => {
    if (state === "open") return;
    // gable triangle above the eave — both "gable" and "full" have it
    const gm = new THREE.Mesh(triGeo.clone(), panelMat(W, rise + 1));
    gm.rotation.y = Math.PI / 2;
    gm.position.set(endX * halfL - (endX === 1 ? T : 0), y0 + H, 0);
    gm.castShadow = true;
    group.add(gm);
    if (state === "full") {
      const m = new THREE.Mesh(new THREE.BoxGeometry(W, H, T), panelMat(W, H));
      m.rotation.y = Math.PI / 2;
      m.position.set(endX * (halfL - T / 2), y0 + H / 2, 0);
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
    }
  };
  endWall(1, p.frontEnd);
  endWall(-1, p.backEnd);

  // corner trim wherever a closed wall meets a corner
  const cornerGeo = new THREE.BoxGeometry(0.34, H, 0.34);
  const cornerMesh = new THREE.InstancedMesh(cornerGeo, trimMat, 4);
  let ci = 0;
  const closedSide = (s: 1 | -1) => (s === 1 ? p.leftSide : p.rightSide) !== "open";
  const closedEnd = (e: 1 | -1) => (e === 1 ? p.frontEnd : p.backEnd) === "full";
  ([1, -1] as const).forEach(ex => ([1, -1] as const).forEach(sz => {
    if (!closedSide(sz) && !closedEnd(ex)) return;
    M.makeTranslation(ex * (halfL - 0.17), y0 + H / 2, sz * (halfW - 0.17));
    cornerMesh.setMatrixAt(ci++, M);
  }));
  cornerMesh.count = ci;
  cornerMesh.instanceMatrix.needsUpdate = true;
  cornerMesh.castShadow = true;
  group.add(cornerMesh);

  // ---- doors -------------------------------------------------------------
  // Doors sit on their named wall; each wall spreads its doors evenly.
  const rollTex = makeRollupTexture();
  const rollMat = new THREE.MeshStandardMaterial({ map: rollTex, roughness: 0.45, metalness: 0.5 });
  const byWall = new Map<GarageWall, GarageDoor[]>();
  for (const d of p.doors) byWall.set(d.wall, [...(byWall.get(d.wall) ?? []), d]);
  byWall.forEach((doors, wall) => {
    const onEnd = wall === "front" || wall === "back";
    const wallLen = onEnd ? W : L;
    doors.forEach((d, i) => {
      const size = GARAGE_DOOR_SIZES[d.type];
      const dw = Math.min(size.w, wallLen - 2);
      const dh = Math.min(size.h, H - 0.6);
      const along = (wallLen * (i + 1)) / (doors.length + 1) - wallLen / 2;
      const u = new THREE.Group();
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(dw + 0.6, dh + 0.4, 0.1), trimMat);
      jamb.position.set(0, (dh + 0.2) / 2, 0.05);
      jamb.castShadow = true;
      u.add(jamb);
      if (d.type === "walkin") {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(dw, dh, 0.12), navyMat);
        leaf.position.set(0, dh / 2, 0.12);
        leaf.castShadow = true;
        u.add(leaf);
        const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), goldMat);
        knob.position.set(dw / 2 - 0.3, dh * 0.48, 0.22);
        u.add(knob);
      } else {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(dw, dh, 0.13), rollMat);
        leaf.position.set(0, dh / 2, 0.12);
        leaf.castShadow = true;
        u.add(leaf);
        // the rolled coil above the opening
        const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, dw + 0.4, 12), galv);
        coil.rotation.z = Math.PI / 2;
        coil.position.set(0, dh + 0.34, 0.14);
        u.add(coil);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(dw, 0.2, 0.08), navyMat);
        bar.position.set(0, 0.4, 0.2);
        u.add(bar);
      }
      // orient: +X front, −X back, +Z left, −Z right — face outward
      if (wall === "front") { u.rotation.y = Math.PI / 2; u.position.set(halfL + 0.02, y0, along); }
      if (wall === "back") { u.rotation.y = -Math.PI / 2; u.position.set(-halfL - 0.02, y0, along); }
      if (wall === "left") { u.position.set(along, y0, halfW + 0.02); }
      if (wall === "right") { u.rotation.y = Math.PI; u.position.set(along, y0, -halfW - 0.02); }
      group.add(u);
    });
  });

  // ---- windows — 30 × 30 units on closed walls ---------------------------
  if (p.windows > 0) {
    const WIN = 2.5;
    const spots: { x: number; z: number; rotY: number }[] = [];
    const sideSpots = (sideZ: 1 | -1) => {
      for (let i = 0; i < 2; i++)
        spots.push({ x: -L / 4 + (i * L) / 2, z: sideZ * (halfW + 0.05), rotY: sideZ === 1 ? 0 : Math.PI });
    };
    if (p.leftSide === "full") sideSpots(1);
    if (p.rightSide === "full") sideSpots(-1);
    if (p.frontEnd === "full") spots.push({ x: halfL + 0.05, z: -W / 4, rotY: Math.PI / 2 }, { x: halfL + 0.05, z: W / 4, rotY: Math.PI / 2 });
    if (p.backEnd === "full") spots.push({ x: -halfL - 0.05, z: -W / 4, rotY: -Math.PI / 2 }, { x: -halfL - 0.05, z: W / 4, rotY: -Math.PI / 2 });
    if (spots.length === 0) sideSpots(1); // nothing closed — show them anyway
    for (let i = 0; i < p.windows; i++) {
      const s = spots[i % spots.length];
      const u = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(WIN + 0.35, WIN + 0.35, 0.14), trimMat);
      frame.castShadow = true;
      u.add(frame);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(WIN - 0.15, WIN - 0.15, 0.12), glassMat);
      glass.position.z = 0.03;
      u.add(glass);
      const mull = new THREE.Mesh(new THREE.BoxGeometry(0.07, WIN - 0.1, 0.05), trimMat);
      mull.position.z = 0.09;
      u.add(mull);
      u.position.set(s.x + (i >= spots.length ? 1.2 : 0), y0 + Math.min(H - 1.6, 4.2), s.z);
      u.rotation.y = s.rotY;
      group.add(u);
    }
  }

  // ---- lean-to wings — 6 ft deep off the eave side, per side -------------
  const leanTo = (sideZ: 1 | -1) => {
    const depth = 6;
    const drop = 1.5;
    const lSlope = Math.atan2(drop, depth);
    const run = Math.sqrt(depth * depth + drop * drop) + 0.4;
    const highY = y0 + H - 0.45;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(L, 0.1, run), roofMat(L));
    roof.rotation.x = sideZ * lSlope;
    roof.position.set(0, highY - drop / 2 + 0.05, sideZ * (halfW + (Math.cos(lSlope) * run) / 2 - 0.2));
    roof.castShadow = true;
    group.add(roof);
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(L, 0.4, 0.12), trimMat);
    fascia.position.set(0, highY - drop - 0.08, sideZ * (halfW + Math.cos(lSlope) * run - 0.3));
    fascia.castShadow = true;
    group.add(fascia);
    const postH = highY - drop - 0.3;
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.2, postH, 0.2), galv, g.bays + 1);
    for (let i = 0; i <= g.bays; i++) {
      M.makeTranslation(-halfL + (L * i) / g.bays, postH / 2 + 0.05, sideZ * (halfW + depth - 0.35));
      posts.setMatrixAt(i, M);
    }
    posts.instanceMatrix.needsUpdate = true;
    posts.castShadow = true;
    group.add(posts);
  };
  if (p.leanTo === "left" || p.leanTo === "both") leanTo(1);
  if (p.leanTo === "right" || p.leanTo === "both") leanTo(-1);

  // ---- dimension callouts — length along a side, width across the front --
  const dimY = 0.05;
  const leanPad = (s: 1 | -1) =>
    (p.leanTo === "both" || (s === 1 && p.leanTo === "left") || (s === -1 && p.leanTo === "right")) ? 7 : 0;
  group.add(makeDimensions([
    { from: [-halfL, dimY, halfW + 3 + leanPad(1)], to: [halfL, dimY, halfW + 3 + leanPad(1)], label: formatFeet(L) },
    { from: [halfL + 3, dimY, -halfW], to: [halfL + 3, dimY, halfW], label: formatFeet(W) },
  ]));

  // NOTE: the sun lives in the one-time scene setup, not this disposable
  // group — rebuilding here must never orphan a 2048px shadow map.
  return group;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

const ROOF_LABEL = { regular: "regular rounded-eave", boxedEave: "boxed-eave A-frame", vertical: "vertical-panel A-frame" } as const;

export default function GarageScene(p: GarageParams) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<Core | null>(null);
  const [hint, setHint] = React.useState(true);
  const [showDims, setShowDims] = React.useState(true);
  const showDimsRef = React.useRef(true);
  showDimsRef.current = showDims;

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
    scene.fog = new THREE.Fog(0xd9e4ef, 200, 1100);

    // real specular for steel panels: PMREM room environment, built once —
    // OUTSIDE the disposable group, so option clicks never touch it
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.25; // specular sheen only — the sun models the form

    // soft-edged textured ground that melts into the horizon haze
    const ground = makeGroundPlane({ radius: 1100, base: "#8a9a6e", horizon: "#e2e6d8" });
    scene.add(ground);

    const ambient = new THREE.AmbientLight(0xe8eef8, 0.4);
    const hemi = new THREE.HemisphereLight(0xd2ddec, 0x8b8a78, 0.45);
    scene.add(ambient, hemi);

    // sun + its one shadow map are created once; the rebuild effect only
    // repositions it and resizes the shadow camera to the new footprint
    const sun = new THREE.DirectionalLight(0xfff2dc, 2.9);
    sun.position.set(-30, 44, 14);
    sun.castShadow = true;
    tuneSunShadow(sun); // 2048 desktop / 1024 coarse + tuned bias
    scene.add(sun, sun.target);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 2400);
    camera.position.set(38, 18, 44);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.5; // never under the ground
    controls.minDistance = 10;
    controls.maxDistance = 240;

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

  // one string key covers every priced + cosmetic field, doors array included
  const paramsKey = JSON.stringify([
    p.widthFt, p.lengthFt, p.legHeightFt, p.roofStyle, p.frameGauge, p.panelGauge,
    p.leftSide, p.rightSide, p.frontEnd, p.backEnd, p.doors, p.windows,
    p.anchors, p.leanTo, p.certified, p.roofColor, p.trimColor, p.sideColor,
  ]);
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    const first = !core.group;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const group = buildWorld(p);
    core.scene.add(group);
    core.group = group;

    // dims visibility survives rebuilds
    const dg = group.getObjectByName(DIMS_NAME);
    if (dg) dg.visible = showDimsRef.current;

    // the persistent sun follows the footprint; its one shadow map is
    // re-fitted tight to the new model bounds
    const g = garageGeometry(p);
    core.sun.position.set(-(g.lengthFt * 0.8 + 20), 32 + g.legFt, g.lengthFt * 0.25 + 12);
    fitShadowCamera(core.sun, group);
    applyAnisotropy(core.renderer, group); // crisp textures at grazing angles

    core.controls.maxDistance = Math.max(140, g.lengthFt * 4);
    // re-fit on every rebuild: snap on first build, glide after option clicks
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  // the Dims chip toggles the callout group without a rebuild
  React.useEffect(() => {
    const dg = coreRef.current?.group?.getObjectByName(DIMS_NAME);
    if (dg) dg.visible = showDims;
  }, [showDims]);

  const flyTo = (preset: "front" | "corner" | "side") => {
    const core = coreRef.current;
    if (!core) return;
    const g = garageGeometry(p);
    const peak = g.legFt + g.rise;
    const tgt = new THREE.Vector3(0, peak * 0.45, 0);
    let pos: THREE.Vector3;
    if (preset === "front") {
      // the +X gable end: doors, gable, roof profile in frame
      const d = Math.max(30, g.widthFt * 1.6 + 12);
      pos = new THREE.Vector3(g.lengthFt / 2 + d, g.legFt * 0.6 + 4, d * 0.35);
    } else if (preset === "side") {
      pos = new THREE.Vector3(4, g.legFt * 0.55 + 3,
        Math.max(28, g.lengthFt * 0.9 + g.widthFt * 0.5 + 10));
    } else {
      const d = Math.max(32, g.lengthFt * 1.0 + g.widthFt * 0.55);
      pos = new THREE.Vector3(d * 0.85, peak * 0.85 + 7, d);
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
        aria-label={`3D preview — ${p.widthFt} × ${p.lengthFt} × ${p.legHeightFt} ft, ${ROOF_LABEL[p.roofStyle]} roof, left side ${p.leftSide}, right side ${p.rightSide}, front end ${p.frontEnd}, back end ${p.backEnd}, ${p.doors.length} door(s), ${p.windows} window(s), ${p.anchors} anchors, lean-to ${p.leanTo}`}
      />
      <div className="absolute left-2 top-2 flex max-w-[54%] flex-wrap gap-1.5">
        <button type="button" className={btnCls} onClick={() => flyTo("front")}>Front</button>
        <button type="button" className={btnCls} onClick={() => flyTo("corner")}>Corner</button>
        <button type="button" className={btnCls} onClick={() => flyTo("side")}>Side</button>
        <button type="button" aria-pressed={showDims}
          className={btnCls + (showDims ? " ring-1 ring-[hsl(var(--safety-hi))]" : " opacity-70")}
          onClick={() => setShowDims(v => !v)}>
          Dims
        </button>
        <button
          type="button"
          className={btnCls}
          title="Download .glb — opens in Omniverse, Blender, SketchUp, Revit"
          onClick={() => { const g = coreRef.current?.group; if (g) exportGroupAsGlb(g, "mvs-garage.glb"); }}
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
