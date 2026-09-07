/* The Design Center as a standalone micro-app — canvas-first, minimal chrome.
   Selections happen in the design window; the store stays out of the frame. */
import React from "react";
import { readHashDesign } from "./designStore";

const Screen = React.lazy(() => import("./views/Screen"));
const Shed = React.lazy(() => import("./views/Shed"));
const Deck = React.lazy(() => import("./views/Deck"));
const Container = React.lazy(() => import("./views/Container"));
const Dock = React.lazy(() => import("./views/Dock"));
const Barndo = React.lazy(() => import("./views/Barndo"));
const Warehouse = React.lazy(() => import("./views/Warehouse"));
const Program = React.lazy(() => import("./views/Program"));

const TOOLS: { id: string; label: string; sub: string; C: React.LazyExoticComponent<React.ComponentType<{ initial?: never }>> }[] = [
  { id: "shed", label: "Backyard Studios", sub: "Sheds to premium portables", C: Shed as never },
  { id: "garage", label: "Garages & Carports", sub: "Coming to the micro-app next build", C: Shed as never },
  { id: "barndo", label: "Barndos", sub: "30×40 and 40×60 shells", C: Barndo as never },
  { id: "warehouse", label: "Warehouses", sub: "50×100 with docks", C: Warehouse as never },
  { id: "container", label: "Containers", sub: "Conex offices and STR units", C: Container as never },
  { id: "deck", label: "Decks", sub: "Ledger-hung, IRC R507", C: Deck as never },
  { id: "dock", label: "Lake Docks", sub: "Floating sections", C: Dock as never },
  { id: "screen", label: "Roof Screens", sub: "Equipment screens", C: Screen as never },
  { id: "program", label: "Modular Projects", sub: "Hotels, offices, schools", C: Program as never },
];

/** Tell the embedding host (chat surface) what happened in the window. */
function postToHost(event: string, payload?: unknown) {
  try { window.parent?.postMessage({ type: "mvs-design", event, payload }, "*"); } catch { /* sandboxed */ }
}

export default function DesignerApp() {
  const boot = React.useMemo(() => {
    const d = readHashDesign();
    if (d && TOOLS.some(t => t.id === d.tool && t.id !== "garage")) return { tool: d.tool, params: d.params };
    const q = new URLSearchParams(location.search).get("tool");
    if (q && TOOLS.some(t => t.id === q && q !== "garage")) return { tool: q, params: undefined };
    return null;
  }, []);
  const [tool, setTool] = React.useState<string | null>(boot?.tool ?? null);

  React.useEffect(() => {
    const onKit = (e: Event) => postToHost("quote", (e as CustomEvent).detail);
    const onSignIn = () => postToHost("signin-requested");
    window.addEventListener("mvs-add-kit", onKit);
    window.addEventListener("mvs-signin", onSignIn);
    return () => { window.removeEventListener("mvs-add-kit", onKit); window.removeEventListener("mvs-signin", onSignIn); };
  }, []);

  const active = TOOLS.find(t => t.id === tool && t.id !== "garage");
  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <header className="flex items-center gap-3 bg-[#0a1e48] px-4 py-2 text-white">
        <span className="font-bold tracking-tight">Misty Valley <span className="text-amber-400">Design</span></span>
        {active && (
          <button type="button" className="ml-auto rounded border border-white/30 px-3 py-1 text-sm"
            onClick={() => { setTool(null); postToHost("closed-tool", { tool: active.id }); }}>
            ‹ All tools
          </button>
        )}
      </header>
      {!active ? (
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {TOOLS.filter(t => t.id !== "garage").map(t => (
            <button key={t.id} type="button"
              className="rounded-lg border border-stone-200 bg-white p-4 text-left shadow-sm hover:border-[#0a1e48]"
              onClick={() => { setTool(t.id); postToHost("opened-tool", { tool: t.id }); }}>
              <div className="font-semibold text-[#0a1e48]">{t.label}</div>
              <div className="mt-1 text-xs text-stone-500">{t.sub}</div>
            </button>
          ))}
        </div>
      ) : (
        <React.Suspense fallback={<div className="p-8 text-center text-stone-500">Loading the design window…</div>}>
          <active.C initial={boot?.tool === active.id ? (boot.params as never) : undefined} />
        </React.Suspense>
      )}
    </div>
  );
}
