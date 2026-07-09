import Link from "next/link";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import { UNIT_META } from "@/content/sios";
import { CHAPTERS } from "@/content/chapters";
import UnitSection from "../../UnitSection";

export function generateStaticParams() {
  return ["0", "1", "2", "3", "4"].map((unit) => ({ unit }));
}

export default async function UnitPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  const u = Number(unit);
  const key = `unit-${u}`;
  const chapter = CHAPTERS[u];
  return (
    <CahierShell
      tabs={tabsWithActive(siteTabs(), key)}
      active={key}
      crumb={`${UNIT_META[u]?.emoji ?? ""} ${UNIT_META[u]?.label ?? `Unité ${u}`}`}
    >
      <div className="mx-auto max-w-3xl px-1 py-2">
        {/* Chapter intro card (episode model, Dan 2026-07-08). */}
        {chapter && (
          <section className={`fluo-h-${u % 6} mb-3`}>
            <div className="rounded-2xl border-2 px-4 py-3" style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}>
              <p lang="fr" className="fluo-serif text-xl font-black text-[color:var(--fluo-ink)]">
                {UNIT_META[u]?.emoji} {chapter.scenario}
              </p>
              <p lang="fr" className="text-sm font-bold text-[color:var(--fluo-ink)]/70">{chapter.tagline}</p>
            </div>
          </section>
        )}

        <UnitSection unit={u} />

        {/* Chapter end: the tease for the next chapter. */}
        <section className={`fluo-h-${u % 6} mt-4 space-y-2`}>
          {chapter?.cliffhanger && u < 4 && (
            <Link
              href={`/unit/${u + 1}`}
              className="block rounded-2xl border-2 border-dashed px-4 py-3 text-sm font-bold text-[color:var(--fluo-ink)] transition hover:-translate-y-0.5"
              style={{ borderColor: "var(--fluo-card-accent)", background: "var(--fluo-card-tint)" }}
            >
              <span lang="fr">👀 {chapter.cliffhanger}</span>
            </Link>
          )}
        </section>
      </div>
    </CahierShell>
  );
}
