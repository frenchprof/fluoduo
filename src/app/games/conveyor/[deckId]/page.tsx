import BackLink from "@/components/BackLink";
import Lexicalator, { type LexEntry } from "@/games/lexicalator/Lexicalator";
import AuthGate from "@/components/AuthGate";
import { CURATED } from "@/content/collections";
import { bareWord } from "@/lib/collections/display";
import { isLexReady, lexBase } from "@/lib/collections/lexReady";

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
      <main className="min-h-screen p-6 text-[#4a3413]" style={{ background: "linear-gradient(180deg,#fff3d6,#ffe9bd)" }}>
        No deck <code>{deckId}</code>.
      </main>
    );
  }

  const shell = (body: React.ReactNode) => (
    <AuthGate what="play">
      <main className="min-h-screen" style={{ background: "linear-gradient(180deg,#eaf7ff 0%,#f6fbff 100%)" }}>
        <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 text-sm font-bold">
            <BackLink fallback="/" className="text-[#1cb0f6] hover:text-[#1899d6]">← Back</BackLink>
            <span className="text-[#075985]/60">🧰 Lexicalator</span>
          </div>
        </div>
        {body}
      </main>
    </AuthGate>
  );

  // Not yet hand-syllabified → the game isn't available for this deck (rather
  // than falling back to the retired ConveyorMatch).
  if (!isLexReady(collection)) {
    return shell(
      <div className="mx-auto max-w-md px-6 py-20 text-center text-[#075985]">
        <p className="text-4xl" aria-hidden>🧰</p>
        <h1 className="mt-3 text-xl font-black">Lexicalator is being prepared for “{collection.title}”.</h1>
        <p className="mt-2 text-sm text-[#075985]/80">This deck&rsquo;s words still need their syllables. Try another activity in the meantime.</p>
        <BackLink fallback="/" className="mt-5 inline-block rounded-2xl border-b-4 border-[#1899d6] bg-[#1cb0f6] px-4 py-2 font-black text-white">← Back</BackLink>
      </div>,
    );
  }

  const entries: LexEntry[] = collection.items.map((it) => ({
    id: it.id, fr: lexBase(it.fr), en: bareWord(it.en), syllables: it.syllables!,
  }));
  const decoys = collection.gameConfig?.lexicalator?.decoys ?? [];
  return shell(<Lexicalator title={collection.title} subtitle={collection.subtitle} entries={entries} decoys={decoys} />);
}
