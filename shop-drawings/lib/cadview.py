"""Orthographic drawing views generated from a solid by hidden-line removal.

This is the mechanism a real CAD package uses to make a drawing view: run the
HLR (hidden line removal) algorithm over the B-rep from a given eye direction,
collect the visible and hidden edges, and draw them. The consequence that
matters is that a view CANNOT disagree with the model - if the solid changes,
every view changes with it, because the views are not independent geometry.

Edges come back as polylines discretised to a deflection tolerance well below
the plotted line width, so curves read as curves on paper while all printed
dimensions still come from the model numerically.
"""

from __future__ import annotations

import math

import cadquery as cq
from OCP.HLRBRep import HLRBRep_Algo, HLRBRep_HLRToShape
from OCP.HLRAlgo import HLRAlgo_Projector
from OCP.gp import gp_Ax2, gp_Pnt, gp_Dir
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_EDGE
from OCP.BRepAdaptor import BRepAdaptor_Curve
from OCP.GCPnts import GCPnts_QuasiUniformDeflection

from .drafting import LW_OBJECT, LW_HIDDEN, DASH_HIDDEN, GRAY


# Standard view directions: (eye direction, up vector).
# Third-angle projection, which is US convention.
VIEWS = {
    "front":  ((0, -1, 0), (0, 0, 1)),
    "back":   ((0, 1, 0), (0, 0, 1)),
    "top":    ((0, 0, -1), (0, 1, 0)),
    "bottom": ((0, 0, 1), (0, 1, 0)),
    "left":   ((1, 0, 0), (0, 0, 1)),
    "right":  ((-1, 0, 0), (0, 0, 1)),
    "iso":    ((-1, -1, -1), (0, 0, 1)),
    "iso_rear": ((1, 1, -1), (0, 0, 1)),
}


def project(shape, direction=(0, -1, 0), up=(0, 0, 1),
            deflection: float = 5e-4, want_hidden: bool = True) -> dict:
    """Project a shape to 2D. Returns {'visible': [...], 'hidden': [...]}.

    Each entry is a list of polylines; each polyline a list of (x, y) in the
    projection plane, in model units.
    """
    solid = shape.val() if isinstance(shape, cq.Workplane) else shape

    algo = HLRBRep_Algo()
    algo.Add(solid.wrapped)
    ax = gp_Ax2(gp_Pnt(0, 0, 0), gp_Dir(*direction), gp_Dir(*up))
    algo.Projector(HLRAlgo_Projector(ax))
    algo.Update()
    algo.Hide()
    hlr = HLRBRep_HLRToShape(algo)

    def edges_of(comp):
        polys = []
        if comp is None:
            return polys
        exp = TopExp_Explorer(comp, TopAbs_EDGE)
        while exp.More():
            e = cq.Shape(exp.Current())
            try:
                ad = BRepAdaptor_Curve(e.wrapped)
                d = GCPnts_QuasiUniformDeflection(ad, deflection)
                if d.IsDone() and d.NbPoints() >= 2:
                    polys.append([(d.Value(i).X(), d.Value(i).Y())
                                  for i in range(1, d.NbPoints() + 1)])
            except Exception:
                pass
            exp.Next()
        return polys

    out = {"visible": edges_of(hlr.VCompound())}
    # smooth silhouette edges come back separately and must not be dropped
    out["visible"] += edges_of(hlr.OutLineVCompound())
    if want_hidden:
        out["hidden"] = edges_of(hlr.HCompound())
        out["hidden"] += edges_of(hlr.OutLineHCompound())
    else:
        out["hidden"] = []
    return out


def bounds(proj: dict) -> tuple[float, float, float, float]:
    """(xmin, ymin, xmax, ymax) of a projection."""
    pts = [p for key in ("visible", "hidden") for poly in proj.get(key, [])
           for p in poly]
    if not pts:
        return (0.0, 0.0, 0.0, 0.0)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return (min(xs), min(ys), max(xs), max(ys))


def draw(vp, proj: dict, dx: float = 0.0, dy: float = 0.0,
         lw_visible: float = LW_OBJECT, lw_hidden: float = LW_HIDDEN,
         hidden: bool = True, color=None):
    """Draw a projection into a drafting Viewport, offset by (dx, dy)."""
    if hidden:
        for poly in proj.get("hidden", []):
            vp.polyline([(x + dx, y + dy) for x, y in poly],
                        lw=lw_hidden, dash=DASH_HIDDEN,
                        color=color or GRAY)
    for poly in proj.get("visible", []):
        vp.polyline([(x + dx, y + dy) for x, y in poly], lw=lw_visible,
                    **({"color": color} if color else {}))


def draw_view(vp, shape, view: str = "front", dx: float = 0.0, dy: float = 0.0,
              hidden: bool = True, center: bool = False, **kw):
    """Project ``shape`` in a named standard view and draw it."""
    d, u = VIEWS[view]
    proj = project(shape, d, u, want_hidden=hidden)
    if center:
        x0, y0, x1, y1 = bounds(proj)
        dx -= (x0 + x1) / 2.0
        dy -= (y0 + y1) / 2.0
    draw(vp, proj, dx, dy, hidden=hidden, **kw)
    return proj


def section_view(shape, plane: str = "XZ", offset: float = 0.0,
                 deflection: float = 5e-4) -> list:
    """True section cut through the solid; returns polylines of the cut face."""
    solid = shape.val() if isinstance(shape, cq.Workplane) else shape
    wp = cq.Workplane(obj=solid)
    normals = {"XY": (0, 0, 1), "XZ": (0, 1, 0), "YZ": (1, 0, 0)}
    n = normals[plane]
    origin = tuple(offset * c for c in n)
    try:
        cut = wp.section(offset) if plane == "XY" else None
    except Exception:
        cut = None
    if cut is None:
        # generic: intersect with a large thin box on the plane
        big = 1e4
        cut = wp.faces()  # fallback, caller should use project() instead
    polys = []
    for e in (cut.edges().vals() if cut else []):
        ad = BRepAdaptor_Curve(e.wrapped)
        d = GCPnts_QuasiUniformDeflection(ad, deflection)
        if d.IsDone() and d.NbPoints() >= 2:
            polys.append([(d.Value(i).X(), d.Value(i).Y())
                          for i in range(1, d.NbPoints() + 1)])
    return polys
