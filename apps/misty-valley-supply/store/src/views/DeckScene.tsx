import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { deckGeometry, type DeckParams } from "@/bim";
import { DIMS_NAME, formatFeet, makeDimensions } from "@/dimensions";
import {
  applyAnisotropy, contactShadow, disposeObject, enhanceRenderer, fitShadowCamera,
  makeComposer, makeGroundPlane, makeSky, sharedRoughnessMap, tuneSunShadow,
  type ComposerRig,
} from "@/sceneQuality";

/* ------------------------------------------------------------------------
   Parametric 3D deck. Feet are world units. Width runs along X against a
   house wall at −Z; the deck projects toward +Z. Post, joist, course and
   baluster counts come from deckGeometry() in bim.ts — the same numbers
   the estimate prices. Renderer built once; parametric group rebuilt and
   disposed on change (ScreenScene pattern).
   ---------------------------------------------------------------------- */

const NAVY = 0x142f63;   // --marine
const GOLD = 0xfac400;   // --safety-hi

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
  fitR: number;            // bounding-sphere radius of the current deck
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
    const mat = mesh.material;
    const one = (m: THREE.Material) => {
      const map = (m as THREE.MeshStandardMaterial).map;
      if (map) map.dispose(); // dimension-label canvas textures live here
      m.dispose();
    };
    if (Array.isArray(mat)) mat.forEach(one);
    else if (mat) one(mat as THREE.Material);
  });
}

/** Bounds of the deck itself — meshes flagged noFit (the house backdrop) are skipped. */
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

function buildWorld(p: DeckParams): THREE.Group {
  const group = new THREE.Group();
  const g = deckGeometry(p);
  const W = p.widthFt, D = p.depthFt, H = p.heightFt;
  const halfW = W / 2, halfD = D / 2;
  const J8 = 7.25 / 12;   // 2×8 depth
  const B10 = 9.25 / 12;  // 2×10 depth
  const deckTop = H;      // walking surface at deck height
  const joistTop = deckTop - 1 / 12; // under 5/4 board

  // ---- materials -------------------------------------------------------
  const rough = sharedRoughnessMap(); // module-cached — never disposed here
  const pt = new THREE.MeshStandardMaterial({ color: 0x9d7844, roughness: 0.9, roughnessMap: rough });
  const ptLight = new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 0.85, roughnessMap: rough });
  const board = new THREE.MeshStandardMaterial({ color: 0xbf9a62, roughness: 0.8, roughnessMap: rough });
  const galv = new THREE.MeshStandardMaterial({ color: 0xaab3c1, metalness: 0.7, roughness: 0.4, envMapIntensity: 1.0 });
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.55, metalness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00 });
  const houseMat = new THREE.MeshStandardMaterial({ color: 0xdcd8cd, roughness: 0.85 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xb6b3ab, roughness: 0.95 });

  const M = new THREE.Matrix4();

  // ---- the house the ledger hangs on ----------------------------------
  const house = new THREE.Mesh(new THREE.BoxGeometry(W + 10, H + 10, 4), houseMat);
  house.position.set(0, (H + 10) / 2, -halfD - 2);
  house.receiveShadow = true;
  house.userData.noFit = true; // backdrop — excluded from camera fit
  group.add(house);
  // a navy door out onto the deck
  const hDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 6.83, 0.2), navyMat);
  hDoor.position.set(-W * 0.15, deckTop + 6.83 / 2, -halfD + 0.06);
  hDoor.userData.noFit = true;
  group.add(hDoor);

  // ---- footings + posts + beam ----------------------------------------
  const beamZ = halfD - 1; // beam set 1 ft in from the outer rim
  const postH = Math.max(0.5, joistTop - J8 - B10);
  const postGeo = new THREE.BoxGeometry(5.5 / 12, postH, 5.5 / 12);
  const posts = new THREE.InstancedMesh(postGeo, pt, g.posts);
  const footGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 14);
  const feet = new THREE.InstancedMesh(footGeo, concrete, g.posts);
  const spacingX = g.posts > 1 ? (W - 1) / (g.posts - 1) : 0;
  for (let i = 0; i < g.posts; i++) {
    const x = -halfW + 0.5 + i * spacingX;
    M.makeTranslation(x, postH / 2, beamZ);
    posts.setMatrixAt(i, M);
    M.makeTranslation(x, 0.17, beamZ);
    feet.setMatrixAt(i, M);
  }
  posts.instanceMatrix.needsUpdate = true;
  feet.instanceMatrix.needsUpdate = true;
  posts.castShadow = true;
  group.add(posts, feet);

  // doubled 2×10 beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(W, B10, 3.25 / 12), pt);
  beam.position.set(0, joistTop - J8 - B10 / 2, beamZ);
  beam.castShadow = true;
  group.add(beam);

  // ---- ledger, joists, rim --------------------------------------------
  const ledger = new THREE.Mesh(new THREE.BoxGeometry(W, J8, 1.5 / 12), pt);
  ledger.position.set(0, joistTop - J8 / 2, -halfD + 0.06);
  group.add(ledger);

  const joistGeo = new THREE.BoxGeometry(1.5 / 12, J8, D - 0.12);
  const joists = new THREE.InstancedMesh(joistGeo, ptLight, g.joists);
  const hangGeo = new THREE.BoxGeometry(2.6 / 12, J8 * 0.75, 2 / 12);
  const hangers = new THREE.InstancedMesh(hangGeo, galv, g.joists);
  for (let i = 0; i < g.joists; i++) {
    const x = Math.min(-halfW + (i * 16) / 12, halfW - 0.06);
    M.makeTranslation(x, joistTop - J8 / 2, 0);
    joists.setMatrixAt(i, M);
    M.makeTranslation(x, joistTop - J8 * 0.6, -halfD + 0.18);
    hangers.setMatrixAt(i, M);
  }
  joists.instanceMatrix.needsUpdate = true;
  hangers.instanceMatrix.needsUpdate = true;
  joists.castShadow = true;
  group.add(joists, hangers);

  // rim: outer + both sides
  const rimF = new THREE.Mesh(new THREE.BoxGeometry(W, J8, 1.5 / 12), pt);
  rimF.position.set(0, joistTop - J8 / 2, halfD - 0.06);
  rimF.castShadow = true;
  group.add(rimF);
  const rimSideGeo = new THREE.BoxGeometry(1.5 / 12, J8, D);
  [-halfW + 0.06, halfW - 0.06].forEach(x => {
    const r = new THREE.Mesh(rimSideGeo, pt);
    r.position.set(x, joistTop - J8 / 2, 0);
    r.castShadow = true;
    group.add(r);
  });

  // ---- decking: real gapped courses (instanced) ------------------------
  const course = 5.75 / 12; // 5.5" face + 1/4" gap
  const boardGeo = new THREE.BoxGeometry(W + 0.15, 1 / 12, 5.5 / 12);
  const boards = new THREE.InstancedMesh(boardGeo, board, g.courses);
  for (let i = 0; i < g.courses; i++) {
    const z = Math.min(-halfD + (5.5 / 24) + i * course, halfD - 5.5 / 24);
    M.makeTranslation(0, deckTop - 0.5 / 12, z);
    boards.setMatrixAt(i, M);
  }
  boards.instanceMatrix.needsUpdate = true;
  boards.castShadow = true;
  boards.receiveShadow = true;
  group.add(boards);

  // ---- guard (IRC R312: required over 30 in — deckGeometry enforces) ---
  if (g.railing) {
    const railH = 3; // 36 in guard
    const gpGeo = new THREE.BoxGeometry(3.5 / 12, railH + 0.2, 3.5 / 12);
    const nGP = Math.ceil(g.guardLf / 6) + 1;
    const gposts = new THREE.InstancedMesh(gpGeo, pt, nGP);
    // walk the three open sides: left, front, right
    const put = (i: number, x: number, z: number) => {
      M.makeTranslation(x, deckTop + (railH + 0.2) / 2 - 0.1, z);
      gposts.setMatrixAt(i, M);
    };
    let idx = 0;
    const per = g.guardLf / (nGP - 1);
    for (let i = 0; i < nGP; i++) {
      const d = i * per;
      if (d <= D) put(idx++, -halfW + 0.15, -halfD + d);                       // left side out
      else if (d <= D + W) put(idx++, -halfW + (d - D), halfD - 0.15);         // across the front
      else put(idx++, halfW - 0.15, halfD - (d - D - W));                      // right side back
    }
    gposts.count = idx;
    gposts.instanceMatrix.needsUpdate = true;
    gposts.castShadow = true;
    group.add(gposts);

    // rails + balusters per side
    const balGeo = new THREE.BoxGeometry(1.5 / 12, railH - 0.5, 1.5 / 12);
    const nBal = Math.ceil((g.guardLf * 12) / 5.5);
    const bals = new THREE.InstancedMesh(balGeo, ptLight, nBal);
    let b = 0;
    const side = (len: number, fx: (t: number) => [number, number], alongX: boolean) => {
      // top rail (gold cap over navy rail reads as the brand)
      const railGeo = new THREE.BoxGeometry(len, 1.5 / 12, 3.5 / 12);
      const top = new THREE.Mesh(railGeo, pt);
      const [cx, cz] = fx(0.5);
      top.position.set(cx, deckTop + railH, cz);
      const bot = new THREE.Mesh(railGeo.clone(), pt);
      bot.position.set(cx, deckTop + 0.3, cz);
      const cap = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.42), goldMat);
      cap.position.set(cx, deckTop + railH + 0.1, cz);
      // rails run along X across the front, along Z on the sides
      if (!alongX) { top.rotation.y = Math.PI / 2; bot.rotation.y = Math.PI / 2; cap.rotation.y = Math.PI / 2; }
      top.castShadow = true;
      group.add(top, bot, cap);
      const n = Math.ceil((len * 12) / 5.5);
      for (let i = 0; i < n && b < nBal; i++) {
        const [x, z] = fx((i + 0.5) / n);
        M.makeTranslation(x, deckTop + railH / 2 + 0.1, z);
        bals.setMatrixAt(b++, M);
      }
    };
    side(D, t => [-halfW + 0.15, -halfD + t * D], false);   // left
    side(W, t => [-halfW + t * W, halfD - 0.15], true);     // front
    side(D, t => [halfW - 0.15, halfD - t * D], false);     // right
    bals.count = b;
    bals.instanceMatrix.needsUpdate = true;
    group.add(bals);
  }

  // ---- stairs ----------------------------------------------------------
  if (p.stairs && g.treads > 0) {
    const riser = H / g.risers;
    const run = 10 / 12; // 10 in tread run
    const stairX = halfW - 2.5;
    for (let i = 0; i < g.treads; i++) {
      const y = deckTop - (i + 1) * riser;
      const z = halfD + (i + 0.5) * run;
      const tread = new THREE.Mesh(new THREE.BoxGeometry(3, 1 / 12, run + 0.08), board);
      tread.position.set(stairX, y, z);
      tread.castShadow = true;
      group.add(tread);
    }
    // stringers as sloped 2×10s
    const sLen = Math.sqrt(H * H + (g.risers * run) ** 2);
    const sGeo = new THREE.BoxGeometry(1.5 / 12, B10, sLen);
    [-1.4, 0, 1.4].forEach(dx => {
      const st = new THREE.Mesh(sGeo, pt);
      st.position.set(stairX + dx, deckTop - H / 2 - 0.35, halfD + (g.risers * run) / 2);
      st.rotation.x = Math.atan2(H, g.risers * run);
      st.castShadow = true;
      group.add(st);
    });
  }

  // soft contact shadow under the deck footprint — fake AO at grade
  group.add(contactShadow(W + 7, D + 7));

  // ---- dimension callouts — width across the front, depth up the side --
  // Part of the disposable group; visibility is re-applied after rebuilds.
  const dimY = 0.05;
  const dimF = halfD + (p.stairs && g.treads > 0 ? g.risers * (10 / 12) + 1.6 : 2.4); // clear of the stairs
  group.add(makeDimensions([
    { from: [-halfW, dimY, dimF], to: [halfW, dimY, dimF], label: formatFeet(W) },
    { from: [-halfW - 2.4, dimY, -halfD], to: [-halfW - 2.4, dimY, halfD], label: formatFeet(D) },
  ]));

  // NOTE: the sun lives in the one-time scene setup, not this disposable
  // group — rebuilding here must never orphan a 2048px shadow map.
  return group;
}

export default function DeckScene(p: DeckParams) {
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
    // CAD-grade output: ACES filmic + sRGB + PCF-soft shadows (shared helper)
    enhanceRenderer(renderer, 1.1);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bg = makeSky();
    scene.background = bg;
    scene.fog = new THREE.Fog(0xdbe4ee, 150, 900);

    // real specular for the galvanized hardware: PMREM room environment,
    // built once — OUTSIDE the disposable group
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    pmrem.dispose();
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.55;

    // soft-edged textured ground that melts into the horizon haze
    const ground = makeGroundPlane({ radius: 900, base: "#87966c", horizon: "#e2e6d8" });
    scene.add(ground);

    const ambient = new THREE.AmbientLight(0xe8eef8, 0.8);
    const hemi = new THREE.HemisphereLight(0xd2ddec, 0x86927a, 0.55);
    scene.add(ambient, hemi);

    // sun + its one shadow map are created once; the rebuild effect only
    // repositions it and resizes the shadow camera to the new footprint
    const sun = new THREE.DirectionalLight(0xfff2dc, 2.3);
    sun.position.set(20, 30, 26);
    sun.castShadow = true;
    tuneSunShadow(sun); // 2048 desktop / 1024 coarse + tuned bias
    scene.add(sun, sun.target);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 2000);
    camera.position.set(18, 10, 26);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.5; // never under the ground
    controls.minDistance = 6;
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
      frameTo(core, 0); // keep the deck framed when the container reflows
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

  const { widthFt, depthFt, heightFt, railing, stairs } = p;
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    const first = !core.group;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const group = buildWorld({ widthFt, depthFt, heightFt, railing, stairs });
    core.scene.add(group);
    core.group = group;

    // dimension callouts are rebuilt with the group — re-apply the toggle
    const dg = group.getObjectByName(DIMS_NAME);
    if (dg) dg.visible = showDimsRef.current;

    // the persistent sun follows the footprint; its one shadow map is
    // re-fitted tight to the new model bounds
    core.sun.position.set(widthFt * 0.6 + 12, 24 + heightFt, 26);
    fitShadowCamera(core.sun, group);
    applyAnisotropy(core.renderer, group); // crisp textures at grazing angles

    core.controls.maxDistance = Math.max(70, widthFt * 4);
    // re-fit on every rebuild: snap on first build, glide after option clicks
    const sphere = focusBox(group).getBoundingSphere(new THREE.Sphere());
    core.fitR = sphere.radius;
    core.fitC.copy(sphere.center);
    frameTo(core, first ? 0 : 550);
    core.controls.update();
  }, [widthFt, depthFt, heightFt, railing, stairs]);

  // the Dims chip toggles the callout group without a rebuild
  React.useEffect(() => {
    const dg = coreRef.current?.group?.getObjectByName(DIMS_NAME);
    if (dg) dg.visible = showDims;
  }, [showDims]);

  const btnCls = "rounded-[5px] border border-white/25 bg-[hsl(var(--marine))]/80 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-[hsl(var(--marine))]";
  return (
    <div className="relative h-full w-full">
      <div
        ref={mountRef}
        className="h-full w-full"
        role="img"
        aria-label={`3D preview — ${widthFt}×${depthFt} deck, ${heightFt} ft high${railing || heightFt * 12 >= 30 ? ", with guard" : ""}${stairs ? ", with stairs" : ""}`}
      />
      <div className="absolute left-2 top-2 flex gap-1.5">
        <button type="button" aria-pressed={showDims}
          className={btnCls + (showDims ? " ring-1 ring-[hsl(var(--safety-hi))]" : " opacity-70")}
          onClick={() => setShowDims(v => !v)}>
          Dims
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
