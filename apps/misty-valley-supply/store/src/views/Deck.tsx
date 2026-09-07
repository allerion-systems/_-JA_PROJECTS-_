import * as React from "react";
import { deckTakeoff, guardRequired, rollup, type DeckParams } from "@/bim";
import { pickBool, pickOne } from "@/designStore";
import { BomTable, QuoteGate, SaveShare, Seg, SpecButton, ToolShell } from "@/views/Shed";

// three.js stays in its own lazy chunk — loaded only when the deck renders
const DeckScene = React.lazy(() => import("@/views/DeckScene"));
import { Btn, Tag } from "@/ui";

/* ------------------------------------------------------------------------
   Deck Designer — same visual-first wizard, same shared 5D core (bim.ts).
   IRC R312.1.1 forces the guard on at 30 in and above; the toggle only
   exists on the one deck height below that line.
   ---------------------------------------------------------------------- */

const WIDTHS = [10, 12, 14, 16, 18, 20] as const;
const DEPTHS = [8, 10, 12, 14, 16] as const;
const STEPS = ["Size", "Height", "Options", "Quote"];

export default function Deck({ initial }: { initial?: Partial<DeckParams> }) {
  const [step, setStep] = React.useState(0);
  // initial comes off the wire (saved design / share link) — re-validated
  const [widthFt, setWidthFt] = React.useState<number>(pickOne(initial?.widthFt, WIDTHS, 12));
  const [depthFt, setDepthFt] = React.useState<number>(pickOne(initial?.depthFt, DEPTHS, 12));
  const [heightFt, setHeightFt] = React.useState<DeckParams["heightFt"]>(pickOne(initial?.heightFt, [2, 4, 8] as const, 4));
  const [railing, setRailing] = React.useState(pickBool(initial?.railing, true));
  const [stairs, setStairs] = React.useState(pickBool(initial?.stairs, true));

  // IRC R312.1.1: a guard is required on any surface more than 30 in above
  // grade — at 4 ft and 8 ft the choice is not the customer's to make.
  const guardForced = guardRequired(heightFt);
  const effRailing = railing || guardForced;

  const params: DeckParams = { widthFt, depthFt, heightFt, railing: effRailing, stairs };
  const elements = React.useMemo(() => deckTakeoff(params),
    [widthFt, depthFt, heightFt, effRailing, stairs]);
  const { total } = rollup(elements);

  // human-readable configuration for the printable spec sheet
  const specRows: [string, string][] = [
    ["Footprint", `${widthFt} × ${depthFt} ft`],
    ["Height above grade", `${heightFt} ft`],
    ["Guard rail", effRailing ? (guardForced ? "Yes — required, IRC R312.1.1" : "Yes") : "No"],
    ["Stairs", stairs ? "Yes" : "No"],
    ["Decking", "5/4×6 PT, 5.5″ exposure"],
  ];

  return (
    <ToolShell
      price={{
        label: `Deck — ${widthFt} × ${depthFt} · ${heightFt} ft high${effRailing ? " · guard" : ""}${stairs ? " · stairs" : ""}`,
        total,
      }}
      steps={STEPS} step={step} onStep={setStep}
      scene={
        <React.Suspense fallback={
          <div className="grid h-full w-full place-items-center bg-[hsl(var(--panel-2))]">
            <span className="lab">Loading the 3D shop…</span>
          </div>
        }>
          <DeckScene {...params} />
        </React.Suspense>
      }
      toolbar={
        <>
          <SaveShare chip tool="deck" params={{ ...params }} label={`Deck ${widthFt}×${depthFt}`} />
          <SpecButton chip toolLabel="Decks" designName={`Deck ${widthFt} × ${depthFt}`}
            paramRows={specRows} lines={elements} total={total} />
        </>
      }
      details={<BomTable elements={elements} />}
      footer={step < 3
        ? <Btn size="sm" className="w-full" onClick={() => setStep(step + 1)}>{step === 2 ? "Get my quote" : "Next"}</Btn>
        : undefined}
    >
      <div>
        {step === 0 && (
          <div className="grid gap-4">
            <Seg label="Width (along the house)" options={WIDTHS} value={widthFt} onChange={setWidthFt} fmt={v => `${v}`} />
            <Seg label="Depth (out from the house)" options={DEPTHS} value={depthFt} onChange={setDepthFt} fmt={v => `${v}`} />
          </div>
        )}
        {step === 1 && (
          <Seg label="Deck height" options={[2, 4, 8] as const} value={heightFt} onChange={setHeightFt} fmt={v => `${v} ft`} />
        )}
        {step === 2 && (
          <div className="grid gap-4">
            <div>
              <Seg label="Guard rail" options={["on", "off"] as const}
                value={effRailing ? "on" : "off"}
                onChange={v => { if (!guardForced) setRailing(v === "on"); }} />
              {guardForced && (
                <div className="mt-2"><Tag tone="warn">Required — IRC R312: guards over 30 in</Tag></div>
              )}
            </div>
            <Seg label="Stairs" options={["on", "off"] as const}
              value={stairs ? "on" : "off"} onChange={v => setStairs(v === "on")} />
          </div>
        )}
        {step === 3 && <QuoteGate tool="deck" params={{ ...params }} total={total} />}
      </div>
    </ToolShell>
  );
}
