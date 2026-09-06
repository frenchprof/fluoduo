"use client";

import { TAB_ICONS } from "@/content/activities";
import { useEffect, useState } from "react";
import AuthGate from "@/components/AuthGate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteCollection,
  getCollection,
} from "@/lib/firebase/collections";
import { CURATED } from "@/content/collections";
import { getLetrisSet } from "@/games/letris/sets";
import { useAuthUser } from "@/lib/firebase/auth";
import { logEvent } from "@/lib/firebase/usage";
import { displayEn, displayFr } from "@/lib/collections/display";
import {
  hasLetris,
  hasMatching,
  hasMcq,
  gapfillItems,
} from "@/lib/collections/loadCollections";
import type { Collection, Item } from "@/lib/collections/schema";
import CahierShell, { type ShellTab } from "@/components/CahierShell";
import CuratedDeckTable from "./CuratedDeckTable";

export function deckTabs(id: string): ShellTab[] {
  return [
    { key: "home", ...TAB_ICONS.home, href: "/" },
    { key: "deck", label: "Deck", emoji: "📖", href: `/decks/view?id=${id}` },
    { key: "study", label: "Study", emoji: "🃏", href: `/decks/study?id=${id}` },
    // Auto-MCQ only for user decks — curated decks have authored pretests.
    ...(CURATED.some((c) => c.id === id)
      ? []
      : [{ key: "mcq", label: "MCQ", emoji: "❓", href: `/decks/mcq?id=${id}` } as ShellTab]),
  ];
}

type ViewMode = "cards" | "list";
const VIEW_KEY = "fluolingo.deckView.v2";

type LoadState =
  | { kind: "loading" }
  | { kind: "ok"; collection: Collection; source: "curated" | "firestore" }
  | { kind: "missing" }
  | { kind: "error"; message: string };

function DeckPageInner({ id }: { id: string }) {
  const user = useAuthUser();
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [deleting, setDeleting] = useState(false);

  // Curated decks render the 4Mémoire TABLE here (patch 20–21: the drill
  // route shows one card in DrillShell; the whole-deck table — cover/reveal,
  // notes, grouping, subsets — split out to this page). This replaces the
  // 2026-08-02 redirect to /practice/flip-it, which is now the drill.
  // Firestore (user-created) decks are unaffected.
  const curated = CURATED.find((c) => c.id === id);

  useEffect(() => {
    if (curated) return;
    let cancelled = false;
    (async () => {
      try {
        const col = await getCollection(id);
        if (cancelled) return;
        if (!col) {
          setState({ kind: "missing" });
          return;
        }
        setState({ kind: "ok", collection: col, source: "firestore" });
        logEvent("deck.open", { id, source: "firestore" });
      } catch (e) {
        if (cancelled) return;
        setState({
          kind: "error",
          message: e instanceof Error ? e.message : "Couldn't load deck.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router, curated]);

  async function onDelete() {
    if (state.kind !== "ok") return;
    if (!confirm(`Delete "${state.collection.title}" forever?`)) return;
    setDeleting(true);
    try {
      await deleteCollection(state.collection.id);
      router.push("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed.");
      setDeleting(false);
    }
  }

  if (curated) return <CuratedDeckTable collection={curated} />;

  return (
    <CahierShell
      tabs={deckTabs(id).map((t) => (t.key === "deck" ? { ...t, href: undefined } : t))}
      active="deck"
    >
      <div className="mx-auto max-w-5xl px-4 py-4">
        {state.kind === "loading" && (
          <p className="rounded-2xl border-2 border-dashed border-[color:var(--cahier-line)] bg-[var(--cahier-paper-raised)] p-10 text-center text-base text-[color:var(--cahier-ink-soft)]">
            Loading deck…
          </p>
        )}

        {state.kind === "missing" && <NotFound id={id} />}

        {state.kind === "error" && (
          <div className="rounded-2xl border-2 border-[color:var(--drill-bad)] bg-[var(--drill-bad-bg)] p-6">
            <h2 className="text-lg font-black text-[color:var(--drill-bad-ink)]">Couldn’t load this deck</h2>
            <p className="mt-1 text-sm text-[color:var(--drill-bad-ink)]">{state.message}</p>
          </div>
        )}

        {state.kind === "ok" && (
          <DeckView
            collection={state.collection}
            source={state.source}
            ownedByMe={state.source === "firestore" && !!user && state.collection.owner === user.uid}
            onDelete={onDelete}
            deleting={deleting}
          />
        )}
      </div>
    </CahierShell>
  );
}

/* ──────────────────────────────────────────────────────────── */

function NotFound({ id }: { id: string }) {
  return (
    <div className="rounded-2xl border-2 border-[color:var(--cahier-line)] bg-[var(--cahier-paper-raised)] p-10 text-center">
      <div className="text-6xl" aria-hidden>
        🤷
      </div>
      <h2 className="mt-3 text-xl font-black text-[color:var(--cahier-ink)]">No deck found</h2>
      <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">
        We couldn’t find a deck with id <code className="rounded bg-[var(--cahier-hover)] px-1.5 py-0.5">{id}</code>. It may have been deleted, or it isn’t shared with you.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Link href="/" className="fluo-btn fluo-btn-ghost">
          ← Home
        </Link>
        <Link href="/decks/new" className="fluo-btn">
          ➕ New deck
        </Link>
      </div>
    </div>
  );
}

function DeckView({
  collection,
  source,
  ownedByMe,
  onDelete,
  deleting,
}: {
  collection: Collection;
  source: "curated" | "firestore";
  ownedByMe: boolean;
  onDelete: () => void;
  deleting: boolean;
}) {
  const games = {
    flashcard: collection.items.length > 0,
    mcq: source === "firestore" && hasMcq(collection), // curated decks have authored pretests — the auto-MCQ adds nothing there
    gapfill: gapfillItems(collection).length > 0,
    letris: hasLetris(collection),
    matching: hasMatching(collection),
  };
  const anyGames = Object.values(games).some(Boolean);

  return (
    <>
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
          <span className="rounded-full bg-[var(--cahier-hover)] px-2 py-0.5">
            {source === "curated" ? "🌟 Curated" : "✍️ Your deck"}
          </span>
          {collection.unit != null && collection.lessonNo != null && (
            <span className="rounded-full bg-[var(--tier-good-soft)] px-2 py-0.5 text-[color:var(--tier-good)]">
              Unit {collection.unit} · Lesson {collection.lessonNo}
              {collection.lessonSlug ? ` · ${collection.lessonSlug}` : ""}
            </span>
          )}
          <span className="rounded-full bg-[var(--cahier-hover)] px-2 py-0.5">
            {collection.visibility === "private"
              ? "🔒 private"
              : collection.visibility === "unlisted"
                ? "🔗 unlisted"
                : "🌍 public"}
          </span>
          <span className="rounded-full bg-[var(--cahier-hover)] px-2 py-0.5">
            {collection.items.length} items
          </span>
        </div>
        <h1 className="mt-3 text-4xl font-black leading-tight text-[color:var(--cahier-ink)]">
          {collection.title}
        </h1>
        {collection.subtitle && (
          <p className="mt-1 text-lg text-[color:var(--cahier-ink-soft)]">{collection.subtitle}</p>
        )}
        {collection.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {collection.tags.map((t) => (
              <span key={t} className="fluo-chip">
                {t}
              </span>
            ))}
          </div>
        )}
        {collection.crossRefs && collection.crossRefs.length > 0 && (
          <p className="mt-3 text-sm text-[color:var(--cahier-ink-soft)]">
            Also revisited in{" "}
            {collection.crossRefs.map((r, i) => (
              <span key={`${r.unit}-${r.lessonNo}`}>
                {i > 0 && ", "}
                <span className="font-bold text-[color:var(--cahier-ink)]">
                  Unit {r.unit} · Lesson {r.lessonNo} ({r.lessonSlug})
                </span>
                {r.note ? ` — ${r.note}` : ""}
              </span>
            ))}
          </p>
        )}
      </header>

      {anyGames && (
        <section className="mb-8 flex flex-wrap items-center gap-3">
          {games.flashcard && (
            <Link href={`/decks/study?id=${collection.id}`} className="fluo-btn fluo-btn-lg">
              🎴 Study cards
            </Link>
          )}
          {games.mcq && (
            <Link
              href={`/decks/mcq?id=${collection.id}`}
              className="fluo-btn fluo-btn-secondary"
            >
              🎯 MCQ
            </Link>
          )}
          {/* Buttons exist only where a real runner exists — no alert() stubs. */}
          {games.letris && getLetrisSet(collection.id.replace("-letris", "")) && (
            <Link
              href={`/games/vocabularain/${collection.id.replace("-letris", "")}`}
              className="fluo-btn fluo-btn-secondary"
            >
              🌧️ Vocabularain
            </Link>
          )}
          {games.matching && (
            <Link href={`/games/matching/${collection.id}`} className="fluo-btn fluo-btn-secondary">
              🔗 Matching
            </Link>
          )}
          {ownedByMe && (
            <>
              <Link href="/decks/new" className="fluo-btn fluo-btn-ghost">
                ✏️ Edit
              </Link>
              <button
                type="button"
                className="fluo-btn fluo-btn-danger"
                disabled={deleting}
                onClick={onDelete}
              >
                {deleting ? "Deleting…" : "🗑 Delete"}
              </button>
            </>
          )}
        </section>
      )}

      <ItemsSection collection={collection} />
    </>
  );
}

function ItemsSection({ collection }: { collection: Collection }) {
  const [mode, setMode] = useState<ViewMode>("cards");
  useEffect(() => {
    try {
      const m = localStorage.getItem(VIEW_KEY);
      // Deliberate: the saved view mode lives in localStorage, which cannot
      // be read during render (the site is statically exported) — this mount
      // effect has to seed it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (m === "cards" || m === "list") setMode(m);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, mode);
    } catch {}
  }, [mode]);
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-[color:var(--cahier-ink)]">All items ✨</h2>
        <div className="inline-flex overflow-hidden rounded-xl border-2 border-[color:var(--cahier-line)] bg-[var(--cahier-paper-raised)] text-sm font-bold">
          {(["cards", "list"] as ViewMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 transition ${
                mode === m ? "bg-[var(--cahier-ink)] text-[color:var(--cahier-paper)]" : "text-[color:var(--cahier-ink-soft)] hover:text-[color:var(--cahier-ink)]"
              }`}
            >
              {m === "cards" ? "🎴 Cards" : "📜 List"}
            </button>
          ))}
        </div>
      </div>
      {mode === "cards" ? (
        <ItemGrid items={collection.items} collection={collection} />
      ) : (
        <ItemList items={collection.items} collection={collection} />
      )}
    </section>
  );
}

function ItemGrid({ items, collection }: { items: Item[]; collection: Collection }) {
  if (items.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[color:var(--cahier-line)] bg-[var(--cahier-paper-raised)] p-10 text-center text-base text-[color:var(--cahier-ink-soft)]">
        No items in this deck yet.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => {
        const hue = i % 6;
        const fr = displayFr(it, collection);
        const userTags = it.tags.filter((t) => !t.startsWith("col:") && !t.startsWith("role:"));
        return (
          <article key={it.id} data-hue={hue} className={`fluo-card fluo-h-${hue}`}>
            <div lang="fr" className="text-3xl font-black leading-tight text-[color:var(--cahier-ink)]">
              {it.emoji && <span className="mr-2" aria-hidden>{it.emoji}</span>}
              {fr}
            </div>
            <div className="text-base text-[color:var(--cahier-ink-soft)]">{displayEn(it)}</div>
            {userTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {userTags.map((t) => (
                  <span key={t} className="fluo-chip fluo-chip-accent">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

type Col = "fr" | "en" | "tags";

function ItemList({ items, collection }: { items: Item[]; collection: Collection }) {
  const [hidden, setHidden] = useState<Record<Col, boolean>>({ fr: false, en: false, tags: false });
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  if (items.length === 0) {
    return (
      <p className="rounded-2xl border-2 border-dashed border-[color:var(--cahier-line)] bg-[var(--cahier-paper-raised)] p-10 text-center text-base text-[color:var(--cahier-ink-soft)]">
        No items in this deck yet.
      </p>
    );
  }

  function toggleCol(c: Col) {
    setHidden((h) => ({ ...h, [c]: !h[c] }));
    setRevealed({}); // hiding/showing a column resets per-cell reveals to keep state honest
  }
  function revealCell(key: string) {
    setRevealed((r) => ({ ...r, [key]: true }));
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-[color:var(--cahier-line)] bg-[var(--cahier-paper-raised)]">
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-[color:var(--cahier-rule)] bg-[var(--cahier-paper)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[color:var(--cahier-ink-soft)]">
        <span>Hide column:</span>
        {(["fr", "en", "tags"] as Col[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => toggleCol(c)}
            className={`rounded-full border-2 px-3 py-0.5 transition ${
              hidden[c]
                ? "border-[color:var(--drill-bad)] bg-[var(--drill-bad-bg)] text-[color:var(--drill-bad-ink)]"
                : "border-[color:var(--cahier-line)] bg-[var(--cahier-paper-raised)] text-[color:var(--cahier-ink)] hover:border-[color:var(--cahier-line-strong)]"
            }`}
            title={hidden[c] ? `Show ${c} column` : `Hide ${c} column`}
          >
            {hidden[c] ? "🙈 " : ""}
            {c.toUpperCase()}
            {hidden[c] && " (hidden)"}
          </button>
        ))}
        <span className="ml-auto text-[10px] font-medium normal-case text-[color:var(--cahier-ink-soft)]">
          Hidden cells reveal individually on click.
        </span>
      </div>
      <ol>
        {items.map((it, i) => {
          const hue = i % 6;
          const fr = displayFr(it, collection);
          const en = displayEn(it);
          const userTags = it.tags.filter((t) => !t.startsWith("col:") && !t.startsWith("role:"));
          return (
            <li
              key={it.id}
              data-hue={hue}
              className={`fluo-h-${hue} grid items-baseline gap-x-4 gap-y-1 border-b border-[color:var(--cahier-rule)] px-4 py-3 last:border-b-0`}
              style={{
                borderLeft: "6px solid var(--fluo-card-accent)",
                gridTemplateColumns: "32px minmax(120px,1.4fr) minmax(120px,1.4fr) minmax(80px,1fr)",
              }}
            >
              <span className="text-right text-xs font-bold text-[color:var(--cahier-ink-faint)]">
                {i + 1}.
              </span>
              <Cell
                col="fr"
                hidden={hidden.fr}
                revealed={!!revealed[`${it.id}|fr`]}
                onReveal={() => revealCell(`${it.id}|fr`)}
              >
                <span lang="fr" className="text-lg font-bold text-[color:var(--cahier-ink)]">
                  {it.emoji && <span className="mr-1.5" aria-hidden>{it.emoji}</span>}
                  {fr}
                </span>
              </Cell>
              <Cell
                col="en"
                hidden={hidden.en}
                revealed={!!revealed[`${it.id}|en`]}
                onReveal={() => revealCell(`${it.id}|en`)}
              >
                <span className="text-base text-[color:var(--cahier-ink-soft)]">{en}</span>
              </Cell>
              <Cell
                col="tags"
                hidden={hidden.tags}
                revealed={!!revealed[`${it.id}|tags`]}
                onReveal={() => revealCell(`${it.id}|tags`)}
              >
                <span className="flex flex-wrap gap-1">
                  {userTags.slice(0, 4).map((t) => (
                    <span key={t} className="fluo-chip">{t}</span>
                  ))}
                </span>
              </Cell>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Cell({
  col,
  hidden,
  revealed,
  onReveal,
  children,
}: {
  col: Col;
  hidden: boolean;
  revealed: boolean;
  onReveal: () => void;
  children: React.ReactNode;
}) {
  if (!hidden || revealed) return <span className="min-w-0">{children}</span>;
  return (
    <button
      type="button"
      onClick={onReveal}
      title={`Reveal ${col}`}
      className="rounded-md border-2 border-dashed border-[color:var(--cahier-line)] bg-[var(--cahier-paper)] px-3 py-1 text-left text-[color:var(--cahier-ink-faint)] transition hover:border-[color:var(--cahier-line-strong)] hover:bg-[var(--cahier-hover)] hover:text-[color:var(--cahier-ink)]"
    >
      <span className="text-lg font-bold">•••</span>
    </button>
  );
}

// Sign-in wall (Dan, 2026-07-13: close ALL anonymous gaps — these deck pages
// predate the wall). Gated HERE so every route that renders this content
// (static /decks/[id]/… and query-param /decks/…?id=) is covered at once.
export default function DeckPage({ id }: { id: string }) {
  return (
    <AuthGate what="browse this deck">
      <DeckPageInner id={id} />
    </AuthGate>
  );
}
