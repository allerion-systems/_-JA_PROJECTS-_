/* ------------------------------------------------------------------------
   bimGarage.ts — Metal Garages & Carports on the shared 5D core.

   RESEARCH SUMMARY — the option tree the metal carport/garage industry runs
   on (surveyed Sep 2026 across national dealer configurators and buying
   guides; option ARCHITECTURE and terminology only — no company's branding,
   copy, photos or trademarked color-chart names are reproduced):

   · ROOF STYLE, three tiers everywhere:
       regular    — economy "barn-style" roof with rounded eave corners,
                    panels run HORIZONTAL (the length of the building);
       boxedEave  — A-frame silhouette with boxed eaves, panels still
                    horizontal — the "house look" middle tier;
       vertical   — A-frame with hat-channel purlins, ridge cap, panels run
                    eave-to-ridge so snow/leaves slide off; the premium
                    roof, recommended past ~36 ft of length.
   · WIDTHS 12–30 ft (12 single, 18–24 double, 26–30 triple-wide; bows are
     trussed above 24 ft). LENGTHS 21–51 ft in 5-ft bays — base rails come
     21 ft, so the ladder runs 21/26/31/36/41/46/51.
   · LEG HEIGHT 6–14 ft (side clearance, not peak height).
   · FRAME GAUGE: 14-ga standard vs 12-ga upgrade (thicker tube, longer
     warranty, the frame most certified ratings assume).
   · PANEL GAUGE: 29-ga standard vs 26-ga upgrade sheeting.
   · CERTIFIED vs NON-CERTIFIED: certified = engineered and documented to a
     named wind/snow rating (e.g. ~30 PSF / 120 MPH class); an engineering
     line on the order, never a pre-existing certificate.
   · ENCLOSURE, walked one wall at a time on a single sheet:
       sides (the long walls): open | partially closed (eave panel down
       ~3 ft) | fully closed;  ends: open | gable (peak triangle only)
       | fully closed. Two closed sides + two closed ends = a garage.
   · WALL PANEL ORIENTATION follows the roof tier here: regular/boxed-eave
     builds sheet walls horizontally, vertical-roof builds sheet vertically
     (the industry's "vertical everything" premium look).
   · DOORS: curtain-style roll-ups 6×6 / 9×8 / 10×10 / 12×12 (frame-out
     included, cut into a closed wall), 36-in walk-in doors, 30×30 windows.
   · ANCHORS by surface: concrete wedge bolts | bare-ground rebar pins
     (auger-style for certified-on-ground) | asphalt barbed augers.
   · LEAN-TO wings off either or both eave sides, priced per bay.
   · COLORS: separate roof / trim / side picks from ~a-dozen-color charts;
     generic commodity names only here (Galvalume, Barn Red, Forest Green…).

   PRICING SHAPE (cloned): one 12×21 regular-roof base unit plus adder
   lines — width per 2 ft, length per 5-ft bay, leg height per foot,
   roof-style upgrade, gauge upgrades, enclosure per section, doors,
   windows, anchors per leg, lean-to per bay, certification. Every line
   binds to a data.ts SKU via el(); the 3D scene, the BoM and the price
   all read this one takeoff, so they can never disagree.
   ---------------------------------------------------------------------- */

import { el, type Element } from "@/bim";

// ---- the option tree ------------------------------------------------------

export const GARAGE_WIDTHS = [12, 18, 20, 22, 24, 26, 28, 30] as const;
export const GARAGE_LENGTHS = [21, 26, 31, 36, 41, 46, 51] as const;
export const GARAGE_LEGS = [6, 7, 8, 9, 10, 11, 12, 13, 14] as const;
export const GARAGE_ROOFS = ["regular", "boxedEave", "vertical"] as const;
export const GARAGE_SIDE_STATES = ["open", "half", "full"] as const;
export const GARAGE_END_STATES = ["open", "gable", "full"] as const;
export const GARAGE_ANCHORS = ["concrete", "ground", "asphalt"] as const;
export const GARAGE_LEANTO = ["none", "left", "right", "both"] as const;
export const GARAGE_DOOR_TYPES = ["rollup6", "rollup9", "rollup10", "rollup12", "walkin"] as const;
export const GARAGE_WALLS = ["front", "back", "left", "right"] as const;

export type GarageWall = (typeof GARAGE_WALLS)[number];
export type GarageDoorType = (typeof GARAGE_DOOR_TYPES)[number];
export type GarageDoor = { type: GarageDoorType; wall: GarageWall };

export type GarageParams = {
  widthFt: (typeof GARAGE_WIDTHS)[number];
  lengthFt: (typeof GARAGE_LENGTHS)[number];
  legHeightFt: (typeof GARAGE_LEGS)[number];
  roofStyle: (typeof GARAGE_ROOFS)[number];
  frameGauge: 14 | 12;
  panelGauge: 29 | 26;
  leftSide: (typeof GARAGE_SIDE_STATES)[number];
  rightSide: (typeof GARAGE_SIDE_STATES)[number];
  frontEnd: (typeof GARAGE_END_STATES)[number];
  backEnd: (typeof GARAGE_END_STATES)[number];
  doors: GarageDoor[];
  windows: 0 | 1 | 2 | 3 | 4;
  anchors: (typeof GARAGE_ANCHORS)[number];
  leanTo: (typeof GARAGE_LEANTO)[number];
  certified: boolean;
  /** Cosmetic only — chosen at order, never priced. Hexes from the palette. */
  roofColor?: string;
  trimColor?: string;
  sideColor?: string;
};

// ---- generic color palette (commodity names, never chart trade names) -----

export const GARAGE_COLORS = [
  ["Galvalume", "#b9bec4"],
  ["White", "#f2f0e9"],
  ["Sandstone", "#d8c9a3"],
  ["Clay", "#b98d68"],
  ["Dove Gray", "#9aa0a6"],
  ["Charcoal", "#3a3d42"],
  ["Black", "#1e1f22"],
  ["Barn Red", "#7d2a26"],
  ["Burgundy", "#5d1f24"],
  ["Forest Green", "#2e4a3a"],
  ["Slate Blue", "#3f556e"],
  ["Earth Brown", "#4e3a2a"],
] as const;

export const garageColorName = (hex: string | undefined): string =>
  GARAGE_COLORS.find(([, hx]) => hx === hex)?.[0] ?? "";

// ---- untrusted-wire guards ------------------------------------------------

/** Untrusted doors array (saved design / #d= link) → valid GarageDoor[].
    Junk entries fall away — never a crash, capped at 4 doors. */
export function sanitizeGarageDoors(v: unknown): GarageDoor[] {
  if (!Array.isArray(v)) return [];
  const out: GarageDoor[] = [];
  for (const d of v.slice(0, 4)) {
    if (typeof d !== "object" || d === null || Array.isArray(d)) continue;
    const { type, wall } = d as Record<string, unknown>;
    if (!GARAGE_DOOR_TYPES.includes(type as GarageDoorType)) continue;
    if (!GARAGE_WALLS.includes(wall as GarageWall)) continue;
    out.push({ type: type as GarageDoorType, wall: wall as GarageWall });
  }
  return out;
}

// ---- geometry shared by scene + takeoff ----------------------------------

/** Door leaf sizes in feet (w, h). Walk-in is a 3-0 × 6-10 steel door. */
export const GARAGE_DOOR_SIZES: Record<GarageDoorType, { w: number; h: number; label: string }> = {
  rollup6: { w: 6, h: 6, label: "6 × 6 roll-up" },
  rollup9: { w: 9, h: 8, label: "9 × 8 roll-up" },
  rollup10: { w: 10, h: 10, label: "10 × 10 roll-up" },
  rollup12: { w: 12, h: 12, label: "12 × 12 roll-up" },
  walkin: { w: 3, h: 6.83, label: "36-in walk-in" },
};

/**
 * Frame arithmetic the scene and the takeoff both derive from.
 * BAY RULE (documented so the numbers audit): legs stand on ~5-ft centers
 * along the base rail, so bays = ceil(length / 5) — a 21-ft frame is 5 bays
 * and 6 leg PAIRS; legs = 2 × (bays + 1). Adder quantities:
 *   width  — (widthFt − 12) / 2 two-foot increments over the 12-ft base;
 *   length — (lengthFt − 21) / 5 five-foot bays over the 21-ft base;
 *   legs   — legHeightFt − 6 feet over the 6-ft base legs.
 */
export function garageGeometry(p: GarageParams) {
  const bays = Math.ceil(p.lengthFt / 5);
  const legPairs = bays + 1;
  const legs = 2 * legPairs;
  const rise = (p.widthFt / 2) * (3 / 12); // A-frame 3:12; regular renders lower
  return {
    widthFt: p.widthFt, lengthFt: p.lengthFt, legFt: p.legHeightFt,
    bays, legPairs, legs, rise,
    widQty: (p.widthFt - 12) / 2,
    lenQty: (p.lengthFt - 21) / 5,
    legQty: p.legHeightFt - 6,
  };
}

// ---- the takeoff ----------------------------------------------------------

/**
 * The whole structure as typed, SKU-bound elements — base unit + the
 * industry's adder lines. Colors are cosmetic and never read here.
 *
 * HAND-CHECKS (verified penny-exact in a node harness):
 *  (a) 12×21 regular carport, 14-ga, 29-ga, all open, ground anchors,
 *      6-ft legs:  base 1,595.00 + anchors 12 × 8 = 96.00 → $1,691.00.
 *  (b) 24×31 vertical garage, 10-ft legs, 12-ga, fully enclosed, one
 *      10×10 roll-up + walk-in + 2 windows, certified, concrete anchors:
 *      bays = 7, legs = 16 —
 *      1,595 + 6×180 + 2×395 + 4×150 + 7×145 + 7×95 + 2×(7×135)
 *      + 2×(24×32) + 1,095 + 395 + 2×275 + 16×12 + 695 = $12,098.00.
 */
export function garageTakeoff(p: GarageParams): Element[] {
  const g = garageGeometry(p);
  const out: Element[] = [];

  // ---- base unit + size adders ------------------------------------------
  out.push(el("IfcElementAssembly", "Carport base unit — 12 × 21 × 6 ft, regular roof, 14-ga", "MVS-GC-CP1221", 1));
  if (g.widQty > 0) out.push(el("IfcElementAssembly", `Width — ${p.widthFt} ft (${g.widQty} × 2-ft add)`, "MVS-GC-WID2", g.widQty));
  if (g.lenQty > 0) out.push(el("IfcElementAssembly", `Length — ${p.lengthFt} ft (${g.lenQty} × 5-ft bay)`, "MVS-GC-LEN5", g.lenQty));
  if (g.legQty > 0) out.push(el("IfcColumn", `Leg height — ${p.legHeightFt} ft (${g.legQty} ft over base)`, "MVS-GC-LEG1", g.legQty));

  // ---- roof style --------------------------------------------------------
  if (p.roofStyle === "boxedEave")
    out.push(el("IfcRoof", "Boxed-eave A-frame roof — horizontal panels", "MVS-GC-BOX", 1));
  if (p.roofStyle === "vertical")
    out.push(el("IfcRoof", `Vertical roof — panels eave-to-ridge, ${g.bays} sections`, "MVS-GC-VERT", g.bays));

  // ---- gauges ------------------------------------------------------------
  if (p.frameGauge === 12)
    out.push(el("IfcElementAssembly", "12-ga frame upgrade — every bow and leg", "MVS-GC-12GA", g.bays));
  if (p.panelGauge === 26)
    out.push(el("IfcCovering", "26-ga panel upgrade — roof + installed walls", "MVS-GC-26GA", g.bays));

  // ---- enclosure: sides then ends ---------------------------------------
  const side = (which: string, state: GarageParams["leftSide"]) => {
    if (state === "half")
      out.push(el("IfcWallStandardCase", `${which} side — partial (eave panel), ${g.bays} sections`, "MVS-GC-SIDEH", g.bays));
    if (state === "full")
      out.push(el("IfcWallStandardCase", `${which} side — fully closed, ${g.bays} sections`, "MVS-GC-SIDEF", g.bays));
  };
  side("Left", p.leftSide);
  side("Right", p.rightSide);
  const end = (which: string, state: GarageParams["frontEnd"]) => {
    if (state === "gable")
      out.push(el("IfcWallStandardCase", `${which} end — gable fill above eave`, "MVS-GC-GABLE", 1));
    if (state === "full")
      out.push(el("IfcWallStandardCase", `${which} end — fully closed, gable incl. (${p.widthFt} ft)`, "MVS-GC-ENDP", p.widthFt));
  };
  end("Front", p.frontEnd);
  end("Back", p.backEnd);

  // ---- doors + windows ---------------------------------------------------
  const DOOR_SKUS: Record<GarageDoorType, string> = {
    rollup6: "MVS-GC-RU66", rollup9: "MVS-GC-RU98",
    rollup10: "MVS-GC-RU1010", rollup12: "MVS-GC-RU1212", walkin: "MVS-GC-WALK36",
  };
  for (const d of p.doors)
    out.push(el("IfcDoor", `${GARAGE_DOOR_SIZES[d.type].label} — ${d.wall} wall, frame-out incl.`, DOOR_SKUS[d.type], 1));
  if (p.windows > 0)
    out.push(el("IfcWindow", "Window — 30 × 30 with frame-out", "MVS-GC-WIN3030", p.windows));

  // ---- anchors — one per leg, matched to the surface ---------------------
  const ANCHOR_SKUS = { concrete: "MVS-GC-ANCC", ground: "MVS-GC-ANCG", asphalt: "MVS-GC-ANCA" } as const;
  const ANCHOR_NAMES = {
    concrete: "Concrete wedge anchor", ground: "Ground rebar anchor", asphalt: "Asphalt barbed anchor",
  } as const;
  out.push(el("IfcFastener", `${ANCHOR_NAMES[p.anchors]} — ${g.legs} legs`, ANCHOR_SKUS[p.anchors], g.legs));

  // ---- lean-to wings -----------------------------------------------------
  if (p.leanTo === "left" || p.leanTo === "both")
    out.push(el("IfcRoof", `Lean-to — left side, ${g.bays} bays`, "MVS-GC-LEAN", g.bays));
  if (p.leanTo === "right" || p.leanTo === "both")
    out.push(el("IfcRoof", `Lean-to — right side, ${g.bays} bays`, "MVS-GC-LEAN", g.bays));

  // ---- certification — an engineering line, never a pre-existing claim ---
  if (p.certified)
    out.push(el("IfcAnnotation", "Certified wind/snow package — engineered, sealed drawings", "MVS-GC-CERT", 1));

  return out;
}
