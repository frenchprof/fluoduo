"use client";

/**
 * Top-bar sound control (Dan, 2026-07-08: "add the sound +/- and volume
 * button along with the magnifying glass and trophy at the top"). The 🔊/🔇
 * icon opens a small popover: mute toggle + a volume slider. One source of
 * truth: games/audio/mute for the switch, fluolingo:volume for the level
 * (the same key every game's slider reads); chiptune is updated live.
 * The floating in-game toggle stays — games render outside this shell.
 */
import { useEffect, useState } from "react";
import { isSoundMuted, setSoundMuted, onSoundMuteChange } from "@/games/audio/mute";
import { chiptune } from "@/games/audio/chiptune";

const VOL_KEY = "fluolingo:volume";

export default function SoundControl() {
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(0.6);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMuted(isSoundMuted());
    try {
      const v = parseFloat(window.localStorage.getItem(VOL_KEY) ?? "");
      if (!Number.isNaN(v)) setVol(v);
    } catch {}
    return onSoundMuteChange(setMuted);
  }, []);

  function changeVol(v: number) {
    setVol(v);
    try { window.localStorage.setItem(VOL_KEY, String(v)); } catch {}
    chiptune.setVolume(v);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={muted ? "Réactiver le son" : "Son et volume"}
        aria-expanded={open}
        title="Son · volume"
        onClick={() => setOpen((o) => !o)}
        className="cahier-btn cahier-btn-sm"
      >
        {muted ? "🔇" : "🔊"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-2xl border-2 border-[color:var(--cahier-ink,#222850)] bg-white p-3 shadow-xl">
            <button
              type="button"
              onClick={() => setSoundMuted(!muted)}
              className={`cahier-btn cahier-btn-sm w-full ${muted ? "cahier-btn-primary" : ""}`}
            >
              {muted ? "🔇 Son coupé — réactiver" : "🔊 Couper le son"}
            </button>
            <label className="mt-3 flex items-center gap-2 text-sm font-bold text-[color:var(--cahier-ink,#222850)]">
              <span aria-hidden>🔉</span>
              <input
                type="range" min={0} max={1} step={0.05} value={vol}
                onChange={(e) => changeVol(parseFloat(e.target.value))}
                disabled={muted}
                aria-label="Volume"
                className="flex-1"
              />
              <span aria-hidden>🔊</span>
            </label>
            <p className="mt-1.5 text-[10px] font-bold text-[color:var(--cahier-ink,#222850)]/50">
              voix · musique · effets
            </p>
          </div>
        </>
      )}
    </div>
  );
}
