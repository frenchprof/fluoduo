"use client";

/**
 * Word-bank tiles — the phone's answer to a typed drill (patch 20–21).
 *
 * Three drills asked a phone user to type accented French; the app grew
 * accent-tolerant graders BECAUSE that is miserable. Below `sm` the answer
 * renders as tappable chips instead: the answer's own words plus a few
 * distractor words from the same deck, shuffled. Tap a chip to add it, tap
 * a built word to send it back. Faster rounds, no accent problem, no
 * keyboard sliding over the CTA — and a free difficulty knob (the
 * distractors).
 *
 * The host keeps its <input> for `sm` and up and simply mirrors `value`:
 * grading, XP and evidence do not know which surface produced the string.
 */

import { useEffect, useMemo, useState } from "react";
import { deaccent } from "@/lib/practice/cloze";
import { shuffle } from "@/lib/shuffle";

// Dedup key only, NOT grading — but it folds accents the same way THE
// grader does, so a distractor chip never collides with an answer token.
const norm = (w: string) => deaccent(w.toLowerCase());


export default function WordBank({
  answer,
  pool,
  value,
  onChange,
  disabled = false,
  builtInGap = false,
}: {
  /** The expected string — its words are the correct tokens. */
  answer: string;
  /** Same-deck strings distractor words are drawn from (other items'
   *  answers / gaps). The closer they are, the harder the question. */
  pool: string[];
  /** The built answer, mirrored into the host's input state. */
  value: string;
  onChange: (v: string) => void;
  /** Lock the bank while the verdict is showing. */
  disabled?: boolean;
  /** Drop this component's own "built answer" row.
   *
   *  Dan, 2026-09-11: a gap-fill must not grow "a separate long blank on a
   *  line separate from that gap". That row IS such a blank — a full-width
   *  underlined bar showing the words tapped so far, sitting two lines below
   *  the sentence whose gap they belong in. When the host puts a `GapField`
   *  in the sentence, the built answer is already visible in its right
   *  place and this row is the duplicate. The chips below it are not a
   *  blank and stay: they are the choices, not the answer. */
  builtInGap?: boolean;
}) {
  // Chips are index-addressed: an answer can repeat a word ("de la … de la")
  // and each occurrence must be its own chip.
  const tokens = useMemo(() => {
    const right = answer.split(/\s+/).filter(Boolean);
    const rightSet = new Set(right.map(norm));
    const wrong: string[] = [];
    const seen = new Set<string>();
    for (const s of shuffle(pool)) {
      for (const w of s.split(/\s+/)) {
        const n = norm(w);
        if (!w || rightSet.has(n) || seen.has(n)) continue;
        seen.add(n);
        wrong.push(w);
        if (wrong.length >= 4) break;
      }
      if (wrong.length >= 4) break;
    }
    return shuffle([...right, ...wrong]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  const [chosen, setChosen] = useState<number[]>([]);
  // Deliberate: a new answer means a new token row — the picked words must
  // reset with it, and the host owns `answer`, not this component.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setChosen([]); }, [answer]);
  // An empty `value` from the host (next question, retry) clears the row
  // even when the answer text happens to repeat. Deliberate, as above.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (value === "") setChosen([]); }, [value]);

  const emit = (idxs: number[]) => {
    setChosen(idxs);
    onChange(idxs.map((i) => tokens[i]).join(" "));
  };

  /* A NUMBER KEY PLACES A WORD (Dan, 2026-09-14: *"put digits in front of each
     choice, so a number key can be used to answer the question"*, then, asked
     which screen: *"i am referring to putting words into order (sentence
     forming)"*).
     THE DIGIT IS THE TILE'S POSITION IN THE BANK, not in the answer — the bank
     is shuffled once per question and does not move as you build, so 3 is the
     same tile before and after every tap. A digit that renumbered itself would
     be worse than none.
     1–9 ONLY, AND THE BANK RARELY EXCEEDS THAT: a scrambled sentence is five
     to eight tokens. A tenth tile is still tappable; it simply has no key, and
     printing « 10 » on it would promise a keystroke that does not exist. */
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      /* WHOSE DIGIT IS IT — and this is the whole reason the first version did
         nothing. The drill focuses its own gap on every question (so the caret
         is where the learner looks), so by the time a key is pressed an INPUT
         always has focus, and a blanket "never steal from a focused field"
         guard refused every time. Measured: pressing 3 then 1 typed « 01 » into
         the gap instead of placing two words.

         `builtInGap` is exactly the distinction. When it is ON the gap is
         WORDBANK'S OWN OUTPUT — the learner does not type into it, they tap
         tiles and this component writes the result — so a digit belongs to the
         bank. When it is OFF the drill really does offer a typed surface
         alongside the bank, and the digit is the learner's to type. */
      const el = document.activeElement as HTMLElement | null;
      const typing =
        !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing && !builtInGap) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > Math.min(9, tokens.length)) return;
      e.preventDefault();
      setChosen((prev) => {
        const next = [...prev, n - 1];
        onChange(next.map((i) => tokens[i]).join(" "));
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [disabled, tokens, onChange, builtInGap]);

  return (
    <div>
      {/* The built answer — tap a word to send it back. Omitted when the
          host shows it in the sentence's own gap instead; see `builtInGap`.
          A word is taken back from the BANK instead — see the chip below,
          which stays live and dashed once used when `builtInGap` is on. */}
      {!builtInGap && (
      <div className="flex min-h-[2.75rem] flex-wrap items-center gap-1.5 rounded-xl border-b-2 border-[color:var(--cahier-ink)]/40 px-1 py-1.5">
        {chosen.length === 0 && (
          <span className="px-1 text-sm text-[color:var(--cahier-ink)]/35">…</span>
        )}
        {chosen.map((ti, k) => (
          <button
            key={`${ti}-${k}`}
            type="button"
            lang="fr"
            disabled={disabled}
            onClick={() => emit(chosen.filter((_, j) => j !== k))}
            className="rounded-lg border-2 border-[color:var(--cahier-ink)] bg-[color:var(--cahier-ink)] px-2.5 py-1 text-sm font-bold text-white disabled:opacity-60"
          >
            {tokens[ti]}
          </button>
        ))}
      </div>
      )}
      {/* The bank. */}
      <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
        {tokens.map((w, ti) => {
          const used = chosen.includes(ti);
          // WITHOUT THE BUILT ROW, THE BANK IS THE ONLY UNDO. A used chip
          // used to be `disabled` and `text-transparent` — a ghost slot,
          // because a word was taken back by tapping it in the row above.
          // With that row gone (builtInGap) the ghost would strand the
          // learner on their first mistap, so here a used chip stays live
          // and tapping it returns its LAST occurrence — an answer may
          // legitimately repeat a word ("de la … de la").
          const unpick = builtInGap && used;
          return (
            <button
              key={ti}
              type="button"
              lang="fr"
              disabled={disabled || (used && !builtInGap)}
              aria-label={
                ti < 9
                  ? unpick ? `${ti + 1}. Take back ${w}` : `${ti + 1}. ${w}`
                  : unpick ? `Take back ${w}` : w
              }
              onClick={() => {
                if (!unpick) return emit([...chosen, ti]);
                const last = chosen.lastIndexOf(ti);
                emit(chosen.filter((_, j) => j !== last));
              }}
              className={`rounded-lg border-2 px-2.5 py-1 text-sm font-bold transition ${
                unpick
                  ? "border-dashed border-[color:var(--cahier-ink)]/40 bg-[color:var(--cahier-ink)]/10 text-[color:var(--cahier-ink)]/45"
                  : used
                  ? "border-transparent bg-[color:var(--cahier-ink)]/10 text-transparent"
                  : "border-[color:var(--cahier-ink)]/30 bg-white text-[color:var(--cahier-ink)] hover:border-[color:var(--cahier-ink)]"
              } disabled:cursor-default`}
            >
              {/* THE DIGIT IS PRINTED OR THE KEY IS A SECRET. It rides inside
                  the tile as a superscript rather than beside it, so the row
                  keeps wrapping the way it did and no tile grows a fixed box
                  (the no-hard-coded-control-size rule, 12 Sep). It fades with
                  a used tile because the digit still works — tapping 3 twice
                  places « de » twice, which an answer may legitimately want. */}
              {ti < 9 && (
                <span
                  aria-hidden
                  className="mr-1 align-super text-[0.7em] font-black opacity-45"
                >
                  {ti + 1}
                </span>
              )}
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
