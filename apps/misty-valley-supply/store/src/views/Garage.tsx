import * as React from "react";
import { rollup } from "@/bim";
import {
  GARAGE_ANCHORS, GARAGE_COLORS, GARAGE_DOOR_SIZES, GARAGE_DOOR_TYPES, GARAGE_END_STATES,
  GARAGE_LEANTO, GARAGE_LEGS, GARAGE_LENGTHS, GARAGE_ROOFS, GARAGE_SIDE_STATES,
  GARAGE_WALLS, GARAGE_WIDTHS, garageColorName, garageTakeoff, sanitizeGarageDoors,
  type GarageDoor, type GarageParams,
} from "@/bimGarage";
import { pickBool, pickOne } from "@/designStore";
import { BomTable, QuoteGate, SaveShare, Seg, SpecButton, ToolShell } from "@/views/Shed";
import { Btn, Lab, cx } from "@/ui";

// three.js stays in its own lazy chunk — loaded only when the garage renders
const GarageScene = React.lazy(() => import("@/views/GarageScene"));

/* ------------------------------------------------------------------------
   Metal Garages & Carports — the FULL industry selection tree on the
   shared 5D core (bimGarage.ts). Roof style, width/length/leg height,
   frame + panel gauge, per-wall enclosure, doors, windows, anchors,
   lean-tos, colors and certification — the 3D scene, the bill of material
   and the price all read one element list, so they can never disagree.
   ---------------------------------------------------------------------- */

const STEPS = ["Size", "Frame & Roof", "Walls & Ends", "Doors & Windows", "Colors", "Options", "Quote"];

const ROOF_NAMES = { regular: "Regular", boxedEave: "Boxed eave", vertical: "Vertical" } as const;
const SIDE_NAMES = { open: "Open", half: "Partial", full: "Closed" } as const;
const END_NAMES = { open: "Open", gable: "Gable", full: "Closed" } as const;
const WALL_NAMES = { front: "Front", back: "Back", left: "Left", right: "Right" } as const;
const ANCHOR_NAMES = { concrete: "Concrete", ground: "Ground", asphalt: "Asphalt" } as const;
const LEAN_NAMES = { none: "None", left: "Left", right: "Right", both: "Both" } as const;

function Swatches({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div>
      <Lab className="mb-1.5">{label} — chosen at order, never priced</Lab>
      <div className="flex flex-wrap items-center gap-1.5">
        {GARAGE_COLORS.map(([name, hex]) => (
          <button key={hex} type="button" title={name} aria-label={`${label}: ${name}`}
            aria-pressed={hex === value}
            onClick={() => onChange(hex)}
            className={cx("h-[34px] w-[34px] rounded-full border-2 transition-shadow",
              hex === value
                ? "border-[hsl(var(--marine))] ring-2 ring-[hsl(var(--safety-hi))]"
                : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}
            style={{ backgroundColor: hex }} />
        ))}
        <span className="ml-1 text-[12px] text-[hsl(var(--ink-2))]">{garageColorName(value)}</span>
      </div>
    </div>
  );
}

export default function Garage({ initial }: { initial?: Partial<GarageParams> }) {
  const [step, setStep] = React.useState(0);
  // initial comes off the wire (saved design / share link) — every value is
  // re-validated against the tool's own options; anything off falls to default
  const [widthFt, setWidthFt] = React.useState<GarageParams["widthFt"]>(pickOne(initial?.widthFt, GARAGE_WIDTHS, 20));
  const [lengthFt, setLengthFt] = React.useState<GarageParams["lengthFt"]>(pickOne(initial?.lengthFt, GARAGE_LENGTHS, 21));
  const [legHeightFt, setLegHeightFt] = React.useState<GarageParams["legHeightFt"]>(pickOne(initial?.legHeightFt, GARAGE_LEGS, 7));
  const [roofStyle, setRoofStyle] = React.useState<GarageParams["roofStyle"]>(pickOne(initial?.roofStyle, GARAGE_ROOFS, "boxedEave"));
  const [frameGauge, setFrameGauge] = React.useState<GarageParams["frameGauge"]>(pickOne(initial?.frameGauge, [14, 12] as const, 14));
  const [panelGauge, setPanelGauge] = React.useState<GarageParams["panelGauge"]>(pickOne(initial?.panelGauge, [29, 26] as const, 29));
  const [leftSide, setLeftSide] = React.useState<GarageParams["leftSide"]>(pickOne(initial?.leftSide, GARAGE_SIDE_STATES, "open"));
  const [rightSide, setRightSide] = React.useState<GarageParams["rightSide"]>(pickOne(initial?.rightSide, GARAGE_SIDE_STATES, "open"));
  const [frontEnd, setFrontEnd] = React.useState<GarageParams["frontEnd"]>(pickOne(initial?.frontEnd, GARAGE_END_STATES, "open"));
  const [backEnd, setBackEnd] = React.useState<GarageParams["backEnd"]>(pickOne(initial?.backEnd, GARAGE_END_STATES, "open"));
  const [doors, setDoors] = React.useState<GarageDoor[]>(() => sanitizeGarageDoors(initial?.doors));
  const [windows, setWindows] = React.useState<GarageParams["windows"]>(pickOne(initial?.windows, [0, 1, 2, 3, 4] as const, 0));
  const [anchors, setAnchors] = React.useState<GarageParams["anchors"]>(pickOne(initial?.anchors, GARAGE_ANCHORS, "ground"));
  const [leanTo, setLeanTo] = React.useState<GarageParams["leanTo"]>(pickOne(initial?.leanTo, GARAGE_LEANTO, "none"));
  const [certified, setCertified] = React.useState(pickBool(initial?.certified, false));
  // cosmetic — carried in the params (and the share link) but never priced
  const hexes = GARAGE_COLORS.map(([, hx]) => hx);
  const [roofColor, setRoofColor] = React.useState<string>(pickOne(initial?.roofColor, hexes, GARAGE_COLORS[5][1]));
  const [trimColor, setTrimColor] = React.useState<string>(pickOne(initial?.trimColor, hexes, GARAGE_COLORS[1][1]));
  const [sideColor, setSideColor] = React.useState<string>(pickOne(initial?.sideColor, hexes, GARAGE_COLORS[0][1]));

  const params: GarageParams = {
    widthFt, lengthFt, legHeightFt, roofStyle, frameGauge, panelGauge,
    leftSide, rightSide, frontEnd, backEnd, doors, windows, anchors, leanTo, certified,
    roofColor, trimColor, sideColor,
  };
  const doorsKey = doors.map(d => `${d.type}@${d.wall}`).join(",");
  // colors are cosmetic — the takeoff never reads them, so the memo deps
  // stay color-free on purpose (BoM invariance)
  const elements = React.useMemo(() => garageTakeoff(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [widthFt, lengthFt, legHeightFt, roofStyle, frameGauge, panelGauge,
      leftSide, rightSide, frontEnd, backEnd, doorsKey, windows, anchors, leanTo, certified]);
  const { total } = rollup(elements);

  const enclosed = leftSide === "full" && rightSide === "full" && frontEnd === "full" && backEnd === "full";
  const kind = enclosed ? "Garage" : leftSide === "open" && rightSide === "open" && frontEnd === "open" && backEnd === "open" ? "Carport" : "Combo unit";

  const addDoor = () => { if (doors.length < 4) setDoors([...doors, { type: "rollup9", wall: "front" }]); };
  const setDoor = (i: number, patch: Partial<GarageDoor>) =>
    setDoors(doors.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  const dropDoor = (i: number) => setDoors(doors.filter((_, j) => j !== i));

  // human-readable configuration for the printable spec sheet
  const specRows: [string, string][] = [
    ["Footprint", `${widthFt} × ${lengthFt} ft · ${legHeightFt}-ft legs`],
    ["Roof style", `${ROOF_NAMES[roofStyle]}${roofStyle === "vertical" ? " — panels eave-to-ridge" : roofStyle === "boxedEave" ? " — A-frame, horizontal panels" : " — rounded eave"}`],
    ["Frame / panels", `${frameGauge}-ga frame · ${panelGauge}-ga panels`],
    ["Sides (L / R)", `${SIDE_NAMES[leftSide]} / ${SIDE_NAMES[rightSide]}`],
    ["Ends (F / B)", `${END_NAMES[frontEnd]} / ${END_NAMES[backEnd]}`],
    ["Doors", doors.length === 0 ? "None" : doors.map(d => `${GARAGE_DOOR_SIZES[d.type].label} (${WALL_NAMES[d.wall].toLowerCase()})`).join(", ")],
    ["Windows", String(windows)],
    ["Anchors", `${ANCHOR_NAMES[anchors]} — one per leg`],
    ["Lean-to", LEAN_NAMES[leanTo]],
    ["Rating", certified ? "Certified — engineered wind/snow package" : "Standard (non-certified)"],
    ["Colors (roof/trim/side)", `${garageColorName(roofColor)} / ${garageColorName(trimColor)} / ${garageColorName(sideColor)}`],
  ];

  return (
    <ToolShell
      price={{
        label: `${kind} — ${widthFt} × ${lengthFt} × ${legHeightFt} ft · ${ROOF_NAMES[roofStyle].toLowerCase()} roof · ${frameGauge}-ga`,
        total,
      }}
      steps={STEPS} step={step} onStep={setStep}
      scene={
        <React.Suspense fallback={
          <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--ink-3))]">
            Loading 3D preview…
          </div>
        }>
          <GarageScene {...params} />
        </React.Suspense>
      }
      toolbar={
        <>
          <SaveShare chip tool="garage" params={{ ...params }} label={`${kind} ${widthFt}×${lengthFt}`} />
          <SpecButton chip toolLabel="Garages & Carports" designName={`${kind} ${widthFt} × ${lengthFt} × ${legHeightFt}`}
            paramRows={specRows} lines={elements} total={total} building />
        </>
      }
      details={<BomTable elements={elements} />}
      footer={step < 6
        ? <Btn size="sm" className="w-full" onClick={() => setStep(step + 1)}>{step === 5 ? "Get my quote" : "Next"}</Btn>
        : undefined}
    >
      <div>
        {step === 0 && (
          <div className="grid gap-4">
            <Seg label="Width" options={GARAGE_WIDTHS} value={widthFt} onChange={setWidthFt} fmt={v => `${v} ft`} />
            <Seg label="Length" options={GARAGE_LENGTHS} value={lengthFt} onChange={setLengthFt} fmt={v => `${v} ft`} />
            <Seg label="Leg height" options={GARAGE_LEGS} value={legHeightFt} onChange={setLegHeightFt} fmt={v => `${v} ft`} />
            <p className="text-[12px] leading-[1.5] text-[hsl(var(--ink-3))]">
              Legs are side clearance, not peak — pick legs a foot taller than your tallest roll-up.
            </p>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-4">
            <Seg label="Roof style" options={GARAGE_ROOFS} value={roofStyle} onChange={setRoofStyle}
              fmt={v => ROOF_NAMES[v]} />
            <Seg label="Frame gauge" options={[14, 12] as const} value={frameGauge} onChange={setFrameGauge}
              fmt={v => (v === 14 ? "14-ga standard" : "12-ga upgrade")} />
            <Seg label="Panel gauge" options={[29, 26] as const} value={panelGauge} onChange={setPanelGauge}
              fmt={v => (v === 29 ? "29-ga standard" : "26-ga upgrade")} />
            <p className="text-[12px] leading-[1.5] text-[hsl(var(--ink-3))]">
              {roofStyle === "regular" && "Regular — the economy roof; panels run the length of the building."}
              {roofStyle === "boxedEave" && "Boxed eave — the house-style A-frame silhouette, horizontal panels."}
              {roofStyle === "vertical" && "Vertical — panels run eave-to-ridge so snow slides off; recommended past 36 ft."}
            </p>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4">
            <Seg label="Left side" options={GARAGE_SIDE_STATES} value={leftSide} onChange={setLeftSide} fmt={v => SIDE_NAMES[v]} />
            <Seg label="Right side" options={GARAGE_SIDE_STATES} value={rightSide} onChange={setRightSide} fmt={v => SIDE_NAMES[v]} />
            <Seg label="Front end" options={GARAGE_END_STATES} value={frontEnd} onChange={setFrontEnd} fmt={v => END_NAMES[v]} />
            <Seg label="Back end" options={GARAGE_END_STATES} value={backEnd} onChange={setBackEnd} fmt={v => END_NAMES[v]} />
            <p className="text-[12px] leading-[1.5] text-[hsl(var(--ink-3))]">
              Two closed sides + two closed ends = a fully enclosed garage.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-4">
            <div>
              <Lab className="mb-1.5">Doors — frame-outs in a closed wall</Lab>
              <div className="grid gap-2.5">
                {doors.map((d, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className="w-[52px] shrink-0 text-[13px] font-semibold">Door {i + 1}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {GARAGE_DOOR_TYPES.map(t => (
                        <button key={t} type="button" aria-pressed={t === d.type} onClick={() => setDoor(i, { type: t })}
                          className={cx("min-h-[34px] rounded-[6px] border px-2.5 text-[12px] font-semibold transition-colors",
                            t === d.type
                              ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                              : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
                          {GARAGE_DOOR_SIZES[t].label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      {GARAGE_WALLS.map(w => (
                        <button key={w} type="button" aria-pressed={w === d.wall} onClick={() => setDoor(i, { wall: w })}
                          className={cx("min-h-[34px] rounded-[6px] border px-2.5 text-[12px] font-semibold transition-colors",
                            w === d.wall
                              ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                              : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
                          {WALL_NAMES[w]}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => dropDoor(i)}
                      className="text-[12px] font-semibold text-[hsl(var(--warn))] underline">Remove</button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Btn variant="line" size="sm" onClick={addDoor} disabled={doors.length >= 4}>+ Add door</Btn>
                <span className="text-[11px] text-[hsl(var(--ink-3))]">
                  Roll-ups 6×6 through 12×12, plus 36-in walk-ins — up to 4 doors.
                </span>
              </div>
            </div>
            <Seg label="Windows — 30 × 30 with frame-out" options={[0, 1, 2, 3, 4] as const} value={windows} onChange={setWindows} />
          </div>
        )}
        {step === 4 && (
          <div className="grid gap-4">
            <Swatches label="Roof color" value={roofColor} onChange={setRoofColor} />
            <Swatches label="Trim color" value={trimColor} onChange={setTrimColor} />
            <Swatches label="Side color" value={sideColor} onChange={setSideColor} />
            <p className="text-[11px] text-[hsl(var(--ink-3))]">
              Confirmed at order — no price change.
            </p>
          </div>
        )}
        {step === 5 && (
          <div className="grid gap-4">
            <Seg label="Anchors — matched to your surface" options={GARAGE_ANCHORS} value={anchors}
              onChange={setAnchors} fmt={v => ANCHOR_NAMES[v]} />
            <Seg label="Lean-to — 6-ft wing, per side" options={GARAGE_LEANTO} value={leanTo}
              onChange={setLeanTo} fmt={v => LEAN_NAMES[v]} />
            <div>
              <Lab className="mb-1.5">Wind / snow rating</Lab>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" aria-pressed={!certified} onClick={() => setCertified(false)}
                  className={cx("min-h-[42px] rounded-[6px] border px-3 text-[14px] font-semibold transition-colors",
                    !certified
                      ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                      : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
                  Standard
                </button>
                <button type="button" aria-pressed={certified} onClick={() => setCertified(true)}
                  className={cx("min-h-[42px] rounded-[6px] border px-3 text-[14px] font-semibold transition-colors",
                    certified
                      ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                      : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
                  Certified
                </button>
              </div>
              <p className="mt-1.5 text-[12px] leading-[1.5] text-[hsl(var(--ink-3))]">
                Certified units include engineered drawings for your county — drafted by us, sealed by
                licensed partner engineers. Concrete anchoring is what certified-on-concrete ratings
                assume; certified on bare ground moves to auger anchors at engineering review.
              </p>
            </div>
          </div>
        )}
        {step === 6 && (
          <div>
            <p className="mb-3 text-[13px] font-semibold">
              A dealer-sheet quote, line for line, from one model.
            </p>
            <QuoteGate tool="garage" params={{ ...params }} total={total} />
          </div>
        )}
      </div>
    </ToolShell>
  );
}
