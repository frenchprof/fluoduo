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
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { deckFromPath, railNeighbours, rememberRailDeck, recalledRailDeck } from "@/lib/swipeRail";

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
  const path = usePathname() ?? "/";

  // The deck is remembered as you pass through the goal-shaped columns, so a
  // trip out to ConjugaZone and back lands on the flashcards of the goal you
  // left rather than on a picker.
  useEffect(() => { rememberRailDeck(deckFromPath(path)); }, [path]);

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
      const { back, forward } = railNeighbours(path, deckFromPath(path) ?? recalledRailDeck());
      const go = dx > 0 ? back : forward;
      if (go) router.push(go.href);
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
