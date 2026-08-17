/**
 * The Reviser — the review mode that finally reads the spacing data every game
 * has been quietly writing (itemSrs in progress.ts). It surfaces the items a
 * learner has practiced and are now DUE again, and shows where their gaps are
 * (decks with the most due / recently-missed items). Nothing untouched shows
 * up here: a never-practiced item isn't "due for review", it's just unlearned.
 */
import { CURATED } from "@/content/collections";
import { isWeakSrs, type Progress } from "./progress";

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
 * how many are "weak" (`isWeakSrs` — interval ≤ 1 day: just missed, or
 * repaired but fragile; THE one definition, progress.ts). `seen`
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
    if (isWeakSrs(s)) g.weak += 1;
    m.set(it.deckId, g);
  }
  return [...m.values()].sort((a, b) => b.weak - a.weak || b.due - a.due);
}

/* ── Patch 23: the games feed the queue ─────────────────────────────────── */

/** The query key /reviser reads to put a game's misses at the head of the
 *  session: `/reviser?items=a,b,c`. */
export const REVIEW_FOCUS_PARAM = "items";

/** Where CORRIGER MAINTENANT sends the learner. */
export function reviserHref(itemIds: string[]): string {
  const ids = [...new Set(itemIds)].filter(Boolean);
  return ids.length ? `/reviser?${REVIEW_FOCUS_PARAM}=${encodeURIComponent(ids.join(","))}` : "/reviser";
}

/** Parse the focus list off a URL search string (client only). */
export function reviewFocusFrom(search: string): string[] {
  try {
    const raw = new URLSearchParams(search).get(REVIEW_FOCUS_PARAM);
    return raw ? raw.split(",").filter(Boolean) : [];
  } catch {
    return [];
  }
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** A curated item by its exact French — how the number games (which deal
 *  spoken numbers, not deck items) find the deck row that matches what the
 *  learner missed. Undefined when the course has no such item. */
export function reviewItemByFrench(fr: string): ReviewItem | undefined {
  const want = norm(fr);
  if (!want) return undefined;
  return allReviewItems().find((it) => norm(it.fr) === want);
}

/** A curated item by id. */
export function reviewItemById(id: string): ReviewItem | undefined {
  return allReviewItems().find((it) => it.id === id);
}
