/**
 * Usage-event logging. Client-side writes to a top-level `events` collection.
 * Doubles as GALAXIM engagement telemetry: who did what, when.
 *
 * Privacy: rules allow an authed user to CREATE their own events only; no client
 * read/update/delete. Cross-user analytics happen admin-side (console / export).
 * Fire-and-forget — never block UI or throw into the caller.
 *
 * Firestore is imported DYNAMICALLY: this module sits in the AuthGate graph of
 * every page (via auth), and a static import shipped the ~167 KB gz Firestore
 * bundle site-wide for a fire-and-forget telemetry call.
 */
import { auth } from "./client";

export type EventType =
  | "auth.signin"
  | "auth.signout"
  | "deck.open"
  | "deck.create"
  | "flashcard.review" // { itemId, rating }
  | "game.start" // { game, collectionId }
  | "game.end" // { game, collectionId, score }
  | "pretest.answer" // { pretestId, itemId, correct, picked }
  | "page.view" // { path }
  | "supplement.open" // { deck, key, label, href }
  | "supplement.answer" // { href, item, correct, mode } — written by the standalone supplement HTML
  | "tutor.message" // { chars, text ≤500 } — content recorded (Dan, 2026-07-13: close all gaps)
  // ── Autonomy-instrument events (Dan, 2026-07-21: sens/accueil/retrait
  // research — help-seeking calibration + input-seeking constructs; designed
  // pre-DERC so day-one data exists; research USE is consent-gated at export,
  // collection itself is ordinary course analytics) ─────────────────────────
  | "help.open" // { path } — a HelpDot "?" opened: solicited guidance
  | "hint.tap" // { surface, itemId?, sio? } — graduated help-seeking (💡)
  | "answer.reveal" // { surface, itemId?, sio?, rung, level } — the LAST rung of
  //   the help ladder, opened deliberately. Separate from hint.tap because a
  //   revealed answer differs in KIND, not degree (PRD §7): it still counts as
  //   encountered and practised, never as independent mastery. Counted
  //   together, a rising reveal rate could hide inside a falling hint rate —
  //   which is precisely the trend PRD §6 Goal 2 asks us to measure.
  | "tts.play" // { surface, kind: "word"|"sentence"|"free", source: "user"|"auto" } — input-seeking; only user-initiated plays are analytic signal
  | "review.self" // { surface } — learner opens their own mistakes/DéjàRevu
  // ── Track D (2026-08-17): the help ladder's research log ────────────────
  | "help.rung" // { surface, itemId?, kind, from, to, effect, auto, hintsTaken, wrongTries, msSinceStart } — ONE event per ladder transition (docs/TRACK_D_HELP_LADDER.md §4)
  | "feedback.request" // { surface, mode, source: "llm"|"rules", verdict, errors, ms } — open-production feedback (row 7)
  | "sync.error"; // { phase: "pull"|"push", message } — D4 diagnostic (2026-08-17): the progress doc could not be read/written; the teacher panel counts these

export async function logEvent(
  type: EventType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const u = auth.currentUser;
    const uid = u?.uid;
    if (!uid) return; // only log for signed-in users
    const [{ addDoc, collection, serverTimestamp }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("./db"),
    ]);
    await addDoc(collection(db, "events"), {
      uid,
      type,
      // Every event self-describes WHO (Dan, 2026-07-13: "who went into these
      // pages") — the teacher dashboard reads events alone, no uid→profile
      // join. Explicit payload keys win over the stamped identity.
      payload: { name: u?.displayName ?? null, email: u?.email ?? null, ...payload },
      ts: serverTimestamp(),
      ua: typeof navigator !== "undefined" ? navigator.userAgent : null,
      // Several sites share this Firebase project — record which one.
      site: typeof location !== "undefined" ? location.hostname : null,
    });
  } catch {
    // swallow — telemetry must never break the learner experience
  }
}
