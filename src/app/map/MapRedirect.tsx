"use client";

/** /map is RETIRED (Dan, 2026-09-12), and Home is where it went.
 *
 *  *"We have two pages doing the same thing: The Home page + The Map. Can we
 *  just keep the Bienvenue one … and move the 3D-2D switch and the zoom control
 *  and navigators '> Goal', legend there."*
 *
 *  Home renders `MapBody` now — the same component this page framed — so the
 *  switch, the zoom field, the legend and both views arrived there intact and
 *  there is nothing left here to show. The URL stays and forwards, because a
 *  printed QR code or a bookmark must still land somewhere: the ☰ menu, the
 *  guide and the deck pages all pointed at /map, and fifty stops' worth of
 *  deep links are of the form `/map#SIO-0nn`.
 *
 *  THE SEARCH AND THE HASH TRAVEL WITH IT, which is the whole point of
 *  forwarding rather than deleting. `MapBody`'s own mount effect reads both —
 *  `#SIO-0nn` opens that stop, `?unit=N` scrolls that band into view — so an
 *  old deep link keeps working, one page further on.
 *
 *  `replace`, not `assign`: Back should return to wherever the learner came
 *  from, not bounce through a page that only forwards.
 */
import { useEffect } from "react";

export default function MapRedirect() {
  useEffect(() => {
    window.location.replace(`/home${window.location.search}${window.location.hash}`);
  }, []);
  return null;
}
