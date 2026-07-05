/**
 * Learner tutorial (Dan, 2026-07-05: "a new user might be quite lost", then
 * "way too wordy — succinct yet clear", then "needs more color"). The one
 * page where prose is allowed (the litmus rule bans it inside activities) —
 * but even here, each idea gets ONE line. Color comes from the site's six
 * unit hues (.fluo-h-*): one per step card, one per activity tile. The ✨
 * chip at the bottom left replays the guided tour.
 */
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

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

const ACTIVITIES: { emoji: string; name: string; hue: number; what: string }[] = [
  { emoji: "📚", name: "Lesson", hue: 0, what: "read the rule, then climb: pick it → type it → type it all." },
  { emoji: "🃏", name: "Flip It", hue: 1, what: "flashcards — tap to flip, sort the deck." },
  { emoji: "🎤", name: "Say It", hue: 2, what: "speak — the mic checks you." },
  { emoji: "🌧️", name: "Vocabularain", hue: 3, what: "sort the falling words before they land." },
  { emoji: "🧰", name: "Lexicalator", hue: 4, what: "build words from conveyor-belt syllables." },
  { emoji: "🧩", name: "Compose It", hue: 5, what: "build real dialogues from a phrase bank." },
];

export default function GuidePage() {
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "guide")} active="guide" crumb="❓ Guide">
      <div className="mx-auto max-w-2xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">❓ How <span className="cahier-hl px-1">FluoLingo</span> works</h1>
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
              <span>
                <p className="text-sm font-black text-[color:var(--cahier-ink)]">
                  {s.emoji} {s.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[color:var(--cahier-ink)]">{s.what}</p>
              </span>
            </li>
          ))}
        </ol>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ACTIVITIES.map((a) => (
            <li
              key={a.name}
              className={`fluo-h-${a.hue} flex items-start gap-2.5 rounded-xl border-2 p-2.5`}
              style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
            >
              <span aria-hidden className="text-2xl leading-none">{a.emoji}</span>
              <span className="text-sm leading-snug text-[color:var(--cahier-ink)]">
                <b style={{ color: "var(--fluo-card-accent)" }}>{a.name}</b> — {a.what}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
          🔊 speaks the French (🐌 = slowly) — use it constantly. The{" "}
          <Link href="/activities" className="font-bold underline">🗂️ Index</Link> lists every
          topic × activity. Sign in with Google to keep 💎 🔥 ✓ on every device.
          The ✨ button (bottom left) replays the tour.
        </p>

        <p className="mt-5">
          <Link href="/" className="fluo-h-1 inline-block rounded-full border-2 px-4 py-1.5 text-sm font-black text-white shadow-[3px_3px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5" style={{ background: "var(--fluo-card-accent)", borderColor: "var(--fluo-card-accent)" }}>
            Commencez ici 🏠
          </Link>
        </p>
      </div>
    </CahierShell>
  );
}
