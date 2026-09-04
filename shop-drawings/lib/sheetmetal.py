"""Sheet metal engineering data and flat-pattern (stretch-out) math.

All thicknesses in decimal inches. All angles in degrees unless noted.

Sources for the gauge tables are recorded in REFERENCES.md alongside this
package; the decimal values here are the Manufacturers' Standard Gauge for
steel sheet and the ASTM A653 coated equivalents. Verify against the mill
cert for the actual coil before cutting metal.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field


# --------------------------------------------------------------------------
# Gauge tables
# --------------------------------------------------------------------------

# Manufacturers' Standard Gauge, uncoated steel sheet (in.)
STEEL_UNCOATED = {
    28: 0.0149, 26: 0.0179, 24: 0.0239, 22: 0.0299,
    20: 0.0359, 18: 0.0478, 16: 0.0598, 14: 0.0747, 12: 0.1046,
}

# Galvanized sheet, ASTM A653 G90 — nominal incl. coating (in.)
STEEL_GALVANIZED = {
    28: 0.0187, 26: 0.0217, 24: 0.0276, 22: 0.0336,
    20: 0.0396, 18: 0.0516, 16: 0.0635, 14: 0.0785, 12: 0.1084,
}

# Stainless steel sheet gauge (in.)
STAINLESS = {
    28: 0.0156, 26: 0.0187, 24: 0.0250, 22: 0.0312,
    20: 0.0375, 18: 0.0500, 16: 0.0625,
}

# Aluminum is specified by decimal thickness, not gauge.
ALUMINUM = {
    ".025": 0.025, ".032": 0.032, ".040": 0.040,
    ".050": 0.050, ".063": 0.063, ".080": 0.080, ".090": 0.090, ".125": 0.125,
}

# Copper is specified by weight per square foot (oz) (in.)
COPPER = {16: 0.0216, 20: 0.0270, 24: 0.0323, 32: 0.0431}


def thickness(spec: str) -> float:
    """Resolve a material spec string to a decimal thickness in inches.

    Accepts e.g. "24ga galv", "22ga", ".040 alum", "20oz copper".
    """
    s = spec.lower().strip()
    if "alum" in s or s.startswith("."):
        for k, v in ALUMINUM.items():
            if k in s:
                return v
        raise ValueError(f"unrecognized aluminum thickness: {spec!r}")
    if "copper" in s or "oz" in s:
        n = int("".join(c for c in s.split("oz")[0] if c.isdigit()))
        return COPPER[n]
    n = int("".join(c for c in s.split("ga")[0] if c.isdigit()))
    if "stainless" in s or "ss" in s:
        return STAINLESS[n]
    if "galv" in s or "g90" in s or "gs" in s:
        return STEEL_GALVANIZED[n]
    return STEEL_UNCOATED[n]


# --------------------------------------------------------------------------
# Bend math
# --------------------------------------------------------------------------
#
#   BA   = (pi/180) * A * (R + K*T)        bend allowance, arc along neutral axis
#   OSSB = tan(A/2) * (R + T)              outside setback
#   BD   = 2*OSSB - BA                     bend deduction
#
#   flat length = sum(mold-line legs) - sum(BD)      [outside/mold-line method]
#               = sum(tangent legs)   + sum(BA)      [tangent method]
#
# K-factor is the ratio of neutral-axis offset to material thickness. For air
# bending mild steel at a small radius it runs ~0.40-0.45; press-brake bottoming
# on thin architectural gauges runs lower. 0.42 is the common shop default and
# is what is used here unless overridden.

K_DEFAULT = 0.42

# Minimum inside bend radius as a multiple of thickness. Thin architectural
# gauges brake sharp; a 1T radius is a safe drawing assumption for 24ga steel.
MIN_BEND_RADIUS_MULTIPLE = {
    "steel": 1.0,
    "galvanized": 1.0,
    "stainless": 1.5,
    "aluminum": 1.5,   # 3003-H14 / 5052-H32 at these gauges
    "copper": 1.0,
}


def bend_allowance(angle: float, radius: float, thk: float, k: float = K_DEFAULT) -> float:
    """Arc length of the neutral axis through the bend, in inches."""
    return math.radians(angle) * (radius + k * thk)


def outside_setback(angle: float, radius: float, thk: float) -> float:
    """Distance from the bend tangent to the mold line (apex), in inches."""
    return math.tan(math.radians(angle) / 2.0) * (radius + thk)


def bend_deduction(angle: float, radius: float, thk: float, k: float = K_DEFAULT) -> float:
    """Amount to subtract from the summed mold-line legs, in inches."""
    return 2.0 * outside_setback(angle, radius, thk) - bend_allowance(angle, radius, thk, k)


@dataclass
class Bend:
    """One brake bend in a profile."""
    angle: float                 # included bend angle turned, degrees (90 = square)
    direction: str = "UP"        # UP or DOWN as the part sits on the brake
    radius: float | None = None  # inside radius; None -> min radius for material
    note: str = ""


@dataclass
class Segment:
    """One flat leg of a profile, dimensioned to the mold line (apex)."""
    length: float
    label: str = ""


@dataclass
class Profile:
    """A braked sheet metal profile: alternating segments and bends.

    ``segments`` must be exactly one longer than ``bends``.
    """
    name: str
    material: str                       # e.g. "24ga galv steel"
    segments: list[Segment]
    bends: list[Bend] = field(default_factory=list)
    hems: int = 0                       # count of 180-deg safety hems
    hem_allowance: float = 0.50         # added girth per hem (0.5" open hem)
    qty: int = 1
    finish: str = ""

    # -- derived ----------------------------------------------------------
    @property
    def thk(self) -> float:
        return thickness(self.material)

    @property
    def default_radius(self) -> float:
        s = self.material.lower()
        for key, mult in MIN_BEND_RADIUS_MULTIPLE.items():
            if key in s:
                return round(mult * self.thk, 4)
        return round(1.0 * self.thk, 4)

    @property
    def mold_line_girth(self) -> float:
        """Sum of the mold-line legs. This is the number a shop calls 'girth'."""
        return sum(s.length for s in self.segments) + self.hems * self.hem_allowance

    @property
    def total_deduction(self) -> float:
        t = self.thk
        return sum(
            bend_deduction(b.angle, b.radius if b.radius is not None else self.default_radius, t)
            for b in self.bends
        )

    @property
    def flat_length(self) -> float:
        """Precise developed (stretch-out) length after bend deduction."""
        return self.mold_line_girth - self.total_deduction

    def bend_table(self) -> list[dict]:
        """Per-bend numbers for the drawing's bend schedule."""
        t = self.thk
        rows = []
        for i, b in enumerate(self.bends, start=1):
            r = b.radius if b.radius is not None else self.default_radius
            rows.append({
                "no": i,
                "angle": b.angle,
                "dir": b.direction,
                "radius": r,
                "ba": bend_allowance(b.angle, r, t),
                "bd": bend_deduction(b.angle, r, t),
                "note": b.note,
            })
        return rows

    def flat_stations(self) -> list[float]:
        """Cumulative bend-line positions along the flat blank, in inches.

        Each bend consumes its deduction, so the bend line sits at the running
        mold-line total less the deductions taken so far.
        """
        stations, running, taken = [], 0.0, 0.0
        for i, b in enumerate(self.bends):
            running += self.segments[i].length
            r = b.radius if b.radius is not None else self.default_radius
            stations.append(running - taken)
            taken += bend_deduction(b.angle, r, self.thk)
        return stations


# --------------------------------------------------------------------------
# Ventilation sizing
# --------------------------------------------------------------------------

def required_nfa_sqin(attic_area_sqft: float, ratio: int = 300) -> float:
    """Required net free ventilating area, in square inches.

    ratio=300 is the 1/300 allowance permitted where the code's balance and
    vapour-retarder conditions are met; ratio=150 is the base requirement.
    Confirm against the edition of the code the AHJ has adopted.
    """
    return (attic_area_sqft / ratio) * 144.0


def units_required(attic_area_sqft: float, nfa_per_unit_sqin: float, ratio: int = 300) -> int:
    need = required_nfa_sqin(attic_area_sqft, ratio)
    return math.ceil(need / nfa_per_unit_sqin) if nfa_per_unit_sqin > 0 else 0


def louver_nfa(width: float, height: float, blades: int, blade_gap: float,
               screen_factor: float = 0.70) -> float:
    """Approximate net free area of a louvered opening, in square inches.

    ``screen_factor`` derates for insect screen and blade blockage; 0.70 is a
    common assumption for a screened louver. Use the manufacturer's tested NFA
    where one is published rather than this estimate.
    """
    return width * blades * blade_gap * screen_factor
