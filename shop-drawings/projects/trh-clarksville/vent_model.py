"""Solid model of the DCSM-type metal roof vent.

Coordinates, in inches:
    x  across the roof, 0 on the vent centreline
    y  up the slope, 0 at the throat face (downslope end of the hood)
    z  normal to the roof plane, 0 at the top of the panel

The hood is modelled as a closed envelope and then shelled, opening the front
(throat) and bottom faces. That is what the part actually is - a folded shell -
so the wall thickness, the throat opening and the internal plenum are all real
geometry rather than drawn lines.
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, ROOT)

import cadquery as cq
from lib.sheetmetal import thickness as gauge_thk


@dataclass
class VentModel:
    # material
    material: str = "24ga galv"

    # throat / hood
    throat_w: float = 20.0     # clear width of the opening
    throat_h: float = 7.5      # clear height at the front
    hood_w: float = 23.0       # outside width of the hood
    hood_l: float = 11.0       # front face to the top's back edge
    hood_back_h: float = 9.0   # height at the back of the top
    back_wedge: float = 4.0    # how far past hood_l the back slopes down

    # base pan
    pan_w: float = 24.0        # one panel module
    pan_dn: float = 6.0        # pan extent downslope of the throat face
    pan_up: float = 8.0        # pan extent upslope of the back wedge toe
    leg_h: float = 1.0         # turned-up side legs on the pan

    # deck opening, per the architect's roof plan
    opening_w: float = 18.0
    opening_l: float = 6.0
    opening_y0: float = 2.5    # upslope from the throat face

    @property
    def t(self) -> float:
        return gauge_thk(self.material)

    @property
    def back_toe(self) -> float:
        """Up-slope station where the back wedge meets the pan."""
        return self.hood_l + self.back_wedge

    @property
    def pan_len(self) -> float:
        return self.pan_dn + self.back_toe + self.pan_up

    # ------------------------------------------------------------------
    def hood(self):
        """The hood shell: front open, bottom open."""
        t = self.t
        # envelope cross-section in the YZ plane, extruded across x
        pts = [(0.0, 0.0),
               (0.0, self.throat_h),
               (self.hood_l, self.hood_back_h),
               (self.back_toe, 0.0)]
        env = (cq.Workplane("YZ")
               .polyline(pts).close()
               .extrude(self.hood_w / 2.0, both=True))
        # open the front (-Y) and the bottom (-Z)
        shell = env.faces("<Y or <Z").shell(-t)
        return shell

    def pan(self):
        """Base pan: flat plate, deck opening cut, side legs turned up."""
        t = self.t
        y0 = -self.pan_dn
        L = self.pan_len
        p = (cq.Workplane("XY")
             .box(self.pan_w, L, t, centered=(True, False, False))
             .translate((0, y0, -t)))
        # deck opening
        cut = (cq.Workplane("XY")
               .box(self.opening_w, self.opening_l, 4 * t,
                    centered=(True, False, True))
               .translate((0, self.opening_y0, 0)))
        p = p.cut(cut)
        # turned-up legs each side
        for sgn in (-1, 1):
            leg = (cq.Workplane("XY")
                   .box(t, L, self.leg_h, centered=(True, False, False))
                   .translate((sgn * (self.pan_w / 2 - t / 2), y0, 0)))
            p = p.union(leg)
        return p

    def curb(self):
        """Turned-up curb around the deck opening."""
        t = self.t
        h = 1.0
        ow, ol, y0 = self.opening_w, self.opening_l, self.opening_y0
        outer = (cq.Workplane("XY")
                 .box(ow + 2 * t, ol + 2 * t, h, centered=(True, False, False))
                 .translate((0, y0 - t, 0)))
        inner = (cq.Workplane("XY")
                 .box(ow, ol, 3 * h, centered=(True, False, True))
                 .translate((0, y0, 0)))
        return outer.cut(inner)

    def assembly(self):
        return self.hood().union(self.pan()).union(self.curb())

    def summary(self) -> dict:
        a = self.assembly()
        bb = a.val().BoundingBox()
        return {
            "material": f"{self.material}  t={self.t:.4f}\"",
            "throat": f'{self.throat_w:g}" x {self.throat_h:g}"',
            "hood": f'{self.hood_w:g}"W x {self.hood_l:g}"L x '
                    f'{self.hood_back_h:g}"H, back wedge {self.back_wedge:g}"',
            "pan": f'{self.pan_w:g}" x {self.pan_len:g}"',
            "deck opening": f'{self.opening_l:g}" x {self.opening_w:g}"',
            "overall bbox": f"{bb.xlen:.2f} x {bb.ylen:.2f} x {bb.zlen:.2f}",
            "volume (cu in)": f"{a.val().Volume():.3f}",
            "weight @ 0.2836 lb/cu in": f"{a.val().Volume()*0.2836:.2f} lb",
        }


if __name__ == "__main__":
    m = VentModel()
    for k, v in m.summary().items():
        print(f"{k:>26} : {v}")
