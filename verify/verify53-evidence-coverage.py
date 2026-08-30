#!/usr/bin/env python3
"""
Every activity tag the app EMITS must resolve to an evidence type.

An answer stored with no `evidenceType` is not a weaker record — it is an
unreadable one. PRD §7 exists so "picked the right option straight after
studying" and "produced it cold, a week later" stop looking identical; a
response with no type is neither, and the mastery model must treat it as
uncertainty. So a tag that resolves to nothing silently deletes the very
distinction the evidence model was built to make.

WHY THIS CHECK EXISTS (audit 2026-08-30). `recordResponse` falls back to
`location.pathname` for the `activityId` it STORES, but `buildEvidence` gets
the raw `activity` argument and has no fallback. Nothing made the two agree,
so:

  · eight call sites passed no activity at all — the whole of ConjugaZone,
    both deck Test-Yourself surfaces, LexicaLater x2, Match It, the Reviser,
    and the Grammarathon finale's FIRST attempt (the one that pays). Every
    one wrote answers with an activityId and no evidenceType.
  · two more passed a tag with no matching prefix: `dice:` (the table had
    `dice-practice` and `/practice/dice/`) and `letris:` (it had
    `/games/letris`).
  · the Reviser is the app's ONLY source of `delayed`, the strongest signal
    the store can carry. It produced none, ever.

None of that was visible: the store filled up, every document looked valid,
and the field that carried the meaning was simply absent. This is the check
that makes the next one loud.

Run from the repo root:  python3 verify/verify53-evidence-coverage.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASS, FAIL = [], []
def ok(c, good, bad): (PASS if c else FAIL).append(good if c else bad)

def nocomment(src):
    """A tag named only in a docstring must not satisfy — or fail — a rule
    about the code."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)

# ── the table, parsed rather than retyped ───────────────────────────────────
EV = open(os.path.join(ROOT, "src/lib/evidence.ts"), encoding="utf-8").read()
body = re.search(r"ACTIVITY_EVIDENCE[^=]*=\s*\[(.*?)\n\];", EV, re.S)
ok(body is not None, "ACTIVITY_EVIDENCE parsed from evidence.ts",
   "ACTIVITY_EVIDENCE is unreadable — has its shape changed?")
PREFIXES = re.findall(r'\["([^"]+)",\s*"([a-z]+)"\]', body.group(1)) if body else []
ok(len(PREFIXES) >= 20, f"{len(PREFIXES)} prefixes in the table",
   f"only {len(PREFIXES)} prefixes parsed — the regex has stopped matching the table")

def resolve(tag):
    """Longest prefix wins — the same rule evidenceTypeFor() applies."""
    best, bl = None, -1
    for p, t in PREFIXES:
        if tag.startswith(p) and len(p) > bl:
            best, bl = t, len(p)
    return best

# ── every tag the app emits ────────────────────────────────────────────────
# Two syntaxes, and only two:
#   · `activity: <literal>`  — the options object of recordResponse(), the
#     attempt record of useHelpLadder, and the lesson pager's card objects.
#   · the FOURTH positional argument of recordItemResult().
# NOT the JSX prop `activity="lesson"` — that is DrillShell's registry key for
# colour and labels, a different thing wearing the same word, and treating the
# two as one is what made the first draft of this scan report phantoms.
KEY = re.compile(r'\bactivity:\s*(?:`([^`]*)`|"([^"]*)")')
IDENT = re.compile(r'\bactivity:\s*([A-Za-z_$][\w$]*)\s*[,}]')
# `activity: string` in a type literal is a declaration, not a tag; and a
# member expression (`rec.activity`, `ex.activity`) is a PASSTHROUGH — the
# literal it carries is scanned at its own call site, so following it here
# would only report the same tag twice under a name that cannot resolve.
TS_TYPES = {"string", "number", "boolean", "undefined", "null", "unknown", "any"}

def args_of(src, i):
    """Split a call's arguments by depth, respecting strings. A regex across a
    call boundary is exactly how the first pass of this audit invented a
    `fr-FR` bug that did not exist."""
    depth, out, cur, j, q = 0, [], "", i, None
    while j < len(src):
        c = src[j]
        if q:
            if c == "\\": cur += src[j:j+2]; j += 2; continue
            if c == q: q = None
            cur += c; j += 1; continue
        if c in "\"'`": q = c; cur += c; j += 1; continue
        if c in "([{": depth += 1
        elif c in ")]}":
            depth -= 1
            if depth == 0:
                out.append(cur[1:].strip() if not out else cur.strip())
                return out
        if c == "," and depth == 1:
            out.append(cur[1:].strip() if not out else cur.strip()); cur = ""; j += 1; continue
        cur += c; j += 1
    return out

EMITTED = []   # (literal, file, line)
INDIRECT = []  # (identifier, file, line) — resolved against local consts
for dp, ds, fs in os.walk(os.path.join(ROOT, "src")):
    ds[:] = [d for d in ds if d != "node_modules"]
    for fn in fs:
        if not fn.endswith((".ts", ".tsx")):
            continue
        rel = os.path.relpath(os.path.join(dp, fn), ROOT)
        raw = open(os.path.join(dp, fn), encoding="utf-8").read()
        src = nocomment(raw)
        # local `const NAME = \`tag...\`` so a hoisted tag still resolves
        consts = {m.group(1): (m.group(2) or m.group(3))
                  for m in re.finditer(r'\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:`([^`]*)`|"([^"]*)")', src)}
        for m in KEY.finditer(src):
            EMITTED.append(((m.group(1) or m.group(2)), rel, src[:m.start()].count("\n") + 1))
        for m in IDENT.finditer(src):
            name = m.group(1)
            if name in consts:
                EMITTED.append((consts[name], rel, src[:m.start()].count("\n") + 1))
            elif name not in TS_TYPES:
                INDIRECT.append((name, rel, src[:m.start()].count("\n") + 1))
        for m in re.finditer(r"\brecordItemResult\s*\(", src):
            if "export function" in src[max(0, m.start() - 40):m.start()]:
                continue
            a = args_of(src, m.end() - 1)
            # FEWER THAN FOUR ARGUMENTS IS THE BUG ITSELF, not a call to skip.
            # This is how all eight untagged sites hid: the argument was simply
            # absent, so a scan looking at argument VALUES saw nothing to check.
            # An empty tag is emitted here so assertion 1 reports it by name.
            if len(a) < 4 or a[3].strip() in ("undefined", ""):
                EMITTED.append(("", rel, src[:m.start()].count("\n") + 1))
                continue
            v = a[3].strip()
            lit = re.fullmatch(r"`([^`]*)`|\"([^\"]*)\"", v)
            if lit:
                EMITTED.append(((lit.group(1) or lit.group(2)), rel, src[:m.start()].count("\n") + 1))
            elif v in consts:
                EMITTED.append((consts[v], rel, src[:m.start()].count("\n") + 1))
            elif "." not in v:
                INDIRECT.append((v, rel, src[:m.start()].count("\n") + 1))

ok(len(EMITTED) >= 20, f"{len(EMITTED)} activity tags found in the source",
   f"only {len(EMITTED)} tags found — the scan has stopped seeing the call sites, "
   f"which would make every assertion below vacuously true")

# ── 1 · EVERY EMITTED TAG RESOLVES ─────────────────────────────────────────
# A template literal's leading text is what the prefix match sees, so
# `dice:${id}` is tested as `dice:`.
seen_types, used_prefixes = set(), set()
for lit, rel, ln in sorted(set(EMITTED)):
    head = lit.split("${")[0]
    t = resolve(head) if head else None
    if t:
        seen_types.add(t)
        used_prefixes.add(max((p for p, _ in PREFIXES if head.startswith(p)), key=len))
    ok(t is not None,
       f"{head or '(empty)'!r} -> {t}",
       f"{rel}:{ln} tags answers {head or '(no activity passed)'!r}, which matches no "
       f"prefix in ACTIVITY_EVIDENCE — every answer it writes stores an activityId "
       f"and NO evidenceType, and is unreadable to the mastery model")

for name, rel, ln in sorted(set(INDIRECT)):
    FAIL.append(f"{rel}:{ln} passes `{name}` as the activity tag — this check can only "
                f"resolve a literal or a module const, so the tag is unverifiable. Hoist "
                f"it to a `const` beside the call.")

# ── 2 · WHICH EVIDENCE TYPES THE APP CAN ACTUALLY PRODUCE ──────────────────
# Asserting the exact set, not a minimum, so BOTH directions are loud: losing
# `delayed` again fails here, and wiring `diagnostic` fails here too — with a
# reason to update this list rather than a silent pass.
#
#   diagnostic  UNREACHABLE BY DESIGN. Pretests write localStorage only
#               (recordPretestAnswer); Dan, 2026-08-27: "remember it, but
#               don't score it". Putting them in the evidence store is his
#               call, not a wiring fix.
#   transfer    UNREACHABLE — no caller sets it and nothing derives it. It
#               needs a rule for "an unfamiliar context", which is a
#               modelling decision, not a lookup.
#   teacher     UNREACHABLE — no sign-off surface exists yet.
EXPECTED = {"recognition", "constrained", "free", "receptive", "productive", "delayed"}
ok(seen_types == EXPECTED,
   f"the app produces exactly {sorted(seen_types)}",
   f"the reachable evidence types have changed: {sorted(seen_types)}, expected "
   f"{sorted(EXPECTED)}. Missing {sorted(EXPECTED - seen_types)}; new "
   f"{sorted(seen_types - EXPECTED)}. Update EXPECTED here and say why in the note above.")

# ── 3 · THE REVISER STILL CARRIES `delayed` ────────────────────────────────
# Called out on its own because it is the single point of failure: no other
# surface produces spaced retrieval, so losing this one tag costs the store
# its strongest signal without changing anything a reader can see.
rev = nocomment(open(os.path.join(ROOT, "src/app/reviser/page.tsx"), encoding="utf-8").read())
m = re.search(r'recordItemResult\([^)]*?,\s*"([^"]+)"\s*\)', rev)
ok(m is not None and resolve(m.group(1)) == "delayed",
   "the Reviser tags its answers `delayed`",
   "the Reviser no longer writes `delayed` evidence — it is the ONLY surface "
   "that can, so nothing else will notice")

# ── 4 · path-shaped keys are history, not routing ──────────────────────────
# They are kept because documents written before the tags existed stored a
# pathname in activityId. They must never be the ONLY way a live surface
# resolves, or the fallback bug is back.
for lit, rel, ln in sorted(set(EMITTED)):
    head = lit.split("${")[0]
    if head.startswith("/") and not head.startswith("/practice/grammarathon/finale"):
        FAIL.append(f"{rel}:{ln} tags answers with a PATH ({head!r}). Tags are activity "
                    f"names, not routes — a game embedded in SioModal never navigates.")

print("\n".join("  ok    " + p for p in PASS))
print("\n".join("  FAIL  " + f for f in FAIL))
print("-" * 66)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
