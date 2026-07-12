import Link from "next/link";
import BackLink from "@/components/BackLink";
import { CURATED } from "@/content/collections";
import { isLexReadyId } from "@/lib/collections/lexReady";

/** Every Lexicalator in one place (Dan, 2026-07-13: a flap tab "leading to a
 *  page consolidating all the links towards that game") — the 🧰 twin of the
 *  Vocabularain gallery, grouped by Unité. */
function groups() {
  const decks = CURATED.filter((c) => isLexReadyId(c.id));
  return [0, 1, 2, 3, 4]
    .map((u) => ({ unit: u, decks: decks.filter((c) => c.unit === u) }))
    .filter((g) => g.decks.length > 0);
}

export default function LexicalatorIndexPage() {
  return (
    <main
      className="min-h-screen text-[#5a3a08]"
      style={{ background: "linear-gradient(180deg, #ffe9b0 0%, #fff4d6 45%, #fffdf4 100%)" }}
    >
      <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm font-bold">
          <BackLink fallback="/" className="text-[#a06a10] hover:text-[#5a3a08]">← Back</BackLink>
          <span className="text-[#5a3a08]/60">🧰 Lexicalator</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-[#c8860f]" style={{ textShadow: "0 2px 0 #fff" }}>
            🧰 Lexic<span className="text-[#e3a700]">alator</span>
          </h1>
          <p className="mt-1 font-semibold text-[#5a3a08]/70">
            Pick a chest, forge its French from the syllables on the belt.
          </p>
        </header>

        {groups().map((g) => (
          <section key={g.unit} className="mb-8">
            <h2 className="mb-3 text-lg font-black text-[#5a3a08]">Unité {g.unit}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {g.decks.map((c) => (
                <Link
                  key={c.id}
                  href={`/games/conveyor/${c.id}`}
                  className="rounded-2xl border-2 border-b-4 border-[#e0a500] bg-white p-4 font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span lang="fr" className="block text-[#5a3a08]">{c.title}</span>
                  {c.subtitle && <span className="mt-0.5 block text-xs font-semibold text-[#5a3a08]/60">{c.subtitle}</span>}
                  <span className="mt-2 inline-block rounded-full bg-[#ffe08a] px-2 py-0.5 text-xs text-[#7a4e0a]">{c.items.length} mots</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
