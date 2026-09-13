/**
 * Cross-device progress sync (audit R2 — "the sign-in paradox": practice was
 * auth-gated while all progress stayed on one device). One Firestore doc per
 * user — users/{uid}/app/progress — holding the whole Progress blob:
 *   sign-in → pull remote, MERGE with local, save locally, push merged
 *   every local save after that → debounced push (2.5 s)
 * Merge favours the learner: union of done SIOs, max gems/streak, later
 * lastActiveDay (with ITS timeZone — D11), and per-item SRS keeps whichever
 * entry is scheduled further out (the more-learned state). See progressMerge.ts.
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
import { mergeProgress } from "@/lib/progressMerge";
import { boardName, isHiddenRosterName } from "@/lib/accountAliases";
import { CURRENT_TERM, LEGACY_TERM } from "@/lib/term";
import { isOffBoardAccount } from "@/lib/staffAccounts";
import { logEvent } from "./usage";

const DOC_PATH = ["app", "progress"] as const;
const PUSH_DEBOUNCE_MS = 2500;

// ── D4 diagnostic (2026-08-17) ──────────────────────────────────────────────
// Two learners' progress docs stopped syncing and nothing in the app could
// say why: push() swallowed every error and the doc had no "last good sync"
// stamp of its own (updatedAt is set by the same write that fails). Now:
//   · every successful push stamps `lastSyncedAt` on the doc, plus the LAST
//     failure this device saw (`lastSyncError`, `lastSyncErrorAt`,
//     `syncErrorCount`) — so a pipe that recovers still tells the story;
//   · every failure (pull or push) is remembered on the device AND sent as a
//     `sync.error` event (a separate collection, separate rules — a rules
//     denial on the progress doc still gets reported).
// The teacher student panel reads both: "Last sync" turns STALE when the
// learner's events run more than SYNC_STALE_MS past the doc, and shows the
// last error and the error count.
const SYNC_STATE_KEY = "fluolingo:syncState";
type SyncState = { lastError?: string; lastErrorAt?: number; errorCount?: number };
function readSyncState(): SyncState {
  try {
    return JSON.parse(window.localStorage.getItem(SYNC_STATE_KEY) ?? "{}") as SyncState;
  } catch {
    return {};
  }
}
function noteSyncError(phase: "pull" | "push", e: unknown): void {
  const message = (e instanceof Error ? `${e.name}: ${e.message}` : String(e)).slice(0, 200);
  try {
    const s = readSyncState();
    window.localStorage.setItem(
      SYNC_STATE_KEY,
      JSON.stringify({ lastError: `${phase}: ${message}`, lastErrorAt: Date.now(), errorCount: (s.errorCount ?? 0) + 1 }),
    );
  } catch {
    /* storage blocked — the event below still goes out */
  }
  void logEvent("sync.error", { phase, message });
}

// The merge itself is pure and lives in @/lib/progressMerge (verify27 runs
// it in node); re-exported so callers keep this import path.
export { mergeProgress };

let pushTimer: number | null = null;

async function push(p: Progress): Promise<void> {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const [{ doc, setDoc }, { db }] = await Promise.all([
      import("firebase/firestore"),
      import("./db"),
    ]);
    const s = readSyncState();
    const now = Date.now();
    await setDoc(doc(db, "users", uid, ...DOC_PATH), {
      ...p,
      updatedAt: now,
      lastSyncedAt: now,
      lastSyncError: s.lastError ?? null,
      lastSyncErrorAt: s.lastErrorAt ?? null,
      syncErrorCount: s.errorCount ?? 0,
    });
  } catch (e) {
    // offline / rules hiccup — local state is still authoritative on-device;
    // remembered + reported so the teacher can see a learner who never lands.
    noteSyncError("push", e);
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
  // look up their own. ONE identity function (boardName), shared with the
  // board's reader; never an email or its local part.
  const name = boardName(u.uid, u.displayName);
  // A STAFF SIGN-IN IS NOT A LEARNER (Dan, 2026-09-13: "i need to hide both
  // legacy roles and my own test accountrs ... like the one i tested with
  // today"). firestore.rules has denied these six addresses since 5 Jul, and
  // the fallback below has deleted the row when a write is denied — so on
  // paper this was already handled. It was not, and the reason is the gap
  // between the two halves: **the rules are not deployed by anything in this
  // repo** (no rules deploy path — docs/STATUS.md), so the file's allowlist
  // and the live project's can differ by however long it has been since
  // someone opened the Firebase console, and a test account the live rules do
  // not know about publishes a row exactly like a student's. The client half
  // ships with every build. So refuse here FIRST and let the same cleanup
  // remove the row — Dan's next sign-in on that account takes it off the
  // public board for everyone, with no console visit and no rules deploy.
  // TWO TESTS, because the board knows a name and the rules know an address.
  // The email catches the teacher's own six and his two alter-ego learners; the
  // NAME catches an account whose address we got wrong or never had — one of
  // the two arrived pasted with the name run into the address, so the name is
  // the half that is certain. Either one refuses, and the refusal deletes.
  let published = false;
  if (!isOffBoardAccount(u.email) && !isHiddenRosterName(name)) {
    try {
      // Rank by XP now (the lifetime score); keep gems for continuity and publish
      // the level so the board can show each learner's rank name. `term` scopes
      // the board to the current cohort (term.ts) — the create rule's allowlist
      // in firestore.rules MUST include it (deployed 2026-08-11).
      await setDoc(ref, { name, xp: p.xp, level: levelForXp(p.xp).level, gems: p.gems, streak: p.streak,
        // The weekly race (DOPAMINE_REVIEW §9). Published alongside the
        // lifetime figure, never instead of it — the board keeps both views,
        // and `weekKey` is what lets a reader tell a live total from a stale
        // one without trusting the writer's clock.
        weekXp: p.weekXp ?? 0, weekKey: p.weekKey ?? null,
        term: p.term ?? CURRENT_TERM, updatedAt: Date.now() }, { merge: true });
      published = true;
    } catch {
      /* denied (rules-side exclusion) or offline — cleaned up below */
    }
  }
  if (!published) {
    // Excluded (staff / opt-out) → remove any stale entry. The delete rule
    // always allows the owner, so this is the one door a teacher or an
    // opted-out learner has to take their own row off the board.
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
    // Cohort stamp (term.ts). A remote doc WITHOUT the field predates the
    // 2026-08-11 reset → legacy, whatever a fresh device's default says.
    if (snap.exists() && !(snap.data() as Partial<Progress>).term) {
      merged = { ...merged, term: LEGACY_TERM };
    }
    // One-time carry-over of prior-course XP (Dan, 2026-07-06). The old laf1201
    // suite shares this Firebase project + leaderboard collection; its rows hold
    // a lifetime `totalXP`. Seed it as an XP FLOOR so a returning student keeps
    // their standing. Idempotent — max() means later sign-ins don't re-add.
    try {
      const oldRow = await getDoc(doc(db, "leaderboard", uid));
      const oldXp = Number((oldRow.exists() ? oldRow.data() : {})?.totalXP ?? 0);
      if (Number.isFinite(oldXp) && oldXp > merged.xp) merged = { ...merged, xp: oldXp };
      // A board row with no progress doc is also a pre-reset account (synced
      // before progressSync existed) — legacy, not a freshman.
      if (!snap.exists() && oldRow.exists()) merged = { ...merged, term: LEGACY_TERM };
    } catch {
      /* no old row / read denied — nothing to carry over */
    }
    replaceProgress(merged);
    void push(merged);
  } catch (e) {
    // pull failed — keep local, still enable live pushes
    noteSyncError("pull", e);
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
