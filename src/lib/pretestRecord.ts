/**
 * Pretest gap record — the PRIME "gap report" backing store (audit R1).
 * Results used to evaporate when the SIO popup closed; this keeps the LAST
 * verdict per item in localStorage so the learner's "Bring to class" list and
 * any later reopen of the popup reflect their most recent attempt.
 *
 * Clear semantics: retaking an item OVERWRITES its record — a later correct
 * answer clears the miss.
 */

const KEY = "fluolingo:pretest.v1";

/** Fired on window after every recordPretestAnswer, so mounted gap lists
 *  refresh live while the learner is still answering. */
export const PRETEST_RECORD_EVENT = "fluolingo:pretest-record";

type ItemRecord = {
  pretestId: string;
  sioId: string;
  itemId: string;
  correct: boolean;
  picked: string;
  answer: string;
  stem: string;
  at: number;
};

type Store = {
  /** Last result per item, keyed "pretestId::itemId" (item ids are only
   *  guaranteed stable WITHIN a pretest). */
  items: Record<string, ItemRecord>;
  /** Per pretestId — when it was last attempted. */
  lastTakenAt: Record<string, number>;
};

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Store>;
      return {
        items: parsed.items ?? {},
        lastTakenAt: parsed.lastTakenAt ?? {},
      };
    }
  } catch {
    // corrupt / unavailable storage → start fresh
  }
  return { items: {}, lastTakenAt: {} };
}

function save(store: Store): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // storage full / private mode — the quiz itself must never break
  }
}

/** The gapped sentence as displayed: before + "___" + after, whitespace-normalised. */
export function stemForItem(item: { sentenceBefore: string; sentenceAfter: string }): string {
  return `${item.sentenceBefore} ___ ${item.sentenceAfter}`.replace(/\s+/g, " ").trim();
}

export function recordPretestAnswer(a: {
  pretestId: string;
  sioId: string;
  itemId: string;
  correct: boolean;
  picked: string;
  answer: string;
  stem: string;
}): void {
  if (typeof window === "undefined") return;
  const store = load();
  store.items[`${a.pretestId}::${a.itemId}`] = { ...a, at: Date.now() };
  store.lastTakenAt[a.pretestId] = Date.now();
  save(store);
  try {
    window.dispatchEvent(new Event(PRETEST_RECORD_EVENT));
  } catch {}
}

/** Currently-missed items for a SIO (last attempt wrong), oldest first. */
export function missesForSio(
  sioId: string,
): Array<{ itemId: string; stem: string; answer: string; picked: string }> {
  if (typeof window === "undefined") return [];
  return Object.values(load().items)
    .filter((r) => r.sioId === sioId && !r.correct)
    .sort((x, y) => x.at - y.at)
    .map(({ itemId, stem, answer, picked }) => ({ itemId, stem, answer, picked }));
}
