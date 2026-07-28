/**
 * NumBus routes. Each line is a place where French numbers get shouted at you
 * and nobody around you understands them, arranged so the numbers grow as you
 * travel out from the city stop:
 *
 *   Arrêt Mermoz   1–99      the bus you catch every morning
 *   Gare routière  100–999   regional coaches
 *   Gare SNCF      1 000+    train numbers, then departure times
 *   Guichet                  fares — euros and centimes
 *   Objets trouvés           a phone number, read in French pairs
 *   Dépôt de nuit  10 000+   thousands and millions on the counter
 *
 * A line only has to produce rounds; the game itself knows nothing about
 * fares or timetables — it just displays digits on a blind and grades them.
 */

import { explain, frenchNumber, frenchPhone, frenchPrice, frenchTime } from "./frenchNumber";

/** The shape of the destination blind: a number is that many digit cells, a
 *  string is a fixed separator painted between them. */
export type Blind = (number | string)[];

export type NumBusRound = {
  /** What the tannoy says, in French. */
  say: string;
  /** The number in French words alone — shown when the answer is revealed. */
  words: string;
  /** The answer, digits only, zero-padded to the blind's width. */
  digits: string;
  blind: Blind;
  /** Painted after the last cell, e.g. "€". */
  suffix?: string;
  why: string[];
};

export type NumBusLine = {
  id: string;
  /** Route name on the sign. */
  label: string;
  /** Where you are standing. */
  place: string;
  /** The range chip on the gallery tile. */
  scale: string;
  /** Which unit's numbers this drills, or null for an extra. */
  unit: number | null;
  emoji: string;
  vehicle: "bus" | "car" | "train";
  backdrop: "jour" | "crepuscule" | "gare" | "nuit";
  /** How long the vehicle waits at the stop. */
  seconds: number;
  next: () => NumBusRound;
};

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

export const blindWidth = (blind: Blind): number =>
  blind.reduce<number>((n, part) => n + (typeof part === "number" ? part : 0), 0);

const digitsOf = (value: number, blind: Blind) => String(value).padStart(blindWidth(blind), "0");

/** Digit cells grouped in threes from the right, the way a counter reads. */
function groupedBlind(value: number): Blind {
  const s = String(value);
  const head = s.length % 3 || 3;
  const out: Blind = [head];
  for (let i = head; i < s.length; i += 3) out.push(" ", 3);
  return out;
}

function plain(value: number, blind: Blind, say: (words: string) => string): NumBusRound {
  const words = frenchNumber(value);
  return { say: say(words), words, digits: digitsOf(value, blind), blind, why: explain(value) };
}

/* ── the lines ─────────────────────────────────────────────────────────── */

export const NUMBUS_LINES: NumBusLine[] = [
  {
    id: "ligne-a",
    label: "Ligne A",
    place: "Arrêt Mermoz",
    scale: "1 – 20",
    unit: 0,
    emoji: "🚌",
    vehicle: "bus",
    backdrop: "jour",
    seconds: 12,
    next: () => plain(rnd(1, 20), [2], (w) => `Le bus numéro ${w}.`),
  },
  {
    id: "ligne-b",
    label: "Ligne B",
    place: "Arrêt Mermoz",
    scale: "21 – 69",
    unit: 1,
    emoji: "🚌",
    vehicle: "bus",
    backdrop: "jour",
    seconds: 12,
    next: () => {
      // Every third bus ends in 1, so "vingt et un" comes round often enough
      // to stick — it is the shape learners drop the "et" from.
      const value = Math.random() < 0.3 ? pick([21, 31, 41, 51, 61]) : rnd(21, 69);
      return plain(value, [2], (w) => `Le bus numéro ${w}.`);
    },
  },
  {
    id: "ligne-c",
    label: "Ligne C",
    place: "Arrêt Mermoz",
    scale: "70 – 99",
    unit: 4,
    emoji: "🚌",
    vehicle: "bus",
    backdrop: "jour",
    seconds: 14,
    next: () => plain(rnd(70, 99), [2], (w) => `Le bus numéro ${w}.`),
  },
  {
    id: "gare-routiere",
    label: "Car régional",
    place: "Gare routière",
    scale: "100 – 999",
    unit: null,
    emoji: "🚍",
    vehicle: "car",
    backdrop: "crepuscule",
    seconds: 14,
    next: () => plain(rnd(100, 999), [3], (w) => `Le car numéro ${w}, à quai.`),
  },
  {
    id: "grandes-lignes",
    label: "Grandes lignes",
    place: "Gare SNCF",
    scale: "1 000 – 9 999",
    unit: null,
    emoji: "🚄",
    vehicle: "train",
    backdrop: "gare",
    seconds: 16,
    next: () => plain(rnd(1000, 9999), [4], (w) => `Le train numéro ${w} entre en gare.`),
  },
  {
    id: "guichet",
    label: "Guichet",
    place: "Arrêt Mermoz",
    scale: "les prix",
    unit: null,
    emoji: "🎫",
    vehicle: "bus",
    backdrop: "jour",
    seconds: 14,
    next: () => {
      // Real fares hover around the awkward end of the scale — 80, 90, 95, 99
      // centimes are where soixante-dix and quatre-vingt live.
      const cents = rnd(1, 99) * 100 + pick([0, 0, 20, 50, 60, 75, 80, 90, 95, 99]);
      const blind: Blind = [2, ",", 2];
      const words = frenchPrice(cents);
      return {
        say: `Ça fait ${words}.`,
        words,
        digits: digitsOf(cents, blind),
        blind,
        suffix: "€",
        why: [...explain(Math.floor(cents / 100)), ...explain(cents % 100)].slice(0, 3),
      };
    },
  },
  {
    id: "horaires",
    label: "Horaires",
    place: "Gare SNCF",
    scale: "l’heure",
    unit: null,
    emoji: "🕑",
    vehicle: "train",
    backdrop: "gare",
    seconds: 14,
    next: () => {
      const h = rnd(5, 23);
      const m = pick([0, 5, 10, 15, 20, 25, 30, 30, 35, 40, 45, 45, 50, 55]);
      const blind: Blind = [2, ":", 2];
      const words = frenchTime(h, m);
      return {
        say: `Départ à ${words}.`,
        words,
        digits: digitsOf(h * 100 + m, blind),
        blind,
        why: [
          "The 24-hour clock is the only one a French timetable uses: 14 h 30, never « 2:30 ».",
          ...explain(h),
          ...explain(m),
        ].slice(0, 3),
      };
    },
  },
  {
    id: "objets-trouves",
    label: "Objets trouvés",
    place: "Arrêt Mermoz",
    scale: "un numéro",
    unit: null,
    emoji: "📞",
    vehicle: "bus",
    backdrop: "crepuscule",
    seconds: 22,
    next: () => {
      const rest = Array.from({ length: 8 }, () => rnd(0, 9)).join("");
      const digits = `0${pick([1, 2, 3, 4, 5, 6, 6, 7, 7, 9])}${rest}`;
      const blind: Blind = [2, " ", 2, " ", 2, " ", 2, " ", 2];
      const words = frenchPhone(digits);
      return {
        say: `Rappelez le ${words}.`,
        words,
        digits,
        blind,
        why: [
          "A French phone number is read in five two-digit numbers, not ten digits — 06 12 is « zéro six, douze ».",
          "A pair starting with 0 is the exception: it is spelled out, « zéro sept ».",
        ],
      };
    },
  },
  {
    id: "compteur",
    label: "Le compteur",
    place: "Dépôt de nuit",
    scale: "10 000 – 9 999 999",
    unit: null,
    emoji: "🔢",
    vehicle: "bus",
    backdrop: "nuit",
    seconds: 20,
    next: () => {
      const [lo, hi] = pick([
        [10_000, 99_999],
        [100_000, 999_999],
        [1_000_000, 9_999_999],
      ]);
      const value = rnd(lo, hi);
      return plain(value, groupedBlind(value), (w) => `Le compteur affiche ${w} voyageurs.`);
    },
  },
];

export const getLine = (id: string) => NUMBUS_LINES.find((l) => l.id === id);
