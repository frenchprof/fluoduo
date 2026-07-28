/**
 * NumBus — one game, learner-chosen mix. Every practice type carries its own
 * range, so a session can be "numbers 0–20" or "prices from 5,00 to 12,50 €"
 * as easily as the full spread.
 */

import { frenchNumber, frenchPhone, frenchPrice, frenchTime } from "./frenchNumber";

export type Blind = (number | string)[];

export type NumBusMode = "bus" | "time" | "price" | "phone";

export type PhoneStyle = "fr" | "sg";

export type NumBusConfig = {
  numbers: boolean;
  /** Inclusive bounds for plain numbers, 0–99. */
  min: number;
  max: number;

  times: boolean;
  /** Inclusive bounds as minutes since midnight, 0–1439. */
  timeFrom: number;
  timeTo: number;

  prices: boolean;
  /** Inclusive bounds in centimes, 0–9999. */
  priceFrom: number;
  priceTo: number;

  phones: boolean;
  phoneStyle: PhoneStyle;
};

export const NUMBER_MIN = 0;
export const NUMBER_MAX = 99;
export const TIME_MIN = 0;
export const TIME_MAX = 23 * 60 + 59;
export const PRICE_MIN = 0;
export const PRICE_MAX = 9999;

export const DEFAULT_NUMBUS_CONFIG: NumBusConfig = {
  numbers: true,
  min: NUMBER_MIN,
  max: NUMBER_MAX,
  times: false,
  timeFrom: TIME_MIN,
  timeTo: TIME_MAX,
  prices: false,
  priceFrom: PRICE_MIN,
  priceTo: PRICE_MAX,
  phones: false,
  phoneStyle: "fr",
};

const CONFIG_KEY = "fluolingo:numbus-config.v2";

export function loadNumBusConfig(): NumBusConfig {
  if (typeof window === "undefined") return DEFAULT_NUMBUS_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_NUMBUS_CONFIG;
    const p = JSON.parse(raw) as Partial<NumBusConfig>;
    return normalizeConfig({ ...DEFAULT_NUMBUS_CONFIG, ...p });
  } catch {
    return DEFAULT_NUMBUS_CONFIG;
  }
}

export function saveNumBusConfig(c: NumBusConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(normalizeConfig(c)));
  } catch {}
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, Math.floor(Number.isFinite(v) ? v : lo)));

/** Ordered pair, clamped to the type's own limits. */
function span(from: number, to: number, lo: number, hi: number): [number, number] {
  let a = clamp(from, lo, hi);
  let b = clamp(to, lo, hi);
  if (a > b) [a, b] = [b, a];
  return [a, b];
}

export function normalizeConfig(c: NumBusConfig): NumBusConfig {
  const [min, max] = span(c.min, c.max, NUMBER_MIN, NUMBER_MAX);
  const [timeFrom, timeTo] = span(c.timeFrom, c.timeTo, TIME_MIN, TIME_MAX);
  const [priceFrom, priceTo] = span(c.priceFrom, c.priceTo, PRICE_MIN, PRICE_MAX);
  return {
    numbers: !!c.numbers,
    min,
    max,
    times: !!c.times,
    timeFrom,
    timeTo,
    prices: !!c.prices,
    priceFrom,
    priceTo,
    phones: !!c.phones,
    phoneStyle: c.phoneStyle === "sg" ? "sg" : "fr",
  };
}

/** Nothing ticked means nothing to deal — the setup screen blocks it. */
export function hasAnyMode(c: NumBusConfig): boolean {
  return !!(c.numbers || c.times || c.prices || c.phones);
}

export type NumBusRound = {
  mode: NumBusMode;
  say: string;
  words: string;
  digits: string;
  blind: Blind;
  suffix?: string;
  /** Seconds once typing opens — longer for harder shapes. */
  seconds: number;
};

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

export const blindWidth = (blind: Blind): number =>
  blind.reduce<number>((n, part) => n + (typeof part === "number" ? part : 0), 0);

export const hoursOf = (minutes: number) => Math.floor(minutes / 60);
export const minutesOf = (minutes: number) => minutes % 60;

/** "14h05" — how the ranges read on the setup screen. */
export const timeLabel = (minutes: number) =>
  `${String(hoursOf(minutes)).padStart(2, "0")}h${String(minutesOf(minutes)).padStart(2, "0")}`;

/** "12,50" — centimes always shown, as on a price tag. */
export const priceLabel = (cents: number) =>
  `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}`;

function dealNumber(min: number, max: number): NumBusRound {
  const value = rnd(min, max);
  const blind: Blind = max <= 9 ? [1] : [2];
  const words = frenchNumber(value);
  return {
    mode: "bus",
    say: `Le bus numéro ${words}.`,
    words,
    digits: String(value).padStart(blindWidth(blind), "0"),
    blind,
    seconds: 24,
  };
}

function dealTime(from: number, to: number): NumBusRound {
  const total = rnd(from, to);
  const h = hoursOf(total);
  const m = minutesOf(total);
  const words = frenchTime(h, m);
  return {
    mode: "time",
    say: `Départ à ${words}.`,
    words,
    digits: String(h).padStart(2, "0") + String(m).padStart(2, "0"),
    blind: [2, ":", 2],
    seconds: 28,
  };
}

function dealPrice(from: number, to: number): NumBusRound {
  const cents = rnd(from, to);
  const words = frenchPrice(cents);
  return {
    mode: "price",
    say: `Ça fait ${words}.`,
    words,
    digits: String(Math.floor(cents / 100)).padStart(2, "0") + String(cents % 100).padStart(2, "0"),
    blind: [2, ",", 2],
    suffix: "€",
    seconds: 30,
  };
}

function dealPhone(style: PhoneStyle): NumBusRound {
  if (style === "sg") {
    const digits = `${pick([8, 9])}${Array.from({ length: 7 }, () => rnd(0, 9)).join("")}`;
    return {
      mode: "phone",
      say: `Rappelez le ${frenchPhone(digits)}.`,
      words: frenchPhone(digits),
      digits,
      blind: [4, " ", 4],
      seconds: 32,
    };
  }
  const rest = Array.from({ length: 8 }, () => rnd(0, 9)).join("");
  const digits = `0${pick([1, 2, 3, 4, 5, 6, 6, 7, 7, 9])}${rest}`;
  return {
    mode: "phone",
    say: `Rappelez le ${frenchPhone(digits)}.`,
    words: frenchPhone(digits),
    digits,
    blind: [2, " ", 2, " ", 2, " ", 2, " ", 2],
    seconds: 36,
  };
}

/** Pick the next round from whatever the learner ticked in setup. */
export function dealRound(config: NumBusConfig): NumBusRound {
  const c = normalizeConfig(config);
  const kinds: NumBusMode[] = [];
  if (c.numbers) kinds.push("bus");
  if (c.times) kinds.push("time");
  if (c.prices) kinds.push("price");
  if (c.phones) kinds.push("phone");
  switch (kinds.length === 0 ? "bus" : pick(kinds)) {
    case "time":
      return dealTime(c.timeFrom, c.timeTo);
    case "price":
      return dealPrice(c.priceFrom, c.priceTo);
    case "phone":
      return dealPhone(c.phoneStyle);
    default:
      return dealNumber(c.min, c.max);
  }
}

/** A STABLE analytics key: which kinds of number the session drills, never the
 *  bounds. The teacher's activity table groups by `game · collectionId`, and a
 *  per-learner range in that slot would splinter NumBus into a row per
 *  session. */
export function configKey(c: NumBusConfig): string {
  const n = normalizeConfig(c);
  const parts: string[] = [];
  if (n.numbers) parts.push("numbers");
  if (n.times) parts.push("times");
  if (n.prices) parts.push("prices");
  if (n.phones) parts.push(n.phoneStyle === "sg" ? "phones-sg" : "phones-fr");
  return parts.join("+") || "numbers";
}

export function configSummary(c: NumBusConfig): string {
  const n = normalizeConfig(c);
  const parts: string[] = [];
  if (n.numbers) parts.push(`numbers ${n.min}–${n.max}`);
  if (n.times) parts.push(`time ${timeLabel(n.timeFrom)}–${timeLabel(n.timeTo)}`);
  if (n.prices) parts.push(`prices ${priceLabel(n.priceFrom)}–${priceLabel(n.priceTo)} €`);
  if (n.phones) parts.push(`phone ${n.phoneStyle === "sg" ? "8" : "10"} digits`);
  return parts.join(" · ");
}
