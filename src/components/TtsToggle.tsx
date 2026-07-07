"use client";

/**
 * Floating site-wide switch to silence spoken audio / TTS (Dan, 2026-07-07:
 * "a button to silence the tts on the page/site, esp. in the tutor mode").
 * Mounted once in the root layout, so it's on every page — the tutor, the
 * drills, the games. It only affects speech synthesis; game music/SFX have
 * their own volume control.
 */
import { useEffect, useState } from "react";
import { isTtsMuted, setTtsMuted, onTtsMuteChange } from "@/games/letris/speech";

export default function TtsToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isTtsMuted());
    return onTtsMuteChange(setMuted);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setTtsMuted(!muted)}
      aria-pressed={muted}
      aria-label={muted ? "Réactiver la voix (TTS)" : "Couper la voix (TTS)"}
      title={muted ? "Voix coupée — cliquer pour réactiver" : "Couper la voix (TTS)"}
      // Sits above the 💬 feedback button (bottom-right column); clears the
      // accent bar which docks lower and only when a French field is focused.
      className={`fixed bottom-[4.75rem] right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg shadow-lg transition hover:-translate-y-0.5 active:translate-y-0 ${
        muted
          ? "border-[color:var(--fluo-danger,#e0384e)] bg-[color:var(--fluo-danger,#e0384e)] text-white"
          : "border-[color:var(--cahier-ink,#2a2e6e)] bg-white text-[color:var(--cahier-ink,#2a2e6e)]"
      }`}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
