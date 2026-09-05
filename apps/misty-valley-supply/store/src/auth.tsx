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
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className={cx("max-h-[92vh] w-full overflow-y-auto border-t-2 border-[hsl(var(--safety))] bg-[hsl(var(--ground))] sm:border-2",
          wide ? "sm:max-w-[720px]" : "sm:max-w-[440px]")}>
        <div className="flex items-start justify-between gap-4 border-b border-[hsl(var(--ink))] p-4">
          <div>
            <h3 className="disp text-[24px] font-bold leading-none">{title}</h3>
            {sub && <p className="mt-1.5 text-[13px] text-[hsl(var(--ink-2))]">{sub}</p>}
          </div>
          <button onClick={onClose} className="lab h-10 shrink-0 px-2 text-[hsl(var(--ink-2))]">Close ✕</button>
        </div>
        <div className="p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

const field = "h-11 w-full border border-[hsl(var(--rule))] bg-[hsl(var(--panel))] px-3 text-[14px] outline-none focus:border-[hsl(var(--safety))]";

export function AuthModals({ modal, setModal }: { modal: Modal; setModal: (m: Modal) => void }) {
  const { signIn, signInAs, branch, setBranch } = useAuth();
  const [step, setStep] = React.useState(1);

  React.useEffect(() => { setStep(1); }, [modal]);
  if (!modal) return null;
  const close = () => setModal(null);

  if (modal === "signin") return (
    <Shell wide title="Sign in" sub="Different jobs see different screens. Pick who you are." onClose={close}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5"><Lab>Email</Lab>
          <input className={field} defaultValue="joey@rbroofing.com" /></label>
        <label className="grid gap-1.5"><Lab>Password</Lab>
          <input className={field} type="password" defaultValue="\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7\u00b7" /></label>
      </div>
      <Btn className="mt-3 w-full" onClick={() => { signIn(); close(); }}>Sign in</Btn>

      <Rule className="my-4" />
      <Lab className="mb-2">Or step into a role — this is a working prototype</Lab>
      {(["internal", "customer", "marketplace"] as const).map(side => (
        <div key={side} className="mb-3">
          <div className="mono mb-1.5 text-[10.5px] uppercase tracking-[0.14em] text-[hsl(var(--ink-3))]">
            {side === "internal" ? "Misty Valley staff"
              : side === "customer" ? "Contractor side" : "Marketplace"}
          </div>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {DIRECTORY.filter(d => roleById(d.roleId).side === side && d.status === "Active").map(d => {
              const r = roleById(d.roleId);
              return (
                <button key={d.id} onClick={() => { signInAs(d.id); close(); }}
                  className="border border-[hsl(var(--rule))] p-2.5 text-left hover:border-[hsl(var(--safety))]">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="disp text-[15px] font-semibold leading-none">{d.name}</span>
                    <Tag tone={side === "internal" ? "safety" : side === "customer" ? "steel" : "good"}>{r.name}</Tag>
                  </div>
                  <div className="mt-1 text-[12px] leading-[1.4] text-[hsl(var(--ink-2))]">{r.blurb}</div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Rule className="my-3" />
      <p className="text-[13px] leading-[1.5] text-[hsl(var(--ink-2))]">
        No account yet?{" "}
        <button onClick={() => setModal("register")} className="font-semibold text-[hsl(var(--safety-2))] underline">
          Create one
        </button>{" "}
        to see pricing, or{" "}
        <button onClick={() => setModal("credit")} className="font-semibold text-[hsl(var(--safety-2))] underline">
          open a credit account
        </button>{" "}
        to buy on terms.
      </p>
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
        <p className="text-[12px] leading-[1.5] text-[hsl(var(--ink-3))]">
          A web account shows pricing and history. It does not extend credit — that is the
          separate application.
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
          <label className="flex items-start gap-2.5 text-[13px]">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(var(--safety))]" />
            <span>I authorise Misty Valley Supply to obtain credit reports and contact the references above.</span>
          </label>
          <label className="flex items-start gap-2.5 text-[13px]">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[hsl(var(--safety))]" />
            <span>I agree to the personal guarantee and terms of sale.</span>
          </label>
          <label className="grid gap-1.5"><Lab>Signature</Lab>
            <input className={cx(field, "disp text-[20px]")} placeholder="Type your full name" /></label>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        {step > 1 && <Btn variant="line" onClick={() => setStep(step - 1)}>Back</Btn>}
        <Btn className="flex-1" onClick={() => step < 3 ? setStep(step + 1) : (signIn(), close())}>
          {step < 3 ? "Continue" : "Submit application"}
        </Btn>
      </div>
      <p className="mt-3 text-[12px] text-[hsl(var(--ink-3))]">
        Most applications are decided in two business days. You can buy by card in the meantime.
      </p>
    </Shell>
  );

  if (modal === "branch") return (
    <Shell title="Choose your branch" sub="Your branch sets availability, cut-off time and delivery days." onClose={close}>
      <div className="grid gap-1.5">
        {BRANCHES.map(b => (
          <button key={b.id} onClick={() => { setBranch(b); close(); }}
            className={cx("flex items-start justify-between gap-3 border p-3 text-left",
              branch.id === b.id ? "border-[hsl(var(--safety))] bg-[hsl(var(--panel))]"
                                 : "border-[hsl(var(--rule))]")}>
            <div>
              <div className="disp text-[17px] font-semibold leading-none">{b.name}</div>
              <div className="mono mt-1 text-[11.5px] text-[hsl(var(--ink-3))]">{b.city} · {b.hours}</div>
              <div className="mono text-[11.5px] text-[hsl(var(--ink-3))]">{b.phone}</div>
            </div>
            <div className="mono shrink-0 text-[12px] text-[hsl(var(--ink-2))]">
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
      <div className="mt-1 text-[12px] text-[hsl(var(--ink-2))]">List price · per {uom}</div>
      <button onClick={onSignIn}
        className="lab mt-1.5 block text-left font-semibold text-[hsl(var(--safety-2))] underline">
        {user ? "Ask your admin for pricing" : "Sign in for your price"}
      </button>
    </div>
  );

  return (
    <div>
      <div className={cx("num font-bold leading-none text-[hsl(var(--ink))]", big)}>{money(yours)}</div>
      <div className="mt-1 text-[12px] text-[hsl(var(--ink-2))]">Your price · per {uom}</div>
      <div className="mt-1.5 text-[12px] font-medium text-[hsl(var(--good))]">
        Save {money(Math.round((list - yours) * 100) / 100)}
        <span className="ml-1 font-normal text-[hsl(var(--ink-3))] line-through">{money(list)}</span>
      </div>
    </div>
  );
}
