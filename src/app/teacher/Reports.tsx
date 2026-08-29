"use client";

/** Reports — four report cards (mockup §2a: "Report cards, no accordions").
 *  Each card is a headline number and its CSV; the drill-down IS the export,
 *  so nothing here expands. The analytics-summary export moved here from the
 *  Students tab's accordion — same UIDs, same rows. */

import { useMemo, useState } from "react";
import { type Ev, type Learner, type StudentDetail, fetchStudentDetail, fmtWhen, str, SG_DAY_KEY, SG_DAY_LABEL } from "./data";
import { pretestTitle } from "./Pretests";

/** A student must have shown up on this many separate days to leave card 1. */
const DAYS_EXPECTED = 5;

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function downloadCsv(stem: string, lines: string[]) {
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `fluolingo-${stem}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** UID-keyed class list for the analytics summary (Dan's Auth-console
 *  reconciliation, 2026-07-25; moved from Students.tsx 2026-08-11). Inner
 *  arrays are one person's aliased accounts. Opaque uids only — this chunk is
 *  on a public CDN; names/emails come from Firestore behind isAdmin(). */
const CLASS_UIDS: string[][] = [
  ["8IcpkURn0ldOXLiApCdhdsqQoxW2", "ZKvLZyfOfLZFYAEUoTzApQMYClf2"],
  ["1S70OPFAAVPEsu6vOr8JZdk2U022"],
  ["C2sWIzLKdseHKUxgh67yPp3o7Rq1"],
  ["k1sTtpYd4ZXCFKYQU4OiBA4dD4l1", "6uyQO9YgBTRLC5Dw1JuU7Fe2cTB3"],
  ["pyjnl9OaQcO8L2BXDWEFsfEB9kq2"],
  ["JgMNsLKm2MNHWQwvNvRJJQRqc523"],
  ["OwiJwWynkrh0xqHgUWrjEJFqjVF3"],
  ["z60kqOZYZONTswgvhEJIZ4zWmLY2"],
  ["yzb1vTPlhIbxgqwTy21wVUYRudr1"],
  ["iPWnxPgkzieTfJex4Z2Gtu0mfHR2"],
  ["a529sUZMsYUgKdWn4rJXvPu4A6V2"],
  ["EkOHxvkcbOeb71CnIviR1RaON7L2"],
  ["kBwnJxptXQPVbbE22eEdFm0yDqw2"],
  ["Sn8AsHunJEbYcyLEedtWYZUODI73"],
  ["zLoCjj7H7ubON34tl2u1N7y8c7b2"],
  ["kQVWo2UmsoZrFhQvThBWeRS1nN03"],
];

export default function Reports({ events, roster, includeTeachers = false, details }: { events: Ev[]; roster: Learner[]; includeTeachers?: boolean; details?: Map<string, StudentDetail> }) {
  const model = useMemo(() => {
    const students = roster.filter((l) => includeTeachers || !l.isTeacher);
    const uids = new Set(students.flatMap((s) => s.uids));
    const evs = events.filter((e) => uids.has(e.uid));

    const behind = students
      .filter((s) => s.daysActive < DAYS_EXPECTED)
      .sort((a, b) => a.daysActive - b.daysActive || a.name.localeCompare(b.name));

    // Accuracy per pretest (the item groups the class answers as a class) —
    // the same stream the Pretests tab reads, summed instead of itemised.
    const groups = new Map<string, { answers: number; correct: number }>();
    let answers = 0;
    let correct = 0;
    for (const ev of evs) {
      if (ev.type !== "pretest.answer") continue;
      const id = str(ev.payload.pretestId);
      if (!id) continue;
      let g = groups.get(id);
      if (!g) groups.set(id, (g = { answers: 0, correct: 0 }));
      g.answers += 1;
      answers += 1;
      if (ev.payload.correct === true) {
        g.correct += 1;
        correct += 1;
      }
    }

    // Whole history, unlike Overview's 14-day window — a report is the record.
    const byDay = new Map<string, { people: Set<string>; views: number; plays: number; answers: number }>();
    const labels = new Map<string, string>();
    for (const ev of evs) {
      if (!ev.ts) continue;
      const key = SG_DAY_KEY.format(ev.ts);
      if (!labels.has(key)) labels.set(key, SG_DAY_LABEL.format(ev.ts));
      let d = byDay.get(key);
      if (!d) byDay.set(key, (d = { people: new Set(), views: 0, plays: 0, answers: 0 }));
      d.people.add(ev.uid);
      if (ev.type === "page.view" || ev.type === "supplement.open") d.views += 1;
      if (ev.type === "game.start") d.plays += 1;
      if (ev.type === "pretest.answer") d.answers += 1;
    }
    const days = [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, d]) => ({ key, label: labels.get(key) ?? key, people: d.people.size, views: d.views, plays: d.plays, answers: d.answers }));

    return { students, behind, groups, answers, correct, days };
  }, [events, roster, includeTeachers]);

  const accuracy = model.answers > 0 ? `${Math.round((100 * model.correct) / model.answers)}%` : "—";

  const exportBehind = () => {
    downloadCsv("under-5-days", [
      "Name,Days active,Last seen,Page views,Games,Pretest answers",
      ...model.behind.map((l) =>
        [esc(l.name), l.daysActive, esc(fmtWhen(l.lastSeen)), l.pageViews, l.gamePlays, l.pretestAnswers].join(","),
      ),
    ]);
  };

  const exportGroups = () => {
    downloadCsv("accuracy-by-group", [
      "Group,Answers,Correct,Accuracy %",
      ...[...model.groups.entries()]
        .sort((a, b) => b[1].answers - a[1].answers)
        .map(([id, g]) =>
          [esc(pretestTitle(id)), g.answers, g.correct, g.answers > 0 ? Math.round((100 * g.correct) / g.answers) : ""].join(","),
        ),
    ]);
  };

  const exportDays = () => {
    downloadCsv("day-by-day", [
      "Day,Learners,Page views,Games,Pretest answers",
      ...model.days.map((d) => [esc(d.label), d.people, d.views, d.plays, d.answers].join(",")),
    ]);
  };

  // One row per person ALWAYS (zeros are visible, absence is not) — the same
  // guarantee the Students-tab accordion made before it moved here.
  const [busy, setBusy] = useState(false);
  const exportSummary = async () => {
    setBusy(true);
    try {
      const lines = ["Name,Email,UID(s),XP,Streak,SIOs done,Answers,Accuracy %,Last seen,Days active"];
      for (const uids of CLASS_UIDS) {
        const l = model.students.find((r) => r.uids.some((u) => uids.includes(u))) ?? null;
        // The page's pool already holds this learner (patch 26); fetch only
        // for a uid list the roster does not know.
        const d = (l && details?.get(l.uid)) || (await fetchStudentDetail(uids));
        const n = d.responses.length;
        const missed = d.responses.filter((r) => r.status === "missed").length;
        lines.push([
          esc(l?.name ?? uids[0]), esc(l?.email ?? ""), esc(uids.join(" + ")),
          d.progress?.xp ?? 0, d.progress?.streak ?? 0, d.progress?.doneSios?.length ?? 0,
          n, n > 0 ? Math.round(100 * (1 - missed / n)) : "", esc(l?.lastSeen ? fmtWhen(l.lastSeen) : ""), l?.daysActive ?? "",
        ].join(","));
      }
      downloadCsv("analytics", lines);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <ReportCard emoji="🐌" value={model.behind.length} unit={`of ${model.students.length} students`} title={`Under ${DAYS_EXPECTED} active days`} onExport={exportBehind} />
      <ReportCard emoji="🎯" value={accuracy} unit={`${model.answers} answers`} title="Accuracy by group" onExport={exportGroups} />
      <ReportCard emoji="📅" value={model.days.length} unit="days recorded" title="Day-by-day usage" onExport={exportDays} />
      <ReportCard emoji="🧾" value={CLASS_UIDS.length} unit="students, one row each" title="Analytics summary" onExport={() => void exportSummary()} busy={busy} />
    </div>
  );
}

function ReportCard({ emoji, value, unit, title, onExport, busy = false }: {
  emoji: string;
  value: number | string;
  unit: string;
  title: string;
  onExport: () => void;
  busy?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border-2 p-5 text-center shadow-[2px_2px_0_rgba(0,0,0,0.10)]"
      style={{ background: "var(--cahier-paper-raised)", borderColor: "var(--cahier-line-strong)" }}
    >
      <div className="text-2xl" aria-hidden>{emoji}</div>
      <div className="mt-1 text-4xl font-black text-[color:var(--cahier-ink)]">{value}</div>
      <div className="text-xs font-bold text-[color:var(--cahier-ink-soft)]">{unit}</div>
      <div className="mt-1.5 text-base font-black text-[color:var(--cahier-ink)]">{title}</div>
      <button type="button" onClick={onExport} disabled={busy} className="cahier-btn mt-3 rounded-full px-5 py-1 text-sm font-black disabled:opacity-50">
        {busy ? "Building…" : "⬇️ Export"}
      </button>
    </div>
  );
}
