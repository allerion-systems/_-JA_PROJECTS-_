import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { deckGeometry, type DeckParams } from "@/bim";

/* ------------------------------------------------------------------------
   Parametric 3D deck. Feet are world units. Width runs along X against a
   house wall at −Z; the deck projects toward +Z. Post, joist, course and
   baluster counts come from deckGeometry() in bim.ts — the same numbers
   the estimate prices. Renderer built once; parametric group rebuilt and
   disposed on change (ScreenScene pattern).
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
  grad.addColorStop(0.55, "#dbe4ee");
  grad.addColorStop(1, "#e9ecdf");
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
  const pt = new THREE.MeshStandardMaterial({ color: 0x9d7844, roughness: 0.9 });
  const ptLight = new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 0.85 });
  const board = new THREE.MeshStandardMaterial({ color: 0xbf9a62, roughness: 0.8 });
  const galv = new THREE.MeshStandardMaterial({ color: 0xaab3c1, metalness: 0.7, roughness: 0.4 });
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, roughness: 0.55, metalness: 0.25 });
  const goldMat = new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.4, roughness: 0.35, emissive: 0x4a3a00 });
  const houseMat = new THREE.MeshStandardMaterial({ color: 0xdcd8cd, roughness: 0.85 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xb6b3ab, roughness: 0.95 });

  const M = new THREE.Matrix4();

  // ---- the house the ledger hangs on ----------------------------------
  const house = new THREE.Mesh(new THREE.BoxGeometry(W + 10, H + 10, 4), houseMat);
  house.position.set(0, (H + 10) / 2, -halfD - 2);
  house.receiveShadow = true;
  group.add(house);
  // a navy door out onto the deck
  const hDoor = new THREE.Mesh(new THREE.BoxGeometry(3, 6.83, 0.2), navyMat);
  hDoor.position.set(-W * 0.15, deckTop + 6.83 / 2, -halfD + 0.06);
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

  // ---- sun -------------------------------------------------------------
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.3);
  sun.position.set(W * 0.6 + 12, 24 + H, 26);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = Math.max(W, D) + 14;
  sun.shadow.camera.left = -s; sun.shadow.camera.right = s;
  sun.shadow.camera.top = s; sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 200;
  sun.shadow.bias = -0.0004;
  group.add(sun);
  group.add(sun.target);

  return group;
}

export default function DeckScene(p: DeckParams) {
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
    scene.fog = new THREE.Fog(0xdbe4ee, 150, 900);

    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x93a07e, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    scene.add(new THREE.AmbientLight(0xe8eef8, 0.8));
    scene.add(new THREE.HemisphereLight(0xd2ddec, 0x86927a, 0.55));

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 2000);
    camera.position.set(18, 10, 26);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.5; // never under the ground
    controls.minDistance = 6;
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

  const { widthFt, depthFt, heightFt, railing, stairs } = p;
  React.useEffect(() => {
    const core = coreRef.current;
    if (!core) return;
    if (core.group) { core.scene.remove(core.group); disposeGroup(core.group); }
    const group = buildWorld({ widthFt, depthFt, heightFt, railing, stairs });
    core.scene.add(group);
    core.group = group;

    core.controls.target.set(0, heightFt + 1.2, 1);
    core.controls.maxDistance = Math.max(70, widthFt * 4);
    if (!core.fitted) {
      const d = Math.max(20, widthFt * 1.2 + depthFt * 0.8);
      core.camera.position.set(d * 0.8, heightFt + 9, d);
      core.fitted = true;
    }
    core.controls.update();
  }, [widthFt, depthFt, heightFt, railing, stairs]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full touch-none"
      role="img"
      aria-label={`3D preview — ${widthFt}×${depthFt} deck, ${heightFt} ft high${railing || heightFt * 12 >= 30 ? ", with guard" : ""}${stairs ? ", with stairs" : ""}`}
    />
  );
}
