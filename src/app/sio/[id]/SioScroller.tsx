"use client";

/**
 * The fifty goals, one per screen, snapping.
 *
 * Dan, 2026-09-05, describing the middle level of MAP > SIO > MneMemo:
 * *"we are back to the doomscrolling of all the SIOs, one per page, as one
 * swipes up down, it lands like a magnet onto the next goal or previous. It
 * should stop rather than continuous scroll. the magnet stops it."*
 *
 * THE MAGNET IS `scroll-snap-type: y mandatory`, and mandatory rather than
 * proximity is the whole of his sentence: proximity lets a flick coast past
 * three goals and settle wherever it ran out, which IS continuous scrolling
 * with a tidy ending. Mandatory means the scroller may only ever rest ON a
 * goal, so one swipe moves exactly one.
 *
 * WHY THIS ROUTE CAME BACK. `/sio/[id]` was reduced to a redirect in patch 25
 * because the page it replaced duplicated Home's popup and had drifted out of
 * step with it — its pre-test button said "Planned" for pre-tests that
 * existed. That reasoning was about DUPLICATION, and it no longer applies:
 * this page is not a second copy of the popup, it is the level Dan's chain
 * names, and the card it shows is the same `GoalCard` the lesson's Goal tab
 * shows, from one file, so the two cannot drift the way those two did.
 *
 * SWIPING RIGHTWARDS IS BACK, the same rule as the lesson's tabs: rightwards
 * drags the page right and reveals what is to its left, so from here it goes
 * to the map. Leftwards goes forward, into this goal's lesson.
 */
import { useEffect, useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import GoalCard from "@/components/GoalCard";
import { SIOS, type Sio } from "@/content/sios";
import { lessonsForDeck } from "@/content/lessons";

/** Where "forward" goes from a goal: its lesson, or its deck if it has none. */
function forwardHref(sio: Sio): string | null {
  if (!sio.collectionId) return null;
  const lesson = lessonsForDeck(sio.collectionId)[0];
  return lesson ? `/lessons/deck/${sio.collectionId}` : `/decks/${sio.collectionId}`;
}

export default function SioScroller({ id }: { id: string }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement | null>(null);
  const from = useRef<{ x: number; y: number } | null>(null);
  /** Where the finger got to — so a CANCELLED gesture is still judged on real
   *  movement rather than dropped. */
  const last = useRef<{ x: number; y: number } | null>(null);
  const current = useRef(id);

  /* THE SCROLL HAPPENS BEHIND A FROZEN HEADER (Dan, 2026-09-05), and that only
     works if the WINDOW does not scroll as well. It did: the height here was a
     guessed `100dvh - 190px`, which left the document 162px taller than the
     viewport at 390x840, so the site bar scrolled off the top while the goals
     were still snapping underneath — two scrollers, one of them undoing the
     freeze.
   *
   * Measured instead of guessed, and measured the only way that stays true when
   * the band, the bottom bar or the phone's toolbars change: collapse this box
   * to nothing, ask the document how tall the REST of the page is, and take
   * what is left. No constant to go stale.
   *
   * The height is written to the node rather than to state on purpose — a
   * measure-then-setState in an effect is the `set-state-in-effect` fault this
   * repo has 130 of, and it would render twice for a value the DOM already has.
   */
  /* LOCK THE DOCUMENT WHILE THIS PAGE IS UP.
   *
   * "Behind a frozen header" needs the header to be incapable of moving, and
   * on this shell fitting the content cannot deliver that: `.cahier-page` is
   * `min-h-screen`, so the document is at least a viewport tall BEFORE the
   * desk's padding and the footer beneath it — measured, 162px of window scroll
   * that no height given to the goals could remove.
   *
   * Sticky is no escape either. `.cahier-page` is `overflow: hidden`, which
   * makes it the containing block for a sticky child, so a `position: sticky`
   * band inside it never sees the window scroll at all — measured, having first
   * shipped exactly that band and watched it slide off the top.
   *
   * So the window is taken out of the equation for the life of this page, which
   * is what a full-screen scroller means. The footer is out of reach here and
   * on every other page it is not.
   */
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = prev; };
  }, []);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      // Collapse first, so this box's height cannot be part of the sum.
      el.style.height = "0px";
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

  // LAND ON THE GOAL YOU CAME FROM, without animating fifty screens to get
  // there. `scrollIntoView({ behavior: "instant" })` inside an effect runs
  // after layout, so the section has its height; doing this during render
  // would scroll to a box that is still zero tall.
  useEffect(() => {
    const el = document.getElementById(`goal-${id}`);
    const boxEl = box.current;
    if (!el || !boxEl) return;
    // `scrollTop`, NOT `scrollIntoView`: that scrolls every ancestor including
    // the window, so opening SIO-015 scrolled the PAGE down 174px and took the
    // frozen header off the top with it — the opposite of what it is for. This
    // moves the goals and nothing else.
    boxEl.scrollTop = el.offsetTop;
  }, [id]);

  // Keep the URL honest as the magnet moves, so a reload and the browser's
  // Back both land where the learner actually is. `replaceState` rather than
  // push: scrolling is not navigation, and fifty history entries would make
  // Back useless.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const sid = (e.target as HTMLElement).dataset.sio;
          if (sid && sid !== current.current) {
            current.current = sid;
            window.history.replaceState(null, "", `/sio/${sid}`);
          }
        }
      },
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("[data-sio]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  function endSwipe(t: { clientX: number; clientY: number } | null) {
    const start = from.current;
    const end = t ? { x: t.clientX, y: t.clientY } : last.current;
    from.current = null;
    last.current = null;
    if (!start || !end) return;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    // Decisively horizontal, or it is the vertical scroll this page is built
    // around — the same 60px / 1.5x guard the lesson tabs use.
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx > 0) {
      router.push("/map");
      return;
    }
    const sio = SIOS.find((x) => x.id === current.current);
    const href = sio ? forwardHref(sio) : null;
    if (href) router.push(href);
  }

  return (
    <div
      ref={box}
      /* `touch-pan-y` and `touchcancel` for the same reason as the lesson tabs
         (Dan, 2026-09-06: *"none of the swiping seems to be working"*), and
         this box needs them more than that one does: it IS a vertical scroller
         with a mandatory snap, so a sideways drag inside it is precisely the
         gesture a browser is most likely to claim and end with `touchcancel`.
         Declaring pan-y as the only native gesture leaves the horizontal one
         to us; tracking the last move means a claimed gesture is still judged
         on where the finger got to. */
      className="h-[calc(100dvh-190px)] touch-pan-y snap-y snap-mandatory overflow-y-auto overscroll-contain"
      onTouchStart={(e) => {
        const t = e.touches[0];
        from.current = { x: t.clientX, y: t.clientY };
        last.current = from.current;
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (t) last.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchCancel={() => endSwipe(null)}
      onTouchEnd={(e) => endSwipe(e.changedTouches[0])}
    >
      {SIOS.map((s) => (
        <section
          key={s.id}
          id={`goal-${s.id}`}
          data-sio={s.id}
          className={`flex h-full snap-start snap-always flex-col justify-center px-1 py-4`}
        >
          <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 p-4">
            <GoalCard sio={s} />
          </div>
          {/* The count is the one thing a scroller cannot show: where you are
              in fifty when only one is on screen. */}
          <p className="mt-3 text-center text-[11px] font-bold text-[color:var(--fluo-ink-soft)]">
            {s.num} / {SIOS.length}
          </p>
        </section>
      ))}
    </div>
  );
}
