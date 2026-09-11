/**
 * THE COURSES — one list, and the only place they are described.
 *
 * Dan, 2026-09-09, sketching the front door: *"a pop-up choice between several
 * courses : French 1 (A1) / French 2 (A1) / French 3 (A2) / French 4 (A2) / ...
 * Greyed out for all except LAF1201 French 1."* The pop-up itself was dropped
 * the same day (ENTER walks straight to Home now), but the courses it listed
 * are still the courses, and on 2026-09-11 he asked for the other half:
 * *"do the wiring so f1 to f4 mean different courses"*.
 *
 * EACH COURSE IS A SUBDOMAIN, ONE SHARED DEPLOYMENT (Dan's choice when asked:
 * "Subdomains, one shared site"). f1..f4.fluolingo.com all serve this same
 * build; the hostname is how a page works out which course it is running as.
 * The site is a static export, so there is no server to route on — the page
 * reads its own address after it mounts. See `components/CourseGate.tsx`.
 *
 * WHY A LIST AND NOT FOUR HARD-CODED ROWS. Three of these four are closed
 * today and will be opened one at a time as the material is written. That is a
 * one-line edit here — flip `live` — and nothing else in the app needs to know.
 *
 * NO COURSE CODES ON SCREEN (Dan, asked directly, choosing "No codes at all"):
 * LAF1201 is administrative and means nothing to a learner. It is recorded
 * here, out of the interface, because it is how the course is known to the
 * university and someone will eventually need it. `verify195` fails if `code`
 * is ever read outside this file.
 *
 * THE COST DAN ACCEPTED, WRITTEN DOWN SO IT IS NOT REDISCOVERED AS A BUG: a
 * learner's progress lives in their browser against the exact address they
 * earned it on, so someone who has been using fluoli.ngo starts from zero on
 * f1.fluolingo.com, with their old stops still sitting on the old address. He
 * was shown that before choosing, twice (9 and 10 Sep).
 */
export type Course = {
  /** Stable key, and the subdomain the course is served from ("f1"). */
  key: string;
  /** What a learner reads. */
  name: string;
  /** CEFR level, shown beside the name. */
  level: string;
  /** The university's own code. Deliberately NOT rendered — see above. */
  code: string;
  /** False = the address exists, the course does not yet: every page on that
   *  host shows the closed door instead. Flip to open a course. */
  live: boolean;
};

export const COURSES: Course[] = [
  { key: "f1", name: "French 1", level: "A1", code: "LAF1201", live: true },
  { key: "f2", name: "French 2", level: "A1", code: "", live: false },
  { key: "f3", name: "French 3", level: "A2", code: "", live: false },
  { key: "f4", name: "French 4", level: "A2", code: "", live: false },
];

/** The course every address that names no course runs as: fluoli.ngo,
 *  fluolingo.withdrchan.com, the pages.dev previews, localhost. The content
 *  in this build IS French 1, so that is what those addresses are. */
export const DEFAULT_COURSE: Course = COURSES[0];

/** The course a hostname names, or null when it names none.
 *
 *  Only the FIRST label is read, so `f2.fluolingo.com` and `f2.localhost`
 *  both answer French 2 — which is what lets the closed door be driven on a
 *  laptop, where Chromium resolves every `*.localhost` to the machine itself,
 *  without a hosts-file entry. */
export function courseFromHost(hostname: string): Course | null {
  const first = hostname.split(".")[0]?.toLowerCase() ?? "";
  return COURSES.find((c) => c.key === first) ?? null;
}

/** The address of another course, from wherever this page is running.
 *  `f2.fluolingo.com` → `https://f1.fluolingo.com/`; a course label that is
 *  not there yet is simply prepended, so `fluolingo.com` → `f1.fluolingo.com`
 *  and `f2.localhost:4197` → `f1.localhost:4197`. */
export function courseOrigin(c: Course, host: string, protocol = "https:"): string {
  const bare = host.replace(/^f\d\./i, "");
  return `${protocol}//${c.key}.${bare}/`;
}
