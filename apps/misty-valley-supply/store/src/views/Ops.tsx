import * as React from "react";
import { KPI, ODOO_MAP, ORDERS, PRODUCTS, SUPPLIERS } from "@/data";
import { DataTable, Head, Lab, Panel, Rule, Tag, money } from "@/ui";

const statusTone = (s: string) =>
  s === "Delivered" || s === "Invoiced" ? "good"
  : s === "Awaiting PO" ? "warn"
  : s === "In fabrication" ? "safety" : "steel";

export default function Ops() {
  const dropship = PRODUCTS.filter(p => p.fulfil === "dropship").length;
  const fab = PRODUCTS.filter(p => p.fulfil === "fabricate").length;

  return (
    <div>
      <Head
        eyebrow="Back office"
        title="Operations"
        sub="The shape of the ERP, with real screens against real data. This is a prototype, not a system of record — §Odoo below maps every screen to the module that should actually run it."
      />

      {/* KPI strip */}
      <div className="mb-8 grid gap-px border border-[hsl(var(--rule))] bg-[hsl(var(--rule))] sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Open orders", String(KPI.openOrders), ""],
          ["Open value", money(KPI.openValue), ""],
          ["Gross margin", `${KPI.grossPct}%`, "blended"],
          ["Dropshipped", `${KPI.dropshipPct}%`, "of lines"],
          ["Avg fulfilment", KPI.avgFulfil, ""],
          ["On time", `${KPI.onTime}%`, "to the deck"],
        ].map(([k, v, s]) => (
          <div key={k} className="bg-[hsl(var(--panel))] p-4">
            <Lab className="mb-1.5">{k}</Lab>
            <div className="disp text-[27px] font-bold leading-none">{v}</div>
            {s && <div className="mono mt-1 text-[11px] text-[hsl(var(--ink-3))]">{s}</div>}
          </div>
        ))}
      </div>

      {/* orders */}
      <h3 className="disp mb-3 text-[22px] font-semibold">Sales orders</h3>
      <Panel pad={false} className="mb-8">
        <DataTable
          cols={["Order", "Customer", "Job", "Placed", "Route", "Lines", "Sell", "Cost", "GM%", "Status"]}
          right={[5, 6, 7, 8]}
          rows={ORDERS.map(o => [
            <span className="mono text-[hsl(var(--safety))]">{o.id}</span>,
            o.customer,
            <span className="text-[hsl(var(--ink-2))]">{o.job}</span>,
            <span className="mono text-[12px]">{o.placed}</span>,
            <span className="text-[12.5px]">{o.route}</span>,
            o.lines,
            money(o.total),
            money(o.cost),
            `${(((o.total - o.cost) / o.total) * 100).toFixed(1)}`,
            <Tag tone={statusTone(o.status) as never}>{o.status}</Tag>,
          ])}
        />
      </Panel>

      {/* suppliers */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="disp mb-3 text-[22px] font-semibold">Sources</h3>
          <Panel pad={false}>
            <DataTable
              cols={["Supplier", "Mode", "Terms", "Ships", "Cut-off", "Lines"]}
              right={[5]}
              rows={SUPPLIERS.map(s => [
                <div>
                  <div>{s.name}</div>
                  {s.cutNote && (
                    <div className="mono mt-0.5 text-[11px] text-[hsl(var(--warn))]">
                      no terms yet — prepay
                    </div>
                  )}
                </div>,
                <Tag tone={s.mode === "Fabricate" ? "safety" : "steel"}>{s.mode}</Tag>,
                <span className="mono text-[12px]">{s.terms}</span>,
                <span className="text-[12.5px]">{s.ships}</span>,
                <span className="mono text-[12px]">{s.cut}</span>,
                s.lines,
              ])}
            />
          </Panel>
          <p className="mt-3 max-w-[60ch] text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
            <strong>The cut-off time is the promise date.</strong> An order taken at 3:05 PM ET
            against a 3:00 PM cut-off ships tomorrow, not today. Encode it, do not remember it.
          </p>
        </div>

        <div>
          <h3 className="disp mb-3 text-[22px] font-semibold">Fulfilment mix</h3>
          <Panel>
            {[
              ["Dropship — supplier ships direct", dropship, "hsl(var(--steel))"],
              ["Shop fabricated", fab, "hsl(var(--safety))"],
              ["Stocked in Bonnieville", 0, "hsl(var(--good))"],
            ].map(([label, n, color]) => (
              <div key={label as string} className="mb-4 last:mb-0">
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="disp text-[16px] font-semibold">{label}</span>
                  <span className="mono text-[13px]">{n as number} lines</span>
                </div>
                <div className="h-2.5 w-full bg-[hsl(var(--panel-2))]">
                  <div style={{
                    width: `${((n as number) / PRODUCTS.length) * 100}%`,
                    background: color as string,
                  }} className="h-full" />
                </div>
              </div>
            ))}
            <Rule className="my-4" />
            <Lab className="mb-2 !text-[hsl(var(--safety))]">The whole point</Lab>
            <p className="text-[13px] leading-[1.55]">
              Zero stocked lines is not a gap — it is the strategy. Dropship carries no inventory
              and no working capital, which is the binding constraint on this business. Stock only
              what you cannot get in two days, and only once the volume proves it.
            </p>
          </Panel>
        </div>
      </div>

      {/* odoo */}
      <div className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b-2 border-[hsl(var(--ink))] pb-2">
          <h3 className="disp text-[22px] font-semibold">§ Odoo — what to actually configure</h3>
          <Tag tone="safety">Not built in a browser tab</Tag>
        </div>
        <p className="mb-4 max-w-[80ch] text-[13.5px] leading-[1.6] text-[hsl(var(--ink-2))]">
          Odoo Community is a Python and PostgreSQL server application under LGPLv3
          (<span className="mono">github.com/odoo/odoo</span>). It cannot run inside a single HTML
          file — it needs a server, a database and real sessions. Everything above is the
          <strong> specification</strong> for the configuration, not a replacement for it.
          Almost none of this is custom code; nearly all of it is configuration of modules that
          already exist.
        </p>
        <Panel pad={false}>
          <DataTable
            cols={["Screen", "Odoo module", "Note"]}
            rows={ODOO_MAP.map(m => [
              <span className="disp text-[15px] font-semibold">{m.screen}</span>,
              <span className="mono text-[12.5px] text-[hsl(var(--safety))]">{m.module}</span>,
              <span className="text-[13px] text-[hsl(var(--ink-2))]">{m.note}</span>,
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
