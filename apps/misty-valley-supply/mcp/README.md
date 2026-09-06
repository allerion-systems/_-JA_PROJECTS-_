# Misty Valley Supply — MCP Server

Construction safety catalog exposed to agents over the Model Context Protocol.

The catalog carries **the consensus standard each product is built to and the OSHA
citation that requires it** as structured data. That is what makes
`check_compliance` possible, and it is the only thing here a competitor cannot
copy by scraping a product page.

```
117 passed, 0 failed         node src/smoke.js
```

---

## Run it

```bash
npm install
node src/server.js      # stdio
npm run smoke           # end-to-end test against the real server
```

## Add it to Claude

**Claude Code**

```bash
claude mcp add misty-valley-supply -- node /absolute/path/to/mvs-mcp/src/server.js
```

**Claude Desktop** — `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "misty-valley-supply": {
      "command": "node",
      "args": ["/absolute/path/to/mvs-mcp/src/server.js"]
    }
  }
}
```

---

## Tools

| Tool | Does |
|---|---|
| `search_products` | Free text across name, SKU, standard and OSHA cite; filters by category and price |
| `get_product` | Full spec for one SKU, including cautions |
| **`check_compliance`** | **Hazard in plain language → the OSHA rule → what satisfies it, and what does not** |
| `quote_roofscreen` | Cost build-up and sell for a shop-fabricated roof screen, anchored on the real Lee Street job (frame `$14 + $7/ft` per LF, panel by SF, mount adder, drawings line, 71.4% default markup). Warns when 29 ga panel is quoted against a 7.2 Rib basis of design |
| `design_screen_from_bod` | Given the spec's basis-of-design line and geometry: member schedule, itemized cost build-up, sell, and the equal-to-BoD statement for the substitution request |
| `design_shed` | Full 5D takeoff for a gable storage shed (8/10/12 ft wide, stick or truss, vinyl or none, roof-ready or metal, ramp/loft/cupola) — every element SKU-bound and priced from the catalog, same BoM engine as the storefront's Shed Designer |
| `design_deck` | Full 5D takeoff for a ledger-hung PT deck per IRC R507. The guard is **forced on at ≥ 30 in above grade** (IRC R312.1.1) regardless of input |
| `submit_design_request` | Sends a design request to the Design Center — refuses without SMS consent and reachable contact details |
| `get_screen_parts` | The 8-part roof screen bill of materials, priced by the piece at a given markup |
| `create_quote` | Prices lines, enforces minimums, dates the quote |
| `place_order` | **Refuses without a PO number and explicit human approval** |
| `list_classifieds` | The Yard — surplus, equipment, crews, wanted. Each listing carries `protectedPayment` per the seller gate; payment is authorize-then-capture (card held up to 7 days, captured on pickup confirmation) — Misty Valley never holds the money |
| `get_seller_status` | Whether a Yard seller can take protected payment (signed agreement + Stripe onboarding + payouts enabled), with the reason |
| `get_offer_manifest` | Machine-readable seller description |

### The one that matters

```jsonc
// → check_compliance
{ "hazard": "unprotected edge, 24 ft above lower level",
  "task":   "roof re-cover, 8 workers, 3 weeks" }
```

Returns the governing citation, the products that satisfy it, and — the part
that makes it trustworthy — **the products that would be wrong**:

> `MVS-LY-SA6` requires about 18.5 ft of clearance below the anchor. On a low
> roof this does not clear. Use a self-retracting lifeline.

A store that only ever says yes is a catalog. A store that tells you when you
are about to buy the wrong thing is a supplier.

---

## The rule we do not break

**An agent can quote. Only a human can buy.**

`place_order` requires `human_approved: true` and a PO number. Nothing
auto-executes — not for a customer's agent, and not for ours. The smoke test
asserts this, so it cannot regress quietly.

---

## Data

`catalog.json` is generated from the storefront's `src/data.ts`, so the shop and
the agent API cannot drift apart. Regenerate it when the catalog changes:

```bash
npm run sync            # node scripts/sync-catalog.js [path/to/data.ts]
```

The sync script strips the TypeScript syntax from `data.ts`, imports the data as
a plain module, converts the two formula fields (`frameCostLf`, `hatRows`) into
serializable coefficients/tables, verifies the Lee Street anchors (24 products,
8 screen parts, `frameCostLf(3.5) = $38.50/LF`, every listing has a seller
account), and writes `catalog.json`.

**Standards and OSHA citations are accurate. Prices, stock levels and suppliers
are placeholders for a prototype.**

## Not yet

- Hosted HTTPS transport with bearer auth — needs a server and a domain
- Payments — needs a processor and a merchant account
- Live pricing and availability — needs supplier feeds
- Odoo Community as the system of record — see `../store` §Operations for the
  module map

## Licence

MIT.
