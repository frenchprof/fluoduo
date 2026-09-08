"use client";

/**
 * THE PULL PAST THE END — one reader of one gesture, for the two things that
 * answer it.
 *
 * Dan, 2026-09-07, with a link to a CNA article: *"The scroll is not done
 * right … when u scroll to the end of this page, it automatically goes into
 * the new URL at the start of that page."* That built `useScrollOn`, which
 * carries a learner from the end of a page to the next station.
 *
 * Then, the same day: *"the technique you used for going to a different page
 * by just scrolling is something we want replicate across all activities, but
 * between questions of the same lesson, instead of scrolling into another url,
 * it should be scrolling to the next bookmarked item below on the same page"*.
 *
 * ONE GESTURE, TWO ANSWERS, and that is why this file exists rather than a
 * second copy of the guards inside DrillShell:
 *
 *     at the end of a RUN       -> the next station          (useScrollOn)
 *     at the end of a QUESTION  -> the next question         (DrillShell)
 *
 * The reading of the finger is identical in both; only what happens at the end
 * of it differs. Writing it twice is how the app came to have two ideas of
 * "forward" on 6 Sep, which is the fault verify117 exists for.
 *
 * THE GUARDS, each pinned by that check and each found by DRIVING the built
 * export rather than by reasoning:
 *
 *  1 · A PAGE THAT DOES NOT SCROLL IS NEVER "AT THE END" OF ONE. On /skills,
 *      /games or a short hub the content is shorter than the screen, so every
 *      scroller is trivially at its bottom — without this, one flick anywhere
 *      would fire. There must be a real scroller with real overflow.
 *
 *      EXCEPT WHERE THE PULL CANNOT COST ANYTHING, which is `whenNothingScrolls`
 *      and is not a loophole: it is the guard read properly. What guard 1
 *      really says is "you may not have seen what is below yet", and a page
 *      with nothing below satisfies that trivially — the reason the RAIL still
 *      may not act on it is that navigating away is destructive and a flick is
 *      cheap. A drill card is the opposite case on both counts: measured on the
 *      built export, a DrillShell page does not scroll AT ALL (the frame's
 *      document is 787px in a 787px viewport, and the shell's own docs forbid
 *      a nested scroller), so guard 1 alone means the gesture Dan asked for can
 *      never fire on the eleven activities he asked for it on. And what it
 *      fires there is the tray's Continue on a question the learner has already
 *      answered — never a navigation, never an unread card. The caller opts in;
 *      the rail never does.
 *  2 · THE GESTURE THAT BRINGS YOU TO THE BOTTOM CANNOT TAKE YOU OFF IT.
 *      First written as "PULL_PX accumulated after everything is at the
 *      bottom", and driving it caught what that wording hides: reading the
 *      pre-test through in one pass — fourteen wheel notches, a third of a
 *      second apart — landed on the lesson, because the notch that ARRIVED at
 *      the bottom carried 700px of its own and spent the whole threshold on
 *      the spot. No threshold alone fixes that; a bigger one only means a
 *      longer page triggers it.
 *
 *      So a gesture only counts if it STARTED while already at the bottom: a
 *      touch begins at `touchstart`, and a run of wheel notches closer than
 *      `GESTURE_GAP_MS` is one gesture. Lift, pull again — which is what a
 *      reader does anyway when a page stops moving. `PULL_PX` then keeps an
 *      idle twitch from counting as that second pull.
 *  3 · A PAN SURFACE IS NOT A READING FLOW. The map's 3D box scrolls, but
 *      dragging it is looking around, not reading to an end. `data-no-scroll-on`
 *      marks any scroller like that, the same escape-hatch shape
 *      `data-no-rail-swipe` gives the sideways drag.
 *
 * THIS FILE NEVER NAVIGATES, deliberately. It reads a finger and calls back.
 * Where the pull leads is the caller's to answer — from `railNeighbours` for
 * the rail, from the visible CTA for a drill — so the two can never come to
 * disagree about it here.
 */
import { useEffect, useRef } from "react";

/** How far you must keep pushing PAST the end before it counts. Roughly one
 *  more flick: enough that the momentum of arriving cannot spend it, small
 *  enough that nobody has to shove. */
export const PULL_PX = 140;
/** A pause at the bottom means you stopped, so the pull is spent. */
const IDLE_MS = 700;
/** Wheel notches closer together than this are one gesture — one flick of a
 *  trackpad, one turn of a mouse wheel — and a gesture is judged by where it
 *  STARTED. */
const GESTURE_GAP_MS = 260;
/** A scroller is "at the bottom" within this many px — sub-pixel layout and
 *  zoom both leave a fractional remainder that never reaches exactly zero. */
const SLOP = 2;

function scrollableAncestors(from: Element | null): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (let el: Element | null = from; el; el = el.parentElement) {
    if (!(el instanceof HTMLElement)) continue;
    const cs = getComputedStyle(el);
    if (!/auto|scroll/.test(cs.overflowY)) continue;
    if (el.scrollHeight <= el.clientHeight + SLOP) continue;
    out.push(el);
  }
  /* THE DOCUMENT ONLY COUNTS IF IT CAN ACTUALLY BE SCROLLED. A feed LOCKS it —
     `html { overflow: hidden }` while a SnapFeed is up, which is what "full
     screen" means on this shell (SnapFeed's own header explains why). A locked
     <html> still reports scrollHeight > clientHeight and a scrollTop frozen at
     0, so counting it meant "every scroller at its bottom" was never true on a
     feed: the pre-test reached 4005 of 4005 and nothing happened, because the
     document behind it was judged to be at the top. Measured before the fix. */
  const doc = document.scrollingElement;
  if (
    doc instanceof HTMLElement
    && doc.scrollHeight > doc.clientHeight + SLOP
    && !/hidden|clip/.test(getComputedStyle(doc).overflowY)
  ) out.push(doc);
  return out;
}

/** Every scroller under this point, all of them at their bottom, and at least
 *  one of them a real reading flow. False when there is no end here. */
function endedHere(target: EventTarget | null, opts: PullOptions): boolean {
  const el = target instanceof Element ? target : document.body;
  // GUARD 3 — a pan surface is not a reading flow. `heedHatch: false` is for
  // the ONE caller that plants the hatch itself: DrillShell marks its page so
  // the RAIL stands down while a drill can act on the pull, and it would be
  // absurd for that mark to silence the reader it was planted for.
  if (opts.heedHatch !== false && el.closest("[data-no-scroll-on]")) return false;
  const boxes = scrollableAncestors(el);
  // GUARD 1 — nothing scrolls, so there is no end of a scroll to reach…
  // …unless the caller has nothing below to be missed. See the header.
  if (!boxes.length) return opts.whenNothingScrolls === true;
  return boxes.every((b) => b.scrollTop >= b.scrollHeight - b.clientHeight - SLOP);
}

/**
 * Call `onPull` when the reader keeps pushing past the end of everything under
 * their finger.
 *
 * `onPull` may be a different function on every render — it is held in a live
 * ref, so the listener bound once always fires the CURRENT one. That matters
 * for a drill, where what "next" means changes with every answer.
 *
 * `resetKey` starts the accumulation over: a fresh page, or a fresh question,
 * has a fresh end.
 */
export type PullOptions = {
  /** Start the accumulation over: a fresh page, or a fresh question, has a
   *  fresh end. */
  resetKey?: unknown;
  /** Let the pull count on a page with no scroller at all. Only for a caller
   *  whose answer is harmless on a stray flick — see guard 1 in the header. */
  whenNothingScrolls?: boolean;
  /** false only for the caller that PLANTS `data-no-scroll-on` itself. */
  heedHatch?: boolean;
};

export default function usePullPastEnd(onPull: () => void, options: PullOptions = {}): void {
  const { resetKey = null } = options;
  const cb = useRef(onPull);
  // A live ref, written during render on purpose: the listeners below are
  // bound once and fire long after, and they must call the callback that is
  // current NOW — not the one that existed when they were attached.
  // eslint-disable-next-line react-hooks/refs
  cb.current = onPull;
  const pull = useRef(0);
  const optsRef = useRef(options);
  // eslint-disable-next-line react-hooks/refs
  optsRef.current = options;

  useEffect(() => { pull.current = 0; }, [resetKey]);

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout> | null = null;
    let touchY: number | null = null;
    // Did the gesture now in progress BEGIN with the page already at its end?
    // Only such a gesture may carry a reader on — see guard 2 in the header.
    let startedAtEnd = false;
    let lastWheel = 0;

    const reset = () => { pull.current = 0; };

    function advance(by: number, target: EventTarget | null) {
      if (by <= 0) { reset(); return; }
      if (!endedHere(target, optsRef.current)) { reset(); return; }
      if (!startedAtEnd) { reset(); return; }

      pull.current += by;
      if (idle) clearTimeout(idle);
      idle = setTimeout(reset, IDLE_MS);
      // GUARD 2 — a deliberate second push, not the momentum of arriving.
      if (pull.current < PULL_PX) return;

      // Spent: the same gesture may not fire twice, and the next one has to
      // begin at the end all over again.
      reset();
      startedAtEnd = false;
      cb.current();
    }

    const onWheel = (e: WheelEvent) => {
      const now = e.timeStamp || Date.now();
      // A new gesture begins where the last one left off by more than a beat.
      if (now - lastWheel > GESTURE_GAP_MS) {
        startedAtEnd = endedHere(e.target, optsRef.current);
        reset();
      }
      lastWheel = now;
      advance(e.deltaY, e.target);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
      startedAtEnd = endedHere(e.target, optsRef.current);
      reset();
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (y == null || touchY == null) return;
      // The finger moving UP drags the content down — the same direction a
      // positive wheel delta means.
      advance(touchY - y, e.target);
      touchY = y;
    };
    const onTouchEnd = () => { touchY = null; startedAtEnd = false; reset(); };

    const opts = { passive: true } as const;
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("touchstart", onTouchStart, opts);
    window.addEventListener("touchmove", onTouchMove, opts);
    window.addEventListener("touchend", onTouchEnd, opts);
    window.addEventListener("touchcancel", onTouchEnd, opts);
    return () => {
      if (idle) clearTimeout(idle);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);
}
