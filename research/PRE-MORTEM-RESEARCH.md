# Misty Valley Supply — Pre-Mortem Research Notes

Ruthless documentation of every realistic failure path for a startup construction-supply
e-commerce company in Bonnieville, KY (Hart County). Compiled 2026-09-06. Every claim cites
a source in the Sources section (bracketed numbers).

---

## 1. Baseline failure rates (the odds before anything specific goes wrong)

- BLS establishment-survival data (through March 2025): ~22.1% of new establishments close
  within 1 year; ~48.6% fail within 5 years; ~65.3% within 10 years [S1][S2].
- CB Insights post-mortem analysis of failed startups: "no market need" 42%, "ran out of
  cash" 29%, "not the right team" 23%, "got outcompeted" 19%; later analyses frame root
  causes as poor product-market fit (~43%) and bad timing (~29%), with running out of cash
  usually the terminal symptom, not the cause [S3][S4].
- Retail generally sits below the all-industry survival average; e-commerce-specific failure
  is worse than brick-and-mortar averages in most compilations [S2].

**Applied to Misty Valley:** the company is pre-revenue, pre-domain, pre-hosting, Stripe in
sandbox. It has not yet demonstrated market need — the single biggest documented killer.
Every specific risk below compounds a base rate of ~50% five-year mortality.

## 2. Dropshipping-model failure modes

- Industry estimates: ~90% of dropshipping stores fail within the first months; commonly
  cited success rates of only 10–20% [S5][S6].
- Margin compression: typical gross margins 10–30% before ad spend; net margins after
  Meta/Google acquisition costs frequently go negative when CAC exceeds contribution
  margin [S6][S7].
- Chargebacks: dropshipping chargeback rates average ~1.5% — roughly double the general
  e-commerce average; Stripe reviews/freezes accounts when chargeback rates exceed roughly
  0.5–0.7% [S8]. Long supplier lead times + product-not-as-described = chargeback pile-ups.
- Specific to Misty Valley: blind-ship POs mean supplier stockouts, wrong-item shipments,
  and freight damage all land on Misty Valley's merchant account and reviews, with no
  inventory control. Oversized freight (steel framing bundles, dock levelers, sheds) is
  hardest to return; custom BOM-configured goods (the whole point of the Design Center)
  are usually non-returnable, guaranteeing disputes on remorse returns.
- Preorder model = accepting card payments weeks-to-months before delivery, which card
  networks and processors treat as elevated risk (delivery-window disputes; see §10).

## 3. Competitive kill shots

- **Home Depot + Tuff Shed:** Tuff Shed sells through all ~1,958 Home Depot stores in the
  lower 48, with in-store selling centers, an online configurator (design-your-own,
  ordered online), financing, and background-checked installer networks [S9][S10]. Home
  Depot also lists prefab sheds/studios online at national scale [S11]. Misty Valley's
  3D Design Center is not a moat — the incumbent already has a configurator plus 2,000
  physical showrooms and installed delivery.
- **Amazon/Wayfair:** expandable container houses and prefab cabins are already sold on
  Amazon with Prime-scale logistics and buyer-protection programs (verified by listing
  searches; see §9 demand notes). Price-shopping buyers will compare any Misty Valley
  container-house price against Amazon listings within one click.
- **Lowe's/Menards + local lumberyards:** commodity building materials (C645/C754 steel
  framing, safety gear) are contractor-account businesses with delivered pricing,
  will-call, and credit terms Misty Valley cannot match at launch.
- **Facebook Marketplace direct sellers:** Elijah himself proves the channel — Hart County
  builders already sell tiny homes direct on Marketplace with zero platform fees. The
  local premium-portable niche can be served without Misty Valley's storefront at all;
  the storefront must add value beyond what its own builder gets for free today.

## 4. Tariff / import risk (the container-house program)

- June 3, 2025: Section 232 steel/aluminum tariffs doubled from 25% to 50% by
  proclamation [S12].
- Aug 19, 2025: BIS added 407 HTSUS codes as steel/aluminum "derivative products," pulling
  broad downstream finished goods (Chapters 73, 82–87 content) into the 50% duty on metal
  content, effective Aug 18, 2025 [S13][S14]. Steel-framed expandable container houses are
  squarely derivative-steel exposure; the "~85% tariff stack" the plan assumes can move
  overnight by proclamation — in either direction (a sudden cut also strands anyone who
  pre-paid high-tariff inventory, while an increase kills the landed-cost model).
- De minimis is dead: EO 14324 (July 30, 2025) suspended duty-free de minimis for ALL
  countries effective Aug 29, 2025; indefinite suspension for non-postal modes confirmed
  June 2026 [S15][S16][S17]. Small parts/safety-gear imports now require formal customs
  processes and duties — no low-value workaround.
- The Section 232 "inclusions process" (Federal Register, Aug 2025) lets domestic
  producers petition to add MORE derivative codes on a rolling basis [S14] — tariff scope
  is a moving target three times a year. Customs misclassification of steel-content
  declarations carries penalty exposure for the importer of record (Misty Valley).
- China stack volatility is proven, not hypothetical: IEEPA fentanyl tariffs went 0% →
  20% (Feb–Mar 2025) → cut to 10% (Nov 10, 2025), reciprocal tariffs swung with 90-day
  suspensions, and combined rates on some products moved from 245% to 130% in a single
  action [S25][S26]. Any landed-cost model built on "~85% surviving stack" can be
  invalidated in either direction between placing a factory PO and the container clearing
  port — an increase destroys margin; a cut strands high-tariff inventory against
  suddenly cheaper competitors.

## 5. Legal / regulatory exposure (Kentucky + product liability)

- Kentucky licenses the sale of manufactured/mobile homes: "A person shall not engage in
  the business of selling manufactured homes or mobile homes within this state without
  holding a valid license issued by the department for each location," with required
  Form HBC MH-2, KY sales-tax certificate, and general-liability insurance minimums of
  $200k/$300k/$100k (815 KAR 25:060; enabling statutes in KRS ch. 227) [S18][S19].
  A portable building marketed as a dwelling/STR unit risks being treated as a
  manufactured home or as an uncertified dwelling; selling such units online without the
  license/insurance stack is an enforcement and rescission risk.
- Building-code liability: sheds sold "as dwellings" (barndominiums, STR units, backyard
  studios) implicate the Kentucky Building Code/Residential Code; a unit occupied as a
  dwelling that was never permitted or inspected creates negligence and
  consumer-protection exposure for the seller who marketed it as habitable.
- Manufacturer certification: KRS 227.580 makes it unlawful to manufacture, import, or
  sell manufactured homes in Kentucky without a certificate of acceptability; industrialized
  building systems (structures substantially fabricated off-site for permanent-foundation
  installation) are separately regulated under 815 KAR 7:130 [S27][S28]. The Amish-built
  premium portables and imported container houses both sit near these lines the moment a
  unit is marketed as habitable.
- Product liability on safety gear: Kentucky's "middleman statute" (KRS 411.340) shields a
  retailer ONLY if the manufacturer is identified AND subject to the court's jurisdiction,
  and only if the seller neither altered the product nor knew/should have known of the
  defect [S29][S30]. For blind-dropshipped or import-direct goods from Chinese factories,
  the manufacturer is typically NOT subject to US jurisdiction — the shield fails and
  Misty Valley stands in the manufacturer's shoes. One fall-arrest harness or eye-
  protection failure is a company-ending claim for an undercapitalized LLC.
- Sales-tax nexus: Kentucky itself uses $100k gross receipts (200-transaction prong
  repealed by HB 757 eff. Aug 1, 2026); every other state has similar *Wayfair* economic-
  nexus thresholds, so out-of-state building sales create multi-state
  registration/collection duties fast — a handful of $40k+ barndominium orders approaches
  thresholds on dollars alone [S31][S32].
- Consumer protection: FTC Mail/Internet Order Rule (16 CFR 435) requires a reasonable
  basis to ship within the advertised window (30 days if none stated), delay notices with
  consent, and automatic cancellation/prompt refund for delays >30 days without response
  [S33][S34] — structurally hostile to a blind-ship preorder model with overseas lead times.

## 6. Partnership failure modes (the single most-cited startup killer)

- Wasserman (Harvard, 10,000 founders studied): 65% of high-potential startups fail due to
  co-founder conflict; in his 6,000-startup sample, 65% of failures were "people problems"
  vs 35% product/market [S20][S21].
- Misty Valley's specific configuration is worse than the base case:
  - **Ben has no SSN.** Bank KYC/beneficial-ownership rules require name, DOB, address,
    and SSN/ITIN for every ≥25% owner and a controlling manager at account opening; an EIN
    cannot substitute [S35][S36]. Stripe's onboarding KYC has the same shape. The ITIN
    path (Form W-7) exists but takes months and has eligibility conditions. Until
    resolved, either Ben is an unofficial partner (a handshake equity time bomb — the
    canonical Wasserman failure) or all banking/payments/ownership run through Joey,
    concentrating both control and key-person risk (see §8).
  - **Ben previously dissolved Misty Valley Contracting LLC** — the brand name has a
    dissolution history attached to it in KY Secretary of State records.
  - **Elijah is unsigned.** The premium-builder capacity the "locally built Amish
    portables" line depends on has no contract, no exclusivity, no pricing agreement, and
    a competing direct channel (Marketplace). Classic unsigned-key-partner failure.
  - **Family dynamics:** brothers + a former-Amish community context = disputes resolved
    socially, not contractually; equity splits among family are the canonical Wasserman
    trap [S20].
  - **Joey's dual role:** building a company that sells to the construction trade while
    still employed as chief estimator at a roofing company until October creates
    duty-of-loyalty/IP-assignment exposure (anything built on employer time/equipment) and
    a hard cliff: the day he leaves, household income drops as company burn begins.

## 7. Financial structure risks

- Undercapitalization + "ran out of cash" is the #2 CB Insights cause (29%) [S3].
- Preorder/freight model cash-flow trap: customer pays upfront → funds sit exposed to
  refund/chargeback for the entire (long) lead time → processor may hold rolling reserves
  precisely because of that exposure (see §10) → meanwhile supplier POs and freight must be
  paid before delivery confirmation. A few disputed container-house orders can freeze more
  cash than the company has.
- Construction seasonality: shed/building purchases concentrate spring–fall; a winter
  launch (Joey leaves in October) means burn through the dead season before first
  meaningful demand.
- Interest-rate sensitivity: sheds, ADUs, and barndominiums are financed discretionary
  purchases; shed dealers overwhelmingly sell via rent-to-own and consumer financing, and
  demand tracks housing affordability. Post-2022 rate environment already compressed the
  post-COVID shed boom (industry reporting on backlog normalization; see §9).

## 8. Key-person risk

- Joey is the sole technologist: one person owns the storefront, the eight-tool 3D Design
  Center, hosting, and the Stripe integration — via a separate entity he controls
  (Allerion Technologies LLC), which is itself a related-party IP problem (does Misty
  Valley even own its own website?). Illness, burnout, or a founder dispute = the product
  stops evolving and nobody else can fix an outage.
- Elijah is the sole premium builder — unsigned (see §6). Injury, a big Marketplace
  quarter, or a family falling-out removes the entire "locally built premium" line.
- Bus-factor of 1 on both halves of the business simultaneously.

## 9. Demand risk for the specific bets

- **Short-term-rental units:** the buyer for an "STR cabin" is an Airbnb operator, and
  both regulation and market saturation are moving against them. NYC's Local Law 18 cut
  legal listings from ~22,000 to ~3,000; San Diego caps whole-home permits at 1% of
  housing stock; Hawaii's SB 2919 gives counties authority to phase STRs out; 2025 was a
  year of stepped-up enforcement, lawsuits, and platform crackdowns [S22][S23]. AirDNA:
  summer 2025 saw supply growth (4–5%) outpace demand growth (~3%) with ~1% occupancy
  declines — an oversupplied, revenue-per-listing-declining market for exactly the buyer
  Misty Valley's STR units target [S24]. A regulatory or saturation turn in the Nolin
  Lake / Mammoth Cave micro-market kills the flagship use case.
- **Shed/portable demand already softened:** Shed Business Journal's climate surveys found
  54.2% of shed manufacturers reporting 2024 sales lagging 2023, with anticipated
  rate-cut demand rebounds failing to materialize; the industry describes a volatile,
  normalizing post-COVID market [S37][S38]. Freedonia forecasts only ~5.8%/yr growth to
  $2.7B by 2029 — a small, slow pond with entrenched incumbents [S39].
- **Backyard studios/ADUs:** ADU demand is a metro/zoning-reform story; rural Hart County
  (~pop. 19k) has cheap land and no zoning pressure for ADUs — the local addressable
  market is thin, so the business depends on shipping buildings long-haul (see §11).
- **Import container houses are a reputationally poisoned category:** documented Amazon
  buyer experience — units arriving damaged "roughly half the time," dispute windows
  closing before delivery, 3–8 weeks stuck in customs, $2,000–$6,000 port-to-site
  delivery, units that can't be permitted as residences or financed, and shipped product
  not matching listing renders [S40]. Misty Valley inherits every one of these failure
  modes plus the customer-service burden Amazon at least partially absorbs.
- **Data-center/industrial prefab:** hype-cycle demand dominated by large integrators with
  GC relationships; not addressable by a storefront with no bonding, no track record.

## 10. Platform / tech risk

- **Payment processor termination:** processor risk models treat high-ticket,
  long-fulfillment-window, preorder merchandise as elevated risk. Documented Stripe
  practice: rolling reserves with funds held 90–180 days; freezes triggered by "sudden
  spikes in sales" or model changes; balances held 90–180 days after termination; and
  MATCH-listing after chargeback/fraud terminations, which blocks approval at most other
  processors [S41][S42], on top of review/freeze thresholds around 0.5–0.7% chargebacks
  [S8]. A single $30k building charged on a card is an instant manual-review flag for a
  new account with no processing history; a freeze during the preorder window is a
  cash-flow death spiral (customer refunds owed from frozen funds).
- **Single-developer codebase:** no code review, no redundancy, agentic-commerce bets on
  immature standards; if Joey's tooling breaks, revenue stops.
- **SEO invisibility:** no domain purchased, no live hosting, no crawl history. Organic
  ranking for "sheds," "steel framing," "safety glasses" against Home Depot/Grainger/
  Amazon domain authority takes years; that forces paid acquisition, which collides with
  the thin dropship margins in §2 [S6][S7].
- **Sandbox-to-production gap:** Stripe sandbox proves nothing about underwriting; the
  real KYC review (which requires beneficial-owner SSNs/ITINs — see Ben, §6) hasn't
  happened yet and can fail at go-live.

## 11. Rural-logistics risk

- LTL damage rates: surveys report ~1.24% (2024) to ~1.94% of LTL shipments producing a
  damage/loss claim — as high as 2–5% for multi-handled freight — driven by the
  hub-and-spoke handling model; claims average roughly $1,800–$3,800 each, and LTL claim
  DENIAL rates run 50–60%, the highest of any mode [S43][S44][S45]. Long irregular freight
  (steel studs, dock plates) and container-house panels are worst-case profiles. The
  seller eats denied claims while the consumer chargeback still lands (§2, §10).
- Buildings themselves need flatbed/escort/permit moves; last-mile placement (cranes, soft
  ground, gates) generates delivery failures that are the seller's problem under consumer
  expectations even when carrier-caused. Amazon container-house buyers report $2,000–
  $6,000 port-to-site delivery on top of purchase price [S40].
- Rural surcharges apply to Hart County origins/destinations despite the I-65 corridor;
  one-off residential building delivery over long haul wipes the margin on premium
  portables.
- Damage on customer-delivered buildings = no practical return path; a rejected delivery
  strands a custom asset with round-trip freight owed.

---

## Sources

- [S1] BLS establishment survival data summarized: https://www.lendio.com/blog/small-business-survival-and-failure-rates — ~22.1% fail in year 1, ~48.6% by year 5, ~65.3% by year 10 (BLS BED data through March 2025).
- [S2] https://founderreports.com/business-failure-statistics/ — compilation of BLS survival-by-industry data.
- [S3] CB Insights, "Why Startups Fail: Top Reasons": https://www.cbinsights.com/research/report/startup-failure-reasons-top/ — no market need 42%, ran out of cash 29%, not right team 23%, outcompeted 19%.
- [S4] https://segmentos.io/blog/why-startups-fail — CB Insights percentages incl. later root-cause framing (PMF ~43%, timing ~29%).
- [S5] https://gropulse.com/shopify-dropshipping-failure-rate/ — ~90% of dropship stores fail early; thin margins and CX cited.
- [S6] https://trueprofit.io/blog/dropshipping-success-rate — success rate estimates 10–20%.
- [S7] https://branvas.com/blogs/news/is-dropshipping-profitable — gross margins 10–30% pre-ad-spend; CAC vs margin dynamic.
- [S8] https://productlair.com/blog/dropshipping-chargebacks — dropship chargeback ~1.5% (≈2x industry average); Stripe review/freeze at ~0.5–0.7%.
- [S9] Tuff Shed company page: https://www.888tuffshed.com/company/ — available at all ~1,958 Home Depot stores; selling centers; installer network.
- [S10] Tuff Shed configurator: https://www.888tuffshed.com/tag/configurator/ and https://www.tuffshed.com/products — online design-and-order tool.
- [S11] Home Depot sheds category: https://www.homedepot.com/b/Storage-Organization-Outdoor-Storage-Sheds/N-5yc1vZbtz2
- [S12] White & Case: https://www.whitecase.com/insight-alert/trump-administration-increases-steel-and-aluminum-section-232-tariffs-50-and-narrows — 232 tariffs doubled to 50% June 3, 2025.
- [S13] PwC: https://www.pwc.com/us/en/services/tax/library/pwc-steel-and-aluminum-goods-subject-to-section-232-tariffs-expanded.html — 407 HTSUS codes added as derivatives, effective Aug 18, 2025.
- [S14] Federal Register, Section 232 inclusions process: https://www.federalregister.gov/documents/2025/08/19/2025-15819/adoption-and-procedures-of-the-section-232-steel-and-aluminum-tariff-inclusions-process — rolling petitions to expand derivative coverage.
- [S15] DHS: https://www.dhs.gov/news/2025/07/31/president-trump-ends-unfair-de-minimis-tariff-exemption-major-victory-securing — EO 14324 announced.
- [S16] CBP CSMS #66065494: https://content.govdelivery.com/accounts/USDHSCBP/bulletins/3f01456 — de minimis suspended for all countries eff. Aug 29, 2025.
- [S17] Federal Register (June 24, 2026): https://www.federalregister.gov/documents/2026/06/24/2026-12670/indefinite-suspension-of-the-de-minimis-exemption-for-merchandise-arriving-through-all-modes-other — indefinite suspension, non-postal modes.
- [S18] 815 KAR 25:060 (KY): https://apps.legislature.ky.gov/law/kar/titles/815/025/060/ — license required to sell manufactured/mobile homes; Form HBC MH-2; GL insurance $200k/$300k/$100k.
- [S19] 815 KAR 25:050: https://apps.legislature.ky.gov/law/kar/titles/815/025/050/ — KY manufactured-housing construction-standards enforcement.
- [S20] Entrepreneur on Wasserman: https://www.entrepreneur.com/leadership/harvard-business-school-professor-says-65-of-startups-fail/370367 — 65% of high-potential startups fail from co-founder conflict (10,000 founders studied).
- [S21] CNN Money: https://money.cnn.com/2014/02/24/smallbusiness/startups-entrepreneur-cofounder/ — Wasserman: 65% of failures were people problems (6,000-startup sample).

- [S22] Hospitality Net / Lighthouse, "Impact of regulation on STR markets in 2025": https://www.hospitalitynet.org/opinion/4130321.html — NYC LL18 cut legal listings ~22,000→~3,000; San Diego 1%-of-housing-stock cap; 2025 = stepped-up enforcement year.
- [S23] Houfy, STR laws by state 2026: https://www.houfy.com/blog/short-term-rental-laws-by-state-2026-complete-us-guide — Hawaii SB 2919 county phase-out authority; LA cap proposals.
- [S24] AirDNA U.S. Review September 2025: https://www.airdna.co/blog/us-review-september-2025 — demand growth ~3% vs 4–5% supply growth; ~1% occupancy declines summer 2025.
- [S25] Thompson Coburn tariff tracker: https://www.thompsoncoburn.com/insights/58-november-4-2025-reducing-the-20-ieepa-fentanyl-tariffs-on-china-to-10-reciprocal-tariffs-on-china-remain-at-10-until-november-2026/ — IEEPA fentanyl tariff cut 20%→10% eff. Nov 10, 2025; reciprocal at 10% suspended-heightened until Nov 2026.
- [S26] China Briefing, US-China tariff rates 2025: https://www.china-briefing.com/news/us-china-tariff-rates-2025/ — stacked 301 + IEEPA + 232 rates; combined rates on some products moved 245%→130%.
- [S27] KRS 227.570/227.580 via FindLaw: https://codes.findlaw.com/ky/title-xix-public-safety-and-morals/ky-rev-st-sect-227-570/ — unlawful to manufacture/import/sell manufactured homes in KY without certificate of acceptability.
- [S28] 815 KAR 7:130, Kentucky Industrialized Building Systems: https://www.law.cornell.edu/regulations/kentucky/815-KAR-7-130 — off-site-fabricated structures regulated under KY Building Code.
- [S29] KRS 411.340 (middleman statute): https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=17813 — retailer shield conditioned on manufacturer being identified AND subject to court jurisdiction; exceptions for express warranty and known defects.
- [S30] Reminger, Kentucky product liability overview: https://www.reminger.com/assets/htmldocuments/45.Product%20Liability%20Kentucky.pdf
- [S31] KY Dept. of Revenue remote-retailer FAQs: https://taxanswers.ky.gov/Sales-and-Excise-Taxes/Pages/Remote-Retailers-Marketplace-Providers-FAQs.aspx — $100k / 200-transaction economic nexus since Oct 1, 2018.
- [S32] https://beancount.io/blog/2026/07/16/kentucky-drops-200-transaction-sales-tax-threshold-guide — KY HB 757 repealed the 200-transaction prong eff. Aug 1, 2026; $100k revenue-only.
- [S33] FTC, Mail/Internet/Telephone Order Merchandise Rule: https://www.ftc.gov/legal-library/browse/rules/mail-internet-or-telephone-order-merchandise-rule (16 CFR 435: https://www.ecfr.gov/current/title-16/chapter-I/subchapter-D/part-435).
- [S34] FTC business guidance, "Selling on the Internet: Prompt Delivery Rules": https://www.ftc.gov/business-guidance/resources/selling-internet-prompt-delivery-rules — 30-day default, delay-consent notices, auto-cancel/refund for >30-day delays.
- [S35] LLC University, beneficial ownership rule for LLC bank accounts: https://www.llcuniversity.com/banking/beneficial-ownership-rule-llc-bank-account/ — SSN/ITIN + personal details required for all ≥25% owners and a controller at account opening.
- [S36] Baselane, multi-member LLC bank account requirements: https://www.baselane.com/resources/multi-member-llc-bank-account — banks require SSN/ITIN for all beneficial owners under KYC; EIN cannot substitute.
- [S37] Shed Business Journal, Oct 2024 climate survey: https://shedbusinessjournal.com/shed-business-climate-survey/ — 54.2% of respondents reported 2024 sales lagging 2023; volatile "seesaw" market.
- [S38] Shed Business Journal, "Shed Industry Cautiously Optimistic for 2025": https://shedbusinessjournal.com/shed-industry-cautiously-optimistic-for-2025/ — anticipated rate-cut demand kick failed to materialize in 2024.
- [S39] Freedonia Group, US Sheds & Outdoor Storage: https://www.freedoniagroup.com/industry-study/sheds-outdoor-storage — forecast ~5.8%/yr to $2.7B in 2029.
- [S40] PERCH, "Amazon Container Homes: Honest 2026 Review": https://ownperch.com/guides/amazon-container-homes-review-guide — damage on arrival "roughly half the time," dispute windows expiring pre-delivery, 3–8 wks customs, $2k–$6k port-to-site, unpermittable/unfinanceable units, listing-vs-shipped mismatch, unaccountable China-factory/shell-company chains.
- [S41] terms.law, Stripe holds & reserves FAQ: https://terms.law/FAQ/payment-processors/stripe-holds-faq.html — rolling reserves, 90–180-day fund releases/holds, freeze triggers incl. sales spikes.
- [S42] Durango Merchant Services on Stripe terminations: https://durangomerchantservices.com/stripe-closed-suspended-or-froze-my-account-what-do-i-do-now/ — post-termination 90–180-day holds; MATCH-list consequences.
- [S43] Warp, LTL damage rates: https://www.wearewarp.com/research/ltl-damage-rates-fewer-touches — ~1.24% damage/loss claim rate (2024); multi-handling root cause.
- [S44] Fleetworks, freight damage statistics: https://www.fleetworks.ai/resources/freight-damage-rates — ~1.94% LTL damage rate; 2–5% for multi-handled freight; claim cost averages.
- [S45] CorePiper, 2026 State of Freight Claims: https://corepiper.com/blog/state-of-freight-claims-2026/ — LTL claim denial rates 50–60%, highest of any mode.

---

## Ranked kill shots (likelihood × severity)

1. **No market need / outcompeted at launch** — pre-revenue against Home Depot+Tuff Shed's
   1,958-store configurator machine and Amazon's container-house listings; CB Insights #1
   cause at 42% [S3][S9].
2. **Co-founder/partnership implosion** — unsigned key builder, a member who can't pass
   KYC, brothers, dual-employment founder; Wasserman: 65% of failures are people problems
   [S20][S35].
3. **Cash-out during the preorder gap** — undercapitalized + winter launch + CB Insights
   #2 (29%) + processor reserves holding the float [S3][S41].
4. **Payment-processor freeze/termination + MATCH listing** — high-ticket preorders with
   long delivery windows on a fresh Stripe account [S8][S41][S42].
5. **Tariff whipsaw destroys the import program** — 232 at 50% with rolling derivative
   expansion; China stack swung 245%→130% in one action; de minimis dead [S12][S13][S15][S26].
6. **Product-liability event on dropshipped safety gear** — KRS 411.340 shield fails when
   the foreign manufacturer isn't reachable; one harness failure ends the company [S29].
7. **Unlicensed dwelling sales in Kentucky** — manufactured-home retailer licensing +
   certificate-of-acceptability requirements bite once portables are marketed as habitable
   [S18][S27][S28].
8. **Freight damage + claim denial + chargeback triple hit on oversized goods** — 1.2–5%
   damage rates, 50–60% claim denials, ~1.5% dropship chargebacks [S8][S43][S44][S45].
9. **Demand bets are late-cycle** — shed sales already lagging (54.2% down YoY), STR
   market oversupplied and regulated down, rural ADU market thin [S22][S24][S37].
10. **Key-person/bus-factor-1 on both halves** — sole technologist (via a separate LLC
    that owns the IP) and sole unsigned premium builder [S3 "not the right team" 23%].
