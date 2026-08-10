#!/usr/bin/env python3
"""
Does the built site ship a student's email address to a learner's browser?

  cd ~/fluoduo && npm run build && python3 patch18/verify18.py

Collects every address that appears anywhere in src/, then walks the JS chunks
each exported page actually references and reports which pages carry one. This
is the check that found the leak: `accountAliases.ts` was teacher data, but two
learner-path modules imported it, so the bundler folded it into a chunk that
index.html and leaderboard.html both load.

Run it after every build that touches teacher code. It exits non-zero if a
learner-facing page carries an address, so it can go in CI.
"""
import os, re, sys

OUT = "out"
# Pages a signed-in STUDENT loads. These must be clean.
LEARNER_PAGES = ["index.html", "leaderboard.html", "activities.html", "moi.html",
                 "profil.html", "reviser.html", "conjugaison.html", "tutor.html"]

if not os.path.isdir(OUT):
    print("no out/ — run `npm run build` first"); sys.exit(2)

EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
addrs = set()
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            addrs |= set(EMAIL.findall(open(os.path.join(root, f), encoding="utf-8", errors="ignore").read()))
# Dan's own addresses are not a student-privacy issue.
addrs = {a for a in addrs if not a.endswith(("example.com", "chank.wang"))}
addrs -= {"dan@chank.wang"}

CHUNK = re.compile(r"/_next/static/chunks/[A-Za-z0-9_\-\.]+\.js")
cache = {}


def chunk_text(ref):
    if ref not in cache:
        p = os.path.join(OUT, ref.lstrip("/"))
        cache[ref] = open(p, encoding="utf-8", errors="ignore").read() if os.path.isfile(p) else ""
    return cache[ref]


bad = 0
print(f"checking {len(addrs)} addresses found in src/ against each page's chunks\n")
for page in LEARNER_PAGES:
    p = os.path.join(OUT, page)
    if not os.path.isfile(p):
        print(f"  --  {page:22s} (not built)"); continue
    refs = sorted(set(CHUNK.findall(open(p, encoding="utf-8", errors="ignore").read())))
    found = {}
    for r in refs:
        txt = chunk_text(r)
        for a in addrs:
            if a in txt:
                found.setdefault(a, set()).add(r)
    if found:
        bad += 1
        print(f"  ✗   {page:22s} {len(found)} address(es) in {len(refs)} chunks")
        for a, rs in sorted(found.items()):
            print(f"        {a}  →  {', '.join(sorted(rs))}")
    else:
        print(f"  ok  {page:22s} clean ({len(refs)} chunks)")

print()
if bad:
    print(f"{bad} learner-facing page(s) ship a student's email. DO NOT DEPLOY.")
    sys.exit(1)
print("No learner-facing page ships a student's email address.")
print("NOTE: /teacher is still a public static page and its own chunk still")
print("carries rosterPrivate.ts. That is a separate, larger fix.")
