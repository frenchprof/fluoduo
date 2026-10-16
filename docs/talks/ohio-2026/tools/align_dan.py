"""Align Dan's own recorded video (whisper word times) to the v5 script.
Writes v4/timing/nXX.json (one per script section, times relative to the section's start in the video)
and v4/timing/dan-sections.json [{id, title, a, b}] = where each section sits in Dan's video."""
import json, re, sys, difflib, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
script = open(f"{R}/data/script-v5-as-recorded.txt", encoding="utf-8").read()
W = json.load(open(sys.argv[1]))
total = float(sys.argv[2])
norm = lambda s: re.sub(r"[^\w]", "", s.lower().replace("’", "'"))
# sections
secs = []
for blk in re.split(r"^(\d+)\. (.*)$", script, flags=re.M)[1:]:
    pass
parts = re.split(r"^(\d+)\. (.*)$", script, flags=re.M)
for i in range(1, len(parts), 3):
    n, title, body = int(parts[i]), parts[i+1].strip(), parts[i+2]
    sents = []
    for para in [p.strip() for p in body.split("\n") if p.strip()]:
        sents += [x.strip() for x in re.split(r"(?<=[.?!])\s+(?=[A-Z“\"'])", para) if x.strip()]
    secs.append({"n": n, "title": title, "sents": sents})
# flat script tokens
tok = []  # (sec, sent, word)
for si, s in enumerate(secs):
    for ki, sent in enumerate(s["sents"]):
        for w in sent.split():
            tok.append((si, ki, w))
hw = [w for seg in W for w in seg["words"]]
A = [norm(t[2]) for t in tok]; B = [norm(w["w"]) for w in hw]
sm = difflib.SequenceMatcher(None, A, B, autojunk=False)
tm = [None] * len(tok)
for a, b, size in sm.get_matching_blocks():
    for j in range(size): tm[a + j] = (hw[b + j]["s"], hw[b + j]["e"])
matched = sum(x is not None for x in tm)
print(f"matched {matched}/{len(tok)} script words")
# interpolate gaps
known = [i for i, x in enumerate(tm) if x]
for i in range(len(tm)):
    if tm[i] is None:
        p = max([k for k in known if k < i], default=None); q = min([k for k in known if k > i], default=None)
        if p is None: tm[i] = (tm[q][0], tm[q][0])
        elif q is None: tm[i] = (tm[p][1], tm[p][1])
        else:
            f = (i - p) / (q - p); t = tm[p][1] + f * (tm[q][0] - tm[p][1]); tm[i] = (t, t)
# section boundaries: halfway in the gap between sections
first = {}; last = {}
for i, (si, ki, w) in enumerate(tok):
    first.setdefault(si, tm[i][0]); last[si] = tm[i][1]
bounds = [0.0] + [round((last[si - 1] + first[si]) / 2, 2) for si in range(1, len(secs))] + [total]
# Dan's video says the heading "21, where it stands," aloud (1050.5-1051.6 s): that second is skipped
START = {"n21": 1051.58}
END = {"n20": 1050.45}
out = []
for si, s in enumerate(secs):
    sid0 = f"n{s['n']:02d}"
    a, b = START.get(sid0, bounds[si]), END.get(sid0, bounds[si + 1]); sid = f"n{s['n']:02d}"
    sent = []
    for ki, text in enumerate(s["sents"]):
        idx = [i for i, t in enumerate(tok) if t[0] == si and t[1] == ki]
        words = [{"w": tok[i][2], "s": round(tm[i][0] - a, 2)} for i in idx]
        sent.append({"start": round(tm[idx[0]][0] - a, 2), "end": round(tm[idx[-1]][1] - a, 2), "text": text, "words": words})
    json.dump({"real": True, "dan": True, "dur": round(b - a, 2), "sent": sent}, open(f"{R}/v4/timing/{sid}.json", "w"), ensure_ascii=False, indent=0)
    out.append({"id": sid, "title": s["title"], "a": a, "b": b})
    print(sid, f"{a:7.1f}-{b:7.1f}", s["title"])
json.dump(out, open(f"{R}/v4/timing/dan-sections.json", "w"), indent=1)
