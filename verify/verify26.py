#!/usr/bin/env python3
"""
Patch 26 — /moi + teacher (2026-08-17).

The plan rows (UI_WORK_PLAN_1.md → PATCH 26): hardest items → outcome rows
with items nested, colour = meaning; ONE syllabus heat-strip component on
four pages; a thin stat-strip hero on /moi, six tabs → four segments, every
list capped at 5; the teacher "Class now" board (16 tiles, worst-first,
30 s repoll); the outcome × student matrix; one pool fetch of the class and
no `Compute` button.

What this asserts (static, over source):

  1  outcomeRows.ts: folds answers by outcomeForItem (the patch-12 spine),
     UNMAPPED bucket pinned last, sort = missed × weakItems, tier scale
     50 / 75 (same as the ledger's), and it is LEARNER-SAFE — imports no
     teacher module.
  2  HeatStrip.tsx: one component, tier tokens, every unit's SIOs, no text
     in the cell (title/aria only); mounted on /moi, the teacher student
     panel, the teacher Class now board, and the Index.
  3  /moi: a .moi-hero with two 3px progressbar hairlines and no heading
     prose; four segments (aria-pressed), the six-tab list gone; CAP = 5
     and a Capped list; OutcomeCard renders outcomeRows; no HUES, no hex.
  4  Index: rows carry id={sio.id} (the /moi ▶ lands on the row) and a
     compact strip from the same ledger.
  5  Teacher: ClassNow.tsx — a "now" panel FIRST on the rail; 4×4 grid on
     sm; worst-first tileRank; stuck = 3 misses on one outcome in 20 min;
     REPOLL_MS = 30 s with a hidden-tab pause; the class-matrix iterates
     every unit's SIOs and has a Class column.
  6  One fetch: fetchClassDetails with a POOL_SIZE; page.tsx hands
     `details` to ClassNow, Students and Reports; Evidence has NO Compute
     button and fetches nothing itself; fetchResponsesSince is a range
     query on timestamp.
  7  Fixture: FIXTURE is the inlined NEXT_PUBLIC_TEACHER_FIXTURE flag;
     fixture.ts is reached only by dynamic import; no committed .env sets
     it; the fixture carries no email address.
  8  No hex literal in the new files (tokens only, verify19b's rule).
  9  CI runs this file after verify24.

Run from the repo root:  python3 verify/verify26.py
"""
import glob, os, re, sys

FAIL, OK = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"\{/\*.*?\*/\}", "", src, flags=re.S)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

F = {
    "rows": "src/lib/outcomeRows.ts",
    "strip": "src/components/HeatStrip.tsx",
    "moi": "src/app/moi/MoiContent.tsx",
    "index": "src/app/activities/page.tsx",
    "now": "src/app/teacher/ClassNow.tsx",
    "page": "src/app/teacher/page.tsx",
    "data": "src/app/teacher/data.ts",
    "students": "src/app/teacher/Students.tsx",
    "evidence": "src/app/teacher/Evidence.tsx",
    "reports": "src/app/teacher/Reports.tsx",
    "fixture": "src/app/teacher/fixture.ts",
}
raw = {k: read(v) for k, v in F.items()}
code = {k: strip_comments(v) for k, v in raw.items()}
for k in ("rows", "strip", "moi", "now", "fixture"):
    check(bool(raw[k]), f"{F[k]} exists", f"{F[k]} is missing")

# ── 1 · outcomeRows ──────────────────────────────────────────────────────
r = code["rows"]
check("outcomeForItem(a.item)" in r, "rows fold by outcomeForItem (the spine)", "outcomeRows does not call outcomeForItem")
check('export const UNMAPPED' in r and "if (a.sio === UNMAPPED) return 1" in r,
      "the unmapped bucket is pinned last", "no UNMAPPED bucket pinned last")
check("b.missed * b.weakItems - a.missed * a.weakItems" in r,
      "rows ordered by missed × weakItems (the audit's rule)", "row order is not missed × weakItems")
check("pct < 50" in r and "pct < 75" in r, "tier scale 50 / 75 (matches the ledger)", "tier thresholds drift from 50 / 75")
check("export function outcomeAccuracy" in r, "outcomeAccuracy feeds the heat-strip", "no outcomeAccuracy export")
for bad in ("app/teacher", "accountAliases", "rosterPrivate", "./data"):
    check(bad not in r, f"outcomeRows imports nothing from {bad}", f"outcomeRows imports {bad} — learner path contaminated")

# ── 2 · the heat-strip ───────────────────────────────────────────────────
st = code["strip"]
check("tierToken(" in st, "heat cells use the tier token", "HeatStrip does not use tierToken")
check("unitNumbers()" in st and "siosForUnit(u)" in st, "one row per unit, every SIO", "HeatStrip does not iterate every unit's SIOs")
check("aria-label={title}" in st and ">{s.short}" not in st and ">{s.id}" not in st,
      "no text in the cell — title/aria only", "HeatStrip prints text inside the cell")
check("app/teacher" not in st and "./data" not in st, "HeatStrip is learner-safe", "HeatStrip imports teacher code")
mounts = [k for k in ("moi", "students", "now", "index") if "<HeatStrip" in code[k]]
check(len(mounts) == 4, f"heat-strip mounted on four pages: {', '.join(F[k] for k in mounts)}",
      f"heat-strip mounted on {len(mounts)} pages: {mounts}")

# ── 3 · /moi ─────────────────────────────────────────────────────────────
m = code["moi"]
check('className="moi-hero' in m and 'aria-label="Your progress"' in m, "/moi has the stat-strip hero", "no .moi-hero section")
hero = m[m.find('className="moi-hero'):m.find("</section>")]
n_bar, n_role = hero.count("h-[3px]"), hero.count('role="progressbar"')
check(n_bar == 2 and n_role == 2, "hero: two 3px hairlines with progressbar roles",
      f"hero hairlines: {n_bar} h-[3px] / {n_role} progressbar")
check("text-2xl" not in hero and "<h1" not in hero and "<h2" not in hero, "no heading prose in the hero", "the hero grew a heading")
check(len(re.findall(r'\{ key: "\w+", label: "[^"]+" \}', m[m.find("const SEGMENTS"):m.find("] as const")])) == 4,
      "four segments", "SEGMENTS is not four entries")
check("const TABS" not in m and "Where I lose marks" not in m, "the six-tab list is gone", "the old six tabs are still there")
check('aria-pressed={on}' in m and "moi-segments" in m, "segments are a pressed-button group", "segments lack aria-pressed")
check("const CAP = 5;" in m and "function Capped" in m and m.count("<Capped") >= 3,
      "every list goes through Capped (CAP = 5)", "lists are not capped at 5")
check("outcomeRows(" in m and "function OutcomeCard" in m and "<OutcomeCard" in m,
      "hardest items are outcome rows with items nested", "/moi does not render outcome rows")
check("HUES" not in m, "no rotating hue on /moi", "HUES is back on /moi")
check("hrefFor={indexHref}" in m, "/moi's strip cells open the Index row", "the /moi strip does not link to the Index")

# ── 4 · Index ────────────────────────────────────────────────────────────
ix = code["index"]
check("id={sio.id}" in ix, "Index rows carry id={sio.id}", "Index rows have no anchor id")
check('size="sm"' in ix and "<HeatStrip" in ix, "compact strip on the Index", "no compact strip on the Index")

# ── 5 · Class now ────────────────────────────────────────────────────────
n = code["now"]
pg = code["page"]
check('{ key: "now", label: "🟢 Class now" }' in pg and pg.find('key: "now"') < pg.find('key: "overview"'),
      "Class now is the first panel", "Class now is not first on the rail")
check('useState<PanelKey>("now")' in pg, "Class now is the default panel", "the default panel is not Class now")
check("sm:grid-cols-4" in n and "class-tile" in n, "the board is a 4-wide grid of tiles", "no 4×4 tile grid")
check("export function tileRank" in n and "tileRank(a) - tileRank(b)" in n, "tiles sort worst-first", "no worst-first sort")
check("STUCK_RUN = 3" in n and "STUCK_WINDOW_MS = 20 * 60_000" in n, "stuck = 3 misses on one outcome inside 20 min",
      "the stuck rule is not 3 in 20 min")
check("REPOLL_MS = 30_000" in n and "REPOLL_MS" in pg and 'document.visibilityState === "hidden"' in pg,
      "30 s repoll, paused while hidden", "no 30 s repoll with a hidden-tab pause")
check("fetchResponsesSince(" in pg, "the repoll fetches only what is newer", "the repoll does not use fetchResponsesSince")
check("class-matrix" in n and "unitNumbers().map" in n and "siosForUnit(u).map" in n and "Class" in n,
      "outcome × student matrix over every SIO with a Class column", "no outcome × student matrix")
check("outcomeAccuracy(d.responses)" in n and "fetch" not in n.replace("fetched", ""),
      "the matrix is a memo over the shared map — no fetch of its own", "ClassNow fetches")

# ── 6 · one fetch, no Compute ────────────────────────────────────────────
d = code["data"]
check("export async function fetchClassDetails" in d and "POOL_SIZE" in d, "fetchClassDetails with a pool", "no pooled class fetch")
check("fetchClassDetails(roster" in pg, "the page fetches the class once", "page.tsx does not call fetchClassDetails")
for k, tag in (("now", "<ClassNow"), ("students", "<Students"), ("reports", "<Reports")):
    check(re.search(re.escape(tag) + r"[^>]*details=\{details\}", pg) is not None,
          f"{tag} receives the shared details map", f"{tag} is not handed details=")
ev = code["evidence"]
check(">Compute" not in ev and "Recompute" not in ev and '"Compute"' not in ev, "the Compute button is gone", "Evidence still has a Compute button")
check("fetchStudentDetail" not in ev and "useMemo" in ev, "Evidence is a memo over the shared map", "Evidence still fetches")
check('where("timestamp", ">"' in d, "fetchResponsesSince is a timestamp range query", "the repoll re-reads whole logs")
check("cached ?? fetchedDetail" in code["students"], "the student panel reuses the pooled detail", "the student panel refetches")

# ── 7 · fixture ──────────────────────────────────────────────────────────
check('process.env.NEXT_PUBLIC_TEACHER_FIXTURE === "1"' in d, "FIXTURE is the inlined build flag", "FIXTURE is not the build flag")
static_import = re.search(r'^import .* from "\./fixture"', "\n".join(code[k] for k in ("data", "page", "students", "now", "reports")), re.M)
check(static_import is None and 'import("./fixture")' in d, "fixture.ts only via dynamic import", "fixture.ts is statically imported")
envs = [p for p in glob.glob(".env*") if "TEACHER_FIXTURE" in read(p)]
check(not envs, "no committed .env sets the fixture flag", f"fixture flag set in {envs}")
check(not re.search(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}", code["fixture"]), "fixture carries no email", "fixture.ts contains an email")
check("|| FIXTURE" in pg, "the gate opens for the fixture build only", "page.tsx does not consult FIXTURE")

# The fixture chunk (Turbopack still emits the dynamic-import target as its
# own orphan file) must be referenced by NO page — only the dead branch knows
# its name. Runs when out/ exists (CI builds first).
if os.path.isdir("out"):
    fx = [f for f in glob.glob("out/_next/static/chunks/*.js") if "Élève Un" in read(f)]
    names = [os.path.basename(f) for f in fx]
    pages = [h for h in glob.glob("out/**/*.html", recursive=True) if any(n in read(h) for n in names)]
    check(not pages, f"fixture chunk ({len(names)} file) is referenced by no page", f"fixture chunk referenced by {pages[:3]}")

# ── 8 · tokens only ──────────────────────────────────────────────────────
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
for k in ("rows", "strip", "moi", "now", "fixture"):
    check(not HEX.search(raw[k]), f"no hex literal in {os.path.basename(F[k])}", f"hex literal in {F[k]}")

# ── 9 · CI ───────────────────────────────────────────────────────────────
wf = read(".github/workflows/verify.yml")
check("verify/verify26.py" in wf and wf.find("verify26") > wf.find("verify24"), "CI runs verify26 after verify24", "verify26 not wired after verify24")

print("\npatch 26 check — /moi + teacher\n" + "-" * 66)
for m_ in OK:
    print("  ok    " + m_)
for m_ in FAIL:
    print("  FAIL  " + m_)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
