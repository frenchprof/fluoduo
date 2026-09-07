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
 */
import Link from "next/link";
import ActivityIcon from "@/components/ActivityIcon";
import { deckActivityTabs } from "@/components/CahierShell";
import type { Sio } from "@/content/sios";

export default function GoalCard({ sio, compact }: { sio: Sio; compact?: boolean }) {
  const items = sio.collectionId ? deckActivityTabs(sio.collectionId).filter((t) => t.href) : [];
  return (
    <>
      <p className="fluo-mono text-[11px] font-black uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">
        {sio.id} · {sio.unitLabel}
      </p>
      <p className="mt-1 text-base font-bold text-[color:var(--cahier-ink)]">{sio.canDo}</p>
      {sio.description && (
        <p className="mt-2 text-[14px] text-[color:var(--fluo-ink-soft)]">{sio.description}</p>
      )}

      {items.length > 0 && (
        /* ICONS ONLY, THREE UP (Dan, 2026-09-07: *"Below grid of 3x3 buttons
           not in this form but the grid of icons only like we saw in the
           earlier 'HELP'"*).

           It was a two-column list of labelled pills, and on a goal with seven
           activities that is seven rows of text under a card that has already
           said what the goal is — the litmus test's own case: the words
           « MémoiRecall », « VocabulaRain » repeat what the icon and its
           colour already carry, and they cost the card most of its height on
           a screen that now holds exactly one goal.

           The name has not been thrown away, it has moved: `title` on hover,
           and the `sr-only` span, which is what a screen reader announces —
           an icon-only link that announces nothing is a link nobody can use.
           `aria-hidden` stays on the tile itself for the same reason: it is
           decoration, and the name beside it is the label.

           `w-fit` and centred, not three columns stretched across the card:
           three tiles spread over 290px of paper read as three separate
           things a long way apart, which is the opposite of a grid. Dan's
           reference is the HELP sheet, whose icons sit together. */
        <ul className={`${compact ? "mt-3" : "mt-4"} mx-auto grid w-fit grid-cols-3 gap-3`}>
          {/* COLOURED BY LEARNING PHASE (Dan, 2026-09-05: *"we need color for
              those items"*), from `bandOf` — the same map the map's stop sheet
              reads, so a Pre-Test is the same colour whichever door a learner
              opens it from. Not a new palette: the five phase hues already
              exist as `--band` and `--band-wash`, and inventing a seventh
              scheme for one card is how an app ends up with three. An activity
              outside the map (a supplement) draws no band and falls back to the
              paper, which is the honest answer for "this belongs to no
              phase". */}
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
