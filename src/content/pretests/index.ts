/**
 * Curated pretests — bundled with the app (0 Firestore reads).
 * One pretest per lesson; the id encodes unit + lessonNo + slug.
 */
import type { Pretest } from "@/lib/pretests/schema";
import weather from "./u3-l1-weather.json";
import cityPreps from "./u3-l2-city-preps.json";

export const PRETESTS: Pretest[] = [weather as Pretest, cityPreps as Pretest];

export function getPretest(id: string): Pretest | undefined {
  return PRETESTS.find((p) => p.id === id);
}

export function getPretestForLesson(
  unit: number,
  lessonNo: number,
): Pretest | undefined {
  return PRETESTS.find((p) => p.unit === unit && p.lessonNo === lessonNo);
}
