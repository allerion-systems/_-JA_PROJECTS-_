import * as React from "react";
import { LISTINGS, LISTING_KINDS } from "@/data";
import { Btn, Head, Lab, Panel, Tag, cx, inputCls } from "@/ui";

const tone = (k: string) =>
  k === "Wanted" ? "safety" : k === "Crews" ? "good" : k === "Surplus" ? "steel" : "grey";

export default function Yard() {
  const [kind, setKind] = React.useState("All");
  const [q, setQ] = React.useState("");

  const list = LISTINGS.filter(l =>
    (kind === "All" || l.kind === kind) &&
    (q.trim() === "" || (l.title + l.body + l.where + l.who).toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <Head
        eyebrow="The Yard"
        title="Classifieds for People Who Build"
        sub="Surplus material, iron for sale, crews looking for the next job, and the truck somebody needs gone by Friday. Free to post, no account, no algorithm. The I-65 corridor first, then wherever it works."
        right={<Btn size="sm">Post a listing</Btn>}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {LISTING_KINDS.map(k => (
          <button key={k} onClick={() => setKind(k)}
            className={cx("lab border px-2.5 py-1.5",
              kind === k ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                         : "border-[hsl(var(--rule))] text-[hsl(var(--ink-2))] hover:border-[hsl(var(--ink))]")}>
            {k}
          </button>
        ))}
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search listings…" className={cx(inputCls, "ml-auto w-full sm:w-[260px]")} />
      </div>

      <div className="border border-[hsl(var(--rule))]">
        {list.map((l, i) => (
          <article key={l.id}
            className={cx("grid gap-3 bg-[hsl(var(--panel))] p-4 sm:grid-cols-[1fr_auto]",
              i !== list.length - 1 && "border-b border-[hsl(var(--rule))]")}>
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <Tag tone={tone(l.kind) as never}>{l.kind}</Tag>
                <span className="mono text-[11px] text-[hsl(var(--ink-3))]">{l.id}</span>
                <span className="mono text-[11px] text-[hsl(var(--ink-3))]">· {l.when}</span>
              </div>
              <h3 className="disp text-[21px] font-semibold leading-[1.08]">{l.title}</h3>
              <p className="mt-1.5 max-w-[75ch] text-[13.5px] leading-[1.5] text-[hsl(var(--ink-2))]">{l.body}</p>
              <div className="mono mt-2 text-[12px] text-[hsl(var(--ink-3))]">
                {l.who} · {l.where}
              </div>
            </div>
            <div className="flex items-start justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
              <div className="disp text-[24px] font-bold leading-none text-[hsl(var(--safety))]">{l.price}</div>
              <Btn size="sm" variant="line">Contact</Btn>
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 && (
        <Panel className="text-center text-[hsl(var(--ink-2))]">No listings match.</Panel>
      )}

      <Panel className="mt-6 border-l-2 border-l-[hsl(var(--safety))]">
        <Lab className="mb-2 !text-[hsl(var(--safety))]">Why this is here</Lab>
        <p className="max-w-[80ch] text-[13.5px] leading-[1.6]">
          The classifieds are not a revenue line. They are the reason a superintendent opens this
          site on a Tuesday when he is not buying anything. Attention first, orders second —
          and every listing tells us who is building what, where, and when.
        </p>
      </Panel>
    </div>
  );
}
