import * as React from "react";

/* ------------------------------------------------------------------------
   useAnimatedNumber — rAF-tweens a displayed number toward its target so
   price changes read as motion instead of a hard swap. Respects
   prefers-reduced-motion (jumps instantly). Returns the in-flight value;
   round before formatting currency.
   ---------------------------------------------------------------------- */

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

function reducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function useAnimatedNumber(value: number, ms = 350): number {
  const [display, setDisplay] = React.useState(value);
  const shown = React.useRef(value); // last value actually rendered

  React.useEffect(() => {
    const from = shown.current;
    if (from === value) return;
    if (ms <= 0 || !Number.isFinite(from) || !Number.isFinite(value) || reducedMotion()) {
      shown.current = value;
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const v = t >= 1 ? value : from + (value - from) * easeOutCubic(t);
      shown.current = v;
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);

  return display;
}

export default useAnimatedNumber;
