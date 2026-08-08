/**
 * The ONE rule for "which sentence does this item's gap live in?".
 *
 * Two authoring patterns coexist in the curated decks, both legitimate:
 *
 *   A. `fr` IS the drilled sentence, `example` is a contrast line.
 *      partitifs: fr "Je mange du pain." · gap "du" · example "J'aime le pain."
 *
 *   B. `fr` is a short grid label, `example` is the drilled sentence.
 *      en-au-aux-a, lieux-letris: fr "le Japon" · gap "au" · example "Je vais au Japon."
 *
 * Before this helper, five call sites disagreed about which to use:
 *
 *   gramMarathonReady.ts   (it.example ?? it.fr)   ← readiness gate
 *   GramMarathonContent    it.fr                   ← the game itself
 *   DicedPractice          (it.example ?? it.fr)
 *   CahierShell            it.fr                   ← tab visibility
 *   activities/page        it.fr                   ← tab visibility
 *
 * The consequences were silent and real (verified 2026-08-08 against the deck set):
 *   · partitifs (SIO-042)     passed 3/16 → below MIN_GAPPED → GramMarathon tab never rendered
 *   · en-au-aux-a (SIO-032)   passed the gate on `example`, then the game filtered on `fr`
 *                             and found 0 items → an empty marathon
 *   · lieux-letris (SIO-033)  same, 1 item → a one-question "marathon"
 *
 * Resolution: prefer whichever sentence actually CONTAINS the gap, `fr` first.
 * Every call site uses this, so the gate, the tabs and the game can never
 * disagree again. Non-dismantling: no deck that was playable before loses items.
 */
import type { Item } from "./schema";

/** The sentence to blank, split and grade for this item. */
export function gapSentence(it: Item): string {
  if (it.gap) {
    if (it.fr?.includes(it.gap)) return it.fr;
    if (it.example?.includes(it.gap)) return it.example;
  }
  // No gap, or a mis-authored one: fall back to the previous display rule.
  return it.example ?? it.fr;
}

/** English gloss matching whichever sentence `gapSentence` chose. */
export function gapSentenceEn(it: Item): string | undefined {
  if (it.gap && it.fr?.includes(it.gap)) return it.en;
  if (it.gap && it.example?.includes(it.gap)) return it.exampleEn ?? it.en;
  return it.exampleEn ?? it.en;
}

/** Does this item actually play? A gap that appears in neither sentence is
 *  mis-authored and must sit the game out rather than render a blank-less
 *  question. */
export function isPlayableGap(it: Item): boolean {
  return !!it.gap && gapSentence(it).includes(it.gap);
}
