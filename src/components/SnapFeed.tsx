"use client";

/**
 * ONE ITEM PER SCREEN, AND THE MAGNET STOPS ON EACH — the ROW mechanism.
 *
 * Dan, 2026-09-05, on the goals: *"we are back to the doomscrolling of all the
 * SIOs, one per page, as one swipes up down, it lands like a magnet onto the
 * next goal or previous. It should stop rather than continuous scroll. the
 * magnet stops it."* And 2026-09-07, on the pre-tests: *"ONE QUESTION PER PAGE
 * … so that we scroll down when one is done"*, then, removing the ambiguity
 * himself: *"scroll down = swipe up"*.
 *
 * Two surfaces, one behaviour, so it is one component. It was written twice
 * over in the goals scroller before this file existed, and the second copy
 * would have been the pre-test's.
 *
 * THE MAGNET IS `scroll-snap-type: y mandatory`, and mandatory rather than
 * proximity is the whole of Dan's sentence: proximity lets a flick coast past
 * three items and settle wherever it ran out, which IS continuous scrolling
 * with a tidy ending. Mandatory means the scroller may only ever rest ON an
 * item, so one swipe moves exactly one.
 *
 * THE HEIGHT IS MEASURED, NEVER GUESSED. The first version of this used
 * `100dvh - 190px`, which left the document 162px taller than the viewport at
 * 390x840 — so the site bar scrolled off the top while the items were still
 * snapping underneath, two scrollers with one undoing the other. Instead:
 * collapse this box to nothing, ask the document how tall the REST of the page
 * is, take what is left. No constant to go stale when the band, the bottom bar
 * or the phone's own toolbars change.
 *
 * AND THE DOCUMENT IS LOCKED while a feed is up, which is what "full screen"
 * actually means here. Fitting the content cannot deliver it on this shell:
 * `.cahier-page` is `min-h-screen`, so the document is a viewport tall BEFORE
 * the desk's padding and the footer beneath it. Sticky is no escape either —
 * `.cahier-page` is `overflow: hidden`, which makes it the containing block for
 * a sticky child, so a sticky band inside it never sees the window scroll at
 * all. Both were shipped and measured before the lock was.
 */
import { Children, forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, type ReactNode } from "react";

/** What a caller can ask the feed to do. A KEYBOARD needs this and a finger
 *  does not: there is no swipe on a laptop, so "the way on is the gesture"
 *  would strand anyone answering with the number keys. */
export type SnapFeedHandle = { scrollToRow: (i: number) => void };

const SnapFeed = forwardRef<SnapFeedHandle, {
  children: ReactNode;
  /** Fired as the magnet settles — for a counter, or to keep a URL honest. */
  onIndex?: (i: number) => void;
  /** Which row to open on, once, without animating past the ones before it. */
  startAt?: number;
  className?: string;
  sectionClassName?: string;
}>(function SnapFeed({
  children,
  onIndex,
  startAt = 0,
  className = "",
  sectionClassName = "",
}, ref) {
  const box = useRef<HTMLDivElement | null>(null);
  const rows = Children.toArray(children);
  const settled = useRef(-1);

  useImperativeHandle(ref, () => ({
    scrollToRow(i: number) {
      const el = box.current;
      const row = el?.children[i] as HTMLElement | undefined;
      if (el && row) el.scrollTo({ top: row.offsetTop, behavior: "smooth" });
    },
  }), []);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = prev; };
  }, []);

  /* The height is written to the NODE rather than to state on purpose: a
     measure-then-setState in an effect is the `set-state-in-effect` fault this
     repo has 130 of, and it would render twice for a value the DOM already has. */
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "0px"; // collapse first, so this box is not in the sum
      // The bottom bar is `position: fixed` and `display:none` above sm, so it
      // overlays rather than adds height — ask it, do not assume.
      const nav = document.querySelector<HTMLElement>(".cahier-bottombar");
      const navH = nav && getComputedStyle(nav).display !== "none"
        ? nav.getBoundingClientRect().height
        : 0;
      const top = el.getBoundingClientRect().top + window.scrollY;
      el.style.height = `${Math.max(240, window.innerHeight - top - navH)}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  // Land on the row asked for, without animating every row to get there.
  // `scrollTop`, NOT `scrollIntoView`: that scrolls every ancestor including
  // the window, and takes the frozen header off the top with it.
  useEffect(() => {
    const el = box.current;
    if (!el || !startAt) return;
    const row = el.children[startAt] as HTMLElement | undefined;
    if (row) el.scrollTop = row.offsetTop;
  }, [startAt]);

  useEffect(() => {
    const el = box.current;
    if (!el || !onIndex) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.row);
          if (Number.isFinite(i) && i !== settled.current) {
            settled.current = i;
            onIndex(i);
          }
        }
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("[data-row]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onIndex, rows.length]);

  return (
    <div
      ref={box}
      /* `touch-pan-y` declares the vertical pan to be the only gesture the
         BROWSER owns here, which is what leaves the sideways drag for the rail
         to read (components/useRailSwipe.ts). A scroller with a mandatory snap
         is precisely the element a browser is most likely to claim a sideways
         drag inside. */
      className={`touch-pan-y snap-y snap-mandatory overflow-y-auto overscroll-contain ${className}`}
    >
      {rows.map((row, i) => (
        <section
          key={i}
          data-row={i}
          className={`flex h-full snap-start snap-always flex-col justify-center ${sectionClassName}`}
        >
          {row}
        </section>
      ))}
    </div>
  );
});

export default SnapFeed;
