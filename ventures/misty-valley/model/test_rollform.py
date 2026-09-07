"""Tests for rollform. Run: python3 test_rollform.py"""

from __future__ import annotations

import math
import sys

import rollform as R

FAILURES: list[str] = []


def check(label: str, got, want, tol: float = 1e-6) -> None:
    if isinstance(want, float) and math.isinf(want):
        ok = got == want          # inf - inf is NaN, so compare directly
    elif isinstance(want, float):
        ok = abs(got - want) <= tol
    else:
        ok = got == want
    if not ok:
        FAILURES.append(f"{label}: got {got!r}, want {want!r}")


def test_developed_width_sums_the_flat_blank() -> None:
    """The coil has to be slit to the flattened-out width of the section.
    Get this wrong and you order the wrong coil."""
    p = R.Profile("t", web_in=3.625, flange_in=1.25, lip_in=0.1875,
                  mils=18, weight_lb_per_ft=0.40)
    expected = 3.625 + 2 * 1.25 + 2 * 0.1875 + 4 * 0.0625
    check("stud developed width", p.developed_width_in, expected)


def test_track_has_no_return_lips_so_needs_narrower_coil() -> None:
    stud = R.Profile("s", 3.625, 1.25, 0.1875, 18, 0.40)
    track = R.Profile("t", 3.625, 1.25, 0.0, 18, 0.39)
    if track.developed_width_in >= stud.developed_width_in:
        FAILURES.append("track should need narrower coil than stud")


def test_every_profile_needs_its_own_coil_width() -> None:
    """The SKU-explosion problem, asserted: the shipped profile list must
    not collapse to one or two coil widths, because that is the whole
    inventory argument against roll-forming at small scale."""
    widths = {round(p.developed_width_in, 3) for p in R.PROFILES}
    if len(widths) < 4:
        FAILURES.append(
            f"expected many distinct coil widths, got {len(widths)}"
        )


def test_scrap_credit_reduces_but_does_not_erase_yield_loss() -> None:
    p = R.Profile("t", 3.625, 1.25, 0.1875, 18, 1.00)  # 1 lb/ft for easy math
    lossy = R.CoilEconomics(price_per_lb=1.00, yield_loss_pct=0.10,
                            scrap_credit_per_lb=0.20)
    # 1 lb of steel at $1, plus 0.10 lb wasted recovered at $0.20 => $1.08
    check("steel cost with scrap credit", lossy.steel_cost_per_lf(p), 1.08)

    perfect = R.CoilEconomics(price_per_lb=1.00, yield_loss_pct=0.0)
    check("no yield loss", perfect.steel_cost_per_lf(p), 1.00)


def test_buy_price_scales_with_profile_weight() -> None:
    """A flat buy price across profiles was the bug in the first version of
    this model: it made heavy structural studs look uneconomic to make and
    light studs look free. Buy price must track steel content."""
    coil = R.CoilEconomics(price_per_lb=0.67)
    buy = R.BuyEconomics()
    light = R.Profile("light", 2.5, 1.25, 0.1875, 18, 0.32)
    heavy = R.Profile("heavy", 6.0, 1.625, 0.1875, 33, 1.16)
    if buy.buy_cost_per_lf(heavy, coil) <= buy.buy_cost_per_lf(light, coil):
        FAILURES.append("heavier profile must cost more to buy")


def test_conversion_cost_falls_as_volume_rises() -> None:
    """The central finding: the line's labour is fixed, so cost per foot is
    set by how much you run, not by how fast the machine can go."""
    line = R.LineEconomics()
    low = line.conversion_cost_per_lf(1_140_000)    # 1 load/month
    high = line.conversion_cost_per_lf(11_400_000)  # 10 loads/month
    if low <= high:
        FAILURES.append("conversion cost per foot must fall with volume")
    if low < high * 3:
        FAILURES.append(
            "at a tenth the volume the fixed cost should dominate far more"
        )


def test_conversion_cost_approaches_variable_cost_at_scale() -> None:
    line = R.LineEconomics()
    huge = line.conversion_cost_per_lf(1e9)
    check("approaches variable cost", huge, line.variable_cost_per_lf, tol=1e-3)


def test_zero_volume_does_not_divide_by_zero() -> None:
    line = R.LineEconomics()
    if line.conversion_cost_per_lf(0) != float("inf"):
        FAILURES.append("zero volume should be infinite cost, not a crash")


def test_fixed_cost_includes_more_than_the_operators() -> None:
    """Someone has to own product quality once you are the manufacturer.
    A model that counts only line operators understates the commitment."""
    line = R.LineEconomics()
    operators_only = line.operators * line.labor_rate_loaded * line.hours_per_fte
    if line.annual_fixed_cost <= operators_only:
        FAILURES.append("fixed cost must include supervision and QC overhead")


def test_spread_is_positive_at_scale_and_thin_at_low_volume() -> None:
    coil, line, buy = R.CoilEconomics(), R.LineEconomics(), R.BuyEconomics()
    p = R.PROFILES[0]
    low = R.compare(p, coil, line, buy, 1_140_000)
    high = R.compare(p, coil, line, buy, 11_400_000)
    if high.spread_per_lf <= low.spread_per_lf:
        FAILURES.append("spread should widen with volume")
    if low.spread_per_lf >= high.spread_per_lf * 0.5:
        FAILURES.append(
            "at a tenth the volume the spread should be much thinner"
        )


def test_breakeven_solves_rather_than_divides() -> None:
    """Breakeven must account for the line's fixed cost as well as
    depreciation -- dividing depreciation by a spread that already nets off
    fixed cost double-counts and understates the volume required."""
    coil, line, buy = R.CoilEconomics(), R.LineEconomics(), R.BuyEconomics()
    inv = R.MachineInvestment()
    be = R.breakeven_loads_per_month(coil, line, buy, inv, R.PROFILES[0])
    if be <= 0 or be == float("inf"):
        FAILURES.append(f"implausible breakeven: {be}")

    # At exactly breakeven, spread x volume should equal depreciation.
    lf = be * 12 * R.LF_PER_LOAD
    r = R.compare(R.PROFILES[0], coil, line, buy, lf)
    check("breakeven identity", r.spread_per_lf * lf,
          inv.annual_depreciation, tol=1.0)


def test_breakeven_is_infinite_when_making_cannot_win() -> None:
    coil = R.CoilEconomics(price_per_lb=5.00)   # absurdly dear coil
    line, inv = R.LineEconomics(), R.MachineInvestment()
    buy = R.BuyEconomics(mill_multiple=1.0, distributor_adder_per_lf=0.0)
    be = R.breakeven_loads_per_month(coil, line, buy, inv, R.PROFILES[0])
    check("no volume saves it", be, float("inf"))


def test_capacity_shows_the_line_is_oversized_for_the_plan() -> None:
    """The plan's year-3 run rate is 5 loads/month. A modern line should be
    materially underused at that volume -- that is the finding, so assert
    it rather than leave it to the reader."""
    line = R.LineEconomics()
    c = R.capacity(line, 5)
    if c.utilization_pct > 70:
        FAILURES.append(
            f"expected the line underused at 5 loads/mo, got "
            f"{c.utilization_pct:.0f}%"
        )
    if c.utilization_pct <= 0:
        FAILURES.append("utilisation should be positive")


def test_investment_total_is_more_than_the_machine() -> None:
    inv = R.MachineInvestment(machine=400_000.0)
    if inv.total <= inv.machine:
        FAILURES.append("installed cost must exceed the machine price")
    check("depreciation", inv.annual_depreciation, inv.total / inv.life_years)


def main() -> int:
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        try:
            t()
        except Exception as exc:  # noqa: BLE001
            FAILURES.append(f"{t.__name__}: raised {exc!r}")
    if FAILURES:
        print(f"FAILED ({len(FAILURES)} checks failed):")
        for f in FAILURES:
            print(f"  - {f}")
        return 1
    print(f"ok - {len(tests)} tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
