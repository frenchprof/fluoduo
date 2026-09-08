"use client";

/**
 * TWO SMALL TRIANGLES ON THE EDGES — the rail, for people who cannot swipe.
 *
 * Dan, 2026-09-07: *"can you also add little subtle triangular indications on
 * the left and right to indicate that there is something to see if we scroll
 * horizontally?"*, and immediately the reason: *"because desktop does not have
 * left right scroll, so we need to provide these accessibility links"*.
 *
 * He is right twice over, and the second point is the sharper one. The chain
 * has had exactly one way along it since 6 Sep — a horizontal drag — and a
 * finger is the only thing that can make one. On a laptop there is no sideways
 * gesture at all, so the whole rail was unreachable: no keyboard route, no
 * pointer route, nothing. Anyone not using a touchscreen simply could not move
 * between stations except through the menu. These are real links, so they work
 * for a mouse, for Tab and Enter, and for a screen reader, which the gesture
 * never did.
 *
 * THEY SAY WHERE THEY GO, without printing it. The triangle carries no label —
 * Dan asked for "subtle", and a word at each edge would be two more things to
 * read on every screen — but each one has the destination in its `aria-label`
 * and its `title`, so a screen reader announces « Back to Skills » and a mouse
 * hovering gets the same in a tooltip. An icon-only link that announces nothing
 * is a link nobody can use; that lesson is already written down on the goal
 * card's icon grid.
 *
 * ONLY IN THE TOP DOCUMENT. Every station runs inside the cahier's iframe since
 * 7 Sep, and the frame's edges are not the page's edges — arrows drawn in there
 * would sit inset, over the paper, at the wrong height. Mounted inside
 * `TopLevelOnly`, so the framed copy draws none.
 *
 * AND ONLY WHERE THERE IS SOMEWHERE TO GO. `railNeighbours` answers null at the
 * ends of the chain and for a page off it (Home, the guide, Réglages), and an
 * arrow pointing nowhere is worse than no arrow: it promises a page that is not
 * there.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { deckFromPath, railNeighbours, recalledRailDeck, type RailMove } from "@/lib/swipeRail";

function Arrow({ side, move }: { side: "left" | "right"; move: NonNullable<RailMove> }) {
  const label = side === "left" ? `Back to ${move.name}` : `On to ${move.name}`;
  return (
    <Link
      href={move.href}
      aria-label={label}
      title={label}
      /* FIXED TO THE VIEWPORT EDGE, vertically centred. Not inside the page:
         the page is a sheet on a desk with a margin, and an arrow indented by
         that margin reads as part of the sheet rather than as the way off it.
         z-30 sits over the paper and under the ⋯ sheets and popups (z-40+). */
      /* SHOWN ON A PHONE TOO. The accessibility case is desktop's — there is no
         sideways gesture on a laptop at all — but Dan's first sentence is about
         INDICATING that something is there, which a thumb-driven learner needs
         just as much: the swipe was undiscoverable by design. They sit on the
         desk margin outside the sheet, so they cover nothing at 390px. */
      /* THE TAP TARGET IS THE BOX, NOT `fluo-hit44`. That helper sets
         `position: relative` and lives in globals.css, which loads AFTER
         Tailwind — so at equal specificity it won the position and these two
         links fell into normal flow, stacked at the foot of the page, each one
         spanning the full 390px. Which also broke Dan's own 5 Sep rule that no
         single control ever wears the page's width. `h-11 w-11` is the same
         44px floor drawn honestly. */
      /* A FAINT DISC UNDER THE MARK. Driven at 390px first without one: the
         RIGHT arrow read fine against the desk, and the LEFT one vanished — it
         lands on the spiral binding, which is a dark coil over a dark spine, so
         a 25%-ink chevron on top of it is invisible. Paper at 55% is enough to
         separate the mark from whatever is behind it and still not enough to
         read as a button, which is what "subtle" has to mean here. */
      className={`fixed top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-[color:var(--cahier-paper)]/55 text-[color:var(--cahier-ink)]/35 no-underline backdrop-blur-[1px] transition hover:bg-[color:var(--cahier-paper)]/85 hover:text-[color:var(--cahier-ink)]/75 focus-visible:text-[color:var(--cahier-ink)]/75 ${
        side === "left" ? "left-0.5" : "right-0.5"
      }`}
    >
      {/* AN SVG, NOT A GLYPH. ◀ and ▶ are not in any of the three faces this
          app ships (FluOLinGo Hand, Roboto, Patrick Hand), so a character here
          would summon a fourth from the system — the exact thing Dan ruled out
          on 6 Sep, and invisibly, because it would only appear on the two
          smallest marks on the screen. `currentColor` keeps the hover in CSS. */}
      <svg width="11" height="18" viewBox="0 0 11 18" aria-hidden focusable="false">
        <path
          d={side === "left" ? "M10 1 L2 9 L10 17" : "M1 1 L9 9 L1 17"}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

export default function RailArrows() {
  const path = usePathname() ?? "/";
  // The remembered deck lives in localStorage, which does not exist on the
  // server — so the first render uses only what the PATH says, and the deck a
  // learner was last working on is folded in after mount. Reading it during
  // render would hand the server one destination and the client another.
  const [deck, setDeck] = useState<string | null>(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage does not exist on the server, so the remembered deck cannot be read during render; after mount is the only place it can be read at all, and the first render already renders correctly from the path alone.
  useEffect(() => { setDeck(deckFromPath(path) ?? recalledRailDeck()); }, [path]);

  const { back, forward } = railNeighbours(path, deck ?? deckFromPath(path));
  return (
    <>
      {back && <Arrow side="left" move={back} />}
      {forward && <Arrow side="right" move={forward} />}
    </>
  );
}
