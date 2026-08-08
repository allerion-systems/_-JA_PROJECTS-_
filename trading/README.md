# tradeagent

A decision-support agent for options trading. Pure Python 3.9+, no dependencies, no build step.

```bash
python3 agent.py analyze long-call --symbol NVDA --spot 170 --strike 185 \
        --premium 3.10 --dte 14 --account 5000 --iv 0.62 --hv 0.41
```

## What this is, and what it deliberately is not

**It does not place orders.** Not a missing feature — the design. An agent with
execution rights and no proven edge is just a faster way to be wrong.

**It does not predict prices.** Anything that could would not be published. The
counterparty on a retail options fill is a firm with private data feeds, PhDs,
colocated servers, and twenty years of head start. Any signal you can read on a
public API is priced in before you can act on it.

So it does the parts that *are* winnable, which is where retail money actually
goes — not into bad stock picks, but into overpaying for premium, sizing
recklessly, and repeating personal mistakes nobody ever measured:

| Module | Question it answers |
|---|---|
| `pricing` | What is this option actually worth, and what is the market charging? |
| `strategy` | What do I really own — break-evens, worst case, live Greeks? |
| `montecarlo` | Across thousands of paths, how often does this win, and how bad is the tail? |
| `sizing` | How many contracts before size alone ruins me? |
| `journal` | Where do *I* reliably lose money? |
| `verdict` | All of the above, as one go/no-go with stated reasons. |

The edge here is over **yourself**, not the market. That one is real, available
today, and compounds.

## Install

None. Clone and run.

```bash
cd trading
python3 -m unittest discover -s tests   # 130 tests
```

## The four commands

### `analyze` — run the full battery on a proposed trade

```bash
python3 agent.py analyze long-call --symbol NVDA --spot 170 --strike 185 \
        --premium 3.10 --dte 14 --account 5000 --iv 0.62 --hv 0.41
```

```
  VERDICT: DO NOT TRADE   (risk score 13, lower is better)

  [PASS] Defined risk      Worst case is capped at $310.00.
  [FAIL] Positive expectancy
         Expected value is $-20.07. This loses money on average under its OWN
         assumptions — before commissions and slippage.
  [WARN] Required move
         Needs 10.65% to break even in 14 days. One sigma over that window is
         12.14%, so this is a 0.88-sigma move.
  [FAIL] Volatility pricing
         IV 62.0% is 1.51x historical 41.0% and you are LONG vega. You are
         buying volatility at a premium; an IV drop loses money even if you
         are right on direction.
  [FAIL] Time decay
         Theta is $-24.68/day, 7.96% of the $310.00 premium every day.
  [FAIL] Tail risk
         81.5% of paths lose essentially everything.

    Recommended          0 contract(s)
    P(profit) ranges 6.7% to 19.8% across bear/base/bull drift.
    That is a 66% relative swing — this is mostly a DIRECTION bet.
```

Structures: `long-call` `long-put` `covered-call` `csp` `vertical` `straddle`
`iron-condor`. Add `--json` for machine-readable output. Exit code is 1 when any
check fails, so it composes into a pre-trade script.

Two flags worth knowing:

- `--hv` — your realised/historical vol. Without it the tool cannot tell you
  whether you are overpaying, which is the single most common way these trades
  fail.
- `--exit-iv` — the IV you expect when you close. Set it below `--iv` to model
  **IV crush**, and watch a trade that is right on direction still lose money.

### `price` — theoretical value and Greeks

```bash
python3 agent.py price --spot 170 --strike 185 --dte 14 --iv 0.62 --kind call
```

Greeks come back in trader units, not textbook ones: theta per **calendar day**,
vega per **vol point**, rho per **percentage point**, plus per-contract dollars.

### `iv` — what volatility is the market charging?

```bash
python3 agent.py iv --spot 170 --strike 185 --dte 14 --market 3.10 --hv 0.41
```

If the option is so far in or out of the money that its price carries no
volatility information, this **raises rather than returning a number**. A
confident-looking fabricated IV is worse than an error.

### `journal` — find your own leaks

```bash
python3 agent.py journal stats --file examples/trades.jsonl --by structure
python3 agent.py journal leaks --file examples/trades.jsonl
```

```
[structure=vertical]   21 trades averaging -162.13 vs your overall -86.13. Damage: -3404.65.
[exit_reason=panic]    10 trades averaging -311.36 vs your overall -86.13. Damage: -3113.55.
[hold_bucket=intraday]  8 trades averaging -309.51 vs your overall -86.13. Damage: -2476.09.
```

That second line is the whole point of the package. It is not a market insight,
it is a *you* insight, and it is worth more than any signal you can buy.

Leak detection is conservative on purpose, because a tool that reports fifteen
findings teaches you to ignore all fifteen:

- **sample** — under 8 trades in a group, nothing is reported
- **margin** — a group must underperform baseline by 25%+ to count, not by a rounding error
- **overlap** — `structure=vertical` and `tag=spread` are often the same trades; identical sets are reported once, under the label you can actually act on

Storage is append-only JSONL — human-readable, diffable in git, impossible to
corrupt with a partial write. One bad line never breaks the file.

## Library use

```python
from tradeagent import strategy, verdict, montecarlo

trade = strategy.vertical("SPY", spot=600, long_strike=600, short_strike=615,
                          long_premium=12.50, short_premium=6.20, dte=45)

print(trade.risk_profile())          # max profit/loss, break-evens, capital at risk
print(trade.net_greeks(600, 0.18))   # position delta/gamma/theta/vega in dollars
print(verdict.evaluate(trade, account=25_000, vol=0.18, historical_vol=0.17).report())

# How much of this trade is structure vs. a direction guess?
print(montecarlo.sensitivity(trade, base_drift=0.08, base_vol=0.18))
```

## Design notes worth knowing

**Fat tails are the default.** Simulations use Student-t shocks (df=4), not the
normal distribution. Textbook GBM understates crash risk, which is exactly why
short-premium strategies look safer than they are right up until they aren't.
Pass `tail="normal"` to see the optimistic version.

**Break-evens are solved, not scanned.** An expiry payoff is piecewise linear
with kinks only at strikes, so roots and extremes can only live at a kink or at
infinity. No sampling grid, no missed roots.

**Sizing takes the minimum, never the average.** Fixed-fractional, quarter-Kelly,
and a hard 5%-of-account ceiling all vote, and the smallest number wins. When two
risk models disagree, the conservative one keeps you solvent long enough to find
out which was right. Full Kelly is deliberately not offered: it is optimal only
when you *know* your edge, and you do not.

**The tool refuses rather than guesses.** Negative expectancy returns zero
contracts. Unidentifiable IV raises. Undefined-risk positions are flagged and
halved. Every refusal states its number so you can disagree with it — a black box
that says "BUY" is worthless, but "you need a 6.2% move in 9 days and that is a
1.4-sigma event" is useful even when you overrule it.

## Before you use this on real money

Assumptions are inputs, not facts. `--drift` is a guess; change it and P(profit)
moves. That sensitivity **is** the honest content of the model — run
`sensitivity()` and see how much of your thesis is structure and how much is you
guessing direction.

Paper trade any strategy for three months before funding it. If it is not
profitable on paper, real money does not fix it — it just makes it faster.

Options are a leverage tool, not a money printer. Leverage amplifies whatever
process you already have. This package exists to tell you which one you have.

*Not financial advice. Educational tooling.*
