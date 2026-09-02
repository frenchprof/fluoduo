#!/usr/bin/env python3
"""
Patch 23 — games (2026-08-17).

The plan rows (UI_WORK_PLAN_1.md → PATCH 23): GameFrame + GameBar v2;
100dvh / overflow hidden with boards sized to the device; the six per-game
headers, duplicate titles and instruction paragraphs deleted; the game-over
post-mortem (which item · what you did instead · where it goes); misses feed
the ReVue queue with CORRIGER MAINTENANT primary; CreditsSplash once per
browser; desktop two-pane with the live record beside the board; galleries →
one ▶ Jouer card + bottom sheet.

What this asserts (static, over source):

  1  GameFrame exists: 100dvh, overflow-hidden, ResizeObserver → --board-w/-h,
     the two-pane record aside at lg, the ⋯ sheet; GameBar v2 draws hearts
     and ⋯ and no longer carries the v1 site links; BottomSheet is the sheet.
  2  Every one of the six games (seven files — ComposeIt has two engines)
     renders GameFrame and GameOver; the game route pages no longer mount
     GameBar v1 or a min-h-screen <main>.
  3  No game file prints an <h1> or a <header>; the strings that were the
     old headers / instruction paragraphs are gone.
  4  GameOver: CORRIGER MAINTENANT is the primary, queueForReview is called,
     reviserHref opens ReVue, "where it goes" is the map deep link (/map).
  5  The queue API is real: progress.ts queueForReview writes itemSrs;
     reviser.ts exports reviserHref / REVIEW_FOCUS_PARAM; /reviser reads the
     focus list off the URL.
  6  CreditsSplash gates on localStorage (once per browser).
  7  Keyboard legends still hide where there is no keyboard (verify20 rule).
  8  The four game galleries render GameGallery: ▶ Jouer + Choisir un autre
     + BottomSheet.
  9  The new shell files carry no hex literal (tokens only).
 10  CI runs this file after verify25b.

Run from the repo root:  python3 verify/verify23.py
"""
import os, re, sys

FAIL, OK = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)
    src = re.sub(r"\{/\*.*?\*/\}", "", src, flags=re.S)
    return src


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

frame = read("src/components/GameFrame.tsx")
bar = read("src/components/GameBar.tsx")
sheet = read("src/components/BottomSheet.tsx")
over = read("src/components/GameOver.tsx")
gallery = read("src/components/GameGallery.tsx")
fr = strip_comments(frame)
br = strip_comments(bar)
ov = strip_comments(over)

# ── 1 · the shell ───────────────────────────────────────────────────────────
check(bool(frame), "GameFrame.tsx exists", "src/components/GameFrame.tsx missing")
check('height: "100dvh"' in fr or "h-dvh" in fr, "GameFrame is 100dvh tall", "GameFrame is not 100dvh")
check("overflow-hidden" in fr, "GameFrame overflow: hidden — the page never scrolls during play", "GameFrame does not hide overflow")
check("ResizeObserver" in fr and "--board-w" in fr and "--board-h" in fr and "useBoardSize" in fr,
      "the board is measured (ResizeObserver → --board-w/--board-h + useBoardSize)",
      "GameFrame does not measure the board")
check("game-record" in fr and "lg:flex" in fr, "desktop two-pane: the live record aside appears at lg (1024px)",
      "no two-pane record aside at lg")
check("safe-area-inset-bottom" in fr and "--bottombar-floor" in fr,
      "GameFrame respects the safe area and --bottombar-floor", "GameFrame ignores safe area / bottombar floor")
# SOUND LEFT THE SHEET on 2 Sep (Dan: "some games are missing the volume
# button") — SoundControl is on GameBar now, visible, and verify90 holds it
# there. The sheet keeps help and quit.
check("<BottomSheet" in fr and "SoundControl" not in fr and "Help" in fr and "Quit" in fr,
      "the ⋯ sheet carries help / quit, and sound has moved to the bar",
      "the ⋯ sheet is missing help or quit — or SoundControl came back to it, "
      "which is two doors to one control (see verify90)")
check(bool(sheet) and "role=\"dialog\"" in sheet, "BottomSheet.tsx exists and is a dialog", "BottomSheet missing")
check("hearts" in br and "⋯" in br and "progressbar" in br,
      "GameBar v2 draws progress · hearts · ⋯", "GameBar v2 lacks progress / hearts / ⋯")
check("LINKS" not in br and "HelpDot" not in br and "FluOlinGo" not in br,
      "GameBar v1's site links / help dot are gone", "GameBar still carries v1 site links")

# ── 2 · six games on the shell ──────────────────────────────────────────────
GAMES = {
    "NumBus": "src/games/numbus/NumBus.tsx",
    "NumBourse": "src/games/numbourse/NumBourse.tsx",
    "LexicaLater": "src/games/lexicalator/Lexicalator.tsx",
    "VocabulaRain": "src/games/letris/LetrisGame.tsx",
    "Match It": "src/games/matching/MatchingGame.tsx",
    "ComposeIt solo": "src/games/compose/ComposeSolo.tsx",
    "ComposeIt dialogue": "src/games/compose/ComposeDialogue.tsx",
}
for name, p in GAMES.items():
    src = strip_comments(read(p))
    check("<GameFrame" in src and 'from "@/components/GameFrame"' in src,
          f"{name} renders GameFrame", f"{p} does not render GameFrame")
    check("<GameOver" in src and 'from "@/components/GameOver"' in src,
          f"{name} ends on GameOver", f"{p} does not render GameOver")
    # (ComposeIt's phrase banks keep a <header> per category — a label the
    # learner needs; the HUD headers were all `<header className="flex …`.)
    check("<h1" not in src and '<header className="flex' not in src,
          f"{name} prints no <h1>/HUD <header> of its own", f"{p} still prints an <h1> or a HUD <header>")

PAGES = [
    "src/app/games/numbus/page.tsx",
    "src/app/games/numbourse/page.tsx",
    "src/app/games/compose/[bankId]/page.tsx",
    "src/app/games/lexicalater/[deckId]/page.tsx",
    "src/app/games/vocabularain/[setId]/page.tsx",
    "src/app/games/matching/[collectionId]/MatchingContent.tsx",
]
for p in PAGES:
    src = strip_comments(read(p))
    check('from "@/components/GameBar"' not in src and "min-h-screen" not in src and "CahierShell" not in src,
          f"{p}: no GameBar v1, no min-h-screen main, no CahierShell", f"{p} still mounts GameBar v1 / min-h-screen / CahierShell")

# ── 3 · the prose that went ────────────────────────────────────────────────
GONE = [
    ("Palais Brongniart — séance en cours", "NumBourse's subtitle"),
    ("Drag down a chest to begin", "LexicaLater's blinking red instruction"),
    ("Tap a{\" \"}", "Match It's instruction card"),
    ("Take note of the items involved", "VocabulaRain's study-table blurb"),
    ("Every useful key belongs to a visible chest!", "LexicaLater's inline post-mortem tip"),
]
allgames = "\n".join(strip_comments(read(p)) for p in GAMES.values())
for lit, why in GONE:
    check(lit not in allgames, f"gone: {why}", f"still on a board: {why} ({lit!r})")
check("configSummary(config)" not in strip_comments(read(GAMES["NumBus"])),
      "NumBus no longer prints the session recipe under a title", "NumBus still prints configSummary in a header")

# ── 4 · the post-mortem ────────────────────────────────────────────────────
check(bool(over), "GameOver.tsx exists", "src/components/GameOver.tsx missing")
check("CORRIGER MAINTENANT" in ov and "cahier-btn-primary" in ov.split("CORRIGER MAINTENANT")[0][-400:],
      "CORRIGER MAINTENANT is the primary button", "CORRIGER MAINTENANT is missing or not primary")
check("queueForReview(" in ov, "GameOver queues the misses via queueForReview", "GameOver does not call queueForReview")
check("reviserHref(" in ov, "GameOver opens ReVue via reviserHref", "GameOver does not open /reviser")
check("/map?unit=${sio.unit}#${sio.id}" in over, "'where it goes' is the map deep link /map?unit=N#SIO-xxx",
      "GameOver's 'where it goes' is not the Home deep link")
check("given" in ov and "expected" in ov and "prompt" in ov,
      "a miss has item · what you did instead · what was expected", "GameMiss lacks prompt/given/expected")
check("Play again" in ov and ("Back" in ov), "secondary: play again / back", "GameOver lacks play again / back")

# ── 5 · the queue API is real ──────────────────────────────────────────────
prog = strip_comments(read("src/lib/progress.ts"))
rev = strip_comments(read("src/lib/reviser.ts"))
revpage = strip_comments(read("src/app/reviser/page.tsx"))
check("export function queueForReview" in prog and "intervalDays: 0" in prog.split("export function queueForReview")[1][:600],
      "progress.queueForReview writes itemSrs due-now (what dueForReview reads)", "queueForReview missing or does not write itemSrs")
check("export function reviserHref" in rev and "REVIEW_FOCUS_PARAM" in rev,
      "reviser.ts exports reviserHref / REVIEW_FOCUS_PARAM", "reviser.ts lacks reviserHref")
check("reviewFocusFrom(" in revpage and "window.location.search" in revpage,
      "/reviser puts the focused misses at the head of the session", "/reviser ignores ?items=")
check("export function reviewItemByFrench" in rev, "number games can find the deck row for a spoken number", "reviewItemByFrench missing")

# ── 6 · CreditsSplash once per browser ─────────────────────────────────────
cs = strip_comments(read("src/games/CreditsSplash.tsx"))
check("localStorage" in cs and "CREDITS_SEEN_KEY" in cs and "fluolingo:credits.seen" in cs,
      "CreditsSplash gates on localStorage — once per browser", "CreditsSplash still shows on every launch")

# ── 7 · keyboard legends still gated (verify20's rule) ─────────────────────
nb = strip_comments(read(GAMES["NumBus"]))
i = nb.find("⏎ submit")
check(i >= 0 and "pointer-fine:block" in nb[max(0, i - 500):i] and "hidden" in nb[max(0, i - 500):i],
      "NumBus's shortcut legend hides where there is no keyboard", "NumBus legend not gated")
lt = strip_comments(read(GAMES["VocabulaRain"]))
i = lt.find("hard drop")
check(i >= 0 and "sm:block" in lt[max(0, i - 500):i] and "hidden" in lt[max(0, i - 500):i],
      "VocabulaRain's shortcut legend hides where there is no keyboard", "VocabulaRain legend not gated")

# ── 8 · galleries ──────────────────────────────────────────────────────────
check(bool(gallery) and "▶ Jouer" in gallery and "Choisir un autre" in gallery and "<BottomSheet" in gallery,
      "GameGallery: ▶ Jouer card + Choisir un autre → BottomSheet", "GameGallery missing pieces")
for p in ("src/app/games/vocabularain/page.tsx", "src/app/games/lexicalater/page.tsx",
          "src/app/games/compose/page.tsx", "src/app/games/matching/page.tsx"):
    check("<GameGallery" in read(p), f"{p} renders GameGallery", f"{p} is still a wall of tiles")
check("itemSrs" in strip_comments(gallery), "the next set comes from the learner's itemSrs", "GameGallery ignores the SRS")

# ── 9 · tokens only in the new shell files ─────────────────────────────────
HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
for p in ("src/components/GameFrame.tsx", "src/components/GameBar.tsx", "src/components/BottomSheet.tsx",
          "src/components/GameOver.tsx", "src/components/GameGallery.tsx", "src/games/CreditsSplash.tsx"):
    n = len(HEX.findall(strip_comments(read(p))))
    check(n == 0, f"{os.path.basename(p)}: no hex literals (tokens only)", f"{p}: {n} hex literal(s)")

# ── 10 · CI ────────────────────────────────────────────────────────────────
wf = read(".github/workflows/verify.yml")
check("verify/verify23.py" in wf and wf.find("verify25b.py") < wf.find("verify23.py"),
      "CI runs verify23 after verify25b", "verify23 is not wired into .github/workflows/verify.yml after verify25b")

print("\npatch 23 check — games\n" + "-" * 66)
for x in OK:   print("  ok    " + x)
for x in FAIL: print("  FAIL  " + x)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
