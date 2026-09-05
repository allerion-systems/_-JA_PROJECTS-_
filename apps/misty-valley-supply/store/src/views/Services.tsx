import * as React from "react";
import { useAuth } from "@/auth";
import { Btn, Lab, Rule, cx, money } from "@/ui";

/* Design, engineering (through licensed partners), design-build and modular
   design — plus the Contractor Portal: roof measurement reports and per-page
   takeoffs, SRS-style. Engineering wording is deliberate: MVS furnishes sealed
   drawings and calculations THROUGH licensed professional engineers — it does
   not hold itself out as an engineering firm (KRS 322). Do not "tighten" it. */

const REPORT = { res: 36, com: 95, rush: 15 };
const TAKEOFF = { perPage: 18, min: 90 };

const SERVICES = [
  {
    id: "design",
    name: "Drafting Services",
    lead: "Shop drawings, submittal packages and material takeoffs from your plans.",
    body: "Send plans or a napkin sketch; get back dimensioned shop drawings and a "
      + "labeled bill of material that matches the quote line for line. The roof-screen "
      + "drawing set runs $850 with sealed calculations included.",
    cta: "Start a drafting intake",
  },
  {
    id: "engineering",
    name: "Sealed Drawings & Calculations",
    lead: "Drafted by us, sealed by licensed partner engineers.",
    body: "Anchorage, screens, attachments and custom fabrications that need a stamp. "
      + "Our drafters prepare the package; a Kentucky-licensed professional engineer we "
      + "contract reviews, calculates and seals it. One submittal, ready for the architect.",
    cta: "Request a sealed set",
  },
  {
    id: "designbuild",
    name: "Design-Build",
    lead: "One contract from drawings to installed, for screens and site structures.",
    body: "Scope it once. We design it, fabricate it flat in the shop, deliver it labeled "
      + "and set it — one number, one throat to choke. Built on the same configurator "
      + "pricing you can check yourself in the Design Center.",
    cta: "Scope a design-build",
  },
  {
    id: "modular",
    name: "Modular Construction Design",
    lead: "Container offices, guard booths, tiny structures — designed to your use.",
    body: "From a one-trip conex to a wired, insulated ground-level office or a custom "
      + "lash-up. Send sizes, photos and what it has to do; we spec it with an upfitter "
      + "and you get one quoted number, delivered set.",
    cta: "Start a modular intake",
  },
] as const;

type Contact = { name: string; company: string; email: string; phone: string; consent: boolean };
const BLANK_CONTACT: Contact = { name: "", company: "", email: "", phone: "", consent: false };
const contactValid = (c: Contact) =>
  !!c.name.trim() && /.+@.+\..+/.test(c.email) && c.phone.replace(/\D/g, "").length >= 10 && c.consent;

const FIELD = "h-11 w-full border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 text-[15px] outline-none focus:border-[hsl(var(--marine))]";

function saveRequest(kind: string, payload: object): string {
  const id = `${kind}-${Math.floor(1000 + Math.random() * 9000)}`;
  try {
    const key = "mvs-service-requests";
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
    prev.push({ id, ts: Date.now(), ...payload });
    localStorage.setItem(key, JSON.stringify(prev));
  } catch { /* storage unavailable — the confirmation still shows */ }
  return id;
}

function ContactFields({ c, set }: { c: Contact; set: (c: Contact) => void }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5"><Lab>Your name</Lab>
          <input className={FIELD} value={c.name} onChange={e => set({ ...c, name: e.target.value })} /></label>
        <label className="grid gap-1.5"><Lab>Company</Lab>
          <input className={FIELD} value={c.company} onChange={e => set({ ...c, company: e.target.value })} /></label>
        <label className="grid gap-1.5"><Lab>Email</Lab>
          <input className={FIELD} type="email" value={c.email} onChange={e => set({ ...c, email: e.target.value })} /></label>
        <label className="grid gap-1.5"><Lab>Mobile</Lab>
          <input className={FIELD} type="tel" inputMode="tel" value={c.phone} onChange={e => set({ ...c, phone: e.target.value })} /></label>
      </div>
      <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.45]">
        <input type="checkbox" checked={c.consent}
          onChange={e => set({ ...c, consent: e.target.checked })}
          className="mt-0.5 h-[17px] w-[17px] accent-[hsl(var(--marine))]" />
        Text me about this request at the number above.
      </label>
    </>
  );
}

function Confirmation({ id, onDone, line }: { id: string; onDone: () => void; line: string }) {
  return (
    <div>
      <div className="disp text-[22px] font-bold text-[hsl(var(--good))]">Request {id} received</div>
      <p className="mt-2 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">{line}</p>
      <p className="mt-3 text-[11px] text-[hsl(var(--ink-3))]">
        Prototype — email/SMS delivery connects at launch; your request is saved for the counter to call back.
      </p>
      <Btn variant="line" size="sm" className="mt-4" onClick={onDone}>Done</Btn>
    </div>
  );
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}
        className="max-h-[92vh] w-full overflow-y-auto bg-[hsl(var(--panel))] sm:max-w-[560px] sm:rounded-[8px]">
        <div className="flex items-center justify-between border-b border-[hsl(var(--rule))] p-4">
          <h3 className="disp text-[22px] font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Close"
            className="lab inline-flex h-11 min-w-[44px] items-center justify-center px-2 !text-[hsl(var(--ink-2))]">Close ✕</button>
        </div>
        <div className="p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------- roof reports */

function RoofReportDrawer({ onClose }: { onClose: () => void }) {
  const [addr, setAddr] = React.useState("");
  const [kind, setKind] = React.useState<"res" | "com">("res");
  const [rush, setRush] = React.useState(false);
  const [c, setC] = React.useState(BLANK_CONTACT);
  const [sent, setSent] = React.useState<string | null>(null);
  const total = (kind === "res" ? REPORT.res : REPORT.com) + (rush ? REPORT.rush : 0);
  const ok = addr.trim().length > 6 && contactValid(c);

  return (
    <Drawer title="Order a roof report" onClose={onClose}>
      {sent ? <Confirmation id={sent} onDone={onClose}
        line="Your aerial measurement report is in the queue — squares, pitch, edges and penetrations, delivered as a PDF." />
      : (
        <div className="grid gap-3">
          <label className="grid gap-1.5"><Lab>Property address</Lab>
            <input className={FIELD} value={addr} placeholder="123 Job St, Louisville, KY"
              onChange={e => setAddr(e.target.value)} /></label>
          <div className="grid gap-2 sm:grid-cols-2">
            {([["res", "Residential", REPORT.res], ["com", "Commercial", REPORT.com]] as const).map(([k, label, price]) => (
              <button key={k} onClick={() => setKind(k)}
                className={cx("flex h-12 items-center justify-between rounded-[6px] border px-3 text-[14px] font-medium",
                  kind === k ? "border-[hsl(var(--marine))] bg-[hsl(var(--marine-soft))] text-[hsl(var(--marine))]"
                    : "border-[hsl(var(--rule))]")}>
                {label}<span className="disp font-bold">{money(price)}</span>
              </button>
            ))}
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px]">
            <input type="checkbox" checked={rush} onChange={e => setRush(e.target.checked)}
              className="h-[17px] w-[17px] accent-[hsl(var(--marine))]" />
            24-hour rush (+{money(REPORT.rush)})
          </label>
          <ContactFields c={c} set={setC} />
          <div className="flex items-baseline justify-between border-t border-[hsl(var(--rule))] pt-3">
            <span className="lab">Report total</span>
            <span className="disp text-[28px] font-bold">{money(total)}</span>
          </div>
          <Btn disabled={!ok} onClick={() => setSent(saveRequest("RR", { service: "roof-report", addr, kind, rush, total, ...c }))}>
            Order the report
          </Btn>
          <p className="text-[11px] text-[hsl(var(--ink-3))]">Prototype pricing. Fulfilled through an aerial measurement provider; billed on your account at launch.</p>
        </div>
      )}
    </Drawer>
  );
}

/* ---------------------------------------------------------- takeoffs */

function TakeoffDrawer({ onClose }: { onClose: () => void }) {
  const [files, setFiles] = React.useState<{ name: string; size: number }[]>([]);
  const [pages, setPages] = React.useState(6);
  const [trade, setTrade] = React.useState("Framing");
  const [c, setC] = React.useState(BLANK_CONTACT);
  const [sent, setSent] = React.useState<string | null>(null);
  const total = Math.max(TAKEOFF.min, pages * TAKEOFF.perPage);
  const ok = pages > 0 && contactValid(c);

  return (
    <Drawer title="Buy a takeoff" onClose={onClose}>
      {sent ? <Confirmation id={sent} onDone={onClose}
        line="An estimator counts it from your sheets — quantities by system, ready to price, back in 48 hours." />
      : (
        <div className="grid gap-3">
          <label className="grid gap-1.5"><Lab>Upload drawings (PDF or photos)</Lab>
            <input type="file" multiple accept=".pdf,image/*"
              onChange={e => setFiles([...(e.target.files ?? [])].map(f => ({ name: f.name, size: f.size })))}
              className="block w-full text-[13px] file:mr-3 file:h-11 file:cursor-pointer file:rounded-[6px] file:border-0 file:bg-[hsl(var(--marine))] file:px-4 file:font-semibold file:text-white" />
          </label>
          {files.length > 0 && (
            <div className="text-[13px] text-[hsl(var(--ink-2))]">
              {files.map(f => <div key={f.name}>· {f.name} ({Math.round(f.size / 1024)} KB)</div>)}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5"><Lab>Sheets to take off</Lab>
              <input type="number" min={1} max={200} className={FIELD} value={pages}
                onChange={e => setPages(Math.max(1, Number(e.target.value) || 1))} /></label>
            <label className="grid gap-1.5"><Lab>Trade</Lab>
              <select className={FIELD} value={trade} onChange={e => setTrade(e.target.value)}>
                {["Framing", "Roofing", "Siding & Exteriors", "Drywall", "Full package"].map(t =>
                  <option key={t}>{t}</option>)}
              </select></label>
          </div>
          <ContactFields c={c} set={setC} />
          <div className="flex items-baseline justify-between border-t border-[hsl(var(--rule))] pt-3">
            <span className="lab">{money(TAKEOFF.perPage)}/sheet · {money(TAKEOFF.min)} minimum · 48-hr turnaround</span>
            <span className="disp text-[28px] font-bold">{money(total)}</span>
          </div>
          <Btn disabled={!ok} onClick={() => setSent(saveRequest("TK",
            { service: "takeoff", files, pages, trade, total, ...c }))}>
            Send sheets for takeoff
          </Btn>
          <p className="text-[11px] text-[hsl(var(--ink-3))]">Prototype pricing. Files are noted for the estimator; large plan sets can follow by email reply.</p>
        </div>
      )}
    </Drawer>
  );
}

/* --------------------------------------------------------------- page */

export default function Services() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState<string | null>(null);
  const [lead, setLead] = React.useState<Contact & { notes: string }>({ ...BLANK_CONTACT, notes: "" });
  const svc = SERVICES.find(s => s.id === open);
  void user;

  return (
    <div>
      <div className="mb-3 text-[11px] text-[hsl(var(--ink-3))]">Home / <span className="text-[hsl(var(--ink))]">Services</span></div>
      <h1 className="disp mb-1 text-[28px] font-bold leading-none sm:text-[40px]">Contractor Services</h1>
      <p className="mb-6 max-w-[75ch] text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
        The same shop that prices your material can measure it, count it, draft it,
        get it sealed through licensed partners, and put it up.
      </p>

      {/* --------------------------------------------- contractor portal */}
      <section className="card-hi mb-8">
        <div className="tape h-1" />
        <div className="p-5">
          <Lab className="mb-1">Contractor portal</Lab>
          <h2 className="disp text-[22px] font-bold leading-none">Tools priced by the piece</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <div className="disp text-[18px] font-bold">Roof measurement reports</div>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                Aerial measurements for any address — squares, pitch, edge lengths,
                penetrations. Residential {money(REPORT.res)}, commercial from {money(REPORT.com)}.
              </p>
              <Btn size="sm" className="mt-3" onClick={() => setOpen("report")}>Order a report</Btn>
            </div>
            <div className="card p-4">
              <div className="disp text-[18px] font-bold">Takeoffs, {money(TAKEOFF.perPage)} a sheet</div>
              <p className="mt-1.5 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
                Upload the drawings, pick the trade, pay by the page. Quantities by
                system in 48 hours, ready to price — {money(TAKEOFF.min)} minimum.
              </p>
              <Btn size="sm" className="mt-3" onClick={() => setOpen("takeoff")}>Buy a takeoff</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- service cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {SERVICES.map(s => (
          <section key={s.id} className="card-hi flex flex-col">
            <div className="tape h-1" />
            <div className="flex flex-1 flex-col p-5">
              <h2 className="disp text-[22px] font-bold leading-[1.05]">{s.name}</h2>
              <p className="mt-1.5 text-[13px] font-semibold text-[hsl(var(--marine))]">{s.lead}</p>
              <p className="mt-2 flex-1 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">{s.body}</p>
              <Btn size="sm" className="mt-4 self-start"
                onClick={() => { setOpen(s.id); setSent(null); setLead({ ...BLANK_CONTACT, notes: "" }); }}>{s.cta}</Btn>
            </div>
          </section>
        ))}
      </div>

      <Rule className="my-6" />
      <p className="max-w-[85ch] text-[11px] leading-[1.5] text-[hsl(var(--ink-3))]">
        Engineering services are performed by licensed professional engineers under contract
        to Misty Valley Supply. Misty Valley Supply is not an engineering firm; sealed
        documents carry the seal of the responsible licensed engineer.
      </p>

      {open === "report" && <RoofReportDrawer onClose={() => setOpen(null)} />}
      {open === "takeoff" && <TakeoffDrawer onClose={() => setOpen(null)} />}

      {svc && (
        <Drawer title={svc.name} onClose={() => setOpen(null)}>
          {sent ? (
            <Confirmation id={sent} onDone={() => setOpen(null)}
              line="A fabricator reviews it and your quote follows by email and text." />
          ) : (
            <div className="grid gap-3">
              <ContactFields c={lead} set={c => setLead({ ...lead, ...c })} />
              <label className="grid gap-1.5"><Lab>What are we building?</Lab>
                <textarea rows={4} className={cx(FIELD, "h-auto py-2")} value={lead.notes}
                  placeholder="Sizes, the job, dates — anything you have. Plans can come by email reply."
                  onChange={e => setLead({ ...lead, notes: e.target.value })} /></label>
              <Btn disabled={!contactValid(lead)}
                onClick={() => setSent(saveRequest("S", { service: open, ...lead }))}>Send the request</Btn>
            </div>
          )}
        </Drawer>
      )}
    </div>
  );
}
