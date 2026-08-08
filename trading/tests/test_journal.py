"""Journal storage, stats, and leak detection.

Leak detection has to be conservative — a tool that reports a "pattern" from
four trades trains you to trust noise. These tests pin the sample threshold
as hard as they pin the arithmetic.
"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from tradeagent import verdict  # noqa: E402
from tradeagent.journal import Journal, Trade  # noqa: E402
from tradeagent.strategy import long_call  # noqa: E402


def make_trade(pnl: float, **kw) -> Trade:
    base = dict(
        symbol="TEST", structure="long-call", pnl=pnl,
        opened="2026-01-05T10:30:00", closed="2026-01-08T15:00:00",
        capital_at_risk=500.0,
    )
    base.update(kw)
    return Trade(**base)


class TestTrade(unittest.TestCase):
    def test_win_flag_and_return_on_risk(self):
        t = make_trade(250.0)
        self.assertTrue(t.is_win)
        self.assertAlmostEqual(t.return_on_risk, 0.5)

    def test_hold_days(self):
        self.assertAlmostEqual(make_trade(0.0).hold_days, 3.1875, places=4)

    def test_missing_dates_do_not_crash(self):
        self.assertIsNone(make_trade(0.0, opened="", closed="").hold_days)

    def test_validates_conviction_and_symbol(self):
        with self.assertRaises(ValueError):
            make_trade(0.0, conviction=9)
        with self.assertRaises(ValueError):
            make_trade(0.0, symbol="")


class TestJournalIO(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "nested" / "trades.jsonl"

    def tearDown(self):
        self.tmp.cleanup()

    def test_record_creates_parent_dirs_and_round_trips(self):
        j = Journal(self.path)
        j.record(make_trade(100.0, notes="first"))
        j.record(make_trade(-50.0, notes="second"))
        loaded = Journal(self.path).load()
        self.assertEqual(len(loaded), 2)
        self.assertEqual(loaded[0].notes, "first")
        self.assertAlmostEqual(loaded[1].pnl, -50.0)

    def test_missing_file_is_empty_not_an_error(self):
        self.assertEqual(Journal(self.path).load(), [])

    def test_one_corrupt_line_does_not_break_the_journal(self):
        self.path.parent.mkdir(parents=True)
        self.path.write_text(
            json.dumps({"symbol": "A", "structure": "csp", "pnl": 10.0, "opened": "2026-01-01T10:00:00"}) + "\n"
            + "{ not json at all\n"
            + "\n"
            + json.dumps({"symbol": "B", "structure": "csp", "pnl": 20.0, "opened": "2026-01-02T10:00:00"}) + "\n"
        )
        self.assertEqual(len(Journal(self.path).load()), 2)

    def test_cache_invalidates_on_write(self):
        j = Journal(self.path)
        j.record(make_trade(100.0))
        self.assertEqual(len(j.load()), 1)
        j.record(make_trade(200.0))
        self.assertEqual(len(j.load()), 2)


class TestStats(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.j = Journal(Path(self.tmp.name) / "t.jsonl")
        for pnl in (100.0, 200.0, -50.0, -150.0):
            self.j.record(make_trade(pnl))

    def tearDown(self):
        self.tmp.cleanup()

    def test_arithmetic(self):
        s = self.j.stats()
        self.assertEqual(s.count, 4)
        self.assertEqual(s.wins, 2)
        self.assertEqual(s.losses, 2)
        self.assertAlmostEqual(s.total_pnl, 100.0)
        self.assertAlmostEqual(s.win_rate, 0.5)
        self.assertAlmostEqual(s.avg_win, 150.0)
        self.assertAlmostEqual(s.avg_loss, 100.0)
        self.assertAlmostEqual(s.expectancy, 25.0)
        self.assertAlmostEqual(s.profit_factor, 300.0 / 200.0)
        self.assertAlmostEqual(s.largest_loss, 150.0)
        self.assertAlmostEqual(s.payoff_ratio, 1.5)

    def test_empty_journal_is_all_zeros(self):
        with tempfile.TemporaryDirectory() as d:
            self.assertEqual(Journal(Path(d) / "none.jsonl").stats().count, 0)


class TestGrouping(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.j = Journal(Path(self.tmp.name) / "t.jsonl")
        self.j.record(make_trade(100.0, structure="csp", tags=["income"], exit_reason="plan"))
        self.j.record(make_trade(-300.0, structure="long-call", tags=["yolo"], exit_reason="panic"))
        self.j.record(make_trade(-200.0, structure="long-call", tags=["yolo"], exit_reason="expiry"))

    def tearDown(self):
        self.tmp.cleanup()

    def test_group_by_structure(self):
        g = self.j.group_by("structure")
        self.assertEqual(g["csp"].count, 1)
        self.assertEqual(g["long-call"].count, 2)
        self.assertAlmostEqual(g["long-call"].total_pnl, -500.0)

    def test_group_by_tag_expands_lists(self):
        self.assertEqual(self.j.group_by("tag")["yolo"].count, 2)

    def test_group_by_weekday_and_hold_bucket(self):
        self.assertIn("Monday", self.j.group_by("weekday"))
        self.assertIn("1-7d", self.j.group_by("hold_bucket"))

    def test_untagged_trades_are_bucketed_not_dropped(self):
        self.j.record(make_trade(10.0, tags=[]))
        self.assertEqual(self.j.group_by("tag")["untagged"].count, 1)

    def test_unknown_key_raises(self):
        with self.assertRaises(ValueError):
            self.j.group_by("astrology")


class TestLeakDetection(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = Path(self.tmp.name) / "t.jsonl"

    def tearDown(self):
        self.tmp.cleanup()

    def test_refuses_to_guess_from_a_small_sample(self):
        j = Journal(self.path)
        for _ in range(3):
            j.record(make_trade(-100.0))
        self.assertEqual(j.leaks()[0]["leak"], "insufficient-data")

    def test_finds_a_real_losing_subgroup(self):
        j = Journal(self.path)
        for _ in range(10):
            j.record(make_trade(200.0, structure="csp", exit_reason="plan"))
        for _ in range(10):
            j.record(make_trade(-300.0, structure="long-call", exit_reason="panic"))
        found = {leak["leak"] for leak in j.leaks()}
        # Both labels describe the SAME ten trades, so only the more
        # actionable one is reported — you can change an exit rule.
        self.assertIn("exit_reason=panic", found)
        self.assertNotIn("structure=long-call", found)

    def test_reports_both_when_the_groups_are_genuinely_different(self):
        """Dedup must not hide a second, distinct leak."""
        j = Journal(self.path)
        for _ in range(12):
            j.record(make_trade(300.0, structure="csp", exit_reason="expiry"))
        for _ in range(10):
            j.record(make_trade(-400.0, structure="long-call", exit_reason="expiry"))
        for _ in range(10):
            j.record(make_trade(-400.0, structure="csp", exit_reason="panic"))
        found = {leak["leak"] for leak in j.leaks()}
        self.assertIn("exit_reason=panic", found)
        self.assertIn("structure=long-call", found)

    def test_ignores_a_group_only_marginally_worse_than_baseline(self):
        """Being a hair below average is variance, not a leak."""
        j = Journal(self.path)
        for _ in range(20):
            j.record(make_trade(-100.0, structure="csp"))
        for _ in range(10):
            j.record(make_trade(-104.0, structure="vertical"))  # ~4% worse
        self.assertNotIn("structure=vertical", {leak["leak"] for leak in j.leaks()})

    def test_caps_the_number_reported(self):
        j = Journal(self.path)
        for i in range(12):
            j.record(make_trade(500.0, symbol=f"WIN{i}", structure="csp"))
        for i in range(9):
            for _ in range(9):
                j.record(make_trade(-500.0, symbol=f"BAD{i}", structure=f"struct{i}",
                                    exit_reason=f"reason{i}"))
        leaks = j.leaks()
        self.assertLessEqual(len([x for x in leaks if x["leak"] != "truncated"]), 6)
        self.assertEqual(leaks[-1]["leak"], "truncated")

    def test_worst_leak_is_reported_first(self):
        j = Journal(self.path)
        for _ in range(10):
            j.record(make_trade(500.0, structure="csp"))
        for _ in range(10):
            j.record(make_trade(-50.0, structure="vertical"))
        for _ in range(10):
            j.record(make_trade(-400.0, structure="long-call"))
        leaks = [x for x in j.leaks() if x["leak"].startswith("structure=")]
        self.assertEqual(leaks[0]["leak"], "structure=long-call")

    def test_reports_none_found_when_everything_wins(self):
        j = Journal(self.path)
        for _ in range(12):
            j.record(make_trade(100.0))
        self.assertEqual(j.leaks()[0]["leak"], "none-found")

    def test_small_subgroups_are_excluded_from_a_large_journal(self):
        """A 3-trade losing streak in a 40-trade journal is not a pattern."""
        j = Journal(self.path)
        for _ in range(40):
            j.record(make_trade(100.0, symbol="AAA"))
        for _ in range(3):
            j.record(make_trade(-900.0, symbol="ZZZ"))
        self.assertNotIn("symbol=ZZZ", {leak["leak"] for leak in j.leaks()})


class TestVerdictIntegration(unittest.TestCase):
    """End-to-end: the whole pipeline has to actually run and be coherent."""

    def test_lottery_ticket_is_rejected(self):
        # Deep OTM, short-dated, expensive: every check should complain.
        pos = long_call("TEST", 100.0, 130.0, 2.50, 7)
        v = verdict.evaluate(pos, account=10_000, vol=0.90, historical_vol=0.35, paths=4_000)
        self.assertEqual(v.recommendation, "DO NOT TRADE")
        self.assertTrue(v.failures)
        self.assertIn("Required move", [c.name for c in v.checks])

    def test_naked_short_is_flagged_undefined_risk(self):
        from tradeagent.strategy import Leg, Position
        pos = Position([Leg("call", -1, 3.0, 105.0, 30)], "TEST", 100.0)
        v = verdict.evaluate(pos, account=50_000, vol=0.30, paths=4_000)
        failed = [c.name for c in v.failures]
        self.assertIn("Defined risk", failed)

    def test_report_renders_without_error(self):
        pos = long_call("TEST", 100.0, 102.0, 3.0, 45)
        text = verdict.evaluate(pos, account=25_000, vol=0.30, historical_vol=0.28, paths=2_000).report()
        self.assertIn("VERDICT", text)
        self.assertIn("SIZING", text)
        self.assertIn("does not place orders", text)

    def test_rejects_a_zero_account(self):
        with self.assertRaises(ValueError):
            verdict.evaluate(long_call("TEST", 100.0, 105.0, 3.0, 30), account=0, paths=500)


if __name__ == "__main__":
    unittest.main(verbosity=2)
