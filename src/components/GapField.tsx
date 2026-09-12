"use client";

/**
 * The blank a learner fills, IN the sentence, where the word goes.
 *
 * Dan, 2026-09-11: *"whenever there is a blank to complete in a question
 * (gap-fill), please do NOT make a separate long blank that is on a line
 * separate from that gap. The gap itself must be exactly where the word is
 * supposed to be if that gap had been filled. e.g. Paul [aime] l'opéra. …
 * Don't multiply lines for nothing."*
 *
 * WHAT IT REPLACED, measured on the built app at 1100px. GramMarathon drew
 * the blank TWICE:
 *
 *     J'aime ___ cinéma.                     <- 48px, in the sentence
 *     [ the missing word…               ]    <- 600px, on its own line
 *
 * and the one the learner typed into was not the one in the sentence. The
 * same pair is in ConjugaZone's drill and in Flip It. The eye had to hold a
 * position in line one while acting in line three.
 *
 * SIZED TO THE ANSWER, not to the container. `width` is the answer's own
 * length in `ch`, so the blank is as wide as the word that belongs in it —
 * which is what Dan's "exactly where the word is supposed to be" asks for,
 * and incidentally the oldest gap-fill convention on paper. A floor of 3ch
 * keeps « à » and « a » tappable.
 *
 * NOT `.cahier-answer`. That class pins font-size, padding and a 30px
 * min-height with `!important`, all of which fight an inline field: the
 * point here is to inherit the sentence's own type so the filled gap reads
 * as part of the sentence rather than as a control dropped into it.
 * `lang="fr"` is kept because AccentBar keys on it (or on `.cahier-answer`)
 * to decide where an accent goes — see components/AccentBar.tsx.
 */

import { forwardRef } from "react";

export type GapState = "idle" | "right" | "wrong";

const GapField = forwardRef<HTMLInputElement, {
  /** The expected string. Only its LENGTH is used here — grading is the
   *  host's job, and stays there so XP and evidence keep one source. */
  answer: string;
  value: string;
  onChange: (v: string) => void;
  state?: GapState;
  /** Shown in place of the field once the host has graded: the correct
   *  form, so the sentence ends up complete and readable. */
  reveal?: string | null;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  "data-tour"?: string;
}>(function GapField(
  { answer, value, onChange, state = "idle", reveal = null, disabled, placeholder, autoFocus, ...rest },
  ref,
) {
  const ink =
    state === "right" ? "border-emerald-600 text-emerald-700"
    : state === "wrong" ? "border-rose-500 text-rose-700"
    : "border-[color:var(--cahier-ink)] text-[color:var(--cahier-ink)]";

  // Graded and revealed: the gap becomes the word. Still inline, still in
  // the sentence — the line the learner just read does not reflow.
  if (reveal !== null) {
    return (
      <span
        lang="fr"
        className={`mx-0.5 inline-block border-b-2 px-1 text-center align-baseline ${ink}`}
        style={{ minWidth: `${Math.max(answer.length, 3)}ch` }}
      >
        {reveal}
      </span>
    );
  }

  return (
    <input
      ref={ref}
      lang="fr"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      // Every declaration here exists to make an <input> stop looking like
      // one: no chrome of its own, the sentence's type, a single rule under
      // it. Tailwind's `font-[inherit]` does not reach font-size, so the
      // three faces are set by hand.
      className={`mx-0.5 inline-block border-0 border-b-2 bg-transparent px-1 text-center align-baseline
                  outline-none focus:bg-[color:var(--cahier-hl)]/25 disabled:opacity-100 ${ink}`}
      style={{
        // Sized to the ANSWER, but never smaller than what has been typed.
        // Driving ConjugaZone's TYPE IT mode found the reason: the field for
        // « suis » is 4ch, and a learner who types « appelle » into it sees
        // « app| » — their own wrong answer clipped, which reads as the app
        // eating their input rather than as a mistake they can see and fix.
        // Growing only past the answer's length gives nothing away; the extra
        // width is their own text.
        width: `${Math.max(answer.length, value.length, 3)}ch`,
        font: "inherit",
        borderRadius: 0,
        minHeight: 0,
      }}
      {...rest}
    />
  );
});

export default GapField;
