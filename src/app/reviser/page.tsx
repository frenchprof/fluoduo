"use client";

/**
 * The Reviser — reviews items that are DUE (spacing data every game writes to
 * itemSrs) and shows the learner's gaps. Recognition MCQ: hear/read the French,
 * pick the English; each answer feeds the spacing ladder via recordItemResult,
 * so reviewing here reschedules the item like any other practice.
 *
 * Queue + option order are shuffled in a mount effect (never during render) so
 * SSR hydration stays deterministic — same pattern as PretestQuiz.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import AuthGate from "@/components/AuthGate";
import { speak } from "@/games/letris/speech";
import { loadProgress, recordItemResult } from "@/lib/progress";
import { dueForReview, gapsByDeck, allReviewItems, type ReviewItem, type Gap } from "@/lib/reviser";

type Card = { item: ReviewItem; options: string[] };

function shuffle<T>(a: T[]): T[] {
  const o = [...a];
  for (let i = o.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [o[i], o[j]] = [o[j], o[i]];
  }
  return o;
}

function buildCard(item: ReviewItem, pool: ReviewItem[]): Card {
  const sameDeck = pool.filter((x) => x.deckId === item.deckId && x.en !== item.en);
  const distractors = shuffle(sameDeck).slice(0, 3).map((x) => x.en);
  if (distractors.length < 3) {
    for (const x of shuffle(pool)) {
      if (distractors.length >= 3) break;
      if (x.en !== item.en && !distractors.includes(x.en)) distractors.push(x.en);
    }
  }
  return { item, options: shuffle([item.en, ...distractors]) };
}

const TABS = [{ key: "reviser", label: "DéjàRevu", emoji: "🔁" }];

// Long queues are split into pages of 20 (Dan, 2026-07-13) — a bounded
// session beats an 80-card wall; the next page is offered at the end.
const PAGE = 20;

export default function ReviserPage() {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [offset, setOffset] = useState(0);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const p = loadProgress();
    const now = Date.now();
    const pool = allReviewItems();
    setCards(shuffle(dueForReview(p, now)).map((it) => buildCard(it, pool)));
    setGaps(gapsByDeck(p, now));
  }, []);

  if (cards === null) return null; // pre-mount: avoid hydration mismatch

  const chunk = cards.slice(offset, offset + PAGE);
  const total = chunk.length;
  const remaining = cards.length - offset - PAGE;
  const done = i >= total;
  const card = done ? null : chunk[i];

  function pick(choice: string) {
    if (picked !== null || !card) return;
    const correct = choice === card.item.en;
    setPicked(choice);
    recordItemResult(card.item.id, correct);
    if (correct) {
      setScore((s) => s + 1);
      speak(card.item.fr, "fr-FR");
    }
  }

  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }

  return (
    <AuthGate what="review">
    <CahierShell
      tabs={TABS}
      active="reviser"
      topRight={total > 0 && !done ? <span className="fluo-mono text-sm font-bold">{i}/{total} · ✓ {score}</span> : null}
    >
      <div className="mx-auto max-w-xl px-4 pb-6 pt-2">
        <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">🔁 DéjàRevu <span className="text-lg font-bold text-[color:var(--fluo-ink-soft)]">· Review</span></h1>
        <p className="mt-1 mb-5 text-sm text-[color:var(--fluo-ink-soft)]">
          Words you&rsquo;ve practised that are due again. Answering here reschedules them.{cards.length > PAGE ? ` ${cards.length} dus — par pages de ${PAGE}.` : ""}
        </p>

        {total === 0 ? (
          <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: "var(--fluo-line)" }}>
            <p className="text-base font-bold text-[color:var(--fluo-ink)]">Nothing due right now 🎉</p>
            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">
              Practise any objective&rsquo;s deck and its words will come back here when they&rsquo;re due.
            </p>
            <Link href="/" className="fluo-btn fluo-btn-sm mt-4 inline-block">← Back to the path</Link>
          </div>
        ) : done ? (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: "#3a9b5c" }}>
              <p className="text-lg font-black text-[color:var(--fluo-ink)]">Review done · ✓ {score}/{total}</p>
              {remaining > 0 ? (
                <button type="button"
                  onClick={() => { setOffset((o) => o + PAGE); setI(0); setScore(0); setPicked(null); }}
                  className="fluo-btn mt-3">
                  ▶ Les {Math.min(PAGE, remaining)} suivants ({remaining} restants)
                </button>
              ) : (
                <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">Come back tomorrow for the next batch.</p>
              )}
            </div>
            <GapPanel gaps={gapsByDeck(loadProgress(), Date.now())} />
          </div>
        ) : card ? (
          <>
            <div className="rounded-2xl border-2 bg-[var(--fluo-card)] p-4" style={{ borderColor: "var(--fluo-line)" }}>
              <div className="flex items-center gap-2">
                <span lang="fr" className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">{card.item.fr}</span>
                <button type="button" onClick={() => speak(card.item.fr, "fr-FR")} title="Hear it" className="text-lg opacity-60 hover:opacity-100">🔊</button>
              </div>
              <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">{card.item.deckTitle}</p>

              <div className="mt-4 grid gap-2">
                {card.options.map((o) => {
                  const show = picked !== null;
                  const isAnswer = o === card.item.en;
                  const isPicked = o === picked;
                  const cls = !show
                    ? "border-[color:var(--fluo-ink)] bg-[var(--fluo-card)] text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
                    : isAnswer
                      ? "border-[#178a4d] bg-[#178a4d] text-white"
                      : isPicked
                        ? "border-[#c0392b] bg-[#c0392b] text-white"
                        : "border-[color:var(--fluo-line)] bg-transparent text-[color:var(--fluo-ink-soft)] opacity-40";
                  return (
                    <button key={o} type="button" disabled={show} onClick={() => pick(o)}
                      className={`rounded-xl border-2 px-3 py-2 text-left text-sm font-bold transition ${cls}`}>
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
            {picked !== null && (
              <button type="button" onClick={next} className="fluo-btn mt-4 w-full">
                {i + 1 >= total ? "Finish" : "Next →"}
              </button>
            )}
          </>
        ) : null}

        {total > 0 && !done && gaps.length > 0 && (
          <div className="mt-8">
            <GapPanel gaps={gaps} />
          </div>
        )}
      </div>
    </CahierShell>
    </AuthGate>
  );
}

function GapPanel({ gaps }: { gaps: Gap[] }) {
  if (gaps.length === 0) return null;
  return (
    <div>
      <h2 className="fluo-label mb-2 text-[color:var(--fluo-ink-soft)]">Where your gaps are</h2>
      <div className="space-y-1.5">
        {gaps.map((g) => (
          <Link
            key={g.deckId}
            href={`/practice/flip-it/${g.deckId}`}
            className="flex items-center justify-between rounded-xl border-2 px-3 py-2 transition hover:bg-[var(--fluo-card-tint)]"
            style={{ borderColor: "var(--fluo-line)" }}
          >
            <span lang="fr" className="text-sm font-bold text-[color:var(--fluo-ink)]">{g.deckTitle}</span>
            <span className="flex items-center gap-2 text-xs font-bold">
              {g.weak > 0 && <span className="rounded-full bg-[#c0392b] px-2 py-0.5 text-white">{g.weak} weak</span>}
              {g.due > 0 && <span className="rounded-full bg-[#e0a100] px-2 py-0.5 text-white">{g.due} due</span>}
              <span className="text-[color:var(--fluo-ink-soft)]">{g.seen} seen</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
