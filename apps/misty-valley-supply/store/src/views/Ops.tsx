import * as React from "react";
import { KPI, ODOO_MAP, ORDERS, PRODUCTS, SUPPLIERS } from "@/data";
import { Btn, DataTable, Head, Lab, Panel, Rule, Tag, money } from "@/ui";
import { useAuth } from "@/auth";
import {
  PO_FLOW, advancePo, loadOrders, loadPos, poText, routeOrder, savePos,
  unroutedOrders, type Po, type PoStatus,
} from "@/dropship";

const PO_TONE: Record<PoStatus, "grey" | "marine" | "safety" | "steel" | "good"> = {
  draft: "grey", sent: "marine", confirmed: "safety", shipped: "steel", delivered: "good",
};

/** Web orders → per-supplier blind-ship POs → tracked to delivered. */
function DropshipRouting() {
  const [pos, setPos] = React.useState<Po[]>(loadPos);
  const [orders] = React.useState(loadOrders);
  const [open, setOpen] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [track, setTrack] = React.useState<Record<string, string>>({});

  const update = (next: Po[]) => { setPos(next); savePos(next); };
  const route = (soRef: string) => {
    const order = orders.find(o => o.so === soRef);
    if (!order) return;
    update([...pos, ...routeOrder(order, PRODUCTS)]);
  };
  const step = (po: Po) => update(pos.map(p =>
    p.poId === po.poId ? advancePo(p, track[po.poId]) : p));
  const copy = async (po: Po) => {
    try { await navigator.clipboard.writeText(poText(po)); } catch { /* clipboard blocked */ }
    setCopied(po.poId);
    window.setTimeout(() => setCopied(c => (c === po.poId ? null : c)), 1600);
  };

  const unrouted = unroutedOrders(orders, pos);
  const stepLabel: Record<PoStatus, string> = {
    draft: "Mark sent", sent: "Mark confirmed", confirmed: "Add tracking → shipped",
    shipped: "Mark delivered", delivered: "",
  };

  return (
    <div className="mt-10">
      <div className="mb-3 border-b border-[hsl(var(--ink))] pb-2">
        <h3 className="disp text-[22px] font-semibold">§ Dropship routing</h3>
      </div>
      <p className="mb-4 max-w-[80ch] text-[13px] leading-[1.6] text-[hsl(var(--ink-2))]">
        Web orders route into per-supplier blind-ship POs; stock and fabricate lines stay
        under the MVS yard / shop. <strong>Prototype — PO email/EDI sends connect at launch
        (Zapier or Odoo); copy the PO to send it today.</strong>
      </p>

      {/* unrouted web orders */}
      <Panel pad={false} className="mb-4">
        {unrouted.length === 0 ? (
          <p className="p-4 text-[13px] text-[hsl(var(--ink-3))]">
            No unrouted web orders — every placed order has POs cut.
          </p>
        ) : unrouted.map(o => (
          <div key={o.so} className="flex flex-wrap items-center gap-3 border-b border-[hsl(var(--rule-2))] px-4 py-3 last:border-0">
            <span className="mono text-[hsl(var(--safety-2))]">{o.so}</span>
            <span className="text-[13px]">{o.lines!.length} {o.lines!.length === 1 ? "line" : "lines"}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-[hsl(var(--ink-2))]">
              {o.contact?.name ? `${o.contact.name} — ` : ""}{o.shipTo}
            </span>
            <Btn size="sm" onClick={() => route(o.so!)}>Route to suppliers</Btn>
          </div>
        ))}
      </Panel>

      {/* PO board, grouped by status */}
      {pos.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {PO_FLOW.map(st => {
            const group = pos.filter(p => p.status === st);
            if (!group.length) return null;
            return (
              <div key={st}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <Lab kicker>{st}</Lab>
                  <span className="num text-[11px] text-[hsl(var(--ink-3))]">{group.length}</span>
                </div>
                <Panel pad={false}>
                  {group.map(po => (
                    <div key={po.poId} className="border-b border-[hsl(var(--rule-2))] last:border-0">
                      <button onClick={() => setOpen(open === po.poId ? null : po.poId)}
                        className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-left hover:bg-[hsl(var(--safety-soft))]">
                        <span className="mono text-[13px] text-[hsl(var(--safety-2))]">{po.poId}</span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{po.supplier}</span>
                        <span className="text-[11px] text-[hsl(var(--ink-3))]">
                          {po.orderRef} · {po.lines.length} {po.lines.length === 1 ? "line" : "lines"}
                        </span>
                        <Tag tone={PO_TONE[po.status]}>{po.status}{po.tracking ? ` · ${po.tracking}` : ""}</Tag>
                        <span className="text-[11px] text-[hsl(var(--ink-3))]">{open === po.poId ? "▾" : "▸"}</span>
                      </button>
                      {open === po.poId && (
                        <div className="border-t border-[hsl(var(--rule-2))] bg-[hsl(var(--panel-2))] p-3">
                          <pre className="mono overflow-x-auto whitespace-pre rounded-[4px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] p-3 text-[11px] leading-[1.5]">
                            {poText(po)}
                          </pre>
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            <Btn size="sm" variant="line" onClick={() => copy(po)}>
                              {copied === po.poId ? "Copied ✓" : "Copy PO"}
                            </Btn>
                            {po.status === "confirmed" && (
                              <input value={track[po.poId] ?? ""}
                                onChange={e => setTrack({ ...track, [po.poId]: e.target.value })}
                                placeholder="Tracking #" aria-label={`Tracking number for ${po.poId}`}
                                className="h-10 w-[150px] rounded-[5px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-2.5 text-[13px] outline-none focus:border-[hsl(var(--safety))]" />
                            )}
                            {po.status !== "delivered" && (
                              <Btn size="sm" onClick={() => step(po)}
                                disabled={po.status === "confirmed" && !(track[po.poId] ?? "").trim()}>
                                {stepLabel[po.status]}
                              </Btn>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </Panel>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const statusTone = (s: string) =>
  s === "Delivered" || s === "Invoiced" ? "good"
  : s === "Awaiting PO" ? "warn"
  : s === "In fabrication" ? "safety" : "steel";

export default function Ops() {
  const { can } = useAuth();
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

      {/* dropship routing — permission-gated like the nav: check the perm, not the role */}
      {can("po.create") && <DropshipRouting />}

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
