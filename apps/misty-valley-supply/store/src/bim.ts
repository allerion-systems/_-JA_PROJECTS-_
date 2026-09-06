/* ------------------------------------------------------------------------
   bim.ts — the shared 5D core behind the Shed and Deck designers.

   5D means the parametric model IS the estimate. Every component of the
   design is a typed element: an IFC (ISO 16739) class for what it is, a
   quantity derived from the geometry, and a binding to a real catalog SKU
   whose price comes from data.ts PRODUCTS. The 3D scene, the bill of
   material and the price all read the same element list, so they can
   never disagree.

   IFC classes are carried as metadata on each BoM line — this is typing,
   not an .ifc file export.
   ---------------------------------------------------------------------- */

import { PRODUCTS, type Product } from "@/data";

// ---- the element ---------------------------------------------------------

export type Element = {
  ifcClass: string;      // IFC (ISO 16739) entity class, e.g. "IfcColumn"
  name: string;          // human component name, e.g. "6×6 post"
  sku?: string;          // catalog SKU the quantity is bound to
  qty: number;
  unit: string;          // uom, from the bound product when a SKU is given
  unitPrice: number;     // from data.ts PRODUCTS — never typed by hand here
  ext: number;           // qty × unitPrice, rounded to cents
};

// ---- the SKU binder ------------------------------------------------------

const bySku = new Map<string, Product>(PRODUCTS.map(p => [p.sku, p]));

/** Look a product up by SKU. Throws in dev if a takeoff names a SKU that
    does not exist — a 5D model bound to a phantom SKU is a lie. */
export function productOf(sku: string): Product {
  const p = bySku.get(sku);
  if (!p) throw new Error(`bim.ts: unknown SKU ${sku} — not in data.ts PRODUCTS`);
  return p;
}

/** Make one typed element bound to a catalog SKU. Quantity in the product's
    own uom; price always read from the catalog. */
export function el(ifcClass: string, name: string, sku: string, qty: number): Element {
  const p = productOf(sku);
  const q = Math.max(0, Math.ceil(qty)); // sell whole units — sticks, sheets, boxes
  return {
    ifcClass, name, sku, qty: q, unit: p.uom,
    unitPrice: p.price,
    ext: Math.round(q * p.price * 100) / 100,
  };
}

// ---- price rollup --------------------------------------------------------

/** Customer price = the sum of catalog LIST extensions. data.ts prices are
    list (landed basis ≈ 60% of list per catalog policy), so quoting at list
    already carries the house margin — no separate markup line is added, and
    no cost basis ever renders customer-side (gate cost columns behind
    can("cost.view")). */
export function rollup(elements: Element[]) {
  const subtotal = Math.round(elements.reduce((s, e) => s + e.ext, 0) * 100) / 100;
  return { subtotal, total: subtotal };
}

// ---- quantity-takeoff helpers -------------------------------------------

/** Members at a given on-center spacing across a run, plus the starter:
    floor(run·12 / o.c.) + 1 — the framing-square count, not an average. */
export const spaced = (runFt: number, ocIn: number) => Math.floor((runFt * 12) / ocIn) + 1;

/** 4×8 sheet goods: gross area / 32 sf, rounded up. Openings are NOT
    deducted for sheathing — the cutout is waste, which is how crews buy. */
export const sheets = (areaSf: number) => Math.ceil(areaSf / 32);

/** Sticks of stock length needed to cover a linear-feet demand. */
export const sticks = (lf: number, stockFt: number) => Math.ceil(lf / stockFt);

/** Sloped rafter length for a gable: run × the slope factor for pitch:12,
    plus eave overhang. */
export const rafterLen = (runFt: number, pitch: number, overhangFt = 1) =>
  runFt * Math.sqrt(1 + (pitch / 12) ** 2) + overhangFt;

// ==========================================================================
// SHED — gable storage shed, IRC-sane light framing
// ==========================================================================

export type ShedParams = {
  widthFt: 8 | 10 | 12;
  lengthFt: number;        // 8–24, 2-ft steps
  wallHFt: 7 | 8;
  pitch: 4 | 6;            // rise in 12
  doors: 1 | 2;
  windows: 0 | 1 | 2;
  siding: "vinyl" | "none";
  roof: "ready" | "metal"; // "ready" = sheathed + underlayment, roofing by others
  framing: "stick" | "truss";
  ramp: boolean;
  loft: boolean;
  cupola: boolean;
  /** Premium finish tier — optional so existing callers keep working. */
  wainscot?: boolean;
  hvac?: boolean;
};

export const SHED_DOOR = { w: 3, h: 6.83 };  // 3-0 × 6-10 shed door
export const SHED_WIN = { w: 3, h: 4 };      // 3-0 × 4-0 window

/** Geometry the scene and the takeoff both derive from. */
export function shedGeometry(p: ShedParams) {
  const run = p.widthFt / 2;
  const rise = run * (p.pitch / 12);
  const rafter = rafterLen(run, p.pitch);           // incl. 1 ft eave overhang
  const perimeter = 2 * (p.widthFt + p.lengthFt);
  const gableArea = 2 * 0.5 * p.widthFt * rise;     // both gable triangles
  const wallArea = perimeter * p.wallHFt + gableArea;
  const roofArea = 2 * rafter * p.lengthFt;         // both planes
  const openings = p.doors + p.windows;
  const openingArea = p.doors * SHED_DOOR.w * SHED_DOOR.h + p.windows * SHED_WIN.w * SHED_WIN.h;
  return { run, rise, rafter, perimeter, gableArea, wallArea, roofArea, openings, openingArea };
}

/** The whole shed as typed, SKU-bound elements. Every rule is stated. */
export function shedTakeoff(p: ShedParams): Element[] {
  const g = shedGeometry(p);
  const out: Element[] = [];

  // ---- floor -------------------------------------------------------------
  // Skids: three PT 4×4 runs the length of the shed (edges + center),
  // built up from 8-ft sticks.
  out.push(el("IfcBeam", "PT 4×4 skid (3 runs × length)", "MVS-PT-448", 3 * sticks(p.lengthFt, 8)));
  // Floor joists 16" o.c. across the length, each spanning the width, from
  // PT 2×8×12 stock — IRC R502 floor-framing spacing. Plus two rim runs.
  const floorJoists = spaced(p.lengthFt, 16);
  out.push(el("IfcMember", 'Floor joist — PT 2×8, 16" o.c.', "MVS-PT-2812", floorJoists));
  out.push(el("IfcMember", "Rim joist — PT 2×8, both long edges", "MVS-PT-2812", 2 * sticks(p.lengthFt, 12)));
  // Floor deck: 7/16 OSB over the full footprint.
  out.push(el("IfcSlab", "Floor deck — 7/16 OSB", "MVS-OSB-716", sheets(p.widthFt * p.lengthFt)));

  // ---- walls -------------------------------------------------------------
  // Studs 16" o.c. per wall (floor(len·12/16)+1 each), plus 2 trimmer/king
  // studs per opening. 2×4×8 precuts both wall heights.
  const fieldStuds =
    2 * spaced(p.lengthFt, 16) + 2 * spaced(p.widthFt, 16) + 2 * g.openings;
  out.push(el("IfcColumn", 'Wall stud — 2×4, 16" o.c. + opening framing', "MVS-STD-248", fieldStuds));
  // Plates: two top, one bottom — 3 × perimeter in 8-ft sticks.
  out.push(el("IfcMember", "Wall plate — 2×4 (2 top, 1 bottom)", "MVS-STD-248", sticks(3 * g.perimeter, 8)));
  // Headers: doubled 2×4 over each opening — one stick rips both plies.
  out.push(el("IfcBeam", "Opening header — doubled 2×4", "MVS-STD-248", g.openings));
  // Wall sheathing: gross wall area incl. gables; openings NOT deducted.
  out.push(el("IfcWallStandardCase", "Wall sheathing — 7/16 OSB", "MVS-OSB-716", sheets(g.wallArea)));
  // Housewrap: IRC R703.2 water-resistive barrier. 9×100 roll = 900 sf.
  out.push(el("IfcCovering", "Housewrap — full wrap", "MVS-HW-Z90", Math.ceil(g.wallArea / 900)));

  // ---- openings as components --------------------------------------------
  // Prehung door and mounted window units — dropship parts, one per opening.
  out.push(el("IfcDoor", "Shed door — 3-0 × 6-10 prehung", "MVS-SC-DOOR3", p.doors));
  if (p.windows > 0) out.push(el("IfcWindow", "Shed window — 3×4 with J-trim", "MVS-SC-WIN34", p.windows));

  // ---- roof --------------------------------------------------------------
  if (p.framing === "truss") {
    // Plated gable trusses 24" o.c. — engineered spacing per the plant's
    // sealed design sheet; replaces rafters, ridge and ceiling ties.
    out.push(el("IfcElementAssembly", 'Gable truss — plated, 24" o.c.', "MVS-TR-G12", spaced(p.lengthFt, 24)));
  } else {
    // Gable rafters 16" o.c. in pairs along the length; length from run,
    // pitch and a 1-ft eave overhang. One 2×4×8 stick per rafter (max run
    // 6 ft × 6:12 + overhang = 7.7 ft < 8).
    const rafterPairs = spaced(p.lengthFt, 16);
    out.push(el("IfcMember", `Rafter — 2×4, ${p.pitch}:12, 16" o.c. (${rafterPairs} pairs)`, "MVS-STD-248", rafterPairs * 2));
    out.push(el("IfcBeam", "Ridge board — 2×4", "MVS-STD-248", sticks(p.lengthFt, 8)));
  }
  out.push(el("IfcRoof", "Roof sheathing — 7/16 OSB, both planes", "MVS-OSB-716", sheets(g.roofArea)));
  // Underlayment: 10-square roll covers 1,000 sf.
  out.push(el("IfcCovering", "Synthetic underlayment", "MVS-RF-SYN10", Math.ceil(g.roofArea / 1000)));
  // Drip edge: every foot of eave (2 × length) and rake (4 rafter slopes).
  const dripLf = 2 * p.lengthFt + 4 * g.rafter;
  out.push(el("IfcCovering", "Drip edge — eaves + rakes", "MVS-RF-DE10", sticks(dripLf, 10)));
  // Metal roof option: 29-ga cut-to-length panels bought by the square.
  if (p.roof === "metal")
    out.push(el("IfcCovering", "Metal roofing — 29-ga, cut to rafter length", "MVS-RF-MTL29", Math.ceil(g.roofArea / 100)));

  // ---- siding ------------------------------------------------------------
  if (p.siding === "vinyl") {
    // Net of openings — siding is the one takeoff bought net, by the square.
    const netSq = Math.max(1, Math.ceil((g.wallArea - g.openingArea) / 100));
    out.push(el("IfcCovering", "Vinyl siding — net of openings", "MVS-SID-VD4", netSq));
  }

  // ---- fasteners ---------------------------------------------------------
  // Rule of thumb: one 5-lb box of exterior screws (≈400 screws) fastens
  // about 11 sheets of sheathing plus its framing — call it one box per
  // 350 sf of sheathed area, minimum 2 boxes for any shed.
  const sheathedSf = g.wallArea + g.roofArea + p.widthFt * p.lengthFt;
  out.push(el("IfcFastener", "Exterior screws — framing + sheathing", "MVS-FS-EX9",
    Math.max(2, Math.ceil(sheathedSf / 350))));

  // ---- dropship add-ons ---------------------------------------------------
  if (p.ramp) out.push(el("IfcRamp", "Shed ramp — 4 ft, 1,000-lb rated", "MVS-SC-RAMP4", 1));
  if (p.loft) out.push(el("IfcSlab", "Loft kit — gable-end bays", "MVS-SC-LOFT8", Math.max(1, Math.ceil(p.lengthFt / 8) - 1)));
  if (p.cupola) out.push(el("IfcCovering", "Cupola — 24 in vented", "MVS-SC-CUP24", 1));
  // Premium finish tier: stone wainscot by the 8-ft section around the
  // perimeter; conditioned option pairs the mini-split with the electrical
  // package it needs.
  if (p.wainscot) out.push(el("IfcCovering", "Stone-veneer wainscot — full perimeter", "MVS-SC-WAIN8", Math.ceil(g.perimeter / 8)));
  if (p.hvac) {
    out.push(el("IfcDistributionElement", "Mini-split — 12k BTU heat/cool", "MVS-CI-HVAC12", 1));
    out.push(el("IfcDistributionElement", "Electrical package — panel + circuits", "MVS-CI-ELEC", 1));
  }

  return out;
}

// ==========================================================================
// DECK — ledger-hung PT deck per IRC R507
// ==========================================================================

export type DeckParams = {
  widthFt: number;    // 10–20, along the house
  depthFt: number;    // 8–16, out from the house
  heightFt: 2 | 4 | 8;
  railing: boolean;   // forced on at ≥ 30 in — IRC R312.1.1 guards
  stairs: boolean;
};

/** IRC R312.1.1: a guard is REQUIRED on any walking surface more than
    30 inches above grade. 2 ft = 24 in is the only optional case here. */
export const guardRequired = (heightFt: number) => heightFt * 12 >= 30;

export function deckGeometry(p: DeckParams) {
  const railing = p.railing || guardRequired(p.heightFt);
  const joists = spaced(p.widthFt, 16);                 // 2×8 @ 16" o.c., spanning depth
  const posts = Math.ceil(p.widthFt / 8) + 1;           // 6×6 under the beam, ≤ 8 ft apart
  // 5/4×6 decking: 5.5 in face + 1/4 in gap = 5.75 in per course.
  const courses = Math.ceil((p.depthFt * 12) / 5.75);
  const guardLf = p.widthFt + 2 * p.depthFt;            // three open sides
  const risers = Math.ceil((p.heightFt * 12) / 7.5);    // ≤ 7-3/4 in per IRC R311.7.5.1
  const treads = Math.max(0, risers - 1);
  return { railing, joists, posts, courses, guardLf, risers, treads };
}

export function deckTakeoff(p: DeckParams): Element[] {
  const g = deckGeometry(p);
  const out: Element[] = [];

  // ---- structure ---------------------------------------------------------
  // Ledger along the house — same 2×8 stock as the joists (IRC R507.9).
  out.push(el("IfcMember", "Ledger — PT 2×8, lagged to band per R507.9", "MVS-PT-2812", sticks(p.widthFt, 12)));
  // Joists 16" o.c. spanning from ledger to beam.
  out.push(el("IfcMember", 'Joist — PT 2×8, 16" o.c.', "MVS-PT-2812", g.joists));
  // Rim across the outer joist ends + closed sides.
  out.push(el("IfcMember", "Rim joist — PT 2×8, outer + sides", "MVS-PT-2812",
    sticks(p.widthFt, 12) + 2 * sticks(p.depthFt, 12)));
  // One hanger at each joist's ledger end — IRC R507.6 bearing.
  out.push(el("IfcFastener", "Joist hanger — 2×8, at ledger", "MVS-HD-LUS28", g.joists));
  // Doubled 2×10 beam under the outer joist ends (R507.5).
  out.push(el("IfcBeam", "Beam — doubled PT 2×10", "MVS-PT-21012", 2 * sticks(p.widthFt, 12)));
  // 6×6 posts, ≤ 8 ft spacing, one 8-ft stick each (R507.4).
  out.push(el("IfcColumn", "Post — PT 6×6, ≤ 8 ft o.c.", "MVS-PT-668", g.posts));
  out.push(el("IfcFastener", "Post base — 6×6, standoff, ZMAX", "MVS-HD-ABU66", g.posts));
  // Footings: three 80-lb bags per post — a 10-in tube ~30 in deep.
  out.push(el("IfcSlab", "Footing — concrete mix, 3 bags/post", "MVS-CN-80", g.posts * 3));

  // ---- decking -----------------------------------------------------------
  // 5/4×6 at 5.5 in exposure + 1/4 in gap; each course runs the width.
  out.push(el("IfcCovering", '5/4×6 decking — 5.5" exposure + gap', "MVS-PT-5412",
    g.courses * sticks(p.widthFt, 12)));

  // ---- guard -------------------------------------------------------------
  if (g.railing) {
    // 4×4 guard posts ≤ 6 ft apart on the three open sides; two posts
    // per 8-ft stick at 42 in each. Top + bottom rail in PT 2×4.
    const guardPosts = Math.ceil(g.guardLf / 6) + 1;
    out.push(el("IfcRailing", "Guard post — PT 4×4 @ ≤ 6 ft", "MVS-PT-448", Math.ceil(guardPosts / 2)));
    out.push(el("IfcRailing", "Guard rail — PT 2×4, top + bottom", "MVS-PT-248", sticks(2 * g.guardLf, 8)));
    // Balusters: one per 5.5 in of run keeps the R312.1.3 4-in sphere out.
    out.push(el("IfcRailing", 'Baluster — 2×2 @ <4" clear (R312.1.3)', "MVS-PT-BAL",
      Math.ceil((g.guardLf * 12) / 5.5)));
  }

  // ---- stairs ------------------------------------------------------------
  if (p.stairs && g.treads > 0) {
    // Three cut stringers from PT 2×10 stock; treads are two 5/4×6 courses
    // on a 36-in-wide stair — four tread pieces per 12-ft stick.
    out.push(el("IfcMember", `Stair stringer — PT 2×10, ${g.risers} risers × 3`, "MVS-PT-21012", 3));
    out.push(el("IfcCovering", `Stair tread — 5/4×6 ×2 per tread (${g.treads} treads)`, "MVS-PT-5412",
      Math.ceil((g.treads * 2 * 3) / 12)));
  }

  // ---- fasteners ---------------------------------------------------------
  // Structural screws: ledger fastening (2 rows @ 16" o.c. per R507.9.1.3)
  // plus hanger and post hardware — one 50-ct box per 12 ft of ledger, min 1.
  out.push(el("IfcFastener", "Structural screws — ledger + hardware", "MVS-FS-STR50",
    Math.max(1, Math.ceil(p.widthFt / 12))));
  // Deck screws: 2 per board per joist ≈ 3.5 screws/sf; a 5-lb box runs
  // about 400 screws.
  const deckSf = p.widthFt * p.depthFt;
  out.push(el("IfcFastener", "Deck screws — 2 per board per joist", "MVS-FS-EX9",
    Math.max(1, Math.ceil((deckSf * 3.5) / 400))));

  return out;
}
