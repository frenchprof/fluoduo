"use client";

/**
 * Two-finger pinch → a zoom percentage, as a hook — split OUT of MapBody on
 * 7 Sep, and the split is the swipe-rail law (verify117 §2): a file that
 * NAVIGATES may not also read fingers, and MapBody began navigating when its
 * stops became doors to /sio/[id]. The pinch is the map's own board gesture
 * (the class of touch the rail check explicitly leaves alone), so it moves
 * here whole: same listeners, same passive/non-passive split, same
 * read-through-ref binding. Nothing about the gesture changed — only which
 * file owns it.
 *
 * `touch-action: pan-y` stays the CALLER's job on the element it passes,
 * since it is a style on the wrapper, not part of the gesture.
 */
import { useEffect, useRef, type RefObject } from "react";

export function usePinchZoom(
  ref: RefObject<HTMLElement | null>,
  zoomPct: number,
  setZoom: (pct: number) => void,
): void {
  const zoomRef = useRef(100);
  // Mirrored in an effect, not written during render: a ref write during
  // render is what the repo's lint rule forbids; the ref only seeds
  // `baseZoom` when two fingers land, long after the effect has flushed.
  useEffect(() => { zoomRef.current = zoomPct; }, [zoomPct]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let baseDist = 0;
    let baseZoom = 100;
    const gap = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) { baseDist = gap(e.touches); baseZoom = zoomRef.current; }
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || baseDist <= 0) return;
      e.preventDefault();
      setZoom(baseZoom * (gap(e.touches) / baseDist));
    };
    const onEnd = (e: TouchEvent) => { if (e.touches.length < 2) baseDist = 0; };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
    // Binds once: the live zoom is read through zoomRef rather than closed
    // over, so the listeners never need re-attaching.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
