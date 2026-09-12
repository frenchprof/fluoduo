#!/usr/bin/env python3
"""
Loose bugs + data-truth backlog (2026-08-17).

The rows (UI_WORK_PLAN_1.md → LOOSE BUGS & OPS, PRE-EXISTING AUDIT BACKLOG;
STATUS.md rows 9 and 10). None of it is a feature; all of it is why a page
misled or a number lied.

What this asserts (static over source, plus ONE executed table):

  1  /decks/[id]/study: the curated redirect runs OUTSIDE the AuthGate.
  2  /decks/view, /study, /mcq without ?id= render NoDeck (a door to the
     Index), never the bare string "No deck specified.".
  3  DeckContent.tsx carries no slate-*/rose-*/emerald-*/bg-white; the 19b
     ratchet baseline is at or under the migrated counts.
  4  /sio/[id] is a redirect to /?unit=N#SIO (SioRedirect); nothing but
     that folder links to /sio/…; KeyNav's two-digit jump opens Home.
  5  DEPLOY.md names fluolingo-dot-com and keeps the which-main banner.
  6  The meta description keeps LAF1201, English first, no French.
  7  ONE definition of weak: progress.ts exports WEAK_BELOW 50 / GOOD_FROM
     75 / tierFor / isWeakSrs; no other file carries "< 50"/"< 75" tier
     literals or an SRS interval rule; the known sites import it.
  8  ONE shuffle: src/lib/shuffle.ts is Fisher–Yates; no
     sort(() => Math.random() - 0.5) anywhere in src; no private
     Fisher–Yates copy; seeded shuffles still exist where they were.
  9  D6: no reader of users/{uid}/sessions.  10  D7: no reader of
     users/{uid}/attempts (getCountFromServer gone).
  11 D9/D10: "retried"/"mastered" appear in no reader; the writer stores
     the evidence block; teacher data.ts and outcomeRows read outcomeId /
     evidenceType / assistance / independent; outcomeOf() exists.
  12 D11: progressMerge.ts is pure (no firebase/window import), and the
     merge table EXECUTES in node: timeZone follows the winning
     lastActiveDay, term survives, SRS keeps the further-out entry.
  13 Leaderboard: boardName() is the ONE identity, used by the publisher
     and the board; no email fallback in progressSync.
  14 D4: push stamps lastSyncedAt; failures log sync.error; the teacher
     panel computes staleness against the learner's newest event.
  15 CI runs this file after verify26.

Run from the repo root:  python3 verify/verify27-bugs.py
"""
import glob, json, os, re, subprocess, sys

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

SRC = [f for f in glob.glob("src/**/*.ts", recursive=True) + glob.glob("src/**/*.tsx", recursive=True)]
CODE = {f: strip_comments(read(f)) for f in SRC}

# ── 1 · study redirect outside the gate ───────────────────────────────────
study = CODE["src/app/decks/[id]/study/Content.tsx"]
m = re.search(r"export default function StudyPage.*", study, re.S)
tail = m.group(0) if m else ""
check("CuratedRedirect" in tail and tail.find("CURATED.some") < tail.find("<AuthGate"),
      "/decks/[id]/study: curated ids redirect before the AuthGate",
      "/decks/[id]/study still gates the curated redirect")
check("router.replace(`/practice/flip-it/${id}`)" in study, "the redirect lands on the 4Mémoire drill", "redirect target changed")

# ── 2 · NoDeck empty state ────────────────────────────────────────────────
bare = [f for f in SRC if "No deck specified." in read(f)]
check(not bare, "no page renders the bare string \"No deck specified.\"", f"bare string still in {bare}")
nodeck = CODE.get("src/app/decks/NoDeck.tsx", "")
# The map is Home since 12 Sep — what matters is that the empty-deck page
# offers a way back to it, not which of its two addresses it spells.
check("HOME_HREF" in nodeck and "CahierShell" in nodeck,
      "NoDeck links to the map inside the shell",
      "NoDeck lacks a map link / shell")
for p in ("src/app/decks/view/page.tsx", "src/app/decks/study/page.tsx", "src/app/decks/mcq/page.tsx"):
    check("<NoDeck />" in CODE[p], f"{p} renders NoDeck without ?id=", f"{p} does not render NoDeck")

# ── 3 · DeckContent on tokens ─────────────────────────────────────────────
PALETTE = re.compile(r"\b(?:text|bg|border|ring|hover:text|hover:bg|hover:border)-"
                     r"(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|"
                     r"emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white)(?:-\d{2,3})?\b")
dc = read("src/app/decks/[id]/DeckContent.tsx")
stock = PALETTE.findall(dc)
check(not stock, "DeckContent.tsx carries no stock palette class", f"DeckContent.tsx stock classes: {sorted(set(stock))[:8]}")
check("var(--cahier-ink)" in dc and "var(--tier-good" in dc, "DeckContent.tsx uses the cahier + tier tokens", "DeckContent.tsx not on tokens")
try:
    base = json.load(open("verify/visual-baseline.json", encoding="utf-8"))["counts"]
    check(base.get("stock_tailwind_classes", 10**9) <= 774, f"19b ratchet re-baselined at {base.get('stock_tailwind_classes')} stock classes (<= 774)", f"19b baseline not lowered: {base}")
except Exception as e:  # noqa: BLE001
    check(False, "", f"visual-baseline.json unreadable: {e}")

# ── 4 · /sio/[id] is THE GOAL, and one card serves it ─────────────────────
# REVERSED 2026-09-05, and the reversal is Dan's shape for the whole app:
# *"so the idea is / MAP > SIO > MneMemO > ..."*. Patch 25 had reduced this
# route to a redirect, and the reason it gave was DUPLICATION — the page was a
# second copy of Home's popup and had drifted out of step with it, printing
# "Planned" for pre-tests that existed. That reason does not reach what is
# there now: the goal is a level of the navigation, and the card on it is the
# same `GoalCard` the lesson's ← 🎯 Goal tab renders, from ONE file.
#
# So the assertion moves with the ruling. What is pinned is the thing the old
# rule was really protecting — that a goal is described in one place — plus the
# snap, which is the whole of Dan's "the magnet stops it".
# The goals RUN IN A FRAME since 2026-09-07 (Dan: everything runs in the cahier
# in an iframe), so the page is the notebook and `/sio/<id>/embed` is the
# scroller. Both halves are checked: a host with no twin is a page with nothing
# on it, and the fifty static pages must still build on BOTH — old bookmarks and
# printed QR codes name the host.
sio = CODE["src/app/sio/[id]/page.tsx"]
sio_embed = CODE["src/app/sio/[id]/embed/page.tsx"]
check("EmbedFrame" in sio and "generateStaticParams" in sio,
      "/sio/[id] is the cahier that hosts the goal, and the fifty static pages "
      "still build (old links, printed QR)",
      "/sio/[id] no longer hosts its embed twin, or has lost its fifty static "
      "pages")
check("SioScroller" in sio_embed and "generateStaticParams" in sio_embed,
      "and /sio/[id]/embed is the scroller itself, fifty pages deep",
      "/sio/[id]/embed no longer renders the goal scroller")
# THE MAGNET ITSELF MOVED into components/SnapFeed.tsx on 2026-09-07, when the
# pre-tests needed the same one-item-per-screen behaviour (Dan: *"ONE QUESTION
# PER PAGE!"*) and it would otherwise have been written out a second time. So
# what is checked here is that the goals still USE it; the snap classes are
# verify110's to hold, at the one place they now live.
scroller = CODE.get("src/app/sio/[id]/SioScroller.tsx", "")
check("SnapFeed" in scroller,
      "the goals snap one per screen, through the shared feed",
      "the SIO scroller no longer uses components/SnapFeed. Dan: *\"it lands "
      "like a magnet onto the next goal or previous. It should stop rather "
      "than continuous scroll\"* — and a second copy of that mechanism is "
      "how the two surfaces start behaving differently.")
# ONE description of a goal ACROSS THE TWO DOORS TO IT. This is the old rule's
# real content: the /sio page and the lesson's ← 🎯 Goal tab are the same card
# reached two ways, and hand-writing it twice is how the retired /sio page came
# to print "Planned" for pre-tests that existed.
#
# StopSheet is deliberately NOT in this set. It is the map's stop sheet — a
# different surface with its own shape (neo-key rows, activity icons, family
# bands) that happens to name the same can-do. Folding it in would flatten a
# considered design to satisfy a rule about drift between two things that are
# meant to be identical.
sharers = ["src/app/sio/[id]/SioScroller.tsx", "src/app/lessons/pager/LessonTabs.tsx"]
missing = [f for f in sharers if "GoalCard" not in CODE.get(f, "")]
check(not missing,
      "the /sio page and the lesson's Goal tab render one shared GoalCard",
      f"{missing} no longer uses components/GoalCard. The two doors to a goal "
      "would then describe it separately, and drift.")
rolled = [f for f in sharers
          if "sio.canDo" in CODE.get(f, "") and "deckActivityTabs" in CODE.get(f, "")]
check(not rolled,
      "and neither hand-rolls the can-do plus its links alongside it",
      f"{rolled} builds its own can-do + link list next to the shared card.")
kn = CODE["src/components/KeyNav.tsx"]
check("`${HOME_HREF}?unit=${sio.unit}#${sio.id}`" in kn and "window.location.hash = sio.id" in kn,
      "KeyNav two-digit jump opens the outcome on The Map",
      "KeyNav does not deep-link the two-digit jump to the map. The address moved to\n"
      "       HOME_HREF on 12 Sep; the second half of this check is the in-place branch,\n"
      "       which only fires when the pathname test names the page the map is on.")

# ── 5 · DEPLOY.md ─────────────────────────────────────────────────────────
dep = read("docs/DEPLOY.md")
check("fluolingo-dot-com" in dep and not re.search(r"`fluoguo`(?!, which was the old project)", dep),
      "DEPLOY.md names the Pages project fluolingo-dot-com", "DEPLOY.md still says fluoguo")
check("Which `main`?" in dep and "git push live main" in dep, "DEPLOY.md keeps the which-main banner", "DEPLOY.md lost the which-main banner")

# ── 6 · meta description ──────────────────────────────────────────────────
lay = read("src/app/layout.tsx")
mdesc = re.search(r'description:\s*\n?\s*"([^"]+)"', lay)
desc = mdesc.group(1) if mdesc else ""
check("LAF1201" in desc, "meta description keeps LAF1201 (the course code people search)", "LAF1201 dropped from the description")
check(desc.startswith("French A1") and not re.search(r"\b(le|la|les|pratique|français)\b", desc, re.I),
      "meta description is English-first", f"meta description not English-first: {desc!r}")

# ── 7 · ONE weak ──────────────────────────────────────────────────────────
prog = CODE["src/lib/progress.ts"]
for sym in ("export const WEAK_BELOW = 50", "export const GOOD_FROM = 75", "export function tierFor(", "export function isWeakSrs("):
    check(sym in prog, f"progress.ts: {sym.replace('export ', '')}", f"progress.ts lacks {sym}")
check("s.intervalDays <= 1" in prog, "isWeakSrs = interval <= 1 day (missed, or repaired-but-fragile)", "isWeakSrs rule drifted")
TIER_LIT = re.compile(r"pct\s*<\s*(?:50|75)\b|intervalDays\s*(?:===\s*0|<=\s*1)\b|pct\s*>=\s*50\s*\?\s*\"text-rose")
strays = [f for f in SRC if f != "src/lib/progress.ts" and TIER_LIT.search(CODE[f])]
check(not strays, "no other file carries a private weak/tier rule", f"private weak rules in: {strays}")
for f, needle in (
    ("src/lib/outcomeRows.ts", "tierFor("),
    ("src/lib/activityLedger.ts", 'export { tierToken } from "@/lib/outcomeRows"'),
    ("src/app/teacher/ui.tsx", "tierFor(100 - pct)"),
    ("src/lib/reviser.ts", "isWeakSrs("),
    # Was src/app/moi/MoiContent.tsx, which read isWeakSrs for its signed-out
    # Fix rows. The 2026-08-22 merge replaced that page; the profile's re-drill
    # queue separates the two reasons an outcome is waiting — WEAK is accuracy
    # under the tier floor (tierFor), DUE is the SRS interval elapsed — so it
    # calls the accuracy half of the one definition here.
    ("src/lib/learnerModel.ts", "tierFor("),
    ("src/app/practice/grammarathon/finale/FinaleContent.tsx", "isWeakSrs("),
):
    check(needle in CODE[f], f"{os.path.basename(f)} calls the one definition", f"{f} does not call {needle}")

# ── 8 · ONE shuffle ───────────────────────────────────────────────────────
sh = CODE.get("src/lib/shuffle.ts", "")
check("export function shuffle<T>" in sh and "Math.floor(rand() * (i + 1))" in sh and "for (let i = out.length - 1; i > 0; i--)" in sh,
      "src/lib/shuffle.ts is Fisher–Yates with an injectable rand", "shuffle.ts missing or not Fisher–Yates")
biased = [f for f in SRC if re.search(r"Math\.random\(\)\s*-\s*0\.5", CODE[f])]
check(not biased, "no sort(() => Math.random() - 0.5) left in src", f"biased shuffles: {biased}")
FY = re.compile(r"for \(let i = \w+\.length - 1; i > 0; i--\) \{\s*const j = Math\.floor\(Math\.random\(\) \* \(i \+ 1\)\)")
copies = [f for f in SRC if f != "src/lib/shuffle.ts" and FY.search(CODE[f])]
check(not copies, "no private Fisher–Yates copy outside shuffle.ts", f"private copies: {copies}")
# Both spellings count. The alias is the normal one; a module that must run
# under `node --experimental-strip-types` (the lesson generators verify46
# executes) cannot use it, because @/ is a bundler feature — so those import
# the same file by relative path. The rule is "one shuffle", not "one spelling".
users = [f for f in SRC
         if 'from "@/lib/shuffle"' in CODE[f] or 'lib/shuffle.ts"' in CODE[f]]
# THE FLOOR MOVES WHEN A ROUTE RETIRES, and that is not the same as a shuffle
# going private again — which is what the two checks above actually hold. It was
# 20 until 2026-09-08, when `/pretests/picture/<deck>` became a forward and its
# 472-line runner (one of the importers) was deleted: 32 of its 50 pages had
# only ever rendered "No picture pretest available", and the question it ran is
# in `speculearnPool` now. Lower the floor when a caller legitimately goes; do
# not lower it to make a private copy fit.
check(len(users) >= 19, f"{len(users)} files import the one shuffle (>= 19)", f"only {len(users)} files import shuffle.ts")
check("stableShuffle" in CODE["src/app/decks/[id]/mcq/Content.tsx"] and "mulberry32" in CODE["src/app/practice/grammarathon/finale/FinaleContent.tsx"],
      "seeded shuffles (deck MCQ, Finale) kept their generators", "a seeded shuffle was lost")

# ── 9 · D6 / 10 · D7 ─────────────────────────────────────────────────────
sess = [f for f in SRC if re.search(r"\"sessions\"\)", CODE[f])]
check(not sess, "D6: no reader of users/{uid}/sessions", f"sessions readers: {sess}")
att = [f for f in SRC if re.search(r"\"attempts\"\)|getCountFromServer", CODE[f])]
check(not att, "D7: no reader of users/{uid}/attempts", f"attempts readers: {att}")
check("attemptsCount" not in CODE["src/app/teacher/data.ts"] and "sessions:" not in CODE["src/app/teacher/data.ts"],
      "StudentDetail dropped sessions + attemptsCount", "StudentDetail still carries sessions/attemptsCount")

# ── 11 · D9 / D10 ────────────────────────────────────────────────────────
resp = CODE["src/lib/firebase/responses.ts"]
check('status: correct ? "met" : "missed"' in resp, "the writer records met/missed only", "writer status set changed")
readers = [f for f in SRC if f != "src/lib/firebase/responses.ts" and re.search(r"\"(?:retried|mastered)\"", CODE[f]) and "economy" not in f]
check(not readers, "D9: no reader knows retried/mastered", f"unwritten statuses still read in: {readers}")
rows = CODE["src/lib/outcomeRows.ts"]
check('return status === "missed";' in rows, "isMiss = missed", "isMiss still accepts unwritten statuses")
check("export function outcomeOf(" in rows and "a.outcomeId" in rows and "outcomeForItem(a.item)" in rows,
      "D10: outcomeOf() prefers the stored outcomeId, joins as fallback", "outcomeOf missing")
td = CODE["src/app/teacher/data.ts"]
for fld in ("outcomeId", "evidenceType", "assistance", "independent"):
    check(td.count(f"{fld}:") >= 2, f"teacher data reads `{fld}` (type + parse)", f"teacher data does not read {fld}")
for fld in ("outcomeId", "evidenceType", "assistance", "assistCount", "independent"):
    check(f"body.{fld} =" in resp, f"writer stores `{fld}`", f"writer no longer stores {fld}")
check("outcomeOf(r)" in CODE["src/app/teacher/Students.tsx"] and "outcomeOf(" in CODE["src/app/teacher/ClassNow.tsx"],
      "teacher readers resolve outcomes through outcomeOf", "teacher readers bypass outcomeOf")
check('"Evidence"' in CODE["src/app/teacher/Students.tsx"], "teacher Recent answers has an Evidence column", "no Evidence column")
# D10's round-trip: the writer's stored outcomeId must survive the read, so the
# fold prefers it over the item→outcome join. The profile replaced MoiContent
# (2026-08-22) and carries it the same way.
check("outcomeId" in CODE["src/components/ProfileContent.tsx"],
      "the profile carries outcomeId through", "the profile drops outcomeId")

# ── 12 · D11 — executed ──────────────────────────────────────────────────
pm = CODE.get("src/lib/progressMerge.ts", "")
check(pm and "firebase" not in pm and "window" not in pm and 'import type { Progress }' in pm,
      "progressMerge.ts is pure (no firebase, no window)", "progressMerge.ts impure or missing")
check('export { mergeProgress }' in CODE["src/lib/firebase/progressSync.ts"] and 'from "@/lib/progressMerge"' in CODE["src/lib/firebase/progressSync.ts"],
      "progressSync re-exports the pure merge", "progressSync does not use progressMerge")
CASES = r"""
import { mergeProgress } from "./src/lib/progressMerge.ts";
const base = { doneSios: [], gems: 0, xp: 0, streak: 0, lastActiveDay: null, itemSrs: {}, badges: [], cosmetics: { owned: [], equipped: {} } };
const out = [];
const t = (name, got, want) => out.push([name, got, want, got === want]);
let m = mergeProgress({ ...base, lastActiveDay: "2026-08-10", timeZone: "Asia/Singapore" }, { lastActiveDay: "2026-08-16", timeZone: "Europe/Paris" });
t("remote later day wins", m.lastActiveDay, "2026-08-16");
t("…and brings ITS zone", m.timeZone, "Europe/Paris");
m = mergeProgress({ ...base, lastActiveDay: "2026-08-16", timeZone: "Asia/Singapore" }, { lastActiveDay: "2026-08-10", timeZone: "Europe/Paris" });
t("local later day wins", m.lastActiveDay, "2026-08-16");
t("…local zone kept", m.timeZone, "Asia/Singapore");
m = mergeProgress({ ...base, lastActiveDay: "2026-08-16", timeZone: "Asia/Singapore" }, { lastActiveDay: "2026-08-16", timeZone: "Europe/Paris" });
t("same day: the device you are on wins the zone", m.timeZone, "Asia/Singapore");
m = mergeProgress({ ...base }, { lastActiveDay: "2026-08-10", timeZone: "Europe/Paris", term: "T1" });
t("fresh device: remote day", m.lastActiveDay, "2026-08-10");
t("fresh device: remote zone (was stripped before)", m.timeZone, "Europe/Paris");
t("term survives", m.term, "T1");
m = mergeProgress({ ...base, lastActiveDay: "2026-08-10" }, { lastActiveDay: "2026-08-16" });
t("no zone anywhere → undefined, not a crash", m.timeZone, undefined);
m = mergeProgress({ ...base, itemSrs: { a: { due: 5, intervalDays: 1 } }, doneSios: ["SIO-001"], xp: 10, gems: 3 },
                  { itemSrs: { a: { due: 9, intervalDays: 3 } }, doneSios: ["SIO-002"], xp: 4, gems: 8 });
t("SRS keeps the further-out entry", m.itemSrs.a.intervalDays, 3);
t("done SIOs union", m.doneSios.length, 2);
t("xp max", m.xp, 10);
t("gems max", m.gems, 8);
t("no remote → local as is", mergeProgress({ ...base, timeZone: "Z" }, undefined).timeZone, "Z");
console.log(JSON.stringify(out));
"""
n = subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e", CASES], capture_output=True, text=True)
check(n.returncode == 0, "the merge table executed in node", f"node run failed: {n.stderr[-300:]}")
if n.returncode == 0:
    for name, got, want, ok in json.loads(n.stdout.strip().splitlines()[-1]):
        check(ok, f"merge: {name}", f"merge REGRESSED: {name} — got {got!r}, wanted {want!r}")

# ── 13 · leaderboard identity ────────────────────────────────────────────
al = CODE["src/lib/accountAliases.ts"]
check("export function boardName(" in al and '"Anonymous"' in al and "email" not in al.split("export function boardName(")[1].split("}")[0],
      "boardName() = alias → display name → Anonymous, no email", "boardName missing or falls back to email")
ps = CODE["src/lib/firebase/progressSync.ts"]
check("boardName(u.uid, u.displayName)" in ps and 'split("@")' not in ps, "the publisher uses boardName (no email local part)", "publisher still derives a name from the email")
lb = CODE["src/components/LeaderboardList.tsx"]
check("boardName(user.uid, user.displayName)" in lb and "rowName(r) === mine" in lb, "the board marks (you) through boardName, alias-aware", "board's (you) is uid-only")
check("email" not in lb, "LeaderboardList never touches an email", "LeaderboardList references email")

# ── 14 · D4 diagnostic ───────────────────────────────────────────────────
check("lastSyncedAt: now" in ps and "syncErrorCount" in ps and 'noteSyncError("push", e)' in ps and 'noteSyncError("pull", e)' in ps,
      "push stamps lastSyncedAt (+ last error, count); pull/push failures are noted", "sync diagnostic incomplete in progressSync")
check('"sync.error"' in CODE["src/lib/firebase/usage.ts"] and 'logEvent("sync.error"' in ps, "failures are reported as sync.error events", "no sync.error event")
st = CODE["src/app/teacher/Students.tsx"]
check("SYNC_STALE_MS" in st and "trail.lastEventAt - synced > SYNC_STALE_MS" in st and "STALE" in st and "lastSyncError" in st,
      "teacher Last sync reads STALE against the newest event and shows the last error", "teacher panel lacks the staleness read")
check("lastSyncedAt?: number" in td and "syncErrorCount?: number" in td, "StudentDetail types the sync fields", "StudentDetail lacks sync fields")

# ── 14b · #13: a picked answer is not a button ───────────────────────────
# Dan, 2026-08-27: "A selected answer looks identical to the button you press
# next — same dark brown, so it reads as unpressed." Measured and true: a
# picked option was a solid dark fill with white text, beside a Check button
# that is a solid dark fill with white text. The three answer-selection sites
# must all route through .answer-picked, and that class must NOT re-create the
# CTA's costume: no dark fill, no white text, and it must carry a non-colour
# cue (the inset sink) so the state survives a greyscale/CVD reading.
_pick_sites = [
    "src/app/practice/dice/[collectionId]/PracticeContent.tsx",
    "src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx",
    "src/app/lessons/pager/LessonPager.tsx",
]
for _f in _pick_sites:
    _src = CODE.get(_f, "")
    check("answer-picked" in _src, f"{_f.split('/')[-1]}: the picked answer uses .answer-picked", f"{_f} does not use .answer-picked")
    check("bg-slate-900 text-white" not in _src and "bg-[color:var(--cahier-ink)] text-white" not in _src,
          f"{_f.split('/')[-1]}: no picked-answer state wearing the CTA's dark fill + white text",
          f"{_f} still gives a picked answer the CTA costume")
_css = read("src/app/globals.css")
_m = re.search(r"\.answer-picked\s*\{(.*?)\}", _css, re.S)
_rule = _m.group(1) if _m else ""
check(bool(_m), ".answer-picked is defined once, in the sheet", ".answer-picked is not defined")
check("var(--cahier-hl)" in _rule and "#fff" not in _rule and "color: white" not in _rule,
      ".answer-picked is the marker, not a second dark button", f".answer-picked looks like a CTA: {_rule.strip()[:80]!r}")
check("inset" in _rule, ".answer-picked carries a non-colour cue (the inset sink), so the state is not hue-only",
      ".answer-picked has no inset cue — picked-vs-unpicked would rest on hue alone")

# ── 14c · bite-sized objectives: Lesson 1 teaches ONE thing ───────────────
# Dan, 2026-08-27: "the original intention (and is still the current
# intention) is to have the objectives broken down into bitesized objectives.
# so having four things at one go is not cool." se-presenter had four — name,
# age, nationality, family — picked at random per card, so ~3 cards in 4 asked
# about something SIO-001 never promises. Age and nationality own stops of
# their own (SIO-019, SIO-016), so the cut sends them home rather than
# deleting them. Assert the MEANING both ways: the intruders cannot be
# generated, and the two things SIO-001 does promise are present.
_sp = CODE["src/content/lessons/native/se-presenter.tsx"]
for _pool, _who in [("AGES", "age → SIO-019"), ("NATS", "nationality → SIO-016"), ("FAMILY", "family")]:
    check(_pool not in _sp, f"Lesson 1 cannot generate {_who}", f"se-presenter still carries the {_pool} pool — Lesson 1 is teaching {_who} again")
check("Comment tu t'appelles" in _sp and "Comment vous vous appelez" in _sp,
      "Lesson 1 teaches ASKING a name (SIO-001's can-do)", "se-presenter does not teach asking a name")
check("Monsieur" in _sp and "Madame" in _sp,
      "Lesson 1 teaches M./Mme as forms of address (SIO-001)", "se-presenter does not teach M./Mme")

# A cloze must never ask for a word already standing in its own frame
# (Dan: "why do we need two blanks to fill in the same blank"). The reflexive
# vous/nous items blanked "vous appelez" out of "Comment vous vous appelez ?",
# stranding a lone vous in the frame that the learner then had to retype.
_deck = json.loads(read("src/content/collections/sappeler.json"))
_items = _deck["items"] if isinstance(_deck, dict) else _deck
_dupes = []
for _it in _items:
    _g = _it.get("gap")
    if not _g or _g not in _it["fr"]:
        continue
    _i = _it["fr"].index(_g)
    _frame = (_it["fr"][:_i] + " ____ " + _it["fr"][_i + len(_g):]).split()
    if any(_w in _frame for _w in _g.split()):
        _dupes.append(_it["id"])
check(not _dupes, "no cloze asks for a word already printed in its frame", f"these frames repeat their own answer: {_dupes}")

# ── 14d · one goal, one lesson ───────────────────────────────────────────
# The audit of all fifty stops (2026-08-27) found the mirror of Lesson 1's
# fault: `modaux` — a vouloir/pouvoir/devoir paradigm table — was the ONLY
# lesson behind SIO-037 ("say what is possible, ask permission") and SIO-048
# ("give simple advice"), so two different goals opened the same screen and
# neither opened its own. Each now leads with a lesson written for it.
_les = read("src/content/lessons.ts")
_by_sio = dict(re.findall(r'"(SIO-\d+)":\s*\[([^\]]*)\]', _les[_les.index("LESSONS_BY_SIO"):]))
def _first(sio):
    got = re.findall(r'"([a-z0-9\-]+)"', _by_sio.get(sio, ""))
    return got[0] if got else None
for _sio, _want in [("SIO-037", "pouvoir"), ("SIO-048", "conseils")]:
    check(_first(_sio) == _want, f"{_sio} leads with its own lesson ({_want})",
          f"{_sio} leads with {_first(_sio)!r}, not its own lesson — the learner gets someone else's screen")
# and no two stops may LEAD with the same lesson: that is the fault itself
_leads = {}
_clash = []
for _sio in _by_sio:
    _f = _first(_sio)
    if _f and _f in _leads: _clash.append((_leads[_f], _sio, _f))
    elif _f: _leads[_f] = _sio
check(not _clash, "no two stops open the same lesson first",
      f"stops sharing a primary lesson: {_clash}")
for _slug in ("pouvoir", "conseils"):
    check(os.path.exists(f"src/content/lessons/native/{_slug}.tsx"), f"{_slug}.tsx exists", f"{_slug}.tsx is missing")

# ── 14e · the production stops open on a model, not a test ───────────────
# The six ateliers (SIO-010, 020, 030, 040, 049, 050) had no Mémo at all: a
# learner opened "Première rencontre" and landed straight on CHOOSE THE
# FRENCH. Every other stop opens on something to read; these opened on a test.
# Their Mémo is the model dialogue that has been in ateliers.ts all along —
# DERIVED from it, never transcribed, so an edited line cannot drift out of
# the Mémo that teaches it.
_memos = CODE["src/content/memos.tsx"]
_at = read("src/content/ateliers.ts")
_sios_with_dialogue = re.findall(r'"(SIO-\d+)":\s*\[', _at)
check(len(_sios_with_dialogue) >= 6, "ateliers.ts still carries the model dialogues",
      f"only {len(_sios_with_dialogue)} atelier dialogues found")
check("ATELIER_DIALOGUES" in _memos and "DECK_MEMOS[`atelier-" in _memos,
      "every atelier's Mémo is derived from ATELIER_DIALOGUES",
      "memos.tsx no longer builds the atelier Mémos from the dialogues")
_hand = re.findall(r'^\s{2}"?(atelier-sio-\d+)"?:\s', _memos, re.M)
check(not _hand, "no atelier Mémo is transcribed by hand (it would drift from the model)",
      f"hand-written atelier memos found: {_hand}")
check("speak(" in _memos and "Tout écouter" in _memos,
      "the model can be heard — line by line and whole",
      "the atelier Mémo lost its audio")
# "Tout écouter" must use speakSequence, not a loop over speak().
#
# It shipped as `for (const l of lines) speak(...)`, and only the LAST line was
# ever heard: speak() defaults to interrupt:true, whose first act is
# synth.cancel(), so each line cancelled the one before it. Measured in a
# browser with the speech API instrumented — ten speaks, ten cancels.
#
# The button existed, the lines were right, and the check above was green
# throughout, because "can it speak" and "does it play all of it" are different
# questions. This asks the second one. speakSequence is not interchangeable
# here: it holds a reference to every utterance (Chrome garbage-collects them
# mid-queue and the chain dies) and nudges resume() on a timer (Chrome pauses
# long runs) — the two fixes behind Dan's 2026-07-07 "play all is not playing
# all". A hand-rolled queue throws both away.
_play = _memos[_memos.find("const playAll"):]
_play = _play[: _play.find("\n  };")] if "\n  };" in _play else _play[:900]
check("speakSequence" in _play,
      "Tout écouter plays the whole model through speakSequence",
      "playAll no longer uses speakSequence")
check(not re.search(r"for\s*\(.*\)\s*speak\(", _play),
      "Tout écouter does not loop bare speak() (each call cancels the last)",
      "playAll loops speak() again — interrupt:true means only the LAST line is "
      "heard; this is Dan's 'play all is not playing all' back")

# ── 14f · 4Mémoire keeps its three views ─────────────────────────────────
# Dan, 2026-08-28: "The original 4Mémoire consists of 3 views: cards one by
# one, cards all at once, and cards in a list. ALL OF THAT HAS BEEN LOST!"
# True: patch 20-21 (b83d1ec, 10 Aug) rewrote the three-view page into a
# one-card drill, MOVED the table to /decks/:id, and dropped the grid without
# saying so — while leaving the file header still naming all three views,
# which is how it went unnoticed for eighteen days. A header is not a check.
_flip = CODE["src/app/practice/flip-it/[collectionId]/FlipItContent.tsx"]
check('"one" | "all" | "list"' in _flip, "4Mémoire still has all three views",
      "4Mémoire no longer offers one/all/list — a view has been dropped again")
check("function AllCards({" in _flip, "the all-at-once grid exists",
      "the AllCards grid is gone again (deleted 10 Aug, restored 28 Aug)")
check("CuratedDeckTable" in _flip, "the list view renders the SAME table /decks/:id uses",
      "4Mémoire no longer renders the list; it must not fork its own copy")
# The list must be reachable while practising, not only from the end-of-run
# recap — that was the old door, and it required finishing every card first.
_recap_only = _flip.count("CuratedDeckTable") == 0
check(not _recap_only, "the list is reachable during the run", "the list is only reachable from the recap")

# ── 14g · the card IS the button ─────────────────────────────────────────
# Dan, 2026-09-02: *"there is a redundant button called FLIP which is not
# working and which we don't even need."* The footer CTA said « Flip » and did
# the same thing as tapping the card, on the one activity named for that
# gesture. It went; what it was covering for did not: the card was a
# `<div role="button">` with an onClick, NO tabIndex and NO key handler —
# which is not a button. A keyboard could neither reach it nor fire it, and
# nobody noticed because the shell binds Enter to the CTA that was hiding the
# fault. With the CTA gone the card is the only way to turn a card over, so it
# has to be a real one.
check(re.search(r'\{ label: "Flip"', _flip) is None,
      "no « Flip » CTA — the card is the button, and one control does one job",
      "the « Flip » CTA is back; it duplicates tapping the card, on the activity named for tapping the card")
check(re.search(r'role="button"', _flip) is None,
      "4Mémoire hand-rolls no role=button",
      "a div is pretending to be a button again — role=button without tabIndex and a key handler "
      "is unreachable by keyboard, which is exactly how the old card shipped")
check(re.search(r"<button type=\"button\"[^>]*onClick=\{onFlip\}", _flip) is not None,
      "the card is a real <button>, so Enter, Space, focus and the role come free",
      "the card is not a <button> — with no Flip CTA left, a keyboard cannot turn a card over at all")

# ── 14h · Variant B flip cue, front only ─────────────────────────────────
# The card carries a quiet ↻ chip so a learner who has never flipped a card
# can see that it turns. The chip is furniture, not a second control: it
# sits on the front Face, is pointer-events-none, and is aria-hidden — the
# button's English label says which way it will go. No Flip / Retourner
# chrome. Reduced motion sees the same static mark (no bounce loop).
_study = _flip[_flip.find("function StudyCard("):_flip.find("function Face(")]
check("↻" in _study, "StudyCard's front face carries the ↻ cue",
      "StudyCard has no ↻ cue — the card is tappable and looks inert")
check("pointer-events-none" in _study, "the ↻ chip is not a second control",
      "the ↻ chip can capture clicks — the card is the button")
check('aria-hidden' in _study and "Turn the card over" in _study and "Turn the card back" in _study,
      "the button names the direction; the chip is aria-hidden",
      "the flip cue is missing an English button label or is speaking for itself")
check("Retourner" not in _study and re.search(r'["\']Flip["\']', _study) is None,
      "no Flip / Retourner chrome on the card",
      "Flip or Retourner chrome is back on the study card")
check(_study.count("↻") == 1 and _study.find("↻") < _study.find("<Face back>"),
      "the ↻ cue is front-only — it is painted before Face back, once",
      "the ↻ cue is missing, duplicated, or printed on the back Face")
check("--cahier-paper-raised" in _study and "--cahier-ink" in _study,
      "the chip sits on paper-raised with an ink hairline",
      "the ↻ chip no longer uses the paper-raised / ink tokens")

# ── 15 · CI ──────────────────────────────────────────────────────────────
wf = read(".github/workflows/verify.yml")
check("verify/verify27-bugs.py" in wf and wf.find("verify27-bugs") > wf.find("verify26"), "CI runs verify27-bugs after verify26", "verify27-bugs not wired after verify26")

print("\nverify27 — loose bugs + data-truth backlog\n" + "-" * 66)
for m_ in OK:
    print("  ok    " + m_)
for m_ in FAIL:
    print("  FAIL  " + m_)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
