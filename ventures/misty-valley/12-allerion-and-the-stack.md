# Allerion as the technology company — and the trap in it

## The question

"Use Allerion as the ERP or tech provider" — and then, "how can my domain
somehow provide the actual service of payments."

The instinct is right and the shortcut is dangerous. Both deserve saying plainly.

## What Allerion should own

Allerion Technologies LLC owns the software and the interfaces:

- the storefront and the role system
- the MCP server — the agent-buyable interface
- Job Site Earth
- the vending hardware IP, when it exists

Misty Valley Supply owns the trade: inventory, the fabrication relationship, the
customers, the credit file, the trucks.

Allerion licenses the platform to Misty Valley for a monthly fee plus a
transaction fee. That is an ordinary SaaS relationship — invoice, no payments
risk, no new licence. `allerion.io` is the software company: docs, the MCP
endpoint at `mcp.allerion.io`, a status page, and the pitch to the second
customer. `mistyvalleysupply.com` is the store.

## The trap: becoming the payments platform on day one

Being the Stripe Connect **platform** for third parties is not a feature, it is
a liability position. Stripe is explicit: on destination charges "your account
balance is debited for the cost of the Stripe fees, refunds, and chargebacks,"
and on disputes, "Stripe debits dispute amounts and fees from your platform
account." Recovering from the connected account is *our* problem, and if their
balance is empty it stays our problem.

Concretely: if Allerion is the platform and a connected contractor collects a
deposit for work they never perform, Allerion eats the chargebacks. Small
platforms die this way, not from writing bad code.

So stage it:

**Stage 1 — now.** Misty Valley's own Stripe account is the merchant for Misty
Valley's own sales. Allerion charges Misty Valley a software fee. No platform
exposure at all. Ship this.

**Stage 2 — the Yard only.** Allerion becomes the Connect platform for
marketplace transactions where exposure is bounded by design: authorize-then-
capture, goods handed over at pickup, no deposits, no pre-payment for future
work. Cap the transaction size until there is loss history to price against.

**Stage 3 — the actual company.** Sell the platform to other distributors. By
then there is a loss rate, a seller agreement that has survived a dispute, and a
reason to believe the underwriting.

Do not skip to stage 3 because the domain is pretty.

## The affiliation problem, before any federal work

Joey controls Allerion and would hold a stake in Misty Valley. SBA affiliation
turns on control, not on its exercise: entities are affiliates when "one controls
or has the power to control the other, or a third party ... controls or has the
power to control both," and for size purposes SBA counts the receipts and
employees of the concern **plus all affiliates** — 13 CFR 121.103. Common
management, identity of interest, and a firm drawing 70% or more of its receipts
from another over three fiscal years all feed the analysis.

That matters because Allerion is registered on SAM.gov and the plan involves
federal work. If Misty Valley grows and the two are affiliated, Allerion's size
is Allerion **plus** Misty Valley. A small-business or HUBZone set-aside won
while misrepresenting size is not a paperwork problem.

Two consequences, now, before any certification:
1. Ask a government-contracts attorney the affiliation question with the real
   ownership on the table. Not a CPA, and not after an award.
2. Price the Allerion–Misty Valley licence at arm's length and document how the
   rate was set. Related-party pricing that cannot be defended is the first
   thing an auditor pulls, and the 70%-receipts presumption is a bright line
   worth staying away from deliberately.

## Sources

- 13 CFR 121.103, *How does SBA determine affiliation?*
- Stripe, *Create destination charges* — flow of funds, refunds, disputes
- Stripe, *Connected Account Agreement* — platform practices live in the
  Platform Provider Agreement, which means we have to write a real one
