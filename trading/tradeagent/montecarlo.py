"""Monte Carlo outcome distributions for a position.

This module exists because "will NVDA go up?" is the wrong question and has
no answer. The answerable question is: GIVEN an assumed drift and volatility,
what does the distribution of outcomes for this structure look like — how
often does it profit, what is the expected value, how bad is the left tail?

Read the output as a SHAPE, not a forecast. Change the drift assumption and
the P(profit) moves. That sensitivity is the honest content of the model: it
tells you how much of your thesis is structure and how much is you guessing
direction. Run `sensitivity()` and look at how much the answer moves.

Two tail models are offered because it matters:
  normal    textbook GBM. Understates crash risk. Every option model's default.
  student-t fat tails. Closer to how markets actually move, and the reason
            short-premium strategies blow up more often than GBM predicts.
"""

from __future__ import annotations

import math
import random
import statistics
from dataclasses import dataclass, field
from typing import Literal

from .strategy import Position

__all__ = ["Outcome", "simulate", "terminal_prices", "sensitivity"]

TailModel = Literal["normal", "student-t"]


def _draw_shock(rng: random.Random, tail: TailModel, df: int) -> float:
    """One unit-variance random shock."""
    z = rng.gauss(0.0, 1.0)
    if tail == "normal":
        return z
    if df <= 2:
        raise ValueError("student-t needs df > 2 for finite variance")
    # t = Z / sqrt(V/df), V ~ chi-square(df); rescaled to unit variance.
    v = rng.gammavariate(df / 2.0, 2.0)
    t = z / math.sqrt(v / df)
    return t / math.sqrt(df / (df - 2.0))


def terminal_prices(
    spot: float, drift: float, vol: float, days: float, paths: int,
    *, tail: TailModel = "student-t", df: int = 4, seed: int | None = 42,
) -> list[float]:
    """Simulate terminal underlying prices under geometric Brownian motion.

    drift is the REAL-WORLD annualised expected return, not the risk-free
    rate. Using r here would price the option; using your actual view here
    is what tests your actual trade.
    """
    if spot <= 0:
        raise ValueError(f"spot must be positive, got {spot}")
    if vol < 0:
        raise ValueError(f"vol cannot be negative, got {vol}")
    if days <= 0:
        raise ValueError(f"days must be positive, got {days}")
    if paths < 1:
        raise ValueError(f"paths must be at least 1, got {paths}")

    rng = random.Random(seed)
    T = days / 365.0
    mu_t = (drift - 0.5 * vol * vol) * T
    sig_t = vol * math.sqrt(T)
    return [spot * math.exp(mu_t + sig_t * _draw_shock(rng, tail, df)) for _ in range(paths)]


@dataclass
class Outcome:
    """The distribution of P&L for a position under the given assumptions."""

    paths: int
    pnl: list[float] = field(repr=False)
    capital_at_risk: float
    assumptions: dict = field(default_factory=dict)

    # -- central tendency ------------------------------------------------
    @property
    def expected_value(self) -> float:
        return statistics.fmean(self.pnl)

    @property
    def median(self) -> float:
        return statistics.median(self.pnl)

    @property
    def stdev(self) -> float:
        return statistics.pstdev(self.pnl) if len(self.pnl) > 1 else 0.0

    # -- odds ------------------------------------------------------------
    @property
    def prob_profit(self) -> float:
        return sum(1 for p in self.pnl if p > 0) / len(self.pnl)

    @property
    def prob_total_loss(self) -> float:
        """How often you lose essentially everything you put up."""
        if self.capital_at_risk <= 0:
            return 0.0
        threshold = -0.99 * self.capital_at_risk
        return sum(1 for p in self.pnl if p <= threshold) / len(self.pnl)

    # -- tails -----------------------------------------------------------
    def percentile(self, pct: float) -> float:
        if not 0 <= pct <= 100:
            raise ValueError(f"percentile must be 0-100, got {pct}")
        ordered = sorted(self.pnl)
        if len(ordered) == 1:
            return ordered[0]
        idx = (len(ordered) - 1) * pct / 100.0
        lo = math.floor(idx)
        hi = math.ceil(idx)
        if lo == hi:
            return ordered[int(idx)]
        return ordered[lo] * (hi - idx) + ordered[hi] * (idx - lo)

    @property
    def cvar_5(self) -> float:
        """Average loss in the worst 5% of outcomes — the number that
        actually kills accounts, and the one no broker screen shows you."""
        ordered = sorted(self.pnl)
        n = max(1, len(ordered) // 20)
        return statistics.fmean(ordered[:n])

    @property
    def expectancy_per_dollar(self) -> float:
        """Expected return per dollar risked. The only number that compounds."""
        if self.capital_at_risk <= 0:
            return 0.0
        return self.expected_value / self.capital_at_risk

    def summary(self) -> dict:
        return {
            "paths": self.paths,
            "expected_value": round(self.expected_value, 2),
            "median": round(self.median, 2),
            "prob_profit": round(self.prob_profit, 4),
            "prob_total_loss": round(self.prob_total_loss, 4),
            "p05": round(self.percentile(5), 2),
            "p95": round(self.percentile(95), 2),
            "cvar_5": round(self.cvar_5, 2),
            "expectancy_per_dollar": round(self.expectancy_per_dollar, 4),
            "capital_at_risk": round(self.capital_at_risk, 2),
            "assumptions": self.assumptions,
        }


def simulate(
    position: Position,
    *,
    drift: float = 0.08,
    vol: float = 0.30,
    paths: int = 20_000,
    exit_days: float | None = None,
    exit_vol: float | None = None,
    r: float = 0.04,
    q: float = 0.0,
    tail: TailModel = "student-t",
    df: int = 4,
    seed: int | None = 42,
) -> Outcome:
    """Run the position through simulated underlying paths.

    exit_days   close the trade early instead of holding to expiry. Set this
                to model a real plan ("out in 5 days") rather than the
                fantasy of always holding to expiration.
    exit_vol    the implied vol you expect to face AT exit. Set it BELOW the
                entry vol to model IV crush — this is how you find out that
                your post-earnings call loses money even when you are right
                about direction.
    """
    if not position.legs:
        raise ValueError("position has no legs")

    spot = position.spot_at_entry
    if spot <= 0:
        raise ValueError("position.spot_at_entry must be set to simulate")

    horizon = exit_days if exit_days is not None else max(
        (leg.dte for leg in position.legs if leg.kind != "stock"), default=0.0
    )
    if horizon <= 0:
        raise ValueError("nothing to simulate: no expiry and no exit_days")

    prices = terminal_prices(spot, drift, vol, horizon, paths, tail=tail, df=df, seed=seed)

    if exit_days is None:
        pnl = [position.pnl_at_expiry(s) for s in prices]
    else:
        mark_vol = exit_vol if exit_vol is not None else vol
        pnl = [position.pnl_before_expiry(s, exit_days, mark_vol, r, q) for s in prices]

    return Outcome(
        paths=paths,
        pnl=pnl,
        capital_at_risk=position.risk_profile().capital_at_risk,
        assumptions={
            "drift": drift,
            "vol": vol,
            "tail": tail if tail == "normal" else f"student-t(df={df})",
            "horizon_days": horizon,
            "exit_vol": exit_vol,
            "held_to_expiry": exit_days is None,
        },
    )


def sensitivity(position: Position, *, base_drift: float = 0.08, base_vol: float = 0.30, **kw) -> dict:
    """Re-run under bear/base/bull drift and low/high vol.

    If P(profit) swings wildly across these, your trade is a direction bet
    wearing a strategy costume. If it holds up, the structure is doing the
    work. This is the single most useful call in the module.
    """
    grid = {}
    for name, drift in (("bear", base_drift - 0.30), ("base", base_drift), ("bull", base_drift + 0.30)):
        for vname, vol in (("vol_low", base_vol * 0.7), ("vol_high", base_vol * 1.3)):
            out = simulate(position, drift=drift, vol=vol, **kw)
            grid[f"{name}/{vname}"] = {
                "prob_profit": round(out.prob_profit, 4),
                "expected_value": round(out.expected_value, 2),
            }
    probs = [v["prob_profit"] for v in grid.values()]
    lo, hi = min(probs), max(probs)
    # Relative range, not absolute. A 13-point swing on a 20% base is a huge
    # sensitivity; the same 13 points on an 85% base is noise. Absolute spread
    # conflates the two and lets directional bets pass as structural ones.
    grid["_spread"] = {
        "prob_profit_min": lo,
        "prob_profit_max": hi,
        "range": round(hi - lo, 4),
        "relative_range": round((hi - lo) / hi, 4) if hi > 0 else 0.0,
    }
    return grid
