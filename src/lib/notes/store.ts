/**
 * Learner notes — LOCAL-FIRST dual storage.
 *
 * Every edit writes to localStorage instantly. Firebase is the synced backup,
 * pushed/pulled at most ONCE PER DAY and only when there are local changes
 * (dirty flag). Merge is last-write-wins by per-note `updatedAt`. A manual
 * `syncNow()` bypasses the daily gate.
 *
 * Firestore path: users/{uid}/notes/{deckId}  →  { notes: { itemId: {text,updatedAt} } }
 * (covered by the existing owner-only rule; no rules change needed).
 *
 * Cap: 50 GRAPHEMES per note (Intl.Segmenter, not string.length — which
 * over-counts emoji/astral chars; CJK basic-plane is fine but graphemes are
 * consistent across all scripts).
 */
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase/client";
import { db } from "@/lib/firebase/db";

export type Note = { text: string; updatedAt: number };
export type DeckNotes = Record<string, Note>; // itemId -> Note

export const NOTE_MAX = 50;
const DAY = 86_400_000;

const lsKey = (deckId: string) => `fln-notes:${deckId}`;
const metaKey = (deckId: string) => `fln-notes-meta:${deckId}`;

type Meta = { dirty: boolean; lastSync: number };

function readMeta(deckId: string): Meta {
  try {
    return JSON.parse(localStorage.getItem(metaKey(deckId)) || "");
  } catch {
    return { dirty: false, lastSync: 0 };
  }
}
function writeMeta(deckId: string, m: Meta) {
  localStorage.setItem(metaKey(deckId), JSON.stringify(m));
}

export function loadLocal(deckId: string): DeckNotes {
  try {
    return JSON.parse(localStorage.getItem(lsKey(deckId)) || "{}");
  } catch {
    return {};
  }
}
function saveLocal(deckId: string, notes: DeckNotes) {
  localStorage.setItem(lsKey(deckId), JSON.stringify(notes));
}

/** Count user-perceived characters (grapheme clusters). */
export function graphemeCount(s: string): number {
  try {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    let n = 0;
    for (const _ of seg.segment(s)) n++;
    return n;
  } catch {
    return [...s].length; // code points (handles surrogate pairs)
  }
}

/** Trim to NOTE_MAX graphemes. */
export function clampNote(s: string): string {
  try {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const parts = Array.from(seg.segment(s), (x) => x.segment);
    return parts.slice(0, NOTE_MAX).join("");
  } catch {
    return [...s].slice(0, NOTE_MAX).join("");
  }
}

/** Write a note locally (instant) and mark the deck dirty for the next sync. */
export function setNote(deckId: string, itemId: string, text: string): DeckNotes {
  const notes = loadLocal(deckId);
  const t = clampNote(text);
  if (t) notes[itemId] = { text: t, updatedAt: Date.now() };
  else delete notes[itemId];
  saveLocal(deckId, notes);
  writeMeta(deckId, { ...readMeta(deckId), dirty: true });
  return notes;
}

function fsRef(uid: string, deckId: string) {
  return doc(db, "users", uid, "notes", deckId);
}

async function pullMergePush(deckId: string, uid: string): Promise<DeckNotes> {
  const local = loadLocal(deckId);
  let remote: DeckNotes = {};
  try {
    const snap = await getDoc(fsRef(uid, deckId));
    if (snap.exists()) remote = (snap.data().notes ?? {}) as DeckNotes;
  } catch {
    /* offline / denied — keep local */
  }
  // merge: last-write-wins by updatedAt
  const merged: DeckNotes = { ...remote };
  for (const [id, n] of Object.entries(local)) {
    if (!merged[id] || n.updatedAt > merged[id].updatedAt) merged[id] = n;
  }
  saveLocal(deckId, merged);
  if (readMeta(deckId).dirty) {
    try {
      await setDoc(
        fsRef(uid, deckId),
        { notes: merged, updatedAt: Date.now() },
        { merge: true },
      );
    } catch {
      /* push failed — stay dirty, retry next time */
      return merged;
    }
  }
  writeMeta(deckId, { dirty: false, lastSync: Date.now() });
  return merged;
}

/** Sync only if signed in AND (dirty OR ≥24h since last sync). Local-first otherwise. */
export async function syncIfDue(deckId: string): Promise<DeckNotes> {
  const uid = auth.currentUser?.uid;
  if (!uid) return loadLocal(deckId);
  const m = readMeta(deckId);
  if (!m.dirty && Date.now() - m.lastSync < DAY) return loadLocal(deckId);
  return pullMergePush(deckId, uid);
}

/** Push now — bypasses the daily gate. Used by the background auto-sync after
 *  edits settle (and previously by the manual button, now removed). */
export async function syncNow(deckId: string): Promise<DeckNotes> {
  const uid = auth.currentUser?.uid;
  if (!uid) return loadLocal(deckId);
  return pullMergePush(deckId, uid);
}

/** True when this deck has note edits not yet pushed to the cloud — drives the
 *  background auto-sync (Dan, 2026-07-05: syncing should just happen). */
export function hasDirtyNotes(deckId: string): boolean {
  return readMeta(deckId).dirty;
}
