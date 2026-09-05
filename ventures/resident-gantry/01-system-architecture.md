# 01 — System Architecture

The Resident Gantry (RG-1) is one machine with two lives. During construction it is a
gantry 3D printer and erection crane; after construction it is the building's permanent
overhead bridge crane. The design problem is making one set of steel honestly serve both
duties, and keeping the expensive precision equipment portable.

## 1. The two halves

### Resident half (stays for the life of the building)

| Element | Construction duty | Service duty |
|---|---|---|
| Runway columns | Support gantry + print loads | Crane columns (they were in the budget anyway) |
| Runway beams + rails | Gantry travel, full building length | Crane runway per CMAA 70 |
| Bridge girder(s) | Carries print carriage (X-axis) | Carries hoist trolley |
| End trucks + long-travel drives | Y-axis positioning (servo mode) | Bridge travel (crane mode) |

Engineered **once**, to the worse of the two load cases, by a licensed structural engineer
`[SIGN-OFF: KY PE]`. Design references: CMAA Specification 70 for the crane duty
([spec text](https://tcamerican.squarespace.com/s/CMAA-Specification-No-702015Multiple-Girder-Cranes.pdf)),
AISC Design Guide 7 (*Industrial Building Design*) for runway/column/fatigue detailing.
Duty class matters more than tonnage: the same 10-ton crane is a materially different
structure at Class B vs. Class E ([Steel Calculator reference](https://steelcalculator.app/reference/crane-classification/)).
Print duty is low-load/high-cycle (a print head weighs a few hundred kg but travels
continuously for days); crane duty is high-load/low-cycle. Specify CMAA **Class C**
(moderate service) as the baseline and check fatigue against the print-phase cycle count
explicitly — this is exactly the kind of case the duty tables were not written for.
`[SIGN-OFF: KY PE]`

### Nomad kit (moves to the next project)

- **Print carriage**: rides the bridge girder in place of (or alongside) the hoist trolley.
  Carries the extrusion head, its own Z-axis mast, and — critically — the fine-positioning
  stage (§4).
- **Material system**: pump, mixer, hose management. Ground-based, trailer-mounted.
- **Controls**: servo drive cabinets that override the crane's contactor controls during
  print mode; removed at conversion. The permanent crane keeps conventional (or VFD) crane
  controls — the expensive motion controllers leave with the kit.
- **Swap interface**: the carriage and the hoist trolley mount to the girder through a
  common bolted saddle pattern, so conversion is a crane-assisted swap, not a rebuild.

Target: nomad kit ≤ 35–40% of the cost of a full BOD2-class machine (~$420,000 per
[Printable Concrete](https://www.printableconcrete.com/best-3d-concrete-printers-reviewed/)),
because the steel — the bulk of a gantry printer — is the resident half. Estimate, not a
quote; see `04-unit-economics.md`.

## 2. The four phases

*(Diagram: `diagrams/phases.svg`)*

**Phase 0 — Foundations + resident half.** Slab/footings with printed-wall strip footings;
freestanding runway columns and rails erected full building length. Freestanding runways
are standard practice — the novelty is only that they go in *first*. Nomad kit installed
and surveyed in.

**Phase 1 — Print.** Perimeter and interior concrete walls printed inside the runway
envelope. Openings, chases, and embed plates printed in. Weather exposure during this
phase is the same problem every on-site 3DCP job has; a temporary fabric roof over the
runway is the mitigation if schedule demands it.

**Phase 2 — Erect + set.** Print carriage swaps for a hoist trolley (or a temporary
lifting beam). The gantry — now acting as a crane — sets roof joists, deck, and the
standing-seam roof panels (Allerion self-performs), then cranes the Whitley volumetric
pods into position through the open end bay or before roof close-in. No mobile crane on
site for the entire erection: the building erects itself.

**Phase 3 — Convert + certify.** Nomad kit demobilizes. Permanent hoist installed. Rated
load test and inspection per OSHA 1910.179 and ASME B30.2 before the crane enters service
`[SIGN-OFF: qualified crane inspector]`. The building opens with its own certified
overhead crane, and the pods remain relocatable by that crane for the building's life.

## 3. Demonstration building — the RG-1 shop

Sized deliberately inside proven BOD2-class kinematics
([COBOD specs](https://cobod.com/solution/bod2/specifications/): 14.62 m × 49.41 m × 8.53 m):

| Parameter | Value | Check |
|---|---|---|
| Footprint | 48 ft × 120 ft (14.6 m × 36.6 m) | ≤ 14.62 m printable width; ≤ 49.41 m travel ✓ |
| Eave height | 24 ft (7.3 m) | ≤ 8.53 m print height ✓ |
| Walls | Printed cavity wall, AC509-compliant mix | `03-code-compliance-path.md` |
| Crane | 10-ton double girder, ~46 ft span, CMAA Class C | ~$100k class before runway ([Mazzella](https://www.mazzellacompanies.com/learning-center/what-is-the-cost-of-an-overhead-crane/)) |
| Roof | Steel joists + standing-seam, gantry-erected | Allerion self-perform |
| Pods | Whitley volumetric: office 12×40, restroom/locker 12×24, control room | KIBS-approved (`03`) |
| Use case | Metal fabrication / cut shop | The Misty Valley cut shop needs exactly this building |

Whitley Manufacturing (South Whitley, IN — ~4 hr from Louisville) builds commercial
volumetric modules including offices, restrooms, and control rooms, from a 120,000 SF
plant operating since 1945 ([Whitley](https://www.whitleyman.com/),
[industrial line](https://www.whitleyman.com/industrial)). They are a candidate module
partner, not a committed one — nobody has called them yet.

## 4. Engineering risk #1: tolerance

The collision at the heart of the machine: CMAA 70 tolerances allow the runway rail to
deviate at a rate of up to 1/4" between points 20 ft apart, with vertical girder
deflection to L/600 ([MHI/CMAA FAQ](https://og.mhi.org/downloads/industrygroups/cmaa/faqs/most-asked-action-alerts.pdf)) —
while extrusion printing wants millimeter-class path accuracy.

Resolution: **never ask the crane steel to be a machine tool.** The print carriage carries
a short-stroke fine-positioning stage (±50 mm, servo + encoder) that corrects the nozzle
path in real time against an external reference (laser tracker or string-line laser along
the runway), the same way large-format machining compensates rail error. The crane steel
provides gross motion; the carriage provides precision. This carriage-level compensation
on deliberately crane-tolerance rails is the core technical claim in
`05-invention-disclosure.md` — and the first thing to prototype, because if compensation
can't hold ±5 mm over a 120 ft print, the invention is a paper machine. That prototype
test is Gate 1 in `06-kill-tests.md`.

## 5. Interfaces that must not be hand-waved

1. **Printed wall ↔ runway column**: walls print around free-standing columns; embeds and
   closure details keep the wall from loading the runway (or the design deliberately
   integrates them — pick one, with the PE `[SIGN-OFF: KY PE]`).
2. **Module ↔ printed wall**: Whitley pods are self-contained boxes on the slab; printed
   walls provide the shell, pods stay demountable. No structural marriage — that keeps the
   KIBS approval clean (`03`).
3. **Print mode ↔ crane mode controls**: lockout-keyed mode selection; in crane mode the
   servo cabinets are physically absent. An operator can never command print-speed motion
   with a suspended load.
4. **Hook height vs. print height**: the girder must clear the finished wall top during
   Phase 1 *and* give usable hook height under the finished roof in service. In the demo
   building: girder at ~26 ft, walls to 24 ft, roof steel above girder line on raised
   column stubs — section in `diagrams/section.svg`.
