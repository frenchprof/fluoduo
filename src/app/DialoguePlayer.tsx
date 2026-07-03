"use client";

/**
 * The atelier mini-dialogue player (Dan, 2026-07-02). Two ways to hear it:
 *   • "▶ Play all" reads the whole dialogue back-to-back, each line in its
 *     speaker's voice (A female, B male — pitch cue in speech.ts).
 *   • Tapping any single line plays just that line.
 * Every playback control also has a 🐌 twin (Dan, 2026-07-03) that plays the
 * same thing at a slow rate — for catching each syllable before performing.
 * The English shows muted under each line. Not a test — a model to read, hear,
 * then perform in class.
 */

import { useEffect, useRef, useState } from "react";
import { speak, speakSequence } from "@/games/letris/speech";
import type { DialogueLine } from "@/content/ateliers";

const SLOW_RATE = 0.6;

export default function DialoguePlayer({ lines }: { lines: DialogueLine[] }) {
  const [playing, setPlaying] = useState<false | "normal" | "slow">(false);
  const stopRef = useRef<null | (() => void)>(null);

  // Cancel any in-flight playback when the dialogue closes/unmounts.
  useEffect(() => () => stopRef.current?.(), []);

  function playAll(slow: boolean) {
    const mode = slow ? "slow" : "normal";
    if (playing) {
      const wasSame = playing === mode;
      stopRef.current?.();
      setPlaying(false);
      if (wasSame) return; // same button = stop; the other button = switch speed
    }
    setPlaying(mode);
    const parts = lines.map((l) => ({ text: l.say ?? l.fr, gender: l.who === "A" ? ("f" as const) : ("m" as const) }));
    stopRef.current = speakSequence(parts, "fr-FR", { rate: slow ? SLOW_RATE : undefined });
    // speakSequence has no done-callback; reset the button on a best-effort
    // timeout proportional to the text length (longer when slowed).
    const perChar = slow ? 150 : 90;
    const approxMs = parts.reduce((n, p) => n + p.text.length * perChar + 400, 0);
    window.setTimeout(() => setPlaying(false), approxMs);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => playAll(false)}
          className={`fluo-btn fluo-btn-sm ${playing === "normal" ? "fluo-btn-correct" : ""}`}
        >
          {playing === "normal" ? "⏹ Stop" : "▶ Play all"}
        </button>
        <button
          type="button"
          onClick={() => playAll(true)}
          title="Play all, slowly"
          className={`fluo-btn fluo-btn-sm ${playing === "slow" ? "fluo-btn-correct" : ""}`}
        >
          {playing === "slow" ? "⏹ Stop" : "🐌 Play all"}
        </button>
      </div>

      {lines.map((line, i) => {
        const mine = line.who === "A";
        const gender = mine ? ("f" as const) : ("m" as const);
        return (
          <div key={i} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
            <div
              className="flex max-w-[85%] items-stretch gap-1.5 rounded-2xl border-2 px-3 py-2 transition"
              style={{
                borderColor: "var(--fluo-card-accent)",
                background: mine ? "var(--fluo-card-tint)" : "var(--fluo-card)",
              }}
            >
              <button
                type="button"
                onClick={() => speak(line.say ?? line.fr, "fr-FR", { gender })}
                title="Play this line"
                className="text-left transition hover:brightness-95"
              >
                <span lang="fr" className="fluo-serif text-base font-bold text-[color:var(--fluo-ink)]">
                  🔊 {line.fr}
                </span>
                <span className="mt-0.5 block text-xs text-[color:var(--fluo-ink-soft)]">{line.en}</span>
              </button>
              <button
                type="button"
                onClick={() => speak(line.say ?? line.fr, "fr-FR", { gender, rate: SLOW_RATE })}
                title="Play this line, slowly"
                className="self-center rounded-full border-2 px-1.5 py-0.5 text-sm transition hover:bg-white/60"
                style={{ borderColor: "var(--fluo-card-accent)" }}
              >
                🐌
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
