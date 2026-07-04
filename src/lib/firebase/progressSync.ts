/**
 * Cross-device progress sync (audit R2 — "the sign-in paradox": practice was
 * auth-gated while all progress stayed on one device). One Firestore doc per
 * user — users/{uid}/app/progress — holding the whole Progress blob:
 *   sign-in → pull remote, MERGE with local, save locally, push merged
 *   every local save after that → debounced push (2.5 s)
 * Merge favours the learner: union of done SIOs, max gems/streak, later
 * lastActiveDay, and per-item SRS keeps whichever entry is scheduled further
 * out (the more-learned state).
 * Firestore is imported DYNAMICALLY — this module must add zero bytes of
 * Firestore to any page's static graph (same rule as usage.ts).
 */
import { auth } from "./client";
import {
  loadProgress,
  replaceProgress,
  setOnProgressSave,
  type Progress,
} from "@/lib/progress";

const DOC_PATH = ["app", "progress"] as const;
const PUSH_DEBOUNCE_MS = 2500;

export function mergeProgress(local: Progress, remote: Partial<Progress> | undefined): Progress {
  if (!remote) return local;
  const itemSrs = { ...(remote.itemSrs ?? {}) };
  for (const [id, s] of Object.entries(local.itemSrs)) {
    const r = itemSrs[id];
    itemSrs[id] = !r || s.due >= r.due ? s : r;
  }
  return {
    doneSios: [...new Set([...(remote.doneSios ?? []), ...local.doneSios])],
    gems: Math.max(local.gems, remote.gems ?? 0),
    streak: Math.max(local.streak, remote.streak ?? 0),
    lastActiveDay:
      [local.lastActiveDay, remote.lastActiveDay ?? null]
        .filter((d): d is string => !!d)
        .sort()
        .pop() ?? null,
    itemSrs,
  };
}

let pushTimer: number | null = null;

async function push(p: Progress): Promise<void> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const [{ doc, setDoc }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("./db"),
    ]);
    await setDoc(doc(db, "users", uid, ...DOC_PATH), { ...p, updatedAt: Date.now() });
  } catch {
    // offline / rules hiccup — local state is still authoritative on-device
  }
}

function schedulePush(p: Progress): void {
  if (typeof window === "undefined") return;
  if (pushTimer !== null) window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => {
    pushTimer = null;
    void push(p);
  }, PUSH_DEBOUNCE_MS);
}

/** Call once per sign-in: pull-merge-push, then live-push every local save. */
export async function startProgressSync(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    const [{ doc, getDoc }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("./db"),
    ]);
    const snap = await getDoc(doc(db, "users", uid, ...DOC_PATH));
    const merged = mergeProgress(loadProgress(), snap.exists() ? (snap.data() as Partial<Progress>) : undefined);
    replaceProgress(merged);
    void push(merged);
  } catch {
    // pull failed — keep local, still enable live pushes
  }
  setOnProgressSave(schedulePush);
}

export function stopProgressSync(): void {
  setOnProgressSave(null);
  if (typeof window !== "undefined" && pushTimer !== null) {
    window.clearTimeout(pushTimer);
    pushTimer = null;
  }
}
