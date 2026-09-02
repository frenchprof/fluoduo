"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGate from "@/components/AuthGate";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { getCollection } from "@/lib/firebase/collections";
import { displayEn, displayFr } from "@/lib/collections/display";
import { speak } from "@/games/letris/speech";
import { logEvent } from "@/lib/firebase/usage";
import { recordResponse } from "@/lib/firebase/responses";
import { notePracticeDay } from "@/lib/progress";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import type { Collection, Item } from "@/lib/collections/schema";
import { goalNumberForDeck } from "@/lib/stopTag";
import CahierShell, { withActive } from "@/components/CahierShell";
import { deckTabs } from "../DeckContent";
import { buildEvidence } from "@/lib/evidence";

type Dir = "fr-en" | "en-fr";
const DIR_KEY = "fluolingo.mcqDir.v1";
const TTS_KEY = "fluolingo.mcqTts.v1";
const ROUND_SIZE = 10;

function McqPageInner({ id }: { id: string }) {
  const [collection, setCollection] = useState<Collection | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const curated = CURATED.find((c) => c.id === id);
    if (curated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- the deck is loaded asynchronously; there is no render-time value to derive it from.
      setCollection(curated);
      return;
    }
    (async () => {
      try {
        const col = await getCollection(id);
        if (!cancelled) setCollection(col);
      } catch {
        if (!cancelled) setCollection(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    /* THE BAND, NAMED HERE (Dan's 1 Sep chrome audit). This page could not
       name itself: a curated deck gets no MCQ flap (DeckContent.deckTabs), so
       the shell's flap lookup found nothing and the page drew a bare <h1> on
       plain paper while every other page opened with a band. It knows the deck
       and the deck knows its stop, so it can say both. */
    <CahierShell
      tabs={withActive(deckTabs(id), "mcq")}
      active="mcq"
      band={{ title: "MCQ", goal: goalNumberForDeck(id), exitHref: `/decks/${id}` }}
    >
      <div className="mx-auto max-w-3xl px-4 py-4">
        {collection === undefined && (
          <p className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center text-base text-slate-500">
            Loading…
          </p>
        )}
        {collection === null && (
          <p className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-6 text-center text-rose-700">
            Deck not found.
          </p>
        )}
        {collection && <Runner collection={collection} />}
      </div>
    </CahierShell>
  );
}

function Runner({ collection }: { collection: Collection }) {
  const [dir, setDir] = useState<Dir>("fr-en");
  const [ttsOn, setTtsOn] = useState(true);
  const [seed, setSeed] = useState(1);
  // Seed starts fixed (SSR-safe), then randomises on mount so every activation
  // gets a fresh question round + option order; Restart re-rolls it again.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Math.random() must NOT run during render: the static export would ship one seed to every learner and hydration would mismatch.
    setSeed(1 + Math.floor(Math.random() * 1_000_000));
  }, []);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    try {
      const d = localStorage.getItem(DIR_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage cannot be read during render (AGENTS.md); this is the accepted mount-time read.
      if (d === "fr-en" || d === "en-fr") setDir(d);
      const t = localStorage.getItem(TTS_KEY);
      if (t === "0") setTtsOn(false);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(DIR_KEY, dir);
      localStorage.setItem(TTS_KEY, ttsOn ? "1" : "0");
    } catch {}
  }, [dir, ttsOn]);

  const glossed = useMemo(
    () => collection.items.filter((it) => it.fr && it.en),
    [collection.items],
  );

  const round = useMemo(() => makeRound(glossed, ROUND_SIZE, seed), [glossed, seed]);
  const total = round.length;
  const done = step >= total;
  const question = !done ? round[step] : null;

  const choices = question && glossed.length >= 4
    ? buildChoices(question, glossed, dir, seed + step)
    : [];

  // Hook must sit above the small-deck early return (rules of hooks).
  useChoiceKeys({
    count: choices.length,
    enabled: !!question,
    onPick: (i) => { if (choices[i]) pick(choices[i]); },
    onNext: () => { if (picked) next(); },
    onSpeak: () => { if (question) speakItem(question); },
  });

  if (glossed.length < 4) {
    return (
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-amber-900">
        <h2 className="text-lg font-black">Not enough items for MCQ</h2>
        <p className="mt-1 text-sm">
          MCQ needs at least 4 items with both `fr` and `en`. This deck has {glossed.length}.
        </p>
        <Link href={`/decks/view?id=${collection.id}`} className="fluo-btn fluo-btn-ghost mt-4 inline-flex">
          ← Back to deck
        </Link>
      </div>
    );
  }


  function speakItem(it: Item) {
    if (!ttsOn) return;
    const text = displayFr(it, collection);
    speak(text, "fr-FR");
  }

  function pick(text: string) {
    if (!question || picked) return;
    setPicked(text);
    const correct = sideText(question, dir).answer === text;
    // MCQ grades outside recordItemResult (it never fed the SRS), so it
    // writes the evidence trail directly.
    //
    // It did not, until 30 Aug. This comment claimed the evidence trail while
    // the call passed no `evidence` at all, which is probably why nobody
    // looked: the answer stored as bare right/wrong, with no outcomeId and no
    // evidenceType. Not routed through recordItemResult — the comment above is
    // still the reason — so buildEvidence is called directly.
    recordResponse(question.id, correct, {
      given: text,
      activity: `mcq:${collection.id}`,
      evidence: buildEvidence(question.id, `mcq:${collection.id}`),
    });
    // Staying outside recordItemResult starved the STREAK too — an MCQ
    // session was a day of practice the fire never counted. This bumps the
    // day and nothing else; SRS and XP stay deliberately untouched.
    notePracticeDay();
    if (correct) setScore((s) => s + 1);
  }
  function next() {
    setPicked(null);
    setStep((s) => s + 1);
    if (step + 1 === total) {
      logEvent("deck.open", { id: collection.id, source: "mcq-complete" });
    }
  }
  function restart() {
    setStep(0);
    setPicked(null);
    setScore(0);
    setSeed((s) => s + 1);
  }

  return (
    <>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          {/* The deck's name moved to the band (1 Sep) — it was printed here
              because the page had none. The direction line stays: it is what
              this run ASKS, which the band's title does not say. */}
          <p className="text-sm text-slate-500">{dir === "fr-en" ? "🇫🇷 → EN" : "EN → 🇫🇷"} — pick the matching translation.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTtsOn((v) => !v)}
            className={`rounded-full border-2 px-3 py-1 text-xs font-bold uppercase tracking-wider transition ${
              ttsOn
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-500"
            }`}
            title={ttsOn ? "TTS on — click to mute" : "TTS muted — click to enable"}
          >
            {ttsOn ? "🔊 TTS" : "🔇 TTS"}
          </button>
          <div className="inline-flex overflow-hidden rounded-xl border-2 border-slate-200 bg-white text-xs font-bold">
            {(["fr-en", "en-fr"] as Dir[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDir(d);
                  restart();
                }}
                className={`px-3 py-1.5 transition ${
                  dir === d ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {d === "fr-en" ? "🇫🇷 → EN" : "EN → 🇫🇷"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <ProgressBar step={Math.min(step, total)} total={total} score={score} />

      {question && (
        <Question
          item={question}
          collection={collection}
          dir={dir}
          choices={choices}
          picked={picked}
          onPick={pick}
          onNext={next}
          onSpeak={() => speakItem(question)}
          isLast={step === total - 1}
        />
      )}

      {done && (
        <Recap
          score={score}
          total={total}
          onRestart={restart}
          backHref={`/decks/view?id=${collection.id}`}
        />
      )}
    </>
  );
}

/* ──────────────────────────────────────────────────────────── */

function ProgressBar({ step, total, score }: { step: number; total: number; score: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>
          {Math.min(step + (step < total ? 1 : 0), total)} / {total}
        </span>
        <span>
          Score {score}/{total}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--fluo-primary)" }}
        />
      </div>
    </div>
  );
}

function Question({
  item,
  collection,
  dir,
  choices,
  picked,
  onPick,
  onNext,
  onSpeak,
  isLast,
}: {
  item: Item;
  collection: Collection;
  dir: Dir;
  choices: string[];
  picked: string | null;
  onPick: (c: string) => void;
  onNext: () => void;
  onSpeak: () => void;
  isLast: boolean;
}) {
  const { stem, answer, stemLang } = sideText(item, dir, collection);
  return (
    <article className="fluo-card fluo-h-1" data-hue={1}>
      <div className="flex items-center justify-center gap-3">
        {item.emoji && <span className="text-5xl" aria-hidden>{item.emoji}</span>}
        <div lang={stemLang} className="text-center text-3xl font-black text-slate-900 sm:text-4xl">
          {stem}
        </div>
        <button
          type="button"
          onClick={onSpeak}
          title="Speak the French sentence"
          className="rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-base transition hover:border-emerald-400"
        >
          🔊
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {choices.map((c, i) => {
          const isPicked = picked === c;
          const isAnswer = c === answer;
          let cls = "border-slate-200 bg-white text-slate-900 hover:border-slate-400";
          if (picked) {
            if (isAnswer) cls = "border-emerald-500 bg-emerald-50 text-emerald-900";
            else if (isPicked) cls = "border-rose-500 bg-rose-50 text-rose-900";
            else cls = "border-slate-200 bg-white text-slate-400";
          }
          return (
            <button
              key={c}
              type="button"
              // Answered → options stay tappable purely for their sound (Dan,
              // 2026-07-04), in the option's own language.
              onClick={() => (picked ? speak(c, dir === "fr-en" ? "en-US" : "fr-FR") : onPick(c))}
              lang={dir === "fr-en" ? "en" : "fr"}
              className={`rounded-xl border-2 px-4 py-3 text-left text-base font-bold transition ${cls}`}
            >
              {/* The 1-4 keys answer (useChoiceKeys) — show them so learners
                  know (Dan, 2026-07-16). */}
              <span aria-hidden className="mr-2 text-xs font-bold opacity-50">{i + 1}</span>
              {c}
              {picked && isAnswer && <span className="ml-2" aria-hidden>✓</span>}
              {picked && isPicked && !isAnswer && <span className="ml-2" aria-hidden>✗</span>}
            </button>
          );
        })}
      </div>

      {picked && (
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onNext} className="fluo-btn fluo-btn-lg">
            {isLast ? "🏁 See recap" : "Next →"}
          </button>
        </div>
      )}
    </article>
  );
}

function Recap({
  score,
  total,
  onRestart,
  backHref,
}: {
  score: number;
  total: number;
  onRestart: () => void;
  backHref: string;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <article className="fluo-card fluo-h-5" data-hue={5}>
      <div className="text-center">
        <div className="text-6xl" aria-hidden>
          {pct === 100 ? "🏆" : pct >= 75 ? "🎉" : pct >= 50 ? "💪" : "📖"}
        </div>
        <h2 className="mt-2 text-2xl font-black text-slate-900">
          {score} / {total} correct
        </h2>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={onRestart} className="fluo-btn fluo-btn-lg">
          ↻ New round
        </button>
        <Link href={backHref} className="fluo-btn fluo-btn-ghost">
          ← Back to deck
        </Link>
      </div>
    </article>
  );
}

/* ──────────────────────────────────────────────────────────── */

function sideText(
  item: Item,
  dir: Dir,
  collection?: Collection,
): { stem: string; answer: string; stemLang: string } {
  if (dir === "fr-en") {
    return {
      stem: collection ? displayFr(item, collection) : item.fr,
      answer: displayEn(item),
      stemLang: "fr",
    };
  }
  return {
    stem: displayEn(item),
    answer: collection ? displayFr(item, collection) : item.fr,
    stemLang: "en",
  };
}

/** Pick N items deterministically given a seed; leaves the rest as distractor pool. */
function makeRound(pool: Item[], n: number, seed: number): Item[] {
  const shuffled = stableShuffle(pool, `round-${seed}`);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

/** Stem the answer, pick 3 sibling distractors (no duplicates). */
function buildChoices(
  item: Item,
  pool: Item[],
  dir: Dir,
  seed: number,
): string[] {
  const correct = sideText(item, dir).answer;
  const others = pool
    .filter((p) => p.id !== item.id)
    .map((p) => sideText(p, dir).answer)
    .filter((t) => t !== correct);
  const seen = new Set<string>();
  const uniqueOthers = others.filter((t) => (seen.has(t) ? false : (seen.add(t), true)));
  const distractors = stableShuffle(uniqueOthers, `dis-${seed}-${item.id}`).slice(0, 3);
  return stableShuffle([correct, ...distractors], `pick-${seed}-${item.id}`);
}

function stableShuffle<T>(arr: T[], seedStr: string): T[] {
  const out = [...arr];
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) | 0;
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Sign-in wall (Dan, 2026-07-13: close ALL anonymous gaps — these deck pages
// predate the wall). Gated HERE so every route that renders this content
// (static /decks/[id]/… and query-param /decks/…?id=) is covered at once.
export default function McqPage({ id }: { id: string }) {
  return (
    <AuthGate what="take the quiz">
      <McqPageInner id={id} />
    </AuthGate>
  );
}
