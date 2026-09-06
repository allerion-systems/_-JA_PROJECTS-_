import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { spaced, rafterLen, resolveShedOpenings, shedWallLen, SHED_DOOR, SHED_WIN, type ShedParams, type ShedWall } from "@/bim";
import { DIMS_NAME, formatFeet, makeDimensions } from "@/dimensions";
import { exportGroupAsGlb } from "@/exportModel";

/* ------------------------------------------------------------------------
   Parametric 3D shed. Feet are world units. Length runs along X, width
   along Z, door wall faces +Z. The stud counts and rafter spacing come
   from the same bim.ts helpers the estimate uses, so what you see is what
   the sheet prices. Renderer/camera/controls build once; the parametric
   group is rebuilt and disposed on every change (ScreenScene pattern).

   Every priced option renders: doors (trimmed, hinged), windows (frame +
   glass + muntins), ramp, loft (through the framing cutaway), cupola,
   metal vs ready roof, vinyl lap vs housewrap, stick vs truss framing.
   sidingColor / roofColor are cosmetic-only props — never priced.
   ---------------------------------------------------------------------- */

const NAVY = 0x142f63;   // --marine
const GOLD = 0xfac400;   // --safety-hi
const TRIM = 0xf4f2ea;   // trim boards / fascia
const OSB_TAN = 0xc9a35e;

export type ShedSceneProps = ShedParams & {
  /** Cosmetic only — chosen at order, never priced. CSS hex like "#7d2a26". */
  sidingColor?: string;
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
  fitR: number;            // bounding-sphere radius of the current building
  fitC: THREE.Vector3;     // …and its center
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

/** Horizontal vinyl-lap suggestion: one course band per ~6 in of wall. */
function makeLapTexture(color: string, wallHFt: number): THREE.CanvasTexture {
  const courses = Math.max(8, Math.round(wallHFt * 2)); // 6-in exposure
  const c = document.createElement("canvas");
  c.width = 8; c.height = 512;
  const g = c.getContext("2d")!;
  const ch = 512 / courses;
  for (let i = 0; i < courses; i++) {
    const y = i * ch;
    const grad = g.createLinearGradient(0, y, 0, y + ch);
    grad.addColorStop(0, shade(color, 1.07));
    grad.addColorStop(0.8, shade(color, 0.96));
    grad.addColorStop(1, shade(color, 0.78));
    g.fillStyle = grad;
    g.fillRect(0, y, 8, ch);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Vertical rib stripes for 29-ga metal panels; repeat along the panel run. */
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

/** Soft radial contact shadow under the building. */
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

const FLOOR_TOP = 0.95; // skid 0.3 + 2×8 joist 0.62 + deck

function buildWorld(p: ShedSceneProps): THREE.Group {
  const group = new THREE.Group();
  const L = p.lengthFt, W = p.widthFt, H = p.wallHFt;
  const halfL = L / 2, halfW = W / 2;
  const rise = halfW * (p.pitch / 12);
  const rafter = rafterLen(halfW, p.pitch);
  const slope = Math.atan2(rise, halfW);
  const sidingHex = p.sidingColor ?? "#e8e4da";
  const roofHex = p.roofColor ?? "#3a3d42";

  // ---- materials -------------------------------------------------------
  const wood = new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 0.85 });
  const woodPT = new THREE.MeshStandardMaterial({ color: 0x9d7844, roughness: 0.9 });
  const osb = new THREE.MeshStandardMaterial({ color: 0xb98d4f, roughness: 0.92 });

  let skin: THREE.MeshStandardMaterial;
  let gableSkin: THREE.MeshStandardMaterial;
  if (p.siding === "vinyl") {
    const lap = makeLapTexture(sidingHex, H);
    skin = new THREE.MeshStandardMaterial({ map: lap, roughness: 0.75 });
    gableSkin = new THREE.MeshStandardMaterial({ color: new THREE.Color(sidingHex), roughness: 0.75 });
  } else {
    // housewrap — white-green wrap over sheathing, color choice not applied
    skin = new THREE.MeshStandardMaterial({ color: 0xdde6dc, roughness: 0.88 });
    gableSkin = new THREE.MeshStandardMaterial({ color: 0xd6e0d6, roughness: 0.88 });
  }

  let roofMat: THREE.MeshStandardMaterial;
  if (p.roof === "metal") {
    const rib = makeRibTexture(roofHex);
    rib.repeat.set(Math.max(6, Math.round((L + 1) / 0.75)), 1); // rib every ~9 in
    roofMat = new THREE.MeshStandardMaterial({ map: rib, roughness: 0.35, metalness: 0.7, envMapIntensity: 0.8 });
  } else {
    // "ready" = sheathed + underlayment only; reads as OSB tan
    roofMat = new THREE.MeshStandardMaterial({ color: OSB_TAN, roughness: 0.95 });
  }
  const roofEdge = new THREE.MeshStandardMaterial({
    color: p.roof === "metal" ? shade(roofHex, 0.8) : shade("#c9a35e", 0.85),
    roughness: 0.7, metalness: p.roof === "metal" ? 0.4 : 0,
    envMapIntensity: p.roof === "metal" ? 0.8 : 0.3,
  });

  const trimMat = new THREE.MeshStandardMaterial({ color: TRIM, roughness: 0.6 });
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.5, metalness: 0.3 });
  // transmission-look glass: opacity + low roughness + env reflection (real
  // transmission is too costly for this budget)
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbcd6e6, roughness: 0.05, metalness: 0,
    transparent: true, opacity: 0.55, envMapIntensity: 1,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00, envMapIntensity: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.5, metalness: 0.4 });
  const gravelMat = new THREE.MeshStandardMaterial({ color: 0xa9a598, roughness: 1 });

  const M = new THREE.Matrix4();

  // ---- grass disc + contact shadow ------------------------------------
  const grass = new THREE.Mesh(
    new THREE.CircleGeometry(Math.max(L, W) * 1.6 + 10, 48),
    new THREE.MeshStandardMaterial({ color: 0x7fa065, roughness: 1 }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.y = 0.015;
  grass.receiveShadow = true;
  grass.userData.noFit = true; // ground dressing — excluded from camera fit
  group.add(grass);

  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(L + 9, W + 9),
    new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false, opacity: 0.85 }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.03;
  contact.userData.noFit = true;
  group.add(contact);

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

  // back + right end solid; left end (−X) is the framing cutaway,
  // front (+Z) carries the openings.
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
  wall(L, 0, halfW - t / 2, 0);             // front

  // where each opening actually sits — same resolver the spec sheet reads
  const openings = resolveShedOpenings(p);
  // an opening placed on the left end closes the framing cutaway: the wall
  // gets its skin so the door/window has something to sit in
  const leftUsed = [...openings.doors, ...openings.windows].some(o => o.wall === "left");
  if (leftUsed) wall(W, -halfL + t / 2, 0, Math.PI / 2);

  /* Each opening renders into a group aligned to its wall: local +x runs
     left→right along the wall (viewed from outside), local +z points out of
     the wall, local z=0 is the wall's outer face. The front wall at the
     legacy centers reproduces the old fixed positions exactly. */
  const wallYaw: Record<ShedWall, number> = { front: 0, back: Math.PI, right: Math.PI / 2, left: -Math.PI / 2 };
  const wallFrame = (wall: ShedWall, centerFt: number) => {
    const g = new THREE.Group();
    g.rotation.y = wallYaw[wall];
    if (wall === "front") g.position.set(0, 0, halfW);
    else if (wall === "back") g.position.set(0, 0, -halfW);
    else if (wall === "right") g.position.set(halfL, 0, 0);
    else g.position.set(-halfL, 0, 0);
    group.add(g);
    return { g, x: centerFt - shedWallLen(p, wall) / 2 }; // local x of the opening center
  };

  // corner trim boards — verticals at each corner of the box
  const cornerGeo = new THREE.BoxGeometry(0.4, H, 0.4);
  const corners = new THREE.InstancedMesh(cornerGeo, trimMat, 4);
  [[halfL - 0.2, halfW - 0.2], [halfL - 0.2, -halfW + 0.2],
   [-halfL + 0.2, -halfW + 0.2], [-halfL + 0.2, halfW - 0.2]].forEach(([x, z], i) => {
    M.makeTranslation(x, y0 + H / 2, z);
    corners.setMatrixAt(i, M);
  });
  corners.instanceMatrix.needsUpdate = true;
  corners.castShadow = true;
  group.add(corners);

  // ---- doors: trim casing, slab, hinges, latch — at their placed wall ---
  for (const o of openings.doors) {
    const { g, x } = wallFrame(o.wall, o.centerFt);
    // casing / trim frame proud of the wall
    const caseFrame = new THREE.Mesh(
      new THREE.BoxGeometry(SHED_DOOR.w + 0.5, SHED_DOOR.h + 0.35, 0.1), trimMat);
    caseFrame.position.set(x, y0 + (SHED_DOOR.h + 0.15) / 2, 0.03);
    caseFrame.castShadow = true;
    g.add(caseFrame);
    // slab
    const door = new THREE.Mesh(new THREE.BoxGeometry(SHED_DOOR.w, SHED_DOOR.h, 0.12), navyMat);
    door.position.set(x, y0 + SHED_DOOR.h / 2, 0.1);
    door.castShadow = true;
    g.add(door);
    // Z-brace panel lines
    const brace = new THREE.Mesh(new THREE.BoxGeometry(SHED_DOOR.w - 0.4, 0.18, 0.05), trimMat);
    brace.position.set(x, y0 + SHED_DOOR.h * 0.62, 0.17);
    g.add(brace);
    const brace2 = brace.clone();
    brace2.position.y = y0 + SHED_DOOR.h * 0.3;
    g.add(brace2);
    // hinges (left stile) + gold latch
    [0.22, 0.5, 0.78].forEach(f => {
      const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.3, 0.06), darkMat);
      hinge.position.set(x - SHED_DOOR.w / 2 + 0.12, y0 + SHED_DOOR.h * f, 0.17);
      g.add(hinge);
    });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), goldMat);
    dot.position.set(x + SHED_DOOR.w / 2 - 0.3, y0 + SHED_DOOR.h * 0.48, 0.18);
    g.add(dot);
  }

  // ---- windows: frame, glass, muntins, sill — at their placed wall ------
  // Sill stays at 2 ft, so even on the gable ends the head (y0 + 6) sits
  // below the 7-ft wall top plate — never up in the gable triangle.
  for (const o of openings.windows) {
    const { g, x } = wallFrame(o.wall, o.centerFt);
    const cy = y0 + 2 + SHED_WIN.h / 2;
    const frame = new THREE.Mesh(new THREE.BoxGeometry(SHED_WIN.w + 0.4, SHED_WIN.h + 0.4, 0.14), trimMat);
    frame.position.set(x, cy, 0.02);
    frame.castShadow = true;
    g.add(frame);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(SHED_WIN.w - 0.15, SHED_WIN.h - 0.15, 0.1), glassMat);
    glass.position.set(x, cy, 0.06);
    g.add(glass);
    // muntin cross
    const mv = new THREE.Mesh(new THREE.BoxGeometry(0.08, SHED_WIN.h - 0.1, 0.04), trimMat);
    mv.position.set(x, cy, 0.13);
    g.add(mv);
    const mh = new THREE.Mesh(new THREE.BoxGeometry(SHED_WIN.w - 0.1, 0.08, 0.04), trimMat);
    mh.position.set(x, cy, 0.13);
    g.add(mh);
    // sill
    const sill = new THREE.Mesh(new THREE.BoxGeometry(SHED_WIN.w + 0.55, 0.12, 0.24), trimMat);
    sill.position.set(x, cy - SHED_WIN.h / 2 - 0.24, 0.06);
    g.add(sill);
  }

  // ---- 4-ft ramp at the first door — follows the door's wall -----------
  if (p.ramp) {
    const first = openings.doors[0];
    const { g, x: dx } = wallFrame(first?.wall ?? "front", first?.centerFt ?? shedWallLen(p, "front") / 2);
    const run = 4, wRamp = SHED_DOOR.w + 0.4;
    const wedge = new THREE.Shape();
    wedge.moveTo(0, 0); wedge.lineTo(0, FLOOR_TOP - 0.06); wedge.lineTo(run, 0); wedge.closePath();
    const wedgeGeo = new THREE.ExtrudeGeometry(wedge, { depth: wRamp, bevelEnabled: false });
    const rampM = new THREE.Mesh(wedgeGeo, woodPT);
    rampM.rotation.y = -Math.PI / 2; // shape x → local +z, depth → local x
    rampM.position.set(dx + wRamp / 2, 0.04, 0);
    rampM.castShadow = true;
    rampM.receiveShadow = true;
    g.add(rampM);
    // cleats across the walking surface
    const rampSlope = Math.atan2(FLOOR_TOP - 0.06, run);
    const cleatGeo = new THREE.BoxGeometry(wRamp, 0.09, 0.18);
    const cleats = new THREE.InstancedMesh(cleatGeo, wood, 3);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-rampSlope, 0, 0));
    for (let i = 0; i < 3; i++) {
      const f = (i + 1) / 4;
      const pos = new THREE.Vector3(dx, (FLOOR_TOP - 0.06) * (1 - f) + 0.06, run * f);
      M.compose(pos, q, new THREE.Vector3(1, 1, 1));
      cleats.setMatrixAt(i, M);
    }
    cleats.instanceMatrix.needsUpdate = true;
    g.add(cleats);
  }

  // Left end (−X): the cutaway — open stud framing, same 16" o.c. count
  // the estimate prices. When an opening is placed on this wall the skin
  // closes it (above), so the open framing is skipped.
  if (!leftUsed) {
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
  }

  // roof framing readout at the cutaway end — trusses carry a bottom chord
  // and webs; stick framing shows a collar-free rafter pair.
  const frameX = -halfL + 0.6;
  if (p.framing === "truss") {
    const chord = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.29, W - 0.3), wood);
    chord.position.set(frameX, y0 + H + 0.12, 0);
    group.add(chord);
    [-1, 1].forEach(s => {
      const webLen = Math.hypot(rise * 0.6, halfW * 0.4);
      const web = new THREE.Mesh(new THREE.BoxGeometry(0.12, webLen, 0.24), wood);
      web.position.set(frameX, y0 + H + rise * 0.32, s * halfW * 0.22);
      web.rotation.x = s * Math.atan2(halfW * 0.4, rise * 0.6);
      group.add(web);
    });
  }
  // rafter pair at the cutaway end, tucked just under each roof plane
  [-1, 1].forEach(s => {
    const len = rafter - 1.6;
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.29, len), wood);
    r.position.set(frameX,
      (y0 + H + rise) - Math.sin(slope) * (len / 2) - 0.22,
      s * Math.cos(slope) * (len / 2));
    r.rotation.x = s * slope;
    group.add(r);
  });

  // ---- storage loft — visible through the cutaway ----------------------
  if (p.loft) {
    const loftDeep = Math.min(4, L / 3);
    const loftY = y0 + H - 1.5;
    const loftDeck = new THREE.Mesh(new THREE.BoxGeometry(loftDeep, 0.08, W - 0.7), osb);
    loftDeck.position.set(-halfL + loftDeep / 2 + 0.35, loftY, 0);
    group.add(loftDeck);
    const joistGeo = new THREE.BoxGeometry(loftDeep, 0.24, 0.12);
    const nJ = Math.max(2, Math.floor(W / 2));
    const loftJoists = new THREE.InstancedMesh(joistGeo, wood, nJ);
    for (let i = 0; i < nJ; i++) {
      M.makeTranslation(-halfL + loftDeep / 2 + 0.35, loftY - 0.16, -halfW + 0.6 + (i * (W - 1.2)) / (nJ - 1));
      loftJoists.setMatrixAt(i, M);
    }
    loftJoists.instanceMatrix.needsUpdate = true;
    group.add(loftJoists);
  }

  // ---- gable triangles -------------------------------------------------
  const tri = new THREE.Shape();
  tri.moveTo(-halfW, 0); tri.lineTo(halfW, 0); tri.lineTo(0, rise); tri.closePath();
  const triGeo = new THREE.ExtrudeGeometry(tri, { depth: t, bevelEnabled: false });
  // rotated +90° about Y: shape x → world −z, extrude depth → world +x
  [halfL - t, -halfL].forEach(x => {
    const gable = new THREE.Mesh(triGeo, gableSkin);
    gable.rotation.y = Math.PI / 2;
    gable.position.set(x, y0 + H, 0);
    gable.castShadow = true;
    group.add(gable);
  });

  // ---- roof planes + overhang trim + ridge -----------------------------
  const roofL = L + 1; // rake overhang
  const planeGeo = new THREE.BoxGeometry(roofL, 0.11, rafter);
  const ridgeY = y0 + H + rise;
  const slopeMid = (s: 1 | -1) => {
    const half = rafter / 2;
    return new THREE.Vector3(0, ridgeY - Math.sin(slope) * half + 0.06, s * Math.cos(slope) * half);
  };
  ([1, -1] as const).forEach(sideZ => {
    const m = new THREE.Mesh(planeGeo, roofMat);
    m.rotation.x = sideZ * slope;
    m.position.copy(slopeMid(sideZ));
    m.castShadow = true;
    m.receiveShadow = true;
    group.add(m);

    // rake trim boards along both gable edges of this plane
    [-1, 1].forEach(sx => {
      const rake = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, rafter), trimMat);
      rake.rotation.x = sideZ * slope;
      const pos = slopeMid(sideZ);
      rake.position.set(sx * roofL / 2, pos.y - 0.12, pos.z);
      rake.castShadow = true;
      group.add(rake);
    });

    // fascia along the eave
    const eaveY = ridgeY - Math.sin(slope) * rafter;
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(roofL, 0.42, 0.12), trimMat);
    fascia.position.set(0, eaveY - 0.14, sideZ * (Math.cos(slope) * rafter));
    fascia.castShadow = true;
    group.add(fascia);
  });

  const ridge = new THREE.Mesh(new THREE.BoxGeometry(roofL + 0.1, 0.14, 0.34), roofEdge);
  ridge.position.set(0, ridgeY + 0.12, 0);
  ridge.castShadow = true;
  group.add(ridge);

  // gold drip-edge line along both eaves — the brand accent
  const eaveGeo = new THREE.BoxGeometry(roofL, 0.07, 0.07);
  [1, -1].forEach(s => {
    const e = new THREE.Mesh(eaveGeo, goldMat);
    e.position.set(0, ridgeY - Math.sin(slope) * rafter + 0.08, s * Math.cos(slope) * rafter);
    group.add(e);
  });

  // ---- 24-in cupola on the ridge ---------------------------------------
  if (p.cupola) {
    const cw = 2; // 24 in square
    const baseH = 1.35;
    const baseY = ridgeY - 0.15;
    const body = new THREE.Mesh(new THREE.BoxGeometry(cw, baseH, cw), trimMat);
    body.position.set(0, baseY + baseH / 2, 0);
    body.castShadow = true;
    group.add(body);
    // louvers on all 4 faces
    const louvGeo = new THREE.BoxGeometry(cw - 0.5, 0.5, 0.06);
    for (let f = 0; f < 4; f++) {
      const lv = new THREE.Mesh(louvGeo, darkMat);
      const a = (f * Math.PI) / 2;
      lv.position.set(Math.sin(a) * (cw / 2 + 0.02), baseY + baseH * 0.55, Math.cos(a) * (cw / 2 + 0.02));
      lv.rotation.y = a;
      group.add(lv);
    }
    // pyramidal cap in the roof color + gold finial
    const capMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.roof === "metal" ? roofHex : "#565c66"),
      roughness: 0.5, metalness: 0.35,
    });
    const cap = new THREE.Mesh(new THREE.ConeGeometry(cw * 0.85, 0.9, 4), capMat);
    cap.rotation.y = Math.PI / 4;
    cap.position.set(0, baseY + baseH + 0.45, 0);
    cap.castShadow = true;
    group.add(cap);
    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), goldMat);
    finial.position.set(0, baseY + baseH + 0.98, 0);
    group.add(finial);
  }

  // NOTE: the sun lives in the one-time scene setup, not this disposable
  // group — rebuilding here must never orphan a 2048px shadow map.
  // ---- premium finish: stone wainscot band + mini-split ------------------
  if (p.wainscot) {
    const stoneC = document.createElement("canvas");
    stoneC.width = 64; stoneC.height = 32;
    const sg = stoneC.getContext("2d")!;
    sg.fillStyle = "#8d8578"; sg.fillRect(0, 0, 64, 32);
    for (let i = 0; i < 26; i++) {
      const t = 0.72 + Math.random() * 0.5;
      sg.fillStyle = shade("#948b7c", t);
      sg.fillRect(Math.random() * 60, Math.random() * 28, 8 + Math.random() * 10, 4 + Math.random() * 5);
    }
    const stoneTex = new THREE.CanvasTexture(stoneC);
    stoneTex.colorSpace = THREE.SRGBColorSpace;
    stoneTex.wrapS = THREE.RepeatWrapping;
    const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.95 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.6 });
    const wh = 2.4, t = 0.12; // band height and proudness
    const bands: [number, number, number, number, number][] = [
      [0, FLOOR_TOP + wh / 2, halfW + t / 2, L + t * 2, t],        // +Z wall
      [0, FLOOR_TOP + wh / 2, -(halfW + t / 2), L + t * 2, t],     // -Z wall
      [halfL + t / 2, FLOOR_TOP + wh / 2, 0, t, W + t * 2],        // +X gable
      [-(halfL + t / 2), FLOOR_TOP + wh / 2, 0, t, W + t * 2],     // -X gable
    ];
    for (const [x, y, z, sx, sz] of bands) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, wh, sz), stoneMat);
      m.position.set(x, y, z); m.castShadow = true; group.add(m);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(sx + 0.1, 0.12, sz + 0.1), capMat);
      cap.position.set(x, FLOOR_TOP + wh + 0.06, z); group.add(cap);
    }
  }
  if (p.hvac) {
    const acMat = new THREE.MeshStandardMaterial({ color: 0xf1f2f0, roughness: 0.4, metalness: 0.2 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.85, 0.7), acMat);
    head.position.set(halfL - 2, FLOOR_TOP + H - 1.1, halfW + 0.35);
    head.castShadow = true; group.add(head);
    const condenser = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 0.9), acMat);
    condenser.position.set(halfL + 1.6, 0.95, halfW - 1);
    condenser.castShadow = true; group.add(condenser);
  }

  // ---- dimension callouts — length across the front, width up the side --
  // Part of the disposable group, so a rebuild replaces them with the
  // rest of the geometry; visibility is applied after each rebuild.
  const dimY = 0.05;
  const dimF = halfW + (p.ramp ? 5.4 : 2.6);   // clear of the 4-ft ramp
  const dimS = halfL + (p.hvac ? 3.6 : 2.6);   // clear of the condenser
  group.add(makeDimensions([
    { from: [-halfL, dimY, dimF], to: [halfL, dimY, dimF], label: formatFeet(L) },
    { from: [dimS, dimY, -halfW], to: [dimS, dimY, halfW], label: formatFeet(W) },
  ]));

  return group;
}

const smooth = (x: number) => x * x * (3 - 2 * x);

export default function ShedScene(p: ShedSceneProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<Core | null>(null);
  const [hint, setHint] = React.useState(true); // fades after first interaction
  const [showDims, setShowDims] = React.useState(true); // dimension callouts, default on
  const showDimsRef = React.useRef(true);
  showDimsRef.current = showDims;

  React.useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // DPR capped at 2
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

    // real specular for metal/glass: PMREM room environment, built once in
    // this setup effect — it lives OUTSIDE the disposable group, so option
    // clicks rebuild geometry without ever touching it
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
    controls.minDistance = 8;
    controls.maxDistance = 140;

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

    const core: Core = { renderer, scene, camera, controls, sun, group: null, bg, raf: 0, ro: null as unknown as ResizeObserver, fitR: 0, fitC: new THREE.Vector3(), fly: null };

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameTo(core, 0); // keep the building framed when the container reflows
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

  const { widthFt, lengthFt, wallHFt, pitch, doors, windows, siding, roof, framing, ramp, loft, cupola, wainscot, hvac, sidingColor, roofColor } = p;
  // placements is a fresh object each render — key the rebuild on its content
  const placementsKey = JSON.stringify(p.placements ?? null);
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
    const rise = (widthFt / 2) * (pitch / 12);
    core.sun.position.set(lengthFt * 0.5 + 14, 26 + rise * 2, 20);
    const s = Math.max(lengthFt, widthFt) + 12;
    const sc = core.sun.shadow.camera;
    sc.left = -s; sc.right = s; sc.top = s; sc.bottom = -s;
    sc.updateProjectionMatrix();

    core.controls.maxDistance = Math.max(70, lengthFt * 4);
    // re-fit on every rebuild: snap on first build, glide after option clicks
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
  }, [widthFt, lengthFt, wallHFt, pitch, doors, windows, siding, roof, framing, ramp, loft, cupola, wainscot, hvac, sidingColor, roofColor, placementsKey]);

  // the Dims chip toggles the callout group without a rebuild
  React.useEffect(() => {
    const dg = coreRef.current?.group?.getObjectByName(DIMS_NAME);
    if (dg) dg.visible = showDims;
  }, [showDims]);

  const flyTo = (preset: "front" | "corner" | "birdseye") => {
    const core = coreRef.current;
    if (!core) return;
    const peak = wallHFt + (widthFt / 2) * (pitch / 12);
    const tgt = new THREE.Vector3(0, FLOOR_TOP + peak * 0.45, 0);
    let pos: THREE.Vector3;
    if (preset === "front") {
      pos = new THREE.Vector3(0, FLOOR_TOP + wallHFt * 0.6 + 1.5, Math.max(17, lengthFt * 0.95 + widthFt * 0.55 + 6));
    } else if (preset === "corner") {
      const d = Math.max(18, lengthFt * 1.15 + widthFt * 0.6);
      pos = new THREE.Vector3(d * 0.85, peak * 0.9 + 6, d);
    } else {
      pos = new THREE.Vector3(lengthFt * 0.15 + 0.5, Math.max(26, lengthFt * 1.9), widthFt * 0.3 + 0.5);
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
        aria-label={`3D preview — ${widthFt}×${lengthFt} shed, ${wallHFt} ft walls, ${pitch}:12 gable, ${doors} door(s), ${windows} window(s), ${siding === "vinyl" ? "vinyl siding" : "housewrap only"}${ramp ? ", ramp" : ""}${cupola ? ", cupola" : ""}`}
      />
      <div className="absolute left-2 top-2 flex gap-1.5">
        <button type="button" className={btnCls} onClick={() => flyTo("front")}>Front</button>
        <button type="button" className={btnCls} onClick={() => flyTo("corner")}>Corner</button>
        <button type="button" className={btnCls} onClick={() => flyTo("birdseye")}>Birds-eye</button>
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
          onClick={() => { const g = coreRef.current?.group; if (g) exportGroupAsGlb(g, "mvs-shed.glb"); }}
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
