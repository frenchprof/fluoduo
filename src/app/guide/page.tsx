/**
 * Learner tutorial (Dan, 2026-07-05: "a new user might be quite lost", then
 * "way too wordy — succinct yet clear"). The one page where prose is allowed
 * (the litmus rule bans it inside activities) — but even here, each idea gets
 * ONE line. The ✨ chip at the bottom left replays the guided tour.
 */
import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";

const STEPS: { emoji: string; title: string; what: React.ReactNode }[] = [
  {
    emoji: "🏠",
    title: "Find your goal",
    what: <>Home shows your journey; the <b>Unité 0–4</b> flaps hold the goals. <b className="cahier-hl px-0.5">Tap the one your class is on.</b></>,
  },
  {
    emoji: "🧪",
    title: "Before class: Pre-Test",
    what: <>Try the quiz <b className="cahier-hl px-0.5">before</b> it&rsquo;s taught — wrong answers are the method. Tap <b>WHY</b> on a miss; your misses become <b>📝 Bring to class</b>.</>,
  },
  {
    emoji: "🎲",
    title: "After class: practise",
    what: <>The popup&rsquo;s edge tabs all drill the same words — <b className="cahier-hl px-0.5">pick whichever is fun</b>.</>,
  },
];

const ACTIVITIES: { emoji: string; name: string; what: string }[] = [
  { emoji: "📚", name: "Lesson", what: "read the rule, then climb: pick it → type it → type it all." },
  { emoji: "🃏", name: "Flip It", what: "flashcards — tap to flip, sort the deck." },
  { emoji: "🎤", name: "Say It", what: "speak — the mic checks you." },
  { emoji: "🌧️", name: "Vocabularain", what: "sort the falling words before they land." },
  { emoji: "🧰", name: "Lexicalator", what: "build words from conveyor-belt syllables." },
  { emoji: "🧩", name: "Compose It", what: "build real dialogues from a phrase bank." },
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
            <li key={s.title} className="rounded-xl border-2 border-[color:var(--cahier-line,#d8cfc2)] bg-white/60 p-3">
              <p className="text-sm font-black text-[color:var(--cahier-ink)]">
                {i + 1} · {s.emoji} {s.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--cahier-ink)]">{s.what}</p>
            </li>
          ))}
        </ol>

        <ul className="mt-4 space-y-1.5">
          {ACTIVITIES.map((a) => (
            <li key={a.name} className="flex gap-2 text-sm leading-snug text-[color:var(--cahier-ink)]">
              <span aria-hidden className="w-6 shrink-0 text-center">{a.emoji}</span>
              <span><b>{a.name}</b> — {a.what}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
          🔊 speaks the French (🐌 = slowly) — use it constantly. The{" "}
          <Link href="/activities" className="font-bold underline">🗂️ Index</Link> lists every
          topic × activity. Sign in with Google to keep 💎 🔥 ✓ on every device.
          The ✨ button (bottom left) replays the tour.
        </p>

        <p className="mt-5 text-sm font-bold text-[color:var(--cahier-ink)]">
          <Link href="/" className="underline">Commencez ici 🏠</Link>
        </p>
      </div>
    </CahierShell>
  );
}
