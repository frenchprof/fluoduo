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

/**
 * STEP 1 IS DAN'S OWN WORDING (2026-09-13), INCLUDING ITS TWO ROUTES:
 *
 *     Step 1. Select your goal.
 *       · via the map (home page) in 3D or 2D view
 *       · via the menu: enter it at the top. then OK
 *
 * It replaces "Find your stop", which named only the map — the ☰ menu's GO TO
 * field had no mention anywhere in the app that teaches the app. A `ways` list
 * exists for exactly this: a step with two doors says both, and a step with one
 * says none rather than padding itself out.
 */
type Step = {
  hue: number;
  title: string;
  what?: React.ReactNode;
  ways?: React.ReactNode[];
  /** TWO AUDIENCES, SIDE BY SIDE (Dan, 2026-09-13: *"at step 2, we need to
   *  split the instructions for those who are using it before lessons (flipped
   *  learning) vs those who are using it before tests (studying-revising). The
   *  current steps are for the first"*, then *"They can share the same steps
   *  3,4,5. Just Step 2 can be split by putting that in two side-by-side text
   *  boxes"*).
   *
   *  Only step 2 forks, which is why this is a field on one step rather than a
   *  second guide: WHEN you come to a goal changes what you do first, and
   *  nothing after it. A learner arriving before class guesses; one revising
   *  for a test checks what they already missed. Steps 3-5 are the same walk
   *  for both. */
  split?: { when: string; body: React.ReactNode }[];
};

const STEPS: Step[] = [
  {
    hue: 1,
    title: "Select your goal.",
    ways: [
      <>via the <b>map</b> (home page), in <b>3D</b> or <b>2D</b> view</>,
      <>via the <b>☰ menu</b>: type the number, then tap <b>🎯</b></>,
    ],
  },
  {
    hue: 3,
    title: "Start where you are.",
    split: [
      { when: "Before the lesson", body: <><b>💡 SpecuLearn</b> asks you first. Guess — wrong costs nothing, and it is how the lesson lands.</> },
      { when: "Before a test", body: <><b>❌ ErroReview</b> first: it keeps what you already got wrong. Then the goal’s drills.</> },
    ],
  },
  {
    hue: 2,
    title: "Learn it.",
    ways: [<>the goal’s own lesson; <b>🔊 VoixLà</b> reads any French aloud</>],
  },
  {
    hue: 4,
    title: "Practise it.",
    ways: [
      <>the <b>☰ menu</b> shows every activity for the goal you picked</>,
      <>a <b>greyed</b> tile has nothing at that stop</>,
    ],
  },
  {
    hue: 5,
    title: "Come back to what you missed.",
    ways: [
      <><b>❌ ErroReview</b> brings back what you got wrong</>,
      <>a stop turns <b>✓ green</b> when done; <b>★</b> saves any page</>,
    ],
  },
];

const CONTINUE_STYLE =
  "mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-[#9f1239] bg-[#e11d48] px-5 py-2 font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5";

export default function GuideBody({ onContinue }: { onContinue?: () => void }) {
  return (
    <>
      {/* ONE SCREEN BEFORE ANYTHING OPENS (the long-pages rule). Five cards,
          each one sentence or two, the title run into the line rather than
          set above it — the first cut stacked title and text and ran to
          1,350px on a phone; this one is measured to fit 844. */}
      <ol className="mt-1 flex flex-col gap-1.5">
        {STEPS.map((s, i) => (
          <li
            key={i}
            className={`fluo-h-${s.hue} flex items-start gap-2 rounded-xl border-2 px-2.5 py-1.5`}
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            <span
              /* On the ramp like the text beside it — a fixed 28px circle next to
                 type that grows to 20px on a desktop reads as a badge that
                 stayed small (Dan, 12 Sep: no hard-coded button sizes). */
              className="mt-0.5 flex h-[calc(1.75rem+var(--fs-step)*1.75)] w-[calc(1.75rem+var(--fs-step)*1.75)] shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: "var(--fluo-card-accent)" }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              {/* THE TITLE IS ROBOTO, THE REST IS THE HAND (Dan, 2026-09-13:
                  *"The title words right after the number must be in a bigger
                  thicker font (try Roboto) and the rest in hand font normal"*).

                  This INVERTS what was here — the title wore the hand and the
                  body wore the default. Roboto is `.cahier-body`, the face Dan
                  picked on 1 Jul for anything that must be legible fast, and a
                  heading is exactly that; the hand then carries the explaining,
                  at its normal weight, which is what `.cahier-hand` sets. */}
              <p className="cahier-hand text-[15px] font-normal leading-snug text-[color:var(--cahier-ink)]">
                <b className="cahier-body text-[1.3em] font-black">{s.title}</b>
                {s.what ? <> {s.what}</> : null}
              </p>
              {/* THE WAYS IN, AS DAN WROTE THEM (13 Sep):
                    Step 1. Select your goal.
                      · via the map (home page) in 3D or 2D view
                      · via the menu: enter it at the top. then OK
                  A step with two doors names both; a step with one names it
                  rather than padding itself out to match its neighbours. The
                  bullet is a real `ul`, so a screen reader says "list, two
                  items" instead of reading two dots. */}
              {/* FLUSH LEFT (Dan, 2026-09-13: *"the bullet points are to start
                  from the very left edge of the text boxes"*). `list-inside`
                  puts the marker in the text flow instead of hanging it in a
                  gutter, and the padding goes to zero — so a bullet begins on
                  the same vertical line as the title above it. */}
              {s.ways && (
                <ul className="cahier-hand mt-1 flex list-inside list-disc flex-col gap-0.5 pl-0 text-[13px] font-normal leading-snug text-[color:var(--cahier-ink)]">
                  {s.ways.map((w, j) => (
                    <li key={j} className="marker:text-[color:var(--fluo-card-accent)]">{w}</li>
                  ))}
                </ul>
              )}
              {/* THE TWO AUDIENCES, SIDE BY SIDE. Two columns at every width:
                  they are short and the whole point is reading them against
                  each other, which a stack destroys. */}
              {s.split && (
                <div className="mt-1 grid grid-cols-2 gap-1.5">
                  {s.split.map((b, j) => (
                    <div
                      key={j}
                      className="rounded-lg border px-1.5 py-1"
                      style={{ borderColor: "var(--fluo-card-accent)", background: "var(--cahier-paper-raised)" }}
                    >
                      <span className="cahier-body block text-[11px] font-black uppercase tracking-[0.04em] leading-tight" style={{ color: "var(--fluo-card-accent)" }}>
                        {b.when}
                      </span>
                      <span className="cahier-hand block text-[13px] font-normal leading-snug text-[color:var(--cahier-ink)]">
                        {b.body}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
