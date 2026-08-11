"use client";

/**
 * Unit 0's special home-page treatment — two even rows of 5 tiles (no
 * Situations 1/2/3 exist for Unit 0). Clicking a tile opens the shared
 * SioModal, body = one merged Can-Do+competence sentence (no section
 * labels, per Dan 2026-07-01: "STICK TO THE ESSENTIALS. SHORT AND SWEET.
 * EFFICIENT") followed by that SIO's MCQs — or, for SIO-010, a note that
 * it's a mini-oral simulation done in class (no online questions).
 *
 * "Also try" game chips (Letris/Match It) show if a deck exists for the SIO
 * — Dan asked for Days/Numbers/Colors → Match It and the un/une article SIO
 * → Letris specifically, but none of those 4 have a wired deck yet (that's
 * new content to author, not a quick fix) — DEFERRED, flagged in the
 * handoff doc, not silently dropped.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { sfx } from "@/games/audio/sfx";
import { speak } from "@/games/letris/speech";
import { SIOS, sioStatement } from "@/content/sios";
import { lessonsForSio } from "@/content/lessons";
import { CURATED } from "@/content/collections";
import { UNIT0_QUESTIONS, type Unit0Question } from "@/content/sios/unit0-questions";
import { getAtelier } from "@/content/ateliers";
import { useChoiceKeys } from "@/lib/useChoiceKeys";
import AuthGate from "@/components/AuthGate";
import SioModal, { popupActivityTabs } from "./SioModal";
import { AfterPretest } from "./SioDetail";
import DialoguePlayer from "./DialoguePlayer";
import MarkDoneButton from "./sio/[id]/MarkDoneButton";
import SioObjective from "@/components/SioObjective";

const UNIT0_SIOS = SIOS.filter((s) => s.unit === 0);

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function Unit0Panel() {
  // (The forceOpen prop died with patch 22 — no route pre-opens this popup
  // any more; the lesson URLs render the full-screen pager instead.)
  const [openId, setOpenId] = useState<string | null>(null);
  const openSio = openId ? UNIT0_SIOS.find((s) => s.id === openId) : undefined;

  // Deep link: /unit/0#SIO-00X opens that popup — the home learning path links
  // Unit-0 SIOs this way. UnitSection's generic popup body has no Unit-0 MCQs
  // (that popup opened EMPTY, Dan's 2026-07-05 bug report), so unit 0's hash
  // handling lives here where the questions are.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && UNIT0_SIOS.some((s) => s.id === hash)) setOpenId(hash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The pink "Unité 0" header + done-counter is rendered by SioHub's collapse
  // header (same as Units 1–4); this panel is just the tile grid — no second
  // header of its own.
  return (
    <div className="fluo-h-0">
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3">
        {UNIT0_SIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setOpenId(s.id)}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-[var(--fluo-card)] p-3 text-center transition hover:-translate-y-0.5"
            style={{ borderColor: "var(--fluo-card-accent)" }}
          >
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-black text-[color:var(--fluo-ink)]"
              style={{ background: "var(--fluo-card-tint)", borderColor: "var(--fluo-card-accent)" }}
            >
              {String(s.num).padStart(2, "0")}
            </span>
            {s.isProduction && s.id !== "SIO-010" && (
              <span className="fluo-label text-[9px]" style={{ color: "var(--fluo-card-accent)" }}>
                atelier
              </span>
            )}
            <span className="fluo-readable line-clamp-2 text-xs font-bold leading-tight text-[color:var(--fluo-ink)]">{s.topic}</span>
          </button>
        ))}
      </div>

      {openSio && (
        <SioModal
          sio={openSio}
          onClose={() => setOpenId(null)}
          deck={openSio.collectionId ? CURATED.find((c) => c.id === openSio.collectionId) : undefined}
          tabs={popupActivityTabs(
            openSio.collectionId ? CURATED.find((c) => c.id === openSio.collectionId) : undefined,
            // Unit-0 questions render inline right here → Pre-Test is the
            // popup's active flap, matching the Units 1-4 popups.
            !openSio.isProduction && (UNIT0_QUESTIONS[openSio.id] ?? []).length > 0
              ? { inline: true, href: null }
              : undefined,
          )}
        >
          <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
            <span className="fluo-hl">{sioStatement(openSio)}</span>
          </p>
          <SioObjective id={openSio.id} />

          {openSio.id === "SIO-010" ? (
            <DialoguePlayer lines={getAtelier(openSio.id) ?? []} />
          ) : openSio.isProduction ? (
            <div className="rounded-xl border-2 border-dashed p-3" style={{ borderColor: "var(--fluo-card-accent)" }}>
              <p className="text-sm text-[color:var(--fluo-ink-soft)]">
                🗣️ A mini-oral simulation done in class with your instructor — no online questions here.
              </p>
            </div>
          ) : (
            <AuthGate what="try these" compact>
              <Unit0Questions sio={openSio} />
            </AuthGate>
          )}

          {/* Lesson buttons: bottom only, and (for question SIOs) only after
              every question is answered — pretest first (Dan, 2026-07-05). */}
          {lessonsForSio(openSio.id).length > 0 && (() => {
            const chips = (
              <div className="mt-4 flex flex-wrap gap-2">
                {lessonsForSio(openSio.id).map((l) => (
                  <Link key={l.slug} href={`/lessons/${l.slug}`} className="fluo-btn fluo-btn-sm inline-flex">
                    🎲 {l.title}
                  </Link>
                ))}
              </div>
            );
            return openSio.isProduction ? chips : <AfterPretest>{chips}</AfterPretest>;
          })()}

          {/* Mark-as-done — Unit 0 popups were missing it while Units 1-4
              (UnitSection) had it, so Unit-0 goals could never be completed
              (Dan, 2026-07-05). */}
          <MarkDoneButton sioId={openSio.id} />
        </SioModal>
      )}
    </div>
  );
}

function Unit0Questions({ sio }: { sio: (typeof UNIT0_SIOS)[number] }) {
  // Fresh random question AND option order on every popup open (this
  // component mounts per open) — never the authored order. Activity modes
  // live on the popup's flap tabs, not in the body. Answers are held HERE
  // (not per-question) so the 1-N keys can answer the first unanswered
  // question and its options can wear the numeral chips — same behaviour
  // as the Units 1-4 pretest popup (Dan, 2026-07-16: "does not seem to be
  // the case in Unit 0").
  const [questions, setQuestions] = useState<Unit0Question[]>([]);
  const [picked, setPicked] = useState<Record<number, string>>({});
  useEffect(() => {
    const base = UNIT0_QUESTIONS[sio.id] ?? [];
    setQuestions(shuffle(base).map((q) => ({ ...q, options: shuffle(q.options) })));
    setPicked({});
  }, [sio.id]);

  const activeIdx = questions.findIndex((_, i) => picked[i] === undefined);

  function doPick(i: number, o: { v: string; ok: boolean }) {
    if (picked[i] !== undefined) return;
    const q = questions[i];
    setPicked((prev) => ({ ...prev, [i]: o.v }));
    if (o.ok) sfx.correct(); else sfx.wrong();
    if (o.ok) speak(ttsFor(q, o.v), "fr-FR");
    // All answered → post-pretest content (lesson button) may appear.
    if (Object.keys(picked).length + 1 === questions.length && questions.length > 0) {
      window.dispatchEvent(new CustomEvent("fluolingo:pretest-complete", { detail: { id: sio.id } }));
    }
  }

  const scrollToActive = () => {
    window.setTimeout(() => {
      document.querySelector("[data-u0q-active]")?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 60);
  };
  useChoiceKeys({
    count: activeIdx >= 0 ? questions[activeIdx]?.options.length ?? 0 : 0,
    enabled: activeIdx >= 0,
    onPick: (k) => {
      const q = questions[activeIdx];
      if (q && q.options[k]) {
        doPick(activeIdx, q.options[k]);
        scrollToActive();
      }
    },
    onNext: scrollToActive,
  });

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <div key={i} {...(i === activeIdx ? { "data-u0q-active": true } : {})}>
          <QuizQuestion q={q} picked={picked[i] ?? null} active={i === activeIdx} onPick={(o) => doPick(i, o)} />
        </div>
      ))}
    </div>
  );
}

/** The French to SPEAK on a correct pick: the question's own tts (colour
 *  mnemonics like "le feu rouge"), else the completed stem (bracketed framing
 *  stripped), else the bare option (letters say their French names). */
function ttsFor(q: Unit0Question, v: string): string {
  if (q.tts) return q.tts;
  if (q.stem) return q.stem.replace(/\[[^\]]*\]\s*/g, "").replace("___", v);
  return v;
}

function QuizQuestion({
  q,
  picked,
  active = false,
  onPick,
}: {
  q: Unit0Question;
  picked: string | null;
  /** The first unanswered question — the one the 1-N keys answer; only IT
   *  wears the numeral chips. */
  active?: boolean;
  onPick: (o: { v: string; ok: boolean }) => void;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const [showExample, setShowExample] = useState(false);
  // WHY appears only on a WRONG pick, and explains only why THAT choice is
  // wrong (Dan, 2026-07-02) — the why lives on the wrong option itself.
  const pickedOpt = picked !== null ? q.options.find((o) => o.v === picked) : undefined;
  const whyText = pickedOpt && !pickedOpt.ok ? pickedOpt.why : undefined;

  // First click = the answer (speaks the completed form when correct). Once
  // answered, every option stays playable: clicking any of them — including
  // the one already picked — speaks it (Dan, 2026-07-02: all letters
  // playable; a click reveals that letter's name).
  function tap(o: { v: string; ok: boolean }, answered: boolean) {
    if (!answered) onPick(o);
    else speak(o.v, "fr-FR");
  }

  // The "exemple" button appears once attempted (the mnemonic contains the
  // answer). Clicking reveals "le feu rouge — red traffic light" and speaks
  // the French phrase.
  const showExampleBtn = picked !== null && !!q.example;
  const pillCls = (on: boolean) =>
    `rounded-full border-2 px-2 py-0.5 text-[0.6rem] font-black tracking-wider transition ${
      on
        ? "border-[color:var(--fluo-ink)] bg-[color:var(--fluo-ink)] text-white"
        : "border-[color:var(--fluo-ink)] bg-white text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
    }`;

  return (
    <div className="relative rounded-xl border-2 bg-[var(--fluo-card)] p-3" style={{ borderColor: "var(--fluo-line)" }}>
      {(whyText || showExampleBtn) && (
        <div className="absolute right-2 top-2 flex gap-1.5">
          {showExampleBtn && (
            <button
              type="button"
              onClick={() => { setShowExample((v) => !v); speak(q.example!.fr, "fr-FR"); }}
              className={pillCls(showExample)}
            >
              EXEMPLE
            </button>
          )}
          {whyText && (
            <button type="button" onClick={() => setShowWhy((v) => !v)} className={pillCls(showWhy)}>
              WHY
            </button>
          )}
        </div>
      )}
      {/* Question and options share one row where they fit (Dan, 2026-07-02);
          the options travel as ONE group, so they wrap below the question as
          a unit instead of splitting across lines. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pr-9">
        {(q.stem || q.title || q.emoji) && (
          <span className="inline-flex items-center gap-1.5">
            {q.emoji && <span className="text-3xl leading-none" aria-hidden>{q.emoji}</span>}
            {(q.stem || q.title) && (
              <span
                className={`${q.stem ? "fluo-serif text-base" : "text-sm"} font-bold text-[color:var(--fluo-ink)]`}
                style={q.hue ? { color: q.hue, textShadow: "0 0 2px rgba(0,0,0,.45)" } : undefined}
              >
                {q.stem ?? q.title}
                {/* the reveal appears only once attempted — shown first it
                    leaks single-answer questions (Dan, 2026-07-02) */}
                {q.en && picked && (
                  <span className="ml-2 text-xs font-normal text-[color:var(--fluo-ink-soft)]" style={q.hue ? { textShadow: "none" } : undefined}>
                    ({q.en})
                  </span>
                )}
              </span>
            )}
          </span>
        )}
        <span className="flex flex-wrap items-center gap-2">
          {q.options.map((o, oi) => {
            const isPicked = picked === o.v;
            const showResult = picked !== null;
            // Strong, solid-fill contrast (Dan: "i cannot tell what is what if
            // everything is of the same color") — correct/wrong get a bold
            // fill + white text, not a pale tint on a similar border.
            const cls = !showResult
              ? "border-[color:var(--fluo-ink)] bg-[var(--fluo-card)] text-[color:var(--fluo-ink)] hover:bg-[var(--fluo-card-tint)]"
              : o.ok
                ? "border-[#178a4d] bg-[#178a4d] text-white"
                : isPicked
                  ? "border-[#c0392b] bg-[#c0392b] text-white"
                  : "border-[color:var(--fluo-line)] bg-transparent text-[color:var(--fluo-ink-soft)] opacity-40";
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => tap(o, showResult)}
                className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${cls}`}
              >
                {active && !showResult && oi < 9 && (
                  <span aria-hidden className="mr-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--fluo-ink)] text-[10px] font-black text-white">
                    {oi + 1}
                  </span>
                )}
                {o.v}
              </button>
            );
          })}
        </span>
      </div>
      {showExample && q.example && (
        <p className="mt-2 rounded-lg bg-white/70 p-2.5 text-xs text-[color:var(--fluo-ink)]">
          <span lang="fr" className="font-bold">{q.example.fr}</span>
          <span className="ml-1.5 text-[color:var(--fluo-ink-soft)]">— {q.example.en}</span>
        </p>
      )}
      {showWhy && whyText && (
        <p className="mt-2 rounded-lg bg-white/70 p-2.5 text-xs text-[color:var(--fluo-ink)]">{whyText}</p>
      )}
    </div>
  );
}
