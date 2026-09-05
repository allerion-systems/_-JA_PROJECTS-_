# First 30 Days — Amazon Channel

Sequenced so nothing blocks on anything avoidable. Fees and policies cited in RUNBOOK.md.

## Week 1 — Account and paperwork (parallel tracks)

**Track A — registration.** Open the Professional Seller account ($39.99/mo). Gather EIN, photo ID, bank details, proof of address before starting — verification stalls are the #1 self-inflicted delay. Complete the W-9 tax interview. Expect the video verification step.

**Track B — supplier paperwork (start day 1, this is the long pole).** From Ridgeline Fall Protection (4 of the 5 launch SKUs) and Bluegrass PPE (the helmet), request in writing:
1. ANSI test reports (Z359.11/.13/.14/.18, Z89.1) from ISO 17025 labs, per exact model;
2. reseller authorization letter;
3. GS1 UPCs, real brand names, manufacturer part numbers, and image files with rights;
4. written agreement to blind dropship (no supplier branding/invoices in the box) against Amazon orders.

If Ridgeline cannot produce items 1–3, the Amazon channel dies here — better to know in week 1.

## Week 2 — Ungating and listing prep

- Search each product on Amazon by manufacturer brand + model. If ASINs exist, plan to offer on them (record ASIN, current Buy Box price, offer count). If the Buy Box sits below MVS cost + 15%, drop that SKU now.
- Attempt to list one fall-protection SKU to trigger the approval flow; submit invoices (10+ units, <180 days) and the manufacturer docs. Budget 2–6 weeks for approval — keep the helmet (likely ungated) as the week-3 fallback so something goes live on schedule.
- Run `scripts/build-listings.mjs`, replace every `[PLACEHOLDER — ...]` field with real manufacturer data. No placeholder ships. Verify productType guesses and the referral-fee category per ASIN in the Revenue Calculator.

## Week 3 — First 5 listings live (FBM)

Launch order: **MVS-HH-T2V** (least gating friction, proves the pipeline) → **MVS-FH-5PT** → **MVS-LY-SA6** → **MVS-SRL-11** → **MVS-ANC-DL**, as approvals clear.

- Fulfillment: FBM, handling time set honestly at 3–5 business days (supplier lead + buffer). Never promise Prime-like speed on a dropship chain — a late-shipment rate over 4% risks suspension faster than slow handling loses sales.
- Quantity: set from live supplier availability, not a made-up number; zero out when a supplier goes dark.

**Pricing rule (non-negotiable): Amazon price ≥ MVS store list price.** Set Amazon at store list, or store list + 3–5% to cover the referral delta where the ASIN's competition allows. Amazon is the discovery channel; the store is the margin channel. Undercutting your own store trains repeat construction buyers — the entire MVS business model — to buy where you keep 12% instead of 30%. Put a package insert policy check first before including any store marketing: **Amazon prohibits inserts that divert buyers off-Amazon; do not put "buy direct next time" cards in the box.** The legitimate loop is: brand presence on Amazon → contractor Googles "Misty Valley Supply" → lands on the store.

## Week 4 — Compliance posture and review hygiene

- Wire supplier order flow: Amazon order → PO to supplier same day → tracking uploaded within handling time. Manual is fine at day-30 volume; script it when >5 orders/day.
- File all test reports and authorization letters where whoever answers a *Manage Your Compliance* request can find them in an hour — response windows are short and suppression is automatic.
- Reviews: never solicit off-policy (no discounted-review schemes, no insert cards asking for 5 stars). Use only the "Request a Review" button. Expect and plan for the ugly review case: a buyer misusing fall protection and blaming the product. Respond factually, cite the manufacturer instructions, never give safety advice in review replies beyond "follow the manufacturer's instructions and OSHA requirements."
- Watch the three account-health dials weekly: late shipment rate (<4%), order defect rate (<1%), valid tracking (>95%).

## Day 30 checkpoint — go/no-go for month 2

- Fall-protection approvals granted? If not, escalate with suppliers or accept a helmet-only channel (thin) while waiting.
- Any SKU with ≥5 sales and clean metrics → get an FBA quote via the Revenue Calculator on the real ASIN and consider a 1-case FBA test.
- Recompute realized margin per SKU against fee-model.md estimates; kill anything running below 8% realized.

## Standing risks (top 3)

1. **Fall-protection gating/compliance** — the entire viable shortlist except the helmet depends on approval that can take weeks and can be revoked by a single unanswered compliance request.
2. **Liability surface** — selling life-safety gear to anonymous buyers with no spec conversation, where the store's whole differentiator is the spec conversation. Mitigate: manufacturer-verbatim listings only, no MVS-authored performance claims, insurance rider reviewed (Amazon requires commercial liability coverage once sales exceed $10k/month — verify the current threshold at that point).
3. **Buy Box compression** — on existing ASINs, other resellers (or the manufacturer) can price below MVS's floor at any time. The pricing rule means MVS simply doesn't win the Buy Box that day; never chase price below store list. If a SKU loses the Buy Box for 30 straight days, delist it rather than discount it.
