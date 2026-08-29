#!/usr/bin/env python3
"""
A SIO's id and its number move together, and a renumber carries the learner
with it (2026-08-29).

WHY THIS EXISTS. Dan moved « Questions » up to 34 and « Où est… ? » down to 35,
so that locating a place sits beside asking for directions at 36.

That is a two-line change to a JSON file and a genuinely dangerous one, because
of an invariant nobody had ever written down: **a SIO's id and its `num` are in
lockstep** — `SIO-034` always has `num: 34` — unbroken across all fifty, with
`SIO-045A` at 45.5 as the one deliberate half-step. Every renumber in this
project's history has honoured it, including Dan's own of 012-014 and 022-028
on 2026-07-01.

The consequence is the dangerous part. Because the number moves the ID, and the
ID is what every store on the learner's device is keyed by, a renumber silently
rewrites history: whoever had finished « Où est… ? » would open the app to find
they had finished « Questions » instead, with their pre-test misses filed under
the wrong stop. The 2026-07-01 renumber escaped this only because the
2026-08-11 reset wiped every blob a fortnight later. There has been no reset
since.

So this file asserts two things that had no check at all: that the invariant
holds, and that the migration which makes a renumber survivable actually works.
The second is EXECUTED against real blob shapes, not read.

What this asserts:

  1  id and num are in lockstep for all 50 SIOs, `SIO-045A` -> 45.5 included.
     This is the invariant the whole renumber rests on, and it was implicit
     until it nearly got broken.
  2  The order Dan asked for: 33 Places, 34 Questions, 35 Où est, 36 Directions.
  3  Each stop's lesson, pre-test and finale items followed it — the content
     moved with the objective rather than staying on the number.
  4  The migration, RUN: a blob written before the swap comes out the other
     side pointing at the same TOPICS it did before. Every store keyed by a
     SIO id is covered — progress (doneSios and itemSrs), the activity ledger,
     and the pre-test record.
  5  The migration handles `finale:SIO-034:2`, where the SIO is NOT the first
     colon-separated segment. The first version swapped only the head and
     silently missed every GramMarathon answer.
  6  The migration is stamped, and refuses to run twice. The swap is its own
     inverse, so a second run would put everything back — this is the one
     migration in the codebase where "idempotent" is false by construction and
     the stamp is doing real work.

Run from the repo root:  python3 verify/verify49-renumber-3435.py
"""
import json, os, re, subprocess, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(p): return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

MIG = "src/lib/migrations/renumber3435.ts"
check(os.path.isfile(MIG), "the renumber migration is present", f"MISSING {MIG}")
if FAIL:
    print("\n".join(FAIL)); sys.exit(1)

# ---- 1 · id and num are in lockstep ---------------------------------------
sios = json.loads(read("src/content/sios/sios.json"))
check(len(sios) == 50, f"{len(sios)} SIOs", f"expected 50 SIOs, found {len(sios)}")

drift = []
for s in sios:
    m = re.fullmatch(r"SIO-(\d+)([A-Z]?)", s["id"])
    if not m:
        drift.append(f"{s['id']} is not SIO-NNN"); continue
    # A letter suffix is a deliberate insertion into a retired number's gap
    # (SIO-045A sits at 45.5, between 45 and 46).
    expect = int(m.group(1)) + (0.5 if m.group(2) else 0)
    if s.get("num") != expect:
        drift.append(f"{s['id']} has num {s.get('num')}, expected {expect}")
check(not drift,
      "id and num are in lockstep across all 50 (SIO-045A at 45.5 included)",
      "a SIO's id and number have come apart, so the map label and the id "
      "shown to the learner now disagree: " + "; ".join(drift))

by_id = {s["id"]: s for s in sios}

# ---- 2 · the order Dan asked for -------------------------------------------
ORDER = [("SIO-033", "Places in town"), ("SIO-034", "Questions"),
         ("SIO-035", "Où est… ?"), ("SIO-036", "Directions")]
for sid, short in ORDER:
    got = by_id.get(sid, {}).get("short")
    check(got == short, f"{sid} is {short!r}",
          f"{sid} is {got!r}, expected {short!r} — Dan moved questions up to 34 "
          "so that locating (35) sits beside directions (36)")

# ---- 3 · the content followed the objective --------------------------------
reg = read("src/content/lessons.ts")
m = re.search(r'"SIO-035":\s*\[([^\]]*)\]', reg)
check(bool(m) and "ou-est" in (m.group(1) if m else ""),
      "SIO-035 leads with the ou-est lesson — the lesson followed the objective",
      "the « Où est » lesson did not move to SIO-035; it is still filed under "
      "the number that now belongs to Questions")
m34 = re.search(r'"SIO-034":\s*\[([^\]]*)\]', reg)
check(bool(m34) and "questions-oui-non" in (m34.group(1) if m34 else ""),
      "SIO-034 leads with the questions lessons",
      "SIO-034 does not lead with the questions lessons")

# The pre-test collections carry the number in their own ids, so the CONTENT
# had to move between the two files rather than the files being renamed.
p34 = json.loads(read("src/content/pretests/u3-sio034.json"))
p35 = json.loads(read("src/content/pretests/u3-sio035.json"))
check(p34.get("lessonSlug") == "questions" and p35.get("lessonSlug") == "locating-places",
      "the pre-tests followed too (u3-sio034 = questions, u3-sio035 = locating)",
      f"the pre-tests did not follow: u3-sio034 is {p34.get('lessonSlug')!r}, "
      f"u3-sio035 is {p35.get('lessonSlug')!r}")
for pid, d in (("u3-sio034", p34), ("u3-sio035", p35)):
    bad = [i["id"] for i in d.get("items", []) if not i["id"].startswith(pid + "-")]
    check(not bad, f"every {pid} item id matches its collection",
          f"{pid} holds items belonging to another collection: {bad[:3]}")

fin = read("src/content/finale.ts")
loc = re.findall(r'\{ id: "finale:(SIO-03[45]):\d+".*?cat: "([^"]*)"', fin)
mis = [f"{sid} tagged {cat!r}" for sid, cat in loc
       if ("contracted article in a place" in cat and sid != "SIO-035")
       or ("question" in cat.lower() and sid != "SIO-034")]
check(not mis,
      f"the finale items followed the objective ({len(loc)} items across 034/035)",
      "a finale item is filed under the wrong stop after the renumber: " + "; ".join(mis[:4]))

# ---- 4-6 · the migration, EXECUTED -----------------------------------------
# Read is not enough. The bug this section exists for — the finale's
# "finale:SIO-034:2" shape, where the SIO is not the first segment — looked
# entirely correct in source.
JS = r"""
import { __test } from "./src/lib/migrations/renumber3435.ts";
const { swapSio, swapPretestId, migrateProgress, migrateLedger, migratePretests } = __test;
const bad = [];
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) bad.push(`${m}: got ${JSON.stringify(a)}`); };

eq(swapSio("SIO-034"), "SIO-035", "swapSio 34->35");
eq(swapSio("SIO-035"), "SIO-034", "swapSio 35->34");
eq(swapSio("SIO-036"), "SIO-036", "swapSio leaves others alone");
eq(swapPretestId("u3-sio034::u3-sio034-01"), "u3-sio035::u3-sio035-01", "pretest key swap");
eq(swapPretestId("u3-sio035::u3-sio035-07"), "u3-sio034::u3-sio034-07", "pretest key swap back");
eq(swapPretestId("u3-sio036-01"), "u3-sio036-01", "pretest id leaves others alone");

// A learner who had finished « Où est » (034 before the swap) must still have
// finished « Où est » (035 after it).
const prog = migrateProgress({
  doneSios: ["SIO-033", "SIO-034", "SIO-036"],
  itemSrs: {
    "SIO-034:write": { intervalDays: 3 },
    "SIO-035:write": { intervalDays: 9 },
    "finale:SIO-034:2": { intervalDays: 5 },
    "finale:SIO-036:1": { intervalDays: 1 },
  },
});
eq(prog.doneSios, ["SIO-033", "SIO-035", "SIO-036"], "doneSios");
eq(Object.keys(prog.itemSrs).sort(),
   ["SIO-034:write", "SIO-035:write", "finale:SIO-035:2", "finale:SIO-036:1"].sort(),
   "itemSrs keys");
eq(prog.itemSrs["SIO-035:write"]?.intervalDays, 3, "the 034 card kept its interval at 035");
eq(prog.itemSrs["finale:SIO-035:2"]?.intervalDays, 5, "the finale answer followed — the SIO is not the first segment here");

const led = migrateLedger({ gram: { "SIO-034": { right: 4, wrong: 1 }, "SIO-036": { right: 2, wrong: 0 } } });
eq(led.gram["SIO-035"], { right: 4, wrong: 1 }, "ledger tally followed");
eq(led.gram["SIO-034"], undefined, "ledger did not leave a copy behind");

const pre = migratePretests({
  items: { "u3-sio034::u3-sio034-08": { pretestId: "u3-sio034", itemId: "u3-sio034-08", sioId: "SIO-034", correct: false } },
  lastTakenAt: { "u3-sio034": 123 },
});
eq(Object.keys(pre.items), ["u3-sio035::u3-sio035-08"], "pretest key");
eq(pre.items["u3-sio035::u3-sio035-08"]?.sioId, "SIO-035", "pretest sioId");
eq(pre.items["u3-sio035::u3-sio035-08"]?.pretestId, "u3-sio035", "pretest pretestId");
eq(pre.items["u3-sio035::u3-sio035-08"]?.itemId, "u3-sio035-08", "pretest itemId");
eq(pre.lastTakenAt, { "u3-sio035": 123 }, "lastTakenAt");

console.log(JSON.stringify({ bad }));
"""
r = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", JS],
                   capture_output=True, text=True)
check(r.returncode == 0, "the migration executed in node",
      f"migration run failed: {r.stderr[-500:]}")
if r.returncode == 0:
    d = json.loads(r.stdout.strip().splitlines()[-1])
    check(not d["bad"],
          "a pre-swap blob comes out pointing at the same TOPICS it went in with",
          "the migration loses or misfiles learner progress: " + "; ".join(d["bad"]))

# ---- 6 · the stamp ---------------------------------------------------------
mig = read(MIG)
check("STAMP_KEY" in mig and "applied()" in mig,
      "the migration is stamped so it cannot run twice",
      "the migration has no stamp — and the swap is its own inverse, so a "
      "second run would silently put every learner back where they started")
check(re.search(r"stamp\(\);\s*\n\s*if \(!applied\(\)\) return;", mig) is not None,
      "a stamp that cannot be written aborts the migration",
      "the migration writes the stamp without confirming it landed — if "
      "localStorage refuses the write it will swap again on every load")
# Every store keyed by a SIO id has to call it, or the first read of an
# unmigrated store hands out stale ids.
for f, why in (("src/lib/progress.ts", "doneSios and itemSrs"),
               ("src/lib/activityLedger.ts", "the per-SIO tallies"),
               ("src/lib/pretestRecord.ts", "the pre-test gap record")):
    check(re.search(r"^\s*ensureRenumber3435\(\);", read(f), re.M) is not None,
          f"{os.path.basename(f)} migrates before it reads ({why})",
          f"{f} reads {why} without running the renumber migration first")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
