"use client";

/**
 * The help ladder in a drill — React glue around the pure machine
 * (ladder.ts) and the rule-based generators (hints.ts). Track D, row 6.
 *
 * A drill calls it once per item, hands `help` to DrillShell, and routes
 * every graded answer through `attempt()`, which
 *   1. records the answer with the evidence the ladder ACTUALLY earned
 *      (assistance = highest rung shown, independent = none shown, first try),
 *   2. steps the machine (a wrong try may open a hint or the answer),
 *   3. drops a hinted/revealed item into the ReVue queue the moment it
 *      closes (progress.ts queueForReview — the same hook the game
 *      post-mortem uses), and
 *   4. logs ONE `help.rung` event per transition for the research programme,
 *      plus the older `hint.tap` / `answer.reveal` the dashboards count.
 *
 * Idle escalation runs on a 1 s tick while the item is open — hints only,
 * never the answer (ladder.ts enforces it; this file just supplies the clock).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DrillHelp } from "@/components/DrillShell";
import { queueForReview, recordItemResult } from "@/lib/progress";
import type { Rung, TaskKind } from "./hints";
import {
  canHelp,
  createLadder,
  evidenceOf,
  helpLabel,
  rungEvent,
  shouldQueueForReview,
  step,
  type Ladder,
  type LadderEvidence,
  type StepResult,
} from "./ladder";

export type UseHelpLadderOpts = {
  kind: TaskKind;
  /** Anything that changes when the item changes — resets the ladder. */
  itemKey: string | number | null | undefined;
  /** The SRS/response id (what recordItemResult is keyed on). */
  itemId?: string;
  /** Research-log surface name ("complete-it", "dice"…). */
  surface: string;
  /** Rule-based rungs for this item (hints.ts hintsFor). */
  hints: Rung[];
  /** What REVEAL shows. */
  reveal: string;
  /** false = no ladder on this item (study mode, done screen). */
  enabled?: boolean;
};

export type AttemptRecord = {
  given?: string;
  activity?: string;
  latencyMs?: number;
  /** Skip recordItemResult (the drill records itself) — the ladder still steps and queues. */
  noRecord?: boolean;
};

export type HelpLadderApi = {
  ladder: Ladder;
  /** DrillShell's `help` prop. null when disabled. */
  help: DrillHelp | null;
  /** The rungs opened so far (the answer last, once revealed). */
  shown: Rung[];
  /** MCQ: option labels the hints have struck out. */
  eliminated: string[];
  revealed: boolean;
  /** Evidence the NEXT attempt would carry. */
  evidence: LadderEvidence;
  /** Grade landed: record it (unless noRecord), step the machine. */
  attempt: (correct: boolean, rec?: AttemptRecord) => StepResult;
  /** The learner tapped ? (also what the shell's control calls). */
  climb: () => StepResult;
  /** Move on without another attempt (closes the item). */
  skip: () => void;
};

const NOOP: StepResult = { ladder: createLadder("typed", [], 0), effect: "none", auto: false };

export function useHelpLadder(opts: UseHelpLadderOpts): HelpLadderApi {
  const { kind, itemKey, itemId, surface, hints, reveal, enabled = true } = opts;
  const levels = useMemo(() => hints.map((h) => h.level), [hints]);
  // A new item = a fresh ladder, reset DURING render (the React-sanctioned
  // "adjust state when a prop changes" pattern — no effect, no extra frame
  // in which a stale ladder could leak into the new item).
  const resetKey = `${String(itemKey)}|${kind}|${levels.join("|")}`;
  const [state, setState] = useState<{ key: string; ladder: Ladder }>(() => ({ key: resetKey, ladder: createLadder(kind, levels, Date.now()) }));
  let ladder = state.ladder;
  if (state.key !== resetKey) {
    // eslint-disable-next-line react-hooks/purity -- the clock stamp is data, never rendered
    ladder = createLadder(kind, levels, Date.now());
    setState({ key: resetKey, ladder });
  }
  const setLadder = useCallback((l: Ladder) => setState({ key: resetKey, ladder: l }), [resetKey]);
  // Refs for the event handlers (attempt/climb/tick read the LATEST ladder,
  // even when called back-to-back inside one tick).
  const ladderRef = useRef(ladder);
  const hintsRef = useRef(hints);
  useEffect(() => { ladderRef.current = ladder; hintsRef.current = hints; });

  const log = useCallback((before: Ladder, r: StepResult, at: number) => {
    if (r.effect === "none" && before.state === r.ladder.state) return;
    const ev = rungEvent(surface, itemId, before, r, at);
    void import("@/lib/firebase/usage")
      .then((m) => {
        void m.logEvent("help.rung", ev as unknown as Record<string, unknown>);
        // The pre-Track-D events the teacher dashboards already count.
        if (r.effect === "hint") {
          const rung = hintsRef.current[r.ladder.hintsTaken - 1]?.level ?? "nudge";
          void m.logEvent("hint.tap", { surface, itemId, rung, level: r.ladder.hintsTaken, auto: r.auto });
        } else if (r.effect === "reveal") {
          void m.logEvent("answer.reveal", { surface, itemId, rung: "answer", level: r.ladder.hintsTaken + 1, auto: r.auto });
        }
      })
      .catch(() => {});
  }, [surface, itemId]);

  const apply = useCallback((r: StepResult, before: Ladder, at: number) => {
    ladderRef.current = r.ladder;
    setLadder(r.ladder);
    log(before, r, at);
    // Row 3: the item closes with help taken → into the ReVue queue, due now.
    if (r.effect === "done" && itemId && shouldQueueForReview(r.ladder)) queueForReview([itemId]);
    return r;
  }, [log, itemId, setLadder]);

  const attempt = useCallback((correct: boolean, rec: AttemptRecord = {}): StepResult => {
    if (!enabled) return NOOP;
    const before = ladderRef.current;
    const at = Date.now();
    if (!rec.noRecord && itemId) {
      const ev = evidenceOf(before);
      // Only the FIRST attempt on an item pays (Dan, 2026-08-27). A retry
      // after a wrong answer, or after the answer was revealed, still records
      // — the evidence trail wants every attempt — but earns nothing more, so
      // guessing first can never out-earn knowing.
      const firstTry = before.wrongTries === 0 && !before.revealed;
      recordItemResult(itemId, correct, rec.given, rec.activity, {
        hintsTaken: ev.hintsTaken,
        revealed: ev.revealed,
        assistance: ev.assistance,
        latencyMs: rec.latencyMs,
        award: firstTry,
      });
    }
    return apply(step(before, { type: "attempt", correct, at }), before, at);
  }, [enabled, itemId, apply]);

  const climb = useCallback((): StepResult => {
    if (!enabled) return NOOP;
    const before = ladderRef.current;
    const at = Date.now();
    return apply(step(before, { type: "help", at }), before, at);
  }, [enabled, apply]);

  const skip = useCallback(() => {
    if (!enabled) return;
    const before = ladderRef.current;
    if (before.state === "DONE") return;
    const at = Date.now();
    apply(step(before, { type: "skip", at }), before, at);
  }, [enabled, apply]);

  // The clock for idle escalation. Ticks only while the item is open.
  const open = enabled && ladder.state !== "DONE" && ladder.state !== "REVEAL" && ladder.state !== "RETRY_AFTER_REVEAL";
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      const before = ladderRef.current;
      const at = Date.now();
      const r = step(before, { type: "tick", at });
      if (r.effect !== "none") apply(r, before, at);
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, apply]);

  // The rungs on screen: the hints taken, then the answer once revealed —
  // it stays visible while the learner retypes / re-says it.
  const shown = useMemo<Rung[]>(
    () => [
      ...hints.slice(0, ladder.hintsTaken),
      ...(ladder.revealed ? [{ text: `✅ ${reveal}`, level: "answer" as const }] : []),
    ],
    [hints, ladder.hintsTaken, ladder.revealed, reveal],
  );
  const eliminated = useMemo(
    () => shown.flatMap((r) => r.eliminate ?? []),
    [shown],
  );
  const help: DrillHelp | null = enabled
    ? {
        hintsTaken: ladder.hintsTaken,
        hintsAvail: ladder.hintLevels.length,
        revealed: ladder.revealed,
        label: helpLabel(ladder),
        disabled: !canHelp(ladder),
        onClimb: () => { climb(); },
        shown,
      }
    : null;

  return {
    ladder, help, shown, eliminated,
    revealed: ladder.revealed,
    evidence: evidenceOf(ladder),
    attempt, climb, skip,
  };
}
