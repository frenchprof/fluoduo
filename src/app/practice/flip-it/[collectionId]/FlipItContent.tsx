"use client";

/**
 * 4MÉMOIRE — the flashcard drill, in DrillShell (patch 20–21).
 *
 * THE THREE VIEWS ARE BACK (Dan, 2026-08-28: "The original 4Mémoire consists
 * of 3 views: cards one by one, cards all at once, and cards in a list. ALL
 * OF THAT HAS BEEN LOST!"). He was right, and the history says so: patch
 * 20-21 (b83d1ec, 10 Aug) rewrote a 1,380-line three-view page into a
 * one-card drill. It preserved the one-card flow and MOVED the table to
 * /decks/:id — but it dropped the all-at-once grid without saying so, and
 * left this header still naming all three, which is how the loss stayed
 * invisible for eighteen days. The list was not lost but might as well have
 * been: its only door was a link in the end-of-run recap, so a learner had to
 * finish every card to reach it.
 *
 * A view switch chooses between them again:
 *   🂠 One    the drill — one card in the shell, which keeps progress, the
 *            CTA row and the Enter/Space binding, and the 📖/✍️ modes.
 *   ▤ All    the grid, restored from b83d1ec^ — every card at once, tap one
 *            to flip it or flip them all, each with its own ✓/↺ mark.
 *   ▦ List   CuratedDeckTable, the same component /decks/:id renders, so the
 *            two surfaces cannot drift.
 *
 * The grid comes back WITHOUT the old grouping: that keyed on the table's
 * sort control, which does not exist in the drill, and inventing one here
 * would be rebuilding a different thing. The grid is study-only — ✍️ Me
 * tester already tests card by card, and the original's inline grid test
 * duplicated it.
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
import { cap, offer, type SessionLength } from "@/lib/sessionLength";
import HowManyQuestions from "@/components/HowManyQuestions";
import PillSwitch from "@/components/PillSwitch";
import Link from "next/link";
import { CURATED } from "@/content/collections";
import { speak } from "@/games/letris/speech";
import type { Collection } from "@/lib/collections/schema";
import { practiceItems } from "@/lib/collections/display";
import { loadBuckets, setBucket, type Bucket } from "@/lib/practice/buckets";
import { logEvent } from "@/lib/firebase/usage";
import { hintsFor } from "@/lib/help/hints";
import { useHelpLadder } from "@/lib/help/useHelpLadder";
import DrillShell, { drillExitHref } from "@/components/DrillShell";
import CuratedDeckTable from "@/app/decks/[id]/CuratedDeckTable";
import WordBank from "@/components/WordBank";
import {
  ART_LABEL,
  FrenchAnswer,
  NatForms,
  ReviewToggle,
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
  // Deliberate: the saved buckets live in localStorage, which cannot be read
  // during render (the site is statically exported) — this effect has to
  // seed them.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setBuckets(loadBuckets(collection.id)); }, [collection.id]);

  /** Which of the three original views is on screen. */
  const [view, setView] = useState<"one" | "all" | "list">("one");
  // How long the CARD RUN is (Dan, 2026-08-25). The cap lands on the card
  // run only: "all" (the grid) and "list" (the table) are reference views
  // over the whole deck, and hiding cards from a table the learner is reading
  // would be a different thing entirely from shortening a drill.
  const [chosen, setChosen] = useState<SessionLength | null>(null);
  const [asked, setAsked] = useState(offer(rows.length) === null);
  const [test, setTest] = useState(false);
  const [i, setI] = useState(0);
  // The grid's flip state: flipAll inverts, so a learner can reveal the deck
  // and then hide individual cards back.
  const [flipAll, setFlipAll] = useState(false);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());
  const [flipped, setFlipped] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("idle");
  // This run's marks — the recap. Deck-wide reviewed state lives in buckets.
  const [run, setRun] = useState({ su: 0, revoir: 0, right: 0, wrong: 0 });

  // The cards this run actually serves. `rows` stays whole for the grid, the
  // table, and the deck-wide ✓ counter.
  const runRows = useMemo(() => cap(rows, chosen), [rows, chosen]);
  const done = i >= runRows.length;
  const row = runRows[Math.min(i, runRows.length - 1)];
  const isLast = i === runRows.length - 1;
  const parts = useMemo(() => partsFor(row, isNat, hasArt), [row, isNat, hasArt]);
  const allRight = parts.every((p) => judgePart(p, vals[p.key]));
  const nReviewed = rows.filter((r) => buckets[r.item.id] === "reviewed").length;
  // Track D: a wrong check that is NOT final — a hint opened, type again.
  const [retry, setRetry] = useState(false);

  // The help ladder — test mode only (study self-marks). Flashcard rules:
  // the answer may be opened cold (that is what a flashcard is for), a
  // reveal is not retyped, and no idle timer.
  const hints = useMemo(
    () => hintsFor("flashcard", {
      answer: row.fr, alternates: row.item.alt, article: row.art,
      gender: row.item.gender, pos: row.item.pos, example: row.item.nat ? undefined : row.item.example,
    }),
    [row],
  );
  const ladder = useHelpLadder({
    kind: "flashcard",
    itemKey: `${row.item.id}:${test ? "t" : "s"}`,
    itemId: row.item.id,
    surface: "flip-it",
    hints,
    reveal: row.full,
    enabled: test && !done,
  });

  function advance() {
    ladder.skip();
    setFlipped(false); setVals({}); setPhase("idle"); setRetry(false);
    setI((x) => x + 1);
  }
  function markAndNext(b: Bucket) {
    setBuckets(setBucket(collection.id, row.item.id, b));
    setRun((s) => (b === "reviewed" ? { ...s, su: s.su + 1 } : { ...s, revoir: s.revoir + 1 }));
    advance();
  }
  function check() {
    const first = ladder.ladder.wrongTries === 0 && !ladder.revealed;
    // Recorded through the ladder (assistance = the rungs actually shown);
    // the older flashcard.review event stays for the dashboards.
    const r = ladder.attempt(allRight, {
      given: parts.map((p) => vals[p.key] ?? "").join(" ").trim(),
      activity: `flip-it:${collection.id}`,
    });
    void logEvent("flashcard.review", { itemId: row.item.id, rating: allRight ? "good" : "again" });
    if (allRight && !ladder.revealed) setBuckets(setBucket(collection.id, row.item.id, "reviewed"));
    if (first) setRun((s) => (allRight ? { ...s, right: s.right + 1 } : { ...s, wrong: s.wrong + 1 }));
    if (r.effect === "done") setPhase("checked");
    else if (r.effect === "reveal") setPhase("revealed");
    else setRetry(true);
  }
  // The ? control: the answer opened by the ladder's last rung (the older
  // 💡 Révéler) shows the card graded-as-revealed.
  const help = ladder.help
    ? { ...ladder.help, onClimb: () => { if (ladder.climb().effect === "reveal") { setRetry(false); setPhase("revealed"); } } }
    : null;
  function restart() {
    // A replay asks again — someone who did ten may want twenty-five next.
    setChosen(null);
    setAsked(offer(rows.length) === null);
    setI(0); setFlipped(false); setVals({}); setPhase("idle"); setRetry(false);
    setRun({ su: 0, revoir: 0, right: 0, wrong: 0 });
  }
  function switchMode(t: boolean) {
    setTest(t); setFlipped(false); setVals({}); setPhase("idle"); setRetry(false);
  }

  // Nothing typed yet → Vérifier stays down. The article select is not
  // required here: ∅ is a real answer and an untouched select grades as one
  // more thing to get right, exactly like the table.
  const nothingTyped = parts.filter((p) => p.type === "text").every((p) => !(vals[p.key] ?? "").trim());

  // HOW LONG? — asked once, before any card. 4Mémoire is page-only, so the
  // drill frame always wraps it.
  if (!asked) {
    return (
      <DrillShell
        activity="flip"
        deck={collection.id}
        exitHref={drillExitHref(collection.id)}
        progress={null}
        cta={null}
      >
        <HowManyQuestions
          lengths={offer(rows.length)!}
          total={rows.length}
          onPick={(n) => { setChosen(n); setAsked(true); }}
        />
      </DrillShell>
    );
  }

  return (
    <DrillShell
      activity="flip"
      deck={collection.id}
      exitHref={drillExitHref(collection.id)}
      progress={view !== "one" || done ? null : { done: i, total: runRows.length }}
      right={<>✓ {nReviewed}/{rows.length}</>}
      cta={
        view !== "one"
          ? null
          : done
          ? { label: "🃏 Again", onClick: restart }
          : test
            ? phase === "idle" && !retry
              ? { label: "Check", onClick: check, disabled: nothingTyped }
              : null
            : flipped
              ? { label: "✓ I know it", onClick: () => markAndNext("reviewed") }
              /* NO « Flip » BUTTON (Dan, 2026-09-02: "there is a redundant
                 button called FLIP which is not working and which we don't
                 even need"). The card IS the button — this activity is named
                 for the gesture — so a second control that did the same thing
                 sat under it saying so. A null cta is the shell's own
                 documented case: "body owns flow". What it needed first was
                 for the card to be a REAL button; see StudyCard. */
              : null
      }
      secondary={
        view !== "one" || done ? null
          : test
            ? null
            : flipped ? { label: "↺ To review", onClick: () => markAndNext("toReview") } : null
      }
      help={view === "one" && !done && test ? help : null}
      feedback={
        view !== "one" ? null
          : !done && test && retry && phase === "idle"
          ? { kind: "wrong", body: "Not yet", cta: { label: "Try again", onClick: () => setRetry(false) } }
          : !done && test && phase !== "idle"
          ? {
              kind: phase === "checked" && allRight ? "correct" : "wrong",
              body: row.item.nat ? undefined : (
                <>
                  {phase === "checked" && allRight ? "Correct !" : "The answer:"}{" "}
                  <span lang="fr" className="font-extrabold">{row.full}</span>
                </>
              ),
              why: row.item.example && !row.item.nat ? (
                <p lang="fr"><span className="font-bold">{row.item.example}</span>{row.item.exampleEn && <span className="ml-2 opacity-70">— {row.item.exampleEn}</span>}</p>
              ) : undefined,
              cta: { label: isLast ? "🏁 Recap" : "Continue", onClick: advance },
            }
          : null
      }
    >
      {/* The three views, named. Colour never carries the choice alone —
          the active one is filled and marked aria-pressed. */}
      <div className="mb-4 flex items-center justify-center gap-1.5">
        {([["one", "🂠", "One"], ["all", "▤", "All"], ["list", "▦", "List"]] as const).map(([k, icon, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={view === k}
            onClick={() => setView(k)}
            className={`cahier-btn cahier-btn-sm font-black ${view === k ? "cahier-btn-primary" : ""}`}
          >
            <span aria-hidden>{icon}</span> {label}
          </button>
        ))}
      </div>

      {view === "list" && <CuratedDeckTable collection={collection} />}

      {view === "all" && (
        <>
          <div className="mb-3 flex justify-center">
            <button type="button" onClick={() => { setFlipAll((f) => !f); setFlippedIds(new Set()); }}
              className="cahier-btn cahier-btn-sm">
              {flipAll ? "🙈 Hide all" : "👁️ Reveal all"}
            </button>
          </div>
          <AllCards rows={rows} hasArt={hasArt} buckets={buckets}
            onBucket={(id, b) => setBuckets(setBucket(collection.id, id, b))}
            flipAll={flipAll} flippedIds={flippedIds}
            onFlipOne={(id) => setFlippedIds((prev) => {
              const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n;
            })} />
        </>
      )}

      {view === "one" && !done && (
        <>
          {/* THE SAME SWITCH THE DECK PAGE HAS (Dan, 2026-09-01: "the
              study-test switch should be redone like the 2D 3D switch"). This
              was the second one — `cahier-modeswitch`, a bare knob with the
              word « Study » printed beside it, which names neither the state
              nor the property: a knob sitting left next to "Study" does not
              say whether you are about to study or have been. The emoji goes
              inside the track and the caption goes away, which costs a learner
              nothing and is the litmus test's whole test. */}
          <div className="mb-4 flex items-center justify-center">
            <PillSwitch
              label="Card mode"
              title={test ? "Test — type the name" : "Study — flip the card"}
              offLabel="📖"
              onLabel="✍️"
              offSpoken="Study"
              onSpoken="Test"
              offHue="win"
              onHue="streak"
              on={test}
              onFlip={switchMode}
            />
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
              🔊 Listen
            </button>
          </div>
        </>
      )}
      {view === "one" && done && (
        <Recap test={test} run={run} nReviewed={nReviewed} total={rows.length} deckId={collection.id} />
      )}
    </DrillShell>
  );
}

/* ─────────────────────────── all at once ─────────────────────────── */

/**
 * The grid deleted on 10 Aug, restored from b83d1ec^ — every card at once.
 *
 * Kept from the original: the 3:2 card, tapping one to flip it, the per-card
 * ✓/↺ toggle writing the same buckets store the list and the drill read.
 * `flipAll` INVERTS rather than sets, so "Reveal all" then tapping one card
 * hides that card again — the original behaviour, and the reason it is not
 * simply a boolean per card.
 *
 * Dropped deliberately: the grouping (it keyed on the table's sort control,
 * which the drill does not have) and the inline test fields (✍️ Me tester
 * already does that, card by card, with the help ladder).
 */
function AllCards({
  rows, hasArt, buckets, onBucket, flipAll, flippedIds, onFlipOne,
}: {
  rows: Row[];
  hasArt: boolean;
  buckets: Record<string, Bucket>;
  onBucket: (id: string, b: Bucket) => void;
  flipAll: boolean;
  flippedIds: Set<string>;
  onFlipOne: (id: string) => void;
}) {
  const showBack = (id: string) => (flipAll ? !flippedIds.has(id) : flippedIds.has(id));
  // Denser than the original's grid-cols-1 / sm:grid-cols-2. The point of this
  // view is seeing the deck AT ONCE, and one 3:2 card per row on a phone is
  // just the one-card view with extra scrolling.
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.item.id}
          className="relative flex aspect-[3/2] flex-col overflow-hidden rounded-xl border-2 bg-white p-2"
          style={{ borderColor: "color-mix(in oklab, var(--cahier-ink) 15%, transparent)" }}
        >
          <div className="mb-1 flex items-center justify-between gap-1">
            <span className="shrink-0 text-2xl" aria-hidden>{row.item.emoji}</span>
            <ReviewToggle value={buckets[row.item.id]} onChange={(b) => onBucket(row.item.id, b)} />
          </div>
          <button
            type="button"
            onClick={() => onFlipOne(row.item.id)}
            aria-label={showBack(row.item.id) ? `Hide ${row.item.en}` : `Reveal ${row.item.en}`}
            className="flex flex-1 flex-col items-center justify-center p-1 text-center transition hover:brightness-95"
          >
            {showBack(row.item.id) ? (
              row.item.nat
                ? <NatForms nat={row.item.nat} size="sm" />
                : <FrenchAnswer row={row} hasArt={hasArt} />
            ) : (
              <span className="cahier-display text-sm font-bold text-[color:var(--cahier-ink)]">{row.item.en}</span>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── study ─────────────────────────── */

/**
 * THE CARD IS THE BUTTON. It was a `<div role="button">` with an onClick and
 * no tabIndex and no key handler — which is not a button: a keyboard could
 * not reach it and could not fire it, and the only reason nobody noticed is
 * that a « Flip » CTA in the footer did the same job and the shell binds
 * Enter to that. Dan had that CTA removed on 2026-09-02 as redundant, which
 * makes this the ONLY way to turn a card over — so it becomes a real
 * `<button>` and gets focus, Enter, Space and a screen-reader role for free.
 *
 * The label says which way it will go, because a card mid-run is on one face
 * or the other and "Flip card" cannot tell you which.
 */
function StudyCard({ row, hasArt, flipped, onFlip }: { row: Row; hasArt: boolean; flipped: boolean; onFlip: () => void }) {
  return (
    <button type="button" className="mx-auto block w-full max-w-sm cursor-pointer select-none" style={{ perspective: "1200px" }}
      onClick={onFlip} aria-label={flipped ? "Turn the card back" : "Turn the card over"}>
      <div className="relative h-64" style={{ transformStyle: "preserve-3d", transition: "transform .5s", transform: flipped ? "rotateY(180deg)" : "none" }}>
        <Face>
          {/* Quiet ↻ cue, front only. The card is the control — this chip
              does not capture clicks (Variant B). No bounce loop; reduced
              motion already sees a static mark. */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-2 top-2 grid h-7 w-7 place-items-center text-[14px] leading-none"
            style={{
              borderRadius: 8,
              background: "var(--cahier-paper-raised)",
              border: "1.5px solid var(--cahier-ink)",
              boxShadow: "0 1.5px 0 0 var(--cahier-ink)",
              color: "var(--cahier-ink)",
            }}
          >
            ↻
          </span>
          <span className="text-7xl" aria-hidden>{row.item.emoji}</span>
          <span className="cahier-display mt-3 text-2xl font-black text-[color:var(--cahier-ink)]">
            {row.item.en}
            {row.item.note ? <span className="ml-1 text-base font-medium text-[color:var(--cahier-ink-soft)]">{row.item.note}</span> : null}
          </span>
        </Face>
        <Face back><FrenchAnswer row={row} hasArt={hasArt} /></Face>
      </div>
    </button>
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
                {phase === "checked" && <span lang="fr" className={`font-semibold ${ok ? "text-[color:var(--drill-ok-ink)]" : "text-[color:var(--cahier-la)] line-through"}`}>{shown.trim() ? shown : "—"}</span>}
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
        <Link href={`/decks/${deckId}`} className="cahier-btn">▦ Whole list</Link>
      </div>
    </div>
  );
}
