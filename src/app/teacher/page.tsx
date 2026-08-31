"use client";

/**
 * Teacher analytics dashboard — everything the platform records about the
 * learners, in one admin-gated place (Dan, 2026-07-13: "a back end for me to
 * see everything there is to see in terms of learner analytics"):
 *   🟢 Class now   16 tiles worst-first, repolled every 30 s; the outcome ×
 *                  student matrix (patch 26)
 *   📊 Overview    class KPIs, day-by-day rhythm, top pages, XP top 10
 *   📄 Reports     four report cards, each a headline number + CSV export
 *   👣 Attendance  day × page → unique visitors with names
 *   🧑‍🎓 Students    roster → per-learner drilldown (progress economy, SRS,
 *                  time-on-task estimate, item responses, event trail)
 *   🕹️ Activities  games / decks / supplements / flashcard reviews
 *   🧪 Pretests    gap report: per item miss rates + top wrong picks
 *   💬 Feedback    the bug-report inbox
 * The events + leaderboard streams are fetched ONCE here and shared by all
 * panels; the per-student stores (answer logs) are fetched ONCE too, through
 * a small pool as soon as the roster is known, and handed to every panel
 * that reads them — Class now, the matrix, Evidence, the CSV, the drilldown
 * (patch 26; before, each fetched its own copies, Evidence behind a button). Firestore
 * rules already restrict every collection read here to admins (leaderboard is
 * signed-in read), so the email gate is UX, not security. Not linked from
 * learner surfaces — teachers get the URL.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { useAuthUser, signInWithGoogle } from "@/lib/firebase/auth";
import {
  ADMIN_EMAILS, REVIEWER_EMAILS, FIXTURE, type BoardRow, type Ev, type RosterMeta, type StudentDetail,
  buildRoster, EMPTY_ROSTER_META, EVENT_FETCH_CAP,
  fetchAllEvents, fetchLeaderboard, fetchRosterMeta, fetchClassDetails, fetchResponsesSince,
} from "./data";
import ClassNow, { REPOLL_MS } from "./ClassNow";
import Overview from "./Overview";
import Reports from "./Reports";
import Attendance from "./Attendance";
import Students from "./Students";
import Activities from "./Activities";
import Pretests from "./Pretests";
import FeedbackPanel from "./FeedbackPanel";
import Gaps from "./Gaps";

const PANELS = [
  { key: "now", label: "🟢 Class now" },
  { key: "overview", label: "📊 Overview" },
  { key: "reports", label: "📄 Reports" },
  { key: "attendance", label: "👣 Attendance" },
  { key: "students", label: "🧑‍🎓 Students" },
  { key: "activities", label: "🕹️ Activities" },
  { key: "pretests", label: "🧪 Pretests" },
  { key: "gaps", label: "🧱 Gaps" },
  { key: "feedback", label: "💬 Feedback" },
] as const;
type PanelKey = (typeof PANELS)[number]["key"];

export default function TeacherPage() {
  const user = useAuthUser(); // undefined = resolving, null = signed out
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);
  // Reviewers get the full read view, none of the write actions.
  const isReviewer = !!user?.email && REVIEWER_EMAILS.includes(user.email);
  // FIXTURE is build-time only (screenshots/checks); false in every deploy.
  const canView = isAdmin || isReviewer || FIXTURE;

  return (
    // Site row only, like ConjugaZone/Tuteur — a custom context flap group
    // left the tab rail hanging clear of the page edges (Dan, 2026-07-13).
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="teacher">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {user === undefined ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : canView ? (
          <Dashboard canWrite={isAdmin} />
        ) : (
          <TeachersOnly />
        )}
      </div>
    </CahierShell>
  );
}

function TeachersOnly() {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-bold text-slate-700">Teachers only.</p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await signInWithGoogle();
          } catch {
          } finally {
            setBusy(false);
          }
        }}
        className="fluo-btn fluo-btn-sm disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Continue with Google"}
      </button>
    </div>
  );
}

/** Firestore's own code is the diagnosis: permission-denied means the rules or
 *  the admin list, failed-precondition means a missing index, unavailable means
 *  the network. Anything else at least gets its message shown. */
function describe(err: unknown): string {
  const e = err as { code?: unknown; message?: unknown } | null;
  if (e && typeof e.code === "string") return e.code;
  if (e && typeof e.message === "string") return e.message.slice(0, 120);
  return "unknown error";
}

function Dashboard({ canWrite }: { canWrite: boolean }) {
  const [panel, setPanel] = useState<PanelKey>("now");
  // One scrolling row, never a stack (Dan, 2026-08-11: the pills wrapped
  // into four rows on the phone) — and the active pill stays in view.
  const rail = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    rail.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [panel]);
  // XP-top-10 names jump straight into that student's modal (Dan, 2026-07-22).
  const [jumpUid, setJumpUid] = useState<string | null>(null);
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [board, setBoard] = useState<Map<string, BoardRow> | null>(null);
  // Roster maps (aliases, name overrides, email seeds) come from Firestore —
  // see data.ts fetchRosterMeta(). Absent maps degrade the roster (no alias
  // merging), they don't blank it, so the miss is a note, not a failure.
  const [meta, setMeta] = useState<RosterMeta | null>(null);
  const [metaMiss, setMetaMiss] = useState<string | null>(null);
  /** Which streams failed, and what Firestore said — one opaque sentence for
   *  both made "is it recording?" unanswerable from the page itself. */
  const [failed, setFailed] = useState<string[]>([]);
  // Dan tests with a teacher account, which the panels exclude by default —
  // this toggle makes his own actions visible so "is it recording?" is
  // answerable at a glance (Dan, 2026-07-14).
  const [includeTeachers, setIncludeTeachers] = useState(false);
  // Cohort reset (Dan, 2026-08-11): every panel defaults to the CURRENT
  // cohort. Prior terms stay in Firestore for the research programme and
  // reappear behind this toggle — a filter, not a deletion.
  const [allCohorts, setAllCohorts] = useState(false);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Deliberate: this effect synchronises with Firestore; a reload must
    // clear the previous fetch synchronously so no panel shows stale data
    // while the new one is in flight. Block-disabled: the rule reports only
    // the first setState it meets, and which one that is differs between
    // local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
    setEvents(null);
    setBoard(null);
    setMeta(null);
    setMetaMiss(null);
    setFailed([]);
    /* eslint-enable react-hooks/set-state-in-effect */
    // One stream failing must not blank the page: the events trail and the
    // leaderboard are independent, and most panels need only the first.
    void Promise.allSettled([fetchAllEvents(), fetchLeaderboard(), fetchRosterMeta()]).then(([e, b, m]) => {
      if (cancelled) return;
      const why: string[] = [];
      if (e.status === "fulfilled") setEvents(e.value);
      else {
        setEvents([]);
        why.push(`events (${describe(e.reason)})`);
      }
      if (b.status === "fulfilled") setBoard(b.value);
      else {
        setBoard(new Map());
        why.push(`leaderboard (${describe(b.reason)})`);
      }
      if (m.status === "fulfilled" && m.value) setMeta(m.value);
      else {
        setMeta(EMPTY_ROSTER_META);
        setMetaMiss(m.status === "fulfilled" ? "not seeded — run scripts/seed-roster-private.mjs" : describe(m.reason));
      }
      setFailed(why);
      setLoadedAt(new Date());
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const rosterAll = useMemo(
    () => (events && board && meta ? buildRoster(events, board, meta) : []),
    [events, board, meta],
  );
  // Hidden accounts (Dan, 2026-07-16) vanish from every panel — roster AND
  // their stray events.
  const roster = useMemo(
    () => rosterAll.filter((l) => !l.hidden && (allCohorts || l.currentTerm)),
    [rosterAll, allCohorts],
  );
  const hiddenUids = useMemo(
    () => new Set(rosterAll.filter((l) => l.hidden || !(allCohorts || l.currentTerm)).flatMap((l) => l.uids)),
    [rosterAll, allCohorts],
  );
  const shown = useMemo(
    () => (events ? events.filter((e) => !hiddenUids.has(e.uid)) : null),
    [events, hiddenUids],
  );
  const nameOf = useMemo(() => new Map(roster.flatMap((l) => l.uids.map((u) => [u, l.name] as const))), [roster]);

  // ── The class's answer logs, once, through a pool (patch 26) ──────────
  // Keyed by learner.uid (the canonical one); aliased accounts are combined
  // by fetchStudentDetail. Tiles land as each learner arrives.
  const [details, setDetails] = useState<Map<string, StudentDetail>>(() => new Map());
  const [fetched, setFetched] = useState(0);
  const [polledAt, setPolledAt] = useState<Date | null>(null);
  const rosterKey = roster.map((l) => l.uid).join(",");
  useEffect(() => {
    if (roster.length === 0) return;
    let cancelled = false;
    // Deliberate: this effect synchronises with Firestore; a roster change
    // must clear the previous class's details synchronously so no tile shows
    // stale data. Block-disabled: the rule reports only the first setState
    // it meets, and which one that is differs between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
    setDetails(new Map());
    setFetched(0);
    /* eslint-enable react-hooks/set-state-in-effect */
    void fetchClassDetails(roster, (uid, d) => {
      if (cancelled) return;
      setDetails((m) => new Map(m).set(uid, d));
      setFetched((n) => n + 1);
    }).then(() => { if (!cancelled) setPolledAt(new Date()); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the uid list is the identity; roster objects churn per render
  }, [rosterKey, reloadKey]);

  // The 30 s repoll: only answers newer than the last poll, folded into the
  // map — the board and matrix move without a page reload. Paused while the
  // tab is hidden (a projector left on overnight must not bill reads).
  useEffect(() => {
    if (!polledAt) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      const since = polledAt.getTime();
      const uids = roster.flatMap((l) => l.uids);
      void fetchResponsesSince(uids, since).then((fresh) => {
        setPolledAt(new Date());
        if (fresh.size === 0) return;
        setDetails((m) => {
          const next = new Map(m);
          for (const l of roster) {
            const d = next.get(l.uid);
            if (!d) continue;
            const newest = d.responses[0]?.ts?.getTime() ?? 0;
            const mine = l.uids.flatMap((u) => fresh.get(u) ?? []).filter((r) => (r.ts?.getTime() ?? 0) > newest);
            if (mine.length) next.set(l.uid, { ...d, responses: [...mine, ...d.responses].sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0)) });
          }
          return next;
        });
      });
    }, REPOLL_MS);
    return () => window.clearInterval(id);
  }, [polledAt, roster]);

  if (!events || !board || !meta) return <p className="text-sm text-slate-500">Loading analytics…</p>;

  const newest = events && events.length > 0 ? events[events.length - 1].ts : null;
  const oldest = events && events.length > 0 ? events[0].ts : null;

  return (
    <div>
      {failed.length > 0 && (
        <p className="mb-2 rounded-xl border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">
          Couldn&rsquo;t load: {failed.join(" · ")}. Everything below is drawn from what did load.
        </p>
      )}
      {metaMiss && (
        <p className="mb-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-700">
          Roster config (admin/rosterPrivate) didn&rsquo;t load: {metaMiss}. Account aliases and
          name overrides are off — students with two accounts appear twice.
        </p>
      )}
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="rounded-lg border-2 border-slate-300 bg-white px-2.5 py-1 font-bold text-slate-700 hover:border-slate-500">
          ↻ Refresh
        </button>
        <label className="flex cursor-pointer items-center gap-1.5 font-bold">
          <input type="checkbox" checked={includeTeachers} onChange={(e) => setIncludeTeachers(e.target.checked)} />
          include teacher accounts
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 font-bold">
          <input type="checkbox" checked={allCohorts} onChange={(e) => setAllCohorts(e.target.checked)} />
          all cohorts (research)
        </label>
        {events && (
          <span>
            {events.length} events loaded{loadedAt ? ` at ${loadedAt.toLocaleTimeString()}` : ""} · newest event{" "}
            {newest ? newest.toLocaleTimeString() : "—"}
          </span>
        )}
        {/* The cap is generous, but silently analysing a window would misstate
            first-seen dates and days-active, so say when it bites. */}
        {events && events.length >= EVENT_FETCH_CAP && (
          <span className="font-bold text-amber-700">
            capped at {EVENT_FETCH_CAP.toLocaleString()} newest events
            {oldest ? ` — nothing before ${oldest.toLocaleDateString()} is counted here` : ""}
          </span>
        )}
      </div>
      <div ref={rail} className="flex gap-2 overflow-x-auto pb-1">
        {PANELS.map((p) => (
          <button
            key={p.key}
            type="button"
            data-active={panel === p.key}
            onClick={() => setPanel(p.key)}
            className={`shrink-0 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
              panel === p.key
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-2">
        {panel === "now" && <ClassNow roster={roster} details={details} fetched={fetched} includeTeachers={includeTeachers} polledAt={polledAt} loadedAt={loadedAt} onStudent={(uid) => { setJumpUid(uid); setPanel("students"); }} />}
        {panel === "overview" && <Overview events={shown ?? []} roster={roster} includeTeachers={includeTeachers} onStudent={(uid) => { setJumpUid(uid); setPanel("students"); }} />}
        {panel === "reports" && <Reports events={shown ?? []} roster={roster} includeTeachers={includeTeachers} details={details} />}
        {panel === "attendance" && <Attendance events={shown ?? []} roster={roster} includeTeachers={includeTeachers} />}
        {panel === "students" && <Students events={shown ?? []} roster={roster} initialUid={jumpUid} details={details} fetched={fetched} />}
        {panel === "activities" && <Activities events={shown ?? []} roster={roster} includeTeachers={includeTeachers} />}
        {panel === "pretests" && <Pretests events={shown ?? []} />}
        {panel === "gaps" && <Gaps />}
        {panel === "feedback" && <FeedbackPanel nameOf={nameOf} canWrite={canWrite} />}
      </div>
    </div>
  );
}
