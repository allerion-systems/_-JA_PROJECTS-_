# Amazon Fee Model — all 24 catalog SKUs

Prepared 2026-09-05. Method and assumptions first, then the table, then the honest shortlist.

## Assumptions (stated, so they can be argued with)

- **COGS = 70% of store list price** (store's *assumed* ~30% gross per the brief; note the back-office KPI shows 27.4% realized, so every margin below is ~2.6 pts optimistic — the shortlist survives that haircut, the marginal rows do not).
- **Amazon price = store list price.** Policy: never undercut the own store (see FIRST-30-DAYS.md).
- **Referral rates** from [sell.amazon.com/pricing](https://sell.amazon.com/pricing) (2026-09-05): Business/Industrial/Scientific (BISS) 12%; Tools & Home Improvement 15%; Clothing 5%/10%/17% tiered; min $0.30. Assignment per SKU is my best guess at Amazon's classification — hard-goods safety equipment → BISS 12%; wearable PPE (head/eye/hand) → Tools 15% (the conservative choice; if Amazon classifies them BISS, add 3 pts of margin); hi-vis → Clothing tiers. **Verify per ASIN in the Revenue Calculator before pricing.**
- **FBA fees** from the 2026 rate card ([AMZ Prep](https://amzprep.com/amazon-fba-fees/), 2026-09-05, secondary source, medium confidence). Size/weight are my estimates of *packaged* dimensions, stated per row. The 3.5% fuel surcharge (from 2026-04-17) and monthly storage (~$0.05–0.15/unit for these sizes) are NOT in the table — shave another ~0.5 pt off every FBA margin.
- Items >96 in longest side or >130 in length+girth are Overmax/freight — no viable parcel fulfillment. Marked FREIGHT.
- `fabricate` items are excluded from Amazon on policy grounds (see RUNBOOK §4), shown here only for completeness.

## Per-SKU table (FBA route)

Net = price − referral − FBA fee − COGS. Margin = net / price.

| SKU | Product | Store price | Ref. cat / % | Referral $ | Size/weight assumption | FBA fee | COGS | Net | Margin | Verdict |
|---|---|---:|---|---:|---|---:|---:|---:|---:|---|
| MVS-RG-1000 | Roof guardrail 10 ft section | $289.00 | BISS 12% | $34.68 | 120 in × ~40 lb — exceeds 96 in | FREIGHT | $202.30 | — | — | **KILL — freight item** (10 ft rail is Overmax; LTL only) |
| MVS-RG-BASE | Counterweight base 90 lb | $148.00 | BISS 12% | $17.76 | 90 lb cast — XL 70–150 lb tier | $69.11 | $103.60 | **−$42.47** | −29% | **KILL — 90 lb base is a freight item**; FBA fee alone is 47% of price |
| MVS-WL-600 | Warning line 600 ft kit | $1,240.00 | BISS 12% | $148.80 | multi-box, >150 lb aggregate | FREIGHT | $868.00 | — | — | **KILL — freight kit**; even as one 150 lb parcel ($195+) margin is 2% |
| MVS-SKY-48 | Skylight screen 4×8 ft | $412.00 | — | — | fabricate, 96 in panel | — | — | — | — | **EXCLUDED — shop-fabricated** (policy + freight) |
| MVS-ANC-DL | Standing seam roof anchor | $386.00 | BISS 12% | $46.32 | 12×8×4 in, 5 lb — large std | $7.61 | $270.20 | $61.87 | **16.0%** | **KEEP** — best margin in catalog; fall-protection gating applies |
| MVS-YG-10 | Yellow steel rail 10 ft | $172.00 | BISS 12% | $20.64 | 120 in | FREIGHT | $120.40 | — | — | **KILL — freight item** |
| MVS-YG-POST | Guardrail post, bolt-down | $96.00 | BISS 12% | $11.52 | 42×8×8 in, 18 lb — large bulky | $16.12 | $67.20 | $1.16 | 1.2% | **KILL — bulky tier eats it** (fee = 17% of price) |
| MVS-YG-TOE | Toe board 4 in × 10 ft | $64.00 | BISS 12% | $7.68 | 120 in | FREIGHT | $44.80 | — | — | **KILL — freight item** |
| MVS-HOLE-4 | Floor hole cover 4×4 ft | $128.00 | — | — | fabricate, 48 in, ~60 lb | — | — | — | — | **EXCLUDED — shop-fabricated** |
| MVS-HH-C1 | Hard hat Type I Class E | $19.50 | Tools 15% | $2.93 | 11×10×6 in, 14 oz — large std (dim. weight) | $4.60 | $13.65 | −$1.68 | −8.6% | **KILL as single** — bulky-light curse; only viable as 4-pack (~6% margin, still thin) |
| MVS-HH-T2V | Safety helmet Type II vented | $89.00 | Tools 15% | $13.35 | 12×10×8 in, 2 lb — large std | $5.82 | $62.30 | $7.53 | 8.5% | **MARGINAL KEEP** — premium item, real search demand; thin but positive |
| MVS-HH-BRIM | Hard hat full brim Class G | $27.00 | Tools 15% | $4.05 | 13×12×7 in, 1.2 lb — large std | $5.04 | $18.90 | −$0.99 | −3.7% | **KILL as single**; multipack only |
| MVS-SG-CLR | Safety glasses clear | $6.40 | Tools 15% | $0.96 | 7×3×3 in, 4 oz — small std, low-price rate | $2.43 | $4.48 | −$1.47 | −23% | **KILL** — sub-$10 singles cannot carry any fulfillment fee |
| MVS-SG-SMK | Safety glasses smoke | $6.90 | Tools 15% | $1.04 | same | $2.43 | $4.83 | −$1.40 | −20% | **KILL** (12-pack ≈ 6% margin — not worth the counterfeit-infested niche) |
| MVS-GG-SEAL | Sealed goggle D3 | $14.75 | Tools 15% | $2.21 | 8×4×4 in, 8 oz boxed — large std | $3.95 | $10.33 | −$1.74 | −12% | **KILL** |
| MVS-GL-A4 | Cut glove A4, pair | $8.20 | Tools 15% | $1.23 | 4 oz — small std, low-price rate | $2.34 | $5.74 | −$1.31 | −16% | **KILL as pair**; 12-pack ≈ 8% — watch-list |
| MVS-GL-A6 | Cut glove A6, pair | $13.40 | Tools 15% | $2.01 | 6 oz — small std | $3.29 | $9.38 | −$1.28 | −10% | **KILL as pair**; 12-pack ≈ 10% — best multipack candidate |
| MVS-GL-LEA | Leather driver glove | $5.60 | Tools 15% | $0.84 | 6 oz — small std, low-price | $2.34 | $3.92 | −$1.50 | −27% | **KILL** — commodity, race to the bottom |
| MVS-VS-C2 | Hi-vis vest Class 2 | $11.90 | Clothing 5% (≤$15) | $0.60 | 12 oz — small std apparel rate | $3.90 | $8.33 | −$0.93 | −7.8% | **KILL as single** even at the 5% apparel rate |
| MVS-VS-C3 | Hi-vis long-sleeve Class 3 | $34.50 | Clothing 17% (>$20) | $5.87 | 1.2 lb — large std apparel | $5.50 | $24.15 | −$1.02 | −3.0% | **KILL** — 17% apparel referral kills it; breakeven only if classified BISS 12% |
| MVS-VS-O1 | Hi-vis vest Class 1 Type O | $9.40 | Clothing 5% | $0.47 | 10 oz — small std apparel | $3.75 | $6.58 | −$1.40 | −15% | **KILL** |
| MVS-FH-5PT | Full body harness 5-pt | $118.00 | BISS 12% | $14.16 | 12×10×6 in, 3.5 lb — large std | $7.13 | $82.60 | $14.11 | **12.0%** | **KEEP** — gating applies |
| MVS-SRL-11 | SRL 11 ft Class 2 | $268.00 | BISS 12% | $32.16 | 12×12×5 in, 6 lb — large std | $7.93 | $187.60 | $40.31 | **15.0%** | **KEEP** — best gross dollars/unit; gating applies |
| MVS-LY-SA6 | Shock lanyard 6 ft double | $142.00 | BISS 12% | $17.04 | 10×8×5 in, 4 lb — large std | $7.29 | $99.40 | $18.27 | **12.9%** | **KEEP** — gating applies |

FBM variant on the shortlist: replace the FBA fee with ~$10–14 real shipping (large-standard parcels, KY origin) — nets land within ±$3 of the FBA figures, with zero inventory risk. That is why the runbook says FBM first.

## The honest shortlist

**Survive Amazon economics (5 SKUs):**

| SKU | Post-fee margin (FBA est.) | Note |
|---|---:|---|
| MVS-ANC-DL | 16.0% ($61.87/unit) | |
| MVS-SRL-11 | 15.0% ($40.31/unit) | |
| MVS-LY-SA6 | 12.9% ($18.27/unit) | |
| MVS-FH-5PT | 12.0% ($14.11/unit) | |
| MVS-HH-T2V | 8.5% ($7.53/unit) | marginal; kept for search volume on "Type II safety helmet" |

The uncomfortable finding, stated plainly: **the only SKUs that survive Amazon's fee structure are the fall-protection items — exactly the category with the heaviest gating and compliance burden.** There is no fee-friendly easy lane here. If fall-protection ungating fails, MVS has no viable Amazon catalog and should not force it with the negative-margin SKUs.

**Killed by fees (single-unit economics):** all sub-$30 PPE — glasses, goggles, gloves, vests, cap-style/full-brim hard hats. A $6.40 pair of safety glasses loses $1.47 per sale before storage. Multipacks (12-pair A6 gloves ~10%, 4-pack hard hats ~6%) are the only re-entry path and none clears 10% comfortably — revisit only after the shortlist proves out.

**Killed by freight class:** guardrail sections and rails (120 in = Overmax), the 90 lb counterweight base (FBA fee $69 on a $148 item), toe boards, the 600 ft warning line kit. These are freight items, full stop — they ship LTL on the MVS store where freight is quoted, and Amazon's parcel machine has no honest slot for them.

**Excluded on policy:** both `fabricate` items (skylight screen, hole cover) and every roof-screen part — made-to-order, freight class, engineering liability (RUNBOOK §4).
