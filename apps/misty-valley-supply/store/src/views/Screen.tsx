import * as React from "react";
import { ROOFSCREEN as RS, SCREEN_PARTS } from "@/data";
import { Btn, DataTable, Field, Head, Lab, Panel, Rule, Tag, cx, inputCls, money } from "@/ui";

const usd2 = (n: number) => `$${n.toFixed(2)}`;

export default function Screen() {
  const [lf, setLf] = React.useState(RS.lee.lf);
  const [h, setH] = React.useState(RS.lee.height);
  const [mount, setMount] = React.useState(RS.mounts[0].id);
  const [panel, setPanel] = React.useState(RS.panels[0].id);
  const [drawings, setDrawings] = React.useState(true);
  const [markup, setMarkup] = React.useState(Math.round(RS.defaultMarkup * 100));
  const [mode, setMode] = React.useState<"kit" | "parts">("kit");

  const p = RS.panels.find(x => x.id === panel)!;
  const m = RS.mounts.find(x => x.id === mount)!;

  const faceSf = lf * h;
  const posts = Math.max(2, Math.ceil(lf / RS.lee.bay) + 1);
  const hatLf = lf * RS.hardware.hatRows(h);

  /* The $38.50/LF frame rate is what a fab shop quotes: tube, bases, hat
     channel and fasteners in one number. Only a non-standard mount adds. */
  const cost = {
    frame: Math.round(RS.frameCostLf(h) * lf),
    mount: Math.round(m.adder * lf),
    panel: Math.round(p.costSf * faceSf),
    eng: drawings ? Math.round(RS.shopDrawings.base + RS.shopDrawings.perLf * lf) : 0,
  };
  const totalCost = Object.values(cost).reduce((a, b) => a + b, 0);
  const sell = Math.round(totalCost * (1 + markup / 100));
  const gm = sell ? (sell - totalCost) / sell : 0;

  const rows: [string, string, number][] = [
    ["Frame package", `${lf} LF × ${h}′ @ ${usd2(RS.frameCostLf(h))}/LF — tube, ${posts} bases, ${hatLf.toLocaleString()} LF hat channel, fasteners`, cost.frame],
    ["Mount adder", m.adder ? m.name.toLowerCase() : "square base — included", cost.mount],
    ["Panel", p.id === "none" ? "by others" : `${faceSf.toLocaleString()} SF ${p.name}`, cost.panel],
    ["Shop drawings + calcs", drawings ? "sealed, per project" : "not included", cost.eng],
  ];

  return (
    <div>
      <Head
        eyebrow="Shop fabrication"
        title="Roof Screens, Built Flat and Sold by the Piece"
        sub="We fabricate the whole screen frame to the project's basis of design and deliver it labeled and ready to set. Buy it as a kit, or buy the frame, the panel, the hat channel and the fasteners separately."
      />

      {/* ------------------------------------------------- Lee Street proof */}
      <div className="mb-8 card-hi">
        <div className="tape h-1.5" />
        <div className="p-5">
          <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Proof of work — {RS.proof}</Lab>
          <p className="max-w-[70ch] text-[13px] leading-[1.6] text-[hsl(var(--ink-2))]">
            A {RS.lee.height}′ RTU screen on {RS.bod.detail}. Basis of design{" "}
            <strong>{RS.bod.frame}</strong> frame with a <strong>{RS.bod.panel}</strong> panel.
            Misty Valley had the frame shop-fabricated, bought the panel, and sold the package
            to the roofing contractor. These are the actual numbers.
          </p>
        </div>
        <div className="grid gap-px border-t border-[hsl(var(--rule))] bg-[hsl(var(--rule))] sm:grid-cols-4">
          {[
            ["Frame fabrication", money(RS.lee.frameCost), "cost"],
            ["Panel", money(RS.lee.panelCost), "cost"],
            ["Sold for", money(RS.lee.sell), "price"],
            ["Gross margin", money(RS.lee.sell - RS.lee.frameCost - RS.lee.panelCost),
              `${Math.round(((RS.lee.sell - RS.lee.frameCost - RS.lee.panelCost) / RS.lee.sell) * 100)}% of the sale`],
          ].map(([k, v, s], i) => (
            <div key={k} className="bg-[hsl(var(--panel))] p-4">
              <Lab className="mb-1.5">{k}</Lab>
              <div className={cx("disp text-[28px] font-bold leading-none",
                i === 3 && "text-[hsl(var(--safety))]")}>{v}</div>
              <div className="mt-1 text-[11px] text-[hsl(var(--ink-3))]">{s}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------- kit / parts */}
      <div className="mb-5 flex gap-0 border-b border-[hsl(var(--ink))]">
        {(["kit", "parts"] as const).map(t => (
          <button key={t} onClick={() => setMode(t)}
            className={cx("disp -mb-0.5 border-b-[3px] px-4 py-2.5 text-[15px] font-semibold",
              mode === t ? "border-[hsl(var(--safety))] text-[hsl(var(--ink))]"
                         : "border-transparent text-[hsl(var(--ink-3))]")}>
            {t === "kit" ? "Configure a kit" : "Buy by the piece"}
          </button>
        ))}
      </div>

      {mode === "parts" && (
        <>
          <Panel pad={false} className="mb-4">
            <DataTable
              cols={["SKU", "Item", "UOM", "Unit cost", "Your price", "In kit"]}
              right={[3, 4]}
              rows={SCREEN_PARTS.map(sp => [
                <span className="mono text-[hsl(var(--safety))]">{sp.sku}</span>,
                <span>
                  <span className="font-semibold">{sp.name}</span>
                  <span className="mt-0.5 block text-[13px] leading-[1.45] text-[hsl(var(--ink-2))]">{sp.note}</span>
                </span>,
                <span className="text-[13px]">{sp.uom}</span>,
                <span className="text-[13px] text-[hsl(var(--ink-3))]">{usd2(sp.cost)}</span>,
                <span className="">{usd2(sp.cost * (1 + markup / 100))}</span>,
                sp.kit ? <Tag tone="good">kit</Tag> : <Tag>add-on</Tag>,
              ])}
            />
          </Panel>
          <p className="mb-8 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
            Unit cost is what the part lands at; your price applies the {markup}% markup set in the
            configurator. Move it there and this table moves with it.
          </p>
        </>
      )}

      {mode === "kit" && (
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* configurator */}
        <div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Screen length (LF)">
              <input type="number" min={10} max={4000} value={lf}
                onChange={e => setLf(Math.max(0, Number(e.target.value) || 0))} className={inputCls} />
            </Field>
            <Field label="Screen height above deck">
              <div className="flex flex-wrap gap-1.5">
                {RS.heights.map(x => (
                  <button key={x} onClick={() => setH(x)}
                    className={cx("h-9 min-w-[52px] flex-1 border px-1 text-[13px]",
                      h === x ? "border-[hsl(var(--ink))] bg-[hsl(var(--ink))] text-white"
                              : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    {x === 3.5 ? "3′-6″" : `${x}′`}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Post support">
              <div className="grid gap-1.5">
                {RS.mounts.map(x => (
                  <button key={x.id} onClick={() => setMount(x.id)}
                    className={cx("border p-2.5 text-left",
                      mount === x.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                     : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    <div className="disp text-[15px] font-semibold">{x.name}</div>
                    <div className="text-[13px] leading-[1.4] text-[hsl(var(--ink-2))]">{x.note}</div>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Panel">
              <div className="grid gap-1.5">
                {RS.panels.map(x => (
                  <button key={x.id} onClick={() => setPanel(x.id)}
                    className={cx("border p-2.5 text-left",
                      panel === x.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                     : "border-[hsl(var(--rule))] hover:border-[hsl(var(--ink))]")}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="disp text-[15px] font-semibold">{x.name}</span>
                      <span className="text-[13px] text-[hsl(var(--ink-2))]">
                        {x.costSf ? `${usd2(x.costSf)}/SF` : "—"}
                      </span>
                    </div>
                    <div className="text-[13px] leading-[1.4] text-[hsl(var(--ink-2))]">{x.note}</div>
                    {x.thick > 0 && (
                      <div className="mt-1 text-[11px] text-[hsl(var(--ink-3))]">
                        {x.thick.toFixed(4)} in nominal steel
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Shop drawings and sealed calculations">
              <button onClick={() => setDrawings(!drawings)}
                className={cx("flex w-full items-start gap-2.5 border p-2.5 text-left",
                  drawings ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                           : "border-[hsl(var(--rule))]")}>
                <span className={cx("mt-px flex h-5 w-5 shrink-0 items-center justify-center border",
                  drawings ? "border-[hsl(var(--safety))] bg-[hsl(var(--safety))] text-white"
                           : "border-[hsl(var(--rule))]")}>{drawings ? "✓" : ""}</span>
                <span className="text-[13px] leading-[1.45]">{RS.shopDrawings.note}</span>
              </button>
            </Field>
            <Field label={`Markup — ${markup}%`}>
              <input type="range" min={0} max={150} value={markup}
                onChange={e => setMarkup(Number(e.target.value))} className="mt-2 w-full" />
              <div className="mt-1 flex justify-between text-[11px] text-[hsl(var(--ink-3))]">
                <span>cost</span>
                <span>Lee Street ran {Math.round(RS.defaultMarkup * 100)}%</span>
              </div>
            </Field>
          </div>

          {/* the gauge warning, only when it applies */}
          {!p.spec && (
            <Panel className="mt-5 border-l-2 border-l-[hsl(var(--bad))]">
              <Tag tone="warn">Read this before you pick 29 gauge</Tag>
              <p className="mt-2 max-w-[80ch] text-[13px] leading-[1.6]">
                29 ga is {p.thick.toFixed(4)}″ against {RS.panels[0].thick.toFixed(4)}″ for 26 ga —
                roughly a quarter less steel in the part of the assembly with the most wind area
                on the building. It is an agricultural and budget-storage gauge. On this screen
                it saves{" "}
                <strong>{money(Math.round((RS.panels[0].costSf - p.costSf) * faceSf))}</strong>{" "}
                out of a {money(sell)} package — about{" "}
                {Math.round(((RS.panels[0].costSf - p.costSf) * faceSf / Math.max(sell, 1)) * 100)}% —
                and it is the first thing to oil-can, dent and peel back. Sell it where nobody
                specified anything. Do not sell it against a named 7.2 Rib basis of design.
              </p>
            </Panel>
          )}
        </div>

        {/* estimate */}
        <div>
          <Panel className="sticky top-4 card-hi" pad={false}>
            <div className="tape h-1.5" />
            <div className="p-5">
              <Lab className="mb-3">Kit build-up</Lab>
              {rows.map(([a, b, c]) => (
                <div key={a} className="mb-2.5 flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <div className="disp text-[15px] font-semibold">{a}</div>
                    <div className="text-[11px] leading-[1.4] text-[hsl(var(--ink-3))]">{b}</div>
                  </div>
                  <div className="shrink-0 text-[15px]">{money(c)}</div>
                </div>
              ))}
              <Rule className="my-3" />
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="lab">Our cost</span>
                <span className="text-[15px]">{money(totalCost)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="disp text-[18px] font-bold">Sell</div>
                <div className="disp text-[40px] font-bold leading-none text-[hsl(var(--safety))]">
                  {money(sell)}
                </div>
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-[hsl(var(--ink-3))]">
                <span>{money(Math.round(sell / Math.max(lf, 1)))}/LF</span>
                <span>{Math.round(gm * 100)}% GM · {money(sell - totalCost)}</span>
              </div>
              <Btn className="mt-4 w-full">Send the roof plan</Btn>
              <p className="mt-3 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                Budget only. A real number needs the roof plan, the equipment schedule and the
                wind load for the site. We quote in two business days.
              </p>
            </div>
          </Panel>
        </div>
      </div>
      )}

      {/* -------------------------------------------------- the two warnings */}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Panel className="border-l-2 border-l-[hsl(var(--bad))]">
          <Tag tone="warn">A screen base is not a fall-arrest anchor</Tag>
          <p className="mt-2 text-[13px] leading-[1.6]">
            A screen post lands on the deck the same way a roof anchor does, and that is exactly
            why people tie off to them. Do not. OSHA requires a personal fall arrest anchorage to
            hold <strong>5,000 lb per attached worker</strong>, or to be designed and used under a
            qualified person with a safety factor of two —{" "}
            <span className="text-[hsl(var(--safety))]">29 CFR 1926.502(d)(15)</span>. A screen
            post base is sized for wind on a panel, not for arresting a falling body. We sell a
            rated anchor (<span className="mono">MVS-RSA-ANC</span>, ANSI/ASSP Z359.18 Type D) that
            uses the same deck attachment and is certified for the load. Sell that as its own line
            and label it on the drawings.
          </p>
        </Panel>
        <Panel className="border-l-2 border-l-[hsl(var(--safety))]">
          <Tag tone="safety">Read this before you substitute</Tag>
          <p className="mt-2 text-[13px] leading-[1.6]">
            When a spec names <strong>{RS.bod.frame}</strong> and <strong>{RS.bod.panel}</strong> as
            the basis of design, our shop-fabricated frame is an <em>equal</em> and going with it is
            a <strong>formal substitution</strong> — it goes to the architect with our shop drawings
            and sealed calculations, before buyout, not after the steel is cut. That is why the
            drawings are a priced line and not a favor. A silent swap is how a sub ends up pulling a
            screen back off a roof at their own cost.
          </p>
        </Panel>
      </div>
    </div>
  );
}
