import * as React from "react";
import { useAuth } from "@/auth";
import { DASHBOARDS, PERMS, permCount, ALL_PERMS, type Tile } from "@/rbac";
import { Btn, DataTable, Lab, Panel, Rule, Tag, cx } from "@/ui";

const toneCls = (t?: Tile["tone"]) =>
  t === "safety" ? "text-[hsl(var(--safety))]"
  : t === "good" ? "text-[hsl(var(--good))]"
  : t === "warn" ? "text-[hsl(var(--warn))]"
  : t === "bad"  ? "text-[hsl(var(--bad))]" : "";

export default function Dashboard({ onSignIn }: { onSignIn: () => void }) {
  const { person, role, branch } = useAuth();
  const [showPerms, setShowPerms] = React.useState(false);

  if (!person || !role) return (
    <Panel className="mx-auto max-w-[520px] card-hi text-center" pad={false}>
      <div className="tape h-1.5" />
      <div className="p-6">
        <h2 className="disp text-[28px] font-bold leading-none">Your dashboard</h2>
        <p className="mx-auto mt-3 max-w-[44ch] text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
          What you see here depends on what you do. A driver gets a route. A buyer gets
          cut-off times. An owner gets the whole company. Sign in and it builds itself.
        </p>
        <Btn className="mt-5 w-full" onClick={onSignIn}>Sign in</Btn>
      </div>
    </Panel>
  );

  const d = DASHBOARDS[role.id];
  const perms = role.perms === "*" ? ALL_PERMS : role.perms;

  return (
    <div>
      {/* who you are */}
      <div className="mb-5 card-hi">
        <div className="tape h-1.5" />
        <div className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-5">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Tag tone={role.side === "internal" ? "safety" : role.side === "customer" ? "steel" : "good"}>
                {role.name}
              </Tag>
              <span className="text-[11px] text-[hsl(var(--ink-3))]">
                {person.company} · {branch.name}
              </span>
            </div>
            <h1 className="disp text-[28px] font-bold leading-none sm:text-[40px]">{d?.headline ?? "Dashboard"}</h1>
            <p className="mt-2 max-w-[62ch] text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">{role.blurb}</p>
          </div>
          <button onClick={() => setShowPerms(!showPerms)}
            className="lab min-h-[44px] shrink-0 border border-[hsl(var(--rule))] px-3 py-2 !text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]">
            {permCount(role)} permissions {showPerms ? "▴" : "▾"}
          </button>
        </div>

        {showPerms && (
          <div className="border-t border-[hsl(var(--rule))] p-4 sm:p-5">
            <Lab className="mb-2.5">What this role can do</Lab>
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_PERMS.map(p => {
                const on = perms.includes(p);
                return (
                  <div key={p} className={cx("flex items-baseline gap-2 border-b border-[hsl(var(--rule))] py-1.5",
                    !on && "opacity-45")}>
                    <span className={cx("w-3 shrink-0 text-[13px]",
                      on ? "text-[hsl(var(--good))]" : "text-[hsl(var(--ink-3))]")}>{on ? "✓" : "·"}</span>
                    <span className="text-[13px] leading-[1.35]">{PERMS[p]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* tiles */}
      {d && (
        <>
          <div className="mb-5 grid gap-px bg-[hsl(var(--rule))] sm:grid-cols-2 lg:grid-cols-4">
            {d.tiles.map(t => (
              <div key={t.k} className="bg-[hsl(var(--panel))] p-4">
                <Lab className="mb-1.5">{t.k}</Lab>
                <div className={cx("disp text-[28px] font-bold leading-none", toneCls(t.tone))}>{t.v}</div>
                {t.s && <div className="mt-1.5 text-[11px] text-[hsl(var(--ink-3))]">{t.s}</div>}
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {d.queues.map(q => (
              <Panel key={q.title} pad={false} className="min-w-0">
                <div className="border-b border-[hsl(var(--ink))] px-4 py-2.5">
                  <h2 className="disp text-[18px] font-bold leading-none">{q.title}</h2>
                </div>
                <DataTable
                  cols={q.cta ? [...q.cols, ""] : q.cols}
                  rows={q.rows.map(r => {
                    const cells: React.ReactNode[] = r.map((c, i) =>
                      i === 0
                        ? <span className="font-semibold">{c}</span>
                        : <span className="text-[13px] text-[hsl(var(--ink-2))]">{c}</span>);
                    if (q.cta) cells.push(
                      <button className="lab inline-flex min-h-[44px] items-center !text-[hsl(var(--safety-2))] underline">{q.cta}</button>);
                    return cells;
                  })}
                />
              </Panel>
            ))}
          </div>
        </>
      )}

      {!d && (
        <Panel>
          <p className="text-[13px]">No dashboard is configured for this role yet.</p>
        </Panel>
      )}

      <Rule className="my-6" />
      <p className="text-[13px] leading-[1.55] text-[hsl(var(--ink-3))]">
        Every screen in this app asks a permission, never a role name. That is why adding
        a role is a line of data and not a week of edits.
      </p>
    </div>
  );
}
