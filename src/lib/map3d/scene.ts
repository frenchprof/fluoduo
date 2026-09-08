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

export type NatureType = "round" | "pine" | "bush" | "grass";
export type NatureItem = { id: string; z: number; side: 1 | -1; lat: number; type: NatureType; size: number; giant?: boolean };

/**
 * Trees and bushes along both verges, skipping where a prop stands.
 *
 * IT STARTS BEFORE THE ROAD DOES (8 Sep). Every pass below used to begin at
 * z ≈ 0.1–0.2, which reads as "the start of the course" and is not where the
 * CAMERA starts: the camera sits about 1.16 stops behind stop 1 so the current
 * goal stands whole near the bottom edge, and it can be dragged a further
 * MAX_BEHIND back. So the nearest 1.3 stops of ground — the bottom fifth of
 * the frame, where the picture is biggest — had nothing planted in it AT ALL,
 * on the one view every learner and every visitor to the landing page meets
 * first. Measured before: 196 nature sprites on a 1440×900 scene, 116 of them
 * packed in one band at the horizon and ZERO below 80% of the frame.
 *
 * `FROM` is negative for that reason. `pathXAt` clamps to the fifty stops, so
 * the road runs dead straight back there and the scenery simply lines it.
 */
const FROM = -2.6;

/**
 * WHERE A WORLD'S GATE SIGN STANDS — « WELCOME VILLAGE · 0/10 » and its four
 * siblings. The renderer puts one just before each region's first stop, at
 * `unit * 10 - 0.6`, and it is the only text in the scene that says WHERE you
 * are, so nothing may stand in front of it.
 *
 * It matters now and did not before: the first gate is at z = -0.6, which was
 * outside the planted range until `FROM` went negative, and the very first
 * near tree planted there covered the sign on the landing page. Depth was not
 * the bug — the tree really is nearer — so raising the sign's z-index would
 * have been a lie about the scene. Clearing a slot is the truthful fix.
 *
 * TREES ONLY. Grass is ankle-high and cannot hide a sign; excluding it too
 * would leave a bald patch at each gate, which is the fault this whole change
 * set out to remove.
 */
const GATE_Z = [0, 1, 2, 3, 4].map((unit) => unit * 10 - 0.6);
const nearGate = (z: number) => GATE_Z.some((g) => Math.abs(z - g) < 0.55);

export function placeNature(items: RItem[] = ROADSIDE_ITEMS, until = 49.6): NatureItem[] {
  const out: NatureItem[] = [];
  let i = 0;
  let z = FROM;
  let lastGiant = -9;
  while (z < until) {
    for (const side of [1, -1] as const) {
      const blocked = items.some((r) => r.side === side && Math.abs(r.z - z) < 0.85) || nearGate(z);
      if (!blocked && sRand(i * 3 + (side === 1 ? 0 : 17)) > 0.10) {
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
        // THE OPEN COUNTRY GETS DRESSED TOO (Dan, 7 Sep: "the scenery is
        // looking pretty empty at the moment. it can afford to have more
        // density"). Every item used to sit at lat 0.18–0.36 — hugging the
        // verge. That was invisible while the road filled the frame; once the
        // road stopped widening with the window, the land beyond the verge was
        // revealed and there was nothing in it. A share of the items now stand
        // well out in the fields, where perspective makes them read as
        // distance rather than clutter.
        const outField = sRand(i * 23 + (side === 1 ? 0 : 11)) < 0.42;
        const r = sRand(i * 5 + (side === 1 ? 0 : 9));
        const lat = giant ? 0.3 + r * 0.18 : outField ? 0.46 + r * 0.5 : 0.18 + r * 0.2;
        const size = giant
          ? 96 + Math.round(sRand(i * 11 + (side === 1 ? 0 : 3)) * 24) // 96 – 120 px, high crown on a long trunk
          : 36 + Math.round(sRand(i * 11 + (side === 1 ? 0 : 3)) * 24); // 36 – 60 px
        out.push({ id: `n${i}${side}`, z, side, lat, type, size, ...(giant ? { giant: true } : {}) });
      }
    }
    z += 0.31 + sRand(i * 13) * 0.32; // gap 0.31 – 0.63 stops — denser since 7 Sep
    i++;
  }
  // THE FAR FIELD (Dan, 8 Sep: "the scenery is still bare esp. on the
  // landscape side of things"). The pass above tops out at lat 0.96, which
  // was generous while the road filled the frame. It is not any more: on a
  // 1440-wide screen the visible ground runs out to roughly lat 2.5, so
  // everything past 0.96 was guaranteed bare grass — and the wider the
  // window, the more of the picture was that guarantee.
  //
  // This second pass dresses 1.0–2.6 on both verges. It is deliberately its
  // own loop rather than a wider `lat` on the first: the far field wants its
  // OWN spacing (looser, since perspective packs it together anyway) and its
  // own mix (no giants — a towering pine two lanes out reads as a mistake,
  // not as distance). A phone never sees past about lat 1.25, so these cost
  // it nothing but a cull.
  let j = 0;
  let fz = FROM;
  while (fz < until) {
    for (const side of [1, -1] as const) {
      if (!nearGate(fz) && sRand(j * 31 + (side === 1 ? 0 : 13)) > 0.28) {
        const tr = sRand(j * 19 + (side === 1 ? 0 : 3));
        // REAL, FULL-HEIGHT TREES OUT THERE (Dan, 8 Sep: "grass and real
        // full-height trees"). The first draft of this pass planted 30–56px
        // saplings, which at that distance read as shrubbery — the land looked
        // mown rather than wooded. A far field is full of ordinary big trees;
        // perspective is what makes them small, not their being small.
        const tallOne = sRand(j * 43 + (side === 1 ? 0 : 17)) < 0.34;
        const type: NatureType = tr < 0.4 ? "round" : tr < 0.78 ? "pine" : "bush";
        const lat = 1.0 + sRand(j * 29 + (side === 1 ? 0 : 23)) * 1.6; // 1.0 – 2.6
        const size = tallOne
          ? 84 + Math.round(sRand(j * 37 + (side === 1 ? 0 : 9)) * 34) // 84 – 118, a proper tree
          : 44 + Math.round(sRand(j * 37 + (side === 1 ? 0 : 9)) * 30); // 44 – 74
        out.push({ id: `f${j}${side}`, z: fz, side, lat, type, size, ...(tallOne ? { giant: true } : {}) });
      }
    }
    fz += 0.42 + sRand(j * 41) * 0.5;
    j++;
  }
  // GRASS (Dan, 8 Sep). Trees alone leave the ground a flat colour field. Low
  // tufts, thick and close together, are what makes it read as GROUND — and
  // they carry the perspective, because a near tuft is inches high on screen
  // and a far one is a speck. Five per slot across the whole width, both
  // sides, on their own tight spacing.
  //
  // THE SIZES SAY WHAT THE COMMENT ALREADY CLAIMED. 12–26px is a speck at the
  // horizon AND a speck underfoot: at the camera a tuft drew 23px tall on a
  // 900px frame, which is not "inches high", it is lawn seen from a first-floor
  // window. 22–52 gives the near ground a foreground to be, and costs the
  // distance nothing — perspective divides it away.
  //
  // AND THEY LEAN TOWARD THE KERB. The lateral was spread evenly from 0.16 to
  // 2.56, so only about a quarter of every slot's tufts landed in the band
  // beside the road — the part of the ground the camera is closest to and sees
  // most of. Squaring the random pulls the distribution in without capping it:
  // the far field still gets its speckle, the verge gets a bank of grass.
  let g = 0;
  let gz = FROM;
  while (gz < until) {
    for (const side of [1, -1] as const) {
      for (let k = 0; k < 5; k++) {
        const seed = g * 53 + k * 7 + (side === 1 ? 0 : 29);
        if (sRand(seed) > 0.34) {
          const spread = sRand(seed * 5);
          out.push({
            id: `g${g}${side}${k}`,
            z: gz + sRand(seed * 3) * 0.18,
            side,
            lat: 0.16 + spread * spread * 2.4, // kerb to far field, weighted to the kerb
            type: "grass",
            size: 22 + Math.round(sRand(seed * 11) * 30),
          });
        }
      }
    }
    gz += 0.16 + sRand(g * 61) * 0.14;
    g++;
  }
  return out;
}

export const NATURE_ITEMS: NatureItem[] = placeNature();
