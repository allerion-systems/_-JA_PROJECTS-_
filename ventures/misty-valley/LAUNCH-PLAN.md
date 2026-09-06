# Misty Valley Supply — Go-Live Plan (people buying + agents buying)

*Directive: get the store live for real purchases, line up the dropship network, run on
near-zero working capital, and make the store buyable by humans, by AI agents, and through
ChatGPT / Claude / Manus / Facebook.*

## 1. What is already built (no work left, only deployment)

- Full storefront: 137-SKU catalog, department navigation, product pages with BoMs.
- Eight-tool 3D Design Center; design → BoM → **"Buy this kit"** → cart → guest card
  checkout. Card is **authorized at order, captured only at confirmation** — that is the
  zero-working-capital rule in code: no customer cash is taken until we're ready to
  commit their order to a supplier.
- Dropship PO console (supplier routing, blind-ship POs, lifecycle board).
- mvs-mcp v0.4.1: agents can search the catalog, price designs (`design_shed`,
  `design_deck`, …) with ungated pricing, and assemble quotes — 117/117 smoke tests.
- Saved/shareable designs, printable spec sheets, opening placement (waves 1–3).

## 2. What blocks purchases TODAY (all user-held keys — nothing here is code)

| # | Blocker | Action (Joey/Ben) |
|---|---------|-------------------|
| 1 | No live host | Replit → Deployments → Settings → Public, then run the upload curl with the latest `mvs-dist.zip` (or say the word on Netlify retry) |
| 2 | No domain | Buy **mistyvalleysupply.com** (GoDaddy check said available; privacy ON, register under the business) |
| 3 | Stripe is sandbox | Reconnect Stripe choosing Allerion `acct_1PeBVvRppuigERuv`; then payments go live with restricted keys only |
| 4 | No backend | Say "create the Supabase project" (it's $0) — orders/accounts move off localStorage |

Order matters: 1 → 3 → 4 → 2 (DNS last, pointed at whatever host is live).

## 3. Dropship network (near-zero capital)

Research squad is producing `DROPSHIP-NETWORK.md`: named suppliers per category with
verifiable dealer/dropship programs, join requirements, and a first-three application
sequence. Kentucky paperwork needed before applying: EIN + KY resale certificate.
Draft outreach emails are prepared for **Ben/Joey to review and send** — nothing is sent
by agents. Working-capital rules stay absolute: no inventory buys, no supplier PO until
the customer's captured funds clear, preorder float is never working capital.

## 4. Agentic commerce — channel by channel (researched Sept 2026)

**Claude (best-aligned, act now).** Anthropic released the open **Claude Commerce
Agents** blueprint on Sept 2, 2026 — merchant-side shopping agents running on the
merchant's own stack, exactly the architecture mvs-mcp already implements. Retailers on
it report materially larger carts and completion rates. Path: keep mvs-mcp current
(v0.5: expose placements + checkout-link creation), align its tool surface with the
blueprint at github.com/anthropics/commerce-agents, and host the MCP server publicly
once Supabase + Stripe are live so any Claude user can connect the store.

**ChatGPT / OpenAI (discovery-first, not in-chat checkout).** OpenAI **retired in-chat
Instant Checkout in March 2026** and pivoted to product discovery — merchants get found
in ChatGPT via structured product feeds (CSV/JSON: identifiers, price, inventory, media,
fulfillment), with **no platform fee for discovery**. Path: generate a product feed from
`data.ts` (same pipeline as `build-catalog.mjs`), publish it at a stable URL on the live
domain, apply through OpenAI's merchant form. The buyer lands on OUR checkout — which is
built.

**Manus and other browser agents.** No merchant program to join — these agents operate
websites like a human. Readiness = the same work as SEO: crawlable URLs, schema.org
Product markup (bulletproof gap #3, now promoted to launch-blocking), semantic buttons,
no bot-blocking. Our guest checkout with no forced account creation is exactly what
browser agents need.

**Facebook.** Two lanes. (a) **Marketplace** — local listings for the premium portables
and STR units (Elijah's class of work; his own channel proves it converts there); manual
listings, checkout by conversation + card link, zero fees. (b) **Facebook/Instagram
Shops** via Commerce Manager with link-out checkout to our site once the domain is live.
Product images: only our own renders/photos, per standing rule.

**The human-approval rule, restated for agentic checkout.** Agents browse, price, and
build carts freely; **payment is always confirmed by the human buyer** — on our checkout
page or an emailed payment link. No agent auto-charges anyone. This is both our standing
rule and how every serious agentic-commerce program works.

## 5. Launch-blocking build items (mine, next)

1. Product feed generator (`scripts/build-feed.mjs`) → `feed.json` + `feed.csv` in dist.
2. Crawlable hash routes + schema.org Product JSON-LD on product pages.
3. mvs-mcp v0.5: placements, spec-sheet data, `create_checkout_link` (returns the
   order-confirmation URL for the human to approve — no agent-side charging).

## Sources
- Stripe × OpenAI ACP/Instant Checkout: stripe.com/newsroom/news/stripe-openai-instant-checkout; developers.openai.com/commerce/guides/key-concepts
- Instant Checkout retirement + discovery pivot, fees history: universalcommerceprotocol.blog/en/openai-instant-checkout/; growthcentr.com/chatgpt-instant-checkout-fees-and-requirements/
- Claude Commerce Agents blueprint: github.com/anthropics/commerce-agents; pymnts.com (Sept 2026 coverage)
