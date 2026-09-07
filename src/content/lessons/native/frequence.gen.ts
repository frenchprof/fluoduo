/**
 * The frequence generator — data, axes and question maker, split out of
 * frequence.tsx (2026-08-29) on the conjugaison-u1 pattern.
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
const END: Record<string, string> = { je: "e", tu: "es", il: "e", nous: "ons", vous: "ez", ils: "ent" };
const ACTS = [
  { stem: "regard", rest: "la télé", en: "watch TV" },
  { stem: "écout", rest: "de la musique", en: "listen to music" },
  { stem: "travaill", rest: "", en: "work" },
  { stem: "cuisin", rest: "", en: "cook" },
  { stem: "jou", rest: "au foot", en: "play football" },
  { stem: "dans", rest: "", en: "dance" },
] as const;
const ADV = [
  { fr: "toujours", en: "always" }, { fr: "souvent", en: "often" },
  { fr: "régulièrement", en: "regularly" }, { fr: "parfois", en: "sometimes" },
  { fr: "rarement", en: "rarely" },
] as const;
export const SCALE = [...ADV, { fr: "jamais", en: "never" }] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function subjVerb(s: (typeof SUBJECTS)[number], verb: string): string {
  return s.slot === "je" && /^[aeiouéèêh]/i.test(verb) ? `J'${verb}` : `${s.disp} ${verb}`;
}

export const FREQUENCE_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  { key: "adverb", label: "Frequency", options: ADV.map((a) => ({ value: a.fr, label: a.fr })) },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function frequenceQuestion(pinned?: Record<string, string>): DiceQuestion {
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
  const a = roll(ACTS);
  const adv = pinned1(ADV, pinned?.adverb, (x) => x.fr);
      const verb = a.stem + END[s.slot];
      const sv = subjVerb(s, verb);
      const tail = a.rest ? ` ${a.rest}` : "";
      const other = pick(ADV.filter((x) => x.fr !== adv.fr));
      return {
        meta: `${sv} … (${a.en})`,
        big: adv.fr,
        en: adv.en,
        correct: `${sv} ${adv.fr}${tail}.`,
        easyOptions: [
          `${sv} ${adv.fr}${tail}.`,
          `${s.disp} ${adv.fr} ${verb}${tail}.`,
          `${sv} ${other.fr}${tail}.`,
        ],
        med: {
          before: sv,
          choices: ADV.map((x) => x.fr),
          correct: adv.fr,
          after: a.rest ? `${a.rest}.` : ".",
        },
      };
    }
