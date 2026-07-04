import Link from "next/link";
import MatchingGame from "@/games/matching/MatchingGame";
import { toMatchingSet } from "@/games/matching/toMatchingSet";
import { CURATED } from "@/content/collections";

// Source the deck from the unified collection layer instead of raw JSON.
// (Curated decks are bundled, so this stays a static server component — no async/auth.
//  When user-created Matching decks land, this becomes a client component calling
//  loadCollections(); the game + adapter are unchanged.)
const collection =
  CURATED.find((c) => c.id === "directions-matching") ??
  CURATED.find((c) => c.gameConfig?.matching);

export default function MatchingPage() {
  if (!collection) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-slate-300">
        No matching collection found.
      </main>
    );
  }
  const set = toMatchingSet(collection);
  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← FluoLingo
          </Link>
          <span className="text-slate-500">Matching</span>
        </div>
      </div>
      <MatchingGame set={set} />
    </main>
  );
}
