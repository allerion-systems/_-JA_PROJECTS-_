/* ------------------------------------------------------------------------
   bimContainer.ts — the Container Designer's takeoff on the shared 5D core.

   A shipping-container conversion: the customer picks the box AND designs
   the interior footprint. Every component is a typed Element bound to a
   real data.ts SKU via bim.ts el() — an unknown SKU throws there, so the
   model can never price a phantom part.

   HAND-CHECK — 20-ft "office", 1 window, 1 man-door, floor on:
     box MVS-CX-20OT ................ 1 × 2,950 = 2,950
     bays = ceil(20/8) = 3 (office ⇒ all insulated)
     insulation MVS-CI-INSUL8 ....... 3 ×   420 = 1,260
     floor MVS-CI-FLR8 .............. 3 ×   310 =   930
     partition MVS-CI-PART8 ......... 1 ×   185 =   185
     electrical MVS-CI-ELEC (forced)  1 × 1,850 = 1,850
     window MVS-CI-WIN36 ............ 1 ×   385 =   385
     man-door MVS-CI-DOOR36 ......... 1 ×   685 =   685
                                          total = $8,245  ✓ verified
   ---------------------------------------------------------------------- */

import { el, type Element } from "@/bim";

export type ContainerSize = "20" | "40";
export type ContainerLayout = "open" | "split" | "office" | "str";

export type ContainerParams = {
  size: ContainerSize;
  layout: ContainerLayout;
  windows: 0 | 1 | 2 | 3;
  manDoors: 0 | 1 | 2;
  electrical: boolean;
  hvac: boolean;
  floor: boolean;
};

/** Real box dimensions — the scene and the takeoff both read these. */
export const CONTAINER_DIMS = {
  "20": { lengthFt: 20, widthFt: 8, heightFt: 8.5, sku: "MVS-CX-20OT", label: "20 ft One-Trip" },
  "40": { lengthFt: 40, widthFt: 8, heightFt: 9.5, sku: "MVS-CX-40HC", label: "40 ft High-Cube" },
} as const;

/** 8-ft interior bays: 20 ft → 2.5 rounds to 3; 40 ft → 5. */
export const containerBays = (size: ContainerSize) =>
  Math.ceil(CONTAINER_DIMS[size].lengthFt / 8);

/**
 * Effective build state after layout rules apply:
 *  - open  = no partitions, no insulated bays
 *  - split = 1 partition, half the bays insulated
 *  - office= 1 partition, full insulation, electrical forced on
 *  - str   = 2 partitions, full insulation, electrical + hvac forced on
 */
export function containerDerived(p: ContainerParams) {
  const bays = containerBays(p.size);
  const partitions = p.layout === "open" ? 0 : p.layout === "str" ? 2 : 1;
  const insulatedBays =
    p.layout === "open" ? 0 : p.layout === "split" ? Math.ceil(bays / 2) : bays;
  const electrical = p.electrical || p.layout === "office" || p.layout === "str";
  const hvac = p.hvac || p.layout === "str";
  return { bays, partitions, insulatedBays, electrical, hvac };
}

/** The whole conversion as typed, SKU-bound elements. */
export function containerTakeoff(p: ContainerParams): Element[] {
  const dims = CONTAINER_DIMS[p.size];
  const d = containerDerived(p);
  const out: Element[] = [];

  // Base box — CSC-plated one-trip shell.
  out.push(el("IfcBuildingElementProxy", `Shipping container — ${dims.label}`, dims.sku, 1));

  // Interior envelope — priced per insulated 8-ft bay.
  if (d.insulatedBays > 0)
    out.push(el("IfcCovering", `Insulation + wall liner — ${d.insulatedBays} of ${d.bays} bays`, "MVS-CI-INSUL8", d.insulatedBays));
  if (p.floor && d.insulatedBays > 0)
    out.push(el("IfcCovering", `LVP floor over subfloor — ${d.insulatedBays} bays`, "MVS-CI-FLR8", d.insulatedBays));

  // Footprint — one steel-stud partition kit per interior wall.
  if (d.partitions > 0)
    out.push(el("IfcWallStandardCase", `Partition — steel stud, ${p.layout === "str" ? "bed/bath/living" : p.layout === "office" ? "office + storage" : "two rooms"}`, "MVS-CI-PART8", d.partitions));

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

  return out;
}
