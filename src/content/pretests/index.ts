/**
 * Curated pretests — bundled with the app (0 Firestore reads).
 * One pretest per lesson; the id encodes unit + lessonNo + slug.
 */
import type { Pretest } from "@/lib/pretests/schema";
import weather from "./u3-l1-weather.json";
import cityPreps from "./u3-l2-city-preps.json";

export const PRETESTS: Pretest[] = [weather as unknown as Pretest, cityPreps as unknown as Pretest];

export function getPretest(id: string): Pretest | undefined {
  return PRETESTS.find((p) => p.id === id);
}

export function getPretestForLesson(
  unit: number,
  lessonNo: number,
): Pretest | undefined {
  return PRETESTS.find((p) => p.unit === unit && p.lessonNo === lessonNo);
}

/**
 * Explicit SIO → pretest attachment. The unit/lesson join above is fragile —
 * deck lessonNo values carry legacy numbering (e.g. en-au-aux-a has
 * lessonNo 32), which silently orphaned the city-preps pretest. Keep this map
 * as the source of truth; add a line here whenever a new pretest is authored.
 */
const PRETEST_BY_SIO: Record<string, string> = {
  "SIO-031": "u3-l1-weather",
  "SIO-032": "u3-l2-city-preps",
};

export function getPretestForSio(sioId: string): Pretest | undefined {
  const id = PRETEST_BY_SIO[sioId];
  return id ? getPretest(id) : undefined;
}
