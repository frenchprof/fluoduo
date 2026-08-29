/**
 * The 3D course map's sky — driven by the learner's REAL local clock (Dan's
 * Figma Make, 19 Aug 2026): eight keyframes over 24 h, interpolated per
 * minute; the sun rises at 6, peaks at 12, sets at 20 and the moon takes
 * over. Pure maths, no React.
 *
 * Colour, and the hex ratchet (verify19b): the sky is not a design-system
 * colour — it is a COMPUTED gradient, 8 keyframes × 4 channels that blend
 * continuously, so no token could name it (a token is one value; this is a
 * function of the hour). The keyframes are therefore stored as the numeric
 * RGB triples the interpolation needs and emitted as `rgb()` strings; there
 * is no hex literal here because there is nothing here a token should
 * replace, not to slip under the count. Everything else in the 3D view that
 * IS a palette colour (region accents, ground, road, trees, rings) reads a
 * Cahier / region / tier token. Decided by the PM port, 19 Aug 2026.
 */

export type Rgb = readonly [number, number, number];

export type SkyKeyframe = {
  /** Hour anchor, 0..24. */
  h: number;
  top: Rgb;
  mid: Rgb;
  hor: Rgb;
  sun: Rgb;
  isDay: boolean;
};

/** Eight keyframes (+ the midnight wrap) — Dan's values. */
export const SKY_KF: SkyKeyframe[] = [
  { h: 0, top: [8, 12, 36], mid: [14, 18, 56], hor: [28, 34, 85], sun: [212, 220, 240], isDay: false }, // midnight
  { h: 4, top: [10, 14, 48], mid: [26, 16, 80], hor: [61, 26, 106], sun: [200, 184, 232], isDay: false }, // deep night
  { h: 6, top: [192, 80, 42], mid: [232, 146, 74], hor: [255, 216, 160], sun: [255, 232, 120], isDay: true }, // dawn
  { h: 8, top: [21, 101, 192], mid: [66, 165, 245], hor: [179, 229, 252], sun: [255, 238, 88], isDay: true }, // morning
  { h: 12, top: [13, 71, 161], mid: [25, 118, 210], hor: [130, 199, 234], sun: [255, 253, 231], isDay: true }, // noon
  { h: 16, top: [26, 58, 143], mid: [76, 111, 203], hor: [160, 184, 224], sun: [255, 224, 178], isDay: true }, // afternoon
  { h: 19, top: [106, 26, 26], mid: [192, 69, 42], hor: [255, 140, 74], sun: [255, 213, 79], isDay: false }, // sunset
  { h: 21, top: [20, 8, 48], mid: [34, 14, 80], hor: [42, 20, 72], sun: [176, 168, 216], isDay: false }, // evening
  { h: 24, top: [8, 12, 36], mid: [14, 18, 56], hor: [28, 34, 85], sun: [212, 220, 240], isDay: false }, // midnight (wrap)
];

const lerp = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

export const rgb = (c: Rgb) => `rgb(${c[0]} ${c[1]} ${c[2]})`;

export type SkyColors = { top: string; mid: string; hor: string; sun: string; isDay: boolean; night: number };

/** Sky at `hour` (0..24, fractional minutes included). */
export function getSkyColors(hour: number): SkyColors {
  const h = ((hour % 24) + 24) % 24;
  let lo = SKY_KF.length - 2;
  let hi = SKY_KF.length - 1;
  for (let i = 0; i < SKY_KF.length - 1; i++) {
    if (h >= SKY_KF[i].h && h < SKY_KF[i + 1].h) {
      lo = i;
      hi = i + 1;
      break;
    }
  }
  const a = SKY_KF[lo];
  const b = SKY_KF[hi];
  const f = (h - a.h) / (b.h - a.h);
  return {
    top: rgb(lerp(a.top, b.top, f)),
    mid: rgb(lerp(a.mid, b.mid, f)),
    hor: rgb(lerp(a.hor, b.hor, f)),
    sun: rgb(lerp(a.sun, b.sun, f)),
    isDay: f < 0.5 ? a.isDay : b.isDay,
    night: nightness(h),
  };
}

/** 0 = full day, 1 = full night (ramps over dawn 5–7 and dusk 18–21). */
export function nightness(hour: number): number {
  const h = ((hour % 24) + 24) % 24;
  if (h < 5) return 1;
  if (h < 7) return 1 - (h - 5) / 2;
  if (h < 18) return 0;
  if (h < 21) return (h - 18) / 3;
  return 1;
}

/** Position of the body that is up, as fractions of the sky area (x of
 *  width, y of the horizon height): the sun rises at 6 h, peaks at 12, sets
 *  at 20; the moon rises at 20, peaks at 1, sets at 6. */
export function sunPosition(hour: number): { x: number; y: number; arc: number } {
  const h = ((hour % 24) + 24) % 24;
  const t = h >= 6 && h < 20 ? (h - 6) / 14 : ((h + 4) % 24) / 10; // 20 → 6 is 10 h
  const arc = Math.sin(t * Math.PI);
  return { x: 0.08 + t * 0.84, y: 0.92 - arc * 0.76, arc };
}

/** A fixed field of stars (fractions of the sky area) — shown by `night`. */
export const STARS: { x: number; y: number; r: number }[] = Array.from({ length: 42 }, (_, i) => {
  const a = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const b = Math.sin(i * 39.346 + 11.135) * 43758.5453;
  return { x: a - Math.floor(a), y: (b - Math.floor(b)) * 0.85, r: 0.6 + ((i * 7) % 3) * 0.4 };
});

/** Static cloud anchors (fractions of the sky area). */
export const CLOUDS = [
  { cx: 0.18, cy: 0.22, rx: 0.11, ry: 0.045 },
  { cx: 0.5, cy: 0.12, rx: 0.14, ry: 0.05 },
  { cx: 0.74, cy: 0.3, rx: 0.09, ry: 0.038 },
  { cx: 0.88, cy: 0.08, rx: 0.07, ry: 0.032 },
];

/** The local clock as a fractional hour; `?hour=N` (dev / screenshots) wins. */
export function clockHour(search?: string): number {
  if (search) {
    const q = new URLSearchParams(search).get("hour");
    if (q !== null && q !== "" && isFinite(Number(q))) return ((Number(q) % 24) + 24) % 24;
  }
  const n = new Date();
  return n.getHours() + n.getMinutes() / 60;
}
