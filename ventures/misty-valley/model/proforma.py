"""Three-year pro forma for Misty Valley Supply.

Companion to container_model.py. That one prices a single inbound load.
This one runs the whole business: revenue ramp, gross margin, operating
expense, working capital, debt service, and the two numbers a lender will
actually ask about -- peak cash requirement and debt service coverage.

The business modelled here is the one in 06-the-stronger-play.md: a
value-added framing package supplier. Revenue has two components, and
keeping them separate is the whole point --

    MATERIAL   commodity steel studs and track, sold by the linear foot at
               a distributor margin that competitors can and will match.

    SERVICE    cut-to-length, labelled, sequenced job-site packages. Priced
               as an uplift per linear foot. This is the defensible margin,
               it costs labour rather than steel, and it survives any
               change in where the steel comes from.

If the service line is small, this is a commodity distributor with a truck
and it should be planned as one. If it grows, it is a different business.
The model shows which.

    python3 proforma.py                    # base case, 36 months
    python3 proforma.py --scenario lean
    python3 proforma.py --monthly          # month-by-month detail
    python3 proforma.py --list
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, field
from pathlib import Path

CONFIG_FILE = Path(__file__).with_name("proforma_scenarios.json")
MONTHS = 36


# --------------------------------------------------------------------------
# Inputs
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class LoadEconomics:
    """Per-truckload unit economics, in linear feet of stud and track.

    A road-legal load is weight-limited, not volume-limited -- see
    container_model.ROAD_LEGAL_PAYLOAD_LB. At a blended 0.463 lb/ft across a
    representative commercial job mix, 44,000 lb is roughly 95,000 LF.
    """

    linear_feet_per_load: float = 95_000.0
    material_price_per_lf: float = 0.80    # distributor -> contractor
    material_cost_per_lf: float = 0.585    # delivered cost of goods
    service_price_per_lf: float = 0.11     # cut/label/sequence uplift
    service_cost_per_lf: float = 0.045     # saw labour + banding + scrap
    delivery_cost_per_load: float = 850.0  # fuel, driver hours, wear

    @property
    def material_revenue(self) -> float:
        return self.linear_feet_per_load * self.material_price_per_lf

    @property
    def service_revenue(self) -> float:
        return self.linear_feet_per_load * self.service_price_per_lf

    @property
    def revenue(self) -> float:
        return self.material_revenue + self.service_revenue

    @property
    def cogs(self) -> float:
        return self.linear_feet_per_load * (
            self.material_cost_per_lf + self.service_cost_per_lf
        )

    @property
    def gross_profit(self) -> float:
        return self.revenue - self.cogs - self.delivery_cost_per_load

    @property
    def gross_margin_pct(self) -> float:
        return self.gross_profit / self.revenue * 100 if self.revenue else 0.0


@dataclass(frozen=True)
class OperatingExpenses:
    """Monthly fixed overhead. Delivery cost is per-load, not here."""

    owner_salary: float = 0.0        # deliberately low in year 1
    yard_and_shop_wages: float = 0.0
    driver_wages: float = 0.0
    admin_wages: float = 0.0
    payroll_burden_pct: float = 0.24  # FICA, WC, unemployment, benefits
    facility_lease: float = 0.0
    insurance: float = 0.0            # CGL, products, auto, property
    truck_payment: float = 0.0
    equipment_payment: float = 0.0
    utilities_and_maintenance: float = 0.0
    software_and_admin: float = 0.0
    professional_fees: float = 0.0    # CPA, attorney, broker
    marketing: float = 0.0
    other: float = 0.0

    @property
    def wages(self) -> float:
        return (
            self.owner_salary
            + self.yard_and_shop_wages
            + self.driver_wages
            + self.admin_wages
        )

    @property
    def total(self) -> float:
        return (
            self.wages * (1 + self.payroll_burden_pct)
            + self.facility_lease
            + self.insurance
            + self.truck_payment
            + self.equipment_payment
            + self.utilities_and_maintenance
            + self.software_and_admin
            + self.professional_fees
            + self.marketing
            + self.other
        )


@dataclass(frozen=True)
class WorkingCapital:
    """Days. The gap between these is what the business must fund."""

    days_inventory: float = 45.0
    days_receivable: float = 65.0   # construction pays slowly; plan for it
    days_payable: float = 30.0      # supplier terms once credit is earned

    @property
    def cash_conversion_days(self) -> float:
        return self.days_inventory + self.days_receivable - self.days_payable


@dataclass(frozen=True)
class Capitalization:
    equity_injection: float = 0.0
    term_debt: float = 0.0
    term_rate_annual: float = 0.105
    term_years: int = 7
    line_of_credit_limit: float = 0.0
    line_rate_annual: float = 0.095

    @property
    def monthly_term_payment(self) -> float:
        """Level amortising payment."""
        if self.term_debt <= 0 or self.term_years <= 0:
            return 0.0
        r = self.term_rate_annual / 12
        n = self.term_years * 12
        if r == 0:
            return self.term_debt / n
        return self.term_debt * r / (1 - (1 + r) ** -n)


@dataclass
class Scenario:
    name: str
    loads_per_month: list[float]
    load: LoadEconomics = field(default_factory=LoadEconomics)
    opex_by_year: list[OperatingExpenses] = field(default_factory=list)
    working_capital: WorkingCapital = field(default_factory=WorkingCapital)
    capital: Capitalization = field(default_factory=Capitalization)
    startup_cost: float = 0.0
    tax_rate: float = 0.0   # pass-through entity: tax is paid by the owner
    notes: str = ""

    def opex_for_month(self, m: int) -> OperatingExpenses:
        year = min(m // 12, len(self.opex_by_year) - 1)
        return self.opex_by_year[year]


# --------------------------------------------------------------------------
# The model
# --------------------------------------------------------------------------


@dataclass
class MonthResult:
    month: int
    loads: float
    revenue: float
    material_revenue: float
    service_revenue: float
    cogs: float
    delivery: float
    gross_profit: float
    opex: float
    ebitda: float
    interest: float
    principal: float
    net_income: float
    working_capital: float
    wc_change: float
    operating_cash_flow: float
    cash_balance: float
    line_drawn: float


def _run_months(s: Scenario) -> list[MonthResult]:
    results: list[MonthResult] = []
    cash = s.capital.equity_injection + s.capital.term_debt - s.startup_cost
    term_balance = s.capital.term_debt
    line_drawn = 0.0
    prior_wc = 0.0
    r_month = s.capital.term_rate_annual / 12

    for m in range(MONTHS):
        loads = s.loads_per_month[m] if m < len(s.loads_per_month) else \
            s.loads_per_month[-1]

        revenue = loads * s.load.revenue
        material_rev = loads * s.load.material_revenue
        service_rev = loads * s.load.service_revenue
        cogs = loads * s.load.cogs
        delivery = loads * s.load.delivery_cost_per_load
        gross = revenue - cogs - delivery

        opex = s.opex_for_month(m).total
        ebitda = gross - opex

        term_interest = term_balance * r_month
        line_interest = line_drawn * (s.capital.line_rate_annual / 12)
        interest = term_interest + line_interest

        payment = s.capital.monthly_term_payment if term_balance > 0 else 0.0
        principal = min(max(payment - term_interest, 0.0), term_balance)
        term_balance -= principal

        pre_tax = ebitda - interest
        net_income = pre_tax * (1 - s.tax_rate) if pre_tax > 0 else pre_tax

        # Working capital scales with the run rate, not with cumulative sales.
        daily_cogs = (cogs + delivery) / 30 if loads else 0.0
        daily_rev = revenue / 30 if loads else 0.0
        wc = (
            daily_cogs * s.working_capital.days_inventory
            + daily_rev * s.working_capital.days_receivable
            - daily_cogs * s.working_capital.days_payable
        )
        wc_change = wc - prior_wc
        prior_wc = wc

        op_cf = ebitda - interest - wc_change
        cash += op_cf - principal

        # Revolver absorbs a cash deficit up to the limit.
        if cash < 0 and s.capital.line_of_credit_limit > 0:
            draw = min(-cash, s.capital.line_of_credit_limit - line_drawn)
            line_drawn += draw
            cash += draw
        elif cash > 0 and line_drawn > 0:
            repay = min(cash, line_drawn)
            line_drawn -= repay
            cash -= repay

        results.append(MonthResult(
            month=m + 1, loads=loads, revenue=revenue,
            material_revenue=material_rev, service_revenue=service_rev,
            cogs=cogs, delivery=delivery, gross_profit=gross, opex=opex,
            ebitda=ebitda, interest=interest, principal=principal,
            net_income=net_income, working_capital=wc, wc_change=wc_change,
            operating_cash_flow=op_cf, cash_balance=cash,
            line_drawn=line_drawn,
        ))

    return results


@dataclass
class YearSummary:
    year: int
    loads: float
    revenue: float
    material_revenue: float
    service_revenue: float
    gross_profit: float
    gross_margin_pct: float
    opex: float
    ebitda: float
    ebitda_margin_pct: float
    debt_service: float
    dscr: float
    net_income: float
    ending_cash: float
    peak_line_drawn: float


def summarize_years(rows: list[MonthResult]) -> list[YearSummary]:
    out: list[YearSummary] = []
    for y in range(MONTHS // 12):
        chunk = rows[y * 12:(y + 1) * 12]
        revenue = sum(r.revenue for r in chunk)
        gross = sum(r.gross_profit for r in chunk)
        ebitda = sum(r.ebitda for r in chunk)
        debt_service = sum(r.interest + r.principal for r in chunk)
        out.append(YearSummary(
            year=y + 1,
            loads=sum(r.loads for r in chunk),
            revenue=revenue,
            material_revenue=sum(r.material_revenue for r in chunk),
            service_revenue=sum(r.service_revenue for r in chunk),
            gross_profit=gross,
            gross_margin_pct=gross / revenue * 100 if revenue else 0.0,
            opex=sum(r.opex for r in chunk),
            ebitda=ebitda,
            ebitda_margin_pct=ebitda / revenue * 100 if revenue else 0.0,
            debt_service=debt_service,
            dscr=ebitda / debt_service if debt_service > 0 else float("inf"),
            net_income=sum(r.net_income for r in chunk),
            ending_cash=chunk[-1].cash_balance,
            peak_line_drawn=max(r.line_drawn for r in chunk),
        ))
    return out


def breakeven_loads_per_month(s: Scenario, year: int = 0) -> float:
    """Loads per month at which gross profit covers overhead and interest."""
    gp = s.load.gross_profit
    if gp <= 0:
        return float("inf")
    opex = s.opex_by_year[min(year, len(s.opex_by_year) - 1)].total
    interest = (s.capital.term_debt * s.capital.term_rate_annual) / 12
    return (opex + interest) / gp


def peak_cash_need(rows: list[MonthResult]) -> float:
    """The worst cumulative funding gap, ignoring the revolver."""
    worst = 0.0
    running = 0.0
    for r in rows:
        running += r.operating_cash_flow - r.principal
        worst = min(worst, running)
    return -worst


# --------------------------------------------------------------------------
# Config + reporting
# --------------------------------------------------------------------------


def _ramp(spec: dict) -> list[float]:
    """Expand a compact ramp spec into 36 monthly values."""
    if "monthly" in spec:
        return [float(x) for x in spec["monthly"]]
    out: list[float] = []
    for seg in spec["segments"]:
        out.extend([float(seg["loads"])] * int(seg["months"]))
    while len(out) < MONTHS:
        out.append(out[-1] if out else 0.0)
    return out[:MONTHS]


def load_scenarios(path: Path = CONFIG_FILE) -> dict[str, Scenario]:
    raw = json.loads(path.read_text())
    out: dict[str, Scenario] = {}
    for key, cfg in raw["scenarios"].items():
        out[key] = Scenario(
            name=cfg.get("name", key),
            loads_per_month=_ramp(cfg["volume"]),
            load=LoadEconomics(**cfg.get("load", {})),
            opex_by_year=[OperatingExpenses(**o)
                          for o in cfg.get("opex_by_year", [{}])],
            working_capital=WorkingCapital(**cfg.get("working_capital", {})),
            capital=Capitalization(**cfg.get("capital", {})),
            startup_cost=cfg.get("startup_cost", 0.0),
            tax_rate=cfg.get("tax_rate", 0.0),
            notes=cfg.get("notes", ""),
        )
    return out


def _m(x: float) -> str:
    return f"${x:>13,.0f}"


def format_report(s: Scenario, rows: list[MonthResult]) -> str:
    years = summarize_years(rows)
    L: list[str] = []
    add = L.append

    add("=" * 74)
    add(f"  MISTY VALLEY SUPPLY -- {s.name}")
    add("=" * 74)

    add("")
    add("  PER LOAD")
    add(f"    Linear feet                {s.load.linear_feet_per_load:>13,.0f}")
    add(f"    Material revenue           {_m(s.load.material_revenue)}")
    add(f"    Service revenue (cut/kit)  {_m(s.load.service_revenue)}")
    add(f"    Total revenue              {_m(s.load.revenue)}")
    add(f"    Cost of goods              {_m(-s.load.cogs)}")
    add(f"    Delivery                   {_m(-s.load.delivery_cost_per_load)}")
    add(f"    Gross profit               {_m(s.load.gross_profit)}"
        f"   ({s.load.gross_margin_pct:.1f}%)")

    add("")
    add(f"  {'ANNUAL':<28}{'Year 1':>15}{'Year 2':>15}{'Year 3':>15}")
    add("  " + "-" * 70)

    def row(label: str, fn, money: bool = True, pct: bool = False) -> None:
        cells = ""
        for y in years:
            v = fn(y)
            if pct:
                cells += f"{v:>14.1f}%"
            elif money:
                cells += f"{v:>15,.0f}"
            else:
                cells += f"{v:>15,.1f}"
        add(f"  {label:<28}{cells}")

    row("Loads delivered", lambda y: y.loads, money=False)
    row("Material revenue", lambda y: y.material_revenue)
    row("Service revenue", lambda y: y.service_revenue)
    row("TOTAL REVENUE", lambda y: y.revenue)
    row("Gross profit", lambda y: y.gross_profit)
    row("  gross margin", lambda y: y.gross_margin_pct, pct=True)
    row("Operating expense", lambda y: -y.opex)
    row("EBITDA", lambda y: y.ebitda)
    row("  EBITDA margin", lambda y: y.ebitda_margin_pct, pct=True)
    row("Debt service", lambda y: -y.debt_service)
    row("Net income", lambda y: y.net_income)
    row("Ending cash", lambda y: y.ending_cash)
    row("Peak line drawn", lambda y: y.peak_line_drawn)

    add("")
    add("  " + "-" * 70)
    dscr1 = years[0].dscr
    add(f"  {'DSCR by year':<28}"
        + "".join(f"{y.dscr:>15.2f}" for y in years))
    add(f"  {'  (lenders want >= 1.25)':<28}")

    add("")
    add("  KEY NUMBERS")
    be = breakeven_loads_per_month(s)
    add(f"    Breakeven volume           {be:>10.2f} loads/month")
    add(f"    Peak cash requirement      {_m(peak_cash_need(rows))}")
    add(f"    Startup cost               {_m(s.startup_cost)}")
    add(f"    Equity injected            {_m(s.capital.equity_injection)}")
    add(f"    Term debt                  {_m(s.capital.term_debt)}")
    add(f"    Line of credit limit       {_m(s.capital.line_of_credit_limit)}")
    add(f"    Cash conversion cycle      "
        f"{s.working_capital.cash_conversion_days:>10.0f} days")

    svc = years[2].service_revenue
    tot = years[2].revenue
    add(f"    Service revenue, year 3    {svc / tot * 100 if tot else 0:>10.1f}%"
        " of revenue")

    worst = min(r.cash_balance for r in rows)
    add(f"    Lowest cash balance        {_m(worst)}")
    if worst < 0:
        add("    *** UNDERFUNDED -- the plan runs out of money. Raise equity,")
        add("        enlarge the line, slow the ramp, or cut overhead. ***")
    add("=" * 74)
    return "\n".join(L)


def format_monthly(rows: list[MonthResult]) -> str:
    L = [f"  {'Mo':>3}{'Loads':>8}{'Revenue':>12}{'Gross':>12}"
         f"{'EBITDA':>12}{'WC':>12}{'Cash':>12}{'Line':>11}",
         "  " + "-" * 78]
    for r in rows:
        L.append(
            f"  {r.month:>3}{r.loads:>8.1f}{r.revenue:>12,.0f}"
            f"{r.gross_profit:>12,.0f}{r.ebitda:>12,.0f}"
            f"{r.working_capital:>12,.0f}{r.cash_balance:>12,.0f}"
            f"{r.line_drawn:>11,.0f}"
        )
    return "\n".join(L)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--scenario", default="base_case")
    p.add_argument("--list", action="store_true")
    p.add_argument("--monthly", action="store_true")
    args = p.parse_args()

    scenarios = load_scenarios()
    if args.list:
        for k, s in scenarios.items():
            print(f"{k:<22} {s.notes}")
        return

    if args.scenario not in scenarios:
        raise SystemExit(f"unknown scenario {args.scenario!r}; "
                         f"available: {', '.join(scenarios)}")

    s = scenarios[args.scenario]
    rows = _run_months(s)
    print(format_report(s, rows))
    if args.monthly:
        print()
        print(format_monthly(rows))
    if s.notes:
        print(f"\n  NOTE: {s.notes}\n")


if __name__ == "__main__":
    main()
