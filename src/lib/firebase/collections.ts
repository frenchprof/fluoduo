/**
 * Firestore data-access for USER-created collections.
 * Curated decks are bundled (see content/collections/index.ts) and never hit Firestore.
 *
 * Firestore layout:
 *   collections/{collectionId}   — user decks; owner == uid
 *   users/{uid}/srs/{itemId}     — spaced-repetition state (see srs.ts)
 *   events/{eventId}             — usage log (see usage.ts)
 */
import {
  collection as fsCollection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "./client";
import { db } from "./db";
import type { Collection } from "@/lib/collections/schema";

const COL = "collections";

/** All decks owned by the current user. */
export async function getMyCollections(): Promise<Collection[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const snap = await getDocs(query(fsCollection(db, COL), where("owner", "==", uid)));
  return snap.docs.map((d) => ({ ...(d.data() as Collection), id: d.id }));
}

/** Public/unlisted decks from other users (for a shared library, if enabled). */
export async function getPublicCollections(): Promise<Collection[]> {
  const snap = await getDocs(
    query(fsCollection(db, COL), where("visibility", "==", "public")),
  );
  return snap.docs.map((d) => ({ ...(d.data() as Collection), id: d.id }));
}

export async function getCollection(id: string): Promise<Collection | null> {
  const d = await getDoc(doc(db, COL, id));
  return d.exists() ? ({ ...(d.data() as Collection), id: d.id }) : null;
}

/** Create a new user deck. Returns the generated id. owner is forced to the signed-in uid. */
export async function createCollection(
  data: Omit<Collection, "id" | "owner">,
): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in to create a collection.");
  const ref = await addDoc(fsCollection(db, COL), {
    ...data,
    owner: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Overwrite an existing user deck (owner check is also enforced by security rules). */
export async function saveCollection(c: Collection): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in.");
  await setDoc(
    doc(db, COL, c.id),
    { ...c, owner: uid, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function deleteCollection(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
