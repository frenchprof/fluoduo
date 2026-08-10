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

const norm = (w: string) =>
  w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function WordBank({
  answer,
  pool,
  value,
  onChange,
  disabled = false,
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
  useEffect(() => { setChosen([]); }, [answer]);
  // An empty `value` from the host (next question, retry) clears the row
  // even when the answer text happens to repeat.
  useEffect(() => { if (value === "") setChosen([]); }, [value]);

  const emit = (idxs: number[]) => {
    setChosen(idxs);
    onChange(idxs.map((i) => tokens[i]).join(" "));
  };

  return (
    <div>
      {/* The built answer — tap a word to send it back. */}
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
      {/* The bank. */}
      <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
        {tokens.map((w, ti) => {
          const used = chosen.includes(ti);
          return (
            <button
              key={ti}
              type="button"
              lang="fr"
              disabled={disabled || used}
              onClick={() => emit([...chosen, ti])}
              className={`rounded-lg border-2 px-2.5 py-1 text-sm font-bold transition ${
                used
                  ? "border-transparent bg-[color:var(--cahier-ink)]/10 text-transparent"
                  : "border-[color:var(--cahier-ink)]/30 bg-white text-[color:var(--cahier-ink)] hover:border-[color:var(--cahier-ink)]"
              } disabled:cursor-default`}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
