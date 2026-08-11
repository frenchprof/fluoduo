/**
 * Shared engine for the two distinct preposition lessons (Dan, 2026-07-06:
 * "the lessons for 32 and 33 are not distinct — 32 is countries/cities only,
 * 33 is places in town only"). The grammar mechanics (subject + aller/venir +
 * contracted preposition) are identical; only the DESTINATION SET differs:
 *   prepositions       → GEOS  (à/en/au/aux + de/du/des/d')   — SIO-032
 *   prepositions-lieux → PLACES (au/à la/à l'/aux + du/…/des) — SIO-033
 */
import type { DiceConfig } from "./types";

export const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
export const ALLER: Record<string, string> = { je: "vais", tu: "vas", il: "va", nous: "allons", vous: "allez", ils: "vont" };
export const VENIR: Record<string, string> = { je: "viens", tu: "viens", il: "vient", nous: "venons", vous: "venez", ils: "viennent" };

export type Dest =
  | { kind: "place"; fr: string; art: "le" | "la" | "l'" | "les"; en: string }
  | { kind: "geo"; fr: string; type: "city" | "fem" | "masc" | "plur" | "vowel"; en: string };

// Places in town — SIO-033 (article contraction: au / à la / à l' / aux).
export const PLACES: Dest[] = [
  { kind: "place", fr: "cinéma", art: "le", en: "the cinema" },
  { kind: "place", fr: "marché", art: "le", en: "the market" },
  { kind: "place", fr: "musée", art: "le", en: "the museum" },
  { kind: "place", fr: "restaurant", art: "le", en: "the restaurant" },
  { kind: "place", fr: "café", art: "le", en: "the café" },
  { kind: "place", fr: "parc", art: "le", en: "the park" },
  { kind: "place", fr: "maison", art: "la", en: "the house" },
  { kind: "place", fr: "boulangerie", art: "la", en: "the bakery" },
  { kind: "place", fr: "bibliothèque", art: "la", en: "the library" },
  { kind: "place", fr: "gare", art: "la", en: "the station" },
  { kind: "place", fr: "pharmacie", art: "la", en: "the pharmacy" },
  { kind: "place", fr: "école", art: "l'", en: "school" },
  { kind: "place", fr: "hôpital", art: "l'", en: "the hospital" },
  { kind: "place", fr: "aéroport", art: "l'", en: "the airport" },
  { kind: "place", fr: "université", art: "l'", en: "the university" },
  { kind: "place", fr: "magasins", art: "les", en: "the shops" },
  { kind: "place", fr: "toilettes", art: "les", en: "the toilets" },
];
// Countries & cities — SIO-032 (à + city, en/au/aux + country; de/du/des/d').
export const GEOS: Dest[] = [
  { kind: "geo", fr: "Paris", type: "city", en: "Paris" },
  { kind: "geo", fr: "Lyon", type: "city", en: "Lyon" },
  { kind: "geo", fr: "Rome", type: "city", en: "Rome" },
  { kind: "geo", fr: "Londres", type: "city", en: "London" },
  { kind: "geo", fr: "Singapour", type: "city", en: "Singapore" },
  { kind: "geo", fr: "France", type: "fem", en: "France" },
  { kind: "geo", fr: "Espagne", type: "fem", en: "Spain" },
  { kind: "geo", fr: "Chine", type: "fem", en: "China" },
  { kind: "geo", fr: "Suisse", type: "fem", en: "Switzerland" },
  { kind: "geo", fr: "Japon", type: "masc", en: "Japan" },
  { kind: "geo", fr: "Brésil", type: "masc", en: "Brazil" },
  { kind: "geo", fr: "Canada", type: "masc", en: "Canada" },
  { kind: "geo", fr: "Portugal", type: "masc", en: "Portugal" },
  { kind: "geo", fr: "Allemagne", type: "vowel", en: "Germany" },
  { kind: "geo", fr: "Inde", type: "vowel", en: "India" },
  { kind: "geo", fr: "États-Unis", type: "plur", en: "the United States" },
  { kind: "geo", fr: "Pays-Bas", type: "plur", en: "the Netherlands" },
];

const TO_PLACE: Record<string, string> = { le: "au", la: "à la", "l'": "à l'", les: "aux" };
const FROM_PLACE: Record<string, string> = { le: "du", la: "de la", "l'": "de l'", les: "des" };
const TO_GEO: Record<string, string> = { city: "à", fem: "en", vowel: "en", masc: "au", plur: "aux" };
const FROM_GEO: Record<string, string> = { city: "de", fem: "de", vowel: "d'", masc: "du", plur: "des" };

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const pp = (prep: string, fr: string) => prep + (prep.endsWith("'") ? "" : " ") + fr;
export const prepFor = (d: Dest, dir: "to" | "from"): string =>
  d.kind === "place"
    ? (dir === "to" ? TO_PLACE : FROM_PLACE)[d.art]
    : (dir === "to" ? TO_GEO : FROM_GEO)[d.type];

/** Build a dice trainer over one destination set, offering only that set's
 *  relevant preposition choices (so the two lessons never overlap). */
export function buildDice(opts: { dests: Dest[]; toChoices: string[]; fromChoices: string[]; instruction: string }): DiceConfig {
  const { dests, toChoices, fromChoices, instruction } = opts;
  return {
    instruction,
    newQuestion() {
      const s = pick(SUBJECTS);
      const dir = pick(["to", "from"] as const);
      const d = pick(dests);
      const sv = `${s.disp} ${(dir === "to" ? ALLER : VENIR)[s.slot]}`;
      const prep = prepFor(d, dir);
      const choices = dir === "to" ? toChoices : fromChoices;
      const wrong = choices.filter((c) => c !== prep).sort(() => Math.random() - 0.5).slice(0, 3);
      return {
        meta: `${sv} … (${dir === "to" ? "go to" : "come from"})`,
        big: d.fr,
        en: d.en,
        correct: `${sv} ${pp(prep, d.fr)}.`,
        easyOptions: [prep, ...wrong].map((c) => `${sv} ${pp(c, d.fr)}.`),
        med: { before: sv, choices, correct: prep, after: `${d.fr}.` },
      };
    },
  };
}
