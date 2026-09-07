import * as React from "react";
import { useAuth } from "@/auth";
import { cx, money } from "@/ui";
import { useAnimatedNumber } from "@/useAnimatedNumber";

/* ------------------------------------------------------------------------
   ToolShell — the shared viewport-first layout for every Design Center
   tool. The 3D canvas owns the screen; selections happen in a compact
   options drawer over the canvas (desktop) or a bottom sheet that scrolls
   under a sticky canvas (phone). Pricing/gating logic is untouched — this
   file is layout plumbing only.
   ---------------------------------------------------------------------- */

/** Ask the app shell to open the sign-in modal from anywhere in a tool. */
export const requestSignIn = () => window.dispatchEvent(new CustomEvent("mvs-signin"));

/* Estimates are gated: guests design freely and sign in to see the number
   (lead capture, Lester-style). Signed-in accounts get the live price.
   Agents get ungated pricing through the MCP endpoint — never through this UI. */
export function PriceBar({ label, total }: { label: string; total: number }) {
  const { user } = useAuth();
  const shown = useAnimatedNumber(total);
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] bg-[hsl(var(--marine))]/95 px-3.5 py-2 shadow-[0_4px_14px_-4px_hsl(222_70%_12%/.5)] backdrop-blur-sm">
      <span className="min-w-0 truncate text-[12px] font-semibold text-white/85">{label}</span>
      {user ? (
        <span className="flex shrink-0 items-baseline gap-2">
          <span className="eyebrow text-[hsl(var(--safety-hi))]">Your price</span>
          <span className="num text-[18px] font-bold text-white">{money(Math.round(shown))}</span>
        </span>
      ) : (
        <button onClick={requestSignIn}
          className="flex h-8 shrink-0 items-center rounded-[6px] bg-[hsl(var(--safety-hi))] px-3 text-[12px] font-bold text-[hsl(var(--marine-2))] hover:brightness-105">
          Sign in to view estimate
        </button>
      )}
    </div>
  );
}

// ---- compact step strip — lives in the drawer/sheet header ---------------

export function Steps({ steps, step, onStep }: { steps: string[]; step: number; onStep: (i: number) => void }) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    ref.current?.querySelector('[aria-current="step"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [step]);
  return (
    <div ref={ref} className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
      {steps.map((s, i) => (
        <button key={s} onClick={() => onStep(i)} aria-current={i === step ? "step" : undefined}
          className={cx("flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[12px] font-semibold transition-colors",
            i === step
              ? "border-[hsl(var(--safety-2))] bg-[hsl(var(--safety-2))] text-white"
              : cx("border-[hsl(var(--rule))] bg-[hsl(var(--panel))] hover:border-[hsl(var(--ink))]",
                  i < step ? "text-[hsl(var(--ink))]" : "text-[hsl(var(--ink-3))]"))}>
          <span className="num">{i + 1}</span>{s}
        </button>
      ))}
    </div>
  );
}

// ---- overlay chip style — matches the in-scene camera/Dims chips ---------

export const chipCls =
  "rounded-[5px] border border-white/25 bg-[hsl(var(--marine))]/80 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm transition-colors hover:bg-[hsl(var(--marine))]";

// ---- the shell -----------------------------------------------------------

const CANVAS_H_LG = "lg:h-[max(480px,100vh_-_230px)]"; // desktop: viewport-filling, never under 480px
const tabCls = (on: boolean) =>
  cx("h-8 rounded-[6px] px-3 text-[13px] font-semibold transition-colors",
    on ? "bg-[hsl(var(--marine))] text-white" : "text-[hsl(var(--ink-2))] hover:text-[hsl(var(--ink))]");

export function ToolShell({ price, steps, step = 0, onStep, scene, toolbar, details, footer, children }: {
  /** Slim floating estimate bar — gating identical to the old PriceBar. */
  price?: { label: string; total: number };
  steps?: string[]; step?: number; onStep?: (i: number) => void;
  /** The 3D scene (wrapped in its own Suspense by the tool). */
  scene: React.ReactNode;
  /** Compact chip cluster over the canvas, top-right (Save / Link / Spec). */
  toolbar?: React.ReactNode;
  /** BoM and other reference material — behind the Details tab. */
  details?: React.ReactNode;
  /** Drawer footer, usually the Next button. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(true); // desktop drawer collapse
  const [tab, setTab] = React.useState<"design" | "details">("design");
  const { user } = useAuth();
  // Guests design in peace: the estimate ask appears only once they reach
  // the final (Quote) step — the moment of intent, not a nag during design.
  // Signed-in accounts keep the live price on every step.
  const showPrice = !!price && (!!user || !steps || step === steps.length - 1);
  return (
    <div className="relative">
      {/* --------------------------- the design window owns the screen */}
      <div className="sticky top-[64px] z-20 lg:static lg:z-auto">
        <div className="card card-hi relative overflow-hidden">
          <div className={cx("h-[55.5vh] min-h-[320px]", CANVAS_H_LG)}>{scene}</div>
          {toolbar && (
            <div className="absolute right-2 top-2 z-20 flex max-w-[44%] flex-wrap items-center justify-end gap-1.5">
              {toolbar}
            </div>
          )}
          {/* the slim estimate bar rides the canvas once it's earned */}
          {showPrice && price && (
            <div className="absolute inset-x-2 bottom-2 z-10 lg:bottom-3 lg:left-3 lg:right-auto lg:w-[400px] lg:max-w-[calc(100%_-_360px)]">
              <PriceBar label={price.label} total={price.total} />
            </div>
          )}
        </div>
      </div>

      {/* ------------- options: bottom sheet (phone) / drawer (desktop) */}
      <div className={cx(
        "relative z-10 mt-1 flex flex-col rounded-t-[14px] border-t-2 border-[hsl(var(--safety-hi))] bg-[hsl(var(--ground))] shadow-[0_-10px_24px_-14px_hsl(222_70%_12%/.45)]",
        "lg:absolute lg:right-3 lg:top-12 lg:mt-0 lg:h-[calc(max(480px,100vh_-_230px)_-_60px)] lg:w-80 lg:rounded-[10px] lg:border lg:border-[hsl(var(--rule))] lg:bg-[hsl(var(--ground))]/95 lg:shadow-[0_10px_30px_-10px_hsl(222_70%_12%/.45)] lg:backdrop-blur-sm",
        open ? "lg:flex" : "lg:hidden")}>
        <div className="flex items-center gap-1 border-b border-[hsl(var(--rule))] px-2.5 py-1">
          <button onClick={() => setTab("design")} className={tabCls(tab === "design")}>Design</button>
          {details && (
            <button onClick={() => setTab("details")} className={tabCls(tab === "details")}>Details</button>
          )}
          <button onClick={() => setOpen(false)} aria-label="Collapse the options drawer"
            className="ml-auto hidden h-8 w-8 rounded-[6px] text-[15px] font-bold text-[hsl(var(--ink-3))] hover:bg-[hsl(var(--panel))] hover:text-[hsl(var(--ink))] lg:block">
            ›
          </button>
        </div>
        {steps && onStep && tab === "design" && (
          <div className="border-b border-[hsl(var(--rule))] px-2.5 py-1.5">
            <Steps steps={steps} step={step} onStep={onStep} />
          </div>
        )}
        <div className="min-h-0 flex-1 p-3 lg:overflow-y-auto">
          <div hidden={tab !== "design"}>{children}</div>
          {details && <div hidden={tab !== "details"}>{details}</div>}
        </div>
        {footer && tab === "design" && (
          <div className="border-t border-[hsl(var(--rule))] px-3.5 py-2.5">{footer}</div>
        )}
      </div>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="absolute right-3 top-12 z-20 hidden rounded-[8px] border border-[hsl(var(--rule))] bg-[hsl(var(--ground))]/95 px-3.5 py-2 text-[13px] font-semibold shadow-[0_6px_20px_-8px_hsl(222_70%_12%/.5)] backdrop-blur-sm lg:block">
          ‹ Options
        </button>
      )}

    </div>
  );
}
