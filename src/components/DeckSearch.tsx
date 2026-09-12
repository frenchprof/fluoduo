"use client";

/**
 * Front-facing word search (Dan, 2026-07-08: "wouldn't the search function be
 * better at a more central front facing location than hidden within the
 * Index"). Lives on the Home hero. Type any word — « bruine », « tonnerre »,
 * « aller » — and the decks that teach it drop down, each with the matched
 * words and a direct link to the deck's Lesson and Flip It.
 */
import Link from "next/link";
import { useRef, useState } from "react";
import { searchDecks, searchConj, type DeckHit } from "@/lib/search";
import { lessonsForDeck } from "@/content/lessons";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import { HOME_HREF } from "@/lib/routes";

const MAX_DECKS = 8;

function lessonHref(deckId: string): string {
  const lessons = lessonsForDeck(deckId);
  return lessons.length > 0 ? `/lessons/${lessons[0].slug}` : `/lessons/deck/${deckId}`;
}

export default function DeckSearch({
  className = "mt-4 max-w-md",
  autoFocus = false,
}: { className?: string; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const hits = q.trim() ? searchDecks(q) : [];
  const conj = q.trim() ? searchConj(q) : [];

  return (
    <div
      ref={boxRef}
      className={`relative ${className}`}
      // Keep the panel up while focus moves between the field and its links.
      onBlur={(e) => {
        if (!boxRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="🔍 Search a word — bruine, aller, café…"
        aria-label="Search a word"
        className="w-full rounded-full border-2 border-[color:var(--fluo-ink)] bg-white px-4 py-2 text-sm font-bold text-[color:var(--fluo-ink)] outline-none placeholder:font-normal focus:shadow-[3px_3px_0_rgba(0,0,0,0.18)]"
      />
      {open && q.trim() !== "" && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-80 overflow-y-auto rounded-2xl border-2 border-[color:var(--fluo-ink)] bg-white p-1.5 shadow-[4px_4px_0_rgba(0,0,0,0.18)]">
          {hits.length === 0 && conj.length === 0 && (
            <p className="px-3 py-2 text-sm font-bold text-[color:var(--fluo-ink)]/60">
              No results for « {q.trim()} »
            </p>
          )}
          {/* Verb forms (« viens », « veut ») live in ConjugaZone, not decks. */}
          {conj.slice(0, 3).map(({ verb, forms }) => (
            <div key={verb.id} className="rounded-xl px-3 py-2 transition hover:bg-[color:var(--fluo-hl)]/20">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="rounded-full bg-[color:var(--fluo-ink)] px-1.5 text-[10px] font-black text-white">🔤</span>
                <Link href="/conjugaison" lang="fr" className="font-black text-[color:var(--fluo-ink)] hover:underline">
                  {verb.inf}
                </Link>
                <span className="text-xs text-[color:var(--fluo-ink)]/75">{verb.en} — ConjugaZone</span>
              </div>
              {forms.length > 0 && (
                <p lang="fr" className="mt-0.5 text-xs font-bold text-[color:var(--fluo-ink)]/75">{forms.join(" · ")}</p>
              )}
            </div>
          ))}
          {hits.slice(0, MAX_DECKS).map(({ deck, words }: DeckHit) => (
            <div key={deck.id} className="rounded-xl px-3 py-2 transition hover:bg-[color:var(--fluo-hl)]/20">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  className="rounded-full px-1.5 text-[10px] font-black text-white"
                  style={{ background: UNIT_ACCENTS[deck.unit ?? 0] ?? "#5b8def" }}
                >
                  U{deck.unit ?? "?"}
                </span>
                <Link href={lessonHref(deck.id)} lang="fr" className="font-black text-[color:var(--fluo-ink)] hover:underline">
                  {deck.title}
                </Link>
                <span className="ml-auto flex gap-1.5 text-xs font-bold">
                  <Link href={lessonHref(deck.id)} className="hover:underline" title="Lesson">📚</Link>
                  <Link href={`/practice/flip-it/${deck.id}`} className="hover:underline" title="Flip It">🃏</Link>
                </span>
              </div>
              {words.length > 0 && (
                <p className="mt-0.5 text-xs text-[color:var(--fluo-ink)]/75">
                  {words.map((w, i) => (
                    <span key={w.id}>
                      {i > 0 && " · "}
                      <b lang="fr">{w.fr}</b> — {w.en}
                    </span>
                  ))}
                </p>
              )}
            </div>
          ))}
          {hits.length > MAX_DECKS && (
            <p className="px-3 py-1.5 text-xs font-bold text-[color:var(--fluo-ink)]/60">
              + {hits.length - MAX_DECKS} more decks — see the
              <Link href={HOME_HREF} className="underline">map</Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
