import * as React from "react";
import { rollup } from "@/bim";
import { barndoTakeoff, type BarndoParams } from "@/bimBarndo";
import { BomTable, PriceBar, QuoteGate, Seg, Steps } from "@/views/Shed";
import { Btn, Lab, Panel, cx } from "@/ui";

// three.js stays in its own lazy chunk — loaded only when the barndo renders
const BarndoScene = React.lazy(() => import("@/views/BarndoScene"));

/* ------------------------------------------------------------------------
   Barndominium Builder — one steel shell, part shop, part living quarters,
   on the shared 5D core (bimBarndo.ts). The 3D scene, the bill of material
   and the price all read one element list, so they can never disagree.
   ---------------------------------------------------------------------- */

const STEPS = ["Size", "Quarters", "Options", "Quote"];

// ---- cosmetic color choices — chosen at order, never priced --------------

const WALL_COLORS = [
  ["White", "#f4f1e8"],
  ["Tan", "#d8c9a3"],
  ["Clay", "#b98d68"],
  ["Gray", "#9aa0a6"],
  ["Barn red", "#7d2a26"],
  ["Forest", "#2e4a3a"],
] as const;

const ROOF_COLORS = [
  ["Charcoal", "#3a3d42"],
  ["Galvalume", "#b9bec4"],
  ["Green", "#2f4a3c"],
  ["Red", "#7a2e28"],
  ["Brown", "#4e3a2a"],
  ["Black", "#1e1f22"],
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

export default function Barndo() {
  const [step, setStep] = React.useState(0);
  const [size, setSize] = React.useState<BarndoParams["size"]>("40x60");
  const [quartersFraction, setQuartersFraction] = React.useState<BarndoParams["quartersFraction"]>(0.25);
  const [porchBays, setPorchBays] = React.useState<BarndoParams["porchBays"]>(1);
  const [quartersWindows, setQuartersWindows] = React.useState<BarndoParams["quartersWindows"]>(4);
  const [bathrooms, setBathrooms] = React.useState<BarndoParams["bathrooms"]>(1);
  // cosmetic only — never enters BarndoParams or the takeoff
  const [wallColor, setWallColor] = React.useState<string>(WALL_COLORS[1][1]);
  const [roofColor, setRoofColor] = React.useState<string>(ROOF_COLORS[0][1]);

  const params: BarndoParams = { size, quartersFraction, porchBays, quartersWindows, bathrooms };
  const elements = React.useMemo(() => barndoTakeoff(params),
    [size, quartersFraction, porchBays, quartersWindows, bathrooms]);
  const { total } = rollup(elements);

  const fracLabel = quartersFraction === 0.25 ? "1/4" : "1/2";
  return (
    <div>
      <PriceBar
        label={`Barndo — ${size.replace("x", " × ")} steel shell · ${fracLabel} living quarters · ${porchBays} porch bay${porchBays === 1 ? "" : "s"}`}
        total={total}
      />

      <Panel pad={false} className="card-hi mb-4">
        <div className="h-[380px] sm:h-[480px]">
          <React.Suspense fallback={
            <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--ink-3))]">
              Loading 3D preview…
            </div>
          }>
            <BarndoScene {...params} wallColor={wallColor} roofColor={roofColor} />
          </React.Suspense>
        </div>
      </Panel>

      <Steps steps={STEPS} step={step} onStep={setStep} />

      <Panel className="mb-4">
        {step === 0 && (
          <Seg label="Shell size" options={["30x40", "40x60"] as const} value={size} onChange={setSize}
            fmt={v => (v === "30x40" ? "30 × 40 × 12" : "40 × 60 × 14")} />
        )}
        {step === 1 && (
          <div>
            <Seg label="Living quarters" options={[0.25, 0.5] as const} value={quartersFraction}
              onChange={setQuartersFraction} fmt={v => (v === 0.25 ? "1/4 of the shell" : "1/2 of the shell")} />
            <p className="mt-2 text-[12px] text-[hsl(var(--ink-3))]">The rest stays shop.</p>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Porch bays — 12 ft each" options={[0, 1, 2, 3] as const} value={porchBays} onChange={setPorchBays} />
            <Seg label="Quarters windows" options={[2, 3, 4, 5, 6] as const} value={quartersWindows} onChange={setQuartersWindows} />
            <Seg label="Bathrooms" options={[1, 2] as const} value={bathrooms} onChange={setBathrooms} />
            <Swatches label="Wall color" options={WALL_COLORS} value={wallColor} onChange={setWallColor} />
            <Swatches label="Roof color" options={ROOF_COLORS} value={roofColor} onChange={setRoofColor} />
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="mb-3 text-[13px] font-semibold">
              A barndominium is a permitted dwelling — the shell ships with stamped drawings for your county.
            </p>
            <QuoteGate tool="barndo" params={{ ...params }} total={total} />
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
