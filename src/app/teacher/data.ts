/**
 * Data layer for the teacher analytics dashboard. Everything here reads
 * Firestore collections the rules already grant admins: `events` (usage
 * telemetry), `leaderboard` (public progress mirror), `feedback` (bug
 * reports), and per-student docs under users/{uid} (progress blob, sessions,
 * responses, attempts). No collection-group queries — those would need a
 * rules redeploy — so class-wide aggregates come from `events`, and the
 * deeper per-student stores are fetched one student at a time on drilldown.
 * Firestore is imported dynamically (usage.ts pattern): the bundle never
 * ships to learners.
 */

import { canonicalEmail, EXCLUDED_BOARD_UIDS, HIDDEN_ROSTER_UID_PREFIXES, isHiddenRosterName, KNOWN_EMAILS, ROSTER_NAMES } from "@/lib/accountAliases";

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
};

export type Learner = {
  uid: string;
  /** All uids belonging to this person — >1 when accounts are aliased
   *  (accountAliases.ts). Drilldowns and event filters must use this. */
  uids: string[];
  /** Excluded from the teacher page entirely (accountAliases hidden lists). */
  hidden?: boolean;
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
  } | null;
  sessions: {
    activityId: string | null;
    durationMs: number | null;
    startedAt: number | null;
    xp: number | null;
    level: number | null;
  }[];
  responses: {
    item: string;
    status: string;
    xp: number;
    latencyMs: number | null;
    givenAnswer: string | null;
    activityId: string | null;
    ts: Date | null;
  }[];
  attemptsCount: number | null;
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
  const [{ getDocs, collection, limit, orderBy, query }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/db"),
  ]);
  const snap = await getDocs(
    query(collection(db, "events"), orderBy("ts", "desc"), limit(EVENT_FETCH_CAP)),
  );
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
    });
  });
  return out;
}

/** Roster derived from events (every active account signs in → events exist)
 *  unioned with leaderboard rows, so pre-tracking students still appear. */
export function buildRoster(events: Ev[], board: Map<string, BoardRow>): Learner[] {
  const byUid = new Map<string, Learner>();
  const days = new Map<string, Set<string>>();
  const ensure = (uid: string): Learner => {
    let l = byUid.get(uid);
    if (!l) {
      byUid.set(uid, (l = {
        uid, uids: [uid], name: ROSTER_NAMES[uid] ?? uid.slice(0, 8), email: canonicalEmail(KNOWN_EMAILS[uid]) ?? null, isTeacher: false,
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
    if (name && !ROSTER_NAMES[ev.uid]) l.name = name;
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
    const canon = canonicalEmail(l.email);
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
  }
  return merged.sort(
    (a, b) => (b.lastSeen?.getTime() ?? 0) - (a.lastSeen?.getTime() ?? 0),
  );
}

/** Fetch one person's stores. Aliased students have several uids — every
 *  store is fetched per-uid and combined (XP/gems add, SIOs/badges union,
 *  responses/sessions concatenate). */
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
    sessions: parts.flatMap((p) => p.sessions),
    responses: parts.flatMap((p) => p.responses).sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0)),
    attemptsCount: parts.some((p) => p.attemptsCount !== null)
      ? parts.reduce((n, p) => n + (p.attemptsCount ?? 0), 0)
      : null,
  };
}

async function fetchOneStudent(uid: string): Promise<StudentDetail> {
  const [{ getDoc, getDocs, getCountFromServer, doc, collection }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/db"),
  ]);
  const [progressSnap, sessionsSnap, responsesSnap, attemptsAgg] = await Promise.all([
    getDoc(doc(db, "users", uid, "app", "progress")).catch(() => null),
    getDocs(collection(db, "users", uid, "sessions")).catch(() => null),
    getDocs(collection(db, "users", uid, "responses")).catch(() => null),
    getCountFromServer(collection(db, "users", uid, "attempts")).catch(() => null),
  ]);

  const out: StudentDetail = {
    progress: progressSnap?.exists() ? (progressSnap.data() as StudentDetail["progress"]) : null,
    sessions: [],
    responses: [],
    attemptsCount: attemptsAgg ? attemptsAgg.data().count : null,
  };
  sessionsSnap?.forEach((d) => {
    const s = d.data() as Record<string, unknown>;
    out.sessions.push({
      activityId: str(s.activityId),
      durationMs: num(s.durationMs),
      startedAt: num(s.startedAt),
      xp: num(s.xp),
      level: num(s.level),
    });
  });
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
    });
  });
  out.responses.sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0));
  out.sessions.sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0));
  return out;
}
