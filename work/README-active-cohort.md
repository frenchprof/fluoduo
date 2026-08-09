# active-cohort.mjs — the Track E denominator

Read-only. Touches nothing, writes nothing.

    cd ~/fluoduo
    GOOGLE_APPLICATION_CREDENTIALS=~/Downloads/serviceAccountKey.json \
      node work/active-cohort.mjs

Applies four exclusions in one auditable pipeline and shows what each stage
drops:

  1. every uid with any trace
  2. − ADMIN_EMAILS ............ teacher/admin accounts (6, all Dan's)
  3. − EXCLUDED_BOARD_UIDS ..... prior special-term leftovers (32)
  4. − HIDDEN_ROSTER_NAMES ..... test/sample/retired accounts (5)
  5. − ALIAS_EMAILS ............ two Google accounts, one person (7)
  6. = ENROLLED CURRENT COHORT
  7. ∩ activity window ......... ACTIVE, reported at ever / 30d / 14d / 7d

Pick ONE window and record it, so every measure uses the same denominator.
That is the whole point: ~75, 19, 16 and 14 are all in circulation because
four surfaces each chose their own filter.

The uid exclusion list is re-read from src/lib/accountAliases.ts at runtime
when that file is reachable, so the script cannot silently drift from the app.

CAVEAT that must travel with any RATE computed from this: the response store
has a known-bad window before 2026-08-10 (D5 — the xp<=100 rules cap silently
rejected every correct answer from a learner on a 7-day streak). Denominators
are unaffected; rates are biased downward, most for the most consistent
learners.
