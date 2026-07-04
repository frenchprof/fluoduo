"use client";

/**
 * The Practice Index — ONE page answering "where is every activity?" for all
 * activity types at once (Dan, 2026-07-04: an index per activity type would be
 * eight galleries; a deck × activity matrix is one). Rows = decks grouped by
 * Unité; columns = activities; every filled cell is a direct link.
 */
import Link from "next/link";
import CahierShell, { hasDicePractice, UNIT_PAGES } from "@/components/CahierShell";
import { CURATED } from "@/content/collections";
import { lessonsForDeck } from "@/content/lessons";
import { isLexReadyId } from "@/lib/collections/lexReady";
import { isConjugaZoneReadyId } from "@/lib/collections/conjugaZoneReady";
import { isGramMarathonReadyId } from "@/lib/collections/gramMarathonReady";
import { getLetrisSet } from "@/games/letris/sets";
import type { Collection } from "@/lib/collections/schema";

type Cell = { emoji: string; title: string; href: string | null };

function cellsFor(c: Collection): Cell[] {
  const lessons = lessonsForDeck(c.id);
  return [
    { emoji: "📚", title: "Lesson", href: lessons.length ? `/lessons/${lessons[0].slug}` : null },
    { emoji: "🃏", title: "Flip It", href: `/practice/flip-it/${c.id}` },
    { emoji: "🎤", title: "Say It", href: `/practice/say-it/${c.id}` },
    { emoji: "✏️", title: "Complete It", href: `/practice/complete-it/${c.id}` },
    { emoji: "🎲", title: "Practice", href: hasDicePractice(c.id) ? `/practice/dice/${c.id}` : null },
    { emoji: "🎯", title: "ConjugaZone", href: isConjugaZoneReadyId(c.id) ? `/practice/conjugazone/${c.id}` : null },
    { emoji: "🏃", title: "GramMarathon", href: isGramMarathonReadyId(c.id) ? `/practice/grammarathon/${c.id}` : null },
    { emoji: "🌧️", title: "Vocabularain", href: getLetrisSet(c.id.replace("-letris", "")) ? `/games/letris/${c.id.replace("-letris", "")}` : null },
    { emoji: "🧰", title: "Lexicalator", href: isLexReadyId(c.id) ? `/games/conveyor/${c.id}` : null },
    { emoji: UNIT_PAGES[c.id]?.emoji ?? "🎪", title: UNIT_PAGES[c.id]?.label ?? "Unit", href: UNIT_PAGES[c.id]?.href ?? null },
  ];
}

const HEAD = ["📚", "🃏", "🎤", "✏️", "🎲", "🎯", "🏃", "🌧️", "🧰", "🎪"];
const HEAD_TITLES = ["Lesson", "Flip It", "Say It", "Complete It", "Practice", "ConjugaZone", "GramMarathon", "Vocabularain", "Lexicalator", "Unit"];

export default function ActivitiesIndexPage() {
  const units = [0, 1, 2, 3, 4];
  return (
    <CahierShell
      tabs={[
        { key: "home", label: "Accueil", emoji: "🏠", href: "/" },
        { key: "index", label: "Index", emoji: "🗂️" },
      ]}
      active="index"
      crumb="🗂️ Practice Index"
    >
      <div className="mx-auto max-w-4xl px-2 py-4">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">🗂️ Practice Index</h1>
        <p className="mt-1 mb-4 text-sm text-[color:var(--cahier-ink-soft)]">Every deck × every activity — tap any cell.</p>
        {units.map((u) => {
          const decks = CURATED.filter((c) => c.unit === u);
          if (decks.length === 0) return null;
          return (
            <section key={u} className="mb-6">
              <h2 className="cahier-section mb-2 rounded-md px-3 py-1.5">Unité {u}</h2>
              <div className="overflow-x-auto rounded-xl border-2 border-[color:var(--cahier-ink)]/15 bg-white">
                <table className="w-full text-left text-sm" style={{ minWidth: 560 }}>
                  <thead>
                    <tr className="border-b-2 border-[color:var(--cahier-rule)]">
                      <th className="px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">Deck</th>
                      {HEAD.map((h, i) => (
                        <th key={h} title={HEAD_TITLES[i]} className="px-1.5 py-2 text-center text-base" aria-label={HEAD_TITLES[i]}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {decks.map((c) => (
                      <tr key={c.id} className="border-t border-[color:var(--cahier-rule)]">
                        <td lang="fr" className="max-w-[14rem] truncate px-3 py-1.5 font-bold text-[color:var(--cahier-ink)]">{c.title}</td>
                        {cellsFor(c).map((cell, i) => (
                          <td key={i} className="px-1.5 py-1.5 text-center">
                            {cell.href ? (
                              <Link href={cell.href} title={`${cell.title} — ${c.title}`} aria-label={`${cell.title} — ${c.title}`}
                                className="inline-block rounded-md px-1 text-base transition hover:scale-125 hover:bg-[color:var(--cahier-hl)]/30">
                                {cell.emoji}
                              </Link>
                            ) : (
                              <span className="text-[color:var(--cahier-ink-soft)]/40" aria-hidden>·</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </CahierShell>
  );
}
