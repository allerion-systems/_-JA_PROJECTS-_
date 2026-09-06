import * as React from "react";
import { rollup } from "@/bim";
import {
  containerDerived, containerTakeoff,
  type ContainerLayout, type ContainerParams, type ContainerSize,
} from "@/bimContainer";
import { Btn, Lab, Panel, cx } from "@/ui";
import { BomTable, PriceBar, QuoteGate, Seg, Steps } from "@/views/Shed";

// three.js stays in its own lazy chunk — loaded only when the container renders
const ContainerScene = React.lazy(() => import("@/views/ContainerScene"));

/* ------------------------------------------------------------------------
   Container Designer — pick the box AND design the interior footprint,
   on the shared 5D core (bimContainer.ts). Same wizard chassis as the
   Shed Designer: PriceBar gates guests, one element list drives the
   scene, the BoM and the price.
   ---------------------------------------------------------------------- */

const STEPS = ["Size", "Layout", "Options", "Quote"];

// cosmetic only — chosen at order, never priced
const BOX_COLORS = [
  ["Tan", "#b3a284"],
  ["Blue", "#3f5a78"],
  ["Green", "#4a5f4e"],
] as const;

// ---- plan-view thumbnails: top-down footprint per layout -----------------

function PlanSvg({ layout }: { layout: ContainerLayout }) {
  const s = "hsl(var(--ink-2))";
  return (
    <svg viewBox="0 0 64 30" className="h-[30px] w-[64px]" aria-hidden>
      <rect x="1.5" y="1.5" width="61" height="27" rx="2" fill="none" stroke={s} strokeWidth="2" />
      {/* cargo doors at the right end */}
      <line x1="62.5" y1="4" x2="58" y2="10" stroke={s} strokeWidth="1.2" />
      <line x1="62.5" y1="26" x2="58" y2="20" stroke={s} strokeWidth="1.2" />
      {layout === "split" && <line x1="26" y1="1.5" x2="26" y2="28.5" stroke={s} strokeWidth="2" />}
      {layout === "office" && (
        <>
          <line x1="27" y1="1.5" x2="27" y2="28.5" stroke={s} strokeWidth="2" />
          <rect x="6" y="5" width="12" height="6" fill={s} opacity="0.55" />
          <rect x="6" y="19" width="6" height="6" fill="none" stroke={s} strokeWidth="1.3" />
        </>
      )}
      {layout === "str" && (
        <>
          <line x1="24" y1="1.5" x2="24" y2="28.5" stroke={s} strokeWidth="2" />
          <line x1="35" y1="1.5" x2="35" y2="28.5" stroke={s} strokeWidth="2" />
          <rect x="5" y="6" width="14" height="18" fill={s} opacity="0.55" />
          <circle cx="29.5" cy="9" r="3.2" fill="none" stroke={s} strokeWidth="1.3" />
          <rect x="26.5" y="18" width="6" height="7" fill="none" stroke={s} strokeWidth="1.3" />
          <rect x="40" y="18" width="13" height="7" fill="none" stroke={s} strokeWidth="1.3" />
        </>
      )}
    </svg>
  );
}

const LAYOUTS: readonly [ContainerLayout, string, string][] = [
  ["open", "Open storage", "Bare box, ready to load"],
  ["split", "Split", "One wall — finished room + storage"],
  ["office", "Office", "Insulated office + storage, wired"],
  ["str", "STR unit", "Bed, bath, living — wired + climate"],
];

function LayoutChips({ value, onChange }: { value: ContainerLayout; onChange: (l: ContainerLayout) => void }) {
  return (
    <div>
      <Lab className="mb-1.5">Interior footprint</Lab>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {LAYOUTS.map(([id, name, desc]) => (
          <button key={id} onClick={() => onChange(id)} aria-pressed={id === value}
            className={cx("flex min-h-[54px] items-center gap-3 rounded-[6px] border px-3 py-2 text-left transition-colors",
              id === value
                ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))]/5 ring-1 ring-[hsl(var(--marine))]"
                : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] hover:border-[hsl(var(--ink))]")}>
            <PlanSvg layout={id} />
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold">{name}</span>
              <span className="block truncate text-[12px] text-[hsl(var(--ink-3))]">{desc}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Container() {
  const [step, setStep] = React.useState(0);
  const [size, setSize] = React.useState<ContainerSize>("20");
  const [count, setCount] = React.useState<ContainerParams["count"]>(1);
  const [layout, setLayout] = React.useState<ContainerLayout>("office");
  const [windows, setWindows] = React.useState<ContainerParams["windows"]>(1);
  const [manDoors, setManDoors] = React.useState<ContainerParams["manDoors"]>(1);
  const [electrical, setElectrical] = React.useState(false);
  const [hvac, setHvac] = React.useState(false);
  const [floor, setFloor] = React.useState(true);
  const [leanTo, setLeanTo] = React.useState(false);
  // cosmetic only — never enters ContainerParams' takeoff
  const [containerColor, setContainerColor] = React.useState<string>(BOX_COLORS[0][1]);

  const params: ContainerParams = { size, count, layout, windows, manDoors, electrical, hvac, floor, leanTo };
  const elements = React.useMemo(() => containerTakeoff(params),
    [size, count, layout, windows, manDoors, electrical, hvac, floor, leanTo]);
  const { total } = rollup(elements);
  const d = containerDerived(params);
  const layoutName = LAYOUTS.find(([id]) => id === layout)?.[1] ?? layout;

  const toggles = [
    ["Electrical package", electrical, setElectrical, d.electrical && !electrical],
    ["Mini-split HVAC", hvac, setHvac, d.hvac && !hvac],
    ["LVP floor", floor, setFloor, false],
    ["Lean-to roof — 8 ft", leanTo, setLeanTo, false],
  ] as const;

  return (
    <div>
      <PriceBar label={`Container — ${count > 1 ? `${count} × ` : ""}${size} ft · ${layoutName}`} total={total} />

      <Panel pad={false} className="card-hi mb-4">
        <div className="h-[260px] sm:h-[480px]">
          <React.Suspense fallback={
            <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--ink-3))]">
              Loading 3D preview…
            </div>
          }>
            <ContainerScene {...params} containerColor={containerColor} />
          </React.Suspense>
        </div>
      </Panel>

      <Steps steps={STEPS} step={step} onStep={setStep} />

      <Panel className="mb-4">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Box" options={["20", "40"] as const} value={size} onChange={setSize}
              fmt={v => (v === "20" ? "20 ft One-Trip" : "40 ft High-Cube")} />
            <Seg label="How many — side-by-side" options={[1, 2, 3] as const} value={count} onChange={setCount} />
            <div>
              <Lab className="mb-1.5">Box color — chosen at order</Lab>
              <div className="flex flex-wrap items-center gap-1.5">
                {BOX_COLORS.map(([name, hex]) => (
                  <button key={hex} type="button" title={name} aria-label={`Box color: ${name}`}
                    aria-pressed={hex === containerColor}
                    onClick={() => setContainerColor(hex)}
                    className={cx("h-[34px] w-[34px] rounded-full border-2 transition-shadow",
                      hex === containerColor
                        ? "border-[hsl(var(--marine))] ring-2 ring-[hsl(var(--safety-hi))]"
                        : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}
                    style={{ backgroundColor: hex }} />
                ))}
                <span className="ml-1 text-[12px] text-[hsl(var(--ink-2))]">
                  {BOX_COLORS.find(([, hex]) => hex === containerColor)?.[0]}
                </span>
              </div>
            </div>
          </div>
        )}
        {step === 1 && <LayoutChips value={layout} onChange={setLayout} />}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Windows" options={[0, 1, 2, 3] as const} value={windows} onChange={setWindows} />
            <Seg label="Man-doors" options={[0, 1, 2] as const} value={manDoors} onChange={setManDoors} />
            <div className="sm:col-span-2">
              <Lab className="mb-1.5">Systems + finish</Lab>
              <div className="flex flex-wrap gap-1.5">
                {toggles.map(([lab, on, set, included]) => (
                  <button key={lab} onClick={() => !included && set(!on)} disabled={included}
                    aria-pressed={included || on}
                    className={cx("min-h-[42px] rounded-[6px] border px-3 text-[14px] font-semibold transition-colors",
                      included
                        ? "cursor-default border-[hsl(var(--marine))]/40 bg-[hsl(var(--marine))]/10 text-[hsl(var(--marine))]"
                        : on
                          ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                          : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
                    {included ? "✓ " : on ? "✓ " : "+ "}{lab}
                    {included && <span className="ml-1.5 text-[11px] font-medium opacity-80">included with {layoutName}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 3 && <QuoteGate tool="container" params={{ ...params }} total={total} />}
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
