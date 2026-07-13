"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { getCollection } from "@/lib/firebase/collections";
import { displayEn, displayFr } from "@/lib/collections/display";
import { logEvent } from "@/lib/firebase/usage";
import type { Collection } from "@/lib/collections/schema";
import CahierShell, { withActive } from "@/components/CahierShell";
import { deckTabs } from "../DeckContent";

type Dir = "fr-en" | "en-fr";
const DIR_KEY = "fluolingo.studyDir.v1";

function StudyPageInner({ id }: { id: string }) {
  const [collection, setCollection] = useState<Collection | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const curated = CURATED.find((c) => c.id === id);
    if (curated) {
      setCollection(curated);
      return;
    }
    (async () => {
      try {
        const col = await getCollection(id);
        if (!cancelled) setCollection(col);
      } catch {
        if (!cancelled) setCollection(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <CahierShell tabs={withActive(deckTabs(id), "study")} active="study" crumb="🎴 Flashcards">
      <div className="mx-auto max-w-3xl px-4 py-4">
        {collection === undefined && (
          <p className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center text-base text-slate-500">
            Loading…
          </p>
        )}
        {collection === null && <NotFound />}
        {collection && collection.items.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center text-base text-slate-500">
            This deck has no items yet.
          </p>
        )}
        {collection && collection.items.length > 0 && (
          <Runner collection={collection} />
        )}
      </div>
    </CahierShell>
  );
}

function NotFound() {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-10 text-center">
      <div className="text-6xl" aria-hidden>🤷</div>
      <h2 className="mt-3 text-xl font-black text-slate-900">Deck not found</h2>
      <p className="mt-1 text-sm text-slate-600">It may have been deleted, or isn’t shared with you.</p>
      <Link href="/" className="fluo-btn fluo-btn-ghost mt-5 inline-flex">← Home</Link>
    </div>
  );
}

function Runner({ collection }: { collection: Collection }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [dir, setDir] = useState<Dir>("fr-en");

  useEffect(() => {
    try {
      const d = localStorage.getItem(DIR_KEY);
      if (d === "fr-en" || d === "en-fr") setDir(d);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(DIR_KEY, dir);
    } catch {}
  }, [dir]);

  const total = collection.items.length;
  const item = collection.items[i];
  const fr = displayFr(item, collection);
  const en = displayEn(item);
  const front = dir === "fr-en" ? fr : en;
  const back = dir === "fr-en" ? en : fr;
  const frontLang = dir === "fr-en" ? "fr" : "en";
  const backLang = dir === "fr-en" ? "en" : "fr";

  function next() {
    setFlipped(false);
    setI((x) => (x + 1) % total);
    if (i + 1 === total) logEvent("deck.open", { id: collection.id, source: "study-complete" });
  }
  function prev() {
    setFlipped(false);
    setI((x) => (x - 1 + total) % total);
  }
  function shuffle() {
    setFlipped(false);
    setI(Math.floor((Date.now() % (total * 9301 + 49297)) % total));
  }

  return (
    <>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">{collection.title}</h1>
          {collection.subtitle && (
            <p className="text-sm text-slate-500">{collection.subtitle}</p>
          )}
        </div>
        <div className="inline-flex overflow-hidden rounded-xl border-2 border-slate-200 bg-white text-xs font-bold">
          {(["fr-en", "en-fr"] as Dir[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDir(d);
                setFlipped(false);
              }}
              className={`px-3 py-1.5 transition ${
                dir === d ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {d === "fr-en" ? "🇫🇷 → EN" : "EN → 🇫🇷"}
            </button>
          ))}
        </div>
      </header>

      <ProgressBar i={i} total={total} />

      <button
        type="button"
        onClick={() => setFlipped((x) => !x)}
        className="fluo-card fluo-h-1 mt-6 flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center gap-3 p-8 text-center transition hover:scale-[1.005]"
        data-hue={1}
      >
        {item.emoji && !flipped && (
          <div className="text-6xl" aria-hidden>{item.emoji}</div>
        )}
        <div
          lang={flipped ? backLang : frontLang}
          className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl"
        >
          {flipped ? back : front}
        </div>
        <div className="mt-4 text-xs font-extrabold uppercase tracking-widest text-slate-400">
          {flipped ? "← tap to hide" : "tap to reveal"}
        </div>
      </button>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={prev} className="fluo-btn fluo-btn-ghost">
          ← Prev
        </button>
        <button type="button" onClick={shuffle} className="fluo-btn fluo-btn-ghost">
          🔀 Shuffle
        </button>
        <button type="button" onClick={next} className="fluo-btn fluo-btn-lg">
          Next →
        </button>
      </div>
    </>
  );
}

function ProgressBar({ i, total }: { i: number; total: number }) {
  const pct = Math.round(((i + 1) / total) * 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
        <span>
          Card {i + 1} / {total}
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: "var(--fluo-primary)" }}
        />
      </div>
    </div>
  );
}

// Sign-in wall (Dan, 2026-07-13: close ALL anonymous gaps — these deck pages
// predate the wall). Gated HERE so every route that renders this content
// (static /decks/[id]/… and query-param /decks/…?id=) is covered at once.
export default function StudyPage({ id }: { id: string }) {
  return (
    <AuthGate what="study the cards">
      <StudyPageInner id={id} />
    </AuthGate>
  );
}
