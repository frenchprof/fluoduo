/**
 * The Guide's content — a QUICK guide (Dan, 2026-07-14: "super concise").
 * Shared between /guide and the first-visit splash on the home page. One
 * line per fact; the pedagogy and the science live behind 💡 About. Step 3's
 * card CONTAINS the six activity tiles (Dan, 2026-07-13).
 */
import Link from "next/link";

const ACTIVITIES: { emoji: string; name: string; hue: number; what: string }[] = [
  { emoji: "📚", name: "Lesson", hue: 0, what: "the rule, then drills" },
  { emoji: "🃏", name: "Flip It", hue: 1, what: "flashcards" },
  { emoji: "🎤", name: "Say It", hue: 2, what: "speak — the mic checks" },
  { emoji: "🌧️", name: "Vocabularain", hue: 3, what: "sort the falling words" },
  { emoji: "🧰", name: "Lexicalator", hue: 4, what: "build the words" },
  { emoji: "🧩", name: "Compose It", hue: 5, what: "build dialogues" },
];

const STEPS: { emoji: string; title: string; hue: number; what: React.ReactNode }[] = [
  {
    emoji: "🏠",
    title: "Find your goal",
    hue: 1,
    what: <><b>Unité 0–4</b> flaps → <b className="cahier-hl px-0.5">tap the goal your class is on</b>.</>,
  },
  {
    emoji: "🧪",
    title: "Before class",
    hue: 3,
    what: <>Pre-Test it <b className="cahier-hl px-0.5">before it&rsquo;s taught</b>. Tap <b>WHY</b> on a miss; misses become <b>📝 Bring to class</b>.</>,
  },
  {
    emoji: "🎲",
    title: "After class",
    hue: 4,
    what: <>Drill the same words with <b className="cahier-hl px-0.5">any tab you enjoy</b>:</>,
  },
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
            key={s.title}
            className={`fluo-h-${s.hue} flex gap-3 rounded-xl border-2 p-3`}
            style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-black text-white"
              style={{ background: "var(--fluo-card-accent)" }}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <p className="text-sm font-black text-[color:var(--cahier-ink)]">
                {s.emoji} {s.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--cahier-ink)]">{s.what}</p>
              {i === 2 && (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {ACTIVITIES.map((a) => (
                    <li
                      key={a.name}
                      className={`fluo-h-${a.hue} flex items-start gap-2.5 rounded-xl border-2 bg-white/70 p-2.5`}
                      style={{ borderColor: "var(--fluo-card-accent)" }}
                    >
                      <span aria-hidden className="text-2xl leading-none">{a.emoji}</span>
                      <span className="text-sm leading-snug text-[color:var(--cahier-ink)]">
                        <b style={{ color: "var(--fluo-card-accent)" }}>{a.name}</b> — {a.what}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </span>
          </li>
        ))}
      </ol>

      <ul className="mt-4 space-y-1 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
        <li>🔊 speaks the French · 🐌 slowly — use them constantly.</li>
        <li>🔁 Réviser resurfaces your misses at the right moment.</li>
        <li>Sign in with Google to keep 💎 🔥 ✓ on every device.</li>
        <li>✨ (bottom left) replays the tour.</li>
        <li className="pt-1">
          <Link href="/activities" className="cahier-btn cahier-btn-sm mr-1.5 align-middle">🗂️ Index</Link>
          every topic × activity ·
          <Link href="/about" className="cahier-btn cahier-btn-sm mx-1.5 align-middle">💡 About</Link>
          the method &amp; the science
        </li>
      </ul>
    </>
  );
}
