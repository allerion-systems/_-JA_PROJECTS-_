# Misty Valley — Entity Structure

**This is research, not legal or tax advice.** Statutes and cases are cited so
your attorney and CPA can verify them fast. Items marked **[SIGN-OFF]** must be
cleared by a licensed professional before you act — they are questions to ask,
not answers to rely on.

---

## 1. What the structure has to contain

Structure is a set of walls, and you learn where you needed one after something
has already gone wrong. Name the fires first:

| # | The fire | What it burns with no wall |
|---|---|---|
| F1 | A stud fails in a fire-rated or load-bearing assembly | Supply, Contracting, Ben personally |
| F2 | CBP reassesses duty or AD/CVD 3 years after entry | The importing entity, its surety, then the guarantors |
| F3 | A contracting job goes bad — injury, defect, delay | Contracting, and any affiliate that looks like it |
| F4 | A customer doesn't pay for a container already sold | Supply's cash, and the next container |
| F5 | Supply sells to Contracting on the same job at a markup | The GC relationship — and potentially a fraud claim |

Every choice below traces to a row in that table.

---

## 2. Kentucky facts that shape the design

Four verified points, because each one rules something in or out.

**Kentucky has NO series LLC.** Confirmed by reading the full section index of
[KRS Chapter 275](https://apps.legislature.ky.gov/law/statutes/chapter.aspx?id=38578)
— 110 sections, .001 through .540, and not one authorizes a series, protected
series, or registered series. (Kentucky *does* allow series in statutory trusts
under [KRS 386A](https://apps.legislature.ky.gov/law/statutes/chapter.aspx?id=41152)
— don't let anyone conflate the two.) **Do not form a Delaware or Texas series
LLC to operate here**; Kentucky has no statute recognizing the internal walls
between series, so a Kentucky court's treatment of them is an open question.

**Separate LLCs are cheap.** [KRS 275.055](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=36703):
**$40** to file articles of organization. A five-entity structure costs about
$200 to form. Kentucky's answer to the series problem is simply more LLCs.

**Single-member LLCs get a real shield — inside-out.**
[KRS 275.150(1)](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=40444)
says outright: *"That a limited liability company has a single member or a
single manager **is not a basis for setting aside** the rule otherwise recited
in this subsection."* Kentucky has statutorily rejected the "one-member LLC is a
sham" argument. But **KRS 275.150(3)** removes the shield for a member's *"own
negligence, wrongful acts, or misconduct."* Ben personally supervising a bad
install, or personally signing a false customs entry, is not protected by any
entity on this page.

**But single-member LLCs are weak outside-in — and this changes the top of the
chart.** [KRS 275.260](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=47083)
makes the charging order the *"exclusive remedy"* — yet subsection (4) lets a
court *"order a foreclosure upon the limited liability company interest... at
any time."* In a **multi-member** LLC, the foreclosure buyer gets only an
assignee's economic rights and cannot become a member without the other
members' consent — control stays in the family. In a **single-member** LLC
there are no other members, so that consent gate doesn't exist, and the
purchaser can take the company.

> **Consequence:** a pure single-member ladder (Ben → Enterprises → everything)
> means a *personal* judgment against Ben — a car wreck, a guarantee, a divorce
> — reaches Enterprises and from there the entire group. **[SIGN-OFF]** Discuss
> making **Enterprises genuinely multi-member** (spouse, adult child, or a
> trust) with counsel. No published Kentucky appellate decision squarely
> resolves SMLLC charging-order protection — treat it as an open question, not
> a settled one.

---

## 3. Recommended architecture

```
              Ben  (+ second member — see §2)
                        |
        ┌───────────────▼────────────────┐
        │  MISTY VALLEY ENTERPRISES LLC  │  holds; never operates
        └───────────────┬────────────────┘
      ┌─────────┬───────┴────────┬──────────────┐
┌─────▼─────┐ ┌─▼────────┐ ┌─────▼──────┐ ┌─────▼──────┐
│CONTRACTING│ │  SUPPLY  │ │ PROPERTIES │ │ EQUIPMENT  │
│    LLC    │ │   LLC    │ │    LLC     │ │    LLC     │
│           │ │          │ │            │ │            │
│ installs  │ │ imports, │ │ Bonnieville│ │ trucks,    │
│ 10 yrs of │ │ cuts,    │ │ land +     │ │ forklifts, │
│ goodwill  │ │ delivers │ │ shop       │ │ saws       │
└───────────┘ └──────────┘ └─────┬──────┘ └─────┬──────┘
      ▲             ▲            │              │
      └─── leases ──┴────────────┴──────────────┘
```

**Four principles:**

1. **The holdco never operates.** No job contracts, no field labor, no steel.
   It holds membership interests and receives distributions. An entity that
   does nothing is hard to sue.
2. **Assets live away from operations.** Properties owns the Bonnieville land
   and shop; Equipment owns the trucks, forklifts and saws; both lease to the
   opcos at market rent under written leases. When Contracting is sued (F3),
   the plaintiff finds receivables and a lease — not a building and a fleet.
   **Keep real estate and rolling stock in separate entities**: premises and
   environmental exposure don't belong with auto liability.
3. **Contracting is the crown jewel.** Ten years of name and bonding history.
   The entire point of adding Supply is that Supply must not be able to take
   Contracting down. If you do one thing on this page, do this.
4. **Importing is quarantined** — with an honest account of the leaks in §5.

---

## 4. What Buzick actually looks like — and why it argues both ways

Ben named Buzick in Bardstown as the model. I pulled their actual filings from
the [Kentucky Secretary of State registry](https://sosbes.sos.ky.gov/BusSearchNProfile/search.aspx):

| Entity | Org # | Filed | Status |
|---|---|---|---|
| **Cliff Buzick, Inc.** dba *Buzick Lumber & Home Center* | 0006698 | **1946** | Active |
| **Buzick Construction, Inc.** dba *Buzick Site Development* | 0409511 | 1995 | Active, 100+ employees |
| **Buzick Real Estate, Inc.** | 0226067 | 1987 | Inactive |
| Buzick Air, LLC | 1093218 | 2020 | Active |
| Buzick Construction BG Group, LLC | 1380015 | 2024 | Active |

Five things fall out of that, and they don't all point the same way:

1. **Buzick is NOT a holding company.** There is no "Buzick Enterprises" in the
   registry. Cliff Buzick, Inc. and Buzick Construction, Inc. are **sibling
   corporations** with different offices, different registered agents, and
   different branches of the family running them. **Ben's proposed holdco is
   arguably cleaner and more modern than the thing he's copying.**
2. **The supply arm and the construction arm are genuinely separate businesses
   run by different people.** That is the most valuable feature to replicate —
   and it is precisely what makes their related-party dealings defensible
   (§6). Arm's length is easy when the other side really is a different
   business.
3. **Engineering is a *division* of Buzick Construction, not its own entity.**
   Worth knowing before spinning out a third arm — professional licensure rules
   constrain the structure. **[SIGN-OFF]** if Ben's third arm is design or
   engineering.
4. **They used a separate real-estate entity in 1987.** Independent
   confirmation of the §3 recommendation, from a real Kentucky operator.
5. **They are ~90 years and four generations in** — founded 1937, 255+
   rack-supported warehouses, 39 warehouses for Jack Daniel's. The multi-arm
   structure is the *result* of decades of growth, not a day-one design.

**And the part that cuts against the plan:** Buzick's moat is eighty years of
Nelson County distillery relationships. Nobody can tariff that away. Their
supply arm is a domestic lumberyard, not an import arbitrage. Use Buzick as
proof the multi-arm *structure* works — not as proof that *this* supply
business works. See `06`.

---

## 5. The import firewall — thinner than it looks

Putting the Importer of Record role in a separate entity is right. Be
clear-eyed about what it does and doesn't do.

**What the IOR signs up for.** Under
[19 USC 1484](https://www.law.cornell.edu/uscode/text/19/1484) the importer must
make entry *"using reasonable care"* — correct classification, valuation,
origin, and AD/CVD determination, with five-year recordkeeping. Penalties under
[19 USC 1592](https://www.law.cornell.edu/uscode/text/19/1592):

| Culpability | Maximum civil penalty |
|---|---|
| **Fraud** | **the domestic value of the merchandise** |
| Gross negligence | lesser of domestic value or **4×** the lawful duties |
| Negligence | lesser of domestic value or **2×** the lawful duties |

And §1592(d): the duties are *always* recoverable regardless of penalty. On a
$6M import year with $1.2M of duty, a mere **negligence** finding is up to
$2.4M in penalty *plus* the duty. That dwarfs the margin of the whole business.

**Three leaks in the firewall:**

- **The surety takes the wall down.** A customs bond is a three-party contract
  where the surety guarantees CBP — and then transfers the risk straight back
  via a **General Indemnity Agreement**. A new LLC with no financials cannot get
  a meaningful bond without Ben's personal indemnity. The moment he signs, the
  wall becomes a bridge. **[SIGN-OFF] Have a customs attorney read the GIA
  before Ben signs it. This is the single highest-leverage document in the
  venture.**
- **Customs can reach people, not just entities.** §1592 addresses *persons*,
  and federal case law lets CBP pursue individuals who "introduce" merchandise.
  An entity does not automatically insulate a principal who directed the entry.
- **An undercapitalized shell is the textbook piercing fact** (§7). Funding an
  entity too thinly to meet its foreseeable obligations is affirmative
  *evidence* — it makes the structure worse than useless.

**Recommendation: don't be the importer yet.**

**Phase 1 (months 0–18): buy DDP** from a US-based importer who is already the
IOR. You pay an intermediary margin — call it 8–20% on the delivered price,
**[SIGN-OFF] verify against real quotes** — and in exchange you transfer
classification risk, valuation risk, the retroactive AD/CVD tail, EAPA
exposure, tariff volatility, and the bond indemnity to somebody whose business
that is. Meanwhile you prove the cut shop, the delivery model and the customer
list, and you build the financial statements a surety needs to write a bond
*without* Ben's personal guarantee.

**Phase 2 (month 18+): go direct only if all five are true:**
1. The intermediary margin you'd save exceeds ~$250K/year.
2. A written classification opinion and a CBP binding ruling are in hand.
3. Supply has real capital — enough to survive a reassessment, not a shell.
4. The GIA has been negotiated to limit or collateralize Ben's indemnity.
5. A broker is engaged *and* a documented reasonable-care program exists.

Run both through `model/` — `base_case` vs `domestic_alternative`. Decide on
numbers, not instinct.

---

## 6. The related-party trap — read before the first invoice

**This is the highest-probability way the structure creates a problem, and it
will happen on the first job.**

On **fixed-price / hard-bid** work this is generally fine. Contracting quoted a
number; how it sources material is its own business.

On **cost-plus, GMP, T&M, open-book, or any public** work, it is dangerous —
and standard construction contracts address it by name.
**AIA A102–2017 §7.8.1** defines a *"related party"* to include *"a parent,
subsidiary, affiliate or other entity having common ownership or management with
the Contractor"*, any entity in which a stockholder or management employee owns
**more than ten percent**, and **"any member of the immediate family"** of such
a person. Misty Valley Supply qualifies on three independent grounds — and
putting it in a spouse's or child's name does not escape the definition.

**§7.8.2** then requires the Contractor to:

> *"notify the Owner of the specific nature of the contemplated transaction,
> including the identity of the related party and the anticipated cost to be
> incurred, **before any such transaction is consummated or cost incurred**...
> **If the Owner fails to authorize the transaction in writing, the Contractor
> shall procure** the Work, equipment, goods, or service **from some person or
> entity other than a related party.**"*

Billing a concealed affiliate markup as reimbursable "cost of the work" is a
breach on its face. Add a sworn **G702** certification that the amounts
represent costs incurred, and it moves toward fraudulent misrepresentation — on
publicly funded work, toward false-claims exposure. The realistic consequences
are disgorgement, an audit of every pay application on the job, termination for
cause, debarment from public work, and the loss of GC relationships that took
ten years to build.

**The protocol — adopt it now, before the first invoice:**

1. **Classify every job at bid time** as fixed-price, cost-plus/GMP/open-book,
   or public. Never decide this after the fact.
2. **On anything but pure lump sum, disclose in writing, in advance, every
   time.** Standard letter naming Supply, the common ownership, and the
   anticipated cost, requesting written authorization. Keep it in the job file.
3. **Publish a real price list** and sell to Contracting at the same price an
   unrelated contractor of similar volume pays. This does triple duty: arm's
   length for veil-piercing, transfer pricing for tax, and the defense if
   anyone alleges the markup was inflated.
4. **Competitively bid it.** Let Supply win or lose on price.
5. **Don't take a second profit** where the contract says the fee is the
   Contractor's only profit.
6. **Assume every cost-plus job will be audited**, because the audit clause is
   in there. Build the file for a reader three years out.

**[SIGN-OFF — HIGH PRIORITY]** A Kentucky construction attorney should review
the *actual* subcontract forms Contracting signs — they are often GC-drafted
and harsher than AIA — and draft the disclosure letter, **before Supply's first
sale to Contracting.**

---

## 7. Veil piercing — the checklist that keeps the walls up

Kentucky's leading case is
[***Inter-Tel Technologies, Inc. v. Linn Station Properties, LLC*, 360 S.W.3d 152 (Ky. 2012)**](https://caselaw.findlaw.com/court/ky-supreme-court/1595673.html)
— and the facts are uncomfortably close to Ben's plan: a wholly-owned subsidiary
leasing property, with parents above it. The Kentucky Supreme Court **pierced to
reach the parents.**

The two-prong test — **both** required:
1. **Domination:** *"such unity of ownership and interest that their
   separateness has ceased"*; and
2. **Injustice:** honoring the separate existence would *"sanction a fraud or
   promote injustice."*

The court's enumerated domination factors are your do-not-do list:
**grossly inadequate capitalization** of the subsidiary; the parent paying the
subsidiary's salaries and expenses; the subsidiary doing business only with the
parent; **describing the subsidiary as a division or department**; the parent
using the subsidiary's property as its own; and **failure to observe formal
legal requirements.**

> **Do not rely on "piercing doesn't apply to LLCs."** *Turner v. Andrew* (Ky.
> 2013) said in dicta that it does; *Pannell v. Shannon* (Ky. 2014) footnote 15
> expressly **reserved** the question. Assume they can be pierced. **[SIGN-OFF]**

**The protocol:**

*Money*
- [ ] Separate bank account per entity — possibly different banks. No exceptions.
- [ ] Separate books per entity. Not classes in one QuickBooks file.
- [ ] **No commingling, ever.** No personal expenses. No paying Contracting's
      payroll out of Supply's account.
- [ ] Intercompany cash moves as documented **loans** (promissory note, market
      interest, a schedule that is actually followed) or as recorded
      contributions/distributions. Never unlabeled transfers.

*Paper*
- [ ] Signed operating agreement per entity.
- [ ] Written **lease** from Properties and Equipment to each opco, at market
      rent, **actually paid on schedule**.
- [ ] Written **Master Supply Agreement** and price list, Supply → Contracting.
- [ ] Shared-services agreement for back office, with a defensible allocation.
- [ ] Annual written consents for every entity. File the SOS annual report on
      time — administrative dissolution is a gift to a plaintiff.
- [ ] Every contract signed in the correct entity's name, with title.

*Identity*
- [ ] **Never say "a division of."** *Inter-Tel* lists it explicitly. Say "an
      affiliate of."
- [ ] Separate invoices, letterhead, email addresses, signage.
- [ ] Employees on **one** entity's payroll, leased to others in writing.
- [ ] **Separate insurance per entity** — a single policy naming "Misty Valley"
      as one insured is itself evidence of unity of interest.
- [ ] **Each entity adequately capitalized for its own obligations.**

> If Ben will not run four sets of books, he should not have four entities. A
> structure that exists on paper but not in the bank accounts gives no
> protection and adds real cost. **Fewer entities, properly maintained, beats
> more entities maintained sloppily.**

---

## 8. Tax — the distributor traps

**Federal.** A chain of wholly-owned SMLLCs under Enterprises, with no
corporate elections, is **disregarded** — the whole group files as one
taxpayer. No intercompany income tax, no transfer pricing, no consolidated
election needed. That elegance is the main reason to build a wholly-owned chain
rather than sibling entities owned directly by Ben.

But **EINs are needed per entity anyway**: a disregarded SMLLC is *"treated as
a separate entity for purposes of employment tax"* and must use its own EIN for
payroll. Get all five; they're free.

**§199A is permanent.** The One Big Beautiful Bill Act (H.R. 1, signed July 4,
2025) made the 20% qualified business income deduction permanent, widened the
phase-in ranges, and added a $400 minimum deduction. Neither contracting nor
wholesale distribution is an SSTB — but the **W-2 wage and UBIA limitation**
applies, which is another reason to pay real wages in each opco.
**[SIGN-OFF]** Model the §1.199A-4 aggregation election across the group.

**Entity elections — the baseline:**

| Entity | Treatment | Why |
|---|---|---|
| Enterprises | Partnership (or disregarded) | Flexibility, basis step-up. Never S-elect the holdco. |
| Contracting | LLC + **S election** | Services business; SE-tax savings are real. |
| Supply | LLC + **S election**, probably | See below. |
| **Properties** | **Partnership/disregarded — NEVER a corporation** | Appreciated real estate in a corporation is trapped; you cannot distribute it out without gain at both levels. |
| Equipment | Partnership/disregarded | Depreciation flows out cleanly. |

Two nuances worth knowing. **The S election is likely worth more on Supply than
Contracting** — the IRS reasonable-compensation analysis asks whether revenue
comes from the owner's personal services or from capital and inventory. In
Contracting it's Ben's services (expect a big salary). In Supply it's largely
capital. But **basis works against the S election for a capital-hungry
importer**: in a partnership, outside basis includes a share of entity debt
under §752, supporting loss deductions; in an S corp, guaranteeing corporate
debt gives you **no basis**, so a leveraged Supply's first-year losses can be
suspended. **[SIGN-OFF]**

### The Kentucky LLET traps

[KRS 141.0401](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=57941):
the tax is the **greater of $175 or the LESSER of** a gross-receipts
computation ($0.095 per $100) and a gross-profits computation ($0.75 per $100),
with phase-outs between $3M and $6M.

The naive fear — "high gross receipts will crush a distributor" — is
**overstated**, because you get the *lesser* of the two and thin margins drive
the gross-profits method down. The two methods cross at a **12.67% gross
margin**. The real traps are these:

1. **It's a tax on revenue, not profit.** In a loss year Supply still owes it.
2. **Statutory COGS is narrower than book COGS**, which *inflates* your
   computed "gross profits." Labor is limited to **direct** labor incorporated
   into the product. Warehouse pickers, dispatchers, drivers and office staff
   are out — and **delivery cost is not includible** (the bulk-delivery
   allowance is limited to motor fuels). Your 18% book margin may compute as a
   24% statutory margin, pushing you across the crossover.
3. **🔴 The cut shop may not be "wholesaling" at all.** For any activity *other
   than* manufacturing, producing, reselling, retailing or wholesaling,
   **no costs are deductible** — 100% of that revenue is "gross profits" taxed
   at $0.75/$100. If cut-to-length fabrication is characterized as a
   **service**, that's the outcome. If it qualifies as **"manufacturing" or
   "producing"** (assembling components into a significantly different or
   enhanced end product), costs come back. **[SIGN-OFF — this single
   characterization is worth five figures a year and is the #1 CPA question.]**
4. **$175 leaks per entity, per layer.** The tiered credit flows up only after
   each layer's tax is reduced by its $175 minimum. Five entities = **$875/year
   of permanently non-creditable LLET.** That is the real price of entity
   proliferation.
5. **Intercompany sales double-count.** Supply's $5M sale to Contracting is in
   Supply's gross receipts *and* embedded in Contracting's when it bills the GC.
   **There is no LLET consolidation for LLCs** — KRS 141.201 is a *corporation*
   provision. Combining does not fix this.

### 🔴 Kentucky sales & use tax — settle this before the first invoice

Under [103 KAR 26:070](https://apps.legislature.ky.gov/law/kar/titles/103/026/070/),
a **construction contractor is the consumer** of materials it incorporates into
realty and **pays sales/use tax on its purchases**; it generally may *not*
issue a resale certificate. The exception is a **"contractor-retailer."**

So Supply's sales to contractors are **generally taxable retail sales**, not
exempt wholesale sales — the opposite of most people's intuition. Getting this
wrong across millions in sales is a catastrophic assessment. **[SIGN-OFF —
first-order question for the KY CPA before Supply issues a single invoice.]**

---

## 9. Getting paid — Kentucky lien deadlines

Supply's failure mode isn't lack of sales; it's selling to someone who pays in
90 days or not at all (F4). As a supplier to a *contractor*, Supply is **not in
privity with the owner** and must serve a pre-lien notice or it gets nothing.

| Step | Deadline | Statute |
|---|---|---|
| **Pre-lien notice to owner** (commercial, claim > $1,000) | **120 days** after last material furnished | [KRS 376.010(4)](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=54156) |
| Pre-lien notice (commercial, < $1,000) | 75 days | KRS 376.010(4) |
| **Pre-lien notice (owner-occupied 1–2 family)** | **75 days** — and **no lien for anything the owner already paid the GC before your notice arrives** | KRS 376.010(5) |
| **File lien statement** with the county clerk | **6 months** after last furnishing | [KRS 376.080(1)](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35289) |
| **🔴 Mail a copy to the owner** | **7 days after filing — the lien DISSOLVES if you don't** | KRS 376.080(1) |
| **File suit to enforce** | **12 months** from filing | [KRS 376.090(1)](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35290) |
| **Public work — file verified statement** | **60 days** after the last day of the month in which material was furnished, or substantial completion, whichever is later | [KRS 376.230](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=35308) |

Two traps worth naming: **you cannot give notice to the GC instead of the
owner** — KRS 376.010(5)(e) says the contractor cannot be the authorized agent.
And on **tenant improvement work**, the lien reaches only the leasehold unless
the owner designated the lessee as its agent **in writing** (KRS 376.010(1)(b)).
TI work in leased retail or industrial space is a Kentucky lien minefield.

**The credit toolkit, in order of effectiveness:**

1. **Joint check agreements** — the single most effective non-lien remedy,
   because it removes your money from your customer's cash flow. Get the GC's
   signature, not just the sub's, *before* first delivery.
2. **Credit application with a personal guarantee** on every account.
   **[SIGN-OFF]** [KRS 371.065](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=39230)
   may render a guaranty unenforceable unless it states the **maximum
   liability** and a **termination date**. This statute has burned a lot of
   suppliers — have counsel draft the form.
3. **Pre-lien notices as routine**, sent at a fixed trigger (first delivery +
   30 days), not when an account goes bad. By then you may be past day 75.
4. **UCC-1 / PMSI in inventory** — [KRS 355.9-324(2)](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=55693)
   requires the filing to be perfected **before the debtor receives the goods**
   *and* written notice to prior inventory filers. Search the KY SOS UCC index
   at account setup, file before delivery, notify. Easy to blow. **[SIGN-OFF]**
5. **Pull the payment bond on any public job before extending credit** —
   [KRS 45A.190](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=54631)
   requires 100% payment bonds on Commonwealth contracts over $100,000, and the
   agency must furnish a copy to anyone who asks.

---

## 10. Insurance

Structure limits what a claim reaches. Insurance is what pays. Supply's
exposure is materially different from Contracting's, and the existing policy
almost certainly does not extend to it.

| Coverage | Why Supply specifically |
|---|---|
| CGL **with products–completed operations** | Confirm it isn't deleted or sublimited, and has its **own aggregate**. |
| **Products liability (importer)** | The most important policy Supply buys — see `03` on why the middleman defense fails. May need an E&S market. **Disclose the cut shop; non-disclosure is a rescission risk.** |
| Marine cargo (ICC-A, warehouse to warehouse) | Also covers **General Average** — a vessel casualty can have your cargo held until you post a bond. |
| Commercial auto (owned/hired/non-owned) | Jobsite delivery is the most likely catastrophic claim. |
| Property — building, contents, **and stock** | Insure inventory at **landed cost including duty**, not invoice cost. Post-232 the duty component is enormous. Use a reporting form or peak-season endorsement. |
| Inland marine / motor truck cargo | Material on **your own** trucks is your property — the CGL does not cover it. |
| Umbrella | Confirm it **follows form** over products–completed operations. |
| Workers' comp | Correct class codes for fabrication and drivers. |

**What a standard CGL will *not* cover:** damage to **your own product** (the
studs themselves), and — critically — **product recall/withdrawal**. If
under-gauge studs must be pulled from twenty jobsites, the CGL pays nothing
toward finding, retrieving and replacing them. For an importer of a
code-regulated structural product, a separate **recall/withdrawal** policy is
worth pricing.

**Ask the broker in writing:** *"Does this policy exclude or limit coverage for
products we import from outside the United States; does it cover us as importer
and distributor; and does the cut-shop operation trigger a manufacturing
classification?"* Get it in writing.

---

## 11. Sequencing

Do not form five entities next week.

| Phase | Action | Trigger |
|---|---|---|
| Now | Form **Supply LLC**; own bank account, own books | Before the first PO |
| Now | Written price list + supply agreement with Contracting | Before the first related-party sale |
| Now | **Products liability bound for Supply** | **Before material ships** |
| Now | Settle KY sales-tax treatment with the CPA | **Before the first invoice** |
| Before first entry | Decide DDP vs IOR (§5) | Before wiring a deposit |
| Phase 2 | Form **Enterprises**; contribute the opco interests | Once Supply is proven. **[SIGN-OFF]** on moving Contracting without disrupting bonding, licensing or existing subcontracts |
| Phase 2 | Form **Properties** and **Equipment** | When there are real assets to hold |

Forming a holding company for a business that hasn't proven it works is
optimizing the wrong thing. Buzick added arms one at a time across four
generations.

---

## 12. The sign-off register

**Kentucky business attorney** — multi-member Enterprises for charging-order
protection (§2); current case law on KRS 275.260 and SMLLCs; whether piercing
applies to LLCs post-*Pannell*; operating agreements, supply agreement, leases,
shared-services agreement; guaranty form under KRS 371.065; PMSI procedure;
restructuring Contracting without breaking bonding.

**Kentucky construction attorney — HIGH PRIORITY** — the related-party protocol
before Supply's first sale to Contracting (§6); the actual subcontract forms;
the lien-notice calendar (§9); which bonding statute applies to each public
owner; indemnity language in customer POs vs. the CGL "insured contract"
definition.

**Kentucky CPA** — **whether the cut shop is manufacturing or a service under
KRS 141.0401** (§8); **sales/use tax under 103 KAR 26:070 before the first
invoice**; whether an LLC-only group is an "affiliated group" for the LLET
thresholds; intercompany LLET double-counting and $175-per-layer leakage;
entity elections and reasonable-comp study; §199A aggregation; §469 self-rental
recharacterization on the leases.

**Licensed customs broker + customs attorney** — written classification opinion
and AD/CVD scope determination **before any PO** (`02`); **review the surety
General Indemnity Agreement before Ben signs it**; reasonable-care program and
prior-disclosure protocol; DDP vs. direct economics on real quotes.

**Insurance broker (importer/products specialty)** — products placement
disclosing the cut shop and country of origin; products–completed ops with its
own aggregate; umbrella follows form; inventory valued at landed cost including
duty.

**Kentucky products-liability attorney** — whether the cut shop converts Supply
from distributor to manufacturer under KRS 411.300/.340 (`03`).
