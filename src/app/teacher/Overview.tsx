"use client";

/** Class-at-a-glance: activity KPIs, a recent-days rhythm table, most-visited
 *  pages, and the XP top 10. Teacher accounts are excluded from every count
 *  so Dan's own browsing never inflates the class picture. */

import { useMemo } from "react";
import { type Ev, type Learner, SG_DAY_KEY, SG_DAY_LABEL, str } from "./data";
import { Kpi, TableBox, SectionTitle } from "./ui";

const DAYS_SHOWN = 14;

export default function Overview({ events, roster, includeTeachers = false }: { events: Ev[]; roster: Learner[]; includeTeachers?: boolean }) {
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

    return { students, activeToday, active7d, views7d, plays7d, answers7d, correct7d, days, topPages, topXp };
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

      <SectionTitle>Day by day</SectionTitle>
      <TableBox head={["Day", "Learners", "Page views", "Games", "Pretest answers"]}>
        {model.days.map((d) => (
          <tr key={d.key} className="border-t border-slate-100">
            <td className="px-3 py-2 font-bold text-slate-900">{d.label}</td>
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

      <SectionTitle>Most visited pages, last 7 days</SectionTitle>
      <TableBox head={["Page", "People"]}>
        {model.topPages.map((p) => (
          <tr key={p.path} className="border-t border-slate-100">
            <td className="px-3 py-2 font-bold text-slate-900 break-all">{p.path}</td>
            <td className="px-3 py-2 text-right font-black text-slate-900">{p.people}</td>
          </tr>
        ))}
        {model.topPages.length === 0 && (
          <tr><td className="px-3 py-3 text-slate-500" colSpan={2}>No page views in the last 7 days.</td></tr>
        )}
      </TableBox>

      <SectionTitle>XP top 10</SectionTitle>
      <TableBox head={["Learner", "XP", "Level", "Streak", "Gems"]}>
        {model.topXp.map((s) => (
          <tr key={s.uid} className="border-t border-slate-100">
            <td className="px-3 py-2 font-bold text-slate-900">{s.board?.name ?? s.name}</td>
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
    </div>
  );
}
