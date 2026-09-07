import * as React from "react";
import { CATEGORIES, PRODUCTS, type Product } from "@/data";
import { Glyph } from "@/glyph";
import { Price } from "@/auth";
import { Btn, Tag, cx, money } from "@/ui";

type CartLine = { sku: string; qty: number };

const fulfilTone = (f: Product["fulfil"]) =>
  f === "stock" ? "good" : f === "fabricate" ? "safety" : "steel";
const fulfilName = (f: Product["fulfil"]) =>
  f === "stock" ? "In stock" : f === "fabricate" ? "Made to order" : "Ships from supplier";

const STD_FAMILIES = [
  { id: "Z87", label: "ANSI Z87.1 — eye" },
  { id: "Z89", label: "ANSI Z89.1 — head" },
  { id: "105", label: "ANSI 105 — cut" },
  { id: "107", label: "ANSI 107 — hi-vis" },
  { id: "Z359", label: "ANSI Z359 — fall" },
  { id: "OSHA", label: "OSHA 1926.502" },
];

/* Department groupings for the landing header — mirrors the rail in App.tsx. */
const DEPT_DEFS = [
  { name: "Building Materials", sub: "Siding, sheathing, drywall, roofing accessories and site protection, delivered to the job.",
    cats: ["siding", "sheathing", "drywall", "roofing", "site"] },
  { name: "Safety", sub: "PPE, fall protection and edge systems — every line lists the standard it is built to.",
    cats: ["fall", "roof", "guard", "head", "eye", "hand", "hivis", "jobsite"] },
  { name: "Building Structures", sub: "Shipping containers, ground-level offices and custom modular buildings.",
    cats: ["structures"] },
];

const SORTS = [
  { id: "rel", label: "Relevance" },
  { id: "asc", label: "Price, low to high" },
  { id: "desc", label: "Price, high to low" },
  { id: "name", label: "Name, A–Z" },
];

/* --------------------------------------------------------------- filters */

function Facet({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="border-b border-[hsl(var(--rule))] py-3">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left">
        <span className="disp text-[15px] font-semibold">{title}</span>
        <span className="text-[13px] text-[hsl(var(--ink-3))]">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="mt-2.5 grid gap-1.5">{children}</div>}
    </div>
  );
}

function Check({
  on, onChange, label, count,
}: { on: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[13px]">
      <span className={cx("flex h-[17px] w-[17px] shrink-0 items-center justify-center border",
        on ? "border-[hsl(var(--safety))] bg-[hsl(var(--safety))]" : "border-[hsl(var(--ink-3))] bg-transparent")}>
        {on && <svg viewBox="0 0 12 12" className="h-3 w-3" stroke="#fff" strokeWidth="2.2" fill="none">
          <path d="M2 6.5 4.8 9 10 3.5" /></svg>}
      </span>
      <input type="checkbox" checked={on} onChange={onChange} className="sr-only" />
      <span className="min-w-0 flex-1">{label}</span>
      {count != null && <span className="text-[11px] text-[hsl(var(--ink-3))]">{count}</span>}
    </label>
  );
}

/* ----------------------------------------------------------------- rows */

function Row({
  p, onAdd, onSpec, onSignIn,
}: { p: Product; onAdd: (sku: string, qty: number) => void; onSpec: () => void; onSignIn: () => void }) {
  const min = p.moq ?? 1;
  const [qty, setQty] = React.useState(min);
  return (
    <article className="grid grid-cols-[84px_1fr] gap-3.5 border-b border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-3 transition-colors hover:bg-[hsl(var(--panel-2))]/60 sm:grid-cols-[128px_1fr_200px] sm:gap-5 sm:p-4">
      {/* image */}
      <button onClick={onSpec}
        className="flex aspect-square items-center justify-center overflow-hidden plate rounded-[6px] border border-[hsl(var(--rule))]">
        {p.img
          ? <img src={p.img} alt={p.name} className="h-full w-full object-contain" />
          : <Glyph sku={p.sku} cat={p.cat} className="h-[78%] w-[78%]" />}
      </button>

      {/* detail */}
      <div className="min-w-0">
        <button onClick={onSpec} className="text-left">
          <h3 className="text-[15px] font-semibold leading-[1.25] text-[hsl(var(--ink))] hover:text-[hsl(var(--marine))] sm:text-[18px]">
            {p.name}
          </h3>
        </button>
        <div className="ident mt-1.5 text-[11px] text-[hsl(var(--ink-3))]">
          {p.sku} · {p.supplier}
        </div>

        {/* One sentence, not a definition list: what it is built to, and what
            requires it. This is the reason to buy here rather than anywhere. */}
        <p className="mt-2 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
          Built to <span className="ident text-[hsl(var(--ink))]">{p.std}</span>
          {" · required by "}
          <button onClick={onSpec}
            className="ident text-[hsl(var(--safety-2))] underline underline-offset-2 hover:text-[hsl(var(--safety-press))]">
            {p.osha}
          </button>
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Tag tone={fulfilTone(p.fulfil) as never}>{fulfilName(p.fulfil)}</Tag>
          <span className="text-[13px] text-[hsl(var(--ink-2))]">Ships {p.lead}</span>
          {p.hot && <Tag tone="safety">Frequently bought</Tag>}
        </div>

        {/* mobile price + buy */}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3 sm:hidden">
          <Price list={p.price} uom={p.uom} onSignIn={onSignIn} size="sm" />
          <div className="flex items-center gap-1.5">
            <input type="number" min={min} step={min} value={qty}
              onChange={e => setQty(Math.max(min, Number(e.target.value) || min))}
              className="num h-11 w-16 rounded-[6px] border border-[hsl(var(--field))] bg-white px-2 text-center text-[15px] font-medium outline-none focus:border-[hsl(var(--safety-2))]" />
            <Btn size="sm" className="h-10" onClick={() => onAdd(p.sku, qty)}>Add</Btn>
          </div>
        </div>
      </div>

      {/* desktop price + buy */}
      <div className="hidden border-l border-[hsl(var(--rule))] pl-4 sm:block">
        <Price list={p.price} uom={p.uom} onSignIn={onSignIn} />
        {min > 1 && <div className="mt-1.5 text-[11px] font-medium text-[hsl(var(--warn))]">Minimum order {min}</div>}
        <div className="mt-3 flex items-center gap-1.5">
          <input type="number" min={min} step={min} value={qty}
            onChange={e => setQty(Math.max(min, Number(e.target.value) || min))}
            className="num h-10 w-16 rounded-[6px] border border-[hsl(var(--field))] bg-white px-2 text-center text-[15px] font-medium outline-none focus:border-[hsl(var(--safety-2))]" />
          <Btn size="sm" className="flex-1" onClick={() => onAdd(p.sku, qty)}>Add</Btn>
        </div>
        <button onClick={onSpec} className="mt-2.5 text-[13px] font-medium text-[hsl(var(--marine))] hover:underline">
          Full spec and compliance →
        </button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- shop */

function useEscape(onClose: () => void, active: boolean) {
  React.useEffect(() => {
    if (!active) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose, active]);
}

export default function Shop({
  cart, setCart, query, setQuery, preCat, onSignIn, onProduct,
}: {
  cart: CartLine[]; setCart: (c: CartLine[]) => void;
  query: string; setQuery: (q: string) => void;
  preCat?: string; onSignIn: () => void;
  onProduct: (sku: string) => void;
}) {
  const [cats, setCats] = React.useState<string[]>(preCat ? [preCat] : []);
  React.useEffect(() => { if (preCat) setCats([preCat]); }, [preCat]);
  const [stds, setStds] = React.useState<string[]>([]);
  const [fulfils, setFulfils] = React.useState<string[]>([]);
  const [maxPrice, setMaxPrice] = React.useState(0);
  const [sort, setSort] = React.useState("rel");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  useEscape(() => setFiltersOpen(false), filtersOpen);
  const [modOpen, setModOpen] = React.useState(false);
  const [modType, setModType] = React.useState("Site office");
  const [modSize, setModSize] = React.useState("");
  const [modNotes, setModNotes] = React.useState("");
  const [modShots, setModShots] = React.useState<{ name: string; url: string }[]>([]);
  const [modSent, setModSent] = React.useState(false);
  useEscape(() => setModOpen(false), modOpen);
  const addModShots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = Array.from(e.target.files ?? []).slice(0, 6 - modShots.length);
    setModShots(x => [...x, ...fs.map(f => ({ name: f.name, url: URL.createObjectURL(f) }))]);
    e.target.value = "";
  };

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const q = query.trim().toLowerCase();
  let list = PRODUCTS.filter(p => {
    if (cats.length && !cats.includes(p.cat)) return false;
    if (fulfils.length && !fulfils.includes(p.fulfil)) return false;
    if (maxPrice && p.price > maxPrice) return false;
    if (stds.length && !stds.some(s => p.std.includes(s) || (s === "OSHA" && p.osha.includes("502")))) return false;
    if (q && !`${p.name} ${p.sku} ${p.std} ${p.osha} ${p.note}`.toLowerCase().includes(q)) return false;
    return true;
  });
  if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

  const add = (sku: string, qty: number) => {
    const at = cart.find(c => c.sku === sku);
    setCart(at ? cart.map(c => c.sku === sku ? { ...c, qty: c.qty + qty } : c) : [...cart, { sku, qty }]);
  };

  const countIn = (cat: string) => PRODUCTS.filter(p => p.cat === cat).length;
  const activeCount = cats.length + stds.length + fulfils.length + (maxPrice ? 1 : 0);
  const clear = () => { setCats([]); setStds([]); setFulfils([]); setMaxPrice(0); };

  const Filters = (
    <>
      <div className="flex items-center justify-between border-b border-[hsl(var(--ink))] pb-2">
        <span className="disp text-[18px] font-bold">Filter</span>
        {activeCount > 0 && (
          <button onClick={clear} className="lab flex min-h-[44px] items-center !text-[hsl(var(--safety-2))] underline underline-offset-2">Clear {activeCount}</button>
        )}
      </div>
      <Facet title="Category">
        {CATEGORIES.map(c => (
          <Check key={c.id} on={cats.includes(c.id)} onChange={() => toggle(cats, setCats, c.id)}
            label={c.name} count={countIn(c.id)} />
        ))}
      </Facet>
      <Facet title="Standard">
        {STD_FAMILIES.map(s => (
          <Check key={s.id} on={stds.includes(s.id)} onChange={() => toggle(stds, setStds, s.id)} label={s.label} />
        ))}
      </Facet>
      <Facet title="Availability">
        {[["dropship", "Ships from supplier"], ["fabricate", "Made to order"], ["stock", "In stock"]].map(([id, l]) => (
          <Check key={id} on={fulfils.includes(id)} onChange={() => toggle(fulfils, setFulfils, id)} label={l} />
        ))}
      </Facet>
      <Facet title="Price">
        {[0, 25, 100, 500].map(v => (
          <Check key={v} on={maxPrice === v && v !== 0} onChange={() => setMaxPrice(maxPrice === v ? 0 : v)}
            label={v === 0 ? "Any price" : `Under ${money(v)}`} />
        ))}
      </Facet>
    </>
  );

  const activeCat = cats.length === 1 ? CATEGORIES.find(c => c.id === cats[0]) ?? null : null;
  const activeDept = cats.length
    ? DEPT_DEFS.find(d => cats.every(c => d.cats.includes(c))) ?? null
    : null;

  return (
    <div>
      {/* department landing header — title, blurb and sibling subcategories
          all follow the active category, so each department reads as its own page */}
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="text-[11px] text-[hsl(var(--ink-3))]">
          Home{activeDept && <> / {activeDept.name}</>}
          {activeCat && <> / <span className="text-[hsl(var(--ink))]">{activeCat.name}</span></>}
          {q && <> / “{query}”</>}
        </div>
      </div>

      <h1 className="disp mb-1 text-[28px] font-bold leading-none sm:text-[40px]">
        {q ? "Search results" : activeCat ? activeCat.name : activeDept ? activeDept.name : "Shop everything"}
      </h1>
      {!q && (activeCat?.blurb || activeDept) && (
        <p className="mb-4 max-w-[75ch] text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
          {activeCat?.blurb ?? activeDept?.sub}
        </p>
      )}
      {activeDept && activeDept.cats.length > 1 && !q && (
        <div className="mb-5 flex flex-wrap gap-2">
          {activeDept.cats.map(cid => {
            const c = CATEGORIES.find(x => x.id === cid);
            if (!c) return null;
            const on = cats.length === 1 && cats[0] === cid;
            return (
              <button key={cid} onClick={() => setCats([cid])}
                className={cx("flex min-h-[40px] items-center gap-2 rounded-[6px] border px-3 text-[13px] font-medium",
                  on ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine-soft))] text-[hsl(var(--marine))]"
                     : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] hover:border-[hsl(var(--ink-3))]")}>
                <Glyph cat={cid} className="h-5 w-5" />
                {c.name}
                <span className="num text-[11px] text-[hsl(var(--ink-3))]">
                  {PRODUCTS.filter(p => p.cat === cid).length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[228px_1fr] lg:gap-7">
        {/* desktop facets */}
        <aside className="hidden lg:block">{Filters}</aside>

        <div className="min-w-0">
          {/* toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[hsl(var(--rule))] pb-3">
            <span className="text-[13px]">
              <strong className="text-[hsl(var(--ink))]">{list.length}</strong>
              <span className="text-[hsl(var(--ink-3))]"> of {PRODUCTS.length} items</span>
            </span>
            <button onClick={() => setFiltersOpen(true)}
              className="lab flex h-11 items-center gap-2 rounded-[6px] border border-[hsl(var(--ink))] px-3.5 !text-[hsl(var(--ink))] lg:hidden">
              Filter {activeCount > 0 && <span className="bg-[hsl(var(--safety))] px-1.5 text-white">{activeCount}</span>}
            </button>
            <label className="ml-auto flex items-center gap-2">
              <span className="lab hidden sm:inline">Sort</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="h-11 rounded-[6px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-2 text-[13px] sm:h-10">
                {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {cats.length === 1 && cats[0] === "structures" && (
            <div className="card-hi mb-4 overflow-hidden">
              <div className="tape h-1" />
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold">Need something custom — an office, a tiny home, a lash-up of both?</div>
                  <p className="mt-1 text-[13px] leading-[1.45] text-[hsl(var(--ink-2))]">
                    Send sizes, photos and what it has to do; we quote one number, delivered set.
                  </p>
                </div>
                <button onClick={() => { setModOpen(true); setModSent(false); }}
                  className="inline-flex h-11 shrink-0 items-center rounded-[6px] bg-[hsl(var(--safety-2))] px-5 text-[15px] font-semibold text-white hover:bg-[hsl(var(--safety-press))]">
                  Start a design intake
                </button>
              </div>
            </div>
          )}

          {/* active chips */}
          {activeCount > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {[...cats.map(c => [c, CATEGORIES.find(x => x.id === c)!.name, () => toggle(cats, setCats, c)] as const),
                ...stds.map(s => [s, s, () => toggle(stds, setStds, s)] as const),
                ...fulfils.map(f => [f, fulfilName(f as Product["fulfil"]), () => toggle(fulfils, setFulfils, f)] as const),
              ].map(([id, label, off]) => (
                <button key={id} onClick={off}
                  className="lab flex min-h-[44px] items-center gap-1.5 rounded-[6px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-2.5 sm:min-h-[36px]">
                  {label} <span className="text-[hsl(var(--ink-3))]">✕</span>
                </button>
              ))}
            </div>
          )}

          {/* rows */}
          <div className="border border-[hsl(var(--rule))]">
            {list.map(p => (
              <Row key={p.sku} p={p} onAdd={add} onSpec={() => onProduct(p.sku)} onSignIn={onSignIn} />
            ))}
            {list.length === 0 && (
              <div className="p-8 text-center">
                <div className="disp mb-1 text-[18px] font-semibold">No items match</div>
                <p className="mb-4 text-[13px] text-[hsl(var(--ink-2))]">
                  Try the OSHA citation instead — for example 1926.501.
                </p>
                <Btn variant="line" size="sm" onClick={() => { clear(); setQuery(""); }}>Reset everything</Btn>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* custom modular intake */}
      {modOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={() => setModOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Custom modular design intake"
            className="h-full w-full overflow-y-auto bg-[hsl(var(--ground))] sm:max-w-[480px] sm:border-l-2 sm:border-[hsl(var(--safety))]"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[hsl(var(--rule))] p-4">
              <h3 className="disp text-[22px] font-bold">Custom modular intake</h3>
              <button onClick={() => setModOpen(false)} aria-label="Close intake"
                className="grid h-11 min-w-[44px] place-items-center text-[hsl(var(--ink-2))]">✕</button>
            </div>
            <div className="p-4">
              {modSent ? (
                <div>
                  <Tag tone="good">Received</Tag>
                  <p className="mt-3 text-[14px] leading-[1.55]">
                    Your intake is with the shop. We spec it with an upfitter and come back
                    with one quoted number and a drawing — usually inside a week.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div>
                    <span className="lab mb-1.5 block">What is it</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Site office", "Tiny home", "Conex conversion", "Guard booth", "Something else"].map(t => (
                        <button key={t} onClick={() => setModType(t)}
                          className={cx("min-h-[44px] rounded-[6px] border px-3 text-[13px] font-medium",
                            modType === t ? "border-[hsl(var(--safety-2))] bg-[hsl(var(--safety-soft))] text-[hsl(var(--safety-2))]"
                                          : "border-[hsl(var(--rule))] text-[hsl(var(--ink-2))]")}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="grid gap-1.5">
                    <span className="lab">Rough size</span>
                    <input value={modSize} onChange={e => setModSize(e.target.value)}
                      placeholder={'20 ft × 8 ft, or "sleeps 2 and an office"'}
                      className="h-11 w-full rounded-[5px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 text-[14px] outline-none focus:border-[hsl(var(--safety-2))]" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="lab">What it has to do</span>
                    <textarea value={modNotes} onChange={e => setModNotes(e.target.value)} rows={3}
                      placeholder="Power, plumbing, climate, how it gets there, when it's needed…"
                      className="w-full rounded-[5px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-3 text-[14px] outline-none focus:border-[hsl(var(--safety-2))]" />
                  </label>
                  {modShots.length > 0 && (
                    <div className="grid grid-cols-3 gap-1.5">
                      {modShots.map((f, i) => (
                        <span key={i} className="relative block overflow-hidden rounded-[4px] border border-[hsl(var(--rule))]">
                          <img src={f.url} alt={f.name} className="aspect-square w-full object-cover" />
                          <button onClick={() => setModShots(x => x.filter((_, k) => k !== i))}
                            aria-label={`Remove ${f.name}`}
                            className="absolute right-0.5 top-0.5 grid h-7 w-7 place-items-center rounded-[4px] bg-black/55 text-[11px] text-white">✕</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <label className="flex min-h-[44px] cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[hsl(var(--field))] text-[13px] font-medium text-[hsl(var(--marine))] hover:border-[hsl(var(--marine))]">
                    ＋ Add inspiration &amp; site photos ({modShots.length}/6)
                    <input type="file" accept="image/*" multiple onChange={addModShots}
                      aria-label="Add inspiration and site photos" className="sr-only" />
                  </label>
                  <Btn disabled={!modSize.trim() && !modNotes.trim()} onClick={() => setModSent(true)}>
                    Send the intake
                  </Btn>
                  <p className="text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                    Photos stay on your device in this prototype. Modular structures ship
                    through state-approved builders.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/45 lg:hidden" onClick={() => setFiltersOpen(false)}>
          <div className="max-h-[85vh] w-full overflow-y-auto border-t-2 border-[hsl(var(--safety))] bg-[hsl(var(--ground))] p-4 pb-[calc(16px+env(safe-area-inset-bottom))]"
            onClick={e => e.stopPropagation()}>
            {Filters}
            <Btn className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
              Show {list.length} items
            </Btn>
          </div>
        </div>
      )}

    </div>
  );
}
