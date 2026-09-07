"use client";

/**
 * THE END OF A PAGE IS NOT A WALL — keep scrolling and the next page arrives.
 *
 * Dan, 2026-09-07, with a link to a CNA article: *"The scroll is not done
 * right. Look at a page like [an article] — when u scroll to the end of this
 * page, it automatically goes into the new URL at the start of that page."*
 *
 * WHAT WAS ACTUALLY HAPPENING, measured on the built export before this file.
 * Driven to the bottom and then pushed six more times, all three feeds stopped
 * dead and the URL never moved:
 *
 *     /sio/SIO-049          50 rows, scrollTop 35280 of 35280, nothing
 *     /practice/.../pretest  7 rows, scrollTop  4005 of  4005, nothing
 *     /lessons/deck/<id>             scrollTop  2286 of  2302, nothing
 *
 * The app had exactly one way between pages — a sideways drag
 * (`useRailSwipe`) — and a learner who has just answered the last question of
 * a pre-test is not holding the phone sideways in their mind. They are
 * scrolling, and scrolling had run out.
 *
 * WHERE "THE NEXT PAGE" COMES FROM. Not from a second list: from the same
 * `lib/swipeRail.ts` chain the sideways drag reads, so the two can never
 * disagree about what follows what. That chain happens to be the course's own
 * order, which is why this reads as pedagogy rather than as a trick:
 *
 *     the last goal      -> SpecuLearn for that goal
 *     the last question  -> MneMemo, the lesson it was guessing at
 *     the last panel     -> MémoiRecall, the flashcards
 *
 * THREE GUARDS, each for a way this would otherwise be worse than the wall:
 *
 *  1 · A PAGE THAT DOES NOT SCROLL IS NEVER "AT THE END" OF ONE. On /skills,
 *      /games or a short hub the content is shorter than the screen, so every
 *      scroller is trivially at its bottom — without this, one flick anywhere
 *      would navigate. There must be a real scroller with real overflow.
 *  2 · THE GESTURE THAT BRINGS YOU TO THE BOTTOM CANNOT TAKE YOU OFF IT.
 *      This guard was first written as "PULL_PX of movement accumulated after
 *      everything is at the bottom", and driving it caught the fault that
 *      wording hides: reading the pre-test through in one pass — fourteen
 *      wheel notches, a third of a second apart — landed on the lesson, because
 *      the notch that ARRIVED at the bottom carried 700px of its own and spent
 *      the whole threshold on the spot. No threshold alone can fix that; a
 *      bigger one only means a longer article triggers it.
 *
 *      So a gesture only counts if it STARTED while already at the bottom: a
 *      touch begins at `touchstart`, and a run of wheel notches closer than
 *      `GESTURE_GAP_MS` is one gesture. Lift your finger, pull again — which is
 *      what a reader does anyway when a page stops moving. `PULL_PX` then keeps
 *      an idle twitch from counting as that second pull.
 *  3 · A PAN SURFACE IS NOT A READING FLOW. The map's 3D box scrolls, but
 *      dragging it is looking around, not reading to an end. `data-no-scroll-on`
 *      marks any scroller like that, the same escape hatch shape
 *      `data-no-rail-swipe` gives the sideways drag.
 *
 * AND A FRAMED PAGE HANDS THE DESTINATION UP, exactly as the swipe does: every
 * station runs inside the cahier's iframe since 7 Sep, so navigating here would
 * load the next station INSIDE the 720px box under the wrong heading band.
 */
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { RAIL_MESSAGE, deckFromPath, railNeighbours, recalledRailDeck } from "@/lib/swipeRail";

/** How far you must keep pushing PAST the end before it carries you on.
 *  Roughly one more flick: enough that the momentum of arriving cannot spend
 *  it, small enough that nobody has to shove. */
const PULL_PX = 140;
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

export default function useScrollOn(): void {
  const router = useRouter();
  const path = usePathname() ?? "/";
  // Reset on every navigation: a fresh page has a fresh end.
  const pull = useRef(0);
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    pull.current = 0;
    firedFor.current = null;
  }, [path]);

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout> | null = null;
    let touchY: number | null = null;
    // Did the gesture now in progress BEGIN with the page already at its end?
    // Only such a gesture may carry a reader on — see guard 2 in the header.
    let startedAtEnd = false;
    let lastWheel = 0;

    const reset = () => { pull.current = 0; };

    /** Every scroller under this point, all of them at their bottom, and at
     *  least one of them a real reading flow. Null when there is no end here. */
    function endedHere(target: EventTarget | null): boolean {
      const el = target instanceof Element ? target : document.body;
      if (el.closest("[data-no-scroll-on]")) return false;
      const boxes = scrollableAncestors(el);
      // GUARD 1 — nothing scrolls, so there is no end of a scroll to reach.
      if (!boxes.length) return false;
      return boxes.every((b) => b.scrollTop >= b.scrollHeight - b.clientHeight - SLOP);
    }

    function advance(by: number, target: EventTarget | null) {
      if (by <= 0) { reset(); return; }
      if (!endedHere(target)) { reset(); return; }
      if (!startedAtEnd) { reset(); return; }
      if (firedFor.current === path) return;

      pull.current += by;
      if (idle) clearTimeout(idle);
      idle = setTimeout(reset, IDLE_MS);
      // GUARD 2 — a deliberate second push, not the momentum of arriving.
      if (pull.current < PULL_PX) return;

      const { forward } = railNeighbours(path, deckFromPath(path) ?? recalledRailDeck());
      if (!forward) { reset(); return; }
      firedFor.current = path;
      reset();

      // GUARD (the frame) — the station posts the destination up and the
      // notebook around it moves; navigating here would draw the cahier twice.
      let framed = true;
      try { framed = window.self !== window.top; } catch { framed = true; }
      if (framed) {
        window.parent.postMessage({ type: RAIL_MESSAGE, href: forward.href }, window.location.origin);
        return;
      }
      router.push(forward.href);
    }

    const onWheel = (e: WheelEvent) => {
      const now = e.timeStamp || Date.now();
      // A new gesture begins where the last one left off by more than a beat.
      if (now - lastWheel > GESTURE_GAP_MS) {
        startedAtEnd = endedHere(e.target);
        reset();
      }
      lastWheel = now;
      advance(e.deltaY, e.target);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
      startedAtEnd = endedHere(e.target);
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
  }, [path, router]);
}
