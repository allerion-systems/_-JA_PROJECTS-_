# 02 — Prior-Art Scan

**Status: preliminary scan by AI research, September 5, 2026.** This is a map of what a
few hours of structured searching found — not a professional patentability or
freedom-to-operate opinion. Before any filing or public disclosure beyond this private
repo: `[SIGN-OFF: registered patent attorney — commission a professional search]`.

## 1. The question

Is there prior art on a construction gantry that (a) 3D-prints the building, (b) places
prefabricated volumetric modules, and (c) **remains permanently installed as the
building's overhead crane** on the runway it used for construction?

Finding: art exists on each element separately. **No reference found combining (c) with
(a) or (b).** The combination — and the carriage-level tolerance compensation that makes
it practical (see `01` §4) — is where the disclosure's claims live.

## 2. Foundational patents

### US7641461B2 — Khoshnevis, "Robotic systems for automated construction" (Contour Crafting)

The foundational gantry-3DCP patent. Filed January 21, 2005, University of Southern
California. **Expired March 6, 2025** ([Google Patents](https://patents.google.com/patent/US7641461B2/en)).
Claims cover the movable gantry with extrusion nozzle assembly, the climbing platform for
high-rise, mobile robotic arms, and the multi-nozzle rim/fill extrusion scheme. Claims do
**not** cover: permanent installation in the finished building, post-construction crane or
material-handling use, or prefab module placement. Two consequences:

1. **Freedom to operate** on core gantry printing itself is now open (this specific patent;
   family members and continuations must be checked professionally).
2. The resident-conversion concept was never claimed in the foundational art.

### Other patents flagged, not yet read in full

- [US12480318 — "Gantry-type 3D printer"](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12480318) (recent grant; claims unreviewed)
- [US11560708 — "3D concrete printer"](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/11560708)
- [US12485573 — collision avoidance for 3D robotic concrete printer](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12485573)
- [WO2020152542A1 — building construction using 3D printer](https://patents.google.com/patent/WO2020152542A1/en)
- [RU179287U1 — building-construction 3D printer](https://patents.google.com/patent/RU179287U1/en)

`[SIGN-OFF: patent attorney — full claim review of the above plus classification search
in B28B 1/00, E04G 21/04, B33Y 30/00, B66C]`.

## 3. Closest commercial art

| System | What it is | Why it is not the RG-1 |
|---|---|---|
| [COBOD BOD2](https://cobod.com/solution/bod2/specifications/) | Modular truss gantry, 14.62×49.41×8.53 m envelope, 50+ units delivered | Erected, prints, **dismantled and remobilized**. Single function. |
| [COBOD BOD3](https://cobod.com/technology/3d-construction-printers/bod3/) | Ground-track gantry that rolls between structures for serial housing | Track is temporary sitework; machine leaves. |
| [COBOD Multifunctional Construction Robot (2025, TU Braunschweig)](https://cobod.com/cobod-multifunctional-construction-robot/) | BOD2 gantry + telescopic arm: print, shotcrete, paint, insulation ([3DPI coverage](https://3dprintingindustry.com/news/cobod-and-tu-braunschweig-launch-multifunctional-construction-robot-for-shotcrete-3d-printing-241602/)) | **Closest art.** Multi-tool gantry — but still a temporary construction machine, no module placement, no permanent-crane conversion. |
| [Luyten "Ascend"](https://interestingengineering.com/innovation/worlds-first-tower-crane-3d-printer) | Tower-crane-architecture printer for tall structures | Crane *form factor* used for printing — the inverse idea, and still temporary. |
| [CyBe GR](https://cybe.eu/3d-concrete-printing/printers/cybe-gantry-robot/) | Stationary factory gantry printing modular units | Machine stays — but in the *factory*, printing products that ship. Not resident in the served building. |
| COBOD [BODXL, Doha](https://cobod.com/technology/3d-construction-printers/) | Largest gantry printer, school project in Qatar | Scale demonstration; same temporary model. |

Also relevant context: mounting robot printers on factory tracks is common practice
([Autodesk overview](https://www.autodesk.com/products/fusion-360/blog/future-construction-sites-3d-printing-robots/)),
and overhead bridge cranes permanently resident in industrial buildings are 130-year-old
standard practice. The invention is the *bridge* between those two mature practices —
which is exactly the kind of combination that feels obvious in hindsight and is worth
protecting early. Obviousness under 35 U.S.C. §103 is the real fight here, not novelty
under §102: `[SIGN-OFF: patent attorney — obviousness analysis]`.

## 4. Hybrid 3DCP + modular art

Hybridizing printing with prefab is **not** novel on its own — do not claim it:

- Academic WBS/process framework for hybrid 3D-printed modular buildings
  ([ResearchGate, 2025](https://www.researchgate.net/publication/395228449_Work_Breakdown_Structure_and_Construction_Process_Framework_for_a_Hybrid_3D-Printed_Modular_Building))
- Variable residential buildings with printed walls + modular RC structure, Chile
  ([Buildings 12(11):1796, 2022](https://doi.org/10.3390/buildings12111796))
- Reims housing: printed walls + prefab components on one project
  ([ArchiExpo](https://emag.archiexpo.com/hybrids-modular-construction/))
- Industry state-of-practice ([ENR](https://www.enr.com/articles/61333-3d-printed-concrete-finds-its-footing);
  critical economics view: [Construction Physics](https://www.construction-physics.com/p/3d-printed-buildings))

The claimable element is not "print + modular." It is **one resident machine that does
both and then stays as the building's crane, with the module positions remaining
serviceable by that crane** (the self-rearranging building).

## 5. What this scan could not do

- No professional patent database search (Espacenet/PatBase/Derwent), no non-English art
  beyond incidental hits, no continuation/family tracing on the Khoshnevis portfolio.
- No search of pending unpublished applications (invisible for up to 18 months by design).
- **Deadline pressure is real**: the US is first-to-file. Every month this sits as an idea
  is a month someone at COBOD — whose Multifunctional Robot is one conceptual step away —
  could file first. A provisional application is cheap insurance and buys 12 months.
  `[SIGN-OFF: patent attorney — provisional filing decision]`.
