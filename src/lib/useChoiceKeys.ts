/**
 * Keyboard control for one-question-at-a-time choice exercises (Dan,
 * 2026-07-14: "select answers by entering 1, 2, 3, 4 and enter, and some
 * other button to repeat the pronunciation"):
 *   1…count  pick that option
 *   Enter    advance (callers guard "only after answering")
 *   R        replay the audio
 * Ignores keystrokes aimed at form fields and shortcuts with modifiers.
 */
import { useEffect } from "react";

export function useChoiceKeys({
  count,
  onPick,
  onNext,
  onSpeak,
  enabled = true,
}: {
  count: number;
  onPick: (index: number) => void;
  onNext?: () => void;
  onSpeak?: () => void;
  enabled?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = Number(e.key);
      if (Number.isInteger(k) && k >= 1 && k <= count) {
        e.preventDefault();
        onPick(k - 1);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onNext?.();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onSpeak?.();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
}

/** The one-line legend shown under keyboard-enabled exercises. */
export const CHOICE_KEYS_HINT = "⌨️ 1–4 choisir · ⏎ suivant · R 🔊";
