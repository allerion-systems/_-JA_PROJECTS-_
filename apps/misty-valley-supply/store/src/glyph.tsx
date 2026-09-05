import * as React from "react";

/**
 * Product marks.
 *
 * These were line drawings — 18 of them covering 24 SKUs, so three adjacent
 * glove rows drew the same picture and a catalog you cannot scan is not a
 * catalog. They are now filled, shaded, individually coloured objects sitting
 * on a contact shadow: every SKU has its own, and the colour is the real
 * colour of the real part, because a white Type I hat and a yellow one are
 * different purchases.
 *
 * Not photography. But an object with a ground shadow and a highlight reads as
 * a thing on a shelf, where an outline reads as a wireframe.
 */

/* --------------------------------------------------------------- palette */

const C = {
  ink: "#252a34", dark: "#33394a", steel: "#8d94a3", steelD: "#616978",
  steelL: "#c3c8d2", galv: "#aab3c1", galvD: "#7c8593",
  oshaY: "#f0b400", oshaYD: "#c08d00",
  hivis: "#cfe022", hivisD: "#a3b016",
  orange: "#e45407", orangeD: "#b03d04",
  white: "#eef0f3", whiteD: "#cbd0d8",
  tan: "#c9a06a", tanD: "#9d7844",
  lens: "#cfe0ef", lensD: "#9fb6ca", smoke: "#525a68",
  black: "#3a3f4a", blackD: "#252932",
  red: "#c0392b", marine: "#0c419d",
};

/** Everything sits on the same ground so the set reads as one shelf. */
const Shadow = () => <ellipse cx="32" cy="57" rx="19" ry="2.6" fill="#252a34" opacity=".13" />;

/* ------------------------------------------------------------- the marks */

const M: Record<string, React.ReactNode> = {

  /* ---- guardrail and edge protection ---------------------------------- */

  // Non-penetrating guardrail run: yellow rail, dark counterweight bases.
  guardrail: (<>
    <Shadow />
    <rect x="4" y="16" width="56" height="4.5" rx="1" fill={C.oshaY} />
    <rect x="4" y="16" width="56" height="1.6" rx="0.8" fill="#fff" opacity=".45" />
    <rect x="4" y="30" width="56" height="4.5" rx="1" fill={C.oshaY} />
    <rect x="4" y="30" width="56" height="1.6" rx="0.8" fill="#fff" opacity=".35" />
    {[10, 30, 50].map(x => <rect key={x} x={x} y="12" width="4.5" height="34" rx="1" fill={C.oshaYD} />)}
    {[6, 26, 46].map(x => <rect key={x} x={x} y="46" width="13" height="6" rx="1.5" fill={C.ink} />)}
  </>),

  // Guardrail post on its own.
  post: (<>
    <Shadow />
    <rect x="28" y="8" width="6" height="38" rx="1.5" fill={C.oshaY} />
    <rect x="28" y="8" width="2.2" height="38" rx="1.1" fill="#fff" opacity=".4" />
    <rect x="22" y="18" width="20" height="4" rx="1" fill={C.oshaYD} />
    <rect x="22" y="32" width="20" height="4" rx="1" fill={C.oshaYD} />
    <rect x="18" y="46" width="28" height="7" rx="2" fill={C.ink} />
  </>),

  // Counterweight base plate, seen at an angle.
  base: (<>
    <Shadow />
    <rect x="29" y="6" width="6" height="26" rx="1.5" fill={C.oshaY} />
    <path d="M10 40h44l6 12H4z" fill={C.ink} />
    <path d="M10 40h44l2.4 5H7.6z" fill={C.dark} />
    <rect x="24" y="32" width="16" height="8" rx="1.5" fill={C.steelD} />
    <circle cx="16" cy="48" r="1.6" fill={C.steel} />
    <circle cx="48" cy="48" r="1.6" fill={C.steel} />
  </>),

  // Warning line: rope on stanchions with hazard flags.
  warnline: (<>
    <Shadow />
    <path d="M6 26q26 8 52 0" stroke={C.oshaY} strokeWidth="3" fill="none" strokeLinecap="round" />
    {[14, 32, 50].map(x => <rect key={x} x={x - 2} y="24" width="4" height="24" rx="1" fill={C.steelD} />)}
    {[10, 28, 46].map(x => <rect key={x} x={x} y="48" width="8" height="4" rx="1" fill={C.ink} />)}
    {[20, 38].map((x, i) => (
      <path key={x} d={`M${x} ${29 + i} l7 3 -7 4z`} fill={C.orange} />
    ))}
  </>),

  // Toeboard along a deck edge.
  toe: (<>
    <Shadow />
    <rect x="4" y="46" width="56" height="6" rx="1" fill={C.steelL} />
    <rect x="8" y="28" width="48" height="18" rx="1.5" fill={C.oshaY} />
    <rect x="8" y="28" width="48" height="4" rx="1" fill="#fff" opacity=".35" />
    {[16, 32, 48].map(x => <rect key={x} x={x - 1.5} y="28" width="3" height="18" fill={C.oshaYD} />)}
  </>),

  // Hole cover with the required marking.
  cover: (<>
    <Shadow />
    <path d="M8 22h48v22a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z" fill={C.steelD} />
    <path d="M8 22 32 12l24 10-24 8z" fill={C.steel} />
    <path d="M8 22 32 12l24 10-24 8z" fill="#fff" opacity=".12" />
    <rect x="16" y="34" width="32" height="8" rx="1" fill={C.oshaY} />
    <rect x="19" y="36.5" width="26" height="3" rx="1.5" fill={C.ink} opacity=".6" />
  </>),

  // Skylight screen: a mesh cage over an opening.
  skylight: (<>
    <Shadow />
    <path d="M8 48 20 20h24l12 28z" fill={C.lens} />
    <path d="M8 48 20 20h24l12 28z" fill="#fff" opacity=".35" />
    <path d="M8 48 20 20h24l12 28z" fill="none" stroke={C.galvD} strokeWidth="2.5" />
    {[26, 34, 42].map(x => <path key={x} d={`M${x} 20 ${x - 6} 48`} stroke={C.galv} strokeWidth="1.6" />)}
    {[28, 36, 44].map(y => <path key={y} d={`M${(y - 20) * 0.43 + 12} ${y} H${56 - (y - 20) * 0.43 - 6}`} stroke={C.galv} strokeWidth="1.6" />)}
  </>),

  // D-ring roof anchor on a plate.
  anchor: (<>
    <Shadow />
    <rect x="10" y="44" width="44" height="8" rx="2" fill={C.galv} />
    <rect x="10" y="44" width="44" height="2.6" rx="1.3" fill="#fff" opacity=".4" />
    <path d="M22 44V32h20v12z" fill={C.galvD} />
    <rect x="29" y="16" width="6" height="16" rx="2" fill={C.orange} />
    <path d="M32 6a9 9 0 0 1 0 18 9 9 0 0 1 0-18z" fill="none" stroke={C.ink} strokeWidth="4" />
    <circle cx="18" cy="48" r="1.8" fill={C.ink} opacity=".5" />
    <circle cx="46" cy="48" r="1.8" fill={C.ink} opacity=".5" />
  </>),

  /* ---- head ------------------------------------------------------------ */

  hatCap: (<>
    <Shadow />
    <path d="M6 42h52a6 6 0 0 1-6 5H12a6 6 0 0 1-6-5z" fill={C.whiteD} />
    <path d="M14 42c0-14 7-22 18-22s18 8 18 22z" fill={C.white} />
    <path d="M14 42c0-14 7-22 18-22 3 0 5 .6 7 1.6-8 3-13 11-13 20.4z" fill="#fff" opacity=".7" />
    <rect x="30" y="20" width="4" height="22" rx="2" fill={C.whiteD} />
  </>),

  hatVent: (<>
    <Shadow />
    <path d="M8 42h48a6 6 0 0 1-6 5H14a6 6 0 0 1-6-5z" fill={C.oshaYD} />
    <path d="M14 42c0-14 7-22 18-22s18 8 18 22z" fill={C.oshaY} />
    <path d="M14 42c0-14 7-22 18-22 3 0 5 .6 7 1.6-8 3-13 11-13 20.4z" fill="#fff" opacity=".45" />
    {[24, 32, 40].map(x => <rect key={x} x={x - 1.2} y="24" width="2.4" height="12" rx="1.2" fill={C.oshaYD} />)}
  </>),

  hatBrim: (<>
    <Shadow />
    <ellipse cx="32" cy="43" rx="27" ry="7" fill={C.orangeD} />
    <ellipse cx="32" cy="41.5" rx="27" ry="6.5" fill={C.orange} />
    <path d="M16 41c0-13 6-21 16-21s16 8 16 21z" fill={C.orange} />
    <path d="M16 41c0-13 6-21 16-21 2.6 0 4.6.5 6.4 1.5C31.6 24.5 27 32 27 41z" fill="#fff" opacity=".3" />
    <rect x="30" y="20" width="4" height="21" rx="2" fill={C.orangeD} />
  </>),

  /* ---- eye -------------------------------------------------------------- */

  glassesClear: (<>
    <Shadow />
    <path d="M4 26h56v4H4z" fill={C.ink} opacity=".0" />
    <path d="M6 24h52c1 0 2 1 2 2 0 8-5 14-13 14-7 0-11-4-12-9h-6c-1 5-5 9-12 9C9 40 4 34 4 26c0-1 1-2 2-2z" fill={C.lens} />
    <path d="M6 24h52c1 0 2 1 2 2 0 8-5 14-13 14-7 0-11-4-12-9h-6c-1 5-5 9-12 9C9 40 4 34 4 26c0-1 1-2 2-2z" fill="#fff" opacity=".5" />
    <path d="M8 26h20c0 2-1 4-2 6-4-1-13-3-18-6z" fill="#fff" opacity=".8" />
    <path d="M4 26h56" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
    <rect x="27" y="26" width="10" height="3" rx="1.5" fill={C.ink} />
  </>),

  glassesSmoke: (<>
    <Shadow />
    <path d="M6 24h52c1 0 2 1 2 2 0 8-5 14-13 14-7 0-11-4-12-9h-6c-1 5-5 9-12 9C9 40 4 34 4 26c0-1 1-2 2-2z" fill={C.smoke} />
    <path d="M8 26h18c0 2-1 4-2 5-4-1-11-2-16-5z" fill="#fff" opacity=".22" />
    <path d="M4 26h56" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
    <rect x="27" y="26" width="10" height="3" rx="1.5" fill={C.ink} />
  </>),

  goggle: (<>
    <Shadow />
    <path d="M2 26h60v10H2z" fill={C.ink} />
    <rect x="8" y="18" width="48" height="26" rx="9" fill={C.dark} />
    <rect x="12" y="22" width="40" height="17" rx="6" fill={C.lens} />
    <rect x="12" y="22" width="40" height="17" rx="6" fill="#fff" opacity=".4" />
    <path d="M15 24h14c-1 4-3 8-6 10-4-2-7-6-8-10z" fill="#fff" opacity=".65" />
    <rect x="30" y="18" width="4" height="26" rx="2" fill={C.dark} />
  </>),

  /* ---- hand ------------------------------------------------------------- */

  gloveA4: (<>
    <Shadow />
    <path d="M20 52V28a4.5 4.5 0 0 1 9 0v-9a4.5 4.5 0 0 1 9 0v9a4.5 4.5 0 0 1 9 0v13c0 9-6 14-15 14h-3c-6 0-9-2-9-3z" fill={C.steelL} />
    <path d="M20 40v12c0 1 3 3 9 3h3c9 0 15-5 15-14v-2c-4 6-11 9-18 9-3 0-6-3-9-8z" fill={C.steel} />
    <rect x="18" y="48" width="30" height="7" rx="2" fill={C.oshaY} />
    <text x="33" y="53.6" fontSize="5" fontWeight="700" fill={C.ink} textAnchor="middle" fontFamily="Inter, sans-serif">A4</text>
  </>),

  gloveA6: (<>
    <Shadow />
    <path d="M20 52V28a4.5 4.5 0 0 1 9 0v-9a4.5 4.5 0 0 1 9 0v9a4.5 4.5 0 0 1 9 0v13c0 9-6 14-15 14h-3c-6 0-9-2-9-3z" fill={C.black} />
    <path d="M22 26h24v10H22z" fill={C.orange} opacity=".9" />
    <path d="M20 40v12c0 1 3 3 9 3h3c9 0 15-5 15-14v-2c-4 6-11 9-18 9-3 0-6-3-9-8z" fill={C.blackD} />
    <rect x="18" y="48" width="30" height="7" rx="2" fill={C.oshaY} />
    <text x="33" y="53.6" fontSize="5" fontWeight="700" fill={C.ink} textAnchor="middle" fontFamily="Inter, sans-serif">A6</text>
  </>),

  gloveLeather: (<>
    <Shadow />
    <path d="M20 52V28a4.5 4.5 0 0 1 9 0v-9a4.5 4.5 0 0 1 9 0v9a4.5 4.5 0 0 1 9 0v13c0 9-6 14-15 14h-3c-6 0-9-2-9-3z" fill={C.tan} />
    <path d="M20 40v12c0 1 3 3 9 3h3c9 0 15-5 15-14v-2c-4 6-11 9-18 9-3 0-6-3-9-8z" fill={C.tanD} />
    <path d="M24 30h20M24 35h20" stroke={C.tanD} strokeWidth="1.2" />
    <rect x="17" y="46" width="32" height="9" rx="2" fill={C.tanD} />
  </>),

  /* ---- hi-vis ------------------------------------------------------------ */

  vestC2: (<>
    <Shadow />
    <path d="M20 12 12 18v34h40V18l-8-6-12 8z" fill={C.hivis} />
    <path d="M20 12l12 8 12-8-4-2-8 5-8-5z" fill={C.hivisD} />
    <rect x="12" y="28" width="40" height="4" fill={C.steelL} />
    <rect x="12" y="36" width="40" height="4" fill={C.steelL} />
    <rect x="30" y="20" width="4" height="32" fill={C.hivisD} />
  </>),

  vestC3: (<>
    <Shadow />
    <path d="M18 12 6 18v13l7 2v19h38V33l7-2V18l-12-6-14 9z" fill={C.hivis} />
    <path d="M18 12l14 9 14-9-4-2-10 6-10-6z" fill={C.hivisD} />
    <rect x="13" y="32" width="38" height="4" fill={C.steelL} />
    <rect x="13" y="40" width="38" height="4" fill={C.steelL} />
    <rect x="6" y="22" width="8" height="4" fill={C.steelL} />
    <rect x="50" y="22" width="8" height="4" fill={C.steelL} />
  </>),

  vestOrange: (<>
    <Shadow />
    <path d="M20 12 12 18v34h40V18l-8-6-12 8z" fill={C.orange} />
    <path d="M20 12l12 8 12-8-4-2-8 5-8-5z" fill={C.orangeD} />
    <rect x="12" y="28" width="40" height="4" fill={C.steelL} />
    <rect x="12" y="36" width="40" height="4" fill={C.steelL} />
    <rect x="30" y="20" width="4" height="32" fill={C.orangeD} />
  </>),

  /* ---- fall protection ---------------------------------------------------- */

  harness: (<>
    <Shadow />
    <path d="M22 10h20l-3 8H25z" fill={C.black} />
    <path d="M25 18 20 52h6l6-22 6 22h6l-5-34z" fill={C.black} />
    <path d="M22 26h20v5H22z" fill={C.orange} />
    <rect x="20" y="44" width="24" height="5" rx="1" fill={C.blackD} />
    <circle cx="32" cy="22" r="4.5" fill={C.galv} />
    <circle cx="32" cy="22" r="2.2" fill={C.dark} />
  </>),

  srl: (<>
    <Shadow />
    <path d="M18 10h28a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z" fill={C.galv} />
    <path d="M18 10h28a6 6 0 0 1 6 6v4H12v-4a6 6 0 0 1 6-6z" fill="#fff" opacity=".35" />
    <circle cx="32" cy="23" r="8" fill={C.dark} />
    <circle cx="32" cy="23" r="3" fill={C.galvD} />
    <rect x="30" y="36" width="4" height="10" fill={C.steelD} />
    <path d="M32 46a5 5 0 0 1 0 10 5 5 0 0 1 0-10z" fill="none" stroke={C.orange} strokeWidth="3" />
  </>),

  lanyard: (<>
    <Shadow />
    <path d="M26 6h12v7H26z" fill={C.galv} />
    <rect x="22" y="13" width="20" height="18" rx="3" fill={C.orange} />
    <rect x="22" y="13" width="20" height="5" rx="2.5" fill="#fff" opacity=".3" />
    <path d="M26 20h12M26 25h12" stroke={C.orangeD} strokeWidth="1.6" />
    <rect x="29" y="31" width="6" height="12" fill={C.orange} />
    <path d="M32 43a6 6 0 0 1 0 12 6 6 0 0 1 0-12z" fill="none" stroke={C.dark} strokeWidth="3.4" />
  </>),

  /* ---- roof screen parts --------------------------------------------------- */

  frame: (<>
    <Shadow />
    <rect x="8" y="14" width="48" height="4" rx="2" fill={C.galv} />
    <rect x="8" y="14" width="48" height="1.5" rx=".75" fill="#fff" opacity=".5" />
    <rect x="8" y="30" width="48" height="4" rx="2" fill={C.galv} />
    {[12, 46].map(x => <rect key={x} x={x} y="10" width="5" height="38" rx="2" fill={C.galvD} />)}
    <path d="M17 46 44 20" stroke={C.galv} strokeWidth="4" strokeLinecap="round" />
    <rect x="8" y="48" width="14" height="5" rx="1.5" fill={C.ink} />
    <rect x="42" y="48" width="14" height="5" rx="1.5" fill={C.ink} />
  </>),

  panel: (<>
    <Shadow />
    <path d="M10 12h44v40H10z" fill={C.steelL} />
    {[16, 24, 32, 40, 48].map(x => (
      <g key={x}>
        <rect x={x} y="12" width="3.4" height="40" fill={C.steel} />
        <rect x={x} y="12" width="1.2" height="40" fill="#fff" opacity=".6" />
      </g>
    ))}
    <path d="M10 12h44v3H10z" fill="#fff" opacity=".45" />
  </>),

  hat: (<>
    <Shadow />
    <path d="M6 40h12V22h28v18h12v5H6z" fill={C.galv} />
    <path d="M18 22h28v3H18z" fill="#fff" opacity=".45" />
    <path d="M6 40h12v5H6zM46 40h12v5H46z" fill={C.galvD} />
  </>),

  screw: (<>
    <Shadow />
    <ellipse cx="32" cy="18" rx="13" ry="4.5" fill={C.orange} />
    <rect x="19" y="18" width="26" height="4" fill={C.orangeD} />
    <ellipse cx="32" cy="22" rx="13" ry="4.5" fill={C.galv} />
    <path d="M28 24h8l-1.5 22-2.5 6-2.5-6z" fill={C.galv} />
    {[28, 32, 36, 40].map(y => <path key={y} d={`M27.5 ${y}h9`} stroke={C.galvD} strokeWidth="1.4" />)}
  </>),

  drawing: (<>
    <Shadow />
    <path d="M12 8h30l10 10v34H12z" fill={C.white} />
    <path d="M42 8l10 10H42z" fill={C.whiteD} />
    <path d="M18 26h20v14H18z" fill="none" stroke={C.marine} strokeWidth="1.6" />
    <path d="M18 44h28M18 20h14" stroke={C.steel} strokeWidth="1.6" />
    <circle cx="42" cy="44" r="7" fill={C.red} opacity=".9" />
    <path d="M39 44l2.2 2.4 4-4.6" stroke="#fff" strokeWidth="1.8" fill="none" />
  </>),
};

/** SKU family to mark. First match wins; every catalog SKU has its own. */
const BY_SKU: [RegExp, string][] = [
  [/RG-BASE/, "base"], [/YG-POST/, "post"], [/RG-1000|YG-10\b/, "guardrail"],
  [/WL-/, "warnline"], [/YG-TOE/, "toe"], [/HOLE-/, "cover"],
  [/SKY-/, "skylight"], [/ANC-DL/, "anchor"],
  [/HH-C1/, "hatCap"], [/HH-T2V/, "hatVent"], [/HH-BRIM/, "hatBrim"],
  [/SG-SMK/, "glassesSmoke"], [/SG-/, "glassesClear"], [/GG-/, "goggle"],
  [/GL-LEA/, "gloveLeather"], [/GL-A6/, "gloveA6"], [/GL-/, "gloveA4"],
  [/VS-C3/, "vestC3"], [/VS-O/, "vestOrange"], [/VS-/, "vestC2"],
  [/FH-/, "harness"], [/SRL-/, "srl"], [/LY-/, "lanyard"],
  // roof screen parts
  [/RSF-/, "frame"], [/RSB-/, "base"], [/RSH-/, "hat"],
  [/RSP-/, "panel"], [/RSS-/, "screw"], [/RSA-/, "anchor"], [/RSE-/, "drawing"],
];

const BY_CAT: Record<string, string> = {
  roof: "guardrail", guard: "guardrail", head: "hatCap",
  eye: "glassesClear", hand: "gloveA4", hivis: "vestC2", fall: "harness",
};

export function Glyph({ sku, cat, className }: { sku?: string; cat?: string; className?: string }) {
  // Match against the SKU with the company prefix stripped: every SKU starts
  // with "MVS-", whose tail "VS-" is also the vest family prefix. Matching the
  // raw string put a hi-vis vest on every SKU tested after the vest rule.
  const bare = sku ? sku.replace(/^MVS-/, "") : undefined;
  const key = (bare && BY_SKU.find(([re]) => re.test(bare))?.[1])
    || (cat && BY_CAT[cat]) || (sku && M[sku] ? sku : "guardrail");
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden
      style={{ overflow: "visible" }}>
      {M[key] ?? M.guardrail}
    </svg>
  );
}
