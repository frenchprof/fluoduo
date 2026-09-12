#!/usr/bin/env python3
"""
Patch 20–21's check — the DrillShell, phase 1.

What it asserts (the things a screenshot cannot):

  1  DrillShell exists and encodes its contract: 100dvh with overflow
     hidden, a body slot that swallows stray <h1>s, ONE Enter/Space binding,
     a real progressbar — and NO hearts (lives lockout is on the refused
     list of the settled gamification decisions, TODO.md §6).
  2  The four /practice/* drill routes render the drill, not the unit map:
     no UnitActivityPage import. UnitActivityPage itself is gone — patch 22
     (the pager) replaced the popup path it existed to carry.
  3  All four drill bodies are on the shell.
  4  SioModal lost its compensation chrome: drag-resize, the persisted
     panel size, auto-widen, and the ⤢ full-page hatch.
  5  Keyboard legends render only where a keyboard exists (>= sm, or
     pointer-fine): Say It, Letris, SpecuLearn, NumBus. (4Mémoire's legend
     died with its Cards view — the shell owns the keys now.)
  6  4Mémoire: the card drill is on the shell, the whole-deck table split
     out to /decks/:id, and one shared judge grades both surfaces.

Run from the repo root:  python3 verify/verify20.py
"""
import os, re, sys

FAIL = []
OK = []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    """A check must tell code from prose (2026-08-10 lesson)."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"^\s*\{/\*.*?\*/\}\s*$", "", src, flags=re.M)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

# ── 1 · the shell and its contract ─────────────────────────────────────────
shell = read("src/components/DrillShell.tsx")
shell_code = strip_comments(shell)
check(bool(shell), "DrillShell exists", "src/components/DrillShell.tsx is missing")
# THE LOCK MOVED, 2026-09-02, and this assertion follows it rather than
# being dropped. It read `"h-dvh" in shell_code`, which was true while the
# drill's own root was the full viewport. Dan's "Ok move all to A" put that
# root on the same desk every other page sits on — 8px down, one gutter in —
# so the HEIGHT is now the wrapper's (`.cahier-drilldesk { height: 100dvh }`
# in globals.css) and the drill takes `h-full` of it. The contract is
# unchanged and is still exactly one screen with nothing scrolling inside it;
# what changed is which of the two elements carries the number. Assert BOTH
# ends, because either alone is satisfied by a broken pair: a wrapper with a
# height and an inner that is `min-h-screen` overflows, and an `h-full` inner
# in a wrapper with no height collapses to nothing.
css = read("src/app/globals.css")
check(re.search(r"\.cahier-drilldesk\s*\{[^}]*height:\s*100dvh", css) is not None,
      "the drill's desk wrapper is exactly one screen tall",
      ".cahier-drilldesk does not set height: 100dvh — the drill has no lock to inherit")
check("cahier-drilldesk" in shell_code,
      "DrillShell mounts inside that wrapper",
      "DrillShell no longer renders .cahier-drilldesk — its root is loose in the layout again")
# The clip moved from a Tailwind utility on the root to `.cahier-drill` in
# globals.css on 6 Sep (the ring binds overhang the page edge, so the page
# clips with `overflow: clip` + a clip-margin apron rather than `hidden`).
# The claim is unchanged — the drill fills its wrapper and nothing inside it
# scrolls — so the check now reads both halves from where each lives.
check(re.search(r"cahier-drill .*h-full ", shell_code) is not None,
      "the drill root fills the wrapper (h-full)",
      "DrillShell's root is not `h-full` — it collapses")
check(re.search(r"\.cahier-drilldesk\s*>\s*\.cahier-drill\s*\{[^}]*overflow:\s*clip", css) is not None,
      "the drill clips its overflow (overflow: clip in globals) — nothing inside it scrolls",
      ".cahier-drill lost overflow: clip — a tall drill would scroll or leak onto the desk")
check("[&_h1]:hidden" in shell_code,
      "the body slot swallows any <h1> a drill prints",
      "DrillShell does not hide stray <h1>s")
check(shell_code.count("addEventListener(\"keydown\"") == 1,
      "ONE Enter/Space binding, defined in the shell",
      "DrillShell should own exactly one keydown binding")
check('role="progressbar"' in shell_code,
      "the progress bar is a real progressbar",
      "DrillShell's progress bar has no progressbar role")
check("♥" not in shell_code and not re.search(r"\bhearts?\b", shell_code, re.I),
      "no hearts — lives lockout stays refused (TODO §6)",
      "DrillShell mentions hearts/lives — that is on the REFUSED list")
check("animate-[drill-tray" in shell_code and "absolute inset-x-0 bottom-0" in shell_code,
      "the feedback tray overlays; it cannot push the body",
      "the feedback tray is not an absolute overlay — feedback would reflow the body")
check("justify-start" in shell_code and "justify-center py-4" not in shell_code,
      "the body slot starts near the header — no dead-centre hole above a short item",
      "the body slot dead-centres again — a short item floats mid-viewport (2026-08-11)")

# The draggable floats (by design, they stay) must clear the shell's footer:
# the shell declares a floor while mounted, the floats render above it, and
# the DEFAULT position is clamped like a saved one (a fresh device used to
# take the raw default and sit on the bottom bar).
check('setProperty("--float-floor"' in shell_code and "removeProperty" in shell_code,
      "the shell declares a float floor while mounted (and removes it after)",
      "DrillShell does not declare --float-floor — the floats sit on its footer")
drag_code = strip_comments(read("src/lib/useDragFloat.ts"))
check("var(--float-floor" in drag_code,
      "the floats honour a page-declared floor",
      "useDragFloat ignores --float-floor")
check("setPos(clamp(raw ?" in drag_code,
      "the floats' default position is clamped like a saved one",
      "useDragFloat still takes the raw default — fresh devices overlap the bottom bar")

# ── 2 · the drill routes render the drill ──────────────────────────────────
# THREE, not four: iComplete's route was deleted on 31 Aug (Dan: "iComplete is
# to be deleted"). The exercise is the Memo ladder's Moyen and Difficile tiers
# now — verify70 pins that, and pins that those tiers keep completing one and
# two missing pieces, which is what makes the deletion a move rather than a loss.
ROUTES = {
    "dice": "src/app/practice/dice/[collectionId]/page.tsx",
    "say-it": "src/app/practice/say-it/[collectionId]/page.tsx",
    "grammarathon": "src/app/practice/grammarathon/[collectionId]/page.tsx",
}
for name, p in ROUTES.items():
    src = strip_comments(read(p))
    check(src and "UnitActivityPage" not in src,
          f"/practice/{name} renders the drill, not the unit map",
          f"{p} still routes through UnitActivityPage")

# Patch 22 delivered the pager: the popup path for lessons is GONE, and
# UnitActivityPage (whose only remaining job was carrying it) went with it.
uap_importers = []
for root, _, files in os.walk("src"):
    for f in files:
        if f.endswith((".ts", ".tsx")):
            p = os.path.join(root, f)
            if "UnitActivityPage" in strip_comments(read(p)) and not p.endswith("UnitActivityPage.tsx"):
                uap_importers.append(p.replace(os.sep, "/"))
check(not os.path.isfile("src/app/UnitActivityPage.tsx") and uap_importers == [],
      "UnitActivityPage is fully retired (patch 22's pager replaced the popup path)",
      f"UnitActivityPage lives on: file={os.path.isfile('src/app/UnitActivityPage.tsx')}, importers={sorted(uap_importers)}")

# ── 3 · the drill bodies are on the shell ──────────────────────────────────
# iComplete dropped out here for the same reason as above.
CONTENTS = {
    "EtuDice": "src/app/practice/dice/[collectionId]/PracticeContent.tsx",
    "WorDrill": "src/app/practice/say-it/[collectionId]/SayItContent.tsx",
    "GramMarathon": "src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx",
}
for name, p in CONTENTS.items():
    src = strip_comments(read(p))
    check("DrillShell" in src and "drillExitHref" in src,
          f"{name} runs in DrillShell",
          f"{p} does not use DrillShell")
    if name == "EtuDice":
        # Its "no dice practice for this deck" fallback is an information
        # page with navigation, not a drill — CahierShell is right there.
        # The drill itself must not touch it.
        check("PracticeRunner set={practiceSet}" not in src
              or "<CahierShell" not in src.split("function PracticeRunner")[-1],
              "EtuDice's runner carries no page-shell of its own",
              f"{p}: PracticeRunner still wraps itself in CahierShell")
    else:
        check("CahierShell" not in src,
              f"{name} carries no page-shell of its own",
              f"{p} still wraps itself in CahierShell")

# SpecuLearn: migrated, and its config wizard is DELETED — the drill opens
# straight into the first question; the 🎤 modes moved to the end card.
specu = strip_comments(read("src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx"))
check("DrillShell" in specu and "CahierShell" not in specu,
      "SpecuLearn runs in DrillShell",
      "SpecuLearn is not on DrillShell / still wraps CahierShell")
check("Choisis ta direction" not in specu and '"start"' not in specu,
      "SpecuLearn's config wizard is gone — the first question is the first screen",
      "SpecuLearn still renders a pre-question config screen")
check("Guess and say" in specu and "again(false, \"say-s\")" in specu,
      "the 🎤 modes survive on the end card",
      "the wizard's 🎤 modes were deleted instead of moved to the end card")

# Select-then-commit (the shell's interaction grammar): in DrillShell an
# option tap SELECTS and the Check CTA COMMITS, for both MCQ drills.
dice = strip_comments(read(CONTENTS["EtuDice"]))
check("setSelected" in dice and '"Check"' in dice,
      "EtuDice is select-then-commit in the shell",
      "EtuDice still commits on tap in the shell")
# SPECULEARN IS THE EXCEPTION, BY INSTRUCTION. Dan, 5 Sep: "we should remove
# the Check button" — the same call as the SpecuLearn spec's "Tap to answer,
# no Check". The option a learner touches IS the answer they mean, and on a
# guess-before-you-are-taught activity the second tap only stood between the
# guess and the feedback the whole thing exists to give. EtuDice keeps its
# Check above; the grammar is no longer uniform across the shell, and that is
# the ruling, not a drift.
check('"Check"' not in specu,
      "SpecuLearn commits on tap — no Check button (Dan, 5 Sep)",
      "SpecuLearn has a Check button again; a tap is the answer")

# iComplete's help-ladder row is retired with its drill (31 Aug). It asserted
# that iComplete had the same useHelpLadder/hintsFor state machine as every
# other typed drill; the drill is deleted, so the claim has nothing to hold.
# The rule it protected — a typed drill gives graded help and records it — is
# still held for every typed drill that exists, by verify28's own table.

# Word-bank tiles below sm: the typed drills render tappable chips beneath the
# sentence — one `value`, either surface.
bank = strip_comments(read("src/components/WordBank.tsx"))
check(bool(bank) and "onChange(idxs.map((i) => tokens[i]).join(\" \"))" in bank,
      "WordBank exists and mirrors chips into the host's value",
      "src/components/WordBank.tsx missing or not mirroring value")

# THE ANSWER IS TYPED IN THE SENTENCE'S OWN GAP (Dan, 2026-09-11: *"whenever
# there is a blank to complete in a question (gap-fill), please do NOT make a
# separate long blank that is on a line separate from that gap … Don't
# multiply lines for nothing"*).
#
# THIS ROW USED TO ASSERT THE OPPOSITE, and that is the point of rewriting it
# rather than deleting it. It required `hidden w-full sm:block` — the 600px
# bar on its own line — as proof that a drill was wired correctly. Measured on
# the built app at 1100px before the change: GramMarathon drew a 48px rule
# inside « J'aime ___ cinéma. » AND a 600px input 62px below it, and the one
# the learner typed into was the lower one.
#
# So the check now holds the new shape and, in the same breath, fails the old
# one: a `w-full` answer bar coming back is the regression, not the fix.
# strip_comments, NOT read: the first cut of this row used the raw file and
# passed on a planted violation, because the prose above the call site says
# the word "builtInGap" too. A check a comment can satisfy is not a check.
for name, path in (("GramMarathon", CONTENTS["GramMarathon"]),
                   ("ConjugaZone", "src/app/conjugaison/embed/page.tsx")):
    src = strip_comments(read(path))
    check("GapField" in src and "WordBank" in src and "builtInGap" in src,
          f"{name}: the gap is the field, and the bank drops its own built row",
          f"{path}: gap-fill is not on GapField + WordBank builtInGap")
    check("hidden w-full sm:block" not in src,
          f"{name}: no full-width answer bar on a line of its own",
          f"{path}: the `hidden w-full sm:block` answer bar is back — the gap "
          f"belongs in the sentence (Dan, 2026-09-11)")

# GapField sizes the blank to the ANSWER, not to its container — "exactly
# where the word is supposed to be if that gap had been filled". A field that
# went back to filling its parent would satisfy every row above and still be
# the thing Dan objected to.
gapf = strip_comments(read("src/components/GapField.tsx"))
check("ch" in gapf and "answer.length" in gapf,
      "GapField is as wide as the word that belongs in it",
      "src/components/GapField.tsx no longer sizes itself from the answer")

# 4Mémoire: the card drill in the shell; the whole-deck TABLE split out to
# /decks/:id (CuratedDeckTable). One judge (shared.judgePart) grades both
# surfaces; study self-marks in the footer; test answers by word-bank below
# sm; 💡 Révéler is recorded as evidence (answer.reveal), like the ladder.
flip = strip_comments(read("src/app/practice/flip-it/[collectionId]/FlipItContent.tsx"))
check("DrillShell" in flip and "drillExitHref" in flip,
      "4Mémoire runs in DrillShell",
      "FlipItContent is not on DrillShell")
check("CahierShell" not in flip and "CahierFrame" not in flip,
      "4Mémoire carries no page-shell of its own",
      "FlipItContent still wraps itself in CahierShell/CahierFrame")
# « FLIP » LEFT THIS LIST on 2026-09-02. It was named here with the two
# self-marking CTAs, and it never belonged with them: they record what the
# learner knows, it only turned the card over — which tapping the card already
# did, on the one activity named for that gesture. Dan: *"there is a redundant
# button called FLIP which is not working and which we don't even need."* What
# this check is actually for — that study mode self-marks in the shell's
# footer rather than growing buttons of its own — is unchanged and is now
# asserted without the one CTA that was not a self-mark. The card's own button
# is pinned in verify27 §14g.
check('"✓ I know it"' in flip and '"↺ To review"' in flip,
      "4Mémoire study mode self-marks in the shell footer",
      "FlipItContent's self-marking CTAs (I know it / To review) are missing")
# Track D: the reveal moved into the ladder's ? control — the hook logs
# answer.reveal and records the evidence, so the drill itself need not.
check('"Check"' in flip and ('"answer.reveal"' in flip or "useHelpLadder(" in flip),
      "4Mémoire test mode commits via Check; reveals are recorded as evidence",
      "FlipItContent's test mode lacks Check or the answer.reveal event")
check("WordBank" in flip and 'className="sm:hidden"' in flip and "hidden w-full sm:block" in flip,
      "4Mémoire: typing above sm, word-bank tiles below it",
      "FlipItContent: word-bank/input breakpoint pair missing")

flip_shared = strip_comments(read("src/app/practice/flip-it/shared.tsx"))
table = strip_comments(read("src/app/decks/[id]/CuratedDeckTable.tsx"))
deck_content = strip_comments(read("src/app/decks/[id]/DeckContent.tsx"))
check("export function judgePart" in flip_shared
      and "judgePart" in flip and "judgePart" in table,
      "one judge (shared.judgePart) grades the drill and the table",
      "the drill and the table no longer share one judge")
check(bool(table) and "loadBuckets" in table and "setNote" in table
      and "/practice/flip-it/" in table,
      "the 4Mémoire table lives at /decks/:id, same stores, with the drill's door",
      "CuratedDeckTable missing, or lost the buckets/notes stores or the drill link")
check("CuratedDeckTable" in deck_content
      and "router.replace(`/practice/flip-it" not in deck_content,
      "/decks/:id renders the curated table instead of redirecting",
      "DeckContent still redirects curated decks to /practice/flip-it")

# ÉcouTexte: full-screen in the shell; its own Enter (mark a sentence)
# suppresses the shell CTA via preventDefault, which the shell honours.
ecout = strip_comments(read("src/app/practice/ecoutexte/EcouTexte.tsx"))
ecout_page = strip_comments(read("src/app/practice/ecoutexte/embed/page.tsx"))
check("DrillShell" in ecout and "CahierShell" not in ecout_page,
      "ÉcouTexte runs in DrillShell",
      "ÉcouTexte is not on DrillShell / its page still wraps CahierShell")
check("e.defaultPrevented" in shell_code,
      "the shell stands down when a body handled the key itself",
      "DrillShell ignores defaultPrevented — ÉcouTexte's Enter would draw a new text")

# ConjugaZone: the drill leads, the table is the REWARD screen. The old
# three-mode study table (shown/hidden/typing columns — a fourth interaction
# grammar nobody else used) is gone; evidence ids (conj-<verb>-<person>) and
# the phrases-complètes banks survive.
#
# 2026-08-24 (approved guidance flow): the pin loosened from "CahierShell not
# in the file" — the SIGNED-OUT gate now renders inside the page's normal
# chrome (band + bottom bar) instead of DrillShell's bare ✕-and-lock, so
# CahierShell may appear, but ONLY on the REQUIRE_SIGN_IN branch. The drill
# itself still runs in DrillShell.
conj = strip_comments(read("src/app/conjugaison/embed/page.tsx"))
check("DrillShell" in conj,
      "ConjugaZone runs in DrillShell",
      "ConjugaZone is not on DrillShell")
check("<CahierShell" not in conj or "REQUIRE_SIGN_IN && !user" in conj,
      "CahierShell appears only as the signed-out gate's chrome",
      "ConjugaZone wraps CahierShell outside the signed-out gate")
check("RewardTable" in conj and "🙈" not in conj and "peeked" not in conj,
      "the conjugation table is the reward screen; the column modes are gone",
      "ConjugaZone still carries the shown/hidden/typing column modes")
check("recordItemResult(`conj-" in conj and "SENTENCE_BANKS" in conj,
      "ConjugaZone keeps its evidence ids and the phrases-complètes banks",
      "ConjugaZone lost its evidence ids or the phrases-complètes banks")
check("WordBank" in conj,
      "ConjugaZone answers by word-bank below sm",
      "ConjugaZone has no word-bank on the phone")

# ── 4 · SioModal lost its compensation chrome ──────────────────────────────
sio = strip_comments(read("src/app/SioModal.tsx"))
for banned, why in (
    ("startResize", "drag-resize"),
    ("ResizeObserver", "the persisted panel size"),
    ("popupSize", "the size localStorage key"),
    ("Ouvrir en pleine page", "the ⤢ full-page hatch"),
    ("setPointerCapture", "pointer-capture resize"),
):
    check(banned not in sio,
          f"SioModal: {why} is gone",
          f"SioModal still carries {why} ({banned})")

# ── 5 · keyboard legends only where a keyboard exists ──────────────────────
LEGENDS = [
    ("Say It", "src/app/practice/say-it/[collectionId]/SayItContent.tsx",
     "Space = 🎤", "hidden", "sm:block"),
    # (4Mémoire's legend died with its Cards view — the shell owns Enter/Space
    # now and no bespoke shortcuts remain, so there is nothing to gate.)
    ("Letris", "src/games/letris/LetrisGame.tsx",
     "hard drop", "hidden", "sm:block"),
    ("SpecuLearn", "src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx",
     "CHOICE_KEYS_HINT}", "hidden", "sm:block"),
    ("NumBus", "src/games/numbus/NumBus.tsx",
     "⏎ submit", "hidden", "pointer-fine:block"),
]
for name, p, marker, *classes in LEGENDS:
    src = strip_comments(read(p))  # NumBus documents its legend in a JSDoc
    i = src.find(marker)
    # The gating class sits on the legend's element, which may open a line
    # or two above the text — judge the enclosing 500 characters.
    ctx = src[max(0, i - 500):i] if i >= 0 else ""
    check(i >= 0 and all(c in ctx for c in classes),
          f"{name}'s keyboard legend hides where there is no keyboard",
          f"{p}: legend near {marker!r} is not gated by {classes}")

# ── every drill wears a named band (Dan, 2026-08-25: "there should be a
# coloured band at the top of every page") ───────────────────────────────
# The band system shipped 24 Aug and was wired into exactly TWO surfaces —
# the lesson pager and ConjugaZone. Seven drills rendered with no band at
# all, which is the same complaint Dan had already made once ("why doesn't
# every page have this, with its relevant name of activity"). A drill that
# hands DrillShell no `activity` gets no band, silently.
#
# This asserts PRESENCE, not colour: verify36-band owns what colour a band
# wears. ÉcouTexte is exempt because it draws its own PageBand directly —
# checked here so the exemption can't quietly become "no band".
import glob as _glob
_shell_users = [p for p in _glob.glob("src/app/**/*.tsx", recursive=True)
                if "<DrillShell" in read(p)]
check(len(_shell_users) >= 8,
      f"{len(_shell_users)} surfaces render DrillShell",
      f"only {len(_shell_users)} surfaces render DrillShell — the sweep below "
      "would pass vacuously")
for _p in sorted(_shell_users):
    _src = read(_p)
    _name = _p.split("/")[-1]
    # ÉcouTexte used to be exempt here, on the grounds that it drew its own
    # PageBand. It did — INSIDE DrillShell's body, which carries
    # `[&_h1]:hidden`, so its title computed to display:none and the bar
    # showed empty from the day it shipped (23 Aug) to 27 Aug. A band with no
    # word in it passed the old "has a PageBand" test, which is why the
    # exemption is gone: every drill now proves the same way, through the
    # shell, and nothing gets to draw a heading inside a region that hides
    # headings.
    check("<PageBand" not in _src,
          f"{_name} does not hand-roll a band inside the shell's hidden-h1 body",
          f"{_name} renders its own PageBand inside DrillShell — its title will "
          "compute to display:none and the band will show empty")
    # Scan a WINDOW after the tag opens, not `[^>]*`: a prop like
    # `right={<>✓ {score.ok}</>}` contains '>', so a negated-class regex
    # stops before reaching `activity=` and reports a false failure. (It did,
    # on the two surfaces that had the band all along.)
    _found = False
    for _m in re.finditer(r"<DrillShell\b", _src):
        if "activity=" in _src[_m.start():_m.start() + 900]:
            _found = True
            break
    check(_found,
          f"{_name} names its activity, so the band appears",
          f"{_name} renders DrillShell with no `activity` prop — that page has "
          "no band and the learner cannot see which activity they are in")

print("\npatch 20-21 check (phase 1)\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
