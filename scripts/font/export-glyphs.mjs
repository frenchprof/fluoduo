// Dumps src/lib/handwriting/glyphs.ts to JSON that build-font.py (FontForge)
// can consume without needing a TypeScript-aware Python. Run with plain
// `node` — Node's native type-stripping loads the .ts source directly.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  GLYPHS,
  BASELINE,
  ASCENDER,
  DESCENDER,
  LETTER_GAP,
  WORD_SPACE,
} from "../../src/lib/handwriting/glyphs.ts";

/** The stroke width + cap/join style the SVG renderer uses (HomeDashboard.tsx). */
const STROKE_WIDTH = 2.4;

// Standard OpenType "uniXXXX" naming throughout — safe for every codepoint
// here (all BMP) and avoids case-collision / reserved-name pitfalls that
// picking the raw character as a glyph name would risk.
const glyphName = (codepoint) => `uni${codepoint.toString(16).toUpperCase().padStart(4, "0")}`;

const glyphs = Object.entries(GLYPHS).map(([ch, g]) => {
  const codepoint = ch.codePointAt(0);
  return {
    char: ch,
    codepoint,
    name: glyphName(codepoint),
    strokes: g.strokes,
    advance: g.w + LETTER_GAP,
  };
});

// The space itself isn't in GLYPHS (layoutLine special-cases it); add it so
// the font has a real, spec-compliant word space.
glyphs.push({ char: " ", codepoint: 0x20, name: "space", strokes: [], advance: WORD_SPACE });

const out = {
  meta: { baseline: BASELINE, ascender: ASCENDER, descender: DESCENDER, letterGap: LETTER_GAP, wordSpace: WORD_SPACE, strokeWidth: STROKE_WIDTH },
  glyphs,
};

const outPath = fileURLToPath(new URL("./glyphs.json", import.meta.url));
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`Wrote ${glyphs.length} glyphs to ${outPath}`);
