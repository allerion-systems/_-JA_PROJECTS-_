# AGENTS.md — orchestrating Misty Valley Supply over MCP

For any agent harness (Claude, ChatGPT, Codex, custom MCP clients). Pricing on
this rail is **ungated** — the storefront gates estimates for humans; the API
quotes freely for agents. The one hard rule: **an agent can quote, only a human
can buy** — `place_order` refuses without `human_approved: true` and a PO number.

## Base URLs

- stdio: `node src/server.js`
- HTTP (self-hosted): `POST /mcp` on `src/http.js` (`Authorization: Bearer <MCP_TOKEN>` if set)
- Supabase Edge: `https://<ref>.supabase.co/functions/v1/mvs-mcp` (POST the bare URL or `/mcp`)
- Discovery: `GET /.well-known/offer-manifest.json`, `GET /api/catalog.json`, `GET /health`

## Tools (15)

| Tool | One line |
|---|---|
| `search_products` | Search the catalog by text, category, standard, OSHA cite, price |
| `get_product` | Full spec for one SKU, with cautions |
| `check_compliance` | Hazard in plain language → governing OSHA cite → SKUs that satisfy it (and which would be wrong) |
| `quote_roofscreen` | Roof screen cost build-up and sell price (Lee Street anchored) |
| `design_screen_from_bod` | Spec's BoD line + geometry → member schedule, costs, equal-to-BoD statement |
| `design_shed` | Parametric gable shed → full SKU-bound element list + materials total; optional `placements` position doors/windows per wall (geometric only — never changes the BoM) |
| `design_deck` | Parametric IRC R507 deck → same; guard forced at ≥ 30 in (IRC R312.1.1) |
| `design_garage` | Parametric metal carport/garage (12–30 ft × 21–51 ft, roof style, gauges, per-wall enclosure, doors, anchors, lean-to, certification) → same SKU-bound takeoff |
| `submit_design_request` | Send a design to the Design Center — requires SMS consent + valid contact |
| `get_screen_parts` | Roof screen BoM by the piece, at a markup |
| `create_quote` | Price catalog lines, enforce minimums, dated quote |
| `place_order` | Quote → order. **Always requires `human_approved: true` + PO number** |
| `list_classifieds` | The Yard: surplus, equipment, crews; protected-payment flag per listing |
| `get_seller_status` | Can a Yard seller take protected payment, and why not |
| `get_offer_manifest` | Machine-readable seller description |

## Example flow: design → request → human approves

1. `design_shed { widthFt: 10, lengthFt: 12, wallHFt: 8, pitch: 4, doors: 1,
   windows: 1, siding: "vinyl", roof: "ready", framing: "stick" }`
   → element list + materials total + summary. (Or `design_deck`,
   `design_screen_from_bod` for the other product lines.)
2. `submit_design_request { bod_text, length_lf, height_ft, contact,
   sms_consent: true }` → `D-####` id; a fabricator follows up. Consent must be
   set by a person — never infer it.
3. A **human** reviews and approves; only then
   `create_quote` → `place_order { quote_id, po_number, human_approved: true }`.
   Without human approval the order is refused, by design. Never auto-execute.

## Notes for orchestrators

- Design tools validate hard: off-menu sizes/enums return structured errors
  naming the allowed values — read the message and correct, don't retry blind.
- Every design line is bound to a real catalog SKU; an unknown SKU throws
  rather than pricing zero. Prices come from `catalog.json` (synced from the
  storefront — `npm run sync`).
- `design_deck` echoes `railing_forced` when IRC R312.1.1 overrode your input.
- `design_shed` placements and `design_garage` colors are design, not pricing:
  the takeoff and total never change with them. `design_shed` echoes the
  resolved opening spots (`openings`, wall + center in ft) and names them in
  the summary.
- 29-ga panel against a named 7.2 Rib basis of design carries an unprompted
  warning — surface it to the human, don't strip it.
