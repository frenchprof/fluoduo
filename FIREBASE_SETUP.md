# FLUOLINGO — Firebase setup (your manual steps)

The code is wired to project **frenchfluolingo**. Three things only you can do in the
Firebase Console before the data layer works live:

## 1. Enable Google sign-in
Console → **Authentication** → Get started → **Sign-in method** → enable **Google** →
set a support email → Save.

## 2. Create the Firestore database
Console → **Firestore Database** → Create database → **Native mode** → pick a location
(e.g. `asia-southeast1`, closest to Singapore) → start in test mode (we replace rules in step 3).

## 3. Deploy the security rules
Console → **Firestore Database** → **Rules** tab → paste the contents of `firestore.rules`
(in the repo root) → **Publish**. Do this BEFORE any real student uses it — test mode is open
to the world.

## 4. (Optional, recommended on Spark) App Check
Console → **App Check** → register the Web app with reCAPTCHA. Protects your daily quota from abuse.
Can be added any time.

---

## What's already built (code)
- `src/lib/firebase/client.ts` — app init (your public config is in here; it's safe to commit).
- `src/lib/firebase/auth.ts` — `signInWithGoogle()`, `signOut()`, `useAuthUser()` hook.
- `src/lib/firebase/collections.ts` — CRUD for user-created decks.
- `src/lib/firebase/srs.ts` — synced spaced-repetition state + scheduler.
- `src/lib/firebase/usage.ts` — `logEvent()` telemetry (signed-in users only).
- `src/lib/collections/loadCollections.ts` — the one read path: bundled curated + Firestore user decks.
- `src/content/collections/index.ts` — bundled curated decks (zero Firestore reads).

## Spark-plan design notes
- Curated decks ship as bundled JSON → browsing your content costs **0** Firestore reads.
- Only user decks, SRS, and events touch Firestore.
- **No Cloud Functions** (Blaze-only) — all writes are client-side; nothing here needs Functions.

## Run
`npm install` (firebase ^12 is now in package.json), then `npm run dev`.
