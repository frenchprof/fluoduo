#!/usr/bin/env python3
"""
The broker calls the number again. The clock was never the problem.

Dan, 7 Sep: *"the numbers are starting way too slowly at the start"* — and
then, diagnosing it himself before anyone changed a constant: *"i think i
know: the 8 seconds are meant for all the repeated audio renderings of the
same number"*, *"not just 1 x, which was why it sounded sluggish"*.

He was right, and that is the whole point of this check. NumBourse's level-1
ticket lasts 8 seconds and NumBus gives 24; both were SIZED to hold several
callouts, and both spoke the number exactly once, so the rest of the clock was
silence. The game felt becalmed while the timing was correct all along.

Measured after the fix, driving the real app and counting every utterance the
page sends to the voice:

    NUMBOURSE level 1        NUMBUS one round
      t=3.5s  quatre           t= 5.0s  Le bus numéro soixante
      t=6.5s  quatre           t=10.2s  (+5.2s)  again
      t=9.5s  quatre           t=14.0s  (+3.8s)  again
      (ticket ends)            t=17.8s  (+3.8s)  again   … to the end

WHAT EACH ASSERTION IS FOR:

  1  THE CLOCKS ARE UNTOUCHED. This is the assertion that records Dan's
     ruling, and it is the one most likely to be "helpfully" broken later by
     someone reading only the words "too slow". The fix was to fill the
     seconds, not to cut them. NumBourse's ladder stays 8·8·9·9·9·11·14·16 and
     NumBus's shapes stay 24·28·30·32·36. If a future change wants to shorten
     them it should say so out loud, not arrive as a side effect.

  2  BOTH GAMES ACTUALLY REPEAT. One scheduled callout per game, or the whole
     thing is a comment.

  3  THE GAP NEVER DROPS BELOW THE LENGTH OF THE NUMBER. « neuf cent
     quatre-vingt-seize mille trois cent vingt et un » takes about four
     seconds to say. A flat three-second gap would start the next call over
     the top of the last one, which is worse than the silence it replaced.

  4  A CALL IS ONLY MADE IF IT CAN FINISH. A callout begun a second before the
     ticket dies is chopped off mid-number — again worse than silence.

  5  THE SCHEDULE NEVER DEPENDS ON `onDone`. `speak()` returns early — without
     ever firing onDone — when the voice is muted, when the device has no
     speech, and when a pre-recorded bank clip plays instead of the synth.
     French numbers are exactly the sort of word that is banked. Timing the
     repeats off "when the voice finished" would strand a muted learner on a
     ticket that never expires. Timers only.

  6  NUMBUS COUNTS FROM WHEN IT WAS LAST SAID. Measured before this was fixed:
     the announcement landed at 5.0s, typing opened at 10.8s (the speech plus
     GRACE_MS), and scheduling the first repeat one gap after THAT put it at
     15.2s — a ten-second hole in the middle of the round, which is the exact
     silence the change exists to remove.

  7  THE 🔊 KEY CANNOT RING FOREVER. `repeatSay` set `talking` true and cleared
     it in onDone — which, per 5, never fires for a muted or banked voice. The
     ringing animation on the key would then run for the rest of the round.

Run from the repo root:  python3 verify/verify122-number-callouts.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OK, FAIL = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(rel):
    return open(os.path.join(ROOT, rel), encoding="utf-8").read()


def strip_comments(src):
    """Drop // and /* */ so no assertion can be satisfied by the paragraph
    explaining the thing it is meant to be checking."""
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


bourse = strip_comments(read("src/games/numbourse/NumBourse.tsx"))
bus = strip_comments(read("src/games/numbus/NumBus.tsx"))
cfg = strip_comments(read("src/games/numbus/config.ts"))

# 1 ── the clocks are untouched. Dan's ruling, in numbers.
ladder = re.findall(r"\{ max: \d+, secs: (\d+) \}", bourse)
check(ladder == ["8", "8", "9", "9", "9", "11", "14", "16"],
      "NumBourse's level clocks are unchanged (8·8·9·9·9·11·14·16)",
      f"NumBourse's level clocks have been edited — found {ladder or 'nothing'}. "
      f"Dan's ruling was that the seconds were always right and the SILENCE "
      f"was the fault: 'the 8 seconds are meant for all the repeated audio "
      f"renderings of the same number'. Shortening them undoes the diagnosis")
secs = sorted(set(re.findall(r"seconds: (\d+)", cfg)))
check(secs == ["24", "28", "30", "32", "36"],
      "NumBus's round clocks are unchanged (24·28·30·32·36)",
      f"NumBus's per-shape seconds have been edited — found {secs or 'nothing'}. "
      f"Same ruling as above: fill the seconds, do not cut them")

# 2 ── both games schedule repeats at all.
for name, src, fn in (("NumBourse", bourse, r"speak\(order\.words"),
                      ("NumBus", bus, r"repeatSay\(round\.say\)")):
    sched = re.search(r"for \(let at =(.*?)\n\s*\}", src, flags=re.S)
    check(sched is not None and re.search(fn, sched.group(1)) is not None,
          f"{name} schedules the number to be called again",
          f"{name} no longer repeats the callout — the number is said once and "
          f"the rest of its clock is silence, which is the fault Dan reported")

# 3 + 4 ── the gap fits the number, and a call that cannot finish is not made.
for name, src in (("NumBourse", bourse), ("NumBus", bus)):
    gap = re.search(r"const every = Math\.max\(\s*(\w+|\d+),\s*say \+ \d+\)", src)
    check(gap is not None,
          f"{name}: the gap widens to fit a long number",
          f"{name}: the gap between callouts no longer accounts for how long "
          f"the number takes to say — a six-digit number takes ~4s and a flat "
          f"3s gap talks over its own previous call")
    check(re.search(r"at \+ say \+ \d+ <= ", src) is not None,
          f"{name}: a callout is only made if it can finish before time runs out",
          f"{name}: a callout can now begin too late to finish, so the last one "
          f"a learner hears is a number cut off halfway")

# 5 ── never wired to onDone, which does not fire when muted or banked.
for name, src in (("NumBourse", bourse), ("NumBus", bus)):
    sched = re.search(r"for \(let at =(.*?)\n\s*\}", src, flags=re.S)
    body = sched.group(1) if sched else ""
    check("setTimeout" in body and "onDone" not in body,
          f"{name}: the repeats are driven by timers, not by the voice",
          f"{name}: the repeat schedule now depends on speech's onDone — which "
          f"never fires for a muted voice, a device without speech, or a "
          f"pre-recorded bank clip, so a muted learner would sit on a ticket "
          f"that never ends")

# 6 ── NumBus spaces from the last utterance, not from the typing window.
check("lastSaidAtRef" in bus and re.search(r"every - since", bus) is not None,
      "NumBus spaces its repeats from when the number was last said",
      "NumBus is timing repeats from something other than the last utterance. "
      "Measured when this was wrong: announcement at 5.0s, typing open at "
      "10.8s, first repeat at 15.2s — a ten-second silence in the middle of "
      "the round")

# 7 ── the 🔊 key stops ringing even when nothing came back from the voice.
rs = re.search(r"const repeatSay = useCallback\((.*?)\n  \}, \[", bus, flags=re.S)
check(rs is not None and "speechMs" in rs.group(1) and "setTalking(false)" in rs.group(1),
      "the 🔊 key stops ringing even when the voice reports nothing back",
      "repeatSay clears its ringing state only from onDone, which a muted or "
      "banked voice never fires — the key would ring for the rest of the round")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
