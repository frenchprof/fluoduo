/**
 * A stop is done when everything at it is done — not when someone says so.
 *
 * Dan, 2026-08-31: *"I think it should only be marked done if it is really
 * FULLY done. so we should remove it"* — of the Mark-as-done button.
 *
 * WHAT WAS WRONG. `doneSios` was self-declared. A learner could open SIO-023,
 * tap Mark as done having answered nothing, and the stop counted: the map
 * circle filled, the n/50 counter moved, Continuer advanced past it, the
 * teacher's heat strip showed it, and four badges in economy.ts read the
 * length of that list. The one signal the app had for "this learner has
 * covered this" was a button.
 *
 * THE RULE. A stop is complete when every activity it actually OFFERS has
 * been attempted. Offered, not the registry's seventeen: Sorting only exists
 * where a deck declares Letris columns, iComplete's door moved to Memo, and a
 * culled activity must leave the requirement the moment it leaves the list.
 * So the list comes from `deckActivityTabs` — the same list the SIO popup
 * draws as its links, which is the point: **what a stop shows you and what it
 * asks of you are one list, and cannot disagree.**
 *
 * WHERE IT FIRES, and why not on read. The obvious shape is to make
 * `isSioDone` compute this — but it is called inside render loops in 13 files,
 * and computing 50 stops' activity lists per render is work nobody asked for.
 * Instead the check runs where a stop's state can actually CHANGE: once per
 * graded answer, in `noteAttempt`. That also means completion still flows
 * through `markSioDone`, so XP, gems, the streak and the badges behave exactly
 * as they did when the button called it — earned now rather than claimed.
 *
 * GRANDFATHERED (Dan's call, 31 Aug). Existing `doneSios` entries stand and
 * this rule only ever ADDS. Nobody's 34/50 becomes 21/50 and no badge is
 * revoked. It is also the safe answer if the reset really did clear every
 * device: a union with an empty set is the set.
 */
import { deckActivityTabs } from "@/components/CahierShell";
import { activity } from "@/content/activities";
import { SIOS, type Sio } from "@/content/sios";
import { accuracyFor, activityKeyFor, type Ledger } from "@/lib/activityLedger";

/**
 * The ledger keys a stop must have before it counts as done.
 *
 * Derived through `activityKeyFor(href)` rather than a second mapping table:
 * that is the same route→key fold the ledger itself uses when it writes, so a
 * renamed surface (`sorting:` → `dice-practice:`, 31 Aug) cannot make a stop
 * permanently incompletable by being written under one name and required
 * under another.
 */
export function requiredKeys(sio: Sio): string[] {
  if (!sio.collectionId) return [];
  const keys = new Set<string>();
  for (const t of deckActivityTabs(sio.collectionId)) {
    // A row with no href is a door that does not exist at this stop. Requiring
    // it would make the stop impossible, which is the opposite of the rule.
    const k = t.href ? activityKeyFor(t.href) : undefined;
    if (!k) continue;
    // THE GAMES ARE EXTRAS, NOT REQUIREMENTS (Dan, 2026-08-31, shown the two
    // readings side by side and choosing this one). Requiring every link put
    // 6 or 7 activities between a learner and a tick at most stops, VocabulaRain
    // and LexicaLater included — so someone who did all the French and skipped
    // the games would never complete a stop. Excluding the svplay family
    // leaves 4 to 6, which is still every teaching surface and still nothing a
    // learner can claim without doing.
    //
    // By FAMILY, not by a list of game names: a game added to a deck tomorrow
    // is an extra without anyone remembering to exempt it here.
    if (activity(k)?.family === "svplay") continue;
    keys.add(k);
  }
  return [...keys];
}

/**
 * Has this stop had every door opened?
 *
 * ATTEMPTED, not passed. `accuracyFor` is non-null the moment one answer is
 * banked, right or wrong. That is deliberate and matches the rest of the app:
 * errors are learning signals here, never a cost (progress.ts's hearts note),
 * and a stop you have worked through is covered whether or not you aced it.
 * A stop that offers nothing can never be complete — see `UNCOVERABLE` below.
 */
export function stopIsComplete(sio: Sio, ledger: Ledger): boolean {
  const keys = requiredKeys(sio);
  if (keys.length === 0) return false;
  return keys.every((k) => accuracyFor(ledger, k, sio.id) !== null);
}

/**
 * Stops that offer no gradeable activity, and so can never be derived-done.
 *
 * Computed, never listed. Before the button was removed these could be
 * self-marked; now they cannot be completed at all, which is a real loss and
 * belongs in the open rather than in a silent `return false`. If this set is
 * ever non-empty in a way Dan minds, the fix is content — give the stop an
 * activity — not an exception here.
 */
export function uncoverableStops(): Sio[] {
  return SIOS.filter((s) => requiredKeys(s).length === 0);
}
