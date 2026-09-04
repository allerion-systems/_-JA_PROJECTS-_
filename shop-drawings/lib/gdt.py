"""Geometric dimensioning and tolerancing symbology, drawn to ASME proportions.

Every symbol here is drawn as vector geometry rather than set as a font glyph,
because the GD&T characters are not present in the core PDF fonts and a missing
glyph on a fabrication drawing is a defect, not a cosmetic issue.

Proportions follow ASME Y14.5 / Y14.2 practice, parameterised on the character
height ``h``:

    feature control frame height   2h
    symbol cell                    2h wide
    datum letter box               2h square (minimum)
    datum triangle                 h wide at the base, h tall

A note on scope. ASME Y14.5-2018 states that "practices unique to architectural
and civil engineering ... are not included in this Standard". Architectural
sheet metal is governed by SMACNA and the project specification. GD&T is used
here the way a fabrication shop actually uses it - to say unambiguously which
surface is the setup datum and how much a formed surface may deviate - not to
claim the drawing is a Y14.5 mechanical part drawing. The datum scheme and the
tolerance block state which standard governs which.

Also per Y14.5-2018: concentricity and symmetry were REMOVED from the standard.
They are deliberately not implemented.
"""

from __future__ import annotations

import math

from reportlab.lib.colors import black, white

from .drafting import FONT, FONT_B, LW_THIN, _tw

LW_SYM = 0.7


# ===========================================================================
# geometric characteristic symbols
# Each draws centred on (cx, cy) inside a cell of nominal size 2h.
# ===========================================================================

def _line(s, x0, y0, x1, y1, lw=LW_SYM):
    s.line(x0, y0, x1, y1, lw=lw)


def sym_straightness(s, cx, cy, h):
    _line(s, cx - 0.75 * h, cy, cx + 0.75 * h, cy)


def sym_flatness(s, cx, cy, h):
    """Parallelogram, 60 degree included angle."""
    w, ht = 1.5 * h, 0.85 * h
    dx = ht / math.tan(math.radians(60))
    pts = [(cx - w / 2 + dx, cy + ht / 2), (cx + w / 2, cy + ht / 2),
           (cx + w / 2 - dx, cy - ht / 2), (cx - w / 2, cy - ht / 2)]
    s.polyline(pts + [pts[0]], lw=LW_SYM)


def sym_circularity(s, cx, cy, h):
    s.circle(cx, cy, 0.6 * h, lw=LW_SYM)


def sym_cylindricity(s, cx, cy, h):
    r = 0.5 * h
    s.circle(cx, cy, r, lw=LW_SYM)
    for sgn in (-1, 1):
        x = cx + sgn * 0.95 * h
        _line(s, x - 0.22 * h, cy - 0.85 * h, x + 0.22 * h, cy + 0.85 * h)


def sym_profile_line(s, cx, cy, h):
    """Half circle, open at the bottom."""
    r = 0.72 * h
    s.arc_path(cx, cy - r * 0.35, r, 0, 180, lw=LW_SYM)


def sym_profile_surface(s, cx, cy, h):
    """Half circle closed by a chord."""
    r = 0.72 * h
    y0 = cy - r * 0.35
    s.arc_path(cx, y0, r, 0, 180, lw=LW_SYM)
    _line(s, cx - r, y0, cx + r, y0)


def sym_angularity(s, cx, cy, h):
    """Angle symbol: 30 degrees, opening to the right."""
    x0, y0 = cx - 0.8 * h, cy - 0.7 * h
    _line(s, x0, y0, x0 + 1.6 * h, y0)
    _line(s, x0, y0, x0 + 1.55 * h, y0 + 1.55 * h * math.tan(math.radians(30)))


def sym_perpendicularity(s, cx, cy, h):
    _line(s, cx, cy + 0.85 * h, cx, cy - 0.85 * h)
    _line(s, cx - 0.8 * h, cy - 0.85 * h, cx + 0.8 * h, cy - 0.85 * h)


def sym_parallelism(s, cx, cy, h):
    a = math.radians(60)
    dx = 0.85 * h / math.tan(a)
    for sgn in (-1, 1):
        x = cx + sgn * 0.38 * h
        _line(s, x - dx, cy - 0.85 * h, x + dx, cy + 0.85 * h)


def sym_position(s, cx, cy, h):
    r = 0.62 * h
    s.circle(cx, cy, r, lw=LW_SYM)
    _line(s, cx - 0.95 * h, cy, cx + 0.95 * h, cy)
    _line(s, cx, cy - 0.95 * h, cx, cy + 0.95 * h)


def sym_runout_circular(s, cx, cy, h):
    _line(s, cx - 0.55 * h, cy - 0.85 * h, cx + 0.55 * h, cy + 0.85 * h)
    _arrowhead(s, cx + 0.55 * h, cy + 0.85 * h, math.atan2(1.7 * h, 1.1 * h), h)


def sym_runout_total(s, cx, cy, h):
    for sgn in (-1, 1):
        x = cx + sgn * 0.42 * h
        _line(s, x - 0.5 * h, cy - 0.85 * h, x + 0.5 * h, cy + 0.85 * h)
        _arrowhead(s, x + 0.5 * h, cy + 0.85 * h, math.atan2(1.7 * h, 1.0 * h), h)


def _arrowhead(s, x, y, ang, h):
    L, W = 0.45 * h, 0.16 * h
    bx, by = x - L * math.cos(ang), y - L * math.sin(ang)
    nx, ny = -math.sin(ang) * W, math.cos(ang) * W
    s.poly_fill([(x, y), (bx + nx, by + ny), (bx - nx, by - ny)], color=black)


SYMBOLS = {
    "straightness": sym_straightness,
    "flatness": sym_flatness,
    "circularity": sym_circularity,
    "cylindricity": sym_cylindricity,
    "profile_line": sym_profile_line,
    "profile": sym_profile_surface,
    "profile_surface": sym_profile_surface,
    "angularity": sym_angularity,
    "perpendicularity": sym_perpendicularity,
    "parallelism": sym_parallelism,
    "position": sym_position,
    "runout": sym_runout_circular,
    "total_runout": sym_runout_total,
}

SYMBOL_NAMES = {
    "straightness": "STRAIGHTNESS", "flatness": "FLATNESS",
    "circularity": "CIRCULARITY", "cylindricity": "CYLINDRICITY",
    "profile_line": "PROFILE OF A LINE", "profile": "PROFILE OF A SURFACE",
    "angularity": "ANGULARITY", "perpendicularity": "PERPENDICULARITY",
    "parallelism": "PARALLELISM", "position": "POSITION",
    "runout": "CIRCULAR RUNOUT", "total_runout": "TOTAL RUNOUT",
}


# ===========================================================================
# modifiers drawn inline
# ===========================================================================

def mod_diameter(s, cx, cy, h):
    r = 0.42 * h
    s.circle(cx, cy, r, lw=LW_SYM)
    d = r * 1.5
    _line(s, cx - d * 0.55, cy - d * 0.55, cx + d * 0.55, cy + d * 0.55)


def mod_circled(s, cx, cy, h, letter):
    s.circle(cx, cy, 0.62 * h, lw=LW_SYM)
    s.text(cx, cy - 0.3 * h, letter, 0.85 * h, FONT, "c")


MODIFIERS = {
    "MMC": lambda s, x, y, h: mod_circled(s, x, y, h, "M"),
    "LMC": lambda s, x, y, h: mod_circled(s, x, y, h, "L"),
    "RFS": lambda s, x, y, h: mod_circled(s, x, y, h, "S"),
    "P": lambda s, x, y, h: mod_circled(s, x, y, h, "P"),
    "F": lambda s, x, y, h: mod_circled(s, x, y, h, "F"),
    "DIA": mod_diameter,
}


# ===========================================================================
# feature control frame
# ===========================================================================

def feature_control_frame(s, x, y, characteristic, tolerance,
                          datums=(), h=6.4, modifier=None, diameter=False,
                          anchor="l"):
    """Draw a feature control frame. ``(x, y)`` is the LEFT edge, mid-height.

    Returns (x_left, x_right) so a leader can be attached.

    characteristic : key into SYMBOLS
    tolerance      : e.g. ".030"  (a leading diameter symbol is drawn when
                     ``diameter`` is set, per Y14.5 for cylindrical zones)
    datums         : ("A",), ("A","B"), ("A","B","C"), or with modifiers
                     as ("A", ("B","MMC"))
    modifier       : material condition applied to the tolerance
    """
    H = 2.0 * h
    cell_sym = 2.0 * h

    # measure compartments
    tol_txt = tolerance
    tol_w = _tw(tol_txt, FONT, h) + 0.9 * h
    if diameter:
        tol_w += 1.2 * h
    if modifier:
        tol_w += 1.5 * h

    dat_w = []
    for d in datums:
        letter = d[0] if isinstance(d, (tuple, list)) else d
        m = d[1] if isinstance(d, (tuple, list)) and len(d) > 1 else None
        w = _tw(letter, FONT, h) + 0.9 * h + (1.5 * h if m else 0)
        dat_w.append(max(w, 1.6 * h))

    total = cell_sym + tol_w + sum(dat_w)
    if anchor == "r":
        x -= total
    elif anchor == "c":
        x -= total / 2.0

    y0, y1 = y - H / 2.0, y + H / 2.0

    # outer frame, knocked out so it reads over geometry
    s.rect(x, y0, total, H, lw=0.9, fill=white)

    # symbol compartment
    fn = SYMBOLS.get(characteristic)
    if fn is None:
        raise KeyError(f"unknown geometric characteristic {characteristic!r}")
    fn(s, x + cell_sym / 2.0, y, h)
    cx = x + cell_sym
    s.line(cx, y0, cx, y1, lw=0.9)

    # tolerance compartment
    tx = cx + 0.45 * h
    if diameter:
        mod_diameter(s, tx + 0.5 * h, y, h)
        tx += 1.2 * h
    s.text(tx, y - 0.34 * h, tol_txt, h, FONT)
    tx += _tw(tol_txt, FONT, h)
    if modifier:
        MODIFIERS[modifier](s, tx + 0.75 * h, y, h)
    cx += tol_w
    if datums:
        s.line(cx, y0, cx, y1, lw=0.9)

    # datum compartments
    for d, w in zip(datums, dat_w):
        letter = d[0] if isinstance(d, (tuple, list)) else d
        m = d[1] if isinstance(d, (tuple, list)) and len(d) > 1 else None
        s.text(cx + 0.45 * h, y - 0.34 * h, letter, h, FONT)
        if m:
            MODIFIERS[m](s, cx + 0.45 * h + _tw(letter, FONT, h) + 0.75 * h, y, h)
        cx += w
        if d is not datums[-1]:
            s.line(cx, y0, cx, y1, lw=0.9)

    return (x, x + total)


# ===========================================================================
# datum feature symbol
# ===========================================================================

def datum_feature(s, x, y, letter, direction="down", h=6.4, leader=None):
    """Datum feature symbol: filled triangle, leader, boxed letter.

    ``(x, y)`` is the point on the feature the triangle sits on.
    ``direction`` is where the box goes: down, up, left, right.
    """
    tri = h
    box = 2.0 * h

    dirs = {
        "down": (0, -1), "up": (0, 1), "left": (-1, 0), "right": (1, 0),
    }
    dx, dy = dirs[direction]
    lead = leader if leader is not None else 2.2 * h

    # filled triangle seated on the feature
    if dx == 0:
        apex = (x, y + dy * tri)
        base = [(x - tri / 2, y), (x + tri / 2, y)]
    else:
        apex = (x + dx * tri, y)
        base = [(x, y - tri / 2), (x, y + tri / 2)]
    s.poly_fill([apex] + base, color=black)

    # leader from the apex to the box
    bx = x + dx * (tri + lead)
    by = y + dy * (tri + lead)
    s.line(apex[0], apex[1], bx, by, lw=0.9)

    # letter box, centred on the leader end
    if dx == 0:
        rx, ry = bx - box / 2, by - (box if dy < 0 else 0)
    else:
        rx, ry = (bx if dx > 0 else bx - box), by - box / 2
    s.rect(rx, ry, box, box, lw=0.9, fill=white)
    s.text(rx + box / 2, ry + box / 2 - 0.35 * h, letter, h, FONT_B, "c")
    return (rx, ry, box)


def datum_target(s, x, y, label, area=None, h=6.4):
    """Datum target symbol: a circle split horizontally."""
    r = 1.6 * h
    s.circle(x, y, r, lw=0.9, fill=white)
    s.line(x - r, y, x + r, y, lw=0.9)
    if area:
        s.text(x, y + 0.25 * h, area, 0.8 * h, FONT, "c")
    s.text(x, y - 0.95 * h, label, 0.9 * h, FONT, "c")


# ===========================================================================
# basic dimension
# ===========================================================================

def basic_dim(s, x, y, text, h=6.2, anchor="c"):
    """A basic (theoretically exact) dimension: the value in a box."""
    w = _tw(text, FONT, h) + 0.7 * h
    H = 1.55 * h
    if anchor == "c":
        x -= w / 2
    elif anchor == "r":
        x -= w
    s.rect(x, y - H / 2, w, H, lw=0.65, fill=white)
    s.text(x + w / 2, y - 0.34 * h, text, h, FONT, "c")
    return (x, x + w)
