#!/usr/bin/env python3
"""
Patch 24 — the Index redesign (2026-08-17).

The plan rows (UI_WORK_PLAN_1.md → PATCH 24): activity chip rail + unit
segmented control + ten rows (one per SIO of the selected unit), state in
the URL; the matrix cell says how you did (tier colour / ring / dash), not
whether the link works; the activity hub pages are redirects into the Index
with the activity preselected; `?gaps=1` is the authoring backlog; xPlain /
4Mémoire / WorDrill are per-row buttons, not columns.

What this asserts (static, over source):

  1  The Index page: chip rail (role=tablist) + unit group + rows; state
     read from ?activity / ?unit / ?gaps and written with replaceState;
     no <table> of activity columns for the learner view; the old
     HEAD/HEAD_TITLES/HEAD_CHIPS lists are gone.
  2  indexMatrix: chips = the content-gated activities, buttons = the three
     every deck has; both drawn from the registry; hrefs via
     deckActivityTabs (eligibility not re-derived); Pre-Test folds into the
     SpecuLearn cell; every SIO has a deck (rows = SIOs is sound).
  3  The cell: three states (tried → tier token + number, open → ring,
     none → dash); tier tokens only; the ledger is the source.
  4  activityLedger: recordResponse writes it (one writer), Index reads it,
     tier scale matches /moi (50 / 75).
  5  Hubs: ActivityHub.tsx deleted; /practice/flip-it, /practice/grammarathon,
     /practice/speculearn render IndexRedirect → /activities?activity=…;
     the registry hrefs for those three point into the Index; verify19's
     route check tolerates the query.
  6  ?gaps=1: GapsView exists, iterates all SIOS, counts per column, and is
     not linked from the learner chrome.
  7  No hex literal in the new files (tokens only, verify19b's rule).
  8  CI runs this file after verify23.

Run from the repo root:  python3 verify/verify24.py
"""
import os, re, sys, json

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

page = read("src/app/activities/page.tsx")
pcode = strip_comments(page)
matrix = read("src/lib/indexMatrix.ts")
mcode = strip_comments(matrix)
ledger = read("src/lib/activityLedger.ts")
lcode = strip_comments(ledger)
responses = strip_comments(read("src/lib/firebase/responses.ts"))
reg = read("src/content/activities.ts")
redirect = read("src/components/IndexRedirect.tsx")
css = read("src/app/globals.css")

# ── 1 · the page ─────────────────────────────────────────────────────────
check('role="tablist"' in pcode and "index-chips" in pcode,
      "chip rail is a tablist", "no chip rail (role=tablist / .index-chips) on the Index")
check('aria-label="Unit"' in pcode and "grid-cols-5" in pcode,
      "unit segmented control has five segments", "no five-segment unit control")
check("siosOfUnit(url.unit)" in pcode and "index-rows" in pcode,
      "rows are the SIOs of the selected unit", "rows are not siosOfUnit(unit)")
for param in ('q.get("activity")', 'q.get("unit")', 'q.get("gaps")'):
    check(param in pcode, f"URL state read: {param}", f"URL state not read: {param}")
check("history.replaceState" in pcode, "URL state written with replaceState",
      "state is not written back to the URL")
check('"popstate"' in pcode and "useSyncExternalStore" in pcode, "Back/Forward re-read the URL",
      "no popstate listener — Back does not move the Index")
for stale in ("HEAD_TITLES", "HEAD_CHIPS", "cellsFor(", "<details", "minWidth: 560"):
    check(stale not in pcode, f"old matrix artefact gone: {stale}",
          f"old matrix artefact still present: {stale}")
# The learner view has no activity-column table; only GapsView (Dan's) may.
learner_view = pcode.split("function GapsView")[0]
check("<table" not in learner_view, "learner view is rows, not a table",
      "learner view still renders a <table>")

# ── 2 · indexMatrix ──────────────────────────────────────────────────────
check("CHIP_KEYS" in mcode and "ROW_BUTTON_KEYS" in mcode,
      "chip keys and row-button keys are declared in one place",
      "indexMatrix does not declare CHIP_KEYS / ROW_BUTTON_KEYS")
chips = re.search(r"CHIP_KEYS = \[([^\]]*)\]", mcode)
btns = re.search(r"ROW_BUTTON_KEYS = \[([^\]]*)\]", mcode)
chip_keys = re.findall(r'"([a-z]+)"', chips.group(1)) if chips else []
btn_keys = re.findall(r'"([a-z]+)"', btns.group(1)) if btns else []
check(set(btn_keys) == {"lesson", "flip", "wordrill"},
      "row buttons are xPlain · 4Mémoire · WorDrill", f"row buttons are {btn_keys}")
check(not set(chip_keys) & set(btn_keys), "no activity is both a chip and a button",
      f"overlap: {set(chip_keys) & set(btn_keys)}")
reg_keys = set(re.findall(r'\{ key: "([a-z]+)", name:', reg))
check(set(chip_keys) <= reg_keys and set(btn_keys) <= reg_keys,
      "every chip/button key is a registry key",
      f"keys not in the registry: {set(chip_keys + btn_keys) - reg_keys}")
check("deckActivityTabs(" in mcode, "cell hrefs come from deckActivityTabs (eligibility not re-derived)",
      "indexMatrix re-derives eligibility instead of asking deckActivityTabs")
for banned in ("isLexReadyId(", "getLetrisSet(", "composeBankForDeck(", "isPlayableGap"):
    check(banned not in mcode and banned not in pcode,
          f"no private eligibility rule: {banned}",
          f"{banned} used on the Index — a second definition of eligibility")
check('find("pretest")' in mcode, "Pre-Test folds into the SpecuLearn cell",
      "the SpecuLearn cell ignores the pretest — decks with only a pretest lose their door")

# rows = SIOs is sound only if every SIO owns a deck that exists.
try:
    sios = json.load(open("src/content/sios/sios.json", encoding="utf-8"))
    deck_ids = {os.path.basename(f)[:-5] for f in os.listdir("src/content/collections") if f.endswith(".json")}
    no_deck = [s["id"] for s in sios if not s.get("collectionId")]
    per_unit = {}
    for s in sios:
        per_unit[s["unit"]] = per_unit.get(s["unit"], 0) + 1
    check(len(sios) == 50 and not no_deck, "50 SIOs, every one with a deck",
          f"{len(sios)} SIOs, without deck: {no_deck}")
    check(all(n == 10 for n in per_unit.values()), "ten SIOs per unit — ten rows",
          f"SIOs per unit: {per_unit}")
except Exception as e:
    check(False, "", f"could not read sios.json: {e}")

# ── 3 · the cell ─────────────────────────────────────────────────────────
check("function ResultCell" in pcode, "ResultCell exists", "no ResultCell component")
for state in ("index-cell-tried", "index-cell-open", "index-cell-none"):
    check(state in pcode, f"cell state rendered: {state}", f"cell state missing: {state}")
check("tierToken(pct)" in pcode, "tried cells wear the tier token",
      "tried cells do not use tierToken")
check("accuracyFor(ledger" in pcode, "cell accuracy comes from the ledger",
      "cell does not read the ledger")
check("isSioDone(" in pcode, "✓ on the stop once the outcome is done", "isSioDone not consulted")

# ── 4 · the ledger ───────────────────────────────────────────────────────
check("noteAttempt(item, correct" in responses, "recordResponse writes the ledger",
      "recordResponse does not call noteAttempt — the ledger has no writer")
writers = [f for f in ("src/lib/progress.ts", "src/app/activities/page.tsx") if "noteAttempt(" in strip_comments(read(f))]
check(not writers, "one writer (recordResponse)", f"extra ledger writers: {writers}")
check("normalizePath(" in lcode, "ledger normalises renamed routes (letris → vocabularain…)",
      "ledger does not normalise activityIds")
check("pct < 50" in lcode and "pct < 75" in lcode, "tier thresholds 50 / 75",
      "ledger tier thresholds differ from /moi's")
check('"fluolingo:activityLedger"' in lcode, "ledger key namespaced", "ledger key not namespaced")

# ── 5 · hubs → redirects ─────────────────────────────────────────────────
check(not os.path.isfile("src/components/ActivityHub.tsx"), "ActivityHub.tsx deleted",
      "ActivityHub.tsx still exists")
check("window.location.replace(" in redirect and "/activities?activity=" in redirect,
      "IndexRedirect replaces into /activities?activity=…",
      "IndexRedirect does not redirect into the Index")
for route, key in (("flip-it", "flip"), ("grammarathon", "grammarathon"), ("speculearn", "speculearn")):
    src = read(f"src/app/practice/{route}/page.tsx")
    check(f'<IndexRedirect activity="{key}" />' in src, f"/practice/{route} → Index ({key})",
          f"/practice/{route} is not a redirect into the Index")
    check(f'href: "/activities?activity={key}"' in reg, f"registry: {key} points into the Index",
          f"registry href for {key} still points at the old hub")
check("ActivityHub" not in "".join(read(f"src/app/practice/{r}/page.tsx") for r in ("flip-it", "grammarathon")),
      "no hub page renders ActivityHub", "a hub page still renders ActivityHub")
check('href.split("?")[0]' in read("verify/verify19.py"), "verify19 tolerates the query in registry hrefs",
      "verify19 will fail on /activities?activity=…")

# ── 6 · gaps ─────────────────────────────────────────────────────────────
check("function GapsView" in pcode and "gapCells()" in pcode, "GapsView reads gapCells()",
      "no GapsView / gapCells")
check("SIOS.map(" in pcode.split("function GapsView")[-1], "gaps view walks all fifty SIOs",
      "gaps view does not iterate SIOS")
chrome = "".join(read(f) for f in ("src/components/CahierShell.tsx", "src/components/BottomBar.tsx",
                                   "src/components/siteTabs.ts", "src/content/nav.ts", "src/content/activities.ts"))
check("gaps=1" not in chrome, "?gaps=1 is not linked from the learner chrome",
      "?gaps=1 is linked from the chrome — it is Dan's view")

# ── 7 · tokens only ──────────────────────────────────────────────────────
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
for f in ("src/app/activities/page.tsx", "src/lib/indexMatrix.ts", "src/lib/activityLedger.ts",
          "src/components/IndexRedirect.tsx"):
    check(not HEX.search(read(f)), f"no hex literal in {os.path.basename(f)}",
          f"hex literal in {f}")
check(".index-chips" in css, "Index CSS in globals (scrollbar-less rail)", "no .index-chips rule")

# ── 8 · CI ───────────────────────────────────────────────────────────────
wf = read(".github/workflows/verify.yml")
check("verify/verify24.py" in wf, "CI runs verify24", "verify24 is not wired into verify.yml")
check(wf.find("verify23.py") < wf.find("verify24.py"), "verify24 runs after verify23",
      "verify24 is wired before verify23")

print("\npatch 24 check\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
