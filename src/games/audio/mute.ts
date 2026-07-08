/**
 * ONE site-wide sound switch (Dan, 2026-07-07: "the sound off button doesn't
 * seem to work in games" — it only muted TTS; a sound-off button must silence
 * EVERYTHING). This tiny dependency-free store is the single source of truth;
 * the speech layer (TTS) and the chiptune synth (game music + jingles) both
 * consume it. It's a device PREFERENCE — kept across sessions and sign-out.
 */
const KEY = "fluolingo:sound.muted";
const OLD_KEY = "fluolingo:tts.muted"; // pre-rename pref, read once as fallback

let muted = (() => {
  try {
    return (localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY)) === "1";
  } catch {
    return false;
  }
})();
const subs = new Set<(m: boolean) => void>();

export function isSoundMuted(): boolean {
  return muted;
}

export function setSoundMuted(m: boolean): void {
  muted = m;
  try {
    localStorage.setItem(KEY, m ? "1" : "0");
  } catch {
    /* storage unavailable — still applies for this session */
  }
  subs.forEach((fn) => fn(m));
}

/** Subscribe to mute changes; returns an unsubscribe fn. */
export function onSoundMuteChange(fn: (m: boolean) => void): () => void {
  subs.add(fn);
  return () => { subs.delete(fn); };
}
