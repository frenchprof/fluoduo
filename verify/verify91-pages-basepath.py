"""
The Pages build must match the home GitHub currently serves it at — both ways.

TWICE NOW the same fault has shipped, in opposite directions, because the
correct setting is not a fact about this repository. It is a fact about a
DASHBOARD SETTING nobody working here can see.

    17 Aug   custom domain ATTACHED    home moved to a root
             build still /fluoduo   -> every asset 404'd for 17 days
    3 Sep    #157 dropped the subpath, correctly, for a root
    2-5 Sep  custom domain CLEARED     home moved back to a subpath
             build still root-relative -> every asset 404s again, mirrored

The mechanism, once: a page carries links to its own CSS and JS, and those
links must match the folder the site sits in. `/fluoduo/_next/app.css` is right
in a folder and wrong at a root; `/_next/app.css` is the reverse. The HTML
loads either way, which is why it reads as a plain page rather than an error
and why nobody reports it.

WHAT CHANGED IN THIS CHECK, and why the first version was not enough. It keyed
on the root CNAME file: "a CNAME exists, therefore a custom domain serves this
at a root, therefore no subpath". That inference was wrong in a way worth
recording — the CNAME file is not copied into the uploaded artifact, so GitHub
never reads it; the binding lives in Settings -> Pages. When the setting was
cleared the file stayed, so the check went on enforcing a root that no longer
existed. A check that infers a remote setting from a local file inherits every
way the two can disagree.

SO THE WORKFLOW NOW DECLARES ITS HOME, in one line beside the build, and this
check holds the build to the declaration in BOTH directions. The declaration is
a human writing down what the deploy log said; the check makes sure the build
agrees with it. It cannot verify the declaration itself — nothing in the repo
can — and it says so rather than pretending otherwise.

WHERE THE TRUTH ACTUALLY IS. `actions/deploy-pages` prints it on every run:

    Evaluated environment url: https://frenchprof.github.io/fluoduo/

Read that, not a comment, whenever this comes up again.

WHAT IS PINNED

  1  THE DECLARATION EXISTS and is one of the two legal values. Without it the
     rest of this check has nothing to hold the build against.
  2  DECLARATION AND BUILD AGREE, both ways round. `subpath` requires
     PAGES_BASE_PATH and it must equal the repo name; `root` forbids it. One
     direction alone is what let the second failure through.
  3  THE WORKFLOW IS FOUND BY WHAT IT DOES (upload-pages-artifact /
     deploy-pages), never by its filename — this file has been called both
     "pages-preview" and "Deploy fluolingo.com" inside three weeks.
  4  NOTHING ELSE SETS THE VARIABLE. A job env or an `export` in a run block
     reaches the build exactly as a step env does.
  5  next.config.ts STILL DEFAULTS TO ROOT and hard-codes no subpath. `?? ""`
     is what keeps an unset variable safe.
  6  THE HEADER DOES NOT CALL ITSELF HARMLESS. That sentence is why five audits
     walked past the first failure.

NOT PINNED, deliberately: the CNAME file. It is not in the artifact and GitHub
does not read it, so it is documentation at best — and it was authoritative-
looking documentation that caused the second failure. If one is present and
disagrees with the declaration, this check SAYS SO without failing: deleting it
is a repository decision, not a build correctness one.

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

# ---- 1 · the declaration ---------------------------------------------------
REPO = "fluoduo"          # the project-site folder: owner.github.io/<REPO>/
notes = []

for name, body in pages_wfs:
    code = uncommented(body)
    m = re.search(r"PAGES_HOME:\s*(\w+)", code)
    home = m.group(1) if m else None
    ok(home in ("subpath", "root"),
       f"{name} declares the home it builds for (PAGES_HOME: {home})",
       f"{name} declares no PAGES_HOME (or an unknown one: {home!r}). It must say `subpath` or "
       "`root` — whichever the deploy log's \"Evaluated environment url\" last showed — because "
       "nothing in this repo can work that out for itself")

    # ---- 2 · the build must agree with it, BOTH ways round -----------------
    bp = re.search(r"PAGES_BASE_PATH:\s*(\S+)", code)
    if home == "subpath":
        ok(bp is not None and bp.group(1) == f"/{REPO}",
           f"and it builds for that subpath (PAGES_BASE_PATH: /{REPO})",
           f"{name} declares home=subpath but PAGES_BASE_PATH is "
           f"{bp.group(1) if bp else 'unset'} — at https://<owner>.github.io/{REPO}/ every asset "
           f"would resolve to the github.io ROOT, which is a different site, and 404. This is the "
           "5 Sep failure exactly.")
    elif home == "root":
        ok(bp is None,
           "and it builds at the root, as a custom domain requires",
           f"{name} declares home=root but sets PAGES_BASE_PATH: {bp.group(1) if bp else ''} — "
           "every asset would resolve under a folder that does not exist. This is the 17 Aug "
           "failure exactly, which was live for seventeen days.")

    # ---- 6 · and it does not call itself harmless -------------------------
    # QUOTED history is allowed: the header cites the old wrong sentences to
    # explain them. What must never return is the file ASSERTING them.
    ok(re.search(r'(?<!")(?:DOES NOT TOUCH PRODUCTION|entirely separate from production)(?!")', body) is None,
       f"{name} does not claim to miss production, unquoted",
       f"{name} asserts it is separate from production again. It has held a claim on a live "
       "hostname once already; one dashboard change hands the domain back to whatever it built.")

    # ---- the CNAME, reported and NOT enforced ------------------------------
    cname = read("CNAME").strip()
    if cname and home == "subpath":
        notes.append(
            f"NOTE (not a failure): a root CNAME names {cname}, but this builds for a subpath. "
            "GitHub never reads that file — it is not in the uploaded artifact — so it changes "
            "nothing; it is a leftover that reads as authoritative, and reading it as "
            "authoritative is what caused the 5 Sep failure. Worth deleting.")

# ---- 3 · nothing anywhere else sets it ------------------------------------
# A workflow-level `env:`, a job `env:`, or a plain `export` in a run block all
# reach the build. Scanned across every workflow, not just the Pages one.
setters = []
for name in sorted(os.listdir(WF_DIR)) if os.path.isdir(WF_DIR) else []:
    if re.search(r"PAGES_BASE_PATH\s*[:=]", uncommented(read(os.path.join(WF_DIR, name)))):
        setters.append(name)
ok(setters == [n for n, _ in pages_wfs] or not setters,
   "only the Pages workflow sets PAGES_BASE_PATH, if anything does",
   f"PAGES_BASE_PATH is set in {setters}, which is more than the Pages workflow — a job env or "
   "an `export` in a run block reaches a build exactly as a step env does, and a second setter "
   "is a second place for the two to disagree")

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
for n_ in notes:
    print("  note  " + n_)
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
