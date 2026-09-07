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
 * were measured at 390px; the longest needs three lines of can-do and three of
 * description, which is what the number below holds.
 */
import Link from "next/link";
import ActivityIcon from "@/components/ActivityIcon";
import { deckActivityTabs } from "@/components/CahierShell";
import type { Sio } from "@/content/sios";

export default function GoalCard({
  sio,
  compact,
  textOnly,
  iconsOnly,
}: {
  sio: Sio;
  compact?: boolean;
  /** The scrap and the words only — the goals page draws these inside its
   *  ruled box and the icons outside it (Dan, 2026-09-07: "the icons can just
   *  be by themselves below that"). */
  textOnly?: boolean;
  /** The icon grid only, for that same split. */
  iconsOnly?: boolean;
}) {
  const items = sio.collectionId ? deckActivityTabs(sio.collectionId).filter((t) => t.href) : [];
  return (
    <>
      {!iconsOnly && (
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
      {/* 21rem = 336px, and that number is MEASURED, not chosen: the natural
          height of all fifty word-boxes was taken at 390px and the tallest —
          SIO-006 — needs 335. Anything less and the icons hop on the goals that
          overflow it, which is the thing Dan asked to stop.
          SIO-006 is 42px taller than the next tallest, so if that one goal's
          wording is ever cut this number should come down with it. */}
      <div className={compact ? "" : "min-h-[21rem]"}>
        <p className="text-base font-bold text-[color:var(--cahier-ink)]">{sio.canDo}</p>
        {sio.description && (
          <p className="mt-2 text-[14px] text-[color:var(--fluo-ink-soft)]">{sio.description}</p>
        )}
      </div>

        </>
      )}

      {!textOnly && items.length > 0 && (
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
