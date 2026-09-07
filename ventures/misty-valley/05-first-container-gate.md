# The First Container Gate

**Read before wiring a deposit.**

Ben's timeline is "first orders next week." This is the checklist that stands
between an order and a wire. It is not here to stop the deal. It is here so
that the first container is a *business* and not a $30,000 tuition payment.

The rule: **every box in Gate 1 gets a real answer, in writing, before money
moves.** Not "the supplier said." In writing, from someone whose license or
balance sheet is on the line.

---

## Gate 1 — Before the wire (all of these, no exceptions)

### A. Is the money real?

- [ ] **Get the quote in writing with the Incoterm spelled out.** "$11,000" is
      not a price until you know whether it is EXW, FOB, CFR, or DDP. These are
      wildly different numbers. The single most common way a first-time importer
      loses money is assuming a quote included something it didn't.
- [ ] **Confirm what "after shipping and tariffs" actually covers.** Ask the
      supplier directly, in writing: *are US Section 232 and Section 301 duties
      included in your price, and who is the Importer of Record?*
- [ ] **Run the real number through `model/container_model.py`** with the actual
      quoted FOB value. Not the remembered number. The actual one.
- [ ] **Sanity-check the steel.** A 40ft container of cold-formed framing holds
      roughly 20+ tonnes of galvanized steel. If the quoted goods value implies
      a per-tonne steel price below what raw galvanized coil costs, the quote is
      not what it appears to be — it is either a partial load, a misdeclared
      value, or a bait number. **Do the per-tonne division before wiring.**

> If the arithmetic says the landed cost is materially higher than $11,000 —
> and see `04` — that is not a reason to abandon the business. It is a reason
> to reprice the Scott sale and every quote after it *before* they become
> commitments you have to honor at a loss.

### B. Is it legal to import?

- [ ] **Engage a licensed customs broker.** Not optional, not later. A broker
      costs a few hundred dollars per entry and is the cheapest professional
      you will ever hire.
- [ ] **Get the HTS classification from the broker in writing.** Classification
      drives the entire duty stack. Guessing it is how importers end up in
      penalty proceedings.
- [ ] **Ask the broker, in these exact words:** *"Are there any antidumping or
      countervailing duty orders, scope rulings, or pending petitions that could
      cover this product from China?"* Get the answer in writing and keep it.
      See `02` for why this is the question that matters most.
- [ ] **Decide IOR vs DDP** (`01` §4). If you are the IOR, secure the customs
      bond and *read the surety's indemnity agreement* before signing.
- [ ] **File ISF on time.** 24 hours before vessel loading. Late filing carries
      per-violation liquidated damages and flags you for examination.

### C. Is it legal to install?

This is the box most first-time importers skip, and it is the one that can end
Contracting as well as Supply.

- [ ] **Get mill test reports (MTRs)** for the actual production run — not a
      generic sample certificate.
- [ ] **Verify base metal thickness and coating** against the governing ASTM
      standard for the application. Nonstructural and structural framing are
      different standards with different requirements.
- [ ] **Confirm the product carries a recognized third-party code-compliance
      listing** that a building official and architect will accept.
- [ ] **Check the fire-rated assemblies on your actual jobs.** If a wall is part
      of a listed fire-resistance-rated design, substituting a stud that isn't
      covered by that listing can void the rating. That is a life-safety issue
      and an uninsurable-looking claim. See `03`.
- [ ] **Read the project specification for the Hebron job — specifically for
      "domestic steel," "Buy America," or "melted and poured in the USA."** If
      the spec requires domestic steel, imported material cannot go in that wall
      no matter how good the price is. Check *before* the container is
      committed to that job.
- [ ] **Independently test the first container on arrival.** Pull samples,
      measure base metal thickness with a micrometer after stripping coating,
      and verify against the MTR. If the steel doesn't match its paperwork, you
      have learned something enormously valuable for the price of one test.

### D. Can you survive being wrong?

- [ ] **Products liability insurance bound for Supply, before material ships.**
      Confirmed in writing to cover Supply as *importer and distributor*.
- [ ] **Credit application signed, with personal guarantee**, by every customer
      buying on terms — including the first one.
- [ ] **Pre-lien notice deadlines calendared** from first delivery date.
- [ ] **Written price list** for sales to Contracting, at arm's length (`01` §5).
- [ ] **Cash reserve.** Can the business absorb this container being a total
      loss — rejected on site, held at customs, or non-conforming — without
      taking Contracting down with it? If the honest answer is no, the container
      is too big for the first order.

---

## Gate 2 — Before container #2

Do not order the second container until the first one has *closed the loop*:

- [ ] Container 1 arrived, cleared, and the actual duty paid matched the model.
- [ ] Material passed independent verification against its MTRs.
- [ ] Material was accepted on the job by the GC and the building official.
- [ ] **The customer actually paid.** Not "invoiced." Paid, and the funds
      cleared.
- [ ] Actual landed cost per linear foot is written down and compared to the
      model's prediction. Update the model with reality.
- [ ] Total cycle time from wire to cash-in is measured, not estimated. That
      number sizes every future container (`04`).

One completed loop teaches more than ten forecasts. The discipline is refusing
to scale until the loop closes once.

---

## Gate 3 — Before scaling past ~4 containers/month

- [ ] Working capital secured for the peak requirement the model computes —
      **from a line of credit or equity, not from hope that receivables land
      first.** This is the wall that stops most import distributors.
- [ ] More than one customer. A distributor with one buyer is that buyer's
      purchasing department, and gets priced accordingly.
- [ ] More than one supplier, and preferably more than one country of origin —
      the concentration risk here is a policy change, not a factory fire.
- [ ] A written answer to: *"if a duty order lands on this product next quarter,
      what is the plan?"* Whoever cannot answer that should not be buying ten
      containers a month.

---

## The three questions that decide this business

Strip away everything else and the venture rests on three answers. Get these
and the rest is execution:

1. **Is the margin real after the full duty stack?** — `04` and the model.
2. **Will the product be accepted on the jobs you're selling it into?** — `03`.
3. **Can you fund the cash gap between the wire and the payment?** — `04` §6.

A "no" on any one of them is fatal on its own. They are not weighted equally
and they are not averageable.

---

## What "ruthless" means here

None of the above says don't do this. Ben has something most startups never
get: a real customer, a signed sale, an existing installer that consumes the
product, and a shop to process it. That is a genuine business, and the
distribution-alongside-contracting model is sound — Buzick proves it over
eighty years.

What the gate protects against is the specific failure mode of *this* venture:
moving fast on a margin assumption that was calculated before the current
tariff stack existed, and discovering the real number after the material is
already sold at a fixed price. The gate costs about two weeks and a few
thousand dollars in professional fees. Skipping it costs the container, and
possibly the company that was supposed to be protected by all of `01`.

Two weeks. Then go.
