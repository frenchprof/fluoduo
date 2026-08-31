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

# Long pages collapse — permanent design rule (2026-08-31)

**Dan: *"now that the page is long please collapse part of it. can you make it
a rule for all — this is the rule from now on."***

A page a learner has to scroll past the fold has stopped showing them where
they are. So on **every** surface, not just the one that prompted this:

- **The argument stays open. The apparatus collapses.** On a lesson that means
  the claim and its answer are open on arrival; the pitfall table, the decision
  flow, the self-check and the word list start closed. If a learner must read
  it to understand the point, it is open; if they consult it, it is closed.
- **A closed section says what is behind it** — "18 words", "3 traps" — not a
  bare chevron. A collapsed section with no count is a section nobody opens,
  which is just deletion with extra steps.
- **Use native `<details>`/`<summary>`.** Keyboard and screen reader support
  come free, it needs no state, and it survives having no JavaScript. Do not
  hand-roll a disclosure with `useState` and a div.
- **Never collapse the only copy of something a learner needs to answer the
  question in front of them.** Collapsing is for reference, never for the
  prompt, the options, or the feedback.

This rule and the litmus test point the same way: the litmus test deletes text
that costs nothing, and this one folds away text that earns its place but not
its position. Neither is licence to hide the lesson.

# Show it, don't describe it — permanent rule (2026-08-31)

**Dan: *"often times i cannot understand what the agent is telling me about
what has changed. so long as i don't see, i can only guess (often wrongly).
can we make it a point to always show what the finished product looks like
rather than just describe."***

A prose summary of a UI change is not a report of that change; it is a request
that Dan reconstruct the screen in his head from your words. He has been doing
that for weeks and guessing wrong. So:

- **Every change a learner or teacher can SEE ships with a picture of it.**
  Drive the real app and screenshot the real route — `NEXT_PUBLIC_OPEN_APP=1`
  gets past the sign-in wall, Chromium and Playwright are installed. A rendered
  mock is second best and must be labelled as one.
- **Before and after, side by side**, whenever something changed rather than
  appeared. "The band is now SemiBold" means nothing alone; the two bands next
  to each other mean everything.
- **When a decision is being put to Dan, show the options, don't list them.**
  Three tab strips he can point at beat three sentences he has to imagine.
- **This outranks brevity.** A short message he cannot act on is not shorter
  than a long one he can — it is a message that has to be sent twice.

The exception is work with no visual surface at all (a check, a data
migration, a type). There, show the *evidence* instead: the check's output,
the row counts before and after. The principle is the same — the finished
thing, not an account of it.

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

## fluoduo-main is the integration lane — permanent (2026-08-31)

**Dan: *"can we, moving forward, push everything to fluoduo-main for quality
check, and letting fluoduo-main do the necessary merging?"*** Yes. So:

- **You push your own branch to `origin` and stop there.** Never merge your own
  work, and never merge anyone else's.
- **fluoduo-main reviews and merges.** Order of landing is theirs to decide —
  they are the only session that can see two in-flight branches at once.
- **When your branch is ready, hand it over explicitly**: say which files it
  touches, which shared ones, and what you know it collides with. A branch that
  is merely pushed has not been handed over.
- **Rebasing after someone else lands first is the author's job, not the
  integrator's.** They will tell you; replay your change on the new base.

WHY, IN ONE CASE. On 31 Aug this session and fluoduo-main built into each other
for an afternoon without either knowing. #97 renamed the ladder
Facile/Moyen/Difficile/Bonus and cut the Bonus TAB; this branch had, the same
hour, shortened the tab labels to English, moved Words under Forms, and been
holding the Bonus tab open pending Dan's answer — a question #97 had already
settled. Both branches merged cleanly into `main` and conflicted with each
other on five files, three of them semantically:

- `blankKeysFor` — they widened it to four levels, this branch added
  `Slot.first` so Dan's colours ★ withdraws the COLOUR and not the leftmost
  gap. **Both are needed.** A merge that keeps only the four-level rule silently
  inverts the colours ladder, and nothing in either diff looks wrong.
- the tab labels, renamed on one side and restructured on the other;
- `verify57` / `verify58`, edited by both.

Nothing here was carelessness — each side scanned for verify-number collisions
and found none. The number scan catches files; it cannot catch two sessions
editing the same *function*. That is what an integration lane is for.

**Claiming a verify number:** scan EVERY remote branch, never just `main` —
an in-flight number is precisely what main cannot show you. Four collisions
have already happened (31, 52 twice, 60):

```
for b in $(git for-each-ref --format='%(refname:short)' refs/remotes/origin); do
  git ls-tree --name-only $b verify/; done | grep -o 'verify[0-9]*' | sort -u
```
