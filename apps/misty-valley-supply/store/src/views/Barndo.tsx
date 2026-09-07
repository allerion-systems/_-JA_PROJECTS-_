import * as React from "react";
import { rollup } from "@/bim";
import { barndoTakeoff, type BarndoParams } from "@/bimBarndo";
import { pickOne } from "@/designStore";
import { BomTable, QuoteGate, SaveShare, Seg, SpecButton, ToolShell } from "@/views/Shed";
import { Btn, Lab, cx } from "@/ui";

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

export default function Barndo({ initial }: { initial?: Partial<BarndoParams> }) {
  const [step, setStep] = React.useState(0);
  // initial comes off the wire (saved design / share link) — re-validated
  const [size, setSize] = React.useState<BarndoParams["size"]>(pickOne(initial?.size, ["30x40", "40x60"] as const, "40x60"));
  const [quartersFraction, setQuartersFraction] = React.useState<BarndoParams["quartersFraction"]>(pickOne(initial?.quartersFraction, [0.25, 0.5] as const, 0.25));
  const [porchBays, setPorchBays] = React.useState<BarndoParams["porchBays"]>(pickOne(initial?.porchBays, [0, 1, 2, 3] as const, 1));
  const [quartersWindows, setQuartersWindows] = React.useState<BarndoParams["quartersWindows"]>(pickOne(initial?.quartersWindows, [2, 3, 4, 5, 6] as const, 4));
  const [bathrooms, setBathrooms] = React.useState<BarndoParams["bathrooms"]>(pickOne(initial?.bathrooms, [1, 2] as const, 1));
  // cosmetic only — never enters BarndoParams or the takeoff
  const [wallColor, setWallColor] = React.useState<string>(WALL_COLORS[1][1]);
  const [roofColor, setRoofColor] = React.useState<string>(ROOF_COLORS[0][1]);

  const params: BarndoParams = { size, quartersFraction, porchBays, quartersWindows, bathrooms };
  const elements = React.useMemo(() => barndoTakeoff(params),
    [size, quartersFraction, porchBays, quartersWindows, bathrooms]);
  const { total } = rollup(elements);

  const fracLabel = quartersFraction === 0.25 ? "1/4" : "1/2";

  // human-readable configuration for the printable spec sheet
  const specRows: [string, string][] = [
    ["Shell", size === "30x40" ? "30 × 40 × 12 ft" : "40 × 60 × 14 ft"],
    ["Living quarters", `${fracLabel} of the shell`],
    ["Porch bays", porchBays === 0 ? "None" : `${porchBays} × 12 ft`],
    ["Quarters windows", String(quartersWindows)],
    ["Bathrooms", String(bathrooms)],
    ["Wall / roof color",
      `${WALL_COLORS.find(([, hx]) => hx === wallColor)?.[0] ?? ""} / ${ROOF_COLORS.find(([, hx]) => hx === roofColor)?.[0] ?? ""}`],
  ];

  return (
    <ToolShell
      price={{
        label: `Barndo — ${size.replace("x", " × ")} steel shell · ${fracLabel} living quarters · ${porchBays} porch bay${porchBays === 1 ? "" : "s"}`,
        total,
      }}
      steps={STEPS} step={step} onStep={setStep}
      scene={
        <React.Suspense fallback={
          <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--ink-3))]">
            Loading 3D preview…
          </div>
        }>
          <BarndoScene {...params} wallColor={wallColor} roofColor={roofColor} />
        </React.Suspense>
      }
      toolbar={
        <>
          <SaveShare chip tool="barndo" params={{ ...params }} label={`Barndo ${size}`} />
          <SpecButton chip toolLabel="Barndominiums" designName={`Barndo ${size.replace("x", " × ")}`}
            paramRows={specRows} lines={elements} total={total} building />
        </>
      }
      details={<BomTable elements={elements} />}
      footer={step < 3
        ? <Btn size="sm" className="w-full" onClick={() => setStep(step + 1)}>{step === 2 ? "Get my quote" : "Next"}</Btn>
        : undefined}
    >
      <div>
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
          <div className="grid gap-4">
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
      </div>
    </ToolShell>
  );
}
