/* Misty Valley Supply — prototype catalog and operating data.
   Prices are placeholders for layout. Standards and OSHA cites are real. */

export type Fulfil = "dropship" | "stock" | "fabricate";

export type Product = {
  sku: string;
  name: string;
  cat: string;
  price: number;
  uom: string;
  std: string;          // the consensus standard the product is built to
  osha: string;         // the rule that requires it on a jobsite
  note: string;
  why: string;         // plain-English: what the OSHA rule actually requires
  fulfil: Fulfil;
  supplier: string;
  lead: string;
  moq?: number;
  hot?: boolean;
};

export const CATEGORIES = [
  { id: "roof", name: "Roof Safety", blurb: "Guardrail, warning line, anchors, skylight screens" },
  { id: "guard", name: "Guardrail Systems", blurb: "Non-penetrating OSHA-compliant edge protection" },
  { id: "head", name: "Head Protection", blurb: "Type I and Type II, Class E and G" },
  { id: "eye", name: "Eye Protection", blurb: "Z87.1 impact-rated, clear through shade 5" },
  { id: "hand", name: "Hand Protection", blurb: "Cut levels A1 through A9" },
  { id: "hivis", name: "Hi-Vis Apparel", blurb: "Class 2 and Class 3, Type R and Type O" },
  { id: "fall", name: "Fall Protection", blurb: "Harnesses, lanyards, self-retracting devices" },
];

export const PRODUCTS: Product[] = [
  // ---- roof safety -------------------------------------------------------
  {
    sku: "MVS-RG-1000", name: "Non-Penetrating Roof Guardrail — 10 ft Section", cat: "roof",
    price: 289, uom: "section", std: "OSHA 1926.502(b)", osha: "1926.501(b)(10)",
    note: "Top rail 42 in ±3 in, withstands 200 lb applied outward or downward. No roof penetration — counterweighted base.",
    why: "OSHA 1926.501(b)(10) lets a crew on a low-slope roof use a guardrail system instead of tying everyone off. 1926.502(b) sets the numbers this section is built to: a top rail 42 in above the deck, plus or minus 3 in, that withstands 200 lb applied outward or downward, and a midrail at 21 in that withstands 150 lb.",
    fulfil: "dropship", supplier: "Midwest Safety Group", lead: "3–5 days", hot: true,
  },
  {
    sku: "MVS-RG-BASE", name: "Guardrail Counterweight Base — 90 lb", cat: "roof",
    price: 148, uom: "each", std: "OSHA 1926.502(b)", osha: "1926.501(b)(10)",
    note: "Rubber-footed cast base. Spacing per manufacturer's engineered layout — do not eyeball it.",
    why: "The counterweight base is what makes a non-penetrating rail hold its rating. Under 1926.502(b) the top rail must take a 200 lb outward or downward force without deflecting below 39 in, and that only holds when the bases sit at the spacing in the manufacturer's engineered layout — follow the layout, not your eye.",
    fulfil: "dropship", supplier: "Midwest Safety Group", lead: "3–5 days",
  },
  {
    sku: "MVS-WL-600", name: "Warning Line System — 600 ft Kit", cat: "roof",
    price: 1240, uom: "kit", std: "OSHA 1926.502(f)", osha: "1926.501(b)(10)",
    note: "Stanchions plus line. Erected not less than 6 ft from edge, flagged at 6 ft intervals, 34–39 in high.",
    why: "On a low-slope roof, 1926.501(b)(10) allows a warning line used with a safety monitor in place of rail or harnesses. 1926.502(f) writes the line's spec: rigged 34 to 39 in high, flagged at intervals of not more than 6 ft, resisting 16 lb of tipping force, minimum 500 lb tensile strength, and set back at least 6 ft from the edge.",
    fulfil: "dropship", supplier: "Midwest Safety Group", lead: "5–7 days",
  },
  {
    sku: "MVS-SKY-48", name: "Skylight Screen — 4 ft × 8 ft", cat: "roof",
    price: 412, uom: "each", std: "OSHA 1926.502(i)", osha: "1926.501(b)(4)",
    note: "Covers capable of supporting twice the maximum intended load. Marked HOLE or COVER.",
    why: "OSHA treats an unguarded skylight as a hole in the roof. 1926.501(b)(4) requires protection from falling through any hole more than 6 ft above a lower level, and 1926.502(i) requires the cover to support at least twice the weight of the workers, equipment and material that could ever be on it, to be secured against displacement, and to be marked or color-coded so nobody pulls it.",
    fulfil: "fabricate", supplier: "Misty Valley shop", lead: "7–10 days",
  },
  {
    sku: "MVS-ANC-DL", name: "Reusable Roof Anchor — Standing Seam Clamp", cat: "roof",
    price: 386, uom: "each", std: "ANSI/ASSP Z359.18 Type A", osha: "1926.502(d)(15)",
    note: "5,000 lb anchorage per attached worker, or engineered to 2:1 with a qualified person.",
    why: "1926.502(d)(15) requires a fall-arrest anchorage to hold 5,000 lb for each worker attached — or to be designed with a safety factor of two under the supervision of a qualified person. A pipe stub or a screen post is not an anchorage; this clamp is rated, tested and documented as one, to ANSI/ASSP Z359.18.",
    fulfil: "dropship", supplier: "Ridgeline Fall Protection", lead: "4–6 days",
  },

  // ---- guardrail ---------------------------------------------------------
  {
    sku: "MVS-YG-10", name: "Yellow Steel Guardrail — 10 ft Rail", cat: "guard",
    price: 172, uom: "each", std: "OSHA 1926.502(b)", osha: "1926.501(b)(1)",
    note: "Powder-coated safety yellow. Top rail 42 in, mid rail at 21 in, toe board where material can fall.",
    why: "1926.501(b)(1) requires fall protection at every unprotected side or edge 6 ft or more above a lower level, and guardrail is the option that protects everyone without gearing anyone up. 1926.502(b) sets the build: top rail at 42 in plus or minus 3 in withstanding 200 lb, midrail at 21 in withstanding 150 lb.",
    fulfil: "dropship", supplier: "Ohio Valley Rail Products", lead: "5–8 days", hot: true,
  },
  {
    sku: "MVS-YG-POST", name: "Guardrail Post — Bolt-Down, Yellow", cat: "guard",
    price: 96, uom: "each", std: "OSHA 1926.502(b)", osha: "1926.501(b)(1)",
    note: "Baseplate with four anchors. Deflection under 200 lb must not bring top rail below 39 in.",
    why: "The post carries the whole guardrail load path. Under 1926.502(b) the top rail must take 200 lb outward or downward without deflecting below 39 in, which is a post-and-anchor problem, not a rail problem. This bolt-down baseplate with four anchors is how the system passes that test on concrete or steel.",
    fulfil: "dropship", supplier: "Ohio Valley Rail Products", lead: "5–8 days",
  },
  {
    sku: "MVS-YG-TOE", name: "Toe Board — 4 in × 10 ft, Yellow", cat: "guard",
    price: 64, uom: "each", std: "OSHA 1926.502(j)", osha: "1926.501(b)(1)",
    note: "Minimum 3½ in vertical, withstands 50 lb. Required wherever people work or pass below.",
    why: "Where people work or pass below an edge, the hazard is falling material, not falling workers. 1926.502(j) requires a toeboard at least 3 1/2 in tall, able to withstand 50 lb of downward or outward force, with not more than 1/4 in of clearance above the walking surface.",
    fulfil: "dropship", supplier: "Ohio Valley Rail Products", lead: "5–8 days",
  },
  {
    sku: "MVS-HOLE-4", name: "Floor Hole Cover — 4 ft × 4 ft, Marked", cat: "guard",
    price: 128, uom: "each", std: "OSHA 1926.502(i)", osha: "1926.501(b)(4)",
    note: "Secured against displacement. Pre-marked HOLE. Twice the maximum intended load.",
    why: "1926.501(b)(4) requires every walking-surface hole more than 6 ft above a lower level to be covered or guarded. 1926.502(i) sets the cover's spec: support at least twice the maximum intended load, secured so it cannot slide, and marked HOLE or COVER so nobody lifts it without knowing what is under it.",
    fulfil: "fabricate", supplier: "Misty Valley shop", lead: "5–7 days",
  },

  // ---- head --------------------------------------------------------------
  {
    sku: "MVS-HH-C1", name: "Hard Hat — Cap Style, Type I Class E", cat: "head",
    price: 19.5, uom: "each", std: "ANSI/ISEA Z89.1 Type I Class E", osha: "1926.100(a)",
    note: "Type I protects the crown only. Class E tested to 20,000 V. Four-point ratchet.",
    why: "1926.100(a) requires a protective helmet wherever there is a possible danger of head injury from impact, from falling or flying objects, or from electrical shock and burns. Type I is tested for crown impact only; Class E is dielectric-tested to 20,000 volts, per the ANSI Z89.1 standard OSHA incorporates at 1926.100(b).",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12, hot: true,
  },
  {
    sku: "MVS-HH-T2V", name: "Safety Helmet — Type II Class E, Vented", cat: "head",
    price: 89, uom: "each", std: "ANSI/ISEA Z89.1 Type II Class E", osha: "1926.100(a)",
    note: "Type II adds lateral impact protection. Chin strap, accessory rails. Vented models are Class C unless stated — read the shell mark.",
    why: "1926.100(a) is the trigger: possible head injury from impact, falling or flying objects, or electrical shock means a helmet, full stop. Type II adds tested lateral-impact protection to the Type I crown test under ANSI Z89.1. Read the shell mark before electrical work — vented shells are typically Class C, with no voltage rating at all.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", hot: true,
  },
  {
    sku: "MVS-HH-BRIM", name: "Hard Hat — Full Brim, Type I Class G", cat: "head",
    price: 27, uom: "each", std: "ANSI/ISEA Z89.1 Type I Class G", osha: "1926.100(a)",
    note: "Class G tested to 2,200 V. Full brim sheds water and sun — the roofer's default.",
    why: "Same rule as every hard hat on site: 1926.100(a) requires head protection where impact, falling objects or electrical shock are possible, built to the ANSI Z89.1 standard named in 1926.100(b). Class G is proof-tested at 2,200 volts — general trades work, not line work near high voltage; that is Class E.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12,
  },

  // ---- eye ---------------------------------------------------------------
  {
    sku: "MVS-SG-CLR", name: "Safety Glasses — Clear, Anti-Fog", cat: "eye",
    price: 6.4, uom: "each", std: "ANSI/ISEA Z87.1 Z87+", osha: "1926.102(b)(1)",
    note: "The + means high impact: 6.35 mm steel ball at 150 ft/s, plus a 500 g pointed drop from 50 in. No mark, no protection.",
    why: "1926.102(a)(1) requires eye and face protection whenever the work can injure an eye — flying particles, dust, chips, splash. OSHA accepts protectors built to the ANSI/ISEA Z87.1 standard it lists at 1926.102(b)(1). The Z87+ mark means high-impact tested, including a 6.35 mm steel ball fired at 150 ft/s. An unmarked lens is not protection.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12, hot: true,
  },
  {
    sku: "MVS-SG-SMK", name: "Safety Glasses — Smoke, Z87+", cat: "eye",
    price: 6.9, uom: "each", std: "ANSI/ISEA Z87.1 Z87+", osha: "1926.102(b)(1)",
    note: "Outdoor tint. Frame and lens both carry the mark — check both, that is where counterfeits fail.",
    why: "The rule is 1926.102(a)(1): eye protection wherever the operation can injure an eye, built to the ANSI/ISEA Z87.1 standard OSHA lists at 1926.102(b)(1). The smoke tint handles outdoor glare; the Z87+ mark on both frame and lens is what makes the pair compliant — counterfeits usually miss one of the two.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12,
  },
  {
    sku: "MVS-GG-SEAL", name: "Sealed Safety Goggle — Indirect Vent", cat: "eye",
    price: 14.75, uom: "each", std: "ANSI/ISEA Z87.1 Z87+ D3", osha: "1926.102(a)(1)",
    note: "D3 splash rating. Required where grinding, cutting or chemical splash is present.",
    why: "1926.102(a)(1) requires eye and face protection matched to the hazard, and for chemical splash or heavy grinding dust a spectacle is not a match — the rule effectively demands a sealed goggle. The D3 mark under ANSI/ISEA Z87.1 means the goggle passed the droplet and splash test.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days",
  },

  // ---- hand --------------------------------------------------------------
  {
    sku: "MVS-GL-A4", name: "Cut-Resistant Glove — Level A4, PU Palm", cat: "hand",
    price: 8.2, uom: "pair", std: "ANSI/ISEA 105 Cut Level A4", osha: "1926.95(a)",
    note: "A4 is 1,500–2,199 g of cut resistance. The right default for sheet metal and stud handling.",
    why: "Construction has no numbered glove rule; 1926.95(a) is the requirement — protective equipment wherever hazards of the work or environment are capable of causing injury. ANSI/ISEA 105 grades cut resistance A1 through A9. A4 means the test blade needs 1,500 to 2,199 g of load to cut through: the working default for sheet metal and stud.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12, hot: true,
  },
  {
    sku: "MVS-GL-A6", name: "Cut-Resistant Glove — Level A6, Nitrile", cat: "hand",
    price: 13.4, uom: "pair", std: "ANSI/ISEA 105 Cut Level A6", osha: "1926.95(a)",
    note: "A6 is 3,000–3,999 g. Glass handling, heavy gauge steel, demo.",
    why: "1926.95(a) requires hand protection wherever the task presents a hazard capable of causing injury, and a cut hazard is exactly that. On the ANSI/ISEA 105 scale, A6 means 3,000 to 3,999 g of cut load — the tier for glass, heavy-gauge steel edges and demolition, where an A4 palm gives up.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12,
  },
  {
    sku: "MVS-GL-LEA", name: "Leather Driver Glove — Grain Cowhide", cat: "hand",
    price: 5.6, uom: "pair", std: "No cut rating claimed", osha: "1926.95(a)",
    note: "General handling only. If the task has a cut hazard, this is not the glove — and we will tell you so.",
    why: "1926.95(a) requires protective equipment matched to the hazard, and this glove claims no cut rating at all — it is for general handling, abrasion and splinters. If the task can slice, an unrated leather driver does not satisfy the rule; move up to an ANSI/ISEA 105 rated cut glove.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12,
  },

  // ---- hi-vis ------------------------------------------------------------
  {
    sku: "MVS-VS-C2", name: "Hi-Vis Vest — Class 2, Type R", cat: "hivis",
    price: 11.9, uom: "each", std: "ANSI/ISEA 107 Type R Class 2", osha: "1926.201(a)",
    note: "Class 2 for traffic under 50 mph and complex backgrounds. Type R = roadway.",
    why: "1926.201(a) requires flagger signaling to conform to the MUTCD, and the MUTCD puts flaggers in high-visibility apparel meeting ANSI/ISEA 107 Class 2 at minimum. Class 2, Type R is the standard roadway work-zone garment; where traffic is fast or light is poor, the step up is Class 3.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12, hot: true,
  },
  {
    sku: "MVS-VS-C3", name: "Hi-Vis Long-Sleeve — Class 3, Type R", cat: "hivis",
    price: 34.5, uom: "each", std: "ANSI/ISEA 107 Type R Class 3", osha: "1926.201(a)",
    note: "Class 3 required over 50 mph, poor visibility, or where the worker must be seen through a full range of motion.",
    why: "1926.201(a) points flagger operations at the MUTCD, which calls for stepping up from Class 2 as risk rises — night work, poor weather, high-speed traffic. Under ANSI/ISEA 107, Class 3 adds sleeves and more reflective area so the wearer reads as a person, in motion, from a full 1,280 ft.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days",
  },
  {
    sku: "MVS-VS-O1", name: "Hi-Vis Vest — Class 1, Type O", cat: "hivis",
    price: 9.4, uom: "each", std: "ANSI/ISEA 107 Type O Class 1", osha: "1926.95(a)",
    note: "Type O is off-road only. Not legal on a public right of way — a common and expensive mix-up.",
    why: "1926.95(a) is the general PPE rule this vest answers: a visible worker where equipment moves off the public way. Type O under ANSI/ISEA 107 is off-road only — it does not meet the Class 2 roadway garment the MUTCD flagger rules call for, which is the expensive mix-up this label exists to prevent.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 24,
  },

  // ---- fall --------------------------------------------------------------
  {
    sku: "MVS-FH-5PT", name: "Full Body Harness — 5-Point, Universal", cat: "fall",
    price: 118, uom: "each", std: "ANSI/ASSP Z359.11", osha: "1926.502(d)",
    note: "Arrest force limited to 1,800 lb, free fall limited to 6 ft, deceleration distance 3.5 ft.",
    why: "1926.502(d) writes the personal fall arrest spec: a full body harness — body belts have been banned for arrest since 1998 — limiting the arresting force on the worker to 1,800 lb, with free fall limited to 6 ft and deceleration distance to 3.5 ft. ANSI/ASSP Z359.11 is the consensus standard the harness itself is built and tested to.",
    fulfil: "dropship", supplier: "Ridgeline Fall Protection", lead: "4–6 days", hot: true,
  },
  {
    sku: "MVS-SRL-11", name: "Self-Retracting Lifeline — 11 ft, Class 2", cat: "fall",
    price: 268, uom: "each", std: "ANSI/ASSP Z359.14 Class 2", osha: "1926.502(d)(16)",
    note: "Class 2 permits up to 24 in arrest distance. Check clearance below before you spec any SRL.",
    why: "1926.502(d)(16) requires the system to limit arresting force to 1,800 lb with a harness, to limit free fall, and to stop the worker before any contact with a lower level. An SRL arrests in inches instead of feet, which is why it wins on low roofs — but verify the manufacturer's clearance chart below the anchor before you spec it.",
    fulfil: "dropship", supplier: "Ridgeline Fall Protection", lead: "4–6 days",
  },
  {
    sku: "MVS-LY-SA6", name: "Shock-Absorbing Lanyard — 6 ft, Double Leg", cat: "fall",
    price: 142, uom: "each", std: "ANSI/ASSP Z359.13", osha: "1926.502(d)(16)",
    note: "Needs 18.5 ft of clearance below the anchor. On a low roof this is the wrong product — use an SRL.",
    why: "1926.502(d)(16) limits arresting force to 1,800 lb, free fall to 6 ft, and requires the rig to stop the worker before contact with a lower level. A 6 ft shock-absorbing lanyard needs roughly 18.5 ft of clearance below the anchor to honor that — on a low roof it cannot, and the right answer is an SRL.",
    fulfil: "dropship", supplier: "Ridgeline Fall Protection", lead: "4–6 days",
  },
];

// ---- the fabricated hero -------------------------------------------------

export const ROOFSCREEN = {
  title: "Shop-Fabricated Roof Screen",
  proof: "Lee Street",

  /* The real Lee Street job. Misty Valley had the frame shop-fabricated for
     $6,000 and bought roughly $1,000 of panel. It sold to R&B Roofing for
     $12,000. Those three numbers are the whole business case and every rate
     below is derived from them, not guessed. */
  lee: {
    frameCost: 6000,
    panelCost: 1000,
    sell: 12000,
    height: 3.5,        // 3'-6" screen per detail 6/A160
    bay: 5,             // 5'-0" post spacing
    lf: 156,            // implied by the frame cost at the rate below
  },

  /* Basis of design named on the drawings. We fabricate an EQUAL. We do not
     sell, relabel or represent ourselves as the named manufacturer. */
  bod: {
    frame: "RoofScreen SC3",
    frameNote: "3-member cantilevered galvanized round tube, stainless connectors, square base supports",
    panel: "RoofScreen 7.2 Rib",
    panelNote: "7.2 in module, 1-1/2 in deep rib",
    detail: "Detail 6/A160 — RTU screen, 3'-6\" above deck, hat channel behind panel",
  },

  bullets: [
    "Whole frame shop-fabricated flat to the project basis of design",
    "Delivered in labeled sections and set in one pick",
    "Buy the kit, or buy frame, panel, hat channel and fasteners separately",
    "Shop drawings and sealed calculations quoted as their own line",
  ],

  heights: [3.5, 4, 6, 8, 10, 12],

  /* Frame fabrication cost per LF. Anchored on Lee Street: 14 + 7h gives
     $38.50/LF at 3'-6", and 156 LF x $38.50 = $6,006. */
  frameCostLf: (h: number) => 14 + 7 * h,

  mounts: [
    { id: "base",  name: "Square base support",        note: "Bolted post base on the deck or curb — what Lee Street used", adder: 0 },
    { id: "sleeper", name: "Sleeper / rail",           note: "Spreads load across the deck", adder: 8 },
    { id: "ballast", name: "Non-penetrating ballast",  note: "No penetration; needs an uplift calc and a lot of weight", adder: 14 },
  ],

  /* Panel cost per square foot of screen face. */
  panels: [
    { id: "p26", name: "26 ga rib panel", ga: 26, thick: 0.0187, costSf: 1.85,
      note: "Commercial standard. What a 7.2 Rib basis of design expects.", spec: true },
    { id: "p29", name: "29 ga rib panel", ga: 29, thick: 0.0142, costSf: 1.35,
      note: "Agricultural grade. Cheaper, thinner, dents. Not for a specified screen.", spec: false },
    { id: "perf", name: "Perforated panel", ga: 22, thick: 0.0299, costSf: 4.60,
      note: "Where the architect wants air through the screen.", spec: true },
    { id: "none", name: "Frame only", ga: 0, thick: 0, costSf: 0,
      note: "You are supplying or reusing the panel.", spec: true },
  ],

  /* Everything that is not frame or panel, per LF of screen unless noted. */
  hardware: {
    hatChannelLf: 1.95,      // per LF of hat channel run
    hatRows: (h: number) => Math.max(2, Math.ceil(h / 2)),
    baseEach: 46,            // square base support, one per post
    screwsPerLf: 0.62,       // panel screws with bonded washer
  },

  /* Engineering, priced as its own line because it is its own liability. */
  shopDrawings: { base: 850, perLf: 3.25,
    note: "Shop drawings plus calculations sealed by an engineer licensed in the project state." },

  /* Realized markup on Lee Street: $12,000 on $7,000 of cost. */
  defaultMarkup: 0.714,
};

/* Roof screen parts, sold as a kit or by the piece. Prices are unit SELL at the
   Lee Street markup; the configurator recomputes them if you move the markup. */
export type ScreenPart = {
  sku: string; name: string; uom: string; cost: number; kit: boolean; note: string;
};

export const SCREEN_PARTS: ScreenPart[] = [
  { sku: "MVS-RSF-SC3", name: "Screen frame, 3-member galvanized tube (SC3 equal)", uom: "LF", cost: 38.50, kit: true,
    note: "Round galvanized tube posts, rails and kickers with stainless connectors. Cut and labeled." },
  { sku: "MVS-RSB-SQ",  name: "Square base support, adjustable for roof slope", uom: "EA", cost: 46.00, kit: true,
    note: "One per post. Bolted through the deck with a flashed, watertight connection." },
  { sku: "MVS-RSH-HAT", name: "Hat channel, 20 ga galvanized", uom: "LF", cost: 1.95, kit: true,
    note: "Horizontal runs behind the panel. Sets the panel plane and the screw pattern." },
  { sku: "MVS-RSP-26",  name: "Rib panel, 26 ga, 7.2 in module, 1-1/2 in rib", uom: "SF", cost: 1.85, kit: true,
    note: "Commercial gauge. Kynar or SMP finish, standard colors." },
  { sku: "MVS-RSP-29",  name: "Rib panel, 29 ga, 7.2 in module", uom: "SF", cost: 1.35, kit: false,
    note: "Budget gauge. Read the gauge warning before you spec this on a commercial roof." },
  { sku: "MVS-RSS-STC", name: "Panel screw, #12 self-drill, bonded washer, painted head", uom: "EA", cost: 0.62, kit: true,
    note: "Color matched to the panel. Ordered by panel SF, not guessed." },
  { sku: "MVS-RSA-ANC", name: "Certified roof anchor, 5,000 lb, ANSI/ASSP Z359.18 Type D", uom: "EA", cost: 268.00, kit: false,
    note: "Separate rated anchor on the same deck attachment pattern. A screen base is NOT a fall-arrest anchor." },
  { sku: "MVS-RSE-SHP", name: "Shop drawings and sealed calculations", uom: "LOT", cost: 850.00, kit: false,
    note: "Per project. Required for a substitution against a named basis of design." },
];

// ---- classifieds ---------------------------------------------------------

export type Listing = {
  id: string; kind: string; title: string; price: string;
  where: string; when: string; who: string; body: string;
};

export const LISTINGS: Listing[] = [
  { id: "L-2291", kind: "Equipment", title: "2019 Genie GS-1930 Scissor Lift — 1,140 hrs", price: "$8,900",
    where: "Elizabethtown, KY", when: "2h ago", who: "Hardin Interiors LLC",
    body: "Runs and charges. Deck extension works. Selling because we bought a 2632. Can load." },
  { id: "L-2288", kind: "Surplus", title: "≈4,200 LF 3-5/8 in 20ga stud, 10 ft — overrun", price: "$0.42/LF",
    where: "Bowling Green, KY", when: "5h ago", who: "Barren River Drywall",
    body: "Job got value-engineered. Mill certs in hand, banded and dry. Take all or nothing." },
  { id: "L-2284", kind: "Crews", title: "Metal stud crew available — 6 men, start Oct 6", price: "Negotiable",
    where: "Louisville / I-65 corridor", when: "8h ago", who: "E. Vargas",
    body: "Framing and drywall. Own tools and transport. Ten years commercial. References on request." },
  { id: "L-2280", kind: "Trucks", title: "2016 F-350 flatbed, gooseneck, 214k mi", price: "$21,500",
    where: "Bardstown, KY", when: "1d ago", who: "Nelson Co. Mechanical",
    body: "6.7 diesel. New injectors at 190k. Records. Trailer sold separately." },
  { id: "L-2277", kind: "Wanted", title: "Wanted: 20 ft roof screen sections, any condition", price: "Paying cash",
    where: "Nashville, TN", when: "1d ago", who: "Cumberland Sheet Metal",
    body: "Temporary screening for a re-roof. Do not need pretty, need this week." },
  { id: "L-2271", kind: "Surplus", title: "Guardrail — 32 sections + 40 bases, used one job", price: "$4,600 all",
    where: "Shepherdsville, KY", when: "2d ago", who: "Salt River Roofing",
    body: "Yellow, non-penetrating. Bought new in March, one job. Cheaper than renting for a season." },
  { id: "L-2268", kind: "Tools", title: "Hilti DX 5 powder actuated, case + 2,000 pins", price: "$1,150",
    where: "Glasgow, KY", when: "2d ago", who: "J. Meredith",
    body: "Serviced last year. Selling the whole kit." },
  { id: "L-2262", kind: "Crews", title: "Looking for: roofing laborers, 3 weeks, per diem", price: "$26/hr",
    where: "Clarksville, IN", when: "3d ago", who: "TRH GC — subcontract",
    body: "Tear-off and load. Must have own Z87 and Class 2. Start Monday." },
];


// ---- rentals -------------------------------------------------------------
// Day / week / 4-week, the trade convention (verified: week is 2-2.5x day,
// 4-week is 1.5-2.5x week across Art's Rental's published catalog). Steel only
// in phase one: harnesses and SRLs rent only after the per-asset inspection
// ledger exists, because a renter must be able to prove a returned unit never
// arrested a fall. Reserve-request flow, never online payment.

export type Rental = {
  sku: string; name: string; uom: string;
  day: number; week: number; month: number;   // month = 4-week
  minQty?: number; deposit: number;
  note: string; inspect?: boolean;
};

export const RENTALS: Rental[] = [
  { sku: "MVS-RG-1000", name: "Non-Penetrating Guardrail — 10 ft Section", uom: "section",
    day: 16, week: 40, month: 100, minQty: 10, deposit: 60,
    note: "Base included per section — $4.00/LF-week, mid-range of the published corridor benchmarks." },
  { sku: "MVS-RG-BASE", name: "Extra Counterweight Base — 90 lb", uom: "each",
    day: 4, week: 10, month: 25, deposit: 25,
    note: "For corners and gates beyond the one-per-section allowance." },
  { sku: "MVS-WL-600", name: "Warning Line System — 600 ft Kit", uom: "kit",
    day: 45, week: 110, month: 275, deposit: 150,
    note: "Stanchions, flagged line and end anchors, ready to set." },
  { sku: "MVS-SKY-48", name: "Skylight Screen — 4 ft × 8 ft", uom: "each",
    day: 15, week: 40, month: 100, deposit: 60,
    note: "For the re-roof that only needs them for a month." },
  { sku: "MVS-HOLE-4", name: "Hole Cover Set — 4 covers", uom: "set",
    day: 24, week: 60, month: 150, deposit: 40,
    note: "Marked and load-rated. Count them back on the truck." },
];

// ---- seller payout accounts ----------------------------------------------
// A listing can only take a protected payment when we have a signed seller
// agreement and a Stripe connected account to pay. See src/payments.ts.

export type SellerAccount = {
  acct: string; agreement: boolean; onboarded: boolean; payouts: boolean;
  since: string; deals: number;
};

export const SELLERS: Record<string, SellerAccount> = {
  "Hardin Interiors LLC":   { acct: "acct_1QyHrd", agreement: true,  onboarded: true,  payouts: true,  since: "Mar 2025", deals: 7 },
  "Barren River Drywall":   { acct: "acct_1QyBrd", agreement: true,  onboarded: true,  payouts: true,  since: "Jan 2025", deals: 12 },
  "E. Vargas":              { acct: "acct_1QyVrg", agreement: true,  onboarded: false, payouts: false, since: "Aug 2025", deals: 0 },
  "Nelson Co. Mechanical":  { acct: "acct_1QyNco", agreement: true,  onboarded: true,  payouts: true,  since: "Feb 2025", deals: 4 },
  "Cumberland Sheet Metal": { acct: "acct_1QyCsm", agreement: true,  onboarded: true,  payouts: true,  since: "Apr 2025", deals: 3 },
  "Salt River Roofing":     { acct: "acct_1QySrr", agreement: true,  onboarded: true,  payouts: true,  since: "May 2025", deals: 6 },
  "J. Meredith":            { acct: "acct_1QyJmr", agreement: false, onboarded: false, payouts: false, since: "Sep 2025", deals: 0 },
  "TRH GC — subcontract":   { acct: "acct_1QyTrh", agreement: true,  onboarded: true,  payouts: false, since: "Jul 2025", deals: 1 },
};

export const LISTING_KINDS = ["All", "Equipment", "Surplus", "Crews", "Trucks", "Tools", "Wanted"];

// ---- back office ---------------------------------------------------------

export type Order = {
  id: string; customer: string; job: string; placed: string;
  total: number; cost: number; status: string; route: string; lines: number;
};

export const ORDERS: Order[] = [
  { id: "SO-1042", customer: "Salt River Roofing", job: "Lee Street", placed: "Sep 4", total: 8420, cost: 6180, status: "Awaiting PO", route: "Dropship ×2", lines: 7 },
  { id: "SO-1041", customer: "Cumberland Sheet Metal", job: "TRH Clarksville", placed: "Sep 4", total: 2140, cost: 1590, status: "PO sent", route: "Dropship", lines: 4 },
  { id: "SO-1040", customer: "Barren River Drywall", job: "Warehouse fit-out", placed: "Sep 3", total: 615, cost: 448, status: "Shipped", route: "Dropship", lines: 3 },
  { id: "SO-1039", customer: "Hardin Interiors", job: "Medical office", placed: "Sep 3", total: 12800, cost: 8900, status: "In fabrication", route: "Shop", lines: 2 },
  { id: "SO-1038", customer: "Nelson Co. Mechanical", job: "Distillery rack", placed: "Sep 2", total: 1980, cost: 1445, status: "Delivered", route: "Dropship", lines: 6 },
  { id: "SO-1037", customer: "E. Vargas Framing", job: "Hotel — Bowling Green", placed: "Sep 2", total: 3260, cost: 2390, status: "Delivered", route: "Dropship ×2", lines: 9 },
  { id: "SO-1036", customer: "Salt River Roofing", job: "Lee Street", placed: "Aug 29", total: 6000, cost: 3720, status: "Invoiced", route: "Shop", lines: 1 },
];

export const SUPPLIERS = [
  { name: "Bluegrass PPE Distributors", terms: "Net 30", ships: "Same day to 2 days", cut: "3:00 PM ET", lines: 14, mode: "Dropship" },
  { name: "Midwest Safety Group", terms: "Net 30", ships: "3 to 5 days", cut: "12:00 PM CT", lines: 3, mode: "Dropship" },
  { name: "Ohio Valley Rail Products", terms: "Prepay until reviewed", cutNote: true, ships: "5 to 8 days", cut: "10:00 AM ET", lines: 3, mode: "Dropship" },
  { name: "Ridgeline Fall Protection", terms: "Net 15", ships: "4 to 6 days", cut: "2:00 PM ET", lines: 4, mode: "Dropship" },
  { name: "Misty Valley shop", terms: "Internal", ships: "5 to 10 days", cut: "—", lines: 3, mode: "Fabricate" },
];

export const ODOO_MAP = [
  { screen: "Storefront and cart", module: "Website eCommerce", note: "Product variants, pricelists by customer, Kentucky sales tax via a tax engine" },
  { screen: "Product catalog", module: "Inventory / Product", note: "Attributes carry the standard and the OSHA cite as filterable fields — this is the differentiator, build it as data not text" },
  { screen: "Orders", module: "Sales", note: "Quotation → sales order → delivery. Ties to the takeoff." },
  { screen: "Dropship routing", module: "Purchase + Inventory routes", note: "Odoo has a native dropship route. Turn it on; do not write it." },
  { screen: "Suppliers and POs", module: "Purchase", note: "Vendor pricelists, lead times, cut-off times drive the promise date" },
  { screen: "Fabricated items", module: "Manufacturing (MRP)", note: "Bill of materials and work orders for the roof screen and hole covers" },
  { screen: "Invoicing and cash", module: "Accounting", note: "Related-party sales to Construction must be tagged and priced at arm's length" },
  { screen: "Classifieds", module: "Not Odoo", note: "Separate app. Do not bolt a marketplace onto your ERP." },
];

export const KPI = {
  openOrders: 4, openValue: 23760, grossPct: 27.4,
  dropshipPct: 71, avgFulfil: "3.8 days", onTime: 96,
};
