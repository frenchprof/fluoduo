"""narration-final.md -> data/sentences.json : {slide: {"title", "part", "sentences": [..]}}.
Slide ids are s01..s23. Each script line is split into sentences; the voice text applies Dan's respellings."""
import re, json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAY = {"L’Atelier": "La-tuh-li-eh", "L'Atelier": "La-tuh-li-eh", "ÉcouTexte": "Eh-ku-tekst", "G-Compris": "Zhay-kom-pree"}
PARTS = {**{i: "" for i in range(1, 6)}, **{i: "Part 1 · The French course" for i in range(6, 11)},
         11: "Part 2 · Two typologically distant languages", 12: "Part 3 · Moving the template to Chinese",
         **{i: "Part 3 · Keep the frame" for i in (13, 14, 15)}, **{i: "Part 3 · Change the settings" for i in (16, 17)},
         **{i: "Part 3 · Fill the slots" for i in (18, 19, 20)}, **{i: "Part 4 · Closing" for i in (21, 22, 23)}}
def voice(s):
    for k, v in SAY.items(): s = s.replace(k, v)
    return s
t = open(f"{R}/data/narration-final.md", encoding="utf-8").read()
out = {}
for blk in re.split(r"^## ", t, flags=re.M)[1:]:
    head, body = blk.split("\n", 1)
    n = int(head.split(".")[0]); title = head.split(".", 1)[1].strip()
    lines = [l.strip() for l in body.split("\n") if l.strip() and not l.startswith("#")]
    sents = []
    for l in lines:
        sents += [x.strip() for x in re.split(r"(?<=[.?!])\s+(?=[A-Z“\"'])", l) if x.strip()]
    out[f"s{n:02d}"] = {"title": title, "part": PARTS[n], "sentences": sents, "voice": [voice(s) for s in sents]}
json.dump(out, open(f"{R}/data/sentences.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "slides", sum(len(v["sentences"]) for v in out.values()), "sentences")
