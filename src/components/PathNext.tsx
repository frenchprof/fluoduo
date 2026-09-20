"use client";

/**
 * THE PUSH — « NEXT: ErroReview · step 2 of 11 », drawn at the end of an
 * activity when the learner is walking a curated path.
 *
 * Dan chose both halves of the drive (2026-09-14): this is the half that moves
 * a learner who is in flow. The other half is the path page, for the learner
 * who comes back tomorrow.
 *
 * IT RIDES `ActivityUsher`, WHICH IS WHY IT REACHED ELEVEN DRILLS IN ONE EDIT.
 * The usher row is already the end of every activity in the app (PR 362). Adding
 * the push there means no drill knows a path exists, nothing had to be wired
 * per screen, and a drill built next month inherits the behaviour by drawing
 * the same row it would have drawn anyway.
 *
 * MOUNTING HERE IS THE COMPLETION SIGNAL. The usher draws when a run ends, so
 * if this screen's address is the step's address, the step is finished — no
 * new event, no per-drill callback. See pathRun.ts for the two traps in that
 * comparison (the `/embed` suffix, and ErroReview being two steps at one door).
 *
 * NO CONTROL SPANS THE WIDTH (rule, 5 Sep). The gold BOX is a card, not a
 * button — the tappable thing inside it is content-sized, and the card exists
 * to carry the step name and the dots, which are not controls at all.
 */
import Link from "next/link";
import { useEffect, useState } from "react";

import { pathById, stepHref, type PathStep } from "@/content/paths";
import { activity } from "@/content/activities";
import {
  markDone,
  nextStep,
  progressOf,
  readRun,
  stepAtPlace,
  PATH_EVENT,
} from "@/lib/pathRun";

/** `filled` is one flag PER STEP, in list order — not a count.
 *
 *  WHY, AND IT IS THE SAME REASON PROGRESS IS A SET. A learner may finish
 *  steps out of order, and the first walk of this feature did exactly that:
 *  ErroReview (step 2) was done while the Finale (step 1) was not, and a
 *  count-based label read « Step 2 of 11 » above the words « GramMarathon »,
 *  which is step 1. A count cannot say WHICH step you are being offered once
 *  the order is not guaranteed, so nothing here counts: the label is the
 *  step's own position, and each dot asks its own step whether it is done. */
type View = {
  step: PathStep;
  href: string;
  pos: number;
  total: number;
  filled: boolean[];
} | null;

export default function PathNext({ className = "" }: { className?: string }) {
  const [view, setView] = useState<View>(null);

  useEffect(() => {
    /* Read AFTER mount, never during render: localStorage is not readable
       during render and this site is statically exported, so the server's HTML
       and the first client render would disagree about whether a path is
       running. No eslint-disable is needed here — unlike FirstTour, the
       setStates sit in a nested `read()` that the effect CALLS, so
       react-hooks/set-state-in-effect never fires. */
    const read = () => {
      const run = readRun();
      if (!run) return setView(null);
      const path = pathById(run.pathId);
      if (!path) return setView(null);

      // Standing on a step? Then it is finished — the usher only draws at the
      // end of a run. markDone re-reads, so the `run` above may be stale by a
      // line; that is why `after` is read fresh rather than patched.
      const here = stepAtPlace(run, path, window.location.pathname);
      /* ONLY WHERE A STEP WAS JUST FINISHED (Dan, 2026-09-15, shown the push
         on a goal-2 SpecuLearn pretest: *"The Continue button is misleading,
         it should not appear here if I have not gone through the revision
         route"*). A run switched on once stays on in the browser, and this
         drew « Step 1 of 10 · Continue » at the end of EVERY activity — a
         pretest that is not on the path offering to continue a path the
         learner had not started walking. The push is the reward for finishing
         a step; on any other screen the path page is the way back. */
      if (!here) return setView(null);
      markDone(here.id);

      const after = readRun();
      if (!after) return setView(null);
      const step = nextStep(after, path);
      if (!step) return setView(null); // the essential tier is complete
      const href = stepHref(step);
      if (!href) return setView(null); // never draw a door that leads nowhere
      const { total } = progressOf(after, path);
      setView({
        step,
        href,
        pos: path.essential.findIndex((s) => s.id === step.id) + 1,
        total,
        filled: path.essential.map((s) => after.done.includes(s.id)),
      });
    };
    read();
    window.addEventListener(PATH_EVENT, read);
    return () => window.removeEventListener(PATH_EVENT, read);
  }, []);

  if (!view) return null;
  const { step, href, pos, total, filled } = view;
  const act = activity(step.activityKey);

  return (
    <section
      className={`fluo-path-next ${className}`}
      aria-label={`Next on your path: ${step.title}`}
    >
      <p className="fluo-path-next-eyebrow">
        Step {pos} of {total}
      </p>

      <p className="fluo-path-next-title">
        {act?.emoji ?? "📋"} {step.title}
      </p>
      <p className="fluo-path-next-does">{step.does}</p>

      <div className="fluo-path-next-row">
        <Link href={href} className="neo-key fluo-path-next-go">
          ▶ Continue
        </Link>
        <Link href="/path" className="fluo-path-next-all">
          the whole path
        </Link>
      </div>

      <p className="fluo-path-dots" aria-hidden>
        {filled.map((on, i) => (
          <span key={i} className={on ? "on" : ""}>{on ? "●" : "○"}</span>
        ))}
      </p>
    </section>
  );
}
