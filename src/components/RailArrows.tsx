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
 * AND NOW ALL FOUR EDGES, because the app is a grid and only one axis had any
 * signposting at all:
 *
 *     left / right   the ACTIVITY   SpecuLearn -> MneMemo -> MémoiRecall
 *     up / down      the COURSE     goal 23 -> goal 24 -> goal 25
 *
 * The vertical pair reads `sioNeighbours`, the same list the pull-past-the-end
 * gesture reads (useScrollOn), so an arrow and the gesture can never come to
 * disagree about what follows what — the reason both live in lib/swipeRail.ts.
 *
 * THE LABEL IS DESKTOP-AND-UP FOR THE SIDES, always for the top and bottom. A
 * side pill wide enough to hold « MémoiRecall » eats a third of a 390px screen
 * and sits over the paper; the top and bottom have the width to spare. A phone
 * also HAS the gesture, so the side hint there is a reminder rather than the
 * only way through — which is exactly the asymmetry Dan named when he said
 * "for desktop".
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

type Side = "left" | "right" | "up" | "down";

/** Which way the chevron points, as a path in an 18x18 box. */
const MARK: Record<Side, string> = {
  left: "M12 3 L5 9 L12 15",
  right: "M6 3 L13 9 L6 15",
  up: "M3 12 L9 5 L15 12",
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
  if (side === "up") return `Up to ${name}`;
  return `Down to ${name}`;
}

function Arrow({ side, move, topOffset }: { side: Side; move: NonNullable<RailMove>; topOffset: number }) {
  const label = phrase(side, move.name);
  const vertical = side === "up" || side === "down";

  /* FIXED TO THE VIEWPORT EDGE. Not inside the page: the page is a sheet on a
     desk with a margin, and a hint indented by that margin reads as part of the
     sheet rather than as the way off it. z-30 sits over the paper and under the
     ⋯ sheets and popups (z-40+).

     THE TOP ONE CLEARS THE SITE BAR. `.cahier-sitebar` is sticky at top-0 and
     also z-30, so a hint at top-0 would land on the ☰ — the one control a
     learner must always be able to reach. 3.5rem puts it just under the bar.
     The bottom one clears the bottom bar's floor the same way, using the var
     the bar itself publishes. */
  const place: Record<Side, string> = {
    left: "left-0.5 top-1/2 -translate-y-1/2",
    right: "right-0.5 top-1/2 -translate-y-1/2",
    up: "left-1/2 -translate-x-1/2",
    down: "left-1/2 -translate-x-1/2",
  };

  return (
    <Link
      href={move.href}
      aria-label={label}
      title={label}
      style={
        side === "up"
          ? { top: topOffset }
          : side === "down"
            ? { bottom: "calc(var(--bottombar-floor, 8px) + 10px)" }
            : undefined
      }
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
      /* THE UP/DOWN PAIR IS DESKTOP-AND-UP, and this is the placement problem
         rather than a preference. The pill sits in the heading band's empty
         middle — which exists at 1280px, where the title ends around a third
         of the way across, and does NOT exist at 430px: driven there, « Goal
         40 » landed squarely on « MNEMEMO ». Every alternative depth was worse
         (below the band is the tab strip; below that is the level chooser),
         because a page has no empty row — that is where its content is.

         And the reason these exist points the same way. Dan's own brief for
         them: *"desktop does not have left right scroll, so we need to provide
         these accessibility links"*. A phone HAS the vertical gesture — pull
         past the end and the next goal arrives — so the hint there is a
         nicety, while on a laptop it is the only way through. */
      className={`fluo-edge-beat fixed z-30 ${vertical ? "hidden sm:flex" : "flex"} min-h-11 items-center gap-1.5 rounded-full border-2 border-[color:var(--cahier-ink)]/45 bg-[color:var(--cahier-paper)] px-2.5 text-[color:var(--cahier-ink)]/75 no-underline shadow-sm transition hover:border-[color:var(--cahier-ink)] hover:text-[color:var(--cahier-ink)] focus-visible:border-[color:var(--cahier-ink)] focus-visible:text-[color:var(--cahier-ink)] ${place[side]}`}
    >
      {/* The mark leads on the way BACK and trails on the way ON, so the
          chevron always sits on the side of the pill it points at. */}
      {(side === "left" || side === "up") && (
        <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden focusable="false" className="shrink-0">
          <path d={MARK[side]} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {/* THE NAME, PRINTED. `hidden sm:inline` on the sides only — see the
          header: a pill holding « MémoiRecall » is a third of a 390px screen.
          Top and bottom have the width and show it at every size. */}
      <span
        className={`whitespace-nowrap text-[12px] font-black leading-none ${vertical ? "" : "hidden sm:inline"}`}
      >
        {printed(side, move.name)}
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

  /**
   * WHERE THE TOP HINT CLEARS TO — measured, not guessed.
   *
   * A fixed 3.5rem put it on the heading band: driven at 1280px on MneMemo, the
   * pill landed across the « MNEMEMO » strip. And a bigger fixed number is no
   * better, because the band is not always there — Home has none, a drill's is
   * its own, and `band={false}` pages have nothing between the site bar and the
   * paper. Any constant is wrong on some page.
   *
   * So it asks the page. `.page-band` is the strip's own class, and where there
   * is no band the site bar's height answers instead; 3.5rem is the floor for
   * neither. Re-measured on navigation and on resize, because both change it.
   */
  const [topOffset, setTopOffset] = useState(56);
  useEffect(() => {
    const measure = () => {
      // THE BAND IS USUALLY IN THE FRAME, and that is where this first went
      // wrong. Every station runs inside the cahier's iframe since 7 Sep, so a
      // drill's heading strip is in ANOTHER document — `document.querySelector`
      // here found nothing, fell back to the site bar, and the pill landed
      // across « MNEMEMO » anyway. Measured at 1280px: 77px, with the band
      // running from 66 to 122.
      //
      // Same-origin, so the frame is simply readable; the only arithmetic is
      // the frame's own offset, as in FirstTour's measureScopes.
      // IT SITS *ON* THE BAND, IN THE MIDDLE OF IT — not under everything.
      //
      // Two attempts at "below the furniture" both failed, and they failed the
      // same way: whatever you clear, something is under it. Clearing the band
      // put the pill across MneMemo's « Idée » tab; clearing the tabs too put
      // it across the « Moyen » level button. There is no depth at which a
      // page is reliably empty, because that is where the page's content is.
      //
      // The band, though, has a permanently empty middle: its title is hard
      // left and its goal chip hard right, by construction on every page that
      // draws one. So the hint lands in that gap — furniture on furniture,
      // colliding with nothing, and read as part of the frame rather than as
      // something dropped on the work.
      //
      // No band (Home, Réglages) means nothing to sit on, so it tucks just
      // under the site bar, where those pages start with air anyway.
      let top = 0;
      const scan = (doc: Document, dy: number) => {
        const band = doc.querySelector(".page-band");
        if (band) {
          const r = band.getBoundingClientRect();
          if (r.height > 0) top = Math.max(top, r.top + dy + (r.height - 44) / 2);
          return;
        }
        const bar = doc.querySelector(".cahier-sitebar");
        if (bar) {
          const r = bar.getBoundingClientRect();
          if (r.height > 0) top = Math.max(top, r.bottom + dy + 10);
        }
      };
      scan(document, 0);
      for (const f of Array.from(document.querySelectorAll("iframe"))) {
        let d: Document | null = null;
        try { d = f.contentDocument; } catch { d = null; }
        if (d) scan(d, f.getBoundingClientRect().top);
      }
      // CLAMPED, so a mis-measure can never park the hint in the middle of the
      // paper. A thing that says "up" belongs near the top; below a quarter of
      // the screen it stops reading as an edge at all.
      const cap = Math.max(56, Math.round(window.innerHeight * 0.26));
      setTopOffset(Math.min(cap, Math.max(56, Math.round(top))));
    };
    measure();
    const id = window.setTimeout(measure, 400); // after the shell settles
    window.addEventListener("resize", measure);
    return () => { window.clearTimeout(id); window.removeEventListener("resize", measure); };
  }, [path]);

  const here = deck ?? deckFromPath(path);
  const { back, forward } = railNeighbours(path, here);
  const { up, down } = sioNeighbours(path, here);
  return (
    <>
      {back && <Arrow side="left" move={back} topOffset={topOffset} />}
      {forward && <Arrow side="right" move={forward} topOffset={topOffset} />}
      {up && <Arrow side="up" move={up} topOffset={topOffset} />}
      {down && <Arrow side="down" move={down} topOffset={topOffset} />}
    </>
  );
}
