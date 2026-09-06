import * as React from "react";
import { rollup } from "@/bim";
import { DOCK_WALKWAYS, dockTakeoff, type DockParams } from "@/bimDock";
import { pickBool, pickOne } from "@/designStore";
import { BomTable, PriceBar, QuoteGate, SaveShare, Seg, SpecButton, Steps } from "@/views/Shed";
import { Btn, Lab, Panel, cx } from "@/ui";

// three.js stays in its own lazy chunk — loaded only when the dock renders
const DockScene = React.lazy(() => import("@/views/DockScene"));

/* ------------------------------------------------------------------------
   Lake Dock Designer — floating docks for Nolin River, Rough River and
   Barren, on the shared 5D core (bimDock.ts). Scene, BoM and price all
   read one element list.
   ---------------------------------------------------------------------- */

const STEPS = ["Shape", "Size", "Options", "Quote"];

// ---- shape chips with top-down thumbnails --------------------------------

const SHAPES: { v: DockParams["shape"]; label: string; d: string }[] = [
  // 40×28 viewBox, dock drawn as 4-wide bars; shore implied at left
  { v: "straight", label: "Straight", d: "M2 12 h34 v5 h-34 z" },
  { v: "L", label: "L", d: "M2 12 h34 v-10 h-5 v5 h-29 z" },
  { v: "T", label: "T", d: "M2 12 h29 v-8 h5 v21 h-5 v-8 h-29 z" },
];

function ShapeSeg({ value, onChange }: { value: DockParams["shape"]; onChange: (v: DockParams["shape"]) => void }) {
  return (
    <div>
      <Lab className="mb-1.5">Dock shape</Lab>
      <div className="flex flex-wrap gap-1.5">
        {SHAPES.map(s => (
          <button key={s.v} onClick={() => onChange(s.v)} aria-pressed={s.v === value}
            className={cx("flex min-h-[42px] items-center gap-2 rounded-[6px] border px-3 text-[14px] font-semibold transition-colors",
              s.v === value
                ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
            <svg width="40" height="28" viewBox="0 0 40 28" aria-hidden="true">
              <path d={s.d} fill="currentColor" opacity="0.85" />
            </svg>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dock({ initial }: { initial?: Partial<DockParams> }) {
  const [step, setStep] = React.useState(0);
  // initial comes off the wire (saved design / share link) — re-validated
  const [shape, setShape] = React.useState<DockParams["shape"]>(pickOne(initial?.shape, ["straight", "L", "T"] as const, "straight"));
  const [walkwayFt, setWalkwayFt] = React.useState<number>(pickOne(initial?.walkwayFt, DOCK_WALKWAYS, 30));
  const [platform, setPlatform] = React.useState<DockParams["platform"]>(pickOne(initial?.platform, ["none", "8x10", "double"] as const, "8x10"));
  const [gangway, setGangway] = React.useState(pickBool(initial?.gangway, true));
  const [decking, setDecking] = React.useState<DockParams["decking"]>(pickOne(initial?.decking, ["wood", "composite"] as const, "wood"));
  const [ladder, setLadder] = React.useState(pickBool(initial?.ladder, true));

  const params: DockParams = { shape, walkwayFt, platform, gangway, decking, ladder };
  const elements = React.useMemo(() => dockTakeoff(params),
    [shape, walkwayFt, platform, gangway, decking, ladder]);
  const { total } = rollup(elements);

  const shapeLabel = shape === "straight" ? "Straight" : `${shape}-shape`;
  const platLabel = platform === "none" ? "" : platform === "8x10" ? " · 8×10 platform" : " · double platform";

  // human-readable configuration for the printable spec sheet
  const hardware = [gangway && "20-ft gangway", ladder && "Swim ladder"].filter(Boolean).join(", ") || "None";
  const specRows: [string, string][] = [
    ["Shape", shapeLabel],
    ["Walkway", `${walkwayFt} ft`],
    ["Platform", platform === "none" ? "None" : platform === "8x10" ? "8 × 10" : "Double 8 × 10"],
    ["Decking", decking === "wood" ? "PT wood" : "Composite"],
    ["Hardware", hardware],
  ];

  return (
    <div>
      <PriceBar label={`Lake dock — ${shapeLabel} · ${walkwayFt} ft walkway${platLabel}`} total={total} />

      <Panel pad={false} className="card-hi mb-4">
        <div className="h-[260px] sm:h-[480px]">
          <React.Suspense fallback={
            <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--ink-3))]">
              Loading 3D preview…
            </div>
          }>
            <DockScene {...params} />
          </React.Suspense>
        </div>
      </Panel>

      <Steps steps={STEPS} step={step} onStep={setStep} />

      <Panel className="mb-4">
        {step === 0 && <ShapeSeg value={shape} onChange={setShape} />}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Walkway length" options={DOCK_WALKWAYS} value={walkwayFt as (typeof DOCK_WALKWAYS)[number]}
              onChange={setWalkwayFt} fmt={v => `${v} ft`} />
            <Seg label="Platform" options={["none", "8x10", "double"] as const} value={platform} onChange={setPlatform}
              fmt={v => (v === "none" ? "None" : v === "8x10" ? "8×10" : "Double 8×10")} />
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Decking" options={["wood", "composite"] as const} value={decking} onChange={setDecking}
              fmt={v => (v === "wood" ? "PT wood" : "Composite")} />
            <div>
              <Lab className="mb-1.5">Hardware</Lab>
              <div className="flex flex-wrap gap-1.5">
                {([
                  ["20-ft gangway", gangway, setGangway],
                  ["Swim ladder", ladder, setLadder],
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
          </div>
        )}
        {step === 3 && (
          <div>
            <p className="mb-3 text-[13px] font-semibold text-[hsl(var(--ink-2))]">
              Nolin, Rough River and Barren are Corps of Engineers lakes — your dock needs a shoreline-use permit; we help with the sketch.
            </p>
            <QuoteGate tool="dock" params={{ ...params }} total={total} />
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <SaveShare tool="dock" params={{ ...params }} label={`Dock — ${shapeLabel} ${walkwayFt} ft`} />
            <SpecButton toolLabel="Lake Docks" designName={`Dock — ${shapeLabel} ${walkwayFt} ft`}
              paramRows={specRows} lines={elements} total={total} />
          </div>
          {step < 3 && (
            <Btn size="sm" onClick={() => setStep(step + 1)}>{step === 2 ? "Get my quote" : "Next"}</Btn>
          )}
        </div>
      </Panel>

      <BomTable elements={elements} />
    </div>
  );
}
