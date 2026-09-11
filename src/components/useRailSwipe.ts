"use client";

/**
 * ONE SWIPE HANDLER FOR THE WHOLE APP.
 *
 * Dan, 2026-09-06, having been shown thirteen page types driven one by one:
 * *"right now it is not at all what i asked for"*. It wasn't, and the reason
 * was structural rather than a bug anywhere: only TWO surfaces in the app had
 * ever been given a horizontal gesture — the goals scroller and the lesson's
 * tab strip — each with its own copy of the same 60px / 1.5x arithmetic and
 * its own private idea of where "forward" went. The other eleven had none, so
 * a sideways drag on the map, on a game, on the leaderboard did nothing at all.
 *
 * Thirteen pages cannot each be taught the chain. So the chain is a list
 * (`lib/swipeRail.ts`) and this is the only thing that reads a finger. Mount it
 * once per shell and every page in that shell is on the rail — including the
 * ones nobody has thought about yet, which is the point.
 *
 * WHY THE LISTENERS GO ON THE WINDOW rather than on a wrapper element. A
 * wrapper is a new box in the layout of 100+ routes, and the two surfaces that
 * most need this (the goals scroller, the lesson panels) put their content
 * inside an `overflow-y-auto` that would swallow a drag before a parent div saw
 * it. The window sees every gesture that nothing else claimed, which is exactly
 * the set of gestures that should navigate.
 *
 * WHAT IT REFUSES TO CLAIM, each learnt from something that breaks without it:
 *   · a drag that starts inside a sideways scroller (the Formes word list, the
 *     Mémo tables) — that drag belongs to the thing being scrolled;
 *   · a drag inside anything marked `data-no-rail-swipe` — the escape hatch for
 *     a surface that owns its own horizontal gesture (a card deck, a slider);
 *   · a drag that starts on a text field, where sideways is caret movement;
 *   · a drag that is not decisively horizontal: 60px across AND half again more
 *     across than down, or every flick of a vertical scroll navigates.
 *
 * `touchcancel` matters as much as `touchend` (Dan, 2026-09-06: *"none of the
 * swiping seems to be working"*). When the browser claims a gesture mid-drag it
 * ends the sequence with `touchcancel`, and a handler that listens only for
 * `touchend` dies silently — no error, nothing happens, every time. The last
 * touch position is kept on every move so a claimed gesture is still judged on
 * where the finger actually got to.
 */
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

import { RAIL_MESSAGE, RAIL_URL_MESSAGE, deckFromPath, railIndex, railNeighbours, rememberRailDeck, recalledRailDeck } from "@/lib/swipeRail";
import { HOME_HREF } from "@/lib/routes";

/** 60px across, and half again more across than down. */
const MIN_PX = 60;
const RATIO = 1.5;

function claimedByAnythingElse(target: EventTarget | null): boolean {
  const el = target instanceof Element ? target : null;
  if (!el) return false;
  if (el.closest("[data-no-rail-swipe]")) return true;
  if (el.closest(".overflow-x-auto")) return true;
  if (el.closest("input, textarea, select, [contenteditable='true']")) return true;
  return false;
}

export default function useRailSwipe(): void {
  const router = useRouter();
  const path = usePathname() ?? HOME_HREF;

  // The deck is remembered as you pass through the goal-shaped columns, so a
  // trip out to ConjugaZone and back lands on the flashcards of the goal you
  // left rather than on a picker.
  useEffect(() => { rememberRailDeck(deckFromPath(path)); }, [path]);

  /* A FRAMED STATION THAT NAVIGATES OFF ITS OWN STATION HANDS THE APP BACK.
   *
   * `<base target="_top">` (layout head) covers every <a>, and that is most of
   * it — but not the ones that matter most inside a drill. DrillShell's finish
   * row calls `router.push(next.href)`, which is client-side: « Next › » at the
   * end of a lesson would load MémoiRecall INSIDE the 720px box, under a
   * heading band still saying MneMemo. So the frame watches its own path and,
   * the moment it lands in a DIFFERENT station, posts it up for the page
   * around it to open properly.
   *
   * Same-station changes stay put, and that exclusion is load-bearing: the
   * goals scroller rewrites the URL to /sio/SIO-0NN on every scroll, and
   * re-hosting the frame fifty times while a learner flicks through the goals
   * would be a reload per goal. Station, not path.
   */
  const framedStation = useRef<number | null>(null);
  useEffect(() => {
    let framed = true;
    try { framed = window.self !== window.top; } catch { framed = true; }
    if (!framed) return;
    const here = railIndex(path);
    if (framedStation.current === null) {
      framedStation.current = here;
      return;
    }
    if (here === framedStation.current) {
      /* SAME STATION, NEW ADDRESS — move the bar, do not re-host the frame.
         This branch used to be a bare `return`, and that is why a learner could
         flick through all fifty goals with the address bar still reading
         `/sio/SIO-001`: the scroller's `replaceState` rewrites the FRAME's URL,
         which is invisible, and the page's own URL never moved. Reload, or
         Share, and you were back at goal 1. (Dan, 7 Sep, pointing at a news
         site: scrolling on "automatically goes into the NEW URL".) */
      window.parent.postMessage({ type: RAIL_URL_MESSAGE, href: path }, window.location.origin);
      return;
    }
    framedStation.current = here;
    window.parent.postMessage({ type: RAIL_MESSAGE, href: path }, window.location.origin);
  }, [path]);

  useEffect(() => {
    let from: { x: number; y: number } | null = null;
    let last: { x: number; y: number } | null = null;

    const start = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || e.touches.length > 1 || claimedByAnythingElse(e.target)) {
        from = last = null;
        return;
      }
      from = last = { x: t.clientX, y: t.clientY };
    };
    const move = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) last = { x: t.clientX, y: t.clientY };
    };
    const end = (e: TouchEvent) => {
      const t = e.changedTouches?.[0];
      const startPt = from;
      const endPt = t ? { x: t.clientX, y: t.clientY } : last;
      from = last = null;
      if (!startPt || !endPt) return;
      const dx = endPt.x - startPt.x;
      const dy = endPt.y - startPt.y;
      if (Math.abs(dx) < MIN_PX || Math.abs(dx) < Math.abs(dy) * RATIO) return;
      // The deck of the page you are on, or the one you were last working on.
      /* THE QUERY IS READ HERE, NOT AT RENDER. `usePathname()` drops it, and
         ConjugaZone keeps its lesson in `?deck=` — so a right swipe off it
         would have had no idea which lesson to go back to. `useSearchParams`
         would force a Suspense boundary on a static export; the live address
         is right here in the handler and costs nothing. */
      const here = path + (typeof window !== "undefined" ? window.location.search : "");
      const { back, forward } = railNeighbours(path, deckFromPath(here) ?? recalledRailDeck());
      const go = dx > 0 ? back : forward;
      if (!go) return;
      /* A FRAMED STATION DOES NOT NAVIGATE ITSELF (Dan, 2026-09-07: everything
         runs inside the cahier in a frame). Pushing here would load the next
         station INSIDE the box, chrome and all, and the notebook would end up
         drawn twice with the second copy 400px tall. So the frame posts the
         destination up and the page around it moves; EmbedFrame listens. */
      if (window.self !== window.top) {
        window.parent.postMessage({ type: RAIL_MESSAGE, href: go.href }, window.location.origin);
        return;
      }
      router.push(go.href);
    };

    // Passive: this never calls preventDefault — `touch-action` is what decides
    // whether the browser scrolls, and a non-passive listener would only make
    // every scroll on every page slower for nothing.
    const opts = { passive: true } as const;
    window.addEventListener("touchstart", start, opts);
    window.addEventListener("touchmove", move, opts);
    window.addEventListener("touchend", end, opts);
    window.addEventListener("touchcancel", end, opts);
    return () => {
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
    };
  }, [path, router]);
}
