"use client";

/**
 * GameGallery — a game's gallery is ONE card, not a wall (patch 23).
 *
 * The audit: "26 LexicaLater sets, 24 VocabulaRain, 11 Compose, 50 Flip It
 * decks — each a long scroll asking a first-year to make a curriculum
 * decision they can't make. You already have an SRS scheduler. Replace each
 * gallery with one card showing the *next* set and a ▶ Jouer, plus Choisir
 * un autre opening the grid as a bottom sheet. 80% of students never see a
 * list."
 *
 * WHICH SET IS NEXT — decided after mount from the learner's own itemSrs
 * (prerender must not depend on localStorage):
 *   1. the set whose deck has the most items DUE for review right now;
 *   2. else the first set, in course order, whose deck the learner has never
 *      practised;
 *   3. else the first set.
 * A deck-less set (an "Extra" rain) never wins by due count; it can still be
 * chosen from the sheet.
 *
 * Tokens only.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import BottomSheet from "@/components/BottomSheet";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import { CURATED } from "@/content/collections";
import { loadProgress } from "@/lib/progress";

export type GalleryEntry = {
  id: string;
  href: string;
  title: string;
  /** 0–4, or null for out-of-syllabus extras. */
  unit: number | null;
  /** The curated deck behind the set, when there is one — drives "next". */
  deckId?: string;
};

function pickNext(entries: GalleryEntry[]): GalleryEntry | undefined {
  if (entries.length === 0) return undefined;
  const p = loadProgress();
  const now = Date.now();
  let best: { e: GalleryEntry; due: number } | null = null;
  let firstUnseen: GalleryEntry | undefined;
  for (const e of entries) {
    const deck = e.deckId ? CURATED.find((c) => c.id === e.deckId) : undefined;
    if (!deck) continue;
    let due = 0;
    let seen = 0;
    for (const it of deck.items) {
      const s = p.itemSrs[it.id];
      if (!s) continue;
      seen += 1;
      if (s.due <= now) due += 1;
    }
    if (due > 0 && (!best || due > best.due)) best = { e, due };
    if (seen === 0 && !firstUnseen) firstUnseen = e;
  }
  return best?.e ?? firstUnseen ?? entries[0];
}

export default function GameGallery({
  activityKey,
  emoji,
  name,
  entries,
}: {
  /** CahierShell's `active` key. */
  activityKey: string;
  emoji: string;
  name: string;
  /** In course order. */
  entries: GalleryEntry[];
}) {
  const [next, setNext] = useState<GalleryEntry | undefined>(undefined);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Deliberate: pickNext reads progress from localStorage, which cannot
    // be read during render — this mount effect has to seed the pick.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNext(pickNext(entries));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const card = next ?? entries[0];
  const accent = useMemo(
    () => (card?.unit === null || card?.unit === undefined ? "var(--cahier-accent)" : UNIT_ACCENTS[card.unit]),
    [card],
  );

  return (
    <CahierShell active={activityKey}>
      <div className="mx-auto max-w-md px-4 pb-6 pt-4">
        <p className="text-center text-4xl" aria-hidden>{emoji}</p>
        {card ? (
          <div
            className="game-play-card mt-3 rounded-2xl border-2 border-b-4 bg-[color:var(--cahier-paper-raised)] p-5 text-center shadow-[var(--shadow-card)]"
            style={{ borderColor: accent }}
          >
            <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: accent }}>
              {card.unit === null ? "Extra" : `Unité ${card.unit}`}
            </p>
            <p lang="fr" className="cahier-display mt-1 text-2xl font-black text-[color:var(--cahier-ink)]">{card.title}</p>
            <Link
              href={card.href}
              className="cahier-btn cahier-btn-primary mt-4 w-full justify-center text-lg font-black no-underline"
            >
              ▶ Play
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="cahier-btn mt-2 w-full justify-center"
            >
              Choose another
            </button>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-[color:var(--cahier-ink-soft)]">No set offers {name} yet.</p>
        )}
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={<>{emoji} {name}</>}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {entries.map((e) => {
            const a = e.unit === null ? "var(--cahier-accent)" : UNIT_ACCENTS[e.unit];
            return (
              <Link
                key={e.id}
                href={e.href}
                className="flex items-center gap-2.5 rounded-xl border-2 border-b-4 bg-[color:var(--cahier-paper-raised)] p-2.5 no-underline transition hover:-translate-y-0.5"
                style={{ borderColor: a }}
              >
                <span className="min-w-0">
                  {/* Brand hand, heavy bold, on half-width tiles (Dan,
                      5 Sep) — and it runs narrower, so titles that used
                      to truncate now mostly fit. */}
                  <span className="fluo-btn-hand block truncate text-sm leading-tight text-[color:var(--cahier-ink)]" lang="fr" title={e.title}>
                    {e.title}
                  </span>
                  <span className="block text-[11px] font-bold" style={{ color: a }}>
                    {e.unit === null ? "Extra" : `U${e.unit}`}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </BottomSheet>
    </CahierShell>
  );
}
