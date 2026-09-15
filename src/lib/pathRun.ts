/**
 * WALKING A CURATED PATH — the run state, and the one question every surface
 * asks it: *what is next?*
 *
 * Dan, 2026-09-14: *"a 'curated path' automatically driving the sequence of
 * activities"*, and, asked how a learner moves between steps, he chose BOTH —
 * *"the end screen offers the next step as the primary button, AND there's a
 * path page showing all nine with ticks"*. Push while they are in flow, a map
 * when they come back tomorrow. This module answers both from one record.
 *
 * PROGRESS IS A SET OF FINISHED STEPS, NOT A CURSOR, and the difference
 * matters the first time a learner wanders. An index says "you are on step 4";
 * if they open step 7 out of curiosity and finish it, an index either refuses
 * it or jumps and abandons 4, 5 and 6. A set records what is genuinely done,
 * in any order, and « next » is simply the first essential step not in it. The
 * bookmark took the same decision for the same reason (continuer.ts: wandering
 * must not move where you are).
 *
 * A STEP IS DONE WHEN ITS ACTIVITY ENDS, and the end of an activity is exactly
 * where `ActivityUsher` draws. So the completion signal is not a new event to
 * be wired into eleven drills — it is the usher row mounting on a page whose
 * address matches the step. Two consequences worth stating:
 *
 *   THE ADDRESS IS READ INSIDE THE FRAME. Every station runs in an iframe, so
 *   the pathname at the moment the usher mounts ends in `/embed`. `samePlace`
 *   strips it. Read from the code alone this looks like defensive tidying; it
 *   is the difference between the path advancing and never advancing at all.
 *
 *   TWO STEPS MAY SHARE ONE ADDRESS. ErroReview is step 2 and step 9 — the
 *   same door, a different job (correct now, make it stick tomorrow). So a
 *   match must return the first step at that address THAT IS NOT ALREADY
 *   DONE, or finishing ErroReview on day two would re-tick day one and leave
 *   the path permanently one step short.
 */
"use client";

import { PATHS, groupsOf, pathById, stepHref, type CuratedPath, type PathStep } from "@/content/paths";

const KEY = "fluolingo:path";
/** Fired on every write, so Home and the path page re-read without a reload —
 *  the same device the bookmark uses. */
export const PATH_EVENT = "fluolingo:path-changed";

export type PathRun = {
  pathId: string;
  /** Step ids finished, in no particular order. */
  done: string[];
  startedAt: number;
};

function emit(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PATH_EVENT));
}

/** The run in progress, or null. Never throws: a private window, cleared site
 *  data or a hand-edited value all read as "no run". */
export function readRun(): PathRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<PathRun>;
    if (!v || typeof v.pathId !== "string" || !pathById(v.pathId)) return null;
    return {
      pathId: v.pathId,
      done: Array.isArray(v.done) ? v.done.filter((x): x is string => typeof x === "string") : [],
      startedAt: typeof v.startedAt === "number" ? v.startedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function write(run: PathRun | null): void {
  if (typeof window === "undefined") return;
  try {
    if (run) window.localStorage.setItem(KEY, JSON.stringify(run));
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable — the walk degrades to "no path", never to a crash */
  }
  emit();
}

export function startRun(pathId: string): PathRun | null {
  const path = pathById(pathId);
  if (!path) return null;
  const run: PathRun = { pathId, done: [], startedAt: Date.now() };
  write(run);
  return run;
}

/** Leave the path. The steps themselves are untouched — a learner who quits
 *  half way has still done the activities, and their XP, streak and review
 *  queue know it. Only the walk is forgotten. */
export function endRun(): void {
  write(null);
}

export function markDone(stepId: string): void {
  const run = readRun();
  if (!run || run.done.includes(stepId)) return;
  write({ ...run, done: [...run.done, stepId] });
}

/** Strip what the router adds, and what the frame adds, so a step's address
 *  and the learner's address can be compared as the same thing. */
function normalise(p: string): string {
  const noQuery = p.split("?")[0].split("#")[0];
  const noEmbed = noQuery.replace(/\/embed\/?$/, "");
  return noEmbed.replace(/\/+$/, "") || "/";
}

export function samePlace(a: string | null, b: string | null): boolean {
  return !!a && !!b && normalise(a) === normalise(b);
}

/** The first step of the essential tier that is not yet done — the answer to
 *  « what is next? ». Null once the essential tier is complete: the optional
 *  tier is opt-in and must never be pushed at anybody. */
export function nextStep(run: PathRun, path: CuratedPath): PathStep | null {
  return path.essential.find((s) => !run.done.includes(s.id)) ?? null;
}

/** The step the learner is standing on right now, if any — the first at this
 *  address that is NOT already done (see the header: ErroReview is two steps
 *  at one door). */
export function stepAtPlace(run: PathRun, path: CuratedPath, pathname: string): PathStep | undefined {
  const all = [...path.essential, ...path.optional];
  return all.find((s) => !run.done.includes(s.id) && samePlace(stepHref(s), pathname));
}

/** How far along, COUNTED IN NUMBERED STEPS — the ones on the screen.
 *
 *  THIS USED TO COUNT DESTINATIONS, on the reasoning that destinations are
 *  what a learner walks. Dan, 2026-09-14: *"the counter of the MID-TERM REVIEW
 *  PATH is lying: 0 of 11 done · 63 min left"*. He was reading « of 11 » above
 *  a list numbered 1 to 9, and there is no reading of that which is not a lie:
 *  either two steps are hidden or the count is wrong.
 *
 *  A GROUP IS ONE STEP because the page draws it as one — MémoiRecall's three
 *  decks are step 3, with three keys inside it — and a group counts as done
 *  only when EVERY door in it is done, which is what its single tick means.
 *  The rule is the 14 Sep one restated: nothing that displays progress may
 *  count differently from the thing the learner is looking at. */
export function progressOf(run: PathRun, path: CuratedPath): { done: number; total: number } {
  const groups = groupsOf(path.essential);
  return {
    total: groups.length,
    done: groups.filter((g) => g.steps.every((s) => run.done.includes(s.id))).length,
  };
}

/* `minutesLeft` lived here and printed « 63 min left » above the dots. Deleted
   2026-09-15 (Dan: *"No need to give a time duration for those activities"*).
   The counter it fed was also the one Dan caught lying — « 0 of 11 done · 63
   min left » — and a number nobody can verify is worse than no number. */

export { PATHS };
