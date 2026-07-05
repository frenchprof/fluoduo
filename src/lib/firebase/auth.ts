/**
 * Authentication — Google sign-in only (students use their own Google accounts).
 * Logging in also records a usage event (telemetry for GALAXIM).
 *
 * Mobile-robust (Dan, 2026-07-05: sign-in wouldn't complete on the phone):
 * iOS Safari and many mobile browsers block or mishandle the OAuth *popup*, so
 * on touch devices we use the *redirect* flow instead, and complete it with
 * getRedirectResult when the app reloads after returning from Google. Desktop
 * keeps the popup, with a redirect fallback if the popup is blocked.
 */
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./client";
import { logEvent } from "./usage";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  // Popup FIRST, even on mobile. It works on iOS Safari when opened from a tap
  // and, unlike signInWithRedirect, isn't broken by Safari's cross-site
  // storage partitioning — redirect sent users through …firebaseapp.com and
  // came back signed-OUT to the locked page (Dan, 2026-07-05). Redirect stays
  // only as a fallback for when a popup is genuinely blocked.
  try {
    const cred = await signInWithPopup(auth, provider);
    await logEvent("auth.signin", { method: "google-popup" });
    return cred.user;
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code ?? "";
    // User dismissed the popup themselves → do nothing, don't bounce them to a
    // redirect they didn't ask for.
    if (/popup-closed-by-user|cancelled-popup-request|user-cancelled/i.test(code)) {
      return null;
    }
    // Popup truly unavailable (blocked / unsupported env) → redirect fallback.
    if (/popup-blocked|operation-not-supported/i.test(code)) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw e;
  }
}

// Runs once on load: if we just came back from a redirect sign-in, this
// resolves with the user and logs it (onAuthStateChanged also fires).
let redirectChecked = false;
async function completeRedirect(): Promise<void> {
  if (redirectChecked) return;
  redirectChecked = true;
  try {
    const cred = await getRedirectResult(auth);
    if (cred?.user) await logEvent("auth.signin", { method: "google-redirect" });
  } catch {
    // no pending redirect, or a benign error — ignore
  }
}

export async function signOut(): Promise<void> {
  await logEvent("auth.signout", {});
  await fbSignOut(auth);
  // Drop this device's local learner cache so the next person doesn't see —
  // or merge into their account — the previous user's progress/reviser data.
  const { clearLocalLearnerData } = await import("@/lib/progress");
  clearLocalLearnerData();
}

/** React hook: current user (null = signed out, undefined = still resolving). */
export function useAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    void completeRedirect();
    return onAuthStateChanged(auth, setUser);
  }, []);
  return user;
}
