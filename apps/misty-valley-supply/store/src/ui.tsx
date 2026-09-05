import * as React from "react";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

export const money = (n: number) =>
  n >= 100 ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
           : `$${n.toFixed(2)}`;

export function Lab({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cx("lab text-[hsl(var(--ink-3))]", className)}>{children}</div>;
}

export function Rule({ className }: { className?: string }) {
  return <div className={cx("h-px bg-[hsl(var(--rule))]", className)} />;
}

export function Tag({
  children, tone = "grey",
}: { children: React.ReactNode; tone?: "grey" | "safety" | "good" | "warn" | "steel" }) {
  const tones: Record<string, string> = {
    grey: "border-[hsl(var(--rule))] text-[hsl(var(--ink-2))] bg-[hsl(var(--panel-2))]",
    safety: "border-[hsl(var(--safety))]/25 text-[hsl(var(--safety))] bg-[hsl(var(--safety-soft))]",
    good: "border-[hsl(var(--good))]/25 text-[hsl(var(--good))] bg-[hsl(var(--good-soft))]",
    warn: "border-[hsl(var(--warn))]/30 text-[hsl(var(--warn))] bg-[hsl(var(--warn-soft))]",
    steel: "border-[hsl(var(--steel))]/20 text-[hsl(var(--steel))] bg-[hsl(var(--steel-soft))]",
  };
  return (
    <span className={cx("lab inline-flex items-center rounded-[3px] border px-1.5 py-[3px] leading-none", tones[tone])}>
      {children}
    </span>
  );
}

export function Btn({
  children, onClick, variant = "solid", size = "md", className, type, disabled,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "solid" | "line" | "ghost"; size?: "sm" | "md";
  className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  const base = "disp rounded-[5px] inline-flex items-center justify-center gap-2 border transition-all select-none disabled:opacity-40 disabled:shadow-none active:translate-y-px";
  const sizes = { sm: "h-9 px-4 text-[13.5px]", md: "h-11 px-6 text-[15.5px] sm:h-10" };
  const vars = {
    solid: "bg-[hsl(var(--safety))] border-[hsl(var(--safety))] text-white shadow-[0_1px_2px_hsl(20_90%_20%/.28)] hover:bg-[hsl(var(--safety-2))] hover:shadow-[0_3px_10px_-2px_hsl(20_90%_35%/.45)]",
    line: "bg-[hsl(var(--panel))] border-[hsl(var(--rule))] text-[hsl(var(--ink))] shadow-[0_1px_2px_hsl(215_28%_12%/.05)] hover:border-[hsl(var(--ink))]",
    ghost: "bg-transparent border-transparent text-[hsl(var(--ink-2))] hover:text-[hsl(var(--ink))]",
  };
  return (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled}
      className={cx(base, sizes[size], vars[variant], className)}>
      {children}
    </button>
  );
}

export function Panel({
  children, className, pad = true,
}: { children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <div className={cx("card overflow-hidden", pad && "p-4", className)}>
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <Lab>{label}</Lab>
      {children}
    </label>
  );
}

export const inputCls =
  "h-10 w-full rounded-[5px] border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 text-[14px] mono outline-none " +
  "transition-shadow focus:border-[hsl(var(--safety))] focus:shadow-[0_0_0_3px_hsl(var(--safety)/.14)]";

/** A dense industrial data table. Stacks into labelled cards on phones. */
export function DataTable({
  cols, rows, right = [],
}: { cols: string[]; rows: React.ReactNode[][]; right?: number[] }) {
  return (
    <>
      {/* phone: one card per row, each cell labelled */}
      <div className="sm:hidden">
        {rows.map((r, ri) => (
          <div key={ri} className="border-b border-[hsl(var(--rule))] px-3 py-3 last:border-0">
            {r.map((cell, ci) => (
              <div key={ci} className="mb-1.5 flex items-start justify-between gap-3 last:mb-0">
                <span className="lab shrink-0 pt-[3px]">{cols[ci]}</span>
                <span className={cx("min-w-0 text-right", right.includes(ci) && "mono")}>{cell}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* tablet and up: the real table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr>
              {cols.map((c, i) => (
                <th key={c}
                  className={cx("lab border-b border-[hsl(var(--ink))] bg-[hsl(var(--panel-2))] px-3 py-2.5 text-left align-bottom whitespace-nowrap",
                    right.includes(i) && "text-right")}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-[hsl(var(--rule-2))] transition-colors hover:bg-[hsl(var(--safety-soft))]">
                {r.map((cell, ci) => (
                  <td key={ci} className={cx("px-3 py-2.5 align-top", right.includes(ci) && "text-right mono")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Section heading with a hairline that runs to the edge. */
export function Head({
  eyebrow, title, sub, right,
}: { eyebrow?: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-[hsl(var(--ink))] pb-2.5">
        <div className="min-w-0">
          {eyebrow && <Lab className="mb-1.5 !text-[hsl(var(--safety))]">{eyebrow}</Lab>}
          <h2 className="disp text-[28px] font-bold leading-[1.02] sm:text-[38px]">{title}</h2>
        </div>
        {right}
      </div>
      {sub && <p className="mt-3 max-w-[70ch] text-[14px] leading-[1.6] text-[hsl(var(--ink-2))] sm:text-[15px]">{sub}</p>}
    </div>
  );
}
