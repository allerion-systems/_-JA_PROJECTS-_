"""A small drafting engine for architectural sheet metal shop drawings.

Renders to PDF through reportlab. Model space is inches; paper space is points
(1/72 in). A ``Viewport`` maps one to the other at a stated drawing scale, so
every dimension printed on the sheet is measured off real geometry rather than
lettered in by hand.

Conventions follow ordinary US architectural/mechanical drafting practice:
line-weight hierarchy, extension-line gaps, dimension text above an unbroken
dimension line, phantom line for bend lines, long-dash-dot for centerlines.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field

from reportlab.lib.colors import Color, black, white
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.pdfbase import pdfmetrics

PT = 1.0                # one point
IN = 72.0               # points per inch

# -- line weights (points) --------------------------------------------------
LW_BORDER = 2.0
LW_OBJECT = 1.15
LW_HIDDEN = 0.75
LW_CENTER = 0.55
LW_THIN = 0.55          # dimension, extension, leader
LW_CUT = 1.9            # cutting-plane line
LW_PHANTOM = 0.7        # bend lines
LW_HATCH = 0.45

# -- dash patterns ----------------------------------------------------------
DASH_HIDDEN = (3, 2)
DASH_CENTER = (9, 2, 2, 2)
DASH_PHANTOM = (12, 2, 2, 2, 2, 2)
DASH_CUT = (14, 3, 4, 3)

# -- text heights (points) --------------------------------------------------
TXT_DIM = 6.2
TXT_NOTE = 6.8
TXT_LABEL = 7.5
TXT_VIEW = 9.5
TXT_TITLE = 13.0

GRAY = Color(0.45, 0.45, 0.45)
LIGHT = Color(0.80, 0.80, 0.80)

FONT = "Helvetica"
FONT_B = "Helvetica-Bold"


def _tw(text: str, font: str, size: float) -> float:
    return pdfmetrics.stringWidth(text, font, size)


# ===========================================================================
# Dimension formatting
# ===========================================================================

_FRACTIONS = [
    (0.0, ""), (1 / 16, "1/16"), (1 / 8, "1/8"), (3 / 16, "3/16"), (1 / 4, "1/4"),
    (5 / 16, "5/16"), (3 / 8, "3/8"), (7 / 16, "7/16"), (1 / 2, "1/2"),
    (9 / 16, "9/16"), (5 / 8, "5/8"), (11 / 16, "11/16"), (3 / 4, "3/4"),
    (13 / 16, "13/16"), (7 / 8, "7/8"), (15 / 16, "15/16"), (1.0, ""),
]


def fmt_in(value: float, precision: int = 16) -> str:
    """Format inches as a shop-readable fraction, e.g. 13.375 -> 13-3/8".

    Rounds to the nearest 1/``precision``. Sheet metal is laid out to 1/16".
    """
    neg = value < 0
    v = abs(value)
    whole = int(v)
    frac = v - whole
    # snap to nearest 1/precision
    step = 1.0 / precision
    frac = round(frac / step) * step
    if frac >= 1.0:
        whole += 1
        frac = 0.0
    best = min(_FRACTIONS, key=lambda f: abs(f[0] - frac))
    txt = str(whole) if not best[1] else (f"{whole}-{best[1]}" if whole else best[1])
    if whole == 0 and not best[1]:
        txt = "0"
    return ("-" if neg else "") + txt + '"'


def fmt_ft(value: float) -> str:
    """Format inches as feet-and-inches, e.g. 30 -> 2'-6"."""
    neg = value < 0
    v = abs(value)
    ft = int(v // 12)
    rem = v - ft * 12
    if ft == 0:
        return ("-" if neg else "") + fmt_in(rem)
    return ("-" if neg else "") + f"{ft}'-{fmt_in(rem)}"


def fmt_dec(value: float, places: int = 3) -> str:
    return f"{value:.{places}f}\""


# ===========================================================================
# Sheet
# ===========================================================================

PAPER = {
    "ANSI_A": (8.5, 11.0),
    "ANSI_B": (11.0, 17.0),
    "ANSI_C": (17.0, 22.0),
    "ANSI_D": (22.0, 34.0),
    "ARCH_D": (24.0, 36.0),
}


@dataclass
class TitleBlock:
    project: str = ""
    location: str = ""
    sheet_title: str = ""
    sheet_no: str = ""
    of_sheets: str = ""
    contractor: str = ""
    contractor_addr: str = ""
    gc: str = ""
    architect: str = ""
    drawn_by: str = ""
    checked_by: str = ""
    date: str = ""
    scale: str = ""
    job_no: str = ""
    submittal_no: str = ""
    revisions: list[tuple] = field(default_factory=list)  # (no, date, description)
    status: str = ""


class Sheet:
    """One drawing sheet."""

    def __init__(self, path: str, size: str = "ANSI_B", landscape: bool = True):
        w_in, h_in = PAPER[size]
        if landscape:
            w_in, h_in = h_in, w_in
        self.w = w_in * IN
        self.h = h_in * IN
        self.c = rl_canvas.Canvas(path, pagesize=(self.w, self.h))
        self.c.setLineJoin(1)
        self.c.setLineCap(1)
        self.size_name = size
        # drawing area, set by draw_border()
        self.dx0 = self.dy0 = self.dx1 = self.dy1 = 0.0

    # -- low level ---------------------------------------------------------
    def _style(self, lw: float, dash=None, color=black):
        self.c.setLineWidth(lw)
        self.c.setStrokeColor(color)
        self.c.setDash(dash if dash else [])

    def line(self, x0, y0, x1, y1, lw=LW_OBJECT, dash=None, color=black):
        self._style(lw, dash, color)
        self.c.line(x0, y0, x1, y1)

    def polyline(self, pts, lw=LW_OBJECT, dash=None, color=black, close=False):
        if len(pts) < 2:
            return
        self._style(lw, dash, color)
        p = self.c.beginPath()
        p.moveTo(*pts[0])
        for pt in pts[1:]:
            p.lineTo(*pt)
        if close:
            p.close()
        self.c.drawPath(p)

    def poly_fill(self, pts, color=LIGHT, stroke=False, lw=LW_OBJECT):
        if len(pts) < 3:
            return
        self.c.setFillColor(color)
        self._style(lw)
        p = self.c.beginPath()
        p.moveTo(*pts[0])
        for pt in pts[1:]:
            p.lineTo(*pt)
        p.close()
        self.c.drawPath(p, stroke=1 if stroke else 0, fill=1)
        self.c.setFillColor(black)

    def rect(self, x, y, w, h, lw=LW_OBJECT, dash=None, fill=None, color=black):
        self._style(lw, dash, color)
        if fill is not None:
            self.c.setFillColor(fill)
            self.c.rect(x, y, w, h, stroke=1, fill=1)
            self.c.setFillColor(black)
        else:
            self.c.rect(x, y, w, h, stroke=1, fill=0)

    def circle(self, x, y, r, lw=LW_OBJECT, dash=None, fill=None):
        self._style(lw, dash)
        if fill is not None:
            self.c.setFillColor(fill)
            self.c.circle(x, y, r, stroke=1, fill=1)
            self.c.setFillColor(black)
        else:
            self.c.circle(x, y, r, stroke=1, fill=0)

    def text(self, x, y, s, size=TXT_NOTE, font=FONT, anchor="l", rot=0.0, color=black):
        self.c.saveState()
        self.c.setFillColor(color)
        self.c.setFont(font, size)
        self.c.translate(x, y)
        if rot:
            self.c.rotate(rot)
        if anchor == "c":
            self.c.drawCentredString(0, 0, s)
        elif anchor == "r":
            self.c.drawRightString(0, 0, s)
        else:
            self.c.drawString(0, 0, s)
        self.c.restoreState()

    def text_boxed(self, x, y, s, size=TXT_DIM, font=FONT, pad=1.6):
        """Centred text with the sheet colour knocked out behind it."""
        w = _tw(s, font, size)
        self.c.setFillColor(white)
        self.c.rect(x - w / 2 - pad, y - pad * 0.9, w + 2 * pad, size + pad * 0.6,
                    stroke=0, fill=1)
        self.c.setFillColor(black)
        self.text(x, y, s, size, font, anchor="c")

    # -- border and title block -------------------------------------------
    def draw_border(self, margin=0.30, tb_w=3.05, tb_h=2.22, bind=0.55):
        """Draw the sheet border. Title block occupies the lower-right."""
        m = margin * IN
        self.c.setFillColor(black)
        # outer trim line
        self.rect(m * 0.45, m * 0.45, self.w - 0.9 * m, self.h - 0.9 * m,
                  lw=0.6, color=GRAY)
        # border (binding edge wider on the left)
        x0, y0 = bind * IN, m
        x1, y1 = self.w - m, self.h - m
        self.rect(x0, y0, x1 - x0, y1 - y0, lw=LW_BORDER)
        self.tb_x0 = x1 - tb_w * IN
        self.tb_y0 = y0
        self.tb_x1, self.tb_y1 = x1, y0 + tb_h * IN
        # usable drawing area
        self.dx0, self.dy0, self.dx1, self.dy1 = x0, y0, x1, y1
        self._border = (x0, y0, x1, y1)

        # zone letters/numbers along the border
        self._draw_zones(x0, y0, x1, y1)

    def _draw_zones(self, x0, y0, x1, y1):
        cols = 8
        rows = 4
        self.c.setFillColor(GRAY)
        for i in range(cols):
            xa = x0 + (x1 - x0) * i / cols
            xb = x0 + (x1 - x0) * (i + 1) / cols
            self.text((xa + xb) / 2, y1 - 8.5, str(cols - i), 6.0, FONT, "c", color=GRAY)
            self.text((xa + xb) / 2, y0 + 4.0, str(cols - i), 6.0, FONT, "c", color=GRAY)
            if i:
                self.line(xa, y1, xa, y1 - 11, lw=0.5, color=LIGHT)
                self.line(xa, y0, xa, y0 + 11, lw=0.5, color=LIGHT)
        for j in range(rows):
            ya = y0 + (y1 - y0) * j / rows
            yb = y0 + (y1 - y0) * (j + 1) / rows
            ltr = "ABCD"[j]
            self.text(x0 + 4.5, (ya + yb) / 2 - 2, ltr, 6.0, FONT, "c", color=GRAY)
            self.text(x1 - 4.5, (ya + yb) / 2 - 2, ltr, 6.0, FONT, "c", color=GRAY)
            if j:
                self.line(x0, ya, x0 + 11, ya, lw=0.5, color=LIGHT)
                self.line(x1, ya, x1 - 11, ya, lw=0.5, color=LIGHT)
        self.c.setFillColor(black)

    def draw_title_block(self, tb: TitleBlock):
        x0, y0, x1, y1 = self.tb_x0, self.tb_y0, self.tb_x1, self.tb_y1
        W = x1 - x0
        # knock out the border zone marks behind the block
        self.rect(x0, y0, W, y1 - y0, lw=LW_BORDER, fill=white)

        def hline(y, lw=0.8):
            self.line(x0, y, x1, y, lw=lw)

        def vline(x, ya, yb, lw=0.8):
            self.line(x, ya, x, yb, lw=lw)

        # rows measured from the top of the block down
        r = [y1]
        for h in (0.44, 0.30, 0.30, 0.26, 0.26, 0.26):   # inches
            r.append(r[-1] - h * IN)
        for yy in r[1:]:
            hline(yy)

        pad = 3.2
        lblc = GRAY

        # --- contractor banner
        self.text(x0 + pad, r[0] - 12, tb.contractor, 9.6, FONT_B)
        self.text(x0 + pad, r[0] - 21.5, tb.contractor_addr, 5.6, FONT, color=GRAY)
        self.text(x1 - pad, r[0] - 12, "SHOP DRAWING", 7.6, FONT_B, anchor="r")
        if tb.status:
            self.text(x1 - pad, r[0] - 21.5, tb.status, 5.6, FONT, anchor="r", color=GRAY)

        # --- project
        self.text(x0 + pad, r[1] - 8.0, "PROJECT", 4.9, FONT, color=lblc)
        self.text(x0 + pad, r[1] - 17.5, tb.project, 8.0, FONT_B)
        # --- location
        self.text(x0 + pad, r[2] - 8.0, "LOCATION", 4.9, FONT, color=lblc)
        self.text(x0 + pad, r[2] - 17.5, tb.location, 7.2, FONT)
        # --- sheet title
        self.text(x0 + pad, r[3] - 7.5, "SHEET TITLE", 4.9, FONT, color=lblc)
        self.text(x0 + pad, r[3] - 15.5, tb.sheet_title, 7.6, FONT_B)

        # --- split row: GC / architect
        midx = x0 + W * 0.50
        vline(midx, r[5], r[4])
        self.text(x0 + pad, r[4] - 7.5, "GENERAL CONTRACTOR", 4.9, FONT, color=lblc)
        self.text(x0 + pad, r[4] - 15.5, tb.gc, 6.4, FONT)
        self.text(midx + pad, r[4] - 7.5, "ARCHITECT", 4.9, FONT, color=lblc)
        self.text(midx + pad, r[4] - 15.5, tb.architect, 6.4, FONT)

        # --- split row: drawn / checked / date / job
        q = [x0 + W * f for f in (0.0, 0.25, 0.50, 0.75, 1.0)]
        for xq in q[1:-1]:
            vline(xq, r[6], r[5])
        for (xa, lab, val) in (
            (q[0], "DRAWN BY", tb.drawn_by),
            (q[1], "CHECKED", tb.checked_by),
            (q[2], "DATE", tb.date),
            (q[3], "JOB NO.", tb.job_no),
        ):
            self.text(xa + pad, r[5] - 7.5, lab, 4.9, FONT, color=lblc)
            self.text(xa + pad, r[5] - 15.5, val, 6.4, FONT)

        # --- bottom row: scale / submittal / sheet no
        b0, b1 = r[6], y0
        s = [x0 + W * f for f in (0.0, 0.34, 0.66, 1.0)]
        for xq in s[1:-1]:
            vline(xq, b1, b0)
        self.text(s[0] + pad, b0 - 8.0, "SCALE", 4.9, FONT, color=lblc)
        self.text(s[0] + pad, b0 - 17.0, tb.scale, 6.6, FONT)
        self.text(s[1] + pad, b0 - 8.0, "SUBMITTAL", 4.9, FONT, color=lblc)
        self.text(s[1] + pad, b0 - 17.0, tb.submittal_no, 6.6, FONT)
        self.text(s[2] + pad, b0 - 8.0, "SHEET", 4.9, FONT, color=lblc)
        sn_w = _tw(tb.sheet_no, FONT_B, 12.0)
        self.text(s[2] + pad, b0 - 20.5, tb.sheet_no, 12.0, FONT_B)
        if tb.of_sheets:
            self.text(s[2] + pad + sn_w + 4.0, b0 - 20.5,
                      f"OF {tb.of_sheets}", 6.0, FONT, color=GRAY)

        # --- revision block, stacked above the title block
        self.draw_revision_block(tb, x0, y1)

    def draw_revision_block(self, tb: TitleBlock, x0: float, ybase: float):
        rows = max(len(tb.revisions), 3)
        rh = 0.155 * IN
        hh = 0.17 * IN
        x1 = self.tb_x1
        h = hh + rows * rh
        self.rect(x0, ybase, x1 - x0, h, lw=0.9, fill=white)
        cols = [x0, x0 + 0.28 * IN, x0 + 0.90 * IN, x1]
        # header
        self.line(x0, ybase + h - hh, x1, ybase + h - hh, lw=0.8)
        for xc in cols[1:-1]:
            self.line(xc, ybase, xc, ybase + h, lw=0.6)
        hy = ybase + h - hh + 4.5
        self.text((cols[0] + cols[1]) / 2, hy, "NO.", 4.9, FONT_B, "c")
        self.text((cols[1] + cols[2]) / 2, hy, "DATE", 4.9, FONT_B, "c")
        self.text(cols[2] + 4, hy, "REVISION / RESUBMITTAL", 4.9, FONT_B)
        for i in range(rows):
            yy = ybase + h - hh - (i + 1) * rh
            if i:
                self.line(x0, yy + rh, x1, yy + rh, lw=0.4, color=LIGHT)
            if i < len(tb.revisions):
                n, d, desc = tb.revisions[i]
                self.text((cols[0] + cols[1]) / 2, yy + 4.2, str(n), 5.6, FONT, "c")
                self.text((cols[1] + cols[2]) / 2, yy + 4.2, d, 5.2, FONT, "c")
                self.text(cols[2] + 4, yy + 4.2, desc, 5.2, FONT)

    def save(self):
        self.c.showPage()

    def close(self):
        self.c.save()


# ===========================================================================
# Viewport — model inches to paper points
# ===========================================================================

class Viewport:
    """Maps model space (inches) onto the sheet at a fixed drawing scale."""

    def __init__(self, sheet: Sheet, ox: float, oy: float,
                 scale: float, label: str = ""):
        """``ox``/``oy`` are the paper-space points of model origin (0,0).

        ``scale`` is paper inches per model inch (1/4 for 3"=1'-0", 1.0 for full).
        """
        self.s = sheet
        self.ox, self.oy = ox, oy
        self.scale = scale
        self.label = label

    # -- transforms --------------------------------------------------------
    def px(self, x: float) -> float:
        return self.ox + x * self.scale * IN

    def py(self, y: float) -> float:
        return self.oy + y * self.scale * IN

    def p(self, x: float, y: float) -> tuple[float, float]:
        return self.px(x), self.py(y)

    def d(self, v: float) -> float:
        """Model inches -> paper points."""
        return v * self.scale * IN

    # -- geometry ----------------------------------------------------------
    def line(self, x0, y0, x1, y1, **kw):
        self.s.line(self.px(x0), self.py(y0), self.px(x1), self.py(y1), **kw)

    def polyline(self, pts, **kw):
        self.s.polyline([self.p(*q) for q in pts], **kw)

    def poly_fill(self, pts, **kw):
        self.s.poly_fill([self.p(*q) for q in pts], **kw)

    def rect(self, x, y, w, h, **kw):
        self.s.rect(self.px(x), self.py(y), self.d(w), self.d(h), **kw)

    def circle(self, x, y, r, **kw):
        self.s.circle(self.px(x), self.py(y), self.d(r), **kw)

    def text(self, x, y, s, **kw):
        self.s.text(self.px(x), self.py(y), s, **kw)

    def hidden(self, pts):
        self.polyline(pts, lw=LW_HIDDEN, dash=DASH_HIDDEN)

    def bend_line(self, x0, y0, x1, y1):
        self.line(x0, y0, x1, y1, lw=LW_PHANTOM, dash=DASH_PHANTOM)

    def centerline(self, x0, y0, x1, y1):
        self.line(x0, y0, x1, y1, lw=LW_CENTER, dash=DASH_CENTER)

    # -- hatching ----------------------------------------------------------
    def hatch_rect(self, x, y, w, h, spacing=0.10, angle=45.0, lw=LW_HATCH):
        """Section hatch inside a model-space rectangle."""
        c = self.s.c
        c.saveState()
        p = c.beginPath()
        p.rect(self.px(x), self.py(y), self.d(w), self.d(h))
        c.clipPath(p, stroke=0, fill=0)
        self.s._style(lw, None, GRAY)
        step = spacing
        t = math.tan(math.radians(angle))
        n = int((w + h * t) / step) + 2
        for i in range(-n, n + 1):
            xa = x + i * step
            c.line(self.px(xa), self.py(y), self.px(xa + h / t if t else xa), self.py(y + h))
        c.restoreState()

    # -- sheet metal in section -------------------------------------------
    def metal_section(self, pts, thk_pts: float = 2.4):
        """Thin-gauge metal shown in section as a single heavy line."""
        self.polyline(pts, lw=thk_pts)

    # -- annotation --------------------------------------------------------
    def dim_h(self, x0, x1, y, offset=0.0, text=None, fmt=fmt_in,
              flip=False, ext=True, tick="arrow"):
        """Horizontal linear dimension between model x0 and x1 at model y."""
        s = self.s
        px0, px1 = self.px(x0), self.px(x1)
        pyb = self.py(y)
        pyd = pyb + offset * IN * (-1 if flip else 1)
        if ext:
            gap = 1.6
            for pxa in (px0, px1):
                y_from = pyb + math.copysign(gap, pyd - pyb)
                y_to = pyd + math.copysign(2.6, pyd - pyb)
                s.line(pxa, y_from, pxa, y_to, lw=LW_THIN)
        s.line(px0, pyd, px1, pyd, lw=LW_THIN)
        self._tick(px0, pyd, +1, 0, tick)
        self._tick(px1, pyd, -1, 0, tick)
        label = text if text is not None else fmt(abs(x1 - x0))
        s.text_boxed((px0 + px1) / 2, pyd + 2.2, label)

    def dim_v(self, y0, y1, x, offset=0.0, text=None, fmt=fmt_in,
              flip=False, ext=True, tick="arrow"):
        """Vertical linear dimension between model y0 and y1 at model x."""
        s = self.s
        py0, py1 = self.py(y0), self.py(y1)
        pxb = self.px(x)
        pxd = pxb + offset * IN * (-1 if flip else 1)
        if ext:
            gap = 1.6
            for pya in (py0, py1):
                x_from = pxb + math.copysign(gap, pxd - pxb)
                x_to = pxd + math.copysign(2.6, pxd - pxb)
                s.line(x_from, pya, x_to, pya, lw=LW_THIN)
        s.line(pxd, py0, pxd, py1, lw=LW_THIN)
        self._tick(pxd, py0, 0, +1, tick)
        self._tick(pxd, py1, 0, -1, tick)
        label = text if text is not None else fmt(abs(y1 - y0))
        s.c.saveState()
        s.c.translate(pxd - 2.2, (py0 + py1) / 2)
        s.c.rotate(90)
        w = _tw(label, FONT, TXT_DIM)
        s.c.setFillColor(white)
        s.c.rect(-w / 2 - 1.6, -1.4, w + 3.2, TXT_DIM + 1.2, stroke=0, fill=1)
        s.c.setFillColor(black)
        s.c.setFont(FONT, TXT_DIM)
        s.c.drawCentredString(0, 0, label)
        s.c.restoreState()

    def _tick(self, px, py, dx, dy, style="arrow"):
        s = self.s
        if style == "arrow":
            L, W = 5.0, 1.5
            if dx:
                pts = [(px, py), (px + dx * L, py - W), (px + dx * L, py + W)]
            else:
                pts = [(px, py), (px - W, py + dy * L), (px + W, py + dy * L)]
            s.poly_fill(pts, color=black)
        elif style == "tick":
            L = 3.0
            s.line(px - L, py - L, px + L, py + L, lw=LW_THIN)
        elif style == "dot":
            s.circle(px, py, 1.3, lw=0.4, fill=black)

    def leader(self, x, y, tx, ty, text, size=TXT_NOTE, anchor=None, shoulder=0.14):
        """Leader with an arrowhead at (x,y) and a horizontal shoulder at (tx,ty)."""
        s = self.s
        p0 = self.p(x, y)
        p1 = self.p(tx, ty)
        sh = shoulder * IN * (1 if p1[0] >= p0[0] else -1)
        p2 = (p1[0] + sh, p1[1])
        s.polyline([p0, p1, p2], lw=LW_THIN)
        # arrowhead pointing back along the first leg
        ang = math.atan2(p0[1] - p1[1], p0[0] - p1[0])
        L, W = 5.2, 1.6
        bx, by = p0[0] - L * math.cos(ang), p0[1] - L * math.sin(ang)
        nx, ny = -math.sin(ang) * W, math.cos(ang) * W
        s.poly_fill([p0, (bx + nx, by + ny), (bx - nx, by - ny)], color=black)
        a = anchor if anchor else ("l" if sh > 0 else "r")
        s.text(p2[0] + (2.0 if a == "l" else -2.0), p2[1] + 1.6, text, size, FONT, a)

    def multileader(self, x, y, tx, ty, lines, size=TXT_NOTE, anchor=None):
        """Leader carrying several stacked lines of text."""
        s = self.s
        self.leader(x, y, tx, ty, lines[0], size, anchor)
        p1 = self.p(tx, ty)
        sh = 0.14 * IN * (1 if p1[0] >= self.px(x) else -1)
        a = anchor if anchor else ("l" if sh > 0 else "r")
        px = p1[0] + sh + (2.0 if a == "l" else -2.0)
        for i, ln in enumerate(lines[1:], start=1):
            s.text(px, p1[1] + 1.6 - i * (size + 1.4), ln, size, FONT, a)

    def balloon(self, x, y, tx, ty, tag, r=0.085):
        """Item balloon (BOM key) on a leader."""
        s = self.s
        p0 = self.p(x, y)
        p1 = self.p(tx, ty)
        rr = r * IN
        # leader stops at the balloon edge
        ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
        edge = (p1[0] - rr * math.cos(ang), p1[1] - rr * math.sin(ang))
        s.polyline([p0, edge], lw=LW_THIN)
        L, W = 5.2, 1.6
        bx, by = p0[0] + L * math.cos(ang), p0[1] + L * math.sin(ang)
        nx, ny = -math.sin(ang) * W, math.cos(ang) * W
        s.poly_fill([p0, (bx + nx, by + ny), (bx - nx, by - ny)], color=black)
        s.circle(p1[0], p1[1], rr, lw=0.9, fill=white)
        s.text(p1[0], p1[1] - 2.3, str(tag), 6.6, FONT_B, "c")

    def view_title(self, x, y, title, scale_label, num=None):
        s = self.s
        px, py = self.p(x, y)
        t = f"{num}   {title}" if num else title
        s.text(px, py, t, TXT_VIEW, FONT_B)
        w = _tw(t, FONT_B, TXT_VIEW)
        s.line(px, py - 3.2, px + max(w, 54), py - 3.2, lw=1.5)
        s.text(px, py - 11.5, f"SCALE: {scale_label}", 6.2, FONT, color=GRAY)

    def section_mark(self, x0, y0, x1, y1, tag="A", dir_x=0, dir_y=-1, sheet_ref=""):
        """Cutting-plane line with direction-of-sight flags at each end."""
        s = self.s
        p0, p1 = self.p(x0, y0), self.p(x1, y1)
        s.polyline([p0, p1], lw=LW_CUT, dash=DASH_CUT)
        for p in (p0, p1):
            # arrow of sight
            L = 11.0
            ax, ay = p[0] + dir_x * L, p[1] + dir_y * L
            s.polyline([p, (ax, ay)], lw=LW_CUT)
            ang = math.atan2(ay - p[1], ax - p[0])
            hl, hw = 6.0, 2.1
            bx, by = ax - hl * math.cos(ang), ay - hl * math.sin(ang)
            nx, ny = -math.sin(ang) * hw, math.cos(ang) * hw
            s.poly_fill([(ax, ay), (bx + nx, by + ny), (bx - nx, by - ny)], color=black)
            # tag bubble
            cx = p[0] - dir_x * 13.0 + (0 if dir_x else 0)
            cy = p[1] - dir_y * 13.0
            s.circle(cx, cy, 8.0, lw=1.1, fill=white)
            s.line(cx - 8.0, cy, cx + 8.0, cy, lw=0.7)
            s.text(cx, cy + 2.0, tag, 7.4, FONT_B, "c")
            s.text(cx, cy - 6.4, sheet_ref or "—", 5.6, FONT, "c")


# ===========================================================================
# Tables and note blocks
# ===========================================================================

def table(s: Sheet, x, y, col_w, rows, header=None, row_h=11.5,
          title=None, size=5.9, header_size=5.9, zebra=True, align=None):
    """Draw a bordered table. ``y`` is the TOP edge. Returns bottom y."""
    W = sum(col_w)
    yy = y
    if title:
        s.rect(x, yy - 13.0, W, 13.0, lw=1.1, fill=Color(0.92, 0.92, 0.92))
        s.text(x + 4, yy - 9.3, title, 7.0, FONT_B)
        yy -= 13.0
    if header:
        s.rect(x, yy - row_h, W, row_h, lw=0.9, fill=Color(0.86, 0.86, 0.86))
        cx = x
        for i, h in enumerate(header):
            s.text(cx + 3, yy - row_h + 3.6, h, header_size, FONT_B)
            cx += col_w[i]
        yy -= row_h
    for r, row in enumerate(rows):
        if zebra and r % 2:
            s.rect(x, yy - row_h, W, row_h, lw=0, fill=Color(0.965, 0.965, 0.965))
        cx = x
        for i, cell in enumerate(row):
            a = (align[i] if align and i < len(align) else "l")
            if a == "c":
                s.text(cx + col_w[i] / 2, yy - row_h + 3.6, str(cell), size, FONT, "c")
            elif a == "r":
                s.text(cx + col_w[i] - 3, yy - row_h + 3.6, str(cell), size, FONT, "r")
            else:
                s.text(cx + 3, yy - row_h + 3.6, str(cell), size, FONT)
            cx += col_w[i]
        yy -= row_h
        s.line(x, yy, x + W, yy, lw=0.35, color=LIGHT)
    total_h = y - yy
    s.rect(x, yy, W, total_h, lw=1.1)
    # column rules
    cx = x
    for w in col_w[:-1]:
        cx += w
        top = y - (13.0 if title else 0)
        s.line(cx, yy, cx, top, lw=0.5, color=GRAY)
    return yy


def notes_block(s: Sheet, x, y, w, title, items, size=5.9, lead=8.2, numbered=True):
    """Numbered general-notes block. ``y`` is the TOP edge. Returns bottom y."""
    s.rect(x, y - 13.0, w, 13.0, lw=1.1, fill=Color(0.92, 0.92, 0.92))
    s.text(x + 4, y - 9.3, title, 7.0, FONT_B)
    yy = y - 13.0
    pad = 4.0
    num_w = 13.0 if numbered else 0.0
    for i, it in enumerate(items, start=1):
        wrapped = _wrap(it, size, w - pad * 2 - num_w)
        if numbered:
            s.text(x + pad, yy - lead + 1.0, f"{i}.", size, FONT_B)
        for j, ln in enumerate(wrapped):
            yy -= lead
            s.text(x + pad + num_w, yy + 1.0, ln, size, FONT)
        yy -= 1.6
    yy -= 3.0
    s.rect(x, yy, w, y - yy, lw=1.1)
    return yy


def _wrap(text: str, size: float, width: float, font=FONT) -> list[str]:
    words, lines, cur = text.split(), [], ""
    for wd in words:
        trial = (cur + " " + wd).strip()
        if _tw(trial, font, size) <= width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines or [""]
