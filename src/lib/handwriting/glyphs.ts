/**
 * The « par Dr Chan » byline lettering (HomeDashboard), extrapolated to the
 * full character range French needs. Same conventions as the original
 * hand-authored strokes: pen strokes in writing order (stem before bowl),
 * baseline y=25, x-height top 13.5, ascenders/caps to 6, descenders to 32,
 * monoline with round caps; the italic slant comes from a group skewX(-8),
 * never from the paths. Print letters only — no cursive joins, per the
 * house type rule.
 *
 * Descenders and some accents (î, ï, y's tail) reach slightly left of x=0,
 * so renderers should leave ~6 units of left padding before the first glyph.
 */

export type Glyph = { strokes: string[]; w: number };

export const BASELINE = 25;
export const ASCENDER = 6;
export const DESCENDER = 32;
/** Gap between the ink of two neighbouring glyphs. */
export const LETTER_GAP = 4.5;
/** Advance of a word space. */
export const WORD_SPACE = 9;
/** Suggested viewBox height (descender + a little air). */
export const LINE_HEIGHT = 36;

/** A dot the pen taps out — zero-length stroke + round linecap. */
const dot = (x: number, y: number) => `M${x},${y} L${x},${y + 0.01}`;

/* Accents, positioned by the centre x of the base glyph. Lowercase marks
 * live between the x-height (13.5) and 7.8; capital marks squeeze above the
 * cap line (6). The global skew slants them with the letter. */
const acute = (cx: number) => `M${cx - 2},11.2 L${cx + 1.8},7.8`;
const grave = (cx: number) => `M${cx - 1.8},7.8 L${cx + 2},11.2`;
const circ = (cx: number) => `M${cx - 3},11.4 L${cx},7.8 L${cx + 3},11.4`;
const trema = (cx: number) => [dot(cx - 2.4, 9.6), dot(cx + 2.4, 9.6)];
const acuteCap = (cx: number) => `M${cx - 2},4.6 L${cx + 1.8},1.2`;
const graveCap = (cx: number) => `M${cx - 1.8},1.2 L${cx + 2},4.6`;
const circCap = (cx: number) => `M${cx - 3},4.8 L${cx},1.2 L${cx + 3},4.8`;
const tremaCap = (cx: number) => [dot(cx - 2.4, 3), dot(cx + 2.4, 3)];
const cedilla = (cx: number) =>
  `M${cx},25.8 C${cx + 0.3},27 ${cx + 2.1},27 ${cx + 1.9},28.4 C${cx + 1.7},29.9 ${cx - 0.9},30.1 ${cx - 1.7},29.1`;

const G: Record<string, Glyph> = {
  /* ---- minuscules ---- */
  a: { strokes: ["M8,15 C4,12 0,14.5 0,19 C0,23.5 4,26 8,22.5", "M8.5,13.5 L8.5,25"], w: 8.5 },
  b: { strokes: ["M0,6 L0,25", "M0,15.5 C2,12.5 8,12.5 8,18.5 C8,24.5 2,24.5 0,21.5"], w: 8 },
  c: { strokes: ["M7.5,15 C3,12 0,14.8 0,19 C0,23.2 3,26 7.5,23.2"], w: 7.5 },
  d: { strokes: ["M8,15 C4,12 0,14.5 0,19 C0,23.5 4,26 8,22.5", "M8.5,6 L8.5,25"], w: 8.5 },
  e: {
    strokes: [
      "M0.3,19.3 L7.7,19.3",
      "M7.7,19.3 C7.7,14.6 4.4,12.6 2,14.6 C-0.3,16.6 -0.4,22.6 2.6,24.8 C5,26.3 7,25.3 7.9,24",
    ],
    w: 8,
  },
  f: { strokes: ["M6.8,7.2 C4.6,5.2 2.6,6.4 2.6,9 L2.6,25", "M0,13.5 L6,13.5"], w: 7 },
  g: {
    strokes: [
      "M8,15 C4,12 0,14.5 0,19 C0,23.5 4,26 8,22.5",
      "M8.5,13.5 L8.5,28.5 C8.5,31.8 4.8,32.6 2.5,30.8",
    ],
    w: 8.5,
  },
  h: { strokes: ["M0,6 L0,25", "M0,17.5 C1,13.5 8,12 8,18 L8,25"], w: 8 },
  i: { strokes: ["M0.5,13.5 L0.5,25", dot(0.5, 9.3)], w: 1 },
  j: { strokes: ["M4.6,13.5 L4.6,28.5 C4.6,31.8 1.2,32.6 0,30.6", dot(4.6, 9.3)], w: 5 },
  k: { strokes: ["M0,6 L0,25", "M7,14 L0.2,19.8 L7.5,25"], w: 7.5 },
  l: { strokes: ["M0.5,6 L0.5,25"], w: 1 },
  m: {
    strokes: [
      "M0,13.5 L0,25",
      "M0,17.5 C0.8,14 6,12.8 6,17.8 L6,25",
      "M6,17.5 C6.8,14 12,12.8 12,17.8 L12,25",
    ],
    w: 12,
  },
  n: { strokes: ["M0,13.5 L0,25", "M0,17.5 C1,13.5 8,12 8,18 L8,25"], w: 8 },
  o: {
    strokes: [
      "M4,13 C1.3,13 0,15.8 0,19.2 C0,22.6 1.4,25.6 4,25.6 C6.6,25.6 8,22.6 8,19.2 C8,15.8 6.7,13 4,13",
    ],
    w: 8,
  },
  p: { strokes: ["M0,13.5 L0,32", "M0,15.5 C2,12.5 8,12.5 8,18.5 C8,24.5 2,24.5 0,21.5"], w: 8 },
  q: { strokes: ["M8,15 C4,12 0,14.5 0,19 C0,23.5 4,26 8,22.5", "M8.5,13.5 L8.5,32"], w: 8.5 },
  r: { strokes: ["M0,13.5 L0,25", "M0,18 C1,14 4,12.5 6.5,14"], w: 6.5 },
  s: {
    strokes: ["M6.6,14.6 C3.4,12.4 0.6,13.6 0.6,15.9 C0.6,18.2 6.4,19.3 6.4,21.9 C6.4,24.6 3,26.2 0,23.8"],
    w: 7,
  },
  t: { strokes: ["M2.6,8.5 L2.6,21.8 C2.6,24.8 4.8,25.9 7,24.4", "M0,13.5 L6.2,13.5"], w: 7 },
  u: { strokes: ["M0,13.5 L0,20.5 C0,25.2 6.3,26.6 8,21.4", "M8,13.5 L8,25"], w: 8 },
  v: { strokes: ["M0,13.5 L4,25 L8,13.5"], w: 8 },
  w: { strokes: ["M0,13.5 L2.8,25 L6,15.5 L9.2,25 L12,13.5"], w: 12 },
  x: { strokes: ["M0,13.5 L7.5,25", "M7.5,13.5 L0,25"], w: 7.5 },
  y: { strokes: ["M0,13.5 L4.2,25", "M8,13.5 L3.4,28.8 C2.4,31.4 0.6,32.3 -0.8,31.2"], w: 8 },
  z: { strokes: ["M0,13.5 L7.2,13.5 L0,25 L7.5,25"], w: 7.5 },

  /* ---- majuscules ---- */
  A: { strokes: ["M0,25 L5.5,6 L11,25", "M2.6,17.5 L8.6,17.5"], w: 11 },
  B: {
    strokes: [
      "M0,6 L0,25",
      "M0,6 C7,6 8.4,8.2 8.4,10.4 C8.4,13.3 5.5,14.9 0,14.9",
      "M0,14.9 C6.5,14.9 9.5,16.6 9.5,19.7 C9.5,23 7.4,25 0,25",
    ],
    w: 9.5,
  },
  C: { strokes: ["M11,9 C4,4.5 0,9 0,15.5 C0,22 4,26.5 11,22"], w: 11 },
  D: { strokes: ["M0,6 L0,25", "M0,6 C11,6 13,12 13,15.5 C13,19 11,25 0,25"], w: 13 },
  E: { strokes: ["M0,6 L0,25", "M0,6 L9.5,6", "M0,15.2 L8.2,15.2", "M0,25 L9.5,25"], w: 9.5 },
  F: { strokes: ["M0,6 L0,25", "M0,6 L9.5,6", "M0,15.2 L8.2,15.2"], w: 9.5 },
  G: {
    strokes: [
      "M11,9 C4,4.5 0,9 0,15.5 C0,21.5 3.4,26 8.4,24.6 C10.4,24 11,22 11,20 L11,16.8",
      "M6.6,16.8 L11,16.8",
    ],
    w: 11,
  },
  H: { strokes: ["M0,6 L0,25", "M10,6 L10,25", "M0,15.2 L10,15.2"], w: 10 },
  I: { strokes: ["M0.5,6 L0.5,25"], w: 1 },
  J: { strokes: ["M6.6,6 L6.6,20.6 C6.6,25 2,26.6 0,23.4"], w: 7 },
  K: { strokes: ["M0,6 L0,25", "M9.4,6 L0.2,16.8 L10,25"], w: 10 },
  L: { strokes: ["M0,6 L0,25 L8.8,25"], w: 9 },
  M: { strokes: ["M0,25 L0,6", "M0,6 L6,20.5 L12,6", "M12,6 L12,25"], w: 12 },
  N: { strokes: ["M0,25 L0,6", "M0,6 L10,25", "M10,25 L10,6"], w: 10 },
  O: {
    strokes: [
      "M5.5,5.6 C1.8,5.6 0,10 0,15.5 C0,21 1.8,25.4 5.5,25.4 C9.2,25.4 11,21 11,15.5 C11,10 9.2,5.6 5.5,5.6",
    ],
    w: 11,
  },
  P: { strokes: ["M0,6 L0,25", "M0,6 C7.6,6 9.5,8.4 9.5,11.2 C9.5,14.4 7,16.2 0,16.2"], w: 9.5 },
  Q: {
    strokes: [
      "M5.5,5.6 C1.8,5.6 0,10 0,15.5 C0,21 1.8,25.4 5.5,25.4 C9.2,25.4 11,21 11,15.5 C11,10 9.2,5.6 5.5,5.6",
      "M6.8,21.6 L11.8,27",
    ],
    w: 11.5,
  },
  R: {
    strokes: ["M0,6 L0,25", "M0,6 C7.6,6 9.5,8.4 9.5,11.2 C9.5,14.4 7,16.2 0,16.2", "M3.8,16.2 L10,25"],
    w: 10,
  },
  S: {
    strokes: ["M9,9.2 C4.6,5.6 0.6,7.4 0.6,10.4 C0.6,13.4 9.4,15.2 9.4,19.2 C9.4,23.2 4.4,26.2 0,22.6"],
    w: 9.5,
  },
  T: { strokes: ["M5,6 L5,25", "M0,6 L10,6"], w: 10 },
  U: { strokes: ["M0,6 L0,18.6 C0,24.2 2.8,26 5.5,26 C8.2,26 11,24.2 11,18.6 L11,6"], w: 11 },
  V: { strokes: ["M0,6 L5.5,25 L11,6"], w: 11 },
  W: { strokes: ["M0,6 L3.8,25 L7.5,10.5 L11.2,25 L15,6"], w: 15 },
  X: { strokes: ["M0,6 L10,25", "M10,6 L0,25"], w: 10 },
  Y: { strokes: ["M0,6 L5,15.8 L10,6", "M5,15.8 L5,25"], w: 10 },
  Z: { strokes: ["M0,6 L9.8,6 L0,25 L10,25"], w: 10 },

  /* ---- chiffres ---- */
  "0": {
    strokes: [
      "M4.5,5.6 C1.4,5.6 0,10 0,15.5 C0,21 1.4,25.4 4.5,25.4 C7.6,25.4 9,21 9,15.5 C9,10 7.6,5.6 4.5,5.6",
    ],
    w: 9,
  },
  "1": { strokes: ["M0,9.6 C1.8,9 3.4,7.6 4.4,6 L4.4,25"], w: 5 },
  "2": { strokes: ["M0,9.8 C0.4,5.4 8,4.6 8,9.6 C8,13.6 2.2,18 0,25 L8.5,25"], w: 8.5 },
  "3": {
    strokes: [
      "M0,8.6 C2.4,5 8,5.6 8,9.4 C8,12.8 5,14.4 3.2,14.4 C5.2,14.4 8.5,15.9 8.5,19.7 C8.5,24.4 2.4,26.4 0,22.6",
    ],
    w: 8.5,
  },
  "4": { strokes: ["M6.6,6 L0,18.8 L9,18.8", "M6.6,6 L6.6,25"], w: 9 },
  "5": { strokes: ["M7.8,6 L1.6,6 L0.9,13.8 C3.4,11.9 8.5,12.9 8.5,18.3 C8.5,24 2.6,26.3 0,22.9"], w: 8.5 },
  "6": {
    strokes: [
      "M7.4,6.4 C3,9.6 0,14.4 0,19.4 C0,23 2,25.7 4.5,25.7 C7,25.7 8.7,23.4 8.7,20.1 C8.7,14.8 2.7,14.2 0.6,17.6",
    ],
    w: 8.7,
  },
  "7": { strokes: ["M0,6 L9,6 L3.2,25"], w: 9 },
  "8": {
    strokes: [
      "M4.5,14.4 C1.6,13.2 0.7,11.2 0.7,9.8 C0.7,5 8.3,5 8.3,9.8 C8.3,11.2 7.4,13.2 4.5,14.4 C1.1,15.8 0,18.2 0,20.4 C0,26.2 9,26.2 9,20.4 C9,18.2 7.9,15.8 4.5,14.4",
    ],
    w: 9,
  },
  "9": {
    strokes: [
      "M1.3,25.3 C5.7,22.1 8.7,17.3 8.7,12.3 C8.7,8.7 6.7,6 4.2,6 C1.7,6 0,8.3 0,11.6 C0,16.9 6,17.5 8.1,14.1",
    ],
    w: 8.7,
  },

  /* ---- ponctuation ---- */
  ".": { strokes: [dot(0.2, 24.7)], w: 0.5 },
  ",": { strokes: ["M1.4,24 C1.9,25.8 1.4,28.2 0,29.4"], w: 1.6 },
  ";": { strokes: [dot(1.4, 15.8), "M1.4,24 C1.9,25.8 1.4,28.2 0,29.4"], w: 1.6 },
  ":": { strokes: [dot(0.2, 16), dot(0.2, 24.7)], w: 0.5 },
  "!": { strokes: ["M0.5,6 L0.5,19.6", dot(0.5, 24.7)], w: 1 },
  "?": { strokes: ["M0,9.4 C0.6,4.6 8,4.8 8,9.6 C8,13 4.2,13.4 4.2,17.4 L4.2,19.6", dot(4.2, 24.7)], w: 8 },
  "'": { strokes: ["M1.4,6 C1.9,7.8 1.4,10.2 0,11.4"], w: 1.6 },
  "‘": { strokes: ["M0.4,6 C-0.1,7.8 0.4,10.2 1.8,11.4"], w: 1.8 },
  '"': { strokes: ["M1.4,6 C1.9,7.8 1.4,10.2 0,11.4", "M4.4,6 C4.9,7.8 4.4,10.2 3,11.4"], w: 4.6 },
  "“": { strokes: ["M0.4,6 C-0.1,7.8 0.4,10.2 1.8,11.4", "M3.4,6 C2.9,7.8 3.4,10.2 4.8,11.4"], w: 4.8 },
  "«": { strokes: ["M3.6,14.5 L0,19.4 L3.6,24.3", "M8.5,14.5 L4.9,19.4 L8.5,24.3"], w: 8.5 },
  "»": { strokes: ["M0,14.5 L3.6,19.4 L0,24.3", "M4.9,14.5 L8.5,19.4 L4.9,24.3"], w: 8.5 },
  "-": { strokes: ["M0,17.8 L5.5,17.8"], w: 5.5 },
  "–": { strokes: ["M0,17.8 L8,17.8"], w: 8 },
  "—": { strokes: ["M0,17.8 L12,17.8"], w: 12 },
  "(": { strokes: ["M3.5,4.6 C0.2,10.4 0.2,21.4 3.5,27.4"], w: 3.5 },
  ")": { strokes: ["M0,4.6 C3.3,10.4 3.3,21.4 0,27.4"], w: 3.5 },
  "€": {
    strokes: ["M10,9 C4.4,4.8 1,9 1,15.5 C1,22 4.4,26.2 10,22.4", "M0,13.6 L6.8,13.6", "M0,17.6 L6.2,17.6"],
    w: 10,
  },
  "°": {
    strokes: [
      "M2,6.2 C0.9,6.2 0.3,7.1 0.3,8.2 C0.3,9.3 0.9,10.2 2,10.2 C3.1,10.2 3.7,9.3 3.7,8.2 C3.7,7.1 3.1,6.2 2,6.2",
    ],
    w: 4,
  },
  "…": { strokes: [dot(0.2, 24.7), dot(3.4, 24.7), dot(6.6, 24.7)], w: 6.8 },

  /* ---- ligatures ---- */
  "œ": {
    // œ — the o and the e share their middle wall
    strokes: [
      "M3.5,13 C1.1,13 0,15.8 0,19.2 C0,22.6 1.2,25.6 3.5,25.6 C5.8,25.6 7,22.6 7,19.2 C7,15.8 5.9,13 3.5,13",
      "M7,19.3 L14.5,19.3",
      "M14.5,19.3 C14.5,14.6 11.4,12.6 9,14.6 C7.6,15.8 7,17.4 7,19.2",
      "M7,19.2 C7,21.6 7.8,23.8 9.4,24.8 C11.6,26.2 13.6,25.3 14.5,24",
    ],
    w: 14.5,
  },
  "æ": {
    // æ — the a lends its stem to the e
    strokes: [
      "M8,15 C4,12 0,14.5 0,19 C0,23.5 4,26 8,22.5",
      "M8.5,13.5 L8.5,25",
      "M8.5,19.3 L15.8,19.3",
      "M15.8,19.3 C15.8,14.6 12.7,12.6 10.3,14.6 C9.2,15.5 8.6,17 8.5,18.6",
      "M8.6,20.6 C8.9,22.6 9.8,24.2 11,24.9 C13,26.1 14.9,25.2 15.8,24",
    ],
    w: 15.8,
  },
  "Œ": {
    strokes: [
      "M4.5,5.6 C1.4,5.6 0,10 0,15.5 C0,21 1.4,25.4 4.5,25.4 C7.6,25.4 9,21 9,15.5 C9,10 7.6,5.6 4.5,5.6",
      "M9,6 L9,25",
      "M9,6 L17.5,6",
      "M9,15.2 L16.2,15.2",
      "M9,25 L17.5,25",
    ],
    w: 17.5,
  },
  "Æ": {
    strokes: [
      "M0,25 L9,6",
      "M9,6 L9,25",
      "M9,6 L16.5,6",
      "M9,15.2 L15.5,15.2",
      "M9,25 L16.5,25",
      "M3.5,17.5 L9,17.5",
    ],
    w: 16.5,
  },
};

/* ---- accents composés ---- */
const IDOTLESS: Glyph = { strokes: ["M0.5,13.5 L0.5,25"], w: 1 };
const compose = (base: Glyph, marks: string | string[]): Glyph => ({
  strokes: [...base.strokes, ...(Array.isArray(marks) ? marks : [marks])],
  w: base.w,
});
const cx = (g: Glyph) => g.w / 2;

G["é"] = compose(G.e, acute(cx(G.e))); // é
G["è"] = compose(G.e, grave(cx(G.e))); // è
G["ê"] = compose(G.e, circ(cx(G.e))); // ê
G["ë"] = compose(G.e, trema(cx(G.e))); // ë
G["à"] = compose(G.a, grave(cx(G.a))); // à
G["â"] = compose(G.a, circ(cx(G.a))); // â
G["ç"] = compose(G.c, cedilla(3.9)); // ç
G["î"] = compose(IDOTLESS, circ(0.5)); // î
G["ï"] = compose(IDOTLESS, trema(0.5)); // ï
G["ô"] = compose(G.o, circ(cx(G.o))); // ô
G["ù"] = compose(G.u, grave(cx(G.u))); // ù
G["û"] = compose(G.u, circ(cx(G.u))); // û
G["ü"] = compose(G.u, trema(cx(G.u))); // ü
G["ÿ"] = compose(G.y, trema(cx(G.y))); // ÿ
G["É"] = compose(G.E, acuteCap(cx(G.E))); // É
G["È"] = compose(G.E, graveCap(cx(G.E))); // È
G["Ê"] = compose(G.E, circCap(cx(G.E))); // Ê
G["Ë"] = compose(G.E, tremaCap(cx(G.E))); // Ë
G["À"] = compose(G.A, graveCap(cx(G.A))); // À
G["Â"] = compose(G.A, circCap(cx(G.A))); // Â
G["Ç"] = compose(G.C, cedilla(5)); // Ç
G["Î"] = compose(G.I, circCap(0.5)); // Î
G["Ï"] = compose(G.I, tremaCap(0.5)); // Ï
G["Ô"] = compose(G.O, circCap(cx(G.O))); // Ô
G["Ù"] = compose(G.U, graveCap(cx(G.U))); // Ù
G["Û"] = compose(G.U, circCap(cx(G.U))); // Û
G["Ü"] = compose(G.U, tremaCap(cx(G.U))); // Ü
G["Ÿ"] = compose(G.Y, tremaCap(cx(G.Y))); // Ÿ
// Curly right quote/apostrophe and closing double quote reuse the straight ones.
G["’"] = G["'"];
G["”"] = G['"'];

export const GLYPHS: Record<string, Glyph> = G;

export type LaidOutGlyph = { ch: string; x: number; strokes: string[] };

/** Lay a line of text out on the baseline: per-glyph x offsets + total width. */
export function layoutLine(text: string): { glyphs: LaidOutGlyph[]; width: number } {
  const glyphs: LaidOutGlyph[] = [];
  let x = 0;
  for (const ch of text) {
    if (ch === " " || ch === " ") {
      x += WORD_SPACE;
      continue;
    }
    if (ch === " " || ch === " ") {
      // narrow no-break space, as before ! ? ; : « »
      x += WORD_SPACE * 0.6;
      continue;
    }
    const g = GLYPHS[ch];
    if (!g) continue; // outside the repertoire: skip rather than tofu
    glyphs.push({ ch, x, strokes: g.strokes });
    x += g.w + LETTER_GAP;
  }
  return { glyphs, width: glyphs.length ? x - LETTER_GAP : 0 };
}
