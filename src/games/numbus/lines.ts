/**
 * NumBus routes — four drills, four skins:
 *
 *   NumBus      0–99 in three levels (0–20, 0–69, 0–99) — the morning bus
 *   Horaires    00:00–23:59 — station departure board
 *   NumBurger   prix ≤ 99,99 € — checkout total
 *   NumBureau   téléphone — five two-digit blocks
 *
 * The 100+ scales (cars, trains, counters) are gone — they live elsewhere.
 */

import { explain, frenchNumber, frenchPhone, frenchPrice, frenchTime } from "./frenchNumber";

/** The shape of the destination blind: a number is that many digit cells, a
 *  string is a fixed separator painted between them. */
export type Blind = (number | string)[];

export type NumBusMode = "bus" | "time" | "price" | "phone";

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

export type NumBusRoute = {
  id: string;
  mode: NumBusMode;
  /** Screen title — NumBus, NumBurger, NumBureau… */
  brand: string;
  label: string;
  place: string;
  scale: string;
  unit: number | null;
  emoji: string;
  /** How long the learner has once typing opens. */
  seconds: number;
  /** Bus only — three ascending ceilings. */
  levels?: { max: number; label: string }[];
  next: (level: number) => NumBusRound;
};

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

export const blindWidth = (blind: Blind): number =>
  blind.reduce<number>((n, part) => n + (typeof part === "number" ? part : 0), 0);

const digitsOf = (value: number, blind: Blind) => String(value).padStart(blindWidth(blind), "0");

function plain(value: number, blind: Blind, say: (words: string) => string): NumBusRound {
  const words = frenchNumber(value);
  return { say: say(words), words, digits: digitsOf(value, blind), blind, why: explain(value) };
}

function busValue(level: number): number {
  const max = level === 1 ? 20 : level === 2 ? 69 : 99;
  // Mostly from the new band above the previous ceiling, with review below.
  const lo = level === 1 ? 0 : level === 2 ? 21 : 70;
  if (level === 1 || Math.random() < 0.72) return rnd(lo, max);
  return rnd(0, lo - 1);
}

/* ── the routes ─────────────────────────────────────────────────────────── */

export const NUMBUS_ROUTES: NumBusRoute[] = [
  {
    id: "bus",
    mode: "bus",
    brand: "NumBus",
    label: "Ligne A",
    place: "Arrêt Mermoz",
    scale: "0 – 99",
    unit: 0,
    emoji: "🚌",
    seconds: 24,
    levels: [
      { max: 20, label: "0 – 20" },
      { max: 69, label: "0 – 69" },
      { max: 99, label: "0 – 99" },
    ],
    next: (level) => {
      const value = busValue(level);
      // Every third bus at level 2 ends in 1 — "vingt et un" must stick.
      const v =
        level === 2 && Math.random() < 0.3
          ? pick([21, 31, 41, 51, 61].filter((n) => n <= 69))
          : value;
      return plain(v, [2], (w) => `Le bus numéro ${w}.`);
    },
  },
  {
    id: "horaires",
    mode: "time",
    brand: "NumBus",
    label: "Horaires",
    place: "Gare SNCF",
    scale: "00:00 – 23:59",
    unit: null,
    emoji: "🕑",
    seconds: 28,
    next: () => {
      const h = rnd(0, 23);
      const m = rnd(0, 59);
      const blind: Blind = [2, ":", 2];
      const words = frenchTime(h, m);
      return {
        say: `Départ à ${words}.`,
        words,
        digits: String(h).padStart(2, "0") + String(m).padStart(2, "0"),
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
    id: "numburger",
    mode: "price",
    brand: "NumBurger",
    label: "Caisse",
    place: "NumBurger",
    scale: "≤ 99,99 €",
    unit: null,
    emoji: "🍔",
    seconds: 30,
    next: () => {
      const euros = rnd(0, 99);
      const centimes = rnd(0, 99);
      const blind: Blind = [2, ",", 2];
      const digits = String(euros).padStart(2, "0") + String(centimes).padStart(2, "0");
      const words = frenchPrice(euros * 100 + centimes);
      return {
        say: `Ça fait ${words}.`,
        words,
        digits,
        blind,
        suffix: "€",
        why: [...explain(euros), ...explain(centimes)].slice(0, 3),
      };
    },
  },
  {
    id: "numbureau",
    mode: "phone",
    brand: "NumBureau",
    label: "Standard",
    place: "NumBureau",
    scale: "10 chiffres",
    unit: null,
    emoji: "📞",
    seconds: 36,
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
];

export const getRoute = (id: string) => NUMBUS_ROUTES.find((r) => r.id === id);

/** @deprecated use NUMBUS_ROUTES — kept for any stale imports */
export const NUMBUS_LINES = NUMBUS_ROUTES;
export const getLine = getRoute;

export type NumBusLine = NumBusRoute;
