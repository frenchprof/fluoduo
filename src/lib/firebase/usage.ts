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
  | "pretest.answer"; // { pretestId, itemId, correct, picked }

export async function logEvent(
  type: EventType,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return; // only log for signed-in users
    const [{ addDoc, collection, serverTimestamp }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("./db"),
    ]);
    await addDoc(collection(db, "events"), {
      uid,
      type,
      payload,
      ts: serverTimestamp(),
      ua: typeof navigator !== "undefined" ? navigator.userAgent : null,
      // Several sites share this Firebase project — record which one.
      site: typeof location !== "undefined" ? location.hostname : null,
    });
  } catch {
    // swallow — telemetry must never break the learner experience
  }
}
