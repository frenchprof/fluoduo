#!/usr/bin/env python3
"""verify78 — a deck's cloze never offers a word that is not French in its frame.

WHY THIS EXISTS
---------------
`deckSupply` (src/app/lessons/pager/buildCards.tsx) blanks an item's `gap` and
offers every distinct gap value in the deck as the choices. Nothing asked
whether a value is grammatical in THIS item's frame, so
/lessons/deck/envies-besoins was dealing:

    J'?  une chambre pour deux personnes.    veux · besoin d' · voudrais · aimerais
    Je ? partir en vacances.                 aimerais · besoin d' · voudrais · veux

« J'veux », « J'besoin d' », « Je aimerais ». Three of those four options can be
rejected by ear without thinking about what the card teaches, and the wrong
forms are printed on a learner's screen either way. Reported as the second
confirmed instance of the `un · la · une · le` fault already in STATUS.

WHAT IS ASSERTED, AND WHAT DELIBERATELY IS NOT

  1 · THE RULE IS EXECUTED, NOT READ. Every gapped item of every deck is run
      through `fitsFrame` against every other gap value in its own deck, and no
      surviving pair may break elision at either join. Reading buildCards.tsx
      proves nothing: a filter that is applied and a filter that is imported and
      forgotten look identical in source.

  2 · A DECK'S OWN SENTENCES ALWAYS PASS. The deck wrote them, so if the rule
      rejects one the rule is wrong. This is the assertion that keeps the
      heuristic honest: it can only ever be tightened as far as real French
      allows, because 26 decks' worth of real French is held against it.

  3 · THE FILTER IS WIRED INTO BOTH CONTROLS. The options list and the word bank
      are the same offer wearing different controls, and only one of them was
      obviously wrong.

  4 · MEANING IS NOT ASSERTED. `fitsFrame` checks the joins and nothing else.
      Whether « Je Madame » is a sensible distractor is a question about
      meaning, and the only general answer to that is per-deck knowledge — which
      is what a lesson's own generator carries (transport.gen.ts's GAP_CHOICES,
      wants-needs.gen.ts's openersFor). Where a lesson knows better it should
      decide; where nothing knows better, this refuses to print bad French.

Run from the repo root:  python3 verify/verify78-frame-fit.py
"""
import json
import os
import re
import subprocess
import sys

OK, FAIL = [], []


def check(cond, good, bad):
    (OK if cond else FAIL).append(good if cond else bad)


def read(p):
    return open(p, encoding="utf-8").read() if os.path.isfile(p) else ""


if not os.path.isfile("package.json"):
    print("run from the repo root")
    sys.exit(2)

PROBE = "verify/.verify78-probe.mjs"
BUILD = "src/app/lessons/pager/buildCards.tsx"
src = read(BUILD)

# ---- 3 · both controls are filtered ----------------------------------------
check('from "@/lib/frameFit"' in src,
      "buildCards imports the frame filter",
      "buildCards no longer imports frameFit — the deck supply is back to offering every gap value "
      "in the deck regardless of the frame it lands in")
supply = src[src.index("function deckSupply("):src.index("/** The native lesson's generated questions")]
check("fittingChoices(gapPool" in supply,
      "the deck supply filters the gap pool to what fits each frame",
      "the deck supply builds its choices straight from gapPool again — « J'veux » is back")
check(re.search(r"options: shuffle\(\[item\.gap, \.\.\.distractors\(fits,", supply) is not None,
      "the gapped MCQ offers only choices that fit the frame",
      "the gapped MCQ draws its distractors from something other than the filtered list")
check(re.search(r"bankPool: fits\b", supply) is not None,
      "the word bank is filtered too — a bank is a list of options with a different control",
      "the cloze's bankPool is not the filtered list; the tap-to-fill card would offer what the "
      "MCQ no longer does")
check(re.search(r"const choosable = fits\.length >= 2;", supply) is not None
      and "entry >= 3 || !choosable ? { typed: true }" in supply
      and "item.gap && choosable" in supply,
      "with no honest distractor the card asks for production, not recognition",
      "the no-distractor fallback is gone: faire-activites gaps only « de » and « d' » in "
      "complementary distribution, so its cards would offer a choice between one option")

# ---- execute the rule over every deck --------------------------------------
probe = """
// Written by verify78.
import fs from "node:fs";
const F = await import("../src/lib/frameFit.ts");
const dir = "src/content/collections";
const out = {};
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".json")) continue;
  const d = JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"));
  const items = (d.items ?? []).filter((i) => i.gap);
  if (!items.length) continue;
  const gaps = [...new Set(items.map((i) => i.gap))];
  const rows = [];
  for (const it of items) {
    // The frame, split the way buildCards splits it: the item's own sentence
    // with its own gap taken out.
    const sentence = it.example ?? it.fr ?? "";
    const at = sentence.indexOf(it.gap);
    if (at < 0) { rows.push({ id: it.id, gap: it.gap, sentence, unsplittable: true }); continue; }
    const before = sentence.slice(0, at);
    const after = sentence.slice(at + it.gap.length);
    rows.push({
      id: it.id, gap: it.gap, sentence, before, after,
      ownFits: F.fitsFrame(before, it.gap, after),
      offered: F.fittingChoices(gaps, it.gap, before, after),
      rejected: gaps.filter((g) => g !== it.gap && !F.fitsFrame(before, g, after)),
    });
  }
  out[d.id] = rows;
}
console.log("@@JSON@@" + JSON.stringify(out));
"""
os.makedirs("verify", exist_ok=True)
open(PROBE, "w", encoding="utf-8").write(probe)
try:
    r = subprocess.run(["node", "--experimental-strip-types", PROBE],
                       capture_output=True, text=True, timeout=300)
finally:
    if os.path.isfile(PROBE):
        os.remove(PROBE)

marker = [l for l in r.stdout.splitlines() if l.startswith("@@JSON@@")]
if not marker:
    print("  FAIL frameFit could not be executed:")
    print((r.stderr or r.stdout)[-2000:])
    sys.exit(1)
D = json.loads(marker[0][len("@@JSON@@"):])

check(len(D) >= 20, f"{len(D)} decks with gaps were run through the rule",
      f"only {len(D)} gapped decks found — the survey has shrunk, or the probe stopped resolving them")

# ---- 2 · a deck's own sentence always passes -------------------------------
selfrejects = [(deck, r["id"], r["sentence"]) for deck, rows in D.items() for r in rows
               if not r.get("unsplittable") and not r["ownFits"]]
check(not selfrejects,
      f"every deck's own {sum(len(v) for v in D.values())} gapped sentences pass the rule",
      f"the rule rejects {len(selfrejects)} sentence(s) the DECK ITSELF writes, so the rule is "
      f"wrong and would drop a card's own answer: {selfrejects[:3]}")

# ---- 1 · nothing offered breaks elision at either join ---------------------
# Re-derived here rather than asking frameFit whether it agrees with itself:
# the point is to catch the day the rule is loosened, so the assertion has to
# know what elision is on its own.
ELIDABLE = {"je", "me", "te", "se", "le", "la", "de", "ne", "que", "ce"}
VOWEL = re.compile(r"^[aàâeéèêëiîïoôuùûüyh]", re.I)
H_ASPIRE = re.compile(r"^h(aricot|éros|ibou|omard|onte|ors|uit)\b", re.I)


def vowelish(s):
    w = s.lstrip()
    return bool(w) and not H_ASPIRE.match(w) and bool(VOWEL.match(w))


def tail(before):
    t = before.rstrip()
    if re.search(r"['’]$", t):
        return "", True
    m = re.search(r"([^\W\d_]+)$", t, re.U)
    return (m.group(1).lower() if m else ""), False


def head(after):
    m = re.match(r"\s*([^\W\d_]+)", after, re.U)
    return m.group(1).lower() if m else ""


bad = []
for deck, rows in D.items():
    for r in rows:
        if r.get("unsplittable"):
            continue
        for o in r["offered"]:
            if o == r["gap"]:
                continue
            lw, elided = tail(r["before"])
            if elided and not vowelish(o):
                bad.append(f"{deck}: {r['before']}{o}")
            elif not elided and lw in ELIDABLE and vowelish(o):
                bad.append(f"{deck}: {r['before']}{o}")
            hw = head(r["after"])
            if hw:
                tw, telided = tail(o)
                if telided and not vowelish(hw):
                    bad.append(f"{deck}: {o}{r['after']}")
                elif not telided and tw in ELIDABLE and vowelish(hw):
                    bad.append(f"{deck}: {o} {r['after']}")
check(not bad,
      "no card offers a word that breaks elision at either join",
      f"{len(bad)} offered option(s) are not French in the frame they land in: {sorted(set(bad))[:4]}")

# The fault that started this, named so it cannot come back quietly.
eb = D.get("envies-besoins", [])
check(eb and not any(o for r in eb for o in r["offered"]
                     if r["before"].rstrip().endswith("'") and not vowelish(o)),
      "envies-besoins no longer offers « J'veux » or « J'besoin d' »",
      "envies-besoins is offering a consonant-initial word after « J' » again — the exact card "
      "this check was written for")
dropped = sum(len(r.get("rejected", [])) for rows in D.values() for r in rows)
check(dropped > 0,
      f"the rule actually removes something ({dropped} option(s) across all decks)",
      "the rule rejects NOTHING anywhere, which means it is not doing any work and this suite is "
      "decoration — a filter that never filters is worse than none")

# A card with no honest distractor is not a bug — it is a card whose answer is
# fully determined by its frame, and the guard above routes it to typing. What
# WOULD be a bug is the rule tightening until most cards go that way, because
# then the recognition tier has quietly disappeared. So this bounds it rather
# than forbidding it.
total = sum(len([r for r in rows if not r.get("unsplittable")]) for rows in D.values())
forced = [(deck, r["id"]) for deck, rows in D.items() for r in rows
          if not r.get("unsplittable") and len(r["offered"]) < 2]
check(total and len(forced) / total < 0.25,
      f"{len(forced)} of {total} cards have no honest distractor and are typed instead "
      f"({len(forced) * 100 // max(total, 1)}%)",
      f"{len(forced)} of {total} cards ({len(forced) * 100 // max(total, 1)}%) are left with no "
      f"distractor — the rule has been tightened past what French requires and the recognition "
      f"tier has all but disappeared")

# And the ones that do fall back should be the determined ones, not scattered
# noise: faire-activites gaps « de » and « d' » in complementary distribution,
# so every one of its cards is expected here.
byDeck = {}
for deck, _id in forced:
    byDeck[deck] = byDeck.get(deck, 0) + 1
check(all(n == len([r for r in D[deck] if not r.get("unsplittable")]) or n <= 2
          for deck, n in byDeck.items()),
      f"the typed fallback lands on whole determined decks, not scattered cards: "
      f"{sorted(byDeck.items())}",
      f"the fallback is hitting a few cards of a deck whose others still offer choices: "
      f"{sorted(byDeck.items())} — that is a rule inconsistency, not a determined gap")

print("\n".join(f"  ok   {m}" for m in OK))
if FAIL:
    print("\n".join(f"  FAIL {m}" for m in FAIL))
    print(f"\n{len(FAIL)} failed, {len(OK)} passed")
    sys.exit(1)
print(f"\nall {len(OK)} checks passed")
