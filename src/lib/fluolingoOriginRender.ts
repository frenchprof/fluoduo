/**
 * The name-origin animation's engine — DOM, no framework (2026-08-30).
 *
 * Split out of `FluolingoOrigin.tsx` on 30 Aug so there is exactly ONE
 * renderer. It is mounted twice: by the React component inside the app, and by
 * `scripts/build-origin-html.mjs`, which compiles this file and
 * `fluolingoOrigin.ts` into a single standalone HTML page anyone can open or
 * send on. A second implementation of an animation this fussy would drift
 * within a week, and only one of the two would be the one Dan is looking at.
 *
 * WHY IT IS NOT CSS. Every rule in the spec is about the phrase's INTERIOR:
 * the survivors must travel into the room the departing letters give up, the
 * whole thing must stay centred on its own centre while they do, and the font
 * must never step back down. Flow layout can do none of those — it re-centres
 * in one frame, which is the "teleport after each transformation" the spec
 * rules out. So every letter is placed by hand:
 *
 *   - character advances are measured ONCE, in em, off a canvas context, so
 *     one pass serves every font size;
 *   - a letter that has left the phrase is laid out with ZERO WIDTH on the
 *     seam it closed, which makes the survivors' target positions already
 *     hole-free — travelling towards them IS the inward move, and no stale
 *     word width can survive to leave a gap behind;
 *   - both endpoint layouts are centred, so interpolating between them keeps
 *     the phrase centred every frame: the left edge comes in as the right
 *     edge does, and neither side is the anchor.
 *
 * The base size is fitted to the WIDEST sentence any pair of cycling words can
 * make, not to the settled one, so nothing is ever cropped and nothing resizes
 * while the fields are still spinning. After that the size only goes up:
 * `growth` per transformation, compounding.
 *
 * One rAF loop writes transforms straight to the nodes — no framework state
 * per frame, so ~50 glyphs at 60fps cost one style write each.
 */

import {
  BEATS,
  CHIP_FADE,
  FIELD_ONE,
  FIELD_TWO,
  SENTENCE,
  STAGES,
  clamp01,
  cycleTicks,
  cycleWordAt,
  easeMerge,
  easeReduce,
  layoutStage,
  span,
  widestSentenceEm,
  type Placed,
} from "./fluolingoOrigin";

/* Every colour is a token in globals.css — the palette is one file's business,
   and these want to be legible on the ground beside the rest of it. */

/** The four pieces that survive into the name, and the colour each takes. */
export const SURVIVOR_TOKEN: Record<number, string> = {
  0: "--fluo-origin-flu",
  2: "--fluo-origin-o",
  4: "--fluo-origin-lin",
  5: "--fluo-origin-go",
};

/** Behind the two cycling fields only, and only while they cycle. */
export const CHIP_TOKEN: Record<number, string> = {
  1: "--fluo-origin-field-1",
  3: "--fluo-origin-field-2",
};

const TRANSFORMS = [
  { window: BEATS.reduceFields, from: 0, to: 1, ease: easeReduce },
  { window: BEATS.reduceWords, from: 1, to: 2, ease: easeReduce },
  { window: BEATS.reduceOn, from: 2, to: 3, ease: easeReduce },
  { window: BEATS.merge, from: 3, to: 4, ease: easeMerge },
] as const;

/* A word is eaten back from its END: the last letter goes first, the one next
   to the surviving piece goes last. `STAGGER` is how much of the
   transformation that retraction is spread over, `FADE_WIN` how long any one
   letter takes. Together they finish well before the survivors have closed,
   so the material sliding in never has to pass through a letter that is still
   legible — which is what made the first cut of this look like a smudge. */
const STAGGER = 0.34;
const FADE_WIN = 0.28;

export type OriginOptions = {
  /** size gained per transformation; 0 holds the settled size. Never negative. */
  growth?: number;
  /** ceiling for the settled size, in px */
  maxSize?: number;
  /** play again once the final hold is over */
  loop?: boolean;
};

export type OriginHandle = {
  /** start the show again from the first cycling tick */
  replay: () => void;
  /** stop the loop and take every glyph back out of the host */
  destroy: () => void;
};

/**
 * Run the animation inside `host`, which must be a positioned element. The
 * host's own font and colour are what the glyphs inherit, and its width is
 * what the whole thing is fitted to; its height is set here.
 */
export function mountOrigin(host: HTMLElement, opts: OriginOptions = {}): OriginHandle {
  const grow = Math.max(0, opts.growth ?? 0.07);
  const maxSize = opts.maxSize ?? 68;
  const loop = opts.loop ?? true;

  const reduced =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const glyphs = new Map<string, HTMLSpanElement>();
  const chips = new Map<number, HTMLSpanElement>();
  let advCache = new Map<string, number>();
  let base = 24;
  let centreX = 0;
  let centreY = 0;
  let raf = 0;
  let stopped = false;
  let start = 0;

  /* ── measuring ──────────────────────────────────────────────────────── */
  const REF = 1000;
  const meter = document.createElement("canvas").getContext("2d");

  function remeasure() {
    const cs = getComputedStyle(host);
    advCache = new Map();
    if (meter) meter.font = `${cs.fontWeight} ${REF}px ${cs.fontFamily}`;
  }
  const adv = (ch: string): number => {
    const hit = advCache.get(ch);
    if (hit !== undefined) return hit;
    const w = meter ? meter.measureText(ch).width / REF : 0.5;
    advCache.set(ch, w);
    return w;
  };

  /** Fit to the widest thing the show can ever put on screen. */
  function fit() {
    const box = host.getBoundingClientRect();
    const pad = Math.max(16, box.width * 0.04);
    const avail = Math.max(40, box.width - pad * 2);
    const widest = widestSentenceEm(adv);
    const finalEm = layoutStage(STAGES[4], SENTENCE, adv).width;
    const finalGrow = (1 + grow) ** STAGES[4].step;
    base = Math.min(maxSize, avail / widest, avail / (finalEm * finalGrow));
    base = Math.max(10, base);
    centreX = box.width / 2;
    const tall = base * finalGrow * 1.9;
    host.style.height = `${Math.ceil(tall)}px`;
    centreY = tall / 2;
  }

  /* ── one frame ──────────────────────────────────────────────────────── */
  const ticksOne = cycleTicks(BEATS.cycleOneEnds, FIELD_ONE.length);
  const ticksTwo = cycleTicks(BEATS.cycleTwoEnds, FIELD_TWO.length);

  function wordsAt(t: number): string[] {
    if (t >= BEATS.cycleTwoEnds) return [...SENTENCE];
    const w = [...SENTENCE] as string[];
    w[1] = cycleWordAt(t, ticksOne, FIELD_ONE);
    w[3] = cycleWordAt(t, ticksTwo, FIELD_TWO);
    return w;
  }

  type Frame = {
    from: number;
    to: number;
    /** eased progress from `from` to `to` */
    e: number;
    /** raw progress, for the fade of departing letters */
    p: number;
  };

  function frameAt(t: number): Frame {
    let f: Frame = { from: 0, to: 0, e: 0, p: 0 };
    for (const tr of TRANSFORMS) {
      if (t >= tr.window[1]) f = { from: tr.to, to: tr.to, e: 0, p: 0 };
      else if (t >= tr.window[0]) {
        const p = span(t, tr.window);
        f = { from: tr.from, to: tr.to, e: tr.ease(p), p };
      }
    }
    return f;
  }

  function ensureGlyph(key: string, ch: string): HTMLSpanElement {
    let el = glyphs.get(key);
    if (!el) {
      el = document.createElement("span");
      el.setAttribute("aria-hidden", "true");
      el.style.cssText =
        "position:absolute;left:0;top:0;white-space:pre;line-height:1;" +
        "will-change:transform,opacity;pointer-events:none;";
      host.appendChild(el);
      glyphs.set(key, el);
    }
    if (el.textContent !== ch) el.textContent = ch;
    return el;
  }

  function ensureChip(word: number): HTMLSpanElement {
    let el = chips.get(word);
    if (!el) {
      el = document.createElement("span");
      el.setAttribute("aria-hidden", "true");
      el.style.cssText =
        "position:absolute;left:0;top:0;pointer-events:none;" +
        `border-radius:0.16em;background:var(${CHIP_TOKEN[word]});will-change:transform,opacity;`;
      host.insertBefore(el, host.firstChild);
      chips.set(word, el);
    }
    return el;
  }

  function draw(t: number) {
    const words = wordsAt(t);
    const { from, to, e, p } = frameAt(t);

    const sizeOf = (s: number) => base * (1 + grow) ** STAGES[s].step;
    const place = (s: number) => {
      const L = layoutStage(STAGES[s], words, adv);
      const size = sizeOf(s);
      return { L, size, left: centreX - (L.width * size) / 2 };
    };
    const A = place(from);
    const B = from === to ? A : place(to);

    const size = A.size + (B.size - A.size) * e;
    const top = centreY - size / 2;

    const byKey = new Map<string, Placed>();
    B.L.items.forEach((it) => byKey.set(it.key, it));

    const bloom = span(t, BEATS.bloom);
    const chipAlpha = 1 - span(t, CHIP_FADE);
    // the chip tracks the glyphs it sits behind, so it never lags the fields
    const chipBox = new Map<number, { x0: number; x1: number }>();

    const live = new Set<string>();

    A.L.items.forEach((a) => {
      const b = byKey.get(a.key) ?? a;
      const xa = A.left + a.x * A.size;
      const xb = B.left + b.x * B.size;
      const x = xa + (xb - xa) * e;

      // a letter leaving the phrase fades and shrinks into the seam it closed,
      // in turn, from the end of its word inward
      let fade = 0;
      if (!a.ghost && b.ghost) {
        const len = words[a.word].length;
        const doomed = len - Math.min(STAGES[to].keep[a.word], len);
        const rank = doomed <= 1 ? 0 : (len - 1 - a.index) / (doomed - 1);
        fade = clamp01((p - rank * STAGGER) / FADE_WIN);
      }
      const opacity = a.ghost ? 0 : 1 - fade;
      if (opacity <= 0.001) return;

      const scale = 1 - 0.45 * fade;
      // a letter that reaches Fluolingo takes its piece's colour, so the
      // viewer can see where Flu + o + lin + go came from. The blend is
      // color-mix, not arithmetic on a parsed hex: the ink token is authored
      // in lab(), and the browser is the only thing that reads every colour
      // syntax the stylesheet is allowed to use.
      const token = SURVIVOR_TOKEN[a.word];
      const takes = token && a.index < STAGES[4].keep[a.word];
      const colour = !takes
        ? ""
        : bloom >= 1
          ? `var(${token})`
          : bloom <= 0
            ? ""
            : `color-mix(in oklab, var(${token}) ${(bloom * 100).toFixed(1)}%, var(--fluo-ink))`;

      const el = ensureGlyph(a.key, a.ch);
      live.add(a.key);
      el.style.fontSize = `${size}px`;
      el.style.opacity = opacity.toFixed(3);
      el.style.color = colour;
      el.style.transform = `translate(${x.toFixed(2)}px, ${top.toFixed(2)}px) scale(${scale.toFixed(3)})`;

      if (chipAlpha > 0 && CHIP_TOKEN[a.word]) {
        const w = adv(a.ch) * size;
        const box = chipBox.get(a.word);
        if (!box) chipBox.set(a.word, { x0: x, x1: x + w });
        else {
          box.x0 = Math.min(box.x0, x);
          box.x1 = Math.max(box.x1, x + w);
        }
      }
    });

    glyphs.forEach((el, key) => {
      if (!live.has(key)) {
        el.remove();
        glyphs.delete(key);
      }
    });

    [1, 3].forEach((w) => {
      const box = chipBox.get(w);
      const el = chips.get(w);
      if (!box || chipAlpha <= 0) {
        if (el) {
          el.remove();
          chips.delete(w);
        }
        return;
      }
      const chip = ensureChip(w);
      const padX = size * 0.14;
      const padY = size * 0.2;
      chip.style.width = `${box.x1 - box.x0 + padX * 2}px`;
      chip.style.height = `${size + padY * 2}px`;
      chip.style.opacity = chipAlpha.toFixed(3);
      chip.style.transform = `translate(${(box.x0 - padX).toFixed(2)}px, ${(top - padY).toFixed(2)}px)`;
    });
  }

  /* ── the loop ───────────────────────────────────────────────────────── */
  function tick(now: number) {
    if (stopped) return;
    let t = now - start;
    if (t >= BEATS.end) {
      if (loop) {
        start = now;
        t = 0;
      } else t = BEATS.end - 1;
    }
    draw(t);
    raf = requestAnimationFrame(tick);
  }

  function boot() {
    remeasure();
    fit();
    if (reduced) {
      // the whole point survives standing still: the finished name
      draw(BEATS.merge[1]);
      return;
    }
    start = performance.now();
    raf = requestAnimationFrame(tick);
  }

  // height is set by fit(), so react to WIDTH only or the two chase each other
  let lastWidth = host.getBoundingClientRect().width;
  const ro = new ResizeObserver(() => {
    const w = host.getBoundingClientRect().width;
    if (Math.abs(w - lastWidth) < 0.5) return;
    lastWidth = w;
    fit();
    if (reduced) draw(BEATS.merge[1]);
  });

  if (document.fonts && "ready" in document.fonts) {
    document.fonts.ready.then(() => {
      if (!stopped) boot();
    });
  } else boot();
  ro.observe(host);

  return {
    replay() {
      start = performance.now();
    },
    destroy() {
      stopped = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      glyphs.forEach((el) => el.remove());
      chips.forEach((el) => el.remove());
      glyphs.clear();
      chips.clear();
    },
  };
}
