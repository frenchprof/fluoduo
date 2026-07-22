"use client";

/**
 * Teacher analytics dashboard — everything the platform records about the
 * learners, in one admin-gated place (Dan, 2026-07-13: "a back end for me to
 * see everything there is to see in terms of learner analytics"):
 *   📊 Overview    class KPIs, day-by-day rhythm, top pages, XP top 10
 *   👣 Attendance  day × page → unique visitors with names
 *   🧑‍🎓 Students    roster → per-learner drilldown (progress economy, SRS,
 *                  sessions/time-on-task, item responses, event trail)
 *   🕹️ Activities  games / decks / supplements / flashcard reviews
 *   🧪 Pretests    gap report: per item miss rates + top wrong picks
 *   💬 Feedback    the bug-report inbox
 * The events + leaderboard streams are fetched ONCE here and shared by all
 * panels; per-student stores load lazily on drilldown (see data.ts). Firestore
 * rules already restrict every collection read here to admins (leaderboard is
 * signed-in read), so the email gate is UX, not security. Not linked from
 * learner surfaces — teachers get the URL.
 */

import { useEffect, useMemo, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { useAuthUser, signInWithGoogle } from "@/lib/firebase/auth";
import {
  ADMIN_EMAILS, REVIEWER_EMAILS, type BoardRow, type Ev,
  buildRoster, fetchAllEvents, fetchLeaderboard,
} from "./data";
import Overview from "./Overview";
import Attendance from "./Attendance";
import Students from "./Students";
import Activities from "./Activities";
import Pretests from "./Pretests";
import FeedbackPanel from "./FeedbackPanel";

const PANELS = [
  { key: "overview", label: "📊 Overview" },
  { key: "attendance", label: "👣 Attendance" },
  { key: "students", label: "🧑‍🎓 Students" },
  { key: "activities", label: "🕹️ Activities" },
  { key: "pretests", label: "🧪 Pretests" },
  { key: "feedback", label: "💬 Feedback" },
] as const;
type PanelKey = (typeof PANELS)[number]["key"];

export default function TeacherPage() {
  const user = useAuthUser(); // undefined = resolving, null = signed out
  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email);
  // Reviewers get the full read view, none of the write actions.
  const isReviewer = !!user?.email && REVIEWER_EMAILS.includes(user.email);
  const canView = isAdmin || isReviewer;

  return (
    // Site row only, like ConjugaZone/Tuteur — a custom context flap group
    // left the tab rail hanging clear of the page edges (Dan, 2026-07-13).
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="teacher" crumb="🧑‍🏫 Teacher">
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

function Dashboard({ canWrite }: { canWrite: boolean }) {
  const [panel, setPanel] = useState<PanelKey>("overview");
  // XP-top-10 names jump straight into that student's modal (Dan, 2026-07-22).
  const [jumpUid, setJumpUid] = useState<string | null>(null);
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [board, setBoard] = useState<Map<string, BoardRow> | null>(null);
  const [error, setError] = useState(false);
  // Dan tests with a teacher account, which the panels exclude by default —
  // this toggle makes his own actions visible so "is it recording?" is
  // answerable at a glance (Dan, 2026-07-14).
  const [includeTeachers, setIncludeTeachers] = useState(false);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setEvents(null);
    setBoard(null);
    Promise.all([fetchAllEvents(), fetchLeaderboard()]).then(
      ([evs, b]) => {
        if (cancelled) return;
        setEvents(evs);
        setBoard(b);
        setLoadedAt(new Date());
      },
      () => {
        if (!cancelled) setError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const rosterAll = useMemo(
    () => (events && board ? buildRoster(events, board) : []),
    [events, board],
  );
  // Hidden accounts (Dan, 2026-07-16) vanish from every panel — roster AND
  // their stray events.
  const roster = useMemo(() => rosterAll.filter((l) => !l.hidden), [rosterAll]);
  const hiddenUids = useMemo(
    () => new Set(rosterAll.filter((l) => l.hidden).flatMap((l) => l.uids)),
    [rosterAll],
  );
  const shown = useMemo(
    () => (events ? events.filter((e) => !hiddenUids.has(e.uid)) : null),
    [events, hiddenUids],
  );
  const nameOf = useMemo(() => new Map(roster.flatMap((l) => l.uids.map((u) => [u, l.name] as const))), [roster]);

  if (error) return <p className="text-sm font-bold text-rose-600">Couldn&rsquo;t load the analytics streams.</p>;
  if (!events || !board) return <p className="text-sm text-slate-500">Loading analytics…</p>;

  const newest = events && events.length > 0 ? events[events.length - 1].ts : null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="rounded-lg border-2 border-slate-300 bg-white px-2.5 py-1 font-bold text-slate-700 hover:border-slate-500">
          ↻ Refresh
        </button>
        <label className="flex cursor-pointer items-center gap-1.5 font-bold">
          <input type="checkbox" checked={includeTeachers} onChange={(e) => setIncludeTeachers(e.target.checked)} />
          include teacher accounts
        </label>
        {events && (
          <span>
            {events.length} events loaded{loadedAt ? ` at ${loadedAt.toLocaleTimeString()}` : ""} · newest event{" "}
            {newest ? newest.toLocaleTimeString() : "—"}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {PANELS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPanel(p.key)}
            className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${
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
        {panel === "overview" && <Overview events={shown ?? []} roster={roster} includeTeachers={includeTeachers} onStudent={(uid) => { setJumpUid(uid); setPanel("students"); }} />}
        {panel === "attendance" && <Attendance events={shown ?? []} roster={roster} includeTeachers={includeTeachers} />}
        {panel === "students" && <Students events={shown ?? []} roster={roster} initialUid={jumpUid} />}
        {panel === "activities" && <Activities events={shown ?? []} roster={roster} includeTeachers={includeTeachers} />}
        {panel === "pretests" && <Pretests events={shown ?? []} />}
        {panel === "feedback" && <FeedbackPanel nameOf={nameOf} canWrite={canWrite} />}
      </div>
    </div>
  );
}
