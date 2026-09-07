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

  const expected = ["check_compliance", "create_quote", "design_deck", "design_garage",
                    "design_screen_from_bod", "design_shed", "get_offer_manifest", "get_product",
                    "get_screen_parts", "get_seller_status", "list_classifieds", "place_order",
                    "quote_roofscreen", "search_products", "submit_design_request"];
  check("all 15 tools registered", expected.every((n) => names.includes(n)), names.join(","));
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

  // --- design center: design_screen_from_bod -----------------------------
  // Lee Street geometry against the real BoD line off the drawings.
  const BOD = "RoofScreen SC3 frame with 7.2 Rib panel";
  const d1 = parse(await client.callTool({
    name: "design_screen_from_bod",
    arguments: { bod_text: BOD, length_lf: 156, height_ft: 3.5 },
  }));
  check("design frame rate is 14 + 7h = $38.50/LF at 3.5 ft",
    Math.abs(d1.costs.frame_package.rate_per_lf - 38.5) < 0.001, String(d1.costs.frame_package.rate_per_lf));
  check("design frame package hits the Lee Street anchor (~$6,006)",
    Math.abs(d1.costs.frame_package.amount - 6006) < 0.01, `$${d1.costs.frame_package.amount}`);
  check("design panel is 546 SF of 26 ga at $1.85 (~$1,010.10)",
    d1.costs.panel.screen_sf === 546 && Math.abs(d1.costs.panel.amount - 1010.10) < 0.01,
    `${d1.costs.panel.screen_sf} SF, $${d1.costs.panel.amount}`);
  check("hat channel runs 2 rows at 3.5 ft (312 LF, $608.40)",
    d1.costs.hat_channel.rows === 2 && Math.abs(d1.costs.hat_channel.amount - 608.40) < 0.01,
    `${d1.costs.hat_channel.rows} rows, $${d1.costs.hat_channel.amount}`);
  check("bases follow the 5 ft default bay (33 posts, $1,518)",
    d1.costs.bases.count === 33 && Math.abs(d1.costs.bases.amount - 1518) < 0.01,
    `${d1.costs.bases.count} bases, $${d1.costs.bases.amount}`);
  check("screws priced per LF (156 × $0.62 = $96.72)",
    Math.abs(d1.costs.screws.amount - 96.72) < 0.01, `$${d1.costs.screws.amount}`);
  check("design drawings line is 850 + 3.25/LF",
    Math.abs(d1.costs.shop_drawings.amount - (850 + 3.25 * 156)) < 0.01, `$${d1.costs.shop_drawings.amount}`);
  check("design totalCost is the sum of the build-up",
    Math.abs(d1.totalCost - (d1.costs.frame_package.amount + d1.costs.panel.amount + d1.costs.hat_channel.amount +
      d1.costs.bases.amount + d1.costs.screws.amount + d1.costs.shop_drawings.amount)) < 0.01, `$${d1.totalCost}`);
  check("design sell applies the default 0.714 markup",
    Math.abs(d1.sell - Math.round(d1.totalCost * 1.714 * 100) / 100) < 0.01, `$${d1.sell}`);
  check("member schedule carries mark/member/qty/unit rows",
    Array.isArray(d1.member_schedule) && d1.member_schedule.length >= 5 &&
    d1.member_schedule.every((r) => r.mark && r.member && r.qty > 0 && r.unit));
  check("schedule includes the base supports at the post count",
    d1.member_schedule.some((r) => r.mark === "B1" && r.qty === 33 && r.unit === "EA"));
  check("equal-to-BoD statement quotes the spec's BoD line",
    (d1.equal_to_bod || "").includes(`furnished as an equal to: ${BOD}`), d1.equal_to_bod);
  check("equal-to-BoD statement names the sealed-calcs line MVS-RSE-SHP",
    /substitution/.test(d1.equal_to_bod || "") && /MVS-RSE-SHP/.test(d1.equal_to_bod || ""));
  check("26 ga design carries no gauge warning", d1.warning === undefined);

  // 29 ga must carry the same unprompted warning the quote tool gives.
  const d2 = parse(await client.callTool({
    name: "design_screen_from_bod",
    arguments: { bod_text: BOD, length_lf: 156, height_ft: 3.5, gauge: "29" },
  }));
  check("29 ga design carries the gauge warning", typeof d2.warning === "string" && d2.warning.length > 20);
  check("design warning names agricultural gauge and the 7.2 Rib basis of design",
    /agricultural/i.test(d2.warning || "") && /7\.2 Rib/.test(d2.warning || ""), d2.warning);
  check("29 ga design is cheaper than 26 ga", d2.totalCost < d1.totalCost, `${d2.totalCost} vs ${d1.totalCost}`);

  // Frame only: panel and its screws drop out, the frame lines stay.
  const d3 = parse(await client.callTool({
    name: "design_screen_from_bod",
    arguments: { bod_text: BOD, length_lf: 100, height_ft: 6, frame_only: true, markup: 0.5 },
  }));
  check("frame-only design has zero panel and screw cost",
    d3.costs.panel.amount === 0 && d3.costs.screws.amount === 0);
  check("frame-only design keeps hat channel and bases",
    d3.costs.hat_channel.amount > 0 && d3.costs.bases.amount > 0);
  check("design honours a custom fractional markup", Math.abs(d3.sell - d3.totalCost * 1.5) < 0.01, `$${d3.sell}`);

  // Off-catalog height must be rejected with the allowed list, same as the quote tool.
  let dbad;
  try {
    dbad = await client.callTool({
      name: "design_screen_from_bod", arguments: { bod_text: BOD, length_lf: 100, height_ft: 7 },
    });
  } catch (e) {
    dbad = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] };
  }
  check("design rejects an off-catalog height", dbad.isError === true);
  check("design rejection names the allowed heights",
    /height_ft/.test(dbad.content?.[0]?.text ?? "") && /3\.5, 4, 6, 8, 10, 12/.test(dbad.content?.[0]?.text ?? ""),
    dbad.content?.[0]?.text);

  // --- design center: design_shed (the 5D BoM engine, ported from bim.ts) --
  // Hand-checked config: 10×12, 8 ft walls, 4:12, stick/ready/vinyl, 1 door,
  // 1 window. The app's hand-check for this shed is 40 wall studs, 12 wall
  // OSB, 5 roof OSB, 20 rafters.
  const line = (r, frag) => r.elements.find((e) => e.name.includes(frag));
  const bySku = (r, sku) => r.elements.filter((e) => e.sku === sku);

  const sh1 = parse(await client.callTool({
    name: "design_shed",
    arguments: { widthFt: 10, lengthFt: 12, wallHFt: 8, pitch: 4, doors: 1, windows: 1,
                 siding: "vinyl", roof: "ready", framing: "stick" },
  }));
  check("shed elements are typed and SKU-bound",
    Array.isArray(sh1.elements) && sh1.elements.length > 10 &&
    sh1.elements.every((e) => e.ifcClass && e.sku && e.qty > 0 && e.unitPrice > 0 && e.unit));
  check("shed 10×12 hand-check: 40 wall studs", line(sh1, "Wall stud")?.qty === 40,
    String(line(sh1, "Wall stud")?.qty));
  check("shed 10×12 hand-check: 12 wall OSB sheets", line(sh1, "Wall sheathing")?.qty === 12,
    String(line(sh1, "Wall sheathing")?.qty));
  check("shed 10×12 hand-check: 5 roof OSB sheets", line(sh1, "Roof sheathing")?.qty === 5,
    String(line(sh1, "Roof sheathing")?.qty));
  check("shed 10×12 hand-check: 20 rafters (10 pairs)", line(sh1, "Rafter —")?.qty === 20,
    String(line(sh1, "Rafter —")?.qty));
  check("shed prices every line from the catalog (ext = qty × unitPrice)",
    sh1.elements.every((e) => Math.abs(e.ext - Math.round(e.qty * e.unitPrice * 100) / 100) < 0.005));
  check("shed materials_total is the sum of extensions",
    Math.abs(sh1.materials_total - Math.round(sh1.elements.reduce((s, e) => s + e.ext, 0) * 100) / 100) < 0.01,
    `$${sh1.materials_total}`);
  check("shed door and window are SKU lines (MVS-SC-DOOR3, MVS-SC-WIN34)",
    bySku(sh1, "MVS-SC-DOOR3")[0]?.qty === 1 && bySku(sh1, "MVS-SC-WIN34")[0]?.qty === 1);
  check("vinyl shed carries a siding line; ready roof carries no metal",
    bySku(sh1, "MVS-SID-VD4").length === 1 && bySku(sh1, "MVS-RF-MTL29").length === 0);
  check("shed summary is a paragraph naming size and total",
    typeof sh1.summary === "string" && sh1.summary.includes("10×12") && /\$/.test(sh1.summary));

  // Option toggles swap exactly the right SKUs in and out.
  const sh2 = parse(await client.callTool({
    name: "design_shed",
    arguments: { widthFt: 10, lengthFt: 12, siding: "none", roof: "metal", framing: "truss",
                 ramp: true, loft: true, cupola: true, windows: 0 },
  }));
  check("siding 'none' drops the siding line", bySku(sh2, "MVS-SID-VD4").length === 0);
  check("metal roof adds MVS-RF-MTL29 by the square", bySku(sh2, "MVS-RF-MTL29")[0]?.qty === 2,
    String(bySku(sh2, "MVS-RF-MTL29")[0]?.qty));
  check("truss framing swaps rafters + ridge for MVS-TR-G12 at 24\" o.c.",
    bySku(sh2, "MVS-TR-G12")[0]?.qty === 7 && !line(sh2, "Rafter —") && !line(sh2, "Ridge board"),
    String(bySku(sh2, "MVS-TR-G12")[0]?.qty));
  check("ramp, loft and cupola add their dropship SKUs",
    bySku(sh2, "MVS-SC-RAMP4")[0]?.qty === 1 && bySku(sh2, "MVS-SC-LOFT8")[0]?.qty === 1 &&
    bySku(sh2, "MVS-SC-CUP24")[0]?.qty === 1);

  // Legacy path: no placements → openings echoed at the fixed front-wall spots.
  check("shed without placements echoes legacy front-wall openings",
    sh1.openings?.doors?.length === 1 && sh1.openings.doors[0].wall === "front" &&
    sh1.openings?.windows?.length === 1 && sh1.openings.windows[0].wall === "front",
    JSON.stringify(sh1.openings));
  check("shed summary without placements carries no placement line",
    !/Openings placed/.test(sh1.summary), sh1.summary);

  // Placements: geometric only. Same shed, doors/windows moved to other walls —
  // the BoM must be IDENTICAL line for line and the total penny-identical.
  const sh4 = parse(await client.callTool({
    name: "design_shed",
    arguments: { widthFt: 10, lengthFt: 12, wallHFt: 8, pitch: 4, doors: 1, windows: 1,
                 siding: "vinyl", roof: "ready", framing: "stick",
                 placements: { doors: [{ wall: "right", pos: 0.8 }], windows: [{ wall: "back", pos: 0.25 }] } },
  }));
  check("shed BoM is placement-invariant (identical elements)",
    JSON.stringify(sh4.elements) === JSON.stringify(sh1.elements));
  check("shed total is placement-invariant (penny-identical)",
    sh4.materials_total === sh1.materials_total, `$${sh4.materials_total} vs $${sh1.materials_total}`);
  // openingCenterFt(0.8, 10, 3) = 1 + 1.5 + 0.8 × (10 − 2 − 3) = 6.5 ft — the
  // right wall runs the 10-ft width. Window: 1 + 1.5 + 0.25 × 7 = 4.25 ft.
  check("placed door resolved on the right wall at 6.5 ft",
    sh4.openings.doors[0].wall === "right" && Math.abs(sh4.openings.doors[0].centerFt - 6.5) < 0.005,
    JSON.stringify(sh4.openings.doors[0]));
  check("placed window resolved on the back wall at 4.25 ft",
    sh4.openings.windows[0].wall === "back" && Math.abs(sh4.openings.windows[0].centerFt - 4.25) < 0.005,
    JSON.stringify(sh4.openings.windows[0]));
  check("shed summary names the placement (door 1 on the right wall at 6.5 ft)",
    sh4.summary.includes("door 1 on the right wall at 6.5 ft") &&
    sh4.summary.includes("window 1 on the back wall at 4.3 ft"), sh4.summary);
  check("placements echoed back on the design",
    sh4.design.placements?.doors?.[0]?.wall === "right" && sh4.design.placements?.doors?.[0]?.pos === 0.8,
    JSON.stringify(sh4.design.placements));

  // Placement input validates hard: pos outside 0..1 and off-menu walls are
  // structured errors, not silent clamps.
  let shpbad;
  try {
    shpbad = await client.callTool({
      name: "design_shed",
      arguments: { widthFt: 10, lengthFt: 12, placements: { doors: [{ wall: "right", pos: 1.5 }] } },
    });
  } catch (e) { shpbad = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] }; }
  check("shed rejects a placement pos outside 0..1", shpbad.isError === true, shpbad.content?.[0]?.text);

  let shpbad2;
  try {
    shpbad2 = await client.callTool({
      name: "design_shed",
      arguments: { widthFt: 10, lengthFt: 12, placements: { doors: [{ wall: "roof", pos: 0.5 }] } },
    });
  } catch (e) { shpbad2 = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] }; }
  check("shed rejects an off-menu placement wall", shpbad2.isError === true, shpbad2.content?.[0]?.text);

  // Premium tier hand-check: 12×16 wainscot + hvac over the same base shed.
  // Wainscot: ceil(56-ft perimeter / 8) = 7 × $240 = $1,680; mini-split $1,450
  // + electrical $1,850 = $3,300 → delta $4,980.00 penny-exact.
  const shBase = parse(await client.callTool({
    name: "design_shed", arguments: { widthFt: 12, lengthFt: 16 } }));
  const shPrem = parse(await client.callTool({
    name: "design_shed", arguments: { widthFt: 12, lengthFt: 16, wainscot: true, hvac: true } }));
  check("shed 12×16 wainscot+hvac premium delta is $4,980.00 penny-exact",
    Math.abs((shPrem.materials_total - shBase.materials_total) - 4980) < 0.005,
    `$${(shPrem.materials_total - shBase.materials_total).toFixed(2)}`);
  check("premium tier adds exactly wainscot, mini-split and electrical SKUs",
    bySku(shPrem, "MVS-SC-WAIN8")[0]?.qty === 7 && bySku(shPrem, "MVS-CI-HVAC12")[0]?.qty === 1 &&
    bySku(shPrem, "MVS-CI-ELEC")[0]?.qty === 1 && shPrem.elements.length === shBase.elements.length + 3);

  // Validation is hard: bad enums come back as structured errors, not defaults.
  let shbad;
  try {
    shbad = await client.callTool({ name: "design_shed", arguments: { widthFt: 9, lengthFt: 12 } });
  } catch (e) { shbad = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] }; }
  check("shed rejects widthFt 9 naming the allowed widths",
    shbad.isError === true && /8, 10, 12/.test(shbad.content?.[0]?.text ?? ""), shbad.content?.[0]?.text);

  let shbad2;
  try {
    shbad2 = await client.callTool({ name: "design_shed", arguments: { widthFt: 10, lengthFt: 13 } });
  } catch (e) { shbad2 = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] }; }
  check("shed rejects an odd lengthFt",
    shbad2.isError === true && /even/.test(shbad2.content?.[0]?.text ?? ""), shbad2.content?.[0]?.text);

  // --- design center: design_deck -----------------------------------------
  // Hand-checked config: 12×12 at 4 ft — 3 posts, 10 joists, 10 hangers,
  // 26 decking courses (each one 12-ft stick).
  const dk1 = parse(await client.callTool({
    name: "design_deck", arguments: { widthFt: 12, depthFt: 12, heightFt: 4, railing: true, stairs: true },
  }));
  check("deck 12×12×4 hand-check: 3 posts", line(dk1, "Post — PT 6×6")?.qty === 3,
    String(line(dk1, "Post — PT 6×6")?.qty));
  check("deck 12×12×4 hand-check: 10 joists", line(dk1, 'Joist — PT 2×8')?.qty === 10,
    String(line(dk1, 'Joist — PT 2×8')?.qty));
  check("deck 12×12×4 hand-check: 10 joist hangers", line(dk1, "Joist hanger")?.qty === 10,
    String(line(dk1, "Joist hanger")?.qty));
  check("deck 12×12×4 hand-check: 26 board courses", line(dk1, "5/4×6 decking")?.qty === 26,
    String(line(dk1, "5/4×6 decking")?.qty));
  check("deck stairs add 3 stringers and treads",
    line(dk1, "Stair stringer")?.qty === 3 && line(dk1, "Stair tread")?.qty > 0);
  check("deck materials_total is the sum of extensions",
    Math.abs(dk1.materials_total - Math.round(dk1.elements.reduce((s, e) => s + e.ext, 0) * 100) / 100) < 0.01,
    `$${dk1.materials_total}`);

  // IRC R312.1.1: at 4 ft (48 in ≥ 30 in) the guard goes on even if railing=false.
  const dk2 = parse(await client.callTool({
    name: "design_deck", arguments: { widthFt: 12, depthFt: 12, heightFt: 4, railing: false, stairs: false },
  }));
  check("guard forced on at ≥ 30 in (IRC R312.1.1) despite railing:false",
    dk2.design.railing === true && bySku(dk2, "MVS-PT-BAL").length === 1 &&
    /R312\.1\.1/.test(dk2.railing_forced || ""), dk2.railing_forced);
  check("no stairs → no stringer line", !line(dk2, "Stair stringer"));

  // At 2 ft (24 in < 30 in) railing really is optional.
  const dk3 = parse(await client.callTool({
    name: "design_deck", arguments: { widthFt: 12, depthFt: 12, heightFt: 2, railing: false, stairs: false },
  }));
  check("2-ft deck with railing:false omits the guard entirely",
    dk3.design.railing === false && bySku(dk3, "MVS-PT-BAL").length === 0 &&
    !line(dk3, "Guard post") && dk3.railing_forced === undefined);

  let dkbad;
  try {
    dkbad = await client.callTool({ name: "design_deck", arguments: { widthFt: 12, depthFt: 12, heightFt: 5 } });
  } catch (e) { dkbad = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] }; }
  check("deck rejects heightFt 5 naming 2, 4, 8",
    dkbad.isError === true && /2, 4, 8/.test(dkbad.content?.[0]?.text ?? ""), dkbad.content?.[0]?.text);

  // --- design center: design_garage (bimGarage.ts port) --------------------
  // Hand-check (a): 12×21 regular carport, all defaults, ground anchors —
  // base $1,595.00 + 12 legs × $8 = $96.00 → $1,691.00 penny-exact.
  const ga1 = parse(await client.callTool({
    name: "design_garage", arguments: { widthFt: 12, lengthFt: 21 },
  }));
  check("garage 12×21 base carport totals $1,691.00 penny-exact",
    Math.abs(ga1.materials_total - 1691) < 0.005, `$${ga1.materials_total}`);
  check("base carport is exactly base unit + ground anchors",
    ga1.elements.length === 2 && bySku(ga1, "MVS-GC-CP1221")[0]?.qty === 1 &&
    bySku(ga1, "MVS-GC-ANCG")[0]?.qty === 12, ga1.elements.map((e) => e.sku).join(","));
  check("garage geometry: 21 ft = 5 bays, 6 leg pairs, 12 legs",
    ga1.geometry?.bays === 5 && ga1.geometry?.legPairs === 6 && ga1.geometry?.legs === 12,
    JSON.stringify(ga1.geometry));
  check("garage elements are typed and SKU-bound",
    ga1.elements.every((e) => e.ifcClass && e.sku && e.qty > 0 && e.unitPrice > 0 && e.unit));
  check("garage summary names the config and the total",
    typeof ga1.summary === "string" && ga1.summary.includes("12×21") &&
    ga1.summary.includes("$1,691.00") && /carport/i.test(ga1.summary), ga1.summary);
  check("garage carries the ungated-pricing note", /place_order/.test(ga1.note || ""));

  // Hand-check (b): 24×31 vertical garage, 10-ft legs, 12-ga, fully enclosed,
  // one 10×10 roll-up + walk-in + 2 windows, certified, concrete anchors —
  // bays = 7, legs = 16 → $12,098.00 penny-exact.
  const ga2 = parse(await client.callTool({
    name: "design_garage",
    arguments: { widthFt: 24, lengthFt: 31, legHeightFt: 10, roofStyle: "vertical",
                 frameGauge: 12, leftSide: "full", rightSide: "full", frontEnd: "full", backEnd: "full",
                 doors: [{ type: "rollup10", wall: "front" }, { type: "walkin", wall: "right" }],
                 windows: 2, anchors: "concrete", certified: true },
  }));
  check("garage 24×31 hand-check totals $12,098.00 penny-exact",
    Math.abs(ga2.materials_total - 12098) < 0.005, `$${ga2.materials_total}`);
  check("vertical roof priced per 5-ft section (7 bays)",
    bySku(ga2, "MVS-GC-VERT")[0]?.qty === 7, String(bySku(ga2, "MVS-GC-VERT")[0]?.qty));
  check("12-ga frame upgrade priced per bay (7)",
    bySku(ga2, "MVS-GC-12GA")[0]?.qty === 7, String(bySku(ga2, "MVS-GC-12GA")[0]?.qty));
  check("full side enclosures priced per section, both sides",
    bySku(ga2, "MVS-GC-SIDEF").length === 2 && bySku(ga2, "MVS-GC-SIDEF").every((e) => e.qty === 7));
  check("end walls priced per foot of width (24 each, both ends)",
    bySku(ga2, "MVS-GC-ENDP").length === 2 && bySku(ga2, "MVS-GC-ENDP").every((e) => e.qty === 24));
  check("doors land as one line each with the wall named",
    bySku(ga2, "MVS-GC-RU1010")[0]?.qty === 1 && bySku(ga2, "MVS-GC-WALK36")[0]?.qty === 1 &&
    line(ga2, "10 × 10 roll-up")?.name.includes("front wall"));
  check("concrete anchors on all 16 legs",
    bySku(ga2, "MVS-GC-ANCC")[0]?.qty === 16, String(bySku(ga2, "MVS-GC-ANCC")[0]?.qty));
  check("certified package is a single engineering line",
    bySku(ga2, "MVS-GC-CERT")[0]?.qty === 1 && /engineered/i.test(line(ga2, "Certified")?.name || ""));
  check("garage prices every line from the catalog (ext = qty × unitPrice)",
    ga2.elements.every((e) => Math.abs(e.ext - Math.round(e.qty * e.unitPrice * 100) / 100) < 0.005));
  check("garage materials_total is the sum of extensions",
    Math.abs(ga2.materials_total - Math.round(ga2.elements.reduce((s, e) => s + e.ext, 0) * 100) / 100) < 0.01,
    `$${ga2.materials_total}`);
  check("fully enclosed build is summarised as a garage naming $12,098.00",
    /metal garage/.test(ga2.summary) && ga2.summary.includes("$12,098.00"), ga2.summary);

  // Option toggles swap exactly the right SKUs in and out; colors are cosmetic.
  const ga3 = parse(await client.callTool({
    name: "design_garage",
    arguments: { widthFt: 18, lengthFt: 26, roofStyle: "boxedEave", panelGauge: 26,
                 leftSide: "half", frontEnd: "gable", leanTo: "both", anchors: "asphalt",
                 roofColor: "#7d2a26", sideColor: "#2e4a3a" },
  }));
  check("boxed-eave roof is a single upgrade line",
    bySku(ga3, "MVS-GC-BOX")[0]?.qty === 1 && bySku(ga3, "MVS-GC-VERT").length === 0);
  check("26-ga panel upgrade priced per bay (6)",
    bySku(ga3, "MVS-GC-26GA")[0]?.qty === 6, String(bySku(ga3, "MVS-GC-26GA")[0]?.qty));
  check("half side + gable end use their own SKUs",
    bySku(ga3, "MVS-GC-SIDEH")[0]?.qty === 6 && bySku(ga3, "MVS-GC-GABLE")[0]?.qty === 1);
  check("lean-to 'both' adds two per-bay wings",
    bySku(ga3, "MVS-GC-LEAN").length === 2 && bySku(ga3, "MVS-GC-LEAN").every((e) => e.qty === 6));
  check("asphalt anchors matched to the surface",
    bySku(ga3, "MVS-GC-ANCA")[0]?.qty === 14 && bySku(ga3, "MVS-GC-ANCG").length === 0);
  check("colors are echoed by commodity name and never priced",
    ga3.summary.includes("Barn Red") && ga3.summary.includes("Forest Green") &&
    ga3.elements.every((e) => !/color/i.test(e.name)), ga3.summary);

  // Validation is hard, same as the other designers.
  let gabad;
  try {
    gabad = await client.callTool({ name: "design_garage", arguments: { widthFt: 15, lengthFt: 21 } });
  } catch (e) { gabad = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] }; }
  check("garage rejects widthFt 15 naming the allowed widths",
    gabad.isError === true && /12, 18, 20, 22, 24, 26, 28, 30/.test(gabad.content?.[0]?.text ?? ""),
    gabad.content?.[0]?.text);

  let gabad2;
  try {
    gabad2 = await client.callTool({ name: "design_garage", arguments: { widthFt: 12, lengthFt: 22 } });
  } catch (e) { gabad2 = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] }; }
  check("garage rejects an off-ladder length naming the 5-ft bays",
    gabad2.isError === true && /21, 26, 31, 36, 41, 46, 51/.test(gabad2.content?.[0]?.text ?? ""),
    gabad2.content?.[0]?.text);

  let gabad3;
  try {
    gabad3 = await client.callTool({
      name: "design_garage",
      arguments: { widthFt: 12, lengthFt: 21, doors: [{ type: "rollup8", wall: "front" }] },
    });
  } catch (e) { gabad3 = { isError: true, content: [{ type: "text", text: String(e?.message ?? e) }] }; }
  check("garage rejects an off-menu door type", gabad3.isError === true, gabad3.content?.[0]?.text);

  // --- design center: submit_design_request ------------------------------
  const goodContact = { name: "R. Tate", company: "Cumberland Sheet Metal", email: "rtate@cumberlandsm.com", phone: "(615) 555-0142" };
  const dr1 = parse(await client.callTool({
    name: "submit_design_request",
    arguments: {
      bod_text: BOD, length_lf: 156, height_ft: 3.5, contact: goodContact, sms_consent: true,
      files: [{ name: "A160-detail6.pdf", size: 481221, type: "application/pdf" }],
      notes: "RTU screen off detail 6/A160",
    },
  }));
  check("design request accepted with a D-#### id",
    dr1.status === "received" && /^D-\d{4}$/.test(dr1.request_id), dr1.request_id);
  check("request echoes the contact and file metadata",
    dr1.request?.contact?.email === goodContact.email && dr1.request?.files?.[0]?.name === "A160-detail6.pdf");
  check("note says the counter follows up", /follows up/.test(dr1.note || ""), dr1.note);
  check("note never claims a message was already sent",
    !/has been sent|was sent|message sent|text sent|email sent/i.test(dr1.note || ""), dr1.note);

  // The consent gate: refuse with a structured, correctable error.
  const dr2 = parse(await client.callTool({
    name: "submit_design_request",
    arguments: { bod_text: BOD, length_lf: 156, height_ft: 3.5, contact: goodContact, sms_consent: false },
  }));
  check("no sms_consent → refused, not submitted",
    dr2.status === "refused" && dr2.reason === "consent_or_contact_invalid", dr2.status);
  check("refusal names sms_consent as the missing field",
    Array.isArray(dr2.missing) && dr2.missing.some((m) => m.field === "sms_consent"));

  const dr3 = parse(await client.callTool({
    name: "submit_design_request",
    arguments: { bod_text: BOD, length_lf: 156, height_ft: 3.5, contact: { ...goodContact, email: "not-an-email" }, sms_consent: true },
  }));
  check("bad email → refused naming contact.email",
    dr3.status === "refused" && dr3.missing.some((m) => m.field === "contact.email"), JSON.stringify(dr3.missing));

  const dr4 = parse(await client.callTool({
    name: "submit_design_request",
    arguments: { bod_text: BOD, length_lf: 156, height_ft: 3.5, contact: { ...goodContact, phone: "555-014" }, sms_consent: true },
  }));
  check("short phone → refused naming contact.phone",
    dr4.status === "refused" && dr4.missing.some((m) => m.field === "contact.phone"), JSON.stringify(dr4.missing));

  const dr5 = parse(await client.callTool({
    name: "submit_design_request",
    arguments: {
      bod_text: BOD, length_lf: 156, height_ft: 3.5,
      contact: { ...goodContact, email: "nope", phone: "12" }, sms_consent: false,
    },
  }));
  check("all three gate failures reported together",
    dr5.status === "refused" && dr5.missing.length === 3, JSON.stringify(dr5.missing));

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
