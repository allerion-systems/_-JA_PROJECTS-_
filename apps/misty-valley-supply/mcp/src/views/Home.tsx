import { PRODUCTS, type Product } from "@/data";
import { Glyph } from "@/glyph";
import fabPhoto from "@/assets/site/lee-screen-1.jpg";
import { useAuth } from "@/auth";
import { Btn, Lab, Rule, cx, money } from "@/ui";

/* The home page is a showcase: one band per department, each a doorway to
   that department's own landing page in the shop. No pitch copy. */

const DEPTS: {
  id: string; name: string; sub: string; cats: string[]; glyphSku?: string;
}[] = [
  { id: "materials", name: "Building Materials", sub: "Siding, OSB, studs, drywall, roofing",
    cats: ["siding", "sheathing", "drywall", "roofing", "site"] },
  { id: "safety", name: "Safety", sub: "PPE, fall protection, edge, jobsite",
    cats: ["fall", "roof", "guard", "head", "eye", "hand", "hivis", "jobsite"] },
  { id: "structures", name: "Building Structures", sub: "Conex, offices, custom modular",
    cats: ["structures"], glyphSku: "MVS-CX-20OT" },
];

function pickFeatured(cats: string[], n = 4): Product[] {
  const pool = PRODUCTS.filter(p => cats.includes(p.cat));
  const scored = [...pool].sort((a, b) =>
    Number(!!b.img) - Number(!!a.img) || Number(!!b.hot) - Number(!!a.hot));
  return scored.slice(0, n);
}

function ProductCard({ p, onOpen, yourPrice }: { p: Product; onOpen: () => void; yourPrice: boolean }) {
  return (
    <button onClick={onOpen} className="card lift p-3 text-left">
      <div className="plate mb-2 flex aspect-[3/2] items-center justify-center overflow-hidden rounded-[6px] border border-[hsl(var(--rule))]">
        {p.img
          ? <img src={p.img} alt={p.name} className="h-full w-full object-contain" />
          : <Glyph sku={p.sku} cat={p.cat} className="h-[76%] w-[76%]" />}
      </div>
      <div className="text-[13px] font-semibold leading-[1.3]">{p.name}</div>
      <div className="disp mt-1.5 text-[18px] font-bold">
        {money(p.price)}
        <span className="lab ml-1.5">{yourPrice ? "list — your price in cart" : "list"}</span>
      </div>
    </button>
  );
}

export default function Home({
  onShop, onScreens, onYard, onEarth, onSignIn, onSearch,
}: {
  onShop: (cat?: string) => void; onScreens: () => void; onYard: () => void;
  onEarth: () => void; onSignIn: () => void; onSearch: (q: string) => void;
}) {
  const { user, branch } = useAuth();
  void onSearch;

  return (
    <div>
      {/* ------------------------------------------------ department doors */}
      <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {DEPTS.map(d => (
          <button key={d.id} onClick={() => onShop(d.cats[0])}
            className="card lift flex min-h-[128px] flex-col items-center justify-center gap-2 p-4">
            <Glyph sku={d.glyphSku ?? pickFeatured(d.cats, 1)[0]?.sku} cat={d.cats[0]} className="h-14 w-14" />
            <span className="disp text-center text-[16px] font-semibold leading-[1.05]">{d.name}</span>
            <span className="num text-[11px] text-[hsl(var(--ink-3))]">
              {PRODUCTS.filter(p => d.cats.includes(p.cat)).length} items
            </span>
          </button>
        ))}
        <button onClick={onScreens}
          className="card lift flex min-h-[128px] flex-col items-center justify-center gap-2 p-4">
          <Glyph sku="MVS-RSF-SC3" className="h-14 w-14" />
          <span className="disp text-center text-[16px] font-semibold leading-[1.05]">Custom Fabrication</span>
          <span className="text-[11px] font-medium text-[hsl(var(--safety-2))]">Priced with shop drawings</span>
        </button>
        <button onClick={onYard}
          className="card lift flex min-h-[128px] flex-col items-center justify-center gap-2 p-4">
          <Glyph sku="MVS-CX-20OT" className="h-14 w-14" />
          <span className="disp text-center text-[16px] font-semibold leading-[1.05]">The Yard</span>
          <span className="text-[11px] font-medium text-[hsl(var(--marine))]">Used &amp; surplus</span>
        </button>
      </div>

      {/* -------------------------------------------- department showcases */}
      {DEPTS.map(d => (
        <section key={d.id} className="mb-10">
          <div className="mb-4 flex items-end justify-between gap-3 border-b border-[hsl(var(--ink))] pb-2.5">
            <div>
              <h2 className="disp text-[22px] font-bold leading-none">{d.name}</h2>
              <div className="mt-1 text-[13px] text-[hsl(var(--ink-2))]">{d.sub}</div>
            </div>
            <button onClick={() => onShop(d.cats[0])}
              className="flex min-h-[44px] shrink-0 items-center text-[13px] font-semibold text-[hsl(var(--marine))] hover:underline">
              Shop all {PRODUCTS.filter(p => d.cats.includes(p.cat)).length} →
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {pickFeatured(d.cats).map(p => (
              <ProductCard key={p.sku} p={p} yourPrice={!!user} onOpen={() => onShop(p.cat)} />
            ))}
          </div>
        </section>
      ))}

      {/* --------------------------------------------- fabrication band */}
      <section className="card-hi mb-10">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[240px] bg-[hsl(var(--marine-2))] lg:min-h-0">
            <img src={fabPhoto} alt="Shop-fabricated roof screen frame standing on the Lee Street roof"
              className="absolute inset-0 h-full w-full object-cover" />
            <div className="tape absolute inset-x-0 top-0 h-1.5" />
          </div>
          <div className="p-5 sm:p-7">
            <Lab className="mb-2">Custom fabrication</Lab>
            <h2 className="disp text-[28px] font-bold leading-[0.98] sm:text-[40px]">
              The Design Center
            </h2>
            <p className="mt-3 max-w-[52ch] text-[14px] leading-[1.55] text-[hsl(var(--ink-2))]">
              Build your roof screen in 3D — length, height, gauge — and watch the price
              follow every choice. The shop drawing comes from the same numbers. The Lee
              Street frame ran {money(6000)} complete.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Btn onClick={onScreens}>Open the Design Center</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------- marketplace band */}
      <div className="mb-10 grid gap-4 lg:grid-cols-2">
        <div className="card lift p-5">
          <Lab className="mb-2">Delivery</Lab>
          <h3 className="disp text-[22px] font-bold leading-none">Any counter in town, today</h3>
          <p className="mt-2 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
            A runner picks up your list from any local store and puts it on your deck.
            List in, quote back, done.
          </p>
          <Btn size="sm" className="mt-4" onClick={onEarth}>Start a run</Btn>
        </div>
        <div className="card lift p-5">
          <Lab className="mb-2">The Yard</Lab>
          <h3 className="disp text-[22px] font-bold leading-none">Buy and sell locally</h3>
          <p className="mt-2 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
            Surplus material, iron, crews and trucks along the corridor. Free to list;
            payment is held until pickup is confirmed.
          </p>
          <Btn size="sm" variant="line" className="mt-4" onClick={onYard}>Browse the yard</Btn>
        </div>
      </div>

      {/* -------------------------------------------------- service strip */}
      <section className="card p-5">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <Lab className="mb-2">Your branch</Lab>
            <div className="disp text-[18px] font-bold leading-none">{branch.name}</div>
            <div className="mt-1.5 text-[13px] leading-[1.6] text-[hsl(var(--ink-2))]">
              {branch.city}<br />{branch.hours} · {branch.phone}
            </div>
          </div>
          <div>
            <Lab className="mb-2">Buying on terms</Lab>
            {user ? (
              <>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-[13px]">{money(user.creditLimit - user.creditUsed)} available</span>
                  <span className="text-[11px] text-[hsl(var(--ink-3))]">of {money(user.creditLimit)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--panel-2))]">
                  <div className="h-full rounded-full bg-[hsl(var(--safety-hi))]"
                    style={{ width: `${(user.creditUsed / user.creditLimit) * 100}%` }} />
                </div>
              </>
            ) : (
              <>
                <p className="text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                  Net 30 on account instead of by card. Two business days, three trade references.
                </p>
                <Btn variant="line" size="sm" className="mt-3" onClick={onSignIn}>Open a credit account</Btn>
              </>
            )}
          </div>
          <div>
            <Lab className="mb-2">Delivery</Lab>
            <p className="text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
              Jobsite delivery along I-65 between Louisville and Nashville, or will-call
              at the counter. Call {branch.phone} and a person answers.
            </p>
          </div>
        </div>
        <Rule className="my-4" />
        <div className={cx("text-[11px] text-[hsl(var(--ink-3))]")}>
          Prototype build — prices, stock and suppliers are placeholders. Standards and OSHA citations are accurate.
        </div>
      </section>
    </div>
  );
}
