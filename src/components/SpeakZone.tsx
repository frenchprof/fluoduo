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

// Conjugation tables: a bare cell like « peux » is never heard alone in real
// French (Dan, 2026-07-08) — when the tapped word is a single token and its
// table row starts with a subject-pronoun cell (je / tu / il / elle / on…),
// speak « je peux », not « peux ». Rows like "je / j'" or "il / elle / on"
// contribute their first pronoun; je elides to j' before a vowel or h.
const SUBJECT_TOKENS = new Set(["je", "j'", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"]);
const NON_VERB = new Set(["ne", "n'", "pas"]);

function withSubject(el: HTMLElement, text: string): string {
  if (/\s/.test(text) || NON_VERB.has(text.toLowerCase())) return text;
  const row = el.closest("tr");
  const head = row?.querySelector<HTMLElement>("th, td");
  if (!row || !head || head.contains(el)) return text;
  const subj = head.textContent?.trim().split(/[\s/()]+/)[0]?.toLowerCase() ?? "";
  if (!SUBJECT_TOKENS.has(subj)) return text;
  const s = subj === "j'" ? "je" : subj;
  if (s === "je" && /^[aeéèêiîoôuh]/i.test(text)) return `j'${text}`;
  return `${s} ${text}`;
}

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
          speak(withSubject(fr, frText), "fr-FR");
          return;
        }
        const row = target.closest<HTMLElement>("li, td, th, p");
        const rowText = row?.textContent?.trim() ?? "";
        if (row && rowText && rowText.length <= 160) {
          // « French — English gloss » lines: speak only the French half.
          speak(withSubject(row, rowText.split("—")[0].trim()), "fr-FR");
        }
      }}
    >
      {children}
    </div>
  );
}
