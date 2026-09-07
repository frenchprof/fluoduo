"use client";

/**
 * A STATION, RUNNING INSIDE THE CAHIER.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*.
 *
 * "Like the map" is the pattern already in the repo: `/map/embed` is the map
 * and nothing else — no notebook frame, no site bar, no band — a page whose
 * whole job is to be dropped into a box. This mounts one of those inside the
 * cahier, so the notebook chrome is drawn ONCE by the page around it and the
 * station lives in its own document.
 *
 * WHY A FRAME AND NOT A COMPONENT. A component shares one document with the
 * chrome, and that is what has cost this app a fortnight of scrolling bugs:
 * the window scrolls when the content does, `scrollIntoView` drags the header
 * off the top, `.cahier-page` is `overflow: hidden` so a sticky band inside it
 * never sees the scroll. A frame ends all of it by construction — the station
 * cannot scroll the page it sits on, because it is not on it.
 *
 * THE SWIPE STILL WORKS, and this is the part that needs saying. A finger
 * inside the frame is a touch in ANOTHER document: the rail's window listener
 * out here never sees it. So the framed copy of `useRailSwipe` does not
 * navigate — it posts the destination up, and this listens. Same chain, same
 * arithmetic, one extra hop. Messages are checked for origin AND shape before
 * anything moves, because `message` is a public entry point into the app.
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import useFillHeight from "@/lib/useFillHeight";
import { RAIL_MESSAGE, type RailMessage } from "@/lib/swipeRail";

export default function EmbedFrame({
  src,
  title,
}: {
  /** The chrome-free route to run — e.g. `/map/embed`. */
  src: string;
  /** Named for a screen reader: an unlabelled frame is announced as "frame". */
  title: string;
}) {
  const box = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  useFillHeight(box);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Same document origin only. The embed is our own page on our own host;
      // anything else talking to this window is not ours to obey.
      if (e.origin !== window.location.origin) return;
      const d = e.data as RailMessage | undefined;
      if (!d || d.type !== RAIL_MESSAGE || typeof d.href !== "string") return;
      // A relative path of our own, never an absolute URL — a swipe may not be
      // talked into leaving the app.
      if (!d.href.startsWith("/") || d.href.startsWith("//")) return;
      router.push(d.href);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  /* `embed-frame` is not styling — it is what one CSS rule looks for to give
     the frame the whole content well (globals.css). A station draws its own
     paper, so the well's 20px top and bottom and its right inset would frame
     the frame. The LEFT gutter stays: that is where the coils are. */
  return (
    <div ref={box} className="embed-frame w-full">
      <iframe
        src={src}
        title={title}
        /* THE KEYBOARD HAS TO LAND IN THE STATION. A drill answers to 1-4 and
           ↵ (useChoiceKeys), and those keys go to whichever DOCUMENT has focus
           — which, on a fresh page, is the notebook out here, not the station
           inside. Measured: number keys did nothing until the learner tapped
           inside the frame. Focusing it on load is what makes a keyboard work
           the way it did before the station moved into a frame. */
        onLoad={(e) => { try { e.currentTarget.contentWindow?.focus(); } catch {} }}
        className="h-full w-full border-0 bg-transparent"
        /* The station is our own page, so it needs no sandbox loosening — and
           `allow` names the two things a station legitimately asks for: the
           microphone (WorDrill) and autoplay (every drill that speaks). */
        allow="microphone; autoplay"
      />
    </div>
  );
}
