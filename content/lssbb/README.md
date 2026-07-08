# LSSBB Case Studies — README

## What this is

This folder contains 40 Lean Six Sigma Black Belt (LSSBB)-style DMAIC
(Define, Measure, Analyze, Improve, Control) case studies, one per project in
`data/projects.json`, written for James "Joey" Allee's professional
portfolio. The goal is to reframe his real construction-estimating/PM project
history through a process-improvement lens for employers.

## First draft, not finished product

**Every file here is a first-draft framework, not a finished, fact-checked
case study.** They were generated from the real project log
(`James_Allee_Master_Project_Log_7.7.26`) plus reasonable, trade-appropriate
inference about what a PM/estimator in that role would plausibly have done —
they were not written from interviews, project files, or Joey's memory. They
need his review and correction before they represent him accurately to an
employer.

## The `[QUANTIFY: ...]` brackets are mandatory, not optional

Every quantified Six Sigma metric a real DMAIC case study would normally
lead with — defect rate, DPMO, cost of poor quality, schedule-variance
percentage, RFI cycle time, change-order rate, punch-list counts, badging
lead times, response times, and so on — **does not exist in the source data**
and was never fabricated to fill the gap. Instead, every place a number would
strengthen the write-up, you'll find a bracketed placeholder like:

```
[QUANTIFY: schedule days saved vs. baseline — confirm with Joey]
```

**No file should be shown to an employer, recruiter, or included in a resume
packet with these brackets still in it.** Each one needs a real number from
Joey's memory, files, or project records — or needs to be deleted/reworded if
no real number is recoverable for that project. Treat an unfilled bracket as
an unfinished sentence, not a stylistic placeholder.

A small number of files also contain `[CONFIRM WITH JOEY: ...]` brackets for
non-numeric facts (e.g., an acronym expansion, a role, or building context)
that weren't in the source log at all — these need the same review pass.

## What's grounded fact vs. inferred narrative

Grounded in the source log for every project: **year, project name, budget,
employer, location, scope (where recorded), role (where recorded), and
status (where recorded).** These appear verbatim in each file's header line
and inform the Define section.

Inferred, plausible-but-unconfirmed process narrative: the Measure baselines
description, the Analyze root-cause framing, the Improve actions, and the
Control mechanisms. These are reasoned from the real scope, trade, industry,
budget scale, and known constraints of that project type (e.g., occupied
correctional facility, active distillery, federal courthouse, GMP
pharmaceutical cleanroom) — but they describe what a PM/estimator in that
role would *plausibly* have done, not what is documented as having happened.
Joey should read each one and correct, delete, or confirm the specific
actions/root causes attributed to him.

Several projects in the source log have `role` and/or `status` fields left
blank (`null`) — mostly the Kelley Construction and Valiant Construction
entries from 2023–2025. Those files say so explicitly in the header and in a
`[CONFIRM WITH JOEY: ...]` bracket rather than guessing at a role.

## How files map to `data/projects.json`

Each project's `id` field in `data/projects.json` maps directly to
`content/lssbb/<id>.md`. For example, the project with `"id":
"kcpc-luther-luckett"` in the JSON has its case study at
`content/lssbb/kcpc-luther-luckett.md`. There are exactly 40 project ids and
40 corresponding markdown files (this README is not a project file and is
not counted in that 40).

## How the write-ups were grouped

Given 40 projects, most of which share a real structural pattern, the
write-ups were batched rather than each being built from a blank page:

- **18 projects received fully individual, bespoke DMAIC write-ups**,
  either because they are large/high-budget ($10M+: the two Rabbit Hole
  Henry County buildings, Acadia Crestwyn), structurally distinctive (the
  Eli Lilly pharma cleanroom/pump-lab work at BMWC; the Luther Luckett
  correctional-facility reroof; the Birch Bayh federal courthouse and Fort
  Wayne VA elevator modernization at Valiant; NSWC Crane), or simply unique
  in kind within the log (Owl Creek Vineyards ground-up build; the small
  KYTC engineering task order; the Cordia Property Solutions and Agile
  Industrial Solutions projects; the remaining smaller Kelley Construction
  projects).
- **22 of American Roofing & Metal, Inc.'s commercial reroofing/roofing
  projects (2020–2022) were generated from a shared structural template**,
  since they share a real underlying process story (an Estimator/PM
  managing a commercial reroof from award to closeout, with consistent
  CTQs around watertight completion, schedule, and budget). Within that
  template, each write-up is still customized to that project's real scope
  string (where recorded), location, budget, and building-type category —
  grouped into six sub-patterns with genuinely different root-cause
  profiles: active distilleries (Diageo/Bulleit, Maker's Mark, Bardstown
  Bourbon, Brown-Forman), large warehouse/logistics buildings (the two
  Amazon sites, POE Dixie), occupied hospitality/multifamily buildings
  (Clubhouse Lofts, Myriad Hotel), occupied institutional buildings
  (Gosser Fine Arts, Newcomer Academy, U of L Belknap Village North,
  Northeast Family YMCA, St. Francis Rectory, The Eye Care Institute),
  operating public utility facilities (the two MSD sites), and occupied
  commercial/light-industrial sites (Sun Tan City, Plumbers Supply, Number
  15 Entertainment, Central Motor Wheel, Nucor Brandenburg). The Luther
  Luckett correctional-facility reroof, though also an ARM project, was
  pulled out for individual treatment because its coordination profile
  (security clearances, tool control, inmate-movement-driven work windows)
  has essentially nothing in common with the rest of ARM's commercial
  book.

## Bottom line before using these

Read every file, fill or resolve every `[QUANTIFY: ...]` and `[CONFIRM WITH
JOEY: ...]` bracket with Joey's actual input, and only then treat the
narrative as fact suitable for a resume, portfolio site, or interview
conversation.
