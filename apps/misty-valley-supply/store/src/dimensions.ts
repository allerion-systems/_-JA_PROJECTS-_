import * as THREE from "three";

/* ------------------------------------------------------------------------
   dimensions.ts — CAD-style in-scene dimension callouts.

   makeDimensions() builds one THREE.Group of dimension lines: a thin line
   with perpendicular end ticks plus a text sprite reading e.g. "12′-0″" —
   dark text on a subtle translucent white pill. The label texture is a
   generated canvas (never fetched — CSP-safe, same rule as the material
   textures in the scenes). The group is named "mvs-dims" so a scene can
   toggle its visibility, flagged noFit so it never widens the camera fit,
   and is meant to live INSIDE each scene's disposable parametric group —
   the existing disposeGroup() traversal frees its geometry, materials and
   canvas textures on every rebuild.
   ---------------------------------------------------------------------- */

export const DIMS_NAME = "mvs-dims";

const LINE_COLOR = 0x142f63; // --marine — the drawing ink

/** Feet as architect's feet-and-inches: 12 → 12′-0″, 12.5 → 12′-6″. */
export function formatFeet(ft: number): string {
  const abs = Math.abs(ft);
  let whole = Math.floor(abs);
  let inches = Math.round((abs - whole) * 12);
  if (inches === 12) { whole += 1; inches = 0; }
  return `${ft < 0 ? "-" : ""}${whole}′-${inches}″`;
}

/** Label sprite: dark text on a translucent white pill, canvas-generated. */
function makeLabelSprite(text: string, worldH: number): THREE.Sprite {
  const S = 2; // supersample for crisp text at typical camera distance
  const fontPx = 34 * S;
  const font = `600 ${fontPx}px Arial, Helvetica, sans-serif`;
  const c = document.createElement("canvas");
  let g = c.getContext("2d")!;
  g.font = font;
  const padX = 22 * S, padY = 11 * S;
  c.width = Math.ceil(g.measureText(text).width + padX * 2);
  c.height = Math.ceil(fontPx + padY * 2);
  g = c.getContext("2d")!; // sizing the canvas reset the context state

  // the pill
  const r = (c.height - 2) / 2;
  g.beginPath();
  g.moveTo(1 + r, 1);
  g.lineTo(c.width - 1 - r, 1);
  g.arc(c.width - 1 - r, 1 + r, r, -Math.PI / 2, Math.PI / 2);
  g.lineTo(1 + r, c.height - 1);
  g.arc(1 + r, 1 + r, r, Math.PI / 2, (3 * Math.PI) / 2);
  g.closePath();
  g.fillStyle = "rgba(255,255,255,0.84)";
  g.fill();
  g.lineWidth = 1.5 * S;
  g.strokeStyle = "rgba(20,47,99,0.4)";
  g.stroke();

  // the reading
  g.font = font;
  g.fillStyle = "#1c2a44";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, c.width / 2, c.height / 2 + 1.5 * S);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthTest: false, // reads over the model, CAD-overlay style
  }));
  sprite.renderOrder = 20;
  sprite.scale.set(worldH * (c.width / c.height), worldH, 1);
  return sprite;
}

export type Dim = {
  from: [number, number, number];
  to: [number, number, number];
  /** Reading on the pill; defaults to the measured span in ′-″. */
  label?: string;
};

/** One group of dimension callouts, ready to add to a scene's rebuilt group. */
export function makeDimensions(dims: Dim[]): THREE.Group {
  const group = new THREE.Group();
  group.name = DIMS_NAME;
  group.userData.noFit = true; // annotation — never widens the camera fit
  const up = new THREE.Vector3(0, 1, 0);
  const lineMat = new THREE.LineBasicMaterial({ color: LINE_COLOR });

  for (const d of dims) {
    const a = new THREE.Vector3(...d.from);
    const b = new THREE.Vector3(...d.to);
    const span = a.distanceTo(b);
    if (!(span > 0)) continue;
    const dir = b.clone().sub(a).normalize();
    // end ticks perpendicular to the run, in the ground plane
    let side = new THREE.Vector3().crossVectors(dir, up);
    if (side.lengthSq() < 1e-6) side = new THREE.Vector3(1, 0, 0);
    side.normalize().multiplyScalar(Math.max(0.35, span * 0.022));

    const pts: THREE.Vector3[] = [
      a, b,                                                // the line
      a.clone().sub(side), a.clone().add(side),            // tick at each end
      b.clone().sub(side), b.clone().add(side),
    ];
    const line = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
    group.add(line);

    // pill floats just above the midpoint; scales modestly with the span
    const h = Math.min(2.4, Math.max(1.15, span * 0.085));
    const sprite = makeLabelSprite(d.label ?? formatFeet(span), h);
    sprite.position.copy(a).add(b).multiplyScalar(0.5).addScaledVector(up, h * 0.75);
    group.add(sprite);
  }
  return group;
}
