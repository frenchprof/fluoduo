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
import { stopForDeck } from "@/lib/stopTag";

/** The authored pre-tests of units 1–4, keyed by the pre-test's own id. */
export function pretestHref(pretestId: string): string {
  return `/practice/speculearn/pretest/${pretestId}`;
}

/** Unit 0's ten banks, keyed by the stop rather than by a pre-test id — they
 *  are generated from the stop's own questions, not authored as files. */
export function unit0PretestHref(sioId: string): string {
  return `/pretests/unit0/${sioId}`;
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
