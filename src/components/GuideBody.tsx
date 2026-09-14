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
 *   5  Come back             ErroReview keeps what you got wrong; a done stop sits flat and pale.
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
      <>via the <b>☰</b> : type the number, then tap <b>🎯</b></>,
    ],
  },
  {
    hue: 3,
    title: "Start where you are.",
    // THE SAME ACTIVITY, TWO FRAMINGS — NOT TWO ACTIVITIES (Dan, 2026-09-13:
    // *"SpecuLearn is indeed for pre-lessons, but there are people who are
    // discovering the app for the first time before their tests. so we cannot
    // tell them it is for their pre-lessons. They can still go through the same
    // SpecuLearn but as revision. That was what i meant by step 2! (NOT
    // ERROREVIEW!)"*
    //
    // The first cut sent the revising learner to ErroReview, which was wrong on
    // its own terms: ErroReview replays what you have ALREADY got wrong, so it
    // is empty for someone opening the app for the first time the week of a
    // test — the exact person this half is for. Both halves are SpecuLearn.
    // What changes is what the learner is told it is FOR.
    split: [
      { when: "Before the lesson", body: <><b>💡 SpecuLearn</b> — guess first. You are not meant to know it yet.</> },
      { when: "Before a test", body: <>the same <b>💡 SpecuLearn</b> — use it to find what you do not know yet.</> },
    ],
  },
  // LEARN IT IS MneMemo, NOT VoixLà (Dan, 2026-09-13: *"Learn it is not via
  // VoixLà. You're giving all the wrong instructions!"*). Checked against the
  // registry rather than written from memory a third time:
  //
  //     lesson  ->  📚 MneMemo  "The lesson: rule, then practice."  href: null
  //     tts     ->  🔊 VoixLà   "Type French, hear it back, get it checked."
  //
  // VoixLà is a CHECKING tool and lives in Oral; it has no part in learning the
  // goal. MneMemo has `href: null` on purpose — it opens from the stop you
  // picked in step 1, which is why the bullet names the goal and not a door.
  {
    hue: 2,
    title: "Learn it.",
    // MneMemo IS USED WITH MémoiRecall (Dan, 2026-09-13: *"MneMemo is meant to
    // be used with the flashcards in MemoiRecall! *spaced repetition"*). The
    // rule is read once; the cards bring it back on a schedule, which is the
    // half that makes it stick. Naming only MneMemo taught half the method.
    ways: [
      <><b>📚 MneMemo</b> — the rule, then practice. It opens from the goal you picked.</>,
      <>then <b>🃏 MémoiRecall</b> — its flashcards bring the rule back, spaced out</>,
    ],
  },
  {
    hue: 4,
    // EACH ACTIVITY BY NAME (Dan, 2026-09-13: *"Practice It: cite each of the
    // activity"*). "Every activity for the goal" told a learner nothing they
    // could act on — it named a menu, not the things in it. Grouped by the row
    // they sit in, using the row names as renamed the same day.
    title: "Practise it.",
    ways: [
      <><b>Drill</b>: 🔤 ConjugaZone · 🏃 GramMarathon · ❌ ErroReview</>,
      <><b>Amuse</b>: 🔢 Numbers · 🌧️ VocabulaRain · 🔐 LexicaLocker</>,
      <><b>Speak</b>: 🔊 VoixLà · 🎙️ WorDrill · 🎧 ÉcouTexte</>,
      <>a <b>greyed</b> tile has nothing at that stop</>,
    ],
  },
  {
    hue: 5,
    title: "Come back to what you missed.",
    ways: [
      <><b>❌ ErroReview</b> brings back what you got wrong</>,
      // "pressed flat and paler", NOT "✓ green" (13 Sep). The map dropped the tick
      // on 6 Sep (Map2DGrid.tsx: "there is no ✓ at all now — the fill says it");
      // a done stop is the pressed-down coin in its kind's wash, number kept.
      // Two learner guides copied the old line from here before it was noticed.
      <>a done stop is <b>pressed flat</b> and paler; <b>★</b> saves any page</>,
    ],
  },
];

const CONTINUE_STYLE =
  "mt-3 inline-flex items-center gap-2 rounded-xl border-2 border-[#9f1239] bg-[#e11d48] px-5 py-2 font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5";

export default function GuideBody({ onContinue }: { onContinue?: () => void }) {
  return (
    <>
      {/* EACH STEP IS A FOLD, AND THEY ALL START CLOSED (Dan, 2026-09-14:
          *"can i suggest that, for the QuickGuide, each item be collapsable"*).

          Five titles is the whole argument — select a goal, start where you
          are, learn it, practise it, come back to what you missed — and it is
          the argument that must fit one screen (the long-pages rule). The
          detail under each is what you consult, so it folds.

          NATIVE `<details>`/`<summary>`, per that rule: keyboard and screen
          reader support come free, it needs no state, and it survives having
          no JavaScript. The summary is not a bare chevron — it carries the
          step's number and its title, which is what says what is behind it. */}
      <ol className="mt-1 flex flex-col gap-1">
        {STEPS.map((s, i) => (
          <li
            key={i}
            className={`fluo-h-${s.hue} rounded-xl border-2 px-2.5 py-1`}
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            <details className="fluo-guide-step">
            {/* THE BADGE AND THE TITLE SHARE A ROW; EVERYTHING BELOW STARTS AT
                THE CARD'S OWN LEFT EDGE (Dan, 2026-09-13: *"START THE BULLET
                POINTS FROM THE VERY LEFT!"*, then *"those two boxes side by
                side also start earlier!"* and *"BUY BACK SPACE ALL AND ANY
                SPACE"*).

                The card was ONE two-column flex — badge left, everything else
                in a column beside it — so the bullets AND the two split boxes
                began under the TITLE, indented past the badge by the badge's
                width plus its gap. Dan's mock starts them at the card's own
                padding edge.

                Splitting the badge row off fixes alignment and buys space in
                the same stroke: every line below is wider by the badge column,
                so it wraps less often. That is the point — the indent was
                costing horizontal room on the device with least of it. */}
            <summary className="flex cursor-pointer list-none items-start gap-2">
              <span
                /* On the ramp like the text beside it — a fixed 28px circle next
                   to type that grows on a desktop reads as a badge that stayed
                   small (Dan, 12 Sep: no hard-coded button sizes). */
                className="mt-0.5 flex h-[calc(1.75rem+var(--fs-step)*1.75)] w-[calc(1.75rem+var(--fs-step)*1.75)] shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
                style={{ background: "var(--fluo-card-accent)" }}
              >
                {i + 1}
              </span>
              {/* THE TITLE IS ROBOTO, THE REST IS THE HAND (Dan, 13 Sep: *"The
                  title words right after the number must be in a bigger thicker
                  font (try Roboto) and the rest in hand font normal"*). This
                  INVERTS what was here. Roboto is `.cahier-body`, his own pick
                  for anything that must be legible fast. */}
              <p className="cahier-hand min-w-0 flex-1 text-[15px] font-normal leading-snug text-[color:var(--cahier-ink)]">
                <b className="cahier-body text-[1.3em] font-black">{s.title}</b>
              </p>
              <span aria-hidden className="fluo-guide-chev mt-0.5 shrink-0 text-[13px] font-black" style={{ color: "var(--fluo-card-accent)" }}>▾</span>
            </summary>
            {s.what && (
              <p className="cahier-hand mt-0.5 text-[15px] font-normal leading-snug text-[color:var(--cahier-ink)]">{s.what}</p>
            )}
            {/* THE WAYS IN, AS DAN WROTE THEM:
                  · via the map (home page) in 3D or 2D view
                  · via the menu: enter it at the top. then OK
                The dot is its own column, so a line that wraps hangs under the
                words rather than under the dot. The text sits in a SPAN because
                `.cahier-page li` sets `font-size: var(--fs-body)` at (0,1,1) and
                outranks a `text-[13px]` utility — which is why these rendered at
                16px however they were labelled, and every one wrapped. */}
            {s.ways && (
              <ul className="mt-0.5 flex flex-col pl-0">
                {s.ways.map((w, j) => (
                  <li key={j} className="flex gap-1">
                    <span aria-hidden className="cahier-hand text-[13px] leading-snug" style={{ color: "var(--fluo-card-accent)" }}>•</span>
                    <span className="cahier-hand min-w-0 flex-1 text-[13px] font-normal leading-snug text-[color:var(--cahier-ink)]">{w}</span>
                  </li>
                ))}
              </ul>
            )}
            {/* THE TWO AUDIENCES, SIDE BY SIDE and at the card's left edge.
                Two columns at every width: they are short, and the whole point
                is reading them against each other, which a stack destroys. */}
            {s.split && (
              <div className="mt-0.5 grid grid-cols-2 gap-1">
                {s.split.map((bx, j) => (
                  <div
                    key={j}
                    className="rounded-lg border px-1.5 py-0.5"
                    style={{ borderColor: "var(--fluo-card-accent)", background: "var(--cahier-paper-raised)" }}
                  >
                    <span className="cahier-body block text-[11px] font-black uppercase tracking-[0.04em] leading-tight" style={{ color: "var(--fluo-card-accent)" }}>
                      {bx.when}
                    </span>
                    <span className="cahier-hand block text-[13px] font-normal leading-snug text-[color:var(--cahier-ink)]">
                      {bx.body}
                    </span>
                  </div>
                ))}
              </div>
            )}
            </details>
          </li>
        ))}
      </ol>

      {/* THE DOOR TO THE FULL GUIDE MOVED INTO THE BAND (Dan, 2026-09-14:
          "the link to the full guide ... to be made more prominent in the
          yellow colored strip within that blank space"), and this line went
          with it rather than staying behind it.

          Two doors to one page on one screen is the HelpDot fault, and it is
          the reason Help itself was cut down in September: a learner who sees
          « Full guide » twice does not read it as emphasis, they read it as two
          different things and have to check. The band's chip is the prominent
          one Dan asked for, so this is the copy that goes.

          What the line carried that the chip does not — "every activity, every
          number, all fifty goals" — is on the chip's own title, where it costs
          the page nothing. */}
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
