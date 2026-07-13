import Link from "next/link";
import BackLink from "@/components/BackLink";
import { listLetrisSets } from "@/games/letris/sets";
import { CURATED } from "@/content/collections";
import { shortTitle } from "@/lib/shortTitles";

/** Rain sets grouped by Unité (Dan, 2026-07-04: "organised rather than just
 *  listed out"). A set's unit comes from its backing collection; sets without
 *  one land under Extra. */
// Unit accent colours — same palette as the site flaps.
const UNIT_COLORS: Record<string, { accent: string; tint: string }> = {
  "Unité 0": { accent: "#e0567f", tint: "#fbe3ec" },
  "Unité 1": { accent: "#2bb6c2", tint: "#def3f5" },
  "Unité 2": { accent: "#e3a700", tint: "#fbeec4" },
  "Unité 3": { accent: "#8a5fd4", tint: "#ece2fa" },
  "Unité 4": { accent: "#e8852e", tint: "#fbe6cf" },
  Extra: { accent: "#5b8def", tint: "#e0eaff" },
};

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

        {/* iCloud-gallery layout (Dan, 2026-07-13): compact photo-like tiles,
            prominent titles, colour-coded by Unit. */}
        {groups.map((g) => {
          const col = UNIT_COLORS[g.label] ?? UNIT_COLORS.Extra;
          return (
            <section key={g.label} className="mb-8">
              <h2 className="mb-3 inline-block rounded-full px-4 py-1 text-base font-black text-white" style={{ background: col.accent }}>
                {g.label}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {g.sets.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/games/letris/${s.slug}`}
                    className="group flex h-full flex-col items-center rounded-2xl border-2 border-b-4 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: col.accent }}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl" style={{ background: col.tint }} aria-hidden>
                      {s.emoji}
                    </span>
                    <span className="mt-2 line-clamp-2 text-sm font-black leading-snug text-sky-950" lang="fr" title={s.title}>
                      {shortTitle(s.slug, s.title)}
                    </span>
                    <span className="mt-auto pt-2 text-[11px] font-bold" style={{ color: col.accent }}>
                      💧 {s.tileCount} · {s.categoryCount} puddles
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
