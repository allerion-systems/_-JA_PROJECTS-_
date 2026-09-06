import * as React from "react";
import { pickOne } from "@/designStore";
import { Btn, Lab, Panel, Tag } from "@/ui";
import { QuoteGate, SaveShare, Seg, Steps } from "@/views/Shed";
import {
  APT_STORIES, APT_UNITS, EMS_BAYS, EMS_QUARTERS_GSF, HOTEL_ROOMS, HOTEL_STORIES,
  OFFICE_GSF, OFFICE_STORIES, SCHOOL_CLASSROOMS, fmtMillions, program, programStories,
  type ProgramParams, type ProgramType,
} from "@/programMath";

// three.js stays in its own lazy chunk — loaded only when the tool renders
const ProgramScene = React.lazy(() => import("@/views/ProgramScene"));

/* ------------------------------------------------------------------------
   Modular Projects programmer — architect-scale work: hotels, schools,
   offices, apartments, emergency and government buildings. The honesty
   contract IS the design: this tool never shows a retail price. It
   programs the building, returns module count, gross square footage and
   a clearly-labeled PLANNING RANGE, then routes to design-build intake.
   No PriceBar, no BomTable, no cart.
   ---------------------------------------------------------------------- */

const STEPS = ["Type", "Size", "Review"];

const TYPES: { type: ProgramType; label: string; sub: string }[] = [
  { type: "hotel", label: "Hotel", sub: "Guest rooms, stacked and corridor-served" },
  { type: "office", label: "Office", sub: "Direct GSF, one to three stories" },
  { type: "school", label: "School", sub: "Classroom wing, single-story" },
  { type: "apartments", label: "Apartments", sub: "Unit blocks, two to four stories" },
  { type: "emergency", label: "Emergency", sub: "Fire / EMS — apparatus bays plus quarters" },
  { type: "government", label: "Government", sub: "Public offices, programmed like commercial" },
];

export default function Program({ initial }: { initial?: Partial<ProgramParams> }) {
  // initial comes off the wire (saved design / share link); ProgramParams is
  // a discriminated union, so read it wide and re-validate every value
  const ini = (initial ?? {}) as Record<string, unknown>;
  const iniType = pickOne<ProgramType | null>(ini.type, TYPES.map(t => t.type), null);
  const [step, setStep] = React.useState(iniType ? 2 : 0);
  const [type, setType] = React.useState<ProgramType | null>(iniType);
  const [rooms, setRooms] = React.useState<number>(pickOne(ini.rooms, HOTEL_ROOMS, 40));
  const [hotelStories, setHotelStories] = React.useState<number>(pickOne(ini.stories, HOTEL_STORIES, 3));
  const [officeGsf, setOfficeGsf] = React.useState<number>(pickOne(ini.gsf, OFFICE_GSF, 20000));
  const [officeStories, setOfficeStories] = React.useState<number>(pickOne(ini.stories, OFFICE_STORIES, 2));
  const [classrooms, setClassrooms] = React.useState<number>(pickOne(ini.classrooms, SCHOOL_CLASSROOMS, 8));
  const [units, setUnits] = React.useState<number>(pickOne(ini.units, APT_UNITS, 24));
  const [aptStories, setAptStories] = React.useState<number>(pickOne(ini.stories, APT_STORIES, 3));
  const [bays, setBays] = React.useState<number>(pickOne(ini.bays, EMS_BAYS, 3));
  const [quartersGsf, setQuartersGsf] = React.useState<number>(pickOne(ini.quartersGsf, EMS_QUARTERS_GSF, 2000));

  const params: ProgramParams | null = React.useMemo(() => {
    switch (type) {
      case "hotel": return { type, rooms, stories: hotelStories };
      case "office":
      case "government": return { type, gsf: officeGsf, stories: officeStories };
      case "school": return { type, classrooms };
      case "apartments": return { type, units, stories: aptStories };
      case "emergency": return { type, bays, quartersGsf };
      default: return null;
    }
  }, [type, rooms, hotelStories, officeGsf, officeStories, classrooms, units, aptStories, bays, quartersGsf]);

  const result = params ? program(params) : null;

  const pick = (t: ProgramType) => { setType(t); setStep(1); };
  const label = type ? TYPES.find(t => t.type === type)!.label : null;

  return (
    <div>
      {params && (
        <Panel pad={false} className="card-hi mb-4">
          <div className="h-[260px] sm:h-[480px]">
            <React.Suspense fallback={
              <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--ink-3))]">
                Loading massing study…
              </div>
            }>
              <ProgramScene params={params} />
            </React.Suspense>
          </div>
        </Panel>
      )}

      <Steps steps={STEPS} step={step} onStep={i => { if (i === 0 || type) setStep(i); }} />

      <Panel className="mb-4">
        {step === 0 && (
          <div>
            <Lab kicker className="mb-2.5">What are you programming?</Lab>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {TYPES.map(t => (
                <button key={t.type} onClick={() => pick(t.type)} aria-pressed={type === t.type}
                  className={"rounded-[6px] border p-4 text-left transition-colors " + (type === t.type
                    ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine-soft))] shadow-[0_0_0_1px_hsl(var(--marine))]"
                    : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] hover:border-[hsl(var(--ink))]")}>
                  <span className="disp block text-[17px] font-bold leading-[1.1]">{t.label}</span>
                  <span className="mt-1 block text-[12px] leading-[1.4] text-[hsl(var(--ink-3))]">{t.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && type && (
          <div className="grid gap-4 sm:grid-cols-2">
            {type === "hotel" && (<>
              <Seg label="Guest rooms" options={HOTEL_ROOMS} value={rooms} onChange={setRooms} />
              <Seg label="Stories" options={HOTEL_STORIES} value={hotelStories} onChange={setHotelStories} fmt={v => `${v} stories`} />
            </>)}
            {(type === "office" || type === "government") && (<>
              <Seg label="Gross square feet" options={OFFICE_GSF} value={officeGsf} onChange={setOfficeGsf} fmt={v => v.toLocaleString("en-US")} />
              <Seg label="Stories" options={OFFICE_STORIES} value={officeStories} onChange={setOfficeStories} fmt={v => v === 1 ? "1 story" : `${v} stories`} />
            </>)}
            {type === "school" && (
              <Seg label="Classrooms" options={SCHOOL_CLASSROOMS} value={classrooms} onChange={setClassrooms} />
            )}
            {type === "apartments" && (<>
              <Seg label="Units" options={APT_UNITS} value={units} onChange={setUnits} />
              <Seg label="Stories" options={APT_STORIES} value={aptStories} onChange={setAptStories} fmt={v => `${v} stories`} />
            </>)}
            {type === "emergency" && (<>
              <Seg label="Apparatus bays" options={EMS_BAYS} value={bays} onChange={setBays} />
              <Seg label="Quarters" options={EMS_QUARTERS_GSF} value={quartersGsf} onChange={setQuartersGsf} fmt={v => `${v.toLocaleString("en-US")} sf`} />
            </>)}
          </div>
        )}

        {step === 2 && params && result && (
          <div className="grid gap-4 lg:grid-cols-2">
            {/* the program card */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <Lab kicker>Program — {label}</Lab>
                <Tag tone="marine">Modular</Tag>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["Gross area", `${result.gsf.toLocaleString("en-US")} sf`],
                  ["Modules (14×62)", String(result.modules)],
                  ["Crane-set", `≈ ${result.craneWeeks} wk`],
                ] as const).map(([k, v]) => (
                  <div key={k} className="rounded-[6px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel-2))] px-3 py-2.5">
                    <div className="text-[11px] font-medium text-[hsl(var(--ink-3))]">{k}</div>
                    <div className="num mt-0.5 text-[17px] font-bold">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-[6px] border border-[hsl(var(--marine))]/20 bg-[hsl(var(--marine-soft))] px-3.5 py-3">
                <div className="text-[13px] font-semibold text-[hsl(var(--marine))]">
                  Planning range: {fmtMillions(result.rangeLow)} – {fmtMillions(result.rangeHigh)}
                </div>
                <div className="mt-1 text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
                  A planning range, not a quote — your number comes from design-build.
                </div>
                <div className="num mt-1 text-[11px] text-[hsl(var(--ink-3))]">
                  ${result.perGsf[0]}–${result.perGsf[1]} / GSF planning band
                </div>
              </div>
            </div>
            {/* the design-build intake */}
            <div>
              <Lab kicker className="mb-2">Route to design-build</Lab>
              <QuoteGate tool="program"
                params={{
                  ...params,
                  stories: programStories(params),
                  gsf: result.gsf,
                  modules: result.modules,
                  craneWeeks: result.craneWeeks,
                  planningRangeUsd: [result.rangeLow, result.rangeHigh],
                  perGsfBand: result.perGsf,
                }}
                total={0 /* no retail price — this tool programs, design-build prices */} />
            </div>
          </div>
        )}

        {type && params && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <SaveShare tool="program" params={{ ...params }} label={`Modular — ${label ?? type}`} />
            {step < 2 && (
              <Btn size="sm" onClick={() => setStep(step + 1)}>
                {step === 1 ? "Review the program" : "Next"}
              </Btn>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}
