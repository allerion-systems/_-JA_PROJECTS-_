# Misty Valley — Entity Structure

**Status:** working draft for review by a Kentucky attorney and CPA. Nothing
here is legal or tax advice. Sections marked **[CONFIRM]** are questions to put
to counsel, not conclusions.

---

## 1. What the structure has to accomplish

Structure is not paperwork. It is a set of walls, and you only find out where
you needed them after something has already gone wrong. Before drawing boxes,
name the specific fires each wall is there to contain:

| # | The fire | What it burns if there's no wall |
|---|---|---|
| F1 | A stud fails in a fire-rated or load-bearing assembly | Supply, Contracting, Ben personally |
| F2 | CBP reassesses duty or AD/CVD two years after entry | The importing entity, its bond surety, then the guarantors |
| F3 | A contracting job goes bad — injury, defect, delay claim | Contracting, and any affiliate that looks like the same company |
| F4 | A customer doesn't pay for a container already sold | Supply's cash, and the next container it can't buy |
| F5 | Supply sells to Contracting on the same job at a markup | The GC relationship, and potentially a fraud allegation |

The structure below exists to keep each fire inside one box. Every design
choice traces back to a row in that table.

---

## 2. Recommended architecture

```
                    ┌───────────────────────────────┐
                    │  Misty Valley Enterprises LLC │   holding company
                    │  (KY, member-managed)         │   owns; does not operate
                    └───────────────┬───────────────┘
                                    │
        ┌────────────────┬──────────┴────────┬──────────────────┐
        │                │                   │                  │
┌───────▼───────┐ ┌──────▼───────┐ ┌─────────▼──────┐ ┌─────────▼────────┐
│ Misty Valley  │ │ Misty Valley │ │  Misty Valley  │ │  MV Import Co    │
│ Contracting   │ │ Supply LLC   │ │  Properties    │ │  LLC             │
│ LLC           │ │              │ │  LLC           │ │                  │
│               │ │              │ │                │ │                  │
│ installs      │ │ distributes, │ │ owns the shop, │ │ Importer of      │
│ (10 yrs of    │ │ cuts,        │ │ yard, trucks,  │ │ Record only.     │
│  goodwill —   │ │ delivers     │ │ equipment;     │ │ Takes customs    │
│  protect it)  │ │              │ │ LEASES to opcos│ │ risk. Owns       │
└───────────────┘ └──────────────┘ └────────────────┘ │ nothing else.    │
                                                       └──────────────────┘
```

**Four principles behind that picture:**

1. **The holding company never operates.** It signs no job contracts, employs
   no field labor, buys no steel. It holds membership interests and receives
   distributions. An entity that does nothing is very hard to sue.

2. **Assets live away from operations.** Properties LLC owns the Bonnieville
   shop, the yard, the delivery trucks, the cut-shop equipment, and leases them
   to Contracting and Supply at market rates under written leases. When
   Contracting gets sued (F3), the plaintiff finds an operating company with
   receivables and a lease — not a building and a truck fleet. This is the
   single highest-leverage move in the whole diagram and it costs almost
   nothing to set up.

3. **Contracting is the crown jewel — insulate it first.** Ben spent ten years
   building that name and that bonding history. The entire point of adding
   Supply is that it must not be able to take Contracting down with it. If you
   do nothing else on this page, do this.

4. **Importing is quarantined in its own entity.** See §4 — with an honest
   caveat about how well that wall actually holds.

---

## 3. Why this is *not* simply "the Buzick model"

Ben cited Buzick in Bardstown as the template: lumber, supply, construction,
engineering under one family. That's a real company and a fair aspiration —
Cliff Buzick bought a Nelson County lumberyard in 1944, his son Donald ran it
from age 19, added a hardware store in 1975, and Susan Elmore has run it since
1992; a separate Buzick Construction serves the distillery trade.

Read that again, because it argues against the plan as much as for it:

- **It took 80+ years and three generations.** The arms were added one at a
  time, decades apart, each funded by the last.
- **Buzick's supply arm is a domestic lumberyard, not an import arbitrage.**
  Their moat is eighty years of distillery relationships in Nelson County.
  Nobody can tariff that away. A margin that exists because of a gap in the
  tariff schedule is a fundamentally different asset — see `02` and `04`.
- **The order was construction → supply.** Same as Ben. That part transfers.
  The *source of margin* does not.

Use Buzick as proof the multi-arm structure works. Do not use it as proof that
*this* supply business works. Those are two different claims.

---

## 4. The import question — where the wall is thinner than it looks

The instinct is right: put the Importer of Record role in a separate,
thinly-capitalized entity so that a catastrophic customs assessment (F2) can't
reach Contracting or Ben's house. That is worth doing. But be clear-eyed about
three leaks:

**Leak 1 — the surety wants a guarantee.** An importer needs a customs bond.
The surety underwriting that bond will look at a brand-new entity with no
balance sheet and require a personal and/or corporate indemnity agreement
before issuing. The moment Ben signs that indemnity, the bond stops being a
wall and becomes a bridge straight to whoever signed. **[CONFIRM]** what the
surety will actually demand, and price the alternative (cash collateral) before
assuming the firewall holds.

**Leak 2 — customs penalties can reach people.** Duty liability sits with the
importer, but the penalty statute for false statements at entry addresses
persons, not only corporations. A principal who directed or was reckless about
entry declarations is not automatically insulated by the entity.
**[CONFIRM]** with trade counsel the exposure of an individual officer.

**Leak 3 — an undercapitalized shell is the textbook veil-piercing fact
pattern.** Deliberately funding an entity too thinly to meet its foreseeable
obligations is one of the facts courts look for. The firewall entity must be
*adequately capitalized for its own business*, observe formalities, and price
its dealings with affiliates at arm's length — otherwise it is worse than
useless, because it looks like intent. **[CONFIRM]** Kentucky's veil-piercing
standard and what "adequate" means here.

**The alternative worth pricing seriously: don't be the importer at all.**
Buy the same material DDP (Delivered Duty Paid) from a US-based importer or
trading house that is already the IOR. You give up several points of margin.
In exchange you transfer classification risk, valuation risk, AD/CVD
retroactive-assessment risk, and the bond indemnity to somebody whose business
that is. For a company making its *first* import, against the AD/CVD trend
documented in `02`, that trade is probably worth it for at least the first
several containers. Run both through the model (`model/`) as
`base_case` vs `domestic_alternative` and decide on numbers, not instinct.

---

## 5. The related-party trap — read this before the Hebron job

Supply selling material to Contracting on a job Contracting is performing is
the highest-probability way this structure creates a problem, and it will
happen on the very first job if nobody plans for it.

The risk is not theoretical:

- On any **cost-plus or GMP** contract, the "cost of the work" is defined by
  the contract, and standard AIA forms address purchases from entities the
  contractor has an interest in. Marking up affiliate material into a
  reimbursable cost line without disclosure and consent is, at best, a breach;
  characterized unsympathetically, it is a false claim. **[CONFIRM]** the exact
  clause in each contract Contracting signs.
- On **lump-sum/hard-bid** work the exposure is lower — the GC bought a number,
  not a cost — but disclosure is still the cheap insurance.
- On **public or federally funded** work, related-party markups plus imported
  steel is a combination that invites a very unpleasant audit.

**Rule to adopt now, before the first invoice:** Supply sells to Contracting at
a documented, written, arm's-length price — the same price list an unrelated
contractor gets — and the relationship is disclosed in writing to the GC or
owner on any contract that is not pure lump sum. Put it in the operating
agreements. It costs nothing today and is unfixable in hindsight.

---

## 6. Intercompany discipline — the checklist that keeps the walls standing

Courts disregard entity separateness when the owners did first. The diagram in
§2 is worth exactly as much as the discipline below.

- [ ] Separate bank account per entity. No exceptions, no "I'll move it later."
- [ ] Separate books per entity. Not classes in one QuickBooks file.
- [ ] Written operating agreement per entity, actually signed.
- [ ] Written lease from Properties to each opco, at a market rate, actually paid.
- [ ] Written supply agreement and price list between Supply and Contracting.
- [ ] Separate insurance per entity (see §7) — not one policy "covering the group."
- [ ] Every contract signed in the correct entity's name, with title.
- [ ] No paying one entity's bills from another's account. Ever.
- [ ] Distinct signage, invoices, email domains, business cards.
- [ ] Annual meeting minutes, even if it feels silly with one owner.
- [ ] Each entity adequately capitalized for its own obligations.

If Ben will not run four sets of books, then he should not have four entities.
A structure that exists on paper but not in the bank accounts gives no
protection and adds real cost. **Fewer entities, properly maintained, beats
more entities maintained sloppily.**

---

## 7. Insurance stack

Structure limits what a claim can reach. Insurance is what actually pays. The
new entity's exposure is materially different from Contracting's, and the
existing policy almost certainly does not extend to it.

| Coverage | Why Supply specifically needs it |
|---|---|
| CGL + products/completed operations | Baseline. Confirm Supply is a **named insured**, not assumed covered. |
| **Products liability** | The big one. An importer is generally treated as the manufacturer for liability purposes when the foreign maker is beyond US jurisdiction — see `03`. |
| Marine cargo | Ocean loss is on you the moment risk transfers under the Incoterm. |
| Commercial auto | Delivery to job sites is a new, real exposure. |
| Property / inventory | Container-loads of steel sitting in Bonnieville. |
| Umbrella / excess | Cheap relative to the tail risk here. |

**[CONFIRM] the question to ask the broker, in these words:** *"Does this policy
exclude or limit coverage for products we import from outside the United
States, and does it cover us in our capacity as importer and distributor rather
than manufacturer?"* Get the answer in writing. Importer product liability is
commonly excluded, sub-limited, or surcharged, and finding that out after a
claim is the expensive way.

---

## 8. Tax and Kentucky-specific items — **[CONFIRM] with a KY CPA**

Deliberately not answered here. These need a licensed Kentucky CPA because the
answers change the structure, and getting them from an AI is exactly the wrong
way to decide them:

1. **Kentucky Limited Liability Entity Tax (LLET).** Kentucky imposes an entity
   tax computed on gross receipts *or* gross profits. A **distribution business
   has enormous gross receipts against thin gross profit** — this is a known
   trap for distributors and it may materially change which computation to
   elect and whether the group should file combined. Model this before
   choosing entities, not after.
2. **Entity tax classification.** Partnership vs S-corp election per opco,
   reasonable-compensation exposure, and the qualified business income
   deduction's current status.
3. **Series LLC** — whether Kentucky authorizes them at all. Do not assume.
4. **Number of EINs actually required** given disregarded-entity subsidiaries.
5. **Sales and use tax.** A distributor collecting Kentucky sales tax, resale
   certificates from contractor customers, and use tax on the imported
   inventory. Getting resale certificates wrong is a common, expensive audit
   finding.
6. **Nexus** if Supply delivers across state lines (Tennessee, Indiana, Ohio).

---

## 9. Credit and collections — structure that protects revenue

Supply's failure mode is not lack of sales. It is selling a container to
somebody who pays in 90 days, or not at all (F4). Build the collection
machinery before extending the first dollar of credit, not after the first
slow payer:

- **Credit application with a personal guarantee** for every account. The first
  customer is the hardest one to ask, and the one you'll most regret not asking.
- **Kentucky materialman's lien rights.** As a supplier to a *contractor* rather
  than the owner, Supply is not in privity with the owner and must serve a
  pre-lien notice within a statutory window to preserve lien rights.
  **[CONFIRM]** the exact notice and filing deadlines under KY lien law — they
  are short, they differ between residential and commercial, and missing one
  forfeits the remedy entirely. Put them on a calendar keyed to first delivery.
- **Bond claims** on any bonded public work — different deadlines again.
- **Joint check agreements** with the GC on larger packages.
- **UCC-1 / purchase-money security interest** in inventory sold on credit.

---

## 10. Sequencing — what to form, and when

Do not form four entities next week. Form what the next 90 days actually
requires, and add walls as the risks appear:

| Phase | Action | Trigger |
|---|---|---|
| Now | Form **Misty Valley Supply LLC**; open its own bank account and books | Before the first purchase order |
| Now | Written price list + supply agreement with Contracting | Before the first related-party sale |
| Now | Products liability coverage bound for Supply | **Before material ships**, not before it's installed |
| Before first entry | Decide IOR vs DDP (§4); if IOR, form **MV Import Co** and secure the bond | Before wiring a deposit |
| Phase 2 | Form **Enterprises** holdco; contribute the opco interests | Once Supply has proven it works — restructuring later is a taxable-event question for the CPA |
| Phase 2 | Form **Properties**; move the shop/yard/trucks | When there are real assets worth protecting |

The order matters. Forming a holding company for a business that hasn't proven
it works is optimizing the wrong thing.

---

## Open questions for counsel

1. Kentucky veil-piercing standard, and whether the §2 structure satisfies it.
2. Whether the surety will demand personal indemnity on the customs bond, and
   what cash collateral instead would cost.
3. Kentucky's innocent-seller / middleman protection for distributors — and
   critically, whether it still protects a distributor **who is also the
   importer** (see `03`).
4. LLET computation and combined-filing election for a low-margin distributor.
5. Related-party disclosure obligations under the specific contract forms
   Contracting signs.
6. Whether Kentucky authorizes series LLCs.
7. Pre-lien notice and lien filing deadlines for a material supplier.
