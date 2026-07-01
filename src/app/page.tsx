import Link from "next/link";
import MyDecks from "./MyDecks";
import SioHub from "./SioHub";

export default function Home() {
  return (
    <main className="fluo-surface min-h-screen">
      <div className="border-b-2 border-[color:var(--fluo-line)] bg-[#fce8d4]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="fluo-serif text-lg font-black text-[color:var(--fluo-ink)]">
            <span className="fluo-hl">FluoLingo</span> <span aria-hidden>✨</span>
          </h1>
          <Link href="/decks/new" className="fluo-btn fluo-btn-sm">
            ➕ New deck
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-8">
          <h2 className="fluo-serif text-3xl font-black text-[color:var(--fluo-ink)]">
            French 1 — <span className="fluo-hl">50 Can-Do objectives</span>
          </h2>
          <p className="mt-2 max-w-2xl text-base text-[color:var(--fluo-ink-soft)]">
            Behind each Instructional Objective are two sections: a{" "}
            <strong>Pre-lesson Pretest Preparation</strong>, that you do before coming to class, and
            a <strong>Post-lesson Personal Practice</strong>.
          </p>
        </header>

        <SioHub />

        <MyDecks />
      </div>
    </main>
  );
}
