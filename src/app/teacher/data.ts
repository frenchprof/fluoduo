/**
 * Data layer for the teacher analytics dashboard. Everything here reads
 * Firestore collections the rules already grant admins: `events` (usage
 * telemetry), `leaderboard` (public progress mirror), `feedback` (bug
 * reports), and per-student docs under users/{uid} (progress blob,
 * responses). No collection-group queries — those would need a
 * rules redeploy — so class-wide aggregates come from `events`, and the
 * deeper per-student stores are fetched one student at a time on drilldown.
 * Firestore is imported dynamically (usage.ts pattern): the bundle never
 * ships to learners.
 */

import { EXCLUDED_BOARD_UIDS, HIDDEN_ROSTER_UID_PREFIXES, isHiddenRosterName } from "@/lib/accountAliases";

/**
 * Screenshot/check fixture (patch 26). The teacher page cannot render without
 * live Firestore and an admin sign-in, so a build with
 * NEXT_PUBLIC_TEACHER_FIXTURE=1 swaps every fetch below for fixture.ts's
 * synthetic sixteen. The constant is inlined at build time: in a normal
 * build it is `false`, the branches are dead and fixture.ts is never
 * bundled. Never set it for a deploy.
 */
export const FIXTURE = process.env.NEXT_PUBLIC_TEACHER_FIXTURE === "1";
import { TERM_START_MS, isCurrentTerm } from "@/lib/term";

/**
 * Student-identifying roster maps — fetched at runtime, NEVER bundled.
 *
 * These used to be compiled in (src/lib/rosterPrivate.ts, deleted 2026-08-10).
 * /teacher is a statically exported page on a public CDN with no auth in
 * front of it, so its chunk — student emails included — was downloadable by
 * anyone with the URL. The maps now live in Firestore at admin/rosterPrivate
 * behind the same isAdmin() rules as everything else this page reads.
 * Canonical copy + provenance: scripts/roster-private.json; push it with
 * scripts/seed-roster-private.mjs. verify/verify18b.py proves the build
 * output stays clean.
 */
export type RosterMeta = {
  /** alias email → canonical email (all lowercase). */
  aliasEmails: Record<string, string>;
  /** uid → display name, where the telemetry's own name is wrong or absent. */
  rosterNames: Record<string, string>;
  /** uid → email for accounts whose only sign-ins predate authEvents coverage. */
  knownEmails: Record<string, string>;
};

export const EMPTY_ROSTER_META: RosterMeta = { aliasEmails: {}, rosterNames: {}, knownEmails: {} };

/** null = the doc does not exist yet (seed script never ran). Throws on
 *  permission-denied and network failures like every other fetch here. */
export async function fetchRosterMeta(): Promise<RosterMeta | null> {
  if (FIXTURE) return (await import("./fixture")).fixtureRosterMeta();
  const [{ getDoc, doc }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/db"),
  ]);
  const snap = await getDoc(doc(db, "admin", "rosterPrivate"));
  if (!snap.exists()) return null;
  const d = snap.data() as Record<string, unknown>;
  const rec = (v: unknown): Record<string, string> => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return {};
    const out: Record<string, string> = {};
    for (const [k, val] of Object.entries(v)) if (typeof val === "string") out[k] = val;
    return out;
  };
  return { aliasEmails: rec(d.aliasEmails), rosterNames: rec(d.rosterNames), knownEmails: rec(d.knownEmails) };
}

export function canonicalEmail(aliasEmails: Record<string, string>, email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.toLowerCase();
  return aliasEmails[e] ?? e;
}

// Mirror of firestore.rules isAdmin() — keep the two lists in sync.
// Read-only tier (Dan, 2026-07-20): peer reviewers see the whole teacher
// page but get no write actions (no feedback triage). Same UX-gate caveat
// as ADMIN_EMAILS — this is presentation, not security.
export const REVIEWER_EMAILS = [
  "wanghaoshu2016@gmail.com",
];

export const ADMIN_EMAILS = [
  "drneilchan@gmail.com",
  "monsieur.chan@gmail.com",
  "dan@chank.wang",
  "kaygeedan@gmail.com",
  "daniel.chan@nus.edu.sg",
  "kwangguan@gmail.com",
];

export type Ev = {
  uid: string;
  type: string;
  ts: Date | null;
  payload: Record<string, unknown>;
};

export type BoardRow = {
  name: string;
  xp: number;
  level: number;
  gems: number;
  streak: number;
  /** Cohort marker (src/lib/term.ts); absent on rows that predate the
   *  2026-08-11 reset. */
  term?: string;
};

export type Learner = {
  uid: string;
  /** All uids belonging to this person — >1 when accounts are aliased
   *  (accountAliases.ts). Drilldowns and event filters must use this. */
  uids: string[];
  /** Excluded from the teacher page entirely (accountAliases hidden lists). */
  hidden?: boolean;
  /** Belongs to the current cohort (term.ts): board row carries CURRENT_TERM,
   *  or the account was first seen after the reset. The teacher page shows
   *  only these by default — prior cohorts stay behind the "all cohorts"
   *  toggle, and nothing is deleted. */
  currentTerm?: boolean;
  name: string;
  email: string | null;
  isTeacher: boolean;
  firstSeen: Date | null;
  lastSeen: Date | null;
  daysActive: number;
  pageViews: number;
  gamePlays: number;
  pretestAnswers: number;
  board: BoardRow | null;
};

export type StudentDetail = {
  /** users/{uid}/app/progress — null if the student never synced. */
  progress: {
    xp?: number;
    gems?: number;
    streak?: number;
    lastActiveDay?: string | null;
    doneSios?: string[];
    badges?: string[];
    itemSrs?: Record<string, { due?: number; intervalDays?: number }>;
    updatedAt?: number;
    /** D4 diagnostic (progressSync, 2026-08-17). */
    lastSyncedAt?: number;
    lastSyncError?: string | null;
    lastSyncErrorAt?: number | null;
    syncErrorCount?: number;
  } | null;
  // `sessions` and `attemptsCount` LEFT this shape on 2026-08-17 (D6 / D7):
  // users/{uid}/sessions had two readers and no writer since the old suite
  // (every activityId null), users/{uid}/attempts had a reader and never a
  // writer. Time on task is the page-view dwell estimate; the answer count
  // is `responses.length`.
  responses: {
    item: string;
    status: string;
    xp: number;
    latencyMs: number | null;
    givenAnswer: string | null;
    activityId: string | null;
    ts: Date | null;
    /** Evidence block (responses.ts, 2026-08-10) — read since 2026-08-17. */
    outcomeId: string | null;
    evidenceType: string | null;
    assistance: string | null;
    independent: boolean | null;
  }[];
};

export const SG_DAY_KEY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit",
});
export const SG_DAY_LABEL = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore", weekday: "long", day: "numeric", month: "long", year: "numeric",
});
const SG_WHEN = new Intl.DateTimeFormat("en-SG", {
  timeZone: "Asia/Singapore", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
});

export function fmtWhen(d: Date | null): string {
  return d ? SG_WHEN.format(d) : "—";
}

export function fmtDuration(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} h ${mins % 60} min`;
}

export function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
export function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * The dashboard reads the WHOLE event history on every open, and page views are
 * the most numerous thing in it. Unbounded, that gets slower and pricier each
 * week and eventually just fails to load — which reads as "nothing is being
 * recorded". A newest-first cap keeps the page finite; `truncated` lets the UI
 * admit when it is showing a window rather than everything.
 */
export const EVENT_FETCH_CAP = 50_000;

export async function fetchAllEvents(): Promise<Ev[]> {
  if (FIXTURE) return (await import("./fixture")).fixtureEvents();
  const [{ getDocs, collection, limit, orderBy, query }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/db"),
  ]);
  const events = collection(db, "events");
  // The ordered read is an optimisation, not a requirement: an ordering also
  // DROPS documents that lack `ts` and needs its index to exist, so a failure
  // here must not cost the whole dashboard. Fall back to the plain collection
  // read that this replaced.
  let snap;
  try {
    snap = await getDocs(query(events, orderBy("ts", "desc"), limit(EVENT_FETCH_CAP)));
  } catch {
    snap = await getDocs(events);
  }
  const out: Ev[] = [];
  snap.forEach((doc) => {
    const d = doc.data() as {
      uid?: unknown; type?: unknown;
      ts?: { toDate?: () => Date };
      payload?: Record<string, unknown>;
    };
    if (typeof d.uid !== "string" || typeof d.type !== "string") return;
    out.push({
      uid: d.uid,
      type: d.type,
      ts: d.ts?.toDate?.() ?? null,
      payload: d.payload ?? {},
    });
  });
  out.sort((a, b) => (a.ts?.getTime() ?? 0) - (b.ts?.getTime() ?? 0));
  return out;
}

export async function fetchLeaderboard(): Promise<Map<string, BoardRow>> {
  if (FIXTURE) return (await import("./fixture")).fixtureBoard();
  const [{ getDocs, collection }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/db"),
  ]);
  const snap = await getDocs(collection(db, "leaderboard"));
  const out = new Map<string, BoardRow>();
  snap.forEach((doc) => {
    const d = doc.data() as Record<string, unknown>;
    out.set(doc.id, {
      name: str(d.name) ?? doc.id.slice(0, 8),
      xp: num(d.xp) ?? 0,
      level: num(d.level) ?? 1,
      gems: num(d.gems) ?? 0,
      streak: num(d.streak) ?? 0,
      term: str(d.term) ?? undefined,
    });
  });
  return out;
}

/** Roster derived from events (every active account signs in → events exist)
 *  unioned with leaderboard rows, so pre-tracking students still appear.
 *  `meta` comes from fetchRosterMeta(); pass EMPTY_ROSTER_META when it is
 *  unavailable — the roster still builds, just without alias merging and
 *  name/email overrides. */
export function buildRoster(events: Ev[], board: Map<string, BoardRow>, meta: RosterMeta): Learner[] {
  const byUid = new Map<string, Learner>();
  const days = new Map<string, Set<string>>();
  const ensure = (uid: string): Learner => {
    let l = byUid.get(uid);
    if (!l) {
      byUid.set(uid, (l = {
        uid, uids: [uid], name: meta.rosterNames[uid] ?? uid.slice(0, 8), email: canonicalEmail(meta.aliasEmails, meta.knownEmails[uid]) ?? null, isTeacher: false,
        firstSeen: null, lastSeen: null, daysActive: 0,
        pageViews: 0, gamePlays: 0, pretestAnswers: 0,
        board: board.get(uid) ?? null,
      }));
      days.set(uid, new Set());
    }
    return l;
  };
  for (const ev of events) {
    const l = ensure(ev.uid);
    const name = str(ev.payload.name);
    const email = str(ev.payload.email);
    // A known uid keeps the name we were told, whatever the event claims.
    if (name && !meta.rosterNames[ev.uid]) l.name = name;
    if (email) {
      l.email = email;
      if (ADMIN_EMAILS.includes(email)) l.isTeacher = true;
    }
    if (ev.ts) {
      if (!l.firstSeen || ev.ts < l.firstSeen) l.firstSeen = ev.ts;
      if (!l.lastSeen || ev.ts > l.lastSeen) l.lastSeen = ev.ts;
      days.get(ev.uid)?.add(SG_DAY_KEY.format(ev.ts));
    }
    if (ev.type === "page.view" || ev.type === "supplement.open") l.pageViews += 1;
    if (ev.type === "game.start") l.gamePlays += 1;
    if (ev.type === "pretest.answer") l.pretestAnswers += 1;
  }
  for (const [uid, row] of board) {
    const l = ensure(uid);
    if (l.name === uid.slice(0, 8)) l.name = row.name;
  }
  // Fold aliased accounts into one person (Dan, 2026-07-16): counts add,
  // board XP/gems add (both accounts are the same student's effort), the
  // name and email come from the canonical account.
  const byCanon = new Map<string, Learner>();
  const merged: Learner[] = [];
  for (const l of byUid.values()) {
    const canon = canonicalEmail(meta.aliasEmails, l.email);
    const t = canon ? byCanon.get(canon) : undefined;
    if (!canon || !t) {
      if (canon) byCanon.set(canon, l);
      merged.push(l);
      continue;
    }
    const canonSide = l.email?.toLowerCase() === canon ? l : t;
    t.name = canonSide.name;
    t.email = canon;
    t.uids = [...t.uids, ...l.uids];
    t.isTeacher = t.isTeacher || l.isTeacher;
    t.pageViews += l.pageViews;
    t.gamePlays += l.gamePlays;
    t.pretestAnswers += l.pretestAnswers;
    if (l.firstSeen && (!t.firstSeen || l.firstSeen < t.firstSeen)) t.firstSeen = l.firstSeen;
    if (l.lastSeen && (!t.lastSeen || l.lastSeen > t.lastSeen)) t.lastSeen = l.lastSeen;
    if (t.board || l.board) {
      t.board = {
        name: canonSide.board?.name ?? canonSide.name,
        xp: (t.board?.xp ?? 0) + (l.board?.xp ?? 0),
        level: Math.max(t.board?.level ?? 1, l.board?.level ?? 1),
        gems: (t.board?.gems ?? 0) + (l.board?.gems ?? 0),
        streak: Math.max(t.board?.streak ?? 0, l.board?.streak ?? 0),
        term: canonSide.board?.term ?? t.board?.term ?? l.board?.term,
      };
    }
  }
  for (const l of merged) {
    const union = new Set<string>();
    for (const uid of l.uids) for (const d of days.get(uid) ?? []) union.add(d);
    l.daysActive = union.size;
  }
  // Hidden accounts (Dan, 2026-07-16: "need not be monitored or appear on
  // my Teacher's Page") — prior-term board leftovers and test accounts.
  for (const l of merged) {
    l.hidden =
      isHiddenRosterName(l.name) ||
      l.uids.some((u) => EXCLUDED_BOARD_UIDS.has(u) || HIDDEN_ROSTER_UID_PREFIXES.some((pre) => u.startsWith(pre)));
    // Cohort reset (Dan, 2026-08-11): current = the board row says so, or the
    // account's first trace postdates the reset (covers a freshman's first
    // minutes, before their first leaderboard publish). Teachers are always
    // "current" so the include-teachers toggle keeps working.
    l.currentTerm =
      l.isTeacher ||
      isCurrentTerm(l.board?.term) ||
      (!!l.firstSeen && l.firstSeen.getTime() >= TERM_START_MS);
  }
  return merged.sort(
    (a, b) => (b.lastSeen?.getTime() ?? 0) - (a.lastSeen?.getTime() ?? 0),
  );
}

/** Fetch one person's stores. Aliased students have several uids — every
 *  store is fetched per-uid and combined (XP/gems add, SIOs/badges union,
 *  responses concatenate). */
export async function fetchStudentDetail(uids: string[]): Promise<StudentDetail> {
  const parts = await Promise.all(uids.map(fetchOneStudent));
  if (parts.length === 1) return parts[0];
  const progresses = parts.map((p) => p.progress).filter((p): p is NonNullable<StudentDetail["progress"]> => !!p);
  return {
    progress: progresses.length === 0 ? null : {
      xp: progresses.reduce((n, p) => n + (p.xp ?? 0), 0),
      gems: progresses.reduce((n, p) => n + (p.gems ?? 0), 0),
      streak: Math.max(...progresses.map((p) => p.streak ?? 0)),
      lastActiveDay: progresses.map((p) => p.lastActiveDay ?? "").sort().pop() || null,
      doneSios: [...new Set(progresses.flatMap((p) => p.doneSios ?? []))],
      badges: [...new Set(progresses.flatMap((p) => p.badges ?? []))],
      itemSrs: Object.assign({}, ...progresses.map((p) => p.itemSrs ?? {})),
      updatedAt: Math.max(...progresses.map((p) => p.updatedAt ?? 0)) || undefined,
    },
    responses: parts.flatMap((p) => p.responses).sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0)),
  };
}

async function fetchOneStudent(uid: string): Promise<StudentDetail> {
  if (FIXTURE) return (await import("./fixture")).fixtureDetail(uid);
  const [{ getDoc, getDocs, doc, collection }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/db"),
  ]);
  const [progressSnap, responsesSnap] = await Promise.all([
    getDoc(doc(db, "users", uid, "app", "progress")).catch(() => null),
    getDocs(collection(db, "users", uid, "responses")).catch(() => null),
  ]);

  const out: StudentDetail = {
    progress: progressSnap?.exists() ? (progressSnap.data() as StudentDetail["progress"]) : null,
    responses: [],
  };
  responsesSnap?.forEach((d) => {
    const r = d.data() as Record<string, unknown> & { timestamp?: { toDate?: () => Date } };
    if (typeof r.item !== "string" || typeof r.status !== "string") return;
    out.responses.push({
      item: r.item,
      status: r.status,
      xp: num(r.xp) ?? 0,
      latencyMs: num(r.latencyMs),
      givenAnswer: str(r.givenAnswer),
      activityId: str(r.activityId),
      ts: r.timestamp?.toDate?.() ?? null,
      outcomeId: str(r.outcomeId),
      evidenceType: str(r.evidenceType),
      assistance: str(r.assistance),
      independent: typeof r.independent === "boolean" ? r.independent : null,
    });
  });
  out.responses.sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0));
  return out;
}

/**
 * The whole class, ONCE (patch 26). Every panel that needs answer logs —
 * Class now, the outcome × student matrix, Evidence, the analytics CSV, the
 * per-student drilldown — used to fetch its own copies (Evidence behind a
 * `Compute` button, sixteen sequential round-trips). This fetches each
 * learner once through a small pool and hands the map to all of them.
 * `onEach` lets the page render tiles as they land rather than after the
 * last one.
 */
export const POOL_SIZE = 4;

export async function fetchClassDetails(
  learners: Learner[],
  onEach?: (uid: string, d: StudentDetail) => void,
): Promise<Map<string, StudentDetail>> {
  const out = new Map<string, StudentDetail>();
  const queue = [...learners];
  const worker = async () => {
    for (let l = queue.shift(); l; l = queue.shift()) {
      try {
        const d = await fetchStudentDetail(l.uids);
        out.set(l.uid, d);
        onEach?.(l.uid, d);
      } catch {
        /* an unreadable learner is a hole in the map, not a dead page */
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(POOL_SIZE, learners.length) }, worker));
  return out;
}

/**
 * The repoll (Class now, every 30 s): only answers newer than `sinceMs`, per
 * uid — a single-field range on `timestamp`, no composite index. Returned in
 * StudentDetail's response shape so the caller can prepend them.
 */
export async function fetchResponsesSince(uids: string[], sinceMs: number): Promise<Map<string, StudentDetail["responses"]>> {
  const out = new Map<string, StudentDetail["responses"]>();
  if (FIXTURE) {
    // The fixture "class" answers a little every poll, so the board moves.
    const { fixtureDetail } = await import("./fixture");
    for (const u of uids) {
      const fresh = fixtureDetail(u).responses.filter((r) => (r.ts?.getTime() ?? 0) > sinceMs);
      if (fresh.length) out.set(u, fresh);
    }
    return out;
  }
  const [{ getDocs, collection, query, where, Timestamp }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/db"),
  ]);
  await Promise.all(uids.map(async (uid) => {
    const snap = await getDocs(query(collection(db, "users", uid, "responses"), where("timestamp", ">", Timestamp.fromMillis(sinceMs)))).catch(() => null);
    const rows: StudentDetail["responses"] = [];
    snap?.forEach((d) => {
      const r = d.data() as Record<string, unknown> & { timestamp?: { toDate?: () => Date } };
      if (typeof r.item !== "string" || typeof r.status !== "string") return;
      rows.push({
        item: r.item, status: r.status, xp: num(r.xp) ?? 0, latencyMs: num(r.latencyMs),
        givenAnswer: str(r.givenAnswer), activityId: str(r.activityId), ts: r.timestamp?.toDate?.() ?? null,
        outcomeId: str(r.outcomeId), evidenceType: str(r.evidenceType), assistance: str(r.assistance),
        independent: typeof r.independent === "boolean" ? r.independent : null,
      });
    });
    if (rows.length) out.set(uid, rows.sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0)));
  }));
  return out;
}
