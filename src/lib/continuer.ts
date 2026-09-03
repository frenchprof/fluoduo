/**
 * Where ▶ Continuer points (Dan, 2026-07-08: "when a later step has been
 * marked as done, continue should actually start from there") — the first
 * not-done SIO AFTER the furthest « done », so a learner who skipped ahead
 * picks up where they last were, not back at their earliest gap. Falls back
 * to the earliest gap when the tail is complete; undefined when all 50 are.
 *
 * THE BOOKMARK (Dan, 2026-09-02: "we need a way for users to book mark the
 * stop that they have left off, because if they have wandered out of
 * curiosity, it should not force them to resume at that spot"). The learner
 * can now SAY where they are — by editing the stop number on Home's hero
 * well or the map's control row — and that word outranks the computation:
 * a set bookmark is the current stop, and wandering (which never writes it)
 * cannot move it. Completing the bookmarked stop advances the reading to the
 * first gap after it, the same forward grammar nextSioId already speaks; if
 * everything from the bookmark on is done, the computed reading takes over
 * rather than pinning the learner to a finished tail.
 */
import { SIOS } from "@/content/sios";
import { isSioDone, type Progress } from "@/lib/progress";

export function nextSioId(progress: Progress, bookmarkNo?: number | null): string | undefined {
  if (bookmarkNo != null && bookmarkNo >= 1 && bookmarkNo <= SIOS.length) {
    const fromBookmark = SIOS.slice(bookmarkNo - 1).find((s) => !isSioDone(s.id, progress));
    if (fromBookmark) return fromBookmark.id;
  }
  let lastDone = -1;
  SIOS.forEach((s, i) => {
    if (isSioDone(s.id, progress)) lastDone = i;
  });
  const afterFurthest = SIOS.slice(lastDone + 1).find((s) => !isSioDone(s.id, progress));
  return (afterFurthest ?? SIOS.find((s) => !isSioDone(s.id, progress)))?.id;
}

/** The bookmark's one storage home. The value is a stop NUMBER (1–50, the
 *  map's own order), not an id — it is what the editable indicator shows. */
const BOOKMARK_KEY = "fluolingo:bookmark";
/** Fired on every save so Home and the map re-read without a reload. */
export const BOOKMARK_EVENT = "fluolingo:bookmark-updated";

export function loadBookmark(): number | null {
  try {
    const n = Number(window.localStorage.getItem(BOOKMARK_KEY));
    return Number.isInteger(n) && n >= 1 && n <= SIOS.length ? n : null;
  } catch {
    return null; // server, or storage blocked — the computed reading stands
  }
}

export function saveBookmark(no: number | null) {
  try {
    if (no == null) window.localStorage.removeItem(BOOKMARK_KEY);
    else window.localStorage.setItem(BOOKMARK_KEY, String(Math.min(SIOS.length, Math.max(1, Math.round(no)))));
    window.dispatchEvent(new Event(BOOKMARK_EVENT));
  } catch {
    // storage blocked — nothing to remember the choice with
  }
}

/** nextSioId with the bookmark read at call time. For event handlers and
 *  effects ONLY — render paths must take the bookmark from state, or the
 *  first client render disagrees with the prerender. */
export function continueSioId(progress: Progress): string | undefined {
  return nextSioId(progress, loadBookmark());
}
