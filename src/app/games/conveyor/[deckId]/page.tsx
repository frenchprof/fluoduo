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
      <main className="min-h-screen bg-slate-950 p-6 text-slate-300">
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
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">← FluoLingo</Link>
          <span className="text-slate-500">Match It</span>
        </div>
      </div>
      <ConveyorMatch title={collection.title} subtitle={collection.subtitle} pairs={pairs} instruction={instruction} splitMode={split} />
    </main>
  );
}
