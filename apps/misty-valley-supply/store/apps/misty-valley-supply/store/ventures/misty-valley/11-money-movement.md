# How money moves — and the escrow idea I have to withdraw

*Written 5 Sep 2026. Supersedes the "protected payment holds the money until
pickup" language in the earlier Yard design.*

## The correction first

Earlier in this build the Yard shipped with a promise: *"Protected payment holds
the money until the buyer confirms pickup."* That is an escrow, and I should not
have put it in the product. Here is the statute that kills it.

Kentucky exempts a service provider that collects money on behalf of a seller
from money-transmitter licensing **only if**:

> "(6) A service provider that receives money or monetary value on behalf of an
> entity selling goods or services other than money transmission services if:
> (a) The entity, upon receipt of funds by the service provider, immediately
> either: 1. Provides the purchased goods or services to the purchaser; or
> 2. Credits the purchaser for the full amount ... which credit is not revocable
> by the entity ...; and (b) The entity is obligated to provide the purchased
> goods or services to the purchaser regardless of whether or not the service
> provider transmits the money or monetary value to the entity."
> — KRS 286.11-007(6), effective 27 June 2025 (2025 Ky. Acts ch. 50, sec. 4)

Read the two conditions against an escrow. Delivery is *not* immediate on our
receipt of funds — the whole point of the hold is that the seller has not handed
anything over yet. And the seller is emphatically *not* obligated to deliver
regardless of whether we transmit — they are waiting on us. An escrow fails both
limbs of the only exemption Kentucky offers.

The federal side does not save it either. FinCEN's payment-processor exemption,
31 CFR 1010.100(ff)(5)(ii)(B), has four elements: facilitate the purchase of
goods or services, operate through a clearance and settlement system, operate
under a formal agreement, and have that agreement at a minimum with the seller
receiving the funds (FIN-2014-R009, 27 Aug 2014). It is written for a processor
collecting *for a seller*, not for a stakeholder holding a pot pending a
condition. And a federal exemption does not license us in a state anyway.

Money transmission without a licence is not a fine-and-move-on problem. It is
the reason the fee model gets rebuilt now, at zero cost, instead of after a
Department of Financial Institutions letter.

## What replaces it

**Authorize, do not hold.** The card is authorized when the buyer and seller
agree, and captured when the buyer confirms pickup. Nothing is charged in
between, so there is no money to hold and no seller funds in our balance.

| Moment | Call | What has actually happened |
|---|---|---|
| Buyer agrees | `POST /v1/payment_intents` with `capture_method=manual`, `application_fee_amount`, `transfer_data[destination]`, `transfer_group` | The card is reserved. No money has moved. |
| Buyer confirms pickup | `POST /v1/payment_intents/{id}/capture` | Settles and, on the same charge, moves the seller's share to their connected account and our fee to us. |
| Buyer walks | `POST /v1/payment_intents/{id}/cancel`, or let it lapse | Hold released. Nothing to refund. |
| Not as described | `POST /v1/refunds` with `reverse_transfer=true` | We refund out of our own balance and claw the transfer back under the seller agreement. A guarantee we fund, not a deposit we held. |

The authorization window is the constraint: **7 days** for an online
customer-initiated card transaction on Visa, Mastercard, Amex and Discover
(Visa merchant-initiated is 5 days, exactly 4 days 18 hours). Local pickup
inside a week is realistic; anything longer needs an extended authorization or
a different structure.

Two conditions gate a listing before it can take a payment at all, and both are
load-bearing rather than decorative:

1. **A signed seller agreement.** The federal exemption requires a formal
   agreement with the party receiving the funds.
2. **A completed Stripe Connect account with payouts enabled.** No account, no
   destination, no payment — message only.

Both are enforced in code: `canTakePayment()` in `apps/misty-valley-supply/store/src/payments.ts`.

## The split

Destination charge with an `application_fee_amount`. Stripe's own description of
the flow of funds: the full charge amount goes to the connected account, the
application fee is transferred back to the platform, and the platform's balance
is debited for the Stripe fee, refunds and chargebacks.

On a $4,600 lift:

| | |
|---|---|
| Buyer authorized | $4,600.00 |
| Seller receives | $4,370.00 |
| Platform fee (5%) | $230.00 |
| Stripe, from our balance | $133.70 |
| **We keep** | **$96.30** |

Break-even is **$7.14**. Below that the 30¢ fixed fee eats the entire 5%. Do not
put a $6 box of screws through protected payment.

## Keys

- The account identifier `acct_…` is not a secret. A **live secret key is**, and
  it never goes in chat, in a file, in a repo, or in a screenshot.
- Use a **restricted key** (`rk_live_…`), not a secret key. Stripe's own guidance
  is now "we don't recommend using secret keys for new use cases."
- Store it in a secrets vault or an environment variable, never in source
  control. Attach an **access policy** to every live key so a key used from an
  address we do not run alerts us.
- Rotate on any personnel change. The dashboard rotation keeps the old key alive
  for up to 7 days so there is no outage.
- The publishable key (`pk_live_…`) is the only one that belongs in the browser.

## Sources

- KRS 286.11-007, Exemptions (eff. 27 June 2025) — Kentucky Legislative Research Commission
- 31 CFR 1010.100(ff)(5)(ii)(B); FinCEN FIN-2014-R009 (27 Aug 2014)
- Stripe, *Create destination charges*; *Create separate charges and transfers*;
  *Place a hold on a payment method*; *API keys*
