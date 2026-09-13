"use client";

/**
 * GameOver — the post-mortem every game ends on (patch 23).
 *
 * "When the game dies, there should be feedback about what went wrong"
 * (Dan, 2026-07-21). Before this, LexicaLater listed the decoys, NumBourse
 * listed the lost trades, and the other four said "Final score: 240". Now one
 * screen, six games, three columns per miss:
 *
 *     the item        what you did instead        where it goes
 *     « soixante-dix »  you typed 60              → SIO-007 · Unité 0
 *
 * "Where it goes" is a deep link into Home (`/?unit=N#SIO-xxx`, patch 25) —
 * the stop on the path that teaches this. Every miss with a curated item id
 * is pushed into the ReVue queue THE MOMENT THIS SCREEN MOUNTS (queueForReview
 * — the real itemSrs mechanism dueForReview reads), so the misses are queued
 * whether or not the learner taps anything. `CORRIGER MAINTENANT` is the
 * primary button: it opens ReVue with these misses at the head of the
 * session (`/reviser?items=…`). Play again / back are secondary.
 *
 * Misses with no curated item (a spoken number the course has no row for)
 * are still listed — the learner reads what they got wrong — but cannot be
 * queued; the button counts only what it can.
 *
 * Tokens only.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SIOS } from "@/content/sios";
import { NextChip } from "@/components/DrillShell";
import { sioForDeck, sioForItem } from "@/lib/curriculum";
import { nextStep, type NextStep } from "@/lib/nextStep";
import { queueForReview } from "@/lib/progress";
import { reviserHref } from "@/lib/reviser";
import { HOME_HREF } from "@/lib/routes";
import ActivityUsher from "@/components/ActivityUsher";
import { usherFor } from "@/lib/usher";

export type GameMiss = {
  /** Curated item id when the game knows it — enables the ReVue queue and the
   *  SIO deep link. Omit for items outside the curated decks. */
  itemId?: string;
  /** Deck id, when the item id is unknown but the deck is (LexicaLater's decoys). */
  deckId?: string;
  /** The item as it was posed — the French, the spoken words, the phrase. */
  prompt: string;
  /** What was expected. */
  expected: string;
  /** What the learner did instead. Undefined = nothing (a timeout, a decoy). */
  given?: string;
};

/** Collapse repeats: the same item missed twice is one row, "×2". */
function dedupe(misses: GameMiss[]): Array<GameMiss & { n: number }> {
  const out: Array<GameMiss & { n: number }> = [];
  for (const m of misses) {
    const key = `${m.itemId ?? ""}|${m.prompt}|${m.expected}`;
    const hit = out.find((x) => `${x.itemId ?? ""}|${x.prompt}|${x.expected}` === key);
    if (hit) {
      hit.n += 1;
      if (!hit.given && m.given) hit.given = m.given;
    } else out.push({ ...m, n: 1 });
  }
  return out;
}

/** The stop on the path a miss belongs to. */
export function sioForMiss(m: GameMiss, fallbackSio?: string) {
  const id = (m.itemId && sioForItem(m.itemId)) || (m.deckId && sioForDeck(m.deckId)) || fallbackSio;
  return id ? SIOS.find((s) => s.id === id) : undefined;
}

export default function GameOver({
  emoji,
  title,
  score,
  won,
  misses,
  fallbackSio,
  deckId,
  onReplay,
  exitHref,
  onExit,
  extra,
  activityKey,
}: {
  /** The game's own mark. A ReactNode, not a string: LexicaLater's is the
   * drawn chest (ChestArt), not a glyph — see components/ChestArt.tsx. */
  emoji: ReactNode;
  /** "Terminus", "Appel de marge !", "All matched!" — the game's own word for the end. */
  title: ReactNode;
  score?: ReactNode;
  /** true = cleared / won; false = out of lives. Only picks the glyph. */
  won?: boolean;
  misses: GameMiss[];
  /** Where a deck-less game's misses go on the path (NumBus/NumBourse → SIO-007). */
  fallbackSio?: string;
  /** The deck the game ran on — anchors « Next › » on that stop's chain. */
  deckId?: string;
  /** This game's registry key, for the ushering row's ← and → and ↓.
   *
   *  OPTIONAL, AND THE ROW DEGRADES HONESTLY WITHOUT IT: `usherFor` needs the
   *  key to find this activity's place in the stop's chain, so a caller that
   *  passes none gets the 🎯 door and « redo » and no arrows — which is still
   *  Dan's *"the return to the 🎯 page … should always be offered"*, rather
   *  than arrows pointing at a guess. */
  activityKey?: string;
  onReplay: () => void;
  exitHref: string;
  onExit?: () => void;
  /** Anything the game wants under the list (a bill, a debrief). */
  extra?: ReactNode;
}) {
  const router = useRouter();
  const rows = useMemo(() => dedupe(misses), [misses]);
  const queueable = useMemo(() => [...new Set(misses.map((m) => m.itemId).filter((x): x is string => !!x))], [misses]);

  // « Next › » — the next undone step on this stop's practice chain
  // (approved flow, 2026-08-24). Resolved after mount: the ledger and
  // progress live in localStorage.
  const [next, setNext] = useState<NextStep | null>(null);
  useEffect(() => {
    // Deliberate: nextStep reads the ledger and progress from localStorage,
    // which cannot be read during render (see the comment above).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNext(nextStep(undefined, { collectionId: deckId, sioId: fallbackSio }));
  }, [deckId, fallbackSio]);

  const usher = useMemo(
    () => usherFor(activityKey, { collectionId: deckId, sioId: fallbackSio }),
    [activityKey, deckId, fallbackSio],
  );

  // Push every miss into the queue once per game-over, not once per render.
  const queued = useRef(false);
  useEffect(() => {
    if (queued.current || queueable.length === 0) return;
    queued.current = true;
    queueForReview(queueable);
  }, [queueable]);

  const correct = () => {
    // Already queued on mount; the button opens ReVue with these at the head.
    if (queueable.length > 0) queueForReview(queueable);
    router.push(reviserHref(queueable));
  };

  return (
    <div className="game-over fixed inset-0 z-[80] flex items-end justify-center bg-[color:var(--cahier-ink)]/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-2xl border-2 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] shadow-[var(--shadow-card)] sm:rounded-2xl">
        <div className="shrink-0 px-5 pt-5 text-center">
          <div className="text-4xl" aria-hidden>{won === false ? "💥" : emoji}</div>
          <h2 className="mt-1 text-xl font-black text-[color:var(--cahier-ink)]">{title}</h2>
          {score !== undefined && (
            <p className="cahier-mono mt-0.5 text-base font-bold text-[color:var(--cahier-ink-soft)]">{score}</p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-3">
          {rows.length === 0 ? (
            <p className="rounded-xl border-2 border-[color:var(--drill-ok-soft)] bg-[color:var(--drill-ok-bg)] px-3 py-2 text-center text-sm font-black text-[color:var(--drill-ok-ink)]">
              ✓ Sans faute
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {rows.map((m, i) => {
                const sio = sioForMiss(m, fallbackSio);
                return (
                  <li
                    key={i}
                    className="rounded-xl border-2 border-[color:var(--drill-bad-soft)] bg-[color:var(--drill-bad-bg)] px-3 py-2"
                  >
                    <div className="flex items-baseline gap-2">
                      <span lang="fr" className="min-w-0 flex-1 text-base font-black text-[color:var(--cahier-ink)]">
                        {m.prompt}
                        {m.n > 1 && <span className="ml-1 text-xs font-bold text-[color:var(--cahier-ink-soft)]">×{m.n}</span>}
                      </span>
                      <span className="cahier-mono shrink-0 text-sm font-black text-[color:var(--drill-ok-ink)]">
                        {m.expected}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-baseline gap-2 text-xs">
                      <span className="min-w-0 flex-1 truncate font-bold text-[color:var(--drill-bad-ink)]">
                        {m.given ? <>✗ {m.given}</> : <>✗ —</>}
                      </span>
                      {sio && (
                        <Link
                          href={`${HOME_HREF}?unit=${sio.unit}#${sio.id}`}
                          className="shrink-0 font-black text-[color:var(--cahier-accent)] no-underline hover:underline"
                        >
                          → {sio.short} · U{sio.unit}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {extra}
        </div>

        <div
          className="flex shrink-0 flex-col gap-2 border-t-2 border-[color:var(--cahier-ink)]/10 px-5 py-3"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
        >
          {/* Misses first, then onward (the approved flow, 2026-08-24): with
              misses queued, correcting them IS the next step — CORRIGER
              MAINTENANT keeps the primary and « Next › » waits below it.
              Only a clean run promotes « Next › » to the one primary. */}
          {queueable.length > 0 && (
            <button type="button" onClick={correct} className="cahier-btn cahier-btn-primary w-full justify-center font-black">
              CORRIGER MAINTENANT{queueable.length > 1 ? ` · ${queueable.length}` : ""}
            </button>
          )}
          <div className="flex min-w-0 items-center gap-2.5">
            {next && <NextChip step={next} />}
            <button
              type="button"
              onClick={() => router.push(next?.href ?? HOME_HREF)}
              className={`cahier-btn ml-auto shrink-0 justify-center font-black ${queueable.length === 0 ? "cahier-btn-primary" : ""}`}
            >
              Next ›
            </button>
          </div>
          {/* THE USHERING NAVIGATORS (Dan, 2026-09-13) — the same row every
              other finished activity ends on: back one step in this stop's
              chain, forward one, the 🎯 page, redo, and this game at the next
              stop that can play it. Six games share this card, so wiring it
              here is six surfaces in one place.

              « ▶ Play again » IS the row's redo, handed over rather than left
              beside it as a second word for the same move. The quiet line
              below keeps « ← Back » only where a game supplies its own
              `onExit` (a full-screen board has to leave full screen before it
              can navigate) — otherwise the 🎯 door on the row IS the way out
              and a second one would be the HelpDot fault. */}
          <ActivityUsher usher={usher} onRedo={onReplay} />
          {/* THE WAY OUT WHEN THE ROW HAS NONE. `usherFor` returns null for a
              game with neither a deck nor a fallback stop, and the row then
              draws nothing — so dropping this line outright would have left
              such a card with no exit at all. `exitHref` stays exactly for
              that case (lint found it unused the moment the ← Back above was
              folded into the row, which is how this got noticed), and a game
              that must leave full-screen before navigating keeps its own
              `onExit`. */}
          {(onExit || !usher) && (
            <div className="text-center text-[13px] font-bold text-[color:var(--cahier-ink)]/55">
              {onExit ? (
                <button type="button" onClick={onExit} className="underline decoration-dotted">← Back</button>
              ) : (
                <Link href={exitHref} className="underline decoration-dotted">← Back</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
