/**
 * Does this candidate word still make FRENCH in that frame?
 *
 * THE BUG THIS EXISTS FOR. `deckSupply` in the lesson pager builds a cloze card
 * by blanking an item's `gap` and offering every distinct gap value in the deck
 * as the choices. It never asks whether a given value is grammatical in THIS
 * item's frame, so /lessons/deck/envies-besoins deals:
 *
 *     J'?  une chambre pour deux personnes.     veux · besoin d' · voudrais · aimerais
 *     Je ? partir en vacances.                  aimerais · besoin d' · voudrais · veux
 *
 * « J'veux », « J'besoin d' », « Je aimerais » are not French. A learner can
 * reject three of the four options by ear without thinking about what the card
 * teaches, and the wrong forms are printed on the screen either way.
 *
 * WHAT THIS CAN AND CANNOT DECIDE. It checks the JOINS — what happens where the
 * frame meets the word — and nothing else. That is deliberate: whether « Je
 * Madame » is a sensible distractor is a question about meaning, and the only
 * general answer to a question about meaning is per-deck knowledge, which is
 * what a lesson's own generator carries (transport.gen.ts's GAP_CHOICES,
 * wants-needs.gen.ts's openersFor). Elision is different: it is mechanical,
 * it needs no vocabulary, and it is what every observed instance of this fault
 * has turned on.
 *
 * The same fault, from the other side, is why the atelier lessons stopped
 * building cards out of FINALE_BANK (see atelierModel.ts): substituting one
 * item's answer into another item's frame is unsound in general. Where a lesson
 * knows better it should decide; where nothing knows better, this at least
 * refuses to print bad French.
 *
 * WHAT IS STILL WRONG AFTER THIS, MEASURED AND NAMED. « Je besoin d'un café »
 * survives, because nothing about it breaks at a join — « besoin » is a noun
 * that needs `avoir`, which is a fact about the word, not about the seam. The
 * obvious next rule was attestation: only offer a value the deck itself writes
 * after this frame's last word. It was measured before being believed, and it
 * forces 110 of 294 cards — 37%, across 20 decks — onto the typed fallback,
 * because most frames' last word occurs once. That deletes the recognition tier
 * to fix a minority of cards, so it was rejected.
 *
 * The fix that does work for those is a LESSON with its own choices:
 * wants-needs.gen.ts already blanks the whole opener (« Je voudrais » against
 * « J'ai besoin ») precisely because the subject travels with the verb. Making
 * `buildCards` prefer a slotted lesson's cards over the deck's gapped cloze is
 * the follow-up, and it is a change to supply mixing rather than to this rule.
 *
 * Plain .ts with no imports, so a check can execute it — a rule that lives in a
 * .tsx is unreachable from `node --experimental-strip-types`, which is the same
 * reason cloze.ts and axis.ts sit where they do.
 */

/**
 * Words that MUST contract before a vowel sound, so seeing one whole tells you
 * the next word begins with a consonant.
 *
 * The closed class of French elidable monosyllables. `si` is left out on
 * purpose — it elides before « il » only, which no gap in any deck produces.
 */
const ELIDABLE = new Set([
  "je", "me", "te", "se", "le", "la", "de", "ne", "que", "ce", "jusque", "lorsque", "puisque", "quoique",
]);

/** h aspiré — the words that begin with h and DO NOT allow elision. */
const H_ASPIRE = /^h(aricot|éros|ibou|omard|onte|ors|uit)\b/i;

/** Does this text begin with a vowel sound? */
export function startsWithVowelSound(s: string): boolean {
  const w = s.trimStart();
  if (!w) return false;
  if (H_ASPIRE.test(w)) return false;
  // œ and æ are vowels and « une douzaine d'œufs » is correct French — the
  // first version of this list omitted them and the check reported au-marche
  // as an offender, which is a fault in the rule, not in the lesson.
  return /^[aàâäeéèêëiîïoôöuùûüyœæh]/i.test(w);
}

/** The last whole word of a frame, lowercased; "" when it ends in an apostrophe. */
function tailWord(before: string): { word: string; elided: boolean } {
  const t = before.trimEnd();
  if (/['’]$/.test(t)) return { word: "", elided: true };
  const m = /([\p{L}'’-]+)$/u.exec(t);
  return { word: m ? m[1].toLowerCase() : "", elided: false };
}

/** The first whole word of a tail. */
function headWord(after: string): string {
  const m = /^([\p{L}'’-]+)/u.exec(after.trimStart());
  return m ? m[1].toLowerCase() : "";
}

/**
 * Is `candidate` well formed between `before` and `after`?
 *
 * Four joins, two on each side, and every one of them is the same rule read
 * forwards or backwards:
 *
 *   before ends elided (« J' »)      -> candidate must start with a vowel
 *   before ends elidable (« Je »)    -> candidate must NOT start with a vowel
 *   candidate ends elided (« d' »)   -> after must start with a vowel
 *   candidate ends elidable (« de ») -> after must NOT start with a vowel
 *
 * A frame that begins the sentence, or a tail that is bare punctuation, joins
 * nothing and is always allowed — the rule declines to have an opinion rather
 * than guessing one.
 */
export function fitsFrame(before: string, candidate: string, after: string): boolean {
  const cand = candidate.trim();
  if (!cand) return false;

  const left = tailWord(before);
  if (left.elided && !startsWithVowelSound(cand)) return false;
  if (!left.elided && ELIDABLE.has(left.word) && startsWithVowelSound(cand)) return false;

  const right = headWord(after);
  if (right) {
    const tail = tailWord(cand);
    if (tail.elided && !startsWithVowelSound(right)) return false;
    if (!tail.elided && ELIDABLE.has(tail.word) && startsWithVowelSound(right)) return false;
  }
  return true;
}

/**
 * The candidates that fit, answer first.
 *
 * The answer is kept whatever the rule says about it: the deck wrote that
 * sentence, so if the rule disagrees the rule is wrong, and a card must never
 * drop its own correct answer to satisfy a heuristic.
 */
export function fittingChoices(
  pool: readonly string[],
  answer: string,
  before: string,
  after: string,
): string[] {
  const out = [answer];
  for (const c of pool) {
    if (c === answer || out.includes(c)) continue;
    if (fitsFrame(before, c, after)) out.push(c);
  }
  return out;
}
