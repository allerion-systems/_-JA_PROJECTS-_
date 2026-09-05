import * as React from "react";
import { ROOFSCREEN as RS } from "@/data";
import { Btn, Field, Head, Lab, Panel, Rule, Tag, cx, inputCls, money } from "@/ui";

export default function Screen() {
  const [lf, setLf] = React.useState(120);
  const [h, setH] = React.useState(8);
  const [mount, setMount] = React.useState(RS.mounts[0].id);
  const [infill, setInfill] = React.useState(RS.infills[0].id);

  const inf = RS.infills.find(i => i.id === infill)!;
  const hFactor = h / 8;
  const frame = Math.round(RS.baseLf * hFactor * lf);
  const infillCost = Math.round(inf.adder * hFactor * lf);
  const mountAdd = mount === "ballast" ? Math.round(lf * 14) : mount === "sleeper" ? Math.round(lf * 8) : 0;
  const total = frame + infillCost + mountAdd;

  return (
    <div>
      <Head
        eyebrow="Shop fabrication"
        title="Roof Screen Frames, Built Flat"
        sub="We fabricate the entire screen frame in the shop to the project's basis of design, deliver it in labeled sections, and set it in one pick. Priced by the linear foot, not by the guess."
      />

      {/* proof bar */}
      <div className="mb-8 border-2 border-[hsl(var(--ink))] bg-[hsl(var(--panel))]">
        <div className="tape h-1.5" />
        <div className="grid gap-px bg-[hsl(var(--rule))] sm:grid-cols-3">
          <div className="bg-[hsl(var(--panel))] p-5">
            <Lab className="mb-2">Proof of work</Lab>
            <div className="disp text-[26px] font-bold leading-none">{RS.proof}</div>
            <p className="mt-2 text-[13px] text-[hsl(var(--ink-2))]">
              Entire roof screen frame, shop-fabricated to the specified basis of design.
            </p>
          </div>
          <div className="bg-[hsl(var(--panel))] p-5">
            <Lab className="mb-2">Frame cost, complete</Lab>
            <div className="disp text-[38px] font-bold leading-none text-[hsl(var(--safety))]">
              {money(RS.cost)}
            </div>
            <p className="mt-2 text-[13px] text-[hsl(var(--ink-2))]">Fabricated, labeled and delivered.</p>
          </div>
          <div className="bg-[hsl(var(--panel))] p-5">
            <Lab className="mb-2">What you get</Lab>
            <ul className="grid gap-1.5 text-[13px] leading-[1.45]">
              {RS.bullets.map(b => (
                <li key={b} className="flex gap-2">
                  <span className="mt-[7px] h-px w-2.5 shrink-0 bg-[hsl(var(--safety))]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* configurator */}
        <div>
          <h3 className="disp mb-4 text-[22px] font-semibold">Configure a budget number</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Screen length (LF)">
              <input type="number" min={20} max={2000} value={lf}
                onChange={e => setLf(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
            </Field>
            <Field label="Screen height (ft)">
              <div className="flex gap-1.5">
                {RS.heights.map(x => (
                  <button key={x} onClick={() => setH(x)}
                    className={cx("mono h-9 flex-1 border text-[13px]",
                      h === x ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                              : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    {x}'
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Mounting">
              <div className="grid gap-1.5">
                {RS.mounts.map(m => (
                  <button key={m.id} onClick={() => setMount(m.id)}
                    className={cx("border p-2.5 text-left",
                      mount === m.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                     : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    <div className="disp text-[15px] font-semibold">{m.name}</div>
                    <div className="text-[12px] text-[hsl(var(--ink-2))]">{m.note}</div>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Infill">
              <div className="grid gap-1.5">
                {RS.infills.map(i => (
                  <button key={i.id} onClick={() => setInfill(i.id)}
                    className={cx("flex items-center justify-between border p-2.5 text-left",
                      infill === i.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                      : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    <span className="disp text-[15px] font-semibold">{i.name}</span>
                    <span className="mono text-[12px] text-[hsl(var(--ink-2))]">
                      {i.adder ? `+$${i.adder}/LF` : "—"}
                    </span>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        {/* estimate */}
        <div>
          <Panel className="sticky top-4 border-2 border-[hsl(var(--ink))]" pad={false}>
            <div className="tape h-1.5" />
            <div className="p-5">
              <Lab className="mb-3">Budget estimate</Lab>
              {[
                ["Frame", `${lf} LF × ${h}'`, frame],
                ["Infill", inf.name, infillCost],
                ["Mounting", RS.mounts.find(m => m.id === mount)!.name, mountAdd],
              ].map(([a, b, c]) => (
                <div key={a as string} className="mb-2.5 flex items-baseline justify-between gap-3">
                  <div>
                    <div className="disp text-[15px] font-semibold">{a}</div>
                    <div className="mono text-[11px] text-[hsl(var(--ink-3))]">{b}</div>
                  </div>
                  <div className="mono text-[14px]">{money(c as number)}</div>
                </div>
              ))}
              <Rule className="my-3" />
              <div className="flex items-baseline justify-between">
                <div className="disp text-[17px] font-bold">Budget</div>
                <div className="disp text-[34px] font-bold leading-none text-[hsl(var(--safety))]">
                  {money(total)}
                </div>
              </div>
              <div className="mono mt-1 text-right text-[11px] text-[hsl(var(--ink-3))]">
                {money(Math.round(total / Math.max(lf, 1)))} per LF
              </div>
              <Btn className="mt-4 w-full">Send the drawings</Btn>
              <p className="mt-3 text-[12px] leading-[1.5] text-[hsl(var(--ink-2))]">
                Budget only. A real number needs the roof plan, the equipment schedule and the
                wind load. We quote in two business days.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      {/* the honesty panel */}
      <Panel className="mt-8 border-l-2 border-l-[hsl(var(--safety))]">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Tag tone="safety">Read this before you substitute</Tag>
        </div>
        <p className="max-w-[80ch] text-[13.5px] leading-[1.6]">
          When a specification names a manufacturer as the basis of design, a shop-fabricated
          alternate is a <strong>formal substitution</strong> — it goes to the architect as a
          substitution request with our drawings and the sealed calculations, before the buyout,
          not after the steel is cut. We prepare that package as part of the quote. A silent swap
          is how a sub ends up tearing a screen back off a roof at their own cost, and we will not
          put you there.
        </p>
      </Panel>
    </div>
  );
}
