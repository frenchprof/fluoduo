import Link from "next/link";
import IndexRedirect from "@/components/IndexRedirect";

/** /practice/grammarathon — was the GramMarathon hub; now a door into the Index with
 *  GramMarathon preselected (patch 24). See IndexRedirect. */
export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-center">
      <IndexRedirect activity="grammarathon" />
      {/* No-JS fallback: the same link, by hand. */}
      <Link href="/activities?activity=grammarathon" className="fluo-mono text-sm font-bold underline">
        📖 Index → GramMarathon
      </Link>
    </main>
  );
}
