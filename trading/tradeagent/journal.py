"""Trade journal and leak detection.

You cannot get an edge on Citadel. You can absolutely get an edge on
yourself, and unlike the first one it is available today, for free, and
compounds. This module is the highest-expected-value code in the package.

The job is unglamorous: record every trade with its reasoning, then find the
subgroups where you reliably lose money. "You lose money on every trade you
open after 2pm" is a real, actionable, personal edge. It will not show up in
any backtest, because it is not about the market — it is about you.

Storage is append-only JSONL: one JSON object per line, human-readable,
diffable in git, and impossible to corrupt with a partial write.
"""

from __future__ import annotations

import json
import statistics
from collections import defaultdict
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path

__all__ = ["Trade", "Journal", "Stats"]

# Below this many trades a subgroup difference is noise, not a pattern.
MIN_SAMPLE = 8

# A group must underperform the baseline by at least this share of the
# baseline's magnitude to count as a leak rather than ordinary variance.
LEAK_MARGIN = 0.25

# Reporting everything reports nothing. Show the worst offenders only.
MAX_LEAKS = 6


@dataclass
class Trade:
    """One closed trade. `pnl` is realised dollars, net of fees."""

    symbol: str
    structure: str
    pnl: float
    opened: str                      # ISO 8601
    closed: str = ""
    capital_at_risk: float = 0.0
    thesis: str = ""                 # why you entered, written BEFORE the outcome
    exit_reason: str = ""            # plan / stop / panic / expiry / assignment
    conviction: int = 3              # 1-5, recorded at entry
    tags: list[str] = field(default_factory=list)
    notes: str = ""

    def __post_init__(self) -> None:
        if not self.symbol:
            raise ValueError("trade needs a symbol")
        if not 1 <= self.conviction <= 5:
            raise ValueError(f"conviction must be 1-5, got {self.conviction}")

    @property
    def is_win(self) -> bool:
        return self.pnl > 0

    @property
    def return_on_risk(self) -> float:
        return self.pnl / self.capital_at_risk if self.capital_at_risk > 0 else 0.0

    @property
    def opened_dt(self) -> datetime | None:
        try:
            return datetime.fromisoformat(self.opened)
        except (ValueError, TypeError):
            return None

    @property
    def hold_days(self) -> float | None:
        try:
            return (datetime.fromisoformat(self.closed) - datetime.fromisoformat(self.opened)).total_seconds() / 86400
        except (ValueError, TypeError):
            return None


@dataclass
class Stats:
    """Aggregate performance for a set of trades."""

    count: int
    wins: int
    losses: int
    total_pnl: float
    win_rate: float
    avg_win: float
    avg_loss: float          # positive magnitude
    expectancy: float        # average $ per trade
    profit_factor: float     # gross wins / gross losses
    largest_loss: float

    @property
    def payoff_ratio(self) -> float:
        return self.avg_win / self.avg_loss if self.avg_loss > 0 else float("inf")

    def summary(self) -> dict:
        d = asdict(self)
        d["payoff_ratio"] = round(self.payoff_ratio, 3) if self.payoff_ratio != float("inf") else "inf"
        for k, v in d.items():
            if isinstance(v, float):
                d[k] = round(v, 4)
        return d


def _stats(trades: list[Trade]) -> Stats:
    if not trades:
        return Stats(0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0)

    wins = [t.pnl for t in trades if t.pnl > 0]
    losses = [-t.pnl for t in trades if t.pnl <= 0]
    gross_w, gross_l = sum(wins), sum(losses)

    return Stats(
        count=len(trades),
        wins=len(wins),
        losses=len(losses),
        total_pnl=sum(t.pnl for t in trades),
        win_rate=len(wins) / len(trades),
        avg_win=statistics.fmean(wins) if wins else 0.0,
        avg_loss=statistics.fmean(losses) if losses else 0.0,
        expectancy=statistics.fmean([t.pnl for t in trades]),
        profit_factor=(gross_w / gross_l) if gross_l > 0 else float("inf"),
        largest_loss=max(losses) if losses else 0.0,
    )


class Journal:
    """Append-only trade log with grouping and leak detection."""

    def __init__(self, path: str | Path):
        self.path = Path(path)
        self._trades: list[Trade] | None = None

    # ---- io ------------------------------------------------------------

    def record(self, trade: Trade) -> None:
        """Append one trade. Creates the file and parent dirs if needed."""
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(asdict(trade), ensure_ascii=False) + "\n")
        self._trades = None  # invalidate cache

    def load(self, *, reload: bool = False) -> list[Trade]:
        """Read all trades. Malformed lines are skipped, not fatal."""
        if self._trades is not None and not reload:
            return self._trades
        trades: list[Trade] = []
        if self.path.exists():
            with self.path.open(encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        trades.append(Trade(**json.loads(line)))
                    except (json.JSONDecodeError, TypeError, ValueError):
                        continue  # one bad row must not break the whole journal
        self._trades = trades
        return trades

    # ---- analysis ------------------------------------------------------

    def stats(self) -> Stats:
        return _stats(self.load())

    def group_by(self, key: str) -> dict[str, Stats]:
        """Stats split by an attribute of the trade.

        Supported keys: symbol, structure, exit_reason, conviction, tag,
        weekday, hour, hold_bucket.
        """
        return {k: _stats([self.load()[i] for i in idx]) for k, idx in self._group_indices(key).items()}

    def _group_indices(self, key: str) -> dict[str, list[int]]:
        """Same grouping, but keeping trade identity so leaks() can tell when
        two differently-named groups are actually the same set of trades."""
        buckets: dict[str, list[int]] = defaultdict(list)
        for i, t in enumerate(self.load()):
            for label in self._labels(t, key):
                buckets[label].append(i)
        return dict(sorted(buckets.items()))

    @staticmethod
    def _labels(t: Trade, key: str) -> list[str]:
        if key == "tag":
            return t.tags or ["untagged"]
        if key in ("symbol", "structure", "exit_reason"):
            return [getattr(t, key) or "unspecified"]
        if key == "conviction":
            return [f"conviction-{t.conviction}"]
        if key in ("weekday", "hour"):
            dt = t.opened_dt
            if dt is None:
                return ["unknown"]
            return [dt.strftime("%A")] if key == "weekday" else [f"{dt.hour:02d}:00"]
        if key == "hold_bucket":
            d = t.hold_days
            if d is None:
                return ["unknown"]
            if d < 1:
                return ["intraday"]
            if d <= 7:
                return ["1-7d"]
            if d <= 30:
                return ["8-30d"]
            return ["30d+"]
        raise ValueError(f"unsupported group key: {key!r}")


    def leaks(self, *, min_sample: int = MIN_SAMPLE, limit: int = MAX_LEAKS) -> list[dict]:
        """Find subgroups that lose money materially faster than your baseline.

        Deliberately conservative on three axes, because a tool that reports
        fifteen "leaks" teaches you to ignore all fifteen:

          sample   a group needs enough trades to mean anything at all
          margin   being a hair worse than baseline is noise, not a leak. The
                   group has to underperform by a real margin to qualify.
          overlap  'structure=vertical' and 'tag=spread' can be the exact same
                   trades. Identical sets are reported once, under the most
                   actionable label — you can change your exit rule, you cannot
                   change the fact that you tagged something.

        Sample size is always reported so you can judge for yourself. A pattern
        over 9 trades is a hint, not a law.
        """
        all_trades = self.load()
        if len(all_trades) < min_sample:
            return [{
                "leak": "insufficient-data",
                "detail": f"Only {len(all_trades)} trades logged. Need at least "
                          f"{min_sample} before any pattern means anything.",
            }]

        baseline = _stats(all_trades).expectancy
        # Underperforming the baseline by a rounding error is not a finding.
        margin = max(LEAK_MARGIN * abs(baseline), 1e-9)

        found: list[dict] = []
        seen_sets: set[frozenset[int]] = set()

        # Order matters: the first key to claim a given set of trades owns it,
        # so the list runs most-actionable first.
        for key in ("exit_reason", "structure", "hold_bucket", "weekday", "symbol", "conviction", "tag"):
            for label, idx in self._group_indices(key).items():
                if len(idx) < min_sample:
                    continue
                st = _stats([all_trades[i] for i in idx])
                if st.expectancy >= 0 or st.expectancy >= baseline - margin:
                    continue
                signature = frozenset(idx)
                if signature in seen_sets:
                    continue  # same trades, already reported under a better label
                seen_sets.add(signature)
                found.append({
                    "leak": f"{key}={label}",
                    "trades": st.count,
                    "expectancy": round(st.expectancy, 2),
                    "baseline": round(baseline, 2),
                    "total_pnl": round(st.total_pnl, 2),
                    "win_rate": round(st.win_rate, 3),
                    "detail": (
                        f"{st.count} trades where {key} is '{label}' average "
                        f"{st.expectancy:+.2f} vs your overall {baseline:+.2f}. "
                        f"Total damage: {st.total_pnl:+.2f}."
                    ),
                })

        found.sort(key=lambda x: x["total_pnl"])
        if not found:
            return [{"leak": "none-found", "detail": "No losing subgroup met the sample threshold."}]

        trimmed = found[:limit]
        if len(found) > limit:
            trimmed.append({
                "leak": "truncated",
                "detail": f"{len(found) - limit} smaller leaks not shown. Fix these first.",
            })
        return trimmed
