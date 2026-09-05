# Configurator Teardown — Lester Buildings / Tuff Shed / Deckorators vs. MVS Design Center

**Date:** 2026-09-05 · **Scope:** publicly served pages and assets only. We adopt interaction
patterns and engineering approaches; we do not copy visuals, copy, or assets.
**Method:** page-source inspection (script/iframe origins, JS bundle contents, asset HEAD
requests), vendor case studies, and press. Anything not directly observed is marked
**[inference]**.

---

## 1. Lester Buildings — MyLester Design® (the "Design-It" configurator)

> Note: Lester's current branding is **MyLester Design®**; "Design-It" appears to be the
> legacy name for the same slot on the site. **[inference]**

### A. Who built it — **IdeaRoom** (verified)

Evidence chain, all from public source:

1. `https://www.lesterbuildings.com/mylester-design/` links "Start Designing with MyLester
   Design®" to `https://mylesterdesign.lesterbuildings.com/`.
2. That app's HTML (505 bytes, a pure shell) loads exactly one functional script:
   `https://assets.carportview.com/production-carportview.js` — **CarportView is an IdeaRoom
   brand** (sister of ShedView, see `design.idearoom.com/shedview-premium-portable-buildings`).
3. That loader returns `{"location":"https://js.idearoom.com/"}`, and
   `https://config-js.idearoom.com` bootstraps three bundles from
   `s3-us-west-2.amazonaws.com/js.idearoom.com/production/_deploys/…`.
4. `https://design.idearoom.com/lesterbuildings` serves a page titled **"IdeaRoom 3D
   Configurator"** that loads the same `config-js.idearoom.com` script for the
   `lesterbuildings` client id.
5. Corroborating: Lester Building Systems appears in the IdeaRoom customer list at
   appsruntheworld.com (`https://www.appsruntheworld.com/customers-database/products/view/idearoom`).

### B. Tech stack (observed in the served bundles)

- **Engine: three.js, real-time client-side WebGL.** The IdeaRoom bundle contains `THREE.*`
  symbols including `THREE.BufferGeometry`, `THREE.InstancedBufferGeometry`, `THREE.SAOPass`
  (ambient occlusion post-pass), `THREE.RGBELoader` (HDR environment lighting). Not Babylon,
  not Unity, not pre-rendered sprites.
- **Framework: React** (`"react"`, `"react-dom"` in bundles) inside a **Next.js** shell at
  `design.idearoom.com`; the branded deployment is embedded on Lester's WordPress-style
  marketing page and also runs standalone on the `mylesterdesign.` subdomain.
- **Pricing/config model runs client-side** — the bundle contains the whole pricing pipeline
  (`price * quantity` accumulation, `priceMetadata`, per-section BoM-ish summing, ZIP-based
  vendor regions `ADD_VENDOR_REGION_ZIP_CODE`, "Auto-select based on ZIP code", deposit and
  Adyen checkout code paths).
- **Load weight (measured on the wire):** three JS bundles served pre-gzipped from S3 —
  `idearoom.bundle.js` **2.71 MB gz** (9.87 MB raw), `vendor.bundle.js` **1.66 MB gz**
  (6.02 MB raw), plus runtime + Next shell ≈ **~4.5 MB gz of JavaScript before models and
  textures**.

### C. UX flow

- Marketing page → external app (new tab) → design in 3D → **"Save"** (save-design dialog;
  the platform has account/saved-designs flows) → **"Submit for Quote"**.
- **No instant price for Lester customers.** Lester's own copy: submit the design and "your
  local Lester Buildings Dealer/Rep will contact you **within 72 hours**"
  (`https://www.lesterbuildings.com/mylester-design/`,
  `https://www.lesterbuildings.com/planning/get-a-building-price/` — "All planning, pricing
  and construction services are provided by your local Lester Dealer").
- The IdeaRoom *platform* supports live price panels, ZIP pricing, deposits and online
  checkout (all present in the bundle strings: "Deposit Amount Due Now", "Checkout",
  "Delivery ZIP:"), so hiding price is a Lester **business choice**, not a platform limit.
  **[inference from bundle capability vs. observed Lester flow]**
- Nice pattern worth adopting: **"Click here to copy design link"** — design state shareable
  by URL.

### D. Weaknesses

- **Price is never shown.** Design for 20 minutes, then wait up to 72 hours for a dealer call.
- Dealer-coverage dependency (38 states per their page); quote quality varies by dealer.
- ~4.5 MB gz JS before 3D assets; heavy for rural-broadband/4G buyers of pole barns.
- The configurator lives off-domain (new tab / iframe), splitting analytics and trust.
- No BoM or drawing shown to the customer at any point (nothing in the public flow).

---

## 2. Tuff Shed — tuffshed.com/configure

### A. Who built it — **KBMax, now Epicor CPQ** (verified)

1. `https://www.tuffshed.com/configure` is a first-party Next.js page whose chunk config
   embeds the vendor host: `kbmax:{host:…??"https://tuffshed.kbmax.com", configuratorId:49,
   userRole:"Customer @ TuffShed.com"}` (observed in `/_next/static/chunks/*.js`).
2. Vendor's own case study: "Tuff Shed Quote to Cash Achieved with KBMax & Salesforce" —
   `https://kbmax.com/customer-stories/tuffshed` (4,000+ unique configurator users/day,
   Salesforce CPQ integration).
3. Press: "Tuff Shed selects KBMax for 3D Configurator" (Dec 2017) —
   `https://www.benzinga.com/pressreleases/17/12/p10896866/tuff-shed-selects-kbmax-for-3d-configurator`.
   KBMax was acquired by Epicor (product now "Epicor CPQ").

### B. Tech stack (observed)

- **Shell: Next.js (Turbopack builds) + React** on tuffshed.com; Storyblok CMS, Sentry,
  Salesforce chat, Cloudflare Turnstile.
- **Configurator: KBMax embedded viewer** injected into a `configurator-embed-wrapper` div
  (full-viewport `100dvh` layout) from `tuffshed.kbmax.com`. KBMax's viewer is real-time
  WebGL with a rules/pricing engine driven server-side by their CPQ (Salesforce per case
  study); exact render library is theirs, not observable from the shell. **[inference:
  real-time 3D per vendor marketing and case study; not sprites]**
- Commerce strings in the shipped chunks: `ADD_TO_CART`, `CHECKOUT`, `"Save Quote"`,
  `"Processing your quote…"`, `begin_checkout` GA event — this is a **transactional**
  configurator (factory-direct order with deposit), not just a lead form.
- **Load weight (measured):** the `/configure` route references 16 first-party chunks
  totaling **4.8 MB raw JS** before the KBMax viewer and its 3D assets load on top.
  (KBMax host rejects non-browser probes — 405 — so viewer weight not measured.)

### C. UX flow

- **Location gate first**: page shows "Delivery Location … Resolving your location…" before
  the design experience; pricing and product availability are market-specific.
- Then building category ("Design Your TUFF SHED - Sheds & Garages") → size/style →
  options in the 3D viewer with **live pricing** → **Save Quote** (contact capture
  **[inference]**) → **online checkout** with deposit, or handoff to a sales consultant.
- Clicks to first visible price: location + category + model selection ≈ **4–8 interactions**
  before a configured price is on screen. **[inference from page structure; not click-tested
  in a browser]**
- Mobile: responsive shell (`100dvh`, Tailwind breakpoints observed). Viewer performance on
  mobile untested.

### D. Weaknesses

- **Hard location wall** before you see anything — the single biggest drop-off risk.
- Heavy shell (4.8 MB JS) *plus* a CPQ viewer; two vendors' worth of payload.
- Save Quote appears to require contact info mid-flow **[inference]**; promotional modal
  (FREE PAINT interstitial) fires before design.
- No customer-facing BoM or drawing; you buy a picture and a price.
- Configurable scope is catalog-bound (their products), fine for them, but no spec-upload
  or custom-dimension escape hatch.

---

## 3. Deckorators (UFP Industries) — three disconnected tools

### A. Who built them — **Chameleon Power** (designer, verified) + livesiteapp.com (visualizer) + in-house calculator

1. **3D Deck Builder / Deck Designer**: `deckorators.com/pages/3d-deck-builder` "Start
   Designing" → `http://deckorators.chameleonpower.com/` — **Chameleon Power** (visualization
   vendor, chameleonpower.com).
2. **Deck Visualizer** (photo-based): `deckorators.com/pages/deck-visualizer` sets
   `iframe.src = "https://deckorators.livesiteapp.com"` (observed inline JS). The
   `livesiteapp.com` vendor is unbranded white-label (dashboard.livesiteapp.com in its
   bundle); identity not publicly established. **[unresolved]**
3. **Deck Cost Calculator**: first-party page on their Shopify-based site
   (`deckorators.com/pages/cost-calculator`).
   Press context: UFP/Deckorators announced the designer + cost calculator combo —
   `https://www.poolmagazine.com/contractors-and-builders/deckorators-deck-designer-lets-you-start-dream-building-immediately/`,
   `https://lbmjournal.com/deckorators-deck-designer/`.

### B. Tech stack (observed)

- **Deck Designer is a Unity WebGL build** — the page is the stock Unity loader template
  (`unity-container`, `unity-canvas`, `Builds.loader.js`, `.unityweb` files).
  **Measured payloads (HTTP HEAD, gzipped on the wire):**
  - `Builds.data.unityweb` — **8.83 MB**
  - `Builds.wasm.unityweb` — **15.44 MB**
  - `Builds.framework.js.unityweb` — 100 KB; loader 47 KB
  - **≈ 24.4 MB compressed download before the designer is interactive.**
- Container is hard-classed `unity-desktop` with `user-scalable=no`; no mobile variant in
  the served page → effectively **desktop-first** 3D. **[inference]**
- **Deck Visualizer**: Vue 3 SPA (Vue error-reference strings in `index-*.js`, 272 KB entry
  bundle), photo-upload based ("Upload Your Own Photo" flow also present in the Unity page)
  — visualization on your own deck photo, not parametric 3D.
- **Cost Calculator**: server-rendered page + light JS; no 3D.

### C. UX flow

- **Cost Calculator (the only instant-price path):** 4 labeled steps — "1. Size → 2. Decking
  → 3. Railing → 4. Results". Size has preset common sizes; result is an **instant on-page
  estimate range** (observed template: "Your Estimate: $1,500–$86,000" bounds) — **materials
  only**, explicit disclaimer that labor/permits/stairs/lighting are excluded.
  A **detailed breakdown is email-gated** ("Email Detailed Results"), and the real quote is a
  handoff: "For a precise quote, please consult a Deckorators Certified Professional."
- **Designer (Unity):** wait through a ~24 MB load, design in 3D, includes a project cost
  calculator per press; separate origin, separate session from the calculator and visualizer.
- **Visualizer:** upload a photo, swap products; no pricing.
- Clicks to a number in the calculator: ≈ **6–9 interactions** (size fields/preset +
  substructure + decking line + railing line + 2 "Next" + "See Results"). To a *useful*
  number (detailed, delivered): email gate + contractor consult.

### D. Weaknesses

- **Three disconnected tools** (design ≠ price ≠ visualize); no single source of truth.
- The only true 3D experience costs **~24 MB** and is desktop-oriented Unity WebGL.
- The instant estimate is a **wide materials-only range**; detail is email-gated; labor and
  the actual buildable quote are outsourced to a contractor network.
- No BoM/drawing coupling; the calculator's math and the designer's model are separate
  systems.

---

## 4. Scorecard

Legend: ✅ we lead · ⚠️ parity/mixed · ❌ we trail. MVS numbers measured from
`/home/user/mvs-store/dist` (built) and `src/views/Screen.tsx`.

| Criterion | Lester (IdeaRoom) | Tuff Shed (KBMax/Epicor) | Deckorators (Chameleon + calc) | **MVS today** | Verdict |
|---|---|---|---|---|---|
| **Clicks to first price** | ∞ — no price; dealer calls ≤72 hr | ~4–8 (location gate → model → viewer) [inf.] | ~6–9 in calculator; range only | **0** — default config priced at first paint; every control updates it | ✅ |
| **Live price while designing** | No (platform can, Lester doesn't) | Yes, in viewer (CPQ-driven) | No (calculator separate from 3D) | Yes — "Live price — one calculation," shared state across Design/Kit/Drawing/Parts tabs | ✅ vs 2 of 3, ⚠️ parity with Tuff Shed |
| **3D quality** | High — three.js w/ SAO + HDR env | High — KBMax CPQ viewer | High-fidelity but Unity/desktop | Solid three.js scene (lazy-loaded); fewer materials/effects than IdeaRoom's SAO/HDR pipeline | ❌ trail on polish |
| **Mobile** | Responsive web app; heavy JS | Responsive shell; viewer untested | Unity `unity-desktop`, `user-scalable=no` | **PWA** (manifest + service worker), responsive, installable | ✅ |
| **BoM / drawing transparency** | None shown | None shown | Materials list email-gated | **Full parts table with SKUs + parametric S-1 shop sheet from the same variables as the price; printable** | ✅ unique — 0 of 3 do this |
| **Quote friction** | Save → submit → dealer call ≤72 hr | Contact capture at Save Quote [inf.]; checkout available | Email gate for detail → contractor consult | Zero gating until delivery; SMS/email form only to *send* the quote; signed-in users skip it | ✅ |
| **Load weight (wire)** | ~4.5 MB gz JS + assets | 4.8 MB raw shell JS + KBMax viewer | **~24.4 MB gz** (Unity) for 3D; calc light | **~287 KB gz total** (150 KB gz initial + 136 KB gz lazy three.js scene + 8 KB CSS) | ✅ 15×–85× lighter |

Where we genuinely trail: **3D scene polish** (IdeaRoom ships ambient occlusion + HDR
lighting; KBMax is a mature viewer), **transactional depth** (Tuff Shed takes deposits and
sells online; our quote delivery is prototype — `Screen.tsx` notes "email/SMS delivery
connects at launch"), and **catalog breadth** of configurable options.

---

## 5. Beat them by 10%+ — top 5 upgrades, ranked by impact/effort

1. **Ship the quote as a PDF with the S-1 drawing attached — none of the three do it.**
   We already render a print-ready parametric S-1 sheet from the same math as the price
   (`ShopSheet` in `Screen.tsx`); today it's browser-print only, and quote delivery itself is
   a stub. Wire the gate to real email/SMS delivery with a generated PDF (quote + S-1 + parts
   schedule). **Measure:** 100% of delivered quotes include a drawing + SKU schedule vs 0/3
   competitors; delivery latency < 60 s vs Lester's 72-hour dealer callback.
   *(Impact: unique differentiator; Effort: low — the sheet exists, add server-side PDF +
   send.)*

2. **Guarantee "price in ≤2 interactions" and instrument it.** We already price the default
   config at first paint — lock that in as a product SLO before it erodes: price visible with
   zero interactions on load, and any parameter change re-prices in <100 ms. Add a
   time-to-first-price analytic event. **Measure:** TTFP ≤ 5 s on 4G vs Tuff Shed's
   location-gated ~4–8 interactions and Lester's never; regression-tested in CI.
   *(Impact: the headline sales stat; Effort: trivial — instrumentation + a CI budget.)*

3. **Hold sub-2s-to-interactive on 4G with a CI bundle budget.** At ~287 KB gz we are
   15× lighter than IdeaRoom and ~85× lighter than Deckorators' Unity designer. Set a hard
   budget (initial ≤ 200 KB gz, total ≤ 400 KB gz incl. scene) enforced in CI so feature
   growth never gives the advantage back. **Measure:** Lighthouse TTI < 2 s on "Slow 4G"
   throttle vs measured competitor payloads (4.5 MB / 4.8 MB+ / 24.4 MB); budget check red
   on any PR that exceeds it. *(Impact: mobile close-rate + a marketable number; Effort: low.)*

4. **Shareable design links + agent/quote API.** IdeaRoom's best pattern is "copy design
   link"; nobody exposes a public quote API. Serialize the config (`QuoteConfig` is already
   8 flat fields) into the URL so any design is a link, and expose the same one-calculation
   pricing through the agent API so a quote can be produced programmatically (counter staff,
   SMS bot, partner sites). **Measure:** any design reproducible from a URL in 1 click;
   API returns priced BoM JSON in < 1 s; 0 of 3 competitors offer either.
   *(Impact: distribution + the agent story; Effort: medium-low — state is already
   centralized.)*

5. **Optional ZIP refinement instead of a location wall, with delivered price live.**
   Tuff Shed gates everything behind delivery location; Lester gates behind a dealer. Invert
   it: always show the ex-works price instantly, add an *optional* ZIP field that folds a
   freight adder into the same live calculation — no gate, no modal. **Measure:** delivered
   price visible in ≤2 interactions with 0 required personal data vs Tuff Shed's mandatory
   location resolve; quote-start abandonment tracked before/after.
   *(Impact: converts their biggest weakness into our proof point; Effort: medium — freight
   table + one input.)*

Honorable mention (where we trail): a **scene-polish pass** — IdeaRoom ships SAO + HDR
environment lighting in three.js; adopting the same techniques (they're stock three.js
passes) in our lazy `ScreenScene` chunk closes the only visual-quality gap, budget
permitting (upgrade must fit inside the CI budget from #3).

---

## Evidence index

- Lester: `lesterbuildings.com/mylester-design/` · `mylesterdesign.lesterbuildings.com`
  (loads `assets.carportview.com/production-carportview.js`) · `config-js.idearoom.com` →
  S3 `js.idearoom.com` bundles (three.js + React symbols, pricing/deposit/ZIP strings) ·
  `design.idearoom.com/lesterbuildings` ("IdeaRoom 3D Configurator") ·
  `lesterbuildings.com/planning/get-a-building-price/` ·
  `appsruntheworld.com/customers-database/products/view/idearoom`
- Tuff Shed: `tuffshed.com/configure` chunk config (`tuffshed.kbmax.com`, configuratorId 49)
  · `kbmax.com/customer-stories/tuffshed` · Benzinga PR 2017 (KBMax selection) · chunk
  strings (`Save Quote`, `CHECKOUT`, `begin_checkout`)
- Deckorators: `deckorators.com/pages/3d-deck-builder` → `deckorators.chameleonpower.com`
  (Unity WebGL loader; `.unityweb` HEAD sizes) · `deckorators.com/pages/deck-visualizer` →
  `deckorators.livesiteapp.com` (Vue SPA) · `deckorators.com/pages/cost-calculator`
  (4-step wizard, estimate range, email gate, pro-consult disclaimer) · poolmagazine.com &
  lbmjournal.com Deck Designer coverage
- MVS: `/home/user/mvs-store/src/views/Screen.tsx` (one-calculation price/drawing/BoM,
  quote gate, spec upload) · `/home/user/mvs-store/src/pwa.tsx`, `public/manifest.webmanifest`,
  `public/sw.js` · `dist/assets` gzip measurements · `package.json` (`three ^0.185.1`,
  `react ^19.2.8`)
