/**
 * The Reviser — the review mode that finally reads the spacing data every game
 * has been quietly writing (itemSrs in progress.ts). It surfaces the items a
 * learner has practiced and are now DUE again, and shows where their gaps are
 * (decks with the most due / recently-missed items). Nothing untouched shows
 * up here: a never-practiced item isn't "due for review", it's just unlearned.
 */
import { CURATED } from "@/content/collections";
import type { Progress } from "./progress";

export type ReviewItem = { id: string; fr: string; en: string; deckId: string; deckTitle: string };

/** Every curated practice item, flattened with its deck. */
export function allReviewItems(): ReviewItem[] {
  const out: ReviewItem[] = [];
  for (const c of CURATED) {
    for (const it of c.items) {
      out.push({ id: it.id, fr: it.fr, en: it.en, deckId: c.id, deckTitle: c.title });
    }
  }
  return out;
}

/** Items with an SRS entry whose interval has elapsed — the review queue. */
export function dueForReview(p: Progress, now: number): ReviewItem[] {
  return allReviewItems().filter((it) => {
    const s = p.itemSrs[it.id];
    return !!s && s.due <= now;
  });
}

export type Gap = { deckId: string; deckTitle: string; due: number; weak: number; seen: number };

/**
 * Per-deck gap summary over practiced items: how many are due for review, and
 * how many are "weak" (their ladder was reset to 0 by a recent miss). `seen`
 * is how many of the deck's items the learner has practiced at all.
 */
export function gapsByDeck(p: Progress, now: number): Gap[] {
  const m = new Map<string, Gap>();
  for (const it of allReviewItems()) {
    const s = p.itemSrs[it.id];
    if (!s) continue;
    const g = m.get(it.deckId) ?? { deckId: it.deckId, deckTitle: it.deckTitle, due: 0, weak: 0, seen: 0 };
    g.seen += 1;
    if (s.due <= now) g.due += 1;
    if (s.intervalDays === 0) g.weak += 1;
    m.set(it.deckId, g);
  }
  return [...m.values()].sort((a, b) => b.weak - a.weak || b.due - a.due);
}
