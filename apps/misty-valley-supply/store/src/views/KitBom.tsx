import * as React from "react";
import { shedTakeoff, type Element } from "@/bim";
import { barndoTakeoff, type BarndoParams } from "@/bimBarndo";
import { containerTakeoff, type ContainerParams } from "@/bimContainer";
import { dockTakeoff, type DockParams } from "@/bimDock";
import { warehouseTakeoff } from "@/bimWarehouse";
import { BomTable } from "@/views/Shed";

/* ------------------------------------------------------------------------
   KitBom — "What's in the kit" on kit-type product pages.

   Every line comes from the same takeoff engines that price the Design
   Center tools (bim*.ts) run against a sensible default configuration —
   nothing here is hand-typed. This file is the lazy boundary: Product.tsx
   loads it with React.lazy, so the engines and BomTable stay out of the
   main chunk.
   ---------------------------------------------------------------------- */

const DESIGNER_LINE = "Default configuration — open the designer to customize and reprice.";
const DOCK_LINE = "A typical starter dock using this section.";

/** Barndo Builder defaults (matches Barndo.tsx initial state) per shell size. */
const barndoDefault = (size: BarndoParams["size"]): Element[] =>
  barndoTakeoff({ size, quartersFraction: 0.25, porchBays: 1, quartersWindows: 4, bathrooms: 1 });

/** Container conversion — the box as-is: open layout, one box, no extras. */
const containerAsIs = (size: ContainerParams["size"]): Element[] =>
  containerTakeoff({
    size, count: 1, layout: "open", windows: 0, manDoors: 0,
    electrical: false, hvac: false, floor: false, leanTo: false,
  });

/** Starter dock — straight 30 ft + 8×10 platform + gangway + wood + ladder. */
const dockStarter = (): Element[] => {
  const p: DockParams = {
    shape: "straight", walkwayFt: 30, platform: "8x10",
    gangway: true, decking: "wood", ladder: true,
  };
  return dockTakeoff(p);
};

/** Backyard Studios default — 10×12, 8-ft walls, 4:12, vinyl, metal, stick. */
const shedDefault = (): Element[] =>
  shedTakeoff({
    widthFt: 10, lengthFt: 12, wallHFt: 8, pitch: 4, doors: 1, windows: 1,
    siding: "vinyl", roof: "metal", framing: "stick",
    ramp: false, loft: false, cupola: false,
  });

/** SKU → default takeoff + header line. Unmapped SKUs get nothing. */
function takeoffFor(sku: string): { elements: Element[]; line: string } | null {
  switch (sku) {
    case "MVS-PB-4060":
      return { elements: barndoDefault("40x60"), line: DESIGNER_LINE };
    case "MVS-PB-3040":
      return { elements: barndoDefault("30x40"), line: DESIGNER_LINE };
    case "MVS-PB-50100":
      return {
        elements: warehouseTakeoff({
          size: "50x100", dockDoors: 2, driveInDoors: 1, insulated: true, officeCorner: true,
        }),
        line: DESIGNER_LINE,
      };
    case "MVS-CX-20OT":
      return { elements: containerAsIs("20"), line: DESIGNER_LINE };
    case "MVS-CX-40HC":
      return { elements: containerAsIs("40"), line: DESIGNER_LINE };
    case "MVS-STR-CONT40":
      return {
        elements: containerTakeoff({
          size: "40", count: 1, layout: "str", windows: 3, manDoors: 2,
          electrical: true, hvac: true, floor: true, leanTo: true,
        }),
        line: DESIGNER_LINE,
      };
    case "MVS-STR-CAB1236":
    case "MVS-PB-SHED1220":
    case "MVS-PB-RUN1224":
      return { elements: shedDefault(), line: DESIGNER_LINE };
    case "MVS-DK-SEC410":
    case "MVS-DK-SEC810":
      return { elements: dockStarter(), line: DOCK_LINE };
    default:
      return null;
  }
}

export default function KitBom({ sku }: { sku: string }) {
  const kit = React.useMemo(() => takeoffFor(sku), [sku]);
  if (!kit) return null;
  return (
    <div className="mt-5">
      <h2 className="text-[15px] font-semibold text-[hsl(var(--ink))]">
        What&rsquo;s in the kit
      </h2>
      <p className="mb-2 mt-0.5 text-[12px] leading-[1.5] text-[hsl(var(--ink-3))]">
        {kit.line}
      </p>
      <BomTable elements={kit.elements} />
    </div>
  );
}
