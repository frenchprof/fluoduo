/**
 * nextStep — where the one « Next › » points (the approved flow, 2026-08-24).
 *
 * Every activity finish gets exactly ONE primary onward action. It pulls the
 * learner along the STOP'S PRACTICE CHAIN — the practice family in its
 * authored registry order (src/content/activities.ts):
 *
 *   Pre-Test → SpecuLearn → Memo → EtuDice → 4Mémoire → iComplete
 *
 * (Pre-Test folds into the SpecuLearn step — the 2026-08-10 merger; cellHref
 * already opens the pretest door for decks with no SpecuLearn set.)
 *
 * RESOLUTION RULES, in order:
 *   1  Anchor on a stop: the sioId given, else the deck's SIO, else — for a
 *      deckless surface (ConjugaZone, a spoken-number game) — the learner's
 *      current stop on the path (continuer's nextSioId).
 *   2  The chain is the stop's practice steps that actually have a door
 *      (indexMatrix.cellHref — same eligibility the Index paints).
 *   3  The next step is the FIRST chain step, in authored order, that is
 *      UNDONE on this device — no tally in the activity ledger for
 *      (activity × outcome), the same signal that leaves an Index cell
 *      hollow. The step just finished never points at itself.
 *   4  Chain complete → the next stop's chain, stop chosen by continuer
 *      (first gap after the furthest « done »); when that resolves to the
 *      anchor itself (the stop is attempted but not yet marked done), the
 *      next stop in spine order. Its first undone step, else its first step.
 *   5  Nothing left anywhere → null; callers fall back to Home.
 *
 * localStorage-backed (ledger + progress): call from the client only, at the
 * moment the finish screen renders.
 */
import { activitiesIn, activity } from "@/content/activities";
import { SIOS, type Sio } from "@/content/sios";
import { cellHref } from "@/lib/indexMatrix";
import { accuracyFor, loadLedger, type Ledger } from "@/lib/activityLedger";
import { loadProgress } from "@/lib/progress";
import { nextSioId } from "@/lib/continuer";

export type NextStep = {
  href: string;
  /** Registry key of the destination activity. */
  key: string;
  name: string;
  emoji: string;
  /** The destination stop — its num is the chip's number. */
  sio: Sio;
  /** true when the destination lives on a later stop than the anchor. */
  nextStop: boolean;
};

/** The chain's keys: the practice family in its authored order. */
function chainKeys(): string[] {
  return activitiesIn("practice").map((a) => a.key);
}

/** The stop's chain — only steps with a real door (rule 2). */
function stepsOf(sio: Sio): { key: string; href: string }[] {
  return chainKeys().flatMap((key) => {
    const href = cellHref(key, sio);
    return href ? [{ key, href }] : [];
  });
}

function firstUndone(sio: Sio, ledger: Ledger, exclude?: string) {
  return stepsOf(sio).find(
    (s) => s.key !== exclude && accuracyFor(ledger, s.key, sio.id) === null,
  );
}

function toStep(step: { key: string; href: string }, sio: Sio, nextStop: boolean): NextStep {
  const a = activity(step.key);
  return {
    href: step.href,
    key: step.key,
    name: a?.name ?? step.key,
    emoji: a?.emoji ?? "",
    sio,
    nextStop,
  };
}

export function nextStep(
  /** The activity just finished (registry key, or a game key outside the chain). */
  activityKey?: string,
  at?: { collectionId?: string | null; sioId?: string | null },
): NextStep | null {
  const ledger = loadLedger();
  const current = activityKey === "pretest" ? "speculearn" : activityKey;

  // Rule 1 — the anchor stop.
  let anchor =
    (at?.sioId && SIOS.find((s) => s.id === at.sioId)) ||
    (at?.collectionId && SIOS.find((s) => s.collectionId === at.collectionId)) ||
    undefined;
  let offPath = false;
  if (!anchor) {
    const id = nextSioId(loadProgress());
    anchor = id ? SIOS.find((s) => s.id === id) : undefined;
    offPath = true;
    if (!anchor) return null; // all 50 done — rule 5
  }

  // Rule 3 — this stop first.
  const here = firstUndone(anchor, ledger, current);
  if (here) return toStep(here, anchor, offPath);

  // Rule 4 — the chain is complete: onward to the next stop.
  const contId = nextSioId(loadProgress());
  let dest = contId && contId !== anchor.id ? SIOS.find((s) => s.id === contId) : undefined;
  if (!dest) dest = SIOS[SIOS.indexOf(anchor) + 1];
  if (!dest) return null; // the last stop's chain, all done — rule 5
  const there = firstUndone(dest, ledger) ?? stepsOf(dest)[0];
  return there ? toStep(there, dest, true) : null;
}
