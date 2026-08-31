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

# Start here — every session (2026-08-17)

Read `docs/STATUS.md` before anything else and update it before you stop. `HANDOFF.md`, `TODO.md` and `docs/planning/*` are historical.

## Working on this repo — the setup notes

FluoLingo is a single Next.js 16 (Turbopack, App Router) app. Dependencies are
plain npm (`package-lock.json`); the update script runs `npm ci`. Node 22 is
used in CI.

- **Scripts.** `npm run dev` (http://localhost:3000); `npm run build`, which is
  `check:short && check:sios && next build` — the two guards run first, so a
  build failure may be a label or a CSV drift rather than a compile error.
  Typecheck with `npx tsc --noEmit`, which is clean and must stay clean.
- **Lint.** `npm run lint` over the whole repo reports ~130 pre-existing
  problems (mostly `react-hooks/set-state-in-effect`) across ~51 files. **CI
  lints every file a pull request TOUCHES** — not the whole repo, which would
  paint every PR red on day one. The workflow step is "Lint the files this PR
  touches", added 29 Aug. Consequence to budget for: a one-line change to an
  old file inherits that file's whole lint debt. Where the rule contradicts a
  deliberate decision (localStorage cannot be read during render; a live ref
  must be written during render or an async callback fires a stale value; a
  shuffle must happen after mount so SSR and the first client render agree), a
  targeted `eslint-disable-next-line` **with the reason written out** is the
  accepted resolution — see `SayItContent.tsx`. Fix what is genuinely a fault;
  do not restructure a working component to satisfy a rule in a PR that is
  about something else.
- **CI** is one job, `verify`: `tsc --noEmit`, `npm run build`, then every
  script in `verify/`, each named on its own `run:` line in
  `.github/workflows/verify.yml`. Add a check and you must add that line —
  `verify-wiring.py` fails the build if any script is unnamed, if the workflow
  names a deleted one, or if two share a leading number. *A check that CI never
  runs is not a check*: `verify31-wordrill` sat unrun for a fortnight because
  its number collided with another file's.
- **The auth wall.** Learning activities (pretest / practice / Flip It / games /
  mark-as-done) sit behind Google sign-in. To open them locally, build or run
  with the environment variable:

  ```
  NEXT_PUBLIC_OPEN_APP=1 npm run build
  ```

  **Do not hand-edit `REQUIRE_SIGN_IN` in `src/lib/authConfig.ts`.** It reads
  that variable, so a production build contains no bypass at all — not even a
  disabled one — and `verify38-authwall.py` fails if the flag is ever committed
  into a config file. Browsing and notes work without signing in either way.
- **`next.config.ts`** uses `output: "export"` (static export), so `next start`
  will refuse to run — serve the `out/` directory instead. `PAGES_BASE_PATH` is
  only for the GitHub Pages preview; leave it unset for normal dev and build.
- **`functions/api/*`** are Cloudflare Pages Functions (ChaTutor, TTS, Compose
  check, `/api/correct`) — server-side, not part of `next dev`, so those
  endpoints do not run locally.
- **Deploying** is Dan's, from his machine: `git pull && git push live main`,
  where `live` is the Cloudflare Pages remote. Agents push to `origin` only.

# Multi-agent rules (2026-08-31)

Read **THE ROSTER** at the top of `docs/STATUS.md` before starting work —
lanes are assigned there and integration work (branch audits, renumbering,
closures, merges of others' work) belongs to the integration lane only.

**Claiming a verify number:** scan EVERY remote branch, never just `main` —
an in-flight number is precisely what main cannot show you. Four collisions
have already happened (31, 52 twice, 60):

```
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin); do
  git ls-tree --name-only $b verify/; done | grep -o 'verify[0-9]*' | sort -u
```
