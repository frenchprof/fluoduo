<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dan's litmus test — permanent design rule (2026-07-02)

**Any TEXT that, when removed, does not prevent the user from finding the
correct answer is REDUNDANT — remove it.** Scope is text ONLY — section
labels, context blurbs, grammar badges, inline explanation prose.
Clarified by Dan the same day:
- Decorative/visual elements (tiles, borders, colours, icons) serve the
  visual and are EXEMPT.
- Progress counters (answered/score) are useful learner feedback — keep.
- Per-question explanations are offered behind a "WHY" button at the top
  right of an answered question — available on demand, never inline by
  default.

## Cursor Cloud specific instructions

FluoLingo is a single Next.js 16 (Turbopack, App Router) app. Dependencies are
plain npm (`package-lock.json`); the update script runs `npm ci`. Node 22 is
used in CI.

- Run/dev/build/lint/typecheck: use the `package.json` scripts — `npm run dev`
  (http://localhost:3000), `npm run build`, `npm run lint`. Typecheck with
  `npx tsc --noEmit`. `npm run lint` currently reports pre-existing errors
  (mostly `react-hooks/set-state-in-effect`); CI (`.github/workflows/verify.yml`)
  does NOT run lint — it runs `tsc --noEmit`, `npm run build`, then the Python
  checks `verify/verify18.py` and `verify/verify19.py`. `tsc --noEmit` is clean.
- Auth gate: learning activities (pretest / practice / Flip It / games / mark-as-done)
  are gated behind Google sign-in via `REQUIRE_SIGN_IN` in `src/lib/authConfig.ts`.
  To test those activities locally without real Google auth, set it to `false`
  temporarily and do NOT commit that change (re-enable `true` before finishing).
  Local-first features (browsing, notes) work without sign-in.
- `next.config.ts` uses `output: "export"` (static export) and a `PAGES_BASE_PATH`
  env var only for the GitHub Pages preview; leave it unset for normal dev/build.
- `functions/api/*` are Cloudflare Pages Functions (ChaTutor, TTS, Compose check,
  `/api/correct`) — server-side, not part of `next dev`; those endpoints won't run
  locally.
