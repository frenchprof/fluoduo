"use client";

/**
 * Learning-activity gate (Dan, 2026-07-03: "feedback can remain anonymous but
 * engaging in any learning activity cannot"). Wrap any pretest / practice /
 * game / reviser surface in this: signed-in learners see it, everyone else gets
 * a Google sign-in prompt. Feedback (the floating button) is deliberately NOT
 * gated.
 *
 * Fail-safe: if auth doesn't resolve within a few seconds (misconfig / offline),
 * we fall through to the sign-in prompt rather than an infinite spinner, so a
 * learner is never trapped on a blank screen.
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
  const [timedOut, setTimedOut] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), 4000);
    return () => window.clearTimeout(t);
  }, []);

  // Wall suspended (dev) or already signed in → pass straight through.
  if (!REQUIRE_SIGN_IN || user) return <>{children}</>;
  if (user === undefined && !timedOut) {
    return (
      <div className={`flex ${compact ? "py-6" : "min-h-[40vh]"} items-center justify-center text-sm text-[color:var(--fluo-ink-soft)]`}>
        Loading…
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
        <div className={compact ? "text-2xl" : "text-4xl"} aria-hidden>🔒</div>
        <h1 className={`fluo-serif mt-1 font-black text-[color:var(--fluo-ink)] ${compact ? "text-base" : "mt-2 text-xl"}`}>Sign in to {what}</h1>
        {!compact && (
          <p className="mt-1 text-sm text-[color:var(--fluo-ink-soft)]">
            Learning activities are saved to your account. Use your Google account to continue.
          </p>
        )}
        <button type="button" onClick={go} disabled={busy} className="fluo-btn fluo-btn-sm mt-3 w-full disabled:opacity-50">
          {busy ? "Signing in…" : "Continue with Google"}
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
