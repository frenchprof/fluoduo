/**
 * The aimer generator — data, axes and question maker, split out of
 * aimer.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1, pinnedGroup, roll } from "./axis.ts";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const VERBS = [
  { stem: "aim", en: "like" }, { stem: "ador", en: "love" }, { stem: "détest", en: "hate" },
] as const;
const NOUNS: { fr: string; art: "le" | "la" | "l'" | "les"; en: string }[] = [
  { fr: "sport", art: "le", en: "sport" }, { fr: "football", art: "le", en: "football" },
  { fr: "tennis", art: "le", en: "tennis" }, { fr: "yoga", art: "le", en: "yoga" },
  { fr: "piano", art: "le", en: "piano" }, { fr: "cinéma", art: "le", en: "cinema" },
  { fr: "chant", art: "le", en: "singing" }, { fr: "danse", art: "la", en: "dance" },
  { fr: "natation", art: "la", en: "swimming" }, { fr: "musique", art: "la", en: "music" },
  { fr: "lecture", art: "la", en: "reading" }, { fr: "boxe", art: "la", en: "boxing" },
  { fr: "art", art: "l'", en: "art" }, { fr: "athlétisme", art: "l'", en: "athletics" },
  { fr: "escalade", art: "l'", en: "climbing" }, { fr: "équitation", art: "l'", en: "horse-riding" },
  { fr: "films", art: "les", en: "films" }, { fr: "livres", art: "les", en: "books" },
  { fr: "concerts", art: "les", en: "concerts" },
];
const ARTS = ["le", "la", "l'", "les"];

const np = (art: string, fr: string) => art + (art === "l'" ? "" : " ") + fr;
function subjVerb(s: (typeof SUBJECTS)[number], v: (typeof VERBS)[number]): string {
  const c = v.stem + END[s.slot];
  return s.slot === "je" && /^[aeiouéèêh]/i.test(c) ? `J'${c}` : `${s.disp} ${c}`;
}

/** Sujet and Verbe shape the sentence; Article is the point of the lesson. */
export const AIMER_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "verb", label: "Verbe", options: VERBS.map((v) => ({ value: v.stem, label: `${v.stem}er` })) },
  { key: "article", label: "Article", options: ARTS.map((a) => ({ value: a, label: a })) },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function aimerQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const v = pinned1(VERBS, pinned?.verb, (x) => x.stem);
  // A pinned article narrows the NOUNS rather than being applied on top of
  // one — « le danse » would be a wrong sentence, not a harder question.
  const n = roll(pinnedGroup(NOUNS, pinned?.article, (x) => x.art));
      const sv = subjVerb(s, v);
      return {
        meta: `${sv} … (${v.en})`,
        big: n.fr,
        en: n.en,
        correct: `${sv} ${np(n.art, n.fr)}.`,
        easyOptions: ARTS.map((a) => `${sv} ${np(a, n.fr)}.`),
        med: { before: sv, choices: ARTS, correct: n.art, after: `${n.fr}.` },
      };
    }
