#!/usr/bin/env python3
"""Resident Gantry (RG-1) economics model.

Compares first-cost of a crane-served industrial building built conventionally
vs. with the Resident Gantry system, and finds the nomad-kit break-even
utilization. Every number marked [E] in 04-unit-economics.md is a parameter
here — replace with quotes as Gate 3 (06-kill-tests.md) lands.

Scope note: costs common to both paths (foundations, slab, roof, MEP, pods
themselves) are excluded; the comparison covers only the lines that differ.

Usage:
    python3 rg_model.py --scenario demo_shop
"""

import argparse
import json

# Demo shop: 48 x 120 x 24 eave fab building, 10-ton CMAA Class C bridge.
# Sources for anchors: Mazzella crane price guide (crane $40-100k);
# Printable Concrete 2026 (BOD2-class printer ~$420k). All else [E].
SCENARIOS = {
    "demo_shop": {
        "length_ft": 120.0,
        "width_ft": 48.0,
        "eave_ft": 24.0,
        "opening_frac": 0.15,          # doors/windows share of gross wall area [E]
        "cmu_wall_cost_sf": 22.0,      # installed CMU $/sf [E]
        "printed_wall_premium": 0.15,  # printed walls cost MORE until proven [E]
        "crane_cost": 100_000.0,       # 10T double girder, both paths (Mazzella range top)
        "runway_cost": 60_000.0,       # conventional Class C runway steel installed [E]
        "runway_dual_duty_premium": 0.20,  # RG upsizing for print duty [E]
        "mobile_crane_weeks": 4.0,     # conventional erection lifting [E]
        "mobile_crane_week_rate": 7_500.0,  # hydro crane + operator, weekly [E]
        "rg_nre": 40_000.0,            # dual-duty engineering/submittal, building #1 [E]
        "kit_cost": 160_000.0,         # nomad kit capital (35-40% of BOD2-class) [E]
        "kit_amort_years": 3.0,
        "kit_jobs_per_year": 6.0,      # utilization assumption [E]
        "print_days": 20.0,            # machine-days to print demo walls [E]
        "print_day_op_cost": 900.0,    # operator + material handling + power, daily [E]
    }
}


def wall_area_sf(p):
    """Net printable/laid wall area: perimeter x eave height, less openings."""
    for k in ("length_ft", "width_ft", "eave_ft"):
        if p[k] <= 0:
            raise ValueError(f"{k} must be positive")
    if not 0 <= p["opening_frac"] < 1:
        raise ValueError("opening_frac must be in [0, 1)")
    perimeter = 2 * (p["length_ft"] + p["width_ft"])
    return perimeter * p["eave_ft"] * (1 - p["opening_frac"])


def conventional_cost(p):
    """Differing lines, conventional path: CMU walls + crane + runway + rental."""
    walls = wall_area_sf(p) * p["cmu_wall_cost_sf"]
    rental = p["mobile_crane_weeks"] * p["mobile_crane_week_rate"]
    return {
        "walls": walls,
        "crane": p["crane_cost"],
        "runway": p["runway_cost"],
        "erection_lifting": rental,
        "total": walls + p["crane_cost"] + p["runway_cost"] + rental,
    }


def kit_charge_per_job(p, jobs_per_year=None):
    """Nomad kit amortized charge per job plus print-day operating cost."""
    jobs = p["kit_jobs_per_year"] if jobs_per_year is None else jobs_per_year
    if jobs <= 0 or p["kit_amort_years"] <= 0:
        raise ValueError("jobs_per_year and kit_amort_years must be positive")
    amort = p["kit_cost"] / (p["kit_amort_years"] * jobs)
    return amort + p["print_days"] * p["print_day_op_cost"]


def rg_cost(p, jobs_per_year=None, include_nre=True):
    """Differing lines, RG-1 path: printed walls + crane + upsized runway
    + kit charge (+ first-building NRE). No mobile crane rental.
    include_nre=False gives the steady-state job (building #N, not #1)."""
    walls = wall_area_sf(p) * p["cmu_wall_cost_sf"] * (1 + p["printed_wall_premium"])
    runway = p["runway_cost"] * (1 + p["runway_dual_duty_premium"])
    kit = kit_charge_per_job(p, jobs_per_year)
    nre = p["rg_nre"] if include_nre else 0.0
    out = {
        "walls": walls,
        "crane": p["crane_cost"],
        "runway": runway,
        "kit_charge": kit,
        "nre": nre,
        "total": walls + p["crane_cost"] + runway + kit + nre,
    }
    return out


def break_even_jobs_per_year(p, max_jobs=50):
    """Smallest integer jobs/year at which the STEADY-STATE RG-1 total (no NRE)
    <= conventional total. Returns None if never within max_jobs — meaning
    utilization alone cannot close the gap and the wall premium is the binding
    constraint (see wall_premium_for_parity)."""
    conv = conventional_cost(p)["total"]
    for jobs in range(1, max_jobs + 1):
        if rg_cost(p, jobs_per_year=jobs, include_nre=False)["total"] <= conv:
            return jobs
    return None


def wall_premium_for_parity(p, jobs_per_year=None):
    """The printed-wall premium (over CMU) at which steady-state RG-1 exactly
    matches conventional, at the given utilization. Negative means printed
    walls must be CHEAPER than CMU by that fraction. This is the model's
    headline output: the venture's binding constraint in one number."""
    conv = conventional_cost(p)["total"]
    base = rg_cost(p, jobs_per_year=jobs_per_year, include_nre=False)
    fixed_ex_walls = base["total"] - base["walls"]
    cmu_walls = wall_area_sf(p) * p["cmu_wall_cost_sf"]
    return (conv - fixed_ex_walls) / cmu_walls - 1.0


def report(name):
    p = SCENARIOS[name]
    conv = conventional_cost(p)
    rg_first = rg_cost(p)
    rg_steady = rg_cost(p, include_nre=False)
    return {
        "scenario": name,
        "wall_area_sf": round(wall_area_sf(p)),
        "conventional": {k: round(v) for k, v in conv.items()},
        "rg_first_building": {k: round(v) for k, v in rg_first.items()},
        "rg_steady_state": {k: round(v) for k, v in rg_steady.items()},
        "delta_first_building": round(rg_first["total"] - conv["total"]),
        "delta_steady_state": round(rg_steady["total"] - conv["total"]),
        "break_even_kit_jobs_per_year": break_even_jobs_per_year(p),
        "wall_premium_for_parity_pct": round(100 * wall_premium_for_parity(p), 1),
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--scenario", default="demo_shop", choices=sorted(SCENARIOS))
    args = ap.parse_args()
    print(json.dumps(report(args.scenario), indent=2))
