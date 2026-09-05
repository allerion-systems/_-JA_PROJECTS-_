# Modular, and What 7 Brew Is Actually Doing

Prepared for **Joey Allee**, 5 September 2026.

> The ask was: *"build the engineering side that turns any blueprint into
> modular construction designs… start small like how 7 Brew buildings do it."*

Those are two different companies, and one of them is Katerra. This document
separates them and gives you the smallest version that a two-person team can
actually start.

---

## 1. The graveyard, first

**Katerra.** Over **$2B from SoftBank alone** — $865M in Jan 2018, plus a Dec
2020 bailout. Founded 2015 by Michael Marks, ex-CEO of Flextronics. Attempted
full vertical integration: architecture, engineering, factory-built wall
assemblies and CLT, general contracting, and materials supply — simultaneously.
By 2019 it had ~700 projects underway and had **failed to complete roughly a
dozen, able to name exactly one delivered on time.** Greensill Capital, its
lender, went insolvent in March 2021; SoftBank declined further funding;
Chapter 11 in June 2021.
([Wikipedia](https://en.wikipedia.org/wiki/Katerra) ·
[Construction Dive](https://www.constructiondive.com/news/what-does-katerras-demise-mean-for-the-contech-and-modular-industries/608037/) ·
[TechCrunch](https://techcrunch.com/2021/06/01/softbank-backed-construction-giant-katerra-said-to-be-shutting-down-after-raising-billions/))

**Read the mechanism, not the obituary.** Katerra *bought an architecture firm*
— which structurally guarantees a different building every time — and then fed
those buildings to a fixed factory. A factory earns its return by amortizing
tooling and a learning curve across repeated identical units. Feed it variety
and it becomes a cost center with none of the learning. **That is precisely the
"any blueprint → modular" product.**

It is not a lonely failure:

| Company | Raised | Outcome |
|---|---|---|
| **Veev** | ~$600M, $1B valuation 2022 | Insolvent Nov 2023, assets to Lennar |
| **Factory OS → Harbinger** | PE consortium 2024 | WARN notice Feb 2026 — **all ~290 jobs**, factory closed by June 2026 |
| **Skender Manufacturing** | Spun off to raise | Factory opened May 2019, **closed Sept 2020** — 16 months |
| **Diamond Age** | $8M seed + **$50M Series A** | Shut down, failed to raise |
| **Blokable** | VC + StartEngine | Closed June 2023 |
| **Broad Group (US)** | — | Sky City halted 2013 in pre-construction; the foundation is now a fish farm |

**Every one of these is a factory built ahead of a repeat-order book. Not one
failed for lack of technology.**

---

## 2. The hypothesis, tested against data

> *Modular works when the same building is repeated many times, and fails when
> every project is a different design.*

**Strongly supported.** The cleanest evidence is a dose-response curve, from
Brian Potter's analysis of manufactured housing
([Construction Physics](https://www.construction-physics.com/p/the-elusive-cost-savings-of-the-prefabricated)):

| Product | Cost vs. site-built | Site assembly |
|---|---:|---|
| Single-wide manufactured home | **40–50% cheaper** | ships as one complete unit |
| Double-wide | ~36–40% cheaper | one mate line |
| CrossMod | 20–27% cheaper | more |
| **Generic prefab / modular** | **5–20% cheaper** | substantial |

**Savings track inversely with site assembly and design variation,
monotonically.** At 5–20% you are inside the noise band of a competitive GC
bid, and you have not covered the factory's fixed cost.

McKinsey's analysis of ~700 firms says the same thing from the P&L side:
profitability surges when a firm narrows to **one material and one typology**,
and firms pursuing multiple product types saw returns *weaken*. Its named
failure mode: **companies that built automated facilities before securing
demand.**
([McKinsey](https://www.mckinsey.com/capabilities/operations/our-insights/modular-construction-from-projects-to-products) ·
[Construction Dive](https://www.constructiondive.com/news/value-chain-control-modular-profits/759136/))

Cassette, an LA module startup, has made this the literal product. Founder
Dafna Kaplan: *"You can't sell it as a product if you're asking people to
custom fabricate something."*
([Metropolis](https://metropolismag.com/profiles/cassette-modular-housing-startup/))

**The sharpening:** repetition is necessary but not sufficient. The full
condition set is (1) same design repeated dozens of times, (2) small enough to
ship substantially whole, (3) captive or contractually-locked demand so
utilization never drops, (4) single material system, single typology.
**7 Brew hits all four. Katerra hit zero.**

### And the market-size number nobody wants to look at

Permanent modular construction was **2.14% of North American starts in 2015**
and **6.64% in 2023**. MBI's 2025 figure is ~5.1%, but it is **not comparable**
— US vs. North America, "key segments" vs. all starts, and a methodology change
with FMI in spring 2025. So do not claim it fell.

But do read the honest version: **PMC share has plateaued in the 5–7% band and
has not broken out**, forward guidance is **4.5–6.5% CAGR** — roughly the growth
rate of construction generally. After sixty years of "modular is about to take
over," it is a mid-single-digit share.
([MBI](https://www.modular.org/industry-analysis/) ·
[MBI 2024 report](https://offsiteconstructionnetwork.com/2024-modular-construction-annual-reports/))

**Capacity is slack, not short.** ~74% factory utilization forecast to reach 78%
by 2031, with **underutilization named as the single most important operating
risk**. 255 manufacturers averaging **$23.5M revenue** — a fragmented industry
of small shops with idle lines.
([Mordor](https://www.mordorintelligence.com/industry-reports/north-america-modular-construction-market))

> 🔴 **Any thesis premised on "there isn't enough modular capacity" is wrong.
> The constraint is demand.**

---

## 3. What 7 Brew is actually doing

You were right to point at it. Here is the mechanism, from the Franchise
Disclosure Document rather than from franchise blogs.

**They own the factory.** *CTAR, Inc.* is an Arkansas corporation at **the same
address as the franchisor**, which the FDD says *"constructs the modular
buildings for 7 BREW Stores… and is an approved (but not the only) supplier."*
One or more 7 Brew officers hold indirect ownership. Two outside builders are
approved: **Creative Modular Construction** (Springfield MO) and **Frey-Moss
Structures** (Conyers GA) — the same factory that builds Chick-fil-A's modules.
([7 Brew FDD 2025](https://www.restfinance.com/app/pdf/fdd/7-Brew-2024.pdf))

**The building:** volumetric steel modular, **510 sq ft**, ~35 tons, delivered
in 3–4 sections — main body, top, canopy. CNC pre-cut with outlet and plumbing
penetrations located in the factory. Engineered to be **picked up twice**, which
means tighter tolerances than site-built. Arrives pre-inspected.

**The speed, which is the actual product:** factory build ~4–5 weeks (CMC runs
~2 buildings/week), **crane set in under 24 hours**, site finishing ~1 week —
**groundbreaking to open in 6–8 weeks.**

**It works.** **321 outlets at end of 2024**, up from 180 and then 40. Average
gross sales across 180 measured stores in FY2024: **$2,040,883** out of 510
square feet.

### ⚠️ The number that should change your plan

FDD Item 7, actual 2024 transacted prices:

| | Low | High | Actual 2024 range |
|---|---:|---:|---|
| **Building** | $318,500 | $600,000 | **$337,550 – $469,900** |
| **Site development** | $200,000 | $800,000 | — |
| Total investment | $894,000 | $2,178,500 | — |

Freight (up to $30,000) and installation (up to $30,000) are **excluded** from
the building line, as is land.

> **Midpoint building ≈ $460K. Midpoint site development ≈ $500K.**
>
> **The industrialized half is the smaller half.** Site development carries a
> **4× range** against the building's 1.9×, and it is 100% site-built, locally
> bid, and completely un-productized.

Every dollar of factory efficiency is fighting for the smaller, more predictable
half of the pie. **The money and the uncertainty are both in the dirt.**

### The comparables confirm the pattern

| Brand | Builder | Result |
|---|---|---|
| **Dutch Bros** | Russo Modular (Phoenix) | 600–1,250 sq ft steel. **Saves avg 21 days and $75,000 per project**; 28 units from 2020 |
| **Chick-fil-A** | Frey-Moss (Conyers GA) | 6 modules. **~6 weeks faster, construction productivity doubled**, ⅓ of 150 new restaurants in 2021 |
| **Starbucks** | No captive factory — Palomar, Madison, Fullerton, PIVOT | Built a store in **6 days**, but opportunistic and multi-vendor — *not* a systematized program |

Note the **concentration risk**: Frey-Moss serves both 7 Brew and Chick-fil-A;
CMC is heavily 7 Brew-dependent. One brand pausing expansion is an existential
event for its factory. **That is exactly what killed Factory OS.**

---

## 4. The engineering layer — has anyone done it?

**No. Not commercially, not at any scale.**

Arbitrary-design → modular kit exists **only in academic literature** (ASCE
*J. Computing in Civil Engineering* "ModulePacking"; *Automation in
Construction* 2022 coupled-GAN paper), and both are constrained to residential
repetitive-cell typologies — building types that are **already** grids of
near-identical cells, where the architect did the modularization for free.

What exists commercially is feasibility and massing, not decomposition:

| Tool | Price | What it really does |
|---|---|---|
| **Autodesk Forma** | ~$185/mo, $1,500/yr | Site/massing, sun/wind/noise. "Modular facade" automation is **panelization, not volumetric decomposition** |
| **TestFit** | $100–400/mo; enterprise **$10–15K/yr** | Parcel feasibility for developers. Design-agnostic. Produces no modular kit |
| **Hypar** | ~$100/user/mo | You *author* the building system as code; it evaluates variants. Closest to real — but you write the system, it doesn't infer one |
| **Finch3D** | €49–50/mo | Generative floor plans, multifamily |

**Why there is no general solution:** this is not a geometry problem. It is
constraint satisfaction over transport, structure, fire, MEP and ~50 state
regulatory regimes at once, where the objective function — factory unit cost —
depends on *a specific factory's tooling and line*. **There is no general
solution because there is no general factory.**

### The hard constraints, Kentucky-specific

- **Transport:** KY permits to **16'0" W × 120' L × 13'6" H × 160,000 lb**.
  Annual permit **$250** under 14' wide, **$500** at 14–16'; single trip $60.
  **Height is the binding constraint, not width** — subtract ~4' of trailer deck
  and you have ~9'6" of module height, which caps finished ceiling. That is
  exactly why 7 Brew ships its roof and canopy as separate sections.
  ([KY DRIVE](https://drive.ky.gov/Motor-Carriers/Overweight-Over-Dimensional/Pages/OWOD-Permits.aspx))
- **MEP continuity** across stacked modules — 1-hour rated chases isolated at
  each floor line, mated **without letting trades back into finished units**.
  The hardest unsolved problem in modular, and the reason single-module
  buildings dramatically outperform stacked ones.
- **Structural:** modules must be engineered for **two lift cycles plus
  transport racking** on top of in-service loads — a load case that does not
  exist in site-built.

### Kentucky's modular program — 815 KAR 7:130 (KIBS)

To sell modules in Kentucky a manufacturer must:

1. Get a **Certificate of Acceptability** — Form HBC KIBS-1, a written Quality
   Assurance Manual, GL insurance ($300K/person, $400K/accident, $100K
   property), **$500 fee**
2. Get **model plan approval — once per model design, valid for the life of the
   currently adopted Kentucky Building Code**
3. Submit **site placement plans for every unit** (except 1–2 family dwellings)
4. Have each structure **inspected before shipment by a third-party inspector**
   certified under 815 KAR 7:070, who may not be a government employee
5. Buy **M-Seals at $25 each**; an inspector may not seal a unit they did not
   personally inspect
6. **Plumbing inspected by a state DHBC Division of Plumbing employee** — not
   the third party. A real scheduling chokepoint.

([815 KAR 7:130](https://apps.legislature.ky.gov/law/kar/titles/815/007/130/))

> **Item 2 is the entire economic argument for repetition, written into the
> regulation.** One approval, unlimited units of that model. Change the design
> and you buy the approval again.

**There is no reciprocity.** Selling into KY, TN, IN, OH and MO means five
certification tracks, five model-plan approvals, five seal regimes.

---

## 5. The verdict

**"Any blueprint to modular" is not an analogy to Katerra. It is the same
thesis.** Katerra bought an architecture firm precisely so it could accept
arbitrary designs and feed them to factories. The software version has the
identical flaw.

Three reasons it cannot work:

1. **It optimizes the smaller half of the cost.** Site development is at least
   as large as the building and carries 4× the variance. Perfecting the module
   leaves the expensive, uncertain half untouched.
2. **"Any blueprint" destroys the only source of savings.** 40–50% when it
   ships whole and identical; 5–20% when it doesn't. A tool that makes it easy
   to modularize a one-off is a tool for manufacturing 5%-savings projects.
3. **There is no buyer.** 255 sub-scale manufacturers at $23.5M average revenue
   and 74% utilization do not have software budgets — and the ones that are
   thriving succeed by having *one* design and *one* customer. **Selling
   "handle any design" into this market is selling the disease as the cure.**

**The honest version of your insight:** 7 Brew is impressive not because it is
modular, but because it is **one building, repeated 321 times, with a captive
factory and a locked demand pipeline.** The modularity is downstream of the
repetition. Build for repetition and you keep the modularity. Build for
arbitrariness and you lose both.

---

## 6. The smallest viable version

**Invert the problem. Don't map blueprint → modules. Map one fixed module →
many sites.**

A developer or franchisee with a multi-store commitment — 7 Brew's FDD
*requires* a minimum of five — has one fixed 510 sq ft building and a list of
candidate parcels. Their real questions are:

> *Which parcels fit? Is this the $200K site or the $800K site? What's the
> zoning and permit path? Where does the crane sit? Can the module get here
> under a 13'6" bridge?*

**Nobody sells this.** TestFit does parcel feasibility but is design-agnostic
and priced for enterprise. Forma does massing. Neither knows what a specific
module needs.

Why two people can build it:

- **The building is a constant, not a variable.** Hardcode one footprint, one
  canopy geometry, one utility stub layout, one crane envelope. All the hard
  geometry disappears.
- **The data is public** — parcel GIS, zoning overlays, setbacks, FEMA flood,
  utility as-builts, DOT bridge clearance and permitted routes, state modular
  requirements.
- **The output is a number and a go/no-go**, not a construction document. **You
  carry no design liability** — which matters, because you already have
  specification liability exposure in the supply business.
- **Ground truth exists**: 321 built 7 Brews with known site costs, plus Dutch
  Bros, Scooter's, Chick-fil-A.
- **The wedge is the site-cost estimate** — the largest and most uncertain line
  in the whole pro forma, and the one that currently gets guessed.

**Beachhead: Kentucky and adjacent states, small-format drive-thru F&B.** Your
backyard, one KIBS regime to learn first, and a live rollout to sell against —
the La Grange superintendent called it his twelfth build of 2026 with four or
five more Kentucky locations planned that year.

Then generalize **one typology at a time**, exactly as McKinsey's data says the
profitable operators did.

**Not "any blueprint." Ever.**

---

## 7. And the thing you already have that nobody else does

You are an estimator. **Site development cost is an estimating problem, not a
software problem** — the software is just how you sell the estimate a hundred
times instead of once. The reason nobody has built this is that the people who
can estimate site work don't write software and the people who write software
can't estimate site work.

That is a narrower and far more defensible edge than "we turn blueprints into
modules," and it is the same structural position as everything else in this
engagement: **get in front of the transaction, not into the middle of it.**

---

*Marked UNVERIFIED in the underlying research: Scooter's Coffee modular
manufacturer and whether its 664 sq ft kiosk is volumetric; dominant
manufacturers for bank branches and urgent care; current operating status of
Full Stack Modular; direct comparability of MBI's 2025 5.1% share to the
pre-2024 series. Franchise-blog cost figures ($350K–$775K) contradict the FDD
and were discarded.*
