#!/usr/bin/env python3
"""
One tile grid, and no hard column count anywhere near it.

Dan, 2026-09-11: *"I also asked for SpecuLearn tiles to allow more of them per
row. Maybe up to 4 per row"*, then, shown where else the same shape lived:
*"take all four, and delete FamilyHub"*.

WHAT THIS GUARDS, AND WHY IT IS A CHECK RATHER THAN A COMMENT. Five surfaces
now share one floor in globals.css. Two of them — SpecuLearn's stop tiles and
the Réglages picker — were driven at 320/390/768/1400 and give 2/2/3/4 columns
with no sideways scroll. The other three were NOT measured, and the reason is
worth writing down because the first explanation offered for it was wrong.

It is NOT sign-in. Dan, 2026-09-11: *"there is no sign-in wall at
staging.fluoli.ngo as well as fluoduo.pages.dev !"* — and the local build runs
with NEXT_PUBLIC_OPEN_APP=1 anyway, so the wall was never up. What actually
happened:

  · /profil renders a CahierShell hosting <iframe src="/profil/embed">. The
    probe read the outer document, found the chrome and nothing else, and that
    empty body was misread as a locked page. The tiles are in the frame, and
    /profil/embed renders them fine.
  · Profil's tile sections sit inside collapsed accordions, so they are absent
    from the DOM until opened;
  · the games gallery is a BottomSheet that needs the right control clicked.

None of that is a wall — it is a page this session did not learn to open. The
honest position is that these three are unverified on screen, not unreachable,
and this file is what stands between them and a quiet regression until someone
drives them properly.

(This correction was written twice: once on the branch #307 came from, where
the squash into #313 took an earlier state of the file, and then carried onto
main by #314, which cherry-picked it. It is restated here rather than left to
rot, because a wrong reason in a check's rationale is worse than no reason at
all — which is also why this parenthesis says what actually happened rather
than repeating that it was lost.)

THE FLOOR DOES THE COUNTING BY ITSELF, which is the whole point:

    min(50% - gap/2, --tile-min)   two on the narrowest phone; on a wider
                                   row, as many as the floor admits

At least two is Dan's 2026-09-07 rule ("put buttons in two columns", looking at
SpecuLearn at 390px). THE FOUR-COLUMN CAP IS GONE (2026-09-19, Dan: *"The
SpecuLearn tiles are supposed to be adaptive but it seems to not go beyond 4
columns"*, then the principle under it: *"it has to cater to all the phone
size possible, HENCE THE NEED TO HAVE RELATIVE / ADAPTIVE SIZING!"*). The 11
Sep "maybe up to 4 per row" was implemented as a quarter-of-the-row floor,
which is a ceiling wearing a formula's clothes: no column narrower than a
quarter means four columns is the most ANY width can buy. The reversal is
pinned below as `"25%" not in body` — the cap must not come back wearing a
new formula. The floor also rides the type ramp (--fs-step), so desktop type
grows the tiles instead of clipping their names. Neither rule is a
breakpoint, and that matters twice over: a breakpoint is only right at the
widths someone remembered to write, and these surfaces run INSIDE the
cahier's iframe, where a media query measures the FRAME and not the phone —
390px of device is 313px of frame. GameGallery was carrying exactly that
mistake as `sm:grid-cols-3`.

WHY ONE DEFINITION. The formula was written once for the stop tiles and was
about to be copied into four more files. `gapSentence` drifted into five
implementations and `optionGrid.ts` exists to stop the option threshold doing
the same; this check is the third instance of the same lesson.

Numbered 260, well clear of the 210–230 band that is currently contested —
AGENTS.md's own advice after one branch renumbered four times in a night.

Run from the repo root:  python3 verify/verify260-tile-grid.py
"""
import os, re, sys

CSS = "src/app/globals.css"
PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.exists(p) else ""


def code(p):
    """Source with comments stripped.

    BOTH of this file's first two failures were its own false positives, and
    both were comments:

      · `sm:grid-cols-3` survives in GameGallery only inside the note
        explaining why it was removed — the check read its own epitaph as the
        corpse;
      · `.sio-path {` matched the TAIL of the shared selector list
        (`.fluo-tilegrid, .stop-grid, .sio-path {`), which naturally does
        declare grid-template-columns.

    verify20 hit the mirror image of the first one earlier the same day, where
    a comment SATISFIED a check instead of failing it. A check that reads
    prose is not reading code, whichever way the result falls.
    """
    src = read(p)
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)      # block comments, JS and CSS
    src = re.sub(r"^\s*//.*$", "", src, flags=re.M)       # whole-line //
    src = re.sub(r"\{/\*.*?\*/\}", "", src, flags=re.S)  # JSX {/* … */}
    return src


css = read(CSS)

# ── the shared rule exists, and carries both caps ───────────────────────────
rule = re.search(r"\.fluo-tilegrid,\s*\.stop-grid,\s*\.sio-path\s*\{(.*?)\n\}", css, re.S)
ok(rule is not None,
   "one rule covers .fluo-tilegrid, .stop-grid and .sio-path",
   "the shared tile grid rule is gone or no longer covers all three selectors")

body = rule.group(1) if rule else ""
ok("auto-fit" in body,
   "the tile grid counts its own columns (auto-fit), so there is no breakpoint",
   "the tile grid no longer uses auto-fit — a fixed count is back")
ok("50%" in body,
   "no column may be wider than half, so a phone always gets two",
   "the at-least-two floor (min(50% - gap/2, …)) has gone — Dan, 2026-09-07")
ok("25%" not in body,
   "no quarter cap: the count is the room's answer, not four — Dan, 2026-09-19",
   "a quarter-of-the-row term is back in the floor. The 11 Sep cap was a "
   "ceiling in a formula's clothes — four columns was the most ANY width "
   "could buy — and Dan reversed it 19 Sep: \"supposed to be adaptive but "
   "it seems to not go beyond 4 columns\".")
ok("--tile-min" in body,
   "call sites choose only --tile-min; the formula lives in one place",
   "--tile-min is gone, so each call site must restate the whole formula")

# ── the five call sites are on it, not on a hard count of their own ─────────
#
# Checked as SOURCE, because three of these cannot be driven signed-out. A
# grep is a weaker instrument than a browser and is used here only where a
# browser is not available at all.
SITES = {
    # MOVED 12 Sep: /reglages became a redirect to the User page's Settings
    # tab, so the pick-list itself now lives here. The check follows the
    # CONTROL, not the URL — pointed at the old file it would have passed
    # by reading a page that no longer draws anything.
    "src/app/reglages/SettingsContent.tsx": "the bottom-bar family picker",
    # NOT "the gallery sheet" any more: the BottomSheet went on 12 Sep and the
    # sets are on the page, so this grid is the page's own. Same rule, same
    # floor — only the thing it sits in changed.
    "src/components/GameGallery.tsx": "the games gallery",
    "src/components/ProfileContent.tsx": "Profil's tile sections",
}
for path, what in SITES.items():
    src = code(path)
    ok("fluo-tilegrid" in src,
       f"{what} is on the shared tile grid",
       f"{path}: {what} is not on .fluo-tilegrid")
    ok("grid-cols-2" not in src,
       f"{what} has no hard two-column grid left",
       f"{path}: a `grid-cols-2` is back in {what} — the shared floor already "
       f"guarantees two columns and adds the other two")

gallery = code("src/components/GameGallery.tsx")
ok("sm:grid-cols" not in gallery,
   "the games gallery counts room, not breakpoints",
   "src/components/GameGallery.tsx: a `sm:` grid breakpoint is back. This "
   "page runs inside the cahier's iframe, where a media query measures the "
   "frame and not the phone — it was asking `sm` about the wrong box.")

# ── .sio-path keeps its own spacing but not its own column count ────────────
# A rule of its OWN, not the last selector of the shared list. `^` alone is
# not enough and was the second false positive: the shared rule is written one
# selector per line, so `.sio-path {` DOES begin a line there. What separates
# them is the comma ending the line above.
sio = re.search(r"(?<!,\n)^\.sio-path\s*\{(.*?)\n\}", css, re.S | re.M)
ok(sio is not None and "grid-template-columns" not in sio.group(1),
   ".sio-path takes its columns from the shared rule",
   ".sio-path has its own grid-template-columns again — it was `repeat(2, …)` "
   "until 11 Sep, with a comment warning that collapsing below 520px would "
   "leave eight full-width rows. That warning was about a MEDIA QUERY; the "
   "shared floor has none and guarantees two columns at every width.")

print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
print("-" * 70)
print(f"  {len(PASS)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
