"use client";

/**
 * GameGallery — the suggestion on top, EVERY set on the page under it.
 *
 * Dan, 2026-09-12, shown all seven doors that replaced the pop-ups side by
 * side: *"do those three"* — VocabulaRain, LexicaLocker and ComposeIt, the
 * three that still showed one card and a *Choose another* button.
 *
 * WHAT CHANGED, AND WHY IT IS A REVERSAL WORTH READING. Patch 23's audit said:
 *
 *   "26 LexicaLater sets, 24 VocabulaRain, 11 Compose, 50 Flip It decks —
 *   each a long scroll asking a first-year to make a curriculum decision they
 *   can't make. You already have an SRS scheduler. Replace each gallery with
 *   one card showing the *next* set and a ▶ Jouer, plus Choisir un autre
 *   opening the grid as a bottom sheet. 80% of students never see a list."
 *
 * That was right about the WALL and wrong about the SHEET. On 12 Sep Dan
 * retired every activity pop-up — *"replace all the pop ups for activities by
 * actual pages (no more pop ups for going into those activities)"* — and this
 * one had survived the sweep by hiding one click further in: the page opened,
 * and then a bottom sheet opened on top of it. Four doors out of seven landed
 * on a real list of choices; these three landed on a card.
 *
 * So the audit's good half is kept and its bad half is dropped:
 *   · the ▶ Play card still names the set the SRS says is next, so the
 *     learner who wants to be told still never makes a curriculum decision;
 *   · the sets are on the PAGE now, not behind a button — folded by unit,
 *     one unit open at a time, the suggestion's own unit open on arrival.
 *
 * THE FOLD IS THE COLLAPSE RULE, NOT A SECOND SHEET (AGENTS.md, 2026-08-31:
 * *"all long pages must be collapsed for the lower sections, so the entire
 * fits on one screen first"*). Native `<details name>`, a count on every
 * closed summary — "6 sets", never a bare chevron — and the same exclusive
 * accordion ActivityLanding uses for its fifty stops, so MémoiRecall and
 * VocabulaRain now read the same way. The difference from a bottom sheet is
 * the one that matters: nothing here is modal, nothing covers the card, and
 * the shape of the whole choice is visible before anything is tapped.
 *
 * WHICH SET IS NEXT — decided after mount from the learner's own itemSrs
 * (prerender must not depend on localStorage):
 *   1. the set whose deck has the most items DUE for review right now;
 *   2. else the first set, in course order, whose deck the learner has never
 *      practised;
 *   3. else the first set.
 * A deck-less set (an "Extra" rain) never wins by due count; it can still be
 * chosen from the list.
 *
 * Tokens only. No size in this file is a pixel somebody chose: the tile grid
 * is `.fluo-tilegrid` (one floor, five surfaces) and the type is on the ramp.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { UNIT_ACCENTS } from "@/components/siteTabs";
import { CURATED } from "@/content/collections";
import { UNIT_META } from "@/content/sios";
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

/** A unit's key as a string, because `null` (an Extra) is one of the groups
 *  and `Map` keys of mixed type sort badly. */
const groupKey = (unit: number | null) => (unit === null ? "x" : String(unit));

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
  breakOut,
}: {
  /** CahierShell's `active` key. */
  activityKey: string;
  /** The game's own mark. A ReactNode, not a string: LexicaLater's is the
   * drawn chest (ChestArt), not a glyph — see components/ChestArt.tsx. */
  emoji: ReactNode;
  name: string;
  /** In course order. */
  entries: GalleryEntry[];
  /**
   * SEND THE DESTINATION TO THE WINDOW, NOT TO THIS FRAME (Dan, 2026-09-14,
   * sending a shot of NumBus drawn inside the Numbers band: *"Numbers is now
   * nesting numbus"*).
   *
   * Every station runs in an iframe since 7 Sep, so a gallery rendered from an
   * `/embed` route IS the framed document — and a plain link navigates the
   * frame. The game then draws its own whole notebook (site bar, coils, band)
   * inside the gallery's band, which is still wrapped around it, and the
   * address bar names the game while the band names the gallery.
   *
   * A PROP RATHER THAN ALWAYS-ON, because one caller is not framed:
   * `/games/matching` renders this gallery directly, and there `_top` would
   * only cost it a full page load in place of a soft route change. The three
   * `/embed` callers pass it; that one does not.
   */
  breakOut?: boolean;
}) {
  const [next, setNext] = useState<GalleryEntry | undefined>(undefined);
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

  // The groups, in course order with the Extras last. Derived from the
  // entries the caller passed, never a hard list of five: ComposeIt has no
  // Extras and an empty « Extra » flap would be a door onto nothing.
  const groups = useMemo(() => {
    const by = new Map<string, { unit: number | null; items: GalleryEntry[] }>();
    for (const e of entries) {
      const k = groupKey(e.unit);
      if (!by.has(k)) by.set(k, { unit: e.unit, items: [] });
      by.get(k)!.items.push(e);
    }
    return [...by.values()].sort((a, b) => (a.unit ?? 99) - (b.unit ?? 99));
  }, [entries]);

  // Which flap is open: the suggestion's own unit. Null until the mount
  // effect above has read the SRS, so the prerender opens nothing and the
  // first client render agrees with it.
  const openKey = card ? groupKey(card.unit) : null;
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    // Same constraint as the pick itself: which flap to open follows from
    // localStorage, so it cannot be derived during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(openKey);
  }, [openKey]);

  // `<details name>` is an exclusive accordion natively. Where it is not
  // supported the group would simply all stay open, so close the others by
  // hand — the whole point of the pattern is one unit at a time.
  const wrap = useRef<HTMLDivElement>(null);
  const onToggle = (key: string, isOpen: boolean) => {
    if (!isOpen) return;
    setOpen(key);
    wrap.current?.querySelectorAll<HTMLDetailsElement>("details[name='gallery-unit']").forEach((d) => {
      if (d.dataset.group !== key) d.open = false;
    });
  };

  return (
    /* THE BAND IS TOLD THE NAME (Dan, 2026-09-07: pages never lose their
       coloured strip at the top). `active="matching"` has no registry row —
       Match It went off navigation on 10 Aug, keeping its route — so
       CahierShell could not name the page and drew no band at all: a gallery
       on bare paper. This component has known the name all along; it simply
       never passed it. */
    <CahierShell active={activityKey} band={{ title: name }}>
      {/* TWO WIDTHS, ON PURPOSE. The suggestion is one card and stays
          card-width; the list of sets takes the room the page actually has,
          so `.fluo-tilegrid` can give a desktop four columns and a phone two
          (Dan, 2026-09-11: "maybe up to 4 per row"). One `max-w-md` around
          both would have pinned the list to two columns at every width —
          which is what the bottom sheet used to do. */}
      <div className="mx-auto max-w-3xl px-4 pb-6 pt-4">
        <p className="text-center text-4xl" aria-hidden>{emoji}</p>
        {card ? (
          <div
            className="game-play-card mx-auto mt-3 max-w-md rounded-2xl border-2 border-b-4 bg-[color:var(--cahier-paper-raised)] p-5 text-center shadow-[var(--shadow-card)]"
            style={{ borderColor: accent }}
          >
            <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: accent }}>
              {card.unit === null ? "Extra" : `Unité ${card.unit}`}
            </p>
            <p lang="fr" className="cahier-display mt-1 text-2xl font-black text-[color:var(--cahier-ink)]">{card.title}</p>
            <Link
              href={card.href}
              target={breakOut ? "_top" : undefined}
              className="cahier-btn cahier-btn-primary mt-4 w-full justify-center text-lg font-black no-underline"
            >
              ▶ Play
            </Link>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-[color:var(--cahier-ink-soft)]">No set offers {name} yet.</p>
        )}

        {/* EVERY set, on the page. What used to be a BottomSheet behind
            « Choose another » — see this file's header for why that button is
            gone. No heading above the flaps: the coloured strip already says
            the game's name, and a count over an open list is furniture (Dan,
            2026-09-01, on the strip that printed 2 above two visible tiles). */}
        {groups.length > 0 && (
          <div ref={wrap} className="mt-4 flex flex-col gap-2">
            {groups.map((g) => {
              const k = groupKey(g.unit);
              const meta = g.unit === null ? null : UNIT_META[g.unit];
              const a = g.unit === null ? "var(--cahier-accent)" : UNIT_ACCENTS[g.unit];
              return (
                <details
                  key={k}
                  name="gallery-unit"
                  data-group={k}
                  open={open === k}
                  onToggle={(e) => onToggle(k, (e.currentTarget as HTMLDetailsElement).open)}
                  className="overflow-hidden rounded-2xl border-2 bg-[color:var(--cahier-paper-raised)]"
                  style={{ borderColor: "var(--cahier-line-strong)" }}
                >
                  {/* The count is on the SUMMARY because a closed flap hides
                      what it counts — the half of the collapse rule that says
                      a chevron with no number is deletion with extra steps. */}
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2 font-black text-[color:var(--cahier-ink)]">
                      <span aria-hidden>{meta?.emoji ?? "✨"}</span>
                      <span>{meta?.label ?? "Extra"}</span>
                    </span>
                    <span className="fluo-mono text-xs font-bold" style={{ color: a }}>
                      {g.items.length} {g.items.length === 1 ? "set" : "sets"}
                    </span>
                  </summary>
                  {/* `sm:grid-cols-3` was a BREAKPOINT, and this page runs
                      inside the cahier's iframe, where a media query measures
                      the FRAME and not the phone — 390px of device is 313px of
                      frame, so the `sm` it was asking about was never the
                      phone's. The shared tile floor counts the room it
                      actually has: two at worst, four at best, no query. */}
                  <div className="fluo-tilegrid px-3 pb-3" style={{ ["--tile-min" as string]: "10rem", ["--tile-gap" as string]: "10px" }}>
                    {g.items.map((e) => (
                      <Tile
                        key={e.id}
                        entry={e}
                        accent={a}
                        unlocked={unlocked}
                        isNext={!!card && e.id === card.id}
                        breakOut={breakOut}
                      />
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </div>
    </CahierShell>
  );
}

/** One set. A door, or — while an expert gate is shut — the buy button for it. */
function Tile({
  entry: e,
  accent: a,
  unlocked,
  isNext,
  breakOut,
}: {
  /** Send the door to the window rather than to this frame — see GameGallery. */
  breakOut?: boolean;
  entry: GalleryEntry;
  accent: string;
  unlocked: string[];
  isNext: boolean;
}) {
  if (e.locked && !unlocked.includes(e.locked.unlockId)) {
    return (
      <button
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
      href={e.href}
      target={breakOut ? "_top" : undefined}
      /* The suggested set keeps its place in course order and is MARKED
         rather than moved: a learner who reads « Unité 2 » on the card needs
         to find that same set in the list, not discover it has jumped. */
      className="flex items-center gap-2.5 rounded-xl border-2 border-b-4 bg-[color:var(--cahier-paper-raised)] p-2.5 no-underline transition hover:-translate-y-0.5"
      style={{ borderColor: a, outline: isNext ? `2px dashed ${a}` : undefined, outlineOffset: isNext ? "2px" : undefined }}
    >
      <span className="min-w-0">
        {/* Brand hand, heavy bold, on half-width tiles (Dan, 5 Sep) — and it
            runs narrower, so titles that used to truncate now mostly fit. */}
        <span className="fluo-btn-hand block truncate text-sm leading-tight text-[color:var(--cahier-ink)]" lang="fr" title={e.title}>
          {e.title}
        </span>
        <span className="block text-[11px] font-bold" style={{ color: a }}>
          {e.unit === null ? "Extra" : `U${e.unit}`}
        </span>
      </span>
    </Link>
  );
}
