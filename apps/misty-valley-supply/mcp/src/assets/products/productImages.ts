/* AI-generated representative product photography, keyed by SKU.
   Files are named <sku lowercased>.jpg; drop a new file in and it wires
   itself. Supplier photography replaces these per SKU before launch. */

const files = import.meta.glob("./*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const PRODUCT_IMAGES: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const sku = path.replace(/^\.\//, "").replace(/\.jpg$/, "").toUpperCase();
  PRODUCT_IMAGES[sku] = url;
}
