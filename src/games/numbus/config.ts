/**
 * NumBus — one game, learner-chosen mix.
 *
 * ONE RANGE FOR ALL FOUR KINDS, AND NOTHING ELSE (Dan, 2026-09-14): *"let the
 * user decide what is the floor and the ceiling. no need so much PLEASE"*,
 * then the rule that finished the design in one sentence — *"For time, price
 * and phone numbers, adapt the value of each double digit to the range picked.
 * That is all"*.
 *
 * THIS REPLACED A RANGE PER KIND, and the reason is the question the screen is
 * really asking. It is not "what should a price be"; it is **WHICH FRENCH
 * NUMBERS DO YOU WANT TO HEAR** — and that answer is the same whether the
 * number arrives as a bus, a time, a price or a phone number. Four separate
 * from/to pairs asked it four times and let a learner set 0–20 in one place
 * and 0–99 in another, which is not a thing anyone means.
 *
 * SO EVERY TWO-DIGIT PART OF EVERY KIND COMES FROM THE ONE RANGE. There are no
 * add-ons, no per-kind bounds and no second settings to disagree with the
 * first — a learner practising 0–20 hears nothing above twenty, whatever shape
 * it arrives in:
 *
 *     bus     the value               from the range
 *     time    the hour                from the range, capped at 23
 *             the minute              from the range, capped at 59
 *     price   the euros               from the range
 *             the centimes            from the range, capped at 99
 *     phone   every 2-digit block     from the range
 *
 * THE CAPS ARE THE CLOCK AND THE COIN, not a second opinion about difficulty:
 * there is no 30th hour and no 120th centime, so the range is intersected with
 * what each unit can physically hold. `unitSpan` is that intersection, and it
 * can never come back empty — see its own note.
 *
 * THE PHONE NUMBER OBEYS THE RANGE TOO (Dan: *"the auto phone number must be
 * able to adapt the output to the number range set at the start"*), and
 * `frenchPhone` is what makes that meaningful rather than decorative: it
 * speaks a number in TWO-DIGIT BLOCKS — « zéro six, douze, trente-quatre » —
 * so drawing each block from the range means a learner practising 0–20 hears
 * only numbers they asked for. Drawing ten loose digits would have ignored the
 * setting while looking like it obeyed it.
 */

import { frenchNumber, frenchPhone, frenchPrice, frenchTime } from "./frenchNumber";

export type Blind = (number | string)[];

export type NumBusMode = "bus" | "time" | "price" | "phone";

/** How many digits a phone number has. Dan settled on two (2026-09-14:
 *  *"ok 8 and 10 digit is fine for fone nos"*) — Singapore and France. */
export type PhoneDigits = 8 | 10;

export type NumBusConfig = {
  /** THE ONE RANGE, 0–99, applied to every kind that is on. */
  min: number;
  max: number;

  /** Which kinds are on. One or several. */
  numbers: boolean;
  times: boolean;
  prices: boolean;
  phones: boolean;
  phoneDigits: PhoneDigits;
};

export const NUMBER_MIN = 0;
export const NUMBER_MAX = 99;
/** A 24-hour clock, and nothing else (Dan, 2026-09-14: *"no halves and
 *  quarters please. only 24 hour clock !!!"*). */
export const HOUR_MAX = 23;
export const MINUTE_MAX = 59;
export const CENT_MAX = 99;

export const DEFAULT_NUMBUS_CONFIG: NumBusConfig = {
  min: NUMBER_MIN,
  max: NUMBER_MAX,
  numbers: true,
  times: false,
  prices: false,
  phones: false,
  phoneDigits: 10,
};

/** v3: the shape changed from four ranges to one plus two add-ons, so a v2
 *  value cannot be read as a v3 one. A new key rather than a migration —
 *  what is lost is one learner's last range, which the defaults replace. */
const CONFIG_KEY = "fluolingo:numbus-config.v3";

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
  return {
    min,
    max,
    numbers: !!c.numbers,
    times: !!c.times,
    prices: !!c.prices,
    phones: !!c.phones,
    phoneDigits: c.phoneDigits === 8 ? 8 : 10,
  };
}

/** The learner's range, intersected with what one unit can physically hold.
 *
 *  NEVER EMPTY, and that is the whole of this function: a learner may pick
 *  30–40, and there is no 30th hour. Both ends are capped, the order survives,
 *  so a range entirely above the unit collapses to its ceiling — 23–23 for an
 *  hour — rather than to nothing. A deal function handed an empty range would
 *  return NaN and the drill would look like it had frozen, with nothing on
 *  screen to say why. */
export function unitSpan(c: NumBusConfig, cap: number): [number, number] {
  return [Math.min(c.min, cap), Math.min(c.max, cap)];
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

function dealTime(hLo: number, hHi: number, mLo: number, mHi: number): NumBusRound {
  // Both halves come from the same range; only their caps differ (23 and 59).
  const h = rnd(hLo, hHi);
  const m = rnd(mLo, mHi);
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

function dealPrice(eLo: number, eHi: number, cLo: number, cHi: number): NumBusRound {
  const cents = rnd(eLo, eHi) * 100 + rnd(cLo, cHi);
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

/** Every TWO-DIGIT BLOCK comes from the learner's range.
 *
 *  That is what makes Dan's *"adapt the output to the number range"* real
 *  rather than cosmetic: `frenchPhone` speaks a number in blocks of two, so a
 *  learner set to 0–20 hears « zéro six, douze, zéro trois, dix-huit » and
 *  never a number outside what they asked to practise. The COUNTRY PREFIX is
 *  not drawn from the range — a French mobile starts 06/07 and a Singapore
 *  number starts 8 or 9 whatever you are practising, and faking that would
 *  teach a phone number that does not exist. */
function dealPhone(digitsCount: PhoneDigits, min: number, max: number): NumBusRound {
  const block = () => String(rnd(min, max)).padStart(2, "0");
  if (digitsCount === 8) {
    // Singapore: 8 digits, first is 8 or 9, then three blocks from the range.
    const rest = `${block()}${block()}${block()}`.slice(0, 7);
    const digits = `${pick([8, 9])}${rest}`;
    return {
      mode: "phone",
      say: `Rappelez le ${frenchPhone(digits)}.`,
      words: frenchPhone(digits),
      digits,
      blind: [4, " ", 4],
      seconds: 32,
    };
  }
  // France: 10 digits, 0X then four blocks from the range.
  const digits = `0${pick([1, 2, 3, 4, 5, 6, 6, 7, 7, 9])}${block()}${block()}${block()}${block()}`;
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
  const [hLo, hHi] = unitSpan(c, HOUR_MAX);
  const [mLo, mHi] = unitSpan(c, MINUTE_MAX);
  const [cLo, cHi] = unitSpan(c, CENT_MAX);
  switch (kinds.length === 0 ? "bus" : pick(kinds)) {
    case "time":
      return dealTime(hLo, hHi, mLo, mHi);
    case "price":
      return dealPrice(c.min, c.max, cLo, cHi);
    case "phone":
      return dealPhone(c.phoneDigits, c.min, c.max);
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
  if (n.phones) parts.push(n.phoneDigits === 8 ? "phones-8" : "phones-10");
  return parts.join("+") || "numbers";
}

export function configSummary(c: NumBusConfig): string {
  const n = normalizeConfig(c);
  const parts: string[] = [];
  if (n.numbers) parts.push("numbers");
  if (n.times) parts.push("time");
  if (n.prices) parts.push("prices");
  if (n.phones) parts.push(`phone ${n.phoneDigits} digits`);
  // THE RANGE LEADS, because it is now one setting for the whole session
  // rather than a footnote on each kind.
  return `${n.min}–${n.max} · ${parts.join(" · ") || "numbers"}`;
}
