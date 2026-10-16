"""tts.py <slide-id ...> : English clone voice for each slide (HeyGen /v3/voices/speech, ~$0.004/s).
Saves v4/audio/<id>.wav and v4/timing/<id>.json (real word timings, split into the script's sentences)."""
import json, os, re, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = "d8ac22b7d66c4419b49dfbbad3feefd3"
S = json.load(open(f"{R}/data/sentences.json"))
def curl(*a):
    import time
    for k in range(4):
        out = subprocess.run(["curl", "-sS", "--max-time", "300", *a], capture_output=True, text=True).stdout
        try: return json.loads(out)
        except ValueError: print("  empty reply, retrying", k + 1); time.sleep(3 * (k + 1))
    raise SystemExit("HeyGen gave no answer 4 times")
def balance():
    return curl("https://api.heygen.com/v3/users/me")["data"]["wallet"]["remaining_balance"]
os.makedirs(f"{R}/v4/audio", exist_ok=True)
b0 = balance(); print("balance", b0)
for sid in sys.argv[1:]:
    v = S[sid]; text = " ".join(v["voice"])
    r = curl("-X", "POST", "https://api.heygen.com/v3/voices/speech", "-H", "Content-Type: application/json",
             "-d", json.dumps({"text": text, "voice_id": VOICE, "language": "en"}))
    d = r.get("data") or {}
    if not d.get("audio_url"): print(sid, "FAILED", r); continue
    subprocess.run(["curl", "-sS", "-o", f"{R}/v4/audio/{sid}.wav", d["audio_url"]], check=True)
    words = [w for w in d["word_timestamps"] if w["word"] not in ("<start>", "<end>")]
    sent, i = [], 0
    for s, vs in zip(v["sentences"], v["voice"]):
        n = len(vs.split()); ws = words[i:i + n]; i += n
        if not ws: print(sid, "ALIGN FAIL at", s); break
        sent.append({"start": ws[0]["start"], "end": ws[-1]["end"], "text": s,
                     "words": [{"w": w["word"], "s": w["start"]} for w in ws]})
    if i != len(words): print(sid, "WARNING word count", i, "vs", len(words))
    json.dump({"real": True, "dur": round(d["duration"] + 0.4, 2), "sent": sent},
              open(f"{R}/v4/timing/{sid}.json", "w"), ensure_ascii=False)
    print(sid, "ok", round(d["duration"], 1), "s")
print("spent", round(b0 - balance(), 3))
