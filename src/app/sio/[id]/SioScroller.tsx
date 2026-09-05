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
import { useEffect, useRef } from "react";
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
  const current = useRef(id);

  // LAND ON THE GOAL YOU CAME FROM, without animating fifty screens to get
  // there. `scrollIntoView({ behavior: "instant" })` inside an effect runs
  // after layout, so the section has its height; doing this during render
  // would scroll to a box that is still zero tall.
  useEffect(() => {
    const el = document.getElementById(`goal-${id}`);
    el?.scrollIntoView({ behavior: "instant", block: "start" });
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

  return (
    <div
      ref={box}
      className="h-[calc(100dvh-190px)] snap-y snap-mandatory overflow-y-auto overscroll-contain"
      onTouchStart={(e) => {
        const t = e.touches[0];
        from.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = from.current;
        from.current = null;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Decisively horizontal, or it is the vertical scroll this page is
        // built around — the same 60px / 1.5x guard the lesson tabs use.
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        if (dx > 0) {
          router.push("/map");
          return;
        }
        const sio = SIOS.find((s) => s.id === current.current);
        const href = sio ? forwardHref(sio) : null;
        if (href) router.push(href);
      }}
    >
      {SIOS.map((s) => (
        <section
          key={s.id}
          id={`goal-${s.id}`}
          data-sio={s.id}
          className={`flex h-full snap-start snap-always flex-col justify-center px-1 py-4 ${s.unit != null ? `fam-none` : ""}`}
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
