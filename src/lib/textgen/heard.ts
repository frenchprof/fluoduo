/**
 * The heard-log: every sentence a learner has already listened to, per unit,
 * so ÉcouTexte never plays the same sentence twice (Dan, 2026-07-28: "there
 * must never be two times of hearing the same sentence").
 *
 * Stored as fingerprints (see engine.fingerprint) in localStorage, capped so
 * the entry can't grow without bound. When a unit's combination space is
 * genuinely exhausted the generator says so and the learner can clear the
 * log — repeating knowingly beats repeating silently.
 */

const KEY = "fluolingo:ecoutexte:heard";
/** Ring-buffer cap per unit. Well above any unit's combination space. */
const CAP = 4000;

type Store = Record<string, string[]>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* quota or private mode — the session still dedupes via the in-memory set */
  }
}

export function loadHeard(unit: number): Set<string> {
  return new Set(read()[String(unit)] ?? []);
}

export function saveHeard(unit: number, heard: ReadonlySet<string>): void {
  const store = read();
  store[String(unit)] = [...heard].slice(-CAP);
  write(store);
}

export function clearHeard(unit: number): void {
  const store = read();
  delete store[String(unit)];
  write(store);
}
