/**
 * Job Site Earth — the live layer.
 *
 * A job site is a pin on the map with a story attached. Anybody standing on
 * that deck with a phone can add to it, and for the next 12 hours the pin is
 * "live": it rings, it sorts to the top, and anyone following the job sees it.
 *
 * Photos here are real: they are the Lee Street roof screen going up.
 */

import lee1 from "@/assets/site/lee-screen-1.jpg";
import lee2 from "@/assets/site/lee-screen-2.jpg";
import leeDetail from "@/assets/site/lee-detail.jpg";

export type Post = {
  id: string;
  img?: string;          // a real photo, when we have one
  glyph?: string;        // otherwise a mark keyed to the trade
  who: string;
  role: string;
  minsAgo: number;
  caption: string;
  tags: string[];
};

export type Site = {
  id: string;
  name: string;
  addr: string;
  lng: number; lat: number;
  gc: string;
  trade: string;
  phase: string;
  crew: number;
  open: boolean;         // public — anyone can watch and post
  posts: Post[];
};

export const LIVE_WINDOW_MIN = 720; // 12 hours

export const SITES: Site[] = [
  {
    id: "JS-LEE", name: "Lee Street", addr: "412 Lee St, Elizabethtown, KY",
    lng: -85.8598, lat: 37.6912, gc: "R&B Roofing", trade: "Roofing / RTU screen",
    phase: "Screen set — punch", crew: 6, open: true,
    posts: [
      { id: "p1", img: lee2, who: "A. Duvall", role: "Fabrication lead", minsAgo: 34,
        caption: "Second bay standing. Stainless clamps on the round tube, square bases shimmed to the slope.",
        tags: ["SC3 equal", "3'-6\"", "5'-0\" bays"] },
      { id: "p2", img: lee1, who: "Joey Allee", role: "Chief estimator", minsAgo: 96,
        caption: "Whole frame is up before a single panel. This is the part that costs $6,000 and sells for twelve.",
        tags: ["frame complete", "galv tube"] },
      { id: "p3", img: leeDetail, who: "Joey Allee", role: "Chief estimator", minsAgo: 210,
        caption: "Detail 6/A160 — the basis of design we are building an equal to. Sealed calcs went with the substitution.",
        tags: ["7.2 Rib B.O.D.", "substitution"] },
    ],
  },
  {
    id: "JS-TRH", name: "Texas Roadhouse — Clarksville", addr: "1890 Greentree N, Clarksville, IN",
    lng: -85.7580, lat: 38.3320, gc: "R&B Roofing", trade: "Roofing / interior canopy",
    phase: "Canopy metal — 7 squares left", crew: 9, open: true,
    posts: [
      { id: "p4", glyph: "vest", who: "Elias V.", role: "Field requester", minsAgo: 12,
        caption: "Six men on the deck at 6. Coping piece and the two DCSM vents still open.",
        tags: ["second shift", "punch"] },
      { id: "p5", glyph: "harness", who: "M. Coffey", role: "Driver", minsAgo: 141,
        caption: "Dropped guardrail and anchors at the north stair. Signed for by the foreman.",
        tags: ["POD captured"] },
    ],
  },
  {
    id: "JS-BON", name: "Bonnieville yard", addr: "77 Industrial Dr, Bonnieville, KY",
    lng: -85.8930, lat: 37.2237, gc: "Misty Valley Supply", trade: "Branch",
    phase: "Loading route 1", crew: 4, open: true,
    posts: [
      { id: "p6", glyph: "guardrail", who: "T. Hines", role: "Warehouse", minsAgo: 6,
        caption: "Route 1 staged. Screen sections labeled by bay so nobody guesses on the roof.",
        tags: ["staged", "labeled"] },
    ],
  },
  {
    id: "JS-BWG", name: "Barren River — interiors", addr: "Bowling Green, KY",
    lng: -86.4808, lat: 36.9685, gc: "Barren River Drywall", trade: "Metal stud framing",
    phase: "Level 2 layout", crew: 11, open: true,
    posts: [
      { id: "p7", glyph: "glasses", who: "Barren River Drywall", role: "Customer admin", minsAgo: 820,
        caption: "Overrun stud from the VE went on the Yard. Somebody take it.",
        tags: ["surplus", "yard"] },
    ],
  },
  {
    id: "JS-SHP", name: "Salt River re-roof", addr: "Shepherdsville, KY",
    lng: -85.7158, lat: 37.9884, gc: "Salt River Roofing", trade: "Roofing",
    phase: "Tear-off", crew: 7, open: true,
    posts: [
      { id: "p8", glyph: "base", who: "Salt River Roofing", role: "Yard seller", minsAgo: 300,
        caption: "Guardrail comes off Friday. Selling it rather than storing it another season.",
        tags: ["non-penetrating", "for sale"] },
    ],
  },
  {
    id: "JS-NSH", name: "Nashville North — shell", addr: "Goodlettsville, TN",
    lng: -86.7133, lat: 36.3231, gc: "Cumberland Sheet Metal", trade: "Mechanical / screens",
    phase: "RTU set", crew: 5, open: true,
    posts: [
      { id: "p9", glyph: "srl", who: "Cumberland Sheet Metal", role: "Customer buyer", minsAgo: 1450,
        caption: "Units are up. Need screen before the architect walks it.",
        tags: ["needs screen"] },
    ],
  },
];

export const lastPost = (s: Site) => Math.min(...s.posts.map(p => p.minsAgo));
export const isLive = (s: Site) => lastPost(s) <= LIVE_WINDOW_MIN;

export const ago = (m: number) =>
  m < 1 ? "now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
