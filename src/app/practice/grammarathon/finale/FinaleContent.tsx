"use client";
/**
 * 🏁 GramMarathon FINALE — the all-topic revision paper (students' request,
 * 2026-07-20; design locked with Dan that night):
 *
 *  · OPEN REVISION, not assessment: a fresh 100-question paper every day.
 *  · WEAKNESS-WEIGHTED per student: every SIO contributes at least one
 *    question (the 360° floor); the remaining slots are drawn with extra
 *    weight on SIOs where this learner's own SRS shows due or fragile
 *    (short-interval) items — different student, different hundred, no
 *    server involved.
 *  · The day's draw is cached (localStorage) so the paper stays stable while
 *    being worked; tomorrow is a new draw.
 *  · Interaction = the pattern Dan validated in the trial paper: type one
 *    word, Enter grades and advances; 💡 shows the English category label
 *    (and logs hint.tap — the autonomy instrument's help-seeking construct);
 *    alternates are shown on BOTH verdicts; accent-strict items (où) grade
 *    with accents preserved.
 *  · Every answer pays through recordItemResult (ids finale:SIO-xxx:n), so
 *    XP, streak, SRS, DéjàRevu and the teacher dashboard all see the work.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { FINALE_BANK, FINALE_SIOS, type FinaleItem } from "@/content/finale";
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { gradeAnswer } from "@/lib/practice/cloze";
import { loadProgress, recordItemResult } from "@/lib/progress";

const DAILY_N = 100;

// Deterministic PRNG so one day's draw is reproducible before it is cached.
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

/** Per-SIO weakness from the learner's own SRS: due-now or short-interval
 *  items add weight; SIOs with no tracked items count as half-weak. */
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

/** Today's paper: one per SIO as floor, weakness-weighted extras, seeded mix. */
function drawDaily(dateKey: string): string[] {
  const rnd = mulberry32(hash(dateKey));
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

// Accent-PRESERVING normalizer for strict items (où must not equal ou).
const normA = (s: string) => (s || "").toLowerCase().replace(/[’']/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();
// Display-dedupe normalizer (accent variants collapse into one shown form).
const normD = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[’']/g, "").replace(/-/g, " ").replace(/\s+/g, " ").trim();

type Verdict = { ok: boolean; others: string[]; expected: string[] } | null;

export default function FinaleContent() {
  const [ids, setIds] = useState<string[] | null>(null);
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [hints, setHints] = useState<Record<string, boolean>>({});
  const graded = useRef<Set<string>>(new Set());

  useEffect(() => {
    const dateKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `fluo:finale:${dateKey}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setIds(JSON.parse(cached)); return; }
    } catch { /* fall through to a fresh draw */ }
    const draw = drawDaily(dateKey);
    try { localStorage.setItem(cacheKey, JSON.stringify(draw)); } catch { /* fine */ }
    setIds(draw);
  }, []);

  const paper = useMemo(() => {
    if (!ids) return null;
    const byId = new Map(FINALE_BANK.map((q) => [q.id, q]));
    return ids.map((id) => byId.get(id)!).filter(Boolean);
  }, [ids]);

  function grade(q: FinaleItem, advance: boolean) {
    const given = (typed[q.id] ?? "").trim();
    const dd = q.strict ? normA : normD;
    const ok = given !== "" && (q.strict
      ? q.a.some((a) => normA(a) === normA(given))
      : q.a.some((a) => gradeAnswer(given, a) !== "wrong"));
    const forms: string[] = [];
    for (const x of q.a) if (!forms.some((f) => dd(f) === dd(x))) forms.push(x);
    setVerdicts((v) => ({ ...v, [q.id]: { ok, others: forms.filter((f) => dd(f) !== dd(given)), expected: forms } }));
    // First grading of an item pays and feeds the SRS; regrades don't double-pay.
    if (!graded.current.has(q.id)) {
      graded.current.add(q.id);
      recordItemResult(q.id, ok, given);
    }
    if (advance && paper) {
      const i = paper.findIndex((x) => x.id === q.id);
      const next = paper[i + 1];
      if (next) {
        const el = document.getElementById(`fin-${next.id}`);
        el?.focus();
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      } else {
        (document.activeElement as HTMLElement | null)?.blur();
      }
    }
  }

  function hint(q: FinaleItem) {
    setHints((h) => ({ ...h, [q.id]: true }));
    // Autonomy instrument (help-seeking calibration): the graduated 💡.
    void import("@/lib/firebase/usage")
      .then((m) => m.logEvent("hint.tap", { surface: "finale", itemId: q.id, sio: q.sio }))
      .catch(() => {});
  }

  const done = paper ? paper.filter((q) => verdicts[q.id]).length : 0;
  const okCount = paper ? paper.filter((q) => verdicts[q.id]?.ok).length : 0;

  if (!paper) {
    return <p className="px-4 py-6 text-sm text-slate-500">Préparation de votre marathon du jour…</p>;
  }

  return (
    <div className="pb-24">
      <p className="text-sm text-slate-600">
        <b>Votre marathon du jour</b> — {paper.length} questions, toutes les leçons, pondérées sur <i>vos</i> points
        faibles. Une question, un mot · Entrée = vérifier et continuer · 💡 = un indice si besoin. Demain : un nouveau
        tirage !
      </p>
      <ol className="mt-3 space-y-3">
        {paper.map((q, n) => {
          const v = verdicts[q.id];
          return (
            <li
              key={q.id}
              className={`rounded-xl border-2 p-3 ${v ? (v.ok ? "border-emerald-300 bg-emerald-50/60" : "border-rose-300 bg-rose-50/60") : "border-slate-200 bg-white"}`}
            >
              <div className="text-xs font-bold text-slate-400">{n + 1} · {q.sio}</div>
              <div lang="fr" className="mt-1 text-[17px] leading-8 text-slate-900">
                {q.pre}
                <input
                  id={`fin-${q.id}`}
                  value={typed[q.id] ?? ""}
                  onChange={(e) => setTyped((t) => ({ ...t, [q.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); grade(q, true); } }}
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  className="mx-1 w-36 max-w-[44vw] border-0 border-b-[2.5px] border-slate-900 bg-yellow-100/70 px-1.5 text-center text-[16px] outline-none focus:border-blue-600"
                />
                {q.post}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                <button type="button" onClick={() => hint(q)} className="rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800">💡 indice</button>
                <button type="button" onClick={() => grade(q, false)} className="rounded-full border-2 border-slate-300 bg-white px-3 py-0.5 text-xs font-bold text-slate-700">✓ vérifier</button>
                {hints[q.id] && <span className="text-xs font-bold text-amber-800">💡 {q.cat}</span>}
                {v && (v.ok
                  ? <span className="font-bold text-emerald-700">✓ Bravo !{v.others.length > 0 && <span className="font-normal text-slate-500"> (aussi accepté : {v.others.join(", ")})</span>}</span>
                  : <span className="font-bold text-rose-600">✗ Réponse : {v.expected[0]}{v.expected.length > 1 ? ` (ou ${v.expected.slice(1).join(", ")})` : ""}</span>)}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t-[3px] border-slate-900 bg-white/95 px-4 py-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between text-sm font-bold text-slate-900">
          <span>🏁 {done}/{paper.length}</span>
          <span className="text-emerald-700">✓ {okCount}</span>
        </div>
      </div>
    </div>
  );
}
