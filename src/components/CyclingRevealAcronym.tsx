"use client";

/**
 * CyclingRevealAcronym — a sentence that tumbles into place, then folds into
 * the short form hiding inside it.
 *
 * Three acts, all driven from props:
 *
 *   1. CYCLE     Each slot in the template is a little reel. It tumbles
 *                visibly through its candidate words, decelerating, and lands
 *                on the chosen one. Reels start on a stagger, so the sentence
 *                assembles left-to-right rather than snapping at once.
 *   2. SETTLE    The finished sentence sits still and readable for a beat.
 *   3. COLLAPSE  Everything the short form does not need shrinks away, and
 *                what is left slides together into the word it always spelled
 *                — an initialism (FLUO) or a truncation (BeNeLux); see `keep`.
 *
 * WHICH WORDS SURVIVE IS NOT CONFIGURED. They are read off the settled
 * sentence by capitalisation, so changing a word list changes the acronym with
 * no second list to keep in sync.
 *
 * HOW MUCH of each surviving word comes along is the `keep` prop: unset, a
 * word contributes its capitals (Fluent Learners → FL); `keep={3}` and it
 * contributes its first three characters instead (Fluent Learners → Flu Lea),
 * which is the syllabic abbreviation — MoDem, BeNeLux, Interpol — rather than
 * the initialism. A slot can override it, so the parts can be different
 * lengths: Belgium + Netherlands + Luxembourg at 2, 2, 3 is BeNeLux. The rule
 * stays a rule either way: capitalisation decides WHETHER a word contributes,
 * `keep` decides HOW MUCH, and neither is a hand-written list of indices.
 * (`acronymFrom` replaces the whole test for scripts without letter case.)
 *
 * SELF-CONTAINED ON PURPOSE. No app imports, no design tokens, no colours of
 * its own: it inherits font, size and colour from wherever it is dropped, and
 * every dimension it does own is a prop. Style it from outside via `className`
 * / `style`, or off the `data-phase` attribute it stamps on its root.
 *
 * HOW THE COLLAPSE IS MEASURED. The acronym is rendered first as an invisible
 * ghost, absolutely positioned and centred, at its real final size. Each
 * surviving character in the sentence is then translated from where it sits to
 * where its ghost twin sits — so the final arrangement is laid out by the
 * browser (flex, real kerning, real wrapping rules) rather than computed by
 * hand, and the letters can never land somewhere the finished acronym is not.
 * Only transforms and opacity animate; nothing reflows once the collapse
 * starts.
 *
 * Reduced motion is honoured: no tumbling, no flight — the sentence appears,
 * holds, and cross-fades to the acronym.
 */

import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * The static export prerenders client components on the server, where
 * useLayoutEffect warns and does nothing. Measurement genuinely has to happen
 * before paint, so keep the layout effect in the browser and stand down on the
 * server, where there is nothing to measure.
 */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/* ── public types ──────────────────────────────────────────────────────── */

export type CyclingSlot = {
  /** The words this slot tumbles through, in the order they are shown. */
  words: string[];
  /**
   * How many leading characters of the landed word carry into the acronym,
   * overriding the component's `keep`. Unset means "follow the component".
   */
  keep?: number;
  /**
   * The word it stops on — an index into `words`, or the word itself.
   * Defaults to the last word, so a list can simply end on its answer.
   */
  landsOn?: number | string;
};

export type CyclingTiming = {
  /** Quiet beat before the first reel moves. */
  startDelayMs: number;
  /** Duration of one word-step at full speed (the first steps). */
  cycleMs: number;
  /** Duration of the last word-step — the deceleration's slow end. */
  finalCycleMs: number;
  /** How abruptly the reel brakes. 1 = linear, higher = late braking. */
  decelPower: number;
  /** Complete passes through the word list before the landing word. */
  spins: number;
  /** Extra delay per slot, so they land one after another. */
  staggerMs: number;
  /** How long the finished sentence is held, readable, before it folds. */
  settleHoldMs: number;
  /** The fold itself. */
  collapseMs: number;
  /** How long the acronym is held before a `loop` run starts over. */
  acronymHoldMs: number;
};

export type CyclingPhase = "idle" | "cycling" | "settled" | "collapsing" | "acronym";

/** One character of the settled sentence, with everything a rule could want. */
export type AcronymChar = {
  char: string;
  /** Position in the settled sentence, counted in code points. */
  index: number;
  /** The whitespace-delimited word it belongs to. */
  word: string;
  /** Its position within that word. */
  indexInWord: number;
  /** The slot the word came from, or undefined for template text. */
  slot?: number;
  sentence: string;
};

export type AcronymRule = (char: AcronymChar) => boolean;

export type CyclingRevealHandle = {
  /** Run it from the top. */
  play: () => void;
  /** Back to the un-started sentence. */
  reset: () => void;
  /** Jump straight to the finished acronym. */
  skip: () => void;
};

export type CyclingRevealAcronymProps = {
  /**
   * The sentence, with one placeholder per slot: `{0}`, `{1}`, … by index, or
   * a bare `{}` to take the next slot in order. Everything else is literal.
   */
  template: string;
  slots: CyclingSlot[];
  /** Any subset of the timings; the rest keep their defaults. */
  timing?: Partial<CyclingTiming>;
  /** Run on mount. Default true. Ignored when `start` is supplied. */
  autoStart?: boolean;
  /** Controlled trigger: false → idle, true → run. Overrides `autoStart`. */
  start?: boolean;
  /** Start again after the acronym has been held. */
  loop?: boolean;
  /** Final acronym size, relative to the sentence. 1 = same size. */
  acronymScale?: number;
  /** Space between the acronym's letters, in the acronym's own em. */
  acronymGap?: string;
  /** Optional glue between letters — "." gives F.L.A. */
  acronymSeparator?: string;
  /**
   * How many leading characters each contributing word carries into the
   * acronym. Unset (the default) means "its capitals" — the initialism.
   * `keep={2}` gives the truncated form: Modulator Demodulator → MoDem.
   * A slot's own `keep` wins over this.
   *
   * It never changes WHICH words contribute — that stays capitalisation, so a
   * lowercase connecting word is left out at any `keep`.
   */
  keep?: number;
  /**
   * Replaces the test entirely, for scripts where case means nothing. Still a
   * rule, re-run on whatever the slots landed on; `keep` is ignored when it is
   * supplied, since this predicate already decides every character.
   */
  acronymFrom?: AcronymRule;
  /**
   * Reel width while spinning. "max" holds every reel at its widest candidate
   * so the line never re-wraps mid-spin, then eases down to the landed word.
   * "word" lets the reel breathe with each word, which jostles the line.
   */
  spinWidth?: "max" | "word";
  /** Line height for the sentence. The reels are exactly one line tall. */
  lineHeight?: number;
  onPhaseChange?: (phase: CyclingPhase) => void;
  onSettled?: (sentence: string) => void;
  onAcronym?: (acronym: string) => void;
  className?: string;
  style?: CSSProperties;
};

/* ── defaults ──────────────────────────────────────────────────────────── */

const DEFAULT_TIMING: CyclingTiming = {
  startDelayMs: 300,
  cycleMs: 80,
  finalCycleMs: 380,
  decelPower: 3,
  spins: 1,
  staggerMs: 260,
  settleHoldMs: 1300,
  collapseMs: 900,
  acronymHoldMs: 2200,
};

/** Brisk, mechanical: the reel is being driven, not floating. */
const SPIN_EASE = "cubic-bezier(.35,.02,.25,1)";
/** The landing overshoots a hair and rocks back, like a stopped drum. */
const LAND_EASE = "cubic-bezier(.22,1.28,.38,1)";
/** Letters leave slowly, arrive fast — reads as "pulled together". */
const FLY_EASE = "cubic-bezier(.62,.02,.2,1)";

const REDUCED_FADE_MS = 260;

/* ── template parsing ──────────────────────────────────────────────────── */

type Piece =
  | { kind: "text"; text: string; start: number }
  | { kind: "slot"; slot: number; text: string; start: number };

const PLACEHOLDER = /\{(\d*)\}/g;

/** Length in code points — the unit every index in this file is counted in. */
const len = (s: string) => Array.from(s).length;

function parse(template: string, landedWords: string[]): { pieces: Piece[]; sentence: string } {
  const pieces: Piece[] = [];
  let cursor = 0; // index into `template`
  let offset = 0; // index into the settled sentence, in code points
  let auto = 0;
  let sentence = "";

  const pushText = (text: string) => {
    if (!text) return;
    pieces.push({ kind: "text", text, start: offset });
    sentence += text;
    offset += len(text);
  };

  PLACEHOLDER.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PLACEHOLDER.exec(template))) {
    pushText(template.slice(cursor, m.index));
    const slot = m[1] === "" ? auto++ : Number(m[1]);
    const word = landedWords[slot];
    if (word === undefined) {
      // A placeholder with no slot behind it stays literal rather than
      // vanishing — a missing word list should be visible, not silent.
      pushText(m[0]);
    } else {
      pieces.push({ kind: "slot", slot, text: word, start: offset });
      sentence += word;
      offset += len(word);
    }
    cursor = m.index + m[0].length;
  }
  pushText(template.slice(cursor));
  return { pieces, sentence };
}

/* ── shared atoms ──────────────────────────────────────────────────────── */

const ATOM: CSSProperties = { display: "inline-block", verticalAlign: "top" };

/**
 * One word as individually transformable characters.
 *
 * Every character must be its own inline-BLOCK: `transform` does nothing to a
 * plain inline box, and the collapse is nothing but transforms. The word
 * wrapper keeps its characters from breaking across lines now that the browser
 * sees them as separate boxes.
 */
function Word({
  text,
  start,
  register,
  charStyle,
}: {
  text: string;
  /** Index of this word's first character in the settled sentence, or -1 for
   *  reel filler that never takes part in the collapse. */
  start: number;
  register?: (index: number, el: HTMLElement | null) => void;
  charStyle?: (index: number) => CSSProperties | undefined;
}) {
  return (
    <span style={{ ...ATOM, whiteSpace: "nowrap" }}>
      {Array.from(text).map((ch, k) => {
        const index = start < 0 ? -1 : start + k;
        return (
          <span
            key={k}
            ref={index < 0 || !register ? undefined : (el) => register(index, el)}
            style={{ ...ATOM, ...(charStyle && index >= 0 ? charStyle(index) : null) }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
}

/** Text with its spaces left as real, breakable whitespace between words. */
function Text({
  text,
  start,
  register,
  charStyle,
}: {
  text: string;
  start: number;
  register?: (index: number, el: HTMLElement | null) => void;
  charStyle?: (index: number) => CSSProperties | undefined;
}) {
  const out: ReactNode[] = [];
  let offset = start;
  // Split keeping the separators, so whitespace runs keep their own indices.
  text.split(/(\s+)/).forEach((token, i) => {
    if (!token) return;
    if (/^\s+$/.test(token)) out.push(<span key={i}>{token}</span>);
    else out.push(<Word key={i} text={token} start={offset} register={register} charStyle={charStyle} />);
    offset += len(token);
  });
  return <>{out}</>;
}

/* ── the reel ──────────────────────────────────────────────────────────── */

/**
 * One slot, mid-tumble.
 *
 * The strip is written out flat — every word the reel will show, in the order
 * it will show them — and slid upward one line per step. Flat beats wrapping
 * a modulo around a short list: the movement is always upward, there is no
 * frame where a word jumps back down to re-enter, and the extra word past the
 * landing one gives the overshoot something to reveal instead of a blank.
 */
function Reel({
  words,
  landIndex,
  delayMs,
  timing,
  running,
  widthOf,
  lineHeightPx,
  spinWidth,
  onLand,
}: {
  words: string[];
  landIndex: number;
  delayMs: number;
  timing: CyclingTiming;
  running: boolean;
  widthOf: (wordIndex: number) => number | undefined;
  lineHeightPx: number | undefined;
  spinWidth: "max" | "word";
  onLand: () => void;
}) {
  const steps = Math.max(0, timing.spins * words.length + landIndex);
  const strip = useMemo(
    // One past the landing word, for the overshoot to reveal.
    () => Array.from({ length: steps + 2 }, (_, k) => k % words.length),
    [steps, words.length],
  );

  const [step, setStep] = useState(0);
  const [dur, setDur] = useState(timing.cycleMs);
  // Both read through refs, never through a dependency: `timing={{ cycleMs: 50 }}`
  // written inline is a new object on every parent render, and a tumble that
  // restarts whenever its parent re-renders never reaches its last word.
  // Refreshed in an effect rather than during render — the timers that read
  // them only ever fire after a commit, so they are never stale by then.
  const landRef = useRef(onLand);
  const cfg = useRef(timing);
  useEffect(() => {
    landRef.current = onLand;
    cfg.current = timing;
  });

  useEffect(() => {
    if (!running) return;
    let timer = 0;
    let i = 0;
    const tick = () => {
      if (i >= steps) {
        landRef.current();
        return;
      }
      const { cycleMs, finalCycleMs, decelPower } = cfg.current;
      const t = steps <= 1 ? 1 : i / (steps - 1);
      const d = cycleMs + (finalCycleMs - cycleMs) * Math.pow(t, decelPower);
      i += 1;
      setDur(d);
      setStep(i);
      timer = window.setTimeout(tick, d);
    };
    timer = window.setTimeout(tick, delayMs);
    return () => window.clearTimeout(timer);
  }, [running, steps, delayMs]);

  const landed = step >= steps;

  /* Before the ruler has run — server-rendered HTML, and the frame before the
   * first layout effect — there is no width or line height to give the reel.
   * An empty box with absolutely positioned children would collapse to
   * nothing, so the sentence would flash blank. Until it is measured the reel
   * is simply the word, in normal flow. */
  if (lineHeightPx === undefined) {
    return <Word text={words[strip[Math.min(step, strip.length - 1)]]} start={-1} />;
  }

  const maxWidth = words.reduce((w, _, i) => Math.max(w, widthOf(i) ?? 0), 0);
  const snug = widthOf(strip[Math.min(step, strip.length - 1)]);
  // Held at its widest while spinning so the line cannot re-wrap under the
  // reader, then eased down to the landed word on the final, slowest step.
  const width = landed || spinWidth === "word" ? snug : maxWidth || undefined;
  const ease = landed ? LAND_EASE : SPIN_EASE;

  return (
    <span
      style={{
        ...ATOM,
        position: "relative",
        overflow: "hidden",
        width: width ? `${width}px` : undefined,
        height: lineHeightPx ? `${lineHeightPx}px` : undefined,
        transition: `width ${dur}ms ${ease}`,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${-step * 100}%)`,
          transition: `transform ${dur}ms ${ease}`,
          willChange: "transform",
        }}
      >
        {strip.map((w, k) => (
          <span
            key={k}
            style={{
              position: "absolute",
              top: `${k * 100}%`,
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            <Word text={words[w]} start={-1} />
          </span>
        ))}
      </span>
    </span>
  );
}

/* ── the component ─────────────────────────────────────────────────────── */

const isCapital = (ch: string) => /\p{Lu}/u.test(ch);

/**
 * Read at the moment a run starts, not subscribed to in render.
 *
 * A hook that learns the preference in an effect learns it one render too
 * late — the run has already been kicked off by then, and it tumbles anyway.
 * Reading it here also keeps the first client render identical to the
 * prerendered HTML, which a state that differs between server and browser
 * would not.
 */
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const CyclingRevealAcronym = forwardRef<CyclingRevealHandle, CyclingRevealAcronymProps>(
  function CyclingRevealAcronym(
    {
      template,
      slots,
      timing: timingProp,
      autoStart = true,
      start,
      loop = false,
      acronymScale = 1.5,
      acronymGap = "0.08em",
      acronymSeparator = "",
      keep,
      acronymFrom,
      spinWidth = "max",
      lineHeight = 1.35,
      onPhaseChange,
      onSettled,
      onAcronym,
      className,
      style,
    },
    ref,
  ) {
    const timing = useMemo(() => ({ ...DEFAULT_TIMING, ...timingProp }), [timingProp]);

    /* which word each slot stops on */
    const landIndexes = useMemo(
      () =>
        slots.map((s) => {
          if (typeof s.landsOn === "number") return Math.max(0, Math.min(s.words.length - 1, s.landsOn));
          if (typeof s.landsOn === "string") {
            const i = s.words.indexOf(s.landsOn);
            return i >= 0 ? i : s.words.length - 1;
          }
          return s.words.length - 1;
        }),
      [slots],
    );

    const { pieces, sentence } = useMemo(
      () => parse(template, slots.map((s, i) => s.words[landIndexes[i]] ?? "")),
      [template, slots, landIndexes],
    );

    /**
     * The settled sentence cut into whitespace-delimited words, each still
     * knowing where it starts and which slot (if any) it came from. Both parts
     * of the acronym rule are per-word — which words contribute, and how much
     * of each — so the words have to exist before either can be applied.
     */
    const words = useMemo(() => {
      const out: { text: string; start: number; slot?: number }[] = [];
      for (const p of pieces) {
        let offset = p.start;
        for (const token of p.text.split(/(\s+)/)) {
          if (token && !/^\s+$/.test(token)) {
            out.push({ text: token, start: offset, slot: p.kind === "slot" ? p.slot : undefined });
          }
          offset += len(token);
        }
      }
      return out;
    }, [pieces]);

    /**
     * The survivors.
     *
     * Two questions, answered separately. WHICH words contribute is
     * capitalisation, always — that is what makes the acronym follow the words
     * the slots landed on instead of a list someone has to remember to update.
     * HOW MUCH of a contributing word comes along is `keep`: its capitals when
     * unset, its first `keep` characters when set, and a slot may set its own
     * so BeNeLux can take 2, 2 and 3.
     */
    const kept = useMemo(() => {
      const out: { index: number; char: string }[] = [];
      for (const w of words) {
        const chars = Array.from(w.text);
        const push = (i: number) => out.push({ index: w.start + i, char: chars[i] });

        if (acronymFrom) {
          chars.forEach((char, i) => {
            if (acronymFrom({ char, index: w.start + i, word: w.text, indexInWord: i, slot: w.slot, sentence }))
              push(i);
          });
          continue;
        }
        const capitals = chars.map((c, i) => (isCapital(c) ? i : -1)).filter((i) => i >= 0);
        if (capitals.length === 0) continue; // a lowercase connecting word, at any keep
        const n = (w.slot !== undefined ? slots[w.slot]?.keep : undefined) ?? keep;
        if (n === undefined) capitals.forEach(push);
        else for (let i = 0; i < Math.min(n, chars.length); i++) push(i);
      }
      return out;
    }, [words, sentence, slots, keep, acronymFrom]);

    /**
     * Survivors that were neighbours in the sentence stay neighbours in the
     * acronym: `Fluent` at keep 3 is the single run "Flu", not F · l · u. The
     * gap and the separator go BETWEEN runs, which is what makes MoDem read as
     * two parts and FLUO as four.
     */
    const groups = useMemo(() => {
      const out: { index: number; char: string }[][] = [];
      for (const k of kept) {
        const last = out[out.length - 1];
        if (last && k.index === last[last.length - 1].index + 1) last.push(k);
        else out.push([k]);
      }
      return out;
    }, [kept]);

    const acronym = useMemo(
      () => groups.map((g) => g.map((c) => c.char).join("")).join(acronymSeparator),
      [groups, acronymSeparator],
    );

    /* ── phase machine ─────────────────────────────────────────────────── */

    const [phase, setPhase] = useState<CyclingPhase>("idle");
    const [runId, setRunId] = useState(0);
    const landedRef = useRef(0);
    const [flight, setFlight] = useState<Map<number, string> | null>(null);
    const [reduced, setReduced] = useState(false);

    const play = useCallback(() => {
      const quiet = prefersReducedMotion();
      landedRef.current = 0;
      setFlight(null);
      setReduced(quiet);
      setRunId((r) => r + 1);
      // Nothing tumbles under reduced motion; the sentence is simply there.
      setPhase(quiet ? "settled" : "cycling");
    }, []);

    const reset = useCallback(() => {
      landedRef.current = 0;
      setFlight(null);
      setRunId((r) => r + 1);
      setPhase("idle");
    }, []);

    const skip = useCallback(() => {
      landedRef.current = slots.length;
      setFlight(null);
      setPhase("acronym");
    }, [slots.length]);

    useImperativeHandle(ref, () => ({ play, reset, skip }), [play, reset, skip]);

    /* Trigger: controlled `start` when given, otherwise `autoStart` on mount.
     * Web fonts are waited for — measuring the collapse against a fallback
     * face lands every letter a few pixels wrong. */
    const startedRef = useRef(false);
    useEffect(() => {
      if (start === false) {
        // Synchronising to a controlled prop is what this effect is for; the
        // rule's usual complaint (state derivable during render) does not
        // apply to a timeline that has to be torn down.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        reset();
        startedRef.current = false;
        return;
      }
      const wanted = start === true || (start === undefined && autoStart);
      if (!wanted || startedRef.current) return;
      startedRef.current = true;
      let cancelled = false;
      const go = () => !cancelled && play();
      const fonts = typeof document !== "undefined" ? document.fonts : undefined;
      if (fonts && fonts.status !== "loaded") fonts.ready.then(go);
      else go();
      return () => {
        cancelled = true;
      };
    }, [start, autoStart, play, reset]);

    const collapseMs = reduced ? REDUCED_FADE_MS : timing.collapseMs;

    useEffect(() => {
      onPhaseChange?.(phase);
      if (phase === "settled") onSettled?.(sentence);
      if (phase === "acronym") onAcronym?.(acronym);
    }, [phase, onPhaseChange, onSettled, onAcronym, sentence, acronym]);

    useEffect(() => {
      if (phase === "settled") {
        const t = window.setTimeout(() => setPhase("collapsing"), timing.settleHoldMs);
        return () => window.clearTimeout(t);
      }
      if (phase === "collapsing") {
        const t = window.setTimeout(() => setPhase("acronym"), collapseMs);
        return () => window.clearTimeout(t);
      }
      if (phase === "acronym" && loop) {
        const t = window.setTimeout(play, timing.acronymHoldMs);
        return () => window.clearTimeout(t);
      }
      // Primitives only, for the same reason the reel reads its timing from a
      // ref: an inline `timing` object would re-arm the hold on every render
      // and the sentence would never move on.
    }, [phase, timing.settleHoldMs, timing.acronymHoldMs, collapseMs, loop, play]);

    const onLand = useCallback(() => {
      landedRef.current += 1;
      // Only a run that is still tumbling may settle: a reel landing after
      // skip() or reset() must not drag the sentence back.
      if (landedRef.current >= slots.length) setPhase((p) => (p === "cycling" ? "settled" : p));
    }, [slots.length]);

    /* ── measurement ───────────────────────────────────────────────────── */

    const stageRef = useRef<HTMLSpanElement>(null);
    const rulerRef = useRef<HTMLSpanElement>(null);
    const ghostRef = useRef<HTMLSpanElement>(null);
    const charEls = useRef(new Map<number, HTMLElement>());
    const ghostEls = useRef(new Map<number, HTMLElement>());
    const [metrics, setMetrics] = useState<{
      widths: number[][];
      lineHeightPx: number;
      /** ≤ 1 — how much the acronym must shrink to fit the stage. */
      fit: number;
    } | null>(null);

    const register = useCallback((index: number, el: HTMLElement | null) => {
      if (el) charEls.current.set(index, el);
      else charEls.current.delete(index);
    }, []);

    /* Reel widths are measured off the SAME per-character markup the reel
     * renders, so a reel that has stopped is exactly as wide as the plain
     * text that replaces it for the collapse — no half-pixel jump at the
     * handover. */
    const measure = useCallback(() => {
      const ruler = rulerRef.current;
      if (!ruler) return;
      const rows = Array.from(ruler.querySelectorAll<HTMLElement>("[data-slot]"));
      const widths: number[][] = slots.map(() => []);
      for (const row of rows) {
        const s = Number(row.dataset.slot);
        const w = Number(row.dataset.word);
        (widths[s] ||= [])[w] = row.getBoundingClientRect().width;
      }
      const line = ruler.querySelector<HTMLElement>("[data-line]");

      /* `keep` can make the acronym longer than the sentence's own box — a
       * four-word line at keep 3 is twelve characters at acronymScale. The
       * ruler carries an unscaled copy of the finished acronym precisely so
       * the fit can be measured against something the fit has not already
       * changed; measuring the live ghost would shrink it, find it now fits,
       * grow it back, and oscillate. */
      const proof = ruler.querySelector<HTMLElement>("[data-acronym]");
      const room = stageRef.current?.clientWidth ?? 0;
      const want = proof ? proof.getBoundingClientRect().width : 0;
      const fit = want > 0 && room > 0 ? Math.min(1, room / want) : 1;

      setMetrics({ widths, lineHeightPx: line ? line.getBoundingClientRect().height : 0, fit });
    }, [slots]);

    /** The acronym's real size: what was asked for, less whatever it takes to fit. */
    const shownScale = acronymScale * (metrics?.fit ?? 1);

    useMeasureEffect(() => {
      measure();
      const stage = stageRef.current;
      const ruler = rulerRef.current;
      if (!stage || !ruler || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(measure);
      ro.observe(stage);
      // The ruler's acronym changes with `keep`, so the fit must be retaken.
      ro.observe(ruler);
      document.fonts?.ready.then(measure).catch(() => {});
      return () => ro.disconnect();
    }, [measure]);

    const widthOf = useCallback(
      (slot: number, word: number) => metrics?.widths[slot]?.[word],
      [metrics],
    );

    /* ── the flight ────────────────────────────────────────────────────── */

    /**
     * Read where each surviving character is, read where its ghost twin is,
     * and hand the difference back as a transform. Deliberately in a
     * layout effect + one animation frame: the characters must be PAINTED
     * where the sentence left them before the transform is applied, or the
     * browser has no start value to animate from and they teleport.
     */
    useMeasureEffect(() => {
      if (phase !== "collapsing" || reduced) return;
      const stage = stageRef.current;
      if (!stage) return;
      const scale = shownScale;
      const next = new Map<number, string>();
      kept.forEach((k) => {
        const src = charEls.current.get(k.index);
        const dst = ghostEls.current.get(k.index);
        if (!src || !dst) return;
        const a = src.getBoundingClientRect();
        const b = dst.getBoundingClientRect();
        const dx = b.left + b.width / 2 - (a.left + a.width / 2);
        const dy = b.top + b.height / 2 - (a.top + a.height / 2);
        next.set(k.index, `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${scale})`);
      });
      const raf = requestAnimationFrame(() => setFlight(next));
      return () => cancelAnimationFrame(raf);
    }, [phase, kept, shownScale, reduced]);

    /* ── rendering ─────────────────────────────────────────────────────── */

    const collapsing = phase === "collapsing" || phase === "acronym";
    const total = Math.max(1, len(sentence));

    const charStyle = useCallback(
      (index: number): CSSProperties | undefined => {
        if (!collapsing || reduced) return undefined;
        const fly = flight?.get(index);
        if (fly !== undefined) {
          return {
            transform: fly,
            opacity: phase === "acronym" ? 0 : 1,
            transition: `transform ${timing.collapseMs}ms ${FLY_EASE}`,
            willChange: "transform",
            position: "relative",
            zIndex: 1,
          };
        }
        if (kept.some((k) => k.index === index)) return { position: "relative", zIndex: 1 };
        // Everything the acronym does not keep: out of the way, staggered
        // across the line so the sentence dissolves rather than blinks.
        const delay = flight ? (index / total) * timing.collapseMs * 0.3 : 0;
        return {
          opacity: flight ? 0 : 1,
          transform: flight ? "scale(0.35)" : undefined,
          transition: `opacity ${timing.collapseMs * 0.5}ms ease-in ${delay}ms, transform ${
            timing.collapseMs * 0.7
          }ms ease-in ${delay}ms`,
          willChange: "transform, opacity",
        };
      },
      [collapsing, reduced, flight, phase, kept, timing.collapseMs, total],
    );

    const ghostItems: ReactNode[] = [];
    groups.forEach((group, gi) => {
      if (gi > 0 && acronymSeparator) {
        ghostItems.push(
          <span
            key={`sep${gi}`}
            style={{
              opacity: collapsing ? 1 : 0,
              transition: `opacity ${collapseMs * 0.5}ms ease ${collapseMs * 0.45}ms`,
            }}
          >
            {acronymSeparator}
          </span>,
        );
      }
      ghostItems.push(
        // One run, set tight: the gap belongs between runs, not inside a word's
        // own truncation.
        <span key={gi} style={{ display: "inline-flex" }}>
          {group.map((k) => (
            <span
              key={k.index}
              ref={(el) => {
                if (el) ghostEls.current.set(k.index, el);
                else ghostEls.current.delete(k.index);
              }}
              style={{
                // The ghost is the target, not the actor: invisible until the
                // flying letters have arrived exactly on top of it, then
                // swapped in so the finished acronym is real, selectable text
                // at its real size rather than a scaled-up transform.
                opacity: phase === "acronym" ? 1 : 0,
                transition: reduced ? `opacity ${REDUCED_FADE_MS}ms ease` : undefined,
              }}
            >
              {k.char}
            </span>
          ))}
        </span>,
      );
    });

    return (
      <span
        ref={stageRef}
        className={className}
        data-phase={phase}
        style={{ position: "relative", display: "block", lineHeight, ...style }}
      >
        {/* What a screen reader gets: the sentence and its initials, once,
            without the churn in between. */}
        <span
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
          }}
        >
          {sentence} ({acronym})
        </span>

        <span aria-hidden style={{
            display: "block",
            // Gone once the acronym is up — including on skip(), where no
            // letter ever flew and so none was individually hidden.
            opacity: phase === "acronym" ? 0 : 1,
            transition: reduced ? `opacity ${REDUCED_FADE_MS}ms ease` : undefined,
          }}>
          {pieces.map((p, i) => {
            if (p.kind === "text")
              return (
                <Text
                  key={i}
                  text={p.text}
                  start={p.start}
                  register={register}
                  charStyle={charStyle}
                />
              );
            // A stopped reel becomes ordinary characters at the moment the
            // collapse begins — same glyphs, same measured width, but now
            // individually transformable.
            if (collapsing)
              return (
                <Word
                  key={i}
                  text={p.text}
                  start={p.start}
                  register={register}
                  charStyle={charStyle}
                />
              );
            return (
              <Reel
                key={`${runId}:${i}`}
                words={slots[p.slot].words}
                landIndex={landIndexes[p.slot]}
                delayMs={timing.startDelayMs + timing.staggerMs * p.slot}
                timing={timing}
                running={phase === "cycling"}
                widthOf={(w) => widthOf(p.slot, w)}
                lineHeightPx={metrics?.lineHeightPx}
                spinWidth={spinWidth}
                onLand={onLand}
              />
            );
          })}
        </span>

        {/* The acronym, laid out for real by the browser and used as the
            flight's destination. */}
        <span
          ref={ghostRef}
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: acronymGap,
            fontSize: `${shownScale}em`,
            whiteSpace: "nowrap",
            pointerEvents: phase === "acronym" ? undefined : "none",
          }}
        >
          {ghostItems}
        </span>

        {/* Off-screen ruler: every candidate word in the real font, so a reel
            knows how wide it must be before it ever moves. */}
        <span
          ref={rulerRef}
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            visibility: "hidden",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <span data-line style={ATOM}>
            M
          </span>
          <span
            data-acronym
            style={{ ...ATOM, display: "inline-flex", gap: acronymGap, fontSize: `${acronymScale}em` }}
          >
            {groups.map((g, gi) => (
              <Fragment key={gi}>
                {acronymSeparator && gi > 0 ? <span>{acronymSeparator}</span> : null}
                <span style={{ display: "inline-flex" }}>
                  {g.map((k) => (
                    <span key={k.index}>{k.char}</span>
                  ))}
                </span>
              </Fragment>
            ))}
          </span>
          {slots.map((s, si) =>
            s.words.map((w, wi) => (
              <span key={`${si}:${wi}`} data-slot={si} data-word={wi} style={{ ...ATOM, whiteSpace: "nowrap" }}>
                <Word text={w} start={-1} />
              </span>
            )),
          )}
        </span>
      </span>
    );
  },
);

export default CyclingRevealAcronym;
