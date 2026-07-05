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

/** d' IS de (elided): grade against both surface forms, keep the better. */
export function gradeGap(typed: string, gap: string): Grade {
  const alternates = [gap, ...(gap.endsWith("d'") ? [gap.slice(0, -2) + "de"] : [])];
  const grades = alternates.map((a) => gradeAnswer(typed, a));
  return grades.includes("perfect") ? "perfect" : grades.includes("good") ? "good" : "wrong";
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
