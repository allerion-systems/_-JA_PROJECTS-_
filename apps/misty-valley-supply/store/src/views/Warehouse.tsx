import * as React from "react";
import { rollup } from "@/bim";
import { warehouseTakeoff, type WarehouseParams } from "@/bimWarehouse";
import { BomTable, PriceBar, QuoteGate, Seg, Steps } from "@/views/Shed";
import { Btn, Lab, Panel, cx } from "@/ui";

// three.js stays in its own lazy chunk — loaded only when the warehouse renders
const WarehouseScene = React.lazy(() => import("@/views/WarehouseScene"));

/* ------------------------------------------------------------------------
   Warehouse Designer — clear-span PEB distribution shell on the shared 5D
   core (bimWarehouse.ts). Same wizard shape as Shed.tsx: guest-gated
   PriceBar, scene, steps, BoM. Colors are cosmetic — never priced.
   ---------------------------------------------------------------------- */

const STEPS = ["Shell", "Doors", "Options", "Quote"];
const DOCKS = [0, 1, 2, 3, 4, 5, 6] as const;
const DRIVE_INS = [0, 1, 2] as const;

const WALL_COLORS = [
  ["Light stone", "#dfe3e6"],
  ["White", "#f1efe7"],
  ["Tan", "#cdbf9f"],
  ["Slate", "#6d7680"],
  ["Marine", "#2c4368"],
] as const;

const ROOF_COLORS = [
  ["Galvalume", "#b9bec4"],
  ["Charcoal", "#3a3d42"],
  ["White", "#e9e8e2"],
  ["Green", "#2f4a3c"],
  ["Red", "#7a2e28"],
] as const;

function Swatches({ label, options, value, onChange }: {
  label: string;
  options: readonly (readonly [string, string])[];
  value: string;
  onChange: (hex: string) => void;
}) {
  const current = options.find(([, hex]) => hex === value)?.[0] ?? "";
  return (
    <div>
      <Lab className="mb-1.5">{label} — chosen at order</Lab>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map(([name, hex]) => (
          <button key={hex} type="button" title={name} aria-label={`${label}: ${name}`}
            aria-pressed={hex === value}
            onClick={() => onChange(hex)}
            className={cx("h-[34px] w-[34px] rounded-full border-2 transition-shadow",
              hex === value
                ? "border-[hsl(var(--marine))] ring-2 ring-[hsl(var(--safety-hi))]"
                : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}
            style={{ backgroundColor: hex }} />
        ))}
        <span className="ml-1 text-[12px] text-[hsl(var(--ink-2))]">{current}</span>
      </div>
    </div>
  );
}

export default function Warehouse() {
  const [step, setStep] = React.useState(0);
  const [size] = React.useState<WarehouseParams["size"]>("50x100"); // one shell SKU today
  const [dockDoors, setDockDoors] = React.useState<number>(2);
  const [driveInDoors, setDriveInDoors] = React.useState<number>(1);
  const [insulated, setInsulated] = React.useState(true);
  const [officeCorner, setOfficeCorner] = React.useState(false);
  // cosmetic only — never enters WarehouseParams or the takeoff
  const [wallColor, setWallColor] = React.useState<string>(WALL_COLORS[0][1]);
  const [roofColor, setRoofColor] = React.useState<string>(ROOF_COLORS[0][1]);

  const params: WarehouseParams = { size, dockDoors, driveInDoors, insulated, officeCorner };
  const elements = React.useMemo(() => warehouseTakeoff(params),
    [size, dockDoors, driveInDoors, insulated, officeCorner]);
  const { total } = rollup(elements);

  return (
    <div>
      <PriceBar
        label={`Warehouse — 50 × 100 × 16 shell · ${dockDoors} dock${dockDoors === 1 ? "" : "s"} · ${driveInDoors} drive-in${driveInDoors === 1 ? "" : "s"}${officeCorner ? " · office" : ""}`}
        total={total}
      />

      <Panel pad={false} className="card-hi mb-4">
        <div className="h-[260px] sm:h-[480px]">
          <React.Suspense fallback={
            <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--ink-3))]">
              Loading 3D preview…
            </div>
          }>
            <WarehouseScene {...params} wallColor={wallColor} roofColor={roofColor} />
          </React.Suspense>
        </div>
      </Panel>

      <Steps steps={STEPS} step={step} onStep={setStep} />

      <Panel className="mb-4">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Shell" options={["50x100"] as const} value={size} onChange={() => {}}
              fmt={() => "50 × 100 × 16 ft eave"} />
            <div />
            <Swatches label="Wall color" options={WALL_COLORS} value={wallColor} onChange={setWallColor} />
            <Swatches label="Roof color" options={ROOF_COLORS} value={roofColor} onChange={setRoofColor} />
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Dock door packages — eave wall" options={DOCKS} value={dockDoors} onChange={setDockDoors} />
            <Seg label="Drive-in roll-ups 12×14 — end wall" options={DRIVE_INS} value={driveInDoors} onChange={setDriveInDoors} />
          </div>
        )}
        {step === 2 && (
          <div>
            <Lab className="mb-1.5">Options — priced into the kit</Lab>
            <div className="flex flex-wrap gap-1.5">
              {([
                ["Shell insulation — roof + walls", insulated, setInsulated],
                ["20 × 20 office corner", officeCorner, setOfficeCorner],
              ] as const).map(([lab, on, set]) => (
                <button key={lab} onClick={() => set(!on)}
                  className={cx("min-h-[42px] rounded-[6px] border px-3 text-[14px] font-semibold transition-colors",
                    on ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                       : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
                  {on ? "✓ " : "+ "}{lab}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="mb-3 text-[13px] font-semibold text-[hsl(var(--marine))]">
              Commercial shells go through Kentucky Building Code plan review — stamped drawings ship with the kit.
            </p>
            <QuoteGate tool="warehouse" params={{ ...params }} total={total} />
          </div>
        )}
        {step < 3 && (
          <div className="mt-4 flex justify-end">
            <Btn size="sm" onClick={() => setStep(step + 1)}>{step === 2 ? "Get my quote" : "Next"}</Btn>
          </div>
        )}
      </Panel>

      <BomTable elements={elements} />
    </div>
  );
}
