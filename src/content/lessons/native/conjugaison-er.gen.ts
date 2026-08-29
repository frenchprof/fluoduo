/**
 * The conjugaison-er generator — data, axes and question maker, split out of
 * conjugaison-er.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1 } from "./axis.ts";
import { sample, shuffle } from "../../../lib/shuffle.ts";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const ENDINGS = ["e", "es", "ons", "ez", "ent"];

const ER_VERBS = [
  { inf: "aimer", stem: "aim", en: "to like" },
  { inf: "parler", stem: "parl", en: "to speak" },
  { inf: "habiter", stem: "habit", en: "to live" },
] as const;
const IRR_VERBS = [
  { inf: "faire", en: "to do / make", f: { je: "fais", tu: "fais", il: "fait", nous: "faisons", vous: "faites", ils: "font" } },
  { inf: "aller", en: "to go", f: { je: "vais", tu: "vas", il: "va", nous: "allons", vous: "allez", ils: "vont" } },
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const startsVowel = (s: string) => /^[aeiouéèêh]/i.test(s);
const sv = (s: (typeof SUBJECTS)[number], form: string) =>
  s.slot === "je" && startsVowel(form) ? `J'${form}` : `${s.disp} ${form}`;

export const IRR_MEMO: [string, string, string, string, string][] = [
  ["je / j'", "fais", "vais", "veux", "peux"],
  ["tu", "fais", "vas", "veux", "peux"],
  ["il / elle / on", "fait", "va", "veut", "peut"],
  ["nous", "faisons", "allons", "voulons", "pouvons"],
  ["vous", "faites", "allez", "voulez", "pouvez"],
  ["ils / elles", "font", "vont", "veulent", "peuvent"],
];

export const CONJUGAISON_ER_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  {
    key: "family",
    label: "Verbes",
    options: [
      { value: "er", label: "réguliers -er" },
      { value: "irr", label: "irréguliers" },
    ],
  },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function conjugaisonErQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  // The -er/irregular split IS the lesson, so it is an axis rather than a
  // coin toss: a learner who keeps missing the irregulars can sit only those.
  const regular = pinned?.family === "er" ? true
    : pinned?.family === "irr" ? false
    : Math.random() < 0.6;
  if (regular) {
        const v = pick(ER_VERBS);
        const form = v.stem + END[s.slot];
        const otherEnds = sample(ENDINGS.filter((e) => e !== END[s.slot]), 3);
        const stemDisp = s.slot === "je" && startsVowel(v.stem) ? `J'${v.stem}` : `${s.disp} ${v.stem}`;
        return {
          meta: `${s.disp} + …`,
          big: v.inf,
          en: v.en,
          correct: `${sv(s, form)}.`,
          easyOptions: [form, ...otherEnds.map((e) => v.stem + e)].map((f) => `${sv(s, f)}.`),
          med: { before: stemDisp, choices: [...ENDINGS], correct: END[s.slot], after: "." },
        };
      }
      const v = pick(IRR_VERBS);
      const form = v.f[s.slot];
      const others = shuffle([...new Set(Object.values(v.f))].filter((x) => x !== form));
      return {
        meta: `${s.disp} + …`,
        big: v.inf,
        en: v.en,
        correct: `${sv(s, form)}.`,
        easyOptions: [form, ...others.slice(0, 3)].map((f) => `${sv(s, f)}.`),
        med: { before: s.disp, choices: [form, ...others.slice(0, 4)], correct: form, after: "." },
      };
    }
