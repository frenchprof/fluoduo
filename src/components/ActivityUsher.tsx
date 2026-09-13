"use client";

/**
 * THE USHERING NAVIGATORS — one row of doors at the end of every activity.
 *
 * Dan, 2026-09-13, over SpecuLearn's recap card: *"We are missing the ushering
 * navigators… for all the stops there should be something like this at the
 * end."* Then, asked which doors: *"one step back to the previous activity of
 * that goal, or forward to the next activity for that goal, or return to the
 * 🎯 page (SIO) to select another activity. or to redo, or to go down towards
 * the same activity for the next available stop (Not all stops have all
 * activities)."*
 *
 * THE 🎯 IS ALWAYS THERE (*"The return to the 🎯 page (SIO) for this activity
 * should always be offered"*). The other four appear only where they lead
 * somewhere: `usherFor` returns a move or nothing, and a stop with no next
 * activity simply shows one door fewer rather than a dead one.
 *
 * THE MAP IS DELIBERATELY NOT ON THIS ROW, and that is Dan's own note:
 * *"(The return to the map is already available at the top via the FluOLinGo
 * chartreuse)"*. A second door to a place already on screen is the HelpDot
 * fault this repo has recorded twice.
 *
 * NO CONTROL SPANS THE WIDTH (rule, 5 Sep) — this is a wrapping row of
 * content-sized keys, not a stack of full-width bars. Every key is a
 * `.neo-key`, so the row presses like the rest of the app, and its sizes ride
 * the type ramp.
 */
import Link from "next/link";
import type { CSSProperties } from "react";

import type { Usher } from "@/lib/usher";

/** One key on the row. The colour is passed as `--key-bg` for the reason
 *  `.neo-key` documents: it sets `background` itself and wins over a utility
 *  class of equal specificity, so a state colour has to come through the
 *  token or it is silently lost. */
function Key({ href, onClick, bg, ink, children }: {
  href?: string;
  onClick?: () => void;
  bg: string;
  ink?: string;
  children: React.ReactNode;
}) {
  const cls = "neo-key fluo-usher-key";
  const style = { "--key-bg": bg, ...(ink ? { color: ink } : {}) } as CSSProperties;
  return href ? (
    <Link href={href} className={cls} style={style}>{children}</Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} style={style}>{children}</button>
  );
}

export default function ActivityUsher({
  usher,
  onRedo,
  className = "",
}: {
  usher: Usher | null;
  /** « Redo » — the one move that is an action rather than an address, so the
   *  drill supplies it. Omitted where a surface cannot restart itself. */
  onRedo?: () => void;
  className?: string;
}) {
  if (!usher) return null;
  const { prev, next, goal, onward } = usher;
  return (
    <nav className={`fluo-usher ${className}`} aria-label="Where to next">
      {prev && (
        <Key href={prev.href} bg="var(--fam-practice-wash)">
          ← {prev.emoji} {prev.name}
        </Key>
      )}
      {/* THE ONE THAT IS ALWAYS HERE, so it wears the strongest colour on the
          row: on a finished card it is the answer to "now what?" more often
          than any of the others. */}
      <Key href={goal.href} bg="var(--fam-tools)" ink="var(--fam-practice-ink)">
        🎯 {goal.goal ?? ""}
      </Key>
      {onRedo && (
        <Key onClick={onRedo} bg="var(--dopa-win-wash)">↻ Redo</Key>
      )}
      {next && (
        <Key href={next.href} bg="var(--fam-practice-wash)">
          {next.emoji} {next.name} →
        </Key>
      )}
      {onward && (
        <Key href={onward.href} bg="var(--fam-review-wash)">
          ↓ {onward.emoji} {onward.name} · 🎯 {onward.goal}
        </Key>
      )}
    </nav>
  );
}
