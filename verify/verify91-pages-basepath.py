#!/usr/bin/env python3
"""
A custom domain serves at the ROOT, so the Pages build must not set a subpath.

Dan, 2026-09-02, reading the workflow rather than the site: *"That workflow
builds with PAGES_BASE_PATH: /fluoduo, which makes every asset and route
resolve under /fluoduo/. That's correct for frenchprof.github.io/fluoduo/, but
the site is now served at the root of fluolingo.com."* He was right, and it had
been live for seventeen days.

HOW IT HAPPENED, because the shape matters more than the line. Commit 79a9938b
(17 Aug) added BOTH halves at once:

    .github/workflows/pages-preview.yml   PAGES_BASE_PATH: /fluoduo
    CNAME                                 fluolingo.com

Each is correct on its own and they contradict each other. A GitHub Pages
PROJECT site lives at owner.github.io/repo/ and needs the subpath; attach a
custom domain and the very same artifact is served at that domain's ROOT, so
the subpath becomes wrong. Nothing in the repo compared the two files, so the
build went on emitting `/fluoduo/_next/…` for a site served at `/`: the HTML
loaded and every stylesheet and script 404'd.

Three things made it survive:

  · IT LOOKS FINE IN EVERY DIFF. Neither file is wrong by itself, and no diff
    ever shows both.
  · THE COMMENTS ASSERTED THE WRONG PREMISE AS FACT. next.config.ts said
    "GitHub Pages serves a project site from a SUBDIRECTORY
    (frenchprof.github.io/fluoduo/)", and pages-preview.yml called itself a
    preview that "DOES NOT TOUCH PRODUCTION". Both were true on 17 Aug for
    about an hour. Anyone auditing this read them and moved on.
  · NO CHECK COULD SEE IT. Every other check in verify/ reads the app; this
    fault is in how the app is DEPLOYED, and the app is identical either way.

WHAT IS PINNED

  1  A CNAME and a PAGES_BASE_PATH cannot coexist. The CNAME file is the
     repo's one written statement that a custom domain is in play; while it
     exists, the Pages workflow must build at the root.
  2  THE WORKFLOW THAT UPLOADS THE PAGES ARTIFACT IS THE ONE CHECKED, found by
     what it DOES (upload-pages-artifact / deploy-pages) rather than by its
     filename — the file is called "pages-preview" and stopped being a preview
     on its first day, so its name is the least reliable thing about it.
  3  NOTHING ELSE SETS THE VARIABLE EITHER. A subpath exported from a step, a
     job env or the workflow env would reach the build just the same.
  4  next.config.ts STILL DEFAULTS TO ROOT. `?? ""` is what makes an unset
     variable safe; a default of "/fluoduo" would restore the bug with no
     workflow change at all.
  5  THE HEADER NO LONGER CALLS IT A PREVIEW THAT MISSES PRODUCTION. That
     sentence is why five audits walked past this, and a comment that lies
     about what a workflow deploys is a defect in its own right.

Run from the repo root:  python3 verify/verify91-pages-basepath.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def uncommented(src):
    """YAML with its # comments stripped.

    The workflow now EXPLAINS this fault at length, and the explanation
    necessarily contains the string `PAGES_BASE_PATH`. Scanning the raw file
    would fail on its own documentation — and, worse, a future reader would
    delete the explanation to make the check pass.
    """
    return re.sub(r"^\s*#.*$", "", src, flags=re.M)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

# ---- 0 · find the workflow by what it DOES --------------------------------
WF_DIR = ".github/workflows"
pages_wfs = []
for name in sorted(os.listdir(WF_DIR)) if os.path.isdir(WF_DIR) else []:
    body = read(os.path.join(WF_DIR, name))
    if "upload-pages-artifact" in body or "actions/deploy-pages" in body:
        pages_wfs.append((name, body))
ok(len(pages_wfs) == 1,
   f"exactly one workflow deploys to GitHub Pages ({pages_wfs[0][0] if pages_wfs else '—'})",
   f"expected one Pages-deploying workflow, found {len(pages_wfs)}: "
   f"{[n for n, _ in pages_wfs]} — this check would be reading the wrong one")

# ---- 1 · the contradiction that shipped -----------------------------------
cname = read("CNAME").strip()
ok(bool(cname),
   f"a custom domain is declared in CNAME ({cname})",
   "CNAME is gone — if the custom domain really has been retired, this whole check "
   "should be retired with it rather than left passing vacuously")

for name, body in pages_wfs:
    code = uncommented(body)
    ok("PAGES_BASE_PATH" not in code,
       f"{name} builds at the ROOT, as a custom domain requires",
       f"{name} sets PAGES_BASE_PATH while CNAME says {cname or 'a custom domain'} — "
       "a custom domain serves the site at the domain root, so every asset would resolve "
       "under that subpath and 404. This exact pair was live for 17 days from 17 Aug.")
    # 5 · and it no longer describes itself as harmless. QUOTED history is
    # allowed — the 3 Sep correction cites the old wrong sentences in quotes
    # to explain them; what must never return is the file ASSERTING them.
    ok(re.search(r'(?<!")(?:DOES NOT TOUCH PRODUCTION|entirely separate from production)(?!")', body) is None,
       f"{name} does not claim to miss production",
       f"{name} calls itself separate from production again, unquoted. The truth "
       "(3 Sep) is subtler and worse: its artifact is reachable at no URL, but "
       f"GitHub Pages holds a live claim on {cname or 'the custom domain'} — one "
       "DNS change hands the domain to whatever this file built. Harmless it is not.")

# ---- 3 · nothing anywhere else sets it ------------------------------------
# A workflow-level `env:`, a job `env:`, or a plain `export` in a run block all
# reach the build. Scanned across every workflow, not just the Pages one.
setters = []
for name in sorted(os.listdir(WF_DIR)) if os.path.isdir(WF_DIR) else []:
    if re.search(r"PAGES_BASE_PATH\s*[:=]", uncommented(read(os.path.join(WF_DIR, name)))):
        setters.append(name)
ok(not setters,
   "no workflow sets PAGES_BASE_PATH at all",
   f"PAGES_BASE_PATH is set in {setters} — a job env or an `export` in a run block reaches "
   "the build exactly as a step env does")

# ---- 4 · and the default is still the root --------------------------------
cfg = read("next.config.ts")
ok(re.search(r'process\.env\.PAGES_BASE_PATH\s*\?\?\s*""', cfg) is not None,
   "next.config.ts defaults an unset PAGES_BASE_PATH to the root",
   "next.config.ts no longer defaults to \"\" — a non-empty default puts the subpath back "
   "on both live sites without touching a workflow")
ok("/fluoduo" not in re.sub(r"/\*[\s\S]*?\*/", "", cfg),
   "and it hard-codes no subpath",
   "next.config.ts hard-codes /fluoduo outside a comment — the one thing its own docstring "
   "has told three sessions not to do")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
