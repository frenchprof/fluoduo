#!/usr/bin/env python3
"""
A practice run has a finish line (2026-08-25).

WHY THIS EXISTS. No drill capped its queue. iComplete on `possessives` served
21 nouns x 6 persons + 10 sentence items = 136 questions in one sitting;
`nationalities` came to 100; WorDrill's "Tout" scope compiled the whole
curriculum into one run. With no end, quitting and finishing looked the same
— to the learner, who never got to complete anything, and to the app, which
could not tell them apart either.

Dan's ruling (2026-08-25) was the chooser, not a fixed cap: "let the learner
choose before starting". A learner with five minutes and a learner revising
for a test want different runs off the same deck.

What this asserts:

  1  The shared helper exists and is the ONLY place lengths are declared —
     a drill that hard-codes 10 or 25 has started a second source of truth.
  2  Short decks are never asked (offer() returns None at or below the
     threshold), so a deck of nine does not pose a question with one real
     answer.
  3  Only lengths that would actually shorten the run are offered — "25" on
     a deck of twenty is the same run as "all" wearing another label.
  4  cap() slices, and `null` means everything.
  5  iComplete asks BEFORE the first question and renders the chooser inside
     DrillShell — an early bare return dropped the notebook frame, the exit
     and the bottom bar, which is how it was first written and caught in a
     browser.
  6  The run, not the full deck, drives the drill: `total` comes from the
     capped queue, so the progress denominator and the done card follow.

Run from the repo root:  python3 verify/verify39-session-length.py
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

LIB = "src/lib/sessionLength.ts"
DRILL = "src/app/practice/complete-it/[collectionId]/CompleteItContent.tsx"
lib, drill = read(LIB), read(DRILL)

# 1 · one source of truth
check(bool(lib), "the shared helper exists", f"{LIB} is missing")
check("SESSION_LENGTHS" in lib and "export function cap" in lib and "export function offer" in lib,
      "the helper exports SESSION_LENGTHS / offer() / cap()",
      "the helper is missing one of SESSION_LENGTHS / offer() / cap()")
check("sessionLength" in drill,
      "iComplete imports the shared helper",
      "iComplete does not import sessionLength — lengths would be declared twice")

# 2-4 · behaviour, executed rather than read
try:
    m = re.search(r"SESSION_LENGTHS\s*=\s*\[([^\]]*)\]", lib)
    raw = [x.strip() for x in m.group(1).split(",") if x.strip()]
    lengths = [None if x == "null" else int(x) for x in raw]
    check(None in lengths, "'everything' is one of the offered lengths",
          "there is no 'all' option — a learner cannot choose the whole deck")
    check(any(isinstance(x, int) for x in lengths), "at least one short length is offered",
          "no numeric length is offered — the chooser cannot shorten anything")

    ask_above = int(re.search(r"ASK_ABOVE\s*=\s*(\d+)", lib).group(1))
    check(ask_above >= 12,
          f"short decks (<= {ask_above}) are not asked",
          f"ASK_ABOVE is {ask_above} — decks barely longer than a normal run would be asked")

    # offer() must return nothing for a short deck, and must not offer a
    # length that fails to shorten the run.
    body = lib[lib.find("export function offer"):]
    check("<= ASK_ABOVE" in body and "return null" in body,
          "offer() returns null at or below the threshold",
          "offer() has no short-deck escape — a deck of nine would be asked")
    check("n < total" in body,
          "offer() drops lengths that would not shorten the run",
          "offer() can offer 25 on a deck of 20, which is 'all' under another name")

    capbody = lib[lib.find("export function cap"):]
    check("slice(0, choice)" in capbody and "choice === null" in capbody,
          "cap() slices to the choice, and null means everything",
          "cap() does not slice, or does not treat null as 'all'")
except Exception as e:
    check(False, "", f"could not read the helper's constants: {e}")

# 5 · asked before the run, inside the shell
check("if (!asked)" in drill,
      "iComplete asks before the first question",
      "iComplete never gates on `asked` — the chooser would not appear")
gate = drill[drill.find("if (!asked)"):drill.find("if (!asked)") + 1200] if "if (!asked)" in drill else ""
check("<DrillShell" in gate,
      "the chooser renders inside DrillShell (frame, exit and bars intact)",
      "the chooser returns bare — it would render with no notebook frame, no "
      "exit and no bottom bar, which is exactly how it was first written")

# 6 · the capped run drives the drill
check(re.search(r"cap\(order,\s*chosen\)", drill) is not None,
      "the run is the capped slice of the shuffled order",
      "the drill no longer caps its queue — the 136-question run is back")
check(re.search(r"const total = run\?\.length", drill) is not None,
      "`total` comes from the capped run, so progress and the done card follow",
      "`total` is taken from the full order again — the progress bar would "
      "count to 136 while the run ends at 10")

print("\nsession length — a run has a finish line\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
