---
name: aerial-takeoff
description: Aerial roof/wall takeoff reports from satellite imagery — building footprint tracing, per-plane/per-wall panel schedules, piece counts, and print-ready deliverables. Use whenever a job needs building measurements, a panel schedule, an RFQ cut list, squares/quantities from an address, or "measure this building." Standard is perfection - every trace is zoom-verified on every elevation before anything ships.
---

# Aerial Takeoff — Roof & Wall Reports

**The standard: nothing less than perfection. The user WILL zoom in.** A trace that
looks right at full-frame and drifts 10 px into the grass at zoom is a failed trace.
Never ship a line you have not personally looked at, at zoom, on every elevation.

## Non-negotiables (learned the hard way, Fibreworks 9/2026)

1. **Zoom-verify every elevation before delivering.** Render ~900px crops of each
   side + every corner and LOOK at them. The line sits ON the roof edge or you redo it.
2. **Never orthogonalize by averaging vertices.** Averaging smears edge drift along
   the whole wall. Fit a line per edge, then snap it to the image gradient.
3. **Shadows lie.** Eave shadows on grass read as roof edge to segmenters; dock
   clutter (trailers, dumpsters, canopies, pallets) wraps into masks. Clip masks with
   a dilated reference footprint and gradient-snap to kill both.
4. **Check imagery is real at the zoom you claim.** Esri World Imagery serves
   upscaled mush past z19 in many areas (file size collapses — a 141 KB "z20" stitch
   is fake). Google `mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}` carries true z20.
5. **Axis-sign check.** After any rotated-frame math, render and confirm which end of
   the u-axis is north before labeling sections. (We labeled the wrong end once.)
6. **Triangulate or don't trust it.** Trace area/perimeter must be cross-checked
   against at least two of: OSM footprint (Overpass), FEMA/ORNL USA Structures,
   customer's scope number, site photos scaled off a known object (man-door = 6'-8").
7. **State uncertainty honestly.** "FIELD VERIFY before cut list release" on every
   deliverable; heights from imagery are estimates; gable-end walls have raked tops.
8. **Know what plane you're measuring.** Ask/confirm ROOF vs WALL (siding) before
   the math — roof = plan area × slope factor; walls = perimeter × eave height.

## Pipeline

1. **Locate**: ArcGIS World Geocoder `findAddressCandidates` → rooftop point.
2. **Reference footprints**: Overpass (`way["building"](around:...)`, mirror:
   overpass.kumi.systems) and FEMA USA Structures
   (`services2.arcgis.com/FiaPA4ga0iQKduv3/.../USA_Structures_View/FeatureServer/0/query`).
3. **Imagery**: stitch Google z20 tiles; record `x0,y0,z` for georef.
   `m/px = 156543.03392·cos(lat)/2^z`.
4. **Segment**: SAM ViT-B (`segment-anything`, checkpoint `sam_vit_b_01ec64.pth`),
   point-prompted per ~1000px crop (fg on roof, bg on pavement/grass/clutter), union.
5. **Clean**: AND with reference footprint dilated ~55 px; morphology close; largest
   component; exterior contour.
6. **Vectorize**: split contour at approxPolyDP corners → `cv2.fitLine` (Huber) per
   segment → snap each line ±18 px along its normal to max Sobel gradient (median of
   ~25 samples) → snap bearings to the building's two principal axes (±12°) →
   intersect consecutive lines = corners → drop/merge edges < 12 ft.
7. **VERIFY (mandatory)**: full overlay + zoomed crops of every elevation/corner.
   Any drift → fix and re-render. No exceptions, no "close enough."
8. **Schedule**: merge collinear walls (<10° bearing diff), per-wall pieces =
   `ceil(length / coverage)` (36" and 40" columns), corners from bearing turns,
   trim LF = perimeter for base and eave. Roof jobs: per-plane runs, slope factor,
   two-piece end-lapped runs when eave-to-ridge exceeds ~50 ft shippable max.
9. **Deliver**: print-ready xlsx (one page, fitToPage, Arial, totals as formulas,
   method + cross-check + FIELD VERIFY notes on the sheet) + numbered aerial key PNG
   with wall/plane numbers matching the schedule.

## Sanity identities

- Walls: `pieces × coverage × height ≈ gross sf scope` (Fibreworks: 797 × 3' × 19' =
  45,429 ≈ 45,500).
- Implied eave = `gross sf / measured perimeter` — must be a plausible wall height
  (14–30 ft industrial) and must agree with site-photo scaling.
- Trace area within ~2% of at least one independent footprint source.

## Environment notes

- `pip install torch --index-url https://download.pytorch.org/whl/cpu`, then
  `torchvision` (same index), `segment-anything`, `opencv-python-headless`, `openpyxl`,
  `pillow`. SAM ViT-B checkpoint: `dl.fbaipublicfiles.com/segment_anything/sam_vit_b_01ec64.pth`.
- LibreOffice may be broken in cloud sandboxes — xlsx totals still compute on open in
  Excel; keep totals as SUM formulas and state key totals in the cover message.
