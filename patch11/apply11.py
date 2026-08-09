#!/usr/bin/env python3
"""
Patch 11 — D6: session telemetry is orphaned. Rebuild time-on-task from views.

  cd ~/fluoduo && python3 patch11/apply11.py --dry-run
  cd ~/fluoduo && python3 patch11/apply11.py

Requires patch 9.

THE DEFECT. `users/{uid}/sessions` has two readers (teacher/data.ts,
moi/MoiContent.tsx) and NO writer. Nothing in the codebase has created a
session document since the writer was removed. The docs that exist carry a real
`durationMs` and a null `activityId` — `firestore.rules` permits the field
(`validSession()` lists it), nothing populates it.

So "75 sessions · 6 h 10 min" was true, and every row of the activity split
underneath it said `(unlabelled)`, on every learner. No labelling patch could
have fixed that: there was nothing there to label.

THE FIX. `page.view` events carry a path AND a timestamp. Dwell on a page is
the gap to the learner's next view, with two bounds:

  · gaps over 30 min are dropped to a 60 s floor — the tab was open, the
    learner was not, and counting it would inflate a quiet evening into study;
  · the last view before such a break still gets that floor rather than zero,
    because they did look at it.

It is an estimate, it is labelled as one on screen beside the measured session
total, and it reads events already collected — retroactive, and it writes
nothing to Firestore.

Built and verified before shipping: tsc 0 errors, next build 738 pages.
Idempotent.
"""
import os, sys

DRY = "--dry-run" in sys.argv
ROOT = os.getcwd()
ok, skip, fail = [], [], []

if not os.path.isdir(os.path.join(ROOT, "src")) or not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("\n  ERROR: run from the repo root (~/fluoduo)\n"); sys.exit(1)

P = "src/app/teacher/Students.tsx"
path = os.path.join(ROOT, P)
if not os.path.isfile(path):
    print(f"\n  ERROR: {P} not found\n"); sys.exit(1)
txt = orig = open(path, encoding="utf-8").read()
if "describeActivity(act).label" not in txt and "trail.dwell" not in txt:
    print("\n  ERROR: patch 9 has not been applied — run patch9/apply9.py first\n"); sys.exit(1)

SUBS = [
 # 1. collect timestamped views
 ("const views:",
  """    const pages = new Map<string, number>();
    const games = new Map<string, { plays: number; best: number | null }>();""",
  """    const pages = new Map<string, number>();
    // Timestamped views, for the dwell reconstruction below.
    const views: { path: string; t: number }[] = [];
    const games = new Map<string, { plays: number; best: number | null }>();"""),

 ("views.push({ path",
  """        const path = str(ev.payload.path) ?? str(ev.payload.href);
        if (path) pages.set(path, (pages.get(path) ?? 0) + 1);""",
  """        const path = str(ev.payload.path) ?? str(ev.payload.href);
        if (path) {
          pages.set(path, (pages.get(path) ?? 0) + 1);
          if (ev.ts) views.push({ path, t: ev.ts.getTime() });
        }"""),

 # 2. the reconstruction itself
 ("VIEW_CAP_MS",
  """    return {
      topPages: [...pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),""",
  """    // ── Time on task, reconstructed ──────────────────────────────────────
    // WHY: users/{uid}/sessions has two readers and NO writer — nothing in the
    // codebase has created a session document since the writer was removed, so
    // every session carries a real durationMs and a null activityId. The total
    // was true; the per-activity breakdown read "(unlabelled)" for every row on
    // every learner and could not be repaired by labelling, because there was
    // nothing there to label (Dan, 2026-08-10). Logged as D6.
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
      topPages: [...pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),"""),

 # 3. the section header — a learner can have views and no sessions at all
 ("Est. from page views",
  """          {sessStats && detail.sessions.length > 0 && (
            <Section id="sp:time" title="Time on task" meta={`${detail.sessions.length} sessions · ${fmtDuration(sessStats.totalMs)}`}>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi label="Sessions" value={detail.sessions.length} />
                <Kpi label="Total time" value={fmtDuration(sessStats.totalMs)} />
              </div>""",
  """          {((sessStats && detail.sessions.length > 0) || trail.dwell.length > 0) && (
            <Section
              id="sp:time"
              title="Time on task"
              meta={
                sessStats && detail.sessions.length > 0
                  ? `${detail.sessions.length} sessions · ${fmtDuration(sessStats.totalMs)}`
                  : `~${fmtDuration(trail.dwellTotal)} estimated`
              }
            >
              {/* Session docs stopped being written at some point, so a learner
                  can have page views and no sessions at all. The estimate still
                  has something to say about them. */}
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Kpi label="Sessions" value={detail.sessions.length} />
                <Kpi label="Total time" value={sessStats && detail.sessions.length > 0 ? fmtDuration(sessStats.totalMs) : "—"} sub={sessStats && detail.sessions.length > 0 ? "measured" : "no session records"} />
                <Kpi label="Est. from page views" value={fmtDuration(trail.dwellTotal)} sub={`${trail.dwell.length} activities`} />
              </div>"""),

 # 4. the table itself
 ("Estimated from page views",
  """              <TableBox head={["Activity", "Sessions", "Time"]}>
                {sessStats.byActivity.map(([act, a]) => (
                  <tr key={act} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-bold text-slate-900" title={act}>{describeActivity(act).label}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{a.n}</td>
                    <td className="px-3 py-2 text-right text-slate-700">{fmtDuration(a.ms)}</td>
                  </tr>
                ))}
              </TableBox>""",
  """              {/* The per-activity split comes from page-view dwell, NOT from the
                  session docs: those carry a real durationMs and a null
                  activityId, so this table read "(unlabelled)" for every row on
                  every learner (D6 — session telemetry orphaned, 2026-08-10).
                  The totals above are still the session docs, which are sound. */}
              {trail.dwell.length > 0 ? (
                <>
                  <p className="mt-3 text-xs text-slate-500">
                    Estimated from page views — time between one view and the next, ignoring gaps over 30 minutes
                    (tab left open). Session totals above are measured; this split is an estimate.
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
              )}"""),
]

for guard, old, new in SUBS:
    if guard in txt:
        skip.append("edit  " + guard); continue
    if old not in txt:
        fail.append("no match -> " + old.strip()[:70]); continue
    txt = txt.replace(old, new, 1)
    ok.append("edit  " + guard)

if txt != orig and not fail:
    if not DRY:
        open(path, "w", encoding="utf-8").write(txt)

print("\n" + ("DRY RUN" if DRY else "APPLIED") + "\n" + "-" * 62)
for x in ok:   print("  [ok]   " + x)
for x in skip: print("  [--]   " + x + " (already applied)")
for x in fail: print("  [FAIL] " + x)
print("-" * 62)
print(f"  changed {len(ok)} · skipped {len(skip)} · failed {len(fail)}")
print("""
  STOP THE DEV SERVER, then:
    rm -rf .next && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npm run dev

  LOOK AT: a student -> Time on task. Instead of one "(unlabelled)" row you
  get a per-activity split with SIO numbers, an "Est. from page views" KPI
  beside the measured session total, and a line saying plainly which number is
  measured and which is estimated.
""")
