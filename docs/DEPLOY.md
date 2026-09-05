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

**It exists: `https://fluoduo.pages.dev/`** (probed 5 Sep 2026) — a CF Pages
project on **this** repo, rebuilding on every merge to `main` (plus per-PR
preview URLs), with `NEXT_PUBLIC_OPEN_APP=1` set in its dashboard, so the
whole app is open there. Live stays gated (built from `dckg/fluo`, flag
unset). Recipe, checklist, and unsigned smoke list: **`docs/STAGING.md`**.
Never put that flag in a repo deploy yaml — `verify38` fails the build if
you do.

---

**THE GITHUB PAGES PREVIEW HAS BROKEN TWICE, in opposite directions**, and
both times because the build did not follow a dashboard setting nobody working
in the repo can see.

| | Home GitHub served it at | Build | Result |
|---|---|---|---|
| up to 12 Aug | `frenchprof.github.io/fluoduo/` | `/fluoduo` | fine |
| custom domain attached (Aug) | a domain root | still `/fluoduo` | **404 on every asset, 17 days** |
| 3 Sep (#157) | a domain root | root | fixed |
| custom domain cleared (2–5 Sep) | `frenchprof.github.io/fluoduo/` | still root | **404 again, mirrored** |

The mechanism, once: a page carries links to its own CSS and JS, and they must
match the folder the site sits in. `/fluoduo/_next/app.css` is right in a
folder and wrong at a root; `/_next/app.css` is the reverse. The HTML loads
either way, so it reads as a plain unstyled page rather than an error.

**WHERE THE ANSWER IS.** `actions/deploy-pages` prints it on every run:

    2 Sep 08:27   Evaluated environment url: https://fluolingo.com/
    5 Sep 02:22   Evaluated environment url: https://frenchprof.github.io/fluoduo/

Read that, never a comment. `pages-preview.yml` now DECLARES its home in one
line (`PAGES_HOME: subpath | root`) beside the build, and `verify91` holds the
build to the declaration in both directions. **When the dashboard setting
changes, read the deploy log and change the declaration with it.**

The root `CNAME` file is a leftover from the attached-domain period. It is not
copied into the uploaded artifact, so GitHub never reads it and it changes
nothing — but it reads as authoritative, and reading it as authoritative is
what caused the second failure. It should be deleted.

**None of this touched Cloudflare.** The live hosts and staging are domain
roots, never set the variable, and were unaffected throughout.

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
