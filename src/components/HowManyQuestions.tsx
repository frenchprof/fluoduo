"use client";

/**
 * "How many …?" — the one screen that asks a learner how long a run should be
 * (Dan, 2026-08-25: "let the learner choose before starting").
 *
 * IT ASKED « How many questions? » ON ALL THREE DRILLS UNTIL 14 Sep, and on two
 * of them there are no questions (Dan, 13 Sep: "some pop ups instructions are
 * misleading", then "4th item: WorDrill", then — shown three candidates —
 * "IT WAS A POP UP ABOUT PICKING THE NUMBER OF ITEMS"). WorDrill shows you a
 * French word and you SAY IT OUT LOUD; MémoiRecall deals flashcards. Neither
 * asks a question, and a learner counting questions on a screen that has none
 * is being told to expect a different activity.
 *
 *     GramMarathon   How many questions?   ✓ it asks questions
 *     WorDrill       How many words?
 *     MémoiRecall    How many cards?
 *
 * `noun` IS REQUIRED, WITH NO DEFAULT, and that is the whole guard: a default
 * of "questions" is exactly how the wrong word reached two drills — each call
 * site simply inherited it. A fourth drill must now say what it deals, and
 * verify47 fails if any call site omits it.
 *
 * The lengths and when to offer them live in `lib/sessionLength.ts`; this is
 * only how the question LOOKS, kept in one place because four drills ask it
 * and a chooser that drifts between them reads as four different questions.
 *
 * It renders the question and nothing else — no shell, no progress, no CTA:
 * the choice IS the control. The caller wraps it, which matters because these
 * drills run both as a full page (inside DrillShell) and embedded in a SIO
 * popup (bare). CompleteIt originally wrapped its chooser in DrillShell
 * unconditionally, so an embedded run on a long deck drew a whole drill frame
 * — exit ✕, bottom bar and all — inside the popup for one screen, then threw
 * it away. Hence `embedded` deciding the wrapper at every call site.
 */
import { label, type SessionLength } from "@/lib/sessionLength";

export default function HowManyQuestions({
  lengths,
  total,
  noun,
  onPick,
}: {
  /** What `offer(total)` returned — never empty when this renders. */
  lengths: SessionLength[];
  /** The whole queue, so "All n" can name its real number rather than be a
   *  mystery third option. */
  total: number;
  /** What this drill actually deals — "questions", "words", "cards". Required:
   *  see the note above on why there is no default. */
  noun: string;
  onPick: (n: SessionLength) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 pt-8 text-center">
      <p className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)]">
        How many {noun}?
      </p>
      {/* data-tour: the guided first run starts HERE, not on the card — this
          is the first thing a learner has to do, and until it is done the
          activity's own controls do not exist yet (content/hints.ts). */}
      <div data-tour="how-many" className="flex flex-wrap items-center justify-center gap-3">
        {lengths.map((n) => (
          <button
            key={String(n)}
            type="button"
            onClick={() => onPick(n)}
            className="cahier-btn cahier-btn-primary min-w-20 justify-center"
          >
            {label(n, total)}
          </button>
        ))}
      </div>
    </div>
  );
}
