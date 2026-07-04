/**
 * Registry of lessons converted to NATIVE in-app content (CahierShell + Mémo +
 * DiceTrainer) — Dan, 2026-07-03. A slug present here renders natively at
 * /lessons/[slug]; absent slugs fall back to the iframed drchan HTML until
 * their conversion lands.
 */
import type { NativeLesson } from "./types";
import { aimerLesson } from "./aimer";

export const NATIVE_LESSONS: Record<string, NativeLesson> = {
  aimer: aimerLesson,
};

export function getNativeLesson(slug: string): NativeLesson | undefined {
  return NATIVE_LESSONS[slug];
}
