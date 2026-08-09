"use client";

/** Day × page → unique visitors (Dan, 2026-07-13: "how many people was on
 *  which page on which days"). page.view covers every in-app route change;
 *  supplement.open stands in for the standalone supplement HTML (logged at
 *  the deck-flap door). Teacher accounts are excluded. Each day is a
 *  collapsible section, and the days sort by turnout as well as by date
 *  (Dan, 2026-07-28). */

import { useMemo } from "react";
import { type Ev, type Learner, SG_DAY_KEY, SG_DAY_LABEL, str } from "./data";
import { Section, SectionGroup, TableBox, useSortedSections, type SortOption } from "./ui";
import { describePath, titleFor } from "@/lib/labels";

const MAX_DAYS_SHOWN = 30;

type Day = {
  dayKey: string;
  dayLabel: string;
  people: number;
  views: number;
  pages: { path: string; people: number; views: number; names: string[] }[];
};

const SORTS: SortOption<Day>[] = [
  { key: "day", label: "Day", val: (d) => d.dayKey },
  { key: "people", label: "People", val: (d) => d.people },
  { key: "views", label: "Views", val: (d) => d.views },
  { key: "pages", label: "Pages", val: (d) => d.pages.length },
];

export default function Attendance({ events, roster, includeTeachers = false }: { events: Ev[]; roster: Learner[]; includeTeachers?: boolean }) {
  const { days, hiddenByFilter } = useMemo(() => {
    const teachers = new Set(includeTeachers ? [] : roster.filter((l) => l.isTeacher).flatMap((l) => l.uids));
    // Counted so an empty table can name its own cause: "nothing recorded" and
    // "all of it belongs to a teacher account" look identical otherwise, and
    // the teacher filter is on by default.
    let hiddenByFilter = 0;
    const nameOf = new Map(roster.flatMap((l) => l.uids.map((u) => [u, l.name] as const)));
    // day → path → uids
    const byDay = new Map<string, Map<string, { people: Set<string>; views: number }>>();
    const labels = new Map<string, string>();
    for (const ev of events) {
      if (ev.type !== "page.view" && ev.type !== "supplement.open") continue;
      if (!ev.ts) continue;
      if (teachers.has(ev.uid)) {
        hiddenByFilter += 1;
        continue;
      }
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
    const days = [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, MAX_DAYS_SHOWN)
      .map(([dayKey, pages]): Day => {
        const everyone = new Set<string>();
        let views = 0;
        for (const a of pages.values()) {
          for (const uid of a.people) everyone.add(uid);
          views += a.views;
        }
        return {
          dayKey,
          dayLabel: labels.get(dayKey) ?? dayKey,
          people: everyone.size,
          views,
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
        };
      });
    return { days, hiddenByFilter };
  }, [events, roster, includeTeachers]);

  const { sorted, bar } = useSortedSections(days, SORTS);

  if (days.length === 0) {
    return (
      <div className="mt-3 space-y-2 text-sm text-slate-500">
        {hiddenByFilter > 0 ? (
          <p className="font-bold text-amber-700">
            {hiddenByFilter} visits are hidden by the “include teacher accounts” tick-box above — every visit loaded belongs to a
            teacher account. Tick it to see them.
          </p>
        ) : (
          <p>No student visits in the events loaded.</p>
        )}
        <p>
          Visit tracking shipped on 13 Jul 2026 — anything earlier was never recorded, and anonymous (signed-out) visitors never
          are, so browsing before signing in leaves no trace. The event count in the bar above says whether writes are landing at
          all.
        </p>
      </div>
    );
  }

  return (
    <SectionGroup>
      {bar}
      {sorted.map((day) => (
        <Section
          key={day.dayKey}
          id={`att:${day.dayKey}`}
          title={day.dayLabel}
          meta={`${day.people} people · ${day.views} views · ${day.pages.length} pages`}
        >
          <TableBox head={["Page", "People", "Views", "Who"]}>
            {day.pages.map((row) => (
              <tr key={row.path} className="border-t border-slate-100 align-top">
                <td className="px-3 py-2 break-all"><a href={row.path} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline underline-offset-2 hover:text-blue-900" title={titleFor(row.path)}>{describePath(row.path).label}</a></td>
                <td className="px-3 py-2 text-right font-black text-slate-900">{row.people}</td>
                <td className="px-3 py-2 text-right text-slate-700">{row.views}</td>
                <td className="px-3 py-2 text-slate-700">{row.names.join(" · ")}</td>
              </tr>
            ))}
          </TableBox>
        </Section>
      ))}
    </SectionGroup>
  );
}
