"use client";

/**
 * The essentials-only body for a SIO popup (Dan, 2026-07-01: "STICK TO THE
 * ESSENTIALS. SHORT AND SWEET. EFFICIENT" — no "Statement of SIO" / "Measurable
 * Language Competency" headers, just one merged sentence via sioStatement()).
 * Below it: two tiles side by side, Pre-Test Prep / Post-Class Practice.
 * Shared between SioHub's Units 1-4 popups and (indirectly, via the same
 * merged sentence) Unit0Panel's popup.
 *
 * Post-Class Practice always offers Flip It, Say It, Complete It, and Match It
 * (Conveyor — works for any FR/EN deck), PLUS Classify It (Letris) whenever the
 * deck has a sort-column axis. Dan, 2026-07-01: "some topics are better as
 * letris..., others as lexpress..., sometimes both" — an earlier pass treated
 * these as mutually exclusive; that was wrong, this shows both when both apply.
 */
import Link from "next/link";
import { sioStatement, type Sio } from "@/content/sios";
import type { Collection } from "@/lib/collections/schema";

export default function SioDetail({
  sio,
  deck,
  pretestHref,
}: {
  sio: Sio;
  deck?: Collection;
  pretestHref: string | null;
}) {
  return (
    <div>
      <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
        <span className="fluo-hl">{sioStatement(sio)}</span>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border-2 p-3" style={{ borderColor: "#7c6cff" }}>
          <p className="fluo-label mb-2" style={{ color: "#7c6cff" }}>Pre-Test Prep</p>
          {pretestHref ? (
            <Link href={pretestHref} className="fluo-btn fluo-btn-sm">🧪 Start</Link>
          ) : (
            <span className="text-xs text-[color:var(--fluo-ink-soft)]">Planned</span>
          )}
        </div>

        <div className="rounded-xl border-2 p-3" style={{ borderColor: "#3a9b5c" }}>
          <p className="fluo-label mb-2" style={{ color: "#3a9b5c" }}>Post-Class Practice</p>
          {sio.isProduction ? (
            <span className="text-xs text-[color:var(--fluo-ink-soft)]">🗣️ In-class task</span>
          ) : deck ? (
            <PracticeChips deck={deck} />
          ) : (
            <span className="text-xs text-[color:var(--fluo-ink-soft)]">Planned</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function PracticeChips({ deck }: { deck: Collection }) {
  const hasLetris = !!deck.gameConfig?.letris;
  const chips = [
    { key: "flip", label: "🃏 Flip It", href: `/practice/flip-it/${deck.id}` },
    { key: "say", label: "🎤 Say It", href: `/practice/say-it/${deck.id}` },
    { key: "complete", label: "✏️ Complete It", href: undefined },
    { key: "match", label: "🎢 Match It", href: `/games/conveyor/${deck.id}` },
    ...(hasLetris
      ? [{ key: "classify", label: "🗂️ Classify It", href: `/games/letris/${deck.id.replace("-letris", "")}` }]
      : []),
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c) =>
        c.href ? (
          <Link key={c.key} href={c.href} className="fluo-btn fluo-btn-sm">
            {c.label}
          </Link>
        ) : (
          <span
            key={c.key}
            title="Coming soon"
            className="rounded-full border border-[color:var(--fluo-line)] px-2.5 py-1 text-xs font-bold text-[color:var(--fluo-ink-soft)] opacity-60"
          >
            {c.label}
          </span>
        ),
      )}
    </div>
  );
}
