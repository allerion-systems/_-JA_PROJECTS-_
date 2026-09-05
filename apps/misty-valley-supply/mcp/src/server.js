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

/* ----------------------------------------------------------------- server */

export function buildServer() {
  const server = new McpServer(
    { name: "misty-valley-supply", version: "0.2.0" },
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
      out.warning =
        "29 ga is agricultural gauge panel — thinner, softer, and it dents. It must not be substituted against a " +
        "named 7.2 Rib basis of design; a specified screen expects 26 ga commercial panel. Use p29 only on unspecified, budget work.";
    }

    return ok(out);
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
    name: "misty-valley-supply", version: "0.2.0",
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
