import { IfcAPI, IFC4, Schemas } from "web-ifc";
import type { Element } from "@/bim";

/* ------------------------------------------------------------------------
   IFC export — the 5D takeoff as a real ISO 16739 building model.
   Every bim.ts element already carries its IFC class; here that metadata
   becomes an actual IFC4 SPF file: IfcProject > IfcSite > IfcBuilding >
   IfcBuildingStorey, one entity per takeoff line, each with an
   "MVS_Takeoff" property set (SKU / Qty / Unit / UnitPrice /
   ExtendedPrice). Geometry is intentionally minimal for v1 — entities
   share a default placement; the semantic model + quantities are the
   deliverable. Opens in Revit, BIMcollab, or any IFC4 viewer.

   This module is loaded ONLY on demand (dynamic import from the scene
   overlay) so web-ifc and its wasm never touch the entry chunk.
   ---------------------------------------------------------------------- */

export type IfcExportMeta = {
  /** Design tool name, e.g. "MVS Shed Designer". */
  tool: string;
  /** Human summary of the design parameters. */
  params: string;
  /** Branding line stamped into the file header + project pset. */
  brand?: string;
  /** Download filename; ".ifc" appended when missing. */
  filename?: string;
};

const BRAND = "Misty Valley Supply — 5D designer takeoff";

// ---- element factory -----------------------------------------------------
// Explicit constructors per IFC class the bim modules emit (shed + deck),
// each with its full IFC4 attribute list. Anything unknown falls back to
// IfcBuildingElementProxy — never a crash, never a fake class.

type Guid = InstanceType<typeof IFC4.IfcGloballyUniqueId>;
type Placement = InstanceType<typeof IFC4.IfcLocalPlacement>;

function makeEntity(
  ifcClass: string,
  g: Guid,
  name: InstanceType<typeof IFC4.IfcLabel>,
  objType: InstanceType<typeof IFC4.IfcLabel> | null,
  pl: Placement,
  tag: InstanceType<typeof IFC4.IfcIdentifier> | null,
) {
  switch (ifcClass) {
    case "IfcBeam": return new IFC4.IfcBeam(g, null, name, null, objType, pl, null, tag, null);
    case "IfcMember": return new IFC4.IfcMember(g, null, name, null, objType, pl, null, tag, null);
    case "IfcColumn": return new IFC4.IfcColumn(g, null, name, null, objType, pl, null, tag, null);
    case "IfcSlab": return new IFC4.IfcSlab(g, null, name, null, objType, pl, null, tag, null);
    case "IfcWallStandardCase": return new IFC4.IfcWallStandardCase(g, null, name, null, objType, pl, null, tag, null);
    case "IfcCovering": return new IFC4.IfcCovering(g, null, name, null, objType, pl, null, tag, null);
    case "IfcRoof": return new IFC4.IfcRoof(g, null, name, null, objType, pl, null, tag, null);
    case "IfcRamp": return new IFC4.IfcRamp(g, null, name, null, objType, pl, null, tag, null);
    case "IfcRailing": return new IFC4.IfcRailing(g, null, name, null, objType, pl, null, tag, null);
    case "IfcFastener": return new IFC4.IfcFastener(g, null, name, null, objType, pl, null, tag, null);
    case "IfcDoor": return new IFC4.IfcDoor(g, null, name, null, objType, pl, null, tag, null, null, null, null, null);
    case "IfcWindow": return new IFC4.IfcWindow(g, null, name, null, objType, pl, null, tag, null, null, null, null, null);
    case "IfcElementAssembly": return new IFC4.IfcElementAssembly(g, null, name, null, objType, pl, null, tag, null, null);
    case "IfcDistributionElement": return new IFC4.IfcDistributionElement(g, null, name, null, objType, pl, null, tag);
    default: return new IFC4.IfcBuildingElementProxy(g, null, name, null, objType, pl, null, tag, null);
  }
}

// ---- model builder -------------------------------------------------------

/** Build the IFC4 model from takeoff elements on an already-initialized
    IfcAPI and return the serialized SPF bytes. Pure of any DOM concern —
    the node round-trip test drives this directly. */
export function elementsToIfcBytes(api: IfcAPI, elements: Element[], meta: IfcExportMeta): Uint8Array {
  const brand = meta.brand ?? BRAND;
  const modelID = api.CreateModel({
    schema: Schemas.IFC4,
    name: meta.filename ?? "mvs-design.ifc",
    description: ["ViewDefinition [DesignTransferView]", `${meta.tool}: ${meta.params}`],
    authors: [meta.tool],
    organizations: [brand],
  });
  if (modelID < 0) throw new Error("web-ifc could not create an IFC4 model");
  try {
    const guid = () => api.CreateIFCGloballyUniqueId(modelID) as Guid;
    const label = (s: string) => new IFC4.IfcLabel(s);
    const id = (s: string) => new IFC4.IfcIdentifier(s);

    // one shared default placement at the world origin — v1 carries
    // semantics + quantities, not detailed geometry
    const origin = new IFC4.IfcCartesianPoint([
      new IFC4.IfcLengthMeasure(0), new IFC4.IfcLengthMeasure(0), new IFC4.IfcLengthMeasure(0),
    ]);
    const worldAxis = new IFC4.IfcAxis2Placement3D(origin, null, null);
    const placement = new IFC4.IfcLocalPlacement(null, worldAxis);

    const context = new IFC4.IfcGeometricRepresentationContext(
      null, label("Model"), new IFC4.IfcDimensionCount(3), new IFC4.IfcReal(1e-5), worldAxis, null,
    );
    const units = new IFC4.IfcUnitAssignment([
      new IFC4.IfcSIUnit(IFC4.IfcUnitEnum.LENGTHUNIT, null, IFC4.IfcSIUnitName.METRE),
      new IFC4.IfcSIUnit(IFC4.IfcUnitEnum.AREAUNIT, null, IFC4.IfcSIUnitName.SQUARE_METRE),
      new IFC4.IfcSIUnit(IFC4.IfcUnitEnum.VOLUMEUNIT, null, IFC4.IfcSIUnitName.CUBIC_METRE),
    ]);

    // spatial spine: project > site > building > storey
    const project = new IFC4.IfcProject(
      guid(), null, label(meta.tool), new IFC4.IfcText(meta.params), null, label(brand), null, [context], units,
    );
    const site = new IFC4.IfcSite(
      guid(), null, label("Site"), null, null, placement, null, null,
      IFC4.IfcElementCompositionEnum.ELEMENT, null, null, null, null, null,
    );
    const building = new IFC4.IfcBuilding(
      guid(), null, label(meta.tool.replace(/ Designer$/, "")), null, null, placement, null, null,
      IFC4.IfcElementCompositionEnum.ELEMENT, null, null, null,
    );
    const storey = new IFC4.IfcBuildingStorey(
      guid(), null, label("Level 1"), null, null, placement, null, null,
      IFC4.IfcElementCompositionEnum.ELEMENT, new IFC4.IfcLengthMeasure(0),
    );
    api.WriteLine(modelID, project);
    api.WriteLine(modelID, site);
    api.WriteLine(modelID, building);
    api.WriteLine(modelID, storey);
    api.WriteLine(modelID, new IFC4.IfcRelAggregates(guid(), null, label("Project container"), null, project, [site]));
    api.WriteLine(modelID, new IFC4.IfcRelAggregates(guid(), null, label("Site container"), null, site, [building]));
    api.WriteLine(modelID, new IFC4.IfcRelAggregates(guid(), null, label("Building container"), null, building, [storey]));

    // design metadata pset on the project
    const psv = (name: string, value: InstanceType<typeof IFC4.IfcLabel> | InstanceType<typeof IFC4.IfcReal>) =>
      new IFC4.IfcPropertySingleValue(id(name), null, value, null);
    const designPset = new IFC4.IfcPropertySet(guid(), null, label("MVS_Design"), null, [
      psv("Tool", label(meta.tool)),
      psv("Parameters", label(meta.params)),
      psv("Brand", label(brand)),
    ]);
    api.WriteLine(modelID, new IFC4.IfcRelDefinesByProperties(guid(), null, null, null, [project], designPset));

    // one entity per takeoff line, each with its MVS_Takeoff pset
    const products = [];
    for (const e of elements) {
      const entity = makeEntity(e.ifcClass, guid(), label(e.name), e.sku ? label(e.sku) : null,
        placement, e.sku ? id(e.sku) : null);
      api.WriteLine(modelID, entity);
      products.push(entity);
      const pset = new IFC4.IfcPropertySet(guid(), null, label("MVS_Takeoff"), null, [
        psv("SKU", label(e.sku ?? "")),
        psv("Qty", new IFC4.IfcReal(e.qty)),
        psv("Unit", label(e.unit)),
        psv("UnitPrice", new IFC4.IfcReal(e.unitPrice)),
        psv("ExtendedPrice", new IFC4.IfcReal(e.ext)),
      ]);
      api.WriteLine(modelID, new IFC4.IfcRelDefinesByProperties(guid(), null, null, null, [entity], pset));
    }
    api.WriteLine(modelID, new IFC4.IfcRelContainedInSpatialStructure(
      guid(), null, label("Storey contents"), null, products, storey,
    ));

    return api.SaveModel(modelID);
  } finally {
    api.CloseModel(modelID);
  }
}

// ---- browser wrapper -----------------------------------------------------

let apiPromise: Promise<IfcAPI> | null = null;

/** Init web-ifc once, pointing its wasm loader at the vite-bundled asset.
    In the single-file artifact build the same-origin wasm fetch serves
    nothing — that rejection surfaces to the caller as a plain Error. */
async function browserApi(): Promise<IfcAPI> {
  if (!apiPromise) {
    apiPromise = (async () => {
      const { default: wasmUrl } = await import("web-ifc/web-ifc.wasm?url");
      const api = new IfcAPI();
      // force single-thread: only the plain web-ifc.wasm is bundled
      await api.Init(path => (path.endsWith(".wasm") ? wasmUrl : path), true);
      return api;
    })().catch(err => {
      apiPromise = null; // allow a retry (e.g. transient network)
      throw err;
    });
  }
  return apiPromise;
}

/** Export the takeoff as an .ifc download (same anchor-click mechanism as
    the .glb export). Throws when wasm cannot load — callers catch and show
    a friendly message instead of an unhandled error. */
export async function exportElementsAsIfc(elements: Element[], meta: IfcExportMeta): Promise<void> {
  const api = await browserApi();
  const bytes = elementsToIfcBytes(api, elements, meta);
  if (bytes.length === 0) throw new Error("IFC serialization produced no data");
  const base = meta.filename ?? "mvs-design.ifc";
  const name = base.endsWith(".ifc") ? base : `${base}.ifc`;
  const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: "application/x-step" });
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
}
