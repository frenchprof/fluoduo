/**
 * « Qu'est-ce que c'est ? » — the generator for SIO-021's lesson.
 *
 * Every card in the deck already carries « C'est un sac. » and the letris
 * columns sort UN / UNE / DES, so "point out and name objects" is properly
 * built. The promise's tail — "and ask what something is" — was not: the
 * learner could answer a question the stop never taught them to ask.
 *
 * Kept to the simplest true sentences (Dan, 2026-08-29).
 *
 * THE PRONOUN, added 29 Aug on Dan's instruction: "il/elle for objects should
 * go to 21, which should also include ils/elles (sac, gomme, ciseaux,
 * lunettes)."
 *
 * It had been built into a lesson for SIO-006, which was the wrong home — that
 * stop's deck already asks « C'est qui ? » and « C'est où ? » in its example
 * fields, and the objects live HERE. Dan's four examples give all four forms
 * with nothing left over:
 *
 *     un sac        -> IL est là.        une gomme     -> ELLE est là.
 *     des ciseaux   -> ILS sont là.      des lunettes  -> ELLES sont là.
 *
 * English says "it" and "they" for all four, so every one of them has to be
 * chosen rather than guessed — and the verb moves too, est -> sont.
 *
 * The plural nouns are the deck's OWN plural-only cards. The `pluriel` branch
 * used to pluralise a singular object with a bare `+ "s"` (« Ce sont des
 * sacs. »), which is true French but not what the deck teaches; `ciseaux` and
 * `lunettes` have no singular at all, which is the more useful fact.
 */
import type { DiceAxis, DiceQuestion } from "./types";

export const OBJECTS = [
  { fr: "sac", art: "un", en: "a bag", f: false },
  { fr: "livre", art: "un", en: "a book", f: false },
  { fr: "cahier", art: "un", en: "an exercise book", f: false },
  { fr: "téléphone", art: "un", en: "a phone", f: false },
  { fr: "stylo", art: "un", en: "a pen", f: false },
  { fr: "crayon", art: "un", en: "a pencil", f: false },
  { fr: "trousse", art: "une", en: "a pencil case", f: true },
  { fr: "gomme", art: "une", en: "a rubber", f: true },
  { fr: "règle", art: "une", en: "a ruler", f: true },
  { fr: "clé", art: "une", en: "a key", f: true },
] as const;

/** The deck's own plural-ONLY cards. None of these has a singular. */
export const PLURALS = [
  { fr: "ciseaux", en: "scissors", f: false },
  { fr: "lunettes", en: "glasses", f: true },
  { fr: "écouteurs", en: "earphones", f: false },
  { fr: "mouchoirs", en: "tissues", f: false },
] as const;

/**
 * The rule Dan moved here from SIO-006: gender AND number pick the pronoun.
 * English has "it" and "they" for all four of these.
 */
export function pronounFor(f: boolean, plural: boolean): string {
  return plural ? (f ? "Elles" : "Ils") : f ? "Elle" : "Il";
}

export const PEOPLE = [
  { fr: "le professeur", en: "the teacher" },
  { fr: "une étudiante", en: "a student" },
  { fr: "un ami", en: "a friend" },
] as const;

export const QQC_AXES: DiceAxis[] = [
  {
    key: "kind",
    label: "What",
    options: [
      { value: "objet", label: "un objet — Qu'est-ce que c'est ?" },
      { value: "personne", label: "une personne — C'est qui ?" },
      { value: "pluriel", label: "plusieurs — Ce sont…" },
      { value: "pronom", label: "il / elle / ils / elles" },
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
    pinned?.kind === "personne" || pinned?.kind === "pluriel" ||
    pinned?.kind === "objet" || pinned?.kind === "pronom"
      ? pinned.kind
      : pick(["objet", "personne", "pluriel", "pronom"] as const);

  // « C'est un sac. » -> « IL est là. »  The four forms, on Dan's four words.
  if (kind === "pronom") {
    const plural = Math.random() < 0.5;
    const n = plural ? pick(PLURALS) : pick(OBJECTS);
    const named = plural ? `Ce sont des ${n.fr}` : `C'est ${(n as typeof OBJECTS[number]).art} ${n.fr}`;
    const p = pronounFor(n.f, plural);
    const verb = plural ? "sont" : "est";
    const correct = `${p} ${verb} là.`;
    // Every wrong option is a real error: the other gender, the other number,
    // and the verb left behind when the number changes.
    const wrong = [
      `${pronounFor(!n.f, plural)} ${verb} là.`,
      `${pronounFor(n.f, !plural)} ${plural ? "est" : "sont"} là.`,
      `${p} ${plural ? "est" : "sont"} là.`,
    ];
    return {
      meta: plural ? "ils / elles 📦" : "il / elle 🎒",
      big: `${named}.  →  ?`,
      en: `${plural ? "They're" : "It's"} ${n.en} — over there.`,
      correct,
      alternates: [`${p} ${verb} ici.`],
      easyOptions: [...new Set([correct, ...wrong])].slice(0, 4),
      med: {
        before: "",
        choices: [...new Set([p, pronounFor(!n.f, plural), pronounFor(n.f, !plural), pronounFor(!n.f, !plural)])].slice(0, 4),
        correct: p,
        after: `${verb} là.`,
      },
    };
  }

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
    const o = pick(PLURALS);
    const correct = `Ce sont des ${o.fr}.`;
    return {
      meta: "plusieurs 📦",
      big: `Qu'est-ce que c'est ?  (${o.en})`,
      en: `What is it? — They're ${o.en}.`,
      correct,
      easyOptions: [
        correct,
        `C'est des ${o.fr}.`,
        `Ce sont ${o.f ? "une" : "un"} ${o.fr}.`,
        `C'est ${o.f ? "une" : "un"} ${o.fr}.`,
      ],
      med: {
        before: "Ce sont",
        choices: [`des ${o.fr}`, `un ${o.fr}`, `une ${o.fr}`, `les ${o.fr}`],
        correct: `des ${o.fr}`,
        after: ".",
      },
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
