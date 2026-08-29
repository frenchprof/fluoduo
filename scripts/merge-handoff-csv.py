#!/usr/bin/env python3
"""Rebuild the handoff CSV from a fresh spreadsheet export.

    python3 scripts/merge-handoff-csv.py "~/Downloads/LAF1201 … .csv"

Dan's spreadsheet exports only the 9 base columns (Unit … Letris / Notes). The
three CEFR columns are the app's — this reattaches them from
src/content/sios/sios.json via handoff_cefr, so a fresh export comes back with
the live Can-Do statements rather than whatever the export happened to carry.

WHY THIS TAKES AN ARGUMENT NOW (2026-08-29)
-------------------------------------------
It used to have the upload path baked in — an absolute path into a personal
Downloads folder, naming a **v4_1** export while the repo is on v9. (Not quoted
here: verify42 fails the build on any absolute path in these scripts, and it is
right to, even in a comment.) Running it would have
silently replaced all 9 base columns of every row — the flashcard specs
included — with a spreadsheet several versions old, and reported success. That
is the same class of trap as the two generators retired the same day.

So: the path is required, and the merge REFUSES rather than proceeds when the
upload does not line up with what is already here. Every guard below exists to
stop a stale or partial export from overwriting good rows:

  * the base header must match column for column;
  * the SIO id set must match exactly — a missing id means rows would vanish,
    a new one means a decision nobody has made yet;
  * the current file is copied to .bak first;
  * and it prints which rows actually changed, so a surprise is visible.

Pass --allow-id-changes only when the export is deliberately adding or removing
an SIO, and expect to update src/content/sios/sios.json to match — the build's
check:sios compares the two.
"""
import csv
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from handoff_cefr import CEFR, CEFR_HEADERS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "docs/handoff/LAF1201_SIOs_Flashcards_v9.csv"
BASE_COLS = 9


def die(msg: str) -> None:
    sys.exit(f"merge-handoff-csv: {msg}")


def read_csv(path: Path) -> list[list[str]]:
    try:
        with path.open(newline="", encoding="utf-8") as f:
            return list(csv.reader(f))
    except OSError as e:
        die(f"cannot read {path}: {e}")


def sio_rows(rows: list[list[str]]) -> dict[str, list[str]]:
    return {
        r[1].strip(): r
        for r in rows[1:]
        if len(r) > 1 and r[1].strip().startswith("SIO-")
    }


def main(argv: list[str]) -> None:
    args = [a for a in argv[1:] if not a.startswith("--")]
    allow_id_changes = "--allow-id-changes" in argv
    if len(args) != 1:
        die(
            "give the exported CSV to merge.\n"
            '  python3 scripts/merge-handoff-csv.py "~/Downloads/LAF1201 … .csv"\n'
            "  (add --allow-id-changes only if the export deliberately adds or removes an SIO)"
        )

    upload = Path(args[0]).expanduser()
    if not upload.is_file():
        die(f"no such file: {upload}")
    if upload.resolve() == OUTPUT.resolve():
        die("the export and the handoff CSV are the same file — nothing to merge")

    new_rows = read_csv(upload)
    if not new_rows:
        die(f"{upload} is empty")
    cur_rows = read_csv(OUTPUT)

    # --- guard: the base columns must be the same spreadsheet ---------------
    new_head = [c.strip() for c in new_rows[0][:BASE_COLS]]
    cur_head = [c.strip() for c in cur_rows[0][:BASE_COLS]]
    if new_head != cur_head:
        die(
            "the export's base columns do not match the handoff CSV's.\n"
            f"  export: {' | '.join(new_head)}\n"
            f"  here:   {' | '.join(cur_head)}\n"
            "Refusing — this looks like a different (probably older) spreadsheet version."
        )

    # --- guard: the same 50 objectives ------------------------------------
    new_by_id, cur_by_id = sio_rows(new_rows), sio_rows(cur_rows)
    if not new_by_id:
        die(f"{upload} has no SIO- rows at all")
    missing = sorted(set(cur_by_id) - set(new_by_id))
    added = sorted(set(new_by_id) - set(cur_by_id))
    if (missing or added) and not allow_id_changes:
        die(
            "the export's SIO ids differ from the handoff CSV's.\n"
            + (f"  would DELETE: {', '.join(missing)}\n" if missing else "")
            + (f"  would ADD:    {', '.join(added)}\n" if added else "")
            + "Refusing — pass --allow-id-changes if that is deliberate, and update\n"
            "src/content/sios/sios.json to match (the build's check:sios compares them)."
        )

    # --- merge --------------------------------------------------------------
    out = [[*new_rows[0][:BASE_COLS], *CEFR_HEADERS]]
    changed, no_cefr = [], []
    for sio, row in new_by_id.items():
        base = (row + [""] * BASE_COLS)[:BASE_COLS]
        cefr = CEFR.get(sio)
        if cefr is None:
            no_cefr.append(sio)
        out.append([*base, *(cefr or ("", "", ""))])
        was = cur_by_id.get(sio)
        if was is not None and [c.strip() for c in was[:BASE_COLS]] != [c.strip() for c in base]:
            changed.append(sio)

    backup = OUTPUT.with_suffix(".csv.bak")
    shutil.copy2(OUTPUT, backup)
    with OUTPUT.open("w", newline="", encoding="utf-8") as f:
        csv.writer(f, quoting=csv.QUOTE_MINIMAL).writerows(out)

    print(f"Merged {len(new_by_id)} SIOs from {upload}")
    print(f"  CEFR columns reattached from sios.json for {len(new_by_id) - len(no_cefr)}")
    if no_cefr:
        print(f"  ⚠️ no CEFR text for: {', '.join(no_cefr)} — left blank")
    if missing or added:
        print(f"  ⚠️ id changes applied: -{len(missing)} +{len(added)}")
    print(f"  base columns changed on {len(changed)} row(s)"
          + (f": {', '.join(changed)}" if changed else ""))
    print(f"  previous file kept at {backup.relative_to(ROOT)}")
    print("\nNow run:  node scripts/sync-sio-csv.mjs --check")


if __name__ == "__main__":
    main(sys.argv)
