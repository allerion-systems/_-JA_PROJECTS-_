#!/usr/bin/env python3
"""Command-line front end for the trading agent.

    ./agent.py analyze  long-call --symbol NVDA --spot 170 --strike 180 \
                        --premium 4.20 --dte 30 --account 10000 --iv 0.45 --hv 0.35

    ./agent.py price    --spot 170 --strike 180 --dte 30 --iv 0.45 --kind call
    ./agent.py iv       --spot 170 --strike 180 --dte 30 --market 4.20 --kind call
    ./agent.py journal  stats --file examples/trades.jsonl
    ./agent.py journal  leaks --file examples/trades.jsonl

Run with no arguments for the full help.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from tradeagent import journal as jnl  # noqa: E402
from tradeagent import pricing, strategy, verdict  # noqa: E402

STRUCTURES = ("long-call", "long-put", "covered-call", "csp", "vertical", "straddle", "iron-condor")


def _build_position(a: argparse.Namespace) -> strategy.Position:
    """Turn CLI args into a Position, failing loudly on missing legs."""
    s, spot, dte, qty = a.structure, a.spot, a.dte, a.qty

    def need(name: str, val):
        if val is None:
            raise SystemExit(f"error: --{name} is required for structure '{s}'")
        return val

    if s == "long-call":
        return strategy.long_call(a.symbol, spot, need("strike", a.strike), need("premium", a.premium), dte, qty)
    if s == "long-put":
        return strategy.long_put(a.symbol, spot, need("strike", a.strike), need("premium", a.premium), dte, qty)
    if s == "covered-call":
        return strategy.covered_call(a.symbol, spot, need("strike", a.strike), need("premium", a.premium), dte, qty)
    if s == "csp":
        return strategy.cash_secured_put(a.symbol, spot, need("strike", a.strike), need("premium", a.premium), dte, qty)
    if s == "vertical":
        return strategy.vertical(
            a.symbol, spot, need("strike", a.strike), need("short-strike", a.short_strike),
            need("premium", a.premium), need("short-premium", a.short_premium), dte, a.kind, qty,
        )
    if s == "straddle":
        return strategy.straddle(
            a.symbol, spot, need("strike", a.strike), need("premium", a.premium),
            need("put-premium", a.put_premium), dte, qty,
        )
    if s == "iron-condor":
        strikes = need("strikes", a.strikes)
        prems = need("premiums", a.premiums)
        if len(strikes) != 4 or len(prems) != 4:
            raise SystemExit("error: iron-condor needs exactly 4 --strikes and 4 --premiums, low to high")
        return strategy.iron_condor(a.symbol, spot, *strikes, tuple(prems), dte, qty)
    raise SystemExit(f"error: unknown structure {s!r}")


def cmd_analyze(a: argparse.Namespace) -> int:
    position = _build_position(a)
    v = verdict.evaluate(
        position,
        account=a.account,
        drift=a.drift,
        vol=a.iv,
        historical_vol=a.hv,
        exit_days=a.exit_days,
        exit_vol=a.exit_iv,
        max_risk_pct=a.max_risk,
        paths=a.paths,
        run_sensitivity=not a.no_sensitivity,
    )
    if a.json:
        print(json.dumps({
            "position": v.position,
            "recommendation": v.recommendation,
            "score": v.score,
            "checks": [c.as_dict() for c in v.checks],
            "outcome": v.outcome_summary,
            "sizing": v.sizing,
            "sensitivity": v.sensitivity,
        }, indent=2))
    else:
        print(v.report())
    return 1 if v.failures else 0


def cmd_price(a: argparse.Namespace) -> int:
    T = a.dte / 365.0
    g = pricing.greeks(a.spot, a.strike, T, a.rate, a.iv, a.kind, a.div)
    per = g.per_contract()
    print(f"\n  {a.kind.upper()} {a.strike:g} @ {a.dte:g}d   spot {a.spot:g}   IV {a.iv:.1%}\n")
    print(f"    Theoretical value   ${g.price:,.4f}/share   ${per.price:,.2f}/contract")
    print(f"    Intrinsic           ${pricing.intrinsic(a.spot, a.strike, a.kind):,.4f}/share")
    print(f"    Delta               {g.delta:+.4f}      (${per.delta:+,.2f} per $1 move)")
    print(f"    Gamma               {g.gamma:+.4f}")
    print(f"    Theta               {g.theta:+.4f}      (${per.theta:+,.2f} per day)")
    print(f"    Vega                {g.vega:+.4f}      (${per.vega:+,.2f} per vol point)")
    print(f"    Rho                 {g.rho:+.4f}\n")
    return 0


def cmd_iv(a: argparse.Namespace) -> int:
    try:
        v = pricing.implied_vol(a.market, a.spot, a.strike, a.dte / 365.0, a.rate, a.kind, a.div)
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2
    print(f"\n  Implied volatility: {v:.2%}")
    if a.hv:
        ratio = v / a.hv
        verdictline = (
            "EXPENSIVE — you are paying a premium over realised movement" if ratio > 1.25
            else "CHEAP relative to realised movement" if ratio < 0.8
            else "in line with realised movement"
        )
        print(f"  Historical vol:     {a.hv:.2%}   ({ratio:.2f}x)  {verdictline}")
    print()
    return 0


def cmd_journal(a: argparse.Namespace) -> int:
    j = jnl.Journal(a.file)
    if a.action == "stats":
        st = j.stats()
        if st.count == 0:
            print(f"\n  No trades in {a.file}\n")
            return 0
        print(f"\n  JOURNAL — {st.count} trades from {a.file}\n")
        print(f"    Total P&L        ${st.total_pnl:+,.2f}")
        print(f"    Win rate         {st.win_rate:.1%}  ({st.wins}W / {st.losses}L)")
        print(f"    Expectancy       ${st.expectancy:+,.2f} per trade")
        print(f"    Avg win          ${st.avg_win:,.2f}")
        print(f"    Avg loss         ${st.avg_loss:,.2f}")
        print(f"    Payoff ratio     {st.payoff_ratio:.2f}")
        pf = st.profit_factor
        print(f"    Profit factor    {'inf' if pf == float('inf') else f'{pf:.2f}'}")
        print(f"    Largest loss     ${st.largest_loss:,.2f}\n")
        if a.by:
            print(f"  BY {a.by.upper()}\n")
            for label, s in j.group_by(a.by).items():
                print(f"    {label:<20} {s.count:>4} trades   "
                      f"${s.expectancy:>+9,.2f}/trade   ${s.total_pnl:>+10,.2f} total")
            print()
        return 0

    if a.action == "leaks":
        print(f"\n  LEAK ANALYSIS — {a.file}\n")
        for leak in j.leaks():
            print(f"    [{leak['leak']}]")
            print(f"      {leak['detail']}\n")
        return 0

    raise SystemExit(f"error: unknown journal action {a.action!r}")


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="agent.py",
        description="Options analysis, risk sizing, and trade journalling. "
                    "Does not place orders and does not predict prices.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = p.add_subparsers(dest="command", required=True)

    an = sub.add_parser("analyze", help="run the full check battery on a proposed trade")
    an.add_argument("structure", choices=STRUCTURES)
    an.add_argument("--symbol", default="UNDERLYING")
    an.add_argument("--spot", type=float, required=True, help="current underlying price")
    an.add_argument("--dte", type=float, required=True, help="calendar days to expiry")
    an.add_argument("--account", type=float, required=True, help="total account value, for sizing")
    an.add_argument("--iv", type=float, required=True, help="implied vol as a decimal, e.g. 0.45")
    an.add_argument("--hv", type=float, help="historical/realised vol, to detect overpaying")
    an.add_argument("--strike", type=float)
    an.add_argument("--premium", type=float, help="per-share premium of the primary leg")
    an.add_argument("--short-strike", type=float)
    an.add_argument("--short-premium", type=float)
    an.add_argument("--put-premium", type=float, help="straddle: the put leg premium")
    an.add_argument("--strikes", type=float, nargs=4, help="iron-condor: 4 strikes, low to high")
    an.add_argument("--premiums", type=float, nargs=4, help="iron-condor: 4 premiums, matching --strikes")
    an.add_argument("--kind", choices=("call", "put"), default="call", help="vertical: which side")
    an.add_argument("--qty", type=int, default=1)
    an.add_argument("--drift", type=float, default=0.08, help="assumed annual return of the underlying")
    an.add_argument("--exit-days", type=float, help="model closing early instead of holding to expiry")
    an.add_argument("--exit-iv", type=float, help="IV you expect at exit; set below --iv to model crush")
    an.add_argument("--max-risk", type=float, default=0.02, help="max fraction of account per trade")
    an.add_argument("--paths", type=int, default=20_000)
    an.add_argument("--no-sensitivity", action="store_true")
    an.add_argument("--json", action="store_true")
    an.set_defaults(func=cmd_analyze)

    pr = sub.add_parser("price", help="theoretical value and Greeks for one option")
    pr.add_argument("--spot", type=float, required=True)
    pr.add_argument("--strike", type=float, required=True)
    pr.add_argument("--dte", type=float, required=True)
    pr.add_argument("--iv", type=float, required=True)
    pr.add_argument("--kind", choices=("call", "put"), default="call")
    pr.add_argument("--rate", type=float, default=0.04)
    pr.add_argument("--div", type=float, default=0.0)
    pr.set_defaults(func=cmd_price)

    iv = sub.add_parser("iv", help="back out implied vol from a market price")
    iv.add_argument("--spot", type=float, required=True)
    iv.add_argument("--strike", type=float, required=True)
    iv.add_argument("--dte", type=float, required=True)
    iv.add_argument("--market", type=float, required=True, help="the price you would actually pay")
    iv.add_argument("--kind", choices=("call", "put"), default="call")
    iv.add_argument("--rate", type=float, default=0.04)
    iv.add_argument("--div", type=float, default=0.0)
    iv.add_argument("--hv", type=float, help="historical vol, to judge cheap vs expensive")
    iv.set_defaults(func=cmd_iv)

    jr = sub.add_parser("journal", help="performance stats and leak detection")
    jr.add_argument("action", choices=("stats", "leaks"))
    jr.add_argument("--file", default="examples/trades.jsonl")
    jr.add_argument("--by", choices=("symbol", "structure", "exit_reason", "conviction",
                                     "tag", "weekday", "hour", "hold_bucket"))
    jr.set_defaults(func=cmd_journal)

    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        return args.func(args)
    except (ValueError, SystemExit) as exc:
        if isinstance(exc, SystemExit):
            raise
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
