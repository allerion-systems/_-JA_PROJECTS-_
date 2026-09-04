"""Tests for proforma. Run: python3 test_proforma.py"""

from __future__ import annotations

import sys

import proforma as P

FAILURES: list[str] = []


def check(label: str, got, want, tol: float = 0.01) -> None:
    ok = abs(got - want) <= tol if isinstance(want, float) else got == want
    if not ok:
        FAILURES.append(f"{label}: got {got!r}, want {want!r}")


def _scn(**over) -> P.Scenario:
    cfg = dict(
        name="t",
        loads_per_month=[2.0] * P.MONTHS,
        load=P.LoadEconomics(),
        opex_by_year=[P.OperatingExpenses(facility_lease=10_000.0)],
        working_capital=P.WorkingCapital(),
        capital=P.Capitalization(equity_injection=500_000.0),
        startup_cost=0.0,
    )
    cfg.update(over)
    return P.Scenario(**cfg)


def test_load_revenue_splits_material_and_service() -> None:
    le = P.LoadEconomics(
        linear_feet_per_load=100_000.0,
        material_price_per_lf=0.80, service_price_per_lf=0.10,
    )
    check("material", le.material_revenue, 80_000.0)
    check("service", le.service_revenue, 10_000.0)
    check("total", le.revenue, 90_000.0)


def test_gross_profit_subtracts_delivery() -> None:
    """Delivery is a real cost of serving the load and belongs above the
    gross margin line -- a distributor that hides it in opex flatters its
    margin and misprices freight-heavy jobs."""
    le = P.LoadEconomics(
        linear_feet_per_load=100_000.0,
        material_price_per_lf=0.80, material_cost_per_lf=0.60,
        service_price_per_lf=0.10, service_cost_per_lf=0.04,
        delivery_cost_per_load=1_000.0,
    )
    check("cogs", le.cogs, 64_000.0)
    check("gross profit", le.gross_profit, 90_000.0 - 64_000.0 - 1_000.0)


def test_payroll_burden_applies_only_to_wages() -> None:
    o = P.OperatingExpenses(
        owner_salary=5_000.0, driver_wages=5_000.0,
        payroll_burden_pct=0.25, facility_lease=2_000.0,
    )
    check("wages", o.wages, 10_000.0)
    check("total", o.total, 10_000.0 * 1.25 + 2_000.0)


def test_cash_conversion_cycle_nets_payables() -> None:
    wc = P.WorkingCapital(days_inventory=45, days_receivable=65, days_payable=30)
    check("ccc", wc.cash_conversion_days, 80.0)


def test_term_payment_amortises() -> None:
    """A level payment must retire the loan over the term, not just pay
    interest -- otherwise DSCR is understated and the plan looks safer
    than it is."""
    c = P.Capitalization(term_debt=200_000.0, term_rate_annual=0.105,
                         term_years=7)
    pmt = c.monthly_term_payment
    if not (3_000 < pmt < 3_800):
        FAILURES.append(f"implausible payment for 200k/10.5%/7y: {pmt:,.0f}")
    bal, r = 200_000.0, 0.105 / 12
    for _ in range(84):
        bal = bal + bal * r - pmt
    if abs(bal) > 1.0:
        FAILURES.append(f"loan not retired at term: balance {bal:,.2f}")


def test_zero_rate_loan_does_not_divide_by_zero() -> None:
    c = P.Capitalization(term_debt=120_000.0, term_rate_annual=0.0,
                         term_years=10)
    check("zero-rate payment", c.monthly_term_payment, 1_000.0)


def test_no_debt_means_no_payment() -> None:
    check("no debt", P.Capitalization().monthly_term_payment, 0.0)


def test_breakeven_covers_overhead_and_interest() -> None:
    s = _scn()
    be = P.breakeven_loads_per_month(s)
    gp = s.load.gross_profit
    if abs(be * gp - 10_000.0) > 1.0:
        FAILURES.append(f"breakeven should cover 10k opex; got {be * gp:,.0f}")


def test_growth_consumes_cash_even_when_profitable() -> None:
    """The central finding of this model: a business can post positive
    EBITDA every month and still run out of money, because each step up in
    volume funds more inventory and receivables before it collects."""
    ramp = [1.0] * 6 + [3.0] * 6 + [6.0] * 24
    s = _scn(loads_per_month=ramp,
             capital=P.Capitalization(equity_injection=50_000.0))
    rows = P._run_months(s)
    if not all(r.ebitda > 0 for r in rows[6:]):
        FAILURES.append("expected profitable months after the ramp starts")
    if min(r.cash_balance for r in rows) >= 0:
        FAILURES.append("a steep ramp on thin equity should exhaust cash")
    if P.peak_cash_need(rows) <= 0:
        FAILURES.append("peak cash need should be positive on a growth ramp")


def test_flat_volume_does_not_keep_consuming_working_capital() -> None:
    """Working capital is a level tied to the run rate, not a recurring
    charge. Once volume is flat the drag stops and cash builds."""
    s = _scn(loads_per_month=[2.0] * P.MONTHS)
    rows = P._run_months(s)
    later = rows[24:]
    if not all(abs(r.wc_change) < 1.0 for r in later):
        FAILURES.append("flat volume should stop changing working capital")
    if later[-1].cash_balance <= later[0].cash_balance:
        FAILURES.append("a profitable flat business should accumulate cash")


def test_revolver_absorbs_deficit_then_repays() -> None:
    ramp = [1.0] * 12 + [8.0] * 24
    s = _scn(loads_per_month=ramp,
             capital=P.Capitalization(equity_injection=20_000.0,
                                      line_of_credit_limit=400_000.0))
    rows = P._run_months(s)
    if max(r.line_drawn for r in rows) <= 0:
        FAILURES.append("revolver should draw during the ramp")
    if any(r.line_drawn > 400_000.0 + 0.01 for r in rows):
        FAILURES.append("revolver exceeded its limit")
    if rows[-1].line_drawn >= max(r.line_drawn for r in rows):
        FAILURES.append("revolver should pay down once volume flattens")


def test_dscr_is_ebitda_over_debt_service() -> None:
    s = _scn(capital=P.Capitalization(equity_injection=500_000.0,
                                      term_debt=200_000.0,
                                      term_rate_annual=0.105, term_years=7))
    rows = P._run_months(s)
    y1 = P.summarize_years(rows)[0]
    check("dscr", y1.dscr, y1.ebitda / y1.debt_service, tol=0.001)


def test_opex_steps_up_by_year() -> None:
    s = _scn(opex_by_year=[
        P.OperatingExpenses(facility_lease=1_000.0),
        P.OperatingExpenses(facility_lease=2_000.0),
        P.OperatingExpenses(facility_lease=3_000.0),
    ])
    check("year 1", s.opex_for_month(0).total, 1_000.0)
    check("year 2", s.opex_for_month(12).total, 2_000.0)
    check("year 3", s.opex_for_month(30).total, 3_000.0)


def test_ramp_expands_segments_to_full_horizon() -> None:
    r = P._ramp({"segments": [{"months": 6, "loads": 1}, {"months": 6, "loads": 2}]})
    check("length", len(r), P.MONTHS)
    check("first", r[0], 1.0)
    check("seventh", r[6], 2.0)
    check("held flat after last segment", r[-1], 2.0)


def test_shipped_scenarios_are_all_funded() -> None:
    """Every scenario we publish must either survive on its stated capital
    or be explicitly labelled as a failure case. `stress` and `no_mill_terms`
    are the two allowed to run dry -- that is what they are for."""
    for key, s in P.load_scenarios().items():
        rows = P._run_months(s)
        low = min(r.cash_balance for r in rows)
        if key in ("stress", "no_mill_terms"):
            if low >= 0:
                FAILURES.append(f"{key} scenario should expose a funding gap")
            continue
        if low < -0.01:
            FAILURES.append(f"{key}: underfunded, low cash {low:,.0f}")


def test_import_lane_has_a_longer_cash_cycle_than_domestic() -> None:
    """The trade-off the plan turns on: imported steel is cheaper per foot but
    far slower in cash, because it is paid for before it ships and then sits
    on the water for weeks.

    Compare the CYCLE, not peak cash. Peak cash conflates two things -- the
    cycle and the margin -- and cheaper material funds more of its own
    working capital, which can mask a much worse cycle."""
    sc = P.load_scenarios()
    dom = sc["base_case"].working_capital
    imp = sc["import_lane"].working_capital
    if imp.cash_conversion_days <= dom.cash_conversion_days:
        FAILURES.append(
            f"import cycle should be longer: {imp.cash_conversion_days:.0f}d "
            f"vs {dom.cash_conversion_days:.0f}d"
        )
    if imp.days_payable >= dom.days_payable:
        FAILURES.append("import supplier terms should be worse, not better")


def test_service_premium_stays_inside_the_defensible_band() -> None:
    """Research caps the sustainable cut/kit premium at roughly 3-7% of
    material price -- the value created is about $1.00-1.30 per stud and a
    supplier can hold a third to a half of it. A scenario that prices the
    service above that band is quietly assuming a premium customers have no
    reason to pay."""
    for key, s in P.load_scenarios().items():
        if key == "stress":
            continue          # stress deliberately competes the premium away
        premium = s.load.service_price_per_lf / s.load.material_price_per_lf
        if premium > 0.07:
            FAILURES.append(
                f"{key}: service premium {premium:.1%} exceeds the 7% ceiling"
            )


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
