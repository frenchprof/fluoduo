"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/lib/firebase/auth";
import { getMyCollections } from "@/lib/firebase/collections";
import type { Collection } from "@/lib/collections/schema";

export default function MyDecks({ bare = false }: { bare?: boolean }) {
  const user = useAuthUser();
  const [decks, setDecks] = useState<Collection[] | null>(null);

  useEffect(() => {
    if (!user) {
      setDecks(null);
      return;
    }
    let cancelled = false;
    getMyCollections()
      .then((d) => !cancelled && setDecks(d))
      .catch(() => !cancelled && setDecks([]));
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !decks || decks.length === 0) return null;

  // bare: just the card grid — the Index's "Vos decks" section provides its
  // own hue banner (Dan, 2026-07-05: the library lives in the Index).
  const grid = (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((d, i) => {
          const hue = i % 6;
          return (
            <Link
              key={d.id}
              href={`/decks/${d.id}`}
              data-hue={hue}
              className={`fluo-card fluo-h-${hue} hover:scale-[1.01] transition`}
            >
              <h3 className="text-lg font-black text-slate-900">{d.title}</h3>
              {d.subtitle && (
                <p className="text-sm text-slate-600">{d.subtitle}</p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {d.unit != null && d.lessonNo != null && (
                  <span className="fluo-chip" style={{ background: "var(--fluo-primary-soft)", color: "#2f6c00" }}>
                    U{d.unit} · L{d.lessonNo}
                  </span>
                )}
                <span className="fluo-chip">{d.items.length} items</span>
                {d.tags.slice(0, 2).map((t) => (
                  <span key={t} className="fluo-chip">{t.startsWith("sio:") ? `↔ ${t.slice(4)}` : t}</span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
  );

  if (bare) return grid;
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-3xl" aria-hidden>✨</span>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Your decks</h2>
          <p className="text-sm text-slate-600">Decks you authored — public, unlisted, and private.</p>
        </div>
        <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {decks.length} deck{decks.length === 1 ? "" : "s"}
        </span>
      </div>
      {grid}
    </section>
  );
}
