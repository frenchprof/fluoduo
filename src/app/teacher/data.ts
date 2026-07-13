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

// Mirror of firestore.rules isAdmin() — keep the two lists in sync.
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

export async function fetchAllEvents(): Promise<Ev[]> {
  const [{ getDocs, collection }, { db }] = await Promise.all([
    import("firebase/firestore"),
    import("@/lib/firebase/db"),
  ]);
  const snap = await getDocs(collection(db, "events"));
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
        uid, name: uid.slice(0, 8), email: null, isTeacher: false,
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
    if (name) l.name = name;
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
  for (const l of byUid.values()) l.daysActive = days.get(l.uid)?.size ?? 0;
  return [...byUid.values()].sort(
    (a, b) => (b.lastSeen?.getTime() ?? 0) - (a.lastSeen?.getTime() ?? 0),
  );
}

export async function fetchStudentDetail(uid: string): Promise<StudentDetail> {
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
