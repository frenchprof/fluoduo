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
 */
import { auth } from "./client";

export function recordResponse(
  item: string,
  correct: boolean,
  opts: { given?: string; activity?: string; xpPaid?: number } = {},
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
      await addDoc(collection(db, "users", uid, "responses"), body);
    } catch {
      // evidence trail must never break the learner experience
    }
  })();
}
