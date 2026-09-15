/**
 * WHAT WAS ON SCREEN WHEN THE LEARNER PRESSED 🐞.
 *
 * Dan, 2026-09-15, asked whether there was a better way to collect bugs, after
 * a learner's four reports had each cost an hour to reconstruct. One of them
 * read *"we are given the sentence to complete e.g. __ bien"* — and the app
 * had known, at the moment she tapped the button, that it was the tu-vous
 * lesson, level ★★, a gap card, frame « ___ bien ? ». It simply never wrote
 * that down. A learner cannot be asked to report an item id; the app can.
 *
 * WHY sessionStorage AND NOT A REACT CONTEXT. The 🐞 button lives in the root
 * layout of the HOST document; every station runs inside an iframe (7 Sep),
 * so the card is in a different window with its own React tree. The two
 * share an origin and a tab, and sessionStorage is exactly that scope — the
 * frame writes, the host reads, with no message-passing and no wiring per
 * page. It also dies with the tab, so a stale card can never be reported
 * from tomorrow's session.
 *
 * A screen that draws a card calls `setBugContext` whenever the card changes.
 * The button calls `readBugContext` at send time and attaches whatever is
 * fresh. Nothing here is required: a page that never calls this just sends a
 * report with no `context`, exactly as before.
 */

export type BugContext = {
  /** Registry key of the activity on screen (« lesson », « grammarathon »…). */
  activity?: string;
  /** The deck or lesson slug, where there is one. */
  deck?: string;
  /** The entry level a learner chose, where the activity has levels. */
  level?: string | number;
  /** The card's kind and id — what the app calls the thing on screen. */
  kind?: string;
  itemId?: string;
  /** THE PROMPT AS THE LEARNER SAW IT, blank included — « ___ bien ? ». This
   *  is the line that turns "e.g. __ bien" into the exact card. Never the
   *  answer: a report is read by a teacher, but it is written by the app and
   *  it must not leak what the learner was meant to type. */
  prompt?: string;
  /** Progress through the run, so "the third card" can be found again. */
  position?: string;
};

const KEY = "fluolingo:bug-context";
/** A card older than this is not what the learner is looking at. */
const FRESH_MS = 10 * 60 * 1000;

type Stored = BugContext & { at: number; path: string };

export function setBugContext(ctx: BugContext): void {
  if (typeof window === "undefined") return;
  try {
    const clean = Object.fromEntries(
      Object.entries(ctx).filter(([, v]) => v !== undefined && v !== null && v !== ""),
    ) as BugContext;
    // The prompt is one line for a human, not a transcript: 160 characters
    // covers any card in the app and keeps the stored map small.
    if (typeof clean.prompt === "string") clean.prompt = clean.prompt.slice(0, 160);
    const stored: Stored = { ...clean, at: Date.now(), path: window.location.pathname };
    window.sessionStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    /* private mode, blocked storage — a report without context is still a report */
  }
}

/** Clear it when the screen that set it goes away, so a report from the map
 *  does not carry the card from the drill before it. */
export function clearBugContext(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* as above */
  }
}

export function readBugContext(): (BugContext & { path: string }) | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Stored;
    if (!s || typeof s.at !== "number" || Date.now() - s.at > FRESH_MS) return null;
    const { at: _at, ...rest } = s;
    void _at;
    return rest;
  } catch {
    return null;
  }
}

/** One line a person can read: « lesson · tu-vous · ★★ · gap · « ___ bien ? » ». */
export function describeBugContext(c: Partial<BugContext & { path: string }> | null | undefined): string {
  if (!c) return "";
  return [
    c.activity,
    c.deck,
    c.level != null ? String(c.level) : null,
    c.kind,
    c.itemId,
    c.prompt ? `« ${c.prompt} »` : null,
    c.position,
  ]
    .filter((x): x is string => !!x)
    .join(" · ");
}
