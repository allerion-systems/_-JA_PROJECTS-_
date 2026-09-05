"""
TRANSIT LEDGER — PLATE I
Business Model Canvas, Misty Valley Supply Co.

Renders a single-page large-format vector plate.
    python3 plate.py
"""

from __future__ import annotations

import os
import subprocess

from reportlab.lib.colors import Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as rl_canvas

# ---------------------------------------------------------------- substrate

W, H = 1728.0, 1152.0
M = 96.0                       # inviolable margin
LEFT, RIGHT = M, W - M
MEASURE = RIGHT - LEFT

GROUND = Color(0.929, 0.910, 0.871)   # aged stock
IRON   = Color(0.102, 0.094, 0.082)   # not ink — iron
GREY   = Color(0.549, 0.522, 0.471)   # structure only
FAINT  = Color(0.726, 0.698, 0.643)   # the countable ticks
ACCENT = Color(0.608, 0.227, 0.149)   # a stamp pad worked past its prime

FONTDIR = ("/root/.claude/skills/synced/"
           "966af211-f4ea-400a-adbc-69e133d1f4e4_"
           "5f1e3964-35c1-4776-abd3-8305e8802fce/canvas-design/canvas-fonts")

DISPLAY, LABEL, MONO, MONOB = "Display", "Label", "Mono", "MonoB"


def register_fonts() -> None:
    for name, f in ((DISPLAY, "BigShoulders-Bold.ttf"),
                    (LABEL, "ArsenalSC-Regular.ttf"),
                    (MONO, "GeistMono-Regular.ttf"),
                    (MONOB, "GeistMono-Bold.ttf")):
        pdfmetrics.registerFont(TTFont(name, os.path.join(FONTDIR, f)))


# ------------------------------------------------------------ mark-making

WARNINGS: list[str] = []


def tracked_width(text: str, font: str, size: float, track: float) -> float:
    if not text:
        return 0.0
    return pdfmetrics.stringWidth(text, font, size) + track * (len(text) - 1)


def tracked(c, x: float, y: float, text: str, font: str, size: float,
            track: float, color: Color, align: str = "left") -> float:
    """Hand-composition letterspacing. Returns the width laid down."""
    w = tracked_width(text, font, size, track)
    if align == "right":
        x -= w
    elif align == "center":
        x -= w / 2.0
    c.setFont(font, size)
    c.setFillColor(color)
    cur = x
    for ch in text:
        c.drawString(cur, y, ch)
        cur += pdfmetrics.stringWidth(ch, font, size) + track
    return w


def rule(c, x0: float, y: float, x1: float, width: float, color: Color) -> None:
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.setLineCap(0)
    c.line(x0, y, x1, y)


def vrule(c, x: float, y0: float, y1: float, width: float, color: Color) -> None:
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.setLineCap(0)
    c.line(x, y0, x, y1)


def crosshair(c, x: float, y: float, r: float, color: Color) -> None:
    c.setStrokeColor(color)
    c.setLineWidth(0.35)
    c.line(x - r, y, x + r, y)
    c.line(x, y - r, x, y + r)


def fit(text: str, font: str, size: float, track: float, limit: float,
        where: str) -> None:
    if tracked_width(text, font, size, track) > limit:
        WARNINGS.append(f"overflow [{where}] {text!r}")


# ---------------------------------------------------------------- the data

AXIS_X = LEFT + 56.0            # day-scale gutter
PLATE_L = AXIS_X + 12.0
PLATE_R = RIGHT
COLS = 9
PITCH = (PLATE_R - PLATE_L) / COLS
COLW = PITCH - 12.0             # text measure inside a column

Y_TOP = 850.0                   # day 0
Y_BOT = 372.0                   # day 35
DAYS = 35
PPD = (Y_TOP - Y_BOT) / DAYS    # points per day

DIVERT = 8                      # the day the record overtakes the cargo


def yday(d: float) -> float:
    return Y_TOP - d * PPD


FIELDS = [
    ("01", "KEY PARTNERS", [
        (0,  "Misty Valley Contracting"),
        (1,  "ClarkDietrich / Telling / Marino"),
        (3,  "Steel Technologies, Eminence KY"),
        (6,  "Flatbed carriers, I-65"),
        (9,  "Licensed broker (import lane)"),
    ]),
    ("02", "KEY ACTIVITIES", [
        (0,  "Take off the wall schedule"),
        (2,  "Buy the load"),
        (5,  "Sell it while it rolls"),
        (9,  "Cut / label / sequence"),
        (12, "Invoice the same week"),
    ]),
    ("03", "KEY RESOURCES", [
        (0,  "Estimating capability"),
        (1,  "Ten years of paid invoices"),
        (4,  "The piece tally"),
        (9,  "Cut shop, Bonnieville KY"),
        (11, "I-65 / 62 mi to CSX ramp"),
    ]),
    ("04", "VALUE PROPOSITIONS", [
        (5,  "Priced before it is bought"),
        (8,  "Title passes in transit"),
        (10, "By floor, by phase"),
        (12, "Documented to the lot"),
        (14, "Thickness verified, 95% rule"),
    ]),
    ("05", "CUSTOMER RELATIONS", [
        (0,  "One name, one telephone"),
        (2,  "Takeoff furnished at bid"),
        (12, "Terms earned, not extended"),
        (22, "On the deck, not the counter"),
    ]),
    ("06", "CHANNELS", [
        (0,  "Bid-stage takeoff"),
        (5,  "Mill direct to job site"),
        (10, "Own truck, cut package"),
        (16, "Contracting's crews as proof"),
    ]),
    ("07", "CUSTOMER SEGMENTS", [
        (0,  "CFS framing subcontractors"),
        (1,  "GCs self-performing stud"),
        (2,  "Interiors, I-65 corridor"),
        (3,  "Louisville / Nashville / B.G."),
    ]),
    ("08", "COST STRUCTURE", [
        (2,  "Material   $0.695 / LF"),
        (6,  "Freight / drayage / duty"),
        (9,  "Cut labor, fixed once staffed"),
        (12, "Receivable carry, 23 days"),
    ]),
    ("09", "REVENUE STREAMS", [
        (0,  "Takeoff fee, per bid"),
        (8,  "Material margin   14.2%"),
        (10, "Package premium   3-7%"),
        (35, "Cash"),
    ]),
]

FIGURES = [
    ("CASH CONVERSION CYCLE", "35 D"),
    ("PEAK CASH REQUIREMENT", "$498,549"),
    ("STARTUP CAPITAL", "$35,000"),
    ("TERM DEBT", "$0"),
    ("YEAR III REVENUE", "$16,723,800"),
    ("YEAR III EBITDA", "$1,854,960"),
]

EPIGRAPH = "THEN WE GET BUSY AND SELL BEFORE IT GETS TO THE DIVERTING POINT"


# ------------------------------------------------------------------ plate

def draw(path: str) -> None:
    c = rl_canvas.Canvas(path, pagesize=(W, H))
    c.setTitle("Transit Ledger — Plate I")

    c.setFillColor(GROUND)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # --- running head -----------------------------------------------------
    tracked(c, LEFT, 1044, "TRANSIT LEDGER", LABEL, 9.5, 2.6, GREY)
    tracked(c, RIGHT, 1044, "PLATE I OF I", MONO, 7.2, 1.9, GREY, "right")
    tracked(c, LEFT + MEASURE / 2.0, 1044,
            "BUSINESS MODEL, IN NINE FIELDS", MONO, 7.2, 1.9, GREY, "center")
    rule(c, LEFT, 1034, RIGHT, 0.6, IRON)

    # --- the anchor -------------------------------------------------------
    title, tsize = "SOLD BEFORE IT LANDS", 104.0
    ttrack = (MEASURE - pdfmetrics.stringWidth(title, DISPLAY, tsize)) / (len(title) - 1)
    tracked(c, LEFT, 942, title, DISPLAY, tsize, ttrack, IRON)

    rule(c, LEFT, 918, RIGHT, 0.35, GREY)
    tracked(c, LEFT, 900, "MISTY VALLEY SUPPLY CO.", LABEL, 10.5, 2.2, IRON)
    tracked(c, RIGHT, 900, "BONNIEVILLE, KENTUCKY   37.5504 N / 85.8925 W",
            MONO, 7.4, 1.5, GREY, "right")

    # --- day scale --------------------------------------------------------
    tracked(c, AXIS_X, Y_TOP + 16, "DAY", MONO, 6.6, 1.6, GREY, "right")
    vrule(c, AXIS_X + 4, Y_BOT, Y_TOP, 0.35, GREY)
    for d in range(DAYS + 1):
        y = yday(d)
        major = d % 5 == 0
        rule(c, AXIS_X + 4, y, AXIS_X + (11 if major else 7.5),
             0.35 if major else 0.25, GREY if major else FAINT)
        if major:
            c.setFont(MONO, 6.6)
            c.setFillColor(GREY)
            c.drawRightString(AXIS_X - 1, y - 2.3, f"{d:02d}")

    # --- column stems, per-day ticks, plotted entries ---------------------
    for i, (idx, name, entries) in enumerate(FIELDS):
        x = PLATE_L + i * PITCH
        vrule(c, x, Y_BOT, Y_TOP, 0.35, GREY)

        # the countable field: one tick per day, every column
        for d in range(DAYS + 1):
            rule(c, x, yday(d), x + 3.4, 0.25, FAINT)

        # header
        c.setFont(MONO, 7.0)
        c.setFillColor(GREY)
        c.drawString(x, Y_TOP + 32, idx)
        nsize, ntrack = 10.0, 1.5
        while tracked_width(name, LABEL, nsize, ntrack) > COLW and nsize > 7.0:
            nsize -= 0.25
        tracked(c, x, Y_TOP + 14, name, LABEL, nsize, ntrack, IRON)
        rule(c, x, Y_TOP + 8, x + COLW, 0.35, IRON)

        for d, text in entries:
            y = yday(d)
            accent = (i == 3 and d == DIVERT)
            col = ACCENT if accent else IRON
            rule(c, x, y, x + 8.5, 0.5, col)
            c.setFillColor(col)
            c.circle(x, y, 1.5, stroke=0, fill=1)
            c.setFont(MONO, 6.8)
            c.drawString(x + 12.5, y - 2.4, text)
            fit(text, MONO, 6.8, 0.0, COLW - 12.5, f"{idx} d{d}")

    # --- the diverting point ---------------------------------------------
    # The rule crosses the plate only where nothing is written: it is a
    # survey thread, interrupted by every column it passes behind.
    ydiv = yday(DIVERT)
    c.setStrokeColor(ACCENT)
    c.setLineWidth(0.55)
    c.setDash(2.2, 3.4)
    c.line(AXIS_X + 4, ydiv, PLATE_L, ydiv)
    for i in range(COLS):
        x = PLATE_L + i * PITCH
        seg0, seg1 = x + COLW, x + PITCH
        if i == COLS - 1:
            continue
        c.line(seg0, ydiv, seg1, ydiv)
    c.setDash()

    # its name is set in the scale gutter, reading up the page
    c.saveState()
    c.translate(LEFT + 16, ydiv)
    c.rotate(90)
    tracked(c, 0, 0, "DIVERTING POINT   D+08", MONO, 7.0, 1.8, ACCENT,
            "center")
    c.restoreState()

    # --- the void is the finding, so it is labelled -----------------------
    vt, vb = yday(17), Y_BOT
    vrule(c, LEFT + 44, vb, vt, 0.35, FAINT)
    rule(c, LEFT + 41, vt, LEFT + 44, 0.35, FAINT)
    rule(c, LEFT + 41, vb, LEFT + 44, 0.35, FAINT)
    c.saveState()
    c.translate(LEFT + 30, (vt + vb) / 2.0)
    c.rotate(90)
    tracked(c, 0, 0, "NINETEEN DAYS OF WAITING ON THE RECEIVABLE",
            LABEL, 8.5, 2.3, GREY, "center")
    c.restoreState()

    # --- registration -----------------------------------------------------
    for cx, cy in ((PLATE_L, Y_TOP), (PLATE_R, Y_TOP),
                   (PLATE_L, Y_BOT), (PLATE_R, Y_BOT)):
        crosshair(c, cx, cy, 4.5, GREY)
    rule(c, LEFT, Y_BOT, RIGHT, 0.6, IRON)

    # --- epigraph ---------------------------------------------------------
    tracked(c, LEFT + MEASURE / 2.0, 334, EPIGRAPH, LABEL, 11.0, 3.4,
            GREY, "center")

    # --- accumulation: the year-three book -------------------------------
    ax, ay = PLATE_L, 292.0
    per_row, rows, tp, rp = 60, 4, 5.6, 12.0
    c.setStrokeColor(IRON)
    c.setLineWidth(0.5)
    n = 0
    for r in range(rows):
        for k in range(per_row):
            xx = ax + k * tp
            yy = ay - r * rp
            n += 1
            month_end = n % 20 == 0          # one month closed
            c.setLineWidth(0.5)
            c.line(xx, yy, xx, yy + (10.0 if month_end else 7.0))
    assert n == 240, n
    tracked(c, ax, ay - (rows - 1) * rp - 16, "YEAR III BOOK",
            LABEL, 9.0, 2.0, IRON)
    tracked(c, ax + 96, ay - (rows - 1) * rp - 16,
            "240 MARKS / ONE PER LOAD / 20 PER MONTH",
            MONO, 6.8, 1.4, GREY)

    # --- figures ----------------------------------------------------------
    fy = 294.0
    for lab, val in FIGURES:
        tracked(c, RIGHT - 132, fy, lab, LABEL, 8.2, 1.6, GREY, "right")
        c.setFont(MONOB, 8.6)
        c.setFillColor(IRON)
        c.drawRightString(RIGHT, fy, val)
        rule(c, RIGHT - 128, fy - 3.4, RIGHT - 92, 0.25, FAINT)
        fy -= 15.0

    # --- colophon ---------------------------------------------------------
    rule(c, LEFT, 154, RIGHT, 0.35, GREY)
    tracked(c, LEFT, 138,
            "FIGURES: model/proforma.py --scenario direct_ship   "
            "MODEL OUTPUT, NOT AUDITED",
            MONO, 6.8, 1.3, GREY)
    tracked(c, RIGHT, 138, "MMXXVI", MONO, 6.8, 1.9, GREY, "right")

    c.showPage()
    c.save()


if __name__ == "__main__":
    register_fonts()
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "misty-valley-business-model-canvas.pdf")
    draw(out)
    for w in WARNINGS:
        print("WARN", w)
    print("wrote", out)
    subprocess.run(["pdftocairo", "-png", "-r", "110", "-singlefile", out,
                    out[:-4]], check=True)
    print("wrote", out[:-4] + ".png")
