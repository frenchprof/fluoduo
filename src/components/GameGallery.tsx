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
 * The two buttons the audit named in French are ENGLISH since 6 Sep — ▶ Play
 * and Choose another (item 7): a beginner cannot reach the game without
 * reading the only button on the card. The audit's words are left as quoted
 * so the record stays accurate; verify23 and verify105 pin what ships.
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

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import BottomSheet from "@/components/BottomSheet";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import { CURATED } from "@/content/collections";
import { loadProgress, buyUnlock } from "@/lib/progress";

export type GalleryEntry = {
  id: string;
  href: string;
  title: string;
  /** 0–4, or null for out-of-syllabus extras. */
  unit: number | null;
  /** The curated deck behind the set, when there is one — drives "next". */
  deckId?: string;
  /** An expert-GAME unlock gate (economy.ts EXPERT_UNLOCKS). Games only —
   *  the course spine never carries this field. Until bought, the tile is a
   *  buy button; after, an ordinary door. */
  locked?: { unlockId: string; cost: number; emoji?: string };
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
  /** The game's own mark. A ReactNode, not a string: LexicaLater's is the
   * drawn chest (ChestArt), not a glyph — see components/ChestArt.tsx. */
  emoji: ReactNode;
  name: string;
  /** In course order. */
  entries: GalleryEntry[];
}) {
  const [next, setNext] = useState<GalleryEntry | undefined>(undefined);
  const [open, setOpen] = useState(false);
  // Which expert gates are open. Read in an effect (localStorage cannot be
  // read during render) and re-read on every save so a purchase in the
  // boutique — or right here — unlocks the tile without a reload.
  const [unlocked, setUnlocked] = useState<string[]>([]);
  useEffect(() => {
    const read = () => setUnlocked(loadProgress().unlocks ?? []);
    read();
    window.addEventListener("fluolingo:progress-updated", read);
    return () => window.removeEventListener("fluolingo:progress-updated", read);
  }, []);
  useEffect(() => {
    // Deliberate: pickNext reads progress from localStorage, which cannot
    // be read during render — this mount effect has to seed the pick.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNext(pickNext(entries.filter((e) => !e.locked || (loadProgress().unlocks ?? []).includes(e.locked.unlockId))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const card = next ?? entries[0];
  const accent = useMemo(
    () => (card?.unit === null || card?.unit === undefined ? "var(--cahier-accent)" : UNIT_ACCENTS[card.unit]),
    [card],
  );

  return (
    /* THE BAND IS TOLD THE NAME (Dan, 2026-09-07: pages never lose their
       coloured strip at the top). `active="matching"` has no registry row —
       Match It went off navigation on 10 Aug, keeping its route — so
       CahierShell could not name the page and drew no band at all: a gallery
       on bare paper. This component has known the name all along; it simply
       never passed it. */
    <CahierShell active={activityKey} band={{ title: name }}>
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
        {/* `sm:grid-cols-3` was a BREAKPOINT, and this sheet opens inside the
            cahier's iframe, where a media query measures the FRAME and not the
            phone — 390px of device is 313px of frame, so the `sm` it was
            asking about was never the phone's. The shared tile floor counts
            the room it actually has: two at worst, four at best, no query. */}
        <div className="fluo-tilegrid" style={{ ["--tile-min" as string]: "10rem", ["--tile-gap" as string]: "10px" }}>
          {entries.map((e) => {
            const a = e.unit === null ? "var(--cahier-accent)" : UNIT_ACCENTS[e.unit];
            if (e.locked && !unlocked.includes(e.locked.unlockId)) {
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => buyUnlock(e.locked!.unlockId)}
                  title={`${e.title} — an expert deck. Unlock for 💎 ${e.locked.cost}`}
                  className="flex items-center gap-2.5 rounded-xl border-2 border-b-4 border-dashed bg-[color:var(--cahier-paper-raised)] p-2.5 text-left transition hover:-translate-y-0.5"
                  style={{ borderColor: a }}
                >
                  <span className="min-w-0">
                    <span className="fluo-btn-hand block truncate text-sm leading-tight text-[color:var(--cahier-ink)]" lang="fr">
                      {e.locked.emoji ?? "🔒"} {e.title}
                    </span>
                    <span className="fluo-mono block text-[11px] font-bold" style={{ color: a }}>
                      💎 {e.locked.cost}
                    </span>
                  </span>
                </button>
              );
            }
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
