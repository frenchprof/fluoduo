"use client";

/**
 * The rail's one handler, mounted once for the whole document.
 *
 * It used to be mounted by CahierShell and DrillShell, which was right while
 * every station was a page. Since 2026-09-07 a station RUNS IN A FRAME (Dan:
 * *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER PAGES IN IFRAMES
 * (EMBEDDED)"*), and a framed station mounts neither shell — `/map/embed` is
 * the map and nothing else. Measured: a swipe inside the framed map did
 * nothing at all, because there was no handler in that document to see it.
 *
 * So it belongs to the DOCUMENT, not to a shell. One per document, framed or
 * not; the framed copy posts its destination up rather than navigating itself
 * (see useRailSwipe). A page off the rail — Home, the guide, Réglages — still
 * gets no horizontal swipe, because `railNeighbours` answers null for it.
 *
 * TWO GESTURES, ONE CHAIN. The sideways drag reads the rail, and since 7 Sep so
 * does the END OF A VERTICAL SCROLL (Dan, with a CNA link: *"when u scroll to
 * the end of this page, it automatically goes into the new URL at the start of
 * that page"*). They are separate hooks because they read different gestures,
 * but they ask `railNeighbours` the same question, so they can never come to
 * disagree about what follows what — which is the whole reason the chain is a
 * list in one file rather than knowledge spread over thirteen pages.
 */
import useRailSwipe from "@/components/useRailSwipe";
import useScrollOn from "@/components/useScrollOn";

export default function RailSwipe() {
  useRailSwipe();
  useScrollOn();
  return null;
}
