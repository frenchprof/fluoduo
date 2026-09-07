"use client";

/**
 * The fifty goals, one per screen, snapping — COLUMN 1 of Dan's chain.
 *
 * Dan, 2026-09-05: *"we are back to the doomscrolling of all the SIOs, one per
 * page, as one swipes up down, it lands like a magnet onto the next goal or
 * previous. It should stop rather than continuous scroll. the magnet stops
 * it."* That mechanism now lives in `components/SnapFeed.tsx`, because the
 * pre-tests need exactly the same thing (Dan, 2026-09-07: *"ONE QUESTION PER
 * PAGE"*) and it had already been written out once here in full — measured
 * heights, the document lock, the observer and all.
 *
 * WHY THIS ROUTE CAME BACK. `/sio/[id]` was reduced to a redirect in patch 25
 * because the page it replaced duplicated Home's popup and had drifted out of
 * step with it — its pre-test button said "Planned" for pre-tests that
 * existed. That reasoning was about DUPLICATION, and it no longer applies:
 * this page is not a second copy of the popup, it is the level Dan's chain
 * names, and the card it shows is the same `GoalCard` the lesson's Goal tab
 * shows, from one file, so the two cannot drift the way those two did.
 *
 * SIDEWAYS IS NOT THIS FILE'S BUSINESS. It used to carry its own copy of the
 * 60px / 1.5x swipe arithmetic and its own idea of where forward went. The
 * chain lives in `lib/swipeRail.ts` now and one handler reads it for every
 * page, so the goals are a COLUMN on that rail rather than a special case.
 * What this file still owns is the VERTICAL — the rows.
 */
import { useCallback, useRef } from "react";
import GoalCard from "@/components/GoalCard";
import SnapFeed from "@/components/SnapFeed";
import { SIOS } from "@/content/sios";

export default function SioScroller({ id }: { id: string }) {
  const current = useRef(id);
  const startAt = Math.max(0, SIOS.findIndex((s) => s.id === id));

  // Keep the URL honest as the magnet moves, so a reload and the browser's
  // Back both land where the learner actually is. `replaceState` rather than
  // push: scrolling is not navigation, and fifty history entries would make
  // Back useless.
  const onIndex = useCallback((i: number) => {
    const sid = SIOS[i]?.id;
    if (sid && sid !== current.current) {
      current.current = sid;
      window.history.replaceState(null, "", `/sio/${sid}`);
    }
  }, []);

  return (
    /* PINNED TO THE TOP, NOT CENTRED (Dan, 2026-09-07: the tag and the icons
       sit "perpetually at the same height"). Centring puts a two-line goal in
       a different place from a four-line one, so flicking through the fifty
       makes the scrap and the icons hop about. `pt-6` is that height. */
    <SnapFeed startAt={startAt} onIndex={onIndex} sectionClassName="justify-start px-1 pb-4 pt-6">
      {SIOS.map((s) => (
        <div key={s.id} id={`goal-${s.id}`} data-sio={s.id}>
          {/* THE CARD HOLDS THE WORDS; THE ICONS SIT OUTSIDE IT (Dan: "the
              icons can just be by themselves below that"). They used to be
              inside the ruled box with everything else, which made them look
              like part of the sentence rather than the ways into it. */}
          <div className="rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/70 px-4 pb-4 pt-3">
            <GoalCard sio={s} textOnly />
          </div>
          <GoalCard sio={s} iconsOnly />
          {/* The count is the one thing a scroller cannot show: where you are
              in fifty when only one is on screen. */}
          <p className="mt-4 text-center text-[11px] font-bold text-[color:var(--fluo-ink-soft)]">
            {s.num} / {SIOS.length}
          </p>
        </div>
      ))}
    </SnapFeed>
  );
}
