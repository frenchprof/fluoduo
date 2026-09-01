/**
 * The transport generator — SIO-038, « Comment tu y vas ? ».
 *
 * WHY ITS OWN FILE. The lesson declares an axis, and verify46 EXECUTES every
 * steerable generator under `node --experimental-strip-types`, which cannot
 * load a .tsx. A generator that ignores its `pinned` argument looks in source
 * exactly like one that honours it, so the axis has to live where a check can
 * roll it 200 times.
 *
 * THE STOP IS THREE FRAMES, NOT TWELVE WORDS. The deck's own letris columns
 * say what the split is — *"en — a vehicle you sit inside"* against *"à — on
 * foot or astride"* — and its last three items add a third frame, `prendre` +
 * the definite article. A learner who knows all twelve nouns and none of the
 * three frames cannot say a single one of the deck's sentences.
 *
 * EVERY FRENCH STRING BELOW IS THE DECK'S. `MODES` decomposes each item's own
 * `example` into lead · gap · mode · end, and nothing else; verify72 reassembles
 * all twelve and holds them against transport.json, because a table that has
 * drifted from its deck reads as perfectly ordinary code.
 */
import type { DiceAxis, DiceQuestion } from "./types";
import { pinnedGroup, roll } from "./axis.ts";
import { medFrom, sentence, type Slot } from "./cloze.ts";

/** `en`/`à` + the bare mode; `prendre` + the definite article. */
export type Frame = "en" | "à" | "prendre";

type Mode = {
  frame: Frame;
  /** Subject + verb, verbatim from the deck's example. */
  lead: string;
  /** What the deck marks as the item's `gap` — the preposition, or the article. */
  gap: string;
  /** The mode itself, bare: no article, no punctuation. */
  mode: string;
  /** "." or " ?" — the deck writes « Tu y vas en bus ? » with the space. */
  end: "." | " ?";
  /** The item's `exampleEn`, which is the card's prompt. */
  enFull: string;
  /** The item's `fr`/`en`, for the Mémo. */
  fr: string;
  en: string;
  emoji?: string;
};

export const MODES: Mode[] = [
  { frame: "en", lead: "J'y vais",      gap: "en", mode: "train",   end: ".",   fr: "en train",   en: "by train",      emoji: "🚄", enFull: "I go there by train." },
  { frame: "en", lead: "Tu y vas",      gap: "en", mode: "bus",     end: " ?",  fr: "en bus",     en: "by bus",        emoji: "🚌", enFull: "Are you going there by bus?" },
  { frame: "en", lead: "J'y vais",      gap: "en", mode: "métro",   end: ".",   fr: "en métro",   en: "by metro",      emoji: "🚇", enFull: "I go there by metro." },
  { frame: "en", lead: "On y va",       gap: "en", mode: "voiture", end: ".",   fr: "en voiture", en: "by car",        emoji: "🚗", enFull: "We're going there by car." },
  { frame: "en", lead: "Nous y allons", gap: "en", mode: "avion",   end: ".",   fr: "en avion",   en: "by plane",      emoji: "✈️", enFull: "We go there by plane." },
  { frame: "en", lead: "Ils y vont",    gap: "en", mode: "bateau",  end: ".",   fr: "en bateau",  en: "by boat",       emoji: "⛵", enFull: "They go there by boat." },
  { frame: "à",  lead: "J'y vais",      gap: "à",  mode: "vélo",    end: ".",   fr: "à vélo",     en: "by bike",       emoji: "🚲", enFull: "I go there by bike." },
  { frame: "à",  lead: "J'y vais",      gap: "à",  mode: "pied",    end: ".",   fr: "à pied",     en: "on foot",       emoji: "🚶", enFull: "I go there on foot." },
  { frame: "à",  lead: "Elle y va",     gap: "à",  mode: "moto",    end: ".",   fr: "à moto",     en: "by motorbike",  emoji: "🏍️", enFull: "She goes there by motorbike." },
  { frame: "prendre", lead: "Je prends",    gap: "le", mode: "métro",   end: ".",  fr: "prendre le métro",   en: "to take the metro", enFull: "I take the metro." },
  { frame: "prendre", lead: "Tu prends",    gap: "la", mode: "voiture", end: " ?", fr: "prendre la voiture", en: "to take the car",   enFull: "Are you taking the car?" },
  { frame: "prendre", lead: "Nous prenons", gap: "l'", mode: "avion",   end: ".",  fr: "prendre l'avion",    en: "to take the plane", enFull: "We take the plane." },
];

/** The deck's example, rebuilt. `sentence` glues after l' and never before it. */
export const exampleOf = (m: Mode): string =>
  sentence([{ text: m.lead }, { text: m.gap }, { text: m.mode + m.end }]);

/**
 * The gap a card offers, and it is never a mixed bag.
 *
 * `en`/`à` is the deck's own two-column contrast, so the card offers exactly
 * those two. The `prendre` frame is a different question — which article — so
 * it offers the three the deck uses and never puts a preposition beside them:
 * a four-way list would smuggle in a second question this stop does not ask.
 */
const GAP_CHOICES: Record<Frame, string[]> = {
  en: ["en", "à"],
  "à": ["en", "à"],
  prendre: ["le", "la", "l'"],
};

/**
 * The single-fault swap — the option that is wrong for ONE reason and no more.
 *
 * A distractor wrong twice over can be rejected without thinking about what the
 * card is teaching, which is why « le orange fluo » was pulled from the colours
 * lesson (Dan, 31 Aug: "orange fluo is a BAD distractor"). So `l'avion` swaps to
 * `le` — masculine, correct gender, missing only the elision the deck itself
 * records as the gap — and never to `la`, which would be wrong twice.
 */
const swapGap = (m: Mode): string =>
  m.frame === "prendre" ? (m.gap === "la" ? "le" : m.gap === "le" ? "la" : "le") : m.frame === "en" ? "à" : "en";

/** The frames as a learner picks them. The two labels are the deck's own
 *  letris column headings, shortened to fit a dropdown. */
export const TRANSPORT_AXES: DiceAxis[] = [
  { key: "frame", label: "Cadre", options: [
    { value: "en", label: "en — inside it" },
    { value: "à", label: "à — on foot or astride" },
    { value: "prendre", label: "prendre + article" },
  ] },
];

function others(pool: readonly Mode[], not: Mode, n: number): Mode[] {
  const rest = pool.filter((x) => x !== not);
  const out: Mode[] = [];
  while (out.length < n && rest.length) out.push(rest.splice(Math.floor(Math.random() * rest.length), 1)[0]);
  return out;
}

export function transportQuestion(pinned?: Record<string, string>): DiceQuestion {
  const m = roll(pinnedGroup(MODES, pinned?.frame, (x) => x.frame));

  // The pool a card draws its wrong answers from is its OWN contrast. For the
  // prepositions that is all nine en/à items, because en-against-à is the
  // lesson; for `prendre` it is the three that take an article. Crossing the
  // two would offer « Je prends le métro. » against « I go there by train. » —
  // rejectable on the verb alone, which teaches nothing.
  const pool = m.frame === "prendre" ? MODES.filter((x) => x.frame === "prendre") : MODES.filter((x) => x.frame !== "prendre");

  // Reading order is withdrawal order here: the deck's `gap` IS the leftmost
  // blankable slot, so ★ asks for the frame and ★★★ asks for the frame and the
  // mode together. No `first` claim needed.
  const slots: Slot[] = [
    { text: m.lead },
    { key: "gap", text: m.gap, choices: GAP_CHOICES[m.frame] },
    {
      key: "mode",
      text: m.mode + m.end,
      // Every choice wears THIS card's punctuation, so the "?" cannot mark out
      // which sentence a fragment came from.
      choices: [m.mode, ...others(pool, m, 3).map((o) => o.mode)].map((w) => w + m.end),
    },
  ];

  const correct = sentence(slots);
  const swapped = sentence([{ text: m.lead }, { text: swapGap(m) }, { text: m.mode + m.end }]);

  return {
    // The stop's own question, from the SIO record (« Tu y vas comment ? »).
    // It names neither the frame nor the mode, so it stays honest at ★★★ where
    // both are blanked.
    meta: "Tu y vas comment ?",
    big: m.enFull,
    bigLang: "en" as const,
    correct,
    easyOptions: [correct, swapped, ...others(pool, m, 2).map((o) => exampleOf(o))],
    slots,
    med: medFrom(slots, "gap"),
  };
}
