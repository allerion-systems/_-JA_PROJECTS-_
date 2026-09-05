import * as React from "react";
import { CATEGORIES, PRODUCTS } from "@/data";
import { Glyph } from "@/glyph";
import hero from "@/assets/site/lee-screen-1.jpg";
import { SITES, ago, isLive, lastPost } from "@/sites";
import { useAuth } from "@/auth";
import { Btn, Lab, Panel, Rule, Tag, cx, money } from "@/ui";

const TRADES = [
  { id: "roofing", name: "Roofing", note: "Edge protection, anchors, warning line" },
  { id: "interiors", name: "Interiors & Framing", note: "Cut packages, hand and eye" },
  { id: "concrete", name: "Concrete & Site", note: "Hi-vis, hole covers, guardrail" },
  { id: "mech", name: "Mechanical & RTU", note: "Screens, curbs, fall arrest" },
];

const BRANDS = ["ClarkDietrich", "Telling", "MarinoWARE", "SCAFCO", "CEMCO",
                "Simpson Strong-Tie", "Steel Network", "Hilti", "STI", "3M"];

export default function Home({
  onShop, onScreens, onYard, onEarth, onSignIn, onSearch,
}: {
  onShop: (cat?: string) => void; onScreens: () => void; onYard: () => void;
  onEarth: () => void; onSignIn: () => void; onSearch: (q: string) => void;
}) {
  const { user, branch } = useAuth();
  const hot = PRODUCTS.filter(p => p.hot).slice(0, 4);

  return (
    <div>
      {/* ---------------------------------------------------------- hero */}
      <section className="card-hi mb-10">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          {/* the picture does the talking */}
          <div className="relative isolate flex min-h-[380px] flex-col justify-end bg-[hsl(var(--ink))] sm:min-h-[420px] lg:min-h-[480px]">
            <img src={hero} alt="Shop-fabricated roof screen frame standing on the Lee Street roof"
              className="absolute inset-0 h-full w-full object-cover opacity-95" />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--ink))] via-[hsl(var(--ink))]/78 to-[hsl(var(--ink))]/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--ink))]/70 to-transparent" />
            <div className="tape absolute inset-x-0 top-0 h-1.5" />
            <div className="relative w-full p-5 pt-16 text-white sm:p-7 sm:pt-20">
              <span className="lab mb-2 block text-[hsl(var(--safety))]">
                {user ? `${user.company} · ${user.terms} · ${user.discountPct}% off list` : "Trade supply · the I-65 corridor"}
              </span>
              <h1 className="disp max-w-[17ch] text-[36px] font-bold leading-[0.94] [text-wrap:balance] sm:text-[52px] xl:text-[60px]">
                Every part, with the rule that requires it
              </h1>
              <p className="mt-3 max-w-[52ch] text-[14px] leading-[1.55] text-white/80">
                Search an OSHA citation and get the products that satisfy it — and the ones that
                do not. Cut, labeled and sequenced, on the deck the day we said.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Btn onClick={() => onShop()}>Shop the catalog</Btn>
                {!user && (
                  <button onClick={onSignIn}
                    className="disp inline-flex h-11 items-center justify-center rounded-[5px] border border-white/35 px-5 text-[15.5px] text-white transition-colors hover:bg-white hover:text-[hsl(var(--ink))] sm:h-10">
                    Sign in for your price
                  </button>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {[["Try", "1926.501"], ["or", "Z87+"], ["or", "cut level A4"]].map(([a, b]) => (
                  <button key={b} onClick={() => onSearch(b)} className="text-left">
                    <span className="lab text-white/45">{a}</span>{" "}
                    <span className="mono text-[13px] text-[hsl(var(--safety-2))] underline decoration-[hsl(var(--safety))]/50 underline-offset-2">{b}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* branch + credit */}
          <div className="border-t border-[hsl(var(--rule))] p-5 sm:p-7 lg:border-l lg:border-t-0">
            <Lab className="mb-3">Your branch</Lab>
            <div className="disp text-[28px] font-bold leading-none">{branch.name}</div>
            <div className="mono mt-2 text-[12px] leading-[1.6] text-[hsl(var(--ink-2))]">
              {branch.city}<br />{branch.hours} · {branch.phone}
            </div>
            <Rule className="my-5" />
            {user ? (
              <>
                <Lab className="mb-2">Credit</Lab>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="mono text-[13.5px]">{money(user.creditLimit - user.creditUsed)} available</span>
                  <span className="mono text-[11px] text-[hsl(var(--ink-3))]">of {money(user.creditLimit)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--panel-2))]">
                  <div className="h-full rounded-full bg-[hsl(var(--safety))]"
                    style={{ width: `${(user.creditUsed / user.creditLimit) * 100}%` }} />
                </div>
              </>
            ) : (
              <>
                <Lab className="mb-2">Buying on terms</Lab>
                <p className="text-[13.5px] leading-[1.55] text-[hsl(var(--ink-2))]">
                  Open a credit account and buy net 30 instead of by card. Two business days,
                  three trade references.
                </p>
                <Btn variant="line" size="sm" className="mt-3 w-full" onClick={onSignIn}>Open a credit account</Btn>
              </>
            )}

            <Rule className="my-5" />
            <Lab className="mb-2.5">Live on the corridor</Lab>
            <div className="grid gap-1.5">
              {[...SITES].sort((a, b) => lastPost(a) - lastPost(b)).slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full",
                    isLive(s) ? "bg-[hsl(var(--safety))]" : "bg-[hsl(var(--rule))]")} />
                  <span className="min-w-0 flex-1 truncate text-[13px]">{s.name}</span>
                  <span className="mono shrink-0 text-[11px] text-[hsl(var(--ink-3))]">{ago(lastPost(s))}</span>
                </div>
              ))}
            </div>
            <button onClick={onEarth} className="lab mt-3 text-[hsl(var(--safety-2))] underline underline-offset-2">
              Open Job Site Earth
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ shop by */}
      <h2 className="disp mb-4 border-b border-[hsl(var(--ink))] pb-2.5 text-[24px] font-bold">Shop by trade</h2>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TRADES.map(t => (
          <button key={t.id} onClick={() => onShop()} className="card lift p-4 text-left">
            <div className="disp text-[19px] font-semibold leading-[1.05] [hyphens:none]">{t.name}</div>
            <div className="mt-2 text-[12.5px] leading-[1.4] text-[hsl(var(--ink-2))]">{t.note}</div>
          </button>
        ))}
      </div>

      <h2 className="disp mb-4 border-b border-[hsl(var(--ink))] pb-2.5 text-[24px] font-bold">Shop by category</h2>
      <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => onShop(c.id)}
            className="card lift flex flex-col items-center gap-2 p-4">
            <span className="text-[hsl(var(--ink-2))]"><Glyph cat={c.id} className="h-14 w-14" /></span>
            <span className="disp text-center text-[14px] font-semibold leading-[1.1]">{c.name}</span>
            <span className="mono text-[10.5px] text-[hsl(var(--ink-3))]">
              {PRODUCTS.filter(p => p.cat === c.id).length} items
            </span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------- fabrication */}
      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        <Panel pad={false} className="lift">
          <div className="p-5">
            <Tag tone="safety">Shop fabrication</Tag>
            <h3 className="disp mt-2.5 text-[26px] font-bold leading-none">Roof screen frames</h3>
            <p className="mt-2 text-[13.5px] leading-[1.55] text-[hsl(var(--ink-2))]">
              Built flat in the shop to your basis of design, delivered in labeled sections,
              set in one pick. The Lee Street frame ran <strong>{money(6000)}</strong> complete.
            </p>
            <Btn size="sm" className="mt-4" onClick={onScreens}>Configure a budget</Btn>
          </div>
        </Panel>
        <Panel pad={false} className="lift">
          <div className="p-5">
            <Tag tone="steel">The Yard</Tag>
            <h3 className="disp mt-2.5 text-[26px] font-bold leading-none">Buy and sell locally</h3>
            <p className="mt-2 text-[13.5px] leading-[1.55] text-[hsl(var(--ink-2))]">
              Surplus material, iron, crews and trucks along the corridor. Free to list.
              Protected payment holds the money until pickup is confirmed.
            </p>
            <Btn size="sm" variant="line" className="mt-4" onClick={onYard}>Browse the yard</Btn>
          </div>
        </Panel>
      </div>

      {/* -------------------------------------------------- frequently */}
      <h2 className="disp mb-4 border-b border-[hsl(var(--ink))] pb-2.5 text-[24px] font-bold">Frequently bought</h2>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {hot.map(p => (
          <button key={p.sku} onClick={() => onShop(p.cat)} className="card lift p-3 text-left">
            <div className="mb-2 flex aspect-[3/2] items-center justify-center plate rounded-[6px] border border-[hsl(var(--rule))]">
              <Glyph sku={p.sku} cat={p.cat} className="h-[76%] w-[76%]" />
            </div>
            <div className="text-[13.5px] font-semibold leading-[1.3]">{p.name}</div>
            <div className="mono mt-1 text-[11px] text-[hsl(var(--safety))]">{p.osha}</div>
            <div className="disp mt-1.5 text-[18px] font-bold">
              {user ? money(Math.round(p.price * 0.82 * 100) / 100) : money(p.price)}
              <span className="lab ml-1.5">{user ? "your price" : "list"}</span>
            </div>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------ brands */}
      <h2 className="disp mb-4 border-b border-[hsl(var(--ink))] pb-2.5 text-[24px] font-bold">Shop by brand</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {BRANDS.map(b => (
          <button key={b} onClick={() => onSearch(b)}
            className="card lift flex h-16 items-center justify-center px-2">
            <span className="disp text-center text-[15px] font-semibold leading-none text-[hsl(var(--ink-2))]">{b}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
