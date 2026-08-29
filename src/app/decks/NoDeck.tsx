"use client";

/**
 * The empty state for the query-param deck routes (/decks/view, /study,
 * /mcq) when `?id=` is missing. Used to be the bare string "No deck
 * specified." on a blank page — a dead end with no way out. Now: what
 * happened, and the one road that helps (the Index lists every deck).
 */
import Link from "next/link";
import CahierShell from "@/components/CahierShell";

export default function NoDeck() {
  return (
    <CahierShell tabs={[{ key: "home", label: "Home", emoji: "🏠", href: "/" }, { key: "map", label: "Carte", emoji: "🗺️", href: "/map" }]} active="index">
      <div className="mx-auto max-w-md px-4 py-10 text-center">
        <div className="rounded-2xl border-2 p-8" style={{ borderColor: "var(--cahier-line)", background: "var(--cahier-paper-raised)" }}>
          <div className="text-5xl" aria-hidden>🗂️</div>
          <h1 className="fluo-serif mt-3 text-xl font-black text-[color:var(--cahier-ink)]">No deck selected</h1>
          <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">This link is missing its deck. Pick one from the Index.</p>
          <Link href="/map" className="fluo-btn mt-5 inline-flex">🗺️ Open the map</Link>
        </div>
      </div>
    </CahierShell>
  );
}
