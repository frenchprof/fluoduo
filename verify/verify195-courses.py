#!/usr/bin/env python3
"""
The address decides the course — f1 to f4 mean different courses (11 Sep 2026).

WHY THIS EXISTS. Dan: *"do the wiring so f1 to f4 mean different courses"*.
Before it, f1.fluolingo.com and the three addresses he had yet to add were four
doors into one room: nothing in the app read its own hostname, so f2 would
have shown French 1 under a name that said French 2. The 9 Sep course pop-up
had a registry and a hostname read, and both were dropped with the pop-up; a
session reading the code a week later would have found no trace that courses
were ever meant to differ by address.

WHAT IT PINS.

  1. THE REGISTRY (content/courses.ts) is the one list: keys f1–f4 in order,
     each with a name and a level, exactly one live today. The next course
     opens by flipping `live` HERE and nowhere else.
  2. NO COURSE CODE ON SCREEN (Dan: "No codes at all"). `code` is data for the
     university, not the interface, so nothing outside the registry reads it.
  3. THE GATE WRAPS EVERY PAGE: layout.tsx renders children inside CourseGate,
     which is the only way "every route on f2 shows the closed door" can be
     true without every page knowing about courses.
  4. DRIVEN ON THE BUILT EXPORT (scripts/course-scan.mjs), because the
     decision is made in the browser from the hostname and exists in no file:
       · localhost      — no course named: the welcome page as built, no tag
       · f1.localhost   — French 1: the welcome page, plus « French 1 · A1 »
       · f2.localhost   — French 2, closed: the door, on / AND on /home, with
                          one content-sized link to French 1 and no map,
                          no ENTER coin
       · f3.localhost   — same door on /map at phone width

Break-tested: flipping f2 to live -> 4 fails (the door does not appear);
removing CourseGate from layout.tsx -> 3 and 4 fail; rendering `course.code`
in the door -> 2 fails; restore -> all pass.

THE EXPORT MUST BE OPEN (NEXT_PUBLIC_OPEN_APP=1), as for verify151: /home sits
behind the sign-in wall otherwise and the f2 /home case would be testing the
wall, not the gate.

Run from the repo root:  python3 verify/verify195-courses.py
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(rel): return open(os.path.join(ROOT, rel), encoding="utf-8").read()
def strip_comments(s):
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    return re.sub(r"(^|[^:\"'])//[^\n]*", r"\1", s)

# ── 1. the registry ──────────────────────────────────────────────────────
reg = read("src/content/courses.ts")
rows = re.findall(r'\{\s*key:\s*"(f\d)",\s*name:\s*"([^"]+)",\s*level:\s*"([^"]+)",\s*code:\s*"([^"]*)",\s*live:\s*(true|false)\s*\}', reg)
check([r[0] for r in rows] == ["f1", "f2", "f3", "f4"],
      "the registry lists f1, f2, f3, f4 in order",
      f"the registry's keys are {[r[0] for r in rows]}, expected f1..f4")
check(all(r[1] and r[2] for r in rows), "every course has a name and a level",
      "a course is missing its name or level")
live = [r[0] for r in rows if r[4] == "true"]
check(live == ["f1"], "exactly one course is live today: f1",
      f"live courses are {live}; opening a course is Dan's call, and this check names the day it changes")
check("export function courseFromHost" in reg and 'split(".")[0]' in reg,
      "courseFromHost reads the FIRST label of the hostname",
      "courseFromHost must read the first hostname label (f2.fluolingo.com and f2.localhost both answer French 2)")

# ── 2. no course code on screen ──────────────────────────────────────────
leaks = []
for dp, _, fs in os.walk(os.path.join(ROOT, "src")):
    for f in fs:
        if not f.endswith((".ts", ".tsx")): continue
        rel = os.path.relpath(os.path.join(dp, f), ROOT)
        if rel.endswith("content/courses.ts"): continue
        body = strip_comments(read(rel))
        if re.search(r"\b(course|c)\.code\b", body) or "LAF1201" in body and "components/" in rel:
            leaks.append(rel)
check(not leaks, "no component reads a course's `code` (Dan: no codes on screen)",
      f"a course code reaches the interface via {leaks}")

# ── 3. the gate wraps every page ─────────────────────────────────────────
layout = strip_comments(read("src/app/layout.tsx"))
check(re.search(r"<CourseGate>\s*\{children\}\s*</CourseGate>", layout) is not None,
      "layout.tsx renders every page inside CourseGate",
      "layout.tsx must wrap {children} in <CourseGate> — that is what makes 'every route on f2 shows the door' true")
gate = strip_comments(read("src/components/CourseGate.tsx"))
check("courseFromHost(window.location.hostname)" in gate,
      "the gate decides from window.location.hostname after mount",
      "the gate must read window.location.hostname (a static export has no server to route on)")
check("!course.live" in gate and "ClosedCourse" in gate,
      "a course that is not live renders the closed door",
      "the gate must render the closed door when the course is not live")

# ── 4. driven ────────────────────────────────────────────────────────────
if not os.path.isdir(os.path.join(ROOT, "out")):
    FAIL.append("no out/ export to drive — build with NEXT_PUBLIC_OPEN_APP=1 npm run build first")
else:
    run = subprocess.run(["node", "scripts/course-scan.mjs"], cwd=ROOT, capture_output=True, text=True)
    if run.returncode != 0:
        FAIL.append("course-scan.mjs failed:\n" + (run.stderr or run.stdout)[-1500:])
    else:
        rows = {}
        for line in run.stdout.splitlines():
            if line.startswith("{"):
                d = json.loads(line); rows[(d["host"], d["path"])] = d
        def row(h, p): return rows.get((h, p), {})
        r = row("localhost", "/")
        check(r.get("course") == "f1" and r.get("tag") is None and r.get("enter") and r.get("closed") is None,
              "localhost (no course named): runs as French 1, ENTER coin, NO course tag — looks as it did",
              f"localhost welcome page: {r}")
        r = row("f1.localhost", "/")
        check(r.get("course") == "f1" and r.get("tag") == "French 1 · A1" and r.get("enter") and r.get("closed") is None,
              "f1.localhost: the welcome page, ENTER coin, tagged « French 1 · A1 »",
              f"f1.localhost welcome page: {r}")
        for h, p in (("f2.localhost", "/"), ("f2.localhost", "/home")):
            r = row(h, p)
            check(r.get("closed") == "f2" and r.get("closedTitle") == "French 2 · A1" and not r.get("enter") and not r.get("map"),
                  f"{h}{p}: the closed door — « French 2 · A1 », no ENTER, no map",
                  f"{h}{p}: {r}")
            go = r.get("go") or []
            check(len(go) == 1 and go[0]["href"].startswith("http://f1.localhost:") and 0 < go[0]["width"] < r.get("vw", 9999) * 0.6,
                  f"{h}{p}: one content-sized link, to French 1 on the f1 host",
                  f"{h}{p}: links are {go}")
        r = row("f3.localhost", "/map")
        check(r.get("closed") == "f3" and r.get("closedTitle") == "French 3 · A2" and not r.get("map"),
              "f3.localhost/map at phone width: the closed door « French 3 · A2 », no map",
              f"f3.localhost/map: {r}")

for m in OK: print("  ok   " + m)
for m in FAIL: print("  FAIL " + m)
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
