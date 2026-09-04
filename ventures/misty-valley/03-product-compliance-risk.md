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

## 4. Where the liability actually lands

Ben's instinct will be that the manufacturer is responsible for the
manufacturer's product. In an import, that instinct is wrong in a specific and
dangerous way.

The general principle across US product liability law is that everyone in the
chain of distribution of a defective product can be liable — manufacturer,
distributor, and seller. Many states, Kentucky included, have some form of
"innocent seller" or middleman protection that shields a distributor who merely
resold a sealed product made by someone else.

**The catch, and it is the whole ballgame:** those protections generally
depend on the injured party being able to reach the actual manufacturer. When
the manufacturer is a Chinese factory outside US jurisdiction, the practical
effect is that **the importer becomes the defendant** — the importer is the
last solvent, servable party in the chain. This is why insurers treat importers
as manufacturers for rating purposes.

**[CONFIRM with Kentucky counsel]** — the precise question, worded for a lawyer:

> *"Does Kentucky's middleman/innocent-seller statute protect a distributor who
> is also the importer of record, where the foreign manufacturer is not subject
> to Kentucky jurisdiction? And does the protection survive if the distributor
> cut, modified, or repackaged the product?"*

That second clause matters enormously and is easy to miss: **the cut shop may
forfeit the protection.** A distributor who passes through a sealed product has
the strongest claim to innocent-seller status. A distributor who cuts material
to length, re-bundles it, and ships it as a Misty Valley job package has
altered the product and put its own name on it. That is much closer to
manufacturing. The cut shop is a good business idea and it is also a liability
posture change — go in knowing that, and price the insurance accordingly.

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
  the USA" outright — distribution centers and big-box work often do.
- **[CONFIRM]** any Kentucky state procurement steel preference for public work.

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
