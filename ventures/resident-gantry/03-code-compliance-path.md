# 03 — Code Compliance Path

Three regulatory tracks run in parallel: the printed walls, the volumetric modules, and
the crane. None of them is exotic on its own — the discipline is keeping them separable so
one track's problem never stalls the others.

## 1. Printed concrete walls — ICC-ES AC509 / UL 3401

- **AC509** ("3D Automated Construction Technology for 3D Concrete Walls") is the
  acceptance criteria under the IBC/IRC for printed wall systems: material and durability
  properties, structural performance, fire resistance
  ([ICC-ES 3D printing program](https://icc-es.org/3d-printing/);
  [criteria document](https://shop.iccsafe.org/ac509-3d-automated-construction-technology-for-3d-concrete-walls-approved-december-2021-pdf-download.html)).
  ICON drove the original criteria ([ICON announcement](https://www.iconbuild.com/newsroom/icon-sets-standard-and-receives-acceptance-criteria-for-3d-printed-walls-by-the-international-code-councils-evaluation-service));
  Black Buffalo has since pushed revisions for **multi-story**
  ([VoxelMatters](https://www.voxelmatters.com/black-buffalo-3d-and-icc-es-revise-ac509-criteria-for-multi-story-construction-3d-printing/)).
- **UL 3401** covers evaluation of 3D-printed building construction; HUD's technical
  review of 3DCP systems includes a UL 3401 compliance checklist
  ([HUD report, Part 2](https://www.huduser.gov/portal/sites/default/files/pdf/3D-Concrete-Printed-Construction-Systems-Part-2.pdf)).
- **Two routes for the RG-1 demo shop:**
  - *Route A (fast)*: partner with a printhead/material vendor that already holds an
    ICC-ES ESR under AC509, and print their listed mix with their listed head mounted on
    our carriage. The evaluation attaches to the wall system; our gantry is means and
    methods. Cleanest first-building path — but confirm the ESR's installation scope
    doesn't bind it to the vendor's own machine. `[SIGN-OFF: ICC-ES / vendor counsel]`
  - *Route B (slow, owns the asset)*: seek our own ESR for the RG-1 wall system. Only
    worth it after the machine is proven.
- A one-story industrial building with a licensed KY structural PE stamping the printed
  walls as site-specific engineered concrete (with testing) may also pass through the
  local official under the Kentucky Building Code's alternative materials provision
  without an ESR — jurisdiction-dependent, ask before assuming.
  `[SIGN-OFF: KY PE + local building official pre-application meeting]`

## 2. Whitley volumetric modules — Kentucky KIBS

- Kentucky regulates off-site "closed construction" buildings as **Kentucky
  Industrialized Building Systems** under
  [815 KAR 7:130](https://www.law.cornell.edu/regulations/kentucky/815-KAR-7-130)
  (authority: KRS 198B). The manufacturer holds a **certificate of acceptability**; each
  model gets plan review (model approval) and then site placement approval
  ([KAR text](https://apps.legislature.ky.gov/law/kar/titles/815/007/130/)).
- Whitley Manufacturing is an established commercial modular manufacturer
  ([MBI member](https://members.modular.org/manufacturerwholesale/Details/whitley-manufacturing-co-inc-1969572);
  [whitleyman.com](https://www.whitleyman.com/)). **Verify before committing**: that
  Whitley currently holds (or will obtain) KY KIBS certification for the pod models we
  spec. If not, the fallback is any KIBS-certified commercial modular manufacturer — the
  invention doesn't depend on the brand. `[SIGN-OFF: Whitley sales engineering + KY HBC
  Modular section]`
- Keeping pods **structurally independent** (self-contained boxes on the slab, no
  marriage to printed walls, demountable) keeps their approval a clean pass-through and
  preserves the relocatable-for-life feature.

## 3. The crane — the phase-change problem

The same steel is a construction machine on Monday and a permanent building fixture on
Friday. Regulators treat those differently:

- **Construction phase**: gantry operations fall under OSHA 1926 (construction). Module
  and steel picks with the gantry are crane operations — lift plans, rigging, qualified
  operators. Whether 1926 Subpart CC operator certification applies to a rail-mounted
  gantry in this configuration needs a written determination, not an assumption.
  `[SIGN-OFF: safety consultant / OSHA interpretation request]`
- **Conversion**: permanent hoist installed, servo cabinets removed, and a **rated load
  test and inspection** before service per OSHA 1910.179 and ASME B30.2
  `[SIGN-OFF: qualified crane inspector]`.
- **In service**: OSHA 1910.179 (overhead and gantry cranes, general industry) governs;
  periodic inspections per B30.2. Runway designed to CMAA 70 duty class from day one
  ([CMAA 70](https://tcamerican.squarespace.com/s/CMAA-Specification-No-702015Multiple-Girder-Cranes.pdf);
  tolerance/deflection limits per the
  [MHI/CMAA FAQ](https://og.mhi.org/downloads/industrygroups/cmaa/faqs/most-asked-action-alerts.pdf)),
  with runway/fatigue detailing per AISC Design Guide 7.
- **The dual-duty structural check is the novel engineering submittal**: print-phase cycle
  counts on a Class C runway, hybrid load spectra, and the mode-interlock (print-speed
  motion physically impossible with a suspended load). Expect the building official and
  the insurer to have never seen one. Write it once, well, and it becomes part of the
  package the invention sells. `[SIGN-OFF: KY PE]`

## 4. Insurance and liability (flag, not analysis)

A machine that becomes a building fixture crosses from inland marine / equipment coverage
into the property policy, and the "manufacturer" of the crane is arguably us. Product
liability tail, maintenance obligations, and what happens to certification when the
building sells — all unpriced. The Misty Valley dossier's lesson applies: the liability
structure is part of the design, not an afterthought.
`[SIGN-OFF: commercial insurance broker + KY attorney — before the first external job]`

## 5. Sequence for the demo shop permit

1. Pre-application meeting with the local building official (bring this document).
2. KY PE engages: foundations, runway, printed walls, roof — one stamp, dual-duty basis.
3. AC509 Route A vendor selected; ESR into the submittal.
4. KIBS model + site placement approvals for the pods (manufacturer-side).
5. Crane load test + certification at conversion; file with the AHJ.

None of these steps is novel individually. If any official balks, it will be at step 2's
dual-duty basis — which is why the demo building is **ours** (the Misty Valley cut shop),
not a customer's.
