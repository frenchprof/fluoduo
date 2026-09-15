/**
 * /games/numbers/embed — Numbers, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and then *"proceed the remaining unframed
 * surfaces"*. `/games/numbers` is the page a learner opens; this is what runs in the
 * frame it holds, and it is the SAME component the page rendered directly
 * before, so the two cannot drift.
 *
 * The chrome is hidden by CSS in a framed document (`html[data-embed]` in
 * globals.css), so nothing here had to change to lose its notebook.
 */
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

/**
 * 🔢 Numbers — the hub-tab over the two number-listening games (Dan,
 * 2026-08-31: "park NumBus / NumBourse under a hub-tab Numbers").
 *
 * Both games drill the same skill — hear a French number, type its digits —
 * at two temperatures, so they share one Menu tile and this one door. The
 * game routes themselves are untouched: banked answers, ledger prefixes and
 * evidence tags all still point at /games/numbus and /games/numbourse.
 */
export const metadata = { title: "Numbers — FluOLinGo" };

const GAMES = [
  {
    href: "/games/numbus",
    emoji: "🚌",
    name: "NumBus",
    blurb: "Type the number you hear. Your pace.",
    hue: "#e0567f",
  },
  {
    href: "/games/numbourse",
    emoji: "📈",
    name: "NumBourse",
    blurb: "Same, shouted, against the clock.",
    hue: "#0f8a5f",
  },
];

export default function Page() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "games")} active="numbers">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">🔢 Numbers</h1>
        <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">
          Hear a French number, type its digits — gently, then against the clock.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {GAMES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              /* BREAK OUT OF THE FRAME (Dan, 2026-09-14: *"Numbers is now
                 nesting numbus - what did you break"* — nothing; measured
                 identical on the tree from before that day's merges).
                 Every station runs in an iframe since 7 Sep, so THIS page is
                 the framed document, and a plain link navigates the FRAME:
                 NumBus then draws its own whole notebook — site bar, coils,
                 band — inside the Numbers band that is still wrapped around
                 it, and the address bar says /games/numbus while the band
                 says Numbers. `_top` sends the destination to the window,
                 which is where a whole page belongs. It costs a full load
                 instead of a soft route change; a page drawn twice costs more
                 than that. */
              target="_top"
              title={g.blurb}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-6 text-center shadow-[2px_2px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
              style={{ borderColor: g.hue }}
            >
              <span className="text-5xl" aria-hidden>{g.emoji}</span>
              {/* NAME AND ICON ONLY — no description inside the button (Dan,
                  5 Sep: "we dont want the description of those activities in
                  the buttons"). The hubs had already dropped theirs; these two
                  tiles were the last controls in the app still carrying a
                  sentence. The blurbs stay in the data for the title, which is
                  where a learner who wants the difference can still get it. */}
              <span className="text-lg font-black text-[color:var(--cahier-ink)]">{g.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </CahierShell>
  );
}
