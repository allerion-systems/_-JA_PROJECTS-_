# Product Compliance — Can This Steel Legally Go In The Wall?

**This is the risk that reaches Contracting, not just Supply.**

Everything in `02` (tariffs) is a money problem. This is a life-safety problem,
and it is the one that can put Ben's ten-year-old contracting company and his
personal name into a lawsuit. Read this one twice.

---

## 1. The core finding, stated plainly

A fire-resistance-rated wall is not a wall built out of good parts. It is a
*specific tested assembly*, and the rating belongs to the assembly, not to any
component in it. You cannot swap a component in and keep the rating unless the
substitute is named in the listing.

UL is explicit about this. Per UL's guide information for fire-resistance
ratings (BXUV):

> Extrapolation of member size and/or material thickness shown in the
> individual designs has not been investigated and would be considered to
> **void the existing certified assembly**.

And on the specific question of substituting studs:

> No substitutions are permitted without a written confirmation that the
> substitute product appears in an equivalent listed assembly.

The industry guidance is equally blunt that "it looks stronger" is not a
defense — you cannot assume that heavier studs, closer spacing, thicker board,
or **a different manufacturer** is automatically permitted, because a change
that looks conservative on one attribute can alter thermal response, restraint,
fastener behavior, or load path in the tested construction.

**Translation for Ben:** if Misty Valley Contracting installs an imported stud
into a rated wall, and that stud is neither (a) a compliant generic stud nor
(b) a proprietary stud individually named in that UL design, **the wall's fire
rating is void.** Not "questionable." Void. And the company that installed it
is the company that owns that problem.

Sources: [UL BXUV Guide Information](http://productspec.ul.com/document.php?id=BXUV.GuideInfo) ·
[UL Solutions — fire-rated wall stud metal thickness](https://www.ul.com/thecodeauthority/knowledge/ul-solutions-updates-guide-information-fire-rated-wall-stud-metal-thickness)

---

## 2. The two doors into a rated assembly

There are exactly two ways an imported stud is legitimately usable in a UL
fire-rated wall. Know which door the supplier's product goes through — and make
them prove it.

### Door 1 — Generic stud, minimum 25 gauge

UL's guide provides for generic studs in rated designs, with a floor:

> the minimum steel thickness of the generic studs and runners is 25 ga.

Bare (base) metal thickness is the governing measurement, found in the BXUV
guide's steel thickness table — **not** the coated thickness, and **not** the
gauge number printed on the marketing sheet.

### Door 2 — Proprietary stud, individually fire-tested and named

A manufacturer whose stud does not meet the generic description must run
**full-scale fire testing to UL 263 (ASTM E119)**. On passing, the studs and
runners are placed under UL certification and Follow-Up Services and become
eligible to bear the UL certification mark under the **Framing Members
category, CIKV** — and are added to specific designs as named alternates.

**The question to put to the Chinese supplier, verbatim:**

> *"Are your studs and runners UL certified under category CIKV, and in which
> specific UL design numbers are they listed as alternates? Send the listing."*

If the answer is anything other than a design number you can look up yourself
in UL Product iQ, the answer is no. "We meet ASTM" is not an answer to this
question. Neither is a test report from a lab you've never heard of.

---

## 3. The EQ stud trap — the exact thing that goes wrong

This is where imported framing most commonly fails, and it is worth
understanding because the failure is *designed to be hard to spot*.

Starting in the mid-2000s the industry developed lighter-gauge studs marketed
as having enhanced strength — "EQ" or "equivalent gauge" product. The pitch is
that a thinner stud performs like a thicker one structurally. Sometimes true
for structural capacity. **Not automatically true for fire.**

UL's position is unambiguous: thinner EQ studs **cannot** simply substitute
into existing designs. They can only be used where the specific proprietary
product was individually fire-tested and added to that design as an alternate.

Why this matters for an importer specifically:

- A stud sold as "20 gauge equivalent" may have base metal thickness well below
  actual 20 gauge.
- The gauge number is a *marketing* designation. Base metal thickness in mils
  is the *engineering* one. They are routinely not the same thing on imported
  product.
- It is invisible on site. A framer cannot tell by looking, and neither can an
  inspector, until someone strips the coating and puts a micrometer on it.
- It is invisible on paper too, if the mill certificate is generic or forged.

**So verify it yourself.** On the first container, and on a sample basis
forever after: strip the galvanizing from sample pieces and measure base metal
thickness with a micrometer. Compare to the mill test report for that
production run — not a generic type certificate. If the steel does not match
its paperwork, you have found out for the price of one test instead of the
price of a building.

---

## 3A. The numbers — the 95% rule

**This is the single most important number in this document.**

ASTM C645 Table 1 footnote B and AISI S220-20 §A5.1.1: *"In no case shall the
minimum base steel thickness be less than **95% of the design thickness**."*
ICC-ES evaluation reports make it an enforceable condition of use — minimum
uncoated base-metal thickness **"as delivered to the jobsite"** must be at least
95% of design.

Read that carefully: **measured at the jobsite, on your delivered product, with
the coating stripped off. Not on the mill cert.**

| Designation | Gauge | Design thickness | **Minimum base steel** |
|---|---|---|---|
| 18 mil | 25 ga | 0.0188" | **0.0179"** |
| 27 mil | 22 ga | 0.0283" | **0.0269"** |
| 30 mil | 20 ga drywall | 0.0312" | **0.0296"** |
| 33 mil | 20 ga structural | 0.0346" | **0.0329"** |
| 43 mil | 18 ga | 0.0451" | **0.0428"** |
| 54 mil | 16 ga | 0.0566" | **0.0538"** |

Coating minimums: **G40** nonstructural (AISI S220 §A4.1.1), **G60** structural.
Nonstructural product is governed by **ASTM C645 / AISI S220**; structural by
**ASTM C955 / AISI S240**. There is no such thing as a 25 ga structural stud —
C955 floors structural product at 33 mil.

**Kentucky enforces this with no small-project escape hatch.** The 2018 Kentucky
Building Code (4th Ed., Feb 2024) is a statewide mini/maxi code — no local
variation — and Kentucky **deleted** the IBC §1705.11.2 special-inspection
exception in its entirety. **A special inspector will be looking at this
product.**

### The evidence on imported product

Independent laboratory testing across seven rounds, on steel wall and ceiling
products from **more than five suppliers importing from China**, measured
against the identical 95% rule:

| Product | Measured base metal | % of required |
|---|---|---|
| 3S64 stud | 0.468 mm | **94%** |
| 3T64 track | 0.484 mm | **88%** |
| H-Stud | 0.44 mm (0.50 specified) | **88%** |
| 64 mm wall track | 0.47 mm (0.55 specified) | **85%** |

Every sample failed. The stated root cause: Chinese mills manufacture to the
*low end* of flat-rolled coil tolerance, and coil tolerance is looser than the
CFS framing standard requires. *(This dataset is Australian, measured against
AS/NZS 4600 — but the 95%-of-design rule is numerically identical and the mills
are the same mills. Treat it as transferable.)*

**And mill certificates do not settle it.** Industry audit data: *"more than 50
percent of the samples that fail during an audit are sourced from a 'prime
steel' coil"* — that is **domestic** product with **domestic** mill certs. Your
risk with unverified foreign certs is strictly worse.

### 🔴 The specification mismatch nobody mentions

The Chinese product typically on offer is **metric and not ASTM-conforming** —
C-stud profiles of 50/65/70/75 mm in 2800/2900/3000/4000 mm lengths. US
commercial specs (Section 09 22 16) call for **ASTM C645** members at 3-5/8" ×
10 ft with SFIA or ICC-ES listing.

**Non-listed metric keel cannot legally be installed in code-critical
commercial partitions.** This doesn't shrink the addressable market — it
removes most of it. Confirm the actual profile dimensions and lengths on the
quote *before* assuming the product fits the job.

---

## 4. Where the liability actually lands — verified, and it's bad

Ben's instinct will be that the manufacturer is responsible for the
manufacturer's product. For an import, that instinct is wrong in a specific and
documented way.

Kentucky's middleman statute,
[**KRS 411.340**](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=17813),
protects a distributor — but only on four conditions. **Supply likely fails
three of them.**

> *"In any product liability action, **if the manufacturer is identified and
> subject to the jurisdiction of the court**, a wholesaler, distributor, or
> retailer... upon his showing... that said product **was sold by him in its
> original manufactured condition or package**... shall not be liable... unless
> such wholesaler, distributor or retailer **breached an express warranty or
> knew or should have known** at the time of distribution or sale that the
> product was in a defective condition..."*

**Condition 1 — the manufacturer must be subject to the court's jurisdiction.
This is where it fails.** Kentucky federal courts treat this as a hard
prerequisite, not a formality. In ***Elkins v. Extreme Products Group, LLC***,
No. 5:21-cv-00050 (E.D. Ky. Dec. 21, 2021), the court **denied** a retailer's
motion to dismiss under the statute:

> *"there is an open question... regarding whether the manufacturer is subject
> to the Court's jurisdiction... **which is a prerequisite for the Middleman
> Statute to apply.**"*

The manufacturer there had never been found or served despite a Warning Order
Attorney being appointed. **That is exactly the posture of a Chinese
roll-former with no US presence, no US assets, no registered agent, and no
realistic Hague service outcome within the life of a lawsuit.**

**Condition 2 — "original manufactured condition or package." The cut shop
independently defeats this.** Cutting to length and re-bundling is not selling
in original condition. And Kentucky's product-liability act,
[KRS 411.300(1)](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=17809),
defines a covered action to include claims arising from *"**processing,
assembly, testing, listing, certifying**, warning, instructing, marketing,
advertising, packaging or **labeling**"* — processing and assembly are
enumerated. Kentucky courts have construed "alteration" **narrowly against the
middleman**: assembling a ride per the manufacturer's own instructions counted
as alteration; so did removing a warning label.

**Condition 3 — "knew or should have known." Reading this document moves you
across that line.** Once you know that imported CFS has a documented base-metal
and mill-cert problem, **relying on those certs without independent
verification is itself the evidence that defeats your defense.** A file of
unverified Chinese MTCs is not protection — in litigation it is Exhibit A.

**Condition 4 — express warranty.** Every gauge, yield, and code-compliance
representation Supply makes is a potential express warranty. Selling "to code"
means warranting to code.

> **Net effect: Supply is a full defendant, and is treated as the
> manufacturer** — the last solvent, servable party in the chain. This is why
> insurers rate importers as manufacturers.

**The cut shop is a good business idea *and* a liability-status change.** Go in
knowing it, disclose it to the insurance broker (non-disclosure is a rescission
risk), and price accordingly. **[SIGN-OFF]** — a Kentucky products-liability
attorney should opine on whether the cut shop converts Supply from
"distributor" to "manufacturer" under KRS 411.300/.340. That answer drives both
the insurance program and the mill contract.

**And don't count on supplier indemnity.** It is worth only the enforceability
of a judgment against reachable assets. Against a Chinese roll-former, that is
approximately zero — documented outcomes include foreign insurers withdrawing
defense mid-case and invoking sunset clauses on already-tendered claims.

---

## 4A. The two legitimate paths — this is the constructive part

Imported CFS **can** be made code-compliant. There are exactly two doors, and a
third that doesn't exist for a distributor.

**Door 1 — an ICC-ES Evaluation Report that names the actual plant.** This
demonstrably works: **ESR-4135** is held by **Sunsha International LLC**, a *US
importer*, covering CFS members cold-formed from Chinese coil to **GB/T 700
Q235**. So a foreign grade can be evaluated as an alternative material, and **a
US importer can hold the ESR.** The price of admission: §5.4 requires the
members be *"manufactured under an approved quality control program with
inspections by ICC-ES"* — ICC-ES inspects the plant, in China. An ESR is
**plant-specific**; switching mills without amending it breaks it.

**Door 2 — UL listing under category CIKV** for anything going into a
fire-rated assembly (§2).

**The door that is closed:** the **SFIA Code Compliance Certification Program**
attaches to a *manufacturing facility* — eligibility is limited to members
*manufacturing* product, and each plant enrolls independently with semi-annual
**unannounced** audits and third-party ISO 17025 lab testing. **A distributor
cannot buy an SFIA certification.** There is a narrow §A6.4 route for
third-party-sourced product audited at the Licensee's facility — **[SIGN-OFF]**
ask SFIA directly whether a cut-and-bundle operation can enroll, and whether
their **Contractor & Truss Fabricators Certification** is the right program
instead. Do not assume it.

> **The strategic recommendation, if the economics survive `04`:** buy only
> from a supplier holding a **current ICC-ES ESR that names the producing
> plant**, and independently verify base metal thickness and coating weight on
> every shipment at an IAS-accredited lab. That combination is the only
> configuration in which Chinese sourcing is defensible in front of a Kentucky
> code official, an architect, a special inspector — and if it ever comes to
> it, a jury.

---

## 5. Spec and funding traps — check before the container is committed

Even perfectly compliant imported steel is unusable on some jobs. Check the
specification for the Hebron project and every job after it **before** allocating
a container to it:

- **Federal funding** brings domestic-content requirements. Build America Buy
  America and related preferences apply to a wide range of federally assisted
  infrastructure, and steel is the most aggressively policed category.
- **Airport projects** are a specific hazard worth naming: Hebron, Kentucky is
  the location of CVG. FAA-funded airport work carries its own Buy American
  preference that is stricter than most people expect. **[CONFIRM]** whether the
  Hebron project touches airport property or any federal funding.
- **Private specs** frequently require "domestic steel" or "melted and poured in
  the USA" outright — distribution centers and big-box work often do. SFIA
  publishes guide specs for Sections 05 40 00 and 09 22 16 that commonly require
  third-party certification or a current ESR. **Read the spec; these are
  enforced at submittal — after your container has landed.**
- **Kentucky has NO state Buy American statute in force** (verified). HB 345
  (2025) died in committee on 28 March 2025; HB 472 (2026) was introduced
  22 January 2026 and remains in committee. **But it has now been filed twice
  with bipartisan sponsorship** — if it passes, product already in the
  Bonnieville yard could become unsellable into the public market overnight.
  That's an inventory risk, not just a legal one.

### The three questions to ask the supplier before wiring anything

1. *"What is your **ICC-ES ESR number**, and does its manufacturing-locations
   table name the exact plant that will produce my order?"* No ESR, or a plant
   not named, means you're buying commodity steel, not code-compliant framing.
2. *"Will you provide, **per shipment**, ASTM A90 coating-weight and A370
   mechanical test reports from an IAS-accredited ISO 17025 lab — and will you
   accept **my independent verification as the governing result**?"* A supplier
   who won't accept independent verification is telling you something.
3. *"Which **UL fire-resistance designs** is your product listed in, under what
   company name and product type?"* If the answer is "it's equivalent to 25
   gauge," the answer is no.

Searching the spec PDF for *"domestic," "Buy America," "melted," "poured"* takes
ninety seconds and can save a container.

---

## 6. The practical gate

Before material ships:

- [ ] Mill test reports for **the actual production run**, not a generic sample.
- [ ] Base metal thickness in **mils**, in writing — not a gauge number.
- [ ] Coating designation (e.g. G40 / G60) stated and matched to the application.
- [ ] Governing standard identified: nonstructural vs structural framing are
      different standards with different requirements. **[CONFIRM]** which
      applies to each product on the Hebron job.
- [ ] Recognized third-party code-compliance listing a building official will
      accept.
- [ ] **UL CIKV listing and specific design numbers**, if any of this material
      goes into a rated assembly.
- [ ] Product legibly and permanently marked as required — unmarked studs get
      rejected on sight by a good inspector.

On arrival:

- [ ] Independent micrometer verification of base metal thickness vs the MTR.
- [ ] Retain samples and paperwork **per container**, indexed. If a claim comes
      three years later, the file is the defense.

---

## 7. The honest summary

Imported cold-formed framing can absolutely be compliant — plenty of legitimate
product is. The risk is not that imports are inherently bad. The risk is that
**the failure mode is silent**: non-conforming studs look identical, install
identically, pass visual inspection, and reveal themselves only in a fire or a
lawsuit, years after the money is spent.

That asymmetry is what makes this worth two weeks of verification up front.
The upside of skipping it is a slightly earlier first delivery. The downside is
a voided fire rating in a building Ben's own crews framed.

Verify the steel. Every container. Starting with the first one.
