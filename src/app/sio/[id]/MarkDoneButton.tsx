"use client";

/**
 * Self-reported completion for a SIO's Post-lesson Practice — the only honest
 * "done" signal available right now, since none of the games (Flip It, Match
 * It, Letris) report completion back to any shared store yet. Same pattern
 * Flip It already uses for its Reviewed/To-Review toggle.
 *
 * Marking a SIO done: awards a flat gems amount, bumps today's streak, and
 * unlocks the next SIO by sequence on the home path (see src/lib/progress.ts
 * + SioHub.tsx). Never call this from a Pretest — completion here is a
 * Practice-side action only.
 */
import { useEffect, useState } from "react";
import { isSioDone, loadProgress, markSioDone, unmarkSioDone, type Progress } from "@/lib/progress";

export default function MarkDoneButton({ sioId }: { sioId: string }) {
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return null; // avoid a flash of the wrong state before mount

  const done = isSioDone(sioId, progress);

  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        type="button"
        onClick={() => setProgress(done ? unmarkSioDone(sioId) : markSioDone(sioId))}
        className={`fluo-btn fluo-btn-sm ${done ? "fluo-btn-correct" : ""}`}
      >
        {done ? "✓ Done" : "Mark as done"}
      </button>
      <span className="text-xs text-[color:var(--fluo-ink-soft)]">
        {done ? "Unlocked the next objective · +10 💎 earned" : "Unlocks the next objective on the path and earns 💎"}
      </span>
    </div>
  );
}
