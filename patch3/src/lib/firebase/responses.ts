/**
 * Item-level answer recording (Dan, 2026-07-13: "everything, every page,
 * every question, every attempt to be recorded"). One graded answer → one
 * document in users/{uid}/responses, the APPEND-ONLY, shape-checked evidence
 * store firestore.rules already defines (owner create, admin read) — the
 * teacher dashboard's Students drilldown reads it back.
 *
 * Fire-and-forget like usage.ts: never blocks the learner, never throws,
 * silently skips anonymous visitors. Firestore is imported dynamically so
 * this module adds zero Firestore bytes to any page's static graph.
 *
 * 2026-08-10 — TWO CHANGES, both requiring the rules deploy of the same date:
 *
 * 1. THE SILENT-LOSS BUG. The rules capped `xp <= 100`, but progress.ts pays
 *    60 x the streak multiplier and the x2 tier at streak >= 7 writes 120. So
 *    EVERY correct answer from a learner on a seven-day streak was denied at
 *    the rules layer — and the catch at the bottom of this file swallowed the
 *    permission error without a trace. Wrong answers (40) always passed, so an
 *    affected learner's evidence trail kept their mistakes and discarded their
 *    successes. Confirmed against live data: of 10,623 stored documents, not
 *    one had xp > 100, and the two learners on 7+ day streaks showed 67% and
 *    57% recorded accuracy against a cohort mean of 77%. The ceiling is now
 *    2000.
 *
 *    The catch stays — an evidence trail must never break a learner's session
 *    — but it is now a genuine last resort rather than a place bugs go to die.
 *
 * 2. THE EVIDENCE MODEL. A stored answer now carries what it MEANS, not just
 *    whether it was right: which outcome it bears on, what kind of performance
 *    it was, and how much help was taken. See src/lib/evidence.ts. Every field
 *    is optional in the rules, so callers adopt them one at a time and nothing
 *    that already writes here needs to change.
 */
import { auth } from "./client";
import type { EvidenceMeta } from "@/lib/evidence";

export function recordResponse(
  item: string,
  correct: boolean,
  opts: {
    given?: string;
    activity?: string;
    xpPaid?: number;
    /** PRD §7 evidence block — build it with buildEvidence(). */
    evidence?: EvidenceMeta;
    /** Milliseconds from question shown to answer submitted. Already permitted
     *  by the rules; a fluency signal the store has never actually carried. */
    latencyMs?: number;
  } = {},
): void {
  void (async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid || !item) return;
      const [{ addDoc, collection, serverTimestamp }, { db }] = await Promise.all([
        import("firebase/firestore"),
        import("./db"),
      ]);
      // Field caps mirror the rules' shape check — an oversize value would
      // silently drop the whole record otherwise.
      const body: Record<string, unknown> = {
        item: item.slice(0, 200),
        attempts: [correct],
        status: correct ? "met" : "missed",
        // HONEST receipt (audit 2026-07-19): the doc used to hardcode
        // XP_CORRECT/XP_WRONG even for activities that pay no per-answer XP
        // (VocabulaRain, deck-MCQ) — those phantom amounts are what raised
        // the false BELOW-FLOOR alarms. The receipt now states what was
        // ACTUALLY paid; callers that pay nothing simply omit xpPaid.
        xp: opts.xpPaid ?? 0,
        timestamp: serverTimestamp(),
        activityId: (
          opts.activity ?? (typeof location !== "undefined" ? location.pathname : "unknown")
        ).slice(0, 60),
      };
      if (opts.given) body.givenAnswer = opts.given.slice(0, 200);
      if (typeof opts.latencyMs === "number" && Number.isFinite(opts.latencyMs)) {
        body.latencyMs = Math.max(0, Math.min(3_600_000, Math.round(opts.latencyMs)));
      }

      // ── evidence block ──────────────────────────────────────────────────
      // Written only where known. An absent field means "not recorded", which
      // the mastery model must treat as uncertainty — never as a zero (PRD §7:
      // missing evidence is uncertainty, not failure).
      const ev = opts.evidence;
      if (ev) {
        if (ev.outcomeId) body.outcomeId = ev.outcomeId.slice(0, 40);
        if (ev.evidenceType) body.evidenceType = ev.evidenceType;
        if (ev.assistance) body.assistance = ev.assistance;
        if (typeof ev.assistCount === "number") {
          body.assistCount = Math.max(0, Math.min(20, Math.round(ev.assistCount)));
        }
        if (typeof ev.independent === "boolean") body.independent = ev.independent;
      }

      await addDoc(collection(db, "users", uid, "responses"), body);
    } catch {
      // evidence trail must never break the learner experience
    }
  })();
}
