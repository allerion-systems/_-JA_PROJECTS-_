# Bulletproof Gaps — MVS vs. the Field

**Date:** 2026-09-06 · **Compared against:** Home Depot, Lowe's, Menards, SRS Distribution,
Beacon (QXO), QXO, ABC Supply, Tuff Shed, Lester Buildings.
**Method:** search-result/cached-page research (Firecrawl + web search) + prior teardowns
(`CONFIGURATOR-TEARDOWN.md`, `COMPETITOR-MAP-I65.md`) + code review of
`/home/user/mvs-store/src` (Home.tsx, Shop.tsx, App.tsx, Agents.tsx, index.html).
Patterns and capabilities only — no competitor copy or design reproduced. Ranked by revenue
impact: what actually loses us a real buyer.

---

## Ranked gaps

### 1. Checkout is behind a sign-in wall — every big box takes a guest card order
- **They do:** Home Depot, Lowe's and Menards all complete a card purchase with no account;
  Tuff Shed (tuffshed.com) takes a factory-direct deposit online. Lowe's/HD treat the account
  as an upsell after the sale, not a toll booth before it.
- **We have:** `CartDrawer` step 0 — "Sign in to check out" is the only button for a guest
  (`App.tsx` line ~864). A homeowner buying one harness or a case of hi-vis cannot pay us.
- **Fix:** Guest card checkout (Stripe) for card terms; keep sign-in only for Net-30/contract
  pricing. Gate nothing before the payment screen. This is the single cheapest revenue unlock
  in the codebase.

### 2. The Design Center prices but cannot sell — Tuff Shed and Menards convert the design into an order
- **They do:** Tuff Shed's configurator ends in Add-to-Cart → deposit → checkout
  (KBMax + Salesforce, per prior teardown). Menards Design & Buy (menards.com Design-It
  Center) turns a completed garage/deck design into a purchasable full-BOM order plus a
  printed design packet.
- **We have:** 8 tools with live pricing, parts table, S-1 drawing, .glb export — and the flow
  ends at a quote-send stub ("email/SMS delivery connects at launch"). No deposit, no
  "put this kit in the cart."
- **Fix:** "Buy this kit" button that pushes the configured BoM into the existing cart as
  lines (materials tools), and a Stripe deposit checkout for fabricated/structure quotes.
  We already have one shared state; this is plumbing, not architecture.

### 3. The catalog is invisible to Google and to AI shopping agents — no URLs, no schema.org
- **They do:** All nine run crawlable per-product URLs with schema.org Product/Offer/
  AggregateRating JSON-LD and merchant feeds; HD and Lowe's are now discovery surfaces inside
  Gemini and ChatGPT (Magic Apron/Google Cloud partnership, corporate.homedepot.com; Mylow/
  OpenAI, lowes.com). The post-Instant-Checkout model is "agent discovers → hands buyer to
  retailer PDP" — you need a PDP URL to be handed to.
- **We have:** A view-state SPA — no router, no deep links, one static meta description in
  `index.html`, zero JSON-LD. The Agent API page advertises `/.well-known/offer-manifest.json`
  and `/api/catalog.json`, but they're rendered as copy, not served. Ironically we market
  agent-readiness while being unreadable by every agent that exists today.
- **Fix:** (a) URL router (`/p/{sku}`, `/shop/{cat}`, `/design/{tool}`); (b) prerender PDPs
  with Product+Offer+FAQ JSON-LD (OSHA/ANSI spec is perfect FAQ/TechArticle markup — SEO
  whitespace nobody in the corridor occupies); (c) actually serve catalog.json and the offer
  manifest from `catalog/product-master.csv`; (d) sitemap.xml. This is the top-of-funnel gap;
  everything below it multiplies off traffic we currently can't receive.

### 4. No item-level delivery promise — HD shows "Get it by Tuesday" on every card
- **They do:** HD shows a concrete promise date + 2-hour store pickup per item; Lowe's offers
  free same-day on eligible items (lowes.com Pro benefits); ABC Supply and SRS Roof Hub show
  scheduled delivery days and live truck status before you commit.
- **We have:** "Ships 3–5 days" style lead text on the row; the AM/PM window picker only
  appears at checkout step 2; the "order by 10, on site by 2" wedge (COMPETITOR-MAP move #1)
  appears nowhere in the UI.
- **Fix:** Compute a promise date per SKU from fulfil type + branch cutoff and print it on
  row, PDP and cart ("Order in 2h 14m → on your site tomorrow AM"). Put the same-day PPE
  promise as a literal banner on the Safety department. It's our only uncontested territory
  claim — say it where buying happens.

### 5. Zero social proof — every competitor shows ratings, projects, or testimonials
- **They do:** HD/Lowe's PDPs carry star ratings, thousand-count reviews and Q&A; Tuff Shed
  publishes reviews (and survives a 3.0 Trustpilot because volume + installation-included
  offsets it); Lester's homepage rotates named customer testimonials and project galleries.
- **We have:** No reviews, no ratings, no completed-project gallery, no "500 crews on the
  corridor" counter. For a $40k barndo shell, a buyer sees a beautiful configurator and no
  evidence anyone has ever bought one.
- **Fix:** Verified-purchase reviews on SKUs (seed from launch customers), and for structures
  a project ledger — photo, county, spec, drawing — one entry per delivered job. Local,
  named proof beats star averages in this market; it's also review-schema for gap #3.

### 6. Big-ticket structures have no financing and no written warranty
- **They do:** Tuff Shed bundles installation in the displayed price and offers financing/
  lease-to-own at checkout (tuffshed.com pre-purchase guide); Lester leads with engineered
  warranty + dealer walkthrough (lesterbuildings.com); Menards offers big-card financing.
- **We have:** Card-or-Net-30 only; no warranty language anywhere in the store; structure
  quotes end at a number.
- **Fix:** A one-page written guarantee (workmanship + delivery-window promise), warranty
  terms on every structure PDP/quote, and one financing partner (equipment-finance or
  rent-to-own) surfaced as a monthly number next to the live price. Monthly-payment framing
  measurably widens the shed/barndo funnel — it's why Tuff Shed shows it.

### 7. No quote-as-document from the cart — HD Quote Center and Lowe's Online Order Quoting own this
- **They do:** HD Pro Xtra Quote Center: submit a project list, get a consolidated quote for
  bulk/special order (homedepot.com/c/pro-xtra). Lowe's: build, edit, share and purchase
  quotes online; purchase authorization so a crew can buy against an approved quote.
- **We have:** A cart and a PO field. No "save this cart as a quote," no priced PDF with an
  expiry, no shareable link, no crew authorization against it (RBAC exists in Users.tsx but
  isn't wired to purchasing).
- **Fix:** "Save as quote" from cart → priced document (30-day lock, PDF + link), reusable as
  a template; let owner-role approve a quote that field-role can then release. The Agent API
  already defines `create_quote` — build the human UI on the same call.

### 8. No reorder muscle — Beacon PRO+ templates and one-tap reorder are the daily-use hook
- **They do:** Beacon PRO+ order templates + 24/7 reorder synced to account (go.becn.com);
  ABC myABCsupply reorders from history; Lowe's app "reorder items"; Roof Hub starts a new
  order from a template in one tap.
- **We have:** Account view lists orders (mock), but there is no reorder action, no saved
  lists, no crew-size PPE chart (COMPETITOR-MAP move #5 promised exactly this).
- **Fix:** Reorder button on every past order, saved lists ("Framing crew — spring kit"),
  crew size chart driving a two-tap PPE re-up. Repeat consumables are the margin engine;
  make the second order 10 seconds.

### 9. No volume-pricing mechanic — HD VPP and Lowe's Volume Savings convert big carts
- **They do:** HD Volume Pricing Program: $1,500+ carts trigger a bid review at the Pro Desk;
  Lowe's Volume Savings Program + bulk pages; distributors quote job-lot pricing as a norm.
- **We have:** One flat `discountPct` per account. A 200-harness order prices the same per
  unit as 2. No qty breaks on PDP, no "ask for a bid" path.
- **Fix:** Qty-break rows on PDP (list/50+/200+), and an automatic "send this cart for a bid"
  offer when material total crosses a threshold — it becomes a quote (gap #7) with a
  same-day-answer promise, vs HD's pro-desk queue.

### 10. The Design Center estimate gate contradicts our own zero-gate story
- **They do:** Menards Design & Buy prints a full design packet without sign-in; our teardown
  scored us the winner precisely because price appears at first paint with zero gating.
- **We have:** `App.tsx` listens for `mvs-signin` — "design tools request the estimate gate."
  Somewhere in the flow the number (or its delivery) asks for identity, the exact Deckorators
  email-gate pattern our teardown calls a weakness.
- **Fix:** Never gate seeing the number or printing the sheet; ask for contact only to *send*
  the quote or hold pricing. Instrument time-to-first-price and keep the "price in ≤2
  interactions" SLO from the teardown.

### 11. Search has no typeahead, no synonyms — big-box search finds "sheetrock"
- **They do:** HD/Lowe's search autocompletes products, categories and brands after 2–3
  keystrokes, with images; both handle trade slang ("sheetrock," "romex," "OSB" vs
  "sheathing").
- **We have:** Substring match over name/SKU/std/OSHA/note (`Shop.tsx`). "Sheetrock" returns
  nothing; empty state helpfully suggests OSHA cites but offers no suggestions while typing.
- **Fix:** Typeahead panel (products, categories, OSHA cites) + a 50-line trade-synonym map.
  Keep the OSHA-cite search — that's a differentiator — and advertise it in the placeholder.

### 12. No on-site assistant, while HD and Lowe's ship theirs — and we already own the tools
- **They do:** HD Magic Apron: conversational project help + AI materials-list builders for
  pros, aisle-level store integration (Google Cloud partnership). Lowe's Mylow (OpenAI):
  project Q&A that converts to product recommendations.
- **We have:** The MCP rail defines `check_compliance`, `search_products`, `create_quote` —
  arguably a better toolset than either assistant — but only external agents can call it.
  A buyer on the site gets no "what does OSHA require for my job?" conversation.
- **Fix:** A thin chat surface over our own MCP tools: hazard/task in → cited requirement +
  compliant options + one-tap add-to-cart. Compliance advice with citations is a moat neither
  big-box assistant has; it's also the safety-department closer.

### 13. Post-order silence — ABC sends delivery photos, SRS shows the truck
- **They do:** myABCsupply: delivery tracking, daily/weekly delivery calendar, retrievable
  delivery photos (abcsupply.com); SRS Roof Hub: live order status and delivery updates;
  Beacon Track notifications.
- **We have:** A warm confirmation ("you'll hear from a person, not a status page") and then
  nothing — no status timeline, no ETA, no proof-of-delivery.
- **Fix:** Keep the person; add the page. Status timeline (routed → loaded → on truck →
  delivered + photo), SMS at each step. Photo POD doubles as content for gap #5.

### 14. Homepage has no offer mechanics — Menards prints a reason to buy this week
- **They do:** Menards' homepage is one giant "11% rebate on EVERYTHING" with a weekly flyer
  cadence; HD/Lowe's rotate seasonal promos and "Pro special buy" slots above the fold.
- **We have:** A deliberately quiet showcase — departments, marketplace, service strip. Zero
  urgency, zero offer, no seasonal band. Restraint is on-brand, but a comparison shopper sees
  no deal mechanic at all.
- **Fix:** One restrained slot: a rotating contractor bundle (e.g., fall-protection crew kit
  at job-lot price) with a real deadline, and an account-credit mechanic on structure
  deposits. One slot, never a carousel.

### 15. Mobile above-the-fold doesn't say where we deliver or why to stay
- **They do:** HD/Lowe's mobile pin store + ZIP into the header, so "this works where I am"
  is answered instantly; Tuff Shed resolves location first (too aggressively — but the
  question gets answered).
- **We have:** Utility strip (branch + phone — good), brand, search, then department doors.
  The delivery footprint ("I-65 Louisville–Nashville") and same-day capability are buried in
  the home-page footer strip; a first-time mobile visitor sees no territory claim above the
  fold.
- **Fix:** One line under the search bar: "Jobsite delivery, Louisville–Nashville corridor ·
  order by 10 AM for same-day" with an optional ZIP check that never blocks browsing
  (teardown upgrade #5's no-wall principle).

---

## Where we already beat all of them

- **Price at zero interactions.** Default configs price at first paint and re-price live in
  all 8 design tools; Lester never shows a price, Tuff Shed gates behind location,
  Menards/Deckorators make you wizard through steps. Nobody else does 0-click.
- **BoM + drawing transparency.** Parts table with SKUs and a parametric S-1 shop sheet from
  the same variables as the price. 0 of 9 competitors show the customer a drawing or full
  BoM before money changes hands.
- **Compliance as product data.** ANSI standard + OSHA cite on every product row, filterable
  and searchable by citation. No lumberyard, big box or distributor in the set does this
  anywhere on a product page.
- **Payload.** ~287 KB gz total vs 4.5–24 MB for competitor configurators; installable PWA
  with a real mobile tab bar. On rural 4G we are the only one that loads instantly.
- **Agent-first architecture.** A defined MCP tool surface with human-PO-required ordering
  and a compliance tool no competitor's AI has. HD/Lowe's assistants are ahead in deployment
  (gaps #3, #12), but none exposes an external agent API at all.
- **Checkout ergonomics for pros.** Net-30 + required PO + jobsite picker + AM/PM window in
  a 3-step drawer — simpler than any distributor portal login flow, with a human confirming
  the promise date.
- **The marketplace layer.** The Yard (local surplus, escrowed pickup) and counter-runner
  delivery exist nowhere in the competitive set — they're territory moats, not features to
  copy from anyone.

*Prototype caveats stand: pricing/stock are placeholders; several "we have" items are stubs
noted inline. Gaps ranked assuming launch hardening of what's already built.*
