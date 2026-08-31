/**
 * SLOTS — a question that knows its own parts, so a level can decide how much
 * of it to withdraw.
 *
 * THE PROBLEM THIS EXISTS FOR. `DiceQuestion.med` is
 * `{ before, choices, correct, after }`: **one** blank, and which blank it is
 * was decided by the generator when it built the string. Dan's own L08 ladder
 * needs two —
 *
 *     ★    subject + article + noun shown   ->  pick the VERB
 *     ★★   subject + BARE NOUN shown        ->  pick the VERB and the ARTICLE
 *     ★★★  nothing shown                    ->  type the whole sentence
 *
 * — so ★★ was not expressible at all, and `gap` could not isolate the le/du
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
 * Which keys a star level takes away, by default.
 *
 * ★   the first blankable slot — one decision, the rest scaffolded.
 * ★★  every blankable slot — Dan's "pick the verb AND the article", and the
 *     vocabulary ladder's "fill in the article".
 * ★★★ every blankable slot as well: at three stars the pager gives no bank and
 *     the learner types, so the difference is the absence of choices, not a
 *     different set of blanks.
 *
 * A lesson whose ladder does not fit this may pass its own keys to `cloze`.
 */
export function blankKeysFor(level: 1 | 2 | 3, slots: Slot[]): string[] {
  const keys = slots.filter(isBlankable).map((s) => s.key!);
  return level === 1 ? keys.slice(0, 1) : keys;
}
