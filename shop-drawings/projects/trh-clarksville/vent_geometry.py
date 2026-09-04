"""Geometry model for the DCSM-type 5V roof vent at TRH Clarksville.

WHY THIS FILE EXISTS
--------------------
Dan's Custom Sheet Metal publishes NO dimensions for the Metal Roof Vent —
no throat size, no height, no flange dimension, no net free area, and no
installation instructions. Their literature gives only the available widths
(12", 16", 24" — "to match the width of the panels"), the material options,
and the fact that the rear counterflashing tucks under the hip/ridge.

So this drawing cannot be a transcription of a manufacturer's cut sheet. It is
a DESIGN drawing: every dimension below is derived from published code and
industry standards, and every one of them is flagged on the sheet as either
CODE-DERIVED or FIELD VERIFY / RFI. That distinction is the whole point — a
shop drawing that silently invents dimensions is worse than no drawing.

BASIS FOR EACH DIMENSION
------------------------
  flange_up    8"    UFGS 07 60 00 §3.1.11 — base flashing extends up vertical
                     surfaces not less than 8"; not less than 4" under the roof
                     covering. DCSM's own off-ridge vent uses a 7" flange.
  flange_dn    6"    UFGS 07 60 00 §3.1.11 — extend onto the roof covering not
                     less than 4-1/2" at the lower side. 6" also matches the
                     Metal Sales published 6" endlap.
  throat_w    20"    Fits the 24" panel module leaving 2" of pan each side to
                     the sidelap double-V, so no fastener or lap lands on the
                     hood skirt.
  curb_h       1"    Turned-up curb; hood skirt laps 1-1/2" over it.
  hem        1/2"    All exposed edges, per spec convention.

COORDINATES
-----------
  x  across the roof, 0 at the vent centreline
  y  up the slope, measured IN THE PLANE OF THE ROOF, 0 at the throat face
  z  normal to the roof plane

Working in the roof plane means every number the shop measures on the bench is
the number printed on the sheet. Roof pitch enters only where noted.

THE ASSEMBLY — four braked parts plus screen
--------------------------------------------
  1  BASE PAN            5V-profile deck flashing, opening + turned-up curb
  2  HOOD                sloped cover: throat face + top, open downslope
  3  REAR COUNTERFLASHING tucks UNDER the ridge/hip cap, OVER the pan's
                          upslope flange — this is DCSM's stated water
                          management method, not a cricket
  4  SIDE COUNTERFLASHING both sides, per DCSM ("both sides counter-flash")
"""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass
class VentGeometry:
    """All controlling dimensions, in inches."""

    # -- module -------------------------------------------------------------
    nominal_width: float = 24.0   # DCSM offers 12 / 16 / 24 to match the panel
    panel_coverage: float = 24.0  # Metal Sales 5V-Crimp net coverage

    # -- throat (sets the ventilation performance) --------------------------
    throat_w: float = 20.0        # clear width of the opening
    throat_h: float = 4.0         # clear height of the opening

    # -- hood ---------------------------------------------------------------
    hood_l: float = 14.0          # length of hood along the slope
    hood_rise: float = 5.50       # height at the upslope end
    hood_overhang: float = 1.25   # projection past the throat face (drip)
    hood_lap: float = 1.50        # skirt lap down over the curb

    # -- base pan -----------------------------------------------------------
    curb_h: float = 1.00          # turned-up curb around the opening
    flange_up: float = 8.00       # upslope, UNDER the panel above  (UFGS 8")
    flange_dn: float = 6.00       # downslope, OVER the panel below (UFGS 4.5" min)

    # -- counterflashing ----------------------------------------------------
    cf_rear_up: float = 6.00      # rear CF leg running up under the ridge cap
    cf_lap: float = 4.00          # CF lap over the pan flange (SMACNA 4")

    # -- laps and hems ------------------------------------------------------
    hem: float = 0.50             # open hem at exposed edges
    seam_lap: float = 1.00        # corner/seam lap

    # -- roof ---------------------------------------------------------------
    slope_rise: float = 4.0       # rise per 12 of run  — FIELD VERIFY

    # -- fabrication --------------------------------------------------------
    material: str = "24ga galv"   # UFGS Table I: base flashing 24 ga
    screen_free_pct: float = 0.70 # screen + blockage derate (ESTIMATE)

    # ------------------------------------------------------------------
    # derived
    # ------------------------------------------------------------------
    @property
    def slope_angle(self) -> float:
        return math.degrees(math.atan2(self.slope_rise, 12.0))

    @property
    def base_w(self) -> float:
        """Base pan net coverage — matches the panel module so it laps at the
        sidelap double-V on both sides, exactly as a panel would."""
        return self.panel_coverage

    @property
    def base_l(self) -> float:
        return self.hood_l + self.flange_up + self.flange_dn

    @property
    def opening_w(self) -> float:
        return self.throat_w

    @property
    def opening_l(self) -> float:
        return self.hood_l - self.hood_overhang

    @property
    def pan_edge_to_throat(self) -> float:
        """Flat pan left each side between the throat and the panel module edge."""
        return (self.base_w - self.throat_w) / 2.0

    @property
    def hood_slope_len(self) -> float:
        """True length of the hood's sloped top, drip edge to back corner."""
        rise = self.hood_rise - self.throat_h
        return math.hypot(self.hood_l + self.hood_overhang, rise)

    @property
    def hood_side_blank(self) -> float:
        """Blank width of the hood: throat plus both folded-down sides."""
        return self.throat_w + 2 * self.hood_lap + 2 * self.hood_rise

    @property
    def hood_pitch_deg(self) -> float:
        return math.degrees(math.atan2(self.hood_rise - self.throat_h, self.hood_l))

    @property
    def gross_throat_area(self) -> float:
        return self.throat_w * self.throat_h

    @property
    def net_free_area(self) -> float:
        """CALCULATED net free area, square inches.

        DCSM publishes no tested NFA. This figure is an engineering estimate
        for sizing only and is labelled as such on the drawing. Where a tested
        figure is later obtained, the tested figure governs.
        """
        return self.gross_throat_area * self.screen_free_pct

    # ------------------------------------------------------------------
    # section profiles — (y up-slope, z normal to roof)
    # ------------------------------------------------------------------
    def section_base_pan(self) -> list[tuple[float, float]]:
        g = self
        y0 = -g.flange_dn
        y2 = g.opening_l
        y3 = y2 + g.flange_up
        return [
            (y0, 0.0),
            (0.0, 0.0), (0.0, g.curb_h),
            (y2, g.curb_h), (y2, 0.0),
            (y3, 0.0),
        ]

    @property
    def ridge_y(self) -> float:
        """Up-slope station of the ridge. The panels run continuous eave to
        ridge (39'-3" on this job), so there is no course above to tuck an
        upslope flange under — which is precisely why DCSM runs the rear
        counterflashing under the ridge cap instead."""
        return self.opening_l + self.flange_up

    def section_hood(self) -> list[tuple[float, float]]:
        """Hood: hemmed drip, throat face, sloped top, back plate to the pan."""
        g = self
        return [
            (-g.hood_overhang, g.throat_h - g.hem),   # hemmed drip edge
            (-g.hood_overhang, g.throat_h),
            (g.hood_l, g.hood_rise),
            (g.hood_l, 0.10),                          # back plate down to pan
        ]

    def section_rear_cf(self) -> list[tuple[float, float]]:
        """Rear counterflashing.

        Lies on the pan's upslope flange, turns up immediately behind the hood
        and folds forward over the hood top. Its upslope end runs under the
        ridge cap. Water off the ridge therefore sheds onto the hood and away —
        it can never reach the throat or the back plate joint.
        """
        g = self
        return [
            (g.ridge_y, 0.30),
            (g.hood_l + 0.30, 0.30),
            (g.hood_l + 0.30, g.hood_rise + 0.40),
            (g.hood_l - 1.30, g.hood_rise - 0.05),
        ]

    # ------------------------------------------------------------------
    def summary(self) -> dict:
        return {
            "nominal width": f'{self.nominal_width:g}" (matches panel module)',
            "throat (w x h)": f'{self.throat_w:g}" x {self.throat_h:g}"',
            "hood length / rise": f'{self.hood_l:g}" / {self.hood_rise:g}"',
            "base pan (w x l)": f'{self.base_w:g}" x {self.base_l:g}"',
            "deck opening (w x l)": f'{self.opening_w:g}" x {self.opening_l:g}"',
            "pan each side of throat": f'{self.pan_edge_to_throat:g}"',
            "hood pitch off roof": f"{self.hood_pitch_deg:.1f} deg",
            "roof slope": f"{self.slope_rise:g}:12 ({self.slope_angle:.1f} deg) FV",
            "gross throat area": f"{self.gross_throat_area:.0f} sq in",
            "NFA (calculated)": f"{self.net_free_area:.0f} sq in",
        }


# Open items that MUST appear on the sheet. Nothing here is invented away.
# Items 1-3 are defects in the approved submittal itself, found by reading all
# 65 pages of the binder — they are not this drawing's assumptions.
RFI_ITEMS = [
    "SUBMITTAL DEFECT: the Tab 9 cut sheet is titled \"Proper Installation of "
    "a Vent on a STANDING SEAM Metal Roof System\" and states the vent \"sits "
    "on TOP of the standing seam rather than on the flat section of the "
    "panel.\" The TOC and tab divider call it 5V. No 5V vent literature was "
    "submitted and nothing describes how it laps into a 5V panel.",
    "Tab 9 carries NO dimensions, NO model number, NO gauge and NO net free "
    "area — it is a one-page sales flyer. Every dimension on this drawing is "
    "therefore new information not covered by the approved submittal.",
    "No metal-roof penetration detail was submitted. Metal Sales manual p.17 "
    "cross-references \"ROOF PENETRATION (SEE PAGE 25)\" but only manual pages "
    "17-19 are in the binder.",
    "Net free area — not published by DCSM for any size. Ventilation "
    "compliance under IBC 1202.2.1 / IRC R806.2 cannot be demonstrated until "
    "a tested figure is obtained.",
    "No project roof slope appears anywhere in the 65-page binder; only Metal "
    "Sales' generic 3:12 minimum. Confirm the actual pitch at the vent.",
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
    "Quantity of vents is not stated in the submittal and no vent line item "
    "appears on the QXO cut list. Confirm count and locations.",
]


if __name__ == "__main__":
    g = VentGeometry()
    for k, v in g.summary().items():
        print(f"{k:>26} : {v}")
    print(f"\n  open RFI items: {len(RFI_ITEMS)}")
