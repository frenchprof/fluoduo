"use client";
/**
 * "Class now" — patch 26 (audit: the dashboard "cannot answer 'right now':
 * every window is 7 or 14 days, refresh is manual; finding a struggling
 * student costs 16 modals").
 *
 * The board: one tile per learner, worst-first, repolled every 30 s by the
 * page (fetchResponsesSince). A tile is: name · a live/today/absent dot ·
 * the outcome of the last five answers as ✓✗ dots · a last-10 accuracy
 * bar. RED = three consecutive misses on the same outcome inside twenty
 * minutes — the one signal that means "go and stand next to them".
 *
 * Under it, the outcome × student matrix that did not exist: fifty SIOs as
 * rows, the class as columns, each cell the learner's accuracy tier on that
 * outcome (outcomeForItem over the answers the page already fetched — one
 * useMemo, no fetch of its own). The last column is the class: sixteen
 * heat-strips summed. A vertical red stripe = the whole class failed that
 * outcome, which no table of pages could show.
 */
import { useMemo } from "react";
import { SIOS, unitNumbers, siosForUnit } from "@/content/sios";
import { outcomeForItem } from "@/lib/evidence";
import { isMiss, outcomeAccuracy, tierToken, tierClass } from "@/lib/outcomeRows";
import type { Learner, StudentDetail } from "./data";

/** Three misses in a row on one outcome, this close together, is a stuck learner. */
export const STUCK_WINDOW_MS = 20 * 60_000;
export const STUCK_RUN = 3;
/** Seen inside this = live. */
const LIVE_MS = 5 * 60_000;
export const REPOLL_MS = 30_000;

export type Tile = {
  uid: string;
  name: string;
  presence: "live" | "today" | "absent";
  lastSeen: number;
  last5: { ok: boolean; sio: string | undefined }[];
  acc10: number | null;
  stuckOn: string | undefined;
  answers: number;
  loaded: boolean;
};

const SHORT = new Map(SIOS.map((s) => [s.id, s.short] as const));

/** Pure: a learner + their answers → the tile's facts. Exported for the check. */
export function tileFor(l: Learner, d: StudentDetail | undefined, now: number, todayKey: (t: number) => string): Tile {
  const rs = d?.responses ?? [];
  // fetchStudentDetail sorts newest first; be defensive with a stable sort.
  const recent = [...rs].sort((a, b) => (b.ts?.getTime() ?? 0) - (a.ts?.getTime() ?? 0));
  const lastAns = recent[0]?.ts?.getTime() ?? 0;
  const lastSeen = Math.max(l.lastSeen?.getTime() ?? 0, lastAns);
  const presence: Tile["presence"] =
    now - lastSeen < LIVE_MS ? "live" : lastSeen && todayKey(lastSeen) === todayKey(now) ? "today" : "absent";
  const last5 = recent.slice(0, 5).map((r) => ({ ok: !isMiss(r.status), sio: outcomeForItem(r.item) }));
  const ten = recent.slice(0, 10);
  const acc10 = ten.length ? Math.round((100 * ten.filter((r) => !isMiss(r.status)).length) / ten.length) : null;
  // Stuck: walk newest → older while the run is misses on one outcome inside the window.
  let stuckOn: string | undefined;
  if (recent.length >= STUCK_RUN) {
    const head = recent[0];
    const sio = outcomeForItem(head.item);
    const t0 = head.ts?.getTime() ?? 0;
    if (sio && isMiss(head.status) && now - t0 < STUCK_WINDOW_MS) {
      let run = 0;
      for (const r of recent) {
        if (!isMiss(r.status) || outcomeForItem(r.item) !== sio || t0 - (r.ts?.getTime() ?? 0) > STUCK_WINDOW_MS) break;
        run += 1;
      }
      if (run >= STUCK_RUN) stuckOn = sio;
    }
  }
  return { uid: l.uid, name: l.name, presence, lastSeen, last5, acc10, stuckOn, answers: rs.length, loaded: !!d };
}

/** Worst first: stuck, then lowest recent accuracy, then no data, then absent. */
export function tileRank(t: Tile): number {
  if (t.stuckOn) return -1000 + (t.acc10 ?? 0);
  const base = t.acc10 ?? 150;
  return base + (t.presence === "absent" ? 300 : 0);
}

const SG_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit" });
const dayKey = (t: number) => SG_DAY.format(new Date(t));

const INK = "var(--cahier-ink)";
const SOFT = "var(--cahier-ink-soft)";
const PAPER = "var(--cahier-paper-raised)";
const LINE = "var(--cahier-line-strong)";

export default function ClassNow({
  roster, details, fetched, includeTeachers, onStudent, polledAt, loadedAt,
}: {
  roster: Learner[];
  details: Map<string, StudentDetail>;
  /** How many of the roster have landed (the pool reports as it goes). */
  fetched: number;
  includeTeachers?: boolean;
  onStudent?: (uid: string) => void;
  polledAt: Date | null;
  loadedAt: Date | null;
}) {
  // "Now" is the last poll (or the page load) — a render never asks the clock.
  const now = (polledAt ?? loadedAt)?.getTime() ?? 0;
  const students = useMemo(() => roster.filter((l) => includeTeachers || !l.isTeacher), [roster, includeTeachers]);
  const tiles = useMemo(
    () => students.map((l) => tileFor(l, details.get(l.uid), now, dayKey)).sort((a, b) => tileRank(a) - tileRank(b) || a.name.localeCompare(b.name)),
    [students, details, now],
  );

  // The matrix: sio → uid → pct, plus the class column.
  const matrix = useMemo(() => {
    const per = new Map<string, Record<string, number>>();
    const classAgg: Record<string, { n: number; ok: number }> = {};
    for (const l of students) {
      const d = details.get(l.uid);
      if (!d) continue;
      per.set(l.uid, outcomeAccuracy(d.responses));
      for (const r of d.responses) {
        const sio = outcomeForItem(r.item);
        if (!sio) continue;
        const a = (classAgg[sio] ??= { n: 0, ok: 0 });
        a.n += 1;
        if (!isMiss(r.status)) a.ok += 1;
      }
    }
    const cls: Record<string, number> = {};
    for (const [sio, a] of Object.entries(classAgg)) if (a.n) cls[sio] = Math.round((100 * a.ok) / a.n);
    return { per, cls };
  }, [students, details]);

  const stuck = tiles.filter((t) => t.stuckOn).length;
  const live = tiles.filter((t) => t.presence === "live").length;

  return (
    <div className="class-now mt-3">
      <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold" style={{ color: SOFT }}>
        <span><b style={{ color: INK }}>{live}</b> live</span>
        {stuck > 0 && <span className="tier-weak">{stuck} stuck</span>}
        <span>{fetched}/{students.length} loaded</span>
        {polledAt && <span>polled {polledAt.toLocaleTimeString()} · every {REPOLL_MS / 1000} s</span>}
      </p>

      {/* ── The board: 4×4 on a desk, 2-up on a phone. ── */}
      <div className="class-board grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((t) => {
          const tone = t.stuckOn ? "var(--tier-weak)" : LINE;
          const dot = t.presence === "live" ? "var(--tier-good)" : t.presence === "today" ? "var(--cahier-accent)" : LINE;
          const lastSio = t.last5[0]?.sio;
          return (
            <button
              key={t.uid}
              type="button"
              onClick={() => onStudent?.(t.uid)}
              data-stuck={t.stuckOn ? "1" : undefined}
              data-presence={t.presence}
              className="class-tile rounded-xl border-2 p-2 text-left transition hover:-translate-y-0.5"
              style={{ borderColor: tone, background: t.stuckOn ? "var(--tier-weak-soft)" : PAPER, opacity: t.presence === "absent" && !t.stuckOn ? 0.75 : 1 }}
              title={`${t.name} · ${t.presence}${t.stuckOn ? ` · stuck on ${t.stuckOn} ${SHORT.get(t.stuckOn) ?? ""}` : ""}${t.acc10 != null ? ` · last 10: ${t.acc10}%` : ""}`}
            >
              <div className="flex items-center gap-1.5">
                <span aria-label={t.presence} className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dot }} />
                <span className="min-w-0 flex-1 truncate text-sm font-black" style={{ color: INK }}>{t.name}</span>
                {t.stuckOn && <span aria-label="stuck" className="tier-weak text-xs font-black">⚠</span>}
              </div>
              <div className="mt-1.5 flex items-center gap-1" aria-label="Last five answers">
                {t.last5.length === 0 && <span className="text-[10px]" style={{ color: SOFT }}>{t.loaded ? "no answers" : "…"}</span>}
                {t.last5.map((a, i) => (
                  <span key={i} title={a.sio ? `${a.sio} · ${SHORT.get(a.sio) ?? ""}` : undefined} className="fluo-mono flex h-4 w-4 items-center justify-center rounded-[3px] text-[9px] font-black" style={{ background: a.ok ? "var(--tier-good)" : "var(--tier-weak)", color: PAPER }}>
                    {a.ok ? "✓" : "✗"}
                  </span>
                ))}
                {lastSio && <span className="fluo-mono ml-auto truncate text-[10px] font-bold" style={{ color: SOFT }} title={lastSio}>{SHORT.get(lastSio)}</span>}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="h-[3px] flex-1 overflow-hidden rounded-full" style={{ background: "var(--cahier-line)" }} role="progressbar" aria-label="Last ten accuracy" aria-valuenow={t.acc10 ?? 0} aria-valuemin={0} aria-valuemax={100}>
                  <span className="block h-full rounded-full" style={{ width: `${Math.max(t.acc10 ?? 0, t.acc10 == null ? 0 : 1)}%`, background: tierToken(t.acc10) }} />
                </span>
                <span className={`fluo-mono w-8 shrink-0 text-right text-[10px] font-black ${tierClass(t.acc10)}`} style={t.acc10 == null ? { color: SOFT } : undefined}>{t.acc10 == null ? "—" : `${t.acc10}%`}</span>
              </div>
            </button>
          );
        })}
        {tiles.length === 0 && <p className="col-span-full text-sm" style={{ color: SOFT }}>No learners in this cohort yet.</p>}
      </div>

      {/* ── The outcome × student matrix. ── */}
      <div className="class-matrix mt-4 overflow-x-auto rounded-xl border-2" style={{ borderColor: LINE, background: PAPER }}>
        <table className="border-separate text-xs" style={{ borderSpacing: 2 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 px-2 text-left align-bottom font-black" style={{ background: PAPER, color: INK }}>Outcome</th>
              {students.map((l) => (
                <th key={l.uid} className="align-bottom font-bold" style={{ color: SOFT }} title={l.name}>
                  <button type="button" onClick={() => onStudent?.(l.uid)} className="mx-auto block h-16 w-4 truncate text-[10px] leading-none" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>{l.name}</button>
                </th>
              ))}
              <th className="align-bottom font-black" style={{ color: INK }} title="Whole class">
                <span className="mx-auto block h-16 w-4 text-[10px] leading-none" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>Class</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {unitNumbers().map((u) => (
              siosForUnit(u).map((s, i) => (
                <tr key={s.id} data-sio={s.id}>
                  <th scope="row" className="sticky left-0 z-10 whitespace-nowrap px-2 text-left font-bold" style={{ background: PAPER, color: INK, borderTop: i === 0 ? `2px solid ${LINE}` : undefined }} title={`${s.id} · ${s.topic}`}>
                    <span className="fluo-mono mr-1 text-[10px]" style={{ color: SOFT }}>U{u}·{s.num}</span>{s.short}
                  </th>
                  {students.map((l) => {
                    const pct = matrix.per.get(l.uid)?.[s.id];
                    return (
                      <td key={l.uid} className="p-0">
                        <span className="block h-4 w-4 rounded-[3px]" title={`${l.name} · ${s.id} · ${pct == null ? "—" : `${pct}%`}`} style={{ background: pct == null ? "var(--cahier-line)" : tierToken(pct) }} />
                      </td>
                    );
                  })}
                  <td className="p-0">
                    <span className="block h-4 w-4 rounded-[3px] ring-1 ring-inset" title={`Class · ${s.id} · ${matrix.cls[s.id] == null ? "—" : `${matrix.cls[s.id]}%`}`} style={{ background: matrix.cls[s.id] == null ? "var(--cahier-line)" : tierToken(matrix.cls[s.id]), boxShadow: `inset 0 0 0 1px ${INK}` }} />
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
