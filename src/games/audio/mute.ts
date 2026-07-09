/**
 * Site-wide sound switches (Dan, 2026-07-08: "we can separate muting TTS or
 * muting sound effects and muting background music") — THREE channels now:
 *   voice — TTS (speech.ts consumes it)
 *   music — the chiptune loops (musicBus)
 *   sfx   — jingles & game effects (fxBus)
 * Device PREFERENCES, kept across sessions and sign-out. The legacy
 * single-switch API stays for the floating in-game toggle: it reads/writes
 * ALL three at once. Old single-key prefs seed all channels once.
 */
const CHANNELS = ["voice", "music", "sfx"] as const;
export type SoundChannel = (typeof CHANNELS)[number];

const KEY = (ch: SoundChannel) => `fluolingo:sound.${ch}.muted`;
const LEGACY_KEYS = ["fluolingo:sound.muted", "fluolingo:tts.muted"];

const muted: Record<SoundChannel, boolean> = (() => {
  try {
    const legacy = LEGACY_KEYS.some((k) => localStorage.getItem(k) === "1");
    const read = (ch: SoundChannel) => {
      const v = localStorage.getItem(KEY(ch));
      return v === null ? legacy : v === "1";
    };
    return { voice: read("voice"), music: read("music"), sfx: read("sfx") };
  } catch {
    return { voice: false, music: false, sfx: false };
  }
})();

const subs = new Set<(ch: SoundChannel, m: boolean) => void>();

export function isChannelMuted(ch: SoundChannel): boolean {
  return muted[ch];
}

export function setChannelMuted(ch: SoundChannel, m: boolean): void {
  muted[ch] = m;
  try {
    localStorage.setItem(KEY(ch), m ? "1" : "0");
  } catch {
    /* storage unavailable — still applies for this session */
  }
  subs.forEach((fn) => fn(ch, m));
}

/** Subscribe to any channel's changes; returns an unsubscribe fn. */
export function onChannelMuteChange(fn: (ch: SoundChannel, m: boolean) => void): () => void {
  subs.add(fn);
  return () => { subs.delete(fn); };
}

export const isAllMuted = () => CHANNELS.every((c) => muted[c]);
export const setAllMuted = (m: boolean) => CHANNELS.forEach((c) => setChannelMuted(c, m));

/* Legacy single-switch API — all-or-nothing (the floating 🔇 in games). */
export const isSoundMuted = isAllMuted;
export const setSoundMuted = setAllMuted;
export function onSoundMuteChange(fn: (m: boolean) => void): () => void {
  return onChannelMuteChange(() => fn(isAllMuted()));
}
