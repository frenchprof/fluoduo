"use client";

/**
 * ÉcouTexte — the listening scaffold (Dan, 2026-07-28: "the purpose is to
 * scaffold them in their listening… they should be allowed to replay, pause,
 * and reveal the entire sentences").
 *
 * Audio comes first: the text is generated hidden, one dash per letter, and
 * the learner listens as many times as they want before revealing anything.
 * Every control is a playback control — whole text, one sentence, slow, pause,
 * resume — because the work here IS the listening, and reading is the reward.
 *
 * The generator never repeats a sentence: every sentence played is logged
 * (lib/textgen/heard) and the next draw rejects any text that would replay
 * one. When a unit's combinations are genuinely spent the page says so and
 * offers to clear the log rather than quietly repeating.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { pauseSpeech, resumeSpeech, speak, speakSequence } from "@/games/letris/speech";
import { fingerprint, generateUnheard } from "@/lib/textgen/engine";
import { clearHeard, loadHeard, saveHeard } from "@/lib/textgen/heard";
import { MAX_SENTENCES, type MiniText, type UnitTextGen } from "@/lib/textgen/types";

const SLOW_RATE = 0.6;
/** A beat between sentences long enough to hear the sentence boundary. */
const GAP_MS = 700;

const LENGTHS = Array.from({ length: MAX_SENTENCES }, (_, i) => i + 1);

/** One ▁ per letter — word shapes are a listening scaffold, not a spoiler. */
function mask(fr: string): string[] {
  return fr.split(/\s+/).map((w) => "▁".repeat(Math.max(1, w.replace(/[.,!?;:«»]/g, "").length)));
}

export default function EcouTexte({ gen, accent }: { gen: UnitTextGen; accent: string }) {
  const [count, setCount] = useState(3);
  const [text, setText] = useState<MiniText | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [showEn, setShowEn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  // The heard-log is read on first use, not on mount: localStorage is a
  // client-only source and the first text must not be drawn during SSR, or
  // the server would ship one random text and the client hydrate another.
  const heardRef = useRef<Set<string> | null>(null);
  const loggedRef = useRef(false);
  const stopRef = useRef<null | (() => void)>(null);

  const heard = useCallback(() => {
    if (!heardRef.current) heardRef.current = loadHeard(gen.unit);
    return heardRef.current;
  }, [gen.unit]);

  /** Draw a text AND return it, so a handler can draw-then-play in one tap. */
  const draw = useCallback(
    (n: number): MiniText => {
      stopRef.current?.();
      setPlaying(false);
      setPaused(false);
      const { text: next, fresh } = generateUnheard(gen, { sentences: n, heard: heard() });
      setText(next);
      setExhausted(!fresh);
      setRevealed(next.sentences.map(() => false));
      setShowEn(false);
      loggedRef.current = false;
      return next;
    },
    [gen, heard],
  );

  useEffect(() => () => stopRef.current?.(), []);

  /** Playing a text spends it: from here on it can never be drawn again. */
  function logHeard(t: MiniText) {
    if (loggedRef.current) return;
    loggedRef.current = true;
    const set = heard();
    for (const s of t.sentences) set.add(fingerprint(s.fr));
    saveHeard(gen.unit, set);
  }

  function playAll(slow: boolean) {
    // First tap draws as well as plays — one button, no empty state to explain.
    const t = text ?? draw(count);
    logHeard(t);
    stopRef.current?.();
    setPaused(false);
    setPlaying(true);
    stopRef.current = speakSequence(
      t.sentences.map((s) => ({ text: s.fr })),
      "fr-FR",
      { rate: slow ? SLOW_RATE : undefined, gapMs: GAP_MS, onDone: () => setPlaying(false) },
    );
  }

  function playOne(fr: string, slow = false) {
    if (text) logHeard(text);
    stopRef.current?.();
    setPlaying(false);
    setPaused(false);
    speak(fr, "fr-FR", { rate: slow ? SLOW_RATE : undefined, analytic: "sentence" });
  }

  function togglePause() {
    if (paused) {
      resumeSpeech();
      setPaused(false);
    } else {
      pauseSpeech();
      setPaused(true);
    }
  }

  // Revealing spends the text too: read once is met once, and meeting it
  // again as a listening exercise would no longer be listening.
  function reveal(i: number) {
    if (text) logHeard(text);
    setRevealed((r) => r.map((v, k) => (k === i ? true : v)));
  }

  function revealAll() {
    if (!text) return;
    logHeard(text);
    setRevealed((r) => r.map(() => true));
  }

  function resetHeard() {
    clearHeard(gen.unit);
    heardRef.current = new Set();
    draw(count);
  }

  const allRevealed = revealed.length > 0 && revealed.every(Boolean);

  return (
    <div className="space-y-3">
      {/* How many sentences. */}
      <div className="flex flex-wrap items-center gap-1.5">
        {LENGTHS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setCount(n);
              draw(n);
            }}
            className={`fluo-btn fluo-btn-sm ${count === n ? "" : "fluo-btn-ghost"}`}
            style={count === n ? { background: accent, color: "#fff", boxShadow: `0 4px 0 0 ${accent}99` } : undefined}
            aria-pressed={count === n}
          >
            {n}
          </button>
        ))}
        <button type="button" onClick={() => draw(count)} className="fluo-btn fluo-btn-sm fluo-btn-secondary ml-auto">
          🎲 Un autre
        </button>
      </div>

      {/* Playback. */}
      <div
        className="flex flex-wrap items-center gap-2 rounded-2xl border-2 px-3 py-3"
        style={{ borderColor: accent, background: "var(--fluo-card-tint)" }}
      >
        <button type="button" onClick={() => playAll(false)} className="fluo-btn">
          {playing ? "🔁 Réécouter" : "🎧 Écouter"}
        </button>
        <button type="button" onClick={() => playAll(true)} title="Écouter lentement" className="fluo-btn fluo-btn-sm">
          🐌
        </button>
        <button
          type="button"
          onClick={togglePause}
          disabled={!playing}
          title={paused ? "Reprendre" : "Pause"}
          className="fluo-btn fluo-btn-sm"
        >
          {paused ? "▶" : "⏸"}
        </button>
        <button
          type="button"
          onClick={revealAll}
          disabled={!text || allRevealed}
          className="fluo-btn fluo-btn-sm fluo-btn-ghost ml-auto"
        >
          👁 Tout révéler
        </button>
        <button
          type="button"
          onClick={() => setShowEn((v) => !v)}
          aria-pressed={showEn}
          className={`fluo-btn fluo-btn-sm ${showEn ? "fluo-btn-correct" : "fluo-btn-ghost"}`}
        >
          🇬🇧
        </button>
      </div>

      {/* The text. Each row plays its own sentence; the eye opens it. */}
      <ol className="space-y-2">
        {(text?.sentences ?? []).map((s, i) => (
          <li
            key={i}
            className="flex items-stretch gap-1.5 rounded-2xl border-2 px-3 py-2"
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card)" }}
          >
            <button
              type="button"
              onClick={() => playOne(s.fr)}
              title="Écouter cette phrase"
              className="min-w-0 flex-1 text-left transition hover:brightness-95"
            >
              {revealed[i] ? (
                <span lang="fr" className="fluo-serif text-base font-bold text-[color:var(--fluo-ink)]">
                  🔊 {s.fr}
                </span>
              ) : (
                <span className="fluo-serif text-base font-bold tracking-wider text-[color:var(--fluo-ink)]/45">
                  🔊 {mask(s.fr).join(" ")}
                </span>
              )}
              {revealed[i] && showEn && (
                <span className="mt-0.5 block text-xs text-[color:var(--fluo-ink-soft)]">{s.en}</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => playOne(s.fr, true)}
              title="Écouter lentement"
              className="self-center rounded-full border-2 px-1.5 py-0.5 text-sm transition hover:bg-white/60"
              style={{ borderColor: "var(--fluo-card-accent)" }}
            >
              🐌
            </button>
            <button
              type="button"
              onClick={() => reveal(i)}
              disabled={revealed[i]}
              title="Révéler cette phrase"
              className="self-center rounded-full border-2 px-1.5 py-0.5 text-sm transition hover:bg-white/60 disabled:opacity-30"
              style={{ borderColor: "var(--fluo-card-accent)" }}
            >
              👁
            </button>
          </li>
        ))}
      </ol>

      {exhausted && (
        <button
          type="button"
          onClick={resetHeard}
          className="fluo-btn fluo-btn-sm fluo-btn-ghost w-full"
          style={{ borderColor: accent }}
        >
          ♻️ Tout est déjà écouté — recommencer
        </button>
      )}
    </div>
  );
}
