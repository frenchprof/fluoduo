/**
 * Film a text animation off the live DOM.
 *
 * THE PROBLEM. A browser will not hand you a picture of your own page. The
 * usual answers are all bad here: html2canvas re-implements CSS and gets
 * transforms wrong; SVG `foreignObject` renders in an isolated document, so
 * every web font has to be fetched and inlined as base64 before any text
 * appears; and there is no DOM equivalent of `canvas.captureStream()`.
 *
 * THE ANSWER. This animation is only ever text — characters at positions, at
 * sizes, at opacities. So each frame is sampled rather than rendered: read
 * every glyph's box, size and alpha from the live DOM, keep those numbers, and
 * redraw them on a canvas afterwards with `fillText`. The browser still does
 * all the layout, kerning and easing; nothing about CSS is re-implemented; and
 * canvas draws with the document's own loaded fonts, so nothing needs
 * embedding.
 *
 * WHAT IT CANNOT DO. It films glyphs, not pixels: borders, backgrounds, images
 * and shadows inside the captured box are not in the recording (the ground is
 * filled with the box's own background colour, and that is all). For this
 * component that is the whole picture. For anything else it would not be.
 */

export type FilmGlyph = {
  char: string;
  /** Left edge and baseline-anchored box, in CSS px relative to the target. */
  x: number;
  top: number;
  height: number;
  size: number;
  font: string;
  color: string;
  alpha: number;
  /** Index into the frame's clip list, or -1. */
  clip: number;
};

export type FilmFrame = {
  /** Milliseconds since the film started. */
  at: number;
  clips: { x: number; y: number; w: number; h: number }[];
  glyphs: FilmGlyph[];
};

export type Film = {
  width: number;
  height: number;
  background: string;
  frames: FilmFrame[];
};

export type FilmOptions = {
  /** One element per character. */
  glyphSelector?: string;
  /** Ancestors whose box clips the glyphs inside them. */
  clipSelector?: string;
  /** Upper bound on sampling rate; the real rate is whatever rAF manages. */
  maxFps?: number;
};

type Base = {
  size: number;
  /** Kept in parts, so the drawn size can be substituted without a regex. */
  style: string;
  weight: string;
  family: string;
  color: string;
  /** The glyph's box height with no transform on it. */
  height: number;
  chain: HTMLElement[];
};

/** The scale baked into a computed `transform`, or 1. */
function scaleOf(transform: string): number {
  if (!transform || transform === "none") return 1;
  const nums = transform.slice(transform.indexOf("(") + 1, -1).split(",").map(Number);
  if (nums.length < 6 || nums.some(Number.isNaN)) return 1;
  // matrix(a, b, c, d, e, f) — the vertical scale is hypot(c, d).
  return Math.hypot(nums[2], nums[3]) || 1;
}

/** The first background colour up the tree that is not see-through. */
function groundOf(el: HTMLElement): string {
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/.test(bg)) return bg;
  }
  return "#ffffff";
}

/**
 * Start sampling `target` every animation frame. Call the returned `stop` to
 * end it and get the film.
 */
export function startFilm(
  target: HTMLElement,
  { glyphSelector = "[data-ch]", clipSelector = "[data-clip]", maxFps = 25 }: FilmOptions = {},
): { stop: () => Film; frameCount: () => number } {
  const bases = new WeakMap<Element, Base>();
  const clipOf = new WeakMap<Element, HTMLElement | null>();
  const frames: FilmFrame[] = [];
  const box0 = target.getBoundingClientRect();
  const width = Math.round(box0.width);
  const height = Math.round(box0.height);
  const background = groundOf(target);
  const minGap = 1000 / maxFps;

  const t0 = performance.now();
  let last = -Infinity;
  let raf = 0;

  const sample = (at: number) => {
    const box = target.getBoundingClientRect();
    const clips: FilmFrame["clips"] = [];
    const clipIndex = new Map<HTMLElement, number>();
    const alphaOf = new Map<HTMLElement, number>(); // memo, one frame deep
    const glyphs: FilmGlyph[] = [];

    for (const el of target.querySelectorAll<HTMLElement>(glyphSelector)) {
      const cs = getComputedStyle(el);
      // The off-screen ruler lives inside the component and is full of
      // characters; it is hidden, and hidden is not filmed.
      if (cs.visibility !== "visible" || cs.display === "none") continue;

      let base = bases.get(el);
      if (!base) {
        const r0 = el.getBoundingClientRect();
        const s0 = scaleOf(cs.transform);
        const chain: HTMLElement[] = [];
        for (let n = el.parentElement; n && n !== target.parentElement; n = n.parentElement) chain.push(n);
        base = {
          size: parseFloat(cs.fontSize),
          style: cs.fontStyle,
          weight: cs.fontWeight,
          family: cs.fontFamily,
          color: cs.color,
          height: r0.height / (s0 || 1),
          chain,
        };
        bases.set(el, base);
      }

      let alpha = Number(cs.opacity);
      for (const up of base.chain) {
        let a = alphaOf.get(up);
        if (a === undefined) {
          a = Number(getComputedStyle(up).opacity);
          alphaOf.set(up, a);
        }
        alpha *= a;
      }
      if (!(alpha > 0.004)) continue;

      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) continue;
      const scale = base.height > 0 ? r.height / base.height : 1;

      let clip = -1;
      let clipEl = clipOf.get(el);
      if (clipEl === undefined) {
        clipEl = el.closest<HTMLElement>(clipSelector);
        if (clipEl && !target.contains(clipEl)) clipEl = null;
        clipOf.set(el, clipEl);
      }
      if (clipEl) {
        const known = clipIndex.get(clipEl);
        if (known !== undefined) clip = known;
        else {
          const cr = clipEl.getBoundingClientRect();
          clip = clips.length;
          clipIndex.set(clipEl, clip);
          clips.push({ x: cr.left - box.left, y: cr.top - box.top, w: cr.width, h: cr.height });
        }
      }

      glyphs.push({
        char: el.textContent ?? "",
        x: r.left - box.left,
        top: r.top - box.top,
        height: r.height,
        size: base.size * scale,
        font: `${base.style} ${base.weight} ${(base.size * scale).toFixed(2)}px ${base.family}`,
        color: base.color,
        alpha,
        clip,
      });
    }
    frames.push({ at, clips, glyphs });
  };

  const tick = () => {
    const at = performance.now() - t0;
    if (at - last >= minGap) {
      last = at;
      sample(at);
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    frameCount: () => frames.length,
    stop: () => {
      cancelAnimationFrame(raf);
      return { width, height, background, frames };
    },
  };
}

/**
 * Draw one filmed frame onto a context.
 *
 * The vertical placement is the fiddly part and is done properly rather than by
 * eye: CSS centres the font's ascent+descent box inside the line box, so the
 * baseline is `top + (lineBox − (ascent + descent)) / 2 + ascent`, and the
 * ascent and descent come from the canvas's own metrics for the very font it is
 * about to draw with. Guessing at `textBaseline: middle` puts every letter a
 * pixel or two off, which is invisible in a still and reads as a wobble in a
 * film.
 */
export function drawFilmFrame(ctx: CanvasRenderingContext2D, film: Film, frame: FilmFrame) {
  ctx.save();
  ctx.fillStyle = film.background;
  ctx.fillRect(0, 0, film.width, film.height);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  let clip = -1;
  ctx.save(); // the clip scope, swapped whenever the clip changes
  for (const g of frame.glyphs) {
    if (g.clip !== clip) {
      ctx.restore();
      ctx.save();
      clip = g.clip;
      if (clip >= 0) {
        const c = frame.clips[clip];
        ctx.beginPath();
        ctx.rect(c.x, c.y, c.w, c.h);
        ctx.clip();
      }
    }
    ctx.font = g.font;
    ctx.globalAlpha = g.alpha;
    ctx.fillStyle = g.color;
    const m = ctx.measureText(g.char);
    const ascent = m.fontBoundingBoxAscent ?? g.size * 0.8;
    const descent = m.fontBoundingBoxDescent ?? g.size * 0.2;
    ctx.fillText(g.char, g.x, g.top + (g.height - (ascent + descent)) / 2 + ascent);
  }
  ctx.restore();
  ctx.restore();
}

/**
 * A filmed run, rendered to a GIF.
 *
 * Frames are drawn twice — once for the palette pass, once for the encoding
 * pass — rather than kept as pixels: redrawing costs a few milliseconds and
 * holding a hundred RGBA frames costs a couple of hundred megabytes.
 *
 * Each frame's delay is the real gap to the next sample, so a browser that
 * dropped a frame mid-capture produces a GIF that still plays at the speed the
 * animation actually ran at.
 */
export async function filmToGif(
  film: Film,
  { maxColors = 96, tailMs = 700 }: { maxColors?: number; tailMs?: number } = {},
): Promise<Blob> {
  const { encodeGif } = await import("./gif");
  const canvas = document.createElement("canvas");
  canvas.width = film.width;
  canvas.height = film.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");

  const frames = film.frames;
  if (!frames.length) throw new Error("nothing was filmed");

  const bytes = encodeGif(film.width, film.height, {
    count: frames.length,
    frame: (i) => {
      drawFilmFrame(ctx, film, frames[i]);
      const next = frames[i + 1];
      return {
        data: ctx.getImageData(0, 0, film.width, film.height).data,
        // The last frame has no successor to be timed against; it rests on
        // screen instead, so the loop does not snap straight back to the
        // sentence the moment the short form arrives.
        delayMs: next ? next.at - frames[i].at : tailMs,
      };
    },
  }, { maxColors });

  return new Blob([bytes as unknown as BlobPart], { type: "image/gif" });
}

/** Hand a blob to the browser as a download. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoked on the next turn of the loop: revoking synchronously can beat the
  // navigation the click just started.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
