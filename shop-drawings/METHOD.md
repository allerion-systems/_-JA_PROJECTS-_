# How to draw architectural sheet metal shop drawings

A working reference for producing fabrication drawings that a GC will approve
and a shop can cut metal from. Written while producing the 5V roof vent
drawing for Texas Roadhouse Clarksville; the conventions here are general.

Every factual claim below is sourced. Where a number could not be found in a
published document it is marked **UNVERIFIED** rather than filled in.

---

## 1. What governs

**SMACNA *Architectural Sheet Metal Manual*, 7th Edition (2012)** — ANSI/SMACNA
1120-2012, SMACNA item 1793. This is the governing manual for architectural
sheet metal in the US.

> **There is no 8th edition.** Verified three ways: the NRCA bookstore lists
> "Seventh Edition — January 2012"; ANSI lists ANSI/SMACNA 1120-2012; and
> UFGS 07 60 00 (Aug 2023, Change 1 05/25, "references in agreement with UMRL
> dated July 2026") still cites "SMACNA 1793 — (2012) Architectural Sheet Metal
> Manual, 7th Edition." A federal spec reconciled to 2026 still points at the
> 2012 edition.

The 7th edition added chapters on **roof and wall penetrations**, which is the
relevant section for vents, curbs and pipe flashings.

**NRCA** — *Metal Panel and SPF Roof Systems* (2024, 120 construction details)
and *Architectural Metal Flashing and Condensation and Air Leakage Control*
(2022, cited in UFGS as NRCA 0429).

**Do NOT cite ASME Y14.5 as the governing standard.** Y14.5-2018 is the
mechanical GD&T standard and states explicitly that "practices unique to
architectural and civil engineering and welding symbology are not included in
this Standard." Borrow its general dimensioning practice if you like, but the
title block should reference SMACNA and the project spec section.

---

## 2. What a shop drawing must contain

Straight from a real CSI 07 62 00 master specification (University of Houston
master spec §1.5, which mirrors standard MasterSpec language):

> **Shop Drawings:** Show installation layouts … including **plans, elevations,
> expansion-joint locations, and keyed details. Distinguish between shop- and
> field-assembled work.**
> Include details for **forming, joining, supporting, and securing** … including
> **pattern of seams, termination points, fixed points, expansion joints, edge
> conditions, special conditions, and connections to adjoining work.**
> … *h. Penetration flashing (including rain hoods)*

And §2.5 A.1 — **"Obtain field measurements for accurate fit before shop
fabrication."** That sentence is the spec basis for every FIELD VERIFY note you
put on a sheet.

### The checklist

| Element | Notes |
|---|---|
| **Plan** | The part in its real orientation, located on the substrate module |
| **Elevation(s)** | At least the exposed face |
| **Section** | Through the critical waterproofing condition — this is the money view |
| **Enlarged detail** | Any lap, counterflashing or termination the section can't resolve |
| **Flat pattern** | Stretch-out with bend lines, per part |
| **Bill of materials** | Item, description, material, quantity, detail reference |
| **Bend schedule** | Bend no., angle, direction, inside radius, allowance, deduction |
| **Cut list** | Part, material, qty, girth, flat, blank L × W |
| **Fastener schedule** | Type, size, head, washer, spacing, substrate embedment |
| **Sealant schedule** | Butyl at concealed laps / urethane at exposed, with ASTM refs |
| **General notes** | Field verify, material/finish, galvanic, do-not-solder, hems |
| **Open items** | Anything unresolved. Never silently invent a dimension |
| **Title block** | See below |
| **Revision block** | No., date, description. Cloud and delta all changes |

### Title block fields

Project name and address · GC and owner · spec section · submittal number and
revision · sheet title and number · scale(s) · date · drawn by / checked by ·
fabricator name and address · a blank reviewer's stamp area (FDOT and TxDOT
conventions call for roughly 2-1/2" × 2").

**Sheet size:** 11" × 17" landscape (ANSI B) is the practical standard for
submitted shop drawings — it prints on any office machine and reads on screen.

---

## 3. Dimensioning conventions

- **Declare inside vs outside.** Standard note: *"ALL DIMENSIONS ARE OUTSIDE
  UNLESS NOTED OTHERWISE."* At 26 ga the two differ by a material thickness,
  which sounds trivial until it accumulates across six bends.
- **Dimension girth segments consecutively** along the developed length.
- **Bend lines are phantom or thin centreline-type lines**, annotated with bend
  angle, direction (UP/DOWN as the part sits on the brake), and inside radius.
- **Call out the total girth** as a single number — that is what drives the coil
  cut width.
- **Hems** noted with type (open, closed/flat, teardrop) and dimension.
- **State a scale under every view.** Mark unscaled views NTS.
- Plans and elevations at 1-1/2" = 1'-0" or 3" = 1'-0"; enlarged details at
  6" = 1'-0" or full size.

---

## 4. Flat pattern (stretch-out) math

The formulas, implemented in [`lib/sheetmetal.py`](lib/sheetmetal.py):

```
BA   = (π / 180) × A × (IR + K × T)        bend allowance
OSSB = tan(A / 2) × (IR + T)               outside setback
BD   = 2 × OSSB − BA                       bend deduction

Flat = Σ(outside/mould-line legs) − Σ(BD)
     = Σ(tangent-to-tangent legs) + Σ(BA)
```

Where A = bend angle turned (90° for a square bend), IR = inside radius,
T = thickness, K = K-factor (neutral-axis position ÷ thickness).

### K-factor

| Material | K |
|---|---|
| Soft / annealed aluminium | 0.33 – 0.35 |
| Aluminium 5052 / 6061 | 0.38 |
| **Mild steel / CRS** | **0.40 – 0.44** (0.44 common for air bending) |
| Copper / brass | 0.42 |
| Stainless 304 | 0.45 |
| Hard / spring steel | 0.50 |

K varies with tooling (die opening, punch radius), bending method (air bend vs
bottoming vs coining), temper, grain direction, and even material lot. When
IR < T the neutral axis shifts hard toward the inside and K can drop below
0.33 — which is the classic cause of flat patterns that are right on large
radii and wrong on tight ones.

> **The only way to get K accurate to ±0.005 is to bend a test coupon and
> measure it.** On thin architectural gauges the deduction is small; many shops
> simply brake to girth and trim. Print both numbers and let the shop choose.

### Minimum inside bend radius

Mild steel ≈ 1T · aluminium 1T–1.5T · 5052-H32 1T · 6061-T6 3T–6T · stainless
304 1T–2T.

**UNVERIFIED for 26 ga:** no fabricator table found (Protocase, the most
detailed public source) goes lighter than 24 ga for carbon steel or galvanneal.
For 26 ga Galvalume the 1T rule gives ≈ 0.019"; practical brake work lands at
1/16" or whatever the tooling's natural radius is. Bend a coupon.

### Worked example — 24 ga Galvalume, 90°, IR = 1T

```
T = 0.0276" coated (0.0239" base steel, ASTM A792)
BA   = 1.5708 × (0.0276 + 0.42 × 0.0276) = 0.0616"
OSSB = 1.0 × (0.0276 + 0.0276)           = 0.0552"
BD   = 2(0.0552) − 0.0616                = 0.0488"
```

Each square bend removes about 0.049" from the summed outside legs. Across the
base pan's four bends that is 0.195" — small, but it is the difference between
a hood that seats and one that rocks.

---

## 5. Gauge tables

Decimal thickness, inches. Steel and galvanized are Manufacturers' Standard
Gauge (MSG); galvanized includes the coating. Aluminium is Brown & Sharpe, but
architectural aluminium is specified by **decimal, not gauge**.

| Gauge | Steel (MSG) | Galvanized | Stainless | Aluminium (B&S) |
|---|---|---|---|---|
| 16 | 0.0598 | 0.0635 | 0.0625 | 0.0508 |
| 18 | 0.0478 | 0.0516 | 0.0500 | 0.0403 |
| 20 | 0.0359 | 0.0396 | 0.0375 | 0.0320 |
| 22 | 0.0299 | 0.0336 | 0.0313 | 0.0253 |
| **24** | **0.0239** | **0.0276** | 0.0250 | 0.0201 |
| **26** | **0.0179** | **0.0217** | 0.0188 | 0.0159 |
| 28 | 0.0149 | 0.0187 | 0.0156 | 0.0126 |

ASTM A653 coating adders: G60 ≈ +0.0011", **G90 ≈ +0.0015"**, G115 ≈ +0.0019".

> **Galvalume caveat.** Galvalume is **ASTM A792 (AZ50/AZ55), not A653.** The
> base steel matches the MSG steel column; the Al-Zn coating adds a different
> amount than a zinc coating, so the coated total is close to but not identical
> to the galvanized column. **No Galvalume-specific gauge table was found —
> UNVERIFIED.** Confirm from the mill cert and state on the drawing which basis
> you used.

### Thickness by application — UFGS 07 60 00 Table I

| Item | Zinc-coated steel | Aluminium | Stainless | Copper |
|---|---|---|---|---|
| **Base flashing** | **24 ga** | .040 | .018 | 20 oz |
| **Counterflashing** | **26 ga** | .032 | .015 | 16 oz |
| Valley / step flashing | — | .032 | .015 | 16 oz |
| Gutter, cleat, downspout | 24 ga | .032 | .015 | 16 oz |
| Gravel stop / fascia | 24 ga | .050 | .018 | 20 oz |

---

## 6. Seams, cleats, laps — the numbers

From UFGS 07 60 00 (which codifies SMACNA practice):

| Seam type | Requirement |
|---|---|
| Flat-lock seam | not less than 3/4" wide |
| Lap seam, soldered | not less than 1" wide |
| Lap seam, not soldered | overlap not less than 3" |
| Loose-lock expansion seam | not less than 3" wide, min 1" movement, filled with sealant ≥1/8" bed |
| Standing seam | not less than 1" high, double locked without solder |

**Cleats** (§3.1.4): required for sheet metal 18" and over in width, spaced not
over 12" o.c., 2" wide × 3" long, same material and thickness as the sheet, one
end secured with two nails and folded back over the heads.

**Expansion joints** (§3.1.10): not more than 32 ft for aluminium, 40 ft for
other metals; extruded aluminium gravel stop/fascia not more than 12 ft.

**Base flashing** (§3.1.11): extend up vertical surfaces **not less than 8"**
and **not less than 4" under the roof covering**; onto the roof covering **not
less than 4-1/2" at the lower side**; overlap flashing strips not less than 3".

**Counterflashing vertical leg** — the standards disagree, so pick and cite one:
NRCA 4" · ARMA 5" · **SMACNA (ASMM Fig. 3-23) 6"**. Reglet depth minimum 1",
1-1/2" preferred.

---

## 7. Materials you must not treat alike

- **Do not solder aluminium.** Seal aluminium ≤0.040" with sealant; weld above
  0.040".
- **Do not solder Galvalume.** The Al-Zn coating will not tin; the joint
  corrodes. Mechanically lock or rivet, then seal.
- **Galvanic separation:** do not put aluminium in direct contact with other
  metals except stainless, zinc, or zinc coating. Galvalume is Al-Zn —
  compatible with aluminium and stainless; isolate from copper and from runoff
  off treated lumber.
- **Pre-tin cleats** for soldered seams. Pre-tin sheet edges 1-1/2". Do not use
  torches for soldering — heat the surface and flow the solder in.

**Sealants:** butyl tape (ASTM C1311, non-curing) at concealed laps;
polyurethane or elastomeric (ASTM C920) tooled at exposed joints. Typical tape
sealant is 1/2" wide × 1/8" thick, or a 3/8" round bead.

---

## 8. Ventilation sizing

IBC 1202.2.1 and IRC R806.2, identical wording:

> The minimum net free ventilating area shall be **1/150** of the area of the
> vented space.
>
> **Exception:** reduced to **1/300** provided **both**: (1) in Climate Zones
> 6, 7 and 8, a Class I or II vapor retarder on the warm-in-winter side of the
> ceiling; and (2) **not less than 40 percent and not more than 50 percent** of
> the required ventilating area is provided by ventilators in the upper portion,
> located not more than 3 feet below the ridge, with the balance in the bottom
> one-third.

```
Required NFA (sq in) = vented area (sq ft) ÷ ratio × 144
Number of vents      = required NFA ÷ NFA per vent
```

Clarksville, Indiana is **Climate Zone 4A**, so condition (1) does not apply,
but condition (2) still does in order to use 1/300. **UNVERIFIED:** Indiana
adopts its own building code — confirm the adopted edition and amendments with
the AHJ.

Use the manufacturer's **tested** NFA where one exists. A calculated
throat-area-times-derate figure is an estimate and must be labelled as one.

---

## 9. The habit that matters most

A shop drawing that silently invents a dimension is worse than no drawing,
because it launders a guess into an approved document that someone will cut
metal from.

On the TRH Clarksville vent, reading all 65 pages of the approved submittal
established that **the manufacturer of record publishes no dimensions, no
gauge, no model number and no net free area for this product**, and that the
submitted cut sheet is for a *standing seam* vent while the tab divider calls
it 5V. Those are findings, not obstacles. They belong on the sheet, in an
OPEN ITEMS block, above the title block, where the reviewer has to look at
them.

Three categories, and every dimension on a sheet belongs to exactly one:

1. **Taken from an approved source** — cite it (spec section, manual page).
2. **Code- or standard-derived** — cite the standard and the clause.
3. **Assumed** — say so, and say what would confirm it.

---

## Sources

- SMACNA *Architectural Sheet Metal Manual* 7th Ed. — [store.smacna.org](https://store.smacna.org/architectural-sheet-metal-manual/) · ANSI/SMACNA 1120-2012 — [webstore.ansi.org](https://webstore.ansi.org/standards/ansi/smacna11202012)
- UFGS 07 60 00 (Aug 2023, Ch.1 05/25) — [wbdg.org via NIBS](https://nibs-s3-wbdg3-production.s3.us-east-1.amazonaws.com/FFC/DOD/UFGS/UFGS%2007%2060%2000.pdf)
- NRCA manuals — [nrca.net/manuals](https://www.nrca.net/manuals)
- UH Master Spec 07 6200 — [uh.edu](https://www.uh.edu/facilities-planning-construction/vendor-resources/owners-design-criteria/master-specs/07-6200-sheet-metal-flashing-and-trim-06.2020.pdf)
- ASME Y14.5-2018 scope — [asme.org](https://www.asme.org/codes-standards/find-codes-standards/y14-5-dimensioning-tolerancing)
- Bend allowance / K-factor — [The Fabricator](https://www.thefabricator.com/thefabricator/article/bending/bending-basics-dissecting-bend-deductions-and-die-openings) · [Durma](https://www.durmapress.com/k-factor-in-press-brake-bending-formula-chart-practical-guide/)
- Bend radii by gauge — [Protocase](https://www.protocase.com/resources/Protocase-Bend-Radii-Bend-Sizes.pdf)
- Gauge tables — [Welders Supply](https://welders-supply.com/reference-charts/metal-gauge-thickness-chart/), cross-checked against [Makerverse](https://www.makerverse.com/resources/sheet-metal/sheet-metal-thickness-gauge-charts/)
- IRC R806.2 — [codes.iccsafe.org](https://codes.iccsafe.org/s/IRC2021P2/chapter-8-roof-ceiling-construction/IRC2021P2-Pt03-Ch08-SecR806.2)
- Metal Sales 5V-Crimp Design & Installation Manual — [metalsales.us.com](https://www.metalsales.us.com/wp-content/uploads/2020/01/3g-5v-crimp2016.pdf)
- Dan's Custom Sheet Metal — [dcsm.net](https://dcsm.net/dcsm-metal-roof-vent/)
