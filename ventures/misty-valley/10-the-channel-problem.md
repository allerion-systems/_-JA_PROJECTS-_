# The Channel Problem

**This document corrects `09-the-allee-model.md`.** The research it was waiting
on came back, and it does not support the conclusion I drew. I am not going to
quietly amend the other file. Read this one first.

---

## 1. What I said, and what turned out to be true

`09` argued that the Allee direct-ship model solves Misty Valley's
working-capital problem and should be run alongside the cut shop. Two of the
three legs of that argument survive. The third — the one that mattered — does
not.

### ✅ Survives: the capital physics

The asset-light advantage is real and larger than I claimed.

| | Stocking distributor | Asset-light intermediary |
|---|---:|---:|
| Working capital ÷ revenue | **27.0%** (BlueLinx FY25) | **8.1%** (C.H. Robinson FY25) |
| Cash conversion cycle | **54.6 d** (BXC, computed) | **16.4 d** (Landstar, computed) |
| ROIC FY2025 | 3.64% BXC · 7.53% BLDR · 7.51% SITE | **21.14%** CHRW · **26.55%** LSTR |

Sources: [BXC](https://stockanalysis.com/stocks/bxc/financials/ratios/) ·
[LSTR](https://stockanalysis.com/stocks/lstr/financials/ratios/) ·
[CHRW](https://stockanalysis.com/stocks/chrw/financials/ratios/) ·
[BLDR](https://stockanalysis.com/stocks/bldr/financials/ratios/) ·
[SITE](https://stockanalysis.com/stocks/site/financials/ratios/)

But look at 2021: BlueLinx earned **40.03% ROIC** and Builders FirstSource
**34.14%** — both beating the asset-light firms. **Asset-heavy distribution is a
leveraged bet on commodity price direction wearing the costume of a service
business.** It prints in an up-market and dies in a flat one. Asset-light earns
a lower peak and a much higher trough. That is the honest framing, and it is
better than the one in `09`.

### ✅ Survives: the diverting point still legally exists

Union Pacific publishes a **lumber-specific** diversion rule, Item 6051-AC,
issued 12 Jan 2026, effective 1 Feb 2026: one free diversion per shipment then
$425/car; two free reconsignments then $160/car; orders must be processed prior
to arrival at **North Platte East, NE** (eastbound) or **Roseville, CA**
(southbound). [UP 6004 tariff book](http://c02.my.uprr.com/wtp/pricedocs/UP6004BOOK.pdf)

North Platte is the modern Kansas City. NS charges **$0** for a destination
change made through its web app ([NS 8002-A](https://www.norfolksouthern.com/content/dam/nscorp/pdf/tariff-pdfs/NS%208002-A%2011-1-23.pdf));
CSX charges $275/car ([CSXT 8100](https://www.csx.com/share/wwwcsx15/assets/File/Customers/CSXT__8100_Publication_Effective_10-1-2025.pdf)).
The through rate is still protected via the diversion station.

**One thing did change, and it is the real post-Staggers story.** Diversion used
to be an entitlement attached to a published common-carrier rate. It is now a
term the carrier grants. BNSF's ag price authorities void it explicitly:
*"Price does not apply on shipments accorded transit, inspection, sampling,
reconsignment, diversion, or stopping in transit…"*
([BNSF 4022 Item 45050](https://www.bnsf.com/ship-with-bnsf/agricultural-products/ag-price-documents/BNSF-4022-45050-M.pdf)).
The mechanism survives; the right to it does not.

### 🔴 Does not survive: it does not port to cold-formed steel

This is the finding that changes the plan.

**1. CFS is a franchised channel, not a commodity market.** Frametek Steel
states it plainly: *"We sell metal studs **exclusively** through authorized
dealers and distributors."* ([frameteksteel.com](https://www.frameteksteel.com/))
CEMCO routes all buyers through a distributor locator. SCAFCO, MarinoWARE and
Telling run the same architecture. Lumber mills sell to anyone with credit
because lumber is fungible and index-priced. **Steel framing manufacturers
protect distributor margin on purpose,** because the distributor is contracted
to carry the submittal, code and engineering support.

**2. There is no wholesale trading layer in CFS.** The channel is mill →
distributor → contractor, full stop. ~370+ distributor branches; no NAWLA
analogue; no one to learn the trade from.

**3. There is no physical substrate for the mechanic.** CFS moves by truck,
short-haul, direct. There is no railcar floating toward an undetermined buyer.
No mode other than rail sells in-transit destination optionality with rate
protection at all.

**4. You inherit specification liability.** Lumber is graded by a third party
and the trader passes the stamp through. CFS carries submittals, ICC-ES reports,
gauge/yield/coating verification and project engineering. **You cannot sell CFS
on someone else's reputation the way you can sell graded lumber** — which is the
same conclusion `03` and README finding 3 reached from the liability side.

**5. The market already ran this experiment in lumber and answered.** Every
surviving trader has added physical assets. Sherwood Lumber — founded 1954, the
closest living relative of the Allee firm — spent 2025–26 acquiring Middle
Atlantic Wholesale Lumber and opening a distribution facility in Danville, PA
([MDM](https://www.mdm.com/news/top-distributor-sectors/building-materials-construction/sherwood-lumber-acquires-middle-atlantic-wholesale-lumber/)).
Viking, Buckeye Pacific and Western Lumber all hold inventory. **Pure
title-passing arbitrage no longer covers its cost of capital.**

**6. The information edge is gone, and it is documented.** Random Lengths (now
Fastmarkets) is referenced directly in supply contracts as *"Random Lengths
price plus/minus"*, and CME lumber futures settle against the same benchmark
([Sherwood](https://sherwoodlumber.com/the-private-newsletter-that-quietly-sets-lumber-prices-for-all-of-north-america/)).
When price is an index, there is no price to know that others don't.

---

## 2. What this means for the plan

**The `direct_ship` scenario in `model/proforma_scenarios.json` assumes a mill
will ship direct to a job site for Misty Valley Supply. That assumption is not
supported.** ClarkDietrich confirms job-site direct shipment exists but notes it
is *"not available in all locations"* and is truckload-gated — and it is
available **to its distributors**, not to a trader.

So the $16.7M / $1.85M line in `09` should be read as *what the structure would
earn if the channel allowed it*, not as a forecast. It does not yet have a door.

### The door that does exist

**Become an authorized distributor, and run direct-ship inside the franchise.**

That is not a workaround; it is the actual business. An authorized distributor
can ship mill-direct to a job site, takes title, earns the spread, and carries
the submittal obligation the mill wants carried. It converts the Allee mechanic
from "beat the channel" to "be the channel." And Ben has the two things that
get a territory: **ten years of paid invoices and a captive installer that
proves demand.**

That reorders the plan:

| | Was | Now |
|---|---|---|
| Highest-priority action | Mill credit applications | **Authorized-distributor applications** — ClarkDietrich, Telling, MarinoWARE, SCAFCO, CEMCO. Ask what territory is open and what the annual commitment is. |
| Second | Confirm direct-to-site shipment | Same question, but asked as a prospective distributor, and get the **minimum order quantity** in writing — nobody publishes it |
| Import lane | The margin story | A **second sourcing option inside a franchised business**, which is what `06` said in the first place |

`06-the-stronger-play.md` was right and I underweighted it in `09`. The
defensible business is the value-added framing package. The channel research
just removed the one alternative I had proposed against it.

---

## 3. What is still worth stealing from the Allee model

Not the arbitrage. Three things:

1. **Credit transformation is the actual product.** The mill wants one
   creditworthy payer; the market is hundreds of fragmented subs. Absorbing that
   onto your own balance sheet is the largest single component of the spread —
   and it is why a principal earns more than an agent. It is also now
   purchasable: trade credit insurance (Allianz Trade, Chubb, AIG) both covers
   the loss and makes the receivable borrow better.
2. **Revenue per head is a structural choice.** Landstar does **$3.63M/employee**
   against BlueLinx's **$1.39M** — because nobody touches, counts, or reshelves
   the goods. The Allee shop did roughly three multi-car deals a week with four
   people. Every touch you design out is permanent operating leverage.
3. **The piece tally.** A written record of what was bought and how it loaded,
   worked against a customer list. That is still the asset — it is just a
   database now, and in a franchised channel it is *more* valuable, not less,
   because the mill cannot see it.

---

## 4. Sign-off

**[SIGN-OFF]** Before any further modelling of the direct-ship scenario, get one
answer in writing from one mill: *will you appoint Misty Valley Supply as an
authorized distributor, for what territory, at what annual commitment, and will
you ship direct to job site under that appointment?* Everything downstream turns
on it, and it costs a phone call.

---

*Research completed 5 Sept 2026. Full source list in the research log. Figures
labelled ESTIMATE or UNVERIFIED in the underlying research are not carried into
this document as fact.*
