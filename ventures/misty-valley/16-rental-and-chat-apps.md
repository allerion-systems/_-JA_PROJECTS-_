# Rental Commerce & Chat-Surface Apps — Two Briefs

**Prepared:** 5 September 2026
**For:** Misty Valley Supply — construction safety distribution, Bonnieville, KY
**Standing on:** `research/AGENTIC-COMMERCE.md` §6 (the verdict is settled: agent checkout is dead for now; the open lane is quoting and design-assist inside chat surfaces, with checkout staying human on the store) and `15-ten-year-thesis.md` §5.2(f) (rental is an A− stream, 8% of the 2036 mix, verified-in-kind but unsized). This document does not re-argue either; it prices the rental slate and specs the chat app.

**Sourcing rules.** Same as the rest of the folder: claims carry a source and a date; verified is separated from reported; anything found only in vendor copy is flagged. Everything marked **[fetched 5 Sep 2026]** was pulled directly today, including live JSON price data from the benchmark rental site.

---

# BRIEF 1 — RENTAL

## 1. The benchmark: who artsrental.com actually is

**Verified.** `artsrental.com` is **Art's Rental Equipment, Inc.** — a family-owned equipment rental and sales company founded **1967**, corporate headquarters at 215 E 6th St, Newport, KY, with **15 stores across Kentucky (9, including two in Louisville and one in Lexington), Ohio (5) and Indiana (1)** [artsrental.com/pages/about-us, fetched 5 Sep 2026; store list confirmed on the live site]. The "Kentucky/Ohio family equipment-rental company" belief checks out exactly — and their Louisville and Lexington branches make them a literal neighbor on Misty Valley's corridor.

Two findings from crawling their live catalog that matter more than their biography:

1. **They run on Shopify.** Their entire rental catalog — 1,019 products — is served as standard Shopify product JSON, with rental durations modeled as *product variants* named `Day`, `Week`, `4-Weeks` [artsrental.com/products.json, fetched 5 Sep 2026]. The product page CTA is **"Add to Quote" / "Reserve"** — not a paid checkout. A 59-year-old family rental company solved rental e-commerce with a quote cart on a stock commerce platform. That is the fidelity bar for Misty Valley's rental UI: publish the three rates, take a reservation request, settle offline.
2. **They are accidentally "agent-ready."** Their sitemap carries a `sitemap_agentic_discovery.xml` pointing to `artsrental.com/agents.md`, which documents Shopify's platform-level **UCP endpoints** (`/.well-known/ucp`, an MCP endpoint at `/api/ucp/mcp`, UCP versions through `2026-08-25`) and pushes agents toward the Shop skill — with the same invariant this folder already adopted: *"Checkout requires human approval."* [artsrental.com/agents.md, fetched 5 Sep 2026]. This is Shopify boilerplate, not an Art's investment — but it independently corroborates `AGENTIC-COMMERCE.md`'s two core reads: UCP is consumer-plumbing that merchants inherit rather than build, and every live implementation keeps a human on the payment.

**National controls:** `sunbeltrentals.com` and `unitedrentals.com` both returned **HTTP 403 to direct fetches** (bot protection) [attempted 5 Sep 2026 — equipment index, marketplace fall-protection category, and legal pages all blocked]. Their patterns below are therefore built from their own legal PDFs that did fetch, their indexed help content, and search-confirmed secondary sources — each flagged.

## 2. The rental-commerce pattern book

### 2.1 Rate display — the day/week/4-week convention, confirmed

**Confirmed with primary data.** The trade convention is three tiers: **1 day / 1 week / 4 weeks** (the "rental month" is 28 days, not calendar). Art's states it explicitly — "1 Day Rental = 24 hours … 8 hours of running time; 1 Week Rental = 7 days … 40 hours; 4 Week Rental = 28 days … 160 hours" — and encodes it as the three price variants on every rentable SKU [fetched 5 Sep 2026]. Sunbelt and United present day/week/month ("4-week") tiers gated behind a **zip code / delivery location**, because rates are branch-priced [Sunbelt FAQ; search-confirmed, not directly fetched]. The running-time caps (8 hrs/day metered) apply to powered equipment and are irrelevant to guardrail.

**Real multipliers, from Art's live prices** (this is what an operating rental house actually charges, vs. the textbook):

| Item | Day | Week | 4-Week | Week÷Day | 4-Wk÷Week |
|---|---:|---:|---:|---:|---:|
| Scissor lift 19' electric | $123 | $308 | $554 | 2.5× | 1.8× |
| Steel trench box 8'×20' | $416 | $832 | $2,080 | 2.0× | 2.5× |
| Aluminum trench box 6'×8' | $192 | $384 | $960 | 2.0× | 2.5× |
| **Safety harness w/ lanyard** | **$27** | **$54** | **$81** | 2.0× | 1.5× |
| Scaffold safety rail (per rail) | $2 | $2 | $6 | 1.0× | 3.0× |

The textbook heuristic is week = 3× day, 4-week = 3× week; real operators discount deeper for duration (week ≈ 2–2.5× day, 4-week ≈ 1.5–2.5× week), and tiny per-piece items get token daily rates because handling cost dominates.

### 2.2 The rule-of-thumb, verified — and the brief's "weekly ≈ 10% of value" corrected

The trade's actual pricing conventions (multiple industry sources, consistent):

- **Daily rate ≈ 1–2% of the equipment's value**; weekly ≈ 3× daily; 4-week ≈ 3× weekly [Quipli rental pricing guide; ARM Software rate guide; LendControl 2026 pricing article — vendor/educator sources, mutually consistent].
- The governing KPI is **dollar utilization** = annual rental revenue ÷ original equipment cost. Targets: **~55–65% for national chains, ~100% for small general rental stores, up to 150% for small-ticket/party inventory** [For Construction Pros, "Utilization 101"; InTempo]. Time-utilization sweet spot 60–75%.

So the heavy-equipment convention is **weekly ≈ 3–6% of value**, not 10%. **But** the 10%-weekly instinct is roughly right *for small safety gear specifically*, because minimum handling, inspection and transaction cost swamps capital cost at low ticket sizes — and the comps prove it: Art's rents a ~$120–180 harness/lanyard at **$54/week (≈30–45% of value)**; TNH rents an 8-ft guardrail section with base (≈$300–400 at retail) at **$40/week (≈10–13% of value)**. Small-ticket rental prices off the *service*, not the asset. That is exactly why the dollar-utilization target for small rental inventory runs 100%+: **a guardrail section should pay for itself in roughly 8–12 rental-weeks.**

### 2.3 Reservation vs. instant book

- **Art's (regional/family):** quote-cart model. "Reserve / Add to Quote" — no online payment; the branch confirms. [fetched 5 Sep 2026]
- **Sunbelt / United (national):** true online reservation with card charged at checkout and a digital signature on the rental contract; guest checkout exists; account customers get contract pricing on login. [Sunbelt FAQ, search-confirmed]
- **Specialists (Malta Dynamics, Diversified/fallprotect.com):** pure request-for-quote. Malta states the flow plainly: *"Request a quote, we'll confirm availability and credit, and ship your equipment straight to the jobsite. Billing starts when your unit arrives and stops the day it's returned."* [maltadynamics.com/pages/mobile-fall-protection-rental, fetched 5 Sep 2026]

**Pattern:** instant-book is a national-scale feature backed by branch telemetry and a fraud/credit stack. Everyone at or below regional scale — including the fall-protection specialists — runs request → confirm. That is the market's own answer to which flow Misty Valley builds.

### 2.4 The rest of the pattern book

| Pattern | What the trade does | Source & status |
|---|---|---|
| **Delivery/pickup** | Separate line item, priced by distance/branch; Art's advertises jobsite delivery + pickup and 24-hr emergency service; billing conventions start on arrival, stop at return (Malta), and KWIPPED's marketplace explicitly excludes transit days | Art's [fetched]; Malta [fetched]; KWIPPED [fetched] |
| **Damage waiver** | **~15% of gross rental charges** is the national convention. Sunbelt's Rental Protection Plan: 15% of gross rental, waiving liability down to 10% of FMV/repair, $500/piece cap [Sunbelt RPP T&C, search-confirmed; legal page 403'd]. United's RPP brochure example prices RPP at $60 on a $400 rental = **15%**, customer pays lesser of 10% of damage or $500 [United RPP PDF, fetched 5 Sep 2026] | Verified (United primary PDF); corroborated (Sunbelt) |
| **Insurance / COI** | Waiver is optional *only* against proof of insurance: United requires either RPP or a **certificate of property insurance** (not liability) naming them per their terms, faxed against the account [United RPP PDF, fetched] | Verified |
| **Deposits / ID** | Cash/guest customers: government photo ID + credit/debit card charged upfront; account customers: on terms against a credit application. Art's runs a customer login portal | Sunbelt FAQ [search-confirmed]; Art's [fetched] |
| **Availability by branch** | Nationals gate rates and availability behind zip entry, warn availability varies by branch, and still tell you to call; Art's shows no availability at all — the quote round-trip *is* the availability check | Sunbelt [search-confirmed]; Art's [fetched] |

Patterns only — nothing above copies copy or design assets.

## 3. The safety-specific rental market

### 3.1 Who rents fall protection

- **Generalist nationals:** United Rentals rents fall protection through its trench-safety vertical (category page exists; 403'd today, previously catalogued in `15-ten-year-thesis.md` sources). **EquipmentShare** lists safety-harness rental as an equipment class. Art's rents a harness+lanyard at $27/$54/$81 [fetched 5 Sep 2026].
- **Manufacturer programs:** **Malta Dynamics** runs a full rental program — XSERIES mobile grabbers, davits, roof carts, **guardrail and warning-line kits**, SRLs 20–100 ft, tripods/winches/confined-space rescue, horizontal lifelines — quote-based, shipped to jobsite [fetched 5 Sep 2026].
- **Safety houses / integrators:** **Diversified Fall Protection** (fallprotect.com) rents non-penetrating guardrail in 6'/8'/10' sections, yellow powder-coat — but only *within 100 miles of Valencia, CA*, quote-only [fetched 5 Sep 2026]. **Premier Safety** (meslifesafety.com) rents fall-protection and gas-detection gear. Regional players: FallProof, M Squared Safety, Title 8 Builders (CA).
- **Marketplace:** **KWIPPED** brokers guardrail rental (multi-supplier RFQ model).

The structural read: guardrail rental is served by either national generalists with thin safety expertise or distant specialists who ship freight. **Nobody on the Louisville–Nashville corridor combines local delivery, safety-house competence, and published rental rates.** Art's — the strongest local rental operator — rents scaffold rails and trench boxes but has **no non-penetrating roof guardrail, no warning line, no SRLs, no anchors** in its 1,019-product catalog [full catalog crawl, 5 Sep 2026]. The gap `15-ten-year-thesis.md` §5.2(f) flagged as "verified-in-kind, unsized" is, on this corridor, verified-empty.

### 3.2 Real price benchmarks — guardrail

| Source | Offer | Normalized | Status |
|---|---|---|---|
| TNH Development | **$40.00 per 8' section per week**, 58-lb rubber-footed base included; pro install from $2,000 | **$5.00/LF-week** | Fetched 5 Sep 2026 |
| KWIPPED listing (SafetyRail 2000, 10' sections) | **$150/month per section; "$12.00 a LF per Month"** | **$3.00/LF-week** equivalent | Fetched 5 Sep 2026 |
| Diversified Fall Protection | Rents 6'/8'/10' non-penetrating sections — no published price | quote-only | Fetched 5 Sep 2026 |
| Malta Dynamics | Guardrail + warning-line kits in rental program — no published price | quote-only | Fetched 5 Sep 2026 |

**Working benchmark: $3–5 per linear foot per week, base included; roughly $30–50 per 10' section-week.** Only two houses in the country publish a number; everyone else hides it behind a quote form — which means a published, honest rate sheet is itself a differentiator.

### 3.3 The liability and inspection reality

This is why the category is under-served, and it must be priced in, not discovered later.

**The inspection regime (verified against the standards the catalog already cites):**
- **OSHA 29 CFR 1926.502(d)(21):** personal fall arrest systems must be **inspected prior to each use** for wear, damage and deterioration; defective components removed from service.
- **OSHA 1926.502(d)(19):** any PFAS component **subjected to impact loading must be immediately removed from service** and not used again until a competent person determines it undamaged — for rental gear, in practice, retired, because the renter cannot prove a returned harness was *not* loaded.
- **ANSI/ASSP Z359 (the code the catalog is built to):** two-level inspection — user pre-use every shift, plus a **formal documented inspection by a competent person at least annually**; Z359.14-2021 governs SRLs, with manufacturer-directed service intervals and, for many devices, factory-authorized service on a multi-year clock [PK Safety, FallTech, Safetystage summaries of Z359.14-2021; the standard itself is paywalled]. Manufacturers' instructions control: 3M requires annual competent-person inspection with records [For Construction Pros Q&A on fall protection for rental companies — 403'd on fetch; summary via search index, **reported not verified**].

**Why some houses refuse to rent harnesses (reported, consistent across sources):** the renter inherits (a) an inspection-and-records duty per asset per turn, (b) the impossibility of verifying whether a returned unit took a fall arrest, (c) hygiene/soft-goods degradation, and (d) shared-liability exposure if a lift or roof accident involves their harness and their file is thin — rental-industry guidance explicitly frames "refuse rental or require documentation first" as the policy choice [certifymeonline.net aerial-lift rental guidance; For Construction Pros]. Notably, Diversified advertises that it *assumes system-compliance liability contingent on annual inspections* — the specialist's answer is to sell the paperwork with the steel.

**The verdict for Misty Valley:** *steel rents easily; textiles rent last.* Guardrail, warning line, skylight screens and hole covers are visual-inspection hardware with no impact-load ambiguity — rent them from day one. Anchors (Z359.18) are phase two: inspectable metal, but each turn needs a documented check. **Harnesses and SRLs rent only after the per-asset inspection ledger from `15-ten-year-thesis.md` §6.3 is live and the insurance is priced** — and even then, the honest posture on soft goods may be Art's-style rental of *new-ish, short-life* units at rates (≈$54/wk) that amortize the unit in 2–3 rentals, or no harness rental at all and a "buy the harness, rent the rail" bundle. The compliance-records system is not adjacent to the rental business; **it is the rental business's load-bearing wall.**

## 4. The Misty Valley rental slate

From the actual catalog (`/home/user/mvs-store/src/data.ts` — placeholder sell prices, real standards):

### 4.1 Phase 1 — launch slate (steel only)

| SKU | Item | Sell | **Day** | **Week** | **4-Week** | Wk as % of value |
|---|---|---:|---:|---:|---:|---:|
| MVS-RG-1000 + MVS-RG-BASE | Non-penetrating guardrail, 10' section **with** 90-lb base (rented as a set) | $437/set | **$16** | **$40** | **$100** | 9% |
| MVS-YG-10 + MVS-YG-POST | Yellow steel rail 10' + bolt-down post | $268 | $10 | $26 | $65 | 10% |
| MVS-WL-600 | Warning line system, 600' kit | $1,240 | $45 | $110 | $275 | 9% |
| MVS-SKY-48 | Skylight screen 4×8 (shop-fabricated) | $412 | $15 | $40 | $100 | 10% |
| MVS-HOLE-4 | Floor hole cover 4×4, marked | $128 | $6 | $15 | $38 | 12% |

Multipliers: week ≈ 2.5× day, 4-week ≈ 2.5× week — inside the observed trade band (§2.1), gentler than textbook 3×/3×. The guardrail set lands at **$4.00/LF-week**, mid-range of the $3–5 benchmark (§3.2): under TNH, over KWIPPED, and *published*, which neither specialist is. At $40/week a $437 set hits 100% dollar utilization at ~11 rented weeks/year — the small-general-rental target (§2.2), realistic for gear that goes out for 4–12-week reroof durations.

**Job-lot sanity check:** a typical 200-LF reroof edge = 20 sections + 21 bases ≈ **$800/week or $2,000/4-week** rental against ≈$8,900 to buy — the rent-vs-buy crossover sits near 4–5 months, which is exactly why contractors rent for a job and buy only for a yard. (The Yard listing L-2271 in the store's own seed data — a roofer dumping 32 sections + 40 bases for $4,600 "cheaper than renting for a season" — is the used-market backstop that also disciplines these rates.)

### 4.2 Phase 2 — after the inspection ledger is live (§6.3 of the thesis)

| SKU | Item | Sell | Day | Week | 4-Week | Gate |
|---|---|---:|---:|---:|---:|---|
| MVS-ANC-DL | Standing-seam roof anchor (Z359.18 Type A) | $386 | $18 | $45 | $110 | Per-turn documented competent-person check |
| MVS-SRL-11 | SRL 11' Class 2 (Z359.14) | $268 | $15 | $35 | $80 | Ledger + manufacturer service schedule + insurance priced |
| MVS-FH-5PT | Harness, 5-pt (Z359.11) | $118 | $12 | $27 | $55 | Same, plus soft-goods retirement policy; Art's comp $27/$54/$81 says the price is takeable — the question is the file behind it |

### 4.3 Commercial terms

- **Damage waiver: 15% of gross rental charges** (the national convention, §2.4), waiving renter liability to 10% of repair/replacement capped at $500/piece; waivable against a **property-insurance COI** on file. Lost-base/lost-section schedule at replacement price.
- **Deposit:** account customers on existing terms, no deposit. Non-account: card authorization for replacement value on small lots (the same authorize-then-capture rail `11-money-movement.md` built for the Yard), or 50% prepay on large lots.
- **The flow: request → confirm → deliver on route.** Reserve button creates a rental request (SKU-set, LF, dates, jobsite); Misty Valley confirms availability + credit within the business day (the Malta model, §2.3); gear rides the truck that is already going down I-65 (`VENDING-ECONOMICS.md` §6.4's vehicle). Billing starts at delivery, stops at pickup, transit excluded — the KWIPPED convention, stated on the contract. **No online payment**, matching both the specialist trade and the folder's standing checkout rule.
- **Recurring billing is a standing order** — the 4-week rebill lands in the §6.2 standing-order infrastructure, not in a new system.

## 5. Modular buildings — the one-page sequencing call

The founder wants a "Modular Buildings" category on the nav. The repo has already ruled on the two hard versions of this ambition, and both verdicts hold:

- **`adjacent-plays/modular-and-the-7-brew-model.md` §5:** "any blueprint to modular" is the Katerra thesis and fails for the same three reasons — it optimizes the smaller half of the cost (site development is ≥ the building with 4× the variance), arbitrariness destroys the 40–50% savings that only repetition delivers, and the 255 sub-scale manufacturers at 74% utilization are not buyers. The smallest viable version is the **inverted** product: one fixed module → many sites, a site-fit/site-cost estimating tool, carrying no design liability.
- **`adjacent-plays/panelized-walls.md`:** the corridor is already covered (Tri-State Panels in Shepherdsville, between Louisville and Bonnieville, with trusses and install attached), and single-line break-even needs ~2/3 capacity utilization at a margin nobody publishes. Negative on making panels for third parties.

**So what may honestly sit under a "Modular Buildings" tab?** The test: a nav category is a promise of inventory, lead time and a price. Today Misty Valley can promise none of those for a building. What it *can* promise, in sequence:

1. **Now — rename the ambition.** The shop fabricates roof screens and hole covers. The honest nav today is **"Fabrication"** or **"Site Structures,"** anchored by the roof-screen configurator that already exists, plus quote-request intake for screen-adjacent enclosures (dumpster/equipment enclosures, mechanical screens on the same SC3-equal frame logic).
2. **Next — dropship-able prefab units.** Guard booths, smoking shelters, and equipment shelters are made by established fabricators (Panel Built, Porta-King, B.I.G.) and sell through dealers — the same dropship motion as the rest of the catalog, no certification regime, and a genuine first "building" SKU. *(Reported — dealer-program terms unverified; verify before promising.)* This is the first moment the word "Buildings" on the nav is not a lie.
3. **Later, and only on trigger — real modular.** Volumetric modular for occupancy triggers state industrialized-building certification in *every* destination state with no reciprocity (the 7-Brew file, §4) — five states means five seal regimes. The gate: **a signed dealer/setter agreement with a certified manufacturer, or the site-fit estimating product from the 7-Brew file shipping as a service** — whichever comes first. Absent one of those, a Modular Buildings category is an empty promise wearing a heading.

**Sequencing call: 1 now, 2 within two quarters if a dealer agreement lands, 3 stays parked behind its trigger.** Do not put the tab up before step 2 exists.

---

# BRIEF 2 — CHAT-SURFACE APPS

## 6. Apps in ChatGPT — the real status, September 2026

**Verified / corroborated timeline:**
- **6 Oct 2025 (DevDay):** OpenAI announced **Apps in ChatGPT and the Apps SDK** — MCP-based (an app is an MCP server plus an HTML/React component rendered inline in the conversation), launched with pilot partners: Booking.com, Canva, Coursera, Expedia, Figma, Spotify, Zillow [openai.com "Introducing apps in ChatGPT"].
- **17 Dec 2025:** third-party **submissions opened and the App Directory launched**; OpenAI reviews every submission against published guidelines before listing; review reportedly runs ~5–10 business days through the Developer Platform [VentureBeat; openai.com announcement — the OpenAI page itself 403'd on fetch, so the date is corroborated-secondary].
- **Mar 2026:** **Instant Checkout retired** (~6 months after launch, <30 merchants) — settled in `research/AGENTIC-COMMERCE.md`, confidence notes. OpenAI's pivot was *toward retailer/partner apps*, i.e., toward exactly this SDK.
- **Through mid-2026:** directory grows (Adobe, Replit, Slack, Notion, Stripe, MyFitnessPal, AllTrails live); "Sign in with ChatGPT" beta 29 Jul 2026; ASO-style analysis reports directory discovery is still primitive — **app-name matching carries most of the weight, long-tail keyword search inside the directory does not work reliably** [Phiture App Directory guide, 2026 — reported, single source].
- **Monetization, as of the live docs [developers.openai.com/apps-sdk/build/monetization, fetched 5 Sep 2026]:** three lanes — **(1) external checkout (recommended): the app links out to merchant-hosted checkout on the merchant's own domain**, merchant handles pricing/payment/fulfillment; (2) saved-payment display; (3) an **embedded payment sheet in limited private beta** for select marketplace partners, riding ACP with Stripe/PayPal/Adyen/Checkout.com/Fiserv/Worldpay. Approval currently limited to **physical-goods** commerce. No fee/revenue-share published.

**What an app may do:** render interactive UI components inline in the conversation, call its own MCP tools, take uploads the user provides in chat, authenticate a user (OAuth / Sign in with ChatGPT), and **link out to the merchant's own checkout** — which is precisely the shape the folder's checkout rule requires. What it may not do: sell digital goods/subscriptions in-chat, or take payment in-conversation outside the private-beta payment sheet.

**Honest read:** the directory is real, live, reviewed, and — unlike everything in the AP2/x402 aisle — has named consumer apps shipping. It is also young, name-weighted for discovery, and unmonetized for services. For Misty Valley it is a **free distribution surface with human checkout built into the rules**, not a revenue channel. That is a fit, not a compromise.

## 7. The other surfaces, one paragraph each

**Claude connectors directory — real, and the closest fit to what already exists.** Anthropic's Connectors Directory catalogs MCP servers across Claude.ai, Desktop, Mobile, Code and Cowork — verified plus community tiers, reported at **950+ connectors** in 2026 coverage; MCP itself moved to the Linux Foundation's Agentic AI Foundation, with the 2026-07-28 stateless-core spec revision landing in Claude [claude.com blog; claude.com/docs/connectors/directory — reported via search index]. Submission runs through Claude.ai org admin settings (**Team/Enterprise org required**), the portal reads the production server's tools and annotations, and published connectors get an observability dashboard. The kicker: **`mcp.allerion.io` already speaks the right protocol** — packaging it for this directory is a submission-and-review exercise, not a build. This is today's most concrete discovery path for the quoting tool, with the caveat that directory browsing skews to developers and knowledge workers, not roofing PMs.

**Perplexity — connector support exists; a merchant directory does not.** As of mid-2026 Perplexity supports local and remote MCPs, but MCP connectors are **macOS-app-only** (Windows/Linux cannot add servers), remote connectors are rolling out to paid subscribers, and there is no curated third-party app directory a distributor could be *found* in [Perplexity help center — reported]. Perplexity matters to Misty Valley as an answer-engine (schema.org substrate, `AGENTIC-COMMERCE.md` §7), not as an app surface. Not worth build effort in 2026.

**Gemini — commerce rails, not a quoting-app surface.** Google's 2026 push wires **UCP** across Search, Gemini and Maps — Universal Cart, Google Pay checkout at major retailers, richer Merchant Center attributes [blog.google shopping updates; developers.google.com/merchant/ucp — reported]. Users can add MCP servers to Gemini via Settings → Extensions (paid tier), but that is user-side plumbing with zero organic discovery. The Gemini lane for Misty Valley is the one already specified: clean product feed + schema markup so Gemini's shopping surfaces can *see* the store. Building a Gemini "extension" for quoting has no distribution mechanism today.

**Manus — vapor as a distribution surface.** Manus (post-blocked Meta acquisition, Apr 2026 — reported via CNBC/codersera) ships a desktop agent and <100 native integrations chosen by Manus itself; there is **no third-party developer marketplace, no submission path, no directory**. An agent that browses the open web can already use mistyvalleysupply.com like any human. Nothing to build; revisit only if a developer program appears.

**Where can a distributor's quoting tool actually be discovered today?** In order: (1) ChatGPT App Directory — consumer scale, reviewed, human-checkout-by-rule; (2) Claude Connectors Directory — smaller audience, but the server is already built and the submission is cheap; (3) nowhere else. Two surfaces are real; the rest are either plumbing without discovery or vapor.

## 8. "Design it with us" — the spec

**The user story:** a facilities manager or roofing PM in the middle of a ChatGPT/Claude conversation says "I need to screen four RTUs on a flat roof, about 60 feet, here are photos." The app asks the three questions the math needs, runs **the same quote engine as the store**, renders a budget card inline, and hands off to `mistyvalleysupply.com` with the quote attached — where a human closes it. Checkout never leaves the store; the constraint is the design.

### 8.1 What already exists (read from `/home/user/mvs-mcp/src/server.js`)

The MCP server (v0.2.0, stdio + http) already carries the entire quoting brain:
- **`quote_roofscreen(lf, heightFt, panel, mount, includeDrawings, markupPct)`** — full cost build-up anchored on the real Lee Street job (156 LF @ 3'6": $6,000 frame + ~$1,000 panel, sold $12,000; 71.4% realized markup as the default), frame rate `$14 + $7×height` per LF, mount adders, panel $/SF tiers, shop-drawings line, gauge warning on 29-ga, substitution notice, and "firm quote requires: roof plan, equipment schedule, wind load."
- `create_quote` (catalog lines, MOQ-honoring, 14-day validity), `check_compliance` (hazard → OSHA cite → SKUs with cautions), `search_products`, `get_product`, `get_screen_parts`, `get_offer_manifest`, and `place_order` hard-gated on `human_approved` + PO.

The app is therefore mostly *packaging*: a component layer and two new tools.

### 8.2 New MCP tools required

1. **`create_quote_request`** — the image-intake/handoff tool, and the only genuinely new capability:
   - Input: `{ contact: {name, email, phone?}, jobsite: {city, state}?, description, quote (the quote_roofscreen/create_quote output echoed back), photos: [file refs from the chat upload], preferred_contact, timeline }`.
   - Behavior: persists the request + photos to Misty Valley's store backend, returns `{ request_id, store_url: "https://mistyvalleysupply.com/quote/{id}", promise: "a person replies within one business day" }`. This is the structured-RFQ-intake from `AGENTIC-COMMERCE.md` §7 item 5 — *the highest-ROI agent-readiness investment on that list* — wearing a chat UI. Same intake, same monitored queue as `quotes@`.
   - It does **not** place orders. `place_order` stays out of the app's tool manifest entirely; the app cannot even ask.
2. **`estimate_from_photos` — explicitly deferred.** Auto-measuring LF/height from jobsite photos is a liability trap (the server's own disclaimer: firm numbers need the roof plan and wind load). Photos ride along as *context for the human estimator*, and the app asks the user for LF and height in plain words. Do not build vision-measurement in v1; say so in the app copy.
3. **Component resources (Apps SDK requirement):** an inline **budget card** (the `quote_roofscreen` cost stack: frame/mount/panel/drawings → cost, sell, GM hidden, the Lee Street proof line shown) and a **package card** for `create_quote` output (lines, lead times, OSHA cites — the differentiator no competitor's data can render). One "Send to Misty Valley" button → `create_quote_request` → store URL.

### 8.3 What data leaves the chat — the privacy note

Written into the app listing and the intake confirmation, because it will be asked:
- **To Misty Valley:** only what `create_quote_request` sends — contact info, jobsite city/state, description, the quote parameters, and any photos *the user explicitly attached to the request*. Stored in the store backend under the same retention as a phoned-in quote.
- **To OpenAI/Anthropic:** the entire conversation, including uploaded photos, is processed by the platform per its own terms — that is the surface's nature, not the app's choice; the app should say so plainly ("your conversation lives with ChatGPT/Claude; only what you submit on the request card reaches us").
- **Never collected in-chat:** payment details, card numbers, signed POs. There is nothing to leak from a checkout that does not exist.
- Jobsite photos can reveal location and security posture (roof access, camera positions) — the intake confirmation should note photos are shared only with the estimating desk.

### 8.4 Honest effort estimate

| Piece | Effort | Note |
|---|---|---|
| HTTP/SSE transport hardening + auth on the existing server | 2–4 days | `http.js` exists; needs prod TLS, rate limits, origin checks |
| `create_quote_request` + photo storage + store-side queue page | 3–5 days | Rides the store's existing backend and RBAC |
| Apps SDK component layer (budget card, package card) | 5–8 days | New skill: the SDK's component/iframe model, theming, mobile |
| Directory submission, review round-trips, listing copy | 1–3 days spread over 2–4 weeks calendar | 5–10 business-day review, expect one rejection cycle |
| Claude Connectors submission (same server, no components) | 1–2 days | Requires a Team/Enterprise Claude org |
| **Total** | **~3 person-weeks build; ~6 weeks calendar to both listings** | |

Ongoing: near-zero hosting cost, but the intake queue must be *humanly monitored* — an unanswered "design it with us" request is worse than no app. And per §6, expect discovery to be weak: the app earns its keep as (a) the packaged form of the RFQ intake the folder already mandated, (b) a live Allerion demo asset (`AGENTIC-COMMERCE.md` §6's "more valuable as an Allerion asset" point applies with full force), and only (c) a speculative lead channel.

---

## 9. Build order and verdicts

1. **Rental Phase 1 (steel slate, §4.1) — first.** Real revenue, verified-empty local market, published $4/LF-week rate as the wedge, request→confirm→deliver-on-route flow that reuses the truck, the quote cart, and the standing-order rails already planned. Prerequisite spend: rental fleet capital plus the insurance/waiver setup (15% waiver, COI handling).
2. **`create_quote_request` intake — second, and it double-counts.** It is simultaneously the RFQ substrate `AGENTIC-COMMERCE.md` §7 already ordered and the only new tool the chat app needs. Build it once on the store; the chat app becomes thin.
3. **Claude Connectors submission — third** (days of work; the server exists; needs the org tier).
4. **ChatGPT app — fourth**, ~3 person-weeks, expectations set at "packaged RFQ intake + Allerion demo," not a sales channel.
5. **Rental Phase 2 (anchors, then SRLs/harnesses) — gated** on the §6.3 inspection ledger and priced insurance. Textiles rent last.
6. **"Modular Buildings" nav — parked** behind its §5 triggers; ship "Fabrication / Site Structures" now, guard-booth dropship next if a dealer agreement lands.

**What would change these calls:** a competitor publishing corridor guardrail-rental rates (accelerate #1); OpenAI opening services monetization or search-grade directory discovery (promote #4); a real customer asking to rent a harness on an account with standing inspection records (accelerate #5 — the same "a real customer asks" trigger that governs everything agentic in this folder).

---

## Sources

**Fetched directly, 5 Sep 2026:** artsrental.com (home, about-us, products.json ×1,019 products, product page, sitemap, agents.md); maltadynamics.com/pages/mobile-fall-protection-rental; fallprotect.com/services/guardrail-rental; tnhdev.com/products/guardrail-system-weekly-rental; kwipped.com SafetyRail 2000 listing; unitedrentals.com UR3696 RPP brochure PDF; developers.openai.com/apps-sdk/build/monetization.

**Blocked on fetch (403), corroborated via search index:** sunbeltrentals.com (equipment index, RPP terms, FAQ); unitedrentals.com (marketplace, legal pages); openai.com announcement pages; forconstructionpros.com 3M fall-protection rental Q&A.

**Search-corroborated secondary:** VentureBeat (App Directory launch, 17 Dec 2025); Phiture App Directory ASO guide (2026); For Construction Pros "Utilization 101"; Quipli / ARM Software / LendControl rental-pricing guides; PK Safety / FallTech / Safetystage on ANSI Z359.14-2021; certifymeonline.net rental-liability guidance; claude.com blog + docs (connectors directory, MCP 2026-07-28); Perplexity Help Center (MCP connectors); blog.google + developers.google.com/merchant/ucp; CNBC / codersera on Manus (Mar–Apr 2026).

**Repo files relied on:** `research/AGENTIC-COMMERCE.md` §§1, 6–7 + confidence notes; `15-ten-year-thesis.md` §§5.2(f), 5.3, 6.2–6.3; `adjacent-plays/modular-and-the-7-brew-model.md` §§5–7; `adjacent-plays/panelized-walls.md` §§1–2; `/home/user/mvs-store/src/data.ts`; `/home/user/mvs-mcp/src/server.js`.
