#!/usr/bin/env python3
"""Append CEFR-style Can-Do columns to the LAF1201 handoff CSV.

Prefer scripts/merge-handoff-csv.py when integrating a new upload from Downloads.
This script re-applies the CEFR columns to the existing base columns in the CSV.
"""
import csv
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from handoff_cefr import CEFR, CEFR_HEADERS

CSV_PATH = Path(__file__).resolve().parent.parent / "docs/handoff/LAF1201_SIOs_Flashcards_v9.csv"


def apply_candos(csv_path: Path = CSV_PATH) -> int:
    with csv_path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.reader(f))

    base_header = rows[0][:9]
    out = [base_header + list(CEFR_HEADERS)]
    matched = 0

    for row in rows[1:]:
        if not row:
            continue
        base = row[:9]
        sio = base[1].strip() if len(base) > 1 else ""
        if sio in CEFR:
            out.append(base + list(CEFR[sio]))
            matched += 1
        elif sio.startswith("SIO-"):
            out.append(base + ["", "", ""])

    with csv_path.open("w", newline="", encoding="utf-8") as f:
        csv.writer(f, quoting=csv.QUOTE_MINIMAL).writerows(out)

    return matched


if __name__ == "__main__":
    matched = apply_candos()
    print(f"Updated {CSV_PATH.name}; matched {matched}/50 SIOs.")
