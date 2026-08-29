/**
 * The futur-proche generator — data, axes and question maker, split out of
 * futur-proche.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1, pinnedNeg, POLARITY_AXIS } from "./axis.ts";
import { sample } from "../../../lib/shuffle.ts";

const SUBJECTS = [
  { disp: "Je", aller: "vais" }, { disp: "Tu", aller: "vas" }, { disp: "Il", aller: "va" },
  { disp: "Elle", aller: "va" }, { disp: "On", aller: "va" }, { disp: "Nous", aller: "allons" },
  { disp: "Vous", aller: "allez" }, { disp: "Ils", aller: "vont" }, { disp: "Elles", aller: "vont" },
] as const;
const ALLER = ["vais", "vas", "va", "allons", "allez", "vont"];
const INFS = [
  { fr: "faire du sport", en: "do sport" }, { fr: "manger équilibré", en: "eat healthily" },
  { fr: "sortir ce soir", en: "go out tonight" }, { fr: "partir en vacances", en: "go on holiday" },
  { fr: "dormir plus", en: "sleep more" }, { fr: "courir demain", en: "run tomorrow" },
  { fr: "arrêter le café", en: "quit coffee" }, { fr: "étudier le français", en: "study French" },
  { fr: "préparer le dîner", en: "make dinner" }, { fr: "regarder un film", en: "watch a film" },
] as const;
export const MEMO_ROWS = [
  ["je", "vais"], ["tu", "vas"], ["il / elle / on", "va"],
  ["nous", "allons"], ["vous", "allez"], ["ils / elles", "vont"],
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const ne = (form: string) => (/^[aeiou]/.test(form) ? "n'" : "ne ");
const phrase = (disp: string, form: string, neg: boolean) =>
  neg ? `${disp} ${ne(form)}${form} pas` : `${disp} ${form}`;

export const FUTUR_PROCHE_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  POLARITY_AXIS,
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function futurProcheQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp), inf = pick(INFS);
  const neg = pinnedNeg(pinned?.polarity, 0.4);
      const others = sample(ALLER.filter((f) => f !== s.aller), 3);
      return {
        meta: `${s.disp} … (${neg ? "🚫 négatif" : "✅ affirmatif"})`,
        big: inf.fr,
        en: inf.en,
        correct: `${phrase(s.disp, s.aller, neg)} ${inf.fr}.`,
        easyOptions: [s.aller, ...others].map((f) => `${phrase(s.disp, f, neg)} ${inf.fr}.`),
        med: {
          before: neg ? `${s.disp} ${ne(s.aller).trim()}` : s.disp,
          choices: ALLER,
          correct: s.aller,
          after: neg ? `pas ${inf.fr}.` : `${inf.fr}.`,
        },
      };
    }
