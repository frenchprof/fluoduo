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
 * THE ACTIVITY GRID IS FOLDED, with its count on the fold (the long-pages
 * rule: the argument stays open, the apparatus collapses, and a closed
 * section says what is behind it). It is reference, not the lesson — and it
 * was what made the page 1,400px tall on a phone. It still DERIVES from the
 * registry (patch 19c, verify19c): every activity, grouped by family in
 * family order, four columns, names never truncated. Families with no
 * activity of their own (Lesson's doors are Map, the goal and Help, drawn by
 * the ☰ menu itself) are skipped rather than shown as an empty heading.
 *
 * Shared between /guide and any first-visit use: `onContinue` dismisses;
 * without it Continue leads Home.
 */
import Link from "next/link";
import { ACTIVITIES, FAMILIES, activitiesIn, familyShort } from "@/content/activities";

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

      {/* FOLDED, WITH ITS COUNT ON THE FOLD. Native <details>: keyboard and
          screen reader support come free, and it needs no state. */}
      <details className="mt-2 rounded-xl border-2 bg-[var(--fluo-card)]" style={{ borderColor: "var(--fluo-line)" }}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5">
          <span className="font-black text-[color:var(--cahier-ink)]">All the activities</span>
          <span className="fluo-mono text-xs font-bold text-[color:var(--cahier-ink)]/70">{ACTIVITIES.length}</span>
        </summary>
        <div className="flex flex-col gap-3 px-3 pb-3">
          {FAMILIES.map((f) => activitiesIn(f.key).length === 0 ? null : (
            <div key={f.key}>
              {/* The family name is navigation text — the same label the ☰
                  menu's row wears, pointing at the same doors. */}
              <p className="text-[11px] font-black uppercase tracking-wide text-[color:var(--cahier-ink)]/60">
                <span aria-hidden>{f.emoji}</span> {familyShort(f)}
              </p>
              <ul className="mt-1.5 grid grid-cols-4 gap-x-1 gap-y-3 sm:gap-x-2">
                {activitiesIn(f.key).map((a) => (
                  <li key={a.key} className="flex flex-col items-center gap-1" title={a.blurb}>
                    <Link
                      href={a.href ?? "/map"}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white/80 text-2xl shadow-[2px_2px_0_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
                      style={{ borderColor: a.hue }}
                    >
                      {a.emoji}
                    </Link>
                    {/* Full name, always — never cut to "GramMara…". The hand
                        face, as on the ☰ menu's tiles: it runs narrow, so
                        « GramMarathon » fits a quarter of a phone whole where
                        the body face broke it mid-word. */}
                    <span className="fluo-btn-hand w-full break-words text-center text-[13px] leading-tight text-[color:var(--cahier-ink)]">
                      {a.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>

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
