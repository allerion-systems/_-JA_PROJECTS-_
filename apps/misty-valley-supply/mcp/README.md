# Misty Valley Supply — MCP Server

Construction safety catalog exposed to agents over the Model Context Protocol.

The catalog carries **the consensus standard each product is built to and the OSHA
citation that requires it** as structured data. That is what makes
`check_compliance` possible, and it is the only thing here a competitor cannot
copy by scraping a product page.

```
32 passed, 0 failed          node src/smoke.js
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
| `quote_roofscreen` | Budget for a shop-fabricated roof screen frame |
| `create_quote` | Prices lines, enforces minimums, dates the quote |
| `place_order` | **Refuses without a PO number and explicit human approval** |
| `list_classifieds` | The Yard — surplus, equipment, crews, wanted |
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
the agent API cannot drift apart. Regenerate it when the catalog changes.

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
