/**
 * « On est quel jour ? » — the generator for SIO-004's lesson.
 *
 * The deck sorts ten words into EN SEMAINE / LE WEEK-END / MOMENT DU JOUR and
 * the Mémo is those words plus "no capitals in French". Nothing anywhere puts
 * a day in a sentence, so neither half of the promise — tell the day, or ask
 * it — had anything to say.
 *
 * Unit 0, so the sentences are the shortest true ones (Dan, 2026-08-29:
 * "simplest possible sentences ... This is unit 0 for pete's sake").
 */
import type { DiceAxis, DiceQuestion } from "./types";

export const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] as const;
export const MOMENTS = [
  { fr: "le matin", en: "the morning" },
  { fr: "l'après-midi", en: "the afternoon" },
  { fr: "le soir", en: "the evening" },
] as const;

export const QUEL_JOUR_AXES: DiceAxis[] = [
  { key: "jour", label: "Which day", options: DAYS.map((d) => ({ value: d, label: d })) },
  {
    key: "mode",
    label: "What",
    options: [
      { value: "jour", label: "le jour" },
      { value: "moment", label: "le moment" },
    ],
  },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function quelJourQuestion(pinned?: Record<string, string>): DiceQuestion {
  // Pinning a DAY implies the day card. Without this, mode stayed random and
  // half the cards for « mardi » were moment cards that ignore the day
  // entirely — which verify46 reported, correctly, as the pin being ignored.
  // It is also just wrong for the learner: you asked for Tuesday.
  const mode =
    pinned?.mode === "moment"
      ? "moment"
      : pinned?.mode === "jour" || (pinned?.jour && DAYS.includes(pinned.jour as (typeof DAYS)[number]))
        ? "jour"
        : pick(["jour", "moment"] as const);

  if (mode === "moment") {
    const m = pick(MOMENTS);
    const correct = `C'est ${m.fr}.`;
    return {
      meta: "le moment 🌤️",
      big: `C'est quel moment ?  (${m.en})`,
      en: `It's ${m.en}.`,
      correct,
      easyOptions: [correct, ...others(MOMENTS, m, 2).map((o) => `C'est ${o.fr}.`), `Il est ${m.fr}.`],
      med: { before: "C'est", choices: [m.fr, ...others(MOMENTS, m, 2).map((o) => o.fr)], correct: m.fr, after: "." },
    };
  }

  const d = DAYS.includes((pinned?.jour ?? "") as (typeof DAYS)[number])
    ? (pinned!.jour as (typeof DAYS)[number])
    : pick(DAYS);
  // « On est lundi. » is the everyday answer; « Aujourd'hui, c'est lundi. »
  // is accepted too. No capital on the day — the Mémo's one rule.
  const correct = `On est ${d}.`;
  return {
    meta: "le jour 📅",
    big: `On est quel jour ?  (${d})`,
    en: `What day is it? — It's ${d}.`,
    correct,
    alternates: [`Aujourd'hui, c'est ${d}.`, `C'est ${d}.`],
    easyOptions: [
      correct,
      `On est ${d.charAt(0).toUpperCase()}${d.slice(1)}.`,
      ...others(DAYS, d, 2).map((o) => `On est ${o}.`),
    ],
    med: { before: "On est", choices: [d, ...others(DAYS, d, 3)], correct: d, after: "." },
  };
}
