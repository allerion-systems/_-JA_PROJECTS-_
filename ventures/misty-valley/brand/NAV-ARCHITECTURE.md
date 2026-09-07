# NAV-ARCHITECTURE — Reverse-Engineered IA of Safety-Supply E-Commerce

**Date:** 2026-09-05 · **Method:** live HTML pulls (curl + WebFetch) of each site's homepage, department page, listing page, and product page; Amazon presence verified by web search.
**Scope note (legal line):** this document extracts *patterns only* — taxonomy structure, menu behavior, layout anatomy, and labeling conventions, which are functional vocabulary. Nothing here authorizes, and this document does not recommend, copying any site's visual design, branding, logos, product copy, or photography.

---

## 0. Site Selection & Verification

| Site | Reachable? | Amazon evidence | Selected |
|---|---|---|---|
| **Malta Dynamics** (maltadynamics.com) | Yes (Shopify; full HTML pulled) | Brand storefront `amazon.com/stores/MaltaDynamics` with curated store pages (Harness Accessories, Kits, Hunting Safety) + first-party ASINs (e.g. Temporary Guardrail Post B0921K94RS, Razorback SRL B01I89P5LI) | ✅ |
| **PK Safety** (pksafety.com) | Yes (Shopify; full HTML pulled) | Seller storefront "PK Safety Supply" — Amazon merchant ID `AVPVLR7M1A873` (`amazon.com/s?i=merchant-items&me=AVPVLR7M1A873`) | ✅ |
| **Full Source** (fullsource.com) | Yes (custom platform; full HTML pulled) | Brand storefront `amazon.com/stores/FullSource` incl. a "Safety Vests" store page; house-brand hi-vis listed under the Full Source brand | ✅ |
| GME Supply (gmesupply.com) | **Blocked** — HTTP 403 to automated fetch | (not pursued) | — |
| Northern Safety (northernsafety.com) | Yes, but has been absorbed into the **Würth** platform (header is Würth-branded) — no longer a clean independent reference | — | — |
| White Cap / Galeton / SafetyGearPro | Not needed; three matches confirmed first | — | — |
| **Control:** Zoro (zoro.com) | **Blocked** — hard 403 (browser and bot UAs) | | — |
| **Control:** Grainger (grainger.com) | **Blocked** — serves a "Whoops, we couldn't find that" bot-wall shell (18 KB) to all automated agents | | — |
| **Control substitute: McMaster-Carr** (mcmaster.com) | Yes — homepage + Hard Hats listing HTML captured | n/a (control is for scale patterns, not Amazon criterion) | ✅ control |

Both named giants block automated fetching; per instructions the control was substituted with McMaster-Carr, the canonical giant-catalog IA (26 departments, ~700k SKUs) and the strongest available example of a persistent left-rail taxonomy.

---

## 1. Header Anatomy (element order, from live HTML)

### Malta Dynamics
1. **Utility strip:** promo banner ("Free Delivery and Free Returns\*") + About / Customer Support links (Careers, Satisfaction / Shipping / Return / Warranty Policy).
2. **Main bar:** Logo → Search (with typed-ahead "Most searched products / Most searched keywords" panels) → **Phone `(855) 781-9917` displayed prominently** → Sign in / Register → "Cart 0".
3. **Department bar:** 7 top-level menu items (below).

### PK Safety
1. **Utility strip:** "Expert Guidance Monday–Friday, 6:30am–4pm PST. **Call Now!**" + phone `(800) 829-9580` + **"REQUEST A QUOTE"** button. Human-expert framing is the strip's whole job.
2. **Main bar:** Logo (with trade-credibility tagline "The Worker Safety Specialists… since 1947") → Search → "Log in" → "Basket".
3. **Department bar:** 7 items. Footer/utility also exposes **"Submit a Tax Exemption"** (`/pages/submit-a-tax-exemption`).

### Full Source
1. **Utility strip #1:** free-shipping threshold + code → **phone `904-296-2240`** → weekend email link.
2. **Utility strip #2:** "30 Day Returns" · **"Apply for Credit"** · "99¢ Logo Printing" banner.
3. **Account row:** My Account dropdown, Track Order, phone, email.
4. **Main bar:** Logo → Search → Cart.
5. **Department bar:** 5 items.

### Control — McMaster-Carr
Header is nearly bare: **"BROWSE CATALOG"** trigger → **phone** (region-localized, e.g. `(630) 833-0300`) → "Email Us" (with reply-time promise "We will reply to your message within an hour") → **Punchout** (procurement-system integration link) → Log in / Create login → **"Order"** and **"Order History"** as first-class header objects.

**Shared pattern:** every one of the four shows a **telephone number in the header** — trade buyers are assumed to call. Three of four put a human-help promise next to it. Account + cart sit far right; quote/credit/tax-exempt live in the **utility strip or account area, never in the department menu**. The giant adds "Order" (quick order pad) and "Punchout" as header-level objects — ordering machinery outranks marketing.

---

## 2. Department Trees

### Malta Dynamics — 7 top-level items (verbatim)
`Mobile Fall Protection · Rentals · Fall Protection · PPE · Hunting Safety · Resources · Deals`

Notable: **the flagship manufactured line ("Mobile Fall Protection" = their XSERIES carts) is the *first* department, ahead of the generic catalog**; Rentals (an adjacent business line) is its own top-level item, not a filter.

**Fall Protection expanded (full depth, verbatim):**
- Harnesses → Harnesses · Harness Accessories
- SRLs → Overhead SRLs (Class 1) · Leading Edge SRLs (Class 2)
- Anchors → Steel · Concrete · Roofing
- Lanyards & Connectors → Lanyards · Connectors · Carabiners
- Confined Space → Rescue Kit · Tripod · Tripod Accessories
- Kits → Roofer's Kit · Compliance Kits · Personal Fall Arrest Safety Kit
- Safety → Warning Line · Guardrails
- Horizontal Lifelines · Vertical Lifeline Assemblies · ⌁ Deals ⌁

**PPE expanded:** Head Protection → Safety Helmets · Hard Hats; then Hearing Protection · Eye Protection · Hand Protection · Hi-Vis Clothing · Deals.
**Depth:** 3 levels (department → subcategory → sub-subcategory) then product list. No counts shown in menus.

### PK Safety — 7 top-level items (verbatim)
`Gas Detection · Confined Space · Fall Protection · Respirators & Filters · Safety Equipment · Blog · Contact Us`

**Fall Protection expanded (full depth, verbatim):**
- Carabiners and Anchorage → Carabiners · Roof Anchors · Tie-Off Anchors
- Harnesses and Accessories → Harnesses · Boson's Chair and Workseats · Harness Accessories
- Lanyards → Positioning Lanyards · Shock Absorbing Lanyards · Twin Leg Lanyards
- Vertical Lifeline Systems → Ladder Safety Systems · Rope Grabs
- Tool Fall Protection → Buckets
- Self-Retracting Lifelines & Personal Fall Limiters · Horizontal Lifeline Systems · Rescue and Descent Systems Equipment

Fall Protection landing shows **318 results** at the department level. Every mega-menu column ends with a "Go to ⟨subcategory⟩" catch-all link. **Depth:** 3 levels before product list. PPE-type goods live under one department, "Safety Equipment" (Safety Gloves → 11 glove types; Workwear → FR/Arc/Hi-Vis/etc.; Hearing Protection; First Aid; Lockout Tagout…).

### Full Source — 5 top-level items (verbatim)
`Safety Supplies · Apparel · Marking & Barrier · Brands · Logo Printing`

**Safety Supplies expanded:** Safety Vests → Vest Styles · Vest Colors · **ANSI Safety Vests** · Custom Printed · Vest Brands; Hard Hats → Brands · Colors · Styles · Custom Printed · Designer · Accessories; Safety Glasses; Work Gloves → Brands · **Glove Type · Glove Features · Glove Uses** · Glove Colors; Personal Safety; Hearing Protection → Ear Muffs · Ear Plugs · **Protection by NRR** · Brands.

Distinctive move: **attributes are pre-built as browsable categories** (ANSI class, NRR rating, color, style) rather than left as filters — e.g. `/ansi-class-2-safety-vests/` is a real landing page 4 levels deep (Safety Supplies → Safety Vests → ANSI Safety Vests → ANSI Class 2). **Depth:** 3–4 levels; "Brands" is itself a top-level department.

### Control — McMaster-Carr
**26 top-level departments**, one flat alphabetized list (Abrading & Polishing … Safety Supplies … Suspending), identical everywhere. No mega-menu marketing: the catalog **is** the navigation, and the same "BROWSE CATALOG" rail renders on every page including listing pages. Depth to a buyable table: 2–3 clicks.

**Shared pattern:** 5–7 top-level departments on the specialists (26 on the giant); safety-relevant trees run exactly **3 levels deep** before a product list; PPE is always grouped under **one** department (Malta "PPE", PK "Safety Equipment", Full Source "Safety Supplies"), never scattered as 4–5 top-level items.

---

## 3. Left-Rail Behavior by Page Type

| Page type | Malta Dynamics | PK Safety | Full Source | McMaster (control) |
|---|---|---|---|---|
| Homepage | No left rail — mega-menu top nav + merchandised bands | No left rail — same | No left rail — same | **Persistent left rail = the 26-department catalog list** |
| Department landing | No rail; subcats shown in the menu / as tiles | Listing grid + "Filter & Sort" panel; subcats via menu | **Subcategory tile page** (Customization, ANSI Safety Vests, Vests for Women, …) — no facets yet | Rail = catalog list + spec filters |
| Category / product list | Facet panel (see §4) + grid | "Filters / Filter & Sort" collapsible panel + grid, 318 results | **Left rail = breadcrumb trail + refine groups ("Brand", "Series")** + grid | Rail = catalog list + full **"Filter by"** spec stack |
| Product page (PDP) | **No left rail** — full-width; breadcrumb + buy box | **No left rail** — full-width | **No left rail** — full-width; breadcrumb (Safety Vests → product); tabbed buy area | Spec table is the page; catalog rail persists |

**Shared pattern:** on the specialists the left column is *earned by the page type*: nothing on home, filters on listings, **nothing on PDP** (PDP width is spent on spec and the buy box). Only the giant keeps a permanent taxonomy rail — which works because its taxonomy *is* its homepage.

---

## 4. Facets on a Listing Page

- **Malta Dynamics `/collections/harnesses`** (Shopify native filtering, verbatim param names): `harness_style`, `d_ring_configuration`, `belt`, variant `harness_size`, and `price.gte/lte` (range control). I.e. **domain-specific spec facets + price** — not generic tag soup. Checkbox groups + price range slider.
- **PK Safety `/collections/fall-protection`**: filters sit behind a "Filters / **Filter & Sort**" control (Shopify `facet-filters.js` + `price-range.js` — checkbox groups + price range), collapsible panel pattern; result count ("Show 318 results") always visible.
- **Full Source `/ansi-class-2-safety-vests/`**: because attributes are pre-built as categories, the refine rail is thin — groups observed: **"Brand"** and **"Series"** — with the taxonomy itself doing the work of class/color/style filtering.
- **Control McMaster `Hard Hats`** (verbatim "Filter by" groups, in page order): Brim Style · Color · Adjustment Mechanism · **Hard Hat Class (C / E / G)** · Number of Suspension Points · **Hard Hat Impact Type (I / II)** · Material · **Specifications Met (ANSI S3.19, ANSI/ISEA Standard, ASTM, CAN/CSA Z94.1, EN, ISO)** · Maximum/Minimum Hat Size · Chin Strap Included · Mounting Slots · Application · Performance · Garment · Weight · Coverage · REACH / RoHS / USMCA compliance. All plain link/checkbox lists.

**Shared pattern:** the winning facets are **the standard and the class** (ANSI type/class, SRL class, cut level, NRR), then brand, then size, then price. McMaster proves "Specifications Met" is a first-class filter at scale; Full Source proves the same attribute can be a *pre-built category* for SEO. MVS already stores `std` and `osha` per SKU (`data.ts`) — that's the facet source, as `ODOO_MAP` itself notes ("build it as data not text").

---

## 5. Mobile

- **Malta Dynamics:** hamburger → slide-out **menu drawer** (markers in HTML: `hamburger`, `menu-drawer`, `Drawer`) with the same 7 departments as accordion levels; sticky header keeps search + cart + phone.
- **PK Safety:** hamburger "Menu" → **drawer** with accordion department tree (Gas Detection ▸ … three levels deep in the drawer).
- **Full Source:** dedicated `mobile-menu` / `mobile-nav` structure — hamburger drawer, department accordion, `m-hide` classes strip the desktop refine rail (filters become a toggle button: `btn-filter toggle-refines`).
- **Control McMaster:** same single catalog list, collapsed behind BROWSE CATALOG.
- **Bottom tab bars: none.** All four are browser-first websites; none uses app-style bottom tabs.

**Shared pattern:** hamburger → drawer → accordion tree, always mirroring the desktop taxonomy 1:1; filters collapse into a full-screen "Filter & Sort" sheet.

---

## 6. Commerce Furniture

| Feature | Malta | PK Safety | Full Source | McMaster |
|---|---|---|---|---|
| Phone in header | ✅ prominent | ✅ + "Call Now!" + hours | ✅ (two strips) | ✅ + email w/ SLA |
| Quote request | Via contact | **"REQUEST A QUOTE"** button in utility strip + dedicated page | **"Request a FREE quote"** as a PDP *tab* (tab set: basic add-to-cart · bulk · freequote · customization · reviews · returns · upcs) | Quote-by-order model |
| Bulk / volume | Kits & BYO-system builders | Collection-level kits | **"bulk" tab on PDP** + logo-printing minimums | Quantity price table native |
| Credit / net terms | — | — | **"Apply for Credit"** in utility strip | Account-based terms |
| Tax exempt | — | **"Submit a Tax Exemption"** page | — | Account-level |
| Sign-in-for-price | Standard retail pricing | Standard | Standard | Log in → contract pricing |
| Quick order / reorder | — | — | "Track Order" in header | **"Order" + "Order History" in header; Punchout** for procurement systems |

**Shared pattern:** quote, credit, and tax-exempt are **utility-strip and account-page objects**; only the PDP gets a quote *tab* (Full Source) because that's where the bulk decision happens. The giant treats reorder ("Order", "Order History", Punchout) as header-level: for repeat trade buyers, *the reorder path outranks the browse path*.

---

## 7. Recommended IA for Misty Valley Supply

Grounded in `/home/user/mvs-store/src/App.tsx` (the `NAV` array, lines 22–44) and `/home/user/mvs-store/src/data.ts` (`CATEGORIES`, `SCREEN_PARTS`, `LISTINGS`). Current state: the desktop left rail is an **app-view switcher** (Home, Dashboard, Catalog, Job Site Earth, Roof Screens, The Yard, My Account, Users & Roles, Operations, Agent API); product departments only exist as the 7 flat `CATEGORIES` inside the Shop view; mobile is a 5-slot bottom bar (`bar: true` → home, shop, earth, screen, account).

### 7.1 The department tree (left rail of Shop, and the drawer)

**Recommended departments, in order:**

```
CATALOG
├── 1. Roof Screens          (shop fabrication — flagship first)
│     ├── Screen Kits (configured)
│     ├── Frames & Bases            ← MVS-RSF-SC3, MVS-RSB-SQ
│     ├── Panels                    ← MVS-RSP-26, MVS-RSP-29 (+ perforated)
│     ├── Hat Channel & Fasteners   ← MVS-RSH-HAT, MVS-RSS-STC
│     └── Engineering & Shop Drawings ← MVS-RSE-SHP
│         (MVS-RSA-ANC cross-listed under Fall Protection ▸ Anchors)
├── 2. Fall Protection
│     ├── Harnesses                 ← MVS-FH-5PT
│     ├── Self-Retracting Lifelines ← MVS-SRL-11
│     ├── Lanyards                  ← MVS-LY-SA6
│     ├── Anchors & Connectors      ← MVS-ANC-DL, MVS-RSA-ANC
│     └── Kits                      (empty today; pre-build — every reference sells kits)
├── 3. Roof Safety
│     ├── Non-Penetrating Guardrail ← MVS-RG-1000, MVS-RG-BASE
│     ├── Warning Line              ← MVS-WL-600
│     ├── Skylight & Hole Covers    ← MVS-SKY-48 (+ MVS-HOLE-4 cross-listed)
│     └── Roof Anchors              (cross-list of MVS-ANC-DL)
├── 4. Guardrail & Edge Protection
│     ├── Rails & Posts             ← MVS-YG-10, MVS-YG-POST
│     ├── Toe Boards                ← MVS-YG-TOE
│     └── Hole Covers               ← MVS-HOLE-4
└── 5. PPE
      ├── Head Protection           ← MVS-HH-C1, MVS-HH-T2V, MVS-HH-BRIM
      ├── Eye Protection            ← MVS-SG-CLR, MVS-SG-SMK, MVS-GG-SEAL
      ├── Hand Protection           ← MVS-GL-A4, MVS-GL-A6, MVS-GL-LEA
      ├── Hi-Vis Apparel            ← MVS-VS-C2, MVS-VS-C3, MVS-VS-O1
      └── (reserved: Hearing · Respiratory · Foot)

MARKETPLACE
└── 6. The Yard               (Equipment · Surplus · Crews · Trucks · Tools · Wanted — LISTING_KINDS as its own facet set)
```

**Justifications, each pointing at a reference:**

- **Flagship fabrication first.** Malta Dynamics puts *Mobile Fall Protection* — its own manufactured line — as department #1, ahead of the generic catalog. Roof Screens is MVS's exact analog (the Lee Street hero, 71% markup). Keep the `screen` NAV entry, but rank it first in the *catalog* group rather than fourth in an app list.
- **Collapse Head/Eye/Hand/Hi-Vis into one "PPE" department.** All three references group PPE under a single department (Malta "PPE", PK "Safety Equipment", Full Source "Safety Supplies"). Four of MVS's seven `CATEGORIES` are PPE; at 500 SKUs those four alone would crowd out the identity departments. One "PPE" node with 4 subcategories (and reserved slots for Hearing/Respiratory/Foot — PK and Full Source both carry those) keeps the top level at 5–6 forever. `CATEGORIES` in `data.ts` should grow a `parent` field rather than stay flat.
- **Pre-build the subcategory level now.** PK's Fall Protection is 3 levels deep over 318 products; Malta's over ~100. MVS's tree above is 2 levels over 24 SKUs — thin but *shaped correctly*, so category URLs, breadcrumbs, and the drawer accordion don't need re-architecting at 500 SKUs. Empty subcats ("Kits") can render as "coming soon" tiles or stay hidden until first SKU.
- **The Yard is top-level nav, not a catalog department.** Malta gives *Rentals* — an adjacent business line with different inventory mechanics — its own top-level menu item rather than folding it into products. The Yard (used listings, Stripe Connect sellers, `LISTING_KINDS`) is the same shape: keep the `yard` NAV entry in the rail, under a visual divider ("Marketplace"), never inside the department tree, never in the footer — it's a traffic asset, and Malta shows adjacent lines earn top-level placement.
- **Facets from the data MVS already has.** McMaster filters hard hats by "Hard Hat Class C/E/G", "Impact Type I/II", "Specifications Met (ANSI/ISEA…)"; Malta filters harnesses by `harness_style`/`d_ring_configuration`/`size`/`price`; Full Source pre-builds `/ansi-class-2-safety-vests/`. MVS's `std` and `osha` fields per product are exactly this. Recommended facet order on listing pages: **Standard/Class → OSHA cite → Brand/Supplier → Size → Price (range)**. Later, Full-Source-style pre-built attribute pages ("ANSI Cut Level A4 Gloves", "Class 2 Hi-Vis") become free SEO landings from the same fields.
- **Left rail by page type.** Follow the specialists, not the giant: home = merchandising, no taxonomy rail; Shop/listing = department tree + facets in the left column; **PDP = full-width, breadcrumb only** (all three specialists strip the rail on PDP; MVS's `ProductView` already behaves this way — keep it).

### 7.2 Where each app destination lives (concrete `NAV` moves)

| `NAV` entry (App.tsx) | Today | Recommended home | Reference pattern |
|---|---|---|---|
| `home` | rail + bar | unchanged | — |
| `shop` (Catalog) | rail + bar | rail top of CATALOG group; its left column *becomes* the department tree above | McMaster's persistent BROWSE CATALOG rail; PK/Malta listing rails |
| `screen` (Roof Screens) | rail + bar | **first department in the CATALOG group** (still a bar tab) | Malta puts Mobile Fall Protection first |
| `yard` (The Yard) | rail only, below account | rail, own **MARKETPLACE** divider directly under the catalog group | Malta's top-level "Rentals" |
| `dash` (Dashboard) | rail (auth-gated) | **header utility strip** — it's already reachable via the "name · role" button (App.tsx line 116); remove from the rail to keep the rail product-first | McMaster header: Order/Order History; all four keep account objects in the header, not the menu |
| `account` | rail + bar | header (exists) + bar; in-rail only inside a rail-bottom **WORKSPACE** group | Utility-strip account pattern on all four |
| `earth` (Job Site Earth) | rail + bar | keep as a bar tab and a rail entry under WORKSPACE — it's a differentiator with no reference analog; don't let it displace a catalog slot | (novel; nearest analog is content/Resources placement) |
| `users` (Users & Roles) | rail (perm-gated) | rail-bottom WORKSPACE group, or a card inside Account | References keep admin inside account areas |
| `ops` (Operations) | rail (perm-gated) | rail-bottom WORKSPACE group | Same |
| `agents` (Agent API) | rail | **footer + a card on the Account page** — this is MVS's punchout; McMaster links "Punchout" from header/account, never from the product menu | McMaster "Punchout" |

Rail becomes three ruled groups: **CATALOG** (Roof Screens, Fall Protection, Roof Safety, Guardrail & Edge Protection, PPE), **MARKETPLACE** (The Yard), **WORKSPACE** (Dashboard/Earth/Users/Ops, perm-gated — the existing `need`/`auth` filtering already does this correctly).

### 7.3 Header additions (from §1's universal pattern)

- **Put a phone number in the header.** All four references do; MVS's header has none. Slot it in the utility strip next to Branch (the branch picker is already the right instinct — "call your branch" beats an 800 number).
- Keep "Open a credit account" in the utility strip (matches Full Source "Apply for Credit" and Northern/Würth "Net 30 terms available"). Add **"Request a Quote"** beside it (PK pattern) and a tax-exemption submission inside Account (PK pattern).
- The existing "Sign in to see your contract price" in the cart drawer is exactly the trade-site convention — keep, and echo it on listing cards.

### 7.4 Mobile

References are unanimous: hamburger → drawer → accordion tree mirroring desktop 1:1, with filters in a full-screen sheet. MVS is a PWA with a 5-slot bottom bar — a *better* fit for its app destinations, so keep the bar, but make it: **Home · Shop · Screens · Earth · Account** (drop nothing; this is the current `bar` set). The reference pattern applies *inside* Shop: the department tree renders as an accordion drawer (or top-of-page chips at 24 SKUs), and facets collapse behind one "Filter & Sort" button with a visible result count — PK's exact listing furniture. The Yard, Dashboard, Users, Ops stay reachable from the footer link block (already implemented for non-bar entries in App.tsx lines 237–241).

---

## Appendix — Evidence Files (scratchpad)

`pk_home.html`, `pk_fall.html` (PK Safety, 318-product fall listing); `maltadynamics.com.html`, `md_harness.html`, `md_pdp.html` (Malta); `fullsource.com.html`, `fs_vests.html`, `fs_ansi.html`, `fs_pdp.html` (Full Source); `83810eec.html` / `hh.html` (McMaster homepage / Hard Hats listing). Zoro: HTTP 403 on all attempts; Grainger: bot-wall error shell on all attempts; GME Supply: HTTP 403.
