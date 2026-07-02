"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import CahierShell, { deckActivityTabs, withActive } from "@/components/CahierShell";
import type { Item } from "@/lib/collections/schema";

type Phase = "idle" | "listening" | "result";
type Grade = "perfect" | "good" | "close" | "miss";

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

function gradeAnswer(recognized: string, expected: string, expectedAlt?: string): Grade {
  const nr = normalize(recognized);
  const ne = normalize(expected);
  if (!nr) return "miss";
  if (nr === ne) return "perfect";
  if (deaccent(nr) === deaccent(ne)) return "good";
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
  close: { icon: "🟡", label: "Presque !", cls: "text-amber-700 bg-amber-50 border-amber-300" },
  miss: { icon: "❌", label: "Pas tout à fait…", cls: "text-rose-700 bg-rose-50 border-rose-300" },
};

export default function SayItContent({ collectionId }: { collectionId: string }) {
  const deck = CURATED.find((c) => c.id === collectionId);

  // Shuffle on mount only — shuffling during render breaks SSR hydration
  // (the AGENTS/handoff "no Math.random() during render" rule).
  const [cards, setCards] = useState<Item[]>([]);
  useEffect(() => {
    setCards(deck ? shuffle(deck.items.filter((i) => i.fr)) : []);
  }, [deck]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<{ grade: Grade; recognized: string } | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const [supported, setSupported] = useState<boolean | null>(null);
  const recRef = useRef<any>(null);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;
  const cardRef = useRef(cards[0]);

  useEffect(() => {
    const win = window as any;
    setSupported(!!(win.SpeechRecognition || win.webkitSpeechRecognition));
  }, []);

  const card = cards[index];
  cardRef.current = card;

  const stopRec = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
  }, []);

  const next = useCallback(() => {
    stopRec();
    setIndex((i) => (i + 1) % cards.length);
    setPhase("idle");
    setTranscript("");
    setResult(null);
  }, [cards.length, stopRec]);

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
        const g = gradeAnswer(t, c.fr, /^\d+$/.test((c.en ?? "").trim()) ? c.en : undefined);
        setResult({ grade: g, recognized: t });
        setScore((s) => ({ ok: s.ok + (g === "perfect" || g === "good" ? 1 : 0), total: s.total + 1 }));
        return t;
      });
    };

    rec.onerror = (e: any) => {
      recRef.current = null;
      if (e.error === "no-speech") {
        setPhase("result");
        setResult({ grade: "miss", recognized: "(rien entendu)" });
        setScore((s) => ({ ...s, total: s.total + 1 }));
      } else if (e.error === "not-allowed") {
        setPhase("idle");
        alert("Veuillez autoriser l'accès au microphone dans votre navigateur.");
      } else {
        setPhase("idle");
      }
    };

    rec.start();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const p = phaseRef.current;
      if (e.key === " " && p === "idle") { e.preventDefault(); startListening(); }
      if (e.key === " " && p === "listening") { e.preventDefault(); stopRec(); }
      if (e.key === "Enter" && p === "result") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [startListening, stopRec, next]);

  const tabs = withActive(deckActivityTabs(collectionId), "say");

  if (!deck) {
    return (
      <CahierShell tabs={tabs} active="say" crumb="🎤 Say It">
        <p className="py-16 text-center text-[color:var(--cahier-ink-soft)]">Deck not found.</p>
      </CahierShell>
    );
  }

  if (supported === false) {
    return (
      <CahierShell tabs={tabs} active="say" crumb="🎤 Say It">
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="text-3xl mb-3">🎤</p>
          <h1 className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)] mb-2">
            Speech recognition not available
          </h1>
          <p className="text-sm text-[color:var(--fluo-ink-soft)] mb-4">
            Say It requires Chrome or Edge. Please open this page in one of those browsers.
          </p>
          <Link href={`/practice/flip-it/${collectionId}`} className="fluo-btn">
            Use Flip It instead
          </Link>
        </div>
      </CahierShell>
    );
  }

  const ui = result ? GRADE_UI[result.grade] : null;
  const isCorrect = result?.grade === "perfect" || result?.grade === "good";

  return (
    <CahierShell
      tabs={tabs}
      active="say"
      crumb="🎤 Say It"
      topRight={
        <span className="fluo-mono text-sm font-bold text-[color:var(--cahier-ink)]">
          {score.ok}/{score.total}
          {score.total > 0 && ` (${Math.round((score.ok / score.total) * 100)}%)`}
        </span>
      }
    >
      <div className="mx-auto max-w-2xl px-4 py-4">
        <div className="mb-4 text-center">
          <p className="fluo-label">{deck.title}</p>
          <p className="text-xs text-[color:var(--fluo-ink-soft)]">{index + 1} / {cards.length}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full bg-[color:var(--fluo-line)] mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${((index + 1) / cards.length) * 100}%` }}
          />
        </div>

        {card && (
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
            </div>

            {/* Mic button */}
            {phase !== "result" && (
              <div className="flex flex-col items-center gap-3">
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
                      {card.fr}
                    </span>
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

        <p className="mt-4 text-center text-xs text-[color:var(--fluo-ink-soft)]">
          Space = speak / stop · Enter = next card
        </p>
      </div>
    </CahierShell>
  );
}
