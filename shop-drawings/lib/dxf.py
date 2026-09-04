"""DXF export of flat patterns (stretch-outs) for the fabrication shop.

Produces an R2010 DXF in inches with the cut profile on a CUT layer and the
bend lines on a BEND layer, which is the layout most CNC folders and plasma
tables expect. Layer colours follow the common shop convention: cut = white,
bend = red, text = yellow.
"""

from __future__ import annotations

import ezdxf
from ezdxf.enums import TextEntityAlignment

from .sheetmetal import Profile


# Layer names follow the convention contract shops expect. Up-bends and
# down-bends MUST be on separate layers: a file with everything on one "BEND"
# layer cannot be used without manual rework, because the press brake operator
# has no way to know which way each line folds. Confirm the exact names with
# the shop before exporting - some use BEND_UP/BEND_DOWN or numbered layers.
LAYERS = {
    "CUT":       {"color": 7, "desc": "Cut profile / outline"},
    "BEND-UP":   {"color": 1, "desc": "Bend lines, fold UP - do not cut"},
    "BEND-DOWN": {"color": 5, "desc": "Bend lines, fold DOWN - do not cut"},
    "TEXT":      {"color": 2, "desc": "Annotation"},
    "DIM":       {"color": 4, "desc": "Dimensions"},
    "SCORE":     {"color": 3, "desc": "Score / hem lines"},
    "BBOX":      {"color": 8, "desc": "Bounding box"},
}


def _new_doc():
    doc = ezdxf.new("R2010", setup=True)
    doc.units = ezdxf.units.IN
    doc.header["$INSUNITS"] = 1          # inches
    doc.header["$MEASUREMENT"] = 0       # imperial
    for name, cfg in LAYERS.items():
        if name not in doc.layers:
            doc.layers.add(name, color=cfg["color"])
    return doc


def export_flat_patterns(profiles: list[Profile], path: str,
                         widths: dict[str, float] | None = None,
                         gap: float = 2.0, title: str = ""):
    """Write one DXF containing every profile's flat blank, stacked vertically.

    ``widths`` maps profile name -> blank width (the dimension across the brake,
    perpendicular to the girth). Defaults to 12" where unspecified.
    """
    doc = _new_doc()
    msp = doc.modelspace()
    widths = widths or {}

    y = 0.0
    for prof in profiles:
        L = prof.flat_length
        W = widths.get(prof.name, 12.0)

        # cut outline
        msp.add_lwpolyline(
            [(0, y), (L, y), (L, y + W), (0, y + W)],
            close=True, dxfattribs={"layer": "CUT"},
        )

        # bounding box, so the shop can nest the blank
        msp.add_lwpolyline([(0, y), (L, y), (L, y + W), (0, y + W)],
                           close=True, dxfattribs={"layer": "BBOX"})

        # bend lines at their developed stations, split UP vs DOWN
        for i, station in enumerate(prof.flat_stations()):
            b = prof.bends[i]
            layer = "BEND-UP" if b.direction.upper() in (
                "UP", "U", "LEFT", "L", "CCW") else "BEND-DOWN"
            msp.add_line((station, y), (station, y + W),
                         dxfattribs={"layer": layer})
            r = b.radius if b.radius is not None else prof.default_radius
            msp.add_text(
                f"{b.direction} {b.angle:g}deg  R{r:.4f}",
                dxfattribs={"layer": "TEXT", "height": 0.18, "rotation": 90},
            ).set_placement((station + 0.10, y + 0.25), align=TextEntityAlignment.LEFT)

        # part label
        msp.add_text(
            f"{prof.name}  |  {prof.material}  |  QTY {prof.qty}  |  "
            f"FLAT {L:.3f}\" x {W:.3f}\"  |  GIRTH {prof.mold_line_girth:.3f}\"",
            dxfattribs={"layer": "TEXT", "height": 0.22},
        ).set_placement((0, y + W + 0.45), align=TextEntityAlignment.LEFT)

        y += W + gap

    if title:
        msp.add_text(title, dxfattribs={"layer": "TEXT", "height": 0.40}
                     ).set_placement((0, y + 0.6), align=TextEntityAlignment.LEFT)

    doc.saveas(path)
    return path
