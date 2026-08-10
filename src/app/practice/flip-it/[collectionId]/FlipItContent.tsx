"use client";

/**
 * 4MÉMOIRE — the flashcard drill, in DrillShell (patch 20–21).
 *
 * This file used to be a 1,380-line three-view page (table / one card / all
 * cards) in its own CahierFrame. The card flow is now a drill like every
 * other: one card in the shell, the shell owns progress, the CTA row and the
 * Enter/Space binding. The table (browse, cover/reveal, notes, grouping,
 * subsets) split out to /decks/:id — see CuratedDeckTable.tsx.
 *
 * Two modes, one card at a time:
 *   📖 Étudier — front (emoji + English), CTA Retourner flips; the flipped
 *      footer self-marks: ✓ Je le sais (reviewed) / ↺ À revoir. Buckets are
 *      the same store the table reads.
 *   ✍️ Me tester — type the French (article select + noun, or the 4
 *      nationality forms). The shell's Vérifier commits; the tray gives the
 *      verdict; graded exactly like the table (shared judgePart). Correct
 *      answers auto-mark reviewed and feed SRS/evidence as before
 *      (recordItemResult + flashcard.review). 💡 Révéler shows the answer
 *      without grading and logs answer.reveal, like GramMarathon's ladder.
 *
 * Below sm the noun answers by word-bank tiles (same WordBank as iComplete /
 * GramMarathon / ConjugaZone): the answer's words plus distractors drawn
 * from the deck's other French entries. The nationality deck keeps its four
 * typed inputs — four word-banks would fill the screen.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { speak } from "@/games/letris/speech";
import type { Collection } from "@/lib/collections/schema";
import { practiceItems } from "@/lib/collections/display";
import { loadBuckets, setBucket, type Bucket } from "@/lib/practice/buckets";
import { recordItemResult } from "@/lib/progress";
import { logEvent } from "@/lib/firebase/usage";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import WordBank from "@/components/WordBank";
import {
  ART_LABEL,
  FrenchAnswer,
  articleOptionsOf,
  judgePart,
  partsFor,
  rowsOf,
  sayText,
  type Part,
  type Row,
} from "../shared";

type Phase = "idle" | "checked" | "revealed";

export default function FlipItPage({ collectionId }: { collectionId: string }) {
  const collection = CURATED.find((c) => c.id === collectionId);
  // EVERY item is flippable — emoji is decoration on the card face, not an
  // entry requirement. (An old emoji?.trim() filter here silently emptied
  // whole decks — matieres, the ateliers, alphabet… — which is why "No
  // flippable vocab" kept coming back no matter how the links were fixed.)
  const items = collection ? practiceItems(collection) : [];

  if (!collection || items.length === 0) {
    return (
      <main className="cahier-sheet relative min-h-screen">
        <div className="cahier-binding" aria-hidden />
        <div className="mx-auto max-w-3xl px-4 py-10 pl-16 text-center text-[color:var(--cahier-ink-soft)]">
          No flippable vocab in <code>{collectionId}</code>.{" "}
          <Link href="/" className="font-bold text-[color:var(--cahier-ink)] underline">Home</Link>
        </div>
      </main>
    );
  }
  return <FlipDrill collection={collection} items={items} />;
}

function FlipDrill({ collection, items }: { collection: Collection; items: ReturnType<typeof practiceItems> }) {
  const isNat = items.some((i) => i.nat);
  const rows = useMemo<Row[]>(() => rowsOf(collection, items), [collection, items]);
  const articleOptions = useMemo(() => articleOptionsOf(rows), [rows]);
  const hasArt = articleOptions.some((a) => a !== "");

  const [buckets, setBuckets] = useState<Record<string, Bucket>>({});
  useEffect(() => { setBuckets(loadBuckets(collection.id)); }, [collection.id]);

  const [test, setTest] = useState(false);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("idle");
  // This run's marks — the recap. Deck-wide reviewed state lives in buckets.
  const [run, setRun] = useState({ su: 0, revoir: 0, right: 0, wrong: 0 });

  const done = i >= rows.length;
  const row = rows[Math.min(i, rows.length - 1)];
  const isLast = i === rows.length - 1;
  const parts = useMemo(() => partsFor(row, isNat, hasArt), [row, isNat, hasArt]);
  const allRight = parts.every((p) => judgePart(p, vals[p.key]));
  const nReviewed = rows.filter((r) => buckets[r.item.id] === "reviewed").length;

  function advance() {
    setFlipped(false); setVals({}); setPhase("idle");
    setI((x) => x + 1);
  }
  function markAndNext(b: Bucket) {
    setBuckets(setBucket(collection.id, row.item.id, b));
    setRun((s) => (b === "reviewed" ? { ...s, su: s.su + 1 } : { ...s, revoir: s.revoir + 1 }));
    advance();
  }
  function check() {
    setPhase("checked");
    recordItemResult(row.item.id, allRight);
    void logEvent("flashcard.review", { itemId: row.item.id, rating: allRight ? "good" : "again" });
    if (allRight) setBuckets(setBucket(collection.id, row.item.id, "reviewed"));
    setRun((s) => (allRight ? { ...s, right: s.right + 1 } : { ...s, wrong: s.wrong + 1 }));
  }
  function reveal() {
    setPhase("revealed");
    void logEvent("answer.reveal", { surface: "flip-it", itemId: row.item.id, deck: collection.id });
  }
  function restart() {
    setI(0); setFlipped(false); setVals({}); setPhase("idle");
    setRun({ su: 0, revoir: 0, right: 0, wrong: 0 });
  }
  function switchMode(t: boolean) {
    setTest(t); setFlipped(false); setVals({}); setPhase("idle");
  }

  // Nothing typed yet → Vérifier stays down. The article select is not
  // required here: ∅ is a real answer and an untouched select grades as one
  // more thing to get right, exactly like the table.
  const nothingTyped = parts.filter((p) => p.type === "text").every((p) => !(vals[p.key] ?? "").trim());

  return (
    <DrillShell
      exitHref={drillExitHref(collection.id)}
      progress={done ? null : { done: i, total: rows.length }}
      right={<>✓ {nReviewed}/{rows.length}</>}
      cta={
        done
          ? { label: "🃏 Encore", onClick: restart }
          : test
            ? phase === "idle"
              ? { label: "Vérifier", onClick: check, disabled: nothingTyped }
              : null
            : flipped
              ? { label: "✓ Je le sais", onClick: () => markAndNext("reviewed") }
              : { label: "Retourner", onClick: () => setFlipped(true) }
      }
      secondary={
        done ? null
          : test
            ? phase === "idle" ? { label: "💡 Révéler", onClick: reveal } : null
            : flipped ? { label: "↺ À revoir", onClick: () => markAndNext("toReview") } : null
      }
      feedback={
        !done && test && phase !== "idle"
          ? {
              kind: phase === "checked" && allRight ? "correct" : "wrong",
              body: row.item.nat ? undefined : (
                <>
                  {phase === "checked" && allRight ? "Correct !" : "La bonne réponse :"}{" "}
                  <span lang="fr" className="font-extrabold">{row.full}</span>
                </>
              ),
              cta: { label: isLast ? "🏁 Bilan" : "Continuer", onClick: advance },
            }
          : null
      }
    >
      {!done && (
        <>
          <div className="mb-4 flex items-center justify-center gap-1.5">
            <button type="button" role="switch" aria-checked={test}
              onClick={() => switchMode(!test)}
              title={test ? "Test (type the name)" : "Study (flip the card)"}
              data-on={test} className="cahier-modeswitch">
              <span className="cahier-modeswitch-knob">{test ? "✍️" : "📖"}</span>
            </button>
            <span className="cahier-display text-sm font-bold text-[color:var(--cahier-ink)]">
              {test ? "Test" : "Study"}
            </span>
          </div>
          {test ? (
            <TestCard key={row.item.id} row={row} parts={parts} phase={phase}
              vals={vals} setVals={setVals}
              articleOptions={articleOptions}
              bankPool={rows.filter((r) => r.item.id !== row.item.id).map((r) => r.fr)} />
          ) : (
            <StudyCard row={row} hasArt={hasArt} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />
          )}
          <div className="mt-5 flex justify-center">
            <button type="button" onClick={() => speak(sayText(row), "fr-FR")} className="cahier-btn cahier-btn-sm">
              🔊 Écouter
            </button>
          </div>
        </>
      )}
      {done && (
        <Recap test={test} run={run} nReviewed={nReviewed} total={rows.length} deckId={collection.id} />
      )}
    </DrillShell>
  );
}

/* ─────────────────────────── study ─────────────────────────── */

function StudyCard({ row, hasArt, flipped, onFlip }: { row: Row; hasArt: boolean; flipped: boolean; onFlip: () => void }) {
  return (
    <div className="mx-auto w-full max-w-sm cursor-pointer select-none" style={{ perspective: "1200px" }}
      onClick={onFlip} role="button" aria-label="Flip card">
      <div className="relative h-64" style={{ transformStyle: "preserve-3d", transition: "transform .5s", transform: flipped ? "rotateY(180deg)" : "none" }}>
        <Face>
          <span className="text-7xl" aria-hidden>{row.item.emoji}</span>
          <span className="cahier-display mt-3 text-2xl font-black text-[color:var(--cahier-ink)]">
            {row.item.en}
            {row.item.note ? <span className="ml-1 text-base font-medium text-[color:var(--cahier-ink-soft)]">{row.item.note}</span> : null}
          </span>
        </Face>
        <Face back><FrenchAnswer row={row} hasArt={hasArt} /></Face>
      </div>
    </div>
  );
}

function Face({ children, back }: { children: React.ReactNode; back?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-[color:var(--cahier-ink)]/20 bg-white p-6 text-center shadow-sm"
      style={{ backfaceVisibility: "hidden", transform: back ? "rotateY(180deg)" : undefined }}>
      {children}
    </div>
  );
}

/* ─────────────────────────── test ─────────────────────────── */

function TestCard({
  row, parts, phase, vals, setVals, articleOptions, bankPool,
}: {
  row: Row; parts: Part[]; phase: Phase;
  vals: Record<string, string>; setVals: (v: Record<string, string>) => void;
  articleOptions: string[]; bankPool: string[];
}) {
  const multi = parts.length > 2; // nationality forms keep their labels
  const graded = phase !== "idle";
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-5 flex flex-col items-center gap-2 text-center">
        <span className="text-6xl" aria-hidden>{row.item.emoji}</span>
        <span className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          {row.item.en}
          {row.item.note ? <span className="ml-1 text-base font-medium text-[color:var(--cahier-ink-soft)]">{row.item.note}</span> : null}
        </span>
      </div>
      <div className={multi ? "flex flex-col gap-2.5" : "flex flex-col gap-2"}>
        {parts.map((p, idx) => {
          const mine = vals[p.key] ?? "";
          if (graded) {
            const ok = judgePart(p, vals[p.key]);
            // An untouched select is NO answer ("—"), not ∅ — ∅ is a real
            // article the learner must pick on purpose (screenshots caught
            // ART_LABEL[""] painting "∅" struck-through for empty selects).
            const shown =
              p.type === "article"
                ? vals[p.key] === undefined || mine === "__unset__" ? "" : (ART_LABEL[mine] ?? mine)
                : mine;
            return (
              <div key={p.key} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                {p.label && <span className="text-xs text-[color:var(--cahier-ink-soft)]">{p.label}</span>}
                {phase === "checked" && <span lang="fr" className={`font-semibold ${ok ? "text-emerald-700" : "text-[color:var(--cahier-la)] line-through"}`}>{shown.trim() ? shown : "—"}</span>}
                {(!ok || phase === "revealed") && <span lang="fr" className="cahier-display font-bold"><span className="cahier-hl">{p.type === "article" ? (ART_LABEL[p.correct] ?? p.correct) : p.correct}</span></span>}
                {phase === "checked" && <span>{ok ? "✓" : "✗"}</span>}
              </div>
            );
          }
          if (p.type === "article") {
            return (
              <label key={p.key} className="flex items-center gap-2">
                <span className="text-xs text-[color:var(--cahier-ink-soft)]">{p.label}</span>
                <select aria-label="article" value={vals[p.key] ?? "__unset__"}
                  onChange={(e) => setVals({ ...vals, [p.key]: e.target.value })} className="!w-24">
                  <option value="__unset__" disabled>-</option>
                  {articleOptions.map((a) => <option key={a} value={a}>{ART_LABEL[a] ?? a}</option>)}
                </select>
              </label>
            );
          }
          // The noun: typed above sm, word-bank tiles below it. Nationality
          // decks (4 short forms) stay typed — four banks would fill the
          // screen and the forms differ by a few letters anyway.
          return (
            <div key={p.key}>
              <label className="flex items-center gap-2">
                {p.label && <span className="text-xs text-[color:var(--cahier-ink-soft)]">{p.label}</span>}
                <input lang="fr" autoFocus={idx === parts.findIndex((q) => q.type === "text")}
                  value={mine}
                  onChange={(e) => setVals({ ...vals, [p.key]: e.target.value })}
                  placeholder="…"
                  className={`cahier-answer ${multi ? "min-w-0 flex-1" : "hidden w-full sm:block"}`} />
              </label>
              {!multi && (
                <div className="sm:hidden">
                  <WordBank answer={p.correct} pool={bankPool} value={mine}
                    onChange={(v) => setVals({ ...vals, [p.key]: v })} disabled={graded} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── recap ─────────────────────────── */

function Recap({ test, run, nReviewed, total, deckId }: {
  test: boolean; run: { su: number; revoir: number; right: number; wrong: number };
  nReviewed: number; total: number; deckId: string;
}) {
  const good = test ? run.right : run.su;
  const pct = total > 0 ? Math.round((nReviewed / total) * 100) : 0;
  return (
    <div className="text-center">
      <div className="text-6xl" aria-hidden>
        {pct === 100 ? "🏆" : good > 0 ? "🎉" : "🃏"}
      </div>
      <h2 className="mt-2 text-2xl font-black text-[color:var(--cahier-ink)]">
        {test ? <>✓ {run.right} · ✗ {run.wrong}</> : <>✓ {run.su} · ↺ {run.revoir}</>}
      </h2>
      <p className="mt-1 text-[color:var(--cahier-ink-soft)]">✓ {nReviewed}/{total}</p>
      <div className="mt-5 flex justify-center">
        <Link href={`/decks/${deckId}`} className="cahier-btn">▦ Toute la liste</Link>
      </div>
    </div>
  );
}
