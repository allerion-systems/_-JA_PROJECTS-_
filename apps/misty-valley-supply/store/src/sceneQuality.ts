import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SAOPass } from "three/examples/jsm/postprocessing/SAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/* ------------------------------------------------------------------------
   Shared visual-quality helpers for every product-configurator scene.
   Everything here is canvas-generated or procedural — nothing is fetched
   at runtime (CSP), and nothing allocates per frame. Scenes keep their own
   lifecycle: lights/sun once in setup, disposable rebuilt group with full
   disposal, ACES tone mapping, preserveDrawingBuffer for spec-sheet
   snapshots.
   ---------------------------------------------------------------------- */

/** Coarse-pointer (touch) devices skip the postprocessing path and get the
    smaller shadow map — the cheap gate the mobile budget asks for. */
export function isCoarsePointer(): boolean {
  return typeof window.matchMedia === "function"
    && window.matchMedia("(pointer: coarse)").matches;
}

/** 2048 on desktops, 1024 on coarse-pointer devices. */
export function shadowMapSize(): number {
  return isCoarsePointer() ? 1024 : 2048;
}

/** One place for renderer quality: ACES + sRGB + soft shadow maps.
    r185 deprecates PCFSoftShadowMap (it silently falls back to PCF), so PCF
    is set directly — its shadow.radius blur is what supplies the softness. */
export function enhanceRenderer(renderer: THREE.WebGLRenderer, exposure = 1.1): void {
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
}

/** Tuned shadow bias for the one persistent sun; call once at setup. */
export function tuneSunShadow(sun: THREE.DirectionalLight): void {
  const s = shadowMapSize();
  sun.shadow.mapSize.set(s, s);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.06; // kills acne on the textured box walls
  sun.shadow.radius = 5;        // PCF blur radius — soft penumbra edges
}

/**
 * Fit the sun's orthographic shadow camera tightly to the rebuilt model:
 * target at the bounds center, half-extents from the bounding sphere.
 * Shadows project along the light axis, so a caster-tight box also covers
 * every shadow the casters throw onto the ground.
 * Meshes flagged userData.noFit (ground dressing) are ignored.
 */
export function fitShadowCamera(light: THREE.DirectionalLight, group: THREE.Object3D, pad = 1.15): void {
  group.updateMatrixWorld(true);
  const box = new THREE.Box3();
  group.traverse(o => {
    if (o.userData.noFit) return;
    if ((o as THREE.Mesh).isMesh) box.expandByObject(o);
  });
  if (box.isEmpty()) return;
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const r = Math.max(4, sphere.radius) * pad;
  light.target.position.copy(sphere.center);
  light.target.updateMatrixWorld();
  const dist = light.position.distanceTo(sphere.center);
  const sc = light.shadow.camera;
  sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r;
  sc.near = Math.max(0.5, dist - r * 2);
  sc.far = dist + r * 3; // reaches past grade for the ground shadow
  sc.updateProjectionMatrix();
}

/** Max-anisotropy sampling on every texture in a (re)built tree — makes the
    lap/rib/plank textures stay crisp at grazing angles. Call after rebuild. */
export function applyAnisotropy(renderer: THREE.WebGLRenderer, root: THREE.Object3D): void {
  const max = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  root.traverse(o => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const sm = m as THREE.MeshStandardMaterial;
      for (const tex of [sm.map, sm.roughnessMap, sm.normalMap, sm.bumpMap]) {
        if (tex && tex.anisotropy < max) { tex.anisotropy = max; tex.needsUpdate = true; }
      }
    }
  });
}

/** Dispose a mesh/group made by these helpers: geometry, materials, maps. */
export function disposeObject(root: THREE.Object3D): void {
  root.traverse(o => {
    const mesh = o as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const m of mats) {
      const sm = m as THREE.MeshStandardMaterial;
      sm.map?.dispose();
      sm.roughnessMap?.dispose();
      sm.normalMap?.dispose();
      sm.bumpMap?.dispose();
      m.dispose();
    }
  });
}

// ---- sky ------------------------------------------------------------------

export type SkyOptions = {
  top?: string;      // zenith
  mid?: string;      // upper sky
  haze?: string;     // bright horizon haze band
  horizon?: string;  // at/below the horizon line
};

/**
 * Gradient sky with a soft bright haze band at the horizon — reads as
 * atmosphere instead of the old flat two-tone ramp. Used as scene.background.
 */
export function makeSky(opts: SkyOptions = {}): THREE.CanvasTexture {
  const top = opts.top ?? "#7fa8d4";
  const mid = opts.mid ?? "#b9cfe6";
  const haze = opts.haze ?? "#eef2f2";
  const horizon = opts.horizon ?? "#e4e7dc";
  const c = document.createElement("canvas");
  c.width = 64; c.height = 512;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, top);
  grad.addColorStop(0.42, mid);
  grad.addColorStop(0.72, haze);
  grad.addColorStop(0.82, haze);
  grad.addColorStop(1, horizon);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 512);
  // faint warm glow low in the sky — sells the sun without drawing one
  const glow = g.createLinearGradient(0, 512 * 0.5, 0, 512 * 0.86);
  glow.addColorStop(0, "rgba(255,244,214,0)");
  glow.addColorStop(0.75, "rgba(255,244,214,0.28)");
  glow.addColorStop(1, "rgba(255,244,214,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, 64, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---- ground ---------------------------------------------------------------

/** Multi-tone grass/soil noise painted into ctx over [0,size]². */
function paintGrassNoise(g: CanvasRenderingContext2D, size: number, base: string): void {
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);
  // large soft tonal patches (dry/lush variation)
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const r = size * (0.03 + Math.random() * 0.08);
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    const warm = Math.random() > 0.5;
    const a = 0.04 + Math.random() * 0.05;
    grad.addColorStop(0, warm ? `rgba(146,142,88,${a})` : `rgba(84,116,72,${a})`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // fine speckle — blades / soil flecks
  for (let i = 0; i < size * 22; i++) {
    const v = Math.random();
    g.fillStyle = v > 0.62
      ? `rgba(158,172,110,${0.10 + v * 0.10})`
      : `rgba(62,84,52,${0.08 + v * 0.10})`;
    g.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
}

export type GroundOptions = {
  radius?: number;     // world radius of the disc, ft
  base?: string;       // grass base tone
  horizon?: string;    // color it fades to at the rim (match sky/fog)
};

/**
 * Large soft-edged ground disc: procedural multi-tone grass noise in the
 * middle, radial fade to the horizon color at the rim so the ground melts
 * into the sky instead of ending at a hard fog line. Lives in the one-time
 * scene setup; dispose with disposeObject().
 */
export function makeGroundPlane(opts: GroundOptions = {}): THREE.Mesh {
  const radius = opts.radius ?? 850;
  const base = opts.base ?? "#8a9a6e";
  const horizon = opts.horizon ?? "#dfe3d4";
  const size = 1024;
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const g = c.getContext("2d")!;
  paintGrassNoise(g, size, base);
  // radial fade to the horizon tone — grass stays readable near the model,
  // the far field melts into haze so no hard ground edge ever shows
  const fade = g.createRadialGradient(size / 2, size / 2, size * 0.06, size / 2, size / 2, size * 0.5);
  fade.addColorStop(0, hexToRgba(horizon, 0));
  fade.addColorStop(0.3, hexToRgba(horizon, 0.12));
  fade.addColorStop(0.62, hexToRgba(horizon, 0.55));
  fade.addColorStop(0.85, hexToRgba(horizon, 0.95));
  fade.addColorStop(1, hexToRgba(horizon, 1));
  g.fillStyle = fade;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 64),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

/** Tiling grass texture for the per-model dressing disc inside a rebuilt
    group — matches the big ground plane's palette so they blend. */
export function makeGrassTexture(base = "#7fa065", repeats = 1): THREE.CanvasTexture {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const g = c.getContext("2d")!;
  paintGrassNoise(g, size, base);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeats, repeats);
  return tex;
}

function hexToRgba(hex: string, a: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

// ---- contact shadow -------------------------------------------------------

/**
 * Soft blurred dark plane under the model — fake ambient occlusion at grade.
 * Sized to the footprint; add to the disposable rebuilt group (it flags
 * itself noFit so camera fitting ignores it).
 */
export function contactShadow(wFt: number, dFt: number, opts: { opacity?: number; y?: number } = {}): THREE.Mesh {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 12, 128, 128, 128);
  grad.addColorStop(0, "rgba(16,20,15,0.60)");
  grad.addColorStop(0.42, "rgba(16,20,15,0.42)");
  grad.addColorStop(0.72, "rgba(16,20,15,0.18)");
  grad.addColorStop(1, "rgba(16,20,15,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(wFt, dFt),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: opts.opacity ?? 0.85 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = opts.y ?? 0.03;
  mesh.userData.noFit = true;
  mesh.userData.noAO = true; // keep it out of the SAO depth/normal pass
  return mesh;
}

// ---- roughness variation --------------------------------------------------

/**
 * Grayscale noise used as a roughnessMap so siding/roof/decking pick up
 * subtle specular variation instead of reading as uniform plastic.
 * Values swing around `mean` (0..1); multiplies material.roughness.
 */
export function makeRoughnessMap(mean = 0.9, swing = 0.18, size = 256): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const g = c.getContext("2d")!;
  const lo = Math.max(0, Math.min(1, mean - swing));
  g.fillStyle = `rgb(${Math.round(mean * 255)},${Math.round(mean * 255)},${Math.round(mean * 255)})`;
  g.fillRect(0, 0, size, size);
  for (let i = 0; i < size * 30; i++) {
    const v = lo + Math.random() * swing * 2;
    const b = Math.round(Math.max(0, Math.min(1, v)) * 255);
    g.fillStyle = `rgba(${b},${b},${b},0.5)`;
    g.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// ---- shared cladding textures --------------------------------------------

function shade(hex: string, f: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

/** Horizontal vinyl-lap suggestion: one course band per ~6 in of wall,
    with butt-joint seams and faint per-panel tone drift. */
export function makeLapTexture(color: string, wallHFt: number): THREE.CanvasTexture {
  const courses = Math.max(8, Math.round(wallHFt * 2)); // 6-in exposure
  const c = document.createElement("canvas");
  c.width = 256; c.height = 512;
  const g = c.getContext("2d")!;
  const ch = 512 / courses;
  for (let i = 0; i < courses; i++) {
    const y = i * ch;
    const grad = g.createLinearGradient(0, y, 0, y + ch);
    grad.addColorStop(0, shade(color, 1.07));
    grad.addColorStop(0.8, shade(color, 0.96));
    grad.addColorStop(1, shade(color, 0.78));
    g.fillStyle = grad;
    g.fillRect(0, y, 256, ch);
    g.fillStyle = `rgba(0,0,0,${0.05 + (i % 3) * 0.02})`;
    g.fillRect((i * 83) % 256, y, 2, ch);
    g.fillStyle = i % 2 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
    g.fillRect((i * 151) % 256, y, 60, ch);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Vertical rib stripes for steel panels — one major rib per repeat, with
    roll-formed pan shading and a minor stiffening rib. */
export function makeRibTexture(color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 32;
  const g = c.getContext("2d")!;
  const px = (f: number) => f * 4; // legacy 64-wide layout, scaled up
  g.fillStyle = shade(color, 1);
  g.fillRect(0, 0, 256, 32);
  // pan shading: subtle curvature across the flat
  const pan = g.createLinearGradient(px(8), 0, px(64), 0);
  pan.addColorStop(0, shade(color, 0.94));
  pan.addColorStop(0.5, shade(color, 1.03));
  pan.addColorStop(1, shade(color, 0.97));
  g.fillStyle = pan;
  g.fillRect(px(8), 0, 256 - px(8), 32);
  // major rib: highlight with soft falloff + shadow side
  const rib = g.createLinearGradient(0, 0, px(8), 0);
  rib.addColorStop(0, shade(color, 1.38));
  rib.addColorStop(0.6, shade(color, 1.2));
  rib.addColorStop(0.62, shade(color, 0.58));
  rib.addColorStop(1, shade(color, 0.82));
  g.fillStyle = rib;
  g.fillRect(0, 0, px(8), 32);
  // minor stiffening rib
  g.fillStyle = shade(color, 1.12);
  g.fillRect(px(34), 0, 3, 32);
  g.fillStyle = shade(color, 0.86);
  g.fillRect(px(34) + 3, 0, 3, 32);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

let cachedRough: THREE.CanvasTexture | null = null;

/**
 * Module-cached roughness noise shared by every scene and rebuild. Never
 * disposed (one 256² texture for the app's lifetime), which keeps the
 * rebuilt groups' dispose passes from having to track it.
 */
export function sharedRoughnessMap(): THREE.CanvasTexture {
  if (!cachedRough) {
    cachedRough = makeRoughnessMap(0.9, 0.2, 256);
    cachedRough.repeat.set(3, 3);
  }
  return cachedRough;
}

// ---- optional postprocessing (desktop only) -------------------------------

export type ComposerRig = {
  composer: EffectComposer;
  setSize: (w: number, h: number) => void;
  dispose: () => void;
};

/**
 * EffectComposer + SAO + OutputPass — screen-space ambient occlusion that
 * grounds every corner and eave. Returns null on coarse-pointer devices or
 * dpr > 2 (mobile keeps the plain renderer.render path and its 60 fps).
 * ACES/sRGB are applied once, by the OutputPass (render targets skip the
 * renderer's own tone mapping).
 */
export function makeComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
): ComposerRig | null {
  if (isCoarsePointer()) return null;
  if ((window.devicePixelRatio || 1) > 2.01) return null;
  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(renderer.getPixelRatio());
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  const sao = new SAOPass(scene, camera);
  sao.params.saoBias = 0.5;
  sao.params.saoIntensity = 0.012;
  sao.params.saoScale = camera.far * 0.03;
  sao.params.saoKernelRadius = 32;
  sao.params.saoMinResolution = 0;
  sao.params.saoBlur = true;
  sao.params.saoBlurRadius = 8;
  sao.params.saoBlurStdDev = 4;
  sao.params.saoBlurDepthCutoff = 0.002;
  // Sprites (dimension pills) and noAO overlays (contact shadows, ghosted
  // cutaway skins) must stay out of SAO's depth/normal pre-pass, or they
  // smear dark rectangles into the AO term. Hide them around the pass;
  // the beauty RenderPass has already drawn them.
  const saoRender = sao.render.bind(sao) as (...a: unknown[]) => void;
  const hiddenForAO: THREE.Object3D[] = [];
  sao.render = ((...args: unknown[]) => {
    hiddenForAO.length = 0;
    scene.traverse(o => {
      if (o.visible && ((o as THREE.Sprite).isSprite || o.userData.noAO)) {
        o.visible = false;
        hiddenForAO.push(o);
      }
    });
    saoRender(...args);
    for (const o of hiddenForAO) o.visible = true;
    hiddenForAO.length = 0;
  }) as typeof sao.render;
  composer.addPass(sao);
  const output = new OutputPass();
  composer.addPass(output);
  return {
    composer,
    setSize: (w: number, h: number) => composer.setSize(w, h),
    dispose: () => {
      sao.dispose();
      output.dispose();
      renderPass.dispose();
      composer.dispose();
    },
  };
}
