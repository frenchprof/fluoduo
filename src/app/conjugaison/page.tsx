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
import { PERSONS, VERBS, conjSpoken, type ConjVerb } from "@/content/conjugaison";
import { gradeAnswer } from "@/lib/practice/cloze";
import { recordItemResult } from "@/lib/progress";
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

export default function ConjugaisonPage() {
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
    <CahierShell tabs={tabsWithActive(siteTabs(), "home")} active="conjugaison" crumb="🔤 ConjugaZone">
      <div className="mx-auto max-w-4xl px-3 py-5">
        <h1 className="cahier-display text-2xl font-black text-[color:var(--cahier-ink)]">
          🔤 ConjugaZone <span className="text-lg font-bold text-[color:var(--cahier-ink-soft)]">· Conjugation tables</span>
        </h1>
        <p className="mt-1 mb-3 text-sm text-[color:var(--cahier-ink-soft)]">
          Pick verbs · 🙈 hide a column and tap cells to reveal · ⌨ type the forms and check.
        </p>

        <AuthGate what="practise" compact>
          {/* Verb picker */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {VERBS.map((v) => (
              <button key={v.id} type="button" lang="fr" onClick={() => toggleVerb(v.id)}
                className={`cahier-btn cahier-btn-sm ${picked.includes(v.id) ? "cahier-btn-primary" : ""}`}>
                {v.inf}
              </button>
            ))}
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
                                lang="fr" value={s.typed[i]}
                                onChange={(e) => patch(v.id, { typed: s.typed.map((t, k) => (k === i ? e.target.value : t)), result: s.result.map((x, k) => (k === i ? null : x)) })}
                                onKeyDown={(e) => { if (e.key === "Enter") check(v); }}
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
                                speak(conjSpoken(i, form), "fr-FR");
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
            </div>
          )}
        </AuthGate>
      </div>
    </CahierShell>
  );
}
