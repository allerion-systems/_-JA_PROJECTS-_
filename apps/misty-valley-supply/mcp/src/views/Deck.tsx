import * as React from "react";
import { deckTakeoff, guardRequired, rollup, type DeckParams } from "@/bim";
import DeckScene from "@/views/DeckScene";
import { BomTable, PriceBar, QuoteGate, Seg, Steps } from "@/views/Shed";
import { Btn, Panel, Tag } from "@/ui";

/* ------------------------------------------------------------------------
   Deck Designer — same visual-first wizard, same shared 5D core (bim.ts).
   IRC R312.1.1 forces the guard on at 30 in and above; the toggle only
   exists on the one deck height below that line.
   ---------------------------------------------------------------------- */

const WIDTHS = [10, 12, 14, 16, 18, 20] as const;
const DEPTHS = [8, 10, 12, 14, 16] as const;
const STEPS = ["Size", "Height", "Options", "Quote"];

export default function Deck() {
  const [step, setStep] = React.useState(0);
  const [widthFt, setWidthFt] = React.useState<number>(12);
  const [depthFt, setDepthFt] = React.useState<number>(12);
  const [heightFt, setHeightFt] = React.useState<DeckParams["heightFt"]>(4);
  const [railing, setRailing] = React.useState(true);
  const [stairs, setStairs] = React.useState(true);

  // IRC R312.1.1: a guard is required on any surface more than 30 in above
  // grade — at 4 ft and 8 ft the choice is not the customer's to make.
  const guardForced = guardRequired(heightFt);
  const effRailing = railing || guardForced;

  const params: DeckParams = { widthFt, depthFt, heightFt, railing: effRailing, stairs };
  const elements = React.useMemo(() => deckTakeoff(params),
    [widthFt, depthFt, heightFt, effRailing, stairs]);
  const { total } = rollup(elements);

  return (
    <div>
      <PriceBar
        label={`Deck — ${widthFt} × ${depthFt} · ${heightFt} ft high${effRailing ? " · guard" : ""}${stairs ? " · stairs" : ""}`}
        total={total}
      />

      <Panel pad={false} className="card-hi mb-4">
        <div className="tape h-1.5" />
        <div className="h-[380px] sm:h-[480px]">
          <DeckScene {...params} />
        </div>
      </Panel>

      <Steps steps={STEPS} step={step} onStep={setStep} />

      <Panel className="mb-4">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Width (along the house)" options={WIDTHS} value={widthFt} onChange={setWidthFt} fmt={v => `${v}`} />
            <Seg label="Depth (out from the house)" options={DEPTHS} value={depthFt} onChange={setDepthFt} fmt={v => `${v}`} />
          </div>
        )}
        {step === 1 && (
          <Seg label="Deck height" options={[2, 4, 8] as const} value={heightFt} onChange={setHeightFt} fmt={v => `${v} ft`} />
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
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
