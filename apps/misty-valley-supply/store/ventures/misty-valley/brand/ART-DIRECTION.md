# Misty Valley Supply — Art Direction & UI System

**Target codebase:** `/home/user/mvs-store` (React 19, Tailwind 3.4, HSL custom properties in `src/index.css`)
**Status:** Specification. Every value here is implementable as written.
**Date:** 2026-09-05

---

## 0. Research basis

I fetched and inspected the shipped production assets rather than working from memory. What follows cites observed values, and I have noted where a site blocked retrieval.

| Source | What I actually retrieved |
|---|---|
| homedepot.com | Live PIP for SKU 202093385 (steel stud) + its compiled stylesheet `assets.thdstatic.com/experiences/fusion-gm-pip-desktop/Page.7b7c706d6a644e00001b.css` (232 KB). Full token extraction. |
| qxo.com | Live homepage + all 8 compiled Next.js stylesheets (183 KB combined). Full design-token ramp extracted. |
| grainger.com | Product pages returned 403/`Whoops, we couldn't find that`. Substituted Grainger's own 44-page official *Your Guide to Grainger.com* (procurement.sc.gov mirror), which documents the search, PLP, PDP and pricing model page-by-page. |
| ferguson.com | Category page retrieved via reader proxy. Header/nav/branch architecture observed; PDP blocked. |
| fastenal.com | Category page retrieved via reader proxy. Header/branch/order-pad architecture observed. |
| supplyhouse.com | Retrieved via reader proxy. Header, TradeMaster, tooling nav observed. |
| build.com | Blocked (403 direct, 401 via proxy). Not cited. |

### Observed patterns that drive this spec

**Home Depot — measured, not guessed**

- Brand orange is `#F96302`. Pressed/active orange is `#c14c00`. In-stock and savings green is `#00873C`. Error red is `#D81118`. Rating yellow is `#FFC206`. Ink is `#202020`, secondary ink `#5E5E5E`, panel-2 `#F4F4F4`, hairline `#CCCCCC`/`#BFBFBF`.
- **Corner radius is 3px**, and it is nearly the only radius in the system — 18 occurrences of `border-radius:3px` against 3 of `2px`, 2 of `5px`, 2 of `4px`, 1 of `8px`. Nothing in the product surface is square-cornered.
- **Shadows are almost absent.** The dominant "shadow" is `box-shadow:0 3px #c14c00` — a hard, unblurred 3px offset under the primary button that reads as a physical key travel, not a drop shadow. Real blurred shadows (`0 0 3px #00000040, 1px 0 10px #00000040`) appear only on overlays and flyout menus. Cards on the page are flat with hairlines.
- **The primary button is `height:37px`, `font-size:1.8rem` (18px), Helvetica Neue Bold, `line-height:1em`, `width:100%`.** An 18px button label. Nothing on the page is a 13px button.
- **Type scale (root is 10px, so 1rem = 10px):** the two dominant sizes across the entire PIP stylesheet are `1.4rem` (14px, 67 occurrences) and `1.8rem` (18px, 59 occurrences), then `1.1rem` (11px, 30×), `3rem` (30px, 17×), `2.4rem` (24px, 14×). It is a coarse, large scale.
- **`text-transform:uppercase` appears 8 times in a 232 KB stylesheet**, and the selectors are `.date`, `.write-review-content__add-photo__header`, `.pipCollection-title`. It is never used for functional micro-labels. `letter-spacing` appears three times total: `0`, `.4px`, `-.015em`.
- **Spacing rhythm is a 5px base:** `margin-bottom` values are 2/3/5/8/10/15/20/30, dominated by 10px (28×) and 5px (26×). Gaps are 10/20/25.
- Home Depot's current front end is Tailwind-based with a `sui-` prefix (`sui-gap-4`, `sui-text-4xl`, `sui-px-3`, `sui-col-span-5`). The Tailwind-with-tokens approach this codebase already uses is the correct one; it is the token values and the type discipline that are wrong.
- A `sui-pro` class exists in the shipped PIP — Pro state is a styling variant of the same components, not a separate skin.

**QXO — measured, not guessed**

QXO ships a complete, formally-ramped token system. Extracted primitives:

```
--neutral50  #fafafa   --neutral100 #eeeff0  --neutral200 #dfe2e5  --neutral300 #bfc3c7
--neutral400 #94989c   --neutral500 #84888c  --neutral600 #676b70  --neutral700 #3b3e41
--neutral800 #25272a   --neutral900 #16191c  --black #0a0a0a       --pewter #323640
--qxoprimary500 #004bea  --qxoprimary600 #0039c9  --qxoprimary100 #cbe2fd  --qxoprimary50 #e6f1fe
--success500 #10b981  --success700 #047857  --green700 #047252
--warning500 #f59e0b  --warning100 #fef3c7
--danger500  #ef4444  --danger700  #b61b1b  --danger100 #fee2e2
```

- **QXO's brand accent is blue (`#004bea`) on a navy (`#16296E`) — there is no orange anywhere in it.** The most-repeated color on the homepage is the navy `#16296E` (23 occurrences), then near-black `#0a0a0a` (22).
- **Radius is 4px** (9 occurrences, dominant), with pill radii reserved for badges.
- **The only card shadow in the whole system is `1px 2px 5px 0 var(--colors-neutral-300)`** — a 5px blur of a light gray. Nothing heavier exists.
- Typefaces are Proxima Nova and Harmonia Sans Pro (with Titling Gothic FB Condensed surviving from the acquired Beacon brand), and **Inter** is loaded on the marketing surface. All are neutral grotesques. No condensed face carries UI text.
- Type sizes cluster at 16px (`1rem`), 18px (`1.125rem`), 14px (`.875rem`), 20px, 24px, then a display jump to 32/34/36/48/60. Letter-spacing is `0` or `-.02em`. Uppercase appears twice in 183 KB.

**Grainger — from their own published product guide**

- *"In the Grainger catalog — you will no longer see prices. That's because on Grainger.com, you can see all your products and discounted pricing online and in real-time."* Contract price is not a decorated variant of list; **for a signed-in account it simply is the price.** List price is not shown alongside it in the primary position.
- *"Use the left navigation rail to narrow down your search results. **Visual product representation** and numerous attributes can help guide your search."* Grainger's own guide names product imagery as a primary search-narrowing device, alongside attributes.
- Search accepts brand, manufacturer model number, Grainger item number, **competitor item number, cross-reference number, NSN**, or keyword — and shows **category matches in the typeahead as you type**.
- Every search-result row carries both **Add to Cart** and **Add to List**.
- A **view switcher** (grid / list / **table**) exists on the results page.
- A **"View Previously Purchased Products Only"** filter exists at the top of the facet rail.
- The PDP's #2 numbered feature is **"Real-Time Product Availability — check product availability for picking up at a local Grainger branch."** It outranks specs, documents and comparison.
- **Bulk Order Pad**: paste item numbers and quantities straight into a cart.

**Ferguson, Fastenal, SupplyHouse — structural**

- Ferguson's utility strip leads with `You're Shopping **North Charleston, 4711 Rivers Avenue**` — the branch is a named, addressed, persistent object in the header.
- Ferguson's mega-menu categories are **photographic product images served at `w=140`** through an image CDN (`i.ferg-img.com/i/fergusonprod/2178712_primary?fmt=auto&w=140`). Every navigational affordance is a photo, not an icon.
- Fastenal's header carries `My Branch` / `Find a Branch` / `You do not have a local branch selected` as an unmissable empty state, and **`Fast Order Pad`** sits next to `Browse Products` as a peer-level nav item.
- SupplyHouse pins `Your Zip: 29405` and `Free shipping on orders over $99` above everything, and elevates `Reorder`, `Quick Order`, `Saved Carts`, and `Lists` into top-level account tooling.

---

## 1. Diagnosis — five named failures

The client is right. The current build is a competent information architecture wearing a wireframe's clothes. Here is precisely why, with the responsible code.

### 1.1 All-caps micro-labels are the default text style, so nothing can be emphasised

`src/index.css:71`

```css
.lab { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; letter-spacing: .11em; text-transform: uppercase; }
```

`.lab` is used 48 times across `src/views/*` + `ui.tsx` + `App.tsx`. `.disp` — which also forces `text-transform: uppercase` (`index.css:69`) — is used 75 times. Between them, the majority of visible text in the application is uppercased.

Home Depot's entire 232 KB PIP stylesheet contains **eight** `text-transform:uppercase` declarations, none of them on a functional label. QXO's 183 KB contains two. The reason is mechanical, not stylistic: uppercase destroys word-shape, which is the primary cue for scanning. A 10.5px uppercase mono label at `.11em` tracking is roughly a third slower to read than 11px sentence-case Inter, and because *everything* is shouting, the eye has no ranking to follow. This single decision is the largest contributor to the "wireframe / annotation layer" read. `Lab` is being used as a `<dt>`, a button label, a tag, a nav subtitle and a table header — five different jobs, one voice.

**Also responsible:** `ui.tsx:41` (`Btn` base string starts with `disp`, so every button is uppercase condensed), `ui.tsx:28` (`Tag` uses `lab`), `ui.tsx:105–110` (`DataTable` headers use `lab`), `ui.tsx:64–70` (`Field` renders its label through `Lab`).

### 1.2 The product plate is a 62%-scale line drawing, and there are only 18 drawings for 24 SKUs

`src/glyph.tsx` defines 18 marks; `src/data.ts` defines 24 products. `BY_SKU` (glyph.tsx:123) falls through to `BY_CAT` (glyph.tsx:134), so `MVS-RG-1000`, `MVS-YG-10` and `MVS-YG-POST` all resolve to the same `guardrail` mark, and every unmatched roof SKU does too.

`src/views/Shop.tsx:78–82` renders it at `h-[62%] w-[62%]` inside a `plate`, `stroke="currentColor"`, `strokeWidth="2"`, `strokeLinecap="square"` on a 64-unit viewBox — a 2px hairline scaled down into a 92px box, so at the row size the strokes are sub-pixel and the mark reads as gray fuzz.

Grainger's own guide names *"visual product representation"* as a search aid. Ferguson serves photographs at `w=140` in its **navigation menu**. A catalog whose product column is a repeating gray outline is not a catalog; it is a placeholder grid. This is failure #2 and it is the one the client is actually reacting to when he says "it reads as a wireframe."

### 1.3 Rules are used as the primary structuring device instead of surface, so the page is a grid of boxes with no depth

`src/ui.tsx:139` — `Head` puts a **full-strength ink hairline** under every section title:
```
border-b border-[hsl(var(--ink))] pb-2.5
```
`hsl(var(--ink))` is `215 28% 12%` — near-black. A 1px near-black rule under every heading, plus `DataTable`'s `border-b border-[hsl(var(--ink))]` header rule (`ui.tsx:107`), plus `App.tsx:98` (`border-b border-[hsl(var(--ink))]` on the header), `App.tsx:236` (footer), `App.tsx:265` (tab bar), plus `Shop.tsx:191` on the filter head. Nine near-black horizontal rules can be on screen simultaneously.

Meanwhile the actual surfaces are almost flat: `.card` (`index.css:75–80`) is `0 1px 2px hsl(215 28% 12% / 0.05)` — visually zero. So the hierarchy is carried entirely by black lines, which is the visual grammar of a technical drawing. Home Depot and QXO invert this: hairlines are `#CCCCCC`/`#dfe2e5` (barely there), and separation comes from a white panel sitting on a light ground.

### 1.4 The type scale is too small, too dense, and has no fixed step set

Counted arbitrary sizes currently in use: `10.5px` (.lab), `11px`, `11.5px`, `12px`, `12.5px`, `13px`, `13.5px`, `14px`, `14.5px`, `15px`, `15.5px`, `15px` body, `17px`, `18px`, `20px`, `22px`, `24px`, `26px`, `28px`, `30px`, `34px`, `36px`, `38px`, `52px`, `60px`. That is roughly **25 distinct sizes**, many separated by half a pixel (`13px` vs `13.5px` vs `14px` vs `14.5px`).

Specific offenders: `Shop.tsx:88` product title at `text-[14.5px] ... sm:text-[15.5px]`; `Shop.tsx:96` spec rows at `text-[12px]`; `Shop.tsx:92` SKU line at `text-[11px]`; `ui.tsx:42` buttons at `text-[13.5px]` / `text-[15.5px]`; `App.tsx:105` utility strip at `text-[11px]`.

The product title — the single most important string in a catalog row — is **14.5px**. Home Depot's product title is 18px and its *button* is 18px. Half-pixel steps are invisible as hierarchy but very visible as sloppiness; 25 sizes means no size means anything.

### 1.5 Corner radius and border treatment are inconsistent to the point of looking unfinished

`--radius: 6px` (`index.css:52`), but:
- `ui.tsx:28` — `Tag` is `rounded-[3px]`
- `ui.tsx:41` — `Btn` is `rounded-[5px]`
- `ui.tsx:76` — `inputCls` is `rounded-[5px]`
- `Shop.tsx:80` — the product plate is `rounded-[4px]`
- `App.tsx:148` — the header search input is **fully square** (`border-2 border-white`, no radius)
- `App.tsx:154` — the search submit button is square
- `App.tsx:174` — nav items are square with a `border-l-2` marker
- `Shop.tsx:59` — the filter checkbox is square
- `Shop.tsx:129, 143` — quantity steppers are square
- `App.tsx:141` — the cart count badge is square

A codebase-wide scan returns `rounded-md` ×34, `rounded-sm` ×19, `rounded-full` ×15, `rounded-[5px]` ×3, `rounded-[4px]` ×3, `rounded-[3px]` ×1, `rounded-none` ×3 — six radii plus a large square-cornered population. Home Depot ships essentially one (3px). QXO ships essentially one (4px). Square corners on interactive controls in 2026 read as unstyled, and mixing four radii within one row (plate 4px, tag 3px, button 5px, input square) reads as unowned.

**Sixth, honourable mention:** the hero photograph. `src/assets/site/lee-screen-1.jpg` is **1200 × 1600 — portrait**. `Home.tsx:37` renders it `object-cover` into a `min-h-[380px] lg:min-h-[480px]` box that is roughly 1.2:1 landscape, then lays two gradient scrims and a hazard-stripe bar over it. The subject is being cropped to a sliver and then dimmed to near-black. The best real asset in the project is being wasted.

---

## 2. Art direction

**The feeling, in three sentences.** Misty Valley should feel like a well-run counter at a supply house that has been doing this for forty years and just bought good software — calm, bright, fast, and utterly certain about what is in stock and what it costs you. The industrial character stays, but it moves from the *chrome* into the *content*: it lives in the photographs of real steel on real decks, in the OSHA citation printed next to every part, and in the plain confidence of a price that does not need decoration — not in hazard stripes, black rules and shouted micro-labels. Nothing should look like it is trying; the screen should look like the answer arrived a moment before you asked.

**Three reference points.**

1. **Home Depot's PIP (measured above).** Why: it proves the discipline. Radius 3px everywhere, one green for "good", one orange for "act", 18px buttons, a 5px spacing rhythm, and almost no shadow. It is not a beautiful page but it is an *unhesitating* one, and the client explicitly named it as the bar. We match its coarseness of scale and its restraint with color, and beat it on typography and surface.

2. **QXO's token architecture.** Why: it shows what a modern B2B distribution brand looks like when it is designed rather than accreted — a formal 50→900 neutral ramp, exactly one card shadow (`1px 2px 5px neutral-300`), 4px radius, a neutral grotesque, and a single saturated accent that is used sparingly against near-black. QXO deliberately owns *navy and blue*; Misty Valley owns *safety orange*. The lesson is not the hue, it is that they picked one accent and then spent 95% of the page on neutrals.

3. **Ferguson's branch-first header, and Grainger's guide ranking real-time branch availability as the #2 feature of a product page.** Why: in this trade, "can I get it today and what do I pay" outranks everything, and both competitors architect the header and the PDP around that question. Misty Valley's differentiator — the OSHA citation attached to every part — should be given the same structural weight those two give stock and price: not a footnote in a `<dl>`, but a first-class, always-visible, filterable line.

**What we are explicitly dropping:** the hazard-stripe strip as a recurring decorative device (`.tape`, `index.css:103`, used at `App.tsx:99` and `Home.tsx:40`). Diagonal hazard stripes on a commerce header are costume. Keep the utility exactly once — as the 3px accent bar on the *hero photograph only* — or delete it. Also dropping the near-black rules, the uppercase default, and the line-art plate.

---

## 3. Color

Complete replacement for the `:root` block in `src/index.css`. Every value is an HSL triple in Tailwind's `hsl(var(--x))` form. All contrast ratios below were computed against sRGB relative luminance per WCAG 2.1.

```css
@layer base {
  :root {
    /* ---------------------------------------------------------- ground */
    --ground:        40 14% 97%;      /* #f8f8f6  page */
    --panel:          0  0% 100%;     /* #ffffff  cards, rows, sheets */
    --panel-2:       40 11% 95.5%;    /* #f5f4f2  table headers, inset wells */
    --panel-3:       40 10% 93%;      /* #efeeeb  product plate floor, disabled */

    /* ------------------------------------------------------------- ink */
    --ink:          218 20% 13%;      /* #1b1f28  headings, prices, primary body */
    --ink-2:        218 10% 36%;      /* #535965  secondary body, descriptions */
    --ink-3:        218  9% 50%;      /* #747c8b  tertiary / meta only, never body */

    /* ----------------------------------------------------------- rules */
    --rule:          40  9% 88%;      /* #e3e1de  card + row hairline */
    --rule-2:        40  9% 93%;      /* #efeeec  inner / zebra hairline */
    --field:        218 10% 54%;      /* #7e8795  input + control border (1.4.11) */

    /* --------------------------------------------------- safety accent */
    --safety:        21 94% 46%;      /* #e45407  DISPLAY fill only — no small text on it */
    --safety-2:      21 94% 40%;      /* #c64906  INTERACTIVE fill + orange text on light */
    --safety-press:  21 96% 33%;      /* #a53c03  :active */
    --safety-soft:   24 100% 97%;     /* #fff6f0  tint background */
    --safety-hi:     24 96% 56%;      /* #fb7923  orange text ON the dark header only */

    /* ------------------------------------------------ secondary accent */
    --marine:       218 86% 33%;      /* #0c419d  links, secondary CTA, info */
    --marine-2:     218 88% 27%;      /* #083581  :hover / :active */
    --marine-soft:  216 95% 96%;      /* #ebf3fe  tint background */

    /* --------------------------------------------------------- semantic */
    --good:         152 86% 24%;      /* #097241  in stock, savings, paid */
    --good-soft:    150 60% 95%;      /* #ebfaf2 */
    --warn:          30 94% 32%;      /* #9e5205  made to order, min order, low stock */
    --warn-soft:     42 96% 94%;      /* #fef6e1 */
    --bad:          356 74% 40%;      /* #b11b25  errors, past due, non-compliant */
    --bad-soft:     356 80% 96.5%;    /* #fdeff0 */

    /* -------------------------------------------- on dark (header/hero) */
    --on-dark:        0  0% 100%;     /* #ffffff */
    --on-dark-2:    218 12% 70%;      /* #a9b0bc  secondary text on --ink */

    /* -------------------------------------------------- shadcn bindings */
    --background: var(--ground);
    --foreground: var(--ink);
    --card: var(--panel);
    --card-foreground: var(--ink);
    --popover: var(--panel);
    --popover-foreground: var(--ink);
    --primary: var(--ink);
    --primary-foreground: 0 0% 100%;
    --secondary: var(--panel-2);
    --secondary-foreground: var(--ink);
    --muted: var(--panel-2);
    --muted-foreground: var(--ink-2);
    --accent: var(--panel-2);
    --accent-foreground: var(--ink);
    --destructive: var(--bad);
    --destructive-foreground: 0 0% 100%;
    --border: var(--rule);
    --input: var(--field);
    --ring: var(--safety);
    --radius: 6px;
  }
}
```

### Verified contrast ratios

Body text is any run set below 18.66px bold / 24px regular and must clear **4.5:1**. Large text and non-text UI boundaries must clear **3:1**.

| Foreground | Background | Ratio | Required | Result |
|---|---|---|---|---|
| `--ink` | `--ground` | **15.47:1** | 4.5 | pass |
| `--ink` | `--panel` | **16.46:1** | 4.5 | pass |
| `--ink` | `--panel-2` | **14.97:1** | 4.5 | pass |
| `--ink` | `--panel-3` | **14.17:1** | 4.5 | pass |
| `--ink-2` | `--ground` | **6.59:1** | 4.5 | pass |
| `--ink-2` | `--panel` | **7.02:1** | 4.5 | pass |
| `--ink-2` | `--panel-2` | **6.38:1** | 4.5 | pass |
| `--ink-2` | `--panel-3` | **6.04:1** | 4.5 | pass |
| `--ink-3` | `--panel` | 4.18:1 | 3.0 (meta only) | pass |
| `--ink-3` | `--ground` | 3.93:1 | 3.0 (meta only) | pass |
| `--safety-2` | `--panel` | **4.82:1** | 4.5 | pass |
| `--safety-2` | `--ground` | **4.53:1** | 4.5 | pass |
| `--safety-2` | `--safety-soft` | **4.51:1** | 4.5 | pass |
| `--on-dark` (white) | `--safety-2` | **4.82:1** | 4.5 | pass |
| `--on-dark` (white) | `--safety-press` | **6.47:1** | 4.5 | pass |
| `--on-dark` (white) | `--safety` | 3.78:1 | 3.0 (≥24px display only) | pass |
| `--marine` | `--panel` | **9.33:1** | 4.5 | pass |
| `--marine` | `--ground` | **8.76:1** | 4.5 | pass |
| `--marine` | `--marine-soft` | **8.34:1** | 4.5 | pass |
| white | `--marine` | **9.33:1** | 4.5 | pass |
| white | `--marine-2` | **11.45:1** | 4.5 | pass |
| `--good` | `--panel` | **6.02:1** | 4.5 | pass |
| `--good` | `--ground` | **5.66:1** | 4.5 | pass |
| `--good` | `--good-soft` | **5.58:1** | 4.5 | pass |
| white | `--good` | **6.02:1** | 4.5 | pass |
| `--warn` | `--panel` | **5.74:1** | 4.5 | pass |
| `--warn` | `--ground` | **5.40:1** | 4.5 | pass |
| `--warn` | `--warn-soft` | **5.32:1** | 4.5 | pass |
| `--bad` | `--panel` | **6.86:1** | 4.5 | pass |
| `--bad` | `--ground` | **6.45:1** | 4.5 | pass |
| `--bad` | `--bad-soft` | **6.14:1** | 4.5 | pass |
| white | `--bad` | **6.86:1** | 4.5 | pass |
| `--on-dark` (white) | `--ink` | **16.46:1** | 4.5 | pass |
| `--on-dark-2` | `--ink` | **7.55:1** | 4.5 | pass |
| `--safety-hi` | `--ink` | **6.16:1** | 4.5 | pass |
| `--field` | `--panel` | 3.64:1 | 3.0 (1.4.11) | pass |
| `--field` | `--ground` | 3.42:1 | 3.0 (1.4.11) | pass |
| `--field` | `--panel-2` | 3.31:1 | 3.0 (1.4.11) | pass |

**Every body-text pair clears 4.5:1.** Confirmed above: `--ink`, `--ink-2`, `--safety-2`, `--marine`, `--good`, `--warn`, `--bad` all clear 4.5:1 against `--ground`, `--panel` and their own soft tints; white clears 4.5:1 on `--safety-2`, `--safety-press`, `--marine`, `--good`, `--bad` and `--ink`.

### Three binding rules about color

1. **`--safety` (the bright `#e45407`) never carries small white text.** It is a *display* value only: the 3px accent bar on the hero, the active nav marker, the logo's second word, the focus ring, and the count badge on the cart when the badge text is ≥14px bold. Everything with a white label on orange uses `--safety-2` (4.82:1). This is the single accessibility bug in the current build that has no workaround: `ui.tsx:44` puts white on `20 90% 46%` (≈3.7:1) in every primary button in the app.
2. **`--safety-2` is the only orange used as text on a light ground.** The current build uses `--safety` for OSHA cites (`Shop.tsx:101`), links, eyebrows and the header's "Open a credit account" — at ~3.8:1 those all fail.
3. **Ration the accent.** Count it on any screenshot: orange should occupy **under 4% of the pixels** and appear in at most **three** places per viewport. Everything else is `--ink` / `--ink-2` on white. QXO's homepage is 95% neutral; Home Depot's PIP is orange only on the button and the price strike. `--marine` picks up the load the orange was carrying — links, secondary buttons, informational tags — which is what lets orange mean *act now*.

---

## 4. Type

### Families

| Role | Family | Google Fonts weights | Verdict |
|---|---|---|---|
| Display | **Barlow Condensed** | 600, 700 | **Keep, but demote.** Only sizes ≥28px. Never a button, never a nav item, never a table header, never a card title. |
| UI + body | **Inter** | 400, 500, 600, 700 | **Replace Archivo with Inter.** |
| Identifier | **IBM Plex Mono** | 400, 500 | **Keep, but restrict.** SKUs, OSHA citations, order/invoice numbers, tracking numbers only. |

**Why drop Archivo.** Archivo is a good face, but it is a *grotesque with personality* — the tall x-height and slightly narrow apertures make it read well at 24px and muddy at 13px, which is exactly the range this catalog lives in. Inter was drawn for 11–17px UI, has genuinely distinguishable `1 / l / I` and `0 / O` (critical when a part number is the difference between a compliant anchor and a lawsuit), ships `tnum` tabular figures so price columns align without a monospace crutch, is available on Google Fonts, and is the face QXO loads on its own marketing surface. Changing it costs one line in the `@import` and one in the `body` rule.

**Why keep Barlow Condensed but demote it.** It gives the brand a voice at hero and page-title scale that Inter cannot. The problem was never the typeface; it was `text-transform: uppercase` baked into `.disp` and `.disp` being applied 75 times, including to every button. At 40px sentence case, Barlow Condensed Bold is confident and distinctly *supply-house*. At 13px uppercase on a button, it is a construction sign.

**Why restrict IBM Plex Mono.** A mono is the correct tool for a string a human transcribes character by character (`MVS-RG-1000`, `1926.501(b)(10)`). It is the wrong tool for a nav subtitle, a table header, a form label, a date, or a price — and it is currently doing all five. Prices and quantities move to Inter with `font-variant-numeric: tabular-nums`, which gives column alignment without the terminal flavour.

### The scale — seven permitted sizes

**No size outside this table may appear anywhere in `src/`.** No half-pixel values. The current 25-size sprawl collapses to seven, plus one responsive hero step.

| # | Role | Family | Size | Weight | Line-height | Letter-spacing | Transform |
|---|---|---|---|---|---|---|---|
| 1 | `display-1` — hero headline | Barlow Condensed | **40px** (`lg:52px`) | 700 | 0.98 | −0.005em | **sentence case** |
| 2 | `display-2` — page title | Barlow Condensed | **28px** | 700 | 1.04 | 0 | **sentence case** |
| 3 | `title` — section head, card title, product name, price (row) | Inter | **22px** heads / **18px** product name | 600 | 1.25 | −0.011em | sentence case |
| 4 | `body` — descriptions, primary copy, button labels | Inter | **15px** | 400 (600 on buttons) | 1.5 (1 on buttons) | 0 | sentence case |
| 5 | `body-sm` — row meta, spec values, table cells, facet labels | Inter | **13px** | 400 (500 for values) | 1.45 | 0 | sentence case |
| 6 | `micro` — helper text, counts, timestamps, nav subtitles | Inter | **11px** | 500 | 1.35 | +0.005em | **sentence case** |
| 7 | `eyebrow` — the *only* uppercase style | Inter | **11px** | 600 | 1 | **+0.06em** | **UPPERCASE** |
| — | `price-lg` — PDP / drawer price | Inter | **28px** | 700 `tnum` | 1 | −0.02em | — |
| — | `price` — row price | Inter | **22px** | 700 `tnum` | 1 | −0.02em | — |
| — | `ident` — SKU, OSHA cite, order # | IBM Plex Mono | **13px** (row) / **11px** (meta) | 500 | 1.3 | 0 | as authored |

Permitted size set: **11, 13, 15, 18, 22, 28, 40** (+ 52 for `display-1` at `lg`). Seven values. If a design needs an eighth, the design is wrong.

### The all-caps rule — explicit

> **Uppercase is permitted in exactly one style, `eyebrow`, and `eyebrow` may appear at most once per section — never more than three times per viewport.**
>
> Legitimate uses: the kicker above a page title (`Safety & Edge Protection`), a single status word inside a filled badge (`IN STOCK`, `BACKORDER`), and the branded hazard/compliance callout header. That is the complete list.
>
> **Uppercase is forbidden on:** buttons, nav items, tab-bar labels, table column headers, form field labels, definition-list terms, tags/chips carrying variable content, breadcrumbs, links, prices, unit-of-measure strings, product names, empty-state headings, and anything above 13px.
>
> Enforcement: delete the `text-transform: uppercase` declaration from `.disp` (`index.css:69`) and delete `.lab` entirely (`index.css:71`). Replace every `.lab` call site with `micro` or `eyebrow`. Home Depot ships 8 uppercase declarations in 232 KB of CSS; we should ship one.

### The `@import` and base rules

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

body {
  margin: 0;
  background: hsl(var(--ground));
  color: hsl(var(--ink));
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  font-feature-settings: 'cv05' 1, 'cv08' 1, 'ss01' 1;  /* single-storey l, disambiguated 1/I */
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* display — NOTE: no text-transform */
.disp { font-family: 'Barlow Condensed', 'Arial Narrow', sans-serif; letter-spacing: -0.005em; line-height: 1.0; }

/* identifiers only */
.ident { font-family: 'IBM Plex Mono', ui-monospace, monospace; font-weight: 500; letter-spacing: 0; }

/* tabular figures for anything countable */
.num  { font-variant-numeric: tabular-nums; font-feature-settings: 'tnum' 1; }

/* the one uppercase style */
.eyebrow { font-size: 11px; font-weight: 600; line-height: 1; letter-spacing: .06em; text-transform: uppercase; }

/* DELETE: .lab, and the text-transform/uppercase from .disp */
```

---

## 5. Space, radius, elevation

### Spacing

Base unit **4px**, which is Tailwind's native scale, so no arbitrary values are needed for spacing anywhere.

| Token | px | Tailwind | Use |
|---|---|---|---|
| `space-0.5` | 2 | `p-0.5 gap-0.5` | icon nudges only |
| `space-1` | 4 | `p-1` | inside a badge |
| `space-1.5` | 6 | `p-1.5` | chip padding-y |
| `space-2` | 8 | `p-2` | tight stack, chip padding-x |
| `space-3` | 12 | `p-3` | table cell padding, dense row gap |
| `space-4` | 16 | `p-4` | **default component padding (mobile)** |
| `space-5` | 20 | `p-5` | **default component padding (desktop)** |
| `space-6` | 24 | `p-6` | card padding on large surfaces |
| `space-8` | 32 | `mb-8` | between related blocks |
| `space-10` | 40 | `mb-10` | between sections |
| `space-16` | 64 | `mb-16` | between major page regions |

Rhythm rules:
- Inside a card: `16px` on mobile, `20px` on `sm+`. Never `12px`, never `28px`.
- Between sibling cards in a list: `0` (shared hairline) or `8px` (detached). Never both in one list.
- Between sections: **40px**. The current build uses `mb-10` (40px) in `Home.tsx:32` and `mb-5` (20px) in `ui.tsx:137` — pick 40 and hold it.
- Vertical rhythm inside a product row: title → meta `4px`; meta → spec block `12px`; spec block → tags `8px`; tags → price `12px`.

### Radius

```css
--r-1: 4px;    /* chips, tags, badges, checkboxes, small controls */
--r-2: 6px;    /* buttons, inputs, selects, steppers */
--r-3: 10px;   /* cards, panels, product plates, sheets, modals */
--r-full: 999px; /* count badges and avatars ONLY */
```

Four values, total. Rules:
- **Nothing interactive is square-cornered.** This kills `App.tsx:148` (search input), `App.tsx:154` (search button), `App.tsx:141` (cart badge), `Shop.tsx:59` (checkbox), `Shop.tsx:129/143` (steppers).
- A nested element's radius is `parent − 4px`, floored at `--r-1`. A plate (`--r-3`, 10px) inside a card (`--r-3`, 10px) that is flush to the card edge gets `6px`.
- `--radius` in `:root` stays `6px` so shadcn's `lg/md/sm` derivations keep working.

Where the current build sits at 3/4/5/6px + square, this is 4/6/10 with zero squares. Home Depot at 3px and QXO at 4px are tighter than 10px cards, but both are ten years into a legacy system; 10px on the card and 6px on the control is the current-decade read of the same restraint, and it is the single cheapest change that makes the app stop looking like a wireframe.

### Elevation — exact `box-shadow` values

```css
/* e0 — flat. Hairline only. Table rows, list rows, inline wells. */
--e0: none;

/* e1 — resting card. Barely perceptible; the hairline does the work. */
--e1: 0 1px 2px hsl(218 20% 13% / 0.06),
      0 1px 1px hsl(218 20% 13% / 0.04);

/* e2 — raised card / hover on e1. */
--e2: 0 1px 2px hsl(218 20% 13% / 0.05),
      0 4px 12px -4px hsl(218 20% 13% / 0.10);

/* e3 — popover, dropdown, typeahead panel, sticky toolbar. */
--e3: 0 2px 4px hsl(218 20% 13% / 0.06),
      0 12px 28px -8px hsl(218 20% 13% / 0.16);

/* e4 — sheets, drawers, modals. */
--e4: 0 24px 64px -16px hsl(218 20% 13% / 0.34);

/* focus — never removed, never a plain outline on a rounded control */
--focus: 0 0 0 3px hsl(21 94% 46% / 0.28);

/* press — the Home Depot hard-offset trick, adapted */
--press: 0 2px 0 0 hsl(21 96% 33%);
```

Rules:
- A card uses `--e1` **and** `1px solid hsl(var(--rule))`. Never a shadow alone; never a heavy border alone.
- `.lift:hover` goes `--e1 → --e2` and **removes the `translateY(-1px)`**. In a 24-row list, a 1px hover jump makes the page feel loose. Change border-color on hover instead: `hsl(var(--ink) / 0.18)`.
- Modals and sheets get `--e4` and drop the `border-l-2 border-safety` accent stripe currently on `App.tsx:249`, `Shop.tsx:311`, `Shop.tsx:325` — a shadow is enough, and the orange stripe is accent budget spent on nothing.
- `--press` replaces `active:translate-y-px` on the primary button. Home Depot uses `box-shadow:0 3px #c14c00` for exactly this and it is the best small detail on their site: the button reads as a physical key.

---

## 6. Component specs

All strings are Tailwind 3.4 with arbitrary values against the tokens above. They are written to drop into the existing files.

### 6.1 Product card (grid view — new; add a grid/list toggle per Grainger)

```
Container (article), clickable:
  group relative flex flex-col overflow-hidden rounded-[10px] border border-[hsl(var(--rule))]
  bg-[hsl(var(--panel))] shadow-[0_1px_2px_hsl(218_20%_13%/0.06),0_1px_1px_hsl(218_20%_13%/0.04)]
  transition-[box-shadow,border-color] duration-150
  hover:border-[hsl(var(--ink)/0.18)]
  hover:shadow-[0_1px_2px_hsl(218_20%_13%/0.05),0_4px_12px_-4px_hsl(218_20%_13%/0.10)]
  focus-within:shadow-[0_0_0_3px_hsl(21_94%_46%/0.28)]

Plate (image well) — square, flush to top:
  relative aspect-square w-full overflow-hidden rounded-t-[10px]
  bg-[radial-gradient(120%_90%_at_50%_8%,#fff_0%,hsl(40_10%_96%)_54%,hsl(40_9%_91%)_100%)]

  Product mark inside the plate:
    absolute inset-0 m-auto h-[76%] w-[76%] object-contain

  Availability chip, pinned top-left of the plate:
    absolute left-2 top-2   (see 6.5 Tag)

  Add-to-list button, pinned top-right, appears on hover/focus:
    absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-[6px]
    border border-[hsl(var(--rule))] bg-[hsl(var(--panel))]
    text-[hsl(var(--ink-2))] opacity-0 transition-opacity
    group-hover:opacity-100 focus:opacity-100
    hover:border-[hsl(var(--ink)/0.25)] hover:text-[hsl(var(--ink))]

Body:
  flex flex-1 flex-col gap-3 p-4 sm:p-5

  SKU + supplier line:
    ident text-[11px] text-[hsl(var(--ink-3))]

  Product name (2-line clamp, the biggest text in the card):
    line-clamp-2 text-[18px] font-semibold leading-[1.25] tracking-[-0.011em]
    text-[hsl(var(--ink))] group-hover:text-[hsl(var(--marine))]

  Compliance line — the Misty Valley differentiator, given real weight:
    flex items-center gap-2 rounded-[6px] bg-[hsl(var(--safety-soft))] px-2.5 py-2
    <span class="eyebrow text-[hsl(var(--safety-2))]">OSHA</span>
    <span class="ident text-[13px] text-[hsl(var(--safety-2))]">1926.501(b)(10)</span>

  Spacer:  mt-auto

  Price block:  see 6.3

  Action row:
    mt-3 flex items-center gap-2
    [qty stepper, see 6.7] + [primary Btn, flex-1]
```

Composition rationale, from the research: image on top at full card width (Ferguson, Home Depot, Grainger all do this — the image is never a 68px thumbnail in grid view); one status chip over the image; two-line title clamp at 18px; price immediately above the action; add-to-list as a secondary affordance because Grainger puts Add to List on every result row.

### 6.2 Product row (list view — replaces `Shop.tsx` `Row`)

```
article:
  group grid grid-cols-[96px_1fr] gap-4 border-b border-[hsl(var(--rule))]
  bg-[hsl(var(--panel))] p-4 transition-colors last:border-0
  hover:bg-[hsl(var(--panel-2))]
  sm:grid-cols-[128px_1fr_220px] sm:gap-6 sm:p-5

Plate (button):
  aspect-square overflow-hidden rounded-[8px] border border-[hsl(var(--rule))]
  bg-[radial-gradient(120%_90%_at_50%_8%,#fff_0%,hsl(40_10%_96%)_54%,hsl(40_9%_91%)_100%)]
  Mark inside: h-[78%] w-[78%] object-contain

Detail column:
  min-w-0

  Title:
    text-left text-[18px] font-semibold leading-[1.25] tracking-[-0.011em]
    text-[hsl(var(--ink))] group-hover:text-[hsl(var(--marine))]

  SKU line (mt-1):
    ident text-[11px] text-[hsl(var(--ink-3))]
    SKU · supplier

  Compliance strip (mt-3) — replaces the two-column <dl>:
    flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]
    <span class="text-[hsl(var(--ink-2))]">Built to</span>
    <span class="ident text-[13px] text-[hsl(var(--ink))]">OSHA 1926.502(b)</span>
    <span class="h-3 w-px bg-[hsl(var(--rule))]" aria-hidden></span>
    <span class="text-[hsl(var(--ink-2))]">Required by</span>
    <a class="ident text-[13px] font-medium text-[hsl(var(--safety-2))] underline
              decoration-[hsl(var(--safety-2)/0.35)] underline-offset-2
              hover:decoration-[hsl(var(--safety-2))]">1926.501(b)(10)</a>

  Availability row (mt-3):
    flex flex-wrap items-center gap-2
    [Tag: availability]  +  <span class="text-[13px] text-[hsl(var(--ink-2))]">Ships in 3–5 days</span>

Price column (sm and up):
  hidden border-l border-[hsl(var(--rule))] pl-5 sm:block
  [price block 6.3]
  min-order note (if moq > 1), mt-1:
    text-[11px] font-medium text-[hsl(var(--warn))]
  action row, mt-4: flex items-center gap-2  → [stepper] [Btn flex-1 "Add"]
  full spec link, mt-3:
    text-[13px] font-medium text-[hsl(var(--marine))] hover:text-[hsl(var(--marine-2))] hover:underline

Mobile price + buy (below detail, mt-4, sm:hidden):
  flex flex-wrap items-end justify-between gap-3
```

Key deltas from today: title 14.5px → **18px**; the `<dl>` with two `.lab` `<dt>`s becomes a single readable sentence-case strip; the OSHA cite becomes a **link** (it is the product's most distinctive fact and should be clickable to filter); plate 92px → **128px** at `sm+`; row hover becomes a background wash instead of a shadow lift.

### 6.3 Price block — list vs contract

Grainger's model, adopted: **for a signed-in account, the contract price is simply the price.** List is present only as the small struck comparator, never as the headline. The current build reverses this for signed-out users by rendering list at `text-[26px]` in `--ink-2` (`auth.tsx:319`), which makes the most important number on screen *gray*.

**Signed out (list price):**
```
<div>
  <div class="num text-[22px] font-bold leading-none tracking-[-0.02em] text-[hsl(var(--ink))]">
    $289.00
  </div>
  <div class="mt-1 text-[11px] font-medium text-[hsl(var(--ink-3))]">
    List price · per section
  </div>
  <button class="mt-2 inline-flex items-center gap-1 rounded-[6px] bg-[hsl(var(--marine-soft))]
                 px-2.5 py-1.5 text-[13px] font-semibold text-[hsl(var(--marine))]
                 hover:bg-[hsl(var(--marine)/0.12)]">
    Sign in for your price →
  </button>
</div>
```
The list price is **`--ink`, not `--ink-2`** — a real number, full contrast. The upsell is a *marine* chip, not orange, because signing in is not the primary action on the row (adding to the order is).

**Signed in (contract price):**
```
<div>
  <div class="flex items-baseline gap-2">
    <span class="num text-[22px] font-bold leading-none tracking-[-0.02em] text-[hsl(var(--ink))]">
      $245.65
    </span>
    <span class="eyebrow rounded-[4px] bg-[hsl(var(--good-soft))] px-1.5 py-1 text-[hsl(var(--good))]">
      Your price
    </span>
  </div>
  <div class="mt-1 text-[11px] font-medium text-[hsl(var(--ink-3))]">
    Per section · net 30
  </div>
  <div class="num mt-1.5 text-[11px] text-[hsl(var(--ink-3))]">
    <span class="line-through">$289.00 list</span>
    <span class="ml-1.5 font-semibold text-[hsl(var(--good))]">You save $43.35 (15%)</span>
  </div>
</div>
```

Rules:
1. The price is **always `--ink`**, in both states, at the same size, in the same position. The *only* differences are the `Your price` badge, the struck list, and the savings line. A price that changes color or size when you sign in makes the signed-out state look like a punishment.
2. Savings are stated in **dollars first, percent second**. Contractors bid in dollars.
3. Unit of measure is **never abbreviated to a bare noun**. `Per section`, `Per each`, `Per 600 ft kit` — matching how Home Depot and Grainger phrase it. Never `list · per section` in lowercase mono at 10.5px.
4. `price-lg` (28px) is used only in the spec drawer and cart total. Row and card use 22px.
5. Both prices use `.num` (`tabular-nums`) so a column of prices aligns on the decimal.

### 6.4 Buttons

Replaces `ui.tsx:35–58`. Four variants, two sizes, plus a destructive.

```ts
const base =
  "inline-flex items-center justify-center gap-2 rounded-[6px] border font-semibold " +
  "leading-none select-none transition-[background-color,border-color,box-shadow,color] duration-150 " +
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_hsl(21_94%_46%/0.28)] " +
  "disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none";

const sizes = {
  sm: "h-10 px-4 text-[13px]",          // 40px — still a valid tap target
  md: "h-11 px-5 text-[15px]",          // 44px — default, matches HD's 18px-label weight class
  lg: "h-12 px-6 text-[15px]",          // 48px — hero + checkout only
};

const variants = {
  // primary — orange, white label at 4.82:1, hard press offset
  solid:
    "bg-[hsl(var(--safety-2))] border-[hsl(var(--safety-2))] text-white " +
    "shadow-[0_2px_0_0_hsl(21_96%_33%)] " +
    "hover:bg-[hsl(21_94%_36%)] hover:border-[hsl(21_94%_36%)] " +
    "active:translate-y-[2px] active:shadow-none",

  // secondary — marine, for "Sign in", "Request a quote", "Add to list"
  marine:
    "bg-[hsl(var(--marine))] border-[hsl(var(--marine))] text-white " +
    "shadow-[0_2px_0_0_hsl(var(--marine-2))] " +
    "hover:bg-[hsl(var(--marine-2))] hover:border-[hsl(var(--marine-2))] " +
    "active:translate-y-[2px] active:shadow-none",

  // tertiary — outlined, the workhorse for anything that isn't the one primary action
  line:
    "bg-[hsl(var(--panel))] border-[hsl(var(--field)/0.55)] text-[hsl(var(--ink))] " +
    "shadow-[0_1px_2px_hsl(218_20%_13%/0.05)] " +
    "hover:border-[hsl(var(--ink)/0.4)] hover:bg-[hsl(var(--panel-2))]",

  // quiet — text-only
  ghost:
    "border-transparent bg-transparent text-[hsl(var(--marine))] " +
    "hover:bg-[hsl(var(--marine-soft))]",

  // destructive
  bad:
    "bg-[hsl(var(--bad))] border-[hsl(var(--bad))] text-white " +
    "shadow-[0_2px_0_0_hsl(356_74%_31%)] " +
    "hover:bg-[hsl(356_74%_34%)] active:translate-y-[2px] active:shadow-none",
};
```

Deltas: the `disp` class is **removed from `base`** — buttons are Inter semibold sentence case, not condensed uppercase. `sm` grows 36px → 40px. The `active:translate-y-px` becomes a real key-travel (`shadow → translate`), which is the Home Depot mechanic. Exactly **one `solid` button per view** — everything else is `line`, `marine` or `ghost`. In `Shop.tsx` today every one of 24 rows has an orange `solid` "Add" button, which is 24 primary actions on one screen; that is the correct call for a catalog row (Grainger puts Add to Cart on every row) so `Shop.tsx` is the documented exception, but the row button drops to `size="sm"` and the page must then have **no other** orange button.

### 6.5 Input

Replaces `ui.tsx:75–77`.

```ts
export const inputCls =
  "h-11 w-full rounded-[6px] border border-[hsl(var(--field)/0.55)] bg-[hsl(var(--panel))] " +
  "px-3 text-[15px] text-[hsl(var(--ink))] leading-none " +
  "placeholder:text-[hsl(var(--ink-3))] " +
  "transition-[border-color,box-shadow] duration-150 outline-none " +
  "hover:border-[hsl(var(--field)/0.8)] " +
  "focus:border-[hsl(var(--safety-2))] focus:shadow-[0_0_0_3px_hsl(21_94%_46%/0.28)] " +
  "disabled:bg-[hsl(var(--panel-2))] disabled:text-[hsl(var(--ink-3))] " +
  "aria-[invalid=true]:border-[hsl(var(--bad))] aria-[invalid=true]:shadow-[0_0_0_3px_hsl(356_74%_40%/0.18)]";

// numeric variant — quantities, PO amounts
export const inputNumCls = inputCls + " num text-center tabular-nums";
```

Deltas: height 40 → **44px** (tap target); font 14px mono → **15px Inter** (mono in a text field is a terminal cue, and `mono` on `inputCls` currently applies to name, email and PO fields where it is simply wrong); border moves from `--rule` (1.33:1, invisible, fails WCAG 1.4.11) to `--field` at 55% alpha (≈2.5:1) and to full `--field` on hover (3.64:1) — an input must look like an input before it is touched. `Field` (`ui.tsx:64–70`) drops `Lab` and uses `micro`:

```
<label class="grid gap-1.5">
  <span class="text-[13px] font-medium text-[hsl(var(--ink-2))]">PO number</span>
  <input class={inputCls} />
</label>
```

### 6.6 Tag / badge

Replaces `ui.tsx:20–33`. Two shapes: a **soft** informational tag and a **solid** status chip for use over imagery.

```ts
const base =
  "inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 " +
  "text-[11px] font-semibold leading-none whitespace-nowrap";

const soft = {
  grey:   "border-[hsl(var(--rule))] bg-[hsl(var(--panel-2))] text-[hsl(var(--ink-2))]",
  good:   "border-[hsl(var(--good)/0.22)] bg-[hsl(var(--good-soft))] text-[hsl(var(--good))]",
  warn:   "border-[hsl(var(--warn)/0.24)] bg-[hsl(var(--warn-soft))] text-[hsl(var(--warn))]",
  bad:    "border-[hsl(var(--bad)/0.22)] bg-[hsl(var(--bad-soft))] text-[hsl(var(--bad))]",
  safety: "border-[hsl(var(--safety-2)/0.22)] bg-[hsl(var(--safety-soft))] text-[hsl(var(--safety-2))]",
  marine: "border-[hsl(var(--marine)/0.20)] bg-[hsl(var(--marine-soft))] text-[hsl(var(--marine))]",
};

// over a photograph or plate — needs its own opaque ground
const solid = {
  good:   "border-transparent bg-[hsl(var(--good))] text-white",
  warn:   "border-transparent bg-[hsl(var(--warn))] text-white",
  safety: "border-transparent bg-[hsl(var(--safety-2))] text-white",
  ink:    "border-transparent bg-[hsl(var(--ink)/0.86)] text-white backdrop-blur-[2px]",
};
```

An **8px status dot** precedes availability tags — `<span class="h-1.5 w-1.5 rounded-full bg-current" />` — because color alone must not be the only channel (WCAG 1.4.1) and because it is how every distributor signals stock.

Deltas: `lab` (10.5px uppercase mono, `.11em`) → 11px Inter semibold **sentence case**. `Frequently bought` was `tone="safety"` (orange) — that is a merchandising note, not a warning; it moves to `marine`. Availability mapping becomes: **In stock** → `soft.good`; **Made to order** → `soft.warn`; **Ships from supplier** → `soft.grey`. `steel` is retired in favour of `marine`.

### 6.7 Quantity stepper

New shared primitive; replaces the ad-hoc steppers at `Shop.tsx:127–133`, `Shop.tsx:141–147`, `App.tsx:271–279`.

```
Wrapper:
  inline-flex h-11 items-stretch overflow-hidden rounded-[6px]
  border border-[hsl(var(--field)/0.55)] bg-[hsl(var(--panel))]
  focus-within:border-[hsl(var(--safety-2))]
  focus-within:shadow-[0_0_0_3px_hsl(21_94%_46%/0.28)]

Minus / plus buttons:
  grid w-11 place-items-center text-[hsl(var(--ink-2))]
  hover:bg-[hsl(var(--panel-2))] hover:text-[hsl(var(--ink))]
  disabled:text-[hsl(var(--ink-3))] disabled:hover:bg-transparent

Input:
  num w-14 border-x border-[hsl(var(--rule))] bg-transparent text-center
  text-[15px] font-semibold text-[hsl(var(--ink))] outline-none
```

44 × 44 hit areas on both buttons — the current `h-9 w-9` (36px) and `h-10 w-10` (40px) both miss the 44px minimum.

### 6.8 Data table

Replaces `ui.tsx:82–130`. The mobile stacked-card path stays (it is genuinely good) but its labels change.

```
Wrapper:
  overflow-hidden rounded-[10px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))]
  shadow-[0_1px_2px_hsl(218_20%_13%/0.06),0_1px_1px_hsl(218_20%_13%/0.04)]

Scroll container:
  hidden overflow-x-auto sm:block

table:
  w-full min-w-[640px] border-collapse

thead th:
  sticky top-0 z-10 border-b border-[hsl(var(--rule))] bg-[hsl(var(--panel-2))]
  px-4 py-3 text-left align-bottom whitespace-nowrap
  text-[11px] font-semibold tracking-[.005em] text-[hsl(var(--ink-2))]
  first:pl-5 last:pr-5
  [right-aligned columns add: text-right]

tbody tr:
  border-b border-[hsl(var(--rule-2))] transition-colors last:border-0
  hover:bg-[hsl(var(--panel-2))]
  [selected: bg-[hsl(var(--safety-soft))]]

tbody td:
  px-4 py-3.5 align-middle text-[13px] text-[hsl(var(--ink))]
  first:pl-5 last:pr-5
  [numeric columns add: num text-right tabular-nums]
  [identifier columns add: ident text-[13px]]

Mobile stacked card (sm:hidden), per row:
  border-b border-[hsl(var(--rule))] p-4 last:border-0
  each cell:  flex items-baseline justify-between gap-4 py-1
    <span class="shrink-0 text-[13px] text-[hsl(var(--ink-2))]">{col}</span>
    <span class="min-w-0 text-right text-[13px] font-medium text-[hsl(var(--ink))]">{cell}</span>
```

Deltas: the header rule goes from `border-b border-[hsl(var(--ink))]` (near-black) to `--rule`; column headers go from `.lab` uppercase mono to 11px Inter semibold **sentence case**; the header becomes `sticky` (essential for the Ops and Users views); row hover goes from `hsl(var(--safety-soft))` (an orange wash on every row hover, which trains the eye to ignore orange) to a neutral `--panel-2`, with `--safety-soft` reserved for *selected*; cell padding 12px → 16px horizontal; the whole table gains a rounded, shadowed wrapper instead of floating unbounded.

### 6.9 Section header

Replaces `ui.tsx:135–152`.

```
Wrapper:  mb-8

Top line:  flex flex-wrap items-end justify-between gap-x-6 gap-y-3

  Left:
    Eyebrow (optional, sentence-case exception — this IS the uppercase style):
      eyebrow mb-2 block text-[hsl(var(--safety-2))]
    Title:
      disp text-[28px] font-bold leading-[1.04] text-[hsl(var(--ink))]
      (Barlow Condensed, sentence case — NOT uppercase)

  Right: actions slot

Sub (optional), mt-3:
  max-w-[68ch] text-[15px] leading-[1.55] text-[hsl(var(--ink-2))]

Divider, mt-5:
  h-px w-full bg-[hsl(var(--rule))]
```

Deltas: the near-black `border-b border-[hsl(var(--ink))]` becomes a hairline **below** the sub-line, not tight under the title — which is what stops the page reading as a stack of ruled boxes. `mb-5` → `mb-8`. Title drops from `38px` uppercase to `28px` sentence case, which at Barlow Condensed Bold occupies nearly the same optical weight while reading as a headline instead of a sign.

### 6.10 Left nav item

Replaces `App.tsx:167–182`.

```
Rail:
  sticky top-[132px] hidden h-[calc(100vh-132px)] w-[228px] shrink-0
  overflow-y-auto py-6 pr-6 lg:block
  (NOTE: the border-r is removed — the rail is separated by whitespace, not a line)

Item (button), rest:
  mb-0.5 flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left
  text-[hsl(var(--ink-2))]
  transition-colors duration-150
  hover:bg-[hsl(var(--panel-2))] hover:text-[hsl(var(--ink))]

Item, active:
  bg-[hsl(var(--safety-soft))] text-[hsl(var(--ink))]
  relative before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px]
  before:-translate-y-1/2 before:rounded-full before:bg-[hsl(var(--safety))]

Icon:
  h-5 w-5 shrink-0
  rest:   text-[hsl(var(--ink-3))]
  active: text-[hsl(var(--safety-2))]

Label:
  block text-[15px] font-semibold leading-tight   (Inter, sentence case)

Sub-label:
  mt-0.5 block text-[11px] font-medium text-[hsl(var(--ink-3))]   (Inter, NOT mono)
```

Deltas: square + `border-l-2` becomes a rounded pill with a 3px rounded indicator bar; label goes from `disp` 17px condensed-uppercase to 15px Inter semibold sentence case; the sub-label goes from `mono 10.5px` to `micro 11px`; the rail's `border-r` disappears (one fewer vertical line). The "Prototype" note block at `App.tsx:184–188` moves to the footer.

### 6.11 Mobile tab bar

Replaces `App.tsx:263–279`.

```
Nav:
  fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--rule))]
  bg-[hsl(var(--panel)/0.94)] backdrop-blur-md
  pb-[env(safe-area-inset-bottom)] lg:hidden
  shadow-[0_-1px_2px_hsl(218_20%_13%/0.05),0_-8px_24px_-12px_hsl(218_20%_13%/0.10)]

Grid:  grid grid-cols-5

Item, rest:
  flex h-[58px] flex-col items-center justify-center gap-1
  text-[hsl(var(--ink-3))] transition-colors
  active:bg-[hsl(var(--panel-2))]

Item, current:
  text-[hsl(var(--safety-2))]

Icon:  h-6 w-6

Label:
  text-[11px] font-semibold leading-none   (Inter, sentence case)

Cart badge on the Order tab:
  absolute right-[22%] top-[10px] grid h-[18px] min-w-[18px] place-items-center
  rounded-full bg-[hsl(var(--safety-2))] px-1
  text-[10px] font-bold leading-none text-white
```

Deltas: the `border-t-2 border-[hsl(var(--safety))]` **top-edge marker is removed** — a 2px orange line across the top of one fifth of the screen is the loudest thing in the mobile UI and it marks the *least* important state (which tab you are on, which you already know). Active state becomes color-only on the icon and label. Bar height 60 → 58px with `gap-1` so the label has room. Background gains `backdrop-blur` so content scrolling under it reads as depth rather than a cut. The `-mt-0.5` hack is removed. Label drops `disp` uppercase.

### 6.12 Header / search assembly

Replaces `App.tsx:97–162`. This is the highest-leverage surface: it is on every screen, and it currently contains the hazard stripe, a 10px mono utility strip, a square-cornered full-bleed search, and two square outlined buttons.

```
Header:
  sticky top-0 z-40 bg-[hsl(var(--ink))] text-white
  shadow-[0_1px_0_hsl(218_20%_13%),0_4px_16px_-8px_hsl(218_20%_13%/0.4)]

── the `.tape` hazard strip is DELETED here (it survives only on the hero photo) ──

Utility strip:
  border-b border-white/[0.08]
  inner: mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-2 sm:px-6

  Branch selector (the Ferguson/Fastenal pattern — a named, addressed object):
    flex items-center gap-2 rounded-[6px] px-2 py-1 -mx-2
    text-[13px] text-[hsl(var(--on-dark-2))]
    transition-colors hover:bg-white/[0.07] hover:text-white
    [pin icon h-4 w-4]
    <span class="hidden text-[hsl(var(--on-dark-2))] sm:inline">Shopping</span>
    <span class="font-semibold text-white">Bonnieville, KY</span>
    [chevron h-3.5 w-3.5 text-[hsl(var(--on-dark-2))]]

  Right cluster:  ml-auto flex items-center gap-4
    Signed in:
      text-[13px] text-[hsl(var(--on-dark-2))] hover:text-white
      <span class="font-semibold text-white">{name}</span>
      <span class="mx-1.5 text-white/25">·</span>
      <span class="text-[hsl(var(--safety-hi))]">{role}</span>
    Signed out:
      "Sign in" → text-[13px] text-[hsl(var(--on-dark-2))] hover:text-white
      "Open a credit account" →
        rounded-[6px] border border-white/25 px-3 py-1.5 text-[13px] font-semibold
        text-white hover:border-[hsl(var(--safety-hi))] hover:text-[hsl(var(--safety-hi))]

Brand row:
  mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 sm:gap-6 sm:px-6

  Wordmark:
    disp text-[22px] font-bold leading-none sm:text-[26px]
    "Misty Valley" in white + "Supply" in text-[hsl(var(--safety-hi))]
    (Barlow Condensed — this is a legitimate display use)

  Right cluster: ml-auto flex items-center gap-2
    Account (sm+):
      hidden h-11 items-center gap-2 rounded-[6px] px-3 text-[13px] font-semibold
      text-[hsl(var(--on-dark-2))] hover:bg-white/[0.07] hover:text-white sm:flex
    Order / cart:
      relative flex h-11 items-center gap-2 rounded-[6px] border border-white/20
      px-3.5 text-[13px] font-semibold text-white
      hover:border-white/45 hover:bg-white/[0.07]
      count badge: grid h-[20px] min-w-[20px] place-items-center rounded-full
                   bg-[hsl(var(--safety-2))] px-1 text-[11px] font-bold leading-none text-white
                   (when 0: bg-white/15)

Search row:
  pb-3
  inner: mx-auto max-w-[1400px] px-4 sm:px-6

  Combined field + submit (ONE rounded unit, not two square ones):
    relative flex h-12 overflow-hidden rounded-[8px] bg-white
    shadow-[0_2px_4px_hsl(218_20%_13%/0.18)]
    focus-within:shadow-[0_0_0_3px_hsl(21_94%_46%/0.45)]

    Search icon:
      pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2
      text-[hsl(var(--ink-3))]

    Input:
      h-full flex-1 bg-transparent pl-11 pr-10 text-[15px] text-[hsl(var(--ink))]
      outline-none placeholder:text-[hsl(var(--ink-3))]
      placeholder: "Search by part, SKU, or OSHA citation — try 1926.501"

    Clear (when query):
      absolute right-[92px] top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center
      rounded-full text-[hsl(var(--ink-3))] hover:bg-[hsl(var(--panel-2))]
      sm:right-[124px]

    Submit:
      flex h-full shrink-0 items-center justify-center gap-2
      bg-[hsl(var(--safety-2))] px-4 text-[15px] font-semibold text-white
      hover:bg-[hsl(21_94%_36%)] sm:px-7

  Typeahead panel (new — Grainger's "category matches as you type"):
    absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[10px]
    border border-[hsl(var(--rule))] bg-[hsl(var(--panel))]
    shadow-[0_2px_4px_hsl(218_20%_13%/0.06),0_12px_28px_-8px_hsl(218_20%_13%/0.16)]
    Section head:  eyebrow px-4 pt-3 pb-1.5 text-[hsl(var(--ink-3))]
    Row:  flex items-center gap-3 px-4 py-2.5 text-[15px] text-[hsl(var(--ink))]
          hover:bg-[hsl(var(--panel-2))]
          [40px plate thumb] [name] [ident SKU, ml-auto, text-[hsl(var(--ink-3))]]
```

Deltas: the hazard stripe is gone; the utility strip goes 11px mono → 13px Inter; the branch shows a **place**, not `Branch: Bonnieville`; the search becomes one 48px rounded unit with a real shadow instead of two square `border-2 border-white` blocks; the placeholder teaches the OSHA-citation superpower instead of saying `Search SKU or OSHA cite`; and the sticky offsets in `App.tsx:168` (`top-[140px]`) must be recomputed to `132px` for the new header height.

---

## 7. Imagery strategy

The catalog has 24 SKUs, 18 line-art marks, and three photographs (`lee-screen-1.jpg` 1200×1600, `lee-screen-2.jpg` 1200×1600, `lee-detail.jpg` 736×1600 — **all portrait**). There is no licensed product photography and there is no budget assumption that there will be. Here is how to make it look credible anyway.

### 7.1 Rebuild the plate as a rendered object, not a drawing

The single change with the most impact. Today (`Shop.tsx:78–82`, `glyph.tsx:139–145`): a 2px-stroke, `strokeLinecap="square"` outline at 62% of a 92px box, in `currentColor` (`--ink-2`). It reads as a technical annotation.

Convert `Glyph` from **stroke-only line art to a two-tone filled silhouette with a cast shadow.** Concretely, in `glyph.tsx`:

1. Change the root `<svg>` from `fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square"` to `fill="currentColor" stroke="none"` and give each mark a filled body path plus a lighter "highlight" path. Where a mark is genuinely linear (guardrail, warning line), keep strokes but move to `strokeWidth="3.5"`, `strokeLinecap="round"`, `strokeLinejoin="round"`.
2. Render the mark in **`hsl(var(--ink) / 0.82)`** rather than `--ink-2` — a near-black object on a light plate reads as a photographed part in silhouette; a mid-gray outline reads as a placeholder.
3. Add a **contact shadow** under every mark. This is what makes an SVG stop looking like clip art:
   ```
   <ellipse cx="32" cy="57" rx="17" ry="2.6" fill="hsl(218 20% 13% / 0.16)" />
   ```
   placed as the first child, before the body paths.
4. Scale the mark to **`h-[78%] w-[78%]`** in rows and **`h-[76%] w-[76%]`** in grid cards. At 62% inside a 92px plate the mark was ~57px; at 78% inside a 128px plate it is ~100px.

Plate background — replace `.plate` (`index.css:96–100`):
```css
.plate {
  background:
    radial-gradient(130% 100% at 50% 4%,
      #ffffff 0%,
      hsl(40 10% 96%) 52%,
      hsl(40 9% 91%) 100%);
  box-shadow: inset 0 -18px 26px -22px hsl(218 20% 13% / 0.34);
}
```
Same idea, retuned to the new neutrals — a soft studio sweep with a floor. Combined with the contact shadow it produces a convincing "part on a seamless" without a single photograph.

### 7.2 Give the 24 SKUs 24 distinct marks

Today `MVS-RG-1000`, `MVS-YG-10` and `MVS-YG-POST` all resolve to `guardrail` (`glyph.tsx:124`); everything unmatched falls to `BY_CAT` (`glyph.tsx:134`). A catalog where three adjacent rows show the same picture is worse than one with no pictures, because it signals the data is fake.

Add six marks to close the gap (`guardrailPost`, `guardrailYellow` as a distinct rail profile, `holeCover`, `warningFlag`, `glovesA9` vs `glovesA4` as separate cut-level marks, `vestClass3`), and add explicit `BY_SKU` entries so **every one of the 24 SKUs matches by SKU, never by category.** Add a dev-time assertion:
```ts
// glyph.tsx
if (import.meta.env.DEV) {
  const unmatched = PRODUCTS.filter(p => !BY_SKU.find(([re]) => re.test(p.sku)));
  if (unmatched.length) console.warn("SKUs falling back to category glyph:", unmatched.map(p => p.sku));
}
```

### 7.3 Color-code the plate by category, subtly

Guardrail and toe board are safety yellow in reality; hi-vis is lime; hard hats are white or orange. Tint the *mark*, not the plate:

| Category | Mark fill |
|---|---|
| `roof`, `guard` | `hsl(45 92% 46%)` on `hsl(var(--ink)/0.9)` outline — safety yellow steel |
| `head` | `hsl(var(--ink)/0.82)` with a `hsl(0 0% 100%)` crown highlight |
| `eye` | `hsl(218 14% 62%)` frame + `hsl(200 30% 88%)` lens |
| `hand` | `hsl(var(--ink)/0.8)` + `hsl(45 88% 52%)` cuff |
| `hivis` | `hsl(72 88% 52%)` body + `hsl(200 20% 88%)` reflective bands |
| `fall` | `hsl(var(--ink)/0.85)` webbing + `hsl(21 94% 46%)` hardware |

Two colors per mark, drawn from the real product. This is the difference between an icon set and a catalog.

### 7.4 Deploy the three real photographs deliberately

They are the most credible assets in the project and are currently reduced to a cropped, double-scrimmed hero background.

- **`lee-screen-1.jpg` (1200×1600 portrait) — hero.** Stop cropping it to landscape. On `lg+`, make the hero a two-column split: photo in a `lg:col-span-5` **portrait** frame at `aspect-[3/4]`, `object-cover`, `rounded-[10px]`; copy in `lg:col-span-7` on the `--ground`, in `--ink`. Delete both gradient scrims and the white type — the headline moves onto the light ground where it is 15.47:1 instead of white-on-a-photo. On mobile, the photo sits **above** the copy at `aspect-[4/5]`, full-bleed to the container. Keep one hazard accent: a `h-1 bg-[hsl(var(--safety))]` bar across the top of the photo frame only. This is the entire remaining budget for `.tape`.
- **`lee-screen-2.jpg` — proof block.** A "Shop fabrication" section on Home and the top of `Screen.tsx`, `aspect-[4/5]` on mobile / `aspect-square` on desktop, with a caption in `micro` naming the job, the date and the material. Real caption text is what converts a stock-looking photo into evidence.
- **`lee-detail.jpg` (736×1600) — a narrow vertical strip.** Use it as a `lg:col-span-3` full-bleed column beside the category grid, `object-cover`, `aspect-[9/16]`. Its extreme aspect ratio is an asset, not a problem.

**Rule: never put type over a photograph.** Every current photo treatment (`Home.tsx:36–41`) lays two gradients and white text on the image. That is the compromise you make when the photo is decorative filler. These photos are the proof that Misty Valley fabricates real steel; show them clean and put the words next to them.

### 7.5 Category tiles get photographs, not icons

Ferguson serves photographic category tiles at `w=140` in its navigation menu. Misty Valley's `CATEGORIES` (7 entries, `data.ts:22–30`) should each get a **composed plate**: the category's hero mark rendered large on the plate gradient, exported once at 2× as a static asset, with the mark colored per §7.3. Seven images, generated from the SVGs already in the repo, no licensing.

### 7.6 The upgrade path

Write the plate as a component that takes an optional `image` prop and falls back to `Glyph`:
```tsx
<Plate sku={p.sku} cat={p.cat} image={p.image} />
```
Add `image?: string` to `Product` in `data.ts`. When real photography arrives — supplier-provided images are free and every one of the named suppliers (Midwest Safety Group, Ridgeline Fall Protection, Ohio Valley Rail Products) will hand them over on request — it drops in per SKU with no layout change. Ship the fallback so good it does not look like a fallback, and replace it opportunistically.

---

## 8. Mobile

### Breakpoints

Tailwind defaults, used as follows:

| Breakpoint | Layout |
|---|---|
| `< 640` (base) | Single column. Bottom tab bar. Filters in a bottom sheet. Product rows stack: plate (96px) + detail, price and buy below. Tables become stacked labelled cards. Header: branch + cart only; search full-width below. |
| `sm` (≥640) | Product row gains its 220px price/buy column. Tables become real tables. Padding 16 → 20px. Two-column grids. |
| `md` (≥768) | Grid view becomes available (2 columns). Hero splits. |
| `lg` (≥1024) | Left nav rail (228px) appears; bottom tab bar disappears. Facet rail (240px) appears; the mobile filter sheet is disabled. Grid view 3 columns. Header utility strip shows full branch address. |
| `xl` (≥1280) | Grid view 4 columns. Content max-width `1400px` holds. |

### What specifically changes

1. **Filters.** Below `lg`, facets live in a bottom sheet. Fix three things in the current sheet (`Shop.tsx:305–318`): (a) give it `rounded-t-[16px]` and `--e4` instead of `border-t-2 border-safety`; (b) add a **sticky footer** holding the `Show N items` button, so it is reachable without scrolling to the bottom of a long facet list — today it is the last element in a `max-h-[85vh] overflow-y-auto` container; (c) add a drag handle (`mx-auto h-1 w-10 rounded-full bg-[hsl(var(--rule))]`) and a sticky header with `Filters` + a `Clear all` action. Keep applied-filter chips **outside** the sheet, above the results — Home Depot, Grainger and Ferguson all do this, and it is how a user knows what is on without reopening the sheet.
2. **Sort** moves out of a native `<select>` (`Shop.tsx:229`) into the same sheet as a radio list below `sm`. A 36px-tall native select is the worst tap target on the page.
3. **Search** stays full-width and sticky. The submit button collapses to icon-only below `sm` (already correct) but the combined unit keeps its 48px height and 8px radius.
4. **Product row on mobile** puts price and the Add control in one `flex justify-between` line at the bottom of the card, with the stepper at 44px. Today the mobile quantity input is `h-10 w-16` (40px) — raise to 44.
5. **The spec drawer** (`Shop.tsx:322–345`) becomes a full-height bottom sheet below `sm` (slide up, `rounded-t-[16px]`) rather than a right-edge slide-in — right-edge drawers on a phone conflict with iOS back-swipe.
6. **Tables** keep the existing stacked-card fallback; only the label typography changes (§6.8).

### Thumb reach

Assume a 390 × 844 device held one-handed. The comfortable zone is the **bottom 55%** and the **inner 80%** horizontally.

- **Primary actions live in the bottom 45%.** `Add to order`, `Show N items`, `Continue to PO number`, `Sign in` must never require a reach above the vertical midpoint. In the cart drawer this is already right (`App.tsx:283–307`); in the filter sheet it is wrong (fix per §8.1b).
- **The top 20% is for identity and navigation only** — brand, branch, cart, search. Nothing destructive and nothing frequent goes there.
- **Destructive controls go top-right**, deliberately out of reach: `Remove` in the cart (`App.tsx:280`) currently sits inline next to `+`, one thumb-slip from the increment button. Move it to the row's top-right as an icon button with a 44px target and a confirmation on tap.
- **Bottom sheets open with their primary action within 120px of the bottom edge**, above the safe-area inset.
- Never place an interactive element inside the bottom `env(safe-area-inset-bottom)` region or within 8px of the tab bar's top edge.

### Minimum tap target

> **44 × 44 CSS px, no exception, including for elements whose visible box is smaller.** Where the visual control must be smaller (a 20px close ✕, a 24px chip dismiss), expand the hit area with padding or a pseudo-element:
> `relative before:absolute before:-inset-3 before:content-['']`
>
> Adjacent targets need **8px of clear space** between hit areas.

Current violations to fix:
| Location | Now | Fix |
|---|---|---|
| `ui.tsx:42` `Btn size="sm"` | `h-9` (36px) | `h-10` (40) minimum, `h-11` (44) in any mobile-primary position |
| `Shop.tsx:129,143` qty stepper input | `h-9`/`h-10` | `h-11` (44) via the shared stepper (§6.7) |
| `App.tsx:271,276` cart +/− | `h-10 w-10` (40) | `h-11 w-11` (44) |
| `Shop.tsx:59` facet checkbox | `h-[17px] w-[17px]` | keep the 17px box, wrap the `<label>` in `py-2.5 -mx-2 px-2` for a 44px row |
| `App.tsx:151` search clear ✕ | `h-8 w-8` (32) | `h-11 w-11` (44), icon stays 16px |
| `App.tsx:103` branch selector | text-only, ~18px tall | `py-2 -mx-2 px-2`, 40px total |
| `App.tsx:222` footer nav links | `.lab` text, ~14px | `py-2.5`, 44px rows |
| `Shop.tsx:246` filter chip dismiss | `py-1.5` (~26px) | `py-2.5 px-3` → 40px, with 8px gaps |
| `App.tsx:267` tab bar item | `h-[60px]` full-width — OK | keep; only reduce to 58 with `gap-1` |

---

## 9. Prioritized implementation list

Ranked by visual impact per hour. Items 1–5 are the ones that answer the client. Do them in order; the app will look like a different product after item 3.

| # | Change | File(s) | Est. | Impact | Why here |
|---|---|---|---|---|---|
| **1** | **Kill the uppercase default.** Delete `.lab` from `index.css:71`; remove `text-transform: uppercase` from `.disp` (`index.css:69`); add `.eyebrow`, `.ident`, `.num`. Then replace all 48 `Lab`/`lab` call sites and all 75 `disp` uses per §4 — buttons, nav, table headers, tags, field labels become 11/13/15px Inter sentence case. | `src/index.css`, `src/ui.tsx`, `src/App.tsx`, all 10 `src/views/*.tsx` | 4–5 h | **Highest.** This alone is ~60% of the "wireframe" read. | Nothing else matters while every label is shouting. |
| **2** | **Swap the palette + the font stack.** Paste the §3 `:root` block over `index.css:7–53`. Change the `@import` to Barlow Condensed 600/700 + Inter 400/500/600/700 + IBM Plex Mono 400/500, and `body { font-family: 'Inter', … }`. Fix the two orange accessibility bugs: `ui.tsx:44` (white on `--safety`, 3.7:1) → `--safety-2`; all orange *text* → `--safety-2`. | `src/index.css`, `src/ui.tsx` | 1–1.5 h | **Very high.** | Two files, ~90 lines. Everything downstream inherits it because the codebase already reads from tokens. |
| **3** | **Rebuild the product plate.** Convert `Glyph` to filled two-tone marks with a contact shadow and per-category color (§7.1, §7.3); retune `.plate`; raise the mark to 76–78%; grow the row plate 92 → 128px at `sm+`. Add the six missing marks + explicit `BY_SKU` rows so all 24 SKUs are distinct (§7.2). | `src/glyph.tsx`, `src/index.css`, `src/views/Shop.tsx` | 4–6 h | **Very high.** | This is what the client means by "reads as a wireframe." A catalog is judged on its product column. |
| **4** | **Rebuild the header + search assembly** per §6.12: delete `.tape` from the header, one rounded 48px search unit with a real shadow and a teaching placeholder, branch shows a place, utility strip 11px mono → 13px Inter, cart badge rounds. Recompute the `lg` rail's sticky offset (`App.tsx:168`, `140px` → `132px`). | `src/App.tsx` | 2.5–3 h | **Very high.** | On every screen, every session. Highest surface-area-per-line in the app. |
| **5** | **Rebuild the product row** per §6.2: title 14.5 → 18px, the two-column `<dl>` of `.lab` terms becomes one sentence-case compliance strip with a clickable OSHA cite, hover becomes a background wash, plate grows, padding 16 → 20px at `sm+`. Rebuild the price block per §6.3 (list price in `--ink` not `--ink-2`; contract price identical in size and position; savings in dollars first). | `src/views/Shop.tsx`, `src/auth.tsx` (`Price`, lines 310–338) | 3–4 h | **Very high.** | The catalog row is the product. Item 3 fixed its picture; this fixes its words and its number. |
| 6 | **Normalize radius and elevation.** Apply §5: 4/6/10/full only, `--e1…--e4` as literal shadow strings, `.lift` loses its `translateY`. Eliminate every square-cornered interactive element (`App.tsx:141,148,154,174`; `Shop.tsx:59,129,143`). | `src/index.css`, `src/ui.tsx`, `src/App.tsx`, `src/views/Shop.tsx` | 2–2.5 h | High | Cheap and it removes the last "unfinished" tell. |
| 7 | **Retire the near-black rules.** Replace every `border-[hsl(var(--ink))]` used as a hairline with `--rule`, and restructure `Head` per §6.9 (divider below the sub, `mb-8`). ~11 occurrences across `ui.tsx:107,139`, `App.tsx:98,236,265`, `Shop.tsx:191`, plus views. | `src/ui.tsx`, `src/App.tsx`, `src/views/*.tsx` | 1.5 h | High | Kills the technical-drawing grammar. |
| 8 | **Rebuild the button set + input + stepper** per §6.4, §6.5, §6.7. Add the shared `Stepper` primitive and replace the three ad-hoc copies. Enforce one `solid` per view. | `src/ui.tsx`, `src/App.tsx`, `src/views/Shop.tsx` | 2–2.5 h | High | Fixes the 3.7:1 contrast failure, the 36px targets, and mono-in-a-name-field in one pass. |
| 9 | **Rebuild the hero** per §7.4: split layout, portrait photo frame, delete both scrims, headline moves to `--ink` on `--ground`, one `h-1` orange bar on the photo only. | `src/views/Home.tsx` (lines 32–75) | 2 h | High | The first thing anyone sees, and it currently wastes the best asset in the repo. |
| 10 | **Rebuild the left nav + mobile tab bar** per §6.10, §6.11: rounded pills, 3px indicator, drop the rail's `border-r`, drop the tab bar's 2px orange top edge, add `backdrop-blur`. | `src/App.tsx` | 1.5 h | Med-high | Persistent chrome; small change, noticeable calm. |
| 11 | **Rebuild the data table** per §6.8: rounded shadowed wrapper, sticky header, `--rule` header border, sentence-case headers, neutral row hover, `--safety-soft` reserved for selection, 16px cell padding. | `src/ui.tsx` (82–130) | 1.5 h | Med-high | Carries `Ops`, `Users`, `Account`, `Dashboard` all at once. |
| 12 | **Mobile tap targets + filter sheet.** Work the §8 violation table. Give the filter sheet a sticky footer, a drag handle, `rounded-t-[16px]`, `--e4`; move sort into it below `sm`; convert the spec drawer to a bottom sheet on phones. | `src/views/Shop.tsx`, `src/App.tsx`, `src/ui.tsx` | 2.5–3 h | Med-high | Correctness more than beauty, but the sheet's unreachable Apply button is a real usability bug. |
| 13 | **Tag/badge system** per §6.6: soft + solid families, status dots, `Frequently bought` orange → marine, `steel` → `marine`. | `src/ui.tsx`, `src/views/Shop.tsx` | 1 h | Med | Small, but it reclaims the orange budget. |
| 14 | **Grid/list view toggle** on the catalog (Grainger ships grid / list / table), with the §6.1 card. Persist the choice in `localStorage`. | `src/views/Shop.tsx`, `src/ui.tsx` | 3–4 h | Med | New capability, not a fix. Do it once 1–9 land. |
| 15 | **Search typeahead** with category matches and product rows (§6.12), per Grainger's documented pattern. | `src/App.tsx`, `src/data.ts` | 4–5 h | Med | Highest *functional* value in the list, but it is a feature, and the client's complaint is visual. |
| 16 | **Category tiles as composed plates** (§7.5) — export 7 static 2× images from the existing SVGs. | `src/views/Home.tsx`, `src/assets/` | 2 h | Med | Makes the homepage look merchandised rather than diagrammed. |
| 17 | **Photo captions + placement** for `lee-screen-2` and `lee-detail` (§7.4). | `src/views/Home.tsx`, `src/views/Screen.tsx` | 1.5 h | Low-med | Credibility, cheap. |
| 18 | **`image?: string` on `Product` + a `<Plate>` component** with photo/glyph fallback (§7.6), so supplier photography drops in per SKU without layout work. | `src/data.ts`, `src/glyph.tsx` (new `Plate`) | 1 h | Low now, high later | Do it while item 3 is open — it is 20 minutes then, and an afternoon later. |

**Total for items 1–5: roughly 15–20 hours**, and it is the block that answers "as good as or better than Home Depot's and QXO's apps." Items 6–9 (another ~7 hours) close the gap on polish. Everything from 10 down is refinement.

### Definition of done for items 1–5

- `grep -r "text-transform: uppercase" src/` returns one match (`.eyebrow`).
- `grep -rc "lab" src/` returns zero `className` hits.
- Every `text-[Npx]` in `src/` is one of `11, 13, 15, 18, 22, 28, 40, 52`.
- Every `rounded-` in `src/` is one of `[4px] [6px] [8px] [10px] [16px] full` (plus `-t-`/`-b-` variants).
- No white text sits on `hsl(var(--safety))`; all white-on-orange uses `--safety-2`.
- No `border-[hsl(var(--ink))]` is used as a 1px hairline.
- Every SKU in `data.ts` matches a `BY_SKU` glyph entry (the dev-mode assertion is silent).
- Every interactive element measures ≥44 × 44 in the mobile viewport.
