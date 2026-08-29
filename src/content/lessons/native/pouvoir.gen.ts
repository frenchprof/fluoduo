/**
 * The pouvoir generator — data, axes and question maker, split out of
 * pouvoir.tsx (2026-08-29) on the conjugaison-u1 pattern.
 *
 * WHY ITS OWN FILE. The lesson file holds the Mémo, which is JSX, and
 * `node --experimental-strip-types` cannot load .tsx — so a generator living
 * there is unreachable from a check. A generator that silently ignores a
 * pinned axis looks in source exactly like one that honours it, so reading it
 * proves nothing; verify41 imports this module and EXECUTES it.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinned1 } from "./axis.ts";

const SUBJECTS = [
  { disp: "Je", slot: "je", q: true },
  { disp: "Tu", slot: "tu", q: false },
  { disp: "Il", slot: "il", q: false },
  { disp: "Elle", slot: "il", q: false },
  { disp: "On", slot: "il", q: true },
  { disp: "Nous", slot: "nous", q: false },
  { disp: "Vous", slot: "vous", q: true },
  { disp: "Ils", slot: "ils", q: false },
  { disp: "Elles", slot: "ils", q: false },
] as const;

const POUVOIR: Record<string, string> = {
  je: "peux", tu: "peux", il: "peut", nous: "pouvons", vous: "pouvez", ils: "peuvent",
};
const FORMS = ["peux", "peut", "pouvons", "pouvez", "peuvent"];

/** Straight from pouvoir.json — what one may do, and where. */
const ACTIONS = [
  { fr: "manger ici", en: "eat here" },
  { fr: "visiter le musée", en: "visit the museum" },
  { fr: "se garer là", en: "park there" },
  { fr: "acheter les billets ici", en: "buy the tickets here" },
  { fr: "se promener", en: "walk around" },
  // Third parties only: « Nous pouvons venir avec nous » is nonsense, and a
  // generator that pairs every subject with every action will produce it.
  { fr: "venir avec nous", en: "come with us", not: ["je", "nous"] },
  { fr: "attendre ici", en: "wait here" },
  { fr: "fumer ici", en: "smoke here" },
] as const;

export const MEMO_ROWS = [
  ["je", "peux"], ["tu", "peux"], ["il / elle / on", "peut"],
  ["nous", "pouvons"], ["vous", "pouvez"], ["ils / elles", "peuvent"],
] as const;

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}
/** A reflexive infinitive changes its pronoun with the subject: on peut SE
 *  promener, but je peux ME promener. Kept honest rather than quietly wrong. */
const REFLEXIVE: Record<string, string> = { je: "me", tu: "te", il: "se", nous: "nous", vous: "vous", ils: "se" };
const infFor = (slot: string, fr: string) =>
  fr.startsWith("se ") ? `${REFLEXIVE[slot]} ${fr.slice(3)}` : fr;

export const POUVOIR_AXES: DiceAxis[] = [
  { key: "subject", label: "Sujet", options: SUBJECTS.map((s) => ({ value: s.disp, label: s.disp })) },
  {
    key: "mode",
    label: "Usage",
    options: [
      { value: "yes", label: "capacité" },
      { value: "ask", label: "permission" },
      { value: "no", label: "refus" },
    ],
  },
];

/**
 * One question. Any axis in `pinned` is honoured; anything absent (or "") is
 * rolled, so an unsteered call behaves exactly as before the selectors.
 */
export function pouvoirQuestion(pinned?: Record<string, string>): DiceQuestion {
      // One verb, three uses — the SIO's own three-part can-do, not three
      // different verbs. A permission question only makes sense from a subject
      // that could be asking, so `q` gates it rather than producing
      // « Ils peuvent attendre ici ? » as a request.
  const s = pinned1(SUBJECTS, pinned?.subject, (x) => x.disp);
      const a = pick(ACTIONS.filter((x) => !("not" in x && (x.not as readonly string[]).includes(s.slot))));
      const form = POUVOIR[s.slot];
      const inf = infFor(s.slot, a.fr);
      const wrong = others(FORMS, form, 3);

  // The three uses are the SIO's own three-part can-do, so they are an axis.
  // "ask" still needs a subject that could be asking — a pin that the
  // subject cannot support falls back to a statement rather than producing
  // « Ils peuvent attendre ici ? » as a request.
  const wanted = pinned?.mode;
  const mode = wanted === "ask" && s.q ? "ask"
    : wanted === "no" ? "no"
    : wanted === "yes" ? "yes"
    : s.q && Math.random() < 0.4 ? "ask" : Math.random() < 0.25 ? "no" : "yes";

      if (mode === "ask") {
        const correct = `${s.disp} ${form} ${inf} ?`;
        return {
          meta: `${s.disp.toLowerCase()} → demander la permission`,
          big: `${a.en}?`,
          en: `ask permission: ${a.en}`,
          correct,
          alternates: [`Est-ce que ${s.disp.toLowerCase()} ${form} ${inf} ?`],
          easyOptions: [correct, ...wrong.map((f) => `${s.disp} ${f} ${inf} ?`)],
          med: { before: s.disp, choices: [form, ...wrong], correct: form, after: `${inf} ?` },
        };
      }

      if (mode === "no") {
        const correct = `${s.disp} ne ${form} pas ${inf}.`;
        return {
          meta: `${s.disp.toLowerCase()} → ce qui est interdit`,
          big: `🚫 ${a.en}`,
          en: `not allowed: ${a.en}`,
          correct,
          easyOptions: [
            correct,
            `${s.disp} ${form} pas ${inf}.`,
            `${s.disp} ne ${form} ${inf} pas.`,
            `${s.disp} ne pas ${form} ${inf}.`,
          ],
          // No padding spaces: the blank span carries mx-1.5, so a trailing
          // space here renders as a double gap around the answer.
          med: { before: `${s.disp} ne`, choices: [form, ...wrong], correct: form, after: `pas ${inf}.` },
        };
      }

      const correct = `${s.disp} ${form} ${inf}.`;
      return {
        meta: `${s.disp.toLowerCase()} → ce qui est possible`,
        big: a.en,
        en: `possible: ${a.en}`,
        correct,
        easyOptions: [correct, ...wrong.map((f) => `${s.disp} ${f} ${inf}.`)],
        med: { before: s.disp, choices: [form, ...wrong], correct: form, after: `${inf}.` },
      };
    }
