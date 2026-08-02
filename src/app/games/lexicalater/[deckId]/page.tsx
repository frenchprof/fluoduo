import BackLink from "@/components/BackLink";
import HelpDot from "@/components/HelpDot";
import Lexicalator, { type LexEntry } from "@/games/lexicalator/Lexicalator";
import AuthGate from "@/components/AuthGate";
import { CURATED } from "@/content/collections";
import { displayFr, prefixTokens } from "@/lib/collections/display";
import { isLexReady, lexBase, lexReadyItems } from "@/lib/collections/lexReady";

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
            <span className="flex items-center gap-2 text-[#075985]/60">🧰 LexicaLater <HelpDot /></span>
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
        <h1 className="mt-3 text-xl font-black">LexicaLater is being prepared for “{collection.title}”.</h1>
        <p className="mt-2 text-sm text-[#075985]/80">This deck&rsquo;s words still need their syllables. Try another activity in the meantime.</p>
        <BackLink fallback="/" className="mt-5 inline-block rounded-2xl border-b-4 border-[#1899d6] bg-[#1cb0f6] px-4 py-2 font-black text-white">← Back</BackLink>
      </div>,
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
  const decoys = collection.gameConfig?.lexicalator?.decoys ?? [];
  return shell(<Lexicalator title={collection.title} subtitle={collection.subtitle} entries={entries} decoys={decoys} />);
}
