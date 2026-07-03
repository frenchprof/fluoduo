import Link from "next/link";
import ConveyorMatch, { type ConveyorPair } from "@/games/conveyor/ConveyorMatch";
import Lexicalator, { type LexEntry } from "@/games/lexicalator/Lexicalator";
import AuthGate from "@/components/AuthGate";
import { CURATED } from "@/content/collections";
import { bareWord } from "@/lib/collections/display";

export function generateStaticParams() {
  return CURATED.map((c) => ({ deckId: c.id }));
}

// Conveyor Match is the timed game for decks with NO sort-column axis (e.g.
// languages) — the sibling of Letris. Pairs are built straight from the
// collection: the French item rides the belt, its English gloss sits in the dock
// (FR↔EN keeps the match semantic, never FR↔FR).
export default async function ConveyorPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = await params;
  const collection = CURATED.find((c) => c.id === deckId);
  if (!collection) {
    return (
      <main className="min-h-screen p-6 text-[#4a3413]" style={{ background: "linear-gradient(180deg,#fff3d6,#ffe9bd)" }}>
        No deck <code>{deckId}</code>.
      </main>
    );
  }

  // The NEW Lexicalator (syllable key/keyhole game) takes over for any deck whose
  // words are fully hand-syllabified + signed off (item.syllables). Decks not yet
  // segmented keep the old Conveyor game, so nothing regresses mid-rollout.
  // The tile word drops a trailing "(e)" parenthetical (fatigué(e) → fatigué);
  // matching ignores internal spaces (multi-word tiles carry no space of their
  // own). So the segmentation is validated against this normalised key.
  const lexBase = (fr: string) => fr.replace(/\s*\([^)]*\)\s*$/, "").trim();
  const lexKey = (fr: string) => lexBase(fr).replace(/\s+/g, "");
  const lexReady = collection.items.length > 0 && collection.items.every(
    (it) => it.syllables && it.syllables.length > 0 && it.syllables.join("") === lexKey(it.fr),
  );
  if (lexReady) {
    const entries: LexEntry[] = collection.items.map((it) => ({
      id: it.id, fr: lexBase(it.fr), en: bareWord(it.en), syllables: it.syllables!,
    }));
    const decoys = collection.gameConfig?.lexicalator?.decoys ?? [];
    return (
      <AuthGate what="play">
        <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#eaf7ff 0%,#f6fbff 100%)" }}>
          <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm font-bold">
              <Link href="/" className="text-[#1cb0f6] hover:text-[#1899d6]">← FluoLingo</Link>
              <span className="text-[#075985]/60">🧰 Lexicalator</span>
            </div>
          </div>
          <Lexicalator title={collection.title} subtitle={collection.subtitle} entries={entries} decoys={decoys} />
        </main>
      </AuthGate>
    );
  }

  // Decks where FR↔EN is a giveaway (cognate-heavy, e.g. languages: anglais→English)
  // instead match the word's FIRST half ↔ SECOND half — a spelling rebuild. The
  // game splits the full word at a random point each spawn, so pass the whole word.
  const SPLIT_DECKS = new Set(["languages"]);
  const split = SPLIT_DECKS.has(collection.id);

  // bareWord: dock glosses must not leak answers ("chef (m)" → "chef"); the
  // dock de-dupes identical texts, so stripped twins share one dock tile.
  const pairs: ConveyorPair[] = collection.items
    .filter((it) => (split ? it.fr.length >= 4 : !!it.en))
    .map((it) => (split
      ? { id: it.id, card: it.fr, match: it.fr, speak: it.fr, greet: it.lang?.greeting } // card = full word; game splits it
      : { id: it.id, card: it.fr, match: bareWord(it.en), speak: it.fr }));

  const instruction = split
    ? "Tap a word's half on the belt, then its other half in the dock to rebuild it."
    : undefined;

  return (
    <AuthGate what="play">
      <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#fff3d6 0%,#ffe9bd 50%,#fff8e8 100%)" }}>
        <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm font-bold">
            <Link href="/" className="text-[#e8852e] hover:text-[#c96a15]">← FluoLingo</Link>
            <span className="text-[#4a3413]/60">⚙️ Lexicalator</span>
          </div>
        </div>
        <ConveyorMatch title={collection.title} subtitle={collection.subtitle} pairs={pairs} instruction={instruction} splitMode={split} />
      </main>
    </AuthGate>
  );
}
