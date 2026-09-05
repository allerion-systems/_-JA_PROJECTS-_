import * as React from "react";
import { CATEGORIES, PRODUCTS, type Product } from "@/data";
import { Glyph } from "@/glyph";
import { Price, useAuth } from "@/auth";
import { Btn, Tag, cx, money } from "@/ui";

const fulfilTone = (f: Product["fulfil"]) =>
  f === "stock" ? "good" : f === "fabricate" ? "warn" : "grey";
const fulfilName = (f: Product["fulfil"]) =>
  f === "stock" ? "In stock" : f === "fabricate" ? "Made to order" : "Ships from supplier";

/** 44px quantity stepper that respects the minimum order quantity. */
function Stepper({
  qty, setQty, min,
}: { qty: number; setQty: (n: number) => void; min: number }) {
  return (
    <div className="inline-flex h-11 items-stretch overflow-hidden rounded-[6px] border border-[hsl(var(--field)/0.55)] bg-[hsl(var(--panel))] focus-within:border-[hsl(var(--safety-2))]">
      <button type="button" aria-label="Decrease quantity" disabled={qty <= min}
        onClick={() => setQty(Math.max(min, qty - min))}
        className="grid w-11 place-items-center text-[18px] text-[hsl(var(--ink-2))] hover:bg-[hsl(var(--panel-2))] hover:text-[hsl(var(--ink))] disabled:text-[hsl(var(--ink-3))] disabled:hover:bg-transparent">
        –
      </button>
      <input aria-label="Quantity" inputMode="numeric" value={qty}
        onChange={e => setQty(Math.max(min, Number(e.target.value.replace(/\D/g, "")) || min))}
        className="num w-14 border-x border-[hsl(var(--rule))] bg-transparent text-center text-[15px] font-semibold text-[hsl(var(--ink))] outline-none" />
      <button type="button" aria-label="Increase quantity"
        onClick={() => setQty(qty + min)}
        className="grid w-11 place-items-center text-[18px] text-[hsl(var(--ink-2))] hover:bg-[hsl(var(--panel-2))] hover:text-[hsl(var(--ink))]">
        +
      </button>
    </div>
  );
}

export default function ProductView({
  sku, onAdd, onBack, onProduct, onSignIn,
}: {
  sku: string;
  onAdd: (sku: string, qty: number) => void;
  onBack: () => void;
  onProduct: (sku: string) => void;
  onSignIn: () => void;
}) {
  const { user, net } = useAuth();
  const p = PRODUCTS.find(x => x.sku === sku);
  const min = p?.moq ?? 1;
  const [qty, setQty] = React.useState(min);
  React.useEffect(() => { setQty(min); }, [sku, min]);

  if (!p) return (
    <div className="py-10 text-center">
      <p className="mb-4 text-[15px] text-[hsl(var(--ink-2))]">That part is no longer in the catalog.</p>
      <Btn variant="line" onClick={onBack}>Back to the catalog</Btn>
    </div>
  );

  const cat = CATEGORIES.find(c => c.id === p.cat);
  const related = PRODUCTS.filter(x => x.cat === p.cat && x.sku !== p.sku).slice(0, 3);

  return (
    <div>
      {/* breadcrumb */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
        <button onClick={onBack}
          className="flex h-11 items-center gap-1.5 rounded-[6px] px-2 -ml-2 text-[13px] font-medium text-[hsl(var(--marine))] hover:bg-[hsl(var(--marine-soft))]">
          ← Back to the catalog
        </button>
        <span className="hidden text-[11px] text-[hsl(var(--ink-3))] sm:inline">
          Home / Safety &amp; Edge Protection / {cat?.name} / <span className="text-[hsl(var(--ink))]">{p.name}</span>
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)_minmax(0,300px)] lg:gap-7">
        {/* ------------------------------------------------------- plate */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden plate rounded-[10px] border border-[hsl(var(--rule))]">
            <div className="absolute left-3 top-3">
              <Tag tone={fulfilTone(p.fulfil) as never}>{fulfilName(p.fulfil)}</Tag>
            </div>
            <div className="flex h-full w-full items-center justify-center">
              <Glyph sku={p.sku} cat={p.cat} className="h-[76%] w-[76%]" />
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
            Representative drawing. Supplier photography drops in per SKU as it arrives.
          </p>
        </div>

        {/* ------------------------------------------------------ detail */}
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold leading-[1.25] tracking-[-0.011em] text-[hsl(var(--ink))]">
            {p.name}
          </h1>
          <div className="ident mt-1.5 text-[13px] text-[hsl(var(--ink-3))]">
            {p.sku} · {p.supplier}
          </div>

          <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.55] text-[hsl(var(--ink-2))]">
            {p.note}
          </p>

          {/* the compliance story — the centerpiece */}
          <div className="card mt-5 overflow-hidden rounded-[10px]">
            <div className="border-b border-[hsl(var(--rule))] bg-[hsl(var(--safety-soft))] px-4 py-3 sm:px-5">
              <div className="eyebrow text-[hsl(var(--safety-2))]">Compliance</div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                <span>
                  <span className="text-[hsl(var(--ink-2))]">Built to </span>
                  <span className="ident text-[13px] text-[hsl(var(--ink))]">{p.std}</span>
                </span>
                <span className="hidden h-3 w-px bg-[hsl(var(--rule))] sm:inline-block" aria-hidden />
                <span>
                  <span className="text-[hsl(var(--ink-2))]">Required by </span>
                  <span className="ident text-[13px] font-medium text-[hsl(var(--safety-2))]">{/^\d/.test(p.osha) ? `OSHA ${p.osha}` : p.osha}</span>
                </span>
              </div>
              <h2 className="mt-4 text-[15px] font-semibold text-[hsl(var(--ink))]">
                What the rule requires
              </h2>
              <p className="mt-1.5 max-w-[62ch] text-[15px] leading-[1.6] text-[hsl(var(--ink-2))]">
                {p.why}
              </p>
              <p className="mt-3 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
                Citations are to 29 CFR 1926. Read the full text before you build a fall
                protection plan around any one product.
              </p>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------- buy box */}
        <div>
          <div className="card rounded-[10px] p-4 sm:p-5">
            <Price list={p.price} uom={p.uom} onSignIn={onSignIn} />
            {min > 1 && (
              <div className="mt-2 text-[11px] font-medium text-[hsl(var(--warn))]">
                Minimum order {min} · sold in {min}s
              </div>
            )}

            <div className="my-4 h-px bg-[hsl(var(--rule))]" />

            <dl className="grid gap-2 text-[13px]">
              {[
                ["Availability", fulfilName(p.fulfil)],
                ["Ships", p.lead],
                ["Source", p.supplier],
                ["Unit", `Per ${p.uom}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3">
                  <dt className="text-[hsl(var(--ink-3))]">{k}</dt>
                  <dd className="text-right font-medium text-[hsl(var(--ink))]">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-center gap-2">
              <Stepper qty={qty} setQty={setQty} min={min} />
              <div className="num min-w-0 flex-1 text-right text-[15px] font-semibold text-[hsl(var(--ink))]">
                {money((user ? net(p.price) : p.price) * qty)}
              </div>
            </div>

            <Btn className="mt-3 w-full !h-12" onClick={() => onAdd(p.sku, qty)}>
              Add to order
            </Btn>
            <p className="mt-2.5 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
              Your branch confirms the supplier cut-off when the order is placed.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[18px] font-semibold tracking-[-0.011em] text-[hsl(var(--ink))]">
            More in {cat?.name ?? "this category"}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {related.map(r => (
              <button key={r.sku} onClick={() => onProduct(r.sku)}
                className="card lift group flex min-h-[44px] items-center gap-3 rounded-[10px] p-3 text-left sm:flex-col sm:items-stretch sm:gap-0 sm:p-0">
                <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center plate rounded-[6px] border border-[hsl(var(--rule))] sm:h-auto sm:w-full sm:aspect-[2/1] sm:rounded-none sm:rounded-t-[10px] sm:border-0 sm:border-b">
                  <Glyph sku={r.sku} cat={r.cat} className="h-[64%] w-auto max-h-full" />
                </div>
                <div className="min-w-0 sm:p-4">
                  <div className="text-[15px] font-semibold leading-[1.3] text-[hsl(var(--ink))] group-hover:text-[hsl(var(--marine))]">
                    {r.name}
                  </div>
                  <div className="ident mt-1 text-[11px] text-[hsl(var(--ink-3))]">{r.sku}</div>
                  <div className={cx("num mt-1.5 text-[15px] font-bold text-[hsl(var(--ink))]")}>
                    {money(user ? net(r.price) : r.price)}
                    <span className="ml-1.5 text-[11px] font-normal text-[hsl(var(--ink-3))]">per {r.uom}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
