import * as React from "react";
import { useAuth } from "@/auth";
import { ALL_PERMS, DIRECTORY, PERMS, ROLES, hasPerm, roleById, type Perm } from "@/rbac";
import { Btn, DataTable, Lab, Panel, Tag, cx } from "@/ui";

const SIDES = [
  { id: "internal", label: "Misty Valley staff" },
  { id: "customer", label: "Contractor side" },
  { id: "marketplace", label: "Marketplace" },
] as const;

export default function Users({ onSignIn }: { onSignIn: () => void }) {
  const { can, person } = useAuth();
  const [tab, setTab] = React.useState<"people" | "roles" | "matrix">("people");
  const [q, setQ] = React.useState("");

  if (!can("user.roles") && !can("user.invite")) return (
    <Panel className="mx-auto max-w-[520px] card-hi text-center" pad={false}>
      <div className="tape h-1.5" />
      <div className="p-6">
        <h2 className="disp text-[28px] font-bold leading-none">Users and roles</h2>
        <p className="mx-auto mt-3 max-w-[44ch] text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
          {person
            ? "Your role cannot manage users. That is the point of roles — ask an owner or your company's admin."
            : "Sign in as an owner or a customer admin to manage users."}
        </p>
        {!person && <Btn className="mt-5 w-full" onClick={onSignIn}>Sign in</Btn>}
      </div>
    </Panel>
  );

  const people = DIRECTORY.filter(d =>
    q.trim() === "" || `${d.name} ${d.company} ${d.email} ${roleById(d.roleId).name}`
      .toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-[hsl(var(--ink))] pb-2">
        <div>
          <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Administration</Lab>
          <h1 className="disp text-[28px] font-bold leading-none sm:text-[40px]">Users, roles, permissions</h1>
        </div>
        {can("user.invite") && <Btn size="sm">＋ Invite someone</Btn>}
      </div>

      <div className="mb-4 flex gap-0 overflow-x-auto border-b border-[hsl(var(--ink))]">
        {([["people", "People"], ["roles", "Roles"], ["matrix", "Permission matrix"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={cx("disp -mb-0.5 min-h-[44px] whitespace-nowrap border-b-[3px] px-4 py-2.5 text-[15px] font-semibold",
              tab === id ? "border-[hsl(var(--safety))] text-[hsl(var(--ink))]"
                         : "border-transparent text-[hsl(var(--ink-3))]")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "people" && (
        <>
          <input value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search name, company or role"
            aria-label="Search people" className="mb-3 h-11 w-full border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 text-[15px] outline-none focus:border-[hsl(var(--safety))] sm:max-w-[380px]" />
          <Panel pad={false}>
            <DataTable
              cols={["Name", "Company", "Role", "Branch", "Last seen", "Status", ""]}
              rows={people.map(d => {
                const r = roleById(d.roleId);
                return [
                  <span>
                    <span className="font-semibold">{d.name}</span>
                    <span className="mt-0.5 block text-[11px] text-[hsl(var(--ink-3))]">{d.email}</span>
                  </span>,
                  <span className="text-[13px]">{d.company}</span>,
                  <Tag tone={r.side === "internal" ? "safety" : r.side === "customer" ? "steel" : "good"}>{r.name}</Tag>,
                  <span className="text-[13px]">{d.branch}</span>,
                  <span className="text-[13px] text-[hsl(var(--ink-2))]">{d.last}</span>,
                  <Tag tone={d.status === "Active" ? "good" : d.status === "Invited" ? "steel" : "warn"}>{d.status}</Tag>,
                  can("user.roles")
                    ? <button className="lab inline-flex min-h-[44px] items-center !text-[hsl(var(--safety-2))] underline">Change role</button>
                    : <span />,
                ];
              })}
            />
          </Panel>
        </>
      )}

      {tab === "roles" && (
        <div className="grid gap-4">
          {SIDES.map(s => (
            <div key={s.id}>
              <h2 className="disp mb-2 border-b border-[hsl(var(--rule))] pb-1.5 text-[18px] font-bold">{s.label}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ROLES.filter(r => r.side === s.id).map(r => (
                  <Panel key={r.id} className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="disp text-[18px] font-semibold leading-none">{r.name}</span>
                      <span className="text-[11px] text-[hsl(var(--ink-3))]">
                        {r.perms === "*" ? "all" : r.perms.length}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.45] text-[hsl(var(--ink-2))]">{r.blurb}</p>
                    <div className="mt-2 text-[11px] text-[hsl(var(--ink-3))]">
                      lands on /{r.home} · {DIRECTORY.filter(d => d.roleId === r.id).length} people
                    </div>
                  </Panel>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "matrix" && (
        <div className="overflow-x-auto border border-[hsl(var(--rule))]">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[hsl(var(--ink))] bg-[hsl(var(--panel))]">
                <th className="lab sticky left-0 z-10 bg-[hsl(var(--panel))] px-3 py-2">Permission</th>
                {ROLES.map(r => (
                  <th key={r.id} className="px-2 py-2 align-bottom">
                    <span className="block text-[11px] leading-[1.15] text-[hsl(var(--ink-2))]">{r.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_PERMS.map((p: Perm, i) => (
                <tr key={p} className={cx("border-b border-[hsl(var(--rule))]",
                  i % 2 ? "bg-[hsl(var(--panel-2))]" : "bg-[hsl(var(--panel))]")}>
                  <td className={cx("sticky left-0 z-10 px-3 py-1.5",
                    i % 2 ? "bg-[hsl(var(--panel-2))]" : "bg-[hsl(var(--panel))]")}>
                    <span className="text-[13px]">{PERMS[p]}</span>
                    <span className="ml-1.5 text-[11px] text-[hsl(var(--ink-3))]">{p}</span>
                  </td>
                  {ROLES.map(r => (
                    <td key={r.id} className="px-2 py-1.5 text-center">
                      <span className={cx("text-[13px]",
                        hasPerm(r, p) ? "text-[hsl(var(--good))]" : "text-[hsl(var(--rule))]")}>
                        {hasPerm(r, p) ? "●" : "·"}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
