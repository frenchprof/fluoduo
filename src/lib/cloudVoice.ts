/**
 * Cloud speech for the interactive exercises (Dan, 2026-07-18: "let's do it" —
 * premium Google Neural2 sound in Compose and ChaTutor instead of whatever
 * voice the student's device ships). Thin layer over POST /api/tts:
 *
 *  - speakCloud / speakSequenceCloud / speakMixedCloud mirror the browser
 *    helpers in games/letris/speech and FALL BACK to them on any failure
 *    (backend not configured, network, autoplay refusal), so speech never
 *    breaks — worst case it sounds like it did before this layer existed.
 *  - Clips are cached by (voice, rate, text): replaying a line — students tap
 *    🔊 on the same balloon a lot — never spends Google characters twice.
 *  - One thing speaks at a time, across cloud audio AND the browser synth
 *    (a shared token invalidates whatever was playing before).
 *  - The site-wide 🔇 and the tutor's pause/resume both reach cloud audio:
 *    mute stops it via the channel listener; pauseSpeech()/resumeSpeech()
 *    reach it through the hook registered with the speech module.
 */

import { isChannelMuted, onChannelMuteChange } from "@/games/audio/mute";
import { trackVoice } from "@/games/audio/voiceState";
import {
  registerCloudPauseHooks,
  segmentBilingual,
  speak,
  speakMixed,
  speakSequence,
  type MixedPlayback,
} from "@/games/letris/speech";

type Gender = "f" | "m" | "kid";
type Part = { text: string; gender?: Gender; lang?: string };

// ── Clip cache ──────────────────────────────────────────────────────────────
const urlCache = new Map<string, string>(); // key → object URL (insertion-ordered)
const inFlight = new Map<string, Promise<string | null>>();
const CACHE_CAP = 120;
// Backend answered "not configured" → stop trying for this page load.
let cloudDown = false;

/** The /api/tts voice id for a lang+gender, or null when the cloud can't do
 *  it (non fr/en language, or the "kid" profile — that one is a pitch trick
 *  only the browser synth can perform). */
function voiceParam(lang: string, gender?: Gender): string | null {
  if (gender === "kid") return null;
  const base = lang.startsWith("fr") ? "fr" : lang.startsWith("en") ? "en" : null;
  return base ? `${base}-${gender === "m" ? "m" : "f"}` : null;
}

function fetchClip(text: string, voice: string, rate: number): Promise<string | null> {
  const key = `${voice}|${rate}|${text}`;
  const hit = urlCache.get(key);
  if (hit) return Promise.resolve(hit);
  const running = inFlight.get(key);
  if (running) return running;
  const p = (async () => {
    try {
      const r = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, voice, rate }),
      });
      if ([503, 404, 405, 501].includes(r.status)) { cloudDown = true; return null; }
      if (!r.ok) return null;
      const url = URL.createObjectURL(await r.blob());
      urlCache.set(key, url);
      if (urlCache.size > CACHE_CAP) {
        const [k0, u0] = urlCache.entries().next().value as [string, string];
        urlCache.delete(k0);
        URL.revokeObjectURL(u0);
      }
      return url;
    } catch {
      return null;
    } finally {
      inFlight.delete(key);
    }
  })();
  inFlight.set(key, p);
  return p;
}

// ── Single active playback ──────────────────────────────────────────────────
let token = 0;
let current: HTMLAudioElement | null = null;

/** Stop whatever cloud clip is playing (does NOT touch the browser synth —
 *  callers cancelling everything do both). */
export function stopCloudVoice(): void {
  token++;
  current?.pause();
  current = null;
}

if (typeof window !== "undefined") {
  onChannelMuteChange((ch, m) => { if (ch === "voice" && m) stopCloudVoice(); });
  // The tutor's balloon ⏸/▶ goes through speech.pauseSpeech()/resumeSpeech();
  // these hooks extend them to the cloud audio element.
  registerCloudPauseHooks({
    pause: () => current?.pause(),
    resume: () => { if (current) void current.play().catch(() => {}); },
  });
}

/** Play one fetched clip; resolves true on natural end, false on abort/failure. */
function playUrl(url: string, myToken: number): Promise<boolean> {
  return new Promise((res) => {
    if (myToken !== token) { res(false); return; }
    const a = new Audio(url);
    trackVoice(a); // so the game music ducks under it — voiceState.ts
    current = a;
    a.onended = () => res(true);
    a.onerror = () => res(false);
    a.play().catch(() => res(false));
  });
}

// ── Public mirrors of the browser helpers ───────────────────────────────────

/** Cloud twin of speak(): one line, interrupting whatever was playing. */
export function speakCloud(text: string, lang = "fr-FR", opts: { gender?: Gender; rate?: number } = {}): void {
  if (typeof window === "undefined" || isChannelMuted("voice")) return;
  const voice = voiceParam(lang, opts.gender);
  if (cloudDown || !voice) { speak(text, lang, opts); return; }
  const my = ++token;
  current?.pause();
  current = null;
  window.speechSynthesis?.cancel();
  void fetchClip(text, voice, opts.rate ?? 1).then(async (url) => {
    if (my !== token) return;
    if (!url || !(await playUrl(url, my))) {
      // Clip unavailable or refused to start — the browser voice takes over,
      // unless something newer already speaks.
      if (my === token) speak(text, lang, opts);
    }
  });
}

/** Cloud twin of speakSequence(): dialogue lines back to back, each with its
 *  own gendered voice. All clips are prefetched in parallel; any failure
 *  hands the REST of the run to the browser sequencer. Returns stop(). */
export function speakSequenceCloud(
  parts: Part[],
  lang = "fr-FR",
  opts: { rate?: number; gapMs?: number; onDone?: () => void } = {},
): () => void {
  if (typeof window === "undefined" || isChannelMuted("voice")) return () => {};
  if (cloudDown) return speakSequence(parts, lang, opts);
  const my = ++token;
  current?.pause();
  current = null;
  window.speechSynthesis?.cancel();
  let innerStop: (() => void) | null = null;
  const rate = opts.rate ?? 1;
  const fetches = parts.map((p) => {
    const voice = voiceParam(p.lang ?? lang, p.gender);
    return voice ? fetchClip(p.text, voice, rate) : Promise.resolve(null);
  });
  void (async () => {
    for (let i = 0; i < parts.length; i++) {
      if (my !== token) return;
      const url = await fetches[i];
      if (my !== token) return;
      if (!url || !(await playUrl(url, my))) {
        if (my !== token) return;
        // Delegate the remaining lines to the browser voices in one go.
        innerStop = speakSequence(parts.slice(i), lang, opts);
        return;
      }
      if (i < parts.length - 1) await new Promise((r) => setTimeout(r, opts.gapMs ?? 200));
    }
    if (my === token) opts.onDone?.();
  })();
  return () => {
    if (my === token) stopCloudVoice();
    innerStop?.();
  };
}

/** Cloud twin of speakMixed(): a bilingual tutor balloon, segment by segment
 *  (French segments in the French voice, English ones in the English voice).
 *  Progress/seek at segment granularity, like the browser fallback tier. */
export function speakMixedCloud(
  text: string,
  opts: { rate?: number; onDone?: () => void; onProgress?: (frac: number) => void } = {},
): MixedPlayback | null {
  if (typeof window === "undefined" || isChannelMuted("voice")) return null;
  if (cloudDown) return speakMixed(text, opts);
  const parts = segmentBilingual(text);
  if (!parts.length) return null;
  const rate = opts.rate ?? 1;
  let inner: MixedPlayback | null = null;
  let myRun = 0; // local runs (seek restarts) within this playback's lifetime
  let finished = false;
  const my = ++token;
  current?.pause();
  current = null;
  window.speechSynthesis?.cancel();
  const playFrom = (start: number) => {
    const run = ++myRun;
    void (async () => {
      for (let i = start; i < parts.length; i++) {
        if (my !== token || run !== myRun || finished) return;
        opts.onProgress?.(i / parts.length);
        const voice = voiceParam(parts[i].lang, "f");
        const url = voice ? await fetchClip(parts[i].text, voice, rate) : null;
        if (my !== token || run !== myRun || finished) return;
        if (!url || !(await playUrl(url, my))) {
          if (my !== token || run !== myRun || finished) return;
          // Hand the rest of the balloon to the browser tier.
          inner = speakMixed(parts.slice(i).map((p) => p.text).join(" "), {
            rate: opts.rate,
            onDone: opts.onDone,
            onProgress: (f) => opts.onProgress?.((i + f * (parts.length - i)) / parts.length),
          });
          if (!inner) { finished = true; opts.onDone?.(); }
          return;
        }
      }
      if (my === token && run === myRun && !finished) { finished = true; opts.onDone?.(); }
    })();
  };
  playFrom(0);
  return {
    stop: () => {
      finished = true;
      if (my === token) stopCloudVoice();
      inner?.stop();
    },
    seek: (frac) => {
      if (finished) return;
      if (inner) { inner.seek(frac); return; }
      current?.pause();
      playFrom(Math.max(0, Math.min(parts.length - 1, Math.floor(frac * parts.length))));
    },
  };
}
