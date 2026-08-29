/**
 * The activity ledger — how you did, per activity × outcome, on THIS device.
 *
 * WHY (patch 24, the Index redesign; audit 2026-08-10 "the matrix cell should
 * say how you did, not whether the link works"). The Index used to paint 277
 * of 450 cells with an emoji meaning "this exists". The evidence store
 * (users/{uid}/responses) already knows every graded answer, but it is
 * Firestore behind a sign-in and a network round-trip, and the Index must
 * paint on first frame. `itemSrs` is local but per ITEM — it cannot say
 * "you played VocabulaRain on SIO-012 and got 7 of 10", because a miss in
 * ComposeIt and a miss in 4Mémoire land on the same rung.
 *
 * So: one tiny localStorage tally, keyed activity → outcome → {right, wrong,
 * last}. Written from ONE place — recordResponse(), which every graded
 * answer already reaches (recordItemResult() calls it too) — so nothing that
 * grades needs to change and there is no second writer to drift. Read by
 * the Index to colour its cells with the same tier scale /moi and the
 * teacher dashboard use.
 *
 * NOT synced. Two devices = two ledgers. The synced truth stays the
 * responses collection; this is the learner's own quick view. Left for
 * later: replaying responses into it after sign-in (data-truth backlog).
 */
import { ensureRenumber3435 } from "./migrations/renumber3435";
import { normalizePath } from "@/lib/labels";
import { deckForItem, sioForDeck, sioForItem } from "@/lib/curriculum";

export type Tally = { right: number; wrong: number; last: number };
export type Ledger = Record<string, Record<string, Tally>>;

const KEY = "fluolingo:activityLedger";
export const LEDGER_EVENT = "fluolingo:ledger-updated";

/**
 * activityId (a route or a `key:deck` string) → registry key. Longest prefix
 * wins, after the same rename normalisation labels.ts applies, so `letris:`
 * and `/games/vocabularain/` land on one row. Unmapped surfaces (deck MCQ,
 * NumBus, ConjugaZone…) return undefined and are not tallied — they are not
 * per-outcome activities the Index shows.
 */
const PREFIX_TO_KEY: Array<[string, string]> = [
  ["/practice/speculearn", "speculearn"], ["speculearn:", "speculearn"],
  ["/pretests/", "speculearn"], ["pretest:", "speculearn"],
  ["/lessons/", "lesson"], ["lesson:", "lesson"], ["mcq:lesson:", "lesson"],
  ["/practice/dice/", "dice"], ["dice-practice:", "dice"],
  ["/practice/flip-it/", "flip"], ["flip-it:", "flip"],
  ["/practice/complete-it/", "complete"], ["complete-it:", "complete"],
  ["/games/vocabularain/", "vocabularain"], ["vocabularain:", "vocabularain"],
  ["/games/lexicalater/", "lexicalator"], ["lexicalater:", "lexicalator"],
  ["/games/compose/", "compose"], ["compose:", "compose"],
  ["/practice/grammarathon/", "grammarathon"], ["grammarathon:", "grammarathon"],
  ["/practice/say-it/", "wordrill"], ["say-it:", "wordrill"], ["/practice/wordrill", "wordrill"],
];

export function activityKeyFor(activityId: string | undefined): string | undefined {
  const id = normalizePath(activityId ?? "");
  let best: string | undefined;
  let len = -1;
  for (const [prefix, key] of PREFIX_TO_KEY) {
    if (id.startsWith(prefix) && prefix.length > len) {
      best = key;
      len = prefix.length;
    }
  }
  return best;
}

/** The outcome an attempt bears on: the deck named in the activityId
 *  (`say-it:aliments`, `/practice/flip-it/aliments`), else the item's own
 *  deck. Undefined when neither resolves (a spoken number, a raw word). */
export function sioForAttempt(activityId: string | undefined, itemId: string): string | undefined {
  const id = normalizePath(activityId ?? "");
  const tail = id.includes(":") ? id.slice(id.lastIndexOf(":") + 1) : id.split("/").filter(Boolean).pop() ?? "";
  return sioForDeck(tail) ?? sioForItem(itemId) ?? (deckForItem(itemId) ? sioForDeck(deckForItem(itemId)!) : undefined);
}

export function loadLedger(): Ledger {
  if (typeof window === "undefined") return {};
  ensureRenumber3435();
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : {};
    return v && typeof v === "object" ? (v as Ledger) : {};
  } catch {
    return {};
  }
}

/** Tally one graded answer. Silent no-op when it maps to no activity/outcome. */
export function noteAttempt(itemId: string, correct: boolean, activityId?: string): void {
  if (typeof window === "undefined") return;
  const key = activityKeyFor(activityId);
  const sio = key ? sioForAttempt(activityId, itemId) : undefined;
  if (!key || !sio) return;
  try {
    const l = loadLedger();
    const row = (l[key] ??= {});
    const t = (row[sio] ??= { right: 0, wrong: 0, last: 0 });
    if (correct) t.right += 1; else t.wrong += 1;
    t.last = Date.now();
    window.localStorage.setItem(KEY, JSON.stringify(l));
    window.dispatchEvent(new Event(LEDGER_EVENT));
  } catch {
    // storage blocked — the Index just shows the hollow ring
  }
}

/** 0..100 accuracy for one activity × outcome, null when never attempted. */
export function accuracyFor(l: Ledger, activityKey: string, sio: string): number | null {
  const t = l[activityKey]?.[sio];
  if (!t) return null;
  const n = t.right + t.wrong;
  return n ? Math.round((100 * t.right) / n) : null;
}

/** The tier token for an accuracy — the same scale as /moi and the teacher
 *  page. ONE definition (progress.ts `tierFor`, mapped to a token in
 *  outcomeRows.ts); re-exported so the Index's import path still works. */
export { tierToken } from "@/lib/outcomeRows";
