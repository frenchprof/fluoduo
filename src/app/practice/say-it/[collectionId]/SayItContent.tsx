"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { logEvent } from "@/lib/firebase/usage";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import { practiceItems } from "@/lib/collections/display";
import { recordItemResult } from "@/lib/progress";
import { deaccent, normalize } from "@/lib/practice/cloze";
import type { Collection, Item } from "@/lib/collections/schema";

type Phase = "idle" | "listening" | "result";
type Grade = "perfect" | "good" | "homophone" | "close" | "miss";

function articleOf(deck: Collection, item: Item): string {
  const cols = deck.gameConfig?.letris?.columns ?? [];
  const tag = item.tags?.find((t) => t.startsWith("col:"));
  if (!tag) return "";
  const raw = cols.find((c: { key: string }) => c.key === tag.slice(4))?.prefix ?? "";
  return raw ? (raw.charAt(0).toLowerCase() + raw.slice(1)).trim() : "";
}
function frFull(article: string, fr: string): string {
  if (!article) return fr;
  return article.endsWith("'") ? `${article}${fr}` : `${article} ${fr}`;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The private normalize/deaccent (byte-clones of cloze.ts) died in the
// grading unification (2026-08-11) — the transforms come from THE grader in
// lib/practice/cloze.ts. Only the SPEECH policy below stays local: it sits
// on top of the shared normalizer, never beside it.

/** SPEECH-only tolerance: French silent endings make "il s'appelle" and
 *  "ils s'appellent" perfect homophones — the recognizer picks a spelling,
 *  and the learner must never be penalized for its choice (Dan, 2026-07-05).
 *  Word pairs are equal when they differ only by a silent -s / -x / -nt,
 *  or by an -er / -ez / -ée(s) ending — all /e/, so "parler" and "parlez"
 *  are the same sound and the recognizer picks one arbitrarily (Dan,
 *  2026-07-15: "parler and parlez are treated as different??"). Inputs
 *  arrive deaccented. Stems under 3 letters are exempt: in "cher" / "mer" /
 *  "chez"-class words the ending isn't the verb /e/. */
function silentEq(a: string, b: string): boolean {
  if (a === b) return true;
  const grows = (x: string, y: string) => y === `${x}s` || y === `${x}x` || y === `${x}nt`;
  if (grows(a, b) || grows(b, a)) return true;
  const foldE = (w: string) => {
    const m = /^(.{3,})(er|ez|ee|ees)$/.exec(w);
    return m ? `${m[1]}É` : w;
  };
  return foldE(a) === foldE(b);
}

function gradeAnswer(recognized: string, expected: string, expectedAlt?: string): Grade {
  const nr = normalize(recognized);
  const ne = normalize(expected);
  if (!nr) return "miss";
  if (nr === ne) return "perfect";
  if (deaccent(nr) === deaccent(ne)) return "good";
  const tr = deaccent(nr).split(" ");
  const te = deaccent(ne).split(" ");
  if (tr.length === te.length && tr.every((w, i) => silentEq(w, te[i]))) return "homophone";
  // Number decks: speech engines transcribe "dix-sept" as the numeral "17".
  // Accept the digit form (item.en when it is purely numeric) as correct.
  if (expectedAlt) {
    const na = normalize(expectedAlt);
    if (na && nr === na) return "perfect";
  }
  const words = ne.split(" ").filter((w) => w.length > 1);
  if (!words.length) return "miss";
  const hits = words.filter((w) =>
    deaccent(nr).split(" ").some((r) => r === deaccent(w))
  );
  return hits.length / words.length >= 0.6 ? "close" : "miss";
}

const GRADE_UI: Record<Grade, { icon: string; label: string; cls: string }> = {
  perfect: { icon: "✅", label: "Parfait !", cls: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  good: { icon: "✅", label: "Bien ! (accent differs)", cls: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  homophone: { icon: "✅", label: "Parfait ! (same pronunciation)", cls: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  close: { icon: "🟡", label: "Presque !", cls: "text-amber-700 bg-amber-50 border-amber-300" },
  miss: { icon: "❌", label: "Not quite…", cls: "text-rose-700 bg-rose-50 border-rose-300" },
};

export default function SayItContent({
  collectionId,
  embedded = false,
  deckOverride,
}: {
  collectionId: string;
  embedded?: boolean;
  /** A synthetic deck (the Marathon oral compiles every deck into one) —
   *  items arrive with articles already baked into fr. */
  deckOverride?: Collection;
}) {
  const deck = deckOverride ?? CURATED.find((c) => c.id === collectionId);

  // A run is a working queue, NOT an endless carousel (Dan, 2026-07-03: "there
  // should be a natural end rather than looping continuously"). `card` is on
  // screen; `queue` is what's still ahead; `trail` is every card left behind —
  // answered OR skipped — so Back can always retrace (Dan, 2026-07-16: "the
  // back button is not active when I skip questions"). Only answered entries
  // count toward progress; a skipped card also waits at the queue's end, and
  // going Back to it pulls it out of the queue again (no duplicates).
  const [cards, setCards] = useState<Item[]>([]); // stable deck order (mount shuffle)
  const [card, setCard] = useState<Item | null>(null);
  const [queue, setQueue] = useState<Item[]>([]);
  const [trail, setTrail] = useState<{ it: Item; skipped: boolean }[]>([]);
  const [finished, setFinished] = useState(false);

  // Shuffle on mount only — shuffling during render breaks SSR hydration
  // (the AGENTS/handoff "no Math.random() during render" rule).
  useEffect(() => {
    const list = deck ? shuffle(practiceItems(deck).filter((i) => i.fr)) : [];
    setCards(list);
    setCard(list[0] ?? null);
    setQueue(list.slice(1));
    setTrail([]);
    setFinished(false);
  }, [deck]);

  const [phase, setPhase] = useState<Phase>("idle");
  // Peek at the French (Dan, 2026-07-15: "a button to see the French words
  // too") — per-card, cleared on advance so the default stays recall-first.
  const [revealed, setRevealed] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<{ grade: Grade; recognized: string } | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const [supported, setSupported] = useState<boolean | null>(null);
  const recRef = useRef<any>(null);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;
  const cardRef = useRef<Item | null>(null);
  cardRef.current = card;

  useEffect(() => {
    const win = window as any;
    setSupported(!!(win.SpeechRecognition || win.webkitSpeechRecognition));
  }, []);

  // Session telemetry (2026-07-15 XP/analytics audit): Say It fed the Reviser
  // and XP but never the teacher Activities panel — WorDrill runs were
  // invisible. Same game.start/game.end pair every other game logs.
  useEffect(() => {
    void logEvent("game.start", { game: "say-it", collectionId });
  }, [collectionId]);
  const endLogged = useRef(false);
  useEffect(() => {
    if (!finished) {
      endLogged.current = false; // Recommencer starts a fresh run
      return;
    }
    if (endLogged.current) return;
    endLogged.current = true;
    void logEvent("game.end", { game: "say-it", collectionId, score: score.ok, total: score.total });
  }, [finished, collectionId, score]);

  const stopRec = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
  }, []);

  const resetTurn = useCallback(() => {
    stopRec();
    setPhase("idle");
    setRevealed(false);
    setTranscript("");
    setResult(null);
  }, [stopRec]);

  // Advance after answering: the current card joins the trail; the next card
  // comes off the queue, or — when the queue is empty — the run ends.
  const next = useCallback(() => {
    resetTurn();
    if (card) setTrail((t) => [...t, { it: card, skipped: false }]);
    if (queue.length > 0) {
      setCard(queue[0]);
      setQueue(queue.slice(1));
    } else {
      setCard(null);
      setFinished(true);
      sfx.stage(); // run complete — the Terminé card is about to show
    }
  }, [card, queue, resetTurn]);

  // Skip = defer this word: move it to the back of the queue (not graded, not
  // counted) and show the next one. It still joins the trail, so Back can
  // return to it. A no-op when nothing else is queued.
  const skip = useCallback(() => {
    if (!card || queue.length === 0) return;
    resetTurn();
    setTrail((t) => [...t, { it: card, skipped: true }]);
    setCard(queue[0]);
    setQueue([...queue.slice(1), card]);
  }, [card, queue, resetTurn]);

  // Back = revisit the previous card, answered or skipped. A skipped card is
  // also waiting at the queue's END — pull that copy out so it can't appear
  // twice; the current card returns to the queue's front either way.
  const back = useCallback(() => {
    if (trail.length === 0) return;
    resetTurn();
    const prev = trail[trail.length - 1];
    setTrail(trail.slice(0, -1));
    setQueue((q) => {
      let rest = q;
      if (prev.skipped) {
        const k = rest.lastIndexOf(prev.it);
        if (k !== -1) rest = [...rest.slice(0, k), ...rest.slice(k + 1)];
      }
      return card ? [card, ...rest] : rest;
    });
    setCard(prev.it);
  }, [trail, card, resetTurn]);

  // End here = stop now and show the summary.
  const endNow = useCallback(() => {
    stopRec();
    setCard(null);
    setFinished(true);
    if (score.total > 0) sfx.stage(); // something was attempted — celebrate the run
  }, [stopRec, score.total]);

  const restart = useCallback(() => {
    const list = shuffle(cards);
    setCards(list);
    setCard(list[0] ?? null);
    setQueue(list.slice(1));
    setTrail([]);
    setScore({ ok: 0, total: 0 });
    setFinished(false);
    setPhase("idle");
    setRevealed(false);
    setTranscript("");
    setResult(null);
  }, [cards]);

  const startListening = useCallback(() => {
    const c = cardRef.current;
    if (!c) return;
    const win = window as any;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;

    setTranscript("");
    setResult(null);
    setPhase("listening");
    recRef.current = rec;

    rec.onresult = (e: any) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setTranscript(t);
    };

    rec.onend = () => {
      recRef.current = null;
      setPhase("result");
      setTranscript((t) => {
        const art = deck ? articleOf(deck, c) : "";
        const expected = frFull(art, c.fr);
        const g = gradeAnswer(t, expected, /^\d+$/.test((c.en ?? "").trim()) ? c.en : undefined);
        const ok = g === "perfect" || g === "good" || g === "homophone";
        // Jingle first, independent of any TTS — short enough not to clash.
        if (ok) sfx.correct(); else sfx.wrong();
        setResult({ grade: g, recognized: t });
        setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
        // Feed the Reviser: a miss (or a partial "close") resurfaces the word;
        // a clean say advances its spacing ladder. Say It items are curated deck
        // items, so their ids line up with the Reviser's review queue.
        if (c.id) recordItemResult(c.id, ok, t, `say-it:${collectionId}`);
        return t;
      });
    };

    rec.onerror = (e: any) => {
      recRef.current = null;
      if (e.error === "no-speech") {
        setPhase("result");
        sfx.wrong();
        setResult({ grade: "miss", recognized: "(rien entendu)" });
        setScore((s) => ({ ...s, total: s.total + 1 }));
        if (c.id) recordItemResult(c.id, false, "(rien entendu)", `say-it:${collectionId}`);
      } else if (e.error === "not-allowed") {
        setPhase("idle");
        alert("Please allow microphone access in your browser.");
      } else {
        setPhase("idle");
      }
    };

    rec.start();
  }, []);

  // Hear the model pronunciation (Dan, 2026-07-15: "offer a button to listen
  // next to Saying it"). Never while the mic is open — the recognizer would
  // transcribe the TTS and grade the browser instead of the learner.
  const listenModel = useCallback(() => {
    const c = cardRef.current;
    if (!c || phaseRef.current === "listening") return;
    speak(deck ? frFull(articleOf(deck, c), c.fr) : c.fr, "fr-FR");
  }, [deck]);

  // Every function has a key (Dan, 2026-07-15): Space drives the mic, and
  // the letters mirror the buttons — R écouter, V voir, S skip, B back,
  // E end. On the RESULT card, standalone runs live inside DrillShell, whose
  // single Enter/Space binding fires Continue — this handler stands down
  // there (a second handler would retry AND advance on the same keypress).
  // Embedded (SioModal) keeps the old Space-retry / Enter-next pair.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = phaseRef.current;
      const k = e.key.toLowerCase();
      if (e.key === " " && p === "listening") { e.preventDefault(); stopRec(); return; }
      if (e.key === " " && (p !== "result" || embedded)) { e.preventDefault(); startListening(); return; }
      if (e.key === "Enter" && p === "result" && embedded) next();
      if (p === "listening") return; // no side actions while the mic is open
      if (k === "r") listenModel();
      if (k === "v") setRevealed((r) => !r);
      if (k === "s") skip();
      if (k === "b") back();
      if (k === "e") endNow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startListening, stopRec, next, listenModel, skip, back, endNow, embedded]);

  const answered = trail.filter((t) => !t.skipped).length;
  const ui = result ? GRADE_UI[result.grade] : null;
  const isCorrect = result?.grade === "perfect" || result?.grade === "good" || result?.grade === "homophone";

  // Embedded = floating inside the SIO popup (the unit page stays visible
  // behind); standalone = DrillShell (patch 20–21), which owns progress,
  // the score, the result tray and Continue.
  const wrap = (body: React.ReactNode) =>
    embedded ? (
      <>{body}</>
    ) : (
      <DrillShell
        exitHref={drillExitHref(collectionId)}
        progress={finished ? null : { done: answered, total: cards.length }}
        right={
          <>
            ✓ {score.ok}/{score.total}
            {score.total > 0 && ` (${Math.round((score.ok / score.total) * 100)}%)`}
          </>
        }
        cta={finished ? { label: "🔁 Restart", onClick: restart } : null}
        feedback={
          !finished && phase === "result" && result && ui && card
            ? {
                kind: isCorrect ? "correct" : "wrong",
                body: (
                  <>
                    {ui.icon} {ui.label}
                    <span className="ml-2 font-medium">&ldquo;{result.recognized || "—"}&rdquo;</span>
                    <span className="ml-2">
                      →{" "}
                      <span lang="fr" className="font-black">
                        {deck ? frFull(articleOf(deck, card), card.fr) : card.fr}
                      </span>
                    </span>
                    <button type="button" onClick={listenModel} className="ml-2 align-middle text-base opacity-70 hover:opacity-100" aria-label="Listen" title="Listen (R)">🔊</button>
                    <button type="button" onClick={startListening} className="ml-3 rounded-full border-2 border-current px-2 py-0.5 text-xs font-bold" title="Try again">
                      🎤 Try again
                    </button>
                  </>
                ),
                cta: { label: "Continue", onClick: next },
              }
            : null
        }
      >
        {body}
      </DrillShell>
    );

  if (!deck) {
    return wrap(<p className="py-16 text-center text-[color:var(--cahier-ink-soft)]">Deck not found.</p>);
  }

  if (supported === false) {
    return wrap(
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="text-3xl mb-3">🎤</p>
          <h1 className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)] mb-2">
            Speech recognition not available
          </h1>
          <p className="text-sm text-[color:var(--fluo-ink-soft)] mb-4">
            WorDrill requires Chrome or Edge. Please open this page in one of those browsers.
          </p>
          {!deckOverride && (
            <Link href={`/practice/flip-it/${collectionId}`} className="fluo-btn">
              Use Flip It instead
            </Link>
          )}
        </div>,
    );
  }

  return wrap(
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-4 text-center">
          <p className="fluo-label">{deck.title}</p>
          {embedded && !finished && card && (
            <p className="text-xs text-[color:var(--fluo-ink-soft)]">{answered + 1} / {cards.length}</p>
          )}
        </div>

        {/* Progress bar — DrillShell draws its own; only the popup needs one */}
        {embedded && (
          <div className="h-1.5 rounded-full bg-[color:var(--fluo-line)] mb-6 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${cards.length ? ((finished ? cards.length : answered) / cards.length) * 100 : 0}%` }}
            />
          </div>
        )}

        {finished && (
          <div className="cahier-sheet rounded-2xl p-8 text-center shadow-md">
            <p className="mb-2 text-4xl">🎉</p>
            <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">Done!</h1>
            <p className="mt-2 text-sm text-[color:var(--fluo-ink-soft)]">
              You said {score.total} {score.total === 1 ? "word" : "words"}
              {score.total > 0 && <> · ✓ {score.ok} ({Math.round((score.ok / score.total) * 100)}%)</>}.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {embedded && <button type="button" onClick={restart} className="fluo-btn fluo-btn-sm">🔁 Restart</button>}
              <Link href="/reviser" className="fluo-btn fluo-btn-sm fluo-btn-ghost">🔁 DéjàRevu</Link>
              {embedded && <Link href="/" className="fluo-btn fluo-btn-sm fluo-btn-ghost">← Back to the path</Link>}
            </div>
          </div>
        )}

        {!finished && card && (
          <div className="cahier-sheet rounded-2xl p-6 shadow-md">
            {/* Prompt */}
            <div className="mb-6 text-center">
              {card.emoji && <span className="text-5xl mb-2 block">{card.emoji}</span>}
              <p className="text-xs text-[color:var(--cahier-ink-soft)] mb-1 uppercase tracking-wide">
                Say in French:
              </p>
              <p className="fluo-serif text-2xl font-black text-[color:var(--cahier-ink)]">
                {card.en}
              </p>
              {card.note && (
                <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">{card.note}</p>
              )}
              {revealed && phase !== "result" && (
                <p lang="fr" className="cahier-hl mx-auto mt-2 inline-block rounded-sm px-2 fluo-serif text-xl font-black text-[color:var(--cahier-ink)]">
                  {frFull(articleOf(deck, card), card.fr)}
                </p>
              )}
            </div>

            {/* Mic button — with a listen button beside it (Dan, 2026-07-15),
                hidden while the mic is open so TTS can't grade itself. */}
            {phase !== "result" && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4">
                  {phase === "idle" && (
                    <button
                      type="button"
                      onClick={listenModel}
                      className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[color:var(--cahier-ink)]/25 bg-white text-xl shadow-md transition-all hover:border-[color:var(--cahier-ink)] active:scale-95"
                      aria-label="Listen"
                      title="Listen (R)"
                    >
                      🔊
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={phase === "idle" ? startListening : stopRec}
                    className={[
                      "flex h-20 w-20 items-center justify-center rounded-full text-3xl",
                      "shadow-lg transition-all active:scale-95",
                      phase === "listening"
                        ? "bg-rose-500 text-white ring-4 ring-rose-300 animate-pulse"
                        : "bg-[var(--fluo-hl)] text-[color:var(--fluo-ink)] hover:brightness-95",
                    ].join(" ")}
                    aria-label={phase === "listening" ? "Stop" : "Start speaking"}
                  >
                    {phase === "listening" ? "⏹" : "🎤"}
                  </button>
                  {/* 👁 mirrors the 🔊, keeping the mic centred (Dan,
                      2026-07-15: "a button to see the French words too") */}
                  {phase === "idle" && (
                    <button
                      type="button"
                      onClick={() => setRevealed((r) => !r)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 text-xl shadow-md transition-all active:scale-95 ${
                        revealed
                          ? "border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)]"
                          : "border-[color:var(--cahier-ink)]/25 bg-white hover:border-[color:var(--cahier-ink)]"
                      }`}
                      aria-label="Show the word"
                      title="Show (V)"
                    >
                      🔤
                    </button>
                  )}
                </div>
                <p className="text-sm text-[color:var(--cahier-ink-soft)]">
                  {phase === "listening" ? "Listening… (tap to stop)" : "Tap to speak"}
                </p>
                {phase === "listening" && transcript && (
                  <p className="text-base text-[color:var(--cahier-ink)] font-medium italic">
                    &ldquo;{transcript}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Result — inline only in the popup; DrillShell's tray owns it
                on the standalone page */}
            {embedded && phase === "result" && result && ui && (
              <div className={`rounded-xl border-2 p-4 ${ui.cls}`}>
                <p className="font-black text-lg mb-2">{ui.icon} {ui.label}</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-bold">You said: </span>
                    <span className="italic">&ldquo;{result.recognized || "—"}&rdquo;</span>
                  </div>
                  <div>
                    <span className="font-bold">Expected: </span>
                    <span lang="fr" className={`font-black ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                      {deck ? frFull(articleOf(deck, card), card.fr) : card.fr}
                    </span>
                    <button type="button" onClick={listenModel} className="ml-2 align-middle text-base" aria-label="Listen" title="Listen (R)">
                      🔊
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={startListening} className="fluo-btn fluo-btn-sm fluo-btn-ghost">
                    🎤 Try again
                  </button>
                  <button type="button" onClick={next} className="fluo-btn fluo-btn-sm">
                    Next →
                  </button>
                </div>
              </div>
            )}
            {!embedded && phase === "result" && card && (
              /* The word, restated large while the tray shows the verdict —
                 the learner should study the target, not the toolbar. */
              <p lang="fr" className="text-center fluo-serif text-2xl font-black text-[color:var(--cahier-ink)]">
                {deck ? frFull(articleOf(deck, card), card.fr) : card.fr}
              </p>
            )}
          </div>
        )}

        {!finished && card && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={back}
              disabled={trail.length === 0}
              className="fluo-btn fluo-btn-sm fluo-btn-ghost disabled:opacity-40"
              title="Back (B)"
            >
              ⏮ Back
            </button>
            <button
              type="button"
              onClick={skip}
              disabled={queue.length === 0}
              className="fluo-btn fluo-btn-sm fluo-btn-ghost disabled:opacity-40"
              title="Defer this word to the end (S)"
            >
              ⤼ Skip
            </button>
            <button type="button" onClick={endNow} className="fluo-btn fluo-btn-sm fluo-btn-ghost" title="End here (E)">
              ⏹ End here
            </button>
          </div>
        )}

        {/* Keyboard legend: keyboards live above sm — a phone renders 8
            shortcuts it cannot press (patch 20–21). */}
        {!finished && card && (
          <p className="mt-4 hidden text-center text-xs text-[color:var(--fluo-ink-soft)] sm:block">
            Space = 🎤 / stop / retry · Enter = next · R = 🔊 · V = 🔤 · S = skip · B = back · E = end
          </p>
        )}
      </div>,
  );
}
