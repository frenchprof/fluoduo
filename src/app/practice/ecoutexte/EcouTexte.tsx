"use client";

/**
 * ÉcouTexte — the listening scaffold (Dan, 2026-07-28: "the purpose is to
 * scaffold them in their listening… they should be allowed to replay, pause,
 * and reveal the entire sentences").
 *
 * Audio comes first: the text is generated hidden, one blank per word, and
 * the learner listens as many times as they want before revealing anything.
 * The blanks are TYPEABLE (Dan, 2026-07-28) — a word-shaped box per word, so
 * listening can be answered in writing and marked, rather than only revealed.
 *
 * The generator never repeats a sentence: every sentence played is logged
 * (lib/textgen/heard) and the next draw rejects any text that would replay
 * one. When a unit's combinations are genuinely spent the page says so and
 * offers to clear the log rather than quietly repeating.
 *
 * ── The 22 Aug redesign (Dan's Claude Design handoff, direction 1c) ────────
 * Two directions were drawn — a dictation sheet with every sentence in view,
 * and a one-sentence-at-a-time card — and Dan asked for them merged. So the
 * SHEET is the spine: every sentence stays on screen and stays typeable. The
 * sentence you are on is ELEVATED, not exclusive — it opens into a card with
 * larger type, its own 🔊, a verdict, and the two decisions about it. Tapping
 * any row moves the focus; nothing is ever locked away.
 *
 * What else the handoff settled, in Dan's words:
 *   · ONE transport button. "WHY THE HELL DO I NEED AN ADDITIONAL PAUSE
 *     BUTTON" — ⏯ plays, pauses and resumes, at a fixed width so it never
 *     changes shape. This and 🐇 are the two glyphs outside the 21 Aug
 *     registry; the handoff overrides it here on purpose.
 *   · NO WORDS IN THE CONTROLS. Clarity moved outside the buttons: a caption
 *     over the ones that need one, a hint line that names whatever you hover
 *     or focus, and title/aria-label on every control.
 *   · Speed is one 🐇🐌 button and voice is one ♀♂ button — the active half
 *     in full ink, the other faded. Same pattern, twice.
 *   · The blanks button alternates ▬ ▬ ▬ (a blank per word, sized to it) and
 *     ▬▬▬▬ (all the same), and the real blanks follow it: solid when sized,
 *     dotted when equal.
 *   · Length is a plain number picker, not five buttons.
 *   · A sentence that is fully right CONFIRMS ITSELF; a wrong one stays
 *     silent until the learner asks (Check / Show the sentence).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import ActivityUsher from "@/components/ActivityUsher";
import { usherFor } from "@/lib/usher";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import { pauseSpeech, resumeSpeech, speak, speakSequence } from "@/games/letris/speech";
import { gradeAnswer, type Grade } from "@/lib/practice/cloze";
import { fingerprint, generateUnheard } from "@/lib/textgen/engine";
import { clearHeard, loadHeard, saveHeard } from "@/lib/textgen/heard";
import { MAX_SENTENCES, type MiniText, type UnitTextGen } from "@/lib/textgen/types";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { queueForReview, recordItemResult } from "@/lib/progress";
import { HOME_HREF } from "@/lib/routes";

const SLOW_RATE = 0.6;
/** A beat between sentences long enough to hear the sentence boundary. */
const GAP_MS = 700;

const LENGTHS = Array.from({ length: MAX_SENTENCES }, (_, i) => i + 1);

/** A word as the learner meets it: punctuation stays printed, the letters in
 *  between are the blank to fill. Apostrophes count as letters — « l'eau » is
 *  one five-letter box, which is exactly the scaffold the mask used to draw. */
type Word = { pre: string; core: string; post: string };

const EDGE = /^([«"(]*)(.*?)([.,!?;:»")]*)$/;

/**
 * A STANDALONE MARK IS NOT A WORD (Angelina Ong, 2026-09-15, through the 🐞:
 * *"showed 2 blanks when it should just be one for salut, showed 3 blanks when
 * it should just be 2 for ca va"*).
 *
 * FRENCH PUTS A SPACE BEFORE « ! ? : ; », so « Salut ! » splits on whitespace
 * into two tokens and « Ça va ? » into three. `EDGE` then finds no letters in
 * the second one — its `core` is the empty string — and the renderer drew a
 * box for it anyway. Exactly the counts she reported: 2 where 1 belongs, 3
 * where 2 do.
 *
 * It cannot be dropped, because the mark has to stay ON SCREEN — a sentence
 * that loses its « ? » stops being a question. So it is folded into the
 * previous word's `post`, which is already printed beside that word's box, and
 * the box count goes back to the number of words a learner can hear. A mark
 * with nothing before it rides on the NEXT word's `pre` for the same reason.
 */
function words(fr: string): Word[] {
  const out: Word[] = [];
  let lead = "";
  for (const w of fr.split(/\s+/).filter(Boolean)) {
    const m = EDGE.exec(w);
    const pre = m?.[1] ?? "", core = m?.[2] ?? w, post = m?.[3] ?? "";
    if (!core) {
      // No letters: printed punctuation, never a blank to fill.
      if (out.length) out[out.length - 1].post += pre + post;
      else lead += pre + post;
      continue;
    }
    out.push({ pre: lead + pre, core, post });
    lead = "";
  }
  // A sentence of nothing but marks keeps them rather than vanishing.
  if (lead && !out.length) out.push({ pre: "", core: lead, post: "" });
  return out;
}

/** Wide enough for the word, or all the same — the blanks button's two states. */
function boxWidth(core: string, sized: boolean, big: boolean): string {
  if (!sized) return big ? "7.5rem" : "6.5rem";
  const em = core.length * (big ? 0.78 : 0.72) + (big ? 1.2 : 0.9);
  return `${Math.max(big ? 3.2 : 2.6, em)}rem`;
}

export default function EcouTexte({
  gen,
  accent,
  scenarioId,
  header,
  shell = false,
  deck,
}: {
  gen: UnitTextGen;
  accent: string;
  /** Which of the unit's scenarios the topic picker chose; undefined draws any. */
  scenarioId?: string;
  /** The page's topic picker, rendered inside the shell body (shell mode). */
  header?: ReactNode;
  /** Full-screen DrillShell chrome (patch 20–21). */
  shell?: boolean;
  /** The lesson this listening belongs to, where it belongs to one. It reaches
   *  DrillShell so the band can carry the goal number and the ✕ can lead back
   *  to that goal's unit — the general topic picker passes nothing and keeps
   *  the map as its way out. */
  deck?: string;
}) {
  useActivityPlay("ecoutexte", `unite-${gen.unit}`);
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
  /** 🐇🐌 — a standing choice now, not a second "listen slowly" button. */
  const [slow, setSlow] = useState(false);
  /** The blanks button: a box per word sized to it, or all the same. */
  const [sized, setSized] = useState(true);
  /** Which sentence is open. The others stay on screen and stay typeable. */
  const [at, setAt] = useState(0);
  /** What the hint line says — whatever control the pointer or focus is on. */
  const [hint, setHint] = useState("");
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
      const { text: next, fresh } = generateUnheard(gen, { sentences: n, heard: heard(), scenarioId });
      setText(next);
      setExhausted(!fresh);
      setRevealed(next.sentences.map(() => false));
      setWritten(next.sentences.map((s) => words(s.fr).map(() => "")));
      setMarks(next.sentences.map((s) => words(s.fr).map(() => null)));
      setShowEn(false);
      setAt(0);
      loggedRef.current = false;
      return next;
    },
    [gen, heard, scenarioId],
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

  /** `who` and `rate` are passed explicitly when a control changes them in the
   *  same handler: the state set there is not visible to this closure yet. */
  function playAll(who: "f" | "m" = voice, isSlow = slow) {
    // First tap draws as well as plays — one button, no empty state to explain.
    const t = text ?? draw(count);
    logHeard(t);
    stopRef.current?.();
    setPaused(false);
    setPlaying(true);
    stopRef.current = speakSequence(
      t.sentences.map((s) => ({ text: s.fr, gender: who === "m" ? ("m" as const) : undefined })),
      "fr-FR",
      { rate: isSlow ? SLOW_RATE : undefined, gapMs: GAP_MS, onDone: () => setPlaying(false) },
    );
  }

  /** ⏯ — one button for the whole transport. Dan, 22 Aug: no second button. */
  function toggleListen() {
    if (playing && !paused) {
      pauseSpeech();
      setPaused(true);
      return;
    }
    if (playing && paused) {
      resumeSpeech();
      setPaused(false);
      return;
    }
    playAll();
  }

  function playOne(fr: string) {
    if (text) logHeard(text);
    stopRef.current?.();
    setPlaying(false);
    setPaused(false);
    speak(fr, "fr-FR", { rate: slow ? SLOW_RATE : undefined, analytic: "sentence", gender });
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

  /**
   * Mark one sentence word by word, against the row passed in — the auto-check
   * grades the keystroke that has not reached state yet, so the row is an
   * argument rather than read back from `written`. An unwritten box stays
   * unmarked rather than counting as wrong: a blank left alone is not an
   * attempt. Every graded word also feeds the evidence trail, tagged per-unit
   * so it's distinguishable from every other embedded activity.
   */
  function markWith(i: number, row: string[]) {
    if (!text) return;
    const expect = words(text.sentences[i].fr);
    const activity = `ecoutexte:unite-${gen.unit}`;
    // Track D: a sentence marked AFTER it was revealed is copied, not
    // heard — the evidence says so (assistance "answer", not independent)
    // and each word goes to the ReVue queue for an unaided retrieval later.
    // (ÉcouTexte keeps its own per-sentence reveal: it is a multi-blank
    // sheet, not a one-item drill, so the ladder's ? control does not fit.)
    const wasRevealed = !!revealed[i];
    const queued: string[] = [];
    const graded = (marks[i] ?? []).map((v, l) => {
      const typed = row[l]?.trim();
      if (!typed) return v;
      const g = gradeAnswer(row[l], expect[l].core);
      recordItemResult(expect[l].core, g !== "wrong", row[l], activity, wasRevealed ? { revealed: true } : undefined);
      if (wasRevealed) queued.push(expect[l].core);
      return g;
    });
    if (queued.length) queueForReview(queued);
    setMarks((m) => m.map((r, k) => (k === i ? graded : r)));

    /* THE CURSOR GOES WITH THE LEARNER (Jack Chua, 2026-09-15, through the 🐞:
       *"After checking one word, and moving to the next question, the typing
       cursor should remain on the textbox so I don't need to click it again to
       type"*).

       Typing already walks box to box INSIDE a sentence — a full box jumps to
       the next, backspace on an empty one steps back — and then stopped dead
       at the sentence boundary, because `refs` is per-row and a row cannot
       reach its neighbour. So every sentence but the first had to be clicked
       into, which on a five-sentence sheet is four unnecessary clicks in a
       task that is otherwise entirely keyboard.

       Only when the sentence is RIGHT. A marked-wrong sentence is one the
       learner is about to correct, and moving the cursor off it would take the
       cursor away from the very box they need. A frame's wait lets the marks
       paint first. */
    if (graded.length && graded.every((g) => g && g !== "wrong")) {
      const next = i + 1;
      requestAnimationFrame(() => {
        document.querySelector<HTMLInputElement>(`[data-box="${next}-0"]`)?.focus();
      });
    }
  }

  function check(i: number) {
    markWith(i, written[i] ?? []);
  }

  /** Writing an answer spends the text as surely as hearing or reading it.
   *
   *  Dan, 22 Aug: "auto-checks as you finish, meaning if it is correct, it
   *  immediately tells you so, but if it is wrong, then it doesn't respond and
   *  waits for learner to click check/reveal/hint". So the moment every box in
   *  a sentence has something in it we grade it silently; all-right marks
   *  itself and the row turns green, anything wrong says nothing at all. */
  function write(i: number, j: number, value: string) {
    if (text) logHeard(text);
    const row = (written[i] ?? []).map((v, l) => (l === j ? value : v));
    setWritten((w) => w.map((r, k) => (k === i ? row : r)));
    setMarks((m) => m.map((r, k) => (k === i ? r.map((v, l) => (l === j ? null : v)) : r)));
    if (!text) return;
    const expect = words(text.sentences[i].fr);
    const full = expect.every((_, l) => (row[l] ?? "").trim().length > 0);
    if (full && expect.every((w, l) => gradeAnswer(row[l], w.core) !== "wrong")) markWith(i, row);
  }

  function resetHeard() {
    clearHeard(gen.unit);
    heardRef.current = new Set();
    draw(count);
  }

  const sentences = text?.sentences ?? [];
  /** Done = the sentence is right, or the learner asked to see it. Listening
   *  alone is not progress; the scaffold's point is what you do with it. */
  const solvedAt = (i: number) => {
    if (revealed[i]) return true;
    const row = marks[i] ?? [];
    return row.length > 0 && row.every((m) => m !== null && m !== "wrong");
  };
  const worked = sentences.filter((_, i) => solvedAt(i)).length;
  /* THE END OF AN ÉCOUTEXTE RUN IS THE TEXT, NOT THE ACTIVITY. There is no
     score card here — a dictation is a list that fills in — so "finished" is
     every sentence of the drawn text worked. « ♻️ All heard » is a different
     thing entirely: that is the POOL of texts running out. */
  const textDone = sentences.length > 0 && worked === sentences.length;
  /* WHAT THIS COMPASS CAN AND CANNOT OFFER, said plainly. ÉcouTexte is not in
     `deckActivityTabs`, so it is in no goal's chain: ← and → are absent, and
     ↓ (the same activity at the next stop) has no address to point at. What
     is left is 🎯 and ↻ — and 🎯 is the one Dan said must ALWAYS be offered.
     This is the documented ÉcouTexte gap (AGENTS.md, 9 Sep), showing up here
     as two doors instead of five rather than as a broken link. */
  const usher = useMemo(() => usherFor("ecoutexte", { collectionId: deck ?? null }), [deck]);
  const allRevealed = revealed.length > 0 && revealed.every(Boolean);
  const last = at >= sentences.length - 1;
  /** The learner's own words on the open sentence — the 🛠️ hand-off. */
  const attemptAt = (written[at] ?? []).map((v) => v.trim()).filter(Boolean).join(" ");

  const hintLine =
    hint || (playing && !paused ? "Playing — press ⏯ to pause." : "⏯ play · 🐇🐌 speed · ♀♂ who reads");

  /** Hover/focus copy for a control, so the buttons themselves stay wordless. */
  const hints = {
    play: () => (playing && !paused ? "Pause" : playing ? "Carry on from where it stopped" : "Listen to the whole text"),
    speed: () => (slow ? "Reading at half speed — tap for normal" : "Reading at normal speed — tap for half"),
    voice: () => (voice === "f" ? "A woman is reading — tap for a man" : "A man is reading — tap for a woman"),
    blanks: () =>
      sized ? "Blanks sized to each word — tap for equal" : "Blanks all one length — tap to size them",
  };
  const say = (k: keyof typeof hints) => ({
    onMouseEnter: () => setHint(hints[k]()),
    onMouseLeave: () => setHint(""),
    onFocus: () => setHint(hints[k]()),
    onBlur: () => setHint(""),
  });

  const ctrl =
    "flex h-11 shrink-0 items-center justify-center gap-0.5 rounded-xl border-2 transition hover:brightness-[0.97]";
  const ctrlStyle = { borderColor: "var(--cahier-ink)", background: "var(--cahier-paper-raised)" };

  const body = (
    <div className="space-y-3">
      {/* The band is DrillShell's now (`activity="ecoutexte"` below), not a
          PageBand drawn here.
          WHY THIS MOVED (Dan, 2026-08-27: "i need ecoutexte in the same look
          too"). A hand-rolled PageBand went in on 23 Aug answering this same
          request — and rendered its title at 0x0 from the day it shipped,
          because DrillShell's scrolling body carries `[&_h1]:hidden` to stop
          drills printing a second page title. So the bar appeared, correctly
          coloured, with no word in it: exactly the "not the same look" Dan
          reported again four days later. Measured, not guessed — the h1 had
          the right text, font, size and colour, and computed display:none.
          Letting the shell own the band puts the heading OUTSIDE the hidden
          region and makes this page identical to the other seven drills. */}

      {header}

      {/* The player: five controls, one row, no words on them. */}
      <div
        className="space-y-2.5 rounded-2xl border-2 p-3"
        style={{ borderColor: "var(--cahier-rule)", background: "var(--cahier-paper-raised)" }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleListen}
            {...say("play")}
            title={playing && !paused ? "Pause" : "Listen"}
            aria-label={playing && !paused ? "Pause" : "Listen"}
            className={`${ctrl} w-16 text-2xl`}
            style={{ borderColor: "var(--cahier-hl-edge)", background: "var(--cahier-hl)", boxShadow: "0 3px 0 0 var(--cahier-hl-edge)" }}
          >
            ⏯
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !slow;
              setSlow(next);
              setHint(next ? "Reading at half speed — tap for normal" : "Reading at normal speed — tap for half");
              if (playing) playAll(voice, next);
            }}
            {...say("speed")}
            title={slow ? "Half speed — tap for normal speed" : "Normal speed — tap for half speed"}
            aria-label={slow ? "Half speed" : "Normal speed"}
            className={`${ctrl} w-16`}
            style={ctrlStyle}
          >
            <span className="text-lg" style={{ opacity: slow ? 0.3 : 1 }} aria-hidden>🐇</span>
            <span className="text-lg" style={{ opacity: slow ? 1 : 0.3 }} aria-hidden>🐌</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const next = voice === "f" ? "m" : "f";
              setVoice(next);
              setHint(next === "f" ? "A woman is reading — tap for a man" : "A man is reading — tap for a woman");
              // Switching while it reads restarts in the new voice — the button
              // demonstrates itself instead of describing itself.
              if (playing) playAll(next, slow);
            }}
            {...say("voice")}
            title={voice === "m" ? "Male voice — tap for the female voice" : "Female voice — tap for the male voice"}
            aria-label={voice === "m" ? "Male voice" : "Female voice"}
            className={`${ctrl} w-14`}
            style={ctrlStyle}
          >
            <span className="text-lg font-bold" style={{ color: voice === "f" ? "var(--cahier-ink)" : "var(--cahier-rule)" }} aria-hidden>♀</span>
            <span className="text-lg font-bold" style={{ color: voice === "m" ? "var(--cahier-ink)" : "var(--cahier-rule)" }} aria-hidden>♂</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSized((v) => !v);
              setHint(!sized ? "Blanks sized to each word — tap for equal" : "Blanks all one length — tap to size them");
            }}
            {...say("blanks")}
            aria-pressed={sized}
            title={sized ? "Blanks sized to each word — tap for equal blanks" : "Equal blanks — tap to size them to each word"}
            aria-label={sized ? "Blanks sized to each word" : "Equal blanks"}
            className={`${ctrl} w-14`}
            style={{ ...ctrlStyle, background: sized ? "var(--cahier-hl)" : "var(--cahier-paper-raised)" }}
          >
            {/* Three short bars, or one long one — the button draws the difference. */}
            <span className="flex items-center" style={{ gap: sized ? 3 : 0 }} aria-hidden>
              <span className="block border-t-[3px] border-[color:var(--cahier-ink)]" style={{ width: sized ? 10 : 34 }} />
              <span className="block border-t-[3px] border-[color:var(--cahier-ink)]" style={{ width: sized ? 10 : 0 }} />
              <span className="block border-t-[3px] border-[color:var(--cahier-ink)]" style={{ width: sized ? 10 : 0 }} />
            </span>
          </button>
          <label className="ml-auto flex shrink-0 flex-col gap-0.5">
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">Length</span>
            <select
              value={count}
              onChange={(e) => {
                const n = Number(e.target.value);
                setCount(n);
                draw(n);
              }}
              aria-label="How many sentences"
              className="h-10 w-14 rounded-xl border-2 px-1.5 text-sm font-bold"
              style={ctrlStyle}
            >
              {LENGTHS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="min-h-[1.05rem] text-xs leading-snug text-[color:var(--cahier-ink-soft)]" aria-live="polite">
          {hintLine}
        </p>
      </div>

      {/* The sheet. Every sentence stays here and stays typeable; the one you
          are on opens up. */}
      {sentences.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 px-4 py-11 text-center">
          <span className="text-3xl" aria-hidden>🎧</span>
          <p className="fluo-serif text-xl font-bold">Listen, then write what you hear.</p>
          <p className="max-w-[34ch] text-sm leading-relaxed text-[color:var(--cahier-ink-soft)]">
            Choose how many sentences above, then press Start. Replay as often as you like.
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {sentences.map((s, i) => {
            const ws = words(s.fr);
            const row = marks[i] ?? [];
            const solved = solvedAt(i) && !revealed[i];
            const shown = !!revealed[i] || solved;
            const attempted = row.some((m) => m !== null);
            const open = i === at;

            const blanks = (
              <Blanks
                words={ws}
                written={written[i] ?? []}
                marks={row}
                sized={sized}
                big={open}
                onWrite={(j, v) => write(i, j, v)}
                onCheck={() => check(i)}
                row={i}
              />
            );

            if (open) {
              return (
                <li
                  key={i}
                  onClick={() => setAt(i)}
                  className="rounded-2xl border-2 p-3.5"
                  style={{
                    borderColor: solved ? "var(--drill-ok)" : "var(--cahier-ink)",
                    background: solved ? "var(--drill-ok-bg)" : "var(--cahier-paper-raised)",
                  }}
                >
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
                      Sentence {i + 1} of {sentences.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => playOne(s.fr)}
                      className="cahier-btn cahier-btn-sm ml-auto shrink-0"
                      title="Listen to this sentence"
                    >
                      <span aria-hidden>🔊</span>This sentence
                    </button>
                  </div>
                  {shown ? (
                    <p lang="fr" className="fluo-serif text-[1.4rem] font-bold leading-snug text-[color:var(--cahier-ink)]">
                      {s.fr}
                    </p>
                  ) : (
                    blanks
                  )}
                  {showEn && <p className="mt-2.5 text-sm text-[color:var(--cahier-ink-soft)]">{s.en}</p>}
                  {solved && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-[color:var(--drill-ok-ink)]">
                      <span aria-hidden>✓</span>That&rsquo;s it — you heard it right.
                    </p>
                  )}
                  {!shown && attempted && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-[color:var(--drill-bad-ink)]">
                      <span aria-hidden>✗</span>The words marked in red need another look.
                    </p>
                  )}
                  {!shown && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => check(i)} className="cahier-btn cahier-btn-sm">
                        Check
                      </button>
                      <button type="button" onClick={() => reveal(i)} className="cahier-btn cahier-btn-sm opacity-70">
                        Show the sentence
                      </button>
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li
                key={i}
                onClick={() => setAt(i)}
                className="flex cursor-pointer gap-2.5 rounded-xl border-b-2 px-1 py-3"
                style={{
                  borderColor: "var(--cahier-rule)",
                  background: solved ? "var(--drill-ok-bg)" : "transparent",
                }}
              >
                <div className="flex w-8 shrink-0 flex-col items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-extrabold"
                    style={{
                      borderColor: solved ? "var(--drill-ok)" : "var(--cahier-rule)",
                      background: solved ? "var(--drill-ok)" : "transparent",
                      color: solved ? "#fff" : "var(--cahier-ink-soft)",
                    }}
                  >
                    {solved ? "✓" : revealed[i] ? "👁" : i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => playOne(s.fr)}
                    title="Listen to this sentence"
                    className="text-base text-[color:var(--cahier-ink-soft)] transition hover:brightness-95"
                  >
                    🔊
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  {shown ? (
                    <p lang="fr" className="fluo-serif text-base font-bold text-[color:var(--cahier-ink)]">
                      {s.fr}
                    </p>
                  ) : (
                    blanks
                  )}
                  {shown && showEn && (
                    <p className="mt-0.5 text-xs text-[color:var(--cahier-ink-soft)]">{s.en}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {sentences.length > 0 && (
        <button
          type="button"
          onClick={revealAll}
          disabled={allRevealed}
          className="cahier-btn cahier-btn-sm w-full justify-center opacity-70 disabled:opacity-30"
        >
          Show all
        </button>
      )}

      {exhausted && (
        <button
          type="button"
          onClick={resetHeard}
          className="fluo-btn fluo-btn-sm fluo-btn-ghost w-full"
          style={{ borderColor: accent }}
        >
          ♻️ All heard — start over
        </button>
      )}

      {/* Dan, 13 Sep: *"for all the stops there should be something like this
          at the end"*. NO ↻ Redo here, deliberately: this activity cannot
          repeat a text — the shell's primary already reads « New text », and a
          key that drew a DIFFERENT text while calling itself Redo would lie.
          Not drawn in the topic picker (shell === false), which has no run to
          be at the end of. */}
      {shell && textDone && <ActivityUsher usher={usher} />}

      {/* NO 🛠️ here — Dan, 5 Sep, in two steps: first "Voix-Là is for TTS.
          and it does NOT make any sense to have it im EcouTexte" (the
          exercise already speaks), then "doesn'T ecouTexte have a standard
          answer, why does it still beed ChatTutor" — a dictation has ONE
          right sentence and the marking already shows it, so there is
          nothing left for a chat tool to add. The tools live where the
          learner PRODUCES French: WorDrill and ComposeIt. */}
    </div>
  );

  if (!shell) return body;

  // Full page = DrillShell (patch 20–21). One primary: move to the next
  // sentence, and at the end draw a new text. A body Enter that marked a
  // sentence preventDefaults and the shell stands down, so typing can never
  // advance by accident.
  return (
    <DrillShell
      activity="ecoutexte"
      deck={deck}
      exitHref={deck ? drillExitHref(deck) : HOME_HREF}
      progress={text ? { done: worked, total: sentences.length } : null}
      right={text ? <>{worked}/{sentences.length}</> : undefined}
      secondary={
        text ? { label: "🇬🇧 English", onClick: () => setShowEn((v) => !v) } : null
      }
      cta={
        !text
          ? { label: "Start", onClick: () => playAll() }
          : last
            ? { label: "New text", onClick: () => draw(count) }
            : { label: "Next sentence", onClick: () => setAt((k) => k + 1) }
      }
    >
      {body}
    </DrillShell>
  );
}

const MARK_STYLE: Record<Grade, { border: string; bg: string; fg: string }> = {
  perfect: { border: "var(--drill-ok)", bg: "var(--drill-ok-bg)", fg: "var(--drill-ok-ink)" },
  good: { border: "var(--fluo-warn)", bg: "#fffbeb", fg: "#92400e" },
  wrong: { border: "var(--drill-bad)", bg: "var(--drill-bad-bg)", fg: "var(--drill-bad-ink)" },
};

/**
 * One box per word — as wide as the word is long, or all the same width when
 * the blanks button says so. Filling a box jumps to the next, as does a space,
 * so a whole sentence can be written without reaching for the mouse; ⏎ marks
 * it. A box marked wrong prints the word underneath, because being told what
 * you missed is the point of asking.
 */
function Blanks({
  words: ws,
  written,
  marks,
  sized,
  big,
  onWrite,
  onCheck,
  row: rowIndex,
}: {
  words: Word[];
  written: string[];
  marks: (Grade | null)[];
  sized: boolean;
  big: boolean;
  onWrite: (j: number, value: string) => void;
  onCheck: () => void;
  /** Which sentence this is. `refs` above is per-ROW, so it cannot reach the
   *  next sentence's first box; this stamps a `data-box` the parent can find
   *  once a sentence is done (Jack Chua, 2026-09-15, through the 🐞). */
  row: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div className={`flex flex-wrap items-end ${big ? "gap-x-1.5 gap-y-2.5" : "gap-x-1 gap-y-1.5"}`} lang="fr">
      {ws.map((w, j) => {
        const mark = marks[j] ?? null;
        const m = mark ? MARK_STYLE[mark] : null;
        return (
          <span key={j} className="inline-flex items-end">
            {w.pre && <span className={`fluo-serif font-bold ${big ? "text-[1.3rem]" : "text-base"}`}>{w.pre}</span>}
            <span className="inline-flex flex-col items-center">
              <input
                ref={(el) => {
                  refs.current[j] = el;
                }}
                data-box={`${rowIndex}-${j}`}
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
                aria-label={`Word ${j + 1}, ${w.core.length} letters`}
                className={`fluo-serif rounded-lg border-2 px-1 py-0.5 text-center font-bold outline-none transition ${
                  big ? "text-[1.3rem]" : "text-base"
                } ${sized ? "border-solid" : "border-dotted"}`}
                style={{
                  width: boxWidth(w.core, sized, big),
                  borderColor: m ? m.border : "var(--cahier-rule)",
                  background: m ? m.bg : "rgba(255,255,255,.7)",
                  color: m ? m.fg : "var(--cahier-ink)",
                }}
              />
              {mark === "wrong" && (
                <span className="mt-0.5 text-[11px] font-bold text-[color:var(--drill-bad-ink)]">{w.core}</span>
              )}
            </span>
            {w.post && <span className={`fluo-serif font-bold ${big ? "text-[1.3rem]" : "text-base"}`}>{w.post}</span>}
          </span>
        );
      })}
    </div>
  );
}
