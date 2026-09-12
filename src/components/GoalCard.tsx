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
import { FAMILIES, familyOf, type FamilyKey } from "@/content/activities";
import { sioKind, sioSecondary, KIND_LABEL, type SioKind } from "@/content/sioKinds";
import { KIND_COLOR } from "@/components/HomeMap";
import { TILE, TILE_EMOJI, TILE_NAME } from "@/components/familyTile";
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
      {/* THREE SEPARATE LABELS, NOT ONE STRIP (Dan, 2026-09-12: *"they can
          actually be three spearate labels"*). The id, the unit and the kind
          are three different facts and were being read as one run of text with
          a dot in the middle of it; torn apart, each is its own scrap and the
          coloured one stops looking like a suffix. */}
      <p className="goal-scrap -mt-1 mb-3 flex flex-wrap items-center justify-start gap-[0.4em]">
        <span className="fluo-mono text-[11px] font-black uppercase tracking-wider text-[color:var(--cahier-ink)]">
          {sio.id}
        </span>
        <span className="fluo-mono text-[11px] font-black uppercase tracking-wider text-[color:var(--cahier-ink)]">
          {sio.unitLabel}
          {/* WHAT KIND OF STOP THIS IS, AS A LABELLED TAG IN THE MAP'S OWN
              PENS (Dan, 2026-09-12: *"can we tag each SIO with the four stop
              colors seen in the legend of the map? like right next to 'SIO
              -0XX UNITÉ X' in the respective colors?"*, then, on a first cut
              that drew coloured dots: *"actually i mean a real tag with the tag
              label"*).

              A DOT IS A KEY, AND A KEY NEEDS A LEGEND. That is what was wrong
              with the first version: on the map the four colours sit beside
              their words, so the colour is readable; lifted onto a goal card on
              its own it asks the learner to have memorised which of four hues
              means grammar. The word carries the meaning and the colour carries
              the link back to the map — both, or neither works.

              The words are `KIND_LABEL` and the pens are `KIND_COLOR`, the two
              the MAP itself reads. That is the whole point, and it is this
              file's own recent lesson twice over: the welcome page's four brand
              letters silently turned grey when the menu was recoloured because
              they had BORROWED family tokens, and these very doors wore the
              demand axis until the strip ruling pointed them at the family. A
              second copy of "blue means vocabulary" is a copy that will one day
              disagree with the map.

              TWO TAGS WHERE A STOP HAS A SECOND FOCUS — `sioSecondary()` already
              answers that and eleven of the fifty say yes, so one tag would have
              quietly called them all single-focus.

              EVERY SIZE HERE IS IN `em`, so the tag rides the type ramp with the
              label beside it and needs no rule of its own — Dan, the same day:
              *"PLEASE NEVER EVER HARD CODE FONT SIZES AND BUTTON SIZES"*. A tag
              is not a control, but a frozen 9px chip beside text that grows a
              third on a desktop is the same fault in smaller clothes. */}
          {/* `inline-flex`, not `flex`, and it matters: `.goal-scrap > *` forces
              its direct child to `inline-block`, so a block-level flex box here
              becomes its own line and the tags drop UNDER the label. That is
              what the first build did. */}
        </span>
        {[sioKind(sio.id), sioSecondary(sio.id)]
          .filter((k): k is SioKind => !!k)
          .map((k) => (
            <span
              key={k}
              /* BLACK, NOT WHITE (Dan, 2026-09-12, shown both rendered from
                 one build with only the ink swapped). He asked for white first
                 and changed it on seeing it measured: against these four pens
                 white runs 1.84-3.01 where small text wants 4.5, worst on the
                 green. Black runs 6.98-11.41 on the same four. The house ink
                 rather than a hex, so it follows the paper if the paper ever
                 moves. */
              className="fluo-mono rounded-[0.35em] px-[0.5em] py-[0.1em] text-[11px] font-black uppercase leading-none tracking-wider text-[color:var(--cahier-ink)]"
              style={{ background: KIND_COLOR[k] }}
            >
              {KIND_LABEL[k]}
            </span>
          ))}
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

           `w-fit` and centred, not stretched across the card: tiles spread
           over 290px of paper read as separate things a long way apart, which
           is the opposite of a grid. Dan's reference is the HELP sheet, whose
           icons sit together. With the flowing row below, `w-fit` is also what
           makes a short list centre rather than hug the left edge, while
           `max-w-full` is the wrap point — so the row breaks at the card's
           width, which is the "horizontal space" Dan means. */
        <div className={`${compact ? "mt-3" : "mt-4"} w-full overflow-hidden rounded-lg`}>
          {/* THE COLOUR IS THE TILE'S OWN BACKGROUND, AND THE ROWS ARE JUST
              ROWS (Dan, 2026-09-12, shown the goal card wearing the ☰ menu's
              full arrangement): *"there is no need to present these like in the
              grid menu layout. i just need the tiles to be laid out side by
              side, relevant bacground colors, does not matter if revise shares
              the same row as practice, so long as their background identifies
              them. this way we can layout as many as the horizontal space can
              take before it goes to the next line"*.

              THIS REVERSES THE MENU-SHAPE VERSION OF THE SAME DAY, and the
              reason is worth keeping because the earlier reading was not
              unreasonable. Asked for *"coloured backgrounds behind the tiles"*,
              the first cut gave the menu's whole structure: a band per family,
              the family's name sideways down the left, three fixed columns.
              That is the ☰'s shape, and it cost two things Dan then saw — the
              card grew about 40% taller, and every name truncated, because a
              row of three fixed columns is narrower than the card it sits in.

              What he actually wanted is smaller: the COLOUR carries the family,
              nothing else has to. So the family label goes (the colour says
              it), the per-family rows go (a row is just a row), and the tiles
              flow — as many across as the space takes, wrapping when it runs
              out. Grouping survives only as ORDER: the doors are still listed
              in the ☰'s family order, so the colours arrive in runs and the
              grouping is still legible without a single line drawn for it.

              The tile keeps its fixed width rather than stretching, which is
              what makes "as many as fit" mean the same thing on a phone and a
              desktop — and it is the menu's own width, so a door is the same
              size on both screens even though the arrangement is not.

              THE WIDTH RIDES THE TYPE RAMP, and that is not decoration: the
              name inside is `text-[16px]`, which the ramp grows to about 21px
              on a desktop. A fixed tile therefore truncated on a big screen
              and not on a phone — « GramMarathon » whole at 390px and
              « GramMara… » at 1440, which reads as a bug in the name rather
              than a mismatch between two numbers. The tile takes the same
              step as its text, so a door is the same SHAPE at every size. */}
          {/* ADAPTIVE, NOT A NUMBER. Dan, 2026-09-12, shown two per row on a
              phone: *"i hope this is adaptive width and not hard coded. i am
              pretty sure you can very easily [fit] four or more per width"*.
              He was right and it was hard-coded — `5.958rem`, lifted from the
              ☰'s own tile so a door would be the same size on both screens.
              That is a fine idea inside a 20.6rem dropdown and a bad one in a
              card that is 290px on a phone and 700px on a desktop: the width
              stopped being a proportion and became a quota of two.

              So the row is the app's SHARED tile floor (`.fluo-tilegrid`,
              globals.css) — the same rule SpecuLearn's stops, the Réglages
              picker, the games sheet and this goal's own pop-up already use.
              It counts the room: never a column wider than half, so a phone
              always gets at least two, and never narrower than a quarter, so
              it never exceeds four. Both halves are Dan's — two from 7 Sep,
              four from 11 Sep. Nothing here names a number. */}
          <div className="fluo-tilegrid" style={{ ["--tile-min" as string]: "4.5rem", ["--tile-gap" as string]: "6px" }}>
            {byFamily.flatMap(([fam, tiles]) =>
              tiles.map((t) => (
                /* WHITE WITHIN, COLOURED OUTSIDE — Dan, 2026-09-12, on a first
                   cut of this row that had painted the family colour ONTO the
                   tile: *"you changed my background again! The background
                   should be white within and colored outside!"*
                   So the colour is a pad the door stands on, not the door's own
                   fill: the family reads as the ground around it, exactly as it
                   does in the ☰, and the paper stays paper. The pad is what the
                   band used to be — one tile wide instead of a whole row. */
                <span key={t.key} className={`fam-${fam} rounded-xl p-1`}
                      style={{ background: "var(--fam)" }}>
                <Link href={t.href!} title={t.label}
                      className={`${TILE} w-full`}
                      style={{ borderColor: "var(--fam-ink)" }}>
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
                </span>
              )))}
          </div>
        </div>
      )}
    </>
  );
}
