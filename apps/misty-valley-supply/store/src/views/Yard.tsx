import * as React from "react";
import { LISTINGS, LISTING_KINDS, SELLERS, type Listing } from "@/data";
import { Glyph } from "@/glyph";
import {
  AUTH_WINDOW_DAYS, PLATFORM_FEE_BPS, breakevenCents, canTakePayment,
  dollars, split, toCents, yardCalls,
} from "@/payments";
import { Btn, Lab, Panel, Rule, Tag, cx } from "@/ui";

const KIND_GLYPH: Record<string, string> = {
  Equipment: "srl", Surplus: "guardrail", Crews: "vest",
  Trucks: "base", Tools: "lanyard", Wanted: "anchor",
};
const tone = (k: string) =>
  k === "Wanted" ? "safety" : k === "Crews" ? "good" : k === "Surplus" ? "steel" : "grey";

const numeric = (p: string) => Number(p.replace(/[^0-9.]/g, "")) || 0;
const sellerOf = (l: Listing) => SELLERS[l.who];

/* ------------------------------------------------------- fee calculator */

function MoneyModel() {
  const [usd, setUsd] = React.useState(4600);
  const s = split(toCents(usd));
  const be = breakevenCents();

  const rows: [string, number, "ink" | "safety" | "warn"][] = [
    ["Buyer authorized", s.gross, "ink"],
    ["Seller receives", s.sellerNet, "ink"],
    [`Platform fee (${PLATFORM_FEE_BPS / 100}%)`, s.platformFee, "safety"],
    ["Stripe, from our balance", -s.processing, "warn"],
  ];

  return (
    <Panel pad={false}>
      <div className="tape h-1.5" />
      <div className="p-4">
        <Lab className="mb-3">What a protected sale pays us</Lab>
        <label className="mb-3 block">
          <span className="lab">Sale amount</span>
          <input type="number" min={1} value={usd}
            onChange={e => setUsd(Math.max(0, Number(e.target.value) || 0))}
            className="mono mt-1 h-10 w-full border border-[hsl(var(--rule))] bg-white px-2.5 text-[15px]" />
        </label>
        {rows.map(([l, v, t]) => (
          <div key={l} className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-[hsl(var(--ink-2))]">{l}</span>
            <span className={cx("mono text-[13.5px]",
              t === "safety" && "text-[hsl(var(--safety))]",
              t === "warn" && "text-[hsl(var(--warn))]")}>
              {v < 0 ? `−${dollars(Math.abs(v))}` : dollars(v)}
            </span>
          </div>
        ))}
        <Rule className="my-2.5" />
        <div className="flex items-baseline justify-between">
          <span className="disp text-[16px] font-bold">We keep</span>
          <span className={cx("disp text-[26px] font-bold leading-none",
            s.margin >= 0 ? "text-[hsl(var(--safety))]" : "text-[hsl(var(--bad))]")}>
            {s.margin < 0 ? `−${dollars(Math.abs(s.margin))}` : dollars(s.margin)}
          </span>
        </div>
        <p className="mono mt-2 text-[11px] text-[hsl(var(--ink-3))]">
          Break-even {dollars(be)}. Below that the 30¢ fixed fee eats the whole 5%.
        </p>
        <p className="mt-3 text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
          Listing and browsing are free. The fee applies only to a protected sale,
          and it is charged as a Stripe <span className="mono">application_fee_amount</span> on
          the seller's own charge — we are never the counterparty to the material.
        </p>
      </div>
    </Panel>
  );
}

/* -------------------------------------------------- protected sale flow */

type Phase = "idle" | "held" | "captured" | "void";

function ProtectedSale({ l }: { l: Listing }) {
  const seller = sellerOf(l);
  const gate = canTakePayment(seller ?? { agreement: false, onboarded: false, payouts: false });
  const gross = toCents(numeric(l.price));
  const s = split(gross);
  const steps = yardCalls(gross, l.id, seller?.acct ?? "acct_unknown");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [show, setShow] = React.useState(false);

  if (gross === 0) return null;

  if (!gate.ok) return (
    <Panel className="mt-4 border-l-2 border-l-[hsl(var(--warn))]">
      <Lab className="mb-1.5">Message only</Lab>
      <p className="text-[13px] leading-[1.5]">
        {gate.why}. Until that is done we have no account to pay and no written
        agreement to collect under, so this listing cannot take a protected
        payment. Arrange it between yourselves, or ask them to finish setup.
      </p>
    </Panel>
  );

  return (
    <div className="mt-4">
      {phase === "idle" && (
        <>
          <Btn className="w-full" onClick={() => setPhase("held")}>
            Authorize {dollars(s.gross)} — pay on pickup
          </Btn>
          <p className="mt-2 text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
            Your card is held, not charged. It stays held for {AUTH_WINDOW_DAYS} days.
            Nothing moves until you confirm you have the material.
          </p>
        </>
      )}

      {phase === "held" && (
        <Panel className="border-l-2 border-l-[hsl(var(--safety))]" pad={false}>
          <div className="p-4">
            <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Held — not charged</Lab>
            <p className="text-[13px] leading-[1.5]">
              {dollars(s.gross)} is reserved on your card and releases by itself in{" "}
              {AUTH_WINDOW_DAYS} days if you do nothing. The seller sees the hold and
              knows you are good for it.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Btn size="sm" onClick={() => setPhase("captured")}>I have the material</Btn>
              <Btn size="sm" variant="line" onClick={() => setPhase("void")}>Release the hold</Btn>
            </div>
          </div>
        </Panel>
      )}

      {phase === "captured" && (
        <Panel className="border-l-2 border-l-[hsl(var(--good))]" pad={false}>
          <div className="p-4">
            <Lab className="mb-1.5">Captured</Lab>
            <p className="text-[13px] leading-[1.5]">
              Charged {dollars(s.gross)}. In the same call Stripe moved{" "}
              <span className="mono">{dollars(s.sellerNet)}</span> to {l.who} and{" "}
              <span className="mono">{dollars(s.platformFee)}</span> to Misty Valley.
              We held your money for zero seconds.
            </p>
            <button onClick={() => setPhase("idle")} className="lab mt-3 text-[hsl(var(--safety-2))] underline">
              Reset the demo
            </button>
          </div>
        </Panel>
      )}

      {phase === "void" && (
        <Panel pad={false}>
          <div className="p-4">
            <Lab className="mb-1.5">Released</Lab>
            <p className="text-[13px] leading-[1.5]">
              The authorization is cancelled. No charge was ever made, so there is
              nothing to refund.
            </p>
            <button onClick={() => setPhase("idle")} className="lab mt-3 text-[hsl(var(--safety-2))] underline">
              Reset the demo
            </button>
          </div>
        </Panel>
      )}

      <button onClick={() => setShow(!show)} className="lab mt-3 text-[hsl(var(--ink-3))] underline">
        {show ? "Hide" : "Show"} the actual API calls
      </button>
      {show && (
        <div className="mt-2 grid gap-2">
          {steps.map(st => (
            <Panel key={st.title} className="min-w-0">
              <Lab className="mb-1">{st.when}</Lab>
              <div className="disp text-[16px] font-semibold leading-none">{st.title}</div>
              <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[hsl(var(--ink-2))]">{st.body}</p>
              <pre className="mono mt-2 max-w-full overflow-x-auto border border-[hsl(var(--rule))] bg-[hsl(var(--panel-2))] p-2 text-[11px] leading-[1.6]">
{st.call}
              </pre>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- listing */

function Card({ l, onOpen }: { l: Listing; onOpen: () => void }) {
  const ok = canTakePayment(sellerOf(l) ?? { agreement: false, onboarded: false, payouts: false }).ok;
  return (
    <button onClick={onOpen}
      className="group flex flex-col border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-left">
      <div className="relative flex aspect-[4/3] items-center justify-center plate border-b border-[hsl(var(--rule))]">
        <Glyph cat="guard" sku={KIND_GLYPH[l.kind]} className="h-[70%] w-[70%]" />
        <span className="absolute left-2 top-2"><Tag tone={tone(l.kind) as never}>{l.kind}</Tag></span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="disp text-[20px] font-bold leading-none text-[hsl(var(--safety))]">{l.price}</div>
        <h3 className="mt-1.5 line-clamp-2 text-[13.5px] font-semibold leading-[1.35] group-hover:underline">
          {l.title}
        </h3>
        {ok && numeric(l.price) > 0 && (
          <span className="mono mt-1.5 text-[10.5px] text-[hsl(var(--good))]">✓ pay on pickup</span>
        )}
        <div className="mono mt-auto pt-2 text-[11px] text-[hsl(var(--ink-3))]">
          {l.where} · {l.when}
        </div>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ view */

export default function Yard() {
  const [kind, setKind] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [radius, setRadius] = React.useState(60);
  const [open, setOpen] = React.useState<Listing | null>(null);
  const [msg, setMsg] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const list = LISTINGS.filter(l =>
    (kind === "All" || l.kind === kind) &&
    (q.trim() === "" || `${l.title} ${l.body} ${l.where} ${l.who}`.toLowerCase().includes(q.toLowerCase())));

  const openSeller = open ? sellerOf(open) : undefined;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[hsl(var(--ink))] pb-2">
        <div>
          <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">The Yard</Lab>
          <h1 className="disp text-[28px] font-bold leading-none sm:text-[34px]">Marketplace</h1>
        </div>
        <Btn size="sm">＋ Post a listing</Btn>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-7">
        <div className="min-w-0">
          {/* controls */}
          <div className="mb-4 grid gap-2 sm:grid-cols-[1fr_auto]">
            <input value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search the yard — scissor lift, stud, crew…"
              className="mono h-10 w-full border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 text-[14px] outline-none focus:border-[hsl(var(--safety))]" />
            <label className="flex items-center gap-2 border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3">
              <span className="text-[11px] font-medium whitespace-nowrap">Within</span>
              <select value={radius} onChange={e => setRadius(Number(e.target.value))}
                className="mono h-9 bg-transparent text-[13px] outline-none">
                {[25, 60, 150, 500].map(r => <option key={r} value={r}>{r} mi</option>)}
              </select>
            </label>
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {LISTING_KINDS.map(k => (
              <button key={k} onClick={() => setKind(k)}
                className={cx("lab border px-2.5 py-2",
                  kind === k ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                             : "border-[hsl(var(--rule))] text-[hsl(var(--ink-2))]")}>
                {k}
              </button>
            ))}
          </div>

          <div className="mono mb-3 text-[12.5px] text-[hsl(var(--ink-3))]">
            <strong className="text-[hsl(var(--ink))]">{list.length}</strong> listings within {radius} mi of Bonnieville
          </div>

          {/* grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {list.map(l => <Card key={l.id} l={l} onOpen={() => { setOpen(l); setSent(false); setMsg(""); }} />)}
          </div>
          {list.length === 0 && (
            <Panel className="text-center text-[hsl(var(--ink-2))]">No listings match.</Panel>
          )}
        </div>

        {/* rail */}
        <aside className="mt-8 grid gap-4 lg:mt-0">
          <MoneyModel />
          <Panel className="border-l-2 border-l-[hsl(var(--safety))]">
            <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Why anyone would use it</Lab>
            <p className="text-[13px] leading-[1.55]">
              Buying a used scissor lift from a stranger means meeting with a cashier's
              cheque and hoping. Here the card is <strong>held, not charged</strong>, and
              it is captured the moment you say you have the material. The seller can see
              you are good for it; you are out nothing until the thing is on your trailer.
            </p>
          </Panel>
          <Panel>
            <Lab className="mb-2">What we do not do</Lab>
            <p className="text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
              We never hold a seller's money waiting on a condition. That is the line
              between a marketplace and a money transmitter, and it is the reason this
              works as an authorization rather than an escrow.
            </p>
          </Panel>
        </aside>
      </div>

      {/* detail + message */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={() => setOpen(null)}>
          <div className="h-full w-full overflow-y-auto bg-[hsl(var(--ground))] sm:max-w-[520px] sm:border-l-2 sm:border-[hsl(var(--safety))]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[hsl(var(--ink))] p-4">
              <span className="mono text-[11px] text-[hsl(var(--ink-3))]">{open.id}</span>
              <button onClick={() => setOpen(null)} className="lab h-10 px-2 text-[hsl(var(--ink-2))]">Close ✕</button>
            </div>

            <div className="flex aspect-[16/9] items-center justify-center plate border-b border-[hsl(var(--rule))]">
              <Glyph cat="guard" sku={KIND_GLYPH[open.kind]} className="h-[62%] w-[62%]" />
            </div>

            <div className="p-4">
              <Tag tone={tone(open.kind) as never}>{open.kind}</Tag>
              <div className="disp mt-2 text-[32px] font-bold leading-none text-[hsl(var(--safety))]">{open.price}</div>
              <h3 className="disp mt-1.5 text-[22px] font-bold leading-[1.1]">{open.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-[1.55] text-[hsl(var(--ink-2))]">{open.body}</p>

              <Panel className="mt-4" pad={false}>
                <div className="flex items-center gap-3 p-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[hsl(var(--rule))] bg-[hsl(var(--panel-2))]">
                    <span className="disp text-[18px] font-bold">{open.who.slice(0, 1)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold">{open.who}</div>
                    <div className="mono text-[11px] text-[hsl(var(--ink-3))]">
                      {open.where} · member since {openSeller?.since ?? "—"} ·{" "}
                      {openSeller?.deals ?? 0} completed
                    </div>
                  </div>
                </div>
              </Panel>

              <ProtectedSale l={open} />

              <Rule className="my-4" />
              <Lab className="mb-2">Message the seller</Lab>
              {sent ? (
                <Panel className="border-l-2 border-l-[hsl(var(--good))]">
                  <p className="text-[13px]">Sent. Replies land in your inbox and as a push.</p>
                </Panel>
              ) : (
                <>
                  <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={3}
                    placeholder="Is this still available? I can pick up Saturday."
                    className="w-full border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-2.5 text-[14px] outline-none focus:border-[hsl(var(--safety))]" />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Still available?", "Can you deliver?", "Will you take less?"].map(t => (
                      <button key={t} onClick={() => setMsg(t)}
                        className="lab border border-[hsl(var(--rule))] px-2 py-1.5">{t}</button>
                    ))}
                  </div>
                  <Btn variant="line" className="mt-2 w-full" disabled={!msg.trim()}
                    onClick={() => setSent(true)}>Send</Btn>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
