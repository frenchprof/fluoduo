"use client";

/** Deck MCQ by query-param — see /decks/view for why (static export has no
 *  HTML file for user-deck ids). Reads ?id and renders the auto-MCQ. */
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import NoDeck from "../NoDeck";
import Content from "../[id]/mcq/Content";

function McqInner() {
  const id = useSearchParams().get("id") ?? "";
  if (!id) return <NoDeck />;
  return <Content id={id} />;
}

export default function DeckMcqPage() {
  return (
    <Suspense fallback={<main className="p-6 text-[color:var(--fluo-ink-soft)]">Loading…</main>}>
      <McqInner />
    </Suspense>
  );
}
