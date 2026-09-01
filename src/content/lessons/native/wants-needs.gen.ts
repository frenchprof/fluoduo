/**
 * The envies-besoins generator — SIO-039, « Je voudrais… J'ai besoin… ».
 *
 * WHY ITS OWN FILE. The lesson declares an axis, and verify46 EXECUTES every
 * steerable generator under `node --experimental-strip-types`, which cannot
 * load a .tsx. A generator that ignores its `pinned` argument looks in source
 * exactly like one that honours it.
 *
 * THE BLANK IS THE WHOLE OPENER, NOT THE VERB. The deck marks each item's
 * `gap` as the verb alone — voudrais, aimerais, besoin d', veux, envie — and
 * that cannot be the unit a card offers, because the SUBJECT changes with it:
 * « Je voudrais » against « J'ai besoin ». Blanking only the verb would put
 * « Je besoin d'un hôtel. » in a learner's mouth. So the slot is the opener
 * entire, and the deck's `gap` is asserted to sit inside it (verify76).
 *
 * ELISION DECIDES WHICH OPENERS A CARD MAY OFFER, and no opener is invented to
 * fill a gap. « J'ai envie d'un chocolat chaud » elides, « J'ai envie de
 * dormir » does not, so a card whose reason begins with a consonant offers the
 * `de` forms and one that begins with a vowel offers the `d'` forms — otherwise
 * the apostrophe is the giveaway rather than the meaning. The deck contains no
 * « J'ai besoin de », so consonant cards simply do not offer besoin: writing
 * one would be inventing French to keep a list symmetrical.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinnedGroup, roll } from "./axis.ts";
import { medFrom, sentence, type Slot } from "./cloze.ts";

/** The five ways this deck asks for something, keyed by the deck's own `gap`. */
export type Want = "voudrais" | "aimerais" | "besoin d'" | "veux" | "envie";

type Item = {
  want: Want;
  /** The opener entire, subject included, exactly as the item writes it. */
  opener: string;
  /** What is wanted, and its punctuation. */
  rest: string;
  /** The item's own English, parentheses and all — « (polite request) » and
   *  « (wish) » are what make the card answerable at all. */
  en: string;
};

export const ITEMS: Item[] = [
  { want: "voudrais", opener: "Je voudrais", rest: "un café.", en: "I would like a coffee. (polite request)" },
  { want: "voudrais", opener: "Je voudrais", rest: "visiter le Louvre.", en: "I would like to visit the Louvre. (polite request)" },
  { want: "aimerais", opener: "J'aimerais", rest: "voyager.", en: "I'd love to travel. (wish)" },
  { want: "aimerais", opener: "J'aimerais", rest: "une chambre pour deux personnes.", en: "I'd love a room for two. (wish)" },
  { want: "besoin d'", opener: "J'ai besoin d'", rest: "un hôtel.", en: "I need a hotel." },
  { want: "besoin d'", opener: "J'ai besoin d'", rest: "un plan.", en: "I need a map." },
  { want: "veux", opener: "Je veux", rest: "visiter Paris.", en: "I want to visit Paris." },
  { want: "veux", opener: "Je veux", rest: "partir en vacances.", en: "I want to go on holiday." },
  { want: "envie", opener: "J'ai envie d'", rest: "un chocolat chaud.", en: "I feel like a hot chocolate." },
  { want: "envie", opener: "J'ai envie de", rest: "dormir.", en: "I feel like sleeping." },
];

/** The item's sentence, exactly as envies-besoins.json writes it. */
export const sentenceOf = (it: Item): string =>
  sentence([{ text: it.opener }, { text: it.rest }]);

/** An opener ending in an apostrophe has elided; it can only precede a vowel. */
const elides = (opener: string): boolean => /['’]$/.test(opener);
const vowelFirst = (rest: string): boolean => /^[aeiouéèêîôûh]/i.test(rest);

/**
 * The openers a card may offer: every DISTINCT opener the deck writes whose
 * elision matches this card's reason. Never a form the deck does not contain.
 */
export function openersFor(rest: string): string[] {
  const want = vowelFirst(rest);
  const out: string[] = [];
  for (const it of ITEMS) {
    // An opener with no elision to make (« Je voudrais ») fits either way; one
    // that elides, or deliberately does not, is fixed to its side.
    const fixed = elides(it.opener) || /\bde$/.test(it.opener);
    if (fixed && elides(it.opener) !== want) continue;
    if (!out.includes(it.opener)) out.push(it.opener);
  }
  return out;
}

export const WANTS_AXES: DiceAxis[] = [
  {
    key: "want",
    label: "Envie",
    options: [
      { value: "voudrais", label: "je voudrais — polite" },
      { value: "aimerais", label: "j'aimerais — a wish" },
      { value: "besoin d'", label: "j'ai besoin — a need" },
      { value: "veux", label: "je veux — plain want" },
      { value: "envie", label: "j'ai envie — a craving" },
    ],
  },
];

function others(pool: readonly Item[], not: Item, n: number): Item[] {
  const rest = pool.filter((x) => x !== not);
  const out: Item[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function wantsQuestion(pinned?: Record<string, string>): DiceQuestion {
  const it = roll(pinnedGroup(ITEMS, pinned?.want, (x) => x.want));

  // Reading order is withdrawal order: the opener is the leftmost blankable
  // slot and is the whole lesson, so ★ takes it and ★★★ takes it with what is
  // wanted. No `first` claim needed.
  const slots: Slot[] = [
    { key: "opener", text: it.opener, choices: openersFor(it.rest) },
    {
      key: "rest",
      text: it.rest,
      // Only reasons that fit THIS card's opener, so the elision cannot mark
      // out which sentence a fragment was lifted from.
      choices: [it.rest, ...others(ITEMS.filter((o) => vowelFirst(o.rest) === vowelFirst(it.rest)), it, 3).map((o) => o.rest)],
    },
  ];

  const correct = sentence(slots);
  // The single-fault swap: the same thing wanted, asked for another way. It is
  // grammatical French — which is the point, because what makes it wrong is the
  // nuance the deck's own gloss names, not the syntax.
  const swapped = openersFor(it.rest).filter((o) => o !== it.opener);

  return {
    // The deck's title. It names no opener, so it stays honest at ★★★ where
    // the opener and the reason are both blanked.
    meta: "Envies et besoins",
    big: it.en,
    bigLang: "en" as const,
    correct,
    easyOptions: [
      correct,
      sentence([{ text: roll(swapped) }, { text: it.rest }]),
      ...others(ITEMS, it, 2).map((o) => sentenceOf(o)),
    ],
    slots,
    med: medFrom(slots, "opener"),
  };
}
