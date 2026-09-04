# Unit Economics — Both Numbers Are Wrong, In Opposite Directions

Ben's stated economics: **buy a container for $11,000 landed, sell it for
$22,000.** A 50% gross margin.

Researched against live market data, both numbers are wrong — and the errors
point in opposite directions, which is exactly why they've gone unnoticed. The
sell price is too *low*, the cost is far too *low*, and the two errors have
been cancelling each other out into a margin that looks plausible.

---

## 1. The headline

| Claim | Verdict | Reality |
|---|---|---|
| Container costs **$11,000** landed | **Arithmetically impossible** | **$38,000–$42,600** |
| Container sells for **$22,000** | **~4× too low** | **$81,500–$126,000** at distributor pricing |
| **50% gross margin** | **Not real, not sustainable** | Real distributors earn **~31%**; steel framing earns *less* |
| Working capital | **The actual constraint** | **~137 days**; $698K locked at just 4 containers/month |

The single fact that settles it:

> **Ocean freight alone is $9,587 per 40ft container.**
> That is 87% of the entire $11,000 "all-in" budget, before one dollar of
> steel, duty, brokerage, or trucking.

Drewry World Container Index, Shanghai→New York, assessed 3 September 2026 —
up 3% week on week. ([Drewry](https://www.drewry.co.uk/supply-chain-advisors/supply-chain-expertise/world-container-index-assessed-by-drewry) · [Daily Cargo News](https://www.thedcn.com.au/news/world-container-index-3-september-2026))

---

## 2. Why $11,000 cannot be a landed cost

Work it backwards. Start with $11,000, subtract the freight, and see what's
left for everything else:

```
Claimed all-in landed                                  $11,000
Ocean freight alone (Drewry, 2026-09-03)             −  $9,587
──────────────────────────────────────────────────────────────
Left for goods + 75% duty + fees + dray to Kentucky   $ 1,413
```

Solve for the supplier invoice that fits in $1,413, at the verified 75% duty
stack (see `02`), and you get an **FOB invoice of about $788 per container** —
roughly **$39 per tonne** for ~20 tonnes of galvanized, roll-formed, punched,
cut-to-length steel.

Three reference prices for scale:

| Benchmark | $/tonne | vs. the $39 implied |
|---|---|---|
| Chinese ferrous **scrap** | ~$300–350 | **8–9× higher** |
| Chinese **HRC export**, FOB | ~$490 | **12× higher** |
| Chinese **galvanized sheet**, FOB | $650–920 | **17–24× higher** |

The implied number is a fifth of *scrap*. It isn't a discount; it's a
different unit.

**The absolute arithmetic floor**, using Chinese HRC export parity and
assuming free roll-forming, free galvanizing and zero supplier margin:

```
20 t × $490/t HRC parity     = $ 9,800
Section 232 at 50%           = $ 4,900
Ocean freight                = $ 9,587
Fees, broker, dray (floor)   = $ 2,750
─────────────────────────────────────
IMPOSSIBLE-TO-BEAT FLOOR       $27,037
```

Even that floor is 2.5× the stated budget, and it's a fantasy price.

### What the $11,000 probably is

Four possibilities. The first two are ordinary misunderstandings; the last two
are reasons to walk away.

1. **It's an FOB or EXW quote read as delivered.** Most likely. $11,000 ÷ 20 t
   = $550/tonne is a *coherent* FOB price for commodity galvanized keel. It is
   simply not a landed cost. **Fix: get the Incoterm in writing.**
2. **It's a stale number.** Section 232 doubled to 50% in June 2025 and moved
   to full customs value in April 2026; transpacific freight spiked in 2026. A
   2024 quote could plausibly have been near $11,000. The plan may be priced
   off a market that no longer exists.
3. **🚩 Undervaluation.** The only way to actually hit $11,000 is to understate
   the invoice. That is customs fraud under 19 USC 1592, and **the importer of
   record carries it personally — not the Chinese supplier.**
4. **🚩 Dumped or non-conforming product.** Finished fabricated steel at
   $550/tonne, when the US galvanized coil it's made from runs ~$1,477/tonne, is
   37% of input cost. That is a textbook dumping signature — and see `02` on why
   that invites the one risk that ends companies.

---

## 3. Why $22,000 is too low — the more interesting error

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

## 4. Why 50% gross margin isn't a real number

Actual gross margins from public filings:

| Company | Period | Gross margin |
|---|---|---|
| **GMS Inc** (wallboard + **steel framing** distributor — the direct comp) | FY2025 | **31.2%** |
| SiteOne Landscape Supply | FY2025 | 34.8% |
| Builders FirstSource | FY2025 | ~30.4% |
| Beacon Roofing | Q3 2024 | 26.3% |

([GMS FY2025 10-K](https://www.sec.gov/Archives/edgar/data/1600438/000162828025032103/gms-20250430.htm) · [SiteOne](https://www.sec.gov/Archives/edgar/data/1650729/000165072926000005/site-20251228.htm) · [BLDR](https://investors.bldr.com/news/news-details/2026/Builders-FirstSource-Reports-Fourth-Quarter-and-Full-Year-2025-Results-Provides-2026-Financial-Outlook/))

A 50% gross margin would be **~19 points above the best specialty distributor
in any adjacent category.** That is not a margin; that's a mispricing.

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
