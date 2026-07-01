/**
 * Authentication — Google sign-in only (students use their own Google accounts).
 * Logging in also records a usage event (telemetry for GALAXIM).
 */
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./client";
import { logEvent } from "./usage";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  const cred = await signInWithPopup(auth, provider);
  await logEvent("auth.signin", { method: "google" });
  return cred.user;
}

export async function signOut(): Promise<void> {
  await logEvent("auth.signout", {});
  await fbSignOut(auth);
}

/** React hook: current user (null = signed out, undefined = still resolving). */
export function useAuthUser(): User | null | undefined {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => onAuthStateChanged(auth, setUser), []);
  return user;
}
