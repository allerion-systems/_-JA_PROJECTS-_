#!/usr/bin/env node
/**
 * build-feed.mjs — generates the agent/AI-shopping product feed.
 *
 * Reads src/data.ts (canonical catalog) the same way build-catalog.mjs does,
 * and writes:
 *   catalog/feed.json — structured product feed (OpenAI discovery / agent shape)
 *   catalog/feed.csv  — same rows as CSV for feed ingesters that want CSV
 *
 * Rules honored:
 *   - No fabricated GTINs/barcodes: the gtin field is omitted entirely
 *     (data.ts carries none). Never invent identifiers.
 *   - List prices only. No cost/contract pricing in any feed.
 *   - availability is honest: dropship/stock lanes => in_stock (supplier-shipped),
 *     import SKUs => preorder, fabricated => made_to_order (custom quote).
 *   - Product links use the #/p/<sku> deep-link route.
 *
 * Usage: node scripts/build-feed.mjs [baseUrl]
 *   baseUrl defaults to https://mistyvalleysupply.com
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv[2] || "https://mistyvalleysupply.com";

const source = readFileSync(join(ROOT, "src", "data.ts"), "utf8").replace(
  /import\s*\{\s*PRODUCT_IMAGES\s*\}\s*from\s*["']@\/assets\/products\/productImages["'];?/,
  "const PRODUCT_IMAGES = {};",
);
const dir = mkdtempSync(join(tmpdir(), "feed-"));
writeFileSync(join(dir, "data.ts"), source);
execFileSync("npx", ["esbuild", join(dir, "data.ts"), "--format=esm", `--outfile=${join(dir, "data.mjs")}`], { cwd: ROOT });
const { PRODUCTS, CATEGORIES } = await import(pathToFileURL(join(dir, "data.mjs")).href);
rmSync(dir, { recursive: true, force: true });

const catName = new Map(CATEGORIES.map((c) => [c.id, c.name]));

function availability(p) {
  if (p.sku.startsWith("MVS-IM-")) return "preorder";
  if (p.sku.startsWith("MVS-DP-")) return "made_to_order";
  if (p.fulfil === "fabricate") return "made_to_order";
  return "in_stock"; // dropship + stock lanes: supplier ships on order
}

const rows = PRODUCTS.map((p) => ({
  id: p.sku,
  title: p.name,
  description: (p.note || p.why || "").slice(0, 500),
  link: `${BASE}/#/p/${encodeURIComponent(p.sku)}`,
  price: `${p.price.toFixed(2)} USD`,
  availability: availability(p),
  condition: "new",
  brand: "Misty Valley Supply",
  product_category: catName.get(p.cat) || p.cat,
  unit: p.uom,
  ...(p.std ? { standard: p.std } : {}),
  ...(p.lead ? { fulfillment_lead: p.lead } : {}),
}));

mkdirSync(join(ROOT, "catalog"), { recursive: true });
writeFileSync(join(ROOT, "catalog", "feed.json"), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), merchant: "Misty Valley Supply", products: rows }, null, 1));

const cols = ["id", "title", "description", "link", "price", "availability", "condition", "brand", "product_category", "unit", "standard", "fulfillment_lead"];
const esc = (v) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
writeFileSync(join(ROOT, "catalog", "feed.csv"), csv + "\n");

console.log(`feed.json + feed.csv written: ${rows.length} products, base ${BASE}`);
