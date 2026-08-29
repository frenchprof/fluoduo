#!/usr/bin/env python3
"""
Track D — the help ladder inside DrillShell (2026-08-17).

The rows (UI_WORK_PLAN_1.md → Track D; STATUS.md row 7; the spec is
docs/TRACK_D_HELP_LADDER.md). What this asserts — static over source, plus
TWO executed tables in node (--experimental-strip-types, with a tiny
resolver so `@/` and extensionless relative imports load from src/):

  1  The state machine (src/lib/help/ladder.ts) is pure (no React, no
     firebase, no window, no clock) and EXECUTES: first-try correct is
     independent; a wrong try climbs; idle climbs hints only and NEVER
     reveals; `?` cannot reveal before an attempt (flashcard test may);
     the evidence names the highest rung shown; hinted/revealed → queue;
     MCQ has no cold hint; DONE is terminal. 66 rows.
  2  The rule-based generators (hints.ts) execute in the same table:
     gender nudge, first letter + count, skeleton + blanked model sentence,
     MCQ rungs by option count, alternates on the reveal.
  3  The eval cases (src/lib/help/evalCases.json) EXECUTE against the
     rule-based grader (feedback.ts ruleFeedback): every case's `rules`
     expectation holds (injection/profanity → off_task, English → wrong +
     vocabulary, accent-only → partial/accent, …). ≥ 20 cases, both
     categories present, every case has an LLM `expect` too.
  4  DrillShell has the ? control (rung dots), the hint chips and the WHY
     toggle; the tray still overlays.
  5  Every DrillShell drill wires the ladder: iComplete, GramMarathon,
     EtuDice, SpecuLearn, 4Mémoire, WorDrill, the lesson pager use
     useHelpLadder and pass `help=` to the shell; ÉcouTexte records a
     post-reveal check as revealed + queues it. Pretests do NOT.
  6  Evidence is written: useHelpLadder calls recordItemResult with
     assistance/hintsTaken/revealed; progress.ts threads `assistance`
     through to buildEvidence; queueForReview is called on close.
  7  The research log: "help.rung" and "feedback.request" are EventTypes;
     the hook logs help.rung on every transition.
  8  Row 7: functions/api/feedback.js exists, reads the ChaTutor key
     (ANTHROPIC_API_KEY), fences the answer, shapes the reply;
     requestFeedback has a timeout and falls back to ruleFeedback;
     OpenFeedback has both modes and is mounted at the lesson end;
     no API key / bearer string in src/.
  9  CI runs this file after verify27-bugs.

Run from the repo root:  python3 verify/verify28-trackd.py
"""
import glob, json, os, re, subprocess, sys, tempfile

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

SRC = glob.glob("src/**/*.ts", recursive=True) + glob.glob("src/**/*.tsx", recursive=True)
CODE = {f: strip_comments(read(f)) for f in SRC}
ROOT = os.path.abspath(".")

# ── node harness: strip-types + a resolver for @/ and extensionless imports ─
LOADER = r"""
import { existsSync, statSync } from "node:fs";
import { pathToFileURL, fileURLToPath } from "node:url";
import path from "node:path";
const ROOT = process.env.TD_ROOT;
export async function resolve(spec, ctx, next) {
  let p = null;
  if (spec.startsWith("@/")) p = path.join(ROOT, "src", spec.slice(2));
  else if ((spec.startsWith("./") || spec.startsWith("../")) && ctx.parentURL && ctx.parentURL.startsWith("file:"))
    p = path.resolve(path.dirname(fileURLToPath(ctx.parentURL)), spec);
  if (p) for (const c of [p, p + ".ts", p + ".tsx", path.join(p, "index.ts")])
    if (existsSync(c) && statSync(c).isFile()) return { url: pathToFileURL(c).href, shortCircuit: true };
  return next(spec, ctx);
}
"""
REG = 'import { register } from "node:module"; register("./loader.mjs", import.meta.url);\n'


def run_node(script):
    with tempfile.TemporaryDirectory() as d:
        open(os.path.join(d, "loader.mjs"), "w").write(LOADER)
        open(os.path.join(d, "reg.mjs"), "w").write(REG)
        open(os.path.join(d, "t.mjs"), "w").write(script)
        env = dict(os.environ, TD_ROOT=ROOT, NODE_NO_WARNINGS="1")
        return subprocess.run(["node", "--experimental-strip-types", "--import", os.path.join(d, "reg.mjs"), os.path.join(d, "t.mjs")],
                              capture_output=True, text=True, env=env, cwd=ROOT)


# ── 1 + 2 · the machine + the generators, executed ────────────────────────
ladder = CODE.get("src/lib/help/ladder.ts", "")
check(ladder and "firebase" not in ladder and "window" not in ladder and "Date.now" not in ladder and 'from "react"' not in ladder,
      "ladder.ts is pure (no React, no firebase, no window, no clock)", "ladder.ts is not pure")
for st in ("FRESH", "TRY", "HINT_1", "HINT_2", "REVEAL", "RETRY_AFTER_REVEAL", "DONE"):
    check(f'"{st}"' in ladder, f"ladder state {st}", f"ladder lacks state {st}")
check("export const LADDER_CONFIG" in ladder and "stuckWrong" in ladder and "stuckIdleMs" in ladder,
      "stuck thresholds are one table (LADDER_CONFIG)", "LADDER_CONFIG missing")

TABLE = r"""
import { createLadder, step, evidenceOf, shouldQueueForReview, canHelp, helpLabel, isStuck } from "@/lib/help/ladder";
import { hintsFor, skeleton, revealText, blankOut } from "@/lib/help/hints";
const out = []; const t = (n, got, want) => out.push([n, got, want, got === want]);
let l = createLadder("typed", ["scaffold", "partial"], 0);
t("fresh", l.state, "FRESH");
t("fresh: independent", evidenceOf(l).independent, true);
t("fresh: help allowed (typed)", canHelp(l), true);
t("fresh: reveal not reachable cold", (() => { let x = step(l, {type:"help",at:1}).ladder; x = step(x, {type:"help",at:2}).ladder; return canHelp(x); })(), false);
let r = step(l, { type: "attempt", correct: true, at: 5 });
t("first-try correct → DONE", r.ladder.state, "DONE"); t("…effect done", r.effect, "done");
t("…independent", evidenceOf(r.ladder).independent, true); t("…no queue", shouldQueueForReview(r.ladder), false);
r = step(l, { type: "attempt", correct: false, at: 5 });
t("wrong → HINT_1 (stuckWrong 1)", r.ladder.state, "HINT_1"); t("…auto", r.auto, true); t("…effect hint", r.effect, "hint");
t("…evidence scaffold", evidenceOf(r.ladder).assistance, "scaffold"); t("…not independent", evidenceOf(r.ladder).independent, false);
let r2 = step(r.ladder, { type: "attempt", correct: false, at: 6 });
t("wrong again → HINT_2", r2.ladder.state, "HINT_2"); t("…partial", evidenceOf(r2.ladder).assistance, "partial");
let r3 = step(r2.ladder, { type: "attempt", correct: false, at: 7 });
t("third wrong → RETRY_AFTER_REVEAL (typed)", r3.ladder.state, "RETRY_AFTER_REVEAL"); t("…effect reveal", r3.effect, "reveal");
t("…assistance answer", evidenceOf(r3.ladder).assistance, "answer"); t("…queue", shouldQueueForReview(r3.ladder), true);
let r4 = step(r3.ladder, { type: "attempt", correct: true, at: 8 });
t("retype correct → DONE", r4.ladder.state, "DONE"); t("…still answer", evidenceOf(r4.ladder).assistance, "answer");
t("post-reveal wrong → DONE", step(r3.ladder, { type: "attempt", correct: false, at: 8 }).ladder.state, "DONE");
let idle = step(l, { type: "tick", at: 19_999 }); t("idle < 20s: nothing", idle.effect, "none");
idle = step(l, { type: "tick", at: 20_000 }); t("idle 20s → HINT_1", idle.ladder.state, "HINT_1"); t("…auto", idle.auto, true);
let idle2 = step(idle.ladder, { type: "tick", at: 40_000 }); t("idle again → HINT_2", idle2.ladder.state, "HINT_2");
let idle3 = step(idle2.ladder, { type: "tick", at: 90_000 }); t("idle NEVER reveals", idle3.ladder.state, "HINT_2"); t("…effect none", idle3.effect, "none");
t("hinted correct → queue", shouldQueueForReview(step(idle.ladder, {type:"attempt",correct:true,at:1}).ladder), true);
t("hinted correct evidence = scaffold", evidenceOf(idle.ladder).assistance, "scaffold");
let h = step(l, { type: "help", at: 1 }); t("? → HINT_1", h.ladder.state, "HINT_1"); t("…not auto", h.auto, false);
t("label after 1", helpLabel(h.ladder), "Another hint");
h = step(h.ladder, { type: "help", at: 2 }); t("label at top", helpLabel(h.ladder), "Show answer");
t("reveal refused before an attempt", step(h.ladder, { type: "help", at: 3 }).effect, "none");
let hw = step(h.ladder, { type: "attempt", correct: false, at: 3 }); t("wrong at HINT_2 → reveal", hw.effect, "reveal");
let ntry = createLadder("say", [], 0); let w1 = step(ntry, {type:"attempt",correct:false,at:1});
t("say: 1 wrong stays TRY (stuckWrong 2)", w1.ladder.state, "TRY"); t("…evidence nudge", evidenceOf(w1.ladder).assistance, "nudge");
t("say: 2 wrong, no hints → reveal", step(w1.ladder, {type:"attempt",correct:false,at:2}).effect, "reveal");
let m = createLadder("mcq", [], 0); t("mcq 2 options: no cold help", canHelp(m), false);
t("mcq 2 options wrong → REVEAL (no retry)", step(m, {type:"attempt",correct:false,at:1}).ladder.state, "REVEAL");
let m3 = createLadder("mcq", ["scaffold"], 0); let mw = step(m3, {type:"attempt",correct:false,at:1});
t("mcq 3 options wrong → HINT_1 (pick again)", mw.ladder.state, "HINT_1");
t("mcq idle never climbs", step(m3, {type:"tick",at:999999}).effect, "none");
t("mcq second wrong → REVEAL", step(mw.ladder, {type:"attempt",correct:false,at:2}).ladder.state, "REVEAL");
t("skip closes", step(mw.ladder, {type:"skip",at:3}).ladder.state, "DONE");
let f = createLadder("flashcard", ["scaffold","partial"], 0); f = step(f,{type:"help",at:1}).ladder; f = step(f,{type:"help",at:2}).ladder;
t("flashcard: reveal cold allowed", canHelp(f), true); t("flashcard reveal → REVEAL (no retype)", step(f,{type:"help",at:3}).ladder.state, "REVEAL");
t("DONE is terminal", step(step(l,{type:"attempt",correct:true,at:1}).ladder, {type:"help",at:9}).effect, "none");
t("isStuck after wrong at rung", isStuck(w1.ladder, 2), false); t("isStuck idle typed", isStuck(l, 20_000), true);
const hs = hintsFor("typed", { answer: "la pomme", article: "la", example: "Je mange la pomme." });
t("typed rung1 = gender nudge", hs[0].text.includes("feminine"), true); t("…level nudge", hs[0].level, "nudge");
t("typed rung2 skeleton (first letter only)", hs[1].text.includes("l _  _ _ _ _ _"), true);
t("…level partial", hs[1].level, "partial"); t("…model sentence blanked", hs[1].text.includes("Je mange ____."), true);
t("no article → first letter", hintsFor("typed", { answer: "lundi" })[0].text.includes("« L »"), true);
t("first letter rung counts letters", hintsFor("typed", { answer: "lundi" })[0].text.includes("5 letters"), true);
t("skeleton keeps apostrophe", skeleton("l'eau"), "l ' _ _ _");
t("mcq 2 options: no rungs", hintsFor("mcq", { answer: "le", options: ["le", "la"] }).length, 0);
t("mcq 3 options: one rung", hintsFor("mcq", { answer: "le", options: ["le", "la", "les"] }).length, 1);
const m4 = hintsFor("mcq", { answer: "le", options: ["la", "le", "les", "l'"] });
t("mcq 4 options: two rungs", m4.length, 2); t("…eliminates 2", (m4[1].eliminate ?? []).length, 2); t("…never the answer", (m4[1].eliminate ?? []).includes("le"), false);
t("say rung1 scaffold", hintsFor("say", { answer: "bonjour" })[0].level, "scaffold");
t("reveal lists alternates", revealText({ answer: "le sport", alternates: ["les sports"] }), "le sport  (also: les sports)");
t("blankOut word-boundary", blankOut("Je mange des pommes de terre.", "de"), "Je mange des pommes ____ terre.");
console.log(JSON.stringify(out));
"""
n = run_node(TABLE)
check(n.returncode == 0, "the ladder + hints table executed in node", f"node run failed: {n.stderr[-400:]}")
if n.returncode == 0:
    rows = json.loads(n.stdout.strip().splitlines()[-1])
    check(len(rows) >= 60, f"{len(rows)} ladder rows", "ladder table too short")
    for name, got, want, ok in rows:
        check(ok, f"ladder: {name}", f"ladder REGRESSED: {name} — got {got!r}, wanted {want!r}")

# ── 3 · eval cases, executed against the rules ────────────────────────────
cases = json.load(open("src/lib/help/evalCases.json", encoding="utf-8"))["cases"] if os.path.isfile("src/lib/help/evalCases.json") else []
check(len(cases) >= 20, f"{len(cases)} eval cases", "fewer than 20 eval cases")
check({c.get("category") for c in cases} >= {"adversarial", "pedagogical"}, "both categories present", "a category is missing")
check(all("expect" in c and "rules" in c and "request" in c for c in cases), "every case has request/expect/rules", "a case lacks request/expect/rules")
check(any("gnore" in c["request"]["answer"] for c in cases), "a prompt-injection case exists", "no prompt-injection case")
EVAL = r"""
import { ruleFeedback, isFeedback } from "@/lib/help/feedback";
import cases from "@/lib/help/evalCases.json" with { type: "json" };
const out = [];
for (const c of cases.cases) {
  const o = ruleFeedback(c.request); const r = c.rules; const probs = [];
  if (!isFeedback(o)) probs.push("not schema");
  if (r.verdict && o.verdict !== r.verdict) probs.push(`verdict ${o.verdict} != ${r.verdict}`);
  if (r.verdictIn && !r.verdictIn.includes(o.verdict)) probs.push(`verdict ${o.verdict} not in ${r.verdictIn}`);
  if (r.noErrors && o.errors.length) probs.push(`errors ${o.errors.map(e=>e.kind)}`);
  for (const k of r.kinds ?? []) if (!o.errors.some(e => e.kind === k)) probs.push(`missing kind ${k}: ${o.errors.map(e=>e.kind)}`);
  for (const e of o.errors) if (e.kind !== "missing" && !c.request.answer.toLowerCase().includes(e.span.toLowerCase())) probs.push(`span not in answer: ${e.span}`);
  out.push([c.id, probs.join("; "), "", probs.length === 0]);
}
console.log(JSON.stringify(out));
"""
n = run_node(EVAL)
check(n.returncode == 0, "the eval cases executed against ruleFeedback", f"node run failed: {n.stderr[-400:]}")
if n.returncode == 0:
    for name, got, _w, ok in json.loads(n.stdout.strip().splitlines()[-1]):
        check(ok, f"rules: {name}", f"rules FAILED: {name} — {got}")

# ── 4 · the shell ─────────────────────────────────────────────────────────
shell = CODE["src/components/DrillShell.tsx"]
check("help?: DrillHelp | null" in shell and "drill-help" in shell and "help.onClimb" in shell, "DrillShell has the ? control", "DrillShell lacks the help control")
check("help.hintsAvail + 1" in shell and "help.revealed" in shell, "rung dots (hints + the answer)", "no rung dots")
check("drill-hints" in shell and "help.shown.map" in shell, "hint chips render from help.shown", "no hint chips")
# Dan #7 (2026-08-27): advice must not outlive the moment it can be acted on.
# Guarding on kind alone was half a fix — a REVEALED card's verdict.kind is
# "wrong", so "Not that one — pick again" survived under a card whose options
# are disabled. Both terminal states must gate the chips, so assert the
# MEANING (a reveal hides them) and not one spelling of the condition.
_chip_guard = re.search(r"\{help && help\.shown\.length > 0 &&([^(]*)\(", shell)
_g = _chip_guard.group(1) if _chip_guard else ""
check(bool(_chip_guard) and "!help.revealed" in _g, "hint chips are hidden on a REVEALED card (#7 reveal path)", f"the chip guard does not exclude a revealed card: {_g.strip()!r}")
check(bool(_chip_guard) and 'feedback?.kind !== "correct"' in _g, "hint chips are hidden on a CORRECT verdict (#7 correction path)", f"the chip guard does not exclude a correct verdict: {_g.strip()!r}")
check("why?: ReactNode" in shell and "WHY" in shell and "drill-why" in shell and "aria-expanded" in shell, "the WHY toggle on the tray", "no WHY toggle")
check("absolute inset-x-0 bottom-0" in shell, "the tray still overlays", "the tray no longer overlays")

# ── 5 · every drill wires it ──────────────────────────────────────────────
DRILLS = {
    "iComplete": "src/app/practice/complete-it/[collectionId]/CompleteItContent.tsx",
    "GramMarathon": "src/app/practice/grammarathon/[collectionId]/GramMarathonContent.tsx",
    "EtuDice": "src/app/practice/dice/[collectionId]/PracticeContent.tsx",
    "SpecuLearn": "src/app/practice/speculearn/[collectionId]/SpecuLearnContent.tsx",
    "4Mémoire": "src/app/practice/flip-it/[collectionId]/FlipItContent.tsx",
    "WorDrill": "src/app/practice/say-it/[collectionId]/SayItContent.tsx",
    "lesson pager": "src/app/lessons/pager/LessonPager.tsx",
}
for name, p in DRILLS.items():
    src = CODE.get(p, "")
    check("useHelpLadder(" in src and "hintsFor(" in src, f"{name} builds its ladder from the item", f"{name} ({p}) does not use useHelpLadder/hintsFor")
    check(re.search(r"help=\{", src) is not None, f"{name} hands help= to the shell", f"{name} does not pass help= to DrillShell")
    check(".attempt(" in src, f"{name} grades through ladder.attempt", f"{name} does not call ladder.attempt")
    check(".skip()" in src or "retryAfterReveal" in src or name in ("iComplete", "GramMarathon"),
          f"{name} closes the item (skip) or retypes after reveal", f"{name} never closes the ladder")
eco = CODE["src/app/practice/ecoutexte/EcouTexte.tsx"]
check("wasRevealed ? { revealed: true }" in eco and "queueForReview(queued)" in eco, "ÉcouTexte: a check after reveal is assisted + queued", "ÉcouTexte does not tag/queue post-reveal checks")
for p in glob.glob("src/app/pretests/**/*.tsx", recursive=True):
    check("useHelpLadder" not in CODE.get(p, ""), f"pretest {os.path.basename(p)} stays off the ladder", f"{p} uses the ladder — pretests are cold diagnostics")
# The Finale keeps its five-rung ladder from hints.ts
check('from "@/lib/help/hints"' in CODE["src/app/practice/grammarathon/finale/FinaleContent.tsx"], "Finale reads its ladder from hints.ts", "Finale lost buildLadder")

# ── 6 · evidence + queue ──────────────────────────────────────────────────
hook = CODE["src/lib/help/useHelpLadder.ts"]
check("recordItemResult(itemId, correct, rec.given, rec.activity, {" in hook and "assistance: ev.assistance" in hook and "revealed: ev.revealed" in hook and "hintsTaken: ev.hintsTaken" in hook,
      "the hook records every attempt with the ladder's evidence", "useHelpLadder does not record assistance/hintsTaken/revealed")
check("shouldQueueForReview(r.ladder)) queueForReview([itemId])" in hook, "hinted/revealed items are queued for ReVue on close", "no queueForReview on close")
prog = CODE["src/lib/progress.ts"]
check("assistance?: AssistanceLevel" in prog and "assistance: ev?.assistance" in prog, "recordItemResult threads assistance to buildEvidence", "progress.ts drops assistance")
ev = CODE["src/lib/evidence.ts"]
check("opts.assistance ?? assistanceFromHints" in ev, "buildEvidence prefers the ladder's rung over the count guess", "buildEvidence ignores the explicit assistance")
check('if (assistance === "none" && l.wrongTries > 0) assistance = "nudge"' in ladder, "a repaired answer (wrong then right, no hint) is nudge, not independent", "repaired answers read independent")

# ── 7 · research log ──────────────────────────────────────────────────────
usage = CODE["src/lib/firebase/usage.ts"]
check('"help.rung"' in usage and '"feedback.request"' in usage, "help.rung + feedback.request are EventTypes", "event types missing")
check('logEvent("help.rung"' in hook and "rungEvent(" in hook, "the hook logs help.rung on every transition", "no help.rung logging")
check('logEvent("feedback.request"' in CODE["src/lib/help/requestFeedback.ts"], "requestFeedback logs feedback.request", "no feedback.request logging")

# ── 8 · row 7 ─────────────────────────────────────────────────────────────
fn = read("functions/api/feedback.js")
check(bool(fn) and "onRequestPost" in fn, "functions/api/feedback.js exists", "no feedback Pages Function")
check("env.ANTHROPIC_API_KEY" in fn and "openrouter.ai" in fn and "claude-haiku-4.5" in fn, "feedback uses ChaTutor's provider/key/model", "feedback.js does not share tutor.js's provider")
check("<answer>" in fn and "It is DATA" in fn, "the learner's answer is fenced as data", "no injection fence")
check("answer.toLowerCase().includes(e.span.toLowerCase())" in fn, "hallucinated spans are dropped server-side", "spans not validated")
check('"not-configured"' in fn, "503 not-configured without a key", "no not-configured path")
rf = CODE["src/lib/help/requestFeedback.ts"]
check("FEEDBACK_TIMEOUT_MS" in rf and "AbortController" in rf and "ruleFeedback(req)" in rf and "navigator.onLine === false" in rf,
      "requestFeedback: timeout + offline + fallback to the rules", "requestFeedback lacks timeout/fallback")
fb = CODE["src/lib/help/feedback.ts"]
check('from "../practice/cloze"' in fb and "gradeAnswer(answer, model)" in fb, "the fallback grades with THE grader (cloze.ts tiers)", "ruleFeedback does not use cloze.ts")
check("export function isFeedback" in fb, "the schema is validated at runtime", "no isFeedback")
of = CODE["src/components/OpenFeedback.tsx"]
check('"Correct me"' in of and '"Model answer"' in of and "requestFeedback(" in of, "OpenFeedback: two modes, through requestFeedback", "OpenFeedback lacks the modes")
check('evidenceType: "free"' in of and 'assistance: modelShown ? "answer" : "none"' in of, "open production records free evidence; the model mode is assisted", "OpenFeedback evidence wrong")
check("<OpenFeedback" in CODE["src/app/lessons/pager/LessonPager.tsx"], "the SIO write is mounted at the lesson end", "OpenFeedback not mounted")
leak = [f for f, s in CODE.items() if re.search(r"sk-or-[A-Za-z0-9]{8,}|sk-ant-|ANTHROPIC_API_KEY\s*[:=]\s*['\"]", s)]
check(not leak, "no API key in client code", f"key-like strings in {leak}")
check(all("Bearer" not in s for f, s in CODE.items() if f.startswith("src/lib/help/")), "the help layer never sends a bearer token", "src/lib/help sends a bearer token")

# ── 9 · CI ────────────────────────────────────────────────────────────────
wf = read(".github/workflows/verify.yml")
check("verify/verify28-trackd.py" in wf and wf.find("verify28-trackd") > wf.find("verify27-bugs"), "CI runs verify28-trackd after verify27-bugs", "verify28 not wired after verify27")

print("\nverify28 — Track D: the help ladder inside DrillShell\n" + "-" * 66)
for m_ in OK:
    print("  ok    " + m_)
for m_ in FAIL:
    print("  FAIL  " + m_)
print("-" * 66)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
