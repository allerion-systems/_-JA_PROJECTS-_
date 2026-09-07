# Open-Source BIM Stack — cloned, licensed, and how we use each

*Directive: "There are open source BIM tools — literally clone them from GitHub."
Cloned, license-checked, and slotted into the pipeline. The rule that governs all of it:
we adopt engines and patterns, never a competitor's product identity.*

## What is cloned and running

| Tool | License | Role at MVS |
|------|---------|-------------|
| **three.js** (already our base) | MIT | The designer's render engine; examples/jsm modules (postprocessing, environments, GLTFExporter) ship with it |
| **ThatOpen engine_components** (github.com/ThatOpen/engine_components) | MIT | The IFC.js successor — browser BIM components. Reference for our IFC integration; safe to depend on commercially |
| **web-ifc** (github.com/ThatOpen/engine_web-ifc) | MPL-2.0 | WASM IFC reader/WRITER. File-level copyleft only — usable as a dependency in our closed app. This is the path to exporting real `.ifc` files |
| **Blender 4.0** (headless, apt) | GPL (tool, not library — outputs are ours) | Cycles CPU renderer: designer `.glb` exports → studio-quality product photography. Pipeline proven today |

## The render pipeline (proven end-to-end today)

designer scene → GLTFExporter `.glb` (the "3D file" button) → Blender headless
(`scratchpad/render-glb.py`: backdrop-mesh removal, ground + sun + area fill, 3/4 hero
camera, Cycles 160 samples, Filmic) → 1024² product shot. First result: the premium
portable render with soft global illumination and correct material response — a class
above the raw WebGL capture. All product images for building SKUs now come from this
pipeline; refresh any SKU by re-exporting its `.glb` and re-running one command.

## The IFC export plan (next build item)

`bim.ts` already speaks IFC class names (IfcMember, IfcCovering, IfcDistributionElement…)
on every takeoff line — the 5D model is IFC-shaped by design. Integration: add web-ifc
as a dependency, map each takeoff element + its scene geometry to IFC entities with
property sets carrying SKU, quantity, and unit price, and ship an "IFC file" button
beside "3D file". What that buys: an architect or GC opens a Misty Valley design in
Revit/Archicad/BIMcollab — no competitor's configurator hands out real BIM deliverables.
Sequenced after the scene-quality overhaul lands (same files).

## Licensing red lines
- MIT/MPL dependencies: fine, keep notices intact.
- Blender is GPL but renders are unencumbered (program output).
- xeokit-sdk was evaluated and REJECTED: AGPL-3.0 — viral for a commercial SaaS.
- No copying of any proprietary configurator's assets, textures, or UI — patterns only.
