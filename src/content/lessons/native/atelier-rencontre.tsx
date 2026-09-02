/**
 * Native « Atelier — Première rencontre » lesson — SIO-010, written 2026-09-01.
 *
 * THE PROTOTYPE FOR THE ATELIER SHAPE. Colour review's handover asks for six of
 * these and names this one the one to prototype on. `concept` is deliberately
 * absent — that is the concepts lane's, and verify75 asserts the field stays
 * empty so a stub of mine cannot read to a learner as the real argument.
 *
 * THE MÉMO IS THE MODEL, AND IT HAD TO STAY THAT WAY — THE TRAP IN THIS JOB.
 * `LessonPager` resolves the panel as
 *
 *     memo={lesson?.memo ?? memoForDeck(collectionId)}
 *
 * so the mere act of registering a lesson for an atelier REPLACES whatever
 * `memos.tsx` generated for that deck. Every atelier deck already has a Mémo
 * there — « Le modèle », the whole dialogue with « Tout écouter » — and Dan
 * asked for exactly that on 31 Aug: *"Atelier's Memo is to open on the range of
 * sentences and vocabulary one is expected to use or understand."* An atelier
 * lesson that authored its own Mémo would delete the model from the one panel
 * an atelier OPENS on, and verify71 would not notice: it reads memos.tsx, which
 * would still be perfectly correct. So this file passes the generated Mémo
 * through unchanged, and verify75 asserts it does.
 *
 * WHAT THE LESSON ADDS IS THE REGISTER. The model is `tu` throughout; the
 * stop's competence asks for all three audiences — "tu, vous, or the plural
 * vous of a group (≥6/7 steps in each of the 3)". The deck deals the model's
 * nine turns and cannot ask for the other two registers, because it does not
 * contain them. `atelier-rencontre.gen.ts` drills exactly that, out of the
 * three audiences already authored in SIO010_SITUATIONS.
 *
 * WHY THE THREE-AUDIENCE GRID IS NOT PRINTED HERE. It would be a fine Mémo and
 * it is the wrong place for one: SIO010_SITUATIONS is this stop's own Unit-0
 * pre-test, and a grid of its correct answers on the panel the atelier opens on
 * is the same fault the popup was corrected for on 31 Aug — *"the dialogue is
 * that stop's PRE-TEST ANSWER KEY"* (verify66, verify71). The contrast belongs
 * in `concept`, behind the Idea tab, which a learner opens on purpose. It is
 * the argument, and the argument is colour review's to write.
 */
import type { NativeLesson } from "./types";
import { memoForDeck } from "@/content/memos";
import { ATELIER_DIALOGUES } from "@/content/ateliers";
import { RENCONTRE_AXES, rencontreQuestion } from "./atelier-rencontre.gen";

/** The deck id `atelierDecks.ts` builds for this stop, and the key its Mémo is
 *  registered under. Both derive from the SIO id the same way. */
const SIO = "SIO-010";
const DECK = `atelier-${SIO.toLowerCase()}`;

export const atelierRencontreLesson: NativeLesson = {
  slug: "atelier-rencontre",

  // Not a copy of the model — the model itself, the same element memos.tsx
  // builds from ATELIER_DIALOGUES. A line edited in the dialogue reaches this
  // panel with nothing else touched.
  memo: memoForDeck(DECK),

  dice: {
    instruction: "Same seven steps, three audiences. Say the right line for this one.",
    axes: RENCONTRE_AXES,
    newQuestion: rencontreQuestion,
  },

  // The model's own turns, EN→FR, under the deck's filter: a line already dealt
  // is a free point, and a line whose French and English are identical is a
  // proper name rather than language to learn. Both rules are atelierDecks.ts's,
  // applied here so the bonus bank and the deck cannot disagree about what
  // counts as a card.
  bonus: ATELIER_DIALOGUES[SIO].filter(
    (l, i, all) => l.fr !== l.en && all.findIndex((o) => o.fr === l.fr) === i,
  ).map((l) => ({ en: l.en, fr: l.fr })),
};
