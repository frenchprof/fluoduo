/**
 * ILLS (problems noted) — the metacognition step, stored.
 *
 * Once a week the learner names what tripped them up, in their own words. The
 * honest caveat, which Dan raised and which is recorded in docs/STATUS.md:
 * NOTHING CONSUMES THESE YET. A note that changes nothing is a diary, and
 * diaries in course apps go unused by week three. The two ways it earns its
 * place — pushing its SIO into the re-drill queue regardless of schedule, or
 * landing on the teacher's dashboard before class — are Dan's call, not this
 * module's, so it stores and reads and does no more than that.
 *
 * Device-local by design: it is the learner's own wording, and nothing on the
 * server reads it. Same shape as the other device stores (activityLedger).
 */

const KEY = "fluolingo:blockers";

/** Three a week is the cap the prompt counts down from ("2 LEFT"). */
export const PER_WEEK = 3;

export type Blocker = {
  /** What blocked them, their words. */
  text: string;
  /** Monday of the week it was written, "YYYY-MM-DD" — the bucket key. */
  week: string;
  /** Epoch ms, for ordering. */
  ts: number;
};

/** The Monday on or before `now`, as "YYYY-MM-DD" in local time. */
export function weekKey(now: number): string {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  // getDay(): 0 = Sunday. Monday-anchored weeks, so Sunday belongs to the
  // week that started six days earlier, not the one starting tomorrow.
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function loadBlockers(): Blocker[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const rows: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(rows)) return [];
    return rows.filter(
      (r): r is Blocker =>
        !!r && typeof (r as Blocker).text === "string" && typeof (r as Blocker).week === "string",
    );
  } catch {
    return [];
  }
}

/** Append one note to this week's bucket. Blank text is a no-op — a Save that
 *  stored an empty string would spend one of the three for nothing. */
export function addBlocker(text: string, now: number): Blocker[] {
  const clean = text.trim();
  if (typeof window === "undefined" || !clean) return loadBlockers();
  const rows = [...loadBlockers(), { text: clean, week: weekKey(now), ts: now }];
  try {
    window.localStorage.setItem(KEY, JSON.stringify(rows));
  } catch {
    // storage unavailable — the note is lost, the page still works
  }
  return rows;
}

/** How many of this week's three are still unwritten. */
export function leftThisWeek(rows: Blocker[], now: number): number {
  const wk = weekKey(now);
  return Math.max(0, PER_WEEK - rows.filter((r) => r.week === wk).length);
}
