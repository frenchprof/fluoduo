#!/usr/bin/env python3
"""
iComplete's route is gone, and SIO-010 sits all three audiences as tabs.

Two of Dan's answers on 31 Aug, put to him with the options side by side:

  2. "iComplete is to be deleted, or at least converted to Intermediaire and
      Difficile within Memo"
  3. "B - but as a choice (3 side by side tabs to tap on to display the
      different relevant content)"

── iCOMPLETE ────────────────────────────────────────────────────────────────

The conversion half had already landed: the Memo ladder's Moyen IS "complete
the sentence, one piece missing" and Difficile IS two pieces (#97, and Dan's
own classification of CompleteIt). #99 then took away the standalone drill's
door. What was left was 558 lines of route that nothing linked to — reachable
only by typing the URL, and drifting from the ladder that had replaced it.

The delicate part is NOT the deletion, it is what happens to answers already
banked under `/practice/complete-it/aliments`. Those ids sit in real response
documents and the history page turns a path-shaped id into its own link, so
deleting the page turns a learner's July work into a 404. The fix is to split
the two jobs the id was doing: it still NAMES ("Complete It", from PATH_NAMES),
it no longer LINKS (RETIRED_ROUTES). Labelled, not linked — a row that read
"(unlabelled)" would erase the work instead.

── SIO-010 ──────────────────────────────────────────────────────────────────

The picker scoped a run: tap one of three audiences, answer its seven, done. A
learner met `tu` or `vous` and never the contrast — which is the entire stop.
Now three tabs, all three sat.

Tabs, not one pool of 21: "how do you ask their name" has no answer until the
audience is settled, so the tab is the question's other half, not decoration.
And the three runs stay MOUNTED (hidden), because someone who answers the
student's seven, taps Client and taps back to compare must find their answers
still there — comparing is the point, and the keyed remount that used to give
a clean run would silently wipe them. That has two costs this suite pins,
because both are invisible until a learner hits them: number keys heard by
three mounted runs at once, and a scroll-into-view that finds the first
mounted run's active question rather than the visible one's.

WHAT IS PINNED

  1  The route is deleted and nothing imports its body.
  2  A banked complete-it answer still gets its NAME, and no longer a link.
  3  The Memo ladder still carries the conversion — Moyen one piece, Difficile
     two. If that ever stops being true, deleting the drill deleted an
     exercise rather than moving it.
  4  Three tabs, side by side, with a real situation selected from the start.
  5  All three mounted, hidden — never unmounted, never a `sit && ` render.
  6  The number keys answer only the visible tab.
  7  The scroll is scoped to its own run, not document-wide.
  8  The register (informal/formal) is on the tab face: it decides every answer
     from Q2 on, so it is exactly the text Dan's litmus test keeps.
  9  The page's count does not promise a flat 21.

Run from the repo root:  python3 verify/verify70-icomplete-cut-sio010-tabs.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(src):
    """Source with comments stripped.

    Every file here EXPLAINS in prose what it no longer does — "complete-it",
    "picker" and "unmounted" all appear in comments describing the change. A
    raw-text scan would pass on the documentation, and worse, would let a real
    re-introduction hide behind the words that excuse it.
    """
    src = re.sub(r"\{/\*[\s\S]*?\*/\}", "", src)
    src = re.sub(r"/\*[\s\S]*?\*/", "", src)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


def body_of(src, header):
    """The text of one function, from its signature to the next top-level `}`.

    Assertions below name CONSTRUCTS inside a specific function, never a bare
    name anywhere in the file — four vacuous assertions of exactly that shape
    were caught by break-testing on 31 Aug (a name matched by an import line,
    a comment, or the helper's own definition). AGENTS.md carries the rule.
    """
    i = src.find(header)
    if i < 0:
        return ""
    j = src.find("\n}\n", i)
    return src[i : j + 3] if j > 0 else src[i:]


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

ROUTE = "src/app/practice/complete-it"
LABELS = "src/lib/labels.ts"
ENTRY = "src/lib/lessonEntry.ts"
PRETEST = "src/components/Unit0Pretest.tsx"
BANK = "src/content/sios/unit0-questions.ts"
PAGE = "src/app/pretests/unit0/[sioId]/Content.tsx"

labels, entry = code(read(LABELS)), code(read(ENTRY))
pretest, bank, page = code(read(PRETEST)), code(read(BANK)), code(read(PAGE))

# ---- 1 · the route is gone, and nothing imports its body -------------------
ok(not os.path.isdir(ROUTE),
   "the standalone iComplete route is deleted",
   f"{ROUTE}/ is back — the drill lives in the Memo ladder now, not at its own URL")
importers = []
for root, _dirs, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")) and "CompleteItContent" in code(read(os.path.join(root, f))):
            importers.append(os.path.join(root, f))
ok(not importers,
   "nothing imports CompleteItContent",
   f"still importing the deleted drill body: {importers[:3]}")

# ---- 2 · a banked answer keeps its NAME and loses its LINK -----------------
# The name: two tables, because an id can arrive as a path OR as a key.
ok('["/practice/complete-it/", "Complete It"]' in labels,
   "a banked complete-it PATH still resolves to the name Complete It",
   "the path label is gone — a learner's July answers would read as a raw id")
ok(re.search(r'"complete-it":\s*\{\s*name:\s*"Complete It"', labels) is not None,
   "a banked complete-it KEY still resolves to the name Complete It",
   "the key label is gone — those rows would read '(unlabelled)', erasing the work")
# The link: null, both ways in.
ok(re.search(r'"complete-it":\s*\{[^}]*href:\s*\(\)\s*=>\s*null', labels) is not None,
   "the key surface's href is null — labelled, not linked",
   "the key surface still builds a /practice/complete-it/ href, which is now a 404")
# The path branch: `if (id.startsWith('/')) return id` would hand back the dead
# route unchanged, so the guard has to sit INSIDE hrefForActivity and BEFORE it.
href_body = body_of(labels, "export function hrefForActivity(")
ok("RETIRED_ROUTES" in href_body,
   "hrefForActivity checks the retired-route list",
   "hrefForActivity does not consult RETIRED_ROUTES — a path-shaped id is its own href, so the row would link to a 404")
ok(href_body.find("RETIRED_ROUTES") < href_body.find('id.startsWith("/")'),
   "the retired-route check runs BEFORE the path-is-its-own-href branch",
   "the retired-route check runs after the path branch, which has already returned the dead route")
ok(re.search(r'RETIRED_ROUTES\s*=\s*\[[^\]]*"/practice/complete-it/"', labels) is not None,
   "the deleted route is named in RETIRED_ROUTES",
   "RETIRED_ROUTES does not name /practice/complete-it/ — the deleted page would still be linked")

# ---- 3 · the ladder still carries the exercise ----------------------------
# Deleting the drill is only safe while the Memo tiers ARE it. Assert the two
# tiers by their meaning, not by the word "iComplete" in a comment.
ok(re.search(r'name:\s*"Moyen",\s*blurb:\s*"[^"]*one piece missing', entry) is not None,
   "the Memo ladder's Moyen is still one-piece completion",
   "Moyen no longer completes one missing piece — deleting the drill deleted the exercise")
ok(re.search(r'name:\s*"Difficile",\s*blurb:\s*"[^"]*two pieces missing', entry) is not None,
   "the Memo ladder's Difficile is still two-piece completion",
   "Difficile no longer completes two missing pieces — deleting the drill deleted the exercise")

# ---- 4 · three tabs, side by side, one selected from the start ------------
sio010 = body_of(pretest, "export function Sio010Pretest(")
ok(bool(sio010), "Sio010Pretest exists", "Sio010Pretest is missing — SIO-010 has no audience control at all")
ok('role="tablist"' in sio010 and 'role="tab"' in sio010,
   "the audiences are a tab strip",
   "the audiences are no longer a tablist — Dan asked for tabs, and a screen reader needs the role")
ok("grid-cols-3" in sio010,
   "the three tabs sit side by side",
   "the tabs no longer lay out three across — Dan: '3 side by side tabs'")
ok(re.search(r"useState\(SIO010_SITUATIONS\[0\]\.key\)", sio010) is not None,
   "a real situation is selected from the start — no empty picker screen",
   "the selection starts null again; the page opens on a picker with no questions on it")

# ---- 5 · all three mounted, hidden — never unmounted ----------------------
maps = len(re.findall(r"SIO010_SITUATIONS\.map\(", sio010))
ok(maps == 2,
   "the situations are mapped twice — once as tabs, once as panes",
   f"the situations are mapped {maps} times; two is the shape that keeps every run mounted behind its tab")
ok("hidden={" in sio010,
   "the inactive runs are HIDDEN, not unmounted — switching tabs keeps answers",
   "the inactive runs are no longer hidden; a conditional render would wipe answers on every tab switch")
ok(re.search(r"\{\s*sit\s*&&", sio010) is None,
   "no single-situation conditional render",
   "one situation is rendered conditionally again — the other two are unmounted and their answers gone")
ok("key={sit.key}" not in sio010,
   "no keyed remount on the situation",
   "the run is keyed on the situation again, which deliberately restarts it — that is the answer-wipe")

# ---- 6 · the number keys answer only the visible tab ----------------------
ok(re.search(r"keys=\{s\.key === key\}", sio010) is not None,
   "only the visible tab takes the number keys",
   "every mounted run takes the number keys — one press would answer three questions, two of them unseen")
u0 = body_of(pretest, "export function Unit0Questions(")
ok(re.search(r"enabled:\s*keys &&", u0) is not None,
   "Unit0Questions honours the keys flag",
   "the keys flag is not wired into useChoiceKeys — passing it changes nothing")

# ---- 7 · the scroll is scoped to its own run ------------------------------
ok('document.querySelector("[data-u0q-active]")' not in u0,
   "the active question is looked up within the run, not document-wide",
   "the scroll uses a document-wide lookup: with three runs mounted it finds the FIRST one's active question and scrolls away from what was tapped")
ok(re.search(r"box\.current\?\.querySelector", u0) is not None,
   "the lookup is scoped to this run's own container",
   "the scoped lookup is gone — see above")

# ---- 8 · the register is on the tab face ---------------------------------
# tu-or-vous is what decides every answer from Q2 on. Dan's litmus test keeps
# text a learner needs to find the right answer; this is that text.
for field in ("who", "register"):
    n = len(re.findall(r"^\s*%s: \"" % field, bank, flags=re.M))
    ok(n == 3,
       f"all three situations carry `{field}`",
       f"{n} of 3 situations carry `{field}` — a tab would render blank")
ok("{s.register}" in sio010,
   "the tab shows its register (informal / formal)",
   "the register is no longer rendered — three tabs that differ only by a noun do not say what the choice is between")
ok("aria-label={s.label}" in sio010,
   "the full audience sentence is the tab's accessible name",
   "the tab has no accessible name; its two short lines read as a fragment")

# ---- 9 · the page's count is honest --------------------------------------
ok("SIO010_SITUATIONS[0].questions.length" in page,
   "the page counts one situation's questions, not all three flattened",
   "the page prints SIO-010's flattened bank size — 21 in one number reads as one very long run")
ok("SIO010_SITUATIONS.length" in page,
   "the page says how many situations there are",
   "the page no longer says there are three situations — a learner would not know two more tabs are waiting")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
