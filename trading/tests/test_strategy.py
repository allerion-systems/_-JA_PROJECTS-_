"""Position payoff, break-evens, and risk bounds.

Every case here has a hand-computable answer, which is the point — if the
engine disagrees with arithmetic on a vertical spread, it cannot be trusted
on an iron condor.
"""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from tradeagent import strategy  # noqa: E402
from tradeagent.strategy import UNBOUNDED, Leg, Position  # noqa: E402


class TestLeg(unittest.TestCase):
    def test_option_multiplier_is_100_stock_is_1(self):
        self.assertEqual(Leg("call", 1, 5.0, 100.0, 30).multiplier, 100)
        self.assertEqual(Leg("stock", 100, 50.0).multiplier, 1)

    def test_notional_cost_sign(self):
        self.assertAlmostEqual(Leg("call", 1, 5.0, 100.0, 30).notional_cost, 500.0)
        self.assertAlmostEqual(Leg("call", -1, 5.0, 100.0, 30).notional_cost, -500.0)

    def test_rejects_invalid_legs(self):
        with self.assertRaises(ValueError):
            Leg("call", 0, 5.0, 100.0, 30)          # zero qty
        with self.assertRaises(ValueError):
            Leg("call", 1, 5.0, 0.0, 30)            # no strike
        with self.assertRaises(ValueError):
            Leg("call", 1, -5.0, 100.0, 30)         # negative premium
        with self.assertRaises(ValueError):
            Leg("swap", 1, 5.0, 100.0, 30)          # unknown kind


class TestLongCall(unittest.TestCase):
    """Long 100C at $5. Breakeven 105, max loss $500, upside unbounded."""

    def setUp(self):
        self.pos = strategy.long_call("TEST", 100.0, 100.0, 5.0, 30)
        self.risk = self.pos.risk_profile()

    def test_net_cost_is_a_debit(self):
        self.assertAlmostEqual(self.pos.net_cost, 500.0)
        self.assertFalse(self.pos.is_credit)

    def test_payoff_points(self):
        self.assertAlmostEqual(self.pos.pnl_at_expiry(100.0), -500.0)   # expires ATM
        self.assertAlmostEqual(self.pos.pnl_at_expiry(80.0), -500.0)    # far OTM, same loss
        self.assertAlmostEqual(self.pos.pnl_at_expiry(105.0), 0.0)      # breakeven
        self.assertAlmostEqual(self.pos.pnl_at_expiry(120.0), 1500.0)

    def test_breakeven(self):
        self.assertEqual(len(self.risk.breakevens), 1)
        self.assertAlmostEqual(self.risk.breakevens[0], 105.0, places=6)

    def test_risk_bounds(self):
        self.assertAlmostEqual(self.risk.max_loss, 500.0)
        self.assertEqual(self.risk.max_profit, UNBOUNDED)
        self.assertTrue(self.risk.is_defined_risk)
        self.assertAlmostEqual(self.risk.capital_at_risk, 500.0)


class TestCallVertical(unittest.TestCase):
    """Long 100C @5, short 110C @2. Debit 300, max profit 700, BE 103."""

    def setUp(self):
        self.pos = strategy.vertical("TEST", 100.0, 100.0, 110.0, 5.0, 2.0, 30, "call")
        self.risk = self.pos.risk_profile()

    def test_net_debit(self):
        self.assertAlmostEqual(self.pos.net_cost, 300.0)

    def test_bounds_are_both_defined(self):
        self.assertAlmostEqual(self.risk.max_loss, 300.0)
        self.assertAlmostEqual(self.risk.max_profit, 700.0)
        self.assertTrue(self.risk.is_defined_risk)

    def test_breakeven(self):
        self.assertAlmostEqual(self.risk.breakevens[0], 103.0, places=6)

    def test_payoff_caps_above_short_strike(self):
        self.assertAlmostEqual(self.pos.pnl_at_expiry(110.0), 700.0)
        self.assertAlmostEqual(self.pos.pnl_at_expiry(200.0), 700.0)  # capped

    def test_reward_to_risk(self):
        self.assertAlmostEqual(self.risk.reward_to_risk, 700.0 / 300.0, places=9)


class TestCoveredCall(unittest.TestCase):
    """100 shares @100 plus short 105C @3. Max profit 800, BE 97."""

    def setUp(self):
        self.pos = strategy.covered_call("TEST", 100.0, 105.0, 3.0, 30)
        self.risk = self.pos.risk_profile()

    def test_net_cost_is_stock_less_premium(self):
        self.assertAlmostEqual(self.pos.net_cost, 9700.0)

    def test_max_profit_is_capped_at_the_short_strike(self):
        self.assertAlmostEqual(self.risk.max_profit, 800.0)
        self.assertAlmostEqual(self.pos.pnl_at_expiry(200.0), 800.0)

    def test_breakeven_is_basis_less_premium(self):
        self.assertAlmostEqual(self.risk.breakevens[0], 97.0, places=6)

    def test_downside_is_the_stock(self):
        self.assertAlmostEqual(self.risk.max_loss, 9700.0)
        self.assertAlmostEqual(self.pos.pnl_at_expiry(0.0), -9700.0)


class TestCashSecuredPut(unittest.TestCase):
    """Short 95P @2. Credit 200, BE 93, loss grows as the stock falls."""

    def setUp(self):
        self.pos = strategy.cash_secured_put("TEST", 100.0, 95.0, 2.0, 30)
        self.risk = self.pos.risk_profile()

    def test_is_a_credit(self):
        self.assertAlmostEqual(self.pos.net_cost, -200.0)
        self.assertTrue(self.pos.is_credit)

    def test_max_profit_is_the_credit(self):
        self.assertAlmostEqual(self.risk.max_profit, 200.0)
        self.assertAlmostEqual(self.pos.pnl_at_expiry(120.0), 200.0)

    def test_breakeven(self):
        self.assertAlmostEqual(self.risk.breakevens[0], 93.0, places=6)

    def test_worst_case_is_stock_to_zero(self):
        self.assertAlmostEqual(self.risk.max_loss, 9300.0)


class TestIronCondor(unittest.TestCase):
    """90/95/105/110 for a net credit of 200. Max loss 300."""

    def setUp(self):
        self.pos = strategy.iron_condor("TEST", 100.0, 90.0, 95.0, 105.0, 110.0, (1.0, 2.0, 2.0, 1.0), 30)
        self.risk = self.pos.risk_profile()

    def test_net_credit(self):
        self.assertAlmostEqual(self.pos.net_cost, -200.0)

    def test_max_profit_between_the_shorts(self):
        self.assertAlmostEqual(self.risk.max_profit, 200.0)
        self.assertAlmostEqual(self.pos.pnl_at_expiry(100.0), 200.0)

    def test_max_loss_is_width_minus_credit(self):
        self.assertAlmostEqual(self.risk.max_loss, 300.0)
        self.assertAlmostEqual(self.pos.pnl_at_expiry(80.0), -300.0)
        self.assertAlmostEqual(self.pos.pnl_at_expiry(120.0), -300.0)

    def test_two_breakevens(self):
        self.assertEqual(len(self.risk.breakevens), 2)
        self.assertAlmostEqual(self.risk.breakevens[0], 93.0, places=6)
        self.assertAlmostEqual(self.risk.breakevens[1], 107.0, places=6)


class TestUndefinedRisk(unittest.TestCase):
    def test_naked_short_call_is_flagged_unbounded(self):
        pos = Position([Leg("call", -1, 3.0, 105.0, 30)], "TEST", 100.0)
        risk = pos.risk_profile()
        self.assertEqual(risk.max_loss, UNBOUNDED)
        self.assertFalse(risk.is_defined_risk)

    def test_unbounded_position_sizes_off_the_debit_not_a_fiction(self):
        pos = Position([Leg("call", -1, 3.0, 105.0, 30)], "TEST", 100.0)
        self.assertEqual(pos.risk_profile().capital_at_risk, 0.0)  # net credit, no debit paid


class TestBeforeExpiry(unittest.TestCase):
    def test_time_decay_erodes_a_long_call_that_goes_nowhere(self):
        pos = strategy.long_call("TEST", 100.0, 105.0, 3.0, 30)
        at_entry = pos.pnl_before_expiry(100.0, 0.0, 0.35)
        after_20_days = pos.pnl_before_expiry(100.0, 20.0, 0.35)
        self.assertLess(after_20_days, at_entry)

    def test_iv_crush_loses_money_even_when_direction_is_right(self):
        """The single most common way a retail options trade fails."""
        pos = strategy.long_call("TEST", 100.0, 105.0, 6.0, 30)
        # Stock rallies 4%, but IV collapses from 80% to 30% the next day.
        crushed = pos.pnl_before_expiry(104.0, 1.0, 0.30)
        self.assertLess(crushed, 0.0)

    def test_position_rejects_empty_legs(self):
        with self.assertRaises(ValueError):
            Position([], "TEST", 100.0)


class TestNetGreeks(unittest.TestCase):
    def test_long_call_is_positive_delta_negative_theta(self):
        g = strategy.long_call("TEST", 100.0, 100.0, 5.0, 30).net_greeks(100.0, 0.30)
        self.assertGreater(g["delta"], 0)
        self.assertLess(g["theta"], 0)
        self.assertGreater(g["vega"], 0)

    def test_credit_spread_is_positive_theta(self):
        pos = strategy.iron_condor("TEST", 100.0, 90.0, 95.0, 105.0, 110.0, (1.0, 2.0, 2.0, 1.0), 30)
        self.assertGreater(pos.net_greeks(100.0, 0.30)["theta"], 0)

    def test_covered_call_delta_includes_the_shares(self):
        g = strategy.covered_call("TEST", 100.0, 105.0, 3.0, 30).net_greeks(100.0, 0.30)
        self.assertGreater(g["delta"], 0)
        self.assertLess(g["delta"], 100)  # short call offsets some of the 100 shares


if __name__ == "__main__":
    unittest.main(verbosity=2)
