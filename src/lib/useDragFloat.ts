"use client";
/**
 * Draggable floating buttons (Dan, 2026-07-26: "make the floating buttons
 * movable, they are blocking the way"). Press-and-move relocates the button
 * anywhere on screen; a plain tap still clicks. The position persists per
 * device (localStorage) as right/bottom offsets, clamped to the viewport so
 * a saved spot from a big screen can't strand the button off a small one.
 */
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

export function useDragFloat(key: string, def: { right: number; bottom: number }) {
  const [pos, setPos] = useState(def);
  const drag = useRef<{ x: number; y: number; r: number; b: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const p = JSON.parse(raw) as { right: number; bottom: number };
        setPos(clamp(p));
      }
    } catch {}
  }, [key]);

  function clamp(p: { right: number; bottom: number }) {
    const w = typeof window === "undefined" ? 9999 : window.innerWidth;
    const h = typeof window === "undefined" ? 9999 : window.innerHeight;
    return {
      right: Math.min(Math.max(p.right, 4), Math.max(w - 56, 4)),
      bottom: Math.min(Math.max(p.bottom, 4), Math.max(h - 56, 4)),
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
    setPos(clamp({ right: d.r - dx, bottom: d.b - dy }));
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

  const style: CSSProperties = { right: pos.right, bottom: pos.bottom, touchAction: "none" };
  return { style, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }, consumeClick };
}
