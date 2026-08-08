"""Pricing correctness.

Black-Scholes is easy to get subtly wrong in a way that still looks
plausible, so these tests pin it three independent ways: a published
reference value, put-call parity (which must hold by arbitrage regardless of
the formula), and every Greek against a finite-difference of the price
function itself.
"""

import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from tradeagent import pricing  # noqa: E402


class TestReferenceValues(unittest.TestCase):
    """S=100, K=100, T=1, r=5%, v=20%, q=0 is the canonical textbook case."""

    S, K, T, R, V = 100.0, 100.0, 1.0, 0.05, 0.20

    def test_call_matches_published_value(self):
        self.assertAlmostEqual(pricing.price(self.S, self.K, self.T, self.R, self.V, "call"), 10.450584, places=5)

    def test_put_matches_published_value(self):
        self.assertAlmostEqual(pricing.price(self.S, self.K, self.T, self.R, self.V, "put"), 5.573526, places=5)

    def test_norm_cdf_known_points(self):
        self.assertAlmostEqual(pricing.norm_cdf(0.0), 0.5, places=12)
        self.assertAlmostEqual(pricing.norm_cdf(1.96), 0.975002, places=6)


class TestPutCallParity(unittest.TestCase):
    """C - P = S*e^(-qT) - K*e^(-rT). Holds by arbitrage, not by model."""

    def test_parity_across_a_grid(self):
        for S in (50.0, 100.0, 150.0):
            for K in (80.0, 100.0, 120.0):
                for T in (0.08, 1.0, 2.5):
                    for v in (0.15, 0.60):
                        for q in (0.0, 0.03):
                            c = pricing.price(S, K, T, 0.05, v, "call", q)
                            p = pricing.price(S, K, T, 0.05, v, "put", q)
                            expected = S * math.exp(-q * T) - K * math.exp(-0.05 * T)
                            self.assertAlmostEqual(c - p, expected, places=9, msg=f"S={S} K={K} T={T} v={v} q={q}")


class TestDegenerateCases(unittest.TestCase):
    def test_zero_time_gives_intrinsic(self):
        self.assertAlmostEqual(pricing.price(120.0, 100.0, 0.0, 0.05, 0.3, "call"), 20.0, places=9)
        self.assertAlmostEqual(pricing.price(80.0, 100.0, 0.0, 0.05, 0.3, "call"), 0.0, places=9)
        self.assertAlmostEqual(pricing.price(80.0, 100.0, 0.0, 0.05, 0.3, "put"), 20.0, places=9)

    def test_zero_vol_gives_discounted_intrinsic(self):
        got = pricing.price(100.0, 90.0, 1.0, 0.05, 0.0, "call")
        self.assertAlmostEqual(got, 100.0 - 90.0 * math.exp(-0.05), places=9)

    def test_expired_option_greeks_are_a_step(self):
        g = pricing.greeks(120.0, 100.0, 0.0, 0.05, 0.3, "call")
        self.assertEqual(g.delta, 1.0)
        self.assertEqual(g.gamma, 0.0)
        self.assertEqual(g.theta, 0.0)

    def test_price_is_never_below_intrinsic_for_calls(self):
        for S in (60.0, 100.0, 140.0):
            p = pricing.price(S, 100.0, 0.5, 0.05, 0.25, "call")
            self.assertGreaterEqual(p + 1e-9, pricing.intrinsic(S, 100.0, "call"))

    def test_rejects_bad_inputs(self):
        with self.assertRaises(ValueError):
            pricing.price(-1.0, 100.0, 1.0, 0.05, 0.2, "call")
        with self.assertRaises(ValueError):
            pricing.price(100.0, 0.0, 1.0, 0.05, 0.2, "call")
        with self.assertRaises(ValueError):
            pricing.price(100.0, 100.0, 1.0, 0.05, 0.2, "banana")


class TestMonotonicity(unittest.TestCase):
    def test_call_rises_with_spot(self):
        prices = [pricing.price(s, 100.0, 0.5, 0.04, 0.3, "call") for s in (80, 90, 100, 110, 120)]
        self.assertEqual(prices, sorted(prices))

    def test_both_rise_with_volatility(self):
        for kind in ("call", "put"):
            prices = [pricing.price(100.0, 100.0, 0.5, 0.04, v, kind) for v in (0.1, 0.2, 0.4, 0.8)]
            self.assertEqual(prices, sorted(prices), msg=kind)


class TestGreeksAgainstFiniteDifference(unittest.TestCase):
    """Every Greek is a derivative of price. Bump the input, check the output."""

    CASES = [
        (100.0, 100.0, 0.5, 0.04, 0.30, 0.0),
        (110.0, 100.0, 1.0, 0.05, 0.25, 0.02),
        (85.0, 100.0, 0.25, 0.03, 0.55, 0.0),
    ]

    def test_delta(self):
        h = 1e-4
        for S, K, T, r, v, q in self.CASES:
            for kind in ("call", "put"):
                num = (pricing.price(S + h, K, T, r, v, kind, q) - pricing.price(S - h, K, T, r, v, kind, q)) / (2 * h)
                self.assertAlmostEqual(pricing.greeks(S, K, T, r, v, kind, q).delta, num, places=6)

    def test_gamma(self):
        h = 1e-3
        for S, K, T, r, v, q in self.CASES:
            for kind in ("call", "put"):
                num = (
                    pricing.price(S + h, K, T, r, v, kind, q)
                    - 2 * pricing.price(S, K, T, r, v, kind, q)
                    + pricing.price(S - h, K, T, r, v, kind, q)
                ) / (h * h)
                self.assertAlmostEqual(pricing.greeks(S, K, T, r, v, kind, q).gamma, num, places=5)

    def test_vega_is_per_vol_point(self):
        h = 1e-5
        for S, K, T, r, v, q in self.CASES:
            for kind in ("call", "put"):
                # d(price)/d(vol) scaled to 1 point = 0.01 of vol
                num = (pricing.price(S, K, T, r, v + h, kind, q) - pricing.price(S, K, T, r, v - h, kind, q)) / (2 * h)
                self.assertAlmostEqual(pricing.greeks(S, K, T, r, v, kind, q).vega, num / 100.0, places=6)

    def test_theta_is_per_calendar_day(self):
        """Theta is the instantaneous derivative, so compare against a central
        difference in T — a full-day secant carries its own truncation error."""
        h = 1e-6
        for S, K, T, r, v, q in self.CASES:
            for kind in ("call", "put"):
                # Time moving forward = time to expiry shrinking, hence the sign.
                per_year = -(pricing.price(S, K, T + h, r, v, kind, q)
                             - pricing.price(S, K, T - h, r, v, kind, q)) / (2 * h)
                self.assertAlmostEqual(pricing.greeks(S, K, T, r, v, kind, q).theta, per_year / 365.0, places=8)

    def test_rho_is_per_rate_point(self):
        h = 1e-6
        for S, K, T, r, v, q in self.CASES:
            for kind in ("call", "put"):
                num = (pricing.price(S, K, T, r + h, v, kind, q) - pricing.price(S, K, T, r - h, v, kind, q)) / (2 * h)
                self.assertAlmostEqual(pricing.greeks(S, K, T, r, v, kind, q).rho, num / 100.0, places=6)

    def test_long_call_theta_is_negative(self):
        self.assertLess(pricing.greeks(100.0, 100.0, 0.1, 0.04, 0.4, "call").theta, 0)

    def test_per_contract_scales_by_100(self):
        g = pricing.greeks(100.0, 100.0, 0.5, 0.04, 0.3, "call")
        self.assertAlmostEqual(g.per_contract().delta, g.delta * 100, places=9)


class TestImpliedVol(unittest.TestCase):
    def test_round_trips_wherever_vol_is_identifiable(self):
        """Skips the cases where the price genuinely carries no vol information,
        rather than pretending the solver can recover a number that is not there."""
        tested = 0
        for K in (70.0, 100.0, 130.0):
            for T in (0.05, 0.5, 2.0):
                for true_v in (0.12, 0.35, 0.90):
                    for kind in ("call", "put"):
                        mkt = pricing.price(100.0, K, T, 0.04, true_v, kind)
                        try:
                            got = pricing.implied_vol(mkt, 100.0, K, T, 0.04, kind)
                        except ValueError as exc:
                            self.assertIn("not identifiable", str(exc))
                            continue
                        tested += 1
                        self.assertAlmostEqual(got, true_v, places=4, msg=f"K={K} T={T} v={true_v} {kind}")
        self.assertGreater(tested, 40, "most of the grid should be identifiable")

    def test_deep_otm_converges_when_still_identifiable(self):
        """Where vega is small and naive Newton-Raphson diverges, but the price
        still carries information."""
        mkt = pricing.price(100.0, 140.0, 0.25, 0.04, 0.45, "call")
        self.assertAlmostEqual(pricing.implied_vol(mkt, 100.0, 140.0, 0.25, 0.04, "call"), 0.45, places=4)

    def test_refuses_to_invent_a_vol_it_cannot_recover(self):
        """A 200-strike call 18 days out is worth ~1e-12 at ANY volatility.
        Returning a confident number here would be fabrication."""
        mkt = pricing.price(100.0, 200.0, 0.05, 0.04, 0.45, "call")
        with self.assertRaises(ValueError) as ctx:
            pricing.implied_vol(mkt, 100.0, 200.0, 0.05, 0.04, "call")
        self.assertIn("not identifiable", str(ctx.exception))

    def test_deep_itm_is_also_refused(self):
        mkt = pricing.price(100.0, 70.0, 0.05, 0.04, 0.12, "call")
        with self.assertRaises(ValueError):
            pricing.implied_vol(mkt, 100.0, 70.0, 0.05, 0.04, "call")

    def test_rejects_arbitrage_violating_prices(self):
        with self.assertRaises(ValueError):
            pricing.implied_vol(0.01, 150.0, 100.0, 1.0, 0.04, "call")  # below intrinsic
        with self.assertRaises(ValueError):
            pricing.implied_vol(500.0, 100.0, 100.0, 1.0, 0.04, "call")  # above spot

    def test_rejects_expired(self):
        with self.assertRaises(ValueError):
            pricing.implied_vol(5.0, 100.0, 100.0, 0.0, 0.04, "call")


if __name__ == "__main__":
    unittest.main(verbosity=2)
