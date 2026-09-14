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

export default function MoreBelow({ label = "NEXT PART IS BELOW" }: { label?: string }) {
  const anchor = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);

  useEffect(() => {
    const root = scrollerOf(anchor.current);
    if (!root) return;
    const read = () => {
      setMore(root.scrollHeight - root.scrollTop - root.clientHeight > FLOOR);
    };
    read();
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
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    /* ZERO FLOW HEIGHT, and this is not a tidy-up — without it the cue can
       never turn off. A `sticky` element still occupies space in normal flow,
       so the band's own height is added to what is left to scroll: it appears,
       the content grows by exactly its height, and there is now that much
       "below" again. Driven at the true bottom of a MneMemo panel it reported
       80px remaining — the band's height to the pixel — and stayed on screen
       forever, pointing at nothing. The wrapper is a zero-height rail now and
       the band hangs off it. */
    <div ref={anchor} className="pointer-events-none sticky bottom-0 z-[2] h-0" aria-hidden={!more}>
      {more && (
        <div className="fluo-more-wrap">
          <p className="neo-key fluo-nextq fluo-more-band">{label}</p>
          <div className="fluo-nextq-arrows" aria-hidden>
            <span>↓</span><span>↓</span><span>↓</span>
          </div>
        </div>
      )}
    </div>
  );
}
