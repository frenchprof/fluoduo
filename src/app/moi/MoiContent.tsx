"use client";
/**
 * 📊 /moi — « Mes progrès » : the student's own data, shown back to them
 * (Dan, 2026-07-23: "I promised my students to show them the data I have of
 * them — super useful for them to see their own participation and learning
 * patterns; make it very friendly"). Everything here is computed from the
 * learner's OWN local learning state (progress + per-item SRS), so the page
 * is personal by construction — no account plumbing, no privacy risk.
 * Colourful mini-tabs in the ST2FR26 spirit (Dan: "not so bland boring and
 * lifeless") using the cahier tab hues.
 */
import { useEffect, useMemo, useState } from "react";
import { SIOS } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { loadProgress, type Progress } from "@/lib/progress";

const HUES = ["var(--cahier-t0)", "var(--cahier-t1)", "var(--cahier-t2)", "var(--cahier-t3)", "var(--cahier-t4)", "var(--cahier-t5)"] as const;

type SioStat = { id: string; topic: string; unit: number; collectionId: string; tracked: number; bad: number };

function sioStats(p: Progress): SioStat[] {
  const now = Date.now();
  const out: SioStat[] = [];
  for (const s of SIOS as { id: string; topic: string; unit: number; collectionId: string }[]) {
    const c = CURATED.find((x) => x.id === s.collectionId);
    const ids: string[] = [
      ...((c?.items ?? []).map((it: { id?: string }) => it.id).filter(Boolean) as string[]),
    ];
    let tracked = 0, bad = 0;
    for (const id of ids) {
      const st = p.itemSrs[id];
      if (!st) continue;
      tracked += 1;
      if (st.due <= now || st.intervalDays <= 1) bad += 1;
    }
    // finale items carry their SIO in the id — count them too
    for (const [id, st] of Object.entries(p.itemSrs)) {
      if (!id.startsWith(`finale:${s.id}:`)) continue;
      tracked += 1;
      if (st.due <= now || st.intervalDays <= 1) bad += 1;
    }
    out.push({ id: s.id, topic: s.topic, unit: s.unit, collectionId: s.collectionId, tracked, bad });
  }
  return out;
}

const TABS = [
  { key: "parcours", label: "🏆 Mon parcours" },
  { key: "forces", label: "💪 Forces & faiblesses" },
  { key: "reviser", label: "📚 À réviser" },
  { key: "conseils", label: "💡 Mes conseils" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function MoiContent() {
  const [p, setP] = useState<Progress | null>(null);
  const [tab, setTab] = useState<TabKey>("parcours");
  useEffect(() => { setP(loadProgress()); }, []);

  const stats = useMemo(() => (p ? sioStats(p) : []), [p]);
  const touched = stats.filter((s) => s.tracked > 0);
  const strong = [...touched].sort((a, b) => a.bad / a.tracked - b.bad / b.tracked).slice(0, 4);
  const weak = [...touched].filter((s) => s.bad > 0).sort((a, b) => b.bad / b.tracked - a.bad / a.tracked).slice(0, 4);
  const dueNow = p ? Object.values(p.itemSrs).filter((st) => st.due <= Date.now()).length : 0;
  const trackedTotal = p ? Object.keys(p.itemSrs).length : 0;

  if (!p) return <p className="px-1 py-6 text-sm text-slate-500">Chargement de vos progrès…</p>;

  const Chip = ({ s, tone }: { s: SioStat; tone: "ok" | "bad" }) => (
    <a
      href={`/practice/flip-it/${s.collectionId}`}
      className={`block rounded-xl border-2 px-3 py-2 text-sm font-bold shadow-[2px_2px_0_rgba(0,0,0,0.10)] transition hover:-translate-y-0.5 ${tone === "ok" ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-700"}`}
    >
      <span className="text-xs text-slate-400">{s.id} · U{s.unit}</span>
      <br />{s.topic}
      <br /><span className="text-xs font-normal">{s.tracked - s.bad}/{s.tracked} solides {tone === "bad" ? "→ on s'entraîne ?" : "✓"}</span>
    </a>
  );

  return (
    <div className="pb-10">
      <p className="text-sm text-slate-600">
        Voici <b>vos</b> données d'apprentissage — les mêmes que le site utilise pour choisir vos questions. Tout se met à jour à chaque pratique.
      </p>

      {/* colourful mini-tabs, ST2FR26 spirit */}
      <div className="mt-3 flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`rounded-full border-2 px-3.5 py-1 text-sm font-black transition ${tab === t.key ? "text-white shadow-[2px_2px_0_rgba(0,0,0,0.2)]" : "bg-white text-slate-700 hover:-translate-y-0.5"}`}
            style={{ borderColor: HUES[i % HUES.length], background: tab === t.key ? HUES[i % HUES.length] : undefined }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "parcours" && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { e: "⭐", k: "XP", v: p.xp },
            { e: "🔥", k: "Streak", v: `${p.streak} j` },
            { e: "💎", k: "Gemmes", v: p.gems },
            { e: "🎯", k: "Leçons finies", v: `${p.doneSios.length} / ${SIOS.length}` },
            { e: "🎖️", k: "Badges", v: p.badges.length },
            { e: "🧠", k: "Mots suivis", v: trackedTotal },
          ].map((c, i) => (
            <div key={c.k} className="rounded-2xl border-2 bg-white p-3 text-center shadow-[2px_2px_0_rgba(0,0,0,0.10)]" style={{ borderColor: HUES[i % HUES.length] }}>
              <div className="text-2xl">{c.e}</div>
              <div className="text-xl font-black text-slate-900">{c.v}</div>
              <div className="text-xs font-bold text-slate-500">{c.k}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "forces" && (
        <div className="mt-4">
          {touched.length === 0 ? (
            <p className="text-sm text-slate-500">Pratiquez un peu — vos forces et faiblesses apparaîtront ici !</p>
          ) : (
            <>
              <h3 className="text-sm font-black uppercase tracking-wide text-emerald-700">Vos points forts</h3>
              <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">{strong.map((s) => <Chip key={s.id} s={s} tone="ok" />)}</div>
              <h3 className="mt-4 text-sm font-black uppercase tracking-wide text-rose-600">À travailler</h3>
              {weak.length > 0 ? (
                <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">{weak.map((s) => <Chip key={s.id} s={s} tone="bad" />)}</div>
              ) : <p className="mt-1 text-sm text-slate-500">Rien à signaler — bravo !</p>}
              <a href="/practice/grammarathon/finale" className="mt-4 block rounded-2xl border-[3px] border-slate-900 bg-yellow-100 px-4 py-3 text-center font-black text-slate-900 shadow-[3px_3px_0_#1f2440] transition hover:-translate-y-0.5">
                🏁 Lancer un marathon — il vise vos points faibles automatiquement
              </a>
            </>
          )}
        </div>
      )}

      {tab === "reviser" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border-2 border-slate-900 bg-white p-4 shadow-[2px_2px_0_#1f2440]">
            <p className="text-lg font-black text-slate-900">📬 {dueNow} {dueNow === 1 ? "élément vous attend" : "éléments vous attendent"} en révision</p>
            <p className="mt-1 text-sm text-slate-600">Le site retient ce que vous ratez et le représente au bon moment — c'est la révision la plus efficace qui existe.</p>
            <a href="/reviser" className="mt-2 inline-block rounded-full border-2 border-slate-900 bg-yellow-100 px-4 py-1.5 text-sm font-black text-slate-900 shadow-[2px_2px_0_#1f2440]">🔁 Ouvrir DéjàRevu</a>
          </div>
          <p className="text-sm text-slate-500">Suivi actuel : <b>{trackedTotal}</b> mots et structures, mis à jour à chaque réponse.</p>
        </div>
      )}

      {tab === "conseils" && (
        <div className="mt-4 space-y-2">
          {weak[0] && (
            <p className="rounded-xl border-2 border-rose-200 bg-rose-50 px-3 py-2 text-sm text-slate-800">
              🎯 Votre priorité n° 1 : <b>{weak[0].topic}</b> — <a href={`/practice/flip-it/${weak[0].collectionId}`} className="font-bold text-blue-700 underline underline-offset-2">commencez ici</a>.
            </p>
          )}
          <p className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-800">
            🔥 {p.streak >= 3 ? `Belle série de ${p.streak} jours — la régularité paie plus que les longues sessions !` : "20 minutes par jour battent 2 heures la veille — lancez votre série aujourd'hui !"}
          </p>
          <p className="rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2 text-sm text-slate-800">
            🏁 Un marathon par jour d'ici au test : chaque tirage est différent, et il connaît vos faiblesses mieux que vous.
          </p>
        </div>
      )}
    </div>
  );
}
