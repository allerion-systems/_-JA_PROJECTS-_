import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

/** Soft sky gradient used as the scene background. */
function makeSky(): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = 16; c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#aec4de");
  grad.addColorStop(0.55, "#dbe4ee");
  grad.addColorStop(1, "#f2f0ea");
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
    const mat = (mesh as THREE.Mesh).material;
    if (Array.isArray(mat)) mat.forEach(m => m.dispose());
    else if (mat) (mat as THREE.Material).dispose();
  });
}

/** Build every parametric part of the scene into one disposable group. */
function buildWorld({ lf, heightFt, bayFt, frameOnly, gauge }: ScreenSceneProps): THREE.Group {
  const group = new THREE.Group();
  const L = Math.max(lf, 4);
  const h = Math.max(heightFt, 2);
  const bay = Math.min(Math.max(bayFt, 2), 12);
  const half = L / 2;

  // ---- materials -------------------------------------------------------
  const navyMat = new THREE.MeshStandardMaterial({ color: NAVY, metalness: 0.55, roughness: 0.42 });
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xc7ccd2, metalness: 0.78, roughness: 0.34, side: THREE.DoubleSide,
  });
  const ribMat = new THREE.MeshStandardMaterial({
    color: gauge === 29 ? 0xd9dde1 : 0xd2d7dc, metalness: 0.8, roughness: 0.3,
  });
  const deckMat = new THREE.MeshStandardMaterial({ color: 0xbfc2c6, roughness: 0.96, metalness: 0.04 });
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
  group.add(deck);

  // the building the roof sits on, so the deck never reads as a floating slab
  const bldgMat = new THREE.MeshStandardMaterial({ color: 0xa8a5a0, roughness: 0.9 });
  const bldg = new THREE.Mesh(new THREE.BoxGeometry(deckW - 1.5, 30, deckD - 1.5), bldgMat);
  bldg.position.set(0, -16, -14);
  group.add(bldg);

  // subtle parapet curb along the screen line (front edge of the deck field)
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(deckW, 1.4, 0.9), parapetMat);
  parapet.position.set(0, 0.7, 3.2);
  parapet.castShadow = true;
  parapet.receiveShadow = true;
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

  // ---- sun, sized to the configuration so the shadow fits -------------
  const sun = new THREE.DirectionalLight(0xfff4e0, 2.4);
  sun.position.set(L * 0.35 + 20, Math.max(40, h * 4 + 30), 34);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const s = half + 26;
  sun.shadow.camera.left = -s;
  sun.shadow.camera.right = s;
  sun.shadow.camera.top = s;
  sun.shadow.camera.bottom = -s;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 400;
  sun.shadow.bias = -0.0004;
  group.add(sun);
  group.add(sun.target); // target defaults to origin

  return group;
}

export default function ScreenScene(props: ScreenSceneProps) {
  const mountRef = React.useRef<HTMLDivElement | null>(null);
  const coreRef = React.useRef<Core | null>(null);

  // ---- one-time renderer / camera / controls setup ---------------------
  React.useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

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
    scene.fog = new THREE.Fog(0xdbe4ee, 220, 1400);

    // distant ground so the horizon reads as street level, not empty sky
    const groundGeo = new THREE.PlaneGeometry(4000, 4000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xcfccc4, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -31;
    scene.add(ground);

    scene.add(new THREE.AmbientLight(0xe8eef8, 0.85));
    const fill = new THREE.HemisphereLight(0xcfdcee, 0x8e8b84, 0.55);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.5, 4000);
    camera.position.set(30, 14, 46);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = 1.45;   // never under the deck
    controls.minDistance = 10;
    controls.maxDistance = 320;

    const core: Core = { renderer, scene, camera, controls, group: null, bg, raf: 0, ro: null as unknown as ResizeObserver, fitted: false };

    const resize = () => {
      const w = el.clientWidth || 1;
      const hh = el.clientHeight || 1;
      renderer.setSize(w, hh, false);
      camera.aspect = w / hh;
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
      if (core.group) {
        scene.remove(core.group);
        disposeGroup(core.group);
        core.group = null;
      }
      scene.remove(ground);
      groundGeo.dispose();
      groundMat.dispose();
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

    if (core.group) {
      core.scene.remove(core.group);
      disposeGroup(core.group);
    }
    const group = buildWorld({ lf, heightFt, bayFt, frameOnly, gauge });
    core.scene.add(group);
    core.group = group;

    const L = Math.max(lf, 4);
    const h = Math.max(heightFt, 2);
    core.controls.target.set(0, h * 0.55, 0);
    core.controls.minDistance = Math.max(8, h * 1.5);
    core.controls.maxDistance = Math.max(90, L * 1.7);

    if (!core.fitted) {
      // first build: a close three-quarter view where posts and ribs read —
      // a long screen runs past the frame instead of shrinking to a sliver
      const d = Math.min(64, Math.max(24, L * 0.18 + h * 3));
      core.camera.position.set(Math.min(L * 0.28, 30), h * 2 + d * 0.18 + 3, d);
      core.fitted = true;
    }
    core.controls.update();
  }, [lf, heightFt, bayFt, frameOnly, gauge]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full touch-none"
      role="img"
      aria-label={`3D preview — ${lf} LF roof screen, ${heightFt} ft high, posts every ${bayFt} ft, ${frameOnly ? "frame only" : `${gauge} gauge panel`}`}
    />
  );
}
