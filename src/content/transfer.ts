/**
 * TRANSFER ITEMS — words the app never teaches, asked once, to find out
 * whether a rule was learned or a list was memorised.
 *
 * Dan, 2026-09-14: *"WE WANT TO APPROACH INDIRECTLY VIA APPLICATION OF
 * KNOWLEDGE, E.G. for luxembourgeois, do we have any other nationality that
 * covers similar endings -geois(e)"*.
 *
 * IT DOES, AND THAT IS THE POINT. Grouping goal 16's twenty-five nationalities
 * by how they make their feminine gives four families, and the lesson already
 * prints the rules in its own summary box:
 *
 *     -ien → -ienne          7   indonésien, cambodgien, singapourien,
 *                                malaisien, tunisien, algérien, coréen
 *     -in  → -ine            6   américain, mexicain, cubain, philippin,
 *                                argentin, marocain
 *     ends in -s, add -e     5   français, portugais, CHINOIS, thaïlandais,
 *                                anglais
 *     no change              4   russe, suisse, belge, britannique
 *
 * So « luxembourgeois » is the « chinois → chinoise » shape exactly, and
 * « indien » is the « singapourien → singapourienne » shape. NEITHER NEEDS
 * ADDING TO THE DECK, and adding them would cost something: goal 15's
 * countries and goal 16's nationalities are lock-stepped one to one, same
 * subjects in the same order, so a 26th entry in one silently desynchronises
 * two decks and the two games that read them.
 *
 * WHAT WAS ACTUALLY MISSING is smaller and sharper: every nationality the app
 * ever asks for is one of the twenty-five it taught. Nothing distinguishes a
 * learner who knows the rule from one who memorised twenty-five pairs — which
 * is the only distinction that matters the moment they meet a word on a page.
 *
 * SO THESE ARE NOT DECK ITEMS, and they are deliberately not stored as any.
 * They are asked once, at the end of a run, and they are NOT SCORED: a miss
 * on a word the app never taught must not dent accuracy, cost XP, or enter
 * the review queue. That is the treatment SpecuLearn's pre-lesson answers
 * already get — verify40, *"remember it, but don't score it"*, 27 Aug — and
 * for the same reason: you cannot mark someone wrong for not knowing
 * something you never told them.
 */

export type TransferItem = {
  /** The form shown. The learner supplies the other one. */
  ms: string;
  /** The answer. */
  fs: string;
  en: string;
  /** The rule that produces it — shown AFTER answering, right or wrong. */
  rule: string;
  /** A word from the taught deck that behaves the same way. This is the
   *  whole teaching: not "you were wrong", but "you already know this one". */
  like: string;
};

/** Keyed by deck id, so a deck without transfer items simply has none and
 *  every surface that asks for them gets an empty list. */
export const TRANSFER: Record<string, TransferItem[]> = {
  nationalities: [
    { ms: "luxembourgeois", fs: "luxembourgeoise", en: "Luxembourgish",
      rule: "ends in -s → add -e", like: "chinois → chinoise" },
    { ms: "indien", fs: "indienne", en: "Indian",
      rule: "-ien → -ienne", like: "singapourien → singapourienne" },
    { ms: "italien", fs: "italienne", en: "Italian",
      rule: "-ien → -ienne", like: "cambodgien → cambodgienne" },
    { ms: "libanais", fs: "libanaise", en: "Lebanese",
      rule: "ends in -s → add -e", like: "portugais → portugaise" },
    { ms: "danois", fs: "danoise", en: "Danish",
      rule: "ends in -s → add -e", like: "chinois → chinoise" },
    { ms: "brésilien", fs: "brésilienne", en: "Brazilian",
      rule: "-ien → -ienne", like: "tunisien → tunisienne" },
    { ms: "égyptien", fs: "égyptienne", en: "Egyptian",
      rule: "-ien → -ienne", like: "algérien → algérienne" },
    { ms: "hollandais", fs: "hollandaise", en: "Dutch",
      rule: "ends in -s → add -e", like: "thaïlandais → thaïlandaise" },
  ],
};

/** The transfer items a deck has, or none.
 *
 *  EVERY WORD HERE IS CHECKED AGAINST THE DECK by verify700: a transfer item
 *  that the deck already teaches is not a transfer item, it is a duplicate,
 *  and it would prove nothing. */
export function transferFor(deckId: string): TransferItem[] {
  return TRANSFER[deckId] ?? [];
}
