# Misty Valley Supply — Contract Template Pack

> DRAFT TEMPLATE — generated for internal review. Not legal advice. A Kentucky-licensed attorney must review and approve before any use with a customer.

Drafts for Misty Valley Supply ("MVS"), a construction materials and prefab structures distributor in Bonnieville, Kentucky (Hart County). Entity details are TBD throughout — the attorney completes them. Payments run on Stripe authorize-then-capture: cards are authorized at order/milestone and captured only when the triggering event (e.g., confirmed supplier ship date) occurs; MVS never holds customer funds itself.

## The Attorney-Review Rule

**No document in this pack, and no instance generated from it, goes in front of a customer until a Kentucky-licensed attorney has reviewed and approved the template.** These files are working drafts prepared to make that review efficient. The verbatim disclaimer at the top of every file stays in place until the attorney removes it on an approved version.

## Index

| File | What it is |
|---|---|
| `sales-terms.md` | Standard terms of sale: preorder authorize/capture flow, title & risk at delivery, special-order items non-returnable, manufacturer-warranty pass-through only, liability cap, KY law / Hart County venue. |
| `design-fabrication-agreement.md` | Configured structures (studios, containers, docks, barndos, warehouses): scope = the model's BoM as quoted, model-repriced change orders, customer owns site/permits/locates, delivery & set, milestone authorize/capture payments. |
| `drawing-package-addendum.md` | Paid drawing add-on ($450 drafted / $1,400 sealed): drafted from the priced model after signing; sealed tier performed by licensed partner engineers (KRS 322) — MVS drafts, never engineers; MVS retains IP, customer gets a this-project-this-site license. |
| `dock-purchase-rider.md` | Floating docks: USACE shoreline-use permit is the customer's (MVS provides permit sketch only), water-level/act-of-god exclusions, anchoring-per-plan condition on warranty pass-through. |
| `dropship-supplier-agreement.md` | MVS-side dealer/dropship form: supplier ships direct to MVS's customer, blind-ship preferred, MVS is merchant of record, supplier compliance/cert warranties, defect indemnification, no supplier contact of MVS customers. |
| `modular-design-build-loi.md` | Non-binding LOI for Modular Projects leads (hotels, schools, etc.): planning range is not an offer, scope develops through design-build, deposit applies to design phase, either party may exit before a definitive agreement. |

## Review Protocol (pipeline the software will implement)

Every customer-facing contract *instance* generated from an approved template passes an automated consistency check before it is presented for human signature:

1. **Source of truth.** The order record (order confirmation, priced configuration model output, and customer record) is the sole source for instance fields.
2. **Field check.** The generator diffs the rendered document against the order record: customer legal name and address, project/site address, SKUs and BoM line items, quantities, prices and milestone amounts, tier selections, dates, and referenced attachment identifiers must match exactly. Any mismatch, missing field, or leftover template blank blocks the instance.
3. **Template integrity.** The instance is verified as generated from the current attorney-approved template version (hash/version check). Edited or stale-template instances are blocked.
4. **Terminology guard.** A lint pass rejects prohibited language (e.g., any use of "escrow"; any claim that MVS holds funds, provides engineering, or offers its own warranty).
5. **Human signature last.** Only an instance that passes all checks is released for review and signature by an MVS principal and the customer. The check log is stored with the signed instance.

The pipeline validates data consistency only — it is not a substitute for the attorney's legal review of the templates themselves.

## Conventions

- Blanks (`______`) and *italic field notes* mark per-instance data or attorney-to-complete items.
- No statutes are cited by number except KRS 322 (Kentucky professional engineering licensure), referenced in the drawing package addendum.
- Riders and addenda inherit the base agreement's governing-law, venue, and liability terms unless they say otherwise.
