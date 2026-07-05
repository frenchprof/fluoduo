/**
 * Site-wide answer jingles (Dan, 2026-07-05): every graded interaction plays
 * one of exactly three sounds — correct = bright "ta-daa", wrong = soft low
 * buzz, stage = the full victory fanfare when an activity/level completes.
 * All delegate to the chiptune synth, so the shared volume slider
 * (fluolingo:volume → chiptune's master gain) governs them, and each call
 * safely initialises/resumes the AudioContext (call from a user gesture).
 */

import { chiptune } from "@/games/audio/chiptune";

export const sfx = {
  correct: () => chiptune.correct(),
  wrong: () => chiptune.wrong(),
  stage: () => chiptune.fanfare(),
};
