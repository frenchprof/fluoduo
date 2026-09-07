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
import RankBadge from "@/components/RankBadge";
import { defaultProgress, loadProgress, type Progress } from "@/lib/progress";
import { levelForXp, nextFireMilestone, xpMultiplier } from "@/lib/economy";

export default function AccountButton() {
  const user = useAuthUser();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  // The window shows the learner's live numbers (Dan, 2026-07-08: "clicking on
  // the user icon will bring up a floating window of the user's detailed info").
  const [progress, setProgress] = useState<Progress>(defaultProgress());
  useEffect(() => {
    // Deliberate: progress lives in localStorage, which cannot be read
    // during render — the numbers are refreshed when the window opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        aria-label="Sign in"
        title="Sign in"
        className="cahier-btn cahier-btn-sm whitespace-nowrap disabled:opacity-60"
      >
        {/* SVG power icon (Dan, 2026-07-26): the ⏻ CHARACTER is missing or
            oversized in many phone fonts and overflowed to "…" — a drawn
            vector renders identically everywhere and scales to any width.
            Red = "power on" affordance; the words live in tooltip/aria. */}
        {busy ? (
          "…"
        ) : (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#dc2626" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" className="shrink-0">
            <path d="M12 3v8" />
            <path d="M6.2 6.2a8 8 0 1 0 11.6 0" />
          </svg>
        )}
      </button>
    );
  }

  const label = user.displayName || user.email || "My account";
  const initial = (user.displayName || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="My account"
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
              return (
                <>
                  {/* TWO LINES, PER DAN'S OWN MOCK (7 Sep, after the bar came
                      out): the rank pill and the level figure share a line,
                      and the stats compress to one row — fire, XP, gems,
                      badge count. A figure, not a bar (his 19 Aug and 22 Aug
                      rulings; the popover was the third surface to shed one).
                      The word "badges" goes by the litmus test — the medal
                      says it. The ladder's next rung moves to the fire's
                      tooltip: still named (gain-framed, what the next day
                      pays), no longer spending a line the mock does not have;
                      the top bar and the streak toast still say it in full. */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 px-1">
                    <RankBadge level={lvl.level} name={lvl.name} />
                    <span className="text-xs font-bold text-[color:var(--cahier-ink-soft)]">{lvl.into}/{lvl.span} XP</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 px-1 text-xs font-bold text-[color:var(--cahier-ink)]">
                    {(() => {
                      const next = nextFireMilestone(progress.streak);
                      return (
                        <span title={next ? `Day streak — day ${next.day} pays ×${String(next.mult).replace(".", ",")}` : "Day streak"}>
                          🔥 {progress.streak}
                          {mult > 1 && <b className="text-rose-600"> ×{String(mult).replace(".", ",")}</b>}
                        </span>
                      );
                    })()}
                    <span>⭐ {progress.xp}</span>
                    <span>💎 {progress.gems}</span>
                    <span>🎖️ {progress.badges?.length ?? 0}</span>
                    <StatsHelp />
                  </div>
                </>
              );
            })()}
            {/* Three compact doors (Dan, 2026-07-25): Profile · History → /moi
                · sign-out as a wave — labels shrunk so the row breathes. */}
            <div className="mt-3 flex gap-1.5">
              <Link href="/profil" onClick={() => setOpen(false)} className="cahier-btn cahier-btn-sm flex-1 text-center">
                🎖️ Profile
              </Link>
              <Link href="/moi" onClick={() => setOpen(false)} className="cahier-btn cahier-btn-sm flex-1 text-center">
                ⌛ History
              </Link>
              <button
                type="button"
                onClick={async () => { setOpen(false); try { await signOut(); } catch {} }}
                className="cahier-btn cahier-btn-sm"
                title="Sign out"
                aria-label="Sign out"
              >
                🚪➜
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
