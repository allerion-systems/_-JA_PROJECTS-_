import * as React from "react";
import { PRODUCTS } from "@/data";
import { AuthModals, AuthProvider, useAuth, type Modal } from "@/auth";
import { Btn, Lab, Rule, cx, money } from "@/ui";
import Home from "@/views/Home";
import Shop from "@/views/Shop";
import Screen from "@/views/Screen";
import Yard from "@/views/Yard";
import Account from "@/views/Account";
import Ops from "@/views/Ops";
import Agents from "@/views/Agents";

type View = "home" | "shop" | "screen" | "yard" | "account" | "ops" | "agents";
type CartLine = { sku: string; qty: number };

const NAV: { id: View; label: string; short: string; sub: string; icon: React.ReactNode; bar?: boolean }[] = [
  { id: "home", label: "Home", short: "Home", sub: "Start here", bar: true,
    icon: <path d="M3 11 12 3l9 8M6 10v11h12V10" /> },
  { id: "shop", label: "Catalog", short: "Shop", sub: "Safety & edge protection", bar: true,
    icon: <path d="M3 6h18M6 6v13h12V6M9 10h6" /> },
  { id: "screen", label: "Roof Screens", short: "Screens", sub: "Shop fabrication", bar: true,
    icon: <path d="M3 19h18M5 19V8l7-4 7 4v11M9 19v-6h6v6" /> },
  { id: "yard", label: "The Yard", short: "Yard", sub: "Marketplace", bar: true,
    icon: <path d="M4 5h16M4 12h16M4 19h10" /> },
  { id: "account", label: "My Account", short: "Account", sub: "Orders, invoices, lists", bar: true,
    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></> },
  { id: "ops", label: "Operations", short: "Ops", sub: "Back office",
    icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
  { id: "agents", label: "Agent API", short: "API", sub: "MCP interface",
    icon: <path d="M8 6 3 12l5 6M16 6l5 6-5 6M13 4l-2 16" /> },
];

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="square" className="h-[22px] w-[22px] shrink-0">{children}</svg>
);

function Inner() {
  const { user, branch } = useAuth();
  const [view, setView] = React.useState<View>("home");
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [openCart, setOpenCart] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [preCat, setPreCat] = React.useState<string | undefined>();
  const [modal, setModal] = React.useState<Modal>(null);

  const lines = cart.map(c => ({ ...c, p: PRODUCTS.find(p => p.sku === c.sku)! })).filter(l => l.p);
  const listTotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const netTotal = user ? Math.round(listTotal * (1 - user.discountPct / 100) * 100) / 100 : listTotal;
  const count = cart.reduce((s, c) => s + c.qty, 0);

  const go = (v: View) => { setView(v); window.scrollTo({ top: 0 }); };
  const goShop = (cat?: string) => { setPreCat(cat); go("shop"); };
  const search = (q: string) => { setQuery(q); setPreCat(undefined); go("shop"); };

  React.useEffect(() => {
    document.body.style.overflow = openCart || modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openCart, modal]);

  const bar = NAV.filter(n => n.bar);

  return (
    <div className="min-h-full pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0">
      {/* ---------------------------------------------------------- header */}
      <header className="sticky top-0 z-40 border-b-2 border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white">
        <div className="tape h-1" />

        {/* utility strip */}
        <div className="border-b border-white/10">
          <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-1.5 sm:px-6">
            <button onClick={() => setModal("branch")}
              className="mono flex items-center gap-1.5 text-[11px] text-white/70 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
              </svg>
              <span className="hidden sm:inline">Branch:</span> {branch.name}
              <span className="text-white/40">▾</span>
            </button>
            <div className="ml-auto flex items-center gap-3">
              {user ? (
                <button onClick={() => go("account")} className="mono text-[11px] text-white/70 hover:text-white">
                  {user.company} · <span className="text-[hsl(var(--safety))]">{user.discountPct}% off list</span>
                </button>
              ) : (
                <>
                  <button onClick={() => setModal("signin")} className="mono text-[11px] text-white/70 hover:text-white">
                    Sign in
                  </button>
                  <span className="text-white/20">|</span>
                  <button onClick={() => setModal("credit")}
                    className="mono text-[11px] text-[hsl(var(--safety))] hover:underline">
                    Open a credit account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* brand + cart */}
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2 sm:gap-5 sm:px-6 sm:py-2.5">
          <button onClick={() => go("home")} className="flex min-w-0 items-baseline gap-1.5 text-left sm:gap-2.5">
            <span className="disp truncate text-[18px] font-bold leading-none sm:text-[22px]">Misty Valley</span>
            <span className="disp text-[18px] font-bold leading-none text-[hsl(var(--safety))] sm:text-[22px]">Supply</span>
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button onClick={() => go("account")} aria-label="My account"
              className="lab hidden h-9 items-center gap-2 border border-white/25 px-3 hover:border-[hsl(var(--safety))] sm:flex">
              {user ? "Account" : "Sign in"}
            </button>
            <button onClick={() => setOpenCart(true)} aria-label="Open order"
              className="lab flex h-9 items-center gap-2 border border-white/25 px-3 hover:border-[hsl(var(--safety))]">
              Order
              <span className={cx("mono px-1.5 py-px text-[11px]",
                count ? "bg-[hsl(var(--safety))] text-white" : "bg-white/15")}>{count}</span>
            </button>
          </div>
        </div>

        {/* search */}
        <div className="pb-2.5 sm:pb-3">
          <div className="mx-auto flex max-w-[1400px] px-3 sm:px-6">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[hsl(var(--ink-3))]">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-4.5-4.5" />
              </svg>
              <input value={query}
                onChange={e => { setQuery(e.target.value); if (view !== "shop") go("shop"); }}
                placeholder="Search SKU or OSHA cite" aria-label="Search the catalog"
                className="mono h-11 w-full border-2 border-white bg-white pl-10 pr-9 text-[14px] text-[hsl(var(--ink))] outline-none placeholder:text-[hsl(var(--ink-3))] focus:border-[hsl(var(--safety))]" />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-[hsl(var(--ink-3))]">✕</button>
              )}
            </div>
            <button onClick={() => go("shop")} aria-label="Search"
              className="disp flex h-11 shrink-0 items-center justify-center border-2 border-l-0 border-white bg-[hsl(var(--safety))] px-3 text-[15px] font-semibold text-white sm:px-6">
              <span className="hidden sm:inline">Search</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                className="h-[19px] w-[19px] sm:hidden"><circle cx="11" cy="11" r="7" /><path d="m20 20-4.5-4.5" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------ body */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:flex">
        <nav className="sticky top-[140px] hidden h-[calc(100vh-140px)] w-[210px] shrink-0 border-r border-[hsl(var(--rule))] py-6 pr-5 lg:block">
          {NAV.map(n => (
            <button key={n.id} onClick={() => go(n.id)}
              className={cx("mb-1 flex w-full items-center gap-2.5 border-l-2 py-2 pl-3 text-left",
                view === n.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                              : "border-transparent hover:border-[hsl(var(--rule))]")}>
              <span className={view === n.id ? "text-[hsl(var(--safety))]" : "text-[hsl(var(--ink-3))]"}>
                <Icon>{n.icon}</Icon>
              </span>
              <span className="min-w-0">
                <span className={cx("disp block text-[17px] font-semibold leading-none",
                  view === n.id ? "text-[hsl(var(--ink))]" : "text-[hsl(var(--ink-2))]")}>{n.label}</span>
                <span className="mono mt-1 block text-[10.5px] text-[hsl(var(--ink-3))]">{n.sub}</span>
              </span>
            </button>
          ))}
          <Rule className="my-5" />
          <Lab className="mb-2">Prototype</Lab>
          <p className="text-[11.5px] leading-[1.5] text-[hsl(var(--ink-3))]">
            Placeholder pricing. Standards and OSHA cites are real.
          </p>
        </nav>

        <main className="min-w-0 flex-1 py-5 sm:py-6 lg:pl-8">
          {view === "home" && <Home onShop={goShop} onScreens={() => go("screen")} onYard={() => go("yard")}
            onSignIn={() => setModal("signin")} onSearch={search} />}
          {view === "shop" && <Shop cart={cart} setCart={setCart} query={query} setQuery={setQuery}
            preCat={preCat} onSignIn={() => setModal("signin")} />}
          {view === "screen" && <Screen />}
          {view === "yard" && <Yard />}
          {view === "account" && <Account onSignIn={() => setModal("signin")} />}
          {view === "ops" && <Ops />}
          {view === "agents" && <Agents />}
        </main>
      </div>

      <footer className="mt-8 border-t-2 border-[hsl(var(--ink))]">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
          <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 lg:hidden">
            {NAV.filter(n => !n.bar).map(n => (
              <button key={n.id} onClick={() => go(n.id)} className="lab text-[hsl(var(--ink-2))]">{n.label}</button>
            ))}
          </div>
          <div className="mono text-[11px] leading-[1.7] text-[hsl(var(--ink-3))]">
            Misty Valley Supply · Bonnieville, Kentucky · prototype build<br />
            Standards and OSHA citations are accurate. Prices, stock and suppliers are placeholders.
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------- mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[hsl(var(--ink))] bg-[hsl(var(--panel))] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-5">
          {bar.map(n => (
            <button key={n.id} onClick={() => go(n.id)} aria-current={view === n.id}
              className={cx("-mt-0.5 flex h-[60px] flex-col items-center justify-center gap-1 border-t-2",
                view === n.id ? "border-[hsl(var(--safety))] text-[hsl(var(--safety))]"
                              : "border-transparent text-[hsl(var(--ink-3))]")}>
              <Icon>{n.icon}</Icon>
              <span className="disp text-[12px] font-semibold leading-none">{n.short}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ------------------------------------------------------------ cart */}
      {openCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={() => setOpenCart(false)}>
          <div className="flex h-full w-full flex-col bg-[hsl(var(--ground))] sm:max-w-[460px] sm:border-l-2 sm:border-[hsl(var(--safety))]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b-2 border-[hsl(var(--ink))] p-4 sm:p-5">
              <h3 className="disp text-[24px] font-bold">Order</h3>
              <button onClick={() => setOpenCart(false)} className="lab h-10 px-2 text-[hsl(var(--ink-2))]">Close ✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {lines.length === 0 && <p className="text-[hsl(var(--ink-2))]">Nothing on the order yet.</p>}
              {lines.map(l => (
                <div key={l.sku} className="mb-4 border-b border-[hsl(var(--rule))] pb-4 last:border-0">
                  <div className="mono mb-1 text-[11px] text-[hsl(var(--ink-3))]">{l.sku}</div>
                  <div className="disp mb-1 text-[17px] font-semibold leading-[1.1]">{l.p.name}</div>
                  <div className="mono mb-2.5 text-[11.5px] text-[hsl(var(--safety))]">{l.p.osha}</div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <button aria-label="Decrease" className="mono h-10 w-10 border border-[hsl(var(--rule))] text-[16px]"
                        onClick={() => setCart(cart.map(c => c.sku === l.sku
                          ? { ...c, qty: Math.max(l.p.moq ?? 1, c.qty - (l.p.moq ?? 1)) } : c))}>–</button>
                      <span className="mono w-12 text-center text-[14px]">{l.qty}</span>
                      <button aria-label="Increase" className="mono h-10 w-10 border border-[hsl(var(--rule))] text-[16px]"
                        onClick={() => setCart(cart.map(c => c.sku === l.sku
                          ? { ...c, qty: c.qty + (l.p.moq ?? 1) } : c))}>+</button>
                      <button className="lab ml-1 h-10 px-2 text-[hsl(var(--ink-3))]"
                        onClick={() => setCart(cart.filter(c => c.sku !== l.sku))}>Remove</button>
                    </div>
                    <div className="mono text-[15px]">
                      {money((user ? l.p.price * (1 - user.discountPct / 100) : l.p.price) * l.qty)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[hsl(var(--ink))] p-4 pb-[calc(16px+env(safe-area-inset-bottom))] sm:p-5">
              {user && listTotal > 0 && (
                <div className="mono mb-1.5 flex items-baseline justify-between text-[12px] text-[hsl(var(--ink-3))]">
                  <span>List {money(listTotal)}</span>
                  <span className="text-[hsl(var(--good))]">You save {money(listTotal - netTotal)}</span>
                </div>
              )}
              <div className="mb-2.5 flex items-baseline justify-between">
                <span className="disp text-[18px] font-bold">Material</span>
                <span className="disp text-[30px] font-bold leading-none">{money(netTotal)}</span>
              </div>
              {!user && (
                <p className="mb-3 text-[12px] leading-[1.5] text-[hsl(var(--safety))]">
                  Showing list price.{" "}
                  <button onClick={() => { setOpenCart(false); setModal("signin"); }} className="font-semibold underline">
                    Sign in
                  </button>{" "}
                  to see your contract price.
                </p>
              )}
              <Btn className="w-full" disabled={!lines.length}
                onClick={() => { if (!user) { setOpenCart(false); setModal("signin"); } }}>
                {user ? "Continue to PO number" : "Sign in to check out"}
              </Btn>
            </div>
          </div>
        </div>
      )}

      <AuthModals modal={modal} setModal={setModal} />
    </div>
  );
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>;
}
