"use client";
/**
 * Draggable floating buttons (Dan, 2026-07-26: "make the floating buttons
 * movable, they are blocking the way"). Press-and-move relocates the button
 * anywhere on screen; a plain tap still clicks. The position persists per
 * device (localStorage) as right/bottom offsets, clamped to the viewport so
 * a saved spot from a big screen can't strand the button off a small one.
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

export function useDragFloat(key: string, def: { right: number; bottom: number }, side: "right" | "left" = "right") {
  const [pos, setPos] = useState(def);
  const drag = useRef<{ x: number; y: number; r: number; b: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    // Clamp the DEFAULT too, not just a saved spot — a fresh device used to
    // take `def` raw, which put both floats on top of the bottom bar
    // (patch 19's floor only ever rescued remembered positions).
    try {
      const raw = localStorage.getItem(key);
      setPos(clamp(raw ? (JSON.parse(raw) as { right: number; bottom: number }) : def));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function clamp(p: { right: number; bottom: number }) {
    const w = typeof window === "undefined" ? 9999 : window.innerWidth;
    const h = typeof window === "undefined" ? 9999 : window.innerHeight;
    // Below sm the bottom bar owns the last 56px + safe area. Without this
    // floor the feedback bubble and the tour launcher sit on top of the
    // first and last nav slots (seen 2026-08-10). BOTTOM_BAR_H must stay in
    // sync with .cahier-bottombar in globals.css.
    const BOTTOM_BAR_H = 60;
    const floor = w < 640 ? BOTTOM_BAR_H + 8 : 4;
    return {
      right: Math.min(Math.max(p.right, 4), Math.max(w - 56, 4)),
      bottom: Math.min(Math.max(p.bottom, floor), Math.max(h - 56, floor)),
    };
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, r: pos.right, b: pos.bottom, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 8) return; // tap tolerance
    d.moved = true;
    e.preventDefault();
    // left-anchored floats grow their offset moving right; right-anchored, moving left
    setPos(clamp({ right: side === "left" ? d.r + dx : d.r - dx, bottom: d.b - dy }));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 0);
      try { localStorage.setItem(key, JSON.stringify(pos)); } catch {}
    }
  };
  // persist the final position (pos in onPointerUp closes over a stale value)
  useEffect(() => {
    if (!drag.current && suppressClick.current) {
      try { localStorage.setItem(key, JSON.stringify(pos)); } catch {}
    }
  }, [pos, key]);

  /** Call first inside onClick: returns true if this "click" ended a drag. */
  const consumeClick = () => {
    if (suppressClick.current) { suppressClick.current = false; return true; }
    return false;
  };

  // The rendered bottom respects a page-declared floor (DrillShell sets
  // --float-floor while mounted so the floats clear its footer at every
  // width). CSS max() keeps this reactive across client-side navigation
  // with no route coupling; dragging still works — the visual position
  // simply pins at the floor instead of sliding under the footer.
  const bottom = `max(${pos.bottom}px, var(--float-floor, 0px))`;
  const style: CSSProperties = side === "left"
    ? { left: pos.right, bottom, touchAction: "none" }
    : { right: pos.right, bottom, touchAction: "none" };
  return { style, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }, consumeClick };
}
