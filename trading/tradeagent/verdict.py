"""The decision layer: run every check against a proposed trade, then say so.

This is the "agent" part. It does not predict prices. It runs the checks a
disciplined trader would run and refuses to skip the unflattering ones,
which is the actual value — not because the checks are clever, but because
a human at 9:31am with a green candle on screen will not run them.

Every check returns a verdict AND the number behind it, so you can disagree
with the tool. A black box that says "BUY" is worthless; a tool that says
"you need a 6.2% move in 9 days and that is a 1.4-sigma event" is useful
even when you overrule it.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Literal

from . import montecarlo, sizing
from .strategy import UNBOUNDED, Position

__all__ = ["Check", "Verdict", "evaluate"]

Level = Literal["pass", "warn", "fail"]

_WEIGHT = {"pass": 0, "warn": 1, "fail": 3}


@dataclass
class Check:
    name: str
    level: Level
    detail: str
    value: float | None = None

    def as_dict(self) -> dict:
        return {"name": self.name, "level": self.level, "detail": self.detail, "value": self.value}


@dataclass
class Verdict:
    """The full assessment of one proposed trade."""

    position: str
    checks: list[Check]
    outcome_summary: dict
    sizing: dict
    sensitivity: dict = field(default_factory=dict)

    @property
    def score(self) -> int:
        """Lower is better. Sum of check penalties."""
        return sum(_WEIGHT[c.level] for c in self.checks)

    @property
    def recommendation(self) -> str:
        if any(c.level == "fail" for c in self.checks):
            return "DO NOT TRADE"
        if self.score >= 4:
            return "MARGINAL — reduce size or pass"
        if self.score >= 2:
            return "ACCEPTABLE — trade small"
        return "CLEAN — trade the planned size"

    @property
    def failures(self) -> list[Check]:
        return [c for c in self.checks if c.level == "fail"]

    def report(self) -> str:
        icons = {"pass": "PASS", "warn": "WARN", "fail": "FAIL"}
        lines = [
            "=" * 72,
            f"  {self.position}",
            "=" * 72,
            "",
            f"  VERDICT: {self.recommendation}   (risk score {self.score}, lower is better)",
            "",
            "  CHECKS",
            "  " + "-" * 68,
        ]
        for c in self.checks:
            lines.append(f"  [{icons[c.level]}] {c.name}")
            lines.append(f"         {c.detail}")
        o = self.outcome_summary
        lines += [
            "",
            "  SIMULATED OUTCOME  " + f"({o['paths']:,} paths, {o['assumptions']['tail']} tails)",
            "  " + "-" * 68,
            f"    P(profit)            {o['prob_profit']:.1%}",
            f"    Expected value       ${o['expected_value']:+,.2f}",
            f"    Median outcome       ${o['median']:+,.2f}",
            f"    5th percentile       ${o['p05']:+,.2f}",
            f"    95th percentile      ${o['p95']:+,.2f}",
            f"    Worst 5% average     ${o['cvar_5']:+,.2f}",
            f"    P(total loss)        {o['prob_total_loss']:.1%}",
            "",
            "  SIZING",
            "  " + "-" * 68,
            f"    Recommended          {self.sizing['contracts']} contract(s)"
            f"  (${self.sizing['capital_deployed']:,.2f}, "
            f"{self.sizing['account_fraction']:.2%} of account)",
            f"    Method               {self.sizing['method']}",
        ]
        for reason in self.sizing["reasons"]:
            lines.append(f"      - {reason}")
        for warn in self.sizing["warnings"]:
            lines.append(f"      ! {warn}")

        if self.sensitivity:
            spread = self.sensitivity["_spread"]
            lines += [
                "",
                "  ASSUMPTION SENSITIVITY",
                "  " + "-" * 68,
                f"    P(profit) ranges {spread['prob_profit_min']:.1%} to "
                f"{spread['prob_profit_max']:.1%} across bear/base/bull drift.",
                f"    That is a {spread['relative_range']:.0%} relative swing — "
                + ("this is mostly a DIRECTION bet, so be honest that you are "
                   "guessing which way it goes." if spread["relative_range"] > 0.35
                   else "the structure carries the trade, not the direction call."),
            ]

        lines += [
            "",
            "  " + "-" * 68,
            "  Assumptions are inputs, not facts. This tool does not predict prices",
            "  and does not place orders. Paper trade any change for 3 months first.",
            "=" * 72,
        ]
        return "\n".join(lines)


def evaluate(
    position: Position,
    *,
    account: float,
    drift: float = 0.08,
    vol: float = 0.30,
    historical_vol: float | None = None,
    exit_days: float | None = None,
    exit_vol: float | None = None,
    max_risk_pct: float = 0.02,
    paths: int = 20_000,
    run_sensitivity: bool = True,
    seed: int | None = 42,
) -> Verdict:
    """Run the full battery against a proposed position."""
    if account <= 0:
        raise ValueError(f"account must be positive, got {account}")

    profile = position.risk_profile()
    spot = position.spot_at_entry
    horizon = exit_days if exit_days is not None else max(
        (leg.dte for leg in position.legs if leg.kind != "stock"), default=0.0
    )

    outcome = montecarlo.simulate(
        position, drift=drift, vol=vol, paths=paths,
        exit_days=exit_days, exit_vol=exit_vol, seed=seed,
    )
    returns = (
        [p / profile.capital_at_risk for p in outcome.pnl]
        if profile.capital_at_risk > 0 else [0.0]
    )

    checks: list[Check] = []

    # 1. Defined risk.
    if profile.is_defined_risk:
        checks.append(Check(
            "Defined risk", "pass",
            f"Worst case is capped at ${profile.max_loss:,.2f}.", profile.max_loss,
        ))
    else:
        checks.append(Check(
            "Defined risk", "fail",
            "Loss is UNBOUNDED. A naked short can lose more than the account holds. "
            "Convert to a spread by buying a wing before considering this.",
        ))

    # 2. Expectancy.
    ev = outcome.expected_value
    if ev > 0:
        checks.append(Check(
            "Positive expectancy", "pass",
            f"Expected value ${ev:+,.2f} per unit under the stated assumptions.", ev,
        ))
    else:
        checks.append(Check(
            "Positive expectancy", "fail",
            f"Expected value is ${ev:+,.2f}. This loses money on average under its OWN "
            "assumptions — before commissions and slippage.", ev,
        ))

    # 3. Required move vs what the vol actually supports.
    if profile.breakevens and spot > 0 and horizon > 0:
        nearest = min(profile.breakevens, key=lambda b: abs(b - spot))
        pct_move = abs(nearest - spot) / spot
        one_sigma = vol * math.sqrt(horizon / 365.0)
        sigmas = pct_move / one_sigma if one_sigma > 0 else 0.0
        if sigmas <= 0.5:
            lvl, note = "pass", "well inside a normal move"
        elif sigmas <= 1.0:
            lvl, note = "warn", "roughly a one-sigma move; possible but not the base case"
        else:
            lvl, note = "fail", "beyond a one-sigma move; you are paying for a tail event"
        checks.append(Check(
            "Required move", lvl,
            f"Needs {pct_move:.2%} to break even in {horizon:g} days. "
            f"One sigma over that window is {one_sigma:.2%}, so this is a "
            f"{sigmas:.2f}-sigma move — {note}.", sigmas,
        ))

    # 4. Are you overpaying for volatility?
    if historical_vol is not None and historical_vol > 0:
        ratio = vol / historical_vol
        net_vega = position.net_greeks(spot, vol)["vega"]
        long_vol = net_vega > 0
        if ratio > 1.25 and long_vol:
            checks.append(Check(
                "Volatility pricing", "fail",
                f"IV {vol:.1%} is {ratio:.2f}x historical {historical_vol:.1%} and you are LONG "
                "vega. You are buying volatility at a premium; an IV drop loses money even "
                "if you are right on direction.", ratio,
            ))
        elif ratio < 0.8 and not long_vol:
            checks.append(Check(
                "Volatility pricing", "warn",
                f"IV {vol:.1%} is only {ratio:.2f}x historical {historical_vol:.1%} and you are "
                "SHORT vega. You are selling cheap volatility — poor compensation for tail risk.",
                ratio,
            ))
        else:
            checks.append(Check(
                "Volatility pricing", "pass",
                f"IV {vol:.1%} vs historical {historical_vol:.1%} ({ratio:.2f}x) is not "
                "working against this structure.", ratio,
            ))

    # 5. Theta burn.
    g = position.net_greeks(spot, vol)
    theta = g["theta"]
    premium = abs(profile.net_cost)
    if premium > 0 and theta < 0:
        daily_pct = abs(theta) / premium
        if daily_pct > 0.05:
            lvl = "fail"
            note = "the position bleeds out in under three weeks on time alone"
        elif daily_pct > 0.02:
            lvl = "warn"
            note = "meaningful decay; you need the move to happen soon"
        else:
            lvl = "pass"
            note = "decay is manageable"
        checks.append(Check(
            "Time decay", lvl,
            f"Theta is ${theta:,.2f}/day, {daily_pct:.2%} of the ${premium:,.2f} premium "
            f"every day — {note}.", daily_pct,
        ))
    elif theta > 0:
        checks.append(Check(
            "Time decay", "pass",
            f"Theta is ${theta:+,.2f}/day — time is working FOR this position.", theta,
        ))

    # 6. Tail risk.
    if outcome.prob_total_loss > 0.5:
        checks.append(Check(
            "Tail risk", "fail",
            f"{outcome.prob_total_loss:.1%} of paths lose essentially everything. "
            "This is a lottery ticket, and should be sized like one or skipped.",
            outcome.prob_total_loss,
        ))
    elif outcome.prob_total_loss > 0.25:
        checks.append(Check(
            "Tail risk", "warn",
            f"{outcome.prob_total_loss:.1%} of paths are a near-total loss. "
            f"The worst 5% average ${outcome.cvar_5:,.2f}.", outcome.prob_total_loss,
        ))
    else:
        checks.append(Check(
            "Tail risk", "pass",
            f"Near-total loss occurs in {outcome.prob_total_loss:.1%} of paths; "
            f"worst 5% average ${outcome.cvar_5:,.2f}.", outcome.prob_total_loss,
        ))

    # 7. IV crush, when an early exit is planned.
    if exit_vol is not None and exit_vol < vol:
        held = montecarlo.simulate(
            position, drift=drift, vol=vol, paths=paths,
            exit_days=exit_days, exit_vol=vol, seed=seed,
        )
        cost = held.expected_value - outcome.expected_value
        checks.append(Check(
            "IV crush", "warn" if cost > 0 else "pass",
            f"Vol falling {vol:.1%} to {exit_vol:.1%} by exit costs ${cost:,.2f} of expected "
            "value. This is the effect that makes 'right on direction, still lost' happen.",
            cost,
        ))

    size = sizing.recommend_size(
        account,
        profile.capital_at_risk if profile.capital_at_risk > 0 else 1.0,
        returns,
        max_risk_pct=max_risk_pct,
        defined_risk=profile.is_defined_risk,
    )

    sens = {}
    if run_sensitivity:
        sens = montecarlo.sensitivity(
            position, base_drift=drift, base_vol=vol,
            paths=max(2_000, paths // 10), exit_days=exit_days, exit_vol=exit_vol, seed=seed,
        )

    return Verdict(
        position=position.describe(),
        checks=checks,
        outcome_summary=outcome.summary(),
        sizing=size.summary(),
        sensitivity=sens,
    )
