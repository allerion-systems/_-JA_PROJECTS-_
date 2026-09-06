/* ------------------------------------------------------------------------
   bimContainer.ts — the Container Designer's takeoff on the shared 5D core.

   A shipping-container conversion: the customer picks the box (1-3 mated
   side-by-side) AND designs the interior footprint. Every component is a
   typed Element bound to a real data.ts SKU via bim.ts el() — an unknown
   SKU throws there, so the model can never price a phantom part.

   HAND-CHECK 1 — 20-ft "office", count 1, 1 window, 1 man-door, floor on:
     box MVS-CX-20OT ................ 1 × 2,950 = 2,950
     bays = ceil(20/8) = 3 (office ⇒ all insulated)
     insulation MVS-CI-INSUL8 ....... 3 ×   420 = 1,260
     floor MVS-CI-FLR8 .............. 3 ×   310 =   930
     partition MVS-CI-PART8 ......... 1 ×   185 =   185
     electrical MVS-CI-ELEC (forced)  1 × 1,850 = 1,850
     window MVS-CI-WIN36 ............ 1 ×   385 =   385
     man-door MVS-CI-DOOR36 ......... 1 ×   685 =   685
                                          total = $8,245  ✓ verified

   HAND-CHECK 2 — same options, count 2 (one mating seam):
     box ............................ 2 × 2,950 = 5,900
     insulation ..................... 6 ×   420 = 2,520   (3 bays × 2 boxes)
     floor .......................... 6 ×   310 = 1,860
     partition ...................... 2 ×   185 =   370   (wall runs both boxes)
     pass-through MVS-CI-DOOR36 ..... 1 ×   685 =   685   (per mated seam)
     electrical ..................... 1 × 1,850 = 1,850
     window ......................... 1 ×   385 =   385
     man-door ....................... 1 ×   685 =   685
                                          total = $14,255 ✓ verified
   ---------------------------------------------------------------------- */

import { el, type Element } from "@/bim";

export type ContainerSize = "20" | "40";
export type ContainerLayout = "open" | "split" | "office" | "str";

export type ContainerParams = {
  size: ContainerSize;
  count: 1 | 2 | 3;        // side-by-side, long walls mated
  layout: ContainerLayout;
  windows: 0 | 1 | 2 | 3;
  manDoors: 0 | 1 | 2;
  electrical: boolean;
  hvac: boolean;
  floor: boolean;
  leanTo: boolean;         // 8-ft metal lean-to off one long wall
};

/** Real box dimensions — the scene and the takeoff both read these. */
export const CONTAINER_DIMS = {
  "20": { lengthFt: 20, widthFt: 8, heightFt: 8.5, sku: "MVS-CX-20OT", label: "20 ft One-Trip" },
  "40": { lengthFt: 40, widthFt: 8, heightFt: 9.5, sku: "MVS-CX-40HC", label: "40 ft High-Cube" },
} as const;

/** 8-ft interior bays per box: 20 ft → 2.5 rounds to 3; 40 ft → 5. */
export const containerBays = (size: ContainerSize) =>
  Math.ceil(CONTAINER_DIMS[size].lengthFt / 8);

/**
 * Effective build state after layout rules apply (per box; the takeoff
 * multiplies by count where the wall spans the combined footprint):
 *  - open  = no partitions, no insulated bays
 *  - split = 1 partition, half the bays insulated
 *  - office= 1 partition, full insulation, electrical forced on
 *  - str   = 2 partitions, full insulation, electrical + hvac forced on
 */
export function containerDerived(p: ContainerParams) {
  const bays = containerBays(p.size);
  const partitions = p.layout === "open" ? 0 : p.layout === "str" ? 2 : 1;
  const insulatedBays =
    p.layout === "open" ? 0 : p.layout === "split" ? Math.max(1, Math.floor(bays / 2)) : bays;
  const electrical = p.electrical || p.layout === "office" || p.layout === "str";
  const hvac = p.hvac || p.layout === "str";
  const seams = p.count - 1;
  return { bays, partitions, insulatedBays, electrical, hvac, seams };
}

/** The whole conversion as typed, SKU-bound elements. */
export function containerTakeoff(p: ContainerParams): Element[] {
  const dims = CONTAINER_DIMS[p.size];
  const d = containerDerived(p);
  const out: Element[] = [];

  // Base boxes — CSC-plated one-trip shells, long walls mated side-by-side.
  out.push(el("IfcBuildingElementProxy",
    `Shipping container — ${dims.label}${p.count > 1 ? `, ${p.count} side-by-side` : ""}`,
    dims.sku, p.count));

  // Interior envelope — priced per insulated 8-ft bay, across all boxes.
  if (d.insulatedBays > 0)
    out.push(el("IfcCovering", `Insulation + wall liner — ${d.insulatedBays * p.count} of ${d.bays * p.count} bays`, "MVS-CI-INSUL8", d.insulatedBays * p.count));
  if (p.floor && d.insulatedBays > 0)
    out.push(el("IfcCovering", `LVP floor over subfloor — ${d.insulatedBays * p.count} bays`, "MVS-CI-FLR8", d.insulatedBays * p.count));

  // Footprint — one steel-stud kit per 8-ft wall; a partition across a
  // mated footprint runs through every box.
  if (d.partitions > 0)
    out.push(el("IfcWallStandardCase", `Partition — steel stud, ${p.layout === "str" ? "bed/bath/living" : p.layout === "office" ? "office + storage" : "two rooms"}`, "MVS-CI-PART8", d.partitions * p.count));

  // Each mating seam gets its shared-wall opening framed as a door kit —
  // the honest SKU for a cut, framed pass-through.
  if (d.seams > 0)
    out.push(el("IfcOpeningElement", "Pass-through opening — mated wall", "MVS-CI-DOOR36", d.seams));

  // Openings — welded-frame kits, one line each with real qty.
  if (p.windows > 0)
    out.push(el("IfcWindow", "Window kit — 36 × 36, welded frame", "MVS-CI-WIN36", p.windows));
  if (p.manDoors > 0)
    out.push(el("IfcDoor", "Man-door kit — 36 in steel", "MVS-CI-DOOR36", p.manDoors));

  // Systems — forced on by office (elec) and STR (elec + hvac) layouts.
  if (d.electrical)
    out.push(el("IfcElectricDistributionBoard", "Electrical package — panel + 4 circuits", "MVS-CI-ELEC", 1));
  if (d.hvac)
    out.push(el("IfcUnitaryEquipment", "Mini-split — 12k BTU heat/cool", "MVS-CI-HVAC12", 1));

  // Lean-to — 8-ft metal shed roof off one long wall, 1-ft overhang.
  if (p.leanTo) {
    out.push(el("IfcRoof", "Lean-to roof — 29-ga metal, 8 ft deep", "MVS-RF-MTL29", Math.ceil((9 * dims.lengthFt) / 100)));
    out.push(el("IfcColumn", "Lean-to post — PT 4×4, ≤ 8 ft o.c.", "MVS-PT-448", Math.ceil(dims.lengthFt / 8) + 1));
    out.push(el("IfcBeam", "Lean-to beam + purlins — PT 2×8", "MVS-PT-2812", Math.ceil(dims.lengthFt / 12) * 3));
    out.push(el("IfcFastener", "Exterior screws — lean-to", "MVS-FS-EX9", 1));
  }

  return out;
}
