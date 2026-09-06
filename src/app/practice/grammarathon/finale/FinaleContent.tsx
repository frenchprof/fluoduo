"use client";
/**
 * 🏁 GramMarathon FINALE — the all-topic revision paper (students' request,
 * 2026-07-20; design locked with Dan that night; presentation reworked
 * 2026-07-21 on Dan's ruling: ONE question at a time, the blank flowing
 * inline within the sentence).
 *
 *  · OPEN REVISION: a fresh 50-question paper every visit.
 *  · WEAKNESS-WEIGHTED per student: every SIO contributes at least one
 *    question (the 360° floor); remaining slots draw with extra weight on
 *    SIOs where this learner's own SRS shows due or fragile items.
 *  · The day's draw is cached (localStorage) so the paper stays stable;
 *    tomorrow is a new draw.
 *  · Interaction: type one word · Enter grades and shows the verdict ·
 *    Enter again moves on. 💡 shows the English category label (and logs
 *    hint.tap — the autonomy instrument's help-seeking construct).
 *    Alternates shown on BOTH verdicts; accent-strict items (où) grade with
 *    accents preserved.
 *  · Every answer pays through recordItemResult (ids finale:SIO-xxx:n) —
 *    first grading only — so XP, streak, SRS, DéjàRevu and the teacher
 *    dashboard all see the work.
 *
 * COLOUR (6 Sep 2026). This card was written before the two colour systems
 * existed and was still entirely raw Tailwind — slate-900 for the frame,
 * emerald-500 for a right answer, rose-400 for a wrong one, yellow-100 on
 * Check, and amber-300/50/800 on the hint chip. Not one token among them.
 *
 * Dan caught it the same afternoon he sent the reward banner back for wearing
 * the XP colour, and it was the same fault one card lower: **amber-300 is
 * 0.3° of hue from --dopa-joy**, which is this app's XP colour (the +20 float,
 * the receipt's XP line). The hint button was painted in the colour that means
 * XP.
 *
 * It now answers to docs/COLOR_SYSTEM.md, and which system answers which
 * question matters:
 *
 *   BAND (what you are being asked to do) — the Finale is GramMarathon, so
 *   `band-prod` sits on the root and everything structural reads var(--band)
 *   and var(--band-wash) from it: the frame, the progress fill, the two card
 *   chips, the clue rungs. The band's own rule — "the border and the icon,
 *   its 12% wash is the fill, and the label stays page ink".
 *
 *   FAMILY (where you are) — Practice yellow, on the primary key and on the
 *   blank in the sentence, which were already yellow by accident.
 *
 *   DOPA ROLES (what a thing MEANS) — win for a right answer, miss for a
 *   wrong one. Those are meanings, not places, so they take neither system.
 *
 * The measured trap: page ink on the band's wash is 9.61:1, but --cahier-ink-soft
 * on that same wash is **3.85:1**. The soft ink is fine on paper (4.72:1) and
 * fails on the wash, so the clue rungs and the chips take full page ink while
 * the quiet lines on paper keep the soft one.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { FINALE_BANK, FINALE_SIOS, type FinaleItem } from "@/content/finale";
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { deaccent, gradeAgainst, normalize } from "@/lib/practice/cloze";
import { isWeakSrs, loadProgress, recordItemResult } from "@/lib/progress";
import { buildLadder, shownRungs } from "@/lib/help/hints";
import { buildEvidence } from "@/lib/evidence";

const DAILY_N = 50; // Dan, 2026-07-22: 50, not 100

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

function sioWeakness(): Record<string, number> {
  const p = loadProgress();
  const now = Date.now();
  const w: Record<string, number> = {};
  for (const sio of FINALE_SIOS) {
    const s = SIOS.find((x) => x.id === sio);
    const c = s ? CURATED.find((x) => x.id === s.collectionId) : undefined;
    const ids: string[] = [
      ...(c ? (c.items.map((it: { id?: string }) => it.id).filter(Boolean) as string[]) : []),
      ...FINALE_BANK.filter((q) => q.sio === sio).map((q) => q.id),
    ];
    let bad = 0, tracked = 0;
    for (const id of ids) {
      const st = p.itemSrs[id];
      if (!st) continue;
      tracked += 1;
      if (st.due <= now || isWeakSrs(st)) bad += 1;
    }
    w[sio] = 1 + 4 * (tracked > 0 ? bad / tracked : 0.5);
  }
  return w;
}

function drawDaily(seedKey: string | number): string[] {
  const rnd = mulberry32(hash(String(seedKey)));
  const bySio = new Map<string, FinaleItem[]>();
  for (const q of FINALE_BANK) {
    if (!bySio.has(q.sio)) bySio.set(q.sio, []);
    bySio.get(q.sio)!.push(q);
  }
  const chosen = new Set<string>();
  // With DAILY_N below the SIO count, the 360-degree floor takes a seeded
  // shuffle of the SIOs and floors as many as fit — a different SIO sits
  // out each draw, none is ever systematically skipped.
  const floorSios = [...FINALE_SIOS];
  for (let i = floorSios.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [floorSios[i], floorSios[j]] = [floorSios[j], floorSios[i]];
  }
  for (const sio of floorSios.slice(0, Math.min(DAILY_N, floorSios.length))) {
    const pool = bySio.get(sio)!;
    chosen.add(pool[Math.floor(rnd() * pool.length)].id);
  }
  const w = sioWeakness();
  const remaining = FINALE_BANK.filter((q) => !chosen.has(q.id));
  const weights = remaining.map((q) => w[q.sio] ?? 1);
  while (chosen.size < Math.min(DAILY_N, FINALE_BANK.length) && remaining.length > 0) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rnd() * total;
    let k = 0;
    while (k < remaining.length - 1 && (r -= weights[k]) > 0) k++;
    chosen.add(remaining[k].id);
    remaining.splice(k, 1);
    weights.splice(k, 1);
  }
  const ids = [...chosen];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

// normA/normD died in the grading unification (2026-08-11): the Finale was
// the one paper grading itself two ways — a strict item was accent- AND
// punctuation-sensitive, a normal item neither. Both paths now run THE
// grader (cloze.ts); strictness is exactly the accents option, nothing else
// (où vs ou stays the tested knowledge; a trailing period is noise on
// strict items too, as everywhere).

type Verdict = { ok: boolean; others: string[]; expected: string[] };

/** One tag for both write paths below (they used to disagree). Resolves to
 *  `delayed` — the finale draws SRS-scheduled, weakness-weighted items. */
const FINALE_ACTIVITY = "/practice/grammarathon/finale";

export default function FinaleContent() {
  const [ids, setIds] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  // Socratic ladder (Dan, 2026-07-21: never reveal the answer — keep giving
  // clues, none of which gives it away, until the student produces it).
  const [clue, setClue] = useState<Record<string, number>>({});
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const graded = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Every visit is a FRESH weakness-weighted draw (Dan, 2026-07-21: the
  // cached daily paper felt dead — and a reload loses typing anyway, so a
  // frozen draw protected nothing). Seed = clock + entropy.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
  useEffect(() => { setIds(drawDaily(Date.now() + ":" + Math.random())); }, []);

  const paper = useMemo(() => {
    if (!ids) return null;
    const byId = new Map(FINALE_BANK.map((q) => [q.id, q]));
    return ids.map((id) => byId.get(id)!).filter(Boolean);
  }, [ids]);

  // Focus the blank whenever the question changes.
  useEffect(() => { inputRef.current?.focus(); }, [idx, paper]);

  const okCount = paper ? paper.filter((q) => verdicts[q.id]?.ok).length : 0;
  const skipCount = paper ? paper.filter((q) => skipped[q.id] && !verdicts[q.id]?.ok).length : 0;
  const done = okCount + skipCount;
  const finished = paper !== null && idx >= paper.length;

  function grade(q: FinaleItem) {
    const given = (typed[q.id] ?? "").trim();
    const opts = q.strict ? ({ accents: "strict" } as const) : undefined;
    const ok = given !== "" && gradeAgainst(given, q.a, opts) !== "wrong";
    // De-duplicate the "other accepted forms" list with the same transform
    // that grades them (accent-collapsed unless the item is accent-strict).
    const dd = (s: string) => (q.strict ? normalize(s) : deaccent(normalize(s)));
    const forms: string[] = [];
    for (const x of q.a) if (!forms.some((f) => dd(f) === dd(x))) forms.push(x);
    // First ATTEMPT is what pays and feeds the SRS — honest measurement;
    // later retries resolve the item for learning, not for XP.
    // The FIRST attempt is the independent measurement and the only one that
    // pays — unchanged. What is new is that it now carries how much help had
    // been taken before it, so "right, cold" and "right, after four clues" stop
    // looking identical in the evidence store (PRD §7).
    const hintsTaken = clue[q.id] ?? 0;
    if (!graded.current.has(q.id)) {
      graded.current.add(q.id);
      // The tag was `undefined` here while the post-assistance branch below
      // passed the full path — so the FIRST attempt, the independent
      // measurement that pays, stored no evidence type, and only the weaker
      // resolved-with-help record was typed `delayed`. Exactly backwards
      // (audit 2026-08-30). Both branches now pass the same string.
      recordItemResult(q.id, ok, given, FINALE_ACTIVITY, { hintsTaken });
    } else if (ok) {
      // Resolved AFTER assistance. The first attempt already stands as the
      // independent measurement, so this pays nothing and does not touch the
      // SRS — but PRD §7 is explicit that assistance changes evidentiary
      // strength without making the learning event disappear. Recording it is
      // how "got there with a scaffold" becomes visible at all.
      const revealed = hintsTaken >= ladderFor(q).length;
      void import("@/lib/firebase/responses")
        .then((m) =>
          m.recordResponse(q.id, true, {
            given,
            xpPaid: 0,
            evidence: buildEvidence(q.id, FINALE_ACTIVITY, {
              hintsTaken,
              revealed,
            }),
          }),
        )
        .catch(() => {});
    }
    if (ok) {
      setVerdicts((v) => ({ ...v, [q.id]: { ok, others: forms.filter((f) => dd(f) !== dd(given)), expected: forms } }));
    } else {
      // No reveal. One more rung on the clue ladder, and try again.
      setClue((c) => ({ ...c, [q.id]: Math.min(ladderFor(q).length, (c[q.id] ?? 0) + 1) }));
      setWrongFlash(q.id);
      window.setTimeout(() => setWrongFlash(null), 450);
    }
  }

  function onEnter(q: FinaleItem) {
    if (!verdicts[q.id]?.ok) grade(q); // every Enter is another attempt
    else setIdx((i) => i + 1); // solved: onward
  }

  function hint(q: FinaleItem) {
    const rungs = ladderFor(q);
    const next = Math.min(rungs.length, (clue[q.id] ?? 0) + 1);
    setClue((c) => ({ ...c, [q.id]: next }));
    // hint.tap is the help-seeking construct behind PRD §6 Goal 2's "declining
    // reliance on hints and scaffolds over time". The answer rung gets its own
    // event so reveals can be counted separately from clues.
    const rung = rungs[next - 1]?.level ?? "nudge";
    void import("@/lib/firebase/usage")
      .then((m) =>
        m.logEvent(rung === "answer" ? "answer.reveal" : "hint.tap", {
          surface: "finale",
          itemId: q.id,
          sio: q.sio,
          rung,
          level: next,
        }),
      )
      .catch(() => {});
  }
  /** The shared ladder (src/lib/help/ladder.ts): nudge → guiding question →
   *  scaffold → partial reveal → ANSWER. The fifth rung is new (Dan,
   *  2026-08-09: Finale is practice, so the answer must be reachable —
   *  PRD §8). Reaching it is recorded, not prevented. */
  function ladderFor(q: FinaleItem) {
    return buildLadder({
      answer: q.a[0] ?? "",
      topic: SIOS.find((x) => x.id === q.sio)?.topic ?? q.sio,
      category: q.cat,
    });
  }
  function clues(q: FinaleItem, level: number): string[] {
    return shownRungs(ladderFor(q), level).map((r) => r.text);
  }

  if (!paper) {
    return <p className="px-1 py-6 text-sm text-[color:var(--cahier-ink-soft)]">Preparing today&rsquo;s marathon…</p>;
  }

  if (finished) {
    return (
      <div className="band-prod mx-auto max-w-md py-10 text-center">
        <div className="text-5xl">🏁</div>
        <h2 className="mt-2 text-xl font-bold text-[color:var(--cahier-ink)]">Marathon complete!</h2>
        <p lang="fr" className="mt-2 text-[color:var(--cahier-ink)]">
          {/* A right answer MEANS a win, which is a dopa role, not a place —
              so the score keeps the win ink and not the band. */}
          Score: <b className="text-[color:var(--dopa-win-ink)]">{okCount}</b> / {paper.length}
        </p>
        <p className="mt-1 text-sm text-[color:var(--cahier-ink-soft)]">Every marathon is a fresh draw, weighted to your weak spots.</p>
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={() => setIdx(0)}
            className="rounded-full border-2 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] px-4 py-1.5 text-sm font-bold text-[color:var(--cahier-ink)]">
            ↺ Review my answers
          </button>
          <button type="button"
            onClick={() => {
              graded.current = new Set();
              setTyped({}); setVerdicts({}); setClue({}); setSkipped({}); setIdx(0);
              setIds(drawDaily(Date.now() + ":" + Math.random()));
            }}
            className="rounded-full border-2 border-[color:var(--cahier-ink)] bg-[color:var(--fam-practice-wash)] px-4 py-1.5 text-sm font-bold text-[color:var(--cahier-ink)] shadow-[2px_2px_0_var(--cahier-ink)]">
            🎲 Another marathon!
          </button>
        </div>
      </div>
    );
  }

  const q = paper[idx];
  const v = verdicts[q.id];

  return (
    // `band-prod` is what makes var(--band) / var(--band-wash) resolve below.
    // Remove it and every band-coloured edge on this card silently falls back
    // to nothing — it is not decoration on the wrapper, it is the source.
    <div className="band-prod pb-8">
      {/* progress */}
      <div className="flex items-center justify-between text-sm font-bold text-[color:var(--cahier-ink)]">
        <span>🏁 Question {idx + 1} / {paper.length}</span>
        <span className="text-[color:var(--dopa-win-ink)]">✓ {okCount}{skipCount > 0 ? <span className="ml-2 text-[color:var(--cahier-ink-soft)]">↷ {skipCount}</span> : null}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[color:var(--cahier-line)]">
        {/* The travelled part of the paper is a MARK, so it is the band at
            full strength — the rule's "strong colour outlines and marks". */}
        <div className="h-full bg-[color:var(--band)] transition-all" style={{ width: `${(done / paper.length) * 100}%` }} />
      </div>

      {/* the one question */}
      {/* The frame states WHAT the card asks (the band) until a verdict lands,
          at which point it states what HAPPENED (a dopa role). Both verdict
          fills carry page ink at 9.4–10.5:1. */}
      <div className={`mt-4 rounded-2xl border-[3px] p-4 shadow-[3px_3px_0_var(--cahier-ink)] ${v?.ok ? "border-[color:var(--dopa-win-ink)] bg-[color:var(--dopa-win-wash)]" : wrongFlash === q.id ? "border-[color:var(--dopa-miss-ink)] bg-[color:var(--dopa-miss-wash)]" : "border-[color:var(--band)] bg-[color:var(--cahier-paper-raised)]"}`}>
        <div className="flex items-center justify-between text-xs font-bold text-[color:var(--cahier-ink-soft)]">
          <span>{q.sio}</span>
          {/* Every question states the contract (Dan, 2026-07-21): ONE word. */}
          <span lang="fr" className="rounded-full bg-[color:var(--band-wash)] px-2 py-0.5 text-[color:var(--cahier-ink)]">✍️ un seul mot</span>
        </div>
        {/* Inline flow: pre, blank, post are all inline so the blank sits in
            the sentence line and wraps WITH the text, never onto its own. */}
        <p lang="fr" className="mt-2 text-lg leading-9 text-[color:var(--cahier-ink)]">
          {q.pre}
          <input
            ref={inputRef}
            value={typed[q.id] ?? ""}
            onChange={(e) => setTyped((t) => ({ ...t, [q.id]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(q); } }}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
            className="mx-1 text-center outline-none"
            /* Inline styles on purpose: the cahier sheet declares every input
               width:100% with a compound selector that beats any utility
               class — only the style attribute outranks it (Dan, 2026-07-21:
               the blank must sit IN the sentence line, sized like a word). */
            style={{
              display: "inline-block",
              width: `${Math.min(18, Math.max(5, (q.a[0] ?? "").length + 2))}ch`,
              maxWidth: "55vw",
              verticalAlign: "baseline",
              border: "none",
              // The blank was already yellow, by accident (`rgba(254,240,138,.7)`
              // — Tailwind yellow-200 at 70%). It is the Practice family's
              // wash now, which is the same yellow on purpose. Page ink on it
              // is 9.84:1.
              borderBottom: "2.5px solid var(--cahier-ink)",
              borderRadius: 0,
              background: "var(--fam-practice-wash)",
              padding: "0 4px",
              fontSize: "calc(1.0625rem + var(--fs-step) * 1.06)",
              fontFamily: "inherit",
              color: "inherit",
            }}
          />
          {q.post}
        </p>
        {/* THE TWO CHIPS, and why they now match each other. They used to be
            an amber one and a grey one, which implied a hierarchy that does
            not exist — they are two equal-weight secondary actions on the same
            card, and the loud one was loud only because it had borrowed the XP
            colour. Under the two systems, colour encodes WHERE you are and
            WHAT the activity asks; it does not encode "this one is a hint and
            that one grades". The icons do that, which is what icons are for. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {!v?.ok && <button type="button" onClick={() => hint(q)} className="rounded-full border-2 border-[color:var(--band)] bg-[color:var(--band-wash)] px-3 py-0.5 text-xs font-bold text-[color:var(--cahier-ink)]">💡 a hint</button>}
          {!v?.ok && <button type="button" onClick={() => grade(q)} className="rounded-full border-2 border-[color:var(--band)] bg-[color:var(--band-wash)] px-3 py-0.5 text-xs font-bold text-[color:var(--cahier-ink)]">✓ check</button>}
        </div>
        {(clue[q.id] ?? 0) > 0 && !v?.ok && (
          // PAGE INK, not the soft ink. On the band's wash the soft ink is
          // 3.85:1 — it looks like the right choice for a quiet line and
          // fails. Full ink on that wash is 9.61:1.
          <ul lang="fr" className="mt-2 space-y-1 text-sm text-[color:var(--cahier-ink)]">
            {clues(q, clue[q.id] ?? 0).map((c, i) => (
              <li key={i} className="rounded-lg bg-[color:var(--band-wash)] px-2.5 py-1">{c}</li>
            ))}
          </ul>
        )}
        {(clue[q.id] ?? 0) > 0 && !v?.ok && (
          // This one IS on paper, where the soft ink is 4.72:1 and passes.
          <p className="mt-1.5 text-xs text-[color:var(--cahier-ink-soft)]">Try again — the answer is never revealed: it&rsquo;s yours to find!</p>
        )}
        {v?.ok && (
          <div className="mt-2 text-[15px]">
            <span className="font-bold text-[color:var(--dopa-win-ink)]">✓ Bravo !{v.others.length > 0 && <span className="font-normal text-[color:var(--cahier-ink)]"> (also accepted: {v.others.join(", ")})</span>}</span>
          </div>
        )}
      </div>

      {/* navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button type="button" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="rounded-full border-2 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] px-4 py-1.5 text-sm font-bold text-[color:var(--cahier-ink-soft)] disabled:opacity-40">
          ← Previous
        </button>
        <div className="flex items-center gap-2">
          {!v?.ok && (clue[q.id] ?? 0) >= 2 && (
            <button type="button"
              onClick={() => { setSkipped((k) => ({ ...k, [q.id]: true })); setIdx((i) => i + 1); }}
              className="rounded-full border-2 border-[color:var(--cahier-line-strong)] bg-[color:var(--cahier-paper-raised)] px-4 py-1.5 text-sm font-bold text-[color:var(--cahier-ink-soft)]"
              title="The answer stays secret — this question will come back another day!">
              Skip →
            </button>
          )}
          {/* The primary key keeps the FAMILY, not the band: it is the one
              control that says where you are rather than what this question
              asks. It was `bg-yellow-100`, which is Practice yellow by
              accident; --fam-practice-wash is the same yellow on purpose. */}
          <button type="button" onClick={() => (v?.ok ? setIdx((i) => i + 1) : grade(q))}
            className="rounded-full border-2 border-[color:var(--cahier-ink)] bg-[color:var(--fam-practice-wash)] px-5 py-1.5 text-sm font-bold text-[color:var(--cahier-ink)] shadow-[2px_2px_0_var(--cahier-ink)]">
            {v?.ok ? "Next →" : "✓ Check"}
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-[color:var(--cahier-ink-soft)]">Enter = check, then Enter = next question</p>
    </div>
  );
}
