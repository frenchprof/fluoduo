"use client";

/** The roster, and everything the platform knows about one learner: profile
 *  economy (XP/gems/streak/badges/SIOs/SRS), session time, item-level
 *  responses (accuracy, latency, hardest items, recent answers), plus their
 *  event trail (pages, games, pretest accuracy). The deep stores live under
 *  users/{uid}/… and are fetched per student on drilldown. */

import { SIOS } from "@/content/sios";
import { useEffect, useMemo, useState } from "react";
import {
  type Ev, type Learner, type StudentDetail,
  fetchStudentDetail, fmtWhen, fmtDuration, str, num, SG_DAY_KEY,
} from "./data";
import { XP_CORRECT, XP_WRONG, XP_SIO_BASE, XP_CONVERSATION } from "@/lib/economy";
import { Kpi, TableBox, Section, SectionGroup } from "./ui";
import Evidence from "./Evidence";
import { describeActivity, describePath, hrefForActivity, normalizePath, titleFor } from "@/lib/labels";
import { describeGame } from "@/lib/labels";
import HeatStrip from "@/components/HeatStrip";
import { isMiss, outcomeAccuracy, outcomeOf, outcomeRows, UNMAPPED, tierClass } from "@/lib/outcomeRows";

// The analytics-summary CSV moved to the Reports tab (2026-08-11) — card 4,
// same CLASS_UIDS, same rows. See Reports.tsx.

export default function Students({ events, roster, initialUid, details, fetched }: { events: Ev[]; roster: Learner[]; initialUid?: string | null; details: Map<string, StudentDetail>; fetched: number }) {
  const [sel, setSel] = useState<string | null>(initialUid ?? null);
  useEffect(() => { if (initialUid) setSel(initialUid); }, [initialUid]);
  const selected = roster.find((l) => l.uid === sel) ?? null;
  return (
    <SectionGroup>
      <Section id="stu:evidence" title="📈 Learning evidence — within-student gains">
        <Evidence roster={roster} details={details} fetched={fetched} />
      </Section>
      <Section id="stu:roster" title="Roster" meta={`${roster.length} learners · click one for the full picture`} defaultOpen>
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
      </Section>
      {selected && <StudentPanel key={selected.uid} learner={selected} events={events} cached={details.get(selected.uid) ?? null} onClose={() => setSel(null)} />}
    </SectionGroup>
  );
}

function StudentPanel({ learner, events, cached, onClose }: { learner: Learner; events: Ev[]; cached: StudentDetail | null; onClose: () => void }) {
  // The page's pool already fetched this learner (patch 26) — use it; the
  // fetch below is only for a learner the pool has not reached yet.
  const [fetchedDetail, setDetail] = useState<StudentDetail | null>(null);
  const detail = cached ?? fetchedDetail;
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    fetchStudentDetail(learner.uids).then(
      (d) => { if (!cancelled) setDetail(d); },
      () => { if (!cancelled) setError(true); },
    );
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key={uid} remounts the panel per learner
  }, [learner.uid, !!cached]);

  const trail = useMemo(() => {
    const mine = events.filter((e) => learner.uids.includes(e.uid));
    const pages = new Map<string, number>();
    // Timestamped views, for the dwell reconstruction below.
    const views: { path: string; t: number }[] = [];
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
        if (path) {
          pages.set(path, (pages.get(path) ?? 0) + 1);
          if (ev.ts) views.push({ path, t: ev.ts.getTime() });
        }
      }
      if (ev.type === "game.start" || ev.type === "game.end") {
        // Key on game + deck, the way the Activities panel does. Keying on
        // the game alone threw the collectionId away, which is why this
        // table could never show an outcome: "letris" is a surface,
        // "letris · objets-articles" is a lesson.
        const game = `${str(ev.payload.game) ?? "?"} · ${str(ev.payload.collectionId) ?? ""}`.replace(/ · $/, "");
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
    // ── Time on task, reconstructed ──────────────────────────────────────
    // WHY: users/{uid}/sessions had two readers and NO writer — nothing in the
    // codebase created a session document since the old suite's writer went,
    // so every session carried a null activityId (D6, Dan 2026-08-10). The
    // readers are gone since 2026-08-17; this estimate is the one time source.
    //
    // page.view events DO carry a path and a timestamp, so dwell is the gap to
    // the learner's NEXT view. Two honest bounds:
    //   · a gap over VIEW_CAP_MS means they walked away — the tab was open, the
    //     learner was not. Counting it would inflate a quiet evening into study.
    //   · the last view before such a break still gets VIEW_TAIL_MS, not zero:
    //     they did look at it. A floor, not a measurement.
    // This is an ESTIMATE and is labelled as one on screen. It reads events
    // already collected, so it works retroactively and writes nothing.
    const VIEW_CAP_MS = 30 * 60_000;
    const VIEW_TAIL_MS = 60_000;
    views.sort((a, b) => a.t - b.t);
    const dwell = new Map<string, { ms: number; n: number }>();
    for (let k = 0; k < views.length; k++) {
      const gap = k + 1 < views.length ? views[k + 1].t - views[k].t : Infinity;
      const ms = gap > VIEW_CAP_MS || gap < 0 ? VIEW_TAIL_MS : gap;
      const d = dwell.get(views[k].path) ?? { ms: 0, n: 0 };
      d.ms += ms; d.n += 1;
      dwell.set(views[k].path, d);
    }

    return {
      dwell: [...dwell.entries()].sort((a, b) => b[1].ms - a[1].ms),
      dwellTotal: [...dwell.values()].reduce((s, d) => s + d.ms, 0),
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
      if (isMiss(r.status)) misses.set(r.item, (misses.get(r.item) ?? 0) + 1);
      if (r.latencyMs !== null) { latencySum += r.latencyMs; latencyN += 1; }
    }
    const total = detail.responses.length;
    const good = byStatus.get("met") ?? 0;
    return {
      total, byStatus,
      accuracy: total > 0 ? Math.round((good / total) * 100) : null,
      avgLatency: latencyN > 0 ? Math.round(latencySum / latencyN) : null,
    };
  }, [detail]);

  const hardestRows = useMemo(() => (detail ? outcomeRows(detail.responses).filter((r) => r.missed > 0) : []), [detail]);

  // ── Exercise identity (2026-07-20, Dan: "merge some info — I cannot see
  // the results of the individual exercises anymore") ─────────────────────
  // Legacy route renames live in @/lib/labels now, so /moi and the teacher
  // page can no longer drift apart about what July was called.
  const normActivity = (id: string | null | undefined): string =>
    id ? normalizePath(id) : "(unlabelled)";
  // "/practice/speculearn/aliments" → "SpecuLearn · SIO-039 · Aliments".
  // The SIO is the point (Dan, 2026-08-10: "very hard to trace back what is
  // what later"); the raw id stays as the link target.
  const labelActivity = (norm: string): string => describeActivity(norm).label;

  // Every reference should be a road (Dan, 2026-07-21: "I am going to need
  // links at wherever there can be links — I am very lost"). A normalized
  // activity key IS a destination: paths link to themselves, prefix keys map
  // to their activity's home page.
  // Hardest ITEMS used to need their own resolver here; since patch 26 the
  // hardest table is outcome rows, and an outcome links to its Index row.
  const hrefFor = (key: string): string | null => hrefForActivity(key);
  const ExLink = ({ k, label }: { k: string; label: string }) => {
    const href = hrefFor(k);
    return href
      ? <a href={href} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{label}</a>
      : <>{label}</>;
  };

  // ── Results by exercise: EVERY response, grouped (not just the last 15) ──
  const byExercise = useMemo(() => {
    if (!detail) return null;
    type G = { key: string; label: string; n: number; ok: number; missed: number; last: number };
    const m = new Map<string, G>();
    for (const r of detail.responses) {
      const key = normActivity(r.activityId);
      let g = m.get(key);
      if (!g) m.set(key, (g = { key, label: labelActivity(key), n: 0, ok: 0, missed: 0, last: 0 }));
      g.n += 1;
      if (isMiss(r.status)) g.missed += 1;
      else g.ok += 1;
      const t = r.ts?.getTime() ?? 0;
      if (t > g.last) g.last = t;
    }
    return [...m.values()].sort((a, b) => b.last - a.last);
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
        aria-label="Close"
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

      {/* Own group: the modal's expand/collapse-all is its own, not the
          roster page's (a nested provider wins for its children). */}
      <SectionGroup>

      {detail && (
        <>
          {/* The syllabus heat-strip (patch 26): this learner's accuracy on
              every outcome, one glance. The same component /moi shows them. */}
          <HeatStrip className="mt-3" values={outcomeAccuracy(detail.responses)} done={new Set(p?.doneSios ?? [])} label={`${learner.name} — accuracy by outcome`} />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            <Kpi label="XP" value={p?.xp ?? learner.board?.xp ?? 0} />
            <Kpi label="Gems" value={p?.gems ?? learner.board?.gems ?? 0} />
            <Kpi label="Streak" value={p?.streak ?? learner.board?.streak ?? 0} />
            <Kpi label="SIOs done" value={p?.doneSios?.length ?? 0} sub={`of ${SIOS.length}`} />
            <Kpi label="Badges" value={p?.badges?.length ?? 0} />
            <Kpi label="SRS items" value={srsIds.length} sub={`${srsDue} due now`} />
            <Kpi label="Answers" value={detail.responses.length} sub="recorded" />
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
              const good = !isMiss(r.status);
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
              <Section
                id="sp:xp"
                title="XP audit"
                meta={<span className={`font-black ${syncOk && floorOk ? "text-emerald-700" : "text-rose-600"}`}>{syncOk && floorOk ? "✓ in sync, above floor" : "⚠️ check"}</span>}
              >
              <div className={`mt-2 rounded-xl border-2 p-3 text-sm ${syncOk && floorOk ? "border-emerald-300 bg-emerald-50/60" : "border-rose-300 bg-rose-50/60"}`}>
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
              </Section>
            );
          })()}

          {respStats && respStats.total > 0 && (
            <>
              <Section
                id="sp:responses"
                title="Item responses"
                meta={`${respStats.total} answers${respStats.accuracy !== null ? ` · ${respStats.accuracy}% accuracy` : ""}`}
              >
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi label="Responses" value={respStats.total} />
                <Kpi label="Accuracy" value={respStats.accuracy !== null ? `${respStats.accuracy}%` : "—"} sub="met / all" />
                <Kpi label="Avg response time" value={respStats.avgLatency !== null ? `${(respStats.avgLatency / 1000).toFixed(1)} s` : "—"} />
                <Kpi
                  label="Status split"
                  value={
                    <span className="text-sm font-bold">
                      {["met", "missed"]
                        .map((s) => `${s} ${respStats.byStatus.get(s) ?? 0}`)
                        .join(" · ")}
                    </span>
                  }
                />
              </div>
              </Section>
              {/* Outcome rows, items nested (patch 26) — the same fold /moi
                  shows the learner, so teacher and student read one picture:
                  which OUTCOME bleeds, then which words inside it. */}
              {hardestRows.length > 0 && (
                <Section id="sp:hardest" title="Hardest outcomes" meta={`${hardestRows.length} outcomes · ${hardestRows[0].missed} misses at worst`}>
                  <TableBox head={["Outcome", "Score", "Weak / seen", "Misses", "Items"]}>
                    {hardestRows.map((r) => (
                      <tr key={r.sio} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-bold text-slate-900" title={r.sio === UNMAPPED ? "Answers whose item is in no outcome" : `${r.sio} · ${r.topic}`}>
                          {r.sio === UNMAPPED ? <span className="text-slate-500">Not yet mapped</span> : <a href={`/activities?unit=${r.unit}#${r.sio}`} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900"><span className="fluo-mono text-xs text-slate-500">U{r.unit}·{r.num}</span> {r.short}</a>}
                        </td>
                        <td className={`px-3 py-2 text-right font-black ${tierClass(r.pct)}`}>{r.pct}%</td>
                        <td className="px-3 py-2 text-right text-slate-700">{r.weakItems} / {r.itemsSeen}</td>
                        <td className="px-3 py-2 text-right font-black text-rose-600">{r.missed}</td>
                        <td className="px-3 py-2 text-slate-700" lang="fr">
                          {r.items.slice(0, 6).map((it) => (
                            <span key={it.item} className="mr-2 inline-block whitespace-nowrap" title={`${it.item} · ${it.missed} of ${it.n} missed`}>{it.label} <b className="text-rose-600">✗{it.missed}</b></span>
                          ))}
                          {r.items.length > 6 && <span className="text-xs text-slate-500">+{r.items.length - 6}</span>}
                        </td>
                      </tr>
                    ))}
                  </TableBox>
                </Section>
              )}
              <Section id="sp:byexercise" title="Results by exercise" meta={`${(byExercise ?? []).length} exercises`}>
              <TableBox head={["Exercise", "Answers", "✓ ok", "✗ missed", "Last done"]}>
                {(byExercise ?? []).map((g, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-bold text-slate-900"><ExLink k={g.key} label={g.label} /></td>
                    <td className="px-3 py-2 text-right text-slate-700">{g.n}</td>
                    <td className="px-3 py-2 text-right font-bold text-emerald-700">{g.ok}</td>
                    <td className="px-3 py-2 text-right font-bold text-rose-600">{g.missed}</td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{g.last ? fmtWhen(new Date(g.last)) : "—"}</td>
                  </tr>
                ))}
              </TableBox>
              </Section>
              <Section id="sp:recent" title="Recent answers" meta={`last ${Math.min(15, detail.responses.length)} of ${detail.responses.length}`}>
              <TableBox head={["When", "Item", "Lesson", "Status", "Given answer", "Activity", "Evidence", "Time"]}>
                {detail.responses.slice(0, 15).map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{fmtWhen(r.ts)}</td>
                    <td className="px-3 py-2 font-bold text-slate-900" lang="fr">{r.item}</td>
                    {/* Item ids do NOT reliably encode their outcome: after the
                        2026-07-14 re-cut the pretest files kept their old names,
                        so u4-sio045-01 is SIO-043 content. Resolved through the
                        join table, never by parsing the id. Read-time, so all
                        10,623 historical responses gain a label with no
, since the collection
                        is append-only. */}
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">
                      {(() => {
                        // What the writer stored first (evidence block), the join second.
                        const sio = outcomeOf(r);
                        if (!sio) return <span className="text-slate-400">-</span>;
                        const topic = SIOS.find((s) => s.id === sio)?.topic;
                        return <span title={topic ?? sio}>{sio}{topic ? ` \u00b7 ${topic.slice(0, 28)}` : ""}</span>;
                      })()}
                    </td>
                    <td className={`px-3 py-2 font-bold ${isMiss(r.status) ? "text-rose-600" : "text-emerald-700"}`}>
                      {r.status}
                    </td>
                    <td className="px-3 py-2 text-slate-700" lang="fr">{r.givenAnswer ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{r.activityId ? <ExLink k={normActivity(r.activityId)} label={labelActivity(normActivity(r.activityId))} /> : "—"}</td>
                    {/* The evidence block (PRD §7): kind of performance and how
                        much help was taken. Absent on rows older than 10 Aug =
                        "not recorded", never "none". */}
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap" title={r.independent === false ? "assisted — does not count as independent mastery" : undefined}>
                      {r.evidenceType ? `${r.evidenceType}${r.assistance && r.assistance !== "none" ? ` · 🪜 ${r.assistance}` : ""}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-700">
                      {r.latencyMs !== null ? `${(r.latencyMs / 1000).toFixed(1)} s` : "—"}
                    </td>
                  </tr>
                ))}
              </TableBox>
              </Section>
            </>
          )}
          {respStats && respStats.total === 0 && (
            <p className="mt-4 text-sm text-slate-500">No item-level responses recorded for this learner yet.</p>
          )}

          {trail.dwell.length > 0 && (
            <Section
              id="sp:time"
              title="Time on task"
              meta={`~${fmtDuration(trail.dwellTotal)} estimated`}
            >
              {/* Page-view dwell is the ONLY time source (D6 closed 2026-08-17:
                  users/{uid}/sessions had no writer, so its reader is gone). */}
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi label="Est. from page views" value={fmtDuration(trail.dwellTotal)} sub={`${trail.dwell.length} activities`} />
              </div>
              {trail.dwell.length > 0 ? (
                <>
                  <p className="mt-3 text-xs text-slate-500">
                    Estimated from page views — time between one view and the next, ignoring gaps over 30 minutes
                    (tab left open). An estimate, not a measurement.
                  </p>
                  <TableBox head={["Activity", "Views", "Est. time"]}>
                    {trail.dwell.map(([path, d]) => (
                      <tr key={path} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-bold text-slate-900" title={titleFor(path)}>{describePath(path).label}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{d.n}</td>
                        <td className="px-3 py-2 text-right text-slate-700">{fmtDuration(d.ms)}</td>
                      </tr>
                    ))}
                  </TableBox>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No page views recorded for this learner, so there is no activity split — visit tracking shipped
                  13 Jul 2026.
                </p>
              )}
            </Section>
          )}
        </>
      )}

      <Section id="sp:pages" title="Pages visited" meta={`${trail.topPages.length} pages`}>
      {trail.topPages.length > 0 ? (
        <TableBox head={["Page", "Views"]}>
          {trail.topPages.map(([path, n]) => (
            <tr key={path} className="border-t border-slate-100">
              <td className="px-3 py-2 font-bold text-slate-900 break-all"><a href={path} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900" title={titleFor(path)}>{describePath(path).label}</a></td>
              <td className="px-3 py-2 text-right text-slate-700">{n}</td>
            </tr>
          ))}
        </TableBox>
      ) : (
        <p className="mt-2 text-sm text-slate-500">No page views yet (visit tracking shipped 13 Jul 2026; earlier visits were never recorded).</p>
      )}
      </Section>

      {(trail.games.length > 0 || trail.answers > 0 || trail.supAnswers > 0 || trail.tutorMsgs > 0) && (
        <>
          <Section
            id="sp:games"
            title="Games, pretests & more"
            meta={`${trail.games.length} games · ${trail.answers} pretest answers · ${trail.tutorMsgs} tutor messages`}
          >
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
                  <td className="px-3 py-2 font-bold text-slate-900" title={game}>{describeGame(game).label}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{g.plays}</td>
                  <td className="px-3 py-2 text-right text-slate-700">{g.best ?? "—"}</td>
                </tr>
              ))}
            </TableBox>
          )}
          </Section>
          {trail.tutorRecent.length > 0 && (
            <Section id="sp:tutor" title="Recent tutor messages" meta={`last ${trail.tutorRecent.length} of ${trail.tutorMsgs}`}>
              <TableBox head={["When", "Message"]}>
                {trail.tutorRecent.map((m, i) => (
                  <tr key={i} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{fmtWhen(m.ts)}</td>
                    <td className="px-3 py-2 text-slate-900">{m.text}</td>
                  </tr>
                ))}
              </TableBox>
            </Section>
          )}
        </>
      )}
      </SectionGroup>
    </div>
    </div>
  );
}
