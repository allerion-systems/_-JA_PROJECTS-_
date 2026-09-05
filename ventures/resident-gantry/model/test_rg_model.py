#!/usr/bin/env python3
"""Tests for the RG-1 economics model. Run: python3 test_rg_model.py"""

import copy
import unittest

import rg_model as m


def p():
    return copy.deepcopy(m.SCENARIOS["demo_shop"])


class WallArea(unittest.TestCase):
    def test_demo_shop_area(self):
        # perimeter 2*(120+48)=336 ft, x24 eave = 8064 gross, x0.85 = 6854.4 net
        self.assertAlmostEqual(m.wall_area_sf(p()), 6854.4, places=1)

    def test_zero_openings(self):
        s = p()
        s["opening_frac"] = 0.0
        self.assertAlmostEqual(m.wall_area_sf(s), 8064.0, places=1)

    def test_rejects_nonpositive_dimension(self):
        s = p()
        s["width_ft"] = 0
        with self.assertRaises(ValueError):
            m.wall_area_sf(s)

    def test_rejects_bad_opening_frac(self):
        s = p()
        s["opening_frac"] = 1.0
        with self.assertRaises(ValueError):
            m.wall_area_sf(s)


class Conventional(unittest.TestCase):
    def test_includes_mobile_crane_rental(self):
        c = m.conventional_cost(p())
        self.assertAlmostEqual(c["erection_lifting"], 4.0 * 7500.0)

    def test_total_is_sum_of_parts(self):
        c = m.conventional_cost(p())
        parts = c["walls"] + c["crane"] + c["runway"] + c["erection_lifting"]
        self.assertAlmostEqual(c["total"], parts)


class ResidentGantry(unittest.TestCase):
    def test_no_mobile_crane_line(self):
        self.assertNotIn("erection_lifting", m.rg_cost(p()))

    def test_runway_premium_applied(self):
        r = m.rg_cost(p())
        self.assertAlmostEqual(r["runway"], 60_000.0 * 1.20)

    def test_printed_walls_cost_more_than_cmu(self):
        s = p()
        self.assertGreater(m.rg_cost(s)["walls"], m.conventional_cost(s)["walls"])

    def test_kit_charge_math(self):
        # 160k / (3y * 6 jobs) = 8888.89 + 20d * 900 = 18000 -> 26888.89
        self.assertAlmostEqual(m.kit_charge_per_job(p()), 160_000 / 18 + 18_000, places=2)

    def test_kit_charge_rejects_zero_jobs(self):
        with self.assertRaises(ValueError):
            m.kit_charge_per_job(p(), jobs_per_year=0)


class BreakEven(unittest.TestCase):
    def test_more_jobs_never_raises_rg_cost(self):
        s = p()
        totals = [m.rg_cost(s, jobs_per_year=j)["total"] for j in range(1, 12)]
        self.assertEqual(totals, sorted(totals, reverse=True))

    def test_defaults_never_break_even(self):
        # THE finding of 2026-09-05: at default [E] assumptions utilization
        # cannot close the gap — the printed-wall premium is binding. If this
        # test starts failing because quotes improved, celebrate and update 04.
        self.assertIsNone(m.break_even_jobs_per_year(p()))

    def test_cheaper_printed_walls_unlock_break_even(self):
        # Printed walls 10% cheaper than CMU -> kit amortizes in at ~4 jobs/yr.
        s = p()
        s["printed_wall_premium"] = -0.10
        self.assertEqual(m.break_even_jobs_per_year(s), 4)

    def test_parity_premium_is_negative_at_defaults(self):
        # Steady state at 6 jobs/yr: printed walls must be ~6% cheaper than
        # CMU for parity. Positive would mean printing could cost extra.
        prem = m.wall_premium_for_parity(p())
        self.assertLess(prem, 0)
        self.assertAlmostEqual(prem, -0.059, places=3)

    def test_parity_premium_zero_delta(self):
        # Setting the premium to the parity value makes steady state a wash.
        s = p()
        s["printed_wall_premium"] = m.wall_premium_for_parity(s)
        conv = m.conventional_cost(s)["total"]
        rg = m.rg_cost(s, include_nre=False)["total"]
        self.assertAlmostEqual(rg, conv, places=6)


class Report(unittest.TestCase):
    def test_report_shape_and_consistency(self):
        r = m.report("demo_shop")
        self.assertEqual(
            r["delta_first_building"],
            round(m.rg_cost(p())["total"] - m.conventional_cost(p())["total"]),
        )
        self.assertEqual(
            r["delta_steady_state"],
            r["delta_first_building"] - round(p()["rg_nre"]),
        )
        self.assertEqual(r["wall_area_sf"], 6854)


if __name__ == "__main__":
    unittest.main(verbosity=2)
