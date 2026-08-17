"use client";

/**
 * 🔤 ConjugaZone — verb endings until they come without thinking.
 *
 * Redesigned for DrillShell (patch 20–21): the page used to open on a
 * study table with three per-column modes (shown / hidden / typing) — a
 * fourth interaction grammar nobody else used. It now opens on the DRILL:
 * one person+verb cell at a time, typed (word-bank tiles below sm, the
 * same verb's other forms as distractors — the exact confusions), graded
 * accent-leniently with the pronoun optional, every cell feeding XP/SRS
 * via recordItemResult exactly as before.
 *
 * THE TABLE BECAME THE REWARD SCREEN: finish the run and the full
 * conjugation table renders — every form visible, tap any cell to hear
 * it, the 🎲 phrases complètes banks (Dan, 2026-07-21) attached, and the
 * verb picker to line up the next round. Study follows proof, instead of
 * gating it.
 *
 * Lesson deep-links keep working: /conjugaison?v=vouloir,pouvoir drills
 * exactly those verbs.
 */
import { useEffect, useMemo, useState } from "react";
import AuthGate from "@/components/AuthGate";
import DrillShell from "@/components/DrillShell";
import WordBank from "@/components/WordBank";
import { CONJ_GROUPS, PERSONS, VERBS, conjSpoken, type ConjVerb } from "@/content/conjugaison";
import { gradeAnswer } from "@/lib/practice/cloze";
import { recordItemResult } from "@/lib/progress";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { speak } from "@/games/letris/speech";
import { sfx } from "@/games/audio/sfx";
import { shuffle } from "@/lib/shuffle";

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
  const pool = shuffle(bank);
  return v.forms.map((f, i) => (f === "—" ? "" : pool[i % pool.length]));
}


type Cell = { v: ConjVerb; i: number };

export default function ConjugaisonPage() {
  useActivityPlay("conjugaison");
  const [picked, setPicked] = useState<string[]>(["etre", "avoir", "aller"]);
  // Lesson pages deep-link their verbs: /conjugaison?v=vouloir,pouvoir
  useEffect(() => {
    try {
      const v = new URLSearchParams(window.location.search).get("v");
      const ids = (v ?? "").split(",").filter((id) => VERBS.some((x) => x.id === id));
      if (ids.length > 0) setPicked(ids);
    } catch {}
  }, []);
  const shown = useMemo(() => VERBS.filter((v) => picked.includes(v.id)), [picked]);

  const [queue, setQueue] = useState<Cell[] | null>(null);
  const [k, setK] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  const [screen, setScreen] = useState<"drill" | "table">("drill");
  // Phrases complètes on the reward table: verbId → drawn complements.
  const [sentences, setSentences] = useState<Record<string, string[] | null>>({});

  // (Re)build the run whenever the verb set changes. Client-only: shuffling
  // during render would break SSR hydration.
  useEffect(() => {
    setQueue(shuffle(shown.flatMap((v) => v.forms.flatMap((f, i) => (f === "—" ? [] : [{ v, i }])))));
    setK(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 });
    setScreen("drill");
    setSentences({});
  }, [shown]);

  const cell = queue && k < queue.length ? queue[k] : null;
  const form = cell ? cell.v.forms[cell.i] : "";
  const spoken = cell ? conjSpoken(cell.i, form) : "";

  function check() {
    if (!cell || result !== null) return;
    const t = value.trim();
    const ok = t !== "" && (gradeAnswer(t, form) !== "wrong" || gradeAnswer(t, spoken) !== "wrong");
    recordItemResult(`conj-${cell.v.id}-${cell.i}`, ok);
    setResult(ok);
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), total: s.total + 1 }));
    if (ok) sfx.correct(); else sfx.wrong();
    speak(spoken, "fr-FR");
  }
  function next() {
    setResult(null);
    setValue("");
    if (queue && k + 1 >= queue.length) {
      sfx.stage(); // run complete — the table is about to be earned
      setScreen("table");
      return;
    }
    setK((n) => n + 1);
  }
  function restart() {
    setQueue(shuffle(queue ?? []));
    setK(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 });
    setScreen("drill");
  }
  const toggleVerb = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // Word-bank distractors: the SAME verb's other forms — suis/es/est/…
  // are the exact confusions this drill exists to separate.
  const bankPool = cell
    ? cell.v.forms.filter((f, i) => f !== "—" && i !== cell.i)
    : [];

  const drilling = screen === "drill" && !!cell;

  return (
    <DrillShell
      exitHref="/activities"
      progress={drilling && queue ? { done: k, total: queue.length } : null}
      right={<>✓ {score.ok}</>}
      cta={
        screen === "table"
          ? { label: "↻ Again", onClick: restart }
          : drilling && result === null
            ? { label: "Check", onClick: check, disabled: !value.trim() }
            : null
      }
      feedback={
        drilling && result !== null
          ? {
              kind: result ? "correct" : "wrong",
              body: (
                <>
                  <span lang="fr" className="font-black">{spoken}</span>
                  <button type="button" onClick={() => speak(spoken, "fr-FR")} className="ml-2 text-base opacity-70 hover:opacity-100" title="Listen">🔊</button>
                </>
              ),
              cta: { label: queue && k + 1 >= queue.length ? "📖 The table" : "Continue", onClick: next },
            }
          : null
      }
    >
      <AuthGate what="practise" compact>
        {drilling && cell ? (
          <div>
            <p className="text-center text-xs font-bold text-[color:var(--cahier-ink-soft)]">
              🔤 <span lang="fr">{cell.v.inf}</span> · {cell.v.en}
            </p>
            <p lang="fr" className="mt-3 text-center text-2xl font-black text-[color:var(--cahier-ink)]">
              {PERSONS[cell.i]}{" "}
              <span className="inline-block min-w-[4ch] border-b-2 border-[color:var(--cahier-ink)] px-1 text-center text-[color:var(--cahier-ink-soft)]">
                {result === null ? " " : form}
              </span>
            </p>
            <div className="mt-6">
              <input
                lang="fr"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={result !== null}
                placeholder="the verb form…"
                className={`cahier-answer hidden w-full sm:block ${result === null ? "" : result ? "!border-emerald-500 !text-emerald-700" : "!border-rose-500 !text-rose-700"}`}
                autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              />
              <div className="sm:hidden">
                <WordBank answer={form} pool={bankPool} value={value} onChange={setValue} disabled={result !== null} />
              </div>
            </div>
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => { sfx.stage(); setScreen("table"); }}
                className="fluo-btn fluo-btn-sm fluo-btn-ghost"
                title="Stop and see the table"
              >
                ⏹ See the table
              </button>
            </div>
          </div>
        ) : screen === "table" ? (
          <RewardTable
            shown={shown}
            score={score}
            sentences={sentences}
            setSentences={setSentences}
            toggleVerb={toggleVerb}
            picked={picked}
          />
        ) : (
          <p className="py-10 text-center text-sm text-[color:var(--cahier-ink-soft)]">
            {shown.length === 0 ? "Pick at least one verb." : "…"}
          </p>
        )}
      </AuthGate>
    </DrillShell>
  );
}

/**
 * The conjugation table, EARNED: every form visible, every cell speaks on
 * tap, the phrases-complètes banks attached, and the verb picker to line
 * up the next round. The old hide/peek/typing column modes are gone — the
 * drill IS the testing surface now.
 */
function RewardTable({
  shown,
  score,
  sentences,
  setSentences,
  toggleVerb,
  picked,
}: {
  shown: ConjVerb[];
  score: { ok: number; total: number };
  sentences: Record<string, string[] | null>;
  setSentences: React.Dispatch<React.SetStateAction<Record<string, string[] | null>>>;
  toggleVerb: (id: string) => void;
  picked: string[];
}) {
  return (
    <div>
      {score.total > 0 && (
        <p className="text-center text-lg font-black text-[color:var(--cahier-ink)]">
          🎉 ✓ {score.ok}/{score.total}
        </p>
      )}
      <div className="mt-3 overflow-x-auto rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white/80 p-2">
        <table className="w-full border-collapse text-[15px]">
          <thead>
            <tr>
              <th className="p-2" />
              {shown.map((v) => (
                <th key={v.id} className="min-w-[8rem] p-2 align-top">
                  <div lang="fr" className="cahier-display text-lg font-black text-[color:var(--cahier-ink)]">{v.inf}</div>
                  <div className="text-[11px] font-semibold text-[color:var(--cahier-ink-soft)]">{v.en}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERSONS.map((p, i) => (
              <tr key={p} className="border-t border-[color:var(--cahier-rule)]">
                <th lang="fr" className="whitespace-nowrap p-2 text-left text-sm font-bold text-[color:var(--cahier-ink-soft)]">{p}</th>
                {shown.map((v) => {
                  const form = v.forms[i];
                  if (form === "—") {
                    return <td key={v.id} className="p-1.5 text-center font-bold text-[color:var(--cahier-ink-soft)]/40">—</td>;
                  }
                  return (
                    <td key={v.id} className="p-1.5 text-center">
                      <button
                        type="button"
                        lang="fr"
                        onClick={() => speak(conjSpoken(i, form), "fr-FR", { analytic: "word" })}
                        className="w-full rounded-lg border-2 border-transparent px-2 py-1 font-bold text-[color:var(--cahier-ink)] transition hover:border-[color:var(--cahier-gold)]"
                      >
                        {form}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {/* 🎲 Phrases complètes — hear each S+V inside a simple sentence */}
        <div className="mt-3 flex flex-wrap gap-2">
          {shown.filter((v) => SENTENCE_BANKS[v.id]).map((v) => (
            <button key={v.id} type="button" lang="fr"
              onClick={() => setSentences((m) => ({ ...m, [v.id]: drawComplements(v) }))}
              className="cahier-btn cahier-btn-sm">
              🎲 {v.inf} in sentences
            </button>
          ))}
        </div>
        {shown.filter((v) => sentences[v.id]).map((v) => (
          <div key={v.id} className="mt-2 rounded-xl border-2 border-[color:var(--cahier-rule)] bg-white p-3">
            <div className="flex items-center justify-between">
              <span lang="fr" className="text-sm font-bold text-[color:var(--cahier-ink)]">{v.inf} — full sentences</span>
              <span className="flex gap-1.5">
                <button type="button" title="Other sentences" onClick={() => setSentences((m) => ({ ...m, [v.id]: drawComplements(v) }))} className="cahier-btn cahier-btn-sm">🎲</button>
                <button type="button" title="Close" onClick={() => setSentences((m) => ({ ...m, [v.id]: null }))} className="cahier-btn cahier-btn-sm">✕</button>
              </span>
            </div>
            <ul className="mt-1.5 space-y-1">
              {v.forms.map((f, i) => {
                if (f === "—") return null;
                const phrase = `${conjSpoken(i, f)} ${sentences[v.id]![i]}`;
                return (
                  <li key={i} className="flex items-center gap-2">
                    <button type="button" title="Listen" onClick={() => speak(phrase, "fr-FR", { analytic: "sentence" })} className="cahier-btn cahier-btn-sm">🔊</button>
                    <span lang="fr" className="text-[15px] text-[color:var(--cahier-ink)]">{phrase.charAt(0).toUpperCase() + phrase.slice(1)}.</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Line up the next round — dropdowns per group, chips to drop. The
          verb set changing rebuilds the run and returns to the drill. */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-1.5">
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
        <div className="mt-2 flex flex-wrap gap-1.5">
          {shown.map((v) => (
            <button key={v.id} type="button" lang="fr" onClick={() => toggleVerb(v.id)}
              title="Retirer" className="cahier-btn cahier-btn-sm cahier-btn-primary">
              {v.inf} <span aria-hidden className="opacity-70">×</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
