"use client";

/**
 * THE GEM SHELF — the two things gems buy that are PREFERENCES, under one
 * balance, in Settings.
 *
 * Dan moved both here on 2026-09-12, in two messages an hour apart: *"As for
 * the 'payable' colors, move them into Settings instead"*, then *"move the
 * bouclier to settings too. but we should call it streak-freezer instead of
 * bouclier (better contrast between fire and ice)"*. What stayed behind on the
 * profile is what a learner EARNED (the badges) and what is extra course (the
 * expert deck, now under FRILLS).
 *
 * WHY THIS WRAPPER EXISTS AT ALL. Each of the two drew its own « 💎 340 »
 * chip, so Settings printed the same balance twice, forty pixels apart — text
 * the litmus test deletes on sight. Hoisting the chip alone would have left it
 * stale the moment a colour or a freezer was bought, because each child owned
 * its own copy of `progress`. So the state comes up here instead: one read,
 * one balance, and both children report their purchase back to it.
 */
import { useEffect, useState } from "react";

import AccentColours from "@/components/AccentColours";
import StreakFreezer from "@/components/StreakFreezer";
import { loadProgress, type Progress } from "@/lib/progress";

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const LINE = "var(--cahier-line-strong)";

export default function GemShelf() {
  const [p, setP] = useState<Progress | null>(null);

  useEffect(() => {
    // localStorage cannot be read during render on a static export.
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setP(loadProgress());
  }, []);

  if (!p) return null;

  return (
    <div className="flex flex-col gap-3.5">
      <span className="fluo-mono self-start rounded-md border-2 px-2 py-1.5 text-[12px] font-bold" style={{ borderColor: LINE, color: INK }}>
        💎 {p.gems}
      </span>

      <div>
        <h3 className="fluo-mono mb-1.5 text-[11px] font-black tracking-[0.06em]" style={{ color: SOFT }}>ACCENT COLOUR</h3>
        <AccentColours p={p} onChange={setP} />
      </div>

      <div>
        <h3 className="fluo-mono mb-1.5 text-[11px] font-black tracking-[0.06em]" style={{ color: SOFT }}>STREAK-FREEZER</h3>
        <StreakFreezer p={p} onChange={setP} />
      </div>
    </div>
  );
}
