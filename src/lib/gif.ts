/**
 * A GIF89a encoder, in about as few lines as the format allows.
 *
 * WHY HAND-ROLLED. The app has four runtime dependencies and adding a fifth to
 * save a page of well-specified byte layout is a bad trade — gif.js and friends
 * ship a worker blob, a licence and a supply chain, for a format that has not
 * changed since 1989. Everything here is the spec: a global colour table, one
 * LZW-compressed image per frame, and the Netscape extension that makes it
 * loop.
 *
 * The one judgement call is the palette. GIF allows 256 colours for the whole
 * file, and the frames this encodes are text on a flat ground — two or three
 * real colours plus the grey ramp of antialiasing — so a median cut over the
 * colours that ACTUALLY occur beats any fixed palette by a distance. Sampling
 * (rather than counting every pixel of every frame) keeps that cheap; the
 * nearest-colour cache does the same for the mapping pass, where the same few
 * thousand antialiased greys come round again and again.
 *
 * Runs in the browser and in node — it takes bytes and returns bytes, and
 * touches no DOM. That is what makes it testable without a browser.
 */

export type GifFrame = {
  /** RGBA, width * height * 4, exactly as canvas getImageData hands it over. */
  data: Uint8ClampedArray | Uint8Array;
  /** How long this frame is shown. GIF stores hundredths, so it is rounded. */
  delayMs: number;
};

/**
 * Frames on demand rather than all at once.
 *
 * A 768x900 clip at a hundred frames is 240 MB of RGBA if it is all held in
 * memory, which is enough to lose a phone browser. The palette pass and the
 * encoding pass each ask for frames one at a time instead, so a caller that
 * can re-draw a frame (this one re-draws from a list of glyph positions) never
 * holds more than one.
 */
export type GifSource = {
  count: number;
  frame(index: number): GifFrame;
};

export type GifOptions = {
  /** Palette size, 2–256. More colours, bigger file, smoother antialiasing. */
  maxColors?: number;
  /** Loop for ever (the default) or play once. */
  loop?: boolean;
};

/* ── a growable byte sink ─────────────────────────────────────────────── */

class Bytes {
  private buf = new Uint8Array(1 << 16);
  private n = 0;

  private room(extra: number) {
    if (this.n + extra <= this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < this.n + extra) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buf.subarray(0, this.n));
    this.buf = next;
  }

  byte(b: number) {
    this.room(1);
    this.buf[this.n++] = b & 0xff;
  }

  /** Little-endian 16-bit, which is the only multi-byte integer GIF has. */
  short(v: number) {
    this.byte(v);
    this.byte(v >> 8);
  }

  bytes(src: ArrayLike<number>) {
    this.room(src.length);
    for (let i = 0; i < src.length; i++) this.buf[this.n++] = src[i] & 0xff;
  }

  ascii(s: string) {
    for (let i = 0; i < s.length; i++) this.byte(s.charCodeAt(i));
  }

  done() {
    return this.buf.slice(0, this.n);
  }
}

/* ── palette ──────────────────────────────────────────────────────────── */

type Box = { colors: number[]; counts: number[] };

/**
 * Median cut. Split the box with the widest spread on its widest channel,
 * repeatedly, until there are as many boxes as colours wanted; each box then
 * contributes its weighted average.
 *
 * Weighted, not plain: a box holding one stray antialiased pixel and ten
 * thousand background pixels must land on the background, or the ground of the
 * image shifts to accommodate a colour nobody can see.
 */
function medianCut(counts: Map<number, number>, maxColors: number): number[] {
  const colors = [...counts.keys()];
  if (colors.length <= maxColors) return colors;

  let boxes: Box[] = [{ colors, counts: colors.map((c) => counts.get(c)!) }];
  // A box that cannot be split (every colour identical on the axis that would
  // divide it) is set aside, not treated as the end of the road. Aborting the
  // whole refinement on one stuck box is why a 256-colour request once came
  // back with the same 64 colours as the small one.
  const stuck = new Set<Box>();

  while (boxes.length < maxColors) {
    let pick: Box | null = null;
    let spread = -1;
    let channel = 0;
    for (const box of boxes) {
      if (box.colors.length < 2 || stuck.has(box)) continue;
      for (let ch = 0; ch < 3; ch++) {
        const shift = 16 - ch * 8;
        let lo = 255;
        let hi = 0;
        for (const c of box.colors) {
          const v = (c >> shift) & 0xff;
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
        if (hi - lo > spread) {
          spread = hi - lo;
          pick = box;
          channel = ch;
        }
      }
    }
    if (!pick || spread <= 0) break;

    const shift = 16 - channel * 8;
    const order = pick.colors
      .map((c, i) => ({ c, w: pick!.counts[i], v: (c >> shift) & 0xff }))
      .sort((a, b) => a.v - b.v);
    const total = order.reduce((sum, o) => sum + o.w, 0);
    let half = 0;
    let cut = 0;
    // Cut at the weighted median, so both halves carry a similar share of the
    // IMAGE rather than a similar number of distinct colours — otherwise one
    // stray antialiased pixel weighs as much as a whole background.
    while (cut < order.length - 1 && half + order[cut].w < total / 2) half += order[cut++].w;
    // Clamped so the cut ALWAYS leaves something on both sides. A flat ground
    // is most of the weight in the picture, so on the channel that separates
    // it the weighted median lands on the ground itself — and if the ground
    // sorts last, an unclamped cut takes everything and leaves an empty half.
    // That is not a rare case: it is every dark-text-on-light-paper frame, and
    // it collapsed those palettes to a single colour.
    cut = Math.min(cut, order.length - 2);

    const left = order.slice(0, cut + 1);
    const right = order.slice(cut + 1);
    if (!left.length || !right.length) {
      stuck.add(pick);
      continue;
    }
    boxes = boxes.filter((b) => b !== pick);
    boxes.push(
      { colors: left.map((o) => o.c), counts: left.map((o) => o.w) },
      { colors: right.map((o) => o.c), counts: right.map((o) => o.w) },
    );
  }

  return boxes.map((box) => {
    let r = 0;
    let g = 0;
    let b = 0;
    let w = 0;
    box.colors.forEach((c, i) => {
      const n = box.counts[i];
      r += ((c >> 16) & 0xff) * n;
      g += ((c >> 8) & 0xff) * n;
      b += (c & 0xff) * n;
      w += n;
    });
    return w === 0 ? box.colors[0] : (Math.round(r / w) << 16) | (Math.round(g / w) << 8) | Math.round(b / w);
  });
}

/* ── LZW, the GIF variant ─────────────────────────────────────────────── */

/**
 * Variable-width LZW with a reset. The dictionary starts at the palette size
 * plus the two control codes, the code width grows as it fills, and at 4096
 * entries the encoder emits CLEAR and starts the dictionary again — which is
 * mandatory, not an optimisation: there is no code wider than 12 bits.
 *
 * The dictionary is a flat Int32Array indexed by `prefixCode * 256 + nextByte`
 * rather than a Map of joined strings. At a megapixel a frame and a hundred
 * frames that is tens of millions of lookups; building a string for each one
 * turns an export into a coffee break.
 */
function lzw(indices: Uint8Array, minCodeSize: number, table: Int32Array): Uint8Array {
  const out = new Bytes();
  const clear = 1 << minCodeSize;
  const eoi = clear + 1;
  const FIRST = eoi + 1;

  table.fill(-1);
  let next = FIRST;
  let width = minCodeSize + 1;
  let maxcode = (1 << width) - 1;
  let clearing = false;

  let bits = 0;
  let acc = 0;
  const block: number[] = [];

  const flushBlock = () => {
    if (!block.length) return;
    out.byte(block.length);
    out.bytes(block);
    block.length = 0;
  };

  /**
   * Write a code, THEN decide the next code's width — in that order, and using
   * the dictionary size as it stands before this step's insertion.
   *
   * This is the whole of the format's difficulty. The decoder widens on its own
   * count of the dictionary, which runs exactly one entry behind the encoder's,
   * so an encoder that widens a step early or a step late produces a file that
   * decodes to a smear. Both off-by-ones were written here before this one was.
   */
  const emit = (code: number) => {
    acc |= code << bits;
    bits += width;
    while (bits >= 8) {
      block.push(acc & 0xff);
      acc >>= 8;
      bits -= 8;
      if (block.length === 255) flushBlock();
    }
    if (clearing) {
      width = minCodeSize + 1;
      maxcode = (1 << width) - 1;
      clearing = false;
    } else if (next > maxcode && width < 12) {
      width++;
      maxcode = width === 12 ? 4096 : (1 << width) - 1;
    }
  };

  emit(clear);

  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = prefix * 256 + k;
    const found = table[key];
    if (found >= 0) {
      prefix = found;
      continue;
    }
    emit(prefix);
    prefix = k;
    if (next < 4096) {
      table[key] = next++;
    } else {
      // Full. Reset the dictionary FIRST, then announce it — the CLEAR itself
      // still goes out at the old width, and the width drops after it.
      table.fill(-1);
      next = FIRST;
      clearing = true;
      emit(clear);
    }
  }
  emit(prefix);
  emit(eoi);

  if (bits > 0) {
    block.push(acc & 0xff);
    if (block.length === 255) flushBlock();
  }
  flushBlock();
  out.byte(0); // block terminator
  return out.done();
}

/* ── the encoder ──────────────────────────────────────────────────────── */

export function encodeGif(
  width: number,
  height: number,
  source: GifFrame[] | GifSource,
  { maxColors = 128, loop = true }: GifOptions = {},
): Uint8Array {
  const frames: GifSource = Array.isArray(source)
    ? { count: source.length, frame: (i) => source[i] }
    : source;
  if (!frames.count) throw new Error("encodeGif: no frames");
  const colors = Math.max(2, Math.min(256, maxColors));

  // Sample rather than count every pixel: a 640×900 clip at 100 frames is
  // 57 million pixels, and the palette that a twentieth of them implies is
  // indistinguishable from the palette all of them imply.
  const counts = new Map<number, number>();
  const step = Math.max(1, Math.floor((width * height * frames.count) / 300_000)) * 4;
  for (let i = 0; i < frames.count; i++) {
    const { data } = frames.frame(i);
    for (let p = 0; p < data.length; p += step) {
      const rgb = (data[p] << 16) | (data[p + 1] << 8) | data[p + 2];
      counts.set(rgb, (counts.get(rgb) ?? 0) + 1);
    }
  }

  const palette = medianCut(counts, colors);
  // GIF's colour table is a power of two, and the code size is its log.
  let bits = 1;
  while (1 << bits < palette.length) bits++;
  const tableSize = 1 << bits;

  const nearest = new Map<number, number>();
  const indexOf = (rgb: number) => {
    const hit = nearest.get(rgb);
    if (hit !== undefined) return hit;
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < palette.length; i++) {
      const p = palette[i];
      const dr = r - ((p >> 16) & 0xff);
      const dg = g - ((p >> 8) & 0xff);
      const db = b - (p & 0xff);
      const d = dr * dr + dg * dg + db * db;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    nearest.set(rgb, best);
    return best;
  };

  const out = new Bytes();
  out.ascii("GIF89a");
  out.short(width);
  out.short(height);
  out.byte(0x80 | ((bits - 1) << 4) | (bits - 1)); // global table, its size
  out.byte(0); // background colour index
  out.byte(0); // pixel aspect ratio

  for (let i = 0; i < tableSize; i++) {
    const c = palette[i] ?? 0;
    out.byte(c >> 16);
    out.byte(c >> 8);
    out.byte(c);
  }

  if (loop) {
    out.byte(0x21);
    out.byte(0xff);
    out.byte(11);
    out.ascii("NETSCAPE2.0");
    out.byte(3);
    out.byte(1);
    out.short(0); // 0 = for ever
    out.byte(0);
  }

  const pixels = new Uint8Array(width * height);
  const table = new Int32Array(4096 * 256); // reused across frames, 4 MB once
  for (let f = 0; f < frames.count; f++) {
    const frame = frames.frame(f);
    for (let p = 0, i = 0; p < pixels.length; p++, i += 4) {
      pixels[p] = indexOf((frame.data[i] << 16) | (frame.data[i + 1] << 8) | frame.data[i + 2]);
    }

    out.byte(0x21); // graphic control extension
    out.byte(0xf9);
    out.byte(4);
    out.byte(1 << 2); // disposal 1 (leave in place), no transparency
    out.short(Math.max(2, Math.round(frame.delayMs / 10))); // hundredths; under 2 many viewers re-time
    out.byte(0);
    out.byte(0);

    out.byte(0x2c); // image descriptor
    out.short(0);
    out.short(0);
    out.short(width);
    out.short(height);
    out.byte(0); // no local table, not interlaced

    const minCodeSize = Math.max(2, bits);
    out.byte(minCodeSize);
    out.bytes(lzw(pixels, minCodeSize, table));
  }

  out.byte(0x3b); // trailer
  return out.done();
}
