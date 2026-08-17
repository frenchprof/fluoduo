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
  return correct;
}
