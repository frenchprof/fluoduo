"use client";

/**
 * Tap-to-hear delegation for lesson content (Dan, 2026-07-08: every lesson's
 * phrases should be tappable for TTS, like the pretest pills). Wraps a Mémo /
 * Lire block; a tap on any French bit speaks it — no per-lesson wiring.
 *
 * TTS discipline (Dan, 2026-07-08):
 *  - FRENCH ONLY. The voice never reads English: a row is only read whole
 *    when it sits inside a lang="fr" region; a mixed row speaks just its
 *    French span, and an English-only row stays silent.
 *  - No bare function words. « veux », « du », « au » are never said alone in
 *    real speech — a lone article/preposition stays silent (conjugation-table
 *    cells get their row's subject pronoun: « je peux »), while series and
 *    full phrases are always fine.
 *  - Same-category series (« à · en · au · aux », « du / de la / de l' /
 *    des ») are spoken item by item with a one-second pause between them.
 * Real controls inside (buttons, links, inputs) keep their own behaviour.
 */
import type { ReactNode } from "react";
import { speak, speakSequence } from "@/games/letris/speech";

// Conjugation tables: a bare cell like « peux » is never heard alone in real
// French (Dan, 2026-07-08) — when the tapped word is a single token and its
// table row starts with a subject-pronoun cell (je / tu / il / elle / on…),
// speak « je peux », not « peux ». Rows like "je / j'" or "il / elle / on"
// contribute their first pronoun; je elides to j' before a vowel or h.
const SUBJECT_TOKENS = new Set(["je", "j'", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"]);
const NON_VERB = new Set(["ne", "n'", "pas"]);

// Words that never occur alone in speech — a lone tap on one stays silent
// rather than voicing a fragment (Dan, 2026-07-08). In a SERIES they are
// spoken (with pauses); with a subject pronoun they become a phrase.
const FUNCTION_WORDS = new Set([
  "le", "la", "les", "l'", "un", "une", "des", "du", "de", "d'",
  "à", "au", "aux", "en", "ne", "n'", "pas", "et", "ou",
  "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses",
  "ce", "cet", "cette", "ces", "que", "qu'",
]);

function withSubject(el: HTMLElement, text: string): string {
  if (/\s/.test(text) || NON_VERB.has(text.toLowerCase())) return text;
  const row = el.closest("tr");
  const head = row?.querySelector<HTMLElement>("th, td");
  if (!row || !head || head.contains(el)) return text;
  const subj = head.textContent?.trim().split(/[\s/()]+/)[0]?.toLowerCase() ?? "";
  if (!SUBJECT_TOKENS.has(subj)) return text;
  const s = subj === "j'" ? "je" : subj;
  if (s === "je" && /^[aeéèêiîoôuh]/i.test(text)) return `j'${text}`;
  return `${s} ${text}`;
}

const series = (parts: string[]) =>
  speakSequence(parts.map((t) => ({ text: t })), "fr-FR", { gapMs: 1000 });

function sayTapped(el: HTMLElement, text: string) {
  const clean = (t: string) => t.split("—")[0].replace(/\s*\/\s*/g, ", ").trim();
  // « à · en · au · aux » set lines and conjugation runs: item by item, with
  // a one-second beat between each.
  const dotParts = text.split("·").map(clean).filter(Boolean);
  if (dotParts.length > 1) {
    series(dotParts);
    return;
  }
  // Slash series like « du / de la / de l' / des »: same treatment — but only
  // when it clearly IS a series (3+ short items), so « il/elle fait » still
  // reads as one phrase (« il, elle fait »).
  const slashParts = text.split("/").map((s) => s.trim()).filter(Boolean);
  if (slashParts.length >= 3 && slashParts.every((p) => p.split(/\s+/).length <= 2)) {
    series(slashParts.map(clean));
    return;
  }
  const single = withSubject(el, clean(text));
  // Still a lone function word after the pronoun pass → not sayable speech.
  if (!single.includes(" ") && FUNCTION_WORDS.has(single.toLowerCase().replace(/[.,!?;:]/g, ""))) return;
  speak(single, "fr-FR");
}

/** A row's French half when it is ONE contiguous French run split across
 *  several spans (« Parce qu'<b>il fait beau</b> », « Il pleut, il neige ») —
 *  those must be spoken WHOLE, not span by span (Dan, 2026-07-08). Returns
 *  null when the half mixes real English words (chips, glosses) — buttons'
 *  text never counts (they speak for themselves). */
function frenchRun(row: HTMLElement): string | null {
  const half = (row.textContent ?? "").split("—")[0].trim();
  if (!half || half.length > 160) return null;
  const frs = [...row.querySelectorAll<HTMLElement>('[lang="fr"]')].filter((f) => !f.closest("button"));
  if (frs.length === 0) return null;
  let rest = half;
  for (const f of frs) {
    const t = (f.textContent ?? "").trim();
    if (!t) continue;
    const k = rest.indexOf(t);
    if (k >= 0) rest = rest.slice(0, k) + rest.slice(k + t.length);
  }
  // Whatever isn't inside a lang="fr" span must be pure connective tissue
  // (spaces, punctuation) — a single leftover letter means English is mixed in.
  return /^[\s.,;:!?…·«»()'’"\-–—→+/⚠️™]*$/u.test(rest) ? half : null;
}

export default function SpeakZone({ children }: { children: ReactNode }) {
  return (
    <div
      className="speak-zone"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("a, button, input, select, textarea, audio, video")) return;
        const row = target.closest<HTMLElement>("li, td, th, p");
        const rowText = row?.textContent?.trim() ?? "";
        // Inside a lang="fr" region (conjugation tbody, French paragraph):
        // the whole row IS French — read it (minus any « — gloss » tail).
        if (row && rowText && rowText.length <= 160 && row.closest('[lang="fr"]')) {
          sayTapped(row, rowText.split("—")[0].trim());
          return;
        }
        // One contiguous French run split across spans → speak it WHOLE
        // (« parce qu'il fait beau », « il pleut, il neige »), even when the
        // tap landed on just one of its spans.
        const run = row ? frenchRun(row) : null;
        if (row && run) {
          sayTapped(row, run);
          return;
        }
        // Otherwise: the tapped French span, if reasonably phrase-sized.
        const fr = target.closest<HTMLElement>('[lang="fr"]');
        const frText = fr?.textContent?.trim() ?? "";
        if (fr && frText && frText.length <= 80) {
          sayTapped(fr, frText);
          return;
        }
        // Mixed row fallback: NEVER read the English. Exactly one French span
        // → say that; several (a chip scale) or none → silent.
        if (row && rowText && rowText.length <= 160) {
          const frs = [...row.querySelectorAll<HTMLElement>('[lang="fr"]')].filter((f) => !f.closest("button"));
          if (frs.length === 1) {
            const t = frs[0].textContent?.trim() ?? "";
            if (t && t.length <= 80) sayTapped(frs[0], t);
          }
        }
      }}
    >
      {children}
    </div>
  );
}
