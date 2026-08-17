"use client";

/**
 * Deck viewer by query-param (Dan, 2026-07-05: creating a deck landed on
 * /decks/<firestore-id> which 404s — the static export only builds
 * /decks/[id] for bundled CURATED decks, so a brand-new user deck has no
 * HTML file). A query-param route needs no per-id file: one static page
 * (/decks/view.html) reads ?id and DeckContent loads it from Firestore at
 * runtime. Works for curated ids too, so all deck nav routes through here.
 */
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NoDeck from "../NoDeck";
import DeckContent from "../[id]/DeckContent";

function ViewInner() {
  const id = useSearchParams().get("id") ?? "";
  if (!id) return <NoDeck />;
  return <DeckContent id={id} />;
}

export default function DeckViewPage() {
  return (
    <Suspense fallback={<main className="p-6 text-[color:var(--fluo-ink-soft)]">Loading…</main>}>
      <ViewInner />
    </Suspense>
  );
}
