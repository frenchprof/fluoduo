/**
 * A tiny, dependency-free QR encoder (patch 25, 2026-08-17) — just enough
 * for the printed Home map's per-unit QR codes. Byte mode, error-correction
 * level M, versions 1–6 (up to 108 bytes of data — a fluolingo.com URL is
 * ~30), all eight masks tried with the standard penalty score, format bits
 * BCH-coded. Output is a boolean module grid plus an SVG path helper.
 *
 * Round-tripped through OpenCV's QRCodeDetector at build time (v1, v3, v5
 * samples); nothing here is clever, it is the spec (ISO/IEC 18004) written
 * down small.
 */

// ── GF(256) for Reed–Solomon ────────────────────────────────────────────────
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
})();
const mul = (a: number, b: number) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

function rsGenerator(n: number): number[] {
  let g = [1];
  for (let i = 0; i < n; i++) {
    const next = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      next[j] ^= g[j];
      next[j + 1] ^= mul(g[j], EXP[i]);
    }
    g = next;
  }
  return g;
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = rsGenerator(ecLen);
  const out = new Array(ecLen).fill(0);
  for (const d of data) {
    const factor = d ^ out[0];
    out.shift();
    out.push(0);
    if (factor) for (let j = 0; j < ecLen; j++) out[j] ^= mul(gen[j + 1], factor);
  }
  return out;
}

// ── Version tables, EC level M (equal-size blocks for v1–6) ─────────────────
// [total codewords, data codewords, ec codewords per block, blocks, alignment centres]
const VERSIONS: [number, number, number, number, number[]][] = [
  [26, 16, 10, 1, []],
  [44, 28, 16, 1, [6, 18]],
  [70, 44, 26, 1, [6, 22]],
  [100, 64, 18, 2, [6, 26]],
  [134, 86, 24, 2, [6, 30]],
  [172, 108, 16, 4, [6, 34]],
];

export type QrMatrix = { size: number; dark: boolean[][] };

export function qrEncode(text: string): QrMatrix {
  const bytes = Array.from(new TextEncoder().encode(text));
  const vi = VERSIONS.findIndex(([, data]) => bytes.length + 2 <= data);
  if (vi < 0) throw new Error("qr: text too long for versions 1–6");
  const [total, dataLen, ecPerBlock, blocks, aligns] = VERSIONS[vi];
  const version = vi + 1;
  const size = 17 + version * 4;

  // Bit stream: mode 0100, 8-bit count, data, terminator, pad to bytes, pad codewords.
  const bits: number[] = [];
  const push = (v: number, n: number) => {
    for (let i = n - 1; i >= 0; i--) bits.push((v >> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, 8);
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, dataLen * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let p = 0; data.length < dataLen; p ^= 1) data.push(p ? 0x11 : 0xec);

  // Blocks + interleave.
  const per = dataLen / blocks;
  const dBlocks: number[][] = [];
  const eBlocks: number[][] = [];
  for (let b = 0; b < blocks; b++) {
    const d = data.slice(b * per, (b + 1) * per);
    dBlocks.push(d);
    eBlocks.push(rsEncode(d, ecPerBlock));
  }
  const codewords: number[] = [];
  for (let i = 0; i < per; i++) for (const d of dBlocks) codewords.push(d[i]);
  for (let i = 0; i < ecPerBlock; i++) for (const e of eBlocks) codewords.push(e[i]);
  if (codewords.length !== total) throw new Error("qr: codeword count mismatch");

  // Matrix + function patterns.
  const dark: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const fixed: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (r: number, c: number, v: boolean) => {
    dark[r][c] = v;
    fixed[r][c] = true;
  };
  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++)
      for (let c = -1; c <= 7; c++) {
        const rr = r0 + r;
        const cc = c0 + c;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const on = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        set(rr, cc, on);
      }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  for (const r of aligns)
    for (const c of aligns) {
      if (fixed[r][c]) continue; // overlaps a finder
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  set(size - 8, 8, true); // the dark module
  // Reserve format areas.
  for (let i = 0; i < 8; i++) {
    fixed[8][i] = fixed[i][8] = true;
    fixed[8][size - 1 - i] = fixed[size - 1 - i][8] = true;
  }
  fixed[8][8] = true;

  // Place data (zig-zag, right to left, skipping column 6).
  const cw = codewords.flatMap((b) => Array.from({ length: 8 }, (_, i) => (b >> (7 - i)) & 1));
  let k = 0;
  let up = true;
  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--;
    for (let i = 0; i < size; i++) {
      const r = up ? size - 1 - i : i;
      for (const cc of [c, c - 1]) {
        if (!fixed[r][cc]) {
          dark[r][cc] = k < cw.length ? cw[k] === 1 : false;
          k++;
        }
      }
    }
    up = !up;
  }

  // Masks: apply, score, keep the best.
  const MASKS: ((r: number, c: number) => boolean)[] = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (_, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ];
  const withMask = (m: number) => {
    const g = dark.map((row) => row.slice());
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!fixed[r][c] && MASKS[m](r, c)) g[r][c] = !g[r][c];
    // Format bits: EC M = 00, then mask; BCH(15,5) with generator 0x537, masked 0x5412.
    let f = (0b00 << 3) | m;
    let rem = f << 10;
    for (let i = 14; i >= 10; i--) if (rem & (1 << i)) rem ^= 0x537 << (i - 10);
    f = ((f << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((f >> i) & 1) === 1;
    for (let i = 0; i < 6; i++) g[8][i] = bit(14 - i);
    g[8][7] = bit(8);
    g[8][8] = bit(7);
    g[7][8] = bit(6);
    for (let i = 0; i < 6; i++) g[i][8] = bit(i);
    for (let i = 0; i < 7; i++) g[size - 1 - i][8] = bit(14 - i);
    for (let i = 0; i < 8; i++) g[8][size - 8 + i] = bit(7 - i);
    return g;
  };
  const penalty = (g: boolean[][]) => {
    let p = 0;
    for (let r = 0; r < size; r++) {
      let run = 1;
      for (let c = 1; c <= size; c++) {
        if (c < size && g[r][c] === g[r][c - 1]) run++;
        else {
          if (run >= 5) p += run - 2;
          run = 1;
        }
      }
    }
    for (let c = 0; c < size; c++) {
      let run = 1;
      for (let r = 1; r <= size; r++) {
        if (r < size && g[r][c] === g[r - 1][c]) run++;
        else {
          if (run >= 5) p += run - 2;
          run = 1;
        }
      }
    }
    for (let r = 0; r < size - 1; r++) for (let c = 0; c < size - 1; c++) if (g[r][c] === g[r][c + 1] && g[r][c] === g[r + 1][c] && g[r][c] === g[r + 1][c + 1]) p += 3;
    const pat = [true, false, true, true, true, false, true];
    for (let r = 0; r < size; r++)
      for (let c = 0; c + 10 < size; c++) {
        const row = g[r].slice(c, c + 11);
        const col = Array.from({ length: 11 }, (_, i) => g[c + i][r]);
        for (const line of [row, col]) {
          const a = line.slice(0, 7).every((v, i) => v === pat[i]) && line.slice(7).every((v) => !v);
          const b = line.slice(4).every((v, i) => v === pat[i]) && line.slice(0, 4).every((v) => !v);
          if (a || b) p += 40;
        }
      }
    const total = size * size;
    const darkCount = g.flat().filter(Boolean).length;
    p += Math.floor(Math.abs((darkCount * 100) / total - 50) / 5) * 10;
    return p;
  };
  let best = withMask(0);
  let bestP = penalty(best);
  for (let m = 1; m < 8; m++) {
    const g = withMask(m);
    const s = penalty(g);
    if (s < bestP) {
      best = g;
      bestP = s;
    }
  }
  return { size, dark: best };
}

/** SVG path (one 1×1 square per dark module) for `<svg viewBox="0 0 size size">`. */
export function qrPath(m: QrMatrix): string {
  let d = "";
  for (let r = 0; r < m.size; r++) for (let c = 0; c < m.size; c++) if (m.dark[r][c]) d += `M${c},${r}h1v1h-1z`;
  return d;
}
