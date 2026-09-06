/* ------------------------------------------------------------------------
   designStore.ts — saved + shareable designs.

   A design is {tool, params, v:1}: the tool id plus the plain params its
   takeoff prices. Saved designs live in localStorage ("mvs-designs", the
   mvs-orders pattern); shareable links carry the same payload base64url-
   encoded in the hash as #d=<encoded>. Decode NEVER trusts the wire:
   payloads are shape-checked here and every value is re-validated by the
   pick* guards where a tool initializes state from them — an unknown tool
   or a bad param falls back to defaults, never a crash.

   No app imports on purpose: this module also runs standalone under node
   (unit checks) and stays out of the three.js chunks.
   ---------------------------------------------------------------------- */

export type DesignPayload = { tool: string; params: Record<string, unknown>; v: 1 };

export type SavedDesign = {
  id: string;
  name: string;
  tool: string;
  params: Record<string, unknown>;
  savedAt: string; // ISO
};

const KEY = "mvs-designs";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// ---- the local design store ---------------------------------------------

/** Saved designs, oldest first. Storage failure or junk reads as empty. */
export function listDesigns(): SavedDesign[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((d): d is SavedDesign =>
      isRecord(d) && typeof d.id === "string" && typeof d.name === "string" &&
      typeof d.tool === "string" && isRecord(d.params) && typeof d.savedAt === "string");
  } catch {
    return [];
  }
}

/** Append a design to the store. Failure is non-fatal (mvs-orders pattern). */
export function saveDesign(tool: string, params: Record<string, unknown>, name: string): SavedDesign {
  const design: SavedDesign = {
    id: `d-${Date.now().toString(36)}-${Math.floor(Math.random() * 36 ** 4).toString(36)}`,
    name, tool, params, savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([...listDesigns(), design]));
  } catch {
    /* storage unavailable — the link still shares; nothing is claimed kept */
  }
  return design;
}

export function deleteDesign(id: string): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(listDesigns().filter(d => d.id !== id)));
  } catch {
    /* storage unavailable — nothing to delete from */
  }
}

// ---- the shareable link --------------------------------------------------

/** Compact URL-safe token: base64url of the JSON payload. */
export function encodeDesign(tool: string, params: Record<string, unknown>): string {
  const payload: DesignPayload = { tool, params, v: 1 };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decode a #d= token. Anything malformed — bad base64, bad JSON, wrong
    shape or version — returns null; param VALUES stay unvalidated here
    and must go through the pick* guards at the point of use. */
export function decodeDesign(encoded: string): DesignPayload | null {
  try {
    const bin = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    const raw: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!isRecord(raw) || raw.v !== 1 || typeof raw.tool !== "string" || !isRecord(raw.params)) return null;
    return { tool: raw.tool, params: raw.params, v: 1 };
  } catch {
    return null;
  }
}

/** The full shareable URL for a design, on this deployment's origin. */
export const designUrl = (tool: string, params: Record<string, unknown>): string =>
  `${location.origin}${location.pathname}#d=${encodeDesign(tool, params)}`;

/** The design carried in the current location hash, if any. */
export function readHashDesign(): DesignPayload | null {
  return location.hash.startsWith("#d=") ? decodeDesign(location.hash.slice(3)) : null;
}

// ---- value guards for untrusted initial params ---------------------------

/** The value if it is one of the allowed options, else the default. */
export const pickOne = <T,>(v: unknown, allowed: readonly T[], dflt: T): T =>
  allowed.includes(v as T) ? (v as T) : dflt;

/** The value if it is a finite number within [min, max], else the default. */
export const pickNum = (v: unknown, min: number, max: number, dflt: number): number =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : dflt;

/** The value if it is a boolean, else the default. */
export const pickBool = (v: unknown, dflt: boolean): boolean =>
  typeof v === "boolean" ? v : dflt;
