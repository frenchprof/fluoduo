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
 */
import useRailSwipe from "@/components/useRailSwipe";

export default function RailSwipe() {
  useRailSwipe();
  return null;
}
