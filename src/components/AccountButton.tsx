"use client";

/**
 * Account control for the top bar (Dan, 2026-07-05: there was no way to sign
 * out, or even to see who you're signed in as — a problem on shared class
 * devices). Also the one always-visible way to sign IN while the auth wall is
 * suspended. Signed out → « Se connecter »; signed in → an initialled chip
 * that opens a small menu with the account name + « Se déconnecter ».
 */
import { useState } from "react";
import { useAuthUser, signInWithGoogle, signOut } from "@/lib/firebase/auth";

export default function AccountButton() {
  const user = useAuthUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user === undefined) return null; // still resolving — show nothing yet

  if (!user) {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try { await signInWithGoogle(); } catch {} // redirect flow navigates away on mobile
          setBusy(false);
        }}
        className="cahier-btn cahier-btn-sm whitespace-nowrap disabled:opacity-60"
      >
        {busy ? "…" : "Se connecter"}
      </button>
    );
  }

  const label = user.displayName || user.email || "Mon compte";
  const initial = (user.displayName || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Mon compte"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[color:var(--cahier-ink)] bg-[color:var(--cahier-hl,#eaff00)] text-sm font-black text-[color:var(--cahier-ink)]"
      >
        {initial}
      </button>
      {open && (
        <>
          {/* click-away catcher */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border-2 border-[color:var(--cahier-ink)]/20 bg-white p-2 shadow-lg">
            <p className="truncate px-1 pb-2 text-xs font-bold text-[color:var(--cahier-ink-soft)]">{label}</p>
            <button
              type="button"
              onClick={async () => { setOpen(false); try { await signOut(); } catch {} }}
              className="cahier-btn cahier-btn-sm w-full"
            >
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  );
}
