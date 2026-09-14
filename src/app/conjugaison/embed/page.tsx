"use client";

/**
 * /conjugaison/embed — ConjugaZone, running inside the cahier rather than drawing one.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*, and then *"proceed the remaining unframed
 * surfaces"*. `/conjugaison` is the page a learner opens; this is what runs in the
 * frame it holds, and it is the SAME component the page rendered directly
 * before, so the two cannot drift.
 *
 * The chrome is hidden by CSS in a framed document (`html[data-embed]` in
 * globals.css), so nothing here had to change to lose its notebook.
 */
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
import CahierShell from "@/components/CahierShell";
import { useAuthUser } from "@/lib/firebase/auth";
import { REQUIRE_SIGN_IN } from "@/lib/authConfig";
import DrillShell, { type DrillFinish } from "@/components/DrillShell";
import WordBank from "@/components/WordBank";
import GapField from "@/components/GapField";
import ConjugaTable, { type ConjugaMode } from "@/components/ConjugaTable";
import { CONJ_GROUPS, PERSONS, VERBS, conjSpoken, type ConjVerb } from "@/content/conjugaison";
import { lessonVerbs } from "@/content/lessonVerbs";
import { addressSearch } from "@/lib/addressWindow";
import { stopForDeck } from "@/lib/stopTag";
import { gradeAnswer } from "@/lib/practice/cloze";
import { recordItemResult } from "@/lib/progress";
import { useActivityPlay } from "@/lib/firebase/activityLog";
import { speak } from "@/games/letris/speech";
import { sfx } from "@/games/audio/sfx";
import { shuffle } from "@/lib/shuffle";
import { HOME_HREF } from "@/lib/routes";
import PathNext from "@/components/PathNext";

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
  const user = useAuthUser(); // undefined = resolving, null = signed out
  const [picked, setPicked] = useState<string[]>(["etre", "avoir", "aller"]);
  /* THE LESSON CHOOSES THE VERBS (Dan, 2026-09-08: *"ConjugaZone page would
     land on the same single conjugazone page but land on the particular verbs
     that we have assigned for that lesson"*, table approved 11 Sep).

     TWO WAYS IN, and they are not the same thing:

       ?deck=aimer-activites   the LESSON. content/lessonVerbs.ts says which of
                               the 67 verbs belong to it — the address carries
                               the lesson, never a copy of its verb list, so a
                               bookmark cannot go stale the day a verb moves.
       ?v=vouloir,pouvoir      EXACTLY these, whatever lesson you came from.
                               Older, still honoured, and it wins where both are
                               given: a hand-written list is a deliberate act.

     Read after mount, not during render: the query is not part of the
     prerendered HTML, so branching on it in render would mismatch on
     hydration. And read from `addressSearch()` rather than `window.location`,
     because this runs inside the cahier's iframe whose own src is
     `/conjugaison/embed` with no query on it at all — measured, every lesson
     drilled être / avoir / aller until this line. */
  useEffect(() => {
    try {
      const q = new URLSearchParams(addressSearch());
      const spelled = (q.get("v") ?? "").split(",").filter((id) => VERBS.some((x) => x.id === id));
      const stop = stopForDeck(q.get("deck"));
      const fromLesson = stop ? lessonVerbs(stop.id).map((v) => v.id) : [];
      const ids = spelled.length > 0 ? spelled : fromLesson;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
      if (ids.length > 0) setPicked(ids);
    } catch {}
  }, []);
  const shown = useMemo(() => VERBS.filter((v) => picked.includes(v.id)), [picked]);

  const [queue, setQueue] = useState<Cell[] | null>(null);
  const [k, setK] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [score, setScore] = useState({ ok: 0, total: 0 });
  // THE TABLE IS THE DOOR NOW (Dan, 2026-09-11: *"The main focus of
  // ConjugaZone should be the verb table. The questions are secondary and
  // only come after that table."*). This reverses patch 20–21, which made the
  // table the reward for finishing the drill — see this file's docstring,
  // which is amended rather than quietly corrected.
  const [screen, setScreen] = useState<"drill" | "table">("table");
  const [mode, setMode] = useState<ConjugaMode>("reveal");
  /* BLANKED ON ARRIVAL (Dan, 2026-09-12: *"make the conjugazone first land on
     the blanked state"*). The table opened with every form showing and asked
     the learner to tap HIDE CONJUGATIONS before anything was being tested —
     a step between them and the work, on the screen they came to do it on.
     Starting covered means the first tap is already the exercise.

     The forms are one tap away either way: HIDE CONJUGATIONS reads SHOW
     CONJUGATIONS from the start and puts the whole table back, which is what
     a learner meeting a verb for the first time wants. */
  const [hidden, setHidden] = useState(true);
  // Phrases complètes, drawn per verb: verbId → one complement per person.
  // Read under each Subject+Verb inside the table (see StudyTable).
  const [sentences, setSentences] = useState<Record<string, string[] | null>>({});

  // (Re)build the run whenever the verb set changes. Client-only: shuffling
  // during render would break SSR hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffled after mount so SSR and the first client render agree — pre-existing, not this change's
    setQueue(shuffle(shown.flatMap((v) => v.forms.flatMap((f, i) => (f === "—" ? [] : [{ v, i }])))));
    setK(0); setValue(""); setResult(null); setScore({ ok: 0, total: 0 });
    // NO setScreen HERE. This effect runs on mount as well as on a verb
    // change, so forcing "drill" made the table's default unreachable — the
    // page still opened on the questions however the initial state was
    // declared. Changing the verb set now rebuilds the run and leaves the
    // learner where they are: studying if they were studying, drilling if
    // they were drilling.
    setSentences({});
  }, [shown]);

  const cell = queue && k < queue.length ? queue[k] : null;
  const form = cell ? cell.v.forms[cell.i] : "";
  const spoken = cell ? conjSpoken(cell.i, form) : "";

  function check() {
    if (!cell || result !== null) return;
    const t = value.trim();
    const ok = t !== "" && (gradeAnswer(t, form) !== "wrong" || gradeAnswer(t, spoken) !== "wrong");
    // The activity tag is what gives this answer an evidence TYPE — without it
    // buildEvidence stores no `evidenceType` at all (audit 2026-08-30). Typing
    // one required form is constrained production, so `conj:` resolves there.
    recordItemResult(`conj-${cell.v.id}-${cell.i}`, ok, t, `conj:${cell.v.id}`);
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

  // The table screen IS the finish screen (the approved flow, 2026-08-24):
  // ONE primary « Next › » onward, ↻ Again the quiet "Repeat". ConjugaZone
  // is deckless (a verb picker, not one SIO) — nextStep anchors it on the
  // learner's current stop on the path, same as any other deckless surface.
  const finish: DrillFinish | null = screen === "table" && score.total > 0 ? { repeat: restart } : null;

  // Signed out, the gate keeps the page's NORMAL chrome (band + bottom bar)
  // instead of DrillShell's bare ✕-and-lock (2026-08-24; the 22 Aug flow
  // walk: 💪 landed a newcomer on a lock with no heading and no way back
  // but ✕). DrillShell itself is untouched — the swap happens here at the
  // door. Once auth resolves signed-in, the drill renders as before.
  if (REQUIRE_SIGN_IN && !user) {
    return (
      <CahierShell active="conjugaison">
        <AuthGate what="practise">{null}</AuthGate>
      </CahierShell>
    );
  }

  return (
    <DrillShell
      exitHref={HOME_HREF}
      progress={drilling && queue ? { done: k, total: queue.length } : null}
      right={<>✓ {score.ok}</>}
      activity="conjugaison"
      finish={finish}
      cta={
        drilling && result === null
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
              cta: { label: queue && k + 1 >= queue.length ? "📖 Back to the table" : "Continue", onClick: next },
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
            {/* THE GAP SITS BESIDE ITS PRONOUN, where the form goes — not on
                a line of its own (Dan, 2026-09-11). This drill had the same
                pair GramMarathon had: a dead 4ch rule after « je », and a
                live 600px input below it. */}
            <p lang="fr" className="mt-3 text-center text-2xl font-black text-[color:var(--cahier-ink)]">
              {PERSONS[cell.i]}{" "}
              <GapField
                answer={form}
                value={value}
                onChange={setValue}
                disabled={result !== null}
                state={result === null ? "idle" : result ? "right" : "wrong"}
                reveal={result === null ? null : form}
              />
            </p>
            <div className="mt-6 sm:hidden">
              <WordBank answer={form} pool={bankPool} value={value} onChange={setValue}
                        disabled={result !== null} builtInGap />
            </div>
            <div className="mt-5 text-center">
              <button
                type="button"
                /* NO FANFARE. Dan, 2026-09-13: *"The [victory] jingle is
                   sometimes playing for no good reason."* This is the button
                   that STOPS the drill early — the learner gave up, and the
                   app played the full victory fanfare and rained confetti on
                   them for it. The run's real completion, in next() below,
                   keeps its jingle. */
                onClick={() => setScreen("table")}
                className="fluo-btn fluo-btn-sm fluo-btn-ghost"
                title="Stop and see the table"
              >
                See the table
              </button>
            </div>
          </div>
        ) : screen === "table" ? (
          <StudyTable
            shown={shown}
            score={score}
            sentences={sentences}
            setSentences={setSentences}
            toggleVerb={toggleVerb}
            picked={picked}
            mode={mode}
            setMode={setMode}
            hidden={hidden}
            setHidden={setHidden}
            /* NO FANFARE — same 13 Sep ruling. This is the START button: it
               celebrated a run before a single verb had been typed. */
            startDrill={() => setScreen("drill")}
            canDrill={!!queue && queue.length > 0}
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
 * The conjugation table — the page's main event (Dan, 2026-09-11).
 *
 * It used to be `RewardTable`, shown only after the drill was finished. The
 * rename is not cosmetic: it is the whole instruction. A learner arrives here,
 * studies, and goes to the questions when they choose.
 *
 * WHAT IS OPEN AND WHAT IS FOLDED follows the collapse rule (2026-08-31): the
 * argument stays open, the apparatus collapses. The table is the argument. The
 * sentence banks, the verb picker and the questions are apparatus, and each
 * closed fold says what is behind it.
 */
function StudyTable({
  shown,
  score,
  sentences,
  setSentences,
  toggleVerb,
  picked,
  mode,
  setMode,
  hidden,
  setHidden,
  startDrill,
  canDrill,
}: {
  shown: ConjVerb[];
  score: { ok: number; total: number };
  sentences: Record<string, string[] | null>;
  setSentences: React.Dispatch<React.SetStateAction<Record<string, string[] | null>>>;
  toggleVerb: (id: string) => void;
  picked: string[];
  mode: ConjugaMode;
  setMode: (m: ConjugaMode) => void;
  hidden: boolean;
  setHidden: (h: boolean) => void;
  startDrill: () => void;
  canDrill: boolean;
}) {
  // The interleaved examples the table draws under each Subject+Verb. The
  // banks hold COMPLEMENTS ("de la musique"); the sentence is the spoken
  // Subject+Verb with one attached, which is the same string conjSpoken
  // already builds for the 🔊 — so what a learner reads and what they hear
  // cannot drift apart.
  const examples: Record<string, string[] | null> = {};
  for (const v of shown) {
    const bank = sentences[v.id];
    if (!bank) continue;
    examples[v.id] = v.forms.map((f, i) =>
      f === "—" ? "" : `${conjSpoken(i, f).replace(/^./, (c) => c.toUpperCase())} ${bank[i]}.`,
    );
  }
  const withBanks = shown.filter((v) => SENTENCE_BANKS[v.id]);
  const anyOpen = shown.some((v) => sentences[v.id]);

  return (
    <div>
      {score.total > 0 && (
        <p className="text-center text-lg font-black text-[color:var(--cahier-ink)]">
          🎉 ✓ {score.ok}/{score.total}
        </p>
      )}

      {/* THE CURATED PATH'S PUSH (14 Sep). ConjugaZone is step 6 of the
          mid-term path and the only step on it that drills a whole paradigm.
          Like ErroReview it draws no `ActivityUsher` and cannot — the compass
          is computed from a STOP, and ConjugaZone belongs to no stop — so the
          push is rendered here directly. Gated on a finished run for the same
          reason `sfx.stage()` is (verify660): the end of a run is not the
          start of one, and nothing may perform unasked.

          Found by WALKING the path in the built app. Every check was green and
          the walk still stalled, because the two screens that had to tick
          drew nothing at all. */}
      {score.total > 0 && <PathNext />}

      {/* TWO MODES ON A SWITCH (Dan, 2026-09-11: *"one for reveal the verb
          form, the other for typing it in. there should be a switch to toggle
          between those 2"*). */}
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="How to practise"
             className="inline-flex overflow-hidden rounded-lg border-2 border-[color:var(--cahier-ink)]">
          {(["reveal", "type"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m}
              /* The mode switch does NOT touch `hidden`. ConjugaTable reads
                 it only in REVEAL mode — a TYPE IT cell is a field either way
                 — so clearing it here was a no-op for the mode being entered
                 and a side effect on the one being left: with the table now
                 blanked on arrival, a trip through TYPE IT and back would
                 have returned a learner to a fully revealed table they never
                 asked to reveal. */
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-[color:var(--cahier-ink)] ${
                mode === m ? "bg-[color:var(--cahier-ink)] font-bold text-white" : "bg-white font-semibold"
              }`}>
              {m === "reveal" ? "REVEAL" : "TYPE IT"}
            </button>
          ))}
        </div>
        {mode === "reveal" && (
          <button type="button" onClick={() => setHidden(!hidden)}
            className={`cahier-btn cahier-btn-sm ${hidden ? "cahier-btn-primary" : ""}`}>
            {hidden ? "SHOW CONJUGATIONS" : "HIDE CONJUGATIONS"}
          </button>
        )}
      </div>
      <p className="mt-1 text-[color:var(--cahier-ink-soft)]" style={{ fontSize: "var(--fs-micro)" }}>
        {mode === "type"
          ? "Type each form where it belongs, then Check."
          : hidden
          ? "Tap a hidden cell to reveal it."
          : "Tap HIDE CONJUGATIONS, then reveal them one at a time."}
      </p>

      <div className="mt-2">
        <ConjugaTable verbs={shown} examples={examples} mode={mode} hidden={hidden} />
      </div>

      {/* THE QUESTIONS COME AFTER THE TABLE, and they are Dan's word for the
          drill this page used to open on. */}
      {canDrill && (
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={startDrill} className="cahier-btn cahier-btn-primary">
            Questions →
          </button>
        </div>
      )}
      {/* THE SENTENCE BANKS, FOLDED. Dan, 2026-07-21: *"what is genuinely
          missing from ConjugaZone is the possibility to hear the conjugations
          in simple complete sentences."* They still exist and still speak;
          what changed is where they are read — a drawn bank now prints its
          sentence UNDER its own Subject+Verb inside the table (the `examples`
          prop above), which is Dan's *"intercalé line right after each
          SubjectVerb combo"*, instead of as a separate list below it.

          Folded, with a count, per the collapse rule — the closed summary has
          to say what is behind it or nobody opens it. */}
      {withBanks.length > 0 && (
        <details className="mt-4" open={anyOpen}>
          <summary className="cursor-pointer font-semibold text-[color:var(--cahier-ink)]"
                   style={{ fontSize: "var(--fs-small)" }}>
            Example sentences — {withBanks.length} of these verbs {withBanks.length === 1 ? "has" : "have"} them
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {withBanks.map((v) => (
              <button key={v.id} type="button" lang="fr"
                onClick={() => setSentences((m) => ({
                  ...m, [v.id]: m[v.id] ? null : drawComplements(v),
                }))}
                className={`cahier-btn cahier-btn-sm ${sentences[v.id] ? "cahier-btn-primary" : ""}`}>
                🎲 {v.inf}
              </button>
            ))}
          </div>
          <p className="mt-1 text-[color:var(--cahier-ink-soft)]" style={{ fontSize: "var(--fs-micro)" }}>
            Each sentence appears under its own form in the table. Tap again for another set;
            the 🔊 beside a form reads the whole phrase either way.
          </p>
        </details>
      )}

      {/* The verb picker — dropdowns per group, chips to drop. Apparatus, so
          it is folded and its summary carries the count (collapse rule). */}
      <details className="mt-4">
        <summary className="cursor-pointer font-semibold text-[color:var(--cahier-ink)]"
                 style={{ fontSize: "var(--fs-small)" }}>
          Choose verbs — {shown.length} on the table, {VERBS.length} to pick from
        </summary>
      <div className="mt-2">
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
      </details>
    </div>
  );
}
