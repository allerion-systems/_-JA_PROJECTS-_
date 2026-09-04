# Shop drawings

A toolkit for producing architectural sheet metal fabrication drawings, plus
the drawings themselves.

The point of building it as code rather than drawing each sheet by hand: the
dimensions printed on a sheet are computed from the geometry model, and the
flat patterns are computed from the same numbers as the assembly views. A
change to the throat width propagates to the plan, the section, the elevation,
the cut list, the bend schedule and the DXF in one run. Nothing is lettered in
by hand, so nothing can drift out of agreement.

## Layout

```
lib/
  drafting.py     sheet engine — border, title block, revision block, scaled
                  viewports, dimensions, leaders, balloons, section marks,
                  centrelines, bend lines, hatching, tables, note blocks
  sheetmetal.py   gauge tables, bend allowance / setback / deduction, flat
                  pattern solver, ventilation net free area
  dxf.py          flat patterns to R2010 DXF on CUT / BEND / TEXT layers
projects/
  trh-clarksville/
    project.py            confirmed facts from the approved submittal
    panel_5v.py           Metal Sales 5V-Crimp profile model
    vent_geometry.py      the vent, parametrically, with sources per dimension
    draw_vent.py          generates the drawing package
    PANEL-SUBSTITUTION.md faster-lead-time panel sourcing memo
out/                      generated PDF and DXF (gitignored)
METHOD.md                 how to draw sheet metal shop drawings — the reference
```

## Generating a drawing

```bash
pip install reportlab ezdxf
python3 projects/trh-clarksville/draw_vent.py
```

Writes `out/TRH-CLARKSVILLE-5V-ROOF-VENT.pdf` (2 sheets, ANSI B landscape) and
`out/TRH-CLARKSVILLE-5V-ROOF-VENT-FLATS.dxf`.

## Starting a new part

Copy a project folder. Define the geometry as a dataclass with one property per
derived dimension, define each braked piece as a `sheetmetal.Profile` (segments
to the mould line, plus bends), and lay the views out with `Viewport`s. The
bend schedule, cut list and DXF all fall out of the profiles automatically.

## The rule

Every dimension on a sheet is one of three things, and the sheet has to say
which:

1. **From an approved source** — cite the spec section or manual page.
2. **Code- or standard-derived** — cite the standard and clause.
3. **Assumed** — say so, in an OPEN ITEMS block, and say what would confirm it.

A drawing that silently invents a dimension launders a guess into an approved
document that someone will cut metal from. See `METHOD.md`.
