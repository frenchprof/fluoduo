#!/usr/bin/env python3
"""
The Finale card joins the colour system (2026-09-06).

Dan, looking at the GramMarathon Finale: "and the check hint buttons?" — the
same afternoon he sent the reward banner back for wearing the XP colour.

The card had never been converted. It was raw Tailwind end to end: `slate-900`
for the frame, `emerald-500` for a right answer, `rose-400` for a wrong one,
`yellow-100` on Check, and `amber-300 / amber-50 / amber-800` on the hint chip.
Not one token among them. And the hint chip's amber is **0.3 degrees of hue**
from `--dopa-joy`, which is this app's XP colour — the +20 float and the
receipt's XP line. The hint button was painted in the colour that means XP,
which is exactly the fault Dan had just caught one card higher.

It now answers to `docs/COLOR_SYSTEM.md`:

  BAND    what the activity ASKS. The Finale is GramMarathon, so `band-prod`
          sits on the root and the frame, the progress fill, the two chips and
          the clue rungs read `var(--band)` / `var(--band-wash)` from it.
  FAMILY  where you ARE. Practice yellow, on the primary key and the blank.
  DOPA    what a thing MEANS. `win` for a right answer, `miss` for a wrong one.

TWO ASSERTIONS ARE MEASURED, NOT MATCHED. The text colours on the band's wash
are resolved from globals.css and their contrast is COMPUTED here, because the
trap on this card is a token that looks right and fails: `--cahier-ink-soft` is
fine on paper (4.72:1) and only 3.85:1 on the band's wash. A grep for "does it
use a token" would pass that. A contrast calculation does not.

Run from the repo root:  python3 verify/verify115-finale-colours.py
"""
import os, re, sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"^\s*\{/\*.*?\*/\}\s*$", "", src, flags=re.M)
    return src


def lum(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    x, y = sorted([lum(a), lum(b)], reverse=True)
    return (x + 0.05) / (y + 0.05)


def mix(a, b, pa):
    A = [int(a.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    B = [int(b.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    return "#%02x%02x%02x" % tuple(round(A[i] * pa + B[i] * (1 - pa)) for i in range(3))


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

SRC = "src/app/practice/grammarathon/finale/FinaleContent.tsx"
raw = read(SRC)
check(bool(raw), f"{SRC} exists", f"{SRC} is missing")
code = strip_comments(raw)

# ── A · nothing raw is left ────────────────────────────────────────────────
# Comments are stripped first ON PURPOSE: the file's header names every colour
# it used to wear, so a raw grep would fail on its own changelog.
PALETTES = ("slate", "amber", "emerald", "rose", "yellow", "sky", "gray", "zinc",
            "neutral", "stone", "red", "orange", "lime", "green", "teal", "cyan",
            "blue", "indigo", "violet", "purple", "fuchsia", "pink")
found = sorted(set(re.findall(r"\b(?:bg|text|border|shadow|ring|from|to|via)-(?:%s)-\d{2,3}\b"
                              % "|".join(PALETTES), code)))
check(not found,
      "no raw Tailwind palette colour anywhere on the card",
      f"raw Tailwind colours are back on the Finale: {', '.join(found)}")

hexes = sorted(set(re.findall(r"#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b", code)))
check(not hexes,
      "no hardcoded hex on the card either",
      f"hardcoded hex on the Finale: {', '.join(hexes)} — a token cannot follow it")
check("rgba(" not in code,
      "no raw rgba() either (the blank used to be a Tailwind yellow at 70%)",
      "a raw rgba() is back on the card")

# ── B · the band is wired, not just referenced ─────────────────────────────
# var(--band) resolves to nothing without the class that defines it, and a
# missing colour is invisible rather than loud — so the class is asserted
# separately from the uses.
# THERE ARE TWO ROOTS — the question paper and the finish screen — and each
# needs the class in its own right. Asserting `"band-prod" in code` is not
# enough and was caught being not enough: stripping it from the question root
# left the finish screen's copy satisfying the match, and the break-test went
# green against a card whose every band colour had silently become nothing.
roots = re.findall(r'className="([^"]*\bband-prod\b[^"]*)"', code)
check(any("pb-8" in c for c in roots),
      "the question paper's own root carries band-prod",
      "band-prod is gone from the QUESTION root — every band colour on the "
      "card silently falls back to nothing (the finish screen's copy does "
      "not cover it)")
check(any("mx-auto" in c for c in roots),
      "the finish screen's own root carries band-prod",
      "band-prod is gone from the FINISH root")
check(code.count("var(--band)") >= 3 and code.count("var(--band-wash)") >= 3,
      "the band is used for both marks and fills",
      "the card barely uses the band it declares")

# The Finale is GramMarathon, which docs/COLOR_SYSTEM.md puts in Produce.
doc = read("docs/COLOR_SYSTEM.md")
check("GramMarathon" in doc and re.search(r"Produce.*GramMarathon", doc, re.S),
      "COLOR_SYSTEM.md still places GramMarathon in the Produce band",
      "COLOR_SYSTEM.md no longer puts GramMarathon in Produce — this card's "
      "band-prod may now be the wrong band")

# ── C · the two chips match each other ─────────────────────────────────────
# Dan's question was about these two. They were an amber one and a grey one,
# which implied a hierarchy that does not exist: they are two equal-weight
# secondary actions, and the loud one was loud only because it had borrowed
# the XP colour.
chips = re.findall(r'onClick=\{\(\) => (?:hint|grade)\(q\)\} className="([^"]+)"', code)
check(len(chips) == 2,
      "both card chips found",
      f"expected the hint and check chips, found {len(chips)}")
if len(chips) == 2:
    def colours(cls):
        return tuple(sorted(re.findall(r"(?:bg|text|border)-\[color:var\(([^)]+)\)\]", cls)))
    check(colours(chips[0]) == colours(chips[1]) and colours(chips[0]),
          "the hint chip and the check chip wear the same colours — the icon "
          "tells them apart, which is what icons are for",
          f"the two chips still disagree: {colours(chips[0])} vs {colours(chips[1])}")

# ── D · MEASURED: what may sit on the band's wash ──────────────────────────
css = read("src/app/globals.css")


def token(name, default=None):
    m = re.search(r"%s:\s*(#[0-9a-fA-F]{3,8})\s*;" % re.escape(name), css)
    return m.group(1) if m else default


INK = token("--cahier-ink")
SOFT = token("--cahier-ink-soft")
PAPER = token("--cahier-paper")
BAND = token("--band-prod")
check(all([INK, SOFT, PAPER, BAND]),
      f"resolved the tokens from globals.css (ink {INK}, soft {SOFT}, band {BAND})",
      f"could not resolve a token (ink={INK} soft={SOFT} paper={PAPER} band={BAND})")

if all([INK, SOFT, PAPER, BAND]):
    WASH = mix(BAND, PAPER, 0.12)   # the .band-* rule's own 12% recipe
    ink_on_wash = ratio(WASH, INK)
    soft_on_wash = ratio(WASH, SOFT)
    # The premise of this whole section: the two inks genuinely disagree here.
    # If they ever stop disagreeing the assertion below is worthless, so say so.
    check(ink_on_wash >= 4.5 and soft_on_wash < 4.5,
          f"on the band's wash, page ink passes ({ink_on_wash:.2f}:1) and the "
          f"soft ink fails ({soft_on_wash:.2f}:1) — so which one is used matters",
          f"the two inks no longer disagree on the wash "
          f"(ink {ink_on_wash:.2f}:1, soft {soft_on_wash:.2f}:1)")

    # The clue rungs are the band-wash chips that carry sentences.
    m = re.search(r'<ul lang="fr" className="([^"]+)"', code)
    clue_cls = m.group(1) if m else ""
    used = re.findall(r"text-\[color:var\(([^)]+)\)\]", clue_cls)
    check(used == ["--cahier-ink"],
          "the clue rungs take full page ink on the band's wash",
          f"the clue rungs use {used or 'no token'} on the band's wash — "
          f"--cahier-ink-soft measures {soft_on_wash:.2f}:1 there and fails")

    # And every OTHER band-wash fill on the card must carry page ink too.
    washed = re.findall(r'className="([^"]*bg-\[color:var\(--band-wash\)\][^"]*)"', code)
    bad = [c for c in washed if "--cahier-ink-soft" in c]
    check(not bad,
          f"all {len(washed)} band-wash fills carry page ink, none the soft ink",
          f"{len(bad)} band-wash fill(s) carry the soft ink at {soft_on_wash:.2f}:1")

# ── E · MEASURED: the hint chip is nowhere near the XP colour ──────────────
# This is the fault Dan actually named. amber-300 (#fcd34d) sits 0.3 degrees
# from --dopa-joy (#f8c20d), so the hint button WAS the XP colour under
# another name. Hue is computed rather than compared by string, because the
# next wrong colour will not be spelled "amber".
JOY = token("--dopa-joy")


def hue(h):
    h = h.lstrip("#")
    r, g, b = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    mx, mn = max(r, g, b), min(r, g, b)
    if mx == mn:
        return 0.0
    d = mx - mn
    if mx == r:
        v = ((g - b) / d) % 6
    elif mx == g:
        v = (b - r) / d + 2
    else:
        v = (r - g) / d + 4
    return v * 60


if JOY and BAND:
    gap = abs(hue(BAND) - hue(JOY))
    gap = min(gap, 360 - gap)
    check(gap > 20,
          f"the chips' band colour is {gap:.0f} degrees of hue from the XP "
          f"amber — the fault Dan named is gone",
          f"the chips sit {gap:.1f} degrees from the XP colour: the hint "
          f"button is wearing what XP means, again")

# ── F · the rest of the card's mapping ─────────────────────────────────────
check("var(--dopa-win-wash)" in code and "var(--dopa-miss-wash)" in code,
      "a right answer and a wrong one take the win / miss roles",
      "the verdict frames no longer use the win / miss roles")
check("var(--fam-wash)" in code and "--fam-practice-wash" not in code,
      "the primary key and the blank read the PAGE'S family, not a named one",
      "the card names a family instead of reading var(--fam-wash) off the "
      "shell — that is how it drifts when a route's family changes")
check("var(--dopa-joy" not in code,
      "the card never reaches for the XP colour",
      "the card uses --dopa-joy, which is XP — not a hint, not a key")

# ── G · THE HEADING BAND, which is the half that got forgotten ─────────────
# Dan: "you are forgetting the heading items again!" — and he was right. The
# card had been converted to band-prod while the strip ABOVE it still said
# "PRACTICE" in Practice-yellow ink, because the band is not the card's to
# paint: CahierShell derives it from the `active` key, and this route passed
# the family hub key instead of the activity's.
#
# One key, THREE consequences, which is why passing the wrong one is quiet:
#   the band's NAME   (PageBand: "the word that appears must be the activity
#                      name" — it read "PRACTICE", the family's)
#   the band's COLOUR (BAND[key]; "practice" is not in it, so the band fell
#                      back to the family ink and came out olive)
#   the page's GROUND (familyOf(key))
#
# So the assertion is the INVARIANT, not the string: the band the card paints
# itself and the band the shell will paint above it must be the same band.
page = strip_comments(read("src/app/practice/grammarathon/finale/page.tsx"))
m = re.search(r'active="([a-z0-9-]+)"', page)
active = m.group(1) if m else None
check(active, "the finale route declares an active key",
      "the finale route has no active key")

acts = read("src/content/activities.ts")
band_map = dict(re.findall(r'^\s*([a-z0-9]+):\s*"(guess|lesson|recog|prod|create)"', acts, re.M))
card_band = None
for c in roots:
    mm = re.search(r"\bband-(guess|lesson|recog|prod|create)\b", c)
    if mm:
        card_band = mm.group(1); break
check(card_band, f"the card declares a band ({card_band})",
      "the card declares no band")
if active and card_band:
    shell_band = band_map.get(active)
    check(shell_band == card_band,
          f"the heading band and the card agree — the shell resolves "
          f"{active!r} to band {shell_band!r}, the card paints {card_band!r}",
          f"THE HEADING BAND DISAGREES WITH THE CARD: the route says "
          f"active={active!r}, which the registry bands as {shell_band!r}, "
          f"while the card paints band-{card_band}. The strip above the card "
          f"is a different colour from the card.")

# ...and the band's word must be the ACTIVITY's name, which it only is when
# the key names an activity rather than a family hub.
#
# The obvious way to write this does not work, and was caught not working:
# FAMILIES entries carry the same `{ key, name }` shape as activities, so
# `active in names` was satisfied by "practice" -> "FluOLin Practice" and the
# break-test for the exact bug Dan reported went green. An activity is the
# entry that also declares a `family:` — that is the field that separates a
# thing you DO from the place it lives.
activities = dict(re.findall(r'\{\s*key:\s*"([a-z0-9]+)",\s*name:\s*"([^"]+)"[^}]*\bfamily:\s*"', acts))
check(active in activities,
      f"the band will read the ACTIVITY's name ({activities.get(active)!r})",
      f"active={active!r} is not an activity — it names a family or a hub, so "
      f"the heading band shows that label instead of the activity's name")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} problem(s), {len(OK)} ok")
    sys.exit(1)
print(f"\nall {len(OK)} checks pass")
