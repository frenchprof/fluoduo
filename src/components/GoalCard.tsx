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
 * were measured at 390px, and re-measured on 2026-09-11 after the description
 * line went — see below for why the number dropped by more than half.
 */
import Link from "next/link";
import ActivityIcon from "@/components/ActivityIcon";
import { deckActivityTabs } from "@/components/CahierShell";
import type { Sio } from "@/content/sios";

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

          9rem = 144px, and that number is MEASURED, not chosen: all fifty
          can-dos were re-measured at 390px with the gloss gone and the tallest
          — SIO-005 and SIO-008, three lines each — need exactly 144. It was
          21rem/336px when the box held a description too, which is why the
          card in Dan's screenshot was a tall empty rectangle. Anything less
          than the measurement and the icons hop between goals, which is the
          thing he asked to stop on 7 Sep. */}
      <div className={compact ? "" : "min-h-[9rem]"}>
        <p className="text-base font-bold text-[color:var(--cahier-ink)]">{sio.canDo}</p>
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
