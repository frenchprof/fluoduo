/**
 * « La banque est à côté de la poste. » — the generator for SIO-035's lesson.
 *
 * WHY THIS LESSON EXISTS, and a correction. My audit called this stop a gap
 * because « à côté de » appears nowhere in its deck. That was wrong for the
 * same reason stop 11 was: the deck does not store sentences, it stores a
 * CLASSIFICATION, and its letris columns carry the rule —
 *
 *     ___ + (art) Noun        sur · sous · devant · derrière · dans · entre
 *     ___ + de + (art) Noun   à côté · à gauche · à droite · près · loin · en face
 *     (no noun)               ici · là · là-bas · partout
 *
 * So which prepositions take `de` IS taught. What the stop never did was put
 * two places in one sentence, which is its whole promise: "say where a place
 * is in relation to another one". Dan, 2026-08-29: "34's lesson must talk
 * about them — content to be expanded".
 *
 * The expansion is the contraction. « de + le » is « du » and « de + les » is
 * « des », and that is the one thing a learner cannot guess and the deck's
 * `avec_de` column implies without ever showing. « loin de le centre » is the
 * error this lesson exists to prevent.
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** The deck's own three groups, with its own sixteen words. */
export const SANS_DE = ["sur", "sous", "devant", "derrière", "dans", "entre"] as const;
export const AVEC_DE = ["à côté", "à gauche", "à droite", "près", "loin", "en face"] as const;
export const TOUT_SEUL = ["ici", "là", "là-bas", "partout"] as const;

/** Places from Unit 3's own `lieux` vocabulary, with their article. */
export const PLACES = [
  { fr: "poste", art: "la", en: "the post office" },
  { fr: "banque", art: "la", en: "the bank" },
  { fr: "gare", art: "la", en: "the station" },
  { fr: "pharmacie", art: "la", en: "the chemist" },
  { fr: "café", art: "le", en: "the café" },
  { fr: "cinéma", art: "le", en: "the cinema" },
  { fr: "parc", art: "le", en: "the park" },
  { fr: "musée", art: "le", en: "the museum" },
  { fr: "hôtel", art: "l'", en: "the hotel" },
  { fr: "école", art: "l'", en: "the school" },
  // The one plural place, and the reason `estOf` exists.
  { fr: "toilettes", art: "les", en: "the toilets", pl: true },
] as const;

type Place = (typeof PLACES)[number] & { pl?: boolean };

/**
 * « Les toilettes SONT à droite ». The deck has exactly one plural place, and
 * the generator shipped « Les toilettes est … » until a run over every
 * preposition x every place caught it. One item is enough to be wrong on.
 */
export function estOf(p: Place): string {
  return p.pl ? "sont" : "est";
}

/** « le parc » · « la poste » · « l'hôtel » · « les toilettes ». */
export function withArticle(p: Place): string {
  return p.art === "l'" ? `l'${p.fr}` : `${p.art} ${p.fr}`;
}

/**
 * THE CONTRACTION, which is the point of the lesson.
 *   de + le  -> du          de + les -> des
 *   de + la  -> de la       de + l'  -> de l'
 */
export function dePlace(p: Place): string {
  if (p.art === "le") return `du ${p.fr}`;
  if (p.art === "les") return `des ${p.fr}`;
  if (p.art === "l'") return `de l'${p.fr}`;
  return `de la ${p.fr}`;
}

/** What « de + article » would look like uncontracted — the error to offer. */
export function deUncontracted(p: Place): string {
  return p.art === "l'" ? `de l'${p.fr}` : `de ${p.art} ${p.fr}`;
}

export const OU_EST_AXES: DiceAxis[] = [
  {
    key: "preposition",
    label: "Où ?",
    options: [...AVEC_DE, ...SANS_DE, ...TOUT_SEUL].map((w) => ({ value: w, label: w })),
  },
  {
    key: "place",
    label: "Quel lieu ?",
    options: PLACES.map((p) => ({ value: p.fr, label: withArticle(p) })),
  },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

const dedupe = (xs: string[]): string[] => [...new Set(xs)];

export function ouEstQuestion(pinned?: Record<string, string>): DiceQuestion {
  const all = [...AVEC_DE, ...SANS_DE, ...TOUT_SEUL] as readonly string[];
  const prep = all.includes(pinned?.preposition ?? "") ? pinned!.preposition : pick(all);
  const subject = PLACES.find((p) => p.fr === pinned?.place) ?? pick(PLACES);

  // « ici / là / là-bas / partout » take no place at all — the deck's third
  // column. Answering « Elle est là-bas. » is the whole card.
  if ((TOUT_SEUL as readonly string[]).includes(prep)) {
    const correct = `${withArticle(subject).replace(/^\w/, (c) => c.toUpperCase())} ${estOf(subject)} ${prep}.`;
    // The gloss must name THE ROLLED ADVERB, not a fixed "over there / here":
    // all four options are grammatical, so a gloss that doesn't track the
    // answer left the card a coin toss (the 31 Aug ambiguity audit's top
    // finding — and when « partout » rolled, the fixed gloss pointed at the
    // three wrong options).
    const advEn: Record<string, string> = { ici: "here", "là": "there", "là-bas": "over there", partout: "everywhere" };
    return {
      meta: "sans lieu 📍",
      big: `Où ${estOf(subject)} ${withArticle(subject)} ?`,
      en: `Where is ${subject.en}? — ${advEn[prep] ?? prep}.`,
      correct,
      easyOptions: dedupe([
        correct,
        ...others(TOUT_SEUL, prep as (typeof TOUT_SEUL)[number], 3).map(
          (w) => `${withArticle(subject).replace(/^\w/, (c) => c.toUpperCase())} ${estOf(subject)} ${w}.`,
        ),
      ]).slice(0, 4),
      med: {
        before: `${withArticle(subject).replace(/^\w/, (c) => c.toUpperCase())} ${estOf(subject)}`,
        choices: dedupe([prep, ...others(TOUT_SEUL, prep as (typeof TOUT_SEUL)[number], 3)]).slice(0, 4),
        correct: prep,
        after: ".",
      },
    };
  }

  // Two places in one sentence — the promise.
  const other = pick(PLACES.filter((p) => p.fr !== subject.fr));
  const takesDe = (AVEC_DE as readonly string[]).includes(prep);
  const tail = takesDe ? `${prep} ${dePlace(other)}` : `${prep} ${withArticle(other)}`;
  const head = `${withArticle(subject).replace(/^\w/, (c) => c.toUpperCase())} ${estOf(subject)}`;
  const correct = `${head} ${tail}.`;

  // The distractors are the two real errors: the contraction left undone
  // (« loin de le centre »), and `de` used where it does not belong.
  const wrong: string[] = [];
  if (takesDe) {
    if (deUncontracted(other) !== dePlace(other)) {
      wrong.push(`${head} ${prep} ${deUncontracted(other)}.`);
    }
    wrong.push(`${head} ${prep} ${withArticle(other)}.`);
  } else {
    wrong.push(`${head} ${prep} ${dePlace(other)}.`);
  }
  for (const w of others(all, prep, all.length - 1)) {
    if (wrong.length >= 3) break;
    const t = (AVEC_DE as readonly string[]).includes(w)
      ? `${head} ${w} ${dePlace(other)}.`
      : (TOUT_SEUL as readonly string[]).includes(w)
        ? `${head} ${w}.`
        : `${head} ${w} ${withArticle(other)}.`;
    if (t !== correct && !wrong.includes(t)) wrong.push(t);
  }

  return {
    meta: takesDe ? "+ de 🔗" : "sans de",
    big: `Où ${estOf(subject)} ${withArticle(subject)} ?  (${prep} → ${withArticle(other)})`,
    en: `Where is ${subject.en}? — ${prep} ${other.en}.`,
    correct,
    easyOptions: dedupe([correct, ...wrong]).slice(0, 4),
    med: {
      before: `${head} ${prep}`,
      choices: takesDe
        ? dedupe([dePlace(other), deUncontracted(other), withArticle(other), `de ${withArticle(other)}`]).slice(0, 4)
        : dedupe([withArticle(other), dePlace(other), deUncontracted(other), other.fr]).slice(0, 4),
      correct: takesDe ? dePlace(other) : withArticle(other),
      after: ".",
    },
  };
}
