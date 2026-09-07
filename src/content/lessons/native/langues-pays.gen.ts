/**
 * « En France, on parle français. » — the generator for SIO-017's lesson.
 *
 * WHY THIS LESSON EXISTS. SIO-017 promises "I can say WHICH LANGUAGE(S) ARE
 * SPOKEN IN A GIVEN COUNTRY", and its deck is nineteen language *names* —
 * l'anglais, le chinois, le hindi. « parle » appears once in the whole stop.
 * Nothing anywhere joined a country to its language, which is the entire
 * promise: a learner finished able to say "le japonais" and unable to say who
 * speaks it. (Dan, 2026-08-28: "3, 17, 18 fill the content".)
 *
 * SCOPE DISCIPLINE. Every country here is one the learner has already met in
 * the `nationalities` deck (SIO-016), and every language is one from this
 * stop's own deck. Countries whose language the course never teaches — Grèce
 * (grec), Cambodge (khmer) — are deliberately LEFT OUT rather than answered
 * with a word the learner has no way to know. Filling a gap with a second gap
 * is not filling it.
 *
 * The preposition rides along because it cannot be avoided — you cannot say
 * this sentence without choosing en / au / aux. It is SIO-032's grammar, met
 * here in service of this stop's own promise rather than taught from scratch.
 */
import type { DiceAxis, DiceQuestion } from "./types";

/**
 * `prep` follows the country's article, which the learner already sorted in
 * SIO-015/016: la / l' → en · le → au · les → aux · no article → à.
 * `langs` is every language the course can name for that country; the first
 * is the one a single-answer question expects.
 */
export const PLACES = [
  { country: "France",          prep: "en",  langs: ["le français"] },
  { country: "Portugal",        prep: "au",  langs: ["le portugais"] },
  { country: "Chine",           prep: "en",  langs: ["le chinois"] },
  { country: "Indonésie",       prep: "en",  langs: ["l'indonésien"] },
  { country: "Corée",           prep: "en",  langs: ["le coréen"] },
  { country: "États-Unis",      prep: "aux", langs: ["l'anglais"] },
  { country: "Mexique",         prep: "au",  langs: ["l'espagnol"] },
  { country: "Cuba",            prep: "à",   langs: ["l'espagnol"] },
  { country: "Argentine",       prep: "en",  langs: ["l'espagnol"] },
  { country: "Russie",          prep: "en",  langs: ["le russe"] },
  { country: "Turquie",         prep: "en",  langs: ["le turc"] },
  { country: "Allemagne",       prep: "en",  langs: ["l'allemand"] },
  { country: "Malaisie",        prep: "en",  langs: ["le malais"] },
  { country: "Thaïlande",       prep: "en",  langs: ["le thaï"] },
  { country: "Angleterre",      prep: "en",  langs: ["l'anglais"] },
  { country: "Grande-Bretagne", prep: "en",  langs: ["l'anglais"] },
  { country: "Tunisie",         prep: "en",  langs: ["l'arabe"] },
  { country: "Maroc",           prep: "au",  langs: ["l'arabe"] },
  { country: "Algérie",         prep: "en",  langs: ["l'arabe"] },
  { country: "Philippines",     prep: "aux", langs: ["le filipino", "l'anglais"] },
  // Two countries where the honest answer is a LIST, which is why the SIO says
  // "language(s)". Singapour is the learner's own country (NUS) and the
  // clearest case in the set: four official languages, all four in the deck.
  { country: "Singapour",       prep: "à",   langs: ["l'anglais", "le chinois", "le malais", "le tamoul"] },
  { country: "Suisse",          prep: "en",  langs: ["le français", "l'allemand"] },
] as const;

/** « en France » · « au Portugal » · « aux États-Unis » · « à Singapour ». */
export function placePhrase(p: { prep: string; country: string }): string {
  return `${p.prep} ${p.country}`;
}

/** Article-stripped for « on parle français » (no article after parler). */
export function bareLang(l: string): string {
  return l.replace(/^(le |la |l')/, "");
}

type Mode = "lang" | "prep";

export const LANGUES_AXES: DiceAxis[] = [
  { key: "country", label: "Country", options: PLACES.map((p) => ({ value: p.country, label: p.country })) },
  {
    key: "mode",
    label: "Question",
    options: [
      { value: "lang", label: "quelle langue ?" },
      { value: "prep", label: "en / au / aux ?" },
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

export function languesPaysQuestion(pinned?: Record<string, string>): DiceQuestion {
  const p = PLACES.find((x) => x.country === pinned?.country) ?? pick(PLACES);
  const mode: Mode = pinned?.mode === "lang" || pinned?.mode === "prep"
    ? pinned.mode
    : pick(["lang", "prep"] as const);
  const where = placePhrase(p);
  const bare = bareLang(p.langs[0]);

  if (mode === "prep") {
    // The preposition, with the country fixed — the three wrong forms are the
    // three the learner must choose between, never a random word.
    const correct = `On parle ${bare} ${where}.`;
    const wrongPreps = (["en", "au", "aux", "à"] as const).filter((x) => x !== p.prep).slice(0, 3);
    return {
      meta: "en / au / aux 🗺️",
      big: `${p.country} → ${bare}`,
      en: `They speak ${bare} in ${p.country}.`,
      correct,
      easyOptions: [correct, ...wrongPreps.map((w) => `On parle ${bare} ${w} ${p.country}.`)],
      med: {
        before: `On parle ${bare}`,
        choices: [p.prep, ...wrongPreps],
        correct: p.prep,
        after: `${p.country}.`,
      },
    };
  }

  // Which language — the stop's own promise.
  //
  // Distractors are drawn from DISTINCT LANGUAGES, not from distinct countries.
  // Picking three other countries produced duplicate options wherever a
  // language is shared — Mexique / Cuba / Argentine all answer "espagnol", and
  // Tunisie / Maroc / Algérie all answer "arabe", so a four-option question
  // could offer "espagnol" twice. Caught by executing the generator 3000 times.
  const head = `${where.charAt(0).toUpperCase()}${where.slice(1)}`;
  const mine = new Set(p.langs.map(bareLang));
  const pool = [...new Set(PLACES.flatMap((x) => x.langs.map(bareLang)))].filter((l) => !mine.has(l));
  const wrongLangs = others(pool, "", 3);
  return {
    meta: p.langs.length > 1 ? "plusieurs langues 🗣️" : "quelle langue ? 🗣️",
    big: p.country,
    en: p.langs.length > 1
      ? `In ${p.country} they speak ${p.langs.map(bareLang).join(", ")} — give one.`
      : `Which language is spoken in ${p.country}?`,
    correct: `${head}, on parle ${bare}.`,
    // A multilingual country has more than one right answer, and the learner
    // must not be marked wrong for giving the second one.
    alternates: p.langs.slice(1).map((l) => `${head}, on parle ${bareLang(l)}.`),
    easyOptions: [`${head}, on parle ${bare}.`, ...wrongLangs.map((l) => `${head}, on parle ${l}.`)],
    med: {
      before: `${head}, on parle`,
      choices: [bare, ...wrongLangs],
      correct: bare,
      after: ".",
    },
  };
}
