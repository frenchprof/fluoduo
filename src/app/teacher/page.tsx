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
  ADMIN_EMAILS, type BoardRow, type Ev,
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

  return (
    // Site row only, like ConjugaZone/Tuteur — a custom context flap group
    // left the tab rail hanging clear of the page edges (Dan, 2026-07-13).
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="teacher" crumb="🧑‍🏫 Teacher">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {user === undefined ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : isAdmin ? (
          <Dashboard />
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

function Dashboard() {
  const [panel, setPanel] = useState<PanelKey>("overview");
  const [events, setEvents] = useState<Ev[] | null>(null);
  const [board, setBoard] = useState<Map<string, BoardRow> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchAllEvents(), fetchLeaderboard()]).then(
      ([evs, b]) => {
        if (cancelled) return;
        setEvents(evs);
        setBoard(b);
      },
      () => {
        if (!cancelled) setError(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const roster = useMemo(
    () => (events && board ? buildRoster(events, board) : []),
    [events, board],
  );
  const nameOf = useMemo(() => new Map(roster.map((l) => [l.uid, l.name])), [roster]);

  if (error) return <p className="text-sm font-bold text-rose-600">Couldn&rsquo;t load the analytics streams.</p>;
  if (!events || !board) return <p className="text-sm text-slate-500">Loading analytics…</p>;

  return (
    <div>
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
        {panel === "overview" && <Overview events={events} roster={roster} />}
        {panel === "attendance" && <Attendance events={events} roster={roster} />}
        {panel === "students" && <Students events={events} roster={roster} />}
        {panel === "activities" && <Activities events={events} roster={roster} />}
        {panel === "pretests" && <Pretests events={events} />}
        {panel === "feedback" && <FeedbackPanel nameOf={nameOf} />}
      </div>
    </div>
  );
}
