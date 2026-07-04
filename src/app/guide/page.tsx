/**
 * Learner tutorial (Dan, 2026-07-05: "a new user might be quite lost").
 * An on-demand page — the litmus rule bans inline explanations inside
 * activities, so the one place prose is allowed is here, where the user
 * came asking for it. Kept scannable: every section answers one question.
 */
import Link from "next/link";
import CahierShell from "@/components/CahierShell";

const ACTIVITIES: { emoji: string; name: string; what: string }[] = [
  { emoji: "🃏", name: "Flip It", what: "Flashcards. Tap to flip French ↔ English; group and sort the deck." },
  { emoji: "🎤", name: "Say It", what: "Say the word out loud — the microphone checks your pronunciation." },
  { emoji: "✏️", name: "Complete It", what: "Type the missing letters or words." },
  { emoji: "🎲", name: "Dice trainer", what: "Roll the dice, build the sentence. Three levels: pick it, fill it, type it." },
  { emoji: "🎯", name: "ConjugaZone", what: "Conjugation drills — match the verb form to the subject." },
  { emoji: "🏃", name: "GramMarathon", what: "A grammar race: fill each gap before the clock runs." },
  { emoji: "🌧️", name: "Vocabularain", what: "Words rain down — sort them into the right columns before they land." },
  { emoji: "🧰", name: "Lexicalator", what: "Build words from syllables moving on a conveyor belt." },
];

export default function GuidePage() {
  return (
    <CahierShell
      tabs={[
        { key: "home", label: "Accueil", emoji: "🏠", href: "/" },
        { key: "guide", label: "Guide", emoji: "❓" },
      ]}
      active="guide"
      crumb="❓ Guide"
    >
      <div className="mx-auto max-w-2xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">❓ How this site works</h1>
        <p className="mt-2 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
          FluoLingo is the companion to your French class. It does two jobs:
          it <b>prepares</b> you before each lesson, and it gives you <b>practice</b> after it.
          Nothing here is graded — mistakes are part of the method.
        </p>

        <section className="mt-6">
          <h2 className="cahier-section rounded-md px-3 py-1.5">1 · Find your goal</h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
            The home page is the whole course: five units (Unité 0–4), each a list of
            goal cards — things you&rsquo;ll be able to <i>do</i> in French, like introducing
            yourself or ordering food. <b>Tap the goal your class is working on.</b>{" "}
            A popup opens with everything for that goal.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="cahier-section rounded-md px-3 py-1.5">2 · Before class — take the Pre-Test</h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
            Inside the popup, answer the short quiz <b>before</b> the topic is taught.
            Getting answers wrong is expected — trying first is what makes the lesson
            stick. After a wrong answer, tap <b>WHY</b> (top right of the question) to
            see what tripped you.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--fluo-ink)]">
            Your wrong answers collect in <b>📝 Bring to class</b> — that little list
            is exactly what to listen for during the lesson. Answer an item correctly
            later and it leaves the list.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="cahier-section rounded-md px-3 py-1.5">3 · After class — practise</h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
            The tabs on the popup&rsquo;s edge (and the chips inside it) lead to practice
            activities. They all drill the same words — pick whichever is fun:
          </p>
          <ul className="mt-3 space-y-2">
            {ACTIVITIES.map((a) => (
              <li key={a.name} className="flex gap-2 text-sm leading-snug text-[color:var(--cahier-ink)]">
                <span aria-hidden className="w-6 shrink-0 text-center">{a.emoji}</span>
                <span><b>{a.name}</b> — {a.what}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
            📚 Lessons have a Mémo (the pattern on one card) with a 🎲 trainer underneath.
            Looking for something specific? The{" "}
            <Link href="/activities" className="font-bold underline">🗂️ Index</Link>{" "}
            lists every topic × every activity on one page.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="cahier-section rounded-md px-3 py-1.5">4 · Sound</h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
            Every 🔊 speaks the French out loud — use it constantly. 🐌 plays it slowly.
            After answering a quiz question, tapping any option replays its sound.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="cahier-section rounded-md px-3 py-1.5">5 · Signing in (optional)</h2>
          <p className="mt-2 text-sm leading-relaxed text-[color:var(--cahier-ink)]">
            Everything works without an account. Signing in with Google adds memory:
            your 💎 gems, 🔥 streak, ✓ completed goals and review schedule are saved
            and follow you to any device you sign in on.
          </p>
        </section>

        <p className="mt-8 text-sm font-bold text-[color:var(--cahier-ink)]">
          Short version: tap your class&rsquo;s goal → try the Pre-Test → after class,
          play until it feels easy. <Link href="/" className="underline">Commencez ici 🏠</Link>
        </p>
      </div>
    </CahierShell>
  );
}
