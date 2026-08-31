"use client";

/**
 * Top-bar sound control (Dan, 2026-07-08: "add the sound +/- and volume
 * button along with the magnifying glass and trophy at the top"; later:
 * "we can separate muting TTS or muting sound effects and muting background
 * music"). The 🔊/🔇 icon opens a popover with THREE channel switches —
 * 🗣 voix (TTS) · 🎵 musique · 🔔 effets — plus the volume slider. One source
 * of truth: games/audio/mute for the switches, fluolingo:volume for the level
 * (the same key every game's slider reads); chiptune is updated live.
 * The floating in-game toggle stays — it mutes/unmutes ALL channels at once.
 */
import { useEffect, useState } from "react";
import { isChannelMuted, setChannelMuted, onChannelMuteChange, isAllMuted, type SoundChannel } from "@/games/audio/mute";
import { chiptune } from "@/games/audio/chiptune";

const VOL_KEY = "fluolingo:volume";

const CHANNEL_ROWS: { ch: SoundChannel; label: string }[] = [
  { ch: "voice", label: "🗣 Voice (TTS)" },
  { ch: "music", label: "🎵 Music" },
  { ch: "sfx", label: "🔔 Effects" },
];

export default function SoundControl() {
  const [muted, setMuted] = useState<Record<SoundChannel, boolean>>({ voice: false, music: false, sfx: false });
  const [vol, setVol] = useState(0.6);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // The mute flags and the saved volume live in the audio module and
    // localStorage — neither can be read during render (static export), so
    // this mount effect has to seed them. Block-disabled: the rule reports
    // only the first setState it meets, and which one that is differs
    // between local and CI eslint.
    /* eslint-disable react-hooks/set-state-in-effect */
    const readAll = () => setMuted({
      voice: isChannelMuted("voice"),
      music: isChannelMuted("music"),
      sfx: isChannelMuted("sfx"),
    });
    readAll();
    try {
      const v = parseFloat(window.localStorage.getItem(VOL_KEY) ?? "");
      if (!Number.isNaN(v)) setVol(v);
    } catch {}
    /* eslint-enable react-hooks/set-state-in-effect */
    return onChannelMuteChange(readAll);
  }, []);

  function changeVol(v: number) {
    setVol(v);
    try { window.localStorage.setItem(VOL_KEY, String(v)); } catch {}
    chiptune.setVolume(v);
  }

  const anyMuted = muted.voice || muted.music || muted.sfx;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Sound and volume"
        aria-expanded={open}
        title="Sound · volume"
        onClick={() => setOpen((o) => !o)}
        className="cahier-btn cahier-btn-sm"
      >
        {isAllMuted() ? "🔇" : anyMuted ? "🔉" : "🔊"}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-1 w-60 rounded-2xl border-2 border-[color:var(--cahier-ink,#222850)] bg-white p-3 shadow-xl">
            <div className="space-y-1.5">
              {CHANNEL_ROWS.map(({ ch, label }) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannelMuted(ch, !muted[ch])}
                  aria-pressed={muted[ch]}
                  className={`cahier-btn cahier-btn-sm w-full !justify-between text-left ${muted[ch] ? "opacity-60" : ""}`}
                >
                  <span>{label}</span>
                  <span aria-hidden>{muted[ch] ? "🔇" : "🔊"}</span>
                </button>
              ))}
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm font-bold text-[color:var(--cahier-ink,#222850)]">
              <span aria-hidden>🔉</span>
              <input
                type="range" min={0} max={1} step={0.05} value={vol}
                onChange={(e) => changeVol(parseFloat(e.target.value))}
                aria-label="Volume"
                className="flex-1"
              />
              <span aria-hidden>🔊</span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}
