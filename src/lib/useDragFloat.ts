"use client";
/**
 * Draggable floating buttons (Dan, 2026-07-26: "make the floating buttons
 * movable, they are blocking the way"). Press-and-move relocates the button
 * anywhere on screen; a plain tap still clicks. The position persists per
 * device (localStorage) as right/bottom offsets, clamped to the viewport so
 * a saved spot from a big screen can't strand the button off a small one.
 *
 * AND IT MOVES ITSELF OFF A CONTROL (Dan, 2026-09-12, shown ConjugaZone on a
 * phone: *"fix the ladybird one"*). Dragging answered the 2026-07-26 version
 * of this complaint by letting the learner move the button; it did not answer
 * the case where the button is blocking something BEFORE they have touched it.
 * Two measured examples on an iPhone 14 at /conjugaison, both on arrival:
 *
 *     iPhone SE   🐞 over the 🔊 on être's « ils » row
 *     iPhone 14   🐞 over the right third of « Check avoir »
 *
 * On a phone there is nowhere safe to park: the paper fills the width, so any
 * fixed corner is on top of the page. So the float looks at what is actually
 * underneath it and lifts just clear of it — the minimum, capped at 40% of the
 * screen, and never saved. Drag still wins: what the learner chose is the
 * anchor, and this only rides above it.
 *
 * WHAT COUNTS AS SOMETHING TO AVOID is a CONTROL, not any content. Text
 * scrolling under a floating button is normal and a learner can scroll it out;
 * a button they cannot press is a dead end. Other floats carry `data-float`
 * and are avoided too — 🐞 landing on 🛠️ is the same fault twice.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

/** A thing a learner taps. Deliberately not "any element": see the note above
 *  about text vs controls. `[data-float]` is how the floats find each other. */
const CONTROL =
  'a[href], button, input, select, textarea, summary, label, [role="button"], [role="link"], [data-float]';

/** Clearance between the float and whatever it has stepped over. */
const GAP = 10;

/** Never lift more than this share of the screen: a button that has climbed
 *  to the middle of the page is its own kind of blocking, and a page whose
 *  every row is a control has no clear spot to find. */
const MAX_LIFT = 0.4;

export function useDragFloat(key: string, def: { right: number; bottom: number }, side: "right" | "left" = "right") {
  const [pos, setPos] = useState(def);
  const drag = useRef<{ x: number; y: number; r: number; b: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  // Typed to the element both floats actually are. A wider HTMLElement ref
  // does not assign to a <button>'s own ref prop, and widening the button
  // instead would push the cast out to every caller.
  const ref = useRef<HTMLButtonElement | null>(null);
  /** Extra px above the anchored position, to clear a control. Not persisted —
   *  it describes THIS screenful, not the learner's choice of corner. */
  const [lift, setLift] = useState(0);

  useEffect(() => {
    // Clamp the DEFAULT too, not just a saved spot — a fresh device used to
    // take `def` raw, which put both floats on top of the bottom bar
    // (patch 19's floor only ever rescued remembered positions).
    try {
      const raw = localStorage.getItem(key);
      // Deliberate: the saved position lives in localStorage and the clamp
      // needs window.innerWidth/Height — neither exists during render
      // (static export), so the position is seeded on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPos(clamp(raw ? (JSON.parse(raw) as { right: number; bottom: number }) : def));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  function clamp(p: { right: number; bottom: number }) {
    const w = typeof window === "undefined" ? 9999 : window.innerWidth;
    const h = typeof window === "undefined" ? 9999 : window.innerHeight;
    // Viewport clamping only. Obstruction floors are NOT guessed here any
    // more (a hardcoded bar height drifted the moment the bar changed):
    // whatever owns a fixed bottom obstruction declares its own floor —
    // DrillShell sets --float-floor, the phone nav sets --bottombar-floor,
    // measured — and the rendered `bottom` below takes the max.
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

  /** Move clear of any control underneath.
   *
   *  RECTANGLES, NOT SAMPLE POINTS. The first cut asked `elementsFromPoint` at
   *  the float's centre and its four corners, which reads the page the way a
   *  finger does — through overlays and portals — but five points do not cover
   *  a 44px circle: on VocabulaRain it stepped to a spot that still clipped
   *  « ✨ Extra · 2 sets » by 244px², the overlap being at a corner the inset
   *  samples had gone past. Every visible control's box is measured once
   *  instead, and only the arithmetic is redone per candidate.
   *
   *  IT LOOKS DOWN AS WELL AS UP, which the second cut did not, and that was
   *  the whole difference on the two long galleries. Their flaps stack edge to
   *  edge with no gap between them, so clearing the one under the float by
   *  going UP means clearing every flap above it too — past the cap, so the
   *  float gave up and stayed where it was, still covering « 🍽️ Unité 4 · 5
   *  sets » by 927px². The room was a few pixels DOWN, in the page's own
   *  bottom padding. Both edges of every obstacle are candidates now and the
   *  nearest one that actually lands clear wins.
   *
   *  IT STILL GIVES UP RATHER THAN CLIMB. Where no candidate is clear — a page
   *  that is wall-to-wall controls — the float stays on its anchor. A button
   *  stranded mid-page AND still in the way is worse than one resting in the
   *  corner, where a learner can scroll past it or drag it.
   *
   *  Nothing here is saved: this describes the screenful, not the corner the
   *  learner chose. */
  const avoidControls = useCallback(() => {
    const el = ref.current;
    if (!el || drag.current) return;              // never fight a drag in progress
    const vh = window.innerHeight;
    const base = el.getBoundingClientRect();
    if (base.width === 0) { setLift(0); return; } // hidden — nothing to avoid

    const h = base.height;
    // Work in "px from the bottom of the screen", which is what `bottom` means.
    // The measured rect already includes the current lift, so take it back off
    // to recover where the anchor alone would put it.
    const anchor = vh - base.bottom - lift;

    // Every control on screen whose column the float shares, measured once.
    //
    // IT LOOKS INSIDE THE FRAME, and that is not a refinement — without it this
    // whole function does nothing where it is most needed. Every station runs
    // in the cahier in an iframe (Dan, 7 Sep), the float is rendered by the
    // ROOT layout, and `document.querySelectorAll` does not cross a frame
    // boundary. So on the real /conjugaison the float found a near-empty host
    // page, declared itself clear, and went on sitting on « Check avoir »
    // inside the frame — measured at 320px and 390px, 840px² and 779px² of
    // overlap with the float reporting no obstacle at all. The frames are
    // same-origin (they are this app), so their rects only need translating by
    // the frame's own position. Two levels deep: a station inside the cahier is
    // one, and a frame inside that is as far as this app ever nests.
    const boxes: { top: number; bottom: number; left: number; right: number }[] = [];
    const collect = (doc: Document, ox: number, oy: number, depth: number) => {
      for (const node of doc.querySelectorAll<HTMLElement>(CONTROL)) {
        if (node === el || el.contains(node) || node.contains(el)) continue;
        // Drops controls inside a closed <details> or a hidden tray, which are
        // not in anybody's way. A fixed element has no offsetParent and IS.
        if (!node.offsetParent && getComputedStyle(node).position !== "fixed") continue;
        const r = node.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const box = { top: r.top + oy, bottom: r.bottom + oy, left: r.left + ox, right: r.right + ox };
        if (box.right < base.left || box.left > base.right) continue;  // wrong column
        if (box.bottom < 0 || box.top > vh) continue;                  // off screen
        boxes.push(box);
      }
      if (depth <= 0) return;
      for (const frame of doc.querySelectorAll("iframe")) {
        const fr = frame.getBoundingClientRect();
        if (fr.width === 0 || fr.height === 0) continue;
        // Cross-origin throws by design; there is nothing to read and nothing
        // to do about it, so such a frame is simply invisible to this.
        try {
          const inner = frame.contentDocument;
          if (inner) collect(inner, ox + fr.left, oy + fr.top, depth - 1);
        } catch { /* cross-origin — not ours to measure */ }
      }
    };
    collect(document, 0, 0, 2);

    /** Does the float, placed `off` px from the bottom, touch any control? */
    const clear = (off: number) => {
      const bottom = vh - off, top = bottom - h;
      for (const r of boxes) if (r.bottom > top && r.top < bottom) return false;
      return true;
    };

    let next = 0;
    if (!clear(anchor)) {
      const cap = vh * MAX_LIFT;
      // Both edges of every obstacle: just above it, and just below it.
      const tries: number[] = [];
      for (const r of boxes) {
        tries.push(vh - r.top + GAP);          // float sits above this control
        tries.push(vh - r.bottom - h - GAP);   // float sits below it
      }
      let best: number | null = null;
      for (const off of tries) {
        if (off < 4 || off + h > vh - 4) continue;         // stay on screen
        if (Math.abs(off - anchor) > cap) continue;        // and near home
        if (!clear(off)) continue;
        if (best === null || Math.abs(off - anchor) < Math.abs(best - anchor)) best = off;
      }
      if (best !== null) next = Math.round(best - anchor);
    }
    setLift((was) => (Math.abs(was - next) < 1 ? was : next));
  }, [lift]);

  // Re-check when the page settles, not on every scroll frame: a button that
  // hops while the thumb is moving is worse than one that overlaps. Two
  // post-mount passes because content arrives after hydration (a deck loads,
  // an image lays out) and the first reading is of a page that is not there yet.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const settle = () => { clearTimeout(t); t = setTimeout(avoidControls, 140); };
    settle();
    // Two late passes: content arrives after hydration (a deck loads, a frame
    // finishes) and the first reading is of a page that is not there yet.
    const late = [setTimeout(avoidControls, 700), setTimeout(avoidControls, 1800)];

    // A frame scrolls its OWN window and the event does not reach this one, so
    // a station scrolled inside the cahier would never re-measure. Same-origin
    // only, for the same reason as the collector above.
    const targets: (Window | Document)[] = [window];
    for (const frame of document.querySelectorAll("iframe")) {
      try { if (frame.contentWindow && frame.contentDocument) targets.push(frame.contentWindow); } catch {}
      frame.addEventListener("load", settle);
    }
    for (const w of targets) {
      w.addEventListener("scroll", settle, { passive: true, capture: true });
    }
    window.addEventListener("resize", settle);
    return () => {
      clearTimeout(t); late.forEach(clearTimeout);
      for (const w of targets) {
        try { w.removeEventListener("scroll", settle, { capture: true } as EventListenerOptions); } catch {}
      }
      for (const frame of document.querySelectorAll("iframe")) frame.removeEventListener("load", settle);
      window.removeEventListener("resize", settle);
    };
  }, [avoidControls]);

  /** Call first inside onClick: returns true if this "click" ended a drag. */
  const consumeClick = () => {
    if (suppressClick.current) { suppressClick.current = false; return true; }
    return false;
  };

  // The rendered bottom respects every declared floor (DrillShell sets
  // --float-floor while mounted, the phone nav sets --bottombar-floor while
  // visible). CSS max() keeps this reactive across client-side navigation
  // and breakpoint changes with no route coupling; dragging still works —
  // the visual position simply pins at the floor instead of sliding under.
  //
  // THE OFFSET IS ADDED OUTSIDE THE max(), not as another floor inside it. A
  // floor says "never below this"; this says "relative to wherever you are",
  // and folding it in would let a page with a tall bottom bar swallow it. It
  // can be negative — see avoidControls on why stepping DOWN is often the
  // shorter way out — and `calc()` takes the sign in the string either way.
  const anchored = `max(${pos.bottom}px, var(--float-floor, 0px), var(--bottombar-floor, 0px))`;
  const bottom = lift === 0 ? anchored : `calc(${anchored} + ${lift}px)`;
  const style: CSSProperties = {
    ...(side === "left" ? { left: pos.right } : { right: pos.right }),
    bottom,
    touchAction: "none",
    // Only the step over a control animates. Dragging sets `right`/`bottom`
    // every pointermove, and a transition on those would make the button lag
    // the finger, so the property list names one thing.
    transition: "bottom 160ms ease",
  };
  return {
    style,
    handlers: {
      ref,
      "data-float": "",
      onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp,
    },
    consumeClick,
    /** Re-read what is underneath — for a caller that changes the page itself
     *  (opening a tray, closing a sheet) rather than waiting for a scroll. */
    recheck: avoidControls,
  };
}
