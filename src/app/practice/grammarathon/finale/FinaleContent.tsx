"use client";
/**
 * 🏁 GramMarathon FINALE — the all-topic revision paper (students' request,
 * 2026-07-20; design locked with Dan that night; presentation reworked
 * 2026-07-21 on Dan's ruling: ONE question at a time, the blank flowing
 * inline within the sentence).
 *
 *  · OPEN REVISION: a fresh 100-question paper every day.
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
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { FINALE_BANK, FINALE_SIOS, type FinaleItem } from "@/content/finale";
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { gradeAnswer } from "@/lib/practice/cloze";
import { loadProgress, recordItemResult } from "@/lib/progress";

const DAILY_N = 100;

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
      if (st.due <= now || st.intervalDays <= 1) bad += 1;
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
  for (const sio of FINALE_SIOS) {
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

const normA = (s: string) => (s || "").toLowerCase().replace(/[’']/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();
const normD = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[’']/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();

type Verdict = { ok: boolean; others: string[]; expected: string[] };

export default function FinaleContent() {
  const [ids, setIds] = useState<string[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const graded = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Every visit is a FRESH weakness-weighted draw (Dan, 2026-07-21: the
  // cached daily paper felt dead — and a reload loses typing anyway, so a
  // frozen draw protected nothing). Seed = clock + entropy.
  useEffect(() => { setIds(drawDaily(Date.now() + ":" + Math.random())); }, []);

  const paper = useMemo(() => {
    if (!ids) return null;
    const byId = new Map(FINALE_BANK.map((q) => [q.id, q]));
    return ids.map((id) => byId.get(id)!).filter(Boolean);
  }, [ids]);

  // Focus the blank whenever the question changes.
  useEffect(() => { inputRef.current?.focus(); }, [idx, paper]);

  const done = paper ? paper.filter((q) => verdicts[q.id]).length : 0;
  const okCount = paper ? paper.filter((q) => verdicts[q.id]?.ok).length : 0;
  const finished = paper !== null && idx >= paper.length;

  function grade(q: FinaleItem) {
    const given = (typed[q.id] ?? "").trim();
    const dd = q.strict ? normA : normD;
    const ok = given !== "" && (q.strict
      ? q.a.some((a) => normA(a) === normA(given))
      : q.a.some((a) => gradeAnswer(given, a) !== "wrong"));
    const forms: string[] = [];
    for (const x of q.a) if (!forms.some((f) => dd(f) === dd(x))) forms.push(x);
    setVerdicts((v) => ({ ...v, [q.id]: { ok, others: forms.filter((f) => dd(f) !== dd(given)), expected: forms } }));
    if (!graded.current.has(q.id)) {
      graded.current.add(q.id);
      recordItemResult(q.id, ok, given);
    }
  }

  function onEnter(q: FinaleItem) {
    if (!verdicts[q.id]) grade(q);
    else setIdx((i) => i + 1); // second Enter: onward
  }

  function hint(q: FinaleItem) {
    setHints((h) => ({ ...h, [q.id]: true }));
    void import("@/lib/firebase/usage")
      .then((m) => m.logEvent("hint.tap", { surface: "finale", itemId: q.id, sio: q.sio }))
      .catch(() => {});
  }

  if (!paper) {
    return <p className="px-1 py-6 text-sm text-slate-500">Préparation de votre marathon du jour…</p>;
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="text-5xl">🏁</div>
        <h2 lang="fr" className="mt-2 text-xl font-bold text-slate-900">Marathon terminé !</h2>
        <p lang="fr" className="mt-2 text-slate-700">
          Score : <b className="text-emerald-700">{okCount}</b> / {paper.length}
        </p>
        <p lang="fr" className="mt-1 text-sm text-slate-500">Chaque marathon est un nouveau tirage, pondéré sur vos points faibles.</p>
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" onClick={() => setIdx(0)}
            className="rounded-full border-2 border-slate-900 bg-white px-4 py-1.5 text-sm font-bold text-slate-900">
            ↺ Revoir mes réponses
          </button>
          <button type="button"
            onClick={() => {
              graded.current = new Set();
              setTyped({}); setVerdicts({}); setHints({}); setIdx(0);
              setIds(drawDaily(Date.now() + ":" + Math.random()));
            }}
            className="rounded-full border-2 border-slate-900 bg-yellow-100 px-4 py-1.5 text-sm font-bold text-slate-900 shadow-[2px_2px_0_#1f2440]">
            🎲 Un autre marathon !
          </button>
        </div>
      </div>
    );
  }

  const q = paper[idx];
  const v = verdicts[q.id];

  return (
    <div className="pb-8">
      {/* progress */}
      <div className="flex items-center justify-between text-sm font-bold text-slate-900">
        <span>🏁 Question {idx + 1} / {paper.length}</span>
        <span className="text-emerald-700">✓ {okCount}{done > okCount ? <span className="ml-2 text-rose-600">✗ {done - okCount}</span> : null}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-slate-900 transition-all" style={{ width: `${(done / paper.length) * 100}%` }} />
      </div>

      {/* the one question */}
      <div className={`mt-4 rounded-2xl border-[3px] p-4 shadow-[3px_3px_0_#1f2440] ${v ? (v.ok ? "border-emerald-500 bg-emerald-50/70" : "border-rose-400 bg-rose-50/70") : "border-slate-900 bg-white"}`}>
        <div className="text-xs font-bold text-slate-400">{q.sio}</div>
        {/* Inline flow: pre, blank, post are all inline so the blank sits in
            the sentence line and wraps WITH the text, never onto its own. */}
        <p lang="fr" className="mt-2 text-lg leading-9 text-slate-900">
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
              borderBottom: "2.5px solid #1f2440",
              borderRadius: 0,
              background: "rgba(254,240,138,0.7)",
              padding: "0 4px",
              fontSize: "17px",
              fontFamily: "inherit",
              color: "inherit",
            }}
          />
          {q.post}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <button type="button" onClick={() => hint(q)} className="rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800">💡 indice</button>
          {!v && <button type="button" onClick={() => grade(q)} className="rounded-full border-2 border-slate-300 bg-white px-3 py-0.5 text-xs font-bold text-slate-700">✓ vérifier</button>}
          {hints[q.id] && <span className="text-xs font-bold text-amber-800">💡 {q.cat}</span>}
        </div>
        {v && (
          <div className="mt-2 text-[15px]">
            {v.ok
              ? <span className="font-bold text-emerald-700">✓ Bravo !{v.others.length > 0 && <span className="font-normal text-slate-600"> (aussi accepté : {v.others.join(", ")})</span>}</span>
              : (
                /* The WHY (Dan, 2026-07-21: "when it is wrong the student
                   deserves to know why") — three always-true teachers: the
                   corrected sentence whole, the word's category, the lesson
                   it belongs to. */
                <div>
                  <span className="font-bold text-rose-600">✗ Réponse : {v.expected[0]}{v.expected.length > 1 ? ` (ou ${v.expected.slice(1).join(", ")})` : ""}</span>
                  <p lang="fr" className="mt-1.5 rounded-lg border border-rose-200 bg-white/70 px-2.5 py-1.5 text-slate-800">
                    {q.pre}<b className="text-rose-700 underline underline-offset-2">{v.expected[0]}</b>{q.post}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    💡 {q.cat} · <span lang="fr">{SIOS.find((x) => x.id === q.sio)?.topic ?? q.sio}</span>
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* navigation */}
      <div className="mt-4 flex items-center justify-between">
        <button type="button" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))}
          className="rounded-full border-2 border-slate-300 bg-white px-4 py-1.5 text-sm font-bold text-slate-600 disabled:opacity-40">
          ← Précédente
        </button>
        <button type="button" onClick={() => (v ? setIdx((i) => i + 1) : grade(q))}
          className="rounded-full border-2 border-slate-900 bg-yellow-100 px-5 py-1.5 text-sm font-bold text-slate-900 shadow-[2px_2px_0_#1f2440]">
          {v ? "Suivante →" : "✓ Vérifier"}
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">Entrée = vérifier, puis Entrée = question suivante</p>
    </div>
  );
}
