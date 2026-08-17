/**
 * The Index's data — patch 24 (UI_WORK_PLAN_1 → PATCH 24, the Index redesign).
 *
 * Rows are the 50 SIOs (ten per unit, one deck each), NOT decks grouped by
 * unit: the row is the outcome the learner is working on, and the stop
 * number is the one they just tapped on Home. Columns are gone — one
 * activity is selected at a time (the chip rail), so each row shows ONE
 * cell for it, plus the three activities every outcome has as buttons.
 *
 * WHICH ACTIVITIES ARE CHIPS and which are BUTTONS is decided by content,
 * not taste: xPlain, 4Mémoire and WorDrill exist for every deck (the lesson
 * falls back to the deck lesson; flashcards and Say It read the items
 * directly), so a column of 50 identical emoji told the learner nothing —
 * they are per-row buttons. The chip activities are the ones gated on
 * authored content (SpecuLearn readiness, dice columns, rain sets, lex sets,
 * compose banks, gap sentences), where "is there anything here?" is a real
 * question — and where `?gaps=1` shows Dan what still needs writing.
 *
 * ELIGIBILITY IS NOT RE-DERIVED HERE (the ActivityHub lesson):
 * `deckActivityTabs()` already knows which activities a deck supports.
 * Names, emoji and hues come from the registry. Pre-Test folds into the
 * SpecuLearn cell (Dan, 2026-08-10: same job, two engines) — a deck with a
 * pretest but no SpecuLearn set still gets a door.
 */
import { deckActivityTabs } from "@/components/CahierShell";
import { activity, type Activity } from "@/content/activities";
import { SIOS, type Sio } from "@/content/sios";
import { lessonsForDeck } from "@/content/lessons";

/** Registry keys of the chip rail, in registry (family) order. */
export const CHIP_KEYS = ["speculearn", "dice", "complete", "grammarathon", "compose", "vocabularain", "lexicalator"] as const;
/** Registry keys of the per-row buttons — the three every outcome has. */
export const ROW_BUTTON_KEYS = ["lesson", "flip", "wordrill"] as const;

export type ChipKey = (typeof CHIP_KEYS)[number];

export function chipActivities(): Activity[] {
  return CHIP_KEYS.map((k) => activity(k)).filter((a): a is Activity => !!a);
}
export function rowButtonActivities(): Activity[] {
  return ROW_BUTTON_KEYS.map((k) => activity(k)).filter((a): a is Activity => !!a);
}

export function isChipKey(k: string | null | undefined): k is ChipKey {
  return !!k && (CHIP_KEYS as readonly string[]).includes(k);
}

/** deckActivityTabs keys differ from registry keys in two places. */
const TAB_KEY: Record<string, string> = { wordrill: "say" };

/** The door for one activity on one outcome, or null when the deck has no
 *  content for it. */
export function cellHref(activityKey: string, sio: Sio): string | null {
  if (!sio.collectionId) return null;
  const tabs = deckActivityTabs(sio.collectionId);
  const find = (k: string) => tabs.find((t) => t.key === k)?.href ?? null;
  const own = find(TAB_KEY[activityKey] ?? activityKey);
  if (activityKey === "speculearn") return own ?? find("pretest");
  return own;
}

/** For the authoring backlog: xPlain counts as a gap when no lesson is
 *  AUTHORED for the deck (the generic deck lesson still renders). */
export function lessonAuthored(sio: Sio): boolean {
  return !!sio.collectionId && lessonsForDeck(sio.collectionId).length > 0;
}

export function siosOfUnit(unit: number): Sio[] {
  return SIOS.filter((s) => s.unit === unit);
}

/** Every (activity × outcome) with nothing behind it — Dan's backlog. */
export function gapCells(): { key: string; sio: Sio }[] {
  const out: { key: string; sio: Sio }[] = [];
  for (const sio of SIOS) {
    for (const key of CHIP_KEYS) if (!cellHref(key, sio)) out.push({ key, sio });
    if (!lessonAuthored(sio)) out.push({ key: "lesson", sio });
  }
  return out;
}
