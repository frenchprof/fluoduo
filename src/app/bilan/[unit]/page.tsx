import CahierShell from "@/components/CahierShell";
import BilanQuiz from "@/components/BilanQuiz";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { CHAPTERS } from "@/content/chapters";
import { UNIT_META } from "@/content/sios";

// No bilan for Unité 0 (Dan, 2026-07-08) — the warm-up unit doesn't need a
// fluency gate-marker; checks start where the real grammar starts.
export function generateStaticParams() {
  return ["1", "2", "3", "4"].map((unit) => ({ unit }));
}

export default async function BilanPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  const u = Number(unit);
  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), `unit-${u}`)} active={`unit-${u}`} crumb="🏁 Bilan">
      <div className="mx-auto max-w-xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🏁 Bilan de fluidité <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· {UNIT_META[u]?.label} — {CHAPTERS[u]?.scenario}</span>
        </h1>
        <p className="mt-1 mb-4 text-sm text-[color:var(--cahier-ink-soft)]">
          Toute l&rsquo;unité en 15 questions · 80 % pour le 🏁 · retakes illimités.
        </p>
        <BilanQuiz unit={u} />
      </div>
    </CahierShell>
  );
}
