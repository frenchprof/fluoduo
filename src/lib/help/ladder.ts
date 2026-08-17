/**
 * The help ladder — ONE state machine, shared by every drill in DrillShell
 * (Track D, docs/TRACK_D_HELP_LADDER.md).
 *
 *   FRESH ──wrong──▶ TRY ──wrong×N / idle / ?──▶ HINT_1 ──▶ HINT_2 ──▶ REVEAL
 *     │               │                            │           │          │
 *     └── correct ────┴──────── correct ───────────┴───────────┘          │
 *                                   ▼                                     ▼
 *                                 DONE ◀──── correct / wrong / skip ── RETRY_AFTER_REVEAL
 *
 * Three rules the machine enforces so no drill can break them again:
 *   · REVEAL is never reached automatically before one real attempt, and
 *     never by idling — only by wrong tries (or the learner's own tap, once
 *     an attempt is in; flashcard test is the one context that may open it
 *     cold, because "reveal then check" is how flashcards work).
 *   · Escalation is learner-initiated (the ? control) OR automatic on
 *     "stuck": `stuckWrong` wrong tries at the current rung, or
 *     `stuckIdleMs` idle at it (idle climbs hints only).
 *   · The evidence written for the answer states the highest rung ACTUALLY
 *     shown — `independent` is true only for a first-try, no-hint success
 *     (PRD §7: a revealed answer still counts as practised, never as
 *     independent mastery).
 *
 * Pure: no React, no clock (every event carries `at`), no `@/` runtime
 * import — verify28 runs it in node.
 */
import type { AssistanceLevel } from "@/lib/evidence";
import type { TaskKind } from "./hints";

export type { TaskKind } from "./hints";

export type LadderState =
  | "FRESH"               // item shown; no attempt, no help
  | "TRY"                 // ≥ 1 wrong attempt, no help yet
  | "HINT_1"              // first hint on screen
  | "HINT_2"              // second hint on screen
  | "REVEAL"              // the answer is on screen; the task cannot be retried
  | "RETRY_AFTER_REVEAL"  // the answer is on screen AND the input is open once more
  | "DONE";               // closed — a correct answer, or a miss the learner moved past

export type LadderConfig = {
  /** Wrong tries at the current rung before the ladder climbs by itself. */
  stuckWrong: number;
  /** Idle ms at the current rung before it climbs by itself — hints only,
   *  never REVEAL. 0 disables idle escalation. */
  stuckIdleMs: number;
  /** May the learner open a HINT before one real attempt? (MCQ: no — its
   *  first rung IS "not that one", meaningless before a pick.) */
  helpBeforeAttempt: boolean;
  /** May the learner open REVEAL before one real attempt? */
  revealBeforeAttempt: boolean;
  /** After REVEAL, is the input re-opened for one retry (retype / re-say)? */
  retryAfterReveal: boolean;
};

/** Thresholds per task context — the "stuck" definitions Dan is asked to
 *  confirm (STATUS.md, Track D). */
export const LADDER_CONFIG: Record<TaskKind, LadderConfig> = {
  mcq:       { stuckWrong: 1, stuckIdleMs: 0,      helpBeforeAttempt: false, revealBeforeAttempt: false, retryAfterReveal: false },
  cloze:     { stuckWrong: 1, stuckIdleMs: 20_000, helpBeforeAttempt: true,  revealBeforeAttempt: false, retryAfterReveal: true },
  typed:     { stuckWrong: 1, stuckIdleMs: 20_000, helpBeforeAttempt: true,  revealBeforeAttempt: false, retryAfterReveal: true },
  dictation: { stuckWrong: 1, stuckIdleMs: 30_000, helpBeforeAttempt: true,  revealBeforeAttempt: false, retryAfterReveal: true },
  say:       { stuckWrong: 2, stuckIdleMs: 30_000, helpBeforeAttempt: true,  revealBeforeAttempt: false, retryAfterReveal: true },
  ordering:  { stuckWrong: 1, stuckIdleMs: 20_000, helpBeforeAttempt: true,  revealBeforeAttempt: false, retryAfterReveal: true },
  flashcard: { stuckWrong: 1, stuckIdleMs: 0,      helpBeforeAttempt: true,  revealBeforeAttempt: true,  retryAfterReveal: false },
  open:      { stuckWrong: 2, stuckIdleMs: 0,      helpBeforeAttempt: true,  revealBeforeAttempt: false, retryAfterReveal: true },
};

export type Ladder = {
  kind: TaskKind;
  state: LadderState;
  /** Assistance level of each hint rung available (from hints.ts). Length 0–2. */
  hintLevels: AssistanceLevel[];
  hintsTaken: number;
  /** Wrong attempts, in total and since the last climb. */
  wrongTries: number;
  triesAtRung: number;
  revealed: boolean;
  /** How many climbs happened WITHOUT the learner asking (stuck). */
  autoClimbs: number;
  startedAt: number;
  lastActionAt: number;
};

export type LadderEvent =
  | { type: "attempt"; correct: boolean; at: number }
  | { type: "help"; at: number }   // the learner tapped ?
  | { type: "tick"; at: number }   // idle check (from a timer)
  | { type: "skip"; at: number };  // moved on without a further attempt

export type Effect = "none" | "hint" | "reveal" | "done";

export type StepResult = { ladder: Ladder; effect: Effect; auto: boolean };

export function createLadder(kind: TaskKind, hintLevels: AssistanceLevel[], at: number): Ladder {
  return {
    kind, state: "FRESH", hintLevels: hintLevels.slice(0, 2),
    hintsTaken: 0, wrongTries: 0, triesAtRung: 0, revealed: false, autoClimbs: 0,
    startedAt: at, lastActionAt: at,
  };
}

export function configFor(kind: TaskKind): LadderConfig {
  return LADDER_CONFIG[kind];
}

/** What the next climb would open: a hint, the answer, or nothing more. */
export function nextRung(l: Ladder): "hint" | "reveal" | null {
  if (l.state === "REVEAL" || l.state === "RETRY_AFTER_REVEAL" || l.state === "DONE") return null;
  return l.hintsTaken < l.hintLevels.length ? "hint" : "reveal";
}

/** May the learner climb right now? (REVEAL needs one attempt in first.) */
export function canHelp(l: Ladder): boolean {
  const n = nextRung(l);
  if (!n) return false;
  const cfg = configFor(l.kind);
  if (n === "reveal") return l.wrongTries >= 1 || cfg.revealBeforeAttempt;
  return l.wrongTries >= 1 || cfg.helpBeforeAttempt;
}

/** Label for the ? control — English chrome. */
export function helpLabel(l: Ladder): string | null {
  const n = nextRung(l);
  if (!n) return null;
  if (n === "reveal") return "Show answer";
  return l.hintsTaken === 0 ? "Hint" : "Another hint";
}

function climb(l: Ladder, at: number, auto: boolean): StepResult {
  const n = nextRung(l);
  if (!n) return { ladder: l, effect: "none", auto };
  const base = { ...l, triesAtRung: 0, lastActionAt: at, autoClimbs: l.autoClimbs + (auto ? 1 : 0) };
  if (n === "hint") {
    const taken = l.hintsTaken + 1;
    return { ladder: { ...base, hintsTaken: taken, state: taken === 1 ? "HINT_1" : "HINT_2" }, effect: "hint", auto };
  }
  const retry = configFor(l.kind).retryAfterReveal;
  return { ladder: { ...base, revealed: true, state: retry ? "RETRY_AFTER_REVEAL" : "REVEAL" }, effect: "reveal", auto };
}

/** The transition function. Pure; returns the new ladder and what to show. */
export function step(l: Ladder, ev: LadderEvent): StepResult {
  if (l.state === "DONE") return { ladder: l, effect: "none", auto: false };
  const cfg = configFor(l.kind);
  switch (ev.type) {
    case "attempt": {
      if (ev.correct) return { ladder: { ...l, state: "DONE", lastActionAt: ev.at }, effect: "done", auto: false };
      const wrong = { ...l, wrongTries: l.wrongTries + 1, triesAtRung: l.triesAtRung + 1, lastActionAt: ev.at };
      // After the answer was shown, one attempt closes the item either way.
      if (l.state === "REVEAL" || l.state === "RETRY_AFTER_REVEAL") {
        return { ladder: { ...wrong, state: "DONE" }, effect: "done", auto: false };
      }
      const moved = wrong.state === "FRESH" ? { ...wrong, state: "TRY" as LadderState } : wrong;
      // Stuck by tries → climb without being asked. REVEAL is allowed here
      // because a wrong attempt IS the one real attempt the rule demands.
      if (moved.triesAtRung >= cfg.stuckWrong) return climb(moved, ev.at, true);
      return { ladder: moved, effect: "none", auto: false };
    }
    case "help": {
      if (!canHelp(l)) return { ladder: l, effect: "none", auto: false };
      return climb(l, ev.at, false);
    }
    case "tick": {
      // Idle escalation opens HINTS only, never the answer.
      if (cfg.stuckIdleMs <= 0) return { ladder: l, effect: "none", auto: false };
      if (nextRung(l) !== "hint") return { ladder: l, effect: "none", auto: false };
      if (ev.at - l.lastActionAt < cfg.stuckIdleMs) return { ladder: l, effect: "none", auto: false };
      return climb(l, ev.at, true);
    }
    case "skip":
      return { ladder: { ...l, state: "DONE", lastActionAt: ev.at }, effect: "done", auto: false };
  }
}

/** True while the machine would climb on the next tick or wrong try. */
export function isStuck(l: Ladder, at: number): boolean {
  const cfg = configFor(l.kind);
  if (l.state === "DONE" || l.state === "REVEAL" || l.state === "RETRY_AFTER_REVEAL") return false;
  if (cfg.stuckIdleMs > 0 && nextRung(l) === "hint" && at - l.lastActionAt >= cfg.stuckIdleMs) return true;
  return l.triesAtRung >= cfg.stuckWrong;
}

/** The evidence block fields for the answer given from this ladder. */
export type LadderEvidence = {
  assistance: AssistanceLevel;
  hintsTaken: number;
  revealed: boolean;
  independent: boolean;
};

const ORDER: AssistanceLevel[] = ["none", "nudge", "question", "scaffold", "partial", "answer"];

/**
 * The highest assistance ACTUALLY shown. `independent` is true only when
 * nothing was shown AND this is the first try — a second try after a bare
 * "wrong" is repaired, not independent, so it is tagged `nudge` (the miss
 * itself was the nudge).
 */
export function evidenceOf(l: Ladder): LadderEvidence {
  let assistance: AssistanceLevel = "none";
  if (l.revealed) assistance = "answer";
  else {
    for (const lv of l.hintLevels.slice(0, l.hintsTaken)) {
      if (ORDER.indexOf(lv) > ORDER.indexOf(assistance)) assistance = lv;
    }
    if (assistance === "none" && l.wrongTries > 0) assistance = "nudge";
  }
  return { assistance, hintsTaken: l.hintsTaken, revealed: l.revealed, independent: assistance === "none" };
}

/**
 * Spaced-retrieval hook (row 3): after `recordItemResult` has stepped the SRS
 * ladder, should the item ALSO be dropped to the due-now rung of the ReVue
 * queue? Yes whenever help was taken — a hinted or revealed success must
 * earn its interval again, independently, on a later day. A clean
 * independent success keeps the interval recordItemResult gave it; a miss
 * is already reset by recordItemResult.
 */
export function shouldQueueForReview(l: Ladder): boolean {
  return l.revealed || l.hintsTaken > 0;
}

/** The research-log event (docs/TRACK_D_HELP_LADDER.md §4) for one step. */
export type HelpRungEvent = {
  surface: string;
  itemId?: string;
  kind: TaskKind;
  from: LadderState;
  to: LadderState;
  effect: Effect;
  auto: boolean;
  hintsTaken: number;
  wrongTries: number;
  msSinceStart: number;
};

export function rungEvent(surface: string, itemId: string | undefined, before: Ladder, r: StepResult, at: number): HelpRungEvent {
  return {
    surface, itemId, kind: before.kind, from: before.state, to: r.ladder.state,
    effect: r.effect, auto: r.auto, hintsTaken: r.ladder.hintsTaken, wrongTries: r.ladder.wrongTries,
    msSinceStart: Math.max(0, at - before.startedAt),
  };
}
