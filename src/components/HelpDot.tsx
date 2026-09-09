"use client";

/**
 * A small inline "?" that opens the MANUAL (/guide) from pages that live
 * OUTSIDE the CahierShell — the immersive game/practice views (Dan,
 * 2026-07-20: "provide help on all pages").
 *
 * IT USED TO OPEN MenuSplash, the twenty-tile grid, and that changed on
 * 2026-09-09: *"help should open to a 'How to use' manuel, not another grid
 * menu. We can retire the older grid menu that it opens to."* On these pages
 * the change matters more than it does in the ☰, not less: a learner who taps
 * "?" in the middle of a game is asking how something WORKS, and a grid of
 * twenty doors answered a question they had not asked. The manual is the
 * answer, and it has existed at /guide the whole time.
 *
 * Deliberately NOT a floating button: an earlier floating control once sat on
 * top of the game controls (Dan), so this renders inline in the page's own
 * header row next to the Back link, where the normal layout flow guarantees
 * it can't cover the board. Inherits text colour from its context so each
 * game's theme styles it for free.
 *
 * A LINK NOW, NOT A BUTTON, and that is the one behavioural difference worth
 * knowing: it LEAVES the game. The splash was a modal you dismissed back onto
 * the board. Reading a manual is not a two-second glance, so going to the page
 * (and coming back by the browser's own Back) is the honest shape — and a link
 * offers "open in new tab", which is what you actually want beside a game.
 */
import Link from "next/link";

export default function HelpDot({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/guide"
      onClick={() => {
        // Autonomy instrument: solicited guidance (help-seeking construct).
        // KEPT THROUGH THE REWRITE — this is research data, not decoration,
        // and the event name and payload are unchanged so the series does not
        // break across 9 Sep. Fired on click rather than on arrival because
        // the question being measured is "did the learner reach for help
        // HERE", and `location.pathname` still reads the game's own path at
        // this point; after navigation it would read /guide for every row.
        void import("@/lib/firebase/usage").then((m) =>
          m.logEvent("help.open", { path: typeof location !== "undefined" ? location.pathname : "" })
        ).catch(() => {});
      }}
      title="How to use FluOLinGo"
      aria-label="Open the manual — how to use FluOLinGo"
      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-current text-xs font-black no-underline opacity-60 transition hover:opacity-100 ${className}`}
    >
      ?
    </Link>
  );
}
