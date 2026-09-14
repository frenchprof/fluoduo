"use client";

/**
 * /path/embed — THE MAP OF A CURATED PATH: every step, what is ticked, and
 * the one to do next.
 *
 * Dan, 2026-09-14, choosing how a learner is moved along: BOTH — *"the end
 * screen offers the next step as the primary button, AND there's a path page
 * showing all nine with ticks"*. `PathNext` is the push; this is the map.
 *
 * THE OPTIONAL TIER IS FOLDED, AND ITS FOLD CARRIES A COUNT — the collapse
 * rule of 31 Aug, both halves of it. The essential tier is the argument and
 * stays open; the optional tier is apparatus and starts closed; and the
 * summary says « 9 more · 71 min » rather than showing a bare chevron,
 * because *"a collapsed section with no count is a section nobody opens,
 * which is just deletion with extra steps"*. Native `<details>`, so it
 * survives having no JavaScript and costs no state.
 *
 * A STEP WITH NO DOOR IS DRAWN GREY, NEVER AS A DEAD LINK. `stepHref` returns
 * null for a goal that cannot play an activity — Dan's own parenthesis,
 * *"(Not all stops have all activities)"* — and the usher already takes this
 * decision for the same reason. `verify760` additionally fails if one appears
 * on the ESSENTIAL tier, where it would stop the walk rather than merely
 * offer one door fewer.
 */
import Link from "next/link";
import { useEffect, useState } from "react";

import CahierShell from "@/components/CahierShell";
import { activity } from "@/content/activities";
import {
  PATHS,
  groupsOf,
  minutesOf,
  stepHref,
  type CuratedPath,
  type PathStep,
} from "@/content/paths";
import {
  PATH_EVENT,
  endRun,
  minutesLeft,
  nextStep,
  progressOf,
  readRun,
  startRun,
  type PathRun,
} from "@/lib/pathRun";

export default function Page() {
  const path = PATHS[0];
  const [run, setRun] = useState<PathRun | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    /* Read after mount: localStorage is not readable during render and the
       site is statically exported, so the first client render must agree with
       the server's HTML. */
    const read = () => {
      setRun(readRun());
      setReady(true);
    };
    read();
    window.addEventListener(PATH_EVENT, read);
    return () => window.removeEventListener(PATH_EVENT, read);
  }, []);

  const running = run?.pathId === path.id ? run : null;
  const current = running ? nextStep(running, path) : null;
  const { done, total } = running ? progressOf(running, path) : { done: 0, total: path.essential.length };

  return (
    <CahierShell active="reviser">
      {/* No SectionBand: the HOST draws the band (see path/page.tsx). A framed
          page drawing its own would be the second strip verify126 forbids. */}

      <div className="mx-auto w-full max-w-[46rem] px-4 pb-10">
        <p className="mt-3 text-[color:var(--cahier-ink-soft)]">{path.blurb}</p>

        {/* THE HEADER IS A CARD, NOT A CONTROL — the START key inside it is
            content-sized (no control spans the width, 5 Sep). */}
        <section className="fluo-path-next mt-4">
          {running ? (
            <>
              <p className="fluo-path-next-eyebrow">
                {done} of {total} done · {minutesLeft(running, path)} min left
              </p>
              <p className="fluo-path-next-title">
                {current ? `${activity(current.activityKey)?.emoji ?? "📋"} ${current.title}` : "✓ Path complete"}
              </p>
              <div className="fluo-path-next-row">
                {current && stepHref(current) && (
                  <Link href={stepHref(current)!} className="neo-key fluo-path-next-go">
                    ▶ Continue · {current.minutes} min
                  </Link>
                )}
                <button type="button" onClick={() => endRun()} className="fluo-path-next-all">
                  leave the path
                </button>
              </div>
              {/* ONE DOT PER STEP, EACH ASKING ITS OWN STEP — not the first
                  N filled. A learner can finish steps out of order (which is
                  why progress is a set), and a count-filled row would show
                  step 1 done when step 2 was the one they did. */}
              <p className="fluo-path-dots" aria-hidden>
                {path.essential.map((s) => (
                  <span key={s.id} className={running.done.includes(s.id) ? "on" : ""}>
                    {running.done.includes(s.id) ? "●" : "○"}
                  </span>
                ))}
              </p>
            </>
          ) : (
            <>
              {/* COUNT THE NUMBERED STEPS, NOT THE DOORS. `Tier` numbers by
                  GROUP — the three MémoiRecall decks are step 3, the three
                  MneMemo lessons are step 4 — so counting `essential.length`
                  printed « 16 steps » over a list numbered 1 to 11, and the
                  blurb right above it said something else again. */}
              <p className="fluo-path-next-eyebrow">
                {groupsOf(path.essential).length} steps · {minutesOf(path.essential)} min
              </p>
              <p className="fluo-path-next-does">
                Each step asks for something no other step asks for. The app will walk you through them.
              </p>
              <div className="fluo-path-next-row">
                <button
                  type="button"
                  onClick={() => startRun(path.id)}
                  className="neo-key fluo-path-next-go"
                  disabled={!ready}
                >
                  ▶ Start Mid-Term Revision
                </button>
              </div>
            </>
          )}
        </section>

        <Tier path={path} steps={path.essential} run={running} current={current} />

        <details className="mt-6">
          <summary className="cursor-pointer font-[family-name:var(--font-fluohand-stack)] text-[calc(1rem+var(--fs-step)*1)] font-black text-[color:var(--cahier-ink)]">
            Optional · {groupsOf(path.optional).length} more · {minutesOf(path.optional)} min
          </summary>
          <p className="mt-2 text-[calc(0.85rem+var(--fs-step)*0.85)] text-[color:var(--cahier-ink-soft)]">
            Only when there is time left after the {groupsOf(path.essential).length}. Adding all of
            these takes the path past two hours, which is past the point where revision becomes
            re-reading.
          </p>
          <Tier path={path} steps={path.optional} run={running} current={null} />
        </details>
      </div>
    </CahierShell>
  );
}

function Tier({ path, steps, run, current }: {
  path: CuratedPath;
  steps: PathStep[];
  run: PathRun | null;
  current: PathStep | null;
}) {
  void path;
  return (
    <div className="mt-4">
      {groupsOf(steps).map((g, idx) => {
        /* The step's number is the map's own index — `let n` reassigned during
           render is the react-hooks/immutability fault, and the index says the
           same thing without the mutable box. */
        const n = idx + 1;
        const head = g.steps[0];
        const allDone = !!run && g.steps.every((s) => run.done.includes(s.id));
        const isNow = !!current && g.steps.some((s) => s.id === current.id);
        const mins = g.steps.reduce((m, s) => m + s.minutes, 0);
        const grouped = g.steps.length > 1;
        return (
          <div
            key={g.label}
            className="fluo-path-step"
            data-state={allDone ? "done" : isNow ? "now" : "todo"}
          >
            <span className="fluo-path-step-n">{allDone ? "✓" : n}</span>
            <div>
              <div className="fluo-path-step-hd">
                <span className="fluo-path-step-title">
                  {activity(head.activityKey)?.emoji ?? "📋"}{" "}
                  {grouped ? g.label : head.title}
                </span>
                <span className="fluo-path-step-min">{mins} min</span>
              </div>
              <p className="fluo-path-step-does">{head.does}</p>
              {head.why && <p className="fluo-path-step-why">{head.why}</p>}
              <div className="flex flex-wrap gap-2">
                {g.steps.map((s) => {
                  const href = stepHref(s);
                  const sDone = !!run && run.done.includes(s.id);
                  const label = grouped ? s.title.replace(/^[^—]*—\s*/, "") : "Open";
                  return href ? (
                    <Link
                      key={s.id}
                      href={href}
                      className="neo-key fluo-path-step-go"
                      /* The edge follows the fill, so a finished step is
                         outlined in the win ink and a waiting one in the
                         family's — the ☰ menu's colour law (11 Sep), applied
                         to the one control this page repeats sixteen times. */
                      style={{
                        "--key-bg": sDone ? "var(--dopa-win-wash)" : "var(--fam-review-wash)",
                        "--key-edge": sDone ? "var(--dopa-win-ink)" : "var(--fam-review-ink)",
                      } as React.CSSProperties}
                    >
                      {sDone ? "✓" : "▶"} {label}
                    </Link>
                  ) : (
                    /* No door for this goal — said, not linked. */
                    <span key={s.id} className="fluo-path-step-does mt-2 opacity-60">
                      not available for this goal
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
