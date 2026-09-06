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
        title="Operations"
        sub="Prototype, not a system of record — §Odoo below maps every screen to the module that should run it."
      />

      {/* KPI strip */}
      <div className="mb-8 grid gap-px border border-[hsl(var(--rule))] bg-[hsl(var(--rule))] sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Open orders", String(KPI.openOrders), ""],
          ["Open value", money(KPI.openValue), ""],
          ["Gross margin", `${KPI.grossPct}%`, "blended"],
          ["Dropshipped", `${KPI.dropshipPct}%`, "of lines"],
          ["Avg fulfilment", KPI.avgFulfil, ""],
          ["On time", `${KPI.onTime}%`, "to the jobsite"],
        ].map(([k, v, s]) => (
          <div key={k} className="bg-[hsl(var(--panel))] p-4">
            <Lab className="mb-1.5">{k}</Lab>
            <div className="disp text-[28px] font-bold leading-none">{v}</div>
            {s && <div className="mt-1 text-[11px] text-[hsl(var(--ink-3))]">{s}</div>}
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
            <span className="mono text-[hsl(var(--safety-2))]">{o.id}</span>,
            o.customer,
            <span className="text-[hsl(var(--ink-2))]">{o.job}</span>,
            <span className="text-[13px]">{o.placed}</span>,
            <span className="text-[13px]">{o.route}</span>,
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
                    <div className="mt-0.5 text-[11px] text-[hsl(var(--warn))]">
                      no terms yet — prepay
                    </div>
                  )}
                </div>,
                <Tag tone={s.mode === "Fabricate" ? "safety" : "steel"}>{s.mode}</Tag>,
                <span className="text-[13px]">{s.terms}</span>,
                <span className="text-[13px]">{s.ships}</span>,
                <span className="text-[13px]">{s.cut}</span>,
                s.lines,
              ])}
            />
          </Panel>
          <p className="mt-3 max-w-[60ch] text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
            <strong>The cut-off time is the promise date:</strong> an order taken at 3:05 PM ET
            against a 3:00 PM cut-off ships tomorrow — encode it, do not remember it.
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
                  <span className="disp text-[15px] font-semibold">{label}</span>
                  <span className="text-[13px]">{n as number} lines</span>
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
            <p className="text-[13px] leading-[1.55]">
              Zero stocked lines is the strategy: dropship carries no inventory and no working
              capital. Stock only what you cannot get in two days, once the volume proves it.
            </p>
          </Panel>
        </div>
      </div>

      {/* odoo */}
      <div className="mt-10">
        <div className="mb-3 border-b border-[hsl(var(--ink))] pb-2">
          <h3 className="disp text-[22px] font-semibold">§ Odoo — what to actually configure</h3>
        </div>
        <p className="mb-4 max-w-[80ch] text-[13px] leading-[1.6] text-[hsl(var(--ink-2))]">
          Odoo Community (Python/PostgreSQL, LGPLv3) needs a real server — everything above is
          the <strong>specification</strong> for configuring modules that already exist, not a
          replacement for them.
        </p>
        <Panel pad={false}>
          <DataTable
            cols={["Screen", "Odoo module", "Note"]}
            rows={ODOO_MAP.map(m => [
              <span className="disp text-[15px] font-semibold">{m.screen}</span>,
              <span className="text-[13px] text-[hsl(var(--safety-2))]">{m.module}</span>,
              <span className="text-[13px] text-[hsl(var(--ink-2))]">{m.note}</span>,
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}
