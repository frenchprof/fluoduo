/**
 * IS A VOICE SPEAKING RIGHT NOW? — one flag, three sources.
 *
 * Dan, 2026-09-12: *"the music tends to be very loud once it starts, how can
 * we make it softer and not overpowering the texttospeech?"*
 *
 * The chiptune loop ducks itself under a voice (see chiptune.ts), and to do
 * that it has to know when one is playing. The app has three ways to speak,
 * and only one of them is visible to a poll:
 *
 *   the browser synth      window.speechSynthesis.speaking   (polled)
 *   a banked studio clip   an <audio> element, speech.ts     (tracked here)
 *   a cloud voice clip     an <audio> element, cloudVoice.ts (tracked here)
 *
 * `trackVoice(el)` hangs the four listeners that matter on an element and
 * keeps this flag honest through play, pause, natural end and failure. The
 * element itself is the source of truth, so a clip that is stopped by
 * replacing `current` still clears the flag when its pause() fires.
 */
let clips = 0;

export function voiceClipActive(): boolean {
  return clips > 0;
}

/** Watch one voice <audio> element; call once, right after creating it. */
export function trackVoice(el: HTMLAudioElement): void {
  let counted = false;
  const on = () => { if (!counted) { counted = true; clips++; } };
  const off = () => { if (counted) { counted = false; clips = Math.max(0, clips - 1); } };
  el.addEventListener("playing", on);
  el.addEventListener("pause", off);
  el.addEventListener("ended", off);
  el.addEventListener("error", off);
}
