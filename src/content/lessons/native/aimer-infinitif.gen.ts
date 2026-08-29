/**
 * The aimer-infinitif generator — data, axes and question maker, split out of
 * aimer-infinitif.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1, roll } from "./axis.ts";

const SUBJECTS = [
  { disp: "Je", slot: "je" }, { disp: "Tu", slot: "tu" }, { disp: "Il", slot: "il" },
  { disp: "Elle", slot: "il" }, { disp: "Nous", slot: "nous" }, { disp: "Vous", slot: "vous" },
  { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const VERBS = [
  { stem: "aim", en: "like", neg: false }, { stem: "ador", en: "love", neg: false },
  { stem: "détest", en: "hate", neg: false }, { stem: "aim", en: "don't like", neg: true },
] as const;
const ACTIVITIES: { fr: string; en: string; noun: string; faire: string | null }[] = [
  { fr: "lire", en: "read", noun: "la lecture", faire: null },
  { fr: "cuisiner", en: "cook", noun: "la cuisine", faire: "faire de la cuisine" },
  { fr: "voyager", en: "travel", noun: "les voyages", faire: "faire des voyages" },
  { fr: "chanter", en: "sing", noun: "le chant", faire: "faire du chant" },
  { fr: "danser", en: "dance", noun: "la danse", faire: "faire de la danse" },
  { fr: "dessiner", en: "draw", noun: "le dessin", faire: "faire du dessin" },
  { fr: "nager", en: "swim", noun: "la natation", faire: "faire de la natation" },
  { fr: "courir", en: "run", noun: "la course à pied", faire: "faire de la course à pied" },
  { fr: "regarder la télé", en: "watch TV", noun: "la télévision", faire: null },
  { fr: "écouter de la musique", en: "listen to music", noun: "la musique", faire: "faire de la musique" },
  { fr: "sortir", en: "go out", noun: "les sorties", faire: null },
  { fr: "dormir", en: "sleep", noun: "le sommeil", faire: null },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
/** Conjugated subject + verb, with J'/n' elision (aime/adore start with a vowel). */
function subjVerb(s: (typeof SUBJECTS)[number], v: (typeof VERBS)[number]): string {
  const c = v.stem + END[s.slot];
  if (v.neg) return `${s.disp} n'${c} pas`; // only "ne pas aimer": aime → n'aime pas
  return s.slot === "je" && /^[aeiouéèêh]/i.test(c) ? `J'${c}` : `${s.disp} ${c}`;
}

export const AIMER_INFINITIF_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "verb", label: "Verbe", options: VERBS.map((v) => ({ value: v.stem, label: `${v.stem}er` })) },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function aimerInfinitifQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const v = pinned1(VERBS, pinned?.verb, (x) => x.stem);
  // Activities are vocabulary, not grammar — always rolled.
  const a = roll(ACTIVITIES);
      const sv = subjVerb(s, v);
      const third = a.faire ?? pick(ACTIVITIES.filter((x) => x.fr !== a.fr)).fr;
      return {
        meta: `${sv} … (${v.en})`,
        big: a.fr,
        en: a.en,
        correct: `${sv} ${a.fr}.`,
        easyOptions: [`${sv} ${a.fr}.`, `${sv} ${a.noun}.`, `${sv} ${third}.`],
        med: { before: sv, choices: [a.fr, a.noun, third], correct: a.fr, after: "" },
      };
    }
