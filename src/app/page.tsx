import Link from "next/link";
import MyDecks from "./MyDecks";
import SioHub from "./SioHub";
import { HomeNavTabs, HomeNavBurger } from "./HomeNav";

export default function Home() {
  return (
    <div className="cahier-desk">
      <div className="cahier-deskrow relative">
        <main className="cahier-page min-h-screen">
          <div className="cahier-binding" aria-hidden />
          {/* Orange header bar — sits atop the ruled paper */}
          <div className="border-b-2 border-[color:var(--fluo-line)] bg-[#fce8d4]/90 backdrop-blur sticky top-0 z-10">
            <div className="relative flex items-center justify-between py-3 pl-12 pr-4 sm:pl-14">
              <h1 className="fluo-serif text-lg font-black text-[color:var(--fluo-ink)]">
                <span className="fluo-hl">FluoLingo</span> <span aria-hidden>✨</span>
              </h1>
              <div className="flex items-center gap-2">
                <HomeNavBurger />
                <Link href="/decks/new" className="fluo-btn fluo-btn-sm">
                  ➕ Your Custom Deck
                </Link>
              </div>
            </div>
          </div>

          <div className="py-8 pl-12 pr-6 sm:pl-16">
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

        {/* Sticky tab rail — shown ≥1100px by CSS */}
        <HomeNavTabs />
      </div>
    </div>
  );
}
