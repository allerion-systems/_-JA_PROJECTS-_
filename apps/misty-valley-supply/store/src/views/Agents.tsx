import * as React from "react";
import { PRODUCTS } from "@/data";
import { Btn, DataTable, Head, Lab, Panel, Rule, Tag } from "@/ui";

const TOOLS = [
  { name: "search_products", args: "query, category, standard, max_price",
    ret: "Product[]", note: "Full-text across name, SKU, standard and OSHA cite." },
  { name: "get_product", args: "sku",
    ret: "Product", note: "Full spec including standard, OSHA rule, lead time and source." },
  { name: "check_compliance", args: "hazard, task",
    ret: "Product[] + citation", note: "Given a hazard, returns what OSHA requires and what satisfies it. The differentiator." },
  { name: "quote_roofscreen", args: "linear_feet, height_ft, mount, infill",
    ret: "Quote", note: "Budget number for a shop-fabricated frame." },
  { name: "create_quote", args: "lines[], job, ship_to",
    ret: "Quote + expiry", note: "Priced, dated, honours minimums and cut-off times." },
  { name: "place_order", args: "quote_id, po_number, approval",
    ret: "Order", note: "Requires an explicit human-approved PO. Never auto-executes." },
  { name: "list_classifieds", args: "kind, near, query", ret: "Listing[]", note: "The Yard, read-only." },
];

const EXAMPLE = `{
  "tool": "check_compliance",
  "arguments": {
    "hazard": "unprotected edge, 24 ft above lower level",
    "task": "roof re-cover, 8 workers, 3 weeks"
  }
}

→ {
  "requirement": "29 CFR 1926.501(b)(10)",
  "options": [
    { "sku": "MVS-RG-1000", "why": "guardrail per 1926.502(b)" },
    { "sku": "MVS-WL-600",  "why": "warning line ≥6 ft from edge, low-slope only" },
    { "sku": "MVS-FH-5PT",  "why": "PFAS — verify fall clearance first" }
  ],
  "warning": "MVS-LY-SA6 needs 18.5 ft below the anchor. At 24 ft with a
              parapet-height anchor this does not clear. Use an SRL."
}`;

export default function Agents() {
  const [copied, setCopied] = React.useState(false);
  const manifest = {
    name: "misty-valley-supply",
    version: "0.1.0",
    seller: { legal: "Misty Valley Supply", location: "Bonnieville, Kentucky, US" },
    currency: "USD",
    catalog_lines: PRODUCTS.length,
    fulfilment: ["dropship", "fabricate"],
    ships: "US, Canada, Mexico — quote for rest of world",
    standards_indexed: ["ANSI/ISEA Z87.1", "ANSI/ISEA Z89.1", "ANSI/ISEA 105",
                        "ANSI/ISEA 107", "ANSI/ASSP Z359", "OSHA 29 CFR 1926 subpart M"],
    endpoints: {
      manifest: "/.well-known/offer-manifest.json",
      catalog: "/api/catalog.json",
      mcp: "stdio | https (bearer)",
    },
    ordering: { requires_human_po: true, auto_execute: false },
  };

  const copy = () => {
    navigator.clipboard?.writeText(JSON.stringify(manifest, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div>
      <Head
        title="Built to Be Bought by Machines"
        sub="An assistant asks what OSHA requires for a hazard, gets the rule and the parts that satisfy it, and puts a priced quote in front of a human — no salesperson in the loop."
        right={<Tag tone="safety">MCP</Tag>}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <h3 className="disp mb-3 text-[22px] font-semibold">Tools exposed</h3>
          <Panel pad={false} className="mb-6">
            <DataTable
              cols={["Tool", "Arguments", "Returns", "Note"]}
              rows={TOOLS.map(t => [
                <span className="text-[13px] text-[hsl(var(--safety-2))]">{t.name}</span>,
                <span className="text-[11px] text-[hsl(var(--ink-2))]">{t.args}</span>,
                <span className="text-[11px]">{t.ret}</span>,
                <span className="text-[13px] text-[hsl(var(--ink-2))]">{t.note}</span>,
              ])}
            />
          </Panel>

          <h3 className="disp mb-3 text-[22px] font-semibold">The call that matters</h3>
          <p className="mb-3 max-w-[75ch] text-[13px] leading-[1.6] text-[hsl(var(--ink-2))]">
            <strong>check_compliance</strong> is the one nobody else has: it requires the catalog
            to carry the standard and the rule as structured data, and it answers the question a
            superintendent actually has.
          </p>
          <pre className="max-w-full overflow-x-auto border border-[hsl(var(--rule))] bg-[hsl(var(--ink))] p-3 text-[11px] leading-[1.6] text-[#dfe3e6] sm:p-4 sm:text-[13px]">
{EXAMPLE}
          </pre>
        </div>

        <div className="min-w-0">
          <Panel className="sticky top-4" pad={false}>
            <div className="tape h-1.5" />
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <Lab>Offer manifest</Lab>
                <button onClick={copy} className="lab inline-flex min-h-[44px] items-center !text-[hsl(var(--safety-2))] hover:underline">
                  {copied ? "Copied ✓" : "Copy JSON"}
                </button>
              </div>
              <pre className="max-h-[420px] max-w-full overflow-auto border border-[hsl(var(--rule))] bg-[hsl(var(--panel-2))] p-3 text-[11px] leading-[1.55] sm:text-[11px]">
{JSON.stringify(manifest, null, 2)}
              </pre>
              <Rule className="my-4" />
              <p className="text-[13px] leading-[1.55]">
                <strong>An agent can quote. Only a human can buy.</strong> Every order requires
                a PO number and an explicit approval; nothing auto-executes.
              </p>
              <Btn variant="line" className="mt-4 w-full">Read the integration doc</Btn>
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="mt-8 border-l-2 border-l-[hsl(var(--warn))]">
        <Lab className="mb-2 !text-[hsl(var(--warn))]">What is real today, and what is not</Lab>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="disp mb-1.5 text-[15px] font-semibold">Real</div>
            <ul className="grid gap-1.5 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
              {["The catalog, with standards and OSHA cites as structured data",
                "A working MCP server over stdio, runnable today",
                "The offer manifest, machine-readable",
                "This storefront"].map(x => (
                <li key={x} className="flex gap-2">
                  <span className="mt-[7px] h-px w-2.5 shrink-0 bg-[hsl(var(--good))]" />{x}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="disp mb-1.5 text-[15px] font-semibold">Not yet</div>
            <ul className="grid gap-1.5 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
              {["A hosted HTTPS endpoint with auth — needs a server and a domain",
                "Payments — needs a processor and a merchant account",
                "Live inventory and pricing — needs the supplier feeds",
                "Odoo as the system of record — needs the deployment"].map(x => (
                <li key={x} className="flex gap-2">
                  <span className="mt-[7px] h-px w-2.5 shrink-0 bg-[hsl(var(--warn))]" />{x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Panel>
    </div>
  );
}
