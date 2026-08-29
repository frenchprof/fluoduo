/**
 * « Qu'est-ce que c'est ? » — the generator for SIO-021's lesson.
 *
 * Every card in the deck already carries « C'est un sac. » and the letris
 * columns sort UN / UNE / DES, so "point out and name objects" is properly
 * built. The promise's tail — "and ask what something is" — was not: the
 * learner could answer a question the stop never taught them to ask.
 *
 * Kept to the simplest true sentences (Dan, 2026-08-29).
 */
import type { DiceAxis, DiceQuestion } from "./types";

export const OBJECTS = [
  { fr: "sac", art: "un", en: "a bag" },
  { fr: "livre", art: "un", en: "a book" },
  { fr: "cahier", art: "un", en: "an exercise book" },
  { fr: "téléphone", art: "un", en: "a phone" },
  { fr: "stylo", art: "un", en: "a pen" },
  { fr: "crayon", art: "un", en: "a pencil" },
  { fr: "trousse", art: "une", en: "a pencil case" },
  { fr: "gomme", art: "une", en: "a rubber" },
  { fr: "règle", art: "une", en: "a ruler" },
  { fr: "clé", art: "une", en: "a key" },
] as const;

export const PEOPLE = [
  { fr: "le professeur", en: "the teacher" },
  { fr: "une étudiante", en: "a student" },
  { fr: "un ami", en: "a friend" },
] as const;

export const QQC_AXES: DiceAxis[] = [
  {
    key: "kind",
    label: "Quoi ?",
    options: [
      { value: "objet", label: "un objet — Qu'est-ce que c'est ?" },
      { value: "personne", label: "une personne — C'est qui ?" },
      { value: "pluriel", label: "plusieurs — Ce sont…" },
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

export function quEstCeQuestion(pinned?: Record<string, string>): DiceQuestion {
  const kind =
    pinned?.kind === "personne" || pinned?.kind === "pluriel" || pinned?.kind === "objet"
      ? pinned.kind
      : pick(["objet", "personne", "pluriel"] as const);

  if (kind === "personne") {
    const p = pick(PEOPLE);
    const correct = `C'est ${p.fr}.`;
    return {
      meta: "une personne 🙋",
      big: `C'est qui ?  (${p.en})`,
      en: `Who is it? — It's ${p.en}.`,
      correct,
      easyOptions: [correct, `Ce sont ${p.fr}.`, ...others(PEOPLE, p, 2).map((o) => `C'est ${o.fr}.`)],
      med: { before: "C'est", choices: [p.fr, ...others(PEOPLE, p, 3).map((o) => o.fr)], correct: p.fr, after: "." },
    };
  }

  if (kind === "pluriel") {
    const o = pick(OBJECTS);
    const correct = `Ce sont des ${o.fr}s.`;
    return {
      meta: "plusieurs 📦",
      big: `Qu'est-ce que c'est ?  (${o.en} ×3)`,
      en: `What is it? — They're ${o.en}s.`,
      correct,
      easyOptions: [correct, `C'est des ${o.fr}s.`, `Ce sont ${o.art} ${o.fr}.`, `C'est ${o.art} ${o.fr}.`],
      med: { before: "Ce sont", choices: [`des ${o.fr}s`, `un ${o.fr}`, `une ${o.fr}`, `les ${o.fr}`], correct: `des ${o.fr}s`, after: "." },
    };
  }

  const o = pick(OBJECTS);
  const correct = `C'est ${o.art} ${o.fr}.`;
  const wrongArt = o.art === "un" ? "une" : "un";
  return {
    meta: "un objet 🎒",
    big: `Qu'est-ce que c'est ?  (${o.en})`,
    en: `What is it? — It's ${o.en}.`,
    correct,
    easyOptions: [
      correct,
      `C'est ${wrongArt} ${o.fr}.`,
      ...others(OBJECTS, o, 2).map((x) => `C'est ${x.art} ${x.fr}.`),
    ],
    med: {
      before: "C'est",
      choices: [`${o.art} ${o.fr}`, `${wrongArt} ${o.fr}`, ...others(OBJECTS, o, 2).map((x) => `${x.art} ${x.fr}`)],
      correct: `${o.art} ${o.fr}`,
      after: ".",
    },
  };
}
