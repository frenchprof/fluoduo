#!/usr/bin/env python3
"""
Is any student's identity in ANY file the CDN serves?

  npm run build && python3 verify/verify18b.py

verify18 checks the pages a LEARNER loads. This closes the gap it documented:
/teacher — and everything else in out/ — sits on the same public CDN with no
auth in front of it, and until 2026-08-10 the teacher chunk carried
rosterPrivate.ts, so anyone with the chunk URL could download the class's
email addresses. Those maps now live in Firestore (admin/rosterPrivate,
admin-only rules; canonical copy scripts/roster-private.json, pushed by
scripts/seed-roster-private.mjs). This check proves the move stuck:

  1. src/ carries no student email at all — the only addresses allowed in
     source are Dan's own and the peer reviewer's (they gate UI, and neither
     is a student).
  2. Nothing from the roster corpus (every email in roster-private.json plus
     every name override) appears in ANY file under out/ — every page, every
     chunk, every asset. Not just the learner pages: ALL of it.

Exits non-zero on any hit, so it runs in CI after the build.
"""
import json, os, re, sys

OUT = "out"
ROSTER = os.path.join("scripts", "roster-private.json")

# Not students: Dan's own sign-ins (also listed in firestore.rules isAdmin())
# and the peer reviewer's read-only-tier gate (data.ts REVIEWER_EMAILS).
ALLOWED_EMAILS = {
    "dan@chank.wang", "monsieur.chan@gmail.com", "kwangguan@gmail.com",
    "daniel.chan@nus.edu.sg", "drneilchan@gmail.com", "kaygeedan@gmail.com",
    "wanghaoshu2016@gmail.com",
    # Dan's two alter-ego test learners (2026-09-13: "these two are my alter
    # ego test identites"). Same reason as the six above — his own accounts,
    # gating nothing but their own exclusion from the student board
    # (TEST_ACCOUNT_EMAILS, src/lib/staffAccounts.ts). Not students.
    "docteur.daniel.chan@gmail.com", "u12@i12.work",
}
EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")

if not os.path.isdir(OUT):
    print("no out/ — run `npm run build` first"); sys.exit(2)
if not os.path.isfile(ROSTER):
    print(f"no {ROSTER} — the roster corpus this check bans"); sys.exit(2)


def read(path):
    return open(path, encoding="utf-8", errors="ignore").read()


roster = json.load(open(ROSTER, encoding="utf-8"))
corpus = set()
for m in ("aliasEmails", "knownEmails"):
    for k, v in roster[m].items():
        corpus |= set(EMAIL.findall(k)) | set(EMAIL.findall(v))
corpus |= set(roster["rosterNames"].values())
corpus -= ALLOWED_EMAILS

bad = 0

# 1. Source: a student address anywhere in src/ means the maps crept back
#    into code the bundler can reach. example.com is documentation.
src_hits = {}
for root, _, files in os.walk("src"):
    for f in files:
        if not f.endswith((".ts", ".tsx")):
            continue
        p = os.path.join(root, f)
        for a in set(EMAIL.findall(read(p))):
            if a in ALLOWED_EMAILS or a.endswith("example.com"):
                continue
            src_hits.setdefault(p, set()).add(a)
if src_hits:
    bad += 1
    print("✗  src/ carries a non-allowlisted email address:")
    for p, addrs in sorted(src_hits.items()):
        print(f"     {p}: {', '.join(sorted(addrs))}")
else:
    print("ok src/ — no student email in any source module")

# 2. Build output: the corpus must appear in NOTHING the CDN serves.
out_hits = {}
n_files = 0
for root, _, files in os.walk(OUT):
    for f in files:
        p = os.path.join(root, f)
        n_files += 1
        txt = read(p)
        for s in corpus:
            if s in txt:
                out_hits.setdefault(p, set()).add(s)
if out_hits:
    bad += 1
    print(f"✗  the roster corpus appears in {len(out_hits)} of {n_files} files under out/:")
    for p, ss in sorted(out_hits.items()):
        print(f"     {p}: {', '.join(sorted(ss))}")
else:
    print(f"ok out/ — {len(corpus)} corpus strings absent from all {n_files} files")

print()
if bad:
    print("Student identity is on the public CDN. DO NOT DEPLOY.")
    sys.exit(1)
print("No student email or roster name anywhere the CDN serves — /teacher included.")
