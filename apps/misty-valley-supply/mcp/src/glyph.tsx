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


  /* ---- building materials ------------------------------------------------ */

  sidingVinyl: (<>
    <Shadow />
    {[14, 22, 30, 38, 46].map(y => (
      <g key={y}>
        <path d={`M8 ${y} h48 v6 l-3 2 H11 l-3 -2 z`} fill={C.white} />
        <path d={`M8 ${y + 6} l3 2 h42 l3 -2`} fill="none" stroke={C.whiteD} strokeWidth="1.4" />
      </g>
    ))}
    <path d="M8 14h48v3H8z" fill="#fff" opacity=".7" />
  </>),
  sidingAlum: (<>
    <Shadow />
    {[14, 24, 34, 44].map(y => (
      <g key={y}>
        <rect x="8" y={y} width="48" height="9" fill={C.steelL} />
        <rect x="8" y={y} width="48" height="2.4" fill="#fff" opacity=".55" />
        <rect x="8" y={y + 7.5} width="48" height="1.5" fill={C.steel} />
      </g>
    ))}
  </>),
  jchannel: (<>
    <Shadow />
    <path d="M20 8h10v40a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6v-8h8v6h4z" fill={C.white} />
    <path d="M20 8h4v40h-4z" fill={C.whiteD} />
    <path d="M40 8h6v46h-6z" fill={C.whiteD} opacity=".5" />
  </>),
  osb: (<>
    <Shadow />
    <path d="M10 12h44v40H10z" fill={C.tan} />
    {[[14,16,7],[24,15,9],[36,18,8],[45,14,6],[16,26,8],[30,25,10],[44,28,7],[12,36,9],[26,37,7],[38,35,9],[48,40,5],[18,45,8],[33,46,9]].map(([x,y,w],i) => (
      <rect key={i} x={x} y={y} width={w} height="3.2" rx="1" fill={C.tanD} opacity={i % 3 ? .55 : .8}
        transform={`rotate(${(i * 17) % 40 - 20} ${x} ${y})`} />
    ))}
    <path d="M10 12h44v3H10z" fill="#fff" opacity=".25" />
  </>),
  plywood: (<>
    <Shadow />
    <path d="M10 14h44v36H10z" fill={C.tan} />
    <path d="M10 14h44v4H10zM10 46h44v4H10z" fill={C.tanD} opacity=".5" />
    {[22, 30, 38].map(y => <path key={y} d={`M12 ${y} q10 -3 21 0 t21 0`} fill="none" stroke={C.tanD} strokeWidth="1.4" opacity=".7" />)}
  </>),
  stud: (<>
    <Shadow />
    <path d="M24 6h10l6 4v40l-6 4H24l-6-4V10z" fill={C.tan} />
    <path d="M24 6h10v48H24z" fill="#fff" opacity=".2" />
    <path d="M18 10v40" stroke={C.tanD} strokeWidth="2" />
    <rect x="21" y="24" width="16" height="8" rx="1" fill="#fff" opacity=".65" />
    <path d="M23 27h12M23 29.5h8" stroke={C.ink} strokeWidth="1.2" opacity=".55" />
  </>),
  drywallSheet: (<>
    <Shadow />
    <path d="M10 12h44v40H10z" fill={C.white} />
    <path d="M10 12h44v40H10z" fill="none" stroke={C.whiteD} strokeWidth="2" />
    <path d="M10 12v40M54 12v40" stroke={C.steelL} strokeWidth="3" />
    <circle cx="20" cy="22" r="1.4" fill={C.steel} /><circle cx="20" cy="34" r="1.4" fill={C.steel} />
    <circle cx="20" cy="46" r="1.4" fill={C.steel} /><circle cx="44" cy="22" r="1.4" fill={C.steel} />
    <circle cx="44" cy="34" r="1.4" fill={C.steel} /><circle cx="44" cy="46" r="1.4" fill={C.steel} />
  </>),
  wrap: (<>
    <Shadow />
    <circle cx="32" cy="26" r="16" fill={C.white} />
    <circle cx="32" cy="26" r="6" fill={C.steelL} />
    <path d="M16 26v22h32V26" fill={C.white} />
    <path d="M16 44h32v4H16z" fill={C.whiteD} />
    <path d="M20 32h24M20 37h24" stroke={C.marine} strokeWidth="1.6" opacity=".5" />
  </>),

  conex: (<>
    <Shadow />
    <path d="M6 18h52v30H6z" fill={C.marine} />
    {[12, 19, 26, 33, 40, 47].map(x => <rect key={x} x={x} y="18" width="2.5" height="30" fill="#0a3580" />)}
    <path d="M6 18h52v4H6z" fill="#fff" opacity=".2" />
    <rect x="50" y="24" width="5" height="18" rx="1" fill="#0a3580" />
    <rect x="8" y="20" width="10" height="4" rx="1" fill="#fff" opacity=".7" />
  </>),
  office: (<>
    <Shadow />
    <path d="M6 16h52v34H6z" fill={C.steelL} />
    <path d="M6 16h52v5H6z" fill={C.steel} />
    <rect x="12" y="27" width="12" height="10" rx="1" fill={C.lens} />
    <rect x="12" y="27" width="12" height="10" rx="1" fill="none" stroke={C.steelD} strokeWidth="1.5" />
    <rect x="38" y="25" width="11" height="25" rx="1" fill={C.steelD} />
    <circle cx="47" cy="38" r="1.2" fill="#fff" />
    <rect x="28" y="22" width="6" height="4" rx="1" fill={C.steelD} />
  </>),
  booth: (<>
    <Shadow />
    <path d="M14 20h36l3 6H11z" fill={C.orange} />
    <path d="M16 26h32v26H16z" fill={C.white} />
    <rect x="20" y="30" width="10" height="12" rx="1" fill={C.lens} />
    <rect x="34" y="30" width="10" height="22" rx="1" fill={C.steelD} />
    <circle cx="42" cy="42" r="1.1" fill="#fff" />
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

  /* ---- jobsite compliance consumables ---------------------------------- */

  // Class A kit: white wall box, red cross, carry handle.
  firstAidA: (<>
    <Shadow />
    <rect x="26" y="14" width="12" height="7" rx="2.5" fill={C.whiteD} />
    <rect x="12" y="19" width="40" height="32" rx="3" fill={C.white} />
    <rect x="12" y="19" width="40" height="5" rx="2.5" fill="#fff" opacity=".6" />
    <rect x="12" y="26" width="40" height="1.6" fill={C.whiteD} />
    <rect x="28.6" y="30" width="6.8" height="17" rx="1" fill={C.red} />
    <rect x="23.5" y="35.1" width="17" height="6.8" rx="1" fill={C.red} />
  </>),

  // Class B: steel two-door wall cabinet, bigger cross.
  firstAidB: (<>
    <Shadow />
    <rect x="14" y="11" width="36" height="41" rx="2" fill={C.steelL} />
    <rect x="14" y="11" width="36" height="4" fill="#fff" opacity=".5" />
    <path d="M32 11v41" stroke={C.steel} strokeWidth="2" />
    <circle cx="28" cy="32" r="1.4" fill={C.steelD} />
    <circle cx="36" cy="32" r="1.4" fill={C.steelD} />
    <rect x="28.8" y="17" width="6.4" height="9" rx="1" fill={C.red} />
    <rect x="25" y="19.8" width="14" height="3.4" rx="1" fill={C.red} />
  </>),

  // 10 lb ABC: red cylinder, black handle, hose down the side.
  extinguisher: (<>
    <Shadow />
    <rect x="25" y="7.5" width="13" height="4" rx="2" fill={C.ink} />
    <rect x="28" y="11.5" width="7" height="6" fill={C.steelD} />
    <path d="M28 13q-9 3 -8 17" stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <rect x="17" y="30" width="4" height="7" rx="2" fill={C.dark} />
    <rect x="24" y="17" width="16" height="35" rx="6" fill={C.red} />
    <rect x="26" y="17" width="4" height="35" rx="2" fill="#fff" opacity=".25" />
    <circle cx="34" cy="22" r="2.8" fill={C.white} />
    <rect x="28" y="30" width="10" height="14" rx="1.5" fill={C.white} />
    <rect x="30" y="33" width="6" height="2" fill={C.red} opacity=".8" />
  </>),

  // N95 cup with dual straps and nose clip.
  n95: (<>
    <Shadow />
    <path d="M12 26Q4 20 8 12" stroke={C.steelL} strokeWidth="2.2" fill="none" />
    <path d="M52 26q8-6 4-14" stroke={C.steelL} strokeWidth="2.2" fill="none" />
    <ellipse cx="32" cy="34" rx="19" ry="16" fill={C.white} />
    <path d="M13 34a19 16 0 0 0 19 16V18a19 16 0 0 0-19 16z" fill="#fff" opacity=".55" />
    <path d="M15 40q17 6 34 0" stroke={C.whiteD} strokeWidth="1.6" fill="none" />
    <rect x="24" y="19.5" width="16" height="3.6" rx="1.8" fill={C.galv} />
  </>),

  // Elastomeric half mask, two P100 cartridges.
  halfMask: (<>
    <Shadow />
    <path d="M20 22q12-9 24 0l5 15q-17 13-34 0z" fill={C.dark} />
    <path d="M22 24q10-7 20 0l2 6q-12 8-24 0z" fill={C.black} />
    <circle cx="13" cy="42" r="8" fill={C.red} />
    <circle cx="13" cy="42" r="4.5" fill={C.orangeD} opacity=".55" />
    <circle cx="51" cy="42" r="8" fill={C.red} />
    <circle cx="51" cy="42" r="4.5" fill={C.orangeD} opacity=".55" />
    <rect x="28" y="42" width="8" height="7" rx="2.5" fill={C.ink} />
  </>),

  // Pair of tapered foam plugs.
  earplugs: (<>
    <Shadow />
    <path d="M21 15q8-1 9 8l-2.5 25q-.8 5-5.5 5t-5.5-5L15 24q0-8 6-9z" fill={C.orange} />
    <path d="M21 15q3 0 5 2-4 3-4 10l1.5 21q0 3-2 5-4-.5-4.7-4.5L15 24q0-8 6-9z" fill="#fff" opacity=".28" />
    <path d="M42 17q8-1 9 8l-2.5 24q-.8 5-5.5 5T37.5 49L36 26q0-8 6-9z" fill={C.orange} />
    <path d="M42 17q3 0 5 2-4 3-4 10l1.5 20q0 3-2 5-4-.5-4.6-4.5L36 26q0-8 6-9z" fill="#fff" opacity=".28" />
  </>),

  // Over-the-head muffs, red cups.
  earmuffs: (<>
    <Shadow />
    <path d="M14 36a18 19 0 0 1 36 0" stroke={C.ink} strokeWidth="5" fill="none" />
    <rect x="8" y="30" width="13" height="20" rx="6" fill={C.red} />
    <rect x="10.5" y="33" width="8" height="14" rx="4" fill={C.blackD} />
    <rect x="43" y="30" width="13" height="20" rx="6" fill={C.red} />
    <rect x="45.5" y="33" width="8" height="14" rx="4" fill={C.blackD} />
  </>),

  // Inline GFCI brick on a cord.
  gfci: (<>
    <Shadow />
    <path d="M4 48q10 2 15-8" stroke={C.ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    <rect x="17" y="24" width="26" height="17" rx="4" fill={C.oshaY} />
    <rect x="17" y="24" width="26" height="5" rx="2.5" fill="#fff" opacity=".4" />
    <rect x="22" y="32" width="7" height="4.5" rx="1" fill={C.ink} />
    <rect x="31" y="32" width="7" height="4.5" rx="1" fill={C.red} />
    <rect x="43" y="27" width="10" height="11" rx="2" fill={C.ink} />
    <rect x="53" y="29.5" width="5" height="2" fill={C.galv} />
    <rect x="53" y="33.5" width="5" height="2" fill={C.galv} />
  </>),

  // Coiled 100 ft cord with plug.
  cordReel: (<>
    <Shadow />
    <ellipse cx="30" cy="36" rx="18" ry="15" fill="none" stroke={C.oshaY} strokeWidth="4.5" />
    <ellipse cx="33" cy="36" rx="18" ry="15" fill="none" stroke={C.oshaYD} strokeWidth="4.5" />
    <ellipse cx="36" cy="36" rx="18" ry="15" fill="none" stroke={C.oshaY} strokeWidth="4.5" />
    <path d="M50 26q4-6 2-12" stroke={C.oshaYD} strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <rect x="47" y="6" width="10" height="9" rx="2" fill={C.ink} />
    <rect x="49.5" y="2" width="2" height="4" fill={C.galv} />
    <rect x="53.5" y="2" width="2" height="4" fill={C.galv} />
  </>),

  // Light stringer: catenary cord, three guarded lamps.
  lightString: (<>
    <Shadow />
    <path d="M4 16q14 8 28 0t28 0" stroke={C.ink} strokeWidth="2.4" fill="none" />
    {[16, 32, 48].map((x, i) => (
      <g key={x}>
        <path d={`M${x} ${i === 1 ? 16 : 20}v7`} stroke={C.ink} strokeWidth="2" />
        <rect x={x - 3.5} y={i === 1 ? 23 : 27} width="7" height="4" rx="1.5" fill={C.steelD} />
        <circle cx={x} cy={i === 1 ? 32 : 36} r="5.5" fill={C.oshaY} />
        <circle cx={x - 1.8} cy={(i === 1 ? 32 : 36) - 1.8} r="1.8" fill="#fff" opacity=".7" />
      </g>
    ))}
  </>),

  /* ---- roofing accessories --------------------------------------------- */

  // Grey synthetic roll unrolling flat.
  underlayment: (<>
    <Shadow />
    <rect x="6" y="42" width="50" height="10" rx="1" fill={C.steelL} />
    <path d="M10 47h7M21 47h7M32 47h7" stroke={C.galvD} strokeWidth="1.8" />
    <circle cx="44" cy="32" r="12" fill={C.steel} />
    <circle cx="44" cy="32" r="12" fill="none" stroke={C.steelD} strokeWidth="1.5" />
    <path d="M44 20a12 12 0 0 0-12 12h5a7 7 0 0 1 7-7z" fill="#fff" opacity=".35" />
    <circle cx="44" cy="32" r="4" fill={C.dark} />
  </>),

  // Peel-and-stick: black membrane, release liner lifting.
  iceWater: (<>
    <Shadow />
    <rect x="8" y="38" width="48" height="11" rx="1" fill={C.black} />
    <rect x="8" y="38" width="48" height="3" fill="#fff" opacity=".14" />
    <path d="M40 38q10-12 18-13l-4 13z" fill={C.white} />
    <circle cx="22" cy="27" r="11" fill={C.black} />
    <path d="M22 16a11 11 0 0 0-11 11h4.5a6.5 6.5 0 0 1 6.5-6.5z" fill="#fff" opacity=".25" />
    <circle cx="22" cy="27" r="3.6" fill={C.whiteD} />
  </>),

  // L-profile with hemmed kick-out.
  dripEdge: (<>
    <Shadow />
    <path d="M14 17h36v5.5H21.5v24l8 5-2.6 4.2L16 49V22.5h-2z" fill={C.white} />
    <path d="M14 17h36v2H14z" fill="#fff" opacity=".6" />
    <path d="M16 22.5h5.5v24l-1.5-1V24h-4z" fill={C.whiteD} />
  </>),

  // Vent boot: base plate, cone, pipe stub.
  pipeBoot: (<>
    <Shadow />
    <rect x="28" y="12" width="8" height="18" fill={C.white} />
    <rect x="28" y="12" width="2.6" height="18" fill="#fff" opacity=".5" />
    <path d="M23 44l5-16h8l5 16z" fill={C.black} />
    <path d="M25.5 36h13M24.3 40h15.4" stroke={C.blackD} strokeWidth="1.6" />
    <path d="M8 44h48l-7 8H15z" fill={C.galv} />
    <path d="M8 44h48l-1.4 1.6H9.4z" fill="#fff" opacity=".35" />
  </>),

  // Wire coil of nails plus one loose nail.
  coilNails: (<>
    <Shadow />
    <circle cx="26" cy="34" r="17" fill={C.galv} />
    <circle cx="26" cy="34" r="13" fill="none" stroke={C.galvD} strokeWidth="1.6" />
    <circle cx="26" cy="34" r="9" fill="none" stroke={C.galvD} strokeWidth="1.6" />
    <circle cx="26" cy="34" r="5" fill="none" stroke={C.galvD} strokeWidth="1.6" />
    <circle cx="26" cy="34" r="2" fill={C.dark} />
    <path d="M26 17a17 17 0 0 0-17 17h4a13 13 0 0 1 13-13z" fill="#fff" opacity=".35" />
    <rect x="46" y="18" width="9" height="3" rx="1" fill={C.steel} />
    <rect x="49" y="21" width="3" height="22" fill={C.steelD} />
    <path d="M49 43h3l-1.5 6z" fill={C.steelD} />
  </>),

  /* ---- fasteners, adhesives, sealants ----------------------------------- */

  // Yellow contractor box, screw on the label.
  screwsExt: (<>
    <Shadow />
    <path d="M12 27l6-9h28l6 9z" fill={C.oshaY} />
    <rect x="12" y="27" width="40" height="24" rx="1" fill={C.oshaYD} />
    <rect x="18" y="32" width="28" height="13" rx="1" fill={C.white} />
    <path d="M22 36l16 5" stroke={C.steelD} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="41" cy="42" r="2.6" fill={C.steel} />
  </>),

  // Drywall screw box in marine blue.
  screwsDW: (<>
    <Shadow />
    <path d="M12 27l6-9h28l6 9z" fill={C.marine} />
    <path d="M12 27l6-9h28l6 9z" fill="#fff" opacity=".2" />
    <rect x="12" y="27" width="40" height="24" rx="1" fill={C.marine} />
    <rect x="18" y="32" width="28" height="13" rx="1" fill={C.white} />
    <path d="M22 41l16-4" stroke={C.blackD} strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="41" cy="36.6" r="2.6" fill={C.black} />
  </>),

  // Quart-size adhesive tube, nozzle up.
  adhesive: (<>
    <Shadow />
    <path d="M30.5 8h3l3 12h-9z" fill={C.oshaYD} />
    <rect x="25" y="19" width="14" height="4" rx="1.5" fill={C.steelD} />
    <rect x="21" y="23" width="22" height="29" rx="3" fill={C.tan} />
    <rect x="21" y="30" width="22" height="13" fill={C.white} />
    <path d="M25 34h14M25 38h9" stroke={C.ink} strokeWidth="1.6" opacity=".55" />
    <rect x="23" y="23" width="4" height="29" fill="#fff" opacity=".25" />
  </>),

  // 10 oz cartridge, grey polyurethane.
  sealantPU: (<>
    <Shadow />
    <path d="M31 8h2.4l2.6 13h-8z" fill={C.galv} />
    <rect x="25.5" y="21" width="13" height="4" rx="1.5" fill={C.steelD} />
    <rect x="24" y="25" width="16" height="27" rx="2.5" fill={C.steelL} />
    <rect x="24" y="31" width="16" height="10" fill={C.orange} />
    <rect x="26" y="25" width="3" height="27" fill="#fff" opacity=".35" />
    <rect x="24" y="48.5" width="16" height="3.5" rx="1.5" fill={C.steelD} />
  </>),

  // 10.1 oz cartridge, white silicone.
  sealantSil: (<>
    <Shadow />
    <path d="M31 8h2.4l2.6 13h-8z" fill={C.galv} />
    <rect x="25.5" y="21" width="13" height="4" rx="1.5" fill={C.steelD} />
    <rect x="24" y="25" width="16" height="27" rx="2.5" fill={C.white} />
    <rect x="24" y="31" width="16" height="10" fill={C.marine} />
    <rect x="26" y="25" width="3" height="27" fill="#fff" opacity=".45" />
    <rect x="24" y="48.5" width="16" height="3.5" rx="1.5" fill={C.whiteD} />
  </>),

  // Black butyl roll with a peeled tongue.
  flashTape: (<>
    <Shadow />
    <circle cx="28" cy="32" r="16" fill={C.black} />
    <path d="M28 16a16 16 0 0 0-16 16h6a10 10 0 0 1 10-10z" fill="#fff" opacity=".18" />
    <circle cx="28" cy="32" r="6.5" fill={C.whiteD} />
    <path d="M28 48h26l-2.6-8H40q-8 0-12 8z" fill={C.dark} />
    <path d="M51.4 40l2.6 8h-5z" fill="#fff" opacity=".25" />
  </>),

  /* ---- site protection & erosion ---------------------------------------- */

  // Yellow caution roll paying out a striped tongue.
  tapeCaution: (<>
    <Shadow />
    <circle cx="26" cy="32" r="16" fill={C.oshaY} />
    <path d="M26 16a16 16 0 0 0-16 16h6a10 10 0 0 1 10-10z" fill="#fff" opacity=".35" />
    <circle cx="26" cy="32" r="6.5" fill={C.white} />
    <rect x="26" y="43" width="32" height="9" fill={C.oshaY} />
    {[30, 40, 50].map(x => <path key={x} d={`M${x} 52l4.5-9h4l-4.5 9z`} fill={C.ink} />)}
  </>),

  // Red danger roll, white stripes.
  tapeDanger: (<>
    <Shadow />
    <circle cx="26" cy="32" r="16" fill={C.red} />
    <path d="M26 16a16 16 0 0 0-16 16h6a10 10 0 0 1 10-10z" fill="#fff" opacity=".25" />
    <circle cx="26" cy="32" r="6.5" fill={C.white} />
    <rect x="26" y="43" width="32" height="9" fill={C.red} />
    {[30, 40, 50].map(x => <path key={x} d={`M${x} 52l4.5-9h4l-4.5 9z`} fill={C.white} opacity=".85" />)}
  </>),

  // Inverted spray can painting a line on the ground.
  markPaint: (<>
    <Shadow />
    <rect x="25" y="12" width="14" height="30" rx="3" fill={C.white} />
    <rect x="25" y="20" width="14" height="11" fill={C.orange} />
    <rect x="27" y="12" width="3" height="30" fill="#fff" opacity=".5" />
    <rect x="27.5" y="42" width="9" height="7" rx="2" fill={C.orange} />
    <path d="M30 49l-3 4M32 49v5M34 49l3 4" stroke={C.orange} strokeWidth="1.4" />
    <path d="M18 56h28" stroke={C.orange} strokeWidth="3" strokeLinecap="round" />
  </>),

  // Translucent film roll over a draped sheet.
  polyRoll: (<>
    <Shadow />
    <path d="M10 52l8-24h28l8 24z" fill={C.lens} opacity=".85" />
    <path d="M10 52l8-24h9l-6 24z" fill="#fff" opacity=".4" />
    <path d="M24 28l-4 24M40 28l4 24" stroke={C.lensD} strokeWidth="1.3" opacity=".7" />
    <rect x="14" y="19" width="36" height="10" rx="5" fill={C.lensD} />
    <rect x="14" y="21" width="36" height="2.5" rx="1.25" fill="#fff" opacity=".5" />
    <circle cx="14" cy="24" r="5" fill={C.steelL} />
    <circle cx="14" cy="24" r="2" fill={C.dark} />
  </>),

  // Folded tarp, grommets on the hem.
  tarp: (<>
    <Shadow />
    <path d="M8 33l24-11 24 11-24 11z" fill={C.marine} />
    <path d="M8 33l24-11 24 11-24 5z" fill="#fff" opacity=".14" />
    <path d="M8 33v10l24 11V44z" fill="#0a3580" />
    <path d="M56 33v10L32 54V44z" fill={C.blackD} />
    {[16, 26, 38, 48].map(x => <circle key={x} cx={x} cy={x < 32 ? 41 + (32 - x) * 0.2 : 41 + (x - 32) * 0.2} r="1.5" fill={C.oshaY} />)}
  </>),

  // Tan fiberboard roll unrolling across the floor.
  ramBoard: (<>
    <Shadow />
    <rect x="6" y="44" width="52" height="8" rx="1" fill={C.tan} />
    <path d="M18 44v8M32 44v8" stroke={C.tanD} strokeWidth="1.4" opacity=".7" />
    <circle cx="46" cy="34" r="11" fill={C.tanD} />
    <path d="M46 23a11 11 0 0 0-11 11h4.5a6.5 6.5 0 0 1 6.5-6.5z" fill="#fff" opacity=".3" />
    <circle cx="46" cy="34" r="3.6" fill={C.dark} />
  </>),

  // Hand stretch-film roll, core handles top and bottom.
  stretchWrap: (<>
    <Shadow />
    <rect x="29" y="8" width="6" height="8" rx="1.5" fill={C.red} />
    <rect x="29" y="46" width="6" height="8" rx="1.5" fill={C.red} />
    <rect x="25" y="14" width="14" height="34" rx="4" fill={C.lensD} />
    <rect x="27.5" y="14" width="3.5" height="34" fill="#fff" opacity=".55" />
    <path d="M39 20q13 4 17 15" stroke={C.lens} strokeWidth="3" fill="none" opacity=".8" />
  </>),

  // Black fabric run between two stakes, toe buried.
  siltFence: (<>
    <Shadow />
    <rect x="11" y="16" width="4.5" height="36" rx="1" fill={C.tanD} />
    <rect x="48.5" y="16" width="4.5" height="36" rx="1" fill={C.tanD} />
    <path d="M15.5 22q16.5 5 33 0v20h-33z" fill={C.black} />
    <path d="M15.5 22q16.5 5 33 0v4q-16.5 5-33 0z" fill="#fff" opacity=".12" />
    <path d="M8 52h48v3H8z" fill={C.tan} />
  </>),

  // Orange HDPE mesh with punched slots.
  safetyFence: (<>
    <Shadow />
    <rect x="10" y="16" width="44" height="36" rx="2" fill={C.orange} />
    <rect x="10" y="16" width="44" height="3.5" fill="#fff" opacity=".3" />
    {[22, 30, 38, 44].map(y =>
      [15, 25, 35, 45].map(x =>
        <rect key={`${x}-${y}`} x={x} y={y} width="6" height={y === 44 ? 4 : 5} rx="2" fill={C.orangeD} />
      )
    )}
  </>),

  // Three filled bags, tied necks.
  sandbags: (<>
    <Shadow />
    <ellipse cx="22" cy="46" rx="13" ry="8.5" fill={C.tan} />
    <ellipse cx="43" cy="46" rx="13" ry="8.5" fill={C.tanD} />
    <ellipse cx="32" cy="33" rx="13" ry="8.5" fill={C.tan} />
    <path d="M22 25q17-4 20 5" stroke={C.tanD} strokeWidth="1.4" fill="none" opacity=".7" />
    <rect x="29.5" y="23" width="5" height="4" rx="1.5" fill={C.tanD} />
    <path d="M27 44h11M18 51h9M39 51h9" stroke={C.tanD} strokeWidth="1.3" opacity=".8" />
  </>),

  /* ---- decking & outdoor lumber --------------------------------------- */

  // Three gapped deck courses riding a joist below.
  deckBoards: (<>
    <Shadow />
    <rect x="26" y="32" width="12" height="18" rx="1" fill={C.tanD} />
    {[6, 24, 42].map(x => <rect key={x} x={x} y="20" width="16" height="10" rx="1.5" fill={C.tan} />)}
    {[6, 24, 42].map(x => <rect key={x} x={x} y="20" width="16" height="3" rx="1.5" fill="#fff" opacity=".3" />)}
  </>),

  // Galvanized face-mount joist hanger, seat and flanges.
  hanger: (<>
    <Shadow />
    <rect x="14" y="12" width="8" height="36" rx="1" fill={C.galv} />
    <rect x="42" y="12" width="8" height="36" rx="1" fill={C.galv} />
    <rect x="22" y="40" width="20" height="8" fill={C.galvD} />
    <rect x="22" y="16" width="20" height="26" fill={C.tan} />
    <rect x="22" y="16" width="20" height="4" fill="#fff" opacity=".3" />
    {[17, 45].map(x => [20, 30].map(y => <circle key={`${x}-${y}`} cx={x + 1} cy={y} r="1.4" fill={C.steelD} />))}
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
  [/SID-VD/, "sidingVinyl"], [/SID-AL/, "sidingAlum"], [/SID-JCH/, "jchannel"],
  [/OSB-/, "osb"], [/PLY-/, "plywood"], [/STD-/, "stud"],
  [/DW-/, "drywallSheet"], [/HW-/, "wrap"],
  [/CX-/, "conex"], [/ST-GLO/, "office"], [/ST-BOOTH/, "booth"],
  // roof screen parts
  [/RSF-/, "frame"], [/RSB-/, "base"], [/RSH-/, "hat"],
  [/RSP-/, "panel"], [/RSS-/, "screw"], [/RSA-/, "anchor"], [/RSE-/, "drawing"],
  // jobsite compliance consumables
  [/FA-CLB/, "firstAidB"], [/FA-/, "firstAidA"], [/FE-/, "extinguisher"],
  [/RS-P100/, "halfMask"], [/RS-N95/, "n95"],
  [/EP-/, "earplugs"], [/EM-/, "earmuffs"],
  [/EL-GFCI/, "gfci"], [/EL-123/, "cordReel"], [/EL-STR/, "lightString"],
  // roofing accessories
  [/RF-SYN/, "underlayment"], [/RF-IWS/, "iceWater"], [/RF-DE/, "dripEdge"],
  [/RF-BOOT/, "pipeBoot"], [/RF-CN/, "coilNails"],
  // fasteners, adhesives, sealants
  [/FS-EX/, "screwsExt"], [/FS-DW/, "screwsDW"], [/AD-/, "adhesive"],
  [/SL-PU/, "sealantPU"], [/SL-SIL/, "sealantSil"], [/FT-/, "flashTape"],
  // site protection & erosion
  [/BT-CAU/, "tapeCaution"], [/BT-DAN/, "tapeDanger"], [/MP-/, "markPaint"],
  [/PY-/, "polyRoll"], [/TP-/, "tarp"], [/FP-/, "ramBoard"], [/SW-/, "stretchWrap"],
  [/EC-SILT/, "siltFence"], [/EC-SF/, "safetyFence"], [/EC-SB/, "sandbags"],
  // decking & outdoor lumber
  [/PT-448|PT-668|PT-248|PT-BAL/, "stud"], [/HD-/, "hanger"], [/CN-80/, "sandbags"],
];

const BY_CAT: Record<string, string> = {
  roof: "guardrail", guard: "guardrail", head: "hatCap",
  eye: "glassesClear", hand: "gloveA4", hivis: "vestC2", fall: "harness",
  siding: "sidingVinyl", sheathing: "osb", drywall: "drywallSheet", structures: "conex",
  jobsite: "firstAidA", roofing: "underlayment", site: "safetyFence",
  decking: "deckBoards",
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
