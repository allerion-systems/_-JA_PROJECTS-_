#!/usr/bin/env node
/**
 * build-listings.mjs — Misty Valley Supply → Amazon listing payload generator
 *
 * Reads the store catalog (src/data.ts) READ-ONLY, extracts the PRODUCTS array
 * with a whitespace-tolerant regex (no TS compiler, no deps beyond node:fs),
 * filters to the vetted shortlist from fee-model.md, and emits:
 *   ../listings.json  — SP-API Listings Items (putListingsItem)-shaped payloads
 *   ../listings.csv   — flat-file-style CSV
 *
 * HONESTY RULES ENFORCED HERE:
 *  - Only shortlist SKUs are emitted. fulfil === "fabricate" and freight-class
 *    SKUs are excluded even if someone edits the shortlist carelessly.
 *  - Every value that must come from the real manufacturer (GTIN/UPC, brand,
 *    images, manufacturer part number) is an explicit PLACEHOLDER string.
 *    Nothing here fabricates an identifier or a compliance claim.
 *  - productType values are GUESSES; verify against the SP-API Product Type
 *    Definitions API (searchDefinitionsProductTypes) before submitting.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_TS = "/home/user/mvs-store/src/data.ts";
const OUT_DIR = join(HERE, "..");

// Shortlist from fee-model.md (2026-09-05). Order = launch order.
const SHORTLIST = new Map([
  ["MVS-ANC-DL",  { productType: "FALL_ARREST_KIT" }],   // GUESS — verify
  ["MVS-SRL-11",  { productType: "FALL_ARREST_KIT" }],   // GUESS — verify
  ["MVS-LY-SA6",  { productType: "FALL_ARREST_KIT" }],   // GUESS — verify
  ["MVS-FH-5PT",  { productType: "SAFETY_HARNESS" }],    // GUESS — verify
  ["MVS-HH-T2V",  { productType: "HARDHAT" }],           // GUESS — verify
]);

// Freight/oversize SKUs — excluded unconditionally (belt and suspenders).
const FREIGHT = new Set([
  "MVS-RG-1000", "MVS-RG-BASE", "MVS-WL-600",
  "MVS-YG-10", "MVS-YG-POST", "MVS-YG-TOE",
]);

// ---------------------------------------------------------------- extraction

const src = readFileSync(DATA_TS, "utf8");

// Isolate the PRODUCTS array body so we don't scoop up SCREEN_PARTS etc.
const arrMatch = src.match(
  /export\s+const\s+PRODUCTS\s*:\s*Product\[\]\s*=\s*\[([\s\S]*?)\n\]\s*;/
);
if (!arrMatch) {
  console.error("FATAL: could not locate PRODUCTS array in " + DATA_TS);
  process.exit(1);
}
const body = arrMatch[1];

// Each product is an object literal starting with `sku:`. Match lazily up to
// the closing brace that is followed by `,` at end-of-object. Fields inside
// contain no nested braces, so the lazy match is safe here.
const objRe = /\{\s*sku\s*:\s*"([\s\S]*?)"\s*,([\s\S]*?)\}\s*,?/g;

const str = (block, key) => {
  const m = block.match(new RegExp(`${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1] : undefined;
};
const num = (block, key) => {
  const m = block.match(new RegExp(`${key}\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)`));
  return m ? Number(m[1]) : undefined;
};

const products = [];
let m;
while ((m = objRe.exec(body)) !== null) {
  const [, sku, rest] = m;
  products.push({
    sku,
    name: str(rest, "name"),
    cat: str(rest, "cat"),
    price: num(rest, "price"),
    uom: str(rest, "uom"),
    std: str(rest, "std"),
    osha: str(rest, "osha"),
    note: str(rest, "note"),
    fulfil: str(rest, "fulfil"),
    supplier: str(rest, "supplier"),
    lead: str(rest, "lead"),
    moq: num(rest, "moq"),
  });
}

if (products.length !== 24) {
  console.error(`WARNING: expected 24 products, extracted ${products.length}. Check the regex against data.ts.`);
}

// ------------------------------------------------------------------- filter

const selected = products.filter((p) => {
  if (!SHORTLIST.has(p.sku)) return false;
  if (p.fulfil === "fabricate") { console.error(`REFUSED ${p.sku}: fabricate`); return false; }
  if (FREIGHT.has(p.sku))        { console.error(`REFUSED ${p.sku}: freight`);   return false; }
  return true;
});

// ------------------------------------------------------------- placeholders

const PH = {
  brand: (p) => `[PLACEHOLDER — real MANUFACTURER brand required; source via supplier: ${p.supplier}]`,
  upc: "[PLACEHOLDER — GS1 UPC/GTIN from manufacturer; DO NOT INVENT OR PURCHASE THIRD-PARTY CODES]",
  mpn: "[PLACEHOLDER — manufacturer part number]",
  image: "[PLACEHOLDER — manufacturer-supplied image URL, >=1000px, white background, usage rights confirmed]",
};

const bullets = (p) => [
  `Built to ${p.std} — verify the standard mark on the product itself before use`,
  `Satisfies the jobsite requirement of OSHA 29 CFR ${p.osha}`,
  p.note,
  `Sold and supported by a construction safety distributor — questions on spec or clearance answered before you buy`,
  `[PLACEHOLDER — add manufacturer feature bullet; do not invent performance claims]`,
];

const description = (p) =>
  `${p.name}. ${p.note} Built to ${p.std}; required on jobsites under OSHA 29 CFR ${p.osha}. ` +
  `Sold per ${p.uom}. [PLACEHOLDER — append manufacturer's official description; no unverified performance or certification claims.]`;

// --------------------------------------------------------------- listings.json

const listings = selected.map((p) => ({
  sku: p.sku,
  _meta: {
    generated: new Date().toISOString().slice(0, 10),
    source: DATA_TS,
    productTypeConfidence: "GUESS — verify via SP-API Product Type Definitions before submitting",
    complianceNote: "Fall-protection/PPE ASINs may require ANSI test reports and manufacturer authorization before this listing is accepted. See RUNBOOK.md §2.",
    storeChannel: { uom: p.uom, supplier: p.supplier, lead: p.lead, moq: p.moq ?? null },
  },
  productType: SHORTLIST.get(p.sku).productType,
  requirements: "LISTING",
  attributes: {
    item_name: [{ value: `${p.name} — ${p.std}`, language_tag: "en_US" }],
    brand: [{ value: PH.brand(p), language_tag: "en_US" }],
    manufacturer: [{ value: PH.brand(p), language_tag: "en_US" }],
    part_number: [{ value: PH.mpn }],
    externally_assigned_product_identifier: [{ type: "UPC", value: PH.upc }],
    product_description: [{ value: description(p), language_tag: "en_US" }],
    bullet_point: bullets(p).map((value) => ({ value, language_tag: "en_US" })),
    list_price: [{ value: p.price, currency: "USD" }],
    purchasable_offer: [{
      currency: "USD",
      our_price: [{ schedule: [{ value_with_tax: p.price }] }],
      _pricingRule: "Never below MVS store list price — Amazon is the discovery channel",
    }],
    condition_type: [{ value: "new_new" }],
    main_product_image_locator: [{ media_location: PH.image }],
    country_of_origin: [{ value: "[PLACEHOLDER — from manufacturer]" }],
    supplier_declared_dg_hz_regulation: [{ value: "not_applicable" }],
  },
}));

writeFileSync(join(OUT_DIR, "listings.json"), JSON.stringify(listings, null, 2) + "\n");

// ---------------------------------------------------------------- listings.csv

const csvEsc = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const header = [
  "sku", "product-type", "item-name", "brand-name", "manufacturer", "part-number",
  "external-product-id", "external-product-id-type", "standard-price", "quantity",
  "condition-type", "main-image-url",
  "bullet-point1", "bullet-point2", "bullet-point3", "bullet-point4", "bullet-point5",
  "product-description", "fulfillment-channel",
];
const rows = selected.map((p) => {
  const b = bullets(p);
  return [
    p.sku, SHORTLIST.get(p.sku).productType, `${p.name} — ${p.std}`,
    PH.brand(p), PH.brand(p), PH.mpn,
    PH.upc, "UPC", p.price.toFixed(2), 0 /* FBM qty set at launch, never fake stock */,
    "New", PH.image,
    b[0], b[1], b[2], b[3], b[4],
    description(p), "DEFAULT (FBM)",
  ].map(csvEsc).join(",");
});
writeFileSync(join(OUT_DIR, "listings.csv"), [header.join(","), ...rows].join("\n") + "\n");

console.log(`Extracted ${products.length} products from data.ts`);
console.log(`Emitted ${selected.length} shortlist listings -> listings.json, listings.csv`);
for (const p of selected) console.log(`  ${p.sku}  $${p.price}  (${p.supplier})`);
