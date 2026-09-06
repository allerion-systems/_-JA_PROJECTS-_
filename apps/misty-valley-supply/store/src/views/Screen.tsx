import * as React from "react";
import { ROOFSCREEN as RS, SCREEN_PARTS } from "@/data";
import { pickBool, pickNum, pickOne } from "@/designStore";
import { Btn, DataTable, Field, Head, Lab, Panel, Rule, Tag, cx, inputCls, money } from "@/ui";
import { SaveShare } from "@/views/Shed";
import { useAuth } from "@/auth";
import { useAnimatedNumber } from "@/useAnimatedNumber";

const ScreenScene = React.lazy(() => import("./ScreenScene"));

const usd2 = (n: number) => `$${n.toFixed(2)}`;

/* ---------------------------------------------------------------- drawing */

const INK = "hsl(var(--ink))";
const INK3 = "hsl(var(--ink-3))";
const NAVY = "hsl(var(--marine))";
const GOLD = "hsl(var(--safety-hi))";

/** 3.5 -> 3′-6″, 5 -> 5′-0″ */
const fmtFtIn = (v: number) => {
  const ft = Math.floor(v);
  const inch = Math.round((v - ft) * 12);
  return `${ft}′-${inch}″`;
};

/** 0 -> A, 25 -> Z, 26 -> AA … grid bubble letters. */
const gridLetter = (n: number) => {
  let s = "";
  let i = n + 1;
  while (i > 0) { i--; s = String.fromCharCode(65 + (i % 26)) + s; i = Math.floor(i / 26); }
  return s;
};

/* Sticky price bar for <xl screens, where the price panel sits far below the
   fold. Mirrors the Shed/Deck PriceBar pattern — duplicated locally on
   purpose so this file has no dependency on the other designers. */
/** Estimates are gated for guests — sign in reveals the live number. */
const requestSignIn = () => window.dispatchEvent(new CustomEvent("mvs-signin"));

function MobilePriceBar({ label, total }: { label: string; total: number }) {
  const { user } = useAuth();
  const shown = useAnimatedNumber(total);
  return (
    <div className="sticky top-0 z-20 -mx-1 mb-3 px-1 xl:hidden">
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

/** The big estimate figure — money for signed-in accounts, a gate for guests. */
function EstimateFigure({ shown }: { shown: number }) {
  const { user } = useAuth();
  if (user) return <>{money(shown)}</>;
  return (
    <button onClick={requestSignIn}
      className="rounded-[6px] bg-[hsl(var(--safety-hi))] px-3 py-1.5 text-[15px] font-bold text-[hsl(var(--marine-2))] hover:brightness-105">
      Sign in to view estimate
    </button>
  );
}

const DISCLAIMER_1 = "PRELIMINARY — FOR PRICING AND REVIEW ONLY. NOT FOR CONSTRUCTION.";
const DISCLAIMER_2 = "Sealed shop drawings and calculations by a licensed engineer are a separate line item (MVS-RSE-SHP).";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #rs-print-sheet, #rs-print-sheet * { visibility: visible !important; }
  #rs-print-sheet { position: fixed !important; inset: 0 !important; width: 100vw !important;
    overflow: visible !important; border: 0 !important; margin: 0 !important; }
  #rs-print-sheet svg { min-width: 0 !important; width: 100% !important; height: auto !important; }
}
@page { size: letter landscape; margin: 8mm; }
`;

function HDim({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y - 9} x2={x1} y2={y + 4} stroke={INK} strokeWidth={0.7} />
      <line x1={x2} y1={y - 9} x2={x2} y2={y + 4} stroke={INK} strokeWidth={0.7} />
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={INK} strokeWidth={0.8}
        markerStart="url(#rsArr)" markerEnd="url(#rsArr)" />
      <text x={(x1 + x2) / 2} y={y - 4} textAnchor="middle" fontSize={10} fill={INK} className="mono">{label}</text>
    </g>
  );
}

function VDim({ x, y1, y2, label }: { x: number; y1: number; y2: number; label: string }) {
  const my = (y1 + y2) / 2;
  return (
    <g>
      <line x1={x - 4} y1={y1} x2={x + 9} y2={y1} stroke={INK} strokeWidth={0.7} />
      <line x1={x - 4} y1={y2} x2={x + 9} y2={y2} stroke={INK} strokeWidth={0.7} />
      <line x1={x} y1={y1} x2={x} y2={y2} stroke={INK} strokeWidth={0.8}
        markerStart="url(#rsArr)" markerEnd="url(#rsArr)" />
      <text x={x - 6} y={my} textAnchor="middle" fontSize={10} fill={INK} className="mono"
        transform={`rotate(-90 ${x - 6} ${my})`}>{label}</text>
    </g>
  );
}

function ViewTitle({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return (
    <g>
      <text x={x} y={y} fontSize={12} fontWeight={700} fill={NAVY} letterSpacing="0.08em" className="mono">{children}</text>
      <line x1={x} y1={y + 5} x2={x + 300} y2={y + 5} stroke={NAVY} strokeWidth={1.4} />
    </g>
  );
}

/** The S-1 sheet. Every quantity on it comes from the same variables the price
    uses — posts, hat channel LF, panel SF — so the drawing and the quote
    cannot disagree. */
function ShopSheet({ lf, h, bay, posts, hatLf, faceSf, panel, project }: {
  lf: number; h: number; bay: number; posts: number; hatLf: number; faceSf: number;
  panel: (typeof RS.panels)[number]; project: string;
}) {
  const W = 1180, H = 850;
  const x0 = 90, elevW = 990;
  const sx = elevW / Math.max(lf, 1);
  const base = 260;                              // deck line
  const hPx = 96 + Math.min(h, 14) * 6.5;        // NTS vertical scale
  const yTop = base - hPx;

  const postXs: number[] = [];
  for (let i = 0; i < posts; i++) postXs.push(x0 + Math.min(i * bay, lf) * sx);
  const bubbleStep = Math.max(1, Math.ceil(28 / Math.max(bay * sx, 1)));
  const bubbleIdx = postXs.map((_, i) => i).filter(i => i % bubbleStep === 0 || i === posts - 1);

  const hatN = RS.hardware.hatRows(h);
  const ribW = Math.max(6, 0.6 * sx);            // 7.2 in module, exaggerated NTS
  const screws = Math.ceil(faceSf);              // ordered by panel SF
  const hasPanel = panel.id !== "none";

  const bySku = (sku: string) => SCREEN_PARTS.find(s => s.sku === sku)!;
  const panelPart = panel.id === "p26" ? bySku("MVS-RSP-26")
    : panel.id === "p29" ? bySku("MVS-RSP-29") : undefined;

  const sched: string[][] = [
    ["F1", bySku("MVS-RSF-SC3").name, "GALV RD TUBE, 3-MEMBER", lf.toLocaleString(), "LF"],
    ["B1", bySku("MVS-RSB-SQ").name, "ADJUSTABLE, BOLTED", String(posts), "EA"],
    ["H1", bySku("MVS-RSH-HAT").name, `20 GA GALV — ${hatN} ROWS`, hatLf.toLocaleString(), "LF"],
    hasPanel
      ? ["P1", panelPart ? panelPart.name : panel.name, `${panel.ga} GA × ${panel.thick.toFixed(4)}″`, faceSf.toLocaleString(), "SF"]
      : ["P1", "Screen panel — by others", "—", "—", "—"],
    ...(hasPanel ? [["S1", bySku("MVS-RSS-STC").name, "#12 SD, BONDED WASHER", screws.toLocaleString(), "EA"]] : []),
  ];

  // schedule geometry
  const colX = [40, 104, 640, 880, 1020, 1140];
  const ys = 520, headH = 18, rowH = 19;
  const tabBot = ys + headH + sched.length * rowH;

  // plan geometry
  const yc = 394;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 980, display: "block" }}
      role="img" aria-label={`Shop drawing S-1 — ${lf} LF × ${fmtFtIn(h)} roof screen elevation, plan and member schedule`}>
      <defs>
        <marker id="rsArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7"
          orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={INK} />
        </marker>
        <pattern id="rsRibs" width={ribW} height={10} patternUnits="userSpaceOnUse">
          <rect width={ribW} height={10} fill="#fff" />
          <line x1={0.6} y1={0} x2={0.6} y2={10} stroke={INK3} strokeWidth={1} />
          <line x1={ribW / 2} y1={0} x2={ribW / 2} y2={10} stroke="hsl(var(--rule))" strokeWidth={0.6} />
        </pattern>
      </defs>

      {/* sheet + frames */}
      <rect x={0} y={0} width={W} height={H} fill="#fff" />
      <rect x={6} y={6} width={W - 12} height={H - 12} fill="none" stroke={NAVY} strokeWidth={1} />
      <rect x={18} y={18} width={W - 36} height={H - 36} fill="none" stroke={NAVY} strokeWidth={2} />

      {/* ------------------------------------------------------- ELEVATION */}
      {/* panel field with rib hatching */}
      {hasPanel ? (
        <rect x={x0} y={yTop + 3} width={lf * sx} height={hPx - 6} fill="url(#rsRibs)"
          stroke={INK3} strokeWidth={0.6} />
      ) : (
        <g>
          <rect x={x0} y={yTop + 3} width={lf * sx} height={hPx - 6} fill="#fff"
            stroke={INK3} strokeWidth={0.6} strokeDasharray="5 4" />
          <text x={x0 + (lf * sx) / 2} y={yTop + hPx / 2 + 3} textAnchor="middle" fontSize={11}
            fill={INK3} className="mono">PANEL BY OTHERS</text>
        </g>
      )}

      {/* hat channel rows, hidden behind the panel */}
      {Array.from({ length: hatN }, (_, i) => {
        const y = yTop + ((i + 1) * hPx) / (hatN + 1);
        return <line key={i} x1={x0} y1={y} x2={x0 + lf * sx} y2={y}
          stroke={INK3} strokeWidth={0.8} strokeDasharray="7 4" />;
      })}

      {/* top rail */}
      <line x1={x0} y1={yTop} x2={x0 + lf * sx} y2={yTop} stroke={INK} strokeWidth={3} />

      {/* posts + bases */}
      {postXs.map((px, i) => (
        <g key={i}>
          <rect x={px - 2} y={yTop} width={4} height={hPx} fill={INK} />
          <rect x={px - 7} y={base - 5} width={14} height={5} fill="#fff" stroke={INK} strokeWidth={1} />
        </g>
      ))}

      {/* deck line with hatch ticks */}
      <line x1={x0 - 24} y1={base} x2={x0 + elevW + 24} y2={base} stroke={INK} strokeWidth={2} />
      {Array.from({ length: Math.floor((elevW + 48) / 22) }, (_, i) => {
        const tx = x0 - 22 + i * 22;
        return <line key={i} x1={tx} y1={base} x2={tx - 9} y2={base + 9} stroke={INK3} strokeWidth={0.7} />;
      })}

      {/* grid bubbles — gold, one per post (thinned when bays get tight) */}
      {bubbleIdx.map(i => (
        <g key={i}>
          <line x1={postXs[i]} y1={yTop - 19} x2={postXs[i]} y2={yTop - 2} stroke={INK3} strokeWidth={0.7} />
          <circle cx={postXs[i]} cy={yTop - 30} r={11} fill="#fff" stroke={GOLD} strokeWidth={1.8} />
          <text x={postXs[i]} y={yTop - 26.5} textAnchor="middle" fontSize={9.5} fontWeight={700}
            fill={INK} className="mono">{gridLetter(i)}</text>
        </g>
      ))}

      {/* elevation dims */}
      <VDim x={56} y1={yTop} y2={base} label={`${fmtFtIn(h)} HT`} />
      <HDim x1={x0} x2={x0 + Math.min(bay, lf) * sx} y={base + 34} label={`${fmtFtIn(bay)} BAY TYP`} />
      <HDim x1={x0} x2={x0 + lf * sx} y={base + 64} label={`${fmtFtIn(lf)} OVERALL — ${lf} LF`} />
      <text x={x0 + elevW} y={base + 38} textAnchor="end" fontSize={9.5} fill={INK3} className="mono">
        {hasPanel ? `PANEL: ${panel.ga} GA RIB, 7.2″ MODULE — ${hatN} HAT ROWS` : `FRAME ONLY — ${hatN} HAT ROWS`}
      </text>
      <ViewTitle x={40} y={344}>ELEVATION — SCREEN FACE — NTS</ViewTitle>

      {/* ------------------------------------------------------------ PLAN */}
      <line x1={x0 - 24} y1={yc - 14} x2={x0 + elevW + 24} y2={yc - 14} stroke={INK3} strokeWidth={0.7} />
      <line x1={x0 - 24} y1={yc + 14} x2={x0 + elevW + 24} y2={yc + 14} stroke={INK3} strokeWidth={0.7} />
      <line x1={x0 - 24} y1={yc} x2={x0 + elevW + 24} y2={yc} stroke={INK} strokeWidth={0.8}
        strokeDasharray="16 4 3 4" />
      {postXs.map((px, i) => (
        <g key={i}>
          <rect x={px - 8} y={yc - 8} width={16} height={16} fill="#fff" stroke={INK} strokeWidth={1.1} />
          <circle cx={px} cy={yc} r={2.6} fill={INK} />
        </g>
      ))}
      <HDim x1={x0} x2={x0 + Math.min(bay, lf) * sx} y={yc + 42} label={`${fmtFtIn(bay)} O.C. TYP`} />
      <HDim x1={x0} x2={x0 + lf * sx} y={yc + 68} label={`${fmtFtIn(lf)} — ${posts} BASE PLATES`} />
      <ViewTitle x={40} y={490}>PLAN — BASE PLATE LAYOUT — NTS</ViewTitle>

      {/* ------------------------------------------------- MEMBER SCHEDULE */}
      <text x={40} y={ys - 7} fontSize={12} fontWeight={700} fill={NAVY} letterSpacing="0.08em"
        className="mono">MEMBER SCHEDULE</text>
      <line x1={colX[0]} y1={ys} x2={colX[5]} y2={ys} stroke={NAVY} strokeWidth={1.6} />
      <line x1={colX[0]} y1={ys + headH} x2={colX[5]} y2={ys + headH} stroke={NAVY} strokeWidth={1.2} />
      {["MARK", "MEMBER", "SIZE / GAUGE", "QTY", "UNIT"].map((c, i) => (
        <text key={c} x={i === 3 ? colX[4] - 8 : colX[i] + 8} y={ys + 13}
          textAnchor={i === 3 ? "end" : "start"} fontSize={9.5} fontWeight={700} fill={NAVY}
          className="mono">{c}</text>
      ))}
      {sched.map((r, ri) => {
        const ry = ys + headH + ri * rowH;
        return (
          <g key={r[0]} className="mono">
            <line x1={colX[0]} y1={ry + rowH} x2={colX[5]} y2={ry + rowH}
              stroke={ri === sched.length - 1 ? NAVY : "hsl(var(--rule))"}
              strokeWidth={ri === sched.length - 1 ? 1.6 : 0.7} />
            <text x={colX[0] + 8} y={ry + 13.5} fontSize={9.5} fontWeight={700} fill={INK}>{r[0]}</text>
            <text x={colX[1] + 8} y={ry + 13.5} fontSize={9.5} fill={INK}>{r[1]}</text>
            <text x={colX[2] + 8} y={ry + 13.5} fontSize={9.5} fill={INK}>{r[2]}</text>
            <text x={colX[4] - 8} y={ry + 13.5} textAnchor="end" fontSize={9.5} fill={INK}>{r[3]}</text>
            <text x={colX[4] + 8} y={ry + 13.5} fontSize={9.5} fill={INK}>{r[4]}</text>
          </g>
        );
      })}
      {colX.map((cx0, i) => (
        <line key={i} x1={cx0} y1={ys} x2={cx0} y2={tabBot} stroke={i === 0 || i === 5 ? NAVY : "hsl(var(--rule))"}
          strokeWidth={i === 0 || i === 5 ? 1.2 : 0.7} />
      ))}
      <text x={40} y={tabBot + 16} fontSize={8.5} fill={INK3} className="mono">
        QUANTITIES COMPUTED FROM THE PRICED CONFIGURATION — {lf} LF × {fmtFtIn(h)} HIGH,
        {" "}{fmtFtIn(bay)} BAYS, {posts} POSTS. THE SCHEDULE AND THE QUOTE SHARE ONE CALCULATION.
      </text>

      {/* ------------------------------------------------------ DISCLAIMER */}
      <rect x={40} y={660} width={1100} height={44} fill="none" stroke={NAVY} strokeWidth={1.2} />
      <text x={52} y={678} fontSize={9.5} fontWeight={700} fill={INK} className="mono">{DISCLAIMER_1}</text>
      <text x={52} y={694} fontSize={9.5} fill={INK} className="mono">{DISCLAIMER_2}</text>

      {/* ----------------------------------------------------- TITLE BLOCK */}
      <line x1={18} y1={712} x2={W - 18} y2={712} stroke={NAVY} strokeWidth={2} />
      {[560, 800, 950].map(vx => (
        <line key={vx} x1={vx} y1={712} x2={vx} y2={H - 18} stroke={NAVY} strokeWidth={1} />
      ))}
      <text x={34} y={752} fontSize={19} fontWeight={800} fill={NAVY} className="disp">
        MISTY VALLEY SUPPLY — SHOP FABRICATION
      </text>
      <text x={34} y={776} fontSize={9} fill={INK3} className="mono">
        SHOP-FABRICATED ROOF SCREEN — {RS.bod.frame.toUpperCase()} EQUAL, FRAME FABRICATED FLAT AND SET IN SECTIONS
      </text>
      <text x={34} y={792} fontSize={9} fill={INK3} className="mono">
        NOT ENGINEER-SEALED. SEALED DRAWINGS + CALCS QUOTED SEPARATELY.
      </text>

      <text x={572} y={734} fontSize={8} fontWeight={700} fill={NAVY} letterSpacing="0.1em" className="mono">PROJECT</text>
      <text x={572} y={752} fontSize={11} fill={INK} className="mono">{project || "________________________"}</text>
      <text x={572} y={776} fontSize={8} fontWeight={700} fill={NAVY} letterSpacing="0.1em" className="mono">CONFIGURATION</text>
      <text x={572} y={792} fontSize={9.5} fill={INK} className="mono">
        {lf} LF × {fmtFtIn(h)} — {fmtFtIn(bay)} BAY — {hasPanel ? `${panel.ga} GA PANEL` : "FRAME ONLY"}
      </text>

      <text x={812} y={734} fontSize={8} fontWeight={700} fill={NAVY} letterSpacing="0.1em" className="mono">DATE</text>
      <text x={812} y={748} fontSize={10} fill={INK} className="mono">{new Date().toLocaleDateString("en-US")}</text>
      <text x={812} y={770} fontSize={8} fontWeight={700} fill={NAVY} letterSpacing="0.1em" className="mono">SCALE</text>
      <text x={812} y={784} fontSize={10} fill={INK} className="mono">NTS</text>
      <text x={812} y={806} fontSize={8} fontWeight={700} fill={NAVY} letterSpacing="0.1em" className="mono">DRAWN BY</text>
      <text x={812} y={820} fontSize={10} fill={INK} className="mono">CONFIGURATOR</text>

      <text x={1056} y={740} textAnchor="middle" fontSize={8} fontWeight={700} fill={NAVY}
        letterSpacing="0.14em" className="mono">SHEET</text>
      <text x={1056} y={800} textAnchor="middle" fontSize={44} fontWeight={800} fill={NAVY}
        className="disp">S-1</text>
    </svg>
  );
}

/* ------------------------------------------------------- design center */

export type QuoteConfig = {
  lf: number; height: number; bay: number; mount: string; panel: string;
  gauge: number; drawings: boolean; markupPct: number;
};

type Contact = { name: string; company: string; email: string; phone: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fmtPhone = (d: string) => `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;

const FINE_PRINT =
  "Prototype — email/SMS delivery connects at launch; your request is saved for the counter to call back.";

/** Append a record to a localStorage array key. Failure is non-fatal. */
function saveLead(key: string, rec: Record<string, unknown>) {
  try {
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    const arr = Array.isArray(prev) ? prev : [];
    arr.push(rec);
    localStorage.setItem(key, JSON.stringify(arr));
  } catch {
    /* storage unavailable — the confirmation still shows; nothing else to do */
  }
}

/** Contact + SMS-consent form used by both the quote gate and the spec flow. */
function LeadForm({ cta, onDone }: { cta: string; onDone: (c: Contact) => void }) {
  const [f, setF] = React.useState({ name: "", company: "", email: "", phone: "", consent: false });
  const [err, setErr] = React.useState("");
  const set = (k: string, v: string | boolean) => setF(x => ({ ...x, [k]: v }));

  const submit = () => {
    const digits = f.phone.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
    if (!f.name.trim()) return setErr("Your name is required.");
    if (!EMAIL_RE.test(f.email.trim())) return setErr("Enter a valid email address.");
    if (!/^\d{10}$/.test(digits)) return setErr("Enter a 10-digit US mobile number.");
    if (!f.consent) return setErr("The text-message consent box is required.");
    setErr("");
    onDone({ name: f.name.trim(), company: f.company.trim(), email: f.email.trim(), phone: digits });
  };

  return (
    <div className="grid gap-2.5">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Name">
          <input value={f.name} onChange={e => set("name", e.target.value)} className={inputCls}
            autoComplete="name" placeholder="Joey Allee" />
        </Field>
        <Field label="Company">
          <input value={f.company} onChange={e => set("company", e.target.value)} className={inputCls}
            autoComplete="organization" placeholder="R&B Roofing" />
        </Field>
      </div>
      <Field label="Email">
        <input value={f.email} onChange={e => set("email", e.target.value)} className={inputCls}
          type="email" inputMode="email" autoComplete="email" placeholder="you@company.com" />
      </Field>
      <Field label="Mobile phone">
        <input value={f.phone} onChange={e => set("phone", e.target.value)} className={inputCls}
          type="tel" inputMode="tel" autoComplete="tel" placeholder="(270) 555-0142" />
      </Field>
      <label className="flex min-h-[44px] items-start gap-2.5 py-1 text-[13px] leading-[1.45]">
        <input type="checkbox" checked={f.consent} onChange={e => set("consent", e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--safety))]" />
        <span>Text me this quote and delivery updates at this number</span>
      </label>
      {err && <p role="alert" className="text-[13px] font-medium text-[hsl(var(--bad))]">{err}</p>}
      <Btn className="w-full" onClick={submit}>{cta}</Btn>
    </div>
  );
}

/** Signed-in: straight to confirmation. Signed-out: inline lead form first. */
function QuoteGate({ config, sell }: { config: QuoteConfig; sell: number }) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [sent, setSent] = React.useState<{ q: string; to: string } | null>(null);

  const finish = (to: string) =>
    setSent({ q: `Q-${Math.floor(1000 + Math.random() * 9000)}`, to });

  if (sent) return (
    <div data-testid="quote-confirm">
      <Tag tone="good">On its way</Tag>
      <p className="mt-2 text-[13px] leading-[1.55]">
        Quote <span className="mono font-semibold">{sent.q}</span> is on its way to{" "}
        <span className="font-medium">{sent.to}</span>.
      </p>
      <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">{FINE_PRINT}</p>
    </div>
  );

  if (!user && open) return (
    <div>
      <Lab kicker className="mb-2">Where do we send it?</Lab>
      <LeadForm cta="Send my quote" onDone={c => {
        saveLead("mvs-quote-leads", {
          ts: Date.now(), config, sell,
          name: c.name, company: c.company, email: c.email, phone: c.phone,
        });
        finish(`${c.email} and ${fmtPhone(c.phone)}`);
      }} />
    </div>
  );

  return (
    <Btn className="w-full" onClick={() => {
      if (user) {
        const email = (user as { email?: string }).email;
        finish(email || `the email on file for ${user.company} (${user.acct})`);
      } else setOpen(true);
    }}>
      Text + email me this quote
    </Btn>
  );
}

/* ------------------------------------------------- spec / drawing upload */

type SpecFile = { name: string; size: number; type: string; thumb?: string; preview?: string };

const fmtKb = (b: number) => b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

/** “Design from your spec” — dropzone, BoD confirmation, then the same gate. */
function SpecCard({ lf, h, config, sell }: { lf: number; h: number; config: QuoteConfig; sell: number }) {
  const { user } = useAuth();
  const [files, setFiles] = React.useState<SpecFile[]>([]);
  const [drag, setDrag] = React.useState(false);
  const [bod, setBod] = React.useState("");
  const [slf, setSlf] = React.useState("");
  const [sh, setSh] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [gate, setGate] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [sent, setSent] = React.useState<string | null>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const ok = Array.from(incoming)
      .filter(f => /^(application\/pdf|image\/jpeg|image\/png)$/.test(f.type) || /\.(pdf|jpe?g|png)$/i.test(f.name))
      .slice(0, Math.max(0, 8 - files.length));
    if (!ok.length) return;
    if (files.length === 0) { setSlf(String(lf)); setSh(String(h)); } // prefill from the configurator
    ok.forEach(f => {
      const meta: SpecFile = { name: f.name, size: f.size, type: f.type };
      const push = (extra?: Partial<SpecFile>) =>
        setFiles(prev => prev.some(x => x.name === meta.name && x.size === meta.size)
          ? prev : [...prev, { ...meta, ...extra }]);
      if (f.type.startsWith("image/")) {
        const r = new FileReader();
        r.onload = () => {
          const url = typeof r.result === "string" ? r.result : undefined;
          // store the dataURL as the saved thumbnail only when it stays small
          push({ preview: url, thumb: url && url.length < 200_000 ? url : undefined });
        };
        r.onerror = () => push();
        r.readAsDataURL(f);
      } else push();
    });
  };

  const save = (contact: Contact) => {
    saveLead("mvs-design-requests", {
      ts: Date.now(),
      files: files.map(({ name, size, type, thumb }) => (thumb ? { name, size, type, thumb } : { name, size, type })),
      bod: { line: bod.trim(), lf: Number(slf) || lf, height: Number(sh) || h, notes: notes.trim() },
      config, sell, contact,
    });
    setSent(`D-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const submit = () => {
    if (!bod.trim()) return setErr("Name the spec section or basis-of-design line — even a guess helps.");
    setErr("");
    if (user) {
      save({
        name: user.name, company: user.company,
        email: (user as { email?: string }).email || `on file — ${user.acct}`, phone: "",
      });
    } else setGate(true);
  };

  return (
    <Panel className="mt-6 card-hi" pad={false}>
      <div className="tape h-1.5" />
      <div className="p-5">
        <Lab kicker className="mb-1.5 !text-[hsl(var(--safety-2))]">Design from your spec</Lab>

        {sent ? (
          <div data-testid="spec-confirm">
            <Tag tone="good">Received</Tag>
            <p className="mt-2 max-w-[60ch] text-[13px] leading-[1.55]">
              Design request <span className="mono font-semibold">{sent}</span> received — a
              fabricator reviews your spec and your quote follows by email and text.
            </p>
            <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">{FINE_PRINT}</p>
          </div>
        ) : (
          <>
            <p className="mb-3 max-w-[64ch] text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
              Drop the spec section or the screen detail here.{" "}
              <strong>We design from your basis of design</strong> — our shop-fabricated frame is
              furnished as an equal to the named BoD, and the formal substitution goes to the
              architect with our shop drawings and sealed calcs.
            </p>

            {/* dropzone */}
            <label
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
              className={cx(
                "flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-1 rounded-[6px] border-2 border-dashed p-4 text-center transition-colors",
                drag ? "border-[hsl(var(--safety))] bg-[hsl(var(--safety-soft))]"
                     : "border-[hsl(var(--field))] hover:border-[hsl(var(--marine))]")}>
              <span className="text-[13px] font-semibold text-[hsl(var(--marine))]">
                ＋ Drop PDF / JPG / PNG here, or tap to browse
              </span>
              <span className="text-[11px] text-[hsl(var(--ink-3))]">
                Spec pages, screen details, roof plans — up to 8 files ({files.length}/8)
              </span>
              <input type="file" multiple data-testid="spec-input"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={e => { addFiles(e.target.files ?? []); e.target.value = ""; }}
                aria-label="Upload spec pages or drawings (PDF, JPG or PNG)" className="sr-only" />
            </label>

            {/* file list */}
            {files.length > 0 && (
              <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`}
                    className="flex min-h-[44px] items-center gap-2.5 rounded-[5px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-2">
                    {f.preview ? (
                      <img src={f.preview} alt={f.name}
                        className="h-10 w-10 shrink-0 rounded-[3px] border border-[hsl(var(--rule))] object-cover" />
                    ) : (
                      <span className="mono grid h-10 w-10 shrink-0 place-items-center rounded-[3px] bg-[hsl(var(--marine-soft))] text-[10px] font-bold text-[hsl(var(--marine))]">
                        PDF
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{f.name}</span>
                      <span className="text-[11px] text-[hsl(var(--ink-3))]">{fmtKb(f.size)}</span>
                    </span>
                    <button onClick={() => setFiles(x => x.filter((_, k) => k !== i))}
                      aria-label={`Remove ${f.name}`}
                      className="grid h-11 w-11 shrink-0 place-items-center text-[13px] text-[hsl(var(--ink-3))] hover:text-[hsl(var(--ink))]">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* basis-of-design confirmation, once there is something to review */}
            {files.length > 0 && (
              <div className="mt-4">
                <Rule className="mb-4" />
                <Lab className="mb-2.5">Confirm the basis of design</Lab>
                <div className="grid gap-2.5">
                  <Field label="Spec section / BoD product line">
                    <input value={bod} onChange={e => setBod(e.target.value)} className={inputCls}
                      data-testid="spec-bod" placeholder='e.g. "RoofScreen SC3 + 7.2 Rib" or "07 42 13"' />
                  </Field>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <Field label="Screen length (LF)">
                      <input type="number" min={0} value={slf} onChange={e => setSlf(e.target.value)}
                        className={inputCls} />
                    </Field>
                    <Field label="Height above deck (FT)">
                      <input type="number" min={0} step={0.5} value={sh} onChange={e => setSh(e.target.value)}
                        className={inputCls} />
                    </Field>
                  </div>
                  <Field label="Notes">
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                      placeholder="Wind zone, color, schedule, what the architect cares about…"
                      className="w-full rounded-[5px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-2.5 text-[13px] outline-none focus:border-[hsl(var(--safety-2))]" />
                  </Field>
                </div>
                {err && <p role="alert" className="mt-2 text-[13px] font-medium text-[hsl(var(--bad))]">{err}</p>}
                {gate && !user ? (
                  <div className="mt-3">
                    <Rule className="mb-3" />
                    <Lab kicker className="mb-2">Where do we send the design review?</Lab>
                    <LeadForm cta="Send spec for design review" onDone={save} />
                  </div>
                ) : (
                  <Btn className="mt-3 w-full" onClick={submit}>Send spec for design review</Btn>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}

export default function Screen({ initial }: { initial?: Partial<QuoteConfig> }) {
  // initial comes off the wire (saved design / share link) — re-validated
  const [lf, setLf] = React.useState(pickNum(initial?.lf, 10, 4000, RS.lee.lf));
  const [h, setH] = React.useState(pickOne(initial?.height, RS.heights, RS.lee.height));
  const [bay, setBay] = React.useState(pickNum(initial?.bay, 2, 12, RS.lee.bay));
  const [mount, setMount] = React.useState(pickOne(initial?.mount, RS.mounts.map(m => m.id), RS.mounts[0].id));
  const [panel, setPanel] = React.useState(pickOne(initial?.panel, RS.panels.map(x => x.id), RS.panels[0].id));
  const [drawings, setDrawings] = React.useState(pickBool(initial?.drawings, true));
  const [markup, setMarkup] = React.useState(pickNum(initial?.markupPct, 0, 400, Math.round(RS.defaultMarkup * 100)));
  const [mode, setMode] = React.useState<"design" | "kit" | "drawing" | "parts">("design");
  const [project, setProject] = React.useState("");
  const [shots, setShots] = React.useState<{ name: string; url: string }[]>([]);
  const [notes, setNotes] = React.useState("");
  const [reqSent, setReqSent] = React.useState(false);
  // Cost, markup and margin are internal economics — customers never see them.
  const { can, user } = useAuth();
  const internal = can("cost.view");

  const addShots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files ?? []).slice(0, 6 - shots.length);
    setShots(x => [...x, ...fs.map(f => ({ name: f.name, url: URL.createObjectURL(f) }))]);
    e.target.value = "";
  };

  const p = RS.panels.find(x => x.id === panel)!;
  const m = RS.mounts.find(x => x.id === mount)!;

  /* remembers the last real panel so the frame-only toggle can restore it */
  const lastPanel = React.useRef(panel !== "none" ? panel : RS.panels[0].id);
  React.useEffect(() => { if (panel !== "none") lastPanel.current = panel; }, [panel]);

  const faceSf = lf * h;
  const posts = Math.max(2, Math.ceil(lf / bay) + 1);
  const hatLf = lf * RS.hardware.hatRows(h);

  /* The $38.50/LF frame rate is what a fab shop quotes: tube, bases, hat
     channel and fasteners in one number. Only a non-standard mount adds. */
  const cost = {
    frame: Math.round(RS.frameCostLf(h) * lf),
    mount: Math.round(m.adder * lf),
    panel: Math.round(p.costSf * faceSf),
    eng: drawings ? Math.round(RS.shopDrawings.base + RS.shopDrawings.perLf * lf) : 0,
  };
  const totalCost = Object.values(cost).reduce((a, b) => a + b, 0);
  const sell = Math.round(totalCost * (1 + markup / 100));
  const sellShown = Math.round(useAnimatedNumber(sell)); // display-only tween of the sell figure
  const gm = sell ? (sell - totalCost) / sell : 0;

  const quoteConfig: QuoteConfig = {
    lf, height: h, bay, mount, panel: p.id, gauge: p.ga, drawings, markupPct: markup,
  };

  const rows: [string, string, number][] = [
    ["Frame package", `${lf} LF × ${h}′ @ ${usd2(RS.frameCostLf(h))}/LF — tube, ${posts} bases, ${hatLf.toLocaleString()} LF hat channel, fasteners`, cost.frame],
    ["Mount adder", m.adder ? m.name.toLowerCase() : "square base — included", cost.mount],
    ["Panel", p.id === "none" ? "by others" : `${faceSf.toLocaleString()} SF ${p.name}`, cost.panel],
    ["Shop drawings + calcs", drawings ? "sealed, per project" : "not included", cost.eng],
  ];

  return (
    <div>
      <MobilePriceBar
        label={`Roof screen — ${lf} LF × ${fmtFtIn(h)}${p.id === "none" ? " · frame only" : ` · ${p.ga} ga panel`}`}
        total={sell}
      />

      {/* ------------------------------------------------------- kit / parts */}
      <div className="mb-5 flex gap-0 overflow-x-auto border-b border-[hsl(var(--ink))]">
        {(["design", "kit", "drawing", "parts"] as const).map(t => (
          <button key={t} onClick={() => setMode(t)}
            className={cx("disp -mb-0.5 min-h-[44px] shrink-0 whitespace-nowrap border-b-[3px] px-4 py-2.5 text-[15px] font-semibold",
              mode === t ? "border-[hsl(var(--safety))] text-[hsl(var(--ink))]"
                         : "border-transparent text-[hsl(var(--ink-3))]")}>
            {t === "design" ? "Design Center" : t === "kit" ? "Configure a kit"
              : t === "drawing" ? "Shop drawing" : "Buy by the piece"}
          </button>
        ))}
      </div>

      {mode === "design" && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* --------------------------------------------- canvas + controls */}
          <div className="min-w-0">
            <div className="card-hi overflow-hidden rounded-[8px]">
              <div className="h-[260px] md:h-[460px]">
                <React.Suspense fallback={
                  <div className="grid h-full w-full place-items-center bg-[hsl(var(--panel-2))]">
                    <span className="lab">Loading the 3D shop…</span>
                  </div>
                }>
                  <ScreenScene lf={lf} heightFt={h} bayFt={bay} frameOnly={p.id === "none"} gauge={p.ga} />
                </React.Suspense>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 py-2">
                <span className="mono text-[11px] text-[hsl(var(--ink-3))]">
                  {lf} LF × {fmtFtIn(h)} · {fmtFtIn(bay)} bays · {posts} posts ·{" "}
                  {p.id === "none" ? "frame only" : `${p.ga} ga panel`}
                </span>
                <span className="text-[11px] text-[hsl(var(--ink-3))]">drag to orbit · scroll to zoom</span>
              </div>
            </div>

            <div className="mt-3">
              <SaveShare tool="screen" params={{ ...quoteConfig }} label={`Roof screen ${lf} LF × ${fmtFtIn(h)}`} />
            </div>

            {/* controls — the same shared state every tab prices from */}
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Screen length (LF)">
                <input type="number" min={10} max={4000} value={lf}
                  onChange={e => setLf(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
              </Field>
              <Field label="Bay spacing (FT)">
                <input type="number" min={2} max={12} step={0.5} value={bay}
                  onChange={e => setBay(Math.min(12, Math.max(2, Number(e.target.value) || RS.lee.bay)))}
                  className={inputCls} />
              </Field>
              <Field label="Screen height above deck">
                <div className="flex flex-wrap gap-1.5">
                  {RS.heights.map(x => (
                    <button key={x} onClick={() => setH(x)}
                      className={cx("h-11 min-w-[52px] flex-1 border px-1 text-[13px]",
                        h === x ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                                : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                      {x === 3.5 ? "3′-6″" : `${x}′`}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Panel gauge">
                <div className="flex flex-wrap gap-1.5">
                  {RS.panels.filter(x => x.id !== "none").map(x => (
                    <button key={x.id} onClick={() => { setPanel(x.id); lastPanel.current = x.id; }}
                      className={cx("h-11 flex-1 border px-2 text-[13px] whitespace-nowrap",
                        panel === x.id ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                                       : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                      {`${x.ga} ga${x.id === "perf" ? " perf" : ""}`}
                    </button>
                  ))}
                </div>
                <label className="mt-1.5 flex min-h-[44px] items-center gap-2.5 text-[13px]">
                  <input type="checkbox" checked={panel === "none"}
                    onChange={e => setPanel(e.target.checked ? "none" : lastPanel.current)}
                    className="h-4 w-4 accent-[hsl(var(--safety))]" />
                  <span>Frame only — panel by others</span>
                </label>
              </Field>
            </div>

            <SpecCard lf={lf} h={h} config={quoteConfig} sell={sell} />
          </div>

          {/* --------------------------------- live price, one calculation */}
          <div>
            <Panel className="card-hi xl:sticky xl:top-4" pad={false}>
              <div className="tape h-1.5" />
              <div className="p-5">
                <Lab className="mb-3">Live price — one calculation</Lab>
                {rows.map(([a, b, c]) => (
                  <div key={a} className="mb-2.5 flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div className="disp text-[15px] font-semibold">{a}</div>
                      {internal && <div className="text-[11px] leading-[1.4] text-[hsl(var(--ink-3))]">{b}</div>}
                    </div>
                    {internal && <div className="shrink-0 text-[15px]">{money(c)}</div>}
                  </div>
                ))}
                <Rule className="my-3" />
                <div className="mb-1.5 flex items-baseline justify-between">
                  {internal && <span className="lab">Our cost</span>}
                  {internal && <span className="text-[15px]">{money(totalCost)}</span>}
                </div>
                {internal && (
                  <Field label={`Markup — ${markup}%`}>
                    <input type="range" min={60} max={150} value={markup} aria-label="Markup percent"
                      onChange={e => setMarkup(Number(e.target.value))} className="h-11 w-full" />
                  </Field>
                )}
                <div className="mt-2 flex items-baseline justify-between">
                  <div className="disp text-[18px] font-bold">{internal ? "Sell" : "Your price"}</div>
                  <div className="disp text-[40px] font-bold leading-none text-[hsl(var(--safety))]">
                    <EstimateFigure shown={sellShown} />
                  </div>
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-[hsl(var(--ink-3))]">
                  <span>{user ? `${money(Math.round(sell / Math.max(lf, 1)))}/LF` : "Itemized after sign-in"}</span>
                  {internal && <span>{Math.round(gm * 100)}% GM · {money(sell - totalCost)}</span>}
                </div>
                <Rule className="my-4" />
                <QuoteGate config={quoteConfig} sell={sell} />
                <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                  Same math as the kit tab and the S-1 sheet — the model, the schedule and this
                  price cannot disagree.
                </p>
              </div>
            </Panel>
          </div>
        </div>
      )}

      {mode === "parts" && (
        <>
          <Panel pad={false} className="mb-4">
            <DataTable
              cols={internal
                ? ["SKU", "Item", "UOM", "Unit cost", "Your price", "In kit"]
                : ["SKU", "Item", "UOM", "Your price", "In kit"]}
              right={internal ? [3, 4] : [3]}
              rows={SCREEN_PARTS.map(sp => {
                const row = [
                  <span className="mono text-[hsl(var(--safety-2))]">{sp.sku}</span>,
                  <span>
                    <span className="font-semibold">{sp.name}</span>
                    <span className="mt-0.5 block text-[13px] leading-[1.45] text-[hsl(var(--ink-2))]">{sp.note}</span>
                  </span>,
                  <span className="text-[13px]">{sp.uom}</span>,
                  <span className="text-[13px] text-[hsl(var(--ink-3))]">{usd2(sp.cost)}</span>,
                  <span className="">{usd2(sp.cost * (1 + markup / 100))}</span>,
                  sp.kit ? <Tag tone="good">kit</Tag> : <Tag>add-on</Tag>,
                ];
                return internal ? row : row.filter((_, i) => i !== 3);
              })}
            />
          </Panel>
          {internal && (
            <p className="mb-8 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
              Unit cost is what the part lands at; your price applies the {markup}% markup set in the
              configurator. Move it there and this table moves with it.
            </p>
          )}
        </>
      )}

      {mode === "drawing" && (
        <>
          <style>{PRINT_CSS}</style>

          {/* live inputs — the same state the kit prices from */}
          <div className="mb-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Screen length (LF)">
              <input type="number" min={10} max={4000} value={lf}
                onChange={e => setLf(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
            </Field>
            <Field label="Bay spacing (FT)">
              <input type="number" min={2} max={12} step={0.5} value={bay}
                onChange={e => setBay(Math.min(12, Math.max(2, Number(e.target.value) || RS.lee.bay)))}
                className={inputCls} />
            </Field>
            <Field label="Screen height above deck">
              <div className="flex flex-wrap gap-1.5">
                {RS.heights.map(x => (
                  <button key={x} onClick={() => setH(x)}
                    className={cx("h-11 min-w-[52px] flex-1 border px-1 text-[13px]",
                      h === x ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                              : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    {x === 3.5 ? "3′-6″" : `${x}′`}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Panel gauge">
              <div className="flex flex-wrap gap-1.5">
                {RS.panels.map(x => (
                  <button key={x.id} onClick={() => setPanel(x.id)}
                    className={cx("h-11 flex-1 border px-2 text-[13px] whitespace-nowrap",
                      panel === x.id ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                                     : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    {x.ga ? `${x.ga} ga${x.id === "perf" ? " perf" : ""}` : "frame only"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* the sheet */}
            <div className="min-w-0">
              <div className="mb-3 max-w-[420px]">
                <Field label="Project name (title block)">
                  <input value={project} onChange={e => setProject(e.target.value)}
                    placeholder="e.g. Lee Street — RTU screen" className={inputCls} />
                </Field>
              </div>
              <div id="rs-print-sheet"
                className="overflow-x-auto border border-[hsl(var(--rule))] bg-white shadow-[0_1px_3px_hsl(218_20%_13%/.08)]">
                <ShopSheet lf={lf} h={h} bay={bay} posts={posts} hatLf={hatLf} faceSf={faceSf}
                  panel={p} project={project} />
              </div>
              <p className="mt-3 max-w-[80ch] text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                Parametric sheet, regenerated from the configurator on every change. Post grid,
                hat rows and the member schedule come from the same variables the price uses.
                Preliminary and unsealed — the sealed set is the{" "}
                <span className="mono">MVS-RSE-SHP</span> line.
              </p>
            </div>

            {/* exact pricing, same computation as the kit tab */}
            <div className="max-w-[560px] 2xl:max-w-none">
              <Panel className="2xl:sticky 2xl:top-4 card-hi" pad={false}>
                <div className="tape h-1.5" />
                <div className="p-5">
                  <Lab className="mb-3">Exact pricing — one calculation</Lab>
                  {([
                    ["Frame", `${usd2(RS.frameCostLf(h))}/LF at ${fmtFtIn(h)} × ${lf} LF`, cost.frame],
                    ["Mount", m.adder ? `${m.name.toLowerCase()} — ${usd2(m.adder)}/LF` : "square base — included", cost.mount],
                    ["Panel", p.costSf ? `${usd2(p.costSf)}/SF (${p.ga} ga) × ${faceSf.toLocaleString()} SF` : "by others", cost.panel],
                    ["Drawings + calcs", drawings ? "sealed, per project" : "not included", cost.eng],
                  ] as [string, string, number][]).map(([a, b, c]) => (
                    <div key={a} className="mb-2.5 flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <div className="disp text-[15px] font-semibold">{a}</div>
                        {internal && <div className="text-[11px] leading-[1.4] text-[hsl(var(--ink-3))]">{b}</div>}
                      </div>
                      {internal && <div className="shrink-0 text-[15px]">{money(c)}</div>}
                    </div>
                  ))}
                  <Rule className="my-3" />
                  <div className="mb-1.5 flex items-baseline justify-between">
                    {internal && <span className="lab">Our cost</span>}
                    {internal && <span className="text-[15px]">{money(totalCost)}</span>}
                  </div>
                  {internal && (
                    <Field label={`Markup — ${markup}%`}>
                      <input type="range" min={60} max={150} value={markup} aria-label="Markup percent"
                        onChange={e => setMarkup(Number(e.target.value))} className="h-11 w-full" />
                    </Field>
                  )}
                  <div className="mt-2 flex items-baseline justify-between">
                    <div className="disp text-[18px] font-bold">{internal ? "Sell" : "Your price"}</div>
                    <div className="disp text-[40px] font-bold leading-none text-[hsl(var(--safety))]">
                      <EstimateFigure shown={sellShown} />
                    </div>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-[hsl(var(--ink-3))]">
                    <span>{user ? `${money(Math.round(sell / Math.max(lf, 1)))}/LF` : "Itemized after sign-in"}</span>
                    {internal && <span>{Math.round(gm * 100)}% GM · {money(sell - totalCost)}</span>}
                  </div>
                  <Rule className="my-4" />
                  <Btn className="w-full" onClick={() => window.print()}>Print / save PDF</Btn>
                  <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                    Prints only the S-1 sheet. The schedule quantities and this price share
                    the exact same math — they cannot disagree.
                  </p>
                </div>
              </Panel>
            </div>
          </div>
        </>
      )}

      {mode === "kit" && (
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* configurator */}
        <div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Screen length (LF)">
              <input type="number" min={10} max={4000} value={lf}
                onChange={e => setLf(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
            </Field>
            <Field label="Screen height above deck">
              <div className="flex flex-wrap gap-1.5">
                {RS.heights.map(x => (
                  <button key={x} onClick={() => setH(x)}
                    className={cx("h-11 min-w-[52px] flex-1 border px-1 text-[13px]",
                      h === x ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                              : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    {x === 3.5 ? "3′-6″" : `${x}′`}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Post support">
              <div className="grid gap-1.5">
                {RS.mounts.map(x => (
                  <button key={x.id} onClick={() => setMount(x.id)}
                    className={cx("min-h-[44px] border p-2.5 text-left",
                      mount === x.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                     : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    <div className="disp text-[15px] font-semibold">{x.name}</div>
                    <div className="text-[13px] leading-[1.4] text-[hsl(var(--ink-2))]">{x.note}</div>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Panel">
              <div className="grid gap-1.5">
                {RS.panels.map(x => (
                  <button key={x.id} onClick={() => setPanel(x.id)}
                    className={cx("min-h-[44px] border p-2.5 text-left",
                      panel === x.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                     : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="disp text-[15px] font-semibold">{x.name}</span>
                      <span className="text-[13px] text-[hsl(var(--ink-2))]">
                        {x.costSf ? `${usd2(x.costSf)}/SF` : "—"}
                      </span>
                    </div>
                    <div className="text-[13px] leading-[1.4] text-[hsl(var(--ink-2))]">{x.note}</div>
                    {x.thick > 0 && (
                      <div className="mt-1 text-[11px] text-[hsl(var(--ink-3))]">
                        {x.thick.toFixed(4)} in nominal steel
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Shop drawings and sealed calculations">
              <button onClick={() => setDrawings(!drawings)} aria-pressed={drawings}
                className={cx("flex min-h-[44px] w-full items-start gap-2.5 border p-2.5 text-left",
                  drawings ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                           : "border-[hsl(var(--rule))]")}>
                <span className={cx("mt-px flex h-5 w-5 shrink-0 items-center justify-center border",
                  drawings ? "border-[hsl(var(--safety))] bg-[hsl(var(--safety))] text-white"
                           : "border-[hsl(var(--rule))]")}>{drawings ? "✓" : ""}</span>
                <span className="text-[13px] leading-[1.45]">{RS.shopDrawings.note}</span>
              </button>
            </Field>
            {internal && (
              <Field label={`Markup — ${markup}%`}>
                <input type="range" min={60} max={150} value={markup} aria-label="Markup percent"
                  onChange={e => setMarkup(Number(e.target.value))} className="mt-2 h-11 w-full" />
                <div className="mt-1 flex justify-between text-[11px] text-[hsl(var(--ink-3))]">
                  <span>60% floor</span>
                  <span>Lee Street ran {Math.round(RS.defaultMarkup * 100)}%</span>
                </div>
              </Field>
            )}
          </div>

          {/* the gauge warning, only when it applies */}
          {!p.spec && (
            <Panel className="mt-5 border-l-2 border-l-[hsl(var(--bad))]">
              <Tag tone="warn">Read this before you pick 29 gauge</Tag>
              <p className="mt-2 max-w-[80ch] text-[13px] leading-[1.6]">
                29 ga is {p.thick.toFixed(4)}″ against {RS.panels[0].thick.toFixed(4)}″ for 26 ga —
                roughly a quarter less steel in the part of the assembly with the most wind area
                on the building. It is an agricultural and budget-storage gauge. On this screen
                it saves{" "}
                <strong>{money(Math.round((RS.panels[0].costSf - p.costSf) * faceSf))}</strong>{" "}
                out of a {money(sell)} package — about{" "}
                {Math.round(((RS.panels[0].costSf - p.costSf) * faceSf / Math.max(sell, 1)) * 100)}% —
                and it is the first thing to oil-can, dent and peel back. Sell it where nobody
                specified anything. Do not sell it against a named 7.2 Rib basis of design.
              </p>
            </Panel>
          )}
        </div>

        {/* estimate */}
        <div>
          <Panel className="sticky top-4 card-hi" pad={false}>
            <div className="tape h-1.5" />
            <div className="p-5">
              <Lab className="mb-3">Kit build-up</Lab>
              {rows.map(([a, b, c]) => (
                <div key={a} className="mb-2.5 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="disp text-[15px] font-semibold">{a}</div>
                    {internal && <div className="text-[11px] leading-[1.4] text-[hsl(var(--ink-3))]">{b}</div>}
                  </div>
                  {internal && <div className="shrink-0 text-[15px]">{money(c)}</div>}
                </div>
              ))}
              <Rule className="my-3" />
              <div className="mb-1.5 flex items-baseline justify-between">
                {internal && <span className="lab">Our cost</span>}
                {internal && <span className="text-[15px]">{money(totalCost)}</span>}
              </div>
              <div className="flex items-baseline justify-between">
                <div className="disp text-[18px] font-bold">{internal ? "Sell" : "Your price"}</div>
                <div className="disp text-[40px] font-bold leading-none text-[hsl(var(--safety))]">
                  <EstimateFigure shown={sellShown} />
                </div>
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-[hsl(var(--ink-3))]">
                <span>{user ? `${money(Math.round(sell / Math.max(lf, 1)))}/LF` : "Itemized after sign-in"}</span>
                {internal && <span>{Math.round(gm * 100)}% GM · {money(sell - totalCost)}</span>}
              </div>
              <Rule className="my-4" />
              {reqSent ? (
                <div>
                  <Lab kicker className="mb-1.5">Sent</Lab>
                  <p className="text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                    Your photos and this configuration are with the shop. A real quote
                    follows in two business days.
                  </p>
                </div>
              ) : (
                <div>
                  <Lab kicker className="mb-2">Design it with us</Lab>
                  <p className="text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                    Add photos of the roof and anything you want it to look like — a screen
                    you saw, a drawing detail, the units to hide.
                  </p>
                  {shots.length > 0 && (
                    <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                      {shots.map((f, i) => (
                        <span key={i} className="relative block overflow-hidden rounded-[4px] border border-[hsl(var(--rule))]">
                          <img src={f.url} alt={f.name} className="aspect-square w-full object-cover" />
                          <button onClick={() => setShots(x => x.filter((_, k) => k !== i))}
                            aria-label={`Remove ${f.name}`}
                            className="absolute right-0.5 top-0.5 grid h-7 w-7 place-items-center rounded-[4px] bg-black/55 text-[11px] text-white">✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <label className="mt-2.5 flex min-h-[44px] cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[hsl(var(--field))] text-[13px] font-medium text-[hsl(var(--marine))] hover:border-[hsl(var(--marine))]">
                    ＋ Add photos ({shots.length}/6)
                    <input type="file" accept="image/*" multiple onChange={addShots}
                      aria-label="Add roof and inspiration photos" className="sr-only" />
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    placeholder="Anything the photos don't say — height limits, colors, the architect's mood…"
                    className="mt-2 w-full rounded-[5px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-2.5 text-[13px] outline-none focus:border-[hsl(var(--safety-2))]" />
                  <Btn className="mt-2.5 w-full" onClick={() => setReqSent(true)}>
                    Send the roof plan &amp; photos
                  </Btn>
                  <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                    Budget only until we see the roof plan, equipment schedule and wind load.
                    Photos stay on your device in this prototype.
                  </p>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
      )}

      {/* --------------------------- Lee Street numbers — internal eyes only */}
      {internal && (
        <div className="mt-8 card-hi">
          <div className="tape h-1.5" />
          <div className="p-5">
            <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Built and installed — {RS.proof}</Lab>
            <p className="max-w-[70ch] text-[13px] leading-[1.6] text-[hsl(var(--ink-2))]">
              A {RS.lee.height}′ RTU screen on {RS.bod.detail}. Basis of design{" "}
              <strong>{RS.bod.frame}</strong> frame with a <strong>{RS.bod.panel}</strong> panel.
              Misty Valley had the frame shop-fabricated, bought the panel, and sold the package
              to the roofing contractor. These are the actual numbers.
            </p>
          </div>
          <div className="grid gap-px border-t border-[hsl(var(--rule))] bg-[hsl(var(--rule))] sm:grid-cols-4">
            {([
              ["Frame fabrication", money(RS.lee.frameCost), "cost"],
              ["Panel", money(RS.lee.panelCost), "cost"],
              ["Sold for", money(RS.lee.sell), "price"],
              ["Gross margin", money(RS.lee.sell - RS.lee.frameCost - RS.lee.panelCost),
                `${Math.round(((RS.lee.sell - RS.lee.frameCost - RS.lee.panelCost) / RS.lee.sell) * 100)}% of the sale`],
            ] as const).map(([k, v, s], i) => (
              <div key={k} className="bg-[hsl(var(--panel))] p-4">
                <Lab className="mb-1.5">{k}</Lab>
                <div className={cx("disp text-[28px] font-bold leading-none",
                  i === 3 && "text-[hsl(var(--safety))]")}>{v}</div>
                <div className="mt-1 text-[11px] text-[hsl(var(--ink-3))]">{s}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------------------------------------- the two warnings */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel className="border-l-2 border-l-[hsl(var(--bad))]">
          <Tag tone="warn">A screen base is not a fall-arrest anchor</Tag>
          <p className="mt-2 text-[13px] leading-[1.6]">
            A screen post lands on the deck the same way a roof anchor does, and that is exactly
            why people tie off to them. Do not. OSHA requires a personal fall arrest anchorage to
            hold <strong>5,000 lb per attached worker</strong>, or to be designed and used under a
            qualified person with a safety factor of two —{" "}
            <span className="text-[hsl(var(--safety-2))]">29 CFR 1926.502(d)(15)</span>. A screen
            post base is sized for wind on a panel, not for arresting a falling body. We sell a
            rated anchor (<span className="mono">MVS-RSA-ANC</span>, ANSI/ASSP Z359.18 Type D) that
            uses the same deck attachment and is certified for the load. Sell that as its own line
            and label it on the drawings.
          </p>
        </Panel>
        <Panel className="border-l-2 border-l-[hsl(var(--safety))]">
          <Tag tone="safety">Read this before you substitute</Tag>
          <p className="mt-2 text-[13px] leading-[1.6]">
            When a spec names <strong>{RS.bod.frame}</strong> and <strong>{RS.bod.panel}</strong> as
            the basis of design, our shop-fabricated frame is an <em>equal</em> and going with it is
            a <strong>formal substitution</strong> — it goes to the architect with our shop drawings
            and sealed calculations, before buyout, not after the steel is cut. That is why the
            drawings are a priced line and not a favor. A silent swap is how a sub ends up pulling a
            screen back off a roof at their own cost.
          </p>
        </Panel>
      </div>
    </div>
  );
}
