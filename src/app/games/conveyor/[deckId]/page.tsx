import Link from "next/link";
import ConveyorMatch, { type ConveyorPair } from "@/games/conveyor/ConveyorMatch";
import { CURATED } from "@/content/collections";

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

  // Decks where FR↔EN is a giveaway (cognate-heavy, e.g. languages: anglais→English)
  // instead match the word's FIRST half ↔ SECOND half — a spelling rebuild. The
  // game splits the full word at a random point each spawn, so pass the whole word.
  const SPLIT_DECKS = new Set(["languages"]);
  const split = SPLIT_DECKS.has(collection.id);

  const pairs: ConveyorPair[] = collection.items
    .filter((it) => (split ? it.fr.length >= 4 : !!it.en))
    .map((it) => (split
      ? { id: it.id, card: it.fr, match: it.fr, speak: it.fr, greet: it.lang?.greeting } // card = full word; game splits it
      : { id: it.id, card: it.fr, match: it.en, speak: it.fr }));

  const instruction = split
    ? "Tap a word's half on the belt, then its other half in the dock to rebuild it."
    : undefined;

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#fff3d6 0%,#ffe9bd 50%,#fff8e8 100%)" }}>
      <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm font-bold">
          <Link href="/" className="text-[#e8852e] hover:text-[#c96a15]">← FluoLingo</Link>
          <span className="text-[#4a3413]/60">⚙️ Lexicalator</span>
        </div>
      </div>
      <ConveyorMatch title={collection.title} subtitle={collection.subtitle} pairs={pairs} instruction={instruction} splitMode={split} />
    </main>
  );
}
