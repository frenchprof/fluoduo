"""Estimated timings (before the real voice exists): 2.6 words/s, 0.35 s between sentences.
Writes v4/timing/<id>.json in the same shape the real voice timings will have."""
import json, os, sys
R = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(f"{R}/data/sentences.json"))
os.makedirs(f"{R}/v4/timing", exist_ok=True)
for sid, v in d.items():
    if os.path.exists(f"{R}/v4/timing/{sid}.json") and json.load(open(f"{R}/v4/timing/{sid}.json")).get("real"): continue
    t, sent = 0.4, []
    for s in v["sentences"]:
        ws = s.split(); words = []
        for w in ws:
            words.append({"w": w, "s": round(t, 2)}); t += 1/2.6
        sent.append({"start": words[0]["s"], "end": round(t, 2), "text": s, "words": words}); t += 0.35
    json.dump({"real": False, "dur": round(t + 0.6, 2), "sent": sent}, open(f"{R}/v4/timing/{sid}.json", "w"), ensure_ascii=False)
print("ok")
