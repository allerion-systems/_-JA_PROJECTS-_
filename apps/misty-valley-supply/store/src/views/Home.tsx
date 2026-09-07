import { CATEGORIES, PRODUCTS, type Product } from "@/data";
import { Glyph } from "@/glyph";
import { useAuth } from "@/auth";
import { money } from "@/ui";

/* Industrial-supply-house home: the category grid IS the page. White,
   dense, zero pitch copy — every tile is a doorway with a real thumbnail
   and an item count. One slim Design Center row; one popular-items row. */

/** The category's face: its first photographed product, else a glyph. */
function catFace(catId: string): Product | undefined {
  const pool = PRODUCTS.filter(p => p.cat === catId);
  return pool.find(p => p.img) ?? pool[0];
}

function CatTile({ id, name, onOpen }: { id: string; name: string; onOpen: () => void }) {
  const face = catFace(id);
  const count = PRODUCTS.filter(p => p.cat === id).length;
  if (!face) return null;
  return (
    <button onClick={onOpen}
      className="group flex flex-col border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-2.5 text-left transition-colors hover:border-[hsl(var(--safety-2))]">
      <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden bg-white">
        {face.img
          ? <img src={face.img} alt="" loading="lazy" className="h-full w-full object-contain" />
          : <Glyph sku={face.sku} cat={id} className="h-[62%] w-[62%]" />}
      </div>
      <div className="text-[13px] font-semibold leading-[1.25] group-hover:text-[hsl(var(--safety-2))]">{name}</div>
      <div className="lab mt-0.5 text-[11px]">{count} items</div>
    </button>
  );
}

export default function Home({
  onShop, onScreens, onYard, onEarth, onSignIn, onSearch,
}: {
  onShop: (cat?: string) => void; onScreens: () => void; onYard: () => void;
  onEarth: () => void; onSignIn: () => void; onSearch: (q: string) => void;
}) {
  const { user } = useAuth();
  void onSearch;
  const popular = PRODUCTS.filter(p => p.hot && p.img).slice(0, 6);
  const designFace = PRODUCTS.find(p => p.sku === "MVS-STR-PRM1224");

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------ the category grid */}
      <section>
        <div className="mb-2.5 flex items-baseline justify-between">
          <h1 className="disp text-[18px] font-bold">Shop by category</h1>
          <button className="text-[13px] font-semibold text-[hsl(var(--safety-2))] hover:underline"
            onClick={() => onShop()}>All {PRODUCTS.length} products →</button>
        </div>
        <div className="grid grid-cols-3 gap-px sm:grid-cols-4 lg:grid-cols-6">
          {CATEGORIES.map(c => (
            <CatTile key={c.id} id={c.id} name={c.name} onOpen={() => onShop(c.id)} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ design center, one row */}
      <button onClick={onScreens}
        className="flex w-full items-center gap-4 border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-3 text-left transition-colors hover:border-[hsl(var(--safety-2))]">
        {designFace?.img && (
          <img src={designFace.img} alt="" className="h-16 w-16 shrink-0 object-cover" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-bold">Design Center</div>
          <div className="text-[13px] text-[hsl(var(--ink-2))]">
            Sheds, garages, barndos, containers, docks — configure in 3D, priced line by line.
          </div>
        </div>
        <span className="shrink-0 rounded-[6px] bg-[hsl(var(--safety-2))] px-3.5 py-2 text-[13px] font-bold text-white">
          Start a design
        </span>
      </button>

      {/* ------------------------------------------------ popular, price-first */}
      {popular.length > 0 && (
        <section>
          <h2 className="disp mb-2.5 text-[16px] font-bold">Popular right now</h2>
          <div className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
            {popular.map(p => (
              <button key={p.sku} onClick={() => onShop(p.cat)}
                className="flex flex-col border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-2.5 text-left transition-colors hover:border-[hsl(var(--safety-2))]">
                <div className="mb-2 flex aspect-square items-center justify-center overflow-hidden bg-white">
                  <img src={p.img} alt="" loading="lazy" className="h-full w-full object-contain" />
                </div>
                <div className="line-clamp-2 text-[12px] font-semibold leading-[1.25]">{p.name}</div>
                <div className="num mt-1 text-[14px] font-bold">
                  {money(p.price)} <span className="lab text-[10px]">list</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------ utility strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-[hsl(var(--rule))] pt-3 text-[13px]">
        <button className="font-semibold hover:text-[hsl(var(--safety-2))]" onClick={onYard}>The Yard — used &amp; surplus</button>
        <button className="font-semibold hover:text-[hsl(var(--safety-2))]" onClick={onEarth}>Delivery — any counter in town</button>
        {!user && (
          <button className="ml-auto font-semibold text-[hsl(var(--safety-2))] hover:underline" onClick={onSignIn}>
            Open an account — contractor pricing &amp; Net-30
          </button>
        )}
      </div>
    </div>
  );
}
