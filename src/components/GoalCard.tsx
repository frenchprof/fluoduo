"use client";

/**
 * One goal, spelled out, with links to everything on it.
 *
 * Dan, 2026-09-05: *"Path should by now be renamed as '<-- 🎯 Goal', and
 * display only the SIO description with the links to items"*, and then the
 * shape of the whole app: *"so the idea is / MAP > SIO > MneMemO > ..."*.
 *
 * The middle level of that chain and the lesson's own Goal tab are the SAME
 * card, which is why it lives here rather than twice. They are reached
 * differently — one by scrolling the fifty, one by tapping a tab — and if they
 * were written separately the tab would drift from the page it is a shortcut
 * to, which is how a learner ends up seeing two different accounts of one goal.
 */
import Link from "next/link";
import { deckActivityTabs } from "@/components/CahierShell";
import type { Sio } from "@/content/sios";

export default function GoalCard({ sio, compact }: { sio: Sio; compact?: boolean }) {
  const items = sio.collectionId ? deckActivityTabs(sio.collectionId).filter((t) => t.href) : [];
  return (
    <>
      <p className="fluo-mono text-[11px] font-black uppercase tracking-wider text-[color:var(--fluo-ink-soft)]">
        {sio.id} · {sio.unitLabel}
      </p>
      <p className="mt-1 text-base font-bold text-[color:var(--cahier-ink)]">{sio.canDo}</p>
      {sio.description && (
        <p className="mt-2 text-[14px] text-[color:var(--fluo-ink-soft)]">{sio.description}</p>
      )}

      {items.length > 0 && (
        <div className={`${compact ? "mt-3" : "mt-4"} grid grid-cols-2 gap-1.5`}>
          {items.map((t) => (
            <Link
              key={t.key}
              href={t.href!}
              className="flex items-center gap-1.5 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-[color:var(--cahier-paper-raised)] px-2.5 py-2 text-[13px] font-black text-[color:var(--cahier-ink)] no-underline transition hover:border-[color:var(--fam-ink)]"
            >
              <span aria-hidden>{t.emoji}</span>
              <span className="whitespace-nowrap">{t.label}</span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
