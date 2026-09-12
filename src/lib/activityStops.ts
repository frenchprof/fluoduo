/**
 * WHICH OF THE FIFTY STOPS CAN THIS ACTIVITY ACTUALLY PLAY — one answer, here.
 *
 * Dan, 2026-09-11: *"Many activities simply do not exist for all the lessons"*,
 * and then, plainly: ***"just don't allow anyone to land on 'there is nothing
 * here'"***.
 *
 * WHAT IT WAS. `ActivityGoalPicker` asked for a number from 1 to 50 and built
 * a URL out of `SIOS[stop-1].collectionId`, for every activity, with no list of
 * decks and no gate. Driven on the built export, from the ☰, pressing Confirm
 * on the stop the picker OPENS ON:
 *
 *     ComposeIt       0 of 50 stops led to a page that exists
 *     VocabulaRain   28 of 50
 *     the other four 50 of 50
 *
 * ComposeIt was total because it has no goals at all — it has café banks, keyed
 * by deck — and VocabulaRain because its sets live in their own registry. The
 * picker was writing addresses in a namespace those two games do not use.
 *
 * THE RULE THIS FILE EXISTS TO KEEP. Every entry below asks the ACTIVITY'S OWN
 * source the same question the activity itself asks — `isLexReadyId`,
 * `isGramMarathonReadyId`, `composeBanksForDeck`, `letrisSlugForDeck` — never a
 * second opinion re-derived here. `lib/collections/gapSentence.ts` records what
 * the alternative cost: five call sites each answering "which items does this
 * deck play?" separately, three decks silently unplayable, the gate saying yes
 * and the game finding nothing.
 *
 * AND `stopHref` RETURNS THE ADDRESS THAT WAS EXPORTED, not one assembled from
 * an id that looked right. A gate that passes while the page 404s is the same
 * bug wearing a different coat, and it is why `letrisSlugForDeck` now exists in
 * one place rather than three.
 *
 * ÉCOUTEXTE IS NOT HERE, and that is the honest answer rather than a gap. Its
 * content is chosen by unit and topic, so there is no per-stop route for an
 * answer to steer — which is why it no longer asks the question at all.
 */
import { SIOS } from "@/content/sios";
import { isLexReadyId } from "@/lib/collections/lexReady";
import { isGramMarathonReadyId } from "@/lib/collections/gramMarathonReady";
import { CURATED } from "@/content/collections";
import { letrisSlugForDeck } from "@/games/letris/sets";
import { composeBanksForDeck } from "@/games/compose/banks";

/** The activities whose pop-up asks "which goal?". ÉcouTexte is deliberately
 *  absent — see the header. */
export type StopActivityKey =
  | "flip" | "grammarathon" | "wordrill" | "lexicalator" | "vocabularain" | "compose";

const deckOf = (stop: number): string | null => SIOS[stop - 1]?.collectionId ?? null;
const hasDeck = (id: string) => CURATED.some((c) => c.id === id);

/**
 * The address this activity opens for a stop, or null when it has nothing for
 * it. One function: the chooser offers exactly the stops this returns a string
 * for, so "offered" and "reachable" cannot come apart.
 */
export function stopHref(key: StopActivityKey, stop: number): string | null {
  const deck = deckOf(stop);
  if (!deck) return null;

  switch (key) {
    // MémoiRecall and WorDrill play any curated deck's items — the deck
    // existing IS their gate, and both pages `notFound()` without one.
    case "flip":
      return hasDeck(deck) ? `/practice/flip-it/${deck}` : null;
    case "wordrill":
      return hasDeck(deck) ? `/practice/say-it/${deck}` : null;

    // The two that carry a real readiness test of their own.
    case "grammarathon":
      return isGramMarathonReadyId(deck) ? `/practice/grammarathon/${deck}` : null;
    case "lexicalator":
      return isLexReadyId(deck) ? `/games/lexicalater/${deck}` : null;

    // The two that do not use deck ids in their URLs at all.
    case "vocabularain": {
      const slug = letrisSlugForDeck(deck);
      return slug ? `/games/vocabularain/${slug}` : null;
    }
    case "compose": {
      const bank = composeBanksForDeck(deck)[0];
      return bank ? `/games/compose/${bank.id}` : null;
    }
  }
}

/** Every stop this activity can actually play, in map order. */
export function playableStops(key: StopActivityKey): number[] {
  const out: number[] = [];
  for (let n = 1; n <= SIOS.length; n++) if (stopHref(key, n)) out.push(n);
  return out;
}

/** The stop the chooser should open on: the learner's own, when the activity
 *  can play it, else the nearest one it can — never a dead number. */
export function nearestPlayable(key: StopActivityKey, wanted: number): number | null {
  const live = playableStops(key);
  if (!live.length) return null;
  return live.reduce((best, n) =>
    Math.abs(n - wanted) < Math.abs(best - wanted) ? n : best, live[0]);
}
