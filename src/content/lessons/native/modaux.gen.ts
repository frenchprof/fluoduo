/**
 * The modaux generator — data, axes and question maker, split out of
 * modaux.tsx (2026-08-29) on the conjugaison-u1 pattern.
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
  { disp: "Elle", slot: "il" }, { disp: "On", slot: "il" }, { disp: "Nous", slot: "nous" },
  { disp: "Vous", slot: "vous" }, { disp: "Ils", slot: "ils" }, { disp: "Elles", slot: "ils" },
] as const;
const MODALS = [
  {
    inf: "vouloir", en: "want to",
    forms: { je: "veux", tu: "veux", il: "veut", nous: "voulons", vous: "voulez", ils: "veulent" } as Record<string, string>,
  },
  {
    inf: "pouvoir", en: "can",
    forms: { je: "peux", tu: "peux", il: "peut", nous: "pouvons", vous: "pouvez", ils: "peuvent" } as Record<string, string>,
  },
  // devoir joins the family (Dan, 2026-07-08: SIO-047 drills aller · pouvoir ·
  // devoir · falloir, but the lesson stopped at vouloir/pouvoir).
  {
    inf: "devoir", en: "must / have to",
    forms: { je: "dois", tu: "dois", il: "doit", nous: "devons", vous: "devez", ils: "doivent" } as Record<string, string>,
  },
] as const;
const ACTIVITIES = [
  { fr: "aller au cinéma", en: "go to the cinema" },
  { fr: "aller au parc", en: "go to the park" },
  { fr: "venir demain", en: "come tomorrow" },
  { fr: "venir ce soir", en: "come this evening" },
  { fr: "venir à 8 heures", en: "come at 8" },
  { fr: "danser", en: "dance" },
  { fr: "lire", en: "read" },
  { fr: "parler français", en: "speak French" },
] as const;

const distinct = (forms: Record<string, string>) => [...new Set(Object.values(forms))];

export const MODAUX_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "modal", label: "Verbe", options: MODALS.map((m) => ({ value: m.inf, label: m.inf })) },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function modauxQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const m = pinned1(MODALS, pinned?.modal, (x) => x.inf);
  const a = roll(ACTIVITIES);
      const form = m.forms[s.slot];
      const forms = distinct(m.forms);
      return {
        meta: `${s.disp} … ${a.fr}`,
        big: m.inf,
        en: `${m.en} ${a.en}`,
        correct: `${s.disp} ${form} ${a.fr}.`,
        easyOptions: forms.map((f) => `${s.disp} ${f} ${a.fr}.`),
        med: { before: s.disp, choices: forms, correct: form, after: `${a.fr}.` },
      };
    }
