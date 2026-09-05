import * as React from "react";
import { ORDERS, PRODUCTS } from "@/data";
import { useAuth } from "@/auth";
import { Btn, DataTable, Lab, Panel, Rule, Tag, cx, money } from "@/ui";

const TABS = ["Orders", "Invoices", "Lists", "Ship-to", "Users"] as const;
type Tab = (typeof TABS)[number];

const INVOICES = [
  { id: "INV-8841", order: "SO-1036", date: "Aug 29", due: "Sep 28", amt: 6000, status: "Open" },
  { id: "INV-8836", order: "SO-1038", date: "Sep 2", due: "Oct 2", amt: 1980, status: "Open" },
  { id: "INV-8830", order: "SO-1037", date: "Sep 2", due: "Oct 2", amt: 3260, status: "Open" },
  { id: "INV-8802", order: "SO-1029", date: "Aug 12", due: "Sep 11", amt: 12520, status: "Paid" },
  { id: "INV-8791", order: "SO-1024", date: "Aug 4", due: "Sep 3", amt: 4410, status: "Past due" },
];

const LISTS = [
  { name: "Standard roof kit — 10 sq", items: 6, note: "Guardrail, warning line, anchors" },
  { name: "New hire PPE bag", items: 5, note: "Hat, glasses, gloves, vest" },
  { name: "Lee Street — reorder", items: 9, note: "Last ordered Aug 29" },
];

export default function Account({ onSignIn }: { onSignIn: () => void }) {
  const { user, signOut } = useAuth();
  const [tab, setTab] = React.useState<Tab>("Orders");

  if (!user) return (
    <Panel className="mx-auto max-w-[520px] border-2 border-[hsl(var(--ink))] text-center" pad={false}>
      <div className="tape h-1.5" />
      <div className="p-6">
        <h2 className="disp text-[28px] font-bold leading-none">Sign in to your account</h2>
        <p className="mx-auto mt-3 max-w-[42ch] text-[13.5px] leading-[1.55] text-[hsl(var(--ink-2))]">
          Your contract pricing, order history, open invoices, saved lists and job-site ship-to
          addresses live here.
        </p>
        <Btn className="mt-5 w-full" onClick={onSignIn}>Sign in</Btn>
      </div>
    </Panel>
  );

  const pastDue = INVOICES.filter(i => i.status === "Past due").reduce((s, i) => s + i.amt, 0);
  const open = INVOICES.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amt, 0);

  return (
    <div>
      {/* header */}
      <div className="mb-5 border-2 border-[hsl(var(--ink))] bg-[hsl(var(--panel))]">
        <div className="tape h-1.5" />
        <div className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
          <div>
            <Lab className="mb-1.5">Account {user.acct}</Lab>
            <h1 className="disp text-[30px] font-bold leading-none sm:text-[36px]">{user.company}</h1>
            <div className="mono mt-2 text-[12.5px] text-[hsl(var(--ink-2))]">
              {user.name} · {user.terms} · {user.discountPct}% off list
            </div>
          </div>
          <Btn size="sm" variant="line" onClick={signOut}>Sign out</Btn>
        </div>
        <div className="grid gap-px border-t border-[hsl(var(--rule))] bg-[hsl(var(--rule))] sm:grid-cols-4">
          {[
            ["Credit available", money(user.creditLimit - user.creditUsed), ""],
            ["Open invoices", money(open), `${INVOICES.filter(i => i.status !== "Paid").length} documents`],
            ["Past due", money(pastDue), pastDue ? "pay to avoid hold" : "none"],
            ["Orders this year", "24", "on time 96%"],
          ].map(([k, v, s]) => (
            <div key={k} className="bg-[hsl(var(--panel))] p-4">
              <Lab className="mb-1.5">{k}</Lab>
              <div className={cx("disp text-[24px] font-bold leading-none",
                k === "Past due" && pastDue > 0 && "text-[hsl(var(--bad))]")}>{v}</div>
              {s && <div className="mono mt-1 text-[11px] text-[hsl(var(--ink-3))]">{s}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* tabs */}
      <div className="mb-4 flex gap-0 overflow-x-auto border-b-2 border-[hsl(var(--ink))]">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cx("disp whitespace-nowrap border-b-[3px] px-4 py-2.5 text-[16px] font-semibold -mb-0.5",
              tab === t ? "border-[hsl(var(--safety))] text-[hsl(var(--ink))]"
                        : "border-transparent text-[hsl(var(--ink-3))]")}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Orders" && (
        <Panel pad={false}>
          <DataTable
            cols={["Order", "Job", "Placed", "Route", "Total", "Status", ""]}
            right={[4]}
            rows={ORDERS.map(o => [
              <span className="mono text-[hsl(var(--safety))]">{o.id}</span>,
              o.job,
              <span className="mono text-[12px]">{o.placed}</span>,
              <span className="text-[12.5px]">{o.route}</span>,
              money(o.total),
              <Tag tone={o.status === "Delivered" || o.status === "Invoiced" ? "good" : "steel"}>{o.status}</Tag>,
              <button className="lab text-[hsl(var(--safety))] underline">Reorder</button>,
            ])}
          />
        </Panel>
      )}

      {tab === "Invoices" && (
        <>
          {pastDue > 0 && (
            <Panel className="mb-3 border-l-2 border-l-[hsl(var(--bad))]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13.5px]">
                  <strong>{money(pastDue)} past due.</strong> Accounts over 30 days past due go on
                  credit hold, which stops shipments — including ones already scheduled.
                </p>
                <Btn size="sm">Pay now</Btn>
              </div>
            </Panel>
          )}
          <Panel pad={false}>
            <DataTable
              cols={["Invoice", "Order", "Date", "Due", "Amount", "Status", ""]}
              right={[4]}
              rows={INVOICES.map(i => [
                <span className="mono">{i.id}</span>,
                <span className="mono text-[12px] text-[hsl(var(--ink-3))]">{i.order}</span>,
                <span className="mono text-[12px]">{i.date}</span>,
                <span className="mono text-[12px]">{i.due}</span>,
                money(i.amt),
                <Tag tone={i.status === "Paid" ? "good" : i.status === "Past due" ? "warn" : "steel"}>{i.status}</Tag>,
                i.status !== "Paid" ? <button className="lab text-[hsl(var(--safety))] underline">Pay</button> : <span />,
              ])}
            />
          </Panel>
        </>
      )}

      {tab === "Lists" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LISTS.map(l => (
            <Panel key={l.name}>
              <div className="disp text-[19px] font-semibold leading-[1.1]">{l.name}</div>
              <div className="mono mt-1.5 text-[11.5px] text-[hsl(var(--ink-3))]">
                {l.items} items · {l.note}
              </div>
              <Rule className="my-3" />
              <div className="flex gap-2">
                <Btn size="sm" className="flex-1">Add all to order</Btn>
                <Btn size="sm" variant="line">Edit</Btn>
              </div>
            </Panel>
          ))}
          <Panel className="flex items-center justify-center border-dashed">
            <button className="lab text-[hsl(var(--safety))]">＋ New list</button>
          </Panel>
        </div>
      )}

      {tab === "Ship-to" && (
        <div className="grid gap-3 sm:grid-cols-2">
          {user.shipTos.map(s => (
            <Panel key={s.id}>
              <div className="disp text-[18px] font-semibold leading-none">{s.label}</div>
              <div className="mono mt-1.5 text-[12px] text-[hsl(var(--ink-2))]">{s.addr}</div>
              <Rule className="my-3" />
              <div className="flex flex-wrap gap-1.5">
                <Tag tone="steel">Deck delivery</Tag>
                <Tag>Crane required</Tag>
              </div>
            </Panel>
          ))}
          <Panel className="flex items-center justify-center border-dashed">
            <button className="lab text-[hsl(var(--safety))]">＋ Add a job site</button>
          </Panel>
        </div>
      )}

      {tab === "Users" && (
        <Panel pad={false}>
          <DataTable
            cols={["Name", "Role", ""]}
            rows={user.users.map(u => [
              <span className="font-semibold">{u.name}</span>,
              <span className="text-[13px] text-[hsl(var(--ink-2))]">{u.role}</span>,
              <button className="lab text-[hsl(var(--safety))] underline">Edit</button>,
            ])}
          />
          <div className="border-t border-[hsl(var(--rule))] p-3">
            <button className="lab text-[hsl(var(--safety))]">＋ Invite someone</button>
          </div>
        </Panel>
      )}

      <p className="mt-6 text-[12px] leading-[1.5] text-[hsl(var(--ink-3))]">
        Prototype. {PRODUCTS.length} catalog lines; account data is illustrative.
      </p>
    </div>
  );
}
