/**
 * THE FIVE WAYS OUT OF A FINISHED ACTIVITY — Dan's own list, 2026-09-13:
 *
 *   *"for the other activities, we can offer them one step back to the
 *    previous activity of that goal, or forward to the next activity for that
 *    goal, or return to the 🎯 page (SIO) to select another activity. or to
 *    redo, or to go down towards the same activity for the next available stop
 *    (Not all stops have all activities)"*
 *
 * Four of those are addresses and one is an action, so this module answers the
 * four and the caller supplies « redo » — a drill already knows how to restart
 * itself and nothing here could do it for them.
 *
 * WHY IT IS ONE MODULE. Dan's ask was *"for ALL the stops there should be
 * something like this at the end"*, and the end-of-run footers are currently
 * eight different hand-written rows: DrillShell's, GameOver's, SpecuLearn's
 * recap, the deck table's… Each knows a different subset of the moves, which
 * is why one of them offers « Continue to MneMemo » and another offers nothing
 * but « Back ». Computing the compass once is what lets every footer show the
 * same five.
 *
 * NOTHING HERE INVENTS A DOOR. `stepsOf` only lists activities that HAVE a
 * real address for that stop (nextStep's rule 2), and `stopHref` returns null
 * for a stop an activity cannot play — which is the parenthesis in Dan's own
 * sentence, *"(Not all stops have all activities)"*. A missing move is absent,
 * never a dead link.
 */
import { SIOS, type Sio } from "@/content/sios";
import { activity } from "@/content/activities";
import { deckActivityTabs } from "@/components/CahierShell";
import { cellHref } from "@/lib/indexMatrix";
import { sioHref } from "@/lib/routes";
import { goalNumber, stopForDeck } from "@/lib/stopTag";

/** One move on the compass: where it goes and how to name it on a button. */
export type UsherMove = {
  href: string;
  /** Registry key of the activity it leads to, where it leads to one. */
  key?: string;
  name: string;
  emoji: string;
  /** The goal number at the far end, for « … for 🎯 2 ». */
  goal?: number;
};

export type Usher = {
  /** The stop this compass is centred on. */
  sio: Sio;
  /** ← the activity before this one in the stop's chain. */
  prev?: UsherMove;
  /** → the activity after this one in the stop's chain. */
  next?: UsherMove;
  /** 🎯 the stop's own page — ALWAYS present (Dan: *"The return to the 🎯
   *  page (SIO) for this activity should always be offered"*). */
  goal: UsherMove;
  /** ↓ the same activity at the next stop that can play it. */
  onward?: UsherMove;
};

/** `deckActivityTabs` keys differ from registry keys in one place — the same
 *  mapping `indexMatrix` keeps, in the other direction. */
const REGISTRY_KEY: Record<string, string> = { say: "wordrill" };

/**
 * The stop's chain — the goal's own activities, in the goal's own order.
 *
 * THIS READS `deckActivityTabs`, AND THE FIRST VERSION DID NOT. It walked
 * `activitiesIn("practice")`, i.e. the PRACTICE FAMILY, which is not the same
 * set at all: GramMarathon and ErroReview live in 🔄 Revise, ÉcouTexte and
 * WorDrill in 💬 Oral, ComposeIt in 🛠️ Tools. So a learner finishing
 * GramMarathon — a stop activity by any reading of Dan's sentence — matched
 * nothing in the chain, `findIndex` returned -1, and BOTH the ← and → doors
 * were silently absent. Same shape of fault as the ↓ door that went missing
 * through `stopHref`: a key cast into a set that does not contain it.
 *
 * `deckActivityTabs` is the one list that already knows a goal's activities
 * AND their canonical order (Dan, 2026-07-19: SpecuLearn → Lesson → Flip It →
 * … → GramMarathon → WorDrill). `cellHref` reads the same table, so the two
 * halves of this compass cannot drift apart.
 *
 * A tab with no `href` is the CURRENT page (`withActive` drops it) and a
 * supplement is not a registry activity — both are skipped, so no door here
 * can be dead or nameless.
 */
function chainOf(sio: Sio): { key: string; href: string }[] {
  if (!sio.collectionId) return [];
  return deckActivityTabs(sio.collectionId).flatMap((t) => {
    const key = REGISTRY_KEY[t.key] ?? t.key;
    return t.href && activity(key) ? [{ key, href: t.href }] : [];
  });
}

function move(key: string, href: string, goal?: number): UsherMove {
  const a = activity(key);
  return { href, key, name: a?.name ?? key, emoji: a?.emoji ?? "", goal };
}

/**
 * Build the compass for an activity that has just finished.
 *
 * `at` takes either the deck or the stop id, the same pair `nextStep` accepts,
 * because the callers differ: a drill knows its deck, a lesson knows its stop.
 * With neither — or with a deck that belongs to no stop — there is no compass
 * to draw and this returns null rather than a half one pointing at the map.
 */
export function usherFor(
  activityKey: string | undefined,
  at: { collectionId?: string | null; sioId?: string | null },
): Usher | null {
  const sio =
    (at.sioId && SIOS.find((s) => s.id === at.sioId)) ||
    (at.collectionId && stopForDeck(at.collectionId)) ||
    null;
  if (!sio) return null;

  const n = goalNumber(sio);
  const goal: UsherMove = { href: sioHref(sio.id), name: `🎯 ${n ?? ""}`.trim(), emoji: "🎯", goal: n };

  const chain = chainOf(sio);
  const i = activityKey ? chain.findIndex((s) => s.key === activityKey) : -1;
  const prev = i > 0 ? move(chain[i - 1].key, chain[i - 1].href, n) : undefined;
  const next = i >= 0 && i < chain.length - 1 ? move(chain[i + 1].key, chain[i + 1].href, n) : undefined;

  // ↓ THE SAME ACTIVITY, THE NEXT STOP THAT CAN PLAY IT. Not `nearestPlayable`,
  // which picks the CLOSEST stop in either direction — that is right for a
  // picker opening on a learner's own position and wrong here, where Dan's word
  // is "down": forward, or nothing.
  //
  // THROUGH `cellHref`, NOT `stopHref`, AND THAT WAS A BUG FOR ONE BUILD.
  // `stopHref` answers for the eight keys its `StopActivityKey` union names —
  // the activities whose pop-up asks "which goal?" — and `speculearn` is not
  // one of them. Casting the key into that union compiled, matched no branch,
  // and returned null for every stop, so the ↓ door was simply absent from
  // SpecuLearn's own recap: the very card Dan photographed asking for it.
  // `cellHref` is the function `chainOf` above already uses and it knows every
  // activity, so the two halves of this compass now read the same table.
  let onward: UsherMove | undefined;
  if (activityKey && n !== undefined) {
    for (let s = n + 1; s <= SIOS.length; s++) {
      const sioAt = SIOS[s - 1];
      const href = sioAt ? cellHref(activityKey, sioAt) : null;
      if (href) { onward = move(activityKey, href, s); break; }
    }
  }
  return { sio, prev, next, goal, onward };
}
