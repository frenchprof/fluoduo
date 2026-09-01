"use client";

/**
 * WHERE THE NAME COMES FROM — the renderer.
 *
 * Owns pixels and nothing else. Every word, stage, beat and position comes from
 * `lib/fluolingoOrigin.ts`; if this file ever decides one of those for itself,
 * the check that holds the animation to its spec is holding it to a copy.
 *
 * IN FLUOLINGO HAND, which is the whole reason this is a rebuild rather than a
 * port (decision 4). Two consequences the 30 Aug cut did not have to think
 * about, both handled here:
 *
 *   1. ONLY TWO WEIGHTS EXIST on the page. layout.tsx loads Regular (400) and
 *      SemiBold (600) and deliberately leaves the other seven out of the
 *      bundle — "all nine would cost ~316 KB on every page for eight weights
 *      nothing renders". So the sentence is 400 and the finished name is 600,
 *      and nothing here asks for a Black that would silently synthesise.
 *
 *   2. A HANDWRITING FACE HAS NO PREDICTABLE ADVANCE WIDTHS. `l` and `i` are
 *      not the same width as each other and neither is a fraction of `m`. So
 *      every glyph is MEASURED, once, through a canvas at a reference size,
 *      and cached in em — one pass serves every font size the show grows
 *      through. Guessing here is what puts a letter half over its neighbour.
 *
 * THE FONT MUST BE READY BEFORE THE MEASURING. `document.fonts.load` is
 * awaited: measure while the fallback (Bradley Hand / Segoe Print / cursive) is
 * still in place and every position is wrong by the difference between two
 * typefaces, which is a fault that only appears on a cold load and never on a
 * refresh — the worst kind to leave in.
 */

import { useEffect, useRef, useState } from "react";
import {
  BEATS, CHIP_FADE, FIELD_ONE, FIELD_SLOT, FIELD_TWO, SETTLED, STAGES,
  cycleTicks, cycleWordAt, layoutStage, phaseAt, span, stageWords,
  widestSentenceEm, type Placed,
} from "@/lib/fluolingoOrigin";

/** Measure at a big reference size: the rounding error on one glyph at 16px is
 *  visible once the phrase is 40 letters long. */
const REF = 200;

/** The four fragments' hues, in word order (Fluency · on · linguistic · goals).
 *  They are the dopamine tokens the rest of the app already uses, so the name's
 *  four parts are coloured by the same system as everything else. */
const WORD_HUE: Record<number, string> = {
  0: "var(--dopa-win-ink)",
  2: "var(--dopa-focus-ink)",
  4: "var(--dopa-reward-ink)",
  5: "var(--dopa-streak-ink, var(--cahier-ink))",
};

type Cell = { el: HTMLSpanElement; placed: Placed };

export default function FluolingoOrigin({
  className = "",
  loop = true,
}: { className?: string; loop?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let raf = 0;
    let cancelled = false;

    // Honoured, not decorated: a whole beat table of movement is exactly what
    // this setting is for. The finished name is drawn once and left alone.
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const run = async () => {
      const cs = getComputedStyle(host);
      try {
        await document.fonts?.load(`400 ${REF}px ${cs.fontFamily}`);
        await document.fonts?.load(`600 ${REF}px ${cs.fontFamily}`);
      } catch {
        /* no font loading API — the measurements below still work, on whatever
           face is resolved; the show is laid out for what is actually drawn */
      }
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      const meter = canvas.getContext("2d");
      if (meter) meter.font = `400 ${REF}px ${cs.fontFamily}`;
      const cache = new Map<string, number>();
      const adv = (ch: string): number => {
        const hit = cache.get(ch);
        if (hit !== undefined) return hit;
        const w = meter ? meter.measureText(ch).width / REF : 0.5;
        cache.set(ch, w);
        return w;
      };

      // ── the size ladder ────────────────────────────────────────────────
      // Stage 0 fills the box at its widest field pairing; the finished name
      // fills it too. Four equal growth steps between them, which is what makes
      // `base * ratio ** step` monotonic by construction rather than by luck:
      // the phrase only ever gets shorter, so the ratio is only ever > 1.
      const box = host.clientWidth || 640;
      const widest = widestSentenceEm(adv);
      const named = STAGES[STAGES.length - 1];
      const namedEm = layoutStage(named, stageWords(named, SETTLED), adv).width;
      const base = (box * 0.96) / widest;
      const finalSize = (box * 0.9) / namedEm;
      const ratio = (finalSize / base) ** (1 / 4);
      const sizeAt = (step: number) => base * ratio ** step;

      // ── the letters ───────────────────────────────────────────────────
      // One span per letter of the WIDEST possible sentence, created once and
      // then only moved. Creating and destroying nodes per stage is what makes
      // an animation like this stutter on a phone.
      host.textContent = "";
      const stack = document.createElement("div");
      stack.style.cssText = "position:relative;width:100%;height:1.5em;";
      host.appendChild(stack);

      const chips: HTMLSpanElement[] = [0, 1].map(() => {
        const c = document.createElement("span");
        c.setAttribute("aria-hidden", "true");
        c.style.cssText =
          "position:absolute;top:0;left:0;border-radius:0.28em;pointer-events:none;" +
          "transform-origin:0 0;will-change:transform,opacity;";
        stack.appendChild(c);
        return c;
      });

      const cells = new Map<string, Cell>();
      const cellFor = (p: Placed): Cell => {
        const hit = cells.get(p.key);
        if (hit) return hit;
        const el = document.createElement("span");
        el.setAttribute("aria-hidden", "true");
        el.style.cssText =
          "position:absolute;top:0;left:0;white-space:pre;transform-origin:0 0;" +
          "will-change:transform,opacity;";
        stack.appendChild(el);
        const cell = { el, placed: p };
        cells.set(p.key, cell);
        return cell;
      };

      // ── the frame ─────────────────────────────────────────────────────
      const ticksOne = cycleTicks(BEATS.cycleOneEnds, FIELD_ONE.length);
      const ticksTwo = cycleTicks(BEATS.cycleTwoEnds, FIELD_TWO.length);

      const draw = (t: number) => {
        const filled: [string, string] = [
          cycleWordAt(t, ticksOne, FIELD_ONE),
          cycleWordAt(t, ticksTwo, FIELD_TWO),
        ];
        // Once the fields have gone the slots keep their settled words, so the
        // ghosts they leave sit on the right seam.
        const words: readonly [string, string] =
          t >= BEATS.reduceFields[0] ? SETTLED : filled;

        const { from, to, p, ease } = phaseAt(t);
        const e = ease(p);
        const A = STAGES[from], B = STAGES[to];
        const wa = stageWords(A, words), wb = stageWords(B, words);
        const la = layoutStage(A, wa, adv), lb = layoutStage(B, wb, adv);
        const size = sizeAt(A.step) + (sizeAt(B.step) - sizeAt(A.step)) * e;
        const widthEm = la.width + (lb.width - la.width) * e;
        const left = (box - widthEm * size) / 2;

        const byKey = new Map(lb.items.map((i) => [i.key, i]));
        const seen = new Set<string>();

        la.items.forEach((a) => {
          const b = byKey.get(a.key) ?? a;
          seen.add(a.key);
          const cell = cellFor(a);
          // The GLYPH is B's once the naming is more than half done — a letter
          // cannot be half of `o` and half of `O`, so it changes on one frame,
          // under cover of the overshoot, rather than cross-fading into a blur.
          const ch = e > 0.5 ? b.ch : a.ch;
          if (cell.el.textContent !== ch) cell.el.textContent = ch;
          const x = a.x + (b.x - a.x) * e;
          const alpha = a.ghost ? 0 : b.ghost ? 1 - e : 1;
          cell.el.style.opacity = String(alpha);
          cell.el.style.transform = `translate(${left + x * size}px, 0) scale(${size / REF})`;
          cell.el.style.fontSize = `${REF}px`;
          // BLOOM: the survivors take their word's colour BEFORE the letters
          // they are about to lose are cut, so a viewer sees which four words
          // the name will come from while all four are still whole.
          //
          // MIXED, not switched. The first cut set the hue the instant `bloom`
          // went above zero, which is a 0.65s window spent doing nothing and
          // then a snap on its last frame — the beat table says the colour
          // ARRIVES over that window, and a boolean cannot say that.
          const bloom = span(t, BEATS.bloom);
          const hue = WORD_HUE[a.word];
          cell.el.style.color = hue
            ? `color-mix(in oklab, ${hue} ${(bloom * 100).toFixed(1)}%, var(--cahier-ink))`
            : "var(--cahier-ink)";
          // The name is the only thing that gets the heavier weight, and it
          // arrives with the capitals rather than before them.
          cell.el.style.fontWeight = t >= BEATS.name[0] ? "600" : "400";
        });
        cells.forEach((cell, key) => {
          if (!seen.has(key)) cell.el.style.opacity = "0";
        });

        // The chips sit behind the two cycling fields and fade as the fields go.
        const chipAlpha = 1 - span(t, CHIP_FADE);
        FIELD_SLOT.forEach((slot, n) => {
          const chip = chips[n];
          const live = la.items.filter((i) => i.word === slot && !i.ghost);
          if (!live.length || chipAlpha <= 0) { chip.style.opacity = "0"; return; }
          const x0 = live[0].x, x1 = live[live.length - 1].x + adv(live[live.length - 1].ch);
          chip.style.opacity = String(chipAlpha * 0.28);
          chip.style.background = n === 0 ? "var(--dopa-win)" : "var(--dopa-reward)";
          chip.style.height = `${size * 1.15}px`;
          chip.style.width = `${(x1 - x0) * size + size * 0.18}px`;
          chip.style.transform = `translate(${left + x0 * size - size * 0.09}px, ${-size * 0.12}px)`;
        });

        stack.style.height = `${sizeAt(4) * 1.5}px`;
      };

      setReady(true);
      if (still) { draw(BEATS.end); return; }

      const t0 = performance.now();
      const tick = (now: number) => {
        const t = now - t0;
        draw(loop ? t % BEATS.end : Math.min(t, BEATS.end));
        if (loop || t < BEATS.end) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    void run();
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [loop]);

  return (
    <div
      ref={hostRef}
      className={`cahier-hand relative w-full select-none ${className}`}
      style={{ minHeight: "3.5em", opacity: ready ? 1 : 0, transition: "opacity 200ms" }}
    >
      {/* The name, for anything that does not run the show: a screen reader, a
          crawler, a copy-paste. It says what the animation says. */}
      <span className="sr-only">
        FluOLinGo — Fluency On Linguistic Goals
      </span>
    </div>
  );
}
