"use client";

/**
 * New-deck builder — BOTH-SIDES structured editor (Dan, 27 Jun 2026).
 * Each card authors two clean sides, up to 4 fields each, in natural Tab order
 * (the 4th Tab crosses from the front to the flip side):
 *   Front (EN + image): 🖼️ image · English* · note · hint
 *   Back  (FR + article): article · French* · example · IPA
 * Produces Flip-It-ready items (emoji/en/fr/note + col: tag) and, when ≥2 article
 * columns are used, a letris gameConfig so Classify It works too.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, useAuthUser } from "@/lib/firebase/auth";
import { createCollection } from "@/lib/firebase/collections";
import { logEvent } from "@/lib/firebase/usage";
import { slugify } from "@/lib/importer/parse";
import type { Collection, Item } from "@/lib/collections/schema";

type Card = {
  emoji: string;
  en: string;
  note: string;
  hint: string; // optional 4th front line (synonym / alt) — not saved
  article: string; // "", le, la, l', les
  fr: string;
  example: string;
  ipa: string;
};
const EMPTY_CARD: Card = { emoji: "", en: "", note: "", hint: "", article: "", fr: "", example: "", ipa: "" };

type Draft = {
  title: string;
  subtitle: string;
  unit: string;
  lessonNo: string;
  lessonSlug: string;
  visibility: "private" | "unlisted" | "public";
  cards: Card[];
};
const EMPTY: Draft = {
  title: "",
  subtitle: "",
  unit: "",
  lessonNo: "",
  lessonSlug: "",
  visibility: "private",
  cards: [{ ...EMPTY_CARD }, { ...EMPTY_CARD }, { ...EMPTY_CARD }],
};
const DRAFT_KEY = "fluolingo.deckDraft.bothsides.v1";

const ARTICLES = ["", "le", "la", "l'", "les"] as const;
const COL_FOR: Record<string, { key: string; label: string; prefix: string }> = {
  le: { key: "le", label: "LE", prefix: "Le " },
  la: { key: "la", label: "LA", prefix: "La " },
  "l'": { key: "l_apos", label: "L'", prefix: "L'" },
  les: { key: "les", label: "LES", prefix: "Les " },
  "": { key: "no_article", label: "—", prefix: "" },
};

export default function NewDeckPage() {
  const user = useAuthUser();
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setDraft({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, hydrated]);

  const validCards = draft.cards.filter((c) => c.en.trim() && c.fr.trim());
  const canSave = !!user && draft.title.trim().length > 0 && validCards.length > 0 && !saving;

  function setCard(i: number, patch: Partial<Card>) {
    setDraft((d) => ({ ...d, cards: d.cards.map((c, j) => (j === i ? { ...c, ...patch } : c)) }));
  }
  function addCard() {
    setDraft((d) => ({ ...d, cards: [...d.cards, { ...EMPTY_CARD }] }));
  }
  function removeCard(i: number) {
    setDraft((d) => ({ ...d, cards: d.cards.filter((_, j) => j !== i) }));
  }

  async function onSave() {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      const used = new Set<string>();
      const items: Item[] = validCards.map((c, i) => {
        const base = `${String(i + 1).padStart(2, "0")}-${slugify(c.fr) || "item"}`;
        let id = base;
        let n = 2;
        while (used.has(id)) id = `${base}-${n++}`;
        used.add(id);
        const tags = c.article ? [`col:${COL_FOR[c.article].key}`] : [];
        const item: Item = { id, fr: c.fr.trim(), en: c.en.trim(), tags };
        if (c.emoji.trim()) item.emoji = c.emoji.trim();
        if (c.note.trim()) item.note = c.note.trim();
        if (c.example.trim()) item.example = c.example.trim();
        if (c.ipa.trim()) item.ipa = c.ipa.trim();
        return item;
      });
      // Build a letris column config only if ≥2 distinct articles are used.
      const arts = [...new Set(validCards.map((c) => c.article))];
      const cols = arts.length >= 2 ? arts.map((a) => COL_FOR[a]) : null;

      const unit = draft.unit ? Number(draft.unit) : undefined;
      const lessonNo = draft.lessonNo ? Number(draft.lessonNo) : undefined;
      const payload: Omit<Collection, "id" | "owner"> = {
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim() || undefined,
        langPair: "fr-en",
        visibility: draft.visibility,
        tags: [],
        items,
        ...(unit !== undefined ? { unit } : {}),
        ...(lessonNo !== undefined ? { lessonNo } : {}),
        ...(draft.lessonSlug.trim() ? { lessonSlug: draft.lessonSlug.trim() } : {}),
        ...(cols ? { gameConfig: { letris: { columns: cols } } } : {}),
      };
      const id = await createCollection(payload);
      await logEvent("deck.create", { id, items: items.length });
      localStorage.removeItem(DRAFT_KEY);
      router.push(`/decks/${id}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed.");
      setSaving(false);
    }
  }

  return (
    <main className="fluo-surface min-h-screen">
      <div className="border-b-2 border-[color:var(--fluo-line)] bg-[#fce8d4]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="fluo-serif rounded-full bg-[var(--fluo-card)] px-3 py-1.5 text-sm font-bold text-[color:var(--fluo-ink)] hover:brightness-95">
            ← Home
          </Link>
          <span className="fluo-label">📚 New deck</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="fluo-serif text-3xl font-black text-[color:var(--fluo-ink)]">
          Build a deck — <span className="fluo-hl">both sides</span>
        </h1>
        <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">
          Each card has a front (English + image) and a flip side (French + article).
          Tab moves through the four front lines, then crosses to the flip side.
        </p>

        {!user && <SignInGate resolving={user === undefined} onSignIn={() => signInWithGoogle().catch(() => {})} />}

        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Title" required>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="C'est quel pays ?" />
          </Field>
          <Field label="Subtitle">
            <input value={draft.subtitle} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} placeholder="One-line description" />
          </Field>
        </section>
        <section className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Unit">
            <select value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })}>
              <option value="">—</option>
              {[0, 1, 2, 3, 4].map((u) => <option key={u} value={u}>Unit {u}</option>)}
            </select>
          </Field>
          <Field label="Lesson no.">
            <input type="number" min={1} value={draft.lessonNo} onChange={(e) => setDraft({ ...draft, lessonNo: e.target.value })} />
          </Field>
          <Field label="Lesson slug">
            <input value={draft.lessonSlug} onChange={(e) => setDraft({ ...draft, lessonSlug: e.target.value })} placeholder="countries" />
          </Field>
          <Field label="Visibility">
            <select value={draft.visibility} onChange={(e) => setDraft({ ...draft, visibility: e.target.value as Draft["visibility"] })}>
              <option value="private">🔒 Private</option>
              <option value="unlisted">🔗 Unlisted</option>
              <option value="public">🌍 Public</option>
            </select>
          </Field>
        </section>

        <h2 className="fluo-label mt-8 mb-3">cards ({validCards.length} ready)</h2>
        <ol className="space-y-3">
          {draft.cards.map((c, i) => (
            <CardEditor key={i} index={i} card={c} onChange={(p) => setCard(i, p)} onRemove={() => removeCard(i)} />
          ))}
        </ol>
        <button type="button" onClick={addCard} className="fluo-btn fluo-btn-ghost fluo-btn-sm mt-3">
          ＋ Add card
        </button>

        <section className="mt-8 flex flex-wrap items-center gap-4">
          <button type="button" disabled={!canSave} onClick={onSave} className="fluo-btn fluo-btn-lg">
            {saving ? "Saving…" : "💾 Save deck"}
          </button>
          {!user && <span className="text-sm text-[color:var(--fluo-ink-soft)]">Sign in to save.</span>}
          {user && !draft.title.trim() && <span className="text-sm text-[color:var(--fluo-ink-soft)]">Give the deck a title.</span>}
          {user && draft.title.trim() && validCards.length === 0 && (
            <span className="text-sm text-[color:var(--fluo-ink-soft)]">Add a card with English + French.</span>
          )}
          {saveError && <span className="text-sm font-bold text-rose-600">{saveError}</span>}
        </section>
      </div>
    </main>
  );
}

function CardEditor({
  index,
  card,
  onChange,
  onRemove,
}: {
  index: number;
  card: Card;
  onChange: (p: Partial<Card>) => void;
  onRemove: () => void;
}) {
  const ready = card.en.trim() && card.fr.trim();
  return (
    <li className="rounded-2xl border-2 border-[color:var(--fluo-line)] bg-[var(--fluo-card)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="fluo-label">card {index + 1}{ready ? " ✓" : ""}</span>
        <button type="button" onClick={onRemove} className="text-xs font-bold text-rose-500 hover:underline">
          remove
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* FRONT */}
        <div className="rounded-xl border border-[color:var(--fluo-line)] bg-[#fff8ee] p-2">
          <div className="fluo-label mb-1.5">front · english + image</div>
          <div className="space-y-1.5">
            <input value={card.emoji} onChange={(e) => onChange({ emoji: e.target.value })} placeholder="🖼️ image / flag emoji" />
            <input value={card.en} onChange={(e) => onChange({ en: e.target.value })} placeholder="English *" />
            <input value={card.note} onChange={(e) => onChange({ note: e.target.value })} placeholder="note (e.g. (continent))" />
            <input value={card.hint} onChange={(e) => onChange({ hint: e.target.value })} placeholder="hint (optional)" />
          </div>
        </div>
        {/* BACK */}
        <div className="rounded-xl border border-[color:var(--fluo-line)] bg-[#fff8ee] p-2">
          <div className="fluo-label mb-1.5">flip side · french + article</div>
          <div className="space-y-1.5">
            <select value={card.article} onChange={(e) => onChange({ article: e.target.value })}>
              {ARTICLES.map((a) => <option key={a} value={a}>{a === "" ? "∅ (no article)" : a}</option>)}
            </select>
            <input lang="fr" value={card.fr} onChange={(e) => onChange({ fr: e.target.value })} placeholder="French *" />
            <input lang="fr" value={card.example} onChange={(e) => onChange({ example: e.target.value })} placeholder="example sentence (optional)" />
            <input value={card.ipa} onChange={(e) => onChange({ ipa: e.target.value })} placeholder="IPA (optional)" />
          </div>
        </div>
      </div>
      {/* preview */}
      {ready && (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[color:var(--fluo-ink-soft)]">
          <span>{card.emoji} {card.en}</span>
          <span aria-hidden>↔</span>
          <span lang="fr" className="font-bold text-[color:var(--fluo-ink)]">
            {card.article ? `${card.article}${card.article.endsWith("'") ? "" : " "}` : ""}{card.fr}
          </span>
        </div>
      )}
    </li>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="fluo-label mb-1 block">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function SignInGate({ resolving, onSignIn }: { resolving: boolean; onSignIn: () => void }) {
  return (
    <div className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
      <p className="text-base font-medium text-amber-900">
        {resolving ? "👋 Checking sign-in…" : "👋 Sign in with Google to save. You can still draft below."}
      </p>
      {!resolving && (
        <button type="button" onClick={onSignIn} className="fluo-btn fluo-btn-secondary mt-3">
          Sign in with Google
        </button>
      )}
    </div>
  );
}
