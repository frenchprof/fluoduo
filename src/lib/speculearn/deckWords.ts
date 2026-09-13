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
  /** THE WHOLE SENTENCE THIS ITEM LIVES IN, when the deck authored one.
   *
   *  Dan, 2026-09-13: *"SpecuLearn, I am still hearing TTS for individual
   *  parts words WHEN I SHOULD BE HEARING FULL SENTENCES!"* — his rule from
   *  12 Sep, in his own words: *"never TTS just individual words when they
   *  can be TTS with another (e.g. a noun always with its article, or an
   *  entire sentence if that is what we are dealing with)"*.
   *
   *  The 12 Sep pass read that rule as being about the ARTICLE and recorded
   *  SpecuLearn as already correct — « le sport », never « sport ». That is
   *  true and it is not the whole rule. Measured over all nine playable decks:
   *  eight of them speak either a noun with its article or a complete
   *  utterance («  Écoutez ! », « Ça fait combien ? »), and TRANSPORT speaks a
   *  fragment on every single card —
   *
   *      says « en train »          example « J'y vais en train. »
   *      says « à pied »            example « J'y vais à pied. »
   *      says « prendre le métro »  example « Je prends le métro. »
   *
   *  — twelve of twelve, each with the sentence sitting in the deck, unused.
   *
   *  IT MUST BE A SENTENCE, AND `example` IS NOT ALWAYS ONE. Taking every
   *  `example` broke `colors`, whose examples are things that ARE the colour:
   *
   *      item « le rouge »   example « le feu rouge »     the traffic light
   *      item « le blanc »   example « le lait blanc »    the milk
   *
   *  A learner shown a red swatch must say « rouge ». Reading « le feu rouge »
   *  at them teaches a different word, so the test is terminal punctuation —
   *  a full stop, a question mark or an exclamation. « J'y vais en train. »
   *  passes, « le feu rouge » does not, and the colours keep their word.
   *
   *  NO CONTAINMENT TEST, THOUGH. It is tempting to also require the example
   *  to contain the word. That net would drop exactly the three verbs above:
   *  « prendre le métro » does not appear in « Je prends le métro. » because
   *  the sentence conjugates it — losing the items that need this most. */
  say?: string;
  tag: string | null;
  color: string;
  img?: string;
  emoji?: string;
  endonym?: string;
  s?: number;
};

/** What TTS reads for an item: its sentence when the deck wrote one, else the
 *  word with its article. ONE definition, because SpecuLearn speaks from seven
 *  call sites — the say-it prompt, the reveal, the 🔊 key and four replay
 *  buttons in the review — and a fix applied to six of them is the shape of
 *  bug this is. */
export function spokenFor(it: DeckItem): string {
  return it.say ?? it.w;
}

/** Is this example a whole utterance, or a noun phrase? Terminal punctuation
 *  is the whole test — see the `say` note above for why `colors` made it
 *  necessary. Trailing space tolerated; « … » and « ! » both count. */
function isSentence(s: string | undefined): s is string {
  return !!s && /[.!?…]$/.test(s.trim());
}

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
/** Does this French already carry its own article? — asked so the column's
 *  article is not pasted in front of one.
 *
 *  IT MISSED THE CONTRACTED FORMS, AND lieux-letris IS ENTIRELY CONTRACTED
 *  (found 2026-09-13, beside the TTS fault). That deck stores « au café »,
 *  « à la banque », « à l'hôpital » and sorts them into col:le / col:la
 *  columns — so the guard below did not fire and every one of its 23 items
 *  came out as **« le au café »**, « la à la banque », « l'à l'hôpital ».
 *  Not French, and printed on the card as the answer, not merely spoken.
 *
 *  `au`/`aux` are à + le/les and `du`/`des` are de + le/les, so a string
 *  opening with one already has its article inside it. `en` and a bare `à`
 *  are here for transport (« en train », « à pied »), which takes no article
 *  at all and was getting none only because its tags name no column. */
const HAS_ARTICLE = /^(le |la |les |l'|un |une |des |du |de la |de l'|au |aux |à la |à l'|à |en )/i;
function withArticle(fr: string, tags: string[] | undefined): string {
  if (HAS_ARTICLE.test(fr)) return fr;
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
        say: isSentence(it.example) ? it.example : undefined,
        ...tagFromArticle(w),
        emoji: img || endonym ? undefined : (it.emoji as string),
        img: endonym ? undefined : img,
        endonym,
      };
    });
  return { items, subtitle: deck?.title ?? collectionId };
}
