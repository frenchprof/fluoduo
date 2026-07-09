/**
 * Where ▶ Continuer points (Dan, 2026-07-08: "when a later step has been
 * marked as done, continue should actually start from there") — the first
 * not-done SIO AFTER the furthest « done », so a learner who skipped ahead
 * picks up where they last were, not back at their earliest gap. Falls back
 * to the earliest gap when the tail is complete; undefined when all 50 are.
 */
import { SIOS } from "@/content/sios";
import { isSioDone, type Progress } from "@/lib/progress";

export function nextSioId(progress: Progress): string | undefined {
  let lastDone = -1;
  SIOS.forEach((s, i) => {
    if (isSioDone(s.id, progress)) lastDone = i;
  });
  const afterFurthest = SIOS.slice(lastDone + 1).find((s) => !isSioDone(s.id, progress));
  return (afterFurthest ?? SIOS.find((s) => !isSioDone(s.id, progress)))?.id;
}
