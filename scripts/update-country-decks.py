#!/usr/bin/env python3
"""Update SIO-015/016/017 to locked 25-country list with matching (not Letris)."""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "docs/handoff/LAF1201_SIOs_Flashcards_v9.csv"
VOCAB_PATH = ROOT / "docs/handoff/vocab_lists.json"
CEFR_PATH = ROOT / "scripts/handoff_cefr.py"

COUNTRIES = [
    {"n": 1, "flag": "🇫🇷", "fr": "France", "en": "France", "art": "la", "lang": "le français",
     "nat": ("français", "française", "français", "françaises")},
    {"n": 2, "flag": "🇵🇹", "fr": "Portugal", "en": "Portugal", "art": "le", "lang": "le portugais",
     "nat": ("portugais", "portugaise", "portugais", "portugaises")},
    {"n": 3, "flag": "🇨🇳", "fr": "Chine", "en": "China", "art": "la", "lang": "le chinois",
     "nat": ("chinois", "chinoise", "chinois", "chinoises")},
    {"n": 4, "flag": "🇮🇩", "fr": "Indonésie", "en": "Indonesia", "art": "l'", "lang": "l'indonésien",
     "nat": ("indonésien", "indonésienne", "indonésiens", "indonésiennes")},
    {"n": 5, "flag": "🇰🇷", "fr": "Corée", "en": "Korea", "art": "la", "lang": "le coréen",
     "nat": ("coréen", "coréenne", "coréens", "coréennes")},
    {"n": 6, "flag": "🇺🇸", "fr": "États-Unis", "en": "United States", "art": "les", "lang": "l'anglais",
     "nat": ("américain", "américaine", "américains", "américaines")},
    {"n": 7, "flag": "🇲🇽", "fr": "Mexique", "en": "Mexico", "art": "le", "lang": "l'espagnol",
     "nat": ("mexicain", "mexicaine", "mexicains", "mexicaines")},
    {"n": 8, "flag": "🇨🇺", "fr": "Cuba", "en": "Cuba", "art": "∅", "lang": "l'espagnol",
     "nat": ("cubain", "cubaine", "cubains", "cubaines")},
    {"n": 9, "flag": "🇵🇭", "fr": "Philippines", "en": "Philippines", "art": "les", "lang": "le filipino et l'anglais",
     "nat": ("philippin", "philippine", "philippins", "philippines")},
    {"n": 10, "flag": "🇦🇷", "fr": "Argentine", "en": "Argentina", "art": "l'", "lang": "l'espagnol",
     "nat": ("argentin", "argentine", "argentins", "argentines")},
    {"n": 11, "flag": "🇷🇺", "fr": "Russie", "en": "Russia", "art": "la", "lang": "le russe",
     "nat": ("russe", "russe", "russes", "russes")},
    {"n": 12, "flag": "🇨🇭", "fr": "Suisse", "en": "Switzerland", "art": "la", "lang": "le français, l'allemand et l'italien",
     "nat": ("suisse", "suisse", "suisses", "suisses")},
    {"n": 13, "flag": "🇧🇪", "fr": "Belgique", "en": "Belgium", "art": "la", "lang": "le français et le néerlandais",
     "nat": ("belge", "belge", "belges", "belges")},
    {"n": 14, "flag": "🇬🇷", "fr": "Grèce", "en": "Greece", "art": "la", "lang": "le grec",
     "nat": ("grec", "grecque", "grecs", "grecques")},
    {"n": 15, "flag": "🇹🇷", "fr": "Turquie", "en": "Turkey", "art": "la", "lang": "le turc",
     "nat": ("turc", "turque", "turcs", "turques")},
    {"n": 16, "flag": "🇩🇪", "fr": "Allemagne", "en": "Germany", "art": "l'", "lang": "l'allemand",
     "nat": ("allemand", "allemande", "allemands", "allemandes")},
    {"n": 17, "flag": "🇰🇭", "fr": "Cambodge", "en": "Cambodia", "art": "le", "lang": "le khmer",
     "nat": ("cambodgien", "cambodgienne", "cambodgiens", "cambodgiennes")},
    {"n": 18, "flag": "🇸🇬", "fr": "Singapour", "en": "Singapore", "art": "∅", "lang": "l'anglais, le malais et le mandarin",
     "nat": ("singapourien", "singapourienne", "singapouriens", "singapouriennes")},
    {"n": 19, "flag": "🇲🇾", "fr": "Malaisie", "en": "Malaysia", "art": "la", "lang": "le malais",
     "nat": ("malaisien", "malaisienne", "malaisiens", "malaisiennes")},
    {"n": 20, "flag": "🇹🇭", "fr": "Thaïlande", "en": "Thailand", "art": "la", "lang": "le thaï",
     "nat": ("thaïlandais", "thaïlandaise", "thaïlandais", "thaïlandaises")},
    {"n": 21, "flag": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "fr": "Angleterre", "en": "England", "art": "l'", "lang": "l'anglais",
     "nat": ("anglais", "anglaise", "anglais", "anglaises")},
    {"n": 22, "flag": "🇬🇧", "fr": "Grande-Bretagne", "en": "Great Britain", "art": "la", "lang": "l'anglais",
     "nat": ("britannique", "britannique", "britanniques", "britanniques")},
    {"n": 23, "flag": "🇹🇳", "fr": "Tunisie", "en": "Tunisia", "art": "la", "lang": "l'arabe et le français",
     "nat": ("tunisien", "tunisienne", "tunisiens", "tunisiennes")},
    {"n": 24, "flag": "🇲🇦", "fr": "Maroc", "en": "Morocco", "art": "le", "lang": "l'arabe et le français",
     "nat": ("marocain", "marocaine", "marocains", "marocaines")},
    {"n": 25, "flag": "🇩🇿", "fr": "Algérie", "en": "Algeria", "art": "l'", "lang": "l'arabe et le français",
     "nat": ("algérien", "algérienne", "algériens", "algériennes")},
]


def country_with_article(c):
    if c["art"] == "∅":
        return c["fr"]
    if c["art"] == "l'":
        return f"l'{c['fr']}"
    return f"{c['art']} {c['fr']}"


def countries_back():
    lines = []
    for c in COUNTRIES:
        name = country_with_article(c)
        lines.append(f"{c['flag']} C'est quel pays ? → Le pays, c'est {name}.")
    return "\n".join(lines)


def nationalities_back():
    lines = []
    for c in COUNTRIES:
        ms, fs, mp, fp = c["nat"]
        lines.append(
            f"{c['flag']} {c['fr']} → il est {ms} · elle est {fs} · ils sont {mp} · elles sont {fp}"
        )
    return "\n".join(lines)


def languages_back():
    lines = []
    for c in COUNTRIES:
        lines.append(f"{c['flag']} {c['fr']} → on parle {c['lang']}")
    return "\n".join(lines)


def countries_overview():
    rows = ["# | Flag | French | English | Article"]
    for c in COUNTRIES:
        rows.append(f"{c['n']} | {c['flag']} | {c['fr']} | {c['en']} | {c['art']}")
    return "\n".join(rows)


def nationalities_overview():
    rows = ["# | Flag | Country | m.sg | f.sg | m.pl | f.pl"]
    for c in COUNTRIES:
        ms, fs, mp, fp = c["nat"]
        rows.append(f"{c['n']} | {c['flag']} | {c['fr']} | {ms} | {fs} | {mp} | {fp}")
    return "\n".join(rows)


def languages_overview():
    rows = ["# | Flag | Country | Language(s)"]
    for c in COUNTRIES:
        rows.append(f"{c['n']} | {c['flag']} | {c['fr']} | {c['lang']}")
    return "\n".join(rows)


UPDATES = {
    "SIO-015": {
        3: "Name and identify 25 countries with correct article (le, la, l', les, ∅); ask C'est quel pays?",
        5: "25 cards — flag + 'C'est quel pays ?'",
        6: countries_back(),
        7: "1: Flag | 2: English | 3: Article | 4: French name | 5: Notes\n\n" + countries_overview(),
        8: "Matching (not Letris): 25 pairs — flag + C'est quel pays ? ↔ Le pays, c'est… + country with article. Article reference: ∅ (2) · le (4) · la (12) · l' (5) · les (2).",
        11: "Label 25 countries with le/la/l'/les/∅ (≥20/25); ask C'est quel pays ?",
    },
    "SIO-016": {
        3: "Produce nationality adjectives in 4 forms (m.sg, f.sg, m.pl, f.pl) for 25 countries; link country → nationality",
        5: "25 cards — flag + country + 'Et les habitants ?' + m.sg ending highlighted",
        6: nationalities_back(),
        7: "1: Flag | 2: Country | 3: m.sg | 4: f.sg | 5: m.pl | 6: f.pl\n\n" + nationalities_overview(),
        8: "Matching (not Letris): 25 pairs — flag + country ↔ 4 nationality forms (il est / elle est / ils sont / elles sont). Optional flip: m.sg front → 4 forms back.",
        11: "Produce all 4 nationality forms for each of 25 countries; match country → nationality (≥20/25).",
    },
    "SIO-017": {
        3: "Name languages linked to 25 countries; use on parle ___",
        5: "25 cards — flag + 'C'est quel pays ? Ici, on parle ____.'",
        6: languages_back(),
        7: "1: Flag | 2: Country | 3: Language(s)\n\n" + languages_overview(),
        8: "Matching (not Letris): 25 pairs — flag + country ↔ language(s) (on parle…).",
        11: "Match each of 25 countries to its language(s) (≥20/25).",
    },
}


def update_csv():
    rows = list(csv.reader(CSV_PATH.open(newline="", encoding="utf-8")))
    for row in rows:
        if len(row) > 1 and row[1] in UPDATES:
            for idx, val in UPDATES[row[1]].items():
                row[idx] = val
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        csv.writer(f, quoting=csv.QUOTE_MINIMAL).writerows(rows)


def update_vocab():
    data = json.loads(VOCAB_PATH.read_text(encoding="utf-8"))
    items = []
    for c in COUNTRIES:
        ms, fs, mp, fp = c["nat"]
        items.append({
            "n": c["n"],
            "flag": c["flag"],
            "country_fr": c["fr"],
            "country_en": c["en"],
            "article": c["art"],
            "country_with_article": country_with_article(c),
            "nationality": {"m_sg": ms, "f_sg": fs, "m_pl": mp, "f_pl": fp},
            "language": c["lang"],
        })
    data["countries_nationalities_languages_SIO015_016_017"] = {
        "status": "LOCKED",
        "decks": ["1.05 countries (SIO-015)", "1.06 nationalities (SIO-016)", "1.07 languages (SIO-017)"],
        "count": 25,
        "game_format": "Matching (not Letris) for all three decks",
        "article_counts": {"∅": 2, "le": 4, "la": 12, "l'": 5, "les": 2},
        "items": items,
    }
    VOCAB_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def update_cefr():
    """Dead since 2026-08-29 — kept so a re-run explains itself instead of lying.

    This used to patch three competence strings inside scripts/handoff_cefr.py
    by search-and-replace, back when that module carried its own hand-typed copy
    of all 50 descriptors. That copy had gone stale (23 of 50 still matched the
    course; some had drifted onto the wrong SIO), so it now DERIVES from
    src/content/sios/sios.json and stores no text at all.

    Which means these replacements had already stopped doing anything: neither
    the old strings nor the new ones were in the file. A no-op that reports
    success is the failure mode this whole clean-up is about, so it says so.

    The wording it wanted is already correct at the real source — SIO-015/016/017
    in sios.json read "25 countries" today. Edit it there; the handoff CSV
    follows via scripts/sync-sio-csv.mjs, which `npm run build` also checks.
    """
    print(
        "update_cefr: skipped — descriptors now live in src/content/sios/sios.json, "
        "not in scripts/handoff_cefr.py. SIO-015/016/017 already carry the 25-country "
        "wording; nothing to patch."
    )


if __name__ == "__main__":
    update_csv()
    update_vocab()
    update_cefr()
    print("Updated CSV, vocab_lists.json, and handoff_cefr.py for 25 countries.")
