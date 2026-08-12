"use client";

/**
 * The Practice Index — ONE page answering "where is every activity?" for all
 * activity types at once (Dan, 2026-07-04: an index per activity type would be
 * eight galleries; a deck × activity matrix is one). Rows = decks grouped by
 * Unité; columns = activities; every filled cell is a direct link.
 *
 * Color (Dan, 2026-07-05: "it looks pretty bland"): each Unité section wears
 * its own hue (banner + table frame + tinted header row), and the activity
 * columns wear the same colors their tiles have on the Guide page. The cell
 * grid itself stays calm — the color frames the matrix, it doesn't fill it.
 */
import Link from "next/link";
import { useState } from "react";
import CahierShell, { withActive, pretestHrefForDeck } from "@/components/CahierShell";
import MyDecks from "@/app/MyDecks";
import { composeBankForDeck } from "@/games/compose/banks";
import { siteTabs } from "@/components/siteTabs";
import { CURATED } from "@/content/collections";
import { SIOS, UNIT_META } from "@/content/sios";
import { lessonsForDeck } from "@/content/lessons";
import { isLexReadyId } from "@/lib/collections/lexReady";
import { isSpecuLearnReady } from "@/lib/collections/speculearnReady";
import { getLetrisSet } from "@/games/letris/sets";
import { searchDecks } from "@/lib/search";
import { shortTitle } from "@/lib/shortTitles";
import type { Collection } from "@/lib/collections/schema";
import { isPlayableGap } from "@/lib/collections/gapSentence";

type Cell = { emoji: string; title: string; href: string | null };

/** The deck's stop on the course path — the same number the learner just
 *  tapped on Home. `Sio.num` already existed; nothing rendered it here. */
function stopNum(collectionId: string): number | null {
  return SIOS.find((s) => s.collectionId === collectionId)?.num ?? null;
}

function cellsFor(c: Collection): Cell[] {
  const lessons = lessonsForDeck(c.id);
  return [
    // Canonical app order (Dan, 2026-07-19): SpecuLearn-PreTest → Lesson +
    // Flip-It → VocabulaRain → LexicaLater → Composer — WorDrill (né Say It)
    // trails. The Lesson runs Lire → Pratique (★ Facile → ★★ Intermédiaire →
    // ★★★ Difficile → ⭐ Bonus) → Générateur; Complete It has no flap of its
    // own, it's Pratique's ★★ Intermédiaire on a gapless deck. GramMarathon
    // was NOT absorbed — it kept its own flap, gated to gap-authored decks.
    { emoji: "🧪", title: "Pre-Test", href: pretestHrefForDeck(c.id) },
    { emoji: "🔮", title: "SpecuLearn", href: isSpecuLearnReady(c.id) ? `/practice/speculearn/${c.id}` : null },
    { emoji: "📚", title: "Lesson", href: lessons.length ? `/lessons/${lessons[0].slug}` : `/lessons/deck/${c.id}` },
    { emoji: "🃏", title: "Flip It", href: `/practice/flip-it/${c.id}` },
    { emoji: "🌧️", title: "VocabulaRain", href: getLetrisSet(c.id.replace("-letris", "")) ? `/games/vocabularain/${c.id.replace("-letris", "")}` : null },
    { emoji: "🧰", title: "LexicaLater", href: isLexReadyId(c.id) ? `/games/lexicalater/${c.id}` : null },
    { emoji: "🧩", title: "Compose It", href: composeBankForDeck(c.id) ? `/games/compose/${composeBankForDeck(c.id)!.id}` : null },
    { emoji: "🏃", title: "GramMarathon", href: c.items?.some(isPlayableGap) ? `/practice/grammarathon/${c.id}` : null },
    { emoji: "🎙️", title: "WorDrill", href: `/practice/say-it/${c.id}` },
  ];
}

// 🏃 GramMarathon was missing here while cellsFor() emitted it — nine
// cells under eight headings, so every row sat one column left of its
// label and WorDrill fell into a tenth, header-less column.
const HEAD = ["🧪", "🔮", "📚", "🃏", "🌧️", "🧰", "🧩", "🏃", "🎙️"];
const HEAD_TITLES = ["Pre-Test", "SpecuLearn", "xPlain", "4Mémoire", "VocabulaRain", "LexicaLater", "ComposeIt", "GramMarathon", "WorDrill"];
/** Column chip colors — the same hue each activity's tile wears on the Guide
 *  page (Pre-Test gets the highlighter yellow). */
const HEAD_CHIPS: { bg: string; border: string }[] = [
  { bg: "var(--cahier-hl, #eaff00)", border: "#2a2e6e" },
  { bg: "#ece2fa", border: "#8a5fd4" },
  { bg: "#fbe3ec", border: "#e0567f" },
  { bg: "#def3f5", border: "#2bb6c2" },
  { bg: "#ece2fa", border: "#8a5fd4" },
  { bg: "#fbe6cf", border: "#e8852e" },
  { bg: "#ecf7cf", border: "#7bbf2e" },
  { bg: "#dbe7fb", border: "#3b6fd4" },
  { bg: "#fbeec4", border: "#e3a700" },
];

export default function ActivitiesIndexPage() {
  const units = [0, 1, 2, 3, 4];
  const [q, setQ] = useState("");
  // Word-level search (Dan, 2026-07-08): matches every item inside every deck
  // (« bruine » finds the weather deck), not just deck titles — shared with
  // the Home search box via lib/search.
  const hitMap = new Map(q.trim() ? searchDecks(q).map((h) => [h.deck.id, h]) : []);
  const matches = (c: Collection) => !q.trim() || hitMap.has(c.id);
  const totalHits = CURATED.filter(matches).length;
  return (
    <CahierShell tabs={withActive(siteTabs(), "index")} active="index">
      <div className="mx-auto max-w-4xl px-2 pb-4 pt-2">
        {/* ONE row on every width (Dan, 2026-07-20: on phones the search sat
            under the heading — vertical space lost). The input flexes into
            whatever the heading leaves free. */}
        <div className="flex flex-nowrap items-center gap-3">
          <h1 className="cahier-display shrink-0 text-2xl font-black text-[color:var(--cahier-ink)]">📖 Index</h1>
          {/* Search at the header's height, high-contrast (Dan, 2026-07-13). */}
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔍 bruine, aller…"
            aria-label="Search words and decks"
            className="w-full min-w-0 max-w-xs flex-1 rounded-full border-[3px] border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]/40 px-4 py-2 text-sm font-black text-[color:var(--cahier-ink)] shadow-[3px_3px_0_var(--cahier-ink)] outline-none placeholder:font-bold placeholder:text-[color:var(--cahier-ink)]/60 focus:bg-white"
          />
        </div>
        {/* No WorDrill banner here (Dan, 2026-07-16) — its flap is the door. */}
        <p className="mb-2 mt-1 text-sm text-[color:var(--cahier-ink-soft)]">Every deck × every activity — tap any cell.</p>
        {totalHits === 0 && (
          <p className="mb-4 text-sm font-bold text-[color:var(--cahier-ink-soft)]">No results for « {q} »</p>
        )}
        {units.map((u) => {
          const decks = CURATED.filter((c) => c.unit === u).filter(matches)
            .slice()
            .sort((a, b) => (stopNum(a.id) ?? 999) - (stopNum(b.id) ?? 999));
          if (decks.length === 0) return null;
          const meta = UNIT_META[u] ?? { label: `Unité ${u}`, subtitle: "", emoji: "📚" };
          return (
            <details key={u} className={`fluo-h-${u % 6} group mb-6`} open={q.trim() ? true : undefined}>
              <summary className="mb-2 flex cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-2 [&::-webkit-details-marker]:hidden" style={{ background: "var(--fluo-card-accent)" }}>
                <span aria-hidden className="text-white transition-transform group-open:rotate-90">▸</span>
                <span aria-hidden>{meta.emoji}</span>
                <span className="fluo-serif font-black text-white">{meta.label}</span>
                {meta.subtitle && <span lang="fr" className="hidden text-sm text-white/85 sm:inline">{meta.subtitle}</span>}
                <span className="ml-auto text-xs font-bold text-white/85">{decks.length} decks</span>
              </summary>
              <div className="overflow-x-auto rounded-xl border-2 bg-white" style={{ borderColor: "var(--fluo-card-accent)" }}>
                <table className="w-full text-left text-sm" style={{ minWidth: 560 }}>
                  <thead>
                    <tr className="border-b-2" style={{ background: "var(--fluo-card-tint)", borderColor: "var(--fluo-card-accent)" }}>
                      <th className="px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">Deck</th>
                      {HEAD.map((h, i) => (
                        <th key={h} title={HEAD_TITLES[i]} className="px-1.5 py-2 text-center" aria-label={HEAD_TITLES[i]}>
                          <span
                            title={HEAD_TITLES[i]}
                            className="inline-flex h-7 w-7 cursor-help items-center justify-center rounded-full border-2 text-sm"
                            style={{ background: HEAD_CHIPS[i].bg, borderColor: HEAD_CHIPS[i].border }}
                          >
                            {h}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {decks.map((c) => (
                      <tr key={c.id} className="border-t border-[color:var(--cahier-rule)] transition hover:bg-[color:var(--fluo-card-tint)]">
                        <td className="max-w-[11rem] px-3 py-1.5 font-bold text-[color:var(--cahier-ink)]">
                          <div className="flex items-center gap-2">
                            {stopNum(c.id) !== null && (
                              <span
                                aria-hidden
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-black text-white"
                                style={{ background: "var(--fluo-card-accent)" }}
                              >
                                {stopNum(c.id)}
                              </span>
                            )}
                            <div lang="fr" className="truncate" title={c.title}>{shortTitle(c.id, c.title)}</div>
                          </div>
                          {/* Which words inside the deck matched the search. */}
                          {(hitMap.get(c.id)?.words.length ?? 0) > 0 && (
                            <div className="truncate text-xs font-normal text-[color:var(--cahier-ink-soft)]">
                              {hitMap.get(c.id)!.words.map((w, i) => (
                                <span key={w.id}>
                                  {i > 0 && " · "}
                                  <b lang="fr">{w.fr}</b> — {w.en}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        {cellsFor(c).map((cell, i) => (
                          <td key={i} className="px-1.5 py-1.5 text-center">
                            {cell.href ? (
                              <Link href={cell.href} title={`${cell.title} — ${c.title}`} aria-label={`${cell.title} — ${c.title}`}
                                className="inline-block rounded-md px-1 text-base transition hover:scale-125 hover:bg-[color:var(--cahier-hl)]/30">
                                {cell.emoji}
                              </Link>
                            ) : (
                              <span
                                title={`${cell.title} — not available for this deck`}
                                aria-label={`${cell.title} — not available for this deck`}
                                className="cursor-help text-[color:var(--cahier-ink-soft)]/40"
                              >
                                ·
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          );
        })}

        {/* The learner's own shelf — deck-building is a library action, so it
            lives here, not on Home (Dan, 2026-07-05: "Home = where am I,
            Index = the library"). */}
        <section className="fluo-h-5 mb-6">
          <div className="mb-2 flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: "var(--fluo-card-accent)" }}>
            <span aria-hidden>✨</span>
            <span className="fluo-serif font-black text-white">Your decks</span>
            <span className="hidden text-sm text-white/85 sm:inline">Cards you build yourself</span>
          </div>
          <MyDecks bare />
          <Link href="/decks/new" className="fluo-btn fluo-btn-sm mt-3 inline-flex">
            ➕ Nouveau deck
          </Link>
        </section>
      </div>
    </CahierShell>
  );
}
