import * as React from "react";

/** Line-drawn product marks. Real catalog rows are image-led, and rows that
 *  share an icon are unscannable — so these key on the SKU family first and
 *  fall back to the category only when a family has no mark of its own. */

const M: Record<string, React.ReactNode> = {
  /* --- guardrail & edge ------------------------------------------------ */
  guardrail: (<>
    <path d="M6 20h52M6 34h52" />
    <path d="M14 14v34M32 14v34M50 14v34" />
    <path d="M8 48h48" />
  </>),
  base: (<>
    <path d="M32 8v26" />
    <path d="M24 34h16v8H24z" />
    <path d="M12 42h40l4 10H8z" />
    <path d="M20 46h24" />
  </>),
  warnline: (<>
    <path d="M6 42h52" />
    <path d="M16 42V22M32 42V22M48 42V22" />
    <path d="M16 22h32" />
    <path d="m20 22 4 6 4-6M36 22l4 6 4-6" />
  </>),
  toe: (<>
    <path d="M6 46h52" />
    <path d="M8 32h48v14H8z" />
    <path d="M16 32v14M32 32v14M48 32v14" />
  </>),
  cover: (<>
    <path d="M10 18h44v28H10z" />
    <path d="M10 18l44 28M54 18 10 46" />
    <path d="M22 10h20" />
  </>),
  skylight: (<>
    <path d="M8 44 20 20h24l12 24z" />
    <path d="M14 32h36M26 20l-6 24M38 20l6 24" />
  </>),
  anchor: (<>
    <path d="M8 46h48" />
    <path d="M20 46V34h24v12" />
    <path d="M32 34V16" />
    <circle cx="32" cy="12" r="5" />
    <path d="M24 24h16" />
  </>),

  /* --- head ------------------------------------------------------------ */
  hatCap: (<>
    <path d="M14 40c0-13 7-21 18-21s18 8 18 21" />
    <path d="M8 40h48c0 3-2 5-5 5H13c-3 0-5-2-5-5" />
    <path d="M32 19v-6" />
  </>),
  hatVent: (<>
    <path d="M14 40c0-13 7-21 18-21s18 8 18 21" />
    <path d="M10 40h44c0 3-2 5-5 5H15c-3 0-5-2-5-5" />
    <path d="M26 22v10M32 20v12M38 22v10" />
    <path d="M16 45c4 6 28 6 32 0" />
  </>),
  hatBrim: (<>
    <path d="M16 38c0-12 6-19 16-19s16 7 16 19" />
    <ellipse cx="32" cy="41" rx="26" ry="6" />
    <path d="M32 19v-6" />
  </>),

  /* --- eye -------------------------------------------------------------- */
  glasses: (<>
    <path d="M4 24h56" />
    <path d="M6 24c-1 9 3 14 11 14s12-5 13-12" />
    <path d="M58 24c1 9-3 14-11 14s-12-5-13-12" />
    <path d="M30 26h4" />
  </>),
  goggle: (<>
    <path d="M12 22h40c3 0 5 3 5 7v6c0 4-2 7-5 7H12c-3 0-5-3-5-7v-6c0-4 2-7 5-7z" />
    <path d="M32 22v20" />
    <path d="M7 28H2M57 28h5" />
  </>),

  /* --- hand ------------------------------------------------------------- */
  glove: (<>
    <path d="M22 52V26a4 4 0 0 1 8 0" />
    <path d="M30 26v-7a4 4 0 0 1 8 0v7" />
    <path d="M38 26v-5a4 4 0 0 1 8 0v11" />
    <path d="M46 32a3.5 3.5 0 0 1 7 1v10c0 8-6 13-14 13H32c-6 0-10-4-10-9" />
  </>),

  /* --- hi-vis ----------------------------------------------------------- */
  vest: (<>
    <path d="M20 12 12 18v34h40V18l-8-6" />
    <path d="M20 12h24l-6 9h-12z" />
    <path d="M12 30h40M12 38h40" />
    <path d="M32 21v31" />
  </>),
  vestSleeve: (<>
    <path d="M20 12 8 18v14l6 2v18h36V34l6-2V18l-12-6" />
    <path d="M20 12h24l-6 9h-12z" />
    <path d="M14 34h36M14 42h36" />
  </>),

  /* --- fall ------------------------------------------------------------- */
  harness: (<>
    <circle cx="32" cy="13" r="5" />
    <path d="M32 18v16M20 26l12-6 12 6" />
    <path d="M32 34 22 54M32 34l10 20" />
    <path d="M24 30h16M26 42h12" />
  </>),
  srl: (<>
    <circle cx="32" cy="22" r="12" />
    <circle cx="32" cy="22" r="4" />
    <path d="M32 34v14" />
    <path d="M26 48h12l-6 8z" />
  </>),
  lanyard: (<>
    <path d="M26 8h12v8H26z" />
    <path d="M32 16v8" />
    <path d="M24 24h16v14H24z" />
    <path d="M26 28h12M26 32h12" />
    <path d="M32 38v10M28 48h8l-4 8z" />
  </>),
};

/** SKU family → mark. First match wins. */
const BY_SKU: [RegExp, string][] = [
  [/RG-BASE/, "base"], [/RG-1000|YG-10\b|YG-POST/, "guardrail"],
  [/WL-/, "warnline"], [/YG-TOE/, "toe"], [/HOLE-/, "cover"],
  [/SKY-/, "skylight"], [/ANC-/, "anchor"],
  [/HH-C1/, "hatCap"], [/HH-T2V/, "hatVent"], [/HH-BRIM/, "hatBrim"],
  [/SG-/, "glasses"], [/GG-/, "goggle"], [/GL-/, "glove"],
  [/VS-C3/, "vestSleeve"], [/VS-/, "vest"],
  [/FH-/, "harness"], [/SRL-/, "srl"], [/LY-/, "lanyard"],
];

const BY_CAT: Record<string, string> = {
  roof: "guardrail", guard: "guardrail", head: "hatCap",
  eye: "glasses", hand: "glove", hivis: "vest", fall: "harness",
};

export function Glyph({ sku, cat, className }: { sku?: string; cat: string; className?: string }) {
  const key = (sku && BY_SKU.find(([re]) => re.test(sku))?.[1]) || BY_CAT[cat] || "guardrail";
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="square" strokeLinejoin="miter" className={className} aria-hidden>
      {M[key]}
    </svg>
  );
}
