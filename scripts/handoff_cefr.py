"""CEFR Can-Do descriptors for LAF1201 SIOs — DERIVED, never stored here.

WHY THIS FILE NO LONGER HOLDS THE TEXT (2026-08-29)
---------------------------------------------------
It used to carry its own hand-typed copy of all 50 descriptors. That copy went
stale and nothing said so. Diffed against the live course on 29 Aug: 23 of 50
matched, 27 did not, and the drift had three separate shapes —

  * 9 held a DIFFERENT SIO's exact can-do (012/013/014 rotated among
    themselves, as did 022-026 and 028);
  * Unit 0 was shifted one place across 008/009/010 — the header note below
    still describes a Unité 0 where SIO-008 is "question words", an objective
    that moved out of Unit 0 entirely (it is SIO-035 now);
  * the rest were simply older wordings, and SIO-045 was absent because it
    postdates the 50-row numbering.

That is dangerous in a quiet way. Nothing imports this at build or run time, so
it did nothing at all — until someone ran add-candos.py or merge-handoff-csv.py,
which paste these three columns into the handoff CSV. Then it fails SILENTLY:
the CSV still parses, the build still passes, and a wrong can-do simply appears
under the right objective. You would hear about it from a student.

The fix is to stop keeping a second copy. src/content/sios/sios.json is the
source for the whole course (see src/content/sios/index.ts), so CEFR is read
from it. Re-applying the columns now writes what the course actually says, and
there is nothing left that can drift.

  * Adding an SIO?  It appears here automatically.
  * Editing a can-do?  Edit sios.json; the CSV follows via
    scripts/sync-sio-csv.mjs, which `npm run build` also checks.
"""
import json
from pathlib import Path

CEFR_HEADERS = ["CEFR Mode", "Can-Do (A1)", "Linguistic competence (measurable)"]

SIOS_JSON = Path(__file__).resolve().parent.parent / "src/content/sios/sios.json"

# The course has 50 objectives. Anything materially below that means the file
# was unreadable, truncated or half-written — and the callers of this module
# OVERWRITE the CSV's descriptor columns with whatever they find here, so a
# short read would blank them. Refuse instead of quietly emptying the CSV.
_MIN_SIOS = 50


def _load(path: Path = SIOS_JSON) -> dict[str, tuple[str, str, str]]:
    try:
        sios = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as e:
        raise SystemExit(f"handoff_cefr: cannot read {path}: {e}")

    cefr = {
        s["id"]: (s["cefrMode"], s["canDo"], s["competence"])
        for s in sios
        if s.get("cefrMode") and s.get("canDo") and s.get("competence")
    }
    if len(cefr) < _MIN_SIOS:
        incomplete = sorted({s["id"] for s in sios} - set(cefr))
        raise SystemExit(
            f"handoff_cefr: only {len(cefr)} complete SIOs in {path} "
            f"(expected at least {_MIN_SIOS}). Refusing to hand back a short set — "
            f"the callers would blank the CSV's descriptor columns."
            + (f"\nIncomplete: {', '.join(incomplete)}" if incomplete else "")
        )
    return cefr


CEFR = _load()
