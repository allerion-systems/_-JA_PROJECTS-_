import * as React from "react";
import { Btn, Lab, Panel, Rule, Tag, cx, money } from "@/ui";
import { DIRECTORY, hasPerm, roleById, type Perm, type Person, type Role } from "@/rbac";

/* -------------------------------------------------------------- branches */

export type Branch = { id: string; name: string; city: string; miles: number; hours: string; phone: string };

export const BRANCHES: Branch[] = [
  { id: "BON", name: "Bonnieville", city: "Bonnieville, KY", miles: 0, hours: "6:00a–4:30p", phone: "(270) 555-0142" },
  { id: "EZT", name: "Elizabethtown", city: "Elizabethtown, KY", miles: 27, hours: "6:00a–4:30p", phone: "(270) 555-0188" },
  { id: "BWG", name: "Bowling Green", city: "Bowling Green, KY", miles: 42, hours: "6:30a–4:00p", phone: "(270) 555-0203" },
  { id: "LOU", name: "Louisville South", city: "Louisville, KY", miles: 71, hours: "6:00a–5:00p", phone: "(502) 555-0119" },
  { id: "NSH", name: "Nashville North", city: "Goodlettsville, TN", miles: 88, hours: "6:00a–4:30p", phone: "(615) 555-0177" },
];

/* ------------------------------------------------------------------ user */

export type Account = {
  name: string;
  company: string;
  acct: string;
  terms: string;
  discountPct: number;      // contract discount off list
  creditLimit: number;
  creditUsed: number;
  shipTos: { id: string; label: string; addr: string }[];
  users: { name: string; role: string }[];
};

export const DEMO: Account = {
  name: "Joey Allee",
  company: "R&B Roofing",
  acct: "MV-40118",
  terms: "Net 30",
  discountPct: 18,
  creditLimit: 75000,
  creditUsed: 23760,
  shipTos: [
    { id: "s1", label: "Lee Street — jobsite", addr: "412 Lee St, Elizabethtown, KY" },
    { id: "s2", label: "TRH Clarksville — jobsite", addr: "1890 Greentree N, Clarksville, IN" },
    { id: "s3", label: "Shop", addr: "77 Industrial Dr, Bonnieville, KY" },
  ],
  users: [
    { name: "Joey Allee", role: "Buyer — can place orders" },
    { name: "Ben Easterday", role: "Admin — can approve credit" },
    { name: "Field — Lee Street", role: "Requester — quote only" },
  ],
};

/* ----------------------------------------------------------------- state */

type Ctx = {
  user: Account | null;
  person: Person | null;
  role: Role | null;
  can: (p: Perm) => boolean;
  branch: Branch;
  setBranch: (b: Branch) => void;
  signIn: () => void;
  signInAs: (personId: string) => void;
  signOut: () => void;
  net: (list: number) => number;
};

const AuthCtx = React.createContext<Ctx | null>(null);
export const useAuth = () => {
  const c = React.useContext(AuthCtx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
};

/** The demo customer account attaches to anyone signing in on the customer side. */
const accountFor = (p: Person): Account =>
  p.company === "R&B Roofing" ? { ...DEMO, name: p.name }
  : { ...DEMO, name: p.name, company: p.company, acct: `MV-${40000 + Number(p.id.slice(2))}` };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [person, setPerson] = React.useState<Person | null>(null);
  const [branch, setBranch] = React.useState<Branch>(BRANCHES[0]);

  const role = person ? roleById(person.roleId) : null;
  const user = person ? accountFor(person) : null;
  const can = (p: Perm) => (role ? hasPerm(role, p) : false);

  const signInAs = (id: string) => {
    const found = DIRECTORY.find(d => d.id === id);
    if (!found) return;
    setPerson(found);
    const b = BRANCHES.find(x => x.id === found.branch);
    if (b) setBranch(b);
  };

  const value: Ctx = {
    user, person, role, can, branch, setBranch,
    signIn: () => signInAs("u-011"),
    signInAs,
    signOut: () => setPerson(null),
    net: (list) => (can("price.contract") && user)
      ? Math.round(list * (1 - user.discountPct / 100) * 100) / 100
      : list,
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/* ---------------------------------------------------------------- modals */

export type Modal = null | "signin" | "register" | "credit" | "branch";

function Shell({
  title, sub, onClose, children, wide,
}: { title: string; sub?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  React.useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}
        className={cx("max-h-[92vh] w-full overflow-y-auto border-t-2 border-[hsl(var(--safety))] bg-[hsl(var(--ground))] sm:border-2",
          wide ? "sm:max-w-[720px]" : "sm:max-w-[440px]")}>
        <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--ink))] p-4">
          <div>
            <h3 className="disp text-[22px] font-bold leading-none">{title}</h3>
            {sub && <p className="mt-1.5 text-[13px] text-[hsl(var(--ink-2))]">{sub}</p>}
          </div>
          <button onClick={onClose} aria-label={`Close ${title.toLowerCase()} dialog`}
            className="lab inline-flex h-11 min-w-[44px] shrink-0 items-center justify-center px-2 !text-[hsl(var(--ink-2))]">Close ✕</button>
        </div>
        <div className="p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

const field = "h-11 w-full border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 text-[15px] outline-none focus:border-[hsl(var(--safety))]";

/* The demo role list, folded behind one small link so the customer sign-in
   stays clean. */
function StaffDoor({ onPick }: { onPick: (id: string) => void }) {
  const [open, setOpen] = React.useState(false);
  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="mt-2 text-[11px] text-[hsl(var(--ink-3))] underline underline-offset-2">
      Staff sign-in
    </button>
  );
  return (
    <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
      {DIRECTORY.filter(d => d.status === "Active")
        .filter((d, i, all) => all.findIndex(x => x.roleId === d.roleId) === i)
        .map(d => {
          const r = roleById(d.roleId);
          return (
            <button key={d.roleId} onClick={() => onPick(d.id)}
              className="min-h-[44px] border border-[hsl(var(--rule))] px-2.5 text-left text-[14px] font-semibold hover:border-[hsl(var(--marine))]">
              {r.name}
            </button>
          );
        })}
    </div>
  );
}

export function AuthModals({ modal, setModal }: { modal: Modal; setModal: (m: Modal) => void }) {
  const { signIn, signInAs, branch, setBranch } = useAuth();
  const [step, setStep] = React.useState(1);
  const [authStep, setAuthStep] = React.useState<"choose" | "in" | "up">("choose");
  const [moreApps, setMoreApps] = React.useState(false);

  React.useEffect(() => { setStep(1); setAuthStep("choose"); }, [modal]);
  if (!modal) return null;
  const close = () => setModal(null);

  if (modal === "signin" && authStep === "choose") return (
    <Shell title="Welcome" onClose={close}>
      <div className="grid gap-2.5">
        <Btn className="w-full" onClick={() => setAuthStep("in")}>Sign in</Btn>
        <Btn variant="line" className="w-full" onClick={() => setAuthStep("up")}>Sign up</Btn>
      </div>
      <StaffDoor onPick={id => { signInAs(id); close(); }} />
    </Shell>
  );

  if (modal === "signin" && authStep === "up") return (
    <Shell title="Sign up" onClose={close}>
      <div className="grid gap-2.5">
        <button onClick={() => setModal("register")}
          className="card lift p-4 text-left">
          <div className="disp text-[18px] font-bold">Cash &amp; card account</div>
          <div className="mt-1 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
            Buy today, pay by card. Your price, saved lists, order history.
          </div>
        </button>
        <button onClick={() => setModal("credit")}
          className="card lift p-4 text-left">
          <div className="disp text-[18px] font-bold">Credit account — Net 30</div>
          <div className="mt-1 text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
            A guided application; decision in two business days.
          </div>
        </button>
        <button onClick={() => setMoreApps(!moreApps)}
          className="card lift p-4 text-left">
          <div className="disp text-[18px] font-bold">Other applications {moreApps ? "▾" : "▸"}</div>
          {moreApps && (
            <div className="mt-2 grid gap-2">
              {["Government & institutional purchasing", "Tax-exempt setup", "Builder & national programs"].map(a => (
                <div key={a} className="border-t border-[hsl(var(--rule))] pt-2 text-[13px]">
                  <div className="font-semibold">{a}</div>
                  <div className="text-[hsl(var(--ink-2))]">Call {BRANCHES[0].phone} — the application goes out same day.</div>
                </div>
              ))}
            </div>
          )}
        </button>
      </div>
      <button onClick={() => setAuthStep("choose")}
        className="mt-3 text-[13px] font-medium text-[hsl(var(--marine))] underline underline-offset-2">← Back</button>
    </Shell>
  );

  if (modal === "signin") return (
    <Shell wide title="Sign in" onClose={close}>
      {/* social sign-in first \u2014 one tap on a phone at the counter */}
      <div className="grid gap-2 sm:grid-cols-2">
        <button onClick={() => { signIn(); close(); }}
          className="flex h-11 items-center justify-center gap-2.5 rounded-[6px] border border-[hsl(var(--rule))] bg-white text-[15px] font-medium text-[hsl(var(--ink))] hover:border-[hsl(var(--ink-3))]">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
            <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.81z" />
            <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.86-3c-1.07.72-2.44 1.14-4.08 1.14-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.29a12 12 0 0 0 0 10.74l3.98-3.1z" />
            <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.63l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77z" />
          </svg>
          Continue with Google
        </button>
        <button onClick={() => { signIn(); close(); }}
          className="flex h-11 items-center justify-center gap-2.5 rounded-[6px] bg-black text-[15px] font-medium text-white hover:bg-[#1a1a1a]">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
            <path d="M17.05 12.54c-.03-2.9 2.37-4.29 2.48-4.36-1.35-1.97-3.45-2.24-4.2-2.27-1.78-.18-3.48 1.05-4.39 1.05-.9 0-2.3-1.03-3.79-1-1.95.03-3.75 1.13-4.75 2.88-2.03 3.52-.52 8.72 1.46 11.57.97 1.4 2.12 2.96 3.63 2.9 1.46-.06 2.01-.94 3.77-.94s2.26.94 3.8.91c1.57-.03 2.57-1.42 3.53-2.83 1.11-1.62 1.57-3.19 1.6-3.27-.04-.02-3.07-1.18-3.14-4.64zM14.16 4.03c.8-.97 1.34-2.32 1.19-3.66-1.15.05-2.55.77-3.38 1.74-.74.86-1.39 2.23-1.22 3.55 1.29.1 2.6-.65 3.41-1.63z" />
          </svg>
          Continue with Apple
        </button>
      </div>
      <p className="mt-1.5 text-[11px] leading-[1.4] text-[hsl(var(--ink-3))]">
        Prototype — social buttons sign you into the demo buyer account.
      </p>

      <div className="my-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-[hsl(var(--rule))]" />
        <span className="lab">or with email</span>
        <span className="h-px flex-1 bg-[hsl(var(--rule))]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5"><Lab>Email</Lab>
          <input className={field} defaultValue="joey@rbroofing.com" /></label>
        <label className="grid gap-1.5"><Lab>Password</Lab>
          <input className={field} type="password" defaultValue="\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7" /></label>
      </div>
      <Btn className="mt-3 w-full" onClick={() => { signIn(); close(); }}>Sign in</Btn>
      <button onClick={() => setAuthStep("choose")}
        className="mt-3 text-[13px] font-medium text-[hsl(var(--marine))] underline underline-offset-2">← Back</button>
    </Shell>
  );

  if (modal === "register") return (
    <Shell title="Create an account" sub="Free. Unlocks your price, saved lists and order history." onClose={close}>
      <div className="grid gap-3">
        {[["Full name", "Joey Allee"], ["Work email", "joey@rbroofing.com"],
          ["Company", "R&B Roofing"], ["Mobile", "(270) 555-0000"]].map(([l, ph]) => (
          <label key={l} className="grid gap-1.5"><Lab>{l}</Lab>
            <input className={field} placeholder={ph} /></label>
        ))}
        <label className="grid gap-1.5"><Lab>Trade</Lab>
          <select className={field}>
            {["Roofing", "Framing / drywall", "General contractor", "Mechanical", "Other"].map(t => <option key={t}>{t}</option>)}
          </select>
        </label>
        <Btn className="mt-1 w-full" onClick={() => { signIn(); close(); }}>Create account</Btn>
        <p className="text-[13px] leading-[1.5] text-[hsl(var(--ink-3))]">
          A web account does not extend credit — that is the separate application.
        </p>
      </div>
    </Shell>
  );

  if (modal === "credit") return (
    <Shell wide title="Open a credit account" sub={`Step ${step} of 3 · buy on terms instead of a card`} onClose={close}>
      <div className="mb-4 flex gap-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={cx("h-1.5 flex-1", i <= step ? "bg-[hsl(var(--safety))]" : "bg-[hsl(var(--panel-2))]")} />
        ))}
      </div>

      {step === 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[["Legal business name", "R&B Roofing LLC"], ["DBA", "—"],
            ["Federal tax ID (EIN)", "XX-XXXXXXX"], ["Years in business", "10"],
            ["Billing address", "Street"], ["City, state, ZIP", "Elizabethtown, KY"]].map(([l, ph]) => (
            <label key={l} className="grid gap-1.5"><Lab>{l}</Lab>
              <input className={field} placeholder={ph} /></label>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-3">
          <Lab>Trade references — three, please</Lab>
          {[1, 2, 3].map(i => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_140px]">
              <input className={field} placeholder={`Supplier ${i}`} />
              <input className={field} placeholder="Contact / email" />
              <input className={field} placeholder="High credit" />
            </div>
          ))}
          <label className="grid gap-1.5"><Lab>Requested credit limit</Lab>
            <input className={field} placeholder="$75,000" /></label>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-3">
          <Panel className="border-l-2 border-l-[hsl(var(--safety))]">
            <Lab kicker className="mb-2 !text-[hsl(var(--safety-2))]">Read this part</Lab>
            <p className="text-[13px] leading-[1.55]">
              A personal guarantee makes you personally liable for the account if the company
              does not pay. It is standard, it is negotiable, and{" "}
              <strong>the household that signs it should know the number before it is signed.</strong>
            </p>
          </Panel>
          <label className="flex min-h-[44px] items-start gap-2.5 py-1.5 text-[13px]">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(var(--safety))]" />
            <span>I authorise Misty Valley Supply to obtain credit reports and contact the references above.</span>
          </label>
          <label className="flex min-h-[44px] items-start gap-2.5 py-1.5 text-[13px]">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(var(--safety))]" />
            <span>I agree to the personal guarantee and terms of sale.</span>
          </label>
          <label className="grid gap-1.5"><Lab>Signature</Lab>
            <input className={cx(field, "disp text-[18px]")} placeholder="Type your full name" /></label>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        {step > 1 && <Btn variant="line" onClick={() => setStep(step - 1)}>Back</Btn>}
        <Btn className="flex-1" onClick={() => step < 3 ? setStep(step + 1) : (signIn(), close())}>
          {step < 3 ? "Continue" : "Submit application"}
        </Btn>
      </div>
      <p className="mt-3 text-[13px] text-[hsl(var(--ink-3))]">
        Most applications are decided in two business days. You can buy by card in the meantime.
      </p>
    </Shell>
  );

  if (modal === "branch") return (
    <Shell title="Choose your branch" sub="Your branch sets availability, cut-off time and delivery days." onClose={close}>
      <div className="grid gap-1.5">
        {BRANCHES.map(b => (
          <button key={b.id} onClick={() => { setBranch(b); close(); }}
            aria-label={`Choose the ${b.name} branch, ${b.city}${branch.id === b.id ? " (current branch)" : ""}`}
            className={cx("flex min-h-[44px] items-start justify-between gap-3 border p-3 text-left",
              branch.id === b.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                 : "border-[hsl(var(--rule))]")}>
            <div>
              <div className="disp text-[18px] font-semibold leading-none">{b.name}</div>
              <div className="mt-1 text-[11px] text-[hsl(var(--ink-3))]">{b.city} · {b.hours}</div>
              <div className="text-[11px] text-[hsl(var(--ink-3))]">{b.phone}</div>
            </div>
            <div className="shrink-0 text-[13px] text-[hsl(var(--ink-2))]">
              {b.miles === 0 ? "here" : `${b.miles} mi`}
            </div>
          </button>
        ))}
      </div>
    </Shell>
  );

  return null;
}

/* ------------------------------------------------------- price component */

export function Price({
  list, uom, onSignIn, size = "md",
}: { list: number; uom: string; onSignIn: () => void; size?: "sm" | "md" }) {
  const { user, net, can } = useAuth();
  const yours = net(list);
  const big = size === "md" ? "text-[28px]" : "text-[22px]";

  if (!user || !can("price.contract")) return (
    <div>
      <div className={cx("num font-bold leading-none text-[hsl(var(--ink))]", big)}>{money(list)}</div>
      <div className="mt-1 text-[13px] text-[hsl(var(--ink-2))]">List price · per {uom}</div>
      <button onClick={onSignIn}
        className="lab mt-1.5 inline-flex min-h-[44px] items-center text-left font-semibold !text-[hsl(var(--safety-2))] underline">
        {user ? "Ask your admin for pricing" : "Sign in for your price"}
      </button>
    </div>
  );

  return (
    <div>
      <div className={cx("num font-bold leading-none text-[hsl(var(--ink))]", big)}>{money(yours)}</div>
      <div className="mt-1 text-[13px] text-[hsl(var(--ink-2))]">Your price · per {uom}</div>
      <div className="mt-1.5 text-[13px] font-medium text-[hsl(var(--good))]">
        Save {money(Math.round((list - yours) * 100) / 100)}
        <span className="ml-1 font-normal text-[hsl(var(--ink-3))] line-through">{money(list)}</span>
      </div>
    </div>
  );
}
