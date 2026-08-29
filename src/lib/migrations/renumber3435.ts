/**
 * SIO-034 and SIO-035 swapped places (Dan, 2026-08-29).
 *
 * « Questions » moved up to 34 and « Où est… ? » down to 35, so that locating
 * a place sits directly beside asking for directions (36). Dan: "if you want
 * to bring locating places closer to giving directions, we should move the
 * questions up so questions take 34, and those 2 take 35 36".
 *
 * WHY THIS FILE HAS TO EXIST. A SIO's number and its id are in lockstep —
 * `SIO-034` always has `num: 34`, unbroken across all fifty, and that is how
 * the 2026-07-01 renumber of 012-014 and 022-028 was done. So moving the
 * number moves the ID, and the id is what every store on the learner's device
 * is keyed by. Without this migration, anyone who had finished « Où est… ? »
 * would open the app to find they had finished « Questions » instead, and
 * their pre-test misses would be filed under the wrong stop.
 *
 * The 2026-07-01 renumber needed no migration only because the 2026-08-11
 * reset wiped every blob shortly afterwards. There has been no reset since.
 *
 * WHAT IT TOUCHES — the three stores keyed by SIO id:
 *
 *   fluolingo:progress          doneSios[], and itemSrs keys ("SIO-034:write")
 *   fluolingo:activityLedger    Ledger[activityKey][sioId]
 *   fluolingo:pretest.v1        "u3-sio034::u3-sio034-01" keys, and the
 *                               pretestId / itemId / sioId inside each record
 *
 * `fluolingo:blockers` is keyed by week, not by stop, and `lessonRun.v1` holds
 * a single in-progress run. Neither needs touching.
 *
 * WHY IT IS A STRAIGHT SWAP and not a rename. Both ids stay in use — this is
 * two stops exchanging numbers, not one being retired — so a two-pass rename
 * would collapse them onto each other. Everything below reads the old value
 * and writes the new in one pass.
 */

const STAMP_KEY = "fluolingo:migrations";
const ID = "renumber-34-35";

const A = "SIO-034";
const B = "SIO-035";
/** The pre-test collections carry the number in their own ids too. */
const PA = "u3-sio034";
const PB = "u3-sio035";

/** Swap A<->B in one pass. Anything else is returned untouched. */
function swapSio(id: string): string {
  return id === A ? B : id === B ? A : id;
}

/**
 * Swap the collection id wherever it appears in a string — it prefixes both
 * halves of a pre-test key ("u3-sio034::u3-sio034-01") and the item ids
 * inside it. Done via a placeholder rather than two replaces, because
 * replacing PA with PB and then PB with PA turns everything into PA.
 *
 * The placeholder is NUL, which cannot occur in any id we mint. A printable
 * stand-in such as a space would corrupt a key that happened to contain one.
 */
function swapPretestId(s: string): string {
  const TMP = "\u0000";
  return s.split(PA).join(TMP).split(PB).join(PA).split(TMP).join(PB);
}

function applied(): boolean {
  try {
    const raw = localStorage.getItem(STAMP_KEY);
    return !!raw && (JSON.parse(raw) as string[]).includes(ID);
  } catch {
    return false;
  }
}

function stamp(): void {
  try {
    const raw = localStorage.getItem(STAMP_KEY);
    const done: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!done.includes(ID)) done.push(ID);
    localStorage.setItem(STAMP_KEY, JSON.stringify(done));
  } catch {
    // If the stamp cannot be written the migration would run again on the next
    // load. That is harmless — see the swap-is-its-own-inverse note below —
    // but it WOULD swap back, so refuse to migrate at all rather than flap.
  }
}

/** Rewrite one localStorage blob in place. Missing or corrupt = nothing to do. */
function edit(key: string, fn: (v: unknown) => unknown): void {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const next = fn(JSON.parse(raw));
    if (next !== undefined) localStorage.setItem(key, JSON.stringify(next));
  } catch {
    // A blob we cannot parse is one we must not half-write.
  }
}

function migrateProgress(v: unknown): unknown {
  const p = v as { doneSios?: unknown; itemSrs?: Record<string, unknown> };
  if (Array.isArray(p.doneSios)) {
    p.doneSios = p.doneSios.map((s) => (typeof s === "string" ? swapSio(s) : s));
  }
  if (p.itemSrs && typeof p.itemSrs === "object") {
    const out: Record<string, unknown> = {};
    // SRS item ids are colon-separated, and the SIO does NOT always come
    // first: a lesson writes "SIO-034:write" but the GramMarathon finale
    // writes "finale:SIO-034:2". Swapping only the head silently missed every
    // finale answer — caught by grepping for what actually calls
    // recordItemResult rather than by trusting the one shape I had in mind.
    // Mapping EVERY segment handles both, and any third shape added later.
    for (const [k, val] of Object.entries(p.itemSrs)) {
      out[k.split(":").map(swapSio).join(":")] = val;
    }
    p.itemSrs = out;
  }
  return p;
}

function migrateLedger(v: unknown): unknown {
  const l = v as Record<string, Record<string, unknown>>;
  for (const activity of Object.keys(l)) {
    const inner = l[activity];
    if (!inner || typeof inner !== "object") continue;
    const out: Record<string, unknown> = {};
    for (const [sio, tally] of Object.entries(inner)) out[swapSio(sio)] = tally;
    l[activity] = out;
  }
  return l;
}

function migratePretests(v: unknown): unknown {
  const s = v as {
    items?: Record<string, Record<string, unknown>>;
    lastTakenAt?: Record<string, unknown>;
  };
  if (s.items && typeof s.items === "object") {
    const out: Record<string, Record<string, unknown>> = {};
    for (const [k, rec] of Object.entries(s.items)) {
      const next = { ...rec };
      if (typeof next.sioId === "string") next.sioId = swapSio(next.sioId);
      if (typeof next.pretestId === "string") next.pretestId = swapPretestId(next.pretestId);
      if (typeof next.itemId === "string") next.itemId = swapPretestId(next.itemId);
      out[swapPretestId(k)] = next;
    }
    s.items = out;
  }
  if (s.lastTakenAt && typeof s.lastTakenAt === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, at] of Object.entries(s.lastTakenAt)) out[swapPretestId(k)] = at;
    s.lastTakenAt = out;
  }
  return s;
}

/**
 * Run the swap once, on whichever store is read first.
 *
 * Called from the top of `loadProgress`, `loadLedger` and the pre-test store's
 * own `load`, so there is no boot-ordering dependency to get wrong: the first
 * read of any of the three migrates all three, and every later call is a
 * single localStorage hit.
 *
 * NOT idempotent by shape — the swap is its own inverse, so running it twice
 * puts everything back. That is exactly why the stamp is written FIRST, and
 * why a failed stamp aborts instead of migrating.
 */
export function ensureRenumber3435(): void {
  if (typeof window === "undefined") return;
  if (applied()) return;
  stamp();
  if (!applied()) return; // stamp failed — do not migrate what we cannot record
  edit("fluolingo:progress", migrateProgress);
  edit("fluolingo:activityLedger", migrateLedger);
  edit("fluolingo:pretest.v1", migratePretests);
}

/** Exported for the check in verify/verify49-renumber-3435.py. */
export const __test = { swapSio, swapPretestId, migrateProgress, migrateLedger, migratePretests };
