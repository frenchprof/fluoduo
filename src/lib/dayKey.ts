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
 *    00:00–08:00 SGT sessions landed on the previous UTC date. FluOLinGo is
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

/**
 * The learner-facing WEEK key for an instant, as "YYYY-Www" (ISO week).
 * Built on dayKey, so it inherits the 04:00 rollover and the learner's zone:
 * a Monday-01:30 session belongs to the week that just ended, exactly as it
 * belongs to Sunday.
 *
 * Weeks start MONDAY. The weekly leaderboard resets on this key, so it has to
 * be derived the same way everywhere — a board that disagrees with a learner's
 * own "this week" is worse than no board.
 */
export function weekKey(d: Date = new Date(), tz: string = learnerZone()): string {
  const [y, m, day] = dayKey(d, tz).split("-").map(Number);
  // ISO-8601 week number, computed on the key's own calendar date (never on a
  // millisecond offset — same DST reasoning as previousDay).
  return isoWeekOfUTC(new Date(Date.UTC(y, m - 1, day)));
}

/** The ISO week key of a UTC calendar date. The tail of weekKey, split out so
 *  previousWeek can run the same arithmetic on a shifted date. */
function isoWeekOfUTC(t0: Date): string {
  const t = new Date(t0.getTime());
  const dow = (t.getUTCDay() + 6) % 7; // Monday = 0
  t.setUTCDate(t.getUTCDate() - dow + 3); // the Thursday of this ISO week
  const isoYear = t.getUTCFullYear();
  const firstThu = new Date(Date.UTC(isoYear, 0, 4));
  const firstDow = (firstThu.getUTCDay() + 6) % 7;
  firstThu.setUTCDate(firstThu.getUTCDate() - firstDow + 3);
  const week = 1 + Math.round((t.getTime() - firstThu.getTime()) / (7 * 86_400_000));
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

/**
 * The key for the week before a given week key — calendar arithmetic on the
 * key itself, like previousDay, and for the same reason: a 7-day millisecond
 * subtraction near the 04:00 boundary in a DST week lands in the wrong week.
 * ISO year boundaries are the live case ("2026-W01" → "2025-W52"), which is
 * why this reconstructs the week's Thursday rather than decrementing the
 * number: some ISO years have 53 weeks and the number alone cannot know.
 */
export function previousWeek(key: string): string {
  const m = key.match(/^(\d{4})-W(\d{2})$/);
  if (!m) return key;
  const isoYear = Number(m[1]);
  const week = Number(m[2]);
  // Jan 4 is always inside W01; walk to that week's Thursday, then to the
  // asked-for week's Thursday, then back seven days.
  const firstThu = new Date(Date.UTC(isoYear, 0, 4));
  const firstDow = (firstThu.getUTCDay() + 6) % 7;
  firstThu.setUTCDate(firstThu.getUTCDate() - firstDow + 3);
  const thu = new Date(firstThu.getTime());
  thu.setUTCDate(thu.getUTCDate() + (week - 1) * 7 - 7);
  return isoWeekOfUTC(thu);
}
