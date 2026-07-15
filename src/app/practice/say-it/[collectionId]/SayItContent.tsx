"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { logEvent } from "@/lib/firebase/usage";
import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import { practiceItems } from "@/lib/collections/display";
import { recordItemResult } from "@/lib/progress";
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

function normalize(s: string) {
  return s
    .toLowerCase()
    .trim()
    // hyphens → space so "dix-sept" matches a spoken "dix sept"
    .replace(/[-–—]/g, " ")
    .replace(/[.,!?;:'"«»()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deaccent(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** SPEECH-only tolerance: French silent endings make "il s'appelle" and
 *  "ils s'appellent" perfect homophones — the recognizer picks a spelling,
 *  and the learner must never be penalized for its choice (Dan, 2026-07-05).
 *  Word pairs are equal when they differ only by a silent -s / -x / -nt. */
function silentEq(a: string, b: string): boolean {
  if (a === b) return true;
  const grows = (x: string, y: string) => y === `${x}s` || y === `${x}x` || y === `${x}nt`;
  return grows(a, b) || grows(b, a);
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
  good: { icon: "✅", label: "Bien ! (accent différent)", cls: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  homophone: { icon: "✅", label: "Parfait ! (même prononciation)", cls: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  close: { icon: "🟡", label: "Presque !", cls: "text-amber-700 bg-amber-50 border-amber-300" },
  miss: { icon: "❌", label: "Pas tout à fait…", cls: "text-rose-700 bg-rose-50 border-rose-300" },
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
  // screen; `queue` is what's still ahead; `history` is what's behind (drives
  // Back and the progress count). Skip defers the current word to the end of
  // the queue; End here jumps straight to the summary.
  const [cards, setCards] = useState<Item[]>([]); // stable deck order (mount shuffle)
  const [card, setCard] = useState<Item | null>(null);
  const [queue, setQueue] = useState<Item[]>([]);
  const [history, setHistory] = useState<Item[]>([]);
  const [finished, setFinished] = useState(false);

  // Shuffle on mount only — shuffling during render breaks SSR hydration
  // (the AGENTS/handoff "no Math.random() during render" rule).
  useEffect(() => {
    const list = deck ? shuffle(practiceItems(deck).filter((i) => i.fr)) : [];
    setCards(list);
    setCard(list[0] ?? null);
    setQueue(list.slice(1));
    setHistory([]);
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

  // Advance after answering: the current card joins history; the next card
  // comes off the queue, or — when the queue is empty — the run ends.
  const next = useCallback(() => {
    resetTurn();
    if (card) setHistory((h) => [...h, card]);
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
  // counted) and show the next one. A no-op when nothing else is queued.
  const skip = useCallback(() => {
    if (!card || queue.length === 0) return;
    resetTurn();
    setCard(queue[0]);
    setQueue([...queue.slice(1), card]);
  }, [card, queue, resetTurn]);

  // Back = revisit the previous card: pop history, push the current card back
  // to the front of the queue.
  const back = useCallback(() => {
    if (history.length === 0) return;
    resetTurn();
    const prev = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setQueue((q) => (card ? [card, ...q] : q));
    setCard(prev);
  }, [history, card, resetTurn]);

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
    setHistory([]);
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
        if (c.id) recordItemResult(c.id, ok, t);
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
        if (c.id) recordItemResult(c.id, false, "(rien entendu)");
      } else if (e.error === "not-allowed") {
        setPhase("idle");
        alert("Veuillez autoriser l'accès au microphone dans votre navigateur.");
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

  // Every function has a key (Dan, 2026-07-15): Space drives the mic (and
  // retries from the result card), Enter advances, and the letters mirror
  // the buttons — R écouter, V voir, S skip, B back, E end.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = phaseRef.current;
      const k = e.key.toLowerCase();
      if (e.key === " " && p === "listening") { e.preventDefault(); stopRec(); return; }
      if (e.key === " ") { e.preventDefault(); startListening(); return; } // idle start + result retry
      if (e.key === "Enter" && p === "result") next();
      if (p === "listening") return; // no side actions while the mic is open
      if (k === "r") listenModel();
      if (k === "v") setRevealed((r) => !r);
      if (k === "s") skip();
      if (k === "b") back();
      if (k === "e") endNow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startListening, stopRec, next, listenModel, skip, back, endNow]);

  const tabs = withActive(deckActivityTabs(collectionId), "say");
  // Embedded = floating inside the SIO popup (the unit page stays visible
  // behind); the standalone page keeps the full CahierShell chrome.
  const wrap = (body: React.ReactNode, topRight?: React.ReactNode) =>
    embedded ? <>{body}</> : (
      <CahierShell tabs={tabs} active="say" crumb="🎤 Say It" topRight={topRight}>{body}</CahierShell>
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
            Say It requires Chrome or Edge. Please open this page in one of those browsers.
          </p>
          {!deckOverride && (
            <Link href={`/practice/flip-it/${collectionId}`} className="fluo-btn">
              Use Flip It instead
            </Link>
          )}
        </div>,
    );
  }

  const ui = result ? GRADE_UI[result.grade] : null;
  const isCorrect = result?.grade === "perfect" || result?.grade === "good" || result?.grade === "homophone";

  return wrap(
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-4 text-center">
          <p className="fluo-label">{deck.title}</p>
          {!finished && card && (
            <p className="text-xs text-[color:var(--fluo-ink-soft)]">{history.length + 1} / {cards.length}</p>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[color:var(--fluo-line)] mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${cards.length ? ((finished ? cards.length : history.length) / cards.length) * 100 : 0}%` }}
          />
        </div>

        {finished && (
          <div className="cahier-sheet rounded-2xl p-8 text-center shadow-md">
            <p className="mb-2 text-4xl">🎉</p>
            <h1 className="fluo-serif text-2xl font-black text-[color:var(--fluo-ink)]">Terminé ! <span className="text-lg font-bold text-[color:var(--fluo-ink-soft)]">· Done!</span></h1>
            <p className="mt-2 text-sm text-[color:var(--fluo-ink-soft)]">
              You said {score.total} {score.total === 1 ? "word" : "words"}
              {score.total > 0 && <> · ✓ {score.ok} ({Math.round((score.ok / score.total) * 100)}%)</>}.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={restart} className="fluo-btn fluo-btn-sm">🔁 Recommencer</button>
              <Link href="/reviser" className="fluo-btn fluo-btn-sm fluo-btn-ghost">🔁 Réviser</Link>
              <Link href="/" className="fluo-btn fluo-btn-sm fluo-btn-ghost">← Back to the path</Link>
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
                      aria-label="Écouter"
                      title="Écouter (R)"
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
                      aria-label="Voir le mot"
                      title="Voir (V)"
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

            {/* Result */}
            {phase === "result" && result && ui && (
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
                    <button type="button" onClick={listenModel} className="ml-2 align-middle text-base" aria-label="Écouter" title="Écouter (R)">
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
          </div>
        )}

        {!finished && card && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={back}
              disabled={history.length === 0}
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

        {!finished && card && (
          <p className="mt-4 text-center text-xs text-[color:var(--fluo-ink-soft)]">
            Space = 🎤 / stop / retry · Enter = next · R = 🔊 · V = 🔤 · S = skip · B = back · E = end
          </p>
        )}
      </div>,
    <span className="fluo-mono text-sm font-bold text-[color:var(--cahier-ink)]">
      {score.ok}/{score.total}
      {score.total > 0 && ` (${Math.round((score.ok / score.total) * 100)}%)`}
    </span>,
  );
}
