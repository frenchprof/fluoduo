"use client";

/**
 * /reviser/embed — DéjàRevu, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and then *"proceed the remaining unframed
 * surfaces"*. `/reviser` is the page a learner opens; this is what runs in the
 * frame it holds, and it is the SAME component the page rendered directly
 * before, so the two cannot drift.
 *
 * The chrome is hidden by CSS in a framed document (`html[data-embed]` in
 * globals.css), so nothing here had to change to lose its notebook.
 */
/**
 * The Reviser — reviews items that are DUE (spacing data every game writes to
 * itemSrs) and shows the learner's gaps. Recognition MCQ: hear/read the French,
 * pick the English; each answer feeds the spacing ladder via recordItemResult,
 * so reviewing here reschedules the item like any other practice.
 *
 * Queue + option order are shuffled in a mount effect (never during render) so
 * SSR hydration stays deterministic — same pattern as PretestQuiz.
 */

import { iconFor } from "@/content/activities";
import { useEffect, useState } from "react";
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import SectionBand from "@/components/SectionBand";
import AuthGate from "@/components/AuthGate";
import PathNext from "@/components/PathNext";
import { speak } from "@/games/letris/speech";
import { loadProgress, recordItemResult } from "@/lib/progress";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { dueForReview, gapsByDeck, allReviewItems, reviewFocusFrom, type ReviewItem, type Gap } from "@/lib/reviser";
import { optionGridClass } from "@/lib/optionGrid";
import { shuffle } from "@/lib/shuffle";

type Card = { item: ReviewItem; options: string[] };


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

const TABS = [{ key: "reviser", ...iconFor("reviser")! }];

// Long queues are split into pages of 20 (Dan, 2026-07-13) — a bounded
// session beats an 80-card wall; the next page is offered at the end.
const PAGE = 20;

export default function ReviserPage() {
  useActivityPlay("reviser");
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
    // A game's post-mortem (patch 23) arrives with `?items=a,b,c` — those
    // misses lead the session, in the order they were missed; the rest of
    // what is due follows, shuffled as before. Read off the window here (not
    // useSearchParams) so the static export never needs a Suspense boundary.
    const focus = reviewFocusFrom(window.location.search);
    const due = dueForReview(p, now);
    const lead = focus.map((id) => pool.find((it) => it.id === id)).filter((x): x is ReviewItem => !!x);
    const rest = shuffle(due.filter((it) => !focus.includes(it.id)));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
    setCards([...lead, ...rest].map((it) => buildCard(it, pool)));
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
    // `reviser` is the app's ONLY source of `delayed` evidence — an item is
    // only offered here once its spacing interval has elapsed, which is what
    // PRD §7 means by retrieval after a delay. Untagged, this wrote answers
    // with no evidence type and the strongest signal the store can carry was
    // never produced at all (audit 2026-08-30).
    recordItemResult(card.item.id, correct, choice, "reviser");
    if (correct) {
      setScore((s) => s + 1);
      speak(card.item.fr, "fr-FR");
    }
  }

  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }

  // Chrome OUTSIDE the gate (2026-08-24): signed out this page used to be a
  // bare full-screen lock — no band, no bottom bar, no way to know where you
  // were. The gate now renders inside the page's normal chrome.
  return (
    <CahierShell
      tabs={TABS}
      active="reviser"
      topRight={total > 0 && !done ? <span className="fluo-mono text-sm font-bold">{i}/{total} · ✓ {score}</span> : null}
      /* The band is the name alone now (Dan, 1 Sep: "drop the number at the
         end of that strip"). The due count has not been lost — `topRight`
         above still carries the run's figures, and the page's own list says
         how many are due. */
    >
      <AuthGate what="review">
      <div className="mx-auto max-w-xl px-4 pb-6 pt-2">

        {total === 0 ? (
          <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: "var(--fluo-line)" }}>
            <p className="text-base font-bold text-[color:var(--fluo-ink)]">Nothing due right now 🎉</p>
            <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">
              Practise any objective&rsquo;s deck and its words will come back here when they&rsquo;re due.
            </p>
            <Link href="/home" className="fluo-btn fluo-btn-sm mt-4 inline-block">← Back to the path</Link>
            {/* THE EMPTY QUEUE IS AN END TOO, and the path must not stall on
                it. On the mid-term path this branch is rare — step 1 is the
                Finale, which queues everything it catches — but a learner who
                arrives with nothing due has finished with this screen either
                way, and freezing their walk because the SRS had nothing to
                offer would be the worse of the two answers. */}
            <PathNext />
          </div>
        ) : done ? (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: "#3a9b5c" }}>
              <p className="text-lg font-black text-[color:var(--fluo-ink)]">Review done · ✓ {score}/{total}</p>
              {remaining > 0 ? (
                <button type="button"
                  onClick={() => { setOffset((o) => o + PAGE); setI(0); setScore(0); setPicked(null); }}
                  className="fluo-btn mt-3">
                  ▶ Next {Math.min(PAGE, remaining)} ({remaining} left)
                </button>
              ) : (
                <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">Come back tomorrow for the next batch.</p>
              )}
            </div>
            {/* Recomputed rather than read from `gaps` state on purpose: this is
                the END-of-queue panel, so it must reflect the answers just given,
                and the state was computed on mount. Pre-existing; the purity rule
                is right in general and wrong here. */}
            {/* eslint-disable-next-line react-hooks/purity */}
            <GapPanel gaps={gapsByDeck(loadProgress(), Date.now())} />
            {/* THE CURATED PATH'S PUSH (14 Sep). ErroReview is TWO steps on the
                mid-term path — step 2, which corrects what the Finale just
                caught, and step 9 the next morning, which makes it stick.
                It draws no `ActivityUsher`, and it cannot: the compass is
                computed from a STOP, and ErroReview belongs to no stop. So the
                push is rendered directly.

                THIS WAS FOUND BY WALKING THE PATH IN THE BUILT APP, not by
                reading it. Every check passed, the map page drew all eighteen
                rows, and the walk still stalled at step 2 forever — because
                the one screen that had to tick it drew nothing at all. */}
            <PathNext />
          </div>
        ) : card ? (
          <>
            <div className="rounded-2xl border-2 bg-[var(--fluo-card)] p-4" style={{ borderColor: "var(--fluo-line)" }}>
              <div className="flex items-center gap-2">
                <span lang="fr" className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">{card.item.fr}</span>
                <button type="button" onClick={() => speak(card.item.fr, "fr-FR")} title="Hear it" className="text-lg opacity-60 hover:opacity-100">🔊</button>
              </div>
              <p className="mt-1 text-[0.7rem] font-bold uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">{card.item.deckTitle}</p>

              <div className={`mt-4 ${optionGridClass(card.options)}`}>
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
                      className={`rounded-xl border-2 px-3 py-2 text-center text-sm font-bold transition ${cls}`}>
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
      </AuthGate>
    </CahierShell>
  );
}

function GapPanel({ gaps }: { gaps: Gap[] }) {
  if (gaps.length === 0) return null;
  // A colour-coded band, not a bare heading (SectionBand.tsx): this page
  // measured 2.5% saturated — the flattest core surface on the site — and a
  // learner arriving here could not tell at a glance which world they were in.
  return (
    <SectionBand family="review" label="WHERE YOUR GAPS ARE" pill={`${gaps.length} deck${gaps.length === 1 ? "" : "s"}`}>
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
              {g.weak > 0 && <span className="rounded-full px-2 py-0.5 text-white" style={{ background: "var(--dopa-miss)" }}>{g.weak} weak</span>}
              {g.due > 0 && <span className="rounded-full px-2 py-0.5 text-white" style={{ background: "var(--dopa-focus)" }}>{g.due} due</span>}
              <span className="text-[color:var(--fluo-ink-soft)]">{g.seen} seen</span>
            </span>
          </Link>
        ))}
      </div>
    </SectionBand>
  );
}
