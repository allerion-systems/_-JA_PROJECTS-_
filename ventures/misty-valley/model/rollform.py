"""Make-vs-buy: should Misty Valley roll-form its own studs from coil?

The question Joey asked: buy a roll-former and order coil like Nucor does,
instead of buying finished studs from a mill.

This model answers three things:

  1. THE SPREAD. What does a linear foot cost to make from coil, against
     what it costs to buy finished? That difference is the whole prize.

  2. THE CAPACITY MISMATCH. A roll-forming line is sized for a mill, not
     for a yard. This computes how much of the machine's capacity the
     business would actually use -- which is usually the finding that
     settles the question.

  3. THE PAYBACK. Given the spread and the volume, how long to earn the
     machine back, and what annual volume is needed to justify it.

What this model does NOT capture, and what actually decides it:

  - COIL MINIMUMS. A mill sells in tens of tons per width, per gauge, per
    coating. Every stud profile needs coil slit to its own developed
    width. The SKU count is the constraint, not the machine.
  - CERTIFICATION. As a manufacturer you own SFIA/ICC-ES/UL, product
    marking, and the test program behind them.
  - LIABILITY. A manufacturer has no middleman defence at all.

Those live in the write-up. This file does the arithmetic.

    python3 rollform.py
    python3 rollform.py --coil-price 0.75 --line-speed 4000
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass

# --------------------------------------------------------------------------
# Product geometry
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class Profile:
    """One stud or track profile.

    `developed_width_in` is the flat blank width the coil must be slit to:
    web + both flanges + both return lips, plus a small bend allowance.
    It is the reason a roll-former needs many coil SKUs where a distributor
    needs one finished SKU.
    """

    name: str
    web_in: float
    flange_in: float
    lip_in: float
    mils: float                # base steel thickness
    weight_lb_per_ft: float

    @property
    def developed_width_in(self) -> float:
        # Bend allowance is small at these radii; 1/16in per bend is a
        # working approximation for planning coil widths.
        bends = 4 if self.lip_in > 0 else 2
        return (
            self.web_in
            + 2 * self.flange_in
            + 2 * self.lip_in
            + bends * 0.0625
        )


# Weights from SFIA published section properties; see 04-unit-economics.md.
PROFILES = [
    Profile("362S125-18  3-5/8in stud 25ga", 3.625, 1.25, 0.1875, 18, 0.40),
    Profile("362T125-18  3-5/8in track 25ga", 3.625, 1.25, 0.0, 18, 0.39),
    Profile("362S125-30  3-5/8in stud 20ga", 3.625, 1.25, 0.1875, 30, 0.66),
    Profile("362S162-33  3-5/8in struct", 3.625, 1.625, 0.1875, 33, 0.89),
    Profile("600S162-33  6in struct", 6.000, 1.625, 0.1875, 33, 1.16),
    Profile("250S125-18  2-1/2in stud 25ga", 2.500, 1.25, 0.1875, 18, 0.32),
]


# --------------------------------------------------------------------------
# Economics
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class CoilEconomics:
    price_per_lb: float = 0.67       # galvanized coil, delivered
    yield_loss_pct: float = 0.06     # side trim, threading, startup scrap
    scrap_credit_per_lb: float = 0.12  # what the offcut sells for

    def steel_cost_per_lf(self, p: Profile) -> float:
        gross = p.weight_lb_per_ft * self.price_per_lb
        # Buy more than you ship; recover part of the difference as scrap.
        waste_lb = p.weight_lb_per_ft * self.yield_loss_pct
        return gross + waste_lb * (self.price_per_lb - self.scrap_credit_per_lb)


@dataclass(frozen=True)
class BuyEconomics:
    """What a finished stud costs to buy, as a function of its weight.

    A flat $/LF buy price across profiles is meaningless -- a 6in structural
    stud carries three times the steel of a 2-1/2in 25ga stud. Mills price
    finished product at roughly 1.6-2.0x their coil cost, and a distributor
    adds freight and margin on top of that.
    """

    mill_multiple: float = 1.75      # finished mill price / coil cost
    distributor_adder_per_lf: float = 0.09   # freight + the seller's margin

    def buy_cost_per_lf(self, p: Profile, coil: "CoilEconomics") -> float:
        steel = p.weight_lb_per_ft * coil.price_per_lb
        return steel * self.mill_multiple + self.distributor_adder_per_lf


@dataclass(frozen=True)
class LineEconomics:
    """Running cost of the roll-forming line.

    The distinction that decides this whole question: at low utilisation the
    line's labour is a FIXED cost, not a variable one. You cannot employ two
    operators for the sixteen hours a month that one truckload takes. They
    are on the payroll whether the line runs or not, so the conversion cost
    per foot is dominated by how little you run -- not by how fast you can.
    """

    speed_ft_per_min: float = 165.0   # ~9,900 ft/hr, a fast modern line
    uptime_pct: float = 0.60          # changeovers, coil swaps, setup, breaks

    # Fixed annual cost of having a manufacturing operation at all.
    operators: float = 2.0
    labor_rate_loaded: float = 31.0   # KY yard wage + burden
    hours_per_fte: float = 2080.0
    supervisor_and_qc: float = 85_000.0   # someone has to own the product
    fixed_overhead: float = 25_000.0      # calibration, certs upkeep, spares

    # Genuinely variable with each foot produced.
    power_kw: float = 45.0
    power_cost_per_kwh: float = 0.11
    maintenance_per_1k_lf: float = 1.80
    consumables_per_1k_lf: float = 0.90

    @property
    def effective_ft_per_hour(self) -> float:
        return self.speed_ft_per_min * 60 * self.uptime_pct

    @property
    def annual_fixed_cost(self) -> float:
        return (
            self.operators * self.labor_rate_loaded * self.hours_per_fte
            + self.supervisor_and_qc
            + self.fixed_overhead
        )

    @property
    def variable_cost_per_lf(self) -> float:
        power = (self.power_kw * self.power_cost_per_kwh) / self.effective_ft_per_hour
        return (
            power
            + self.maintenance_per_1k_lf / 1000
            + self.consumables_per_1k_lf / 1000
        )

    def conversion_cost_per_lf(self, annual_lf: float) -> float:
        """Total conversion cost, fixed cost spread over ACTUAL volume."""
        if annual_lf <= 0:
            return float("inf")
        return self.variable_cost_per_lf + self.annual_fixed_cost / annual_lf


@dataclass(frozen=True)
class MachineInvestment:
    machine: float = 400_000.0
    decoiler_and_handling: float = 55_000.0
    runout_stacker_bundler: float = 45_000.0
    electrical_and_foundation: float = 40_000.0
    install_and_training: float = 30_000.0
    tooling_extra_profiles: float = 0.0
    life_years: int = 10

    @property
    def total(self) -> float:
        return (
            self.machine
            + self.decoiler_and_handling
            + self.runout_stacker_bundler
            + self.electrical_and_foundation
            + self.install_and_training
            + self.tooling_extra_profiles
        )

    @property
    def annual_depreciation(self) -> float:
        return self.total / self.life_years


@dataclass
class MakeBuyResult:
    profile: str
    buy_cost_per_lf: float
    steel_cost_per_lf: float
    conversion_cost_per_lf: float
    make_cost_per_lf: float
    spread_per_lf: float
    spread_pct: float


def compare(
    p: Profile,
    coil: CoilEconomics,
    line: LineEconomics,
    buy: BuyEconomics,
    annual_lf: float,
) -> MakeBuyResult:
    steel = coil.steel_cost_per_lf(p)
    conv = line.conversion_cost_per_lf(annual_lf)
    make = steel + conv
    buy_cost = buy.buy_cost_per_lf(p, coil)
    spread = buy_cost - make
    return MakeBuyResult(
        profile=p.name,
        buy_cost_per_lf=buy_cost,
        steel_cost_per_lf=steel,
        conversion_cost_per_lf=conv,
        make_cost_per_lf=make,
        spread_per_lf=spread,
        spread_pct=(spread / buy_cost * 100) if buy_cost else 0.0,
    )


# --------------------------------------------------------------------------
# Capacity and payback
# --------------------------------------------------------------------------


LF_PER_LOAD = 95_000.0
SHIFT_HOURS = 8.0
SHIFTS_PER_YEAR = 250.0


@dataclass
class CapacityResult:
    loads_per_month: float
    annual_lf: float
    annual_capacity_lf: float
    utilization_pct: float
    shifts_needed: float


def capacity(line: LineEconomics, loads_per_month: float) -> CapacityResult:
    annual_lf = loads_per_month * 12 * LF_PER_LOAD
    cap = line.effective_ft_per_hour * SHIFT_HOURS * SHIFTS_PER_YEAR
    return CapacityResult(
        loads_per_month=loads_per_month,
        annual_lf=annual_lf,
        annual_capacity_lf=cap,
        utilization_pct=(annual_lf / cap * 100) if cap else 0.0,
        shifts_needed=annual_lf / (line.effective_ft_per_hour * SHIFT_HOURS),
    )


@dataclass
class PaybackResult:
    loads_per_month: float
    annual_lf: float
    gross_saving: float
    depreciation: float
    net_benefit: float
    simple_payback_years: float | None


def payback(
    spread_per_lf: float,
    loads_per_month: float,
    inv: MachineInvestment,
) -> PaybackResult:
    annual_lf = loads_per_month * 12 * LF_PER_LOAD
    saving = annual_lf * spread_per_lf
    net = saving - inv.annual_depreciation
    return PaybackResult(
        loads_per_month=loads_per_month,
        annual_lf=annual_lf,
        gross_saving=saving,
        depreciation=inv.annual_depreciation,
        net_benefit=net,
        simple_payback_years=(inv.total / saving) if saving > 0 else None,
    )


def breakeven_loads_per_month(
    coil: CoilEconomics,
    line: LineEconomics,
    buy: BuyEconomics,
    inv: MachineInvestment,
    p: Profile,
) -> float:
    """Loads/month at which making beats buying, all-in.

    Solved rather than divided, because the conversion cost per foot is
    itself a function of volume -- the fixed cost of running a
    manufacturing operation is spread over whatever you actually make.

        spread(V) * V = depreciation
        (buy - steel - variable - fixed/V) * V = depreciation
        (buy - steel - variable) * V = depreciation + fixed
    """
    buy_cost = buy.buy_cost_per_lf(p, coil)
    contribution = buy_cost - coil.steel_cost_per_lf(p) - line.variable_cost_per_lf
    if contribution <= 0:
        return float("inf")
    lf = (inv.annual_depreciation + line.annual_fixed_cost) / contribution
    return lf / 12 / LF_PER_LOAD


# --------------------------------------------------------------------------
# Report
# --------------------------------------------------------------------------


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--coil-price", type=float, default=0.67,
                    help="galvanized coil, $/lb delivered")
    ap.add_argument("--line-speed", type=float, default=165.0,
                    help="line speed, ft/min")
    ap.add_argument("--uptime", type=float, default=0.60)
    ap.add_argument("--machine", type=float, default=400_000.0)
    ap.add_argument("--loads", type=float, default=5.0,
                    help="loads per month for the per-profile table")
    ap.add_argument("--mill-multiple", type=float, default=1.75,
                    help="finished mill price as a multiple of coil cost -- "
                         "the single most uncertain input; get a real quote")
    args = ap.parse_args()

    coil = CoilEconomics(price_per_lb=args.coil_price)
    line = LineEconomics(speed_ft_per_min=args.line_speed, uptime_pct=args.uptime)
    buy = BuyEconomics(mill_multiple=args.mill_multiple)
    inv = MachineInvestment(machine=args.machine)

    L: list[str] = []
    add = L.append

    add("=" * 78)
    add("  ROLL-FORM VS BUY  --  Misty Valley Supply")
    add("=" * 78)

    add("")
    add("  COIL SKUs REQUIRED  (the constraint nobody expects)")
    add("  Each profile needs coil slit to its own developed width.")
    add("")
    add(f"  {'Profile':<32}{'Developed width':>16}{'lb/ft':>9}")
    add("  " + "-" * 74)
    widths = set()
    for p in PROFILES:
        widths.add((round(p.developed_width_in, 3), p.mils))
        add(f"  {p.name:<32}{p.developed_width_in:>13.3f} in"
            f"{p.weight_lb_per_ft:>9.2f}")
    add("  " + "-" * 74)
    add(f"  {len(PROFILES)} profiles shown -> {len(widths)} distinct coil "
        f"width/gauge combinations.")
    add("  A full commercial range (2-1/2in to 8in, 25ga to 12ga, stud and")
    add("  track, G40 and G60) multiplies that many times over. Every one of")
    add("  them carries a mill or service-centre minimum order.")

    annual_lf = args.loads * 12 * LF_PER_LOAD
    add("")
    add("=" * 78)
    add(f"  MAKE VS BUY, PER LINEAR FOOT  --  at {args.loads:g} loads/month")
    add("=" * 78)
    add(f"  Coil ${coil.price_per_lb:.2f}/lb | yield loss "
        f"{coil.yield_loss_pct:.0%} | buy price = "
        f"{buy.mill_multiple:.2f}x steel + ${buy.distributor_adder_per_lf:.2f}")
    add(f"  Annual volume {annual_lf:,.0f} LF | line fixed cost "
        f"${line.annual_fixed_cost:,.0f}/yr spread over it "
        f"= ${line.annual_fixed_cost / annual_lf:.3f}/LF")
    add("")
    add(f"  {'Profile':<32}{'Steel':>9}{'Convert':>9}{'MAKE':>9}"
        f"{'BUY':>9}{'Spread':>10}")
    add("  " + "-" * 74)
    for p in PROFILES:
        r = compare(p, coil, line, buy, annual_lf)
        add(f"  {p.name:<32}{r.steel_cost_per_lf:>9.3f}"
            f"{r.conversion_cost_per_lf:>9.3f}{r.make_cost_per_lf:>9.3f}"
            f"{r.buy_cost_per_lf:>9.3f}{r.spread_per_lf:>10.3f}")

    add("")
    add("=" * 78)
    add("  THE SPREAD IS A FUNCTION OF VOLUME, NOT OF THE MACHINE")
    add("=" * 78)
    add("  Reference profile: 362S125-18 (3-5/8in stud, 25ga)")
    add("")
    add(f"  {'Loads/mo':>10}{'Annual LF':>14}{'Convert $/LF':>15}"
        f"{'Spread $/LF':>14}{'Annual gain':>16}")
    add("  " + "-" * 74)
    ref_profile = PROFILES[0]
    for n in (1, 2, 3, 5, 10, 25):
        a = n * 12 * LF_PER_LOAD
        r = compare(ref_profile, coil, line, buy, a)
        gain = r.spread_per_lf * a - inv.annual_depreciation
        add(f"  {n:>10}{a:>14,.0f}{r.conversion_cost_per_lf:>15.3f}"
            f"{r.spread_per_lf:>14.3f}{gain:>16,.0f}")
    add("")
    add("  'Annual gain' is the spread times volume, less depreciation on the")
    add("  line. It excludes certification, coil inventory, insurance, and the")
    add("  working capital that buying coil in mill quantities demands.")

    add("")
    add("=" * 78)
    add("  CAPACITY  --  the machine is sized for a mill, not a yard")
    add("=" * 78)
    add(f"  Line: {line.speed_ft_per_min:.0f} ft/min at {line.uptime_pct:.0%} "
        f"uptime = {line.effective_ft_per_hour:,.0f} ft/hr effective")
    add(f"  One 8-hour shift = {line.effective_ft_per_hour * SHIFT_HOURS:,.0f} LF"
        f"  = {line.effective_ft_per_hour * SHIFT_HOURS / LF_PER_LOAD:.1f} truckloads")
    add("")
    add(f"  {'Loads/mo':>10}{'Annual LF':>15}{'Shifts/yr':>12}"
        f"{'Utilisation':>14}")
    add("  " + "-" * 74)
    for n in (1, 3, 5, 10, 25):
        c = capacity(line, n)
        add(f"  {n:>10}{c.annual_lf:>15,.0f}{c.shifts_needed:>12.0f}"
            f"{c.utilization_pct:>13.1f}%")

    add("")
    add("=" * 78)
    add("  SENSITIVITY  --  the answer hinges on one number nobody published")
    add("=" * 78)
    add("  `mill_multiple` is what a mill charges for a finished stud as a")
    add("  multiple of its coil cost. It carries the mill's conversion cost,")
    add("  its margin and its freight. It is negotiated and confidential, and")
    add("  it is the difference between a compelling case and a marginal one.")
    add("")
    add(f"  {'Mill mult.':>12}{'Buy $/LF':>12}{'Spread $/LF':>14}"
        f"{'Gain @5 loads/mo':>20}")
    add("  " + "-" * 74)
    a5 = 5 * 12 * LF_PER_LOAD
    for m in (1.15, 1.30, 1.45, 1.60, 1.75, 2.00):
        b = BuyEconomics(mill_multiple=m)
        r = compare(ref_profile, coil, line, b, a5)
        add(f"  {m:>12.2f}{r.buy_cost_per_lf:>12.3f}{r.spread_per_lf:>14.3f}"
            f"{r.spread_per_lf * a5 - inv.annual_depreciation:>20,.0f}")
    add("")
    add("  Three real quotes -- ClarkDietrich, Telling, and a coil service")
    add("  centre -- collapse this table to one row. Until then the case for")
    add("  a machine rests on an assumption, not a number.")

    add("")
    add("=" * 78)
    add("  BREAKEVEN")
    add("=" * 78)
    add(f"  Installed cost ${inv.total:,.0f}  "
        f"(machine ${inv.machine:,.0f} plus handling, runout, power, install)")
    add(f"  Depreciation   ${inv.annual_depreciation:,.0f}/yr over "
        f"{inv.life_years} years")
    add(f"  Line fixed cost ${line.annual_fixed_cost:,.0f}/yr regardless of "
        f"how little it runs")
    add("")
    be = breakeven_loads_per_month(coil, line, buy, inv, ref_profile)
    if be == float("inf"):
        add("  No volume makes this pay at these assumptions.")
    else:
        add(f"  Volume at which making beats buying: "
            f"{be:.2f} loads/month  ({be * 12 * LF_PER_LOAD:,.0f} LF/yr)")
        add(f"  Against a base-case year 3 run rate of 5.0 loads/month.")
    add("=" * 78)

    print("\n".join(L))


if __name__ == "__main__":
    main()
