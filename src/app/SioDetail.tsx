"use client";

/**
 * The body of a SIO popup: the can-do statement. That is the whole of it.
 *
 * Dan, 2026-07-01: "STICK TO THE ESSENTIALS. SHORT AND SWEET. EFFICIENT" — no
 * "Statement of SIO" / "Measurable Language Competency" headers, one merged
 * sentence via sioStatement(). Then 2026-08-31: "collapse the interfaces to
 * ONLY reveal the SIO spelled out fully, then the links to the relevant items
 * within the stop. THAT IS IT."
 *
 * THE ATELIERS ESCAPED THAT COLLAPSE (#99), and this closes it. The collapse
 * emptied three of this file's four branches; the fourth fired only when
 * `sio.isProduction`, so the six atelier stops kept printing their whole model
 * dialogue — six to ten lines of French and English, with play buttons — above
 * the link list. Nobody saw it because no other stop takes that branch.
 *
 * That is not just duplication. THE MODEL DIALOGUE IS THE PRE-TEST'S ANSWER
 * KEY. An atelier pre-test asks "which French line says « The flag has two
 * colours: red and white »?" and offers four lines OF THAT DIALOGUE
 * (content/pretests/ateliers.gen.ts) — all of which were printed on screen,
 * immediately above the button that starts it. A cold guess was impossible to
 * make, so the one thing the pre-test measures could not be measured.
 *
 * The dialogue is not lost and does not need a new page: it is the atelier
 * deck's Mémo — « Le modèle », built from the same ATELIER_DIALOGUES so it
 * cannot drift (content/memos.tsx) — which is link ② in the very list this
 * body sits above. Read it when you choose to, not before the guess.
 *
 * Dan, 2026-08-31: "i would rather the SIO and the items (however few) not be
 * lumped into the same space anymore."
 */
import { sioStatement, type Sio } from "@/content/sios";

export default function SioDetail({ sio }: { sio: Sio }) {
  return (
    <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
      <span className="fluo-hl">{sioStatement(sio)}</span>
    </p>
  );
}

/* AfterPretest is gone with the chips it gated. It hid the lesson buttons
 * until the popup's inline pre-test fired `fluolingo:pretest-complete`, so a
 * learner could not be tempted away mid-guess (Dan, 2026-07-05: pre-test
 * first, lesson after). Neither the inline pre-test nor the chips render here
 * any more — the rule it enforced is now structural rather than conditional:
 * the popup shows no lesson at all, only a link to one. PretestQuiz still
 * fires the event; the pre-test PAGE is what listens.
 */

/* CLASS BAG IS DISSOLVED (Dan, 5 Sep: "dissolve class bag as a concept = we
 * dowan that anymore"), and with it BringToClass, its miss chips, its fold,
 * its Show-in-class projector view, its copy-list button and the soft-auth
 * prompt that guarded saving a bag.
 *
 * It was the last of the bring-to-class narrative Dan retired on 31 Aug —
 * "i want to drop the bring-to-class narrative. it is just for them to revise
 * in DéjàRevue (or the Reviser whatever it is called)". The end of a
 * SpecuLearn run said "Class bag / You can: … / Show in class", which asked a
 * learner to carry a list to a room instead of to revise it.
 *
 * WHAT IS NOT DELETED: the record itself. recordPretestAnswer still writes
 * every miss to fluolingo:pretest.v1 and missesForSio still reads it — that
 * store is where Réviser will find them. Nothing displays it today, which is
 * the one loose end of this change and is flagged to Dan rather than papered
 * over: pre-tests are barred from queueForReview (verify40), so a miss
 * reaching the review queue is his call, not a refactor.
 */

/* PracticeChips is gone with the "Post-Class Practice" tile it filled. It
 * derived its chips from deckActivityTabs so they could not drift from the
 * popup's own links — which is the same list the popup now draws directly, one
 * copy instead of two. Deriving both from one source was the right fix for
 * 2026-08-02; showing one of them is the right fix for the collapse.
 */
