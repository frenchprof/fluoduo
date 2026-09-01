#!/usr/bin/env python3
"""verify72 — a word may not butt against the next across an element edge.

JSX drops the whitespace between an element close and the text after it when
the two sit on different source lines, and sometimes on the same line. In the
source it reads:

    <i lang="fr">des</i> in front of food

and it renders as **"desin front of food"**. The source looks correct, `tsc`
is happy, the build passes, and nothing but a pair of eyes on the rendered page
finds it.

SIX shipped this way on 31 Aug alone, four of them merged to `main`:
`ca-secrit`, `combien`, `conjugaison-u1`, `faire`, `langues-pays`, `negation`,
plus `on-fait-quoi` and `ou-est` caught before merge. An earlier scan looked
only for a jammed EM DASH and passed all eight, because these are word against
word. The fix is always `{" "}` at the element edge.

WHY THIS IS STATIC AND WHAT THAT COSTS. The honest detector renders the page
and walks the DOM, which needs a browser CI does not run for this route. So
this reads the SOURCE and flags the shape that produces the fault: an inline
close tag followed by a newline and then a word, with no `{" "}` bridging them.
That is a proxy, and it is not the same as measuring. It is pinned here anyway
because the shape is mechanical, the fault is invisible in review, and six
reached main in one day.

Same-line `</i> word` is NOT flagged: it usually survives, and flagging it
would bury the real thing under hundreds of false positives — the mistake the
first version of the browser scan made, reporting 400 hits by counting every
block boundary as a jam.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
LESSONS = sorted((ROOT / "src/content/lessons/native").glob("*.tsx"))
PASS, FAIL = [], []

def ok(c, good, bad):
    (PASS if c else FAIL).append(good if c else bad)

ok(len(LESSONS) >= 30, f"{len(LESSONS)} lesson files scanned",
   f"only {len(LESSONS)} lesson files found — the glob has stopped seeing them, "
   f"which would make every assertion below vacuously true")

INLINE = r"(?:i|b|em|strong|span|u|small|code|abbr)"
# close tag, end of line, indentation, then a WORD character — no {" "} between.
PAT = re.compile(r"</" + INLINE + r">\s*\n\s*([A-Za-z0-9À-ÿ])")

hits = []
for p in LESSONS:
    src = p.read_text(encoding="utf-8")
    for m in PAT.finditer(src):
        line = src[:m.start()].count("\n") + 1
        frag = src[max(0, m.start() - 26): m.end() + 16].replace("\n", " ⏎ ")
        hits.append(f"{p.name}:{line}  …{frag}…")

ok(not hits,
   "no inline element is followed straight by a word across a line break",
   "these render with the space GONE — « desin front of food ». Put {\" \"} at the "
   "element edge:\n    " + "\n    ".join(hits[:12])
   + (f"\n    …and {len(hits) - 12} more" if len(hits) > 12 else ""))

# The eight that shipped on 31 Aug, named so a revert is loud rather than quiet.
#
# Anchored on the close tag AND the words that follow it, not the close tag
# alone: `il y a</i>` occurs four times in combien.tsx and only one of them is
# the site that was jammed. Matching the first hit failed on correct code —
# the same first-occurrence trap that made verify69 report every guarded
# section as un-collapsed.
FIXED = [
    ("ca-secrit.tsx",      r"S&rsquo;écrire</i>",      r"is reflexive"),
    ("combien.tsx",        r"il y a</i>",              r"is not really"),
    ("conjugaison-u1.tsx", r"ils n&rsquo;ont pas</i>", r"looks irregular"),
    ("faire.tsx",          r'<i lang="fr">le</i>',     r"half names a"),
    ("langues-pays.tsx",   r"drops</b>",               r"its article"),
    ("negation.tsx",       r"M&rsquo;appelle</i>",     r"is one unit"),
    ("on-fait-quoi.tsx",   r"produce</b>",             r"French\. Classroom"),
    ("ou-est.tsx",         r"des</i>",                 r"in front of food"),
]
for name, anchor, follow in FIXED:
    p = ROOT / "src/content/lessons/native" / name
    if not p.exists():
        FAIL.append(f"{name} has vanished — it carried one of the 31 Aug spacing fixes")
        continue
    src = p.read_text(encoding="utf-8")
    pair = re.compile(re.escape(anchor.replace("\\", "")) + r'(\{" "\})?\s*' + follow)
    m = pair.search(src)
    if m is None:
        PASS.append(f"{name}: the phrase was rewritten, so the fix no longer applies")
        continue
    ok(m.group(1) is not None,
       f'{name}: the {{" "}} before "{follow[:18]}" is still there',
       f'{name}: the {{" "}} after {anchor} is gone, so it renders jammed again. '
       f"This one shipped that way once already.")

for line in PASS: print(f"  ok  {line}")
for line in FAIL: print(f"FAIL  {line}")
print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
