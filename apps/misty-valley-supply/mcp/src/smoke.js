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
                    "list_classifieds", "place_order", "quote_roofscreen", "search_products"];
  check("all 8 tools registered", expected.every((n) => names.includes(n)), names.join(","));
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

  // --- roof screen -------------------------------------------------------
  const r1 = parse(await client.callTool({
    name: "quote_roofscreen",
    arguments: { linear_feet: 120, height_ft: 8, mount: "curb", infill: "louver" },
  }));
  check("roof screen budget computes", r1.budget_usd > 0, `$${r1.budget_usd}`);
  check("budget is frame + infill + mount", r1.budget_usd ===
    r1.breakdown.frame + r1.breakdown.infill + r1.breakdown.mounting);
  check("includes the substitution notice", (r1.substitution_notice || "").includes("substitution"));

  const r2 = parse(await client.callTool({
    name: "quote_roofscreen", arguments: { linear_feet: 120, height_ft: 12, mount: "curb", infill: "louver" },
  }));
  check("taller screen costs more", r2.budget_usd > r1.budget_usd, `${r2.budget_usd} vs ${r1.budget_usd}`);

  // An invalid enum value must come back as a structured error result the agent
  // can read and correct — not a thrown exception, and never a silent default.
  let bad;
  try {
    bad = await client.callTool({ name: "quote_roofscreen", arguments: { linear_feet: 100, height_ft: 7 } });
  } catch (e) {
    bad = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] };
  }
  check("invalid height is rejected", bad.isError === true);
  check("rejection names the allowed values",
    /height_ft/.test(bad.content?.[0]?.text ?? "") && /4, 6, 8, 10, 12/.test(bad.content?.[0]?.text ?? ""),
    bad.content?.[0]?.text);

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

  // --- classifieds & manifest --------------------------------------------
  const y1 = parse(await client.callTool({ name: "list_classifieds", arguments: { kind: "Surplus" } }));
  check("classifieds filter by kind", y1.count > 0 && y1.listings.every((l) => l.kind === "Surplus"));

  const m1 = parse(await client.callTool({ name: "get_offer_manifest", arguments: {} }));
  check("manifest reports the catalog size", m1.catalog_lines > 0, String(m1.catalog_lines));
  check("manifest declares no auto-execute", m1.ordering.auto_execute === false);

  await client.close();

  console.log(`\n[1m${pass} passed, ${fails.length} failed[0m`);
  if (fails.length) { fails.forEach((f) => console.log(`  [31m·[0m ${f}`)); process.exit(1); }
  console.log("[32mAll green.[0m\n");
};

main().catch((e) => { console.error("[31mSmoke test crashed:[0m", e); process.exit(1); });
