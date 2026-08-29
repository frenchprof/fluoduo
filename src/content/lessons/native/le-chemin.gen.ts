/**
 * « Quel est le chemin pour aller à la gare ? » — the generator for SIO-036.
 *
 * WHY THIS LESSON EXISTS. The stop promises two acts — "I can ask for AND give
 * simple directions to a place, without using commands" — and its deck does
 * the second one well. `directions-matching` pairs eight verb phrases with
 * thirteen completions:
 *
 *     Vous sortez     ->  du parc · de la station de métro
 *     Vous tournez    ->  à gauche · à droite
 *     Vous prenez     ->  la Xᵉ rue à gauche · le passage piéton
 *     Vous êtes       ->  arrivé(e)
 *
 * All present tense, no imperatives — exactly the "without using commands"
 * half. What no card carries is the ASKING. « Quel est le chemin pour … ? »
 * appears once, as the deck's own TITLE, and nowhere a learner is asked to
 * produce it. That is the same shape as SIO-003, where « s'écrit » lived only
 * in a Mémo while SIO-010's atelier expected the learner to perform it.
 *
 * So this lesson is the question half, drilled against the deck's own answers.
 * The giving side is reproduced only as the reply to the question, never
 * re-taught — SIO-035 (« Où est … ? ») owns locating, and this stop sits
 * directly after it precisely so the two chain.
 *
 * The one thing a beginner cannot guess is « pour aller à » + the contracted
 * article — « pour aller AU musée », not « à le musée » — which is the same
 * contraction SIO-035 teaches with `de`. Reusing it here is the point of the
 * two stops being neighbours.
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** Places from the same Unit-3 vocabulary SIO-035's lesson draws on. */
export const PLACES = [
  { fr: "gare", art: "la", en: "the station" },
  { fr: "poste", art: "la", en: "the post office" },
  { fr: "pharmacie", art: "la", en: "the chemist" },
  { fr: "banque", art: "la", en: "the bank" },
  { fr: "musée", art: "le", en: "the museum" },
  { fr: "parc", art: "le", en: "the park" },
  { fr: "marché", art: "le", en: "the market" },
  { fr: "cinéma", art: "le", en: "the cinema" },
  { fr: "hôpital", art: "l'", en: "the hospital" },
  { fr: "office de tourisme", art: "l'", en: "the tourist office" },
  { fr: "toilettes", art: "les", en: "the toilets", pl: true },
] as const;

type Place = (typeof PLACES)[number] & { pl?: boolean };

/**
 * « pour aller AU musée ». à + le -> au, à + les -> aux; la and l' do not move.
 * The mirror of SIO-035's de + le -> du, and the reason these two stops are
 * neighbours on the map.
 */
export function aPlace(p: Place): string {
  if (p.art === "le") return `au ${p.fr}`;
  if (p.art === "les") return `aux ${p.fr}`;
  if (p.art === "l'") return `à l'${p.fr}`;
  return `à la ${p.fr}`;
}

/** What « à + article » looks like uncontracted — the error to offer. */
export function aUncontracted(p: Place): string {
  return p.art === "l'" ? `à l'${p.fr}` : `à ${p.art} ${p.fr}`;
}

export function withArticle(p: Place): string {
  return p.art === "l'" ? `l'${p.fr}` : `${p.art} ${p.fr}`;
}

/** The three ways to ask, commonest first. All are questions, none a command. */
export const ASKS = [
  {
    key: "chemin",
    build: (p: Place) => `Quel est le chemin pour aller ${aPlace(p)} ?`,
    en: (p: Place) => `What is the way to ${p.en}?`,
    label: "Quel est le chemin… ?",
  },
  {
    key: "comment",
    build: (p: Place) => `Comment on va ${aPlace(p)} ?`,
    en: (p: Place) => `How do you get to ${p.en}?`,
    label: "Comment on va… ?",
  },
  {
    key: "cherche",
    build: (p: Place) => `Pardon, je cherche ${withArticle(p)}.`,
    en: (p: Place) => `Excuse me, I'm looking for ${p.en}.`,
    label: "Pardon, je cherche…",
  },
] as const;

/** The deck's own giving phrases — the replies, not re-taught. */
export const REPLIES = [
  "Vous allez tout droit.",
  "Vous tournez à gauche.",
  "Vous tournez à droite.",
  "Vous prenez la deuxième rue à gauche.",
  "Vous continuez jusqu'au carrefour.",
  "Vous traversez la place.",
] as const;

export const CHEMIN_AXES: DiceAxis[] = [
  { key: "ask", label: "Comment demander ?", options: ASKS.map((a) => ({ value: a.key, label: a.label })) },
  { key: "place", label: "Quel lieu ?", options: PLACES.map((p) => ({ value: p.fr, label: withArticle(p) })) },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const dedupe = (xs: string[]): string[] => [...new Set(xs)];

function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function cheminQuestion(pinned?: Record<string, string>): DiceQuestion {
  const ask = ASKS.find((a) => a.key === pinned?.ask) ?? pick(ASKS);
  const place = PLACES.find((p) => p.fr === pinned?.place) ?? pick(PLACES);
  const correct = ask.build(place);

  // The distractors are the two real errors: the contraction left undone
  // (« pour aller à le musée »), and an imperative, which the stop's own
  // can-do rules out — "without using commands".
  const wrong: string[] = [];
  if (ask.key !== "cherche" && aUncontracted(place) !== aPlace(place)) {
    wrong.push(correct.replace(aPlace(place), aUncontracted(place)));
  }
  if (ask.key === "chemin") wrong.push(`Quel est le chemin pour aller ${withArticle(place)} ?`);
  if (ask.key === "comment") wrong.push(`Comment on va ${withArticle(place)} ?`);
  if (ask.key === "cherche") wrong.push(`Pardon, je cherche ${aPlace(place)}.`);
  for (const a of others(ASKS, ask, ASKS.length - 1)) {
    if (wrong.length >= 3) break;
    const t = a.build(place);
    if (t !== correct && !wrong.includes(t)) wrong.push(t);
  }

  const isCherche = ask.key === "cherche";
  return {
    meta: isCherche ? "demander 🧭" : "+ à 🔗",
    big: `${ask.label}  →  ${withArticle(place)}`,
    en: ask.en(place),
    correct,
    easyOptions: dedupe([correct, ...wrong]).slice(0, 4),
    med: isCherche
      ? {
          before: "Pardon, je cherche",
          choices: dedupe([withArticle(place), aPlace(place), aUncontracted(place), place.fr]).slice(0, 4),
          correct: withArticle(place),
          after: ".",
        }
      : {
          before: ask.key === "chemin" ? "Quel est le chemin pour aller" : "Comment on va",
          choices: dedupe([aPlace(place), aUncontracted(place), withArticle(place), `de ${withArticle(place)}`]).slice(0, 4),
          correct: aPlace(place),
          after: "?",
        },
  };
}
