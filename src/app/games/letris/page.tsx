import Link from "next/link";
import BackLink from "@/components/BackLink";
import { listLetrisSets } from "@/games/letris/sets";
import { CURATED } from "@/content/collections";

/** Rain sets grouped by Unité (Dan, 2026-07-04: "organised rather than just
 *  listed out"). A set's unit comes from its backing collection; sets without
 *  one land under Extra. */
function groupedSets() {
  const unitOf = (slug: string): number | null => {
    const c = CURATED.find((x) => x.id === slug || x.id === `${slug}-letris`);
    return c?.unit ?? null;
  };
  const groups = new Map<string, ReturnType<typeof listLetrisSets>>();
  for (const s of listLetrisSets()) {
    const u = unitOf(s.slug);
    const key = u === null ? "Extra" : `Unité ${u}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }
  const order = ["Unité 0", "Unité 1", "Unité 2", "Unité 3", "Unité 4", "Extra"];
  return order.filter((k) => groups.has(k)).map((k) => ({ label: k, sets: groups.get(k)! }));
}

export default function LetrisIndexPage() {
  const groups = groupedSets();
  return (
    <main
      className="min-h-screen text-sky-950"
      style={{ background: "linear-gradient(180deg, #b5e0fb 0%, #e2f4ff 45%, #f4fbff 100%)" }}
    >
      <div className="border-b-2 border-white/70 bg-white/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 text-sm font-bold">
          <BackLink fallback="/" className="text-sky-700 hover:text-sky-900">
            ← Back
          </BackLink>
          <span className="text-sky-900/60">🌧️ Vocabularain</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-sky-700" style={{ textShadow: "0 2px 0 #fff" }}>
            🌧️ Vocabula<span className="text-sky-400">rain</span>
          </h1>
          <p className="mt-1 font-semibold text-sky-900/70">
            Words rain from the sky — steer each drop into the right puddle.
          </p>
        </header>

        {groups.map((g) => (
          <section key={g.label} className="mb-8">
            <h2 className="mb-3 text-xl font-black text-sky-800" style={{ textShadow: "0 1px 0 #fff" }}>
              {g.label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.sets.map((s) => (
                <Link
                  key={s.slug}
                  href={`/games/letris/${s.slug}`}
                  className="group flex h-full flex-col rounded-3xl border-4 border-white bg-white/85 p-5 shadow-md transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>
                      {s.emoji}
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-sky-900">{s.title}</h2>
                      {s.subtitle && (
                        <p className="text-xs font-semibold text-sky-900/60">{s.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-bold text-sky-700">
                    💧 {s.tileCount} drops · {s.categoryCount} puddles
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
