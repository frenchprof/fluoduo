// Count of utterances currently queued/in-flight in continuous mode, so we can
// cap the backlog without ever fully silencing the game.
let pending = 0;

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
};

const FEMALE_VOICE = /amelie|audrey|aurélie|aurelie|marie|julie|hortense|virginie|chantal|léa|lea|female|femme|woman/i;
const MALE_VOICE = /thomas|nicolas|paul|claude|henri|mathieu|male|homme|man/i;

export function speak(text: string, lang = "fr-FR", opts: SpeakOpts = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const interrupt = opts.interrupt ?? true;

  // In queue mode, don't pile up more than a couple of utterances — beyond that
  // the speech would lag noticeably behind the falling tiles.
  if (!interrupt && pending >= 2) return;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const voices = synth.getVoices();
  const inLang = voices.filter(
    (x) => x.lang === lang || x.lang.startsWith(lang.split("-")[0]),
  );
  const rx = opts.gender === "f" ? FEMALE_VOICE : opts.gender === "m" ? MALE_VOICE : null;
  const v = (rx && inLang.find((x) => rx.test(x.name))) || inLang[0];
  if (v) u.voice = v;
  u.rate = 0.95;
  // Pitch is the reliable gender cue when a named voice isn't available.
  u.pitch = opts.gender === "f" ? 1.35 : opts.gender === "m" ? 0.75 : 1;

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
