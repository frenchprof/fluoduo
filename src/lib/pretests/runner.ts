/**
 * The ONE pretest runner core (patch 22) — both engines route through here.
 *
 * Before this file, PretestQuiz (the popup's all-at-one-glance stack) and
 * PretestContent (/pretests/[id], one card at a time) each carried their own
 * byte-identical copies of the shuffle, the speak-the-full-sentence rule and
 * the judge+ledger (grade → recordPretestAnswer → logEvent). Two copies of a
 * ledger is how one of them drifts; the Unit-0 quiz already proves it — it
 * grades but never records. The presentation stays per-engine; the facts of
 * an answer are decided and recorded here only.
 */
import { sioIdForPretest } from "@/content/pretests";
import { recordPretestAnswer, stemForItem } from "@/lib/pretestRecord";
import { logEvent } from "@/lib/firebase/usage";
import type { PretestItem } from "@/lib/pretests/schema";


export { shuffle } from "@/lib/shuffle";
/** Speak the FULL sentence, never the lonely answer word. */
export function ttsTextForItem(item: PretestItem): string {
  if (item.fullSentence && item.fullSentence.trim()) return item.fullSentence;
  return `${item.sentenceBefore} ${item.answer} ${item.sentenceAfter}`
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Judge one pick and write the ledger: the gap report entry (audit R1 — the
 * verdict must survive popup close) and the usage event. Returns the verdict
 * so the caller only renders it.
 */
export function judgePretestAnswer(pretestId: string, item: PretestItem, choice: string): boolean {
  const correct = choice === item.answer;
  recordPretestAnswer({
    pretestId,
    sioId: sioIdForPretest(pretestId) ?? "",
    itemId: item.id,
    correct,
    picked: choice,
    answer: item.answer,
    stem: stemForItem(item),
  });
  void logEvent("pretest.answer", {
    pretestId,
    itemId: item.id,
    correct,
    picked: choice,
  });
  recordPretestEvidence(pretestId, item.id, correct, choice);
  return correct;
}

/**
 * The pre-test answer as EVIDENCE (Dan, 2026-08-30: "yes").
 *
 * A pre-test is the only occasion the app can observe a learner cold, before
 * instruction — which is exactly what `diagnostic` means in PRD §7, and until
 * now the store held none, because pre-tests wrote only localStorage and a
 * usage event. Those two live in different piles from every other answer, so
 * "did they know this before the lesson, and after?" could not be asked of the
 * store at all.
 *
 * DAN'S 27 AUGUST RULE IS UNTOUCHED — "remember it, but don't score it". That
 * rule is about XP, accuracy and the review queue, and this deliberately goes
 * nowhere near them: NOT recordItemResult (which pays XP and steps the SRS
 * ladder), but recordResponse directly, with `xpPaid: 0`. A pre-test miss
 * still costs nothing and still never enters the review queue.
 *
 * The label is what makes this safe. Anything reading the response store must
 * honour `evidenceType: "diagnostic"` — a cold guess counted as a failure is
 * the one way this could do harm.
 *
 * Dynamic import keeps Firestore out of this module's static graph (the
 * usage.ts rule); fire-and-forget, signed-out is a no-op.
 */
function recordPretestEvidence(
  pretestId: string,
  itemId: string,
  correct: boolean,
  picked: string,
): void {
  const activity = `pretest:${pretestId}`;
  void Promise.all([import("@/lib/firebase/responses"), import("@/lib/evidence")])
    .then(([r, e]) =>
      r.recordResponse(itemId, correct, {
        given: picked,
        activity,
        xpPaid: 0,
        evidence: e.buildEvidence(itemId, activity),
      }),
    )
    .catch(() => {});
}

export { recordPretestEvidence };
