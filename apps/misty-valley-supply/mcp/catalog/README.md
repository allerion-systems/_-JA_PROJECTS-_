# MVS Product Master
Generated catalog exports. Source of truth is `src/data.ts` (PRODUCTS + SCREEN_PARTS) — never edit these CSVs by hand.

- `product-master.csv` — one row per SKU (44): pricing, department, compliance cite/note, image status, seller. Contract Price and Barcode are blank because data.ts carries neither; GTINs are never fabricated.
- `odoo-products-import.csv` — Odoo 19 Community `product.template` import. `standard_price` = contract price where present, else 60% of list. type=consu, sale_ok/purchase_ok=TRUE.

## Regenerate

    node scripts/build-catalog.mjs

## Import into Odoo 19

Inventory > Products > Products > gear menu > Import records. Upload `odoo-products-import.csv`; map `default_code` -> Internal Reference (the other columns auto-map by name, `categ_id/name` creates product categories). Test first with "Test" before importing.

The Google Sheet copy of the catalog is generated from `product-master.csv` — re-upload after each regeneration.
