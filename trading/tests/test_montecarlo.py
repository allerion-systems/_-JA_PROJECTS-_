"""Simulation engine.

Checks that the distribution has the statistical properties it claims, that
results are reproducible under a fixed seed, and — most importantly — that
fat tails actually produce fatter tails than the normal model. That last one
matters because understating tail risk is how short-premium strategies look
safe right up until they are not.
"""

import math
import statistics
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from tradeagent import montecarlo, strategy  # noqa: E402


class TestTerminalPrices(unittest.TestCase):
    def test_median_matches_gbm_theory(self):
        """Median of GBM is S*exp((mu - v^2/2)*T), since the shock median is 0."""
        spot, drift, vol, days = 100.0, 0.10, 0.25, 365.0
        prices = montecarlo.terminal_prices(spot, drift, vol, days, 40_000, tail="normal", seed=1)
        expected = spot * math.exp((drift - 0.5 * vol**2) * days / 365.0)
        self.assertAlmostEqual(statistics.median(prices), expected, delta=expected * 0.02)

    def test_realised_vol_matches_input(self):
        spot, vol, days = 100.0, 0.30, 365.0
        prices = montecarlo.terminal_prices(spot, 0.0, vol, days, 40_000, tail="normal", seed=2)
        log_returns = [math.log(p / spot) for p in prices]
        self.assertAlmostEqual(statistics.pstdev(log_returns), vol, delta=0.01)

    def test_prices_stay_positive(self):
        prices = montecarlo.terminal_prices(100.0, -0.5, 1.5, 365.0, 5_000, seed=3)
        self.assertTrue(all(p > 0 for p in prices))

    def test_reproducible_under_a_fixed_seed(self):
        a = montecarlo.terminal_prices(100.0, 0.08, 0.3, 30.0, 500, seed=99)
        b = montecarlo.terminal_prices(100.0, 0.08, 0.3, 30.0, 500, seed=99)
        self.assertEqual(a, b)

    def test_fat_tails_produce_more_extreme_moves(self):
        """The honest reason student-t is the default."""
        kw = dict(spot=100.0, drift=0.0, vol=0.30, days=365.0, paths=40_000, seed=5)
        normal = montecarlo.terminal_prices(tail="normal", **kw)
        fat = montecarlo.terminal_prices(tail="student-t", df=3, **kw)
        # Count moves beyond 3 standard deviations of the log return.
        def extremes(prices):
            lr = [math.log(p / 100.0) for p in prices]
            sd = statistics.pstdev(lr)
            return sum(1 for x in lr if abs(x) > 3 * sd)
        self.assertGreater(extremes(fat), extremes(normal))

    def test_rejects_bad_inputs(self):
        for bad in (
            dict(spot=0.0, drift=0.0, vol=0.3, days=30.0, paths=100),
            dict(spot=100.0, drift=0.0, vol=-0.1, days=30.0, paths=100),
            dict(spot=100.0, drift=0.0, vol=0.3, days=0.0, paths=100),
            dict(spot=100.0, drift=0.0, vol=0.3, days=30.0, paths=0),
        ):
            with self.assertRaises(ValueError):
                montecarlo.terminal_prices(**bad)

    def test_student_t_needs_finite_variance(self):
        with self.assertRaises(ValueError):
            montecarlo.terminal_prices(100.0, 0.0, 0.3, 30.0, 10, tail="student-t", df=2)


class TestOutcome(unittest.TestCase):
    def setUp(self):
        self.pos = strategy.long_call("TEST", 100.0, 105.0, 3.0, 30)
        self.out = montecarlo.simulate(self.pos, drift=0.08, vol=0.35, paths=20_000, seed=11)

    def test_probability_is_a_probability(self):
        self.assertGreaterEqual(self.out.prob_profit, 0.0)
        self.assertLessEqual(self.out.prob_profit, 1.0)

    def test_loss_is_capped_at_the_premium(self):
        self.assertGreaterEqual(min(self.out.pnl), -300.0 - 1e-9)

    def test_otm_call_usually_expires_worthless(self):
        """Sanity: a 30-day OTM call is a losing proposition most of the time."""
        self.assertLess(self.out.prob_profit, 0.5)
        self.assertGreater(self.out.prob_total_loss, 0.3)

    def test_percentiles_are_ordered(self):
        self.assertLessEqual(self.out.percentile(5), self.out.percentile(50))
        self.assertLessEqual(self.out.percentile(50), self.out.percentile(95))

    def test_cvar_is_worse_than_the_fifth_percentile(self):
        self.assertLessEqual(self.out.cvar_5, self.out.percentile(5) + 1e-9)

    def test_percentile_bounds_are_validated(self):
        with self.assertRaises(ValueError):
            self.out.percentile(101)

    def test_summary_is_json_shaped(self):
        s = self.out.summary()
        for key in ("prob_profit", "expected_value", "cvar_5", "assumptions"):
            self.assertIn(key, s)


class TestSimulate(unittest.TestCase):
    def test_higher_drift_helps_a_long_call(self):
        pos = strategy.long_call("TEST", 100.0, 105.0, 3.0, 30)
        bear = montecarlo.simulate(pos, drift=-0.30, vol=0.35, paths=10_000, seed=21)
        bull = montecarlo.simulate(pos, drift=0.50, vol=0.35, paths=10_000, seed=21)
        self.assertGreater(bull.prob_profit, bear.prob_profit)

    def test_higher_drift_hurts_a_short_put(self):
        pos = strategy.cash_secured_put("TEST", 100.0, 95.0, 2.0, 30)
        bear = montecarlo.simulate(pos, drift=-0.40, vol=0.35, paths=10_000, seed=22)
        bull = montecarlo.simulate(pos, drift=0.40, vol=0.35, paths=10_000, seed=22)
        self.assertGreater(bull.prob_profit, bear.prob_profit)

    def test_iv_crush_reduces_expected_value_on_a_long_option(self):
        """Same stock paths, same exit day, only the exit IV differs."""
        pos = strategy.long_call("TEST", 100.0, 105.0, 6.0, 30)
        no_crush = montecarlo.simulate(pos, vol=0.80, exit_days=1, exit_vol=0.80, paths=10_000, seed=31)
        crushed = montecarlo.simulate(pos, vol=0.80, exit_days=1, exit_vol=0.30, paths=10_000, seed=31)
        self.assertLess(crushed.expected_value, no_crush.expected_value)

    def test_credit_spread_profits_most_of_the_time(self):
        pos = strategy.iron_condor("TEST", 100.0, 85.0, 92.0, 108.0, 115.0, (0.5, 1.5, 1.5, 0.5), 30)
        out = montecarlo.simulate(pos, drift=0.0, vol=0.25, paths=20_000, seed=41)
        self.assertGreater(out.prob_profit, 0.5)  # high win rate...
        self.assertLess(out.percentile(2), 0)     # ...paid for with a bad left tail

    def test_requires_a_horizon(self):
        pos = strategy.long_call("TEST", 100.0, 105.0, 3.0, 0)
        with self.assertRaises(ValueError):
            montecarlo.simulate(pos)

    def test_requires_a_spot(self):
        pos = strategy.long_call("TEST", 0.0, 105.0, 3.0, 30)
        with self.assertRaises(ValueError):
            montecarlo.simulate(pos)


class TestSensitivity(unittest.TestCase):
    def test_directional_trade_swings_more_than_a_neutral_one(self):
        """The check that tells you whether structure or direction is doing the work."""
        directional = strategy.long_call("TEST", 100.0, 105.0, 3.0, 30)
        neutral = strategy.iron_condor("TEST", 100.0, 85.0, 92.0, 108.0, 115.0, (0.5, 1.5, 1.5, 0.5), 30)
        d = montecarlo.sensitivity(directional, paths=3_000)["_spread"]
        n = montecarlo.sensitivity(neutral, paths=3_000)["_spread"]
        self.assertGreater(d["relative_range"], n["relative_range"])

    def test_relative_range_catches_what_absolute_range_misses(self):
        """A long call has a LOW absolute P(profit) swing simply because
        P(profit) is low everywhere. Relative swing exposes it as directional."""
        pos = strategy.long_call("TEST", 170.0, 185.0, 3.10, 14)
        spread = montecarlo.sensitivity(pos, base_drift=0.08, base_vol=0.62, paths=3_000)["_spread"]
        self.assertLess(spread["range"], 0.35)             # absolute looks tame...
        self.assertGreater(spread["relative_range"], 0.35)  # ...relative tells the truth

    def test_grid_covers_every_scenario(self):
        grid = montecarlo.sensitivity(strategy.long_call("TEST", 100.0, 105.0, 3.0, 30), paths=1_000)
        for name in ("bear/vol_low", "base/vol_high", "bull/vol_low", "_spread"):
            self.assertIn(name, grid)


if __name__ == "__main__":
    unittest.main(verbosity=2)
