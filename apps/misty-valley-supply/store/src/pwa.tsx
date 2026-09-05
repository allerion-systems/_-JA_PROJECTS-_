import * as React from "react";
import { Btn, Lab, cx } from "@/ui";

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** Registers the service worker. Silent when there is no /sw.js (dev, artifact). */
export function registerSW() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && location.hostname !== "localhost") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => { /* not deployed with a SW */ });
  });
}

/** The "add to home screen" bar. Shows only when the browser offers it. */
export function InstallBar() {
  const [evt, setEvt] = React.useState<Prompt | null>(null);
  const [gone, setGone] = React.useState(() => {
    try { return localStorage.getItem("mvs-install") === "no"; } catch { return false; }
  });

  React.useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e as Prompt); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  if (!evt || gone) return null;

  const dismiss = () => {
    setGone(true);
    try { localStorage.setItem("mvs-install", "no"); } catch { /* private mode */ }
  };

  return (
    <div className={cx("fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-50 px-3 lg:bottom-4")}>
      <div className="mx-auto flex max-w-[520px] items-center gap-3 card-hi bg-[hsl(var(--ground))] p-3 shadow-lg">
        <img src="/icon-192.png" alt="" className="h-11 w-11 shrink-0 border border-[hsl(var(--rule))]" />
        <div className="min-w-0 flex-1">
          <Lab className="mb-0.5">Put it on your phone</Lab>
          <p className="text-[12.5px] leading-[1.35] text-[hsl(var(--ink-2))]">
            Opens full screen, works with one bar of signal.
          </p>
        </div>
        <Btn size="sm" onClick={() => { evt.prompt(); setGone(true); }}>Install</Btn>
        <button onClick={dismiss} aria-label="Not now"
          className="lab shrink-0 px-1 text-[hsl(var(--ink-3))]">✕</button>
      </div>
    </div>
  );
}
