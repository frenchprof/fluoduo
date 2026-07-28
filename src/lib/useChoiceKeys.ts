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

// While any choice exercise is mounted+enabled, global single/double-digit
// shortcuts (KeyNav's SIO jump) must stand down — digits mean answers here.
let activeCount = 0;
export function choiceKeysBusy(): boolean {
  return activeCount > 0;
}

/** The same stand-down for an activity that types digits rather than picking
 *  options (NumBus keys a bus number in). Call on mount, call the returned
 *  function on unmount. */
export function holdDigitKeys(): () => void {
  activeCount++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeCount--;
  };
}

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
    activeCount++;
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
        // A control focused via arrow navigation activates natively — only a
        // "free" Enter advances the question.
        const a = document.activeElement;
        if (a && (a.tagName === "BUTTON" || a.tagName === "A")) return;
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
    return () => {
      activeCount--;
      window.removeEventListener("keydown", h);
    };
  });
}

/** The one-line legend shown under keyboard-enabled exercises. */
export const CHOICE_KEYS_HINT = "⌨️ 1–4 choisir · ⏎ suivant · R 🔊";
