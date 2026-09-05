#!/usr/bin/env node
/**
 * End-to-end smoke test.
 *
 * Spawns the real server over stdio with a real MCP client, lists the tools,
 * calls every one of them, and asserts on the results. If this passes, the
 * server works — not "compiles", works.
 *
 *   node src/smoke.js
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const SERVER = join(HERE, "server.js");

let pass = 0;
const fails = [];

function check(label, cond, detail) {
  if (cond) { pass++; console.log(`  [32m✓[0m ${label}`); }
  else { fails.push(label); console.log(`  [31m✗[0m ${label}${detail ? ` — ${detail}` : ""}`); }
}

const parse = (res) => JSON.parse(res.content[0].text);

const main = async () => {
  const transport = new StdioClientTransport({ command: process.execPath, args: [SERVER] });
  const client = new Client({ name: "smoke", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);

  console.log("\n[1mmisty-valley-supply — MCP smoke test[0m\n");

  // --- tool discovery ----------------------------------------------------
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  console.log("tools:", names.join(", "), "\n");

  const expected = ["check_compliance", "create_quote", "get_offer_manifest", "get_product",
                    "get_screen_parts", "get_seller_status", "list_classifieds", "place_order",
                    "quote_roofscreen", "search_products"];
  check("all 10 tools registered", expected.every((n) => names.includes(n)), names.join(","));
  check("every tool has a description", tools.every((t) => (t.description || "").length > 20));

  // --- search ------------------------------------------------------------
  const s1 = parse(await client.callTool({ name: "search_products", arguments: { query: "1926.501" } }));
  check("search by OSHA cite returns hits", s1.count > 0, `count=${s1.count}`);

  const s2 = parse(await client.callTool({ name: "search_products", arguments: { category: "eye" } }));
  check("category filter works", s2.count === 3, `eye count=${s2.count}`);
  check("results carry the standard", s2.products.every((p) => p.standard?.includes("Z87")));

  const s3 = parse(await client.callTool({ name: "search_products", arguments: { max_price: 10 } }));
  check("price ceiling respected", s3.products.every((p) => p.price <= 10));

  // --- get_product -------------------------------------------------------
  const g1 = parse(await client.callTool({ name: "get_product", arguments: { sku: "MVS-LY-SA6" } }));
  check("get_product returns the caution", (g1.caution || "").includes("18.5"), g1.caution);

  const g2 = parse(await client.callTool({ name: "get_product", arguments: { sku: "NOPE-000" } }));
  check("unknown SKU fails gracefully", g2.error === "not_found");

  // --- check_compliance (the differentiator) ------------------------------
  const c1 = parse(await client.callTool({
    name: "check_compliance",
    arguments: { hazard: "unprotected edge, 24 ft above lower level", task: "roof re-cover, 8 workers" },
  }));
  check("compliance matches the fall hazard", c1.matched === true);
  check("returns an OSHA citation", /1926\.501/.test(JSON.stringify(c1.findings)));
  check("offers guardrail as an option", JSON.stringify(c1.findings).includes("MVS-RG-1000"));
  check("carries a disclaimer", (c1.disclaimer || "").length > 20);

  const c2 = parse(await client.callTool({
    name: "check_compliance", arguments: { hazard: "fall from 12 ft leading edge" },
  }));
  check("parses stated height", c2.input.parsed_height_ft === 12, String(c2.input.parsed_height_ft));
  check("warns on fall clearance under 20 ft", c2.warnings.some((w) => w.includes("18.5")));

  const c3 = parse(await client.callTool({
    name: "check_compliance", arguments: { hazard: "grinding sparks and metal debris" },
  }));
  check("eye hazard maps to 1926.102", JSON.stringify(c3.findings).includes("1926.102"));

  const c4 = parse(await client.callTool({ name: "check_compliance", arguments: { hazard: "asdfqwer" } }));
  check("unknown hazard degrades safely", c4.matched === false && Array.isArray(c4.recognised_hazards));

  // --- roof screen (the Lee Street model) --------------------------------
  // Lee Street itself: 156 LF at 3'-6", 26 ga panel, base mount, drawings on.
  const r1 = parse(await client.callTool({
    name: "quote_roofscreen",
    arguments: { lf: 156, heightFt: 3.5, panel: "p26", mount: "base", includeDrawings: true },
  }));
  check("frame package hits the Lee Street anchor (~$6,006)",
    Math.abs(r1.costs.frame_package.amount - 6006) < 0.01, `$${r1.costs.frame_package.amount}`);
  check("frame rate is 14 + 7h = $38.50/LF at 3.5 ft",
    Math.abs(r1.costs.frame_package.rate_per_lf - 38.5) < 0.001, String(r1.costs.frame_package.rate_per_lf));
  check("panel lands near the real ~$1,000 (26 ga × 546 SF)",
    Math.abs(r1.costs.panel.amount - 1010.10) < 0.01, `$${r1.costs.panel.amount}`);
  check("base mount carries no adder", r1.costs.mount_adder.amount === 0);
  check("drawings line is 850 + 3.25/LF",
    Math.abs(r1.costs.shop_drawings.amount - (850 + 3.25 * 156)) < 0.01, `$${r1.costs.shop_drawings.amount}`);
  check("totalCost is the sum of the build-up",
    Math.abs(r1.totalCost - (r1.costs.frame_package.amount + r1.costs.mount_adder.amount +
      r1.costs.panel.amount + r1.costs.shop_drawings.amount)) < 0.01, `$${r1.totalCost}`);
  check("sell applies the default 71.4% markup",
    Math.abs(r1.sell - Math.round(r1.totalCost * 1.714 * 100) / 100) < 0.01, `$${r1.sell}`);
  check("gmPct is consistent with cost and sell",
    Math.abs(r1.gmPct - ((r1.sell - r1.totalCost) / r1.sell) * 100) < 0.1, String(r1.gmPct));
  check("spec-grade 26 ga panel carries no gauge warning", r1.warning === undefined);
  check("includes the substitution notice", (r1.substitution_notice || "").includes("substitution"));

  // 29 ga is agricultural gauge — the quote must say so, unprompted.
  const r2 = parse(await client.callTool({
    name: "quote_roofscreen", arguments: { lf: 156, heightFt: 3.5, panel: "p29" },
  }));
  check("p29 quote carries the gauge warning", typeof r2.warning === "string" && r2.warning.length > 20);
  check("warning names agricultural gauge and the 7.2 Rib basis of design",
    /agricultural/i.test(r2.warning || "") && /7\.2 Rib/.test(r2.warning || ""), r2.warning);
  check("29 ga is cheaper than 26 ga", r2.totalCost < r1.totalCost, `${r2.totalCost} vs ${r1.totalCost}`);

  // Frame only, no drawings, custom markup.
  const r3 = parse(await client.callTool({
    name: "quote_roofscreen",
    arguments: { lf: 100, heightFt: 6, panel: "none", mount: "ballast", includeDrawings: false, markupPct: 50 },
  }));
  check("frame-only quote has zero panel cost", r3.costs.panel.amount === 0);
  check("drawings can be excluded", r3.costs.shop_drawings.amount === 0);
  check("ballast mount adds $14/LF", Math.abs(r3.costs.mount_adder.amount - 1400) < 0.01);
  check("custom markup honoured", Math.abs(r3.sell - r3.totalCost * 1.5) < 0.01, `$${r3.sell}`);

  const r4 = parse(await client.callTool({
    name: "quote_roofscreen", arguments: { lf: 156, heightFt: 6, panel: "p26" },
  }));
  check("taller screen costs more", r4.totalCost > r1.totalCost, `${r4.totalCost} vs ${r1.totalCost}`);

  // An invalid enum value must come back as a structured error result the agent
  // can read and correct — not a thrown exception, and never a silent default.
  let bad;
  try {
    bad = await client.callTool({ name: "quote_roofscreen", arguments: { lf: 100, heightFt: 7 } });
  } catch (e) {
    bad = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] };
  }
  check("invalid height is rejected", bad.isError === true);
  check("rejection names the allowed values",
    /heightFt/.test(bad.content?.[0]?.text ?? "") && /3\.5, 4, 6, 8, 10, 12/.test(bad.content?.[0]?.text ?? ""),
    bad.content?.[0]?.text);

  // --- screen parts ------------------------------------------------------
  const sp1 = parse(await client.callTool({ name: "get_screen_parts", arguments: {} }));
  check("all 8 screen parts listed", sp1.count === 8 && sp1.parts.length === 8, String(sp1.count));
  const frame = sp1.parts.find((p) => p.sku === "MVS-RSF-SC3");
  check("frame part sells at the default markup ($38.50 → $66.00-ish)",
    frame && Math.abs(frame.unit_sell - Math.round(38.5 * 1.714 * 100) / 100) < 0.01,
    frame && String(frame.unit_sell));
  check("parts flag kit membership", sp1.parts.some((p) => p.in_kit) && sp1.parts.some((p) => !p.in_kit));

  const sp2 = parse(await client.callTool({ name: "get_screen_parts", arguments: { markupPct: 0 } }));
  check("zero markup sells at cost", sp2.parts.every((p) => p.unit_sell === p.unit_cost));

  // --- quoting -----------------------------------------------------------
  const q1 = parse(await client.callTool({
    name: "create_quote",
    arguments: {
      lines: [{ sku: "MVS-SG-CLR", qty: 2 }, { sku: "MVS-RG-1000", qty: 10 }, { sku: "BAD-SKU", qty: 1 }],
      job: "Lee Street", ship_to: "Bonnieville, KY",
    },
  }));
  check("quote prices the good lines", q1.lines.length === 2, `lines=${q1.lines.length}`);
  check("minimum order quantity enforced", q1.lines.find((l) => l.sku === "MVS-SG-CLR").qty === 12);
  check("bad SKU reported, not silently dropped", q1.problems.some((p) => p.error === "not_found"));
  check("subtotal matches the lines",
    Math.abs(q1.subtotal_usd - q1.lines.reduce((s, l) => s + l.extended, 0)) < 0.01);
  check("quote carries an expiry", /^\d{4}-\d{2}-\d{2}$/.test(q1.valid_until));

  // --- ordering guardrail ------------------------------------------------
  const o1 = parse(await client.callTool({
    name: "place_order", arguments: { quote_id: q1.quote_id, po_number: "PO-1", human_approved: false },
  }));
  check("agent CANNOT place an order without human approval", o1.status === "refused", o1.status);

  const o2 = parse(await client.callTool({
    name: "place_order",
    arguments: { quote_id: q1.quote_id, po_number: "PO-4471", human_approved: true, approver: "J. Allee" },
  }));
  check("human-approved order is accepted", o2.status === "accepted_pending_confirmation");

  // --- classifieds & the seller gate -------------------------------------
  const y1 = parse(await client.callTool({ name: "list_classifieds", arguments: { kind: "Surplus" } }));
  check("classifieds filter by kind", y1.count > 0 && y1.listings.every((l) => l.kind === "Surplus"));

  const y2 = parse(await client.callTool({ name: "list_classifieds", arguments: {} }));
  check("every listing carries a protectedPayment verdict",
    y2.listings.every((l) => typeof l.protectedPayment === "boolean"));
  const gated = y2.listings.find((l) => l.id === "L-2291");   // Hardin Interiors — fully onboarded
  const ungated = y2.listings.find((l) => l.id === "L-2268"); // J. Meredith — no agreement
  check("onboarded seller's listing takes protected payment", gated?.protectedPayment === true);
  check("un-onboarded seller's listing does not", ungated?.protectedPayment === false);
  check("payment note says authorize-then-capture with the 7-day hold",
    /authorize/i.test(y2.payment_note) && /7 days/.test(y2.payment_note) && /pickup/.test(y2.payment_note));
  check("the word 'escrow' never appears — Misty Valley never holds the money",
    !/escrow/i.test(JSON.stringify(y2)) && /never holds the money/.test(y2.payment_note));

  const ss1 = parse(await client.callTool({ name: "get_seller_status", arguments: { seller: "Hardin Interiors LLC" } }));
  check("gated seller: protected payment available",
    ss1.protected_payment === true && ss1.reason === "Protected payment available", ss1.reason);

  const ss2 = parse(await client.callTool({ name: "get_seller_status", arguments: { seller: "J. Meredith" } }));
  check("no agreement → no protected payment",
    ss2.protected_payment === false && /agreement/.test(ss2.reason), ss2.reason);

  const ss3 = parse(await client.callTool({ name: "get_seller_status", arguments: { seller: "E. Vargas" } }));
  check("agreement but not onboarded → blocked on onboarding",
    ss3.protected_payment === false && /onboarding/.test(ss3.reason), ss3.reason);

  const ss4 = parse(await client.callTool({ name: "get_seller_status", arguments: { seller: "TRH GC — subcontract" } }));
  check("onboarded but payouts disabled → blocked on payouts",
    ss4.protected_payment === false && /payouts/.test(ss4.reason), ss4.reason);

  const ss5 = parse(await client.callTool({ name: "get_seller_status", arguments: { seller: "Nobody Inc" } }));
  check("unknown seller fails gracefully with the known list",
    ss5.error === "not_found" && Array.isArray(ss5.known_sellers) && ss5.known_sellers.length === 8);

  // --- manifest ----------------------------------------------------------
  const m1 = parse(await client.callTool({ name: "get_offer_manifest", arguments: {} }));
  check("manifest reports the catalog size", m1.catalog_lines > 0, String(m1.catalog_lines));
  check("manifest declares no auto-execute", m1.ordering.auto_execute === false);

  await client.close();

  console.log(`\n[1m${pass} passed, ${fails.length} failed[0m`);
  if (fails.length) { fails.forEach((f) => console.log(`  [31m·[0m ${f}`)); process.exit(1); }
  console.log("[32mAll green.[0m\n");
};

main().catch((e) => { console.error("[31mSmoke test crashed:[0m", e); process.exit(1); });
