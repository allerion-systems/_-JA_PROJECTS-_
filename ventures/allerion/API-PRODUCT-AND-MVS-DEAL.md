# Allerion → Misty Valley: the API deal, and what Allerion actually sells

*Working memo · 2026-09-05 · pairs with BRAND-AND-ENGINE.md*

## 1. What Allerion sells (name the real product)

Allerion is not "an AI company" in the abstract. As of today it owns a working stack,
built and proven on Misty Valley Supply:

| Product | What it is, concretely | State |
|---|---|---|
| **Allerion Commerce Engine** | The distributor storefront: departments, contract pricing/RBAC, PO-gated checkout, PWA, fab configurator with parametric shop drawings, 3D Design Center | Running (prototype) |
| **Allerion Agent API** | The MCP server: catalog, quotes, `design_screen_from_bod`, `submit_design_request`, orders gated on human approval + PO. Any AI — a GC's procurement bot included — can price and design against it | Running, 60+ smoke tests |
| **Allerion Payments** | Stripe Connect orchestration: authorize-then-capture destination charges, platform `application_fee_amount`, marketplace payouts (Runs drivers, Yard sellers) | Designed + modeled; sandbox proven |
| **Allerion Ops** | One product master → Odoo import, Amazon listings, Stripe catalog sync, Google-Sheet export | Scripts shipped |

The pitch in one line: **commerce infrastructure for building-products distributors,
agent-ready out of the box.** Shopify Plus charges ~$2,300/mo and still can't do
contract pricing + fab configurators + an agent API without custom apps.

## 2. The Allerion ⇄ MVS deal (paper it like strangers)

Same person on both sides of the table means the paperwork has to be cleaner than a
normal deal, not looser.

- **Form**: a written SaaS + services agreement, Allerion Technologies LLC ↔ Misty
  Valley Supply. Signed by different people where possible (Joey signs for Allerion;
  MVS's other authorized member signs for MVS). Renewable 12-month term.
- **Price (market-benchmarked, defensible)**:
  - Platform license: **$750/mo** (benchmark: Shopify Plus $2,300/mo, BigCommerce
    Enterprise ~$1–2K/mo — Allerion at a design-partner discount is credible).
  - Payments orchestration: **1.0% of card GMV**, collected mechanically as the Stripe
    `application_fee_amount` on destination charges (the current PLATFORM_FEE_BPS=500
    in the code is a marketplace-side fee for Runs/Yard; keep 5% there, use 1% on
    first-party store sales).
  - Design-agent usage: included to 500 calls/mo, then metered.
- **Invoice monthly, pay actually** — money moves between the bank accounts. An
  intercompany deal that never cashes a check is a fiction an accountant unwinds later.
- **Disclosure discipline**: the Allerion↔MVS relationship goes in writing to anyone
  it could matter to (Scott/R&B where the two touch a job, any future partner or
  lender). Standing rule stays: **Allerion quotes technology services only — a
  materials or framing quote always comes from MVS**, never from Allerion.
- **Why bother when it's all Joey**: (1) it builds Allerion's revenue record with a
  real logo for the day Allerion raises or sells; (2) it keeps MVS's cost structure
  honest; (3) if Ben's side of MVS ever blows up, the tech company is a separate,
  uncontaminated asset. Ben has no role in Allerion — keep it that way.

## 3. allerion.io — what the site must become

Today it's a placeholder. Target: a credible infrastructure-company site, five pages.

1. **Product** — the four boxes above, one screenshot each from the live MVS build.
2. **Agent API docs** — MCP quickstart: connect, `get_catalog`, `design_screen_from_bod`,
   the human-approval rule on orders. Developers judge in 30 seconds; show the tool
   list and one real response.
3. **Case study: Misty Valley Supply** — real numbers as they land (the Lee Street
   screen: $8,373 cost → $14,318 sell, quoted with drawings in one minute).
4. **Pricing** — $750/mo + 1% GMV, design-partner tier, "talk to us."
5. **Security & payments** — Stripe-hosted checkout, no card data touched, human
   approval on agent orders, KY money-transmitter posture (no held funds, ever).

## 4. Pipeline after MVS (this is why the deal matters)

The I-65 competitor map found the market: **every independent yard within 60 miles is
digitally invisible** — brochure sites or generic Do it Best microsites, zero online
ordering (Buzick included). Each one is an Allerion Commerce Engine prospect, and MVS
is the living showroom 30 minutes up the road. Sequence:

1. MVS live and taking orders (proof).
2. Two more corridor yards at design-partner pricing (references).
3. LMC / Do it Best co-op channel play — sell the engine where the co-op's own
   e-commerce offering is weakest.

## 5. Stress test (what kills this)

- **Selling software that isn't hardened yet.** The engine is prototype-grade: no
  production auth, no backend order store, no sending infra. Fix: sell "design
  partner program," not GA software; MVS is customer #1 *because* it absorbs the
  rough edges. Do not sign yard #2 until MVS has processed real orders for 60 days.
- **Single-customer concentration + self-dealing optics.** Mitigated by the paper,
  the market benchmarks, and getting customer #2 fast.
- **Scope creep into payments regulation.** The line holds: Stripe holds the money,
  Allerion never does. Any feature that has Allerion touching funds is dead on
  arrival (KRS 286.11-007 analysis stands).
- **The name on the quote.** One sloppy Allerion-letterhead materials quote on a real
  job undoes the structure. Template discipline: Allerion invoices SaaS fees; MVS
  quotes materials and fabrication.

## 6. Next actions

- [ ] Draft the intercompany SaaS agreement (attorney reviews — same white-collar
      counsel engagement already recommended).
- [ ] First Allerion→MVS invoice ($750, dated the month the store goes live).
- [ ] allerion.io v1: the five pages, static, real screenshots.
- [ ] Stripe: live account connect → wire the 1% application fee on store charges.
- [ ] After 60 days of live orders: approach yard #2 from the competitor map.
