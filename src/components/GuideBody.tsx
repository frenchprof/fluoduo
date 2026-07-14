/**
 * The Guide's content — a QUICK guide (Dan, 2026-07-14: one-liner steps,
 * app-icon activity grid with hover phrases, one-line footer). Shared
 * between /guide and the first-visit splash. The pedagogy lives behind
 * 💡 About. Step 3's card CONTAINS the activity icons (Dan, 2026-07-13).
 */
import Link from "next/link";

/** Every activity, iPhone-style: icon + name, the short phrase on hover
 *  (title) — Réviser/ConjugaZone/Tuteur included here, not below. */
const ACTIVITIES: { emoji: string; name: string; hue: number; what: string }[] = [
  { emoji: "📚", name: "Lesson", hue: 0, what: "the rule, then drills" },
  { emoji: "🃏", name: "Flip It", hue: 1, what: "flashcards" },
  { emoji: "🎤", name: "Say It", hue: 2, what: "speak — the mic checks" },
  { emoji: "🌧️", name: "Vocabularain", hue: 3, what: "sort the falling words" },
  { emoji: "🧰", name: "Lexicalator", hue: 4, what: "build the words" },
  { emoji: "🧩", name: "Compose It", hue: 5, what: "build dialogues" },
  { emoji: "🔁", name: "Réviser", hue: 0, what: "resurfaces your misses at the right moment" },
  { emoji: "🔤", name: "ConjugaZone", hue: 2, what: "conjugation sprints" },
  { emoji: "🤖", name: "Tuteur", hue: 5, what: "chat, role-play, get corrected" },
];

const STEPS: { hue: number; what: React.ReactNode }[] = [
  { hue: 1, what: <>🏠 <b>Unité 0–4</b> flaps → <b className="cahier-hl px-0.5">tap the goal your class is on</b>.</> },
  { hue: 3, what: <>🧪 Pre-Test <b className="cahier-hl px-0.5">before it&rsquo;s taught</b> — <b>WHY</b> on a miss → <b>📝 Bring to class</b>.</> },
  { hue: 4, what: <>🎲 After class, drill with <b className="cahier-hl px-0.5">any of these</b>:</> },
];

export default function GuideBody() {
  return (
    <>
      <p className="mt-2 text-sm font-bold leading-relaxed text-[color:var(--cahier-ink)]">
        <b className="cahier-hl px-0.5">Prepare</b> before class, <b className="cahier-hl px-0.5">practise</b> after. Nothing is graded.
      </p>

      <ol className="mt-4 space-y-3">
        {STEPS.map((s, i) => (
          <li
            key={i}
            className={`fluo-h-${s.hue} flex items-start gap-3 rounded-xl border-2 p-3`}
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: "var(--fluo-card-accent)" }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed text-[color:var(--cahier-ink)]">{s.what}</p>
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

      <p className="mt-4 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
        🔊 hear it (🐌 slowly) · sign in with Google to keep 💎 🔥 ✓ everywhere · ✨ replays the tour
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
        <Link href="/activities" className="cahier-btn cahier-btn-sm mr-1.5 align-middle">🗂️ Index</Link>
        every topic × activity ·
        <Link href="/about" className="cahier-btn cahier-btn-sm mx-1.5 align-middle">💡 About</Link>
        the method &amp; the science
      </p>
    </>
  );
}
