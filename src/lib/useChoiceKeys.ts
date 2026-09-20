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

/**
 * Digit typing, arbitrated in ONE place.
 *
 * An activity that types numbers in (NumBus) used to attach its own window
 * listener, which is how it once stole 1–4 from the pre-test's answer keys.
 * The rules that make a global listener safe live here instead of in each game:
 *
 *   - ONE window listener exists, no matter how many claimants.
 *   - A focused field owns its own keystrokes, so a game with a real <input>
 *     never double-enters a digit.
 *   - Only the most recent claim receives digits, and choice exercises yield
 *     their 1–4 shortcuts while any claim is live — so the two can never both
 *     act on the same keypress.
 */
type DigitClaim = { onDigit: (d: string) => void };
const digitClaims: DigitClaim[] = [];
let digitListener: ((e: KeyboardEvent) => void) | null = null;

const inField = (t: EventTarget | null): boolean => {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
};

/** IS THE LEARNER TYPING INTO A FIELD? Every window-level shortcut handler
 *  must ask this first and stand down if so.
 *
 *  Dan, 2026-09-15: *"i could not type feedback in NumBus it kept causing
 *  interference"*. NumBus took Space, R and Enter on the whole window — so in
 *  the 🐞 form a space repeated the bus number, an R replayed it, and Enter
 *  submitted the ANSWER instead of a new line. Letris, the flashcard lesson
 *  and WorDrill had the same shape. The digit listener above already stood
 *  down for fields; the letter and Space shortcuts never did.
 *
 *  Exported so the guard is written once: a handler that reimplements it
 *  will get it half right (INPUT but not TEXTAREA is the usual half). */
export function typingInField(e: KeyboardEvent): boolean {
  return inField(e.target) || inField(document.activeElement);
}

export function claimDigitKeys(onDigit: (d: string) => void): () => void {
  const claim: DigitClaim = { onDigit };
  digitClaims.push(claim);
  activeCount++;
  if (!digitListener) {
    digitListener = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (inField(e.target)) return;
      if (!/^[0-9]$/.test(e.key)) return;
      const top = digitClaims[digitClaims.length - 1];
      if (!top) return;
      e.preventDefault();
      top.onDigit(e.key);
    };
    window.addEventListener("keydown", digitListener);
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeCount--;
    const i = digitClaims.indexOf(claim);
    if (i >= 0) digitClaims.splice(i, 1);
    if (digitClaims.length === 0 && digitListener) {
      window.removeEventListener("keydown", digitListener);
      digitListener = null;
    }
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
  // THE STAND-DOWN LASTS AS LONG AS THE SURFACE, NOT AS LONG AS A QUESTION
  // (Dan, 2026-08-27: "pretest pressing 1,2,3,4 does advance to the next
  // question, but at some point after the last question, continuously pressing
  // 1,2,3,4 leads to jump 11 lessons down").
  //
  // Eleven is the tell: KeyNav's digit shortcut reads a two-digit stop number,
  // so 1 then 1 is SIO-011. It is meant to stand down while a choice exercise
  // owns the digits — but the stand-down used to live inside the handler
  // effect, which is gated on `enabled`. The moment the last question was
  // answered, `enabled` went false, the effect tore down, activeCount fell to
  // zero, and the digits a learner was still pressing became navigation.
  //
  // So the claim is now its own mount-lifetime effect: while this component
  // exists, digits belong to it, answering or not. A pressed 1 after the last
  // question does nothing, which is the correct nothing.
  useEffect(() => {
    activeCount++;
    return () => { activeCount--; };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const h = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = Number(e.key);
      // An activity that types digits has claimed them — yield rather than
      // acting on the same keypress twice.
      if (digitClaims.length === 0 && Number.isInteger(k) && k >= 1 && k <= count) {
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
      window.removeEventListener("keydown", h);
    };
  });
}

/** The one-line legend shown under keyboard-enabled exercises. */
export const CHOICE_KEYS_HINT = "⌨️ 1–4 pick · ⏎ next · R 🔊";
