"use client";

/** Day × page → unique visitors (Dan, 2026-07-13: "how many people was on
 *  which page on which days"). page.view covers every in-app route change;
 *  supplement.open stands in for the standalone supplement HTML (logged at
 *  the deck-flap door). Teacher accounts are excluded. */

import { useMemo } from "react";
import { type Ev, type Learner, SG_DAY_KEY, SG_DAY_LABEL, str } from "./data";
import { TableBox } from "./ui";

const MAX_DAYS_SHOWN = 30;

export default function Attendance({ events, roster, includeTeachers = false }: { events: Ev[]; roster: Learner[]; includeTeachers?: boolean }) {
  const days = useMemo(() => {
    const teachers = new Set(includeTeachers ? [] : roster.filter((l) => l.isTeacher).flatMap((l) => l.uids));
    const nameOf = new Map(roster.flatMap((l) => l.uids.map((u) => [u, l.name] as const)));
    // day → path → uids
    const byDay = new Map<string, Map<string, { people: Set<string>; views: number }>>();
    const labels = new Map<string, string>();
    for (const ev of events) {
      if (ev.type !== "page.view" && ev.type !== "supplement.open") continue;
      if (!ev.ts || teachers.has(ev.uid)) continue;
      const path = str(ev.payload.path) ?? str(ev.payload.href);
      if (!path) continue;
      const dayKey = SG_DAY_KEY.format(ev.ts);
      if (!labels.has(dayKey)) labels.set(dayKey, SG_DAY_LABEL.format(ev.ts));
      let pages = byDay.get(dayKey);
      if (!pages) byDay.set(dayKey, (pages = new Map()));
      let agg = pages.get(path);
      if (!agg) pages.set(path, (agg = { people: new Set(), views: 0 }));
      agg.views += 1;
      agg.people.add(ev.uid);
    }
    return [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, MAX_DAYS_SHOWN)
      .map(([dayKey, pages]) => ({
        dayKey,
        dayLabel: labels.get(dayKey) ?? dayKey,
        pages: [...pages.entries()]
          .map(([path, a]) => ({
            path,
            people: a.people.size,
            views: a.views,
            names: [...new Set([...a.people].map((uid) => nameOf.get(uid) ?? uid.slice(0, 8)))].sort((x, y) =>
              x.localeCompare(y),
            ),
          }))
          .sort((x, y) => y.people - x.people || y.views - x.views || x.path.localeCompare(y.path)),
      }));
  }, [events, roster, includeTeachers]);

  if (days.length === 0) {
    return (
      <p className="mt-3 text-sm text-slate-500">
        No visits recorded yet. Visit tracking shipped on 13 Jul 2026 — anything earlier was never recorded, and anonymous (signed-out) visitors never are.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-8">
      {days.map((day) => (
        <section key={day.dayKey}>
          <h2 className="text-lg font-black text-slate-900">{day.dayLabel}</h2>
          <TableBox head={["Page", "People", "Views", "Who"]}>
            {day.pages.map((row) => (
              <tr key={row.path} className="border-t border-slate-100 align-top">
                <td className="px-3 py-2 break-all"><a href={row.path} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900">{row.path}</a></td>
                <td className="px-3 py-2 text-right font-black text-slate-900">{row.people}</td>
                <td className="px-3 py-2 text-right text-slate-700">{row.views}</td>
                <td className="px-3 py-2 text-slate-700">{row.names.join(" · ")}</td>
              </tr>
            ))}
          </TableBox>
        </section>
      ))}
    </div>
  );
}
