"use client";

/** The roster, and everything the platform knows about one learner: profile
 *  economy (XP/gems/streak/badges/SIOs/SRS), session time, item-level
 *  responses (accuracy, latency, hardest items, recent answers), plus their
 *  event trail (pages, games, pretest accuracy). The deep stores live under
 *  users/{uid}/… and are fetched per student on drilldown. */

import { useEffect, useMemo, useState } from "react";
import {
  type Ev, type Learner, type StudentDetail,
  fetchStudentDetail, fmtWhen, fmtDuration, str, num, SG_DAY_KEY,
} from "./data";
import { Kpi, TableBox, SectionTitle } from "./ui";

export default function Students({ events, roster }: { events: Ev[]; roster: Learner[] }) {
  const [sel, setSel] = useState<string | null>(null);
  const selected = roster.find((l) => l.uid === sel) ?? null;
  return (
    <div>
      <p className="mt-2 text-sm text-slate-500">Click a learner for the full picture.</p>
      <TableBox head={["Learner", "Last seen", "Days active", "Page views", "Games", "Pretest answers", "XP", "Streak"]}>
        {roster.map((l) => (
          <tr
            key={l.uid}
            onClick={() => setSel(l.uid === sel ? null : l.uid)}
            className={`cursor-pointer border-t border-slate-100 hover:bg-amber-50 ${l.uid === sel ? "bg-amber-50" : ""}`}
          >
            <td className="px-3 py-2 font-bold text-slate-900">
              {l.isTeacher && <span title="teacher account">🧑‍🏫 </span>}
              {l.name}
              {l.email && <span className="ml-2 font-normal text-xs text-slate-500">{l.email}</span>}
            </td>
            <td className="px-3 py-2 text-right text-slate-700 whitespace-nowrap">{fmtWhen(l.lastSeen)}</td>
            <td className="px-3 py-2 text-right text-slate-700">{l.daysActive}</td>
            <td className="px-3 py-2 text-right text-slate-700">{l.pageViews}</td>
            <td className="px-3 py-2 text-right text-slate-700">{l.gamePlays}</td>
            <td className="px-3 py-2 text-right text-slate-700">{l.pretestAnswers}</td>
            <td className="px-3 py-2 text-right font-black text-slate-900">{l.board?.xp ?? "—"}</td>
            <td className="px-3 py-2 text-right text-slate-700">{l.board?.streak ?? "—"}</td>
          </tr>
        ))}
        {roster.length === 0 && (
          <tr><td className="px-3 py-3 text-slate-500" colSpan={8}>No learners recorded yet.</td></tr>
        )}
      </TableBox>
      {selected && <StudentPanel key={selected.uid} learner={selected} events={events} />}
    </div>
  );
}

function StudentPanel({ learner, events }: { learner: Learner; events: Ev[] }) {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStudentDetail(learner.uid).then(
      (d) => { if (!cancelled) setDetail(d); },
      () => { if (!cancelled) setError(true); },
    );
    return () => { cancelled = true; };
  }, [learner.uid]);

  const trail = useMemo(() => {
    const mine = events.filter((e) => e.uid === learner.uid);
    const pages = new Map<string, number>();
    const games = new Map<string, { plays: number; best: number | null }>();
    let answers = 0;
    let correct = 0;
    let supAnswers = 0;
    let supCorrect = 0;
    let tutorMsgs = 0;
    const days = new Set<string>();
    for (const ev of mine) {
      if (ev.ts) days.add(SG_DAY_KEY.format(ev.ts));
      if (ev.type === "page.view" || ev.type === "supplement.open") {
        const path = str(ev.payload.path) ?? str(ev.payload.href);
        if (path) pages.set(path, (pages.get(path) ?? 0) + 1);
      }
      if (ev.type === "game.start" || ev.type === "game.end") {
        const game = str(ev.payload.game) ?? "?";
        let g = games.get(game);
        if (!g) games.set(game, (g = { plays: 0, best: null }));
        if (ev.type === "game.start") g.plays += 1;
        const score = num(ev.payload.score);
        if (ev.type === "game.end" && score !== null) g.best = Math.max(g.best ?? 0, score);
      }
      if (ev.type === "pretest.answer") {
        answers += 1;
        if (ev.payload.correct === true) correct += 1;
      }
      if (ev.type === "supplement.answer") {
        supAnswers += 1;
        if (ev.payload.correct === true) supCorrect += 1;
      }
      if (ev.type === "tutor.message") tutorMsgs += 1;
    }
    return {
      topPages: [...pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
      games: [...games.entries()].sort((a, b) => b[1].plays - a[1].plays),
      answers, correct, supAnswers, supCorrect, tutorMsgs, daysActive: days.size,
    };
  }, [events, learner.uid]);

  const respStats = useMemo(() => {
    if (!detail) return null;
    const byStatus = new Map<string, number>();
    const misses = new Map<string, number>();
    let latencySum = 0;
    let latencyN = 0;
    for (const r of detail.responses) {
      byStatus.set(r.status, (byStatus.get(r.status) ?? 0) + 1);
      if (r.status === "missed" || r.status === "retried") misses.set(r.item, (misses.get(r.item) ?? 0) + 1);
      if (r.latencyMs !== null) { latencySum += r.latencyMs; latencyN += 1; }
    }
    const total = detail.responses.length;
    const good = (byStatus.get("met") ?? 0) + (byStatus.get("mastered") ?? 0);
    return {
      total, byStatus,
      accuracy: total > 0 ? Math.round((good / total) * 100) : null,
      avgLatency: latencyN > 0 ? Math.round(latencySum / latencyN) : null,
      hardest: [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    };
  }, [detail]);

  const sessStats = useMemo(() => {
    if (!detail) return null;
    const byActivity = new Map<string, { n: number; ms: number }>();
    let totalMs = 0;
    for (const s of detail.sessions) {
      const key = s.activityId ?? "(unlabelled)";
      let a = byActivity.get(key);
      if (!a) byActivity.set(key, (a = { n: 0, ms: 0 }));
      a.n += 1;
      if (s.durationMs !== null) { a.ms += s.durationMs; totalMs += s.durationMs; }
    }
    return { totalMs, byActivity: [...byActivity.entries()].sort((a, b) => b[1].ms - a[1].ms) };
  }, [detail]);

  const p = detail?.progress;
  const srs = p?.itemSrs ?? {};
  const srsIds = Object.keys(srs);
  const now = Date.now();
  const srsDue = srsIds.filter((id) => (srs[id]?.due ?? Infinity) <= now).length;

  return (
    <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-4">
      <h2 className="text-lg font-black text-slate-900">
        {learner.name}
        {learner.email && <span className="ml-2 text-sm font-normal text-slate-500">{learner.email}</span>}
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        First seen {fmtWhen(learner.firstSeen)} · last seen {fmtWhen(learner.lastSeen)} · active on {trail.daysActive} day{trail.daysActive === 1 ? "" : "s"}
      </p>

      {error && <p className="mt-3 text-sm font-bold text-rose-600">Couldn&rsquo;t load this learner&rsquo;s stores.</p>}
      {!detail && !error && <p className="mt-3 text-sm text-slate-500">Loading…</p>}

      {detail && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <Kpi label="XP" value={p?.xp ?? learner.board?.xp ?? 0} />
            <Kpi label="Gems" value={p?.gems ?? learner.board?.gems ?? 0} />
            <Kpi label="Streak" value={p?.streak ?? learner.board?.streak ?? 0} />
            <Kpi label="SIOs done" value={p?.doneSios?.length ?? 0} sub="of 50" />
            <Kpi label="Badges" value={p?.badges?.length ?? 0} />
            <Kpi label="SRS items" value={srsIds.length} sub={`${srsDue} due now`} />
            <Kpi label="Attempts" value={detail.attemptsCount ?? "—"} sub="audit log" />
            <Kpi
              label="Last sync"
              value={p?.updatedAt ? fmtWhen(new Date(p.updatedAt)) : "never"}
            />
          </div>

          {respStats && respStats.total > 0 && (
            <>
              <SectionTitle>Item responses</SectionTitle>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi label="Responses" value={respStats.total} />
                <Kpi label="Accuracy" value={respStats.accuracy !== null ? `${respStats.accuracy}%` : "—"} sub="met + mastered" />
                <Kpi label="Avg response time" value={respStats.avgLatency !== null ? `${(respStats.avgLatency / 1000).toFixed(1)} s` : "—"} />
                <Kpi
                  label="Status split"
                  value={
                    <span className="text-sm font-bold">
                      {["mastered", "met", "retried", "missed"]
                        .map((s) => `${s} ${respStats.byStatus.get(s) ?? 0}`)
                        .join(" · ")}
                    </span>
                  }
                />
              </div>
              {respStats.hardest.length > 0 && (
                <>
                  <SectionTitle>Hardest items</SectionTitle>
                  <TableBox head={["Item", "Misses"]}>
                    {respStats.hardest.map(([item, n]) => (
                      <tr key={item} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-bold text-slate-900" lang="fr">{item}</td>
                        <td className="px-3 py-2 text-right font-black text-rose-600">{n}</td>
                      </tr>
                    ))}
                  </TableBox>
                </>
              )}
              <SectionTitle>Recent answers</SectionTitle>
              <TableBox head={["When", "Item", "Status", "Given answer", "Activity", "Time"]}>
                {detail.responses.slice(0, 15).map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{fmtWhen(r.ts)}</td>
                    <td className="px-3 py-2 font-bold text-slate-900" lang="fr">{r.item}</td>
                    <td className={`px-3 py-2 font-bold ${r.status === "missed" ? "text-rose-600" : r.status === "retried" ? "text-amber-600" : "text-emerald-700"}`}>
                      {r.status}
                    </td>
                    <td className="px-3 py-2 text-slate-700" lang="fr">{r.givenAnswer ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{r.activityId ?? "—"}</td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {r.latencyMs !== null ? `${(r.latencyMs / 1000).toFixed(1)} s` : "—"}
                    </td>
                  </tr>
                ))}
              </TableBox>
            </>
          )}
          {respStats && respStats.total === 0 && (
            <p className="mt-4 text-sm text-slate-500">No item-level responses recorded for this learner yet.</p>
          )}

          {sessStats && detail.sessions.length > 0 && (
            <>
              <SectionTitle>Time on task</SectionTitle>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi label="Sessions" value={detail.sessions.length} />
                <Kpi label="Total time" value={fmtDuration(sessStats.totalMs)} />
              </div>
              <TableBox head={["Activity", "Sessions", "Time"]}>
                {sessStats.byActivity.map(([act, a]) => (
                  <tr key={act} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-bold text-slate-900">{act}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{a.n}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{fmtDuration(a.ms)}</td>
                  </tr>
                ))}
              </TableBox>
            </>
          )}
        </>
      )}

      <SectionTitle>Pages visited</SectionTitle>
      {trail.topPages.length > 0 ? (
        <TableBox head={["Page", "Views"]}>
          {trail.topPages.map(([path, n]) => (
            <tr key={path} className="border-t border-slate-100">
              <td className="px-3 py-2 font-bold text-slate-900 break-all">{path}</td>
              <td className="px-3 py-2 text-right text-slate-700">{n}</td>
            </tr>
          ))}
        </TableBox>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No page views yet (tracking starts with the attendance deploy).</p>
      )}

      {(trail.games.length > 0 || trail.answers > 0 || trail.supAnswers > 0 || trail.tutorMsgs > 0) && (
        <>
          <SectionTitle>Games, pretests &amp; more</SectionTitle>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi
              label="Pretest answers"
              value={trail.answers}
              sub={trail.answers > 0 ? `${Math.round((trail.correct / trail.answers) * 100)}% correct` : undefined}
            />
            <Kpi
              label="Supplement answers"
              value={trail.supAnswers}
              sub={trail.supAnswers > 0 ? `${Math.round((trail.supCorrect / trail.supAnswers) * 100)}% correct` : undefined}
            />
            <Kpi label="Tutor messages" value={trail.tutorMsgs} sub="length only, text stays private" />
          </div>
          {trail.games.length > 0 && (
            <TableBox head={["Game", "Plays", "Best score"]}>
              {trail.games.map(([game, g]) => (
                <tr key={game} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-bold text-slate-900">{game}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{g.plays}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{g.best ?? "—"}</td>
                </tr>
              ))}
            </TableBox>
          )}
        </>
      )}
    </div>
  );
}
