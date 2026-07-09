// Count of utterances currently queued/in-flight in continuous mode, so we can
// cap the backlog without ever fully silencing the game.
let pending = 0;

// ── Global sound mute ───────────────────────────────────────────────────────
// The ONE site-wide 🔇 lives in games/audio/mute (Dan, 2026-07-07: the button
// must silence games too, not just the voice). Speech consumes it here; the
// chiptune synth (music + jingles) consumes it separately. The old TTS-named
// exports stay as aliases for existing imports.
import { isChannelMuted, setChannelMuted, onChannelMuteChange } from "@/games/audio/mute";

// Muting stops anything already speaking, immediately.
if (typeof window !== "undefined") {
  onChannelMuteChange((ch, m) => { if (ch === "voice" && m) window.speechSynthesis?.cancel(); });
}

export const isTtsMuted = () => isChannelMuted("voice");
export const setTtsMuted = (m: boolean) => setChannelMuted("voice", m);
export const onTtsMuteChange = (fn: (m: boolean) => void) =>
  onChannelMuteChange((ch, m) => { if (ch === "voice") fn(m); });

type SpeakOpts = {
  /**
   * When true (default), cancel any in-flight speech before speaking — good for
   * single-card flips. When false ("queue" mode), let utterances play back to
   * back so fast Letris landings keep verbalising instead of chopping each
   * other off; a small cap drops excess so speech can't drift far behind play.
   */
  interrupt?: boolean;
  /**
   * Voice gender hint for two-speaker dialogues. Cross-browser voice-gender
   * data is unreliable, so this prefers a matching named voice when present
   * and always sets pitch (the one dependable differentiator).
   */
  gender?: "f" | "m";
  /** Speaking rate override — e.g. 0.6 for the 🐌 slow-playback buttons. */
  rate?: number;
};

// Spoken French names of the alphabet, written the way fr-FR TTS reads them
// correctly (e.g. "elle" for L, "double vé" for W). Used so a bare letter in
// the alphabet pretest is voiced as its name, never "X majuscule".
const FR_LETTER_NAME: Record<string, string> = {
  a: "a", b: "bé", c: "cé", d: "dé", e: "e", f: "effe", g: "gé", h: "ache",
  i: "i", j: "ji", k: "ka", l: "elle", m: "emme", n: "enne", o: "o", p: "pé",
  // "cu" is the dictionary spelling of Q's name (/ky/); the ad-hoc "ku" isn't a
  // French word-form and some voices skipped it silently (Dan, 2026-07-07:
  // "Q in the alphabet has no sound").
  q: "cu", r: "erre", s: "esse", t: "té", u: "u", v: "vé", w: "double vé",
  x: "ixe", y: "i grec", z: "zède",
};

const FEMALE_VOICE = /amelie|audrey|aurélie|aurelie|marie|julie|hortense|virginie|chantal|léa|lea|female|femme|woman/i;
const MALE_VOICE = /thomas|nicolas|paul|claude|henri|mathieu|male|homme|man/i;

/** Pick a language- and gender-appropriate voice + pitch for an utterance. */
function applyVoiceAndPitch(u: SpeechSynthesisUtterance, lang: string, gender?: "f" | "m", rate?: number) {
  const voices = window.speechSynthesis.getVoices();
  const inLang = voices.filter(
    (x) => x.lang === lang || x.lang.startsWith(lang.split("-")[0]),
  );
  const rx = gender === "f" ? FEMALE_VOICE : gender === "m" ? MALE_VOICE : null;
  const v = (rx && inLang.find((x) => rx.test(x.name))) || inLang[0];
  if (v) u.voice = v;
  u.rate = rate ?? 0.95;
  // Pitch is the reliable gender cue when a named voice isn't available.
  u.pitch = gender === "f" ? 1.35 : gender === "m" ? 0.75 : 1;
}

/**
 * Play a list of lines back-to-back, each with its own gender voice — for the
 * atelier dialogues' "play all" control. Returns a stop() that cancels the run.
 */
export function speakSequence(
  parts: { text: string; gender?: "f" | "m" }[],
  lang = "fr-FR",
  opts: { rate?: number; gapMs?: number } = {},
): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis || isChannelMuted("voice")) return () => {};
  const synth = window.speechSynthesis;
  synth.cancel();
  let cancelled = false;
  let i = 0;
  // Two engine quirks stop long runs partway (Dan, 2026-07-07: "play all is
  // not playing all"):
  //  - Chrome GARBAGE-COLLECTS utterances whose JS refs are gone mid-queue, so
  //    onend never fires and the chain dies → hold a ref to every utterance
  //    for the run's lifetime.
  //  - Chrome silently PAUSES long synthesis runs → nudge resume() on a timer
  //    while the run is active.
  const alive: SpeechSynthesisUtterance[] = [];
  const keepAlive = window.setInterval(() => {
    if (!cancelled && synth.paused) synth.resume();
  }, 3000);
  const finish = () => {
    window.clearInterval(keepAlive);
    alive.length = 0;
  };
  const next = () => {
    if (cancelled || i >= parts.length) { finish(); return; }
    const p = parts[i++];
    const u = new SpeechSynthesisUtterance(p.text);
    alive.push(u);
    u.lang = lang;
    applyVoiceAndPitch(u, lang, p.gender, opts.rate);
    // Defer the hand-off out of the onend callback — speaking synchronously
    // from inside it drops utterances on some engines (iOS), and the beat
    // between lines reads naturally in a dialogue.
    u.onend = () => { window.setTimeout(next, opts.gapMs ?? 120); };
    u.onerror = () => { window.setTimeout(next, 120); };
    if (synth.paused) synth.resume();
    synth.speak(u);
  };
  next();
  return () => {
    cancelled = true;
    finish();
    synth.cancel();
  };
}

export function speak(text: string, lang = "fr-FR", opts: SpeakOpts = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis || isChannelMuted("voice")) return;
  const synth = window.speechSynthesis;
  const interrupt = opts.interrupt ?? true;

  // In queue mode, don't pile up more than a couple of utterances — beyond that
  // the speech would lag noticeably behind the falling tiles.
  if (!interrupt && pending >= 2) return;

  // A lone letter read by French TTS is unreliable — an uppercase one becomes
  // "H majuscule" (H capital), and some voices still announce case even in
  // lowercase. The alphabet pretest wants the letter's NAME, so map a single
  // A–Z to its spoken French name ("H" → "ache"), which no voice can suffix
  // with "majuscule". Falls through untouched for everything else.
  const spoken = /^[A-Za-z]$/.test(text) ? (FR_LETTER_NAME[text.toLowerCase()] ?? text.toLowerCase()) : text;

  const u = new SpeechSynthesisUtterance(spoken);
  u.lang = lang;
  applyVoiceAndPitch(u, lang, opts.gender, opts.rate);

  if (interrupt) {
    synth.cancel();
  } else {
    pending++;
    u.onend = u.onerror = () => {
      pending = Math.max(0, pending - 1);
    };
  }

  // Chrome silently pauses the queue after long continuous use; nudge it.
  if (synth.paused) synth.resume();
  synth.speak(u);
}

type CategoryLike = { label: string; prefix?: string };
type TileLike = { text: string; displayName?: string };

/**
 * Builds the target sentence to show in lessons and speak via TTS.
 *
 * Preferred path: `category.prefix` + `tile.displayName`.
 *   prefix is a literal string with its own spacing/apostrophe rules,
 *   e.g. "Il fait ", "Le ", "L'", "" (no article).
 *   displayName is the proper-cased form (e.g. "Japon", "beau").
 *
 * Fallback (legacy, when prefix/displayName are missing): infer
 * from a small set of known French weather labels.
 */
export function buildSentence(
  category: CategoryLike,
  tile: TileLike,
): string {
  const displayName = tile.displayName ?? tile.text.toLowerCase();

  if (category.prefix !== undefined) {
    return (category.prefix + displayName).replace(/\s+/g, " ").trim();
  }

  // Legacy fallback
  const label = category.label.trim();
  const t = displayName;
  if (label === "C'EST") return `C'est ${t}`;
  if (label === "IL Y A") return `Il y a ${t}`;
  if (label === "IL FAIT") return `Il fait ${t}`;
  if (label === "IL") return `Il ${t}`;
  return `${label} ${t}`.toLowerCase();
}
