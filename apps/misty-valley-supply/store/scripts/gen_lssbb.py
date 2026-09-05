#!/usr/bin/env python3
"""Generate LSSBB DMAIC case-study markdown files from data/projects.json.

Ground rule: no fabricated quantified metrics. Any number not present in
data/projects.json (year, budget) is either omitted or written as a
[QUANTIFY: ...] bracket for Joey to fill in.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data", "projects.json")
OUT_DIR = os.path.join(ROOT, "content", "lssbb")

with open(DATA) as f:
    data = json.load(f)

projects = {p["id"]: p for p in data["projects"]}


def fmt_money(n):
    if n is None:
        return "[budget not recorded in source log]"
    if float(n).is_integer():
        return f"${int(n):,}"
    return f"${n:,.2f}"


def fmt_field(v, label="value"):
    if v is None or v == "":
        return f"Not recorded in source log — confirm with Joey"
    return v


def header(p):
    return (
        f"# {p['project']} — Lean Six Sigma Black Belt Case Study\n\n"
        f"**Year:** {p['year']}  **Employer:** {p['employer']}  "
        f"**Location:** {p['location']}  **Budget:** {fmt_money(p['budget'])}  "
        f"**Role:** {fmt_field(p.get('role'))}  **Status:** {fmt_field(p.get('status'))}\n\n"
    )


def body(define, measure, analyze, improve, control):
    return (
        f"## Define\n{define.strip()}\n\n"
        f"## Measure\n{measure.strip()}\n\n"
        f"## Analyze\n{analyze.strip()}\n\n"
        f"## Improve\n{improve.strip()}\n\n"
        f"## Control\n{control.strip()}\n"
    )


def write(pid, define, measure, analyze, improve, control):
    p = projects[pid]
    content = header(p) + body(define, measure, analyze, improve, control)
    path = os.path.join(OUT_DIR, f"{pid}.md")
    with open(path, "w") as f:
        f.write(content)
    return path


# ---------------------------------------------------------------------------
# GENERIC MEASURE BLOCK (reused, with light variation, across most projects)
# ---------------------------------------------------------------------------

def generic_measure(extra=""):
    base = (
        "None of the classic Six Sigma quantitative baselines — defect rate, DPMO, "
        "cost of poor quality, or a measured schedule-variance percentage — exist for "
        "this project in the source log (`James_Allee_Master_Project_Log`). The log "
        "captures year, employer, location, budget, scope, role, and status only. "
        "The metrics a PM/estimator in this role would typically baseline and track "
        "on a job of this type are: bid-to-award accuracy (estimated vs. contracted "
        "value), submittal approval turnaround, RFI cycle time, schedule variance "
        "against the baseline (weather/delay days), change-order count and dollar "
        "value as a percentage of contract value, and punch-list item count at "
        "substantial completion. These are flagged as placeholders below, not facts:\n\n"
        "- [QUANTIFY: bid value vs. final contract/change-order total]\n"
        "- [QUANTIFY: schedule duration — baseline vs. actual]\n"
        "- [QUANTIFY: RFI count and average response time]\n"
        "- [QUANTIFY: change-order count / dollar value as % of contract]\n"
        "- [QUANTIFY: punch-list item count and days to closeout]"
    )
    if extra:
        base += "\n\n" + extra
    return base


# ---------------------------------------------------------------------------
# BESPOKE PROJECTS (18) — fully individual treatment
# ---------------------------------------------------------------------------

write(
    "owl-creek-tasting-room",
    define="""
Owl Creek Tasting Room + Production Building was a ground-up small commercial
build for Owl Creek Vineyards in Cobden, IL, contracted at $80,000 — the
smallest ground-up new-construction project in Joey's log and, by year, the
earliest. The recorded scope is a tasting room paired with a production
building for a boutique winery. As Estimator/PM, the project charter here is
straightforward but unforgiving given the budget: deliver two functional
structures for a cost-sensitive agritourism business, sized to what an $80K
capital budget can actually buy, on a timeline tied to the vineyard's tourism
season rather than an open-ended construction calendar.
""",
    measure=generic_measure(
        "On a project this size, the ratio that matters most is change-order "
        "dollars against an $80,000 base — a single unplanned scope addition "
        "can move the percentage far more than on a $1M+ commercial job, so "
        "[QUANTIFY: change-order total as % of the $80,000 contract] is the "
        "single highest-leverage number to recover from memory or files."
    ),
    analyze="""
The dominant root-cause categories for cost/schedule risk on a small,
owner-direct rural build are different from a large commercial job: (1) a
thin local subcontractor pool near Cobden, IL, which limits competitive
pricing and backup options if a sub falls through; (2) an owner who is
cost-sensitive and directly engaged (no owner's rep or architect buffering
scope decisions), which means every field decision has immediate budget
exposure; and (3) this being early in Joey's estimating career relative to
the rest of the log, which plausibly means less institutional QC layering
(no second estimator checking the take-off) than on the later BMWC/ARM work —
making take-off completeness the single biggest lever on a job this size.
""",
    improve="""
A standardized scope-of-work document with explicit allowances (rather than
lump-sum assumptions) for finish-level decisions the owner had not yet made,
issued before pricing rather than clarified mid-construction, would box in
owner-driven scope changes before they become field change orders. A simple
subcontractor pricing sheet used consistently across the limited local sub
pool would also make it easier to catch a high or incomplete quote before
award rather than after.
""",
    control="""
[QUANTIFY: final cost vs. $80,000 contract, days late/early vs. season-open
target] would confirm whether the allowance-based scoping approach held. The
real control value of this project in Joey's portfolio is that it is the
earliest data point — the allowance-schedule and subcontractor-pricing
discipline that a small owner-direct job forces became the foundation that
scaled into the much larger, more formal estimating practice visible later
in the log (BMWC, ARM, Kelley).
""",
)

write(
    "lilly-b328-pump-lab",
    define="""
Eli Lilly B328 BRD Pump Lab was a $224,000 upgrade delivered by BMWC
Constructors, Inc. inside an active Eli Lilly research/manufacturing campus
in Indianapolis, IN, with Joey serving as Project Engineer. The recorded
scope is a pump-lab upgrade in Building 328. Unlike the commercial roofing
and ground-up work elsewhere in the log, this is capital construction inside
a GMP (Good Manufacturing Practice)-regulated pharmaceutical facility. The
project charter is defined as much by Lilly's internal change-control and
quality system as by the physical scope: execute the pump-lab upgrade
without disrupting adjacent GMP research/production operations, and satisfy
Lilly's documentation and commissioning requirements before the space can be
turned over and put back into regulated use.
""",
    measure=generic_measure(
        "On regulated pharma capital work specifically, the metrics that carry "
        "extra weight beyond the generic construction baselines are: submittal/RFI "
        "turnaround measured against Lilly's own document-control system (not just "
        "the GC's), and time-to-turnover after physical completion, since "
        "commissioning/validation sign-off is a distinct gate from mechanical "
        "completion. [QUANTIFY: days between physical completion and validated "
        "turnover] would be a telling number here if Joey can recall or pull it."
    ),
    analyze="""
The dominant root causes on a GMP capital project like this are procedural,
not physical: (1) GMP change-control documentation adds review-cycle time
that has no equivalent on commercial work — every field change has to move
through Lilly's quality system, not just the GC's RFI log; (2) work inside
an active research building requires coordination with Lilly's own EHS and
facilities groups for hot work, utility tie-ins, and any activity that could
affect adjacent GMP spaces, which adds a scheduling dependency outside
BMWC's direct control; and (3) commissioning and validation requirements
(IQ/OQ-style qualification typical of pharma capital work) extend the
practical closeout period well beyond the date the physical work is
finished, which can make "substantial completion" and "final turnover" two
very different milestones on the schedule.
""",
    improve="""
A dedicated document-control tracker mapped directly to Lilly's own
change-management categories (rather than a generic RFI log translated after
the fact) would reduce review-cycle friction. Utility tie-in and hot-work
windows negotiated with Lilly's EHS/facilities group during pre-construction
— not discovered mid-schedule — would remove a recurring source of float
loss. And a commissioning punch-list format built to match Lilly's
validation documentation requirements from day one (instead of translating a
standard construction punch list at turnover) would avoid rework at the
handoff gate.
""",
    control="""
The value of getting this right on B328 is that the same employer, same
Indianapolis campus, and same GMP change-control environment reappear later
in the same year on B358 CRSO Upgrades — the document-control tracker and
commissioning punch-list format built here are the direct control mechanism
carried forward into that project rather than rebuilt from scratch.
[QUANTIFY: validation/turnover cycle time on B328 vs. B358] would show
whether the carried-forward template actually shortened the second project's
closeout.
""",
)

write(
    "lilly-b358-crso",
    define="""
Eli Lilly B358 CRSO Upgrades was a $324,000 project delivered by BMWC
Constructors, Inc. in Indianapolis, IN in 2019, the same year and employer as
the B328 Pump Lab project, with Joey again serving as Project Engineer. The
recorded scope is "Cleanroom/CRSO Upgrades" in Building 358; the source log
does not spell out what CRSO stands for at this site — [CONFIRM WITH JOEY:
CRSO acronym expansion] — so this write-up treats it generically as a
controlled-environment/cleanroom mechanical-system upgrade rather than
guessing at the specific system. The project charter centers on upgrading
mechanical systems inside a classified cleanroom space while preserving the
room's certified classification (pressure differential, particulate control)
through and after construction.
""",
    measure=generic_measure(
        "As with B328, the pharma-specific metric that matters most here is "
        "re-certification outcome, not just physical completion: [QUANTIFY: "
        "cleanroom re-certification pass/fail on first attempt after construction] "
        "and [QUANTIFY: pressure-differential/particulate excursions logged during "
        "construction, if any] would be the two numbers worth recovering from "
        "Lilly's or BMWC's project files."
    ),
    analyze="""
The dominant root causes are specific to working inside a certified
cleanroom: any wall, ceiling, or mechanical penetration risks breaking the
room's pressure-differential and particulate-control envelope, so
containment during construction — not just at final cleanup — is a
continuous risk, not a one-time gate. GMP documentation and change control
(the same system encountered on B328) governs every field deviation. And
because the room has to be re-certified by Lilly's validation group after
the work, the schedule has to reserve time for a formal
test-and-inspect-classify cycle that is entirely outside BMWC's control
once the physical work is done.
""",
    improve="""
A temporary containment/barrier protocol maintained for the duration of any
penetration work (rather than only at day's-end cleanup) would protect the
room's certified pressure differential throughout construction instead of
just at the end. A re-certification test plan agreed with Lilly's
validation team before work begins — so the acceptance criteria are known
up front, not discovered at turnover — removes ambiguity from the closeout
gate. And reusing the document-control tracker built on B328 for this
project's change-control needs avoids rebuilding that system twice in one
year for the same client.
""",
    control="""
The B328 and B358 document-control tracker and commissioning/re-certification
punch-list format together form a reusable "Lilly capital project cleanroom
checklist" that this write-up recommends treating as a standing artifact
rather than a one-off. [QUANTIFY: re-certification cycle time here vs. any
subsequent Lilly-style regulated work] is the metric that would prove the
checklist is actually saving time on repeat regulated-environment projects.
""",
)

write(
    "kcpc-luther-luckett",
    define="""
KCPC Roof Replacement – Luther Luckett Correctional Complex was a
$1,058,196 American Roofing & Metal, Inc. project in La Grange, KY, with
Joey as Estimator/PM. The recorded scope is "Selective Demo + SBS Roof"
(styrene-butadiene-styrene modified-bitumen roofing) on a building at an
active Kentucky Department of Corrections facility. This is the only
correctional-facility project in the log and is treated individually because
its coordination profile has almost nothing in common with ARM's other
commercial reroofs: the project charter is not just "replace the roof
watertight and on budget" but "replace the roof watertight and on budget
without compromising a working correctional facility's security posture or
daily inmate-movement schedule."
""",
    measure=generic_measure(
        "Security-specific baselines matter as much as construction baselines "
        "here: [QUANTIFY: crew background-check/badging lead time actually used], "
        "[QUANTIFY: daily tool-control reconciliation — any discrepancies logged], "
        "and [QUANTIFY: change orders driven by selective-demo discoveries on an "
        "older institutional roof deck] are the numbers worth recovering, alongside "
        "the standard schedule/budget baselines."
    ),
    analyze="""
The dominant root causes on a correctional-facility reroof are almost
entirely access-control and security-protocol driven, not roofing-technique
driven: mandatory background checks and facility-escort requirements for
every crew member add lead time before mobilization that a commercial site
never requires; strict contraband/tool-control protocols — every tool
counted in and out of the secure perimeter every shift — add non-productive
time to each day that has no equivalent on a commercial job; daily work
windows are set by the facility's inmate-movement and count schedule, not by
weather or crew availability, which can compress the usable working day well
below a standard shift; and selective demo on an older institutional roof
deck carries real risk of concealed-condition change orders once the
existing system is opened up.
""",
    improve="""
A facility-specific badging and background-check plan built into
pre-construction scheduling — starting clearances weeks before the planned
mobilization date rather than after award — removes the single biggest
non-weather delay risk. A documented daily tool-control checklist,
reconciled by a designated crew lead at the start and end of every shift,
turns an informal count into an auditable control. And locking in fixed
daily work windows with Department of Corrections facility staff before
bid, rather than discovering the actual available hours after mobilization,
lets the schedule be built on real constraints from day one.
""",
    control="""
[QUANTIFY: badging lead time actually used vs. planned, tool-control incident
count, final change-order percentage] would confirm the fix held. Beyond
this one project, the badging/tool-control/fixed-work-window discipline
built here is directly reusable on any future restricted-access government
site — a pattern that shows up again, in a different form, on Joey's later
Valiant Construction work at NSWC Crane and the Birch Bayh federal
courthouse, both of which share the same underlying constraint: secure-site
access control governs the schedule more than the trade work itself.
""",
)

write(
    "acadia-crestwyn",
    define="""
Acadia Crestwyn Behavioral Health Patient Unit Addition, delivered by Kelley
Construction in Memphis, TN, is the largest project in Joey's log at
$13,036,666. Role and status were not captured for this entry in the source
log — [CONFIRM WITH JOEY: exact role on this project] — but it is included
here at full scale given its size and distinctiveness. The scope is a
ground-up patient-unit addition to an operating behavioral-health hospital
(Acadia Healthcare's Crestwyn facility). The project charter for work of
this type is defined by healthcare-facility code as much as by square
footage: add a licensed behavioral-health patient unit onto an active
hospital campus, meeting life-safety code (NFPA 101 healthcare occupancy),
infection-control requirements for construction adjacent to an operating
hospital, and behavioral-health-specific ligature-resistant design and
construction standards, while keeping the existing hospital fully
operational throughout.
""",
    measure=generic_measure(
        "On a $13M healthcare addition, the metrics that matter most beyond the "
        "generic baselines are: Interim Life Safety Measure (ILSM) compliance "
        "tracking through construction, subcontractor buyout schedule adherence "
        "for long-lead equipment, and state-licensing-survey readiness as a "
        "discrete milestone. [QUANTIFY: final change-order percentage against the "
        "$13,036,666 contract] and [QUANTIFY: licensing survey pass/fail on first "
        "attempt] are the two numbers with the most weight on a project this size."
    ),
    analyze="""
The dominant root causes on a behavioral-health hospital addition are
regulatory and clinical, not structural: ligature-resistant hardware and
finish specifications (mandatory in licensed behavioral-health units)
constrain product substitutions and add submittal-review cycles beyond a
standard commercial fit-out; ILSM requirements for construction adjacent to
an operating hospital impose barrier, dust-control, and infection-control
protocols that go well beyond typical jobsite housekeeping; state licensing
survey readiness — behavioral-health patient units require a state
licensure inspection before they can accept patients — creates a hard
closeout gate that is independent of, and can lag well behind, physical
completion; and a contract this large carries proportionally higher
exposure to subcontractor buyout risk and long-lead equipment schedule slip
than any other project in the log.
""",
    improve="""
An ILSM checklist built jointly with the hospital's infection-control and
facilities staff before each construction phase, rather than a
one-time-and-done plan at mobilization, keeps the barrier/dust/infection
protocols current as the work moves through the building. A
ligature-resistant product submittal log tracked separately from standard
submittals catches substitution risk (a product that looks equivalent but
isn't ligature-rated) early, before it becomes a licensing-survey finding.
And a licensing-survey-readiness punch list sequenced as its own discrete
closeout milestone — not folded into the general punch list — makes the
real closeout gate visible on the schedule instead of hidden inside
"substantial completion."
""",
    control="""
[QUANTIFY: final change-order percentage, schedule variance vs. baseline,
licensing survey outcome on first attempt] together would show whether this
approach actually controlled risk on a $13M healthcare project. The
ILSM-tracking and ligature-resistant submittal-log approach built here is
directly reusable as a template for any future licensed healthcare capital
project — the single largest and most regulation-dense project in Joey's
portfolio, and the one with the most transferable process discipline if the
lessons are captured rather than lost.
""",
)

write(
    "rabbit-hole-barreling",
    define="""
Rabbit Hole Henry County Barreling Facility (25,000 SF) was a $10,575,268
Kelley Construction project in Henry County, KY. Role and status were not
captured in the source log for this entry — [CONFIRM WITH JOEY: role on
this project]. This is ground-up industrial construction: a new
25,000-square-foot barreling/barrel-aging facility supporting Rabbit Hole
Distillery's expanding Henry County campus. The project charter is to
deliver a large industrial structure, purpose-built for bourbon barrel
storage, ready to receive racking and barrels on the owner's production
ramp-up timeline — not a generic warehouse shell, but one built to the
fire-protection and life-safety requirements that barrel-aging occupancies
specifically require.
""",
    measure=generic_measure(
        "On a large industrial ground-up build with a defined production-ramp-up "
        "date, the metrics that carry the most weight are long-lead procurement "
        "adherence and fire-protection inspection outcomes: [QUANTIFY: structural "
        "steel/racking delivery variance vs. plan], [QUANTIFY: fire-marshal "
        "inspection pass/fail on first attempt], and [QUANTIFY: safety incident "
        "rate over the duration of a large ground-up industrial build]."
    ),
    analyze="""
The dominant root causes on a bourbon barrel-aging facility of this scale
are: barrel-storage/aging buildings are a recognized high-hazard occupancy
class for fire protection (bourbon warehouses carry a well-documented fire
risk profile in the industry), which drives sprinkler/fire-protection design
requirements well beyond a standard industrial shell; long-lead structural
steel and barrel-racking systems create real schedule risk if buyout isn't
locked in early relative to the production-ramp-up date; and — based on the
same-year, same-campus Rabbit Hole Loading Dock & Logistics project in this
same log — coordination with a concurrent buildout on the same property
(potentially different crews/trades sharing site access, laydown area, and
haul roads) is a site-logistics risk unique to a multi-building campus
expansion happening at once.
""",
    improve="""
Early buyout of long-lead structural steel and racking, locked against a
schedule milestone tied to the owner's production-ramp-up date rather than
a generic "steel on site" date, protects the critical path. A
fire-protection design review checkpoint held before structural permit
submission — given the high-hazard occupancy classification — catches
sprinkler/suppression design issues before they become a late-stage permit
delay. And a joint site-logistics plan, explicitly coordinated with whoever
is concurrently building the adjacent loading-dock/logistics facility on the
same campus, prevents two active jobsites from competing for the same
laydown area and haul roads.
""",
    control="""
[QUANTIFY: steel/racking delivery variance vs. plan, fire-marshal inspection
outcome] are the control metrics that would confirm this held. The shared
site-logistics plan built here is the direct control mechanism carried into
the concurrent Rabbit Hole Loading Dock & Logistics project — rather than
each building's team solving the same shared-campus coordination problem
independently.
""",
)

write(
    "rabbit-hole-loading-dock",
    define="""
Rabbit Hole Loading Dock & Logistics (21,580 SF) was a $12,337,922 Kelley
Construction project in Henry County, KY — the largest single project in
Joey's log by budget aside from the Acadia Crestwyn hospital addition. Role
and status were not captured in the source log for this entry — [CONFIRM
WITH JOEY: role on this project]. This is the companion ground-up building
to the Rabbit Hole Barreling Facility, on the same campus, same year: a
21,580-square-foot loading-dock and logistics facility supporting the
distillery's outbound barrel and finished-goods flow. The project charter
is to deliver a large logistics structure — dock levelers, trailer staging,
material-handling infrastructure — coordinated with the concurrent
barreling-facility construction happening on the same property.
""",
    measure=generic_measure(
        "The metrics that matter most on a logistics/dock facility of this scale "
        "mirror the barreling facility but with a vehicular-flow dimension added: "
        "[QUANTIFY: dock-leveler/material-handling equipment delivery variance vs. "
        "plan], [QUANTIFY: schedule variance against the campus-wide ramp-up date], "
        "and [QUANTIFY: any recorded conflicts between this jobsite's construction "
        "traffic and the concurrent barreling-facility jobsite]."
    ),
    analyze="""
The dominant root causes here largely mirror the barreling facility — long-lead
procurement risk and shared-campus site logistics — but from the
vehicular-flow side: dock-leveler and material-handling equipment
procurement is its own long-lead risk distinct from structural steel;
trailer-staging and truck-flow design has to account for the facility's
eventual live logistics operations, not just construction access; and the
same concurrent-campus-buildout risk noted on the barreling facility applies
here in reverse — this jobsite's construction and delivery traffic has to
be sequenced so it does not conflict with the barreling facility's
simultaneous construction activity on the same property.
""",
    improve="""
Early buyout of dock-leveler and material-handling equipment against a
schedule milestone (the same discipline applied to structural steel on the
barreling facility), a truck-flow/staging plan designed for the facility's
eventual live logistics operation rather than just construction-phase
access, and continued use of the shared site-logistics plan established
with the barreling facility's team so both jobsites operate off one
coordinated haul-road and laydown-area agreement rather than two competing
plans.
""",
    control="""
[QUANTIFY: equipment delivery variance vs. plan, any jobsite-conflict
incidents with the concurrent barreling facility] confirm whether the shared
logistics plan actually prevented the conflicts it was designed to avoid.
The cross-referenced site-logistics plan between this project and the
Rabbit Hole Barreling Facility is the sustaining control mechanism for both.
""",
)

write(
    "rabbit-hole-overlook-bar",
    define="""
Rabbit Hole Overlook Bar (4,650 SF) was an $813,750 Kelley Construction
project in Louisville, KY. Role and status were not captured in the source
log for this entry — [CONFIRM WITH JOEY: role on this project]. Unlike the
Henry County industrial buildings, this is a guest-facing hospitality
build-out — an "overlook bar," almost certainly part of Rabbit Hole's
Louisville visitor/distillery-tour campus rather than the production side of
the business. The project charter here is finish-driven rather than
shell-driven: deliver a guest-facing bar/tasting space to a brand-sensitive
finish standard, on a compressed schedule, while an active distillery-tour
operation continues on the same campus.
""",
    measure=generic_measure(
        "On a small, finish-heavy hospitality build-out, the metrics that carry "
        "the most weight are finish-submittal cycle time and owner design-review "
        "turnaround rather than the structural/logistics metrics relevant to the "
        "Henry County buildings: [QUANTIFY: finish/millwork/bar-equipment lead "
        "time vs. schedule], [QUANTIFY: owner design-review sign-off turnaround], "
        "and [QUANTIFY: any disruption incidents to ongoing tour operations "
        "during construction]."
    ),
    analyze="""
The dominant root causes on a small guest-facing build inside an active
visitor campus are different in kind from the Henry County industrial
buildings: coordination with ongoing distillery-tour operations (visitors
moving through the campus during construction) requires more deliberate
sequencing than an industrial shell job would; a guest-facing, brand-defining
space draws tighter finish-tolerance and design-intent scrutiny from
ownership than back-of-house industrial work, which increases the number of
design-review cycles a submittal has to clear; and specialty finish
materials, custom millwork, and bar equipment are frequently long-lead and
single-source items, concentrating schedule risk in a small number of
procurement decisions on a project this size.
""",
    improve="""
A dedicated finish-material submittal tracker with explicit owner
design-review sign-off gates — distinct from a standard commercial
submittal log — keeps brand-sensitive finish decisions visible and moving.
A tour-operations coordination plan, with agreed quiet-hours or blackout
windows shared with the visitor-experience team before mobilization,
protects the guest experience without becoming a daily negotiation on site.
""",
    control="""
[QUANTIFY: finish-submittal cycle time, schedule variance vs. the
$813,750 contract] would confirm whether this approach held. The
finish-submittal tracker built for this project is directly reusable on any
future hospitality/guest-experience build-out in Joey's portfolio — a
different control discipline than the industrial-logistics playbook applied
to the Henry County buildings on the same overall Rabbit Hole account.
""",
)

write(
    "rabbit-hole-police-precinct",
    define="""
Rabbit Hole Police Precinct Building — White Box for Offices (3,900 SF) was
a $1,072,500 Kelley Construction project in Louisville, KY. Role and status
were not captured in the source log for this entry — [CONFIRM WITH JOEY:
role on this project]. The project name itself is the only scope
description available; it suggests an adaptive-reuse conversion of a
building historically known as a "police precinct" into core-and-shell
white-box office space, evidently tied to Rabbit Hole's broader Louisville
real-estate holdings given the shared employer and naming pattern with the
other Rabbit Hole entries in this log — but the exact tenant, ownership
context, and building history beyond the name string are not documented in
the source log. [CONFIRM WITH JOEY: building history/prior use, intended
tenant]. The project charter, based on the recorded scope ("white box for
offices"), is to deliver a core-and-shell office fit-out shell — not a
finished, tenant-ready office — ready for a future tenant's own design and
build-out.
""",
    measure=generic_measure(
        "A white-box/shell delivery has a scope-boundary-specific metric worth "
        "tracking beyond the generic baselines: [QUANTIFY: number of scope-boundary "
        "disputes or RFIs about what is included in \"white box\" vs. future tenant "
        "fit-out] and [QUANTIFY: ADA/egress upgrade change-order value triggered by "
        "change of use, if any]."
    ),
    analyze="""
The dominant root causes on an adaptive-reuse white-box delivery are: base
building/existing-conditions unknowns typical of converting an older,
previously single-purpose building (concealed MEP conditions behind existing
walls and ceilings are more likely on a building not originally built as
office space); scope-boundary ambiguity between "core and shell" and
"future tenant fit-out" is itself a risk area, because a white-box delivery
hands off to a future architect/tenant whose exact requirements are not yet
known at the time this contract is bid; and change-of-use adaptive reuse
frequently triggers code-driven ADA/egress upgrades that a like-for-like
renovation would not require.
""",
    improve="""
A documented scope-boundary matrix — explicitly listing what is included in
"white box" versus what is deferred to future tenant fit-out — issued at
bid rather than clarified mid-construction, prevents boundary disputes from
becoming late-discovered change orders. An existing-conditions probe during
pre-construction, specifically targeting concealed MEP conditions behind
existing finishes, catches adaptive-reuse surprises before demo rather than
during it.
""",
    control="""
[QUANTIFY: change-order value tied to scope-boundary or concealed-condition
discoveries] is the control metric that would show whether the
scope-boundary matrix worked. That matrix, once built, is directly reusable
as a standard bid exhibit on any future white-box/shell-delivery project in
Joey's portfolio.
""",
)

write(
    "river-ridge-fit-out",
    define="""
River Ridge Fit Out Improvement was a $1,800,455 Kelley Construction project
at River Ridge Commerce Center in Jeffersonville, IN. Role and status were
not captured in the source log for this entry — [CONFIRM WITH JOEY: role on
this project]. River Ridge is a large multi-tenant industrial commerce park
(a redeveloped former federal ammunition-plant site), and this project is a
tenant-specific interior fit-out improvement inside an existing building
there — not a ground-up build. The project charter is to deliver
tenant-specific interior improvements inside an existing multi-tenant
industrial building, on the tenant's occupancy/lease-commencement timeline,
while operating inside a landlord-managed commerce park rather than a
single-owner site.
""",
    measure=generic_measure(
        "Tenant fit-outs inside a multi-tenant park carry a landlord-coordination "
        "dimension worth tracking separately from generic construction metrics: "
        "[QUANTIFY: landlord/property-management approval turnaround for access, "
        "utility tie-ins, and dock scheduling] and [QUANTIFY: schedule variance vs. "
        "the tenant's lease-commencement date]."
    ),
    analyze="""
The dominant root causes on a multi-tenant industrial park fit-out are:
coordination with the park's landlord/property-management rules — dock
scheduling, shared-utility tie-in approvals, and site-wide access rules —
sits on top of coordination with the tenant itself, effectively adding a
second stakeholder layer that a single-owner site would not have; existing
building conditions inside an older, previously occupied industrial
building may not match record drawings, since multiple tenants have likely
modified the space over time; and tenant-driven schedule pressure tied to a
hard lease-commencement date creates less schedule float than a
speculative or owner-driven capital project would have.
""",
    improve="""
A landlord/property-management coordination checklist established at project
kickoff — covering dock scheduling, utility tie-in approvals, and crew
access badges — removes a recurring source of early-schedule friction. A
documented as-built verification walk, conducted before finalizing the
fit-out design rather than discovered during construction, reduces the risk
of concealed-condition change orders in a previously modified industrial
space.
""",
    control="""
[QUANTIFY: schedule variance vs. lease-commencement date, change-order rate
against the $1,800,455 contract] would confirm the approach held. The
landlord-coordination checklist built here is directly reusable for any
future multi-tenant industrial-park fit-out project.
""",
)

write(
    "birch-bayh-courthouse",
    define="""
Design-Build for the Birch Bayh Federal Building and U.S. Courthouse
Modernization was a $1,300,000 Valiant Construction project in Indianapolis,
IN. Role and status were not captured in the source log for this entry —
[CONFIRM WITH JOEY: role on this project]. This is design-build modernization
work inside a GSA-owned, actively operating federal judicial building —
different in kind from Valiant's other federal work in this log (NSWC Crane
and the Fort Wayne VA) because it is design-build delivery, which shifts
design-coordination responsibility (and risk) onto the contractor team
rather than a separately contracted architect. The project charter is to
deliver modernization scope inside a working federal courthouse, meeting GSA
design-build procurement requirements and federal facility security
protocols, while the building continues to hold court sessions and serve the
public throughout construction.
""",
    measure=generic_measure(
        "On a federal design-build courthouse project, the metrics that carry the "
        "most weight beyond generic baselines are GSA-specific: [QUANTIFY: GSA "
        "design-review/submittal cycle time], [QUANTIFY: crew badging/security-clearance "
        "lead time actually used], and [QUANTIFY: schedule variance driven by "
        "court-calendar-restricted work windows]."
    ),
    analyze="""
The dominant root causes on federal courthouse design-build work are: security
clearance and badging requirements for crew access to a federal judicial
facility add lead time before mobilization that has no equivalent on private
commercial work; active court sessions and public/judicial safety
requirements restrict noisy or disruptive work to specific windows,
compressing the usable working schedule below what a vacant or commercial
building would allow; and design-build delivery itself is a root-cause
category — it shifts more design-coordination responsibility onto the
delivery team than design-bid-build does, which means design/field conflicts
that a separate architect would normally catch in review now have to be
caught internally, requiring tighter coordination between design and field
execution than a typical GC role.
""",
    improve="""
A federal-badging lead-time plan built directly into pre-construction
scheduling — starting security-clearance processing weeks ahead of the
planned mobilization date — removes the single largest non-design delay
risk. A court-calendar-coordinated work-window schedule, agreed with the
GSA facility manager and the court's own scheduling office before
mobilization, replaces guesswork about "restricted hours" with a documented
calendar. And a regular design-to-field coordination cadence — not just
design review at milestone gates, but ongoing check-ins — catches
design-build coordination gaps before they surface as field change orders.
""",
    control="""
[QUANTIFY: final change-order percentage, schedule variance vs. baseline]
would confirm whether the plan held. This badging-lead-time and
court-calendar-coordination approach becomes a direct precedent for
Valiant's later Fort Wayne VA elevator modernization work — both projects
share the same underlying constraint of secure, occupied federal-facility
access governing schedule more than the trade work itself.
""",
)

write(
    "fort-wayne-va-elevators",
    define="""
VA-24-00093109 Repair/Modernize Elevators (GLAHS) – Fort Wayne VAMC is a
$3,800,000 Valiant Construction project at the Fort Wayne VA Medical Center
in Fort Wayne, IN, currently at "Pending / Proposal" status — not yet
awarded or executed. Role was not captured in the source log for this entry
— [CONFIRM WITH JOEY: role on this project]. Everything below should be
read as pre-award estimating/proposal work, not completed execution. The
recorded scope is elevator modernization, and notably the source log records
that an existing Polycam 3D scan model of the facility was used — a real,
specific methodology detail, not an assumption: the estimate for this
federal (VA) solicitation was built against reality-capture 3D-scan
existing-conditions data rather than relying solely on legacy record
drawings. The project charter, at proposal stage, is to price and propose an
elevator-modernization scope for an occupied VA hospital in a way that
demonstrates credible existing-conditions knowledge and a viable phased
construction approach to the government evaluator.
""",
    measure=generic_measure(
        "At proposal stage, the relevant baselines are estimating and proposal "
        "metrics rather than execution metrics: [QUANTIFY: estimate confidence/accuracy "
        "achievable using the existing 3D-scan data vs. traditional field verification], "
        "and, if awarded, [QUANTIFY: post-award RFI count tied to existing-conditions "
        "discrepancies — the number this 3D-scan approach is specifically intended to "
        "reduce]."
    ),
    analyze="""
The relevant root-cause considerations at proposal stage for an occupied VA
hospital elevator modernization are: patients and staff need continuous
vertical-transport access throughout construction, which means the
modernization has to be phased/swing-space planned rather than taking all
elevators down at once — a code and life-safety constraint specific to an
occupied acute-care-adjacent facility; VA facilities carry infection-control
and life-safety requirements comparable to a hospital, which shapes how
construction barriers and dust control have to be planned even before award;
and estimating accuracy risk on modernization work is normally elevated when
relying on legacy record drawings that may not reflect current field
conditions — which is precisely the gap the existing Polycam 3D scan is
positioned to close.
""",
    improve="""
Continued use of 3D-scan/reality-capture data as the standard
existing-conditions source for VA/GSA modernization estimates, rather than
record drawings alone, is the improvement already embedded in this proposal
— the goal is to make it standard practice across future federal-facility
bids, not a one-off. A phased-elevator-outage plan built into the proposal
itself, showing the evaluator how patient/staff vertical-transport
continuity is maintained throughout construction, addresses a likely
evaluation criterion pre-award rather than leaving it as a post-award RFI.
""",
    control="""
[QUANTIFY: proposal outcome — awarded or not, and final contract value if
awarded] is the immediate control gate for this project. If awarded, the
federal-facility badging and work-window coordination template built on the
Birch Bayh Courthouse project is the direct control mechanism to carry
forward, since both are occupied federal facilities with comparable
access-control constraints.
""",
)

write(
    "crane-in-b3173",
    define="""
Crane, IN Construction B3173 1st and 2nd Floor Office Modernization was an
$879,344 Valiant Construction project at Naval Support Activity Crane (NSWC
Crane) in Crane, IN. Role and status were not captured in the source log for
this entry — [CONFIRM WITH JOEY: role on this project]. This is interior
office modernization on two floors of a building located on an active,
high-security Department of Navy installation. The project charter is to
deliver interior office modernization scope inside a secure DoD facility,
meeting installation access-control requirements and the tenant command's
operational continuity needs, while the building presumably remains at least
partially occupied and functioning throughout construction.
""",
    measure=generic_measure(
        "On-base DoD work has an access-control dimension worth tracking "
        "separately from generic construction metrics: [QUANTIFY: installation "
        "access/CAC badging lead time actually used per crew member], and "
        "[QUANTIFY: gate-delivery/material-inspection delay time per delivery, "
        "if logged]."
    ),
    analyze="""
The dominant root causes on an active DoD installation are access-control
and logistics-driven, echoing the same underlying pattern seen on the KCPC
correctional-facility roof and the Birch Bayh federal courthouse elsewhere
in Joey's portfolio: installation access badging and background-check
requirements for every crew member add lead time before mobilization that a
commercial job never requires; material deliveries are subject to gate
inspection and vehicle-inspection procedures at base entry points, adding
lead time to every delivery that a commercial jobsite would not experience;
and office modernization has to be coordinated with the tenant command's
ongoing operational schedule so the work does not disrupt mission-critical
functions happening on the same or adjacent floors.
""",
    improve="""
An installation-access lead-time plan built into pre-construction scheduling
— the same lesson learned on KCPC applied here to CAC/installation-pass
requirements — removes the largest non-trade delay risk before it hits the
schedule. A gate-delivery coordination protocol, established directly with
the installation's logistics office before deliveries begin, converts
unpredictable gate delays into a known, plannable lead time. And
phased floor-by-floor sequencing, agreed with the tenant command up front,
keeps mission-critical functions running while modernization work proceeds
around them.
""",
    control="""
[QUANTIFY: badging lead time vs. plan, schedule variance driven by gate/access
delays] would confirm this held. Taken together with KCPC (2021) and Birch
Bayh (also 2024), this project is one data point in a restricted-access-facility
badging and logistics playbook that spans multiple employers in Joey's
career — evidence of a transferable process skill rather than a one-off
accommodation.
""",
)

write(
    "kytc-row-utilities-rail",
    define="""
KYTC – Right of Way – Utilities & Rail was a $6,800 Calloway & Associates
engagement in Frankfort, KY — the smallest project by budget in Joey's log,
and notably in the role of Engineering Technologist rather than
Estimator/PM. The recorded scope is an "Engineering Support Services
Contract." This is not a construction build; it is a professional
engineering-services task order for the Kentucky Transportation Cabinet
(KYTC) covering right-of-way, utility, and rail coordination. The project
charter is to deliver a narrowly scoped engineering-support deliverable
against a state DOT task order, on time and within a fixed, small
services-contract value, distinct from the estimating/PM work that makes up
most of the rest of the log.
""",
    measure=generic_measure(
        "Professional-services task orders have their own metric set, distinct "
        "from construction: [QUANTIFY: deliverable turnaround time against the task "
        "order's due date] and [QUANTIFY: number of comment/revision cycles on "
        "submitted engineering deliverables] — the services-contract equivalent of "
        "a construction RFI/change-order count."
    ),
    analyze="""
The dominant root cause on a small state-DOT ROW/utility/rail coordination
task order is external dependency: KYTC right-of-way and utility-coordination
deliverables typically depend on responsiveness from third-party utility
owners and railroad companies, none of whom report to the engineer or the
DOT client directly. A task order this small ($6,800) leaves almost no
schedule slack to absorb any external response delay — unlike a
multimillion-dollar construction contract where a few days of slow response
barely register, on a task order this size a single slow utility-owner
response can consume the entire float.
""",
    improve="""
An external-dependency tracking log — listing each utility owner and
railroad contact along with the expected response window for each — built
at task-order kickoff, makes delays visible early (while there's still time
to escalate) rather than discovered only when the deliverable due date is
missed.
""",
    control="""
[QUANTIFY: actual deliverable turnaround vs. task-order due date] is the
control metric. The external-dependency tracking habit built for a $6,800
task order is a low-cost control that scales down well and is directly
reusable on any future DOT/utility-coordination task order, regardless of
contract size.
""",
)

write(
    "csx-terminal-revitalization",
    define="""
335 Baxter Ave – CSX Terminal Revitalization was a $145,000 Cordia Property
Solutions, LLC project in Louisville, KY, with Joey as Estimator/PM. The
recorded scope is "Terminal Revitalization" at a CSX rail-terminal property.
This is renovation/revitalization work on an existing rail-industry facility
rather than ground-up new construction. The project charter is to deliver
facility-revitalization scope for a rail-industry property, on budget, while
respecting the operational and safety constraints of a site adjacent to
active rail infrastructure.
""",
    measure=generic_measure(
        "Rail-adjacent renovation work has a coordination-specific metric worth "
        "tracking: [QUANTIFY: railroad flagging/right-of-way coordination approval "
        "turnaround, if any work fell within setback distance], alongside the "
        "generic baselines."
    ),
    analyze="""
The dominant root causes on a rail-terminal revitalization project are:
coordination with active rail operations and right-of-way setback
requirements for any work near active track (which can require railroad
flagging personnel present during certain activities — a scheduling and
cost dependency outside the contractor's direct control), and the
concealed-condition risk typical of any renovation/revitalization scope on
an existing building, where the actual condition behind walls, roofing, or
below grade is not fully known until work begins.
""",
    improve="""
A railroad-coordination and flagging-requirement check completed during
pre-construction, specifically for any scope within the railroad's
right-of-way setback, avoids a late-discovered scheduling dependency. A
documented existing-conditions survey before finalizing the renovation
scope of work reduces the risk of concealed-condition change orders on an
older terminal building.
""",
    control="""
[QUANTIFY: change-order rate against the $145,000 contract, schedule
variance] are the control metrics. The railroad-coordination checklist
built here is reusable for any future Cordia project located near active
rail infrastructure.
""",
)

write(
    "datacorp-infrastructure",
    define="""
DataCorp Infrastructure Upgrades was a $293,000 Cordia Property Solutions,
LLC project in Louisville, KY, with Joey as Estimator/PM. The recorded scope
is "Infrastructure Improvements"; the source log does not detail which
building systems (electrical, mechanical, site utilities) were involved
beyond that label — [CONFIRM WITH JOEY: specific infrastructure systems
scoped]. The project charter, based on what is recorded, is to deliver
facility infrastructure improvements for a client referred to as "DataCorp"
in the log, on budget, while keeping the facility's ongoing operations
running through construction.
""",
    measure=generic_measure(
        "Infrastructure-upgrade work has an outage/continuity metric worth "
        "tracking beyond the generic baselines: [QUANTIFY: any unplanned outage "
        "incidents during tie-in work] and [QUANTIFY: change-order value tied to "
        "undocumented existing-system conditions]."
    ),
    analyze="""
The dominant root causes on facility infrastructure-improvement work are:
electrical, mechanical, or site-utility upgrades frequently require
coordination with the facility's continued operations to avoid unplanned
outages, especially if the facility cannot tolerate downtime; and
infrastructure scope pricing often depends on the accuracy of existing-system
documentation, so undocumented or outdated as-built conditions are a common
driver of change orders once work begins and the existing systems are
actually exposed.
""",
    improve="""
An outage-coordination plan negotiated directly with facility operations
before any tie-in work begins — rather than scheduling tie-ins around the
contractor's convenience — protects the client's operational continuity. An
existing-system verification walk, conducted in the field rather than relying
solely on record drawings, before finalizing bid scope catches
undocumented conditions before they become field change orders.
""",
    control="""
[QUANTIFY: change-order rate against the $293,000 contract, any outage
incidents logged] are the control metrics. The outage-coordination and
existing-system verification steps built here become a standard
pre-construction checklist item for future Cordia infrastructure-improvement
work.
""",
)

write(
    "louisville-riverport",
    define="""
Louisville Riverport Authority – Facility Support & Emergency Services was a
$19,800 Cordia Property Solutions, LLC engagement for the Louisville
Riverport Authority (a public port and industrial authority on the Ohio
River), with Joey as Estimator/PM. The recorded scope is "Facility Support &
Emergency Response." At $19,800, this is a small-dollar, likely
rapid-response facility-support task rather than a planned capital project,
and the project charter reflects that: respond to and resolve a
facility-support or emergency need for a public-authority client quickly and
within a modest, reactive-scope budget, rather than executing a pre-planned
construction scope of work developed over a normal estimating cycle.
""",
    measure=generic_measure(
        "Emergency/facility-support engagements have their own metric, distinct "
        "from planned capital work: [QUANTIFY: response time from initial call to "
        "crew mobilization on site], which is the metric that actually defines "
        "success on reactive work of this kind."
    ),
    analyze="""
The dominant root cause on emergency/facility-support engagements is that
they are reactive by nature — the triggering event, not a planned scope
document, defines the work. That means scope definition and pricing
typically happen under real time pressure rather than through a normal
estimating cycle, which is itself the primary risk driver on this kind of
engagement, more so than any technical complexity in the $19,800 scope
itself.
""",
    improve="""
A standing rate sheet or pre-negotiated emergency-response pricing agreement
with repeat public-authority clients like the Riverport Authority —
established before the next emergency call comes in — means pricing and
mobilization terms are already agreed rather than negotiated during the
emergency itself, shortening the time between the call and crews being on
site.
""",
    control="""
[QUANTIFY: response time from call to mobilization on this engagement] is
the control metric. A maintained rate sheet / on-call agreement with the
Riverport Authority (and similar repeat public-authority clients) is the
sustaining mechanism that keeps future emergency-response engagements fast
rather than starting from zero each time.
""",
)

write(
    "sunshine-ready-mix",
    define="""
Sunshine Ready Mix – Pulse Valve Replacement is a $12,900.07 Agile
Industrial Solutions, LLC engagement at a Sunshine Ready Mix concrete-batch
plant in Louisville, KY, with Joey as Estimator/PM. Status is recorded as
"Proposal Accepted (Pending Completion)" — the proposal has been accepted
but execution has not yet occurred as of the source log, so this write-up is
framed as upcoming/in-progress work, not completed execution. The recorded
scope is precise and mechanical: replace 24 MAC (pneumatic) valves and
conduct a system test. The project charter is to execute a tightly scoped
industrial-maintenance task at an active concrete-batch plant, coordinated
around the plant's production schedule rather than an open construction
calendar.
""",
    measure=generic_measure(
        "A small, single-system industrial-maintenance scope has its own tight "
        "metric set: [QUANTIFY: lead time for the 24 replacement MAC valves vs. "
        "the plant's planned downtime window] and [QUANTIFY: system-test pass/fail "
        "outcome on first attempt after installation]."
    ),
    analyze="""
The dominant root causes on a small industrial-maintenance scope like this
are: the plant can only be taken down for valve replacement during a
scheduled production outage window, so the actual constraint on this
project is the client's production calendar, not labor availability or
technical complexity; and a bill of materials this specific — 24 identical
MAC valves — concentrates essentially all of the schedule risk in a single
supplier's lead time, since there is no substitute-vendor flexibility built
into a like-for-like replacement of a defined part.
""",
    improve="""
Locking in valve procurement immediately upon proposal acceptance — rather
than waiting for a formal notice-to-proceed — protects against the
single-supplier lead-time risk before it can eat into the schedule. A
downtime window confirmed jointly with the plant operator before scheduling
the system test, rather than assumed from the proposal timeline, ensures the
work actually lands inside the plant's real production lull.
""",
    control="""
[QUANTIFY: actual valve delivery lead time vs. plan, system-test result]
are the control metrics once this project executes. This
small-scope/single-supplier lead-time-risk pattern — identical parts,
one vendor, one downtime window — is a reusable checklist item for any
future Agile Industrial Solutions maintenance-scope bid.
""",
)

# ---------------------------------------------------------------------------
# AMERICAN ROOFING & METAL BATCH (22 projects, categorized)
# ---------------------------------------------------------------------------

CATEGORY = {
    "distillery": dict(
        context=(
            "an active, product-generating distillery or bourbon-production "
            "site — not a vacant shell — which changes the coordination math "
            "for every phase of the reroof"
        ),
        analyze=(
            "On an operating distillery campus, the dominant root-cause "
            "categories for schedule and cost risk are logistics and "
            "regulatory coordination, not roofing-material defects: (1) "
            "hot-work/ignition-source restrictions near barrel storage, "
            "still operations, and ethanol vapor (\"angel's share\") zones "
            "constrain torch-down or kettle work and force sequencing around "
            "the plant's own hot-work permitting and insurance requirements; "
            "(2) the owner cannot pause bottling or distilling for roofing, "
            "so crane placement, material staging, and dry-in sequencing "
            "have to thread around live production operations; and (3) "
            "lay-down area on a working industrial campus is typically "
            "limited, which raises the risk that material delivery/staging "
            "conflicts — not weather — become the actual schedule driver."
        ),
        improve=(
            "A distillery-specific pre-construction hot-work and logistics "
            "plan, coordinated directly with the plant's EHS/insurance "
            "contact before mobilization, a locked-down crane and staging "
            "footprint agreed with the owner's operations lead, and phased "
            "dry-in milestones tied to the plant's production blackout "
            "windows rather than a generic linear schedule."
        ),
    ),
    "warehouse": dict(
        context=(
            "a large-footprint, single-tenant industrial/logistics building "
            "where roof size and phased occupancy — not architectural "
            "complexity — drive the risk"
        ),
        analyze=(
            "On a big-box logistics roof, the dominant root causes are scale "
            "and safety coordination: fall-protection/OSHA coordination "
            "across a large contiguous membrane run, weather-window "
            "compression (a roof of this size has far fewer usable "
            "full-dry-in weather windows per season than a small commercial "
            "roof), and dependency on the general contractor's overall site "
            "logistics and crane/material-hoist scheduling, since the "
            "roofing crew is one of several trades competing for the same "
            "site access on a large, fast-moving job."
        ),
        improve=(
            "A crew-productivity-per-square-foot tracking sheet used at bid "
            "time to right-size crew count against the available weather "
            "window, a standing weekly trade-coordination call with the "
            "GC's superintendent, and a documented fall-protection/safety "
            "plan reviewed before each phase kickoff rather than once at "
            "mobilization."
        ),
    ),
    "hospitality": dict(
        context=(
            "an occupied or soon-to-be-occupied multifamily/hospitality "
            "building where residents, guests, or a leasing timeline sit "
            "directly below the work"
        ),
        analyze=(
            "The dominant root causes on occupied residential/hospitality "
            "reroofs are disruption management, not roofing technique: "
            "noise and dust windows that have to be communicated to "
            "residents or guests in advance, interior water-intrusion risk "
            "during tear-off (a leak here is a life-safety/property-damage "
            "event, not just a punch-list item), and constrained "
            "staging/parking on an urban lot that competes with tenant or "
            "guest parking."
        ),
        improve=(
            "A resident/guest notification protocol tied to the phased "
            "tear-off schedule, nightly dry-in verification before crews "
            "leave any section open, and a staging plan negotiated with "
            "property management before mobilization instead of worked out "
            "ad hoc on day one."
        ),
    ),
    "institutional": dict(
        context=(
            "an occupied, public-serving institutional building where the "
            "people below the roof — students, staff, parishioners, "
            "patients, or members — are the actual constraint on the "
            "schedule, not the roofing scope itself"
        ),
        analyze=(
            "The dominant root causes on occupied institutional reroofs are "
            "restricted work-hour windows tied to the institution's own "
            "calendar (school, church, residence-hall, or clinic hours), "
            "life-safety egress that has to stay clear through every phase, "
            "and noise/vibration limits that push certain operations to "
            "off-hours or breaks in the institution's schedule — all of "
            "which can compress the usable working day well below a full "
            "shift."
        ),
        improve=(
            "A work-hour calendar built jointly with the facility, school, "
            "or parish before bidding rather than after award, a defined "
            "escalation path for occupant complaints during construction, "
            "and phased tear-off sized to what can be fully dried in before "
            "the next occupied-hours window opens."
        ),
    ),
    "utility": dict(
        context=(
            "an operating public-utility asset where uptime, "
            "chemical-storage proximity, and restricted-access security "
            "protocols govern the work, not the roofing system itself"
        ),
        analyze=(
            "The dominant root causes on an operating water/wastewater "
            "treatment facility are process-safety coordination near "
            "chemical storage and treatment operations, restricted-access "
            "and security-badge protocols that slow daily crew mobilization "
            "compared with an open commercial site, and the owner's "
            "requirement that the facility never lose weather protection "
            "over process-critical equipment, which drives more "
            "conservative phased dry-in than a typical commercial job would "
            "use."
        ),
        improve=(
            "A site-access and safety-orientation protocol agreed with the "
            "utility's operations team before mobilization, phased dry-in "
            "sized conservatively around process-critical equipment "
            "locations, and a single point of contact with the facility's "
            "operations staff for daily coordination instead of routing "
            "through multiple contacts."
        ),
    ),
    "commercial": dict(
        context=(
            "an operating commercial or light-industrial business where "
            "roof work has to proceed while the tenant's operations, "
            "customer traffic, or manufacturing line continues underneath"
        ),
        analyze=(
            "The dominant root causes on occupied commercial/light-industrial "
            "reroofs are staging-footprint constraints on built-out urban or "
            "commercial sites, coordination with the tenant's business hours "
            "or production schedule so tear-off doesn't expose interior "
            "operations to weather, and change-order risk from concealed "
            "deck/substrate conditions that aren't discoverable until "
            "tear-off actually begins on an older building."
        ),
        improve=(
            "A pre-bid site walk that specifically probes deck condition at "
            "a sample of locations (not just a visual roof survey) to "
            "reduce concealed-condition change orders, a staging plan "
            "agreed with the tenant/owner before mobilization, and phased "
            "tear-off scoped to the tenant's actual operating hours."
        ),
    ),
}

ROOFING_PROJECTS = [
    # id, category, optional extra scope/context sentence
    ("clubhouse-lofts-3", "hospitality",
     "The recorded scope here is specifically \"Thermal & Moisture "
     "Remediation\" rather than a full tear-off/replace — remediation of "
     "an existing moisture/thermal-performance failure in an occupied "
     "apartment building, which raises the stakes on interior "
     "water-intrusion control since the failure being remediated may "
     "already have residents dealing with active or recent moisture "
     "issues."),
    ("myriad-hotel", "hospitality",
     "The recorded scope is limited to the project name (Baxter Ave – "
     "Myriad Hotel); the source log does not detail a specific roofing "
     "system beyond that this is a boutique hotel property on Baxter "
     "Avenue in Louisville."),
    ("diageo-workhorse", "distillery",
     "The recorded scope is limited to the project name (\"Project "
     "Workhorse\"); the source log does not detail the specific roofing "
     "system beyond the site being a Diageo-operated bourbon production "
     "facility on Bourbon Dr in Lebanon, KY."),
    ("makers-mark-lakeside", "distillery",
     "The recorded scope is a \"Green Roof\" — a vegetated roofing "
     "system, which adds structural-load, waterproofing-membrane, and "
     "irrigation/drainage-detailing considerations beyond a standard "
     "single-ply or modified-bitumen reroof, at Maker's Mark's Lakeside "
     "testing facility in Loretto, KY."),
    ("bardstown-bourbon-ferm", "distillery",
     "The recorded scope is limited to the project name (Fermentation "
     "Addition); the source log does not detail the specific roofing "
     "system beyond the site being an active fermentation-building "
     "addition at Bardstown Bourbon Company."),
    ("brown-forman-phase2", "distillery",
     "The recorded scope is limited to the project name (Distillery "
     "Phase 2); the source log does not detail the specific roofing "
     "system beyond this being a phased, multi-stage engagement at an "
     "active Brown-Forman distillery on Dixie Hwy in Louisville — phase "
     "sequencing itself (this being \"Phase 2\") suggests lessons from an "
     "earlier phase were plausibly available to inform this one."),
    ("amazon-hlo9", "warehouse",
     "The recorded scope is limited to the project name (\"Project "
     "Pioneer\"); the source log does not detail the specific roofing "
     "system beyond this being a large Amazon logistics facility in "
     "Georgetown, IN."),
    ("amazon-sri", "warehouse",
     "The recorded scope is limited to the project name (Salt River "
     "Business Park); the source log does not detail the specific "
     "roofing system beyond this being a large Amazon logistics facility "
     "in Shepherdsville, KY, and — at $2,079,825 — the largest "
     "single roofing contract in ARM's book within this log."),
    ("poe-dixie", "warehouse",
     "The recorded scope is limited to the project name (POE Dixie); "
     "the source log does not detail the tenant, building use, or "
     "specific roofing system beyond the Dixie Highway, Louisville "
     "location and the scale of the contract ($1,538,564), which places "
     "it with the other large industrial/logistics roofs in ARM's book "
     "rather than the smaller commercial work."),
    ("gosser-fine-arts", "institutional",
     "The recorded scope is limited to the project name (Gosser Fine "
     "Arts Center – The Gheens Recital Hall); the source log does not "
     "detail the specific roofing system beyond this being a "
     "performing-arts building on the Campbellsville University campus, "
     "which adds acoustic/vibration sensitivity (a recital hall) to the "
     "standard occupied-institutional constraints."),
    ("newcomer-academy", "institutional",
     "The recorded scope is \"Selective Demo + SBS Roof\" (styrene-butadiene-styrene "
     "modified bitumen), the same roofing system used on the KCPC "
     "correctional-facility project, at an occupied K-12 school building "
     "in Louisville — school-calendar-driven work-hour restrictions are "
     "the dominant added constraint here."),
    ("uofl-belknap-north", "institutional",
     "The recorded scope is limited to the project name (Belknap "
     "Village North); the source log does not detail the specific "
     "roofing system beyond this being a University of Louisville "
     "residence hall, meaning the occupants below the roof are students "
     "living in the building during construction, not just visiting "
     "during business hours."),
    ("northeast-family-ymca", "institutional",
     "The recorded scope is limited to the project name; the source log "
     "does not detail the specific roofing system beyond this being an "
     "active YMCA facility with member programming (childcare, fitness "
     "classes) that runs on its own daily schedule independent of a "
     "typical business-hours calendar."),
    ("st-francis-rectory", "institutional",
     "The recorded scope is limited to the project name (St. Francis of "
     "Assisi Rectory); the source log does not detail the specific "
     "roofing system beyond this being a Catholic parish rectory "
     "building on Bardstown Rd in Louisville, where the institution's "
     "own liturgical/parish-office calendar sets the work-hour "
     "constraints."),
    ("eye-care-institute", "institutional",
     "The recorded scope is limited to the project name (The Eye Care "
     "Institute); the source log does not detail the specific roofing "
     "system beyond this being an active medical/clinical building, "
     "where patient-care hours and any surgical/procedure scheduling set "
     "the work-hour constraints rather than a school or church calendar."),
    ("msd-guthrie-wqtc", "utility",
     "The recorded scope is limited to the project name (Derek R. "
     "Guthrie Water Quality Treatment Center); the source log does not "
     "detail the specific roofing system beyond this being an operating "
     "Louisville MSD water-treatment facility on Lower River Rd."),
    ("msd-central-maintenance", "utility",
     "The recorded scope is limited to the project name (Central "
     "Maintenance Facility); the source log does not detail the specific "
     "roofing system beyond this being an operating MSD maintenance "
     "facility on Commerce Center Pl in Louisville, and — at "
     "$3,566,509 — the largest single roofing contract with a public "
     "utility client in this log."),
    ("suntan-etown", "commercial",
     "The recorded scope is limited to the project name; the source log "
     "does not detail the specific roofing system beyond this being an "
     "occupied retail tanning-salon building in Elizabethtown, KY, where "
     "customer walk-in traffic continues during construction."),
    ("plumbers-supply", "commercial",
     "The recorded scope is limited to the project name (Plumbers "
     "Supply Co); the source log does not detail the specific roofing "
     "system beyond this being an active industrial-supply distribution "
     "warehouse on Bluegrass Pkwy in Louisville, where warehouse/dock "
     "operations continue during construction."),
    ("number-15-entertainment", "commercial",
     "The recorded scope is limited to the project name (Number 15 "
     "Entertainment); the source log does not detail the specific "
     "roofing system beyond this being an occupied entertainment venue "
     "on W Main St in downtown Louisville, where event scheduling — not "
     "just business hours — likely governs the available work windows."),
    ("central-motor-wheel", "commercial",
     "The recorded scope is limited to the project name (Central Motor "
     "Wheel of America); the source log does not detail the specific "
     "roofing system beyond this being an active automotive-component "
     "manufacturing plant in Paris, KY, where a running production line "
     "continues under the roof during construction."),
    ("nucor-brandenburg", "commercial",
     "The recorded scope is limited to the project name; the source log "
     "does not detail the specific roofing system beyond this being an "
     "active Nucor steel-manufacturing facility in Brandenburg, KY, where "
     "heavy-industrial operations and their own safety protocols govern "
     "site access alongside the standard commercial constraints."),
]

for pid, category, scope_note in ROOFING_PROJECTS:
    p = projects[pid]
    cat = CATEGORY[category]
    define = f"""
{p['project']} was a commercial roofing engagement delivered by American
Roofing & Metal, Inc. at {p['location']}, awarded at a contract value of
{fmt_money(p['budget'])} in {p['year']}. As Estimator/PM, Joey scoped and/or
priced the work and managed it from award through closeout. {scope_note} The
project charter for this job class centers on {cat['context']}: replace or
remediate the roofing system, protect the building interior and its
occupants or operations from water intrusion throughout construction, and
close out within the awarded contract value. The customer-defined
critical-to-quality requirements are consistent across ARM's commercial
book: a fully watertight, code-compliant roof system, delivery inside the
contracted schedule window, and no unapproved cost growth against the
signed contract.
"""
    control = f"""
The closeout package for this project (warranty documentation, as-built
roof plan, submittal log) would typically feed ARM's standard
commercial-roofing project template, so the site-logistics and coordination
lessons from this job are available as a starting checklist on the next
{category}-type job rather than being re-learned from scratch.
[QUANTIFY: warranty callback count or punch-list reopens in the year
following closeout] would be the control metric that confirms the fix
held over time, not just at substantial completion.
"""
    write(
        pid,
        define=define,
        measure=generic_measure(),
        analyze=cat["analyze"],
        improve=cat["improve"],
        control=control,
    )

print(f"Wrote {len(list(os.listdir(OUT_DIR)))} files (including README, if present) to {OUT_DIR}")
