/**
 * MATCHING PAIRS → LEXICALATER CHESTS.
 *
 * Dan, 8 Sep, on what to do with « Match It »: *"i accept 1, 2, and 3"* — and
 * option 2 was *"Into LexicaLater — its neighbour in Games stitches word parts
 * back together; this stitches phrase parts. One mechanic, two names."*
 *
 * It really is one mechanic. LexicaLater deals a chest whose lock is a row of
 * keyholes, and you forge the French from keys drifting on a belt. A matching
 * pair is that with two keyholes and phrases for keys:
 *
 *     chest   « You turn to the right »
 *     lock    [ Vous tournez ][ à droite ]
 *     belt    à gauche · Vous prenez · tout droit · Vous traversez · …
 *
 * The decoys come free and are the SAME decoys Match It used: every other left
 * and right in the deck is a key on the belt, and the wrong ones are wrong for
 * the reason the exercise is about (« Vous traversez à droite » is not French).
 *
 * A DECK SAYS WHICH ITEMS ARE WHICH with `role:left` / `role:right` tags, and
 * `gameConfig.matching.pairs` names the valid joins by item id. One left may
 * take several rights and one right several lefts — « Vous allez » and « Vous
 * continuez » both take « tout droit » — so a pair, not an item, is a chest.
 *
 * WHY `fixed` MATTERS HERE. LexicaLater re-cuts a chest for the level: whole
 * word at 1, syllables at 2–3, random spelling chunks at 4+. A phrase chest is
 * not a word broken up, it is two pieces that make a sentence, and re-cutting
 * it either hands over the whole answer or shatters it across the joint. These
 * entries carry `fixed`, and gearEntry leaves them exactly as authored.
 */
import type { Collection, Item } from "./schema";

export type PairChest = {
  id: string;
  fr: string;
  en: string;
  syllables: string[];
  say?: string;
  fixed: true;
};

const byId = (c: Collection) => new Map(c.items.map((it) => [it.id, it] as const));

/** Does this deck author matching pairs at all? */
export function hasPairs(c: Collection | undefined): boolean {
  return !!c?.gameConfig?.matching?.pairs?.length;
}

/**
 * One chest per authored pair. A pair whose ids are not both in the deck is
 * skipped rather than thrown: a deck is content, and a typo in an id should
 * cost that one chest, not the whole game.
 */
export function pairChests(c: Collection): PairChest[] {
  const pairs = c.gameConfig?.matching?.pairs ?? [];
  const items = byId(c);
  const out: PairChest[] = [];
  for (const p of pairs) {
    const left = items.get(p.leftId);
    const right = items.get(p.rightId);
    if (!left || !right) continue;
    const l = left.fr.trim();
    const r = right.fr.trim();
    out.push({
      id: `${p.leftId}+${p.rightId}`,
      // The sentence as it is spoken and shown. The right half is lower-cased
      // where it starts a word — it is a continuation, never a new sentence —
      // but « Xᵉ » and any other capital inside it is left alone.
      fr: `${l} ${r.charAt(0).toLowerCase()}${r.slice(1)}`,
      en: `${left.en} ${right.en}`,
      syllables: [l, r],
      fixed: true,
    });
  }
  return out;
}

/**
 * The belt's extra keys: every left and right the deck has, so a learner meets
 * the wrong halves as well as the right ones. LexicaLater already puts the
 * chests' own keys on the belt; these are what make a choice a choice.
 */
export function pairDecoys(c: Collection): string[] {
  const roled = (role: string) => c.items.filter((it: Item) => (it.tags ?? []).includes(role));
  return [...roled("role:left"), ...roled("role:right")].map((it) => it.fr.trim());
}
