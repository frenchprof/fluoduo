"use client";

/**
 * Account control for the top bar (Dan, 2026-07-05: there was no way to sign
 * out, or even to see who you're signed in as — a problem on shared class
 * devices). Also the one always-visible way to sign IN while the auth wall is
 * suspended. Signed out → « Se connecter »; signed in → an initialled chip
 * that opens a small menu with the account name + « Se déconnecter ».
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthUser, signInWithGoogle, signOut } from "@/lib/firebase/auth";
import StatsHelp from "@/components/StatsHelp";
import { defaultProgress, loadProgress, type Progress } from "@/lib/progress";
import { levelForXp, xpMultiplier } from "@/lib/economy";

export default function AccountButton() {
  const user = useAuthUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // The window shows the learner's live numbers (Dan, 2026-07-08: "clicking on
  // the user icon will bring up a floating window of the user's detailed info").
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  useEffect(() => {
    if (open) setProgress(loadProgress());
  }, [open]);

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
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-2xl border-2 border-[color:var(--cahier-ink)] bg-white p-3 shadow-2xl">
            <p className="truncate px-1 text-sm font-black text-[color:var(--cahier-ink)]">{label}</p>
            {(() => {
              const lvl = levelForXp(progress.xp);
              const mult = xpMultiplier(progress.streak);
              const pct = Math.round((lvl.into / lvl.span) * 100);
              return (
                <>
                  <p className="mt-1.5 px-1 text-xs font-bold text-[color:var(--cahier-ink-soft)]">
                    🎚️ Niveau {lvl.level} · {lvl.name}
                  </p>
                  <div className="mx-1 mt-1 h-2 overflow-hidden rounded-full border border-[color:var(--cahier-ink)]/40 bg-[color:var(--cahier-paper-2,#f4f1e4)]">
                    <span className="block h-full rounded-full bg-[color:var(--cahier-hl,#eaff00)]" style={{ width: `${Math.max(pct, 3)}%` }} />
                  </div>
                  <p className="px-1 pt-0.5 text-right text-[10px] font-bold text-[color:var(--cahier-ink-soft)]">{lvl.into}/{lvl.span} XP</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 px-1 text-xs font-bold text-[color:var(--cahier-ink)]">
                    <span>🔥 {progress.streak}{mult > 1 && <b className="text-rose-600"> ×{mult}</b>}</span>
                    <span>⭐ {progress.xp}</span>
                    <span>💎 {progress.gems}</span>
                    <span>🎖️ {progress.badges?.length ?? 0} badges</span>
                    <StatsHelp />
                  </div>
                </>
              );
            })()}
            <div className="mt-3 flex gap-1.5">
              <Link href="/profil" onClick={() => setOpen(false)} className="cahier-btn cahier-btn-sm flex-1 text-center">
                🎖️ Profil complet
              </Link>
              <button
                type="button"
                onClick={async () => { setOpen(false); try { await signOut(); } catch {} }}
                className="cahier-btn cahier-btn-sm"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
