/**
 * The ONE rule for "which sentence does this item's gap live in?".
 *
 * Two authoring patterns coexist in the curated decks, both legitimate:
 *
 *   A. `fr` IS the drilled sentence, `example` is a contrast line.
 *      partitifs: fr "Je mange du pain." · gap "du" · example "J'aime le pain."
 *
 *   B. `fr` is a short grid label, `example` is the drilled sentence.
 *      en-au-aux-a, lieux-letris: fr "le Japon" · gap "au" · example "Je vais au Japon."
 *
 * Before this helper, five call sites disagreed about which to use:
 *
 *   gramMarathonReady.ts   (it.example ?? it.fr)   ← readiness gate
 *   GramMarathonContent    it.fr                   ← the game itself
 *   DicedPractice          (it.example ?? it.fr)
 *   CahierShell            it.fr                   ← tab visibility
 *   activities/page        it.fr                   ← tab visibility
 *
 * The consequences were silent and real (verified 2026-08-08 against the deck set):
 *   · partitifs (SIO-042)     passed 3/16 → below MIN_GAPPED → GramMarathon tab never rendered
 *   · en-au-aux-a (SIO-032)   passed the gate on `example`, then the game filtered on `fr`
 *                             and found 0 items → an empty marathon
 *   · lieux-letris (SIO-033)  same, 1 item → a one-question "marathon"
 *
 * Resolution: prefer whichever sentence actually CONTAINS the gap, `fr` first.
 * Every call site uses this, so the gate, the tabs and the game can never
 * disagree again. Non-dismantling: no deck that was playable before loses items.
 */
import type { Item } from "./schema";

/** Does this string read as a whole sentence rather than a grid label?
 *
 *  « J'y vais en train. » and « Tu y vas en bus ? » do; « en train » does not.
 *  Final punctuation is the test because that is what the two authoring
 *  patterns above actually differ by — pattern A's `fr` IS a sentence and
 *  ends like one, pattern B's `fr` is a two-word label and does not. */
const isSentence = (s: string): boolean => /[.?!]\s*$/.test(s);

/** The sentence to blank, split and grade for this item.
 *
 * `fr` FIRST, EXCEPT WHEN `fr` IS A LABEL AND `example` IS A SENTENCE.
 *
 * The `fr`-first rule was written for pattern A, where `fr` is the drilled
 * sentence. It silently misfires on a pattern-B deck whose LABEL happens to
 * contain the gap: transport's `fr` is « en train » with gap « en », so every
 * one of its twelve cards blanked the label and dealt « ? train » — a fragment
 * with no sentence around it, on a stop whose whole subject is a frame inside
 * a sentence. Dan saw the card on 1 Sep and asked for the hybrid: the deck's
 * own sentence, « J'y vais ? moto », with the English under it.
 *
 * Only 19 items across three decks change (aimer-activites, lieux-letris,
 * transport) and every one of them goes from a fragment to that deck's own
 * example sentence. Pattern A is untouched — partitifs' « Je mange du pain. »
 * ends in a full stop, so `fr` still wins. Nothing loses playability either
 * way: this only chooses between two strings that BOTH contain the gap.
 */
/** Which field the card is built from. ONE decision, so the French and its
 *  English gloss cannot disagree — they did for one build: the sentence moved
 *  to `example` while the gloss stayed on `en`, and the card read
 *  « J'y vais ? métro. » over "by metro". */
function gapField(it: Item): "fr" | "example" {
  if (it.gap) {
    const frHas = !!it.fr?.includes(it.gap);
    const exHas = !!it.example?.includes(it.gap);
    if (frHas && exHas && !isSentence(it.fr!) && isSentence(it.example!)) return "example";
    if (frHas) return "fr";
    if (exHas) return "example";
  }
  // No gap, or a mis-authored one: fall back to the previous display rule.
  return it.example ? "example" : "fr";
}

export function gapSentence(it: Item): string {
  return gapField(it) === "example" ? (it.example ?? it.fr) : it.fr;
}

/** English gloss matching whichever sentence `gapSentence` chose. */
export function gapSentenceEn(it: Item): string | undefined {
  return gapField(it) === "example" ? (it.exampleEn ?? it.en) : it.en;
}

/** Does this item actually play? A gap that appears in neither sentence is
 *  mis-authored and must sit the game out rather than render a blank-less
 *  question. */
export function isPlayableGap(it: Item): boolean {
  return !!it.gap && gapSentence(it).includes(it.gap);
}

/**
 * The WRONG answers for a gap card: every playable gap in the deck except the
 * one being asked, put through the deck's `gapDecoys` substitutions.
 *
 * THE ONE RULE FOR "what may be offered as wrong?", for the same reason
 * `gapSentence` is the one rule for "which sentence holds the gap?" — three
 * surfaces were each deriving this pool for themselves, so a deck could be
 * corrected in one and stay broken in the other two:
 *
 *   buildCards deckSupply   `distractors(gapPool, item.gap)`   ← the ★ MCQ
 *   buildCards deckSupply   `bankPool: gapPool`                ← ★★'s tiles
 *   GramMarathonContent     other items' gaps                  ← its tiles
 *
 * WHAT IT FIXES (Dan, 2026-09-01). A deck's other gaps are the right wrong
 * answers as long as they are actually wrong. `envies-besoins` blanks « Je ___
 * visiter Paris. », marks `veux` correct and offered `voudrais` — good French,
 * differing only in register — so a learner who picked it was marked wrong for
 * knowing more. `gapDecoys` maps such a pair to forms that cannot be right
 * (`voudrait`, `veut`: third person, wrong on agreement after « Je »), and to
 * forms that start with a CONSONANT — a vowel-initial wrong answer is wrong on
 * elision (« Je envie… ») before it is wrong about wanting and needing, so a
 * learner rejects it without having learnt anything (Dan, same day).
 *
 * The substitution touches the DECOY only. The item's own `gap` stays the
 * answer, is still what a typed answer is graded against, and is excluded here
 * by its FINAL form as well as its original — so a deck that mapped a word to
 * one already in the deck could not hand a learner their own answer as a
 * wrong option.
 */
export function gapDecoyPool(
  deck: { items: Item[]; gapDecoys?: Record<string, string> },
  answer: string,
): string[] {
  const map = deck.gapDecoys ?? {};
  const out: string[] = [];
  for (const it of deck.items) {
    if (!isPlayableGap(it)) continue;
    const decoy = map[it.gap!] ?? it.gap!;
    if (decoy === answer || it.gap === answer) continue;
    out.push(decoy);
  }
  return out;
}
