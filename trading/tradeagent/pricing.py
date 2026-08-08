"""Black-Scholes-Merton pricing and Greeks.

Pure stdlib — no numpy, no scipy. Runs anywhere Python 3.9+ runs.

Conventions used throughout this package:
  S  spot price of the underlying
  K  strike
  T  time to expiry in YEARS (30 days = 30/365)
  r  risk-free rate, annualised decimal (0.04 = 4%)
  q  continuous dividend yield, annualised decimal
  v  volatility, annualised decimal (0.35 = 35% IV)

Greeks are returned in TRADER units, not textbook units, because that is
what you actually need at the screen:
  delta  per $1 move in spot
  gamma  change in delta per $1 move in spot
  theta  per CALENDAR DAY (textbook theta is per year)
  vega   per 1 VOLATILITY POINT (textbook vega is per 1.00 = 100 points)
  rho    per 1 PERCENTAGE POINT of rates

All values are per SHARE. An equity option controls 100 shares, so multiply
by 100 for per-contract dollars. `Greeks.per_contract()` does that for you.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

__all__ = ["Greeks", "price", "greeks", "implied_vol", "intrinsic", "norm_cdf", "norm_pdf"]

_SQRT_2 = math.sqrt(2.0)
_SQRT_2PI = math.sqrt(2.0 * math.pi)

# Below these thresholds the BSM formula degenerates (division by v*sqrt(T)).
# We fall back to the discounted-intrinsic limit, which is the correct answer.
_MIN_T = 1e-9
_MIN_V = 1e-9

# Below this vega (price change per vol point), an option's quote carries no
# recoverable volatility information — see implied_vol.
_MIN_IDENTIFIABLE_VEGA = 1e-6


def norm_cdf(x: float) -> float:
    """Standard normal CDF via erf. Accurate to ~1e-15."""
    return 0.5 * (1.0 + math.erf(x / _SQRT_2))


def norm_pdf(x: float) -> float:
    """Standard normal PDF."""
    return math.exp(-0.5 * x * x) / _SQRT_2PI


def _validate(S: float, K: float, T: float, v: float) -> None:
    if S <= 0:
        raise ValueError(f"spot must be positive, got {S}")
    if K <= 0:
        raise ValueError(f"strike must be positive, got {K}")
    if T < 0:
        raise ValueError(f"time to expiry cannot be negative, got {T}")
    if v < 0:
        raise ValueError(f"volatility cannot be negative, got {v}")


def _norm_kind(kind: str) -> str:
    k = kind.strip().lower()
    if k in ("c", "call"):
        return "call"
    if k in ("p", "put"):
        return "put"
    raise ValueError(f"kind must be 'call' or 'put', got {kind!r}")


def intrinsic(S: float, K: float, kind: str) -> float:
    """Exercise value right now, ignoring time value."""
    return max(S - K, 0.0) if _norm_kind(kind) == "call" else max(K - S, 0.0)


def _d1_d2(S: float, K: float, T: float, r: float, v: float, q: float) -> tuple[float, float]:
    vt = v * math.sqrt(T)
    d1 = (math.log(S / K) + (r - q + 0.5 * v * v) * T) / vt
    return d1, d1 - vt


def price(S: float, K: float, T: float, r: float, v: float, kind: str, q: float = 0.0) -> float:
    """Theoretical value of one European option, per share.

    At T=0 or v=0 this collapses to discounted intrinsic value, which is the
    mathematically correct limit rather than a NaN.
    """
    _validate(S, K, T, v)
    kind = _norm_kind(kind)

    if T < _MIN_T or v < _MIN_V:
        # Forward-price intrinsic, discounted back. At T=0 this is plain intrinsic.
        fwd = S * math.exp(-q * T)
        strike_pv = K * math.exp(-r * T)
        return max(fwd - strike_pv, 0.0) if kind == "call" else max(strike_pv - fwd, 0.0)

    d1, d2 = _d1_d2(S, K, T, r, v, q)
    disc_s = S * math.exp(-q * T)
    disc_k = K * math.exp(-r * T)

    if kind == "call":
        return disc_s * norm_cdf(d1) - disc_k * norm_cdf(d2)
    return disc_k * norm_cdf(-d2) - disc_s * norm_cdf(-d1)


@dataclass(frozen=True)
class Greeks:
    """Risk sensitivities in trader units, per share."""

    price: float
    delta: float
    gamma: float
    theta: float  # per calendar day
    vega: float   # per 1 vol point
    rho: float    # per 1 rate percentage point

    def per_contract(self, multiplier: int = 100) -> "Greeks":
        """Same Greeks scaled to one contract (100 shares for US equity options)."""
        m = multiplier
        return Greeks(
            price=self.price * m,
            delta=self.delta * m,
            gamma=self.gamma * m,
            theta=self.theta * m,
            vega=self.vega * m,
            rho=self.rho * m,
        )

    def as_dict(self) -> dict[str, float]:
        return {
            "price": self.price,
            "delta": self.delta,
            "gamma": self.gamma,
            "theta": self.theta,
            "vega": self.vega,
            "rho": self.rho,
        }


def greeks(S: float, K: float, T: float, r: float, v: float, kind: str, q: float = 0.0) -> Greeks:
    """Full Greek set for one European option, per share, in trader units."""
    _validate(S, K, T, v)
    kind = _norm_kind(kind)
    p = price(S, K, T, r, v, kind, q)

    # Degenerate case: no time or no vol means no sensitivity except a step
    # function in delta. Report the step and zero for the rest.
    if T < _MIN_T or v < _MIN_V:
        if kind == "call":
            d = 1.0 if S > K else 0.0
        else:
            d = -1.0 if S < K else 0.0
        return Greeks(price=p, delta=d, gamma=0.0, theta=0.0, vega=0.0, rho=0.0)

    d1, d2 = _d1_d2(S, K, T, r, v, q)
    sqrt_t = math.sqrt(T)
    disc_q = math.exp(-q * T)
    disc_r = math.exp(-r * T)
    pdf_d1 = norm_pdf(d1)

    gamma_ = disc_q * pdf_d1 / (S * v * sqrt_t)
    vega_ = S * disc_q * pdf_d1 * sqrt_t
    decay = -(S * disc_q * pdf_d1 * v) / (2.0 * sqrt_t)  # shared theta term

    if kind == "call":
        delta_ = disc_q * norm_cdf(d1)
        theta_ = decay - r * K * disc_r * norm_cdf(d2) + q * S * disc_q * norm_cdf(d1)
        rho_ = K * T * disc_r * norm_cdf(d2)
    else:
        delta_ = -disc_q * norm_cdf(-d1)
        theta_ = decay + r * K * disc_r * norm_cdf(-d2) - q * S * disc_q * norm_cdf(-d1)
        rho_ = -K * T * disc_r * norm_cdf(-d2)

    return Greeks(
        price=p,
        delta=delta_,
        gamma=gamma_,
        theta=theta_ / 365.0,  # per year -> per calendar day
        vega=vega_ / 100.0,    # per 1.00 vol -> per 1 vol point
        rho=rho_ / 100.0,      # per 1.00 rate -> per 1 percentage point
    )


def implied_vol(
    market_price: float,
    S: float,
    K: float,
    T: float,
    r: float,
    kind: str,
    q: float = 0.0,
    *,
    tol: float = 1e-8,
    max_iter: int = 100,
) -> float:
    """Back out the volatility the market is charging for this option.

    This is the number that matters most for "am I overpaying". Uses
    Newton-Raphson with a bisection fallback, because Newton alone diverges
    on deep ITM/OTM options where vega collapses toward zero.

    Raises ValueError if the price is outside no-arbitrage bounds — that
    means bad data (stale quote, wrong strike), not a hard vol problem.
    """
    _validate(S, K, T, 0.0)
    kind = _norm_kind(kind)

    if market_price < 0:
        raise ValueError(f"market price cannot be negative, got {market_price}")
    if T < _MIN_T:
        raise ValueError("cannot infer volatility from an expired option (T=0)")

    # No-arbitrage bounds. Price must sit between discounted intrinsic and
    # the discounted underlying (call) / strike (put).
    lo_bound = price(S, K, T, r, 0.0, kind, q)
    hi_bound = S * math.exp(-q * T) if kind == "call" else K * math.exp(-r * T)
    if market_price < lo_bound - 1e-9:
        raise ValueError(
            f"price {market_price:.4f} is below no-arbitrage floor {lo_bound:.4f} "
            "— check the quote, strike, or expiry"
        )
    if market_price > hi_bound + 1e-9:
        raise ValueError(
            f"price {market_price:.4f} exceeds no-arbitrage ceiling {hi_bound:.4f} "
            "— check the quote, strike, or expiry"
        )

    # Bracket the root. Price is strictly increasing in vol, so we only need a
    # hi that overshoots the market price.
    lo, hi = 1e-9, 5.0
    while price(S, K, T, r, hi, kind, q) < market_price and hi < 100.0:
        hi *= 2.0

    # Brenner-Subrahmanyam ATM approximation as the seed.
    v = min(max(math.sqrt(2.0 * math.pi / T) * market_price / S, lo), hi)

    for _ in range(max_iter):
        diff = price(S, K, T, r, v, kind, q) - market_price
        # Maintain a hard bisection bracket alongside Newton so we can never
        # diverge, and so convergence is measured in VOL rather than in price.
        if diff > 0:
            hi = v
        else:
            lo = v
        if hi - lo < tol:
            break

        vega_raw = S * math.exp(-q * T) * norm_pdf(_d1_d2(S, K, T, r, v, q)[0]) * math.sqrt(T)
        if vega_raw < 1e-12:
            v = 0.5 * (lo + hi)  # vega dead, Newton is useless here
            continue
        step = v - diff / vega_raw
        v = step if lo < step < hi else 0.5 * (lo + hi)

    solution = 0.5 * (lo + hi)

    # Deep ITM/OTM options are nearly insensitive to volatility near the
    # solution — the price can move less than 1e-30 per vol point, so any
    # volatility in a wide range reproduces the quote to machine precision.
    # The solver will happily converge to one of them. Returning it would be
    # fabrication dressed as a measurement, so refuse instead.
    sensitivity = greeks(S, K, T, r, solution, kind, q).vega
    if abs(sensitivity) < _MIN_IDENTIFIABLE_VEGA:
        raise ValueError(
            "implied volatility is not identifiable for this option — its price "
            f"moves only {abs(sensitivity):.2e} per vol point near the solution. "
            "It is too far in or out of the money at this expiry for the quote "
            "to carry volatility information."
        )
    return solution
