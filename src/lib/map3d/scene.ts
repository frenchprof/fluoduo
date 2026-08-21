/**
 * What stands beside the road in the 3D course map — Dan's Figma Make
 * "3D Scroll Map Interface" (19 Aug 2026), data only, no React.
 *
 *   · ROADSIDE_ITEMS — the curriculum-grounded props and buildings per
 *     region (Peers' catalogue, carried over intact): z = position along the
 *     road in stop units (stop N is at z = N − 1), side ±1, lat = lateral
 *     distance from the road's centre line. The French `label`s are content
 *     (they teach: « un crayon », « Je m'appelle… ») — Dan's litmus keeps
 *     them. Building walls/roofs read Cahier + region tokens.
 *   · NATURE_ITEMS — trees and bushes placed procedurally (seeded, so the
 *     scene is identical on every render), skipping the z's a prop occupies.
 */

export type RBuild = {
  id: string;
  z: number;
  side: 1 | -1;
  lat: number;
  kind: "B";
  w: number;
  h: number;
  floors: number;
  wall: string;
  roof: string;
  sign?: string;
};
export type RProp = { id: string; z: number; side: 1 | -1; lat: number; kind: "P"; emoji: string; size: number; label?: string };
export type RItem = RBuild | RProp;

const PAPER = "var(--cahier-paper-raised)";
const KRAFT = "var(--cahier-kraft)";
const INK = "var(--cahier-ink)";
const VILLAGE = "var(--region-village)";
const HEIGHTS = "var(--region-heights)";
const VALLEY = "var(--region-valley)";
const DOWNTOWN = "var(--region-downtown)";
const MARKET = "var(--region-market)";

export const ROADSIDE_ITEMS: RItem[] = [
  // ── Welcome Village (stops 1–10) ──────────────────────────────────────────
  { id: "bonjour-arch", z: 0.5, side: 1, lat: 0.3, kind: "P", emoji: "🎪", size: 80, label: "BONJOUR !" },
  { id: "giant-pencil", z: 2.5, side: -1, lat: 0.34, kind: "P", emoji: "✏️", size: 95, label: "un crayon" },
  { id: "colour-palette", z: 4.5, side: 1, lat: 0.3, kind: "P", emoji: "🎨", size: 80, label: "les couleurs" },
  { id: "schoolhouse", z: 7.5, side: -1, lat: 0.38, kind: "B", w: 118, h: 90, floors: 2, wall: PAPER, roof: VILLAGE, sign: "l'école" },
  { id: "giant-ear", z: 8.2, side: 1, lat: 0.3, kind: "P", emoji: "👂", size: 90, label: "Écoutez !" },
  { id: "nametag", z: 9.5, side: 1, lat: 0.28, kind: "P", emoji: "📛", size: 74, label: "Je m'appelle…" },
  // ── Identity Heights (stops 11–20) ────────────────────────────────────────
  { id: "job-signs", z: 11.5, side: -1, lat: 0.32, kind: "P", emoji: "🎭", size: 70, label: "un acteur, une actrice" },
  { id: "university", z: 13.0, side: 1, lat: 0.4, kind: "B", w: 130, h: 100, floors: 3, wall: "var(--cahier-accent-soft)", roof: HEIGHTS, sign: "le campus" },
  { id: "globe-tower", z: 15.5, side: -1, lat: 0.36, kind: "P", emoji: "🌍", size: 98, label: "le monde" },
  { id: "birthday-cake", z: 18.5, side: 1, lat: 0.28, kind: "P", emoji: "🎂", size: 80, label: "J'ai … ans" },
  { id: "postcard", z: 19.5, side: -1, lat: 0.28, kind: "P", emoji: "✍️", size: 70, label: "mini-texte" },
  // ── Wants & Wishes Valley (stops 21–30) ───────────────────────────────────
  { id: "object-totem", z: 20.5, side: 1, lat: 0.28, kind: "P", emoji: "🎒", size: 84, label: "un sac, un livre…" },
  { id: "cinema", z: 22.5, side: -1, lat: 0.42, kind: "B", w: 140, h: 94, floors: 2, wall: INK, roof: VALLEY, sign: "le cinéma" },
  { id: "sports-gear", z: 23.5, side: 1, lat: 0.32, kind: "P", emoji: "⚽", size: 72, label: "faire du foot" },
  { id: "week-planner", z: 26.5, side: -1, lat: 0.28, kind: "P", emoji: "📆", size: 70, label: "les jours de la semaine" },
  { id: "gift-house", z: 28.5, side: 1, lat: 0.4, kind: "B", w: 106, h: 86, floors: 2, wall: "var(--region-valley-band)", roof: VALLEY, sign: "Bon anniversaire !" },
  // ── Downtown District (stops 31–40) ───────────────────────────────────────
  { id: "clocktower", z: 31.0, side: -1, lat: 0.36, kind: "B", w: 62, h: 150, floors: 5, wall: PAPER, roof: INK, sign: "⛅ météo" },
  { id: "prep-park", z: 33.5, side: 1, lat: 0.3, kind: "P", emoji: "📦", size: 72, label: "dans la boîte" },
  { id: "signpost", z: 35.5, side: -1, lat: 0.28, kind: "P", emoji: "🛤️", size: 78, label: "tout droit" },
  { id: "train-station", z: 37.5, side: 1, lat: 0.44, kind: "B", w: 150, h: 92, floors: 2, wall: "var(--region-downtown-band)", roof: DOWNTOWN, sign: "la station de métro et la gare" },
  { id: "itin-board", z: 39.5, side: -1, lat: 0.28, kind: "P", emoji: "🗺️", size: 74, label: "d'abord… enfin" },
  // ── Gourmet Market (stops 41–50) ──────────────────────────────────────────
  { id: "baguette", z: 40.5, side: 1, lat: 0.28, kind: "P", emoji: "🥖", size: 88, label: "une baguette" },
  { id: "market-hall", z: 43.0, side: -1, lat: 0.44, kind: "B", w: 160, h: 88, floors: 1, wall: KRAFT, roof: MARKET, sign: "le marché" },
  { id: "pharmacy", z: 47.5, side: 1, lat: 0.3, kind: "B", w: 78, h: 88, floors: 2, wall: "var(--tier-good-soft)", roof: "var(--tier-good)", sign: "➕ pharmacie" },
  { id: "restaurant", z: 48.5, side: -1, lat: 0.46, kind: "B", w: 162, h: 108, floors: 2, wall: PAPER, roof: MARKET, sign: "le restaurant" },
  // ── GramMarathon finish zone (after stop 50) ──────────────────────────────
  { id: "gm-flag-l", z: 51.3, side: -1, lat: 0.3, kind: "P", emoji: "🏁", size: 82 },
  { id: "gm-flag-r", z: 51.3, side: 1, lat: 0.3, kind: "P", emoji: "🏁", size: 82 },
  { id: "gm-trophy", z: 52.5, side: 1, lat: 0.32, kind: "P", emoji: "🏆", size: 90, label: "Félicitations !" },
  { id: "gm-medal", z: 53.2, side: -1, lat: 0.26, kind: "P", emoji: "🥇", size: 80, label: "Qui est le champion ?" },
];

/** Seeded pseudo-random in [0, 1): the same scene on every render. */
export function sRand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export type NatureType = "round" | "pine" | "bush";
export type NatureItem = { id: string; z: number; side: 1 | -1; lat: number; type: NatureType; size: number; giant?: boolean };

/** Trees and bushes along both verges, skipping where a prop stands. */
export function placeNature(items: RItem[] = ROADSIDE_ITEMS, until = 49.6): NatureItem[] {
  const out: NatureItem[] = [];
  let i = 0;
  let z = 0.1;
  let lastGiant = -9;
  while (z < until) {
    for (const side of [1, -1] as const) {
      const blocked = items.some((r) => r.side === side && Math.abs(r.z - z) < 0.85);
      if (!blocked && sRand(i * 3 + (side === 1 ? 0 : 17)) > 0.18) {
        const tr = sRand(i * 7 + (side === 1 ? 0 : 5));
        // GIANTS (Dan, 2026-08-20 round 10: "occasionally some items need to
        // be as tall as to reach nearly the top of the frame, trees are the
        // best items to do so"): now and then a verge slot grows a towering
        // pine — near the camera its crown brushes the frame's top. Seeded,
        // with a backstop so no stretch of road goes more than ~3 stops
        // without one.
        const giant = sRand(i * 17 + (side === 1 ? 0 : 7)) < 0.12 || z - lastGiant > 3.2;
        if (giant) lastGiant = z;
        const type: NatureType = giant ? "round" : tr < 0.42 ? "round" : tr < 0.7 ? "pine" : "bush";
        const lat = (giant ? 0.3 : 0.18) + sRand(i * 5 + (side === 1 ? 0 : 9)) * 0.18; // 0.18 – 0.36 (giants set back)
        const size = giant
          ? 96 + Math.round(sRand(i * 11 + (side === 1 ? 0 : 3)) * 24) // 96 – 120 px, high crown on a long trunk
          : 36 + Math.round(sRand(i * 11 + (side === 1 ? 0 : 3)) * 24); // 36 – 60 px
        out.push({ id: `n${i}${side}`, z, side, lat, type, size, ...(giant ? { giant: true } : {}) });
      }
    }
    z += 0.48 + sRand(i * 13) * 0.42; // gap 0.48 – 0.90 stops
    i++;
  }
  return out;
}

export const NATURE_ITEMS: NatureItem[] = placeNature();
