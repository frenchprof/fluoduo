import Link from "next/link";

/**
 * Global 404 (Dan, 2026-08-02: a retired or mistyped URL — e.g. an old
 * bookmark to a deck id that no longer exists — used to fall through to a
 * bare, unstyled default page, or crash outright under `output: "export"`'s
 * static-param constraints). One on-brand fallback for the whole site.
 */
export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center"
      style={{ background: "linear-gradient(180deg,#eaf7ff 0%,#f6fbff 100%)" }}
    >
      <p className="text-5xl" aria-hidden>
        🤷
      </p>
      <h1 className="text-2xl font-black text-[#0c4a6e]">Page introuvable</h1>
      <p className="max-w-sm text-sm text-[#075985]">
        This page doesn&rsquo;t exist — it may have moved, been renamed, or never been here at all.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-2xl border-b-4 border-[#1899d6] bg-[#1cb0f6] px-5 py-2 font-black text-white transition active:translate-y-0.5 active:border-b-2"
      >
        ← Retour à l&rsquo;accueil
      </Link>
    </main>
  );
}
