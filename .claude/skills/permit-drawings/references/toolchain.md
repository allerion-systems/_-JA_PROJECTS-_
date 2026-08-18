# Toolchain — draw, render, verify, deliver (proven pipeline)

## Install (cloud container)
```bash
pip install ezdxf matplotlib
apt-get update -qq && apt-get install -y poppler-utils   # pdftoppm/pdftotext
```
Headless Chromium is pre-installed at `/opt/pw-browsers/chromium-*/chrome-linux/chrome`
(do NOT run `playwright install`).

## 1. CAD drawing (ezdxf, units = inches)
```python
import ezdxf
from ezdxf.enums import TextEntityAlignment
doc = ezdxf.new("R2010", setup=True); doc.header["$INSUNITS"] = 1
msp = doc.modelspace()
```
- Layers with lineweights: `A-WALL`(50) `A-EXIST`(13, DASHED) `S-BEAM`(70)
  `S-RIDGE`(90) `S-RAFT`(18) `S-VALLEY`(50) `S-POST`(70) `S-DECK`(13, DASHED)
  `A-ANNO` `A-DIMS` `A-LEAD` (9).
- Geometry at TRUE scale: compute rafter/joist positions from spacing
  (`x = i * 16.0`), never eyeball.
- Make every dimension a named constant at the top of the script so field-taped
  values drop in and the drawing regenerates.
- Dimension lines with 45° tick slashes; callouts in LEFT and RIGHT text
  columns outside the drawing, each with an explicit tail row **matched to its
  tip height** so leaders run near-horizontal and never cross the drawing.
- Save `.dxf` — it is a real deliverable (AutoCAD/DraftSight/LibreCAD).

## 2. In-session preview (MANDATORY before delivery)
```python
from ezdxf.addons.drawing import matplotlib as m
m.qsave(doc.modelspace(), "plan.png", bg="#FFFFFF", dpi=170)
```
Then **Read plan.png and look at it.** Fix overlaps. Repeat until clean.

## 3. Vector embed into an HTML sheet
```python
from ezdxf.addons.drawing import Frontend, RenderContext, svg, layout
ctx = RenderContext(doc); ctx.set_current_layout(msp)
ctx.current_layout_properties.set_colors(bg="#FFFFFF")
backend = svg.SVGBackend(); Frontend(ctx, backend).draw_layout(msp)
out = backend.get_string(layout.Page(0, 0, layout.Units.inch, layout.Margins.all(0.15)))
```
Then, in order (each step fixes a real failure mode):
1. strip the viewer's background rect: `re.sub(r'<rect fill="#212830"[^>]*/>','',out,1)`
2. remap ACI colors to the print palette (`#ffffff→#111111`, `#ff0000→#c8102e`,
   `#00ff00→#1f6b4a`, `#808080→#8894a0`, `#00ffff→#4a6b8a`)
3. scope CSS classes so they can't collide with sheet CSS: `C(\d+) → PC\1`
4. take the inner SVG (between `<svg …>` and `</svg>`) and place it with an
   explicit transform — nested `<svg width/height>` sizing is NOT honored:
   `<g transform="translate(x,y) scale(0.0008)">…</g>` (scale = target_px / viewBox_w)

## 4. Sheets → 17x11 PDF
- CSS: `@media print{ @page{size:17in 11in; margin:0} .sheet{page-break-after:always} }`
- Wrap in a minimal `<!doctype html>` shell with `:root{color-scheme:light}`.
- Syntax-check embedded JS first: extract `<script>` body, `node --check`.
```bash
CH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome | head -1)
"$CH" --headless --disable-gpu --no-sandbox --virtual-time-budget=20000 \
  --no-pdf-header-footer --print-to-pdf=out.pdf "file://$PWD/page.html"
```

## 5. Page previews (verify EVERY page)
```bash
pdftoppm -png -r 100 out.pdf sheet    # then Read sheet-N.png, page by page
```
Common catches: clipped last table row (grow the box), text stacking at one
tail row, labels under linework (put a white rect behind, or move the label).

## 6. As-built redline masters (over photographed approved sheets)
- Uploaded photos live at `/root/.claude/uploads/<session>/` — thumbnail with
  PIL and Read them to identify which file is which before using any.
- PIL: crop phone chrome, `rotate(-90, expand=True)` to upright, mild contrast
  boost, save JPEG q82. Base64-embed into HTML.
- Overlays: absolutely positioned divs in % of the image —
  `.cloud` dashed red rounded box + red delta tag (Δ1…), `.rnote` white/red
  note box (text-align:left), `.pin` red circle + label, `.stamp` rotated red
  "AS-BUILT RECORD — NOT FOR CONSTRUCTION" box.
- Positions WILL be off on the first render — render to PDF, pdftoppm, Read,
  nudge percentages, repeat. Two passes is normal.
- Redline palette: `#c8102e` / `#d0021b` only. Approved base stays untouched.

## Sheet format (R&B Roofing house style)
- SD-series (SD-0 cover … SD-6 field worksheet) or AB-series for redline
  masters. 17x11 landscape (1700x1100 viewBox / 1224x792pt pages).
- Right-hand title block strip: **R&B ROOFING AND REMODELING**, 3600
  Chamberlain Ln Ste 348, Louisville KY 40241, (502) 658-0101,
  estimating@gottaberandb.com; PROJECT / OWNER-CONTRACTOR / SCOPE blocks; red
  status box ("CORRECTION RESPONSE — FOR REVIEW", "ENGINEER SIGN-OFF REQ'D");
  "NOT FOR CONSTRUCTION · V.I.F."; DRAWN BY **J. ALLEE / AI ASSIST**;
  CHECKED ____; DATE; SCALE; REV. Black footer bar, sheet name + red number.
- Numbered detail bubbles with title + scale under each figure; lettered
  verification lists (A, B, C…) with a responsible party per line
  (FIELD TAPE / ENGR / AHJ / OFFICE); material/component schedules with MARK
  column (R1, B1, P1, C1, F1…).
- A field-verification worksheet sheet (blanks, Y/N boxes, initials, sketch
  grid) turns "we need measurements" into a 10-minute crew task — include one
  whenever dimensions are open.

## Delivery
- `SendUserFile` the PDF (display:attach) + DXF; send page PNGs
  (display:render) when the user asks to "see" it.
- Artifacts persist across sessions per account: update the existing one by
  passing `url` to the Artifact tool. Find it with `action:"list"`. Never
  create a duplicate artifact for the same deliverable.
