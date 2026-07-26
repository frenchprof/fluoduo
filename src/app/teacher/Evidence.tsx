"use client";
/**
 * Learning Evidence (Dan, 2026-07-27: "how do I show actual learning improved")
 * — three WITHIN-STUDENT analyses over the class's complete answer logs, each
 * rendered with its award-application sentence pre-filled with live numbers.
 *   ① First exposure vs after practice — accuracy on the very first attempt at
 *     each item vs accuracy on all later attempts at the same items (the
 *     pre-testing gain design; cf. Chua & Pan 2026).
 *   ② Errors conquered — items a student initially missed whose most recent
 *     attempt is correct: mistakes, then mastery, on record.
 *   ③ Marathon trajectory — per-student accuracy on the first vs the latest
 *     day of GramMarathon Final attempts (fresh 50 questions each visit, so a
 *     rising curve cannot be memorisation).
 * Honest-epistemology note baked into the UI: no causal claim, no control
 * group — these are same-learner, same-items gains, stated as such.
 */
import { useState } from "react";
import { fetchStudentDetail, type Learner } from "./data";

type Row = { name: string; first: number; later: number; nFirst: number; nLater: number; conquered: number; missed: number; finFirst: number | null; finLast: number | null; finDays: number };

function pct(n: number, d: number): number | null { return d > 0 ? Math.round((100 * n) / d) : null; }

export default function Evidence({ roster }: { roster: Learner[] }) {
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [raw, setRaw] = useState<string[][] | null>(null); // attempt-level, for the verifiable export

  async function compute() {
    setBusy(true);
    const out: Row[] = [];
    const rawRows: string[][] = [];
    for (const l of roster) {
      try {
        const d = await fetchStudentDetail(l.uids);
        // group this learner's responses by item, chronological
        const byItem = new Map<string, { ok: boolean; ts: number; act: string }[]>();
        const finale: { ok: boolean; ts: number }[] = [];
        for (const r of d.responses) {
          if (!r.ts) continue;
          rawRows.push([l.name, r.item, r.ts.toISOString(), r.status !== "missed" ? "correct" : "wrong", r.givenAnswer ?? "", r.activityId ?? ""]);
          const rec = { ok: r.status !== "missed", ts: r.ts.getTime(), act: r.activityId ?? "" };
          const arr = byItem.get(r.item) ?? [];
          arr.push(rec);
          byItem.set(r.item, arr);
          if ((r.activityId ?? "").includes("finale")) finale.push({ ok: rec.ok, ts: rec.ts });
        }
        let firstOk = 0, nFirst = 0, laterOk = 0, nLater = 0, conquered = 0, missedFirst = 0;
        for (const arr of byItem.values()) {
          arr.sort((a, b) => a.ts - b.ts);
          nFirst++; if (arr[0].ok) firstOk++;
          for (let i = 1; i < arr.length; i++) { nLater++; if (arr[i].ok) laterOk++; }
          if (!arr[0].ok) { missedFirst++; if (arr[arr.length - 1].ok) conquered++; }
        }
        // finale by day: first day's accuracy vs latest day's
        let finFirst: number | null = null, finLast: number | null = null, finDays = 0;
        if (finale.length > 0) {
          const byDay = new Map<string, { ok: number; n: number }>();
          for (const f of finale) {
            const k = new Date(f.ts).toDateString();
            const b = byDay.get(k) ?? { ok: 0, n: 0 };
            b.n++; if (f.ok) b.ok++;
            byDay.set(k, b);
          }
          const days = [...byDay.entries()].sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
          finDays = days.length;
          finFirst = pct(days[0][1].ok, days[0][1].n);
          finLast = pct(days[days.length - 1][1].ok, days[days.length - 1][1].n);
        }
        out.push({
          name: l.name, first: firstOk, nFirst, later: laterOk, nLater,
          conquered, missed: missedFirst, finFirst, finLast, finDays,
        });
      } catch { /* skip unreadable learner */ }
    }
    setRows(out);
    setRaw(rawRows);
    setBusy(false);
  }

  const T = rows
    ? rows.reduce((a, r) => ({
        firstOk: a.firstOk + r.first, nFirst: a.nFirst + r.nFirst,
        laterOk: a.laterOk + r.later, nLater: a.nLater + r.nLater,
        conquered: a.conquered + r.conquered, missed: a.missed + r.missed,
      }), { firstOk: 0, nFirst: 0, laterOk: 0, nLater: 0, conquered: 0, missed: 0 })
    : null;
  const p1 = T ? pct(T.firstOk, T.nFirst) : null;
  const p2 = T ? pct(T.laterOk, T.nLater) : null;
  const pc = T ? pct(T.conquered, T.missed) : null;
  const risers = rows ? rows.filter((r) => r.finFirst !== null && r.finLast !== null && r.finDays >= 2) : [];
  const rose = risers.filter((r) => (r.finLast ?? 0) > (r.finFirst ?? 0));

  return (
    <div className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-black uppercase tracking-wide text-emerald-900">📈 Learning evidence — within-student gains</h3>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => void compute()} disabled={busy} className="rounded-full border-2 border-emerald-700 bg-white px-3 py-1 text-xs font-black text-emerald-800 disabled:opacity-50">
            {busy ? "Computing…" : rows ? "Recompute" : "Compute"}
          </button>
          {raw && (
            <button
              type="button"
              className="rounded-full border-2 border-emerald-700 bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900"
              onClick={() => {
                // Attempt-level export (Dan, 2026-07-27): the verifiable source
                // behind the evidence panel — every recorded attempt, so any
                // third party can recompute the gains independently.
                const esc = (v: string) => `"` + v.replaceAll(`"`, `""`) + `"`;
                const csv = "\uFEFF" + [["Student", "Item", "Timestamp", "Result", "Given answer", "Activity"], ...raw].map((r) => r.map(esc).join(",")).join("\n");
                const a = document.createElement("a");
                a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
                a.download = "fluolingo-attempts-" + new Date().toISOString().slice(0, 10) + ".csv";
                a.click();
              }}
            >
              ⬇️ Attempt-level CSV ({raw.length})
            </button>
          )}
        </div>
      </div>
      {!rows && !busy && (
        <p className="mt-1 text-xs text-emerald-900/70">Reads every student's complete answer log. Same learner, same items, before vs after — no causal claim, no control group; stated as such.</p>
      )}
      {rows && T && (
        <div className="mt-2 space-y-3 text-sm text-emerald-950">
          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <p className="font-black">① First exposure vs after practice</p>
            <p>First attempts: <b>{p1}%</b> correct ({T.firstOk}/{T.nFirst} items) · later attempts on the same items: <b>{p2}%</b> ({T.laterOk}/{T.nLater}) — a within-student gain of <b>{p1 !== null && p2 !== null ? p2 - p1 : "—"} points</b>.</p>
            <p className="mt-1 text-xs italic text-emerald-800">“On first exposure, students answered {p1}% of items correctly; after lessons and practice, their accuracy on the same items reached {p2}% — a within-student gain of {p1 !== null && p2 !== null ? p2 - p1 : "—"} percentage points across {T.nFirst} items and the whole class.”</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <p className="font-black">② Errors conquered</p>
            <p>Of <b>{T.missed}</b> items first answered wrongly, <b>{T.conquered}</b> are now answered correctly on the most recent attempt — <b>{pc}%</b> of initial errors conquered.</p>
            <p className="mt-1 text-xs italic text-emerald-800">“Of {T.missed} items students initially got wrong, {pc}% were subsequently mastered through spaced review — the record shows not just mistakes, but mistakes conquered.”</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <p className="font-black">③ Marathon trajectory</p>
            <p>{risers.length} students attempted the 🏁 Final on 2+ days; <b>{rose.length}</b> scored higher on their latest day than their first — on fresh questions every visit.</p>
            <div className="mt-1 text-xs text-emerald-900/80">
              {risers.map((r) => (
                <span key={r.name} className="mr-3 inline-block">{r.name}: {r.finFirst}%→{r.finLast}% ({r.finDays}d)</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-emerald-800/70">Method: per item per student, attempts ordered chronologically; “first” is the earliest recorded attempt (pre-test or first drill), “later” all subsequent attempts; Final attempts grouped by calendar day. Computed live from the answer logs — re-run any time.</p>
        </div>
      )}
    </div>
  );
}
