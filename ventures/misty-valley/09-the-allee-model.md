# The Allee Model

> *"Annually, the Allee Lumber Company buys and sells thirty-five to forty
> million feet of lumber, **most of which is never seen by them.**"*
>
> — Allee Wholesale Lumber Company, Mattoon, Illinois

---

## 1. What the article actually describes

Read past the nostalgia and there is a precise operating mechanism in there.
Four sentences carry the whole business:

> *"When a mill wants to sell a quarter-million feet of lumber, the message
> comes into the Allee office, giving the price and specifying the grade and
> how the lumber is loaded. If the Allees accept the offer, the lumber is
> **consigned to their diverting point** and the shipment starts on its way."*
>
> *"**Then we get busy and sell before it gets to the diverting point** which
> might be an eight day run from the mill."*
>
> *"When the lumber is sold the new buyer takes over at the diverting point."*
>
> *"They buy a mill's reputation and sell on their own reputation."*

Unpack it:

1. **They bought a carload without a buyer for it.** Real risk, taken
   knowingly.
2. **They routed it to a diverting point** — a rail practice that let a car be
   re-billed mid-route to a final destination without losing the through
   rate. Kansas City, eight to ten days out from the Oregon mills.
3. **They sold it while it was moving.** Eight days of rolling time was the
   sales window. The freight was already earning its way to the customer
   before the customer existed.
4. **They never touched it.** No yard. No forklift. No warehouse. The buyer
   took over at the diverting point.
5. **Their inventory was information** — the "piece tally" showing what was
   bought and how it was loaded, worked against a customer list by telephone.
6. **Their collateral was reputation**, in both directions. Mills trusted them
   to take a car. Buyers trusted them to deliver what the tally said.

The name is not a coincidence and the article knows it: *Allee* from the
French *aller*, to go. **"We have cars rolling all the time."**

---

## 2. Why this stops me cold

I have spent this entire engagement telling Ben the same thing in six
different documents:

> **The binding constraint is working capital, not demand.**
> `04` §5 — the 137-day cash cycle.
> `08` §1.1 — no mill terms and the plan runs out of money.
> The business plan §7.5 — growth consumes cash faster than profit makes it.

Every model I built ran into the same wall: **you cannot grow a stocking
distributor faster than you can fund its inventory and receivables.**

**The Allee model does not have that wall.** If the load is sold before it
lands, there is no inventory. If there is no inventory, there is no yard, no
forklift, no racking, no truck, no insurance on stock, and — the part that
matters — **no capital rationing your growth.**

Two brothers and a secretary moved 35–40 million board feet a year. Not
because they were better capitalised than everyone else. Because **they had
almost no capital in the business at all.**

---

## 3. The numbers, run through the same model

Same product, same market, same corridor. Only the *shape* changes.

| | **Stocking distributor** | **Direct-ship trading** |
|---|---:|---:|
| Year 3 revenue | $4,481,625 | **$16,723,800** |
| Year 3 EBITDA | $357,982 | **$1,854,960** |
| Gross margin | 25.1% | 14.2% |
| **Cash conversion cycle** | **80 days** | **35 days** |
| **Peak cash requirement** | **$707,778** | **$498,549** |
| Startup capital | $185,000 | **$35,000** |
| Term debt needed | $200,000 | **$0** |
| Breakeven | 0.83 loads/mo | 1.21 loads/mo |

`python3 model/proforma.py --scenario direct_ship`

**Read that table twice.** The trading model earns **five times the EBITDA on
less peak cash and a fifth of the startup capital.** Gross margin is barely
half — 14.2% against 25.1% — and it does not matter, because margin was never
the constraint. **Capital was.** Halve the margin and quadruple the volume and
you are far ahead, because the thing that was rationing volume is gone.

This is the single most important number in anything I have given Ben and
Joey this week, and it came out of a newspaper clipping, not a spreadsheet.

---

## 4. What transfers, and what absolutely does not

Being ruthless about this matters more than being inspired by it.

### Transfers intact

- **Sell before you possess.** The core mechanic. Direct mill shipment to job
  site is standard practice in building products — the mill's truck goes to
  the site, you never touch the material.
- **Asset-light beats asset-heavy on return.** Structurally true then, true
  now, and the model above proves it on Misty Valley's own numbers.
- **Reputation in both directions is the real asset.** Mills extend credit to
  people who pay. Contractors buy from people who deliver. Neither is
  purchasable and both compound.
- **Position at the crossing.** Mattoon was "at the crossing of two major
  railroads." Bonnieville is on I-65 between Louisville and Nashville, 62
  miles from a CSX intermodal ramp. Same idea, different century.
- **Go and look.** Four trips a year to the mills to inspect production. In a
  business where you never see the goods, that is the quality system. `03`
  says the same thing in modern language.

### Does NOT transfer

- **🔴 The information edge is gone.** The Allees spent $10,000–$12,000 a year
  on teletype and long distance — enormous money then — because *speed of
  information was the moat*. Everyone has that now, instantly, free. **Whatever
  Misty Valley's edge is, it cannot be "we know the price."**
- **🔴 CORRECTED — see `10-the-channel-problem.md`. The diverting point still exists in rail tariffs, but the model does not port to cold-formed steel: CFS mills sell exclusively through authorized distributors, there is no rail substrate, and you inherit specification liability. The diverting point may not work the same way.** Mid-century rail transit
  privileges under ICC tariffs were a specific regulatory artifact.
  **RESOLVED — and worse than "may not."** The rail mechanism survives (UP
  publishes a lumber diversion rule effective 1 Feb 2026), but cold-formed
  steel moves by truck, direct, and there is no mode that sells in-transit
  destination optionality with rate protection. See `10`.
- **Thin margin is unforgiving.** At 14.2% gross, one bad receivable eats the
  profit on ten loads. In the stocking model at 25%, it eats four. **Credit
  discipline stops being important and becomes existential.**
- **You can be disintermediated.** A trader who adds nothing but a phone call
  gets removed the moment the mill and the contractor meet. The Allees survived
  that risk for decades on reputation and service. **Reputation is not a
  strategy you can start with — it is one you accumulate.**

---

## 5. The synthesis — this is the actual answer

The mistake would be reading this as *"abandon the cut shop, become a
broker."* That is wrong, and it throws away the one genuinely defensible thing
in the whole plan.

**Run both. They are not competitors — they are engine and flywheel.**

```
   DIRECT-SHIP BOOK                    CUT SHOP + PACKAGES
   (the Allee engine)                  (the defensible margin)

   14% gross margin                    25%+ gross margin
   ~zero capital per load              capital-hungry per load
   scales without funding              scales only with funding
   builds mill relationships  ───────► which earn the trade terms
   builds customer list       ───────► that the cut shop sells into
   generates cash             ───────► that funds the yard and the line
   NO differentiation                  THE differentiation
```

**The direct-ship book is how you get big. The cut shop is why they keep
buying from you.** One creates volume, credit history, and mill standing with
almost no capital; the other converts a slice of that volume into margin
nobody can match on price.

And note what this does to the two problems I flagged hardest:

- **`08` §1.1 — no mill terms breaks the plan.** The fastest way to earn mill
  terms is to move volume and pay on time. The direct-ship book does that
  **without needing the terms first.** It bootstraps the exact credit standing
  the stocking model assumes it already has.
- **The roll-forming question from earlier today.** A machine needs volume to
  make sense — breakeven was ~1 load/month but real economics need 5+. The
  direct-ship book gets to 20 loads/month on $35,000 of startup capital.
  **The trading book is what eventually justifies the machine.**

That is the sequence. It was in the family the whole time.

---

## 6. The exact path

**Phase 0 — now, before anything else.** Ben's first container decision
(`05`) is unchanged and still urgent. This does not replace it.

**Phase 1 (months 0–6): open the book.**
- Mill credit applications — ClarkDietrich, Telling, MarinoWARE — on
  Contracting's ten-year payment history (`08` §1.1). This is now the single
  highest-priority action in the entire plan, because it is the gate on
  everything downstream.
- Confirm each mill will **ship direct to job site**, and at what minimum.
  **ANSWERED, and it is no — not to a trader.** CFS mills sell exclusively
  through authorized distributors. The question to ask instead is whether they
  will *appoint* Misty Valley Supply. See `10-the-channel-problem.md`.
- Sell the first direct-ship loads into Contracting's own jobs. Zero customer
  risk, real transaction history.
- Build the piece tally: what you bought, how it loaded, who might want it.
  Grandpa's ledger, in a database.

**Phase 2 (months 6–18): widen the book, open the yard.**
- Outside customers on direct-ship. Credit application with a personal
  guarantee on every account, no exceptions (`08`).
- **Now** open the cut shop — funded by trading cash flow rather than by a
  term loan, and sized to demand you have already proven.
- Direct-ship becomes the volume; cut packages become the margin.

**Phase 3 (18 months+): the moat.**
- Takeoff and package engineering as the front end — the supplier who does the
  takeoff owns the package before the bid is let.
- Roll-forming only when the book supports it (`model/rollform.py`).
- Additional product lines on the same relationships. Cheapest revenue there
  is.

---

## 7. How Joey capitalises on this specifically

This is the part worth being direct about.

**Joey's edge is not the family story. It is that he is an estimator.**

The Allee brothers' advantage was *information arriving faster than anyone
else's* — the teletype. That specific edge is gone. But there is a modern one
sitting in exactly the same place in the transaction, and Joey already holds
it:

**The person who does the takeoff knows what the job needs before the buyout
happens.** Not the price — everyone has the price. The *scope*. The wall
schedule, the gauges, the quantities, the sequence. That is upstream of price
and it is where the package gets won.

His grandfather sold lumber that was already rolling. **Joey can sell a
package that is already taken off.** Same structural position — get in front
of the transaction, not into the middle of it.

Add to that: he grew up in it, he can read a set of plans, and he is credible
to a GC in a way a commodity broker never will be.

### 🔴 And the line he must not cross

Joey works as an estimator for a general contractor. **He cannot use his
employer's bid information, project pipeline, or subcontractor pricing for
Misty Valley Supply.** Not "should not" — cannot. That is misappropriation of
his employer's confidential information, it is very likely a breach of his
employment agreement, and it would end both the job and the reputation the
whole model runs on.

**The distinction is clean and he must hold it:**
- **His skill transfers** — knowing how to take off a CFS package, read a wall
  schedule, and price a job. That is his, earned, portable.
- **His employer's information does not.** Ever.

**[SIGN-OFF]** He should read his employment agreement for non-compete,
non-solicit, moonlighting and conflict-of-interest terms, and — if there is
any real ambiguity — have a Kentucky employment attorney look at it **before**
Misty Valley Supply sells anything to anyone in R&B's market. The Allee name
is worth more than any single order.

---

## 8. The honest summary

Ben has the trade, the crews, the customers and the yard. Joey has the
estimating skill, the takeoff capability, and — it turns out — the playbook.

The plan as written was a good asset-heavy distributor that would have spent
three years fighting a working-capital wall to reach $4.5M and $358K of
EBITDA. The same market, run the way Joey's grandfather ran his, reaches
**$16.7M and $1.85M** on **less cash and a fifth of the startup capital** —
and then funds the cut shop, and eventually the roll-forming line, out of its
own cash flow rather than out of a bank's patience.

**Buy the mill's reputation. Sell on your own. Keep the cars rolling.**

It worked for eighty years and sixteen states. The teletype is a phone now.

---

*The article: Allee Wholesale Lumber Company, Mattoon, Illinois — James A.
("Big Jim") and James Byron ("Little Jim") Allee — both **born in Illinois**, both
recorded as "wholesale lumber, own business" in the 1950 census at Tupelo. The
family's origin is Illinois, not Mississippi; Tupelo was a southern branch opened
c.1937-45. See `ventures/allee/00-the-case.md`. Tupelo,
Mississippi branch; main office to Mattoon July 1951. Sixteen states,
hardwoods exported to Ireland, lumber for the Willow Run housing project and
Scott Field Air Base during the war.*

*Research complete. See `10-the-channel-problem.md` — it corrects §4 and §6 of this document.*
minimums in cold-formed steel, and currently operating wholesale trading
comparables. This document will be updated when it lands.*
