import Link from "next/link";
import AuthGate from "@/components/AuthGate";
import { ALL_LESSONS } from "@/content/lessons";

export const metadata = { title: "Grammar lessons · FluoLingo" };

export default function LessonsGallery() {
  const units = [...new Set(ALL_LESSONS.map((l) => l.unit))].sort((a, b) => a - b);
  return (
    <AuthGate what="open the lessons">
      <main className="mx-auto max-w-3xl px-4 py-8 text-[color:var(--fluo-ink)]">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="fluo-hl font-black">← FluoLingo</Link>
        </div>
        <h1 className="fluo-serif text-3xl font-black">📚 Grammar lessons</h1>
        <p className="mt-2 mb-8 max-w-xl text-sm text-[color:var(--fluo-ink-soft)]">
          Interactive lessons with the 🎲 sentence-generator trainer — build fluency by generating
          prompts and producing the French, at your own difficulty level.
        </p>

        {units.map((u) => (
          <section key={u} className="mb-8">
            <h2 className="fluo-label mb-3 text-[color:var(--fluo-ink-soft)]">Unité {u}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ALL_LESSONS.filter((l) => l.unit === u).map((l) => (
                <Link
                  key={l.slug}
                  href={`/lessons/${l.slug}`}
                  className="flex items-center gap-3 rounded-2xl border-2 bg-[var(--fluo-card)] p-4 transition hover:-translate-y-0.5 hover:shadow-[2px_3px_0_var(--fluo-card-accent)]"
                  style={{ borderColor: "var(--fluo-card-accent)" }}
                >
                  <span className="text-2xl" aria-hidden>🎲</span>
                  <span lang="fr" className="text-sm font-bold leading-snug">{l.title}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </AuthGate>
  );
}
