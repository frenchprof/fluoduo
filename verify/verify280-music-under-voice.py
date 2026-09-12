#!/usr/bin/env python3
"""
The music is a bed under the voice, never over it (12 Sep 2026).

Dan: *"the music tends to be very loud once it starts, how can we make it
softer and not overpowering the texttospeech?"*

Before this, the chiptune loop ran at the FULL master level — as loud as the
win jingle — and nothing lowered it while a French sentence was being read,
so the sentence was the quieter of the two. Two numbers fix that, both in
games/audio/chiptune.ts and both read through the one function every place
the music bus is set already goes through:

    MUSIC_LEVEL   the loop's share of the master        1    -> 0.45  (~ -7 dB)
    VOICE_DUCK    the loop's share WHILE A VOICE SPEAKS        0.3   (~ -10 dB more)

"A voice" is any of the three the app has — the browser synth (polled via
speechSynthesis.speaking from the loop's own tick), a banked studio clip, or
a cloud clip (both <audio> elements, tracked by games/audio/voiceState.ts).
This check holds all of it:

  1  the two levels exist and are a bed, not a voice (MUSIC_LEVEL <= 0.5,
     VOICE_DUCK <= 0.35), and musicGain() reads both;
  2  the loop follows the voice on every tick, and the poll reads the synth;
  3  both <audio> paths hand their element to trackVoice(), so a clip ducks
     the music exactly like the synth does;
  4  the mute toggle restores musicGain(), not a bare 1 — the one place that
     used to write the level by hand and would have undone the bed on unmute.

Break-tested: MUSIC_LEVEL back to 1 -> 1 fails; followVoice() dropped from
loop() -> 2 fails; trackVoice removed from cloudVoice -> 3 fails; the mute
toggle set back to `m ? 0 : 1` -> 4 fails; restore -> all pass.

Run from the repo root:  python3 verify/verify280-music-under-voice.py
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if not os.path.isfile(os.path.join(ROOT, "package.json")):
    print("run from the repo root"); sys.exit(2)

OK, FAIL = [], []
def check(c, good, bad): (OK if c else FAIL).append(good if c else bad)
def read(rel): return open(os.path.join(ROOT, rel), encoding="utf-8").read()
def strip_comments(s):
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.S)
    return re.sub(r"(^|[^:\"'])//[^\n]*", r"\1", s)

chip = strip_comments(read("src/games/audio/chiptune.ts"))

# ── 1 · the two levels ───────────────────────────────────────────────────
ml = re.search(r"const MUSIC_LEVEL\s*=\s*([0-9.]+)", chip)
vd = re.search(r"const VOICE_DUCK\s*=\s*([0-9.]+)", chip)
check(ml is not None and float(ml.group(1)) <= 0.5,
      f"the loop's own level is a bed: MUSIC_LEVEL = {ml.group(1) if ml else '?'} (<= 0.5)",
      "MUSIC_LEVEL is missing or above 0.5 — the loop is back to competing with the voice")
check(vd is not None and float(vd.group(1)) <= 0.35,
      f"under a voice it drops further: VOICE_DUCK = {vd.group(1) if vd else '?'} (<= 0.35)",
      "VOICE_DUCK is missing or above 0.35 — the tune would not get out of the sentence's way")
check(re.search(r"const musicGain\s*=.*MUSIC_LEVEL.*voiceDucked.*VOICE_DUCK", chip) is not None,
      "musicGain() is the one place both numbers are read",
      "musicGain() does not combine MUSIC_LEVEL and VOICE_DUCK — a bus set elsewhere would skip the bed")

# ── 2 · the loop follows the voice ──────────────────────────────────────
loop = re.search(r"function loop\(\)\s*\{(.*?)\n\}", chip, re.S)
check(loop is not None and "followVoice()" in loop.group(1),
      "loop() calls followVoice() on every tick",
      "loop() no longer calls followVoice() — the music would never duck under speech")
check("speechSynthesis?.speaking" in chip and "voiceClipActive()" in chip,
      "the voice poll reads the browser synth AND the clip players",
      "voiceSpeaking() must read both window.speechSynthesis.speaking and voiceClipActive()")

# ── 3 · both clip players are tracked ────────────────────────────────────
for rel in ("src/lib/cloudVoice.ts", "src/games/letris/speech.ts"):
    src = strip_comments(read(rel))
    check("trackVoice(" in src and 'from "@/games/audio/voiceState"' in src,
          f"{rel} hands its <audio> element to trackVoice()",
          f"{rel} plays a voice clip the music cannot hear — call trackVoice(el) right after new Audio()")
vs = strip_comments(read("src/games/audio/voiceState.ts"))
check(all(f'"{e}"' in vs for e in ("playing", "pause", "ended", "error")),
      "trackVoice() listens for playing, pause, ended and error",
      "trackVoice() misses one of playing/pause/ended/error — the flag could stick on or never set")

# ── 4 · the mute toggle restores the bed, not full level ─────────────────
check(re.search(r'ch === "music".*?musicBus\.gain\.value = m \? 0 : musicGain\(\)', chip, re.S) is not None,
      "unmuting music restores musicGain(), so the bed and any duck survive the toggle",
      "the music mute toggle writes the level by hand — unmuting would jump the loop back to full level")

for m in OK: print("  ok   " + m)
for m in FAIL: print("  FAIL " + m)
print("-" * 70)
print(f"  {len(OK)} passed · {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
