import * as React from "react";
import { CATEGORIES, PRODUCTS, type Product } from "@/data";
import { Glyph } from "@/glyph";
import { Price, useAuth } from "@/auth";
import { Btn, Tag, cx, money } from "@/ui";

// The full-kit BoM pulls the takeoff engines + BomTable — kept out of the
// main chunk behind its own lazy boundary.
const KitBom = React.lazy(() => import("@/views/KitBom"));

const fulfilTone = (f: Product["fulfil"]) =>
  f === "stock" ? "good" : f === "fabricate" ? "warn" : "grey";
const fulfilName = (f: Product["fulfil"]) =>
  f === "stock" ? "In stock" : f === "fabricate" ? "Made to order" : "Ships from supplier";

/** Fulfillment lane, supply-house wording, for the spec table. */
const laneLabel = (f: Product["fulfil"]) =>
  f === "stock" ? "Distributor stock"
  : f === "fabricate" ? "Made to order"
  : "Ships direct from supplier";

/** OSHA cites are bare numbers in the data; install cites name their code. */
const oshaLabel = (osha: string) => (/^\d/.test(osha) ? `OSHA ${osha}` : osha);

/** Honest availability, per lane. Import SKUs aggregate to container bookings. */
const availability = (p: Product) =>
  p.sku.startsWith("MVS-IM-") ? "Preorder — import aggregation"
  : p.fulfil === "fabricate" ? "Made to order — quoted first"
  : /^same day$/i.test(p.lead) ? "Ships same day"
  : /^\d/.test(p.lead) ? `Ships in ${p.lead}`
  : `Ships ${p.lead}`;

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

/** Which Design Center tool customizes this SKU, if any. */
const designerFor = (sku: string): { view: string; label: string } | null => {
  if (/^MVS-(CX|CI)-/.test(sku)) return { view: "container", label: "Customize it in the Container Designer" };
  if (/^MVS-DK-/.test(sku)) return { view: "dock", label: "Design your dock around it" };
  if (/^MVS-PB-(3040|4060|PORCH)/.test(sku)) return { view: "barndo", label: "Customize it in the Barndo Builder" };
  if (/^MVS-(PB-(RUN|SHED)|STR-(CAB|PRM)|SC)-?/.test(sku)) return { view: "shed", label: "Customize it in Backyard Studios" };
  if (/^MVS-RS/.test(sku)) return { view: "screen", label: "Design your screen around it" };
  return null;
};

/** True for a value worth a spec row. Placeholders ("—") never render. */
const real = (v: unknown) => typeof v === "string" ? v.trim() !== "" && v.trim() !== "—" : !!v;

/** The core of the page: a two-column striped table of the product's real
    fields. Nothing here is invented — every row is a field off the record. */
function SpecTable({ p }: { p: Product }) {
  const rows: [string, React.ReactNode][] = [];
  rows.push(["SKU", <span className="ident">{p.sku}</span>]);
  rows.push(["Unit of measure", `Per ${p.uom}`]);
  if (real(p.std)) rows.push(["Standard", <span className="ident">{p.std}</span>]);
  if (real(p.osha)) rows.push(["Required by / install", <span className="ident">{oshaLabel(p.osha)}</span>]);
  if (p.moq && p.moq > 1) rows.push(["Minimum order", `${p.moq} — sold in ${p.moq}s`]);
  if (real(p.lead)) rows.push(["Lead time", p.lead]);
  rows.push(["Fulfillment", laneLabel(p.fulfil)]);
  if (real(p.supplier)) rows.push(["Supplier", p.supplier]);
  return (
    <div className="mt-4">
      <h2 className="mb-1.5 text-[13px] font-bold uppercase tracking-[0.04em] text-[hsl(var(--ink-2))]">
        Specifications
      </h2>
      <table className="w-full border-collapse border border-[hsl(var(--rule))] text-[13px]">
        <tbody>
          {rows.map(([k, v], i) => (
            <tr key={k} className={cx(i % 2 === 0 && "bg-[hsl(var(--panel-2))]")}>
              <th scope="row"
                className="w-[38%] border-b border-[hsl(var(--rule))] px-3 py-2 text-left align-top font-medium text-[hsl(var(--ink-3))]">
                {k}
              </th>
              <td className="border-b border-[hsl(var(--rule))] px-3 py-2 align-top text-[hsl(var(--ink))]">
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Related items — same category, photo-first, in the Home tile vocabulary. */
function Related({
  p, catName, onProduct,
}: { p: Product; catName: string; onProduct: (sku: string) => void }) {
  const { user, net } = useAuth();
  const related = PRODUCTS
    .filter(x => x.cat === p.cat && x.sku !== p.sku)
    .sort((a, b) => Number(!!b.img) - Number(!!a.img))
    .slice(0, 6);
  if (!related.length) return null;
  return (
    <div className="mt-10">
      <h2 className="disp mb-2.5 text-[16px] font-bold">More in {catName}</h2>
      <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
        {related.map(r => (
          <button key={r.sku} onClick={() => onProduct(r.sku)} data-related={r.sku}
            className="flex flex-col border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-2.5 text-left transition-colors hover:border-[hsl(var(--safety-2))]">
            <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden bg-white">
              {r.img
                ? <img src={r.img} alt="" loading="lazy" className="h-full w-full object-contain" />
                : <Glyph sku={r.sku} cat={r.cat} className="h-[62%] w-[62%]" />}
            </div>
            <div className="line-clamp-2 text-[12px] font-semibold leading-[1.25]">{r.name}</div>
            <div className="ident mt-0.5 text-[11px] text-[hsl(var(--ink-3))]">{r.sku}</div>
            <div className="num mt-1 text-[14px] font-bold">
              {money(user ? net(r.price) : r.price)}
              <span className="lab ml-1 text-[10px]">per {r.uom}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductView({
  sku, onAdd, onBack, onCategory, onProduct, onSignIn, onDesign,
}: {
  sku: string;
  onAdd: (sku: string, qty: number) => void;
  onBack: () => void;
  onCategory: (cat: string) => void;
  onProduct: (sku: string) => void;
  onSignIn: () => void;
  onDesign?: (view: string) => void;
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
  const catName = cat?.name ?? "this category";

  return (
    <div>
      {/* ---------------------------------------------------- breadcrumb */}
      <nav aria-label="Breadcrumb"
        className="mb-4 flex min-h-[44px] flex-wrap items-center gap-x-1.5 gap-y-1 border-b border-[hsl(var(--rule))] pb-2 text-[13px]">
        <span className="text-[hsl(var(--ink-3))]">Home</span>
        <span aria-hidden className="text-[hsl(var(--ink-3))]">›</span>
        <button onClick={() => onCategory(p.cat)}
          className="font-semibold text-[hsl(var(--marine))] hover:underline">
          {catName}
        </button>
        <span aria-hidden className="text-[hsl(var(--ink-3))]">›</span>
        <span className="ident text-[hsl(var(--ink-2))]">{p.sku}</span>
      </nav>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)_minmax(0,300px)] lg:gap-7">
        {/* ------------------------------------------------------- plate */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden plate border border-[hsl(var(--rule))]">
            <div className="absolute left-3 top-3">
              <Tag tone={fulfilTone(p.fulfil) as never}>{fulfilName(p.fulfil)}</Tag>
            </div>
            <div className="flex h-full w-full items-center justify-center">
              {p.img
                ? <img src={p.img} alt={p.name} className="h-full w-full object-contain" />
                : <Glyph sku={p.sku} cat={p.cat} className="h-[76%] w-[76%]" />}
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
            {p.img
              ? "Representative image (AI render or licensed stock) for the prototype. Supplier photography replaces these per SKU before launch."
              : "Representative drawing. Supplier photography drops in per SKU as it arrives."}
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

          {/* the dense spec table — every row a real field off the record */}
          <SpecTable p={p} />

          {/* the compliance story */}
          <div className="card mt-5 rounded-[10px] border-l-2 border-l-[hsl(var(--safety-2))]">
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
                <span>
                  <span className="text-[hsl(var(--ink-2))]">Built to </span>
                  <span className="ident text-[13px] text-[hsl(var(--ink))]">{p.std}</span>
                </span>
                <span className="hidden h-3 w-px bg-[hsl(var(--rule))] sm:inline-block" aria-hidden />
                <span>
                  <span className="text-[hsl(var(--ink-2))]">Required by </span>
                  <span className="ident text-[13px] font-medium text-[hsl(var(--safety-2))]">{oshaLabel(p.osha)}</span>
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

          {/* full default-configuration bill of material, engine-computed */}
          <React.Suspense fallback={null}>
            <KitBom sku={p.sku} />
          </React.Suspense>
        </div>

        {/* ----------------------------------------------------- buy box */}
        <div>
          <div className="card rounded-[10px] p-4 sm:p-5">
            <Price list={p.price} uom={p.uom} onSignIn={onSignIn} />
            <div className="mt-1.5 text-[13px] font-medium text-[hsl(var(--ink))]" data-availability>
              {availability(p)}
            </div>
            {min > 1 && (
              <div className="mt-2 text-[11px] font-medium text-[hsl(var(--warn))]">
                Minimum order {min} · sold in {min}s
              </div>
            )}

            <div className="my-4 h-px bg-[hsl(var(--rule))]" />

            <div className="flex items-center gap-2">
              <Stepper qty={qty} setQty={setQty} min={min} />
              <div className="num min-w-0 flex-1 text-right text-[15px] font-semibold text-[hsl(var(--ink))]">
                {money((user ? net(p.price) : p.price) * qty)}
              </div>
            </div>

            <Btn className="mt-3 w-full !h-12" onClick={() => onAdd(p.sku, qty)}>
              {p.fulfil === "dropship" ? "Preorder" : "Add to order"}
            </Btn>
            {(() => { const d = designerFor(p.sku); return d && onDesign ? (
              <Btn variant="line" className="mt-2 w-full" onClick={() => onDesign(d.view)}>
                {d.label}
              </Btn>
            ) : null; })()}
            <p className="mt-2.5 text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
              {p.fulfil === "dropship"
                ? "Preorder — your branch confirms supplier stock and ship date before your card is captured."
                : "Your branch confirms the supplier cut-off when the order is placed."}
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- related */}
      <Related p={p} catName={catName} onProduct={onProduct} />
    </div>
  );
}
