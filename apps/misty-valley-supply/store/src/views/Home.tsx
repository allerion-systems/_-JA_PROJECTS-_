import * as React from "react";
import { CATEGORIES, PRODUCTS } from "@/data";
import { Glyph } from "@/glyph";
import { useAuth } from "@/auth";
import { Btn, Lab, Panel, Rule, Tag, cx, money } from "@/ui";

const TRADES = [
  { id: "roofing", name: "Roofing", note: "Edge protection, anchors, warning line" },
  { id: "interiors", name: "Interiors & Framing", note: "Cut packages, hand and eye" },
  { id: "concrete", name: "Concrete & Sitework", note: "Hi-vis, hole covers, guardrail" },
  { id: "mech", name: "Mechanical & Roof-Top", note: "Screens, curbs, fall arrest" },
];

const BRANDS = ["ClarkDietrich", "Telling", "MarinoWARE", "SCAFCO", "CEMCO",
                "Simpson Strong-Tie", "Steel Network", "Hilti", "STI", "3M"];

export default function Home({
  onShop, onScreens, onYard, onSignIn, onSearch,
}: {
  onShop: (cat?: string) => void; onScreens: () => void; onYard: () => void;
  onSignIn: () => void; onSearch: (q: string) => void;
}) {
  const { user, branch } = useAuth();
  const hot = PRODUCTS.filter(p => p.hot).slice(0, 4);

  return (
    <div>
      {/* ---------------------------------------------------------- hero */}
      <section className="mb-8 border-2 border-[hsl(var(--ink))] bg-[hsl(var(--panel))]">
        <div className="tape h-1.5" />
        <div className="grid gap-0 lg:grid-cols-[1.35fr_1fr]">
          <div className="p-5 sm:p-7">
            <Lab className="mb-2 !text-[hsl(var(--safety))]">
              {user ? `${user.company} · ${user.terms} · ${user.discountPct}% off list` : "Trade supply · I-65 corridor"}
            </Lab>
            <h1 className="disp max-w-[15ch] text-[34px] font-bold leading-[0.95] [text-wrap:balance] sm:text-[46px] xl:text-[54px]">
              Every part, with the rule that requires it
            </h1>
            <p className="mt-3 max-w-[56ch] text-[14px] leading-[1.55] text-[hsl(var(--ink-2))]">
              Search an OSHA citation and get the products that satisfy it — and the ones that
              would not. Cut, labeled and sequenced by floor and phase, delivered to the deck
              on the day we said.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Btn onClick={() => onShop()}>Shop the catalog</Btn>
              {!user && <Btn variant="line" onClick={onSignIn}>Sign in for your price</Btn>}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {[["Try", "1926.501"], ["or", "Z87+"], ["or", "cut level A4"]].map(([a, b]) => (
                <button key={b} onClick={() => onSearch(b)} className="text-left">
                  <span className="lab">{a}</span>{" "}
                  <span className="mono text-[13px] text-[hsl(var(--safety))] underline">{b}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-[hsl(var(--rule))] p-5 sm:p-7 lg:border-l lg:border-t-0">
            <Lab className="mb-3">Your branch</Lab>
            <div className="disp text-[26px] font-bold leading-none">{branch.name}</div>
            <div className="mono mt-1.5 text-[12px] text-[hsl(var(--ink-2))]">
              {branch.city}<br />{branch.hours} · {branch.phone}
            </div>
            <Rule className="my-4" />
            {user ? (
              <>
                <Lab className="mb-2">Credit</Lab>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="mono text-[13px]">{money(user.creditLimit - user.creditUsed)} available</span>
                  <span className="mono text-[11px] text-[hsl(var(--ink-3))]">of {money(user.creditLimit)}</span>
                </div>
                <div className="h-2 w-full bg-[hsl(var(--panel-2))]">
                  <div className="h-full bg-[hsl(var(--safety))]"
                    style={{ width: `${(user.creditUsed / user.creditLimit) * 100}%` }} />
                </div>
              </>
            ) : (
              <>
                <Lab className="mb-2">Buying on terms</Lab>
                <p className="text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                  Open a credit account and buy net 30 instead of by card. Two business days,
                  three trade references.
                </p>
                <Btn variant="line" size="sm" className="mt-3 w-full" onClick={onSignIn}>Open a credit account</Btn>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ shop by */}
      <h2 className="disp mb-3 border-b-2 border-[hsl(var(--ink))] pb-2 text-[22px] font-bold">Shop by trade</h2>
      <div className="mb-8 grid gap-px bg-[hsl(var(--rule))] sm:grid-cols-2 lg:grid-cols-4">
        {TRADES.map(t => (
          <button key={t.id} onClick={() => onShop()} className="bg-[hsl(var(--panel))] p-4 text-left hover:bg-[hsl(var(--panel-2))]">
            <div className="disp text-[19px] font-semibold leading-none">{t.name}</div>
            <div className="mt-1.5 text-[12.5px] text-[hsl(var(--ink-2))]">{t.note}</div>
          </button>
        ))}
      </div>

      <h2 className="disp mb-3 border-b-2 border-[hsl(var(--ink))] pb-2 text-[22px] font-bold">Shop by category</h2>
      <div className="mb-8 grid grid-cols-2 gap-px bg-[hsl(var(--rule))] sm:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => onShop(c.id)}
            className="flex flex-col items-center gap-2 bg-[hsl(var(--panel))] p-4 hover:bg-[hsl(var(--panel-2))]">
            <span className="text-[hsl(var(--ink-2))]"><Glyph cat={c.id} className="h-11 w-11" /></span>
            <span className="disp text-center text-[14px] font-semibold leading-[1.1]">{c.name}</span>
            <span className="mono text-[10.5px] text-[hsl(var(--ink-3))]">
              {PRODUCTS.filter(p => p.cat === c.id).length} items
            </span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------- fabrication */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Panel pad={false} className="border-2 border-[hsl(var(--ink))]">
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
        <Panel pad={false} className="border-2 border-[hsl(var(--ink))]">
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
      <h2 className="disp mb-3 border-b-2 border-[hsl(var(--ink))] pb-2 text-[22px] font-bold">Frequently bought</h2>
      <div className="mb-8 grid gap-px bg-[hsl(var(--rule))] sm:grid-cols-2 lg:grid-cols-4">
        {hot.map(p => (
          <button key={p.sku} onClick={() => onShop(p.cat)} className="bg-[hsl(var(--panel))] p-4 text-left">
            <div className="mb-2 flex aspect-[3/2] items-center justify-center border border-[hsl(var(--rule))] bg-white text-[hsl(var(--ink-2))]">
              <Glyph sku={p.sku} cat={p.cat} className="h-[52%] w-[52%]" />
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
      <h2 className="disp mb-3 border-b-2 border-[hsl(var(--ink))] pb-2 text-[22px] font-bold">Shop by brand</h2>
      <div className="grid grid-cols-2 gap-px bg-[hsl(var(--rule))] sm:grid-cols-5">
        {BRANDS.map(b => (
          <button key={b} onClick={() => onSearch(b)}
            className="flex h-16 items-center justify-center bg-[hsl(var(--panel))] px-2 hover:bg-[hsl(var(--panel-2))]">
            <span className="disp text-center text-[15px] font-semibold leading-none text-[hsl(var(--ink-2))]">{b}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
