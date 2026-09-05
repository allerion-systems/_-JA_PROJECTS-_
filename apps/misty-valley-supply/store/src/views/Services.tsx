import * as React from "react";
import { useAuth } from "@/auth";
import { Btn, Lab, Rule, cx } from "@/ui";

/* Design, engineering (through licensed partners), design-build and modular
   design. Engineering wording is deliberate: MVS furnishes sealed drawings and
   calculations THROUGH licensed professional engineers — it does not hold
   itself out as an engineering firm (KRS 322). Do not "tighten" that copy. */

const SERVICES = [
  {
    id: "design",
    name: "Design & Drafting",
    lead: "Shop drawings, submittal packages and material takeoffs from your plans.",
    body: "Send plans or a napkin sketch; get back dimensioned shop drawings and a "
      + "labeled bill of material that matches the quote line for line. The roof-screen "
      + "drawing set runs $850 with sealed calculations included.",
    cta: "Start a design intake",
  },
  {
    id: "engineering",
    name: "Engineering — sealed by licensed partners",
    lead: "Sealed drawings and calculations by a licensed professional engineer.",
    body: "Anchorage, screens, attachments and custom fabrications that need a stamp. "
      + "We prepare the package; a Kentucky-licensed professional engineer we contract "
      + "reviews, calculates and seals it. You get one submittal, ready for the architect.",
    cta: "Request sealed engineering",
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

type Lead = { name: string; company: string; email: string; phone: string; notes: string; consent: boolean };
const BLANK: Lead = { name: "", company: "", email: "", phone: "", notes: "", consent: false };

export default function Services() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState<string | null>(null);
  const [lead, setLead] = React.useState<Lead>(BLANK);
  const svc = SERVICES.find(s => s.id === open);

  const valid = lead.name.trim() && /.+@.+\..+/.test(lead.email)
    && lead.phone.replace(/\D/g, "").length >= 10 && lead.consent;

  const submit = () => {
    const id = `S-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const key = "mvs-service-requests";
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
      prev.push({ id, ts: Date.now(), service: open, user: user?.company ?? null, ...lead });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch { /* storage unavailable — the confirmation still shows */ }
    setSent(id);
  };

  return (
    <div>
      <div className="mb-3 text-[11px] text-[hsl(var(--ink-3))]">Home / <span className="text-[hsl(var(--ink))]">Services</span></div>
      <h1 className="disp mb-1 text-[28px] font-bold leading-none sm:text-[40px]">Design &amp; Build Services</h1>
      <p className="mb-6 max-w-[75ch] text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
        The same shop that prices your material can draw it, engineer it through licensed
        partners, and put it up. Every service quotes from the same numbers the store shows you.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {SERVICES.map(s => (
          <section key={s.id} className="card-hi flex flex-col">
            <div className="tape h-1" />
            <div className="flex flex-1 flex-col p-5">
              <h2 className="disp text-[22px] font-bold leading-[1.05]">{s.name}</h2>
              <p className="mt-1.5 text-[13px] font-semibold text-[hsl(var(--marine))]">{s.lead}</p>
              <p className="mt-2 flex-1 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">{s.body}</p>
              <Btn size="sm" className="mt-4 self-start"
                onClick={() => { setOpen(s.id); setSent(null); setLead(BLANK); }}>{s.cta}</Btn>
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

      {/* -------------------------------------------------- intake drawer */}
      {svc && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setOpen(null)}>
          <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={svc.name}
            className="max-h-[92vh] w-full overflow-y-auto bg-[hsl(var(--panel))] sm:max-w-[560px] sm:rounded-[8px]">
            <div className="flex items-center justify-between border-b border-[hsl(var(--rule))] p-4">
              <h3 className="disp text-[22px] font-bold">{svc.name}</h3>
              <button onClick={() => setOpen(null)} aria-label="Close intake"
                className="lab inline-flex h-11 min-w-[44px] items-center justify-center px-2 !text-[hsl(var(--ink-2))]">Close ✕</button>
            </div>
            <div className="p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
              {sent ? (
                <div>
                  <div className="disp text-[22px] font-bold text-[hsl(var(--good))]">Request {sent} received</div>
                  <p className="mt-2 text-[13px] leading-[1.55] text-[hsl(var(--ink-2))]">
                    A fabricator reviews it and your quote follows by email and text.
                  </p>
                  <p className="mt-3 text-[11px] text-[hsl(var(--ink-3))]">
                    Prototype — email/SMS delivery connects at launch; your request is saved for the counter to call back.
                  </p>
                  <Btn variant="line" size="sm" className="mt-4" onClick={() => setOpen(null)}>Done</Btn>
                </div>
              ) : (
                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5"><Lab>Your name</Lab>
                      <input className={FIELD} value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} /></label>
                    <label className="grid gap-1.5"><Lab>Company</Lab>
                      <input className={FIELD} value={lead.company} onChange={e => setLead({ ...lead, company: e.target.value })} /></label>
                    <label className="grid gap-1.5"><Lab>Email</Lab>
                      <input className={FIELD} type="email" value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} /></label>
                    <label className="grid gap-1.5"><Lab>Mobile</Lab>
                      <input className={FIELD} type="tel" inputMode="tel" value={lead.phone} onChange={e => setLead({ ...lead, phone: e.target.value })} /></label>
                  </div>
                  <label className="grid gap-1.5"><Lab>What are we building?</Lab>
                    <textarea rows={4} className={cx(FIELD, "h-auto py-2")} value={lead.notes}
                      placeholder="Sizes, the job, dates — anything you have. Plans can come by email reply."
                      onChange={e => setLead({ ...lead, notes: e.target.value })} /></label>
                  <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-[1.45]">
                    <input type="checkbox" checked={lead.consent}
                      onChange={e => setLead({ ...lead, consent: e.target.checked })}
                      className="mt-0.5 h-[17px] w-[17px] accent-[hsl(var(--marine))]" />
                    Text me about this request at the number above.
                  </label>
                  <Btn disabled={!valid} onClick={submit}>Send the request</Btn>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FIELD = "h-11 w-full border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 text-[15px] outline-none focus:border-[hsl(var(--marine))]";
