"use client";

/**
 * THE DEDICATED « START MID-TERM REVISION » KEY, on Home.
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

  return (
    <div className={`mt-5 flex justify-center ${className}`}>
      <Link href="/path" className="neo-key fluo-path-door">
        <span aria-hidden>📋</span>
        <span>
          {at ? `Mid-Term Revision · ${at.done} of ${at.total}` : "Start Mid-Term Revision"}
        </span>
      </Link>
    </div>
  );
}
