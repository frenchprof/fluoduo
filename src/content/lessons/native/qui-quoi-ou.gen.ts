/**
 * « Qui est-ce ? Qu'est-ce que c'est ? Où est le livre ? » — SIO-006's
 * generator.
 *
 * WHY THIS LESSON EXISTS, and a qualification. The can-do is "I can say whether
 * a noun is masculine or feminine, AND ANSWER Where is it? Who is it? What is
 * it? with it", and the `core-nouns` deck genuinely teaches most of that: its
 * four letris columns are QUI (m) · QUI (f) · QUOI (m) · QUOI (f), so both the
 * gender and the person/thing split are already drilled. I flagged this stop as
 * the weakest of the eight candidates for exactly that reason, and Dan asked
 * for it anyway — which is the right call, because sorting a tile into a
 * column is not the same act as answering a question with it.
 *
 * A CORRECTION, because the first version of this comment was wrong. I wrote
 * that « Qui est-ce ? » and « Où ? » "appear nowhere". They do: all eighteen
 * cards of `collections/core-nouns.json` carry an example, and those examples
 * are « C'est qui ? — C'est un homme. » and « C'est où ? — C'est une classe. »
 * I had read `src/content/core-nouns.json` — the letris TILE file — and never
 * the card collection beside it. Twenty deck names exist in both places, and
 * my audit resolved them by basename and took the first hit.
 *
 * So the questions were already taught. What is genuinely absent is the RULE
 * below: the deck answers « C'est où ? » with « C'est une classe », never with
 * a pronoun, so nothing anywhere says that a book is `il`.
 *
 * THE RULE THIS DRILLS is that gender does not stop at the article. It picks
 * the pronoun too:
 *
 *     un livre    -> C'est un livre.    -> IL est là.
 *     une table   -> C'est une table.   -> ELLE est là.
 *
 * English speakers say "it" for both and reach for « il » by default. A book
 * being `il` is the single thing here they cannot guess.
 *
 * Unit 0, so the answers stay at « Il est là », never a preposition. Locating
 * one place against another is SIO-035's, twenty-nine stops later.
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** The deck's own twenty-four tiles, with its own four columns. */
export const NOUNS = [
  { fr: "prénom", en: "first name", who: false, f: false },
  { fr: "nom", en: "surname", who: false, f: false },
  { fr: "tableau", en: "board", who: false, f: false },
  { fr: "livre", en: "book", who: false, f: false },
  { fr: "crayon", en: "pencil", who: false, f: false },
  { fr: "cahier", en: "exercise book", who: false, f: false },
  { fr: "casque", en: "headphones", who: false, f: false },
  { fr: "micro", en: "microphone", who: false, f: false },
  { fr: "salle de classe", en: "classroom", who: false, f: true },
  { fr: "table", en: "table", who: false, f: true },
  { fr: "salle", en: "room", who: false, f: true },
  { fr: "classe", en: "class", who: false, f: true },
  { fr: "chaise", en: "chair", who: false, f: true },
  { fr: "homme", en: "man", who: true, f: false },
  { fr: "étudiant", en: "student (m)", who: true, f: false },
  { fr: "professeur", en: "teacher (m)", who: true, f: false },
  { fr: "ami", en: "friend (m)", who: true, f: false },
  { fr: "garçon", en: "boy", who: true, f: false },
  { fr: "monsieur", en: "gentleman", who: true, f: false },
  { fr: "femme", en: "woman", who: true, f: true },
  { fr: "fille", en: "girl", who: true, f: true },
  { fr: "dame", en: "lady", who: true, f: true },
  { fr: "étudiante", en: "student (f)", who: true, f: true },
  { fr: "professeure", en: "teacher (f)", who: true, f: true },
] as const;

type Noun = (typeof NOUNS)[number];

/** « un livre » · « une table ». */
export function indefinite(n: Noun): string {
  return `${n.f ? "une" : "un"} ${n.fr}`;
}

/** « le livre » · « la table » · « l'homme » — elision before a vowel or h. */
export function definite(n: Noun): string {
  if (/^[aeéèêiîoôuh]/i.test(n.fr)) return `l'${n.fr}`;
  return `${n.f ? "la" : "le"} ${n.fr}`;
}

/** The rule the lesson exists for: gender picks the pronoun, not just the article. */
export function pronoun(n: Noun): string {
  return n.f ? "Elle" : "Il";
}

export const QUESTIONS = [
  { key: "qui", ask: "Qui est-ce ?", en: "Who is it?" },
  { key: "quoi", ask: "Qu'est-ce que c'est ?", en: "What is it?" },
  { key: "ou", ask: "Où est… ?", en: "Where is it?" },
] as const;

export const QUI_QUOI_AXES: DiceAxis[] = [
  { key: "question", label: "Quelle question ?", options: QUESTIONS.map((q) => ({ value: q.key, label: q.ask })) },
  { key: "noun", label: "Quel mot ?", options: NOUNS.map((n) => ({ value: n.fr, label: indefinite(n) })) },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const dedupe = (xs: string[]): string[] => [...new Set(xs)];

function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function quiQuoiQuestion(pinned?: Record<string, string>): DiceQuestion {
  const pinnedQ = QUESTIONS.find((x) => x.key === pinned?.question);
  const pinnedNoun = NOUNS.find((n) => n.fr === pinned?.noun);

  // « Qui est-ce ? » takes a person and « Qu'est-ce que c'est ? » a thing — the
  // deck's own split, which a card must respect: « Qui est-ce ? — C'est un
  // livre. » is not worth showing.
  //
  // When the two pins contradict, THE NOUN WINS and the question moves to the
  // compatible one. The first version did the opposite, and the parallel
  // session's verify46 caught it: with the question left random, a pinned noun
  // was discarded on roughly a third of draws, so pinning « chaise » produced
  // « chaise » only sometimes. Pinning a word and not getting it is the axis
  // failing at the one thing it is for.
  let q: (typeof QUESTIONS)[number];
  let noun: Noun;
  if (pinnedNoun) {
    noun = pinnedNoun;
    const fits = QUESTIONS.filter(
      (x) => x.key === "ou" || (x.key === "qui") === pinnedNoun.who,
    );
    q = pinnedQ && fits.includes(pinnedQ) ? pinnedQ : pick(fits);
  } else {
    q = pinnedQ ?? pick(QUESTIONS);
    // Typed explicitly: filtering the const tuple narrows each branch to a
    // DISJOINT literal type, so the ternary's union rejects a general Noun.
    const pool: readonly Noun[] =
      q.key === "qui" ? NOUNS.filter((n) => n.who)
      : q.key === "quoi" ? NOUNS.filter((n) => !n.who)
      : NOUNS;
    noun = pick(pool);
  }
  const pool: readonly Noun[] = noun.who ? NOUNS.filter((n) => n.who) : NOUNS.filter((n) => !n.who);

  if (q.key === "ou") {
    const correct = `${pronoun(noun)} est là.`;
    const wrongPronoun = `${noun.f ? "Il" : "Elle"} est là.`;
    return {
      meta: "où ? 📍",
      big: `Où est ${definite(noun)} ?`,
      en: `Where is ${noun.en}? — over there.`,
      correct,
      alternates: [`${pronoun(noun)} est ici.`, `${pronoun(noun)} est là`],
      easyOptions: dedupe([
        correct,
        wrongPronoun,                       // the gender error, which is the point
        `C'est ${indefinite(noun)}.`,       // answering the wrong question
        `${pronoun(noun)} est ${indefinite(noun)}.`,
      ]).slice(0, 4),
      med: {
        before: "",
        choices: dedupe([pronoun(noun), noun.f ? "Il" : "Elle", "C'est", "Où"]).slice(0, 4),
        correct: pronoun(noun),
        after: "est là.",
      },
    };
  }

  const correct = `C'est ${indefinite(noun)}.`;
  const wrongArticle = `C'est ${noun.f ? "un" : "une"} ${noun.fr}.`;
  return {
    meta: q.key === "qui" ? "qui ? 🧑" : "quoi ? 📦",
    big: `« ${q.ask} »  →  ${noun.en}`,
    en: `${q.en} — ${noun.en}.`,
    correct,
    alternates: [`C'est ${indefinite(noun)}`],
    easyOptions: dedupe([
      correct,
      wrongArticle,                          // un/une, the deck's own column split
      `${pronoun(noun)} est là.`,            // answering the wrong question
      ...others(pool, noun, 1).map((n) => `C'est ${indefinite(n)}.`),
    ]).slice(0, 4),
    med: {
      before: "C'est",
      choices: dedupe([
        indefinite(noun),
        `${noun.f ? "un" : "une"} ${noun.fr}`,
        definite(noun),
        noun.fr,
      ]).slice(0, 4),
      correct: indefinite(noun),
      after: ".",
    },
  };
}
