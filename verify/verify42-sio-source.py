#!/usr/bin/env python3
"""verify42 — the SIO spine has ONE source, and nothing holds a stale copy.

WHAT WENT WRONG (2026-08-29)
----------------------------
Three files claimed to know what the 50 objectives are, and two of them were
lying:

  src/content/sios/sios.json   the app — the live course, and correct
  docs/handoff/…_v9.csv        17 SIOs behind; for 14 of them a DIFFERENT
                               objective under the same number (Unit 4 was
                               renumbered in the app and the CSV never followed)
  scripts/handoff_cefr.py      its own typed copy of all 50 can-dos; 23 matched,
                               and 9 had drifted onto the wrong SIO entirely

Neither lie was visible. `scripts/gen-sios.mjs` was documented as regenerating
sios.json FROM the CSV, so running the documented command would have reverted
17 objectives to superseded text and deleted SIO-045A. handoff_cefr.py sat on
no live path at all — until someone ran add-candos.py or merge-handoff-csv.py,
which paste it into the CSV, silently.

WHAT IS TRUE NOW, AND WHAT THIS FILE PINS
-----------------------------------------
  1 · sios.json is the source; the CSV follows it via sync-sio-csv.mjs.
  2 · That sync's --check runs on every build, so neither side can drift quietly.
  3 · The old CSV→app generator is gone, not merely unused.
  4 · handoff_cefr.py stores no descriptors — it derives from sios.json — so
      the paste-into-CSV scripts can no longer paste something stale.
  5 · The CSV's flashcard-spec columns stay OUTSIDE the contract: the app holds
      none of that, so the sync must never claim authority over it.

Run: python3 verify/verify42-sio-source.py
"""
import csv
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OK, FAIL = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(rel):
    p = ROOT / rel
    return p.read_text(encoding="utf-8") if p.exists() else ""


def run(*args):
    return subprocess.run(args, cwd=ROOT, capture_output=True, text=True)


SIOS = "src/content/sios/sios.json"
CSV = "docs/handoff/LAF1201_SIOs_Flashcards_v9.csv"
SYNC = "scripts/sync-sio-csv.mjs"
CEFR = "scripts/handoff_cefr.py"

# ---- 1 · the retired generator is really gone ------------------------------
check(not (ROOT / "scripts/gen-sios.mjs").exists(),
      "the CSV→app generator is deleted",
      "scripts/gen-sios.mjs is back — running it reverts 17 objectives and deletes SIO-045A")
check((ROOT / SYNC).exists(),
      "the app→CSV sync exists",
      f"{SYNC} is missing — nothing keeps the CSV honest")

# ---- 2 · the build actually runs the drift check ---------------------------
pkg = json.loads(read("package.json"))
scripts = pkg.get("scripts", {})
check("sync-sio-csv.mjs --check" in scripts.get("check:sios", ""),
      "check:sios runs the sync in check mode",
      "check:sios no longer runs the sync — drift stops being detected")
check("check:sios" in scripts.get("build", ""),
      "npm run build runs check:sios",
      "build no longer runs check:sios — the CSV can drift again in silence")

# ---- 3 · and it passes right now -------------------------------------------
r = run("node", SYNC, "--check")
check(r.returncode == 0,
      "the CSV and sios.json agree today",
      f"check:sios FAILS — the CSV and sios.json disagree:\n{r.stdout[-1500:]}{r.stderr[-800:]}")

# ---- 4 · handoff_cefr keeps no copy of its own -----------------------------
cefr_src = read(CEFR)
# A stored copy is what went stale. The giveaway is descriptor prose in the
# source: every can-do in the course begins "I can ".
stored = re.findall(r'"I can [^"]{10,}"', cefr_src)
check(not stored,
      "handoff_cefr.py stores no can-do text of its own",
      f"handoff_cefr.py has {len(stored)} hardcoded descriptor(s) again — that copy is what drifted")
check("sios.json" in cefr_src,
      "handoff_cefr.py reads the app's spine",
      "handoff_cefr.py no longer reads sios.json — it is holding its own copy again")

# ---- 5 · …and what it hands back IS the course -----------------------------
sys.path.insert(0, str(ROOT / "scripts"))
try:
    from handoff_cefr import CEFR as DERIVED, CEFR_HEADERS  # noqa: E402
except SystemExit as e:
    DERIVED, CEFR_HEADERS = {}, []
    FAIL.append(f"handoff_cefr.py refused to load: {e}")

sios = json.loads(read(SIOS))
live = {s["id"]: (s["cefrMode"], s["canDo"], s["competence"]) for s in sios}
check(DERIVED == live,
      f"handoff_cefr hands back the live descriptors for all {len(live)} SIOs",
      "handoff_cefr disagrees with sios.json — a paste into the CSV would be wrong")
check(CEFR_HEADERS == ["CEFR Mode", "Can-Do (A1)", "Linguistic competence (measurable)"],
      "the CEFR column headers are unchanged",
      "CEFR_HEADERS changed — add-candos/merge-handoff would write the wrong columns")

# ---- 6 · a short read must refuse, not blank the CSV -----------------------
# The dangerous failure is handoff_cefr returning a PARTIAL map: its callers
# overwrite the CSV's descriptor columns with whatever they get, so a short
# read empties them. Prove the guard by feeding it a truncated spine.
probe = ROOT / "verify" / ".verify42-probe.json"
probe.write_text(json.dumps(sios[:3], ensure_ascii=False), encoding="utf-8")
guard = run("python3", "-c",
            "import sys; sys.path.insert(0,'scripts');\n"
            "import handoff_cefr as h;\n"
            "from pathlib import Path;\n"
            "print(len(h._load(Path('verify/.verify42-probe.json'))))")
probe.unlink(missing_ok=True)
check(guard.returncode != 0 and "Refusing" in (guard.stderr + guard.stdout),
      "a truncated spine makes handoff_cefr refuse rather than hand back a short set",
      "handoff_cefr accepted a 3-SIO spine — a bad read would blank the CSV's descriptor columns")

# ---- 7 · the flashcard spec stays outside the contract ---------------------
sync_src = read(SYNC)
synced_block = sync_src[sync_src.find("const SYNCED = {"): sync_src.find("};", sync_src.find("const SYNCED = {"))]
for col in ("Front side", "Back side (flipped)", "Overview columns", "Letris / Notes"):
    check(col not in synced_block,
          f'the sync claims no authority over "{col}"',
          f'"{col}" is now synced from the app — but the app holds no flashcard spec, so it would be blanked')

# ---- 8 · the sync refuses to write what it cannot reproduce ----------------
check("serializeCsv(rows) !== original" in sync_src,
      "the sync asserts a byte-exact CSV round-trip before writing",
      "the round-trip guard is gone — a serializer bug would silently rewrite all 51 rows")

# ---- 9 · no ragged rows left in the CSV ------------------------------------
with (ROOT / CSV).open(newline="", encoding="utf-8") as f:
    rows = list(csv.reader(f))
ragged = [r[1].strip() for r in rows[1:] if len(r) != len(rows[0])]
check(not ragged,
      f"every CSV row has the header's {len(rows[0])} columns",
      f"ragged CSV rows again ({', '.join(ragged)}) — an unquoted comma has spilled a field")

# ---- 10 · no handoff script carries a baked-in path to someone's laptop ----
# merge-handoff-csv.py had `UPLOAD = Path("/Users/keijidan/Downloads/…v4_1…")`
# hardcoded — pointing at a spreadsheet several versions old, while claiming to
# rebuild the current one. Running it would have replaced all 9 base columns of
# every row (flashcard specs included) and reported success.
for rel_path in ("scripts/merge-handoff-csv.py", "scripts/add-candos.py", "scripts/sync-sio-csv.mjs"):
    src = read(rel_path)
    baked = re.findall(r'["\'](/Users/|/home/|[A-Za-z]:\\\\)[^"\']*["\']', src)
    check(not baked,
          f"{rel_path} has no absolute path baked in",
          f"{rel_path} hardcodes {baked[:1]} — a stale local file would silently overwrite the CSV")

check("sys.argv" in read("scripts/merge-handoff-csv.py"),
      "merge-handoff-csv.py takes the export as an argument",
      "merge-handoff-csv.py no longer takes a path — it is guessing which file to merge")

# It must refuse rather than merge when given nothing.
r = run("python3", "scripts/merge-handoff-csv.py")
check(r.returncode != 0,
      "merge-handoff-csv.py refuses to run without an export",
      "merge-handoff-csv.py runs with no argument — it will overwrite the CSV from somewhere")

# ---- 11 · every objective still has cards described for it -----------------
# The spec columns are the CSV's own; the sync never writes them, so an empty
# one means a reorganisation left an objective with no cards behind it.
spec_cols = ["Front side", "Back side (flipped)", "Overview columns"]
with (ROOT / CSV).open(newline="", encoding="utf-8") as f:
    _rows = list(csv.reader(f))
_h = _rows[0]
PRODUCTION = {s["id"] for s in sios if s["isProduction"]}
specless = [
    r[1].strip() for r in _rows[1:]
    if r[1].strip().startswith("SIO-")
    and r[1].strip() not in PRODUCTION            # ateliers have no flashcards by design
    and not any(r[_h.index(c)].strip() for c in spec_cols)
]
check(not specless,
      "every non-atelier SIO has a flashcard spec",
      f"no cards described for {', '.join(specless)} — an objective was left without any")

# ---- 12 · docs point at the source, not the retired generator --------------
index_ts = read("src/content/sios/index.ts")
check("gen-sios" not in index_ts,
      "index.ts no longer names the retired generator",
      "index.ts still tells the reader to regenerate sios.json from the CSV")
check("sync-sio-csv" in index_ts and "SOURCE" in index_ts,
      "index.ts names sios.json as the source and the sync as the follower",
      "index.ts does not say which file is the source")
check((ROOT / "docs/CSV_SPEC_REASSIGNMENT.md").exists(),
      "the flashcard-spec reassignment is written down",
      "docs/CSV_SPEC_REASSIGNMENT.md is missing — the half-state is undocumented")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
