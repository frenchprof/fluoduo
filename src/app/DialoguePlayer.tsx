"use client";

/**
 * The atelier mini-dialogue player (Dan, 2026-07-02). Two ways to hear it:
 *   • "▶ Play all" reads the whole dialogue back-to-back, each line in its
 *     speaker's voice (A female, B male — pitch cue in speech.ts).
 *   • Tapping any single line plays just that line.
 * The English shows muted under each line. Not a test — a model to read, hear,
 * then perform in class.
 */

import { useEffect, useRef, useState } from "react";
import { speak, speakSequence } from "@/games/letris/speech";
import type { DialogueLine } from "@/content/ateliers";

export default function DialoguePlayer({ lines }: { lines: DialogueLine[] }) {
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef<null | (() => void)>(null);

  // Cancel any in-flight playback when the dialogue closes/unmounts.
  useEffect(() => () => stopRef.current?.(), []);

  function playAll() {
    if (playing) {
      stopRef.current?.();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    const parts = lines.map((l) => ({ text: l.say ?? l.fr, gender: l.who === "A" ? ("f" as const) : ("m" as const) }));
    // speakSequence resolves nothing on completion, so mark done on the last
    // line's utterance by polling the synth queue via a short tail timer isn't
    // reliable; instead we let the stop() reset state and flip on a best-effort
    // timeout proportional to the text length.
    stopRef.current = speakSequence(parts);
    const approxMs = parts.reduce((n, p) => n + p.text.length * 90 + 400, 0);
    window.setTimeout(() => setPlaying(false), approxMs);
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={playAll}
        className={`fluo-btn fluo-btn-sm ${playing ? "fluo-btn-correct" : ""}`}
      >
        {playing ? "⏹ Stop" : "▶ Play all"}
      </button>

      {lines.map((line, i) => {
        const mine = line.who === "A";
        return (
          <div key={i} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
            <button
              type="button"
              onClick={() => speak(line.say ?? line.fr, "fr-FR", { gender: mine ? "f" : "m" })}
              title="Play this line"
              className="max-w-[85%] rounded-2xl border-2 px-3 py-2 text-left transition hover:brightness-95"
              style={{
                borderColor: "var(--fluo-card-accent)",
                background: mine ? "var(--fluo-card-tint)" : "var(--fluo-card)",
              }}
            >
              <span lang="fr" className="fluo-serif text-base font-bold text-[color:var(--fluo-ink)]">
                🔊 {line.fr}
              </span>
              <span className="mt-0.5 block text-xs text-[color:var(--fluo-ink-soft)]">{line.en}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
