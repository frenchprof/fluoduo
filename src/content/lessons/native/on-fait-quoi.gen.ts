/**
 * « Pardon, on fait quoi ? » — the generator for SIO-008's lesson.
 *
 * The ten instructions and the « verbe + -ez » rule are well taught. The
 * promise's tail — "or ask what we are doing" — was not, and it is the line a
 * lost student most needs in the room.
 *
 * Dan's ruling, 2026-08-29, fixes the scope exactly: "Stop 8 should only very
 * basic structures like: Pardon, on fait quoi ? and Répétez s'il vous plaît."
 * Two lines, nothing more.
 */
import type { DiceAxis, DiceQuestion } from "./types";

export const INSTRUCTIONS = [
  { fr: "Écoutez !", en: "Listen!" },
  { fr: "Regardez !", en: "Look!" },
  { fr: "Répétez !", en: "Repeat!" },
  { fr: "Lisez !", en: "Read!" },
  { fr: "Écrivez !", en: "Write!" },
  { fr: "Parlez !", en: "Speak!" },
  { fr: "Notez !", en: "Write it down!" },
  { fr: "Comptez !", en: "Count!" },
] as const;

/** The learner's two lines. Dan: only these. */
export const REPLIES = [
  { value: "quoi", fr: "Pardon, on fait quoi ?", en: "Sorry — what are we doing?" },
  { value: "repetez", fr: "Répétez s'il vous plaît.", en: "Say it again, please." },
] as const;

export const ON_FAIT_AXES: DiceAxis[] = [
  { key: "reply", label: "Quoi dire ?", options: REPLIES.map((r) => ({ value: r.value, label: r.fr })) },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export function onFaitQuoiQuestion(pinned?: Record<string, string>): DiceQuestion {
  const r = REPLIES.find((x) => x.value === pinned?.reply) ?? pick(REPLIES);
  const ins = pick(INSTRUCTIONS);
  const other = REPLIES.find((x) => x.value !== r.value)!;
  const cue =
    r.value === "quoi"
      ? `Le professeur parle vite. Vous n'avez pas compris.`
      : `Le professeur dit « ${ins.fr} ». Vous n'avez pas entendu.`;
  return {
    meta: r.value === "quoi" ? "demander 🙋" : "faire répéter 🔁",
    big: cue,
    en: r.en,
    correct: r.fr,
    easyOptions: [
      r.fr,
      other.fr,
      "Pardon, on fait quoi.",
      "Répétez s'il vous plaît ?",
    ],
    med:
      r.value === "quoi"
        ? { before: "Pardon, on", choices: ["fait quoi ?", "fait quoi.", "faites quoi ?", "fais quoi ?"], correct: "fait quoi ?", after: "" }
        : { before: "Répétez", choices: ["s'il vous plaît.", "s'il te plaît ?", "s'il vous plaît ?", "merci."], correct: "s'il vous plaît.", after: "" },
  };
}
