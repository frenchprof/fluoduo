#!/usr/bin/env python3
"""
FAVOURITES — the star, the page, the caps, and the two traps this feature has.

Dan, 2026-09-12: *"allow learners to favourite particular pages or activity so
they can revisit when want to, like bookmarks"*, then *"there should be a
proper favourites page"*, and — asked what a row should say — both of the
richer options: the name, where it sits, when it was starred, AND renameable,
*"so long as it is linked ... it should even allow them to organise into
folders"*.

WHAT ROTS IF NOBODY WATCHES, one clause each:

  1  THE STAR IS MOUNTED, NOT MERELY IMPORTED.  `verify117` learned this the
     hard way about `EmbedFrame`: an import satisfies a grep and renders
     nothing. The ★ is the ONLY way to star a page, so an unmounted one is a
     feature that exists entirely in the source.

  2  THE NAME COMES FROM THE SHELL'S KEY, NOT THE PATH.  Found by driving the
     built app: `/practice/say-it/aimer-activites` named itself « FluOLinGo »,
     because WorDrill's registry href is `/practice/wordrill` while its deck
     route is `/practice/say-it/…`. The route and the door are different
     strings for the same activity. `describeHere` is pure, so this check
     EXECUTES it rather than reading it.

  3  THE TWO CAPS AGREE.  200 items and 20 folders are written twice — in
     `lib/favourites.ts`, where a learner meets the limit as a message, and in
     `firestore.rules`, where the server refuses. If they drift, the learner
     meets the server's number as a star that goes on and comes back off after
     a reload, with nothing said. Same number or the feature lies.

  4  THE SHAPED RULE IS NOT DECORATIVE.  Firestore rules are OR-ed. A shaped
     `match /favourites/{id}` sitting beside a permissive `{sub=**}` wildcard
     grants nothing and forbids nothing — the wildcard already allowed the
     write. The path must be in the wildcard's exclusion list, or clause 3's
     caps are a comment.

  5  DELETING A FOLDER KEEPS THE PAGES.  The one thing this feature must never
     do is lose a starred page because a folder was tidied away. Executed, not
     read.

Run from the repo root:  python3 verify/verify400-favourites.py
"""
import json, os, re, shutil, subprocess, sys

OK, FAIL = [], []


def check(cond, ok_msg, fail_msg):
    (OK if cond else FAIL).append(ok_msg if cond else fail_msg)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root"); sys.exit(2)

STAR = "src/components/FavouriteStar.tsx"
LIB = "src/lib/favourites.ts"
HERE = "src/lib/favouriteHere.ts"
PAGE = "src/components/FavouritesContent.tsx"
BAR = read("src/components/SiteTopBar.tsx")
RULES = read("firestore.rules")

for p in (STAR, LIB, HERE, PAGE, "src/app/favourites/page.tsx", "src/app/favourites/embed/page.tsx"):
    check(os.path.isfile(p), f"{p} exists", f"{p} is gone — Favourites is missing a part")

# ── 1 · the star is MOUNTED in the top bar ────────────────────────────────
check("<FavouriteStar" in BAR,
      "the ★ is rendered in the top bar, not merely imported",
      "SiteTopBar imports FavouriteStar but never renders it — an import is not "
      "a button, and the ★ is the only way to star a page (verify117's lesson)")
# Beside the account chip is where Dan put it: "At the top right next to their
# name". Order matters, so it is asserted rather than assumed.
star_at = BAR.find("<FavouriteStar")
acct_at = BAR.find("<AccountButton")
check(star_at != -1 and acct_at != -1 and star_at < acct_at,
      "the ★ sits immediately before the account chip, where Dan asked for it",
      "the ★ is no longer beside the account chip — Dan, 12 Sep: "
      '"At the top right next to their name"')

# ── 2 · the naming rules, EXECUTED ────────────────────────────────────────
TMP = ".tmp-verify-fav"
shutil.rmtree(TMP, ignore_errors=True)
os.makedirs(TMP, exist_ok=True)
open(os.path.join(TMP, "tsconfig.json"), "w", encoding="utf-8").write(json.dumps({
    "compilerOptions": {
        "outDir": ".", "rootDir": "../src", "module": "commonjs", "target": "es2020",
        "skipLibCheck": True, "noEmitOnError": False, "resolveJsonModule": True,
        # esModuleInterop, or a `.json` import emits `x_json_1.default` and the
        # copied file has no default — the JSON reads as undefined.
        "esModuleInterop": True,
        "baseUrl": "..", "paths": {"@/*": ["src/*"]},
    },
    "files": ["../src/lib/favouriteHere.ts", "../src/lib/favourites.ts"],
}))
subprocess.run(["npx", "tsc", "-p", os.path.join(TMP, "tsconfig.json")],
               capture_output=True, text=True)
# tsc does NOT rewrite path aliases, so every emitted `require("@/…")` is a
# module node cannot find. Point them at this temporary tree instead — and copy
# any JSON the graph imports, which tsc leaves behind.
base = os.path.abspath(TMP).replace(os.sep, "/")
for root, _dirs, files in os.walk(TMP):
    for f in files:
        if f.endswith(".js"):
            fp = os.path.join(root, f)
            src = open(fp, encoding="utf-8").read()
            open(fp, "w", encoding="utf-8").write(src.replace('require("@/', f'require("{base}/'))
for root, _dirs, files in os.walk("src"):
    for f in files:
        if f.endswith(".json"):
            dst = os.path.join(TMP, os.path.relpath(os.path.join(root, f), "src"))
            if not os.path.isfile(dst):
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                shutil.copyfile(os.path.join(root, f), dst)

here_js = os.path.abspath(os.path.join(TMP, "lib", "favouriteHere.js")).replace(os.sep, "/")
fav_js = os.path.abspath(os.path.join(TMP, "lib", "favourites.js")).replace(os.sep, "/")
check(os.path.isfile(here_js) and os.path.isfile(fav_js),
      "the favourites libraries compile standalone (so this check can run them)",
      "favouriteHere/favourites did not emit — the naming and folder rules "
      "could not be executed, so this check would have passed by doing nothing")

if os.path.isfile(here_js) and os.path.isfile(fav_js):
    SCRIPT = r"""
const { describeHere } = require("%s");
const { emptyFavourites, toggleFavourite, addFolder, moveToFolder, removeFolder, listing, countIn, moveMany, removeMany } = require("%s");
const out = {};
// The shell's key beats the path — the « FluOLinGo » bug.
out.byKey = describeHere("/practice/say-it/aimer-activites", "", "FluOLinGo", "wordrill").auto;
// A page with no key still resolves off the registry's href.
out.byPath = describeHere("/tutor", "", "FluOLinGo").auto;
// The title is a trail; only the head of it is a name.
out.byTitle = describeHere("/nowhere", "", "Map of FluOLinGo-land — FluOLinGo · FluOLinGo").auto;
// NO ROW IS NAMED AFTER THE SITE. `/guide` and all ~50 `/lessons/*` routes
// set no title of their own, so they inherit the layout's and every row read
// « FluOLinGo » — five starred lessons would have been five identical rows.
// Found by starring nine real pages and reading the list.
out.bareGuide = describeHere("/guide", "", "FluOLinGo").auto;
out.bareLesson = describeHere("/lessons/atelier-avis-resto", "", "FluOLinGo").auto;
// `where` is never invented.
out.whereNull = describeHere("/tutor", "", "x", "tutor").where;
// The User page's four tabs are four rows, not one.
out.tabs = describeHere("/profil", "?tab=board", "x") .href;
// Folder delete keeps its pages.
let f = emptyFavourites();
f = toggleFavourite(f, { href: "/a", auto: "A", emoji: "x", where: null }, 1).next;
f = addFolder(f, "Test", 2);
const fid = f.folders[0].id;
f = moveToFolder(f, "/a", fid);
f = removeFolder(f, fid);
out.keptAfterFolderDelete = f.items.length;
out.orphanCameHome = f.items[0] && f.items[0].folder === null;
// ONE LEVEL AT A TIME: the top shows folders and the loose pages, and a page
// filed inside a folder is NOT also listed at the top.
let g = emptyFavourites();
g = toggleFavourite(g, { href: "/x", auto: "X", emoji: "x", where: null }, 10).next;
g = toggleFavourite(g, { href: "/y", auto: "Y", emoji: "y", where: null }, 20).next;
g = addFolder(g, "Box", 30);
const gid = g.folders[0].id;
g = moveToFolder(g, "/x", gid);
const top = listing(g, null, "recent");
const inside = listing(g, gid, "recent");
out.topItems = top.items.map((i) => i.href);
out.topFolders = top.folders.length;
out.insideItems = inside.items.map((i) => i.href);
out.insideFolders = inside.folders.length;
out.count = countIn(g, gid);
// Sorting actually sorts.
let h = emptyFavourites();
h = toggleFavourite(h, { href: "/b", auto: "Beta", emoji: "b", where: null }, 100).next;
h = toggleFavourite(h, { href: "/a", auto: "Alpha", emoji: "a", where: null }, 200).next;
out.recent = listing(h, null, "recent").items.map((i) => i.label);
out.byName = listing(h, null, "name").items.map((i) => i.label);
// Bulk: move three of four, remove two of four, and leave the rest alone.
let k = emptyFavourites();
for (const n of [1, 2, 3, 4]) k = toggleFavourite(k, { href: `/k${n}`, auto: `K${n}`, emoji: "k", where: null }, n).next;
k = addFolder(k, "Box", 9);
const kid = k.folders[0].id;
const moved = moveMany(k, ["/k1", "/k2", "/k3"], kid);
out.bulkMoved = moved.items.filter((i) => i.folder === kid).length;
out.bulkUntouched = moved.items.filter((i) => i.folder === null).map((i) => i.href);
const culled = removeMany(k, ["/k1", "/k4"]);
out.bulkLeft = culled.items.map((i) => i.href).sort();
console.log(JSON.stringify(out));
""" % (here_js, fav_js)
    r = subprocess.run(["node", "-e", SCRIPT], capture_output=True, text=True)
    try:
        got = json.loads(r.stdout.strip())
    except Exception:
        got = None
    check(got is not None, "the naming and folder rules executed",
          f"executing them failed: {r.stderr.strip()[:300]}")
    if got:
        check(got["byKey"] == "WorDrill",
              "the shell's own key names the page, so a deck route is not « FluOLinGo »",
              f"a page named itself {got['byKey']!r} — describeHere stopped preferring "
              "the shell's `active` key, which is the one thing that knows a deck "
              "route belongs to WorDrill")
        check(got["byPath"] == "ChaTutor",
              "an unkeyed page still resolves off the registry href",
              f"the href fallback broke: got {got['byPath']!r}")
        check(got["byTitle"] == "Map of FluOLinGo-land",
              "a page title is trimmed to its head, not stored as a trail",
              f"the title fallback kept the trail: {got['byTitle']!r}")
        check(got["bareGuide"] == "Guide" and got["bareLesson"] == "Atelier avis resto",
              "a page with no title of its own is named after its address, "
              "never after the site",
              f"a titleless page named itself {got['bareGuide']!r} / "
              f"{got['bareLesson']!r} — a list of rows all reading « FluOLinGo » "
              "is a list nobody uses, and it is invisible until the page has "
              "something in it")
        check(got["whereNull"] is None,
              "a page that belongs to no stop says nothing rather than a wrong goal",
              "`where` invented a goal for a page that has none — a label that "
              "lies the moment the learner moves on")
        check(got["tabs"] == "/profil?tab=board",
              "the User page's tabs stay four different rows",
              f"the tab was dropped from the href: {got['tabs']!r}")
        check(got["keptAfterFolderDelete"] == 1 and got["orphanCameHome"],
              "deleting a folder keeps the pages inside it",
              "deleting a folder destroyed what was in it — the one thing this "
              "feature must never do")
        check(got["topItems"] == ["/y"] and got["topFolders"] == 1,
              "the top level shows the folders and only the pages not filed in one",
              f"the top level is wrong: {got['topItems']} with "
              f"{got['topFolders']} folder(s) — a filed page must not ALSO be "
              "loose at the top, or moving something appears to duplicate it")
        check(got["insideItems"] == ["/x"] and got["insideFolders"] == 0,
              "opening a folder shows its pages and no folders (one level, no nesting)",
              f"inside the folder is wrong: {got['insideItems']} with "
              f"{got['insideFolders']} folder(s)")
        check(got["count"] == 1, "a folder counts what is in it",
              f"countIn is wrong: {got['count']}")
        check(got["recent"] == ["Alpha", "Beta"] and got["byName"] == ["Alpha", "Beta"],
              "Recent puts the newest first and Name sorts alphabetically",
              f"the sorts are wrong — recent {got['recent']}, name {got['byName']}")
        check(got["bulkMoved"] == 3 and got["bulkUntouched"] == ["/k4"],
              "moving a selection moves exactly the selection and nothing else",
              f"a bulk move went wrong: {got['bulkMoved']} moved, "
              f"{got['bulkUntouched']} left behind (expect 3 and ['/k4'])")
        check(got["bulkLeft"] == ["/k2", "/k3"],
              "removing a selection removes exactly the selection",
              f"a bulk remove went wrong: {got['bulkLeft']} left (expect /k2, /k3)")

shutil.rmtree(TMP, ignore_errors=True)

# ── 3 · the caps agree, client and server ─────────────────────────────────
lib = read(LIB)
m_items = re.search(r"MAX_ITEMS\s*=\s*(\d+)", lib)
m_folders = re.search(r"MAX_FOLDERS\s*=\s*(\d+)", lib)
r_items = re.search(r"request\.resource\.data\.items\.size\(\)\s*<=\s*(\d+)", RULES)
r_folders = re.search(r"request\.resource\.data\.folders\.size\(\)\s*<=\s*(\d+)", RULES)
check(all([m_items, m_folders, r_items, r_folders]),
      "both caps are stated on both sides",
      "a cap is missing from lib/favourites.ts or firestore.rules — one of the "
      "two would then be unbounded")
if all([m_items, m_folders, r_items, r_folders]):
    check(m_items.group(1) == r_items.group(1) and m_folders.group(1) == r_folders.group(1),
          f"the caps agree: {m_items.group(1)} items, {m_folders.group(1)} folders",
          f"the caps have drifted — client {m_items.group(1)}/{m_folders.group(1)}, "
          f"rules {r_items.group(1)}/{r_folders.group(1)}. The learner would meet "
          "the server's number as a star that comes back off after a reload, "
          "with nothing said")

# ── 4 · the shaped rule actually bites ────────────────────────────────────
check("match /favourites/{favDocId}" in RULES,
      "firestore.rules shapes the favourites document",
      "no shaped rule for favourites — the wildcard would accept any document "
      "at that path, of any size")
wildcard = re.search(r"!\(sub\[0\] in \[([^\]]*)\]\)", RULES)
check(wildcard is not None and "favourites" in wildcard.group(1),
      "'favourites' is excluded from the {sub=**} wildcard, so the shaped rule bites",
      "the shaped favourites rule is DECORATIVE: rules are OR-ed, and the "
      "{sub=**} wildcard still allows the write it refuses. Add 'favourites' to "
      "that exclusion list in the same patch as any shaped rule under users/")

# ── 5 · the page is still shaped like a FILE MANAGER ──────────────────────
# Dan sent the first build back — "refer to current file management systems in
# the latest popular OS" — so these hold the shape that answer produced, not
# the one it replaced. The first build FAILED this section's earlier form,
# which asserted <details> accordions; that is the point of rewriting a check
# with the design rather than leaving it asserting the thing Dan rejected.
page = read(PAGE)
check("<details" not in page,
      "folders are places you go into, not accordions that unfold in place",
      "the folders are <details> again — that is the shape Dan sent back on "
      "12 Sep. A folder in Finder, Explorer or iOS Files is somewhere you GO, "
      "with a way back; an accordion stacks two lists on one page")
check("aria-label=\"Where you are\"" in page,
      "a breadcrumb says where you are and gets you back out",
      "the breadcrumb is gone — a folder you can enter and not leave is a "
      "trap, and it is the one control every file manager puts at the top")
check(page.count("aria-haspopup=\"menu\"") >= 2,
      "each row's actions live behind one ⋯ menu (pages and folders both)",
      "a row's actions are not behind a ⋯ menu any more — the first build put "
      "three controls on every line and that is what Dan rejected")
check("countIn(fav" in page,
      "a folder row says how many pages are inside before you open it",
      "a folder row lost its count — the whole reason to print it is so "
      "nobody opens a folder to find out whether it was worth opening")
check('"recent"' in page and '"name"' in page,
      "the list can be ordered by most-recent or by name",
      "the sort control is gone — every file list has one")
# ── 6 · drag and drop, and the path that does not need it ─────────────────
# Dan, 12 Sep: "add drag and drop". The trap is that the OBVIOUS way to build
# it — HTML5 `draggable` + onDragStart — does not fire for touch AT ALL, so it
# ships as a desktop-only feature wearing a cross-platform name, and nobody
# notices because the desktop is where it gets tested.
check("onPointerDown" in page and "pointermove" in page,
      "the drag is built on POINTER events, so a finger can do it too",
      "the drag is not on pointer events — if it went back to HTML5 "
      "`draggable`/onDragStart it fires for a mouse and NEVER for touch, which "
      "is the device a learner actually holds")
# COMMENTS STRIPPED FIRST, and this check earned that the hard way: it failed
# on its own first run because the file's docstring EXPLAINS that `draggable`
# is the desktop-only trap, and the word was enough. Fourth time this repo has
# had a check read its own documentation as the defect (verify152, verify153,
# verify106, verify270) — apparently it has to be learned once per author.
bare_page = re.sub(r"/\*[\s\S]*?\*/", "", re.sub(r"(?m)^\s*//.*$", "", page))
check("draggable" not in bare_page,
      "no HTML5 draggable attribute (it would be the desktop-only trap)",
      "an HTML5 `draggable` attribute is back on a row — it fires for a mouse "
      "and never for touch")
check('data-drop' in page and '"root"' in page,
      "a folder row is a drop target, and the crumb is the way back OUT",
      "the drop targets are gone — a drag with nowhere to land is an animation")
check("350" in page,
      "a touch drag starts on a HOLD, so a finger can still scroll the list",
      "the long-press delay is gone: if a drag starts on the first movement of "
      "a finger, the list cannot be scrolled at all")
check("didDrag" in page,
      "a drop does not also follow the link under it",
      "nothing suppresses the click at the end of a drag — dropping a page "
      "onto a folder would file it AND navigate to it")
# The menu path must survive the drag, not be replaced by it.
check("Move to…" in page,
      "« Move to… » survives as the path that needs no drag",
      "« Move to… » is gone. A drag cannot be done from a keyboard, and is "
      "hard with a tremor or a trackpad — iOS Files ships both for that reason")

# ── 7 · multi-select ──────────────────────────────────────────────────────
# Dan, 12 Sep: "add multi-select too". The trap here is the opposite of the
# drag's: the OBVIOUS build — a plain click selects, like Finder — takes the
# tap away from OPENING a page, which is the list's whole reason to exist. So
# touch gets an explicit Select mode and a mouse gets the modifier clicks.
check("selMode" in bare_page and "Select" in page,
      "there is a Select mode, so a tap can still mean « open this »",
      "the Select mode is gone — without it, selecting on a touch screen has "
      "to steal the tap, and a favourites list you cannot open is not one")
check("metaKey" in bare_page and "shiftKey" in bare_page,
      "⌘/Ctrl-click toggles and Shift-click takes a range (what a mouse tries)",
      "the modifier clicks are gone — Finder and Explorer both do this and "
      "people try it without being told")
check("moveMany" in bare_page and "removeMany" in bare_page,
      "a selection can be moved and removed in one go",
      "a selection cannot be acted on in bulk — a tick-box with nothing behind "
      "it is worse than no tick-box")
check("sel.includes(it.href) ? sel : [it.href]" in bare_page,
      "dragging a ticked row carries the WHOLE selection (Finder's behaviour)",
      "a drag that starts on a ticked row moves only that row, so the "
      "selection is decoration as soon as you touch it")

# ── 9 · THE SECOND DOOR — A TILE IN THE ☰ GRID ──────────────────────────────
# Dan, 2026-09-12: *"put Favourites in the burger grid menu in the yellow
# lesson strip replacing Map (Map already has multiple doors and does not need
# this space)"*.
#
# WHY THIS IS CHECKED AND NOT JUST DONE. The ★ in the top bar only becomes a
# LINK once something is starred — before that, a tap toggles. So a learner who
# has starred nothing has no way to reach the page and find out what it is for,
# and this tile is the only door that is always open. `MenuGrid`'s ROWS are
# hand-written (the grid is NOT derived from the registry), so nothing else in
# the app would notice the tile going missing.
MENU = read("src/components/MenuGrid.tsx")
bare_menu = re.sub(r"/\*[\s\S]*?\*/", "", re.sub(r"(?m)^\s*//.*$", "", MENU))

# Anchored on the LESSON row specifically, not on the file: a Favourites tile
# that drifted into another strip would still satisfy a bare substring search,
# and Dan named the yellow one.
lesson = bare_menu.split('PEN.goals')[-1].split(']},')[0] if 'PEN.goals' in bare_menu else ""
check('name: "Favourites"' in lesson and '"/favourites"' in lesson,
      "Favourites has a tile in the ☰ menu's yellow Lesson strip",
      "the Favourites tile is not in the Lesson row — the page's only other "
      "door is a ★ that does not navigate until something is starred, so a new "
      "learner cannot reach it at all")
check('"Map"' not in lesson,
      "the map gave up that slot, as Dan asked (it still has the 🗺️ in the "
      "icon strip, the MneMemo tile, and Home's hero)",
      "the Map tile is back in the Lesson row — it and Favourites cannot both "
      "hold the same slot")
# ⭐ IS XP, NOT A BOOKMARK (StatsHelp: "earned every answer"). One glyph, one
# meaning — the rule that moved the bug button to 🐞 on 9 Sep.
check('emoji: "⭐", name: "Favourites"' not in bare_menu,
      "the tile wears ★, not the ⭐ that already means XP",
      "the Favourites tile took ⭐, which is the XP glyph on the User page and "
      "in StatsHelp — one glyph cannot mean two things")

# THE DOOR AND THE PAGE WEAR THE SAME COLOUR (Dan, 2026-09-12: *"make the
# favourites page yellow to match its door"*). The tile is in the yellow LESSON
# strip; `SITE_FAMILY` is what paints the page's spine, band and ink. These are
# two files that know nothing about each other, and for a few hours they
# disagreed — a yellow tile opening a grey page. Tied together here so the next
# session that moves the tile is told to move the colour with it.
ACT = read("src/content/activities.ts")
m = re.search(r'favourites:\s*"(\w+)"', ACT)
check(m is not None and m.group(1) == "goals",
      "the Favourites page wears the family of the strip its tile sits in",
      "the Favourites page's family is "
      f"{m.group(1) if m else 'missing'}, not the Lesson family its ☰ tile sits "
      "in — a yellow door opening a page of another colour is the exact "
      "mismatch Dan sent back")

# AND THE BAND WEARS ★, NOT THE FAMILY'S GLYPH. The chain is
# `band?.emoji ?? activity(active)?.emoji ?? familyEmoji(famKey)`, and this page
# is in neither ACTIVITIES nor FAMILIES — so it takes whatever its family wears
# unless it says otherwise. Going yellow put Lesson's 🧑‍🏫 on it (a teacher, on
# a page that is not a lesson) until it named its own. Checked because the two
# halves — the colour and the glyph — come from the same edit and the glyph is
# the half nobody looks at.
ROUTE = read("src/app/favourites/page.tsx")
check('emoji: "★"' in ROUTE,
      "the Favourites band names its own ★ rather than borrowing Lesson's 🧑‍🏫",
      "the Favourites band has no emoji of its own, so it falls back to its "
      "family's — which is the Lesson teacher, on a page that is not a lesson "
      "and whose ☰ tile wears ★")

check("w-full" not in page,
      "no control on the page wears the whole width",
      "a full-width control is back on the Favourites page (Dan, 5 Sep)")

print("\n".join("  ok    " + s for s in OK))
if FAIL:
    print("\n".join("  FAIL  " + s for s in FAIL))
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
