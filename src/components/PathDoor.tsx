"use client";

/**
 * THE DEDICATED « START MID-TERM REVISION » KEY — IN THE TOP BAR.
 *
 * Dan, 2026-09-14, shown three candidate doors and picking none of them:
 * *"there should be a dedicated 'Mid-Term Revision' START button"*. So this
 * is not a row in the ☰ list and not a line on the 🎯 page — it is one key
 * that says what it starts.
 *
 * IT HAS TWO FACES, WHICH IS WHY IT IS A COMPONENT AND NOT A LINK. Before a
 * path is running it offers to start one; while one is running it is the way
 * back in, and says where the learner got to. A single « Mid-term revision »
 * link would make a learner who is three steps in open the map to find out
 * they were three steps in.
 *
 * NO CONTROL SPANS THE WIDTH (5 Sep): one content-sized key in a centred row.
 *
 * MOVED INTO THE BAR, 2026-09-14 (Dan: *"the button that peers create for
 * this, can you move it to the top of the page between the menu burger and
 * buttons, in the middle"*). It sat under Home's hero, and the note that put it
 * there — "not a fifth thing competing with the wordmark" — is Dan's call to
 * reverse, which he has.
 *
 * IT GOES IN AS A GLYPH, AND THAT IS FORCED RATHER THAN CHOSEN. verify31
 * records the bar's budget: at 390px the icon row cleared the screen by 0.8px,
 * and "ANY addition — a live score on /reviser, the daily-goal chip, a streak
 * flame — pushed navigation off the screen". « Start Mid-Term Revision » is
 * about 190px of text. So the bar gets 📋, which is the same grammar as every
 * other thing up there (icons only, no words — 2026-07-08), and the words live
 * in the tooltip and for a screen reader.
 *
 * THE COUNT IS THE ONE EXCEPTION, and it earns its place by the 1 Sep rule: a
 * number belongs on a control when it describes something you CANNOT see. Once
 * a path is running, « 3/9 » is the only thing on screen that says where the
 * learner got to; before it starts there is nothing to count and it shows none.
 */
import Link from "next/link";
import { useEffect, useState } from "react";

import { PATHS } from "@/content/paths";
import { PATH_EVENT, progressOf, readRun } from "@/lib/pathRun";

export default function PathDoor({ className = "" }: { className?: string }) {
  const path = PATHS[0];
  const [at, setAt] = useState<{ done: number; total: number } | null>(null);

  useEffect(() => {
    /* Read after mount: localStorage is not readable during render and the
       site is statically exported, so the server's HTML and the first client
       render must agree about whether a path is running. */
    const read = () => {
      const run = readRun();
      setAt(run && run.pathId === path.id ? progressOf(run, path) : null);
    };
    read();
    window.addEventListener(PATH_EVENT, read);
    return () => window.removeEventListener(PATH_EVENT, read);
  }, [path]);

  const label = at
    ? `Mid-term revision — ${at.done} of ${at.total} done`
    : "Start Mid-Term Revision";
  return (
    <Link
      href="/path"
      title={label}
      aria-label={label}
      /* A KEY, like every control in this bar, and sized on the ramp rather
         than in pixels (12 Sep): the glyph grows with the learner's own text
         size instead of staying 16px on a desktop that grew around it. */
      className={`neo-key flex shrink-0 items-center gap-1 rounded-lg px-1.5 py-0.5 leading-none ${className}`}
    >
      <span aria-hidden className="text-[length:var(--fs-small)]">📋</span>
      {at && (
        <span className="fluo-mono text-[length:var(--fs-small)] font-black tabular-nums">
          {at.done}/{at.total}
        </span>
      )}
    </Link>
  );
}
