/**
 * WHERE A PRE-TEST LIVES — one answer, for the four surfaces that ask.
 *
 * Dan, 2026-09-07: *"the Pre-Tests are still sitting under the SIO. They should
 * be moved into the SpecuLearn as separate page"*. Making that move meant
 * finding every place that wrote the address out, and there were four — the
 * stop popup, the unit list, a deck's shell and the teacher's dashboard — each
 * with `/pretests/${id}` typed by hand. Four copies of one fact is how they
 * start disagreeing; it is the same lesson `stopForDeck` was extracted for.
 *
 * So the address is written once here. If the pre-tests ever move again it is
 * this file and the forwarding stubs, not a search across the app.
 */

import { getPretestForSio } from "@/content/pretests";
import { UNIT0_QUESTIONS } from "@/content/sios/unit0-questions";
import { speculearnHref } from "@/lib/speculearn/route";
import { stopForDeck, stopForPretestId } from "@/lib/stopTag";

/**
 * The authored pre-tests of units 1–4, keyed by the pre-test's own id.
 *
 * SINCE THE MERGE (Dan, 2026-09-07: *"they CAN be and MUST NOW BE MERGED AS
 * ONE!"*) this returns the GOAL's one SpecuLearn, not the pre-test's old page.
 * The old page still answers and forwards here, so paper keeps working — but a
 * link the app draws today should not make a learner watch a hop.
 *
 * The fallback is the old address rather than null: a pre-test whose id does
 * not resolve to a stop still has to go somewhere, and a dead link is worse
 * than an extra hop.
 */
export function pretestHref(pretestId: string): string {
  const stop = stopForPretestId(pretestId);
  return stop ? speculearnHref(stop.id) : `/practice/speculearn/pretest/${pretestId}`;
}

/**
 * Unit 0's ten banks, keyed by the stop rather than by a pre-test id — they are
 * generated from the stop's own questions, not authored as files.
 *
 * These pool into the merged run too, with ONE exception that is deliberate and
 * is Dan's own rule rather than a limitation: `speculearnPool` drops `multi`
 * questions, which are graded on the exact SET of picks and are therefore not
 * multiple choice. Only SIO-010 has any (3 of its 21). They stay reachable at
 * `/pretests/unit0/SIO-010`, which still builds; they are simply not part of a
 * run that is defined as MCQ.
 */
export function unit0PretestHref(sioId: string): string {
  return speculearnHref(sioId);
}

/**
 * Where this deck's pre-test lives. Null = the deck has none.
 *
 * This lived in `components/CahierShell.tsx` — a page shell — which is why the
 * swipe rail could not ask it without a component importing backwards into a
 * library. It is a fact about routes, so it belongs with the other two.
 * CahierShell re-exports it; four callers already type it from there.
 *
 * `/unit/0#{id}` is the map popup (UnitRedirect), not the quiz.
 */
export function pretestHrefForDeck(collectionId: string | null | undefined): string | null {
  const sio = stopForDeck(collectionId);
  if (!sio) return null;
  const pretest = getPretestForSio(sio.id);
  if (pretest) return pretestHref(pretest.id);
  if ((UNIT0_QUESTIONS[sio.id] ?? []).length > 0) return unit0PretestHref(sio.id);
  return null;
}
