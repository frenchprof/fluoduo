"use client";

/** Class-at-a-glance: activity KPIs, a recent-days rhythm table, most-visited
 *  pages, and the XP top 10. Teacher accounts are excluded from every count
 *  so Dan's own browsing never inflates the class picture. */

import { useMemo, useState } from "react";
import { type Ev, type Learner, SG_DAY_KEY, SG_DAY_LABEL, str } from "./data";
import { Kpi, TableBox, Section, SectionGroup } from "./ui";

const DAYS_SHOWN = 14;

export default function Overview({ events, roster, includeTeachers, onStudent }: { events: Ev[]; roster: Learner[]; includeTeachers?: boolean; onStudent?: (uid: string) => void }) {
  // Per-day drill-down (Dan, 2026-07-22: "we can always [make] a page for
  // it, don't tell me you are not capable of something liddat"). A day IS a
  // page now: tap the row, get that day's pages, people, games, pretests.
  const [dayOpen, setDayOpen] = useState<string | null>(null);
  const model = useMemo(() => {
    const students = roster.filter((l) => includeTeachers || !l.isTeacher);
    const uids = new Set(students.map((s) => s.uid));
    const evs = events.filter((e) => uids.has(e.uid) && e.ts);

    const todayKey = SG_DAY_KEY.format(new Date());
    const weekAgo = Date.now() - 7 * 86400000;
    const activeToday = new Set<string>();
    const active7d = new Set<string>();
    let views7d = 0;
    let plays7d = 0;
    let answers7d = 0;
    let correct7d = 0;
    const pages7d = new Map<string, Set<string>>();
    const byDay = new Map<string, { people: Set<string>; views: number; plays: number; answers: number }>();
    const labels = new Map<string, string>();

    for (const ev of evs) {
      const ts = ev.ts as Date;
      const dayKey = SG_DAY_KEY.format(ts);
      if (!labels.has(dayKey)) labels.set(dayKey, SG_DAY_LABEL.format(ts));
      let day = byDay.get(dayKey);
      if (!day) byDay.set(dayKey, (day = { people: new Set(), views: 0, plays: 0, answers: 0 }));
      day.people.add(ev.uid);
      if (dayKey === todayKey) activeToday.add(ev.uid);
      const recent = ts.getTime() >= weekAgo;
      if (recent) active7d.add(ev.uid);
      if (ev.type === "page.view" || ev.type === "supplement.open") {
        day.views += 1;
        if (recent) {
          views7d += 1;
          const path = str(ev.payload.path) ?? str(ev.payload.href);
          if (path) {
            let set = pages7d.get(path);
            if (!set) pages7d.set(path, (set = new Set()));
            set.add(ev.uid);
          }
        }
      }
      if (ev.type === "game.start") {
        day.plays += 1;
        if (recent) plays7d += 1;
      }
      if (ev.type === "pretest.answer") {
        day.answers += 1;
        if (recent) {
          answers7d += 1;
          if (ev.payload.correct === true) correct7d += 1;
        }
      }
    }

    const days = [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, DAYS_SHOWN)
      .map(([key, d]) => ({ key, label: labels.get(key) ?? key, ...d, peopleCount: d.people.size }));
    const topPages = [...pages7d.entries()]
      .map(([path, people]) => ({ path, people: people.size }))
      .sort((a, b) => b.people - a.people || a.path.localeCompare(b.path))
      .slice(0, 10);
    const topXp = students
      .filter((s) => s.board)
      .sort((a, b) => (b.board?.xp ?? 0) - (a.board?.xp ?? 0))
      .slice(0, 10);

    // Board vs events reconciliation (Dan, 2026-07-17: "why is the number of
    // students not the same between the leaderboard and the learners ever
    // seen"): the two count different populations — a board row needs a
    // signed-in XP sync (any time, incl. the old laf1201 era); "seen" needs
    // an event, and events only exist since 13 Jul. Name the odd ones out.
    const onBoard = students.filter((st) => st.board);
    const seen = students.filter((st) => st.lastSeen !== null);
    const boardOnly = onBoard.filter((st) => st.lastSeen === null).map((st) => st.name);
    const eventsOnly = seen.filter((st) => !st.board).map((st) => st.name);

    return { students, activeToday, active7d, views7d, plays7d, answers7d, correct7d, days, topPages, topXp,
             onBoard: onBoard.length, seen: seen.length, boardOnly, eventsOnly };
  }, [events, roster, includeTeachers]);

  return (
    <div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Learners" value={model.students.length} sub="ever seen" />
        <Kpi label="Active today" value={model.activeToday.size} />
        <Kpi label="Active, 7 days" value={model.active7d.size} />
        <Kpi label="Page views, 7 days" value={model.views7d} />
        <Kpi label="Games started, 7 days" value={model.plays7d} />
        <Kpi
          label="Pretest answers, 7 days"
          value={model.answers7d}
          sub={model.answers7d > 0 ? `${Math.round((model.correct7d / model.answers7d) * 100)}% correct` : undefined}
        />
      </div>
      {/* Why "Learners" ≠ the leaderboard count — the odd ones out, named. */}
      <p className="mt-2 text-xs text-slate-500">
        {model.onBoard} with a leaderboard row · {model.seen} seen in events (tracking began 13 Jul).
        {model.boardOnly.length > 0 && (
          <> On the board but never seen since tracking: <b>{model.boardOnly.slice(0, 8).join(", ")}{model.boardOnly.length > 8 ? ` +${model.boardOnly.length - 8}` : ""}</b>.</>
        )}
        {model.eventsOnly.length > 0 && (
          <> Seen but not on the board (XP never synced): <b>{model.eventsOnly.slice(0, 8).join(", ")}{model.eventsOnly.length > 8 ? ` +${model.eventsOnly.length - 8}` : ""}</b>.</>
        )}
      </p>

      <SectionGroup>
        <Section id="ov:days" title="Day by day" meta={`last ${model.days.length} day${model.days.length === 1 ? "" : "s"}`}>
          <TableBox head={["Day", "Learners", "Page views", "Games", "Pretest answers"]}>
            {model.days.map((d) => (
              <tr key={d.key} className="border-t border-slate-100">
                <td className="px-3 py-2"><button type="button" onClick={() => setDayOpen(d.key)} className="text-left font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{d.label}</button></td>
                <td className="px-3 py-2 text-right font-black text-slate-900">{d.peopleCount}</td>
                <td className="px-3 py-2 text-right text-slate-700">{d.views}</td>
                <td className="px-3 py-2 text-right text-slate-700">{d.plays}</td>
                <td className="px-3 py-2 text-right text-slate-700">{d.answers}</td>
              </tr>
            ))}
            {model.days.length === 0 && (
              <tr><td className="px-3 py-3 text-slate-500" colSpan={5}>No student activity recorded yet.</td></tr>
            )}
          </TableBox>
        </Section>

        <Section id="ov:pages" title="Most visited pages, last 7 days" meta={`${model.topPages.length} pages`}>
          <TableBox head={["Page", "People"]}>
            {model.topPages.map((p) => (
              <tr key={p.path} className="border-t border-slate-100">
                <td className="px-3 py-2 break-all"><a href={p.path} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{p.path}</a></td>
                <td className="px-3 py-2 text-right font-black text-slate-900">{p.people}</td>
              </tr>
            ))}
            {model.topPages.length === 0 && (
              <tr><td className="px-3 py-3 text-slate-500" colSpan={2}>No page views in the last 7 days.</td></tr>
            )}
          </TableBox>
        </Section>

        <Section id="ov:xp" title="XP top 10" meta={model.topXp.length > 0 ? `top ${model.topXp[0].board?.xp ?? 0} XP` : "nobody yet"}>
          <TableBox head={["Learner", "XP", "Level", "Streak", "Gems"]}>
            {model.topXp.map((s) => (
              <tr key={s.uid} className="border-t border-slate-100">
                <td className="px-3 py-2"><button type="button" onClick={() => onStudent?.(s.uid)} className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{s.board?.name ?? s.name}</button></td>
                <td className="px-3 py-2 text-right font-black text-slate-900">{s.board?.xp ?? 0}</td>
                <td className="px-3 py-2 text-right text-slate-700">{s.board?.level ?? 1}</td>
                <td className="px-3 py-2 text-right text-slate-700">{s.board?.streak ?? 0}</td>
                <td className="px-3 py-2 text-right text-slate-700">{s.board?.gems ?? 0}</td>
              </tr>
            ))}
            {model.topXp.length === 0 && (
              <tr><td className="px-3 py-3 text-slate-500" colSpan={5}>Nobody on the leaderboard yet.</td></tr>
            )}
          </TableBox>
        </Section>
      </SectionGroup>
      {dayOpen && (() => {
        const dayEvents = events.filter((e) => e.ts && SG_DAY_KEY.format(e.ts) === dayOpen);
        const pages = new Map<string, { views: number; people: Set<string> }>();
        const people = new Map<string, number>();
        const games = new Map<string, number>();
        let pretests = 0;
        for (const ev of dayEvents) {
          people.set(ev.uid, (people.get(ev.uid) ?? 0) + 1);
          if (ev.type === "page.view") {
            const path = String((ev.payload as { path?: unknown })?.path ?? "");
            if (path) {
              let p = pages.get(path);
              if (!p) pages.set(path, (p = { views: 0, people: new Set() }));
              p.views += 1; p.people.add(ev.uid);
            }
          } else if (ev.type === "game.start") {
            const g = String((ev.payload as { game?: unknown })?.game ?? "?");
            games.set(g, (games.get(g) ?? 0) + 1);
          } else if (ev.type === "pretest.answer") pretests += 1;
        }
        const nameOf = (uid: string) => roster.find((l) => l.uid === uid)?.name ?? uid.slice(0, 8);
        const label = model.days.find((d) => d.key === dayOpen)?.label ?? dayOpen;
        return (
          <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4" onClick={() => setDayOpen(null)}>
            <div className="mt-8 w-full max-w-2xl rounded-2xl border-[3px] border-slate-900 bg-white p-5 shadow-[4px_4px_0_#1f2440]" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900">{label}</h3>
                <button type="button" onClick={() => setDayOpen(null)} className="rounded-full border-2 border-slate-300 px-2.5 py-0.5 font-bold text-slate-600">✕</button>
              </div>
              <p className="mt-1 text-sm text-slate-500">{people.size} learners · {dayEvents.length} events · {pretests} pretest answers</p>
              <h4 className="mt-4 text-sm font-black uppercase tracking-wide text-slate-500">Pages that day</h4>
              {pages.size > 0 ? (
                <table className="mt-1 w-full text-sm"><tbody>
                  {[...pages.entries()].sort((a, b) => b[1].views - a[1].views).map(([path, p]) => (
                    <tr key={path} className="border-t border-slate-100">
                      <td className="px-2 py-1.5 break-all"><a href={path} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{path}</a></td>
                      <td className="px-2 py-1.5 text-right text-slate-700">{p.views} views · {p.people.size} 👤</td>
                    </tr>
                  ))}
                </tbody></table>
              ) : <p className="mt-1 text-sm text-slate-500">No page views recorded that day.</p>}
              <h4 className="mt-4 text-sm font-black uppercase tracking-wide text-slate-500">Who was here</h4>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {[...people.entries()].sort((a, b) => b[1] - a[1]).map(([uid, n]) => (
                  <button key={uid} type="button" onClick={() => onStudent?.(uid)}
                    className="rounded-full border-2 border-slate-200 bg-slate-50 px-2.5 py-0.5 text-sm font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">
                    {nameOf(uid)} <span className="font-normal text-slate-500">·{n}</span>
                  </button>
                ))}
              </div>
              {games.size > 0 && (
                <>
                  <h4 className="mt-4 text-sm font-black uppercase tracking-wide text-slate-500">Games started</h4>
                  <p className="mt-1 text-sm text-slate-700">{[...games.entries()].map(([g, n]) => `${g} ×${n}`).join(" · ")}</p>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
