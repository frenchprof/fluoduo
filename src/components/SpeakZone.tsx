"use client";

/**
 * Tap-to-hear delegation for lesson content (Dan, 2026-07-08: every lesson's
 * phrases should be tappable for TTS, like the pretest pills). Wraps a Mémo /
 * Lire block; a tap on any French bit speaks it — no per-lesson wiring:
 *   1. nearest [lang="fr"] element (pill spans, bold patterns, table cells) —
 *      when its text is short enough to be a phrase, not a whole table;
 *   2. else the enclosing line/cell, speaking the French half of a
 *      « phrase — gloss » line.
 * Real controls inside (buttons, links, inputs) keep their own behaviour.
 */
import type { ReactNode } from "react";
import { speak } from "@/games/letris/speech";

export default function SpeakZone({ children }: { children: ReactNode }) {
  return (
    <div
      className="speak-zone"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("a, button, input, select, textarea, audio, video")) return;
        const fr = target.closest<HTMLElement>('[lang="fr"]');
        const frText = fr?.textContent?.trim() ?? "";
        if (fr && frText && frText.length <= 80) {
          speak(frText, "fr-FR");
          return;
        }
        const row = target.closest<HTMLElement>("li, td, th, p");
        const rowText = row?.textContent?.trim() ?? "";
        if (rowText && rowText.length <= 160) {
          // « French — English gloss » lines: speak only the French half.
          speak(rowText.split("—")[0].trim(), "fr-FR");
        }
      }}
    >
      {children}
    </div>
  );
}
