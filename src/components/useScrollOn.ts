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
 * THE GESTURE ITSELF IS NOT HERE ANY MORE — it is `usePullPastEnd`, shared
 * with DrillShell since 2026-09-08 (Dan: *"between questions of the same
 * lesson … it should be scrolling to the next bookmarked item below on the
 * same page"*). One finger, read once; where the pull LEADS is what differs,
 * and that is all this file decides. The three guards and the locked-document
 * rule live in that hook's header, with the measurement behind each.
 *
 * AND A FRAMED PAGE HANDS THE DESTINATION UP, exactly as the swipe does: every
 * station runs inside the cahier's iframe since 7 Sep, so navigating here would
 * load the next station INSIDE the 720px box under the wrong heading band.
 */
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import usePullPastEnd from "@/components/usePullPastEnd";
import { RAIL_MESSAGE, deckFromPath, railNeighbours, recalledRailDeck } from "@/lib/swipeRail";
import { HOME_HREF } from "@/lib/routes";

export default function useScrollOn(): void {
  const router = useRouter();
  const path = usePathname() ?? HOME_HREF;
  // One page carries you on ONCE. Reset on every navigation: a fresh page has
  // a fresh end.
  const firedFor = useRef<string | null>(null);
  useEffect(() => { firedFor.current = null; }, [path]);

  usePullPastEnd(() => {
    if (firedFor.current === path) return;
    const { forward } = railNeighbours(path, deckFromPath(path) ?? recalledRailDeck());
    if (!forward) return;
    firedFor.current = path;

    // THE FRAME GUARD — the station posts the destination up and the notebook
    // around it moves; navigating here would draw the cahier twice.
    let framed = true;
    try { framed = window.self !== window.top; } catch { framed = true; }
    if (framed) {
      window.parent.postMessage({ type: RAIL_MESSAGE, href: forward.href }, window.location.origin);
      return;
    }
    router.push(forward.href);
  }, { resetKey: path });
}
