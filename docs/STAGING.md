# Staging — one bookmark, no Google login

Dan wants a **fixed URL**. Refresh it. See the latest. **No Google sign-in.**
Students on live still hit the wall.

This file is the recipe. It does not flip the wall. The flag is set in the
Cloudflare dashboard on the **staging** build only — never in this repo.

---

## Live vs Staging vs github.io

Probed 4 Sep 2026. A comment in an old file is not a host.

| | **Live** (students) | **Staging** (the goal) | **github.io preview** |
|---|---|---|---|
| Bookmark | `https://fluoli.ngo/` · `https://fluolingo.withdrchan.com/` · `https://fluoguo.pages.dev/` | **`https://staging.fluoli.ngo/`** (or `https://staging.fluolingo.withdrchan.com/`) | `https://frenchprof.github.io/fluoduo/` |
| Who answers | Cloudflare Pages (`dckg/fluo` → CF project) | Cloudflare Pages — **second project**, or a `staging` production-branch alias | GitHub Pages (`pages-preview.yml` on `frenchprof/fluoduo`) |
| Sign-in wall | **On.** Flag unset at build. | **Off.** `NEXT_PUBLIC_OPEN_APP=1` at **this** build only. | **On.** Same as a normal `npm run build`. Not an open sandbox. |
| ChaTutor / TTS / Compose / `/api/correct` | Work (Pages Functions) | Work (same Functions, same secrets as you choose to copy) | **Fail.** GitHub Pages has no server. |
| URL | Stable | Stable — that is the point. One bookmark that never changes. | Stable path, but it is not staging. |
| `fluolingo.com` | Cloudflare **302 →** `fluolingo.withdrchan.com`. Not a second app. | — | — |

`fluolinguo.com` is **retired** (no DNS). Do not attach it, document it, or add
it to Firebase.

github.io is a preview you can open on a phone. It is **not** the no-login
host, and it has no Functions. As of 4 Sep its HTML asks for `/_next/…` at the
`github.io` **root** (404); the files live under `/fluoduo/_next/`. That is
another reason staging is a Cloudflare **domain root**, not “just use
github.io”.

---

## The one flag

In `src/lib/authConfig.ts`:

```ts
export const REQUIRE_SIGN_IN = process.env.NEXT_PUBLIC_OPEN_APP !== "1";
```

- The wall opens **only** when `NEXT_PUBLIC_OPEN_APP` is exactly `"1"` **at
  build time**. Absent, empty, `"true"`, `"0"` — wall stays up.
- **Staging Cloudflare env:** set `NEXT_PUBLIC_OPEN_APP` = `1`. Redeploy so
  the bundle is rebuilt. A runtime toggle does not exist; this is a static
  export.
- **Live Cloudflare env:** leave it **unset**. Do not add the variable “as
  false”. Absence is the closed default.
- **Do not** hand-edit `REQUIRE_SIGN_IN` to a literal `true` / `false`.
- **Do not** put the flag in any file `verify/verify38-authwall.py` watches
  (`*.yml` / `*.yaml` / `*.json` / `*.toml` / `.env*` / `*.sh` under the repo
  root, `.github/`, `scripts/`). That includes `pages-preview.yml` and
  `deploy-live.yml`. The check greps those files raw — a comment that names
  the flag fails the build.

The flag lives in the **Cloudflare dashboard**, on the staging project (or
the staging alias), Production environment. It is not a git commit.

---

## Recommended URL

**`https://staging.fluoli.ngo/`**

Fallback if that hostname is awkward: **`https://staging.fluolingo.withdrchan.com/`**.

Either is a Cloudflare custom domain on the **staging** project. Pick one,
attach it, bookmark it. Do not use a `*.pages.dev` hash URL as the daily
bookmark — those change when the project is recreated.

---

## Setup checklist (Dan, once)

Do this in dashboards. Nothing below is committed.

1. **Make a staging host that is not live.**
   - **Preferred:** a **second** Cloudflare Pages project (e.g. `fluolingo-staging`)
     pointed at the same production git (`dckg/fluo` `main`, or
     `frenchprof/fluoduo` `main`). Same `npm run build`, same `out/` +
     `functions/`.
   - **Or:** on the existing project, a production-branch **alias** named
     `staging` (a `staging` branch you fast-forward from `main`). Only safe
     if that alias does **not** share live’s Production env vars.
2. **Set the flag on staging only.**
   Pages project → Settings → Environment variables → **Production** (the
   env that builds this staging host):
   - Name: `NEXT_PUBLIC_OPEN_APP`
   - Value: `1`
   Leave the **live** project’s Production env empty of that name.
3. **Copy the Functions secrets you need** (`ANTHROPIC_API_KEY`, etc.) onto
   the staging project if ChaTutor / Compose should answer there. Same rule
   as live: a change only takes effect on the next deploy.
4. **Attach the custom domain** (`staging.fluoli.ngo` or
   `staging.fluolingo.withdrchan.com`). Wait until Cloudflare says the
   hostname is active.
5. **Firebase → Authentication → Settings → Authorized domains** → add the
   staging host (`staging.fluoli.ngo` or the withdrchan variant). Skip this
   and a later Google sign-in on staging fails; the wall is off, but `/moi`
   and `/teacher` still need the domain if anyone *does* sign in.
6. **Deploy staging** (Create deployment, or push the branch the project
   tracks). Confirm the build log does **not** belong to the live project.
7. **Never** add `NEXT_PUBLIC_OPEN_APP` to the live project, to
   `deploy-live.yml`, or to `pages-preview.yml`.

Ship live the way you already do: `git push live main` / `deploy-live`.
Staging is a **second** build of the same commit (or of `main`), with one
extra env var.

---

## How you know it worked

Open the staging bookmark **signed out** (a private window).

- Home loads. A pretest, Flip It, or a game **does not** show
  “Checking your sign-in…” then a Google button.
- Refresh. Same place, still no login.
- Live (`fluoli.ngo` / withdrchan) still shows the gate on those same
  routes.

If staging asks for Google, the flag was not in **that** build. Check the
project, the environment (Production vs Preview), and that you redeployed
after setting it.

If live stops asking for Google, the flag leaked onto the live project.
Unset it there and redeploy live **immediately**.

---

## Smoke list (unsigned)

Private window. Staging bookmark. If any step hits Google, stop — staging
is mis-built.

| # | Walk | URL on the staging host |
|---|---|---|
| 1 | Home → map Unité 0 → a stop’s **StopSheet** → **Pre-Test** | lands on `/pretests/unit0/SIO-001` (not `/map`, not `/unit/0#…`) |
| 2 | SIO-010 Léa Enchantée | `/pretests/unit0/SIO-010` — You-are **Léa · she**; keyed form **Enchantée** |
| 3 | Flip ↻ | `/practice/flip-it/salutations` — front Face shows the ↻ chip; card turns |
| 4 | SIO-010 Flip | `/practice/flip-it/atelier-sio-010` |
| 5 | SpecuLearn (same stop) | `/practice/speculearn/sappeler` |
| 6 | Class bag / Bring to class | finish a pretest **with misses** → Recap lists the gaps. Class bag **product** is still to build (`docs/CLASS_BAG.md`); today’s screen is Bring to class. |
| 7 | A game | `/games/vocabularain` — board, not a sign-in card |

Home itself is ungated on live too. The test is the **gated** doors
(pretests, Flip, games, lessons).

---

## What this file is not

- Not a licence to open `pages-preview.yml`. That workflow is a deploy
  config `verify38` reads. Putting the flag there would fail CI — and if
  GitHub Pages ever answered `fluolingo.com` again, it would take the
  student wall down.
- Not a password, a bypass token, or a “secret sign-in”. Those would ship
  in the static bundle. Staging is a **second compile**.
- Not production. Students stay on `fluoli.ngo` / withdrchan, wall on.
