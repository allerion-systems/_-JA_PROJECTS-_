"""Multi-leg option positions: payoff, break-evens, risk bounds, live Greeks.

A `Position` is just a list of `Leg`s. Every common structure — vertical
spread, iron condor, covered call — is expressible this way, so there is one
payoff engine instead of one special case per strategy name.

Sign convention: `qty` is positive for long, negative for short. A long call
spread is +1 of the lower strike and -1 of the higher.

Break-evens and risk bounds are solved EXACTLY, not scanned. An expiry payoff
is piecewise linear with kinks only at strikes, so the roots and extremes can
only live at a kink or at infinity. We evaluate the kinks and check the outer
slopes. No sampling grid, no missed roots.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

from . import pricing

__all__ = [
    "Leg",
    "Position",
    "RiskProfile",
    "long_call",
    "long_put",
    "covered_call",
    "cash_secured_put",
    "vertical",
    "straddle",
    "iron_condor",
]

LegKind = Literal["call", "put", "stock"]

UNBOUNDED = float("inf")


@dataclass(frozen=True)
class Leg:
    """One instrument in a position.

    entry_price is per share (the option's premium, or the stock's fill).
    strike is ignored for stock legs.
    """

    kind: LegKind
    qty: int
    entry_price: float
    strike: float = 0.0
    dte: float = 0.0  # calendar days to expiry at entry

    def __post_init__(self) -> None:
        if self.kind not in ("call", "put", "stock"):
            raise ValueError(f"kind must be call/put/stock, got {self.kind!r}")
        if self.qty == 0:
            raise ValueError("qty cannot be zero")
        if self.entry_price < 0:
            raise ValueError(f"entry_price cannot be negative, got {self.entry_price}")
        if self.kind != "stock" and self.strike <= 0:
            raise ValueError(f"{self.kind} leg needs a positive strike, got {self.strike}")
        if self.dte < 0:
            raise ValueError(f"dte cannot be negative, got {self.dte}")

    @property
    def multiplier(self) -> int:
        """Shares controlled per unit. Options are 100, stock is 1."""
        return 1 if self.kind == "stock" else 100

    @property
    def notional_cost(self) -> float:
        """Signed cash at entry. Positive = paid out, negative = received."""
        return self.qty * self.multiplier * self.entry_price

    def value_at_expiry(self, S: float) -> float:
        """Per-share settlement value of the instrument itself (not P&L)."""
        if self.kind == "stock":
            return S
        return pricing.intrinsic(S, self.strike, self.kind)

    def value_before_expiry(self, S: float, days_elapsed: float, vol: float, r: float, q: float) -> float:
        """Per-share mark using Black-Scholes on the remaining time."""
        if self.kind == "stock":
            return S
        remaining_days = max(self.dte - days_elapsed, 0.0)
        return pricing.price(S, self.strike, remaining_days / 365.0, r, vol, self.kind, q)

    def label(self) -> str:
        if self.kind == "stock":
            return f"{self.qty:+d} shares @ {self.entry_price:.2f}"
        return f"{self.qty:+d} {self.strike:g}{self.kind[0].upper()} @ {self.entry_price:.2f} ({self.dte:g}d)"


@dataclass
class RiskProfile:
    """The four numbers to look at before clicking buy."""

    net_cost: float          # + debit paid, - credit received
    max_profit: float        # may be +inf
    max_loss: float          # reported POSITIVE; may be +inf
    breakevens: list[float]
    capital_at_risk: float   # what you can actually lose, for sizing

    @property
    def is_defined_risk(self) -> bool:
        return self.max_loss != UNBOUNDED

    @property
    def reward_to_risk(self) -> float:
        if self.max_loss in (0.0, UNBOUNDED) or self.max_profit == UNBOUNDED:
            return UNBOUNDED if self.max_profit == UNBOUNDED else 0.0
        return self.max_profit / self.max_loss


@dataclass
class Position:
    """A collection of legs treated as one trade."""

    legs: list[Leg]
    underlying: str = "UNDERLYING"
    spot_at_entry: float = 0.0
    tags: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not self.legs:
            raise ValueError("a position needs at least one leg")

    # ---- cash ----------------------------------------------------------

    @property
    def net_cost(self) -> float:
        """Signed cash at entry. Positive = net debit, negative = net credit."""
        return sum(leg.notional_cost for leg in self.legs)

    @property
    def is_credit(self) -> bool:
        return self.net_cost < 0

    # ---- payoff --------------------------------------------------------

    def pnl_at_expiry(self, S: float) -> float:
        """Total dollar P&L if the underlying settles at S."""
        gross = sum(leg.qty * leg.multiplier * leg.value_at_expiry(S) for leg in self.legs)
        return gross - self.net_cost

    def pnl_before_expiry(
        self, S: float, days_elapsed: float, vol: float, r: float = 0.04, q: float = 0.0
    ) -> float:
        """Mark-to-market P&L partway through the trade.

        This is where theta and IV crush show up. Compare against
        pnl_at_expiry to see how much of your loss is time vs direction.
        """
        gross = sum(
            leg.qty * leg.multiplier * leg.value_before_expiry(S, days_elapsed, vol, r, q)
            for leg in self.legs
        )
        return gross - self.net_cost

    # ---- structure -----------------------------------------------------

    def _kinks(self) -> list[float]:
        """Strikes where the payoff slope can change, ascending."""
        return sorted({leg.strike for leg in self.legs if leg.kind != "stock"})

    def _outer_slope(self, side: Literal["left", "right"]) -> float:
        """Payoff slope beyond the outermost strike (per $1 of spot)."""
        ks = self._kinks()
        if side == "right":
            base = (max(ks) if ks else max(self.spot_at_entry, 1.0)) + 100.0
        else:
            base = 0.0
        return self.pnl_at_expiry(base + 1.0) - self.pnl_at_expiry(base)

    def breakevens(self) -> list[float]:
        """Exact underlying prices where the trade breaks even at expiry."""
        ks = self._kinks()
        span = max(ks) if ks else max(self.spot_at_entry, 1.0)
        # Sample the kinks plus a point outside each end, where the payoff is linear.
        points = [0.0] + ks + [span * 3.0 + 100.0]

        roots: list[float] = []
        for lo, hi in zip(points, points[1:]):
            p_lo, p_hi = self.pnl_at_expiry(lo), self.pnl_at_expiry(hi)
            if abs(p_lo) < 1e-9:
                roots.append(lo)
                continue
            if p_lo * p_hi < 0:
                # Linear inside the segment, so interpolation is exact.
                roots.append(lo + (hi - lo) * p_lo / (p_lo - p_hi))
        if points and abs(self.pnl_at_expiry(points[-1])) < 1e-9:
            roots.append(points[-1])

        deduped: list[float] = []
        for r_ in sorted(roots):
            if not deduped or abs(r_ - deduped[-1]) > 1e-6:
                deduped.append(r_)
        return deduped

    def risk_profile(self) -> RiskProfile:
        """Max profit, max loss, break-evens, and capital genuinely at risk."""
        ks = self._kinks()
        candidates = [0.0] + ks
        values = [self.pnl_at_expiry(s) for s in candidates]

        left_slope = self._outer_slope("left")
        right_slope = self._outer_slope("right")

        # Beyond the last strike the payoff is a ray; a positive right-slope
        # means profit runs to infinity, a negative one means loss does.
        max_profit = max(values) if values else 0.0
        max_loss_signed = min(values) if values else 0.0
        if right_slope > 1e-9:
            max_profit = UNBOUNDED
        if right_slope < -1e-9:
            max_loss_signed = -UNBOUNDED
        # Left side: spot is floored at 0, so the left ray is already covered
        # by evaluating S=0. Slope is only informational there.
        _ = left_slope

        max_loss = UNBOUNDED if max_loss_signed == -UNBOUNDED else abs(min(max_loss_signed, 0.0))

        # Capital at risk: for defined-risk trades it is the worst case. For
        # undefined risk we fall back to the debit paid, and flag it via
        # is_defined_risk so the caller cannot silently size off a fiction.
        capital = max_loss if max_loss != UNBOUNDED else max(self.net_cost, 0.0)

        return RiskProfile(
            net_cost=self.net_cost,
            max_profit=max_profit,
            max_loss=max_loss,
            breakevens=self.breakevens(),
            capital_at_risk=capital,
        )

    # ---- greeks --------------------------------------------------------

    def net_greeks(self, S: float, vol: float, r: float = 0.04, q: float = 0.0, days_elapsed: float = 0.0):
        """Aggregate position Greeks in dollar terms.

        delta is $ per $1 move, theta is $ per day, vega is $ per vol point.
        These are the numbers that tell you what you actually own.
        """
        totals = {"delta": 0.0, "gamma": 0.0, "theta": 0.0, "vega": 0.0, "rho": 0.0, "price": 0.0}
        for leg in self.legs:
            scale = leg.qty * leg.multiplier
            if leg.kind == "stock":
                totals["delta"] += scale
                totals["price"] += scale * S
                continue
            remaining = max(leg.dte - days_elapsed, 0.0) / 365.0
            g = pricing.greeks(S, leg.strike, remaining, r, vol, leg.kind, q)
            for key, val in g.as_dict().items():
                totals[key] += scale * val
        return totals

    def describe(self) -> str:
        return f"{self.underlying}: " + ", ".join(leg.label() for leg in self.legs)


# ---------------------------------------------------------------------------
# Builders for the structures you will actually trade.
# ---------------------------------------------------------------------------


def long_call(symbol: str, spot: float, strike: float, premium: float, dte: float, qty: int = 1) -> Position:
    """Pure directional upside. Defined risk, unbounded reward, worst theta."""
    return Position([Leg("call", qty, premium, strike, dte)], symbol, spot, ["long-call", "debit"])


def long_put(symbol: str, spot: float, strike: float, premium: float, dte: float, qty: int = 1) -> Position:
    """Pure directional downside, or a hedge on shares you own."""
    return Position([Leg("put", qty, premium, strike, dte)], symbol, spot, ["long-put", "debit"])


def covered_call(symbol: str, spot: float, strike: float, premium: float, dte: float, lots: int = 1) -> Position:
    """Own 100 shares, sell a call against them. Income, capped upside."""
    return Position(
        [Leg("stock", 100 * lots, spot), Leg("call", -lots, premium, strike, dte)],
        symbol, spot, ["covered-call", "credit", "income"],
    )


def cash_secured_put(symbol: str, spot: float, strike: float, premium: float, dte: float, qty: int = 1) -> Position:
    """Get paid to agree to buy the stock lower. Assignment is the point."""
    return Position([Leg("put", -qty, premium, strike, dte)], symbol, spot, ["csp", "credit", "income"])


def vertical(
    symbol: str, spot: float, long_strike: float, short_strike: float,
    long_premium: float, short_premium: float, dte: float, kind: LegKind = "call", qty: int = 1
) -> Position:
    """Two strikes, same expiry. Defined risk AND defined reward both ways."""
    if kind not in ("call", "put"):
        raise ValueError("vertical spreads are call or put")
    return Position(
        [Leg(kind, qty, long_premium, long_strike, dte), Leg(kind, -qty, short_premium, short_strike, dte)],
        symbol, spot, [f"{kind}-vertical", "spread"],
    )


def straddle(symbol: str, spot: float, strike: float, call_premium: float, put_premium: float, dte: float, qty: int = 1) -> Position:
    """Long both sides: a bet on MAGNITUDE, not direction. Dies to IV crush."""
    return Position(
        [Leg("call", qty, call_premium, strike, dte), Leg("put", qty, put_premium, strike, dte)],
        symbol, spot, ["straddle", "debit", "vol-long"],
    )


def iron_condor(
    symbol: str, spot: float, put_long: float, put_short: float, call_short: float, call_long: float,
    premiums: tuple[float, float, float, float], dte: float, qty: int = 1
) -> Position:
    """Sell a range. Max profit if the stock goes nowhere. Defined risk."""
    pl, ps, cs, cl = premiums
    return Position(
        [
            Leg("put", qty, pl, put_long, dte),
            Leg("put", -qty, ps, put_short, dte),
            Leg("call", -qty, cs, call_short, dte),
            Leg("call", qty, cl, call_long, dte),
        ],
        symbol, spot, ["iron-condor", "credit", "vol-short"],
    )
