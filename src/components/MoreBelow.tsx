"use client";

/**
 * « LA SUITE EN BAS » — the end of a subsection says there is more, and points.
 *
 * Dan, 2026-09-14: *"MneMemo needs to add at the end of each subsection 'next
 * part is below' with blinking arrows"*.
 *
 * WHY A LEARNER COULD NOT TELL, measured on the built app at 390px before this
 * was written: a MneMemo panel scrolls INSIDE an `overflow-y-auto` div while
 * the page itself does not scroll at all. On `partitifs` that hid **2050px**
 * of lesson. A phone draws no scrollbar on an inner box, the page has no
 * scrollbar of its own to borrow, and the content is cut at a line of prose
 * that looks exactly like the end of one — so the lesson simply appears to
 * stop. LessonTabs' own notes record the same shape from the other side:
 * *"2512 scrollable inside 516 visible"*.
 *
 * IT CANNOT LIE, WHICH IS THE ONE RULE THIS HAD TO OBEY. A cue printed after
 * every subsection regardless would point downward at the bottom of the last
 * one, and a learner who followed it once and found nothing would never follow
 * it again. So it measures: it appears only while the scroller really has more
 * below, and it takes itself off once you reach the end.
 *
 * STICKY, NOT PLACED. It is the last child of the panel but `sticky bottom-0`,
 * so it rides the bottom edge of the visible area rather than sitting at the
 * end of 2050px nobody has reached yet. A marker at the true end of the
 * content would only be readable by someone who had already scrolled to it,
 * which is the one person who does not need it.
 *
 * IT WEARS DAN'S OWN « NEXT QUESTION » TREATMENT, and that is the point of the
 * second pass. My first version was a small gold pill with two chevrons in it,
 * and he was right about it: *"the signal is way too weak and nearly not
 * compulsive… the blinking arrows are OF ULTRA IMPORTANCE"*, then *"add
 * blinking arrows like i did for end of each SIO"*.
 *
 * So this reuses `.fluo-nextq` and `.fluo-nextq-arrows` VERBATIM rather than
 * defining a lookalike — the orange band, the blue text, and **three large ↓
 * staggered so they read as one movement downwards**. One idea, one
 * implementation: a second set of near-identical classes is how two things
 * that are meant to be the same drift apart, and it is why the weak version
 * looked like a different product's cue.
 *
 * (For the record, since it came up: nothing here removed the SpecuLearn
 * arrows. They are in `PretestFeed.tsx` and in the built bundle, untouched —
 * they had simply never existed in MneMemo, which is what this adds.)
 *
 * The blink stops for anyone who asked for less motion; the arrows stay. That
 * is `.fluo-nextq-arrows`' own rule and it comes with the classes.
 */
import { useEffect, useRef, useState } from "react";

/** Below this many pixels remaining, treat it as "you are at the end" — a few
 *  stray pixels of rounding must not keep the cue on screen forever. */
const FLOOR = 24;

/**
 * THE ROOM THE CUE RESERVES AT THE FOOT OF THE SCROLLER (Dan, 2026-09-14:
 * *"why is 'NEXT PART IS BELOW' covering the tiles partialy??"*).
 *
 * It rides the bottom edge as an overlay, so whatever the learner has scrolled
 * to sits UNDER it. Measured at 430x860 before this: ConjugaZone's « Questions
 * → » key was covered by 40px — its whole height — and goal 23's WorDrill and
 * ComposeIt tiles by 5px each. A cue that hides the control it is pointing
 * past is worse than no cue.
 *
 * So the scroller gets that much padding at its foot while the cue is up, and
 * the content can always be scrolled clear of it. `read` subtracts the same
 * number, or the padding would be its own "more below" — the exact loop the
 * zero-height rail below was written to escape.
 */
const RESERVE = 72;

/** How tall the band plus its arrows are, for the "would it cover a control?"
 *  test below. Measured, not guessed: 66px of band and arrows plus the wrap's
 *  own padding. */
const BAND_H = 96;

/** The nearest ancestor that actually scrolls.
 *
 *  FOUND BY COMPUTED STYLE, NOT BY CLASS NAME, and that is the difference
 *  between this working on one screen and on all of them. The first version
 *  looked for `.overflow-y-auto`, which is what MneMemo happens to use —
 *  ConjugaZone's panel, ComposeIt's column and the goal page's snap feed each
 *  scroll under a different class, so a class-name lookup would have found
 *  nothing and shown nothing, silently, on exactly the surfaces with the most
 *  hidden below. Measured: 435px, 2544px and 34398px respectively. */
function scrollerOf(from: Element | null): HTMLElement | null {
  let el = from?.parentElement ?? null;
  while (el) {
    const oy = getComputedStyle(el).overflowY;
    /* THE OVERFLOW TEST IS DELIBERATELY NOT HERE, and leaving it in cost two
       rounds. Requiring `scrollHeight > clientHeight` to IDENTIFY the scroller
       means that at mount — before a panel's content has filled in — nothing
       overflows, the walk finds no scroller, and the effect returns without
       attaching a single listener. It can then never recover, because the
       observers that would have caught the content arriving were the things
       not attached. Measured: MneMemo's cue stayed hidden over 2050px of
       lesson while ConjugaZone's worked, purely because ConjugaZone renders
       its content synchronously.
       So this finds the box that CAN scroll; `read` decides whether it
       currently does. */
    if (oy === "auto" || oy === "scroll") return el;
    el = el.parentElement;
  }
  return null;
}

export default function MoreBelow({
  label = "NEXT PART IS BELOW",
  flow,
}: {
  label?: string;
  /**
   * SIT IN THE SECTION'S OWN SPACE INSTEAD OF FLOATING OVER IT (Dan,
   * 2026-09-14: *"why is 'NEXT PART IS BELOW' covering the tiles
   * partialy??"*).
   *
   * The overlay is right where content flows past the bottom edge — a lesson
   * panel, a conjugation column — because there is no empty space to sit in
   * and the fade makes it legible over the last line. A SNAP SECTION is the
   * opposite: it is a fixed screen with the card pinned to the top and real
   * room underneath, so floating puts the band on goal 23's WorDrill and
   * ComposeIt tiles when it could simply stand below them. Measured at 430px:
   * 52px of overlap on both.
   *
   * In flow it is the section's last child with `margin-top: auto`, which is
   * the bottom of the screen and nothing else's business.
   */
  flow?: boolean;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const root = scrollerOf(anchor.current);
    if (!root) return;
    /* THE ROOM GOES ON THE CUE'S OWN PARENT, NOT ON THE SCROLLER, and the
       difference is the snap feed. SnapFeed draws one of these inside EVERY
       full-height `<section>`, so padding the scroller once at its foot leaves
       every section but the last still covered — measured: goal 23's WorDrill
       and ComposeIt tiles were under the cue by 52px. Padding the section
       gives each one its own strip, and because a snap section is a fixed
       height that costs no scroll length at all.

       PAY FOR THE ROOM, AND GIVE IT BACK on unmount, so a panel that stops
       drawing the cue does not keep a gap where it used to be. */
    /* IN FLOW THE CUE ALREADY HAS ITS OWN ROW, so there is nothing to
       reserve — padding the section on top of that would push the card up for
       a band that is not floating over it. */
    const host = (anchor.current?.parentElement as HTMLElement | null) ?? root;
    const had = host.style.paddingBottom;
    const before = root.scrollHeight;
    if (!flow) host.style.paddingBottom = `calc(${had || "0px"} + ${RESERVE}px)`;
    /* HOW MUCH THAT ACTUALLY COST, measured rather than assumed. On an
       auto-height column it adds RESERVE to the scroll length and must be
       subtracted back, or the padding is its own "more below" and the cue
       never turns off — the loop the zero-height rail was written to escape.
       On a fixed-height snap section it adds nothing, and subtracting a
       constant would switch the cue off a screen early. */
    const grew = Math.max(0, root.scrollHeight - before);

    /* AND IT NEVER COVERS A CONTROL — the peers lane's clause, kept when the
       two fixes for Dan's *"why is 'NEXT PART IS BELOW' covering the tiles
       partialy??"* met in a merge. They are not the same fix and BOTH are
       needed:

         reserve/flow (above)   MAKE ROOM, so the cue has somewhere of its own
                                to stand — the answer on a lesson panel and on
                                a snap section
         this clause            STAND DOWN when, despite that, a control is
                                still where the band would land

       It earns its place on a surface neither of us reached from the other
       side: ComposeIt, where Dan said *"the interface for this activity is
       completely OFF !!"* and the band sat across the « Présenter » chip grid,
       hiding « Mon voisin » and « Ma cousine » — the phrases the card had just
       told him to tap. The wrapper is `pointer-events-none`, so they were
       still clickable and simply invisible, which is worse than unclickable
       because nothing says why.

       GEOMETRIC, NOT A LIST OF SURFACES: a list would be right today and stale
       at the next drill. The scrollbar and the content still say there is more,
       and a learner who cannot see the chips has the worse problem. */
    const anchorEl = anchor.current;
    const coversAControl = () => {
      const rail = anchorEl?.getBoundingClientRect();
      if (!rail) return false;
      const top = rail.bottom - BAND_H;
      for (const el of Array.from(
        root.querySelectorAll<HTMLElement>("button, a, input, select, textarea, [role='button']"),
      )) {
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) continue;
        if (r.bottom > top && r.top < rail.bottom && r.right > rail.left && r.left < rail.right) return true;
      }
      return false;
    };

    const measure = () => {
      const below = root.scrollHeight - root.scrollTop - root.clientHeight - grew > FLOOR;
      // In FLOW the band has a row of its own and covers nothing by
      // construction, so the geometric test would only ever cost it a frame.
      // `&&` short-circuits, so the per-control sweep below never runs at all
      // on a page with nothing under the fold.
      setMore(below && (flow || !coversAControl()));
    };

    /* ONE MEASUREMENT PER FRAME, AND THE MERGE IS WHY (2026-09-15).
       The MutationObserver below watches `class` and `style` across the whole
       subtree, and `setMore` re-renders — which changes a class, which fires
       the observer, which measures again. That loop was already here and was
       harmless while measuring was two integer reads.

       It stopped being harmless the moment `coversAControl` joined it in the
       merge of the two "covering the tiles" fixes: every pass now calls
       `getBoundingClientRect()` once per control on the page, and each of those
       forces a synchronous layout. On `/lessons/deck/aliments` that pegged the
       main thread hard enough that a Playwright click with an 8s timeout took
       38 SECONDS to give up — the tap landed, the page just could not answer.
       verify220 went red and read like a flake.

       Coalescing into one rAF fixes both halves: a burst of mutations does a
       single measurement, and the re-render's own mutations land in the frame
       that is already scheduled instead of starting another. Neither lane's
       change was wrong on its own; the cost only existed once they were in the
       same function, which is the collision an integration lane is for. */
    let queued = 0;
    const read = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; measure(); });
    };
    measure();
    root.addEventListener("scroll", read, { passive: true });

    /* WATCH THE CONTENT, NOT THE SCROLLER — this is where the first version
       was wrong, and it failed in the one place that mattered most.
       A ResizeObserver on the scroller never fires when its CONTENT grows: the
       scroller's own border-box is fixed, only its `scrollHeight` changes, and
       ResizeObserver does not watch scrollHeight. So on MneMemo — whose panel
       fills in after mount — the effect measured an empty box, found nothing
       below, and hid the cue over 2050px of lesson. ConjugaZone happened to
       render its content synchronously and so happened to work, which is
       exactly how a bug like this ships.

       The column the cue sits in DOES grow with the content, so that is what
       is observed, plus the subtree for a <details> opening or an image
       landing — neither of which fires a scroll event either. */
    const column = anchor.current?.parentElement ?? null;
    const ro = new ResizeObserver(read);
    ro.observe(root);
    if (column) ro.observe(column);
    for (const child of Array.from(root.children)) ro.observe(child);
    const mo = new MutationObserver(read);
    mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["open", "hidden", "class", "style"] });
    return () => {
      root.removeEventListener("scroll", read);
      if (queued) cancelAnimationFrame(queued);
      ro.disconnect();
      mo.disconnect();
      if (!flow) host.style.paddingBottom = had;
    };
    // `flow` is a constant of the call site, never a value that changes under
    // a learner: re-running this effect would tear down the observers and the
    // reserve padding to arrive at the same answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* TAPPING IT TAKES YOU THERE (Dan, 2026-09-14: *"and that NEXT PART IS BELOW
     SHOULD BE CLICKABLE TO TAKE YOU BELOW"*).
     
     THIS REVERSES THIS FILE'S OWN RULING — it read "it is a LABEL, not a
     button: the gesture is the scroll, and a key you can press that does
     nothing is worse than no key". The premise was right and the conclusion
     was Dan's to draw: a key that DOES something is better than either. It
     looks like a key (`.neo-key`), so a learner was always going to press it.

     A SCREENFUL LESS A LITTLE, not all the way to the end: the point is to
     move to the next part, and landing at the very bottom would skip whatever
     is between. `behavior: "smooth"` so the reader keeps their place. */
  const goDown = () => {
    const root = scrollerOf(anchor.current);
    if (!root) return;
    root.scrollBy({ top: Math.max(root.clientHeight - RESERVE, 120), behavior: "smooth" });
  };

  return (
    /* ZERO FLOW HEIGHT, and this is not a tidy-up — without it the cue can
       never turn off. A `sticky` element still occupies space in normal flow,
       so the band's own height is added to what is left to scroll: it appears,
       the content grows by exactly its height, and there is now that much
       "below" again. Driven at the true bottom of a MneMemo panel it reported
       80px remaining — the band's height to the pixel — and stayed on screen
       forever, pointing at nothing. The wrapper is a zero-height rail now and
       the band hangs off it. */
    <div
      ref={anchor}
      className={flow
        /* `pb-16` CLEARS THE FLOATING STOP CHIP. A snap feed's section ends
           where the screen does, and the goal page parks its « 🎯 24 » chip on
           that same edge — measured at 430px, the band landed straight on it.
           4rem is the chip's height plus air, in rem so it grows with the type
           rather than being pinned to a pixel. */
        ? "mt-auto flex shrink-0 flex-col items-center pb-16"
        : "pointer-events-none sticky bottom-0 z-[2] h-0"}
      aria-hidden={!more}
    >
      {more && (
        /* The RAIL stays `pointer-events: none` when it FLOATS — it spans the
           scroller's whole width and would otherwise eat taps on anything
           beside the cue. In flow it occupies only its own row, so it does
           not need to give anything back. */
        <div className={flow ? "flex flex-col items-center" : "fluo-more-wrap pointer-events-none"}>
          <button
            type="button"
            onClick={goDown}
            aria-label={`${label} — go there`}
            className="neo-key fluo-nextq fluo-more-band pointer-events-auto"
          >
            {label}
          </button>
          <div className="fluo-nextq-arrows pointer-events-none" aria-hidden>
            <span>↓</span><span>↓</span><span>↓</span>
          </div>
        </div>
      )}
    </div>
  );
}
