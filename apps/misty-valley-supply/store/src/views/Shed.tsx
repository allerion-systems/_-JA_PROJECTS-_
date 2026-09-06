import * as React from "react";
import { useAuth } from "@/auth";
import { PRODUCTS } from "@/data";
import { rollup, shedTakeoff, type Element, type ShedParams } from "@/bim";
import { designUrl, pickBool, pickOne, saveDesign } from "@/designStore";
import { Btn, Field, Lab, Panel, Tag, cx, inputCls, money } from "@/ui";
import { useAnimatedNumber } from "@/useAnimatedNumber";

// three.js stays in its own lazy chunk — loaded only when the shed renders
const ShedScene = React.lazy(() => import("@/views/ShedScene"));
// the printable spec sheet is its own lazy chunk — loaded on first open only
const SpecSheet = React.lazy(() => import("@/views/SpecSheet"));
import type { SpecLine, SpecProgram } from "@/views/SpecSheet"; // type-only, erased at build

/* ------------------------------------------------------------------------
   Shed Designer — visual-first wizard on the shared 5D core (bim.ts).
   The 3D scene, the bill of material and the price all read one element
   list, so they can never disagree. Customer-side shows list pricing only;
   any cost basis stays behind can("cost.view").
   ---------------------------------------------------------------------- */

// ---- shared: sticky price bar -------------------------------------------

/** Ask the app shell to open the sign-in modal from anywhere in a tool. */
export const requestSignIn = () => window.dispatchEvent(new CustomEvent("mvs-signin"));

/* Estimates are gated: guests design freely and sign in to see the number
   (lead capture, Lester-style). Signed-in accounts get the live price.
   Agents get ungated pricing through the MCP endpoint — never through this UI. */
export function PriceBar({ label, total }: { label: string; total: number }) {
  const { user } = useAuth();
  const shown = useAnimatedNumber(total);
  return (
    <div className="sticky top-0 z-20 -mx-1 mb-3 px-1">
      <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[hsl(var(--marine))] px-4 py-2.5 shadow-[0_4px_14px_-4px_hsl(222_70%_12%/.5)]">
        <span className="min-w-0 truncate text-[13px] font-semibold text-white/85">{label}</span>
        {user ? (
          <span className="flex shrink-0 items-baseline gap-2">
            <span className="eyebrow text-[hsl(var(--safety-hi))]">Your price</span>
            <span className="num text-[20px] font-bold text-white">{money(Math.round(shown))}</span>
          </span>
        ) : (
          <button onClick={requestSignIn}
            className="flex h-9 shrink-0 items-center rounded-[6px] bg-[hsl(var(--safety-hi))] px-3.5 text-[13px] font-bold text-[hsl(var(--marine-2))] hover:brightness-105">
            Sign in to view estimate
          </button>
        )}
      </div>
    </div>
  );
}

// ---- shared: save + share ------------------------------------------------

/* Guests save and share freely — only the PRICE is gated (lead capture),
   never the design itself. Saved designs live in localStorage; the link
   carries the whole design in its hash, so it opens anywhere. */
export function SaveShare({ tool, params, label }: {
  tool: string; params: Record<string, unknown>; label: string;
}) {
  const [note, setNote] = React.useState<string | null>(null);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);
  const flash = (msg: string) => {
    setNote(msg);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNote(null), 2200);
  };
  const copy = async () => {
    const url = designUrl(tool, params);
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied");
    } catch {
      // clipboard API unavailable — the selection fallback still copies
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        flash("Link copied");
      } catch {
        flash("Couldn't copy — share the address bar");
      }
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Btn variant="line" size="sm" onClick={() => { saveDesign(tool, params, label); flash("Saved to My designs"); }}>
        Save design
      </Btn>
      <Btn variant="line" size="sm" onClick={copy}>Copy link</Btn>
      <span aria-live="polite" role="status"
        className={cx("text-[12px] font-medium text-[hsl(var(--good))] transition-opacity duration-300",
          note ? "opacity-100" : "opacity-0")}>
        {note ?? ""}
      </span>
    </div>
  );
}

// ---- shared: the printable spec sheet ------------------------------------

/* "Spec sheet" sits beside SaveShare on every tool. The click captures the
   visible 3D canvas (every scene renders with preserveDrawingBuffer, so the
   last frame is still in the buffer) and opens SpecSheet.tsx — a printable
   one-page document. Pricing on the sheet follows the PriceBar/BomTable
   gate exactly: guests get qty/description only. */
export function SpecButton({ toolLabel, designName, paramRows, lines, total, totalLabel, program, building }: {
  toolLabel: string;
  designName: string;
  paramRows: readonly (readonly [string, string])[];
  lines?: SpecLine[];
  total?: number;
  totalLabel?: string;
  program?: SpecProgram;
  building?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [snapshot, setSnapshot] = React.useState<string | null>(null);
  const openSheet = () => {
    let snap: string | null = null;
    try {
      const canvas = document.querySelector<HTMLCanvasElement>("main canvas")
        ?? document.querySelector<HTMLCanvasElement>("canvas");
      if (canvas && canvas.width > 0) snap = canvas.toDataURL("image/png");
    } catch {
      /* tainted or lost context — the sheet still opens, textual only */
    }
    setSnapshot(snap);
    setOpen(true);
  };
  return (
    <>
      <Btn variant="line" size="sm" onClick={openSheet}>Spec sheet</Btn>
      {open && (
        <React.Suspense fallback={null}>
          <SpecSheet toolLabel={toolLabel} designName={designName} paramRows={paramRows}
            lines={lines} total={total} totalLabel={totalLabel} program={program}
            building={building} snapshot={snapshot} onClose={() => setOpen(false)} />
        </React.Suspense>
      )}
    </>
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
  const { can, user } = useAuth();
  const priced = can("cost.view"); // full priced BoM is internal-only
  // Customers get the sheet on demand; staff see it open. Keeps the page short.
  const [open, setOpen] = React.useState(priced);
  const { total } = rollup(elements);
  /* The Design Center sells: every BoM line whose SKU is a real catalog
     product can go straight into the app cart. Shop-fab part codes (screens)
     are skipped — those are quoted, not carted. */
  const kitLines = elements.filter(e => e.qty > 0 && !!e.sku && PRODUCTS.some(p => p.sku === e.sku));
  const buyKit = () =>
    window.dispatchEvent(new CustomEvent("mvs-add-kit", {
      detail: { lines: elements.filter(e => e.qty > 0).map(e => ({ sku: e.sku ?? "", qty: e.qty })) },
    }));
  return (
    <Panel pad={false}>
      <button onClick={() => setOpen(!open)} aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="flex items-center gap-2.5">
          <Lab kicker>Bill of material</Lab>
          <span className="num text-[12px] text-[hsl(var(--ink-3))]">{elements.length} lines</span>
        </span>
        <span className="flex items-center gap-2.5">
          <Tag tone="marine">IFC ISO 16739</Tag>
          <span className="text-[13px] font-semibold text-[hsl(var(--marine))]">{open ? "Hide" : "Show"}</span>
        </span>
      </button>
      {open && (
      <div className="overflow-x-auto px-1 pb-1">
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
                {user ? "Your price — materials" : "Materials estimate"}
              </td>
              <td className="num px-3 py-2.5 text-right text-[15px] font-bold">
                {user ? money(total) : (
                  <button onClick={requestSignIn} className="font-semibold text-[hsl(var(--marine))] underline">
                    Sign in to view
                  </button>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      )}
      {open && (
        <p className="px-4 pb-3 text-[12px] text-[hsl(var(--ink-3))]">
          Every number derives from the model — change a dimension and watch the whole sheet move.
        </p>
      )}
      {kitLines.length > 0 && (
        <div className="border-t border-[hsl(var(--rule))] px-4 py-3">
          <Btn className="w-full" onClick={buyKit}>
            Buy this kit — {kitLines.length} {kitLines.length === 1 ? "line" : "lines"} to my order
          </Btn>
          {!user && (
            <p className="mt-1.5 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
              Guests welcome — list prices in the cart; your contract pricing appears when you sign in.
            </p>
          )}
        </div>
      )}
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

/* Paid drawing packages — drafted from the same model that priced the job;
   sealing is licensed-partner-engineer scope (KRS 322). Fee is charged after
   the order is confirmed, never before. */
const DRAWING_PACKS = [
  { id: "none", label: "No drawings", fee: 0 },
  { id: "permit", label: "Permit package — drafted + IFC · $450", fee: 450 },
  { id: "seal", label: "Sealed by partner engineers · $1,400", fee: 1400 },
] as const;

export function QuoteGate({ tool, params, total }: { tool: string; params: Record<string, unknown>; total: number }) {
  const { user } = useAuth();
  const [pack, setPack] = React.useState<(typeof DRAWING_PACKS)[number]["id"]>("none");
  const [sent, setSent] = React.useState<string | null>(null);
  const [name, setName] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [tried, setTried] = React.useState(false);

  const chosen = DRAWING_PACKS.find(p => p.id === pack)!;
  const submit = (contact: SavedRequest["contact"]) => {
    const id = `D-${1000 + Math.floor(Math.random() * 9000)}`;
    saveRequest({ ts: new Date().toISOString(), tool,
      params: { ...params, drawingPackage: pack, drawingSku: pack === "permit" ? "MVS-DP-PERMIT" : pack === "seal" ? "MVS-DP-SEAL" : null, drawingFee: chosen.fee },
      bomTotal: total, contact });
    setSent(id);
  };

  const packPicker = (
    <div>
      <Lab className="mb-1.5">Construction drawings — generated from this model after your order is confirmed</Lab>
      <div className="flex flex-wrap gap-1.5">
        {DRAWING_PACKS.map(p => (
          <button key={p.id} onClick={() => setPack(p.id)}
            className={cx("min-h-[42px] rounded-[6px] border px-3 text-[13px] font-semibold transition-colors",
              p.id === pack
                ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
            {p.label}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
        Plan, elevations and sections drafted from the same model that priced the job, with the IFC (ISO 16739) data file.
        Sealing is by licensed partner engineers. Billed only after the contract is signed.
      </p>
    </div>
  );

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
          {total > 0 && <span className="num font-semibold">{money(total)}</span>}
        </div>
        <div className="mb-3">{packPicker}</div>
        <Btn className="w-full" onClick={() =>
          submit({ name: user.name, company: user.company, email: "", mobile: "", smsConsent: true })}>
          Text + email me this design{chosen.fee > 0 ? ` + drawings (${money(chosen.fee)})` : ""}
        </Btn>
      </div>
    );
  }

  const valid = name.trim() && emailOk(email) && phoneOk(mobile) && consent;
  return (
    <div className="grid gap-2.5">
      {packPicker}
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

// ---- cosmetic color choices — chosen at order, never priced --------------

const SIDING_COLORS = [
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
      <p className="mt-1 text-[11px] text-[hsl(var(--ink-3))]">Color is confirmed at order — no price change.</p>
    </div>
  );
}

export default function Shed({ initial }: { initial?: Partial<ShedParams> }) {
  const [step, setStep] = React.useState(0);
  // initial comes off the wire (saved design / share link) — every value is
  // re-validated against the tool's own options; anything off falls to default
  const [widthFt, setWidthFt] = React.useState<ShedParams["widthFt"]>(pickOne(initial?.widthFt, WIDTHS, 10));
  const [lengthFt, setLengthFt] = React.useState<number>(pickOne(initial?.lengthFt, LENGTHS, 12));
  const [wallHFt, setWallHFt] = React.useState<ShedParams["wallHFt"]>(pickOne(initial?.wallHFt, [7, 8] as const, 8));
  const [pitch, setPitch] = React.useState<ShedParams["pitch"]>(pickOne(initial?.pitch, [4, 6] as const, 4));
  const [doors, setDoors] = React.useState<ShedParams["doors"]>(pickOne(initial?.doors, [1, 2] as const, 1));
  const [windows, setWindows] = React.useState<ShedParams["windows"]>(pickOne(initial?.windows, [0, 1, 2] as const, 1));
  const [siding, setSiding] = React.useState<ShedParams["siding"]>(pickOne(initial?.siding, ["vinyl", "none"] as const, "vinyl"));
  const [roof, setRoof] = React.useState<ShedParams["roof"]>(pickOne(initial?.roof, ["metal", "ready"] as const, "metal"));
  const [framing, setFraming] = React.useState<ShedParams["framing"]>(pickOne(initial?.framing, ["stick", "truss"] as const, "stick"));
  const [ramp, setRamp] = React.useState(pickBool(initial?.ramp, false));
  const [loft, setLoft] = React.useState(pickBool(initial?.loft, false));
  const [cupola, setCupola] = React.useState(pickBool(initial?.cupola, false));
  const [wainscot, setWainscot] = React.useState(pickBool(initial?.wainscot, false));
  const [hvac, setHvac] = React.useState(pickBool(initial?.hvac, false));
  // cosmetic only — never enters ShedParams or the takeoff
  const [sidingColor, setSidingColor] = React.useState<string>(SIDING_COLORS[0][1]);
  const [roofColor, setRoofColor] = React.useState<string>(ROOF_COLORS[0][1]);

  const params: ShedParams = { widthFt, lengthFt, wallHFt, pitch, doors, windows, siding, roof, framing, ramp, loft, cupola, wainscot, hvac };
  const elements = React.useMemo(() => shedTakeoff(params),
    [widthFt, lengthFt, wallHFt, pitch, doors, windows, siding, roof, framing, ramp, loft, cupola, wainscot, hvac]);
  const { total } = rollup(elements);

  // human-readable configuration for the printable spec sheet
  const addOns = [ramp && "4-ft ramp", loft && "Storage loft", cupola && "Cupola",
    wainscot && "Stone wainscot", hvac && "Mini-split + power"].filter(Boolean).join(", ") || "None";
  const specRows: [string, string][] = [
    ["Footprint", `${widthFt} × ${lengthFt} ft`],
    ["Wall height", `${wallHFt} ft`],
    ["Roof pitch", `${pitch}:12 gable`],
    ["Doors / windows", `${doors} / ${windows}`],
    ["Siding", siding === "vinyl"
      ? `Vinyl — ${SIDING_COLORS.find(([, hx]) => hx === sidingColor)?.[0] ?? ""}` : "Housewrap only"],
    ["Roof", roof === "metal"
      ? `Metal, cut to length — ${ROOF_COLORS.find(([, hx]) => hx === roofColor)?.[0] ?? ""}` : "Sheathed only"],
    ["Roof framing", framing === "stick" ? "Stick rafters" : "Engineered trusses"],
    ["Add-ons", addOns],
  ];

  return (
    <div>
      <PriceBar label={`Shed — ${widthFt} × ${lengthFt} · ${wallHFt} ft walls · ${pitch}:12 gable`} total={total} />

      <Panel pad={false} className="card-hi mb-4">
        <div className="h-[260px] sm:h-[480px]">
          <React.Suspense fallback={
            <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--ink-3))]">
              Loading 3D preview…
            </div>
          }>
            <ShedScene {...params} sidingColor={sidingColor} roofColor={roofColor} />
          </React.Suspense>
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
            {siding === "vinyl" && (
              <Swatches label="Siding color" options={SIDING_COLORS} value={sidingColor} onChange={setSidingColor} />
            )}
            {roof === "metal" && (
              <Swatches label="Roof color" options={ROOF_COLORS} value={roofColor} onChange={setRoofColor} />
            )}
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Seg label="Doors" options={[1, 2] as const} value={doors} onChange={setDoors} />
            <Seg label="Windows" options={[0, 1, 2] as const} value={windows} onChange={setWindows} />
            <Seg label="Roof" options={["metal", "ready"] as const} value={roof} onChange={setRoof}
              fmt={v => (v === "metal" ? "Metal, cut to length" : "Sheathed only")} />
            <Seg label="Roof framing" options={["stick", "truss"] as const} value={framing} onChange={setFraming}
              fmt={v => (v === "stick" ? "Stick rafters" : "Engineered trusses")} />
            <div className="sm:col-span-2">
              <Lab className="mb-1.5">Add-ons — shipped with the kit</Lab>
              <div className="flex flex-wrap gap-1.5">
                {([
                  ["4-ft ramp", ramp, setRamp],
                  ["Storage loft", loft, setLoft],
                  ["Cupola", cupola, setCupola],
                  ["Stone wainscot", wainscot, setWainscot],
                  ["Mini-split + power", hvac, setHvac],
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
        {step === 3 && <QuoteGate tool="shed" params={{ ...params }} total={total} />}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <SaveShare tool="shed" params={{ ...params }} label={`Shed ${widthFt}×${lengthFt}`} />
            <SpecButton toolLabel="Backyard Studios" designName={`Shed ${widthFt} × ${lengthFt}`}
              paramRows={specRows} lines={elements} total={total} building />
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
