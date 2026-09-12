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
 * THE CARD HUGS ITS GOAL (Dan, 2026-09-11: *"let the icons move, hug the
 * text"*), and this is the second half of a decision, not a slip. The first
 * half was 7 Sep, with a photograph of a torn scrap of paper: *"The SIO0xxx
 * Unit ,,, words can look they were on piece of paper pasted on? and
 * perpetually at the same height. while the icons can just be by themselves
 * below that (also down from the same height onwards)"*.
 *
 * That bought a still page at the price of empty paper. The words sat in a box
 * sized to the LONGEST of the fifty, so the icons landed at one y on all of
 * them — and on the shortest goal, a single line, roughly 120px of nothing
 * stood between the sentence and its doors. Shown the two side by side, Dan
 * chose the other trade: the icons may hop as he flicks, and no goal carries
 * space it has not earned.
 *
 * So the box is gone rather than shrunk. The scrap still pins to the top (it
 * is above the words, so it never moved anyway); the words take the height
 * they need; the icons begin where they end. What replaced the box is nothing
 * at all — no min-height, no measured constant, no invisible twin — which is
 * also why this is the version that cannot go stale when a goal is reworded.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { deckActivityTabs } from "@/components/CahierShell";
import { FAMILIES, familyName, familyOf, type FamilyKey } from "@/content/activities";
import { BAND, BAND_NAME, BAND_STACK, TILE, TILE_EMOJI, TILE_NAME } from "@/components/familyTile";
import { readUiPrefs } from "@/lib/uiPrefs";
import type { Sio } from "@/content/sios";

export default function GoalCard({
  sio,
  compact,
}: {
  sio: Sio;
  compact?: boolean;
}) {
  const items = sio.collectionId ? deckActivityTabs(sio.collectionId).filter((t) => t.href) : [];

  /* Grouped into the ☰'s own row order, and only for families that actually
     have a door on this goal — an empty band would claim a family the goal
     does not reach. A door whose key has no family (SELF_COLOURED: /moi,
     /profil) cannot sit on a coloured band at all, so it is dropped from the
     grouping rather than given a colour it has refused; none of the deck
     activity tabs is one today, and this is what keeps that true. */
  const byFamily = useMemo(() => {
    const bag = new Map<FamilyKey, typeof items>();
    for (const t of items) {
      const fam = familyOf(t.key);
      if (!fam) continue;
      const got = bag.get(fam);
      if (got) got.push(t);
      else bag.set(fam, [t]);
    }
    return FAMILIES.map((f) => [f.key, bag.get(f.key)] as const)
      .filter((e): e is readonly [FamilyKey, NonNullable<typeof e[1]>] => !!e[1] && e[1].length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `items` is rebuilt each render from sio.collectionId, so that is the real input
  }, [sio.collectionId]);

  /* THE NAME UNDER THE TILE (Dan, 2026-09-11: *"it would help to add the name
     of each activity below the tile by default) we can allow userss to remove
     it in the settings"*). The setting is Réglages' existing "Icon labels"
     row — one switch for the words under an icon, wherever they are — and it
     now defaults ON; see lib/uiPrefs.ts for why the tiles get the opposite
     answer to the bottom bar.

     READ AFTER MOUNT, and `false` until then. The site is statically
     exported, so a preference read during render would bake one learner's
     choice into the HTML every other learner downloads. Starting false rather
     than true means the labels appear rather than vanish on the first paint —
     a label that flashes away reads as a bug, one that arrives reads as the
     page finishing. */
  const [labels, setLabels] = useState(false);
  useEffect(() => {
    const sync = () => setLabels(readUiPrefs().showNavLabels);
    sync();
    window.addEventListener("fluolingo:uiprefs", sync);
    return () => window.removeEventListener("fluolingo:uiprefs", sync);
  }, []);
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

      {/* THE WORDS, and nothing around them.

          THE GLOSS UNDER THE CAN-DO IS GONE (Dan, 2026-09-11, striking out
          « moi, toi, etc. — after a preposition, after c'est, or standing
          alone » on SIO-011). The litmus test's own case: the goal above it
          already says what the learner will be able to do, and the gloss is
          the lesson's job, not the goal's. `sio.description` stays in
          content/sios.ts — this stops RENDERING it, it does not delete the
          course's own notes.

          AND THE BOX AROUND THEM IS GONE (Dan, same day, shown the card with
          the gloss removed: *"let the icons move, hug the text"*). The words
          had a floor as tall as the longest of the fifty, so the icons landed
          at one y on every goal; on a one-line can-do that left about 120px of
          empty paper between the sentence and its doors. He chose the other
          trade. Nothing replaces the floor — no min-height, no measured
          constant, no invisible twin sized off SIOS — so there is also nothing
          left to go stale when a goal is reworded.

          Worth keeping in view if it is ever revisited: the `compact` branch
          (the lesson's Goal tab) always sized to its content, so this is the
          two surfaces agreeing rather than a new behaviour on one of them. */}
      <p className="text-base font-bold text-[color:var(--cahier-ink)]">{sio.canDo}</p>

      {items.length > 0 && (
        /* ICONS ONLY, THREE UP (Dan, 2026-09-07: *"Below grid of 3x3 buttons
           not in this form but the grid of icons only like we saw in the
           earlier 'HELP'"*).

           It was a two-column list of labelled PILLS — seven rows of text
           under a card that had already said what the goal is — and what the
           litmus test cut on 7 Sep was that list, not the names. The grid is
           the shape Dan asked for and it kept the names only in `title` and
           an `sr-only` span.

           THE NAMES ARE BACK UNDER THE TILES (Dan, 2026-09-11: *"it would
           help to add the name of each activity below the tile by default"*),
           behind Réglages' "Icon labels" switch, which now defaults on. A
           goal's five tiles are a different five each time and the icon is
           the only thing on them, so the name is not repeating anything —
           which is the litmus test's actual question.

           `w-fit` and centred, not three columns stretched across the card:
           three tiles spread over 290px of paper read as three separate things
           a long way apart, which is the opposite of a grid. Dan's reference is
           the HELP sheet, whose icons sit together. */
        <div className={`${BAND_STACK} ${compact ? "mt-3" : "mt-4"} mx-auto`}>
          {/* THE COLOUR MOVED BEHIND THE TILES (Dan, 2026-09-12, with the ☰
              and a goal card side by side: *"can you see to it that the same
              tiles with colored backgrounds behind the tiles appear under the
              SIOs rather in their current tiles with coloured backgrounds
              within the tiles?"*).

              What was here: three columns of small coloured squares on bare
              paper — the colour INSIDE each tile, via ActivityIcon's own
              background. What is here now is the ☰ menu's arrangement, which
              has been the app's since 7 Sep: a solid band per family, its
              name sideways down the left in the house ink, and the doors on
              top as raised paper outlined in the family's darkest rung.

              GROUPED BY FAMILY, which is what makes it the menu's shape
              rather than the menu's colours. A goal's doors already sorted
              themselves this way to the eye — the three Practice doors were
              one blue, the two Games doors one violet (11 Sep) — so the band
              draws a line that was already being read. A goal with doors in
              three families gets three rows; one with doors in a single
              family gets one, and `:only-of-type` rounds it on all corners so
              it does not look like a row missing its neighbours. */}
          {byFamily.map(([fam, tiles]) => (
            /* THE MENU'S OWN STRINGS, imported rather than copied (Dan,
               2026-09-12: *"make sure everything including font is
               identical"*). The first cut wrote its own classes and drifted
               at once — the names came out in the body face at --fs-micro
               where the ☰ sets the FluOLinGo hand at 16px, which is the most
               visible difference there is between two screens meant to match.
               `fam-${fam}` supplies --fam and --fam-ink, which are the tokens
               MenuGrid's PEN and INK maps hold; verify96 pins both. */
            <div key={fam} className={`${BAND} fam-${fam}`}>
              <span className={BAND_NAME}>{familyName(fam)}</span>
              {tiles.map((t) => (
                <Link key={t.key} href={t.href!} title={t.label} className={TILE}>
                  <span aria-hidden className={TILE_EMOJI}>{t.emoji}</span>
                  {/* The name is either DRAWN or announced, never both — a
                      screen reader that meets the visible label and the
                      sr-only one says every activity twice. */}
                  {labels ? (
                    <span className={TILE_NAME}>{t.label}</span>
                  ) : (
                    <span className="sr-only">{t.label}</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
