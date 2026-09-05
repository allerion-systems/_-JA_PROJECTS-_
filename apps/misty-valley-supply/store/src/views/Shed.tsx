import * as React from "react";
import { useAuth } from "@/auth";
import { rollup, shedTakeoff, type Element, type ShedParams } from "@/bim";
import ShedScene from "@/views/ShedScene";
import { Btn, Field, Lab, Panel, Tag, cx, inputCls, money } from "@/ui";

/* ------------------------------------------------------------------------
   Shed Designer — visual-first wizard on the shared 5D core (bim.ts).
   The 3D scene, the bill of material and the price all read one element
   list, so they can never disagree. Customer-side shows list pricing only;
   any cost basis stays behind can("cost.view").
   ---------------------------------------------------------------------- */

// ---- shared: sticky price bar -------------------------------------------

export function PriceBar({ label, total }: { label: string; total: number }) {
  return (
    <div className="sticky top-0 z-20 -mx-1 mb-3 px-1">
      <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[hsl(var(--marine))] px-4 py-2.5 shadow-[0_4px_14px_-4px_hsl(222_70%_12%/.5)]">
        <span className="min-w-0 truncate text-[13px] font-semibold text-white/85">{label}</span>
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="eyebrow text-[hsl(var(--safety-hi))]">Your price</span>
          <span className="num text-[20px] font-bold text-white">{money(total)}</span>
        </span>
      </div>
    </div>
  );
}

// ---- shared: step strip --------------------------------------------------

export function Steps({ steps, step, onStep }: { steps: string[]; step: number; onStep: (i: number) => void }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <span className="text-[hsl(var(--ink-3))]">›</span>}
          <button onClick={() => onStep(i)}
            className={cx("min-h-[38px] rounded-full border px-4 text-[13px] font-semibold transition-colors",
              i === step
                ? "border-[hsl(var(--safety-2))] bg-[hsl(var(--safety-2))] text-white"
                : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
            {s}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

// ---- shared: segmented choice -------------------------------------------

export function Seg<T extends string | number>({
  label, options, value, onChange, fmt,
}: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; fmt?: (v: T) => string }) {
  return (
    <div>
      <Lab className="mb-1.5">{label}</Lab>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => (
          <button key={String(o)} onClick={() => onChange(o)}
            className={cx("min-h-[42px] min-w-[46px] rounded-[6px] border px-3 text-[14px] font-semibold transition-colors",
              o === value
                ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
            {fmt ? fmt(o) : String(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- shared: the 5D bill of material ------------------------------------

export function BomTable({ elements }: { elements: Element[] }) {
  const { can } = useAuth();
  const priced = can("cost.view"); // full priced BoM is internal-only
  const { total } = rollup(elements);
  return (
    <Panel pad={false}>
      <div className="tape h-1.5" />
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <Lab kicker>5D bill of material</Lab>
        <Tag tone="marine">IFC ISO 16739</Tag>
      </div>
      <div className="overflow-x-auto px-1 pb-1 pt-2">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr>
              {["IFC class", "Component", "Qty", "Unit", "SKU", ...(priced ? ["Unit price", "Extended"] : [])].map((c, i) => (
                <th key={c} className={cx(
                  "border-b border-[hsl(var(--rule))] bg-[hsl(var(--panel-2))] px-3 py-2 text-left text-[11px] font-semibold whitespace-nowrap text-[hsl(var(--ink-2))]",
                  (i === 2 || i > 4) && "text-right")}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements.map((e, i) => (
              <tr key={i} className="border-b border-[hsl(var(--rule-2))]">
                <td className="mono px-3 py-2 text-[12px] text-[hsl(var(--marine))] whitespace-nowrap">{e.ifcClass}</td>
                <td className="px-3 py-2 text-[13px]">{e.name}</td>
                <td className="num px-3 py-2 text-right text-[13px] font-semibold">{e.qty}</td>
                <td className="px-3 py-2 text-[12px] text-[hsl(var(--ink-2))]">{e.unit}</td>
                <td className="mono px-3 py-2 text-[12px] whitespace-nowrap text-[hsl(var(--ink-2))]">{e.sku}</td>
                {priced && <td className="num px-3 py-2 text-right text-[13px]">{money(e.unitPrice)}</td>}
                {priced && <td className="num px-3 py-2 text-right text-[13px]">{money(e.ext)}</td>}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={priced ? 6 : 4} className="px-3 py-2.5 text-right text-[13px] font-semibold">
                Your price — materials
              </td>
              <td className="num px-3 py-2.5 text-right text-[15px] font-bold">{money(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="px-4 pb-3 text-[12px] text-[hsl(var(--ink-3))]">
        Every number derives from the model — change a dimension and watch the whole sheet move.
      </p>
    </Panel>
  );
}

// ---- shared: the quote gate ----------------------------------------------

type SavedRequest = {
  ts: string; tool: string; params: Record<string, unknown>; bomTotal: number;
  contact: { name: string; company: string; email: string; mobile: string; smsConsent: boolean };
};

const emailOk = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const phoneOk = (s: string) => {
  const d = s.replace(/\D/g, "");
  return d.length === 10 || (d.length === 11 && d.startsWith("1"));
};

function saveRequest(req: SavedRequest) {
  try {
    const key = "mvs-design-requests";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
    localStorage.setItem(key, JSON.stringify([...(Array.isArray(prev) ? prev : []), req]));
  } catch {
    /* storage unavailable — the confirmation still shows; nothing is claimed sent */
  }
}

export function QuoteGate({ tool, params, total }: { tool: string; params: Record<string, unknown>; total: number }) {
  const { user } = useAuth();
  const [sent, setSent] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [tried, setTried] = React.useState(false);

  const submit = (contact: SavedRequest["contact"]) => {
    const id = `D-${1000 + Math.floor(Math.random() * 9000)}`;
    saveRequest({ ts: new Date().toISOString(), tool, params, bomTotal: total, contact });
    setSent(id);
  };

  if (sent) {
    return (
      <div>
        <p className="text-[15px] font-semibold">Design {sent} received — a fabricator reviews it and your quote follows by email and text.</p>
        <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
          Prototype — email/SMS delivery connects at launch; your request is saved for the counter to call back.
        </p>
        <Btn variant="line" size="sm" className="mt-3" onClick={() => setSent(null)}>Start another</Btn>
      </div>
    );
  }

  if (user) {
    return (
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3 text-[13px]">
          <span>{user.name} — {user.company}</span>
          <span className="num font-semibold">{money(total)}</span>
        </div>
        <Btn className="w-full" onClick={() =>
          submit({ name: user.name, company: user.company, email: "", mobile: "", smsConsent: true })}>
          Text + email me this design
        </Btn>
      </div>
    );
  }

  const valid = name.trim() && emailOk(email) && phoneOk(mobile) && consent;
  return (
    <div className="grid gap-2.5">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Name">
          <input value={name} onChange={e => setName(e.target.value)} className={inputCls} autoComplete="name" />
        </Field>
        <Field label="Company">
          <input value={company} onChange={e => setCompany(e.target.value)} className={inputCls} autoComplete="organization" />
        </Field>
        <Field label="Email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
        </Field>
        <Field label="Mobile">
          <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="(502) 555-0134" className={inputCls} autoComplete="tel" />
        </Field>
      </div>
      {tried && !emailOk(email) && <p className="text-[12px] text-[hsl(var(--warn))]">Enter a valid email address.</p>}
      {tried && !phoneOk(mobile) && <p className="text-[12px] text-[hsl(var(--warn))]">Enter a 10-digit US mobile number.</p>}
      <label className="flex items-start gap-2.5 text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[hsl(var(--safety-2))]" />
        <span>I agree to receive a text about this design request at the mobile number above.</span>
      </label>
      {tried && !consent && <p className="text-[12px] text-[hsl(var(--warn))]">SMS consent is required.</p>}
      <Btn className="w-full" onClick={() => {
        setTried(true);
        if (valid) submit({ name: name.trim(), company: company.trim(), email: email.trim(), mobile: mobile.trim(), smsConsent: true });
      }}>
        Text + email me this design
      </Btn>
    </div>
  );
}

// ==========================================================================
// The Shed Designer page
// ==========================================================================

const WIDTHS = [8, 10, 12] as const;
const LENGTHS = [8, 10, 12, 14, 16, 18, 20, 22, 24] as const;
const STEPS = ["Size", "Style", "Options", "Quote"];

export default function Shed() {
  const [step, setStep] = React.useState(0);
  const [widthFt, setWidthFt] = React.useState<ShedParams["widthFt"]>(10);
  const [lengthFt, setLengthFt] = React.useState<number>(12);
  const [wallHFt, setWallHFt] = React.useState<ShedParams["wallHFt"]>(8);
  const [pitch, setPitch] = React.useState<ShedParams["pitch"]>(4);
  const [doors, setDoors] = React.useState<ShedParams["doors"]>(1);
  const [windows, setWindows] = React.useState<ShedParams["windows"]>(1);
  const [siding, setSiding] = React.useState<ShedParams["siding"]>("vinyl");

  const params: ShedParams = { widthFt, lengthFt, wallHFt, pitch, doors, windows, siding };
  const elements = React.useMemo(() => shedTakeoff(params),
    [widthFt, lengthFt, wallHFt, pitch, doors, windows, siding]);
  const { total } = rollup(elements);

  return (
    <div>
      <PriceBar label={`Shed — ${widthFt} × ${lengthFt} · ${wallHFt} ft walls · ${pitch}:12 gable`} total={total} />

      <Panel pad={false} className="card-hi mb-4">
        <div className="tape h-1.5" />
        <div className="h-[380px] sm:h-[480px]">
          <ShedScene {...params} />
        </div>
      </Panel>

      <Steps steps={STEPS} step={step} onStep={setStep} />

      <Panel className="mb-4">
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Width" options={WIDTHS} value={widthFt} onChange={setWidthFt} fmt={v => `${v} ft`} />
            <Seg label="Length" options={LENGTHS} value={lengthFt} onChange={setLengthFt} fmt={v => `${v}`} />
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Seg label="Wall height" options={[7, 8] as const} value={wallHFt} onChange={setWallHFt} fmt={v => `${v} ft`} />
            <Seg label="Roof pitch" options={[4, 6] as const} value={pitch} onChange={setPitch} fmt={v => `${v}:12`} />
            <Seg label="Siding" options={["vinyl", "none"] as const} value={siding} onChange={setSiding}
              fmt={v => (v === "vinyl" ? "Vinyl" : "Wrap only")} />
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Doors" options={[1, 2] as const} value={doors} onChange={setDoors} />
            <Seg label="Windows" options={[0, 1, 2] as const} value={windows} onChange={setWindows} />
          </div>
        )}
        {step === 3 && <QuoteGate tool="shed" params={{ ...params }} total={total} />}
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
