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
import { SIOS, sioStatement } from "@/content/sios";
import { CURATED } from "@/content/collections";
import { UNIT0_QUESTIONS, type Unit0Question } from "@/content/sios/unit0-questions";
import { PracticeChips } from "./SioDetail";
import SioModal from "./SioModal";

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
  const [openId, setOpenId] = useState<string | null>(null);
  const openSio = openId ? UNIT0_SIOS.find((s) => s.id === openId) : undefined;

  return (
    <section className="fluo-h-0 mb-8">
      <div className="mb-5 rounded-2xl px-4 py-3" style={{ background: "var(--fluo-card-accent)" }}>
        <span className="text-2xl" aria-hidden>👋</span>{" "}
        <span className="fluo-serif text-lg font-black text-white">Unité 0</span>{" "}
        <span lang="fr" className="text-sm text-white/85">Bonjour, bienvenue, enchanté !</span>
      </div>

      <p className="mb-4 text-sm text-[color:var(--fluo-ink-soft)]">
        The 10 foundational objectives of French 1. Tap one to see it and try its questions.
      </p>

      <div className="grid grid-cols-5 gap-3">
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
            {s.isProduction && (
              <span className="fluo-label text-[9px]" style={{ color: "var(--fluo-card-accent)" }}>
                atelier
              </span>
            )}
            <span className="fluo-readable line-clamp-2 text-xs font-bold leading-tight text-[color:var(--fluo-ink)]">{s.topic}</span>
          </button>
        ))}
      </div>

      {openSio && (
        <SioModal sio={openSio} onClose={() => setOpenId(null)}>
          <p className="fluo-serif mb-4 text-base font-bold leading-snug text-[color:var(--fluo-ink)]">
            <span className="fluo-hl">{sioStatement(openSio)}</span>
          </p>

          {openSio.isProduction ? (
            <div className="rounded-xl border-2 border-dashed p-3" style={{ borderColor: "var(--fluo-card-accent)" }}>
              <p className="text-sm text-[color:var(--fluo-ink-soft)]">
                🗣️ A mini-oral simulation done in class with your instructor — no online questions here.
              </p>
            </div>
          ) : (
            <Unit0Questions sio={openSio} />
          )}
        </SioModal>
      )}
    </section>
  );
}

function Unit0Questions({ sio }: { sio: (typeof UNIT0_SIOS)[number] }) {
  // Fresh random question AND option order on every popup open (this
  // component mounts per open) — never the authored order.
  const [questions, setQuestions] = useState<Unit0Question[]>([]);
  useEffect(() => {
    const base = UNIT0_QUESTIONS[sio.id] ?? [];
    setQuestions(shuffle(base).map((q) => ({ ...q, options: shuffle(q.options) })));
  }, [sio.id]);
  const deck = sio.collectionId ? CURATED.find((c) => c.id === sio.collectionId) : undefined;

  return (
    <div className="space-y-3">
      {questions.map((q, i) => (
        <QuizQuestion key={i} q={q} />
      ))}
      {deck && (
        <div className="pt-1">
          <p className="fluo-label mb-2">Also try</p>
          <PracticeChips deck={deck} />
        </div>
      )}
    </div>
  );
}

function QuizQuestion({ q }: { q: Unit0Question }) {
  const [picked, setPicked] = useState<string | null>(null);

  return (
    <div className="rounded-xl border-2 bg-[var(--fluo-card)] p-3" style={{ borderColor: "var(--fluo-line)" }}>
      {q.title && <p className="mb-2 text-sm font-bold text-[color:var(--fluo-ink)]">{q.title}</p>}
      {q.stem && (
        <p className="fluo-serif mb-1 text-base font-bold text-[color:var(--fluo-ink)]">
          {q.stem}
          {q.en && <span className="ml-2 text-xs font-normal text-[color:var(--fluo-ink-soft)]">({q.en})</span>}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {q.options.map((o) => {
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
              disabled={showResult}
              onClick={() => setPicked(o.v)}
              className={`rounded-full border-2 px-3 py-1.5 text-sm font-bold transition ${cls}`}
            >
              {o.v}
            </button>
          );
        })}
      </div>
      {picked && q.explain && (
        <p className="mt-2 text-xs text-[color:var(--fluo-ink-soft)]">{q.explain}</p>
      )}
    </div>
  );
}
