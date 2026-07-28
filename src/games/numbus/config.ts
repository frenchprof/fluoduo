/**
 * NumBus — one game, learner-chosen mix. Deal rounds from a config:
 * bus numbers in a custom 0–99 range, optional times, prices, phones.
 */

import { explain, frenchNumber, frenchPhone, frenchPrice, frenchTime } from "./frenchNumber";

export type Blind = (number | string)[];

export type NumBusMode = "bus" | "time" | "price" | "phone";

export type PhoneStyle = "fr" | "sg";

export type NumBusConfig = {
  /** Inclusive floor for bus numbers (0–99). */
  min: number;
  /** Inclusive ceiling for bus numbers (0–99, ≥ min). */
  max: number;
  times: boolean;
  prices: boolean;
  phones: boolean;
  /** Only used when phones is true. */
  phoneStyle: PhoneStyle;
};

export const DEFAULT_NUMBUS_CONFIG: NumBusConfig = {
  min: 0,
  max: 99,
  times: true,
  prices: false,
  phones: false,
  phoneStyle: "fr",
};

const CONFIG_KEY = "fluolingo:numbus-config.v1";

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

export function normalizeConfig(c: NumBusConfig): NumBusConfig {
  let min = Math.max(0, Math.min(99, Math.floor(c.min)));
  let max = Math.max(0, Math.min(99, Math.floor(c.max)));
  if (min > max) [min, max] = [max, min];
  const phones = !!c.phones;
  return {
    min,
    max,
    times: !!c.times,
    prices: !!c.prices,
    phones,
    phoneStyle: c.phoneStyle === "sg" ? "sg" : "fr",
  };
}

export type NumBusRound = {
  mode: NumBusMode;
  say: string;
  words: string;
  digits: string;
  blind: Blind;
  suffix?: string;
  why: string[];
  /** Seconds once typing opens — longer for harder shapes. */
  seconds: number;
};

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

export const blindWidth = (blind: Blind): number =>
  blind.reduce<number>((n, part) => n + (typeof part === "number" ? part : 0), 0);

const digitsOf = (value: number, blind: Blind) => String(value).padStart(blindWidth(blind), "0");

function busBlind(max: number): Blind {
  return max <= 9 ? [1] : [2];
}

function plainBus(value: number, blind: Blind): NumBusRound {
  const words = frenchNumber(value);
  return {
    mode: "bus",
    say: `Le bus numéro ${words}.`,
    words,
    digits: digitsOf(value, blind),
    blind,
    why: explain(value),
    seconds: 24,
  };
}

function dealTime(): NumBusRound {
  const h = rnd(0, 23);
  const m = rnd(0, 59);
  const blind: Blind = [2, ":", 2];
  const words = frenchTime(h, m);
  return {
    mode: "time",
    say: `Départ à ${words}.`,
    words,
    digits: String(h).padStart(2, "0") + String(m).padStart(2, "0"),
    blind,
    why: [
      "The 24-hour clock is the only one a French timetable uses: 14 h 30, never « 2:30 ».",
      ...explain(h),
      ...explain(m),
    ].slice(0, 3),
    seconds: 28,
  };
}

function dealPrice(): NumBusRound {
  const euros = rnd(0, 99);
  const centimes = rnd(0, 99);
  const blind: Blind = [2, ",", 2];
  const digits = String(euros).padStart(2, "0") + String(centimes).padStart(2, "0");
  const words = frenchPrice(euros * 100 + centimes);
  return {
    mode: "price",
    say: `Ça fait ${words}.`,
    words,
    digits,
    blind,
    suffix: "€",
    why: [...explain(euros), ...explain(centimes)].slice(0, 3),
    seconds: 30,
  };
}

function dealPhone(style: PhoneStyle): NumBusRound {
  if (style === "sg") {
    const digits = `${pick([8, 9])}${Array.from({ length: 7 }, () => rnd(0, 9)).join("")}`;
    const blind: Blind = [4, " ", 4];
    const words = frenchPhone(digits);
    return {
      mode: "phone",
      say: `Rappelez le ${words}.`,
      words,
      digits,
      blind,
      why: [
        "Singapore mobiles are eight digits — read in four two-digit blocks (91 23 45 67).",
        "Each pair is a French number word, except pairs starting with 0 which are spelled digit by digit.",
      ],
      seconds: 32,
    };
  }
  const rest = Array.from({ length: 8 }, () => rnd(0, 9)).join("");
  const digits = `0${pick([1, 2, 3, 4, 5, 6, 6, 7, 7, 9])}${rest}`;
  const blind: Blind = [2, " ", 2, " ", 2, " ", 2, " ", 2];
  const words = frenchPhone(digits);
  return {
    mode: "phone",
    say: `Rappelez le ${words}.`,
    words,
    digits,
    blind,
    why: [
      "A French phone number is read in five two-digit numbers, not ten digits — 06 12 is « zéro six, douze ».",
      "A pair starting with 0 is the exception: it is spelled out, « zéro sept ».",
    ],
    seconds: 36,
  };
}

/** Pick the next round from whatever the learner enabled in setup. */
export function dealRound(config: NumBusConfig): NumBusRound {
  const c = normalizeConfig(config);
  const kinds: ("bus" | "time" | "price" | "phone")[] = ["bus"];
  if (c.times) kinds.push("time");
  if (c.prices) kinds.push("price");
  if (c.phones) kinds.push("phone");
  const kind = pick(kinds);
  if (kind === "time") return dealTime();
  if (kind === "price") return dealPrice();
  if (kind === "phone") return dealPhone(c.phoneStyle);
  const blind = busBlind(c.max);
  return plainBus(rnd(c.min, c.max), blind);
}

export function configSummary(c: NumBusConfig): string {
  const n = normalizeConfig(c);
  const parts = [`${n.min}–${n.max}`];
  if (n.times) parts.push("heures");
  if (n.prices) parts.push("prix");
  if (n.phones) parts.push(n.phoneStyle === "sg" ? "tel. SG" : "tel. FR");
  return parts.join(" · ");
}
