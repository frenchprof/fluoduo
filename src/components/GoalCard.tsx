"use client";

/**
 * One goal, spelled out, with links to everything on it.
 *
 * Dan, 2026-09-05: *"Path should by now be renamed as '<-- 🎯 Goal', and
 * display only the SIO description with the links to items"*, and then the
 * shape of the whole app: *"so the idea is / MAP > SIO > MneMemO > ..."*.
 *
 * The middle level of that chain and the lesson's own Goal tab are the SAME
 * card, which is why it lives here rather than twice. They are reached
 * differently — one by scrolling the fifty, one by tapping a tab — and if they
 * were written separately the tab would drift from the page it is a shortcut
 * to, which is how a learner ends up seeing two different accounts of one goal.
 *
 * NOTHING MOVES BETWEEN GOALS (Dan, 2026-09-07, with a photograph of a torn
 * scrap of paper): *"The SIO0xxx Unit ,,, words can look they were on piece of
 * paper pasted on? and perpetually at the same height. while the icons can just
 * be by themselves below that (also down from the same height onwards)"*.
 *
 * The tag and the icons are the two things every one of the fifty goals has, in
 * the same shape. On a feed that shows one goal per screen they must therefore
 * land in the same place on all fifty, or a flick through the course reads as
 * fifty different pages rather than one page of fifty. So the card is a stack
 * of FIXED heights rather than a centred pile: the scrap sits at the top, the
 * words get a box of their own that does not grow or shrink with them, and the
 * icons begin wherever that box ends — the same y on every goal.
 *
 * The box is `min-h` and not `h`: a can-do longer than any written so far
 * should overflow downward and push the icons rather than be clipped. Fifty
 * were re-measured on 2026-09-11 after the description line went, at NINE
 * widths rather than one — see below for why one number was not enough.
 */
import Link from "next/link";
import ActivityIcon from "@/components/ActivityIcon";
import { deckActivityTabs } from "@/components/CahierShell";
import { SIOS, type Sio } from "@/content/sios";

/** The longest can-do of the fifty, rendered invisibly behind every one of
 *  them so the words box is always exactly as tall as the tallest goal — see
 *  the note at the box itself. Computed, not typed out: a longer goal written
 *  next year raises the floor on its own. */
const LONGEST_CAN_DO = SIOS.reduce((a, x) => (x.canDo.length > a.length ? x.canDo : a), "");

export default function GoalCard({
  sio,
  compact,
}: {
  sio: Sio;
  compact?: boolean;
}) {
  const items = sio.collectionId ? deckActivityTabs(sio.collectionId).filter((t) => t.href) : [];
  return (
    <>
      {/* THE TAG IS A TORN SCRAP, pasted on. `.goal-scrap` in globals.css holds
          the tear and the shadow; the wrapper is what pins it to one edge so it
          does not centre itself differently on a long id than a short one. */}
      <p className="goal-scrap -mt-1 mb-3 flex justify-start">
        <span className="fluo-mono text-[11px] font-black uppercase tracking-wider text-[color:var(--cahier-ink)]">
          {sio.id} · {sio.unitLabel}
        </span>
      </p>

      {/* THE WORDS, in a box that does not resize with them. `compact` is the
          lesson's Goal tab, where the card is one panel among four and there is
          nothing to keep still — it sizes to its content as before. */}
      {/* THE GLOSS UNDER THE CAN-DO IS GONE (Dan, 2026-09-11, striking out
          « moi, toi, etc. — after a preposition, after c'est, or standing
          alone » on SIO-011). The litmus test's own case: the goal above it
          already says what the learner will be able to do, and the gloss is
          the lesson's job, not the goal's. `sio.description` stays in
          content/sios.ts — this stops RENDERING it, it does not delete the
          course's own notes.

          NO BREAKPOINTS EITHER: THE TALLEST GOAL SETS THE FLOOR, AT EVERY
          WIDTH. The box has to be at least as tall as the tallest can-do or
          the icons hop between goals (Dan, 7 Sep). A NUMBER cannot do that
          job, and two rounds of measuring is how that was learned:

            · 9rem was measured at 390px alone. On a 360px phone the tallest
              goal needs 168 and on a 320px one 192, so the box overflowed and
              the icons hopped on exactly the two goals it was sized for.
            · Stepping it by breakpoint fixed the overflow and bought a new
              problem. This page runs INSIDE the cahier's iframe, so a media
              query sees the FRAME, not the phone — 390px of device is 313px
              of frame. Every breakpoint would have to be written in
              frame-widths (284, 313, 350, 416…), and every one of them would
              shift silently the day the notebook's padding changes.

          So the floor is not a number at all. An invisible copy of the longest
          can-do sits in the same grid cell as the real one, and the cell takes
          the taller of the two. At 500px of device that is 96px where the
          breakpoint scheme gave 168: the box is now exactly right at every
          width instead of right at five of them, and it re-measures itself
          when a goal is reworded. It held 21rem/336px when it carried a
          description too, which is why the card in Dan's screenshot was a tall
          empty rectangle.

          `invisible` is visibility:hidden — it takes its space and draws
          nothing; `aria-hidden` keeps it out of the accessibility tree, so a
          screen reader still hears one can-do.

          The empty paper under a SHORT goal is what remains, and it is the
          price of the icons not hopping. That trade is Dan's to make. */}
      <div className={compact ? "" : "grid"}>
        <p className={`text-base font-bold text-[color:var(--cahier-ink)]${compact ? "" : " col-start-1 row-start-1"}`}>
          {sio.canDo}
        </p>
        {!compact && (
          <p aria-hidden className="invisible col-start-1 row-start-1 text-base font-bold">
            {LONGEST_CAN_DO}
          </p>
        )}
      </div>

      {items.length > 0 && (
        /* ICONS ONLY, THREE UP (Dan, 2026-09-07: *"Below grid of 3x3 buttons
           not in this form but the grid of icons only like we saw in the
           earlier 'HELP'"*).

           It was a two-column list of labelled pills, and on a goal with seven
           activities that is seven rows of text under a card that has already
           said what the goal is — the litmus test's own case: the words
           « MémoiRecall », « VocabulaRain » repeat what the icon and its
           colour already carry.

           The name has not been thrown away, it has moved: `title` on hover,
           and the `sr-only` span, which is what a screen reader announces — an
           icon-only link that announces nothing is a link nobody can use.

           `w-fit` and centred, not three columns stretched across the card:
           three tiles spread over 290px of paper read as three separate things
           a long way apart, which is the opposite of a grid. Dan's reference is
           the HELP sheet, whose icons sit together. */
        <ul className={`${compact ? "mt-3" : "mt-4"} mx-auto grid w-fit grid-cols-3 gap-3`}>
          {/* COLOURED BY LEARNING PHASE (Dan, 2026-09-05: *"we need color for
              those items"*), from `bandOf` inside ActivityIcon — the same map
              the map's stop sheet reads, so a Pre-Test is the same colour
              whichever door a learner opens it from. */}
          {items.map((t) => (
            <li key={t.key}>
              <Link
                href={t.href!}
                title={t.label}
                /* 44px, not the icon's own 40 — PR 192's tap floor. The tile
                   inside stays 40 and the ring around it takes the rest, so
                   the target grows without the artwork changing size. */
                className="grid h-11 w-11 place-items-center rounded-xl no-underline transition hover:scale-110"
              >
                <ActivityIcon activityKey={t.key} emoji={t.emoji} />
                <span className="sr-only">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
