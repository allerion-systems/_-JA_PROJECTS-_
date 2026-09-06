# DROPSHIP-OPS — Shopify-grade dropshipping without Shopify

MVS · 2026-09-06 · pairs with the Ops → "§ Dropship routing" console in mvs-store
(`src/dropship.ts` + `src/views/Ops.tsx`, permission-gated on `po.create`).

## 1. The three pipes

Shopify dropship apps are three pipes. We run the same three; each has a manual
phase that works today and an automated phase that replaces it without re-training.

### Pipe A — order → PO routing (BUILT)
- Checkout writes orders to the local store (`mvs-orders`). `routeOrder()` groups
  each order's lines by the SKU's supplier: dropship-fulfil lines become one PO per
  supplier; stock/fabricate lines group under "MVS yard / shop" (internal ticket).
- Every supplier PO carries the blind-ship instruction, the customer's ship-to and
  contact, and our order ref. Lifecycle: draft → sent → confirmed → shipped(tracking)
  → delivered, persisted (`mvs-pos`). This is the routing brain; it never changes —
  only the transmission and notification pipes below get upgraded.

### Pipe B — PO → supplier transmission
- **Phase 1 (today):** "Copy PO" in the console → paste into email to the supplier's
  order desk. A person clicks send; the PO board is the source of truth.
- **Phase 2 (weeks):** Zapier automation — the account's Zapier MCP is already
  connected. Trigger on new-order event → auto-email the rendered PO to the
  supplier's dropship address, CC purchasing@, and flip the PO to "sent". Supplier
  reply lands in a shared inbox; a human clicks "confirmed".
- **Phase 3 (ERP):** Odoo's native dropship route (Purchase + Inventory) — turn it
  on, don't write it. Seed products/vendors from the existing
  `catalog/odoo-products-import.csv`; SO confirmation then auto-generates the RFQ/PO
  and the dropship receipt closes on supplier shipment. The console retires to a
  read-only mirror.

### Pipe C — tracking → customer
- **Phase 1:** supplier replies with confirmation + tracking → paste into the PO
  board ("Add tracking → shipped") → counter texts/emails the customer by hand.
- **Phase 2:** Zapier — PO hits "shipped" → auto SMS + email to the order's contact
  ("Your material shipped — tracking NNN, arrives ~date"), and "delivered" on
  carrier scan. Same Zapier account as Pipe B; one workflow per event.
- **Phase 3:** Odoo delivery order + carrier connector does this natively.

## 2. Blind-ship policy and the dealer programs

Policy (printed on every PO): **"Ship blind — no supplier branding or invoices in
the box; packing slip shows Misty Valley Supply."** No exceptions for PPE/materials
suppliers; a supplier that won't blind-ship gets used, not listed. Ask the blind
question on every onboarding call — per `18-dropship-suppliers.md`, only ASD
publishes true blind-ship; TASCO/Safety Flag confirm dropship but not paperwork.

How the two supplier files slot into the pipes:
- **`18-dropship-suppliers.md` (PPE/materials):** TASCO, Safety Flag, ASD,
  FrenchCreek → normal Pipe A suppliers. Each becomes a `supplier` string on
  catalog SKUs; their POs flow through the console exactly like the placeholder
  suppliers do today. ASD first (blind confirmed), TASCO second (no minimums).
- **`prefab-buildings-dropship.md` (buildings):** dealer-network programs
  (American Steel Carports, Old Hickory, Esh's, VersaTube, ShelterLogic) are
  *commission/dealer* flows — the factory delivers and often installs, and some
  (Old Hickory, Esh's) invoice the customer directly under RTO. These lines route
  through Pipe A for tracking, but the PO is a **dealer order form**, blind-ship
  is replaced by the program's own branding rules, and payment follows the
  program (commission to MVS) rather than §3. Model them as fulfil:"dropship"
  with a `dealer` supplier note; don't force them through the Stripe capture rule.
- Bonnieville factory (Elijah's tiny homes) and Amish shops = "MVS yard / shop"
  internal tickets, same as fabricate lines.

## 3. Payment sequencing rule

One rule, three clocks — MVS never holds customer funds beyond Stripe's
authorize/capture window:

1. **Order placed:** customer card **authorized** (not captured). Checkout already
   says this verbatim.
2. **Supplier confirms the PO** (Pipe B "confirmed"): **capture** the
   authorization. If a supplier can't fill, void the auth (or capture partial for
   the lines that confirmed) — the customer was never charged for what won't ship.
3. **Supplier paid on MVS terms** (Net 30 / Net 15 / prepay-until-reviewed per the
   supplier table) after their invoice — customer cash arrives at capture,
   supplier cash leaves on terms, so dropship float is positive except for
   prepay suppliers (Ohio Valley Rail: card-capture first, then cut their PO).

Net-30 account customers skip the card clocks: PO required at order, invoice at
shipment, AR owns collection. Dealer-program buildings: customer pays the
factory/program; MVS books commission, no Stripe leg at all.

## Runbook (today)

1. Ops → Dropship routing → "Route to suppliers" on each new order.
2. Expand each supplier PO → Copy PO → email it → "Mark sent".
3. Supplier reply → "Mark confirmed" → **capture the Stripe auth now**.
4. Tracking in reply → paste → shipped → tell the customer → delivered on arrival.
5. Yard/shop tickets go to the pick board; no email leaves the building.
