# Deploying FluoLingo

**THERE ARE TWO LIVE SITES, both fed from `main`** (Dan, 2026-09-02, correcting
this document: *"two live sites, both fed from main … worth knowing which one
your students actually use"*):

| URL | Host | Built by | Path |
|---|---|---|---|
| **fluolingo.com** | GitHub Pages, `frenchprof/fluoduo` | `.github/workflows/pages-preview.yml`, on every push to main | domain ROOT |
| **fluolingo.withdrchan.com** | Cloudflare Pages, `fluolingo-dot-com` | `dckg/fluo`, which `deploy-live.yml` mirrors main into (manual dispatch) | domain ROOT |

The two are NOT equivalent and the difference is not cosmetic. GitHub Pages has
no server, so on **fluolingo.com** the four Cloudflare Pages Functions —
`/api/tutor`, `/api/tts`, `/api/correct`, `/api/compose` — do not exist, and
ChaTutor, text-to-speech and ComposeIt's answer-checking fail there. They work
on **fluolingo.withdrchan.com**. Everything else runs in the browser against
Firebase and works on both.

They also deploy on different triggers: fluolingo.com follows `main`
automatically, while withdrchan waits for someone to fire `deploy-live`. So the
two can be, and routinely are, on different commits.

> **WHAT THIS SECTION USED TO SAY, and what it cost.** Until 2026-09-02 it
> stated that `fluolingo.com` 302-redirects to the withdrchan URL and that the
> GitHub Pages build was a preview at `frenchprof.github.io/fluoduo/`. Both
> stopped being true on 17 Aug, when `CNAME` and the Pages workflow were added
> in one commit — and a custom domain serves a Pages site at the ROOT, not at
> `/fluoduo`. The build went on emitting `/fluoduo/_next/…` for a site served
> at `/`, so fluolingo.com loaded its HTML and 404'd every stylesheet and
> script for seventeen days. Nobody caught it because every file said the site
> was something it no longer was. `verify91` now refuses a Pages subpath while
> a CNAME exists.

> **fluolinguo.com is RETIRED** (2026-07-19). The domain has no DNS records and
> must not be referenced anywhere — links, docs, QR codes, Firebase authorised
> domains, or Pages custom domains. If it still appears as a custom domain on
> the `fluolingo-dot-com` Pages project, remove it (dashboard →
> fluolingo-dot-com → Custom domains).

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

## Custom domain

`fluolingo.com` is a custom domain on the **GitHub Pages** site, not on this
Cloudflare project — see the table at the top. It is served at the domain root,
which is why `pages-preview.yml` must build with no base path.

The repo's `CNAME` file names it. Note that it sits at the repo root and is NOT
copied into `out/`, so it does not travel in the uploaded Pages artifact: the
binding that actually serves the domain is **Settings → Pages → Custom domain**
on `frenchprof/fluoduo`. The file is the repo's written record of the
arrangement, and `verify91` reads it as such. If the domain is ever moved or
retired, change both.
