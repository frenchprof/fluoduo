#!/usr/bin/env python3
"""Merge user-edited flashcard spec with CEFR Can-Do columns."""
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from handoff_cefr import CEFR, CEFR_HEADERS

UPLOAD = Path("/Users/keijidan/Downloads/LAF1201_SIOs_Flashcards_v4_1 - SIOs + Flashcards.csv")
OUTPUT = Path(__file__).resolve().parent.parent / "docs/handoff/LAF1201_SIOs_Flashcards_v9.csv"

with UPLOAD.open(newline="", encoding="utf-8") as f:
    rows = list(csv.reader(f))

out = [[*rows[0], *CEFR_HEADERS]]
matched = 0
for row in rows[1:]:
    if len(row) > 1 and row[1].startswith("SIO-"):
        sio = row[1].strip()
        base = row[:9]
        if sio in CEFR:
            out.append([*base, *CEFR[sio]])
            matched += 1
        else:
            out.append([*base, "", "", ""])

with OUTPUT.open("w", newline="", encoding="utf-8") as f:
    csv.writer(f, quoting=csv.QUOTE_MINIMAL).writerows(out)

print(f"Wrote {OUTPUT}")
print(f"Matched {matched}/50 SIOs from upload")
