/**
 * « Tu étudies quoi ? » — the generator for SIO-013.
 *
 * WHY THIS LESSON EXISTS. The can-do is "I can say AND ASK what someone is
 * studying". The `matieres` deck is sixteen subject names sorted into four
 * letris columns by article — LE · LA · L' · LES — which teaches the article
 * and the vocabulary, and never once asks the question. « Quelle matière ? »
 * is the deck's own title and appears on no card, the same shape as SIO-036
 * and SIO-003 before it.
 *
 * So this drills the exchange. The article is not re-taught — the deck owns it
 * — but it cannot be avoided in the answer, which is the point: « J'étudie LE
 * français », never « J'étudie français ». Dropping the article is the single
 * commonest error an English speaker makes here.
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** The deck's own sixteen, with the column each sits in. */
export const SUBJECTS = [
  { fr: "français", art: "le", en: "French" },
  { fr: "dessin", art: "le", en: "art" },
  { fr: "anglais", art: "le", en: "English" },
  { fr: "sport", art: "le", en: "sport" },
  { fr: "théâtre", art: "le", en: "drama" },
  { fr: "espagnol", art: "le", en: "Spanish" },
  { fr: "géographie", art: "la", en: "geography" },
  { fr: "biologie", art: "la", en: "biology" },
  { fr: "chimie", art: "la", en: "chemistry" },
  { fr: "musique", art: "la", en: "music" },
  { fr: "histoire", art: "l'", en: "history" },
  { fr: "informatique", art: "l'", en: "computing" },
  { fr: "mathématiques", art: "les", en: "maths", pl: true },
  { fr: "sciences", art: "les", en: "science", pl: true },
  { fr: "langues", art: "les", en: "languages", pl: true },
  { fr: "arts plastiques", art: "les", en: "visual arts", pl: true },
] as const;

type Subject = (typeof SUBJECTS)[number] & { pl?: boolean };

export function withArticle(s: Subject): string {
  return s.art === "l'" ? `l'${s.fr}` : `${s.art} ${s.fr}`;
}

/** The two people you ask, and how each answers. */
export const PEOPLE = [
  { key: "tu", ask: "Tu étudies quoi ?", answer: "J'étudie", en: "you (a classmate)" },
  { key: "vous", ask: "Vous étudiez quoi ?", answer: "J'étudie", en: "you (polite)" },
  { key: "il", ask: "Il étudie quoi ?", answer: "Il étudie", en: "him" },
  { key: "elle", ask: "Elle étudie quoi ?", answer: "Elle étudie", en: "her" },
] as const;

export const MATIERE_AXES: DiceAxis[] = [
  { key: "person", label: "On demande à qui ?", options: PEOPLE.map((p) => ({ value: p.key, label: p.ask })) },
  { key: "subject", label: "Quelle matière ?", options: SUBJECTS.map((s) => ({ value: s.fr, label: withArticle(s) })) },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const dedupe = (xs: string[]): string[] => [...new Set(xs)];

function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function matiereQuestion(pinned?: Record<string, string>): DiceQuestion {
  const person = PEOPLE.find((p) => p.key === pinned?.person) ?? pick(PEOPLE);
  const subject = SUBJECTS.find((s) => s.fr === pinned?.subject) ?? pick(SUBJECTS);
  const correct = `${person.answer} ${withArticle(subject)}.`;

  // The two real errors: the article dropped entirely (the English habit), and
  // the wrong article for the column the deck sorts this subject into.
  const wrongArt = subject.art === "le" ? "la" : subject.art === "la" ? "le" : subject.art === "les" ? "le" : "le";
  const wrong = dedupe([
    `${person.answer} ${subject.fr}.`,
    `${person.answer} ${wrongArt} ${subject.fr}.`,
    ...others(SUBJECTS, subject, 2).map((s) => `${person.answer} ${withArticle(s)}.`),
  ]);

  return {
    meta: "quelle matière ? 📚",
    big: `« ${person.ask} »  →  ${subject.en}`,
    en: `Ask ${person.en} — answer with ${subject.en}.`,
    correct,
    alternates: [`${person.answer} ${withArticle(subject)}`],
    easyOptions: dedupe([correct, ...wrong]).slice(0, 4),
    med: {
      before: person.answer,
      choices: dedupe([
        withArticle(subject),
        subject.fr,
        `${wrongArt} ${subject.fr}`,
        withArticle(others(SUBJECTS, subject, 1)[0]),
      ]).slice(0, 4),
      correct: withArticle(subject),
      after: ".",
    },
  };
}
