import Link from "next/link";
import { UNIT_META } from "@/content/sios";
import UnitRedirect from "./UnitRedirect";

/** /unit/N — a deep link into Home (patch 25). The five static pages still
 *  build (old links, the shell's Unité flaps, DrillShell's back link) but
 *  each one only redirects to `/?unit=N` + hash; see UnitRedirect. */
export function generateStaticParams() {
  return ["0", "1", "2", "3", "4"].map((unit) => ({ unit }));
}

export async function generateMetadata({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  const u = Number(unit);
  return { title: UNIT_META[u]?.label ?? `Unité ${u}` };
}

export default async function UnitPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  const u = Number(unit);
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-center">
      <UnitRedirect unit={u} />
      {/* No-JS fallback: the same link, by hand. */}
      <Link href={`/?unit=${u}`} className="fluo-mono text-sm font-bold underline">
        {UNIT_META[u]?.label ?? `Unité ${u}`} →
      </Link>
    </main>
  );
}
