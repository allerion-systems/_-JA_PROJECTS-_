---
name: permit-drawings
description: Produce engineer-grade construction documents inside a Claude Code session — CAD framing plans (real DXF via ezdxf), 17x11 permit/shop drawing sheet sets in the R&B Roofing house format, as-built redline masters over approved permit sheets, and NDS load-path calcs. Use this whenever the user mentions permit drawings, as-builts, inspection corrections, failed inspections, framing plans, shop drawings, redlines, sheet sets, DXF/AutoCAD output, deck or porch structure documentation, or asks to "draw" any construction detail. Also use when photos of job sites or stamped permit sheets are uploaded and the user wants documentation produced from them. Renders and visually verifies every sheet in-session before delivery.
---

# Permit Drawings & As-Built Documentation

Produce construction documents that look like an engineer/architect made them,
entirely inside the session: draw with a CAD library, render, LOOK at the
result, fix, and only then deliver. For the active Pucket porch project, read
`references/pucket-project.md` FIRST — it holds every verified fact.

## The non-negotiables (why they exist)

1. **Never invent a dimension.** Construction documents get built from and
   inspected against. A guessed number that looks authoritative is worse than a
   blank. Anything not field-measured or transcribed from an approved document
   is labeled **V.I.F.** (verify in field) on the face of the drawing.
2. **Never ship a sheet you have not viewed.** Render every drawing to PNG and
   read it with the Read tool before sending. Text collisions, crossed leaders,
   and clipped tables are invisible in code and obvious in the render. Budget
   2–3 render→look→fix passes; the first render is never clean.
3. **Deviations are argued as EQUIVALENCY, not conformance.** If the field
   built something different from the approved set, cloud it, state both the
   approved spec and the as-built condition, and justify with numbers. Never
   claim the as-built "matches" the approved set when it doesn't.
4. **Every deliverable carries:** "UNSEALED — NOT FOR CONSTRUCTION — ALL DIMS
   V.I.F. — engineer of record to check, correct, and seal where the AHJ
   requires." You are producing documents for an engineer to adopt, not
   practicing engineering.
5. **You run in a cloud container, not the user's machine.** Deliver via
   SendUserFile and Artifact links. Never claim files landed on their disk.

## Choosing the deliverable

- **Inspector wrote up a deviation / "failed inspection"** → As-built redline
  MASTER: the user's approved permit sheets as base images with red clouds,
  delta notes, and a stamp. Inspectors want their own approved drawing marked
  up, not a redrawn set. Ask for photos of the stamped sheets if not provided.
- **"Draw the framing / make a plan"** → True-scale CAD plan via ezdxf → DXF
  (editable deliverable) + vector embed into a sheet.
- **"Full set / permit set / shop drawings"** → SD-series 17x11 set: cover,
  notes/schedules/verification, plan, sections (one per distinct load path),
  connection details, calcs/conformance, and a field-verification worksheet
  the crew can print and fill in with a tape.
- **"Prove it passes code"** → Calc package: ASD per NDS, formula →
  substitution → demand/capacity ratio per member, plus a code-compliance
  schedule (item · governing section · what the inspector checks · proof
  status: calc / shown / verify).

## Workflow

1. Extract facts. Separate three buckets and keep them separate on the page:
   VERIFIED (measured, or transcribed from an approved/stamped document),
   AS-BUILT CLAIMS from the user (drawn as stated, flagged V.I.F.), and
   ASSUMPTIONS (yours — always V.I.F., listed in one place).
2. Read `references/toolchain.md` and follow the exact pipeline (install,
   draw, render, verify, sheet assembly, PDF, preview). It is proven; do not
   improvise a different stack.
3. Draw. Sheet format details are in `references/toolchain.md` §Sheet format.
4. Verify math independently: before printing any structural number, recompute
   it in a separate short Python script and compare.
5. Render → Read the PNG → fix collisions → repeat until clean.
6. Deliver: SendUserFile the PDF (+ DXF when drawn), publish/update the
   Artifact (reuse the existing artifact URL with the `url` param — never
   create duplicates), and state plainly what is V.I.F. and what remains open.

## Structural sanity checks that catch real failures

- A post under a roof beam is load-bearing if rafters bear on that beam —
  tributary ≈ half the rafter span × post spacing. Strapped rafters and
  inspector-ordered sistering both confirm bearing.
- Sistering a post raises area but NOT weak-axis slenderness unless the least
  dimension grows — le/d uses the least dimension. Say so.
- A built-up ply only counts if it bears full length top AND bottom and the
  cap engages every ply.
- A post landing on a beam mid-bay loads it in bending (Pab/L); stacked over a
  post below, the beam sees almost none of it. The offset measurement often
  decides the whole submittal — put it at the top of any field worksheet.
- Vaulted (no ceiling joists) = the ridge beam is structural; its end
  reactions (pocket + ridge post) need a path down.
- Covered porch ceilings are damp locations: NM cable not permitted — UF or
  raceway, damp-listed boxes/fixtures. Fasteners in treated lumber: HDG or SS.
