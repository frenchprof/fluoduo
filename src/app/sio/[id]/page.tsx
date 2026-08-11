/**
 * One SIO page (Units 1-4 — Unité 0 uses a popup on the home page instead,
 * see Unit0Panel.tsx). Simplified 2026-07-01 per Dan: "we don't need such
 * elaborate SIO details. It can be reduced to just Statement of SIO and
 * Measurable Language Competency. And two tiles below side by side" — see
 * SioDetail.tsx for that compact view; this page is now just its chrome
 * (top bar, chain hint, prev/next) plus a MarkDoneButton.
 *
 * Server component (Next 16: params is a Promise → await it). Wires the
 * existing curated pretest / deck where they exist; marks the rest planned.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSio, siblingSios, chainFor, SIOS } from "@/content/sios";

export function generateStaticParams() {
  return SIOS.map((s) => ({ id: s.id }));
}
import { CURATED } from "@/content/collections";
import { getPretestForSio } from "@/content/pretests";
import type { Collection } from "@/lib/collections/schema";
import MarkDoneButton from "./MarkDoneButton";
import SioDetail from "../../SioDetail";
import CahierShell from "@/components/CahierShell";

function collectionById(id: string | null): Collection | undefined {
  if (!id) return undefined;
  return CURATED.find((c) => c.id === id);
}

export default async function SioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sio = getSio(id);
  if (!sio) notFound();

  const { prev, next } = siblingSios(sio.id);
  const deck = collectionById(sio.collectionId);
  const pretest = getPretestForSio(sio.id);
  const pretestHref = pretest
    ? `/pretests/${pretest.id}`
    : deck?.gameConfig?.letris
      ? `/practice/dice/${deck.id}` // deck MCQ as the cold-guess fallback (needs letris columns)
      : null;
  const chain = chainFor(sio.id);

  return (
    <CahierShell
      tabs={[
        { key: "home", label: "Home", emoji: "🏠", href: "/" },
        { key: "unit", label: sio.unitLabel, emoji: "📖", href: `/#unit-${sio.unit}` },
        { key: "sio", label: sio.id },
      ]}
      active="sio"
    >
      <div className="mx-auto max-w-3xl px-4 py-4">
        <header className="mb-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="fluo-mono rounded-md bg-[var(--fluo-card-tint)] px-2 py-0.5 text-sm font-bold text-[color:var(--fluo-ink)]">
              {sio.id}
            </span>
            <span className="fluo-label">{sio.cefrMode} · A1</span>
          </div>
          <h1 className="fluo-readable text-3xl font-bold leading-tight text-[color:var(--fluo-ink)]">
            {sio.topic}
          </h1>
        </header>

        {chain && (
          <p className="mb-6 rounded-xl border border-[color:var(--fluo-line)] bg-[var(--fluo-card-tint)] px-4 py-2 text-xs text-[color:var(--fluo-ink-soft)]">
            🔗 Part of a chain on the same countries —{" "}
            {chain.map((cid, i) => {
              const s = getSio(cid);
              return (
                <span key={cid}>
                  {i > 0 && " → "}
                  {cid === sio.id ? (
                    <strong className="text-[color:var(--fluo-ink)]">{s?.topic ?? cid}</strong>
                  ) : (
                    <Link href={`/sio/${cid}`} className="underline hover:text-[color:var(--fluo-ink)]">
                      {s?.topic ?? cid}
                    </Link>
                  )}
                </span>
              );
            })}
          </p>
        )}

        <SioDetail sio={sio} deck={deck} pretestHref={pretestHref} pretestId={pretest?.id ?? null} />
        <MarkDoneButton sioId={sio.id} />

        <nav className="mt-10 flex items-stretch justify-between gap-3">
          {prev ? (
            <Link href={`/sio/${prev.id}`} className="fluo-card flex-1 hover:bg-[#fbf2e3]">
              <span className="fluo-label">← {prev.id}</span>
              <p className="fluo-readable text-sm font-bold text-[color:var(--fluo-ink)]">{prev.topic}</p>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link href={`/sio/${next.id}`} className="fluo-card flex-1 text-right hover:bg-[#fbf2e3]">
              <span className="fluo-label">{next.id} →</span>
              <p className="fluo-readable text-sm font-bold text-[color:var(--fluo-ink)]">{next.topic}</p>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </nav>
      </div>
    </CahierShell>
  );
}
