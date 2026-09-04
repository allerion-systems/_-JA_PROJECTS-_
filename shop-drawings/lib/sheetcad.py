"""Solid modelling of braked sheet metal parts, on the OpenCascade kernel.

Builds real B-rep solids with true cylindrical bend faces - not faceted
approximations - so the STEP output can be opened in SolidWorks, Inventor or
Fusion and unfolded by the shop's own sheet metal tools.

A braked part is described the way a brake operator thinks about it: a run of
straight flats separated by bends, each bend having an angle, an inside radius
and a direction. Walk the profile in 2D, extrude across the part width.

Geometry convention
-------------------
The profile is traced in the XY plane and extruded along +Z by the part width.
The trace is the SIDE-A surface of the material; the metal occupies the band
between the trace and the trace offset by ``thickness`` along the left-hand
normal of the direction of travel.

Consequently a LEFT (counter-clockwise) bend puts the bend centre on the
offset side, so the traced curve is the OUTER surface and the inside radius is
measured on the offset curve. A RIGHT (clockwise) bend is the mirror of that.
Both cases are handled in ``_bend_solid`` and verified against the analytic
annular-sector volume in ``self_test``.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

import cadquery as cq

from .sheetmetal import (bend_allowance, bend_deduction, min_bend_radius,
                         thickness as gauge_thk)


# ---------------------------------------------------------------- features

@dataclass
class Flat:
    """A straight run, dimensioned to the mould line (apex)."""
    length: float
    label: str = ""


@dataclass
class Fold:
    """A brake bend.

    Field order is (angle, direction, radius) so the positional form reads the
    way the bend is spoken: Fold(90, "UP"). Direction is validated because a
    silently mistyped direction produces a mirrored part that still builds.
    """
    angle: float                 # degrees turned
    direction: str = "UP"        # UP/LEFT = counter-clockwise, DOWN/RIGHT = cw
    radius: float | None = None  # inside radius; None -> 1t
    label: str = ""

    _CCW = ("LEFT", "L", "CCW", "UP", "U")
    _CW = ("RIGHT", "R", "CW", "DOWN", "D")

    def __post_init__(self):
        d = str(self.direction).upper()
        if d not in self._CCW + self._CW:
            raise ValueError(
                f"Fold direction {self.direction!r} not recognised; "
                f"use one of {self._CCW + self._CW}")
        if self.radius is not None and not isinstance(self.radius, (int, float)):
            raise TypeError(f"Fold radius must be a number, got {self.radius!r}")

    @property
    def ccw(self) -> bool:
        return str(self.direction).upper() in self._CCW


# ---------------------------------------------------------------- helpers

def _rot(v: tuple[float, float], a: float) -> tuple[float, float]:
    c, s = math.cos(a), math.sin(a)
    return (v[0] * c - v[1] * s, v[0] * s + v[1] * c)


def _canonical_sector(r_in: float, r_out: float, a_deg: float, width: float):
    """Annular sector, centred on the origin, sweeping CCW from angle 0.

    Sign convention verified against the analytic volume
    V = (A/2)(r_out^2 - r_in^2)W.
    """
    A = math.radians(a_deg)
    p_in0 = (r_in, 0.0)
    p_out0 = (r_out, 0.0)
    p_out1 = (r_out * math.cos(A), r_out * math.sin(A))
    p_in1 = (r_in * math.cos(A), r_in * math.sin(A))
    return (cq.Workplane("XY")
            .moveTo(*p_in0).lineTo(*p_out0)
            .radiusArc(p_out1, -r_out)
            .lineTo(*p_in1)
            .radiusArc(p_in0, r_in)
            .close().extrude(width))


# ---------------------------------------------------------------- profile

class SheetProfile:
    """A braked strip: alternating flats and folds, extruded across a width."""

    def __init__(self, name: str, material: str, width: float,
                 features: list | None = None, qty: int = 1, finish: str = ""):
        self.name = name
        self.material = material
        self.width = width
        self.features: list = features or []
        self.qty = qty
        self.finish = finish

    # -- material -------------------------------------------------------
    @property
    def t(self) -> float:
        return gauge_thk(self.material)

    @property
    def default_radius(self) -> float:
        """Minimum inside radius for the material - 2T for Galvalume."""
        return round(min_bend_radius(self.material, self.t), 4)

    def _radius(self, f: Fold) -> float:
        return f.radius if f.radius is not None else self.default_radius

    # -- fluent construction --------------------------------------------
    def flat(self, length: float, label: str = "") -> "SheetProfile":
        self.features.append(Flat(length, label))
        return self

    def fold(self, angle: float, direction: str = "UP",
             radius: float | None = None, label: str = "") -> "SheetProfile":
        self.features.append(Fold(angle, direction, radius, label))
        return self

    # -- derived numbers -------------------------------------------------
    @property
    def folds(self) -> list[Fold]:
        return [f for f in self.features if isinstance(f, Fold)]

    @property
    def flats(self) -> list[Flat]:
        return [f for f in self.features if isinstance(f, Flat)]

    @property
    def mold_line_girth(self) -> float:
        return sum(f.length for f in self.flats)

    @property
    def total_deduction(self) -> float:
        return sum(bend_deduction(f.angle, self._radius(f), self.t)
                   for f in self.folds)

    @property
    def flat_length(self) -> float:
        return self.mold_line_girth - self.total_deduction

    def bend_stations(self) -> list[float]:
        """Bend-line positions along the developed blank."""
        out, running, taken = [], 0.0, 0.0
        for f in self.features:
            if isinstance(f, Flat):
                running += f.length
            else:
                out.append(running - taken)
                taken += bend_deduction(f.angle, self._radius(f), self.t)
        return out

    def bend_table(self) -> list[dict]:
        rows = []
        for i, f in enumerate(self.folds, start=1):
            r = self._radius(f)
            rows.append({
                "no": i, "angle": f.angle,
                "dir": "UP" if f.ccw else "DOWN",
                "radius": r,
                "ba": bend_allowance(f.angle, r, self.t),
                "bd": bend_deduction(f.angle, r, self.t),
                "label": f.label,
            })
        return rows

    # -- solid -----------------------------------------------------------
    def solid(self):
        """Build the part as a single B-rep solid."""
        t, W = self.t, self.width
        p = (0.0, 0.0)          # current trace point
        h = 0.0                 # heading, radians
        parts = []

        # A mould-line flat is shortened by the setback each adjacent bend
        # consumes, so the modelled flats meet the bend tangents exactly.
        from .sheetmetal import outside_setback
        idx_flats = [i for i, f in enumerate(self.features) if isinstance(f, Flat)]
        trims = {i: 0.0 for i in idx_flats}
        for i, f in enumerate(self.features):
            if isinstance(f, Fold):
                sb = outside_setback(f.angle, self._radius(f), t)
                for j in (i - 1, i + 1):
                    if j in trims:
                        trims[j] += sb

        for i, f in enumerate(self.features):
            n = (-math.sin(h), math.cos(h))          # left normal
            hv = (math.cos(h), math.sin(h))

            if isinstance(f, Flat):
                L = f.length - trims[i]
                if L <= 1e-9:
                    raise ValueError(
                        f"{self.name}: flat '{f.label or i}' is {f.length}\" but "
                        f"adjacent bends consume {trims[i]:.4f}\" of setback")
                quad = [p,
                        (p[0] + L * hv[0], p[1] + L * hv[1]),
                        (p[0] + L * hv[0] + t * n[0], p[1] + L * hv[1] + t * n[1]),
                        (p[0] + t * n[0], p[1] + t * n[1])]
                parts.append(cq.Workplane("XY").polyline(quad).close().extrude(W))
                p = (p[0] + L * hv[0], p[1] + L * hv[1])

            else:
                R = self._radius(f)
                A = f.angle
                if f.ccw:
                    r_path, r_in, r_out = R + t, R, R + t
                    C = (p[0] + r_path * n[0], p[1] + r_path * n[1])
                    start_dir = (-n[0], -n[1])
                    rot0 = math.atan2(start_dir[1], start_dir[0])
                    sec = _canonical_sector(r_in, r_out, A, W)
                    sec = sec.rotate((0, 0, 0), (0, 0, 1), math.degrees(rot0))
                    sec = sec.translate((C[0], C[1], 0))
                    parts.append(sec)
                    v = _rot(start_dir, math.radians(A))
                    p = (C[0] + r_path * v[0], C[1] + r_path * v[1])
                    h += math.radians(A)
                else:
                    r_path, r_in, r_out = R, R, R + t
                    C = (p[0] - r_path * n[0], p[1] - r_path * n[1])
                    start_dir = (n[0], n[1])
                    rot0 = math.atan2(start_dir[1], start_dir[0]) - math.radians(A)
                    sec = _canonical_sector(r_in, r_out, A, W)
                    sec = sec.rotate((0, 0, 0), (0, 0, 1), math.degrees(rot0))
                    sec = sec.translate((C[0], C[1], 0))
                    parts.append(sec)
                    v = _rot(start_dir, -math.radians(A))
                    p = (C[0] + r_path * v[0], C[1] + r_path * v[1])
                    h -= math.radians(A)

        out = parts[0]
        for q in parts[1:]:
            out = out.union(q)
        return out

    # -- expected volume, for verification -------------------------------
    def expected_volume(self) -> float:
        t, W = self.t, self.width
        from .sheetmetal import outside_setback
        idx_flats = [i for i, f in enumerate(self.features) if isinstance(f, Flat)]
        trims = {i: 0.0 for i in idx_flats}
        for i, f in enumerate(self.features):
            if isinstance(f, Fold):
                sb = outside_setback(f.angle, self._radius(f), t)
                for j in (i - 1, i + 1):
                    if j in trims:
                        trims[j] += sb
        v = 0.0
        for i, f in enumerate(self.features):
            if isinstance(f, Flat):
                v += (f.length - trims[i]) * t * W
            else:
                R = self._radius(f)
                v += math.radians(f.angle) / 2 * ((R + t) ** 2 - R ** 2) * W
        return v


def plate(outline: list[tuple[float, float]], t: float):
    """A flat panel of arbitrary outline, thickness t, lying in XY."""
    return cq.Workplane("XY").polyline(outline).close().extrude(t)


# ---------------------------------------------------------------- self test

def self_test(verbose: bool = True) -> bool:
    """Volume-check the solid builder against closed-form geometry."""
    ok = True
    cases = [
        ("single 90 up", [Flat(4), Fold(90, direction="LEFT"), Flat(3)], 6.0),
        ("single 90 dn", [Flat(4), Fold(90, direction="RIGHT"), Flat(3)], 6.0),
        ("pan, 4 bends", [Flat(6), Fold(90, direction="LEFT"), Flat(1),
                          Fold(90, direction="RIGHT"), Flat(6),
                          Fold(90, direction="RIGHT"), Flat(1),
                          Fold(90, direction="LEFT"), Flat(6)], 24.0),
        ("obtuse 97", [Flat(5), Fold(97, direction="RIGHT"), Flat(4)], 8.0),
    ]
    for name, feats, W in cases:
        sp = SheetProfile(name, "24ga galv", W, list(feats))
        got = sp.solid().val().Volume()
        want = sp.expected_volume()
        good = abs(got - want) < 1e-7
        ok &= good
        if verbose:
            print(f"  {name:<16} vol {got:.7f} vs {want:.7f} "
                  f"{'OK' if good else 'MISMATCH'}   "
                  f"girth {sp.mold_line_girth:.3f} flat {sp.flat_length:.4f}")
    return ok


if __name__ == "__main__":
    print("sheetcad self test")
    print("PASS" if self_test() else "FAIL")
