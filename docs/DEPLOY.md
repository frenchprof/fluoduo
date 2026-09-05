# Deploying FluoLingo

**Where it lives today** (probed 4 Sep 2026 — open the URL; do not trust a
comment over a response):

| URL | Who answers | Role |
|---|---|---|
| **fluoli.ngo** | Cloudflare Pages, 200 | Live |
| **fluolingo.withdrchan.com** | Cloudflare Pages, 200 | Live. Ship with `git push live main` / `deploy-live`. |
| **fluoguo.pages.dev** | Cloudflare Pages, 200 | Default `*.pages.dev` for that CF project |
| **fluolingo.com** | Cloudflare **302 →** `fluolingo.withdrchan.com` | Not a second app. A redirect. |
| **frenchprof.github.io/fluoduo/** | GitHub Pages, 200 | Preview. No Pages Functions (ChaTutor / TTS / Compose fail). Wall stays on. |

`fluolinguo.com` is **retired** (2026-07-19). No DNS — do not link it, QR it, or
add it to Firebase / Pages custom domains.

## Staging

A **no-login** Cloudflare bookmark for Dan and agents (refresh, no Google;
live stays gated) is a **second** CF build with `NEXT_PUBLIC_OPEN_APP=1` on
that env only. Recipe, checklist, and unsigned smoke list:
**`docs/STAGING.md`**. Recommended host: `staging.fluoli.ngo`. Never put that
flag in a repo deploy yaml — `verify38` fails the build if you do.

---

**THERE WERE TWO LIVE SITES for a stretch after 17 Aug**, both fed from `main`
(Dan, 2026-09-02: *"two live sites, both fed from main … worth knowing which
one your students actually use"*):

| URL | Host then | Built by | Path |
|---|---|---|---|
| **fluolingo.com** | GitHub Pages, `frenchprof/fluoduo` (for a window) | `.github/workflows/pages-preview.yml` | domain ROOT once a custom domain was attached |
| **fluolingo.withdrchan.com** | Cloudflare Pages | `dckg/fluo`, which `deploy-live.yml` mirrors main into | domain ROOT |

They were NOT equivalent. GitHub Pages has no server, so the four Cloudflare
Pages Functions — `/api/tutor`, `/api/tts`, `/api/correct`, `/api/compose` —
do not exist there. They work on the Cloudflare hosts. Everything else runs
in the browser against Firebase on both.

They also deploy on different triggers: the Pages workflow follows `origin`
`main` automatically; withdrchan waits for `deploy-live` (or `git push live
main`). The two can sit on different commits.

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

**Today** `fluolingo.com` is answered by **Cloudflare** and **302s** to
`fluolingo.withdrchan.com` (see the table at the top). `fluoli.ngo` is a
Cloudflare custom domain on the live project.

The repo's `CNAME` file still names `fluolingo.com`. That file is GitHub
Pages' written claim, not the DNS that browsers hit today. It sits at the
repo root and is NOT copied into `out/`. `verify91` reads it as the record
that a custom domain is in play, which is why `pages-preview.yml` must not
set `PAGES_BASE_PATH`. If the domain is ever moved or retired, change both
the file and the Pages / Cloudflare bindings.

A **staging** custom domain (`staging.fluoli.ngo` or
`staging.fluolingo.withdrchan.com`) belongs on the **staging** Pages project
only — `docs/STAGING.md`.
