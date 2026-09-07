/* Dropship routing — pure functions that turn a placed order into per-supplier
   purchase orders, render each PO as plain text, and walk it through the
   draft → sent → confirmed → shipped → delivered lifecycle.

   No network. POs persist to localStorage "mvs-pos"; orders are read from the
   "mvs-orders" store the checkout writes. This is the spec for Odoo's native
   dropship route (Purchase + Inventory), not a replacement for it. */

import type { Product } from "@/data";

/* ------------------------------------------------------------------ types */

/** The shape checkout writes to localStorage "mvs-orders" (App.tsx saveOrder). */
export type StoredOrder = {
  ts: string;
  so?: string;
  guest?: boolean;
  contact?: { name?: string; email?: string; phone?: string };
  lines?: { sku: string; qty: number }[];
  total?: number;
  shipTo?: string;
  window?: string;
  terms?: string;
};

export type PoStatus = "draft" | "sent" | "confirmed" | "shipped" | "delivered";

export const PO_FLOW: PoStatus[] = ["draft", "sent", "confirmed", "shipped", "delivered"];

export type PoLine = { sku: string; name: string; qty: number; uom: string };

export type Po = {
  poId: string;
  supplier: string;
  /** true when the lines stay in-house (stock / fabricate) — not a real supplier PO */
  internal: boolean;
  lines: PoLine[];
  shipTo: string;
  orderRef: string;
  status: PoStatus;
  tracking?: string;
  createdAt: string;
};

/** Stock and fabricate lines don't leave the building — they group here. */
export const INTERNAL_SUPPLIER = "MVS yard / shop";

/* ---------------------------------------------------------------- routing */

/** Ship-to block: contact + address when the order carries them. */
const shipToOf = (o: StoredOrder): string => {
  const parts: string[] = [];
  if (o.contact?.name) parts.push(o.contact.name);
  if (o.shipTo) parts.push(o.shipTo);
  if (o.contact?.phone || o.contact?.email)
    parts.push([o.contact.phone, o.contact.email].filter(Boolean).join(" · "));
  return parts.join("\n") || "Misty Valley Supply — Bonnieville, KY (will call)";
};

/**
 * Group an order's lines by each SKU's supplier into per-supplier POs.
 * Only dropship-fulfil SKUs route to their supplier; stock and fabricate
 * lines group under {@link INTERNAL_SUPPLIER}. Unknown SKUs are dropped.
 * Deterministic: same order in, same POs out (ids derive from the order ref).
 */
export function routeOrder(order: StoredOrder, products: Product[]): Po[] {
  const ref = order.so ?? `SO-${(order.ts ?? "").replace(/\D/g, "").slice(-6) || "0000"}`;
  const shipTo = shipToOf(order);
  const bySupplier = new Map<string, PoLine[]>();

  for (const l of order.lines ?? []) {
    if (!l || typeof l.qty !== "number" || l.qty <= 0) continue;
    const p = products.find(x => x.sku === l.sku);
    if (!p) continue;
    const supplier = p.fulfil === "dropship" ? p.supplier : INTERNAL_SUPPLIER;
    const lines = bySupplier.get(supplier) ?? [];
    lines.push({ sku: p.sku, name: p.name, qty: l.qty, uom: p.uom });
    bySupplier.set(supplier, lines);
  }

  // internal group last — the board reads supplier POs first
  const suppliers = [...bySupplier.keys()].sort((a, b) =>
    (a === INTERNAL_SUPPLIER ? 1 : 0) - (b === INTERNAL_SUPPLIER ? 1 : 0) || a.localeCompare(b));

  return suppliers.map((supplier, i) => ({
    poId: `PO-${ref.replace(/^SO-/i, "")}-${i + 1}`,
    supplier,
    internal: supplier === INTERNAL_SUPPLIER,
    lines: bySupplier.get(supplier)!,
    shipTo,
    orderRef: ref,
    status: "draft" as PoStatus,
    createdAt: new Date().toISOString(),
  }));
}

/* ---------------------------------------------------------------- PO text */

/** Render a PO as clean plain text — copy it into an email today. */
export function poText(po: Po): string {
  const w = 62;
  const rule = "-".repeat(w);
  const lines = po.lines.map(l =>
    `  ${l.sku.padEnd(18)} ${String(l.qty).padStart(4)} ${l.uom.padEnd(8)} ${l.name}`);
  return [
    "MISTY VALLEY SUPPLY",
    "Bonnieville, Kentucky · (270) 555-0142 · purchasing@mistyvalley.supply",
    rule,
    `PURCHASE ORDER ${po.poId}`,
    `To:  ${po.supplier}`,
    `Ref: our order ${po.orderRef}`,
    rule,
    po.internal
      ? "Internal — pick / fabricate and stage for the MVS truck."
      : "Ship blind — no supplier branding or invoices in the box; packing slip shows Misty Valley Supply.",
    "",
    "Ship to:",
    ...po.shipTo.split("\n").map(s => `  ${s}`),
    "",
    `  ${"SKU".padEnd(18)} ${"QTY".padStart(4)} ${"UOM".padEnd(8)} DESCRIPTION`,
    ...lines,
    rule,
    po.internal ? "Confirm on the pick board when staged." : "Reply with confirmation + tracking.",
  ].join("\n");
}

/* ---------------------------------------------------------- state machine */

export const nextStatus = (s: PoStatus): PoStatus | null => {
  const i = PO_FLOW.indexOf(s);
  return i >= 0 && i < PO_FLOW.length - 1 ? PO_FLOW[i + 1] : null;
};

/**
 * Advance a PO one step. shipped requires tracking — without it the PO is
 * returned unchanged. Returns a new object; never mutates.
 */
export function advancePo(po: Po, tracking?: string): Po {
  const next = nextStatus(po.status);
  if (!next) return po;
  if (next === "shipped" && !(tracking ?? "").trim()) return po;
  return { ...po, status: next, ...(next === "shipped" ? { tracking: tracking!.trim() } : {}) };
}

/* ------------------------------------------------------------ persistence */

const PO_KEY = "mvs-pos";

export function loadPos(): Po[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PO_KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as Po[]).filter(p => p && p.poId) : [];
  } catch { return []; }
}

export function savePos(pos: Po[]): void {
  try { localStorage.setItem(PO_KEY, JSON.stringify(pos)); } catch { /* non-fatal */ }
}

export function loadOrders(): StoredOrder[] {
  try {
    const raw = JSON.parse(localStorage.getItem("mvs-orders") ?? "[]");
    return Array.isArray(raw) ? (raw as StoredOrder[]).filter(o => o && Array.isArray(o.lines)) : [];
  } catch { return []; }
}

/** Orders with no PO cut against them yet. */
export const unroutedOrders = (orders: StoredOrder[], pos: Po[]): StoredOrder[] =>
  orders.filter(o => o.so && !pos.some(p => p.orderRef === o.so));
