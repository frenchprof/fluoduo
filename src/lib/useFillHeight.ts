"use client";

/**
 * MEASURE THE SCREEN THAT IS LEFT, never guess it.
 *
 * A full-height region inside the cahier — the goals feed, the lesson feed, an
 * embedded station — has to be exactly "the viewport minus everything above me
 * minus the bottom bar". Every attempt to write that as a constant has been
 * wrong: the first was `100dvh - 190px`, which left the document 162px taller
 * than the viewport at 390x840, so the site bar scrolled off the top while the
 * content was still snapping underneath — two scrollers, one undoing the other.
 *
 * The number changes with the band, the bottom bar, the phone's own toolbars
 * and whatever the page above happens to be, so it is measured on mount and on
 * every resize: collapse the box to nothing, ask the document how tall the REST
 * of the page is, take what is left.
 *
 * WRITTEN TO THE NODE, not to state. A measure-then-setState in an effect is
 * the `set-state-in-effect` fault this repo has 130 of, and it would render
 * twice for a value the DOM already has.
 *
 * Extracted on 2026-09-07 when a third caller appeared. Two copies is how
 * `gapSentence` came to exist; three is not a thing to let happen twice.
 */
import { useLayoutEffect, type RefObject } from "react";

export default function useFillHeight(ref: RefObject<HTMLElement | null>, min = 240): void {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "0px"; // collapse first, so this box is not in the sum
      // The bottom bar is `position: fixed` and `display:none` above sm, so it
      // overlays rather than adds height — ask it, do not assume. It is also
      // off by default since 6 Sep, so it is often not there at all.
      const nav = document.querySelector<HTMLElement>(".cahier-bottombar");
      const navH = nav && getComputedStyle(nav).display !== "none"
        ? nav.getBoundingClientRect().height
        : 0;
      const top = el.getBoundingClientRect().top + window.scrollY;
      el.style.height = `${Math.max(min, window.innerHeight - top - navH)}px`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [ref, min]);
}
