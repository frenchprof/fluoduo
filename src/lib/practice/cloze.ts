/**
 * THE typed-answer grader (grading unification, 2026-08-11) — one normalizer,
 * one tier engine, every drill. Extracted from GramMarathon originally; the
 * audit then found seven independent implementations grading the same string
 * differently ("l'eau" typed with a phone's curly apostrophe passed Flip It
 * and failed Complete It, on the same deck row). They now all come here:
 *
 *   Complete It · GramMarathon · Finale (strict AND non-strict) · lesson
 *   pager · ÉcouTexte · ConjugaZone · 4Mémoire's judgePart (drill + table)
 *   · Say It and SpecuLearn's speech layers (their extra tolerance sits ON
 *   TOP of this normalizer, never beside it)
 *
 * The philosophy the tiers encode (progress.ts): effort counts, errors are
 * shown. "perfect" = the exact form; "good" = right idea, wrong surface
 * (an accent slip, a de-for-d' elision) — full credit, but the canonical
 * form is revealed. Never silently equate what a learner should SEE differ.
 */

export type Grade = "perfect" | "good" | "wrong";

export function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    // Phone keyboards type ’ (curly); every answer key is authored with '
    // (straight). Fold BEFORE the punctuation strip or the two glyphs grade
    // differently — the exact bug that made « l’eau » fail half the drills.
    .replace(/[’‘]/g, "'")
    .replace(/[-–—]/g, " ")
    .replace(/[.,!?;:'"«»“”()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function deaccent(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export type GradeOpts = {
  /** "strict": an accent difference is WRONG, not "good" — the Finale's
   *  où-vs-ou items, where the accent IS the tested knowledge. */
  accents?: "lenient" | "strict";
};

export function gradeAnswer(typed: string, answer: string, opts: GradeOpts = {}): Grade {
  const t = normalize(typed);
  const a = normalize(answer);
  if (!t) return "wrong";
  if (t === a) return "perfect";
  if (opts.accents !== "strict" && deaccent(t) === deaccent(a)) return "good";
  return "wrong";
}

/** Best tier across an answer and its accepted alternates. */
export function gradeAgainst(typed: string, answers: readonly string[], opts: GradeOpts = {}): Grade {
  let best: Grade = "wrong";
  for (const a of answers) {
    const g = gradeAnswer(typed, a, opts);
    if (g === "perfect") return "perfect";
    if (g === "good") best = "good";
  }
  return best;
}

/**
 * d' IS de (elided) - same word, so a learner typing "de" for a "d'" gap has
 * the CONCEPT right. But elision before a vowel is obligatory: "beaucoup de
 * abricots" is not French. Scoring it perfect (as this did until 2026-08-10)
 * gave full marks AND suppressed the reveal, so the learner never saw the
 * correct form.
 *
 * It is now capped at "good" - the same verdict an accent slip earns. Right
 * idea, wrong surface form, and the canonical spelling is shown, because the
 * UI reveals the answer on anything that is not a perfect match (Dan,
 * 2026-08-02).
 */
export function gradeGap(typed: string, gap: string): Grade {
  const direct = gradeAnswer(typed, gap);
  if (direct === "perfect") return direct;
  const elided = gap.endsWith("d'") ? gap.slice(0, -2) + "de" : null;
  if (elided && gradeAnswer(typed, elided) !== "wrong") return "good";
  return direct;
}

/**
 * Split `fr` around the gap occurrence, word-boundary aware so "de" never
 * matches inside "des"/"mange". A gap ending in an apostrophe elides into the
 * next word ("d'" + "eau"), so no boundary is required after it.
 */
export function splitGap(fr: string, gap: string): { before: string; after: string } {
  const letter = /[a-zà-öø-ÿœæ]/i;
  for (let idx = fr.indexOf(gap); idx !== -1; idx = fr.indexOf(gap, idx + 1)) {
    const prev = fr[idx - 1];
    const next = fr[idx + gap.length];
    const okBefore = prev === undefined || !letter.test(prev);
    const okAfter = gap.endsWith("'") || next === undefined || !letter.test(next);
    if (okBefore && okAfter) return { before: fr.slice(0, idx), after: fr.slice(idx + gap.length) };
  }
  return { before: fr, after: "" };
}
