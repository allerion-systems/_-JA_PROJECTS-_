/* ------------------------------------------------------------------------
   bimBarndo.ts — the Barndominium Builder takeoff on the shared 5D core.

   One steel shell, part shop, part living quarters. The shell is a single
   fabricated SKU (engineering and stamped drawings included); everything
   the takeoff adds on top is the living-quarters buildout — steel-stud
   interior walls, drywall, insulation, windows, and allowance lines for
   the trades that get quoted per site (electrical, bath wet areas).

   The 3D scene (BarndoScene) and this takeoff both derive from
   barndoGeometry(), so what renders is what the sheet prices.
   ---------------------------------------------------------------------- */

import { el, sheets, spaced, sticks, type Element } from "@/bim";

export type BarndoParams = {
  size: "30x40" | "40x60";
  quartersFraction: 0.25 | 0.5;       // share of the footprint that is quarters
  porchBays: 0 | 1 | 2 | 3;           // 12-ft porch bays off the eave side
  quartersWindows: 2 | 3 | 4 | 5 | 6; // generic 3×4 units — fine for planning
  bathrooms: 1 | 2;
};

/** Interior wall height for the quarters buildout: studs to a 9-ft flat
    ceiling under the shell's clear eave — drywall and insulation both
    stop there; above is shop-style open steel. */
export const QUARTERS_WALL_H = 9;

/**
 * Geometry the scene and the takeoff both derive from.
 *
 * WALL-LENGTH RULE (documented so the numbers audit): the quarters occupy
 * one full-width end of the shell, qDepth = length × fraction deep. Its
 * framed interior walls are
 *   - the quarters' share of the shell perimeter, furred with steel studs:
 *     the quarters end wall (widthFt) + both eave-side segments (2 × qDepth);
 *   - the full-width demising wall between quarters and shop (widthFt);
 *   - one partition spine splitting the quarters into rooms, running the
 *     quarters depth (qDepth).
 * So wallFt = 2 × (widthFt + qDepth) + qDepth — the quarters rectangle's
 * perimeter plus one spine. Only the perimeter share (widthFt + 2 × qDepth)
 * is exterior wall for insulation purposes; the demising wall and spine
 * are interior-to-interior.
 */
export function barndoGeometry(p: BarndoParams) {
  const widthFt = p.size === "30x40" ? 30 : 40;   // gable span
  const lengthFt = p.size === "30x40" ? 40 : 60;  // eave run
  const eaveFt = p.size === "30x40" ? 12 : 14;    // shell clear eave height
  const area = widthFt * lengthFt;
  const qDepth = lengthFt * p.quartersFraction;   // quarters depth along the length
  const quartersArea = widthFt * qDepth;          // = area × fraction
  const exteriorWallFt = widthFt + 2 * qDepth;    // quarters share of the shell perimeter
  const demisingFt = widthFt;                     // quarters ↔ shop wall
  const spineFt = qDepth;                         // one room-splitting partition
  const wallFt = exteriorWallFt + demisingFt + spineFt;
  return { widthFt, lengthFt, eaveFt, area, qDepth, quartersArea, exteriorWallFt, demisingFt, spineFt, wallFt };
}

/**
 * The whole barndominium as typed, SKU-bound elements.
 *
 * HAND-CHECK — 40x60 shell, 0.25 fraction, 1 porch bay, 2 windows, 1 bath.
 * Geometry: W=40, L=60, qDepth=15, quartersArea=600, exteriorWallFt=70,
 * wallFt = 2×(40+15)+15 = 125.
 *   Shell    MVS-PB-4060    1                       × 38,500  = 38,500.00
 *   Porch    MVS-PB-PORCH12 1                       ×  1,850  =  1,850.00
 *   Studs    MVS-SF-S358    spaced(125,16)=94       ×   4.15  =    390.10
 *   Track    MVS-SF-T358    sticks(250,10)=25       ×   4.85  =    121.25
 *   Drywall  MVS-DW-1248    sheets(2·125·9+600)=90  ×  13.50  =  1,215.00
 *   Insul    MVS-IN-R19     ceil(70·9/100)=7        ×  68     =    476.00
 *   Windows  MVS-SC-WIN34   2                       ×  95     =    190.00
 *   Elec     MVS-CI-ELEC    1                       ×  1,850  =  1,850.00
 *   Bath     MVS-CI-FLR8    1                       ×    310  =    310.00
 *   TOTAL EXPECTED ................................ $44,902.35
 * Verified against rollup(barndoTakeoff(...)) in a node harness — exact.
 */
export function barndoTakeoff(p: BarndoParams): Element[] {
  const g = barndoGeometry(p);
  const out: Element[] = [];

  // ---- shell — one fabricated kit, engineering and drawings included ----
  out.push(el("IfcElementAssembly",
    `Steel shell — ${g.widthFt} × ${g.lengthFt} × ${g.eaveFt} ft bolt-up kit`,
    p.size === "30x40" ? "MVS-PB-3040" : "MVS-PB-4060", 1));

  // ---- porch — 12-ft bays off the eave side, ordered with the shell ------
  if (p.porchBays > 0)
    out.push(el("IfcRoof", `Porch roof kit — ${p.porchBays} × 12-ft bay`, "MVS-PB-PORCH12", p.porchBays));

  // ---- living-quarters interior walls -----------------------------------
  // Steel studs 16" o.c. along the full quarters wall footage (rule above).
  out.push(el("IfcColumn", 'Steel stud — 3-5/8", 16" o.c., quarters walls', "MVS-SF-S358", spaced(g.wallFt, 16)));
  // Track top + bottom: footage equals twice the wall length, in 10-ft sticks.
  out.push(el("IfcMember", 'Steel track — 3-5/8", top + bottom runs', "MVS-SF-T358", sticks(2 * g.wallFt, 10)));
  // Drywall both faces of every interior wall (2 × wallFt × 9-ft height)
  // plus the quarters ceiling; 4×8 sheets = 32 sf via bim.ts sheets().
  out.push(el("IfcCovering", "Drywall — walls both faces + quarters ceiling", "MVS-DW-1248",
    sheets(2 * g.wallFt * QUARTERS_WALL_H + g.quartersArea)));
  // R-19 batts in the quarters' exterior walls only (conditioned envelope);
  // sold per 100 sf.
  out.push(el("IfcCovering", "R-19 batt — quarters exterior walls", "MVS-IN-R19",
    Math.ceil((g.exteriorWallFt * QUARTERS_WALL_H) / 100)));

  // ---- quarters openings -------------------------------------------------
  out.push(el("IfcWindow", "Quarters window — 3×4 planning unit", "MVS-SC-WIN34", p.quartersWindows));

  // ---- allowance lines ---------------------------------------------------
  // Panel + rough-in as one allowance line; the licensed sub prices the rest.
  out.push(el("IfcDistributionElement", "Electrical rough-in allowance", "MVS-CI-ELEC", 1));
  // No plumbing SKUs exist in the catalog — one allowance line per bath,
  // bound to the floor/wet-area prep kit (never an invented SKU).
  for (let b = 0; b < p.bathrooms; b++)
    out.push(el("IfcSlab", "Bath floor + wet-area prep (allowance)", "MVS-CI-FLR8", 1));

  return out;
}
