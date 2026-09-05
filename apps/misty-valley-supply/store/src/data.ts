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
    fulfil: "dropship", supplier: "Midwest Safety Group", lead: "3–5 days", hot: true,
  },
  {
    sku: "MVS-RG-BASE", name: "Guardrail Counterweight Base — 90 lb", cat: "roof",
    price: 148, uom: "each", std: "OSHA 1926.502(b)", osha: "1926.501(b)(10)",
    note: "Rubber-footed cast base. Spacing per manufacturer's engineered layout — do not eyeball it.",
    fulfil: "dropship", supplier: "Midwest Safety Group", lead: "3–5 days",
  },
  {
    sku: "MVS-WL-600", name: "Warning Line System — 600 ft Kit", cat: "roof",
    price: 1240, uom: "kit", std: "OSHA 1926.502(f)", osha: "1926.501(b)(10)",
    note: "Stanchions plus line. Erected not less than 6 ft from edge, flagged at 6 ft intervals, 34–39 in high.",
    fulfil: "dropship", supplier: "Midwest Safety Group", lead: "5–7 days",
  },
  {
    sku: "MVS-SKY-48", name: "Skylight Screen — 4 ft × 8 ft", cat: "roof",
    price: 412, uom: "each", std: "OSHA 1926.502(i)", osha: "1926.501(b)(4)",
    note: "Covers capable of supporting twice the maximum intended load. Marked HOLE or COVER.",
    fulfil: "fabricate", supplier: "Misty Valley shop", lead: "7–10 days",
  },
  {
    sku: "MVS-ANC-DL", name: "Reusable Roof Anchor — Standing Seam Clamp", cat: "roof",
    price: 386, uom: "each", std: "ANSI/ASSP Z359.18 Type A", osha: "1926.502(d)(15)",
    note: "5,000 lb anchorage per attached worker, or engineered to 2:1 with a qualified person.",
    fulfil: "dropship", supplier: "Ridgeline Fall Protection", lead: "4–6 days",
  },

  // ---- guardrail ---------------------------------------------------------
  {
    sku: "MVS-YG-10", name: "Yellow Steel Guardrail — 10 ft Rail", cat: "guard",
    price: 172, uom: "each", std: "OSHA 1926.502(b)", osha: "1926.501(b)(1)",
    note: "Powder-coated safety yellow. Top rail 42 in, mid rail at 21 in, toe board where material can fall.",
    fulfil: "dropship", supplier: "Ohio Valley Rail Products", lead: "5–8 days", hot: true,
  },
  {
    sku: "MVS-YG-POST", name: "Guardrail Post — Bolt-Down, Yellow", cat: "guard",
    price: 96, uom: "each", std: "OSHA 1926.502(b)", osha: "1926.501(b)(1)",
    note: "Baseplate with four anchors. Deflection under 200 lb must not bring top rail below 39 in.",
    fulfil: "dropship", supplier: "Ohio Valley Rail Products", lead: "5–8 days",
  },
  {
    sku: "MVS-YG-TOE", name: "Toe Board — 4 in × 10 ft, Yellow", cat: "guard",
    price: 64, uom: "each", std: "OSHA 1926.502(j)", osha: "1926.501(b)(1)",
    note: "Minimum 3½ in vertical, withstands 50 lb. Required wherever people work or pass below.",
    fulfil: "dropship", supplier: "Ohio Valley Rail Products", lead: "5–8 days",
  },
  {
    sku: "MVS-HOLE-4", name: "Floor Hole Cover — 4 ft × 4 ft, Marked", cat: "guard",
    price: 128, uom: "each", std: "OSHA 1926.502(i)", osha: "1926.501(b)(4)",
    note: "Secured against displacement. Pre-marked HOLE. Twice the maximum intended load.",
    fulfil: "fabricate", supplier: "Misty Valley shop", lead: "5–7 days",
  },

  // ---- head --------------------------------------------------------------
  {
    sku: "MVS-HH-C1", name: "Hard Hat — Cap Style, Type I Class E", cat: "head",
    price: 19.5, uom: "each", std: "ANSI/ISEA Z89.1 Type I Class E", osha: "1926.100(a)",
    note: "Type I protects the crown only. Class E tested to 20,000 V. Four-point ratchet.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12, hot: true,
  },
  {
    sku: "MVS-HH-T2V", name: "Safety Helmet — Type II Class E, Vented", cat: "head",
    price: 89, uom: "each", std: "ANSI/ISEA Z89.1 Type II Class E", osha: "1926.100(a)",
    note: "Type II adds lateral impact protection. Chin strap, accessory rails. Vented models are Class C unless stated — read the shell mark.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", hot: true,
  },
  {
    sku: "MVS-HH-BRIM", name: "Hard Hat — Full Brim, Type I Class G", cat: "head",
    price: 27, uom: "each", std: "ANSI/ISEA Z89.1 Type I Class G", osha: "1926.100(a)",
    note: "Class G tested to 2,200 V. Full brim sheds water and sun — the roofer's default.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12,
  },

  // ---- eye ---------------------------------------------------------------
  {
    sku: "MVS-SG-CLR", name: "Safety Glasses — Clear, Anti-Fog", cat: "eye",
    price: 6.4, uom: "each", std: "ANSI/ISEA Z87.1 Z87+", osha: "1926.102(b)(1)",
    note: "The + means high impact: 6.35 mm steel ball at 150 ft/s, plus a 500 g pointed drop from 50 in. No mark, no protection.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12, hot: true,
  },
  {
    sku: "MVS-SG-SMK", name: "Safety Glasses — Smoke, Z87+", cat: "eye",
    price: 6.9, uom: "each", std: "ANSI/ISEA Z87.1 Z87+", osha: "1926.102(b)(1)",
    note: "Outdoor tint. Frame and lens both carry the mark — check both, that is where counterfeits fail.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12,
  },
  {
    sku: "MVS-GG-SEAL", name: "Sealed Safety Goggle — Indirect Vent", cat: "eye",
    price: 14.75, uom: "each", std: "ANSI/ISEA Z87.1 Z87+ D3", osha: "1926.102(a)(1)",
    note: "D3 splash rating. Required where grinding, cutting or chemical splash is present.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days",
  },

  // ---- hand --------------------------------------------------------------
  {
    sku: "MVS-GL-A4", name: "Cut-Resistant Glove — Level A4, PU Palm", cat: "hand",
    price: 8.2, uom: "pair", std: "ANSI/ISEA 105 Cut Level A4", osha: "1926.95(a)",
    note: "A4 is 1,500–2,199 g of cut resistance. The right default for sheet metal and stud handling.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12, hot: true,
  },
  {
    sku: "MVS-GL-A6", name: "Cut-Resistant Glove — Level A6, Nitrile", cat: "hand",
    price: 13.4, uom: "pair", std: "ANSI/ISEA 105 Cut Level A6", osha: "1926.95(a)",
    note: "A6 is 3,000–3,999 g. Glass handling, heavy gauge steel, demo.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12,
  },
  {
    sku: "MVS-GL-LEA", name: "Leather Driver Glove — Grain Cowhide", cat: "hand",
    price: 5.6, uom: "pair", std: "No cut rating claimed", osha: "1926.95(a)",
    note: "General handling only. If the task has a cut hazard, this is not the glove — and we will tell you so.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12,
  },

  // ---- hi-vis ------------------------------------------------------------
  {
    sku: "MVS-VS-C2", name: "Hi-Vis Vest — Class 2, Type R", cat: "hivis",
    price: 11.9, uom: "each", std: "ANSI/ISEA 107 Type R Class 2", osha: "1926.201(a)",
    note: "Class 2 for traffic under 50 mph and complex backgrounds. Type R = roadway.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 12, hot: true,
  },
  {
    sku: "MVS-VS-C3", name: "Hi-Vis Long-Sleeve — Class 3, Type R", cat: "hivis",
    price: 34.5, uom: "each", std: "ANSI/ISEA 107 Type R Class 3", osha: "1926.201(a)",
    note: "Class 3 required over 50 mph, poor visibility, or where the worker must be seen through a full range of motion.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days",
  },
  {
    sku: "MVS-VS-O1", name: "Hi-Vis Vest — Class 1, Type O", cat: "hivis",
    price: 9.4, uom: "each", std: "ANSI/ISEA 107 Type O Class 1", osha: "1926.95(a)",
    note: "Type O is off-road only. Not legal on a public right of way — a common and expensive mix-up.",
    fulfil: "dropship", supplier: "Bluegrass PPE Distributors", lead: "2–4 days", moq: 24,
  },

  // ---- fall --------------------------------------------------------------
  {
    sku: "MVS-FH-5PT", name: "Full Body Harness — 5-Point, Universal", cat: "fall",
    price: 118, uom: "each", std: "ANSI/ASSP Z359.11", osha: "1926.502(d)",
    note: "Arrest force limited to 1,800 lb, free fall limited to 6 ft, deceleration distance 3.5 ft.",
    fulfil: "dropship", supplier: "Ridgeline Fall Protection", lead: "4–6 days", hot: true,
  },
  {
    sku: "MVS-SRL-11", name: "Self-Retracting Lifeline — 11 ft, Class 2", cat: "fall",
    price: 268, uom: "each", std: "ANSI/ASSP Z359.14 Class 2", osha: "1926.502(d)(16)",
    note: "Class 2 permits up to 24 in arrest distance. Check clearance below before you spec any SRL.",
    fulfil: "dropship", supplier: "Ridgeline Fall Protection", lead: "4–6 days",
  },
  {
    sku: "MVS-LY-SA6", name: "Shock-Absorbing Lanyard — 6 ft, Double Leg", cat: "fall",
    price: 142, uom: "each", std: "ANSI/ASSP Z359.13", osha: "1926.502(d)(16)",
    note: "Needs 18.5 ft of clearance below the anchor. On a low roof this is the wrong product — use an SRL.",
    fulfil: "dropship", supplier: "Ridgeline Fall Protection", lead: "4–6 days",
  },
];

// ---- the fabricated hero -------------------------------------------------

export const ROOFSCREEN = {
  title: "Shop-Fabricated Roof Screen Frame",
  proof: "Lee Street",
  cost: 6000,
  bullets: [
    "Entire roof screen frame shop-fabricated to the project's basis of design",
    "Fabricated flat, delivered in labeled sections, set in one crane pick",
    "Galvanized structural framing with your specified infill",
    "Delegated design and sealed calculations by a licensed engineer, per the spec section",
  ],
  heights: [4, 6, 8, 10, 12],
  mounts: [
    { id: "curb", name: "Curb mount", note: "Fastened to a structural curb — least deflection" },
    { id: "sleeper", name: "Sleeper / rail", note: "Distributes load across the deck" },
    { id: "ballast", name: "Non-penetrating ballast", note: "No roof penetration; needs uplift calc" },
  ],
  infills: [
    { id: "louver", name: "Aluminum louver", adder: 42 },
    { id: "perf", name: "Perforated metal panel", adder: 31 },
    { id: "corr", name: "Corrugated panel", adder: 24 },
    { id: "frame", name: "Frame only", adder: 0 },
  ],
  baseLf: 88, // $/LF of frame before infill
};

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
