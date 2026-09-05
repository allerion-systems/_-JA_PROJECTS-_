#!/usr/bin/env node
/**
 * Push the Misty Valley Supply catalog into a Stripe account.
 *
 *   STRIPE_KEY=rk_live_... node scripts/stripe-sync.mjs [--links] [--dry]
 *
 * Reads catalog/product-master.csv (regenerate first: node scripts/build-catalog.mjs)
 * and creates/updates one Stripe Product + Price per SKU. With --links it also
 * creates a hosted Payment Link per product. Idempotent: products are keyed by
 * SKU (lowercased) so re-running updates instead of duplicating.
 *
 * Use a RESTRICTED key (Products/Prices/Payment Links: write). Never a full
 * secret key, never committed, never pasted into chat.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.STRIPE_KEY;
if (!KEY) {
  console.error("STRIPE_KEY is not set. Create a restricted key (Products, Prices,");
  console.error("Payment Links: write) at dashboard.stripe.com/apikeys and run:");
  console.error("  STRIPE_KEY=rk_... node scripts/stripe-sync.mjs");
  process.exit(1);
}
const DRY = process.argv.includes("--dry");
const LINKS = process.argv.includes("--links");

const HERE = dirname(fileURLToPath(import.meta.url));
const csv = readFileSync(join(HERE, "..", "catalog", "product-master.csv"), "utf8");

// Minimal CSV parse that honors quoted fields with embedded commas/newlines.
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); cell = ""; if (row.some(v => v !== "")) rows.push(row); row = []; }
    else if (c !== "\r") cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); if (row.some(v => v !== "")) rows.push(row); }
  return rows;
}

const [header, ...rows] = parseCsv(csv);
const col = Object.fromEntries(header.map((h, i) => [h, i]));

async function stripe(path, body) {
  const res = await fetch("https://api.stripe.com/v1/" + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${path}: ${json.error?.message ?? res.status}`);
  return json;
}

let created = 0, updated = 0, linked = 0;
for (const r of rows) {
  const sku = r[col["SKU"]];
  const name = r[col["Name"]];
  const price = Math.round(parseFloat(r[col["List Price"]]) * 100);
  const why = (r[col["Compliance Note"]] ?? "").slice(0, 500);
  if (!sku || !name || !Number.isFinite(price)) { console.warn(`skip ${sku}: bad row`); continue; }
  const id = sku.toLowerCase();
  if (DRY) { console.log(`would sync ${sku} — ${name} @ $${(price / 100).toFixed(2)}`); continue; }

  let product, priceObj;
  try {
    product = await stripe("products", {
      id, name, description: why || name,
      "default_price_data[currency]": "usd",
      "default_price_data[unit_amount]": String(price),
      "metadata[sku]": sku,
      "metadata[department]": r[col["Department"]] ?? "",
      "metadata[unit]": r[col["Unit"]] ?? "",
    });
    created++;
  } catch (e) {
    if (!/already exists/.test(e.message)) throw e;
    product = await stripe(`products/${id}`, { name, description: why || name });
    updated++;
  }
  if (LINKS) {
    const priceId = typeof product.default_price === "string" ? product.default_price : product.default_price?.id;
    if (priceId) {
      await stripe("payment_links", {
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "line_items[0][adjustable_quantity][enabled]": "true",
        "metadata[sku]": sku,
      });
      linked++;
    }
  }
  process.stdout.write(".");
}
console.log(`\ndone: ${created} created, ${updated} updated, ${linked} payment links (${rows.length} rows)`);
