# 05 — Invention Disclosure (DRAFT)

**Working title:** Resident Gantry Building System — construction gantry convertible in
place to a permanent overhead crane
**Inventor:** James "Joey" Allee, Louisville, Kentucky
**Conception date:** September 5, 2026 (this repository's git history is the
contemporaneous record; commit timestamps serve as evidence of conception and diligence)
**Prepared by:** AI-drafted from the inventor's disclosure; requires inventor review and
signature before it is anything more than notes.

> **Legal status of this document:** a private draft. It is NOT a patent application and
> NOT a public disclosure (this repository is private — keep it that way; a public repo
> would start statutory clocks). The United States is first-to-file: conception dates no
> longer win priority fights. `[SIGN-OFF: registered patent attorney — evaluate a
> provisional application promptly]`

## 1. The problem

On-site gantry 3D construction printers (COBOD BOD2/BOD3 class) are temporary machines:
erected, used for wall printing only, then dismantled and remobilized. The most expensive
subsystem — the long-travel steel (columns, rails, girder) — is bought once by the printer
owner and repeatedly mobilized, while the served building, if it is a crane-served
industrial facility, separately buys nearly identical steel (crane columns, runway,
bridge) that sits idle until occupancy. Prefabricated volumetric modules on the same
project are set by separately mobilized mobile cranes. Three machines' worth of cost for
what is geometrically one machine.

## 2. The invention

A building-construction system in which a heavy overhead gantry:

1. is erected on the building site as the **first permanent component** of the building
   (freestanding runway columns, runway beams, rails, bridge girder), engineered from the
   outset for dual duty (construction machine + CMAA-class service crane);
2. accepts a **removable "nomad kit"** — a print carriage with extrusion head, on-carriage
   fine-positioning stage, material pump/feed, and servo motion controls — that mounts to
   the bridge girder through a common saddle interface;
3. **3D-prints the building's concrete walls** while compensating for crane-tolerance rail
   geometry via the carriage's short-stroke fine-positioning stage servoed against an
   external reference (laser line/tracker along the runway), so the runway may be built
   and maintained to crane tolerances (CMAA 70) rather than machine-tool tolerances;
4. exchanges the print carriage for lifting tackle and, acting as an erection crane,
   **places roof structure and factory-built volumetric modules** within its envelope;
5. upon completion, sheds the nomad kit, receives a permanent hoist trolley, is
   load-tested, and **enters service as the building's permanent overhead bridge crane**
   on the same runway — with the volumetric modules remaining within the crane's
   coverage, and therefore relocatable, for the life of the building;
6. includes a **mode interlock** whereby print-mode motion parameters (continuous-path
   servo control) and crane-mode operation (suspended load) are made mutually exclusive
   by physical removal of the print motion controls and keyed lockout.

## 3. Elements believed novel (pending professional search)

- The conversion-in-place of the construction gantry into the permanent, certified
  overhead crane of the building it constructed (see `02-prior-art-scan.md`: no reference
  found; foundational patent US7641461B2 expired 2025 and never claimed this).
- The resident-half / nomad-kit partition of a construction printer, with the reusable
  kit riding customer-owned permanent steel.
- Carriage-level fine-positioning compensation that deliberately tolerates CMAA-class
  (crane-grade) rail geometry for printing duty.
- Module placement by the same gantry with persistent in-service relocatability
  ("the building rearranges itself").

## 4. Elements known NOT novel (do not claim)

Gantry extrusion printing per se (Khoshnevis, expired); multi-tool construction gantries
(COBOD Multifunctional Construction Robot, 2025); hybrid printed-wall + prefab projects
(Reims; academic frameworks); freestanding crane runways; overhead cranes in industrial
buildings; error compensation on large machine axes in general.

## 5. Preferred embodiment

The RG-1 demonstration shop in `01-system-architecture.md` §3: 48×120×24 fabrication
building, 10-ton CMAA Class C double-girder bridge, printed perimeter walls (AC509 wall
system), gantry-erected roof, KIBS-approved volumetric office/restroom/control pods.

## 6. Commercial signals

Crane-served pre-engineered industrial buildings are a standard, high-volume product
class; every one is a candidate. First captive use: the Misty Valley cut shop
(`ventures/misty-valley/`). The nomad kit is the recurring-revenue asset (`04` §3).

## 7. Record

| Event | Date | Evidence |
|---|---|---|
| Conception (inventor's statement to AI assistant) | 2026-09-05 | Session record; this repo |
| First written description | 2026-09-05 | This commit |
| Prior-art preliminary scan | 2026-09-05 | `02-prior-art-scan.md` |
| Provisional filing decision | ______ | `[SIGN-OFF: patent attorney]` |

**Inventor signature:** ______________________ date ______
**Witness (non-inventor, has read and understood):** ______________________ date ______

*Under first-to-file, signatures preserve trade-secret discipline and inventorship
clarity — they do not substitute for filing.*
