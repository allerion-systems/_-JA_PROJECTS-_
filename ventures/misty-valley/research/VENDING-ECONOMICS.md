# Industrial Vending — The Real Numbers, and Why Not Yet

**Question:** should Allerion Technologies build or buy jobsite vending
hardware for PPE and consumables, and rent it to Misty Valley Supply?

**Answer: no. Not build, not buy, not resell — not at zero revenue.** The
research below is not close. Written 5 September 2026.

---

## 0 · The verdict up front

Industrial vending is a **real, large, proven business.** It is also a
**business you enter from the far side** — after you already have customer
sites spending $5,000+/month with you, a dense local delivery route, and a
catalogue of small vendable consumables. Misty Valley has none of the three.

The machine is not a product. It is a **retention device that a distributor
buys with its own capital and gives away** to lock in consumable flow it
already has. Fastenal — the company that invented this category — does not
book vending hardware as a revenue line or an asset that earns rent. It books
the depreciation as **occupancy expense**, in the same bucket as building rent
([FAST 10-K, FY2025, filed 5 Feb 2026, MD&A "Occupancy-related expenses"](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm)).

That single accounting fact kills the proposed structure. If the category
leader treats these machines as **rent-like overhead**, then "Allerion owns
the hardware and rents it to Misty Valley" is not a business model. It is a
journal entry that moves depreciation across a related-party line, adds an
SBA affiliation and transfer-pricing problem (see `12-allerion-and-the-stack.md`),
and creates no dollar that did not already exist.

### The three numbers that decide it

| # | Number | Source | What it kills |
|---|---|---|---|
| **1** | **$1,691 / machine / month** | Fastenal FY2025, derived: $2,675.0M FASTBin+FASTVend sales ÷ 131,798 avg installed MEU | The **ceiling**. That is the best operator on earth, at 84.6% of its own $2,000 target. Any pro-forma above this is fiction. |
| **2** | **~40–67 workers on one site, permanently** | $2,000/mo ÷ ~$50/worker/month PPE spend, at 100% → 60% capture | The **jobsite**. A typical commercial crew is 4–6 per trade. Only megaprojects clear this bar. |
| **3** | **8.1% of sales** | Fastenal non-residential construction share, FY2025, down from 9.1% in FY2023 ([10-K Note, segment/end-market table](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm)) | The **market**. 18 years and ~124,000 machines in, the category leader still does 92% of its business somewhere other than construction — and construction is *shrinking* as a share. |

**And the one that ends the conversation:** Misty Valley's core product is
*cut, labeled, sequenced framing packages, delivered by floor and by phase.*
You cannot vend a 10-foot steel stud. The current vendable SKU count is
effectively **zero**. A vending program would require standing up an entirely
different product line, in an entirely different buying motion, before the
first machine has anything to dispense.

`PRODUCT-ATTACH.md` already answered this before the question was asked:
*"does it appear on the same wall section, on the same set of drawings, bought
by the same person, delivered on the same truck?"* Vending fails all four. It
is diversification wearing a product's clothes.

---

## 1 · Fastenal FMI — the canonical case, with the real numbers

Fastenal is the only company that publishes audited, quarterly, unit-level
data on industrial vending. Everything else in this market is marketing copy.

### 1.1 The FMI suite

Three products, deliberately different in cost and capability ([FAST 10-K FY2025, Item 1](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm)):

| Product | What it is | Tech |
|---|---|---|
| **FASTStock℠** | Scanned stocking locations — bins, shelves, cabinets, pallets | Not embedded. Cheap, flexible, mobile-scanned |
| **FASTBin®** | Electronic bins: precision scales, infrared sensors, RFID kanban, FASTClick buttons | Embedded, 24/7 continuous monitoring, auto-replenish |
| **FASTVend®** | Industrial vending devices — 21 models, 16 helix or locker format | Embedded, access-controlled dispensing |

Introduced 2008 (FASTVend), 2019 (FASTBin). Traction from 2011.

### 1.2 The machine-equivalent unit (MEU) — read this carefully

Fastenal does not report raw device counts in its headline metric. It reports
**MEU**, normalised to *targeted monthly throughput*:

> The conversion takes the targeted monthly throughput of each FMI device and
> compares it to the **$2,000 target monthly throughput of the FAST 5000**
> vending device. An RFID enclosure at $2,000/month counts as 1.00. An
> infrared bin at $40/month counts as **0.02**.
> — [FAST 10-K FY2025, Item 1](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm)

**This is the single most useful disclosure in the entire industry.** It is
Fastenal telling you, on the record, what one vending machine is worth per
month: **$2,000 of goods.** Target monthly sales per device range from under
$1,000 to over $3,000; the flagship FAST 5000 targets $2,000.

An infrared bin at 0.02 MEU is worth **$40/month**. Keep that in mind whenever
a vendor quotes you a device count.

### 1.3 The audited numbers

**Full year 2025** ([FAST 10-K, filed 5 Feb 2026](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm)):

| Metric | 2025 | 2024 | Change |
|---|---:|---:|---:|
| Weighted FASTBin/FASTVend **signings** (MEU) | 25,892 | 27,984 | **−7.5%** |
| Signings per day | 102 | 110 | — |
| Weighted **installations** (MEU, end of period) | **136,638** | 126,957 | **+7.6%** |
| FASTStock sales | $1,037.7M | $956.6M | +8.9% |
| — % of total sales | 12.5% | 12.5% | flat |
| FASTBin/FASTVend sales | **$2,675.0M** | $2,295.5M | +17.0% |
| — % of total sales | **32.2%** | 30.0% | +220 bps |
| **Total FMI sales** | **$3,712.7M** | $3,252.1M | +14.6% |
| — **% of total sales** | **44.7%** | 42.5% | +220 bps |
| Company net sales | $8,200.5M | $7,546.0M | +8.7% |
| Company gross margin | 45.0% | 45.1% | −10 bps |

Also disclosed: **approximately 124,000 FASTVend devices in the field** at end
2025 (raw count, not MEU). Digital Footprint (FMI + non-FMI eBusiness) reached
**61.4% of 2025 sales**, hitting 62.4% in December — *below* their 66–68% goal,
which they attribute to lower FMI device volume during tariff disruption.

**Latest quarter — Q2 2026** ([FAST 10-Q, period ended 30 Jun 2026, filed 16 Jul 2026](https://www.sec.gov/Archives/edgar/data/815556/000081555626000041/fast-20260630.htm)):

| Metric | Q2 2026 | Q2 2025 | Change |
|---|---:|---:|---:|
| Signings (MEU) | 6,993 | 6,458 | +8.3% |
| Signings per day | 109 | 101 | — |
| **Installed base (MEU)** | **140,789** | 132,174 | **+6.5%** |
| FASTBin/FASTVend sales | $781.4M | $665.3M | +17.4% |
| FMI sales | $1,081.0M | $928.5M | +16.4% |
| — % of sales | **44.6%** | 44.1% | +50 bps |
| Company gross margin | 44.6% | 45.3% | **−75 bps** |

**2026 signings goal: 27,000–29,000 MEU** — revised *down* from a previous
28,000–30,000.

### 1.4 What the growth rate actually says

Read the two columns together and the story is less exciting than the
headline:

- Installed base growing **+6.5 to +7.6%/yr**. That is mid-single-digit
  hardware growth, not a land grab.
- **Signings fell 7.5% in 2025** and the 2026 goal was cut twice (30,000 →
  28,000 → 29,000 top end). Fastenal is *decelerating* placements.
- Sales *through* the devices grew +17% — faster than the device count. So the
  growth is **throughput per machine and migration of existing spend**, not new
  boxes. The 10-Q says this explicitly: growth *"reflects the migration of
  products from less efficient non-digital stocking locations to more efficient,
  digital stocking locations."*

**That last sentence is the whole business in one line.** FMI revenue is
overwhelmingly *transferred* revenue — spend that was already Fastenal's,
moving from a shelf to a machine. It is a **margin-and-retention play on
existing accounts**, not a customer-acquisition engine.

### 1.5 The market Fastenal claims

> We estimate the market could support as many as **1.7 million vending units**
> [in North America]… we have identified over **13,000 customer locations**
> with the potential to implement our Onsite service model.
> — [FAST 10-K FY2025, Item 1A](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm)

**Mark as company-sourced TAM, not independently verified.** Fastenal itself
flags it: *"We cannot guarantee that our market potential estimates are
accurate."* At ~124,000 devices after 18 years, they are at ~7% of their own
claimed TAM and adding ~7%/year to the base. Either the TAM is wrong or the
market is far harder to penetrate than the number implies. Treat 1.7 million
as a sell-side artifact.

### 1.6 The second data point — MSC Industrial

MSC is the only other public company reporting vending unit counts.

| Metric | MSC fiscal Q3 2026 (reported 1 Jul 2026) |
|---|---:|
| Net sales | $1,047M |
| Vending machines installed | **~30,800** (+7% YoY) |
| Vending as % of net sales | **~20%** |
| In-Plant programs | 426 (+7%), ~21% of sales |
| Gross margin | 41.1% |
| FY2025 full-year net sales | $3,769.5M (−1.3%) |

Sources: [MSC Q3 FY2026 earnings call, 1 Jul 2026](https://www.fool.com/earnings/call-transcripts/2026/07/01/msc-industrial-msm-q3-2026-earnings-call-transcript/); [MSC FY2025 results, 8-K](https://www.sec.gov/Archives/edgar/data/1003078/000100307825000121/exhibit991earningspressrel.htm).

Same story, smaller: ~7%/yr unit growth, vending is a fifth of revenue, and
gross margin is **below** the company's own historical level.

---

## 2 · The unit economics of one machine

### 2.1 Revenue per machine — derived from audited filings

This is the number the whole decision turns on, and both public companies
agree on it.

| | Fastenal FY2025 | MSC fiscal Q3 2026 |
|---|---:|---:|
| Sales through devices | $2,675.0M | ~$209.4M (20% of $1,047M) |
| Device base | 131,798 avg MEU | ~30,800 machines |
| **Revenue per device per month** | **$1,691** | **$2,266** |
| Revenue per device per year | $20,296 | $27,195 |
| vs. Fastenal's own $2,000 target | **84.6%** | — |

*Derivation: Fastenal uses average of opening (126,957) and closing (136,638)
MEU. MSC counts physical machines, which skew larger (tool-crib format), so its
per-unit figure runs higher than a normalised MEU.*

**Take $1,700–$2,300 per machine per month as the real, verified range.** Any
business case built on more than that is arguing with two sets of audited
financials.

### 2.2 Gross margin on vended goods vs. counter sales — the assumption is backwards

The common belief is that vended consumables carry a fat margin. **At Fastenal
the opposite is true, and they say so twice in the 10-K:**

> Contract accounts and Onsite customers typically have a **lower gross profit
> percentage** than smaller customers by virtue of their scale, available
> business, and broader offering of products which typically have lower gross
> profit percentages.

> Our fastener expansion project and other supplier-focused initiatives offset
> the **gross margin headwind of a continued shift toward larger customers**,
> which typically generate higher volume at lower gross margins.
> — [FAST 10-K FY2025, Items 1A and 7](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm)

And on the trend: *"customer and product mix have contributed to the decline of
our gross profit percentage over time and… will likely continue to reduce our
gross profit percentage into the foreseeable future."*

Fastenal's blended GM fell from 45.1% (2024) to 45.0% (2025) to **44.6%** (Q2
2026). MSC runs 41.1%. Vending customers are the **large, contracted,
lower-margin** end of the book.

**Correct model, therefore:**

| | Assumption | Per machine / year |
|---|---|---:|
| Revenue | $1,691/mo × 12 | $20,296 |
| GM at company blended 45.0% | optimistic | $9,133 |
| GM at contract-customer ~40% | **realistic** | **$8,119** |

**Vending trades gross margin percentage for volume, stickiness and share.**
That is a rational trade *for a company that already has the account.* It is a
terrible trade for a company trying to win its first one.

### 2.3 Installed cost of the hardware

**This is where the industry goes private.** No vendor publishes a price list;
everything is quoted. What is public:

| Source | Figure | Date / note |
|---|---|---|
| [Industrial Distribution](https://www.inddist.com/business-technology/blog/21603272/is-vending-worth-the-cost-for-distributors) | **$5,000 to over $20,000** initial investment per machine | trade publication, range for industrial-grade units |
| [1SourceVend](https://www.1sourcevend.com/how-much-does-a-vending-machine-cost-and-whats-my-roi/) | helix coil and locker units **under $5,900**; notes competitors above $20,000 | 8 Jun 2021, vendor self-published |
| Vendor quote reported in trade coverage | **$12,500/machine + $175/month software, 60-month term** | *unverified — single secondary reference* |
| eBay, used | AutoCrib RoboCrib 2000 listed at **$4,000** used, working with software | live listing, 2026 |
| **Derived from Fastenal PP&E** | **≤$12,295/device** | $1,524.6M gross "Shelving, industrial vending, and equipment" ÷ ~124,000 FASTVend devices — **upper bound only**, the bucket also contains shelving and branch equipment |

**Working range: $6,000–$12,500 installed for a credible helix/locker unit,
plus $100–$200/month software per machine.** Depreciable life 3–10 years
(Fastenal's disclosed range for that asset class). Anything advertised much
below $5,000 is a snack machine with a badge reader bolted on.

### 2.4 The cost nobody quotes — service

**The hardware is the cheap part. The route is the expensive part.**

A 2025 *Operations Research* submission by Sindermann, Gel and Erkip
(University of Nebraska–Lincoln and Bilkent) used real transaction data from an
unnamed industrial partner described as *"a leading distributor of industrial
and construction supplies in North America with more than 3,000 market
locations and more than 100,000 IVMs"* — that is Fastenal in all but name
([arXiv:2503.13643, 17 Mar 2025](https://arxiv.org/abs/2503.13643)).

Findings that matter here:

1. **"The supplier does not carry inventory holding costs in the traditional
   sense but owns the IVMs and therefore incurs capital investment costs
   associated with placing them in the customer's site."** Confirms: the
   distributor buys the box, the customer pays only for goods on dispense.
2. **The partner visits most customer sites *daily* to restock.**
3. Modelled fixed cost per replenishment visit: **$100–$700**.
4. Total annual replenishment + stockout cost **at a single customer site:
   $12,544 to $54,610**, depending on that fixed cost.
5. Optimal cycle length is **4.5–6.0 days**, not daily. Current daily practice
   costs **61.7%–78.6% more** than optimal — a deliberate service-quality choice.

**Do the arithmetic against §2.2.** Gross profit per machine is ~$8,100/year.
Annual service cost at *one site* starts at ~$12,500. **A one-machine site
loses money outright.** The economics only close on **density** — many machines
per site, many sites per truck.

Fastenal's own density, from the FY2025 10-K site table:

| Customer sites by monthly spend | Q4 2025 | Q4 2024 |
|---|---:|---:|
| $50k+ | 2,657 | 2,330 |
| $10k+ (includes $50k+) | 11,712 | 10,837 |
| $5k–$10k | 7,067 | 6,948 |
| Under $5k | 73,357 | 82,650 |

Sites at **$5,000+/month = 18,779.** Against 136,638 installed MEU, that is
**~7.3 machine-equivalents per meaningful customer site** — serviced by 1,595
branches and 24,489 employees.

> **The entry condition for vending is not a machine. It is a customer site
> already spending $5,000–$10,000 a month with you, within reach of a route you
> are already driving.** Misty Valley has zero such sites.

### 2.5 Effect on retention and share of wallet

Directionally strong, quantitatively thin. Fastenal's own language:

> FMI programs tend to generate a **higher frequency of business transactions**
> and… **foster a strong relationship with customers.**
> We believe industrial vending has proven its effectiveness in **strengthening
> our relationships with customers.**
> — [FAST 10-K FY2025, Item 1](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm)

The most-cited quantitative claim is vendor-published, not independent:

- **~$250 in additional monthly profit** (≈$1,000 additional monthly spend) is
  enough to justify placing a machine — [1SourceVend, 8 Jun 2021](https://www.1sourcevend.com/how-much-does-a-vending-machine-cost-and-whats-my-roi/). **Vendor-sourced; treat as a sales
  argument.** Note it is also *half* Fastenal's $2,000 target throughput, and it
  ignores service cost entirely (§2.4).
- The "5% retention → 25–95% profit" figure that circulates in vending
  marketing is the 1990 Reichheld–Sasser result, recycled. **Not specific to
  vending. Do not cite it.**

**Honest summary:** the retention effect is real and is the actual reason
distributors do this — but there is **no public, independent, quantified
measurement** of the sales lift attributable to vending. Anyone who gives you a
percentage is selling you something.

---

## 3 · Why distributors really do it

Three reasons, in descending order of how well-evidenced they are.

### 3.1 Consumption control — well evidenced, and it is the customer's benefit, not yours

Metering access to PPE reduces how much PPE gets used. Fastenal lists the
benefit first: *"reduced consumption, reduced purchase orders, reduced product
handling, and 24-hour product availability."*

| Claimed reduction | Source | Confidence |
|---|---|---|
| 25–40% reduction in consumable use | market research syntheses, 2026 | secondary, aggregated |
| 30–50% | multiple vendor sites | **vendor marketing** |
| **34% cut in PPE spend in 12 months** | [Inventor-e, UK automotive manufacturer case study](https://www.inventor-e.co.uk/case-study-automotive-ppe-cost-reduction-industrial-vending/) | named case, **vendor-published** |
| 15–20% "conservative" | trade commentary | secondary |

**Reasonable planning figure: 20–35%.** Achieved through reduced hoarding,
waste, off-spec substitution and outright theft.

**Now read that backwards.** A 20–35% consumption reduction means the customer
**buys 20–35% less** of the thing you sell. You are financing a machine whose
headline benefit is *shrinking your own volume on that SKU.* The trade only
works if the machine simultaneously captures enough of your competitors' share
of that customer to more than offset the cut. It usually does — at a
manufacturing plant where you become the sole source across hundreds of SKUs.
It does not, at one machine on one site.

### 3.2 Stickiness and switching cost — the real reason

The switching cost is genuinely high, and it is **operational, not
contractual**:

- The device is physically bolted into the customer's floor and wired to their
  power and network.
- The plan-o-gram, min/max levels and SKU mapping are the distributor's IP,
  built over months of consumption data.
- The customer's own cost accounting, job-costing and safety compliance
  reporting run off the distributor's dispense logs (FAST360°, FASTCrib).
- Ripping it out means re-tendering, re-mapping and re-training — for a
  category that is <1% of the customer's spend and 100% of their annoyance.

This is why Fastenal calls it migrating *"transactional, 'non-sticky'"* online
spend into a *"'sticky' managed setting."* It is a **moat around revenue you
already have.** It is not a way to get revenue you do not have.

### 3.3 Share of wallet — real, unquantified publicly

Fastenal's $50k+/month sites grew **+14.0%** in 2025 while sub-$5k sites fell
**−11.2%**. The book is concentrating hard into large managed accounts, and FMI
is the mechanism. That is the strongest public evidence of the wallet-share
effect — but it is a *correlation across a 92,000-site book*, not an
attributable per-machine lift.

---

## 4 · The competing vendors, and whether to build

### 4.1 Who sells the hardware

| Vendor | Position | Notes |
|---|---|---|
| **Apex Industrial / Apex Supply Chain Technologies** (Mason, OH) | The origin of the category | Founder Kent Savage holds the 1993 US patent for a *"Machine Tool Dispensing Device and System."* **Co-developed Fastenal's entire platform from 2008.** |
| **AutoCrib** (Tustin, CA) | Now **Snap-on AutoCrib** | RoboCrib VX500/VX1000, TX750, RDS. Long installed base, strong in aerospace/machining. |
| **CribMaster** | **Stanley Black & Decker** | 12,000+ customers, 36 countries (company-stated). ToolBox line. |
| **SupplyPro** | Independent | 16,000+ customised installations, 44 countries, 60M+ SKUs managed (company-stated). |
| **IVM Inc.** (Indianapolis) | Mid-market, some construction | Self-described as *"a tech company masking as a vending company"* ([Construction Dive, 8 Feb 2017](https://www.constructiondive.com/news/from-vending-machines-to-virtual-reality-inside-the-21st-century-job-site/435653/)). |
| **VendNovation** | Hardware + lockers + portable safes | Sells to distributors. |
| **1SourceVend** | Low-cost challenger | Publishes a **sub-$5,900** price point — rare transparency. |
| **Silverback** | Smaller US player | Thin public information. |
| **Fastenal (in-house)** | Vertically integrated | See below. |

### 4.2 The decisive fact about hardware supply

On **30 March 2020**, Fastenal filed an 8-K disclosing that it had purchased
from Apex Industrial Technologies *"perpetual and unfettered use of key
patents, designs, software and licenses, as well as direct access to the supply
chain"* ([FAST 8-K, 30 Mar 2020](https://www.sec.gov/Archives/edgar/data/815556/000081555620000022/fast03302020assetpurch.htm)). Terms undisclosed. At the time the joint platform
covered *"more than 105,000 product dispensing and leased devices across 23
device types in 25 countries that generated more than $1.1 billion in sales in
2019."*

**Read what happened there.** Fastenal ran the *exact structure being proposed
here* — a technology company owning the hardware IP, a distribution company
running the trade — **for twelve years.** Then it bought the hardware company's
IP outright and took it in-house, because a distributor at scale cannot afford
its dispensing platform to sit in someone else's entity.

Fastenal still flags the residual risk in its 10-K:

> We currently choose to rely on a **limited number of suppliers** for our
> vending devices, RFID technology, and IR technology… loss of our current
> suppliers could be disruptive and could result in our failure to meet short-
> or long-term goals related to the numbers of devices we are able to deploy.

### 4.3 Is there a credible path for a newcomer to build?

**No.** Four reasons, in order of severity.

**(a) The prize is the wrong size.** The North America industrial vending
*hardware* market is roughly **$1.25B (2025)**, growing ~9.5% CAGR (Mordor
Intelligence / market-research syntheses — **third-party estimates, methodology
not audited; treat as order-of-magnitude**). Fastenal alone flows **$2.68B of
goods** through its devices. **The hardware is ~2% of the value; the
consumables are 98%.** Building the box is competing for the smallest,
hardest, most capital-intensive slice of the stack.

**(b) The incumbents own the software, not the sheet metal.** Bending a locker
is easy. What is hard: 15+ years of plan-o-gram logic, min/max algorithms,
ERP/EDI integration, badge and RFID access control, SOC-compliant dispense
audit trails, remote firmware management, and field service for a fleet that
must not fail. Fastenal's competitive-advantage paragraph names *hardware and
software, local presence, product depth, and distribution strength* — three of
those four are not hardware.

**(c) Two of the four largest vendors are owned by Snap-on and Stanley Black &
Decker.** Competing on hardware means competing with two multi-billion-dollar
tool manufacturers who already own the channel, the brand and the factories.

**(d) Certification and liability.** A cabinet that dispenses PPE, mounted in a
customer's facility, on their power, with their employees' credentials, holding
their safety-compliance record. That is UL listing, NEC compliance, data
retention, and a product-liability tail — for a company with no revenue and no
insurance history.

**If a machine is ever needed: buy it.** A sub-$5,900 to $12,500 unit from
1SourceVend, VendNovation or AutoCrib, on a standard distributor program,
delivers 100% of the economics for ~0% of the engineering risk. There is no
version of this where building is correct.

### 4.4 Is there a reselling path?

**No.** Reselling hardware into a $1.25B market against Snap-on, SBD, and a
vertically-integrated Fastenal, with no installed base, no service technicians,
and no software — is a distribution business for a product with 2% of the value
and 100% of the support burden. The margin in this category has never been in
the box.

---

## 5 · Jobsite versus plant — the honest answer

**This is the section that matters, and the answer is: it does not work on a
normal construction jobsite.**

### 5.1 The evidence that industrial vending is a *plant* product

| Evidence | Figure |
|---|---|
| Fastenal sales to **manufacturing** | **75.9%** (2025), rising from 74.3% (2023) |
| Fastenal sales to **non-residential construction** | **8.1%** (2025), falling from 8.5% (2024) and 9.1% (2023) |
| Fastenal FMI growth commentary | *"relative strength… with key account customers with significant managed spend where our service model and technology is particularly impactful. **This disproportionately benefits manufacturing customers.**"* |
| MSC's parallel programme | "**In-Plant** Solutions" — the name is the thesis |

Source: [FAST 10-K FY2025](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm), end-market disclosure note.

**Eighteen years, ~124,000 machines, $2.68B of throughput — and construction is
8.1% of the book and shrinking.** That is not an oversight by Fastenal. It is
the market telling them where this product works.

### 5.2 The four physical constraints

A construction jobsite is defined by exactly the properties an industrial
vending machine cannot tolerate:

| Constraint | Plant | Jobsite | Consequence |
|---|---|---|---|
| **Power** | Permanent 120V, conditioned | Temp power, generators, none at all in early phases | Machine needs continuous power for locks, controller, sensors. Battery/solar exists but adds cost and failure modes. |
| **Network** | Wired/WiFi, IT-supported | None. Cellular only, often marginal | Every dispense must be logged and replenishment triggered remotely. No signal = no auto-replenishment = the entire value proposition is gone. |
| **Security & environment** | Enclosed, climate-controlled, badge-access building | Unsecured perimeter, dust, −20°C to 50°C swings, humidity, vibration | **~$1B/yr in US construction site theft; tools and equipment are ~60% of it; recovery for small items as low as 7%.** A cabinet full of gloves and blades, unattended overnight, behind a chain-link fence, is a target — and it is *your* asset, not the customer's. |
| **Permanence** | 10–30 year facility | **The site ends.** Then it relocates, or it does not | Fastenal depreciates this asset class over **3–10 years**. A machine amortised over 5 years on a 9-month project needs to be de-installed, transported, refurbished and re-commissioned 6+ times over its life. Nobody has priced that. |

### 5.3 The throughput test — the number that ends it

Construction PPE and safety consumables run roughly **$600/worker/year ≈
$50/worker/month** (hard hat, boots allowance, gloves, glasses, vest, hearing
protection — [Projul labor burden guide](https://projul.com/blog/construction-labor-burden-calculation-guide/); consistent with broader OHS
expenditure data showing ~14% of safety spend goes to PPE, and $2,417/worker/yr
total OHS spend in goods-producing sectors, [Institute for Work & Health](https://www.iwh.on.ca/plain-language-summaries/what-do-employers-spend-to-protect-health-and-safety-of-workers)). **Mark the $50/month as a
planning estimate, not an audited figure.**

To fill one machine to Fastenal's $2,000/month target:

| Capture rate of on-site PPE spend | Workers required, continuously, on one site |
|---:|---:|
| 100% (impossible) | **40** |
| 75% | **53** |
| 60% (realistic best case) | **67** |
| 50% | **80** |

**Against reality:** a multi-day commercial crew is typically **four to six
workers per trade**. Even a busy mid-size commercial site is 20–50 workers
across a dozen employers — **and each sub buys its own PPE.** You would be
placing a machine that serves one sub's crew of six: $300/month of throughput
against a $6,000–$12,500 asset and a service route.

**One machine on a normal jobsite runs at roughly 15% of the throughput it
needs.** That is not a tuning problem. It is off by a factor of six.

### 5.4 The real jobsite deployments — and what they have in common

I found exactly one substantive, named, non-vendor-marketing case:

**NorthConnex, Sydney** — a 9km twin-tunnel motorway project. Blackwoods
Inventory Solutions vending machines deployed across the sites, serving a
**2,000-plus workforce**, 24/7 access to gloves, safety glasses, masks
([Safety Solutions, 21 May 2018](https://www.safetysolutions.net.au/content/personal-protection-equipment/case-study/ppe-vending-machines-keep-construction-workers-safe-145131577)). Reported outcomes: eliminated the need for a
dedicated on-site storeman, stopped subcontractors using unapproved PPE, fixed
pricing, per-person usage visibility. **No cost savings figures disclosed.**

**Look at what NorthConnex actually is:** a multi-year megaproject with 2,000+
workers, a single controlling joint venture, permanent site compounds, mains
power, network, security, and a workforce large enough to clear the throughput
test by 30×. **It is a plant that happens to be underground.** It is not a
jobsite in the sense Misty Valley's customers mean.

The other citations are thinner:
- IVM (Indianapolis) sells to construction, but the [Construction Dive piece
  (8 Feb 2017)](https://www.constructiondive.com/news/from-vending-machines-to-virtual-reality-inside-the-21st-century-job-site/435653/) names no contractor customers, no costs, no savings, and does not
  address power, security or relocation at all.
- "Construction site vending machines" as a search term returns overwhelmingly
  **snack and beverage vending** for jobsites — a genuinely different, and
  genuinely viable, business. Do not confuse the two.
- Vendor pages asserting jobsite suitability ("place it in a mobile trailer")
  are marketing copy with no case behind them.

**Conclusion: jobsite industrial vending works on megaprojects and nowhere
else.** The bar is roughly 500+ workers, 18+ months, single controlling
contractor, established site compound. Below that, it is a machine looking for
volume that is not there.

### 5.5 What would have to be different

If this idea is ever revived, these are the only configurations that survive
contact with a jobsite:

| Concept | Verdict |
|---|---|
| **Trailer-mounted mobile unit** | Solves relocation and security; turns the machine into a **vehicle** — DOT, registration, insurance, a driver, and a 5–10× cost increase. Now you are in equipment rental, not distribution. |
| **Solar + cellular** | Technically available (dual AC/DC, integrated panels, battery backup, IP54+ ratings exist in the outdoor vending market). Adds cost and two new failure modes. Does not fix the throughput problem, which is the binding constraint. |
| **Gang box with access control** ✅ | **The correct answer — and the market is already served.** BoxLock's Knaack job box insert converts a standard job box into smart secure storage, integrating with Milwaukee **ONE-KEY** and DEWALT **Tool Connect**; Hilti **ON!Track** does RFID asset tracking across sites. Cheap, rugged, unpowered or battery, already in every contractor's yard. **Building this is not greenfield either.** |
| **Do nothing; sell the consumables on the truck** ✅✅ | The only option that costs zero and uses the asset Misty Valley actually has: a truck already going to the site. See §6. |

---

## 6 · The verdict, and what to do instead

### 6.1 Build / buy / resell / drop

| Option | Verdict | Why |
|---|---|---|
| **Build hardware at Allerion** | **Drop** | $1.25B NA hardware market = 2% of the value stack; incumbents owned by Snap-on and SBD; Fastenal vertically integrated in 2020; UL/liability tail; no engineering capacity. |
| **Buy machines and place them** | **Not now** | Entry condition is customer sites at $5,000+/mo and route density. Misty Valley has zero. Revisit only when §6.3 is met. |
| **Resell third-party hardware** | **Drop** | No installed base, no service techs, no software, 2% of the value, 100% of the support burden. |
| **Allerion owns hardware, rents to Misty Valley** | **Drop — actively harmful** | Fastenal books this asset as **occupancy expense**. It is rent-like overhead, not a rentable asset. The structure adds SBA affiliation and transfer-pricing exposure (`12-allerion-and-the-stack.md`) and creates no dollar. |

### 6.2 The pilot that looks tempting, priced honestly

A 10-machine pilot, every assumption set generously in its favour:

| Line | Amount |
|---|---:|
| Capital — 10 × $8,000 installed | **($80,000)** |
| Revenue — 10 × $2,000/mo × 12 *(at 100% of Fastenal's target, which Fastenal itself hits at 84.6%)* | $240,000 |
| Gross profit at 35% *(contract-customer margin)* | $84,000 |
| Software — 10 × $175/mo | ($21,000) |
| Depreciation — $80,000 over 5 yrs | ($16,000) |
| Service route — 1 part-time restocker, fully loaded | ($33,000) |
| **Annual contribution** | **$14,000** |
| **Return on capital employed** | **17.5%** |

**And now the reasons that $14,000 is fiction:**

1. It assumes 10 machines at **100% of target throughput from day one.** Fastenal
   runs at 84.6% across a mature 136,638-unit fleet. Realistic year-one fill is
   40–60%. At 50%, gross profit is $42,000 and **the pilot loses ~$28,000/year.**
2. It assumes 10 customer sites willing to take a machine. Misty Valley has no
   customers of that size today.
3. It assumes a vendable catalogue. **There is none** — the core product is
   framing packages.
4. It assumes the service route is incremental-free. Per §2.4, a single site's
   annual replenishment cost starts at ~$12,500.
5. **$80,000 is 2.5 landed containers** of framing inventory at $32,489 each
   (`04-unit-economics.md`). At zero revenue, that capital has exactly one
   correct destination, and it is not sheet metal cabinets.

### 6.3 The trigger to revisit — write it down

Do not think about this again until **all four** are true:

- [ ] **3+ customer sites spending $5,000+/month** with Misty Valley, on
      recurring consumables (not project framing draws).
- [ ] A **standing delivery route** already passing those sites weekly — the
      truck is going anyway.
- [ ] A **vendable catalogue of 150+ SKUs** — fasteners, screws, bits, blades,
      gloves, glasses, layout consumables. `PRODUCT-ATTACH.md` Tier 1 is the
      on-ramp: CFS accessories, clips, bridging, fasteners. *"Fasteners are the
      margin engine."*
- [ ] The customer is a **plant, warehouse, fabrication shop or 500+ worker
      megaproject** — permanent power, network, secured perimeter.

When all four are true: **buy a single 1SourceVend-class unit under $6,000,
place it in one account, and measure for two quarters.** Never build. Never
put it in Allerion.

### 6.4 What to do instead, this quarter

The insight underneath the vending idea is correct and worth keeping: **the
money in distribution is in the recurring consumable attached to the planned
material, not in the planned material.** Fastenal proves it — 44.7% of $8.2B
runs through managed inventory.

But the vehicle for that at zero revenue is **not a machine. It is the truck
that is already going to the site.** `PRODUCT-ATTACH.md` has this exactly
right: attach costs near zero, diversification costs a second company. Sell
the clips, bridging, deflection track and fasteners **on the framing
delivery**, capture the consumable spend by being *there*, and build the
recurring-revenue account base that a vending programme would eventually sit on
top of.

Vending is the reward for having done that. It is not the way to do it.

---

## Sources

**Primary — SEC filings**
- [Fastenal Company, Form 10-K, FY ended 31 Dec 2025, filed 5 Feb 2026](https://www.sec.gov/Archives/edgar/data/815556/000081555626000009/fast-20251231.htm) — FMI signings/installations/sales, MEU definition, device counts, end-market mix, PP&E, capex, gross margin, occupancy-expense classification, supplier concentration risk, 1.7M TAM.
- [Fastenal Company, Form 10-Q, period ended 30 Jun 2026, filed 16 Jul 2026](https://www.sec.gov/Archives/edgar/data/815556/000081555626000041/fast-20260630.htm) — Q2 2026 FMI table, 2026 signings goal.
- [Fastenal Company, Form 8-K, 30 Mar 2020](https://www.sec.gov/Archives/edgar/data/815556/000081555620000022/fast03302020assetpurch.htm) — Apex Industrial Technologies asset purchase.
- [MSC Industrial Direct, FY2025 results, Form 8-K](https://www.sec.gov/Archives/edgar/data/1003078/000100307825000121/exhibit991earningspressrel.htm) — FY2025 net sales $3,769.5M.

**Primary — academic**
- Sindermann, K.M., Gel, E.S., Erkip, N., *Optimal Replenishment Policies for Industrial Vending Machines*, submitted to Operations Research, [arXiv:2503.13643, 17 Mar 2025](https://arxiv.org/abs/2503.13643) — replenishment cost structure, daily-visit practice, $12.5k–$54.6k annual per-site cost, IVM ownership model.

**Secondary — trade and case**
- [MSC Industrial Q3 FY2026 earnings call, 1 Jul 2026](https://www.fool.com/earnings/call-transcripts/2026/07/01/msc-industrial-msm-q3-2026-earnings-call-transcript/) — 30,800 machines, 20% of sales, 41.1% GM.
- [Industrial Distribution, "Is Vending Worth the Cost for Distributors?"](https://www.inddist.com/business-technology/blog/21603272/is-vending-worth-the-cost-for-distributors) — $5,000–$20,000+ machine range.
- [1SourceVend, "How Much Does a Vending Machine Cost (and What's My ROI)?", 8 Jun 2021](https://www.1sourcevend.com/how-much-does-a-vending-machine-cost-and-whats-my-roi/) — sub-$5,900 price point, $250/month justification claim *(vendor-sourced)*.
- [Safety Solutions, "PPE vending machines keep construction workers safe", 21 May 2018](https://www.safetysolutions.net.au/content/personal-protection-equipment/case-study/ppe-vending-machines-keep-construction-workers-safe-145131577) — NorthConnex, 2,000+ workforce, Blackwoods.
- [Construction Dive, "From vending machines to virtual reality: Inside the 21st-century job site trailer", 8 Feb 2017](https://www.constructiondive.com/news/from-vending-machines-to-virtual-reality-inside-the-21st-century-job-site/435653/) — IVM Inc.
- [Inventor-e, automotive PPE cost reduction case study](https://www.inventor-e.co.uk/case-study-automotive-ppe-cost-reduction-industrial-vending/) — 34% PPE spend reduction *(vendor-published)*.
- [BoxLock Knaack jobsite box insert](https://www.boxlock.io/knaack-jobsite-box-insert); [Milwaukee ONE-KEY](https://onekey.milwaukeetool.com/); [DEWALT Tool Connect](https://www.dewalt.com/systems/tool-connect) — the gang-box alternative.
- [Projul, construction labor burden guide](https://projul.com/blog/construction-labor-burden-calculation-guide/) — ~$600/worker/yr PPE.
- [Institute for Work & Health](https://www.iwh.on.ca/plain-language-summaries/what-do-employers-spend-to-protect-health-and-safety-of-workers) — OHS expenditure per worker, PPE share.
- [Snap-on AutoCrib](https://www.autocrib.com/), [CribMaster / Stanley Black & Decker](https://storage.stanleyblackanddecker.com/cribmaster/solutions/inventory-and-tool-vending-machines), [SupplyPro](https://www.tier1mro.com/supplypro/), [VendNovation](https://vendnovation.com/equipment), [Apex Supply Chain Technologies](https://apexsupplychain.com/) — vendor landscape.

**Explicitly marked as unverified or low-confidence**
- North America industrial vending hardware market at ~$1.25B (2025), ~9.5% CAGR — third-party market-research syntheses, methodology not audited. Order-of-magnitude only.
- Fastenal's 1.7 million-device TAM — company estimate, disclaimed by Fastenal itself.
- "$12,500/machine + $175/month software, 60-month term" — single secondary reference, not confirmed against a vendor quote.
- Consumption-reduction figures of 30–50% — vendor marketing. The 20–35% band is the defensible planning range.
- $50/worker/month PPE spend — planning estimate derived from a labor-burden guide and OHS survey data, not an audited industry figure.
- Per-machine revenue figures for Fastenal and MSC are **derived** by this analysis from audited aggregates, not disclosed per-unit by either company.
