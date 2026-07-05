/**
 * Site-wide answer jingles (Dan, 2026-07-05): every graded interaction plays
 * one of exactly three sounds — correct = bright "ta-daa", wrong = soft low
 * buzz, stage = the full victory fanfare when an activity/level completes.
 * All delegate to the chiptune synth, so the shared volume slider
 * (fluolingo:volume → chiptune's master gain) governs them, and each call
 * safely initialises/resumes the AudioContext (call from a user gesture).
 *
 * stage() also rains CONFETTI (Dan, 2026-07-05: "could we also see
 * confetti?") — pure DOM, removed after the fall, skipped for
 * prefers-reduced-motion. Keyframes live in globals.css (fluo-confetti).
 */

import { chiptune } from "@/games/audio/chiptune";

const CONFETTI_COLORS = ["#e0567f", "#2bb6c2", "#e3a700", "#8a5fd4", "#e8852e", "#7bbf2e", "#eaff00"];

function confetti() {
  if (typeof document === "undefined") return;
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:95;overflow:hidden";
    for (let i = 0; i < 90; i++) {
      const s = document.createElement("span");
      const size = 6 + Math.random() * 7;
      s.style.cssText =
        `position:absolute;top:-3vh;left:${Math.random() * 100}%;` +
        `width:${size}px;height:${size * 0.45}px;border-radius:2px;` +
        `background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]};opacity:0;` +
        `--dx:${(Math.random() * 2 - 1) * 18}vw;--rot:${540 + Math.random() * 720}deg;` +
        `animation:fluo-confetti ${1.6 + Math.random() * 1.4}s cubic-bezier(.25,.4,.6,1) ${Math.random() * 0.35}s forwards`;
      host.appendChild(s);
    }
    document.body.appendChild(host);
    window.setTimeout(() => host.remove(), 3600);
  } catch {
    // decoration only — never let it break the game that called it
  }
}

export const sfx = {
  correct: () => chiptune.correct(),
  wrong: () => chiptune.wrong(),
  stage: () => {
    chiptune.fanfare();
    confetti();
  },
};
