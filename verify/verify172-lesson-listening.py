#!/usr/bin/env python3
"""verify172 — every lesson's ÉcouTexte is ITS listening text.

Dan, 2026-09-08, laying out the swipe chain station by station: *"WorDrill —
swipe left for ÉcouText for that lesson"*.

ÉcouTexte is a TOPIC PICKER over fifteen generated scenarios, three per unit,
so before this a learner swiping left off WorDrill landed on whichever topic
the dropdown was showing — usually unité 3's itinerary, whatever lesson they
had come from. `content/textgen/lessonScenario.ts` is the table that fixes it,
and this check holds the three ways that table can quietly go wrong.

  1  A STOP WITH NO ENTRY. All fifty are covered, and a fifty-first stop added
     later must fail here rather than silently fall back to the picker.
  2  A SCENARIO THAT DOES NOT EXIST. The ids are strings, and a typo would not
     break the build — it would draw unité 0's first scenario instead, which
     looks like a working page showing the wrong text. Every id is checked
     against the generator that actually writes it.
  3  A SCENARIO FROM THE WRONG UNIT. A stop's listening must come from its OWN
     unit's generator: SIO-045 is unité 4 and cannot open on « itineraire ».
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
fails = []

table = (SRC / "content" / "textgen" / "lessonScenario.ts")
if not table.exists():
    print("verify172: content/textgen/lessonScenario.ts is gone — every lesson's\n"
          "  ÉcouTexte falls back to the topic picker, which is the fault it fixed.")
    sys.exit(1)
text = table.read_text(encoding="utf-8")

pairs = dict(re.findall(r'"(SIO-\d+)":\s*"([a-z0-9-]+)"', text))

# The stops, and the unit each belongs to, read from the registry itself.
import json
sios = json.loads((SRC / "content" / "sios" / "sios.json").read_text(encoding="utf-8"))
unit_of = {s["id"]: s["unit"] for s in sios}

missing = sorted(set(unit_of) - set(pairs))
if missing:
    fails.append(
        f"{len(missing)} stop(s) have no listening text: {', '.join(missing[:6])}"
        + (" …" if len(missing) > 6 else "") + "\n"
        "    Swiping left off WorDrill there opens the general picker on whatever\n"
        "    topic it was last showing, which is the fault this table exists for."
    )
extra = sorted(set(pairs) - set(unit_of))
if extra:
    fails.append(f"the table names stops that do not exist: {', '.join(extra)}")

# Which scenarios each unit's generator actually writes.
written: dict[int, set[str]] = {}
for u in range(5):
    f = SRC / "content" / "textgen" / f"unit{u}.ts"
    if not f.exists():
        continue
    src = f.read_text(encoding="utf-8")
    written[u] = set(re.findall(r'=\s*scenario\(\s*\n?\s*"([a-z0-9-]+)"', src))

for sid, scenario in sorted(pairs.items()):
    u = unit_of.get(sid)
    if u is None:
        continue
    have = written.get(u, set())
    if not have:
        fails.append(f"{sid} is unité {u}, which has no generator — nothing can be drawn for it.")
    elif scenario not in have:
        where = [v for v, s in written.items() if scenario in s]
        fails.append(
            f"{sid} (unité {u}) opens on {scenario!r}, which unité {u} does not write.\n"
            + (f"    It belongs to unité {where[0]}. A stop's listening must come from its\n"
               "    OWN unit, or a learner meets grammar the course has not taught yet.\n"
               if where else
               "    No unit writes it — a typo here draws unité 0's first scenario instead,\n"
               "    which looks like a working page showing the wrong text.\n")
        )

# The rail must actually point at the per-lesson route, or the table is unread.
rail = (SRC / "lib" / "swipeRail.ts").read_text(encoding="utf-8")
if "practice/ecoutexte/${deck}" not in rail:
    fails.append(
        "The rail's ÉcouTexte station no longer opens the lesson's own route.\n"
        "    Dan asked for « ÉcouText for that lesson »; without the deck in the\n"
        "    address it is the general picker again."
    )

if fails:
    print("verify172: a lesson's listening text is wrong or missing.\n")
    for f in fails:
        print("  ✗ " + f + "\n")
    sys.exit(1)
print(f"verify172 ok — all {len(pairs)} stops open on a listening text their own unit writes.")
