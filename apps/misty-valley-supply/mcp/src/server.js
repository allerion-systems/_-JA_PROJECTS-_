#!/usr/bin/env node
/**
 * Misty Valley Supply — MCP server.
 *
 * Exposes the construction safety catalog to agents, with one tool nobody else
 * has: check_compliance, which answers "what does OSHA require for this hazard,
 * and what satisfies it" — because the catalog carries the standard and the
 * citation as structured data rather than marketing copy.
 *
 * Transport: stdio. Run with `node src/server.js`.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const HERE = dirname(fileURLToPath(import.meta.url));
export const CATALOG = JSON.parse(readFileSync(join(HERE, "..", "catalog.json"), "utf8"));

const {
  products: PRODUCTS, categories: CATEGORIES, roofscreen: RS,
  screen_parts: SCREEN_PARTS, classifieds: LISTINGS, sellers: SELLERS,
} = CATALOG;

/* ---------------------------------------------------------------- helpers */

const ok = (data) => ({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] });
const money = (n) => Math.round(n * 100) / 100;

/**
 * Hazard → the OSHA rule that governs it → the SKUs that satisfy it.
 * Keywords are matched against a free-text hazard description.
 */
const HAZARD_RULES = [
  {
    id: "fall-edge",
    words: ["fall", "edge", "leading edge", "roof", "unprotected", "height", "elevated", "parapet"],
    rule: "29 CFR 1926.501(b)(10) — roofing work on low-slope roofs",
    also: "1926.501(b)(1) — unprotected sides and edges at 6 ft or more",
    skus: ["MVS-RG-1000", "MVS-RG-BASE", "MVS-WL-600", "MVS-YG-10", "MVS-FH-5PT", "MVS-SRL-11"],
  },
  {
    id: "hole",
    words: ["hole", "opening", "skylight", "penetration", "shaft", "floor opening"],
    rule: "29 CFR 1926.501(b)(4) — holes",
    also: "1926.502(i) — covers must support twice the maximum intended load and be marked",
    skus: ["MVS-SKY-48", "MVS-HOLE-4", "MVS-RG-1000"],
  },
  {
    id: "head",
    words: ["head", "overhead", "falling object", "impact", "electrical", "crane", "hoisting"],
    rule: "29 CFR 1926.100(a) — head protection",
    also: "ANSI/ISEA Z89.1 — Type I crown only, Type II adds lateral impact",
    skus: ["MVS-HH-C1", "MVS-HH-T2V", "MVS-HH-BRIM"],
  },
  {
    id: "eye",
    words: ["eye", "grinding", "cutting", "chipping", "dust", "debris", "splash", "chemical", "welding", "sawing"],
    rule: "29 CFR 1926.102(a)(1) — eye and face protection",
    also: "1926.102(b)(1) — must comply with ANSI/ISEA Z87.1",
    skus: ["MVS-SG-CLR", "MVS-SG-SMK", "MVS-GG-SEAL"],
  },
  {
    id: "hand",
    words: ["hand", "cut", "laceration", "sharp", "sheet metal", "glass", "stud", "steel", "blade"],
    rule: "29 CFR 1926.95(a) — personal protective equipment",
    also: "ANSI/ISEA 105 — cut levels A1 through A9",
    skus: ["MVS-GL-A4", "MVS-GL-A6", "MVS-GL-LEA"],
  },
  {
    id: "hivis",
    words: ["traffic", "roadway", "highway", "visibility", "vehicle", "flagger", "night", "struck-by"],
    rule: "29 CFR 1926.201(a) — signaling and traffic control",
    also: "ANSI/ISEA 107 — Class 2 under 50 mph, Class 3 above or where motion matters. Type O is off-road only.",
    skus: ["MVS-VS-C2", "MVS-VS-C3", "MVS-VS-O1"],
  },
];

/** Product-specific cautions an honest supplier volunteers. */
const CAUTIONS = {
  "MVS-LY-SA6": "Requires about 18.5 ft of clearance below the anchor. On a low roof or a low anchor this does not clear — use a self-retracting lifeline instead.",
  "MVS-VS-O1": "Type O is off-road only. Not permitted on a public right of way.",
  "MVS-GL-LEA": "No cut rating claimed. If the task has a cut hazard this is the wrong glove.",
  "MVS-WL-600": "Warning lines alone are permitted only on low-slope roofs and only with the required setback and a safety monitor where applicable.",
  "MVS-HH-T2V": "Vented shells are commonly Class C (no electrical rating) unless the shell is marked otherwise. Read the mark.",
};

const parseHeight = (s = "") => {
  const m = String(s).match(/(\d+(?:\.\d+)?)\s*(?:ft|foot|feet|')/i);
  return m ? parseFloat(m[1]) : null;
};

const findProduct = (sku) =>
  PRODUCTS.find((p) => p.sku.toLowerCase() === String(sku).toLowerCase()) || null;

const DEFAULT_MARKUP_PCT = money(RS.defaultMarkup * 100); // 71.4 — realized on Lee Street

/**
 * Mirror of the storefront's canTakePayment (src/payments.ts). A listing may
 * take a protected payment only with a signed seller agreement AND a completed
 * Stripe Connect onboarding AND payouts enabled on the connected account.
 */
function canTakePayment(s) {
  if (!s.agreement) return { ok: false, why: "Seller has not signed the seller agreement" };
  if (!s.onboarded) return { ok: false, why: "Seller has not completed Stripe onboarding" };
  if (!s.payouts) return { ok: false, why: "Stripe has not enabled payouts on the seller account" };
  return { ok: true, why: "Protected payment available" };
}

const PAYMENT_NOTE =
  "Protected payment is authorize-then-capture: the buyer's card is authorized when the deal is agreed " +
  "(the hold lasts up to 7 days) and captured only when the buyer confirms pickup, at which point the funds " +
  "move directly to the seller's connected account. Misty Valley never holds the money.";

/** The 29 ga caution, volunteered on every quote and design that specs it. */
const GAUGE_29_WARNING =
  "29 ga is agricultural gauge panel — thinner, softer, and it dents. It must not be substituted against a " +
  "named 7.2 Rib basis of design; a specified screen expects 26 ga commercial panel. Use p29 only on unspecified, budget work.";

/* --------------------------------------------------- 5D BoM engine (bim) */
/*
 * Port of the storefront's src/bim.ts — the shared 5D core behind the Shed
 * and Deck designers. Every component is a typed element: an IFC (ISO 16739)
 * class for what it is, a quantity derived from the geometry, and a binding
 * to a real catalog SKU priced from catalog.json. Ported to plain JS line
 * for line; the math must match the app exactly.
 */

const productBySku = new Map(PRODUCTS.map((p) => [p.sku, p]));

/** Look a product up by SKU. Throws if a takeoff names a SKU that does not
    exist — a 5D model bound to a phantom SKU is a lie. Never price zero. */
function productOf(sku) {
  const p = productBySku.get(sku);
  if (!p) throw new Error(`unknown SKU ${sku} — not in catalog.json; run scripts/sync-catalog.js`);
  return p;
}

/** One typed element bound to a catalog SKU. Quantity in the product's own
    uom; price always read from the catalog. */
function el(ifcClass, name, sku, qty) {
  const p = productOf(sku);
  const q = Math.max(0, Math.ceil(qty)); // sell whole units — sticks, sheets, boxes
  return {
    ifcClass, name, sku, qty: q, unit: p.uom,
    unitPrice: p.price,
    ext: money(q * p.price),
  };
}

const rollup = (elements) => {
  const subtotal = money(elements.reduce((s, e) => s + e.ext, 0));
  return { subtotal, total: subtotal };
};

/** Members at a given on-center spacing across a run, plus the starter. */
const spaced = (runFt, ocIn) => Math.floor((runFt * 12) / ocIn) + 1;
/** 4×8 sheet goods: gross area / 32 sf, rounded up. Openings NOT deducted. */
const sheets = (areaSf) => Math.ceil(areaSf / 32);
/** Sticks of stock length needed to cover a linear-feet demand. */
const sticks = (lf, stockFt) => Math.ceil(lf / stockFt);
/** Sloped rafter length: run × slope factor for pitch:12, plus eave overhang. */
const rafterLen = (runFt, pitch, overhangFt = 1) =>
  runFt * Math.sqrt(1 + (pitch / 12) ** 2) + overhangFt;

// ---- shed ---------------------------------------------------------------

const SHED_DOOR = { w: 3, h: 6.83 };  // 3-0 × 6-10 shed door
const SHED_WIN = { w: 3, h: 4 };      // 3-0 × 4-0 window

function shedGeometry(p) {
  const run = p.widthFt / 2;
  const rise = run * (p.pitch / 12);
  const rafter = rafterLen(run, p.pitch);           // incl. 1 ft eave overhang
  const perimeter = 2 * (p.widthFt + p.lengthFt);
  const gableArea = 2 * 0.5 * p.widthFt * rise;     // both gable triangles
  const wallArea = perimeter * p.wallHFt + gableArea;
  const roofArea = 2 * rafter * p.lengthFt;         // both planes
  const openings = p.doors + p.windows;
  const openingArea = p.doors * SHED_DOOR.w * SHED_DOOR.h + p.windows * SHED_WIN.w * SHED_WIN.h;
  return { run, rise, rafter, perimeter, gableArea, wallArea, roofArea, openings, openingArea };
}

function shedTakeoff(p) {
  const g = shedGeometry(p);
  const out = [];

  // Floor: three PT 4×4 skid runs from 8-ft sticks; joists 16" o.c. + rims; OSB deck.
  out.push(el("IfcBeam", "PT 4×4 skid (3 runs × length)", "MVS-PT-448", 3 * sticks(p.lengthFt, 8)));
  const floorJoists = spaced(p.lengthFt, 16);
  out.push(el("IfcMember", 'Floor joist — PT 2×8, 16" o.c.', "MVS-PT-2812", floorJoists));
  out.push(el("IfcMember", "Rim joist — PT 2×8, both long edges", "MVS-PT-2812", 2 * sticks(p.lengthFt, 12)));
  out.push(el("IfcSlab", "Floor deck — 7/16 OSB", "MVS-OSB-716", sheets(p.widthFt * p.lengthFt)));

  // Walls: studs 16" o.c. per wall + 2 per opening; plates 3× perimeter; headers; sheathing; wrap.
  const fieldStuds =
    2 * spaced(p.lengthFt, 16) + 2 * spaced(p.widthFt, 16) + 2 * g.openings;
  out.push(el("IfcColumn", 'Wall stud — 2×4, 16" o.c. + opening framing', "MVS-STD-248", fieldStuds));
  out.push(el("IfcMember", "Wall plate — 2×4 (2 top, 1 bottom)", "MVS-STD-248", sticks(3 * g.perimeter, 8)));
  out.push(el("IfcBeam", "Opening header — doubled 2×4", "MVS-STD-248", g.openings));
  out.push(el("IfcWallStandardCase", "Wall sheathing — 7/16 OSB", "MVS-OSB-716", sheets(g.wallArea)));
  out.push(el("IfcCovering", "Housewrap — full wrap", "MVS-HW-Z90", Math.ceil(g.wallArea / 900)));

  // Openings as components — dropship parts, one per opening.
  out.push(el("IfcDoor", "Shed door — 3-0 × 6-10 prehung", "MVS-SC-DOOR3", p.doors));
  if (p.windows > 0) out.push(el("IfcWindow", "Shed window — 3×4 with J-trim", "MVS-SC-WIN34", p.windows));

  // Roof: trusses 24" o.c. OR rafter pairs 16" o.c. + ridge; sheathing; underlayment; drip edge.
  if (p.framing === "truss") {
    out.push(el("IfcElementAssembly", 'Gable truss — plated, 24" o.c.', "MVS-TR-G12", spaced(p.lengthFt, 24)));
  } else {
    const rafterPairs = spaced(p.lengthFt, 16);
    out.push(el("IfcMember", `Rafter — 2×4, ${p.pitch}:12, 16" o.c. (${rafterPairs} pairs)`, "MVS-STD-248", rafterPairs * 2));
    out.push(el("IfcBeam", "Ridge board — 2×4", "MVS-STD-248", sticks(p.lengthFt, 8)));
  }
  out.push(el("IfcRoof", "Roof sheathing — 7/16 OSB, both planes", "MVS-OSB-716", sheets(g.roofArea)));
  out.push(el("IfcCovering", "Synthetic underlayment", "MVS-RF-SYN10", Math.ceil(g.roofArea / 1000)));
  const dripLf = 2 * p.lengthFt + 4 * g.rafter;
  out.push(el("IfcCovering", "Drip edge — eaves + rakes", "MVS-RF-DE10", sticks(dripLf, 10)));
  if (p.roof === "metal")
    out.push(el("IfcCovering", "Metal roofing — 29-ga, cut to rafter length", "MVS-RF-MTL29", Math.ceil(g.roofArea / 100)));

  // Siding: net of openings — the one takeoff bought net, by the square.
  if (p.siding === "vinyl") {
    const netSq = Math.max(1, Math.ceil((g.wallArea - g.openingArea) / 100));
    out.push(el("IfcCovering", "Vinyl siding — net of openings", "MVS-SID-VD4", netSq));
  }

  // Fasteners: one 5-lb box per 350 sf of sheathed area, minimum 2.
  const sheathedSf = g.wallArea + g.roofArea + p.widthFt * p.lengthFt;
  out.push(el("IfcFastener", "Exterior screws — framing + sheathing", "MVS-FS-EX9",
    Math.max(2, Math.ceil(sheathedSf / 350))));

  // Dropship add-ons.
  if (p.ramp) out.push(el("IfcRamp", "Shed ramp — 4 ft, 1,000-lb rated", "MVS-SC-RAMP4", 1));
  if (p.loft) out.push(el("IfcSlab", "Loft kit — gable-end bays", "MVS-SC-LOFT8", Math.max(1, Math.ceil(p.lengthFt / 8) - 1)));
  if (p.cupola) out.push(el("IfcCovering", "Cupola — 24 in vented", "MVS-SC-CUP24", 1));

  return out;
}

// ---- deck ---------------------------------------------------------------

/** IRC R312.1.1: a guard is REQUIRED on any walking surface more than
    30 inches above grade. 2 ft = 24 in is the only optional case here. */
const guardRequired = (heightFt) => heightFt * 12 >= 30;

function deckGeometry(p) {
  const railing = p.railing || guardRequired(p.heightFt);
  const joists = spaced(p.widthFt, 16);                 // 2×8 @ 16" o.c., spanning depth
  const posts = Math.ceil(p.widthFt / 8) + 1;           // 6×6 under the beam, ≤ 8 ft apart
  const courses = Math.ceil((p.depthFt * 12) / 5.75);   // 5.5 in face + 1/4 in gap
  const guardLf = p.widthFt + 2 * p.depthFt;            // three open sides
  const risers = Math.ceil((p.heightFt * 12) / 7.5);    // ≤ 7-3/4 in per IRC R311.7.5.1
  const treads = Math.max(0, risers - 1);
  return { railing, joists, posts, courses, guardLf, risers, treads };
}

function deckTakeoff(p) {
  const g = deckGeometry(p);
  const out = [];

  // Structure: ledger, joists + hangers, rim, doubled beam, posts, bases, footings.
  out.push(el("IfcMember", "Ledger — PT 2×8, lagged to band per R507.9", "MVS-PT-2812", sticks(p.widthFt, 12)));
  out.push(el("IfcMember", 'Joist — PT 2×8, 16" o.c.', "MVS-PT-2812", g.joists));
  out.push(el("IfcMember", "Rim joist — PT 2×8, outer + sides", "MVS-PT-2812",
    sticks(p.widthFt, 12) + 2 * sticks(p.depthFt, 12)));
  out.push(el("IfcFastener", "Joist hanger — 2×8, at ledger", "MVS-HD-LUS28", g.joists));
  out.push(el("IfcBeam", "Beam — doubled PT 2×10", "MVS-PT-21012", 2 * sticks(p.widthFt, 12)));
  out.push(el("IfcColumn", "Post — PT 6×6, ≤ 8 ft o.c.", "MVS-PT-668", g.posts));
  out.push(el("IfcFastener", "Post base — 6×6, standoff, ZMAX", "MVS-HD-ABU66", g.posts));
  out.push(el("IfcSlab", "Footing — concrete mix, 3 bags/post", "MVS-CN-80", g.posts * 3));

  // Decking: 5/4×6 at 5.5 in exposure + 1/4 in gap; each course runs the width.
  out.push(el("IfcCovering", '5/4×6 decking — 5.5" exposure + gap', "MVS-PT-5412",
    g.courses * sticks(p.widthFt, 12)));

  // Guard (forced on at ≥ 30 in above grade — IRC R312.1.1).
  if (g.railing) {
    const guardPosts = Math.ceil(g.guardLf / 6) + 1;
    out.push(el("IfcRailing", "Guard post — PT 4×4 @ ≤ 6 ft", "MVS-PT-448", Math.ceil(guardPosts / 2)));
    out.push(el("IfcRailing", "Guard rail — PT 2×4, top + bottom", "MVS-PT-248", sticks(2 * g.guardLf, 8)));
    out.push(el("IfcRailing", 'Baluster — 2×2 @ <4" clear (R312.1.3)', "MVS-PT-BAL",
      Math.ceil((g.guardLf * 12) / 5.5)));
  }

  // Stairs: three cut stringers; two 5/4×6 courses per tread on a 36-in stair.
  if (p.stairs && g.treads > 0) {
    out.push(el("IfcMember", `Stair stringer — PT 2×10, ${g.risers} risers × 3`, "MVS-PT-21012", 3));
    out.push(el("IfcCovering", `Stair tread — 5/4×6 ×2 per tread (${g.treads} treads)`, "MVS-PT-5412",
      Math.ceil((g.treads * 2 * 3) / 12)));
  }

  // Fasteners: ledger structural screws per 12 ft (min 1); deck screws ≈ 3.5/sf.
  out.push(el("IfcFastener", "Structural screws — ledger + hardware", "MVS-FS-STR50",
    Math.max(1, Math.ceil(p.widthFt / 12))));
  const deckSf = p.widthFt * p.depthFt;
  out.push(el("IfcFastener", "Deck screws — 2 per board per joist", "MVS-FS-EX9",
    Math.max(1, Math.ceil((deckSf * 3.5) / 400))));

  return out;
}

const UNGATED_NOTE =
  "Materials pricing at catalog list — quoted freely to agents, no gate. Ordering still requires " +
  "create_quote → place_order with a PO number and explicit human approval.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A 10-digit US phone, with or without a leading 1 and any punctuation. */
const isUsPhone = (s) => {
  const digits = String(s ?? "").replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
};

/* ----------------------------------------------------------------- server */

export function buildServer() {
  const server = new McpServer(
    { name: "misty-valley-supply", version: "0.4.0" },
    { capabilities: { tools: {} } }
  );

  server.registerTool("search_products", {
    title: "Search the catalog",
    description:
      "Search Misty Valley Supply's construction safety catalog by free text, category, standard or price. " +
      "Text matches product name, SKU, the consensus standard and the OSHA citation.",
    inputSchema: {
      query: z.string().optional().describe("Free text: name, SKU, standard, or an OSHA cite like 1926.501"),
      category: z.enum(["roof", "guard", "head", "eye", "hand", "hivis", "fall"]).optional(),
      max_price: z.number().positive().optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
  }, async ({ query, category, max_price, limit = 20 }) => {
    const q = (query || "").toLowerCase().trim();
    const hits = PRODUCTS.filter((p) => {
      if (category && p.cat !== category) return false;
      if (max_price != null && p.price > max_price) return false;
      if (!q) return true;
      return `${p.name} ${p.sku} ${p.std} ${p.osha} ${p.note}`.toLowerCase().includes(q);
    }).slice(0, limit);

    return ok({
      count: hits.length,
      products: hits.map(({ sku, name, cat, price, uom, std, osha, fulfil, lead, moq }) => ({
        sku, name, category: cat, price, uom, standard: std, osha_cite: osha,
        fulfilment: fulfil, lead_time: lead, min_qty: moq ?? 1,
      })),
    });
  });

  server.registerTool("get_product", {
    title: "Get one product",
    description: "Full specification for a single SKU, including the standard it is built to, the OSHA rule that requires it, lead time, source and any caution.",
    inputSchema: { sku: z.string().describe("e.g. MVS-RG-1000") },
  }, async ({ sku }) => {
    const p = findProduct(sku);
    if (!p) return ok({ error: "not_found", sku, hint: "Call search_products to list valid SKUs." });
    return ok({
      ...p,
      standard: p.std, osha_cite: p.osha, min_qty: p.moq ?? 1,
      caution: CAUTIONS[p.sku] ?? null,
    });
  });

  server.registerTool("check_compliance", {
    title: "What does OSHA require for this hazard",
    description:
      "Given a jobsite hazard in plain language, return the governing OSHA citation and the catalog items that satisfy it, " +
      "with explicit cautions where a product would NOT be appropriate. This is advisory, not a substitute for a competent person's assessment.",
    inputSchema: {
      hazard: z.string().describe("e.g. 'unprotected edge, 24 ft above lower level'"),
      task: z.string().optional().describe("e.g. 'roof re-cover, 8 workers, 3 weeks'"),
    },
  }, async ({ hazard, task }) => {
    const text = `${hazard} ${task || ""}`.toLowerCase();
    const matched = HAZARD_RULES.filter((r) => r.words.some((w) => text.includes(w)));

    if (matched.length === 0) {
      return ok({
        matched: false,
        message: "No hazard keyword recognised. Describe the physical hazard (fall, hole, overhead, eye, cut, traffic).",
        recognised_hazards: HAZARD_RULES.map((r) => r.id),
      });
    }

    const height = parseHeight(hazard);
    const findings = matched.map((r) => ({
      hazard: r.id,
      requirement: r.rule,
      see_also: r.also,
      options: r.skus.map((s) => findProduct(s)).filter(Boolean).map((p) => ({
        sku: p.sku, name: p.name, standard: p.std, price: p.price, uom: p.uom,
        why: `Satisfies ${p.osha}`,
        caution: CAUTIONS[p.sku] ?? null,
      })),
    }));

    const warnings = [];
    if (height != null && height < 20) {
      warnings.push(
        `Stated height is ${height} ft. A 6 ft shock-absorbing lanyard needs roughly 18.5 ft of clearance below the anchor — ` +
        `verify fall clearance before selecting any personal fall arrest system, or use a self-retracting lifeline.`
      );
    }
    if (matched.some((m) => m.id === "fall-edge")) {
      warnings.push("Guardrail is passive protection and does not depend on worker behaviour. Prefer it over PFAS where the geometry allows.");
    }

    return ok({
      matched: true, input: { hazard, task: task ?? null, parsed_height_ft: height },
      findings, warnings,
      disclaimer: "Advisory only. Fall protection selection requires a competent person and a site-specific clearance calculation.",
    });
  });

  server.registerTool("quote_roofscreen", {
    title: "Budget a shop-fabricated roof screen",
    description:
      "Cost build-up and sell price for a shop-fabricated roof screen, anchored on the real Lee Street job " +
      `(${RS.lee.lf} LF at ${RS.lee.height} ft: $${RS.lee.frameCost.toLocaleString()} frame + ~$${RS.lee.panelCost.toLocaleString()} panel, sold $${RS.lee.sell.toLocaleString()}). ` +
      "Not a firm quote — a firm number needs the roof plan, equipment schedule and wind load.",
    inputSchema: {
      lf: z.number().positive().describe("Linear feet of screen"),
      heightFt: z.number().refine((v) => RS.heights.includes(v), { message: `heightFt must be one of ${RS.heights.join(", ")}` }),
      panel: z.enum(["p26", "p29", "perf", "none"]).optional().describe("Panel: p26 (26 ga rib, spec grade), p29 (29 ga, agricultural), perf (perforated), none (frame only)"),
      mount: z.enum(["base", "sleeper", "ballast"]).optional().describe("Mounting: square base support (Lee Street), sleeper/rail, or non-penetrating ballast"),
      includeDrawings: z.boolean().optional().describe("Include shop drawings and sealed calculations as their own line (default true)"),
      markupPct: z.number().min(0).max(300).optional().describe(`Markup percent on cost (default ${DEFAULT_MARKUP_PCT}, the realized Lee Street markup)`),
    },
  }, async ({ lf, heightFt, panel = "p26", mount = "base", includeDrawings = true, markupPct = DEFAULT_MARKUP_PCT }) => {
    const pan = RS.panels.find((p) => p.id === panel);
    const mnt = RS.mounts.find((m) => m.id === mount);

    const frameRate = money(RS.frameCostLf.base + RS.frameCostLf.perFtHeight * heightFt);
    const framePackage = money(frameRate * lf);
    const mountAdder = money(mnt.adder * lf);
    const screenSf = money(lf * heightFt);
    const panelCost = money(pan.costSf * screenSf);
    const drawings = includeDrawings ? money(RS.shopDrawings.base + RS.shopDrawings.perLf * lf) : 0;

    const totalCost = money(framePackage + mountAdder + panelCost + drawings);
    const sell = money(totalCost * (1 + markupPct / 100));
    const gmPct = sell > 0 ? money(((sell - totalCost) / sell) * 100) : 0;

    const out = {
      spec: { lf, heightFt, panel: pan.name, mount: mnt.name, includeDrawings, markupPct },
      costs: {
        frame_package: {
          rate_per_lf: frameRate, amount: framePackage,
          includes: "posts, rails, kickers, square base supports, hat channel and fasteners — shop-fabricated and labeled",
        },
        mount_adder: { mount: mnt.name, rate_per_lf: mnt.adder, amount: mountAdder, note: mnt.note },
        panel: { id: pan.id, name: pan.name, cost_per_sf: pan.costSf, screen_sf: screenSf, amount: panelCost },
        shop_drawings: includeDrawings
          ? { base: RS.shopDrawings.base, per_lf: RS.shopDrawings.perLf, amount: drawings, note: RS.shopDrawings.note }
          : { amount: 0, note: "Excluded — required for a substitution against a named basis of design." },
      },
      totalCost, sell, gmPct,
      basis_of_design: RS.bod,
      proof:
        `Reference project ${RS.proof}: ${RS.lee.lf} LF at ${RS.lee.height} ft — frame $${RS.lee.frameCost.toLocaleString()}, ` +
        `panel ~$${RS.lee.panelCost.toLocaleString()}, sold for $${RS.lee.sell.toLocaleString()}.`,
      firm_quote_requires: ["roof plan", "equipment schedule", "wind load / design pressures"],
      substitution_notice:
        "Where a specification names a manufacturer as basis of design, a shop-fabricated alternate is a formal substitution request " +
        "to the architect, submitted with drawings and sealed calculations before buyout.",
    };

    if (panel === "p29") {
      out.warning = GAUGE_29_WARNING;
    }

    return ok(out);
  });

  server.registerTool("design_screen_from_bod", {
    title: "Design a roof screen from a basis of design",
    description:
      "The Design Center's agent surface: given the spec's basis-of-design line and the screen geometry, return a " +
      "complete design package — member schedule, itemized cost build-up, sell price at markup, and the equal-to-BoD " +
      "statement carried on the substitution request. Pure computation from the catalog; nothing is submitted or sent.",
    inputSchema: {
      bod_text: z.string().describe("The spec's basis-of-design line, e.g. 'RoofScreen SC3 frame with 7.2 Rib panel'"),
      length_lf: z.number().positive().describe("Linear feet of screen"),
      height_ft: z.number().refine((v) => RS.heights.includes(v), { message: `height_ft must be one of ${RS.heights.join(", ")}` }),
      bay_ft: z.number().positive().optional().describe(`Post spacing in feet (default ${RS.lee.bay}, the Lee Street bay)`),
      gauge: z.enum(["26", "29"]).optional().describe("Panel gauge: 26 (commercial, spec grade) or 29 (agricultural). Default 26."),
      frame_only: z.boolean().optional().describe("Frame package only — panel supplied or reused by others"),
      markup: z.number().min(0).max(1).optional().describe(`Markup on cost as a fraction (default ${RS.defaultMarkup}, the realized Lee Street markup)`),
    },
  }, async ({ bod_text, length_lf, height_ft, bay_ft = RS.lee.bay, gauge = "26", frame_only = false, markup = RS.defaultMarkup }) => {
    const pan = RS.panels.find((p) => p.id === `p${gauge}`);
    const hw = RS.hardware;

    const frameRate = money(RS.frameCostLf.base + RS.frameCostLf.perFtHeight * height_ft);
    const framePackage = money(frameRate * length_lf);

    const screenSf = money(length_lf * height_ft);
    const panelCost = frame_only ? 0 : money(pan.costSf * screenSf);

    const hatRows = hw.hatRowsByHeight[height_ft];
    const hatLf = money(hatRows * length_lf);
    const hatCost = money(hatLf * hw.hatChannelLf);

    const bays = Math.ceil(length_lf / bay_ft);
    const bases = bays + 1; // one base per post, posts at each bay line plus the end
    const baseCost = money(bases * hw.baseEach);

    const screws = frame_only ? 0 : Math.ceil(length_lf);
    const screwCost = frame_only ? 0 : money(length_lf * hw.screwsPerLf);

    const drawings = money(RS.shopDrawings.base + RS.shopDrawings.perLf * length_lf);

    const totalCost = money(framePackage + panelCost + hatCost + baseCost + screwCost + drawings);
    const sell = money(totalCost * (1 + markup));
    const gmPct = sell > 0 ? money(((sell - totalCost) / sell) * 100) : 0;

    const schedule = [
      { mark: "P1", member: "Screen frame — 3-member galvanized round tube (SC3 equal)", size: `${height_ft} ft above deck, ${bay_ft} ft bay`, qty: length_lf, unit: "LF" },
      { mark: "B1", member: "Square base support, adjustable for roof slope", size: "one per post", qty: bases, unit: "EA" },
      { mark: "H1", member: "Hat channel, 20 ga galvanized", size: `${hatRows} rows behind panel`, qty: hatLf, unit: "LF" },
    ];
    if (!frame_only) {
      schedule.push(
        { mark: "S1", member: pan.name, size: `7.2 in module, ${pan.ga} ga`, qty: screenSf, unit: "SF" },
        { mark: "F1", member: "Panel screw, #12 self-drill, bonded washer, painted head", size: "color matched", qty: screws, unit: "EA" },
      );
    }
    schedule.push({ mark: "D1", member: "Shop drawings and sealed calculations (MVS-RSE-SHP)", size: "per project", qty: 1, unit: "LOT" });

    const out = {
      config: { bod_text, length_lf, height_ft, bay_ft, gauge, frame_only, markup },
      member_schedule: schedule,
      costs: {
        frame_package: { rate_per_lf: frameRate, amount: framePackage, includes: "posts, rails and kickers — shop-fabricated, cut and labeled" },
        panel: frame_only
          ? { amount: 0, note: "Frame only — panel supplied or reused by others." }
          : { gauge: pan.ga, name: pan.name, cost_per_sf: pan.costSf, screen_sf: screenSf, amount: panelCost },
        hat_channel: { rows: hatRows, lf: hatLf, cost_per_lf: hw.hatChannelLf, amount: hatCost },
        bases: { bays, count: bases, cost_each: hw.baseEach, amount: baseCost },
        screws: frame_only
          ? { count: 0, amount: 0, note: "Panel screws travel with the panel — excluded on a frame-only package." }
          : { count: screws, cost_per_lf: hw.screwsPerLf, amount: screwCost },
        shop_drawings: { base: RS.shopDrawings.base, per_lf: RS.shopDrawings.perLf, amount: drawings, note: RS.shopDrawings.note },
      },
      totalCost, sell, gmPct,
      basis_of_design: RS.bod,
      equal_to_bod:
        `furnished as an equal to: ${bod_text}; formal substitution submitted to the architect with ` +
        "shop drawings and sealed calculations — MVS-RSE-SHP",
    };

    if (gauge === "29") {
      out.warning = GAUGE_29_WARNING;
    }

    return ok(out);
  });

  server.registerTool("design_shed", {
    title: "Design a gable storage shed",
    description:
      "Full 5D takeoff for a gable storage shed — the same BoM engine as the storefront's Shed Designer. " +
      "Returns every element (IFC class, catalog SKU, quantity, unit price, extension), the materials total, " +
      "and a summary. Pricing is ungated for agents; ordering still requires human approval via place_order.",
    inputSchema: {
      widthFt: z.number().refine((v) => [8, 10, 12].includes(v), { message: "widthFt must be one of 8, 10, 12" }),
      lengthFt: z.number().refine((v) => Number.isInteger(v) && v >= 8 && v <= 24 && v % 2 === 0,
        { message: "lengthFt must be an even integer from 8 to 24" }),
      wallHFt: z.number().refine((v) => [7, 8].includes(v), { message: "wallHFt must be one of 7, 8" }).optional()
        .describe("Wall height in feet: 7 or 8 (default 8)"),
      pitch: z.number().refine((v) => [4, 6].includes(v), { message: "pitch must be one of 4, 6" }).optional()
        .describe("Roof pitch, rise in 12: 4 or 6 (default 4)"),
      doors: z.number().refine((v) => [1, 2].includes(v), { message: "doors must be 1 or 2" }).optional(),
      windows: z.number().int().min(0).max(2).optional().describe("0–2 windows (default 0)"),
      siding: z.enum(["vinyl", "none"]).optional().describe("Siding: vinyl (default) or none (sheathing + wrap only)"),
      roof: z.enum(["ready", "metal"]).optional().describe("ready = sheathed + underlayment, roofing by others (default); metal = 29-ga panels added"),
      framing: z.enum(["stick", "truss"]).optional().describe('stick = rafters 16" o.c. + ridge (default); truss = plated gable trusses 24" o.c.'),
      ramp: z.boolean().optional().describe("Add a 4-ft 1,000-lb ramp kit"),
      loft: z.boolean().optional().describe("Add gable-end loft kit(s)"),
      cupola: z.boolean().optional().describe("Add a 24-in vented cupola"),
    },
  }, async ({ widthFt, lengthFt, wallHFt = 8, pitch = 4, doors = 1, windows = 0,
              siding = "vinyl", roof = "ready", framing = "stick",
              ramp = false, loft = false, cupola = false }) => {
    const params = { widthFt, lengthFt, wallHFt, pitch, doors, windows, siding, roof, framing, ramp, loft, cupola };
    const elements = shedTakeoff(params);
    const { total } = rollup(elements);
    const addons = [ramp && "ramp", loft && "loft", cupola && "cupola"].filter(Boolean);
    const summary =
      `A ${widthFt}×${lengthFt} ft gable shed with ${wallHFt} ft walls at a ${pitch}:12 pitch, ` +
      `${framing}-framed on PT skids, with ${doors} door${doors > 1 ? "s" : ""} and ${windows} window${windows === 1 ? "" : "s"}, ` +
      `${siding === "vinyl" ? "vinyl siding over housewrap" : "sheathed and wrapped, siding by others"}, ` +
      `${roof === "metal" ? "29-ga metal roofing over synthetic underlayment" : "roof-ready (sheathed + underlayment, roofing by others)"}` +
      `${addons.length ? `, plus ${addons.join(", ")}` : ""}. ` +
      `${elements.length} line items; materials total $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })} at catalog list. ` +
      "Quantities per the storefront's 5D BoM engine (bim.ts): studs and rafters counted at framing spacing, sheet goods gross, siding net of openings.";
    return ok({ design: params, elements, materials_total: total, summary, note: UNGATED_NOTE });
  });

  server.registerTool("design_deck", {
    title: "Design a ledger-hung deck",
    description:
      "Full 5D takeoff for a ledger-hung PT deck per IRC R507 — the same BoM engine as the storefront's Deck " +
      "Designer. Returns every element (IFC class, catalog SKU, quantity, unit price, extension), the materials " +
      "total, and a summary. A guard is FORCED on at 30 in or more above grade (IRC R312.1.1) regardless of the " +
      "railing input. Pricing is ungated for agents; ordering still requires human approval via place_order.",
    inputSchema: {
      widthFt: z.number().int().min(10).max(20).describe("Width along the house, 10–20 ft"),
      depthFt: z.number().int().min(8).max(16).describe("Depth out from the house, 8–16 ft"),
      heightFt: z.number().refine((v) => [2, 4, 8].includes(v), { message: "heightFt must be one of 2, 4, 8" }),
      railing: z.boolean().optional().describe("Guard rail on the three open sides. Forced true at ≥ 30 in above grade (IRC R312.1.1)."),
      stairs: z.boolean().optional().describe("Cut-stringer stair to grade (default false)"),
    },
  }, async ({ widthFt, depthFt, heightFt, railing = false, stairs = false }) => {
    const forced = !railing && guardRequired(heightFt);
    const params = { widthFt, depthFt, heightFt, railing: railing || guardRequired(heightFt), stairs };
    const elements = deckTakeoff(params);
    const { total } = rollup(elements);
    const summary =
      `A ${widthFt}×${depthFt} ft pressure-treated deck ${heightFt} ft above grade, ledger-hung per IRC R507: ` +
      `2×8 joists 16" o.c. on a doubled 2×10 beam over 6×6 posts, 5/4×6 decking` +
      `${params.railing ? `, guarded on the three open sides per IRC R312.1.1${forced ? " (guard forced on — the surface is ≥ 30 in above grade)" : ""}` : ", no guard (below the 30-in R312.1.1 threshold)"}` +
      `${stairs ? ", with a cut-stringer stair to grade" : ""}. ` +
      `${elements.length} line items; materials total $${total.toLocaleString("en-US", { minimumFractionDigits: 2 })} at catalog list. ` +
      "Quantities per the storefront's 5D BoM engine (bim.ts).";
    const out = { design: params, elements, materials_total: total, summary, note: UNGATED_NOTE };
    if (forced) {
      out.railing_forced =
        "railing was requested off, but IRC R312.1.1 requires a guard on any walking surface more than 30 in above grade — it has been included.";
    }
    return ok(out);
  });

  server.registerTool("submit_design_request", {
    title: "Submit a design request",
    description:
      "Send a roof screen design request to the Design Center. REQUIRES sms_consent, a valid email and a 10-digit US " +
      "phone — a fabricator follows up by email and text, and consent is not inferred. Returns a design-request id. " +
      "Nothing is transmitted by this tool; the counter follows up.",
    inputSchema: {
      bod_text: z.string().describe("The spec's basis-of-design line"),
      length_lf: z.number().positive(),
      height_ft: z.number().positive(),
      contact: z.object({
        name: z.string(),
        company: z.string(),
        email: z.string(),
        phone: z.string(),
      }),
      sms_consent: z.boolean().describe("Must be true, set by a person — the follow-up arrives by text"),
      files: z.array(z.object({
        name: z.string(), size: z.number(), type: z.string(),
      })).optional().describe("Metadata only for attached plan pages — no file content"),
      notes: z.string().optional(),
    },
  }, async ({ bod_text, length_lf, height_ft, contact, sms_consent, files, notes }) => {
    const missing = [];
    if (!sms_consent) missing.push({ field: "sms_consent", why: "The fabricator follows up by text; consent must be true, set by a person, not inferred." });
    if (!EMAIL_RE.test(contact.email)) missing.push({ field: "contact.email", why: `'${contact.email}' is not a valid email address.` });
    if (!isUsPhone(contact.phone)) missing.push({ field: "contact.phone", why: `'${contact.phone}' is not a 10-digit US phone number.` });

    if (missing.length) {
      return ok({
        status: "refused", reason: "consent_or_contact_invalid",
        message: "Design requests are not submitted without SMS consent and reachable contact details. Fix the fields listed and resubmit.",
        missing,
      });
    }

    return ok({
      status: "received",
      request_id: `D-${String(Math.floor(1000 + Math.random() * 9000))}`,
      request: {
        bod_text, length_lf, height_ft, contact, sms_consent,
        files: (files ?? []).map(({ name, size, type }) => ({ name, size, type })),
        notes: notes ?? null,
      },
      note: "A Misty Valley fabricator follows up by email and text with the design package and substitution paperwork. " +
        "Nothing has gone out yet — the counter follows up; this tool sends no messages.",
    });
  });

  server.registerTool("get_screen_parts", {
    title: "Roof screen parts, by the piece",
    description:
      "The roof screen bill of materials, sold as a kit or by the piece. Returns unit cost and sell price at the " +
      `given markup (default ${DEFAULT_MARKUP_PCT}%, the realized Lee Street markup).`,
    inputSchema: {
      markupPct: z.number().min(0).max(300).optional().describe(`Markup percent applied to unit cost (default ${DEFAULT_MARKUP_PCT})`),
    },
  }, async ({ markupPct = DEFAULT_MARKUP_PCT }) => ok({
    markupPct,
    count: SCREEN_PARTS.length,
    parts: SCREEN_PARTS.map((p) => ({
      sku: p.sku, name: p.name, uom: p.uom,
      unit_cost: p.cost, unit_sell: money(p.cost * (1 + markupPct / 100)),
      in_kit: p.kit, note: p.note,
    })),
  }));

  server.registerTool("get_seller_status", {
    title: "Can this seller take protected payment",
    description:
      "Marketplace seller gating for The Yard. A listing may take a protected payment only when the seller has a " +
      "signed seller agreement, has completed Stripe Connect onboarding, and has payouts enabled. Returns the verdict and the reason.",
    inputSchema: { seller: z.string().describe("Seller name exactly as it appears on a listing, e.g. 'Hardin Interiors LLC'") },
  }, async ({ seller }) => {
    const key = Object.keys(SELLERS).find((k) => k.toLowerCase() === String(seller).toLowerCase().trim());
    if (!key) {
      return ok({ error: "not_found", seller, known_sellers: Object.keys(SELLERS) });
    }
    const s = SELLERS[key];
    const verdict = canTakePayment(s);
    return ok({
      seller: key,
      agreement: s.agreement, onboarded: s.onboarded, payouts: s.payouts,
      since: s.since, deals: s.deals,
      protected_payment: verdict.ok,
      reason: verdict.why,
      payment_note: PAYMENT_NOTE,
    });
  });

  server.registerTool("create_quote", {
    title: "Price an order",
    description: "Price a set of catalog lines. Honours minimum order quantities. Returns a dated quote — it does not place an order.",
    inputSchema: {
      lines: z.array(z.object({ sku: z.string(), qty: z.number().int().positive() })).min(1),
      job: z.string().optional(),
      ship_to: z.string().optional(),
    },
  }, async ({ lines, job, ship_to }) => {
    const priced = [], problems = [];
    for (const l of lines) {
      const p = findProduct(l.sku);
      if (!p) { problems.push({ sku: l.sku, error: "not_found" }); continue; }
      const min = p.moq ?? 1;
      const qty = Math.max(l.qty, min);
      if (qty !== l.qty) problems.push({ sku: p.sku, note: `Quantity raised to the minimum of ${min}.` });
      priced.push({
        sku: p.sku, name: p.name, qty, uom: p.uom, unit_price: p.price,
        extended: money(p.price * qty), lead_time: p.lead, source: p.supplier, osha_cite: p.osha,
      });
    }
    const subtotal = money(priced.reduce((s, l) => s + l.extended, 0));
    const expiry = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
    return ok({
      quote_id: `Q-${Date.now().toString(36).toUpperCase()}`,
      job: job ?? null, ship_to: ship_to ?? null,
      lines: priced, subtotal_usd: subtotal,
      freight: "Quoted separately by ship-to address.",
      valid_until: expiry, problems: problems.length ? problems : null,
      next_step: "place_order requires a purchase order number and explicit human approval.",
    });
  });

  server.registerTool("place_order", {
    title: "Place an order",
    description:
      "Convert a quote into an order. REQUIRES a purchase order number and explicit human approval — " +
      "an agent may request this but a person must authorise it. Never auto-execute.",
    inputSchema: {
      quote_id: z.string(),
      po_number: z.string().describe("Customer purchase order number — required"),
      human_approved: z.boolean().describe("Must be true, set by a person, not inferred"),
      approver: z.string().optional(),
    },
  }, async ({ quote_id, po_number, human_approved, approver }) => {
    if (!human_approved) {
      return ok({
        status: "refused", reason: "human_approval_required",
        message: "Orders are not placed by agents. A person must approve with a PO number.",
        quote_id,
      });
    }
    return ok({
      status: "accepted_pending_confirmation",
      order_id: `SO-${Date.now().toString(36).toUpperCase()}`,
      quote_id, po_number, approver: approver ?? "unnamed",
      note: "Prototype. No payment is taken and no supplier PO is issued.",
    });
  });

  server.registerTool("list_classifieds", {
    title: "Browse The Yard",
    description:
      "Construction classifieds — surplus material, equipment, crews, trucks and wanted ads. Each listing reports " +
      "whether protected payment is available for its seller (see get_seller_status). Read-only.",
    inputSchema: {
      kind: z.enum(["Equipment", "Surplus", "Crews", "Trucks", "Tools", "Wanted"]).optional(),
      query: z.string().optional(),
      limit: z.number().int().min(1).max(50).optional(),
    },
  }, async ({ kind, query, limit = 20 }) => {
    const q = (query || "").toLowerCase();
    const hits = LISTINGS.filter((l) =>
      (!kind || l.kind === kind) &&
      (!q || `${l.title} ${l.body} ${l.where} ${l.who}`.toLowerCase().includes(q))
    ).slice(0, limit);
    return ok({
      count: hits.length,
      listings: hits.map((l) => {
        const s = SELLERS[l.who];
        return { ...l, protectedPayment: s ? canTakePayment(s).ok : false };
      }),
      payment_note: PAYMENT_NOTE,
    });
  });

  server.registerTool("get_offer_manifest", {
    title: "Offer manifest",
    description: "Machine-readable description of who this seller is, what they sell, where they ship and how ordering works.",
    inputSchema: {},
  }, async () => ok({
    name: "misty-valley-supply", version: "0.4.0",
    seller: CATALOG.seller,
    catalog_lines: PRODUCTS.length,
    screen_parts: SCREEN_PARTS.length,
    categories: CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
    fulfilment: ["dropship", "fabricate"],
    ships: "US, Canada, Mexico — quote for rest of world",
    standards_indexed: ["ANSI/ISEA Z87.1", "ANSI/ISEA Z89.1", "ANSI/ISEA 105",
                        "ANSI/ISEA 107", "ANSI/ASSP Z359", "OSHA 29 CFR 1926 subpart M"],
    ordering: { requires_human_po: true, auto_execute: false },
    differentiator: "Every line carries the consensus standard and the OSHA citation as structured data. Call check_compliance.",
  }));

  return server;
}

/* ------------------------------------------------------------------- main */

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("misty-valley-supply MCP server ready on stdio\n");
}
