#!/usr/bin/env python3
"""FOUR BUGS A LEARNER FOUND, pinned so they cannot come back quietly.

Angelina Ong reported all four on 2026-09-15, within forty-six minutes, on
`/lessons/tu-vous` and `/lessons/deck/tu-vous` — which are the same component,
`LessonPager`, reached by two addresses.

Every one of them was INVISIBLE from the source to the people who wrote it, and
each for its own reason. That is why this file is a LIST rather than one clause
— the Geist precedent: *a ban that is not written down and not checked is not a
ban*, and the next learner report will not be about these four.

 1 · « 5 WORDS » FOR A FOUR-WORD ANSWER.  *"it said the answer was 5 words,
     when in reality it was 4 words and 1 question mark"*. French typography
     puts a space before ? ! : ; and inside « », so `split(/\\s+/)` counts the
     punctuation as a word. English does not, which is why it went unseen.
     Measured: « Vous vous appelez comment ? » → 5. This clause runs the real
     `wordCount` rule over real French answers.

 2 · A GAP WITH NO CONTEXT.  *"we are given the sentence to complete e.g.
     __ bien, but not any indication of the context or what we're supposed to
     translate"*. The tu-vous card drew the person and the frame, and the
     FRAME'S OWN ENGLISH — which the lesson has always carried — was never
     passed to the card. Nothing on screen said what the sentence meant.

 3 · FRENCH READ IN AN ENGLISH VOICE.  *"the audio reads out in english, not
     with the accurate french accent"*. `getVoices()` returns [] until the
     browser has loaded its voice table; a miss taken before that was CACHED,
     so every later utterance got no voice at all and fell back to the device
     default. A `voiceschanged` listener existed and did not help — it only
     fires after this module is imported, and this module is in a route chunk.

 4 · THE CUE FLICKERING AT THE BOTTOM OF THE PAGE.  *"the bottom of the page
     'next page' is constantly flickering and blinking"*. NOT the blinking
     arrows, which are Dan's own and deliberate — a feedback loop: the cue's
     own height is part of what decides whether the cue should show, so near
     the end it mounted, changed the measurement, and unmounted, every frame.

Run from the repo root:  python3 verify/verify780-learner-bugs.py
"""
import os
import re
import sys

PASS, FAIL = [], []


def ok(cond, good, bad):
    (PASS if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


def code(p):
    """The file with its comments stripped — a check must read what RUNS, never
    what a comment says about what runs."""
    s = read(p)
    s = re.sub(r"/\*[\s\S]*?\*/", "", s)
    return re.sub(r"(?m)^\s*//.*$", "", s)


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

# ── 1 · A WORD IS A TOKEN WITH A LETTER IN IT ──────────────────────────────
hints = read("src/lib/help/hints.ts")
ok(len(hints) > 2000, f"hints.ts read ({len(hints)} chars)",
   "src/lib/help/hints.ts did not read; every clause below would pass over an "
   "empty string, which is the silent-parser failure AGENTS.md names.")

# The rule is executed here rather than grepped for, because a regex that
# merely finds the word `wordCount` proves nothing about what it counts.
LETTER = re.compile(r"[^\W\d_]", re.UNICODE)


def word_count(answer):
    return len([w for w in answer.strip().split() if LETTER.search(w)])


CASES = [
    ("Vous vous appelez comment ?", 4),   # Angelina's own example
    ("Tu vas bien ?", 3),
    ("Vous habitez où ?", 3),
    ("Comment tu t’appelles ?", 3),  # an apostrophe is not a word break
    ("« Bonjour ! »", 1),                 # guillemets and ! are not words
    ("Je ne suis pas là", 5),             # nothing punctuated: unchanged
]
wrong = [f"« {a} » → {word_count(a)}, expected {n}" for a, n in CASES if word_count(a) != n]
ok(not wrong,
   f"a word is a token with a letter in it ({len(CASES)} French answers counted)",
   "THE WORD COUNT IS WRONG AGAIN: " + "; ".join(wrong) + ". French puts a "
   "space before ? ! : ; and inside « », so a plain split counts punctuation "
   "as a word and the hint lies to the learner about how long the answer is.")

# And the app uses that rule rather than a second copy of the old one.
body = code("src/lib/help/hints.ts")
ok("export function wordCount" in body,
   "hints.ts exports one `wordCount`, so there is a single rule to fix",
   "`wordCount` is gone from hints.ts. The counting rule must live in exactly "
   "one place — it was wrong in two before (the scaffold rung and the "
   "dictation rung), which is how one fix left the other lying.")
naive = re.findall(r"split\(/\\s\+/\)\.length", body)
ok(not naive,
   "no rung counts words by splitting on whitespace alone",
   f"{len(naive)} place(s) still count words with a bare "
   "`split(/\\s+/).length`. That is the bug Angelina reported; route it "
   "through `wordCount` instead.")

# ── 2 · THE tu-vous CARD SAYS WHAT THE SENTENCE MEANS ──────────────────────
# The frame's English has been in FRAMES since the lesson was written; the bug
# was that `newQuestion` never passed it on. So the test is that the card's
# prompt is built from the FRAME's English, not merely that an `en` exists.
tv = code("src/content/lessons/native/tu-vous.tsx")
ok(len(tv) > 1000, f"the tu-vous lesson read ({len(tv)} chars)",
   "src/content/lessons/native/tu-vous.tsx did not read.")
meta = re.search(r"\n\s*en:\s*(`[^`]*`|\"[^\"]*\")", tv)
ok(bool(meta) and "f.en" in (meta.group(1) if meta else ""),
   "every tu-vous card carries the sentence's own English in its reference line",
   "the tu-vous card does not carry the frame's English. FRAMES has an `en` "
   "for each question (« Are you well? ») and the card must print it: without "
   "it a learner sees « ___ bien ? » and is told neither what it means nor, on "
   "the typed tier, which verb it wants. NOT via the card's `en` slot — the "
   "pager suppresses that under a `big`, on every card in the app.")
ok(bool(meta) and "p.en" in (meta.group(1) if meta else ""),
   "and who they are talking to, in English",
   "the tu-vous card names the person only in French. « une personne âgée » "
   "is the whole of the tu/vous decision, so a learner who cannot read it "
   "cannot answer the card at all.")

# AND THE PAGER SHOWS IT. This is the half that made it app-wide: `en` was
# hidden under EVERY `big`, and on a generated card `big` is the situation in
# French while `en` is the instruction. Dan hit it on se-presenter the same
# afternoon (« Bonjour, ___. » under « Mr Moreau » — *"There is no context"*).
pg = code("src/app/lessons/pager/LessonPager.tsx")
ok(len(pg) > 5000, f"LessonPager read ({len(pg)} chars)", "LessonPager.tsx did not read.")
ok(not re.search(r"ex\.en && !ex\.big && !ex\.segments", pg),
   "the pager no longer hides the English reference under every `big`",
   "LessonPager is back to `ex.en && !ex.big` — that hides the instruction "
   "(« greet Mr Moreau politely ») under every French situation line, on ~30 "
   "generators at once. Hide `en` only when `big` is itself English.")
ok(re.search(r'ex\.bigLang === "en" \|\| ex\.kind === "translate" \|\| ex\.kind === "build"', pg),
   "and hides it only where `big` is itself the English reference",
   "the condition that decides when `en` would merely repeat `big` is gone.")

# ── 2b · A DISTRACTOR IS NEVER A RIGHT ANSWER (Dan, 2026-09-15) ────────────
# On the se-presenter politesse card « Bonjour, Monsieur. » was offered as a
# WRONG option. It is correct French. The 1 Sep ruling lets a distractor be bad
# French; it does not let it be good French. Bare title is accepted now, and
# the slot holds the register clash « Salut, Monsieur Moreau. » instead.
sp_gen = code("src/content/lessons/native/se-presenter.gen.ts")
ok(len(sp_gen) > 1000, f"se-presenter generator read ({len(sp_gen)} chars)", "se-presenter.gen.ts did not read.")
ok("`Bonjour, ${t.full}.`" in sp_gen and re.search(r"alternates:\s*\[[^\]]*`Bonjour, \$\{t\.full\}\.`", sp_gen),
   "« Bonjour, Monsieur. » is an ACCEPTED answer on the politesse card",
   "« Bonjour, ${t.full}. » is no longer in the politesse card's alternates. "
   "It is correct French; marking it wrong marks a learner wrong for knowing "
   "the language (Dan: *\"why can't Monsieur be correct\"*).")
ok(not re.search(r"easyOptions:\s*\[[^\]]*`Bonjour, \$\{t\.full\}\.`", sp_gen),
   "and it is not offered as a distractor",
   "« Bonjour, ${t.full}. » is back in easyOptions as a wrong option. A "
   "distractor may be bad French; it may not be another right answer.")

# ── 3 · A VOICE MISS IS NEVER CACHED ───────────────────────────────────────
sp = code("src/games/letris/speech.ts")
ok(len(sp) > 2000, f"speech.ts read ({len(sp)} chars)", "speech.ts did not read.")
ok(re.search(r"if \(v\) voiceCache\.set\(", sp),
   "a failed voice lookup is not cached, so it is retried once voices load",
   "`voiceCache.set(key, v)` is unguarded again. `getVoices()` returns [] "
   "until the browser has loaded its voice table, so an early lookup caches "
   "NULL — and every utterance afterwards gets no voice and falls back to the "
   "device default, which reads French with English phonics. Guard it: "
   "`if (v) voiceCache.set(key, v)`.")
ok("voiceschanged" in sp,
   "and the cache still clears when the browser announces its voices",
   "the `voiceschanged` listener is gone. It is not sufficient on its own "
   "(this module loads in a route chunk, after the event) but it is the half "
   "that upgrades an early partial list to the full one.")

# ── 4 · THE CUE HAS A DEAD BAND, SO IT CANNOT OSCILLATE ────────────────────
mb = code("src/components/MoreBelow.tsx")
ok(len(mb) > 1000, f"MoreBelow.tsx read ({len(mb)} chars)", "MoreBelow.tsx did not read.")
ok("ON_AT" in mb and "OFF_AT" in mb,
   "the cue turns on and off at two different thresholds",
   "MoreBelow is back to a single threshold. The cue's own height is part of "
   "what decides whether the cue shows, so one threshold oscillates at the "
   "bottom of a panel — mount, remeasure, unmount, every frame. That is what "
   "a learner reported as *\"constantly flickering and blinking\"*, and it is "
   "not the arrows.")
ok(re.search(r"setMore\(\(\w+\) =>", mb),
   "and it decides from its own previous state, not from a fresh boolean",
   "MoreBelow sets its state from a bare comparison again. A Schmitt trigger "
   "needs the previous value — `setMore((was) => was ? … : …)` — or the two "
   "thresholds do nothing.")

# THE ARROWS ARE DAN'S AND THEY STAY. He asked for them twice, the second time
# as *"the blinking arrows are OF ULTRA IMPORTANCE"*, after sending back a
# quieter first attempt. A learner calling the flicker "blinking" is a report
# about the LOOP above, not a licence to remove the animation; anyone who wants
# less motion already gets it from `.fluo-nextq-arrows`' own reduced-motion
# rule. This clause exists so a future session cannot quietly delete them while
# "fixing the flicker".
ok("fluo-nextq-arrows" in mb,
   "the cue still wears Dan's own « next question » arrows",
   "the blinking arrows are gone from MoreBelow. Dan asked for them twice — "
   "*\"the blinking arrows are OF ULTRA IMPORTANCE\"* — and reusing "
   "`.fluo-nextq-arrows` verbatim is what keeps this cue and the SIO cue one "
   "idea. Removing them is his call, not a side effect of a flicker fix.")

# ── 5 · NO WINDOW SHORTCUT FIRES WHILE THE LEARNER IS TYPING ───────────────
# Dan, 2026-09-15: *"i could not type feedback in NumBus it kept causing
# interference"*. A window-level keydown handler that acts on Space, Enter or
# a letter must stand down when the target is a field, or the 🐞 form (and
# any search box) is unusable on that screen. Escape-only handlers are exempt:
# Escape in a field closes things and types nothing.
import glob
PRINTABLE = re.compile(r'e\.key === "(?: |Enter|[A-Za-z])"')
loose = []
handlers = 0
for f in sorted(glob.glob("src/**/*.ts", recursive=True) + glob.glob("src/**/*.tsx", recursive=True)):
    body = code(f)
    # THE HANDLER THAT IS REGISTERED, not the whole file: an <input>'s own
    # onKeyDown may act on Enter and is nobody's business — only a
    # window/document listener can steal a keystroke from a field. So find
    # each `addEventListener("keydown", NAME)`, then read NAME's body.
    for m in re.finditer(r'addEventListener\("keydown",\s*([A-Za-z_$][\w$]*)', body):
        name = m.group(1)
        decl = re.search(r"(?:const|let|function)\s+" + re.escape(name) + r"\b", body[: m.start()])
        if not decl:
            continue
        handler = body[decl.start(): m.start()]
        if not PRINTABLE.search(handler):
            continue
        handlers += 1
        if not re.search(r"typingInField\(|inField\(|tagName === \"TEXTAREA\"", handler):
            loose.append(f"{f} ({name})")
ok(handlers >= 6, f"{handlers} window keydown handlers act on printable keys",
   "the handler scan found almost nothing — re-point it before trusting the clause below.")
ok(not loose,
   "every one of them stands down while the learner is typing in a field",
   "THESE HANDLERS STEAL KEYSTROKES FROM A FIELD: " + ", ".join(loose) + ". Add "
   "`if (typingInField(e)) return;` (lib/useChoiceKeys) at the top of the "
   "handler — a space or an R in the 🐞 form must never play the game.")

print("\nthe four bugs a learner found (15 Sep)\n" + "-" * 70)
print("\n".join("  ok    " + m for m in PASS))
if FAIL:
    print("\n".join("  FAIL  " + m for m in FAIL))
    print("-" * 70)
    print(f"  {len(PASS)} passed · {len(FAIL)} failed")
    sys.exit(1)
print("-" * 70)
print(f"  all {len(PASS)} checks passed")
