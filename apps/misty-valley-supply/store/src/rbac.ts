/**
 * Users, roles and permissions for Misty Valley.
 *
 * One rule: nothing in the UI checks a role name. Everything checks a
 * permission. Roles are just named bundles of permissions, so adding a role
 * never means hunting through views for `if (role === "manager")`.
 */

/* --------------------------------------------------------- permissions */

export const PERMS = {
  "catalog.view":     "See the catalog",
  "price.contract":   "See contract pricing",
  "cost.view":        "See our landed cost",
  "margin.view":      "See margin and GM%",

  "quote.create":     "Build and send quotes",
  "order.create":     "Place orders",
  "order.approve":    "Release orders over a limit",
  "order.all":        "See every order, not just their own",

  "credit.view":      "See a credit account",
  "credit.apply":     "Apply for terms",
  "credit.decide":    "Approve or decline terms",
  "invoice.pay":      "Pay invoices",
  "ar.manage":        "Work the aging and put accounts on hold",

  "pick.queue":       "Work the pick queue",
  "receive.post":     "Receive and post inventory",
  "inventory.adjust": "Adjust and count inventory",

  "route.plan":       "Build delivery routes",
  "delivery.run":     "Run a route and capture proof of delivery",

  "po.create":        "Cut purchase orders",
  "po.approve":       "Approve purchase orders",
  "supplier.manage":  "Manage suppliers and cut-offs",

  "fab.queue":        "Work the fabrication queue",
  "fab.release":      "Release a fabrication package to the shop",
  "drawing.upload":   "Upload shop drawings and sealed calcs",

  "yard.list":        "Post listings in the Yard",
  "yard.pay":         "Authorize protected payments",
  "yard.moderate":    "Remove listings and suspend sellers",
  "payout.view":      "See Stripe payouts and application fees",

  "site.view":        "See Job Site Earth",
  "site.post":        "Post to a job site from the field",
  "site.manage":      "Open, close and share job sites",

  "user.invite":      "Invite users",
  "user.roles":       "Change what a user can do",
  "branch.manage":    "Manage branches",
  "report.company":   "See company-wide reporting",
  "audit.view":       "See the audit log",
} as const;

export type Perm = keyof typeof PERMS;
export const ALL_PERMS = Object.keys(PERMS) as Perm[];

/* ---------------------------------------------------------------- roles */

export type Side = "internal" | "customer" | "marketplace";

export type Role = {
  id: string; name: string; side: Side; blurb: string;
  perms: Perm[] | "*";
  home: string;              // the view this role lands on
};

const CUSTOMER_BASE: Perm[] = ["catalog.view", "site.view"];

export const ROLES: Role[] = [
  /* ---- Misty Valley internal ---- */
  { id: "owner", name: "Owner", side: "internal", home: "dash",
    blurb: "Ben and Joey. Everything, including who else gets what.",
    perms: "*" },

  { id: "gm", name: "Branch manager", side: "internal", home: "dash",
    blurb: "Runs one branch: the counter, the yard, the trucks, the numbers.",
    perms: ["catalog.view","price.contract","cost.view","margin.view","quote.create","order.create",
            "order.approve","order.all","credit.view","credit.decide","ar.manage","pick.queue",
            "receive.post","inventory.adjust","route.plan","po.create","po.approve","fab.queue",
            "site.view","site.manage","user.invite","report.company"] },

  { id: "counter", name: "Counter sales", side: "internal", home: "dash",
    blurb: "Answers the phone, builds the quote, takes the order.",
    perms: ["catalog.view","price.contract","cost.view","quote.create","order.create","order.all",
            "credit.view","pick.queue","site.view"] },

  { id: "buyer", name: "Purchasing", side: "internal", home: "dash",
    blurb: "Cuts POs, works suppliers and cut-off times, owns the fill rate.",
    perms: ["catalog.view","cost.view","margin.view","po.create","po.approve","supplier.manage",
            "receive.post","inventory.adjust","order.all","site.view"] },

  { id: "warehouse", name: "Warehouse", side: "internal", home: "dash",
    blurb: "Picks, packs, receives, counts. No pricing, no customer credit.",
    perms: ["catalog.view","pick.queue","receive.post","inventory.adjust","site.view"] },

  { id: "driver", name: "Driver", side: "internal", home: "dash",
    blurb: "Runs the route, gets the signature, shoots the deck photo.",
    perms: ["delivery.run","site.view","site.post"] },

  { id: "fab", name: "Fabrication lead", side: "internal", home: "dash",
    blurb: "Runs the screen shop. Cut lists, drawings, release to weld.",
    perms: ["catalog.view","cost.view","fab.queue","fab.release","drawing.upload",
            "site.view","site.post"] },

  { id: "office", name: "Office / AR", side: "internal", home: "dash",
    blurb: "Invoices, aging, holds, payouts. Sees money, not cost.",
    perms: ["catalog.view","credit.view","credit.decide","ar.manage","invoice.pay",
            "payout.view","order.all","report.company","audit.view"] },

  /* ---- customer side ---- */
  { id: "cust_admin", name: "Customer admin", side: "customer", home: "account",
    blurb: "The contractor's owner or controller. Adds their own people.",
    perms: [...CUSTOMER_BASE,"price.contract","quote.create","order.create","order.approve",
            "order.all","credit.view","credit.apply","invoice.pay","user.invite","user.roles",
            "site.post","site.manage","yard.list","yard.pay"] },

  { id: "cust_buyer", name: "Customer buyer", side: "customer", home: "shop",
    blurb: "The estimator or PM. Buys at contract price, no credit authority.",
    perms: [...CUSTOMER_BASE,"price.contract","quote.create","order.create","credit.view",
            "site.post","yard.list","yard.pay"] },

  { id: "cust_field", name: "Field requester", side: "customer", home: "shop",
    blurb: "The foreman on the deck. Can ask for material, cannot commit money.",
    perms: [...CUSTOMER_BASE,"quote.create","site.post"] },

  /* ---- marketplace ---- */
  { id: "seller", name: "Yard seller", side: "marketplace", home: "yard",
    blurb: "Sells surplus and equipment. Paid through their own Stripe account.",
    perms: ["catalog.view","yard.list","payout.view","site.view"] },
];

export const roleById = (id: string) => ROLES.find(r => r.id === id) ?? ROLES[0];

export const hasPerm = (role: Role, p: Perm) => role.perms === "*" || role.perms.includes(p);

export const permCount = (role: Role) => role.perms === "*" ? ALL_PERMS.length : role.perms.length;

/* ------------------------------------------------------------ directory */

export type Person = {
  id: string; name: string; roleId: string; branch: string;
  email: string; company: string; last: string; status: "Active" | "Invited" | "Suspended";
};

export const DIRECTORY: Person[] = [
  { id: "u-001", name: "Ben Easterday",  roleId: "owner",      branch: "BON", company: "Misty Valley Supply", email: "ben@mistyvalley.supply",   last: "12 min ago", status: "Active" },
  { id: "u-002", name: "Joey Allee",     roleId: "owner",      branch: "BON", company: "Misty Valley Supply", email: "joey@mistyvalley.supply",  last: "just now",   status: "Active" },
  { id: "u-003", name: "Christopher E.", roleId: "gm",         branch: "EZT", company: "Misty Valley Supply", email: "chris@mistyvalley.supply", last: "1 hr ago",   status: "Active" },
  { id: "u-004", name: "D. Whitlock",    roleId: "counter",    branch: "BON", company: "Misty Valley Supply", email: "counter.bon@mistyvalley.supply", last: "4 min ago", status: "Active" },
  { id: "u-005", name: "R. Salas",       roleId: "buyer",      branch: "BON", company: "Misty Valley Supply", email: "purchasing@mistyvalley.supply",  last: "38 min ago", status: "Active" },
  { id: "u-006", name: "T. Hines",       roleId: "warehouse",  branch: "BON", company: "Misty Valley Supply", email: "yard.bon@mistyvalley.supply",    last: "2 min ago", status: "Active" },
  { id: "u-007", name: "M. Coffey",      roleId: "driver",     branch: "EZT", company: "Misty Valley Supply", email: "route2@mistyvalley.supply",      last: "on route",  status: "Active" },
  { id: "u-008", name: "A. Duvall",      roleId: "fab",        branch: "BON", company: "Misty Valley Supply", email: "shop@mistyvalley.supply",        last: "26 min ago", status: "Active" },
  { id: "u-009", name: "L. Board",       roleId: "office",     branch: "BON", company: "Misty Valley Supply", email: "ar@mistyvalley.supply",          last: "3 hr ago",  status: "Active" },
  { id: "u-010", name: "Scott Waldman",  roleId: "cust_admin", branch: "EZT", company: "R&B Roofing",         email: "scott@rbroofing.com",   last: "yesterday", status: "Active" },
  { id: "u-011", name: "Joey Allee",     roleId: "cust_buyer", branch: "EZT", company: "R&B Roofing",         email: "joey@rbroofing.com",    last: "just now",  status: "Active" },
  { id: "u-012", name: "Elias V.",       roleId: "cust_field", branch: "EZT", company: "R&B Roofing",         email: "elias@rbroofing.com",   last: "6 min ago", status: "Active" },
  { id: "u-013", name: "Salt River Roofing", roleId: "seller", branch: "LOU", company: "Salt River Roofing",  email: "office@saltriverroofing.com", last: "2 days ago", status: "Active" },
  { id: "u-014", name: "J. Meredith",    roleId: "seller",     branch: "BWG", company: "Meredith Mechanical", email: "jm@meredithmech.com",   last: "—", status: "Invited" },
];

/* ---------------------------------------------------- role dashboards */

export type Tile = { k: string; v: string; s?: string; tone?: "safety" | "good" | "warn" | "bad" };
export type Queue = { title: string; cols: string[]; rows: string[][]; cta?: string };
export type Dash = { headline: string; tiles: Tile[]; queues: Queue[] };

export const DASHBOARDS: Record<string, Dash> = {
  owner: {
    headline: "Everything, in one screen",
    tiles: [
      { k: "Booked today", v: "$41,290", s: "18 orders", tone: "safety" },
      { k: "Gross margin", v: "28.4%", s: "target 26%", tone: "good" },
      { k: "Cash in 30 days", v: "$96,400", s: "AR less AP" },
      { k: "Fill rate", v: "94%", s: "3 lines short", tone: "warn" },
    ],
    queues: [
      { title: "Needs a decision from you", cols: ["Item", "Why", "Amount"], cta: "Open",
        rows: [
          ["Credit — Hardin Interiors", "Asked for $50k on 3 references", "$50,000"],
          ["PO 4471 — ClarkDietrich", "Over the $25k approval limit", "$31,880"],
          ["Substitution — Lee St II", "Screen equal against a named B.O.D.", "—"],
        ] },
      { title: "Branch scoreboard", cols: ["Branch", "Booked", "GM%", "On time"],
        rows: [
          ["Bonnieville", "$18,410", "29.1%", "97%"],
          ["Elizabethtown", "$12,760", "27.8%", "96%"],
          ["Bowling Green", "$6,220", "26.4%", "92%"],
          ["Louisville S.", "$3,900", "31.0%", "100%"],
        ] },
    ],
  },
  gm: {
    headline: "Your branch, right now",
    tiles: [
      { k: "Open orders", v: "23", s: "6 ship today", tone: "safety" },
      { k: "Will-call waiting", v: "4", s: "oldest 41 min", tone: "warn" },
      { k: "Trucks out", v: "2 of 3", s: "route 2 running late" },
      { k: "Past due AR", v: "$4,410", s: "1 account", tone: "bad" },
    ],
    queues: [
      { title: "Today's exceptions", cols: ["Order", "Problem", "Owner"], cta: "Resolve",
        rows: [
          ["SO-1042", "Short 40 LF of 6 in 16ga", "Purchasing"],
          ["SO-1039", "Customer on credit hold", "Office"],
          ["SO-1035", "Crane window moved to 6a", "Route 2"],
        ] },
      { title: "People on shift", cols: ["Name", "Role", "Since"],
        rows: [["D. Whitlock", "Counter", "6:02a"], ["T. Hines", "Warehouse", "5:48a"], ["M. Coffey", "Driver", "6:15a"]] },
    ],
  },
  counter: {
    headline: "Quotes and orders you own",
    tiles: [
      { k: "Quotes open", v: "11", s: "4 expire this week", tone: "warn" },
      { k: "Won this week", v: "$22,800", s: "hit rate 41%", tone: "good" },
      { k: "Calls waiting", v: "2", s: "line 1, line 3" },
      { k: "Will-call ready", v: "4", s: "tell them" },
    ],
    queues: [
      { title: "Quotes to chase", cols: ["Quote", "Customer", "Value", "Age"], cta: "Call",
        rows: [
          ["Q-2210", "Hardin Interiors", "$8,940", "3 d"],
          ["Q-2206", "Barren River Drywall", "$14,100", "5 d"],
          ["Q-2199", "R&B Roofing — Lee St II", "$21,600", "6 d"],
        ] },
    ],
  },
  buyer: {
    headline: "Cut-offs, cost and coverage",
    tiles: [
      { k: "Lines short", v: "3", s: "against 23 orders", tone: "bad" },
      { k: "POs to cut", v: "7", s: "2 past cut-off", tone: "warn" },
      { k: "Landed cost drift", v: "+2.1%", s: "30 day, galv" },
      { k: "Supplier OTIF", v: "91%", s: "Telling dragging" },
    ],
    queues: [
      { title: "Buy before cut-off", cols: ["SKU", "Short", "Supplier", "Cut-off"], cta: "Cut PO",
        rows: [
          ["MVS-RG-1000", "18 EA", "Regional PPE", "2:00p"],
          ["MVS-RSF-SC3", "160 LF", "Tube mill", "11:00a"],
          ["MVS-HH-T2V", "40 EA", "3M distributor", "3:30p"],
        ] },
    ],
  },
  warehouse: {
    headline: "Pick, receive, count",
    tiles: [
      { k: "To pick", v: "9", s: "3 hot", tone: "safety" },
      { k: "Staged", v: "6", s: "route 1 and 2" },
      { k: "Receipts due", v: "2", s: "one is a screen frame" },
      { k: "Cycle counts", v: "1", s: "bin A-14 due" },
    ],
    queues: [
      { title: "Pick queue", cols: ["Order", "Lines", "For", "Cut time"], cta: "Pick",
        rows: [
          ["SO-1044", "6", "Route 1 — Lee St", "7:30a"],
          ["SO-1045", "3", "Will call — Vargas", "8:00a"],
          ["SO-1046", "11", "Route 2 — TRH", "9:15a"],
        ] },
    ],
  },
  driver: {
    headline: "Your route",
    tiles: [
      { k: "Stops left", v: "4", s: "of 7" },
      { k: "Next", v: "Lee Street", s: "12 min out", tone: "safety" },
      { k: "Crane window", v: "6:00a", s: "do not miss it", tone: "warn" },
      { k: "PODs captured", v: "3", s: "all signed" },
    ],
    queues: [
      { title: "Stops", cols: ["#", "Stop", "Drop", "Status"], cta: "Arrive",
        rows: [
          ["4", "Lee Street — deck", "Screen sections", "Next"],
          ["5", "TRH Clarksville", "Guardrail, anchors", "Queued"],
          ["6", "Hardin Interiors shop", "Stud bundle", "Queued"],
          ["7", "Return — Bonnieville", "Empty racks", "Queued"],
        ] },
    ],
  },
  fab: {
    headline: "The screen shop",
    tiles: [
      { k: "In the shop", v: "2", s: "1 releasing today", tone: "safety" },
      { k: "Awaiting calcs", v: "1", s: "engineer has it 2 d", tone: "warn" },
      { k: "LF cut this week", v: "418", s: "vs 380 planned", tone: "good" },
      { k: "Rework", v: "0", s: "keep it there" },
    ],
    queues: [
      { title: "Fabrication queue", cols: ["Job", "Scope", "Stage", "Need by"], cta: "Release",
        rows: [
          ["Lee Street II", "156 LF @ 3'-6\"", "Cut list ready", "Sep 12"],
          ["TRH Clarksville", "88 LF @ 4'-0\"", "Awaiting sealed calcs", "Sep 19"],
        ] },
    ],
  },
  office: {
    headline: "Money in, money out",
    tiles: [
      { k: "Open AR", v: "$11,240", s: "5 documents" },
      { k: "Past due", v: "$4,410", s: "1 account, 33 days", tone: "bad" },
      { k: "Stripe payouts", v: "$3,180", s: "next Tue" },
      { k: "Application fees", v: "$412", s: "Yard, month to date", tone: "good" },
    ],
    queues: [
      { title: "Work the aging", cols: ["Account", "Amount", "Days", "Action"], cta: "Call",
        rows: [
          ["Meredith Mechanical", "$4,410", "33", "Hold at 35"],
          ["Barren River Drywall", "$3,260", "18", "Statement sent"],
          ["R&B Roofing", "$6,000", "7", "Current"],
        ] },
    ],
  },
  cust_admin: {
    headline: "Your company's account",
    tiles: [
      { k: "Credit available", v: "$51,240", s: "of $75,000", tone: "good" },
      { k: "Open orders", v: "4", s: "2 deliver this week" },
      { k: "Past due", v: "$4,410", s: "pay to avoid a hold", tone: "bad" },
      { k: "Users", v: "3", s: "1 field only" },
    ],
    queues: [
      { title: "Needs you", cols: ["Item", "Why", "Amount"], cta: "Open",
        rows: [
          ["Invoice 8791", "33 days past due", "$4,410"],
          ["Request from Elias V.", "Field asked for anchors", "$536"],
        ] },
    ],
  },
  cust_buyer: {
    headline: "Your jobs and your price",
    tiles: [
      { k: "Your discount", v: "18%", s: "off list, Net 30", tone: "safety" },
      { k: "Open orders", v: "4", s: "on time 96%" },
      { k: "Saved this year", v: "$9,840", s: "vs list" },
      { k: "Lists", v: "3", s: "reorder in one click" },
    ],
    queues: [
      { title: "Your open orders", cols: ["Order", "Job", "Delivers", "Status"], cta: "Track",
        rows: [
          ["SO-1044", "Lee Street", "Tomorrow 6a", "Staged"],
          ["SO-1046", "TRH Clarksville", "Sep 9", "Picking"],
        ] },
    ],
  },
  cust_field: {
    headline: "Ask for what the deck needs",
    tiles: [
      { k: "Your requests", v: "2", s: "1 waiting on the office", tone: "warn" },
      { k: "Delivering today", v: "1", s: "Lee Street 6a" },
      { k: "Your site", v: "Lee Street", s: "live now", tone: "safety" },
      { k: "Pricing", v: "Hidden", s: "by your admin" },
    ],
    queues: [
      { title: "Requests you sent", cols: ["Request", "For", "Status"], cta: "Nudge",
        rows: [
          ["R-118", "2 boxes #12 stitch screw", "Waiting on Joey"],
          ["R-117", "Anchor, 5,000 lb", "Approved — on route 1"],
        ] },
    ],
  },
  seller: {
    headline: "Your listings and your payouts",
    tiles: [
      { k: "Active listings", v: "2", s: "1 with a hold on it", tone: "safety" },
      { k: "Held, not captured", v: "$4,600", s: "buyer picks up Sat", tone: "warn" },
      { k: "Paid out", v: "$12,860", s: "6 completed" },
      { k: "Fee paid", v: "5%", s: "only on completed sales" },
    ],
    queues: [
      { title: "Your listings", cols: ["Listing", "Price", "State"], cta: "Edit",
        rows: [
          ["L-2271 Guardrail, 32 sections", "$4,600", "Authorized — awaiting pickup"],
          ["L-2244 Bundle of 12 ft track", "$310", "Live"],
        ] },
    ],
  },
};
