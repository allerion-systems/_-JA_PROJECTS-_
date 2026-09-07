/* Misty Valley Supply — prototype catalog and operating data.
   Prices are placeholders for layout. Standards and OSHA cites are real. */

import { PRODUCT_IMAGES } from "@/assets/products/productImages";

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
  img?: string;          // representative image (AI-generated for the prototype)
};

export const CATEGORIES = [
  { id: "roof", name: "Roof Safety", blurb: "Guardrail, warning line, anchors, skylight screens" },
  { id: "guard", name: "Guardrail Systems", blurb: "Non-penetrating OSHA-compliant edge protection" },
  { id: "head", name: "Head Protection", blurb: "Type I and Type II, Class E and G" },
  { id: "eye", name: "Eye Protection", blurb: "Z87.1 impact-rated, clear through shade 5" },
  { id: "hand", name: "Hand Protection", blurb: "Cut levels A1 through A9" },
  { id: "hivis", name: "Hi-Vis Apparel", blurb: "Class 2 and Class 3, Type R and Type O" },
  { id: "fall", name: "Fall Protection", blurb: "Harnesses, lanyards, self-retracting devices" },
  { id: "siding", name: "Siding", blurb: "Vinyl and aluminum siding, trim and accessories" },
  { id: "sheathing", name: "Sheathing & Framing", blurb: "OSB, plywood, studs" },
  { id: "drywall", name: "Drywall", blurb: "Board, and the standard it hangs to" },
  { id: "structures", name: "Site Structures", blurb: "Conex, offices, pre-fabbed buildings — delivered set" },
  { id: "str", name: "Short-Term Rental Units", blurb: "Cabins, park models, container units — delivered to your lot" },
  { id: "dock", name: "Docks & Waterfront", blurb: "Floating dock sections, gangways and hardware — Nolin, Rough River, Barren" },
  { id: "jobsite", name: "Jobsite Compliance", blurb: "First aid, fire, respiratory, hearing, GFCI — the reorder wall" },
  { id: "roofing", name: "Roofing Accessories", blurb: "Underlayment, ice & water, drip edge, boots, coil nails" },
  { id: "site", name: "Site Protection & Erosion", blurb: "Poly, tarps, floor protection, silt fence, barricade tape" },
  { id: "decking", name: "Decking & Outdoor Lumber", blurb: "PT posts, joists, beams, deck boards, hangers and bases" },
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

  // ---- building materials ------------------------------------------------
  { sku: "MVS-SID-VD4", name: "Vinyl Siding — Double 4 in Clapboard, per square", cat: "siding",
    price: 118, uom: "SQ", std: "ASTM D3679", osha: "IRC R703.11", fulfil: "stock",
    supplier: "ABC Supply", lead: "Same day", hot: true,
    note: "White and clay in stock; full color card by order.",
    why: "ASTM D3679 is the spec vinyl siding is manufactured to. IRC R703.11 governs the install: fastened to framing or blocking per the manufacturer, hung loose enough to move — vinyl expands, and a panel nailed tight buckles by August." },
  { sku: "MVS-SID-AL8", name: "Aluminum Siding — 8 in Horizontal, per square", cat: "siding",
    price: 215, uom: "SQ", std: "AAMA 1402", osha: "IRC R703", fulfil: "dropship",
    supplier: "ABC Supply", lead: "3-5 days",
    note: "For repairs and matches on existing aluminum-clad houses.",
    why: "AAMA 1402 is the standard for aluminum siding, soffit and fascia. Most demand today is matching existing mid-century cladding — measure the exposure before ordering, because 8 in covers differently than 5 in double." },
  { sku: "MVS-SID-JCH", name: "Vinyl J-Channel — 5/8 in, 12 ft 6 in", cat: "siding",
    price: 6.90, uom: "EA", std: "ASTM D3679", osha: "IRC R703.11", fulfil: "stock",
    supplier: "ABC Supply", lead: "Same day", moq: 10,
    note: "The trim piece every siding job runs out of first.",
    why: "Accessories ship under the same ASTM D3679 spec as the panel. J-channel receives cut panel ends at windows, doors and gables — plan a piece for every opening side and you will still go back for more." },
  { sku: "MVS-OSB-716", name: "OSB Sheathing — 7/16 in, 4 ft × 8 ft", cat: "sheathing",
    price: 13.75, uom: "SHT", std: "PS 2, 24/16 span", osha: "IRC R503", fulfil: "stock",
    supplier: "BlueLinx", lead: "Same day", moq: 10, hot: true,
    note: "APA span-rated 24/16. Bundle pricing at 25+.",
    why: "PS 2 is the performance standard on the grade stamp; 24/16 means 24 in rafter and 16 in joist spacing maximums. Leave a 1/8 in gap at panel edges — OSB swells at the edges when it takes water, and a tight deck telegraphs every seam." },
  { sku: "MVS-PLY-12C", name: "Plywood — 1/2 in CDX, 4 ft × 8 ft", cat: "sheathing",
    price: 32, uom: "SHT", std: "PS 1, C-D Exposure 1", osha: "IRC R503", fulfil: "stock",
    supplier: "BlueLinx", lead: "Same day", moq: 5,
    note: "For decks that will sit exposed longer than OSB should.",
    why: "PS 1 governs structural plywood. CDX is C-grade face, D-grade back, Exposure 1 glue — it tolerates construction-phase wetting better than OSB, which is why re-roof decks and soffits still ask for it." },
  { sku: "MVS-STD-248", name: "Stud — 2×4×8 SPF #2", cat: "sheathing",
    price: 3.85, uom: "EA", std: "PS 20, SPF #2", osha: "IRC R602", fulfil: "stock",
    supplier: "BlueLinx", lead: "Same day", moq: 25, hot: true,
    note: "Kiln-dried, grade-stamped. Unit pricing at 294 (a lift).",
    why: "PS 20 is the American Softwood Lumber Standard behind the grade stamp; SPF #2 is the workhorse framing grade. IRC R602 sets wall framing — 16 in on center for most of what this stud will ever hold up." },
  { sku: "MVS-DW-1248", name: "Drywall — 1/2 in, 4 ft × 8 ft", cat: "drywall",
    price: 13.50, uom: "SHT", std: "ASTM C1396", osha: "ASTM C840", fulfil: "stock",
    supplier: "L&W Supply", lead: "Same day", moq: 12,
    note: "Regular board. Type X and mold-resistant by order.",
    why: "ASTM C1396 is the board spec; C840 is how it goes up — fastener spacing, joint treatment. Where the plans say 'one-hour wall,' that is Type X in a listed assembly, not regular board hung twice as carefully." },
  { sku: "MVS-HW-Z90", name: "House Wrap — 9 ft × 100 ft Roll", cat: "sheathing",
    price: 142, uom: "RL", std: "ASTM E1677", osha: "IRC R703.2", fulfil: "stock",
    supplier: "BlueLinx", lead: "Same day",
    note: "Tape sold beside it, because it always is.",
    why: "IRC R703.2 requires a water-resistive barrier behind cladding. ASTM E1677 is the air-barrier spec wraps are tested to. Lap it shingle-style and tape the seams, or the wall assembly is a funnel with extra steps." },

  // ---- site structures ---------------------------------------------------
  { sku: "MVS-CX-20OT", name: "Shipping Container — 20 ft One-Trip", cat: "structures",
    price: 2950, uom: "EA", std: "CSC plated", osha: "49 CFR 450-453", fulfil: "dropship",
    supplier: "Container yard — Louisville", lead: "5-10 days", hot: true,
    note: "One ocean crossing, near-new. Tilt-bed delivery included inside 60 mi.",
    why: "The CSC safety-approval plate on the door is the container's credential under the International Convention for Safe Containers, carried into US law at 49 CFR 450-453. One-trip means one loaded ocean leg — the closest thing to new that ever reaches a jobsite." },
  { sku: "MVS-CX-40HC", name: "Shipping Container — 40 ft High-Cube One-Trip", cat: "structures",
    price: 4850, uom: "EA", std: "CSC plated", osha: "49 CFR 450-453", fulfil: "dropship",
    supplier: "Container yard — Louisville", lead: "5-10 days",
    note: "9 ft 6 in tall. Needs 100+ ft of straight approach for the tilt-bed.",
    why: "Same CSC credential as the 20 — check the plate date before buying any used box. The extra foot of height is what makes the 40 HC the shell of choice for conversions, and the reason the truck needs room to lay it down." },
  { sku: "MVS-ST-GLO20", name: "Ground-Level Office — 20 ft, Wired & Insulated", cat: "structures",
    price: 12800, uom: "EA", std: "Container office, wired to NEC", osha: "1926.403", fulfil: "dropship",
    supplier: "Falcon-type upfitter", lead: "3-5 weeks",
    note: "Door, window, HVAC, panel. Ground level — no stairs, no ramp, no crane.",
    why: "A container office lands at ground level, so it skips the stairs and ramps a trailer office drags along. The electrical package has to be listed and installed per NEC — OSHA 1926.403 requires approved equipment on site power, and an inspector will open that panel." },
  { sku: "MVS-ST-BOOTH", name: "Guard Booth — 4 ft × 6 ft, Prefab", cat: "structures",
    price: 9600, uom: "EA", std: "Prefab, panelized", osha: "1926.95", fulfil: "dropship",
    supplier: "PortaFab-type builder", lead: "4-6 weeks",
    note: "Forklift-set. Gate access, flagger shelter, tool crib.",
    why: "A booth is bought for the person in it: out of traffic, out of weather, sightlines to the gate. Set it where the site plan puts the flagger and the truck route, not where the crane happened to be that day." },

  // ---- pre-fabbed buildings ----------------------------------------------
  // Bolt-up steel kits + Amish-built portable structures. Prices are
  // delivered-to-corridor planning figures pending signed supplier sheets.
  { sku: "MVS-PB-CARP21", name: "Steel Carport — 20 ft × 21 ft, 2-Car", cat: "structures",
    price: 3295, uom: "EA", std: "29-ga panels, galvanized frame", osha: "Local permit rules", fulfil: "dropship",
    supplier: "Regional carport installer", lead: "2-4 weeks", hot: true,
    note: "Installed on your level pad. Two vehicles, equipment, or covered material staging.",
    why: "A carport is the cheapest roof you can put over iron and material. Many Kentucky counties treat an open-sided carport differently from an enclosed building for permitting — check with the county office before the crew is scheduled, and we can point you to the right desk." },
  { sku: "MVS-PB-2430", name: "Steel Garage Kit — 24 ft × 30 ft × 10 ft, Bolt-Up", cat: "structures",
    price: 14500, uom: "EA", std: "Engineered per order to IBC loads", osha: "KRS 198B permit", fulfil: "fabricate",
    supplier: "Steel building fabricator — KY", lead: "6-8 weeks",
    note: "Full bolt-up kit: framing, 26-ga panels, one garage door, one walk door. Stamped drawings for permit included.",
    why: "An enclosed building needs a permit, and the permit needs load-rated drawings — the kit ships with engineering sealed for your county's snow and wind loads, which is the paperwork that gets you to a foundation pour instead of a stop-work order." },
  { sku: "MVS-PB-3040", name: "Steel Building — 30 ft × 40 ft × 12 ft, Bolt-Up Kit", cat: "structures",
    price: 24800, uom: "EA", std: "Engineered per order to IBC loads", osha: "KRS 198B permit", fulfil: "fabricate",
    supplier: "Steel building fabricator — KY", lead: "6-10 weeks",
    note: "Shop, equipment shed, or small ag building. 12-ft eaves clear a lift. Stamped drawings included.",
    why: "Thirty by forty is the workhorse size: big enough for a two-bay shop with racking, small enough that a four-person crew erects it. The included per-order engineering covers your site's loads — the drawings go to the county, the anchor-bolt plan goes to your concrete sub." },
  { sku: "MVS-PB-RUN1224", name: "Loafing Shed — 12 ft × 24 ft, Delivered Set", cat: "structures",
    price: 5450, uom: "EA", std: "Built on treated skids", osha: "Ag-exempt in most KY counties", fulfil: "dropship",
    supplier: "Amish-built — Hart County shop", lead: "3-5 weeks", hot: true,
    note: "Amish-built locally, hauled in and set the same day. Stock run-in, hay cover, or equipment lean-to.",
    why: "A skid-built ag shed arrives finished — no site crew, no pour, set on grade in an afternoon. Most Kentucky counties exempt agricultural buildings from building-permit review, but the exemption is the county's call, not the seller's — one phone call before delivery settles it." },
  { sku: "MVS-PB-SHED1220", name: "Portable Storage Building — 12 ft × 20 ft", cat: "structures",
    price: 7900, uom: "EA", std: "Built on treated skids", osha: "Local permit rules", fulfil: "dropship",
    supplier: "Amish-built — Hart County shop", lead: "3-5 weeks",
    note: "Sided and shingled to match a house. Double doors take a mower or a pallet jack.",
    why: "A portable building beats a stick-built shed on one number: it shows up done. Skid construction means it can move when the site plan changes — the reason contractors buy them for tool cribs and sell them with the house when the job closes." },

  // ---- short-term rental units (Airbnb lots) ------------------------------
  // Delivered-set revenue units. Prices are planning figures pending signed
  // builder sheets. Habitability/certification language states the REGIME a
  // buyer must see on the unit — never a claim we certify anything ourselves.
  { sku: "MVS-STR-PM399", name: "Park Model Cabin — 399 sq ft, One Bedroom + Loft", cat: "str",
    price: 79500, uom: "EA", std: "ANSI A119.5 park model", osha: "County STR permit", fulfil: "dropship",
    supplier: "Park model builder — KY/TN", lead: "10-14 weeks", hot: true,
    note: "Full kitchen and bath, delivered and set on your pad. The workhorse of Airbnb lots.",
    why: "At 399 sq ft a park model rides under the 400 sq ft line that keeps it in the ANSI A119.5 recreational-vehicle regime instead of site-built code — the certification seal on the unit is what the county and your insurer look for. Short-term rental permitting is separate and local: confirm your county's STR ordinance before the unit ships." },
  { sku: "MVS-STR-TH24", name: "Tiny Home on Wheels — 24 ft, Certified Build", cat: "str",
    price: 52000, uom: "EA", std: "Built to ANSI A119.5 by a certified plant", osha: "County STR permit", fulfil: "dropship",
    supplier: "Tiny home builder — certified", lead: "8-12 weeks",
    note: "Towable between lots. Sleeps 2-4, full wet bath, mini-split.",
    why: "On wheels, the unit is titled like an RV — which is exactly why the builder's certification matters: an uncertified build can be refused by parks, lenders and insurers at once. Where it can legally host guests is the county's STR ordinance, not the title." },
  { sku: "MVS-STR-CAB1236", name: "Cabin Shell — 12 ft × 36 ft, Amish-Built, Lofted", cat: "str",
    price: 28500, uom: "EA", std: "Shell — finished on site under local permit", osha: "KBC permit to finish", fulfil: "dropship",
    supplier: "Amish-built — Hart County shop", lead: "4-6 weeks", hot: true,
    note: "Delivered dried-in: framed, sided, roofed, doors and windows set. You finish the inside.",
    why: "A shell keeps the cash outlay low and the finish under your control — but the moment it becomes a dwelling, the interior build-out needs a local building permit and inspections like any habitable structure. Budget the well, septic and power before the shell, not after." },
  { sku: "MVS-STR-CONT40", name: "Container Home — 40 ft, One Bedroom, Turnkey", cat: "str",
    price: 58500, uom: "EA", std: "Factory-built to KY industrialized-building rules", osha: "KY IBS insignia + county STR permit", fulfil: "dropship",
    supplier: "Container conversion plant", lead: "10-16 weeks",
    note: "Kitchenette, bath, mini-split, ready for utility hookups. Crane-set in a day.",
    why: "Kentucky certifies factory-built habitable structures through its industrialized building system program — the state insignia on the unit is what makes a container conversion legally a dwelling here. A unit without the insignia is a storage box with a shower in it; the county will treat it that way." },
  { sku: "MVS-STR-PRM1428", name: "Premium Portable Building — 14 × 28, Finished & Conditioned", cat: "str",
    price: 36500, uom: "EA", std: "Finished interior, mini-split, wired", osha: "Local permit for habitable use", fulfil: "dropship",
    supplier: "Premium builder — Hart County", lead: "6-10 weeks", hot: true,
    note: "Board-and-batten siding over a stone-veneer wainscot, finished and insulated inside, mini-split installed. Delivered set — plug into site power and work.",
    why: "This is the office-grade portable: a finished, conditioned space for a home office, salon suite, or pool house. It arrives as a structure, not a certified dwelling — sleeping in it runs through your county's permit path, and the listing says so." },
  { sku: "MVS-STR-PRM1224", name: "Premium Portable Building — 12 × 24, Finished & Conditioned", cat: "str",
    price: 27900, uom: "EA", std: "Finished interior, mini-split, wired", osha: "Local permit for habitable use", fulfil: "dropship",
    supplier: "Premium builder — Hart County", lead: "6-10 weeks",
    note: "The smaller premium footprint — same finish level, one-room layout.",
    why: "Premium portables earn their price on the finish schedule: real windows, trimmed openings, conditioned air. The structure ships done; utilities and any habitable-use permitting are site work." },
  { sku: "MVS-SC-WAIN8", name: "Stone-Veneer Wainscot Kit — per 8-ft Section", cat: "structures",
    price: 240, uom: "EA", std: "Polymer stone veneer, trim cap", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Shed-component supplier", lead: "1-2 weeks",
    note: "The band that makes a building read custom from the road. Ordered by the 8-ft section.",
    why: "Wainscot is the highest-return finish upgrade on a small building — it grounds the structure visually and takes the mower-and-trimmer abuse the siding shouldn't." },
  { sku: "MVS-STR-POD14", name: "Glamping Pod — 14 ft, Sleeping Unit", cat: "str",
    price: 18900, uom: "EA", std: "Unplumbed sleeping unit", osha: "County STR permit", fulfil: "dropship",
    supplier: "Pod builder — regional", lead: "6-8 weeks",
    note: "Insulated, wired for a mini-split. No plumbing — pairs with a bathhouse.",
    why: "A pod is the cheapest door on a rental property because it skips plumbing entirely — the economics work when several pods share one bathhouse. Counties differ sharply on unplumbed sleeping units; the STR ordinance and health department both get a call first." },

  // ---- interior steel framing (full C645 profile lineup; dropship) -------
  // Same profile family the import catalogs sell, in the imperial sizes US
  // trades install. Priced from Sept 2026 domestic wholesale research.
  { sku: "MVS-SF-S158", name: 'Steel Stud — 1-5/8" × 8 ft, 25-ga EQ', cat: "sheathing",
    price: 3.25, uom: "EA", std: "ASTM C645", osha: "ASTM C754 install", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Chase walls and furring. Sold in 10s.",
    why: "C645 is the spec that makes a drywall stud a drywall stud — flange, lip and thickness are all defined there, and C754 governs how it goes in." },
  { sku: "MVS-SF-S358", name: 'Steel Stud — 3-5/8" × 8 ft, 25-ga EQ', cat: "sheathing",
    price: 4.15, uom: "EA", std: "ASTM C645", osha: "ASTM C754 install", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10, hot: true,
    note: "The workhorse interior stud. Sold in 10s.",
    why: "Every commercial interior wall in America is mostly this stick. It pairs with 3-5/8 track top and bottom — order both or the framer goes home." },
  { sku: "MVS-SF-S600", name: 'Steel Stud — 6" × 8 ft, 25-ga EQ', cat: "sheathing",
    price: 5.95, uom: "EA", std: "ASTM C645", osha: "ASTM C754 install", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Plumbing walls and taller runs. Sold in 10s.",
    why: "Six-inch studs buy chase depth for drain lines and enough stiffness for taller partitions before you need heavier gauge." },
  { sku: "MVS-SF-T358", name: 'Steel Track — 3-5/8" × 10 ft, 25-ga', cat: "sheathing",
    price: 4.85, uom: "EA", std: "ASTM C645", osha: "ASTM C754 install", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Top and bottom runner for 3-5/8 stud. Sold in 10s.",
    why: "Track legs are shorter than stud flanges by design — the stud friction-fits and spins into place. Rule of thumb: track footage equals twice the wall length." },
  { sku: "MVS-SF-T600", name: 'Steel Track — 6" × 10 ft, 25-ga', cat: "sheathing",
    price: 6.75, uom: "EA", std: "ASTM C645", osha: "ASTM C754 install", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Runner for 6-inch stud. Sold in 10s.",
    why: "Match the track to the stud width exactly — a 6-inch wall on 3-5/8 track is a callback, not a wall." },
  { sku: "MVS-SF-CB8", name: 'Corner Bead — 1-1/4" × 8 ft, Galvanized', cat: "drywall",
    price: 2.10, uom: "EA", std: "ASTM C1047", osha: "—", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Every outside corner. Sold in 10s.",
    why: "C1047 covers the trim accessories that finish drywall — bead takes the impact so the edge of the board never has to." },
  { sku: "MVS-SF-JT8", name: 'J-Trim — 1/2" × 8 ft', cat: "drywall",
    price: 2.35, uom: "EA", std: "ASTM C1047", osha: "—", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Caps exposed 1/2-inch board edges — windows, openings, panel ends.",
    why: "J-trim finishes an edge the eye will see without tape or mud — sized to the board thickness, so match it to the rock." },
  { sku: "MVS-SF-ZF8", name: 'Z-Furring — 1" × 8 ft', cat: "drywall",
    price: 3.10, uom: "EA", std: "ASTM C645 accessory", osha: "ASTM C754 install", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Holds rigid insulation to masonry and gives the board something to screw to.",
    why: "Z-furring is how a block wall becomes a finished, insulated wall — the Z profile pins the foam and carries the drywall in one member." },
  { sku: "MVS-SF-WA10", name: 'Wall Angle — 1" × 2" × 10 ft', cat: "drywall",
    price: 2.40, uom: "EA", std: "Ceiling perimeter angle", osha: "—", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Perimeter support for suspended ceilings. Sold in 10s.",
    why: "The angle carries the cut edge of every perimeter ceiling tile — it sets the level line the whole grid hangs from." },
  { sku: "MVS-SF-HAT78", name: 'Hat / Furring Channel — 7/8" × 12 ft', cat: "drywall",
    price: 4.25, uom: "EA", std: "ASTM C645 accessory", osha: "ASTM C754 install", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Furs out ceilings and masonry at 16 or 24 o.c.",
    why: "Hat channel turns any solid surface into a screwable, shimmable plane — the most versatile stick in the interior package." },
  { sku: "MVS-SF-CRC12", name: 'Cold-Rolled Carrying Channel — 1-1/2" × 12 ft', cat: "drywall",
    price: 5.50, uom: "EA", std: "ASTM C754 suspension", osha: "1926.754 general", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "The main runner of a suspended drywall ceiling — hat channel clips below it.",
    why: "C754 lays out the whole suspension chain: hanger wire to carrying channel to furring to board. This is the backbone member of that chain." },
  { sku: "MVS-SF-RC12", name: "Resilient Channel — RC-1 × 12 ft", cat: "drywall",
    price: 4.95, uom: "EA", std: "Single-leg RC-1", osha: "ASTM C754 install", fulfil: "dropship",
    supplier: "Steel framing mill — KY/TN", lead: "2-4 days", moq: 10,
    note: "Decouples the board from the framing — the cheap way to buy STC points.",
    why: "Sound moves through screws — RC-1's single flexible leg breaks that path. Screw the board to the channel only; hit the stud through it and the rating is gone." },

  // ---- import-direct units (preorder; aggregated to container bookings) --
  // Landed-cost pricing per research/TARIFF-STUDS-CHINA-VS-WORLD.md: FOB +
  // ~85% China duty stack + ocean/inland freight, then the 60% floor. Only
  // categories that BEAT domestic after duty get listed. Broker-confirmed
  // HTS + AD/CVD screen required before any actual booking. Never DDP
  // double-invoice offers — walk.
  { sku: "MVS-IM-EXP37", name: "Expandable Container House — 37 ft, 3-Room, Preorder", cat: "str",
    price: 28500, uom: "EA", std: "Imported unit — not a certified dwelling", osha: "Local permit for habitable use", fulfil: "dropship",
    supplier: "Import program — container booking", lead: "12-16 weeks", hot: true,
    note: "Folds out to three rooms with kitchen and bath rough-in. Preorder — units ship when the container booking fills.",
    why: "Expandable units arrive as structures, not certified dwellings — office, farm and jobsite use is straightforward; living in one runs through your county's permit path, and we say that up front instead of after delivery." },
  { sku: "MVS-IM-EXP19", name: "Expandable Container House — 19 ft, 1-Room, Preorder", cat: "str",
    price: 16900, uom: "EA", std: "Imported unit — not a certified dwelling", osha: "Local permit for habitable use", fulfil: "dropship",
    supplier: "Import program — container booking", lead: "12-16 weeks",
    note: "One room, wired, insulated panels. The lowest-cost enclosed square footage on the site.",
    why: "The economics only work because this category's factory price survives the full import duty stack — most imported building kits don't, and we don't list the ones that lose to domestic." },
  { sku: "MVS-IM-FOLD20", name: "Folding Container Unit — 20 ft, Flat-Pack, Preorder", cat: "str",
    price: 13500, uom: "EA", std: "Imported unit — site storage/office class", osha: "Local permit rules", fulfil: "dropship",
    supplier: "Import program — container booking", lead: "12-16 weeks",
    note: "Ships flat, unfolds in an hour with two people. Four units ride in one container slot.",
    why: "Flat-pack is the freight cheat: four units per container position drops the landed freight per unit to a quarter of a welded box — that's why this one prices under everything else with a roof." },

  // ---- drawing packages (paid add-on on every Design Center quote) -------
  { sku: "MVS-DP-PERMIT", name: "Permit Drawing Package — Drafted from Your Model", cat: "structures",
    price: 450, uom: "EA", std: "Plan, elevations, sections + IFC data", osha: "Drafted — not sealed", fulfil: "fabricate",
    supplier: "MVS drafting", lead: "3-5 days after order confirmation", hot: true,
    note: "Construction drawings generated from the exact model that priced your job — IFC (ISO 16739) data file included.",
    why: "The drawings and the price come from one model, so the sheets can never disagree with the quote. Drafted by us; where a county requires an engineer's seal, add the sealed package below." },
  { sku: "MVS-DP-SEAL", name: "Sealed Drawings & Calculations — Licensed Partner Engineers", cat: "structures",
    price: 1400, uom: "EA", std: "Sealed to your county's loads", osha: "KRS 322 — sealed by licensed engineers", fulfil: "fabricate",
    supplier: "Partner engineering firm — KY licensed", lead: "2-3 weeks after order confirmation",
    note: "Our drafted package, reviewed, calculated and sealed by licensed partner engineers.",
    why: "Kentucky law reserves engineering to licensed engineers — we draft from the model, our partner engineers run the calculations and apply the seal, and the county gets a package it can approve." },

  // ---- warehouse shell + door packages (Warehouse Designer) --------------
  { sku: "MVS-PB-50100", name: "PEB Warehouse Shell — 50 ft × 100 ft × 16 ft Eave", cat: "structures",
    price: 84500, uom: "EA", std: "Engineered per order to IBC loads", osha: "KBC plan review", fulfil: "fabricate",
    supplier: "Steel building fabricator — KY", lead: "10-14 weeks", hot: true,
    note: "Clear-span distribution shell. Stamped drawings and anchor-bolt plan included.",
    why: "A commercial shell goes through Kentucky Building Code plan review, not just a county permit — the per-order engineering in the kit is the package the state reviewer reads." },
  { sku: "MVS-PB-DOCK", name: "Dock Door Package — 9×10 Sectional + Leveler + Seal", cat: "structures",
    price: 4850, uom: "EA", std: "Edge-of-dock leveler, bumpers, seal", osha: "1910.26 dock boards", fulfil: "fabricate",
    supplier: "Door & dock distributor — KY", lead: "with shell",
    note: "One complete truck position: door, leveler, bumpers, seal.",
    why: "The leveler and bumpers are where dock safety lives — OSHA's walking-working-surface rules treat the dock edge as a fall exposure, and a rated leveler is the fix that also loads trucks faster." },
  { sku: "MVS-PB-RUD1214", name: "Drive-In Roll-Up Door — 12 ft × 14 ft", cat: "structures",
    price: 2950, uom: "EA", std: "Wind-rated with shell engineering", osha: "Included in shell permit", fulfil: "fabricate",
    supplier: "Door & dock distributor — KY", lead: "with shell",
    note: "Equipment access — a skid steer, a box truck, a combine.",
    why: "Door openings are engineered into the shell's frame lines, so drive-in doors are ordered with the building — cut in later, they need a new framed-opening design." },
  { sku: "MVS-PB-INSWH", name: "Metal Building Insulation — per 1,000 sq ft", cat: "structures",
    price: 780, uom: "EA", std: "Faced blanket, R-13 walls / R-19 roof class", osha: "—", fulfil: "dropship",
    supplier: "Insulation distributor — KY", lead: "2-3 weeks",
    note: "Roof and wall blanket installed with the sheeting. Ordered by the thousand square feet.",
    why: "Blanket insulation goes on as the sheeting goes on — it is nearly free labor during erection and a scaffold job forever after." },

  // ---- barndominium shell + interior (Barndo Builder) --------------------
  { sku: "MVS-PB-4060", name: "Barndominium Shell — 40 ft × 60 ft × 14 ft, Bolt-Up Kit", cat: "structures",
    price: 38500, uom: "EA", std: "Engineered per order to IBC loads", osha: "KRS 198B permit", fulfil: "fabricate",
    supplier: "Steel building fabricator — KY", lead: "8-12 weeks", hot: true,
    note: "The barndo workhorse: shop bay one end, living quarters the other. Stamped drawings included.",
    why: "A barndominium is a permitted dwelling, not an ag building — the shell ships with engineering sealed to your county's loads, and the living-quarters buildout is inspected like any house." },
  { sku: "MVS-PB-PORCH12", name: "Porch Roof Kit — per 12-ft Bay", cat: "structures",
    price: 1850, uom: "EA", std: "Matches shell engineering", osha: "Included in shell permit", fulfil: "fabricate",
    supplier: "Steel building fabricator — KY", lead: "with shell",
    note: "Adds a covered porch bay off the eave side. Ordered with the shell.",
    why: "A porch designed with the shell shares its engineering and its permit — bolted on later, it's a new structural review." },
  { sku: "MVS-IN-R19", name: "Fiberglass Batt R-19 — per 100 sq ft", cat: "sheathing",
    price: 68, uom: "EA", std: "Kraft-faced batt", osha: "—", fulfil: "dropship",
    supplier: "Insulation distributor — KY", lead: "2-4 days",
    note: "Walls of conditioned space. Sold by the hundred square feet.",
    why: "R-19 in a 2x6 or furred steel wall is the baseline the Kentucky energy code expects for conditioned rooms — insulate the quarters, not the shop, and the numbers work." },

  // ---- metal garage & carport program (Garage Designer) ------------------
  // The industry-standard option tree: one base unit plus adder SKUs, the
  // way every carport dealer prices. Dealer-list placeholder pricing pending
  // a signed dealer-program sheet; "certified" is a quote line for the
  // engineering package, never a claim the structure is pre-certified.
  { sku: "MVS-GC-CP1221", name: "Steel Carport Base Unit — 12 × 21 ft, Regular Roof, 14-ga", cat: "structures",
    price: 1595, uom: "EA", std: "29-ga panels, 14-ga galvanized frame", osha: "Local permit rules", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "3-6 weeks typical", hot: true,
    note: "The industry base unit: 12 ft wide, 21 ft long, 6-ft legs, rounded-eave regular roof, installed on your level site. Every wider, longer, taller or more-enclosed build prices as adders on this unit.",
    why: "Carport pricing everywhere in the industry starts from a 12 × 21 regular-roof base and adds width, length, leg height and enclosure as line items — cloning that structure keeps our quote comparable line-for-line with any dealer sheet a buyer holds up next to it." },
  { sku: "MVS-GC-WID2", name: "Frame Width — per 2 ft over 12 ft", cat: "structures",
    price: 180, uom: "EA", std: "Wider roof bows, same frame family", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Widths run 12 to 30 ft. Over 24 ft the plant trusses the bows — same adder, engineered at order.",
    why: "Width is the first number on every dealer's option sheet — it sets the roof bow, and the per-2-ft adder is how the industry keeps 8 widths on one page." },
  { sku: "MVS-GC-LEN5", name: "Frame Length — per 5-ft Bay over 21 ft", cat: "structures",
    price: 395, uom: "EA", std: "Adds one leg pair + roof section", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Lengths run 21 to 51 ft in 5-ft bays. Each bay adds a leg pair and a roof section.",
    why: "Base rails come in 21-ft sticks, which is why the whole industry sells length in 5-ft bays from 21 — the odd-looking 21/26/31 ladder is the frame telling the truth." },
  { sku: "MVS-GC-LEG1", name: "Leg Height — per Foot over 6 ft", cat: "structures",
    price: 150, uom: "EA", std: "Legs 6-14 ft, taller legs = taller braces", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Leg height is side-wall clearance, not peak height. An RV wants 12-ft legs; a garage door wants legs a foot over the door.",
    why: "Every foot of leg is more tube, longer braces and a taller wind sail — the per-foot adder is the honest way the plants price it." },
  { sku: "MVS-GC-BOX", name: "Boxed-Eave (A-Frame) Roof Upgrade — Horizontal Panels", cat: "structures",
    price: 475, uom: "EA", std: "A-frame profile, panels run horizontal", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "The house-style look: peaked A-frame with boxed eaves, panels still run the length of the roof.",
    why: "Boxed-eave is the middle tier of the industry's three roofs — it buys the gabled silhouette without the vertical roof's hat channel, so it prices between regular and vertical." },
  { sku: "MVS-GC-VERT", name: "Vertical Roof Upgrade — per 5-ft Roof Section, Ridge Cap Incl.", cat: "structures",
    price: 145, uom: "EA", std: "Panels run eave-to-ridge over hat channel", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Panels run downhill, so snow, leaves and rain slide off instead of sitting in the ribs. The industry's best roof, priced per roof section.",
    why: "A vertical roof adds hat-channel purlins, a ridge cap and more trim in every section — which is why every dealer prices the upgrade by length, and why it is the recommended roof past 36 ft." },
  { sku: "MVS-GC-12GA", name: "12-Ga Frame Upgrade — per 5-ft Bay", cat: "structures",
    price: 95, uom: "EA", std: "2.25-in 12-ga tube vs 2.5-in 14-ga", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Thicker-wall tube on every bow and leg. Longer frame warranty at most plants, and the frame most certified ratings assume.",
    why: "14-ga is the industry standard frame; 12-ga is the upgrade the wind and snow charts are written around. Buying it per bay keeps the adder proportional to the steel." },
  { sku: "MVS-GC-26GA", name: "26-Ga Panel Upgrade — per 5-ft Bay", cat: "structures",
    price: 75, uom: "EA", std: "26-ga sheeting vs 29-ga standard", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Heavier sheeting on the roof and any installed wall panels — the hail-and-dent upgrade.",
    why: "Panel gauge is the second gauge question on every order form. 29-ga covers most builds; 26-ga is what the coastal-wind and hail counties spec." },
  { sku: "MVS-GC-SIDEH", name: "Partial Side Enclosure — Eave Panel, per 5-ft Section", cat: "structures",
    price: 75, uom: "EA", std: "Panel hangs from the eave, legs open below", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "A 3-ft panel down from the eave each side — rain protection that keeps the drive-through open.",
    why: "The industry's 'partially closed' tier: most of the weather protection for about half the panel cost, and the look that makes a carport read finished." },
  { sku: "MVS-GC-SIDEF", name: "Full Side Enclosure — per 5-ft Section", cat: "structures",
    price: 135, uom: "EA", std: "Eave-to-grade wall panel + trim", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Closes one side to the ground, one 5-ft section at a time. Two full sides + two full ends = a garage.",
    why: "Enclosure per section is how the industry lets a buyer walk one structure from open carport to fully enclosed garage on a single sheet — no separate garage price list." },
  { sku: "MVS-GC-GABLE", name: "Gable End — Peak Fill Above Eave, per End", cat: "structures",
    price: 295, uom: "EA", std: "Closes the triangle above the eave line", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Fills the gable triangle only — the end stays drive-through. Pairs with A-frame roofs.",
    why: "A gable end stiffens the end bay against wind and stops rain blowing under the peak — the cheapest structural option on the sheet, and the one installers recommend first." },
  { sku: "MVS-GC-ENDP", name: "End-Wall Enclosure — per Foot of Width, Gable Fill Incl.", cat: "structures",
    price: 32, uom: "EA", std: "Eave-to-grade end wall + gable fill", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Closes one end wall solid, gable included. Doors are frame-outs in this wall — order them below.",
    why: "End walls price by the foot of width because that is what they are: widths run 12 to 30 ft, and a per-foot line stays honest across all of them." },
  { sku: "MVS-GC-RU66", name: "Roll-Up Door — 6 × 6 ft, Frame-Out Incl.", cat: "structures",
    price: 495, uom: "EA", std: "Curtain-style steel roll-up", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Mower-and-ATV door. Frame-out in the wall included.",
    why: "6 × 6 is the smallest standard roll-up the plants stock — the garden-shed door of the metal-building world." },
  { sku: "MVS-GC-RU98", name: "Roll-Up Door — 9 × 8 ft, Frame-Out Incl.", cat: "structures",
    price: 795, uom: "EA", std: "Curtain-style steel roll-up", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "The single-car door. Fits under 9-ft legs and up.",
    why: "9 × 8 is the workhorse residential opening — one car, one truck, most trailers." },
  { sku: "MVS-GC-RU1010", name: "Roll-Up Door — 10 × 10 ft, Frame-Out Incl.", cat: "structures",
    price: 1095, uom: "EA", std: "Curtain-style steel roll-up", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Tall enough for a loaded pickup rack or a small tractor with ROPS. Wants 11-ft legs.",
    why: "10 × 10 is the crossover size where a garage starts serving equipment instead of cars — the most-ordered upgrade door on dealer sheets." },
  { sku: "MVS-GC-RU1212", name: "Roll-Up Door — 12 × 12 ft, Frame-Out Incl.", cat: "structures",
    price: 1595, uom: "EA", std: "Curtain-style steel roll-up", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "RV and ag-equipment door. Wants 13- or 14-ft legs.",
    why: "12 × 12 is the biggest door the light-gauge frame family carries without a commercial header design — past this, the building moves to the warehouse program." },
  { sku: "MVS-GC-WALK36", name: "Walk-In Door — 36 in, Frame-Out Incl.", cat: "structures",
    price: 395, uom: "EA", std: "Steel walk door, keyed lockset", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Walk in without rolling the big door. Keyed lockset included.",
    why: "The first thing every enclosed-building owner wishes they had ordered — a person-sized door that works in the rain." },
  { sku: "MVS-GC-WIN3030", name: "Window — 30 × 30 in with Frame-Out", cat: "structures",
    price: 275, uom: "EA", std: "Insulated slider, screen incl.", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "Daylight for a shop wall. Framed opening and trim included.",
    why: "Windows go in at the plant's framed opening, not a field cut — ordered with the building, the wall keeps its shear strength around the hole." },
  { sku: "MVS-GC-ANCG", name: "Ground Anchor — 32-in Rebar Pin, per Leg", cat: "structures",
    price: 8, uom: "EA", std: "Driven rebar through the base rail", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "The standard bare-ground anchor. Certified ratings on ground usually call for auger-style anchors — quoted at engineering review.",
    why: "Anchoring is matched to what the legs sit on — ground, concrete or asphalt each take a different anchor, and the crew brings the one the order says." },
  { sku: "MVS-GC-ANCC", name: "Concrete Anchor — Wedge Bolt, per Leg", cat: "structures",
    price: 12, uom: "EA", std: "Expansion wedge anchor into cured slab", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "For legs on a cured slab. The slab itself is by others — pour it before the crew is scheduled.",
    why: "A wedge anchor in cured concrete is the strongest connection on the anchor chart, and the one every certified-on-concrete rating assumes." },
  { sku: "MVS-GC-ANCA", name: "Asphalt Anchor — Barbed Auger, per Leg", cat: "structures",
    price: 25, uom: "EA", std: "Barbed rod driven through asphalt", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "For legs on an asphalt pad. Barbed rod bites through the mat into the base below.",
    why: "Asphalt looks solid and holds nothing — the barbed auger reaches the compacted base underneath, which is what actually resists uplift." },
  { sku: "MVS-GC-LEAN", name: "Lean-To — 6 ft Wide, per 5-ft Bay, Legs + Roof", cat: "structures",
    price: 325, uom: "EA", std: "Shed-roof wing off the eave side", osha: "Priced with base unit", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "with unit",
    note: "A covered wing down one side — firewood, a mower, a run-in. Ordered per bay to match the main frame.",
    why: "A lean-to ordered with the building shares its legs and engineering; bolted on later it is a new structural question. Per-bay pricing follows the main frame's bay lines." },
  { sku: "MVS-GC-CERT", name: "Certified Wind/Snow Package — Engineered, Sealed Drawings", cat: "structures",
    price: 695, uom: "EA", std: "Engineered to your county's loads", osha: "KRS 322 — sealed by licensed engineers", fulfil: "dropship",
    supplier: "Carport manufacturer dealer program — pending", lead: "2-3 weeks after order confirmation",
    note: "Engineered drawings for your county's wind and snow loads — drafted by us, sealed by licensed partner engineers. A quote line, not a pre-existing certificate.",
    why: "Certified vs non-certified is the industry's biggest fork: a certified unit is engineered and documented to a named wind/snow rating your county can approve. We draft from the same model that priced the job; licensed partner engineers run the numbers and apply the seal." },

  // ---- container interior components (Container Designer options) --------
  { sku: "MVS-CI-PART8", name: "Container Partition Kit — Steel Stud, per 8-ft Wall", cat: "structures",
    price: 185, uom: "EA", std: "20-ga steel stud + track", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Container upfit supplier", lead: "1-2 weeks",
    note: "Divides a container into rooms. Screws to the corrugation rails.",
    why: "Steel studs go into a steel box — no moisture movement, no added fire load, and the wall comes back out if the layout changes." },
  { sku: "MVS-CI-INSUL8", name: "Insulation + Wall Liner — per 8-ft Bay", cat: "structures",
    price: 420, uom: "EA", std: "Closed-cell + white panel liner", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Container upfit supplier", lead: "1-2 weeks",
    note: "Closed-cell foam behind washable white panel. Kills condensation.",
    why: "A bare container sweats — closed-cell foam is the only insulation that also seals the steel from interior moisture, which is why every habitable conversion starts here." },
  { sku: "MVS-CI-ELEC", name: "Container Electrical Package — Panel + 4 Circuits", cat: "structures",
    price: 1850, uom: "EA", std: "Listed load center, surface raceway", osha: "1926.403", fulfil: "dropship",
    supplier: "Container upfit supplier", lead: "2-3 weeks",
    note: "Panel, receptacles, LED lighting, exterior inlet. Inspector-ready.",
    why: "OSHA 1926.403 requires listed and approved electrical equipment on site power — a surface-raceway package keeps every conductor visible for the inspector and out of the steel." },
  { sku: "MVS-CI-HVAC12", name: "Mini-Split — 12k BTU Heat/Cool", cat: "structures",
    price: 1450, uom: "EA", std: "ENERGY STAR heat pump", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "HVAC distributor", lead: "1-2 weeks",
    note: "Heats and cools a 20-ft conversion. Wall-sleeve mount through the corrugation.",
    why: "One 12k head carries a 160 sq ft insulated container through a Kentucky summer and winter both — sized to the box, not the brochure." },
  { sku: "MVS-CI-WIN36", name: "Container Window Kit — 36 × 36 with Welded Frame", cat: "structures",
    price: 385, uom: "EA", std: "Framed cutout, insulated slider", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Container upfit supplier", lead: "2-3 weeks",
    note: "Frame welds into a plasma-cut opening. Glass sets after paint.",
    why: "The welded sub-frame restores the wall's shear strength around the cutout — a window hole without one lets the top rail sag over time." },
  { sku: "MVS-CI-DOOR36", name: "Container Man-Door Kit — 36 in Steel", cat: "structures",
    price: 685, uom: "EA", std: "Insulated steel door, welded frame", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Container upfit supplier", lead: "2-3 weeks",
    note: "Walk in without swinging the cargo doors. Keyed lockset included.",
    why: "The first upgrade every container office gets — cargo doors are a two-hand operation in the rain, and a man-door turns the box into a building." },
  { sku: "MVS-CI-FLR8", name: "LVP Floor over Subfloor — per 8-ft Bay", cat: "structures",
    price: 310, uom: "EA", std: "Vapor barrier + LVP", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Container upfit supplier", lead: "1-2 weeks",
    note: "Seals the original marine ply under a clean working floor.",
    why: "Container floors ship treated with marine pesticides — a sealed vapor barrier and new walking surface is the accepted remediation for occupied use." },

  // ---- dock sections + hardware (Dock Designer; Nolin/Rough/Barren) ------
  // USACE-managed lakes: private docks need a shoreline-use permit from the
  // district office. State that plainly; never imply we issue permits.
  { sku: "MVS-DK-SEC410", name: "Floating Dock Section — 4 ft × 10 ft", cat: "dock",
    price: 1650, uom: "EA", std: "Galvanized frame, foam-filled floats", osha: "USACE shoreline permit", fulfil: "dropship",
    supplier: "Dock manufacturer — KY/TN", lead: "3-5 weeks", hot: true,
    note: "The building block: walkways, fingers, and swim platforms all stack from this section.",
    why: "Nolin, Rough River and Barren are Corps of Engineers lakes — a private dock needs a shoreline-use permit from the district office before it touches the water. Foam-filled floats are required on most Corps lakes because air-only floats sink when punctured." },
  { sku: "MVS-DK-SEC810", name: "Floating Dock Section — 8 ft × 10 ft Platform", cat: "dock",
    price: 2950, uom: "EA", std: "Galvanized frame, foam-filled floats", osha: "USACE shoreline permit", fulfil: "dropship",
    supplier: "Dock manufacturer — KY/TN", lead: "3-5 weeks",
    note: "The main platform — seating, swim deck, or the slip head.",
    why: "Platform sections carry the live load where people gather; the frame is the same galvanized channel as the walkway sections, so the whole dock bolts together with one hardware kit." },
  { sku: "MVS-DK-GANG20", name: "Aluminum Gangway — 3 ft × 20 ft", cat: "dock",
    price: 2400, uom: "EA", std: "Welded aluminum, transition plates", osha: "USACE shoreline permit", fulfil: "dropship",
    supplier: "Dock manufacturer — KY/TN", lead: "3-5 weeks",
    note: "Shore to dock across the fluctuation zone. Rolls on the dock end.",
    why: "Corps lakes move — Nolin's pool swings many feet between summer and winter. Twenty feet of gangway is what keeps the walk aboard at a sane slope through the drawdown." },
  { sku: "MVS-DK-DECKC", name: "Composite Decking Upgrade — per Section", cat: "dock",
    price: 240, uom: "EA", std: "Capped composite, hidden fasteners", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Dock manufacturer — KY/TN", lead: "with dock",
    note: "Barefoot-friendly and never needs sealing. Ordered per section.",
    why: "On a dock the deck board lives wet — capped composite shrugs that off, and hidden fasteners mean no proud screw heads under bare feet." },
  { sku: "MVS-DK-CLEAT10", name: "Galvanized Dock Cleat — 10 in", cat: "dock",
    price: 18, uom: "EA", std: "Hot-dip galvanized", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Dock manufacturer — KY/TN", lead: "1 week",
    note: "One per 10 ft of moorable edge is the working rule.",
    why: "Cleats take shock loads a railing never sees — through-bolted to the frame, never lagged to a deck board." },
  { sku: "MVS-DK-BUMP10", name: "Dock Edge Bumper — 10 ft", cat: "dock",
    price: 95, uom: "EA", std: "UV-stable vinyl P-profile", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Dock manufacturer — KY/TN", lead: "1 week",
    note: "Every edge a hull can reach gets bumper. Gelcoat is expensive.",
    why: "The bumper is the cheapest part on the dock and protects the most expensive thing that touches it." },
  { sku: "MVS-DK-LAD4", name: "Swim Ladder — 4-Step, Flip-Up", cat: "dock",
    price: 210, uom: "EA", std: "Aluminum, flip-up stow", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Dock manufacturer — KY/TN", lead: "1 week",
    note: "Flips clear of the water when not in use — slows algae and ice damage.",
    why: "A ladder is how a swimmer gets out — one per swim side, mounted where the water stays deep at winter pool." },
  { sku: "MVS-DK-ANCH", name: "Dock Anchor Kit — per Corner", cat: "dock",
    price: 145, uom: "EA", std: "Deadweight + galvanized chain", osha: "USACE shoreline permit", fulfil: "dropship",
    supplier: "Dock manufacturer — KY/TN", lead: "with dock",
    note: "Deadweight and chain sized for the fluctuation zone. Four corners minimum.",
    why: "Crossed-chain deadweight anchoring lets a floating dock ride the lake's rise and fall without walking down the shoreline — the layout the Corps expects to see on the permit sketch." },

  // ---- prefab building components (dropship; Shed Designer options) ------
  { sku: "MVS-SC-DOOR3", name: "Shed Door — 3-0 × 6-10 Prehung, Primed", cat: "structures",
    price: 185, uom: "EA", std: "Prehung on treated jamb", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Shed-component supplier", lead: "5-7 days",
    note: "Hinged, latched, ready to set in a framed rough opening.",
    why: "A prehung shed door is square out of the box — the hinge mortises and latch alignment are the two things a first-time builder gets wrong, and this removes both." },
  { sku: "MVS-SC-WIN34", name: "Shed Window — 3 ft × 4 ft with J-Trim", cat: "structures",
    price: 95, uom: "EA", std: "Single-pane, aluminum frame", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Shed-component supplier", lead: "5-7 days",
    note: "Screwed to the sheathing over a framed opening. Screen included.",
    why: "Shed windows mount from outside over the sheathing, so the rough framing tolerance is forgiving — the J-trim covers the cut edge and sheds water without flashing tape." },
  { sku: "MVS-SC-RAMP4", name: "Shed Ramp Kit — 4 ft, Rated 1,000 lb", cat: "structures",
    price: 265, uom: "EA", std: "PT frame, cleated deck", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Shed-component supplier", lead: "5-7 days",
    note: "Mower, tiller, or a loaded hand truck. Lag-hooks to the floor frame.",
    why: "The ramp is rated for point loads, not just spread weight — a 700-lb zero-turn on two wheels is the real test, and a site-built plywood ramp fails it." },
  { sku: "MVS-SC-LOFT8", name: "Shed Loft Kit — per 8-ft Bay", cat: "structures",
    price: 145, uom: "EA", std: "2×4 ledger + OSB deck", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Shed-component supplier", lead: "5-7 days",
    note: "Overhead storage across one 8-ft bay at the gable end.",
    why: "A loft hangs on ledgers screwed into studs, so it adds storage without touching the floor plan — the gable end keeps it out of the door swing." },
  { sku: "MVS-SC-CUP24", name: "Cupola — 24 in, Vented with Weathervane Mount", cat: "structures",
    price: 395, uom: "EA", std: "Vinyl-clad, screened vents", osha: "Component — no permit item", fulfil: "dropship",
    supplier: "Shed-component supplier", lead: "1-2 weeks",
    note: "Passive ridge ventilation that also sells the building.",
    why: "A vented cupola moves attic air off the ridge without a powered fan — and it is the single option that most changes what a shed looks like from the road." },
  { sku: "MVS-RF-MTL29", name: "Metal Roofing — 29-ga Panel, Cut to Length", cat: "roofing",
    price: 148, uom: "SQ", std: "ASTM A653 galvanized substrate", osha: "1926.501(b)(11)", fulfil: "dropship",
    supplier: "Panel mill — KY/TN", lead: "1-2 weeks", hot: true,
    note: "Mill cuts panels to your rafter length — no field seams on a shed roof.",
    why: "Cut-to-length panels mean the roof goes on in full runs, eave to ridge. On any steep-slope work, 1926.501(b)(11) requires fall protection at 6 ft — a shed roof is low, a house roof is not; plan the work, not just the material." },
  { sku: "MVS-TR-G12", name: "Engineered Gable Truss — up to 12 ft Span", cat: "structures",
    price: 92, uom: "EA", std: "Plated truss, sealed design sheet", osha: "1926.757", fulfil: "dropship",
    supplier: "Regional truss plant", lead: "1-2 weeks",
    note: "Plant-built, delivered stacked. Design sheet included for permits.",
    why: "A plated truss replaces rafter, ridge and ceiling-tie cutting with one engineered piece — the plant's sealed design sheet is what a county plans-reviewer wants to see, and OSHA 1926.757 governs how trusses are braced during setting." },

  // ---- jobsite compliance consumables ------------------------------------
  // High-reorder dropship. List prices street-checked Sep 2026 (Grainger,
  // Home Depot, Lowe's, safety distributors) and rounded to street-typical.
  {
    sku: "MVS-FA-CLA", name: "First Aid Kit — ANSI Z308.1 Class A, 25-Person", cat: "jobsite",
    price: 27, uom: "kit", std: "ANSI/ISEA Z308.1-2021 Class A", osha: "1926.50(d)(1)",
    note: "Plastic case, wall-mountable. Class A fill: the required minimums for common workplace injuries.",
    why: "1926.50(d)(1) requires first aid supplies to be easily accessible when required, and OSHA points to ANSI/ISEA Z308.1 as the reference fill. Class A covers the common injuries — cuts, abrasions, minor burns — for a typical crew. Check and restock it, because an inspector will open the box.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", hot: true,
  },
  {
    sku: "MVS-FA-CLB", name: "First Aid Kit — ANSI Z308.1 Class B, 50-Person Cabinet", cat: "jobsite",
    price: 75, uom: "kit", std: "ANSI/ISEA Z308.1-2021 Class B", osha: "1926.50(d)(1)",
    note: "Metal wall cabinet. Class B: more of everything, plus splint and tourniquet for high-risk work.",
    why: "Same rule — 1926.50(d)(1) requires accessible first aid supplies, with ANSI/ISEA Z308.1 as the reference. Class B is the high-risk, higher-density fill: larger quantities plus a splint and a tourniquet, sized for a bigger site where the injuries run worse than band-aid grade.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days",
  },
  {
    sku: "MVS-FE-10", name: "Fire Extinguisher — 10 lb ABC Dry Chemical", cat: "jobsite",
    price: 95, uom: "each", std: "UL rated 4-A:80-B:C", osha: "1926.150(c)(1)(i)",
    note: "Rechargeable, wall hook included. Tag it — the annual maintenance check is part of the rule.",
    why: "1926.150(c)(1)(i) requires an extinguisher rated not less than 2A for each 3,000 sq ft of building area, with travel distance to it never over 100 ft. A 10 lb ABC at 4-A:80-B:C covers double the minimum with one unit, and 1926.150(c)(1)(viii) adds the annual maintenance check the tag records.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", hot: true,
  },
  {
    sku: "MVS-RS-N95", name: "N95 Particulate Respirator — Box of 20", cat: "jobsite",
    price: 30, uom: "box", std: "NIOSH N95 (42 CFR 84)", osha: "1926.103 / 29 CFR 1910.134",
    note: "Two-strap cup style, adjustable nose clip. Voluntary dust use still gets Appendix D.",
    why: "1926.103 carries construction respiratory protection over to 29 CFR 1910.134: where exposure requires a respirator, the employer needs a written program, a medical evaluation and an annual fit test — an N95 on an unfitted face passes nothing. Even voluntary comfort use against nuisance dust requires 1910.134 Appendix D to reach every wearer.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", hot: true,
  },
  {
    sku: "MVS-RS-P100", name: "Half-Mask Respirator — with P100 Filters", cat: "jobsite",
    price: 38, uom: "each", std: "NIOSH P100 (42 CFR 84)", osha: "29 CFR 1910.134",
    note: "Elastomeric half facepiece, pair of P100 filters. Silica cuts, lead, long dusty days.",
    why: "For silica and lead work, the exposure rules and 29 CFR 1910.134 put crews in real respirators — an elastomeric half mask with P100 filters (99.97% at the most-penetrating particle size) is the workhorse. Fit testing under 1910.134(f) and a medical evaluation come first; the mask is reusable, the filters are the consumable.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days",
  },
  {
    sku: "MVS-EP-200", name: "Foam Earplugs — Uncorded, Box of 200 Pairs", cat: "jobsite",
    price: 26, uom: "box", std: "NRR 29 (ANSI S3.19)", osha: "1926.101(a)",
    note: "Dispenser box. The consumable every crew burns through — one shift per pair.",
    why: "1926.101(a) requires ear protective devices wherever noise cannot be brought under the 1926.52 limits — 90 dBA over an 8-hour shift, less as it gets louder. Foam plugs at NRR 29 are the everyday answer, and a box of 200 pairs is a jobsite consumable, not equipment: they get one shift each.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", hot: true,
  },
  {
    sku: "MVS-EM-27", name: "Earmuffs — Over-the-Head, NRR 27", cat: "jobsite",
    price: 24, uom: "each", std: "NRR 27 (ANSI S3.19)", osha: "1926.101(a)",
    note: "On and off in a second. For intermittent noise, and for the ears a foam plug never fits.",
    why: "Same rule as the plugs: 1926.101(a), triggered by the 1926.52 noise limits. Muffs at NRR 27 go on and off in a second, which wins around intermittent saw and generator noise — and 1926.101(c) requires ear protectors to be individually fitted, which a muff solves for anyone a foam plug never fits.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days",
  },
  {
    sku: "MVS-EL-GFCI", name: "GFCI Pigtail — Inline, 12/3, Single Tap", cat: "jobsite",
    price: 42, uom: "each", std: "UL 943 Class A", osha: "1926.404(b)(1)(ii)",
    note: "Open-neutral protection, manual reset. One at every generator and borrowed-receptacle drop.",
    why: "1926.404(b)(1)(ii) requires GFCI protection for every 120-volt, 15- and 20-amp receptacle outlet on site that is not part of the building's permanent wiring. A generator or a house receptacle borrowed for temp power usually has none — this pigtail puts the GFCI at the source, first thing plugged in, so everything downstream is protected.",
    fulfil: "dropship", supplier: "Falls City Electrical Supply", lead: "2–4 days", hot: true,
  },
  {
    sku: "MVS-EL-123", name: "Extension Cord — 100 ft, 12/3 SJTW", cat: "jobsite",
    price: 85, uom: "each", std: "SJTW 12/3, UL listed", osha: "1926.405(a)(2)(ii)(J)",
    note: "15 A, lighted ends. 12-gauge holds voltage at full length — 14-gauge does not.",
    why: "1926.405(a)(2)(ii)(J) requires flexible cords on construction sites to be hard or extra-hard usage — the junk-drawer cord is a citation. At 100 ft only 12-gauge keeps a saw from browning out at the far end, and the damaged-cord inspections of 1926.416 are why crews buy these by the pair.",
    fulfil: "dropship", supplier: "Falls City Electrical Supply", lead: "2–4 days",
  },
  {
    sku: "MVS-EL-STR", name: "LED Work Light String — 100 ft, 10 Lamps", cat: "jobsite",
    price: 129, uom: "each", std: "LED stringer, 5000K", osha: "1926.56(a)",
    note: "Hang hooks included, linkable. Cool-running LED — nothing shatters, no relamping.",
    why: "1926.56(a) sets minimum illumination for work in progress — 5 foot-candles for general construction areas, more in shops and offices — and interiors fail it fast once walls go up before the fixtures do. A 100 ft LED stringer lights a floor per drop and draws a fraction of the old incandescent strings.",
    fulfil: "dropship", supplier: "Falls City Electrical Supply", lead: "2–4 days",
  },

  // ---- roofing accessories -----------------------------------------------
  {
    sku: "MVS-RF-SYN10", name: "Synthetic Roof Underlayment — 10-Square Roll", cat: "roofing",
    price: 85, uom: "roll", std: "ASTM D8257", osha: "IRC R905.1.1",
    note: "48 in × 250 ft. Cap-fastened. A slick deck is a fall hazard, not a product feature — walk it right.",
    why: "IRC R905.1.1 requires underlayment beneath the roof covering, and synthetics run to ASTM D8257 where felt ran to D226 — lighter, flatter, and it does not tear off the deck in the first gust. One roll covers ten squares, which is why crews order it by the job, not the roll.",
    fulfil: "dropship", supplier: "ABC Supply", lead: "1–3 days", hot: true,
  },
  {
    sku: "MVS-RF-IWS", name: "Ice & Water Shield — Self-Adhering, 2-Square Roll", cat: "roofing",
    price: 69, uom: "roll", std: "ASTM D1970", osha: "IRC R905.1.2",
    note: "36 in × 66.7 ft. Seals around fasteners. Eaves, valleys, penetrations.",
    why: "IRC R905.1.2 requires an ice barrier at the eaves — from the edge to at least 24 in inside the exterior wall line — where ice damming has a history. ASTM D1970 is the self-adhering membrane spec, and the self-sealing around nail shanks is the property being bought.",
    fulfil: "dropship", supplier: "ABC Supply", lead: "1–3 days",
  },
  {
    sku: "MVS-RF-DE10", name: "Drip Edge — Aluminum, 10 ft", cat: "roofing",
    price: 9.25, uom: "each", std: "Aluminum, Type C profile", osha: "IRC R905.2.8.5",
    note: "White or mill finish. Order by the bundle — every foot of eave and rake gets one.",
    why: "IRC R905.2.8.5 requires a drip edge at eaves and rakes on shingle roofs, adjacent pieces lapped a minimum of 2 in — and it is the line every takeoff shorts. Every foot of eave and rake gets covered, so it sells by the 10-ft stick in bundle quantities.",
    fulfil: "dropship", supplier: "ABC Supply", lead: "1–3 days", moq: 10,
  },
  {
    sku: "MVS-RF-BOOT", name: "Pipe Boot Flashing — Fits 1.5–3 in Vents", cat: "roofing",
    price: 13.5, uom: "each", std: "TPE boot, aluminum base", osha: "IRC R903.2",
    note: "Adjustable-pitch base. The cracked boot is the most common service-call leak in the trade.",
    why: "IRC R903.2 requires flashings at every roof penetration, and the plumbing vent is the penetration on every house. A sun-cracked boot is the most common roof leak there is — crews keep a stack on the truck because every reroof replaces every boot on the deck.",
    fulfil: "dropship", supplier: "ABC Supply", lead: "1–3 days", moq: 6,
  },
  {
    sku: "MVS-RF-CN72", name: "Coil Roofing Nails — 1-1/4 in, 7,200 ct", cat: "roofing",
    price: 42, uom: "box", std: "ASTM F1667, 12 ga galv.", osha: "IRC R905.2.5",
    note: "Electro-galvanized, 15° wire coil. A box runs about twenty squares at four nails a shingle.",
    why: "IRC R905.2.5 spells out the shingle fastener: galvanized or otherwise corrosion-resistant, 12-gauge shank, 3/8-in head, long enough to penetrate the deck 3/4 in — which is exactly what a 1-1/4 in coil nail to ASTM F1667 is. At four to six nails a shingle, the 7,200-count box is the unit roofers reorder by.",
    fulfil: "dropship", supplier: "ABC Supply", lead: "1–3 days", hot: true,
  },

  // ---- fasteners, adhesives, sealants (filed with the materials they hang,
  //      glue and seal: sheathing, drywall, siding) --------------------------
  {
    sku: "MVS-FS-EX9", name: "Exterior Screws — #9 × 2-1/2 in, 5 lb", cat: "sheathing",
    price: 37, uom: "box", std: "#9 coated, T-25 star drive", osha: "—",
    note: "Polymer-coated for treated lumber. Decks, fences, blocking, temporary bracing.",
    why: "No code names this box — it is what crews actually burn through on decks, fences, blocking and bracing. The polymer coating is the point: modern ACQ-treated lumber corrodes unprotected steel, so an exterior-rated coating is the difference between a screw and a future stain with no head left.",
    fulfil: "dropship", supplier: "BlueLinx", lead: "2–3 days", hot: true,
  },
  {
    sku: "MVS-FS-DW158", name: "Drywall Screws — #6 × 1-5/8 in Coarse, 5 lb", cat: "drywall",
    price: 25, uom: "box", std: "ASTM C1002", osha: "ASTM C840",
    note: "Bugle head, coarse thread for wood studs. About 850 screws — call it a dozen sheets.",
    why: "ASTM C1002 is the drywall screw spec, and C840 — the same standard the board hangs to — sets the spacing: 12 in on ceilings, 16 in on walls framed at 16. Coarse thread for wood studs, 1-5/8 in for 1/2-in board, and a 5-lb box hangs roughly a dozen sheets.",
    fulfil: "dropship", supplier: "L&W Supply", lead: "1–2 days",
  },
  {
    sku: "MVS-AD-CON28", name: "Construction Adhesive — Subfloor, 28 oz", cat: "sheathing",
    price: 12.5, uom: "tube", std: "ASTM D3498", osha: "—",
    note: "Quart-size tube, gun sold separately. One tube runs about three sheets of subfloor.",
    why: "ASTM D3498 is the subfloor adhesive spec, and gluing the deck to the joists is the difference between a floor and a squeak generator — the glued-floor system is how nail pops stop being a callback. A 28-oz tube runs about three sheets; order it by the case with the OSB.",
    fulfil: "dropship", supplier: "BlueLinx", lead: "2–3 days", moq: 12,
  },
  {
    sku: "MVS-SL-PU10", name: "Polyurethane Sealant — 10 oz Cartridge", cat: "siding",
    price: 11, uom: "tube", std: "ASTM C920, Class 25", osha: "—",
    note: "Gun-grade, paintable. Concrete, masonry, metal — the exterior joint workhorse.",
    why: "ASTM C920 Class 25 means the cured joint moves 25% and comes back — which is what an exterior expansion joint does through a Kentucky summer. Polyurethane bonds to concrete, masonry and metal and takes paint: the tube for sill joints, penetrations, and everything silicone would peel from.",
    fulfil: "dropship", supplier: "ABC Supply", lead: "1–3 days", moq: 12,
  },
  {
    sku: "MVS-SL-SIL10", name: "Silicone Sealant — 100%, 10.1 oz Cartridge", cat: "siding",
    price: 11.5, uom: "tube", std: "ASTM C920, 100% silicone", osha: "—",
    note: "Clear and white. Takes no paint, ever — buy the color, not the intention to paint it.",
    why: "Same ASTM C920 spec, different chemistry: silicone shrugs off UV and water indefinitely but takes no paint, so it goes where the joint stays exposed — window perimeters, flashing laps, wet locations. The 10.1-oz cartridge is the standard gun size; buy the color, because you cannot paint over the mistake.",
    fulfil: "dropship", supplier: "ABC Supply", lead: "1–3 days", moq: 12,
  },
  {
    sku: "MVS-FT-475", name: "Flashing Tape — Self-Adhered, 4 in × 75 ft", cat: "sheathing",
    price: 29, uom: "roll", std: "AAMA 711", osha: "IRC R703.4",
    note: "Butyl-based, straight-line tear. A roll does about six window openings.",
    why: "IRC R703.4 requires flashing at window and door openings to keep water out of the wall, and self-adhered flashing tape to AAMA 711 is how production crews do it: sill first, jambs over sill, head over jambs — shingle-lapped and rolled hard. The 4-in × 75-ft roll does about six openings.",
    fulfil: "dropship", supplier: "BlueLinx", lead: "2–3 days", hot: true,
  },

  // ---- site protection & erosion -------------------------------------------
  {
    sku: "MVS-BT-CAU", name: "Barricade Tape — CAUTION, 3 in × 1,000 ft", cat: "site",
    price: 11, uom: "roll", std: "2 mil PE, yellow/black", osha: "1926.200(c)",
    note: "Yellow means proceed with care. Wet concrete, edges being worked, overhead work below.",
    why: "OSHA's sign rules at 1926.200 set the color language — yellow with black lettering means caution — and barricade tape borrows it to flag a hazard faster than any sign can go up. Wet concrete, open edges being worked, overhead work below: a roll a week is normal on an active site.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days", hot: true,
  },
  {
    sku: "MVS-BT-DAN", name: "Barricade Tape — DANGER, 3 in × 1,000 ft", cat: "site",
    price: 11, uom: "roll", std: "2 mil PE, red/white", osha: "1926.200(b)",
    note: "Red means keep out entirely. Not interchangeable with caution yellow.",
    why: "1926.200(b) reserves the red danger scheme for immediate hazard — red with DANGER means keep out entirely, where caution yellow means proceed with care. Crews string it at excavation edges, energized gear and crane swing radius; if the hazard would stop an inspector, it gets red tape, not yellow.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days",
  },
  {
    sku: "MVS-MP-INV", name: "Marking Paint — Inverted Tip, Case of 12", cat: "site",
    price: 89, uom: "case", std: "Inverted tip, APWA colors", osha: "APWA / 811",
    note: "17 oz cans, one color per case. White, fluorescent orange, green, blue, red, yellow.",
    why: "The APWA uniform color code is the language on the ground — white for proposed work, red for electric, yellow for gas — and an 811 locate arrives in exactly these colors. Inverted-tip cans spray upside down through a wand all day; layout crews buy it by the 12-can case, one color per trade.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days",
  },
  {
    sku: "MVS-PY-620", name: "Poly Sheeting — 6 mil, 20 ft × 100 ft", cat: "site",
    price: 89, uom: "roll", std: "ASTM D4397, 6 mil", osha: "IRC R506.2.3",
    note: "Clear. Vapor retarder, containment walls, curing cover, weather protection.",
    why: "IRC R506.2.3 requires a 6-mil vapor retarder under every concrete slab, joints lapped 6 in — one 20 × 100 roll does a 2,000 sq ft pour. The rest of the roll never goes to waste: containment walls, curing cover, and everything a winter jobsite needs wrapped.",
    fulfil: "dropship", supplier: "BlueLinx", lead: "2–3 days", hot: true,
  },
  {
    sku: "MVS-TP-2030", name: "Heavy-Duty Tarp — 20 ft × 30 ft", cat: "site",
    price: 115, uom: "each", std: "12 mil poly, UV-treated", osha: "—",
    note: "Reinforced grommets every 18 in. The lumber-drop and torn-off-roof cover.",
    why: "No rule orders a tarp; weather does. A 20 × 30 heavy-duty poly covers a lumber drop, a tear-off caught by rain, or an open trailer — and the difference between heavy-duty and the hardware-store special is the weave count and UV treatment that decide whether it survives a season or one storm.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days",
  },
  {
    sku: "MVS-FP-RAM", name: "Floor Protection Board — 38 in × 100 ft Roll", cat: "site",
    price: 66, uom: "roll", std: "42 mil fiberboard", osha: "—",
    note: "Lays flat, no curl-back, takes cart traffic. The finish-phase logistics standard.",
    why: "Temporary floor protection is pure economics: 100 ft of roll costs less than refinishing one scratch across a finished floor. The heavy fiberboard roll lays flat without curl-back, takes cart and lift traffic, and is the spec GCs write into finish-phase logistics plans.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days",
  },
  {
    sku: "MVS-SW-18", name: "Stretch Wrap — 18 in × 1,500 ft, 80 ga", cat: "site",
    price: 24, uom: "roll", std: "80 ga cast film", osha: "—",
    note: "Hand roll with extended-core handles. Wrap it or chase it down I-65.",
    why: "The 18-in hand roll is how loose material survives the truck: banded windows, cut trim, a cart of fixtures, door slabs in pairs. 80-gauge is the working weight for jobsite loads, and at this price crews stop rationing it — wrap the load or chase it down the interstate.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days",
  },
  {
    sku: "MVS-EC-SILT", name: "Silt Fence — 36 in × 100 ft, Staked", cat: "site",
    price: 42, uom: "roll", std: "ASTM D6461 fabric, staked", osha: "EPA CGP / SWPPP",
    note: "Stakes pre-attached. The downhill perimeter line on every disturbed acre.",
    why: "Any site disturbing an acre or more operates under the EPA Construction General Permit and its state twins, and the SWPPP those permits require almost always draws silt fence at the downhill perimeter. The staked contractor roll goes in fast — and a blown-out run is the fine an inspector writes without leaving the truck.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days", hot: true,
  },
  {
    sku: "MVS-EC-SF4", name: "Safety Fence — Orange, 4 ft × 100 ft", cat: "site",
    price: 44, uom: "roll", std: "HDPE barrier mesh", osha: "1926.202",
    note: "T-posts sold separately. Excavations, drop zones, no-go areas.",
    why: "Orange mesh is the site's fastest barricade: 1926.202 wants barricades for traffic conforming to the MUTCD, and inside the fence line the same roll flags open excavations, drop zones and swing radius. It stops nobody physically — it exists so nobody can say they didn't see it.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days",
  },
  {
    sku: "MVS-EC-SB100", name: "Sandbags — Empty, Woven PP, Bundle of 100", cat: "site",
    price: 52, uom: "bundle", std: "Woven PP, UV-treated, 14 × 26 in", osha: "—",
    note: "Fill on site. Ballast, hold-downs, inlet protection, water diversion.",
    why: "Empty bags, filled on site: ballast for silt fence and safety fence, hold-downs for poly and tarps, inlet protection around storm drains, and gravity for anything the wind wants. UV-treated polypropylene survives a season in the sun where the cheap bag splits in a month.",
    fulfil: "dropship", supplier: "Louisville Site Supply", lead: "2–3 days",
  },

  // ---- decking & outdoor lumber ------------------------------------------
  // Street prices checked Sep 2026 against Lowe's, Home Depot and regional
  // yards (AW Graham, Owens Supply corridor lists) and rounded street-typical.
  {
    sku: "MVS-PT-448", name: "Post — 4×4×8 PT #2, Ground Contact", cat: "decking",
    price: 11.85, uom: "EA", std: "PS 20, UC4A ground contact", osha: "IRC R507",
    note: "Guard posts, stair posts, light framing. Actual 3-1/2 × 3-1/2.",
    why: "IRC R507 is the prescriptive deck chapter, and R317.1 puts treated or naturally durable wood everywhere lumber sits exposed or near grade. UC4A ground-contact treatment is the retention that survives soil splash — and modern copper treatments eat bare steel, so hang it on coated or hot-dip fasteners only.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", moq: 4,
  },
  {
    sku: "MVS-PT-668", name: "Post — 6×6×8 PT #2, Ground Contact", cat: "decking",
    price: 29.50, uom: "EA", std: "PS 20, UC4B ground contact", osha: "IRC R507.4",
    note: "The deck support post. Actual 5-1/2 × 5-1/2. Cut end gets field preservative.",
    why: "IRC R507.4 sizes deck support posts, and a 6×6 covers every bearing height the table allows where a 4×4 runs out early. UC4B is the heavy ground-contact retention for structural posts. Every field cut exposes untreated core — swab it with copper naphthenate or the rot starts at your saw kerf.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", hot: true,
  },
  {
    sku: "MVS-PT-2812", name: "Joist — 2×8×12 PT #2 SYP", cat: "decking",
    price: 14.75, uom: "EA", std: "PS 20, SYP #2, UC3B", osha: "IRC R507.6",
    note: "Deck joists, ledgers, rim. Crown up. 16 in o.c. spans to the R507.6 table.",
    why: "IRC R507.6 sets deck joist spans — a #2 southern pine 2×8 at 16 in on center is good for roughly 11 ft 8 in of joist span, which is why it is the corridor's default deck joist. The ledger comes out of the same pile: R507.9 wants it the same depth as the joists it carries.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", moq: 10, hot: true,
  },
  {
    sku: "MVS-PT-21012", name: "Beam Stock — 2×10×12 PT #2 SYP", cat: "decking",
    price: 21.50, uom: "EA", std: "PS 20, SYP #2, UC3B", osha: "IRC R507.5",
    note: "Doubled for deck beams; also the stair-stringer blank.",
    why: "IRC R507.5 sizes deck beams by ply and span: a doubled 2×10 over posts at 8 ft covers the spans these decks draw. Fasten the plies per the table, crown both up, and keep post bearing full — a beam notched to a sliver on top of a 6×6 is the failure photo in every deck-collapse report.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", moq: 4,
  },
  {
    sku: "MVS-PT-5412", name: "Deck Board — 5/4×6×12 PT, Radius Edge", cat: "decking",
    price: 12.95, uom: "EA", std: "PS 20, UC3B, radius edge", osha: "IRC R507.7",
    note: "Actual 1 × 5-1/2. Lay bark side down, gap 1/4 in wet-to-wet.",
    why: "IRC R507.7 wants decking fastened to each joist per its span rating, and 5/4 radius-edge board is rated for joists at 16 in on center. Treated boards ship wet and shrink — set them near-tight and the sun opens the gap; the 5.5 in face plus the gap is what the takeoff counts per course.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", moq: 10, hot: true,
  },
  {
    sku: "MVS-PT-248", name: "Rail Stock — 2×4×8 PT #2", cat: "decking",
    price: 6.45, uom: "EA", std: "PS 20, UC3B", osha: "IRC R507.10.2",
    note: "Guard rails, blocking, stair framing. Exterior fasteners only.",
    why: "The treated 2×4 is the guard's top and bottom rail and the blocking between joists. IRC R507.10.2 hangs the number on the assembly it joins: a guard that resists a 200 lb concentrated load at the top — which is a post-connection problem the rail carries the load to, not a reason to skip the rail.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", moq: 10,
  },
  {
    sku: "MVS-PT-BAL", name: "Baluster — 2×2×42 PT, Beveled", cat: "decking",
    price: 1.95, uom: "EA", std: "PS 20, UC3B", osha: "IRC R312.1.3",
    note: "One per 5-1/2 in of rail run keeps the sphere out. Sold by the bundle in spirit.",
    why: "IRC R312.1.3 is the 4-inch-sphere rule: no opening in a required guard may pass a 4 in sphere. A 1-1/2 in baluster every 5-1/2 in of run leaves a hair under 4 in clear — which is why the takeoff counts balusters off rail length, not off guesswork.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", moq: 25,
  },
  {
    sku: "MVS-HD-LUS28", name: "Joist Hanger — 2×8, Double-Shear, G90", cat: "decking",
    price: 2.10, uom: "EA", std: "ASTM A653 G90, 18 ga", osha: "IRC R507.6.1",
    note: "Face-mount. Fill every hole with the listed hanger nail or screw.",
    why: "IRC R507.6.1 requires deck joist bearing or an approved hanger at the ledger — toenails alone are exactly what the rule exists to end. A G90-galvanized double-shear hanger is the approved path, and it only carries its rating with every nail hole filled with the listed fastener, not whatever was in the pouch.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", moq: 10, hot: true,
  },
  {
    sku: "MVS-HD-ABU66", name: "Post Base — 6×6, Standoff, ZMAX", cat: "decking",
    price: 28.50, uom: "EA", std: "ASTM A653 G185 (ZMAX)", osha: "IRC R507.4.1",
    note: "1 in standoff keeps end grain out of the puddle. Anchors to the footing.",
    why: "IRC R507.4.1 wants deck posts restrained against lateral displacement at the footing, and a cast-in or anchored standoff base is the listed way to do it. The 1 in standoff matters as much as the steel: post end grain sitting in water rots from the bottom up, treated or not. ZMAX (G185) coating is the grade rated for contact with modern treated lumber.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day",
  },
  {
    sku: "MVS-FS-STR50", name: "Structural Screws — 1/4 × 3 in, 50 ct", cat: "decking",
    price: 44, uom: "box", std: "ICC-ES evaluated, coated", osha: "IRC R507.9.1.3",
    note: "Ledger and hardware duty. A lag alternative with a published report.",
    why: "IRC R507.9.1.3 fastens the ledger with 1/2 in lags or bolts — or fasteners installed per an ICC-ES evaluation report, which is what a structural screw's paperwork is. Two staggered rows at the table spacing, into the band, through flashing, and the report in the job file is what the inspector actually reads.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", hot: true,
  },
  {
    sku: "MVS-CN-80", name: "Concrete Mix — 80 lb Bag", cat: "decking",
    price: 6.50, uom: "bag", std: "ASTM C387, 4,000 psi", osha: "IRC R507.3",
    note: "About 0.6 cu ft per bag. Three bags fills a 10 in tube 30 in deep.",
    why: "IRC R507.3 puts deck footings on undisturbed or compacted soil, sized to the load and — R507.3.3 — carried below the local frost line. Bagged ASTM C387 mix at 4,000 psi is how a three-post deck gets poured without ordering a truck; the takeoff runs three bags per post and the frost depth comes from the county, not the bag.",
    fulfil: "stock", supplier: "BlueLinx", lead: "Same day", moq: 10,
  },
];

/* Attach representative imagery by SKU. Products without a generated image
   keep their drawn Glyph in every view. */
for (const p of PRODUCTS) p.img = PRODUCT_IMAGES[p.sku];

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
  { name: "Bluegrass PPE Distributors", terms: "Net 30", ships: "Same day to 2 days", cut: "3:00 PM ET", lines: 21, mode: "Dropship" },
  { name: "Falls City Electrical Supply", terms: "Net 30", ships: "2 to 4 days", cut: "1:00 PM ET", lines: 3, mode: "Dropship" },
  { name: "Louisville Site Supply", terms: "Net 30", ships: "2 to 3 days", cut: "2:00 PM ET", lines: 9, mode: "Dropship" },
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
