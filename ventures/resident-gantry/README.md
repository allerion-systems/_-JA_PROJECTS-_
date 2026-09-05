# The Resident Gantry (RG-1)

**A building system invented by Joey Allee.** The gantry that 3D-prints the building's
concrete walls and cranes in the factory-built modular units **never leaves** — it converts
in place into the building's permanent overhead crane, running on the same runway it used
for construction.

Every existing player treats the printer as a temporary machine: COBOD erects the BOD2,
prints, dismantles, and remobilizes to the next site; the BOD3 rolls between structures on
ground tracks ([COBOD](https://cobod.com/technology/3d-construction-printers/)). The
Resident Gantry inverts the model. It works in exactly one building class — and that class
is the one Allerion already lives in.

## The insight

A crane-served industrial building (fab shop, cut shop, maintenance bay, heavy repair)
**already pays for a runway**: crane columns, runway beams, rails, and a bridge crane are
in the budget from day one — roughly $40,000–$100,000 for the crane alone before runway
steel ([Mazzella](https://www.mazzellacompanies.com/learning-center/what-is-the-cost-of-an-overhead-crane/)).
That steel is the most expensive part of a gantry printer, bought and thrown away on every
COBOD job via mobilization cost.

So split the machine in two:

- **The resident half** — runway columns, rails, bridge girder. Installed first, engineered
  once for both duties, stays for the life of the building as its CMAA-class overhead crane.
  Its cost was already in the building budget.
- **The nomad kit** — print carriage, servo drives, pump, hose, controls. Bolts onto the
  resident half, prints the walls, sets the roof steel and the volumetric modules, then
  unbolts and moves to the next project. *This* is the asset that amortizes across builds,
  and it is a fraction of the ~$420,000 a full BOD2-class machine costs
  ([Printable Concrete, 2026](https://www.printableconcrete.com/best-3d-concrete-printers-reviewed/)).

The finished building keeps a working crane it needed anyway — and because the crane can
reach every square foot of the bay, the Whitley-built volumetric pods (office, restroom,
control room) it set during construction stay **relocatable for the life of the building**.
The building can rearrange itself.

## Three findings

**1. The patent window is open.** The foundational gantry-printing patent —
Khoshnevis's Contour Crafting, [US7641461B2](https://patents.google.com/patent/US7641461B2/en) —
**expired March 6, 2025**, and its claims never covered (a) a gantry remaining as part of
the finished building, (b) post-construction use as a material-handling crane, or
(c) placing prefabricated modules. The closest commercial art, COBOD's 2025
[Multifunctional Construction Robot](https://cobod.com/cobod-multifunctional-construction-robot/)
(print + shotcrete + paint + insulation on one gantry), is still a temporary machine.
Our scan found no prior claim on the resident-conversion concept. See
`02-prior-art-scan.md` — and the `[SIGN-OFF]` there: this is a preliminary scan, not a
professional patentability search.

**2. The economics don't pencil today — and the model says exactly what has to change.**
For housing or crane-less boxes the idea is dead on arrival. Even in the crane-served
wedge, the `model/` calculator shows RG-1 at **+$71.5k on building #1 and +$31.5k in
steady state** against a $340.8k conventional baseline at honest default estimates,
because printed walls still cost more than CMU
([Construction Physics](https://www.construction-physics.com/p/3d-printed-buildings)).
The binding constraint in one number: printed walls must get **~6% cheaper than block**
for parity. The venture is a bet that crossing happens inside the nomad kit's 3-year
amortization window — see `04-unit-economics.md` §3 before falling in love.

**3. The hard engineering problem is tolerance, and it's solvable but not free.** CMAA 70
allows runway rail to wander ±1/4" per 20 ft of travel
([MHI/CMAA FAQ](https://og.mhi.org/downloads/industrygroups/cmaa/faqs/most-asked-action-alerts.pdf));
3D printing wants millimeter-class repeatability. The print carriage must carry its own
fine-positioning (encoder + laser reference) to ride sloppy crane rails and still print
straight. This is the core technical claim of the invention disclosure — and engineering
risk #1. See `01-system-architecture.md` §4.

## Demonstration building

A 48 ft × 120 ft × 24 ft eave fabrication/cut shop — deliberately sized inside real
BOD2-class kinematics (14.62 m ≈ 48 ft printable width, 49.41 m ≈ 162 ft travel, 8.53 m ≈
28 ft height per [COBOD's published specs](https://cobod.com/solution/bod2/specifications/)) —
with a 10-ton CMAA Class C bridge, printed perimeter walls, an Allerion-self-performed
standing-seam roof, and Whitley volumetric support pods. The same building the Misty Valley
cut-shop plan needs (see `ventures/misty-valley/`, PR #18).

## Contents

- **`01-system-architecture.md`** — the two-half machine, the four construction phases,
  interface details, and the demonstration building spec
- **`02-prior-art-scan.md`** — patent and project landscape; what's taken, what's open
- **`03-code-compliance-path.md`** — AC509/UL 3401 for the printed walls, Kentucky KIBS
  (815 KAR 7:130) for the Whitley modules, CMAA 70 / OSHA 1910.179 / ASME B30.2 for the
  crane conversion
- **`04-unit-economics.md`** — conventional PEMB-plus-crane vs. Resident Gantry build
- **`05-invention-disclosure.md`** — the disclosure draft naming Joey Allee as inventor,
  with claim outline and witness blocks
- **`06-kill-tests.md`** — the tests that would disprove this, and the go/no-go gate
- **`diagrams/`** — phase sequence and building cross-section (SVG)
- **`model/`** — economics calculator; run `python3 test_rg_model.py`

```bash
cd ventures/resident-gantry/model
python3 rg_model.py --scenario demo_shop
python3 test_rg_model.py
```

## Note

All documents are research and analysis, not legal, patent, or engineering advice. Items
requiring a registered patent attorney, a Kentucky-licensed structural PE, or a crane
certification body are marked `[SIGN-OFF]` throughout rather than answered.
