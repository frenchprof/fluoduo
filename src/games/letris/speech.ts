// Count of utterances currently queued/in-flight in continuous mode, so we can
// cap the backlog without ever fully silencing the game.
let pending = 0;

// ── Global sound mute ───────────────────────────────────────────────────────
// The ONE site-wide 🔇 lives in games/audio/mute (Dan, 2026-07-07: the button
// must silence games too, not just the voice). Speech consumes it here; the
// chiptune synth (music + jingles) consumes it separately. The old TTS-named
// exports stay as aliases for existing imports.
import { isChannelMuted, setChannelMuted, onChannelMuteChange } from "@/games/audio/mute";

// Muting stops anything already speaking, immediately — the synth AND any
// playing bank clip.
if (typeof window !== "undefined") {
  onChannelMuteChange((ch, m) => {
    if (ch === "voice" && m) {
      window.speechSynthesis?.cancel();
      bankAudio?.pause();
    }
  });
}

// ── Pre-generated audio bank ────────────────────────────────────────────────
// public/tts-bank/ holds one studio-voice MP3 per deck item (built by
// scripts/generate-tts-bank.mjs / the "Generate TTS bank" GitHub action), so
// core vocabulary sounds IDENTICAL on every device (Dan, 2026-07-10). Clips
// are ~10 KB, CDN-served and browser-cached; any miss — manifest absent,
// string not banked, fetch still loading — falls back to the browser voice,
// so a partial or missing bank never breaks speech.
let bankManifest: Record<string, string> | null | undefined; // undefined = not requested yet
let bankAudio: HTMLAudioElement | null = null;
const bankNorm = (t: string) => t.replace(/\s+/g, " ").trim();
function loadBank() {
  if (bankManifest !== undefined) return;
  bankManifest = null; // absent until proven otherwise
  fetch("/tts-bank/manifest.json")
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => { if (j && j.entries) bankManifest = j.entries as Record<string, string>; })
    .catch(() => {});
}
/** Play `text` from the bank if it's there. Bank clips are the female
 *  narrator, so gendered dialogue lines stay on the synth voices. */
function tryBank(text: string, lang: string, opts: SpeakOpts): boolean {
  if (!lang.startsWith("fr") || opts.gender || opts.interrupt === false) return false;
  if (bankManifest === undefined) { loadBank(); return false; }
  const file = bankManifest?.[bankNorm(text)];
  if (!file) return false;
  try {
    window.speechSynthesis?.cancel();
    bankAudio?.pause();
    const a = new Audio("/tts-bank/" + file);
    a.playbackRate = opts.rate ?? 1;
    bankAudio = a;
    void a.play().catch(() => {});
    return true;
  } catch {
    return false;
  }
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
  gender?: "f" | "m" | "kid";
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

// ── Site-wide voice cast (Dan, 2026-07-10: "two at most three voices — at
// least one male and one female for conversations, maybe a childisher third
// — throughout all the website") ────────────────────────────────────────────
// ONE stable female and ONE stable male voice are chosen per device and used
// by every page and game; the "kid" profile is the female voice pitched up.
// True sameness ACROSS devices would need server-generated audio — browsers
// ship different voices — but on any given device the cast never varies.
// The pick prefers a gender-named voice, then an enhanced/premium build of it.
const voiceCache = new Map<string, SpeechSynthesisVoice | null>();
if (typeof window !== "undefined") {
  // Voices load asynchronously — a cast chosen from an early partial list
  // must be re-chosen once the full list arrives.
  window.speechSynthesis?.addEventListener("voiceschanged", () => voiceCache.clear());
}
export function castVoice(lang: string, profile: "f" | "m"): SpeechSynthesisVoice | null {
  const key = `${lang.split("-")[0]}:${profile}`;
  const hit = voiceCache.get(key);
  if (hit !== undefined) return hit;
  const inLang = window.speechSynthesis.getVoices().filter(
    (x) => x.lang === lang || x.lang.startsWith(lang.split("-")[0]),
  );
  const rx = profile === "f" ? FEMALE_VOICE : MALE_VOICE;
  const named = inLang.filter((x) => rx.test(x.name));
  const pool = named.length ? named : inLang;
  const v = pool.find((x) => /premium|enhanced|natural|neural/i.test(x.name)) ?? pool[0] ?? null;
  voiceCache.set(key, v);
  return v;
}

/** Pick the cast voice + pitch for an utterance. No gender → the female
 *  narrator at neutral pitch, so the whole site speaks with one voice. */
function applyVoiceAndPitch(u: SpeechSynthesisUtterance, lang: string, gender?: "f" | "m" | "kid", rate?: number) {
  const v = castVoice(lang, gender === "m" ? "m" : "f");
  if (v) u.voice = v;
  u.rate = rate ?? 0.95;
  // Pitch is the reliable cue when a device has no gender-named voice:
  // narrator 1 · femme 1.35 · homme 0.75 · enfant 1.6 (the "childish" third
  // voice = the female voice pitched up).
  u.pitch = gender === "kid" ? 1.6 : gender === "f" ? 1.35 : gender === "m" ? 0.75 : 1;
}

/**
 * Play a list of lines back-to-back, each with its own gender voice — for the
 * atelier dialogues' "play all" control. Returns a stop() that cancels the run.
 */
// Manual pause must survive the Chrome keep-alive below (which exists to
// undo Chrome's SILENT pauses, not the user's deliberate one).
let userPaused = false;
export function pauseSpeech(): void {
  userPaused = true;
  window.speechSynthesis?.pause();
}
export function resumeSpeech(): void {
  userPaused = false;
  window.speechSynthesis?.resume();
}
export function isSpeechPaused(): boolean {
  return userPaused;
}

export function speakSequence(
  parts: { text: string; gender?: "f" | "m" | "kid"; lang?: string }[],
  lang = "fr-FR",
  opts: { rate?: number; gapMs?: number; onDone?: () => void; voice?: SpeechSynthesisVoice } = {},
): () => void {
  if (typeof window === "undefined" || !window.speechSynthesis || isChannelMuted("voice")) return () => {};
  const synth = window.speechSynthesis;
  synth.cancel();
  userPaused = false;
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
    if (!cancelled && !userPaused && synth.paused) synth.resume();
  }, 3000);
  const finish = () => {
    window.clearInterval(keepAlive);
    alive.length = 0;
    if (!cancelled && opts.onDone) opts.onDone();
  };
  const next = () => {
    if (cancelled || i >= parts.length) { finish(); return; }
    const p = parts[i++];
    const u = new SpeechSynthesisUtterance(p.text);
    alive.push(u);
    const plang = p.lang ?? lang;
    u.lang = plang;
    if (opts.voice) {
      // One multilingual voice for the whole run — same persona in both
      // languages, the utterance lang switches its accent natively.
      u.voice = opts.voice;
      u.rate = opts.rate ?? 0.95;
      u.pitch = 1;
    } else {
      applyVoiceAndPitch(u, plang, p.gender, opts.rate);
    }
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

// ── Bilingual speaking (the tutor) ──────────────────────────────────────────
// The tutor's replies are English prose with French examples; one fr-FR
// utterance reads the English with a French accent (Dan, 2026-07-12: "make
// it recognise the language before TTSing"). speechSynthesis cannot detect
// language, so: split into segments (parentheticals — the English glosses —
// first, then sentences), guess fr/en per segment, and speak each with the
// right cast voice, queued back to back.
const FR_HINTS = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "au", "aux",
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
  "est", "es", "suis", "sommes", "êtes", "sont", "ai", "as", "avons", "avez", "ont",
  "ne", "pas", "et", "ou", "mais", "que", "qui", "quoi", "avec", "pour", "dans", "sur",
  "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "ce", "cette", "ces",
  "très", "bien", "merci", "bonjour", "salut", "oui", "non", "voilà", "aussi",
  "j'ai", "c'est", "n'est", "qu'est-ce", "s'il", "aime", "aimes", "vais", "vas", "va",
  "bonne", "bon", "allez", "alors", "voici", "comme", "moi", "toi", "ça",
  "peux", "peut", "veux", "veut", "fais", "fait", "faites", "dois", "doit", "où",
]);
function guessLang(segment: string): "fr-FR" | "en-US" {
  // Elision (j', l', qu', n'…) is French; English apostrophes are 's / n't.
  if (/\b[jlcdnstm]['’](?![st]\b)|\bqu['’]/i.test(segment)) return "fr-FR";
  // Subject-pronoun inversion (« peux-tu », « est-il », « allons-nous ») is
  // unmistakably French — the hyphen hid the pronoun from the word test
  // (Dan, 2026-07-13: "why does it think peux-tu dessiner is in english").
  if (/-(tu|vous|je|il|elle|on|nous|ils|elles|toi|moi|ce)\b/i.test(segment)) return "fr-FR";
  // Split AT hyphens so compounds contribute their parts.
  const words = segment.toLowerCase().match(/[a-zà-ÿ'’]+/g) ?? [];
  if (words.length === 0) return "en-US";
  // A diacritic marks THAT WORD as French, not the whole segment — "We use
  // au because cinéma is masculine" is an English sentence quoting French.
  const hits = words.filter((w) => FR_HINTS.has(w) || /[àâçéèêëîïôùûüœ]/.test(w)).length;
  if (words.length <= 2 && hits > 0) return "fr-FR"; // « Bonne chance ! »
  return hits / words.length >= 0.4 ? "fr-FR" : "en-US";
}
/** Split into speakable chunks: « guillemet-quoted French » and (…) glosses
 *  become their own segments (that's exactly where the tutor's format flips
 *  language), the rest splits at sentence boundaries; emoji are stripped
 *  (some voices announce them: "robot face"). */
function segmentBilingual(text: string): { text: string; lang: "fr-FR" | "en-US" }[] {
  const out: { text: string; lang: "fr-FR" | "en-US" }[] = [];
  const push = (raw: string, lang?: "fr-FR" | "en-US") => {
    const clean = raw.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}«»]/gu, "").trim();
    if (!/[a-zà-ÿ]/i.test(clean)) return;
    out.push({ text: clean, lang: lang ?? guessLang(clean) });
  };
  // Guillemets are an authoritative French marker — no guessing inside them.
  for (const span of text.split(/(«[^»]*»)/g)) {
    if (span.startsWith("«")) { push(span, "fr-FR"); continue; }
    for (const part of span.split(/(\([^)]*\))/g)) {
      if (part.startsWith("(")) push(part.replace(/^\(|\)$/g, ""));
      else for (const raw of part.split(/(?<=[.!?…:])\s+|\n+/g)) push(raw);
    }
  }
  return out;
}
/** ONE voice for both languages when the device has a multilingual voice
 *  (Edge's "…Multilingual" voices, some Android voices) — same persona
 *  throughout, accent switching handled natively by utterance.lang. */
function multilingualVoice(): SpeechSynthesisVoice | undefined {
  return window.speechSynthesis
    .getVoices()
    .find((v) => /multilingual/i.test(v.name) && /^(fr|en)/i.test(v.lang));
}

/** Speak a bilingual message (Dan, 2026-07-12: same voice throughout, and
 *  code-mixing WITHIN a sentence must work). Two tiers:
 *  - Device has a MULTILINGUAL voice → the whole message is ONE utterance;
 *    the voice switches accent internally mid-sentence — truly seamless.
 *  - Otherwise → segment at « … » (and heuristics), one utterance per span
 *    through the cast narrators. Each switch has a small audible re-attack;
 *    that is the browser engine's physical limit, not a tuning problem.
 *  Returns a stop() (null when there was nothing to speak); onDone fires when
 *  the run completes naturally. */
export function speakMixed(text: string, onDone?: () => void): (() => void) | null {
  if (typeof window === "undefined" || !window.speechSynthesis || isChannelMuted("voice")) return null;
  const mv = multilingualVoice();
  if (mv) {
    const clean = text.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}«»]/gu, " ").replace(/\s+/g, " ").trim();
    if (!clean) return null;
    return speakSequence([{ text: clean, lang: mv.lang }], mv.lang, { onDone, voice: mv });
  }
  const parts = segmentBilingual(text);
  if (!parts.length) return null;
  return speakSequence(parts, "fr-FR", { gapMs: 0, onDone });
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

  // Banked studio clip when one exists — identical audio on every device.
  if (tryBank(spoken, lang, opts)) return;

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
