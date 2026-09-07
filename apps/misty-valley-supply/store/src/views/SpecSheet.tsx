import * as React from "react";
import { useAuth } from "@/auth";
import { Btn, cx, money } from "@/ui";

/* ------------------------------------------------------------------------
   SpecSheet — the printable one-page document behind the "Spec sheet"
   button on every Design Center tool. One clean letter-size sheet: the
   MVS wordmark, the design's name/tool/date, the human-readable parameter
   list, a snapshot of the 3D scene, the bill of material, and the
   disclosures block.

   PRICING GATE (same rule as PriceBar/BomTable, never relaxed here):
   guests get the sheet WITHOUT prices — SKU, description, qty and unit
   only, with the standard "Sign in to view estimate" affordance. Signed-in
   accounts see catalog list unit prices, extensions and the subtotal.
   The Modular Projects tool has NO retail price by design — its sheet
   carries the planning range + design-build intake language instead
   (the `program` prop) and never a retail total.

   This file is its own lazy chunk (SpecButton in Shed.tsx loads it on
   first open) and deliberately imports no designer or three.js modules.
   ---------------------------------------------------------------------- */

/** Ask the app shell to open the sign-in modal. Duplicated locally on
    purpose (the Screen.tsx pattern) so this chunk stays independent. */
const requestSignIn = () => window.dispatchEvent(new CustomEvent("mvs-signin"));

export type SpecLine = {
  sku?: string;
  name: string;
  qty: number;
  unit: string;
  /** Catalog LIST pricing — omitted where line economics are internal
      (roof screens quote as one system, never by the line). */
  unitPrice?: number;
  ext?: number;
};

export type SpecProgram = {
  gsf: number;
  modules: number;
  craneWeeks: number;
  rangeLow: number;
  rangeHigh: number;
  perGsf: readonly [number, number];
};

const fmtM = (n: number) => `$${(n / 1e6).toFixed(2)}M`;

/* Print: hide everything under body except the sheet subtree (visibility,
   not display, so layout holds), then pin the sheet to the top of the
   paper. Letter portrait, white ground, dark ink — no dark backgrounds. */
const PRINT_CSS = `
@media print {
  body { overflow: visible !important; }
  body * { visibility: hidden !important; }
  #mvs-spec-sheet, #mvs-spec-sheet * { visibility: visible !important; }
  .mvs-spec-overlay { position: static !important; overflow: visible !important;
    padding: 0 !important; background: none !important; }
  #mvs-spec-sheet { position: absolute !important; left: 0 !important; top: 0 !important;
    width: 100% !important; max-width: none !important; margin: 0 !important;
    border-radius: 0 !important; box-shadow: none !important;
    background: #fff !important; color: #131722 !important; }
  #mvs-spec-sheet .no-print { display: none !important; }
}
@page { size: letter; margin: 12mm; }
`;

const thCls = "border-b-2 border-[#131722] pb-1.5 text-left text-[11px] font-semibold text-[#5b6270]";
const tdCls = "border-b border-[#efede7] py-1.5 pr-3 align-top text-[12px]";

export default function SpecSheet({
  toolLabel, designName, paramRows, lines, total, totalLabel, program, building, snapshot, onClose,
}: {
  toolLabel: string;
  designName: string;
  /** Human-readable [label, value] pairs — already formatted by the tool. */
  paramRows: readonly (readonly [string, string])[];
  lines?: SpecLine[];
  total?: number;
  /** Signed-in subtotal label; defaults to the BomTable wording. */
  totalLabel?: string;
  /** Modular Projects only — planning ranges in place of any retail total. */
  program?: SpecProgram;
  /** Building tools carry the structure-not-dwelling disclosure. */
  building?: boolean;
  /** canvas.toDataURL() of the visible 3D scene, captured at open. */
  snapshot?: string | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  // Same gate as PriceBar: the estimate exists behind sign-in, full stop.
  const priced = !!user && !!lines?.some(l => typeof l.unitPrice === "number");

  React.useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = prev; };
  }, [onClose]);

  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="mvs-spec-overlay fixed inset-0 z-50 overflow-y-auto bg-black/45 p-3 sm:p-6"
      role="dialog" aria-modal="true" aria-label="Design spec sheet" onClick={onClose}>
      <style>{PRINT_CSS}</style>
      <div id="mvs-spec-sheet" onClick={e => e.stopPropagation()}
        className="mx-auto my-2 max-w-[820px] rounded-[8px] bg-white p-5 text-[#131722] shadow-[0_18px_50px_-12px_rgb(0_0_0/0.5)] sm:my-6 sm:p-10">

        {/* actions — never printed */}
        <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-2">
          <Btn size="sm" onClick={() => window.print()}>Print / Save PDF</Btn>
          <Btn variant="line" size="sm" onClick={onClose}>Close</Btn>
        </div>

        {/* wordmark header */}
        <div className="border-b-[3px] border-[hsl(var(--marine))] pb-3">
          <div className="disp text-[21px] font-bold leading-[1.05] sm:text-[24px]">
            <span className="text-[hsl(var(--marine))]">Misty Valley Supply</span>
            <span className="text-[#5b6270]"> — Design Spec Sheet</span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <span className="text-[16px] font-semibold">{designName}</span>
            <span className="num text-[12px] text-[#5b6270]">{toolLabel} · {date}</span>
          </div>
        </div>

        {/* configuration + snapshot */}
        <div className={cx("mt-5 grid gap-6", snapshot && "sm:grid-cols-[minmax(0,1fr)_280px]")}>
          <div>
            <div className="eyebrow mb-2 text-[#5b6270]">Configuration</div>
            {paramRows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-[#efede7] py-1.5 text-[13px]">
                <span className="shrink-0 text-[#5b6270]">{k}</span>
                <span className="text-right font-semibold">{v}</span>
              </div>
            ))}
          </div>
          {snapshot && (
            <div>
              <div className="eyebrow mb-2 text-[#5b6270]">3D model</div>
              <img src={snapshot} alt="3D snapshot of this design"
                className="w-full rounded-[6px] border border-[#e4e2db] bg-[#f6f5f1]" />
              <p className="mt-1.5 text-[11px] text-[#8a8f99]">
                As designed — the sheet and the model derive from the same parameters.
              </p>
            </div>
          )}
        </div>

        {/* bill of material — priced columns behind sign-in */}
        {lines && lines.length > 0 && (
          <div className="mt-6">
            <div className="eyebrow mb-2 text-[#5b6270]">Bill of material — {lines.length} lines</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] border-collapse">
                <thead>
                  <tr>
                    <th className={thCls}>SKU</th>
                    <th className={thCls}>Description</th>
                    <th className={cx(thCls, "text-right")}>Qty</th>
                    <th className={thCls}>Unit</th>
                    {priced && <th className={cx(thCls, "text-right")}>Unit price</th>}
                    {priced && <th className={cx(thCls, "text-right")}>Extended</th>}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, i) => (
                    <tr key={i}>
                      <td className={cx(tdCls, "mono whitespace-nowrap text-[11px] text-[#5b6270]")}>{l.sku ?? "—"}</td>
                      <td className={tdCls}>{l.name}</td>
                      <td className={cx(tdCls, "num text-right font-semibold")}>{l.qty.toLocaleString("en-US")}</td>
                      <td className={cx(tdCls, "text-[11px] text-[#5b6270]")}>{l.unit}</td>
                      {priced && (
                        <td data-price className={cx(tdCls, "num text-right")}>
                          {typeof l.unitPrice === "number" ? money(l.unitPrice) : "—"}
                        </td>
                      )}
                      {priced && (
                        <td data-price className={cx(tdCls, "num text-right")}>
                          {typeof l.ext === "number" ? money(l.ext) : "—"}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                {typeof total === "number" && (
                  <tfoot>
                    <tr>
                      <td colSpan={priced ? 5 : 3} className="py-2.5 pr-3 text-right text-[13px] font-semibold">
                        {user ? (totalLabel ?? "Your price — materials") : "Materials estimate"}
                      </td>
                      <td className="num py-2.5 text-right text-[15px] font-bold">
                        {user ? (
                          <span data-price>{money(total)}</span>
                        ) : (
                          <button onClick={requestSignIn}
                            className="whitespace-nowrap font-semibold text-[hsl(var(--marine))] underline">
                            Sign in to view
                          </button>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Modular Projects — planning ranges only, never a retail total */}
        {program && (
          <div className="mt-6">
            <div className="eyebrow mb-2 text-[#5b6270]">Program</div>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["Gross area", `${program.gsf.toLocaleString("en-US")} sf`],
                ["Modules (14×62)", String(program.modules)],
                ["Crane-set", `≈ ${program.craneWeeks} wk`],
              ] as const).map(([k, v]) => (
                <div key={k} className="rounded-[6px] border border-[#e4e2db] px-3 py-2.5">
                  <div className="text-[11px] font-medium text-[#5b6270]">{k}</div>
                  <div className="num mt-0.5 text-[16px] font-bold">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-[6px] border border-[hsl(var(--marine))]/25 px-3.5 py-3">
              <div className="text-[13px] font-semibold text-[hsl(var(--marine))]">
                Planning range: {fmtM(program.rangeLow)} – {fmtM(program.rangeHigh)}
                <span className="num ml-2 font-medium text-[#5b6270]">
                  (${program.perGsf[0]}–${program.perGsf[1]} / GSF band)
                </span>
              </div>
              <p className="mt-1 text-[12px] leading-[1.55] text-[#454b57]">
                A planning range, not a quote — modular projects carry no retail price. Your number
                comes from design-build: send this program to intake and a person scopes the site,
                the schedule and the real figure with you.
              </p>
            </div>
          </div>
        )}

        {/* disclosures */}
        <div data-disclosures
          className="mt-7 border-t border-[#d9d6cd] pt-3 text-[11px] leading-[1.7] text-[#5b6270]">
          <p>
            Prices are catalog list prices. Estimate only — final quote at order confirmation.
          </p>
          <p>
            Permit drawing package $450 / Sealed drawings &amp; calculations $1,400 — drafted by us,
            sealed by licensed partner engineers.
          </p>
          {building && (
            <p className="font-medium text-[#454b57]">
              Arrives as a structure, not a certified dwelling — habitable use is the county permit path.
            </p>
          )}
          <p className="mt-1.5 text-[#8a8f99]">
            Misty Valley Supply · Bonnieville, Kentucky · prototype — placeholder pricing; standards cited are real.
          </p>
        </div>
      </div>
    </div>
  );
}
