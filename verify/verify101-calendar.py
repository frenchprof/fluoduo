#!/usr/bin/env python3
"""
The calendar stays inside the numbers the learner has been taught.

Dan placed it himself (2026-09-05): the months and the year go into SIO-018
"Numbers 20-69", *"along with the year, which should be restricted to deux mille
____ (20XX), where XX is under 70 if it is in Unit 1"*, and `né / née` into
SIO-019 with the SIO-010 role cue.

WHY A CHECK AND NOT A COMMENT. The ceiling is the whole reason the calendar
could live in an existing stop rather than a new one: `deux mille` + 20-69 IS
2020-2069, so the year costs the learner two words and no new numerals. Add one
year of 2071 and that argument silently stops being true — the stop starts
asking for `soixante et onze`, which is SIO-045's material, twenty-seven stops
later. Nothing about that would look wrong in a diff.

WHAT IS PINNED

  1  THE YEAR CEILING, on both lists. The current-year list draws on this
     stop's own 20-69; the birth-year list draws on SIO-007's 0-20. Different
     ranges, same rule: the part after `deux mille` stays under 70.

  2  ONE BIRTH-YEAR LIST, shared. SIO-018 asks « Quelle est votre date de
     naissance ? » and SIO-019 answers « Je suis né en… ». If those two ever
     hold separate lists they can disagree, and a learner meets a birth year on
     one stop that the next stop has never heard of.

  3  THE MONTHS ARE LOWER CASE, all twelve. SIO-004 already teaches this for
     the days; a capitalised month would quietly contradict a rule the learner
     was given in Unit 0.

  4  EVERY MONTH HAS AN ENGLISH GLOSS, and the gloss is not the French word
     wearing a capital. The first draft of the generator wrote
     `month.charAt(0).toUpperCase() + month.slice(1)` into the `en` field and
     produced "It's 10 Janvier 2030". It typechecked. It was found by running
     the generator and reading the cards, which is the only way it could have
     been found, and this check is what stops it coming back.

  5  THE 1ST IS WRITTEN `1er`, NEVER `1`. Same shape of fault as 4 and found
     the same way — by looking at a card. The full-date prompt read
     « 1 octobre 2061 » while this file's own comment, two screens above it,
     explained that French takes the ordinal for the 1st. The learner does not
     choose that numeral; the generator prints it. A wrong form the MACHINE
     produced is the « Bon chance » case, not a distractor.

  6  THE ROLE CUE EXISTS on the né/née round. A learner cannot hear the
     difference between `né` and `née`, so a card that does not name its
     speaker before the guess is a coin toss. The cue is the round.
"""

import json
import os
import re
import subprocess
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

CAL = "src/content/lessons/native/nombres-echanges.gen.ts"
NE = "src/content/lessons/native/avoir-etats.gen.ts"
cal, ne = read(CAL), read(NE)

ok(bool(cal) and bool(ne), "both generators are present",
   "a calendar generator is missing")

# ---- 1 · the year ceiling, on both lists ---------------------------------
def years_in(block_name, src):
    m = re.search(block_name + r"[^=]*=\s*\{([\s\S]*?)\n\};", src)
    return [int(x) for x in re.findall(r"(\d{4}):", m.group(1))] if m else []


birth = years_in("BIRTH_YEARS", cal)
ok(len(birth) >= 3, f"the birth-year list has {len(birth)} years",
   "BIRTH_YEARS is missing or too small to be the list this check measures")
over = [y for y in birth if (y - 2000) >= 70 or y < 2000]
ok(not over,
   f"every birth year is deux mille + under 70 ({min(birth, default=0)}-{max(birth, default=0)})",
   f"a birth year breaks Dan's ceiling: {over}. The part after `deux mille` must "
   "stay under 70, or the stop asks for a numeral it has not taught.")

# the CURRENT-year list is the stop's own numbers, so its ceiling is the
# NUMBERS map itself: yearWords() indexes straight into it.
nums = re.search(r"export const NUMBERS: Record<number, string> = \{([\s\S]*?)\n\};", cal)
keys = [int(x) for x in re.findall(r"(\d+):", nums.group(1))] if nums else []
ok(bool(keys), "the NUMBERS map is readable", "cannot read NUMBERS from the generator")
bad = [k for k in keys if k < 20 or k > 69]
ok(not bad,
   f"and the year draws only on this stop's own 20-69 ({min(keys, default=0)}-{max(keys, default=0)})",
   f"NUMBERS holds {bad}, outside 20-69 — `yearWords` indexes straight into this "
   "map, so anything here becomes a year the stop may not have taught")

# ---- 2 · one birth-year list, shared -------------------------------------
ok("BIRTH_YEARS" in ne and "from \"./nombres-echanges.gen.ts\"" in ne,
   "SIO-019 imports the birth years rather than keeping its own",
   "avoir-etats.gen.ts no longer imports BIRTH_YEARS. Two lists can disagree, and "
   "then « Quelle est votre date de naissance ? » on SIO-018 offers a year that "
   "SIO-019's « Je suis né en… » has never heard of.")
ok(not re.search(r"^const BIRTH_YEARS", ne, re.M),
   "and does not redeclare them",
   "avoir-etats.gen.ts declares its own BIRTH_YEARS again")

# ---- 3 + 4 · the months --------------------------------------------------
mm = re.search(r"export const MONTHS = \[([\s\S]*?)\] as const;", cal)
months = re.findall(r'"([^"]+)"', mm.group(1)) if mm else []
ok(len(months) == 12, f"all twelve months are declared",
   f"found {len(months)} months, expected 12")
caps = [m for m in months if m[:1].isupper()]
ok(not caps,
   "and every one is lower case, as SIO-004 already taught for the days",
   f"a month is capitalised: {caps}. French writes months small; SIO-004 gives "
   "the learner that rule in Unit 0 and this would contradict it.")

em = re.search(r"export const MONTHS_EN: Record<string, string> = \{([\s\S]*?)\n\};", cal)
en_map = dict(re.findall(r'"?([^"\s:]+)"?:\s*"([^"]+)"', em.group(1))) if em else {}
missing = [m for m in months if m not in en_map]
ok(not missing, "every month has an English gloss",
   f"no English for {missing} — the gloss would fall back to the French word")
same = [m for m in months if en_map.get(m, "").lower() == m.lower()]
ok(not same,
   "and no gloss is just the French word with a capital on it",
   f"the English for {same} is the French word recapitalised — the bug that "
   'produced "It\'s 10 Janvier 2030" and typechecked perfectly')

# ---- 5 · the role cue ----------------------------------------------------
ok("BORN_PEOPLE" in ne and re.search(r'cue:\s*"[^"]+"', ne) is not None,
   "the né/née round names its speaker before the guess",
   "the role cue is gone from avoir-etats.gen.ts. `né` and `née` sound identical, "
   "so without a cue the card is a coin toss and teaches nothing.")
people = re.search(r"const BORN_PEOPLE = \[([\s\S]*?)\] as const;", ne)
block = people.group(1) if people else ""
ok("f: true" in block and "f: false" in block,
   "and the cast has both a feminine and a masculine speaker",
   "BORN_PEOPLE no longer covers both genders — one of the two endings would "
   "never come up")

# ---- 6 · and it all actually runs ----------------------------------------
# Reading the source proves nothing about what a card SAYS. The "It's 10
# Janvier 2030" bug typechecked perfectly and passed every static test that
# could be written about it; it was found by running the generator and reading
# a card. So this runs 250 of each.
#
# The repo's own way of executing a generator (verify41): node's built-in type
# stripping, module source on stdin, relative imports resolved from the repo
# root. Not `npx tsx` from a temp directory — the first version of this check
# did that, could not resolve a single relative import, and failed with the
# message "Node.js v22.22.2", which tells you nothing about the code it guards.
PROBE = r"""
import { nombresQuestion, MONTHS } from "./src/content/lessons/native/nombres-echanges.gen.ts";
import { avoirEtatsQuestion } from "./src/content/lessons/native/avoir-etats.gen.ts";

const bad = [];
let dates = 0, born = 0, withCue = 0;

for (let i = 0; i < 250; i++) {
  const q = nombresQuestion({ usage: "date" });
  dates++;
  if (!q.correct || !q.en || !q.big) { bad.push("empty date card: " + JSON.stringify(q)); break; }
  // The gloss is English. A French month surviving into it is the recapitalise
  // bug coming back.
  const leak = q.en.toLowerCase().replace(/[.,]/g, "").split(" ")
    .find((t) => MONTHS.includes(t));
  if (leak) bad.push("English gloss carries the French month: " + q.en);
  // Every option must be a sentence the learner could have written, not a
  // fragment: the distractors are built by hand and a missing piece is silent.
  for (const o of q.easyOptions || []) {
    if (!o || o.length < 6) bad.push("stub option: " + JSON.stringify(o));
  }
  // French never writes « 1 octobre ». The prompt above the full-date card did,
  // for one afternoon, while the file's own comment explained the ordinal.
  if (/(^|[^\d])1 (janvier|f\u00e9vrier|mars|avril|mai|juin|juillet|ao\u00fbt|septembre|octobre|novembre|d\u00e9cembre)/.test(q.big)) {
    bad.push("the 1st written as a plain numeral: " + q.big);
  }
  if (bad.length > 3) break;
}

for (let i = 0; i < 250; i++) {
  const q = avoirEtatsQuestion({ round: "naissance" });
  born++;
  if (!/née? /.test(q.correct)) { bad.push("no ne/nee in: " + q.correct); break; }
  // The cue is the round: without a named speaker the -e is a coin toss.
  if (/[\u{1F468}\u{1F469}]/u.test(q.meta)) withCue++;
  else bad.push("no role cue in meta: " + q.meta);
  if (bad.length > 3) break;
}

console.log(JSON.stringify({ dates, born, withCue, bad: bad.slice(0, 3) }));
"""

r = subprocess.run(["node", "--experimental-strip-types", "--input-type=module",
                    "-e", PROBE], capture_output=True, text=True, timeout=300)
if r.returncode != 0:
    tail = [l for l in r.stderr.splitlines() if l.strip()][-3:]
    ok(False, "", "the generators would not run: " + " / ".join(tail))
else:
    got = json.loads(r.stdout.strip().splitlines()[-1])
    ok(not got["bad"],
       f"{got['dates']} date cards and {got['born']} né/née cards build cleanly",
       "the built cards are wrong: " + " · ".join(got["bad"]))
    ok(got["withCue"] == got["born"] and got["born"] > 0,
       f"and every one of the {got['born']} né/née cards names its speaker",
       f"{got['born'] - got['withCue']} né/née cards carry no role cue")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
