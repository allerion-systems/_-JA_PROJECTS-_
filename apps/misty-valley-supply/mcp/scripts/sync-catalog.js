#!/usr/bin/env node
/**
 * Regenerate catalog.json from the storefront's src/data.ts.
 *
 *   node scripts/sync-catalog.js [path/to/data.ts]
 *
 * data.ts is TypeScript but its data is plain literals, so we strip the type
 * syntax with a few targeted rewrites, import the result as an ES module, and
 * serialize the pieces the MCP server needs. The two function-valued fields
 * (frameCostLf, hatRows) are linear/step formulas; we evaluate them at known
 * points and store their coefficients / a per-height table, then verify the
 * stored form reproduces the function at every configured height.
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "catalog.json");
const DATA = resolve(process.argv[2] ?? join(HERE, "..", "..", "mvs-store", "src", "data.ts"));

/* ------------------------------------------------ TS -> JS, the boring way */

let src = readFileSync(DATA, "utf8");

// Multi-line `export type X = { ... };` blocks.
src = src.replace(/export type \w+ = \{[\s\S]*?\n\};/g, "");
// Single-line type aliases, e.g. `export type Fulfil = "a" | "b";`
src = src.replace(/export type \w+ =[^{;]*;/g, "");
// Const annotations: `export const PRODUCTS: Product[] =` -> `export const PRODUCTS =`
src = src.replace(/^(export const \w+)\s*:\s*[^=\n]+=/gm, "$1 =");
// Arrow parameter annotations: `(h: number)` -> `(h)`
src = src.replace(/\(\s*(\w+)\s*:\s*number\s*\)/g, "($1)");
// The storefront's image map is a Vite-only module (import.meta.glob); the
// catalog carries no image binaries, so stub it out.
src = src.replace(/^import \{ PRODUCT_IMAGES \}[^\n]*$/m, "const PRODUCT_IMAGES = {};");

const tmp = mkdtempSync(join(tmpdir(), "mvs-sync-"));
const mod = await (async () => {
  const f = join(tmp, "data.mjs");
  writeFileSync(f, src);
  try { return await import(pathToFileURL(f).href); }
  finally { rmSync(tmp, { recursive: true, force: true }); }
})();

/* ------------------------------------------------------------- assemble */

const fail = (msg) => { console.error(`sync-catalog: ${msg}`); process.exit(1); };

const { PRODUCTS, CATEGORIES, ROOFSCREEN, SCREEN_PARTS, LISTINGS, LISTING_KINDS, SELLERS } = mod;
if (!PRODUCTS || !ROOFSCREEN || !SCREEN_PARTS || !SELLERS) fail("data.ts is missing an expected export");

// frameCostLf is linear in height: recover base + perFt and verify.
const f = ROOFSCREEN.frameCostLf;
const frameCostLf = { base: f(0), perFtHeight: f(1) - f(0) };
for (const h of ROOFSCREEN.heights) {
  if (Math.abs(f(h) - (frameCostLf.base + frameCostLf.perFtHeight * h)) > 1e-9)
    fail(`frameCostLf is not linear at h=${h}`);
}

// hatRows is a step function; store it as a per-height table.
const hatRowsByHeight = Object.fromEntries(
  ROOFSCREEN.heights.map((h) => [h, ROOFSCREEN.hardware.hatRows(h)])
);

const roofscreen = {
  title: ROOFSCREEN.title,
  proof: ROOFSCREEN.proof,
  lee: ROOFSCREEN.lee,
  bod: ROOFSCREEN.bod,
  bullets: ROOFSCREEN.bullets,
  heights: ROOFSCREEN.heights,
  frameCostLf,
  mounts: ROOFSCREEN.mounts,
  panels: ROOFSCREEN.panels,
  hardware: {
    hatChannelLf: ROOFSCREEN.hardware.hatChannelLf,
    hatRowsByHeight,
    baseEach: ROOFSCREEN.hardware.baseEach,
    screwsPerLf: ROOFSCREEN.hardware.screwsPerLf,
  },
  shopDrawings: ROOFSCREEN.shopDrawings,
  defaultMarkup: ROOFSCREEN.defaultMarkup,
};

const catalog = {
  $schema: "https://mistyvalleysupply.com/schema/catalog-v2.json",
  generated: new Date().toISOString().slice(0, 10),
  seller: {
    name: "Misty Valley Supply",
    location: "Bonnieville, Kentucky, US",
    currency: "USD",
  },
  categories: CATEGORIES,
  products: PRODUCTS,
  roofscreen,
  screen_parts: SCREEN_PARTS,
  classifieds: LISTINGS,
  listing_kinds: LISTING_KINDS,
  sellers: SELLERS,
};

/* --------------------------------------------------------------- verify */

if (catalog.products.length < 24) fail(`expected at least 24 products, got ${catalog.products.length}`);
if (catalog.screen_parts.length !== 8) fail(`expected 8 screen parts, got ${catalog.screen_parts.length}`);
if (Math.abs((frameCostLf.base + frameCostLf.perFtHeight * 3.5) - 38.5) > 1e-9)
  fail("frameCostLf(3.5) should be 38.50/LF (Lee Street anchor)");
for (const l of catalog.classifieds) {
  if (!catalog.sellers[l.who]) fail(`listing ${l.id} seller "${l.who}" has no seller account`);
}

writeFileSync(OUT, JSON.stringify(catalog, null, 2) + "\n");
console.log(
  `catalog.json written: ${catalog.products.length} products, ${catalog.categories.length} categories, ` +
  `${catalog.screen_parts.length} screen parts, ${catalog.classifieds.length} listings, ` +
  `${Object.keys(catalog.sellers).length} sellers`
);
