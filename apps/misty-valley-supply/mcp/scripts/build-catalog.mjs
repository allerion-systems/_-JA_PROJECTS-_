#!/usr/bin/env node
/**
 * build-catalog.mjs — regenerates the Misty Valley Supply product master.
 *
 * Reads src/data.ts (the canonical catalog), transpiles it with esbuild so it
 * can be imported as a real ES module (no hand regex-parsing of product rows),
 * and writes:
 *   catalog/product-master.csv       — the single-source-of-truth spreadsheet
 *   catalog/odoo-products-import.csv — Odoo 19 product.template import file
 *
 * Usage: node scripts/build-catalog.mjs
 *
 * Rules honored here:
 *   - No fabricated barcodes, prices, or certifications. Anything not present
 *     in data.ts is left blank (Barcode, Contract Price).
 *   - standard_price uses contract price where the data carries one; the data
 *     currently carries none, so it falls back to 60% of list, per policy.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_TS = join(ROOT, "src", "data.ts");
const ASSETS_DIR = join(ROOT, "src", "assets", "products");
const OUT_DIR = join(ROOT, "catalog");

// ---------------------------------------------------------------------------
// 1. Load data.ts as a module.
//    data.ts imports "@/assets/products/productImages", which relies on Vite's
//    import.meta.glob — unavailable in plain Node. The images only decorate
//    products (p.img); we detect photos from the filesystem instead. So stub
//    that single import out, then let esbuild handle the TypeScript.
// ---------------------------------------------------------------------------
const source = readFileSync(DATA_TS, "utf8").replace(
  /import\s*\{\s*PRODUCT_IMAGES\s*\}\s*from\s*["']@\/assets\/products\/productImages["'];?/,
  "const PRODUCT_IMAGES = {};"
);

const work = join(tmpdir(), `mvs-catalog-${process.pid}`);
mkdirSync(work, { recursive: true });
const tmpTs = join(work, "data.ts");
const tmpMjs = join(work, "data.mjs");
writeFileSync(tmpTs, source);
execFileSync("npx", ["--yes", "esbuild", tmpTs, "--format=esm", `--outfile=${tmpMjs}`], {
  cwd: ROOT,
  stdio: ["ignore", "ignore", "inherit"],
});

const data = await import(pathToFileURL(tmpMjs).href);
rmSync(work, { recursive: true, force: true });

const { PRODUCTS, SCREEN_PARTS, CATEGORIES, SELLERS } = data;

// ---------------------------------------------------------------------------
// 2. Shared helpers.
// ---------------------------------------------------------------------------
const catName = new Map(CATEGORIES.map((c) => [c.id, c.name]));

const photoFiles = new Set(
  readdirSync(ASSETS_DIR).filter((f) => f.toLowerCase().endsWith(".jpg"))
);
const photoFor = (sku) => {
  const file = `${sku.toLowerCase()}.jpg`;
  return photoFiles.has(file) ? file : "";
};

const csvField = (v) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvLine = (cells) => cells.map(csvField).join(",");
const money = (n) => (typeof n === "number" ? String(Math.round(n * 100) / 100) : "");

// Seller: the SELLERS map keys marketplace payout accounts by seller name.
// Catalog rows sold by the house get "MVS"; a supplier name that matches a
// SELLERS entry would be credited to that seller.
const sellerFor = (name) => (name && SELLERS[name] ? name : "MVS");

// ---------------------------------------------------------------------------
// 3. Normalize both product families into one row shape.
//    PRODUCTS: price = list; no contract price exists in data.ts (left blank).
//    SCREEN_PARTS: `cost` is the unit sell at the Lee Street markup (see the
//    comment above SCREEN_PARTS in data.ts) — used as list. They carry no
//    category/osha/why fields; those stay blank rather than invented, and the
//    department is labeled from the roof-screen section they belong to.
// ---------------------------------------------------------------------------
const rows = [
  ...PRODUCTS.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: p.cat,
    department: catName.get(p.cat) ?? p.cat,
    unit: p.uom,
    list: p.price,
    contract: null, // not present in data.ts — never fabricated
    cite: p.osha ?? "",
    why: p.why ?? "",
    seller: sellerFor(p.supplier),
  })),
  ...SCREEN_PARTS.map((p) => ({
    sku: p.sku,
    name: p.name,
    category: "screen",
    department: "Roof Screen Parts",
    unit: p.uom,
    list: p.cost,
    contract: null,
    cite: "",
    why: "",
    seller: "MVS",
  })),
];

// Guard against duplicate SKUs sneaking into the master.
{
  const seen = new Set();
  for (const r of rows) {
    if (seen.has(r.sku)) throw new Error(`Duplicate SKU in data.ts: ${r.sku}`);
    seen.add(r.sku);
  }
}

// ---------------------------------------------------------------------------
// 4. product-master.csv
// ---------------------------------------------------------------------------
const masterHeader = [
  "SKU", "Name", "Category", "Department", "Unit", "List Price", "Contract Price",
  "Compliance Cite", "Compliance Note", "Image Status", "Image File", "Seller", "Barcode",
];
const masterLines = [csvLine(masterHeader)];
for (const r of rows) {
  const img = photoFor(r.sku);
  masterLines.push(csvLine([
    r.sku, r.name, r.category, r.department, r.unit,
    money(r.list),
    r.contract === null ? "" : money(r.contract),
    r.cite, r.why,
    img ? "photo" : "glyph",
    img,
    r.seller,
    "", // Barcode intentionally blank — GTINs are never fabricated
  ]));
}

// ---------------------------------------------------------------------------
// 5. odoo-products-import.csv (product.template)
//    standard_price: contract price where present, else 60% of list.
// ---------------------------------------------------------------------------
const odooHeader = [
  "default_code", "name", "categ_id/name", "list_price", "standard_price",
  "type", "sale_ok", "purchase_ok", "description_sale",
];
const odooLines = [csvLine(odooHeader)];
for (const r of rows) {
  const standard = r.contract !== null ? r.contract : r.list * 0.6;
  odooLines.push(csvLine([
    r.sku, r.name, r.department,
    money(r.list), money(standard),
    "consu", "TRUE", "TRUE",
    r.why,
  ]));
}

// ---------------------------------------------------------------------------
// 6. Write files and report.
// ---------------------------------------------------------------------------
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "product-master.csv"), masterLines.join("\n") + "\n");
writeFileSync(join(OUT_DIR, "odoo-products-import.csv"), odooLines.join("\n") + "\n");

console.log(`SKUs in data.ts: ${PRODUCTS.length} PRODUCTS + ${SCREEN_PARTS.length} SCREEN_PARTS = ${rows.length}`);
console.log(`product-master.csv:       ${masterLines.length - 1} data rows`);
console.log(`odoo-products-import.csv: ${odooLines.length - 1} data rows`);
const missing = rows.filter((r) => !r.cite || !r.why);
if (missing.length) {
  console.log(`SKUs with blank compliance fields (expected for screen parts): ${missing.map((r) => r.sku).join(", ")}`);
}
