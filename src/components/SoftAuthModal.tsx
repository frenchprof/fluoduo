"use client";

/**
 * Soft-auth for Class bag save / Continue (FINISH_BACKLOG items 2+3).
 *
 * NOT AuthGate. Never walls a SpecuLearn / pretest guess. EN-only copy is
 * locked in docs/CLASS_BAG.md — do not invent alternate CTAs.
 */
import { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase/auth";

export type SoftAuthProceed = "signed-in" | "without-saving";

export default function SoftAuthModal({
  open,
  onDone,
}: {
  open: boolean;
  onDone: (how: SoftAuthProceed) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  if (!open) return null;

  async function go() {
    setBusy(true);
    setError(false);
    try {
      const user = await signInWithGoogle();
      if (user) onDone("signed-in");
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="soft-auth-title"
    >
      <div
        className="w-full max-w-sm rounded-2xl border-2 bg-[var(--fluo-card)] p-5 text-center shadow-lg"
        style={{ borderColor: "var(--cahier-line-strong)", background: "var(--cahier-paper-raised)" }}
      >
        <h2 id="soft-auth-title" className="fluo-serif text-lg font-black text-[color:var(--cahier-ink)]">
          Sign in to keep this bag
        </h2>
        <button
          type="button"
          onClick={go}
          disabled={busy}
          className="fluo-btn fluo-btn-sm mt-4 w-full disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Continue with Google"}
        </button>
        {error && (
          <p className="mt-2 text-xs font-bold text-rose-600">
            Sign-in didn&rsquo;t complete — please try again.
          </p>
        )}
        <button
          type="button"
          onClick={() => onDone("without-saving")}
          className="mt-3 inline-block text-xs font-bold text-[color:var(--cahier-ink-soft)] hover:underline"
        >
          Keep going without saving
        </button>
      </div>
    </div>
  );
}
