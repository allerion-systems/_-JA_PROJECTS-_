import * as React from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { SITES, ago, isLive, lastPost, type Post, type Site } from "@/sites";
import { Glyph } from "@/glyph";
import { useAuth } from "@/auth";
import { Btn, Lab, Panel, Tag, cx } from "@/ui";

/* ------------------------------------------------------------- basemaps */
/* Open imagery and open vector tiles. No API key, attribution required. */

const SAT_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    img: {
      type: "raster", tileSize: 256, maxzoom: 19,
      tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
      attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    },
  },
  layers: [{ id: "img", type: "raster", source: "img" }],
};

const BASEMAPS: Record<"sat" | "map", { label: string; style: maplibregl.StyleSpecification | string }> = {
  sat: { label: "Satellite", style: SAT_STYLE },
  map: { label: "Map", style: "https://tiles.openfreemap.org/styles/positron" },
};

type BaseId = keyof typeof BASEMAPS;

/* ---------------------------------------------------------- story viewer */

function Story({ site, onClose }: { site: Site; onClose: () => void }) {
  const [i, setI] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [prog, setProg] = React.useState(0);
  const posts = site.posts;
  const p: Post = posts[i];

  React.useEffect(() => { setProg(0); }, [i]);
  React.useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setProg(x => {
      if (x >= 100) { setI(k => (k + 1 < posts.length ? k + 1 : k)); return 0; }
      return x + 2;
    }), 100);
    return () => clearInterval(t);
  }, [paused, posts.length]);

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI(x => Math.min(x + 1, posts.length - 1));
      if (e.key === "ArrowLeft") setI(x => Math.max(x - 1, 0));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose, posts.length]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black" onClick={e => e.stopPropagation()}>
      {/* progress */}
      <div className="flex gap-1 px-2 pt-[calc(8px+env(safe-area-inset-top))]">
        {posts.map((_, k) => (
          <div key={k} className="h-[3px] flex-1 bg-white/25">
            <div className="h-full bg-white transition-[width] duration-100"
              style={{ width: k < i ? "100%" : k === i ? `${prog}%` : "0%" }} />
          </div>
        ))}
      </div>

      {/* header */}
      <div className="flex items-start justify-between gap-3 px-3 py-2.5 text-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isLive(site) && (
              <span className="mono bg-[hsl(var(--safety))] px-1.5 py-px text-[10px] font-bold uppercase tracking-[0.1em]">
                Live
              </span>
            )}
            <span className="disp truncate text-[18px] font-bold leading-none">{site.name}</span>
          </div>
          <div className="mono mt-1 text-[11px] text-white/60">
            {p.who} · {p.role} · {ago(p.minsAgo)} ago
          </div>
        </div>
        <button onClick={onClose} aria-label="Close story"
          className="lab shrink-0 px-2 py-1 text-white/80">Close ✕</button>
      </div>

      {/* frame */}
      <div className="relative flex-1 select-none"
        onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}>
        {p.img ? (
          <img src={p.img} alt={p.caption} className="absolute inset-0 h-full w-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--ink))] text-white/25">
            <Glyph sku={p.glyph} cat="guard" className="h-40 w-40" />
          </div>
        )}
        {/* tap zones */}
        <button aria-label="Previous" onClick={() => setI(x => Math.max(x - 1, 0))}
          className="absolute inset-y-0 left-0 w-1/3" />
        <button aria-label="Next"
          onClick={() => (i + 1 < posts.length ? setI(i + 1) : onClose())}
          className="absolute inset-y-0 right-0 w-2/3" />
      </div>

      {/* caption */}
      <div className="bg-gradient-to-t from-black to-black/0 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-6 text-white">
        <p className="max-w-[60ch] text-[14px] leading-[1.5]">{p.caption}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {p.tags.map(t => (
            <span key={t} className="mono border border-white/25 px-1.5 py-0.5 text-[10.5px] text-white/75">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- view */

export default function Earth({ onSignIn }: { onSignIn: () => void }) {
  const { can, person } = useAuth();
  const box = React.useRef<HTMLDivElement>(null);
  const map = React.useRef<maplibregl.Map | null>(null);
  const marks = React.useRef<maplibregl.Marker[]>([]);
  const [base, setBase] = React.useState<BaseId>("sat");
  const [open, setOpen] = React.useState<Site | null>(null);
  const [focus, setFocus] = React.useState<string | null>(null);
  const [shot, setShot] = React.useState<{ url: string; site: string } | null>(null);
  const [failed, setFailed] = React.useState(false);

  const sites = [...SITES].sort((a, b) => lastPost(a) - lastPost(b));

  /* map */
  React.useEffect(() => {
    if (!box.current || map.current) return;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({
        container: box.current,
        style: SAT_STYLE,
        center: [-85.95, 37.55],
        zoom: 7.4,
        attributionControl: { compact: true },
      });
    } catch {
      setFailed(true);
      return;
    }
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("error", () => setFailed(true));
    map.current = m;

    for (const s of sites) {
      const el = document.createElement("button");
      el.className = "mvs-pin";
      el.setAttribute("aria-label", s.name);
      el.innerHTML =
        `<span class="mvs-pin-ring${isLive(s) ? " live" : ""}"></span>` +
        `<span class="mvs-pin-dot">${s.posts.length}</span>` +
        `<span class="mvs-pin-name">${s.name}</span>`;
      el.onclick = () => { setFocus(s.id); m.flyTo({ center: [s.lng, s.lat], zoom: 17, duration: 900 }); };
      marks.current.push(new maplibregl.Marker({ element: el }).setLngLat([s.lng, s.lat]).addTo(m));
    }
    return () => { marks.current.forEach(x => x.remove()); marks.current = []; m.remove(); map.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(BASEMAPS[base].style);
  }, [base]);

  const go = (s: Site) => {
    setFocus(s.id);
    map.current?.flyTo({ center: [s.lng, s.lat], zoom: 17, duration: 900 });
  };

  const capture = (e: React.ChangeEvent<HTMLInputElement>, s: Site) => {
    const f = e.target.files?.[0];
    if (f) setShot({ url: URL.createObjectURL(f), site: s.name });
  };

  const focused = sites.find(s => s.id === focus) ?? null;
  const liveCount = sites.filter(isLive).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[hsl(var(--ink))] pb-2">
        <div>
          <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Job Site Earth</Lab>
          <h1 className="disp text-[28px] font-bold leading-none sm:text-[34px]">The corridor, live</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="mono text-[11.5px] text-[hsl(var(--ink-3))]">
            <span className="text-[hsl(var(--safety))]">●</span> {liveCount} live now
          </span>
          <div className="flex border border-[hsl(var(--rule))]">
            {(Object.keys(BASEMAPS) as BaseId[]).map(b => (
              <button key={b} onClick={() => setBase(b)}
                className={cx("lab px-2.5 py-2",
                  base === b ? "bg-[hsl(var(--ink))] text-white" : "text-[hsl(var(--ink-2))]")}>
                {BASEMAPS[b].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6">
        {/* map */}
        <div className="min-w-0">
          <div className="relative h-[46vh] min-h-[320px] card-hi lg:h-[62vh]">
            <div ref={box} className="absolute inset-0" />
            {failed && (
              <div className="absolute inset-0 flex items-center justify-center bg-[hsl(var(--panel-2))] p-6 text-center">
                <p className="max-w-[46ch] text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                  The map tiles could not load from here. The site list below still works —
                  tiles come from Esri imagery and OpenFreeMap and need outbound network access.
                </p>
              </div>
            )}
            {focused && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
                <div className="pointer-events-auto card-hi bg-[hsl(var(--ground))]">
                  <div className="tape h-1" />
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {isLive(focused) && <Tag tone="safety">Live</Tag>}
                        <span className="disp truncate text-[18px] font-bold leading-none">{focused.name}</span>
                      </div>
                      <div className="mono mt-1 text-[11px] text-[hsl(var(--ink-3))]">
                        {focused.gc} · {focused.phase} · {focused.crew} on site · last post {ago(lastPost(focused))} ago
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Btn size="sm" onClick={() => setOpen(focused)}>Watch the story</Btn>
                      {can("site.post") ? (
                        <label className="lab flex h-9 cursor-pointer items-center border border-[hsl(var(--ink))] px-3">
                          Go live
                          <input type="file" accept="image/*" capture="environment" className="hidden"
                            onChange={e => capture(e, focused)} />
                        </label>
                      ) : (
                        <button onClick={onSignIn}
                          className="lab h-9 border border-[hsl(var(--rule))] px-3 text-[hsl(var(--ink-2))]">
                          Sign in to post
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="mono mt-2 text-[10.5px] leading-[1.5] text-[hsl(var(--ink-3))]">
            Imagery © Esri, Maxar, Earthstar Geographics · vector tiles OpenFreeMap, © OpenStreetMap
            contributors · rendered with MapLibre GL. Check the imagery terms before commercial use.
          </p>
        </div>

        {/* rail */}
        <aside className="mt-6 lg:mt-0">
          <Lab className="mb-2">Sites, most recent first</Lab>
          <div className="grid gap-2">
            {sites.map(s => {
              const live = isLive(s);
              return (
                <button key={s.id} onClick={() => go(s)}
                  className={cx("flex items-start gap-3 border p-2.5 text-left",
                    focus === s.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                   : "border-[hsl(var(--rule))] bg-[hsl(var(--panel))] hover:border-[hsl(var(--ink))]")}>
                  <span className={cx("relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border bg-white",
                    live ? "border-[hsl(var(--safety))]" : "border-[hsl(var(--rule))]")}>
                    {s.posts[0].img
                      ? <img src={s.posts[0].img} alt="" className="h-full w-full object-cover" />
                      : <Glyph sku={s.posts[0].glyph} cat="guard" className="h-6 w-6 text-[hsl(var(--ink-3))]" />}
                    {live && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 bg-[hsl(var(--safety))]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="disp block truncate text-[15px] font-semibold leading-none">{s.name}</span>
                    <span className="mono mt-1 block text-[10.5px] text-[hsl(var(--ink-3))]">
                      {s.trade} · {s.posts.length} posts · {ago(lastPost(s))} ago
                    </span>
                    <span className="mt-1 block text-[12px] leading-[1.35] text-[hsl(var(--ink-2))]">{s.phase}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <Panel className="mt-4 border-l-2 border-l-[hsl(var(--safety))]">
            <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Why this is the hook</Lab>
            <p className="text-[13px] leading-[1.55]">
              Nobody switches suppliers over a catalog. They switch because their GC, their
              foreman and their inspector can all see the same deck at the same time. Every
              photo is timestamped and pinned to a coordinate, so it doubles as the record
              nobody wants to build and everybody wants when there is a dispute.
            </p>
          </Panel>

          {!person && (
            <Panel className="mt-3">
              <p className="text-[12.5px] leading-[1.5] text-[hsl(var(--ink-2))]">
                Watching is open to anyone. Posting needs an account —{" "}
                <button onClick={onSignIn} className="font-semibold text-[hsl(var(--safety-2))] underline">
                  sign in
                </button>.
              </p>
            </Panel>
          )}
        </aside>
      </div>

      {open && <Story site={open} onClose={() => setOpen(null)} />}

      {/* what a real capture produced */}
      {shot && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShot(null)}>
          <div className="max-h-[90vh] w-full max-w-[420px] overflow-y-auto border-2 border-[hsl(var(--safety))] bg-[hsl(var(--ground))]"
            onClick={e => e.stopPropagation()}>
            <div className="tape h-1.5" />
            <img src={shot.url} alt="Your capture" className="max-h-[52vh] w-full object-contain bg-black" />
            <div className="p-4">
              <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Posting to {shot.site}</Lab>
              <p className="text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                In production this uploads with its timestamp and GPS fix, appends to the site
                story, and pushes to everyone following the job. Here it stays on your device.
              </p>
              <Btn className="mt-3 w-full" onClick={() => setShot(null)}>Done</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
