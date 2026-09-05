import * as React from "react";
import { LISTINGS, LISTING_KINDS, type Listing } from "@/data";
import { Glyph } from "@/glyph";
import { Btn, Lab, Panel, Rule, Tag, cx, money } from "@/ui";

const KIND_GLYPH: Record<string, string> = {
  Equipment: "srl", Surplus: "guardrail", Crews: "vest",
  Trucks: "base", Tools: "lanyard", Wanted: "anchor",
};
const tone = (k: string) =>
  k === "Wanted" ? "safety" : k === "Crews" ? "good" : k === "Surplus" ? "steel" : "grey";

const numeric = (p: string) => Number(p.replace(/[^0-9.]/g, "")) || 0;

/* ------------------------------------------------------- fee calculator */

function FeeModel() {
  const [amt, setAmt] = React.useState(4600);
  const rate = 0.05;
  const fee = Math.round(amt * rate * 100) / 100;
  // Stripe standard online rate; the platform fee sits on top of it.
  const proc = Math.round((amt * 0.029 + 0.3) * 100) / 100;
  const seller = Math.round((amt - fee) * 100) / 100;
  const net = Math.round((fee - proc) * 100) / 100;

  return (
    <Panel pad={false}>
      <div className="tape h-1.5" />
      <div className="p-4">
        <Lab className="mb-3">What we make on a protected sale</Lab>
        <label className="mb-3 block">
          <span className="lab">Sale amount</span>
          <input type="number" min={1} value={amt}
            onChange={e => setAmt(Math.max(0, Number(e.target.value) || 0))}
            className="mono mt-1 h-10 w-full border border-[hsl(var(--rule))] bg-white px-2.5 text-[15px]" />
        </label>
        {[
          ["Buyer pays", amt, "ink"],
          ["Seller receives", seller, "ink"],
          ["Platform fee (5%)", fee, "safety"],
          ["Card processing", -proc, "warn"],
        ].map(([l, v, t]) => (
          <div key={l as string} className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-[hsl(var(--ink-2))]">{l}</span>
            <span className={cx("mono text-[13.5px]",
              t === "safety" && "text-[hsl(var(--safety))]",
              t === "warn" && "text-[hsl(var(--warn))]")}>
              {(v as number) < 0 ? `−${money(Math.abs(v as number))}` : money(v as number)}
            </span>
          </div>
        ))}
        <Rule className="my-2.5" />
        <div className="flex items-baseline justify-between">
          <span className="disp text-[16px] font-bold">We keep</span>
          <span className="disp text-[26px] font-bold leading-none text-[hsl(var(--safety))]">{money(net)}</span>
        </div>
        <p className="mt-3 text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
          Free to list and free to browse. The fee applies only when a buyer chooses
          protected payment — which is the only time we are worth paying.
        </p>
      </div>
    </Panel>
  );
}

/* --------------------------------------------------------------- listing */

function Card({ l, onOpen }: { l: Listing; onOpen: () => void }) {
  return (
    <button onClick={onOpen}
      className="group flex flex-col border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-left">
      <div className="relative flex aspect-[4/3] items-center justify-center border-b border-[hsl(var(--rule))] bg-white text-[hsl(var(--ink-3))]">
        <Glyph cat="guard" sku={KIND_GLYPH[l.kind]} className="h-[46%] w-[46%]" />
        <span className="absolute left-2 top-2"><Tag tone={tone(l.kind) as never}>{l.kind}</Tag></span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="disp text-[20px] font-bold leading-none text-[hsl(var(--safety))]">{l.price}</div>
        <h3 className="mt-1.5 line-clamp-2 text-[13.5px] font-semibold leading-[1.35] group-hover:underline">
          {l.title}
        </h3>
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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-2 border-[hsl(var(--ink))] pb-2">
        <div>
          <Lab className="mb-1.5 !text-[hsl(var(--safety))]">The Yard</Lab>
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
              <span className="lab whitespace-nowrap">Within</span>
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
          <FeeModel />
          <Panel className="border-l-2 border-l-[hsl(var(--safety))]">
            <Lab className="mb-2 !text-[hsl(var(--safety))]">Why anyone would use it</Lab>
            <p className="text-[13px] leading-[1.55]">
              Buying a used scissor lift from a stranger means meeting with a cashier's cheque
              and hoping. <strong>Protected payment holds the money until the buyer confirms
              pickup.</strong> That is the product. The classifieds are free — the escrow is
              what we charge for.
            </p>
          </Panel>
        </aside>
      </div>

      {/* detail + message */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={() => setOpen(null)}>
          <div className="h-full w-full overflow-y-auto bg-[hsl(var(--ground))] sm:max-w-[520px] sm:border-l-2 sm:border-[hsl(var(--safety))]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b-2 border-[hsl(var(--ink))] p-4">
              <span className="mono text-[11px] text-[hsl(var(--ink-3))]">{open.id}</span>
              <button onClick={() => setOpen(null)} className="lab h-10 px-2 text-[hsl(var(--ink-2))]">Close ✕</button>
            </div>

            <div className="flex aspect-[16/9] items-center justify-center border-b border-[hsl(var(--rule))] bg-white text-[hsl(var(--ink-3))]">
              <Glyph cat="guard" sku={KIND_GLYPH[open.kind]} className="h-[42%] w-[42%]" />
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
                      {open.where} · member since 2025 · 4 completed
                    </div>
                  </div>
                </div>
              </Panel>

              {numeric(open.price) > 0 && (
                <div className="mt-4 grid gap-2">
                  <Btn className="w-full">
                    Pay {money(numeric(open.price))} — protected
                  </Btn>
                  <p className="text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
                    We hold the funds until you confirm pickup. Seller receives{" "}
                    <span className="mono">{money(numeric(open.price) * 0.95)}</span>; our fee is 5%.
                  </p>
                </div>
              )}

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
