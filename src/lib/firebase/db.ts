/**
 * Firestore handle, SPLIT from client.ts on purpose: client.ts (app + auth) is
 * in the AuthGate graph of every page, and importing getFirestore there shipped
 * the whole ~184 KB gz Firestore bundle site-wide. Import db from HERE — only
 * the pages that actually read/write Firestore pay for it.
 */
import { initializeFirestore, getFirestore, type Firestore } from "firebase/firestore";
import { app } from "./client";

// ignoreUndefinedProperties: optional Collection fields (subtitle, tags, …)
// arrive as `undefined` from forms, and Firestore hard-rejects undefined
// anywhere in a document ("Unsupported field value: undefined" — Dan's
// add-deck bug, 2026-07-05). Dropping them at the SDK level fixes every
// write path at once. initializeFirestore throws if called after
// getFirestore somewhere else already made the default instance — fall back
// to that instance (settings then match the old behavior, but no import
// order in this codebase does that today).
let instance: Firestore;
try {
  instance = initializeFirestore(app, { ignoreUndefinedProperties: true });
} catch {
  instance = getFirestore(app);
}
export const db: Firestore = instance;
