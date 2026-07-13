/**
 * The Guide's content, shared between /guide and the first-visit splash on
 * the home page (Dan, 2026-07-13). Step 3's card CONTAINS the six activity
 * tiles — the orange card extends to include them.
 */
import Link from "next/link";

const ACTIVITIES: { emoji: string; name: string; hue: number; what: string }[] = [
  { emoji: "📚", name: "Lesson", hue: 0, what: "read the rule, then climb: pick it → type it → type it all." },
  { emoji: "🃏", name: "Flip It", hue: 1, what: "flashcards — tap to flip, sort the deck." },
  { emoji: "🎤", name: "Say It", hue: 2, what: "speak — the mic checks you." },
  { emoji: "🌧️", name: "Vocabularain", hue: 3, what: "sort the falling words before they land." },
  { emoji: "🧰", name: "Lexicalator", hue: 4, what: "build words from conveyor-belt syllables." },
  { emoji: "🧩", name: "Compose It", hue: 5, what: "build real dialogues from a phrase bank." },
];

const STEPS: { emoji: string; title: string; hue: number; what: React.ReactNode }[] = [
  {
    emoji: "🏠",
    title: "Find your goal",
    hue: 1,
    what: <>Home shows your journey; the <b>Unité 0–4</b> flaps hold the goals. <b className="cahier-hl px-0.5">Tap the one your class is on.</b></>,
  },
  {
    emoji: "🧪",
    title: "Before class: Pre-Test",
    hue: 3,
    what: <>Try the quiz <b className="cahier-hl px-0.5">before</b> it&rsquo;s taught — wrong answers are the method. Tap <b>WHY</b> on a miss; your misses become <b>📝 Bring to class</b>.</>,
  },
  {
    emoji: "🎲",
    title: "After class: practise",
    hue: 4,
    what: <>The popup&rsquo;s edge tabs all drill the same words — <b className="cahier-hl px-0.5">pick whichever is fun</b>.</>,
  },
];

export default function GuideBody() {
  return (
    <>
      <p className="mt-2 text-sm font-bold leading-relaxed text-[color:var(--cahier-ink)]">
        Your French class&rsquo;s companion: <b className="cahier-hl px-0.5">prepare</b> before each lesson, <b className="cahier-hl px-0.5">practise</b> after. Nothing is graded.
      </p>

      <ol className="mt-5 space-y-3">
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
              {/* Step 3 CONTAINS the activity tiles (Dan, 2026-07-13: "the
                  orange number 3 card extends to include the 6 subtiles"). */}
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

      <div className="mt-5 rounded-xl border-2 border-dashed border-[color:var(--cahier-ink)]/40 p-3">
        <p className="text-sm font-black text-[color:var(--cahier-ink)]">Why it works this way</p>
        <ul className="mt-1.5 space-y-1 text-sm leading-snug text-[color:var(--cahier-ink)]">
          <li>🧪 Test first — trying before you&rsquo;re taught makes the lesson stick.</li>
          <li>📝 Mistakes are your class agenda, not your grade.</li>
          <li>🎲 You produce more than you read — that&rsquo;s where learning lives.</li>
          <li>🔁 Little and often beats cramming — Réviser times it for you.</li>
        </ul>
        <p className="mt-1.5 text-sm text-[color:var(--cahier-ink)]">
          The full thinking, with the science: <Link href="/about" className="cahier-btn cahier-btn-sm mx-0.5 align-middle">💡 About</Link>
        </p>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
        🔊 speaks the French (🐌 = slowly) — use it constantly. The{" "}
        <Link href="/activities" className="cahier-btn cahier-btn-sm mx-0.5 align-middle">🗂️ Index</Link> lists every
        topic × activity. Sign in with Google to keep 💎 🔥 ✓ on every device.
        The ✨ button (bottom left) replays the tour.
      </p>
    </>
  );
}
