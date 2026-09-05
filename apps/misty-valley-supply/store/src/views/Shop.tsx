import * as React from "react";
import { CATEGORIES, PRODUCTS, type Product } from "@/data";
import { Btn, DataTable, Head, Lab, money, Panel, Rule, Tag, cx, inputCls } from "@/ui";

type CartLine = { sku: string; qty: number };

const fulfilTone = (f: Product["fulfil"]) =>
  f === "stock" ? "good" : f === "fabricate" ? "safety" : "steel";
const fulfilName = (f: Product["fulfil"]) =>
  f === "stock" ? "In stock" : f === "fabricate" ? "Shop-built" : "Dropship";

export default function Shop({
  cart, setCart,
}: { cart: CartLine[]; setCart: (c: CartLine[]) => void }) {
  const [cat, setCat] = React.useState<string>("all");
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState<Product | null>(null);

  const list = PRODUCTS.filter(p =>
    (cat === "all" || p.cat === cat) &&
    (q.trim() === "" ||
      (p.name + p.sku + p.std + p.osha).toLowerCase().includes(q.toLowerCase())));

  const add = (sku: string, qty = 1) => {
    const at = cart.find(c => c.sku === sku);
    setCart(at ? cart.map(c => c.sku === sku ? { ...c, qty: c.qty + qty } : c)
               : [...cart, { sku, qty }]);
  };

  return (
    <div>
      <Head
        eyebrow="Catalog"
        title="Jobsite Safety & Edge Protection"
        sub="Every line carries the consensus standard it is built to and the OSHA rule that requires it on your site. If a product does not meet the hazard, we say so on the product page instead of selling it to you."
        right={
          <div className="hidden text-right sm:block">
            <Lab>Lines</Lab>
            <div className="disp text-[28px] font-bold">{PRODUCTS.length}</div>
          </div>
        }
      />

      {/* filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button onClick={() => setCat("all")}
          className={cx("lab border px-2.5 py-1.5",
            cat === "all" ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                          : "border-[hsl(var(--rule))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
          All
        </button>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            className={cx("lab border px-2.5 py-1.5",
              cat === c.id ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                           : "border-[hsl(var(--rule))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
            {c.name}
          </button>
        ))}
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search SKU, standard, 1926.501…"
          className={cx(inputCls, "ml-auto w-full sm:w-[280px]")} />
      </div>

      {/* grid */}
      <div className="grid gap-px bg-[hsl(var(--rule))] sm:grid-cols-2 lg:grid-cols-3">
        {list.map(p => (
          <article key={p.sku} className="flex flex-col bg-[hsl(var(--panel))] p-4">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="mono text-[11px] text-[hsl(var(--ink-3))]">{p.sku}</div>
              <div className="flex gap-1.5">
                {p.hot && <Tag tone="safety">Moves</Tag>}
                <Tag tone={fulfilTone(p.fulfil) as never}>{fulfilName(p.fulfil)}</Tag>
              </div>
            </div>

            <h3 className="disp mb-2 text-[20px] font-semibold leading-[1.05]">{p.name}</h3>

            <div className="mb-3 grid gap-1">
              <div className="flex gap-2 text-[12.5px]">
                <span className="lab w-[52px] shrink-0 pt-[3px]">Std</span>
                <span className="mono text-[hsl(var(--ink))]">{p.std}</span>
              </div>
              <div className="flex gap-2 text-[12.5px]">
                <span className="lab w-[52px] shrink-0 pt-[3px]">OSHA</span>
                <span className="mono text-[hsl(var(--safety))]">{p.osha}</span>
              </div>
            </div>

            <p className="mb-4 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">{p.note}</p>

            <div className="mt-auto">
              <Rule className="mb-3" />
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="disp text-[26px] font-bold leading-none">{money(p.price)}</div>
                  <div className="lab mt-1">per {p.uom}{p.moq ? ` · min ${p.moq}` : ""}</div>
                </div>
                <div className="flex gap-2">
                  <Btn size="sm" variant="ghost" onClick={() => setOpen(p)}>Spec</Btn>
                  <Btn size="sm" onClick={() => add(p.sku, p.moq ?? 1)}>Add</Btn>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 && (
        <Panel className="text-center text-[hsl(var(--ink-2))]">
          Nothing matches <span className="mono">{q}</span>.
        </Panel>
      )}

      {/* spec drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={() => setOpen(null)}>
          <div className="h-full w-full max-w-[520px] overflow-y-auto border-l-2 border-[hsl(var(--safety))] bg-[hsl(var(--ground))] p-6"
            onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="mono text-[11px] text-[hsl(var(--ink-3))]">{open.sku}</div>
              <button onClick={() => setOpen(null)} className="lab text-[hsl(var(--ink-2))] hover:text-[hsl(var(--ink))]">Close ✕</button>
            </div>
            <h3 className="disp mb-4 text-[30px] font-bold leading-[1.02]">{open.name}</h3>
            <Rule className="mb-4" />
            <DataTable
              cols={["Field", "Value"]}
              rows={[
                ["Standard", <span className="mono">{open.std}</span>],
                ["OSHA cite", <span className="mono text-[hsl(var(--safety))]">{open.osha}</span>],
                ["Fulfilment", fulfilName(open.fulfil)],
                ["Source", open.supplier],
                ["Lead time", <span className="mono">{open.lead}</span>],
                ["Unit", open.uom],
                ["Minimum", <span className="mono">{open.moq ?? 1}</span>],
                ["Unit price", <span className="mono">{money(open.price)}</span>],
              ]}
            />
            <Panel className="mt-5 border-l-2 border-l-[hsl(var(--safety))]">
              <Lab className="mb-2 !text-[hsl(var(--safety))]">Why this matters</Lab>
              <p className="text-[13.5px] leading-[1.55]">{open.note}</p>
            </Panel>
            <div className="mt-5 flex gap-2">
              <Btn onClick={() => { add(open.sku, open.moq ?? 1); setOpen(null); }}>Add to order</Btn>
              <Btn variant="line" onClick={() => setOpen(null)}>Keep looking</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
