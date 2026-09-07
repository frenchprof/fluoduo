/**
 * « Je voudrais un kilo de tomates. Ça fait combien ? » — SIO-044's generator.
 *
 * WHY THIS LESSON EXISTS. This can-do names four acts — "I can shop for food,
 * ASK THE PRICE, ask for what I want POLITELY, and handle a simple market
 * exchange ON EITHER SIDE OF THE STALL" — and the `commerces` deck is fourteen
 * shop NAMES sorted by article: un marché, une boulangerie, des commerces.
 * Useful, and none of it is the exchange. Nothing in the deck asks a price,
 * requests anything, or answers as the stallholder.
 *
 * Both sides matter, because the can-do says so. A learner who only ever plays
 * the customer cannot follow the reply, and the reply is where the numbers
 * live.
 *
 * The politeness is the grammar here, not a manner: « je voudrais » is the
 * conditional of `vouloir` and the whole reason the request is not rude.
 * « Je veux un kilo de tomates » is what a child says. That contrast is the
 * lesson's one real rule, and it is drilled as a distractor rather than
 * explained.
 *
 * Quantities take DE with no article — « un kilo DE tomates », never « un kilo
 * des tomates » — which is the same shape SIO-035 teaches and the second thing
 * a beginner gets wrong here.
 */
import type { DiceAxis, DiceQuestion } from "./types";

/** Market goods, with the gender the price reply needs. */
export const GOODS = [
  { fr: "tomates", en: "tomatoes", unit: "un kilo" },
  { fr: "pommes", en: "apples", unit: "un kilo" },
  { fr: "fraises", en: "strawberries", unit: "une barquette" },
  { fr: "carottes", en: "carrots", unit: "un kilo" },
  { fr: "oranges", en: "oranges", unit: "un kilo" },
  { fr: "pommes de terre", en: "potatoes", unit: "un kilo" },
  { fr: "œufs", en: "eggs", unit: "une douzaine" },
  { fr: "baguettes", en: "baguettes", unit: "deux" },
] as const;

type Good = (typeof GOODS)[number];

/** Prices that use the 70–99 band SIO-045 teaches, plus simpler ones. */
export const PRICES = [
  { cents: 250, fr: "deux euros cinquante" },
  { cents: 300, fr: "trois euros" },
  { cents: 475, fr: "quatre euros soixante-quinze" },
  { cents: 580, fr: "cinq euros quatre-vingts" },
  { cents: 690, fr: "six euros quatre-vingt-dix" },
  { cents: 799, fr: "sept euros quatre-vingt-dix-neuf" },
] as const;

/** The two roles the can-do insists on — the stall has two sides. */
export const ROLES = [
  { key: "client", label: "Customer", en: "the customer" },
  { key: "vendeur", label: "Shopkeeper", en: "the stallholder" },
] as const;

export const MARCHE_AXES: DiceAxis[] = [
  { key: "role", label: "Who speaks", options: ROLES.map((r) => ({ value: r.key, label: r.label })) },
  { key: "good", label: "What", options: GOODS.map((g) => ({ value: g.fr, label: g.fr })) },
];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const dedupe = (xs: string[]): string[] => [...new Set(xs)];

function others<T>(a: readonly T[], not: T, n: number): T[] {
  const rest = a.filter((x) => x !== not);
  const out: T[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

/** « un kilo de tomates » — quantity + DE, never « de les » or « des ».
 *  DE elides before a vowel: « une douzaine d'œufs », « un kilo d'oranges » —
 *  the answer key used to serve « de œufs » in the very drill that teaches
 *  quantity-DE (found by executing the generator, 31 Aug). */
export function quantityOf(g: Good): string {
  const de = /^[aeiouéèêàhœ]/i.test(g.fr) ? "d'" : "de ";
  return `${g.unit} ${de}${g.fr}`;
}

export function marcheQuestion(pinned?: Record<string, string>): DiceQuestion {
  const role = ROLES.find((r) => r.key === pinned?.role) ?? pick(ROLES);
  const good = GOODS.find((g) => g.fr === pinned?.good) ?? pick(GOODS);

  if (role.key === "client") {
    const correct = `Je voudrais ${quantityOf(good)}.`;
    const wrong = dedupe([
      // The rudeness error, which is the point of the lesson.
      `Je veux ${quantityOf(good)}.`,
      // The quantity error: de + article, where quantities take bare `de`.
      `Je voudrais ${good.unit} des ${good.fr}.`,
      ...others(GOODS, good, 1).map((g) => `Je voudrais ${quantityOf(g)}.`),
    ]);
    return {
      meta: "le client 🧺",
      big: `Vous voulez ${good.unit} de ${good.fr}. Demandez poliment.`,
      en: `Ask politely for ${good.unit} of ${good.en}.`,
      correct,
      alternates: [`Je voudrais ${quantityOf(good)}`],
      easyOptions: dedupe([correct, ...wrong]).slice(0, 4),
      med: {
        before: "Je voudrais",
        choices: dedupe([
          quantityOf(good),
          `${good.unit} des ${good.fr}`,
          `${good.unit} du ${good.fr}`,
          good.fr,
        ]).slice(0, 4),
        correct: quantityOf(good),
        after: ".",
      },
    };
  }

  // The stallholder's side: the price, which is where the numbers live.
  //
  // The prompt names the GOODS, and must. The first version asked a bare
  // « Ça fait combien ? », which made the `good` axis inert on this half — pin
  // "tomates" and half your cards were identical to pinning "œufs". The
  // parallel session's verify46 caught it by sampling every option and finding
  // no disjoint pair. It was also weaker content: a price with nothing priced.
  const price = pick(PRICES);
  const correct = `Ça fait ${price.fr}.`;
  return {
    meta: "le vendeur 💶",
    big: `« ${quantityOf(good)} — ça fait combien ? »  →  ${(price.cents / 100).toFixed(2).replace(".", ",")} €`,
    en: `${good.unit} of ${good.en} — that's ${(price.cents / 100).toFixed(2)} euros.`,
    correct,
    alternates: [`Ça fait ${price.fr}`, `C'est ${price.fr}.`],
    easyOptions: dedupe([
      correct,
      ...others(PRICES, price, 3).map((p) => `Ça fait ${p.fr}.`),
    ]).slice(0, 4),
    med: {
      before: "Ça fait",
      choices: dedupe([price.fr, ...others(PRICES, price, 3).map((p) => p.fr)]).slice(0, 4),
      correct: price.fr,
      after: ".",
    },
  };
}
