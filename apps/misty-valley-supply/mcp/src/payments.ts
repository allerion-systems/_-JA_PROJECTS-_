/**
 * Money movement for Misty Valley Supply.
 *
 * Every number here is in integer cents. Nothing in this file uses floats for
 * money, because a marketplace that is a penny off on a transfer is a
 * marketplace that gets a chargeback it cannot reconcile.
 *
 * The one design rule that everything else follows:
 *
 *   MISTY VALLEY NEVER HOLDS MONEY THAT BELONGS TO A SELLER.
 *
 * Kentucky exempts a service provider that collects for a seller only where the
 * seller must deliver "upon receipt of funds by the service provider" and is
 * obligated to deliver "regardless of whether or not the service provider
 * transmits the money" — KRS 286.11-007(6). Parking a buyer's money in our
 * balance until a pickup is confirmed is the opposite of that, and it is what
 * pushes a marketplace into money transmission. So we do not park money.
 *
 * Instead we AUTHORIZE the card and capture nothing. No funds have moved, so
 * there is nothing to hold. On pickup confirmation we capture, and Stripe moves
 * the money to the seller's connected account in the same call.
 */

/* ------------------------------------------------------------------ knobs */

export const PLATFORM_FEE_BPS = 500;      // 5.00% — the Yard fee
export const STRIPE_PCT_BPS = 290;        // Stripe standard online card rate
export const STRIPE_FIXED_CENTS = 30;
export const AUTH_WINDOW_DAYS = 7;        // online card CIT window, all four brands
export const CATALOG_CARD_FEE_BPS = 0;    // our own catalog sales carry no platform fee

/** Non-secret Connect platform account. Injected at build; never a key. */
export const PLATFORM_ACCOUNT =
  (import.meta as { env?: Record<string, string> }).env?.VITE_STRIPE_ACCOUNT ?? "acct_platform";

export const dollars = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

export const toCents = (usd: number) => Math.round(usd * 100);

/* -------------------------------------------------------------- the model */

export type Split = {
  /** what the buyer's card is charged, in cents */
  gross: number;
  /** application_fee_amount — what Misty Valley collects */
  platformFee: number;
  /** what lands in the seller's connected-account balance */
  sellerNet: number;
  /** Stripe's cut, paid out of the platform's balance on a destination charge */
  processing: number;
  /** platform fee less processing — the only money we actually keep */
  margin: number;
};

/**
 * Destination charge split.
 *
 * On a destination charge the full amount is transferred to the connected
 * account and the application fee is transferred back to the platform; the
 * platform's balance is then debited for the Stripe fee. So the seller's net is
 * gross - fee, and ours is fee - processing.
 * https://docs.stripe.com/connect/destination-charges
 */
export function split(gross: number, feeBps = PLATFORM_FEE_BPS): Split {
  const g = Math.max(0, Math.round(gross));
  const platformFee = Math.min(g, Math.round((g * feeBps) / 10_000));
  const processing = g === 0 ? 0 : Math.round((g * STRIPE_PCT_BPS) / 10_000) + STRIPE_FIXED_CENTS;
  return {
    gross: g,
    platformFee,
    sellerNet: g - platformFee,
    processing,
    margin: platformFee - processing,
  };
}

/** The sale size at which our fee stops losing money against Stripe's. */
export const breakevenCents = (feeBps = PLATFORM_FEE_BPS) =>
  Math.ceil((STRIPE_FIXED_CENTS * 10_000) / (feeBps - STRIPE_PCT_BPS));

/* --------------------------------------------------------- the two calls */

export type Step = {
  when: string;
  title: string;
  body: string;
  call: string;
};

/** The exact API calls behind a Yard sale, in order. */
export function yardCalls(gross: number, listing: string, seller: string): Step[] {
  const s = split(gross);
  return [
    {
      when: "Buyer agrees",
      title: "Authorize — nothing is charged",
      body:
        `The card is held for ${AUTH_WINDOW_DAYS} days. No money leaves the buyer, ` +
        `none arrives here, and none is owed to the seller yet.`,
      call:
        `POST /v1/payment_intents\n` +
        `  amount                    = ${s.gross}\n` +
        `  currency                  = usd\n` +
        `  capture_method            = manual\n` +
        `  application_fee_amount    = ${s.platformFee}\n` +
        `  transfer_data[destination]= ${seller}\n` +
        `  transfer_group            = ${listing}\n` +
        `  metadata[listing]         = ${listing}`,
    },
    {
      when: "Buyer confirms pickup",
      title: "Capture — the money moves once",
      body:
        `Capture settles the card and, on the same charge, transfers ` +
        `${dollars(s.sellerNet)} to the seller and ${dollars(s.platformFee)} to us. ` +
        `There is no interval in which we are holding the seller's money.`,
      call: `POST /v1/payment_intents/{id}/capture`,
    },
    {
      when: "Buyer walks away",
      title: "Cancel — or let it lapse",
      body:
        `Cancel releases the hold immediately. Left alone the authorization ` +
        `expires on its own and the payment is void.`,
      call: `POST /v1/payment_intents/{id}/cancel`,
    },
    {
      when: "Goods were not as described",
      title: "Refund out of our own balance",
      body:
        `We refund the buyer and claw the transfer back from the seller under ` +
        `the seller agreement. This is a guarantee we fund, not a deposit we held.`,
      call: `POST /v1/refunds\n  charge          = {id}\n  reverse_transfer= true`,
    },
  ];
}

/* ------------------------------------------------- seller eligibility gate */

export type SellerStatus = {
  onboarded: boolean;   // completed Stripe Connect onboarding
  agreement: boolean;   // accepted the Misty Valley seller agreement
  payouts: boolean;     // charges_enabled && payouts_enabled
};

/**
 * A listing may take a protected payment only when we have a written agreement
 * with the seller and a connected account to pay. Both conditions are load
 * bearing: the Kentucky exemption is written for a provider collecting *for a
 * seller*, and FinCEN's payment-processor exemption requires a formal agreement
 * with the party receiving the funds — FIN-2014-R009.
 */
export function canTakePayment(s: SellerStatus): { ok: boolean; why: string } {
  if (!s.agreement) return { ok: false, why: "Seller has not signed the seller agreement" };
  if (!s.onboarded) return { ok: false, why: "Seller has not completed Stripe onboarding" };
  if (!s.payouts) return { ok: false, why: "Stripe has not enabled payouts on the seller account" };
  return { ok: true, why: "Protected payment available" };
}
