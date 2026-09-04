"""Landed-cost and working-capital model for a single import container.

Built for Misty Valley Supply: cold-formed steel framing imported from China,
cut and packaged in Bonnieville KY, delivered to job sites.

Two questions this answers, on demand, for any quote a supplier sends:

  1. What does this container ACTUALLY cost me on my dock, after the full
     duty stack, and what do I have to sell it for to hit my margin?
  2. How long is my cash gone, and how much cash do I need to run N
     containers a month without running out?

Every rate lives in scenarios.json, not in this file, because the rates
change and a hardcoded tariff is how you lose money quietly. Rates that
still need verification by a licensed customs broker are marked in that
file with a `_verify` note.

No third-party dependencies. Run it:

    python3 container_model.py                # default scenario
    python3 container_model.py --scenario worst_case
    python3 container_model.py --list
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, field
from pathlib import Path

SCENARIO_FILE = Path(__file__).with_name("scenarios.json")


# --------------------------------------------------------------------------
# Duty stack
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class DutyRates:
    """Ad valorem rates applied to the customs (entered) value.

    US customs value for these entries is transaction value -- broadly the
    FOB price actually paid to the supplier. International freight and
    insurance are NOT part of it, which is why ocean freight is handled
    separately below and is not duty-bearing.
    """

    mfn: float = 0.0          # Column 1 General rate for the HTS line
    section_232: float = 0.0  # steel/derivative national-security tariff
    section_301: float = 0.0  # China IP/tech-transfer tariff
    ad_deposit: float = 0.0   # antidumping cash deposit
    cvd_deposit: float = 0.0  # countervailing duty cash deposit

    @property
    def total(self) -> float:
        return (
            self.mfn
            + self.section_232
            + self.section_301
            + self.ad_deposit
            + self.cvd_deposit
        )


@dataclass(frozen=True)
class UserFees:
    """CBP user fees. Both adjust; confirm current figures at entry time."""

    mpf_rate: float = 0.003464   # merchandise processing fee, ad valorem
    mpf_min: float = 32.71
    mpf_max: float = 634.62
    hmf_rate: float = 0.00125    # harbor maintenance fee, ocean entries only

    def mpf(self, customs_value: float) -> float:
        return min(max(customs_value * self.mpf_rate, self.mpf_min), self.mpf_max)

    def hmf(self, customs_value: float) -> float:
        return customs_value * self.hmf_rate


@dataclass(frozen=True)
class LogisticsCosts:
    """Costs that are real cash but are not part of the customs value."""

    ocean_freight: float = 0.0
    drayage: float = 0.0          # port to Bonnieville
    customs_broker: float = 0.0
    isf_filing: float = 0.0
    customs_bond: float = 0.0     # single-transaction, or amortized continuous
    chassis_and_port_fees: float = 0.0
    demurrage_reserve: float = 0.0  # budget it; you will eventually pay it
    unloading: float = 0.0

    @property
    def total(self) -> float:
        return (
            self.ocean_freight
            + self.drayage
            + self.customs_broker
            + self.isf_filing
            + self.customs_bond
            + self.chassis_and_port_fees
            + self.demurrage_reserve
            + self.unloading
        )


@dataclass(frozen=True)
class ConversionCosts:
    """Cut shop and delivery -- the value Misty Valley actually adds."""

    cut_shop_labor: float = 0.0
    banding_and_packaging: float = 0.0
    scrap_loss_pct: float = 0.0   # fraction of material value lost to offcuts
    delivery_to_site: float = 0.0

    def total(self, material_cost: float) -> float:
        return (
            self.cut_shop_labor
            + self.banding_and_packaging
            + self.delivery_to_site
            + material_cost * self.scrap_loss_pct
        )


@dataclass
class ContainerScenario:
    name: str
    fob_invoice_value: float
    duty: DutyRates = field(default_factory=DutyRates)
    fees: UserFees = field(default_factory=UserFees)
    logistics: LogisticsCosts = field(default_factory=LogisticsCosts)
    conversion: ConversionCosts = field(default_factory=ConversionCosts)
    sell_price: float = 0.0
    linear_feet: float = 0.0
    notes: str = ""


@dataclass
class LandedCostResult:
    scenario: str
    customs_value: float
    duty_detail: dict[str, float]
    total_duty: float
    total_fees: float
    logistics: float
    duty_paid_cost: float      # cost on the dock, before cut shop
    conversion: float
    fully_loaded_cost: float   # cost of a delivered, cut package
    sell_price: float
    gross_profit: float
    gross_margin_pct: float
    markup_pct: float
    effective_duty_rate_pct: float
    cost_per_lf: float | None
    breakeven_sell_price: float


def compute_landed_cost(s: ContainerScenario) -> LandedCostResult:
    cv = s.fob_invoice_value

    duty_detail = {
        "mfn": cv * s.duty.mfn,
        "section_232": cv * s.duty.section_232,
        "section_301": cv * s.duty.section_301,
        "antidumping_deposit": cv * s.duty.ad_deposit,
        "countervailing_deposit": cv * s.duty.cvd_deposit,
    }
    total_duty = sum(duty_detail.values())
    total_fees = s.fees.mpf(cv) + s.fees.hmf(cv)

    logistics = s.logistics.total
    duty_paid = cv + total_duty + total_fees + logistics

    conversion = s.conversion.total(duty_paid)
    fully_loaded = duty_paid + conversion

    gross_profit = s.sell_price - fully_loaded
    gross_margin = (gross_profit / s.sell_price * 100) if s.sell_price else 0.0
    markup = (gross_profit / fully_loaded * 100) if fully_loaded else 0.0

    return LandedCostResult(
        scenario=s.name,
        customs_value=cv,
        duty_detail=duty_detail,
        total_duty=total_duty,
        total_fees=total_fees,
        logistics=logistics,
        duty_paid_cost=duty_paid,
        conversion=conversion,
        fully_loaded_cost=fully_loaded,
        sell_price=s.sell_price,
        gross_profit=gross_profit,
        gross_margin_pct=gross_margin,
        markup_pct=markup,
        effective_duty_rate_pct=(total_duty / cv * 100) if cv else 0.0,
        cost_per_lf=(fully_loaded / s.linear_feet) if s.linear_feet else None,
        breakeven_sell_price=fully_loaded,
    )


# --------------------------------------------------------------------------
# Working capital
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class CashCycle:
    """Days between cash leaving and cash returning, per container.

    This is the number that kills import distributors. Margin is not the
    constraint -- the constraint is how many containers of cash you can
    have in the water at once.
    """

    deposit_pct: float = 0.30       # paid at PO
    days_po_to_ship: float = 30.0   # supplier production
    days_ocean_transit: float = 35.0
    days_port_and_dray: float = 10.0
    days_inventory: float = 21.0    # sitting in the cut shop
    days_receivable: float = 60.0   # what contractors actually pay in

    @property
    def days_deposit_outstanding(self) -> float:
        """Deposit is out from PO all the way to cash collection."""
        return (
            self.days_po_to_ship
            + self.days_ocean_transit
            + self.days_port_and_dray
            + self.days_inventory
            + self.days_receivable
        )

    @property
    def days_balance_outstanding(self) -> float:
        """Balance is typically paid against the bill of lading, at shipment."""
        return (
            self.days_ocean_transit
            + self.days_port_and_dray
            + self.days_inventory
            + self.days_receivable
        )


@dataclass
class WorkingCapitalResult:
    containers_per_month: float
    cash_per_container: float
    weighted_days_outstanding: float
    peak_cash_required: float
    containers_in_flight: float


def compute_working_capital(
    result: LandedCostResult,
    cycle: CashCycle,
    containers_per_month: float,
) -> WorkingCapitalResult:
    """Peak cash = cash per container x how many are in flight at once."""
    goods_cost = result.customs_value
    deposit = goods_cost * cycle.deposit_pct
    balance = goods_cost * (1 - cycle.deposit_pct)
    # Duties, fees and logistics land at entry, roughly at arrival.
    at_entry = result.total_duty + result.total_fees + result.logistics
    days_at_entry = cycle.days_inventory + cycle.days_receivable

    cash_per_container = deposit + balance + at_entry + result.conversion

    weighted_days = (
        deposit * cycle.days_deposit_outstanding
        + balance * cycle.days_balance_outstanding
        + at_entry * days_at_entry
    ) / max(cash_per_container, 1e-9)

    containers_in_flight = containers_per_month * (weighted_days / 30.0)

    return WorkingCapitalResult(
        containers_per_month=containers_per_month,
        cash_per_container=cash_per_container,
        weighted_days_outstanding=weighted_days,
        peak_cash_required=cash_per_container * containers_in_flight,
        containers_in_flight=containers_in_flight,
    )


# --------------------------------------------------------------------------
# Scenario loading + reporting
# --------------------------------------------------------------------------


def load_scenarios(path: Path = SCENARIO_FILE) -> dict[str, ContainerScenario]:
    raw = json.loads(path.read_text())
    out: dict[str, ContainerScenario] = {}
    for key, cfg in raw["scenarios"].items():
        out[key] = ContainerScenario(
            name=cfg.get("name", key),
            fob_invoice_value=cfg["fob_invoice_value"],
            duty=DutyRates(**cfg.get("duty", {})),
            fees=UserFees(**cfg.get("fees", {})),
            logistics=LogisticsCosts(**cfg.get("logistics", {})),
            conversion=ConversionCosts(**cfg.get("conversion", {})),
            sell_price=cfg.get("sell_price", 0.0),
            linear_feet=cfg.get("linear_feet", 0.0),
            notes=cfg.get("notes", ""),
        )
    return out


def _money(x: float) -> str:
    return f"${x:>12,.2f}"


def format_report(r: LandedCostResult, wc: list[WorkingCapitalResult]) -> str:
    lines: list[str] = []
    add = lines.append

    add("=" * 66)
    add(f"  LANDED COST -- {r.scenario}")
    add("=" * 66)
    add(f"  Customs (FOB) value           {_money(r.customs_value)}")
    add("  " + "-" * 62)
    for label, amount in r.duty_detail.items():
        if amount:
            add(f"    {label:<26}          {_money(amount)}")
    add(f"  Total duty                    {_money(r.total_duty)}"
        f"   ({r.effective_duty_rate_pct:.1f}% of goods)")
    add(f"  CBP user fees (MPF + HMF)     {_money(r.total_fees)}")
    add(f"  Freight, dray, broker, bond   {_money(r.logistics)}")
    add("  " + "-" * 62)
    add(f"  COST ON YOUR DOCK             {_money(r.duty_paid_cost)}")
    add(f"  Cut shop + delivery           {_money(r.conversion)}")
    add("  " + "-" * 62)
    add(f"  FULLY LOADED COST             {_money(r.fully_loaded_cost)}")
    if r.cost_per_lf is not None:
        add(f"    per linear foot             {_money(r.cost_per_lf)}")
    add("")
    add(f"  Sell price                    {_money(r.sell_price)}")
    add(f"  Gross profit                  {_money(r.gross_profit)}")
    add(f"  Gross margin                  {r.gross_margin_pct:>12.1f}%")
    add(f"  Markup on cost                {r.markup_pct:>12.1f}%")
    add(f"  Breakeven sell price          {_money(r.breakeven_sell_price)}")
    add("")
    add("=" * 66)
    add("  WORKING CAPITAL -- cash you must have, not cash you'll make")
    add("=" * 66)
    add(f"  Cash out per container        {_money(wc[0].cash_per_container)}")
    add(f"  Weighted days outstanding     {wc[0].weighted_days_outstanding:>12.0f} days")
    add("")
    add(f"  {'Containers/mo':<16}{'In flight':>12}{'Peak cash required':>24}")
    add("  " + "-" * 62)
    for w in wc:
        add(f"  {w.containers_per_month:<16.0f}{w.containers_in_flight:>12.1f}"
            f"{_money(w.peak_cash_required):>24}")
    add("=" * 66)
    return "\n".join(lines)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--scenario", default="base_case")
    p.add_argument("--list", action="store_true", help="list available scenarios")
    p.add_argument("--containers", type=float, nargs="*", default=[1, 4, 10])
    args = p.parse_args()

    scenarios = load_scenarios()

    if args.list:
        for key, s in scenarios.items():
            print(f"{key:<20} {s.notes}")
        return

    if args.scenario not in scenarios:
        raise SystemExit(
            f"unknown scenario {args.scenario!r}; "
            f"available: {', '.join(scenarios)}"
        )

    s = scenarios[args.scenario]
    result = compute_landed_cost(s)
    cycle = CashCycle()
    wc = [compute_working_capital(result, cycle, n) for n in args.containers]
    print(format_report(result, wc))
    if s.notes:
        print(f"\n  NOTE: {s.notes}\n")


if __name__ == "__main__":
    main()
