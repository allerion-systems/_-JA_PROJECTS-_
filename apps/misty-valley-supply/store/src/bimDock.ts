/* ------------------------------------------------------------------------
   bimDock.ts — floating-dock takeoff on the shared 5D core (bim.ts).

   Market: Corps of Engineers lakes — Nolin River, Rough River, Barren —
   where the pool swings feet between summer and winter. That is why the
   default gangway is 20 ft and why foam-filled floats are the only float
   in the catalog. A private dock on these lakes needs a USACE shoreline-
   use permit; the takeoff never pretends otherwise.
   ---------------------------------------------------------------------- */

import { el, type Element } from "@/bim";

export type DockParams = {
  shape: "straight" | "L" | "T";
  walkwayFt: number;                    // 20–60 in 10-ft steps (main run)
  platform: "none" | "8x10" | "double"; // 8×10 swim/seating platforms
  gangway: boolean;                     // 3×20 aluminum, default true
  decking: "wood" | "composite";
  ladder: boolean;
};

export const DOCK_WALKWAYS = [20, 30, 40, 50, 60] as const;

/* Moorable-edge rule (documented, used for cleats AND bumpers):
   Every dock here is a rectilinear tree of 4-ft-wide sections, and the
   perimeter of any such tree is 2 × (total centerline feet) + 8 — the two
   long sides of every run plus a net 8 ft of exposed 4-ft ends. (Straight:
   2·walkwayFt + two 4-ft ends. The identity holds for L and T too: each
   added end contributes 4 ft but its junction covers 4 ft of a long side.)
   An 8×10 platform hung on a walkway side adds its three new sides
   (8 + 10 + 8 = 26 ft) and covers the 10 ft of walkway edge it bolts to:
   net +16 ft per platform. Cleats and bumpers each go one per 10 ft of
   that edge, rounded up. The gangway landing is not deducted — a hull can
   still reach that corner at winter pool. */
export function dockGeometry(p: DockParams) {
  const walkSections = p.walkwayFt / 10 + (p.shape === "L" ? 2 : p.shape === "T" ? 3 : 0);
  const walkFt = walkSections * 10;                                  // total centerline
  const platforms = p.platform === "none" ? 0 : p.platform === "8x10" ? 1 : 2;
  const edgeFt = 2 * walkFt + 8 + 16 * platforms;                    // rule above
  const anchors = p.shape === "straight" ? 4 : 6;                    // corners derived
  return { walkSections, walkFt, platforms, edgeFt, anchors };
}

/* Hand-check — straight 30 ft walkway + one 8×10 platform + gangway +
   wood decking + ladder:
     3 × MVS-DK-SEC410  @ 1650 = 4,950
     1 × MVS-DK-SEC810  @ 2950 = 2,950
     1 × MVS-DK-GANG20  @ 2400 = 2,400
     edge = 2·30 + 8 + 16 = 84 ft → ⌈84/10⌉ = 9
     9 × MVS-DK-CLEAT10 @   18 =   162
     9 × MVS-DK-BUMP10  @   95 =   855
     1 × MVS-DK-LAD4    @  210 =   210
     4 × MVS-DK-ANCH    @  145 =   580
   Expected total: $12,107. */
export function dockTakeoff(p: DockParams): Element[] {
  const g = dockGeometry(p);
  const out: Element[] = [];

  // ---- floating structure ------------------------------------------------
  // 4×10 walkway sections: main run, +2 for the L return, +3 for the T head.
  out.push(el("IfcElementAssembly", `Walkway section — 4×10, ${p.shape} layout`, "MVS-DK-SEC410", g.walkSections));
  if (g.platforms > 0)
    out.push(el("IfcElementAssembly", "Platform section — 8×10", "MVS-DK-SEC810", g.platforms));

  // ---- shore connection --------------------------------------------------
  // 20 ft of gangway keeps the walk aboard at a sane slope through the
  // Corps drawdown; it rolls on the dock end.
  if (p.gangway)
    out.push(el("IfcRamp", "Aluminum gangway — 3×20, rolls on dock end", "MVS-DK-GANG20", 1));

  // ---- decking -----------------------------------------------------------
  // Composite upgrade is ordered per section — every 410 and 810 gets one.
  if (p.decking === "composite")
    out.push(el("IfcCovering", "Composite decking upgrade — per section", "MVS-DK-DECKC", g.walkSections + g.platforms));

  // ---- moorable edge hardware — rule documented above --------------------
  const edgeUnits = Math.ceil(g.edgeFt / 10);
  out.push(el("IfcDiscreteAccessory", `Dock cleat — 1 per 10 ft of edge (${g.edgeFt} ft)`, "MVS-DK-CLEAT10", edgeUnits));
  out.push(el("IfcDiscreteAccessory", "Edge bumper — every edge a hull can reach", "MVS-DK-BUMP10", edgeUnits));

  // ---- accessories + anchoring -------------------------------------------
  if (p.ladder)
    out.push(el("IfcDiscreteAccessory", "Swim ladder — 4-step, flip-up", "MVS-DK-LAD4", 1));
  // Deadweight + chain sized for the fluctuation zone: one kit per outside
  // corner — 4 on a straight run, 6 once the L or T adds corners.
  out.push(el("IfcFooting", `Anchor kit — ${g.anchors} corners, chain for the drawdown`, "MVS-DK-ANCH", g.anchors));

  return out;
}
