# Agentic Commerce and the "Agent-Buyable" Distributor

**Prepared for Ben Easterday and Joey Allee — 5 September 2026**
**Question on the table:** Misty Valley / Allerion ships an MCP server at
`mcp.allerion.io` exposing catalog, compliance checks, quoting and ordering,
with the rule that *agents may quote, only a human may order*. Is being
"agent-buyable" a differentiator in 2026?

---

## The short answer

**The guardrail is right. The differentiator is not — yet.**

The rule "agents may quote, only a human may place the order" is not a
conservative compromise. As of September 2026 it is the **only defensible
posture**, because no card network, protocol, or regulation has yet assigned
liability for an agent-initiated purchase that goes wrong. Worldpay states
flatly that "no liability shift exists yet" for agentic transactions
([Worldpay, "Agentic commerce liability is still being written," 2026](https://www.worldpay.com/en/insights/articles/agentic-commerce-liability-is-still-being-written)).
Ben built the correct rule for the correct reason.

But "agent-buyable" as a **sales differentiator to contractors buying steel
studs in south-central Kentucky in 2026** is a bet on a future that has not
arrived. The three pieces of evidence that settle it:

1. **The flagship consumer product died.** OpenAI retired Instant Checkout in
   March 2026, roughly six months after launch, with fewer than 30 merchants
   live. This was the single most-hyped agentic commerce deployment on earth.
2. **The protocols do not model B2B.** None of ACP, UCP, or AP2 represents
   contract pricing, account hierarchy, approval chains, POs, or net terms.
   Shopify's own position is that B2B pricing does not display on agentic
   storefronts.
3. **Nobody in industrial or construction distribution is live** with external
   third-party agents transacting. Not one named production deployment with a
   quantified result.

What *is* real, and what Misty Valley should spend money on, is at the bottom
of this document. It is not the MCP server.

---

## 1. The protocols and standards actually in play

### Status legend

| Mark | Meaning |
|---|---|
| **PROD** | Real money moving, at disclosed scale |
| **PILOT** | Live transactions, limited scope or partners |
| **SPEC** | Published specification, little or no transaction volume |
| **DEAD** | Announced then withdrawn |

### The landscape

| Standard | Backers | Solves | Stage | Real money? |
|---|---|---|---|---|
| **MCP** (Model Context Protocol) | Anthropic; hosted by Linux Foundation's Agentic AI Foundation | Agent ↔ tool/data plumbing. **Not a commerce standard.** | **PROD** as plumbing | Not itself a payment rail |
| **ACP** (Agentic Commerce Protocol) | OpenAI + Stripe | Agent-initiated checkout, delegated payment token | **SPEC** (beta) — its flagship product was withdrawn | Minimal; now repositioned to discovery |
| **UCP** (Universal Commerce Protocol) | Google + Shopify | Discovery → cart → checkout → post-purchase | **PILOT**, consumer retail | Yes, small, undisclosed |
| **AP2** (Agent Payments Protocol) | Google; donated to FIDO Alliance | Cryptographically signed *mandates* proving user authorization | **SPEC** v0.2 | Pilots only |
| **Visa Intelligent Commerce** | Visa | Tokenized agent credentials, spend guardrails | **PILOT** | Yes, small |
| **Mastercard Agent Pay** | Mastercard | Agent tokens + Payment Passkeys | **PILOT** | Yes, small |
| **x402** | Coinbase + Cloudflare | HTTP 402 stablecoin micropayments, agent-to-API | **PILOT** | Headline counts large, real commerce tiny |

### Detail

**Model Context Protocol (MCP).** Anthropic's protocol, now under the Linux
Foundation's Agentic AI Foundation. This is the one piece of the stack that is
genuinely production-grade and widely adopted — but understand what it is.
**MCP is a plumbing standard, not a commerce standard.** It defines how an
agent talks to a tool. It defines nothing about payment, authorization,
liability, or settlement.

Critically for Ben: **the MCP specification says nothing about discovery.** A
server that speaks flawless MCP still needs somewhere for an agent to find its
URL. Registries exist to fill that gap — mcp.so, smithery.ai, glama.ai — and the
official MCP Registry was still in preview as of July 2026, with mcp.so alone
listing over 20,000 servers
([Digital Thought Disruption, 20 July 2026](https://digitalthoughtdisruption.com/2026/07/20/mcp-registry-discover-verify-safely-connect-servers/);
[colrows.com](https://colrows.com/blogs/mcp-registry-agent-tool-discovery/)).

> **This is the load-bearing problem with `mcp.allerion.io`.** No contractor's
> AI assistant is going to spontaneously discover it. Someone has to be told it
> exists and deliberately connect to it. That makes it an *integration*, not a
> *channel* — which is a completely different (and much smaller) business case
> than "we are agent-buyable."

**Agentic Commerce Protocol (ACP)** — OpenAI + Stripe, released 29 September
2025 alongside ChatGPT Instant Checkout, Apache 2.0 licensed
([Stripe newsroom](https://stripe.com/newsroom/news/stripe-openai-instant-checkout)).
The spec site itself lists only two adopters: OpenAI as the first AI platform
and Stripe as the first compatible PSP
([agenticcommerce.dev](https://www.agenticcommerce.dev/), fetched 5 Sept 2026).
PayPal joined as a payment provider on 28 October 2025; Stripe shipped an
Agentic Commerce Suite 11 December 2025; the latest stable snapshot is dated
2026-04-17 *(secondary source — see Confidence notes)*. **The spec survived; its
flagship implementation did not.** More below.

**Universal Commerce Protocol (UCP)** — Google + Shopify, announced by Sundar
Pichai at NRF on **11 January 2026**. Shopify describes it as "an open standard
for AI agents to connect and transact with any merchant," covering discount
codes, loyalty credentials, subscription preferences and transaction terms
across any payment processor. Endorsed by 20+ retailers and platforms; Etsy,
Target, Walmart and Wayfair named
([Shopify, "AI commerce at scale," 11 Jan 2026](https://www.shopify.com/news/ai-commerce-at-scale)).
This is currently the most credible consumer-side standard — and note that
Stripe endorsed it too, meaning even ACP's co-author is hedging.

**Crucially, Shopify's own announcement contains no B2B commerce at all.** UCP
is described as designed for other verticals "in the future."

**AP2 (Agent Payments Protocol)** — Google, announced **16 September 2025**,
currently **v0.2**, and **donated to the FIDO Alliance**, which is now
developing formal standards through its Agentic Authentication and Payments
Technical Working Groups ([ap2-protocol.org](https://ap2-protocol.org/), fetched
5 Sept 2026). AP2 is the most intellectually serious piece of work in this
space and is covered in section 4.

**Visa Intelligent Commerce.** Visa launched Intelligent Commerce Connect
(a single integration for merchants, agent builders and payment enablers) in
April 2026, in pilot with Aldar, AWS, Diddo, Highnote, Mesh, Payabli and Sumvin.
At the Visa Payments Forum in Paris, Visa announced agents completing live
purchases at European merchants — lastminute.com, Frasers, Cleverbridge,
BrickDepot — backed by 30+ issuing banks. Visa and OpenAI announced integration
of Visa Intelligent Commerce into OpenAI experiences in June 2026.
*(Dates and merchant names from secondary reporting — see Confidence notes.)*

**Mastercard Agent Pay.** Launched April 2025; live authenticated agentic
transactions announced in Hong Kong and Thailand in 2026 using tokenized
credentials and Mastercard Payment Passkeys. *(Secondary source.)*

**x402** — Coinbase + Cloudflare. Uses the dormant HTTP 402 "Payment Required"
status code to embed USDC payments in web requests. **This is where the gap
between headline metrics and reality is widest.** Reported figures include
119M+ transactions on Base and 35M on Solana as of March 2026, with roughly
$600M annualized volume. But CoinDesk reported in March 2026 that despite a
~$7B ecosystem valuation, on-chain data showed x402 processing only about
**$28,000 in daily volume**, much of it testing and gamed transactions rather
than real commerce
([CoinDesk, 11 March 2026](https://www.coindesk.com/markets/2026/03/11/coinbase-backed-ai-payments-protocol-wants-to-fix-micropayment-but-demand-is-just-not-there-yet)
— headline and thesis confirmed; article body returned HTTP 429 on fetch).

> **Read that again.** $600M annualized headline vs. $28k/day real. That ratio
> is the single best illustration of this entire sector in 2026. Assume every
> number you read in this space is inflated by an order of magnitude until you
> see settled revenue.

### Where the standards bodies landed

- **AP2 → FIDO Alliance** (April 2026)
- **MCP → Linux Foundation**, Agentic AI Foundation
- **EMVCo** established a task force on agentic payment specifications; outcomes
  pending (per Worldpay)
- **ACP** — no independent governance body; still Stripe/OpenAI stewarded
- **UCP** — no independent governance body; Google/Shopify stewarded

Two of the five have real institutional homes. Three do not. That is a sector
roughly 18 months from stable standards, not one that has settled.

---

## 2. Who is actually live

### The headline event: Instant Checkout is dead

This is the most important fact in this document and it is the one least likely
to appear in the vendor marketing Ben will be shown.

**OpenAI retired ChatGPT Instant Checkout in March 2026**, about six months
after its September 2025 launch. The Information broke the story on 6 March
2026; CNBC reported 20 March 2026; Forbes retail analyst Jason Goldberg wrote
"Why OpenAI's Checkout Retreat Spells Trouble For Its Commerce Strategy" on
10 March 2026.

The numbers behind the retreat:

- **Fewer than 30 Shopify merchants** were live as of February 2026, per
  Forrester principal analyst Emily Pfeiffer.
- Etsy was the only platform at any scale, and "volume was a rounding error
  against total platform GMV."
- **No GMV figure was ever disclosed** by OpenAI or any merchant.
- Reported failure causes: no sales tax collection mechanism, no fraud
  prevention, inability to sync real-time inventory across merchants at scale,
  cumbersome onboarding, and inaccurate inventory/shipping data.

OpenAI pivoted to product **discovery**, with checkout returning to merchants'
own environments via retailer-built apps inside ChatGPT.

Sources: [Forbes/Goldberg, 10 Mar 2026](https://www.forbes.com/sites/jasongoldberg/2026/03/10/why-openais-checkout-retreat-spells-trouble-for-its-commerce-strategy/)
(fetch returned 403; headline and date confirmed via search index);
[laioutr.com analysis citing CNBC 20 Mar 2026](https://www.laioutr.com/en/blog/chatgpt-instant-checkout-merchant-adoption-agentic-readiness-2026);
[Stellagent](https://stellagent.ai/insights/openai-shopping-agent-strategy-pivot).
**Corroborated across four independent secondary sources plus two named
analysts. Treat as established.**

### What remains live in production

| Who | What | Status |
|---|---|---|
| Google AI Mode / Gemini | UCP checkout with Nike, Sephora, Target, Walmart, Wayfair | **PILOT → early PROD**, consumer |
| Microsoft Copilot Checkout | Shopify merchants (Keen, Pura Vida) | **PILOT**, consumer |
| Shopify Agentic Storefronts | Monos, Gymshark, Everlane in Google surfaces | **PILOT**, consumer |
| Visa Intelligent Commerce | ~30 European issuers, named merchants | **PILOT** |
| Mastercard Agent Pay | HK, Thailand pilots | **PILOT** |
| PayPal | AP2 wallet integration w/ Google Cloud agent | **PILOT** |
| x402 | Agent-to-API micropayments | **PILOT**, volume disputed |

**Every single one is consumer retail.** Apparel, footwear, cosmetics, travel,
general merchandise. Not one is a distributor selling to a trade account.

---

## 3. B2B specifically — and this is the part that matters

### The honest finding

**Nobody in industrial, construction, or building-products distribution is live
with external third-party agents placing orders.** The best analysis available
found **no named production deployment with a quantified result** for the
narrow case that matters — an outside agent transacting against contract
pricing on credit terms
([McFadyen Digital, "B2B Agentic Commerce in 2026: What Actually Works, in Four
Tiers"](https://mcfadyen.com/articles/b2b-agentic-commerce-what-works-now)).

### The four tiers, and where Misty Valley's MCP server sits

McFadyen's framework is the most rigorous thing published on this, and it maps
directly onto Ben's question:

| Tier | What it is | Status | Named examples |
|---|---|---|---|
| **1** | **Seller-side** agents: order intake, catalog enrichment, service assist | **Ready now, real ROI** | commercetools B2B Intake Agent w/ Mirion Technologies (June 2026); Conexiom — 1.5B line items/yr across ~40 ERPs for **Sonepar, Graybar, Johnstone Supply NW**; Coupa — 450+ customers running agents in production |
| **2** | Agent-**assisted quoting** in first-party channels, authenticated buyers | **Real but constrained** | Salesforce Agentforce Commerce GA late June 2026 — reorder over WhatsApp/SMS with contract pricing |
| **3** | Agentic storefronts on UCP/ACP | **Limited B2B fit** | Google Universal Cart (Nike, Sephora, Target, Walmart, Wayfair) — all consumer |
| **4** | **Third-party agents + contract pricing, entitlements, account hierarchy, approval chains, net terms, punchout, EDI** | **Not supported by any protocol** | **None** |

**`mcp.allerion.io` with "agents may quote, humans must order" is a Tier 2
product.** That is a respectable place to be — Tier 2 is real. But Tier 2's
value is to **your own authenticated customers**, not to the open agent
ecosystem. It is a better ordering interface for Rick at the framing contractor
who already has an account. It is not a demand channel.

### Why the protocols structurally cannot do B2B yet

Across ACP, UCP and AP2 there is **no representation of**:

- customer-specific contract pricing
- corporate account hierarchy
- entitlements (who on the account may buy what)
- approval chains
- purchase orders
- net terms
- mappings to punchout (cXML/OCI) or EDI (X12 850/810)

These are not edge cases in building-products distribution. They *are* the
business. A framing contractor does not pay list with a card; they buy on a
30-day account at negotiated per-LF pricing against a job number.

Shopify's stated position, per McFadyen: **"B2B pricing doesn't display on
agentic storefronts."** *(Second-hand quote — flagged, see Confidence notes.)*

### The B2B deployments that ARE real — and what they actually are

Vendor marketing will show Ben these cases. Understand what they are before he
is sold on them:

- **Danfoss** — order confirmation time cut from 42 hours to under 1 minute,
  80% autonomous decision rate, 26 countries.
- **Mediq** (Nordic healthcare distribution) — ~4,000 orders/week processed
  autonomously, 75% processing-time reduction on largest orders, no added
  headcount.
- **CWS Hygiene** — commercial operations.

Sources: [Go Autonomous, "Agentic AI in B2B Order Management: what 2026
deployments reveal about the execution gap"](https://goautonomous.io/blogs/agentic-ai-in-b2b-order-management-what-2026-deployments-reveal-about-the-execution-gap/).

**Every one of these is seller-side order-intake automation.** They are systems
that read inbound customer POs arriving as emails, PDFs and faxes and turn them
into clean ERP orders. **No external buying agent is involved. No protocol is
involved. No MCP server is involved.** This is document parsing with a good
sales deck.

Go Autonomous names the real problem the "execution gap": *"Most enterprise
agentic AI deployments in B2B manufacturing and distribution are still in
assistance mode — helping humans work faster, not removing the human dependency
that drives cost at scale."*

### What construction procurement agents actually do today

This is the most directly relevant finding for Misty Valley, and it changes the
recommendation.

AI agents in construction procurement **do not place orders.** They:

- build a supplier shortlist from a plain-English brief or bill of quantities
- draft structured RFQs
- **email them to suppliers**
- read the returned quote PDFs/emails, extract pricing and lead times
- normalize and score the quotes into a comparison

Quotr's own guidance explicitly lists "autonomous markup and workflow
execution" as something AI does **not** yet do, states that "supplier
qualification, negotiation, and the award decision stay with humans," and warns
readers away from platforms "claiming fully autonomous procurement"
([Quotr, "AI Agents for Construction Procurement and Buyout"](https://quotr.ai/blog/ai-agents-for-construction-procurement-and-buyout/)).

> **The channel a construction buying agent actually uses to reach a supplier
> in 2026 is email.** Not MCP. Not ACP. Not UCP. A structured RFQ, in an email,
> to `sales@`.
>
> This single fact should reallocate Misty Valley's entire agent-readiness
> budget. See section 7.

---

## 4. The trust and authorization problem

This is where Ben's instinct is genuinely ahead of the market, and where the
"human places the order" rule earns its keep.

### AP2's mandate model — the substantive idea

AP2 is the only design that takes the authorization question seriously. Its
mechanism is **cryptographically signed mandates** — verifiable credentials
that prove a human authorized a specific scope of purchasing. In v0.2 there are
two ([ap2-protocol.org](https://ap2-protocol.org/), fetched 5 Sept 2026):

- **Checkout Mandate** — captures purchase details and user authorization;
  shared with the merchant.
- **Payment Mandate** — authorizes payment against a specific instrument;
  shared with credential providers and processors.

Each exists in an **"Open"** stage (constrained autonomous execution — "buy
studs under $2,000 from approved suppliers") and a **"Closed"** stage (specific
transaction authorization — "buy *this* cart"). The Open/Closed distinction is
the elegant part: it lets a merchant tell the difference between an agent
operating inside a standing delegation and one presenting a freshly approved
cart.

**Known gaps** *(secondary source, flagged):* agent identity is not solved by
AP2; mandate revocation needs careful handling; and the protocol has not been
tested at meaningful card-network volume.

### The card networks' credential schemes

Where an agent authenticates properly through Visa Intelligent Commerce,
Mastercard Agent Pay, or Amex ACE and a payment token is correctly issued,
**liability follows existing tokenized-transaction rules** — the issuer carries
fraud liability when the token is validly issued and policy honored at
authorization. Amex released an ACE developer kit and "Agent Purchase
Protection" in April 2026. Mastercard is reportedly weighing scheme-carried
liability for certified agents, conditional on proving the agent departed from
stored intent. *(Secondary sources.)*

### What is NOT solved — the evidence gap

Per Worldpay (fetched 5 Sept 2026):

1. **No liability shift exists yet.** Authentication and tokenization liability
   is "reasonably well handled," but disputes involving agent misinterpretation
   or unauthorized agent action **lack any allocation rule**.
2. **Regulation E assumes binary authorization** — a transaction was either
   authorized or it wasn't. There is no legal framework for "the agent
   misread the mandate."
3. **The evidence you'd normally use to fight a chargeback disappears.** No
   human click trail. No cardholder behavioral session data. The device
   fingerprint belongs to *the agent's server*, not the buyer's device.
4. Merchants operating under ACP currently **own the liability without the
   evidence infrastructure to defend disputes.**

### What this means for Misty Valley concretely

Cross-reference `12-allerion-and-the-stack.md`. The staged Stripe posture there
— Misty Valley's own merchant account first, no platform exposure — is the
right call, and the agentic liability picture makes it *more* right, not less.

An agent-placed order on a card, disputed later, in 2026:
**Misty Valley eats it, with no defensible evidence.** A $6,000 stud order is
not a rounding error against a company with a $32,489 landed container cost.

**Ben's rule is not caution. It is the correct reading of the rulebook.**
Keep it. Write it into the terms of service. And note the second-order benefit:
it is also a *marketing* asset — "a human confirms every order" is a
reassurance to a contractor, not a limitation.

---

## 5. The offer/product-feed layer — how agents actually find things

This section is the actionable one, because unlike everything above, **this
part works today and pays for itself even if agentic commerce never arrives.**

### What each channel wants

**Google Merchant Center + schema.org Product markup — the real one.**
Products in Merchant Center with complete accurate data are eligible to appear
in Google AI Mode recommendations, **including free product listings without
running Shopping ads**. Schema.org `Product` markup in JSON-LD on every product
page acts as the verification layer for the Merchant Center feed. Core
properties: `name`, `image`, `description`, `sku`, `brand`, `offers`. Price and
availability must match the feed exactly — discrepancies signal data-quality
problems and suppress visibility.
[Google Merchant Center structured data docs](https://support.google.com/merchants/answer/7331077?hl=en).

**A caveat specific to Ben's product:** GTINs are described as the strongest
matching signal, and missing or invented GTINs drop products out of competitive
clusters. **Steel framing typically has no GTIN** — it has manufacturer part
numbers, gauge, web depth, flange, and ASTM C645/C955 designations. This is a
genuine structural mismatch between building products and the consumer feed
rails, and it is another reason the consumer standards are not built for this
trade. Publish what exists (`mpn`, `sku`, `brand`) and do not fabricate GTINs.

**OpenAI product feed spec.** Nine required fields
([developers.openai.com/commerce/product-feeds/spec](https://developers.openai.com/commerce/product-feeds/spec?fields=required),
fetched 5 Sept 2026):

`item_id` · `title` (≤150 chars) · `description` (≤5,000) · `url` ·
`brand` · `seller_name` · `image_url` · `availability` (in_stock /
out_of_stock / pre_order / backorder / unknown) · `price` ("79.99 USD")

Formats: CSV, TSV, XML or JSON, via SFTP, upload, or hosted URL; refresh as
often as every 15 minutes. **Search is enabled by default; checkout is
disabled unless separately configured** — which suits Ben's rule exactly.
Currently targets the US. Results are not ads and are not influenced by paid
placement; ranking depends on feed quality and relevance.

**llms.txt — skip it, mostly.** Adoption is ~10% of 300,000 domains studied by
SE Ranking, and an Ahrefs analysis of 137,000 domains found **97% of llms.txt
files received zero requests in May 2026**. Google's Gary Illyes confirmed in
July 2025 that Google does not support it and does not plan to; John Mueller
compared it to the keywords meta tag. As of Q1 2026 no major AI company has
committed to reading it in production. The genuine consumers today are **coding
agents** — Cursor, Claude Code, Continue, Cline.
*(Secondary sources; the Google statements are well-attested.)*

It costs an hour to publish one. Do that and expect nothing.

**MCP-exposed catalog.** Real, useful, but — as established in section 1 — it
is an integration endpoint with no organic discovery path. Value accrues only
where a specific counterparty is told to connect.

### What a small distributor should actually publish

In priority order, cheapest first:

1. **Schema.org `Product` + `Offer` JSON-LD on every product page.** Include
   `sku`, `mpn`, `brand`, `name`, `description`, `image`, `offers.price`,
   `offers.priceCurrency`, `offers.availability`. This is the highest-value
   item on the list and it is table stakes for ordinary SEO regardless.
2. **A clean product feed** in the shape both Google Merchant Center and the
   OpenAI spec want. One canonical CSV/JSON source, two exports. Build it once.
3. **`Organization` + `LocalBusiness` schema** with service area, hours,
   will-call address. Contractors search locally; agents answering "who sells
   metal studs near Bonnieville" need this.
4. **Machine-readable spec data in the page body** — gauge, web depth, flange
   width, steel thickness, ASTM designation, yield strength, coating, length
   options, $/LF break points. An agent comparing quotes needs to know your
   20ga 3-5/8" is the same thing as the competitor's.
5. **A structured RFQ intake path** — because per section 3, *email is the
   channel*. A monitored `quotes@` address, plus a simple form with a stable
   schema, plus a commitment to reply with a quote in a consistent parseable
   format (line item, part number, qty, unit, $/LF, extended, lead time,
   validity date). **This is the single highest-ROI "agent-readiness"
   investment available to Misty Valley.**
6. **`llms.txt`** — one hour, low expectations.
7. **MCP server** — keep it, it is built, it costs nothing to run, and it is a
   credible artifact when selling Allerion to the second distributor. Do not
   position it to contractors as a reason to buy studs.

---

## 6. The honest verdict

**Is "agent-buyable" a commercial advantage in 2026 for a distributor under
$5M of revenue?**

**No. Not as a differentiator to customers. Not this year.**

The case against, plainly:

- **The demand side does not exist.** The buyer of Misty Valley's product is a
  framing contractor or a PM. They are not dispatching autonomous purchasing
  agents. The most advanced thing happening in construction procurement is an
  agent *emailing an RFQ* — and Misty Valley can serve that with a monitored
  inbox and a consistent quote format, at zero protocol cost.
- **The best-funded attempt on earth failed.** OpenAI, with unlimited capital,
  Stripe as a partner, and the world's most-used AI product, could not get 30
  merchants to sustain Instant Checkout and killed it in six months.
- **The protocols cannot express Ben's business.** No contract pricing, no net
  terms, no account hierarchy, no PO. A standard that cannot represent "$0.78/LF
  for Rick, net 30, against job #4471" is not a standard for this trade.
- **Zero named B2B distribution deployments.** In a sector that publicizes
  everything, silence is data.
- **Liability is unassigned.** Even if a customer *wanted* to buy agentically,
  accepting it on a card would be taking an unpriced, undefendable risk.

**And the reason it is nonetheless not a waste:** the substrate that makes a
company agent-buyable — clean structured product data, consistent SKUs, real
specs, accurate availability, a machine-readable quote — is *identical* to the
substrate that makes a company findable in ordinary search, easy to integrate
with a contractor's ERP, and cheap to onboard to a marketplace. **Ben should
build the substrate and skip the rails.**

### The cheap bet vs. the expensive bet

| | **Cheap bet — DO THIS** | **Expensive bet — DON'T** |
|---|---|---|
| **What** | Structured product data: schema.org JSON-LD, one canonical feed, real spec attributes, `Organization`/`LocalBusiness` markup, monitored structured RFQ intake, consistent parseable quote format | Building/maintaining ACP, UCP, or AP2 endpoints; agent payment tokenization; mandate verification; delegated-authority infrastructure |
| **Cost** | Days of work, mostly one-time; folds into the storefront already being built | Months of engineering, ongoing spec churn across three competing standards, PCI and liability exposure |
| **Payoff if agentic commerce arrives** | You are already 80% ready; the rails are a thin adapter over data you already publish | You bet on the right one of three unstable standards |
| **Payoff if it doesn't** | **Full.** Better Google ranking, better AI-search visibility, faster ERP integration, faster customer onboarding, less quote-desk labor | **Zero.** Dead code |
| **Risk** | None meaningful | Opportunity cost during the first-container period, when attention is the scarcest resource in the company |

### One more consideration Ben should weigh

Section 12 of the main review already flags the affiliation and platform-risk
traps in Allerion. Add this: **the agent-buyable story is currently more
valuable as an Allerion asset than as a Misty Valley one.** A distributor
evaluating Allerion's platform in 2027 will care that the MCP interface exists.
A contractor buying studs in 2026 will not. Position it accordingly — in the
Allerion pitch deck, not on `mistyvalleysupply.com`.

And keep the guardrail. When this does arrive — and the direction of travel is
real even if the timeline is not — the companies that will be trusted with
autonomous ordering are the ones that spent the intervening years demonstrating
that a human checked every order. That is a moat built out of discipline, and
it is free.

---

## 7. Recommended actions

**Do now (days, folds into storefront work):**
1. schema.org `Product`/`Offer` JSON-LD on every product page. Do not fabricate GTINs; use `mpn`/`sku`.
2. One canonical product data source → Google Merchant Center feed + OpenAI-spec feed.
3. `Organization` + `LocalBusiness` schema with Bonnieville service area.
4. Full spec attributes in page body: gauge, web, flange, mil thickness, ASTM, coating, lengths, $/LF breaks.
5. Monitored `quotes@` inbox + a fixed, parseable quote reply format. **Highest ROI item on this list.**

**Do cheaply (hours):**
6. Publish `llms.txt`. Expect nothing.
7. Keep `mcp.allerion.io` running. Document it. Do not market it to contractors.

**Do not do (2026):**
8. Do not implement ACP, UCP, or AP2 endpoints.
9. Do not accept agent-initiated card payments under any circumstances.
10. Do not put "agent-buyable" in customer-facing positioning for Misty Valley Supply.

**Revisit trigger — check again when any ONE of these happens:**
- A named building-products or industrial distributor announces a *production*
  third-party-agent ordering deployment with a disclosed volume.
- Any protocol publishes a B2B extension covering contract pricing and net terms.
- A card network publishes an actual liability shift for agent-initiated
  transactions (watch EMVCo's task force and the FIDO Alliance Agentic
  Authentication WG).
- A real Misty Valley customer asks for it. *This one matters most.*

Suggested review: **Q1 2027**, or on trigger.

---

## Confidence notes

Per the standing rule that this space is full of press releases, here is what is
solid and what is not.

**VERIFIED — primary source fetched 5 September 2026:**
- AP2 v0.2, announced 16 Sept 2025, donated to FIDO Alliance, Checkout/Payment
  Mandate model with Open/Closed stages — `ap2-protocol.org`
- ACP governance, Apache 2.0, only OpenAI + Stripe listed as adopters, no
  public roadmap or changelog — `agenticcommerce.dev`
- UCP announced 11 Jan 2026; named merchants; **no B2B content** —
  `shopify.com/news/ai-commerce-at-scale`
- OpenAI product feed's nine required fields, US targeting, checkout disabled by
  default — `developers.openai.com`
- "No liability shift exists yet"; Reg E binary-authorization gap; EMVCo task
  force — `worldpay.com`
- Construction agents do not place orders; award decisions stay with humans —
  `quotr.ai`
- McFadyen four-tier B2B framework and the "no named production deployment"
  finding — `mcfadyen.com`
- Go Autonomous named deployments (Danfoss, Mediq, CWS) and "execution gap" —
  `goautonomous.io`

**CORROBORATED — multiple independent secondary sources, treat as established:**
- Instant Checkout sunset, March 2026. Four secondary sources, two named
  analysts (Emily Pfeiffer/Forrester, Jason Goldberg/Forbes), originating
  reporting attributed to The Information (6 Mar) and CNBC (20 Mar). Both the
  Forbes and CoinDesk articles blocked direct fetch (403 / 429); headlines,
  dates and framing confirmed via search index.
- x402 headline volume vs. ~$28k/day real volume — CoinDesk thesis confirmed by
  headline and multiple restatements.

**UNVERIFIED — single or secondary source only. Do not act on these alone:**
- Specific Visa European live-transaction merchant names and the July 2026
  Paris forum date.
- Mastercard Hong Kong / Thailand pilot dates.
- Amex ACE developer kit / Agent Purchase Protection, April 2026.
- ACP snapshot version 2026-04-17; PayPal joining 28 Oct 2025; Stripe Agentic
  Commerce Suite 11 Dec 2025.
- The Shopify quote "B2B pricing doesn't display on agentic storefronts" — this
  is McFadyen quoting Shopify, not a Shopify primary source. Directionally
  consistent with Shopify's own announcement, which contains no B2B content.
- llms.txt adoption statistics (SE Ranking 10.13%, Ahrefs 97%-zero-requests).
  The Google non-support statements are well-attested; the percentages are not
  independently confirmed.
- Conexiom's 1.5B line items/yr and the Sonepar/Graybar/Johnstone customer list;
  commercetools/Mirion June 2026; Coupa's 450+ production customers. All via
  McFadyen citing vendor claims.

**REJECTED — encountered and discarded:**
- A search summary asserting AP2 was "announced at Google I/O 2026 on May 19"
  alongside "Gemini Spark." Contradicted by the AP2 primary source
  (16 Sept 2025). Illustrative of how unreliable secondary coverage is here.
- Gartner's "90% of B2B purchases handled by AI agents by 2028, $15T" and
  Forrester's "one-third of B2B payment workflows by end of 2026." Widely
  repeated in vendor blogs without traceable primary citation, and irreconcilable
  with the zero-deployment finding in section 3. **Do not repeat these numbers.**

---

## Sources

- [Stripe — Instant Checkout and ACP launch](https://stripe.com/newsroom/news/stripe-openai-instant-checkout)
- [Agentic Commerce Protocol](https://www.agenticcommerce.dev/)
- [Shopify — AI commerce at scale (UCP), 11 Jan 2026](https://www.shopify.com/news/ai-commerce-at-scale)
- [AP2 Protocol documentation](https://ap2-protocol.org/)
- [OpenAI — Product Feed Spec](https://developers.openai.com/commerce/product-feeds/spec?fields=required)
- [OpenAI — Agentic Commerce key concepts](https://developers.openai.com/commerce/guides/key-concepts)
- [Worldpay — Agentic commerce liability is still being written](https://www.worldpay.com/en/insights/articles/agentic-commerce-liability-is-still-being-written)
- [McFadyen Digital — B2B Agentic Commerce in 2026: What Actually Works, in Four Tiers](https://mcfadyen.com/articles/b2b-agentic-commerce-what-works-now)
- [Go Autonomous — Agentic AI in B2B Order Management](https://goautonomous.io/blogs/agentic-ai-in-b2b-order-management-what-2026-deployments-reveal-about-the-execution-gap/)
- [Quotr — AI Agents for Construction Procurement and Buyout](https://quotr.ai/blog/ai-agents-for-construction-procurement-and-buyout/)
- [CoinDesk — Coinbase-backed AI payments protocol… demand is just not there yet, 11 Mar 2026](https://www.coindesk.com/markets/2026/03/11/coinbase-backed-ai-payments-protocol-wants-to-fix-micropayment-but-demand-is-just-not-there-yet)
- [Forbes/Jason Goldberg — Why OpenAI's Checkout Retreat Spells Trouble, 10 Mar 2026](https://www.forbes.com/sites/jasongoldberg/2026/03/10/why-openais-checkout-retreat-spells-trouble-for-its-commerce-strategy/)
- [Laioutr — ChatGPT Instant Checkout merchant adoption analysis](https://www.laioutr.com/en/blog/chatgpt-instant-checkout-merchant-adoption-agentic-readiness-2026)
- [Stellagent — OpenAI ends Instant Checkout, pivots to retailer apps](https://stellagent.ai/insights/openai-shopping-agent-strategy-pivot)
- [Google Merchant Center — structured data setup](https://support.google.com/merchants/answer/7331077?hl=en)
- [colrows — The MCP Registry: Discovery Is Solved, Trust Is Not](https://colrows.com/blogs/mcp-registry-agent-tool-discovery/)
- [Digital Thought Disruption — MCP Registry, 20 July 2026](https://digitalthoughtdisruption.com/2026/07/20/mcp-registry-discover-verify-safely-connect-servers/)
- [Visa — Visa and partners complete secure AI transactions](https://usa.visa.com/about-visa/newsroom/press-releases.releaseId.21961.html)
- [Chargeflow — AI agent chargeback liability](https://www.chargeflow.io/blog/ai-agent-chargeback-liability)
