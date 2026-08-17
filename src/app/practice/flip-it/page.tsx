import Link from "next/link";
import IndexRedirect from "@/components/IndexRedirect";

/** /practice/flip-it — was the 4Mémoire hub; now a door into the Index with
 *  4Mémoire preselected (patch 24). See IndexRedirect. */
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-center">
      <IndexRedirect activity="flip" />
      {/* No-JS fallback: the same link, by hand. */}
      <Link href="/activities?activity=flip" className="fluo-mono text-sm font-bold underline">
        📖 Index → 4Mémoire
      </Link>
    </main>
  );
}
