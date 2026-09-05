# Misty Valley Supply — store, agent API, and the ERP spec

Prototype build, 5 September 2026.

| | |
|---|---|
| **`store/`** | React + TypeScript storefront. Catalog, roof screen configurator, classifieds, back office, agent API page. Bundles to a single self-contained `bundle.html`. |
| **`mcp/`** | Working MCP server — the same catalog exposed to agents over stdio. **32/32 end-to-end tests green.** |

## The idea in one line

**Every product carries the consensus standard it is built to and the OSHA
citation that requires it, as structured data** — which is what makes
`check_compliance` possible, and what a competitor cannot copy by scraping a
product page.

## Run

```bash
cd store && pnpm install && pnpm dev        # storefront
cd mcp   && npm install  && npm run smoke   # agent API, end-to-end test
```

## What is real and what is not

**Real:** the catalog with standards and citations as data; the MCP server; the
offer manifest; the storefront; the Odoo module map in §Operations.

**Not yet:** a hosted HTTPS endpoint with auth; payments; live supplier pricing
and availability; Odoo deployed as the system of record.

**Odoo is a Python and PostgreSQL server application (LGPLv3).** It cannot run
inside a browser tab. `store/src/views/Ops.tsx` §Odoo maps every screen to the
module that should actually run it — Sales, Purchase, Inventory (the native
dropship route), MRP for the fabricated items, Website eCommerce. Nearly all of
it is configuration, not custom code.

**Standards and OSHA citations are accurate. Prices, stock and suppliers are
placeholders.**
