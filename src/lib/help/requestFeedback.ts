/**
 * Ask /api/feedback for open-production feedback — and never make the
 * learner wait for it (Track D, row 7). 8 s budget, then the rule-based
 * grader (feedback.ts) answers; same when offline, on any non-200, or when
 * the function is not configured (503). The verdict the learner sees is
 * always in the same shape; `source` says who produced it.
 *
 * Client-side only. The API key lives in the Pages Function's env — nothing
 * here knows it (verify28 checks no key string reaches src/).
 */
import { isFeedback, ruleFeedback, type Feedback, type FeedbackRequest } from "./feedback";

export const FEEDBACK_TIMEOUT_MS = 8_000;

export async function requestFeedback(req: FeedbackRequest, opts: { timeoutMs?: number; fetchImpl?: typeof fetch } = {}): Promise<Feedback> {
  const started = Date.now();
  const f = opts.fetchImpl ?? (typeof fetch === "function" ? fetch : null);
  const fallback = () => ruleFeedback(req);
  let out: Feedback;
  if (!f || (typeof navigator !== "undefined" && navigator.onLine === false)) {
    out = fallback();
  } else {
    const ctl = typeof AbortController === "function" ? new AbortController() : null;
    const timer = ctl ? setTimeout(() => ctl.abort(), opts.timeoutMs ?? FEEDBACK_TIMEOUT_MS) : null;
    try {
      const r = await f("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req),
        signal: ctl?.signal,
      });
      if (!r.ok) throw new Error(`upstream-${r.status}`);
      const data: unknown = await r.json();
      out = isFeedback(data) ? data : fallback();
    } catch {
      out = fallback();
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  // Research log: one event per request, whichever source answered.
  void import("@/lib/firebase/usage")
    .then((m) =>
      m.logEvent("feedback.request", {
        surface: req.task,
        mode: req.mode ?? "correct",
        source: out.source,
        verdict: out.verdict,
        errors: out.errors.length,
        ms: Date.now() - started,
      }),
    )
    .catch(() => {});
  return out;
}
