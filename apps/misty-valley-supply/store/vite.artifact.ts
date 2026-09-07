import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Single-file build for the claude.ai artifact: no code splitting, every
// asset inlined, so the whole store travels as one HTML file.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // array form: exact wasm match must win before the bare-module alias
    alias: [
      { find: "web-ifc/web-ifc.wasm", replacement: path.resolve(__dirname, "./src/webIfcStub.wasm") },
      // the artifact sandbox can't load the wasm; swap web-ifc for a stub
      // whose Init throws into ShedScene's honest toast (saves ~3.7 MB)
      { find: /^web-ifc$/, replacement: path.resolve(__dirname, "./src/webIfcStub.ts") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  build: {
    outDir: "dist-artifact",
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 5_000,
    rolldownOptions: { output: { inlineDynamicImports: true } },
  },
});
