"use client";

/**
 * 🔤 ConjugaZone (Dan, 2026-07-08: "a section on conjugation alone, in table
 * form where the learner hides any of the relevant columns and taps to reveal
 * or types to check"). Pick verbs as columns; each column can be:
 *   shown  — study it; tap a cell to hear « je suis »
 *   hidden — self-test; tap a cell to peek (and hear it)
 *   typing — cells become inputs; ✅ grades the column (accent-lenient),
 *            every cell feeds XP/SRS via recordItemResult
 */
import { useEffect, useState } from "react";
import CahierShell from "@/components/CahierShell";
import { siteTabs, tabsWithActive } from "@/components/siteTabs";
import AuthGate from "@/components/AuthGate";
import { CONJ_GROUPS, PERSONS, VERBS, conjSpoken, type ConjVerb } from "@/content/conjugaison";
import { gradeAnswer } from "@/lib/practice/cloze";
import { recordItemResult } from "@/lib/progress";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { speak } from "@/games/letris/speech";
import { sfx } from "@/games/audio/sfx";

type ColMode = "shown" | "hidden" | "typing";
type ColState = {
  mode: ColMode;
  peeked: boolean[]; // hidden mode: cells revealed by tapping
  typed: string[];
  result: (boolean | null)[]; // typing mode, after ✅
};
const fresh = (): ColState => ({
  mode: "shown",
  peeked: [false, false, false, false, false, false],
  typed: ["", "", "", "", "", ""],
  result: [null, null, null, null, null, null],
});

// ── Phrases complètes (Dan, 2026-07-21): "what is genuinely missing from
// ConjugaZone is the possibility to hear the conjugations in simple complete
// sentences." Complement banks for the core verbs — the 🎲 button appears
// only where a bank exists, because complements don't generalize across all
// 67 verbs' transitivity. Every complement is invariable (no agreement traps)
// and inside the A1 syllabus.
const SENTENCE_BANKS: Record<string, string[]> = {
  etre: ["à Singapour", "en France", "à la maison", "à l'université", "au restaurant", "au marché"],
  avoir: ["faim", "soif", "froid", "chaud", "sommeil", "vingt ans", "un stylo", "besoin d'un café"],
  aller: ["au cinéma", "à la plage", "au marché", "à l'université", "à la bibliothèque", "au restaurant", "en France"],
  faire: ["du sport", "du yoga", "de la natation", "du vélo", "les courses", "la cuisine"],
  falloir: ["un passeport", "étudier", "un billet", "manger des légumes"],
  parler: ["français", "anglais", "un peu chinois", "de la famille", "du week-end"],
  habiter: ["à Singapour", "à Paris", "près de l'université", "loin du centre", "en France"],
  aimer: ["le chocolat", "la musique", "danser", "voyager", "le café", "les mathématiques"],
  adorer: ["le cinéma", "la cuisine française", "chanter", "les week-ends", "le sport"],
  detester: ["le lundi matin", "les examens", "attendre", "le café froid"],
  etudier: ["le français", "la chimie", "à la bibliothèque", "le droit", "l'économie"],
  travailler: ["à l'hôpital", "le week-end", "à Singapour", "au restaurant", "beaucoup"],
  manger: ["du pain", "des légumes", "au restaurant", "un sandwich", "à midi"],
  boire: ["du café", "de l'eau", "du thé", "un jus d'orange"],
  vouloir: ["un café", "manger", "dormir", "voyager", "danser"],
  pouvoir: ["entrer", "payer par carte", "venir demain", "commencer"],
  devoir: ["étudier", "dormir", "travailler", "partir", "manger des légumes"],
  prendre: ["le bus", "le métro", "un café", "le petit-déjeuner", "un taxi"],
  venir: ["de Singapour", "à l'université", "au cinéma avec nous", "de France"],
  dormir: ["bien", "beaucoup", "à minuit", "le week-end"],
};
function drawComplements(v: ConjVerb): string[] {
  const bank = SENTENCE_BANKS[v.id] ?? [];
  const pool = [...bank].sort(() => Math.random() - 0.5);
  return v.forms.map((f, i) => (f === "—" ? "" : pool[i % pool.length]));
}

export default function ConjugaisonPage() {
  useActivityPlay("conjugaison");
  const [picked, setPicked] = useState<string[]>(["etre", "avoir", "aller"]);
  const [cols, setCols] = useState<Record<string, ColState>>({});
  // Lesson pages deep-link their verbs: /conjugaison?v=vouloir,pouvoir
  useEffect(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("v");
      const ids = (v ?? "").split(",").filter((id) => VERBS.some((x) => x.id === id));
      if (ids.length > 0) setPicked(ids);
    } catch {}
  }, []);
  const st = (id: string): ColState => cols[id] ?? fresh();
  const patch = (id: string, p: Partial<ColState>) =>
    setCols((c) => ({ ...c, [id]: { ...st(id), ...p } }));

  const toggleVerb = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const setMode = (id: string, mode: ColMode) =>
    patch(id, { ...fresh(), mode });

  // Phrases complètes: verbId → one drawn complement per person (null = closed)
  const [sentences, setSentences] = useState<Record<string, string[] | null>>({});

  // Per-FIELD validation (Dan, 2026-07-21): Enter grades this cell, speaks the
  // correct form, and moves focus to the next blank in the column.
  function checkCell(v: ConjVerb, i: number) {
    const s = st(v.id);
    const t = s.typed[i].trim();
    const form = v.forms[i];
    const ok = t !== "" && (gradeAnswer(t, form) !== "wrong" || gradeAnswer(t, conjSpoken(i, form)) !== "wrong");
    recordItemResult(`conj-${v.id}-${i}`, ok);
    const result = s.result.map((x, k) => (k === i ? ok : x));
    patch(v.id, { result });
    speak(conjSpoken(i, form), "fr-FR");
    if (result.every((x, k) => v.forms[k] === "—" || x === true)) sfx.correct();
    for (let j = i + 1; j < v.forms.length; j++) {
      if (v.forms[j] === "—") continue;
      document.getElementById(`cz-${v.id}-${j}`)?.focus();
      break;
    }
  }

  function check(v: ConjVerb) {
    const s = st(v.id);
    const result = v.forms.map((f, i) => {
      // Impersonal gaps (falloir outside « il faut ») are not gradable cells.
      if (f === "—") return true;
      const t = s.typed[i].trim();
      const ok = t !== "" && (gradeAnswer(t, f) !== "wrong" || gradeAnswer(t, conjSpoken(i, f)) !== "wrong");
      recordItemResult(`conj-${v.id}-${i}`, ok);
      return ok;
    });
    patch(v.id, { result });
    if (result.every(Boolean)) sfx.correct();
  }

  const shown = VERBS.filter((v) => picked.includes(v.id));

  return (
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="conjugaison">
      <div className="mx-auto max-w-4xl px-3 pb-5 pt-2">
        <h1 className="cahier-display cahier-hand text-3xl font-normal text-[color:var(--cahier-ink)]">
          🔤 ConjugaZone <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· Conjugation tables</span>
        </h1>
        <p className="mt-1 mb-3 text-sm text-[color:var(--cahier-ink-soft)]">
          Pick verbs · 🙈 hide a column and tap cells to reveal · ⌨ type the forms and check.
        </p>

        <AuthGate what="practise" compact>
          {/* Verb picker — one DROPDOWN per verb group (Dan, 2026-07-15: the
              67-chip wall "looks very messy"). Selecting toggles the verb
              (✓ marks the ones already on the table); the picked verbs sit
              below as chips, tap × to drop one. */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {CONJ_GROUPS.map((g) => (
              <select
                key={g}
                value=""
                aria-label={g}
                onChange={(e) => { if (e.target.value) toggleVerb(e.target.value); }}
                className="max-w-full cursor-pointer rounded-lg border-2 border-[color:var(--cahier-ink)]/30 bg-white px-2 py-1.5 text-sm font-bold text-[color:var(--cahier-ink)] shadow-[2px_2px_0_rgba(0,0,0,0.08)] outline-none hover:border-[color:var(--cahier-ink)]"
              >
                <option value="">{g} ▾</option>
                {VERBS.filter((v) => v.group === g).map((v) => (
                  <option key={v.id} value={v.id}>
                    {picked.includes(v.id) ? "✓ " : ""}{v.inf} — {v.en}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {shown.length === 0 ? (
              <p className="text-sm text-[color:var(--cahier-ink-soft)]">Choisis tes verbes dans les listes ↑</p>
            ) : (
              shown.map((v) => (
                <button key={v.id} type="button" lang="fr" onClick={() => toggleVerb(v.id)}
                  title="Retirer" className="cahier-btn cahier-btn-sm cahier-btn-primary">
                  {v.inf} <span aria-hidden className="opacity-70">×</span>
                </button>
              ))
            )}
          </div>

          {shown.length === 0 ? (
            <p className="text-sm text-[color:var(--cahier-ink-soft)]">Pick at least one verb above.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/80 p-2">
              <table className="w-full border-collapse text-[15px]">
                <thead>
                  <tr>
                    <th className="p-2" />
                    {shown.map((v) => {
                      const s = st(v.id);
                      return (
                        <th key={v.id} className="min-w-[9.5rem] p-2 align-top">
                          <div lang="fr" className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">{v.inf}</div>
                          <div className="text-[11px] font-semibold text-[color:var(--cahier-ink-soft)]">{v.en}</div>
                          <div className="mt-1.5 flex justify-center gap-1">
                            <button type="button" onClick={() => setMode(v.id, s.mode === "hidden" ? "shown" : "hidden")}
                              title={s.mode === "hidden" ? "Tout montrer" : "Cacher la colonne"}
                              className={`cahier-btn cahier-btn-sm ${s.mode === "hidden" ? "cahier-btn-primary" : ""}`}>
                              {/* no eye icons (Dan, 2026-07-08) — the monkey
                                  pair carries the hide/show meaning */}
                              {s.mode === "hidden" ? "🙈" : "🐵"}
                            </button>
                            <button type="button" onClick={() => setMode(v.id, s.mode === "typing" ? "shown" : "typing")}
                              title={s.mode === "typing" ? "Arrêter de taper" : "Taper pour vérifier"}
                              className={`cahier-btn cahier-btn-sm ${s.mode === "typing" ? "cahier-btn-primary" : ""}`}>
                              ⌨
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {PERSONS.map((p, i) => (
                    <tr key={p} className="border-t border-[color:var(--cahier-rule)]">
                      <th lang="fr" className="whitespace-nowrap p-2 text-left text-sm font-bold text-[color:var(--cahier-ink-soft)]">{p}</th>
                      {shown.map((v) => {
                        const s = st(v.id);
                        const form = v.forms[i];
                        // Impersonal verbs (falloir) only exist in one person —
                        // the rest are inert dashes: no tap, no typing, no TTS.
                        if (form === "—") {
                          return <td key={v.id} className="p-1.5 text-center font-bold text-[color:var(--cahier-ink-soft)]/40">—</td>;
                        }
                        if (s.mode === "typing") {
                          const r = s.result[i];
                          return (
                            <td key={v.id} className="p-1.5 text-center">
                              <input
                                id={`cz-${v.id}-${i}`}
                                lang="fr" value={s.typed[i]}
                                onChange={(e) => patch(v.id, { typed: s.typed.map((t, k) => (k === i ? e.target.value : t)), result: s.result.map((x, k) => (k === i ? null : x)) })}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); checkCell(v, i); } }}
                                placeholder="…" autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                                className={`w-full rounded-lg border-2 px-2 py-1 text-center text-[15px] outline-none ${
                                  r === true ? "border-emerald-600 bg-emerald-600/10" : r === false ? "border-rose-600 bg-rose-600/10" : "border-[color:var(--cahier-rule)] bg-white focus:border-[color:var(--cahier-le)]"
                                }`}
                              />
                              {r === false && <div lang="fr" className="mt-0.5 text-xs font-bold text-emerald-700">{form}</div>}
                            </td>
                          );
                        }
                        const masked = s.mode === "hidden" && !s.peeked[i];
                        return (
                          <td key={v.id} className="p-1.5 text-center">
                            <button type="button" lang="fr"
                              onClick={() => {
                                if (masked) patch(v.id, { peeked: s.peeked.map((x, k) => (k === i ? true : x)) });
                                speak(conjSpoken(i, form), "fr-FR", { analytic: "word" });
                              }}
                              className={`w-full rounded-lg border-2 px-2 py-1 font-bold transition ${
                                masked
                                  ? "border-dashed border-[color:var(--cahier-ink)]/40 bg-[color:var(--cahier-paper-2)] text-transparent"
                                  : "border-transparent text-[color:var(--cahier-ink)] hover:border-[color:var(--cahier-gold)]"
                              }`}>
                              {masked ? "•••" : form}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-1.5" />
                    {shown.map((v) => {
                      const s = st(v.id);
                      return (
                        <td key={v.id} className="p-1.5 text-center">
                          {s.mode === "typing" && (
                            <div className="flex justify-center gap-1.5">
                              <button type="button" onClick={() => check(v)} className="cahier-btn cahier-btn-sm cahier-btn-primary">✅ Vérifier</button>
                              <button type="button" onClick={() => setMode(v.id, "typing")} title="Effacer et retaper" className="cahier-btn cahier-btn-sm">↻</button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
              {/* 🎲 Phrases complètes — hear each S+V inside a simple sentence */}
              <div className="mt-3 flex flex-wrap gap-2">
                {shown.filter((v) => SENTENCE_BANKS[v.id]).map((v) => (
                  <button key={v.id} type="button" lang="fr"
                    onClick={() => setSentences((m) => ({ ...m, [v.id]: drawComplements(v) }))}
                    className="cahier-btn cahier-btn-sm">
                    🎲 {v.inf} en phrases
                  </button>
                ))}
              </div>
              {shown.filter((v) => sentences[v.id]).map((v) => (
                <div key={v.id} className="mt-2 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span lang="fr" className="text-sm font-bold text-[color:var(--cahier-ink)]">{v.inf} — phrases complètes</span>
                    <span className="flex gap-1.5">
                      <button type="button" title="D'autres phrases" onClick={() => setSentences((m) => ({ ...m, [v.id]: drawComplements(v) }))} className="cahier-btn cahier-btn-sm">🎲</button>
                      <button type="button" title="Fermer" onClick={() => setSentences((m) => ({ ...m, [v.id]: null }))} className="cahier-btn cahier-btn-sm">✕</button>
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {v.forms.map((f, i) => {
                      if (f === "—") return null;
                      const phrase = `${conjSpoken(i, f)} ${sentences[v.id]![i]}`;
                      return (
                        <li key={i} className="flex items-center gap-2">
                          <button type="button" title="Écouter" onClick={() => speak(phrase, "fr-FR", { analytic: "sentence" })} className="cahier-btn cahier-btn-sm">🔊</button>
                          <span lang="fr" className="text-[15px] text-[color:var(--cahier-ink)]">{phrase.charAt(0).toUpperCase() + phrase.slice(1)}.</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </AuthGate>
      </div>
    </CahierShell>
  );
}
