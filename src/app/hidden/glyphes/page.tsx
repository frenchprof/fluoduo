import type { Metadata } from "next";
import { layoutLine, LINE_HEIGHT } from "@/lib/bylineFont";

export const metadata: Metadata = {
  title: "Glyphes · par Dr Chan",
  description: "The byline lettering, extrapolated to the full French character range.",
  robots: { index: false, follow: false },
};

/* The complete repertoire, then the letters at work. No labels — the sheet
 * is the answer (Dan's litmus). */
const ROWS = [
  "abcdefghijklm",
  "nopqrstuvwxyz",
  "ABCDEFGHIJKLM",
  "NOPQRSTUVWXYZ",
  "àâçéèêë",
  "îïôùûüÿ",
  "æœ ÆŒ",
  "ÀÂÇÉÈÊË",
  "ÎÏÔÙÛÜŸ",
  "0123456789",
  ".,;:!?'‘\"“«»-–—()€°…",
  "par Dr Chan",
  "Portez ce vieux whisky",
  "au juge blond qui fume !",
  "Où ? Çà et là, l'aîné goûte",
  "— « déjà vu », n° 12",
];

/** One line of text in the byline hand: same skew, ink and pen width as the
 *  HomeDashboard original, static (no write-on animation). */
function StrokeLine({ text }: { text: string }) {
  const { glyphs, width } = layoutLine(text);
  return (
    <svg
      role="img"
      aria-label={text}
      viewBox={`0 0 ${width + 14} ${LINE_HEIGHT + 2}`}
      className="h-10 w-auto sm:h-12"
    >
      <g
        transform="translate(7 1) skewX(-8)"
        fill="none"
        stroke="var(--fluo-ink-soft)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {glyphs.map((g, i) => (
          <g key={i} transform={`translate(${g.x} 0)`}>
            {g.strokes.map((d, j) => (
              <path key={j} d={d} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

export default function GlyphesPage() {
  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-6">
      <section className="rounded-2xl border-2 border-[color:var(--fluo-ink)] bg-white/75 p-5 shadow-[5px_5px_0_var(--fluo-hl)]">
        {ROWS.map((row) => (
          <div key={row} className="overflow-x-auto py-1">
            <StrokeLine text={row} />
          </div>
        ))}
      </section>
    </main>
  );
}
