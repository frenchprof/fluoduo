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
check('href="/activities"' in nodeck and "CahierShell" in nodeck, "NoDeck links to the Index inside the shell", "NoDeck lacks an Index link / shell")
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

# ── 4 · /sio/[id] is a redirect ───────────────────────────────────────────
sio = CODE["src/app/sio/[id]/page.tsx"]
check("SioRedirect" in sio and "`/?unit=${sio.unit}#${sio.id}`" in sio and "SioDetail" not in sio,
      "/sio/[id] is one redirect to Home's popup (/?unit=N#SIO)", "/sio/[id] still renders its own page")
check("generateStaticParams" in sio, "the fifty static /sio pages still build (old links, QR)", "generateStaticParams gone from /sio/[id]")
check("window.location.replace(href)" in CODE.get("src/app/sio/[id]/SioRedirect.tsx", ""), "SioRedirect uses replace (no Back bounce)", "SioRedirect missing/does not replace")
linkers = [f for f in SRC if not f.startswith("src/app/sio/") and re.search(r"[\"'`]/sio/", CODE[f])]
check(not linkers, "nothing outside src/app/sio links to /sio/…", f"still linking to /sio/: {linkers}")
kn = CODE["src/components/KeyNav.tsx"]
check("`/map?unit=${sio.unit}#${sio.id}`" in kn and "window.location.hash = sio.id" in kn,
      "KeyNav two-digit jump opens the outcome on The Map", "KeyNav does not deep-link into /map")

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
users = [f for f in SRC if 'from "@/lib/shuffle"' in CODE[f]]
check(len(users) >= 20, f"{len(users)} files import the one shuffle (>= 20)", f"only {len(users)} files import shuffle.ts")
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
