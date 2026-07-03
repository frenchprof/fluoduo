/**
 * Grammar lessons ported from the frenchwithdrchan worker (Dan, 2026-07-03).
 * The originals are password-gated on that site, so students can't reach them;
 * the recovered, gate-stripped HTML lives in /public/lessons and is served
 * inside FluoLingo behind the app's own sign-in (see /lessons/[slug]). Each is
 * a self-contained lesson whose ⭐ feature is the 🎲 "dice" sentence-generator
 * exercise. Linked from the matching SIO.
 */

export type Lesson = { slug: string; file: string; title: string };

export const LESSONS: Record<string, Lesson> = {
  aimer: { slug: "aimer", file: "08-aimer-le-la-les.html", title: "Aimer + le / la / les" },
};

/** SIO id → lesson slug (only where a ported grammar lesson exists). */
export const LESSON_BY_SIO: Record<string, string> = {
  "SIO-023": "aimer",
};

export function lessonForSio(sioId: string): Lesson | undefined {
  const slug = LESSON_BY_SIO[sioId];
  return slug ? LESSONS[slug] : undefined;
}
