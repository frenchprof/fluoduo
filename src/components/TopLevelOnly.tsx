"use client";

/**
 * What belongs to the APP, not to a station running inside it.
 *
 * Dan, 2026-09-07: *"EVERYTHING (LIKE THE MAP) MUST NOW RUN WITHIN THE CAHIER
 * PAGES IN IFRAMES (EMBEDDED)"*. A framed station is a second DOCUMENT of this
 * same app, so it boots the same root layout — and that layout carries things
 * that must happen once per page and not twice:
 *
 *   PageViewTracker   would log two views for every station a learner opens,
 *                     which is a course's analytics, not a cosmetic bug
 *   ProgressSync      would run two Firestore syncs per page
 *   RewardToast       a level-up would animate inside the box AND around it
 *   XpFloat           the same +20, twice, in two coordinate systems
 *   FeedbackButton    two floating bubbles, one on top of the other — visible
 *   BetaNotice        the sheet reappears inside the frame after dismissal
 *   InstallPrompt     an install banner inside a 720px box
 *
 * The existing `.fluo-embed` rule hides the FURNITURE with CSS, and its own
 * note says why that is not enough: *"`display: none` on a <script> or on the
 * render-nothing helpers (ProgressSync, PageViewTracker, KeyNav) changes
 * nothing: scripts still run"*. Hidden is not unmounted. This unmounts.
 *
 * WHAT STAYS IN A FRAME, deliberately: RailSwipe, because a finger inside the
 * frame is the only finger there is and the rail has to read it; and AccentBar,
 * which paints the learner's own accent colour and would leave the station
 * looking like a different app without it.
 *
 * DECIDED AFTER MOUNT, not during render. The prerendered HTML cannot know
 * whether it will end up in a frame — this is a static export, one file served
 * to both — so rendering the children on the first pass and dropping them on
 * the second is what keeps hydration honest. The cost is that a top-level page
 * mounts these one tick later than before, which nothing here is sensitive to.
 */
import { useEffect, useState, type ReactNode } from "react";

export default function TopLevelOnly({ children }: { children: ReactNode }) {
  const [framed, setFramed] = useState(false);
  useEffect(() => {
    // Cross-origin framing throws on `window.top`; if we cannot tell, assume
    // we are framed — a duplicate is worse than a missing floating button.
    let inFrame = true;
    try { inFrame = window.self !== window.top; } catch { inFrame = true; }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- cannot be known during render on a static export, see above
    setFramed(inFrame);
  }, []);
  if (framed) return null;
  return <>{children}</>;
}
