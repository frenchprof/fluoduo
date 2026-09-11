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
 * WHERE DOWNWARDS LEADS, AND WHY IT CHANGED. Until 2026-09-08 the end of a
 * scroll carried a learner to the next STATION — the last question of a
 * pre-test landed on the lesson. Dan then laid the app out as a GRID (*"swipe
 * up and down to the next or previous SIO … swipe left for [the next
 * activity]"*, said of every station in turn), and under a grid those are two
 * different axes:
 *
 *     left / right    the activity      SpecuLearn -> MneMemo -> MémoiRecall
 *     down / up       the course        goal 23 -> goal 24 -> goal 25
 *
 * So this reads `sioNeighbours` now, not `railNeighbours`: keep scrolling past
 * the last question of goal 23's SpecuLearn and goal 24's SpecuLearn arrives,
 * at its own address. The chain forward is the sideways drag's job and no
 * longer this one's — one finger, one meaning, per direction.
 *
 * Both still come out of `lib/swipeRail.ts`, which is the point of that file:
 * the sideways drag and this gesture read one list, so they cannot come to
 * disagree about what follows what.
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
import { RAIL_MESSAGE, deckFromPath, recalledRailDeck, sioNeighbours } from "@/lib/swipeRail";

export default function useScrollOn(): void {
  const router = useRouter();
  const path = usePathname() ?? "/";
  // One page carries you on ONCE PER DIRECTION. Reset on every navigation: a
  // fresh page has a fresh end and a fresh top.
  const firedFor = useRef<string | null>(null);
  useEffect(() => { firedFor.current = null; }, [path]);

  usePullPastEnd((dir) => {
    /* THE INNERMOST DOCUMENT OWNS THE GESTURE. Every station runs inside the
       cahier's iframe, and both documents mount this reader — so a pull past
       the end was read twice, once by the station and once by the notebook
       around it, and a learner moved two goals instead of one. The station is
       the one that should answer (it is what the finger is actually on, and it
       posts its destination up regardless), so the host stands down whenever it
       is hosting one. */
    if (typeof document !== "undefined" && document.querySelector("iframe[data-station-frame]")) return;
    /* ONE CARRY PER PAGE, PER DIRECTION. The key is the address AND the way
       the reader went: arriving at goal 24 by pulling down must not spend the
       pull that would take them back up to 23. */
    const spent = `${path}:${dir}`;
    if (firedFor.current === spent) return;
    // Read the live address, not the rendered path — ConjugaZone's lesson is
    // in `?deck=` and `usePathname()` does not carry it. See useRailSwipe.
    const here = path + (typeof window !== "undefined" ? window.location.search : "");
    const { up, down } = sioNeighbours(path, deckFromPath(here) ?? recalledRailDeck());
    const forward = dir === 1 ? down : up;
    if (!forward) return;
    firedFor.current = spent;

    // THE FRAME GUARD — the station posts the destination up and the notebook
    // around it moves; navigating here would draw the cahier twice.
    let framed = true;
    try { framed = window.self !== window.top; } catch { framed = true; }
    if (framed) {
      window.parent.postMessage({ type: RAIL_MESSAGE, href: forward.href }, window.location.origin);
      return;
    }
    router.push(forward.href);
  }, {
    resetKey: path,
    /* A STATION THAT DOES NOT SCROLL STILL HAS A NEXT GOAL (2026-09-08).
       `whenNothingScrolls` was refused to the rail this morning, and the reason
       was sound at the time: downwards then meant LEAVE THIS ACTIVITY, and on a
       page shorter than the screen every scroller is trivially at its end, so
       one flick anywhere would have carried a learner off.

       Dan's grid changed the stake. Downwards is the next GOAL in the SAME
       activity now — gentle, and undone by pulling up again — and `sioNeighbours`
       answers null for anything off the rail, so Home, the guide, Réglages,
       Skills and Games cannot fire at all. What is left is the eight stations,
       every one of which belongs to a goal.

       And without it the grid simply does not work where Dan asked for it.
       MEASURED on the built export: a lesson arrived at by pulling down opens
       on its level picker, where the finger is not over the panel scroller —
       so nothing scrolled under it, the rail refused, and three pulls in a row
       did nothing. A drill card does not scroll at all. */
    whenNothingScrolls: true,
  });
}
