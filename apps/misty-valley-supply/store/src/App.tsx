import * as React from "react";
import { PRODUCTS, type Product } from "@/data";
import { AuthModals, AuthProvider, useAuth, type Modal } from "@/auth";
import { Btn, Lab, Rule, cx, money } from "@/ui";
import Home from "@/views/Home";
import Shop from "@/views/Shop";
import ProductView from "@/views/Product";
import Yard from "@/views/Yard";
import Account from "@/views/Account";
import Ops from "@/views/Ops";
import Rent from "@/views/Rent";
import Services from "@/views/Services";
import Runs from "@/views/Runs";
import Agents from "@/views/Agents";
import Dashboard from "@/views/Dashboard";
import Users from "@/views/Users";

import type { Perm } from "@/rbac";
import { InstallBar } from "@/pwa";
import { Glyph } from "@/glyph";

// The three Design Center tools carry three.js — they stay out of the main
// bundle and load on demand.
const Screen = React.lazy(() => import("@/views/Screen"));
const Shed = React.lazy(() => import("@/views/Shed"));
const Deck = React.lazy(() => import("@/views/Deck"));
const Container = React.lazy(() => import("@/views/Container"));
const Dock = React.lazy(() => import("@/views/Dock"));
const Barndo = React.lazy(() => import("@/views/Barndo"));
const Warehouse = React.lazy(() => import("@/views/Warehouse"));
const Program = React.lazy(() => import("@/views/Program"));

type View = "home" | "dash" | "shop" | "product" | "design" | "screen" | "shed" | "deck" | "container" | "dock" | "barndo" | "warehouse" | "program" | "rent" | "runs" | "yard" | "account" | "users" | "ops" | "agents" | "services";
type CartLine = { sku: string; qty: number };

const NAV: { id: View; label: string; short: string; sub: string; icon: React.ReactNode;
             bar?: boolean; need?: Perm; auth?: boolean }[] = [
  { id: "home", label: "Home", short: "Home", sub: "Start here", bar: true,
    icon: <path d="M3 11 12 3l9 8M6 10v11h12V10" /> },
  { id: "dash", label: "Dashboard", short: "Home", sub: "Your work, by role", auth: true,
    icon: <path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-5H3zM13 8h8V3h-8z" /> },
  { id: "shop", label: "Catalog", short: "Shop", sub: "Safety & edge protection", bar: true,
    icon: <path d="M3 6h18M6 6v13h12V6M9 10h6" /> },
  { id: "design", label: "Design Center", short: "Design", sub: "Build it in 3D, priced live", bar: true,
    icon: <path d="M3 19h18M5 19V8l7-4 7 4v11M9 19v-6h6v6" /> },
  { id: "runs", label: "Delivery", short: "Delivery", sub: "Any counter in town, today", bar: true,
    icon: <path d="M2 16V7h11v9M13 10h5l4 4v2h-2M2 16h2m5 0h6" /> },
  { id: "yard", label: "The Yard", short: "Yard", sub: "Marketplace",
    icon: <path d="M4 5h16M4 12h16M4 19h10" /> },
  { id: "account", label: "My Account", short: "Account", sub: "Orders, invoices, lists", bar: true,
    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></> },
  { id: "users", label: "Users & Roles", short: "Users", sub: "Who can do what", need: "user.invite",
    icon: <><circle cx="9" cy="8" r="3.4" /><path d="M2 21c0-3.9 3.1-6.2 7-6.2s7 2.3 7 6.2M17 4.5a3.4 3.4 0 0 1 0 7M18 21h4c0-2.7-1.4-4.5-3.6-5.4" /></> },
  { id: "ops", label: "Operations", short: "Ops", sub: "Back office", need: "report.company",
    icon: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /> },
  { id: "agents", label: "Agent API", short: "API", sub: "MCP interface",
    icon: <path d="M8 6 3 12l5 6M16 6l5 6-5 6M13 4l-2 16" /> },
];


/* Department tree per brand/NAV-ARCHITECTURE.md: 5-7 departments, PPE under
   one roof, fabrication first, the marketplace as its own divider. The left
   rail sells; the workspace group is where the software lives. */
const DEPARTMENTS: { label: string; sub: string; go: { view: View; cat?: string };
                     cats?: string[]; kids?: { label: string; cat: string }[];
                     tools?: { label: string; view: View }[] }[] = [
  { label: "Building Materials", sub: "Siding, OSB, studs, drywall", go: { view: "shop", cat: "sheathing" },
    cats: ["siding", "sheathing", "drywall", "roofing", "site"],
    kids: [
      { label: "Siding", cat: "siding" },
      { label: "Sheathing & Framing", cat: "sheathing" },
      { label: "Drywall", cat: "drywall" },
      { label: "Roofing Accessories", cat: "roofing" },
      { label: "Site Protection & Erosion", cat: "site" },
    ] },
  { label: "Safety", sub: "PPE, fall protection, edge", go: { view: "shop", cat: "fall" },
    cats: ["fall", "roof", "guard", "head", "eye", "hand", "hivis", "jobsite"],
    kids: [
      { label: "Fall Protection", cat: "fall" },
      { label: "Jobsite Compliance", cat: "jobsite" },
      { label: "Roof Safety", cat: "roof" },
      { label: "Guardrail & Edge", cat: "guard" },
      { label: "Head Protection", cat: "head" },
      { label: "Eye Protection", cat: "eye" },
      { label: "Hand Protection", cat: "hand" },
      { label: "Hi-Vis Apparel", cat: "hivis" },
    ] },
  { label: "Building Structures", sub: "Conex, offices, rentals, modular", go: { view: "shop", cat: "structures" },
    cats: ["structures", "str"],
    kids: [
      { label: "Site Structures", cat: "structures" },
      { label: "Short-Term Rental Units", cat: "str" },
    ] },
  { label: "Design Center", sub: "Screens, studios, decks — in 3D", go: { view: "design" },
    tools: [
      { label: "Roof Screens", view: "screen" },
      { label: "Backyard Studios", view: "shed" },
      { label: "Decks", view: "deck" },
    ] },
  { label: "Services", sub: "Drafting, takeoffs, design-build", go: { view: "services" } },
  { label: "Rentals", sub: "Day, week, 4-week", go: { view: "rent" } },
];

const deptCount = (cats?: string[]) =>
  cats ? PRODUCTS.filter(p => cats.includes(p.cat)).length : 0;

/* The Design Center tools. The Design tab opens a picker — no tool is the
   default; the customer chooses what they're building. */
const DESIGN_TOOLS: { view: View; label: string; chip: string; sub: string; sku: string }[] = [
  { view: "shed", label: "Backyard Studios", chip: "Studios", sub: "Sheds, studios, small buildings", sku: "MVS-STR-CAB1236" },
  { view: "deck", label: "Decks", chip: "Decks", sub: "PT decks, framed to code", sku: "MVS-PT-5412" },
  { view: "screen", label: "Roof Screens", chip: "Screens", sub: "Rooftop equipment screens", sku: "MVS-RSF-SC3" },
  { view: "container", label: "Containers", chip: "Containers", sub: "Offices, storage, interior layouts", sku: "MVS-CX-20OT" },
  { view: "dock", label: "Lake Docks", chip: "Docks", sub: "Floating docks — Nolin, Rough, Barren", sku: "MVS-DK-SEC410" },
  { view: "barndo", label: "Barndominiums", chip: "Barndos", sub: "Shop + living quarters, one shell", sku: "MVS-PB-4060" },
  { view: "warehouse", label: "Warehouses", chip: "Warehouse", sub: "Clear-span distribution shells", sku: "MVS-PB-50100" },
  { view: "program", label: "Modular Projects", chip: "Modular", sub: "Hotels, schools, offices, apartments", sku: "MVS-ST-GLO20" },
];

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
    strokeLinecap="square" className="h-[22px] w-[22px] shrink-0">{children}</svg>
);

function Inner() {
  const { user, person, role, can, branch } = useAuth();
  const [view, setView] = React.useState<View>("home");
  const [cart, setCart] = React.useState<CartLine[]>([]);
  const [openCart, setOpenCart] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [preCat, setPreCat] = React.useState<string | undefined>();
  const [modal, setModal] = React.useState<Modal>(null);
  const [productSku, setProductSku] = React.useState<string | null>(null);

  const lines = cart.map(c => ({ ...c, p: PRODUCTS.find(p => p.sku === c.sku)! })).filter(l => l.p);
  const listTotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const netTotal = user ? Math.round(listTotal * (1 - user.discountPct / 100) * 100) / 100 : listTotal;
  const count = cart.reduce((s, c) => s + c.qty, 0);

  const go = (v: View) => { setView(v); window.scrollTo({ top: 0 }); };
  const goShop = (cat?: string) => { setPreCat(cat); go("shop"); };
  const search = (q: string) => { setQuery(q); setPreCat(undefined); go("shop"); };
  const openProduct = (sku: string) => { setProductSku(sku); go("product"); };

  /** Add a line to the order and open the drawer so the add is visible. */
  const addLine = (sku: string, qty: number) => {
    const at = cart.find(c => c.sku === sku);
    setCart(at ? cart.map(c => c.sku === sku ? { ...c, qty: c.qty + qty } : c) : [...cart, { sku, qty }]);
    setOpenCart(true);
  };

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenCart(false); };
    const s = () => setModal("signin"); // design tools request the estimate gate
    window.addEventListener("mvs-signin", s);
    window.addEventListener("keydown", k);
    return () => { window.removeEventListener("keydown", k); window.removeEventListener("mvs-signin", s); };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = openCart || modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openCart, modal]);

  const visible = NAV.filter(n =>
    (!n.need || can(n.need)) && (!n.auth || !!person));
  const isActive = (id: View) => view === id || (id === "shop" && view === "product");
  const bar = visible.filter(n => n.bar).slice(0, 5);

  // landing on sign-in: each role has a home view
  const prevPerson = React.useRef<string | null>(null);
  React.useEffect(() => {
    const id = person?.id ?? null;
    if (id && id !== prevPerson.current && role) go(role.home as View);
    prevPerson.current = id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person?.id]);

  /* The Design Center is an app, not a page — when a design tool is open the
     header sheds the utility strip and search so the model owns the screen. */
  const inDesign = view === "design" || view === "screen" || view === "shed" || view === "deck" || view === "container" || view === "dock" || view === "barndo" || view === "warehouse" || view === "program";

  return (
    <div className="min-h-full pb-[calc(60px+env(safe-area-inset-bottom))] lg:pb-0">
      {/* ---------------------------------------------------------- header */}
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--marine-2))] bg-[hsl(var(--marine-2))] text-white">
        <div className="h-1 bg-[hsl(var(--safety-hi))]" />

        {/* utility strip */}
        <div className="border-b border-white/10" hidden={inDesign}>
          <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-1.5 sm:px-6">
            <button onClick={() => setModal("branch")}
              className="flex items-center gap-1.5 text-[13px] text-[hsl(var(--on-dark-2))] hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" />
              </svg>
              <span className="hidden sm:inline">Branch:</span> {branch.name}
              <span className="text-white/40">▾</span>
            </button>
            <a href={`tel:${branch.phone.replace(/[^0-9+]/g, "")}`}
              className="hidden min-h-[44px] items-center gap-1.5 text-[13px] font-medium text-white/85 hover:text-white sm:flex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
              </svg>
              {branch.phone}
              <span className="hidden text-[12px] font-normal text-white/55 lg:inline">· talk to a person</span>
            </a>
            <div className="ml-auto flex items-center gap-3">
              {user ? (
                <button onClick={() => go(role?.home === "account" ? "account" : "dash")}
                  className="text-[13px] text-[hsl(var(--on-dark-2))] hover:text-white">
                  {person?.name} · <span className="text-[hsl(var(--safety-hi))]">{role?.name}</span>
                </button>
              ) : (
                <>
                  <button onClick={() => setModal("signin")} className="text-[13px] text-[hsl(var(--on-dark-2))] hover:text-white">
                    Sign in
                  </button>
                  <span className="text-white/20">|</span>
                  <button onClick={() => setModal("credit")}
                    className="text-[13px] font-medium text-[hsl(var(--safety-hi))] hover:underline">
                    Open a credit account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* brand + cart */}
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2 sm:gap-5 sm:px-6 sm:py-2.5">
          <button onClick={() => go("home")} className="flex min-h-[44px] min-w-0 items-center gap-2 text-left sm:gap-3">
            {/* the MV diamond, carried over from Misty Valley Contracting's mark */}
            <svg viewBox="0 0 88 40" aria-hidden className="h-[26px] w-[57px] shrink-0 sm:h-[30px] sm:w-[66px]">
              <polygon points="44,1 87,20 44,39 1,20" fill="hsl(var(--marine))" stroke="hsl(var(--safety-hi))" strokeWidth="1.5" />
              <text x="44" y="27" textAnchor="middle" fill="hsl(var(--safety-hi))"
                style={{ font: "800 21px Archivo, Arial, sans-serif", letterSpacing: "-0.5px" }}>MV</text>
            </svg>
            <span className="flex min-w-0 items-baseline gap-1.5 sm:gap-2.5">
              <span className="disp truncate text-[18px] font-bold leading-none sm:text-[22px]">Misty Valley</span>
              <span className="disp text-[18px] font-bold leading-none text-[hsl(var(--safety-hi))] sm:text-[22px]">Supply</span>
            </span>
          </button>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button onClick={() => go("account")} aria-label="My account"
              className="hidden h-11 items-center gap-2 rounded-[6px] border border-white/25 px-3.5 text-[13px] font-medium hover:border-white/60 sm:flex">
              {user ? "Account" : "Sign in"}
            </button>
            <button onClick={() => setOpenCart(true)} aria-label="Open order"
              className="flex h-11 items-center gap-2 rounded-[6px] border border-white/25 px-3.5 text-[13px] font-medium hover:border-white/60">
              Order
              <span className={cx("num rounded-full px-2 py-px text-[11px] font-bold",
                count ? "bg-[hsl(var(--safety-hi))] text-[hsl(var(--marine-2))]" : "bg-white/15")}>{count}</span>
            </button>
          </div>
        </div>

        {/* search */}
        <div className="pb-2.5 sm:pb-3" hidden={inDesign}>
          <div className="mx-auto flex max-w-[1400px] px-3 sm:px-6">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[hsl(var(--ink-3))]">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-4.5-4.5" />
              </svg>
              <input value={query}
                onChange={e => { setQuery(e.target.value); if (view !== "shop") go("shop"); }}
                placeholder="Search a part, a brand, or an OSHA cite" aria-label="Search the catalog"
                className="h-12 w-full rounded-l-[8px] border-0 bg-white pl-11 pr-9 text-[15px] text-[hsl(var(--ink))] outline-none placeholder:text-[hsl(var(--ink-3))] focus:ring-2 focus:ring-inset focus:ring-[hsl(var(--safety))]" />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search"
                  className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 text-[hsl(var(--ink-3))]">✕</button>
              )}
            </div>
            <button onClick={() => go("shop")} aria-label="Search"
              className="flex h-12 shrink-0 items-center justify-center rounded-r-[8px] bg-[hsl(var(--safety-2))] px-4 text-[15px] font-semibold text-white hover:bg-[hsl(var(--safety-press))] sm:px-7">
              <span className="hidden sm:inline">Search</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                className="h-[19px] w-[19px] sm:hidden"><circle cx="11" cy="11" r="7" /><path d="m20 20-4.5-4.5" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------ body */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:flex">
        <nav className="sticky top-[140px] hidden h-[calc(100vh-140px)] w-[228px] shrink-0 overflow-y-auto border-r border-[hsl(var(--rule))] py-6 pr-5 lg:block">
          <Lab kicker className="mb-2.5">Departments</Lab>
          {DEPARTMENTS.map(d => {
            const active = (d.tools?.some(t => t.view === view) ?? false) ||
              (d.go.view !== "shop" && view === d.go.view) ||
              (d.go.view === "shop" && view === "shop" && !!d.cats?.length && !!preCat && d.cats.includes(preCat));
            return (
              <div key={d.label} className="mb-0.5">
                <button
                  onClick={() => d.go.view === "shop" ? goShop(d.go.cat) : go(d.go.view)}
                  className={cx("flex min-h-[44px] w-full items-center justify-between gap-2 rounded-[6px] px-2.5 py-2 text-left",
                    active ? "bg-[hsl(var(--safety-soft))]" : "hover:bg-[hsl(var(--panel))]")}>
                  <span className="min-w-0">
                    <span className={cx("block text-[15px] font-semibold leading-[1.2]",
                      active ? "text-[hsl(var(--safety-2))]" : "text-[hsl(var(--ink))]")}>{d.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-[1.3] text-[hsl(var(--ink-3))]">{d.sub}</span>
                  </span>
                  {d.cats && (
                    <span className="num shrink-0 text-[11px] text-[hsl(var(--ink-3))]">{deptCount(d.cats)}</span>
                  )}
                </button>
                {d.tools && active && (
                  <div className="mb-1 ml-2.5 border-l border-[hsl(var(--rule))] pl-2.5">
                    {d.tools.map(t => (
                      <button key={t.view} onClick={() => go(t.view)}
                        className={cx("flex min-h-[36px] w-full items-center rounded-[4px] px-2 py-1 text-left text-[13px]",
                          view === t.view
                            ? "font-semibold text-[hsl(var(--safety-2))]"
                            : "text-[hsl(var(--ink-2))] hover:text-[hsl(var(--ink))]")}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
                {d.kids && active && (
                  <div className="mb-1 ml-2.5 border-l border-[hsl(var(--rule))] pl-2.5">
                    {d.kids.map(k => (
                      <button key={k.cat} onClick={() => goShop(k.cat)}
                        className={cx("flex min-h-[36px] w-full items-center justify-between gap-2 rounded-[4px] px-2 py-1 text-left text-[13px]",
                          view === "shop" && preCat === k.cat
                            ? "font-semibold text-[hsl(var(--safety-2))]"
                            : "text-[hsl(var(--ink-2))] hover:text-[hsl(var(--ink))]")}>
                        {k.label}
                        <span className="num text-[11px] text-[hsl(var(--ink-3))]">{deptCount([k.cat])}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={() => goShop(undefined)}
            className="mt-1 flex min-h-[44px] w-full items-center rounded-[6px] px-2.5 text-[13px] font-medium text-[hsl(var(--marine))] hover:underline">
            Shop everything ({PRODUCTS.length}) →
          </button>

          <Rule className="my-4" />
          <Lab kicker className="mb-2.5">Marketplace</Lab>
          <button onClick={() => go("runs")}
            className={cx("flex min-h-[44px] w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-left",
              view === "runs" ? "bg-[hsl(var(--safety-soft))]" : "hover:bg-[hsl(var(--panel))]")}>
            <span className="min-w-0">
              <span className={cx("block text-[15px] font-semibold leading-[1.2]",
                view === "runs" ? "text-[hsl(var(--safety-2))]" : "text-[hsl(var(--ink))]")}>Delivery</span>
              <span className="mt-0.5 block text-[11px] text-[hsl(var(--ink-3))]">Any counter in town, today</span>
            </span>
          </button>
          <button onClick={() => go("yard")}
            className={cx("flex min-h-[44px] w-full items-center justify-between rounded-[6px] px-2.5 py-2 text-left",
              view === "yard" ? "bg-[hsl(var(--safety-soft))]" : "hover:bg-[hsl(var(--panel))]")}>
            <span className="min-w-0">
              <span className={cx("block text-[15px] font-semibold leading-[1.2]",
                view === "yard" ? "text-[hsl(var(--safety-2))]" : "text-[hsl(var(--ink))]")}>The Yard</span>
              <span className="mt-0.5 block text-[11px] text-[hsl(var(--ink-3))]">Used &amp; surplus, pay on pickup</span>
            </span>
          </button>

          <Rule className="my-4" />
          <Lab kicker className="mb-2.5">Workspace</Lab>
          {visible.filter(n => ["dash", "users", "ops"].includes(n.id)).map(n => (
            <button key={n.id} onClick={() => go(n.id)}
              className={cx("flex min-h-[40px] w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-left",
                isActive(n.id) ? "bg-[hsl(var(--panel))] text-[hsl(var(--ink))]" : "text-[hsl(var(--ink-2))] hover:text-[hsl(var(--ink))]")}>
              <span className={isActive(n.id) ? "text-[hsl(var(--safety-2))]" : "text-[hsl(var(--ink-3))]"}>
                <Icon>{n.icon}</Icon>
              </span>
              <span className="text-[13px] font-medium">{n.label}</span>
            </button>
          ))}

          <Rule className="my-4" />
          <p className="px-2.5 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
            Prototype. Placeholder pricing; standards and OSHA cites are real.
          </p>
        </nav>

        <main className="min-w-0 flex-1 py-5 sm:py-6 lg:pl-8">
          {view === "home" && <Home onShop={goShop} onScreens={() => go("design")} onYard={() => go("yard")} onEarth={() => go("runs")}
            onSignIn={() => setModal("signin")} onSearch={search} />}
          {view === "shop" && <Shop cart={cart} setCart={setCart} query={query} setQuery={setQuery}
            preCat={preCat} onSignIn={() => setModal("signin")} onProduct={openProduct} />}
          {view === "product" && productSku && (
            <ProductView key={productSku} sku={productSku} onAdd={addLine}
              onBack={() => go("shop")} onProduct={openProduct} onSignIn={() => setModal("signin")} onDesign={v => go(v as View)} />
          )}
          {view === "dash" && <Dashboard onSignIn={() => setModal("signin")} />}
          {view === "design" && (
            /* The picker: one question, equal doors. */
            <div className="mx-auto max-w-[720px]">
              <h1 className="disp mb-5 mt-2 text-center text-[26px] font-bold leading-[1.05] sm:text-[34px]">
                What are you building?
              </h1>
              <div className="grid gap-3 sm:grid-cols-3">
                {DESIGN_TOOLS.map(t => (
                  <button key={t.view} onClick={() => go(t.view)}
                    className="card lift flex min-h-[150px] flex-col items-center justify-center gap-2.5 p-5 text-center">
                    <Glyph sku={t.sku} className="h-16 w-16" />
                    <span className="disp text-[17px] font-bold leading-[1.05]">{t.label}</span>
                    <span className="text-[12px] text-[hsl(var(--ink-3))]">{t.sub}</span>
                  </button>
                ))}
              </div>
              <p className="mt-5 text-center text-[13px] text-[hsl(var(--ink-2))]">
                Pick one — it's priced live as you design, and the quote is free.
              </p>
            </div>
          )}
          {(view === "screen" || view === "shed" || view === "deck" || view === "container" || view === "dock" || view === "barndo" || view === "warehouse" || view === "program") && (
            <>
              {/* in a tool: a quiet way back + sibling tools */}
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <button onClick={() => go("design")}
                  className="min-h-[44px] rounded-[6px] px-3 text-[14px] font-semibold text-[hsl(var(--marine))] hover:bg-[hsl(var(--marine-soft))]">
                  ‹ Design Center
                </button>
                {DESIGN_TOOLS.map(t => (
                  <button key={t.view} onClick={() => go(t.view)}
                    aria-current={view === t.view}
                    className={cx("min-h-[44px] rounded-[6px] border px-4 text-[14px] font-semibold transition-colors",
                      view === t.view
                        ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine))] text-white"
                        : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
                    {t.chip}
                  </button>
                ))}
              </div>
              <React.Suspense fallback={
                <div className="card grid min-h-[240px] place-items-center rounded-[8px]">
                  <span className="lab text-[hsl(var(--ink-2))]">Loading the Design Center…</span>
                </div>
              }>
                {view === "screen" && <Screen />}
                {view === "shed" && <Shed />}
                {view === "deck" && <Deck />}
                {view === "container" && <Container />}
                {view === "dock" && <Dock />}
                {view === "barndo" && <Barndo />}
                {view === "warehouse" && <Warehouse />}
                {view === "program" && <Program />}
              </React.Suspense>
            </>
          )}
          {view === "runs" && <Runs onSignIn={() => setModal("signin")} />}          {view === "users" && <Users onSignIn={() => setModal("signin")} />}
          {view === "rent" && <Rent onSignIn={() => setModal("signin")} />}
          {view === "services" && <Services />}
          {view === "yard" && <Yard />}
          {view === "account" && <Account onSignIn={() => setModal("signin")} />}
          {view === "ops" && <Ops />}
          {view === "agents" && <Agents />}
        </main>
      </div>

      <footer className="mt-8 border-t border-[hsl(var(--ink))]">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6">
          <div className="mb-3 flex flex-wrap gap-x-5 gap-y-2 lg:hidden">
            {visible.filter(n => !bar.includes(n)).map(n => (
              <button key={n.id} onClick={() => go(n.id)} className="lab text-[hsl(var(--ink-2))]">{n.label}</button>
            ))}
          </div>
          <div className="text-[11px] leading-[1.7] text-[hsl(var(--ink-3))]">
            Misty Valley Supply · Bonnieville, Kentucky · prototype build<br />
            Platform and agent interface by Allerion Technologies LLC · payments by Stripe Connect<br />
            Standards and OSHA citations are accurate. Prices, stock and suppliers are placeholders.
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------- mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--ink))] bg-[hsl(var(--panel))] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="grid grid-cols-5">
          {bar.map(n => (
            <button key={n.id} onClick={() => go(n.id)} aria-current={isActive(n.id)}
              className={cx("-mt-0.5 flex h-[60px] flex-col items-center justify-center gap-1 border-t-2",
                isActive(n.id) ? "border-[hsl(var(--marine))] text-[hsl(var(--marine))]"
                              : "border-transparent text-[hsl(var(--ink-3))]")}>
              <Icon>{n.icon}</Icon>
              <span className="text-[11px] font-semibold leading-none">{n.short}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ------------------------------------------------------------ cart */}
      {openCart && (
        <CartDrawer
          lines={lines} cart={cart} setCart={setCart}
          listTotal={listTotal} netTotal={netTotal}
          onClose={() => setOpenCart(false)}
          onSignIn={() => { setOpenCart(false); setModal("signin"); }}
        />
      )}

      <InstallBar />
      <AuthModals modal={modal} setModal={setModal} />
    </div>
  );
}


/* ------------------------------------------------------------- checkout */

let NEXT_SO = 1043;

/** The next n weekdays, for the delivery window picker. */
function nextBusinessDays(n: number) {
  const out: { day: string; date: string; full: string }[] = [];
  const d = new Date();
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    out.push({
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      full: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    });
  }
  return out;
}

/** "4471" reads as "PO 4471"; "PO-4471" stays as typed. */
const poLabel = (po: string) => (/^po\b|^po-/i.test(po.trim()) ? po.trim() : `PO ${po.trim()}`);

type DrawerLine = CartLine & { p: Product };
type ShipTo = { id: string; label: string; addr: string };

const drawerField =
  "h-11 w-full rounded-[6px] border border-[hsl(var(--field))] bg-[hsl(var(--panel))] px-3 text-[15px] outline-none focus:border-[hsl(var(--safety-2))]";

const optCls = (on: boolean) =>
  cx("w-full min-h-[44px] rounded-[6px] border bg-[hsl(var(--panel))] p-3 text-left transition-colors",
    on ? "border-[hsl(var(--safety-2))] shadow-[0_0_0_1px_hsl(var(--safety-2))]"
       : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink)/0.3)]");

function CartDrawer({
  lines, cart, setCart, listTotal, netTotal, onClose, onSignIn,
}: {
  lines: DrawerLine[]; cart: CartLine[]; setCart: (c: CartLine[]) => void;
  listTotal: number; netTotal: number;
  onClose: () => void; onSignIn: () => void;
}) {
  const { user, branch } = useAuth();

  // 0 = order · 1 = ship-to · 2 = terms + window · 3 = review
  const [step, setStep] = React.useState(0);
  const [extraSites, setExtraSites] = React.useState<ShipTo[]>([]);
  const [shipToId, setShipToId] = React.useState(user?.shipTos[0]?.id ?? "");
  const [addingSite, setAddingSite] = React.useState(false);
  const [siteLabel, setSiteLabel] = React.useState("");
  const [siteAddr, setSiteAddr] = React.useState("");
  const [terms, setTerms] = React.useState<"net30" | "card">("net30");
  const [po, setPo] = React.useState("");
  const days = React.useMemo(() => nextBusinessDays(5), []);
  const [dayIx, setDayIx] = React.useState(0);
  const [win, setWin] = React.useState<"AM" | "PM">("AM");
  const [placed, setPlaced] = React.useState<null | {
    so: string; total: number; saved: number; lineCount: number;
    shipTo: string; when: string; termsLabel: string;
  }>(null);

  const allSites = [...(user?.shipTos ?? []), ...extraSites];
  const shipTo = allSites.find(x => x.id === shipToId);
  const winLabel = (w: "AM" | "PM") => (w === "AM" ? "AM · 7:00–12:00" : "PM · 12:00–4:00");

  const saveSite = () => {
    if (!siteLabel.trim() || !siteAddr.trim()) return;
    const site = { id: `new-${Date.now()}`, label: siteLabel.trim(), addr: siteAddr.trim() };
    setExtraSites([...extraSites, site]);
    setShipToId(site.id);
    setAddingSite(false); setSiteLabel(""); setSiteAddr("");
  };

  const placeOrder = () => {
    if (!shipTo) return;
    setPlaced({
      so: `SO-${NEXT_SO++}`,
      total: netTotal,
      saved: Math.round((listTotal - netTotal) * 100) / 100,
      lineCount: lines.length,
      shipTo: `${shipTo.label} — ${shipTo.addr}`,
      when: `${days[dayIx].full}, ${winLabel(win)}`,
      termsLabel: terms === "net30" ? `Net 30 on account · ${poLabel(po)}` : "Card · Stripe",
    });
    setCart([]);
  };

  const stepTitle =
    placed ? "Order placed"
    : step === 0 ? "Order"
    : step === 1 ? "Where it's going"
    : step === 2 ? "Terms and delivery"
    : "Review and place";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={onClose}>
      <div className="flex h-full w-full flex-col bg-[hsl(var(--ground))] sm:max-w-[460px] sm:border-l-2 sm:border-[hsl(var(--safety))]"
        onClick={e => e.stopPropagation()}>

        {/* header */}
        <div className="border-b border-[hsl(var(--ink))] p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <h3 className="disp text-[22px] font-bold">{stepTitle}</h3>
            <button onClick={onClose} className="lab flex h-11 min-w-[44px] items-center justify-center px-2 text-[hsl(var(--ink-2))]">
              Close ✕
            </button>
          </div>
          {!placed && step > 0 && (
            <div className="mt-2.5">
              <div className="mb-1.5 text-[11px] font-medium text-[hsl(var(--ink-3))]">
                Checkout · step {step} of 3
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cx("h-1.5 flex-1 rounded-[4px]",
                    i <= step ? "bg-[hsl(var(--safety))]" : "bg-[hsl(var(--panel-2))]")} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">

          {/* ---------------------------------------------- confirmation */}
          {placed && (
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-[4px] border border-[hsl(var(--good)/0.25)] bg-[hsl(var(--good-soft))] px-2.5 py-1.5 text-[13px] font-semibold text-[hsl(var(--good))]">
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> On the board
              </div>
              <div className="ident text-[22px] text-[hsl(var(--ink))]">{placed.so}</div>
              <p className="mt-2 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                {placed.lineCount} {placed.lineCount === 1 ? "line" : "lines"} · {money(placed.total)}
                {placed.saved > 0 && <> · you saved {money(placed.saved)} off list</>}
              </p>
              <div className="card mt-4 overflow-hidden rounded-[6px]">
                {[["Deliver to", placed.shipTo], ["Window", placed.when], ["Terms", placed.termsLabel]].map(([k, v], i) => (
                  <div key={k} className={cx("px-3 py-2.5", i < 2 && "border-b border-[hsl(var(--rule))]")}>
                    <div className="text-[11px] font-medium text-[hsl(var(--ink-3))]">{k}</div>
                    <div className="mt-0.5 text-[13px] text-[hsl(var(--ink))]">{v}</div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                The {branch.name} branch will confirm each supplier's cut-off and lock your
                delivery window — if a line can't make the truck, you'll hear from a person,
                not a status page.
              </p>
            </div>
          )}

          {/* --------------------------------------------------- step 0 */}
          {!placed && step === 0 && (
            <>
              {lines.length === 0 && <p className="text-[hsl(var(--ink-2))]">Nothing on the order yet.</p>}
              {lines.map(l => (
                <div key={l.sku} className="mb-4 border-b border-[hsl(var(--rule))] pb-4 last:border-0">
                  <div className="mono mb-1 text-[11px] text-[hsl(var(--ink-3))]">{l.sku}</div>
                  <div className="disp mb-1 text-[18px] font-semibold leading-[1.1]">{l.p.name}</div>
                  <div className="mono mb-2.5 text-[11px] text-[hsl(var(--safety-2))]">{l.p.osha}</div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5">
                      <button aria-label="Decrease" className="h-11 w-11 rounded-[6px] border border-[hsl(var(--rule))] text-[15px]"
                        onClick={() => setCart(cart.map(c => c.sku === l.sku
                          ? { ...c, qty: Math.max(l.p.moq ?? 1, c.qty - (l.p.moq ?? 1)) } : c))}>–</button>
                      <span className="num w-12 text-center text-[15px]">{l.qty}</span>
                      <button aria-label="Increase" className="h-11 w-11 rounded-[6px] border border-[hsl(var(--rule))] text-[15px]"
                        onClick={() => setCart(cart.map(c => c.sku === l.sku
                          ? { ...c, qty: c.qty + (l.p.moq ?? 1) } : c))}>+</button>
                      <button className="lab ml-1 h-11 px-2 text-[hsl(var(--ink-3))]"
                        onClick={() => setCart(cart.filter(c => c.sku !== l.sku))}>Remove</button>
                    </div>
                    <div className="num text-[15px]">
                      {money((user ? l.p.price * (1 - user.discountPct / 100) : l.p.price) * l.qty)}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* --------------------------------------------------- step 1 */}
          {!placed && step === 1 && (
            <div className="grid gap-2">
              <p className="mb-1 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                Pick a jobsite or the shop. Delivery runs out of the {branch.name} branch.
              </p>
              {allSites.map(sTo => (
                <button key={sTo.id} onClick={() => setShipToId(sTo.id)} className={optCls(shipToId === sTo.id)}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px] font-semibold text-[hsl(var(--ink))]">{sTo.label}</span>
                    {shipToId === sTo.id && <span className="text-[11px] font-semibold text-[hsl(var(--safety-2))]">Selected</span>}
                  </div>
                  <div className="mt-0.5 text-[13px] text-[hsl(var(--ink-2))]">{sTo.addr}</div>
                </button>
              ))}
              {!addingSite ? (
                <button onClick={() => setAddingSite(true)}
                  className="min-h-[44px] rounded-[6px] border border-dashed border-[hsl(var(--field))] p-3 text-left text-[13px] font-medium text-[hsl(var(--marine))] hover:border-[hsl(var(--marine))]">
                  + Add a jobsite
                </button>
              ) : (
                <div className="card grid gap-3 rounded-[6px] p-3">
                  <label className="grid gap-1.5"><Lab>Jobsite name</Lab>
                    <input className={drawerField} value={siteLabel} onChange={e => setSiteLabel(e.target.value)}
                      placeholder="Hotel — Bowling Green" /></label>
                  <label className="grid gap-1.5"><Lab>Street address</Lab>
                    <input className={drawerField} value={siteAddr} onChange={e => setSiteAddr(e.target.value)}
                      placeholder="Street, city, state" /></label>
                  <div className="flex gap-2">
                    <Btn variant="line" size="sm" className="h-11" onClick={() => setAddingSite(false)}>Cancel</Btn>
                    <Btn size="sm" className="h-11 flex-1" disabled={!siteLabel.trim() || !siteAddr.trim()}
                      onClick={saveSite}>Save jobsite</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --------------------------------------------------- step 2 */}
          {!placed && step === 2 && (
            <div>
              <div className="mb-2 text-[13px] font-semibold text-[hsl(var(--ink))]">How you're paying</div>
              <div className="grid gap-2">
                <button onClick={() => setTerms("net30")} className={optCls(terms === "net30")}>
                  <div className="text-[15px] font-semibold text-[hsl(var(--ink))]">{user?.terms ?? "Net 30"} on account</div>
                  <div className="mt-0.5 text-[13px] text-[hsl(var(--ink-2))]">
                    Bills to {user?.company} · {money((user?.creditLimit ?? 0) - (user?.creditUsed ?? 0))} of credit open · PO required
                  </div>
                </button>
                <button onClick={() => setTerms("card")} className={optCls(terms === "card")}>
                  <div className="text-[15px] font-semibold text-[hsl(var(--ink))]">Card</div>
                  <div className="mt-0.5 text-[13px] text-[hsl(var(--ink-2))]">Pay now, no PO needed</div>
                </button>
              </div>

              {terms === "net30" ? (
                <label className="mt-4 grid gap-1.5"><Lab>PO number — required on account orders</Lab>
                  <input className={drawerField} value={po} onChange={e => setPo(e.target.value)}
                    placeholder="Job or PO reference" aria-required="true" />
                </label>
              ) : (
                <p className="card mt-4 rounded-[6px] p-3 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                  Card checkout runs on Stripe in production. This prototype doesn't take card
                  details — the order posts to your account and the branch collects on delivery.
                </p>
              )}

              <div className="mb-2 mt-5 text-[13px] font-semibold text-[hsl(var(--ink))]">Delivery window</div>
              <div className="grid grid-cols-5 gap-1.5">
                {days.map((d, i) => (
                  <button key={d.date} onClick={() => setDayIx(i)}
                    className={cx("min-h-[52px] rounded-[6px] border px-1 py-2 text-center transition-colors",
                      dayIx === i ? "border-[hsl(var(--safety-2))] bg-[hsl(var(--panel))] shadow-[0_0_0_1px_hsl(var(--safety-2))]"
                                  : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] hover:border-[hsl(var(--ink)/0.3)]")}>
                    <div className="text-[11px] font-medium text-[hsl(var(--ink-3))]">{d.day}</div>
                    <div className="mt-0.5 whitespace-nowrap text-[13px] font-semibold text-[hsl(var(--ink))]">{d.date}</div>
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {(["AM", "PM"] as const).map(w => (
                  <button key={w} onClick={() => setWin(w)}
                    className={cx("h-11 rounded-[6px] border text-[13px] font-semibold transition-colors",
                      win === w ? "border-[hsl(var(--safety-2))] bg-[hsl(var(--panel))] text-[hsl(var(--ink))] shadow-[0_0_0_1px_hsl(var(--safety-2))]"
                                : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink)/0.3)]")}>
                    {winLabel(w)}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                Windows are held until the branch confirms supplier cut-offs for each line.
              </p>
            </div>
          )}

          {/* --------------------------------------------------- step 3 */}
          {!placed && step === 3 && (
            <div>
              <div className="card overflow-hidden rounded-[6px]">
                {lines.map(l => (
                  <div key={l.sku} className="flex items-baseline justify-between gap-3 border-b border-[hsl(var(--rule))] px-3 py-2.5">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-[hsl(var(--ink))]">{l.p.name}</div>
                      <div className="ident mt-0.5 text-[11px] text-[hsl(var(--ink-3))]">{l.sku} · qty {l.qty}</div>
                    </div>
                    <div className="num shrink-0 text-[13px] font-medium text-[hsl(var(--ink))]">
                      {money((user ? l.p.price * (1 - user.discountPct / 100) : l.p.price) * l.qty)}
                    </div>
                  </div>
                ))}
                <div className="bg-[hsl(var(--panel-2))] px-3 py-2.5">
                  <div className="flex items-baseline justify-between text-[13px] text-[hsl(var(--ink-2))]">
                    <span>List price</span><span className="num line-through">{money(listTotal)}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-[13px] font-medium text-[hsl(var(--good))]">
                    <span>Contract savings</span><span className="num">−{money(listTotal - netTotal)}</span>
                  </div>
                  <div className="mt-1.5 flex items-baseline justify-between">
                    <span className="text-[15px] font-semibold text-[hsl(var(--ink))]">Material</span>
                    <span className="num text-[18px] font-bold text-[hsl(var(--ink))]">{money(netTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="card mt-3 overflow-hidden rounded-[6px]">
                {[
                  ["Deliver to", shipTo ? `${shipTo.label} — ${shipTo.addr}` : "—", 1],
                  ["Window", `${days[dayIx].full} · ${winLabel(win)}`, 2],
                  ["Terms", terms === "net30" ? `${user?.terms ?? "Net 30"} on account · ${poLabel(po)}` : "Card · Stripe", 2],
                ].map(([k, v, editStep], i) => (
                  <div key={k as string} className={cx("flex items-center justify-between gap-3 px-3 py-2",
                    i < 2 && "border-b border-[hsl(var(--rule))]")}>
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-[hsl(var(--ink-3))]">{k}</div>
                      <div className="mt-0.5 text-[13px] text-[hsl(var(--ink))]">{v}</div>
                    </div>
                    <button onClick={() => setStep(editStep as number)}
                      className="flex h-11 shrink-0 items-center px-2 text-[13px] font-medium text-[hsl(var(--marine))] hover:underline">
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                Placing the order sends it to the {branch.name} branch for routing. Nothing
                ships until a person confirms the promise date.
              </p>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="border-t border-[hsl(var(--ink))] p-4 pb-[calc(16px+env(safe-area-inset-bottom))] sm:p-5">
          {placed ? (
            <Btn className="w-full" onClick={onClose}>Done</Btn>
          ) : step === 0 ? (
            <>
              {user && listTotal > 0 && (
                <div className="mb-1.5 flex items-baseline justify-between text-[13px] text-[hsl(var(--ink-3))]">
                  <span>List {money(listTotal)}</span>
                  <span className="text-[hsl(var(--good))]">You save {money(listTotal - netTotal)}</span>
                </div>
              )}
              <div className="mb-2.5 flex items-baseline justify-between">
                <span className="disp text-[18px] font-bold">Material</span>
                <span className="disp num text-[28px] font-bold leading-none">{money(netTotal)}</span>
              </div>
              {!user && (
                <p className="mb-3 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                  Showing list price.{" "}
                  <button onClick={onSignIn} className="font-semibold text-[hsl(var(--safety-2))] underline">
                    Sign in
                  </button>{" "}
                  to see your contract price.
                </p>
              )}
              <Btn className="w-full" disabled={!lines.length}
                onClick={() => { if (!user) onSignIn(); else setStep(1); }}>
                {user ? "Continue to checkout" : "Sign in to check out"}
              </Btn>
            </>
          ) : (
            <div className="flex gap-2">
              <Btn variant="line" onClick={() => setStep(step - 1)}>Back</Btn>
              {step === 1 && <Btn className="flex-1" disabled={!shipTo} onClick={() => setStep(2)}>Continue to terms</Btn>}
              {step === 2 && (
                <Btn className="flex-1" disabled={terms === "net30" && !po.trim()} onClick={() => setStep(3)}>
                  Review order
                </Btn>
              )}
              {step === 3 && <Btn className="flex-1" onClick={placeOrder}>Place order</Btn>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><Inner /></AuthProvider>;
}
