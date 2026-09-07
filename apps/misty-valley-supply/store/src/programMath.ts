/* ------------------------------------------------------------------------
   Modular Projects programmer — pure math, no UI, no three.js.

   This tool NEVER shows a retail price. It programs a building (type,
   stories, units), converts the program to gross square footage, counts
   standard modular boxes, and returns a clearly-labeled PLANNING RANGE
   that routes to the design-build intake. Every number that is a range
   says so. Unit-testable: every export here is a constant or a pure
   function.
   ---------------------------------------------------------------------- */

export type ProgramType = "hotel" | "office" | "government" | "school" | "apartments" | "emergency";

// ---- the standard modular box -------------------------------------------

export const MODULE_W_FT = 14;
export const MODULE_L_FT = 62;
/** One standard modular box, 14 ft × 62 ft ≈ 868 GSF. */
export const MODULE_GSF = MODULE_W_FT * MODULE_L_FT; // 868

/** A crane crew sets roughly 8 modules per week. */
export const MODULES_PER_CRANE_WEEK = 8;

// ---- gross factors per program unit -------------------------------------

export const GSF_PER_ROOM = 410;       // hotel: room + corridor + core share
export const GSF_PER_CLASSROOM = 1350; // school: classroom + circulation
export const GSF_PER_UNIT = 950;       // apartments: unit + common share
export const GSF_PER_BAY = 2000;       // emergency: one apparatus bay

/* ---- PLACEHOLDER PLANNING BANDS ($/GSF) ---------------------------------
   PLACEHOLDER PLANNING BANDS pending signed manufacturer data — they
   inherit the site-wide prototype disclaimer. Ranges only; never a
   retail price, never a quote. */
export const BAND_HOTEL: readonly [number, number] = [160, 260];
export const BAND_OFFICE: readonly [number, number] = [180, 280]; // office + government
export const BAND_SCHOOL: readonly [number, number] = [220, 320];
export const BAND_APARTMENTS: readonly [number, number] = [150, 240];
export const BAND_EMERGENCY: readonly [number, number] = [250, 350];

export const PLANNING_BANDS: Record<ProgramType, readonly [number, number]> = {
  hotel: BAND_HOTEL,
  office: BAND_OFFICE,
  government: BAND_OFFICE,
  school: BAND_SCHOOL,
  apartments: BAND_APARTMENTS,
  emergency: BAND_EMERGENCY,
};

// ---- per-type size choices (the Segs the wizard offers) -----------------

export const HOTEL_ROOMS = [20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120] as const;
export const HOTEL_STORIES = [2, 3, 4] as const;
export const OFFICE_GSF = [5000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000] as const;
export const OFFICE_STORIES = [1, 2, 3] as const;
export const SCHOOL_CLASSROOMS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24] as const;
export const APT_UNITS = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96] as const;
export const APT_STORIES = [2, 3, 4] as const;
export const EMS_BAYS = [2, 3, 4, 5, 6] as const;
export const EMS_QUARTERS_GSF = [1000, 2000, 3000, 4000] as const;

// ---- the program itself --------------------------------------------------

export type ProgramParams =
  | { type: "hotel"; rooms: number; stories: number }
  | { type: "office" | "government"; gsf: number; stories: number }
  | { type: "school"; classrooms: number }
  | { type: "apartments"; units: number; stories: number }
  | { type: "emergency"; bays: number; quartersGsf: number };

export type ProgramResult = {
  gsf: number;
  modules: number;
  craneWeeks: number;
  rangeLow: number;
  rangeHigh: number;
  /** The $/GSF planning band applied — a range, labeled as one. */
  perGsf: [number, number];
};

/** Gross square footage the program implies. */
export function programGsf(p: ProgramParams): number {
  switch (p.type) {
    case "hotel": return p.rooms * GSF_PER_ROOM;
    case "office":
    case "government": return p.gsf;
    case "school": return p.classrooms * GSF_PER_CLASSROOM;
    case "apartments": return p.units * GSF_PER_UNIT;
    case "emergency": return p.bays * GSF_PER_BAY + p.quartersGsf;
  }
}

/** Stories the massing stacks — single-story program types report 1. */
export function programStories(p: ProgramParams): number {
  switch (p.type) {
    case "hotel":
    case "office":
    case "government":
    case "apartments": return p.stories;
    case "school":
    case "emergency": return 1;
  }
}

/** The full program: GSF → module count → crane-set weeks → planning range. */
export function program(p: ProgramParams): ProgramResult {
  const gsf = programGsf(p);
  const modules = Math.ceil(gsf / MODULE_GSF);
  const craneWeeks = Math.ceil(modules / MODULES_PER_CRANE_WEEK);
  const [lo, hi] = PLANNING_BANDS[p.type];
  return { gsf, modules, craneWeeks, rangeLow: gsf * lo, rangeHigh: gsf * hi, perGsf: [lo, hi] };
}

/** "$3.94M" — millions with two decimals, for planning-range display. */
export const fmtMillions = (n: number) => `$${(n / 1e6).toFixed(2)}M`;
