# Patch 11 — D6: session telemetry is orphaned

`(unlabelled) · 75 sessions · 6 h 10 min` was not a labelling bug.

`users/{uid}/sessions` has **two readers and no writer**. Nothing in the
codebase has created a session document since the writer was removed. The docs
that exist carry a real `durationMs` and a **null `activityId`** —
`firestore.rules` permits the field (`validSession()` lists it), nothing
populates it.

So the total was true. The split underneath it read `(unlabelled)` for every
row on every learner, and no labelling patch could have fixed it: there was
nothing there to label.

## What replaces it

`page.view` events carry a path **and** a timestamp. Dwell on a page is the gap
to that learner's next view, with two bounds:

- gaps over **30 min** drop to a 60-second floor — the tab was open, the learner
  was not, and counting it would inflate a quiet evening into study time;
- the last view before such a break still gets that floor rather than zero,
  because they did look at it.

You now get a per-activity split with SIO numbers, an **Est. from page views**
KPI beside the measured session total, and a line on screen saying plainly
which number is measured and which is estimated. Never one number pretending
to be the other.

It reads events already collected — retroactive to 13 July, when visit tracking
shipped — and writes nothing to Firestore.

## Known limits, stated rather than hidden

- Two tabs open at once will double-count. Rare here, not corrected.
- A learner who reads one page for forty minutes reads as sixty seconds, not
  forty minutes, because the cap can't tell studying from a forgotten tab. The
  estimate is conservative by design.
- Time before 13 Jul 2026 does not exist in the event stream and never will.

## Run it

```bash
cd ~/fluoduo
unzip -o ~/Downloads/patch11.zip
python3 patch11/apply11.py
```

then stop the dev server and

```bash
rm -rf .next && npx tsc --noEmit && npm run build 2>&1 | tail -3 && npm run dev
```

Verified here first: `tsc` 0 errors, `next build` 738 pages, and the script is
idempotent.
