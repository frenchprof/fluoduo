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

function preferRedirect(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia?.("(pointer: coarse)").matches) return true;
  } catch {}
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export async function signInWithGoogle(): Promise<User | null> {
  // Touch devices: redirect (navigates away; completes via getRedirectResult).
  if (preferRedirect()) {
    await signInWithRedirect(auth, provider);
    return null;
  }
  try {
    const cred = await signInWithPopup(auth, provider);
    await logEvent("auth.signin", { method: "google-popup" });
    return cred.user;
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code ?? "";
    // Popup blocked / closed / unsupported → fall back to redirect.
    if (/popup|cancelled|operation-not-supported/i.test(code)) {
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
