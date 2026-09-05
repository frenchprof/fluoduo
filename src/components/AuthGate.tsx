"use client";

/**
 * Learning-activity gate (Dan, 2026-07-03: "feedback can remain anonymous but
 * engaging in any learning activity cannot"). Wrap any pretest / practice /
 * game / reviser surface in this: signed-in learners see it, everyone else gets
 * a Google sign-in prompt. Feedback (the floating button) is deliberately NOT
 * gated.
 *
 * NEVER CLAIM SIGNED-OUT WITHOUT EVIDENCE (Dan, 2026-08-28: "i log in once
 * with the switch button at the home page, then i am asked to log in again at
 * the other pages").
 *
 * useAuthUser has three states, and the old fail-safe collapsed two of them:
 * after 4s it fell through to the sign-in prompt whether auth had answered
 * `null` (really signed out) or had not answered at all. A signed-in learner
 * whose restore ran long was therefore TOLD they were signed out and asked to
 * authenticate again. Home hides this — it is the one surface with no gate —
 * which is exactly why the fault looked like "everywhere except Home".
 *
 * Reproduced by hanging the auth persistence read: the prompt appeared at
 * 4.6s with no answer from auth at all.
 *
 * So the timeout no longer decides anything. `null` is a verdict and prompts
 * at once; `undefined` is not, and shows a waiting state that keeps listening
 * and passes through the moment auth answers. A sign-in button still appears
 * beside it after the grace period, because a learner must never be stuck —
 * but it is offered, not asserted, and the words say which is which.
 */

import { useEffect, useState } from "react";
import { useAuthUser, signInWithGoogle } from "@/lib/firebase/auth";
import { REQUIRE_SIGN_IN } from "@/lib/authConfig";

export default function AuthGate({
  children,
  what = "practise",
  compact = false,
}: {
  children: React.ReactNode;
  /** Verb shown in the prompt, e.g. "practise", "take the pre-test". */
  what?: string;
  /** Inline/popup use: a small prompt instead of the full-screen one. */
  compact?: boolean;
}) {
  const user = useAuthUser(); // undefined = resolving, null = signed out
  const [waited, setWaited] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 4000);
    return () => window.clearTimeout(t);
  }, []);

  // Wall suspended (dev) or already signed in → pass straight through.
  if (!REQUIRE_SIGN_IN || user) return <>{children}</>;

  // `undefined` means auth has not answered. That is NOT a signed-out verdict,
  // and the gate must not turn it into one — it keeps listening, and the
  // moment auth answers with a user the branch above passes straight through.
  const resolving = user === undefined;
  if (resolving && !waited) {
    return (
      <div className={`flex ${compact ? "py-6" : "min-h-[40vh]"} items-center justify-center text-sm text-[color:var(--fluo-ink-soft)]`}>
        Checking your sign-in…
      </div>
    );
  }

  async function go() {
    setBusy(true);
    setError(false);
    try {
      await signInWithGoogle();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={compact ? "" : "mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center"}>
      <div className={`w-full rounded-2xl border-2 bg-[var(--fluo-card)] shadow-sm ${compact ? "p-4 text-center" : "p-6"}`} style={{ borderColor: "var(--fluo-line)" }}>
        <div className={compact ? "text-2xl" : "text-4xl"} aria-hidden>{resolving ? "⏳" : "🔒"}</div>
        <h1 className={`fluo-serif mt-1 font-black text-[color:var(--fluo-ink)] ${compact ? "text-base" : "mt-2 text-xl"}`}>
          {resolving ? "Checking your sign-in…" : `Sign in to ${what}`}
        </h1>
        {!compact && (
          <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">
            {resolving
              ? "Taking longer than usual. If you are already signed in, it will open by itself."
              : "Your work is saved to your account."}
          </p>
        )}
        <button type="button" onClick={go} disabled={busy} className="fluo-btn fluo-btn-sm mt-3 w-full disabled:opacity-50">
          {busy ? "Signing in…" : resolving ? "Sign in anyway" : "Continue with Google"}
        </button>
        {error && <p className="mt-2 text-xs font-bold text-rose-600">Sign-in didn&rsquo;t complete — please try again.</p>}
        {/* Back = where you CAME FROM (2026-08-24): the hard "/" href dropped
            a learner who arrived from a stop's sheet onto Home instead of
            back at the sheet. history.back() when there is history; / else. */}
        {!compact && (
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) window.history.back();
              else window.location.assign("/");
            }}
            className="mt-3 inline-block text-xs font-bold text-[color:var(--fluo-ink-soft)] hover:underline"
          >
            ← Back to the path
          </button>
        )}
      </div>
    </div>
  );
}
