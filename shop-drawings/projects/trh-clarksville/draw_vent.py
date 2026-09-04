"""Generate the shop drawing package for the DCSM roof vent at TRH Clarksville.

    python3 projects/trh-clarksville/draw_vent.py

Writes:
    out/TRH-CLARKSVILLE-5V-ROOF-VENT.pdf        2 sheets, ANSI B landscape
    out/TRH-CLARKSVILLE-5V-ROOF-VENT-FLATS.dxf  flat patterns, CUT/BEND layers

SM-1  assembly - plan, section through the slope, throat elevation, panel
      profile, enlarged detail at the ridge, BOM, ventilation calculation.
SM-2  fabrication - flat patterns with bend lines, bend schedule, cut list,
      fastener and sealant schedules, forming notes, open items.
"""

from __future__ import annotations

import os
import sys
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, ROOT)
sys.path.insert(0, HERE)

from lib.drafting import (Sheet, Viewport, TitleBlock, table, notes_block,
                          fmt_in, fmt_dec, IN, GRAY, LIGHT, FONT, FONT_B,
                          LW_OBJECT, LW_THIN, LW_HIDDEN, DASH_HIDDEN)
from lib import sheetmetal as sm
from lib.dxf import export_flat_patterns
from reportlab.lib.colors import Color

import project as P
from vent_geometry import VentGeometry, RFI_ITEMS
from panel_5v import Panel5V

OUT = os.path.join(ROOT, "out")
os.makedirs(OUT, exist_ok=True)

G = VentGeometry()
PANEL = Panel5V()
TODAY = date.today().strftime("%m/%d/%Y")

DECK = Color(0.87, 0.87, 0.87)


def title_block(sheet_no, sheet_title, scale, of="2"):
    return TitleBlock(
        project=P.PROJECT, location=P.ADDRESS,
        sheet_title=sheet_title, sheet_no=sheet_no, of_sheets=of,
        contractor=P.SUBCONTRACTOR, contractor_addr=P.SUB_ADDR,
        gc=P.GC, architect=P.ARCHITECT,
        drawn_by=P.DRAWN_BY, checked_by=P.CHECKED_BY or "-",
        date=TODAY, scale=scale, job_no=P.GC_JOB,
        submittal_no=P.SUBMITTAL_PARENT, status=P.STATUS,
        revisions=[(0, TODAY, "Issued for approval")],
    )


# ===========================================================================
# SHEET SM-1 - ASSEMBLY
# ===========================================================================

def sheet_assembly(s: Sheet):
    s.draw_border()

    # ------------------------------------------------------------ 1  PLAN
    vp = Viewport(s, 3.30 * IN, 7.30 * IN, 0.100)
    half = G.base_w / 2.0
    y0, y1 = -G.flange_dn, G.ridge_y
    ox = G.opening_w / 2.0
    oy0, oy1 = G.opening_y0, G.opening_y1

    # adjacent panel modules, light
    for mod in (-1, 1):
        bx = mod * G.base_w
        for c in (bx - PANEL.double_v_spread / 2, bx + PANEL.double_v_spread / 2):
            vp.line(c, y0 - 4, c, y1 + 4, lw=0.5, color=GRAY)
        vp.line(bx + mod * PANEL.major_spacing, y0 - 4,
                bx + mod * PANEL.major_spacing, y1 + 4, lw=0.5, color=GRAY)
    for sgn in (-1, 1):
        for c in (sgn * half - PANEL.double_v_spread / 2,
                  sgn * half + PANEL.double_v_spread / 2):
            vp.line(c, y0, c, y1, lw=0.8)

    vp.rect(-half, y0, G.base_w, y1 - y0, lw=LW_OBJECT)
    # deck opening + curb
    vp.rect(-ox - G.curb_h, oy0 - G.curb_h, G.opening_w + 2 * G.curb_h,
            G.opening_l + 2 * G.curb_h, lw=LW_THIN, dash=DASH_HIDDEN)
    vp.rect(-ox, oy0, G.opening_w, G.opening_l, lw=LW_OBJECT)
    # hood footprint above
    vp.rect(-G.hood_top_w / 2, -G.hood_overhang, G.hood_top_w,
            G.hood_l + G.hood_overhang, lw=LW_HIDDEN, dash=DASH_HIDDEN)
    vp.centerline(0, y0 - 3, 0, y1 + 3)

    for f in PANEL.fastener_pattern:
        fx = -half + f
        for fy in (y0 + 2.0, y1 - 2.0):
            vp.circle(fx, fy, 0.30, lw=0.6)
            vp.line(fx - 0.5, fy, fx + 0.5, fy, lw=0.4)
            vp.line(fx, fy - 0.5, fx, fy + 0.5, lw=0.4)

    vp.dim_h(-half, half, y0, offset=-1.02, text=f'{fmt_in(G.base_w)} NET COVERAGE')
    vp.dim_h(-ox, ox, oy1, offset=0.40, text=f'{fmt_in(G.opening_w)} OPENING')
    vp.dim_v(y0, y1, half, offset=1.18)
    vp.dim_v(oy0, oy1, -half, offset=-0.46, text=f'{fmt_in(G.opening_l)} OPNG')
    vp.dim_v(G.hood_l, y1, half, offset=0.50, text=f'{fmt_in(G.flange_up)} UPSLOPE')
    vp.dim_v(y0, 0, half, offset=0.50, text=f'{fmt_in(G.flange_dn)} DNSLOPE')

    vp.leader(-half + PANEL.fastener_pattern[0], y1 - 2.0, -half - 2.0, y1 + 5.5,
              "FASTENERS @ 2-9-2-9", anchor="r")
    vp.leader(ox * 0.55, oy0 + G.opening_l * 0.5, half + 13.0, -12.5,
              f'{fmt_in(G.opening_l)} x {fmt_in(G.opening_w)} OPENING - SEE NOTE 3',
              anchor="l")
    vp.leader(G.hood_top_w / 2, -G.hood_overhang * 0.6, half + 3.0, -7.5,
              "HOOD ABOVE (DASHED)")

    s.text(vp.px(-half - 5.0), vp.py(y1 - 1), "^", 8, FONT_B, "c")
    vp.line(-half - 5.0, y0 + 1, -half - 5.0, y1 - 1.5, lw=LW_THIN)
    vp.text(-half - 7.6, (y0 + y1) / 2 - 2.0, "SLOPE", size=5.6, rot=90, color=GRAY)

    vp.section_mark(-half - 2.5, oy0 + G.opening_l * 0.5,
                    half + 2.5, oy0 + G.opening_l * 0.5, "A", 0, -1, "SM-1")
    vp.view_title(-half - 4.0, y0 - 12.5, "PLAN - VENT IN ROOF PLANE",
                  "1-1/5\"=1'-0\"", "1")

    # --------------------------------------------------------- 2  SECTION
    vs = Viewport(s, 2.345 * IN, 2.45 * IN, 0.142)
    ya, yb = -G.flange_dn - 5, G.ridge_y + 5

    vs.rect(ya, -1.15, yb - ya, 0.85, lw=0.6, fill=DECK)
    vs.text(ya + 0.5, -0.88, "5/8\" PLYWOOD DECK", size=5.0, color=GRAY)
    vs.line(ya, -0.30, yb, -0.30, lw=0.9)
    vs.line(ya, -0.15, yb, -0.15, lw=0.55, color=GRAY)
    # the deck opening itself
    vs.line(G.opening_y0, -1.15, G.opening_y0, 0.0, lw=1.4)
    vs.line(G.opening_y1, -1.15, G.opening_y1, 0.0, lw=1.4)

    vs.line(ya, 0, -G.flange_dn - 0.4, 0, lw=LW_OBJECT)
    vs.polyline([(G.ridge_y - 3.0, 0.62), (G.ridge_y + 0.4, 0.62),
                 (G.ridge_y + 0.4, 2.4)], lw=LW_HIDDEN, dash=DASH_HIDDEN)
    vs.line(G.ridge_y + 0.4, -0.30, G.ridge_y + 0.4, 2.6, lw=1.6)
    vs.text(G.ridge_y - 2.6, 1.05, "RIDGE / HIP CAP", size=5.0, color=GRAY)

    vs.metal_section(G.section_base_pan(), thk_pts=2.3)
    vs.metal_section(G.section_hood(), thk_pts=2.3)
    vs.metal_section(G.section_rear_cf(), thk_pts=2.0)

    for i in range(11):
        zz = 0.15 + i * (G.throat_h - 0.30) / 10.0
        vs.line(-0.30, zz, 0.30, zz, lw=0.35, color=GRAY)

    vs.dim_v(0, G.throat_h, -G.hood_overhang - 2.2, offset=0.0,
             text=f'{fmt_in(G.throat_h)} CLR')
    vs.dim_v(0, G.hood_rise, yb - 0.6, offset=0.0)
    vs.dim_h(G.opening_y0, G.opening_y1, -2.1, offset=0.0)
    vs.dim_h(-G.hood_overhang, G.hood_l, G.hood_rise + 1.7, offset=0.0,
             text=f'{fmt_in(G.hood_l + G.hood_overhang)} HOOD')
    vs.dim_h(-G.flange_dn, 0, -3.3, offset=0.0)
    vs.dim_h(G.hood_l, G.ridge_y, -3.3, offset=0.0)

    vs.balloon(G.opening_y1 + 0.8, 0.05, G.opening_y1 + 1.5, -5.4, 1)
    vs.balloon(G.hood_l * 0.42, G.hood_rise * 0.80, G.hood_l * 0.20,
               G.hood_rise + 3.9, 2)
    vs.balloon(G.hood_l + 0.30, G.hood_rise * 0.45,
               G.hood_l + 6.5, G.hood_rise + 3.9, 3)
    vs.balloon(0.0, G.throat_h * 0.5, -8.5, G.throat_h + 3.4, 5)

    vs.multileader(-G.flange_dn * 0.6, 0.06, -G.flange_dn - 3.5, -6.0,
                   ["DNSLOPE FLANGE OVER PANEL BELOW.",
                    "BUTYL TAPE FULL WIDTH +",
                    "STITCH SCREWS @ 6\" O.C."], anchor="l")
    vs.multileader(G.ridge_y - 3.0, 0.06, G.ridge_y - 0.5, -6.0,
                   ["UPSLOPE FLANGE RUNS TO THE RIDGE.",
                    "BUTYL TAPE FULL WIDTH.",
                    "NO EXPOSED FASTENERS IN WATERWAY."], anchor="l")
    vs.multileader(G.hood_l + 0.30, G.hood_rise + 0.40,
                   G.hood_l - 3.5, G.hood_rise + 4.6,
                   ["REAR COUNTERFLASHING TUCKS UNDER",
                    "RIDGE CAP, FOLDS OVER HOOD TOP"], anchor="r")

    vs.text(ya + 0.5, G.hood_rise + 5.4,
            f"ROOF SLOPE {P.ROOF_SLOPE_DESIGN} - FIELD VERIFY", size=6.0, color=GRAY)
    vs.view_title(ya, -9.6, "SECTION A-A - THROUGH VENT CENTRELINE",
                  "1-3/4\"=1'-0\"", "2")

    # ------------------------------------------------------- 3  ELEVATION
    ve = Viewport(s, 8.75 * IN, 2.95 * IN, 0.115)
    ex = G.base_w / 2.0 + 6
    prof = PANEL.section(x0=-G.base_w * 1.5, n_widths=3)
    ve.polyline([(x, z) for x, z in prof if -ex - 1 <= x <= ex + 1], lw=LW_OBJECT)

    hx = G.hood_top_w / 2.0
    ve.polyline([(-hx, 0), (-hx, G.throat_h), (hx, G.throat_h), (hx, 0)], lw=LW_OBJECT)
    ve.rect(-G.throat_w / 2, 0, G.throat_w, G.throat_h, lw=LW_THIN)
    for i in range(16):
        xx = -G.throat_w / 2 + i * G.throat_w / 15.0
        ve.line(xx, 0.12, xx, G.throat_h - 0.12, lw=0.3, color=GRAY)

    ve.dim_h(-G.throat_w / 2, G.throat_w / 2, G.throat_h, offset=0.40,
             text=f'{fmt_in(G.throat_w)} CLR THROAT')
    ve.dim_v(0, G.throat_h, hx + 1.5, offset=0.0)
    ve.dim_h(-G.base_w / 2, G.base_w / 2, 0, offset=-0.62)
    ve.leader(G.throat_w * 0.22, G.throat_h * 0.55, hx + 2.5, G.throat_h + 3.0,
              '1/4" MESH ALUM. INSECT SCREEN')
    ve.view_title(-ex, -6.6, "DOWNSLOPE ELEVATION - THROAT", "3/4\"=1'-0\"", "3")

    # --------------------------------------------------- 4  PANEL PROFILE
    vn = Viewport(s, 8.75 * IN, 5.62 * IN, 0.125)
    pr = PANEL.section(x0=-G.base_w, n_widths=2)
    vn.polyline([(x, z) for x, z in pr if -18 <= x <= 18], lw=LW_OBJECT)
    vn.dim_h(-PANEL.major_spacing, 0, 0, offset=-0.44,
             text=f'{fmt_in(PANEL.major_spacing)} O.C.')
    vn.dim_h(0, PANEL.major_spacing, 0, offset=-0.44,
             text=f'{fmt_in(PANEL.major_spacing)} O.C.')
    vn.dim_v(0, PANEL.rib_h, -17.0, offset=0.0, text=fmt_in(PANEL.rib_h))
    vn.leader(-G.base_w / 2, PANEL.rib_h, -16.0, 6.6, "DOUBLE V AT SIDELAP")
    vn.leader(0, PANEL.rib_h, 4.0, 4.2, "SINGLE V AT 12\"")
    vn.view_title(-18, -6.6,
                  "METAL SALES 5V-CRIMP - SUBSTRATE PROFILE", "3/4\"=1'-0\"", "4")

    # ------------------------------------------- 5  ENLARGED RIDGE DETAIL
    vd = Viewport(s, 4.87 * IN, 8.05 * IN, 0.20)
    ry = G.ridge_y
    da, db = G.hood_l - 2.6, ry + 1.9

    vd.rect(da, -1.15, db - da, 0.85, lw=0.6, fill=DECK)
    vd.line(da, -0.30, db, -0.30, lw=0.9)
    vd.line(da, -0.15, db, -0.15, lw=0.55, color=GRAY)

    vd.metal_section([(da, G.curb_h), (G.opening_y1, G.curb_h),
                      (G.opening_y1, 0.0), (ry, 0.0)], thk_pts=2.6)
    top_at_da = G.throat_h + (G.hood_rise - G.throat_h) * \
        (da + G.hood_overhang) / (G.hood_l + G.hood_overhang)
    vd.metal_section([(da, top_at_da), (G.hood_l, G.hood_rise),
                      (G.hood_l, 0.10)], thk_pts=2.6)
    vd.metal_section(G.section_rear_cf(), thk_pts=2.3)
    vd.polyline([(ry - 2.6, 0.62), (ry + 0.35, 0.62), (ry + 0.35, 2.2)], lw=1.7)
    vd.text(ry - 2.4, 0.90, "RIDGE CAP", size=5.0, color=GRAY)

    for by in (G.hood_l + 1.3, ry - 1.4):
        vd.circle(by, 0.16, 0.13, lw=0.5, fill=LIGHT)

    vd.dim_h(G.hood_l + 0.30, ry, 0.30, offset=-0.62,
             text=f'{fmt_in(ry - G.hood_l - 0.30)} CF LAP ON FLANGE')
    vd.dim_v(0.30, G.hood_rise + 0.40, G.hood_l - 2.0, offset=0.0,
             text=f'{fmt_in(G.hood_rise + 0.10)} CF UPSTAND')

    vd.leader(G.hood_l + 1.3, 0.16, G.hood_l - 1.2, -2.6,
              "BUTYL TAPE, 3/8\" BEAD", anchor="r")
    vd.leader(ry - 1.4, 0.16, ry + 1.2, -2.6, "BUTYL AT RIDGE CAP")
    vd.leader(G.hood_l - 1.0, G.hood_rise + 0.15, G.hood_l - 4.5,
              G.hood_rise + 2.6, "CF FOLDS OVER HOOD TOP", anchor="r")
    vd.balloon(ry - 3.5, 0.30, ry + 0.6, 3.4, 3)

    vd.view_title(da, -3.6, "ENLARGED DETAIL - REAR CF AT RIDGE",
                  "2-3/8\"=1'-0\"", "5")

    # ------------------------------------------------------------ tables
    rx, rw = 11.42 * IN, 4.92 * IN
    y = 10.36 * IN
    y = table(s, rx, y, [20, 172, 96, 28, 38],
              [["1", "Base pan / deck flashing, 5V edges", "24 ga Galvalume", "1", "SM-2"],
               ["2", "Hood - top + folded sides", "24 ga Galvalume", "1", "SM-2"],
               ["3", "Rear counterflashing", "24 ga Galvalume", "1", "SM-2"],
               ["4", "Side counterflashing", "24 ga Galvalume", "2", "SM-2"],
               ["5", "Insect screen, 1/4\" mesh", "Aluminium", "1", "-"],
               ["6", "Butyl tape sealant, 3/8\" bead", "ASTM C1311", "A/R", "SM-2"],
               ["7", "Panel fastener, #9-15 x 1\" HH", "w/ neoprene wshr", "A/R", "SM-2"],
               ["8", "Stitch screw, #10-12 x 1\" pancake", "Cl.4 w/ EPDM", "A/R", "SM-2"]],
              header=["#", "DESCRIPTION", "MATERIAL", "QTY", "DTL"],
              title=f"BILL OF MATERIALS - PER VENT ({G.qty} REQUIRED)",
              align=["c", "l", "l", "c", "c"])

    y -= 10
    y = table(s, rx, y, [196, 158],
              [["REQUIRED by roof plan", f"NFA MIN. {G.nfa_required:.0f} S.I."],
               ["Deck opening (roof plan)",
                f'{G.opening_l:g}" x {G.opening_w:g}" = {G.deck_opening_area:.0f} sq in'],
               ["Gross throat opening",
                f'{G.throat_w:g}" x {G.throat_h:g}" = {G.gross_throat_area:.0f} sq in'],
               ["Screen / entry derate", f"x {G.screen_free_pct:.2f} (calculated)"],
               ["NFA PROVIDED", f"{G.net_free_area:.0f} sq in"],
               ["Check", f"{G.net_free_area:.0f} >= {G.nfa_required:.0f} OK, "
                         f"margin +{G.nfa_margin:.0f} sq in"],
               ["Basis", "Calculated. Tested figure governs if issued"]],
              header=["VENTILATION", "VALUE"],
              title="NET FREE AREA - PER VENT",
              align=["l", "l"])

    y -= 10
    notes_block(s, rx, y, rw, "GENERAL NOTES", [
        "FIELD VERIFY all dimensions, roof slope and panel module at both vent "
        "locations before fabrication. Dimensions are shop dimensions taken in "
        "the plane of the roof and are OUTSIDE unless noted otherwise.",
        f"Roof plan requires NFA MIN. {G.nfa_required:.0f} S.I. per vent, "
        f"TYP. OF {G.qty}, AT HIGH. Throat is sized to meet it - see the net "
        f"free area calculation. DCSM publishes no tested NFA.",
        f'Deck opening {G.opening_l:g}" x {G.opening_w:g}" thru metal roof, '
        "insulation and plywood, BETWEEN RAFTERS, per the roof plan. Do not "
        "cut a rafter; confirm spacing and direction before cutting.",
        "All components 24 ga Galvalume, ASTM A792 AZ50/AZ55, finish to match "
        "the Metal Sales 5V-Crimp roof panel (code 41, non-painted).",
        "Rear counterflashing tucks UNDER the ridge or hip cap and OVER the "
        "pan's upslope flange. Both sides counterflash.",
        "Panels run continuous eave to ridge on this roof (up to 39'-3\"), so "
        "there is no course above to lap under. Vents are located AT HIGH per "
        "the roof plan; carry the rear counterflashing under the ridge cap. "
        "Downslope flange laps OVER the panel below.",
        "DO NOT SOLDER GALVALUME. Joints to be mechanically locked or riveted "
        "and sealed. Isolate from copper and from treated lumber.",
        "Locate each vent within one panel module; do not fasten through a "
        "crimp. Coordinate with the panel layout, submittal Tab 12.",
        "Fabricate and install per SMACNA Architectural Sheet Metal Manual, "
        "7th Edition (ANSI/SMACNA 1120-2012) and the project specification.",
    ])

    s.draw_title_block(title_block("SM-1", "DCSM ROOF VENT - ASSEMBLY", "AS NOTED"))
    s.save()


# ===========================================================================
# SHEET SM-2 - FABRICATION
# ===========================================================================

def build_profiles() -> list[sm.Profile]:
    m = P.VENT_MATERIAL
    lead_dn = G.flange_dn + G.opening_y0
    lead_up = (G.hood_l - G.opening_y1) + G.flange_up

    base = sm.Profile(
        "1 BASE PAN", m,
        segments=[sm.Segment(lead_dn, "DNSLOPE FLANGE + LEAD"),
                  sm.Segment(G.curb_h, "CURB"),
                  sm.Segment(G.opening_l, "OPENING"),
                  sm.Segment(G.curb_h, "CURB"),
                  sm.Segment(lead_up, "LEAD + UPSLOPE FLANGE")],
        bends=[sm.Bend(90, "UP", note="dnslope curb"),
               sm.Bend(90, "DOWN", note="curb to pan"),
               sm.Bend(90, "UP", note="upslope curb"),
               sm.Bend(90, "DOWN", note="curb to flange")],
        hems=2, qty=1, finish=P.VENT_FINISH)

    hood = sm.Profile(
        "2 HOOD", m,
        segments=[sm.Segment(G.hood_slope_len, "SLOPED TOP"),
                  sm.Segment(G.hood_rise - 0.10, "BACK PLATE"),
                  sm.Segment(G.seam_lap, "BASE FLANGE")],
        bends=[sm.Bend(90 + G.hood_pitch_deg, "DOWN", note="top to back plate"),
               sm.Bend(90, "UP", note="back plate to flange")],
        hems=1, qty=1, finish=P.VENT_FINISH)

    rear = sm.Profile(
        "3 REAR CF", m,
        segments=[sm.Segment(G.ridge_y - G.hood_l - 0.30, "LAP ON PAN FLANGE"),
                  sm.Segment(G.hood_rise + 0.10, "UPSTAND"),
                  sm.Segment(G.seam_lap + 0.30, "FOLD OVER HOOD")],
        bends=[sm.Bend(90, "UP", note="lap to upstand"),
               sm.Bend(90 + G.hood_pitch_deg, "DOWN", note="upstand to fold")],
        hems=1, qty=1, finish=P.VENT_FINISH)

    side = sm.Profile(
        "4 SIDE CF", m,
        segments=[sm.Segment(G.cf_lap, "LAP OVER PAN"),
                  sm.Segment(G.curb_h + G.hood_lap, "UPSTAND"),
                  sm.Segment(G.seam_lap, "RETURN")],
        bends=[sm.Bend(90, "UP", note="lap to upstand"),
               sm.Bend(90, "DOWN", note="upstand to return")],
        hems=1, qty=2, finish=P.VENT_FINISH)

    return [base, hood, rear, side]


BLANK_W = {
    "1 BASE PAN": G.base_w,
    "2 HOOD": G.hood_blank_w,
    "3 REAR CF": G.base_w,
    "4 SIDE CF": G.hood_l + G.hood_overhang,
}

LONGITUDINAL_BENDS = {"2 HOOD": G.hood_rise}


def sheet_flats(s: Sheet, profiles: list[sm.Profile]):
    s.draw_border()

    SC = 0.082
    COL_X = [1.35, 5.15]
    DIM_STACK = 0.92
    TITLE_GAP = 0.34

    cursor = [10.15, 10.15]
    for i, prof in enumerate(profiles, start=1):
        col = 0 if i <= 2 else 1
        L, W = prof.flat_length, BLANK_W[prof.name]
        sc = SC
        top = cursor[col]
        vp = Viewport(s, COL_X[col] * IN, top * IN, sc)

        if prof.name == "2 HOOD":
            # trapezoidal blank: the sides are only throat_h deep at the drip
            # edge and hood_rise deep at the back, so the outline tapers.
            b = G.hood_blank_w / 2.0
            vp.polyline([(x, yy - b) for x, yy in G.hood_blank_outline()],
                        lw=LW_OBJECT, close=True)
            vp.text(L * 0.30, -b - G.hood_top_w / 2.0 + 1.0,
                    "SIDES TAPER - CUT PER OUTLINE", size=5.0, color=GRAY)
        else:
            vp.rect(0, -W, L, W, lw=LW_OBJECT)

        st = prof.flat_stations()
        for x in st:
            vp.bend_line(x, -W, x, 0)
        lb = LONGITUDINAL_BENDS.get(prof.name)
        if lb:
            for zz in (-lb, -W + lb):
                vp.bend_line(0, zz, L, zz)
            vp.text(L * 0.30, -lb + 1.0, "FOLD SIDE DOWN 90 DEG",
                    size=5.0, color=GRAY)
            vp.text(L * 0.30, -W + lb - 2.4, "FOLD SIDE DOWN 90 DEG",
                    size=5.0, color=GRAY)

        prev = 0.0
        for j, x in enumerate(st):
            vp.dim_h(prev, x, -W, offset=-0.26 if j % 2 == 0 else -0.54)
            prev = x
        vp.dim_h(prev, L, -W, offset=-0.26 if len(st) % 2 == 0 else -0.54)
        vp.dim_h(0, L, -W, offset=-0.82, text=f"FLAT {fmt_dec(L)}")
        vp.dim_v(-W, 0, L, offset=0.34)
        for j, x in enumerate(st):
            b = prof.bends[j]
            vp.text(x + 0.4, -W + 0.8, f"{b.direction} {b.angle:.0f} DEG",
                    size=5.0, rot=90, color=GRAY)
        vp.view_title(0, -W - (DIM_STACK + TITLE_GAP) / sc,
                      f"FLAT PATTERN - PART {prof.name}",
                      f"GIRTH {fmt_dec(prof.mold_line_girth)} / "
                      f"BLANK {fmt_dec(L)} x {fmt_dec(W)} / QTY {prof.qty} EA",
                      str(i))
        cursor[col] = top - W * sc - DIM_STACK - TITLE_GAP - 0.42

    # ---- bend schedule ---------------------------------------------------
    rx, rw = 8.30 * IN, 8.00 * IN
    y = 10.36 * IN
    rows = []
    for prof in profiles:
        for r in prof.bend_table():
            rows.append([prof.name.split()[0], r["no"], f"{r['angle']:.1f}",
                         r["dir"], fmt_dec(r["radius"]), fmt_dec(r["ba"]),
                         fmt_dec(r["bd"]), r["note"]])
    y = table(s, rx, y, [32, 30, 44, 40, 58, 64, 60, 248], rows,
              header=["PART", "BEND", "ANGLE", "DIR", "INSIDE R",
                      "BEND ALLOW", "BEND DED", "NOTE"],
              title="BEND SCHEDULE", align=["c", "c", "c", "c", "r", "r", "r", "l"])

    y -= 9
    y = table(s, rx, y, [96, 92, 30, 66, 66, 126],
              [[p.name, p.material, f"{p.qty} x {G.qty}",
                fmt_dec(p.mold_line_girth), fmt_dec(p.flat_length),
                f"{fmt_dec(p.flat_length)} x {fmt_dec(BLANK_W[p.name])}"]
               for p in profiles],
              header=["PART", "MATERIAL", "QTY", "GIRTH", "FLAT", "BLANK L x W"],
              title=f"CUT LIST - PER VENT x {G.qty} VENTS",
              align=["l", "l", "c", "r", "r", "r"])

    y -= 9
    y = table(s, rx, y, [150, 176, 150],
              [["Panel to wood deck", "#9-15 x 1\" Type A hex head",
                "5/8\" OD stl washer + bonded neoprene"],
               ["  spacing", "2-9-2-9 across the 24\" module", "3'-0\" o.c. up the slope"],
               ["Field / panel ends", "#10-14 x 1\" wood screw", "per Metal Sales P5V-9"],
               ["Flashings & closures", "#10-12 x 1\" pancake head", "12\" o.c."],
               ["Sidelap, pitch < 3:12", "SM7108 sealant at each panel", "per roof plan note"],
               ["Concealed laps", "Butyl tape, 3/8\" bead", "ASTM C1311, non-curing"],
               ["Exposed joints", "Polyurethane, gun grade", "ASTM C920, tooled"],
               ["Embedment", "Wood screws min 3/4\" into deck", "UFGS 07 60 00"]],
              header=["LOCATION", "FASTENER / SEALANT", "NOTE"],
              title="FASTENER & SEALANT SCHEDULE", align=["l", "l", "l"])

    y -= 9
    t = sm.thickness(P.VENT_MATERIAL)
    y = notes_block(s, rx, y, rw,
                    "OPEN ITEMS - RESOLVE BEFORE FABRICATION", RFI_ITEMS,
                    size=5.5, lead=7.4)
    y -= 9
    notes_block(s, rx, y, 5.25 * IN, "FORMING NOTES", [
        f"24 ga Galvalume, t = {t:.4f}\" coated (0.0239\" base steel, ASTM "
        f"A792). Minimum inside bend radius 1t. Confirm against the mill cert.",
        f"Flats developed with K = {sm.K_DEFAULT}: "
        f"BA = (pi/180)(A)(R + K t); BD = 2 tan(A/2)(R + t) - BA. "
        f"FLAT = GIRTH - sum of deductions.",
        "K-factor varies with tooling, temper and grain. Bend a coupon and "
        "measure before running production coil.",
        "Phantom lines are FOLD lines - do not cut.",
        "Hood sides taper from the throat height at the drip edge to the full "
        "rise at the back. Cut the blank to the outline shown, then fold.",
        "Hem all exposed edges 1/2\". Corners lapped and riveted, then sealed.",
        "DO NOT SOLDER GALVALUME - the Al-Zn coating will not tin.",
    ], size=5.5, lead=7.4)

    s.draw_title_block(title_block("SM-2", "DCSM ROOF VENT - FABRICATION", "AS NOTED"))
    s.save()


# ===========================================================================

def main():
    pdf = os.path.join(OUT, "TRH-CLARKSVILLE-5V-ROOF-VENT.pdf")
    s = Sheet(pdf, "ANSI_B", landscape=True)
    profiles = build_profiles()
    sheet_assembly(s)
    sheet_flats(s, profiles)
    s.close()

    dxf = os.path.join(OUT, "TRH-CLARKSVILLE-5V-ROOF-VENT-FLATS.dxf")
    export_flat_patterns(profiles, dxf, widths=BLANK_W,
                         title=f"{P.PROJECT} - DCSM ROOF VENT FLAT PATTERNS")

    print("PDF :", pdf)
    print("DXF :", dxf)
    for k, v in G.summary().items():
        print(f"  {k:>22} : {v}")
    print()
    for p in profiles:
        print(f"  {p.name:<12} qty {p.qty}x{G.qty}  girth {p.mold_line_girth:7.3f}  "
              f"flat {p.flat_length:7.3f}  blank {BLANK_W[p.name]:6.2f}")


if __name__ == "__main__":
    main()
