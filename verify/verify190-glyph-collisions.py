#!/usr/bin/env python3
"""
No glyph means two different things (2026-09-09).

WHY THIS EXISTS. On 9 Sep an emoji stock-take found two glyphs each doing two
unrelated jobs, live on the same screen at the same time:

    💬   the Skills family door  AND  the floating "report a bug" button
    🧰   the LexicaLater game    AND  the floating "Outils" tools tray

Open WorDrill — a Skills exercise — and you met 💬 twice and 🧰 twice, meaning
different things each time. Dan's fix: 🐞 for the bug button, 🤹 for Skills,
🛠️ for the tray, 🔐 for the game (renamed LexicaLocker).

That fix is one edit to four files, and NOTHING WOULD HAVE STOPPED IT COMING
BACK. The app has ~26 emoji-as-icon slots spread across a registry and a
handful of floating controls; the next person to pick a glyph for a new game
has no way to see what is already taken, because the two floating buttons are
nowhere near the registry. The collision took weeks to notice the first time
and was found by accident.

So this is the check the house rule asks for — "a ban that is not written down
and not checked is not a ban ... and the check takes a list, because the next
ruling will not be about this font." CHROME below IS that list: a floating
control that wears a glyph gets one line here, and then it cannot silently
collide with a family or a game.

THE VARIATION-SELECTOR TRAP, which is why comparison goes through fold().
Several of these glyphs are written with an invisible U+FE0F ("render this as
an emoji, not as text") — 🏋️ and 🛠️ both carry one, 🎯 and 🐞 do not. They are
the same picture to a learner either way, so a naive == would rate 🛠 and 🛠️
as two different glyphs and wave through exactly the collision this file
exists to catch. fold() strips it before comparing.

Run from the repo root:  python3 verify/verify190-glyph-collisions.py
"""
import os, re, sys

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)

if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)


# THE LIST. A floating or chrome control that wears a glyph belongs here, with
# the glyph it wears. Adding one is the whole job of protecting it.
CHROME = [
    ("src/components/FeedbackButton.tsx", "🐞", "the floating report-a-bug button"),
    ("src/components/tools/ToolSummon.tsx", "🛠️", "the floating Outils tray (VoixLà · ChaTutor)"),
]

ACT = "src/content/activities.ts"


def fold(g: str) -> str:
    """Compare glyphs by what a learner sees, not by their bytes."""
    return g.replace("️", "")


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(s: str) -> str:
    """Drop comments before looking for a RENDERED glyph.

    Found by this file's own break-test, and it is the fault the house style
    warns about three times over (verify19b, verify152's `.cahier-page`,
    verify153). ToolSummon.tsx explains its own glyph four times in the header
    comment — « 🛠️, not 🧰 (Dan, 2026-09-09) » — so re-glyphing the BUTTON to
    🧰 left the file still containing 🛠️ in prose, and check 1 passed while
    the screen showed the collision back again. A check that cannot tell code
    from prose reports its own documentation as evidence.
    """
    s = re.sub(r"/\*[\s\S]*?\*/", "", s)
    return re.sub(r"(?m)^\s*//.*$", "", s)


def block(src: str, opener: str) -> str:
    """The array literal that follows `opener`, up to its closing `];`."""
    i = src.find(opener)
    if i < 0:
        return ""
    j = src.find("\n];", i)
    return src[i:j] if j > 0 else src[i:]


src = read(ACT)
check(bool(src), f"{ACT} is readable", f"MISSING {ACT} — the registry is the source of every family and game glyph")
if FAIL:
    print("\n".join("  FAIL " + m for m in FAIL)); sys.exit(1)

# name -> (glyph, href), for each of the two registries. The name is carried so
# a failure can say WHICH two things collided rather than just naming a glyph;
# the href is carried because of the 👤 case described at check 2.
def entries(opener):
    out = []
    for m in re.finditer(r"\{[^{}]*\}", block(src, opener)):
        e = m.group(0)
        name = re.search(r'name:\s*"([^"]+)"', e)
        emoji = re.search(r'emoji:\s*"([^"]+)"', e)
        href = re.search(r'href:\s*"([^"]+)"', e)
        if name and emoji:
            out.append((name.group(1), emoji.group(1),
                        href.group(1) if href else ""))
    return out


families = entries("export const FAMILIES")
activities = entries("const RAW_ACTIVITIES")

check(len(families) == 7,
      f"all 7 families read out of FAMILIES ({', '.join(n for n, _, _ in families)})",
      f"expected 7 families in FAMILIES, parsed {len(families)} — this check "
      "cannot guard what it cannot see, so fix the parse before trusting a pass")
check(len(activities) >= 15,
      f"{len(activities)} activities read out of RAW_ACTIVITIES",
      f"only {len(activities)} activities parsed from RAW_ACTIVITIES — the "
      "registry moved or the shape changed; a silent parse of 0 would make "
      "every assertion below vacuously true")

# ---- 1 · the two floating controls wear the glyph this file says they do ----
# Without this, someone edits ToolSummon.tsx back to 🧰 and every collision
# assertion below keeps comparing against the 🛠️ written here — green, wrong.
for path, glyph, what in CHROME:
    body = strip_comments(read(path))
    check(bool(body) and glyph in body,
          f"{what} wears {glyph}, as this check's list says",
          f"{path} does not contain {glyph} — {what} has been re-glyphed "
          f"without updating CHROME in this file, so the collision scan below "
          f"is now measuring a glyph nothing renders")

# ---- 2 · no glyph leads to two different places ----------------------------
# A GLYPH MAY BE SHARED BY TWO ENTRIES THAT GO TO THE SAME PLACE, and that is
# not the fault this file guards. 👤 is both the User family door and the
# Profile activity, and both are `/profil`: one destination reached two ways,
# so a learner who reads 👤 as "me" is right every time. The 9 Sep fault was
# 💬 leading to the Skills hub from one place and opening a bug-report form
# from another — same picture, two unrelated outcomes.
#
# Keying on destination rather than on a list of blessed pairs means a new
# family/activity pair like 👤 needs no edit here, while a genuine collision
# still cannot slip past. The floating controls get a sentinel destination of
# their own: a button that opens a tray goes nowhere a page goes, so it can
# never legitimately share with one.
#
# ONE NAMED EXCEPTION, added 2026-09-09 the same day this file was written:
# Dan drew the new 7-family grid menu HIMSELF with 🛠️ Tools (ChaTutor,
# ComposeIt) — the same glyph ToolSummon's own floating "Outils" tray
# already wore (VoixLà, ChaTutor). Unlike the 💬/🧰 faults this file exists
# to catch, this one is not an accident nobody noticed: it is Dan's own
# pick, made knowing the tray existed, because the two are the same idea
# (summonable help) even though their member lists don't quite match. Named
# here, one pair, rather than widening the destination rule generally.
ALLOWED_SHARED = {("FluOLin Write (family)", "the floating Outils tray (VoixLà · ChaTutor)")}

owners = {}
for name, glyph, href in families:
    owners.setdefault(fold(glyph), {}).setdefault(href, []).append(f"{name} (family)")
for name, glyph, href in activities:
    owners.setdefault(fold(glyph), {}).setdefault(href, []).append(f"{name} (activity)")
for path, glyph, what in CHROME:
    owners.setdefault(fold(glyph), {}).setdefault(f"\0{path}", []).append(what)

ALLOWED_SETS = {frozenset(pair) for pair in ALLOWED_SHARED}
clashes = {}
for glyph, by_dest in owners.items():
    if len(by_dest) <= 1:
        continue
    who_lists = list(by_dest.values())
    flat = frozenset(w for who in who_lists for w in who)
    if flat in ALLOWED_SETS:
        continue
    clashes[glyph] = [" / ".join(who) for who in who_lists]

shared_ok = sum(1 for by_dest in owners.values()
                if len(by_dest) == 1 and len(next(iter(by_dest.values()))) > 1)
check(not clashes,
      f"each of the {len(owners)} glyphs leads to exactly one place"
      + (f" ({shared_ok} shared by entries that go to the same place)" if shared_ok else ""),
      "a glyph leads to two different places, which is the fault Dan fixed on "
      "9 Sep — a learner meets both and neither reading is right: "
      + "; ".join(f"{g} -> {' AND '.join(who)}" for g, who in sorted(clashes.items())))

# ---- 3 · the glyphs that caused this cannot quietly return -----------------
# Narrower than 2 on purpose: 2 catches a collision, this catches the specific
# regression of putting the bug button's old glyph back in a patch that moves
# something else out of the way at the same time — no collision, but Dan's
# ruling reversed. Named one by one, the verify105 precedent, so this never
# becomes a sweep for "emoji we dislike".
#
# SKILLS ITSELF RETIRED THE SAME DAY (later in the same conversation), split
# into Oral and Tools — so "Skills wears 🤹" stopped being a thing to check
# within the hour it became true. What still matters from the original fix:
# 💬 is free to mean Oral now (Skills, its old owner, is gone), and Tools'
# 🛠️ is the ONE deliberate exception check 2 names above.
oral = {n: g for n, g, _ in families}.get("FluOLin Speak", "")
check(fold(oral) == fold("💬"),
      "FluOLin Speak wears 💬 (Dan, 2026-09-09, after Skills retired)",
      f"FluOLin Speak wears {oral or '(nothing)'}, not 💬")
tools = {n: g for n, g, _ in families}.get("FluOLin Write", "")
check(fold(tools) == fold("🛠️"),
      "FluOLin Write wears 🛠️ (Dan, 2026-09-09 — the one deliberate share, see check 2)",
      f"FluOLin Write wears {tools or '(nothing)'}, not 🛠️")
locker = {n: g for n, g, _ in activities}.get("LexicaLocker", "")
check(fold(locker) == fold("🔐"),
      "LexicaLocker wears 🔐, and is spelled LexicaLocker",
      f"no activity named LexicaLocker wearing 🔐 — Dan retired the name "
      "LexicaLater and the glyph 🧰 (which the Outils tray also wore) on 9 Sep")

print("\n".join("  ok   " + m for m in OK))
if FAIL:
    print("\n".join("  FAIL " + m for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
