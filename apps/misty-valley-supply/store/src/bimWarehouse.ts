/* ------------------------------------------------------------------------
   bimWarehouse.ts — pre-engineered warehouse shell takeoff on the shared
   5D core (bim.ts).

   The product is a clear-span PEB distribution shell: one shell SKU today
   (50×100×16 eave), dock and drive-in door packages ordered with it,
   blanket insulation by the thousand square feet, and an optional 20×20
   office corner built out in steel stud + drywall. A commercial shell
   goes through Kentucky Building Code plan review — stamped drawings ship
   with the kit; this takeoff never pretends otherwise.
   ---------------------------------------------------------------------- */

import { el, sheets, spaced, sticks, type Element } from "@/bim";

// One shell SKU for now; the union keeps the type extensible when the
// 60×120 and 80×150 shells land in the catalog.
export type WarehouseSize = "50x100";

export type WarehouseParams = {
  size: WarehouseSize;
  dockDoors: number;     // 0–6, 9×10 sectional + leveler + seal packages
  driveInDoors: number;  // 0–2, 12×14 roll-ups on the end wall
  insulated: boolean;    // roof + wall blanket, per 1,000 sf of envelope
  officeCorner: boolean; // 20×20 office buildout in one corner
};

// Per-size shell geometry, keyed so a new size is one table row + one SKU.
export const WAREHOUSE_SHELLS: Record<WarehouseSize, {
  sku: string; widthFt: number; lengthFt: number; eaveFt: number;
}> = {
  "50x100": { sku: "MVS-PB-50100", widthFt: 50, lengthFt: 100, eaveFt: 16 },
};

export const OFFICE = { sideFt: 20, wallHFt: 9, newWallFt: 40 }; // corner: 2 new walls

/** Shell envelope for blanket insulation.
    Roof: the low-pitch gable's sheeted area is footprint × slope factor —
      at ~1:12 the factor is √(1+(1/12)²) ≈ 1.0035; we carry ~1.02 to
      cover the ridge/eave laps the insulation rolls actually consume:
      50 × 100 × 1.02 = 5,100 sf.
    Walls: perimeter × eave height = 2·(50+100) × 16 = 300 × 16 = 4,800 sf.
      Door openings are NOT deducted — blanket runs are cut around them
      and the cutout is waste, which is how erectors buy.
    Envelope = 5,100 + 4,800 = 9,900 sf → ⌈9,900/1,000⌉ = 10 units. */
export function warehouseGeometry(p: WarehouseParams) {
  const shell = WAREHOUSE_SHELLS[p.size];
  const { widthFt: W, lengthFt: L, eaveFt: H } = shell;
  const roofArea = W * L * 1.02;               // slope factor + lap allowance
  const perimeter = 2 * (W + L);               // 300 ft
  const wallArea = perimeter * H;              // 4,800 sf
  const envelopeSf = roofArea + wallArea;      // 9,900 sf
  return { shell, W, L, H, roofArea, perimeter, wallArea, envelopeSf };
}

/* Hand-check — 2 dock doors + 1 drive-in + insulated + office corner:
     1 × MVS-PB-50100   @ 84,500.00 =  84,500.00   shell
     2 × MVS-PB-DOCK    @  4,850.00 =   9,700.00   dock packages
     1 × MVS-PB-RUD1214 @  2,950.00 =   2,950.00   drive-in
     envelope 5,100 + 4,800 = 9,900 sf → ⌈9,900/1,000⌉ = 10
    10 × MVS-PB-INSWH   @    780.00 =   7,800.00   shell insulation
     office (20×20, 9-ft walls, 40 ft of new wall):
    31 × MVS-SF-S358    @      4.15 =     128.65   studs: ⌊40·12/16⌋+1 = 31
     8 × MVS-SF-T358    @      4.85 =      38.80   track: ⌈80/10⌉ = 8
    35 × MVS-DW-1248    @     13.50 =     472.50   drywall: ⌈(2·40·9+400)/32⌉ = ⌈1120/32⌉ = 35
     4 × MVS-IN-R19     @     68.00 =     272.00   batts: ⌈40·9/100⌉ = 4
     1 × MVS-CI-ELEC    @  1,850.00 =   1,850.00   electrical allowance
     2 × MVS-SC-WIN34   @     95.00 =     190.00   office windows
     1 × MVS-CI-DOOR36  @    685.00 =     685.00   office entry door
   Expected total: $108,586.95.
   Verified by node harness (scripts run against this file's compiled
   output): rollup(warehouseTakeoff({size:"50x100", dockDoors:2,
   driveInDoors:1, insulated:true, officeCorner:true})).total === 108586.95
   — actual 108586.95, matches line by line. */
export function warehouseTakeoff(p: WarehouseParams): Element[] {
  const g = warehouseGeometry(p);
  const out: Element[] = [];

  // ---- the shell ---------------------------------------------------------
  // One pre-engineered kit: primary frames, girts, purlins, sheeting,
  // anchor-bolt plan and stamped drawings — priced as a unit.
  out.push(el("IfcBuildingElementProxy",
    `PEB shell — ${g.W}×${g.L}×${g.H} ft eave, clear span`, g.shell.sku, 1));

  // ---- doors -------------------------------------------------------------
  // Dock packages: one complete truck position each — 9×10 sectional door,
  // edge-of-dock leveler, bumpers, seal. Along one eave wall.
  if (p.dockDoors > 0)
    out.push(el("IfcDoor", "Dock door package — 9×10 + leveler + seal", "MVS-PB-DOCK", p.dockDoors));
  // Drive-ins: 12×14 roll-ups engineered into the end-wall frame lines.
  if (p.driveInDoors > 0)
    out.push(el("IfcDoor", "Drive-in roll-up — 12×14, end wall", "MVS-PB-RUD1214", p.driveInDoors));

  // ---- shell insulation --------------------------------------------------
  // Blanket sold per 1,000 sf of envelope — math documented above
  // warehouseGeometry: roof 50×100×1.02 + walls 300×16 = 9,900 sf → 10.
  if (p.insulated)
    out.push(el("IfcCovering", "Metal building insulation — roof + walls",
      "MVS-PB-INSWH", Math.ceil(g.envelopeSf / 1000)));

  // ---- 20×20 office corner ----------------------------------------------
  if (p.officeCorner) {
    const wallFt = OFFICE.newWallFt;  // 2 new 20-ft walls; shell walls close the corner
    const wallH = OFFICE.wallHFt;     // 9-ft office walls under the 16-ft eave
    // Steel studs 16" o.c. along the new walls — ASTM C645/C754 framing.
    out.push(el("IfcColumn", 'Office stud — 3-5/8" steel, 16" o.c.', "MVS-SF-S358", spaced(wallFt, 16)));
    // Track top and bottom = 2 × 40 = 80 lf in 10-ft sticks.
    out.push(el("IfcMember", "Office track — top + bottom runner", "MVS-SF-T358", sticks(2 * wallFt, 10)));
    // Drywall both faces of the new walls (2 × 40 × 9 = 720 sf) plus a
    // 20×20 = 400 sf lay-in-height ceiling; 4×8 sheets, cutouts are waste.
    out.push(el("IfcCovering", "Office drywall — walls both faces + ceiling",
      "MVS-DW-1248", sheets(2 * wallFt * wallH + OFFICE.sideFt * OFFICE.sideFt)));
    // R-19 batts in the new stud walls: 40 × 9 = 360 sf per 100-sf unit.
    out.push(el("IfcCovering", "Office wall insulation — R-19 batt",
      "MVS-IN-R19", Math.ceil((wallFt * wallH) / 100)));
    // Electrical allowance: panel + circuits for lights and receptacles.
    out.push(el("IfcDistributionElement", "Office electrical allowance — panel + circuits", "MVS-CI-ELEC", 1));
    // Two 3×4 view windows into the floor.
    out.push(el("IfcWindow", "Office window — 3×4 into warehouse", "MVS-SC-WIN34", 2));
    // Entry: 36-in steel man-door kit.
    out.push(el("IfcDoor", "Office entry door", "MVS-CI-DOOR36", 1));
  }

  return out;
}
