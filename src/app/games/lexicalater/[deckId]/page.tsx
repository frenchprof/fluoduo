import BackLink from "@/components/BackLink";
import Lexicalator, { type LexEntry } from "@/games/lexicalator/Lexicalator";
import AuthGate from "@/components/AuthGate";
import GameFrame from "@/components/GameFrame";
import { CURATED } from "@/content/collections";
import { displayFr } from "@/lib/collections/display";
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

  // Not yet hand-syllabified → the game isn't available for this deck (rather
  // than falling back to the retired ConveyorMatch). Same frame, empty board.
  if (!isLexReady(collection)) {
    return (
      <AuthGate what="play">
        <GameFrame title="🧰 LexicaLater" exitHref="/games/lexicalater" progress={null}>
          <div className="mx-auto max-w-md px-6 py-20 text-center text-[color:var(--cahier-ink)]">
            <p className="text-4xl" aria-hidden>🧰</p>
            <p className="mt-3 text-xl font-black">LexicaLater is being prepared for “{collection.title}”.</p>
            <BackLink fallback="/games/lexicalater" className="cahier-btn mt-5 inline-block">← Back</BackLink>
          </div>
        </GameFrame>
      </AuthGate>
    );
  }

  const entries: LexEntry[] = collection.items.map((it) => {
    // Bare fragments never speak alone (Dan, 2026-07-08: « sciences » must be
    // heard as « Les sciences ») — completion TTS says the article/prefix form.
    const say = displayFr(it, collection);
    return {
      // Keep the full en gloss, register marker and all (2026-08-02 bug
      // report): bareWord() used to strip "(m)"/"(f)" here, so gendered
      // sibling pairs (nageur/nageuse, chef/cheffe, acteur/actrice…) showed
      // an IDENTICAL chest label with nothing to tell them apart. The
      // sibling-morph mechanic (tapKey) forgives most mixups, but only when
      // the sibling is actually dealt — otherwise the tap reads as a plain
      // decoy and the miss is unexplained.
      id: it.id, fr: lexBase(it.fr), en: it.en, syllables: it.syllables!,
      say: say !== it.fr ? say : undefined,
    };
  });
  const decoys = collection.gameConfig?.lexicalator?.decoys ?? [];
  return (
    <AuthGate what="play">
      <Lexicalator title={collection.title} subtitle={collection.subtitle} entries={entries} decoys={decoys} deckId={collection.id} />
    </AuthGate>
  );
}
