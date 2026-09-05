import * as React from "react";
import { CATEGORIES, PRODUCTS, type Product } from "@/data";
import { Glyph } from "@/glyph";
import { Price, useAuth } from "@/auth";
import { Btn, Panel, Tag, cx, money } from "@/ui";

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
        <span className="mono text-[13px] text-[hsl(var(--ink-3))]">{open ? "–" : "+"}</span>
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
      {count != null && <span className="mono text-[11px] text-[hsl(var(--ink-3))]">{count}</span>}
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
    <article className="grid grid-cols-[68px_1fr] gap-3 border-b border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-3 sm:grid-cols-[92px_1fr_190px] sm:gap-4 sm:p-4">
      {/* image */}
      <button onClick={onSpec}
        className="flex aspect-square items-center justify-center border border-[hsl(var(--rule))] bg-white text-[hsl(var(--ink-2))]">
        <Glyph sku={p.sku} cat={p.cat} className="h-[62%] w-[62%]" />
      </button>

      {/* detail */}
      <div className="min-w-0">
        <button onClick={onSpec} className="text-left">
          <h3 className="text-[14.5px] font-semibold leading-[1.3] text-[hsl(var(--ink))] hover:text-[hsl(var(--safety))] sm:text-[15.5px]">
            {p.name}
          </h3>
        </button>
        <div className="mono mt-1 text-[11px] text-[hsl(var(--ink-3))]">
          {p.sku} · {p.supplier}
        </div>

        <dl className="mt-2 grid gap-x-4 gap-y-1 text-[12px] sm:grid-cols-2">
          <div className="flex gap-1.5">
            <dt className="lab shrink-0 pt-[3px]">Std</dt>
            <dd className="mono min-w-0 text-[hsl(var(--ink))]">{p.std}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="lab shrink-0 pt-[3px]">OSHA</dt>
            <dd className="mono min-w-0 text-[hsl(var(--safety))]">{p.osha}</dd>
          </div>
        </dl>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Tag tone={fulfilTone(p.fulfil) as never}>{fulfilName(p.fulfil)}</Tag>
          <span className="mono text-[11px] text-[hsl(var(--ink-2))]">Ships {p.lead}</span>
          {p.hot && <Tag tone="safety">Frequently bought</Tag>}
        </div>

        {/* mobile price + buy */}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3 sm:hidden">
          <Price list={p.price} uom={p.uom} onSignIn={onSignIn} size="sm" />
          <div className="flex items-center gap-1.5">
            <input type="number" min={min} step={min} value={qty}
              onChange={e => setQty(Math.max(min, Number(e.target.value) || min))}
              className="mono h-10 w-16 border border-[hsl(var(--rule))] bg-white px-2 text-center text-[14px]" />
            <Btn size="sm" className="h-10" onClick={() => onAdd(p.sku, qty)}>Add</Btn>
          </div>
        </div>
      </div>

      {/* desktop price + buy */}
      <div className="hidden border-l border-[hsl(var(--rule))] pl-4 sm:block">
        <Price list={p.price} uom={p.uom} onSignIn={onSignIn} />
        {min > 1 && <div className="mono mt-1 text-[11px] text-[hsl(var(--warn))]">min order {min}</div>}
        <div className="mt-3 flex items-center gap-1.5">
          <input type="number" min={min} step={min} value={qty}
            onChange={e => setQty(Math.max(min, Number(e.target.value) || min))}
            className="mono h-9 w-16 border border-[hsl(var(--rule))] bg-white px-2 text-center text-[14px]" />
          <Btn size="sm" className="flex-1" onClick={() => onAdd(p.sku, qty)}>Add</Btn>
        </div>
        <button onClick={onSpec} className="lab mt-2 text-[hsl(var(--ink-3))] hover:text-[hsl(var(--safety))]">
          Full spec →
        </button>
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- shop */

export default function Shop({
  cart, setCart, query, setQuery, preCat, onSignIn,
}: {
  cart: CartLine[]; setCart: (c: CartLine[]) => void;
  query: string; setQuery: (q: string) => void;
  preCat?: string; onSignIn: () => void;
}) {
  const { user, net } = useAuth();
  const [cats, setCats] = React.useState<string[]>(preCat ? [preCat] : []);
  React.useEffect(() => { if (preCat) setCats([preCat]); }, [preCat]);
  const [stds, setStds] = React.useState<string[]>([]);
  const [fulfils, setFulfils] = React.useState<string[]>([]);
  const [maxPrice, setMaxPrice] = React.useState(0);
  const [sort, setSort] = React.useState("rel");
  const [open, setOpen] = React.useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = React.useState(false);

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
      <div className="flex items-center justify-between border-b-2 border-[hsl(var(--ink))] pb-2">
        <span className="disp text-[17px] font-bold">Filter</span>
        {activeCount > 0 && (
          <button onClick={clear} className="lab text-[hsl(var(--safety))]">Clear {activeCount}</button>
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

  return (
    <div>
      {/* breadcrumb + count */}
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="mono text-[11.5px] text-[hsl(var(--ink-3))]">
          Home / <span className="text-[hsl(var(--ink))]">Safety &amp; Edge Protection</span>
          {q && <> / “{query}”</>}
        </div>
      </div>

      <h1 className="disp mb-1 text-[28px] font-bold leading-none sm:text-[34px]">
        Safety &amp; Edge Protection
      </h1>
      <p className="mb-4 max-w-[75ch] text-[13.5px] leading-[1.5] text-[hsl(var(--ink-2))]">
        Every line lists the standard it is built to and the OSHA rule that requires it.
        Filter by the citation, not by the marketing.
      </p>

      <div className="lg:grid lg:grid-cols-[228px_1fr] lg:gap-7">
        {/* desktop facets */}
        <aside className="hidden lg:block">{Filters}</aside>

        <div className="min-w-0">
          {/* toolbar */}
          <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-[hsl(var(--rule))] pb-3">
            <span className="mono text-[12.5px]">
              <strong className="text-[hsl(var(--ink))]">{list.length}</strong>
              <span className="text-[hsl(var(--ink-3))]"> of {PRODUCTS.length} items</span>
            </span>
            <button onClick={() => setFiltersOpen(true)}
              className="lab flex h-9 items-center gap-2 border border-[hsl(var(--ink))] px-3 lg:hidden">
              Filter {activeCount > 0 && <span className="mono bg-[hsl(var(--safety))] px-1.5 text-white">{activeCount}</span>}
            </button>
            <label className="ml-auto flex items-center gap-2">
              <span className="lab hidden sm:inline">Sort</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="h-9 border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-2 text-[13px]">
                {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>

          {/* active chips */}
          {activeCount > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {[...cats.map(c => [c, CATEGORIES.find(x => x.id === c)!.name, () => toggle(cats, setCats, c)] as const),
                ...stds.map(s => [s, s, () => toggle(stds, setStds, s)] as const),
                ...fulfils.map(f => [f, fulfilName(f as Product["fulfil"]), () => toggle(fulfils, setFulfils, f)] as const),
              ].map(([id, label, off]) => (
                <button key={id} onClick={off}
                  className="lab flex items-center gap-1.5 border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-2 py-1.5">
                  {label} <span className="text-[hsl(var(--ink-3))]">✕</span>
                </button>
              ))}
            </div>
          )}

          {/* rows */}
          <div className="border border-[hsl(var(--rule))]">
            {list.map(p => (
              <Row key={p.sku} p={p} onAdd={add} onSpec={() => setOpen(p)} onSignIn={onSignIn} />
            ))}
            {list.length === 0 && (
              <div className="p-8 text-center">
                <div className="disp mb-1 text-[20px] font-semibold">No items match</div>
                <p className="mb-4 text-[13.5px] text-[hsl(var(--ink-2))]">
                  Try the OSHA citation instead — for example <span className="mono">1926.501</span>.
                </p>
                <Btn variant="line" size="sm" onClick={() => { clear(); setQuery(""); }}>Reset everything</Btn>
              </div>
            )}
          </div>
        </div>
      </div>

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

      {/* spec drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45" onClick={() => setOpen(null)}>
          <div className="h-full w-full overflow-y-auto bg-[hsl(var(--ground))] p-4 sm:max-w-[520px] sm:border-l-2 sm:border-[hsl(var(--safety))] sm:p-6"
            onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="mono text-[11px] text-[hsl(var(--ink-3))]">{open.sku}</div>
              <button onClick={() => setOpen(null)} className="lab h-10 px-2 text-[hsl(var(--ink-2))]">Close ✕</button>
            </div>
            <div className="mb-4 flex gap-4">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-[hsl(var(--rule))] bg-white text-[hsl(var(--ink-2))]">
                <Glyph sku={open.sku} cat={open.cat} className="h-[62%] w-[62%]" />
              </div>
              <h3 className="disp text-[24px] font-bold leading-[1.05] sm:text-[28px]">{open.name}</h3>
            </div>
            <Panel pad={false} className="mb-4">
              {[["Standard", open.std], ["OSHA cite", open.osha], ["Availability", fulfilName(open.fulfil)],
                ["Source", open.supplier], ["Lead time", open.lead], ["Unit", open.uom],
                ["Minimum", String(open.moq ?? 1)],
                ["Unit price", user ? `${money(net(open.price))} (list ${money(open.price)})` : `${money(open.price)} list`]].map(([k, v], i) => (
                <div key={k} className={cx("flex items-start justify-between gap-3 px-3 py-2.5",
                  i !== 7 && "border-b border-[hsl(var(--rule))]")}>
                  <span className="lab pt-[3px]">{k}</span>
                  <span className={cx("mono text-right text-[13px]",
                    k === "OSHA cite" && "text-[hsl(var(--safety))]")}>{v}</span>
                </div>
              ))}
            </Panel>
            <Panel className="mb-4 border-l-2 border-l-[hsl(var(--safety))]">
              <div className="lab mb-2 !text-[hsl(var(--safety))]">Why this matters</div>
              <p className="text-[13.5px] leading-[1.55]">{open.note}</p>
            </Panel>
            <div className="flex gap-2">
              <Btn className="flex-1" onClick={() => { add(open.sku, open.moq ?? 1); setOpen(null); }}>
                Add {open.moq ?? 1} to order
              </Btn>
              <Btn variant="line" onClick={() => setOpen(null)}>Back</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
