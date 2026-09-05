# Financing, Benchmarks, and the Lender's Actual Rulebook

Research against SBA SOP 50 10 8, the OCC's lending handbook, SEC filings, and
BLS wage data. This is what the bank will actually test.

---

## 1. Four findings that change the plan

### 1.1 🔴 No mill terms = the plan runs out of money

`base_case` assumes 30 days of supplier terms. **That is not what a new entity
gets.** GMS runs 41.5 days of payables because it has decades of mill
relationships; a brand-new LLC pays cash or COD until it earns history.

| | With 30-day terms | **With no terms** |
|---|---:|---:|
| Cash conversion cycle | 80 days | **110 days** |
| Peak cash requirement | $707,778 | **$1,047,356** |
| Cash position on a $700k line | $0 (survives) | **−$157,356 (fails)** |

**The mitigation is free, and it has to happen before launch.** Submit credit
applications to **ClarkDietrich, MarinoWARE and Telling now**, using **Misty
Valley Contracting's ten-year payment history as the trade reference.** An
existing subcontractor's payment record with the same manufacturers is the
single strongest asset Supply has for opening terms.

Then **attach the approved credit limits to the loan package as an appendix.**
Lenders find them unusually persuasive — it is third-party validation of
creditworthiness from parties with their own money at risk.

Run it: `python3 model/proforma.py --scenario no_mill_terms`

### 1.2 🔴 Cutting the steel may destroy its borrowing-base value

This is the finding that most directly threatens the revolver, and it is
counter-intuitive: **the value-added service undermines the collateral.**

From the OCC's *Accounts Receivable and Inventory Financing* handbook: raw
materials that are commodities carry the best advance rates, while
**work-in-process is "frequently excluded"** from the borrowing base
altogether.

**A job-specific bundle of studs cut to 8'-4½" for one wall type on one floor
looks exactly like work-in-process to a lender.** It has no alternative buyer.
If a wall gets redesigned it is scrap. A liquidator cannot sell it.

**Two operating rules that follow:**

1. **Cut to order, not to stock.** Uncut 10 ft stock is a commodity with a
   liquid market and a real advance rate. Keep inventory in stock lengths and
   cut against a signed order.
2. **Negotiate the eligibility definition up front**, in the loan agreement,
   before signing — not when the first borrowing-base certificate is rejected.

**And there is a second lien problem.** The OCC handbook warns that in some
states and industries *"the seller of the inventory may have an automatic prior
lien (also known as a purchase money security interest) on that inventory even
if there is no UCC filing."* **If ClarkDietrich holds a PMSI on the steel, the
ABL lender's advance rate on it drops or goes to zero.**

> **You may have to choose between mill trade credit and inventory-backed
> borrowing.** Model both and ask the lender which they prefer — most will want
> an intercreditor or subordination agreement with the mill. **[SIGN-OFF]**

### 1.3 Expect a lien on the house

SBA discounts collateral hard. From SOP 50 10 8:

| Asset | Counts toward "fully secured" at |
|---|---|
| New machinery & equipment | ≤75% of price |
| **Used machinery & equipment** | **≤50% of net book value** (80% *with* an Orderly Liquidation Appraisal) |
| Improved real estate | ≤85% of market value |
| **Trading assets (AR, inventory)** | **≤10% of current book value** |

Worked against a mid-case equipment build:

```
Truck $95k (used)      × 50%  =  $47,500
Moffett $38k (used)    × 50%  =  $19,000
Forklift $25k (used)   × 50%  =  $12,500
Saw $30k (new)         × 75%  =  $22,500
Racking $34.5k (new)   × 75%  =  $25,875
Inventory $270k        × 10%  =  $27,000
AR $250k               × 10%  =  $25,000
                                --------
TOTAL SBA COLLATERAL VALUE      $179,375
```

**Against a $650,000 request that is a ~$471,000 shortfall**, and SOP 50 10 8
then requires the lender to *"take available equity in the personal real
estate… solely owned by any direct and/or indirect owners of 20% or more."*

This is not a sign the deal is bad — it is the arithmetic of an
equipment-light, inventory-heavy startup. **Two mitigations worth real money:**

1. **Get an Orderly Liquidation Appraisal on the used equipment.** It moves
   used M&E from 50% to 80% of NBV — on $158,000 of used equipment that is
   about **+$47,000** of collateral value for a few thousand dollars of
   appraisal cost.
2. **Kentucky Small Business Credit Initiative collateral support** exists
   precisely for this gap.

**Relief worth knowing:** SBA does not require a real-estate lien where the
equity in the property is **less than 25% of fair market value.**

### 1.4 The truck cannot haul an inbound load

A 26,000 lb GVWR straight truck carrying a ~5,500 lb Moffett cannot legally
move a full inbound truckload of studs (~45,000 lb). **Buy inbound freight
delivered; the truck is for outbound job-site packages only.**

And do not benchmark its cost against ATRI's $2.336/mile Class 8 figure. A
straight truck running 45,000 miles a year rather than 100,000 spreads fixed
costs — driver, payment, insurance — over far fewer miles:

| Element | Per mile |
|---|---:|
| Fuel (8.0 mpg @ $5.571 Midwest diesel) | $0.696 |
| Driver (KY mean + 30% burden) | $1.730 |
| R&M and tires | $0.320 |
| Insurance | $0.200 |
| Licensing, IFTA, permits | $0.056 |
| Truck payment | $0.533 |
| **Total** | **$3.535/mile** |

**Benchmark on cost per delivery, not per mile.** A Louisville round trip
(~170 mi) is **~$601** before load and unload time.

---

## 2. What SBA actually requires

**Debt service coverage — SOP 50 10 8, p. 129, verbatim:**

> *"The Applicant's debt service coverage ratio (OCF/DS) must be equal to or
> greater than 1.15 on a historical and/or projected cash flow basis and 1:1 on
> a global basis."*

For startups (p. 128): projections must show **DSCR ≥1.15 within 2 years of
funding**. OCF is defined as EBITDA.

**The base case clears this comfortably — 2.65 in Year 1.** But note the
research's reverse test: on $650,000 of SBA debt at 9.75% over 10 years, annual
debt service is ~$101,900, so 1.15× coverage needs **~$117,000 of EBITDA** —
about **$1.5M of revenue at an 8% EBITDA margin**. The plan reaches $1.21M in
Year 1 and $2.91M in Year 2, so it satisfies the two-year test with room.

**Equity injection — and read the definition carefully:**

> *"an equity injection of at least 10 percent of the **total project costs**
> (all costs required to become operational…)"*

**That is total project cost, not 10% of the loan.** Including inventory and
working capital reserve, total project cost is well above the $185,000 of hard
capex — so the injection requirement scales with it. The $175,000 planned
injection should be checked against the full figure. **[SIGN-OFF]**

> **An exception worth one conversation:** SBA waives the injection when an
> existing business starts another **in the same 6-digit NAICS code** with
> identical ownership, same geographic area, as co-borrowers. Contracting is
> likely 238310 (Drywall & Insulation Contractors) and Supply is a merchant
> wholesaler code — **different codes, so this probably fails.** But it is
> worth ~$87,000 and costs one call to the CPA. Get it determined correctly;
> do not overclaim it.

**Useful injection route:** contributing **used equipment already owned by
Misty Valley Contracting** — a forklift, a truck — properly appraised, counts
as a non-cash asset toward the injection. That converts an existing
balance-sheet asset into SBA equity credit without new cash.

**Personal guarantees:** every owner of 20%+ signs an unlimited full guaranty.
Expect **Misty Valley Contracting itself to be asked for a corporate guaranty**
as an affiliate — that is the flip side of using its history to get approved.

### Two live deadlines

| Item | Detail |
|---|---|
| **SOP 50 10 8.1 takes effect 1 October 2026** | Applies to files issued a loan number on or after that date. **Ask the lender which SOP your file falls under** — it depends on when the number is assigned, not when you apply. |
| **FY2026 manufacturer fee waiver** | 7(a) loans ≤$950,000 to *manufacturers* carry a **0% upfront guaranty fee**. On a $650,000 loan at 75% guaranty the normal fee is ~$14,600. Whether a cut shop classifies as manufacturing is the same question that drives the LLET treatment in `01` §8 — **resolve NAICS once, and it pays twice.** |

---

## 3. The ratios the lender will demand

SOP 50 10 8 explicitly names them for a distributor: *"Current Ratio,
Debt/Tangible Net Worth, Debt Service Coverage, and… **inventory turnover,
receivables turnover, and payables turnover**… including discussion of Lender's
comparison to industry trends."*

**So put this table in the loan package.** Derived from SEC filings:

| Metric | GMS | Beacon | SiteOne | BLDR | **MVS target** |
|---|---:|---:|---:|---:|---|
| Gross margin | 31.2% | 25.7% | 34.8% | 30.4% | **26–32%** |
| SG&A % revenue | 22.9% | 16.8% | 30.1% | 25.2% | 18–24% |
| EBITDA margin | 7.6% | 8.9% | — | 9.1% | **6–10%** |
| Net margin | 2.1% | 3.7% | 3.2% | 2.9% | 2–5% |
| Inventory turns | 6.47× | 5.16× | 3.50× | 9.66× | **5–7×** |
| DIO (days) | 56.4 | 70.8 | 104.2 | 37.8 | 45–60 |
| DSO (days) | 46.8 | 44.7 | 42.4 | 25.5 | **45–65** |
| DPO (days) | 41.5 | 47.2 | 37.0 | 24.7 | **0–30 → 30–45** |
| **Cash conversion cycle** | **61.7** | 68.3 | 109.6 | 38.6 | **95–115 → 65–75** |
| Revenue / employee | $775k | ~$1,220k | $574–719k | $597k | **$550–700k** |
| Revenue / location | $17.2M | $16.7M | $7.0M | $26.6M | $1.5M → $8–12M |

**Model Year 1 CCC at 95–115 days declining to 65–75 by Year 3.** A lender who
sees a startup project 60 days in Year 1 — GMS's number — will discount the
whole projection.

**Very few small applicants present this comparison at all. It is
disproportionately persuasive.** And ask the lender to pull the **RMA Annual
Statement Studies** page for NAICS 4233xx — they have a subscription, it is the
spread they underwrite against, and asking signals you understand their process.

---

## 4. Location economics — a real, citable advantage

BLS OEWS, May 2025 mean annual wages:

| Occupation | Bowling Green | Elizabethtown | **Louisville** |
|---|---:|---:|---:|
| Laborers / freight movers | $40,020 | $38,110 | **$44,440** |
| Heavy truck drivers | $56,130 | $52,990 | **$62,930** |
| All occupations | $54,720 | $56,110 | **$62,310** |

**Bonnieville sits between the two cheapest labor markets in the state — a
10–14% structural cost advantage on yard labor against a competitor operating
out of Louisville, while serving the same jobs.** That belongs in the plan's
location section, sourced.

**Industrial lease:** Louisville marketwide asking is $6.62/SF NNN with 5.6%
vacancy; Elizabethtown listings run $8.00–$12.00/SF; Bowling Green averages
~$13.00/SF. No Hart County market data exists, but rural Bonnieville industrial
with yard should price **at or below the Elizabethtown low end — $4.50–$8.00/SF
NNN**. **[VERIFY with an actual quote.]**

> If the site is bought rather than leased, this becomes an **SBA 504** project
> — which is exactly what 504 is designed for. Model both.

---

## 5. Kentucky programs worth pursuing

| Program | What it does |
|---|---|
| **KSBCI collateral support** | Directly addresses the §1.3 shortfall — up to 20% of the loan (50% for qualifying businesses) |
| **KEDFA direct loans** | State subordinated debt for qualifying ventures |
| **Kentucky Small Business Tax Credit** | Up to $25,000 |
| **BRADD revolving loan fund / micro-loan** | Barren River Area Development District — Hart County is in it |
| **Opportunity Zones** | Check whether the site sits in a designated tract |

---

## 6. Where this business could end up

Recent comparables — and note that **three of the five companies in the comp
set were acquired in a fifteen-month window**:

| Deal | Value | Multiple | Closed |
|---|---|---|---|
| Home Depot / SRS Distribution | $18.25B | ~16.1× EBITDA | Jun 2024 |
| QXO / Beacon Roofing | $11B | 10.8× | Apr 2025 |
| **Home Depot (SRS) / GMS** | ~$5.5B EV | **~11.0× adj. EBITDA** | **Sept 2025** |

Where a business Misty Valley's size actually trades:

| Stage | Revenue | EBITDA | Multiple | Indicated value |
|---|---:|---:|---|---:|
| Year 3 | $4.5M | $358k | 3–5× SDE | $1.1M – $1.8M |
| Year 5 | $8M | $640k | 4–6× (commodity) | $2.6M – $3.8M |
| Year 8, automated line | $18M | $1.6M | 6.5–9.5× | $10.4M – $15.2M |

**The single highest-leverage strategic point:** privately held building
products businesses trade at **4–6× on a commodity profile and 6–8× on a niche
profile.** A cut shop with real fabrication capability is the difference
between those brackets — roughly a two-turn premium, worth ~$1.3M of enterprise
value at $640k of EBITDA.

**That is the financial argument for the equipment ladder, and it is the same
argument as the strategic one in `06`.** But say the honest counterweight too:
single-location yards with commodity products and heavy owner involvement trade
at the *bottom* of the range, near 2–4×. **The multiple is earned, not
assumed.**

---

## 7. The open item that matters most

**Delivered $/ton for domestic 20–25 gauge stud and track. Three mill quotes.**

It drives cost of goods, gross margin, inventory value, the borrowing base, and
the entire revenue model — and it is the one number the research could not
source, because it is negotiated and confidential.

**Three phone calls. Nothing else in this analysis has a comparable return.**

Other open items, in priority order:

1. Kentucky workers' comp loss costs for class 8018 / 8232 / 7228 — get a bound
   quote; the class rate range is $0.09–$11.52 per $100 of payroll
2. Actual Bonnieville site lease and yard rate
3. NAICS classification of the cut shop — drives the SBA manufacturer fee
   waiver, the LLET treatment, and the equity-injection exception
4. Which SOP the file falls under
5. Whether the mills assert a PMSI
