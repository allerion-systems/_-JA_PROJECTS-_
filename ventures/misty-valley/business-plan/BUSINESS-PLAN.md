# Misty Valley Supply LLC
## Business Plan

**Bonnieville, Kentucky**
Prepared September 2026 · Draft for review

---

> **How to read this plan.** Every financial figure traces to a model in
> `../model/`, and every market and regulatory claim traces to a cited source
> in the companion analyses (`../01` through `../06`). Assumptions are labelled
> as assumptions. Items requiring a licensed attorney, CPA, or customs broker
> are marked **[SIGN-OFF]** and are listed together in §11.
>
> Nothing here is legal, tax, or investment advice.

---

# 1. Executive Summary

## 1.1 The business

Misty Valley Supply LLC distributes cold-formed steel (CFS) framing to
commercial construction projects across the I-65 corridor — Louisville,
Elizabethtown, Bowling Green, and Nashville — from a cut shop and yard in
Bonnieville, Kentucky.

We are not primarily a price competitor. **We sell the framing package, not the
stick.** Material arrives at the job site cut to finished length, banded by wall
type, tagged to the plan, and delivered by floor and phase. The contractor's
crew opens a bundle and builds instead of spending its first two days hauling,
measuring, and cutting at framing labor rates.

## 1.2 Why us

Misty Valley Supply is the supply arm of **Misty Valley Contracting**, a
Kentucky framing and drywall subcontractor with over a decade of commercial
work. That is not a marketing line — it is the entire competitive premise:

- **We are our own first customer.** Contracting consumes the product, which
  gives Supply a demand floor from day one and a real testing ground before we
  sell a package to a stranger.
- **We know what a bad delivery costs** because we have paid for it. The
  packaging format is designed by people who have installed the material.
- **Relationships already exist.** Ten years of GC and owner relationships in
  central Kentucky are the customer acquisition channel.

## 1.3 The financial picture

Base case, three years, from `../model/proforma.py`:

| | Year 1 | Year 2 | Year 3 |
|---|---:|---:|---:|
| Truckloads delivered | 15 | 36 | 55.5 |
| **Revenue** | **$1,211,250** | **$2,907,000** | **$4,481,625** |
| Gross profit | $304,125 | $729,900 | $1,125,262 |
| Gross margin | 25.1% | 25.1% | 25.1% |
| Operating expense | $180,264 | $544,320 | $767,280 |
| **EBITDA** | **$123,861** | **$185,580** | **$357,982** |
| EBITDA margin | 10.2% | 6.4% | 8.0% |
| **DSCR** | **2.65** | **2.73** | **4.36** |

**Breakeven is 0.83 truckloads per month.** Roughly one load every five weeks
covers all fixed overhead and interest.

Two things to note honestly. **Gross margin is planned at 25.1%, below GMS
Inc's 31.2%** — we are a single-line distributor without their product mix, and
planning at their margin would be wishful. And **Year 2 EBITDA margin dips to
6.4%** because overhead steps up — a driver, a second yard hire, admin — ahead
of the volume that pays for it. That dip is deliberate and visible rather than
smoothed away.

## 1.4 The funding request

| Source | Amount | Purpose |
|---|---:|---|
| Owner equity | **$175,000** | Equity injection |
| Term debt (7 yr) | **$200,000** | Equipment, truck, yard setup |
| Revolving line of credit | **$700,000** | Inventory and receivables |
| **Total facility** | **$1,075,000** | |

Peak revolver utilisation is **$517,778**, against a $700,000 line — sized with
headroom, not to the edge.

**The binding constraint is working capital, not demand.** At an 80-day cash
conversion cycle, every step up in volume funds inventory and receivables
before it collects. The model shows the plan running dry even while posting
positive EBITDA every month if the line is undersized. That is the single most
important thing a lender should understand about this credit.

## 1.5 What we are asking readers to check

This plan is deliberately explicit about its own weak points:

1. **The service margin is load-bearing.** A stress case — material price down
   10%, receivables out to 90 days, and the cut/kit uplift halved by a
   competitor — turns EBITDA negative and pushes breakeven to 2.05 loads/month.
   The plan must defend the service premium. See §9.1.
2. **Sourcing strategy is phased on purpose.** Year 1 buys domestic. Imported
   material is cheaper per foot but ties up materially more cash and carries
   regulatory tail risk. See §5.3.
3. **Volume assumptions sit inside a researched range**, not above it. See §3.4.

---

# 2. Company & Structure

## 2.1 Entity

**Misty Valley Supply LLC**, a Kentucky limited liability company, to be formed
in Hart County. Kentucky filing fee is $40 (KRS 275.055), and Kentucky's LLC
Act gives strong effect to freedom of contract in the operating agreement
(KRS 275.003(1)).

## 2.2 Group structure

The intended end state is a holding company over separate operating and
asset-holding entities:

```
                    Misty Valley Enterprises LLC        (holds; never operates)
                                 |
        ┌────────────┬───────────┴──────────┬──────────────┐
   Contracting     Supply              Properties      Equipment
   (installs)   (distributes)      (yard, building)  (trucks, saws)
        ▲            ▲                     │               │
        └── leases ──┴─────── from ────────┴───────────────┘
```

Rationale, in short: operating companies generate liability and hold thin
balance sheets; the valuable assets sit in entities with no customers, no job
sites, and nothing to be sued over, and are leased to the operators at market
rates under written leases. Full reasoning, the Kentucky-specific traps, and
the veil-piercing discipline required to make it hold are in
`../01-entity-structure.md`.

**Sequencing matters and is deliberate.** Form Supply now. Form the holding
company and the asset entities once Supply is proven. Building a five-entity
structure before the business has sold a load optimises the wrong thing — and
each Kentucky entity carries a $175 minimum LLET that does not credit upward
(KRS 141.0401), so entity count has a real annual cost.

## 2.3 Two Kentucky questions that must be answered before we invoice

Both are five-figure annual items and both are flagged **[SIGN-OFF]**:

1. **Is the cut shop "manufacturing" or a "service" for LLET purposes?** Under
   KRS 141.0401(1)(d), activities other than manufacturing, producing,
   reselling, retailing or wholesaling get **no cost of goods sold deduction at
   all** — meaning 100% of that revenue would be taxed as gross profits. If
   cutting to length and assembling packages qualifies as "producing," costs
   come back in. This is the single largest open tax question in the plan.
2. **Sales and use tax treatment.** Under 103 KAR 26:070 a construction
   contractor is the *consumer* of materials it incorporates into realty and
   generally cannot issue a resale certificate. Supply's sales to contractors
   are therefore generally **taxable retail sales**, not exempt wholesale
   sales. Getting this wrong across millions in revenue is a catastrophic
   assessment.

## 2.4 The related-party rule we adopt on day one

Supply will sell to Contracting. On fixed-price work that is unremarkable. On
cost-plus, GMP, open-book, or public work it is governed — AIA A102–2017 §7.8
defines a "related party" to include any affiliate under common ownership and
requires the contractor to disclose the transaction and the anticipated cost to
the Owner **in advance and in writing**, and to buy elsewhere if the Owner does
not authorise it.

**Policy, effective before the first invoice:** Supply publishes a price list
and sells to Contracting at the same price an unrelated contractor of similar
volume pays; every non-lump-sum job gets written advance disclosure. This
satisfies arm's-length pricing for tax and for veil-piercing at the same time.
See `../01` §6.

---

# 3. Market

## 3.1 The honest market picture

**The regional market is flat to declining, not growing.** A plan that claimed
otherwise would not survive a lender's analyst, so here it is up front:

| Indicator | Latest | Change |
|---|---|---|
| Nashville MSA construction employment | 65.3k (Jul 2026) | **−2.8% YoY** |
| Louisville MSA construction employment | 35.5k (Jul 2026) | **−3.0% YoY** |
| East South Central nonres. building starts | YTD May 2026 | **−16.3%** |
| US private nonresidential ex-data-centers | Jun 2026 | **−7.9% YoY** |
| Dodge total construction starts forecast | 2026 | **−0.4%** |

Sources: [BLS Nashville](https://www.bls.gov/regions/southeast/summary/blssummary_nashville.pdf),
[BLS Louisville](https://www.bls.gov/regions/southeast/summary/blssummary_louisville.pdf),
[ConstructConnect](https://news.constructconnect.com/regional-us-construction-activity-reveals-two-speed-nonresidential-market),
[Construction Dive](https://www.constructiondive.com/news/construction-spending-june-2026-drop-data-centers/826936/).

**This plan is a share-capture plan in a soft market, not a rising-tide plan.**
That is a harder sell and a slower ramp — and it is why the volume assumptions
in §3.4 are deliberately conservative and the fixed-cost base in §7 is
deliberately thin. A low breakeven is what makes a soft market survivable.

**Two genuine bright spots in the trade area:**

- **Nashville's outperformance is structural.** Tennessee construction
  employment grew 27.0% from 2019 to 2026 against 11.0% nationally — roughly
  2.5× the national rate. The current 12 months are a pause, not a reversal.
  Hotel construction in Tennessee outpaces the nation, led by Nashville, with
  a pipeline of 26 projects delivering 12,248 keys and residences over 36
  months — and hospitality is among the most partition-intensive building
  types there is.
- **Warren County (Bowling Green), 40 minutes south, is the strongest
  sub-market in the immediate area** — a fourth consecutive year of record
  growth and a projected 47.3% population gain, the largest in Kentucky.

**Data centers are the only growing category nationally** (+45.8% YoY), and
Kentucky has roughly 30 projects in play including a 1.6M SF hyperscale campus
in West Louisville and a $9.6B Carroll County project. We treat this as
opportunity, not as the plan: the buyer is a national GC with national
purchasing agreements, and several Kentucky counties have enacted data center
moratoria.

**A caution we would rather state than have found:** big-box distribution
centers are a *low* CFS-intensity building type — mostly tilt-up shell with a
small office fit-out. The I-65 logistics corridor is excellent for our
*location*; it is not by itself a source of stud demand.

## 3.2 Demand drivers

CFS framing concentrates in interior partitions across all commercial
construction, in mid-rise multifamily and hospitality, and in healthcare.
Per AGC's 2026 outlook the healthiest categories for us are **healthcare**
(medical office +24 net, hospitals +20) and **hospitality**; education has
turned negative (K-12 −1, higher ed −5) and multifamily has cooled sharply.

**The strongest tailwind is structural, not cyclical.** FMI's 2024 Labor
Productivity Study found **non-MEP specialty trade contractors — which is
precisely our customer — already run 22% of craft hours through prefabrication
and expect 40% within five years**
([FMI](https://fmicorp.com/insights/industry-insights/2024-labor-productivity-study-part-2-prefabrication)).
Our customers are already moving toward pre-processed material. We are selling
with that current, not against it.

**And the labor shortage that makes the case is well documented.** AGC's 2026
outlook reports **82% of firms having difficulty filling hourly craft
positions — the highest in three years** — rising to **86% among open-shop
firms**, with 57% citing worker supply as a major 2026 concern and 63% having
had a project postponed, scaled back, or cancelled in the past six months
([AGC 2026 Outlook](https://www.agc.org/sites/default/files/users/user21902/2026%20Construction%20Hiring%20and%20Business%20Outlook%20Report_Final2.pdf)).

## 3.3 Competitive landscape — and where we are genuinely differentiated

The corridor is well served, and by serious operators:

| Competitor | Corridor presence |
|---|---|
| **Valley Interior Products (GMS / SRS / Home Depot)** | **Bowling Green, Louisville, Lexington, Nashville, Spring Hill** |
| **ABC Supply Interiors / L&W Supply** | Louisville, Lexington, Bowling Green, Owensboro, Nashville |
| **Foundation Building Materials** | Nashville (×2), Louisville |
| ClarkDietrich, Telling, MarinoWARE, CEMCO, SCAFCO | Manufacturers; Ohio plants 100–250 mi away |

GMS was acquired by Home Depot through SRS Distribution in September 2025 at
roughly $5.5B enterprise value. **Our largest competitor now has Home Depot's
balance sheet and a yard in every city we sell into.**

### What we must NOT claim

Two corrections that this plan makes deliberately, because getting them wrong
in front of a sophisticated buyer would cost the room:

**1. Sequenced delivery is not our differentiator — the incumbent already does
it.** From GMS's own 10-K: *"As a value-added service, we often deliver our
products directly to the specific room where they are installed… we need to
load the truck at the branch so that the amount and type of wallboard for each
room of the building can be off-loaded… in the right sequence."* Valley
Interior Products advertises "stock and scatter" at every corridor yard.

**2. The 30–60% labor savings quoted around prefabrication belong to
*panelized assemblies*, not to pre-cut loose material.** The only peer-reviewed
field measurement we located puts saw-trigger time at **13.2 seconds per stud**
and average saw use at **≈6.2 minutes per worker per day**
([Schutt et al., *Annals of Work Exposures and Health* 68(8), 2024](https://academic.oup.com/annweh/article/68/8/874/7698016)).
Eliminating 100% of saw time would save about 1.3% of a working day. **Any plan
built on borrowed panelization percentages collapses the first time a
preconstruction team checks it.**

### What genuinely is white space

**The cut-and-label layer.** No distributor in the corridor cuts. Manufacturers
will roll-form custom lengths, but with minimum order quantities and lead times
that do not serve a sub who needs 400 studs at three odd lengths on Thursday.
Our real advantage over a mill run is **small-quantity, fast-turn, mixed-length
orders that a mill will not take** — combined with a location that reaches four
metros same-day, and takeoff credibility that comes from an affiliated
installer.

### The honest value of that

Building up from the measured cut cycle and avoided waste rather than from
marketing claims:

| Component | Value per stud |
|---|---|
| Field cut-cycle labor avoided (measure, walk, cut, stack, carry) | $0.37 – $0.68 |
| Waste avoided (≈10% estimating factor → low single digits) | ≈$0.64 |
| **Total value created** | **≈$1.00 – $1.30** |

On a stud costing $8–$12 that is **8–15% of material cost**. A supplier can
sustainably capture perhaps a third to a half of the value it creates, which
**caps the defensible premium at roughly 3–7%**. The financial model prices the
service at **6.25% of material price** — at the top of that band, and not above
it. A blanket 10%+ uplift would be rejected by any sub who does the arithmetic.

### Threats we take seriously

- **ClarkDietrich TRAKLOC** — a telescoping drywall framing system that removes
  field cutting *as a product*, from the largest CFS manufacturer in North
  America, with a case study claiming 25% faster interior framing. This attacks
  our value proposition without anyone building a cut shop.
- **Imitation.** A chop-saw line, a label printer and a takeoff person is not a
  moat. A motivated Valley Interior Products branch manager could match the
  capability in 12–24 months with better purchasing power and existing credit
  relationships. **Our moat is execution — accurate takeoffs, on-time delivery,
  zero labeling errors — plus the installer credibility behind it.**
- **Credit terms.** Net 30 is the industry baseline, and customers are
  effectively buying 30–60 days of free working capital from a Home
  Depot-backed distributor. A package that saves $0.50/stud does not compensate
  for terms 30 days shorter. This is a financing problem, not a marketing one,
  and it is why the facility in §7.4 is sized as it is.

**Cautionary precedent we should own rather than ignore:** Prescient — the
best-funded light-gauge-steel kit-of-parts company, valued at $650M in 2018 —
closed its Arvada plant permanently in 2023. Katerra and Veev failed similarly.
**Capital-intensive offsite construction has a poor survival record.** Our
distinction is real and worth stating: this is a **low-capex cut shop attached
to a distribution business**, not a factory. Startup capital expenditure is
$185,000, not $185 million, and the business breaks even at 0.83 loads/month.

## 3.4 Demand sizing

Corridor stud-and-track demand moving through distribution is estimated at
**$40M–$100M per year**, equivalent to **40–100 truckloads per month** of total
market (`../04-unit-economics.md` §6).

Realistically capturable by a new entrant in years 1–2, after subtracting
relationship-held volume, credit-held volume, and freight-advantaged domestic
supply: **0.5 to 3 loads per month.**

The base case ramps from 0.5 to 5.0 loads/month over three years, reaching
roughly 5–12% of the low end of the corridor estimate by year 3 — **deliberately
inside the researched range rather than above it.**

**[RESEARCH GAP]** MSA-level starts data for Nashville, Louisville, Lexington
and Bowling Green sits behind Dodge and ConstructConnect subscriptions, and
SFIA's Quarterly Market Data Report would give South Central tonnage directly.
**Both should be purchased before this plan goes to a lender** — they are the
only credible route to a bottom-up TAM, and an analyst will ask.

## 3.5 The channel conflict we have to resolve

**Misty Valley Contracting bids work against exactly the subcontractors we want
as Supply's customers.** A framing sub asked to buy material from a competitor's
affiliate may simply refuse.

This is a first-order strategic question, not a detail. Two workable answers:

1. **Target self-performing GCs and general contractors rather than competing
   subs.** Fewer accounts, larger orders, no conflict. This is the cleaner path
   and is reflected in the sales sequence in §6.3.
2. **Wall the businesses off contractually** — a written commitment that Supply
   does not share customer or pricing information with Contracting, and that
   Contracting will not bid against a Supply customer on a named project.

**[SIGN-OFF]** Discuss with counsel before the first outside sales call. The
answer shapes who we sell to, so it must be settled early rather than
discovered.

# 4. Products & Services

## 4.1 Product lines at launch

| Line | Standard | Detail |
|---|---|---|
| Interior non-structural framing | ASTM C645 / AISI S220 | Studs 1-5/8″–6″, track, deep-leg track, furring and hat channel, resilient channel; 25/22/20 ga; G40 minimum coating |
| Structural framing | ASTM C955 / AISI S240 | Studs and track 33–97 mil, joists, headers, bridging; G60 minimum coating |
| Shaft & area separation | Per listed assembly | C-H studs, E-studs, J-track, components matched to the listed design |
| Accessories | — | Corner bead, trim, fasteners, clips, deflection/slip track |

Planned additions as volume supports them: **gypsum board, insulation, and
exterior sheathing**, delivered on the same truck as part of the same package.
Each addition raises revenue per delivery without raising delivery cost — the
main operating leverage available to this business.

## 4.2 The package service — what we actually sell

The differentiated offer, and the reason the gross margin in §7 is achievable:

1. **Takeoff** from the customer's drawings or estimate.
2. **Cut to finished length** in the Bonnieville shop.
3. **Kitted and banded** by wall type, with track, headers and accessories
   pulled to match.
4. **Tagged** to the wall type and floor it belongs to.
5. **Delivered by floor and phase**, on the date the crew is ready.
6. **Documented** — mill certificates and product data filed by delivery,
   ready to drop into a submittal.

**Pricing.** Material is priced per linear foot at market. The package service
is a separate, visible uplift per linear foot. Keeping the two lines separate
is a deliberate management decision, not an accounting detail: it makes the
defensible margin measurable, and it lets us prove the value to a skeptical
customer by quoting both ways.

## 4.3 Quality and code compliance

Light-gauge steel fails in ways nobody can see. Base metal thickness, coating
weight, and yield are invisible in a bundle and in a finished wall.

Our controls:

- **Minimum base steel thickness must be ≥95% of design thickness**, measured
  as delivered with coating stripped (ASTM C645 Table 1 note B; AISI S220-20
  §A5.1.1). We verify incoming material rather than relying on a certificate.
- **Mill test reports for the actual production run**, filed against the
  delivery — not a generic type certificate.
- **Lot traceability** from coil to bundle to job.
- **Rated assemblies get the product the listing names.** A fire-resistance
  rating belongs to a tested assembly; substituting a stud the design does not
  name voids it. We will say so even when it costs the sale.

This is not box-ticking. It is the risk that could reach Misty Valley
Contracting as well as Supply, and it is analysed in full in
`../03-product-compliance-risk.md`.

---

# 5. Operations

## 5.1 Facility

Cut shop and yard in Bonnieville. Requirements: covered storage for banded
steel (galvanized product must stay dry), cantilever racking, a cutting station,
truck access and turnaround, and a yard area for staged packages.

## 5.2 Equipment and startup capital

Startup budget of **$185,000** covers:

| Item | Purpose |
|---|---|
| Delivery truck (Class 6/7 flatbed) | Job-site delivery |
| Truck-mounted forklift | Unload on site without a crew or a crane |
| Yard forklift | Loading and stocking |
| Cut-to-length saw station | The core value-add |
| Cantilever racking | Organised stock; damage prevention |
| Banding and packaging equipment | Bundles that survive transit and handling |
| Yard setup, signage, software, deposits | — |

There is a clear upgrade path from a manual saw station to an automated
cut-to-length line as volume justifies it. **Deliberately not in the year-1
budget** — automation is bought with proven throughput, not with a projection.

## 5.3 Sourcing — phased on purpose

**Phase 1 (Year 1): domestic.** Buy from domestic mills and distributors.
Reasons, in order:

- **No tariff exposure.** Imported Chinese CFS carries a verified **75% ad
  valorem duty stack** (50% Section 232 + 25% Section 301), applied to the full
  customs value (`../02-trade-compliance-risk.md`).
- **No retroactive duty tail.** US antidumping duty is assessed *retrospectively*
  — the deposit at entry is not the final duty, and a bill can arrive three to
  four years later with interest.
- **Buy America eligible.** Federally funded work requires domestic iron and
  steel. An import-only supplier is barred from it; we are not.
- **Dramatically less cash tied up.** See below.
- **No code-compliance argument to win** with an architect or building official.

**Phase 2: add a compliant import lane** once volume, credit, and a compliance
function exist. Imported material is genuinely cheaper per foot. It is also
much heavier on cash, because suppliers are paid before shipment and the goods
sit on the water for weeks:

| | Domestic (base case) | Import lane |
|---|---:|---:|
| Year 3 EBITDA | $582,758 | $1,071,607 |
| **Peak cash requirement** | **$555,269** | **$730,376** |
| Days payable to supplier | 30 | **0** |
| Days inventory | 45 | **85** |

**The import lane earns roughly $489,000 more of Year 3 EBITDA and requires
about $175,000 more of permanent working capital.** That is a real trade, and
it should be made on the numbers with the facility already in place — not taken
because the steel looked cheap.

**Gate for Phase 2:** a supplier holding a current ICC-ES evaluation report
naming the actual producing plant, independent verification of base metal
thickness and coating on every shipment, and a written classification and
AD/CVD scope opinion from a licensed customs broker. Full gate in
`../05-first-container-gate.md`.

## 5.4 Working capital cycle

| Component | Days |
|---|---:|
| Inventory | 45 |
| Receivables | 65 |
| Less: payables | (30) |
| **Cash conversion cycle** | **80** |

Sixty-five days of receivables is an assumption grounded in reality, not
pessimism: GMS — a $5.5B distributor with a credit department and forty years of
customer history — runs 55 days. A new supplier with no credit history should
not plan for better.

**Collection discipline is therefore a core operating process, not an
afterthought:**

- Credit application with a personal guarantee on every account.
  **[SIGN-OFF]** — KRS 371.065 may render a guaranty unenforceable unless it
  states maximum liability and a termination date.
- **Pre-lien notices sent as routine** at a fixed trigger (first delivery
  + 30 days), never when an account goes bad. Kentucky requires notice to the
  *owner* within 120 days on commercial claims over $1,000, and the contractor
  cannot be the agent for that notice.
- **Lien filing within 6 months, and a copy mailed to the owner within 7 days
  of filing — the lien dissolves without it** (KRS 376.080(1)).
- Joint check agreements on larger packages.
- Payment bond pulled before extending credit on any public job.

---

# 6. Sales & Marketing

## 6.1 Channel

The channel is Ben's existing relationships. Ten years of GCs, owners, and
fellow subcontractors in central Kentucky is the entire year-1 customer
acquisition strategy, and it is worth more than any advertising budget a
startup distributor could fund.

## 6.2 The sales argument

We sell against a number the customer already knows: **his own labor cost.**

The pitch is not "our studs are cheaper." It is: *let us quote this job both
ways — stick material and a cut package — and you decide on installed cost.* A
supplier confident enough to invite that comparison is making a claim a
commodity distributor cannot.

To make that argument we must be able to state, in dollars, what the package
saves per thousand square feet of wall. **Establishing that figure from real
jobs is the highest-value marketing work of year 1** — and Contracting's own
crews are the measurement instrument.

## 6.3 Sequence

| Phase | Focus |
|---|---|
| Months 1–6 | Contracting's own jobs. Prove the package format, measure the labor saving, fix the process where it breaks. |
| Months 4–12 | Two to four friendly subcontractors. Convert the measured saving into a reference. |
| Year 2 | GCs and CMs. Takeoff support becomes the wedge — the supplier who does the takeoff owns the package before the bid is let. |
| Year 3 | Add product lines to existing accounts. Cheapest revenue available. |

## 6.4 Website

A site is built and ready to deploy (`../website/`). It leads with the package
proposition, not a product catalogue, and its primary call to action is *send us
a takeoff*. Contact details and the form endpoint need filling in before launch.

---

# 7. Financial Plan

All figures from `../model/proforma.py`, scenario `base_case`. Assumptions live
in `../model/proforma_scenarios.json`; every one can be changed and re-run.

## 7.1 Unit economics — one truckload

A road-legal load is **~95,000 linear feet** of stud and track (44,000 lb
road-legal payload at a blended 0.463 lb/ft — the truck weight limit binds
before the trailer fills).

| | Per load |
|---|---:|
| Material revenue (95,000 LF @ $0.80) | $76,000 |
| Service revenue (95,000 LF @ $0.05) | $4,750 |
| **Total revenue** | **$80,750** |
| Cost of goods | ($59,375) |
| Delivery | ($1,100) |
| **Gross profit** | **$20,275** |
| **Gross margin** | **25.1%** |

Material pricing is triangulated against verified Louisville retail of
$1.268/LF (ClarkDietrich ProSTUD 25, 3-5/8″ × 10 ft, checked 4 Sept 2026) and a
distributor-to-contractor range of $0.70–$0.95/LF.

**The service line is priced at 6.25% of material price**, at the top of the
3–7% band the value analysis in §3.3 supports — not at the 13%+ an earlier
draft of this model assumed. It contributes 5.9% of revenue and **12% of gross
profit**: a genuine margin enhancer built on labor rather than steel, but not
the whole business. Anyone reading this plan should understand that **we are
principally a distributor whose margin is helped by a service, not a service
company that happens to sell steel.**

## 7.2 Three-year projection

| | Year 1 | Year 2 | Year 3 |
|---|---:|---:|---:|
| Loads delivered | 15.0 | 36.0 | 55.5 |
| Material revenue | $1,140,000 | $2,736,000 | $4,218,000 |
| Service revenue | $71,250 | $171,000 | $263,625 |
| **Total revenue** | **$1,211,250** | **$2,907,000** | **$4,481,625** |
| Gross profit | $304,125 | $729,900 | $1,125,262 |
| Gross margin | 25.1% | 25.1% | 25.1% |
| Operating expense | ($180,264) | ($544,320) | ($767,280) |
| **EBITDA** | **$123,861** | **$185,580** | **$357,982** |
| EBITDA margin | 10.2% | 6.4% | 8.0% |
| Debt service | ($46,821) | ($68,068) | ($82,124) |
| **Net income** | **$97,470** | **$140,194** | **$301,040** |
| **DSCR** | **2.65** | **2.73** | **4.36** |
| Peak revolver drawn | $184,899 | $372,351 | $517,778 |

**Three things a careful reader should notice, stated rather than hidden:**

1. **Gross margin is planned at 25.1%, below GMS's 31.2%.** They have wallboard,
   ceilings and complementary products; we have one line. Planning at their
   margin would be wishful.
2. **Year 2 EBITDA margin dips to 6.4%** as overhead steps up — a dedicated
   driver, a second yard hire, admin — ahead of the volume that pays for it.
   This is the most fragile year in the plan.
3. **Year 1 carries no dedicated driver.** At 1.25 loads/month a full-time
   driver cannot be justified; hauling is bought per load and shared with
   Contracting under the services agreement. The driver appears in Year 2.

## 7.3 Breakeven

**0.83 truckloads per month** covers all fixed overhead and interest in year 1
— roughly one load every five weeks.

| | Loads/mo | Revenue/mo |
|---|---:|---:|
| Breakeven | 0.83 | $67,023 |
| Year 1 average | 1.25 | $100,938 |
| Year 3 exit rate | 5.00 | $403,750 |

A low breakeven is the single most important defence against the soft market
described in §3.1, and it is why the year-1 cost base is kept deliberately thin.

## 7.4 Capitalisation and use of funds

| Source | Amount |
|---|---:|
| Owner equity injection | $175,000 |
| Term debt, 7 years @ 10.5% | $200,000 |
| Revolving line of credit @ 9.5% | $700,000 |
| **Total** | **$1,075,000** |

| Use | Amount |
|---|---:|
| Truck, truck-mounted forklift, yard forklift | ~$120,000 |
| Cut station, racking, banding equipment | ~$40,000 |
| Yard setup, software, deposits, professional fees | ~$25,000 |
| **Startup capital expenditure** | **$185,000** |
| Working capital (revolver, drawn as needed) | up to $700,000 |

**Equity injection is 47% of the funded startup and term requirement**
($175,000 of $375,000) — comfortably above typical lender minimums.

## 7.5 Why the revolver is the number that matters

The model's most important output is not a profit figure. It is that **growth
consumes cash**: each step up in volume funds inventory and receivables before
it collects, and an undersized line puts the business on the floor while it is
still posting positive EBITDA every month.

| | Amount |
|---|---:|
| Peak cash requirement | $707,778 |
| Peak revolver utilisation | $517,778 |
| Line requested | $700,000 |
| Headroom at peak | $182,222 |

The line is sized with headroom deliberately. A distributor running its revolver
to the limit cannot take the one large order that would make its year.

## 7.6 Scenario comparison

| | Base case | Lean (no term debt) | Import lane | Stress |
|---|---:|---:|---:|---:|
| Year 3 revenue | $4,481,625 | $2,664,750 | $4,481,625 | $2,547,900 |
| Year 3 EBITDA | $357,982 | $159,075 | $846,832 | **($284,880)** |
| Year 1 DSCR | 2.65 | 16.09 | 4.14 | **(0.80)** |
| Breakeven loads/mo | 0.83 | 0.45 | 0.66 | 1.59 |
| Peak cash requirement | $707,778 | $316,692 | $689,327 | $1,549,813 |

**The `lean` case deserves a serious look before borrowing.** It reaches
$2.7M of revenue with no term debt, a 0.45 load/month breakeven, and less than
half the peak cash requirement. It grows more slowly and pays Ben less — but it
cannot be killed by a covenant, which in the market described in §3.1 is worth
something real.

# 8. Management

**Ben Easterday — Owner.** Over a decade building Misty Valley Contracting as a
commercial framing and drywall subcontractor in Kentucky. Brings the trade
knowledge that makes the package format credible, the customer relationships
that constitute the sales channel, and an existing operating business that
provides baseline demand.

**Key hires, year 1:** cut shop operator and CDL driver. Administration is
absorbed initially through a shared-services arrangement with Contracting —
which must be **documented in writing at an arm's-length allocation** to
maintain entity separation (`../01` §7).

**Advisors to be engaged before launch** (see §11): Kentucky business attorney,
Kentucky construction attorney, Kentucky CPA, licensed customs broker (Phase 2),
and an insurance broker with importer/products experience.

**Acknowledged gap:** neither principal has run a distribution business. The
disciplines that differ most from contracting are **inventory management and
credit control**, and both are addressed by process in §5.4 rather than assumed
away. A part-time controller or an experienced credit manager is the first
back-office hire we would make ahead of plan.

---

# 9. Risk

## 9.1 The stress case — the one that matters

Three adverse conditions applied together: material price down 10%, receivables
stretched to 90 days, and the cut/kit premium fully competed away.

| | Base case | Stress case |
|---|---:|---:|
| Year 1 EBITDA | $123,861 | **($41,214)** |
| Year 3 EBITDA | $357,982 | **($284,880)** |
| Year 1 DSCR | 2.65 | **(0.80)** |
| Breakeven volume | 0.83 loads/mo | **1.59 loads/mo** |
| Peak cash requirement | $707,778 | **$1,549,813** |

**The business does not survive that combination.** Saying so plainly is more
useful than hiding it, because it names exactly what management must defend:

- **A 10% material price move is not hypothetical.** GMS reported steel framing
  price/mix at **−10.4%** in FY2025. Meanwhile the PPI for steel mill products
  is **+22.5% YoY** — input inflation against falling realised prices is
  precisely the squeeze, and a startup has no purchasing scale to absorb it.
- **Receivables discipline is existential.** Moving from 65 to 90 days alone
  adds roughly $400,000 to peak cash. This is why §5.4 treats collections as an
  operating process rather than an administrative afterthought.
- **The service premium must be earned with evidence.** It is only 12% of gross
  profit, so losing it is survivable in a way the price move is not — but
  losing it *while* prices fall is not.

## 9.2 Risk register

| Risk | Severity | Mitigation |
|---|---|---|
| Material price compression against rising input costs | **Severe** | Thin fixed-cost base; 0.83 load breakeven; price material at market and defend only the service line |
| Working capital exhaustion during ramp | **High** | $700k line with $182k headroom; the ramp is throttleable — slow it and cash builds |
| **Cutting error on a takeoff** | **High** | Pre-cut material has **no salvage value at the wrong length**. Contract must define whose dimensions govern — ours from the model, or the customer's signed-off cut list. **[SIGN-OFF]** |
| **Channel conflict with Contracting** | **High** | Target self-performing GCs rather than competing subs; consider a written non-compete on named projects (§3.5) |
| Credit terms vs. a Home Depot-backed competitor | **High** | Compete on service and responsiveness, not terms; PG on every account; disciplined lien practice |
| Service premium competed away | **Medium** | Only 12% of gross profit — painful, not fatal; defend with a measured labor study |
| Product substitutes (TRAKLOC and similar) | **Medium** | Stock and sell them too; we are agnostic about how the customer saves labor |
| Customer concentration | **High** | Deliberate year-1 diversification to 3–5 outside accounts |
| Non-payment by a contractor customer | **High** | PG on every account; routine pre-lien notices; joint checks; bond claims |
| Non-conforming material in a rated assembly | **Severe** | Incoming verification protocol; documented lots; refuse unlisted substitutions (`../03`) |
| Tariff / AD-CVD exposure (Phase 2 only) | **Severe** | Domestic sourcing in Phase 1; scope ruling and broker opinion before any import (`../02`) |
| Related-party dispute on a cost-plus job | **High** | Written advance disclosure protocol; published arm's-length price list (`../01` §6) |
| Soft regional construction market | **Medium** | Low breakeven; Nashville and Bowling Green sub-markets outperform |
| Key-person dependence on Ben | **Medium** | Document the package format and takeoff process; hire ahead of plan |

## 9.3 The evidence that de-risks the whole plan — and it is nearly free

The single highest-value action available is a **time study on Misty Valley
Contracting's own crews**: measure the full field cut cycle (measure, walk to
saw, cut, stack, carry back) and the actual waste rate on two or three real
jobs, with and without pre-cut material.

That produces the one thing no competitor can borrow and no analyst can
dismiss — **a defensible, first-party number for what the package saves per
1,000 square feet of wall.** It costs a clipboard and a few hours of
supervision, it converts the central marketing claim from assertion into
evidence, and it should happen in the first 90 days.

## 9.4 What would make us stop

Stated in advance so the decision is not made emotionally later:

- Outside customers will not pay any premium for the package after two quarters
  of honest selling → this is a commodity distributor competing with a Home
  Depot subsidiary on price. Reconsider the whole thesis.
- Receivables exceed 90 days across more than one account → stop extending
  credit before growing volume.
- Peak revolver utilisation exceeds 80% before month 24 → slow the ramp.
- Gross margin falls below 20% for two consecutive quarters → the price war has
  started and we cannot win it; retrench to the `lean` case.

# 10. Milestones

| When | Milestone |
|---|---|
| Pre-launch | Entity formed; bank account and books opened; insurance bound; CPA answers on LLET and sales tax; attorney delivers credit application and price list |
| Month 1 | Yard operating; equipment in place; first package delivered to a Contracting job |
| Month 3 | Labor saving measured on at least two real jobs; number documented |
| Month 6 | First outside customer package delivered and **paid** |
| Month 9 | Three active outside accounts; 1.5 loads/month run rate |
| Month 12 | 2 loads/month; full-year revenue ≈ $1.3M; DSCR verified above 1.25 |
| Month 18 | Phase 2 sourcing decision made on numbers, with the model re-run |
| Month 24 | 3.5 loads/month; second truck evaluated |
| Month 36 | 5 loads/month; ≈ $4.8M revenue; automated cut line evaluated |

---

# 11. Sign-off register

Nothing in this plan should be implemented without the corresponding clearance.

**Kentucky CPA**
- Whether the cut shop is "manufacturing/producing" or a service under
  KRS 141.0401 — largest open tax question in the plan
- Sales and use tax treatment under 103 KAR 26:070, **before the first invoice**
- Entity elections; reasonable compensation; §199A aggregation
- LLET per-entity minimums and intercompany double-counting

**Kentucky business attorney**
- Operating agreement; intercompany supply agreement and leases
- Whether Enterprises should be multi-member for charging-order protection
- Credit application and personal guaranty form under KRS 371.065
- UCC-1 / PMSI-in-inventory procedure

**Kentucky construction attorney**
- Related-party disclosure protocol **before Supply's first sale to Contracting**
- Lien notice calendar and forms, private and public
- Indemnity language in customer purchase orders vs. the CGL "insured contract"
  definition

**Insurance broker (products/importer experience)**
- CGL with products–completed operations carrying its own aggregate
- Products liability naming the cut-shop operation
- Commercial auto; cargo; property with inventory valued at landed cost

**Licensed customs broker — Phase 2 only, before any purchase order**
- Written HTS classification opinion and AD/CVD scope determination
- Review of the surety General Indemnity Agreement before signature

---

# 12. Appendices

| Reference | Contents |
|---|---|
| `../model/proforma.py` | Three-year P&L, working capital, revolver, DSCR, peak cash. `--scenario base_case \| lean \| import_lane \| stress` |
| `../model/container_model.py` | Per-load landed cost, duty stack, container capacity |
| `../model/proforma_scenarios.json` | Every financial assumption, editable |
| `../01-entity-structure.md` | Entity architecture on verified Kentucky law |
| `../02-trade-compliance-risk.md` | Tariff stack and AD/CVD analysis |
| `../03-product-compliance-risk.md` | Code compliance, UL assemblies, liability |
| `../04-unit-economics.md` | Market pricing, container capacity, competitor margins |
| `../05-first-container-gate.md` | Pre-purchase checklist for imported material |
| `../06-the-stronger-play.md` | Strategic rationale for the service-led model |
| `../website/` | Deployable marketing site |

**To reproduce any figure in §7:**

```bash
cd ../model
python3 proforma.py --scenario base_case
python3 proforma.py --scenario stress
python3 test_proforma.py      # 16 tests
```
