"""tradeagent — options analysis, risk sizing, and trade journalling.

A decision-support agent for options trading. It does three things:

  1. Prices and stress-tests a proposed trade before you place it.
  2. Tells you how big to trade it, conservatively.
  3. Records what you did and finds where you actually lose money.

It does NOT place orders, and it does not predict prices. Those omissions
are the design, not a missing feature. See README.md.

Quick start:

    from tradeagent import strategy, verdict

    trade = strategy.long_call("NVDA", spot=170, strike=180, premium=4.20, dte=30)
    print(verdict.evaluate(trade, account=10_000, vol=0.45, historical_vol=0.35).report())
"""

from . import journal, montecarlo, pricing, sizing, strategy, verdict

__version__ = "0.1.0"

__all__ = ["pricing", "strategy", "montecarlo", "sizing", "journal", "verdict", "__version__"]
