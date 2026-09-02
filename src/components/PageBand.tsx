import type { ReactNode } from "react";

/**
 * The page's heading band — ONE structure site-wide, and ONE LINE.
 *
 * Dan, 2026-09-01, after the chrome pass: *"in all of those colored strips,
 * the word that appears must be the activity name. followed in the same row by
 * the number and name of the stop. Keep the line within a single line. drop the
 * number at the end of that strip. all colored strips (except for the rainbow
 * strip on the home page) must be uniformly of the same thickness (one line
 * text max)."*
 *
 * So the band is now:
 *
 *     [lead]  ActivityName · GOAL 39/50 · Envies et besoins        [trailing]
 *
 * WHAT CHANGED AND WHY IT MATTERED. It used to stack a title over a mono
 * sub-line and pin a number on a highlighter chip at the right. Three
 * consequences, all of them Dan's complaints:
 *
 *   · TWO LINES OR ONE, depending on whether the page had a sub — so the bands
 *     were 55px on a drill and 41px on a section page and the site had no
 *     uniform strip. `tag` renders INLINE now, so a band is one line high
 *     whether or not it has one.
 *   · THE NUMBER AT THE END was three different things wearing one chip: a
 *     drill's i/total, the profile's outcomes done, a deck page's (?) button.
 *     A figure that means something different on every page is not a figure a
 *     learner can read, and the drills carry a progress bar under the band
 *     anyway. It is gone; `trailing` stays for a CONTROL, which is not a
 *     reading.
 *   · THE TITLE WAS WHATEVER THE PAGE HAPPENED TO CALL ITSELF — a deck's own
 *     name, a pre-test's own name, the signed-in user's name. Dan's rule makes
 *     it the ACTIVITY, and the stop's number and name follow it, so every band
 *     answers "what am I doing / where am I" in the same order.
 *
 * The colour comes off the page's own class, with no prop. A `band-*` class
 * (--band) wins where one is set — that is WHAT THE ACTIVITY ASKS of the
 * learner (Dan, 2026-08-26). Otherwise it falls back to the `fam-*` family ink.
 */
export default function PageBand({
  title,
  tag,
  lead,
  trailing,
  className = "",
}: {
  /** The ACTIVITY's name — 4Mémoire, GramMarathon, Mémo, Réglages. */
  title: ReactNode;
  /**
   * Where it sits on the course: « GOAL 39/50 · Envies et besoins », built by
   * lib/stopTag.ts. Inline after the title, in the mono face at 80% so the
   * activity reads first. Omitted on a page that belongs to no stop, and the
   * band is then simply the name.
   */
  tag?: ReactNode;
  /**
   * One control pinned to the band's left, before the title — the drill's ✕,
   * a deck's back arrow.
   *
   * It moved here because the row that used to hold it, DrillShell's 56px bar,
   * carried the ✕, a 243px EMPTY spacer and a score on any surface with no
   * progress to show. Measured at 390px on /lessons/colors: 187px of chrome
   * before the first tab, of which that bar and the gap under it were 84px
   * spent on one glyph and one number.
   */
  lead?: ReactNode;
  /** One control pinned right — a (?) dot. NEVER a number: see above. */
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`page-band flex items-center gap-2 py-2 pl-4 sm:pl-6 ${className}`}
      style={{ background: "var(--band, var(--fam-ink, var(--cahier-ink)))", borderBottom: "3px solid var(--cahier-ink)" }}
    >
      {lead}
      {/* ONE LINE, and all three of these are load-bearing. `min-w-0` lets the
          flex child shrink below its content; `truncate` cuts what is left;
          `whitespace-nowrap` on the tag stops the stop's name wrapping under
          the activity's, which would put the band back to two lines by another
          route. The activity is first in the DOM, so it is the last thing an
          ellipsis eats. */}
      <p className="min-w-0 flex-1 truncate leading-none">
        <span
          className="fluo-band-hand font-semibold leading-none text-white"
          style={{ fontSize: "var(--fs-h2)" }}
        >
          {title}
        </span>
        {tag != null && (
          <span className="fluo-mono ml-2 whitespace-nowrap text-[10px] font-bold leading-none tracking-[0.06em] text-white/85">
            {tag}
          </span>
        )}
      </p>
      {trailing}
    </header>
  );
}
