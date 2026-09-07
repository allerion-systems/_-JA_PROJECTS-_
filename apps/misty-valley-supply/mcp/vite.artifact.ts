import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Single-file build for the claude.ai artifact: no code splitting, every
// asset inlined, so the whole store travels as one HTML file.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    outDir: "dist-artifact",
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 5_000,
    rolldownOptions: { output: { inlineDynamicImports: true } },
  },
});
