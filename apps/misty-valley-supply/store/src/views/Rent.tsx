import * as React from "react";
import { RENTALS, type Rental } from "@/data";
import { Glyph } from "@/glyph";
import { useAuth } from "@/auth";
import { Btn, DataTable, Field, Head, Lab, Panel, Rule, Tag, cx, inputCls, money } from "@/ui";

const WAIVER_PCT = 15;

export default function Rent({ onSignIn }: { onSignIn: () => void }) {
  const { user, branch } = useAuth();
  const [picked, setPicked] = React.useState<Record<string, number>>({});
  const [term, setTerm] = React.useState<"day" | "week" | "month">("week");
  const [start, setStart] = React.useState("");
  const [site, setSite] = React.useState("");
  const [sent, setSent] = React.useState<string | null>(null);

  const lines = RENTALS.filter(r => (picked[r.sku] ?? 0) > 0);
  const sub = lines.reduce((s, r) => s + r[term] * (picked[r.sku] ?? 0), 0);
  const waiver = Math.round(sub * WAIVER_PCT) / 100 * (100 / 100);
  const waiverAmt = Math.round(sub * WAIVER_PCT / 100 * 100) / 100;
  const deposit = lines.reduce((s, r) => s + r.deposit * (picked[r.sku] ?? 0), 0);
  const termLabel = term === "day" ? "per day" : term === "week" ? "per week" : "per 4 weeks";

  const set = (sku: string, qty: number, min = 0) =>
    setPicked(p => ({ ...p, [sku]: Math.max(0, qty) === 0 ? 0 : Math.max(min, qty) }));

  return (
    <div>
      <Head
        eyebrow="Rentals"
        title="Rent the edge, keep the margin"
        sub="Guardrail, warning line and covers by the day, week or four-week. Reserved by request, delivered on the route, counted back on the truck. Fall-arrest gear is function-tested and documented both directions."
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-7">
        <div className="min-w-0">
          {/* term picker */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[13px] text-[hsl(var(--ink-2))]">Rates shown</span>
            <div className="flex overflow-hidden rounded-[6px] border border-[hsl(var(--rule))]">
              {(["day", "week", "month"] as const).map(t => (
                <button key={t} onClick={() => setTerm(t)}
                  className={cx("min-h-[44px] px-3.5 text-[13px] font-medium",
                    term === t ? "bg-[hsl(var(--ink))] text-white" : "text-[hsl(var(--ink-2))] hover:bg-[hsl(var(--panel-2))]")}>
                  {t === "day" ? "Day" : t === "week" ? "Week" : "4-Week"}
                </button>
              ))}
            </div>
          </div>

          <Panel pad={false}>
            <DataTable
              cols={["Item", "Rate", "Deposit", "Qty"]}
              right={[1, 2]}
              rows={RENTALS.map(r => [
                <span className="flex items-center gap-3">
                  <span className="plate flex h-14 w-14 shrink-0 items-center justify-center rounded-[6px] border border-[hsl(var(--rule))]">
                    <Glyph sku={r.sku} className="h-[74%] w-[74%]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold leading-[1.25]">{r.name}</span>
                    <span className="mt-0.5 block text-[13px] leading-[1.4] text-[hsl(var(--ink-2))]">{r.note}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {r.minQty && <Tag>min {r.minQty}</Tag>}
                      {r.inspect && <Tag tone="warn">inspected both ways</Tag>}
                    </span>
                  </span>
                </span>,
                <span className="num text-[15px] font-semibold">{money(r[term])}<span className="block text-[11px] font-normal text-[hsl(var(--ink-3))]">{termLabel} / {r.uom}</span></span>,
                <span className="num text-[13px] text-[hsl(var(--ink-2))]">{money(r.deposit)}</span>,
                <input type="number" min={0} value={picked[r.sku] ?? 0}
                  onChange={e => set(r.sku, Number(e.target.value) || 0, r.minQty ?? 0)}
                  aria-label={`Quantity of ${r.name}`}
                  className="num h-11 w-16 rounded-[6px] border border-[hsl(var(--field))] bg-white px-2 text-center text-[15px] outline-none focus:border-[hsl(var(--safety-2))]" />,
              ])}
            />
          </Panel>

          <Panel className="mt-4 border-l-2 border-l-[hsl(var(--warn))]">
            <Lab kicker className="mb-2">Why we inspect what you rent</Lab>
            <p className="max-w-[80ch] text-[13px] leading-[1.6]">
              Steel rents; textiles wait. A returned harness or SRL cannot prove it never
              arrested a fall, and ANSI Z359 wants documented competent-person inspection —
              so fall-arrest gear joins the rental fleet only once our per-asset inspection
              ledger is live. Until then: guardrail, warning line, screens and covers,
              counted out and counted back.
            </p>
          </Panel>
        </div>

        {/* request rail */}
        <aside className="mt-6 lg:mt-0">
          <Panel pad={false} className="card-hi sticky top-4">
            <div className="tape h-1.5" />
            <div className="p-4">
              <Lab kicker className="mb-3">Reserve by request</Lab>
              {sent ? (
                <>
                  <p className="text-[15px] font-semibold">Request {sent} is in.</p>
                  <p className="mt-2 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                    {branch.name} confirms availability and the delivery window by phone —
                    usually within the hour during counter hours.
                  </p>
                  <Btn variant="line" size="sm" className="mt-3 w-full" onClick={() => { setSent(null); setPicked({}); }}>
                    Start another request
                  </Btn>
                </>
              ) : (
                <>
                  {lines.length === 0 && (
                    <p className="mb-3 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                      Set quantities on the left. Nothing is charged online — this is a
                      request the branch confirms.
                    </p>
                  )}
                  {lines.map(r => (
                    <div key={r.sku} className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
                      <span className="min-w-0 truncate">{picked[r.sku]}× {r.name}</span>
                      <span className="num shrink-0">{money(r[term] * (picked[r.sku] ?? 0))}</span>
                    </div>
                  ))}
                  {lines.length > 0 && (
                    <>
                      <Rule className="my-2.5" />
                      <div className="flex items-baseline justify-between text-[13px]">
                        <span>Rental {termLabel}</span><span className="num">{money(sub)}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-[13px] text-[hsl(var(--ink-2))]">
                        <span>Damage waiver ({WAIVER_PCT}%)</span><span className="num">{money(waiverAmt)}</span>
                      </div>
                      <div className="flex items-baseline justify-between text-[13px] text-[hsl(var(--ink-2))]">
                        <span>Refundable deposit</span><span className="num">{money(deposit)}</span>
                      </div>
                    </>
                  )}
                  <div className="mt-3 grid gap-2.5">
                    <Field label="Start date">
                      <input type="date" value={start} onChange={e => setStart(e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Jobsite">
                      <input value={site} onChange={e => setSite(e.target.value)}
                        placeholder="Address or job name" className={inputCls} />
                    </Field>
                  </div>
                  {user ? (
                    <Btn className="mt-3 w-full" disabled={!lines.length || !start || !site.trim()}
                      onClick={() => setSent(`RR-${1000 + Math.floor(Math.random() * 900)}`)}>
                      Send the request
                    </Btn>
                  ) : (
                    <Btn className="mt-3 w-full" onClick={onSignIn}>Sign in to request</Btn>
                  )}
                  <p className="mt-2.5 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                    Certificate of insurance required on delivery rentals. Rates benchmarked against the corridor
                    rental market, Sept 2026.
                  </p>
                </>
              )}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
