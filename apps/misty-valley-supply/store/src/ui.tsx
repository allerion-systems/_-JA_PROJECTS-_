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
    grey: "border-[hsl(var(--rule))] text-[hsl(var(--ink-2))] bg-transparent",
    safety: "border-[hsl(var(--safety))] text-[hsl(var(--safety))] bg-transparent",
    good: "border-[hsl(var(--good))] text-[hsl(var(--good))] bg-transparent",
    warn: "border-[hsl(var(--warn))] text-[hsl(var(--warn))] bg-transparent",
    steel: "border-[hsl(var(--steel))] text-[hsl(var(--steel))] bg-transparent",
  };
  return (
    <span className={cx("lab inline-flex items-center border px-1.5 py-[3px] leading-none", tones[tone])}>
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
  const base = "disp inline-flex items-center justify-center gap-2 border transition-colors select-none disabled:opacity-40";
  const sizes = { sm: "h-9 px-3.5 text-[13px]", md: "h-11 px-5 text-[15px] sm:h-10" };
  const vars = {
    solid: "bg-[hsl(var(--safety))] border-[hsl(var(--safety))] text-white hover:bg-[hsl(var(--safety-2))]",
    line: "bg-transparent border-[hsl(var(--ink))] text-[hsl(var(--ink))] hover:bg-[hsl(var(--ink))] hover:text-white",
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
    <div className={cx("border border-[hsl(var(--rule))] bg-[hsl(var(--panel))]", pad && "p-4", className)}>
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
  "h-9 w-full border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-2.5 text-[14px] mono focus:border-[hsl(var(--safety))] outline-none";

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
                  className={cx("lab border-b-2 border-[hsl(var(--ink))] px-3 py-2 text-left align-bottom whitespace-nowrap",
                    right.includes(i) && "text-right")}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-[hsl(var(--rule))] hover:bg-[hsl(var(--panel-2))]">
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
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-[hsl(var(--ink))] pb-2">
        <div className="min-w-0">
          {eyebrow && <Lab className="mb-1.5 !text-[hsl(var(--safety))]">{eyebrow}</Lab>}
          <h2 className="disp text-[26px] font-bold leading-[1.02] sm:text-[34px]">{title}</h2>
        </div>
        {right}
      </div>
      {sub && <p className="mt-2.5 max-w-[70ch] text-[13.5px] leading-[1.55] text-[hsl(var(--ink-2))] sm:text-[14px]">{sub}</p>}
    </div>
  );
}
