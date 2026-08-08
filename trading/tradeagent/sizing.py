"""Position sizing and ruin math.

Almost nobody blows up an account by picking wrong. They blow up by picking
wrong at the wrong SIZE. Sizing is the only part of trading you fully
control, and it is the part with the most reliable payoff, which is why it
gets its own module and its own tests.

Three ideas here:

  fixed_fractional  risk a constant small % of the account per trade. Boring,
                    survivable, and what almost everyone should actually do.

  kelly             the mathematically growth-optimal fraction. Included with
                    a deliberate haircut, because full Kelly assumes you KNOW
                    your edge. You do not. Your edge estimate is itself an
                    estimate, and full Kelly on an overestimated edge is a
                    reliable path to zero. Default is quarter-Kelly.

  risk_of_ruin      given your real win rate and sizing, how often does a run
                    of bad luck end you. Run this before believing any plan.
"""

from __future__ import annotations

import math
import random
import statistics
from dataclasses import dataclass

__all__ = [
    "SizeRecommendation",
    "fixed_fractional",
    "kelly_fraction",
    "empirical_kelly",
    "risk_of_ruin",
    "recommend_size",
]

# Full Kelly is correct only with a perfectly known edge. Every practitioner
# who survives uses a fraction of it. This is the default haircut.
DEFAULT_KELLY_FRACTION = 0.25

# Above this share of the account in one trade, no amount of edge justifies it.
MAX_SANE_ACCOUNT_FRACTION = 0.05


@dataclass
class SizeRecommendation:
    """How many contracts to trade, and the reasoning that produced it."""

    contracts: int
    capital_deployed: float
    account_fraction: float
    method: str
    reasons: list[str]
    warnings: list[str]

    def summary(self) -> dict:
        return {
            "contracts": self.contracts,
            "capital_deployed": round(self.capital_deployed, 2),
            "account_fraction": round(self.account_fraction, 4),
            "method": self.method,
            "reasons": self.reasons,
            "warnings": self.warnings,
        }


def fixed_fractional(account: float, risk_pct: float, risk_per_contract: float) -> int:
    """Contracts such that a total loss costs `risk_pct` of the account.

    risk_per_contract must be the REAL worst case for one contract — for a
    long option that is the full premium, for an undefined-risk short it is
    not knowable and this function should not be trusted.
    """
    if account <= 0:
        raise ValueError(f"account must be positive, got {account}")
    if not 0 < risk_pct < 1:
        raise ValueError(f"risk_pct must be a fraction between 0 and 1, got {risk_pct}")
    if risk_per_contract <= 0:
        raise ValueError(f"risk_per_contract must be positive, got {risk_per_contract}")
    return max(0, int((account * risk_pct) // risk_per_contract))


def kelly_fraction(p_win: float, win_amount: float, loss_amount: float) -> float:
    """Classic Kelly for a two-outcome bet. Returns fraction of bankroll.

    Negative result means the bet has negative expectancy — the correct size
    is zero, and the sign is the model telling you not to trade it.
    """
    if not 0 <= p_win <= 1:
        raise ValueError(f"p_win must be 0-1, got {p_win}")
    if win_amount <= 0 or loss_amount <= 0:
        raise ValueError("win_amount and loss_amount must both be positive magnitudes")
    b = win_amount / loss_amount
    return (p_win * b - (1.0 - p_win)) / b


def empirical_kelly(returns_per_dollar: list[float], *, max_f: float = 1.0, steps: int = 400) -> float:
    """Growth-optimal fraction for an arbitrary outcome distribution.

    `returns_per_dollar` is P&L divided by capital at risk, one entry per
    simulated path. Maximises E[log(1 + f*R)], which is the criterion that
    maximises long-run compounded growth.

    Unlike the two-outcome formula this handles the real, lumpy shape of an
    options payoff — including the fat left tail that makes short-premium
    strategies look better than they are under a normal model.
    """
    if not returns_per_dollar:
        raise ValueError("need at least one return observation")

    worst = min(returns_per_dollar)
    if worst >= 0:
        return max_f  # no losing path in the sample; sizing is not the binding constraint
    # Any f at or above this makes a total-loss path wipe the bankroll: log(0).
    ceiling = min(max_f, 1.0 / abs(worst) - 1e-9)
    if ceiling <= 0:
        return 0.0

    best_f, best_growth = 0.0, 0.0  # f=0 gives growth exactly 0
    for i in range(1, steps + 1):
        f = ceiling * i / steps
        total = 0.0
        for r in returns_per_dollar:
            wealth = 1.0 + f * r
            if wealth <= 1e-12:
                total = -math.inf
                break
            total += math.log(wealth)
        if total == -math.inf:
            continue
        growth = total / len(returns_per_dollar)
        if growth > best_growth:
            best_f, best_growth = f, growth
    return best_f


def risk_of_ruin(
    returns_per_dollar: list[float],
    fraction_per_trade: float,
    *,
    trades: int = 200,
    ruin_threshold: float = 0.5,
    simulations: int = 5_000,
    seed: int | None = 7,
) -> float:
    """Probability of drawing down past `ruin_threshold` within `trades`.

    Resamples your actual outcome distribution rather than assuming a tidy
    win/loss binary, so fat tails and clustered losses show up honestly.
    Default threshold is a 50% drawdown, which for most people is where the
    plan gets abandoned regardless of what the math says afterwards.
    """
    if not returns_per_dollar:
        raise ValueError("need at least one return observation")
    if not 0 <= fraction_per_trade <= 1:
        raise ValueError(f"fraction_per_trade must be 0-1, got {fraction_per_trade}")
    if not 0 < ruin_threshold < 1:
        raise ValueError(f"ruin_threshold must be between 0 and 1, got {ruin_threshold}")
    if fraction_per_trade == 0:
        return 0.0

    rng = random.Random(seed)
    ruined = 0
    for _ in range(simulations):
        wealth = 1.0
        for _ in range(trades):
            r = returns_per_dollar[rng.randrange(len(returns_per_dollar))]
            wealth *= 1.0 + fraction_per_trade * r
            if wealth <= ruin_threshold:
                ruined += 1
                break
    return ruined / simulations


def recommend_size(
    account: float,
    risk_per_contract: float,
    returns_per_dollar: list[float],
    *,
    max_risk_pct: float = 0.02,
    kelly_haircut: float = DEFAULT_KELLY_FRACTION,
    defined_risk: bool = True,
) -> SizeRecommendation:
    """Combine the methods and take the MOST CONSERVATIVE answer.

    Deliberately not the average. When two risk models disagree, the smaller
    number is the one that keeps you solvent long enough to find out which
    model was right.
    """
    if account <= 0:
        raise ValueError(f"account must be positive, got {account}")
    if risk_per_contract <= 0:
        raise ValueError(f"risk_per_contract must be positive, got {risk_per_contract}")

    reasons: list[str] = []
    warnings: list[str] = []

    expectancy = statistics.fmean(returns_per_dollar) if returns_per_dollar else 0.0

    if expectancy <= 0:
        return SizeRecommendation(
            contracts=0,
            capital_deployed=0.0,
            account_fraction=0.0,
            method="no-trade",
            reasons=[
                f"Simulated expectancy is {expectancy:+.4f} per dollar risked — "
                "this trade loses money on average under its own assumptions."
            ],
            warnings=["Negative expectancy. Size is zero. No sizing rule fixes a bad trade."],
        )

    # 1. Fixed fractional.
    ff_contracts = fixed_fractional(account, max_risk_pct, risk_per_contract)
    reasons.append(f"Fixed-fractional at {max_risk_pct:.1%} of account allows {ff_contracts} contract(s).")

    # 2. Haircut empirical Kelly.
    raw_kelly = empirical_kelly(returns_per_dollar)
    used_kelly = raw_kelly * kelly_haircut
    kelly_capital = account * used_kelly
    kelly_contracts = max(0, int(kelly_capital // risk_per_contract))
    reasons.append(
        f"Empirical Kelly is {raw_kelly:.1%} of account; at a {kelly_haircut:.0%} haircut "
        f"that is {used_kelly:.1%}, or {kelly_contracts} contract(s)."
    )
    if raw_kelly > 0.5:
        warnings.append(
            f"Raw Kelly of {raw_kelly:.0%} is implausibly high — it usually means the "
            "assumed drift is too optimistic. Treat the edge estimate as suspect."
        )

    # 3. Hard ceiling regardless of what the models say.
    cap_contracts = max(0, int((account * MAX_SANE_ACCOUNT_FRACTION) // risk_per_contract))

    contracts = min(ff_contracts, kelly_contracts, cap_contracts)
    method = "min(fixed-fractional, quarter-Kelly, 5% ceiling)"

    if not defined_risk:
        contracts = min(contracts, max(0, contracts // 2))
        warnings.append(
            "Undefined-risk position: the true worst case is larger than the number used "
            "for sizing. Size halved, and this is still an estimate, not a bound."
        )

    if contracts == 0:
        reasons.append(
            "Every rule rounds down to zero contracts — the position is too large "
            "for this account at any acceptable risk level."
        )

    deployed = contracts * risk_per_contract
    ror = risk_of_ruin(returns_per_dollar, deployed / account if account else 0.0)
    if ror > 0.05:
        warnings.append(
            f"Risk of a 50% drawdown over 200 trades at this size is {ror:.1%}. "
            "Above 5% is not a strategy, it is a countdown."
        )
    reasons.append(f"Risk of ruin at the recommended size: {ror:.2%}.")

    return SizeRecommendation(
        contracts=contracts,
        capital_deployed=deployed,
        account_fraction=deployed / account,
        method=method,
        reasons=reasons,
        warnings=warnings,
    )
