"""Tests for container_model. Run: python3 test_container_model.py"""

from __future__ import annotations

import sys

from container_model import (
    CashCycle,
    ContainerScenario,
    ConversionCosts,
    DutyRates,
    LogisticsCosts,
    StudSpec,
    UserFees,
    compute_capacity,
    compute_landed_cost,
    compute_working_capital,
    load_scenarios,
)

FAILURES: list[str] = []


def check(label: str, got, want, tol: float = 0.01) -> None:
    ok = abs(got - want) <= tol if isinstance(want, float) else got == want
    if not ok:
        FAILURES.append(f"{label}: got {got!r}, want {want!r}")


def test_duty_stacks_additively_on_customs_value() -> None:
    """Each trade action applies to the entered value, not compounded."""
    s = ContainerScenario(
        name="t",
        fob_invoice_value=10_000.0,
        duty=DutyRates(mfn=0.02, section_232=0.50, section_301=0.25),
    )
    r = compute_landed_cost(s)
    check("total_duty", r.total_duty, 7_700.0)
    check("effective_rate", r.effective_duty_rate_pct, 77.0)


def test_ocean_freight_is_not_duty_bearing() -> None:
    """US customs value excludes international freight. Doubling freight must
    not change a single dollar of duty -- only total cost."""
    base = ContainerScenario(
        name="t",
        fob_invoice_value=10_000.0,
        duty=DutyRates(section_232=0.50),
        logistics=LogisticsCosts(ocean_freight=3_000.0),
    )
    doubled = ContainerScenario(
        name="t",
        fob_invoice_value=10_000.0,
        duty=DutyRates(section_232=0.50),
        logistics=LogisticsCosts(ocean_freight=6_000.0),
    )
    rb, rd = compute_landed_cost(base), compute_landed_cost(doubled)
    check("duty unchanged", rd.total_duty, rb.total_duty)
    check("cost up by freight", rd.duty_paid_cost - rb.duty_paid_cost, 3_000.0)


def test_mpf_is_capped_and_floored() -> None:
    fees = UserFees()
    check("mpf floor", fees.mpf(1_000.0), fees.mpf_min)
    check("mpf cap", fees.mpf(10_000_000.0), fees.mpf_max)
    # mid-range is ad valorem
    check("mpf ad valorem", fees.mpf(100_000.0), 100_000.0 * fees.mpf_rate)


def test_scrap_loss_scales_with_material_cost() -> None:
    """Offcut loss is a fraction of what the material cost, so a pricier
    container loses more dollars at the same scrap rate."""
    conv = ConversionCosts(cut_shop_labor=500.0, scrap_loss_pct=0.05)
    check("cheap material", conv.total(10_000.0), 500.0 + 500.0)
    check("dear material", conv.total(20_000.0), 500.0 + 1_000.0)


def test_margin_and_markup_are_not_the_same_number() -> None:
    """Buying at 11k and selling at 22k is a 50% MARGIN and a 100% MARKUP.
    Conflating them is the most common way a distributor underprices."""
    s = ContainerScenario(
        name="t",
        fob_invoice_value=11_000.0,
        fees=UserFees(mpf_rate=0.0, mpf_min=0.0, mpf_max=0.0, hmf_rate=0.0),
        sell_price=22_000.0,
    )
    r = compute_landed_cost(s)
    check("gross margin", r.gross_margin_pct, 50.0)
    check("markup", r.markup_pct, 100.0)


def test_breakeven_equals_fully_loaded_cost() -> None:
    s = ContainerScenario(
        name="t",
        fob_invoice_value=10_000.0,
        duty=DutyRates(section_232=0.50),
        conversion=ConversionCosts(cut_shop_labor=800.0),
        sell_price=1.0,
    )
    r = compute_landed_cost(s)
    check("breakeven", r.breakeven_sell_price, r.fully_loaded_cost)


def test_adcvd_can_erase_a_healthy_margin() -> None:
    """The whole point of modelling AD/CVD: a profitable container becomes a
    loss retroactively, after the goods are sold and the cash is spent."""
    common = dict(
        fob_invoice_value=14_000.0,
        logistics=LogisticsCosts(ocean_freight=3_200.0),
        sell_price=34_000.0,
    )
    clean = compute_landed_cost(
        ContainerScenario(name="clean",
                          duty=DutyRates(section_232=0.50, section_301=0.25),
                          **common)
    )
    hit = compute_landed_cost(
        ContainerScenario(name="hit",
                          duty=DutyRates(section_232=0.50, section_301=0.25,
                                         ad_deposit=0.80, cvd_deposit=0.20),
                          **common)
    )
    if clean.gross_profit <= 0:
        FAILURES.append("clean case should be profitable")
    if hit.gross_profit >= 0:
        FAILURES.append("AD/CVD case should wipe out the profit")
    check("adcvd adds 100% of goods value",
          hit.total_duty - clean.total_duty, 14_000.0)


def test_cash_cycle_deposit_is_outstanding_longer_than_balance() -> None:
    c = CashCycle()
    if c.days_deposit_outstanding <= c.days_balance_outstanding:
        FAILURES.append("deposit must be outstanding longer than the balance")
    check("difference is production time",
          c.days_deposit_outstanding - c.days_balance_outstanding,
          c.days_po_to_ship)


def test_peak_cash_scales_linearly_with_volume() -> None:
    """Ten containers a month needs ten times the cash of one. This is the
    scaling wall -- margin does not fund it, only capital does."""
    r = compute_landed_cost(
        ContainerScenario(name="t", fob_invoice_value=14_000.0,
                          duty=DutyRates(section_232=0.50),
                          logistics=LogisticsCosts(ocean_freight=3_200.0))
    )
    cycle = CashCycle()
    one = compute_working_capital(r, cycle, 1)
    ten = compute_working_capital(r, cycle, 10)
    check("10x volume is 10x cash", ten.peak_cash_required,
          one.peak_cash_required * 10, tol=0.1)
    if one.weighted_days_outstanding < 60:
        FAILURES.append(
            f"cash cycle implausibly short: {one.weighted_days_outstanding:.0f}d"
        )


def test_capacity_is_inverse_to_stud_weight() -> None:
    """Lighter gauge means more feet in the box, proportionally."""
    heavy = compute_capacity(StudSpec("18ga", 1.16), payload_lb=61_700.0)
    light = compute_capacity(StudSpec("20ga", 0.89), payload_lb=61_700.0)
    check("18ga linear feet", heavy.linear_feet, 61_700.0 / 1.16, tol=1.0)
    if light.linear_feet <= heavy.linear_feet:
        FAILURES.append("lighter stud must yield more linear feet")


def test_packing_efficiency_derates_a_load_that_cubes_out() -> None:
    full = compute_capacity(StudSpec("t", 0.89))
    derated = compute_capacity(StudSpec("t", 0.89), packing_efficiency=0.6)
    check("60% packing", derated.linear_feet, full.linear_feet * 0.6, tol=1.0)


def test_capacity_rejects_nonsense_weight() -> None:
    try:
        compute_capacity(StudSpec("bad", 0.0))
    except ValueError:
        return
    FAILURES.append("zero weight per foot should raise, not divide by zero")


def test_a_full_container_is_worth_far_more_than_22k() -> None:
    """Guards the finding that reframed the pricing question: a 40HC that
    weighs out holds tens of thousands of linear feet. Even at a
    deliberately conservative price per foot, the box is worth multiples of
    the $22,000 sale price described verbally -- which means the quoted
    numbers are not describing a full container of studs."""
    spec = StudSpec("362S162-33", 0.89, market_price_per_ft=1.00)
    r = compute_capacity(spec)
    if r.linear_feet < 50_000:
        FAILURES.append(f"expected >50k lf in a 40HC, got {r.linear_feet:,.0f}")
    if r.market_value <= 22_000:
        FAILURES.append(
            "a weighed-out container should be worth well over $22k at $1/lf"
        )


def test_shipped_scenarios_all_load_and_compute() -> None:
    scenarios = load_scenarios()
    for key in ("ben_claim", "base_case", "adcvd_shock", "domestic_alternative"):
        if key not in scenarios:
            FAILURES.append(f"missing scenario {key}")
            continue
        r = compute_landed_cost(scenarios[key])
        if r.fully_loaded_cost <= 0:
            FAILURES.append(f"{key}: nonsensical cost {r.fully_loaded_cost}")


def test_domestic_alternative_carries_no_duty() -> None:
    r = compute_landed_cost(load_scenarios()["domestic_alternative"])
    check("no duty on domestic", r.total_duty, 0.0)


def main() -> int:
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        try:
            t()
        except Exception as exc:  # noqa: BLE001 - surface any error as a failure
            FAILURES.append(f"{t.__name__}: raised {exc!r}")

    if FAILURES:
        print(f"FAILED ({len(FAILURES)} of {len(tests)} checks failed):")
        for f in FAILURES:
            print(f"  - {f}")
        return 1
    print(f"ok - {len(tests)} tests passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
