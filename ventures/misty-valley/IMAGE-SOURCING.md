# Real Product Photos — Sourcing Operation

*Directive: every product shows a photo of the exact material we sell. Ben's instinct —
the factory's own photos — is correct. The method is a licensed image pack, not a
screenshot. Same pictures, no takedown risk, no exact-item misrepresentation.*

## The rule (why no screenshots, one paragraph)
A supplier's product photo is their copyright; using it without permission invites a
DMCA takedown of our listings the week we launch. And a photo must show the item we
actually ship — picture factory A, ship factory B, and it's an FTC misrepresentation
plus a returns magnet. The fix costs one sentence per supplier: "Please send your
product image pack and written OK to use the images in our listings for the SKUs we
carry." Suppliers say yes — our listing sells their product.

## The ask (paste into every supplier email/call — Ben)
> As part of setting up our account, please send product photography for the items
> we'll carry (web-resolution is fine) and written confirmation we may use the images
> in our online listings and quotes. If you have a dealer media kit or image portal,
> a link works.

## Per-supplier tracker
| Supplier | SKUs covered | Image channel | Status |
|---|---|---|---|
| ASD (safety-devices.com) | PPE range | Dealer program EXPLICITLY licenses images/copy on approval | Apply (Monday stack) |
| FrenchCreek Fall Safety | Fall protection | Distributor program supplies CSV + images | Apply (Monday stack) |
| TASCO | PPE | Ask with account setup (resale cert) | Apply (Monday stack) |
| Metl-Span / Kingspan | IMP panels (455-sq RFQ + future) | Ask in the RFQ reply thread | Fold into Mon calls |
| McElroy Lewisport | Panels/trim | Dealer counter — ask rep | Fold into Mon calls |
| Steel framing mill/distributor (Cameron Ashley path) | 12 SF- SKUs | Manufacturer image library (ClarkDietrich publishes product photos for customers) | With dealer account |
| Tommy Docks | Dock SKUs | Dealer application; media on approval | Application queued |
| Eagle Carports (or chosen carport mfr) | Garage/carport line | Dealer marketing kit — standard in this industry | With dealer application |
| Import factories (container houses; any China-direct buy) | IM- SKUs | Ask the factory rep directly for photo pack + permission line in writing (WeChat/email); factories supply gladly to buyers | With first PO conversation |
| Elijah (Hart County builds) | Premium portables, STR units | OUR OWN photos of his actual builds — the best images in the store; phone camera, golden hour, 6 angles per unit | Joey/Ben visit with a phone |

## Priority order
1. **Elijah's units** — zero permission needed, they're ours, and real photos of the
   actual premium portables beat anything a factory sends. This weekend's job.
2. **ASD + FrenchCreek** — programs that hand over images as part of approval; covers
   the PPE glyphs fastest.
3. **Panel suppliers in the live RFQ** — the image ask rides the quote thread for free.
4. Everything else lands as accounts open.

## Interim rule (already in effect)
Until a SKU's licensed photo arrives, it shows our CAD-rendered representative image
with the standing disclosure ("Representative image. Supplier photography drops in per
SKU as it arrives."). A render we made is honest; a screenshot we took is not.

## Intake SOP
Photos land in `src/assets/products/` as `mvs-<sku>.jpg` (auto-wires). Keep the
permission email/PDF per supplier in `ventures/misty-valley/image-permissions/`
(create on first receipt — the folder IS the audit trail). Never publish an image
whose permission isn't filed.
