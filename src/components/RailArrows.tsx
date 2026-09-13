"use client";

/**
 * THE FOUR EDGES — where you can go from here, said out loud.
 *
 * Dan asked for these on 2026-09-07 as *"little subtle triangular indications
 * on the left and right"*, because *"desktop does not have left right scroll,
 * so we need to provide these accessibility links"*. Both halves of that still
 * hold: the chain has one gesture, a sideways drag, and a laptop cannot make
 * one — so without these the rail is unreachable by mouse, by Tab, and by a
 * screen reader.
 *
 * ON 2026-09-12 HE REVERSED THE "SUBTLE" HALF, and the reversal is the whole
 * shape of this file now:
 *
 *     "The left and right arrow on the page edges for desktop is not loud
 *      enough to be heard. make it darker and blinking slowly. indicate what
 *      is on the other side of the edge. similarly what is above and below"
 *
 * Subtle was the right instinct and the wrong result. A 25%-ink chevron on 55%
 * paper is findable if you already know it is there, and invisible if you do
 * not — and what it has to survive is a learner who has no idea the app
 * continues past the edge of the screen. A thing nobody notices is not subtle,
 * it is absent.
 *
 * THREE CHANGES, EACH ANSWERING ONE CLAUSE:
 *
 *   darker        ink/75 on paper/90 with a real border, not ink/35 on a wash.
 *   blinking      `fluo-edge-beat`, a 4s opacity breath (globals.css). Slow
 *                 enough to read as breathing rather than as an alarm, because
 *                 it lives at the edge of vision where a fast beat nags.
 *   says where    the destination is PRINTED now, not just announced to a
 *                 screen reader in a `title`. That was the deepest fault of
 *                 the old pair: a bare chevron says "something is over there",
 *                 which is an invitation to guess. « SpecuLearn » says where.
 *
 * AND THREE EDGES, NOT TWO AND NOT FOUR. The app is a grid and only one axis
 * had any signposting:
 *
 *     left / right   the ACTIVITY   SpecuLearn -> MneMemo -> MémoiRecall
 *     down           the COURSE     goal 41 -> goal 42
 *
 * There was an UP hint for a few hours. Dan took it off the same day: *"there
 * is no need to indicate the upper page (it is understood), just need to
 * indicate the lower page"*. He is describing how a course is read — forward is
 * where you have not been, and the way back is the way you came. Down reads
 * `sioNeighbours`, the same list the pull-past-the-end gesture reads
 * (useScrollOn), so an arrow and the gesture can never come to disagree about
 * what follows what — the reason both live in lib/swipeRail.ts.
 *
 * EVERY HINT PRINTS ITS NAME AT EVERY WIDTH, and that is a correction rather
 * than a preference. The sides were built with the name as `hidden sm:inline`,
 * reasoning that a pill holding « MémoiRecall » eats a third of a 390px screen
 * and that a phone has the gesture anyway. Shown the phone mock-up, Dan asked:
 * *"we are also missing indication of left and right (or did i look at the
 * wrong mockup)?"* — they were in it, as bare chevrons. If a chevron with no
 * name does not read as an indication to the person who commissioned it, the
 * name is not the part to drop when the screen gets small.
 *
 * ONLY IN THE TOP DOCUMENT. Every station runs inside the cahier's iframe since
 * 7 Sep, and the frame's edges are not the page's edges — arrows drawn in there
 * would sit inset, over the paper, at the wrong height. Mounted inside
 * `TopLevelOnly`, so the framed copy draws none.
 *
 * AND ONLY WHERE THERE IS SOMEWHERE TO GO. `railNeighbours` and `sioNeighbours`
 * both answer null at the ends of their chain and for a page off it (Home, the
 * guide, Réglages), and an arrow pointing nowhere is worse than no arrow: it
 * promises a page that is not there.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  deckFromPath,
  railNeighbours,
  recalledRailDeck,
  sioNeighbours,
  type RailMove,
} from "@/lib/swipeRail";
import { HOME_HREF } from "@/lib/routes";

type Side = "left" | "right" | "down";

/** Which way the chevron points, as a path in an 18x18 box. */
const MARK: Record<Side, string> = {
  left: "M12 3 L5 9 L12 15",
  right: "M6 3 L13 9 L6 15",
  down: "M3 6 L9 13 L15 6",
};

/**
 * WHAT TO PRINT ON THE PILL.
 *
 * `sioNeighbours` names its moves « MneMemo · goal 42 », which is right for a
 * screen reader announcing a destination out of context — and wrong on an
 * arrow at the bottom of MneMemo, where the first half is the activity the
 * learner is already looking at. Dan's litmus test deletes exactly that: text
 * whose removal costs the reader nothing. The vertical axis changes the GOAL
 * and only the goal, so the goal is what the pill says.
 *
 * The sides keep their full name, because there the activity is the thing that
 * changes.
 */
function printed(side: Side, name: string): string {
  if (side === "left" || side === "right") return name;
  const tail = name.split(" · ").pop() ?? name;
  return tail.charAt(0).toUpperCase() + tail.slice(1);
}

/** What the arrow is FOR, said the way a learner would say it. The full name
 *  stays here — a screen reader hears the destination with nothing around it,
 *  so « goal 42 » alone would not say which activity's goal 42. */
function phrase(side: Side, name: string): string {
  if (side === "left") return `Back to ${name}`;
  if (side === "right") return `On to ${name}`;
  return `Down to ${name}`;
}

function Arrow({ side, move }: { side: Side; move: NonNullable<RailMove> }) {
  const label = phrase(side, move.name);

  /* FIXED TO THE VIEWPORT EDGE. Not inside the page: the page is a sheet on a
     desk with a margin, and a hint indented by that margin reads as part of the
     sheet rather than as the way off it. z-30 sits over the paper and under the
     ⋯ sheets and popups (z-40+). The bottom one clears the bottom bar's floor
     using the var the bar itself publishes. */
  /* THE MIDDLE IS A NO-GO ZONE (Dan, 2026-09-13: *"Can we have a no-go zone in
     the middle of those activities like MémoiRecall, where the left right
     swiping indicators are blocking the essential part of the exercise"*).

     The two side pills were `top-1/2`, which on a 390x844 phone put them at
     y 400-444 — the exact middle of the screen, and measured on Flip It that
     is on top of the card: the word a learner is reading. Measured before:
     all three pills overlapped the main panel.

     They sit at 76% now, below the centre band and above the bottom pill, so
     the middle 40% of the viewport carries no navigation at all. A percentage,
     not a pixel, so the band scales with the screen rather than drifting up it
     on a tall one. */
  const place: Record<Side, string> = {
    left: "left-0.5 top-[76%] -translate-y-1/2",
    right: "right-0.5 top-[76%] -translate-y-1/2",
    down: "left-1/2 -translate-x-1/2",
  };

  return (
    <Link
      href={move.href}
      aria-label={label}
      title={label}
      style={side === "down" ? { bottom: "calc(var(--bottombar-floor, 8px) + 10px)" } : undefined}
      /* DARKER, AND A BUTTON RATHER THAN A WATERMARK. The old pair was
         `bg-paper/55 text-ink/35` with no border — which on the LEFT edge, over
         the dark spiral binding, disappeared completely. Full-strength paper, a
         real 2px ink border and ink/75 for the mark give the same mark
         something to sit on at either edge.
         `fluo-hit44` is deliberately NOT used: it sets `position: relative` from
         globals.css, which loads after Tailwind, and at equal specificity it
         wins — which once dropped both links into normal flow at the foot of the
         page, each spanning the full width and breaking Dan's own rule that no
         single control wears the page's width. The 44px floor is drawn here
         honestly instead. */
      className={`fluo-edge-beat fixed z-30 flex min-h-11 items-center gap-1.5 rounded-full border-2 border-[color:var(--cahier-ink)]/45 bg-[color:var(--cahier-paper)] px-2.5 text-[color:var(--cahier-ink)]/75 no-underline shadow-sm transition hover:border-[color:var(--cahier-ink)] hover:text-[color:var(--cahier-ink)] focus-visible:border-[color:var(--cahier-ink)] focus-visible:text-[color:var(--cahier-ink)] ${place[side]}`}
    >
      {/* The mark leads on the way BACK and trails on the way ON, so the
          chevron always sits on the side of the pill it points at. */}
      {side === "left" && (
        <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden focusable="false" className="shrink-0">
          <path d={MARK[side]} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {/* THE NAME, PRINTED, AT EVERY WIDTH (Dan, 2026-09-12: *"we are also
          missing indication of left and right (or did i look at the wrong
          mockup)?"*).

          He had not looked at the wrong mockup. The side arrows WERE in it —
          as bare chevrons, because the name was `hidden sm:inline` and a phone
          never reached `sm`. Which is the answer: a chevron with no name did
          not read as an indication of anything, even to the person who asked
          for it. If the name is what makes it an indication, it cannot be the
          part that is dropped when the screen gets small. */}
      {/* The app's own micro step, not a pinned pixel — it is fluid with the
          rest of the type scale (globals.css --fs-*). */}
      {/* THE GLYPH, NOT THE WORD (Dan, 2026-09-13: *"SIMPLY REPLACE WITH THE
          RELEVANT EMOJI"*, retracting his own suggestion of setting the words
          sideways along the screen edge).

          WHY THIS IS NOT A LOSS OF THE THING HE ASKED FOR ON 12 SEP. The name
          was printed at every width because a bare chevron *"did not read as an
          indication of anything"* — true, and the fix then was the name. A
          glyph is the other answer to the same complaint: 📚 says MneMemo in
          one character where the word needed eight, on the edge of a phone
          screen that has none to spare. The full name stays in `aria-label` and
          `title`, so a screen reader and a hover still get the destination in
          words — nothing is lost that a learner could not already see.

          AND THE BASE CARRIES THE GOAL NUMBER (Dan, same message: *"at the base
          we should also see the bullseye emoji and the number for swiping"*).
          That arrow moves between GOALS with the activity unchanged, so the
          number is the only part that differs and the 🎯 says which axis it is.

          The emoji comes from the registry via the station's key — one glyph
          per activity, decided once. A name with no glyph (none today) still
          prints its word rather than an empty pill. */}
      <span className="whitespace-nowrap text-[length:var(--fs-micro)] font-black leading-none">
        {move.emoji
          ? <>
              <span aria-hidden className="text-[1.35em] leading-none">{move.emoji}</span>
              {move.num !== undefined && <span className="ml-0.5 tabular-nums">{move.num}</span>}
            </>
          : printed(side, move.name)}
      </span>
      {(side === "right" || side === "down") && (
        <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden focusable="false" className="shrink-0">
          <path d={MARK[side]} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Link>
  );
}

export default function RailArrows() {
  const path = usePathname() ?? HOME_HREF;
  // The remembered deck lives in localStorage, which does not exist on the
  // server — so the first render uses only what the PATH says, and the deck a
  // learner was last working on is folded in after mount. Reading it during
  // render would hand the server one destination and the client another.
  const [deck, setDeck] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage does not exist on the server, so the remembered deck cannot be read during render; after mount is the only place it can be read at all, and the first render already renders correctly from the path alone.
  useEffect(() => { setDeck(deckFromPath(path) ?? recalledRailDeck()); }, [path]);

  /* THE WHOLE "WHERE DOES THE TOP HINT GO" PROBLEM WENT WITH THE HINT
     (Dan, 2026-09-12: *"there is no need to indicate the upper page (it is
     understood), just need to indicate the lower page"*).

     Placing it took three goes and an effect that measured the heading band
     across the frame boundary, and none of that exists any more. Worth one
     line of history because it was a real finding: a page has no empty row to
     drop furniture into — under the band is the tab strip, under that the
     level chooser — so the answer was the band's own middle, which is empty by
     construction. If anything ever needs to float at the top again, that is
     where it goes.

     Going UP is still reachable without this: the ✕, the ☰ and the map all
     lead back. What it costs is the one-tap route on a laptop, which has no
     upward gesture — Dan weighed that and called the upper page understood. */

  const here = deck ?? deckFromPath(path);
  const { back, forward } = railNeighbours(path, here);
  const { down } = sioNeighbours(path, here);
  return (
    <>
      {back && <Arrow side="left" move={back} />}
      {forward && <Arrow side="right" move={forward} />}
      {down && <Arrow side="down" move={down} />}
    </>
  );
}
