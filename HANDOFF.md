# Misty Valley Supply — local-agent handoff

State as of 2026-09-05. Everything below is executable by any local agent (Claude Code,
Codex) with this repo cloned. Branch: `claude/misty-valley-supply-structure-7f0rif` (PR #18).

## ACTIVE JOB — Project Fiberworks (455SQ re-roof RFQ, quote due Tuesday 9/8)

Jobsite: **Fibreworks Corporation, 2301 Brennen Business Court, Jeffersontown
(Louisville), KY 40299** — occupied rug/carpet manufacturing plant; ~45,500 sf roof.
Customer: Scott Waldman, R&B Roofing. Ben's spec: 455 SQ high-rib insulated metal roof
panel, **1.5" core FIRM**, American suppliers only, middle pricing.

- Package + selection rule: `ventures/misty-valley/RFQ-455SQ-PACKAGE.md`
- Supplier research: `ventures/misty-valley/RFQ-455SQ-IMP.md`
- **Live outreach status + Monday call sheet: `ventures/misty-valley/rfq-455sq-outreach-log.md`**
  (as of 9/7: AWIP + SRS Bowling Green RFQ'd by email with Jeffersontown freight,
  PermaTherm quote form in; Metl-Span / Kingspan / McElroy / QXO Louisville / ABC
  E-town are phone calls at Monday open; quotes land in the MVS procurement inbox)
- Workbook for bids: `ventures/misty-valley/rfq-455sq-comparison.xlsx`
- Occupied manufacturing building ⇒ listed/labeled panels only; the do-not list in the
  package (no Chinese-origin substitution, disclosure gate before Ben quotes Scott)
  governs. China-import pricing exists ONLY for the separate container venture:
  `ventures/misty-valley/11-china-import-tariff-brief.md`.

## What is DONE and pushed
- Store app: `apps/misty-valley-supply/store/` — React/TS/Vite, navy/gold MVC brand,
  departments, 78 products, 3D Design Center (screens + sheds + decks, 5D/IFC BoM),
  contractor portal (roof reports, $18/sheet takeoffs), Services (drafting language),
  SRS-style auth, PWA, cost/markup gated behind `cost.view` with 60% floor.
- MCP server: `apps/misty-valley-supply/mcp/` — v0.3.0, 12 tools incl.
  `design_screen_from_bod` + `submit_design_request`, 91/91 smoke (`node src/smoke.js`).
- Research: `research/COMPETITOR-MAP-I65.md`, `research/CONFIGURATOR-TEARDOWN.md`,
  `ventures/misty-valley/18-dropship-suppliers.md`, `ventures/allerion/API-PRODUCT-AND-MVS-DEAL.md`.
- Live prototype (claude.ai artifact): https://claude.ai/code/artifact/bbb1b31b-dec7-438f-b115-d3b8ee58627e

## Build & verify commands (run in `apps/misty-valley-supply/store/`)
- `npm install` then `npx tsc --noEmit -p tsconfig.app.json --ignoreDeprecations 6.0`
  (TS6133 unused-var notes are ignorable) and `npx vite build`.
- Catalog regen: `node scripts/build-catalog.mjs` (86 rows expected).
- Stripe sync (needs a restricted key, never committed):
  `STRIPE_KEY=rk_... node scripts/stripe-sync.mjs --links`

## UNFINISHED — the image harvest (highest priority)
Product images live at `store/src/assets/products/<sku-lowercase>.jpg` and self-wire by
filename (glob loader in `productImages.ts`). 800x800 JPEG ~q78. Currently on disk in
the cloud session: originals (5) + mvs-cx-20ot. Two harvests were in flight:

1. **Replit batch (24 AI photos, already generated and safe).**
   Replit app "MVS Product Photos", replId `3b5991e7-100e-4c2e-be07-def96603df42`,
   owner account jallee9544. Images: `artifacts/construction-catalog/public/images/*.jpg`
   (24 files, SKU filenames). ALSO exported as base64 text at
   `artifacts/construction-catalog/public/text/` (`manifest.json` + `<sku>.b64.part*.txt`).
   Easiest local path: open the Repl in Replit, download the images folder, drop the
   jpgs into `store/src/assets/products/`. The deployment
   (https://lawful-first-presses.replit.app) is PRIVATE — flip it public in
   Deployments → Settings to enable plain curl of `/images/<sku>.jpg`.
2. **Free-license batch (Openverse CC0/PDM).** For remaining SKUs, search
   `https://api.openverse.org/v1/images/?q=<query>&license=cc0,pdm&page_size=10`,
   download, center-crop 800x800 q78, save by SKU. Rules: cc0/pdm preferred, cc-by only
   with attribution recorded in `store/catalog/ATTRIBUTIONS.md`; never nc/nd/sa; never
   retailer/manufacturer images; photo must clearly depict the product or skip.
   Per-SKU generation prompts (for any image model instead): `store/catalog/image-prompts.md`.
   After adding images: update nothing — they self-wire. Rebuild, commit, push.

## Publishing the artifact (from a Claude session only)
`npx vite build --config vite.artifact.ts` then inline the emitted css/js into
`dist-artifact/index.html` (replace the `<script src>` / stylesheet link tags with
inline contents) and republish to the artifact URL above.

## Blocked on Joey (unchanged)
- Netlify: builds queue at account level — app.netlify.com/projects/misty-valley-supply.
- Stripe: connector grant is a test sandbox; reconnect picking the Allerion account
  (acct_1PeBVvRppuigERuv) in Stripe's authorize-page account switcher — or use the
  local stripe-sync script with a restricted key.
- Gamma credits / OPENAI_API_KEY / GEMINI_API_KEY: any one enables full AI image runs.

## Standing rules (do not relax)
- Never show cost/markup/margin on customer-facing surfaces; markup floor 60%.
- Never the word "escrow"; authorize-then-capture only; Stripe holds funds.
- "Sealed Drawings & Calculations — drafted by us, sealed by licensed partner
  engineers" — never market "engineering services" (KRS 322).
- Superior Metals never appears on customer-facing surfaces.
- No fabricated GTINs/certs; never "OSHA certified"; image disclosure caption stays.
- Delivery-location copy says "jobsite", never "deck" (roof-deck spec language is fine).
- Commits: conventional style; no model IDs in committed content.

## gstack (added 2026-09-06)
"G stack" = Garry Tan's (YC CEO) open-source Claude Code setup: 23 specialist
agents + power tools as slash commands (/office-hours, /plan-ceo-review,
/review, /qa, /design-review, /ship, /investigate, /retro …), MIT license.
Install on any machine by pasting into Claude Code:

  git clone --single-branch --depth 1 https://github.com/garrytan/gstack.git \
    ~/.claude/skills/gstack && cd ~/.claude/skills/gstack && ./setup

Requires Bun v1.0+. After install: /office-hours to brief it, /plan-ceo-review
on features, /review on branches, /qa on the staging URL. A read-only clone
lives at /home/user/garrytan/gstack in cloud sessions for reference; the
cloud session's permission policy blocks self-installing skills, so the
install is a local-machine step.
