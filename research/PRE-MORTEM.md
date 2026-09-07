# Misty Valley Supply — Pre-Mortem

*The exercise: it is September 2031 and Misty Valley Supply is dead. This document is the
autopsy written in advance — every plausible cause of death, ranked by likelihood ×
severity, each with a specific counter and a measurable tripwire. Evidence base:
[PRE-MORTEM-RESEARCH.md](./PRE-MORTEM-RESEARCH.md) (45 cited sources).*

**The honesty clause.** Nobody can make a century of survival certain, and any advisor who
promises it is selling something. The base rate is brutal: ~48.6% of new establishments
die within five years (BLS). What a pre-mortem buys is different — knowing the kill shots
before they land, and having a written, owned, measurable counter for each. Companies
that last a century aren't the ones that never faced these risks; they're the ones that
saw them first.

---

## The kill shots

### 1. Nobody needed us / the giants ate us
**Cause of death:** CB Insights' #1 startup killer — no market need (42% of failures).
Tuff Shed sells through ~1,958 Home Depot stores with its own online configurator,
financing, and installer network. A 3D design tool alone is not a moat.
**Counter:** Validate before scaling. The wedge is what the giants structurally can't do:
line-item BoM transparency (they hide takeoffs; we print them), a signed local premium
builder (Elijah's class of work, not catalog units), agent-transparent MCP pricing for
the agentic-commerce channel, and Hart County / I-65 proximity for jobsite delivery.
Sell consumables and components (recurring) alongside buildings (episodic).
**Tripwire:** Fewer than 25 design-tool sessions reaching a quote request in the first
90 days live, or zero premium-portable deposits in the first 2 quarters → stop building
features, start talking to buyers.

### 2. The partnership imploded
**Cause of death:** Wasserman: 65% of high-potential startup failures are co-founder
conflict. Our configuration is the textbook worst case: an unsigned sole builder with his
own competing Marketplace channel, brothers resolving disputes socially instead of
contractually, a founder employed elsewhere until October, and a member who cannot pass
bank/Stripe KYC (beneficial-ownership rules require SSN/ITIN for every ≥25% owner — an
EIN does not substitute).
**Counter:** Paper before revenue. (a) Operating agreement with vesting and deadlock
provisions — drafts in `ventures/misty-valley/contracts/`, Kentucky attorney review
required before use. (b) Elijah signs a builder agreement (scope, pricing, exclusivity
terms he actually accepts) before his name or capacity is marketed. (c) Ben files
Form W-7 for an ITIN now — it takes months; until it resolves, his economics live in a
written side agreement, never a handshake and never nominee ownership. (d) Joey's exit
from his employer stays clean: disclosure in writing, no confidential information, no
employer time or equipment.
**Tripwire:** Any founder question answered "we'll figure it out later," any revenue
event before the operating agreement is signed, or October arriving with Elijah unsigned.

### 3. We ran out of cash in the preorder gap
**Cause of death:** CB Insights #2 (29%). Preorder revenue arrives months before
delivery; suppliers and freight are paid up front; construction demand dies every
winter; the launch window is winter.
**Counter:** Authorize-then-capture is already the built rule — capture only at order
confirmation, and issue no supplier PO until the buyer's captured funds have cleared for
that specific order. Hold a cash floor of 6 months' fixed costs; treat preorder float as
the customers' money, not working capital. Weight the winter catalog toward safety gear,
components, and interior work.
**Tripwire:** Runway under 90 days, or any month where supplier POs exceed cleared
customer cash for the orders behind them.

### 4. Stripe froze the account mid-preorder
**Cause of death:** Documented processor behavior: rolling reserves, 90–180-day holds,
freezes on sudden volume spikes, MATCH-listing after chargeback terminations. Dropship
chargebacks average ~1.5%; Stripe reviews near 0.5–0.7%. A $30k building charge on a
fresh account is a manual-review flag.
**Counter:** Ramp volume gradually and pre-brief Stripe on big-ticket categories
(deposit-based invoicing for buildings, not single $30k card charges). Comply hard with
the FTC Mail/Internet Order Rule (16 CFR 435): stated ship windows we can meet, delay
notices, automatic refunds past 30 days without consent. Keep a 10% reserve against the
preorder book untouched. Establish a second processor relationship before we need it.
**Tripwire:** Chargeback rate above 0.5%, any Stripe review email, or any single charge
over $10k without an invoice/deposit structure.

### 5. A tariff swing killed the import program
**Cause of death:** Section 232 doubled to 50% in June 2025 and added 407 derivative HTS
codes that August; the China stack swung 245%→130% in one action; de minimis is
suspended. Duty math goes stale between PO and port.
**Counter:** The import rules already codified in `IMPORT-PROGRAM.md` hold: reprice
landed cost at every container booking, never on cached duty math; preorder terms carry
a tariff-adjustment/full-refund clause; no undervaluation, no misclassification, no
transshipment, ever — walk from any DDP double-invoice offer. Domestic fallback is
structural: Elijah's builds and the US steel-framing program mean imports are a margin
opportunity, never a dependency.
**Tripwire:** Any HTS change notice touching our codes → freeze new import preorders
until repriced. Import revenue exceeding 25% of total → rebalance.

### 6. One defective harness ended the company
**Cause of death:** Kentucky's middleman statute (KRS 411.340) shields a retailer only if
the manufacturer is identified AND subject to the court's jurisdiction. For blind-shipped
Chinese-factory PPE, it isn't — Misty Valley stands in the manufacturer's shoes. One
fall-arrest failure is a company-ending claim.
**Counter:** Life-safety PPE (fall protection, hard hats, eye/face) comes only from
manufacturers with a US entity or registered agent, verifiable ANSI/ASTM certs on file,
and their own product-liability coverage naming us additionally insured. We carry our own
product-liability policy before the first PPE sale. Blind-ship hides branding from the
customer, never from our records — full manufacturer traceability per SKU. No safety
claims we can't source ("OSHA certified" does not exist and never appears in our copy).
**Tripwire:** Any life-safety SKU in the catalog without a US-jurisdiction manufacturer
file and cert. That SKU doesn't go live.

### 7. Kentucky regulators shut down the building line
**Cause of death:** 815 KAR 25:060 requires a per-location license plus
$200k/$300k/$100k GL insurance to sell manufactured homes; KRS 227.580 bars selling
without a certificate of acceptability; off-site-fabricated dwellings fall under
815 KAR 7:130. Units marketed as habitable sit directly on these lines.
**Counter:** The honest-label doctrine is the legal moat, not just ethics: every unit
ships as "a structure, not a certified dwelling — habitable use is the county permit
path." No listing says "live in," "dwelling-ready," or "Airbnb-ready" without that
disclosure. Before any certified-dwelling ambition (KY IBS insignia units), the attorney
prices the license + insurance stack and we decide with numbers.
**Tripwire:** Any listing copy implying habitability without the permit-path line — pull
the listing same day. Any regulator contact → attorney first, response second.

### 8. Freight damage bled us dry
**Cause of death:** LTL damage/loss runs 1.24–1.94% of shipments (2–5% multi-handled),
claim denial rates run 50–60%, and the consumer chargeback lands anyway. Amazon
container-house buyers report damage on arrival roughly half the time.
**Counter:** Photograph every unit at load; full-value freight insurance on every
building shipment (priced into landed cost inside the 60% markup floor); a jobsite
acceptance protocol — buyer inspects and photographs before the driver leaves; a written
claims playbook with filing deadlines per carrier.
**Tripwire:** Damage rate above 2% of shipments or any denied claim above $2,500 →
change carrier/packaging before the next booking.

### 9. We bet on demand that was already peaking
**Cause of death:** 54.2% of shed makers reported 2024 sales below 2023; STR supply
growth is outpacing demand with occupancy falling and city-level listing caps spreading;
big-ticket sheds/ADUs are interest-rate-sensitive. Rural Hart County ADU demand is thin.
**Counter:** Portfolio discipline. Recurring low-ticket revenue (safety gear, steel
components, dock hardware) is the base load; buildings are the upside, never the plan of
record. STR units are one category among many, not the identity. The government/
commercial demand lane (GOVCON research: Ft. Campbell portable-building solicitations,
PSC 8145) hedges the consumer cycle.
**Tripwire:** Two consecutive quarters where any building category misses its conversion
target → reallocate its homepage and ad weight to what's converting. No new Wave-3 tool
gets built while an existing category is failing its target.

### 10. The bus factor was 1 — twice — and the company didn't own its platform
**Cause of death:** Joey is the only technologist and the platform lives in Allerion
Technologies LLC, a different company — Misty Valley may not legally own its own
website. Elijah is the only premium builder and unsigned. CB Insights #3: not the right
team (23%).
**Counter:** A written Allerion↔MVS license or IP assignment (attorney-drafted) before
revenue flows across it. The codebase stays documented for a second developer
(HANDOFF.md exists and stays current). Elijah signs (kill shot #2), and a second builder
relationship gets scouted within the first year — Hart County has more than one barn
crew.
**Tripwire:** Revenue flowing before the IP agreement is signed; any 30-day period where
only one person could deploy the site or build a premium unit.

---

## The century clause

What actually distinguishes 100-year companies, applied here:

1. **Own the relationship, not the channel.** Marketplace, Stripe, even the domain
   registrar are rented ground. The customer list, the design files buyers save, and the
   builder network are ours — export-able, portable, backed up.
2. **Own the IP.** Kill shot #10 is the quiet one. Fix it on paper this year.
3. **No fatal leverage.** The preorder float is never working capital; no debt secured by
   the whole company for one category's inventory.
4. **Succession is a feature.** Every critical function (tech, building, estimating,
   supplier relationships) needs a documented second within 3 years — that's what makes
   a company outlive its founders.
5. **The honest-label doctrine compounds.** Every competitor cutting corners on
   habitability claims, duty math, or fake reviews is borrowing from a future regulator
   or jury. Playing it straight is slower and it is the only strategy that has a
   century in it.

**Review cadence:** re-run this pre-mortem every 6 months. A tripwire that fires isn't a
failure — it's the document working.

---

*Prepared for internal review. Legal items (operating agreement, builder agreement,
Allerion IP assignment, KY dealer licensing, product-liability coverage) require a
Kentucky-licensed attorney before any reliance. Sources for every factual claim:
[PRE-MORTEM-RESEARCH.md](./PRE-MORTEM-RESEARCH.md).*
