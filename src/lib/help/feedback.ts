/**
 * Open-production feedback — the structured schema and the RULE-BASED
 * grader that stands in when /api/feedback is slow, missing or offline
 * (Track D, row 7; docs/TRACK_D_HELP_LADDER.md §4 and §7).
 *
 * The schema is the same whether a model or the rules produced it, so the
 * UI (OpenFeedback.tsx) and the research log never care which. `source`
 * says which, for the log.
 *
 * The rules grade the answer against the model answer with THE grader
 * (lib/practice/cloze.ts — same tiers every drill uses): perfect →
 * correct; good (accent-only) → partial with one "accent" error; otherwise
 * a word-level diff names what is missing / extra / different, and a few
 * A1 patterns (elision, tu/vous, English words) get a kind and a why. It
 * is deliberately conservative: when unsure it says "partial" and points
 * at the model answer, never invents a rule.
 *
 * Pure: relative imports only, so verify28 runs the eval cases in node.
 */
import { deaccent, gradeAnswer, normalize } from "../practice/cloze";

export type Verdict = "correct" | "partial" | "wrong" | "off_task";

export type ErrorKind =
  | "spelling" | "accent" | "agreement" | "conjugation" | "article" | "word_order"
  | "vocabulary" | "register" | "missing" | "extra" | "elision" | "other";

export type FeedbackError = {
  /** Text taken verbatim from the learner's answer. */
  span: string;
  kind: ErrorKind;
  /** The corrected French. */
  fix: string;
  /** One line, English, behind the WHY button. */
  why: string;
};

export type Feedback = {
  verdict: Verdict;
  errors: FeedbackError[];
  model_answer: string;
  /** What to look at next — never the answer. */
  next_hint: string;
  source: "llm" | "rules";
  model?: string;
};

export type FeedbackMode = "correct" | "model";

export type FeedbackRequest = {
  /** Short task id ("lesson-write", "compose"…). */
  task: string;
  /** The task as shown to the learner. */
  prompt: string;
  answer: string;
  model_answer?: string;
  mode?: FeedbackMode;
};

export const VERDICTS: Verdict[] = ["correct", "partial", "wrong", "off_task"];
export const ERROR_KINDS: ErrorKind[] = [
  "spelling", "accent", "agreement", "conjugation", "article", "word_order",
  "vocabulary", "register", "missing", "extra", "elision", "other",
];

/** Runtime check of an object against the schema (what the function returns). */
export function isFeedback(x: unknown): x is Feedback {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (!VERDICTS.includes(o.verdict as Verdict)) return false;
  if (!Array.isArray(o.errors)) return false;
  for (const e of o.errors) {
    if (!e || typeof e !== "object") return false;
    const r = e as Record<string, unknown>;
    if (typeof r.span !== "string" || typeof r.fix !== "string" || typeof r.why !== "string") return false;
    if (!ERROR_KINDS.includes(r.kind as ErrorKind)) return false;
  }
  return typeof o.model_answer === "string" && typeof o.next_hint === "string"
    && (o.source === "llm" || o.source === "rules");
}

// ── the rules ────────────────────────────────────────────────────────────

const INJECTION = /\b(ignore|disregard|forget)\b.*\b(rules?|instructions?|prompt)\b|\bmark (this|it|me) (as )?correct\b|\byou are now\b|\bsystem prompt\b|\bverdict\b.*\bcorrect\b/i;
const PROFANITY = /\b(fuck|shit|merde|putain|connard|salope|bitch|asshole|con)\b/i;
// A handful of English function words that never occur in French — enough
// to tell "I am a student" from « je suis étudiant » without a dictionary.
const ENGLISH = /\b(the|i am|i'm|is|are|and|my|you|have|has|this|that|it's|its|of|to)\b/i;
const FRENCH_MARK = /\b(je|tu|il|elle|nous|vous|ils|elles|suis|es|est|sommes|êtes|sont|le|la|les|un|une|des|du|de|et|à|au|aux|c'est|il y a|j'ai|ne|pas)\b|[àâçéèêëîïôûùüÿœ]/i;
const ELISION = /\b(je|le|la|de|ne|que|me|te|se)\s+([aeiouhâàéèêëîïôûù][^\s.,!?;:]*)/i;

function wordsOf(s: string): string[] {
  return normalize(s).split(" ").filter(Boolean);
}

/** The words of `a` that are not in `b` (multiset-ish, order-free). */
function minus(a: string[], b: string[]): string[] {
  const pool = [...b];
  const out: string[] = [];
  for (const w of a) {
    const k = pool.indexOf(w);
    if (k === -1) out.push(w); else pool.splice(k, 1);
  }
  return out;
}

/**
 * The rule-based grader. `model_answer` is what "correct" means; without
 * one, the rules can only screen (off-task, English, empty) and otherwise
 * say "partial — compare with the model" honestly.
 */
export function ruleFeedback(req: FeedbackRequest): Feedback {
  const answer = (req.answer ?? "").trim();
  const model = (req.model_answer ?? "").trim();
  const base = { model_answer: model, source: "rules" as const };

  if (!answer) return { ...base, verdict: "wrong", errors: [], next_hint: "Write one sentence in French." };
  if (INJECTION.test(answer) || PROFANITY.test(answer)) {
    return { ...base, verdict: "off_task", errors: [], next_hint: "Answer the task in French." };
  }
  // English (or any non-French) answer: wrong, one vocabulary error.
  if (ENGLISH.test(answer) && !FRENCH_MARK.test(answer)) {
    return {
      ...base, verdict: "wrong",
      errors: [{ span: answer.slice(0, 120), kind: "vocabulary", fix: model || "…en français", why: "The task asks for French." }],
      next_hint: "Say it in French — start with « Je … ».",
    };
  }
  if (!model) {
    // Nothing to grade against: screen only.
    return { ...base, verdict: "partial", errors: [], next_hint: "Compare with the model answer." };
  }

  const g = gradeAnswer(answer, model);
  if (g === "perfect") return { ...base, verdict: "correct", errors: [], next_hint: "" };
  if (g === "good") {
    // Accent-only: find the first word that differs by accent.
    const aw = wordsOf(answer), mw = wordsOf(model);
    let span = answer, fix = model;
    for (let k = 0; k < Math.min(aw.length, mw.length); k++) {
      if (aw[k] !== mw[k] && deaccent(aw[k]) === deaccent(mw[k])) { span = aw[k]; fix = mw[k]; break; }
    }
    return {
      ...base, verdict: "partial",
      errors: [{ span, kind: "accent", fix, why: "Same word — the accent is missing or wrong." }],
      next_hint: "Check the accents.",
    };
  }

  const aw = wordsOf(answer), mw = wordsOf(model);
  const errors: FeedbackError[] = [];
  const missing = minus(mw, aw);
  const extra = minus(aw, mw);
  const shared = aw.length - extra.length;
  const overlap = mw.length ? shared / mw.length : 0;

  // Elision: « je aime » → « j'aime ».
  // Only when the model actually elides (j' / l' / d'…) — otherwise « je es »
  // is a verb slip, not an elision one.
  const el = ELISION.exec(answer);
  if (el && model.toLowerCase().replace(/[’‘]/g, "'").includes(`${el[1][0].toLowerCase()}'`)) {
    const w = el[1].toLowerCase();
    errors.push({ span: el[0], kind: "elision", fix: `${w[0]}'${el[2]}`, why: `« ${w} » drops its vowel before a vowel sound: « ${w[0]}'${el[2]} ».` });
  }
  // Register: tu-form where the model uses vous (or the reverse).
  const tuA = /\b(tu|t'|ton|ta|tes)\b/i.test(answer), vousM = /\bvous\b/i.test(model);
  const vousA = /\bvous\b/i.test(answer), tuM = /\b(tu|t'|ton|ta|tes)\b/i.test(model);
  if (tuA && vousM && !vousA) errors.push({ span: (answer.match(/\b(tu|t'|ton|ta|tes)\b/i) ?? ["tu"])[0], kind: "register", fix: "vous", why: "The task is formal — use « vous »." });
  else if (vousA && tuM && !tuA) errors.push({ span: "vous", kind: "register", fix: "tu", why: "The task is informal — use « tu »." });

  // Word-level differences, paired where the model has a same-position word.
  const originalWords = answer.split(/\s+/);
  const findSpan = (norm: string) => originalWords.find((w) => normalize(w) === norm) ?? norm;
  const pairs = Math.min(missing.length, extra.length);
  for (let k = 0; k < pairs; k++) {
    const span = findSpan(extra[k]);
    if (errors.some((e) => normalize(e.span).includes(extra[k]))) continue;
    const kind: ErrorKind = classify(extra[k], missing[k]);
    errors.push({ span, kind, fix: missing[k], why: WHY[kind] });
  }
  const covered = (w: string) => errors.some((e) => normalize(e.span).split(" ").includes(w));
  // The rest of the model that never appeared — ONE error, in model order.
  const left = missing.slice(pairs).filter((w) => !errors.some((e) => normalize(e.fix) === w));
  if (left.length) {
    const fix = mw.filter((w) => left.includes(w)).join(" ");
    errors.push({ span: originalWords[originalWords.length - 1] ?? answer.slice(0, 40), kind: "missing", fix, why: `« ${fix} » is missing.` });
  }
  for (const w of extra.slice(pairs)) {
    if (covered(w)) continue;
    errors.push({ span: findSpan(w), kind: "extra", fix: "", why: `« ${w} » is not needed here.` });
  }

  // Partial = right idea: most of the model is there, or most of what the
  // learner wrote is right, or the difference is a recognised A1 slip.
  const precision = aw.length ? shared / aw.length : 0;
  const slip = errors.some((e) => ["register", "elision", "agreement", "conjugation", "article", "accent"].includes(e.kind));
  const verdict: Verdict = overlap >= 0.5 || precision >= 0.75 || slip ? "partial" : "wrong";
  const next_hint = missing.length
    ? `Look at « ${missing[0]} ».`
    : errors[0]?.why ?? "Compare with the model answer.";
  return { ...base, verdict, errors: errors.slice(0, 8), next_hint };
}

const WHY: Record<ErrorKind, string> = {
  spelling: "Spelling differs from the model.",
  accent: "Same word — the accent is missing or wrong.",
  agreement: "Gender/number agreement — match the noun.",
  conjugation: "The verb form does not match its subject.",
  article: "The article (le/la/un/une/du…) does not match the noun.",
  word_order: "Word order differs from the model.",
  vocabulary: "A different word is expected here.",
  register: "tu/vous — the register does not match the task.",
  missing: "A word is missing.",
  extra: "A word is not needed.",
  elision: "Drop the vowel before a vowel sound (j'aime, l'eau).",
  other: "Compare with the model answer.",
};

const ARTICLES = new Set(["le", "la", "les", "l'", "un", "une", "des", "du", "de", "d'"]);
const AGREE_TAILS = /(e|s|es|ne|nne|se|ienne|aine|oise)$/;
const VERB_TAILS = /(e|es|ent|ons|ez|ais|ait|s|t|x)$/;

/** Best guess at WHAT KIND of difference this is, from the two words. */
export function classify(got: string, want: string): ErrorKind {
  if (!got || !want) return "other";
  if (ARTICLES.has(got) && ARTICLES.has(want)) return "article";
  if (deaccent(got) === deaccent(want)) return "accent";
  const stem = (w: string) => deaccent(w).replace(AGREE_TAILS, "");
  const vstem = (w: string) => deaccent(w).replace(VERB_TAILS, "");
  if (stem(got) === stem(want) && stem(got).length >= 3) return "agreement";
  if (vstem(got) === vstem(want) && vstem(got).length >= 2) return "conjugation";
  // Close in letters → spelling; far → a different word.
  return editDistance(deaccent(got), deaccent(want)) <= 2 ? "spelling" : "vocabulary";
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}
