"use client";

/**
 * Open-production feedback card (Track D, row 7). One prompt, one textarea,
 * two modes:
 *   · Correct me   — the learner writes first; errors come back as
 *                    ~~span~~ → fix chips, the WHY behind a button.
 *   · Model answer — the model is shown FIRST, then the learner writes and
 *                    is graded against it (assistance = "answer").
 * The verdict comes from /api/feedback (LLM) or, without waiting on the
 * network, from the rule-based grader — same shape either way
 * (src/lib/help/requestFeedback.ts). Every submission is one response
 * record with evidenceType "free" (recordResponse). No XP is paid here.
 */
import { useState } from "react";
import type { Feedback, FeedbackMode } from "@/lib/help/feedback";
import { requestFeedback } from "@/lib/help/requestFeedback";
import { recordResponse } from "@/lib/firebase/responses";
import { speak } from "@/games/letris/speech";

const VERDICT_UI: Record<Feedback["verdict"], { mark: string; label: string; ok: boolean }> = {
  correct: { mark: "✓", label: "Correct", ok: true },
  partial: { mark: "≈", label: "Almost", ok: false },
  wrong: { mark: "✗", label: "Not yet", ok: false },
  off_task: { mark: "!", label: "Not the task", ok: false },
};

export default function OpenFeedback({
  task,
  prompt,
  modelAnswer,
  outcomeId,
  activity,
  itemId,
}: {
  /** Short task id for the log ("lesson-write"). */
  task: string;
  /** What the learner is asked to write (English chrome, French target). */
  prompt: string;
  modelAnswer?: string;
  outcomeId?: string;
  activity: string;
  /** Response-store key. */
  itemId: string;
}) {
  const [mode, setMode] = useState<FeedbackMode>("correct");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [fb, setFb] = useState<Feedback | null>(null);
  const [whyOpen, setWhyOpen] = useState(false);
  const modelShown = mode === "model" && !!modelAnswer;

  async function submit() {
    const answer = value.trim();
    if (!answer || busy) return;
    setBusy(true);
    setWhyOpen(false);
    const out = await requestFeedback({ task, prompt, answer, model_answer: modelAnswer, mode });
    setFb(out);
    setBusy(false);
    recordResponse(itemId, out.verdict === "correct", {
      given: answer,
      activity,
      evidence: {
        outcomeId,
        evidenceType: "free",
        assistance: modelShown ? "answer" : "none",
        assistCount: modelShown ? 1 : 0,
        independent: !modelShown,
      },
    });
  }
  function again() {
    setFb(null); setValue(""); setWhyOpen(false);
  }

  const v = fb ? VERDICT_UI[fb.verdict] : null;

  return (
    <div className="open-feedback mx-auto w-full max-w-md rounded-2xl border-2 border-[color:var(--cahier-rule)] bg-white p-4 text-left">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-black text-[color:var(--cahier-ink)]">✍️ {prompt}</p>
        <div className="flex shrink-0 rounded-lg border-2 border-[color:var(--cahier-rule)] text-[0.65rem] font-black uppercase tracking-wider" role="tablist" aria-label="Feedback mode">
          {(["correct", "model"] as FeedbackMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => { setMode(m); setFb(null); }}
              className={`px-2 py-1 ${mode === m ? "bg-[color:var(--cahier-ink)] text-white" : "text-[color:var(--cahier-ink)]/70"}`}
            >
              {m === "correct" ? "Correct me" : "Model answer"}
            </button>
          ))}
        </div>
      </div>

      {modelShown && (
        <p lang="fr" className="mt-2 rounded-lg bg-[color:var(--cahier-hl)]/30 px-2 py-1 text-sm font-bold text-[color:var(--cahier-ink)]">
          {modelAnswer}
          <button type="button" onClick={() => speak(modelAnswer!, "fr-FR")} className="ml-2 opacity-70 hover:opacity-100" aria-label="Listen">🔊</button>
        </p>
      )}

      <textarea
        lang="fr"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!!fb || busy}
        rows={2}
        placeholder="…"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="cahier-answer mt-3 w-full resize-none"
      />

      {!fb ? (
        <button type="button" onClick={submit} disabled={!value.trim() || busy} className="cahier-btn cahier-btn-primary mt-3 w-full justify-center disabled:opacity-40">
          {busy ? "…" : "Check"}
        </button>
      ) : (
        <div className="mt-3 space-y-2" data-source={fb.source} data-verdict={fb.verdict}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-sm font-black ${v!.ok ? "text-[color:var(--drill-ok-ink)]" : "text-[color:var(--drill-bad-ink)]"}`}>
              {v!.mark} {v!.label}
            </span>
            {fb.errors.length > 0 && (
              <button type="button" onClick={() => setWhyOpen((o) => !o)} aria-expanded={whyOpen} className="cahier-btn cahier-btn-sm ml-auto !px-2 !py-0.5 text-[0.65rem] font-black uppercase tracking-wider">
                WHY
              </button>
            )}
          </div>
          {fb.errors.length > 0 && (
            <ul className="space-y-1">
              {fb.errors.map((e, k) => (
                <li key={k} lang="fr" className="text-sm text-[color:var(--cahier-ink)]">
                  <span className="text-[color:var(--drill-bad-ink)] line-through">{e.span}</span>
                  {e.fix && <> → <b>{e.fix}</b></>}
                  {whyOpen && <span lang="en" className="ml-2 text-xs opacity-70">{e.why}</span>}
                </li>
              ))}
            </ul>
          )}
          {fb.verdict !== "correct" && fb.model_answer && !modelShown && (
            <p lang="fr" className="text-sm text-[color:var(--cahier-ink)]">
              → <b>{fb.model_answer}</b>
              <button type="button" onClick={() => speak(fb.model_answer, "fr-FR")} className="ml-2 opacity-70 hover:opacity-100" aria-label="Listen">🔊</button>
            </p>
          )}
          {fb.next_hint && fb.verdict !== "correct" && whyOpen && (
            <p className="text-xs text-[color:var(--cahier-ink)]/70">{fb.next_hint}</p>
          )}
          <button type="button" onClick={again} className="cahier-btn mt-1 w-full justify-center">
            {fb.verdict === "correct" ? "Write another" : "Try again"}
          </button>
        </div>
      )}
    </div>
  );
}
