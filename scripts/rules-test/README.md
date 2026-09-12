# Firestore rules tests

`firestore.rules` is the only thing standing between a signed-in student and
everyone else's data, and until 2026-09-12 nothing tested it. These two scripts
drive the REAL Firestore emulator — the same rules engine production runs — and
assert both halves of every rule: the attack is refused, and the legitimate
path still works.

**Both halves matter, and the second one is the one that bites.** A rule that
denies everything passes every attack test. `legit-paths.mjs` exists because
this repo has twice shipped a rule that quietly denied real learners: the
`xp <= 100` ceiling that rejected every correct answer from anyone on a 7-day
streak, and the leaderboard key allowlist that had to gain `weekXp`/`weekKey`
before a new learner could ever join the board. Both were swallowed by a
client-side `catch`, so nothing looked broken.

## Run them

Needs Java (the emulator is a JAR) and network on first run to fetch it.

```
node scripts/rules-test/run.mjs              # current firestore.rules
node scripts/rules-test/run.mjs --compare    # also run against origin/main's copy
```

`run.mjs` starts the emulator, runs both suites, prints a PASS/FAIL table and
exits non-zero if anything fails.

## Where these run

`.github/workflows/firestore-rules.yml`, on `paths: ['firestore.rules',
'scripts/rules-test/**']` — so they run when the rules change and never
otherwise.

**Not in `verify.yml`, deliberately.** The emulator is a ~60 MB cold download
and ~25 s of boot. `verify` runs on every pull request and was cut from 10.5
minutes to about 7 in September, because the Actions allowance ran out
mid-morning and *nothing could merge*, main included. Paying that on the 99% of
pull requests that never touch the rules buys nothing.

## Deploying

`firebase.json` and `.firebaserc` exist so the rules in git and the rules in
the Firebase console cannot drift apart. Before them, `firestore.rules` was a
file nothing deployed — a copy of what someone had pasted into the console,
with no way to tell whether the two still agreed. They did not: the copy in
circulation on 2026-09-12 was missing the 21 August `weekXp`/`weekKey` fix,
which denies a new learner's first leaderboard write.

Deploy is **`workflow_dispatch` with `deploy: true`**, never a push — same
posture as `deploy-live` (Dan, 2026-08-31: *"we go through fluoduo main"*).
Landing a change and publishing it are two decisions, and these rules are the
only thing between a signed-in student and everyone else's data. The deploy job
is `needs: test`, so a rules file that fails an attack test cannot reach
production.

**One-time setup, and the workflow fails with this message until it is done:**
create a service account in the `laf1201` project with the **Firebase Rules
Admin** role, download its JSON key, and save the file's contents as the
repository secret `FIREBASE_SERVICE_ACCOUNT`. The job runs in a named
environment (`firestore-rules`) so it can be put behind a required reviewer in
Settings → Environments without editing the workflow.

`firebase.json` declares **firestore only** — no `hosting` block, on purpose.
The site is served by Cloudflare Pages, so a bare `firebase deploy` must not be
able to publish a second, stale copy of the app over it.
