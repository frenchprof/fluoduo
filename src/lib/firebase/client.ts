/**
 * Firebase client init (browser-only; safe for Next static export).
 *
 * The values here are PUBLIC by design — a Firebase web apiKey is a project
 * identifier shipped to every browser, not a secret. Security is enforced by
 * Firestore Security Rules (see firestore.rules), not by hiding this config.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEEhlkmXTcZ69etUNk2KJWngyp7meeP5M",
  authDomain: "laf1201.firebaseapp.com",
  projectId: "laf1201",
  storageBucket: "laf1201.firebasestorage.app",
  messagingSenderId: "84075254825",
  appId: "1:84075254825:web:5fe21c20a467fab977b838",
  measurementId: "G-DHK50S348X",
};

// Reuse the app across hot-reloads / re-imports.
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

/**
 * Analytics must only run in the browser and only where supported.
 * Call lazily from a client component effect; never at module top level
 * (it throws during static export / SSR).
 */
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  return (await isSupported()) ? getAnalytics(app) : null;
}
