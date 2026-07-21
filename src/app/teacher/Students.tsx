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
import { XP_CORRECT, XP_WRONG, XP_SIO_BASE, XP_CONVERSATION } from "@/lib/economy";
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
              {l.email && <a href={`mailto:${l.email}`} onClick={(e) => e.stopPropagation()} className="ml-2 font-normal text-xs text-slate-500 text-blue-700 underline underline-offset-2 hover:text-blue-900">{l.email}</a>}
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
      {selected && <StudentPanel key={selected.uid} learner={selected} events={events} onClose={() => setSel(null)} />}
    </div>
  );
}

function StudentPanel({ learner, events, onClose }: { learner: Learner; events: Ev[]; onClose: () => void }) {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchStudentDetail(learner.uids).then(
      (d) => { if (!cancelled) setDetail(d); },
      () => { if (!cancelled) setError(true); },
    );
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key={uid} remounts the panel per learner
  }, [learner.uid]);

  const trail = useMemo(() => {
    const mine = events.filter((e) => learner.uids.includes(e.uid));
    const pages = new Map<string, number>();
    const games = new Map<string, { plays: number; best: number | null }>();
    let answers = 0;
    let correct = 0;
    let supAnswers = 0;
    let supCorrect = 0;
    let tutorMsgs = 0;
    const tutorRecent: { ts: Date | null; text: string }[] = [];
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
      if (ev.type === "tutor.message") {
        tutorMsgs += 1;
        const text = str(ev.payload.text);
        if (text) tutorRecent.push({ ts: ev.ts, text });
      }
    }
    tutorRecent.sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0));
    return {
      topPages: [...pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
      games: [...games.entries()].sort((a, b) => b[1].plays - a[1].plays),
      answers, correct, supAnswers, supCorrect, tutorMsgs,
      tutorRecent: tutorRecent.slice(0, 10),
      daysActive: days.size,
    };
  }, [events, learner.uids]);

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

  // ── Exercise identity (2026-07-20, Dan: "merge some info — I cannot see
  // the results of the individual exercises anymore") ─────────────────────
  // activityId is the recording page's pathname, so the 2026-07-20 URL
  // renames split ONE exercise's history into two labels. Normalize legacy
  // paths to today's names before any grouping, so old and new evidence
  // merge into a single row.
  const normActivity = (id: string | null | undefined): string => {
    if (!id) return "(unlabelled)";
    return id
      .replace(/^\/games\/letris(?=\/|$)/, "/games/vocabularain")
      .replace(/^\/games\/conveyor(?=\/|$)/, "/games/lexicalater")
      .replace(/^\/practice\/devine(?=\/|$)/, "/practice/speculearn")
      .replace(/^\/practice\/oral(?=\/|$)/, "/practice/wordrill")
      .replace(/^letris:/, "vocabularain:")
      .replace(/^devine:/, "speculearn:");
  };
  // "/practice/speculearn/aliments" → "SpecuLearn · aliments" — the teacher
  // reads exercises, not URLs.
  const ACTIVITY_NAMES: [RegExp, string][] = [
    [/^\/practice\/speculearn\/?/, "SpecuLearn"],
    [/^\/practice\/flip-it\/?/, "Flip It"],
    [/^\/practice\/say-it\/?|^\/practice\/wordrill\/?/, "WorDrill"],
    [/^\/practice\/complete-it\/?/, "Complete It"],
    [/^\/practice\/grammarathon\/?/, "GramMarathon"],
    [/^\/practice\/dice\/?/, "Dice"],
    [/^\/games\/vocabularain\/?|^vocabularain:/, "VocabulaRain"],
    [/^\/games\/lexicalater\/?/, "LexicaLater"],
    [/^\/games\/compose\/?/, "Composer"],
    [/^\/conjugaison\/?/, "ConjugaZone"],
    [/^\/reviser\/?/, "DéjàRevu"],
    [/^mcq:/, "Deck MCQ"],
    [/^\/lessons\/?/, "Lesson"],
  ];
  const labelActivity = (norm: string): string => {
    for (const [re, name] of ACTIVITY_NAMES) {
      if (re.test(norm)) {
        const rest = norm.replace(re, "").replace(/^[/:]+/, "").split("/")[0];
        return rest ? `${name} · ${rest}` : name;
      }
    }
    return norm;
  };

  // Every reference should be a road (Dan, 2026-07-21: "I am going to need
  // links at wherever there can be links — I am very lost"). A normalized
  // activity key IS a destination: paths link to themselves, prefix keys map
  // to their activity's home page.
  const hrefFor = (key: string): string | null => {
    if (key.startsWith("/")) return key;
    const m = /^mcq:(.+)$/.exec(key);
    if (m) return `/decks/${m[1]}/mcq`;
    if (key.startsWith("vocabularain:")) return "/games/vocabularain";
    if (key.startsWith("speculearn:")) return "/practice/speculearn";
    return null;
  };
  const ExLink = ({ k, label }: { k: string; label: string }) => {
    const href = hrefFor(k);
    return href
      ? <a href={href} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{label}</a>
      : <>{label}</>;
  };

  // ── Results by exercise: EVERY response, grouped (not just the last 15) ──
  const byExercise = useMemo(() => {
    if (!detail) return null;
    type G = { key: string; label: string; n: number; ok: number; missed: number; retried: number; last: number };
    const m = new Map<string, G>();
    for (const r of detail.responses) {
      const key = normActivity(r.activityId);
      let g = m.get(key);
      if (!g) m.set(key, (g = { key, label: labelActivity(key), n: 0, ok: 0, missed: 0, retried: 0, last: 0 }));
      g.n += 1;
      if (r.status === "met" || r.status === "mastered") g.ok += 1;
      else if (r.status === "retried") g.retried += 1;
      else g.missed += 1;
      const t = r.ts?.getTime() ?? 0;
      if (t > g.last) g.last = t;
    }
    return [...m.values()].sort((a, b) => b.last - a.last);
  }, [detail]);

  const sessStats = useMemo(() => {
    if (!detail) return null;
    const byActivity = new Map<string, { n: number; ms: number }>();
    let totalMs = 0;
    for (const s of detail.sessions) {
      const key = normActivity(s.activityId);
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
    // Centered modal (Dan, 2026-07-16: details must "POP UP in my face in
    // the middle of the screen", and tapping anywhere else closes it).
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={learner.name}
      onClick={onClose}
    >
    <div
      className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-2xl border-2 border-amber-300 bg-[#fffdf6] p-4 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="float-right rounded-lg border-2 border-slate-300 bg-white px-2 py-0.5 text-sm font-black text-slate-600 hover:border-slate-500"
      >
        ✕
      </button>
      <h2 className="text-lg font-black text-slate-900">
        {learner.name}
        {learner.email && <a href={`mailto:${learner.email}`} className="ml-2 text-sm font-normal text-slate-500 text-blue-700 underline underline-offset-2 hover:text-blue-900">{learner.email}</a>}
        {learner.uids.length > 1 && (
          <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800" title={learner.uids.join(" + ")}>
            {learner.uids.length} accounts merged
          </span>
        )}
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

          {/* XP audit (Dan, 2026-07-15: "check if XPs awarded correctly e.g.
              for Parker"). Two checks: (1) leaderboard must equal the synced
              progress XP — a gap means stale publishes; (2) XP must be AT
              LEAST the evidence floor implied by everything recorded. The
              floor prices each answer at the rate IN FORCE WHEN IT WAS GIVEN
              — the 8 Jul ×20 retune (3/1 → 60/20) means week-one answers
              paid twentyfold less, and pricing them at today's rates raised
              false BELOW-FLOOR alarms (Dan, 2026-07-17). SIOs are priced at
              the old 15 (undatable, so the strict lower bound); role-play
              events only exist post-retune. Above the floor is normal:
              streak ×1.5 and SIO mastery bonuses add. */}
          {(() => {
            const boardXp = learner.board?.xp ?? null;
            const progXp = p?.xp ?? null;
            // The ×20 retune deploy: 2026-07-08 05:07 SGT.
            const RETUNE = Date.UTC(2026, 6, 7, 21, 7, 31);
            let okOld = 0, koOld = 0, okNew = 0, koNew = 0, unpaid = 0;
            for (const r of detail.responses) {
              // Unpaid answers write evidence but no per-answer XP. Since
              // 2026-07-19 the receipt itself says so (xp: 0 — honest
              // receipts), so ANY future unpaid activity is auto-excluded.
              // The letris:/mcq: prefixes stay for LEGACY docs, which
              // hardcoded phantom 60/20s (Dan, 2026-07-17: "still red for
              // some").
              if (r.xp === 0 || r.activityId?.startsWith("letris:") || r.activityId?.startsWith("mcq:")) { unpaid++; continue; }
              const good = r.status === "met" || r.status === "mastered";
              const old = (r.ts?.getTime() ?? 0) < RETUNE; // undated → old rate (strict floor)
              if (good) { if (old) okOld++; else okNew++; }
              else { if (old) koOld++; else koNew++; }
            }
            const sios = p?.doneSios?.length ?? 0;
            const convs = events.filter(
              (e) => learner.uids.includes(e.uid) && e.type === "game.end" && String((e.payload as Record<string, unknown>)?.game ?? "").startsWith("compose"),
            ).length;
            const floor =
              okNew * XP_CORRECT + koNew * XP_WRONG + okOld * 3 + koOld * 1 +
              sios * 15 + convs * XP_CONVERSATION;
            const ok = okOld + okNew;
            const ko = koOld + koNew;
            const syncOk = boardXp === null || progXp === null || boardXp === progXp;
            const floorOk = progXp === null || progXp >= floor;
            return (
              <div className={`mt-4 rounded-xl border-2 p-3 text-sm ${syncOk && floorOk ? "border-emerald-300 bg-emerald-50/60" : "border-rose-300 bg-rose-50/60"}`}>
                <p className="font-black text-slate-900">
                  XP audit {syncOk && floorOk ? "✓" : "⚠️"}
                </p>
                <p className="mt-1 text-slate-700">
                  Leaderboard <b>{boardXp ?? "—"}</b> vs progress <b>{progXp ?? "—"}</b>{" "}
                  {syncOk ? "· in sync ✓" : "· OUT OF SYNC — the leaderboard publish is stale (learner should open the app signed-in once)"}
                </p>
                <p className="mt-0.5 text-slate-700">
                  Evidence floor: {ok}✓ + {ko}✗ paying answers{okOld + koOld > 0 ? ` (${okOld + koOld} at pre-8-Jul rates)` : ""}{unpaid > 0 ? ` (+${unpaid} rain/MCQ answers, no per-answer XP)` : ""}, {sios} SIOs, {convs} role-plays → <b>≥ {floor} XP</b>{" "}
                  {floorOk
                    ? "· progress covers it ✓ (streak ×1.5 and mastery bonuses explain the rest)"
                    : "· BELOW FLOOR — some recorded answers did not pay XP, or progress was reset on a device"}
                </p>
              </div>
            );
          })()}

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
              <SectionTitle>Results by exercise</SectionTitle>
              <TableBox head={["Exercise", "Answers", "✓ ok", "✗ missed", "retried", "Last done"]}>
                {(byExercise ?? []).map((g, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-bold text-slate-900"><ExLink k={g.key} label={g.label} /></td>
                    <td className="px-3 py-2 text-right text-slate-700">{g.n}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-700">{g.ok}</td>
                    <td className="px-3 py-2 text-right font-bold text-rose-600">{g.missed}</td>
                    <td className="px-3 py-2 text-right text-amber-600">{g.retried}</td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{g.last ? fmtWhen(new Date(g.last)) : "—"}</td>
                  </tr>
                ))}
              </TableBox>
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
                    <td className="px-3 py-2 text-slate-700">{r.activityId ? <ExLink k={normActivity(r.activityId)} label={labelActivity(normActivity(r.activityId))} /> : "—"}</td>
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
              <td className="px-3 py-2 font-bold text-slate-900 break-all"><a href={path} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{path}</a></td>
              <td className="px-3 py-2 text-right text-slate-700">{n}</td>
            </tr>
          ))}
        </TableBox>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No page views yet (visit tracking shipped 13 Jul 2026; earlier visits were never recorded).</p>
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
            <Kpi label="Tutor messages" value={trail.tutorMsgs} />
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
          {trail.tutorRecent.length > 0 && (
            <>
              <SectionTitle>Recent tutor messages</SectionTitle>
              <TableBox head={["When", "Message"]}>
                {trail.tutorRecent.map((m, i) => (
                  <tr key={i} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{fmtWhen(m.ts)}</td>
                    <td className="px-3 py-2 text-slate-900">{m.text}</td>
                  </tr>
                ))}
              </TableBox>
            </>
          )}
        </>
      )}
    </div>
    </div>
  );
}
