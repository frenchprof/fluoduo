"use client";

/**
 * Floating site-wide sound switch (Dan, 2026-07-07: the sound-off button must
 * work in games too, not just mute the tutor's voice). Toggles ONE preference
 * (games/audio/mute) that silences everything — TTS, game music, and the
 * answer jingles. Mounted once in the root layout, so it's on every page.
 * The games' volume sliders still fine-tune loudness when sound is ON.
 */
import { useEffect, useState } from "react";
import { isSoundMuted, setSoundMuted, onSoundMuteChange } from "@/games/audio/mute";

export default function TtsToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isSoundMuted());
    return onSoundMuteChange(setMuted);
  }, []);

  return (
    <button
      type="button"
      onClick={() => setSoundMuted(!muted)}
      aria-pressed={muted}
      aria-label={muted ? "Réactiver le son" : "Couper le son"}
      title={muted ? "Son coupé — cliquer pour réactiver" : "Couper le son (voix, musique, effets)"}
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
