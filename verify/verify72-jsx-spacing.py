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

WHAT THIS CHECK DOES NOT COVER, stated plainly because the first version of
this header got it wrong. It claimed same-line `</i> word` "usually survives".
**That is false.** Four more shipped that way an hour later — `tu-vous`,
`moi-aussi`, `questions-oui-non`, `mots-interrogatifs` — all same-line, all
jammed. On the same line, in the same file, one instance survives and the next
does not; nothing in the source distinguishes them.

So the rule is: **only the rendered page knows.** A blanket static rule would
flag 418 sites across 39 files to catch the twelve real ones — churn, and a
style rule wearing a bug check's clothes. This check therefore pins the two
things it can honestly assert: the newline shape, which is mechanical, and the
twelve sites already fixed, so a revert is loud. Everything else is caught by
driving the page, which is what found all twelve.
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
    ("faire.tsx",          'lang="fr">le</i>',         r"half names a"),
    ("langues-pays.tsx",   r"drops</b>",               r"its article"),
    ("negation.tsx",       r"M&rsquo;appelle</i>",     r"is one unit"),
    ("on-fait-quoi.tsx",   r"produce</b>",             "French. Classroom"),
    ("ou-est.tsx",         r"des</i>",                 r"in front of food"),
    # Four more, same-line, found by the browser scan after this check was
    # written and passing — the evidence that the static shape is partial.
    ("tu-vous.tsx",            'lang="fr">Vous</i>', r"means everything else"),
    ("moi-aussi.tsx",          'lang="fr">je</i>',   r"cannot stand on its own"),
    ("questions-oui-non.tsx",  'lang="fr">Si</i>',   r"is the yes that says"),
    ("mots-interrogatifs.tsx", 'lang="fr">Quel</i>', r"is an adjective wearing"),
]
for name, anchor, follow in FIXED:
    p = ROOT / "src/content/lessons/native" / name
    if not p.exists():
        FAIL.append(f"{name} has vanished — it carried one of the 31 Aug spacing fixes")
        continue
    src = p.read_text(encoding="utf-8")
    # The follow text may wrap across a source line, so every space in it has to
    # match any run of whitespace. Matching it literally failed on tu-vous, where
    # the phrase breaks between "means" and "everything".
    follow_re = r"\s+".join(re.escape(w) for w in follow.split())
    pair = re.compile(re.escape(anchor) + r'(\{" "\})?\s*' + follow_re)
    m = pair.search(src)
    if m is None:
        FAIL.append(f"{name}: this check can no longer find {anchor!r} followed by "
                    f"{follow!r}. Either the prose moved — in which case re-point or "
                    f"remove this pin deliberately — or the site is gone. A pin that "
                    f"silently passes when it cannot find its target guards nothing, "
                    f"which is exactly how four of these passed while reverted.")
        continue
    ok(m.group(1) is not None,
       f'{name}: the {{" "}} before "{follow[:18]}" is still there',
       f'{name}: the {{" "}} after {anchor} is gone, so it renders jammed again. '
       f"This one shipped that way once already.")

for line in PASS: print(f"  ok  {line}")
for line in FAIL: print(f"FAIL  {line}")
print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
