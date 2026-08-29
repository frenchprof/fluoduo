/**
 * The manger-boire generator — data, axes and question maker, split out of
 * manger-boire.tsx (2026-08-29) on the conjugaison-u1 pattern.
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
type Verb = {
  name: string;
  en: string;
  forms: Record<"je" | "tu" | "il" | "nous" | "vous" | "ils", string>;
  comps: readonly { fr: string; en: string }[];
};
const VERBS: readonly Verb[] = [
  {
    name: "manger", en: "eat",
    forms: { je: "mange", tu: "manges", il: "mange", nous: "mangeons", vous: "mangez", ils: "mangent" },
    comps: [
      { fr: "du pain", en: "bread" }, { fr: "de la salade", en: "salad" },
      { fr: "des œufs", en: "eggs" }, { fr: "de la viande", en: "meat" },
      { fr: "du fromage", en: "cheese" }, { fr: "des frites", en: "fries" },
    ],
  },
  {
    name: "boire", en: "drink",
    forms: { je: "bois", tu: "bois", il: "boit", nous: "buvons", vous: "buvez", ils: "boivent" },
    comps: [
      { fr: "du café", en: "coffee" }, { fr: "de l'eau", en: "water" },
      { fr: "du lait", en: "milk" }, { fr: "du jus", en: "juice" }, { fr: "du thé", en: "tea" },
    ],
  },
];
const SLOTS = ["je", "tu", "il", "nous", "vous", "ils"] as const;
export const MEMO_ROWS = [
  ["je", "mange", "bois"], ["tu", "manges", "bois"], ["il / elle / on", "mange", "boit"],
  ["nous", "mangeons", "buvons"], ["vous", "mangez", "buvez"], ["ils / elles", "mangent", "boivent"],
] as const;

function uniqueForms(v: Verb): string[] {
  const out: string[] = [];
  for (const k of SLOTS) if (!out.includes(v.forms[k])) out.push(v.forms[k]);
  return out;
}

export const MANGER_BOIRE_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "verb", label: "Verbe", options: VERBS.map((v) => ({ value: v.name, label: v.name })) },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function mangerBoireQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const v = pinned1(VERBS, pinned?.verb, (x) => x.name);
  const c = roll(v.comps);
      const form = v.forms[s.slot];
      const forms = uniqueForms(v);
      return {
        meta: `${s.disp} … · ${v.name} (${v.en})`,
        big: c.fr,
        en: c.en,
        correct: `${s.disp} ${form} ${c.fr}.`,
        easyOptions: forms.map((f) => `${s.disp} ${f} ${c.fr}.`),
        med: { before: s.disp, choices: forms, correct: form, after: `${c.fr}.` },
      };
    }
