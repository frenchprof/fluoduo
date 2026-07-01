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
  apiKey: "AIzaSyDtjiN51ce-r3Zng_gZEA5H1KRsT1UOQKA",
  authDomain: "frenchfluolingo.firebaseapp.com",
  projectId: "frenchfluolingo",
  storageBucket: "frenchfluolingo.firebasestorage.app",
  messagingSenderId: "461900593173",
  appId: "1:461900593173:web:7b08297355efe076a1761c",
  measurementId: "G-8TSHGN0WLC",
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
