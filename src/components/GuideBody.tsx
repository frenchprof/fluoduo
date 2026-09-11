/**
 * The Guide — the one manual, at /guide.
 *
 * REWRITTEN 2026-09-11 (Dan: *"can you rewrite the guide to make it
 * clearer"*). The three one-liners it replaced were Dan's own 14 Jul cut,
 * and two of the three had stopped being true: step 1 said « Unité 0–4 flaps
 * → tap the goal », and the six flaps were retired on 7 Sep (the 3x5 grid
 * took their place, then the seven-row ☰ menu); step 3 said « After class,
 * drill with these » over nineteen tiles and no order. A learner opening
 * Help met a door that no longer existed, in shorthand.
 *
 * WHAT IT SAYS NOW: the course's own order, one line each, in plain words.
 *
 *   1  Find your stop        Home is the road; every numbered stop is a goal.
 *   2  Guess first           SpecuLearn, BEFORE the lesson; wrong costs nothing.
 *   3  Learn it              the goal's lesson, read and heard.
 *   4  Practise and play     after class; the ☰ menu top-left holds every door.
 *   5  Come back             ErroReview keeps what you got wrong; ✓ turns green.
 *
 * Each step names the real button or door a learner will see (▶ Continue,
 * ☰, SpecuLearn, ErroReview), because a guide that describes the app in its
 * own words is a second thing to learn.
 *
 * NO ACTIVITY GRID ANY MORE (Dan, same day, on seeing it folded under
 * « All the activities · 17 »: *"the activities are already on the menu"*).
 * The ☰ menu one tap away lists every activity by family, with the same
 * names and glyphs, from the same registry — so a second copy here was the
 * litmus test's definition of redundant. Step 4 points at the menu instead.
 * verify19c, which once policed that grid's spelling against the registry,
 * now holds that the grid stays gone.
 *
 * Shared between /guide and any first-visit use: `onContinue` dismisses;
 * without it Continue leads Home.
 */
import Link from "next/link";

const STEPS: { hue: number; title: string; what: React.ReactNode }[] = [
  { hue: 1, title: "Find your stop.", what: <>Home shows the road; each numbered stop is a goal. Tap yours, or press <b>▶ Continue</b>.</> },
  { hue: 3, title: "Guess first.", what: <>Open <b>💡 SpecuLearn</b> and answer <b className="cahier-hl px-0.5">before</b> the lesson. Wrong costs nothing.</> },
  { hue: 2, title: "Learn it.", what: <>Read the goal’s lesson; hear it with <b>🔊 VoixLà</b>.</> },
  { hue: 4, title: "Practise and play.", what: <>After class, drill it with a game or a deck. Every door is in the <b>☰ menu</b>, top left.</> },
  { hue: 5, title: "Come back.", what: <><b>❌ ErroReview</b> brings back what you got wrong. A stop goes <b>✓ green</b> when done.</> },
];

const CONTINUE_STYLE =
  "mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-[#9f1239] bg-[#e11d48] px-5 py-2 font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5";

export default function GuideBody({ onContinue }: { onContinue?: () => void }) {
  return (
    <>
      {/* ONE SCREEN BEFORE ANYTHING OPENS (the long-pages rule). Five cards,
          each one sentence or two, the title run into the line rather than
          set above it — the first cut stacked title and text and ran to
          1,350px on a phone; this one is measured to fit 844. */}
      <ol className="mt-2 flex flex-col gap-2">
        {STEPS.map((s, i) => (
          <li
            key={i}
            className={`fluo-h-${s.hue} flex items-start gap-2.5 rounded-xl border-2 px-3 py-2`}
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: "var(--fluo-card-accent)" }}
            >
              {i + 1}
            </span>
            <p className="min-w-0 flex-1 text-[15px] leading-snug text-[color:var(--cahier-ink)]">
              <b className="cahier-hand text-[1.15em]">{s.title}</b> {s.what}
            </p>
          </li>
        ))}
      </ol>

      {onContinue ? (
        <button type="button" onClick={onContinue} className={CONTINUE_STYLE}>
          <span aria-hidden>▶</span> Continue
        </button>
      ) : (
        <Link href="/home" className={CONTINUE_STYLE}>
          <span aria-hidden>▶</span> Continue
        </Link>
      )}
    </>
  );
}
