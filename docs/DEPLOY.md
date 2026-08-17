# Deploying FluoLingo

Production site: **fluolingo.withdrchan.com** (Cloudflare Pages project
`fluoguo`, also serving `fluoguo.pages.dev`; `fluolingo.com` 302-redirects to
the withdrchan URL).

> **fluolinguo.com is RETIRED** (2026-07-19). The domain has no DNS records and
> must not be referenced anywhere — links, docs, QR codes, Firebase authorised
> domains, or Pages custom domains. If it still appears as a custom domain on
> the `fluoguo` Pages project, remove it (dashboard → fluoguo → Custom domains).

## How it deploys

> **Which `main`?** Production is `dckg/fluo` (git remote `live`). Working repo is
> `frenchprof/fluoduo` (`origin`). Merging to origin's `main` does NOT deploy;
> **`git push live main` does.** See `docs/STATUS.md`.

Cloudflare Pages **auto-builds on every push to `main`** (`npm run build` →
`next build`, static export to `out/`, plus the `functions/` Pages Functions).
The site is a static export, so there is no server — only the `functions/api/*`
endpoints run server-side.

## To ship the latest code

**Just merge to `main`.** The auto-deploy builds the new `main` HEAD.

If you need to trigger a deploy by hand (e.g. after changing an environment
variable), in the Cloudflare dashboard use **Deployments → Create deployment →
branch `main`**.

### ⚠️ Do NOT "Retry deployment" to ship new code

"Retry deployment" on a row **rebuilds that row's exact old commit** — it does
NOT pull the latest `main`. Retrying an older row silently rolls the live site
back to that old code (Dan hit this 2026-07-05: retried #78 and lost the #79
deck fix). Retry is only for re-running a *failed* build of the commit you
actually want. To get the newest code, deploy `main` (merge, or Create
deployment), and check the build log's `HEAD is now at <sha>` line matches the
latest commit.

## Environment variables (Pages project → Settings → Environment variables)

- `ANTHROPIC_API_KEY` — powers the AI tutor (`functions/api/tutor.js`) and the
  AI café waiter (`functions/api/compose.js`). Applies to the **whole project**,
  so it covers every domain the project serves. **A change only takes effect on
  the next deploy** — redeploy after adding it. Without it, both features
  degrade gracefully (tutor shows a "pas encore branché" card; café falls back
  to its rule engine).

## Firebase

Firestore rules live in `firestore.rules` and are deployed separately via the
**Firebase console → Firestore → Rules** (paste + Publish). They are NOT part of
the Cloudflare build. The sign-in wall toggle is `REQUIRE_SIGN_IN` in
`src/lib/authConfig.ts` (code, ships with a normal deploy).

## Custom domain (the go-live cutover)

Adding `fluolingo.com` as a direct custom domain on this Pages project is the
final switch — today it 302-redirects to `fluolingo.withdrchan.com`, which is
the live student-facing URL. Do it last, after verifying the site on
`fluolingo.withdrchan.com`.
