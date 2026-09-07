/* Stand-in for web-ifc in the single-file artifact build only (see
   vite.artifact.ts). The artifact sandbox cannot fetch the wasm anyway,
   so the real 3.5 MB module is swapped for this: Init throws before any
   schema class is touched, and ShedScene's existing catch shows the
   honest "needs the full site" toast. Real builds bundle real web-ifc. */
export class IfcAPI {
  SetWasmPath(): void { /* accepted, irrelevant */ }
  async Init(): Promise<never> {
    throw new Error("IFC export is unavailable in the artifact preview");
  }
}
// Schema surface exists only to satisfy imports; unreachable at runtime
// because Init above always throws first.
export const IFC4: Record<string, unknown> = new Proxy({}, {
  get: () => class { constructor(..._args: unknown[]) { /* never runs */ } },
});
export const Schemas = { IFC4: "IFC4" };
export default { IfcAPI, IFC4, Schemas };
