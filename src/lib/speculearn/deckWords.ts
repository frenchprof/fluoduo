/**
 * THE DECK'S OWN WORDS — extracted so more than one runner can ask for them.
 *
 * This was `buildItems` inside SpecuLearnContent, a client component, which is
 * why nothing else could reach it. The merged SpecuLearn (Dan, 2026-09-07:
 * *"they CAN be and MUST NOW BE MERGED AS ONE!"*) needs exactly this list to
 * turn a deck into pooled MCQs, and a page shell is the wrong place to import
 * it from — the same reason `pretestHrefForDeck` moved out of CahierShell on
 * 7 Sep.
 *
 * Nothing about the policy changed in the move: aliments still comes from its
 * photo set, every other deck is filtered by `specuLearnColumns` (one deck,
 * one category) and must carry a visual that is either its own emoji or a
 * purpose-made SVG — never neither.
 */
import { CURATED } from "@/content/collections";
import PHOTO_ITEMS from "@/content/devine-aliments.json";
import {
  BUILDING_EMOJI,
  SPECULEARN_EXCLUDED_ITEMS,
  SPECULEARN_ITEM_IMAGES,
  SPECULEARN_ENDONYMS,
  specuLearnColumns,
} from "@/lib/collections/speculearnReady";

/** One playable word: what to say, and the picture that cues it. */
export type DeckItem = {
  w: string;
  tag: string | null;
  color: string;
  img?: string;
  emoji?: string;
  endonym?: string;
  s?: number;
};

const MASC = "#0b63c4";
const FEM = "#e0567f";
const INK = "var(--cahier-ink)";

export function tagFromArticle(w: string): { tag: string | null; color: string } {
  const lw = w.toLowerCase();
  if (/^(les|des) /.test(lw)) return { tag: "pluriel", color: INK };
  if (/^(le|un) /.test(lw)) return { tag: "masculin", color: MASC };
  if (/^(la|une) /.test(lw)) return { tag: "féminin", color: FEM };
  return { tag: null, color: INK };
}

/** The article an item's letris column tag encodes (Dan, 2026-07-14: "ALL
 *  articles in such exercises are inseparable from the nouns") — countries
 *  and lieux store bare nouns and sort them into article columns. */
const COL_ARTICLE: Record<string, string> = {
  "col:le": "le ", "col:la": "la ", "col:l_apos": "l'", "col:les": "les ",
  "col:un": "un ", "col:une": "une ", "col:des": "des ",
};
function withArticle(fr: string, tags: string[] | undefined): string {
  if (/^(le |la |les |l'|un |une |des |du )/i.test(fr)) return fr;
  const col = (tags ?? []).find((t) => t in COL_ARTICLE);
  return col ? COL_ARTICLE[col] + fr : fr;
}

export function buildItems(collectionId: string): { items: DeckItem[]; subtitle: string } {
  if (collectionId === "aliments") {
    const items = (PHOTO_ITEMS as { w: string; g: "m" | "f"; n: 0 | 1; s: 1 | 2; img: string }[]).map((it) => ({
      w: it.w,
      tag: (it.n ? "pluriel · " : "") + (it.g === "m" ? "masculin" : "féminin"),
      color: it.g === "m" ? MASC : FEM,
      img: it.img,
      s: it.s,
    }));
    return { items, subtitle: "Les aliments" };
  }
  const deck = CURATED.find((c) => c.id === collectionId);
  // ONE DECK, ONE CATEGORY (see specuLearnColumns). commerces mixes shop
  // nouns with whole utterances and a bag of article-less words; playing
  // them together produced cards with no answer at all.
  const cols = specuLearnColumns(collectionId);
  const items = (deck?.items ?? [])
    .filter(
      (it) =>
        it.fr &&
        !SPECULEARN_EXCLUDED_ITEMS.has(it.id) &&
        (!cols || (it.tags ?? []).some((t) => cols.includes(t))) &&
        // A visual comes from EITHER the item's emoji (banned when it's a
        // building look-alike, see BUILDING_EMOJI) OR a purpose-made SVG
        // keyed by item id (SPECULEARN_ITEM_IMAGES) — never neither.
        ((it.emoji && !BUILDING_EMOJI.has(it.emoji)) || SPECULEARN_ITEM_IMAGES[it.id]),
    )
    .map((it) => {
      const w = withArticle(it.fr, it.tags);
      const img = SPECULEARN_ITEM_IMAGES[it.id];
      // A language's picture is its own name (see SPECULEARN_ENDONYMS) — 中文,
      // Русский — not the flag of one country that speaks it.
      const endonym = SPECULEARN_ENDONYMS[it.id];
      return {
        w,
        ...tagFromArticle(w),
        emoji: img || endonym ? undefined : (it.emoji as string),
        img: endonym ? undefined : img,
        endonym,
      };
    });
  return { items, subtitle: deck?.title ?? collectionId };
}
