/**
 * SLOTS — a question that knows its own parts, so a level can decide how much
 * of it to withdraw.
 *
 * THE PROBLEM THIS EXISTS FOR. `DiceQuestion.med` is
 * `{ before, choices, correct, after }`: **one** blank, and which blank it is
 * was decided by the generator when it built the string. Dan's ladder needs
 * two —
 *
 *     Moyen      one piece withdrawn        ->  pick the VERB
 *     Difficile  two pieces withdrawn       ->  pick the VERB and the ARTICLE
 *     Bonus      nothing shown              ->  the whole sentence from English
 *
 * — so Difficile was not expressible at all, and `gap` could not isolate the le/du
 * contrast at the moment its support is withdrawn, which is the entire
 * grammatical point of that lesson. The same shape turned out to run the
 * vocabulary ladder too (Dan, 31 Aug: "★★ should be fill in the article and
 * ★★★ should be fill in both article and noun"), so this is one mechanism
 * across both tiers rather than a grammar-only fix.
 *
 * THE SHAPE. A question lists its sentence in order. A slot with a `key` can be
 * blanked; a slot without one is scaffolding the learner always sees. Nothing
 * here decides how many blanks a level takes — `blankKeysFor` proposes, the
 * lesson may override, and the pager renders.
 *
 * WHY `med` IS DERIVED AND NOT DELETED. 47 generators author `med` by hand and
 * every card builder reads it. `medFrom` reproduces that exact shape from the
 * slots, so a generator can move to slots without any consumer changing on the
 * same day. `verify55` asserts the derived value is identical to what the
 * generator used to hand-write.
 *
 * Loadable by `node --experimental-strip-types`, so it lives beside the
 * generators rather than in `src/lib` — `@/` aliases do not resolve under bare
 * node. Same reason `axis.ts` is here.
 */
import type { DiceQuestion } from "./types";

/**
 * One piece of the sentence, in reading order.
 *
 * `key` present -> blankable, and `choices` must be too: a blank a learner
 * cannot answer is a dead end, so the two travel together.
 */
export type Slot = {
  /** Stable name a level targets: "verb", "article", "noun". Omit for fixed text. */
  key?: string;
  /** The text as it appears in the finished sentence. */
  text: string;
  /** What to offer when this slot is blanked. Required wherever `key` is. */
  choices?: string[];
  /**
   * ★ takes THIS slot, even though it is not the leftmost.
   *
   * Reading order is usually withdrawal order — in « Tu aimes le sport » the
   * verb is both the first gap and the first thing to ask for. Colours break
   * that: the phrase is « le feu rouge », so the leftmost blankable slot is the
   * NOUN, while Dan's ladder (2026-08-31) is "★ just the colour word · ★★ the
   * colour word and the noun". Without this the one-star card would withdraw
   * the wrong half of the phrase and quietly teach the wrong lesson.
   *
   * Ignored above ★, where every blankable slot goes anyway. At most one slot
   * should set it; the first that does wins.
   */
  first?: boolean;
};

export type ClozeSegment =
  | { kind: "text"; text: string }
  | { kind: "blank"; key: string; answer: string; choices: string[] };

/** A slot the ladder may take away. */
export function isBlankable(s: Slot): boolean {
  return typeof s.key === "string" && Array.isArray(s.choices) && s.choices.length > 0;
}

/**
 * Join slots into the sentence a learner reads.
 *
 * The one rule is elision: French glues across an apostrophe — J'aime, l'art —
 * so a chunk following one that ends in an apostrophe takes no space. Getting
 * this wrong produces "J' aime le sport", which is why it is asserted rather
 * than trusted.
 */
export function sentence(slots: Slot[]): string {
  return slots.reduce((out, s) => {
    if (!out) return s.text;
    return /['’]$/.test(out) ? out + s.text : `${out} ${s.text}`;
  }, "");
}

/** The segments for a given set of blanked keys, in reading order. */
export function cloze(slots: Slot[], blankKeys: readonly string[]): ClozeSegment[] {
  const want = new Set(blankKeys);
  const out: ClozeSegment[] = [];
  for (const s of slots) {
    if (s.key && want.has(s.key)) {
      if (!isBlankable(s)) throw new Error(`slot "${s.key}" has no choices — it cannot be blanked`);
      out.push({ kind: "blank", key: s.key, answer: s.text, choices: [...s.choices!] });
      continue;
    }
    // Fixed text runs merge, so the renderer gets "Tu aimes" not "Tu" + "aimes".
    const prev = out[out.length - 1];
    if (prev?.kind === "text") prev.text = /['’]$/.test(prev.text) ? prev.text + s.text : `${prev.text} ${s.text}`;
    else out.push({ kind: "text", text: s.text });
  }
  return out;
}

/**
 * The legacy single-blank shape, derived.
 *
 * Only defined when exactly one slot is blanked — `med` cannot represent more,
 * which is the whole reason `slots` exists. Callers wanting two blanks use
 * `cloze`.
 */
export function medFrom(slots: Slot[], blankKey: string): DiceQuestion["med"] {
  const segs = cloze(slots, [blankKey]);
  const at = segs.findIndex((s) => s.kind === "blank");
  if (at < 0) throw new Error(`no slot keyed "${blankKey}"`);
  if (segs.filter((s) => s.kind === "blank").length !== 1) {
    throw new Error(`"${blankKey}" matches more than one slot — med holds one blank`);
  }
  const blank = segs[at] as Extract<ClozeSegment, { kind: "blank" }>;
  const before = at > 0 && segs[at - 1].kind === "text" ? (segs[at - 1] as { text: string }).text : "";
  const after = segs[at + 1]?.kind === "text" ? (segs[at + 1] as { text: string }).text : "";
  return { before, choices: blank.choices, correct: blank.answer, after };
}

/**
 * Which keys a level takes away, by default.
 *
 * Dan's classification (2026-08-31): "CompleteIt is supposed to [be]
 * Difficile if it involves two items, or Moyen if it involves one." So:
 *
 * Facile (1) ·   ONE slot — the one flagged `first`, or else the leftmost
 * Moyen (2)      blankable. `first` matters where reading order lies about
 *                the lesson: « le feu rouge » puts the NOUN leftmost, and
 *                the colours ladder blanks the COLOUR word (Peers, 31 Aug).
 * Difficile (3)  every blankable slot — TWO pieces missing (the earlier
 *                "★★ takes verb AND article" ruling moved up a tier with
 *                the rename; the mechanism is unchanged).
 * Bonus (4)      every slot too, though the Bonus ramp is translation and
 *                never asks for a cloze.
 *
 * A lesson whose ladder does not fit this may pass its own keys to `cloze`.
 * This exact merged shape is the hazard docs/HANDOFF_PEERS_31AUG.md names:
 * #97's four levels AND the `first` claim are both needed, and dropping
 * either looks fine in a diff while silently inverting the colours lesson.
 */
export function blankKeysFor(level: 1 | 2 | 3 | 4, slots: Slot[]): string[] {
  const blankable = slots.filter(isBlankable);
  const keys = blankable.map((s) => s.key!);
  if (level > 2) return keys;                  // Difficile/Bonus take every slot
  const lead = blankable.find((s) => s.first); // Facile/Moyen: a slot may claim ★
  return keys.length === 0 ? [] : [lead?.key ?? keys[0]];
}

/**
 * The card for a level, when — and only when — that level withdraws more than
 * one piece.
 *
 * `null` means "use the single-blank `med` path you have always used": either
 * the generator authored no slots (46 of 47 today) or the level takes one
 * blank, which `med` already represents exactly. So Facile/Moyen and every
 * unconverted lesson produce the card they produced yesterday, byte for byte,
 * and the two-blank path is reachable only where a generator opted in — a
 * Difficile run on a slotless lesson falls back to the one-blank card until
 * that generator is converted.
 *
 * It lives here rather than in the pager's `buildCards.tsx` for the reason
 * `axis.ts` and the generators do: `node --experimental-strip-types` cannot
 * load a .tsx, so logic that lives there is unreachable from a check — and a
 * ladder that silently blanks the wrong slot looks, in source, exactly like one
 * that does not.
 *
 * `answer` is the blanks joined by a space, which is how the learner's picks
 * are joined before grading, so both graders, the help ladder and the evidence
 * trail keep working without knowing the card has two blanks.
 */
export function multiBlankCard(
  q: Pick<DiceQuestion, "slots">,
  level: 1 | 2 | 3 | 4,
): { segments: ClozeSegment[]; answer: string } | null {
  if (!q.slots?.length) return null;
  const keys = blankKeysFor(level, q.slots);
  if (keys.length < 2) return null;
  const segments = cloze(q.slots, keys);
  const answers = segments.flatMap((s) => (s.kind === "blank" ? [s.answer] : []));
  return { segments, answer: answers.join(" ") };
}

/**
 * Does this context line hand the learner an answer the card is about to ask
 * for?
 *
 * FOUND BY OPENING THE CARD, NOT BY READING THE CODE. `aimer`'s `meta` is
 * "Tu adores … (love)" — perfectly correct for the single-blank card, where the
 * verb is shown and the article is the question. At ★★ the verb is one of the
 * blanks, so the same line prints the answer directly above the gap. It is the
 * fault verify35 and verify56 exist for, arriving through a door neither was
 * watching.
 *
 * Word-bounded on purpose, and not with `\b`: an accented French word is not
 * made of ASCII word characters, so `\baime\b` does not fire on "j'aime" the
 * way a reader expects. The delimiters are spelled out instead.
 */
export function metaLeaksAnswer(meta: string | undefined, answers: readonly string[]): boolean {
  if (!meta) return false;
  return answers.some((a) => {
    const esc = a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[\\s'’])${esc}([\\s.,!?]|$)`, "i").test(meta);
  });
}
