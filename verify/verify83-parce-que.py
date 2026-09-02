#!/usr/bin/env python3
"""verify83 — SIO-025 has a lesson, built from its own deck.

Born as HALF of Peers' verify76-two-tier3-stops.py, split at the 2 Sep merge:
the number collided with verify76-envies-besoins (minted in parallel on two
branches — the in-flight collision the AGENTS.md branch sweep exists to catch,
and Pre-tests spotted mid-flight), and its other half covered SIO-039, whose
wants-needs draft Dan graft-merged into envies-besoins rather than keep two
lessons on one goal. verify76-envies-besoins holds that stop; this holds 025.

WHY 025 HAS A LESSON AT ALL — the ruling reversed twice in one day. #125
recorded it a NON-gap ("every candidate concept needs French the deck does not
contain"). Peers then found the claim that ruling missed: the deck's own sixth
reason — « Parce que je fais du sport avec mes amis. » — fits neither frame
the competence names, so the true rule (parce que opens an ordinary sentence)
sat in the data with nothing naming it. Dan kept the lesson (2 Sep: "what is
wrong with that pourquoi lesson that we need to drop it"). verify51 records
the reversal.

What this asserts, all inherited from the split file:
  · the joints — file, export, registry, gallery, SIO row, empty concept
  · the deck declares the lesson it points at, and they agree
  · the table IS the deck: six reasons reassemble to parce-que.json's own fr
  · ★ blanks the FRAME; « Parce que » stays scaffolding
  · the prompt is the English reason, never the question three reasons answer

Run from the repo root:  python3 verify/verify83-parce-que.py
"""
import json
import os
import re
import sys

OK, FAIL = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

NAT = "src/content/lessons/native"
idx = read(f"{NAT}/index.tsx")
lessons = read("src/content/lessons.ts")
body = re.search(r"NATIVE_LESSONS[^=]*=\s*\{(.*?)\n\};", idx, re.S)

slug, export, sio = "parce-que", "parceQueLesson", "SIO-025"
src = read(f"{NAT}/{slug}.tsx")
check(bool(src), f"{slug}.tsx exists", f"{sio} still has no lesson file")
check(f"export const {export}" in src, f"{slug}.tsx exports {export}",
      f"{slug}.tsx does not export {export}")
check(f'import {{ {export} }} from "./{slug}"' in idx,
      f"{export} is imported by native/index.tsx",
      f"{export} is never imported — getNativeLesson('{slug}') returns undefined")
check(body is not None and re.search(rf'"{slug}":\s*{export}', body.group(1)) is not None,
      f"{slug} is registered in NATIVE_LESSONS",
      f"{slug} is imported but not in the NATIVE_LESSONS map — an import with no entry is dead")
check(re.search(rf'"{slug}":\s*\{{\s*slug:\s*"{slug}"', lessons) is not None,
      f"{slug} has a LESSONS row", f"{slug} is missing from LESSONS — the gallery cannot see it")
check(re.search(rf'"{sio}":\s*\[[^\]]*"{slug}"', lessons) is not None,
      f"{sio} points at the {slug} lesson",
      f"LESSONS_BY_SIO has no {sio} -> {slug} row, so the stop shows no lesson")
# CROSS-LANE EDIT — concepts lane, 2 Sep. Read this before reverting it.
#
# As pushed this asserted `concept` was ABSENT, which was right while the field
# was owed: a stub renders to a learner as the real argument. The concepts are
# now written, so absence has flipped meaning — it would mean a merge dropped
# one. Same intent, asserted from the other side. This is the fifth file to take
# this edit (verify74, 75, 76, 77, 83); the wording is identical across all of
# them so they read as one decision rather than five.
check(re.search(r"^\s*concept:", src, re.M) is not None,
      f"{slug}.tsx carries its concept",
      f"{slug}.tsx has no `concept` — SIO-025 is back to reading 'Idea has not been written for this lesson yet'")

for _slot in ("subtitle", "contrast", "question", "answer", "remember"):
    check(re.search(rf"^\s+{_slot}:", src, re.M) is not None,
          f"the concept fills `{_slot}`",
          f"the concept has no `{_slot}` — a concept missing a required slot is a stub with a type annotation")

# THE ARGUMENT IS THAT THE THREE FRAMES ARE NOT THREE RULES, and a stub cannot
# fake it: the claim has to reach the sixth card, the one fitting none of them.
_at = src.find("  concept: {")
_concept = src[_at:] if _at != -1 else ""
check("je fais du sport avec mes amis" in _concept,
      "the claim reaches the card that fits none of the three frames",
      "the concept never names « Parce que je fais du sport avec mes amis » — the card that shows the frames were never the rule")

j = json.load(open("src/content/collections/parce-que.json", encoding="utf-8"))
check(j.get("lessonSlug") == slug,
      f"parce-que.json declares lessonSlug {slug!r}, and the lesson uses it",
      f"parce-que.json declares lessonSlug {j.get('lessonSlug')!r} but the lesson is called {slug!r}")

# ---- the table is the deck --------------------------------------------------
# parce-que.tsx is a .tsx and cannot be imported by node, so its table is read
# and rebuilt here. The reassembly rule is « Parce que » + frame + rest, which
# is the one line of logic the file has.
rows = re.findall(
    r'\{\s*ask:\s*"([^"]+)",\s*frame:\s*"([^"]+)",\s*rest:\s*"([^"]+)",\s*en:\s*"([^"]+)"\s*\}', src)
pq_deck = json.load(open("src/content/collections/parce-que.json", encoding="utf-8"))["items"]
check(len(rows) == len(pq_deck) == 6,
      f"parce-que carries all {len(pq_deck)} deck items",
      f"the table has {len(rows)} rows against the deck's {len(pq_deck)} — a reason is being taught "
      f"or dropped silently")
for i, ((ask, frame, rest, en), item) in enumerate(zip(rows, pq_deck)):
    rebuilt = f"Parce que {frame} {rest}"
    check(rebuilt == item["fr"],
          f"reason {i + 1} reassembles to {item['fr']}",
          f"reason {i + 1} reassembles to {rebuilt!r}, the deck says {item['fr']!r} — the frame is "
          f"filed wrong, and a wrong frame teaches the wrong opening")
    check(ask == item["example"],
          f"reason {i + 1} keeps the deck's own question",
          f"reason {i + 1} asks {ask!r}, the deck asks {item['example']!r}")
    check(en == item["en"],
          f"reason {i + 1}'s prompt is the deck's own English",
          f"reason {i + 1}'s prompt is {en!r}, the deck says {item['en']!r}")

# ★ must take the frame, not « Parce que » and not the reason.
check(re.search(r'medFrom\(slots,\s*"frame"\)', src) is not None,
      "parce-que blanks the FRAME at ★ — the choice the stop is about",
      "parce-que blanks something else at ★; the stop would drill a word the English already gives")
check(re.search(r'\{\s*text:\s*"Parce que"\s*\}', src) is not None,
      "« Parce que » is scaffolding the learner always sees",
      "« Parce que » has become blankable — the connector is the one word this stop does not "
      "need to teach")
# The prompt is the English, for the reason written into the file: six generic
# reasons do not pair one-to-one with six questions.
check(re.search(r'big:\s*r\.en', src) is not None and re.search(r'meta:\s*r\.ask', src) is not None,
      "the English reason is the prompt and the deck's question is the context",
      "parce-que prompts with the QUESTION — « Pourquoi tu aimes le sport ? » is answered by three "
      "of the six reasons, so a card grading one of them marks two correct answers wrong")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
