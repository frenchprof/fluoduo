/**
 * Shared cloze grading + gap splitting — extracted from GramMarathon so Diced
 * Practice (the Lesson's Pratique widget) grades typed answers identically:
 * exact → deaccented "good" → wrong, with the d'/de elision alternate.
 */

export type Grade = "perfect" | "good" | "wrong";

export function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[-–—]/g, " ").replace(/[.,!?;:'"«»()]/g, "").replace(/\s+/g, " ").trim();
}

export function deaccent(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function gradeAnswer(typed: string, answer: string): Grade {
  const t = normalize(typed);
  const a = normalize(answer);
  if (!t) return "wrong";
  if (t === a) return "perfect";
  if (deaccent(t) === deaccent(a)) return "good";
  return "wrong";
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
