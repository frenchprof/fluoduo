"use client";

/**
 * The front door decides who it is for (Dan, 6 Sep 2026): "/" shows the
 * LANDING to a visitor who is not signed in and has no local progress; a
 * signed-in learner — or anyone whose device already carries progress — goes
 * straight to today's Home, unchanged.
 *
 * WHY A CLIENT GATE AND NOT TWO ROUTES. The app is `output: "export"` — the
 * server cannot see who is asking, so one prerendered page must serve both.
 * The prerender therefore paints NEITHER view (a bare paper ground, one
 * hydration frame), because painting Home first would flash a stranger past
 * the landing and painting the landing first would flash marketing at a
 * learner who opens this page every day. The decision is synchronous on
 * mount — two localStorage reads — so the blank frame is exactly that.
 *
 * WHO COUNTS AS A LEARNER, cheapest evidence first:
 *   1. `fluolingo:progress` exists    → they have worked here. Home.
 *   2. `fluolingo:entered` exists     → they pressed Start learning once
 *      (or signed in) on this device. Home. A DEVICE PREFERENCE, deliberately:
 *      clearLocalLearnerData wipes learner data on sign-out but keeps device
 *      preferences, so signing out does not dump a learner onto marketing.
 *   3. auth answers with a user       → a learner on a fresh device. The
 *      landing may already be up while Firebase resolves (a stranger must not
 *      wait seconds for a wall of nothing); the moment auth answers, Home
 *      takes over and the flag is stamped so the detour never repeats.
 *   4. localStorage unreadable        → we cannot tell a stranger from a
 *      learner, and hiding the app from a learner is the worse error. Home.
 */

import { useEffect, useState } from "react";
import { useAuthUser } from "@/lib/firebase/auth";
import Landing from "./Landing";

/** Device flag: this browser has chosen to enter the app before. */
const ENTERED_KEY = "fluolingo:entered";

export default function RootGate({ children }: { children: React.ReactNode }) {
  // undefined until mounted — the prerender and the first client render agree
  // on the bare ground, then the mount effect resolves in the same frame.
  const [view, setView] = useState<"landing" | "home" | undefined>(undefined);
  const user = useAuthUser(); // undefined = resolving, null = signed out

  useEffect(() => {
    // localStorage cannot be read during render (static export — the first
    // client render must match the prerender), so the gate seeds here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView(() => {
      try {
        if (
          window.localStorage.getItem("fluolingo:progress") ||
          window.localStorage.getItem(ENTERED_KEY)
        ) {
          return "home";
        }
        return "landing";
      } catch {
        return "home"; // storage blocked — never wall a learner out (rule 4)
      }
    });
  }, []);

  // A signed-in answer stamps the device so the next visit skips the landing
  // without waiting for auth (rule 3). The view itself is DERIVED below —
  // no second setState, the render just reads `user`.
  useEffect(() => {
    if (user) {
      try {
        window.localStorage.setItem(ENTERED_KEY, "1");
      } catch {}
    }
  }, [user]);

  // Auth resolved to a signed-in learner while the landing was up: Home wins.
  const shown = view === "landing" && user ? "home" : view;

  if (shown === "landing") {
    return (
      <Landing
        onStart={() => {
          try {
            window.localStorage.setItem(ENTERED_KEY, "1");
          } catch {}
          setView("home");
        }}
      />
    );
  }

  if (shown === "home") return <>{children}</>;

  // One unhydrated/unresolved frame: the paper ground, nothing learner-specific.
  return <div className="min-h-screen" style={{ background: "var(--cahier-desk)" }} aria-hidden />;
}
