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
import { levelForXp } from "@/lib/economy";
import { ALIAS_PUBLISH_UIDS } from "@/lib/accountAliases";

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
    // gems are a spendable balance; max favours the learner (a tiny refund on
    // the rare spend-then-merge is acceptable in beta). xp is monotonic.
    gems: Math.max(local.gems, remote.gems ?? 0),
    xp: Math.max(local.xp ?? 0, remote.xp ?? 0),
    streak: Math.max(local.streak, remote.streak ?? 0),
    lastActiveDay:
      [local.lastActiveDay, remote.lastActiveDay ?? null]
        .filter((d): d is string => !!d)
        .sort()
        .pop() ?? null,
    timeZone: local.timeZone ?? remote.timeZone,
    itemSrs,
    badges: [...new Set([...(remote.badges ?? []), ...(local.badges ?? [])])],
    cosmetics: {
      owned: [...new Set([...(remote.cosmetics?.owned ?? []), ...(local.cosmetics?.owned ?? [])])],
      // equipped: the device the learner is on wins, else whatever remote had.
      equipped: { ...(remote.cosmetics?.equipped ?? {}), ...(local.cosmetics?.equipped ?? {}) },
    },
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
  void publishLeaderboard(p);
}

/** Mirror the public bits to leaderboard/{uid} (ported surface from the old
 *  laf1201 suite — Dan, 2026-07-05). Separate try/catch: the rules DENY this
 *  write for admins/excluded emails, and that must never break the progress
 *  push. When the write is denied (this user is excluded), we DELETE any row
 *  they wrote before being excluded, so a teacher/opt-out never lingers on
 *  the board (the delete rule always allows the owner). */
async function publishLeaderboard(p: Progress): Promise<void> {
  const u = auth.currentUser;
  if (!u) return;
  let mods: typeof import("firebase/firestore") | undefined;
  let database: typeof import("./db") | undefined;
  try {
    [mods, database] = await Promise.all([import("firebase/firestore"), import("./db")]);
  } catch {
    return; // offline / bundle unavailable
  }
  const { doc, setDoc, deleteDoc } = mods;
  const ref = doc(database.db, "leaderboard", u.uid);
  // Aliased accounts publish under their canonical display name, keyed by
  // UID (2026-08-10; was email, Dan 2026-07-16) — the fold still survives a
  // Google rename, and no learner downloads another learner's address to
  // look up their own.
  const name =
    ALIAS_PUBLISH_UIDS[u.uid] ||
    u.displayName ||
    (u.email ? u.email.split("@")[0] : "Anonyme");
  try {
    // Rank by XP now (the lifetime score); keep gems for continuity and publish
    // the level so the board can show each learner's rank name.
    await setDoc(ref, { name, xp: p.xp, level: levelForXp(p.xp).level, gems: p.gems, streak: p.streak, updatedAt: Date.now() }, { merge: true });
  } catch {
    // Write denied → excluded (admin / opt-out). Remove any stale entry.
    try { await deleteDoc(ref); } catch {}
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
    let merged = mergeProgress(loadProgress(), snap.exists() ? (snap.data() as Partial<Progress>) : undefined);
    // One-time carry-over of prior-course XP (Dan, 2026-07-06). The old laf1201
    // suite shares this Firebase project + leaderboard collection; its rows hold
    // a lifetime `totalXP`. Seed it as an XP FLOOR so a returning student keeps
    // their standing. Idempotent — max() means later sign-ins don't re-add.
    try {
      const oldRow = await getDoc(doc(db, "leaderboard", uid));
      const oldXp = Number((oldRow.exists() ? oldRow.data() : {})?.totalXP ?? 0);
      if (Number.isFinite(oldXp) && oldXp > merged.xp) merged = { ...merged, xp: oldXp };
    } catch {
      /* no old row / read denied — nothing to carry over */
    }
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
