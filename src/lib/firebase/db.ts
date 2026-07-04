/**
 * Firestore handle, SPLIT from client.ts on purpose: client.ts (app + auth) is
 * in the AuthGate graph of every page, and importing getFirestore there shipped
 * the whole ~184 KB gz Firestore bundle site-wide. Import db from HERE — only
 * the pages that actually read/write Firestore pay for it.
 */
import { getFirestore, type Firestore } from "firebase/firestore";
import { app } from "./client";

export const db: Firestore = getFirestore(app);
