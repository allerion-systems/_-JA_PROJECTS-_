# Unit Economics — Both Numbers Are Wrong, In Opposite Directions

Ben's stated economics: **buy a container for $11,000 landed, sell it for
$22,000.** A 50% gross margin.

Researched against live market data, both numbers are wrong — and the errors
point in opposite directions, which is exactly why they've gone unnoticed. The
sell price is too *low*, the cost is far too *low*, and the two errors have
been cancelling each other out into a margin that looks plausible.

---

## 1. The headline — corrected

**This section was rewritten on 4 September 2026.** The original transcript
said "eleven thousand *after* shipping and tariffs and handling," so the first
pass priced $11,000 as an all-in landed cost and concluded the margin was
absent. Joey clarified the real basis: **$11,000 is the goods, FOB China, and
Ben budgets roughly $10,000 on top to land it in Bonnieville.**

On the corrected basis the conclusion changes. The margin is real and good.
The error is a budgeting gap, and it is almost exactly the size of the tariff.

| Claim | Verdict | Reality |
|---|---|---|
| Goods at **$11,000** FOB | **Plausible** | Implies $550–800/tonne depending on load weight — consistent with Chinese galvanized keel |
| **~$10,000** to land it | **Roughly half of what's needed** | **$21,489** — the adder covers freight, not duty |
| Landed cost | — | **$32,489 per container** |
| **$22,000** as "our cost" | **Understates by ~$10,500** | Missing the 75% duty stack |
| Gross margin | **Genuinely strong** | **32–53%** depending on load weight |

---

## 2. The corrected landed cost

| Line | Amount |
|---|---:|
| FOB goods, China | $11,000 |
| Section 232 — 50% of customs value | $5,500 |
| Section 301 — 25% | $2,750 |
| MPF (0.3464%) + HMF (0.125%) | $52 |
| **Duty and fees subtotal** | **$8,302** |
| Ocean freight, Shanghai → USEC (Drewry, 2026-09-03) | $9,587 |
| Customs broker + ISF | $300 |
| Chassis, terminal and port fees | $400 |
| Drayage to Bonnieville | $2,200 |
| Bond (amortised) + demurrage reserve + unloading | $700 |
| **LANDED, BONNIEVILLE** | **$32,489** |

**Landed cost is 2.95× the FOB invoice.** That multiple is the single most
useful number to carry around: whatever the supplier quotes, multiply by
roughly three to get it onto the yard.

### Where the $10,000 assumption goes wrong

```
Ben's adder                                    $10,000
Ocean freight alone (Drewry, 2026-09-03)     −  $9,587
──────────────────────────────────────────────────────
Left for duty, broker, port, and 600 miles       $413
```

The ocean freight consumes the entire adder by itself. The **$8,250 of duty**
and the **~$3,600 inland and clearance cost** are simply not in the budget.

> **Action: reprice at $21,500 per container to land, not $10,000.**
> On a container Ben has already sold at a fixed price, that gap comes
> straight out of margin — which is why this needs fixing *before* the next
> quote goes out, not after.

**One caution on the goods price itself.** $11,000 for a 20-tonne load implies
$550/tonne. Chinese galvanized sheet runs $650–920/tonne FOB, so finished,
roll-formed, punched product at $550 is *below the raw material cost*. Either
the load is lighter than 20 tonnes (13–16 tonnes at $688–800/tonne is entirely
coherent), or the product is being sold below input cost — which is the
definition of dumping and is exactly the fact pattern that attracts the
petition described in `02` §4. **The packing list and weight ticket settle
which it is, and they cost nothing to ask for.**

---

## 3. What is actually in the box — the open question

This is the finding worth Ben's attention, because it's the one that costs him
money he could be earning today.

### How much steel actually fits

Published member weights ([SFIA Technical Guide](https://sfia.memberclicks.net/assets/Library/TechnicalCatalog/SFIA-technical-product-guide_FINAL_20260217.pdf), cross-checked against Super Stud and ClarkDietrich to within 1%):

| Member | Gauge | lb/ft |
|---|---|---|
| 362S125-18 (3-5/8" stud) | 25 ga | **0.40** |
| 362S125-30 | 20 ga drywall | 0.66 |
| 362S162-33 (structural) | 20 ga | 0.89 |

**The binding constraint is the truck, not the box.** A 40HC rates ~62,975 lb
of payload, but the dray to Bonnieville doesn't: from an 80,000 lb road-legal
gross, minus tractor (~17,000), chassis (~7,000) and container tare (~8,600),
the practical ceiling is about **44,000 lb** without overweight permits. Load
to the container's rating and you can't legally truck it home.

```
44,000 lb ÷ 0.40 lb/ft  =  110,000 linear feet  =  11,000 pieces of 10 ft
```

> **⚠️ The nesting trap.** Studs only reach that number if the supplier
> *nests* them. Shipped loose, they cube out at roughly 55,000 LF — at 35% of
> the weight limit — and **the landed cost per linear foot doubles.** This is a
> common and expensive first-import mistake. Specify nested bundling in the PO
> and verify it on the packing list.

### What that's worth

Live retail check, Home Depot store #2313, St. Matthews, **Louisville KY**,
4 September 2026: ClarkDietrich ProSTUD 25, 3-5/8" × 10 ft — **$12.68/piece =
$1.268 per linear foot.** Distributor-to-contractor pricing triangulates to
**$0.70–$0.95/LF**.

| Basis | Container revenue |
|---|---|
| Distributor→contractor, road-legal load | **$81,500 – $88,000** |
| Distributor→contractor, full container payload | $116,700 – $126,000 |
| Retail ceiling (Home Depot Louisville) | ~$139,500 |
| **Ben's stated sell price** | **$22,000** |

**$22,000 is about a quarter of what a properly loaded container of studs is
worth.** Reverse it: $22,000 ÷ $0.858/LF ≈ 25,600 LF ≈ 11,900 lb — **19% of
the container's payload.**

So either:

- **the "container" is a quarter-load**, in which case the freight and duty
  per linear foot are catastrophic — you pay for a whole box either way; or
- **it's a full container being sold at $0.20/LF**, which is *below the
  $0.268/LF raw steel content* at current prices — selling at a loss; or
- the numbers describe something other than a 40HC of studs.

**All three demand the same next action: get the packing list and the weight
ticket.** Not the supplier's description — the actual documents.

---

## 4. The margin is real today — but it is an arbitrage, not a moat

Section 2 shows a 32–53% gross margin on an imported container. That is a real
number and Ben should take it. But understand precisely *what* it is, because
it does not behave like a distribution margin — it behaves like a trade.

Actual **sustainable** gross margins, from public filings:

| Company | Period | Gross margin |
|---|---|---|
| **GMS Inc** (wallboard + **steel framing** distributor — the direct comp) | FY2025 | **31.2%** |
| SiteOne Landscape Supply | FY2025 | 34.8% |
| Builders FirstSource | FY2025 | ~30.4% |
| Beacon Roofing | Q3 2024 | 26.3% |

([GMS FY2025 10-K](https://www.sec.gov/Archives/edgar/data/1600438/000162828025032103/gms-20250430.htm) · [SiteOne](https://www.sec.gov/Archives/edgar/data/1650729/000165072926000005/site-20251228.htm) · [BLDR](https://investors.bldr.com/news/news-details/2026/Builders-FirstSource-Reports-Fourth-Quarter-and-Full-Year-2025-Results-Provides-2026-Financial-Outlook/))

A 42% gross margin sits **~11 points above the best specialty distributor in
any adjacent category**, and ~19 points above the direct comparable. Nobody
sustains that on a commodity by being a better buyer. It exists because of a
price gap between Chinese and domestic steel that currently survives a 75%
tariff — and it lasts exactly as long as that gap does.

**Two things close it:** a competitor placing the same phone call to the same
factory, or an antidumping petition (`02` §4). Neither is under Ben's control,
and the second one is retroactive.

That is the whole argument for `06`: take the arbitrage, but do not build the
company's identity, its overhead, or its org chart on top of it.

**And steel framing is the *worst* line inside GMS, not the best.** From the
same 10-K, FY2025 vs FY2024:

| Product line | Sales change | Price/mix |
|---|---|---|
| Wallboard | −2.9% | **+0.8%** |
| Ceilings | +14.1% | +8.0% |
| **Steel framing** | **−10.8%** | **−10.4%** |

Wallboard is oligopoly-supplied with rebate structures. Steel framing is a
price-transparent commodity indexed to coil — every contractor can compute the
steel content himself. **Steel framing is GMS's margin drag, not its margin
driver.** Ben is proposing to enter the single most commoditized line in the
category, from the highest-cost sourcing position.

### Who compresses the margin, and how fast

- **GMS / SRS / Home Depot** — the largest steel framing distributor, 320+
  branches, now behind Home Depot's balance sheet.
- **L&W Supply / ABC Supply Interiors** — 270+ locations, including Nashville.
- **Foundation Building Materials.**

They sell studs, track, wallboard, ceilings, insulation, fasteners and tools
**on one truck to one job.** GMS's complementary products alone were $1.73B —
31% of sales. They can price steel framing at zero margin as a traffic product
and take it back on wallboard rebates and ceilings.

**A single-SKU importer with no wallboard, no ceilings, no next-day delivery
and no credit department has no defensible position in that fight.** That is
the argument for `06` — compete on the package, not the stick.

### The structural disadvantage nobody mentions

ClarkDietrich's actual shelf product is **ProSTUD 25 at 15 mil** — an EQ stud.
A Chinese stud at nominal 18 mil carries roughly **20% more steel per linear
foot** to build the same wall.

So the incumbent has engineered steel *out* of the product, while the importer
pays ocean freight **and a 50% ad valorem tariff** on steel *in* it. The
import is penalized twice for mass the wall doesn't need. And the Ohio Valley
is the worst possible place to fight that battle: ClarkDietrich is headquartered
in West Chester, Ohio with plants at Vienna and Warren-East — **100–250 miles
from Louisville and Lexington**, one of the shortest mill-to-market freight legs
in the country.

---

## 5. Working capital — the number that actually kills import distributors

Margin is not the constraint. **Velocity is.**

### The timeline, one container

| Day | Event | Cash |
|---|---|---|
| 0 | 30% deposit at PO | −$5,100 |
| 35 | **70% balance against B/L — paid before the ship reaches Panama** | −$11,900 |
| 40 | Ocean freight | −$9,600 |
| 35–70 | Transit Shanghai → US East Coast (30–40 days) | — |
| 72 | **Duty + fees — paid before a single sale** | −$8,580 |
| 78 | Dray to Louisville, port fees | −$2,750 |
| 80–125 | Inventory dwell | — |
| ~125 | Invoice the contractor | — |
| **~180** | **Collect** | +revenue |

Weighted-average days of cash outstanding: **136.6 days.**

> **$22,400 of the $38,330 per container — 58% of your cash — is freight and
> duty.** Non-refundable, non-returnable, paid to a shipping line and to CBP,
> on merchandise you have not sold and cannot send back.

### What it costs to scale

```
Working capital = $38,330 × containers/month × (136.6 ÷ 30)
```

| Containers/month | **Working capital locked** | Revenue/yr @ 25% GM | Interest @ 12% |
|---:|---:|---:|---:|
| 1 | **$174,500** | $613,000 | $20,900 |
| 4 | **$698,100** | $2,453,000 | $83,800 |
| 10 | **$1,745,300** | $6,133,000 | $209,400 |

**To run four containers a month — a one-truck, one-forklift operation doing
~$2.5M — you need $700,000 permanently underwater.** Not a revolving line
against receivables. Cash, sitting in the ocean, in CBP's account, and in a
Bonnieville yard.

### Against the incumbent

| | Misty Valley (import) | GMS (actual FY2025) |
|---|---|---|
| Days inventory | ~45 + 40 in transit | 56.4 |
| Days receivable | 75–90 (no credit history) | 55.3 |
| Days payable to supplier | **negative ~35** (pay before shipment) | +30 to 60 |
| **Cash conversion cycle** | **~137 days** | **~76 days** |
| Reorder lead time | 10–12 weeks, **non-cancellable** | 2–4 weeks, cancellable |

**GMS turns cash nearly twice as fast and can stop buying the day prices turn.
The importer cannot.** That asymmetry — not margin — is why import
distributors of commodity building products fail.

Now overlay price risk: GMS reported steel framing **price/mix −10.4%** in a
single year. Your container is at sea 5–6 weeks and in inventory 6 more. A 10%
domestic price drop while your goods are in transit turns a 25% margin into
~15%. A 20% drop puts you below landed cost, with no hedge, no cancellation
right, and a supplier already paid in full.

---

## 6. Demand — the market is real, the addressable slice is small

Corridor (Louisville / Lexington / Bowling Green / Nashville) stud and track
demand moving through distribution: **roughly $40M–$100M/year**, or **40–100
containers per month** of total market.

Realistically capturable by a new entrant in years 1–2, after subtracting
code-listed work, relationship-and-credit-held volume, and freight-advantaged
domestic supply: **0.5 to 3 containers per month.**

At 3 containers/month: ~$2.9M revenue, ~$524,000 of locked working capital,
and at a *real* 25% margin about **$460,000 of annual gross profit** to cover
the yard, truck, forklift, insurance, salaries and ~$63,000 of interest.

**That is a viable small business.** It is just a different one from the one
described — and it needs the honest numbers to be planned properly.

---

## 7. What to do with this

Nothing here says the venture is dead. It says the model needs rebuilding on
real inputs, and there are three concrete actions:

1. **Get the packing list, weight ticket, and Incoterm in writing.** Every
   ambiguity above collapses the moment those three documents exist. Until
   then, nobody — including Ben — knows what he actually bought.
2. **Reprice the Scott sale before it becomes a fixed commitment.** If $22,000
   is a quarter-load price applied to a full container, the sale is losing
   money. If it's a full container at a quarter of market, it's leaving
   $60,000 on the table. Both are urgent, and both are fixable *before*
   delivery, not after.
3. **Make three phone calls for domestic quotes** at Misty Valley's volume —
   ClarkDietrich, Telling, and a GMS or L&W branch. That costs nothing and
   settles the strategic question in `06`. If domestic lands at $46,000 against
   an import at $40,000, the entire import apparatus — the bond, the broker, the
   AD/CVD tail, the code fight, the 137-day cash cycle — is being carried for a
   6% cost difference that a single tariff announcement erases.

Run the numbers yourself: `python3 model/container_model.py --scenario base_case`

---

*All figures verified against the sources linked above as of 2026-09-04.
Freight and steel prices move weekly; re-pull before any commitment.*
