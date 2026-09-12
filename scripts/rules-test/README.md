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

## Why this is NOT in the verify workflow

Measured on this container: the emulator JAR is a ~60 MB download on a cold
runner and ~25 s of boot before the first assertion. CI is metered and was cut
from 10.5 minutes to ~7 in September precisely because the allowance ran out
mid-morning and *nothing could merge*. Adding a minute to every run — including
the 99% of pull requests that do not touch `firestore.rules` — buys very little.

The right shape is a workflow of its own, triggered `on: push: paths:
['firestore.rules', 'scripts/rules-test/**']`, so it runs when the rules change
and never otherwise. That is a decision for the integration lane, not something
to slip into `verify.yml` from a branch, so it is written down here rather than
done. **Until it exists, these tests only protect the rules if a human runs
them** — which is the same "a check that CI never runs is not a check" trap
`verify31-wordrill` fell into for a fortnight.
