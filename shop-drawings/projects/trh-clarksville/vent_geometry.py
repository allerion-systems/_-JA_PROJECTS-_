"""Geometry model for the DCSM metal roof vent at TRH Clarksville.

BASIS
-----
The architect's roof plan governs. It calls for:

    "DCSM METAL ROOF VENT (COLOR: GALVALUME) - NFA MIN. 105 S.I.
     AT HIGH, TYP. OF 2"
    "PROVIDE 6"x18" (THRU METAL ROOF, INSULATION, & PLYWOOD)
     OPENING BETWEEN RAFTERS EACH VENT LOCATION"

So three things that the submittal binder never established are fixed by
contract: the required net free area (105 sq in minimum), the deck opening
(6" x 18"), and the quantity (2). "AT HIGH" places the vents at the high point
of the roof plane, which is consistent with the manufacturer's own method of
running the rear counterflashing under the ridge cap.

Dan's Custom Sheet Metal still publishes NO dimensions for the vent itself -
no throat size, no height, no flange, no gauge, no tested NFA. So the shell is
designed here to MEET the architect's 105 sq in, and the calculation is shown
on the sheet rather than asserted.

DIMENSION SOURCES
-----------------
  opening 6" x 18"   architect's roof plan, verbatim
  NFA >= 105 sq in   architect's roof plan, verbatim
  qty 2              architect's roof plan, verbatim
  throat 20" x 7-1/2" sized here to deliver the required NFA - see net_free_area
  flange_up   8"     UFGS 07 60 00 3.1.11 - up vertical surfaces not less
                     than 8"; DCSM's own off-ridge vent uses a 7" flange
  flange_dn   6"     UFGS 07 60 00 3.1.11 - onto the roof covering not less
                     than 4-1/2" at the lower side; also the Metal Sales
                     published 6" endlap
  curb 1"            turned-up curb; hood skirt laps 1-1/2" over it
  hem 1/2"           all exposed edges

COORDINATES
-----------
  x  across the roof, 0 at the vent centreline
  y  up the slope, measured IN THE PLANE OF THE ROOF, 0 at the throat face
  z  normal to the roof plane

THE ASSEMBLY - four braked parts plus screen
  1  BASE PAN             deck flashing, 6"x18" opening + turned-up curb
  2  HOOD                 sloped top with sides folded down, open downslope
  3  REAR COUNTERFLASHING under the ridge cap, folds over the hood top
  4  SIDE COUNTERFLASHING both sides
"""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass
class VentGeometry:
    """All controlling dimensions, in inches."""

    # -- fixed by the architect's roof plan ---------------------------------
    nfa_required: float = 105.0   # sq in, minimum, per vent
    opening_w: float = 18.0       # across the roof   (the "18" of 6"x18")
    opening_l: float = 6.0        # up the slope      (the "6" of 6"x18")
    qty: int = 2                  # "TYP. OF 2"

    # -- module -------------------------------------------------------------
    panel_coverage: float = 24.0  # Metal Sales 5V-Crimp net coverage

    # -- throat: sized to deliver the required NFA --------------------------
    throat_w: float = 20.0
    throat_h: float = 7.5

    # -- hood ---------------------------------------------------------------
    hood_l: float = 11.0          # along the slope, covers opening + curbs
    hood_rise: float = 9.00       # height at the upslope end
    hood_overhang: float = 1.25   # projection past the throat face (drip)
    hood_lap: float = 1.50        # skirt lap each side of the throat

    # -- opening position, measured up-slope from the throat face -----------
    opening_y0: float = 2.50

    # -- base pan -----------------------------------------------------------
    curb_h: float = 1.00
    flange_up: float = 8.00       # upslope, runs to the ridge
    flange_dn: float = 6.00       # downslope, laps OVER the panel below

    # -- counterflashing ----------------------------------------------------
    cf_lap: float = 4.00          # SMACNA 4" lap over the pan flange

    # -- laps and hems ------------------------------------------------------
    hem: float = 0.50
    seam_lap: float = 1.00

    # -- roof ---------------------------------------------------------------
    slope_rise: float = 4.0       # rise per 12 of run - FIELD VERIFY

    # -- fabrication --------------------------------------------------------
    material: str = "24ga galv"   # UFGS Table I: base flashing 24 ga

    # Free-area fraction of the throat after 1/4" mesh screen and entry
    # losses. 1/4" mesh on 0.025" wire is about 0.83 open by itself
    # ((0.25/0.275)^2); 0.75 carries additional margin for entry loss and
    # screen distortion. A tested figure from the manufacturer governs.
    screen_free_pct: float = 0.75

    # ------------------------------------------------------------------
    # derived
    # ------------------------------------------------------------------
    @property
    def slope_angle(self) -> float:
        return math.degrees(math.atan2(self.slope_rise, 12.0))

    @property
    def base_w(self) -> float:
        """Base pan net coverage - matches the panel module so it laps at the
        sidelap double-V on both sides, exactly as a panel would."""
        return self.panel_coverage

    @property
    def base_l(self) -> float:
        return self.hood_l + self.flange_up + self.flange_dn

    @property
    def ridge_y(self) -> float:
        """Up-slope station of the ridge. Panels run continuous eave to ridge
        (39'-3" on this job), so there is no course above to tuck an upslope
        flange under - which is why the rear counterflashing goes under the
        ridge cap instead, and why the plan notes the vents 'AT HIGH'."""
        return self.hood_l + self.flange_up

    @property
    def opening_y1(self) -> float:
        return self.opening_y0 + self.opening_l

    @property
    def pan_edge_to_throat(self) -> float:
        return (self.base_w - self.throat_w) / 2.0

    @property
    def hood_slope_len(self) -> float:
        """True length of the hood's sloped top, drip edge to back corner."""
        rise = self.hood_rise - self.throat_h
        return math.hypot(self.hood_l + self.hood_overhang, rise)

    @property
    def hood_pitch_deg(self) -> float:
        return math.degrees(math.atan2(self.hood_rise - self.throat_h,
                                       self.hood_l + self.hood_overhang))

    @property
    def hood_top_w(self) -> float:
        """Width of the hood's top plate between the two side folds."""
        return self.throat_w + 2 * self.hood_lap

    @property
    def hood_blank_w(self) -> float:
        """Overall hood blank width, sides folded down at their deepest."""
        return self.hood_top_w + 2 * self.hood_rise

    # ---- ventilation --------------------------------------------------
    @property
    def gross_throat_area(self) -> float:
        return self.throat_w * self.throat_h

    @property
    def net_free_area(self) -> float:
        """CALCULATED net free area, square inches."""
        return self.gross_throat_area * self.screen_free_pct

    @property
    def deck_opening_area(self) -> float:
        return self.opening_w * self.opening_l

    @property
    def nfa_ok(self) -> bool:
        return self.net_free_area >= self.nfa_required

    @property
    def nfa_margin(self) -> float:
        return self.net_free_area - self.nfa_required

    # ------------------------------------------------------------------
    # section profiles - (y up-slope, z normal to roof)
    # ------------------------------------------------------------------
    def section_base_pan(self) -> list[tuple[float, float]]:
        g = self
        return [
            (-g.flange_dn, 0.0),
            (g.opening_y0, 0.0), (g.opening_y0, g.curb_h),
            (g.opening_y1, g.curb_h), (g.opening_y1, 0.0),
            (g.ridge_y, 0.0),
        ]

    def section_hood(self) -> list[tuple[float, float]]:
        g = self
        return [
            (-g.hood_overhang, g.throat_h - g.hem),   # hemmed drip edge
            (-g.hood_overhang, g.throat_h),
            (g.hood_l, g.hood_rise),
            (g.hood_l, 0.10),                          # back plate to the pan
        ]

    def section_rear_cf(self) -> list[tuple[float, float]]:
        """Lies on the pan's upslope flange, turns up behind the hood and
        folds forward over the hood top; upslope end runs under the ridge cap.
        Water off the ridge sheds onto the hood and away."""
        g = self
        return [
            (g.ridge_y, 0.30),
            (g.hood_l + 0.30, 0.30),
            (g.hood_l + 0.30, g.hood_rise + 0.40),
            (g.hood_l - 1.30, g.hood_rise - 0.05),
        ]

    def hood_blank_outline(self) -> list[tuple[float, float]]:
        """Cut outline of the hood blank, in flat-pattern coordinates.

        x runs along the developed girth, y across it, centred on 0. The side
        folds are trapezoidal: the side is only throat_h deep at the drip edge
        and hood_rise deep at the back corner, so the blank tapers.
        """
        g = self
        L = g.hood_slope_len
        Lf = L + (g.hood_rise - 0.10) + g.seam_lap
        a = g.hood_top_w / 2.0 + g.throat_h      # half-width at the drip
        b = g.hood_top_w / 2.0 + g.hood_rise     # half-width at the back
        return [(0.0, a), (L, b), (Lf, b), (Lf, -b), (L, -b), (0.0, -a)]

    # ------------------------------------------------------------------
    def summary(self) -> dict:
        return {
            "quantity": f"{self.qty} (architect: TYP. OF 2)",
            "deck opening": f'{self.opening_l:g}" x {self.opening_w:g}" '
                            f"= {self.deck_opening_area:.0f} sq in",
            "throat (w x h)": f'{self.throat_w:g}" x {self.throat_h:g}"',
            "hood length / rise": f'{self.hood_l:g}" / {self.hood_rise:g}"',
            "base pan (w x l)": f'{self.base_w:g}" x {self.base_l:g}"',
            "hood blank (w)": f'{self.hood_blank_w:g}"',
            "hood pitch off roof": f"{self.hood_pitch_deg:.1f} deg",
            "roof slope": f"{self.slope_rise:g}:12 "
                          f"({self.slope_angle:.1f} deg) FIELD VERIFY",
            "gross throat area": f"{self.gross_throat_area:.0f} sq in",
            "NFA required": f"{self.nfa_required:.0f} sq in",
            "NFA provided (calc)": f"{self.net_free_area:.0f} sq in",
            "NFA check": ("OK, margin "
                          f"{self.nfa_margin:+.0f} sq in" if self.nfa_ok
                          else f"FAILS by {-self.nfa_margin:.0f} sq in"),
        }


# Open items that MUST appear on the sheet. Nothing here is invented away.
RFI_ITEMS = [
    "SUBMITTAL DEFECT: the Tab 9 cut sheet is titled \"Proper Installation of "
    "a Vent on a STANDING SEAM Metal Roof System\" and states the vent \"sits "
    "on TOP of the standing seam rather than on the flat section of the "
    "panel.\" The TOC and tab divider call it 5V. No 5V vent literature was "
    "submitted and nothing describes how it laps into a 5V panel. The roof "
    "plan calls the panel \"5 RIB V-GROOVE\".",
    "DCSM publishes NO dimensions and NO tested net free area for this vent. "
    "The throat is sized here to MEET the roof plan's NFA MIN. 105 S.I.; the "
    "calculation is shown on SM-1. A tested figure from the manufacturer "
    "governs and is requested.",
    "No metal-roof penetration detail was submitted. Metal Sales manual p.17 "
    "cross-references \"ROOF PENETRATION (SEE PAGE 25)\" but only manual pages "
    "17-19 are in the binder.",
    "Roof slope at each vent: the roof plan notes sidelap sealant is required "
    "on pitches LESS THAN 3:12, but Metal Sales publishes 3:12 as the panel's "
    "MINIMUM slope. Confirm the actual pitch at both vent locations and "
    "whether a sub-3:12 plane is involved - that is a manufacturer conflict, "
    "not just a sealant note.",
    "Confirm rafter spacing and direction at both vent locations. The 6\"x18\" "
    "opening must fall between rafters without cutting one.",
    "DCSM's own 5V spec sheet states 23-1/2\" coverage while their Miami-Dade "
    "NOA 19-0109.04 drawing shows 24\". The specified Metal Sales panel is "
    "24\". Confirm the vent is built to the 24\" module.",
    "Sidelap double-V spread, V rib base width and V included angle are not "
    "published by Metal Sales, DCSM or the NOA. Measure from an actual panel.",
    "Fastener conflict within the binder: p.35 lists #10-14 x 1\" ABMP XL, "
    "UL 580 Const. #435; p.58 cites Const. #579 & #453, which specify "
    "#9-15 x 1\" Type A. Confirm which governs.",
    "Vent gauge: 26 ga to match the roof panel per DCSM's \"same gauge as your "
    "main roof\" rule, or 24 ga per UFGS Table I for base flashing. This "
    "drawing shows 24 ga.",
    "Roof plan notes no direct contact between the leak barrier and the roof "
    "membrane (not compatible, see 6/A8). Confirm the underlayment used at "
    "the vent does not conflict where the metal roof meets the membrane.",
]


if __name__ == "__main__":
    g = VentGeometry()
    for k, v in g.summary().items():
        print(f"{k:>22} : {v}")
    print(f"\n  open RFI items: {len(RFI_ITEMS)}")
