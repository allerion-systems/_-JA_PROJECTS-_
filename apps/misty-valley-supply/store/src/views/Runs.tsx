import * as React from "react";
import { useAuth } from "@/auth";
import { Btn, Field, Head, Lab, Panel, Rule, Tag, cx, inputCls, money } from "@/ui";

/* Local counters a runner can be at inside the hour. Demo data. */
const STORES = [
  { id: "low-etown", name: "Lowe's", city: "Elizabethtown", mi: 26 },
  { id: "hd-etown", name: "Home Depot", city: "Elizabethtown", mi: 27 },
  { id: "men-bg", name: "Menards", city: "Bowling Green", mi: 42 },
  { id: "84-etown", name: "84 Lumber", city: "Elizabethtown", mi: 25 },
  { id: "dib-mun", name: "Do It Best", city: "Munfordville", mi: 8 },
];

/* Runner-verified shelf prices — the honest version of "live pricing".
   A runner confirms the shelf tag when they claim the run; every price below
   carries who verified it and when. Demo data. */
const VERIFIED = [
  { item: "OSB 7/16 in 4×8", prices: [["Lowe's", 14.45, "2 h"], ["Home Depot", 13.98, "2 h"], ["Menards", 12.89, "1 d"], ["Misty Valley", 13.75, "now"]] },
  { item: "Stud 2×4×8 SPF", prices: [["Lowe's", 4.25, "2 h"], ["Home Depot", 3.98, "5 h"], ["Menards", 3.66, "1 d"], ["Misty Valley", 3.85, "now"]] },
  { item: "Drywall 1/2 in 4×8", prices: [["Lowe's", 15.48, "4 h"], ["Home Depot", 14.97, "5 h"], ["Menards", 12.99, "1 d"], ["Misty Valley", 13.50, "now"]] },
] as const;

const BASE_FEE = 25, PER_MI = 2, SVC_PCT = 12;

const STEPS = ["Requested", "Claimed", "Shopping", "Price verified", "En route", "On the jobsite"];

export default function Runs({ onSignIn }: { onSignIn: () => void }) {
  const { user } = useAuth();
  const [storeId, setStoreId] = React.useState(STORES[0].id);
  const [list, setList] = React.useState("");
  const [site, setSite] = React.useState("");
  const [est, setEst] = React.useState(350);
  const [placed, setPlaced] = React.useState<string | null>(null);
  const [step, setStep] = React.useState(0);

  const store = STORES.find(s => s.id === storeId)!;
  const runFee = BASE_FEE + store.mi * PER_MI;
  const svc = Math.round(est * SVC_PCT) / 100 * (100 / 100);
  const svcAmt = Math.round(est * SVC_PCT / 100 * 100) / 100;
  const total = est + runFee + svcAmt;

  React.useEffect(() => {
    if (!placed) return;
    if (step >= STEPS.length - 1) return;
    const t = setTimeout(() => setStep(s => s + 1), 1600);
    return () => clearTimeout(t);
  }, [placed, step]);

  return (
    <div>
      <Head
        eyebrow="Material Runs"
        title="Any counter in town, on your jobsite today"
        sub="Send the list. A runner claims it, verifies the shelf price before buying, and runs it to the jobsite. We buy it, we resell it to you on your account — one invoice, your terms."
      />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-7">
        <div className="min-w-0">
          {placed ? (
            <Panel pad={false} className="card-hi">
              <div className="tape h-1.5" />
              <div className="p-5">
                <Lab kicker className="mb-2">Run {placed}</Lab>
                <div className="mb-4 grid gap-0">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-3 py-1.5">
                      <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                        i < step ? "bg-[hsl(var(--good))] text-white"
                        : i === step ? "bg-[hsl(var(--safety-2))] text-white"
                        : "bg-[hsl(var(--panel-2))] text-[hsl(var(--ink-3))]")}>
                        {i < step ? "✓" : i + 1}
                      </span>
                      <span className={cx("text-[14px]", i === step ? "font-semibold" : i < step ? "" : "text-[hsl(var(--ink-3))]")}>
                        {s}{i === 3 && i === step && " — shelf tags photographed"}
                      </span>
                    </div>
                  ))}
                </div>
                {step >= STEPS.length - 1 ? (
                  <p className="text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                    Delivered with a photo of the load on the jobsite. Goods and run fee land on
                    one Misty Valley invoice at your terms.
                  </p>
                ) : (
                  <p className="text-[13px] text-[hsl(var(--ink-3))]">Live demo — a real run updates by text and in your account.</p>
                )}
                <Btn variant="line" size="sm" className="mt-4" onClick={() => { setPlaced(null); setStep(0); }}>
                  Start another run
                </Btn>
              </div>
            </Panel>
          ) : (
            <Panel pad={false}>
              <div className="grid gap-4 p-4 sm:p-5">
                <Field label="Which counter">
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    {STORES.map(s => (
                      <button key={s.id} onClick={() => setStoreId(s.id)}
                        className={cx("flex min-h-[44px] items-center justify-between rounded-[6px] border px-3 text-left",
                          storeId === s.id ? "border-[hsl(var(--safety-2))] bg-[hsl(var(--safety-soft))]" : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                        <span className="text-[14px] font-semibold">{s.name} <span className="font-normal text-[hsl(var(--ink-2))]">· {s.city}</span></span>
                        <span className="num text-[12px] text-[hsl(var(--ink-3))]">{s.mi} mi</span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="The list — paste it like you'd text it">
                  <textarea value={list} onChange={e => setList(e.target.value)} rows={4}
                    placeholder={"25 sheets 7/16 OSB\n3 rolls house wrap\n2 boxes cap nails\nwhatever's on the will-call under Allee"}
                    className="w-full rounded-[5px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-3 text-[14px] outline-none focus:border-[hsl(var(--safety-2))]" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Deliver to">
                    <input value={site} onChange={e => setSite(e.target.value)} placeholder="Jobsite address" className={inputCls} />
                  </Field>
                  <Field label="Rough goods value">
                    <input type="number" min={0} value={est}
                      onChange={e => setEst(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
                  </Field>
                </div>
                <div className="rounded-[6px] bg-[hsl(var(--panel-2))] p-3.5">
                  {[["Goods (runner-verified at the shelf)", est], ["Run fee — $25 + $2/mi × " + store.mi, runFee], [`Service (${SVC_PCT}%)`, svcAmt]].map(([l, v]) => (
                    <div key={l as string} className="mb-1 flex items-baseline justify-between text-[13px]">
                      <span className="text-[hsl(var(--ink-2))]">{l}</span><span className="num">{money(v as number)}</span>
                    </div>
                  ))}
                  <Rule className="my-2" />
                  <div className="flex items-baseline justify-between">
                    <span className="text-[15px] font-semibold">Estimated total</span>
                    <span className="num text-[22px] font-bold">{money(total)}</span>
                  </div>
                </div>
                {user ? (
                  <Btn disabled={!list.trim() || !site.trim()} onClick={() => setPlaced(`MR-${2000 + Math.floor(Math.random() * 900)}`)}>
                    Send the run
                  </Btn>
                ) : (
                  <Btn onClick={onSignIn}>Sign in to send a run</Btn>
                )}
                <p className="text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                  Misty Valley buys the goods and resells them to you — one invoice, your
                  terms, our receipt. If the shelf price beats the estimate, you pay the
                  shelf price.
                </p>
              </div>
            </Panel>
          )}

          {/* runner-verified pricing */}
          <h2 className="disp mb-3 mt-8 border-b border-[hsl(var(--rule))] pb-2.5 text-[22px] font-bold">
            Verified at the shelf, not scraped
          </h2>
          <Panel pad={false} className="min-w-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[hsl(var(--rule))] bg-[hsl(var(--panel-2))]">
                    <th className="px-3 py-2.5 text-[11px] font-semibold text-[hsl(var(--ink-2))]">Item</th>
                    {["Lowe's", "Home Depot", "Menards", "Misty Valley"].map(s => (
                      <th key={s} className="px-3 py-2.5 text-right text-[11px] font-semibold text-[hsl(var(--ink-2))]">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {VERIFIED.map(r => {
                    const low = Math.min(...r.prices.map(p => p[1] as number));
                    return (
                      <tr key={r.item} className="border-b border-[hsl(var(--rule-2))]">
                        <td className="px-3 py-2.5 text-[14px] font-medium">{r.item}</td>
                        {r.prices.map(([who, val, when]) => (
                          <td key={who as string} className="px-3 py-2.5 text-right">
                            <span className={cx("num text-[14px]", val === low ? "font-bold text-[hsl(var(--good))]" : "")}>{money(val as number)}</span>
                            <span className="block text-[10px] text-[hsl(var(--ink-3))]">{when === "now" ? "our price" : `verified ${when} ago`}</span>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="border-t border-[hsl(var(--rule))] p-3 text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
              Every price carries when a runner last stood in front of the tag. Demo data —
              in production, runners photograph the shelf tag on every claim, so the board
              stays honest without scraping anybody.
            </p>
          </Panel>
        </div>

        {/* driver rail */}
        <aside className="mt-6 grid gap-4 lg:mt-0">
          <Panel pad={false} className="card-hi">
            <div className="tape h-1.5" />
            <div className="p-4">
              <Lab kicker className="mb-2">Drive for Misty Valley</Lab>
              <p className="text-[13.5px] leading-[1.55]">
                Got a truck and know the counters? Runners keep <strong>80% of the run
                fee</strong> plus $0.65 a mile, paid weekly. Claim runs when you want them —
                between your own jobs is the whole idea.
              </p>
              <div className="mt-3 grid gap-1 text-[13px] text-[hsl(var(--ink-2))]">
                {["A typical E-town run pays $18–34", "Truck or trailer, current auto + cargo insurance", "1099 — you're a contractor, not a shift"].map(t => (
                  <div key={t} className="flex gap-2"><span className="mt-[7px] h-px w-2.5 shrink-0 bg-[hsl(var(--safety-2))]" /><span>{t}</span></div>
                ))}
              </div>
              <Btn size="sm" className="mt-4 w-full">Ask to drive</Btn>
              <p className="mt-2 text-[11px] text-[hsl(var(--ink-3))]">
                Drivers get the driver dashboard — routes, PODs, weekly pay, all in this app.
              </p>
            </div>
          </Panel>
          <Panel>
            <Lab kicker className="mb-2">Why this is clean</Lab>
            <p className="text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
              We buy the goods and resell them on your account — merchant of record, plain
              retail. No money moves between strangers, so nobody needs a banking license
              to get you your OSB.
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
