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
 *
 * AND UNIT 0 CAME IN HERE ON 2026-09-08, which is the same lesson a third time.
 * Its questions are a different shape — a prompt and four options rather than
 * an authored `PretestItem` — so they had their own writer inside the stacked
 * page, and when that page became a forward to the merged run the write simply
 * stopped happening: from the 7 Sep merge the only surface that recorded a
 * Unit-0 answer was one nothing linked to. Restoring it INSIDE the runner
 * rather than inside the feed is the whole point — verify22 forbids an engine
 * from calling `recordPretestAnswer` itself, and that rule is why this file
 * exists.
 */
import { sioIdForPretest } from "@/content/pretests";
import { recordPretestAnswer, stemForItem } from "@/lib/pretestRecord";
import { logEvent } from "@/lib/firebase/usage";
import type { PretestItem } from "@/lib/pretests/schema";
import { unit0QuestionId, type Unit0Question } from "@/content/sios/unit0-questions";


export { shuffle } from "@/lib/shuffle";
/** Speak the FULL sentence, never the lonely answer word. */
/**
 * THE SAME SENTENCE, WITH A CHOSEN OPTION IN THE BLANK (Dan, 2026-09-13:
 * *"once a blank is correctly filled (either via MCQ or whatever means) it must
 * read out the entire sentence - with possibility to repeat"*, and *"never TTS
 * just individual words... verbs, e.g. Je m'appelle (never just m'appelle)"*).
 *
 * `ttsTextForItem` reads the sentence with the RIGHT answer in it, which is
 * what a correct fill should say. This is its sibling for the other tap: once a
 * question is answered every option stays playable, and playing one used to
 * read that option ALONE. A learner tapping « m'appelle » heard « m'appelle ».
 *
 * `fullSentence` is deliberately NOT used here even when the item has one: it
 * is the sentence with the correct answer baked in, so it would read the right
 * answer whichever option was tapped — silently wrong, and wrong in the most
 * confusing direction. Before + choice + after always speaks what was touched.
 */
export function sentenceWith(item: PretestItem, choice: string): string {
  return `${item.sentenceBefore} ${choice} ${item.sentenceAfter}`
    .replace(/\s+/g, " ")
    .trim();
}

export function ttsTextForItem(item: PretestItem): string {
  if (item.fullSentence && item.fullSentence.trim()) return item.fullSentence;
  return `${item.sentenceBefore} ${item.answer} ${item.sentenceAfter}`
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The same job for a UNIT-0 question, which is not an authored `PretestItem`.
 *
 * Dan, 2026-08-27, of a pre-lesson guess: *"remember it, but don't score it"* —
 * so this writes the record and the evidence and nothing else. No `logEvent`,
 * because a unit-0 question has never carried a pretest id to log under.
 *
 * TWO IDS, AND THEY ARE NOT INTERCHANGEABLE. The record is keyed
 * `unit0:<stop>`; the EVIDENCE is keyed by the stop's DECK id, because
 * `activityLedger` resolves a stop by taking the tail after the last colon and
 * asking `sioForDeck` — a SIO id there resolves to nothing and the write
 * silently no-ops. That was traced rather than assumed when the stacked page
 * was built, because a no-op looks identical to success from the call site.
 */
export function judgeUnit0Answer(
  sioId: string,
  deckId: string,
  q: Unit0Question,
  answer: string,
  choice: string,
): boolean {
  const correct = choice === answer;
  recordPretestEvidence(deckId, unit0QuestionId(q), correct, choice);
  recordPretestAnswer({
    pretestId: `unit0:${sioId}`,
    sioId,
    itemId: unit0QuestionId(q),
    correct,
    picked: choice,
    answer,
    stem: (q.stem ?? q.title ?? q.emoji ?? "").replace(/\s+/g, " ").trim(),
  });
  return correct;
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
