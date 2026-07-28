"use client";

/**
 * ÉcouTexte — the listening scaffold (Dan, 2026-07-28: "the purpose is to
 * scaffold them in their listening… they should be allowed to replay, pause,
 * and reveal the entire sentences").
 *
 * Audio comes first: the text is generated hidden, one blank per letter, and
 * the learner listens as many times as they want before revealing anything.
 * The blanks are TYPEABLE (Dan, 2026-07-28) — a word-shaped box per word, so
 * listening can be answered in writing and marked, rather than only revealed.
 * Reading the sentence stays the reward, one 👁 away.
 *
 * The generator never repeats a sentence: every sentence played is logged
 * (lib/textgen/heard) and the next draw rejects any text that would replay
 * one. When a unit's combinations are genuinely spent the page says so and
 * offers to clear the log rather than quietly repeating.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { pauseSpeech, resumeSpeech, speak, speakSequence } from "@/games/letris/speech";
import { gradeAnswer, type Grade } from "@/lib/practice/cloze";
import { fingerprint, generateUnheard } from "@/lib/textgen/engine";
import { clearHeard, loadHeard, saveHeard } from "@/lib/textgen/heard";
import { MAX_SENTENCES, type MiniText, type UnitTextGen } from "@/lib/textgen/types";

const SLOW_RATE = 0.6;
/** A beat between sentences long enough to hear the sentence boundary. */
const GAP_MS = 700;

const LENGTHS = Array.from({ length: MAX_SENTENCES }, (_, i) => i + 1);

/** A word as the learner meets it: punctuation stays printed, the letters in
 *  between are the blank to fill. Apostrophes count as letters — « l'eau » is
 *  one five-letter box, which is exactly the scaffold the mask used to draw. */
type Word = { pre: string; core: string; post: string };

const EDGE = /^([«"(]*)(.*?)([.,!?;:»")]*)$/;

function words(fr: string): Word[] {
  return fr.split(/\s+/).filter(Boolean).map((w) => {
    const m = EDGE.exec(w);
    return { pre: m?.[1] ?? "", core: m?.[2] ?? w, post: m?.[3] ?? "" };
  });
}

export default function EcouTexte({ gen, accent }: { gen: UnitTextGen; accent: string }) {
  const [count, setCount] = useState(3);
  const [text, setText] = useState<MiniText | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [showEn, setShowEn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  /** Who reads. Undefined is the site narrator (female, banked clips when they
   *  exist); "m" switches to the cast's male voice for the whole text, so a
   *  learner hears more than one speaker across sessions. */
  const [voice, setVoice] = useState<"f" | "m">("f");
  const gender = voice === "m" ? ("m" as const) : undefined;
  /** What the learner has written, and how it was marked — per sentence, per word. */
  const [written, setWritten] = useState<string[][]>([]);
  const [marks, setMarks] = useState<(Grade | null)[][]>([]);

  // The heard-log is read on first use, not on mount: localStorage is a
  // client-only source and the first text must not be drawn during SSR, or
  // the server would ship one random text and the client hydrate another.
  const heardRef = useRef<Set<string> | null>(null);
  const loggedRef = useRef(false);
  const stopRef = useRef<null | (() => void)>(null);

  const heard = useCallback(() => {
    if (!heardRef.current) heardRef.current = loadHeard(gen.unit);
    return heardRef.current;
  }, [gen.unit]);

  /** Draw a text AND return it, so a handler can draw-then-play in one tap. */
  const draw = useCallback(
    (n: number): MiniText => {
      stopRef.current?.();
      setPlaying(false);
      setPaused(false);
      const { text: next, fresh } = generateUnheard(gen, { sentences: n, heard: heard() });
      setText(next);
      setExhausted(!fresh);
      setRevealed(next.sentences.map(() => false));
      setWritten(next.sentences.map((s) => words(s.fr).map(() => "")));
      setMarks(next.sentences.map((s) => words(s.fr).map(() => null)));
      setShowEn(false);
      loggedRef.current = false;
      return next;
    },
    [gen, heard],
  );

  useEffect(() => () => stopRef.current?.(), []);

  /** Playing a text spends it: from here on it can never be drawn again. */
  function logHeard(t: MiniText) {
    if (loggedRef.current) return;
    loggedRef.current = true;
    const set = heard();
    for (const s of t.sentences) set.add(fingerprint(s.fr));
    saveHeard(gen.unit, set);
  }

  /** `who` is passed explicitly when switching voice mid-text: the state set in
   *  the same handler is not visible to this closure yet. */
  function playAll(slow: boolean, who: "f" | "m" = voice) {
    // First tap draws as well as plays — one button, no empty state to explain.
    const t = text ?? draw(count);
    logHeard(t);
    stopRef.current?.();
    setPaused(false);
    setPlaying(true);
    stopRef.current = speakSequence(
      t.sentences.map((s) => ({ text: s.fr, gender: who === "m" ? ("m" as const) : undefined })),
      "fr-FR",
      { rate: slow ? SLOW_RATE : undefined, gapMs: GAP_MS, onDone: () => setPlaying(false) },
    );
  }

  function playOne(fr: string, slow = false) {
    if (text) logHeard(text);
    stopRef.current?.();
    setPlaying(false);
    setPaused(false);
    speak(fr, "fr-FR", { rate: slow ? SLOW_RATE : undefined, analytic: "sentence", gender });
  }

  function togglePause() {
    if (paused) {
      resumeSpeech();
      setPaused(false);
    } else {
      pauseSpeech();
      setPaused(true);
    }
  }

  // Revealing spends the text too: read once is met once, and meeting it
  // again as a listening exercise would no longer be listening.
  function reveal(i: number) {
    if (text) logHeard(text);
    setRevealed((r) => r.map((v, k) => (k === i ? true : v)));
  }

  function revealAll() {
    if (!text) return;
    logHeard(text);
    setRevealed((r) => r.map(() => true));
  }

  /** Writing an answer spends the text as surely as hearing or reading it. */
  function write(i: number, j: number, value: string) {
    if (text) logHeard(text);
    setWritten((w) => w.map((row, k) => (k === i ? row.map((v, l) => (l === j ? value : v)) : row)));
    setMarks((m) => m.map((row, k) => (k === i ? row.map((v, l) => (l === j ? null : v)) : row)));
  }

  /** Mark one sentence word by word. An unwritten box stays unmarked rather
   *  than counting as wrong — a blank left alone is not an attempt. */
  function check(i: number) {
    if (!text) return;
    const expect = words(text.sentences[i].fr);
    setMarks((m) =>
      m.map((row, k) =>
        k === i ? row.map((v, l) => (written[i]?.[l]?.trim() ? gradeAnswer(written[i][l], expect[l].core) : v)) : row,
      ),
    );
  }

  function resetHeard() {
    clearHeard(gen.unit);
    heardRef.current = new Set();
    draw(count);
  }

  const allRevealed = revealed.length > 0 && revealed.every(Boolean);

  return (
    <div className="space-y-3">
      {/* How many sentences. */}
      <div className="flex flex-wrap items-center gap-1.5">
        {LENGTHS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setCount(n);
              draw(n);
            }}
            className={`fluo-btn fluo-btn-sm ${count === n ? "" : "fluo-btn-ghost"}`}
            style={count === n ? { background: accent, color: "#fff", boxShadow: `0 4px 0 0 ${accent}99` } : undefined}
            aria-pressed={count === n}
          >
            {n}
          </button>
        ))}
        <button type="button" onClick={() => draw(count)} className="fluo-btn fluo-btn-sm fluo-btn-secondary ml-auto">
          🎲 Un autre
        </button>
      </div>

      {/* Playback. */}
      <div
        className="flex flex-wrap items-center gap-2 rounded-2xl border-2 px-3 py-3"
        style={{ borderColor: accent, background: "var(--fluo-card-tint)" }}
      >
        <button type="button" onClick={() => playAll(false)} className="fluo-btn">
          {playing ? "🔁 Réécouter" : "🎧 Écouter"}
        </button>
        <button type="button" onClick={() => playAll(true)} title="Écouter lentement" className="fluo-btn fluo-btn-sm">
          🐌
        </button>
        <button
          type="button"
          onClick={() => {
            const next = voice === "f" ? "m" : "f";
            setVoice(next);
            // Switching while it reads restarts in the new voice — the button
            // demonstrates itself instead of describing itself.
            if (playing) playAll(false, next);
          }}
          title={voice === "m" ? "Voix masculine — cliquer pour la voix féminine" : "Voix féminine — cliquer pour la voix masculine"}
          aria-label={voice === "m" ? "Voix masculine" : "Voix féminine"}
          className="fluo-btn fluo-btn-sm"
        >
          {voice === "m" ? "👨" : "👩"}
        </button>
        <button
          type="button"
          onClick={togglePause}
          disabled={!playing}
          title={paused ? "Reprendre" : "Pause"}
          className="fluo-btn fluo-btn-sm"
        >
          {paused ? "▶" : "⏸"}
        </button>
        <button
          type="button"
          onClick={revealAll}
          disabled={!text || allRevealed}
          className="fluo-btn fluo-btn-sm fluo-btn-ghost ml-auto"
        >
          👁 Tout révéler
        </button>
        <button
          type="button"
          onClick={() => setShowEn((v) => !v)}
          aria-pressed={showEn}
          className={`fluo-btn fluo-btn-sm ${showEn ? "fluo-btn-correct" : "fluo-btn-ghost"}`}
        >
          🇬🇧
        </button>
      </div>

      {/* The text. Each row plays its own sentence, takes what you write into
          its blanks, and the eye opens it. */}
      <ol className="space-y-2">
        {(text?.sentences ?? []).map((s, i) => (
          <li
            key={i}
            className="rounded-2xl border-2 px-3 py-2"
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card)" }}
          >
            <div className="flex items-start gap-1.5">
              <button
                type="button"
                onClick={() => playOne(s.fr)}
                title="Écouter cette phrase"
                className="shrink-0 self-center text-base transition hover:brightness-95"
              >
                🔊
              </button>
              <div className="min-w-0 flex-1">
                {revealed[i] ? (
                  <span lang="fr" className="fluo-serif text-base font-bold text-[color:var(--fluo-ink)]">
                    {s.fr}
                  </span>
                ) : (
                  <Blanks
                    words={words(s.fr)}
                    written={written[i] ?? []}
                    marks={marks[i] ?? []}
                    onWrite={(j, v) => write(i, j, v)}
                    onCheck={() => check(i)}
                  />
                )}
                {revealed[i] && showEn && (
                  <span className="mt-0.5 block text-xs text-[color:var(--fluo-ink-soft)]">{s.en}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => playOne(s.fr, true)}
                title="Écouter lentement"
                className="self-center rounded-full border-2 px-1.5 py-0.5 text-sm transition hover:bg-white/60"
                style={{ borderColor: "var(--fluo-card-accent)" }}
              >
                🐌
              </button>
              {!revealed[i] && (
                <button
                  type="button"
                  onClick={() => check(i)}
                  title="Corriger ce que j'ai écrit"
                  className="self-center rounded-full border-2 px-1.5 py-0.5 text-sm transition hover:bg-white/60"
                  style={{ borderColor: "var(--fluo-card-accent)" }}
                >
                  ✓
                </button>
              )}
              <button
                type="button"
                onClick={() => reveal(i)}
                disabled={revealed[i]}
                title="Révéler cette phrase"
                className="self-center rounded-full border-2 px-1.5 py-0.5 text-sm transition hover:bg-white/60 disabled:opacity-30"
                style={{ borderColor: "var(--fluo-card-accent)" }}
              >
                👁
              </button>
            </div>
          </li>
        ))}
      </ol>

      {exhausted && (
        <button
          type="button"
          onClick={resetHeard}
          className="fluo-btn fluo-btn-sm fluo-btn-ghost w-full"
          style={{ borderColor: accent }}
        >
          ♻️ Tout est déjà écouté — recommencer
        </button>
      )}
    </div>
  );
}

const MARK_STYLE: Record<Grade, string> = {
  perfect: "border-emerald-500 bg-emerald-50 text-emerald-800",
  good: "border-amber-500 bg-amber-50 text-amber-800",
  wrong: "border-rose-500 bg-rose-50 text-rose-800",
};

/**
 * One box per word, as wide as the word is long — the same scaffold the ▁▁▁
 * mask drew, only writable. Filling a box jumps to the next, as does a space,
 * so a whole sentence can be written without reaching for the mouse; ⏎ marks
 * it. A box marked wrong prints the word underneath, because being told what
 * you missed is the point of asking.
 */
function Blanks({
  words: ws,
  written,
  marks,
  onWrite,
  onCheck,
}: {
  words: Word[];
  written: string[];
  marks: (Grade | null)[];
  onWrite: (j: number, value: string) => void;
  onCheck: () => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div className="flex flex-wrap items-end gap-x-1 gap-y-1.5" lang="fr">
      {ws.map((w, j) => {
        const mark = marks[j] ?? null;
        return (
          <span key={j} className="inline-flex items-end">
            {w.pre && <span className="fluo-serif text-base font-bold">{w.pre}</span>}
            <span className="inline-flex flex-col items-center">
              <input
                ref={(el) => {
                  refs.current[j] = el;
                }}
                value={written[j] ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.endsWith(" ")) {
                    onWrite(j, v.trimEnd());
                    refs.current[j + 1]?.focus();
                    return;
                  }
                  onWrite(j, v);
                  if (v.length >= w.core.length) refs.current[j + 1]?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onCheck();
                  } else if (e.key === "Backspace" && !(written[j] ?? "")) {
                    refs.current[j - 1]?.focus();
                  }
                }}
                maxLength={w.core.length + 3}
                autoComplete="off"
                spellCheck={false}
                aria-label={`Mot ${j + 1}, ${w.core.length} lettres`}
                className={`fluo-serif rounded-lg border-2 border-dashed px-1 py-0.5 text-center text-base font-bold outline-none transition focus:border-solid ${
                  mark ? `border-solid ${MARK_STYLE[mark]}` : "border-[color:var(--fluo-card-accent)] bg-white/70"
                }`}
                style={{ width: `${Math.max(2, w.core.length * 0.72 + 0.9)}rem` }}
              />
              {mark === "wrong" && (
                <span className="mt-0.5 text-[11px] font-bold text-rose-700">{w.core}</span>
              )}
            </span>
            {w.post && <span className="fluo-serif text-base font-bold">{w.post}</span>}
          </span>
        );
      })}
    </div>
  );
}
