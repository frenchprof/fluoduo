/**
 * Firebase client init (browser-only; safe for Next static export).
 *
 * The values here are PUBLIC by design — a Firebase web apiKey is a project
 * identifier shipped to every browser, not a secret. Security is enforced by
 * Firestore Security Rules (see firestore.rules), not by hiding this config.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

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

// App Check (Dan, 2026-07-10: restrict the API door without adding login
// friction). reCAPTCHA v3 attests the page invisibly — no puzzles, no login
// change — and Firestore can then reject requests that didn't come from the
// real site (config-copied scripts, curl). Activates only when the site key
// env var is set at build time, so previews and local dev are unaffected.
// Keep Firestore enforcement OFF in the Firebase console until App Check
// metrics show ~100% verified traffic (the legacy laf1201 sites share this
// project and must be attested too before enforcing).
const APPCHECK_KEY = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_KEY;
if (typeof window !== "undefined" && APPCHECK_KEY) {
  void import("firebase/app-check").then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(APPCHECK_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    } catch {
      // Already initialised (hot reload) or provider hiccup — the app still
      // works; requests just go out unattested.
    }
  });
}

export const auth: Auth = getAuth(app);
// db lives in ./db — see that file for why it must NOT be exported from here.

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
