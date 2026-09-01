/**
 * Native « Atelier — Un petit e-mail » lesson — SIO-030, written 2026-09-01.
 *
 * One of the five ateliers that follow atelier-rencontre.tsx. `concept` is
 * deliberately absent — the concepts lane's — and verify77 asserts it stays so.
 *
 * THE MÉMO IS THE MODEL, PASSED THROUGH, and that is the whole reason this file
 * is three lines of wiring rather than a Mémo of its own. `LessonPager` resolves
 * the panel as `memo={lesson?.memo ?? memoForDeck(collectionId)}`, so merely
 * REGISTERING a lesson for an atelier deletes « Le modèle » from the panel Dan
 * asked an atelier to open on. verify71 cannot see it happen — it reads
 * memos.tsx, which stays correct while nothing renders it.
 *
 * THE EXERCISE IS THE MODEL'S OWN TURNS. It was the FINALE bank first, and
 * atelierModel.ts records in full why that was reverted: those items were
 * authored for a type-in game, and every multiple choice built by substituting
 * one item's answer into another item's frame is a gamble on agreement — it
 * produced « Bon chance » and « un sympa restaurant » before it was caught.
 */
import type { NativeLesson } from "./types";
import { memoForDeck } from "@/content/memos";
import { ATELIER_DIALOGUES } from "@/content/ateliers";
import { questionFor } from "./atelierModel";

const SIO = "SIO-030";
const DECK = `atelier-${SIO.toLowerCase()}`;

export const atelierEmailLesson: NativeLesson = {
  slug: "atelier-email",

  memo: memoForDeck(DECK),

  // NO AXIS. A model's turns are not a set of kinds to filter — every line is
  // one line — and a dropdown that cannot narrow anything is decoration
  // (verify46: "a dropdown with one answer"). A .gen.ts exists so that suite can
  // execute an axis, so with no axis there is none.
  dice: {
    instruction: "Say that line of the model, in French.",
    newQuestion: () => questionFor(SIO),
  },

  // The model's own turns, EN→FR, under atelierDecks.ts's filter: a line already
  // dealt is a free point, and a line whose French and English are identical is
  // a proper name rather than language to learn.
  bonus: ATELIER_DIALOGUES[SIO].filter(
    (l, i, all) => l.fr !== l.en && all.findIndex((o) => o.fr === l.fr) === i,
  ).map((l) => ({ en: l.en, fr: l.fr })),
};
