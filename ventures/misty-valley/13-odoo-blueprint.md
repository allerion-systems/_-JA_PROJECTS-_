# 13 — Odoo Operating Blueprint for Misty Valley Supply

**Source basis:** every claim below was read from the actual clone at `/home/user/odoo/odoo`
(Odoo Community, branch head b6709b3e). The tree is **Odoo 19.0**
(`odoo/release.py: version_info = (19, 0, 0, FINAL, 0, '')`, `license = 'LGPL-3'`), 638 addon
directories under `addons/`. Business objects are mapped against
`/home/user/mvs-store/src/data.ts` (PRODUCTS, SCREEN_PARTS, ROOFSCREEN, ORDERS, SUPPLIERS) and
`/home/user/mvs-store/src/rbac.ts` (PERMS, ROLES, DIRECTORY).

File citations are relative to `/home/user/odoo/odoo` unless prefixed with `mvs-store`.

---

## 1. The manufacturing spine (mrp)

Module: `addons/mrp/__manifest__.py` — `'name': 'Manufacturing'`, `depends: ['product', 'stock',
'resource']`, `license: 'LGPL-3'`. Fully present in Community.

### 1.1 `mrp.bom` — and the phantom ("Kit") BoM

`addons/mrp/models/mrp_bom.py: class MrpBom(models.Model), _name = 'mrp.bom'`:

```python
type = fields.Selection([
    ('normal', 'Manufacture this product'),
    ('phantom', 'Kit')], 'BoM Type',
    default='normal', required=True)
```

Related models in the same file: `class MrpBomLine, _name = 'mrp.bom.line'` (fields
`product_id`, `product_qty`, `product_uom_id`, `bom_id`) and
`class MrpBomByproduct, _name = 'mrp.bom.byproduct'` (byproducts — usable for drop/offcut
tracking in the shop, not needed day one).

**How `type == 'phantom'` actually behaves (this is the kit-or-piece mechanism):**

- **A kit is never manufactured.** When a stock move for a kit product is confirmed, the move is
  *replaced* by moves of the components. `addons/mrp/models/stock_move.py: def action_explode(self)`
  (line ~374): it finds the phantom BoM via
  `self.env['mrp.bom'].sudo()._bom_find(move.product_id, ..., bom_type='phantom')`, calls
  `bom.sudo().explode(...)`, then `_generate_all_phantom_moves(lines)` /
  `_generate_move_phantom(...)` create one stock move per component and the kit move disappears
  from the picking. `_action_confirm` in the same file calls `action_explode()` on every move and
  additionally re-explodes any move whose `product_id.is_kits` slipped through
  (line ~366).
- **Recursive explosion with UP-rounding.** `mrp_bom.py: def explode(self, product, quantity, ...)`
  (line ~419) walks nested kits breadth-first and rounds each leaf line
  `product_uom_id.round(line_quantity, rounding_method='UP')` — i.e. 31.2 bases becomes 32 EA on
  the delivery. This rounding is load-bearing for the per-LF kit design in §7b.
- **On the sale side** (`addons/sale_mrp/models/sale_order_line.py: _prepare_qty_delivered`,
  line ~33): a sale line whose product has a phantom BoM computes `qty_delivered` from
  `moves._compute_kit_quantities(...)` — the kit counts as delivered **only in the proportion the
  full component set has shipped**. Ship the frame but not the panel and the kit line stays
  undelivered, so invoicing-on-delivery stays honest.
- **Guard rails in the source:**
  - `mrp_bom.py` line ~352, `@api.constrains('product_tmpl_id','product_id','type')`: *"You can
    not create a kit-type bill of materials for products that have at least one reordering
    rule."* — the kit SKU itself can never have an orderpoint (its components can).
  - `mrp_bom.py` line ~214: you cannot flip a BoM off `phantom` once stock moves reference its
    lines; `addons/sale_mrp/models/mrp_bom.py` line ~14 blocks archiving/retyping a kit BoM used
    by open sale orders.

**Verdict for MVS:** `phantom` is exactly "sell the screen as a kit OR by the piece." The 8
`SCREEN_PARTS` SKUs are ordinary storable products, each sellable alone at its own price; the kit
SKU is a product with a phantom BoM over them. One catalog, two selling motions, one inventory
truth. Pricing note: a kit sale line prices at the *kit product's* list/pricelist price, not the
sum of components — which is what MVS wants ($12,000 sell against ~$7,000 component cost).

### 1.2 `mrp.production` — the MO lifecycle

`addons/mrp/models/mrp_production.py: class MrpProduction, _name = 'mrp.production'` (name from
`_description`; states at line ~177):

```python
state = fields.Selection([
    ('draft', 'Draft'), ('confirmed', 'Confirmed'), ('progress', 'In Progress'),
    ('to_close', 'To Close'), ('done', 'Done'), ('cancel', 'Cancelled')], ...)
```
Help text in the source: draft = not confirmed; confirmed = "the stock rules and the reordering
of the components are trigerred" (sic); progress = production started; to_close = produced,
awaiting close; done = stock moves posted.

A separate computed `reservation_state` (line ~192): `('confirmed','Waiting')`,
`('assigned','Ready')`, `('waiting','Waiting Another Operation')` — this is the shop's "can we
start?" flag.

### 1.3 Component availability / reservation

- `mrp_production.py: def action_assign(self)` (line ~1703) → `production.move_raw_ids._action_assign()`.
- `addons/stock/models/stock_move.py: def _action_assign(self, force_qty=False)` (line ~2041)
  reserves via `_update_reserved_quantity` (line ~1903), which writes
  `addons/stock/models/stock_quant.py: def _update_reserved_quantity(...)` (line ~1108) —
  reservation is literally an increment of `stock.quant.reserved_quantity`.
- Readiness policy lives on the BoM: `mrp_bom.py: ready_to_produce` selection
  `('all_available', 'When all components are available')` / `('asap', 'When components for 1st
  operation are available')`, consumed by `mrp_production.py: _get_ready_to_produce_state`
  (line ~1472). BoM `consumption` field (`flexible`/`warning`/`strict`) governs over/under
  consumption at close.

### 1.4 Work centers and routing — Community has them

- `addons/mrp/models/mrp_workcenter.py: class MrpWorkcenter, _name = 'mrp.workcenter'` — with
  `costs_hour` (hourly processing cost), `oee` / `oee_target`, `capacity_ids`
  (`mrp.workcenter.capacity`), productivity loss tracking (`mrp.workcenter.productivity.*`).
- `addons/mrp/models/mrp_routing.py: class MrpRoutingWorkcenter, _name = 'mrp.routing.workcenter'`
  — operations attached directly to a BoM (`bom_id` m2o, `sequence`, `workcenter_id`,
  `time_cycle_manual`, `time_mode` fixed/computed, `cost_mode` actual/estimated, operation
  dependencies via `blocked_by_operation_ids`). Work orders: `addons/mrp/models/mrp_workorder.py`
  (model `mrp.workorder`, created by `mrp_production.py: button_plan → _plan_workorders`).
- **What is Enterprise-only, proven by absence from this tree:** the addon directory
  `mrp_workorder` (the tablet "Shop Floor" app with per-step instructions, quality worksheets)
  does **not** exist under `addons/` (checked). Neither do `quality`/`quality_control`,
  `mrp_plm`, `mrp_mps` (master production schedule), `mrp_maintenance`, or `stock_barcode`.
  Community *does* ship `maintenance` (equipment/maintenance requests) and `repair`.
  So: BoMs, kits, MOs, work centers, operations, work orders, OEE, per-hour costing — Community.
  Tablet shop-floor UI, quality checks, PLM/ECO, MPS scheduling — Enterprise, absent here.
- Costing hook exists in Community: `addons/mrp_account/` (present) rolls work-center time and
  component cost into valuation/analytics.

---

## 2. Inventory (stock)

Module `addons/stock/__manifest__.py: 'name': 'Inventory'`.

Core models, all in `addons/stock/models/`:

| Model | File / class | What MVS uses it for |
|---|---|---|
| `stock.move` | `stock_move.py: class StockMove, _name = 'stock.move'`; states `draft / waiting / confirmed / partially_available / assigned / done / cancel` (line ~107) | Every quantity that moves; the atom under pickings, MOs, dropships |
| `stock.quant` | `stock_quant.py: class StockQuant, _name = 'stock.quant'`; `quantity`, `reserved_quantity`, computed `available_quantity = quantity - reserved_quantity` (line ~119) | On-hand per location/lot; cycle counts via `inventory_quantity` / `inventory_diff_quantity` |
| `stock.picking` | `stock_picking.py: class StockPicking`; states `draft / waiting / confirmed / assigned / done / cancel` | The pick queue (`pick.queue` perm in rbac.ts), receipts (`receive.post`), deliveries |
| `stock.rule` / `stock.route` | `stock_rule.py: class StockRule` (`action` selection incl. `pull`/`push`/`buy` — `buy` added by purchase_stock; `procure_method` `make_to_stock`/`make_to_order`/`mts_else_mto`); `stock_location.py: class StockRoute, _name = 'stock.route'` (line ~518) with `product_selectable`, `product_categ_selectable`, `warehouse_selectable` flags | Routing engine: which rule fires when a sale line needs product |
| `stock.warehouse.orderpoint` | `stock_orderpoint.py: class StockWarehouseOrderpoint, _name = 'stock.warehouse.orderpoint'` — `product_min_qty`, `product_max_qty`, `trigger` (`auto`/`manual`), computed `qty_to_order` | Reordering rules for the few stocked SKUs (hard hats, glasses, gloves with `moq: 12` in data.ts) |

### 2.1 The dropship route — MVS's main flow (16 of 24 catalog SKUs are `fulfil: "dropship"`)

Addon: `addons/stock_dropshipping/` — present in Community.
`__manifest__.py`: *"adds a pre-configured Drop Shipping operation type as well as a procurement
route… goods are directly transferred from vendors to customers… no internal transfer document"*;
`depends: ['sale_purchase_stock']`.

How it is wired, from the source:

1. **The route record**: `stock_dropshipping/data/stock_data.xml` creates
   `stock_dropshipping.route_drop_shipping` (`stock.route` "Dropship") with
   `sale_selectable`, `product_selectable`, `product_categ_selectable` all true — so it can be
   set on the product, the product category, or per sale-order line.
2. **The rule**: `stock_dropshipping/models/res_company.py: _create_dropship_rule` creates one
   `stock.rule` per company: `action='buy'`, `location_src=Vendors`, `location_dest=Customers`,
   bound to a `stock.picking.type` with the new code `'dropship'`
   (`stock_dropshipping/models/stock.py: class StockPickingType` adds
   `selection_add=[('dropship', 'Dropship')]`; sequence prefix `DS/` from
   `res_company.py: _create_dropship_sequence`).
3. **Sale confirm → procurement**: `addons/sale_stock/models/sale_order_line.py:
   _action_launch_stock_rule` (line ~385) runs procurements for confirmed lines; on a line whose
   route (line-level `route_ids`, product, or category) is Dropship, the matching rule's action
   is `buy`.
4. **`buy` → PO**: `addons/purchase_stock/models/stock_rule.py: def _run_buy(self, procurements)`
   (line ~59) picks the vendor via `rule._get_matching_supplier(...)` (reads
   `product.supplierinfo` price/min-qty/date validity), groups procurements into an existing
   draft PO for the same vendor when one matches `_make_po_get_domain`, else creates the
   `purchase.order` as SUPERUSER. If no vendor is configured it raises
   *"There is no matching vendor price to generate the purchase order…"* — so §7c's supplierinfo
   setup is mandatory, not cosmetic.
5. **PO keeps the SO identity**: `stock_dropshipping/models/stock.py: class StockRule:
   _get_procurements_to_merge_groupby` deliberately refuses to merge PO lines across different
   `sale_line_id`s *"to compute the delivered quantities"* — each dropship PO line stays pinned to
   its sale line.
6. **PO confirm → dropship transfer**: `stock_dropshipping/models/purchase.py:
   class PurchaseOrder._create_picking` — for a `picking_type_id.code == 'dropship'` PO feeding
   multiple SOs it creates **one picking per sale order**. `stock.py: class StockPicking`
   computes `is_dropship` when `location_id.usage == 'supplier'` and
   `location_dest_id.usage == 'customer'` — validating that DS/ transfer books the goods
   vendor → customer in one move; no receipt, no delivery, but `qty_delivered` on the SO line
   still advances (that same move is the sale line's move).
7. **Both documents cross-link**: `addons/sale_purchase/models/purchase_order.py:
   sale_line_id = fields.Many2one('sale.order.line', string="Origin Sale Item")` and related
   `sale_order_id`; SO side shows `dropship_picking_count`
   (`stock_dropshipping/models/sale.py`). This is what makes data.ts's
   `ORDERS[..].route: "Dropship ×2"` a real screen, not a label.

### 2.2 Reordering rules

`addons/stock/models/stock_orderpoint.py`: min/max with `trigger='auto'` (scheduler) or
`'manual'` (replenishment screen); `qty_to_order` computed against forecast. Note again the mrp
constraint: an orderpoint on a kit product is refused (`mrp_bom.py` line ~357) — put orderpoints
on components and stocked PPE, never on the kit SKU.

Multi-branch (BON / EZT / BWG / LOU in rbac.ts DIRECTORY): `stock.warehouse`
(`addons/stock/models/stock_warehouse.py`) is multi-record in Community; one warehouse per
branch, orderpoints and routes are per-warehouse.

---

## 3. Sell side (sale)

Module `addons/sale/__manifest__.py: 'name': 'Sales'`.

### 3.1 `sale.order` lifecycle and invoicing policy

`addons/sale/models/sale_order.py`:

```python
SALE_ORDER_STATE = [('draft', "Quotation"), ('sent', "Quotation Sent"),
                    ('sale', "Sales Order"), ('cancel', "Cancelled")]
```
plus a separate `locked` boolean (there is no separate 'done' state in 19; locking replaces it).
`invoice_status` on order and line (`sale_order_line.py` line ~262):
`upselling / invoiced / to invoice / no`.

Invoicing policy is a **product** field: `addons/sale/models/product_template.py`:

```python
invoice_policy = fields.Selection([('order', "Ordered quantities"),
                                   ('delivery', "Delivered quantities")], ...)
```
`sale_order_line.py: qty_delivered` (line ~230) with `qty_delivered_method` — `'stock_move'` for
storable goods (fed by pickings/dropships), `'manual'` for services like MVS-RSE-SHP shop
drawings. For MVS: `delivery` policy on goods (invoice what shipped — matters when a dropship
vendor short-ships), `order` policy on the engineering line.

### 3.2 Customer credit — what Community actually has

Fields live in `addons/account/models/partner.py` (class inheriting `res.partner`):

- `credit = fields.Monetary(compute='_credit_debit_get', string='Total Receivable', ...)` —
  posted open receivables.
- `credit_limit = fields.Float(company_dependent=True, ...)` with helper
  `use_partner_credit_limit` — *"Set a value greater than 0.0 to activate a credit limit check"* —
  and `show_credit_limit` gated on the **company setting** `account_use_credit_limit`
  (`addons/account/models/company.py` / `res_config_settings.py`).
- `credit_to_invoice` — placeholder here (`_compute_credit_to_invoice: # To be overridden in
  Sales`), overridden in `addons/sale/models/res_partner.py` to add confirmed-but-uninvoiced
  sale amounts.

Enforcement — read carefully, because this is the honest finding:

- `addons/sale/models/sale_order.py: partner_credit_warning` (line ~307) computed by
  `_compute_partner_credit_warning` (line ~787): only when state in `('draft','sent')` and the
  company setting is on, it calls
  `addons/account/models/account_move.py: _build_credit_warning_message` (line ~2014), which
  compares `partner.credit + credit_to_invoice + current_amount` to `partner.credit_limit` and
  returns a **text message** ("%(partner_name)s has reached its credit limit of…").
- That text renders as a yellow banner on the quotation and on draft invoices
  (`account_move.py: partner_credit_warning`, line ~755). **Nothing in this tree blocks
  `action_confirm` on a sale order or posting an invoice when the limit is exceeded.** There is
  no credit-hold state, no approval gate, no portal checkout block (no `credit_limit` reference
  anywhere under `addons/website_sale/` — grepped).

**So:** Community gives you the number, the exposure math (including open SOs), and a warning
banner. The rbac.ts `ar.manage` behavior — "put accounts on hold at 35 days" — must be a human
procedure, or a ~20-line `base_automation` rule (addon `base_automation` present in Community)
that rejects confirmation when `partner_credit_warning` is non-empty. Recommended at MVS size:
start with the banner + the AR aging follow-ups (`account_followup` is not in this tree — chase
manually from the aged receivable view) and add the blocking automation once terms customers
exceed a handful.

### 3.3 Payment terms

`addons/account/models/account_payment_term.py: class AccountPaymentTerm, _name =
'account.payment.term'` and `class AccountPaymentTermLine, _name = 'account.payment.term.line'`
with `value` (`percent`/`fixed`), `value_amount`, `nb_days`, `delay_type`
(`days_after`, `days_after_end_of_month`, …), and early-payment discount fields
(`early_discount`, `discount_percentage`, `discount_days`,
`early_pay_discount_computation`) — so "Net 30" is one line `percent 100, nb_days=30,
delay_type='days_after'`, and "2/10 Net 30" is the same with `early_discount=True,
discount_percentage=2, discount_days=10`. Default term per customer:
`property_payment_term_id` on the partner (`account/models/partner.py` line ~716 lists it among
commercial fields). Supplier side mirror: `property_supplier_payment_term_id` — captures
data.ts SUPPLIERS terms (Net 30 / Net 15 / "Prepay until reviewed" = immediate).

---

## 4. Buy side (purchase)

Module `addons/purchase/__manifest__.py: 'name': 'Purchase'`.

- `addons/purchase/models/purchase_order.py`: states
  `draft ('RFQ') / sent ('RFQ Sent') / to approve / purchase / cancel` plus `locked`. The
  `to approve` state backs a two-step approval (order amount limit per company) — matching
  rbac.ts `po.create` vs `po.approve` and the owner dashboard item "PO 4471 — over the $25k
  approval limit".
- **Supplier pricelists**: `addons/product/models/product_supplierinfo.py: class
  ProductSupplierinfo, _name = 'product.supplierinfo'`, `_order = 'sequence, min_qty DESC,
  price, id'` — fields `partner_id` (vendor), `product_tmpl_id`/`product_id`, `price`,
  `discount`, `min_qty` (*"quantity to purchase from this vendor to benefit from the unit
  price"* → data.ts `moq: 12/24`), `delay` (*"Lead time in days between the confirmation of the
  purchase order and the receipt"* → data.ts `lead: "2–4 days"`), `date_start`/`date_end`,
  vendor's own `product_name`/`product_code` (printed on the RFQ — useful since suppliers don't
  know MVS-* SKUs).
- **Dropship PO ↔ SO linkage**: see §2.1 items 5–7; the PO line's `sale_line_id`
  (`addons/sale_purchase/models/purchase_order.py` line ~93) is the join, and
  `sale_purchase/models/purchase_order.py: sale_order_count/_get_sale_orders` puts the smart
  button on the PO. Cut-off times (data.ts `cut: "3:00 PM ET"`) have **no field in this tree** —
  model them as a note on the vendor record or add a custom field; the scheduler only knows
  `delay` days.

---

## 5. Pricing (`product.pricelist`)

`addons/product/models/product_pricelist.py: class ProductPricelist, _name = 'product.pricelist'`
and `product_pricelist_item.py: class ProductPricelistItem, _name = 'product.pricelist.item'`:

- `applied_on`: `3_global` (all products) / `2_product_category` / `1_product` /
  `0_product_variant`; `min_quantity`; `date_start/date_end`.
- `base`: `list_price` (sales price) / `standard_price` (cost) / `pricelist` (chain to another
  pricelist via `base_pricelist_id`).
- `compute_price`: `fixed` / `percentage` / `formula`. The math, from
  `_compute_price` (line ~570): percentage does
  `price = base_price - (base_price * (self.percent_price / 100))`; formula adds
  `price_discount` (negative = markup, per `price_markup` compute), `price_round`,
  `price_surcharge`, and min-margin clamps.
- Assignment to the customer: `addons/product/models/res_partner.py:
  property_product_pricelist = fields.Many2one('product.pricelist', ...)` — one pricelist per
  partner; every quote for that partner prices through it.

**The store's "18% off list" for R&B Roofing** (rbac.ts `price.contract`, cust_buyer dashboard
"Your discount 18% off list, Net 30") is one pricelist with one global percentage item — see
§7d. Whether the customer *sees* it as a discount vs a net price is a sale settings toggle
(`compute_price` help text: "Use the discount rules and activate the discount settings in order
to show discount to customer").

---

## 6. The external API — how the storefront and the Yard talk to Odoo

This tree changed the API story vs older Odoo, and it matters for a greenfield integration:

- **Legacy endpoints still exist but are formally deprecated.** Addon `addons/rpc/`
  (`__manifest__.py`: "provides the /xmlrpc and /jsonrpc endpoints", `auto_install: True`).
  `rpc/controllers/xmlrpc.py` routes `/xmlrpc/<service>` and `/xmlrpc/2/<service>`;
  `rpc/controllers/jsonrpc.py` routes `/jsonrpc`. Both log
  `rpc/controllers/__init__.py: RPC_DEPRECATION_NOTICE`: *"The /xmlrpc, /xmlrpc/2 and /jsonrpc
  endpoints are deprecated in Odoo 19 and scheduled for removal in Odoo 22."*
- **Legacy auth/dispatch**: `odoo/http.py: def dispatch_rpc(service_name, method, params)`
  (line ~428) routes service `object` to `odoo/service/model.py: def dispatch(method, params)`:
  params are `(db, uid, passwd, model, method, args, kw)`, password/API-key checked via
  `res.users._check_uid_passwd`, then `execute_cr → call_kw`. Only `execute` and `execute_kw`
  are accepted. `service/model.py: get_public_method` blocks `_`-prefixed and `@api.private`
  methods.
- **The endpoint to build on: `/json/2/<model>/<method>`.**
  `addons/rpc/controllers/json2.py: class WebJson2Controller`:

  ```python
  @http.route('/json/2/<__model__>/<__method__>', methods=['POST'],
              auth='bearer', type='json2', readonly=..., save_session=False)
  ```
  Plain JSON body `{"ids": [...], "context": {...}, **kwargs}` → `get_public_method` →
  `func(records, **kwargs)`; recordset results serialize to id lists. Auth is
  `Authorization: Bearer <api-key>`:
  `odoo/addons/base/models/ir_http.py: _auth_method_bearer` (line ~212) checks the token against
  `res.users.apikeys._check_credentials(scope='rpc', key=token)`
  (model `odoo/addons/base/models/res_users.py` line ~1520 `_name = 'res.users.apikeys'`;
  keys are generated per user with expiry via `_generate`). There is also a self-documenting
  `/doc` playground: addon `addons/api_doc/` ("dynamic documentation page for developpers at the
  /doc URL", `auto_install`), and `/web/version` for version discovery
  (`rpc/controllers/__init__.py`).

**Concrete store ↔ Odoo surface** (all via `POST /json/2/...`, one dedicated
`store-integration` Odoo user + API key, access rights trimmed to these models):

| Store need (from data.ts / rbac.ts) | Model.method | Notes |
|---|---|---|
| Catalog sync (SKU, name, list price, uom, OSHA/std attributes) | `product.product` `search_read` | Put `std`/`osha`/`why` in custom fields (`x_std`, `x_osha_cite`, `x_why`) or `product.template` attributes so they come back as data, exactly as `ODOO_MAP` in data.ts prescribes ("build it as data not text") |
| Customer-specific price (18% off) | `product.pricelist` `_get_product_price` is private (underscore) — **not callable remotely**; instead read the partner's pricelist and either replicate the one percentage rule client-side or create a draft order and read back `price_unit` | Simplest robust pattern: `sale.order` `create` + `read` of `order_line.price_unit` for a cart quote |
| Order push with customer PO number | `sale.order` `create` with `partner_id`, `client_order_ref` (field at `sale/models/sale_order.py` line ~85 — *"Customer Reference"*), `order_line: [(0,0,{product_id, product_uom_qty})]`, then `action_confirm` | Confirm triggers dropship POs automatically (§2.1) |
| Order status ("Staged", "Picking", ETA) | `sale.order` `read` of `state`, `invoice_status`, `expected_date`, `commitment_date`; `stock.picking` `search_read` on `sale_id`/origin with `state` | Map picking states → the storefront's Staged/Picking labels |
| Credit check before checkout (`credit.view`) | `res.partner` `read` of `credit`, `credit_limit` (needs an API user in group `account.group_account_invoice` — the fields are group-gated in `account/models/partner.py`) | Enforcement stays on the store side; Odoo only warns (§3.2) |
| Inventory for stocked SKUs | `product.product` `read` of `qty_available`, `free_qty`, `virtual_available` (`addons/stock/models/product.py` lines ~52–78) | Dropship SKUs: skip; show vendor `delay` instead |

The Yard does **not** get an API key. Its only touchpoints are §7e.

---

## 7. The concrete Misty Valley configuration (stand-up runbook)

### 7a. Module install list (every name is an addon directory verified present in this tree)

Install (dependencies auto-pull `base`, `web`, `product`, `analytic`, `payment`, `uom`, `rpc`,
`api_doc`):

1. `contacts` — customers, suppliers, branches as partners
2. `sale_management` (dir present; the Sales app UI over `sale`)
3. `account` — **"Invoicing"** (`account/__manifest__.py: 'name': 'Invoicing'`) — AR/AP, payment
   terms, credit limit fields, aged receivables
4. `l10n_us` — US chart of accounts (present)
5. `purchase` — RFQ/PO, approval threshold
6. `stock` — warehouses per branch, pickings, quants, orderpoints
7. `purchase_stock`, `sale_stock`, `sale_purchase` — auto-install glue (present as dirs) for
   buy-rules, delivery-from-SO, SO↔PO links
8. `stock_dropshipping` — the Dropship route (§2.1)
9. `mrp` — BoMs/kits/MOs/work centers
10. `sale_mrp` — kit `qty_delivered` logic (§1.1)
11. `mrp_account` — production costing
12. `stock_delivery` / `delivery` — delivery costs on orders (dir `delivery` = "Delivery Costs");
    optional day one
13. `base_automation` — the credit-block automation when ready (§3.2)
14. `auth_totp` (present) — 2FA for internal users; `auth_passkey` also present

Explicitly **not** installed: `website_sale` (the storefront exists outside Odoo — though the
addon is present in Community if MVS ever wants to collapse the stack), `crm` (later, it's
present), any payment acquirer (`payment_stripe` present but Stripe stays in the Yard, §7e).

### 7b. Lee Street as Odoo data

**Products** (all `product.product`, type `consu` with "Track Inventory" on, i.e. storable —
BoM domain in `mrp_bom.py` requires `type = 'consu'`):

- The 8 `SCREEN_PARTS` SKUs from data.ts, each with its own UoM (`LF`, `EA`, `SF`, `LOT`) and
  sell price = cost × (1 + 0.714 markup) per `ROOFSCREEN.defaultMarkup`:
  `MVS-RSF-SC3` ($38.50/LF cost), `MVS-RSB-SQ` ($46/EA), `MVS-RSH-HAT` ($1.95/LF),
  `MVS-RSP-26` ($1.85/SF), `MVS-RSP-29`, `MVS-RSS-STC` ($0.62/EA), `MVS-RSA-ANC` ($268/EA),
  `MVS-RSE-SHP` (service product, `invoice_policy='order'`, $850 + $3.25/LF quoted manually).
- One kit product per screen height, sold **per LF**: `MVS-RSK-35` "Roof screen kit, 3'-6",
  per LF (SC3 equal)". List price per LF from the Lee Street reality: $12,000 / 156 LF =
  **$76.92/LF**.

**The phantom BoM** — `mrp.bom` on `MVS-RSK-35`, `type='phantom'`, `product_qty=1`,
`product_uom_id=LF`. Lines (`mrp.bom.line`), quantities per data.ts's own model
(`ROOFSCREEN.hardware`, `lee.bay = 5`, `hatRows(3.5) = max(2, ceil(3.5/2)) = 2`):

| Component | qty per 1 LF | At 156 LF (explode result) |
|---|---|---|
| MVS-RSF-SC3 frame | 1.0 LF | 156 LF |
| MVS-RSB-SQ base | 0.2 EA (one per post at 5'-0" bays) | 31.2 → **32 EA** (explode() rounds UP per UoM — `mrp_bom.py` explode, `rounding_method='UP'`; matches a closed 156-LF perimeter at 5' bays. An open run needs one more post — add 1 EA manually on the order) |
| MVS-RSH-HAT hat channel | 2.0 LF (2 rows at h=3'-6") | 312 LF |
| MVS-RSP-26 panel | 3.5 SF (screen height) | 546 SF |
| MVS-RSS-STC screws | 3.5 EA (1 per panel SF — the SKU note in data.ts says "Ordered by panel SF, not guessed"; note the hardware cost model carries only $0.62/LF, a discrepancy to settle with the shop) | 546 EA |

Not in the kit (matching `kit: false` in SCREEN_PARTS): MVS-RSP-29 budget panel, MVS-RSA-ANC
anchors ("a screen base is NOT a fall-arrest anchor"), MVS-RSE-SHP engineering — quoted as their
own SO lines. Cost sanity check against the real job: 156 × $38.50 = $6,006 frame + 546 × $1.85
= $1,010 panel ≈ the $6,000 + $1,000 in `ROOFSCREEN.lee`; sold at 156 × $76.92 = $12,000. ✔

**The frame is what the shop actually makes** — so `MVS-RSF-SC3` gets a second BoM,
`type='normal'`, per 1 LF, with raw-material lines (galv round tube, stainless connectors —
new raw SKUs, not in data.ts) and `operation_ids` (`mrp.routing.workcenter`):

1. "Cut & cope" — work center **Screen Shop / Saw** (`mrp.workcenter`, `costs_hour` set from
   shop labor)
2. "Fit & weld" — **Screen Shop / Weld**
3. "Label & bundle" — **Screen Shop / Assembly** ("Delivered in labeled sections" —
   ROOFSCREEN.bullets)

Put the **Manufacture + Replenish on Order (MTO)** routes on MVS-RSF-SC3 (routes exist once
`mrp` is installed; route selectability per §2.2). Then the single flow is: SO for 156 LF of
MVS-RSK-35 → confirm → kit explodes onto the delivery (32 bases, 312 LF hat, 546 SF panel…) →
the frame line's MTO pull fires a `mrp.production` for 156 LF through the three operations →
MO `done` posts frame stock → delivery reserves (`stock.quant.reserved_quantity`) → ship in one
pick. Selling by the piece is just… selling the part SKUs directly; same products, no second
catalog. The fabrication lead's queue (rbac.ts `fab.queue`, dashboard "Lee Street II — 156 LF @
3'-6" — Cut list ready") is the MO list filtered on `reservation_state`.

**Also fabricate-flagged in data.ts**: MVS-SKY-48 skylight screens and MVS-HOLE-4 hole covers —
same pattern, `normal` BoM each, no kit needed.

### 7c. Dropship configuration for the 16 dropship SKUs

data.ts marks 16 PRODUCTS `fulfil: "dropship"` across 4 suppliers (Bluegrass PPE ×~11,
Midwest Safety ×3, Ohio Valley Rail ×3, Ridgeline ×4 — per-SKU `supplier` field).

1. Install `stock_dropshipping` — the route, DS/ picking type, and vendor→customer rule
   self-create per company (§2.1, `res_company.py` hooks in the addon's `stock_data.xml`).
2. On each of the 16 products: **Purchase tab** → one `product.supplierinfo` line: vendor,
   `price` (landed cost basis), `min_qty` from data.ts `moq` (12 for hard hats/glasses/gloves,
   24 for Type O vests), `delay` from data.ts `lead` upper bound (e.g. "3–5 days" → 5).
   Without this line `_run_buy` errors (§2.1 item 4).
3. **Inventory tab** → tick route **Dropship** (route is `product_selectable`). Faster: set it
   once on product categories mirroring data.ts CATEGORIES, since the route is
   `product_categ_selectable`.
4. Vendors as partners with `property_supplier_payment_term_id` per data.ts SUPPLIERS (Net 30,
   Net 15, immediate for Ohio Valley's "Prepay until reviewed").
5. Flow check: confirm SO → draft PO per vendor appears (grouped, but one PO line per SO line —
   §2.1 item 5) → buyer confirms before the vendor cut-off (cut-off itself is procedural, §4) →
   DS/ transfer validates when the vendor confirms shipment → SO line `qty_delivered` moves →
   invoice on delivered.

The 5 stocked-behavior SKUs (hot PPE with MOQs) can carry **both** a normal buy route and
orderpoints (`stock.warehouse.orderpoint` min/max per branch warehouse) instead of Dropship —
that split is exactly data.ts's `dropshipPct: 71`.

### 7d. The R&B Roofing pricelist (18% off list)

1. `product.pricelist` "R&B Roofing — Contract" (USD).
2. One `product.pricelist.item`: `applied_on='3_global'`, `base='list_price'`,
   `compute_price='percentage'`, `percent_price=18.0` → engine computes
   `price = list − list × 0.18` (`product_pricelist_item.py: _compute_price`, §5).
3. On partner R&B Roofing: `property_product_pricelist` → this pricelist;
   `property_payment_term_id` → "Net 30" (`account.payment.term` line: percent 100,
   `nb_days=30`, `delay_type='days_after'`); `credit_limit` = 75,000 with company setting
   `account_use_credit_limit` on (matches cust_admin dashboard "Credit available $51,240 of
   $75,000" — remembering the limit only warns, §3.2).
4. Carve-outs (fabricated screens shouldn't silently take 18% off): add higher-priority items
   (`applied_on='1_product'`, `compute_price='fixed'` at list) for MVS-RSK-35 and MVS-RSE-SHP —
   item resolution order is `_order = "applied_on, min_quantity desc, categ_id desc, id desc"`
   so product-specific rules beat the global one.

### 7e. What stays OUTSIDE Odoo, and the touchpoints

Per data.ts's own `ODOO_MAP`: *"Classifieds — Not Odoo. Separate app. Do not bolt a marketplace
onto your ERP."* That holds.

- **The Yard (marketplace)**: listings, seller agreements, Stripe Connect accounts
  (`SELLERS` in data.ts with `acct_*`, onboarding, payout state), authorize/capture holds,
  application fees — all in the Yard app + Stripe. Odoo touchpoints: **none transactional.**
  Monthly, the office (rbac.ts `payout.view`) books one summary journal entry of application-fee
  revenue and Stripe fees into `account` — via `/json/2/account.move/create` or by hand. Yard
  sellers are *not* Odoo partners unless they also become customers.
- **Job Site Earth** (`site.*` perms): entirely outside; nothing in this tree models it. If a
  job site should annotate an order, it's a text tag on the SO (`client_order_ref` or a custom
  field).
- **The storefront**: outside; integrates via §6's `/json/2` table. Stripe checkout for
  card-paying storefront customers stays in the storefront; the resulting Odoo SO is created
  already-paid (`payment_term` immediate) — do not run card flows through Odoo `payment_stripe`
  in v1.
- **RBAC mapping**: rbac.ts internal roles → Odoo groups: owner = Settings/admin; gm =
  Sales admin + Inventory admin + Invoicing "Billing"; counter = Sales: own+all docs; buyer =
  Purchase admin; warehouse = Inventory user; fab = Manufacturing user; office = Invoicing
  Billing (+ the `account.group_account_invoice` gate that unlocks `credit`/`credit_limit`
  fields, §3.2). driver has no Odoo seat (PoD stays in the delivery flow outside; Community here
  has no fleet-routing app — `fleet` addon present is vehicle admin, not routing). Customer
  roles (cust_admin/cust_buyer/cust_field) = Odoo **portal** users (free, addon `portal`
  present) — they see their orders/invoices; the storefront remains the primary surface.

### 7f. Hosting reality

- **Odoo Online (SaaS)**: runs Enterprise editions only, no custom addons/server access;
  priced per user per month. Wrong fit — MVS needs Community (license cost $0) and full API
  freedom.
- **Odoo.sh**: Odoo's PaaS for **Enterprise** subscribers (it requires an Enterprise
  subscription plus per-worker hosting fees, ~$60+/mo before user licenses). Buys CI/staging
  MVS doesn't need yet.
- **Self-hosted Community** (recommendation): this exact tree, `odoo-bin` + PostgreSQL
  (`odoo/release.py: MIN_PG_VERSION = 13`, Python 3.10–3.14 per `MIN_PY_VERSION`/
  `MAX_PY_VERSION`) on one small VPS. A 2 vCPU / 4–8 GB box (Hetzner/DigitalOcean/Lightsail
  class) runs a <15-user instance comfortably: **~$12–40/mo** for the VM + ~$5–10/mo offsite
  Postgres dumps + a domain/TLS via Caddy or nginx + Let's Encrypt ($0). Total **≈ $20–50/mo**,
  $0 license, unlimited users, unrestricted `/json/2` API, and the `rpc`/`api_doc` addons ship
  in-tree. Ops burden is real but small: nightly `pg_dump`, monthly OS patches, one command
  (`./odoo-bin -u all`) for point upgrades; major-version upgrades are a project — plan one
  weekend a year. For a company with near-zero revenue this is the only defensible answer;
  revisit Odoo.sh/Enterprise only when the gaps in §8 start costing real money.

---

## 8. Honest limits — what Community lacks that MVS will feel

Each verified by directory absence/presence under `addons/` in this clone:

| Gap | Evidence | Does it bite at MVS size? |
|---|---|---|
| **No Barcode app** | `stock_barcode` absent; only `barcodes`/`barcodes_gs1_nomenclature` (scanner input parsing libs) present | Mild. One warehouse person (T. Hines) picking ~10 orders/day works from the picking screen; revisit at 50+ picks/day |
| **No shop-floor tablet / quality** | `mrp_workorder`, `quality`, `quality_control` absent | Low. The shop is one fab lead (A. Duvall); work orders + printed MO travelers suffice. Weld QC stays on paper — fine, the PE-sealed calcs (MVS-RSE-SHP) are the real compliance artifact and they live as SO lines + attachments (`product_document`/`ir.attachment` in-tree) |
| **Invoicing, not full accounting reports** | `account/__manifest__.py` names the module **"Invoicing"**; `account_accountant` and `account_reports` absent | Medium. Ledger, journals, aged partner balances exist; polished financial statements, bank feeds, follow-up automation don't. At MVS revenue: export to the accountant (`/json/2` or CSV) monthly; the `account_check_printing` addon (present) covers vendor checks |
| **No delivery-route planning / PoD** | No fsm (`industry_fsm` absent), no route optimizer anywhere in tree; `delivery` = shipping-cost lines only | Real but small: M. Coffey's route + signature capture (rbac.ts `delivery.run`, `route.plan`) stays in whatever the store app already does; Odoo just needs the picking validated |
| **No MPS / PLM / maintenance-on-MRP** | `mrp_mps`, `mrp_plm`, `mrp_maintenance` absent (`maintenance` itself present) | None at one shop, two jobs in queue |
| **Credit limit warns, never blocks** | §3.2 source reading | The one gap worth code: a `base_automation` rule (~20 lines) or a standing procedure for the office role |
| **No e-sign / documents / approvals apps** | `sign`, `documents`, `approvals` absent | Seller agreements (Yard) and credit applications stay in the current tooling; PO approval threshold is covered natively by purchase's `to approve` state |
| **XML-RPC on a clock** | `rpc/controllers/__init__.py` deprecation notice: gone by Odoo 22 | Build the storefront integration on `/json/2` + bearer keys from day one; nothing to migrate later |

---

## Appendix — key source citations in one place

- `odoo/release.py` — 19.0, LGPL-3, PG≥13, Python 3.10–3.14
- `addons/mrp/models/mrp_bom.py` — `MrpBom` (`type` normal/phantom, `explode()` UP-rounding,
  kit-vs-orderpoint constraint), `MrpBomLine`, `MrpBomByproduct`
- `addons/mrp/models/stock_move.py` — `action_explode`, `_generate_move_phantom`
- `addons/sale_mrp/models/sale_order_line.py` — kit `qty_delivered` via `_compute_kit_quantities`
- `addons/mrp/models/mrp_production.py` — MO `state`, `reservation_state`, `action_assign`
- `addons/mrp/models/mrp_workcenter.py`, `mrp_routing.py` — `mrp.workcenter`,
  `mrp.routing.workcenter`
- `addons/stock/models/` — `stock_move.py`, `stock_quant.py`, `stock_picking.py`,
  `stock_rule.py`, `stock_location.py` (`stock.route`), `stock_orderpoint.py`
- `addons/stock_dropshipping/` — route data, per-company rule/picking type, PO-per-SO pickings,
  no-merge-across-sale-lines rule
- `addons/purchase_stock/models/stock_rule.py: _run_buy` — procurement → PO
- `addons/sale_purchase/models/purchase_order.py` — `sale_line_id` link
- `addons/sale/models/sale_order.py` — states, `client_order_ref`, `partner_credit_warning`
- `addons/sale/models/product_template.py` — `invoice_policy`
- `addons/account/models/partner.py` — `credit`, `credit_limit`, `use_partner_credit_limit`
- `addons/account/models/account_move.py: _build_credit_warning_message` — warning-only
- `addons/account/models/account_payment_term.py` — terms + early-discount
- `addons/product/models/product_supplierinfo.py` — vendor price, `min_qty`, `delay`
- `addons/product/models/product_pricelist.py`, `product_pricelist_item.py`,
  `product/models/res_partner.py: property_product_pricelist`
- `addons/rpc/controllers/{xmlrpc,jsonrpc,json2}.py`, `odoo/http.py: dispatch_rpc`,
  `odoo/service/model.py: dispatch/execute_cr/call_kw/get_public_method`,
  `odoo/addons/base/models/ir_http.py: _auth_method_bearer`,
  `odoo/addons/base/models/res_users.py: res.users.apikeys`
