/**
 * The help ladder — ONE definition, shared by every surface that offers help.
 *
 * WHY SHARED: before this, Finale had a 4-rung Socratic clue ladder and
 * per-deck GramMarathon had nothing at all. A learner stuck on the same
 * grammar point got escalating scaffolds in the daily paper and a bare "wrong"
 * in the lesson drill. That asymmetry was backwards — Finale is the summative
 * surface, the lesson drill is where scaffolding belongs most — and it arose
 * exactly the way the gap-sentence bug did: two call sites, two answers, no
 * shared definition. This module is that definition.
 *
 * PRD §8: nudge → guiding question → scaffold → partial reveal → answer.
 * "The answer must ultimately be reachable." Finale's ladder deliberately
 * stopped short of that (Dan, 2026-07-21: "never reveal the answer"); Dan
 * revised it on 2026-08-09 — Finale is practice, so the fifth rung lands.
 *
 * The evidentiary consequence is the point, not a side effect. PRD §7: a
 * revealed answer still counts as encountered and practised, but not as
 * evidence of independent mastery, and it should schedule a later retrieval
 * so independent evidence can still be earned. `assistanceForLevel` is what
 * carries that into the evidence record.
 */
import type { AssistanceLevel } from "@/lib/evidence";

export type Rung = {
  /** What the learner sees. */
  text: string;
  /** Which PRD §8 rung this is — drives the evidence tag. */
  level: AssistanceLevel;
};

/**
 * Build the ladder for one item.
 *
 * `category` is Finale-only (its bank hand-authors a `cat` label per item);
 * per-deck items have no equivalent, so their ladder is one rung shorter and
 * opens at the lesson rung. That is a content difference, not a behavioural
 * one — both end at a reachable answer.
 */
export function buildLadder(opts: {
  answer: string;
  topic?: string;
  category?: string;
}): Rung[] {
  const a = opts.answer ?? "";
  const rungs: Rung[] = [];

  // Rung 1 — nudge: name the KIND of thing wanted, never the thing.
  if (opts.category) rungs.push({ text: `💡 ${opts.category}`, level: "nudge" });

  // Rung 2 — guiding question: point at where it was taught.
  if (opts.topic) rungs.push({ text: `📘 Leçon : ${opts.topic}`, level: "question" });

  // Rung 3 — scaffold: the first letter narrows the field without giving it.
  if (a) {
    rungs.push({
      text: `🔤 Une réponse possible commence par « ${a[0]?.toUpperCase() ?? ""} »`,
      level: "scaffold",
    });
  }

  // Rung 4 — partial reveal: shape and length, still requiring retrieval.
  if (a) {
    const skel = a[0] + " " + [...a.slice(1)].map(() => "_").join(" ");
    rungs.push({ text: `✏️ ${skel}  (${a.length} lettres)`, level: "partial" });
  }

  // Rung 5 — the answer. Reachable, per PRD §8, and evidentially marked.
  if (a) rungs.push({ text: `✅ ${a}`, level: "answer" });

  return rungs;
}

/** How many rungs before the answer — i.e. the last "safe" clue level. */
export function lastClueLevel(rungs: Rung[]): number {
  return Math.max(0, rungs.length - 1);
}

/** The rungs the learner has unlocked so far. */
export function shownRungs(rungs: Rung[], level: number): Rung[] {
  return rungs.slice(0, Math.max(0, Math.min(level, rungs.length)));
}

/** True once the answer rung has been opened. */
export function isRevealed(rungs: Rung[], level: number): boolean {
  return level >= rungs.length && rungs.length > 0;
}

/**
 * The assistance tag for an answer given at this clue level.
 *
 * Note it reports the help ACTUALLY TAKEN before answering, not the help
 * available. A learner who solved it cold reads "none" even on a surface that
 * offers five rungs — which is the distinction the mastery model needs.
 */
export function assistanceForLevel(rungs: Rung[], level: number): AssistanceLevel {
  if (level <= 0) return "none";
  const idx = Math.min(level, rungs.length) - 1;
  return rungs[idx]?.level ?? "none";
}
