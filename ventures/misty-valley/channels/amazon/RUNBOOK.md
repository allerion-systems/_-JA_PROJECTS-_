# Amazon Channel Runbook — Misty Valley Supply

Prepared 2026-09-05. Amazon is the **secondary discovery channel**; the MVS store stays the margin channel. Every fee and policy below carries a source and date. Where Amazon's authoritative page sits behind Seller Central login, the public help/pricing page or a reputable seller-economics source is cited and the confidence level is marked.

---

## 1. Account setup

**Plan: Professional Seller — $39.99/month** (flat, no per-item fee; Individual plan is $0.99/item and locks you out of the Buy Box, bulk feeds, and most compliance tooling — not viable for a distributor).
Source: [sell.amazon.com/pricing](https://sell.amazon.com/pricing), fetched 2026-09-05. Confirmed unchanged for 2026 by Amazon's official fee announcement: referral fees frozen, effective 2026-01-15 ([Amazon Selling Partners news](https://sellingpartners.aboutamazon.com/update-to-u-s-referral-and-fulfillment-by-amazon-fees-for-2026), fetched 2026-09-05). Confidence: **high**.

**Identity / verification you will need on hand before starting registration:**

- Legal business name and EIN (Misty Valley Supply's entity — confirm whether Supply is its own LLC or a d/b/a of the construction company; Amazon verifies against IRS records and a mismatch stalls registration for weeks).
- Government-issued photo ID of the primary contact; expect a live video verification call or selfie-with-ID step.
- US bank account in the entity's name (checking; Amazon deposits every ~14 days) and a chargeable credit card.
- Business address and phone (Bonnieville, KY) — utility bill or bank statement dated within 180 days as proof of address.
- Tax interview (W-9) inside Seller Central.
- **INFORM Consumers Act**: once you cross 200 transactions and $5,000 revenue in a 12-month period, Amazon must collect and annually re-verify bank, tax, and contact info, and your business name/address becomes publicly displayed on the storefront. Plan for it from day one — it is not optional and re-verification failures suspend payouts. Confidence: high (federal law, in force since June 2023).

Timeline: registration to "able to list" is typically 1–3 weeks including verification. Do not start creating listings until Account Health shows verified.

---

## 2. The PPE-specific reality: gating and compliance documentation

This is the part most "start selling on Amazon" guides skip, and it is the part that will actually determine MVS's timeline.

**How Amazon polices safety products.** Amazon does not publish a single clean "gated categories" list for occupational PPE. Enforcement happens at two layers:

1. **Category/ASIN gating** — some products show "approval required" when you attempt to list; you apply through Seller Central (typically: invoices for 10+ units purchased from the manufacturer/authorized distributor within the last 180 days, plus real product images).
2. **Post-listing compliance requests** — Amazon's *Manage Your Compliance* dashboard (Performance → Account Health → Product Compliance Requests) demands documents for specific ASINs; miss the deadline and the listing is suppressed. Any seller in a regulated category can receive these, FBA or FBM. Sources: [Red Stag, Amazon restricted categories 2026](https://redstagfulfillment.com/amazon-restricted-categories/); [Seller Assistant, compliance documents](https://www.sellerassistant.app/blog/amazon-seller-compliance-documents/) — both secondary, accessed 2026-09-05. Confidence: **medium** (gating is account- and ASIN-specific; Amazon's own matrix is behind login).

**By MVS category:**

| Category | Expected treatment | Documents to have ready |
|---|---|---|
| Hard hats / safety helmets (Z89.1) | Generally listable; compliance requests common | ANSI/ISEA Z89.1 test report from an ISO 17025–accredited lab, in the manufacturer's name; manufacturer invoices |
| Eye protection (Z87.1) | Generally listable; counterfeit-heavy niche, so expect invoice requests | Z87.1/Z87+ test report; invoices; images showing the Z87+ mark on frame AND lens |
| Cut gloves (ANSI/ISEA 105) | Lightly policed | 105 cut-level test report if requested |
| Hi-vis (ANSI/ISEA 107) | Lightly policed; may classify as Clothing | 107 certificate; Type/Class on label photos |
| **Fall protection (Z359.x — harnesses, SRLs, lanyards, anchors)** | **Strictest.** Sellers report approval requirements and ASIN gating on fall-arrest gear; Amazon treats life-safety equipment as high-risk and requires accredited test reports tied to the exact model. Some brands (3M/DBI-SALA, etc.) also brand-gate. | Z359.11/.13/.14/.18 test reports from an accredited lab; letter of authorization from the manufacturer naming MVS as an authorized reseller; purchase invoices; user instructions |

Fall-protection confidence: **medium** — the pattern (compliance doc requests, accredited lab reports, occasional hard gating) is consistently reported across seller-compliance sources ([Compliance Gate, personal safety product requirements, updated 2025-08-26](https://www.compliancegate.com/amazon-personal-safety-product-requirements/); Red Stag 2026, above), but Amazon's exact per-ASIN behavior is only visible from inside a verified account. **Budget 2–6 weeks for fall-protection approval and do not build the launch plan on it clearing faster.**

**What a reseller must obtain from each manufacturer (Ridgeline, Bluegrass, Midwest Safety, Ohio Valley):**

1. Test reports / certificates of conformity to the relevant ANSI/ISEA standard, issued by an ISO 17025–accredited laboratory, matching the exact model number.
2. A reseller/distribution authorization letter on manufacturer letterhead (also your defense against IP complaints).
3. Real GTIN/UPC codes for each item (GS1-registered, in the manufacturer's name). **Never buy cheap UPCs or invent them — mismatched GS1 prefixes get listings removed.**
4. Product images meeting Amazon spec (1000px+, white background) with usage rights.
5. Invoices showing ≥10 units purchased within 180 days (for ungating applications).

MVS never fabricates or self-certifies any of this. If a supplier cannot produce the test report, that SKU does not go on Amazon.

---

## 3. FBA vs FBM vs Multi-Channel Fulfillment

MVS is a dropship-first distributor: 71% dropship, no meaningful warehouse inventory, supplier leads of 2–8 days.

| Model | What it means for MVS | Verdict |
|---|---|---|
| **FBA** | Buy inventory, ship it to Amazon, pay fulfillment fee per unit ($3.11–$7.93 for our viable SKUs) + monthly storage + inbound placement fees. Prime badge, best conversion. | Best unit economics *on the shortlist SKUs*, but requires MVS to carry inventory it has never carried, with capital tied up and aged-inventory surcharges if it doesn't sell. |
| **FBM** | MVS ships (or supplier blind dropships) against Amazon orders. Only the referral fee goes to Amazon; MVS pays shipping. Handling time must be set honestly — with 2–6 day supplier leads that means a 3–5 day handling time, which hurts conversion but avoids late-shipment defects (>4% late = suspension risk). | Zero inventory risk; matches the existing dropship operation. Requires supplier agreement to blind-ship (no supplier branding in the box) — get this in writing from Ridgeline and Bluegrass first. |
| **MCF** | Amazon fulfills MVS's *own-store* orders from FBA stock. Fees per unit are higher than plain FBA. | Irrelevant until inventory exists at FBA; revisit in quarter 2 only if FBA stock is already there for Amazon orders. |

**Honest recommendation: start FBM, convert proven winners to FBA.** Launch the shortlist FBM with truthful handling times and supplier blind-ship agreements. After 60–90 days of real velocity data, buy a small FBA lot (1–2 cases) of only the SKUs that actually sell — the fall-protection items at $118–$386 have enough gross dollars per unit to absorb FBA fees; nothing else does. Do not start with FBA: buying inventory ahead of demand in a category you have never sold, to feed a fee structure with storage and aged-inventory surcharges, is how distributors lose money politely.

FBA fee context: 2026 fulfillment fees rose an average of $0.08/unit effective 2026-01-15 (official: [Amazon Selling Partners news](https://sellingpartners.aboutamazon.com/update-to-u-s-referral-and-fulfillment-by-amazon-fees-for-2026), fetched 2026-09-05, confidence high); a 3.5% fuel surcharge on fulfillment fees applies from 2026-04-17 ([AMZ Prep 2026 FBA fee guide](https://amzprep.com/amazon-fba-fees/), secondary, confidence medium).

---

## 4. Brand and listing rules

**Reselling other manufacturers' products (all 15 dropship PPE SKUs):**
- List under the **manufacturer's real brand**, never "Misty Valley" — putting your own brand on someone else's product is brand misrepresentation and an account-level offense.
- If the product already has an ASIN (name-brand PPE almost always does), you **must offer on the existing ASIN**, not create a duplicate. You are then competing for the Buy Box against other resellers, possibly including the manufacturer and Amazon itself. Check each ASIN's existing offer count and price *before* committing — if the manufacturer sells it on Amazon at your cost + 10%, that SKU is dead on this channel regardless of the fee math.
- Brand-registered manufacturers can restrict resellers (brand gating). The authorization letter from §2 is your application ticket.
- MVS's internal SKU (MVS-FH-5PT etc.) is your *seller SKU* — fine. The brand, title, and GTIN belong to the manufacturer.

**MVS-branded / shop-fabricated items — the roof screen parts and fabricated covers do NOT go on Amazon:**
1. **Freight class.** Screen frame sections, hat channel, 4×8 skylight screens, and rib panel ship LTL on engineered-layout quantities. Amazon parcel rails top out at 150 lb/96 in; everything past that is Overmax surcharges ($17–$25/unit extra) or simply unshippable. A product whose freight is quoted per job cannot live behind a fixed-price Add-to-Cart button.
2. **Made-to-order.** Frame is cut per project (height, bay spacing, mount type, panel gauge). Amazon's model is identical units, 30-day no-questions returns. A returned 156-LF custom screen frame is scrap.
3. **Engineering liability.** The screen sells with shop drawings and *sealed calculations by an engineer licensed in the project state*, as a substitution against a named basis of design. Selling it as an anonymous marketplace widget strips out the engineering review that makes it defensible — and 1-star reviews from buyers who eyeballed the counterweight spacing become MVS's liability record. Same logic kills the 90 lb guardrail bases and the fabricated hole covers: "Spacing per manufacturer's engineered layout — do not eyeball it" is not a bullet point that survives a marketplace.

The Amazon listing for the roof screen is instead a marketing asset on the MVS site: rank for the search, quote the job by phone.

---

## 5. Fee schedule summary (cited)

| Fee | Rate | Source, date, confidence |
|---|---|---|
| Professional plan | $39.99/mo | [sell.amazon.com/pricing](https://sell.amazon.com/pricing), 2026-09-05, high |
| Referral — Business, Industrial & Scientific Supplies | 12%, $0.30 min | same, high |
| Referral — Tools & Home Improvement | 15%, $0.30 min | same, high |
| Referral — Clothing & Accessories | 5% ≤$15 / 10% $15–20 / 17% >$20 | same, high |
| Referral — Everything Else | 15%, $0.30 min | same, high |
| Referral fees 2026 | Frozen at 2025 rates | [Amazon official announcement](https://sellingpartners.aboutamazon.com/update-to-u-s-referral-and-fulfillment-by-amazon-fees-for-2026), 2026-09-05, high |
| FBA fulfillment (non-apparel) | $3.11 (small std ≤2 oz) → $6.97+$0.08/4 oz (large std 3–20 lb) → $9.66+$0.38/lb (bulky ≤50 lb) → $54.86+ (XL 70–150 lb) | [AMZ Prep 2026 rate card](https://amzprep.com/amazon-fba-fees/), 2026-09-05, **medium** (secondary; verify in Seller Central Revenue Calculator before pricing) |
| FBA low-price discount (<$10 items) | −$0.86/unit | same, medium |
| FBA fuel surcharge | +3.5% of fulfillment fee from 2026-04-17 | same, medium |
| Overmax surcharge (>96 in or >130 in L+G) | +$17–25/unit | same, medium |

Which referral category a given PPE item lands in is set by Amazon's product-type classification, not by the seller: occupational safety gear commonly classifies under Industrial & Scientific (12%) or Tools & Home Improvement (15%), and hi-vis garments may classify as Clothing. `fee-model.md` states the assumption per SKU; verify each with the Revenue Calculator on the real ASIN before setting price.
