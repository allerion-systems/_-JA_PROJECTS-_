import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

/* ------------------------------------------------------------------------
   3D export — the bridge from the parametric design tools to CAD.
   Serializes the CURRENT disposable group as binary glTF (.glb) and hands
   it to the browser as a download. Canvas-generated textures embed fine
   (GLTFExporter re-encodes them as PNG); InstancedMesh goes out via
   EXT_mesh_gpu_instancing. The .glb opens in Omniverse, Blender, SketchUp,
   Revit and anything else glTF-aware. Everything happens client-side —
   nothing fetched, nothing uploaded (CSP-safe).
   ---------------------------------------------------------------------- */

/** Export `group` as a binary .glb and trigger a browser download. */
export function exportGroupAsGlb(group: THREE.Group, filename: string): void {
  const name = filename.endsWith(".glb") ? filename : `${filename}.glb`;
  const exporter = new GLTFExporter();
  exporter.parse(
    group,
    result => {
      const blob = new Blob([result as ArrayBuffer], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      // revoke after the click has been consumed by the download machinery
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    },
    err => {
      console.error("GLB export failed:", err);
    },
    { binary: true },
  );
}
