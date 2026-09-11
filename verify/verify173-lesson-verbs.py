#!/usr/bin/env python3
"""verify173 — every lesson's ConjugaZone drills ITS verbs.

Dan, 2026-09-08: *"ConjugaZone page would land on the same single conjugazone
page but land on the particular verbs that we have assigned for that lesson"*,
then *"Split the current verbs into the 50 lessons"*. He ruled on the split row
by row over two days and approved it on 11 Sep. `content/lessonVerbs.ts` is
that ruling; this check is what stops it drifting back.

WHAT IT HOLDS, and why each one is a way the table goes wrong in silence:

  1  EVERY VERB HAS EXACTLY ONE HOME. 67 in the registry, 67 in the table, none
     twice. A verb in two lessons is drilled twice and a verb in none is
     drilled nowhere — and nothing on screen would say so.
  2  NO VERB THE REGISTRY DOES NOT KNOW. The ids are strings; a typo compiles,
     and `?deck=` would then open the default être / avoir / aller as though
     nothing were wrong.
  3  DAN'S RULES ON THE FIRST TEN STOPS. -ER verbs only, with `connaître` the
     single exception he allowed at SIO-010, and SIO-002 to SIO-009 carrying
     nothing at all. These are pedagogy, not tidiness: a beginner meeting
     « je dors » at the alphabet is being taught out of order.
  4  THE RAIL SKIPS A LESSON WITH NO VERBS. Ten of the fifty conjugate nothing,
     so the column has to be stepped over or a swipe lands on an empty drill.
  5  AND THE ADDRESS CARRIES THE LESSON, NOT A COPY OF ITS VERBS. `?deck=` is
     the whole answer; spelling `?v=` into the rail as well would put one fact
     in two places, and the copy in a bookmark is the stale one the day a verb
     moves.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
fails = []

table = SRC / "content" / "lessonVerbs.ts"
if not table.exists():
    print("verify173: content/lessonVerbs.ts is gone — every lesson's ConjugaZone\n"
          "  falls back to être / avoir / aller, which is the fault it fixed.")
    sys.exit(1)
text = table.read_text(encoding="utf-8")

# The table, parsed per stop so a verb can be traced to its lesson.
by_stop = {}
for sid, body in re.findall(r'"(SIO-\d+)":\s*\[([^\]]*)\]', text, re.S):
    by_stop[sid] = re.findall(r'id:\s*"([a-zà-ÿ-]+)"', body)

registry = (SRC / "content" / "conjugaison.ts").read_text(encoding="utf-8")
verbs = {m.group(1): int(m.group(2)) for m in
         re.finditer(r'\{ id: "([^"]+)", inf: "[^"]+", en: "[^"]+", group: G\[(\d+)\]', registry)}

placed = [v for vs in by_stop.values() for v in vs]

# 1 · one home each
twice = sorted({v for v in placed if placed.count(v) > 1})
if twice:
    fails.append(f"drilled in more than one lesson: {', '.join(twice)}")
homeless = sorted(set(verbs) - set(placed))
if homeless:
    fails.append(
        f"{len(homeless)} verb(s) belong to no lesson: {', '.join(homeless[:8])}"
        + (" …" if len(homeless) > 8 else "") + "\n"
        "    ConjugaZone still offers them from its own picker, but no lesson\n"
        "    ever opens on them, so the course never teaches them."
    )

# 2 · no id the registry does not know
unknown = sorted(set(placed) - set(verbs))
if unknown:
    fails.append(
        f"the table names verbs the registry does not have: {', '.join(unknown)}\n"
        "    A typo compiles. `?deck=` would open on être / avoir / aller instead,\n"
        "    and the page would look like it was working."
    )

# 3 · Dan's rules on the first ten stops
sios = json.loads((SRC / "content" / "sios" / "sios.json").read_text(encoding="utf-8"))
num = {s["id"]: s["num"] for s in sios}
for sid, vs in sorted(by_stop.items()):
    if num.get(sid, 99) > 10:
        continue
    if 2 <= num[sid] <= 9 and vs:
        fails.append(
            f"{sid} carries {', '.join(vs)} — SIO-002 to SIO-009 conjugate nothing.\n"
            "    Dan, 9 Sep: alphabet, colours, numbers and nouns are where a learner\n"
            "    meets words, not conjugations."
        )
    for v in vs:
        if v == "connaitre":
            continue  # Dan's one exception, at SIO-010
        if verbs.get(v) not in (1, 2):
            fails.append(
                f"{sid} carries {v!r}, which is not an -ER verb.\n"
                "    The first ten stops take -ER verbs only; connaître is the single\n"
                "    exception Dan allowed, and only at SIO-010."
            )

# 4 · the rail steps over a lesson with none
rail = (SRC / "lib" / "swipeRail.ts").read_text(encoding="utf-8")
if "lessonHasVerbs" not in rail:
    fails.append(
        "The rail no longer asks whether a lesson conjugates anything.\n"
        f"    {sum(1 for v in by_stop.values() if not v)} lessons have no verbs, so swiping left off ÉcouTexte\n"
        "    there would land on an empty drill."
    )

# 5 · the lesson in the address, not its verb list
if re.search(r'conjugaison\?[^`"]*\bv=', rail):
    fails.append(
        "The rail spells the verb list into ConjugaZone's address.\n"
        "    `?deck=` is the whole answer — the table turns a lesson into its verbs.\n"
        "    A `?v=` written here is a second copy of that fact, and the copy inside\n"
        "    a learner's bookmark is the stale one the day a verb moves."
    )

if fails:
    print("verify173: the lesson→verb split has drifted.\n")
    for f in fails:
        print("  ✗ " + f + "\n")
    sys.exit(1)
print(f"verify173 ok — {len(placed)} verbs, one lesson each, "
      f"{sum(1 for v in by_stop.values() if not v)} lessons deliberately conjugating none.")
