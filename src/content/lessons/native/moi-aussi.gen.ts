/**
 * « Moi aussi / Moi non plus » — the generator for SIO-011's lesson.
 *
 * WHY THIS LESSON EXISTS. SIO-011 promises the eight stressed pronouns
 * "by their position". The deck teaches two of the three positions it names:
 * `col:stress` and the `C'est ___` frame cover « c'est moi », and the letris
 * columns sort subject-only from stressed-only. (An earlier audit of mine
 * called this stop the worst in the set on the grounds that « c'est moi »
 * appears nowhere — wrong: the deck stores FRAMES, not sentences, and
 * assembles them at runtime. A literal string search could not see it.)
 *
 * What was genuinely missing was the third position. Dan's ruling,
 * 2026-08-29, on what should fill it:
 *
 *     "we don't want to see chez, sans or other prepositions.
 *      Instead of tout seul — put ... aussi / non plus"
 *
 * Both halves are right, and the second is the better lesson. « Moi aussi »
 * is the highest-frequency use a beginner has for a stressed pronoun, and it
 * carries the one trap an English speaker reliably falls into: English says
 * "me too" and "me neither", and the choice between them is governed by the
 * OTHER person's sentence, not by your own. After a negative you must say
 * « non plus » — « Moi aussi » there is the error this lesson exists to drill.
 *
 * Prepositions are out, per the ruling. They were also Unit 3 material being
 * used seven stops early, so the ruling removes a scope problem as well.
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** subject form -> stressed form. The deck's own eight pairs. */
export const PAIRS = [
  { subject: "je", stress: "moi", en: "me" },
  { subject: "tu", stress: "toi", en: "you" },
  { subject: "il", stress: "lui", en: "him" },
  { subject: "elle", stress: "elle", en: "her" },
  { subject: "nous", stress: "nous", en: "us" },
  { subject: "vous", stress: "vous", en: "you (pl.)" },
  { subject: "ils", stress: "eux", en: "them (m.)" },
  { subject: "elles", stress: "elles", en: "them (f.)" },
] as const;

/**
 * Who the follow-up question asks about, and which stressed pronoun answers
 * it. « Et toi ? » is answered « Moi … » — the pronoun FLIPS, which is half of
 * what makes this worth drilling.
 */
export const ASKED = [
  { cue: "Et toi ?", answer: "Moi", en: "And you?" },
  // « Et moi ? » is deliberately NOT here. Every statement below is first
  // person, so pairing it produced « J'ai un frère. Et moi ? » — the same
  // speaker asking about themselves. Nonsense, and no check could see it:
  // the card was well-formed in every mechanical sense. « Toi aussi » still
  // appears in the pairs table, in « C'est toi », and in the bonus, where it
  // has its natural home as the reply to a good wish.
  { cue: "Et Paul ?", answer: "Lui", en: "And Paul?" },
  { cue: "Et Léa ?", answer: "Elle", en: "And Léa?" },
  { cue: "Et vous deux ?", answer: "Nous", en: "And you two?" },
  { cue: "Et Paul et Marc ?", answer: "Eux", en: "And Paul and Marc?" },
  { cue: "Et Léa et Marie ?", answer: "Elles", en: "And Léa and Marie?" },
] as const;

/**
 * The statements being echoed. Held to what a learner has by stop 11: être and
 * avoir in the affirmative and the negative (conjugaison-u1 drills exactly
 * that), with Unit-0 nouns and numbers. No partitive « pas de », which is Unit
 * 4; no prepositions, per the ruling.
 */
export const STATEMENTS = [
  { fr: "Je suis étudiant.", en: "I'm a student.", neg: false },
  { fr: "J'ai vingt ans.", en: "I'm twenty.", neg: false },
  { fr: "Je suis français.", en: "I'm French.", neg: false },
  { fr: "J'ai un frère.", en: "I have a brother.", neg: false },
  { fr: "Je ne suis pas professeur.", en: "I'm not a teacher.", neg: true },
  { fr: "Je n'ai pas dix-huit ans.", en: "I'm not eighteen.", neg: true },
  { fr: "Je ne suis pas espagnol.", en: "I'm not Spanish.", neg: true },
  { fr: "Je n'ai pas le livre.", en: "I don't have the book.", neg: true },
] as const;

type Mode = "echo" | "cest";

export const MOI_AUSSI_AXES: DiceAxis[] = [
  {
    key: "person",
    label: "Qui ?",
    options: ASKED.map((a) => ({ value: a.answer, label: `${a.cue} → ${a.answer}` })),
  },
  {
    key: "polarity",
    label: "La phrase",
    options: [
      { value: "aff", label: "affirmative → aussi" },
      { value: "neg", label: "négative → non plus" },
    ],
  },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

/** First occurrence wins, so the correct answer keeps its place at index 0. */
const dedupe = (xs: string[]): string[] => [...new Set(xs)];

function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function echoCard(pinned?: Record<string, string>): DiceQuestion {
  const who = ASKED.find((a) => a.answer === pinned?.person) ?? pick(ASKED);
  const wantNeg =
    pinned?.polarity === "neg" ? true : pinned?.polarity === "aff" ? false : Math.random() < 0.5;
  const st = pick(STATEMENTS.filter((s) => s.neg === wantNeg));

  // « non plus » after a negative, « aussi » after an affirmative. The tail is
  // decided by the OTHER person's sentence, which is the whole point.
  const tail = wantNeg ? "non plus" : "aussi";
  const wrongTail = wantNeg ? "aussi" : "non plus";
  const correct = `${who.answer} ${tail}.`;

  // The distractors are the two real errors: the right pronoun with the wrong
  // tail (the English-speaker trap), and the SUBJECT form in a stressed slot
  // (« Je aussi »), which is what the deck's subject/stress split is about.
  //
  // Four of the eight pronouns do not change shape — elle, nous, vous, elles —
  // so for those the subject-form distractor IS the answer and has to be
  // dropped rather than offered twice. Caught by executing the generator: it
  // produced ["Elle aussi.", "Elle non plus.", "Elle aussi.", …].
  const subjectForm =
    PAIRS.find((p) => p.stress.toLowerCase() === who.answer.toLowerCase())?.subject ?? "je";
  const cap = (w: string) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`;
  const options: string[] = [correct, `${who.answer} ${wrongTail}.`];
  if (subjectForm.toLowerCase() !== who.answer.toLowerCase()) {
    options.push(`${cap(subjectForm)} ${tail}.`);
  }
  // Top up with other people until there are four DISTINCT options, so a
  // shape-invariant pronoun still gets a full set.
  for (const o of others(ASKED, who, ASKED.length - 1)) {
    if (options.length >= 4) break;
    const cand = `${o.answer} ${tail}.`;
    if (!options.includes(cand)) options.push(cand);
  }

  return {
    meta: wantNeg ? "négatif → non plus 🚫" : "affirmatif → aussi ✅",
    big: `« ${st.fr} ${who.cue} »`,
    en: `${st.en} ${who.en}`,
    correct,
    easyOptions: options.slice(0, 4),
    med: {
      before: who.answer,
      choices: [tail, wrongTail, "oui", "non"],
      correct: tail,
      after: ".",
    },
  };
}

/**
 * « C'est ___ » — the position the deck already frames.
 *
 * Named `cestCard`, not `cestQuestion`: a module must expose exactly ONE
 * `*Question` export, because verify46 finds a lesson's generator by that
 * suffix and an ES module namespace is sorted ALPHABETICALLY — so three
 * `*Question` exports meant it sampled `cestQuestion`, which reads only
 * `person` and ignores `polarity`, and correctly reported the polarity pin as
 * dead. The check was right; the module's public surface was wrong.
 */
export function cestCard(pinned?: Record<string, string>): DiceQuestion {
  const who = ASKED.find((a) => a.answer === pinned?.person) ?? pick(ASKED);
  const correct = `C'est ${who.answer.toLowerCase()}.`;
  const subjectForm =
    PAIRS.find((p) => p.stress.toLowerCase() === who.answer.toLowerCase())?.subject ?? "je";
  // « Qui est-ce ? — Et Paul ? » read as two questions. The cue's "Et " is for
  // the echo drill; strip it here so the prompt names a person.
  const naming = who.cue.replace(/^Et\s+/, "").replace(/\s*\?$/, "");
  return {
    meta: "après c'est",
    big: `Qui est-ce ? (${naming})`,
    en: `Who is it? ${who.en}`,
    correct,
    easyOptions: dedupe([
      correct,
      `C'est ${subjectForm}.`,
      ...others(ASKED, who, 3).map((o) => `C'est ${o.answer.toLowerCase()}.`),
    ]).slice(0, 4),
    med: {
      before: "C'est",
      choices: dedupe([
        who.answer.toLowerCase(),
        subjectForm,
        ...others(ASKED, who, 3).map((o) => o.answer.toLowerCase()),
      ]).slice(0, 4),
      correct: who.answer.toLowerCase(),
      after: ".",
    },
  };
}

/** The one public entry point: what the lesson wires to `newQuestion`. */
export function stressQuestion(pinned?: Record<string, string>): DiceQuestion {
  const mode: Mode = pinned?.mode === "cest" ? "cest" : "echo";
  return mode === "cest" ? cestCard(pinned) : echoCard(pinned);
}
