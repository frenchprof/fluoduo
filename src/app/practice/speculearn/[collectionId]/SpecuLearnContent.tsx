"use client";

/**
 * SpecuLearn (né « Devine d'abord ! », renamed by Dan 2026-07-15) — the
 * guess-first activity (Dan, 2026-07-14).
 * aliments runs on its photo bank (public/devine + devine-aliments.json);
 * every other SPECULEARN_READY deck runs on its items' emoji as the image
 * (Dan approved the generalization the same day). Accent-tolerant Say It
 * grading, keyboard 1–4/⏎/R.
 *
 * IT SCORES NOTHING, AND THIS HEADER SAID OTHERWISE UNTIL 1 SEP. It claimed
 * "every answer pays XP + streak + SRS through recordItemResult". The code
 * calls recordItemResult nowhere, writes no XP, no streak and no SRS, and
 * persists nothing at all — `score` lives for the session and `game.start` /
 * `game.end` go to analytics. The comment was load-bearing in the wrong
 * direction: docs/HANDOFF_SPECULEARN_PRETESTS.md was written on the strength of
 * it and told the pre-tests lane that a scoring contract stood between
 * SpecuLearn and the pre-tests. It does not. Read the calls, not this block.
 *
 * THE CONFIG WIZARD IS GONE (patch 20–21). The start screen asked a
 * first-year to pick a direction (5 modes) and a pack before the first
 * question — a curriculum decision they can't make. The drill now opens
 * straight into Mixte over the whole deck inside DrillShell; the 🎤 modes
 * (Répète / Devine et dis) survive as restart chips on the end card, where
 * a learner who has met the words can choose to say them.
 */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import { CURATED } from "@/content/collections";
import { speak } from "@/games/letris/speech";
import { hintsFor } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import { sfx } from "@/games/audio/sfx";
import { logEvent } from "@/lib/firebase/usage";
import {
  BUILDING_EMOJI,
  SPECULEARN_EXCLUDED_ITEMS,
  SPECULEARN_ITEM_IMAGES,
  SPECULEARN_PROMPT_FRAME,
} from "@/lib/collections/speculearnReady";
import { deaccent, normalize } from "@/lib/practice/cloze";
import { useChoiceKeys, CHOICE_KEYS_HINT } from "@/lib/useChoiceKeys";
import PHOTO_ITEMS from "@/content/devine-aliments.json";
import { shuffle } from "@/lib/shuffle";
import { BringToClass } from "@/app/SioDetail";
import { recordPretestAnswer } from "@/lib/pretestRecord";
import { stopForDeck } from "@/lib/stopTag";
