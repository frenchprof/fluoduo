/**
 * The Quick Guide — Dan's final cut (2026-07-14): three one-liners and a red
 * ▶ Continue, NOTHING else. Shared between /guide and the first-visit splash.
 * On the splash, Continue dismisses it for good (onContinue); on the page it
 * simply leads home. Everything longer lives behind 💡 About and the tour.
 */
import Link from "next/link";

/** "Drill with these": every activity as an iPhone-style app icon — name
 *  beneath, the short phrase on mouseover. */
const ACTIVITIES: { emoji: string; name: string; hue: number; what: string }[] = [
  // Canonical app order (Dan, 2026-07-19): SpecuLearn-PreTest · Lesson +
  // Flip-It · ConjugaZone · VocabulaRain · Lexicalator · Composer · ChaTutor ·
  // DéjàRevu — WorDrill (né Say It) rides along at the end.
  { emoji: "🔮", name: "SpecuLearn", hue: 3, what: "guess first — then the answer" },
  { emoji: "📚", name: "Lesson", hue: 0, what: "the rule, then drills" },
  { emoji: "🃏", name: "Flip It", hue: 1, what: "flashcards" },
  { emoji: "🔤", name: "ConjugaZone", hue: 2, what: "conjugation sprints" },
  { emoji: "🌧️", name: "Vocabularain", hue: 3, what: "sort the falling words" },
  { emoji: "🧰", name: "Lexicalator", hue: 4, what: "build the words" },
  { emoji: "🧩", name: "Compose It", hue: 5, what: "build dialogues" },
  { emoji: "🤖", name: "ChaTutor", hue: 5, what: "chat, role-play, get corrected" },
  { emoji: "🔁", name: "DéjàRevu", hue: 0, what: "resurfaces your misses at the right moment" },
  { emoji: "🎙️", name: "WorDrill", hue: 4, what: "speak — the mic checks (per deck or all decks)" },
];

const STEPS: { hue: number; what: React.ReactNode }[] = [
  { hue: 1, what: <>🏠 <b>Unité 0–4</b> flaps → tap the goal</> },
  { hue: 3, what: <>🧪 Pre-Test <b className="cahier-hl px-0.5">before</b> it&rsquo;s taught</> },
  { hue: 4, what: <>🎲 After class, drill with these</> },
];

const CONTINUE_STYLE =
  "mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-[#9f1239] bg-[#e11d48] px-5 py-2 font-black text-white shadow-[2px_2px_0_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5";

export default function GuideBody({ onContinue }: { onContinue?: () => void }) {
  return (
    <>
      {/* Steps 1 and 2 share the row, half each; step 3 (with the icons)
          takes the full width (Dan, 2026-07-14). */}
      <ol className="mt-3 grid grid-cols-2 gap-2.5">
        {STEPS.map((s, i) => (
          <li
            key={i}
            className={`fluo-h-${s.hue} flex items-center gap-3 rounded-xl border-2 p-3 ${i === 2 ? "col-span-2 !items-start" : ""}`}
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: "var(--fluo-card-accent)" }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-relaxed text-[color:var(--cahier-ink)]">{s.what}</p>
              {i === 2 && (
                <ul className="mt-3 grid grid-cols-3 gap-x-2 gap-y-3 sm:grid-cols-6">
                  {ACTIVITIES.map((a) => (
                    <li key={a.name} className={`fluo-h-${a.hue} flex flex-col items-center gap-1`} title={a.what}>
                      <span
                        aria-hidden
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white/80 text-2xl shadow-[2px_2px_0_rgba(0,0,0,0.12)]"
                        style={{ borderColor: "var(--fluo-card-accent)" }}
                      >
                        {a.emoji}
                      </span>
                      <span className="max-w-full truncate text-center text-[11px] font-bold leading-tight text-[color:var(--cahier-ink)]">
                        {a.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </span>
          </li>
        ))}
      </ol>
      {onContinue ? (
        <button type="button" onClick={onContinue} className={CONTINUE_STYLE}>
          <span aria-hidden>▶</span> Continue
        </button>
      ) : (
        <Link href="/" className={CONTINUE_STYLE}>
          <span aria-hidden>▶</span> Continue
        </Link>
      )}
    </>
  );
}
