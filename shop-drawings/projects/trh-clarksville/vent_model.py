"""Solid model of the off-ridge hooded roof vent for TRH Clarksville.

BASIS OF DESIGN
===============
The specified product - the DCSM Metal Roof Vent by Dan's Custom Sheet Metal -
publishes NO dimensions and NO net free area anywhere: not on the product page,
not in any brochure, not in their Florida Product Approval (FL11052, which
covers a different product, the barrel-shaped TILE off-ridge vent), and not in
Miami-Dade NOA 19-0109.04 (which covers only their 5V panel and contains no
vent content). No installation instruction exists publicly. No patent is
assigned to them. Their standing-seam vent cut sheet is 404 and was never
archived.

So this vent is DESIGNED, not copied - and it is designed against dimensioned,
engineer-sealed precedent for the same archetype, taken from other
manufacturers' Florida evaluation reports:

  MMI Off Ridge Vent, FL19567.1 R2 (Millennium Metals, report
  20-224-MMI-ORV-ER, 10/29/2020, sheet 6 "Side View"). Section drawn with
  "Lower Slope (Front)" and "Higher Slope (Back)" - a short steep open face
  down-slope and a long shallow ramp up-slope, which is the DCSM logic:
      height 4-1/2" | front face 2" | flat top 5-1/2" | rear ramp 12"
      base between flanges 18" | front and rear flanges 3" each
      width 24", lengths 2'-10' | 26 ga steel or 0.025" 3105-H14 aluminium
      fastening 11 ga ring-shank or #10 screws, 8" o.c. max, 1-1/2" edge

  ACM Off Ridge Roof Vent, FL48079.1 (American Construction Metals, report
  25-775-ORV-W-ER, 02/10/2026, sheets 6-7) - a complete bend schedule:
      overall 77-5/8" x 24" x 8-3/16"; side profile 3" flange, 6-1/8" top,
      ramp at 145 degrees, base 18-1/2"
      TOP OF HOOD:  1-5/8" upstand > 3/4" > 6-1/8" flat top > ramp > 3" flange
      FRONT FACE:   5/8" > 6-5/8" > 5-1/2" > 1"
      BAFFLE:       1/2" > 3-1/4" > 6-7/8" > 1-5/8"   (72-1/4" x 6-3/4")
      26 ga min, 40 ksi, ASTM A792 or A653 G90
      12 ga x 1-1/4" annular ring-shank, 6" o.c., 1-1/2" from ends
      design uplift -59.85 psf ASD | min slope 4:12

  R&S / RPS standing seam roof curb - the shingle-lap logic at the panel:
      6"-8" curb height up-slope, min 9" between up-slope wall and closures,
      min 3" down-slope flange, min 3" curb sidewall to panel seam,
      integrated 4" water cricket. "Installs under the roof panel on the
      up-slope and over the roof panel on the down-slope."

FORM
====
Read from DCSM's own product photography and corroborated by their copy
("angled back side unlike traditional range vents that have a vertical back
side"; "sits on TOP of the standing seam rib"; "the rear counter-flashing
tucks underneath the hip/ridge ... over top of the rear flange"). Seven
exterior hood faces:

    1  top plane, flat
    2  front fascia - a narrow band folded down from the top, hemmed at its
       lower edge to form the drip lip, overhanging the throat
    3  rear wedge - a raked ramp, NOT a vertical wall, shedding water around
       the vent
    4/5  two side walls, battered (raked inward as they rise), which is what
       makes the rear wedge read trapezoidal - narrowing as it rises
    6/7  rear corner gussets where the battered sides meet the wedge

plus the base pan, the rear counterflashing pan running up-slope under the
ridge cap, and two turned-up legs that cap the panel ribs full length.

THE 5V PROBLEM, CARRIED ON THE DRAWING
======================================
DCSM's premise is that the vent "sits on TOP of the standing seam rather than
on the flat section of the panel ... minimizes the potential for leaking." A
standing seam is 1"-1/2" tall (their own VS-150 is 1-1/2", VS-100 is 1").
The Metal Sales 5V-Crimp specified here has a 1/2" rib - a shallow V, not a
vertical leg. There is nothing to sit on top of. The vent must therefore be
flashed INTO the pan, which is the condition the manufacturer says they avoid,
and the pan-to-panel lap must close the rib profile with Metal Sales 5V-Crimp
inside closures set in butyl.

Coordinates, inches:
    x  across the roof, 0 on the vent centreline
    y  up the slope, 0 at the throat face (down-slope end of the hood)
    z  normal to the roof plane, 0 at the top of the panel flat
"""

from __future__ import annotations

import math
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
    material: str = "24ga galv"

    # -- ventilation requirement, from the architect's roof plan ------------
    nfa_required: float = 105.0    # "NFA MIN. 105 S.I."
    opening_w: float = 18.0        # deck opening across the roof
    opening_l: float = 6.0         # deck opening up the slope
    qty: int = 2                   # "TYP. OF 2"

    # -- hood ---------------------------------------------------------------
    hood_w: float = 24.0           # outside width at the pan (panel module)
    hood_h: float = 8.50           # overall height (ACM: 8-1/2")
    fascia_h: float = 2.00         # front band above the throat (MMI: 2")
    top_len: float = 6.125         # flat top run (ACM: 6-1/8")
    ramp_deg: float = 35.0         # rear wedge off the roof plane (ACM 145 incl.)
    batter_deg: float = 7.0        # side walls raked inward as they rise
    hem: float = 0.50              # drip hem returned under the fascia

    # -- pan ----------------------------------------------------------------
    pan_dn: float = 6.0            # pan down-slope of the throat face
    pan_up: float = 9.0            # rear counterflashing pan (RPS: min 9")
    leg_h: float = 1.0             # turned-up legs capping the ribs

    # ------------------------------------------------------------------
    @property
    def t(self) -> float:
        return gauge_thk(self.material)

    @property
    def throat_h(self) -> float:
        """Clear height of the open slot under the fascia."""
        return self.hood_h - self.fascia_h

    @property
    def throat_w(self) -> float:
        """Clear width of the slot, inside the two side walls."""
        return self.hood_w - 2 * self.t - 2 * 1.0

    @property
    def ramp_run(self) -> float:
        return self.hood_h / math.tan(math.radians(self.ramp_deg))

    @property
    def hood_len(self) -> float:
        """Throat face to the toe of the rear wedge."""
        return self.top_len + self.ramp_run

    @property
    def pan_len(self) -> float:
        return self.pan_dn + self.hood_len + self.pan_up

    @property
    def ridge_y(self) -> float:
        return self.hood_len + self.pan_up

    # -- ventilation ----------------------------------------------------
    screen_free_pct: float = 0.75

    @property
    def gross_throat(self) -> float:
        return self.throat_w * self.throat_h

    @property
    def nfa(self) -> float:
        return self.gross_throat * self.screen_free_pct

    @property
    def nfa_ok(self) -> bool:
        return self.nfa >= self.nfa_required

    # ------------------------------------------------------------------
    def _hood_envelope(self):
        """Outer envelope before shelling: profile extruded, sides battered."""
        prof = [(0.0, 0.0),
                (0.0, self.hood_h),
                (self.top_len, self.hood_h),
                (self.hood_len, 0.0)]
        env = (cq.Workplane("YZ").polyline(prof).close()
               .extrude(self.hood_w / 2.0, both=True))
        # batter: shave each side with a plane raked inward going up
        if self.batter_deg > 0:
            off = self.hood_h * math.tan(math.radians(self.batter_deg))
            big = 4 * self.hood_len
            for sgn in (-1, 1):
                x0 = sgn * self.hood_w / 2.0
                cutter = (cq.Workplane("XZ")
                          .polyline([(x0, 0.0), (x0 + sgn * 3.0, 0.0),
                                     (x0 + sgn * 3.0, self.hood_h + 1),
                                     (x0 - sgn * off, self.hood_h + 1)])
                          .close().extrude(big).translate((0, -big / 2, 0)))
                env = env.cut(cutter)
        return env

    def hood(self):
        """Hood shell: bottom open, throat slot cut at the front."""
        t = self.t
        shell = self._hood_envelope().faces("<Z").shell(-t)
        # throat: open slot under the fascia, full clear width
        slot = (cq.Workplane("XY")
                .box(self.throat_w, 4 * t, self.throat_h,
                     centered=(True, True, False))
                .translate((0, 0, 0)))
        shell = shell.cut(slot)
        # hem: a return turned back under the fascia's lower edge
        hemp = (cq.Workplane("XY")
                .box(self.throat_w + 2 * t, self.hem, t,
                     centered=(True, False, False))
                .translate((0, t, self.throat_h - t)))
        return shell.union(hemp)

    def pan(self):
        t = self.t
        y0 = -self.pan_dn
        p = (cq.Workplane("XY")
             .box(self.hood_w, self.pan_len, t, centered=(True, False, False))
             .translate((0, y0, -t)))
        cut = (cq.Workplane("XY")
               .box(self.opening_w, self.opening_l, 6 * t,
                    centered=(True, True, True))
               .translate((0, self.hood_len / 2.0, 0)))
        p = p.cut(cut)
        for sgn in (-1, 1):
            leg = (cq.Workplane("XY")
                   .box(t, self.pan_len, self.leg_h,
                        centered=(True, False, False))
                   .translate((sgn * (self.hood_w / 2 - t / 2), y0, 0)))
            p = p.union(leg)
        return p

    def assembly(self):
        return self.hood().union(self.pan())

    def summary(self) -> dict:
        a = self.assembly()
        bb = a.val().BoundingBox()
        return {
            "material": f"{self.material}  t={self.t:.4f}\"",
            "hood": f'{self.hood_w:g}"W x {self.hood_len:.2f}"L x {self.hood_h:g}"H',
            "  flat top / ramp": f'{self.top_len:g}" / {self.ramp_run:.2f}" '
                                 f'at {self.ramp_deg:g} deg',
            "  fascia / batter": f'{self.fascia_h:g}" / {self.batter_deg:g} deg',
            "throat (clear)": f'{self.throat_w:.2f}" x {self.throat_h:g}"',
            "pan": f'{self.hood_w:g}" x {self.pan_len:.2f}"',
            "deck opening": f'{self.opening_l:g}" x {self.opening_w:g}"',
            "bbox": f"{bb.xlen:.2f} x {bb.ylen:.2f} x {bb.zlen:.2f}",
            "NFA required": f"{self.nfa_required:.0f} sq in",
            "NFA provided": f"{self.nfa:.0f} sq in  "
                            f"{'OK' if self.nfa_ok else 'FAILS'}",
            "volume / weight": f"{a.val().Volume():.2f} cu in / "
                               f"{a.val().Volume()*0.2836:.2f} lb",
        }


if __name__ == "__main__":
    m = VentModel()
    for k, v in m.summary().items():
        print(f"{k:>20} : {v}")
