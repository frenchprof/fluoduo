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
            {/* THE CARD'S DOORS ARE ITS OWN PARTS (Dan, 7 Sep: "For profile -
                click on the name... we dont need history and exit buttons.
                those are in the user page. And put a on-off button + a
                setting button to the top right corner"). The button row went:
                the NAME is the Profile door, the LEVEL row is the history
                door, and the corner holds ⚙ Settings + the power icon. */}
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
              <Link
                href="/reglages"
                onClick={() => setOpen(false)}
                aria-label="Settings"
                title="Settings"
                className="fluo-hit44 grid h-7 w-7 place-items-center rounded-lg text-[15px]"
              >
                ⚙️
              </Link>
              <button
                type="button"
                onClick={async () => { setOpen(false); try { await signOut(); } catch {} }}
                aria-label="Sign out"
                title="Sign out"
                className="fluo-hit44 grid h-7 w-7 place-items-center rounded-lg"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#dc2626" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 3v8" />
                  <path d="M6.2 6.2a8 8 0 1 0 11.6 0" />
                </svg>
              </button>
            </div>
            <Link
              href="/profil"
              onClick={() => setOpen(false)}
              title="Profile"
              className="block truncate px-1 pr-16 text-sm font-black text-[color:var(--cahier-ink)] underline decoration-[color:var(--cahier-hl,#eaff00)] decoration-[3px] underline-offset-2"
            >
              {label}
            </Link>
            {(() => {
              const mult = xpMultiplier(progress.streak);
              const next = nextFireMilestone(progress.streak);
              const unit = levelForXp(progress.xp).level;
              /* THE CARD IS THREE COLUMNS (Dan, 7 Sep: "just a column of
                 icons a column of numbers and a word or two beside") — his
                 five quantities, in his order. Level is the 0-4 exponential
                 XP ladder (economy.ts); only the level NUMBER shows, never
                 an into/span figure, so exactly one XP figure remains on
                 this card. The level row inherits the pill's job as the
                 History door; the fire's next rung lives in its tooltip
                 (gain-framed, what the next day pays). */
              const num = "fluo-mono text-sm font-black tabular-nums text-[color:var(--cahier-ink)]";
              const word = "text-xs font-bold text-[color:var(--cahier-ink-soft)]";
              return (
                <div className="mt-2 grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2.5 gap-y-1 px-1">
                  <span aria-hidden title={next ? `Day ${next.day} pays ×${String(next.mult).replace(".", ",")}` : undefined}>🔥</span>
                  <span className={num}>{progress.streak}{mult > 1 && <b className="text-rose-600"> ×{String(mult).replace(".", ",")}</b>}</span>
                  <span className={word}>day streak</span>
                  <span aria-hidden>⭐</span>
                  <span className={num}>{progress.xp.toLocaleString()}</span>
                  <span className={word}>XP</span>
                  <span aria-hidden>💎</span>
                  <span className={num}>{progress.gems}</span>
                  <span className={word}>gems</span>
                  <span aria-hidden>🎖️</span>
                  <span className={num}>{progress.badges?.length ?? 0}</span>
                  <span className={word}>badges</span>
                  <span aria-hidden>🎚️</span>
                  <span className={num}>{unit}</span>
                  <span className={word}>
                    <Link href="/moi" onClick={() => setOpen(false)} title={`Level ${unit} of 4 — History`} className="fluo-hit44 underline decoration-[color:var(--cahier-hl,#eaff00)] decoration-2 underline-offset-2">
                      level
                    </Link>
                    {" "}<StatsHelp />
                  </span>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
