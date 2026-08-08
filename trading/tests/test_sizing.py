"""Sizing and ruin math.

The most important property tested here is that `recommend_size` refuses to
size a negative-expectancy trade, and that the two independent Kelly
implementations agree. If they disagreed, one of them would be quietly
telling you to bet too much.
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from tradeagent import sizing  # noqa: E402


class TestFixedFractional(unittest.TestCase):
    def test_basic_arithmetic(self):
        # $10k account, 2% risk = $200 budget, $50 per contract -> 4 contracts.
        self.assertEqual(sizing.fixed_fractional(10_000, 0.02, 50), 4)

    def test_rounds_down_never_up(self):
        # $200 budget / $60 = 3.33 -> 3, never 4.
        self.assertEqual(sizing.fixed_fractional(10_000, 0.02, 60), 3)

    def test_returns_zero_when_one_contract_is_too_expensive(self):
        self.assertEqual(sizing.fixed_fractional(1_000, 0.02, 500), 0)

    def test_rejects_bad_inputs(self):
        with self.assertRaises(ValueError):
            sizing.fixed_fractional(0, 0.02, 50)
        with self.assertRaises(ValueError):
            sizing.fixed_fractional(10_000, 1.5, 50)     # risk_pct is a fraction
        with self.assertRaises(ValueError):
            sizing.fixed_fractional(10_000, 0.02, 0)


class TestKelly(unittest.TestCase):
    def test_classic_formula(self):
        # 50% chance to win 2x what you risk, else lose the stake. Kelly = 25%.
        self.assertAlmostEqual(sizing.kelly_fraction(0.5, 2.0, 1.0), 0.25, places=9)

    def test_negative_edge_returns_negative_fraction(self):
        """A negative Kelly is the model saying 'do not take this bet'."""
        self.assertLess(sizing.kelly_fraction(0.3, 1.0, 1.0), 0)

    def test_certain_win_goes_all_in(self):
        self.assertAlmostEqual(sizing.kelly_fraction(1.0, 1.0, 1.0), 1.0, places=9)

    def test_empirical_agrees_with_closed_form(self):
        """Independent implementations, same answer — the real cross-check."""
        returns = [2.0] * 5_000 + [-1.0] * 5_000
        self.assertAlmostEqual(sizing.empirical_kelly(returns), 0.25, places=2)

    def test_empirical_handles_asymmetric_option_payoffs(self):
        # Lottery-ticket shape: usually -100%, occasionally +900%.
        # EV is +0.20 per dollar, so the growth-optimal size is positive but tiny.
        returns = [-1.0] * 88 + [9.0] * 12
        f = sizing.empirical_kelly(returns)
        self.assertGreater(f, 0.0)
        self.assertLess(f, 0.15)  # small, because total loss is the common case

    def test_zero_expectancy_means_zero_size(self):
        """-100% x90 and +900% x10 is a fair bet. Fair bets are not worth taking."""
        self.assertEqual(sizing.empirical_kelly([-1.0] * 90 + [9.0] * 10), 0.0)

    def test_empirical_never_risks_ruin_on_a_total_loss_path(self):
        """f must stay below 1/|worst| or a single path takes wealth to zero."""
        self.assertLess(sizing.empirical_kelly([-1.0] * 50 + [3.0] * 50), 1.0)

    def test_empirical_rejects_empty_input(self):
        with self.assertRaises(ValueError):
            sizing.empirical_kelly([])


class TestRiskOfRuin(unittest.TestCase):
    def test_no_risk_when_never_losing(self):
        self.assertEqual(sizing.risk_of_ruin([0.5] * 100, 0.5), 0.0)

    def test_zero_size_is_zero_risk(self):
        self.assertEqual(sizing.risk_of_ruin([-1.0] * 100, 0.0), 0.0)

    def test_rises_monotonically_with_size(self):
        returns = [-1.0] * 60 + [2.0] * 40  # positive expectancy, frequent losses
        small = sizing.risk_of_ruin(returns, 0.02, simulations=2_000)
        large = sizing.risk_of_ruin(returns, 0.25, simulations=2_000)
        self.assertLess(small, large)

    def test_oversizing_a_good_edge_still_ruins_you(self):
        """The whole point of the module: edge does not save you from size."""
        returns = [-1.0] * 50 + [3.0] * 50  # strongly positive expectancy
        self.assertGreater(sizing.risk_of_ruin(returns, 0.6, simulations=2_000), 0.5)

    def test_is_reproducible(self):
        r = [-1.0] * 50 + [2.0] * 50
        self.assertEqual(
            sizing.risk_of_ruin(r, 0.1, simulations=500, seed=1),
            sizing.risk_of_ruin(r, 0.1, simulations=500, seed=1),
        )


class TestRecommendSize(unittest.TestCase):
    POSITIVE = [-1.0] * 55 + [2.0] * 45  # EV = +0.35 per dollar
    NEGATIVE = [-1.0] * 70 + [1.0] * 30  # EV = -0.40 per dollar

    def test_refuses_to_size_a_losing_trade(self):
        rec = sizing.recommend_size(10_000, 500, self.NEGATIVE)
        self.assertEqual(rec.contracts, 0)
        self.assertEqual(rec.method, "no-trade")
        self.assertTrue(rec.warnings)

    def test_sizes_a_winning_trade(self):
        rec = sizing.recommend_size(50_000, 500, self.POSITIVE)
        self.assertGreater(rec.contracts, 0)
        self.assertLessEqual(rec.account_fraction, sizing.MAX_SANE_ACCOUNT_FRACTION)

    def test_never_exceeds_the_hard_ceiling(self):
        """Even with an absurd edge, the 5% cap holds."""
        rec = sizing.recommend_size(100_000, 100, [5.0] * 100)
        self.assertLessEqual(rec.account_fraction, sizing.MAX_SANE_ACCOUNT_FRACTION + 1e-9)

    def test_takes_the_minimum_of_the_methods(self):
        rec = sizing.recommend_size(50_000, 500, self.POSITIVE)
        self.assertIn("min(", rec.method)

    def test_undefined_risk_is_halved_and_warned(self):
        defined = sizing.recommend_size(100_000, 500, self.POSITIVE, defined_risk=True)
        undefined = sizing.recommend_size(100_000, 500, self.POSITIVE, defined_risk=False)
        self.assertLess(undefined.contracts, defined.contracts)
        self.assertTrue(any("Undefined-risk" in w for w in undefined.warnings))

    def test_small_account_large_contract_yields_zero(self):
        rec = sizing.recommend_size(2_000, 1_500, self.POSITIVE)
        self.assertEqual(rec.contracts, 0)

    def test_rejects_bad_inputs(self):
        with self.assertRaises(ValueError):
            sizing.recommend_size(0, 500, self.POSITIVE)
        with self.assertRaises(ValueError):
            sizing.recommend_size(10_000, 0, self.POSITIVE)


if __name__ == "__main__":
    unittest.main(verbosity=2)
