import BackLink from "@/components/BackLink";
import ChestArt, { CHEST_GOLD } from "@/components/ChestArt";
import Lexicalator, { type LexEntry } from "@/games/lexicalator/Lexicalator";
import AuthGate from "@/components/AuthGate";
import GameLanding from "@/components/GameLanding";
import GameFrame from "@/components/GameFrame";
import { CURATED } from "@/content/collections";
import { displayFr, prefixTokens } from "@/lib/collections/display";
import { isLexReady, lexBase, lexReadyItems } from "@/lib/collections/lexReady";
import { hasPairs, pairChests, pairDecoys } from "@/lib/collections/pairChests";

export function generateStaticParams() {
  return CURATED.map((c) => ({ deckId: c.id }));
}

// The Lexicalator (syllable key/keyhole game). There is no old-game fallback:
// a deck that isn't hand-syllabified simply doesn't run the game (its ⚙️ chip is
// hidden too) — Dan, 2026-07-03: "delete the old skin so we don't ever see it
// again."
export default async function ConveyorPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const collection = CURATED.find((c) => c.id === deckId);
  if (!collection) {
    return (
      <GameFrame title={<><ChestArt tint={CHEST_GOLD} className="inline-block h-[1.15em] w-auto align-[-0.24em]" /> LexicaLocker</>} exitHref="/games/lexicalater" progress={null}>
        <p className="p-6 text-[color:var(--cahier-ink-soft)]">No deck <code>{deckId}</code>.</p>
      </GameFrame>
    );
  }

  // Not yet hand-syllabified → the game isn't available for this deck (rather
  // than falling back to the retired ConveyorMatch). Same frame, empty board.
  if (!isLexReady(collection) && !hasPairs(collection)) {
    return (
      <AuthGate what="play">
        <GameFrame title={<><ChestArt tint={CHEST_GOLD} className="inline-block h-[1.15em] w-auto align-[-0.24em]" /> LexicaLocker</>} exitHref="/games/lexicalater" progress={null}>
          <div className="mx-auto max-w-md px-6 py-20 text-center text-[color:var(--cahier-ink)]">
            <ChestArt tint={CHEST_GOLD} className="mx-auto block w-[3.25rem]" />
            <p className="mt-3 text-xl font-black">LexicaLocker is being prepared for “{collection.title}”.</p>
            <BackLink fallback="/games/lexicalater" className="cahier-btn mt-5 inline-block">← Back</BackLink>
          </div>
        </GameFrame>
      </AuthGate>
    );
  }

  // Only the syllabified subset plays — a deck can be lexReady with some
  // items still unsegmented (Dan, 2026-08-02: Commerces' dialogue sentences
  // aren't syllabified and never will be; the vocabulary items are).
  const entries: LexEntry[] = lexReadyItems(collection).map((it) => {
    // The article/prefix is part of what's LEARNED, not just spoken (Dan,
    // 2026-08-02: "the article must be around to be learned with the noun";
    // "if it says il est nageur we should also read the same"). A bare
    // fragment used to build the tiles and the trésor chip while completion
    // TTS quietly spoke the fuller displayFr() form — a chest could say
    // « Il est nageur » for a trésor chip that only ever showed « nageur ».
    // Now the prefix's own words (il/est, un, à/la, ce…) become their own
    // keyholes ahead of the word's hand-authored syllables, so what's built,
    // shown, and spoken are the same sentence.
    const prefix = prefixTokens(it, collection);
    const wordBase = lexBase(it.fr);
    const prefixStr = prefix.join(" ");
    // Elided prefixes ("l'", "à l'", "de l'") glue straight onto the word —
    // "l'école", never "l' école".
    const phrase = prefixStr ? prefixStr + (/['’]$/.test(prefixStr) ? "" : " ") + wordBase : wordBase;
    return {
      // Keep the full en gloss, register marker and all (2026-08-02 bug
      // report): bareWord() used to strip "(m)"/"(f)" here, so gendered
      // sibling pairs (nageur/nageuse, chef/cheffe, acteur/actrice…) showed
      // an IDENTICAL chest label with nothing to tell them apart. The
      // sibling-morph mechanic (tapKey) forgives most mixups, but only when
      // the sibling is actually dealt — otherwise the tap reads as a plain
      // decoy and the miss is unexplained.
      id: it.id, fr: phrase, en: it.en, syllables: [...prefix, ...it.syllables!],
      say: displayFr(it, collection),
    };
  });
  // PHRASE CHESTS (8 Sep). A deck that authors matching pairs — « Vous
  // tournez » + « à droite » — deals them as two-keyhole chests alongside its
  // word chests. It is the same mechanic Match It ran on its own page, in the
  // game that already stitches parts back together, with a tile, a gallery and
  // a spacing ladder it does not have to grow for itself.
  //
  // ON A PAIRS DECK THE PHRASES ARE THE WHOLE GAME. The first build dealt them
  // ALONGSIDE the deck's word chests and the lane came out muddled: « arrivé »
  // arrived as a one-keyhole chest of its own, next to « You exit / leave from
  // the metro station » with two — and the belt carried whole sentences
  // (« Vous traversez le passage piéton ») beside the halves they are made of.
  // On a deck like this the halves' job is to be KEYS, not chests; a chest for
  // a bare half teaches nothing the sentence does not.
  const phrases = hasPairs(collection) ? pairChests(collection) : [];
  const decoys = phrases.length
    ? pairDecoys(collection)
    : (collection.gameConfig?.lexicalator?.decoys ?? []);
  return (
    <AuthGate what="play">
      {/* The game sits IN a page (Dan, 7 Sep: "can we have them embedded like
          the map, (with option to go full screen)") — the band names the
          activity above the board, and ⛶ on the game bar takes it full. */}
      <GameLanding activityKey="lexicalator" bleed>
        <Lexicalator title={collection.title} subtitle={collection.subtitle} entries={phrases.length ? phrases : entries} decoys={decoys} deckId={collection.id} />
      </GameLanding>
    </AuthGate>
  );
}
