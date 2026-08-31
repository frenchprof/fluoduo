#!/usr/bin/env python3
"""Build the Tier 2 sample lesson page, with the brand face embedded.

The Lexical Core shape Dan iterated on 30-31 Aug 2026 — Learning path ·
The concept · The forms · The exercise · The bonus · The word list, with the
forms tab holding gender and the a/de compound contrast, and the exercise a
cloze that blanks the article then the article and the noun.

Reads the live deck, so it FAILS LOUDLY when aliments.json changes — which is
the point: the counts printed on the page are the deck's, not remembered.

    python3 docs/samples/build-tier2-sample.py        # writes beside itself
    OUT_DIR=/tmp python3 docs/samples/build-tier2-sample.py
"""
import base64, json, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = pathlib.Path(__file__).parent
OUT = pathlib.Path(
    os.environ.get("OUT_DIR", HERE)) / "tier2-aliments.html"

font = base64.b64encode((ROOT / "src/fonts/FluOlinGoHandRegular.otf").read_bytes()).decode()

deck = json.loads((ROOT / "src/content/collections/aliments.json").read_text(encoding="utf-8"))
items = {i["id"]: i for i in deck["items"]}
assert len(items) == 42, f"deck changed: {len(items)} items"

MEALS = ["aliments-01", "aliments-02", "aliments-03", "aliments-04"]
foods = [k for k in items if k not in MEALS]
assert len(foods) == 38, len(foods)

# ----------------------------------------------------------------- the forms
# Gender as the DECK STRING gives it. `du` is de+le so it marks masculine;
# `de la` marks feminine; `de l'` and `des` mark nothing at all. Nothing in
# aliments.json records gender as a field — every value here is inferred.
FEM_PREFIX = ("la ", "une ", "de la ")
MASC_PREFIX = ("le ", "un ", "du ")
HIDDEN_PREFIX = ("de l'", "des ")

def gender_of(fr: str) -> str:
    if fr.startswith(FEM_PREFIX):
        return "f"
    if fr.startswith(MASC_PREFIX):
        return "m"
    if fr.startswith(HIDDEN_PREFIX):
        return "?"
    raise AssertionError(f"unclassifiable article: {fr!r}")

COLUMNS = [
    ("m", "Masculine", "le · un · du", "m"),
    ("f", "Feminine", "la · une · de la", "f"),
    ("x", "The article hides it", "de l’ · des", "?"),
]
order = MEALS + foods
buckets = {g: [k for k in order if gender_of(items[k]["fr"]) == g] for _, _, _, g in COLUMNS}
assert sum(len(v) for v in buckets.values()) == 42
assert len(buckets["?"]) == 9, len(buckets["?"])

def chip(iid: str, gender: str = "") -> str:
    it = items[iid]
    g = f' data-g="{gender}"' if gender else ""
    return (f'<button class="chip" data-id="{iid}"{g} type="button" '
            f'aria-label="{it["fr"]} — {it["en"]}">'
            f'<span class="chip-e" aria-hidden="true">{it["emoji"]}</span>'
            f'<span class="chip-fr">{it["fr"]}</span>'
            f'<span class="chip-en">{it["en"]}</span></button>')

forms_html = "".join(
    f'<section class="gcol" data-g="{key}">'
    f'<h4>{title}<span class="grp-sub">{len(buckets[g])} of 42</span></h4>'
    f'<p class="gcol-sub">{arts}</p>'
    f'<div class="chips">{"".join(chip(i, key) for i in buckets[g])}</div></section>'
    for key, title, arts, g in COLUMNS)

html = (HERE / "tier2-aliments.template.html").read_text(encoding="utf-8")
html = (html.replace("__FONT_B64__", font)
            .replace("<!--FORMS-->", forms_html))
for token in ("__FONT_B64__", "<!--FORMS-->"):
    assert token not in html, f"{token} not substituted"
OUT.write_text(html, encoding="utf-8")
print(f"wrote {OUT}  ({len(html):,} bytes)")
print(f"  gender : m={len(buckets['m'])} f={len(buckets['f'])} hidden={len(buckets['?'])}")
print("  hidden :", [items[k]["fr"] for k in buckets["?"]])
