/**
 * The ONE definition of "what day is it for this learner?".
 *
 * Two decisions are baked in here, both Dan's, both deliberate:
 *
 * 1. LEARNER-LOCAL, not UTC and not a fixed Asia/Singapore.
 *    Before 2026-08-08, progress.ts computed the day with
 *    `new Date().toISOString().slice(0,10)` — always UTC — while the teacher
 *    dashboard used an Asia/Singapore Intl formatter. The two halves of the
 *    product disagreed about the date by eight hours. Live reconciliation
 *    found 4 of 19 active learners (21%) holding a lastActiveDay one day
 *    earlier than their real activity, all of them late-night studiers whose
 *    00:00–08:00 SGT sessions landed on the previous UTC date. FluOlinGo is
 *    now global, so a UTC boundary would misplace every learner outside
 *    UTC±0, not just Singapore's night owls.
 *
 * 2. THE DAY ROLLS OVER AT 04:00 LOCAL, not midnight.
 *    Students routinely study past midnight. A midnight boundary splits one
 *    subjective study session across two calendar days and breaks streaks for
 *    exactly the learners putting in the most effort. 04:00 is the hour of
 *    least activity, so the boundary falls where almost nobody is working.
 *    Practising at 01:30 Tuesday therefore counts toward Monday — which is
 *    the day the learner themselves would say it was.
 *
 * Both the learner surfaces and the teacher's per-learner views use this, so
 * a streak and a "last seen" can no longer disagree. The teacher's COHORT
 * views (who's active today across the class) legitimately use the teacher's
 * own zone — a different question, deliberately a different frame.
 */

/** Hour of the local day at which a new day begins. Not midnight — see above. */
export const DAY_ROLLOVER_HOUR = 4;

/** The learner's IANA zone, from the browser. No permission prompt, no
 *  geolocation. Falls back to UTC where Intl is unavailable. */
export function learnerZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(tz: string): Intl.DateTimeFormat {
  let f = fmtCache.get(tz);
  if (!f) {
    // "en-CA" renders YYYY-MM-DD, which sorts lexically — the property the
    // stored lastActiveDay strings rely on.
    f = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    fmtCache.set(tz, f);
  }
  return f;
}

/**
 * The learner-facing day key for an instant, as "YYYY-MM-DD".
 * Shifting the instant back by DAY_ROLLOVER_HOUR before formatting is what
 * makes 01:30 Tuesday read as Monday.
 */
export function dayKey(d: Date = new Date(), tz: string = learnerZone()): string {
  return fmt(tz).format(new Date(d.getTime() - DAY_ROLLOVER_HOUR * 3_600_000));
}

/**
 * The key for the day before a given key. Calendar arithmetic on the key
 * itself, NOT `Date.now() - 86_400_000` — a fixed-millisecond subtraction
 * lands on the wrong date once a year in every DST-observing zone, and the
 * global audience includes plenty of those.
 */
export function previousDay(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() - 1);
  return t.toISOString().slice(0, 10);
}

/** True when `key` is the day immediately before `today` — i.e. the streak
 *  continues rather than resetting. */
export function isConsecutive(key: string | null, today: string): boolean {
  return !!key && key === previousDay(today);
}
