import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The page's heading band — ONE structure site-wide, ONE LINE, three parts.
 *
 * Dan drew it on 2026-09-01: *"can i have all strips looking like this: (1)
 * with a X (2) with a circle and the related goal number"*, over three bands
 * reading « ✕  MémoiRecall … 🎯39 ».
 *
 *     ✕   MémoiRecall                                        (🎯39)
 *
 * WHAT EACH PART IS, and why it is that part.
 *
 *   THE ✕ is the way out, and it is on EVERY band now rather than on drills
 *   alone. It was already the drill's only exit; a page whose heading offers
 *   no way back just makes the learner find the browser's. `exitHref` decides
 *   where — a drill goes to its goal's unit, a site page to Home.
 *
 *   THE NAME is the ACTIVITY's (Dan, same day: "the word that appears must be
 *   the activity name"), never the deck's, the pre-test's or the signed-in
 *   user's. Two bands opened with one of those and both read as the same thing
 *   said twice once the goal arrived beside them.
 *
 *   THE CIRCLE is the goal, 🎯 and its number. It REPLACED an inline
 *   « GOAL 39/50 · Wants & needs », and the trade is why it is better: that
 *   text shared one line with the activity's name and truncated on four bands
 *   at 320px. A circle cannot run out of room. What the trade costs is the
 *   goal's NAME, which the map and the goal's own page still carry.
 *
 * ONE LINE, ONE THICKNESS. Before this the band stacked a title over a mono
 * sub-line, so it stood 55px where a page had a sub and 41px where it did not
 * — the site had no uniform strip because the component could be either. Every
 * band on the site now measures the same, Home's rainbow hero excepted by
 * Dan's own words ("except for the rainbow strip on the home page").
 *
 * AND NO NUMBER AT THE END that is not the goal's. The old chip carried a
 * drill's i/total, the profile's outcomes done and a deck page's (?) — one
 * shape meaning three things, which is not a figure a learner can read.
 *
 * The colour comes off the page's own class, with no prop. A `band-*` class
 * (--band) wins where one is set — that is WHAT THE ACTIVITY ASKS of the
 * learner (Dan, 2026-08-26). Otherwise it falls back to the `fam-*` family ink.
 */
export default function PageBand({
  title,
  goal,
  exitHref = "/",
  exitLabel = "Close",
  trailing,
  className = "",
}: {
  /** The ACTIVITY's name — MémoiRecall, GramMarathon, MneMemo, Settings. */
  title: ReactNode;
  /** The goal's number, 1–50. Omitted on a page that belongs to no goal, and
   *  the circle is then not drawn rather than drawn empty. */
  goal?: number;
  /** Where the ✕ goes. A drill passes its goal's unit; a site page takes Home. */
  exitHref?: string;
  exitLabel?: string;
  /** One extra control, right of the goal — a (?) dot. Never a number. */
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`page-band flex items-center gap-2 py-2 pl-4 pr-3 sm:pl-6 ${className}`}
      style={{ background: "var(--band, var(--fam-ink, var(--cahier-ink)))", borderBottom: "3px solid var(--cahier-ink)" }}
    >
      {/* -my-1 keeps a 36px tap target without growing the band: the title
          line is 28px inside py-2, so an untrimmed control would add height
          and give back less than it saved. */}
      <Link
        href={exitHref}
        aria-label={exitLabel}
        className="-my-1 -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl font-black text-white/70 no-underline transition hover:bg-white/15 hover:text-white"
      >
        ✕
      </Link>
      {/* ONE LINE. `min-w-0` lets the flex child shrink below its content and
          `truncate` cuts what is left — without the first, the second never
          fires and a long name pushes the goal circle off the band. */}
      <p className="min-w-0 flex-1 truncate leading-none">
        <span
          className="fluo-band-hand font-semibold leading-none text-white"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          {title}
        </span>
      </p>
      {goal != null && (
        <span
          aria-label={`Goal ${goal}`}
          className="fluo-mono -my-1 flex h-9 shrink-0 items-center gap-0.5 rounded-full px-2 text-[13px] font-black leading-none"
          style={{ background: "var(--cahier-hl)", color: "var(--cahier-ink)" }}
        >
          <span aria-hidden>🎯</span>
          <span aria-hidden>{goal}</span>
        </span>
      )}
      {trailing}
    </header>
  );
}
