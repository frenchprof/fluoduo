/**
 * THE COURSES — one list, and the only place they are described.
 *
 * Dan, 2026-09-09, sketching the front door: *"then a pop-up choice between
 * several courses : French 1 (A1) / French 2 (A1) / French 3 (A2) / French 4
 * (A2) / ... Greyed out for all except LAF1201 French 1. Lands on our French 1
 * home page with the 3D map by default."*
 *
 * WHY A LIST AND NOT FOUR HARD-CODED ROWS. Three of these four are greyed
 * today and will be opened one at a time as the material is written. That is a
 * one-line edit here — flip `live` — and nothing else in the app needs to know.
 * The names ruling ("they live once; everything else derives") is the same
 * instinct that had the ☰ menu hard-coding "NumBus" over a registry that said
 * "Numbers", which Dan spotted on screen the same day.
 *
 * NO COURSE CODES ON SCREEN (Dan, asked directly, choosing "No codes at all"):
 * LAF1201 is administrative and means nothing to a learner. It is recorded
 * here, out of the interface, because it is how the course is known to the
 * university and someone will eventually need it.
 *
 * EACH COURSE IS A SUBDOMAIN, ONE SHARED DEPLOYMENT (Dan's choice when asked:
 * "Subdomains, one shared site"). f1..f4.fluolingo.com all serve this same
 * build; `host` is how a page works out which course it is running as.
 *
 * THE COST HE ACCEPTED, WRITTEN DOWN SO IT IS NOT REDISCOVERED AS A BUG: a
 * learner's progress lives in their browser against the exact address they
 * earned it on, so someone who has been using fluolingo.com starts from zero
 * on f1.fluolingo.com, with their old stops still sitting on the old address.
 * He was shown that before choosing.
 */
export type Course = {
  /** Stable key. Never shown; safe to reference from code. */
  key: string;
  /** What a learner reads. */
  name: string;
  /** CEFR level, shown beside the name. */
  level: string;
  /** The subdomain this course is served from, e.g. "f1". */
  host: string;
  /** The university's own code. Deliberately NOT rendered — see above. */
  code: string;
  /** False = shown, greyed, unpickable. Flip to open a course. */
  live: boolean;
};

export const COURSES: Course[] = [
  { key: "f1", name: "French 1", level: "A1", host: "f1", code: "LAF1201", live: true },
  { key: "f2", name: "French 2", level: "A1", host: "f2", code: "", live: false },
  { key: "f3", name: "French 3", level: "A2", host: "f3", code: "", live: false },
  { key: "f4", name: "French 4", level: "A2", host: "f4", code: "", live: false },
];

/** The course this page is running as, or null on the front door itself.
 *
 *  Read from the HOSTNAME, not from storage: a learner who types
 *  f2.fluolingo.com must get French 2 whatever their browser remembers, and a
 *  static export has no server to decide for it. Returns null for
 *  fluolingo.com, for previews (fluoduo.pages.dev) and for localhost, which is
 *  what makes the front door still show the greeting and the picker there. */
export function courseFromHost(hostname: string): Course | null {
  const first = hostname.split(".")[0]?.toLowerCase() ?? "";
  return COURSES.find((c) => c.host === first) ?? null;
}

/** Where the picker sends a learner. Same-origin in development (no
 *  subdomains locally), the real subdomain in production — so the flow can be
 *  driven end to end on a laptop without four hosts file entries. */
export function courseHref(c: Course, hostname: string): string {
  const bare = hostname.replace(/^f\d\./, "");
  const isReal = /(^|\.)fluolingo\.(com|ngo)$/i.test(bare);
  return isReal ? `https://${c.host}.${bare}/map` : "/map";
}
