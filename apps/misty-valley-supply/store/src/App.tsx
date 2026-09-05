import * as React from "react";
import { PRODUCTS } from "@/data";
import { Btn, Lab, Rule, cx, money } from "@/ui";
import Shop from "@/views/Shop";
import Screen from "@/views/Screen";
import Yard from "@/views/Yard";
import Ops from "@/views/Ops";
import Agents from "@/views/Agents";

type View = "shop" | "screen" | "yard" | "ops" | "agents";
type CartLine = { sku: string; qty: number };

const NAV: { id: View; label: string; sub: string }[] = [
  { id: "shop", label: "Catalog", sub: "Safety & edge protection" },
  { id: "screen", label: "Roof Screens", sub: "Shop fabrication" },
  { id: "yard", label: "The Yard", sub: "Classifieds" },
  { id: "ops", label: "Operations", sub: "Back office" },
  { id: "agents", label: "Agent API", sub: "MCP interface" },
];

export default function App() {
  const [view, setView] = React.useState<View>("shop");
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [openCart, setOpenCart] = React.useState(false);

  const lines = cart.map(c => ({ ...c, p: PRODUCTS.find(p => p.sku === c.sku)! })).filter(l => l.p);
  const total = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <div className="min-h-full">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b-2 border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white">
        <div className="tape h-1" />
        <div className="mx-auto flex max-w-[1400px] items-center gap-5 px-4 py-2.5 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <span className="disp text-[22px] font-bold leading-none">Misty Valley</span>
            <span className="disp text-[22px] font-bold leading-none text-[hsl(var(--safety))]">Supply</span>
          </div>
          <span className="mono hidden text-[11px] text-white/45 lg:inline">
            Bonnieville, KY · I-65
          </span>
          <div className="ml-auto flex items-center gap-3">
            <span className="mono hidden text-[11px] text-white/45 sm:inline">
              {PRODUCTS.length} lines · dropship
            </span>
            <button onClick={() => setOpenCart(true)}
              className="lab flex items-center gap-2 border border-white/25 px-3 py-1.5 hover:border-[hsl(var(--safety))]">
              Order
              <span className={cx("mono px-1.5 py-px text-[11px]",
                count ? "bg-[hsl(var(--safety))] text-white" : "bg-white/15")}>{count}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-0 px-4 sm:px-6">
        {/* rail */}
        <nav className="sticky top-[52px] hidden h-[calc(100vh-52px)] w-[210px] shrink-0 border-r border-[hsl(var(--rule))] py-6 pr-5 lg:block">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setView(n.id)}
              className={cx("mb-1 block w-full border-l-2 py-2 pl-3 text-left transition-colors",
                view === n.id
                  ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                  : "border-transparent hover:border-[hsl(var(--rule))]")}>
              <div className={cx("disp text-[17px] font-semibold leading-none",
                view === n.id ? "text-[hsl(var(--ink))]" : "text-[hsl(var(--ink-2))]")}>
                {n.label}
              </div>
              <div className="mono mt-1 text-[10.5px] text-[hsl(var(--ink-3))]">{n.sub}</div>
            </button>
          ))}
          <Rule className="my-5" />
          <Lab className="mb-2">Prototype</Lab>
          <p className="text-[11.5px] leading-[1.5] text-[hsl(var(--ink-3))]">
            Placeholder pricing. Standards and OSHA cites are real.
          </p>
        </nav>

        {/* mobile nav */}
        <div className="w-full lg:hidden">
          <div className="-mx-4 mb-5 flex gap-1 overflow-x-auto border-b border-[hsl(var(--rule))] px-4 pt-4 sm:-mx-6 sm:px-6">
            {NAV.map(n => (
              <button key={n.id} onClick={() => setView(n.id)}
                className={cx("disp whitespace-nowrap border-b-2 px-3 pb-2 text-[16px] font-semibold",
                  view === n.id ? "border-[hsl(var(--safety))]" : "border-transparent text-[hsl(var(--ink-2))]")}>
                {n.label}
              </button>
            ))}
          </div>
        </div>

        {/* main */}
        <main className="min-w-0 flex-1 py-6 lg:pl-8">
          {view === "shop" && <Shop cart={cart} setCart={setCart} />}
          {view === "screen" && <Screen />}
          {view === "yard" && <Yard />}
          {view === "ops" && <Ops />}
          {view === "agents" && <Agents />}
        </main>
      </div>

      <footer className="mt-10 border-t-2 border-[hsl(var(--ink))]">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
          <div className="mono text-[11.5px] leading-[1.7] text-[hsl(var(--ink-3))]">
            Misty Valley Supply · Bonnieville, Kentucky · prototype build<br />
            Standards and OSHA citations are accurate. Prices, stock and suppliers are placeholders for layout.
          </div>
        </div>
      </footer>

      {/* cart */}
      {openCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setOpenCart(false)}>
          <div className="flex h-full w-full max-w-[460px] flex-col border-l-2 border-[hsl(var(--safety))] bg-[hsl(var(--ground))]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b-2 border-[hsl(var(--ink))] p-5">
              <h3 className="disp text-[24px] font-bold">Order</h3>
              <button onClick={() => setOpenCart(false)}
                className="lab text-[hsl(var(--ink-2))] hover:text-[hsl(var(--ink))]">Close ✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {lines.length === 0 && (
                <p className="text-[hsl(var(--ink-2))]">Nothing on the order yet.</p>
              )}
              {lines.map(l => (
                <div key={l.sku} className="mb-4 border-b border-[hsl(var(--rule))] pb-4 last:border-0">
                  <div className="mono mb-1 text-[11px] text-[hsl(var(--ink-3))]">{l.sku}</div>
                  <div className="disp mb-1 text-[17px] font-semibold leading-[1.1]">{l.p.name}</div>
                  <div className="mono mb-2 text-[11.5px] text-[hsl(var(--safety))]">{l.p.osha}</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button className="mono h-7 w-7 border border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]"
                        onClick={() => setCart(cart.map(c => c.sku === l.sku
                          ? { ...c, qty: Math.max(1, c.qty - (l.p.moq ?? 1)) } : c))}>–</button>
                      <span className="mono w-10 text-center text-[13px]">{l.qty}</span>
                      <button className="mono h-7 w-7 border border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]"
                        onClick={() => setCart(cart.map(c => c.sku === l.sku
                          ? { ...c, qty: c.qty + (l.p.moq ?? 1) } : c))}>+</button>
                      <button className="lab ml-2 text-[hsl(var(--ink-3))] hover:text-[hsl(var(--bad))]"
                        onClick={() => setCart(cart.filter(c => c.sku !== l.sku))}>Remove</button>
                    </div>
                    <div className="mono text-[14px]">{money(l.p.price * l.qty)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[hsl(var(--ink))] p-5">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="disp text-[18px] font-bold">Material</span>
                <span className="disp text-[32px] font-bold leading-none">{money(total)}</span>
              </div>
              <p className="mb-4 text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
                Freight quoted separately by ship-to. Orders placed after a supplier's cut-off
                ship the next business day — the promise date is calculated, not guessed.
              </p>
              <Btn className="w-full" disabled={!lines.length}>Request PO number</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
