#!/usr/bin/env python3
"""verify60 — the colour a learner SEES and the record we STORE must agree.

Sorting was tagged "constrained" in `lib/evidence.ts` while the band in
`content/activities.ts` called it `recog`, from 26 Aug to 31 Aug. Both files
were individually defensible and nothing in CI compared them, so the page told
the learner one thing and the stored evidence said another for five days.

Nothing gates on `evidenceType` — it is written by `firebase/responses.ts` and
read only as display text in `teacher/Students.tsx` — so the drift cost no
learner any progress. It cost the teacher's reading of the data, which is the
whole reason the field exists.

The bridge between the two files is `lib/activityLedger.ts`: it maps an
emitted activity string to the registry key that `BAND` is keyed by. So this
check walks that map, resolves each prefix through `ACTIVITY_EVIDENCE`, and
asserts the band and the evidence type are compatible.

Deliberately NOT a reimplementation of either table: it parses both from
source, so deleting a row makes the row disappear here rather than silently
keeping a stale copy green.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PASS, FAIL = [], []

def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)

def read(rel):
    p = ROOT / rel
    if not p.exists():
        FAIL.append(f"{rel} is missing — this check cannot run and must not pass")
        return ""
    return p.read_text(encoding="utf-8")

EVIDENCE = read("src/lib/evidence.ts")
ACTIVITIES = read("src/content/activities.ts")
LEDGER = read("src/lib/activityLedger.ts")
if not (EVIDENCE and ACTIVITIES and LEDGER):
    print("\n".join(FAIL)); sys.exit(1)

def block(src, opener, rel):
    """The text between `opener` and the line that closes the literal."""
    i = src.find(opener)
    if i < 0:
        FAIL.append(f"{rel}: could not find `{opener}` — the table has been renamed "
                    f"or moved, and every assertion below would be vacuous")
        return ""
    j = src.find("\n];", i)
    k = src.find("\n};", i)
    end = min(x for x in (j, k) if x >= 0)
    return src[i:end]

# ── the three tables, parsed from source ───────────────────────────────────
EV_ROWS = re.findall(r'\["([^"]+)",\s*"([a-z]+)"\]',
                     block(EVIDENCE, "const ACTIVITY_EVIDENCE:", "evidence.ts"))
BAND_ROWS = dict(re.findall(r'^\s*([A-Za-z_][\w]*):\s*"(\w+)"',
                            block(ACTIVITIES, "const BAND:", "activities.ts"), re.M))
LEDGER_ROWS = re.findall(r'\["([^"]+)",\s*"(\w+)"\]',
                         block(LEDGER, "const PREFIX_TO_KEY:", "activityLedger.ts"))

ok(len(EV_ROWS) >= 25, f"ACTIVITY_EVIDENCE parsed: {len(EV_ROWS)} rows",
   f"only {len(EV_ROWS)} rows parsed from ACTIVITY_EVIDENCE — the scan has stopped "
   f"seeing the table, which would make every comparison below vacuous")
ok(len(BAND_ROWS) >= 12, f"BAND parsed: {len(BAND_ROWS)} keys",
   f"only {len(BAND_ROWS)} keys parsed from BAND — scan broken, comparisons vacuous")
ok(len(LEDGER_ROWS) >= 15, f"PREFIX_TO_KEY parsed: {len(LEDGER_ROWS)} rows",
   f"only {len(LEDGER_ROWS)} rows parsed from PREFIX_TO_KEY — scan broken")

def evidence_for(activity_id):
    """Longest prefix wins, as ACTIVITY_EVIDENCE's own lookup does."""
    best, blen = None, -1
    for prefix, kind in EV_ROWS:
        if activity_id.startswith(prefix) and len(prefix) > blen:
            best, blen = kind, len(prefix)
    return best

# ── what each band may legitimately store ──────────────────────────────────
# `lesson` spans two rungs ON PURPOSE: the Memo pager opens with MCQ cards
# (recognition) and ends with gap/build/translate ones (constrained), which is
# the ramp buildCards.tsx documents at line 11. Every other band is one rung.
ALLOWED = {
    "guess":  {"diagnostic"},
    "lesson": {"recognition", "constrained"},
    "recog":  {"recognition", "receptive"},
    "prod":   {"constrained", "productive"},
    "create": {"free"},
}

# Prefixes the ledger knows but the evidence table does not tag.
#
# The two tables are fed from opposite ends. ACTIVITY_EVIDENCE tags an activity
# string at the moment it is WRITTEN; PREFIX_TO_KEY resolves an activityId READ
# BACK out of storage, including route-shaped ids from before the `key:deck`
# convention. So a ledger row can legitimately have no emitter left — there is
# nothing for evidence.ts to tag.
#
# All three below were checked on 2026-08-31: no file in src/ passes any of
# them as an activity tag. The other direction — a tag that IS emitted and
# resolves to nothing — is verify53's job, and it covers every call site.
# Adding a row here needs that same check done and written down.
EXEMPT = {
    "/practice/speculearn",   # SpecuLearn emits `speculearn:<id>`
    "/lessons/",              # the pager emits `lesson:` / `lesson-write:`
    "vocabularain:",          # the rain game emits `letris:` (labels.ts renames)
}

checked = 0
for prefix, key in LEDGER_ROWS:
    band = BAND_ROWS.get(key)
    if band is None:
        continue                      # ledger key with no band — not a coloured surface
    kind = evidence_for(prefix)
    if kind is None:
        ok(prefix in EXEMPT, f"{prefix!r} carries no evidence type, by exemption",
           f"activityLedger maps {prefix!r} to the {band!r} band, but it matches no "
           f"prefix in ACTIVITY_EVIDENCE — answers from that surface store no "
           f"evidenceType at all. Add the prefix to evidence.ts, or to EXEMPT here "
           f"with the reason.")
        continue
    checked += 1
    allowed = ALLOWED.get(band, set())
    ok(kind in allowed,
       f"{prefix!r}: band {band!r} · evidence {kind!r}",
       f"{prefix!r} is coloured {band!r} on the page but stored as {kind!r}. "
       f"A {band!r} surface may store {sorted(allowed)}. The learner sees one claim "
       f"about what the exercise demands and the teacher's record shows another — "
       f"fix whichever file is wrong, do not widen ALLOWED to make them agree.")

# An EXACT count, not a floor. A floor lets coverage rot: dropping Sorting from
# the ledger bridge took this from 21 to 19 and a `>= 12` floor stayed green,
# which is the same silence this whole check exists to end. Adding a surface is
# supposed to fail here once, so someone updates the number on purpose.
COMPARED = 21
ok(checked == COMPARED, f"{checked} surfaces compared across the two files",
   f"{checked} surfaces compared, expected {COMPARED}. If a surface was ADDED, "
   f"raise the number. If one VANISHED, the bridge through activityLedger has "
   f"broken and those answers are no longer colour-checked against their record — "
   f"find out which before changing this line.")

# ── the specific pair this check was written for ───────────────────────────
# Named on its own so that losing it is loud, the way verify53 names `delayed`.
ok(BAND_ROWS.get("dice") == "recog" and evidence_for("dice:") == "recognition",
   "Sorting: band `recog`, evidence `recognition` — the two files agree",
   f"Sorting has drifted again: band {BAND_ROWS.get('dice')!r}, evidence "
   f"{evidence_for('dice:')!r}. The learner taps a group column that is already on "
   f"screen (PracticeContent.commit compares choice.key to item.correctColKey), which "
   f"is evidence.ts's own definition of recognition. Both must say recognition/recog.")

for line in PASS: print(f"  ok  {line}")
for line in FAIL: print(f"FAIL  {line}")
print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
