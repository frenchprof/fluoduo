"""Turn talk-script.md into a HeyGen transcript: one scene per slide, spoken words only."""
import re, sys

src, out = sys.argv[1], sys.argv[2]
text = open(src, encoding="utf-8").read()
scenes = []
for block in re.split(r"^## ", text, flags=re.M)[1:]:
    title, _, body = block.partition("\n")
    body = re.sub(r"\(\d+:\d+\s*[–-]\s*\d+:\d+\)\s*", "", body)   # time cues
    body = re.sub(r"\[[^\]]*\]\s*", "", body)                     # stage directions
    body = " ".join(body.split())
    if body:
        scenes.append((title.strip(), body))

DISCLOSURE = ("Before we begin: the presenter in this video is an AI version of me, made with HeyGen. "
              "The words, the ideas and the course are mine. ")
if scenes and not scenes[0][1].startswith("Before we begin"):
    scenes[0] = (scenes[0][0], DISCLOSURE + scenes[0][1])

with open(out, "w", encoding="utf-8") as f:
    for i, (title, body) in enumerate(scenes, 1):
        f.write(f"SCENE {i} — {title}\n\n{body}\n\n\n")
print(len(scenes), "scenes,", sum(len(b.split()) for _, b in scenes), "words")
