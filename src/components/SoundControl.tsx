"use client";

/**
 * Top-bar sound control (Dan, 2026-07-08: "add the sound +/- and volume
 * button along with the magnifying glass and trophy at the top"; later:
 * "we can separate muting TTS or muting sound effects and muting background
 * music"). It opened a popover with THREE channel switches — 🗣 voix (TTS) ·
 * 🎵 musique · 🔔 effets — plus the volume slider.
 *
 * ONE SWITCH NOW (Dan, 2026-09-12, shown both rendered from one build and
 * asked which: *"simpler"*). Four controls behind one button was the cost of
 * a distinction almost nobody drew: a learner who wants quiet had to press
 * three things, and the bar's own icon had to summarise three states into one
 * glyph — 🔊 / 🔉 / 🔇 — so "some sound is off" looked different from "all
 * off" in a way nobody had asked for.
 *
 * THE THREE CHANNELS SURVIVE UNDERNEATH, and that is deliberate rather than
 * lazy: `games/audio/mute` still keeps them apart, every game still asks it
 * per channel, and the in-game floating toggle still works. What went is the
 * UI that made a learner choose between them. If Dan ever wants music on its
 * own switch back — the one people really do turn off separately — it is a
 * row in this file, not a change to the audio model.
 *
 * One source of truth: games/audio/mute for the switch, fluolingo:volume for
 * the level (the same key every game's slider reads); chiptune is updated
 * live. The floating in-game toggle is unchanged — it always did mute ALL
 * channels at once, which is now what this does too.
 */
import { useEffect, useState } from "react";
import { isChannelMuted, setChannelMuted, onChannelMuteChange, isAllMuted, type SoundChannel } from "@/games/audio/mute";
import { chiptune } from "@/games/audio/chiptune";

const VOL_KEY = "fluolingo:volume";

/** All three, always together — the switch is one control over the whole
 *  channel set, so nothing here is a per-channel choice any more. */
const ALL_CHANNELS: SoundChannel[] = ["voice", "music", "sfx"];

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
            {/* ONE SWITCH. `anyMuted` rather than `allMuted` decides what it
                reads, so a learner arriving with only music muted — from the
                old three-switch popover, or from a game's own toggle — sees
                "off" and one press turns everything back on, instead of a
                control that says "on" while something is silent. */}
            <button
              type="button"
              onClick={() => ALL_CHANNELS.forEach((ch) => setChannelMuted(ch, !anyMuted))}
              aria-pressed={anyMuted}
              className={`cahier-btn cahier-btn-sm w-full !justify-between text-left ${anyMuted ? "opacity-60" : ""}`}
            >
              <span>Sound</span>
              <span aria-hidden>{anyMuted ? "🔇" : "🔊"}</span>
            </button>
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
