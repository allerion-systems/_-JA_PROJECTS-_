# Misty Valley Supply — Structure & Risk Review

Prepared for **Ben East Ray** (Misty Valley Contracting) and **Joey Allee**,
4 September 2026.

Ben asked for help setting the structure up right and being effective. The
structure work is in `01`. But three things surfaced that change what "right"
means, and two of them are time-critical against a stated plan to place the
first purchase order next week.

**Nothing here says don't do this.** Ben has a hand most startups never get: ten
years of reputation, a captive installer, a won job, a paying customer, and a
shop. The findings below are about making sure the first container is a
business and not a $40,000 tuition payment.

---

## The three findings

### 1. The margin isn't there at the numbers as stated

The plan is buy at **$11,000** landed, sell at **$22,000**. Both numbers are
wrong, in opposite directions, which is why the error has gone unnoticed — they
cancel out into a margin that looks plausible.

**Ocean freight alone is $9,587 per 40ft container** (Drewry, 3 Sept 2026).
That's 87% of the entire "all-in" budget before one dollar of steel, duty, or
trucking. On top of that, Chinese cold-formed steel framing carries a **75% ad
valorem duty stack** — 50% Section 232 plus 25% Section 301, both verified in
the HTSUS legal text, and since April 2026 the 50% applies to the **full
customs value**, not just steel content.

For $11,000 to be a real landed cost, the supplier invoice would have to be
**$788 per container** — about $39/tonne. Chinese *scrap* is $300–350/tonne.

> **Realistic landed cost: $38,000–$42,600 per container.**

And the sell price is too *low*: a properly loaded container holds ~110,000
linear feet of stud, worth **$81,500–$126,000** at distributor pricing. $22,000
implies either a quarter-loaded container or a sale below the raw steel cost.

**→ `04-unit-economics.md`** for the arithmetic, sources, and what to do about it.

### 2. The product may not be legal to install — and that reaches Contracting

This is the one that worries me most, because it's the only finding that can
damage the ten-year-old contracting business, not just the new one.

A fire-rated wall isn't a wall built from good parts — it's a *specific tested
assembly*, and the rating belongs to the assembly. UL's own guidance: changing
member thickness *"would be considered to **void the existing certified
assembly**."* The ratchet only runs one way — heavier and larger preserve a
rating; **thinner never does.**

Two compounding problems specific to imports:

- **Base metal thickness must be ≥95% of design thickness, measured as
  delivered, coating stripped.** Independent lab testing of Chinese-sourced
  framing found delivered thickness at **85–94%** of requirement — every sample
  failing. The failure is invisible on site and invisible on paper.
- **Mill certificates don't settle it.** Industry audit data shows **more than
  50% of samples that fail certification came from "prime steel" coil with a
  mill certificate** — and that's domestic product with domestic certs.

And a practical one: the Chinese product actually on offer is typically
**metric** (50/65/70/75mm profiles, 2800–4000mm lengths), not ASTM 3-5/8" ×
10 ft. Non-listed metric keel cannot go into code-critical commercial
partitions at all.

**→ `03-product-compliance-risk.md`** — including the two legitimate paths to a
compliant imported stud, and the micrometer protocol for incoming containers.

### 3. The liability shield you'd expect does not hold

Kentucky has a middleman statute, [KRS 411.340](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=17813),
that protects a distributor who resells a product unchanged. It has a
prerequisite: the manufacturer must be **"identified and subject to the
jurisdiction of the court."**

A Chinese mill will not be. *Elkins v. Extreme Products Group* (E.D. Ky. 2021)
denied a retailer's motion on exactly this basis — jurisdiction over the
manufacturer is *"a prerequisite for the Middleman Statute to apply."*

**And the cut shop independently defeats it.** The statute requires the product
be sold *"in its original manufactured condition or package."* Cutting to length
and re-bundling is not that. Kentucky's product-liability act expressly includes
*"processing, assembly, testing, listing, certifying... labeling"* in the
definition of a covered action.

> **Net effect: Misty Valley Supply becomes the defendant of record** — the last
> solvent, servable party in the chain. That is why the insurance question in
> `01` §10 is not paperwork.

---

## What I'd do differently — the strategic call

The margin story is *"we're cheap because we import."* That margin is a gap in
the tariff schedule: someone else controls it, it's actively being closed
product by product, and any competitor with a phone can access it.

Ben's actual defensible asset is already in the plan — **the cut shop and the
job-site package.** It sells labor savings, which is the scarcest input in
construction; it creates switching costs; it's credible coming from a man who's
framed for ten years; and **it works with steel from any country.**

> **The business is a value-added framing package supplier.
> Importing is one sourcing option inside it — not its identity.**

Same shop, same trucks, same customers, same first sale to Scott. But prove the
model on domestic steel first — where there's no duty, no AD/CVD tail, no code
fight, no bond, and a cash cycle a fraction as long — then layer imports in as
a margin enhancer once there's volume, credit, and a compliance function.

**→ `06-the-stronger-play.md`**, including what would prove this reframe *wrong*
and the three cheap tests that settle it.

---

## Before the wire — the short version

Full checklist in **`05-first-container-gate.md`**. The five that can't wait:

1. **Get the quote in writing with the Incoterm.** "$11,000" isn't a price until
   you know if it's EXW, FOB, CFR or DDP. Most likely this is an FOB quote being
   read as delivered — an ordinary misunderstanding with a $30,000 consequence.
2. **Get the packing list and weight ticket.** Every ambiguity about what's
   actually in the container collapses the moment those exist.
3. **Engage a licensed customs broker.** Get the classification and an AD/CVD
   read in writing. A few hundred dollars, and the cheapest professional you'll
   ever hire.
4. **Read the Hebron spec for "domestic steel," "Buy America," "melted,"
   "poured."** Ninety seconds. Hebron is where CVG is — if any federal or FAA
   money touches that job, Chinese steel is prohibited by statute, and a bid
   certification makes it worse than a spec violation.
5. **Bind products liability for Supply before material ships** — confirmed in
   writing to cover Supply as *importer*, with the cut shop disclosed.

> **🚩 If the supplier offers "DDP $11,000" or "we handle customs" — walk away.**
> At a 75% duty stack no legitimate operator delivers that price. That offer is
> the signature of undervaluation, and the liability lands on Misty Valley, not
> the supplier.

---

## Contents

| File | What's in it |
|---|---|
| **`01-entity-structure.md`** | Holdco/opco architecture on verified Kentucky law. No series LLCs in KY; single-member charging-order weakness; the LLET cut-shop trap; sales-tax treatment; lien deadlines; the related-party protocol; sign-off register by professional. |
| **`02-trade-compliance-risk.md`** | The 75% stack, verified in the HTSUS text. IEEPA refunds you may be owed. The AD/CVD retroactive mechanism and the scope-ruling mitigation. |
| **`03-product-compliance-risk.md`** | UL fire-rated assemblies, the 95% rule, the EQ stud trap, why the middleman defense fails, Buy America. |
| **`04-unit-economics.md`** | Container capacity, real market pricing, the working-capital wall, competitor benchmarks. |
| **`05-first-container-gate.md`** | The pre-wire checklist. Gates 2 and 3 for scaling. |
| **`06-the-stronger-play.md`** | The strategic reframe and the three tests that would disprove it. |
| **`model/`** | A landed-cost and working-capital calculator. Run any supplier quote through the real duty stack instead of estimating by hand. |

```bash
cd model
python3 container_model.py --list
python3 container_model.py --scenario base_case
python3 test_container_model.py          # 15 tests
```

---

## On Buzick

Ben named a Bardstown company as the model — the voice transcript rendered it
"buoyancy." It's **Buzick**, and their filings are worth knowing:

**Cliff Buzick, Inc.** dba Buzick Lumber & Home Center (chartered **1946**) and
**Buzick Construction, Inc.** (1995) are **sibling corporations** — different
offices, different registered agents, different branches of the family. There is
no Buzick holding company. Ben's proposed Enterprises holdco is arguably
*cleaner* than the thing he's copying. They also used a separate real-estate
entity (1987), which confirms the asset-holding recommendation in `01`.

Founded 1937. 39 warehouses for Jack Daniel's. 255+ rack-supported warehouses.
Four generations.

**Their moat is eighty years of Nelson County distillery relationships — not
sourcing.** That's the part to copy.

---

## What's still open

This is research, not legal, tax, or customs advice. Items marked
**[SIGN-OFF]** throughout need a licensed professional. The four that gate real
money:

1. **Customs broker** — classification and AD/CVD scope, in writing, before any PO.
2. **KY CPA** — whether the cut shop is "manufacturing" or a "service" under the
   LLET, and sales-tax treatment before the first invoice. Both are five-figure
   annual questions.
3. **KY construction attorney** — the related-party disclosure protocol, before
   Supply's first sale to Contracting.
4. **Insurance broker** — products liability for an importer, cut shop
   disclosed, before material ships.

Two weeks and a few thousand dollars in professional fees. Then go.
