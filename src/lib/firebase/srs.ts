/**
 * Spaced-repetition state, synced per user.  Firestore: users/{uid}/srs/{itemId}
 * A light SM-2-style scheduler. Synced (not local-only) since students have accounts,
 * so progress follows them across devices.
 */
import { doc, getDocs, setDoc, collection as fsCollection } from "firebase/firestore";
import { db, auth } from "./client";

export type SrsRating = "again" | "hard" | "good" | "easy";

export type SrsState = {
  itemId: string;
  ease: number; // SM-2 ease factor, starts 2.5
  intervalDays: number; // current interval
  due: number; // epoch ms when next due
  reps: number;
  lapses: number;
  updatedAt: number;
};

export function freshSrs(itemId: string): SrsState {
  return { itemId, ease: 2.5, intervalDays: 0, due: Date.now(), reps: 0, lapses: 0, updatedAt: Date.now() };
}

/** Pure scheduler step — apply a rating to a state and return the next state. */
export function schedule(s: SrsState, rating: SrsRating): SrsState {
  const DAY = 86_400_000;
  let { ease, intervalDays, reps, lapses } = s;
  if (rating === "again") {
    lapses += 1;
    reps = 0;
    intervalDays = 0; // relearn today
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    const bump = rating === "hard" ? -0.15 : rating === "easy" ? 0.15 : 0;
    ease = Math.max(1.3, ease + bump);
    if (reps === 1) intervalDays = rating === "easy" ? 2 : 1;
    else if (reps === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * ease * (rating === "hard" ? 0.8 : 1));
  }
  return { ...s, ease, intervalDays, reps, lapses, due: Date.now() + intervalDays * DAY, updatedAt: Date.now() };
}

export async function loadSrs(): Promise<Record<string, SrsState>> {
  const uid = auth.currentUser?.uid;
  if (!uid) return {};
  const snap = await getDocs(fsCollection(db, "users", uid, "srs"));
  const out: Record<string, SrsState> = {};
  snap.forEach((d) => (out[d.id] = d.data() as SrsState));
  return out;
}

export async function saveSrs(state: SrsState): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await setDoc(doc(db, "users", uid, "srs", state.itemId), state, { merge: true });
}
